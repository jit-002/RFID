import {
  Student,
  Staff,
  IoTDevice,
  AttendanceRecord,
  VerificationSession,
  SecurityEvent,
  AuditLog,
  AttendanceRuleConfig
} from '../types';
import { AttendanceEngine } from './attendanceEngine';
import { NotificationService } from './notificationService';
import { ExportService } from './exportService';

export class HardwareGateway {
  private students: Student[];
  private staff: Staff[];
  private devices: IoTDevice[];
  private attendanceEngine: AttendanceEngine;
  private notificationService: NotificationService;
  private exportService: ExportService;

  // Anti-replay and idempotency guard
  private recentScans: Map<string, number> = new Map(); // rfidUid -> timestamp (ms)
  private replayWindowMs = 30000; // 30-second replay rejection window

  constructor(
    students: Student[],
    staff: Staff[],
    devices: IoTDevice[],
    rules: AttendanceRuleConfig,
    notificationService: NotificationService,
    exportService: ExportService
  ) {
    this.students = students;
    this.staff = staff;
    this.devices = devices;
    this.attendanceEngine = new AttendanceEngine(rules);
    this.notificationService = notificationService;
    this.exportService = exportService;
  }

  /**
   * Hardware event simulation: RFID tap at turnstile or kiosk
   */
  public handleRFIDTap(
    rfidUid: string,
    deviceId: string
  ): {
    success: boolean;
    session?: VerificationSession;
    securityEvent?: SecurityEvent;
    errorReason?: string;
  } {
    const now = Date.now();
    const lastScan = this.recentScans.get(rfidUid);

    // 1. Check Idempotency & Replay Protection
    if (lastScan && now - lastScan < this.replayWindowMs) {
      const secEvent: SecurityEvent = {
        id: `sec-${Date.now()}`,
        type: 'DUPLICATE_TAP',
        severity: 'LOW',
        description: `Duplicate RFID tap detected within 30s replay window (${rfidUid}). Ignored by Idempotency Shield.`,
        rfidUid,
        deviceId,
        location: this.devices.find(d => d.id === deviceId)?.location || 'Main Gate',
        timestamp: new Date().toISOString(),
        resolved: true
      };

      return {
        success: false,
        securityEvent: secEvent,
        errorReason: 'DUPLICATE_SCAN_REJECTED'
      };
    }

    // 2. Locate Identity (Student or Staff)
    const matchedStudent = this.students.find(s => s.rfidUid === rfidUid);
    const matchedStaff = !matchedStudent ? this.staff.find(s => s.rfidUid === rfidUid) : undefined;

    if (!matchedStudent && !matchedStaff) {
      // Unrecognized RFID Card -> Security Incident
      const secEvent: SecurityEvent = {
        id: `sec-${Date.now()}`,
        type: 'UNKNOWN_RFID',
        severity: 'MEDIUM',
        description: `Unrecognized RFID badge (${rfidUid}) scanned at ${deviceId}. Access denied.`,
        rfidUid,
        deviceId,
        location: this.devices.find(d => d.id === deviceId)?.location || 'Turnstile',
        timestamp: new Date().toISOString(),
        resolved: false
      };

      return {
        success: false,
        securityEvent: secEvent,
        errorReason: 'UNRECOGNIZED_RFID'
      };
    }

    // Record tap in anti-replay memory
    this.recentScans.set(rfidUid, now);

    const person = matchedStudent || matchedStaff!;
    const isStudent = Boolean(matchedStudent);

    // 3. Initiate 2FA Biometric Verification Session
    const session: VerificationSession = {
      id: `sess-${Date.now()}`,
      rfidUid,
      personId: person.id,
      personType: isStudent ? 'STUDENT' : 'STAFF',
      personName: person.name,
      avatarUrl: person.avatarUrl,
      classOrDept: isStudent ? `Grade ${(person as Student).classGrade}-${(person as Student).section}` : (person as Staff).department,
      stage: 'IDENTIFIED',
      challengeMethod: isStudent ? 'FACE' : 'FINGERPRINT',
      timestamp: new Date().toISOString(),
      deviceId
    };

    return {
      success: true,
      session
    };
  }

  /**
   * Resolves 2FA Biometric Challenge (Face or Fingerprint)
   */
  public completeBiometricVerification(
    session: VerificationSession,
    simulateSuccess: boolean
  ): {
    verified: boolean;
    record?: AttendanceRecord;
    securityEvent?: SecurityEvent;
    auditLog: AuditLog;
  } {
    const timestamp = new Date();
    const isStudent = session.personType === 'STUDENT';
    const student = isStudent ? this.students.find(s => s.id === session.personId) : undefined;
    const device = this.devices.find(d => d.id === session.deviceId);
    const location = device?.location || 'North Entrance — Turnstile A';

    if (!simulateSuccess) {
      // 2FA Mismatch -> Access Denied & Security Flag
      const secEvent: SecurityEvent = {
        id: `sec-${Date.now()}`,
        type: 'BIOMETRIC_MISMATCH',
        severity: 'HIGH',
        description: `RFID identified (${session.personName}), but 2FA ${session.challengeMethod} verification failed (confidence 38%). No attendance marked.`,
        rfidUid: session.rfidUid,
        deviceId: session.deviceId,
        location,
        timestamp: timestamp.toISOString(),
        resolved: false
      };

      const audit: AuditLog = {
        id: `aud-${Date.now()}`,
        actor: 'Perimeter 2FA Gateway',
        role: 'SUPER_ADMIN',
        action: '2FA_VERIFICATION_REJECTED',
        target: `${session.personName} (${session.personId})`,
        timestamp: timestamp.toISOString(),
        metadata: { reason: 'BIOMETRIC_CONFIDENCE_BELOW_THRESHOLD', method: session.challengeMethod },
        ipAddress: device?.ipAddress || '192.168.1.101'
      };

      return {
        verified: false,
        securityEvent: secEvent,
        auditLog: audit
      };
    }

    // 2FA Success -> Mark Attendance
    const calculatedStatus = this.attendanceEngine.evaluateStatus(timestamp);

    const record: AttendanceRecord = {
      id: `att-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
      personId: session.personId!,
      personType: session.personType!,
      personName: session.personName!,
      personAvatar: session.avatarUrl!,
      classOrDept: session.classOrDept!,
      date: timestamp.toISOString().split('T')[0],
      timestamp: timestamp.toISOString(),
      timeDisplay: timestamp.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', second: '2-digit', hour12: true }),
      status: calculatedStatus,
      verificationMethod: session.challengeMethod === 'FACE' ? 'RFID_AND_FACE' : 'RFID_AND_FINGERPRINT',
      deviceId: session.deviceId,
      location,
      rfidUid: session.rfidUid,
      parentNotified: isStudent,
      googleSheetsSynced: true
    };

    // Trigger parent notice if student
    if (student) {
      this.notificationService.createParentAttendanceNotice(student, record);
    }

    // Trigger Google Sheets sync
    this.exportService.syncWithGoogleSheets([record]);

    const audit: AuditLog = {
      id: `aud-${Date.now()}`,
      actor: 'Perimeter 2FA Gateway',
      role: 'SUPER_ADMIN',
      action: 'ATTENDANCE_VERIFIED',
      target: `${session.personName} (${calculatedStatus})`,
      timestamp: timestamp.toISOString(),
      metadata: { method: record.verificationMethod, device: record.deviceId, location },
      ipAddress: device?.ipAddress || '192.168.1.101'
    };

    return {
      verified: true,
      record,
      auditLog: audit
    };
  }
}
