export type UserRole = 'SUPER_ADMIN' | 'ADMIN' | 'STAFF' | 'STUDENT' | 'EMPLOYEE' | 'PARENT';

export interface Employee {
  id: string;
  employeeId: string;
  name: string;
  avatarUrl: string;
  department: string;
  designation: string;
  shift: string;
  rfidUid: string;
  biometricId: string;
  phone: string;
  email: string;
  attendancePercentage: number;
  presentDays: number;
  totalDays: number;
  status: 'ACTIVE' | 'ON_DUTY' | 'ON_LEAVE';
  dutyLocation: string;
}

export interface Staff {
  id: string;
  employeeId: string;
  name: string;
  avatarUrl: string;
  department: string;
  designation: string;
  rfidUid: string;
  biometricId: string;
  phone: string;
  email: string;
  attendancePercentage: number;
  status: 'ACTIVE' | 'ON_LEAVE';
}

export type AttendanceStatus =
  | 'PRESENT'
  | 'ABSENT'
  | 'LATE'
  | 'HALF_DAY'
  | 'LEAVE'
  | 'EXCUSED'
  | 'HOLIDAY'
  | 'WEEKEND'
  | 'VERIFICATION_FAILED'
  | 'MANUALLY_CORRECTED';

export type AttendanceWorkflowState =
  | 'IDLE'
  | 'RFID_DETECTED'
  | 'IDENTIFYING'
  | 'BIOMETRIC_REQUIRED'
  | 'VERIFYING'
  | 'VERIFIED'
  | 'MARKED_PRESENT'
  | 'LATE'
  | 'FAILED'
  | 'ERROR';

export type VerificationMethod =
  | 'RFID_ONLY'
  | 'RFID_AND_FINGERPRINT'
  | 'RFID_AND_FACE'
  | 'MANUAL_OVERRIDE'
  | 'MANUAL_STAFF'
  | 'Manual'
  | 'MANUAL'
  | 'N8N_SYNC';


export type DeviceType =
  | 'RASPBERRY_PI_GATEWAY'
  | 'ESP8266_NODE'
  | 'RFID_READER'
  | 'FINGERPRINT_SCANNER'
  | 'FACE_CAMERA';

export type DeviceStatus = 'ONLINE' | 'OFFLINE' | 'SYNCING' | 'DEGRADED';

export interface Student {
  id: string;
  admissionNo: string;
  name: string;
  avatarUrl: string;
  classGrade: string; // e.g., '12'
  section: string;    // e.g., 'A'
  rollNo: string;
  rfidUid: string;
  biometricId: string;
  hasFaceTemplate: boolean;
  hasFingerprintTemplate: boolean;
  parentName: string;
  parentPhone: string;
  parentEmail: string;
  attendancePercentage: number;
  totalDays: number;
  presentDays: number;
  lateDays: number;
  absentDays: number;
  streakDays: number;
  status: 'ACTIVE' | 'SUSPENDED';
}


export interface IoTDevice {
  id: string;
  name: string;
  type: DeviceType;
  location: string;
  status: DeviceStatus;
  ipAddress: string;
  macAddress: string;
  firmwareVersion: string;
  lastHeartbeat: string;
  eventsProcessed: number;
  errorCount: number;
  gatewayId?: string;
  uptimeHours: number;
  signalStrength: number; // dBm or percentage
  latencyMs?: number;
}

export interface AttendanceRecord {
  id: string;
  attendanceId?: string;
  personId: string;
  personType: 'STUDENT' | 'STAFF';
  personName: string;
  personAvatar: string;
  classOrDept: string;
  date: string; // YYYY-MM-DD
  timestamp: string; // ISO
  timeDisplay: string; // e.g. 08:42:15 AM
  status: AttendanceStatus;
  verificationMethod: VerificationMethod;
  deviceId: string;
  location: string;
  rfidUid: string;
  isCorrected?: boolean;
  correctionReason?: string;
  correctedBy?: string;
  parentNotified: boolean;
  notificationId?: string;
  googleSheetsSynced: boolean;
  syncSource?: string;
}

export interface VerificationSession {
  id: string;
  rfidUid: string;
  personId?: string;
  personType?: 'STUDENT' | 'STAFF';
  personName?: string;
  avatarUrl?: string;
  classOrDept?: string;
  stage: 'SCANNING' | 'IDENTIFIED' | 'BIOMETRIC_CHALLENGE' | 'VERIFYING' | 'SUCCESS' | 'FAILED';
  challengeMethod: 'FACE' | 'FINGERPRINT';
  biometricConfidence?: number;
  timestamp: string;
  errorMessage?: string;
  deviceId: string;
}

export interface ParentNotification {
  id: string;
  studentId: string;
  studentName: string;
  parentName: string;
  recipientPhone: string;
  channel: 'WHATSAPP' | 'SMS' | 'EMAIL' | 'PUSH';
  message: string;
  status: 'SENT' | 'DELIVERED' | 'QUEUED' | 'FAILED';
  timestamp: string;
  attendanceId: string;
  retryCount: number;
}

export interface SecurityEvent {
  id: string;
  type: 'UNKNOWN_RFID' | 'BIOMETRIC_MISMATCH' | 'DUPLICATE_TAP' | 'DEVICE_TAMPER' | 'MANUAL_OVERRIDE';
  severity: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
  description: string;
  rfidUid?: string;
  deviceId: string;
  location: string;
  timestamp: string;
  resolved: boolean;
  resolvedBy?: string;
}

export interface AuditLog {
  id: string;
  actor: string;
  role: UserRole;
  action: string;
  target: string;
  timestamp: string;
  metadata: Record<string, any>;
  ipAddress: string;
}

export interface AIInsight {
  id: string;
  category: 'ATTENDANCE_PULSE' | 'EARLY_WARNING' | 'ARRIVAL_PEAK' | 'DEVICE_ANOMALY';
  title: string;
  summary: string;
  metrics?: {
    label: string;
    value: string | number;
    trend?: 'UP' | 'DOWN' | 'NEUTRAL';
  }[];
  severity: 'INFO' | 'WARNING' | 'ALERT';
  generatedAt: string;
}

export interface AttendanceRuleConfig {
  schoolName: string;
  startTime: string; // e.g. "08:30"
  lateThreshold: string; // e.g. "08:45"
  halfDayThreshold: string; // e.g. "12:00"
  cutoffTime: string; // e.g. "10:30" (mark remaining absent)
  minimumAttendancePercentage: number; // e.g. 75
  gracePeriodMinutes: number;
  autoNotifyParents: boolean;
  autoSyncGoogleSheets: boolean;
  biometricRequired: boolean;
}

export interface GoogleSheetsSyncStatus {
  sheetId: string;
  sheetName: string;
  connected: boolean;
  lastSyncedAt: string;
  pendingRecords: number;
  status: 'IDLE' | 'SYNCING' | 'SUCCESS' | 'ERROR';
  errorMessage?: string;
}
