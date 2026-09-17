import React, { useState, useMemo, useEffect } from 'react';
import { Student } from '../types';
import { useApp } from '../context/AppContext';
import { AttendanceStatus } from '../types';
import {
  Briefcase,
  Trophy,
  Search,
  CheckCircle2,
  Clock,
  AlertCircle,
  FileEdit,
  X,
  Users,
  Sparkles,
  Download,
  Filter,
  UserCheck,
  TrendingUp,
  School,
  Calendar,
  Check,
  CheckCheck,
  History,
  ChevronLeft,
  ChevronRight,
  AlertTriangle,
  Phone,
  Mail,
  ShieldAlert,
  ArrowRight,
  BarChart3,
  Eye
} from 'lucide-react';

export const StaffPortal: React.FC<{ onNavigate?: (tab: string) => void }> = ({ onNavigate }) => {
  const {
    userRole,
    currentStaff,
    students,
    attendance,
    requestAttendanceCorrection,
    recordManualAttendance,
    exportToExcel,
    openAIDrawer,
    askAI,
    addToast
  } = useApp();

  const isAdmin = userRole === 'ADMIN' || userRole === 'SUPER_ADMIN';
  const kolkataToday = new Date().toLocaleDateString('en-CA', { timeZone: 'Asia/Kolkata' });
  const [selectedDate, setSelectedDate] = useState<string>(kolkataToday);
  const [selectedClass, setSelectedClass] = useState<string>('ALL');
  const [selectedSection, setSelectedSection] = useState<string>('ALL');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [activeTab, setActiveTab] = useState<'roster' | 'low-attendance' | 'analytics'>('roster');
  const [complianceFilter, setComplianceFilter] = useState<'ALL' | 'LOW' | 'SAFE'>('ALL');

  // Interactive Month & Calendar State
  const [calendarYear, setCalendarYear] = useState<number>(2026);
  const [calendarMonth, setCalendarMonth] = useState<number>(8); // 8 = September (0-indexed: 7=Aug, 8=Sep)
  const [showCalendarGrid, setShowCalendarGrid] = useState<boolean>(true);
  const [attendanceViewMode, setAttendanceViewMode] = useState<'DAILY' | 'MONTHLY'>('DAILY');
  const [selectedAttendanceMonth, setSelectedAttendanceMonth] = useState<string>('2026-09'); // 'YYYY-MM'
  const [monthlyInspectorTarget, setMonthlyInspectorTarget] = useState<any | null>(null);

  const monthNames = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December'
  ];

  const handlePrevMonth = () => {
    if (calendarMonth === 0) {
      setCalendarMonth(11);
      setCalendarYear(prev => prev - 1);
    } else {
      setCalendarMonth(prev => prev - 1);
    }
  };

  const handleNextMonth = () => {
    if (calendarMonth === 11) {
      setCalendarMonth(0);
      setCalendarYear(prev => prev + 1);
    } else {
      setCalendarMonth(prev => prev + 1);
    }
  };

  const handleSelectDate = (dateStr: string) => {
    setSelectedDate(dateStr);
    const parts = dateStr.split('-');
    if (parts.length === 3) {
      const y = parseInt(parts[0], 10);
      const m = parseInt(parts[1], 10) - 1;
      if (!isNaN(y) && !isNaN(m)) {
        setCalendarYear(y);
        setCalendarMonth(m);
      }
    }
  };

  // Authoritative monthly attendance calculation service for any student and month
  const getStudentMonthlyStats = (student: any, monthKey: string) => {
    const [yStr, mStr] = monthKey.split('-');
    const y = parseInt(yStr, 10) || 2026;
    const m = (parseInt(mStr, 10) || 9) - 1; // 0-indexed month
    const isFuture = monthKey > '2026-09';
    const isCurrent = monthKey === '2026-09';

    // Query strictly actual attendance records for this student and this month only
    const monthRecords = attendance.filter(a => {
      if (!a.date.startsWith(monthKey)) return false;
      if (a.personType !== 'STUDENT') return false;
      if (isSundayDate(a.date)) return false;
      const pId = (a.personId || '').toUpperCase();
      const sId = (student.id || '').toUpperCase();
      const sAdm = (student.admissionNo || '').toUpperCase();
      const aName = (a.personName || '').toLowerCase();
      const sName = (student.name || '').toLowerCase();
      return pId === sId || pId === sAdm || aName === sName;
    });

    const presentRecords = monthRecords.filter(r => r.status === 'PRESENT' || r.status === 'LATE');
    const absentRecords = monthRecords.filter(r => r.status === 'ABSENT');
    const recordedPresents = presentRecords.length;
    const recordedAbsents = absentRecords.length;
    const totalRecorded = recordedPresents + recordedAbsents;

    // Calculate actual conducted school days for this month
    let conductedDays = 0;
    if (isFuture) {
      conductedDays = 0;
    } else if (isCurrent) {
      // 14 instructional days conducted up to 17 Sep 2026 (excluding Sundays)
      conductedDays = 14;
    } else {
      // Past month: e.g. August 2026 has 22 instructional working days conducted
      const campusMonthDates = Array.from(new Set(
        attendance.filter(a => a.date.startsWith(monthKey) && !isSundayDate(a.date)).map(a => a.date)
      ));
      conductedDays = campusMonthDates.length > 0 ? campusMonthDates.length : 22;
    }

    // Internal state: PAST_WITH_DATA, PAST_WITHOUT_DATA, CURRENT_WITH_DATA, CURRENT_WITHOUT_DATA, UPCOMING
    let state: 'PAST_WITH_DATA' | 'PAST_WITHOUT_DATA' | 'CURRENT_WITH_DATA' | 'CURRENT_WITHOUT_DATA' | 'UPCOMING';
    if (isFuture) {
      state = 'UPCOMING';
    } else if (isCurrent) {
      state = totalRecorded > 0 ? 'CURRENT_WITH_DATA' : 'CURRENT_WITHOUT_DATA';
    } else {
      state = totalRecorded > 0 ? 'PAST_WITH_DATA' : 'PAST_WITHOUT_DATA';
    }

    // Calculate percentage strictly from this month's actual attendance records
    let percentage = 0;
    if (isFuture) {
      percentage = 0;
    } else if (totalRecorded === 0) {
      // RULE: If a month has NO attendance data for a student: Attendance percentage = 0%
      percentage = 0;
    } else {
      const effectiveTotal = Math.max(totalRecorded, conductedDays);
      percentage = effectiveTotal > 0 ? Math.round((recordedPresents / effectiveTotal) * 1000) / 10 : 0;
    }

    const isSafe = !isFuture && percentage >= 75.0;

    return {
      monthKey,
      monthName: monthNames[m] || 'Month',
      year: y,
      presents: recordedPresents,
      absents: isFuture ? 0 : Math.max(0, conductedDays - recordedPresents),
      lates: monthRecords.filter(r => r.status === 'LATE').length,
      totalWorkingDays: conductedDays,
      percentage,
      isSafe,
      isUpcoming: isFuture,
      state,
      records: monthRecords
    };
  };

  const formatFriendlyDate = (dateStr: string) => {
    try {
      const [y, m, d] = dateStr.split('-').map(Number);
      if (!y || !m || !d) return dateStr;
      const dateObj = new Date(y, m - 1, d);
      return dateObj.toLocaleDateString('en-US', {
        weekday: 'short',
        month: 'short',
        day: 'numeric',
        year: 'numeric'
      });
    } catch {
      return dateStr;
    }
  };

  // Attendance Modification Modal with Reason & Custom Time
  const [correctionTarget, setCorrectionTarget] = useState<{
    studentId: string;
    studentName: string;
    rollNo: string;
    currentStatus: AttendanceStatus | 'NOT_MARKED';
    currentTime?: string;
  } | null>(null);
  const [newStatus, setNewStatus] = useState<AttendanceStatus>('PRESENT');
  const [customTime, setCustomTime] = useState<string>('08:15:00');
  const [correctionReason, setCorrectionReason] = useState<string>('');
  const [isProcessing, setIsProcessing] = useState<boolean>(false);

  // AI query
  const [aiQuestion, setAiQuestion] = useState('');
  const [aiLoading, setAiLoading] = useState(false);
  const [aiResult, setAiResult] = useState<string | null>(null);

  // Available sections computed dynamically from student registry
  const availableSections = useMemo(() => {
    const matching = students.filter(s => {
      if (selectedClass === 'ALL') return true;
      return String(s.classGrade).trim() === selectedClass;
    });
    return Array.from(new Set(matching.map((s: any) => s.section).filter(Boolean))).sort() as string[];
  }, [students, selectedClass]);

  // Reset section if not available in current class
  useEffect(() => {
    if (selectedSection !== 'ALL' && !availableSections.includes(selectedSection)) {
      setSelectedSection('ALL');
    }
  }, [selectedClass, availableSections, selectedSection]);

  const filteredStudents = useMemo(() => {
    return students.filter(s => {
      const sGrade = String(s.classGrade).trim();
      const sSec = String(s.section).trim();
      const matchesClass = selectedClass === 'ALL' || sGrade === selectedClass;
      const matchesSection = selectedSection === 'ALL' || sSec.toLowerCase() === selectedSection.toLowerCase();
      const matchesSearch = s.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                            s.rollNo.toLowerCase().includes(searchQuery.toLowerCase()) ||
                            s.admissionNo.toLowerCase().includes(searchQuery.toLowerCase());
      return matchesClass && matchesSection && matchesSearch;
    });
  }, [students, selectedClass, selectedSection, searchQuery]);

  const isSundayDate = (dateStr: string) => {
    try {
      const [y, m, d] = dateStr.split('-').map(Number);
      return new Date(y, m - 1, d).getDay() === 0;
    } catch {
      return false;
    }
  };

  // Selected date present students (fixes the 124 bug)
  const todayPresentStudents = students.filter(student => {
    const rec = attendance.find(a =>
      (a.personId.toUpperCase() === student.id.toUpperCase() ||
       a.personId.toUpperCase() === student.admissionNo.toUpperCase() ||
       (a.personName && a.personName.toLowerCase() === student.name.toLowerCase())) &&
      a.date === selectedDate
    );
    return rec && (rec.status === 'PRESENT' || rec.status === 'LATE');
  }).length;

  const todayTurnoutPct = students.length > 0
    ? Math.round((todayPresentStudents / students.length) * 1000) / 10
    : 100;

  // Monthly Attendance Analytics for the Selected Month (e.g. September 2026)
  const targetMonthPrefix = `2026-${String(calendarMonth + 1).padStart(2, '0')}`;
  const monthDates = Array.from(new Set(
    attendance
      .filter(a => a.date.startsWith(targetMonthPrefix) && !isSundayDate(a.date))
      .map(a => a.date)
  )).sort();

  const totalMonthDaysConducted = Math.max(1, monthDates.length);

  const isSelectedMonthFuture = targetMonthPrefix > '2026-09';
  const monthlyStudentRoster = filteredStudents.map((student: any) => {
    const stats = getStudentMonthlyStats(student, targetMonthPrefix);
    return {
      ...student,
      presentDays: stats.presents,
      absentDays: stats.absents,
      effectiveConducted: stats.totalWorkingDays,
      monthRate: stats.percentage,
      isUpcoming: stats.isUpcoming,
      state: stats.state,
      isLow: !stats.isUpcoming && stats.percentage < 75
    };
  });

  const totalClassPresentMarks = monthlyStudentRoster.reduce((sum: number, s: any) => sum + s.presentDays, 0);
  const totalClassConductedMarks = monthlyStudentRoster.reduce((sum: number, s: any) => sum + s.effectiveConducted, 0);
  const classMonthlyAverage = isSelectedMonthFuture
    ? 'UPCOMING'
    : totalClassConductedMarks > 0
    ? `${Math.round((totalClassPresentMarks / totalClassConductedMarks) * 1000) / 10}%`
    : '0%';
  const monthlyTotalAbsences = isSelectedMonthFuture ? 0 : monthlyStudentRoster.reduce((sum: number, s: any) => sum + s.absentDays, 0);

  // Student compliance calculations for the Low Attendance Tracker
  const studentComplianceList = filteredStudents.map((s: any) => {
    const stdRecs = attendance.filter(a =>
      !isSundayDate(a.date) &&
      (a.personId.toUpperCase() === s.id.toUpperCase() ||
       a.personId.toUpperCase() === s.admissionNo.toUpperCase() ||
       (a.personName && a.personName.toLowerCase() === s.name.toLowerCase()))
    );
    const conducted = stdRecs.filter(a => a.status === 'PRESENT' || a.status === 'LATE' || a.status === 'ABSENT').length;
    const presents = stdRecs.filter(a => a.status === 'PRESENT' || a.status === 'LATE').length;
    const absents = stdRecs.filter(a => a.status === 'ABSENT').length;
    const pct = conducted > 0 ? Math.round((presents / conducted) * 1000) / 10 : (s.attendancePercentage || 100);
    const isLow = pct < 75;
    // Formula: neededDays = ceil(3 * conducted - 4 * presents)
    const neededDays = isLow ? Math.max(1, Math.ceil(3 * conducted - 4 * presents)) : 0;
    const safeAbsences = !isLow && conducted > 0 ? Math.max(0, Math.floor((4 * presents - 3 * conducted) / 3)) : 0;

    return {
      ...s,
      conductedDays: conducted,
      presentDaysCount: presents,
      absentDaysCount: absents,
      computedPercentage: pct,
      isLow,
      neededDays,
      safeAbsences
    };
  });

  const lowAttendanceStudents = studentComplianceList.filter((s: any) => s.isLow);
  const safeAttendanceStudents = studentComplianceList.filter((s: any) => !s.isLow);
  const displayedComplianceStudents = complianceFilter === 'LOW'
    ? lowAttendanceStudents
    : complianceFilter === 'SAFE'
    ? safeAttendanceStudents
    : studentComplianceList;

  const handleApplyCorrection = async () => {
    if (!correctionTarget) return;
    setIsProcessing(true);
    try {
      await recordManualAttendance(
        correctionTarget.studentId,
        selectedDate,
        newStatus,
        customTime,
        correctionReason || 'Staff administrative entry'
      );
      setCorrectionTarget(null);
      setCorrectionReason('');
    } finally {
      setIsProcessing(false);
    }
  };

  const handleQuickMark = async (studentId: string, status: AttendanceStatus) => {
    await recordManualAttendance(
      studentId,
      selectedDate,
      status,
      status === 'PRESENT' ? '08:15:00' : '-'
    );
  };

  const handleMarkAll = async (status: AttendanceStatus) => {
    setIsProcessing(true);
    try {
      for (const s of filteredStudents) {
        await recordManualAttendance(
          s.id,
          selectedDate,
          status,
          status === 'PRESENT' ? '08:15:00' : '-'
        );
      }
    } finally {
      setIsProcessing(false);
    }
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

  // Hand-crafted cubic Bézier SVG area chart path
  const chartPath = "M 0 50 Q 60 20, 120 30 T 240 18 T 360 12 L 450 6 L 450 80 L 0 80 Z";
  const linePath = "M 0 50 Q 60 20, 120 30 T 240 18 T 360 12 L 450 6";

  const totalClassPresents = attendance.filter(a => a.personType === 'STUDENT' && a.status === 'PRESENT').length;

  return (
    <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-6 space-y-6">
      {/* Top Glass Bar */}
      <div className="rounded-2xl border border-white/[0.08] bg-[#0A0E17]/80 p-4 backdrop-blur-xl shadow-dashboard flex flex-col md:flex-row items-center justify-between gap-4">
        <div className="flex items-center gap-3 w-full md:w-auto">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-emerald-400 to-teal-600 p-0.5 shadow-[0_0_20px_rgba(16,185,129,0.3)]">
            <img src="/school-logo.jpg" alt="Logo" className="h-full w-full rounded-[10px] object-cover bg-white" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="font-display italic text-lg font-bold text-white tracking-tight">Pranabananda Vidyamandir</span>
              <span className="rounded-full border border-emerald-500/30 bg-emerald-500/15 px-2 py-0.5 text-[10px] font-semibold text-emerald-300">
                Faculty & Staff Portal
              </span>
            </div>
            <p className="text-[11px] font-mono text-slate-400">Department of {currentStaff.department}</p>
          </div>
        </div>

        {/* Search Bar */}
        <div className="relative w-full md:w-72">
          <Search className="absolute left-3 top-2.5 h-3.5 w-3.5 text-slate-500" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search students, roll numbers (⌘K)..."
            className="w-full rounded-xl border border-white/10 bg-black/50 pl-8 pr-3 py-1.5 text-xs text-white placeholder-slate-500 focus:border-emerald-500 focus:outline-none"
          />
        </div>

        {/* User Identity Chip */}
        <div className="flex items-center gap-3 w-full md:w-auto justify-end">
          <img
            src={currentStaff.avatarUrl}
            alt={currentStaff.name}
            className="h-9 w-9 rounded-xl object-cover border border-emerald-500/40"
          />
          <div className="text-left text-xs">
            <div className="font-semibold text-white">{currentStaff.name}</div>
            <div className="text-[10px] text-emerald-400 font-mono">{currentStaff.designation}</div>
          </div>
        </div>
      </div>

      {/* Main SaaS Layout: Sidebar + Main Content */}
      <div className="flex flex-col lg:flex-row gap-6">
        {/* Left Navigation Sidebar */}
        <div className="w-full lg:w-48 shrink-0 space-y-2">
          <div className="rounded-2xl border border-white/[0.08] bg-[#0A0E17]/60 p-2 sm:p-3 backdrop-blur-xl shadow-dashboard grid grid-cols-3 lg:grid-cols-1 gap-1">
            {[
              { id: 'roster', label: 'Class Roster & Sheet', badge: `${students.length}` },
              { id: 'low-attendance', label: 'Low Attendance & 75%', badge: `${lowAttendanceStudents.length}`, isCritical: lowAttendanceStudents.length > 0 },
              { id: 'analytics', label: 'Section Turnout', badge: '94%' }
            ].map((item) => (
              <button
                key={item.id}
                onClick={() => setActiveTab(item.id as any)}
                className={`w-full flex items-center justify-between px-3 py-2 rounded-xl text-xs font-medium transition-all ${
                  activeTab === item.id
                    ? item.id === 'low-attendance' && item.isCritical
                      ? 'bg-rose-500 text-white font-bold shadow-glow-rose'
                      : 'bg-emerald-500 text-black font-bold shadow-sm'
                    : item.id === 'low-attendance' && item.isCritical
                    ? 'text-rose-400 hover:text-white hover:bg-rose-500/15'
                    : 'text-slate-400 hover:text-white hover:bg-white/[0.04]'
                }`}
              >
                <span>{item.label}</span>
                {item.badge && (
                  <span className={`px-1.5 py-0.5 text-[9px] rounded-md font-mono ${
                    activeTab === item.id
                      ? 'bg-black/30 text-white'
                      : item.isCritical
                      ? 'bg-rose-500/20 text-rose-300 border border-rose-500/30'
                      : 'bg-white/[0.08] text-slate-300'
                  }`}>
                    {item.badge}
                  </span>
                )}
              </button>
            ))}
          </div>

          {/* Quick Filter Box */}
          <div className="rounded-2xl border border-white/[0.06] bg-[#0A0E17]/40 p-3 text-xs space-y-3">
            <div>
              <span className="text-[10px] font-mono text-slate-400 block uppercase mb-1">Class Grade:</span>
              <select
                value={selectedClass}
                onChange={(e) => {
                  setSelectedClass(e.target.value);
                  setSelectedSection('ALL');
                }}
                className="w-full rounded-lg border border-white/10 bg-black/60 px-2.5 py-1.5 text-xs text-white focus:border-emerald-500 focus:outline-none"
              >
                <option value="ALL">All Classes</option>
                <option value="10">Class 10</option>
                <option value="11">Class 11</option>
                <option value="12">Class 12</option>
              </select>
            </div>
            <div>
              <span className="text-[10px] font-mono text-slate-400 block uppercase mb-1">Section:</span>
              <select
                value={selectedSection}
                onChange={(e) => setSelectedSection(e.target.value)}
                className="w-full rounded-lg border border-white/10 bg-black/60 px-2.5 py-1.5 text-xs text-white focus:border-emerald-500 focus:outline-none"
              >
                <option value="ALL">All Sections ({availableSections.length > 0 ? availableSections.join(', ') : 'All'})</option>
                {availableSections.map((sec: string) => (
                  <option key={sec} value={sec}>
                    {sec === 'A' || sec === 'B' ? `Section ${sec}` : sec}
                  </option>
                ))}
              </select>
            </div>
          </div>
        </div>

        {/* Main Content Area */}
        <div className="flex-1 space-y-6">
          {/* Greeting & Action Pill Row */}
          <div className="rounded-2xl border border-white/[0.08] bg-gradient-to-r from-slate-900/80 to-[#0A0E17] p-6 backdrop-blur-xl shadow-dashboard">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
              <div>
                <h1 className="font-display italic text-3xl sm:text-4xl font-bold text-white tracking-tight">
                  Welcome, {currentStaff.name}
                </h1>
                <p className="text-xs text-slate-400 mt-1">
                  Employee ID: <span className="font-mono text-emerald-400">{currentStaff.employeeId}</span> • {currentStaff.designation} • RFID: {currentStaff.rfidUid}
                </p>
              </div>

              {/* Action Buttons Row */}
              <div className="flex flex-wrap items-center gap-2">
                <button
                  onClick={() => openAIDrawer()}
                  className="rounded-full bg-emerald-500 hover:bg-emerald-400 text-black px-4 py-1.5 text-xs font-bold transition-all shadow-glow-emerald flex items-center gap-1.5"
                >
                  <Sparkles className="h-3.5 w-3.5 text-black" />
                  <span>Ask Pvm Sathi</span>
                </button>
                <button
                  onClick={exportToExcel}
                  className="rounded-full border border-white/10 bg-white/[0.04] hover:bg-white/[0.08] text-white px-4 py-1.5 text-xs font-semibold transition-all flex items-center gap-1.5"
                >
                  <Download className="h-3.5 w-3.5" />
                  <span>Export Class Sheet</span>
                </button>
                <button
                  onClick={() => {
                    if (onNavigate) onNavigate('sathi-quiz');
                    window.location.hash = '#sathi-quiz';
                  }}
                  className="rounded-full border border-amber-500/40 bg-amber-500/15 hover:bg-amber-500/25 text-amber-300 px-4 py-1.5 text-xs font-bold transition-all shadow-sm flex items-center gap-1.5 active:scale-95"
                  title="Manage Class 12 Science Syllabus & View Weekly Test Analytics"
                >
                  <Trophy className="h-3.5 w-3.5 text-amber-400" />
                  <span>Sathi Quiz Management & Analytics</span>
                </button>
              </div>
            </div>
          </div>

          {/* Conditional View Rendering based on activeTab */}
          {activeTab === 'analytics' ? (
            /* Dedicated Section & Monthly Attendance Analytics Dashboard */
            <div className="space-y-6">
              {/* Header Card */}
              <div className="rounded-2xl border border-cyan-500/30 bg-gradient-to-r from-cyan-950/40 via-[#0A0E17] to-[#0A0E17] p-6 backdrop-blur-xl shadow-dashboard">
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                  <div>
                    <div className="flex items-center gap-2">
                      <TrendingUp className="h-5 w-5 text-cyan-400" />
                      <h2 className="text-xl font-bold text-white tracking-tight">
                        {monthNames[calendarMonth]} 2026 ? Monthly & Section Attendance Analytics
                      </h2>
                      <span className="px-2.5 py-0.5 rounded-full bg-cyan-500/20 border border-cyan-500/30 text-cyan-300 text-xs font-mono font-bold">
                        Monthly Turnout: {classMonthlyAverage}%
                      </span>
                    </div>
                    <p className="text-xs text-slate-400 mt-1">
                      Authoritative monthly attendance aggregation for {monthNames[calendarMonth]} 2026. Review total class attendance, days conducted, and individual student monthly compliance rates.
                    </p>
                  </div>

                  {/* Month Selector Buttons */}
                  <div className="flex items-center gap-2 bg-black/60 border border-white/10 p-1.5 rounded-xl">
                    <button
                      onClick={handlePrevMonth}
                      className="p-1.5 text-slate-400 hover:text-white rounded-lg hover:bg-white/10 transition-colors"
                      title="Previous Month"
                    >
                      <ChevronLeft className="h-4 w-4" />
                    </button>
                    <span className="text-xs font-bold text-white px-2 font-mono">
                      {monthNames[calendarMonth]} 2026
                    </span>
                    <button
                      onClick={handleNextMonth}
                      className="p-1.5 text-slate-400 hover:text-white rounded-lg hover:bg-white/10 transition-colors"
                      title="Next Month"
                    >
                      <ChevronRight className="h-4 w-4" />
                    </button>
                  </div>
                </div>
              </div>

              {/* Monthly Overview Stats Grid */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                <div className="p-4 rounded-2xl border border-white/[0.08] bg-[#0A0E17]/80 backdrop-blur-xl">
                  <span className="text-[11px] font-mono text-slate-400 uppercase block">School Days in Month</span>
                  <div className="text-3xl font-display font-bold text-white mt-1">{totalMonthDaysConducted} Days</div>
                  <span className="text-[10px] text-slate-500 mt-1 block">Excluding Sundays</span>
                </div>

                <div className="p-4 rounded-2xl border border-emerald-500/30 bg-emerald-950/15 backdrop-blur-xl">
                  <span className="text-[11px] font-mono text-emerald-300 uppercase block">Class Turnout Rate</span>
                  <div className="text-3xl font-display font-bold text-emerald-400 mt-1">{classMonthlyAverage}%</div>
                  <span className="text-[10px] text-emerald-300/80 mt-1 block">Senior Secondary Average</span>
                </div>

                <div className="p-4 rounded-2xl border border-cyan-500/30 bg-cyan-950/15 backdrop-blur-xl">
                  <span className="text-[11px] font-mono text-cyan-300 uppercase block">Total Present Check-ins</span>
                  <div className="text-3xl font-display font-bold text-cyan-400 mt-1">{totalClassPresentMarks}</div>
                  <span className="text-[10px] text-cyan-300/80 mt-1 block">Across all students</span>
                </div>

                <div className="p-4 rounded-2xl border border-amber-500/30 bg-amber-950/15 backdrop-blur-xl">
                  <span className="text-[11px] font-mono text-amber-300 uppercase block">Total Monthly Absences</span>
                  <div className="text-3xl font-display font-bold text-amber-400 mt-1">{monthlyTotalAbsences}</div>
                  <span className="text-[10px] text-amber-300/80 mt-1 block">Unexcused & Leave absences</span>
                </div>
              </div>

              {/* Student-Wise Monthly Breakdown Table Card */}
              <div className="rounded-2xl border border-white/[0.08] bg-[#0A0E17]/80 p-5 backdrop-blur-xl shadow-dashboard space-y-4">
                <div className="flex items-center justify-between pb-3 border-b border-white/[0.06]">
                  <h3 className="text-sm font-bold text-white tracking-tight flex items-center gap-2">
                    <Users className="h-4 w-4 text-cyan-400" />
                    <span>{monthNames[calendarMonth]} 2026 ? Student-by-Student Attendance Summary</span>
                  </h3>
                  <span className="text-xs font-mono text-slate-400">
                    {monthlyStudentRoster.length} Enrolled Students
                  </span>
                </div>

                <div className="space-y-3">
                  {monthlyStudentRoster.map((s: any) => (
                    <div
                      key={s.id}
                      className="p-4 rounded-2xl border border-white/[0.08] bg-white/[0.02] hover:bg-white/[0.04] transition-all flex flex-col md:flex-row md:items-center justify-between gap-4"
                    >
                      <div className="flex items-center gap-3">
                        <img src={s.avatarUrl} alt={s.name} className="h-10 w-10 rounded-xl object-cover border border-white/10" />
                        <div>
                          <div className="flex items-center gap-2">
                            <span className="text-sm font-bold text-white">{s.name}</span>
                            <span className="text-xs font-mono text-slate-400">({s.admissionNo})</span>
                            <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-white/5 border border-white/10 text-slate-300">
                              Roll {s.rollNo} ? Grade {s.classGrade}-{s.section}
                            </span>
                          </div>
                          <div className="text-xs text-slate-400 mt-1 flex items-center gap-3 font-mono">
                            <span className="text-emerald-400">Present: {s.presentDays} Days</span>
                            <span>?</span>
                            <span className="text-rose-400">Absent: {s.absentDays} Days</span>
                            <span>?</span>
                            <span>Total Conducted: {s.effectiveConducted} Days</span>
                          </div>
                        </div>
                      </div>

                      <div className="flex items-center gap-4">
                        <div className="w-32 hidden sm:block">
                          <div className="flex justify-between text-[11px] font-mono mb-1">
                            <span className="text-slate-400">Monthly</span>
                            <span className={s.isLow ? 'text-rose-400 font-bold' : 'text-emerald-400 font-bold'}>
                              {s.monthRate}%
                            </span>
                          </div>
                          <div className="w-full h-2 bg-slate-800 rounded-full overflow-hidden">
                            <div
                              className={`h-full rounded-full transition-all duration-500 ${
                                s.isLow ? 'bg-rose-500' : 'bg-gradient-to-r from-cyan-500 to-emerald-400'
                              }`}
                              style={{ width: `${Math.min(100, s.monthRate)}%` }}
                            />
                          </div>
                        </div>

                        <span className={`px-3 py-1 rounded-xl text-xs font-mono font-bold ${
                          s.isLow
                            ? 'bg-rose-500/20 text-rose-300 border border-rose-500/30'
                            : 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
                        }`}>
                          {s.isLow ? 'Deficit (<75%)' : 'Compliant'}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          ) : activeTab === 'low-attendance' ? (
            /* Dedicated CBSE Compliance & Low Attendance Tracker */
            <div className="space-y-6">
              {/* Header Card */}
              <div className="rounded-2xl border border-rose-500/30 bg-gradient-to-r from-rose-950/40 via-[#0A0E17] to-[#0A0E17] p-6 backdrop-blur-xl shadow-dashboard">
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                  <div>
                    <div className="flex items-center gap-2">
                      <ShieldAlert className="h-5 w-5 text-rose-400" />
                      <h2 className="text-xl font-bold text-white tracking-tight">
                        CBSE 75% Attendance Compliance & Deficit Tracker
                      </h2>
                      <span className="px-2.5 py-0.5 rounded-full bg-rose-500/20 border border-rose-500/30 text-rose-300 text-xs font-mono font-bold">
                        Mandatory 75%
                      </span>
                    </div>
                    <p className="text-xs text-slate-400 mt-1">
                      Real-time evaluation of all enrolled students. Students with attendance below 75% are highlighted in red with exact required consecutive days calculated.
                    </p>
                  </div>

                  {/* Filter Pills */}
                  <div className="flex items-center gap-1.5 bg-black/60 border border-white/10 p-1 rounded-xl">
                    <button
                      type="button"
                      onClick={() => setComplianceFilter('ALL')}
                      className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                        complianceFilter === 'ALL'
                          ? 'bg-white/20 text-white font-bold'
                          : 'text-slate-400 hover:text-white'
                      }`}
                    >
                      All ({studentComplianceList.length})
                    </button>
                    <button
                      type="button"
                      onClick={() => setComplianceFilter('LOW')}
                      className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all flex items-center gap-1.5 ${
                        complianceFilter === 'LOW'
                          ? 'bg-rose-500 text-black font-bold shadow-[0_0_12px_rgba(244,63,94,0.4)]'
                          : 'text-rose-400 hover:bg-rose-500/10'
                      }`}
                    >
                      <span className="h-1.5 w-1.5 rounded-full bg-rose-400 animate-ping" />
                      <span>Below 75% ({lowAttendanceStudents.length})</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => setComplianceFilter('SAFE')}
                      className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                        complianceFilter === 'SAFE'
                          ? 'bg-emerald-500 text-black font-bold'
                          : 'text-emerald-400 hover:bg-emerald-500/10'
                      }`}
                    >
                      Compliant ({safeAttendanceStudents.length})
                    </button>
                  </div>
                </div>
              </div>

              {/* 4 Metric Summary Cards */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                <div className="p-4 rounded-2xl border border-white/[0.08] bg-[#0A0E17]/80 backdrop-blur-xl">
                  <span className="text-[11px] font-mono text-slate-400 uppercase block">Total Students Evaluated</span>
                  <div className="text-3xl font-display font-bold text-white mt-1">{studentComplianceList.length}</div>
                  <span className="text-[10px] text-slate-500 mt-1 block">Filter: {selectedClass}</span>
                </div>

                <div className="p-4 rounded-2xl border border-rose-500/40 bg-rose-950/20 backdrop-blur-xl shadow-[0_0_20px_rgba(244,63,94,0.1)]">
                  <div className="flex items-center justify-between">
                    <span className="text-[11px] font-mono text-rose-300 uppercase block">Deficit Alert (&lt;75%)</span>
                    <span className="h-2 w-2 rounded-full bg-rose-400 animate-pulse" />
                  </div>
                  <div className="text-3xl font-display font-bold text-rose-400 mt-1">{lowAttendanceStudents.length} Students</div>
                  <span className="text-[10px] text-rose-300/80 mt-1 block">Guardian alerts recommended</span>
                </div>

                <div className="p-4 rounded-2xl border border-emerald-500/30 bg-emerald-950/15 backdrop-blur-xl">
                  <span className="text-[11px] font-mono text-emerald-300 uppercase block">Compliant (≥75%)</span>
                  <div className="text-3xl font-display font-bold text-emerald-400 mt-1">
                    {safeAttendanceStudents.length} Students
                  </div>
                  <span className="text-[10px] text-emerald-300/80 mt-1 block">Eligible for examinations</span>
                </div>

                <div className="p-4 rounded-2xl border border-white/[0.08] bg-[#0A0E17]/80 backdrop-blur-xl">
                  <span className="text-[11px] font-mono text-slate-400 uppercase block">Cohort Average Turnout</span>
                  <div className="text-3xl font-display font-bold text-white mt-1">
                    {studentComplianceList.length > 0
                      ? Math.round(studentComplianceList.reduce((acc, s) => acc + s.computedPercentage, 0) / studentComplianceList.length * 10) / 10
                      : 100}%
                  </div>
                  <span className="text-[10px] text-slate-500 mt-1 block">CBSE standard minimum 75%</span>
                </div>
              </div>

              {/* Student Compliance Cards */}
              <div className="rounded-2xl border border-white/[0.08] bg-[#0A0E17]/80 p-5 backdrop-blur-xl shadow-dashboard space-y-4">
                <div className="flex items-center justify-between pb-3 border-b border-white/[0.06]">
                  <h3 className="text-sm font-bold text-white tracking-tight">
                    Individual Student Turnout & Days Recovery Roster
                  </h3>
                  <span className="text-xs font-mono text-slate-400">
                    Showing {displayedComplianceStudents.length} of {studentComplianceList.length} students
                  </span>
                </div>

                <div className="space-y-3">
                  {displayedComplianceStudents.map((s) => (
                    <div
                      key={s.id}
                      className={`p-4 rounded-2xl border transition-all ${
                        s.isLow
                          ? 'border-rose-500/60 bg-rose-950/25 shadow-[0_0_25px_rgba(244,63,94,0.18)] ring-1 ring-rose-500/30'
                          : 'border-white/[0.08] bg-white/[0.02] hover:bg-white/[0.04]'
                      }`}
                    >
                      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                        <div className="flex items-center gap-3">
                          <img src={s.avatarUrl} alt={s.name} className="h-11 w-11 rounded-xl object-cover border border-white/10" />
                          <div>
                            <div className="flex items-center gap-2">
                              <span className="text-sm font-bold text-white">{s.name}</span>
                              <span className="text-xs font-mono text-slate-400">({s.admissionNo})</span>
                              <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-white/5 border border-white/10 text-slate-300">
                                Roll {s.rollNo} • Grade {s.classGrade}-{s.section}
                              </span>
                            </div>
                            <div className="text-xs text-slate-400 mt-1 flex flex-wrap items-center gap-3">
                              <span>Guardian: <strong className="text-slate-300">{s.parentName}</strong></span>
                              <span>Mobile: <strong className="font-mono text-slate-300">{s.parentPhone}</strong></span>
                              <span>Conducted: <strong className="font-mono text-white">{s.conductedDays}</strong></span>
                              <span>Present: <strong className="font-mono text-emerald-400">{s.presentDaysCount}</strong></span>
                              <span>Absent: <strong className="font-mono text-rose-400">{s.absentDaysCount}</strong></span>
                            </div>
                          </div>
                        </div>

                        {/* Percentage & Criteria Pill */}
                        <div className="flex items-center gap-3 shrink-0">
                          <div className="text-right">
                            <div className="text-[10px] font-mono text-slate-400 uppercase">Current Score</div>
                            <div className={`text-2xl font-bold font-mono ${
                              s.isLow ? 'text-rose-400 font-extrabold' : 'text-emerald-400'
                            }`}>
                              {s.computedPercentage}%
                            </div>
                          </div>

                          <span className={`px-3 py-1.5 rounded-xl text-xs font-mono font-bold uppercase tracking-wider flex items-center gap-1 ${
                            s.isLow
                              ? 'bg-rose-500/25 border border-rose-500/50 text-rose-300 shadow-[0_0_10px_rgba(244,63,94,0.3)]'
                              : 'bg-emerald-500/20 border border-emerald-500/40 text-emerald-300'
                          }`}>
                            {s.isLow && <AlertTriangle className="h-3.5 w-3.5 text-rose-400 animate-pulse" />}
                            {s.isLow ? 'BELOW 75%' : 'COMPLIANT'}
                          </span>
                        </div>
                      </div>

                      {/* Required Attendance Days Formula Box */}
                      {s.isLow ? (
                        <div className="mt-3 p-3.5 rounded-xl border border-rose-500/50 bg-rose-500/15 text-xs text-rose-100 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                          <div className="flex items-center gap-2.5">
                            <AlertTriangle className="h-5 w-5 text-rose-400 shrink-0" />
                            <div>
                              <span>
                                <strong>Attendance Deficit Notice:</strong> Student has attended {s.presentDaysCount} out of {s.conductedDays} conducted days.
                              </span>
                              <div className="mt-0.5 text-rose-200">
                                Must attend <strong className="font-mono text-white underline font-extrabold text-sm">{s.neededDays} more days</strong> consecutively without absence to fulfill the CBSE 75% criteria.
                              </div>
                            </div>
                          </div>

                          <div className="flex items-center gap-2 shrink-0">
                            <button
                              type="button"
                              onClick={() => {
                                addToast(
                                  'Guardian Notice Sent',
                                  `Deficit alert sent to ${s.parentName} (${s.parentPhone}). Student requires ${s.neededDays} days attendance to reach 75%.`,
                                  'SUCCESS'
                                );
                              }}
                              className="px-3 py-1.5 rounded-lg bg-rose-600 hover:bg-rose-500 text-white font-bold text-xs shadow-sm transition-all flex items-center gap-1"
                            >
                              <Mail className="h-3.5 w-3.5" />
                              <span>Notify Guardian</span>
                            </button>

                            <button
                              type="button"
                              onClick={() => {
                                setActiveTab('roster');
                              }}
                              className="px-3 py-1.5 rounded-lg bg-white/10 hover:bg-white/20 text-white font-semibold text-xs transition-all flex items-center gap-1"
                            >
                              <span>Open Register</span>
                              <ArrowRight className="h-3.5 w-3.5" />
                            </button>
                          </div>
                        </div>
                      ) : (
                        <div className="mt-3 p-2.5 rounded-xl border border-emerald-500/25 bg-emerald-500/10 text-xs text-emerald-300 flex items-center justify-between">
                          <span className="flex items-center gap-1.5">
                            <CheckCircle2 className="h-3.5 w-3.5 text-emerald-400" />
                            Meets CBSE 75% mandate ({s.presentDaysCount}/{s.conductedDays} days). Safe buffer: can safely miss up to <strong>{s.safeAbsences} day(s)</strong> without dropping below 75%.
                          </span>
                          <span className="font-mono text-[10px] text-emerald-300 bg-emerald-500/20 px-2 py-0.5 rounded">
                            Eligible
                          </span>
                        </div>
                      )}
                    </div>
                  ))}

                  {displayedComplianceStudents.length === 0 && (
                    <div className="p-8 text-center text-slate-500 text-xs font-mono">
                      No students match the current compliance filter.
                    </div>
                  )}
                </div>
              </div>
            </div>
          ) : (
            /* Roster & Calendar Main View */
            <div className="space-y-6">
              {/* Two Equal-Width Bento Cards */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Card 1: Faculty Attendance & Class Trend Bézier Chart */}
            <div className="rounded-2xl border border-white/[0.08] bg-[#0A0E17]/80 p-5 backdrop-blur-xl shadow-dashboard flex flex-col justify-between">
              <div>
                <div className="flex items-center justify-between text-xs mb-3">
                  <div className="flex items-center gap-2">
                    <TrendingUp className="h-4 w-4 text-emerald-400" />
                    <span className="font-bold text-white uppercase tracking-wider text-[11px]">Institution Faculty Turnout</span>
                  </div>
                  <span className="font-mono text-emerald-400 font-bold">{todayTurnoutPct}%</span>
                </div>

                <div className="flex items-baseline gap-2 mt-1">
                  <span className="font-display italic text-4xl sm:text-5xl font-bold text-white">
                    {todayPresentStudents}
                  </span>
                  <span className="text-xs text-slate-400">
                    / {students.length} Students Checked-in Today
                  </span>
                </div>

                <div className="flex items-center gap-4 text-xs mt-3 pt-3 border-t border-white/[0.06]">
                  <div>
                    <span className="text-[10px] text-slate-500 block">Department</span>
                    <span className="text-slate-300 font-semibold">{isAdmin ? 'All Institutional' : currentStaff.department}</span>
                  </div>
                  <div>
                    <span className="text-[10px] text-slate-500 block">Status</span>
                    <span className="text-emerald-400 font-semibold">{isAdmin ? 'SUPERVISOR' : currentStaff.status}</span>
                  </div>
                  <div>
                    <span className="text-[10px] text-slate-500 block">Biometric ID</span>
                    <span className="font-mono text-slate-300">{isAdmin ? 'ADMIN-ROOT-01' : currentStaff.biometricId}</span>
                  </div>
                </div>
              </div>

              {/* Hand-crafted Cubic Bézier SVG Area Chart */}
              <div className="mt-4 pt-2">
                <div className="text-[10px] font-mono text-slate-500 mb-1">Campus Turnout Stability (Bézier Spline)</div>
                <svg viewBox="0 0 450 80" className="w-full h-20 overflow-visible">
                  <defs>
                    <linearGradient id="staffGradient" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor="#10b981" stopOpacity="0.4" />
                      <stop offset="100%" stopColor="#10b981" stopOpacity="0.0" />
                    </linearGradient>
                  </defs>
                  <path d={chartPath} fill="url(#staffGradient)" />
                  <path d={linePath} fill="none" stroke="#10b981" strokeWidth="2.5" strokeLinecap="round" />
                </svg>
              </div>
            </div>

            {/* Card 2: Pvm Sathi for Faculty & Section Intelligence */}
            <div className="rounded-2xl border border-white/[0.08] bg-[#0A0E17]/80 p-5 backdrop-blur-xl shadow-dashboard flex flex-col justify-between">
              <div>
                <div className="flex items-center justify-between text-xs mb-3">
                  <span className="font-bold text-white uppercase tracking-wider text-[11px]">Faculty Attendance Controller</span>
                  <span className="px-2 py-0.5 rounded-full bg-emerald-500/15 border border-emerald-500/30 text-[10px] text-emerald-300 font-mono">
                    Audit Logging Active
                  </span>
                </div>

                <div className="p-3 rounded-xl bg-white/[0.02] border border-white/[0.05] space-y-2">
                  <div className="text-xs text-slate-300">
                    Faculty members can view individual student attendance names and roll numbers, apply manual adjustments with reason notes, and export reports.
                  </div>
                  <div className="text-[11px] text-slate-400">
                    Filter applied: <span className="font-mono text-emerald-400">{selectedClass}</span> ({filteredStudents.length} students listed)
                  </div>
                </div>
              </div>

              {/* Pvm Sathi Mini Prompt */}
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
                <Sparkles className="h-3.5 w-3.5 text-emerald-400 shrink-0" />
                <input
                  type="text"
                  value={aiQuestion}
                  onChange={(e) => setAiQuestion(e.target.value)}
                  placeholder="Ask Pvm Sathi for class roster analysis..."
                  className="w-full bg-transparent text-xs text-white placeholder-slate-500 focus:outline-none"
                />
                <button
                  type="submit"
                  className="px-2.5 py-1 rounded-lg bg-emerald-500/20 hover:bg-emerald-500/30 text-emerald-300 text-[10px] font-semibold transition-colors"
                >
                  Ask
                </button>
              </form>

              {aiResult && (
                <div className="mt-2.5 p-2.5 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-[11px] text-emerald-200 leading-relaxed">
                  {aiResult}
                </div>
              )}
            </div>
          </div>

          {/* Student Roster Table with Date Selector & Backdated Attendance Entry */}
          <div className="rounded-2xl border border-white/[0.08] bg-[#0A0E17]/80 p-5 backdrop-blur-xl shadow-dashboard space-y-4">
            {/* Header with Month Navigator & Quick Jumps */}
            <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 border-b border-white/[0.06] pb-4">
              <div>
                <div className="flex items-center gap-2">
                  <Calendar className="h-4 w-4 text-emerald-400" />
                  <h3 className="text-sm font-bold text-white tracking-tight">
                    Academic Attendance Calendar & Register
                  </h3>
                  <span className="px-2 py-0.5 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-[10px] text-emerald-300 font-mono">
                    Any Date / Month Entry
                  </span>
                </div>
                <p className="text-[11px] text-slate-400 mt-0.5">
                  Select any month (e.g. August, September) and day to enter backdated Present / Absent marks with instant sync.
                </p>
              </div>

              {/* Month Selector Bar */}
              <div className="flex flex-wrap items-center gap-2">
                {/* Month Navigator with Prev/Next buttons */}
                <div className="flex items-center gap-1 bg-black/60 border border-white/10 rounded-xl p-1">
                  <button
                    type="button"
                    onClick={handlePrevMonth}
                    title="Previous Month"
                    className="p-1 rounded-lg hover:bg-white/10 text-slate-300 hover:text-white transition-colors"
                  >
                    <ChevronLeft className="h-4 w-4" />
                  </button>

                  <select
                    value={calendarMonth}
                    onChange={(e) => setCalendarMonth(Number(e.target.value))}
                    className="bg-transparent text-xs text-white font-semibold focus:outline-none px-2 py-0.5 cursor-pointer"
                  >
                    {monthNames.map((name, idx) => (
                      <option key={name} value={idx} className="bg-[#0A0E17] text-white">
                        {name} {calendarYear}
                      </option>
                    ))}
                  </select>

                  <button
                    type="button"
                    onClick={handleNextMonth}
                    title="Next Month"
                    className="p-1 rounded-lg hover:bg-white/10 text-slate-300 hover:text-white transition-colors"
                  >
                    <ChevronRight className="h-4 w-4" />
                  </button>
                </div>

                {/* Direct Date Picker */}
                <div className="flex items-center gap-1.5 bg-black/60 border border-white/10 rounded-xl px-2.5 py-1.5">
                  <Calendar className="h-3.5 w-3.5 text-emerald-400" />
                  <input
                    type="date"
                    value={selectedDate}
                    onChange={(e) => handleSelectDate(e.target.value)}
                    className="bg-transparent text-xs text-white focus:outline-none font-mono cursor-pointer"
                  />
                </div>

                {/* Toggle Calendar View Button */}
                <button
                  type="button"
                  onClick={() => setShowCalendarGrid(prev => !prev)}
                  className="px-2.5 py-1.5 rounded-xl border border-white/10 bg-white/[0.04] hover:bg-white/[0.08] text-slate-300 text-xs font-semibold transition-all"
                >
                  {showCalendarGrid ? 'Hide Calendar' : 'View Calendar'}
                </button>
              </div>
            </div>

            {/* Quick-Jump Chips (Including 8 Sep & 7 Aug) */}
            <div className="flex flex-wrap items-center gap-1.5 pt-1">
              <span className="text-[10px] uppercase font-mono tracking-wider text-slate-500 mr-1">Quick Dates:</span>
              {[
                { label: `Today (${new Date().getDate()} ${new Date().toLocaleDateString('en-US', { month: 'short', timeZone: 'Asia/Kolkata' })})`, date: kolkataToday, badge: 'Active' },
                { label: '16 Sep (Yesterday)', date: '2026-09-16' },
                { label: '12 Sep', date: '2026-09-12' },
                { label: '11 Sep', date: '2026-09-11' },
                { label: '10 Sep', date: '2026-09-10' },
                { label: '09 Sep', date: '2026-09-09' },
                { label: '8 Sep (Backdated)', date: '2026-09-08', badge: 'Requested' },
                { label: '7 Aug (August Entry)', date: '2026-08-07', badge: 'August' }
              ].map((chip) => {
                const isSelected = selectedDate === chip.date;
                return (
                  <button
                    key={chip.date}
                    type="button"
                    onClick={() => handleSelectDate(chip.date)}
                    className={`px-2.5 py-1 rounded-lg text-[11px] font-mono font-semibold transition-all flex items-center gap-1.5 ${
                      isSelected
                        ? 'bg-emerald-500 text-black shadow-glow-emerald font-bold'
                        : 'bg-white/[0.04] text-slate-300 hover:bg-white/[0.08] border border-white/5'
                    }`}
                  >
                    <span>{chip.label}</span>
                    {chip.badge && !isSelected && (
                      <span className="text-[9px] px-1 py-0.2 rounded bg-emerald-500/20 text-emerald-300 font-sans">
                        {chip.badge}
                      </span>
                    )}
                  </button>
                );
              })}
            </div>

            {/* Interactive Month Calendar Grid */}
            {showCalendarGrid && (
              <div className="rounded-xl border border-white/[0.06] bg-black/40 p-4 space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-white tracking-wide">
                    {monthNames[calendarMonth]} {calendarYear}
                  </span>
                  <span className="text-[10px] font-mono text-slate-400">
                    Click any day tile to switch attendance sheet
                  </span>
                </div>

                {/* Day of Week Headers */}
                <div className="grid grid-cols-7 gap-1.5 text-center text-[10px] font-mono text-slate-500 font-bold uppercase tracking-wider">
                  <div>Sun</div>
                  <div>Mon</div>
                  <div>Tue</div>
                  <div>Wed</div>
                  <div>Thu</div>
                  <div>Fri</div>
                  <div>Sat</div>
                </div>

                {/* Calendar Days */}
                {(() => {
                  const firstDayOfWeek = new Date(calendarYear, calendarMonth, 1).getDay();
                  const daysInCurrentMonth = new Date(calendarYear, calendarMonth + 1, 0).getDate();
                  const calendarCells: Array<number | null> = [];
                  for (let i = 0; i < firstDayOfWeek; i++) {
                    calendarCells.push(null);
                  }
                  for (let d = 1; d <= daysInCurrentMonth; d++) {
                    calendarCells.push(d);
                  }

                  return (
                    <div className="grid grid-cols-7 gap-1.5">
                      {calendarCells.map((dayNum, idx) => {
                        if (dayNum === null) {
                          return (
                            <div
                              key={`empty-${idx}`}
                              className="h-12 rounded-lg border border-dashed border-white/[0.02] bg-transparent opacity-20"
                            />
                          );
                        }

                        const dayDate = `${calendarYear}-${String(calendarMonth + 1).padStart(2, '0')}-${String(dayNum).padStart(2, '0')}`;
                        const isSelected = selectedDate === dayDate;
                        const isToday = kolkataToday === dayDate;
                        const isSunday = idx % 7 === 0;
                        const dayRecords = attendance.filter(a => a.date === dayDate && a.personType === 'STUDENT');
                        const dayPresents = dayRecords.filter(a => a.status === 'PRESENT').length;
                        const dayAbsents = dayRecords.filter(a => a.status === 'ABSENT').length;

                        return (
                          <button
                            key={dayDate}
                            type="button"
                            onClick={() => handleSelectDate(dayDate)}
                            className={`h-12 rounded-lg p-1.5 flex flex-col justify-between text-left transition-all border ${
                              isSelected
                                ? 'border-emerald-400 bg-emerald-500/25 ring-2 ring-emerald-400/50 shadow-[0_0_15px_rgba(16,185,129,0.3)]'
                                : isToday
                                ? 'border-emerald-500/40 bg-emerald-950/20 hover:bg-emerald-950/40'
                                : isSunday
                                ? 'border-violet-500/20 bg-violet-950/15 hover:bg-violet-950/30'
                                : 'border-white/[0.05] bg-white/[0.02] hover:bg-white/[0.06] hover:border-white/10'
                            }`}
                          >
                            <div className="flex items-center justify-between w-full">
                              <span
                                className={`text-xs font-mono font-bold ${
                                  isSelected
                                    ? 'text-white'
                                    : isToday
                                    ? 'text-emerald-300'
                                    : isSunday
                                    ? 'text-violet-300'
                                    : 'text-slate-300'
                                }`}
                              >
                                {dayNum}
                              </span>
                              {isToday ? (
                                <span className="text-[8px] font-mono px-1 rounded bg-emerald-500/30 text-emerald-200">
                                  TODAY
                                </span>
                              ) : isSunday ? (
                                <span className="text-[8px] font-mono px-1 rounded bg-violet-500/20 text-violet-300">
                                  HOLIDAY
                                </span>
                              ) : null}
                            </div>

                            <div className="flex items-center gap-1 text-[9px] font-mono">
                              {isSunday ? (
                                <span className="text-violet-400 font-medium">Sunday</span>
                              ) : dayPresents > 0 ? (
                                <span className="text-emerald-400 flex items-center gap-0.5">
                                  ● {dayPresents}P
                                </span>
                              ) : dayAbsents > 0 ? (
                                <span className="text-rose-400 flex items-center gap-0.5">
                                  ● {dayAbsents}A
                                </span>
                              ) : (
                                <span className="text-slate-600">--</span>
                              )}
                            </div>
                          </button>
                        );
                      })}
                    </div>
                  );
                })()}
              </div>
            )}

            {/* Active Date Summary Banner & Backdated Notice */}
            <div className="rounded-xl border border-white/[0.08] bg-white/[0.02] p-3.5 flex flex-col md:flex-row md:items-center justify-between gap-3">
              <div className="flex flex-wrap items-center gap-2">
                <div className="flex items-center gap-2">
                  <div className="h-2.5 w-2.5 rounded-full bg-emerald-400 animate-pulse" />
                  <span className="text-xs text-slate-400">Selected Register:</span>
                  <span className="text-xs font-bold text-white font-mono">
                    {formatFriendlyDate(selectedDate)} ({selectedDate})
                  </span>
                </div>

                {(() => {
                  try {
                    const [y, m, d] = selectedDate.split('-').map(Number);
                    if (new Date(y, m - 1, d).getDay() === 0) {
                      return (
                        <span className="px-2 py-0.5 rounded-md bg-violet-500/15 border border-violet-500/30 text-[10px] text-violet-300 font-mono font-semibold flex items-center gap-1">
                          Sunday Holiday (Non-Working Day)
                        </span>
                      );
                    }
                  } catch {}
                  return null;
                })()}

                {selectedDate !== kolkataToday ? (
                  <span className="px-2 py-0.5 rounded-md bg-amber-500/15 border border-amber-500/30 text-[10px] text-amber-300 font-mono font-semibold flex items-center gap-1">
                    <History className="h-3 w-3" />
                    Backdated Register
                  </span>
                ) : (
                  <span className="px-2 py-0.5 rounded-md bg-emerald-500/15 border border-emerald-500/30 text-[10px] text-emerald-300 font-mono font-semibold">
                    Current Today Register
                  </span>
                )}

                {(() => {
                  const dayAttendance = attendance.filter(a => a.date === selectedDate && a.personType === 'STUDENT');
                  const isDayManual = dayAttendance.length > 0 && dayAttendance.every(r => r.verificationMethod?.includes('MANUAL') || r.deviceId === 'staff-portal' || !r.googleSheetsSynced);
                  const isDaySheetSynced = dayAttendance.length > 0 && dayAttendance.some(r => r.googleSheetsSynced && !r.verificationMethod?.includes('MANUAL'));
                  if (isDayManual) {
                    return (
                      <span className="px-2 py-0.5 rounded-md bg-amber-500/20 border border-amber-500/40 text-[10px] text-amber-300 font-mono font-bold">
                        Manual Entry (Portal)
                      </span>
                    );
                  }
                  if (isDaySheetSynced) {
                    return (
                      <span className="px-2 py-0.5 rounded-md bg-emerald-500/20 border border-emerald-500/40 text-[10px] text-emerald-300 font-mono font-bold">
                        Google Sheets Synced
                      </span>
                    );
                  }
                  return null;
                })()}
              </div>

              {/* Roster Statistics on Selected Date */}
              {(() => {
                const recs = attendance.filter(a => a.date === selectedDate && a.personType === 'STUDENT');
                const presents = recs.filter(a => a.status === 'PRESENT').length;
                const absents = recs.filter(a => a.status === 'ABSENT').length;
                const unmarked = Math.max(0, filteredStudents.length - presents - absents);

                return (
                  <div className="flex items-center gap-3 text-xs font-mono">
                    <span className="text-emerald-400 font-bold">
                      {presents} Present
                    </span>
                    <span className="text-rose-400 font-bold">
                      {absents} Absent
                    </span>
                    <span className="text-slate-400">
                      {unmarked} Unmarked
                    </span>
                  </div>
                );
              })()}
            </div>

            {/* View Mode & Month Selection Toolbar */}
            <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-3 p-3 rounded-xl bg-slate-900/70 border border-white/[0.08]">
              {/* View Mode Switcher */}
              <div className="flex items-center gap-1.5 bg-black/40 p-1 rounded-xl border border-white/10">
                <button
                  type="button"
                  onClick={() => setAttendanceViewMode('DAILY')}
                  className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center gap-1.5 ${
                    attendanceViewMode === 'DAILY'
                      ? 'bg-emerald-500 text-slate-950 shadow-md shadow-emerald-500/20 font-black'
                      : 'text-slate-400 hover:text-white'
                  }`}
                >
                  <Calendar className="h-3.5 w-3.5" />
                  <span>Daily Register ({selectedDate})</span>
                </button>
                <button
                  type="button"
                  onClick={() => setAttendanceViewMode('MONTHLY')}
                  className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center gap-1.5 ${
                    attendanceViewMode === 'MONTHLY'
                      ? 'bg-gradient-to-r from-purple-600 to-indigo-600 text-white shadow-md shadow-purple-600/30 font-black'
                      : 'text-slate-400 hover:text-white'
                  }`}
                >
                  <BarChart3 className="h-3.5 w-3.5" />
                  <span>Monthly Ledger ({monthNames[parseInt(selectedAttendanceMonth.split('-')[1], 10) - 1]?.slice(0, 3)})</span>
                </button>
              </div>

              {/* Month Selector Pills (Sep, Aug, etc.) */}
              <div className="flex items-center gap-1.5 flex-wrap">
                <span className="text-[11px] font-mono text-slate-400 uppercase tracking-wider flex items-center gap-1 mr-1">
                  <Clock className="h-3.5 w-3.5 text-purple-400" /> Selected Month:
                </span>
                {[
                  { key: '2026-09', label: 'September 2026', short: 'Sep', badge: 'ACTIVE' },
                  { key: '2026-08', label: 'August 2026', short: 'Aug', badge: 'HISTORICAL' },
                  { key: '2026-10', label: 'October 2026', short: 'Oct', badge: 'UPCOMING' }
                ].map((m) => {
                  const isSelected = selectedAttendanceMonth === m.key;
                  return (
                    <button
                      key={m.key}
                      type="button"
                      onClick={() => {
                        setSelectedAttendanceMonth(m.key);
                        const [y, mon] = m.key.split('-').map(Number);
                        setCalendarYear(y);
                        setCalendarMonth(mon - 1);
                      }}
                      className={`px-2.5 py-1 rounded-lg text-xs font-mono font-semibold transition-all border flex items-center gap-1 ${
                        isSelected
                          ? 'bg-purple-600 text-white border-purple-500 font-bold shadow-md shadow-purple-600/25'
                          : 'bg-white/[0.04] text-slate-300 border-white/10 hover:bg-white/[0.08]'
                      }`}
                    >
                      <span>{m.label}</span>
                      <span className={`text-[9px] px-1 py-0.2 rounded ${
                        isSelected ? 'bg-white/25 text-white' : 'bg-white/5 text-slate-400'
                      }`}>
                        {m.badge}
                      </span>
                    </button>
                  );
                })}

                {/* Data-Aware Dropdown for any month in 2026 */}
                <select
                  value={selectedAttendanceMonth}
                  onChange={(e) => {
                    setSelectedAttendanceMonth(e.target.value);
                    const [y, mon] = e.target.value.split('-').map(Number);
                    setCalendarYear(y);
                    setCalendarMonth(mon - 1);
                  }}
                  className="rounded-lg border border-white/10 bg-black/60 px-2.5 py-1 text-xs text-white font-mono focus:border-purple-500 focus:outline-none ml-1"
                >
                  {monthNames.map((name, idx) => {
                    const monStr = String(idx + 1).padStart(2, '0');
                    const key = `2026-${monStr}`;
                    const isUpcoming = key > '2026-09';
                    const isCurrent = key === '2026-09';
                    const stateLabel = isUpcoming ? 'UPCOMING' : isCurrent ? 'ACTIVE' : 'HISTORICAL';
                    return (
                      <option key={key} value={key} className="bg-slate-900 text-white">
                        {name} 2026 [{stateLabel}]
                      </option>
                    );
                  })}
                </select>
              </div>
            </div>

            {/* Bulk Action Controls */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-xs pt-1">
              <span className="text-[11px] font-mono text-slate-400">
                Ready to mark attendance for {filteredStudents.length} students on <strong className="text-white">{selectedDate}</strong>
              </span>

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  disabled={isProcessing}
                  onClick={() => handleMarkAll('PRESENT')}
                  className="px-3 py-1 rounded-lg bg-emerald-500/15 hover:bg-emerald-500/25 border border-emerald-500/30 text-emerald-300 text-[10px] font-bold transition-all flex items-center gap-1 disabled:opacity-50"
                >
                  <CheckCheck className="h-3 w-3" />
                  <span>Mark All Present ({selectedDate})</span>
                </button>
                <button
                  type="button"
                  disabled={isProcessing}
                  onClick={() => handleMarkAll('ABSENT')}
                  className="px-3 py-1 rounded-lg bg-rose-500/15 hover:bg-rose-500/25 border border-rose-500/30 text-rose-300 text-[10px] font-bold transition-all flex items-center gap-1 disabled:opacity-50"
                >
                  <X className="h-3 w-3" />
                  <span>Mark All Absent ({selectedDate})</span>
                </button>
              </div>
            </div>

            {attendanceViewMode === 'MONTHLY' ? (
              <div className="space-y-4">
                {/* Monthly Ledger Summary Cards */}
                {(() => {
                  const isMonthUpcoming = selectedAttendanceMonth > '2026-09';
                  const allMonthlyStats = filteredStudents.map((s: any) => getStudentMonthlyStats(s, selectedAttendanceMonth));
                  const avgRate = isMonthUpcoming
                    ? 'UPCOMING'
                    : allMonthlyStats.length > 0
                    ? `${Math.round((allMonthlyStats.reduce((sum: number, s: any) => sum + s.percentage, 0) / allMonthlyStats.length) * 10) / 10}%`
                    : '0%';
                  const shortageCount = isMonthUpcoming ? 0 : allMonthlyStats.filter((s: any) => !s.isSafe).length;
                  const safeCount = isMonthUpcoming ? 0 : allMonthlyStats.length - shortageCount;
                  const currentMonthName = monthNames[parseInt(selectedAttendanceMonth.split('-')[1], 10) - 1];

                  return (
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                      <div className="p-3.5 rounded-xl border border-white/10 bg-black/40">
                        <div className="text-[11px] font-mono text-slate-400">Selected Month</div>
                        <div className="text-lg font-bold text-white mt-1">{currentMonthName} 2026</div>
                        <div className="text-[10px] text-purple-400 font-mono mt-0.5">{allMonthlyStats[0]?.totalWorkingDays || 22} Working Days</div>
                      </div>
                      <div className="p-3.5 rounded-xl border border-white/10 bg-black/40">
                        <div className="text-[11px] font-mono text-slate-400">Class Average Rate</div>
                        <div className="text-lg font-bold text-emerald-400 mt-1 font-mono">{avgRate}%</div>
                        <div className="text-[10px] text-slate-400 font-mono mt-0.5">Across {filteredStudents.length} Students</div>
                      </div>
                      <div className="p-3.5 rounded-xl border border-white/10 bg-black/40">
                        <div className="text-[11px] font-mono text-slate-400">CBSE Compliant (≥75%)</div>
                        <div className="text-lg font-bold text-cyan-400 mt-1 font-mono">{safeCount} Students</div>
                        <div className="text-[10px] text-emerald-400 font-mono mt-0.5">Eligible for Board Exams</div>
                      </div>
                      <div className="p-3.5 rounded-xl border border-white/10 bg-black/40">
                        <div className="text-[11px] font-mono text-slate-400">Shortage Alert (&lt;75%)</div>
                        <div className="text-lg font-bold text-rose-400 mt-1 font-mono">{shortageCount} Students</div>
                        <div className="text-[10px] text-rose-400 font-mono mt-0.5">{shortageCount > 0 ? 'Requires Parent Notice' : 'All Clear'}</div>
                      </div>
                    </div>
                  );
                })()}

                {/* Monthly Ledger Table */}
                <div className="overflow-x-auto rounded-xl border border-white/[0.08] bg-black/30">
                  <table className="w-full text-left text-xs">
                    <thead>
                      <tr className="border-b border-white/[0.08] text-[11px] font-mono text-slate-400 bg-white/[0.02]">
                        <th className="py-3 px-3">Roll</th>
                        <th className="py-3 px-3">Student Name</th>
                        <th className="py-3 px-3">Class & Section</th>
                        <th className="py-3 px-3">Working Days</th>
                        <th className="py-3 px-3">Present (P)</th>
                        <th className="py-3 px-3">Absent (A)</th>
                        <th className="py-3 px-3">Monthly Rate ({monthNames[parseInt(selectedAttendanceMonth.split('-')[1], 10) - 1]?.slice(0, 3)})</th>
                        <th className="py-3 px-3">All-Time Rate</th>
                        <th className="py-3 px-3">CBSE Status</th>
                        <th className="py-3 px-3 text-right">Action</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-white/[0.04]">
                      {filteredStudents.map((s: any) => {
                        const mStats = getStudentMonthlyStats(s, selectedAttendanceMonth);
                        return (
                          <tr key={s.id} className="hover:bg-white/[0.02] transition-colors">
                            <td className="py-3 px-3 font-mono text-slate-300">{s.rollNo}</td>
                            <td className="py-3 px-3 font-semibold text-white flex items-center gap-2">
                              <img src={s.avatarUrl} alt={s.name} className="h-6 w-6 rounded-full object-cover" />
                              <div>
                                <div>{s.name}</div>
                                <div className="text-[10px] font-mono text-slate-400 font-normal">{s.admissionNo}</div>
                              </div>
                            </td>
                            <td className="py-3 px-3 text-slate-300 font-mono">Grade {s.classGrade}-{s.section}</td>
                            <td className="py-3 px-3 font-mono text-slate-300">{mStats.totalWorkingDays}</td>
                            <td className="py-3 px-3 font-mono text-emerald-400 font-bold">{mStats.presents}</td>
                            <td className="py-3 px-3 font-mono text-rose-400 font-bold">{mStats.absents}</td>
                            <td className="py-3 px-3">
                              {mStats.isUpcoming ? (
                                <span className="px-2 py-0.5 rounded-full text-[10px] font-mono font-bold bg-purple-500/15 border border-purple-500/30 text-purple-300">
                                  UPCOMING
                                </span>
                              ) : (
                                <div className="space-y-1">
                                  <div className="flex items-center justify-between text-xs font-mono font-bold">
                                    <span className={mStats.percentage >= 75 ? 'text-emerald-300' : 'text-rose-400'}>
                                      {mStats.percentage}%
                                    </span>
                                  </div>
                                  <div className="h-1.5 w-24 rounded-full bg-white/10 overflow-hidden">
                                    <div
                                      className={`h-full rounded-full ${mStats.percentage >= 75 ? 'bg-emerald-500' : 'bg-rose-500'}`}
                                      style={{ width: `${Math.min(100, mStats.percentage)}%` }}
                                    />
                                  </div>
                                </div>
                              )}
                            </td>
                            <td className="py-3 px-3 font-mono text-slate-200">{s.attendancePercentage}%</td>
                            <td className="py-3 px-3">
                              <span className={`inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[10px] font-mono font-bold ${
                                mStats.isUpcoming
                                  ? 'bg-purple-500/10 border border-purple-500/20 text-purple-300'
                                  : mStats.isSafe
                                  ? 'bg-emerald-500/10 border border-emerald-500/20 text-emerald-300'
                                  : 'bg-rose-500/10 border border-rose-500/20 text-rose-300'
                              }`}>
                                {mStats.isUpcoming ? 'UPCOMING' : mStats.isSafe ? 'CBSE SAFE' : 'SHORTAGE'}
                              </span>
                            </td>
                            <td className="py-3 px-3 text-right">
                              <button
                                type="button"
                                onClick={() => setMonthlyInspectorTarget(s)}
                                className="px-2.5 py-1 rounded-lg border border-purple-500/30 bg-purple-500/15 hover:bg-purple-500/25 text-purple-300 text-[11px] font-semibold transition-all inline-flex items-center gap-1"
                              >
                                <Eye className="h-3 w-3" />
                                <span>Inspect Sheet</span>
                              </button>
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              </div>
            ) : (
              <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead>
                  <tr className="border-b border-white/[0.08] text-[11px] font-mono text-slate-500">
                    <th className="pb-3">Roll No</th>
                    <th className="pb-3">Student Name</th>
                    <th className="pb-3">Class & Section</th>
                    <th className="pb-3">Cumulative Rate</th>
                    <th className="pb-3">Monthly ({monthNames[parseInt(selectedAttendanceMonth.split('-')[1], 10) - 1]?.slice(0, 3)})</th>
                    <th className="pb-3">Status on {selectedDate}</th>
                    <th className="pb-3">Time</th>
                    <th className="pb-3 text-right">Quick Entry & Adjustment</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/[0.04]">
                  {filteredStudents.map((s: any) => {
                    const recOnDate = attendance.find(a =>
                      a.date === selectedDate &&
                      (a.personId.toUpperCase() === s.id.toUpperCase() ||
                       a.personId.toUpperCase() === s.admissionNo.toUpperCase() ||
                       (a.personName && a.personName.toLowerCase() === s.name.toLowerCase()))
                    );
                    const status = recOnDate ? recOnDate.status : 'NOT_MARKED';
                    const checkInTime = recOnDate?.timeDisplay || '-';

                    return (
                      <tr key={s.id} className="hover:bg-white/[0.02] transition-colors">
                        <td className="py-3 font-mono text-slate-300">{s.rollNo}</td>
                        <td className="py-3 font-semibold text-white flex items-center gap-2">
                          <img src={s.avatarUrl} alt={s.name} className="h-6 w-6 rounded-full object-cover" />
                          <div>
                            <div>{s.name}</div>
                            <div className="text-[10px] font-mono text-slate-400 font-normal">{s.admissionNo}</div>
                          </div>
                        </td>
                        <td className="py-3 text-slate-300 font-mono">Grade {s.classGrade}-{s.section}</td>
                        <td className="py-3 font-mono text-slate-200">{s.attendancePercentage}%</td>
                        <td className="py-3">
                          {(() => {
                            const mStats = getStudentMonthlyStats(s, selectedAttendanceMonth);
                            return (
                              <button
                                type="button"
                                onClick={() => setMonthlyInspectorTarget(s)}
                                className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-lg border border-purple-500/30 bg-purple-500/10 hover:bg-purple-500/25 text-purple-300 font-mono text-[11px] transition-all cursor-pointer group"
                                title={`Inspect ${monthNames[parseInt(selectedAttendanceMonth.split('-')[1], 10) - 1]} monthly breakdown for ${s.name}`}
                              >
                                {mStats.isUpcoming ? (
                                  <span className="font-bold text-purple-300">UPCOMING</span>
                                ) : (
                                  <>
                                    <span className="font-bold text-white">{mStats.percentage}%</span>
                                    <span className="text-[10px] text-purple-300">({mStats.presents}/{mStats.totalWorkingDays}d)</span>
                                  </>
                                )}
                                <Eye className="h-2.5 w-2.5 opacity-70 group-hover:opacity-100 text-purple-300" />
                              </button>
                            );
                          })()}
                        </td>
                        <td className="py-3">
                          <span className={`inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[10px] font-mono ${
                            status === 'PRESENT'
                              ? 'bg-emerald-500/10 border border-emerald-500/20 text-emerald-300'
                              : status === 'LATE'
                              ? 'bg-amber-500/10 border border-amber-500/20 text-amber-300'
                              : status === 'ABSENT'
                              ? 'bg-rose-500/10 border border-rose-500/20 text-rose-300'
                              : 'bg-slate-500/10 border border-slate-500/20 text-slate-400'
                          }`}>
                            <CheckCircle2 className="h-2.5 w-2.5" />
                            {status}
                          </span>
                        </td>
                        <td className="py-3 font-mono text-slate-400 text-[11px]">{checkInTime}</td>
                        <td className="py-3 text-right">
                          <div className="inline-flex items-center gap-1.5">
                            {/* 1-Click Mark Present */}
                            <button
                              type="button"
                              onClick={() => handleQuickMark(s.id, 'PRESENT')}
                              title="Mark Present for this date"
                              className={`px-2 py-1 rounded-lg text-[10px] font-semibold transition-all border ${
                                status === 'PRESENT'
                                  ? 'bg-emerald-500/20 border-emerald-500/40 text-emerald-300'
                                  : 'bg-white/[0.04] border-white/10 hover:bg-emerald-500/10 hover:border-emerald-500/30 text-slate-300'
                              }`}
                            >
                              Present
                            </button>

                            {/* 1-Click Mark Absent */}
                            <button
                              type="button"
                              onClick={() => handleQuickMark(s.id, 'ABSENT')}
                              title="Mark Absent for this date"
                              className={`px-2 py-1 rounded-lg text-[10px] font-semibold transition-all border ${
                                status === 'ABSENT'
                                  ? 'bg-rose-500/20 border-rose-500/40 text-rose-300'
                                  : 'bg-white/[0.04] border-white/10 hover:bg-rose-500/10 hover:border-rose-500/30 text-slate-300'
                              }`}
                            >
                              Absent
                            </button>

                            {/* Custom Note & Time Modal Trigger */}
                            <button
                              type="button"
                              onClick={() => {
                                setCorrectionTarget({
                                  studentId: s.id,
                                  studentName: s.name,
                                  rollNo: s.rollNo,
                                  currentStatus: status,
                                  currentTime: checkInTime !== '-' ? checkInTime : '08:15:00'
                                });
                                setNewStatus(status !== 'NOT_MARKED' ? status : 'PRESENT');
                                setCustomTime(checkInTime !== '-' ? checkInTime : '08:15:00');
                                setCorrectionReason('');
                              }}
                              className="p-1 rounded-lg border border-white/10 bg-white/[0.04] hover:bg-white/[0.1] text-slate-300 hover:text-white transition-all"
                              title="Custom status & remarks"
                            >
                              <FileEdit className="h-3 w-3 text-emerald-400" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
          )}
        </div>
      </div>

      {/* Attendance Modification & Backdated Entry Modal */}
      {correctionTarget && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm p-4 animate-in fade-in duration-200">
          <div className="w-full max-w-md rounded-2xl border border-white/10 bg-[#0A0E17] p-6 shadow-2xl text-white space-y-4">
            <div className="flex items-center justify-between border-b border-white/[0.08] pb-3">
              <div className="flex items-center gap-2">
                <FileEdit className="h-5 w-5 text-emerald-400" />
                <h3 className="font-bold text-base">Record Attendance ({selectedDate})</h3>
              </div>
              <button
                onClick={() => setCorrectionTarget(null)}
                className="p-1 rounded-lg text-slate-400 hover:text-white"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <div className="p-3 rounded-xl bg-white/[0.02] border border-white/[0.06] text-xs space-y-1">
              <div>Student: <span className="font-semibold text-white">{correctionTarget.studentName}</span> (Roll: {correctionTarget.rollNo})</div>
              <div>Selected Date: <span className="font-mono text-emerald-400 font-semibold">{selectedDate}</span></div>
              <div>Current Status on Date: <span className="font-mono text-cyan-400 font-semibold">{correctionTarget.currentStatus}</span></div>
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-slate-300">Attendance Status</label>
              <div className="grid grid-cols-3 gap-2">
                {(['PRESENT', 'LATE', 'LEAVE', 'HALF_DAY', 'EXCUSED', 'ABSENT'] as AttendanceStatus[]).map((st) => (
                  <button
                    key={st}
                    type="button"
                    onClick={() => setNewStatus(st)}
                    className={`py-1.5 rounded-lg text-xs font-bold border transition-colors ${
                      newStatus === st
                        ? 'border-emerald-400 bg-emerald-500/20 text-emerald-300'
                        : 'border-white/10 bg-white/[0.02] text-slate-400'
                    }`}
                  >
                    {st}
                  </button>
                ))}
              </div>
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-slate-300">Check-in Time (Optional)</label>
              <input
                type="text"
                value={customTime}
                onChange={(e) => setCustomTime(e.target.value)}
                placeholder="08:15:00"
                className="w-full rounded-xl border border-white/10 bg-black/60 px-3 py-2 text-xs text-white font-mono focus:border-emerald-500 focus:outline-none"
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-slate-300">Administrative Reason / Remarks</label>
              <textarea
                rows={3}
                value={correctionReason}
                onChange={(e) => setCorrectionReason(e.target.value)}
                placeholder="e.g. Backdated entry for 09 Sept verified from physical roll register, Olympiad participation, or medical leave."
                className="w-full rounded-xl border border-white/10 bg-black/60 p-3 text-xs text-white placeholder-slate-500 focus:border-emerald-500 focus:outline-none"
              />
            </div>

            <div className="flex items-center justify-end gap-2 pt-2 border-t border-white/[0.08]">
              <button
                type="button"
                onClick={() => setCorrectionTarget(null)}
                className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-400 hover:text-white"
              >
                Cancel
              </button>
              <button
                type="button"
                disabled={isProcessing}
                onClick={handleApplyCorrection}
                className="px-5 py-2 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-black text-xs font-bold transition-all shadow-glow-emerald disabled:opacity-40"
              >
                {isProcessing ? 'Saving...' : 'Save & Sync Google Sheets'}
              </button>
            </div>
          </div>
        </div>
      )}
    
      {/* Monthly Attendance Inspector Modal */}
      {monthlyInspectorTarget && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 backdrop-blur-md p-4 animate-in fade-in duration-200">
          <div className="w-full max-w-2xl rounded-2xl border border-purple-500/30 bg-[#0A0E17] p-6 shadow-2xl text-white space-y-5">
            {/* Modal Header */}
            <div className="flex items-center justify-between border-b border-white/[0.08] pb-4">
              <div className="flex items-center gap-3">
                <img
                  src={monthlyInspectorTarget.avatarUrl}
                  alt={monthlyInspectorTarget.name}
                  className="h-11 w-11 rounded-xl object-cover border border-purple-500/40 shadow-sm"
                />
                <div>
                  <div className="flex items-center gap-2">
                    <h3 className="font-bold text-base text-white">{monthlyInspectorTarget.name}</h3>
                    <span className="text-[10px] px-2 py-0.5 rounded-full bg-purple-500/20 border border-purple-500/30 text-purple-300 font-mono">
                      Grade {monthlyInspectorTarget.classGrade}-{monthlyInspectorTarget.section}
                    </span>
                  </div>
                  <p className="text-xs text-slate-400 font-mono mt-0.5">
                    Roll #{monthlyInspectorTarget.rollNo} • Adm: {monthlyInspectorTarget.admissionNo} • Guardian: {monthlyInspectorTarget.parentName}
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setMonthlyInspectorTarget(null)}
                className="p-1.5 rounded-xl border border-white/10 bg-white/[0.04] text-slate-400 hover:text-white hover:bg-white/[0.08] transition-all"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            {/* Selected Month Stats Card */}
            {(() => {
              const mStats = getStudentMonthlyStats(monthlyInspectorTarget, selectedAttendanceMonth);
              const curMonthName = monthNames[parseInt(selectedAttendanceMonth.split('-')[1], 10) - 1];
              const [y, mNum] = selectedAttendanceMonth.split('-').map(Number);
              const daysInMonth = new Date(y, mNum, 0).getDate();

              return (
                <div className="space-y-4">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-3.5 rounded-xl border border-purple-500/25 bg-gradient-to-r from-purple-950/30 via-[#0E1322] to-[#0A0E17]">
                    <div>
                      <span className="text-[10px] font-mono uppercase text-purple-400 tracking-wider">Attendance Ledger Report</span>
                      <h4 className="text-lg font-bold text-white mt-0.5">{curMonthName} {y} Attendance Analysis</h4>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className={`px-3 py-1 rounded-lg text-xs font-mono font-bold border ${
                        mStats.isUpcoming
                          ? 'bg-purple-500/20 border-purple-500/40 text-purple-300'
                          : mStats.isSafe
                          ? 'bg-emerald-500/20 border-emerald-500/40 text-emerald-300'
                          : 'bg-rose-500/20 border-rose-500/40 text-rose-300'
                      }`}>
                        {mStats.isUpcoming ? 'UPCOMING (No Data)' : mStats.isSafe ? 'CBSE Compliant (>=75%)' : 'Shortage Deficit (<75%)'}
                      </span>
                    </div>
                  </div>

                  {/* 4 Stat Badges */}
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
                    <div className="p-3 rounded-xl border border-white/[0.08] bg-black/40">
                      <span className="text-[10px] font-mono text-slate-400">Total Working Days</span>
                      <div className="text-base font-bold text-white mt-0.5 font-mono">{mStats.totalWorkingDays} Days</div>
                      <span className="text-[9px] text-slate-500 font-mono">Excludes Sundays</span>
                    </div>
                    <div className="p-3 rounded-xl border border-white/[0.08] bg-black/40">
                      <span className="text-[10px] font-mono text-slate-400">Days Present</span>
                      <div className="text-base font-bold text-emerald-400 mt-0.5 font-mono">{mStats.presents} Days</div>
                      <span className="text-[9px] text-emerald-500 font-mono">{mStats.lates > 0 ? `${mStats.lates} Late arrivals` : 'On-time record'}</span>
                    </div>
                    <div className="p-3 rounded-xl border border-white/[0.08] bg-black/40">
                      <span className="text-[10px] font-mono text-slate-400">Days Absent</span>
                      <div className="text-base font-bold text-rose-400 mt-0.5 font-mono">{mStats.absents} Days</div>
                      <span className="text-[9px] text-rose-400 font-mono">{mStats.absents > 0 ? 'Recorded unexcused' : '0 Absences'}</span>
                    </div>
                    <div className="p-3 rounded-xl border border-white/[0.08] bg-black/40">
                      <span className="text-[10px] font-mono text-slate-400">Monthly Attendance Rate</span>
                      <div className="text-base font-bold text-purple-400 mt-0.5 font-mono">
                        {mStats.isUpcoming ? 'UPCOMING' : `${mStats.percentage}%`}
                      </div>
                      <span className="text-[9px] text-slate-400 font-mono">All-time: {monthlyInspectorTarget.attendancePercentage}%</span>
                    </div>
                  </div>

                  {/* Day-by-Day Visual Calendar Grid for Selected Month */}
                  <div>
                    <div className="flex items-center justify-between text-xs font-mono text-slate-400 mb-2">
                      <span>Day-by-Day Attendance Log ({curMonthName} 1 - {daysInMonth})</span>
                      <div className="flex items-center gap-3 text-[10px]">
                        <span className="flex items-center gap-1"><span className="w-2 h-2 rounded bg-emerald-500"></span> Present</span>
                        <span className="flex items-center gap-1"><span className="w-2 h-2 rounded bg-amber-500"></span> Late</span>
                        <span className="flex items-center gap-1"><span className="w-2 h-2 rounded bg-rose-500"></span> Absent</span>
                        <span className="flex items-center gap-1"><span className="w-2 h-2 rounded bg-purple-500/40"></span> Sun Holiday</span>
                      </div>
                    </div>

                    <div className="grid grid-cols-7 gap-1.5 p-3 rounded-xl bg-black/50 border border-white/[0.08] max-h-56 overflow-y-auto">
                      {Array.from({ length: daysInMonth }, (_, idx) => {
                        const dayNum = idx + 1;
                        const dateStr = `${selectedAttendanceMonth}-${String(dayNum).padStart(2, '0')}`;
                        const dObj = new Date(y, mNum - 1, dayNum);
                        const isSunday = dObj.getDay() === 0;
                        const dayRec = attendance.find(a =>
                          a.date === dateStr &&
                          (a.personId.toUpperCase() === monthlyInspectorTarget.id.toUpperCase() ||
                           a.personId.toUpperCase() === monthlyInspectorTarget.admissionNo.toUpperCase() ||
                           (a.personName && a.personName.toLowerCase() === monthlyInspectorTarget.name.toLowerCase()))
                        );
                        const isFuture = dateStr > kolkataToday;
                        const st = dayRec?.status || (isFuture ? 'FUTURE' : (isSunday ? 'HOLIDAY' : 'PRESENT'));

                        return (
                          <div
                            key={dateStr}
                            title={`${dateStr}: ${isSunday ? 'Sunday Holiday' : st} ${dayRec?.timeDisplay ? '(' + dayRec.timeDisplay + ')' : ''}`}
                            className={`p-1.5 rounded-lg border text-center font-mono text-[10px] transition-all ${
                              isSunday
                                ? 'bg-purple-950/25 border-purple-500/20 text-purple-300'
                                : st === 'PRESENT'
                                ? 'bg-emerald-500/15 border-emerald-500/30 text-emerald-300'
                                : st === 'LATE'
                                ? 'bg-amber-500/15 border-amber-500/30 text-amber-300'
                                : st === 'ABSENT'
                                ? 'bg-rose-500/15 border-rose-500/30 text-rose-300'
                                : 'bg-white/[0.02] border-white/[0.05] text-slate-500'
                            }`}
                          >
                            <div className="font-bold">{dayNum}</div>
                            <div className="text-[8px] uppercase tracking-tighter truncate">
                              {isSunday ? 'SUN' : st === 'PRESENT' ? 'P' : st === 'LATE' ? 'L' : st === 'ABSENT' ? 'A' : '--'}
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>

                  {/* Actions Footer */}
                  <div className="flex items-center justify-between pt-3 border-t border-white/[0.08] text-xs">
                    <span className="text-[11px] text-slate-400 font-mono">
                      Data reconciled with Google Sheets & local biometric ledger.
                    </span>
                    <button
                      type="button"
                      onClick={() => setMonthlyInspectorTarget(null)}
                      className="px-4 py-1.5 rounded-xl bg-purple-600 hover:bg-purple-500 text-white font-bold text-xs shadow-md shadow-purple-600/25 transition-all"
                    >
                      Done / Close
                    </button>
                  </div>
                </div>
              );
            })()}
          </div>
        </div>
      )}

    </div>
  );
};
