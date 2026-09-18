import { supabase, isSupabaseConfigured } from '../lib/supabase';
import { Student, Staff, Employee, AttendanceRecord, AttendanceRuleConfig } from '../types';
import { GeneratedCredential } from '../context/AppContext';

export class SupabaseDatabaseService {
  /**
   * Tests Supabase connectivity and reports live status
   */
  public static async testConnection(): Promise<{ connected: boolean; latencyMs: number; error?: string }> {
    if (!isSupabaseConfigured || !supabase) {
      return { connected: false, latencyMs: 0, error: 'Supabase credentials not configured in environment.' };
    }

    const t0 = performance.now();
    try {
      const { data, error } = await supabase.from('attendance').select('count', { count: 'exact', head: true });
      const latencyMs = Math.round(performance.now() - t0);
      if (error && error.code !== 'PGRST116') {
        return { connected: false, latencyMs, error: error.message };
      }
      return { connected: true, latencyMs };
    } catch (e: any) {
      return { connected: false, latencyMs: Math.round(performance.now() - t0), error: e?.message || 'Connection failed' };
    }
  }

  /**
   * Syncs an attendance record to Supabase
   */
  public static async syncAttendanceRecord(record: AttendanceRecord): Promise<boolean> {
    if (!supabase) return false;
    try {
      const { error } = await supabase.from('attendance').insert({
        person_id: record.personId,
        person_type: record.personType,
        person_name: record.personName,
        class_or_dept: record.classOrDept,
        date: record.date,
        timestamp: record.timestamp,
        status: record.status,
        verification_method: record.verificationMethod,
        device_id: record.deviceId,
        location: record.location,
        rfid_uid: record.rfidUid,
        is_corrected: record.isCorrected || false,
        correction_reason: record.correctionReason || null,
        corrected_by: record.correctedBy || null,
        parent_notified: record.parentNotified || false,
        google_sheets_synced: record.googleSheetsSynced || false
      });
      return !error;
    } catch (e) {
      console.warn('Supabase attendance insert note:', e);
      return false;
    }
  }

  /**
   * Syncs a newly generated credential to Supabase
   */
  public static async syncCredential(cred: GeneratedCredential): Promise<boolean> {
    if (!supabase) return false;
    try {
      const { error } = await supabase.from('credentials').upsert({
        id: cred.id,
        person_name: cred.personName,
        person_type: cred.personType,
        email: cred.email,
        phone: cred.phone,
        temp_password: cred.tempPassword,
        status: cred.status,
        otp_code: cred.otpCode || null
      });
      return !error;
    } catch (e) {
      console.warn('Supabase credential insert note:', e);
      return false;
    }
  }

  /**
   * Finds matching institutional identity by Google email
   */
  public static async matchUserByEmail(
    email: string,
    credentials: GeneratedCredential[],
    students: Student[],
    staff: Staff[],
    employees: Employee[]
  ): Promise<{
    matched: boolean;
    role?: 'STUDENT' | 'STAFF' | 'EMPLOYEE' | 'SUPER_ADMIN';
    name?: string;
    studentId?: string;
    staffId?: string;
    employeeId?: string;
    email?: string;
  }> {
    const cleanEmail = email.trim().toLowerCase();

    // 1. Check generated credentials created in database
    const credMatch = credentials.find(c => c.email.trim().toLowerCase() === cleanEmail);
    if (credMatch) {
      const role = credMatch.personType === 'STUDENT' ? 'STUDENT'
        : credMatch.personType === 'STAFF' ? 'STAFF'
        : credMatch.personType === 'EMPLOYEE' ? 'EMPLOYEE'
        : 'SUPER_ADMIN';
      return {
        matched: true,
        role,
        name: credMatch.personName,
        studentId: role === 'STUDENT' ? credMatch.id : undefined,
        staffId: role === 'STAFF' ? credMatch.id : undefined,
        employeeId: role === 'EMPLOYEE' || role === 'SUPER_ADMIN' ? credMatch.id : undefined,
        email: cleanEmail
      };
    }

    // 2. Check staff roster by exact email
    const staffMatch = staff.find(s => s.email.trim().toLowerCase() === cleanEmail);
    if (staffMatch) {
      return {
        matched: true,
        role: 'STAFF',
        staffId: staffMatch.id,
        name: staffMatch.name,
        email: cleanEmail
      };
    }

    // 3. Check student roster by parent email or school email
    const stuMatch = students.find(s => 
      s.parentEmail.trim().toLowerCase() === cleanEmail || 
      `${s.admissionNo.trim().toLowerCase()}@pvmlumding.edu` === cleanEmail
    );
    if (stuMatch) {
      return {
        matched: true,
        role: 'STUDENT',
        studentId: stuMatch.id,
        name: stuMatch.name,
        email: cleanEmail
      };
    }

    // 4. Check employee roster by exact email
    const empMatch = employees.find(e => e.email.trim().toLowerCase() === cleanEmail);
    if (empMatch) {
      const role = (empMatch as any).role === 'ADMIN' ? 'SUPER_ADMIN' : 'EMPLOYEE';
      return {
        matched: true,
        role,
        employeeId: empMatch.id,
        name: empMatch.name,
        email: cleanEmail
      };
    }

    // 5. Strict institutional administrator check (NO substring "includes" matching!)
    if (cleanEmail === 'admin@pvmlumding.edu' || cleanEmail === 'principal@pvmlumding.edu') {
      return {
        matched: true,
        role: 'SUPER_ADMIN',
        name: 'Institutional Administrator',
        email: cleanEmail
      };
    }

    // Not registered in institutional records
    return { matched: false };
  }
}
