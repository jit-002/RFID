/**
 * SmartX Local Storage & Backup Persistence Engine
 * Ensures data modified in Admin (rules, credentials, devices) or Staff (corrections)
 * persists permanently across page refreshes, with full JSON backup export & restore.
 */

export const STORAGE_KEYS = {
  STUDENTS: 'smartx_pvm_students_v1',
  STAFF: 'smartx_pvm_staff_v1',
  EMPLOYEES: 'smartx_pvm_employees_v1',
  ATTENDANCE: 'smartx_pvm_attendance_v1',
  RULES: 'smartx_pvm_rules_v1',
  CREDENTIALS: 'smartx_pvm_credentials_v1',
  AUDIT_LOGS: 'smartx_pvm_audit_logs_v1',
  SECURITY_EVENTS: 'smartx_pvm_security_events_v1',
  SHEETS: 'smartx_pvm_sheets_v1',
  AUTH: 'smartx_pvm_auth_v1',
  CHAT_MEMORY: 'smartx_pvm_sathi_chat_memory_v1'
};

export function loadStoredData<T>(key: string, fallback: T): T {
  if (typeof window === 'undefined') return fallback;
  try {
    const item = localStorage.getItem(key);
    if (!item) return fallback;
    return JSON.parse(item) as T;
  } catch (e) {
    console.warn(`Failed to read from localStorage key "${key}":`, e);
    return fallback;
  }
}

export function saveStoredData<T>(key: string, data: T): void {
  if (typeof window === 'undefined') return;
  try {
    localStorage.setItem(key, JSON.stringify(data));
  } catch (e) {
    console.warn(`Failed to save to localStorage key "${key}":`, e);
  }
}

export function exportFullBackupJSON(): void {
  try {
    const backup: Record<string, any> = {};
    Object.entries(STORAGE_KEYS).forEach(([name, key]) => {
      const val = localStorage.getItem(key);
      if (val) backup[name] = JSON.parse(val);
    });

    const blob = new Blob([JSON.stringify(backup, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `SmartX_PVM_Backup_${new Date().toISOString().split('T')[0]}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  } catch (e) {
    console.error('Backup export failed:', e);
  }
}

export function restoreFullBackupJSON(jsonStr: string): boolean {
  try {
    const parsed = JSON.parse(jsonStr);
    Object.entries(STORAGE_KEYS).forEach(([name, key]) => {
      if (parsed[name] !== undefined) {
        localStorage.setItem(key, JSON.stringify(parsed[name]));
      }
    });
    return true;
  } catch (e) {
    console.error('Failed to parse backup JSON:', e);
    return false;
  }
}

export function clearAllStoredData(): void {
  Object.values(STORAGE_KEYS).forEach(k => {
    localStorage.removeItem(k);
  });
}
