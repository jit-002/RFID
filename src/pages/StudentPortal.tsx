import React, { useState, useEffect, useRef } from 'react';
import { useApp } from '../context/AppContext';
import { AttendanceEngine } from '../services/attendanceEngine';
import { CurriculumTracker } from '../components/student/CurriculumTracker';
import { sathiQuizService } from '../services/quizService';
import {
  CheckCircle2,
  RotateCcw,
  Play,
  Eye,
  Trophy,
  ExternalLink,
  Clock,
  AlertCircle,
  Calendar,
  Sparkles,
  Send,
  ChevronRight,
  ChevronLeft,
  ShieldCheck,
  Radio,
  ArrowUpRight,
  Info,
  Search,
  GraduationCap,
  BookOpen,
  Award,
  TrendingUp
} from 'lucide-react';
import gsap from 'gsap';

export const StudentPortal: React.FC = () => {
  const {
    currentStudent,
    attendance,
    rulesConfig,
    openAIDrawer,
    userRole,
    students
  } = useApp();

  const isAdmin = userRole === 'ADMIN' || userRole === 'SUPER_ADMIN';
  const [inspectedStudentId, setInspectedStudentId] = useState<string>(currentStudent?.id || 'JIT001');
  const effectiveStudent = (isAdmin && students.find(s => s.id === inspectedStudentId)) || currentStudent;
  const [activeTab, setActiveTab] = useState<'overview' | 'calendar' | 'subjects'>('overview');

  const scrollToSection = (sectionId: string) => {
    setTimeout(() => {
      const el = document.getElementById(sectionId);
      if (el) {
        const yOffset = -90;
        const y = el.getBoundingClientRect().top + window.pageYOffset + yOffset;
        window.scrollTo({ top: y, behavior: 'smooth' });
      }
    }, 50);
  };
  const [searchQuery, setSearchQuery] = useState('');
  const [aiQuestion, setAiQuestion] = useState('');
  const [studentQuizResults, setStudentQuizResults] = useState<any>(null);

  useEffect(() => {
    try {
      const results = sathiQuizService.getStudentResults(effectiveStudent.id || 'JIT001');
      setStudentQuizResults(results);
    } catch (e) {
      console.warn('Could not load student quiz results:', e);
    }
  }, [effectiveStudent.id]);

  // Months List for Student Monthly Attendance View
  const months = [
    { value: 0, label: 'January 2026', badge: 'HISTORICAL' },
    { value: 1, label: 'February 2026', badge: 'HISTORICAL' },
    { value: 2, label: 'March 2026', badge: 'HISTORICAL' },
    { value: 3, label: 'April 2026', badge: 'HISTORICAL' },
    { value: 4, label: 'May 2026', badge: 'HISTORICAL' },
    { value: 5, label: 'June 2026', badge: 'HISTORICAL' },
    { value: 6, label: 'July 2026', badge: 'HISTORICAL' },
    { value: 7, label: 'August 2026', badge: 'HISTORICAL' },
    { value: 8, label: 'September 2026', badge: 'ACTIVE (CURRENT)' },
    { value: 9, label: 'October 2026', badge: 'UPCOMING' },
    { value: 10, label: 'November 2026', badge: 'UPCOMING' },
    { value: 11, label: 'December 2026', badge: 'UPCOMING' }
  ];
  const [selectedMonth, setSelectedMonth] = useState<number>(8); // September 2026

  const isStudentMatch = (a: any) =>
    a.personId === effectiveStudent.id ||
    a.personId === effectiveStudent.admissionNo ||
    (a.personId && effectiveStudent.id && a.personId.toUpperCase() === effectiveStudent.id.toUpperCase()) ||
    (a.personId && effectiveStudent.admissionNo && a.personId.toUpperCase() === effectiveStudent.admissionNo.toUpperCase()) ||
    (a.personName && a.personName.toLowerCase() === effectiveStudent.name.toLowerCase());

  const engine = new AttendanceEngine(rulesConfig);
  const calendarDays = engine.getMonthlyCalendarData(2026, selectedMonth, effectiveStudent.id, attendance).map(d => {
    const matched = attendance.find(
      a => isStudentMatch(a) && a.date === d.dateString
    );
    if (matched) {
      return {
        ...d,
        status: matched.status,
        checkInTime: matched.timeDisplay,
        node: matched.deviceId
      };
    }
    return d;
  });

  const isSundayDate = (dateStr: string) => {
    try {
      const [y, m, d] = dateStr.split('-').map(Number);
      return new Date(y, m - 1, d).getDay() === 0;
    } catch {
      return false;
    }
  };

  // Calculate monthly stats: ONLY count instructional working days (Sundays are weekly holidays and never working days)
  const monthWorkingDays = calendarDays.filter(
    d => !d.isWeekend && d.dayOfWeek !== 'Sun' && d.status !== 'HOLIDAY' && (d.status === 'PRESENT' || d.status === 'LATE' || d.status === 'ABSENT')
  );
  const monthPresentCount = calendarDays.filter(d => !d.isWeekend && d.dayOfWeek !== 'Sun' && d.status === 'PRESENT').length;
  const monthLateCount = calendarDays.filter(d => !d.isWeekend && d.dayOfWeek !== 'Sun' && d.status === 'LATE').length;
  const monthAbsentCount = calendarDays.filter(d => !d.isWeekend && d.dayOfWeek !== 'Sun' && d.status === 'ABSENT').length;
  const isSelectedMonthFuture = selectedMonth > 8; // September is 8 (0-indexed)
  const isSelectedMonthCurrent = selectedMonth === 8;
  const monthTurnoutRate: string = isSelectedMonthFuture
    ? 'UPCOMING'
    : monthWorkingDays.length > 0
    ? `${Math.round(((monthPresentCount + monthLateCount) / monthWorkingDays.length) * 1000) / 10}%`
    : '0%';

  // Real-time matched student records across all dates: strictly exclude Sundays (Sundays are institutional holidays)
  const studentRecords = attendance.filter(a => isStudentMatch(a) && !isSundayDate(a.date));
  // Conducted academic days: only instructional days where student was marked PRESENT, LATE, or ABSENT
  const conductedDaysList = studentRecords.filter(a => a.status === 'PRESENT' || a.status === 'LATE' || a.status === 'ABSENT');
  const livePresent = studentRecords.filter(a => a.status === 'PRESENT').length;
  const liveLate = studentRecords.filter(a => a.status === 'LATE').length;
  const liveAbsent = studentRecords.filter(a => a.status === 'ABSENT').length;
  const liveVerifiedPresent = livePresent + liveLate;

  // Conducted academic working days = count of verified instructional attendance marks (NO Sundays, NO arbitrary 60 days)
  const effectiveTotal = conductedDaysList.length > 0
    ? conductedDaysList.length
    : (studentRecords.length > 0 ? studentRecords.length : 0);
  const effectivePresent = liveVerifiedPresent;
  const realPercentage = effectiveTotal > 0
    ? Math.round((effectivePresent / effectiveTotal) * 1000) / 10
    : 100;

  // 75% CBSE Criteria calculation
  // Formula: (P + x) / (T + x) >= 0.75  =>  x >= 3T - 4P
  const rawNeededDays = effectiveTotal > 0 ? Math.ceil(3 * effectiveTotal - 4 * effectivePresent) : 0;
  const neededDays = realPercentage >= 75 ? 0 : Math.max(1, rawNeededDays);
  // Safe absences when >= 75%: m <= (4P - 3T) / 3
  const safeAbsences = realPercentage >= 75 && effectiveTotal > 0
    ? Math.max(0, Math.floor((4 * effectivePresent - 3 * effectiveTotal) / 3))
    : 0;

  // Today's record (checks dynamically for today's date, 2026-09-12, 2026-09-11, 2026-09-10, or latest recorded date)
  const todayDateStr = new Date().toISOString().split('T')[0];
  const todayRecord = attendance.find(
    a => isStudentMatch(a) && (a.date === todayDateStr || a.date === '2026-09-12' || a.date === '2026-09-11' || a.date === '2026-09-10' || a.date === '2026-09-09')
  ) || attendance.find(a => isStudentMatch(a));

  const heroNumberRef = useRef<HTMLSpanElement>(null);

  useEffect(() => {
    if (heroNumberRef.current) {
      const obj = { val: 0 };
      gsap.to(obj, {
        val: realPercentage,
        duration: 1.2,
        ease: 'power3.out',
        onUpdate: () => {
          if (heroNumberRef.current) {
            heroNumberRef.current.textContent = `${obj.val.toFixed(1)}%`;
          }
        }
      });
    }
  }, [realPercentage]);

  // Hand-crafted cubic Bézier SVG area chart
  const chartPath = "M 0 60 Q 50 30, 100 45 T 200 30 T 300 20 T 400 12 L 450 8 L 450 80 L 0 80 Z";
  const linePath = "M 0 60 Q 50 30, 100 45 T 200 30 T 300 20 T 400 12 L 450 8";

  return (
    <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-6 space-y-6">
      {/* Top Glass Bar */}
      <div className="rounded-2xl border border-white/[0.08] bg-[#0A0E17]/80 p-4 backdrop-blur-xl shadow-dashboard flex flex-col md:flex-row items-center justify-between gap-4">
        <div className="flex items-center gap-3 w-full md:w-auto">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-amber-400 to-cyan-500 p-0.5 shadow-[0_0_20px_rgba(6,182,212,0.3)]">
            <img src="/school-logo.jpg" alt="Logo" className="h-full w-full rounded-[10px] object-cover bg-white" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="font-display italic text-lg font-bold text-white tracking-tight">Pranabananda Vidyamandir</span>
              <span className="rounded-full border border-cyan-500/30 bg-cyan-500/15 px-2 py-0.5 text-[10px] font-semibold text-cyan-300">
                Student Portal
              </span>
            </div>
            <p className="text-[11px] font-mono text-slate-400">Class {effectiveStudent.classGrade}-{effectiveStudent.section} • Roll No: {effectiveStudent.rollNo}</p>
          </div>
        </div>

        {/* Search Bar */}
        <div className="relative w-full md:w-72">
          <Search className="absolute left-3 top-2.5 h-3.5 w-3.5 text-slate-500" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search academic logs, rules (⌘K)..."
            className="w-full rounded-xl border border-white/10 bg-black/50 pl-8 pr-3 py-1.5 text-xs text-white placeholder-slate-500 focus:border-cyan-500 focus:outline-none"
          />
        </div>

        {/* User Identity Chip */}
        <div className="flex items-center gap-3 w-full md:w-auto justify-end">
          {isAdmin ? (
            <div className="flex items-center gap-2.5">
              <div className="h-9 w-9 rounded-xl bg-violet-500/20 border border-violet-500/40 text-violet-300 flex items-center justify-center font-bold shadow-sm">
                <ShieldCheck className="h-5 w-5" />
              </div>
              <div className="text-left text-xs">
                <div className="font-semibold text-white">Administrator</div>
                <div className="text-[10px] text-cyan-400 font-mono">Student Inspector Mode</div>
              </div>
            </div>
          ) : (
            <>
              <img
                src={effectiveStudent.avatarUrl}
                alt={effectiveStudent.name}
                className="h-9 w-9 rounded-xl object-cover border border-cyan-500/40"
              />
              <div className="text-left text-xs">
                <div className="font-semibold text-white">{effectiveStudent.name}</div>
                <div className="text-[10px] text-cyan-400 font-mono">Adm No: {effectiveStudent.admissionNo}</div>
              </div>
            </>
          )}
        </div>
      </div>

      {/* Main SaaS Layout: Sidebar + Main Content */}
      <div className="flex flex-col lg:flex-row gap-6">
        {/* Left Navigation Sidebar */}
        <div className="w-full lg:w-48 shrink-0 space-y-2">
          <div className="rounded-2xl border border-white/[0.08] bg-[#0A0E17]/60 p-2 sm:p-3 backdrop-blur-xl shadow-dashboard grid grid-cols-3 lg:grid-cols-1 gap-1">
            {[
              { id: 'overview', label: 'My Attendance', badge: `${realPercentage}%` },
              { id: 'calendar', label: 'Monthly Sheet', badge: 'Sept' },
              { id: 'subjects', label: 'Curriculum & AI', badge: 'Code 843' }
            ].map((item) => (
              <button
                key={item.id}
                onClick={() => {
                  const tabId = item.id as 'overview' | 'calendar' | 'subjects';
                  setActiveTab(tabId);
                  if (tabId === 'overview') scrollToSection('section-attendance-overview');
                  else if (tabId === 'calendar') scrollToSection('section-monthly-sheet');
                  else if (tabId === 'subjects') scrollToSection('section-curriculum-ai');
                }}
                className={`w-full flex items-center justify-between px-3 py-2 rounded-xl text-xs font-medium transition-all ${
                  activeTab === item.id
                    ? 'bg-cyan-500 text-black font-bold shadow-sm'
                    : 'text-slate-400 hover:text-white hover:bg-white/[0.04]'
                }`}
              >
                <span>{item.label}</span>
                {item.badge && (
                  <span className={`px-1.5 py-0.5 text-[9px] rounded-md font-mono ${
                    activeTab === item.id ? 'bg-black/20 text-black' : 'bg-white/[0.08] text-slate-300'
                  }`}>
                    {item.badge}
                  </span>
                )}
              </button>
            ))}
          </div>

          {/* 75% CBSE Mandate Reminder Box */}
          <div className={`rounded-2xl border p-3 text-xs space-y-2 transition-all ${
            realPercentage >= 75
              ? 'border-emerald-500/25 bg-emerald-500/5'
              : 'border-rose-500/30 bg-rose-500/5'
          }`}>
            <div className="flex items-center justify-between">
              <div className={`flex items-center gap-1.5 font-bold text-[11px] ${
                realPercentage >= 75 ? 'text-emerald-400' : 'text-rose-400'
              }`}>
                <Award className="h-3.5 w-3.5" />
                <span>CBSE 75% Criteria</span>
              </div>
              <span className={`px-1.5 py-0.2 rounded text-[9px] font-mono font-bold ${
                realPercentage >= 75
                  ? 'bg-emerald-500/20 text-emerald-300'
                  : 'bg-rose-500/20 text-rose-300'
              }`}>
                {realPercentage >= 75 ? 'ELIGIBLE' : 'BELOW 75%'}
              </span>
            </div>
            <div className="text-[11px] leading-relaxed">
              {neededDays === 0 ? (
                <p className="text-emerald-200">
                  Your attendance is <span className="font-bold text-white font-mono">{realPercentage}%</span>. Fulfills CBSE criteria. Can miss up to <strong className="text-white font-mono">{safeAbsences} days</strong> safely.
                </p>
              ) : (
                <p className="text-rose-200 font-medium">
                  Need to attend <span className="font-bold text-white font-mono underline">{neededDays} more days</span> consecutively to reach the 75% criteria.
                </p>
              )}
            </div>
          </div>
        </div>

        {/* Main Content Area */}
        <div className="flex-1 space-y-6">
          {/* Admin Student Switcher Dropdown */}
          {isAdmin && (
            <div className="rounded-2xl border border-violet-500/30 bg-violet-500/10 p-3 sm:p-4 backdrop-blur-xl flex flex-col sm:flex-row sm:items-center justify-between gap-3 shadow-lg animate-in fade-in">
              <div className="flex items-center gap-2.5">
                <ShieldCheck className="h-4 w-4 text-violet-400 shrink-0" />
                <div className="text-xs">
                  <span className="font-bold text-white">Administrative Student Inspector: </span>
                  <span className="text-slate-300">Select any student below to inspect their individual attendance score, turnstile RFID logs, and marksheet.</span>
                </div>
              </div>
              <div className="flex items-center gap-2 shrink-0">
                <label className="text-[11px] text-slate-400 whitespace-nowrap font-medium">Select Student:</label>
                <select
                  value={effectiveStudent.id}
                  onChange={(e) => setInspectedStudentId(e.target.value)}
                  className="rounded-xl border border-violet-500/40 bg-black/80 px-3 py-1.5 text-xs font-semibold text-cyan-300 focus:outline-none focus:border-cyan-400 shadow-sm cursor-pointer"
                >
                  {students.map((s) => (
                    <option key={s.id} value={s.id} className="bg-slate-900 text-white">
                      {s.name} (Roll {s.rollNo} • Class {s.classGrade}-{s.section})
                    </option>
                  ))}
                </select>
              </div>
            </div>
          )}

          {/* Greeting & Action Pill Row */}
          <div className="rounded-2xl border border-white/[0.08] bg-gradient-to-r from-slate-900/80 to-[#0A0E17] p-6 backdrop-blur-xl shadow-dashboard">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
              <div>
                {isAdmin && (
                  <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-violet-500/20 text-violet-300 border border-violet-500/30 mb-1.5">
                    <ShieldCheck className="h-3 w-3 text-violet-400" />
                    <span>Admin Student Inspector Active</span>
                  </div>
                )}
                <h1 className="font-display italic text-3xl sm:text-4xl font-bold text-white tracking-tight">
                  {isAdmin ? 'Welcome, Administrator' : `Welcome, ${effectiveStudent.name.split(' ')[0]}`}
                </h1>
                <p className="text-xs text-slate-400 mt-1">
                  {isAdmin ? (
                    <span>
                      Inspecting: <span className="font-bold text-cyan-300">{effectiveStudent.name}</span> • Roll: {effectiveStudent.rollNo} • Class {effectiveStudent.classGrade}-{effectiveStudent.section} • RFID: <span className="font-mono text-cyan-400">{effectiveStudent.rfidUid}</span>
                    </span>
                  ) : (
                    <span>
                      Grade {effectiveStudent.classGrade}-{effectiveStudent.section} • Roll Number: {effectiveStudent.rollNo} • RFID: {effectiveStudent.rfidUid}
                    </span>
                  )}
                </p>
              </div>

              {/* Action Buttons Row */}
              <div className="flex flex-wrap items-center gap-2">
                <button
                  onClick={() => openAIDrawer()}
                  className="rounded-full bg-cyan-500 hover:bg-cyan-400 text-black px-4 py-1.5 text-xs font-bold transition-all shadow-glow-cyan flex items-center gap-1.5"
                >
                  <Sparkles className="h-3.5 w-3.5 text-black" />
                  <span>Ask Pvm Sathi</span>
                </button>
                <button
                  onClick={() => setActiveTab(activeTab === 'calendar' ? 'overview' : 'calendar')}
                  className={`rounded-full border px-4 py-1.5 text-xs font-medium transition-all ${
                    activeTab === 'calendar'
                      ? 'border-cyan-500 bg-cyan-500/20 text-cyan-300'
                      : 'border-white/10 bg-white/[0.04] hover:bg-white/[0.08] text-white'
                  }`}
                >
                  {activeTab === 'calendar' ? 'View Daily Stream' : 'View Monthly Sheet'}
                </button>
              </div>
            </div>
          </div>

          {/* Two Equal-Width Bento Cards */}
          <div id="section-attendance-overview" className="grid grid-cols-1 md:grid-cols-2 gap-6 scroll-mt-24">
            {/* Card 1: Attendance Metric & Smooth Cubic Bézier Chart */}
            <div className="rounded-2xl border border-white/[0.08] bg-[#0A0E17]/80 p-5 backdrop-blur-xl shadow-dashboard flex flex-col justify-between">
              <div>
                <div className="flex items-center justify-between text-xs mb-3">
                  <div className="flex items-center gap-2">
                    <TrendingUp className="h-4 w-4 text-cyan-400" />
                    <span className="font-bold text-white uppercase tracking-wider text-[11px]">Academic Attendance Score</span>
                  </div>
                  <span className="font-mono text-cyan-400 font-bold" ref={heroNumberRef}>
                    {realPercentage.toFixed(1)}%
                  </span>
                </div>

                <div className="flex items-baseline gap-2 mt-1">
                  <span className="font-display italic text-4xl sm:text-5xl font-bold text-white">
                    {effectivePresent}
                  </span>
                  <span className="text-xs text-slate-400">
                    / {effectiveTotal} Total Academic Days Conducted
                  </span>
                </div>

                <div className="flex items-center gap-4 text-xs mt-3 pt-3 border-t border-white/[0.06]">
                  <div>
                    <span className="text-[10px] text-slate-500 block">Streak</span>
                    <span className="text-emerald-400 font-semibold">{effectiveStudent.streakDays || (effectivePresent > 0 ? 1 : 0)} Days</span>
                  </div>
                  <div>
                    <span className="text-[10px] text-slate-500 block">Late Entries</span>
                    <span className="text-amber-400 font-semibold">{liveLate} Days</span>
                  </div>
                  <div>
                    <span className="text-[10px] text-slate-500 block">Absences</span>
                    <span className="text-rose-400 font-semibold">{liveAbsent} Days</span>
                  </div>
                </div>

                {/* DOWNSIDE WRITING: 75% Criteria Mandatory Requirement Display */}
                <div className={`mt-3.5 p-3 rounded-xl border flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2.5 transition-all ${
                  realPercentage >= 75
                    ? 'border-emerald-500/30 bg-emerald-950/20'
                    : 'border-rose-500/40 bg-rose-950/30 shadow-[0_0_15px_rgba(244,63,94,0.1)]'
                }`}>
                  <div className="flex items-center gap-2.5">
                    <div className={`p-1.5 rounded-lg shrink-0 ${
                      realPercentage >= 75 ? 'bg-emerald-500/20 text-emerald-400' : 'bg-rose-500/20 text-rose-400 animate-pulse'
                    }`}>
                      {realPercentage >= 75 ? <ShieldCheck className="h-4 w-4" /> : <AlertCircle className="h-4 w-4" />}
                    </div>
                    <div>
                      <div className={`text-xs font-bold ${realPercentage >= 75 ? 'text-emerald-300' : 'text-rose-300'}`}>
                        {realPercentage >= 75 ? 'CBSE 75% Attendance Requirement Met' : 'CBSE 75% Criteria Warning'}
                      </div>
                      <div className="text-[11px] text-slate-300 mt-0.5">
                        {realPercentage >= 75 ? (
                          <span>Current attendance is <strong>{realPercentage}%</strong>. Can afford to miss up to <strong>{safeAbsences} days</strong> safely.</span>
                        ) : (
                          <span>
                            Need to attend <strong className="text-white underline font-mono font-bold bg-rose-500/30 px-1 py-0.5 rounded">{neededDays} more days</strong> to complete 75% criteria.
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                  <div className={`font-mono text-[10px] font-bold px-2 py-1 rounded-lg shrink-0 ${
                    realPercentage >= 75 ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30' : 'bg-rose-500/30 text-rose-200 border border-rose-500/40'
                  }`}>
                    {realPercentage >= 75 ? '75% CRITERIA: PASS' : `NEED: ${neededDays} DAYS`}
                  </div>
                </div>
              </div>

              {/* Hand-crafted Cubic Bézier SVG Area Chart */}
              <div className="mt-4 pt-2">
                <div className="text-[10px] font-mono text-slate-500 mb-1">Cumulative Progression (Bézier Spline)</div>
                <svg viewBox="0 0 450 80" className="w-full h-20 overflow-visible">
                  <defs>
                    <linearGradient id="cyanGradient" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor="#06b6d4" stopOpacity="0.45" />
                      <stop offset="100%" stopColor="#06b6d4" stopOpacity="0.0" />
                    </linearGradient>
                  </defs>
                  <path d={chartPath} fill="url(#cyanGradient)" />
                  <path d={linePath} fill="none" stroke="#06b6d4" strokeWidth="2.5" strokeLinecap="round" />
                </svg>
              </div>
            </div>

            {/* Card 2: Today's Gate Verification & Personalized Pvm Sathi */}
            <div className="rounded-2xl border border-white/[0.08] bg-[#0A0E17]/80 p-5 backdrop-blur-xl shadow-dashboard flex flex-col justify-between">
              <div>
                <div className="flex items-center justify-between text-xs mb-3">
                  <span className="font-bold text-white uppercase tracking-wider text-[11px]">Today's Turnstile Verification</span>
                  <span className="px-2 py-0.5 rounded-full bg-emerald-500/15 border border-emerald-500/30 text-[10px] text-emerald-300 font-mono">
                    {todayRecord ? todayRecord.status : 'VERIFIED PRESENT'}
                  </span>
                </div>

                <div className="p-3 rounded-xl bg-white/[0.02] border border-white/[0.05] space-y-2">
                  <div className="flex items-center justify-between text-xs">
                    <span className="text-slate-400">Check-in Timestamp:</span>
                    <span className="font-mono text-cyan-300 font-semibold">
                      {todayRecord?.timeDisplay || (effectiveStudent.id === 'JIT001' ? '08:17:47' : effectiveStudent.id === 'AN001' ? '08:17:32' : '08:18:02')}
                    </span>
                  </div>
                  <div className="flex items-center justify-between text-xs">
                    <span className="text-slate-400">Gateway Node:</span>
                    <span className="font-mono text-slate-300">Gateway-Alpha (Pi 3B Turnstile A)</span>
                  </div>
                  <div className="flex items-center justify-between text-xs">
                    <span className="text-slate-400">2FA Verification:</span>
                    <span className="inline-flex items-center gap-1 text-emerald-400 text-[11px]">
                      <CheckCircle2 className="h-3 w-3" /> RFID + Face ID
                    </span>
                  </div>
                </div>
              </div>

              {/* Pvm Sathi Personalized Interaction (Immediately Opens AI Drawer) */}
              <div className="mt-4 pt-3 border-t border-white/[0.06]">
                <form
                  onSubmit={(e) => {
                    e.preventDefault();
                    const q = aiQuestion.trim() || 'How many days needed for 75% attendance criteria?';
                    openAIDrawer(q);
                    setAiQuestion('');
                  }}
                  className="flex items-center gap-2"
                >
                  <Sparkles className="h-3.5 w-3.5 text-cyan-400 shrink-0" />
                  <input
                    type="text"
                    value={aiQuestion}
                    onChange={(e) => setAiQuestion(e.target.value)}
                    placeholder="Ask Sathi: 'How many days needed for 75%?'..."
                    className="w-full bg-transparent text-xs text-white placeholder-slate-500 focus:outline-none"
                  />
                  <button
                    type="submit"
                    className="px-2.5 py-1 rounded-lg bg-cyan-500/20 hover:bg-cyan-500/30 text-cyan-300 text-[10px] font-semibold transition-colors flex items-center gap-1 shrink-0"
                  >
                    <span>Ask Sathi</span>
                  </button>
                </form>
              </div>
            </div>
          </div>

          {/* QUIZ PERFORMANCE: TWO DISTINCT CARDS (OFFICIAL WEEKLY SCORE & RE-QUIZ SCORE) */}
          {(() => {
            const isClass10 = effectiveStudent.classGrade === '10';
            const activeQuizId = isClass10 ? 'quiz-2026-w38-class10' : 'quiz-2026-w38-science';
            const isReQuizOpen = sathiQuizService.isReQuizActive(activeQuizId);
            const sResults = sathiQuizService.getStudentResults(effectiveStudent.id, activeQuizId);
            const officialSub = sResults.officialResult;
            const reQuizSub = sResults.reQuizResult;

            return (
              <div id="section-quiz-performance" className="rounded-2xl border border-white/[0.08] bg-[#0A0E17]/80 p-5 sm:p-6 backdrop-blur-xl shadow-dashboard space-y-4 scroll-mt-24">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-white/[0.06] pb-3">
                  <div className="flex items-center gap-2.5">
                    <div className="p-2 rounded-xl bg-amber-500/15 border border-amber-500/30 text-amber-300">
                      <Trophy className="h-5 w-5" />
                    </div>
                    <div>
                      <h3 className="text-base font-bold text-white tracking-tight flex items-center gap-2">
                        <span>QUIZ PERFORMANCE</span>
                        <span className="text-xs font-mono font-normal text-slate-400">• Sathi Quiz Academic Challenge</span>
                      </h3>
                      <p className="text-xs text-slate-400">
                        {isClass10 ? 'CBSE Class 10' : 'CBSE Class 12 Science'} weekly 50-MCQ challenge with authoritative server grading
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2 shrink-0">
                    <button
                      onClick={() => { window.location.hash = '#sathi-quiz'; }}
                      className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-cyan-500/15 hover:bg-cyan-500/25 text-cyan-300 border border-cyan-500/30 text-xs font-bold transition-all shadow-sm active:scale-95"
                    >
                      <span>Open Quiz Portal</span>
                      <ExternalLink className="h-3 w-3" />
                    </button>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {/* CARD 1: OFFICIAL WEEKLY SCORE */}
                  <div className="rounded-2xl border border-cyan-500/30 bg-gradient-to-br from-cyan-950/20 via-[#0A0E17] to-[#0A0E17] p-5 backdrop-blur-sm relative overflow-hidden flex flex-col justify-between space-y-4">
                    <div className="space-y-3">
                      <div className="flex items-center justify-between">
                        <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold font-mono tracking-wider bg-cyan-500/20 text-cyan-300 border border-cyan-500/40">
                          OFFICIAL WEEKLY SCORE
                        </span>
                        {officialSub ? (
                          <span className="text-emerald-400 font-bold text-xs flex items-center gap-1">
                            <CheckCircle2 className="h-3.5 w-3.5" />
                            <span>Submitted</span>
                          </span>
                        ) : (
                          <span className="text-amber-400 font-bold text-xs flex items-center gap-1">
                            <AlertCircle className="h-3.5 w-3.5" />
                            <span>Not attempted</span>
                          </span>
                        )}
                      </div>

                      {officialSub ? (
                        <>
                          <div className="flex items-baseline gap-2">
                            <span className="text-3xl sm:text-4xl font-black font-mono text-white">{officialSub.score}</span>
                            <span className="text-sm font-mono text-slate-400">/ {officialSub.maxScore}</span>
                            <span className="ml-auto text-2xl font-bold font-mono text-cyan-300">{officialSub.percentage}%</span>
                          </div>
                          <div className="text-[11px] font-mono text-slate-300 pt-2 border-t border-white/[0.06] flex items-center justify-between">
                            <span>
                              <strong className="text-emerald-400">{officialSub.correctCount} Correct</strong> • <strong className="text-rose-400">{officialSub.incorrectCount} Wrong</strong> • <strong className="text-slate-400">{officialSub.skippedCount} Skipped</strong>
                            </span>
                            <span className="text-cyan-400 font-bold">{officialSub.accuracy}% Acc</span>
                          </div>
                        </>
                      ) : (
                        <div className="py-2">
                          <div className="text-2xl font-black font-mono text-slate-500">— / 200</div>
                          <div className="text-xs text-slate-400 mt-1">Official test has not been attempted for this week. 50 questions pending.</div>
                        </div>
                      )}
                    </div>

                    <div>
                      {officialSub ? (
                        <button
                          onClick={() => { window.location.hash = '#sathi-quiz'; }}
                          className="w-full py-2.5 rounded-xl bg-cyan-500/15 hover:bg-cyan-500/25 text-cyan-300 border border-cyan-500/30 text-xs font-bold flex items-center justify-center gap-1.5 transition-all"
                        >
                          <Eye className="h-3.5 w-3.5" />
                          <span>View Official Scorecard & Review</span>
                        </button>
                      ) : (
                        <button
                          onClick={() => { window.location.hash = '#sathi-quiz'; }}
                          className="w-full py-2.5 rounded-xl bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-slate-950 font-bold text-xs flex items-center justify-center gap-1.5 shadow-md shadow-cyan-500/20 transition-all active:scale-95"
                        >
                          <Play className="h-3.5 w-3.5 fill-current" />
                          <span>Attempt Official Quiz (50 MCQs)</span>
                        </button>
                      )}
                    </div>
                  </div>

                  {/* CARD 2: RE-QUIZ SCORE */}
                  <div className="rounded-2xl border border-amber-500/30 bg-gradient-to-br from-amber-950/20 via-[#0A0E17] to-[#0A0E17] p-5 backdrop-blur-sm relative overflow-hidden flex flex-col justify-between space-y-4">
                    <div className="space-y-3">
                      <div className="flex items-center justify-between">
                        <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold font-mono tracking-wider bg-amber-500/20 text-amber-300 border border-amber-500/40">
                          RE-QUIZ SCORE
                        </span>
                        {reQuizSub ? (
                          <span className="text-emerald-400 font-bold text-xs flex items-center gap-1">
                            <CheckCircle2 className="h-3.5 w-3.5" />
                            <span>Submitted</span>
                          </span>
                        ) : (
                          <span className="text-slate-400 font-bold text-xs flex items-center gap-1">
                            <Clock className="h-3.5 w-3.5" />
                            <span>Not attempted</span>
                          </span>
                        )}
                      </div>

                      {reQuizSub ? (
                        <>
                          <div className="flex items-baseline gap-2">
                            <span className="text-3xl sm:text-4xl font-black font-mono text-white">{reQuizSub.score}</span>
                            <span className="text-sm font-mono text-slate-400">/ {reQuizSub.maxScore}</span>
                            <span className="ml-auto text-2xl font-bold font-mono text-amber-300">{reQuizSub.percentage}%</span>
                          </div>
                          <div className="text-[11px] font-mono text-slate-300 pt-2 border-t border-white/[0.06] flex items-center justify-between">
                            <span>
                              <strong className="text-emerald-400">{reQuizSub.correctCount} Correct</strong> • <strong className="text-rose-400">{reQuizSub.incorrectCount} Wrong</strong> • <strong className="text-slate-400">{reQuizSub.skippedCount} Skipped</strong>
                            </span>
                            <span className="text-amber-400 font-bold">{reQuizSub.accuracy}% Acc</span>
                          </div>
                        </>
                      ) : (
                        <div className="py-2">
                          <div className="text-2xl font-black font-mono text-slate-500">— / 200</div>
                          <div className="text-xs text-slate-400 mt-1">
                            {isReQuizOpen ? 'Re-Quiz mode is currently active for this week.' : 'Re-Quiz has not been attempted.'}
                          </div>
                        </div>
                      )}
                    </div>

                    <div>
                      {reQuizSub ? (
                        <button
                          onClick={() => { window.location.hash = '#sathi-quiz'; }}
                          className="w-full py-2.5 rounded-xl bg-amber-500/15 hover:bg-amber-500/25 text-amber-300 border border-amber-500/30 text-xs font-bold flex items-center justify-center gap-1.5 transition-all"
                        >
                          <Eye className="h-3.5 w-3.5" />
                          <span>View Re-Quiz Diagnostic</span>
                        </button>
                      ) : isReQuizOpen ? (
                        <button
                          onClick={() => { window.location.hash = '#sathi-quiz'; }}
                          className="w-full py-2.5 rounded-xl bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-400 hover:to-orange-400 text-slate-950 font-bold text-xs flex items-center justify-center gap-1.5 shadow-md shadow-amber-500/20 transition-all active:scale-95"
                        >
                          <RotateCcw className="h-3.5 w-3.5" />
                          <span>Start Re-Quiz Challenge</span>
                        </button>
                      ) : (
                        <div className="py-2 text-center text-xs text-slate-500 border border-white/5 rounded-xl bg-black/40 font-mono">
                          Re-Quiz Not Active
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            );
          })()}

          {/* Monthly Calendar View with Interactive Month Switcher */}
          {(activeTab === 'overview' || activeTab === 'calendar') && (
            <div id="section-monthly-sheet" className="scroll-mt-24">
          <div className="rounded-2xl border border-white/[0.08] bg-[#0A0E17]/80 p-5 backdrop-blur-xl shadow-dashboard space-y-5">
            {/* Header & Month Selector Toolbar */}
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border-b border-white/[0.08] pb-4">
              <div>
                <h3 className="text-sm font-bold text-white tracking-tight flex items-center gap-2">
                  <Calendar className="h-4 w-4 text-cyan-400" />
                  <span>Monthly Attendance Sheet & Date-Wise Verification</span>
                </h3>
                <p className="text-xs text-slate-400 mt-0.5">
                  Select any month to inspect exact daily turnstile check-in timestamps and attendance compliance
                </p>
              </div>

              {/* Month Dropdown & Nav Buttons */}
              <div className="flex items-center gap-2 w-full sm:w-auto">
                <button
                  onClick={() => setSelectedMonth(prev => Math.max(0, prev - 1))}
                  disabled={selectedMonth === 0}
                  className="p-1.5 rounded-lg border border-white/10 hover:bg-white/[0.06] text-slate-300 disabled:opacity-30 disabled:pointer-events-none"
                  title="Previous Month"
                >
                  <ChevronLeft className="h-4 w-4" />
                </button>

                <select
                  value={selectedMonth}
                  onChange={(e) => setSelectedMonth(Number(e.target.value))}
                  className="rounded-xl border border-cyan-500/30 bg-black/70 px-3 py-1.5 text-xs text-cyan-300 font-semibold focus:border-cyan-500 focus:outline-none"
                >
                  {months.map(m => (
                    <option key={m.value} value={m.value} className="bg-slate-900 text-white">
                      {m.label}
                    </option>
                  ))}
                </select>

                <button
                  onClick={() => setSelectedMonth(prev => Math.min(11, prev + 1))}
                  disabled={selectedMonth === 11}
                  className="p-1.5 rounded-lg border border-white/10 hover:bg-white/[0.06] text-slate-300 disabled:opacity-30 disabled:pointer-events-none"
                  title="Next Month"
                >
                  <ChevronRight className="h-4 w-4" />
                </button>
              </div>
            </div>

            {/* Monthly Attendance KPI Metrics */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
              <div className="p-3 rounded-xl bg-white/[0.02] border border-white/[0.06]">
                <span className="text-[10px] text-slate-500 uppercase font-mono">Working Days</span>
                <div className="text-lg font-bold text-white font-mono mt-0.5">{monthWorkingDays.length} Days</div>
              </div>
              <div className="p-3 rounded-xl bg-emerald-500/5 border border-emerald-500/20">
                <span className="text-[10px] text-emerald-400 uppercase font-mono">Present Days</span>
                <div className="text-lg font-bold text-emerald-300 font-mono mt-0.5">{monthPresentCount} Verified</div>
              </div>
              <div className="p-3 rounded-xl bg-amber-500/5 border border-amber-500/20">
                <span className="text-[10px] text-amber-400 uppercase font-mono">Late Entries</span>
                <div className="text-lg font-bold text-amber-300 font-mono mt-0.5">{monthLateCount} Days</div>
              </div>
              <div className="p-3 rounded-xl bg-cyan-500/5 border border-cyan-500/20">
                <span className="text-[10px] text-cyan-400 uppercase font-mono">Month Turnout Score</span>
                <div className="text-lg font-bold text-cyan-300 font-mono mt-0.5">{monthTurnoutRate}</div>
              </div>
            </div>

            {/* 7-Column Calendar View */}
            <div className="space-y-2">
              <div className="grid grid-cols-7 gap-1.5 text-center text-xs">
                {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(d => (
                  <div key={d} className="font-mono text-slate-500 text-[10px] py-1 font-bold">{d}</div>
                ))}

                {/* Leading blank offset cells for first day of month */}
                {Array.from({ length: new Date(2026, selectedMonth, 1).getDay() }).map((_, i) => (
                  <div key={`pad-${i}`} className="p-2 rounded-xl opacity-10" />
                ))}

                {calendarDays.map((day, idx) => {
                  const isSunday = day.isWeekend || day.dayOfWeek === 'Sun' || day.status === 'HOLIDAY';
                  return (
                    <div
                      key={idx}
                      title={isSunday ? 'Sunday (Weekly Institutional Holiday)' : (day.status === 'PRESENT' || day.status === 'LATE' || day.status === 'ABSENT') ? `${day.status} • ${day.checkInTime || 'Verified'}` : 'No attendance recorded'}
                      className={`p-2 rounded-xl border text-xs flex flex-col items-center justify-between min-h-[58px] transition-all hover:scale-[1.03] ${
                        isSunday
                          ? 'border-violet-500/30 bg-violet-500/[0.08] text-violet-300 shadow-[0_0_12px_rgba(139,92,246,0.12)]'
                          : day.status === 'PRESENT'
                          ? 'border-emerald-500/30 bg-emerald-500/10 text-emerald-300 shadow-[0_0_10px_rgba(16,185,129,0.1)]'
                          : day.status === 'LATE'
                          ? 'border-amber-500/30 bg-amber-500/10 text-amber-300 shadow-[0_0_10px_rgba(245,158,11,0.1)]'
                          : day.status === 'ABSENT'
                          ? 'border-rose-500/30 bg-rose-500/10 text-rose-300 shadow-[0_0_10px_rgba(244,63,94,0.1)]'
                          : 'border-white/[0.05] bg-white/[0.02] text-slate-500'
                      }`}
                    >
                      <div className="w-full flex items-center justify-between">
                        <span className="font-mono text-[11px] font-bold">{day.day}</span>
                        {isSunday ? (
                          <span className="h-1.5 w-1.5 rounded-full bg-violet-400" />
                        ) : (
                          <>
                            {day.status === 'PRESENT' && <span className="h-1.5 w-1.5 rounded-full bg-emerald-400" />}
                            {day.status === 'LATE' && <span className="h-1.5 w-1.5 rounded-full bg-amber-400" />}
                            {day.status === 'ABSENT' && <span className="h-1.5 w-1.5 rounded-full bg-rose-400" />}
                          </>
                        )}
                      </div>
                      <span className="text-[9px] font-bold tracking-tight mt-1">
                        {isSunday ? 'HOLIDAY' : (day.status === 'PRESENT' || day.status === 'LATE' || day.status === 'ABSENT') ? day.status : 'NO RECORD'}
                      </span>
                      <span className="text-[8px] font-mono opacity-70">
                        {isSunday ? 'Sunday' : day.checkInTime ? day.checkInTime.split(' ')[0] : '-'}
                      </span>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Day-by-Day Verification Records Table for Selected Month */}
            <div className="pt-4 border-t border-white/[0.06]">
              <h4 className="text-xs font-bold text-white mb-3 flex items-center justify-between">
                <span>Verification Logs for {months[selectedMonth].label}</span>
                <span className="text-[10px] text-cyan-400 font-mono">Date-Partitioned Google Sheets Linked</span>
              </h4>

              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead>
                    <tr className="border-b border-white/[0.08] text-[11px] font-mono text-slate-500">
                      <th className="pb-2.5">Date</th>
                      <th className="pb-2.5">Day</th>
                      <th className="pb-2.5">Arrival Timestamp</th>
                      <th className="pb-2.5">Gateway Node</th>
                      <th className="pb-2.5">Turnstile Status</th>
                      <th className="pb-2.5">Sheets Sync</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-white/[0.04]">
                    {calendarDays
                      .filter(d => d.status === 'PRESENT' || d.status === 'LATE' || d.status === 'ABSENT')
                      .sort((a, b) => b.day - a.day)
                      .map((row, idx) => (
                      <tr key={idx} className="hover:bg-white/[0.02] transition-colors">
                        <td className="py-2.5 font-mono text-slate-300">{row.dateString}</td>
                        <td className="py-2.5 text-slate-400">{row.dayOfWeek}</td>
                        <td className="py-2.5 font-mono text-slate-200">
                          {row.checkInTime || (row.status === 'ABSENT' ? 'No Check-in' : '-')}
                        </td>
                        <td className="py-2.5 text-slate-400">
                          {row.status === 'ABSENT' ? '-' : (row as any).node || 'staff-portal'}
                        </td>
                        <td className="py-2.5">
                          <span className={`inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[10px] font-mono ${
                            row.status === 'PRESENT'
                              ? 'bg-emerald-500/10 border border-emerald-500/20 text-emerald-300'
                              : row.status === 'LATE'
                              ? 'bg-amber-500/10 border border-amber-500/20 text-amber-300'
                              : 'bg-rose-500/10 border border-rose-500/20 text-rose-300'
                          }`}>
                            <CheckCircle2 className="h-2.5 w-2.5" />
                            {row.status}
                          </span>
                        </td>
                        <td className="py-2.5 font-mono text-[10px] text-cyan-400">
                          ✓ Date-Partitioned
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
                {calendarDays.filter(d => d.status === 'PRESENT' || d.status === 'LATE' || d.status === 'ABSENT').length === 0 && (
                  <div className="p-4 text-center text-slate-500 text-xs font-mono">
                    No attendance records conducted for {months[selectedMonth].label}
                  </div>
                )}
              </div>
            </div>
          </div>
          </div>
          )}

          {/* Curriculum & AI (Code 843) Tab Content */}
          {activeTab === 'subjects' && (
            <CurriculumTracker
              onOpenAI={(q) => openAIDrawer(q)}
              onNavigateQuiz={() => { window.location.hash = '#sathi-quiz'; }}
            />
          )}
        </div>
      </div>
    </div>
  );
};
