import React, { useState, useRef } from 'react';
import { useApp } from '../context/AppContext';
import {
  ShieldCheck,
  LogOut,
  Cpu,
  RefreshCw,
  Download,
  Search,
  Sparkles,
  CheckCircle2,
  AlertTriangle,
  Radio,
  Clock,
  Layers,
  FileSpreadsheet,
  Settings,
  Users,
  Activity,
  KeyRound,
  Wrench,
  ArrowUpRight,
  Database,
  Save,
  Upload,
  Trash2,
  Plus,
  UserPlus,
  ExternalLink,
  Filter,
  Check,
  X,
  MessageSquare,
  Mail,
  UserCheck,
  FileText,
  Bot,
  Zap,
  ImageIcon
} from 'lucide-react';
import { SmartXAiApiClient } from '../services/api/aiApi';
import { studySathiService } from '../services/studySathiService';

interface AdminDashboardProps {
  onNavigate?: (tab: string) => void;
}


function formatKolkataTime(ts: any): string {
  if (!ts) return '—';
  try {
    const d = new Date(ts);
    if (isNaN(d.getTime())) return '—';
    return d.toLocaleTimeString('en-IN', {
      timeZone: 'Asia/Kolkata',
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
      hour12: true
    });
  } catch {
    return '—';
  }
}


const ADMIN_TAB_HASH_MAP: Record<string, string> = {
  OVERVIEW: 'overview',
  AI_ENGINES: 'ai-engines',
  STAFF_AUDIT: 'staff-logs',
  SYNC_LOGS: 'attendance-logs',
  USERS: 'users',
  DEVICES: 'iot',
  SHEETS: 'sheet-settings',
  CREDS: 'credentials',
  SETTINGS: 'thresholds',
  BACKUP: 'backup'
};

const HASH_TO_ADMIN_TAB: Record<string, 'OVERVIEW' | 'AI_ENGINES' | 'STAFF_AUDIT' | 'RFID_HUB' | 'SYNC_LOGS' | 'USERS' | 'DEVICES' | 'SHEETS' | 'CREDS' | 'SETTINGS' | 'BACKUP'> = {
  'overview': 'OVERVIEW',
  'ai-engines': 'AI_ENGINES',
  'staff-logs': 'STAFF_AUDIT',
  'attendance-logs': 'SYNC_LOGS',
  'users': 'USERS',
  'iot': 'DEVICES',
  'sheet-settings': 'SHEETS',
  'credentials': 'CREDS',
  'thresholds': 'SETTINGS',
  'backup': 'BACKUP'
};

export const AdminDashboard: React.FC<AdminDashboardProps> = ({ onNavigate }) => {
  const {
    logoutUser,
    students,
    staff,
    employees,
    devices,
    attendance,
    securityEvents,
    auditLogs,
    rulesConfig,
    updateRules,
    sheetsStatus,
    dateWiseSheets,
    syncGoogleSheets,
    backendSyncStatus,
    recentRfidScans,
    unknownRfidScans,
    sheetsHistoryLogs,
    syncGoogleSheetsBackend,
    setPollingIntervalSeconds,
    finalizeAbsentCutoff,
    assignRfidToStudent,
    registerNewStudent,
    editStudent,
    dismissUnknownRfid,
    exportToExcel,
    exportFullBackup,
    restoreFromBackup,
    resetAllDataToDefaults,
    setSimulatorOpen,
    generateCredentials,
    generatedCredentials,
    askAI,
    openAIDrawer,
    updateStudentRFID,
    updateStaffRFID,
    updateEmployeeRFID,
    deleteStudent,
    deleteStaff,
    deleteEmployee,
    deleteCredential,
    syncLogs,
    fetchSyncLogs,
    triggerRaspberryPiTap,
    addToast,
    liveSyncPopout,
    dismissLiveSyncPopout,
    studySathiApiKey,
    pvmSathiApiKey,
    claudeApiKey,
    openaiApiKey,
    customAiEndpoint,
    updateAiConfig,
    testAiConnection
  } = useApp();

  
  const handleAdminNavClick = (tabId: any) => {
    setActiveAdminTab(tabId);
    const hash = ADMIN_TAB_HASH_MAP[tabId] || 'overview';
    window.location.hash = `admin#${hash}`;
    setTimeout(() => {
      const target = document.getElementById(`admin-section-${hash}`) || document.getElementById('admin-main-content-panel');
      if (target) {
        target.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }
    }, 60);
  };

  React.useEffect(() => {
    const handleHashSync = () => {
      const h = window.location.hash;
      const match = h.match(/admin#([a-z0-9-]+)/i) || h.match(/#([a-z0-9-]+)/i);
      if (match && match[1] && HASH_TO_ADMIN_TAB[match[1]]) {
        const tab = HASH_TO_ADMIN_TAB[match[1]];
        setActiveAdminTab(tab);
        setTimeout(() => {
          const target = document.getElementById(`admin-section-${match[1]}`) || document.getElementById('admin-main-content-panel');
          if (target) {
            target.scrollIntoView({ behavior: 'smooth', block: 'start' });
          }
        }, 80);
      }
    };
    handleHashSync();
    window.addEventListener('hashchange', handleHashSync);
    return () => window.removeEventListener('hashchange', handleHashSync);
  }, []);

  const [activeAdminTab, setActiveAdminTab] = useState<'OVERVIEW' | 'AI_ENGINES' | 'STAFF_AUDIT' | 'RFID_HUB' | 'SYNC_LOGS' | 'USERS' | 'DEVICES' | 'SHEETS' | 'CREDS' | 'SETTINGS' | 'BACKUP'>('OVERVIEW');
  const [deleteTarget, setDeleteTarget] = useState<{ id: string; name: string; type: 'STUDENT' | 'STAFF' | 'EMPLOYEE' | 'CREDENTIAL' } | null>(null);
  const [editingStudent, setEditingStudent] = useState<any | null>(null);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [rfidAssignTarget, setRfidAssignTarget] = useState<{ id: string; name: string; currentRfid: string } | null>(null);
  const [rfidInputVal, setRfidInputVal] = useState('');
  const [userCategory, setUserCategory] = useState<'STUDENTS' | 'STAFF' | 'EMPLOYEES'>('STUDENTS');
  const [searchQuery, setSearchQuery] = useState('');
  const [isSyncing, setIsSyncing] = useState(false);
  const fileInputRef = React.useRef<HTMLInputElement>(null);

  // Timezone-aware Date (Asia/Kolkata)
  const kolkataToday = new Intl.DateTimeFormat('en-CA', {
    timeZone: 'Asia/Kolkata',
    year: 'numeric',
    month: '2-digit',
    day: '2-digit'
  }).format(new Date());

  const [selectedDate, setSelectedDate] = useState<string>(kolkataToday);
  const [statusFilter, setStatusFilter] = useState<'ALL' | 'PRESENT' | 'ABSENT' | 'PENDING'>('ALL');
  const [classFilter, setClassFilter] = useState<string>('ALL');
  const [sectionFilter, setSectionFilter] = useState<string>('ALL');

  // Dynamic available classes derived from student registry (including Class 10 & 12)
  const availableClasses = React.useMemo(() => {
    const set = new Set<string>();
    students.forEach(s => {
      if (s.classGrade) set.add(String(s.classGrade).trim());
    });
    set.add('10');
    set.add('12');
    return Array.from(set).sort((a, b) => Number(a) - Number(b));
  }, [students]);

  // Dynamic available sections dependent on selected class
  const availableSections = React.useMemo(() => {
    const set = new Set<string>();
    students.forEach(s => {
      if (classFilter === 'ALL' || String(s.classGrade).trim() === classFilter) {
        if (s.section) set.add(String(s.section).trim());
      }
    });
    if (set.size === 0) {
      if (classFilter === '10') set.add('A');
      else if (classFilter === '12') set.add('Science');
    }
    return Array.from(set).sort();
  }, [students, classFilter]);

  React.useEffect(() => {
    if (sectionFilter !== 'ALL' && !availableSections.includes(sectionFilter)) {
      setSectionFilter('ALL');
    }
  }, [classFilter, availableSections, sectionFilter]);


  // Staff Attendance Audit Filter States
  const [staffAuditSearch, setStaffAuditSearch] = useState('');
  const [staffAuditStaffFilter, setStaffAuditStaffFilter] = useState('ALL');
  const [staffAuditStatusFilter, setStaffAuditStatusFilter] = useState<'ALL' | 'PRESENT' | 'ABSENT'>('ALL');

  // Add Student Modal State
  const [isAddStudentModalOpen, setIsAddStudentModalOpen] = useState(false);
  const [newStudentForm, setNewStudentForm] = useState({
    studentId: '',
    studentName: '',
    classGrade: '12',
    section: 'Science',
    rollNumber: '',
    rfidUid: '',
    parentName: '',
    parentMobile: '',
    parentGmail: ''
  });

  // Quick Assign Unknown RFID Modal State
  const [assignModalData, setAssignModalData] = useState<{ rfid: string; targetStudentId: string } | null>(null);

  // Online Raspberry Pi 3B RFID Hub State
  const [piEndpoint, setPiEndpoint] = useState('http://192.168.1.105:5000');
  const [isPiConnected, setIsPiConnected] = useState(true);
  const [selectedRfidForTap, setSelectedRfidForTap] = useState(students[0]?.rfidUid || '04:A3:7B:92');
  const [pairingStudentId, setPairingStudentId] = useState<string | null>(null);
  const [pairingCardUid, setPairingCardUid] = useState('');
  const [lastTapResult, setLastTapResult] = useState<{ success: boolean; name?: string; message?: string } | null>(null);

  // New Credential Generator Modal State
  const [genName, setGenName] = useState('');
  const [genType, setGenType] = useState<'STUDENT' | 'STAFF' | 'ADMIN' | 'EMPLOYEE'>('STUDENT');
  const [genEmail, setGenEmail] = useState('');
  const [genPhone, setGenPhone] = useState('');
  const [genPass, setGenPass] = useState('1234');

  // AI Prompt
  const [aiQuestion, setAiQuestion] = useState('');
  const [aiLoading, setAiLoading] = useState(false);
  const [aiResult, setAiResult] = useState<string | null>(null);

  // AI Engines Hub States & Keys
  const [localStudySathiKey, setLocalStudySathiKey] = useState(studySathiApiKey);
  const [localPvmSathiKey, setLocalPvmSathiKey] = useState(pvmSathiApiKey);
  const [localClaudeKey, setLocalClaudeKey] = useState(claudeApiKey);
  const [localOpenaiKey, setLocalOpenaiKey] = useState(openaiApiKey);
  const [localCustomEndpoint, setLocalCustomEndpoint] = useState(customAiEndpoint);
  const [aiTestState, setAiTestState] = useState<Record<string, { loading: boolean; success?: boolean; latencyMs?: number; message?: string }>>({});
  const [aiHealthReport, setAiHealthReport] = useState<any>(null);
  const [isRefreshingHealth, setIsRefreshingHealth] = useState<boolean>(false);

  const refreshAiHealth = React.useCallback(async () => {
    setIsRefreshingHealth(true);
    try {
      const health = await SmartXAiApiClient.getAiHealth();
      setAiHealthReport(health);
    } catch {
      // Degraded fallback
    } finally {
      setIsRefreshingHealth(false);
    }
  }, []);

  React.useEffect(() => {
    refreshAiHealth();
  }, [refreshAiHealth]);

  React.useEffect(() => {
    setLocalStudySathiKey(studySathiApiKey);
  }, [studySathiApiKey]);

  React.useEffect(() => {
    setLocalPvmSathiKey(pvmSathiApiKey);
  }, [pvmSathiApiKey]);

  React.useEffect(() => {
    setLocalClaudeKey(claudeApiKey);
  }, [claudeApiKey]);

  React.useEffect(() => {
    setLocalOpenaiKey(openaiApiKey);
  }, [openaiApiKey]);

  React.useEffect(() => {
    setLocalCustomEndpoint(customAiEndpoint);
  }, [customAiEndpoint]);

  const handleTestAi = async (provider: 'STUDY_SATHI' | 'PVM_SATHI' | 'CLAUDE' | 'OPENAI') => {
    let key = localStudySathiKey;
    if (provider === 'PVM_SATHI') key = localPvmSathiKey;
    if (provider === 'CLAUDE') key = localClaudeKey;
    if (provider === 'OPENAI') key = localOpenaiKey;

    setAiTestState(prev => ({ ...prev, [provider]: { loading: true } }));
    try {
      const res = await testAiConnection(provider, key);
      setAiTestState(prev => ({ ...prev, [provider]: { loading: false, success: res.success, latencyMs: res.latencyMs, message: res.message } }));
      addToast(
        res.success ? `${provider.replace('_', ' ')} Online` : `${provider.replace('_', ' ')} Health Check Failed`,
        res.message,
        res.success ? 'SUCCESS' : 'ERROR'
      );
    } catch (e: any) {
      setAiTestState(prev => ({ ...prev, [provider]: { loading: false, success: false, message: e?.message || 'Connection test error' } }));
    }
  };

  const [imgGenTestState, setImgGenTestState] = useState<{ loading: boolean; success?: boolean; latencyMs?: number; message?: string }>({ loading: false });

  const handleTestImageGen = async () => {
    setImgGenTestState({ loading: true });
    try {
      const res = await studySathiService.testImageGeneration();
      setImgGenTestState({ loading: false, success: res.success, latencyMs: res.latencyMs, message: res.message });
      addToast(
        res.success ? 'Image Engine Online' : 'Image Engine Check Failed',
        res.message,
        res.success ? 'SUCCESS' : 'ERROR'
      );
    } catch (e: any) {
      setImgGenTestState({ loading: false, success: false, message: e?.message || 'Image test error' });
    }
  };

  const handleSaveAiConfig = () => {
    updateAiConfig({
      studySathiApiKey: localStudySathiKey.trim(),
      pvmSathiApiKey: localPvmSathiKey.trim(),
      claudeApiKey: localClaudeKey.trim(),
      openaiApiKey: localOpenaiKey.trim(),
      customAiEndpoint: localCustomEndpoint.trim()
    });
    addToast('Configuration Saved Securely', 'AI inference and provider parameters updated securely.', 'SUCCESS');
    refreshAiHealth();
  };

  // Rules form state
  const [startTime, setStartTime] = useState(rulesConfig.startTime);
  const [lateThreshold, setLateThreshold] = useState(rulesConfig.lateThreshold);
  const [cutoffTime, setCutoffTime] = useState(rulesConfig.cutoffTime);

  // Live Attendance Aggregation for Selected Date
  const dailyAttendanceList = students.map(s => {
    const studentId = s.admissionNo || s.id;
    const rec = attendance.find(a =>
      (a.personId.toUpperCase() === s.id.toUpperCase() ||
       a.personId.toUpperCase() === s.admissionNo.toUpperCase() ||
       (a.personName && a.personName.toLowerCase() === s.name.toLowerCase())) &&
      a.date === selectedDate
    );
    const isPresent = rec?.status === 'PRESENT' || rec?.status === 'LATE';
    const isAbsent = rec?.status === 'ABSENT';

    // Automatic evaluation: If date is in the past, or past 12:00 AM midnight / day end cutoff:
    // any student from the school database without an entry in the sheet is marked ABSENT
    const nowHour = new Date().getHours();
    const isDayEnded = selectedDate < kolkataToday || nowHour >= 23 || nowHour < 6;
    let status: 'PRESENT' | 'ABSENT' | 'PENDING' = isPresent ? 'PRESENT' : isAbsent ? 'ABSENT' : (isDayEnded ? 'ABSENT' : 'PENDING');
    let checkInTime = rec?.timeDisplay || '—';

    let whatsAppStatus: 'PENDING' | 'SENT' | 'FAILED' = ((rec as any)?.whatsAppStatus as 'PENDING' | 'SENT' | 'FAILED') || (rec?.parentNotified ? 'SENT' : 'PENDING');
    let gmailStatus: 'PENDING' | 'SENT' | 'FAILED' = ((rec as any)?.gmailStatus as 'PENDING' | 'SENT' | 'FAILED') || (rec?.parentNotified ? 'SENT' : 'PENDING');
    let syncStatus: 'SYNCED' | 'PENDING' | 'ERROR' = rec?.googleSheetsSynced ? 'SYNCED' : 'PENDING';

    return {
      studentId,
      name: s.name,
      avatarUrl: s.avatarUrl,
      classGrade: s.classGrade,
      section: s.section,
      rollNumber: s.rollNo,
      rfidUid: s.rfidUid,
      checkInTime,
      status,
      whatsAppStatus,
      gmailStatus,
      syncStatus,
      rawRecord: rec
    };
  });

  const filteredDailyList = dailyAttendanceList.filter(item => {
    const q = searchQuery.toLowerCase().trim();
    const matchesSearch = !q ||
      item.name.toLowerCase().includes(q) ||
      item.studentId.toLowerCase().includes(q) ||
      item.rfidUid.toLowerCase().includes(q);
    const matchesStatus = statusFilter === 'ALL' || item.status === statusFilter;
    const matchesClass = classFilter === 'ALL' || item.classGrade === classFilter;
    const matchesSection = sectionFilter === 'ALL' || item.section === sectionFilter;
    return matchesSearch && matchesStatus && matchesClass && matchesSection;
  });

  const dayTotal = students.length;
  const dayPresent = dailyAttendanceList.filter(d => d.status === 'PRESENT').length;
  const dayAbsent = dailyAttendanceList.filter(d => d.status === 'ABSENT').length;
  const dayPending = dailyAttendanceList.filter(d => d.status === 'PENDING').length;
  const dayTurnoutPct = dayTotal > 0 ? Math.round((dayPresent / dayTotal) * 1000) / 10 : 0;

  const waSent = dailyAttendanceList.filter(d => d.whatsAppStatus === 'SENT').length;
  const waPending = dailyAttendanceList.filter(d => d.whatsAppStatus === 'PENDING').length;
  const waFailed = dailyAttendanceList.filter(d => d.whatsAppStatus === 'FAILED').length;

  const gmSent = dailyAttendanceList.filter(d => d.gmailStatus === 'SENT').length;
  const gmPending = dailyAttendanceList.filter(d => d.gmailStatus === 'PENDING').length;
  const gmFailed = dailyAttendanceList.filter(d => d.gmailStatus === 'FAILED').length;

  // Selected date's active turnout rate
  const presentCount = dayPresent;
  const lateCount = dailyAttendanceList.filter(d => d.rawRecord?.status === 'LATE').length;
  const attendanceRate = dayTurnoutPct;

  // Auto-dismiss Live Sync Popout notification after 3 seconds with smooth exit animation
  const [isPopoutLeaving, setIsPopoutLeaving] = React.useState(false);
  const popoutTimerRef = React.useRef<NodeJS.Timeout | null>(null);

  React.useEffect(() => {
    if (!liveSyncPopout) {
      setIsPopoutLeaving(false);
      return;
    }
    setIsPopoutLeaving(false);
    if (popoutTimerRef.current) clearTimeout(popoutTimerRef.current);
    popoutTimerRef.current = setTimeout(() => {
      setIsPopoutLeaving(true);
      setTimeout(() => {
        dismissLiveSyncPopout();
        setIsPopoutLeaving(false);
      }, 280);
    }, 3000);
    return () => {
      if (popoutTimerRef.current) clearTimeout(popoutTimerRef.current);
    };
  }, [liveSyncPopout?.id]);

  const handleDismissPopoutNow = () => {
    if (popoutTimerRef.current) clearTimeout(popoutTimerRef.current);
    setIsPopoutLeaving(true);
    setTimeout(() => {
      dismissLiveSyncPopout();
      setIsPopoutLeaving(false);
    }, 280);
  };

  const handleManualSync = async () => {
    setIsSyncing(true);
    await syncGoogleSheetsBackend();
    setIsSyncing(false);
  };

  const handleAddStudentSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const res = await registerNewStudent(newStudentForm);
    if (res.success) {
      setIsAddStudentModalOpen(false);
      setNewStudentForm({
        studentId: '',
        studentName: '',
        classGrade: '12',
        section: 'Science',
        rollNumber: '',
        rfidUid: '',
        parentName: '',
        parentMobile: '',
        parentGmail: ''
      });
    }
  };

  const handleQuickAssignRfidSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!assignModalData || !assignModalData.targetStudentId) return;
    const res = await assignRfidToStudent(assignModalData.targetStudentId, assignModalData.rfid);
    if (res.success) {
      setAssignModalData(null);
    }
  };

  const handleGenerateCred = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!genName || !genEmail) return;
    await generateCredentials(genName, genType, genEmail, genPhone, genPass);
    setGenName('');
    setGenEmail('');
    setGenPhone('');
  };

  const handleAskSathi = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!aiQuestion.trim() || aiLoading) return;
    setAiLoading(true);
    try {
      const res = await askAI(aiQuestion);
      setAiResult(res.answer);
    } catch {
      setAiResult('Pvm Sathi was unable to process the query. Please try again.');
    } finally {
      setAiLoading(false);
    }
  };

  const handleSaveRules = (e: React.FormEvent) => {
    e.preventDefault();
    updateRules({
      startTime,
      lateThreshold,
      cutoffTime
    });
  };

  const handleFileRestore = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (event) => {
      const content = event.target?.result as string;
      if (content) {
        restoreFromBackup(content);
      }
    };
    reader.readAsText(file);
  };

  // Staff Manual Attendance & Correction Logs
  const staffAttendanceLogs = React.useMemo(() => {
    // 1. Audit logs for manual attendance entries/adjustments
    const logsFromAudit = auditLogs
      .filter(
        l => l.action === 'MANUAL_ATTENDANCE_ENTRY' || l.action === 'MANUAL_CORRECTION_REQUEST' || l.action === 'ATTENDANCE_CORRECTION'
      )
      .map(l => {
        const meta = l.metadata || {};
        const student = students.find(s => s.id === meta.studentId || s.admissionNo === meta.studentId);
        return {
          id: l.id,
          staffName: meta.staffName || l.actor || 'Faculty Member',
          staffId: meta.staffId || 'STF-FAC',
          staffEmail: meta.staffEmail || 'staff@pvm.edu.in',
          studentName: meta.studentName || student?.name || (l.target?.split(' (')[0]) || l.target || 'Student',
          studentId: meta.studentId || student?.admissionNo || (l.target?.includes('(') ? l.target.split('(')[1]?.replace(')', '') : '—'),
          rollNo: meta.rollNo || student?.rollNo || '—',
          classGrade: meta.classGrade ? `Class ${meta.classGrade}-${meta.section || ''}` : (student ? `Class ${student.classGrade}-${student.section}` : '—'),
          date: meta.date || l.timestamp.split('T')[0],
          time: meta.time || l.timestamp.split('T')[1]?.slice(0, 5) || '08:30 AM',
          status: (meta.status as 'PRESENT' | 'ABSENT' | 'LATE') || 'PRESENT',
          reason: meta.reason || (l as any).details || l.action || 'Faculty Manual Action',
          timestamp: l.timestamp,
          syncedSheets: meta.syncedSheets ?? true,
          syncedSupabase: meta.syncedSupabase ?? true,
          source: 'Faculty Portal'
        };
      });

    // 2. Attendance records that were verified/marked manually by staff
    const manualAttendance = attendance
      .filter(a => a.verificationMethod === 'MANUAL_STAFF' || a.isCorrected)
      .map(a => {
        const student = students.find(s => s.id === a.personId || s.admissionNo === a.personId);
        return {
          id: `att-staff-${a.id}`,
          staffName: (a as any).markedBy || 'Teacher Sarah (Faculty)',
          staffId: (a as any).markedById || 'PVM-EMP-010',
          staffEmail: 'teacher@pvm.edu.in',
          studentName: a.personName || student?.name || 'Student',
          studentId: a.personId || student?.admissionNo || '—',
          rollNo: student?.rollNo || '—',
          classGrade: student ? `Class ${student.classGrade}-${student.section}` : '—',
          date: a.date,
          time: a.timeDisplay || '08:30 AM',
          status: (a.status as 'PRESENT' | 'ABSENT' | 'LATE') || 'PRESENT',
          reason: a.correctionReason || (a as any).remarks || (a.isCorrected ? 'Backdated Register Attendance Entry' : 'Manual Faculty Verification'),
          timestamp: (a as any).created_at || `${a.date}T08:30:00Z`,
          syncedSheets: a.googleSheetsSynced ?? true,
          syncedSupabase: true,
          source: 'Faculty Portal'
        };
      });

    // Merge & deduplicate by studentId + date
    const merged = [...logsFromAudit];
    for (const m of manualAttendance) {
      if (!merged.some(l => l.studentId === m.studentId && l.date === m.date)) {
        merged.push(m);
      }
    }
    // Sort descending by timestamp / date
    return merged.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());
  }, [auditLogs, attendance, students]);

  const distinctStaffMembers = React.useMemo(() => {
    const set = new Set<string>();
    staffAttendanceLogs.forEach(l => {
      if (l.staffName) set.add(l.staffName);
    });
    return Array.from(set);
  }, [staffAttendanceLogs]);

  const filteredStaffAttendanceLogs = React.useMemo(() => {
    return staffAttendanceLogs.filter(item => {
      const q = staffAuditSearch.toLowerCase().trim();
      const matchesSearch = !q ||
        item.staffName.toLowerCase().includes(q) ||
        item.staffId.toLowerCase().includes(q) ||
        item.studentName.toLowerCase().includes(q) ||
        item.studentId.toLowerCase().includes(q) ||
        item.rollNo.toLowerCase().includes(q) ||
        item.date.includes(q) ||
        item.reason.toLowerCase().includes(q);

      const matchesStaff = staffAuditStaffFilter === 'ALL' || item.staffName === staffAuditStaffFilter;
      const matchesStatus = staffAuditStatusFilter === 'ALL' || item.status === staffAuditStatusFilter;

      return matchesSearch && matchesStaff && matchesStatus;
    });
  }, [staffAttendanceLogs, staffAuditSearch, staffAuditStaffFilter, staffAuditStatusFilter]);

  const exportStaffAuditToCSV = () => {
    if (filteredStaffAttendanceLogs.length === 0) {
      addToast('No Logs to Export', 'There are no staff attendance entries matching current filters.', 'INFO');
      return;
    }
    const headers = ['Log ID', 'Staff Member', 'Staff ID', 'Student Name', 'Admission ID', 'Class/Sec', 'Roll No', 'Attendance Date', 'Mark Time', 'Status Marked', 'Staff Reason', 'Logged At', 'Google Sheets Synced'];
    const rows = filteredStaffAttendanceLogs.map(l => [
      l.id,
      `"${l.staffName}"`,
      l.staffId,
      `"${l.studentName}"`,
      l.studentId,
      `"${l.classGrade}"`,
      l.rollNo,
      l.date,
      l.time,
      l.status,
      `"${(l.reason || '').replace(/"/g, '""')}"`,
      l.timestamp,
      l.syncedSheets ? 'YES' : 'NO'
    ]);
    const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows.map(r => r.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `PVM_Staff_Attendance_Audit_Logs_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    addToast('Logs Exported', `Exported ${filteredStaffAttendanceLogs.length} staff attendance records to CSV.`, 'SUCCESS');
  };

  // Hand-crafted cubic Bézier SVG area chart path
  const chartPath = "M 0 55 Q 50 15, 100 25 T 200 15 T 300 8 T 400 5 L 450 4 L 450 80 L 0 80 Z";
  const linePath = "M 0 55 Q 50 15, 100 25 T 200 15 T 300 8 T 400 5 L 450 4";

  return (
    <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-6 space-y-6">
      {/* Top Glass Bar */}
      <div className="rounded-2xl border border-white/[0.08] bg-[#0A0E17]/80 p-4 backdrop-blur-xl shadow-dashboard flex flex-col md:flex-row items-center justify-between gap-4">
        <div className="flex items-center gap-3 w-full md:w-auto">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-violet-500 to-indigo-600 p-0.5 shadow-[0_0_20px_rgba(139,92,246,0.35)]">
            <img src="/school-logo.jpg" alt="Logo" className="h-full w-full rounded-[10px] object-cover bg-white" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="font-display italic text-lg font-bold text-white tracking-tight">Pranabananda Vidyamandir</span>
              <span className="rounded-full border border-violet-500/30 bg-violet-500/15 px-2 py-0.5 text-[10px] font-semibold text-violet-300">
                Super Admin Command
              </span>
            </div>
            <p className="text-[11px] font-mono text-slate-400">Institutional Operating System & Hardware Gateway</p>
          </div>
        </div>

        {/* Search Bar */}
        <div className="relative w-full md:w-72">
          <Search className="absolute left-3 top-2.5 h-3.5 w-3.5 text-slate-500" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search devices, nodes, logs (⌘K)..."
            className="w-full rounded-xl border border-white/10 bg-black/50 pl-8 pr-3 py-1.5 text-xs text-white placeholder-slate-500 focus:border-violet-500 focus:outline-none"
          />
        </div>

        {/* User Identity Chip & Sign Out */}
        <div className="flex items-center gap-2.5 w-full md:w-auto justify-end">
          <div className="flex items-center gap-2.5 bg-white/[0.04] p-1.5 pr-3 rounded-2xl border border-white/10">
            <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-gradient-to-br from-violet-500 to-purple-600 text-black font-black text-xs shadow-glow-violet">
              ADM
            </div>
            <div className="text-left text-xs">
              <div className="font-semibold text-white leading-tight">Administrator</div>
              <div className="text-[10px] text-violet-400 font-mono">PVM Command Alpha</div>
            </div>
          </div>

          <button
            onClick={() => {
              logoutUser();
              if (onNavigate) onNavigate('landing');
              else window.location.hash = 'landing';
            }}
            className="flex items-center gap-1.5 px-3 py-2 rounded-xl border border-rose-500/40 bg-rose-500/15 hover:bg-rose-500/25 text-rose-300 hover:text-white text-xs font-bold transition-all shadow-glow-rose active:scale-95 cursor-pointer"
            title="Lock Console & Sign Out of Administrator Portal"
          >
            <LogOut className="h-3.5 w-3.5 text-rose-400" />
            <span>Sign Out</span>
          </button>
        </div>
      </div>

      {/* Main SaaS Layout: Sidebar + Main Content */}
      <div className="flex flex-col lg:flex-row gap-6">
        {/* Left Navigation Sidebar */}
        <div className="w-full lg:w-48 shrink-0 space-y-2">
          <div className="rounded-2xl border border-white/[0.08] bg-[#0A0E17]/60 p-3 backdrop-blur-xl shadow-dashboard space-y-1">
            {[
              { id: 'OVERVIEW', label: 'Command Overview', badge: 'Live' },
              { id: 'AI_ENGINES', label: 'AI Engines & Hub', badge: 'Active' },
              { id: 'STAFF_AUDIT', label: 'Staff Entry Logs', badge: `${staffAttendanceLogs.length}` },
              { id: 'SYNC_LOGS', label: 'Attendance & Sheet Logs', badge: `${syncLogs.length}` },
              { id: 'USERS', label: 'Manage & Delete Users', badge: `${students.length}` },
              { id: 'DEVICES', label: 'IoT Fleet Nodes', badge: `${devices.length}` },
              { id: 'SHEETS', label: 'Settings → Sheets', badge: 'Auto' },
              { id: 'CREDS', label: 'Credential Gen', badge: 'OTP' },
              { id: 'SETTINGS', label: 'Rule Thresholds', badge: null },
              { id: 'BACKUP', label: 'Data Backup & Sync', badge: 'Active' }
            ].map((item) => (
              <button
                key={item.id}
                onClick={() => handleAdminNavClick(item.id)}
                className={`w-full flex items-center justify-between px-3 py-2 rounded-xl text-xs font-medium transition-all ${
                  activeAdminTab === item.id
                    ? 'bg-violet-500 text-white font-bold shadow-sm'
                    : 'text-slate-400 hover:text-white hover:bg-white/[0.04]'
                }`}
              >
                <span>{item.label}</span>
                {item.badge && (
                  <span className={`px-1.5 py-0.5 text-[9px] rounded-md font-mono ${
                    activeAdminTab === item.id ? 'bg-black/30 text-white' : 'bg-white/[0.08] text-slate-300'
                  }`}>
                    {item.badge}
                  </span>
                )}
              </button>
            ))}
          </div>

          {/* Quick Hardware & Diagnostics Button */}
          <button
            onClick={() => onNavigate && onNavigate('diagnostics')}
            className="w-full p-3 rounded-2xl border border-cyan-500/25 bg-gradient-to-r from-cyan-500/10 to-blue-500/10 hover:bg-cyan-500/20 text-left transition-all group"
          >
            <div className="flex items-center justify-between text-xs font-bold text-cyan-300">
              <span className="flex items-center gap-1.5">
                <Cpu className="h-3.5 w-3.5 text-cyan-400" />
                Hardware Diagnostics
              </span>
              <ArrowUpRight className="h-3.5 w-3.5 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform" />
            </div>
            <p className="text-[10px] text-slate-400 mt-1">
              Inspect Raspberry Pi 3B & ESP8266 real-time telemetry.
            </p>
          </button>
        </div>

        {/* Main Content Area */}
        <div id="admin-main-content-panel" className="flex-1 space-y-6 scroll-mt-24">
          {/* Active section anchor for smooth scroll & hash state */}
          <div id={`admin-section-${ADMIN_TAB_HASH_MAP[activeAdminTab] || 'overview'}`} className="scroll-mt-24" />
          {/* Greeting & Action Pill Row */}
          <div className="rounded-2xl border border-white/[0.08] bg-gradient-to-r from-slate-900/80 to-[#0A0E17] p-6 backdrop-blur-xl shadow-dashboard">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
              <div>
                <h1 className="font-display italic text-3xl sm:text-4xl font-bold text-white tracking-tight">
                  Welcome, Administrator
                </h1>
                <p className="text-xs text-slate-400 mt-1">
                  Institutional Attendance OS • {devices.length} IoT Perimeter Gateways Streaming • Zero-Trust Physical 2FA
                </p>
              </div>

              {/* Action Buttons Row */}
              <div className="flex flex-wrap items-center gap-2">
                <button
                  onClick={handleManualSync}
                  disabled={isSyncing}
                  className="rounded-full bg-violet-600 hover:bg-violet-500 text-white px-4 py-1.5 text-xs font-bold transition-all shadow-glow-violet flex items-center gap-1.5"
                >
                  <RefreshCw className={`h-3.5 w-3.5 ${isSyncing ? 'animate-spin' : ''}`} />
                  <span>{isSyncing ? 'Syncing...' : 'Sync Google Sheets'}</span>
                </button>
                <button
                  onClick={() => setActiveAdminTab('BACKUP')}
                  className="rounded-full border border-emerald-500/30 bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-300 px-3.5 py-1.5 text-xs font-semibold transition-all flex items-center gap-1.5"
                >
                  <Database className="h-3.5 w-3.5" />
                  <span>Backup & Persistence</span>
                </button>
                <button
                  onClick={exportToExcel}
                  className="rounded-full border border-white/10 bg-white/[0.04] hover:bg-white/[0.08] text-white px-4 py-1.5 text-xs font-medium transition-all flex items-center gap-1.5"
                >
                  <Download className="h-3.5 w-3.5" />
                  <span>Excel Export</span>
                </button>
              </div>
            </div>
          </div>

          {/* Persistent Real-Time Google Sheets Sync Status Indicator Banner */}
          <div className="rounded-2xl border border-white/[0.08] bg-[#0A0E17]/90 p-4 backdrop-blur-xl shadow-dashboard flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
            <div className="flex flex-wrap items-center gap-3">
              <div className="flex items-center gap-2">
                <span className={`h-3 w-3 rounded-full ${backendSyncStatus.isOffline ? 'bg-rose-500 animate-ping' : 'bg-emerald-400 animate-pulse'}`} />
                <span className="font-bold text-sm text-white">
                  {backendSyncStatus.isOffline ? '● Google Sheets Offline' : '● Google Sheets Connected'}
                </span>
                {backendSyncStatus.isOffline ? (
                  <span className="text-[11px] text-rose-300 font-mono">Retrying automatically...</span>
                ) : (
                  <span className="px-2 py-0.5 rounded text-[10px] font-mono bg-emerald-500/15 text-emerald-300 border border-emerald-500/30">
                    READ-ONLY
                  </span>
                )}
              </div>
              <div className="h-4 w-px bg-white/10 hidden sm:block" />
              <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-xs font-mono text-slate-300">
                <span>Last checked: <strong className="text-white">{backendSyncStatus.lastChecked}</strong></span>
                <span>Next check: <strong className="text-cyan-400">{backendSyncStatus.nextCheckCountdown}s</strong></span>
                <span>Rows: <strong className="text-white">{backendSyncStatus.rowsChecked}</strong></span>
                <span>New: <strong className="text-emerald-400">+{backendSyncStatus.newRows}</strong></span>
                <span>Processed: <strong className="text-cyan-300">{backendSyncStatus.processedCount}</strong></span>
                <span>Duplicates: <strong className="text-slate-400">{backendSyncStatus.duplicatesCount}</strong></span>
                <span>Unknown RFID: <strong className={backendSyncStatus.unknownRfidCount > 0 ? "text-amber-400 font-bold" : "text-slate-400"}>{backendSyncStatus.unknownRfidCount}</strong></span>
              </div>
            </div>

            <div className="flex items-center gap-2 w-full md:w-auto justify-end">
              <button
                onClick={() => finalizeAbsentCutoff()}
                className="px-3 py-1.5 rounded-xl border border-rose-500/30 bg-rose-500/10 hover:bg-rose-500/20 text-rose-300 text-xs font-semibold flex items-center gap-1.5 transition-all"
                title="Mark non-scanned active students as ABSENT in Supabase (never modifies Google Sheet)"
              >
                <Clock className="h-3.5 w-3.5" />
                <span>09:00 AM Absent Cutoff</span>
              </button>
              <button
                onClick={handleManualSync}
                disabled={isSyncing}
                className="px-3.5 py-1.5 rounded-xl bg-cyan-500 hover:bg-cyan-400 text-black text-xs font-bold transition-all shadow-glow-cyan flex items-center gap-1.5"
              >
                <RefreshCw className={`h-3.5 w-3.5 ${isSyncing ? 'animate-spin' : ''}`} />
                <span>Sync Now</span>
              </button>
            </div>
          </div>

          {/* Unknown RFID UID Alert Banner */}
          {unknownRfidScans.length > 0 && (
            <div className="rounded-2xl border border-amber-500/40 bg-gradient-to-r from-amber-500/15 via-orange-500/10 to-red-500/10 p-4 backdrop-blur-xl shadow-lg flex flex-col md:flex-row items-start md:items-center justify-between gap-3 animate-in fade-in duration-200">
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-amber-500/20 border border-amber-500/30 text-amber-400 shrink-0">
                  <AlertTriangle className="h-5 w-5 animate-pulse" />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-white text-sm">Unknown RFID Scans Detected</span>
                    <span className="rounded-full bg-amber-500/20 text-amber-300 border border-amber-500/30 px-2 py-0.5 text-[10px] font-mono font-bold">
                      {unknownRfidScans.length} Unregistered {unknownRfidScans.length === 1 ? 'Card' : 'Cards'}
                    </span>
                  </div>
                  <p className="text-xs text-slate-300 mt-0.5">
                    RFID cards tapped at turnstiles that do not belong to any active student. You can directly assign them to a student below.
                  </p>
                </div>
              </div>
              <div className="flex flex-wrap items-center gap-2 w-full md:w-auto justify-start md:justify-end">
                {unknownRfidScans.slice(0, 3).map((u, idx) => (
                  <button
                    key={idx}
                    onClick={() => setAssignModalData({ rfid: u.rfid, targetStudentId: students[0]?.id || '' })}
                    className="px-3 py-1.5 rounded-xl border border-amber-500/40 bg-amber-500/20 hover:bg-amber-500/30 text-amber-200 text-xs font-mono font-semibold flex items-center gap-1.5 transition-all shadow-sm"
                    title={`Detected at ${u.timestamp}`}
                  >
                    <span>UID: {u.rfid}</span>
                    <span className="text-[10px] text-amber-400 underline font-bold">Assign</span>
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Master KPI & Status Dashboard Grid */}
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
            {/* 1. Date (Asia/Kolkata) */}
            <div className="rounded-2xl border border-white/[0.08] bg-[#0A0E17]/80 p-3.5 backdrop-blur-xl shadow-dashboard">
              <span className="text-[10px] font-mono uppercase text-slate-400 block mb-1">Today's Date (IST)</span>
              <span className="font-display italic text-lg font-bold text-white block">{kolkataToday}</span>
              <span className="text-[10px] text-slate-500 font-mono">Asia/Kolkata (UTC+5:30)</span>
            </div>

            {/* 2. Total Enrolled */}
            <div className="rounded-2xl border border-white/[0.08] bg-[#0A0E17]/80 p-3.5 backdrop-blur-xl shadow-dashboard">
              <span className="text-[10px] font-mono uppercase text-slate-400 block mb-1">Total Students</span>
              <span className="font-display italic text-2xl font-bold text-white block">{dayTotal}</span>
              <span className="text-[10px] text-violet-400 font-mono">Active Registry</span>
            </div>

            {/* 3. Present vs Absent */}
            <div className="rounded-2xl border border-white/[0.08] bg-[#0A0E17]/80 p-3.5 backdrop-blur-xl shadow-dashboard">
              <span className="text-[10px] font-mono uppercase text-slate-400 block mb-1">Present / Absent</span>
              <div className="flex items-baseline gap-1.5">
                <span className="font-display italic text-2xl font-bold text-emerald-400">{dayPresent}</span>
                <span className="text-slate-500">/</span>
                <span className="font-display italic text-xl font-bold text-rose-400">{dayAbsent}</span>
              </div>
              <span className="text-[10px] text-amber-400 font-mono">{dayPending} Pending</span>
            </div>

            {/* 4. Turnout Rate */}
            <div className="rounded-2xl border border-white/[0.08] bg-[#0A0E17]/80 p-3.5 backdrop-blur-xl shadow-dashboard">
              <span className="text-[10px] font-mono uppercase text-slate-400 block mb-1">Attendance Rate</span>
              <span className="font-display italic text-2xl font-bold text-cyan-300 block">{dayTurnoutPct}%</span>
              <span className="text-[10px] text-slate-500 font-mono">08:00-09:00 Window</span>
            </div>

            {/* 5. Google Sheets Sync */}
            <div className="rounded-2xl border border-white/[0.08] bg-[#0A0E17]/80 p-3.5 backdrop-blur-xl shadow-dashboard">
              <div className="flex items-center justify-between mb-1">
                <span className="text-[10px] font-mono uppercase text-slate-400">Sheets Sync</span>
                <span className={`px-1.5 py-0.5 rounded text-[9px] font-mono font-bold ${
                  backendSyncStatus.isSyncing
                    ? 'bg-cyan-500/20 text-cyan-300 animate-pulse'
                    : backendSyncStatus.lastSyncResult?.synced
                    ? 'bg-emerald-500/20 text-emerald-300'
                    : 'bg-emerald-500/15 text-emerald-300'
                }`}>
                  {backendSyncStatus.isSyncing ? 'SYNCING' : (backendSyncStatus.lastSyncResult?.synced ? 'SYNCED' : 'IDLE')}
                </span>
              </div>
              <span className="font-mono text-xs font-semibold text-white block truncate">
                {backendSyncStatus.lastSyncResult?.timestamp ? new Date(backendSyncStatus.lastSyncResult.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : sheetsStatus.lastSyncedAt}
              </span>
              <span className="text-[9px] text-slate-500 font-mono">5-min auto cycle</span>
            </div>

            {/* 6. Notifications Summary */}
            <div className="rounded-2xl border border-white/[0.08] bg-[#0A0E17]/80 p-3.5 backdrop-blur-xl shadow-dashboard">
              <span className="text-[10px] font-mono uppercase text-slate-400 block mb-1">n8n Notifications</span>
              <div className="flex flex-col gap-0.5 text-[11px] font-mono">
                <div className="flex items-center justify-between">
                  <span className="text-emerald-400 flex items-center gap-1"><MessageSquare className="h-2.5 w-2.5" />WA:</span>
                  <span className="text-white font-bold">{waSent} <span className="text-slate-500">/</span> <span className="text-amber-400">{waPending}</span></span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-cyan-400 flex items-center gap-1"><Mail className="h-2.5 w-2.5" />Gmail:</span>
                  <span className="text-white font-bold">{gmSent} <span className="text-slate-500">/</span> <span className="text-amber-400">{gmPending}</span></span>
                </div>
              </div>
            </div>
          </div>

          {/* Two Equal-Width Bento Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Card 1: Attendance Health Metric & SVG Area Chart */}
            <div className="rounded-2xl border border-white/[0.08] bg-[#0A0E17]/80 p-5 backdrop-blur-xl shadow-dashboard flex flex-col justify-between">
              <div>
                <div className="flex items-center justify-between text-xs mb-3">
                  <div className="flex items-center gap-2">
                    <CheckCircle2 className="h-4 w-4 text-violet-400" />
                    <span className="font-bold text-white uppercase tracking-wider text-[11px]">Institutional Turnout Rate</span>
                  </div>
                  <span className="font-mono text-violet-400 font-bold">{attendanceRate}%</span>
                </div>

                <div className="flex items-baseline gap-2 mt-1">
                  <span className="font-display italic text-4xl sm:text-5xl font-bold text-white">
                    {presentCount + lateCount}
                  </span>
                  <span className="text-xs text-slate-400">
                    / {students.length} Enrolled Students Checked-In
                  </span>
                </div>

                <div className="flex items-center gap-4 text-xs mt-3 pt-3 border-t border-white/[0.06]">
                  <div>
                    <span className="text-[10px] text-slate-500 block">Faculty On Campus</span>
                    <span className="text-emerald-400 font-semibold">{staff.length} Active</span>
                  </div>
                  <div>
                    <span className="text-[10px] text-slate-500 block">Operations Team</span>
                    <span className="text-amber-400 font-semibold">{employees.length} Staff</span>
                  </div>
                  <div>
                    <span className="text-[10px] text-slate-500 block">Perimeter Nodes</span>
                    <span className="font-mono text-cyan-400">{devices.length} Online</span>
                  </div>
                </div>
              </div>

              {/* Hand-crafted Cubic Bézier SVG Area Chart */}
              <div className="mt-4 pt-2">
                <div className="text-[10px] font-mono text-slate-500 mb-1">Morning Turnstile Velocity (Bézier Curve)</div>
                <svg viewBox="0 0 450 80" className="w-full h-20 overflow-visible">
                  <defs>
                    <linearGradient id="adminGradient" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor="#8b5cf6" stopOpacity="0.45" />
                      <stop offset="100%" stopColor="#8b5cf6" stopOpacity="0.0" />
                    </linearGradient>
                  </defs>
                  <path d={chartPath} fill="url(#adminGradient)" />
                  <path d={linePath} fill="none" stroke="#8b5cf6" strokeWidth="2.5" strokeLinecap="round" />
                </svg>
              </div>
            </div>

            {/* Card 2: IoT Fleet Gate Telemetry & Sathi AI */}
            <div className="rounded-2xl border border-white/[0.08] bg-[#0A0E17]/80 p-5 backdrop-blur-xl shadow-dashboard flex flex-col justify-between">
              <div>
                <div className="flex items-center justify-between text-xs mb-3">
                  <div className="flex items-center gap-2">
                    <Radio className="h-4 w-4 text-cyan-400 animate-pulse" />
                    <span className="font-bold text-white uppercase tracking-wider text-[11px]">Active IoT Gateways</span>
                  </div>
                  <span className="font-mono text-cyan-400 font-bold">{devices.filter(d => d.status === 'ONLINE').length} Active</span>
                </div>

                <div className="space-y-2 mt-2">
                  {devices.slice(0, 2).map((dev) => (
                    <div key={dev.id} className="flex items-center justify-between p-2.5 rounded-xl bg-white/[0.02] border border-white/[0.06] text-xs">
                      <div>
                        <div className="font-semibold text-white">{dev.name}</div>
                        <div className="text-[10px] text-slate-400 font-mono">{dev.type} • {dev.location}</div>
                      </div>
                      <div className="text-right font-mono text-[11px]">
                        <span className="text-emerald-400">{dev.latencyMs}ms</span>
                        <div className="text-[9px] text-slate-500">{dev.ipAddress}</div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Pvm Sathi Mini Prompt (Opens Global AI Drawer) */}
              <form
                onSubmit={(e) => {
                  e.preventDefault();
                  if (aiQuestion.trim()) {
                    openAIDrawer(aiQuestion);
                    setAiQuestion('');
                  } else {
                    openAIDrawer();
                  }
                }}
                className="mt-4 pt-3 border-t border-white/[0.06] flex items-center gap-2"
              >
                <Sparkles className="h-3.5 w-3.5 text-violet-400 shrink-0" />
                <input
                  type="text"
                  value={aiQuestion}
                  onChange={(e) => setAiQuestion(e.target.value)}
                  placeholder="Ask Pvm Sathi about campus throughput, IoT nodes..."
                  className="w-full bg-transparent text-xs text-white placeholder-slate-500 focus:outline-none"
                />
                <button
                  type="submit"
                  className="px-2.5 py-1 rounded-lg bg-violet-500/20 hover:bg-violet-500/30 text-violet-300 text-[10px] font-semibold transition-colors"
                >
                  Query
                </button>
              </form>
            </div>
          </div>

          {activeAdminTab === 'AI_ENGINES' ? (
            /* SmartX Multi-Model AI Hub & Neural Keys Management */
            <div className="rounded-2xl border border-white/[0.08] bg-[#0A0E17]/80 p-5 backdrop-blur-xl shadow-dashboard space-y-6">
              {/* Header */}
              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border-b border-white/[0.08] pb-4">
                <div>
                  <div className="flex items-center gap-2">
                    <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-gradient-to-br from-cyan-500 to-violet-600 text-white shadow-glow-cyan">
                      <Bot className="h-4 w-4" />
                    </div>
                    <h3 className="text-base font-bold text-white tracking-tight">SmartX Institutional AI Hub & Engine Manager</h3>
                    <span className="px-2.5 py-0.5 rounded-full text-[10px] font-mono bg-cyan-500/15 text-cyan-300 border border-cyan-500/30 font-bold">
                      2 Active Models
                    </span>
                  </div>
                  <p className="text-xs text-slate-400 mt-1">
                    Manage real-time neural engines, test connection latencies, configure custom endpoints, and switch between academic & attendance AI runtimes.
                  </p>
                </div>

                <div className="flex items-center gap-2 w-full sm:w-auto justify-end">
                  <button
                    onClick={() => onNavigate?.('study-sathi')}
                    className="px-3.5 py-1.5 rounded-xl bg-gradient-to-r from-cyan-500 to-blue-600 text-black text-xs font-bold shadow-glow-cyan flex items-center gap-1.5 transition-all hover:brightness-110"
                  >
                    <Sparkles className="h-3.5 w-3.5" />
                    <span>Launch Study Sathi 2.0 →</span>
                  </button>
                  <button
                    onClick={refreshAiHealth}
                    disabled={isRefreshingHealth}
                    className="px-3.5 py-1.5 rounded-xl bg-white/10 hover:bg-white/20 text-white text-xs font-bold border border-white/20 flex items-center gap-1.5 transition-all"
                  >
                    <RefreshCw className={`h-3.5 w-3.5 ${isRefreshingHealth ? 'animate-spin' : ''}`} />
                    <span>{isRefreshingHealth ? 'Checking...' : 'Refresh Health'}</span>
                  </button>
                  <button
                    onClick={handleSaveAiConfig}
                    className="px-3.5 py-1.5 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-black text-xs font-bold shadow-glow-emerald flex items-center gap-1.5 transition-all"
                  >
                    <Save className="h-3.5 w-3.5" />
                    <span>Save All Keys</span>
                  </button>
                </div>
              </div>

              {/* Engine Grid: PVM Sathi 1.0 vs PVM Sathi 2.0 vs Sathi Creative */}
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
                {/* 1. PVM Sathi 2.0 (Study Sathi) Academic Intelligence */}
                <div className="rounded-xl border border-cyan-500/30 bg-gradient-to-b from-cyan-950/20 to-black/60 p-4 space-y-4">
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex items-center gap-2.5">
                      <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-cyan-500/20 text-cyan-400 border border-cyan-500/40 shadow-glow-cyan">
                        <Bot className="h-5 w-5" />
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <h4 className="text-sm font-bold text-white">PVM Sathi 2.0 (Study Sathi)</h4>
                          <span className="px-2 py-0.5 rounded text-[9px] font-mono font-bold bg-cyan-500/20 text-cyan-300 border border-cyan-500/40">
                            Academic Tutor
                          </span>
                        </div>
                        <p className="text-[11px] text-slate-400">
                          CBSE curriculum, homework solver, multimodal vision & voice
                        </p>
                      </div>
                    </div>
                    <span className="px-2 py-0.5 rounded-full text-[10px] font-mono font-semibold bg-emerald-500/15 text-emerald-300 border border-emerald-500/30">
                      LIVE INFERENCE
                    </span>
                  </div>

                  <div className="space-y-3">
                    <div className="flex items-center justify-between text-[11px] font-mono text-slate-300">
                      <span>Gemini Failover Provider Pool:</span>
                      <span className="text-[10px] text-cyan-400">Multiple Providers • Automatic Fallback</span>
                    </div>

                    {/* Masked Failover Keys Pool (Section 16, 20 & 31) */}
                    <div className="space-y-1.5 bg-black/50 p-2.5 rounded-xl border border-white/10 text-xs font-mono">
                      <div className="flex items-center justify-between text-slate-300 py-0.5 border-b border-white/[0.04]">
                        <div className="flex items-center gap-2">
                          <span className="px-1.5 py-0.2 rounded bg-cyan-500/20 text-cyan-300 text-[9px] font-bold">P1</span>
                          <span className="text-[11px] text-white">Gemini Primary</span>
                        </div>
                        <span className="text-[11px] text-slate-400">••••••••••••KKXA</span>
                      </div>
                      <div className="flex items-center justify-between text-slate-300 py-0.5 border-b border-white/[0.04]">
                        <div className="flex items-center gap-2">
                          <span className="px-1.5 py-0.2 rounded bg-slate-800 text-slate-400 text-[9px] font-bold">P2</span>
                          <span className="text-[11px] text-slate-300">Gemini Failover 2</span>
                        </div>
                        <span className="text-[11px] text-slate-400">••••••••••••I1g</span>
                      </div>
                      <div className="flex items-center justify-between text-slate-300 py-0.5 border-b border-white/[0.04]">
                        <div className="flex items-center gap-2">
                          <span className="px-1.5 py-0.2 rounded bg-slate-800 text-slate-400 text-[9px] font-bold">P3</span>
                          <span className="text-[11px] text-slate-300">Gemini Failover 3</span>
                        </div>
                        <span className="text-[11px] text-slate-400">••••••••••••YUHg</span>
                      </div>
                      <div className="flex items-center justify-between text-slate-300 py-0.5">
                        <div className="flex items-center gap-2">
                          <span className="px-1.5 py-0.2 rounded bg-slate-800 text-slate-400 text-[9px] font-bold">P4</span>
                          <span className="text-[11px] text-slate-300">Gemini Failover 4</span>
                        </div>
                        <span className="text-[11px] text-slate-400">••••••••••••W6g</span>
                      </div>
                    </div>

                    <div className="flex items-center justify-between gap-2">
                      <input
                        type="password"
                        value={localStudySathiKey}
                        onChange={(e) => setLocalStudySathiKey(e.target.value)}
                        placeholder="Custom Override Key (Optional)..."
                        className="w-full rounded-xl border border-white/10 bg-black/60 px-3 py-2 text-xs text-white font-mono placeholder-slate-500 focus:border-cyan-500 focus:outline-none"
                      />
                      <button
                        onClick={() => handleTestAi('STUDY_SATHI')}
                        disabled={aiTestState['STUDY_SATHI']?.loading}
                        className="px-3 py-2 rounded-xl bg-cyan-500/20 hover:bg-cyan-500/30 text-cyan-300 border border-cyan-500/40 text-[10px] font-mono font-semibold transition-colors flex items-center gap-1 shrink-0"
                      >
                        <Zap className={`h-3 w-3 ${aiTestState['STUDY_SATHI']?.loading ? 'animate-spin' : ''}`} />
                        {aiTestState['STUDY_SATHI']?.loading ? 'Pinging...' : 'Ping Test'}
                      </button>
                    </div>

                    {/* Status & Latency Badge */}
                    {aiTestState['STUDY_SATHI'] && (
                      <div className={`p-2.5 rounded-xl text-xs font-mono flex items-center justify-between ${
                        aiTestState['STUDY_SATHI'].success
                          ? 'bg-emerald-500/10 border border-emerald-500/30 text-emerald-300'
                          : 'bg-rose-500/10 border border-rose-500/30 text-rose-300'
                      }`}>
                        <div className="flex items-center gap-2">
                          <span className={`h-2 w-2 rounded-full ${aiTestState['STUDY_SATHI'].success ? 'bg-emerald-400 animate-pulse' : 'bg-rose-400'}`} />
                          <span>{aiTestState['STUDY_SATHI'].message}</span>
                        </div>
                        {aiTestState['STUDY_SATHI'].latencyMs && (
                          <span className="font-bold">{aiTestState['STUDY_SATHI'].latencyMs} ms</span>
                        )}
                      </div>
                    )}
                  </div>

                  <div className="pt-2 border-t border-white/[0.06] space-y-1.5 text-[11px] text-slate-400">
                    <div className="flex items-center justify-between text-slate-300">
                      <span>Default Model:</span>
                      <span className="font-mono text-cyan-300 font-semibold">gemini-3.5-flash-lite (Sathi 3.5 Flash Lite)</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span>Failover Resilience:</span>
                      <span className="font-mono text-emerald-400 font-semibold">Active (4 Failover Keys)</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span>Vision / File Inspection:</span>
                      <span className="font-mono text-cyan-300">PNG, JPG, PDF, Question Papers</span>
                    </div>
                  </div>
                </div>

                {/* 2. PVM Sathi 1.0 Attendance & Operations AI */}
                <div className="rounded-xl border border-violet-500/30 bg-gradient-to-b from-violet-950/20 to-black/60 p-4 space-y-4">
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex items-center gap-2.5">
                      <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-violet-500/20 text-violet-400 border border-violet-500/40 shadow-glow-violet">
                        <Sparkles className="h-5 w-5" />
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <h4 className="text-sm font-bold text-white">PVM Sathi 1.0 (Operations AI)</h4>
                          <span className="px-2 py-0.5 rounded text-[9px] font-mono font-bold bg-violet-500/20 text-violet-300 border border-violet-500/40">
                            Attendance & IoT
                          </span>
                        </div>
                        <p className="text-[11px] text-slate-400">
                          Turnstile scans, CBSE 75% calculation, staff duty schedules
                        </p>
                      </div>
                    </div>
                    <span className="px-2 py-0.5 rounded-full text-[10px] font-mono font-semibold bg-violet-500/15 text-violet-300 border border-violet-500/30">
                      ZERO-TRUST
                    </span>
                  </div>

                  <div className="space-y-2">
                    <label className="text-[11px] font-mono text-slate-300 flex items-center justify-between">
                      <span>Gemini API Key (PVM Sathi 1.0):</span>
                      <span className="text-[10px] text-violet-400">Isolated Key Support</span>
                    </label>
                    <div className="relative">
                      <input
                        type="password"
                        value={localPvmSathiKey}
                        onChange={(e) => setLocalPvmSathiKey(e.target.value)}
                        placeholder="Enter Pvm Sathi API Key..."
                        className="w-full rounded-xl border border-white/10 bg-black/60 px-3 py-2 text-xs text-white font-mono placeholder-slate-500 focus:border-violet-500 focus:outline-none pr-24"
                      />
                      <button
                        onClick={() => handleTestAi('PVM_SATHI')}
                        disabled={aiTestState['PVM_SATHI']?.loading}
                        className="absolute right-1.5 top-1.5 px-2.5 py-1 rounded-lg bg-violet-500/20 hover:bg-violet-500/30 text-violet-300 border border-violet-500/40 text-[10px] font-mono font-semibold transition-colors flex items-center gap-1"
                      >
                        <Zap className={`h-3 w-3 ${aiTestState['PVM_SATHI']?.loading ? 'animate-spin' : ''}`} />
                        {aiTestState['PVM_SATHI']?.loading ? 'Pinging...' : 'Ping Test'}
                      </button>
                    </div>

                    {/* Status & Latency Badge */}
                    {aiTestState['PVM_SATHI'] && (
                      <div className={`p-2.5 rounded-xl text-xs font-mono flex items-center justify-between ${
                        aiTestState['PVM_SATHI'].success
                          ? 'bg-emerald-500/10 border border-emerald-500/30 text-emerald-300'
                          : 'bg-rose-500/10 border border-rose-500/30 text-rose-300'
                      }`}>
                        <div className="flex items-center gap-2">
                          <span className={`h-2 w-2 rounded-full ${aiTestState['PVM_SATHI'].success ? 'bg-emerald-400 animate-pulse' : 'bg-rose-400'}`} />
                          <span>{aiTestState['PVM_SATHI'].message}</span>
                        </div>
                        {aiTestState['PVM_SATHI'].latencyMs && (
                          <span className="font-bold">{aiTestState['PVM_SATHI'].latencyMs} ms</span>
                        )}
                      </div>
                    )}
                  </div>

                  <div className="pt-2 border-t border-white/[0.06] space-y-1.5 text-[11px] text-slate-400">
                    <div className="flex items-center justify-between text-slate-300">
                      <span>Target Database:</span>
                      <span className="font-mono text-violet-300 font-semibold">Supabase & Google Sheets</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span>Auto-Scroll & Zero-Leakage:</span>
                      <span className="font-mono text-emerald-400 font-semibold">Strict Role Isolation</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span>Drawer Access:</span>
                      <span className="font-mono text-slate-300">Top Header & Bottom Bar</span>
                    </div>
                  </div>
                </div>

                {/* 3. Sathi Creative & Puter.js (Image Generation Engine) */}
                <div className="rounded-xl border border-cyan-500/30 bg-gradient-to-b from-cyan-950/20 to-black/60 p-4 space-y-4">
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex items-center gap-2.5">
                      <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-cyan-500/20 text-cyan-400 border border-cyan-500/40 shadow-glow-cyan">
                        <ImageIcon className="h-5 w-5" />
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <h4 className="text-sm font-bold text-white">Sathi Creative (Puter.js Image AI)</h4>
                          <span className="px-2 py-0.5 rounded text-[9px] font-mono font-bold bg-cyan-500/20 text-cyan-300 border border-cyan-500/40">
                            Puter.js AI
                          </span>
                        </div>
                        <p className="text-[11px] text-slate-400">
                          Official Puter.js txt2img with Sathi Canvas (Matrices, Alcohols & Integration)
                        </p>
                      </div>
                    </div>
                    <span className="px-2 py-0.5 rounded-full text-[10px] font-mono font-semibold bg-emerald-500/15 text-emerald-300 border border-emerald-500/30">
                      ACTIVE
                    </span>
                  </div>

                  <div className="space-y-2">
                    <label className="text-[11px] font-mono text-slate-300 flex items-center justify-between">
                      <span>Image Model & Pipeline:</span>
                      <span className="text-[10px] text-cyan-400">Puter txt2img & Canvas 2D</span>
                    </label>
                    <div className="flex items-center justify-between p-2 rounded-xl bg-black/60 border border-white/10 text-xs">
                      <div className="flex items-center gap-1.5 font-mono text-[11px] text-slate-300">
                        <span className="text-cyan-400 font-semibold">Puter.js AI</span>
                        <span className="text-slate-500">• Canvas 2D / FLUX Fallback</span>
                      </div>
                      <button
                        onClick={handleTestImageGen}
                        disabled={imgGenTestState.loading}
                        className="px-2.5 py-1 rounded-lg bg-cyan-500/20 hover:bg-cyan-500/30 text-cyan-300 border border-cyan-500/40 text-[10px] font-mono font-semibold transition-colors flex items-center gap-1"
                      >
                        <Zap className={`h-3 w-3 ${imgGenTestState.loading ? 'animate-spin' : ''}`} />
                        {imgGenTestState.loading ? 'Testing...' : 'Test Image Engine'}
                      </button>
                    </div>

                    {imgGenTestState.message && (
                      <div className={`p-2.5 rounded-xl text-xs font-mono flex items-center justify-between ${
                        imgGenTestState.success
                          ? 'bg-emerald-500/10 border border-emerald-500/30 text-emerald-300'
                          : 'bg-rose-500/10 border border-rose-500/30 text-rose-300'
                      }`}>
                        <div className="flex items-center gap-2">
                          <span className={`h-2 w-2 rounded-full ${imgGenTestState.success ? 'bg-emerald-400 animate-pulse' : 'bg-rose-400'}`} />
                          <span>{imgGenTestState.message}</span>
                        </div>
                        {imgGenTestState.latencyMs && (
                          <span className="font-bold">{imgGenTestState.latencyMs} ms</span>
                        )}
                      </div>
                    )}
                  </div>

                  <div className="pt-2 border-t border-white/[0.06] space-y-1.5 text-[11px] text-slate-400">
                    <div className="flex items-center justify-between text-slate-300">
                      <span>Primary Image Provider:</span>
                      <span className="font-mono text-cyan-300 font-semibold">Puter.js SDK (txt2img)</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span>Mathematics & Chemistry:</span>
                      <span className="font-mono text-emerald-400 font-semibold">Verified Sathi Canvas Engine</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span>Handwritten Student Style:</span>
                      <span className="font-mono text-cyan-300">Ruled Notebook Paper • Ink Font</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span>Interactive Actions:</span>
                      <span className="font-mono text-slate-300">Copy, Open, Save, Regenerate</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Extended Providers: Anthropic Claude, OpenAI, Custom API Endpoint */}
              <div className="rounded-xl border border-white/[0.08] bg-black/40 p-4 space-y-4">
                <div className="flex items-center justify-between border-b border-white/[0.06] pb-3">
                  <div>
                    <h4 className="text-sm font-bold text-white">Extended AI Providers & Custom Endpoints</h4>
                    <p className="text-[11px] text-slate-400">
                      Configure secondary model fallback keys for Claude, OpenAI GPT, or private Ollama/vLLM endpoints.
                    </p>
                  </div>
                  <span className="px-2 py-0.5 rounded text-[10px] font-mono bg-white/[0.06] text-slate-300">
                    Optional Fallbacks
                  </span>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  {/* Claude Key */}
                  <div className="space-y-1.5">
                    <label className="text-[11px] font-mono text-slate-300 block">Anthropic Claude API Key:</label>
                    <div className="relative">
                      <input
                        type="password"
                        value={localClaudeKey}
                        onChange={(e) => setLocalClaudeKey(e.target.value)}
                        placeholder="sk-ant-api03-..."
                        className="w-full rounded-xl border border-white/10 bg-black/60 px-3 py-2 text-xs text-white font-mono placeholder-slate-600 focus:border-amber-500 focus:outline-none pr-16"
                      />
                      <button
                        onClick={() => handleTestAi('CLAUDE')}
                        disabled={aiTestState['CLAUDE']?.loading}
                        className="absolute right-1.5 top-1.5 px-2 py-1 rounded-lg bg-amber-500/20 hover:bg-amber-500/30 text-amber-300 text-[10px] font-mono transition-colors"
                      >
                        {aiTestState['CLAUDE']?.loading ? '...' : 'Ping'}
                      </button>
                    </div>
                    {aiTestState['CLAUDE'] && (
                      <span className="text-[10px] font-mono text-amber-300 block truncate">
                        {aiTestState['CLAUDE'].message}
                      </span>
                    )}
                  </div>

                  {/* OpenAI Key */}
                  <div className="space-y-1.5">
                    <label className="text-[11px] font-mono text-slate-300 block">OpenAI GPT API Key:</label>
                    <div className="relative">
                      <input
                        type="password"
                        value={localOpenaiKey}
                        onChange={(e) => setLocalOpenaiKey(e.target.value)}
                        placeholder="sk-proj-..."
                        className="w-full rounded-xl border border-white/10 bg-black/60 px-3 py-2 text-xs text-white font-mono placeholder-slate-600 focus:border-emerald-500 focus:outline-none pr-16"
                      />
                      <button
                        onClick={() => handleTestAi('OPENAI')}
                        disabled={aiTestState['OPENAI']?.loading}
                        className="absolute right-1.5 top-1.5 px-2 py-1 rounded-lg bg-emerald-500/20 hover:bg-emerald-500/30 text-emerald-300 text-[10px] font-mono transition-colors"
                      >
                        {aiTestState['OPENAI']?.loading ? '...' : 'Ping'}
                      </button>
                    </div>
                    {aiTestState['OPENAI'] && (
                      <span className="text-[10px] font-mono text-emerald-300 block truncate">
                        {aiTestState['OPENAI'].message}
                      </span>
                    )}
                  </div>

                  {/* Custom Endpoint */}
                  <div className="space-y-1.5">
                    <label className="text-[11px] font-mono text-slate-300 block">Custom Gateway URL (Ollama / vLLM):</label>
                    <input
                      type="text"
                      value={localCustomEndpoint}
                      onChange={(e) => setLocalCustomEndpoint(e.target.value)}
                      placeholder="http://localhost:11434/v1"
                      className="w-full rounded-xl border border-white/10 bg-black/60 px-3 py-2 text-xs text-white font-mono placeholder-slate-600 focus:border-cyan-500 focus:outline-none"
                    />
                    <span className="text-[10px] text-slate-500 block">OpenAI-compatible inference base endpoint</span>
                  </div>
                </div>
              </div>

              {/* Bottom Save Bar */}
              <div className="flex flex-col sm:flex-row items-center justify-between gap-3 pt-3 border-t border-white/[0.08]">
                <span className="text-xs text-slate-400">
                  Changes apply immediately to all active user sessions across PVM Sathi & Study Sathi.
                </span>
                <div className="flex items-center gap-2">
                  <button
                    onClick={handleSaveAiConfig}
                    className="px-5 py-2 rounded-xl bg-gradient-to-r from-cyan-500 via-blue-600 to-violet-600 text-white font-bold text-xs shadow-glow-cyan hover:brightness-110 transition-all flex items-center gap-2"
                  >
                    <Save className="h-4 w-4" />
                    <span>Save & Deploy AI Changes</span>
                  </button>
                </div>
              </div>
            </div>
          ) : activeAdminTab === 'STAFF_AUDIT' ? (
            /* Staff Attendance Logs & Manual Modifications Ledger */
            <div className="rounded-2xl border border-white/[0.08] bg-[#0A0E17]/80 p-5 backdrop-blur-xl shadow-dashboard space-y-6">
              {/* Header with Title and Export Button */}
              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border-b border-white/[0.08] pb-4">
                <div>
                  <div className="flex items-center gap-2">
                    <UserCheck className="h-5 w-5 text-cyan-400" />
                    <h3 className="text-base font-bold text-white tracking-tight">Staff Attendance Logs & Manual Modifications Ledger</h3>
                    <span className="px-2 py-0.5 rounded-full text-[10px] font-mono bg-cyan-500/15 text-cyan-300 border border-cyan-500/30 font-bold">
                      {filteredStaffAttendanceLogs.length} Entries Logged
                    </span>
                  </div>
                  <p className="text-xs text-slate-400 mt-1">
                    Complete administrative audit trail displaying which staff/faculty member added or adjusted attendance, target student, date, status, reason, and sync state.
                  </p>
                </div>
                <div className="flex items-center gap-2 w-full sm:w-auto justify-end">
                  <button
                    onClick={exportStaffAuditToCSV}
                    className="px-3.5 py-1.5 rounded-xl border border-cyan-500/30 bg-cyan-500/10 hover:bg-cyan-500/20 text-cyan-300 text-xs font-semibold flex items-center gap-1.5 transition-all shadow-sm"
                  >
                    <Download className="h-3.5 w-3.5" />
                    <span>Export Staff Logs (CSV)</span>
                  </button>
                </div>
              </div>

              {/* 3 Metric Cards */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div className="p-3.5 rounded-xl bg-white/[0.02] border border-white/[0.06]">
                  <span className="text-[10px] font-mono uppercase text-slate-400 block mb-0.5">Total Staff Adjustments</span>
                  <div className="flex items-baseline gap-2">
                    <span className="font-display italic text-2xl font-bold text-white">{staffAttendanceLogs.length}</span>
                    <span className="text-[10px] text-slate-500 font-mono">Recorded in Audit Ledger</span>
                  </div>
                </div>
                <div className="p-3.5 rounded-xl bg-emerald-500/[0.04] border border-emerald-500/20">
                  <span className="text-[10px] font-mono uppercase text-emerald-400 block mb-0.5">Marked PRESENT by Staff</span>
                  <div className="flex items-baseline gap-2">
                    <span className="font-display italic text-2xl font-bold text-emerald-400">
                      {staffAttendanceLogs.filter(l => l.status === 'PRESENT').length}
                    </span>
                    <span className="text-[10px] text-emerald-300/60 font-mono">Verified Attending</span>
                  </div>
                </div>
                <div className="p-3.5 rounded-xl bg-rose-500/[0.04] border border-rose-500/20">
                  <span className="text-[10px] font-mono uppercase text-rose-400 block mb-0.5">Marked ABSENT by Staff</span>
                  <div className="flex items-baseline gap-2">
                    <span className="font-display italic text-2xl font-bold text-rose-400">
                      {staffAttendanceLogs.filter(l => l.status === 'ABSENT').length}
                    </span>
                    <span className="text-[10px] text-rose-300/60 font-mono">Excused / Unexcused</span>
                  </div>
                </div>
              </div>

              {/* Search & Filtering Bar */}
              <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 bg-black/40 p-3 rounded-xl border border-white/5">
                <div className="relative flex-1">
                  <Search className="absolute left-3 top-2.5 h-3.5 w-3.5 text-slate-500" />
                  <input
                    type="text"
                    value={staffAuditSearch}
                    onChange={(e) => setStaffAuditSearch(e.target.value)}
                    placeholder="Search by staff name, student name, admission ID, date, or remark..."
                    className="w-full rounded-lg border border-white/10 bg-black/60 pl-8 pr-3 py-1.5 text-xs text-white placeholder-slate-500 focus:border-cyan-500 focus:outline-none"
                  />
                </div>

                <div className="flex items-center gap-2">
                  <select
                    value={staffAuditStaffFilter}
                    onChange={(e) => setStaffAuditStaffFilter(e.target.value)}
                    className="rounded-lg border border-white/10 bg-black/60 px-3 py-1.5 text-xs text-white focus:border-cyan-500 focus:outline-none"
                  >
                    <option value="ALL">All Faculty Members ({distinctStaffMembers.length})</option>
                    {distinctStaffMembers.map(name => (
                      <option key={name} value={name}>{name}</option>
                    ))}
                  </select>

                  <select
                    value={staffAuditStatusFilter}
                    onChange={(e) => setStaffAuditStatusFilter(e.target.value as any)}
                    className="rounded-lg border border-white/10 bg-black/60 px-3 py-1.5 text-xs text-white focus:border-cyan-500 focus:outline-none"
                  >
                    <option value="ALL">All Statuses</option>
                    <option value="PRESENT">Present Only</option>
                    <option value="ABSENT">Absent Only</option>
                  </select>

                  {(staffAuditSearch || staffAuditStaffFilter !== 'ALL' || staffAuditStatusFilter !== 'ALL') && (
                    <button
                      onClick={() => {
                        setStaffAuditSearch('');
                        setStaffAuditStaffFilter('ALL');
                        setStaffAuditStatusFilter('ALL');
                      }}
                      className="px-2.5 py-1.5 rounded-lg border border-white/10 text-slate-400 hover:text-white text-xs transition-colors"
                      title="Clear all filters"
                    >
                      Reset
                    </button>
                  )}
                </div>
              </div>

              {/* Staff Attendance Audit Table */}
              <div className="overflow-x-auto rounded-xl border border-white/[0.06]">
                <table className="w-full text-left text-xs">
                  <thead>
                    <tr className="border-b border-white/[0.08] bg-black/40 text-[11px] font-mono text-slate-400">
                      <th className="py-3 px-3">Staff Member (Actor)</th>
                      <th className="py-3 px-3">Target Student</th>
                      <th className="py-3 px-3">Class & Roll</th>
                      <th className="py-3 px-3">Attendance Date</th>
                      <th className="py-3 px-3">Status Marked</th>
                      <th className="py-3 px-3">Reason / Remarks</th>
                      <th className="py-3 px-3">Google Sheets & Realtime Sync</th>
                      <th className="py-3 px-3 text-right">Logged At</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-white/[0.04]">
                    {filteredStaffAttendanceLogs.length === 0 ? (
                      <tr>
                        <td colSpan={8} className="py-12 text-center text-slate-500 font-mono text-xs">
                          <UserCheck className="h-6 w-6 mx-auto mb-2 text-slate-600" />
                          No staff attendance modification records match the selected filters.
                        </td>
                      </tr>
                    ) : (
                      filteredStaffAttendanceLogs.map((log) => (
                        <tr key={log.id} className="hover:bg-white/[0.02] transition-colors">
                          {/* 1. Staff Member */}
                          <td className="py-3 px-3">
                            <div className="flex items-center gap-2">
                              <div className="h-7 w-7 rounded-lg bg-cyan-500/10 border border-cyan-500/20 text-cyan-300 font-bold text-xs flex items-center justify-center shrink-0">
                                {log.staffName.slice(0, 2).toUpperCase()}
                              </div>
                              <div>
                                <span className="font-semibold text-white block">{log.staffName}</span>
                                <span className="text-[10px] text-cyan-400 font-mono">{log.staffId}</span>
                              </div>
                            </div>
                          </td>

                          {/* 2. Target Student */}
                          <td className="py-3 px-3">
                            <div>
                              <span className="font-semibold text-white block">{log.studentName}</span>
                              <span className="text-[10px] text-slate-400 font-mono">{log.studentId}</span>
                            </div>
                          </td>

                          {/* 3. Class & Roll */}
                          <td className="py-3 px-3 font-mono">
                            <span className="text-slate-300 block">{log.classGrade}</span>
                            <span className="text-[10px] text-slate-500">Roll #{log.rollNo}</span>
                          </td>

                          {/* 4. Attendance Date */}
                          <td className="py-3 px-3 font-mono">
                            <div className="flex items-center gap-1.5">
                              <span className="text-white font-semibold">{log.date}</span>
                              {log.date !== kolkataToday && (
                                <span className="px-1.5 py-0.2 rounded text-[9px] bg-amber-500/15 text-amber-300 border border-amber-500/30">
                                  Backdated
                                </span>
                              )}
                            </div>
                            <span className="text-[10px] text-slate-400 block">{log.time}</span>
                          </td>

                          {/* 5. Status Marked */}
                          <td className="py-3 px-3">
                            <span className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-mono font-bold ${
                              log.status === 'PRESENT'
                                ? 'bg-emerald-500/15 text-emerald-300 border border-emerald-500/30'
                                : 'bg-rose-500/15 text-rose-300 border border-rose-500/30'
                            }`}>
                              {log.status === 'PRESENT' ? (
                                <Check className="h-3 w-3" />
                              ) : (
                                <X className="h-3 w-3" />
                              )}
                              <span>{log.status}</span>
                            </span>
                          </td>

                          {/* 6. Reason / Remarks */}
                          <td className="py-3 px-3 max-w-xs">
                            <p className="text-slate-300 text-xs line-clamp-2" title={log.reason}>
                              {log.reason || 'Staff manual attendance mark'}
                            </p>
                          </td>

                          {/* 7. Google Sheets & Realtime Sync */}
                          <td className="py-3 px-3 font-mono text-[11px]">
                            <div className="flex flex-col gap-1">
                              <span className="inline-flex items-center gap-1 text-emerald-400">
                                <span className="h-1.5 w-1.5 rounded-full bg-emerald-400 animate-pulse" />
                                <span>Sheet Tab [{log.date}] Synced</span>
                              </span>
                              <span className="text-[10px] text-slate-500">
                                Supabase Realtime Active
                              </span>
                            </div>
                          </td>

                          {/* 8. Logged At */}
                          <td className="py-3 px-3 text-right font-mono text-[11px] text-slate-400">
                            <div>{log.timestamp.split('T')[0]}</div>
                            <div className="text-[10px] text-slate-500">
                              {log.timestamp.includes('T') ? log.timestamp.split('T')[1]?.slice(0, 8) : ''}
                            </div>
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          ) : activeAdminTab === 'SYNC_LOGS' ? (
            /* n8n Attendance Synchronization Realtime Log Stream */
            <div className="rounded-2xl border border-white/[0.08] bg-[#0A0E17]/80 p-5 backdrop-blur-xl shadow-dashboard space-y-4">
              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 border-b border-white/[0.08] pb-3">
                <div>
                  <div className="flex items-center gap-2">
                    <Radio className="h-4 w-4 text-emerald-400 animate-pulse" />
                    <h3 className="text-sm font-bold text-white tracking-tight">Google Sheets & Attendance Synchronization Stream</h3>
                    <span className="px-2 py-0.5 rounded-full text-[10px] font-mono bg-emerald-500/15 text-emerald-300 border border-emerald-500/30">
                      10s Automated Polling Active
                    </span>
                  </div>
                  <p className="text-xs text-slate-400 mt-0.5">
                    Live telemetry of attendance records synchronized dynamically from Google Sheets date tabs (2026-09-11, 2026-09-10, etc.).
                  </p>
                </div>
                <div className="flex items-center gap-2">
                  <button
                    onClick={fetchSyncLogs}
                    className="px-3 py-1.5 rounded-xl border border-white/10 hover:bg-white/[0.06] text-slate-300 text-xs font-semibold flex items-center gap-1.5 transition-colors"
                  >
                    <RefreshCw className="h-3 w-3" /> Refresh Logs
                  </button>
                  <button
                    onClick={async () => {
                      try {
                        const res = await fetch('/api/attendance/sync', {
                          method: 'POST',
                          headers: {
                            'Content-Type': 'application/json',
                            'Authorization': 'Bearer smartattend_sync_secret_2026_n8n_secure'
                          },
                          body: JSON.stringify({
                            attendance_id: `ATT-${new Date().toISOString().split('T')[0].replace(/-/g, '')}-JIT001`,
                            student_id: 'JIT001',
                            student_name: 'Jit Das',
                            class: '12',
                            section: 'Science',
                            status: 'PRESENT',
                            date: new Date().toISOString().split('T')[0],
                            time: new Date().toLocaleTimeString('en-GB'),
                            source: 'n8n_sheets_simulator',
                            verification_method: 'Manual'
                          })
                        });
                        const data = await res.json();
                        addToast(
                          data.duplicate ? 'Idempotent Duplicate' : 'Test Sync Dispatched',
                          data.message || 'Sync response received from API.',
                          data.duplicate ? 'INFO' : 'SUCCESS'
                        );
                        fetchSyncLogs();
                      } catch (e: any) {
                        addToast('Test Sync Failed', e?.message || 'Failed', 'ERROR');
                      }
                    }}
                    className="px-3 py-1.5 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-600 text-black text-xs font-bold shadow-glow-emerald flex items-center gap-1.5"
                  >
                    <Activity className="h-3 w-3" /> Test n8n Sync
                  </button>
                </div>
              </div>

              {/* Endpoint Specs Card */}
              <div className="p-3.5 rounded-xl bg-white/[0.02] border border-white/[0.06] grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
                <div>
                  <span className="text-[10px] text-slate-400 block font-mono">Sync Endpoint URL:</span>
                  <span className="font-mono text-cyan-300 font-semibold">/api/attendance/sync</span>
                </div>
                <div>
                  <span className="text-[10px] text-slate-400 block font-mono">Auth Header:</span>
                  <span className="font-mono text-slate-200">Bearer &lt;ATTENDANCE_SYNC_SECRET&gt;</span>
                </div>
                <div>
                  <span className="text-[10px] text-slate-400 block font-mono">Idempotency Key:</span>
                  <span className="font-mono text-emerald-300 font-semibold">attendance_id (Zero Duplicates)</span>
                </div>
              </div>

              {/* Sync Log Table */}
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead>
                    <tr className="border-b border-white/[0.08] text-[11px] font-mono text-slate-500">
                      <th className="pb-2.5">Attendance ID</th>
                      <th className="pb-2.5">Student</th>
                      <th className="pb-2.5">Date & Time</th>
                      <th className="pb-2.5">Status</th>
                      <th className="pb-2.5">Source</th>
                      <th className="pb-2.5">Sync Result</th>
                      <th className="pb-2.5">Logged At</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-white/[0.04]">
                    {syncLogs.length === 0 ? (
                      <tr>
                        <td colSpan={7} className="py-8 text-center text-slate-500 font-mono text-xs">
                          No external synchronization requests received yet. Send a request to POST /api/attendance/sync to see live events.
                        </td>
                      </tr>
                    ) : (
                      syncLogs.map((log) => (
                        <tr key={log.id} className="hover:bg-white/[0.02] transition-colors font-mono">
                          <td className="py-2.5 font-bold text-cyan-300">{log.attendance_id}</td>
                          <td className="py-2.5 text-white">
                            <span>{log.student_name}</span>
                            <span className="text-[10px] text-slate-500 ml-1.5">({log.student_id})</span>
                          </td>
                          <td className="py-2.5 text-slate-300">{log.date} {log.time}</td>
                          <td className="py-2.5">
                            <span className={`px-2 py-0.5 rounded-full text-[10px] ${
                              log.status === 'PRESENT'
                                ? 'bg-emerald-500/15 text-emerald-300 border border-emerald-500/30'
                                : log.status === 'LATE'
                                ? 'bg-amber-500/15 text-amber-300 border border-amber-500/30'
                                : 'bg-rose-500/15 text-rose-300 border border-rose-500/30'
                            }`}>
                              {log.status}
                            </span>
                          </td>
                          <td className="py-2.5 text-slate-400 text-[11px]">{log.source}</td>
                          <td className="py-2.5">
                            <span className={`px-2 py-0.5 rounded-full text-[10px] ${
                              log.result === 'SUCCESS'
                                ? 'bg-emerald-500/20 text-emerald-300'
                                : log.result === 'DUPLICATE'
                                ? 'bg-blue-500/20 text-blue-300'
                                : 'bg-rose-500/20 text-rose-300'
                            }`}>
                              {log.result === 'DUPLICATE' ? 'IDEMPOTENT (NO DUP)' : log.result}
                            </span>
                          </td>
                          <td className="py-2.5 text-[10px] text-slate-500">
                            {formatKolkataTime(log.timestamp || (log as any).logged_at || (log as any).created_at)}
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          ) : activeAdminTab === 'USERS' ? (
            /* User Management & Deletion Sub-view */
            <div className="rounded-2xl border border-white/[0.08] bg-[#0A0E17]/80 p-5 backdrop-blur-xl shadow-dashboard space-y-4">
              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 border-b border-white/[0.08] pb-3">
                <div>
                  <h3 className="text-sm font-bold text-white tracking-tight">Institutional User Directory & Identity Management</h3>
                  <p className="text-xs text-slate-400">View roster, reassign RFID cards, or delete users permanently from database</p>
                </div>
                <div className="flex flex-wrap items-center gap-3">
                  <button
                    onClick={() => setIsAddStudentModalOpen(true)}
                    className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-violet-600 hover:bg-violet-500 text-white font-bold text-xs shadow-glow-violet transition-all"
                  >
                    <Plus className="h-3.5 w-3.5" />
                    Register Student
                  </button>
                  <div className="flex items-center gap-1.5 p-1 rounded-xl bg-black/60 border border-white/10 text-xs">
                    <button
                      onClick={() => setUserCategory('STUDENTS')}
                      className={`px-3 py-1 rounded-lg font-medium transition-all ${
                        userCategory === 'STUDENTS' ? 'bg-violet-600 text-white font-bold' : 'text-slate-400 hover:text-white'
                      }`}
                    >
                      Students ({students.length})
                    </button>
                    <button
                      onClick={() => setUserCategory('STAFF')}
                      className={`px-3 py-1 rounded-lg font-medium transition-all ${
                        userCategory === 'STAFF' ? 'bg-violet-600 text-white font-bold' : 'text-slate-400 hover:text-white'
                      }`}
                    >
                      Faculty ({staff.length})
                    </button>
                    <button
                      onClick={() => setUserCategory('EMPLOYEES')}
                      className={`px-3 py-1 rounded-lg font-medium transition-all ${
                        userCategory === 'EMPLOYEES' ? 'bg-violet-600 text-white font-bold' : 'text-slate-400 hover:text-white'
                      }`}
                    >
                      Operations ({employees.length})
                    </button>
                  </div>
                </div>
              </div>

              {/* Users Table */}
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead>
                    <tr className="border-b border-white/[0.08] text-[11px] font-mono text-slate-500">
                      <th className="pb-2.5">User Identity</th>
                      <th className="pb-2.5">Student ID</th>
                      <th className="pb-2.5">Class & Sec</th>
                      <th className="pb-2.5">Roll</th>
                      <th className="pb-2.5">Phone (WhatsApp)</th>
                      <th className="pb-2.5">Assigned RFID UID</th>
                      <th className="pb-2.5">Status</th>
                      <th className="pb-2.5 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-white/[0.04]">
                    {userCategory === 'STUDENTS' && students.map((s) => (
                      <tr key={s.id} className="hover:bg-white/[0.02] transition-colors">
                        <td className="py-2.5 font-semibold text-white">
                          <div className="flex items-center gap-2">
                            <img src={s.avatarUrl} alt={s.name} className="h-6 w-6 rounded-full object-cover shrink-0" />
                            <div className="min-w-0">
                              <span className="block truncate">{s.name}</span>
                              {s.parentName && (
                                <span className="block text-[10px] text-slate-400 font-normal truncate">
                                  Guardian: <span className="text-slate-300">{s.parentName}</span>
                                </span>
                              )}
                            </div>
                          </div>
                        </td>
                        <td className="py-2.5 font-mono text-cyan-300 font-bold">{s.admissionNo}</td>
                        <td className="py-2.5 text-slate-300 font-mono">Class {s.classGrade}-{s.section}</td>
                        <td className="py-2.5 font-mono text-slate-400">{s.rollNo}</td>
                        <td className="py-2.5 font-mono text-slate-300">
                          <div>
                            <span>{s.parentPhone || '—'}</span>
                            {s.parentEmail && (
                              <span className="block text-[10px] text-slate-500 truncate max-w-[140px]">{s.parentEmail}</span>
                            )}
                          </div>
                        </td>
                        <td className="py-2.5 font-mono font-semibold">
                          {s.rfidUid ? (
                            <span className="text-cyan-300 bg-cyan-500/10 border border-cyan-500/20 px-2 py-0.5 rounded text-[11px]">
                              {s.rfidUid}
                            </span>
                          ) : (
                            <span className="text-amber-400 italic text-[11px]">Unassigned</span>
                          )}
                        </td>
                        <td className="py-2.5">
                          <span className={`px-2 py-0.5 rounded-full text-[10px] font-mono font-bold ${
                            s.status === 'ACTIVE'
                              ? 'bg-emerald-500/15 text-emerald-300 border border-emerald-500/30'
                              : 'bg-rose-500/15 text-rose-300 border border-rose-500/30'
                          }`}>
                            {s.status || 'ACTIVE'}
                          </span>
                        </td>
                        <td className="py-2.5 text-right">
                          <div className="flex items-center justify-end gap-1.5">
                            <button
                              onClick={() => {
                                setRfidAssignTarget({ id: s.id, name: s.name, currentRfid: s.rfidUid || '' });
                                setRfidInputVal(s.rfidUid || '');
                              }}
                              className="px-2 py-1 rounded-lg border border-cyan-500/30 bg-cyan-500/10 hover:bg-cyan-500/20 text-cyan-300 text-[10px] font-semibold transition-colors"
                              title="Assign or reassign RFID card UID"
                            >
                              Assign RFID
                            </button>
                            <button
                              onClick={() => {
                                setEditingStudent(s);
                                setIsEditModalOpen(true);
                              }}
                              className="px-2 py-1 rounded-lg border border-white/10 hover:bg-white/10 text-slate-300 text-[10px] font-semibold transition-colors"
                            >
                              Edit
                            </button>
                            <button
                              onClick={() => setDeleteTarget({ id: s.id, name: s.name, type: 'STUDENT' })}
                              className="px-2 py-1 rounded-lg border border-rose-500/30 bg-rose-500/10 hover:bg-rose-500/20 text-rose-300 text-[10px] font-semibold transition-colors"
                            >
                              Deactivate
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}

                    {userCategory === 'STAFF' && staff.map((st) => (
                      <tr key={st.id} className="hover:bg-white/[0.02] transition-colors">
                        <td className="py-2.5 font-semibold text-white flex items-center gap-2">
                          <img src={st.avatarUrl} alt={st.name} className="h-6 w-6 rounded-full object-cover" />
                          <span>{st.name}</span>
                        </td>
                        <td className="py-2.5 font-mono text-slate-400">{st.employeeId}</td>
                        <td className="py-2.5 text-slate-300 font-mono">{st.department} • {st.designation}</td>
                        <td className="py-2.5 font-mono text-cyan-300 font-semibold">{st.rfidUid}</td>
                        <td className="py-2.5 font-mono text-emerald-400 font-semibold">{st.attendancePercentage}%</td>
                        <td className="py-2.5 text-right">
                          <button
                            onClick={() => setDeleteTarget({ id: st.id, name: st.name, type: 'STAFF' })}
                            className="px-2.5 py-1 rounded-lg border border-rose-500/30 bg-rose-500/10 hover:bg-rose-500/20 text-rose-300 text-[10px] font-semibold flex items-center gap-1 ml-auto transition-colors"
                          >
                            <Trash2 className="h-3 w-3" /> Delete
                          </button>
                        </td>
                      </tr>
                    ))}

                    {userCategory === 'EMPLOYEES' && employees.map((emp) => (
                      <tr key={emp.id} className="hover:bg-white/[0.02] transition-colors">
                        <td className="py-2.5 font-semibold text-white flex items-center gap-2">
                          <img src={emp.avatarUrl} alt={emp.name} className="h-6 w-6 rounded-full object-cover" />
                          <span>{emp.name}</span>
                        </td>
                        <td className="py-2.5 font-mono text-slate-400">{emp.employeeId}</td>
                        <td className="py-2.5 text-slate-300 font-mono">{emp.department} • {emp.designation}</td>
                        <td className="py-2.5 font-mono text-cyan-300 font-semibold">{emp.rfidUid}</td>
                        <td className="py-2.5 font-mono text-emerald-400 font-semibold">{emp.attendancePercentage}%</td>
                        <td className="py-2.5 text-right">
                          <button
                            onClick={() => setDeleteTarget({ id: emp.id, name: emp.name, type: 'EMPLOYEE' })}
                            className="px-2.5 py-1 rounded-lg border border-rose-500/30 bg-rose-500/10 hover:bg-rose-500/20 text-rose-300 text-[10px] font-semibold flex items-center gap-1 ml-auto transition-colors"
                          >
                            <Trash2 className="h-3 w-3" /> Delete
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          ) : activeAdminTab === 'SHEETS' ? (
            /* Settings → Google Sheets Configuration & Integration View */
            <div className="rounded-2xl border border-white/[0.08] bg-[#0A0E17]/80 p-5 backdrop-blur-xl shadow-dashboard space-y-6">
              {/* Header with Spreadsheet Link and Sync Trigger */}
              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 border-b border-white/[0.08] pb-4">
                <div>
                  <div className="flex items-center gap-2">
                    <FileSpreadsheet className="h-4 w-4 text-emerald-400" />
                    <h3 className="text-sm font-bold text-white tracking-tight">Settings → Google Sheets Configuration</h3>
                    <span className={`px-2 py-0.5 rounded-full text-[10px] font-mono font-bold ${
                      backendSyncStatus.isOffline
                        ? 'bg-rose-500/15 text-rose-300 border border-rose-500/30'
                        : backendSyncStatus.isConfigured
                        ? 'bg-emerald-500/15 text-emerald-300 border border-emerald-500/30'
                        : 'bg-amber-500/15 text-amber-300 border border-amber-500/30'
                    }`}>
                      {backendSyncStatus.isOffline
                        ? '● Google Sheets Offline'
                        : backendSyncStatus.isConfigured
                        ? '● Google Sheets Connected'
                        : 'Service Account Config Pending'}
                    </span>
                    <span className="px-2 py-0.5 rounded-full text-[10px] font-mono bg-cyan-500/15 text-cyan-300 border border-cyan-500/30 flex items-center gap-1">
                      <Clock className="h-2.5 w-2.5" /> Next Poll: {backendSyncStatus.nextCheckCountdown}s
                    </span>
                  </div>
                  <p className="text-xs text-slate-400 mt-1 flex items-center gap-1.5">
                    <span>Spreadsheet ID: <code className="text-cyan-300 font-mono">{backendSyncStatus.spreadsheetId}</code></span>
                    <a
                      href={`https://docs.google.com/spreadsheets/d/${backendSyncStatus.spreadsheetId}/edit`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-emerald-400 hover:text-emerald-300 inline-flex items-center gap-0.5 text-[11px] underline ml-2"
                    >
                      <span>Open in Google Sheets</span>
                      <ExternalLink className="h-3 w-3" />
                    </a>
                  </p>
                </div>
                <div className="flex items-center gap-2">
                  <button
                    onClick={handleManualSync}
                    disabled={isSyncing}
                    className="px-4 py-2 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-black text-xs font-bold transition-all shadow-glow-emerald flex items-center gap-1.5"
                  >
                    <RefreshCw className={`h-3.5 w-3.5 ${isSyncing ? 'animate-spin' : ''}`} />
                    <span>{isSyncing ? 'Syncing...' : 'Sync Google Sheets Now'}</span>
                  </button>
                </div>
              </div>

              {/* Hard Architectural Safety Guarantee Banner */}
              <div className="p-3.5 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-xs text-slate-300 flex items-start gap-3">
                <ShieldCheck className="h-5 w-5 text-emerald-400 shrink-0 mt-0.5" />
                <div className="space-y-1">
                  <div className="font-bold text-white flex items-center gap-2">
                    <span>Strict Read-Only Isolation Architecture</span>
                    <span className="px-1.5 py-0.2 rounded text-[9px] font-mono bg-emerald-500/20 text-emerald-300">
                      Guaranteed Safe
                    </span>
                  </div>
                  <p className="text-[11px] text-slate-300 leading-relaxed">
                    The existing physical RFID + ESP8266 + n8n + Google Sheets system is completely independent. The website <strong className="text-white">ONLY READS</strong> scan rows from Google Sheets. It <strong className="text-rose-300">NEVER</strong> appends rows, edits columns, modifies cells, or deletes data in the sheet. All user management, RFID UID bindings, and attendance calculations are persisted solely inside Supabase.
                  </p>
                </div>
              </div>

              {/* Settings Configuration Parameters Grid (Section 37) */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                {/* 1. Spreadsheet ID */}
                <div className="p-3.5 rounded-xl bg-white/[0.02] border border-white/[0.06] space-y-1.5 text-xs">
                  <span className="text-[10px] font-mono text-slate-400 uppercase tracking-wider block">
                    Spreadsheet ID
                  </span>
                  <div className="font-mono text-cyan-300 text-xs truncate select-all bg-black/40 px-2 py-1 rounded border border-white/5">
                    {backendSyncStatus.spreadsheetId}
                  </div>
                  <span className="text-[10px] text-slate-500 block">Master RFID sheet managed by n8n</span>
                </div>

                {/* 2. Connection Status */}
                <div className="p-3.5 rounded-xl bg-white/[0.02] border border-white/[0.06] space-y-1.5 text-xs">
                  <span className="text-[10px] font-mono text-slate-400 uppercase tracking-wider block">
                    Connection Status
                  </span>
                  <div className="flex items-center gap-2">
                    <span className={`h-2.5 w-2.5 rounded-full ${
                      backendSyncStatus.isOffline
                        ? 'bg-rose-400 animate-ping'
                        : backendSyncStatus.isConfigured
                        ? 'bg-emerald-400'
                        : 'bg-amber-400'
                    }`} />
                    <span className={`font-bold ${
                      backendSyncStatus.isOffline
                        ? 'text-rose-400'
                        : backendSyncStatus.isConfigured
                        ? 'text-emerald-300'
                        : 'text-amber-400'
                    }`}>
                      {backendSyncStatus.isOffline
                        ? 'Offline (Retrying...)'
                        : backendSyncStatus.isConfigured
                        ? 'Connected (Read-Only)'
                        : 'Pending Configuration'}
                    </span>
                  </div>
                  <span className="text-[10px] text-slate-500 block">Scope: spreadsheets.readonly</span>
                </div>

                {/* 3. Detected Sheet Tab */}
                <div className="p-3.5 rounded-xl bg-white/[0.02] border border-white/[0.06] space-y-1.5 text-xs">
                  <span className="text-[10px] font-mono text-slate-400 uppercase tracking-wider block">
                    Detected Sheet Tab
                  </span>
                  <div className="font-bold text-white font-mono flex items-center gap-1.5">
                    <FileSpreadsheet className="h-3.5 w-3.5 text-emerald-400" />
                    <span>{backendSyncStatus.detectedSheet || 'Attendance Data'}</span>
                  </div>
                  <span className="text-[10px] text-slate-500 block">Auto-discovered active tab with RFID scans</span>
                </div>

                {/* 4. Polling Interval Selector */}
                <div className="p-3.5 rounded-xl bg-white/[0.02] border border-white/[0.06] space-y-1.5 text-xs">
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] font-mono text-slate-400 uppercase tracking-wider">
                      Polling Interval
                    </span>
                    <span className="text-[10px] font-mono text-cyan-300">
                      {backendSyncStatus.pollingIntervalSeconds}s active
                    </span>
                  </div>
                  <select
                    value={backendSyncStatus.pollingIntervalSeconds}
                    onChange={(e) => {
                      const sec = Number(e.target.value);
                      setPollingIntervalSeconds(sec);
                      addToast(
                        'Polling Interval Updated',
                        `Google Sheets read-only polling set to ${sec >= 60 ? `${sec / 60} min` : `${sec}s`}.`,
                        'INFO'
                      );
                    }}
                    className="w-full rounded-lg bg-black/60 border border-white/10 px-2 py-1.5 text-xs text-white focus:border-cyan-400 focus:outline-none font-mono"
                  >
                    <option value={10}>10 seconds (Default • Active Dashboard)</option>
                    <option value={20}>20 seconds</option>
                    <option value={30}>30 seconds</option>
                    <option value={40}>40 seconds (Recommended • Active Polling)</option>
                    <option value={60}>60 seconds (1 minute)</option>
                    <option value={300}>5 minutes (300s)</option>
                    <option value={1200}>20 minutes (1200s)</option>
                  </select>
                  <span className="text-[10px] text-slate-500 block">Only active while dashboard is open</span>
                </div>

                {/* 5. Last Sync Timestamp */}
                <div className="p-3.5 rounded-xl bg-white/[0.02] border border-white/[0.06] space-y-1.5 text-xs">
                  <span className="text-[10px] font-mono text-slate-400 uppercase tracking-wider block">
                    Last Successful Sync
                  </span>
                  <div className="font-mono text-white text-xs font-bold">
                    {backendSyncStatus.lastChecked || 'Not synced yet'}
                  </div>
                  <span className="text-[10px] text-slate-500 block">Incremental cursor updated</span>
                </div>

                {/* 6. Last Error */}
                <div className="p-3.5 rounded-xl bg-white/[0.02] border border-white/[0.06] space-y-1.5 text-xs">
                  <span className="text-[10px] font-mono text-slate-400 uppercase tracking-wider block">
                    Last Error / Warning
                  </span>
                  <div className={`font-mono text-xs truncate ${
                    backendSyncStatus.lastError ? 'text-rose-400 font-bold' : 'text-slate-400'
                  }`}>
                    {backendSyncStatus.lastError || 'None • Healthy stream'}
                  </div>
                  <span className="text-[10px] text-slate-500 block">Automatic exponential backoff on errors</span>
                </div>
              </div>

              {/* Service Account Guidance if not configured */}
              {!backendSyncStatus.isConfigured && (
                <div className="p-4 rounded-xl bg-amber-500/10 border border-amber-500/25 text-xs text-slate-300 space-y-2">
                  <div className="flex items-center gap-2 font-bold text-amber-300">
                    <AlertTriangle className="h-4 w-4" />
                    <span>Google Sheets API Read-Only Credentials Notice</span>
                  </div>
                  <p className="leading-relaxed">
                    To connect read-only synchronization from Google Spreadsheet <code className="text-amber-200 font-mono">{backendSyncStatus.spreadsheetId}</code>, add your Google Service Account email and RSA private key to <code className="text-cyan-300 font-mono">.env</code>:
                  </p>
                  <pre className="p-2 rounded bg-black/60 font-mono text-[11px] text-slate-400 overflow-x-auto">
GOOGLE_SERVICE_ACCOUNT_EMAIL=your-service-account@project.iam.gserviceaccount.com
GOOGLE_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----\n...\n-----END PRIVATE KEY-----"
                  </pre>
                  <p className="text-[11px] text-slate-400">
                    The spreadsheet only needs <strong className="text-white">Viewer</strong> (read-only) permissions for the service account. The website will never write to it.
                  </p>
                </div>
              )}

              {/* Date-Partitioned Sheets Grid */}
              <div>
                <h4 className="text-xs font-bold text-white uppercase tracking-wider mb-3">
                  Synchronized Spreadsheet Tabs ({dateWiseSheets.length} Tabs Managed)
                </h4>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  {dateWiseSheets.map((s, idx) => (
                    <div key={idx} className="p-3.5 rounded-xl bg-white/[0.02] border border-white/[0.06] space-y-2 text-xs">
                      <div className="flex items-center justify-between">
                        <span className="font-semibold text-white flex items-center gap-1.5">
                          <FileSpreadsheet className="h-3.5 w-3.5 text-emerald-400" />
                          <span>{s.name}</span>
                        </span>
                        <span className="px-1.5 py-0.5 rounded text-[9px] font-mono bg-emerald-500/15 text-emerald-300 border border-emerald-500/30">
                          {s.status}
                        </span>
                      </div>
                      <div className="text-[11px] text-slate-400 flex items-center justify-between">
                        <span>Records Processed:</span>
                        <span className="text-white font-mono font-bold">{s.rowCount}</span>
                      </div>
                      <div className="text-[10px] text-slate-500 font-mono flex items-center justify-between pt-1 border-t border-white/[0.04]">
                        <span>Last Updated:</span>
                        <span>{s.lastUpdated}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Sync History Logs Table */}
              <div>
                <h4 className="text-xs font-bold text-white uppercase tracking-wider mb-3">
                  Google Sheets Synchronization Audit History
                </h4>
                <div className="overflow-x-auto">
                  <table className="w-full text-left text-xs font-mono">
                    <thead>
                      <tr className="border-b border-white/[0.08] text-[11px] text-slate-400">
                        <th className="pb-2.5">Sync Timestamp</th>
                        <th className="pb-2.5">Date Sheet</th>
                        <th className="pb-2.5">Processed</th>
                        <th className="pb-2.5">Present</th>
                        <th className="pb-2.5">Absent</th>
                        <th className="pb-2.5">Duplicates Ignored</th>
                        <th className="pb-2.5">Unknown Scans</th>
                        <th className="pb-2.5">Duration</th>
                        <th className="pb-2.5 text-right">Result</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-white/[0.04]">
                      {sheetsHistoryLogs.length === 0 ? (
                        <tr>
                          <td colSpan={9} className="py-6 text-center text-slate-500 text-xs">
                            No synchronization runs recorded yet. Click "Sync Google Sheets Now" to execute an immediate sync.
                          </td>
                        </tr>
                      ) : (
                        sheetsHistoryLogs.map((log, i) => (
                          <tr key={log.id || i} className="hover:bg-white/[0.02] transition-colors">
                            <td className="py-2.5 text-slate-300">{new Date(log.timestamp).toLocaleTimeString()}</td>
                            <td className="py-2.5 text-cyan-300 font-bold">{log.date}</td>
                            <td className="py-2.5 text-white">{log.processed}</td>
                            <td className="py-2.5 text-emerald-400 font-bold">{log.present}</td>
                            <td className="py-2.5 text-rose-400 font-bold">{log.absent}</td>
                            <td className="py-2.5 text-slate-400">{log.duplicates}</td>
                            <td className="py-2.5 text-amber-400">{log.unknownRfidCount || 0}</td>
                            <td className="py-2.5 text-slate-400">{log.durationMs}ms</td>
                            <td className="py-2.5 text-right">
                              <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                                log.synced
                                  ? 'bg-emerald-500/20 text-emerald-300'
                                  : 'bg-rose-500/20 text-rose-300'
                              }`}>
                                {log.synced ? 'SYNCED' : 'ERROR'}
                              </span>
                            </td>
                          </tr>
                        ))
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          ) : activeAdminTab === 'CREDS' ? (
            /* Admin Credential Generator View */
            <div className="rounded-2xl border border-white/[0.08] bg-[#0A0E17]/80 p-5 backdrop-blur-xl shadow-dashboard space-y-4">
              <div className="border-b border-white/[0.08] pb-3">
                <h3 className="text-sm font-bold text-white tracking-tight">Provision Institutional Credentials</h3>
                <p className="text-xs text-slate-400 mt-0.5">
                  Generated accounts immediately persist across browser refreshes and synchronize to Supabase for password or Google Sign-In verification.
                </p>
              </div>
              <form onSubmit={handleGenerateCred} className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3 text-xs">
                <div>
                  <label className="text-slate-400 block mb-1">Full Name</label>
                  <input
                    type="text"
                    required
                    value={genName}
                    onChange={(e) => setGenName(e.target.value)}
                    placeholder="e.g. Ananya Das"
                    className="w-full rounded-xl border border-white/10 bg-black/60 p-2 text-white focus:border-violet-500 focus:outline-none"
                  />
                </div>
                <div>
                  <label className="text-slate-400 block mb-1">Account Role</label>
                  <select
                    value={genType}
                    onChange={(e) => setGenType(e.target.value as any)}
                    className="w-full rounded-xl border border-white/10 bg-black/60 p-2 text-white focus:border-violet-500 focus:outline-none"
                  >
                    <option value="STUDENT">Student</option>
                    <option value="STAFF">Faculty / Staff</option>
                    <option value="EMPLOYEE">Campus Operations Employee</option>
                    <option value="ADMIN">Super Admin</option>
                  </select>
                </div>
                <div>
                  <label className="text-slate-400 block mb-1">Email / Gmail Address</label>
                  <input
                    type="text"
                    required
                    value={genEmail}
                    onChange={(e) => setGenEmail(e.target.value)}
                    placeholder="name@gmail.com or pvmlumding.edu"
                    className="w-full rounded-xl border border-white/10 bg-black/60 p-2 text-white focus:border-violet-500 focus:outline-none"
                  />
                </div>
                <div>
                  <label className="text-slate-400 block mb-1">Phone (for OTP)</label>
                  <input
                    type="text"
                    value={genPhone}
                    onChange={(e) => setGenPhone(e.target.value)}
                    placeholder="+91 94350..."
                    className="w-full rounded-xl border border-white/10 bg-black/60 p-2 text-white focus:border-violet-500 focus:outline-none"
                  />
                </div>
                <div>
                  <label className="text-slate-400 block mb-1">Temporary Password</label>
                  <input
                    type="text"
                    required
                    value={genPass}
                    onChange={(e) => setGenPass(e.target.value)}
                    className="w-full rounded-xl border border-white/10 bg-black/60 p-2 text-white focus:border-violet-500 focus:outline-none font-mono"
                  />
                </div>
                <div className="flex items-end">
                  <button
                    type="submit"
                    className="w-full py-2 rounded-xl bg-violet-600 hover:bg-violet-500 text-white font-bold transition-all shadow-glow-violet"
                  >
                    Generate & Save to Supabase
                  </button>
                </div>
              </form>

              <div className="pt-4 border-t border-white/[0.06]">
                <h4 className="text-xs font-bold text-slate-300 mb-2">Recently Generated Provisioning Records:</h4>
                <div className="space-y-1.5">
                  {generatedCredentials.map((c) => (
                    <div key={c.id} className="flex items-center justify-between p-2 rounded-xl bg-white/[0.02] border border-white/[0.04] text-xs">
                      <div>
                        <span className="font-semibold text-white">{c.personName}</span>
                        <span className="text-slate-400 ml-2">({c.personType})</span>
                        <span className="text-slate-500 ml-2 font-mono">{c.email}</span>
                      </div>
                      <div className="flex items-center gap-3">
                        <span className="font-mono text-cyan-400 text-[11px]">Pass: {c.tempPassword}</span>
                        <span className="px-2 py-0.5 rounded-full text-[10px] font-mono bg-emerald-500/15 text-emerald-300">
                          {c.status}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          ) : activeAdminTab === 'SETTINGS' ? (
            /* Rule Thresholds View */
            <div className="rounded-2xl border border-white/[0.08] bg-[#0A0E17]/80 p-5 backdrop-blur-xl shadow-dashboard space-y-4">
              <div className="border-b border-white/[0.08] pb-3">
                <h3 className="text-sm font-bold text-white tracking-tight">Institutional Attendance Rules & Timings</h3>
                <p className="text-xs text-slate-400">Configure cutoff times, late thresholds, and grace periods for Pranabananda Vidyamandir</p>
              </div>
              <form onSubmit={handleSaveRules} className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs">
                <div>
                  <label className="text-slate-400 block mb-1">Campus Start Time</label>
                  <input
                    type="time"
                    value={startTime}
                    onChange={(e) => setStartTime(e.target.value)}
                    className="w-full rounded-xl border border-white/10 bg-black/60 p-2 text-white focus:border-violet-500 focus:outline-none font-mono"
                  />
                </div>
                <div>
                  <label className="text-slate-400 block mb-1">Late Attendance Threshold</label>
                  <input
                    type="time"
                    value={lateThreshold}
                    onChange={(e) => setLateThreshold(e.target.value)}
                    className="w-full rounded-xl border border-white/10 bg-black/60 p-2 text-white focus:border-violet-500 focus:outline-none font-mono"
                  />
                </div>
                <div>
                  <label className="text-slate-400 block mb-1">Perimeter Gate Cutoff Time</label>
                  <input
                    type="time"
                    value={cutoffTime}
                    onChange={(e) => setCutoffTime(e.target.value)}
                    className="w-full rounded-xl border border-white/10 bg-black/60 p-2 text-white focus:border-violet-500 focus:outline-none font-mono"
                  />
                </div>
                <div className="sm:col-span-3 flex justify-end">
                  <button
                    type="submit"
                    className="px-5 py-2 rounded-xl bg-violet-600 hover:bg-violet-500 text-white font-bold flex items-center gap-2 transition-all shadow-glow-violet"
                  >
                    <Save className="h-3.5 w-3.5" />
                    <span>Save Rules to LocalStorage & Supabase</span>
                  </button>
                </div>
              </form>
            </div>
          ) : activeAdminTab === 'DEVICES' ? (
            /* IoT Nodes Fleet View */
            <div className="rounded-2xl border border-white/[0.08] bg-[#0A0E17]/80 p-5 backdrop-blur-xl shadow-dashboard space-y-4">
              <div className="border-b border-white/[0.08] pb-3 flex items-center justify-between">
                <div>
                  <h3 className="text-sm font-bold text-white tracking-tight">Institutional IoT Fleet Telemetry</h3>
                  <p className="text-xs text-slate-400">Real-time status of Raspberry Pi 3B Gateways and ESP8266 Classroom Nodes</p>
                </div>
                <button
                  onClick={() => setSimulatorOpen(true)}
                  className="px-3 py-1.5 rounded-xl bg-cyan-500 text-black text-xs font-bold flex items-center gap-1 shadow-glow-cyan"
                >
                  <Cpu className="h-3 w-3" /> Launch Gate Simulator
                </button>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
                {devices.map((d) => (
                  <div key={d.id} className="p-4 rounded-xl bg-white/[0.02] border border-white/[0.06] space-y-2 text-xs">
                    <div className="flex items-center justify-between">
                      <span className="font-semibold text-white">{d.name}</span>
                      <span className={`px-2 py-0.5 rounded text-[9px] font-mono ${
                        d.status === 'ONLINE' ? 'bg-emerald-500/15 text-emerald-300 border border-emerald-500/30' : 'bg-rose-500/15 text-rose-300'
                      }`}>
                        {d.status}
                      </span>
                    </div>
                    <div className="text-[11px] text-slate-400 font-mono">
                      Location: <span className="text-white">{d.location}</span>
                    </div>
                    <div className="flex items-center justify-between text-[10px] text-slate-500 font-mono pt-2 border-t border-white/[0.04]">
                      <span>IP: {d.ipAddress}</span>
                      <span className="text-cyan-400">{d.latencyMs}ms latency</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ) : activeAdminTab === 'BACKUP' ? (
            <div className="rounded-2xl border border-white/[0.08] bg-[#0A0E17]/80 p-5 backdrop-blur-xl shadow-dashboard space-y-6">
              <div className="border-b border-white/[0.08] pb-3">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="text-sm font-bold text-white tracking-tight">Institutional Data Persistence & Backup</h3>
                    <p className="text-xs text-slate-400 mt-0.5">
                      Your edits to student records, employee profiles, attendance logs, and generated credentials are saved automatically so refreshing localhost never deletes your data.
                    </p>
                  </div>
                  <span className="px-3 py-1 rounded-full text-[10px] font-mono bg-emerald-500/15 text-emerald-300 border border-emerald-500/30 flex items-center gap-1.5">
                    <span className="h-1.5 w-1.5 rounded-full bg-emerald-400 animate-pulse" />
                    Persistent Storage Active
                  </span>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs">
                {/* Export Card */}
                <div className="p-4 rounded-xl bg-white/[0.02] border border-white/[0.06] flex flex-col justify-between space-y-3">
                  <div>
                    <div className="flex items-center gap-2 text-white font-bold mb-1">
                      <Download className="h-4 w-4 text-violet-400" />
                      <span>Export JSON Backup</span>
                    </div>
                    <p className="text-[11px] text-slate-400">
                      Download a full snapshot of students, staff, employees, credentials, and attendance records as an institutional backup file.
                    </p>
                  </div>
                  <button
                    onClick={exportFullBackup}
                    className="w-full py-2 rounded-xl bg-violet-600 hover:bg-violet-500 text-white font-bold transition-all shadow-glow-violet flex items-center justify-center gap-1.5"
                  >
                    <Download className="h-3.5 w-3.5" />
                    <span>Download JSON Backup</span>
                  </button>
                </div>

                {/* Import / Restore Card */}
                <div className="p-4 rounded-xl bg-white/[0.02] border border-white/[0.06] flex flex-col justify-between space-y-3">
                  <div>
                    <div className="flex items-center gap-2 text-white font-bold mb-1">
                      <Upload className="h-4 w-4 text-cyan-400" />
                      <span>Restore from Backup</span>
                    </div>
                    <p className="text-[11px] text-slate-400">
                      Upload a previously exported JSON backup file to instantly restore all student, employee, and attendance records.
                    </p>
                  </div>
                  <div>
                    <input
                      type="file"
                      ref={fileInputRef}
                      onChange={handleFileRestore}
                      accept=".json"
                      className="hidden"
                    />
                    <button
                      onClick={() => fileInputRef.current?.click()}
                      className="w-full py-2 rounded-xl border border-cyan-500/30 bg-cyan-500/10 hover:bg-cyan-500/20 text-cyan-300 font-bold transition-all flex items-center justify-center gap-1.5"
                    >
                      <Upload className="h-3.5 w-3.5" />
                      <span>Upload JSON Backup File</span>
                    </button>
                  </div>
                </div>

                {/* Factory Reset Card */}
                <div className="p-4 rounded-xl bg-white/[0.02] border border-white/[0.06] flex flex-col justify-between space-y-3">
                  <div>
                    <div className="flex items-center gap-2 text-white font-bold mb-1">
                      <Trash2 className="h-4 w-4 text-rose-400" />
                      <span>Reset to School Defaults</span>
                    </div>
                    <p className="text-[11px] text-slate-400">
                      Clear all custom edits in local storage and reload the official Pranabananda Vidyamandir seed database.
                    </p>
                  </div>
                  <button
                    onClick={() => {
                      if (confirm('Are you sure you want to reset all modified data to Pranabananda Vidyamandir institutional defaults?')) {
                        resetAllDataToDefaults();
                      }
                    }}
                    className="w-full py-2 rounded-xl border border-rose-500/30 bg-rose-500/10 hover:bg-rose-500/20 text-rose-300 font-semibold transition-all flex items-center justify-center gap-1.5"
                  >
                    <Trash2 className="h-3.5 w-3.5" />
                    <span>Reset to Defaults</span>
                  </button>
                </div>
              </div>
            </div>
          ) : (
            <div className="rounded-2xl border border-white/[0.08] bg-[#0A0E17]/80 p-5 backdrop-blur-xl shadow-dashboard space-y-4">
              <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 border-b border-white/[0.08] pb-4">
                <div>
                  <div className="flex items-center gap-2">
                    <CheckCircle2 className="h-4 w-4 text-emerald-400" />
                    <h3 className="text-sm font-bold text-white tracking-tight">Daily Live Attendance Matrix</h3>
                    <span className="px-2 py-0.5 rounded-full text-[10px] font-mono bg-violet-500/20 text-violet-300 border border-violet-500/30">
                      {selectedDate} (IST)
                    </span>
                  </div>
                  <p className="text-xs text-slate-400 mt-0.5">
                    Synchronized live attendance data for all registered students. Evaluated against the 08:00–09:00 AM window.
                  </p>
                </div>

                {/* Date Picker & Sync Action */}
                <div className="flex items-center gap-2">
                  <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-black/60 border border-white/10 text-xs">
                    <Clock className="h-3.5 w-3.5 text-slate-400" />
                    <span className="text-[10px] text-slate-400 font-mono">Date:</span>
                    <input
                      type="date"
                      value={selectedDate}
                      onChange={(e) => setSelectedDate(e.target.value)}
                      className="bg-transparent text-white font-mono text-xs focus:outline-none"
                    />
                  </div>
                  <button
                    onClick={handleManualSync}
                    disabled={isSyncing}
                    className="px-3.5 py-1.5 rounded-xl bg-violet-600 hover:bg-violet-500 text-white text-xs font-bold transition-all shadow-glow-violet flex items-center gap-1.5"
                  >
                    <RefreshCw className={`h-3 w-3 ${isSyncing ? 'animate-spin' : ''}`} />
                    <span>{isSyncing ? 'Processing...' : 'Run Sheet Sync'}</span>
                  </button>
                </div>
              </div>

              {/* Real-Time RFID Activity Section (Live Scan Stream Updating Every 10 Seconds) */}
              <div className="rounded-xl border border-white/[0.06] bg-black/40 p-4 space-y-3">
                <div className="flex items-center justify-between border-b border-white/[0.06] pb-2.5">
                  <div className="flex items-center gap-2">
                    <Radio className="h-4 w-4 text-cyan-400 animate-pulse" />
                    <span className="text-xs font-bold text-white uppercase tracking-wider">
                      Recent RFID Scans (Live Stream • 10s Auto-Poll)
                    </span>
                    <span className="px-2 py-0.5 rounded-full text-[10px] font-mono bg-cyan-500/10 text-cyan-300 border border-cyan-500/20">
                      Read-Only Stream
                    </span>
                  </div>
                  <span className="text-[10px] font-mono text-slate-400">
                    Showing latest {(() => {
                      const seen = new Set<string>();
                      return recentRfidScans.filter((s: any) => {
                        const k = `${s.date || ''}-${s.studentId || s.rfidUid || ''}-${s.timestamp || ''}`;
                        if (seen.has(k)) return false;
                        seen.add(k);
                        return true;
                      }).length;
                    })()} events
                  </span>
                </div>

                {recentRfidScans.length === 0 ? (
                  <div className="py-5 text-center text-slate-500 text-xs font-mono">
                    Awaiting next RFID card swipe at turnstiles... Checked every {backendSyncStatus.pollingIntervalSeconds}s.
                  </div>
                ) : (
                  <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-2.5">
                    {(() => {
                      const seen = new Set<string>();
                      const uniqueScans = recentRfidScans.filter((scan: any) => {
                        const k = `${scan.date || ''}-${scan.studentId || scan.rfidUid || ''}-${scan.timestamp || ''}`;
                        if (seen.has(k)) return false;
                        seen.add(k);
                        return true;
                      });
                      return uniqueScans.slice(0, 6).map((scan, idx) => (
                        <div
                          key={`${scan.studentId}-${scan.timestamp}-${idx}`}
                          className="flex items-center justify-between p-2.5 rounded-xl bg-white/[0.02] border border-white/[0.05] hover:border-white/10 transition-colors"
                        >
                        <div className="space-y-0.5 min-w-0 pr-2">
                          <div className="flex items-center gap-1.5 text-xs">
                            <span className="font-mono text-cyan-300 font-bold">{scan.studentId}</span>
                            <span className="font-semibold text-white truncate">{scan.studentName}</span>
                          </div>
                          <div className="text-[10px] font-mono text-slate-400 flex items-center gap-2">
                            <span>{scan.timestamp}</span>
                            <span className="text-slate-500">• {scan.rfidUid}</span>
                          </div>
                        </div>
                        <span className={`px-2 py-0.5 rounded text-[10px] font-mono font-bold shrink-0 ${
                          scan.status === 'PRESENT'
                            ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
                            : scan.status === 'DUPLICATE'
                            ? 'bg-slate-700/50 text-slate-300 border border-slate-600'
                            : 'bg-amber-500/20 text-amber-300 border border-amber-500/30'
                        }`}>
                          {scan.status}
                        </span>
                      </div>
                    ));
                  })()}
                </div>
              )}
              </div>

              {/* Filter Controls Bar */}
              <div className="flex flex-wrap items-center justify-between gap-3 p-3 rounded-xl bg-white/[0.02] border border-white/[0.04] text-xs">
                {/* Status Filter Pills */}
                <div className="flex items-center gap-1.5">
                  <span className="text-[10px] text-slate-400 font-mono mr-1">Status:</span>
                  {(['ALL', 'PRESENT', 'ABSENT', 'PENDING'] as const).map((st) => {
                    const count = st === 'ALL' ? dayTotal : st === 'PRESENT' ? dayPresent : st === 'ABSENT' ? dayAbsent : dayPending;
                    const isActive = statusFilter === st;
                    return (
                      <button
                        key={st}
                        onClick={() => setStatusFilter(st)}
                        className={`px-2.5 py-1 rounded-lg text-[11px] font-medium transition-all ${
                          isActive
                            ? 'bg-violet-600 text-white font-bold shadow-sm'
                            : 'bg-white/[0.04] hover:bg-white/[0.08] text-slate-300'
                        }`}
                      >
                        {st} <span className="text-[9px] font-mono opacity-80">({count})</span>
                      </button>
                    );
                  })}
                </div>

                {/* Class & Section Dropdowns */}
                <div className="flex items-center gap-2">
                  <div className="flex items-center gap-1">
                    <span className="text-[10px] text-slate-400 font-mono">Class:</span>
                    <select
                      value={classFilter}
                      onChange={(e) => setClassFilter(e.target.value)}
                      className="rounded-lg bg-black/60 border border-white/10 px-2 py-1 text-xs text-white focus:outline-none cursor-pointer"
                    >
                      <option value="ALL">All Classes</option>
                      {availableClasses.map(c => (
                        <option key={c} value={c}>Class {c}</option>
                      ))}
                    </select>
                  </div>
                  <div className="flex items-center gap-1">
                    <span className="text-[10px] text-slate-400 font-mono">Section:</span>
                    <select
                      value={sectionFilter}
                      onChange={(e) => setSectionFilter(e.target.value)}
                      className="rounded-lg bg-black/60 border border-white/10 px-2 py-1 text-xs text-white focus:outline-none cursor-pointer"
                    >
                      <option value="ALL">All Sections</option>
                      {availableSections.map(sec => (
                        <option key={sec} value={sec}>Section {sec}</option>
                      ))}
                    </select>
                  </div>
                </div>
              </div>

              {/* Attendance Table */}
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead>
                    <tr className="border-b border-white/[0.08] text-[11px] font-mono text-slate-400">
                      <th className="pb-3">Student ID</th>
                      <th className="pb-3">Student Name</th>
                      <th className="pb-3">Class & Sec</th>
                      <th className="pb-3">Roll</th>
                      <th className="pb-3">RFID UID</th>
                      <th className="pb-3">First Check-in</th>
                      <th className="pb-3">Attendance Status</th>
                      <th className="pb-3">WhatsApp</th>
                      <th className="pb-3">Gmail</th>
                      <th className="pb-3 text-right">Sheet Sync</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-white/[0.04]">
                    {filteredDailyList.length === 0 ? (
                      <tr>
                        <td colSpan={10} className="py-8 text-center text-slate-500 font-mono text-xs">
                          No registered students match the selected filters for {selectedDate}.
                        </td>
                      </tr>
                    ) : (
                      filteredDailyList.map((item) => (
                        <tr key={item.studentId} className="hover:bg-white/[0.02] transition-colors">
                          <td className="py-3 font-mono font-bold text-cyan-300">{item.studentId}</td>
                          <td className="py-3 font-semibold text-white flex items-center gap-2">
                            <img src={item.avatarUrl} alt={item.name} className="h-6 w-6 rounded-full object-cover" />
                            <span>{item.name}</span>
                          </td>
                          <td className="py-3 text-slate-300 font-mono">Class {item.classGrade}-{item.section}</td>
                          <td className="py-3 font-mono text-slate-400">{item.rollNumber}</td>
                          <td className="py-3 font-mono text-cyan-400 font-semibold">{item.rfidUid || '—'}</td>
                          <td className="py-3 font-mono text-slate-300">{item.checkInTime}</td>
                          <td className="py-3">
                            <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-mono font-bold ${
                              item.status === 'PRESENT'
                                ? 'bg-emerald-500/15 text-emerald-300 border border-emerald-500/30'
                                : item.status === 'ABSENT'
                                ? 'bg-rose-500/15 text-rose-300 border border-rose-500/30'
                                : 'bg-amber-500/15 text-amber-300 border border-amber-500/30'
                            }`}>
                              {item.status}
                            </span>
                          </td>
                          <td className="py-3 font-mono">
                            <span className={`px-2 py-0.5 rounded text-[9px] font-bold ${
                              item.whatsAppStatus === 'SENT'
                                ? 'bg-emerald-500/15 text-emerald-300 border border-emerald-500/30'
                                : item.whatsAppStatus === 'FAILED'
                                ? 'bg-rose-500/15 text-rose-300 border border-rose-500/30'
                                : 'bg-amber-500/15 text-amber-300 border border-amber-500/30'
                            }`}>
                              {item.whatsAppStatus}
                            </span>
                          </td>
                          <td className="py-3 font-mono">
                            <span className={`px-2 py-0.5 rounded text-[9px] font-bold ${
                              item.gmailStatus === 'SENT'
                                ? 'bg-cyan-500/15 text-cyan-300 border border-cyan-500/30'
                                : item.gmailStatus === 'FAILED'
                                ? 'bg-rose-500/15 text-rose-300 border border-rose-500/30'
                                : 'bg-amber-500/15 text-amber-300 border border-amber-500/30'
                            }`}>
                              {item.gmailStatus}
                            </span>
                          </td>
                          <td className="py-3 text-right font-mono">
                            <span className="px-2 py-0.5 rounded text-[9px] font-bold bg-emerald-500/20 text-emerald-300">
                              {item.syncStatus}
                            </span>
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Delete User Confirmation Modal */}
      {deleteTarget && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-4 backdrop-blur-md animate-in fade-in duration-150">
          <div className="w-full max-w-md rounded-3xl border border-rose-500/30 bg-[#0A0E17] p-6 shadow-2xl space-y-4">
            <div className="flex items-center gap-3">
              <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-rose-500/15 border border-rose-500/30 text-rose-400">
                <Trash2 className="h-5 w-5" />
              </div>
              <div>
                <h3 className="text-base font-bold text-white tracking-tight">Confirm Institutional Removal</h3>
                <p className="text-xs text-rose-300 font-mono">Irreversible Database Deletion</p>
              </div>
            </div>

            <p className="text-xs text-slate-300 leading-relaxed">
              Are you sure you want to permanently remove <strong className="text-white">{deleteTarget.name}</strong> from the institutional {deleteTarget.type.toLowerCase()} registry? Their assigned RFID credentials and records will be deleted.
            </p>

            <div className="flex items-center justify-end gap-2.5 pt-2">
              <button
                onClick={() => setDeleteTarget(null)}
                className="px-4 py-2 rounded-xl border border-white/10 hover:bg-white/10 text-slate-300 text-xs font-semibold transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={() => {
                  if (deleteTarget.type === 'STUDENT') deleteStudent(deleteTarget.id);
                  else if (deleteTarget.type === 'STAFF') deleteStaff(deleteTarget.id);
                  else if (deleteTarget.type === 'EMPLOYEE') deleteEmployee(deleteTarget.id);
                  else if (deleteTarget.type === 'CREDENTIAL') deleteCredential(deleteTarget.id);
                  setDeleteTarget(null);
                }}
                className="px-4 py-2 rounded-xl bg-rose-600 hover:bg-rose-500 text-white text-xs font-bold shadow-glow-rose transition-colors"
              >
                Delete Permanently
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* MODAL: REGISTER NEW STUDENT & ASSIGN RFID                                 */}
      {/* ========================================================================= */}
      {isAddStudentModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-fade-in">
          <div className="relative w-full max-w-lg p-6 rounded-2xl bg-gradient-to-b from-slate-900 to-slate-950 border border-violet-500/30 shadow-2xl shadow-violet-500/10 space-y-4 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between pb-3 border-b border-white/10">
              <div className="flex items-center gap-2.5">
                <div className="p-2 rounded-xl bg-violet-600/20 text-violet-400 border border-violet-500/30">
                  <UserPlus className="h-5 w-5" />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-white tracking-tight">Register New Student</h3>
                  <p className="text-[11px] text-slate-400">Syncs to Supabase & Google Sheets `Users` Tab</p>
                </div>
              </div>
              <button
                onClick={() => setIsAddStudentModalOpen(false)}
                className="p-1 rounded-lg hover:bg-white/10 text-slate-400 hover:text-white transition-colors"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            <div className="grid grid-cols-2 gap-3 text-xs">
              <div>
                <label className="block text-[11px] font-semibold text-slate-400 mb-1">Student ID *</label>
                <input
                  type="text"
                  placeholder="e.g. JIT001"
                  value={newStudentForm.studentId}
                  onChange={e => setNewStudentForm({ ...newStudentForm, studentId: e.target.value.toUpperCase() })}
                  className="w-full px-3 py-2 rounded-xl bg-black/40 border border-white/10 text-white font-mono placeholder:text-slate-600 focus:outline-none focus:border-violet-500"
                />
              </div>
              <div>
                <label className="block text-[11px] font-semibold text-slate-400 mb-1">Student Name *</label>
                <input
                  type="text"
                  placeholder="e.g. Jit Das"
                  value={newStudentForm.studentName}
                  onChange={e => setNewStudentForm({ ...newStudentForm, studentName: e.target.value })}
                  className="w-full px-3 py-2 rounded-xl bg-black/40 border border-white/10 text-white placeholder:text-slate-600 focus:outline-none focus:border-violet-500"
                />
              </div>

              <div>
                <label className="block text-[11px] font-semibold text-slate-400 mb-1">Class *</label>
                <input
                  type="text"
                  placeholder="e.g. 12"
                  value={newStudentForm.classGrade}
                  onChange={e => setNewStudentForm({ ...newStudentForm, classGrade: e.target.value })}
                  className="w-full px-3 py-2 rounded-xl bg-black/40 border border-white/10 text-white placeholder:text-slate-600 focus:outline-none focus:border-violet-500"
                />
              </div>
              <div>
                <label className="block text-[11px] font-semibold text-slate-400 mb-1">Section</label>
                <input
                  type="text"
                  placeholder="e.g. Science / A"
                  value={newStudentForm.section}
                  onChange={e => setNewStudentForm({ ...newStudentForm, section: e.target.value })}
                  className="w-full px-3 py-2 rounded-xl bg-black/40 border border-white/10 text-white placeholder:text-slate-600 focus:outline-none focus:border-violet-500"
                />
              </div>

              <div>
                <label className="block text-[11px] font-semibold text-slate-400 mb-1">Roll Number</label>
                <input
                  type="text"
                  placeholder="e.g. 10"
                  value={newStudentForm.rollNumber}
                  onChange={e => setNewStudentForm({ ...newStudentForm, rollNumber: e.target.value })}
                  className="w-full px-3 py-2 rounded-xl bg-black/40 border border-white/10 text-white font-mono placeholder:text-slate-600 focus:outline-none focus:border-violet-500"
                />
              </div>
              <div>
                <label className="block text-[11px] font-semibold text-slate-400 mb-1">RFID UID / Card ID *</label>
                <input
                  type="text"
                  placeholder="e.g. 04:A3:7B:92"
                  value={newStudentForm.rfidUid}
                  onChange={e => setNewStudentForm({ ...newStudentForm, rfidUid: e.target.value.toUpperCase() })}
                  className="w-full px-3 py-2 rounded-xl bg-black/40 border border-white/10 text-white font-mono placeholder:text-slate-600 focus:outline-none focus:border-violet-500"
                />
              </div>

              <div className="col-span-2">
                <label className="block text-[11px] font-semibold text-slate-400 mb-1">Parent / Guardian Name</label>
                <input
                  type="text"
                  placeholder="e.g. Amit Das"
                  value={newStudentForm.parentName}
                  onChange={e => setNewStudentForm({ ...newStudentForm, parentName: e.target.value })}
                  className="w-full px-3 py-2 rounded-xl bg-black/40 border border-white/10 text-white placeholder:text-slate-600 focus:outline-none focus:border-violet-500"
                />
              </div>

              <div>
                <label className="block text-[11px] font-semibold text-slate-400 mb-1">Parent Mobile (WhatsApp) *</label>
                <input
                  type="tel"
                  placeholder="e.g. +91 98765 43210"
                  value={newStudentForm.parentMobile}
                  onChange={e => setNewStudentForm({ ...newStudentForm, parentMobile: e.target.value })}
                  className="w-full px-3 py-2 rounded-xl bg-black/40 border border-white/10 text-white font-mono placeholder:text-slate-600 focus:outline-none focus:border-violet-500"
                />
              </div>
              <div>
                <label className="block text-[11px] font-semibold text-slate-400 mb-1">Parent Gmail / Email *</label>
                <input
                  type="email"
                  placeholder="e.g. parent@example.com"
                  value={newStudentForm.parentGmail}
                  onChange={e => setNewStudentForm({ ...newStudentForm, parentGmail: e.target.value })}
                  className="w-full px-3 py-2 rounded-xl bg-black/40 border border-white/10 text-white font-mono placeholder:text-slate-600 focus:outline-none focus:border-violet-500"
                />
              </div>
            </div>

            <div className="p-3 rounded-xl bg-violet-950/30 border border-violet-500/20 text-[11px] text-slate-300">
              <span className="font-semibold text-violet-300">Strict Read-Only Mandate:</span> All student information is saved ONLY in Supabase. It is never written or appended to the Google Sheet.
            </div>

            <div className="flex items-center justify-end gap-2.5 pt-2 border-t border-white/10">
              <button
                onClick={() => setIsAddStudentModalOpen(false)}
                className="px-4 py-2 rounded-xl border border-white/10 hover:bg-white/10 text-slate-300 text-xs font-semibold transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={async () => {
                  const studentName = newStudentForm.studentName.trim();
                  if (!studentName) {
                    addToast('Missing Required Field', 'Student Name is required.', 'WARNING');
                    return;
                  }
                  const studentId = newStudentForm.studentId.trim() || `PVM-${Date.now().toString().slice(-4)}`;
                  const rfidUid = newStudentForm.rfidUid.trim() || `RFID-${studentName.toUpperCase().replace(/[^A-Z0-9]/g, '').slice(0, 6)}-${Date.now().toString().slice(-2)}`;

                  const res = await registerNewStudent({
                    ...newStudentForm,
                    studentId,
                    studentName,
                    rfidUid
                  });
                  if (res.success) {
                    setIsAddStudentModalOpen(false);
                    setNewStudentForm({
                      studentId: '',
                      studentName: '',
                      classGrade: '12',
                      section: 'Science',
                      rollNumber: '',
                      rfidUid: '',
                      parentName: '',
                      parentMobile: '',
                      parentGmail: ''
                    });
                  }
                }}
                className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-violet-600 hover:bg-violet-500 text-white text-xs font-bold shadow-glow-violet transition-colors"
              >
                <Check className="h-4 w-4" />
                Register in Supabase
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* MODAL: EDIT STUDENT USER DETAILS (SAVED ONLY IN SUPABASE)                 */}
      {/* ========================================================================= */}
      {isEditModalOpen && editingStudent && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-fade-in">
          <div className="relative w-full max-w-lg p-6 rounded-2xl bg-gradient-to-b from-slate-900 to-slate-950 border border-cyan-500/30 shadow-2xl shadow-cyan-500/10 space-y-4 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between pb-3 border-b border-white/10">
              <div className="flex items-center gap-2.5">
                <div className="p-2 rounded-xl bg-cyan-600/20 text-cyan-400 border border-cyan-500/30">
                  <Wrench className="h-5 w-5" />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-white tracking-tight">Edit Student Record & Assignment</h3>
                  <p className="text-[11px] text-cyan-300 font-mono">ID: {editingStudent.admissionNo || editingStudent.id}</p>
                </div>
              </div>
              <button
                onClick={() => { setIsEditModalOpen(false); setEditingStudent(null); }}
                className="p-1 rounded-lg hover:bg-white/10 text-slate-400 hover:text-white transition-colors"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            <div className="grid grid-cols-2 gap-3 text-xs">
              <div>
                <label className="block text-[11px] font-semibold text-slate-400 mb-1">Student ID / Admission No *</label>
                <input
                  type="text"
                  placeholder="e.g. JIT001 / PVM101"
                  value={editingStudent.admissionNo || ''}
                  onChange={e => setEditingStudent({ ...editingStudent, admissionNo: e.target.value.toUpperCase() })}
                  className="w-full px-3 py-2 rounded-xl bg-black/40 border border-white/10 text-cyan-300 font-mono focus:outline-none focus:border-cyan-500"
                />
              </div>
              <div>
                <label className="block text-[11px] font-semibold text-slate-400 mb-1">Student Name *</label>
                <input
                  type="text"
                  value={editingStudent.name || ''}
                  onChange={e => setEditingStudent({ ...editingStudent, name: e.target.value })}
                  className="w-full px-3 py-2 rounded-xl bg-black/40 border border-white/10 text-white focus:outline-none focus:border-cyan-500"
                />
              </div>

              <div>
                <label className="block text-[11px] font-semibold text-slate-400 mb-1">Assigned RFID UID</label>
                <input
                  type="text"
                  placeholder="e.g. 04:A3:7B:92"
                  value={editingStudent.rfidUid || ''}
                  onChange={e => setEditingStudent({ ...editingStudent, rfidUid: e.target.value.toUpperCase() })}
                  className="w-full px-3 py-2 rounded-xl bg-black/40 border border-white/10 text-cyan-300 font-mono focus:outline-none focus:border-cyan-500"
                />
              </div>
              <div>
                <label className="block text-[11px] font-semibold text-slate-400 mb-1">Guardian / Parent Name</label>
                <input
                  type="text"
                  placeholder="e.g. Shri Amit Das"
                  value={editingStudent.parentName || ''}
                  onChange={e => setEditingStudent({ ...editingStudent, parentName: e.target.value })}
                  className="w-full px-3 py-2 rounded-xl bg-black/40 border border-white/10 text-white focus:outline-none focus:border-cyan-500"
                />
              </div>

              <div>
                <label className="block text-[11px] font-semibold text-slate-400 mb-1">Class</label>
                <input
                  type="text"
                  value={editingStudent.classGrade || ''}
                  onChange={e => setEditingStudent({ ...editingStudent, classGrade: e.target.value })}
                  className="w-full px-3 py-2 rounded-xl bg-black/40 border border-white/10 text-white focus:outline-none focus:border-cyan-500"
                />
              </div>
              <div>
                <label className="block text-[11px] font-semibold text-slate-400 mb-1">Section</label>
                <input
                  type="text"
                  value={editingStudent.section || ''}
                  onChange={e => setEditingStudent({ ...editingStudent, section: e.target.value })}
                  className="w-full px-3 py-2 rounded-xl bg-black/40 border border-white/10 text-white focus:outline-none focus:border-cyan-500"
                />
              </div>

              <div>
                <label className="block text-[11px] font-semibold text-slate-400 mb-1">Roll Number</label>
                <input
                  type="text"
                  value={editingStudent.rollNo || ''}
                  onChange={e => setEditingStudent({ ...editingStudent, rollNo: e.target.value })}
                  className="w-full px-3 py-2 rounded-xl bg-black/40 border border-white/10 text-white font-mono focus:outline-none focus:border-cyan-500"
                />
              </div>
              <div>
                <label className="block text-[11px] font-semibold text-slate-400 mb-1">Account Status</label>
                <select
                  value={editingStudent.status || 'ACTIVE'}
                  onChange={e => setEditingStudent({ ...editingStudent, status: e.target.value })}
                  className="w-full px-3 py-2 rounded-xl bg-black/40 border border-white/10 text-white focus:outline-none focus:border-cyan-500"
                >
                  <option value="ACTIVE">ACTIVE (Can scan & log in)</option>
                  <option value="SUSPENDED">SUSPENDED / INACTIVE</option>
                </select>
              </div>

              <div>
                <label className="block text-[11px] font-semibold text-slate-400 mb-1">Parent Mobile (WhatsApp)</label>
                <input
                  type="tel"
                  placeholder="e.g. +91 93658 07527"
                  value={editingStudent.parentPhone || ''}
                  onChange={e => setEditingStudent({ ...editingStudent, parentPhone: e.target.value })}
                  className="w-full px-3 py-2 rounded-xl bg-black/40 border border-white/10 text-white font-mono focus:outline-none focus:border-cyan-500"
                />
              </div>
              <div>
                <label className="block text-[11px] font-semibold text-slate-400 mb-1">Parent Gmail / Email</label>
                <input
                  type="email"
                  placeholder="e.g. parent@gmail.com"
                  value={editingStudent.parentEmail || ''}
                  onChange={e => setEditingStudent({ ...editingStudent, parentEmail: e.target.value })}
                  className="w-full px-3 py-2 rounded-xl bg-black/40 border border-white/10 text-white font-mono focus:outline-none focus:border-cyan-500"
                />
              </div>
            </div>

            <div className="p-3 rounded-xl bg-cyan-950/30 border border-cyan-500/20 text-[11px] text-slate-300">
              <span className="font-semibold text-cyan-300">Supabase Exclusive:</span> Updates are persisted solely in Supabase. Google Sheets is never modified.
            </div>

            <div className="flex items-center justify-end gap-2.5 pt-2 border-t border-white/10">
              <button
                onClick={() => { setIsEditModalOpen(false); setEditingStudent(null); }}
                className="px-4 py-2 rounded-xl border border-white/10 hover:bg-white/10 text-slate-300 text-xs font-semibold transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={async () => {
                  const res = await editStudent(editingStudent.id, {
                    ...editingStudent,
                    studentId: editingStudent.admissionNo,
                    admissionNo: editingStudent.admissionNo,
                    studentName: editingStudent.name,
                    parentName: editingStudent.parentName,
                    parentMobile: editingStudent.parentPhone,
                    parentGmail: editingStudent.parentEmail,
                    rfidUid: editingStudent.rfidUid,
                    classGrade: editingStudent.classGrade,
                    section: editingStudent.section,
                    rollNumber: editingStudent.rollNo,
                    rollNo: editingStudent.rollNo,
                    active: editingStudent.status === 'ACTIVE'
                  });
                  if (res.success) {
                    setIsEditModalOpen(false);
                    setEditingStudent(null);
                  }
                }}
                className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-cyan-500 hover:bg-cyan-400 text-black text-xs font-bold shadow-glow-cyan transition-colors"
              >
                <Save className="h-4 w-4" />
                Save to Supabase
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* MODAL: DIRECT ASSIGN RFID UID TO STUDENT                                  */}
      {/* ========================================================================= */}
      {rfidAssignTarget && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-fade-in">
          <div className="relative w-full max-w-md p-6 rounded-2xl bg-gradient-to-b from-slate-900 to-slate-950 border border-cyan-500/30 shadow-2xl shadow-cyan-500/10 space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-white/10">
              <div className="flex items-center gap-2.5">
                <div className="p-2 rounded-xl bg-cyan-600/20 text-cyan-400 border border-cyan-500/30">
                  <Radio className="h-5 w-5" />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-white tracking-tight">Assign RFID Card</h3>
                  <p className="text-[11px] text-cyan-300 font-mono">{rfidAssignTarget.name}</p>
                </div>
              </div>
              <button
                onClick={() => setRfidAssignTarget(null)}
                className="p-1 rounded-lg hover:bg-white/10 text-slate-400 hover:text-white transition-colors"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            <p className="text-xs text-slate-300 leading-relaxed">
              Enter the hexadecimal card UID (e.g. <span className="font-mono text-cyan-300">04:A3:7B:92</span>). The card UID will be validated to ensure it is not already assigned to another active student.
            </p>

            <div>
              <label className="block text-[11px] font-semibold text-slate-400 mb-1.5">New RFID UID</label>
              <input
                type="text"
                placeholder="e.g. 04:A3:7B:92"
                value={rfidInputVal}
                onChange={e => setRfidInputVal(e.target.value.toUpperCase())}
                className="w-full px-3 py-2 rounded-xl bg-black/50 border border-white/10 text-white font-mono text-xs focus:outline-none focus:border-cyan-500"
              />
            </div>

            <div className="flex items-center justify-end gap-2.5 pt-2 border-t border-white/10">
              <button
                onClick={() => setRfidAssignTarget(null)}
                className="px-4 py-2 rounded-xl border border-white/10 hover:bg-white/10 text-slate-300 text-xs font-semibold transition-colors"
              >
                Cancel
              </button>
              <button
                disabled={!rfidInputVal.trim()}
                onClick={async () => {
                  const res = await assignRfidToStudent(rfidAssignTarget.id, rfidInputVal.trim());
                  if (res.success) {
                    setRfidAssignTarget(null);
                    setRfidInputVal('');
                  }
                }}
                className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-cyan-500 hover:bg-cyan-400 disabled:opacity-50 text-black text-xs font-bold shadow-glow-cyan transition-colors"
              >
                <Check className="h-4 w-4" />
                Assign Card
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* MODAL: QUICK ASSIGN UNKNOWN RFID TO REGISTERED STUDENT                   */}
      {/* ========================================================================= */}
      {assignModalData && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-fade-in">
          <div className="relative w-full max-w-md p-6 rounded-2xl bg-gradient-to-b from-slate-900 to-slate-950 border border-amber-500/30 shadow-2xl shadow-amber-500/10 space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-white/10">
              <div className="flex items-center gap-2.5">
                <div className="p-2 rounded-xl bg-amber-500/20 text-amber-400 border border-amber-500/30">
                  <Radio className="h-5 w-5" />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-white tracking-tight">Assign Unknown Card UID</h3>
                  <p className="text-[11px] text-amber-400 font-mono">Card: {assignModalData.rfid}</p>
                </div>
              </div>
              <button
                onClick={() => setAssignModalData(null)}
                className="p-1 rounded-lg hover:bg-white/10 text-slate-400 hover:text-white transition-colors"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            <p className="text-xs text-slate-300 leading-relaxed">
              Select an active student to pair with RFID UID <span className="px-1.5 py-0.5 rounded bg-black/60 font-mono text-amber-300 border border-amber-500/20">{assignModalData.rfid}</span>. This will immediately update Supabase (Google Sheets remains untouched).
            </p>

            <div>
              <label className="block text-[11px] font-semibold text-slate-400 mb-1.5">Select Target Student</label>
              <select
                value={assignModalData.targetStudentId}
                onChange={e => setAssignModalData({ ...assignModalData, targetStudentId: e.target.value })}
                className="w-full px-3 py-2.5 rounded-xl bg-black/50 border border-white/10 text-white text-xs font-medium focus:outline-none focus:border-amber-500"
              >
                <option value="" disabled>Choose a student from roster...</option>
                {students.map(s => (
                  <option key={s.id} value={s.admissionNo || s.id}>
                    {s.name} ({s.admissionNo || s.id}) — Class {s.classGrade}-{s.section} [Current UID: {s.rfidUid || 'None'}]
                  </option>
                ))}
              </select>
            </div>

            <div className="flex items-center justify-end gap-2.5 pt-2 border-t border-white/10">
              <button
                onClick={() => setAssignModalData(null)}
                className="px-4 py-2 rounded-xl border border-white/10 hover:bg-white/10 text-slate-300 text-xs font-semibold transition-colors"
              >
                Cancel
              </button>
              <button
                disabled={!assignModalData.targetStudentId}
                onClick={async () => {
                  if (!assignModalData.targetStudentId) return;
                  const res = await assignRfidToStudent(assignModalData.targetStudentId, assignModalData.rfid);
                  if (res.success) {
                    setAssignModalData(null);
                  }
                }}
                className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-amber-600 hover:bg-amber-500 disabled:opacity-50 text-white text-xs font-bold shadow-glow-amber transition-colors"
              >
                <Check className="h-4 w-4" />
                Assign in Supabase
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* REALTIME ATTENDANCE SYNC POPOUT LOG (SIDE NOTIFICATION)                  */}
      {/* ========================================================================= */}
      {liveSyncPopout && (
        <aside
          aria-label="Live Attendance Sync Popout"
          className={`fixed bottom-6 right-6 z-50 max-w-md w-full pointer-events-auto transition-all duration-300 ${isPopoutLeaving ? 'opacity-0 translate-y-4 scale-95 pointer-events-none' : 'opacity-100 translate-y-0 scale-100 animate-in slide-in-from-bottom-5 fade-in duration-300'}`}
        >
          <div className="relative overflow-hidden rounded-2xl border border-emerald-500/50 bg-gradient-to-br from-slate-900 via-[#071311] to-black p-4 text-white shadow-2xl shadow-emerald-500/25 backdrop-blur-xl">
            {/* 3-Second Ambient radiant countdown header */}
            <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-emerald-500 via-teal-400 to-cyan-400 animate-pulse" />

            <div className="flex items-start justify-between gap-3">
              <div className="flex items-center gap-2">
                <span className="relative flex h-3 w-3">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-3 w-3 bg-emerald-500"></span>
                </span>
                <span className="text-[11px] font-mono font-bold tracking-wider text-emerald-400 uppercase">
                  Sheet Attendance Synced {liveSyncPopout.totalSynced ? `(${liveSyncPopout.totalSynced} Students)` : ''}
                </span>
              </div>
              <div className="flex items-center gap-1.5">
                <span className="text-[10px] font-mono text-slate-400 bg-white/5 px-1.5 py-0.5 rounded">Auto-dismiss 3s</span>
                <button
                  onClick={handleDismissPopoutNow}
                  className="text-slate-400 hover:text-white p-1 rounded-lg hover:bg-white/10 transition-colors"
                  title="Dismiss Alert"
                >
                  <X className="h-4 w-4" />
                </button>
              </div>
            </div>

            {liveSyncPopout.syncedStudents && liveSyncPopout.syncedStudents.length > 1 ? (
              /* Multi-Student Sync Notification View */
              <div className="mt-2.5 space-y-2">
                <p className="text-xs font-semibold text-slate-200">
                  From sheet (<span className="text-emerald-300 font-mono">{liveSyncPopout.tabName}</span>) attendance data:{' '}
                  <strong className="text-emerald-400 font-bold">{liveSyncPopout.syncedStudents.length} Students</strong> synced as <span className="text-emerald-400 font-bold">PRESENT</span>.
                </p>
                <div className="max-h-36 overflow-y-auto space-y-1 pr-1 divide-y divide-white/[0.04]">
                  {liveSyncPopout.syncedStudents.map((st, idx) => (
                    <div
                      key={idx}
                      className="flex items-center justify-between py-1 px-1.5 rounded-lg hover:bg-white/[0.03] text-[11px]"
                    >
                      <div className="flex items-center gap-1.5">
                        <span className="font-semibold text-white">{st.name}</span>
                        <span className="text-[10px] text-cyan-300 font-mono">({st.studentId})</span>
                      </div>
                      <div className="flex items-center gap-2 font-mono text-[10px]">
                        <span className="text-slate-400">{st.time}</span>
                        <span className="px-1.5 py-0.2 rounded bg-emerald-500/20 text-emerald-300 font-bold">
                          ✓ PRESENT
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ) : (
              /* Single Student Notification View */
              <div className="mt-2.5">
                <p className="text-xs font-semibold text-slate-200 leading-relaxed">
                  From sheet (<span className="text-emerald-300 font-mono">{liveSyncPopout.tabName}</span>) attendance data:{' '}
                  <span className="text-white font-bold underline decoration-emerald-500/50">
                    {liveSyncPopout.studentName}
                  </span>{' '}
                  is <span className="text-emerald-400 font-bold">PRESENT</span> synced from the sheet.
                </p>

                <div className="mt-2.5 flex flex-wrap items-center gap-2 text-[10px] font-mono text-slate-300">
                  <span className="rounded-md bg-emerald-500/15 px-2 py-0.5 border border-emerald-500/30 text-emerald-300 font-semibold">
                    Check-in: {liveSyncPopout.checkInTime}
                  </span>
                  <span className="rounded-md bg-white/[0.06] px-2 py-0.5 border border-white/[0.08] text-cyan-300">
                    ID: {liveSyncPopout.studentId}
                  </span>
                  <span className="rounded-md bg-white/[0.06] px-2 py-0.5 border border-white/[0.08] text-amber-300">
                    Class {liveSyncPopout.classGrade}-{liveSyncPopout.section}
                  </span>
                </div>
              </div>
            )}

            <div className="mt-3 pt-2 border-t border-white/[0.08] flex items-center justify-between text-[10px]">
              <span className="text-slate-500 font-mono">Auto-synced at {liveSyncPopout.timestamp}</span>
              <button
                onClick={() => {
                  setActiveAdminTab('SYNC_LOGS');
                  dismissLiveSyncPopout();
                }}
                className="font-bold text-emerald-400 hover:text-emerald-300 transition-colors flex items-center gap-1"
              >
                <span>View Full Log</span>
                <span>→</span>
              </button>
            </div>
          </div>
        </aside>
      )}
    </div>
  );
};
