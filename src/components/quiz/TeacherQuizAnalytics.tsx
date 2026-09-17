import React, { useState, useEffect, useMemo } from 'react';
import { 
  Users, 
  Trophy, 
  TrendingUp, 
  Clock, 
  Download, 
  Search, 
  Award, 
  BarChart3,
  AlertTriangle,
  CheckCircle2,
  XCircle,
  FileText,
  Filter,
  Eye,
  Calendar,
  Layers,
  GraduationCap,
  RotateCcw,
  RefreshCw,
  AlertOctagon,
  Sparkles,
  Check,
  Lock,
  CalendarDays,
  Flame
} from 'lucide-react';
import { WeeklyTestSchedule } from '../../types/quiz';
import { QuizResult } from '../../types/quiz';
import { sathiQuizService } from '../../services/quizService';
import { useApp } from '../../context/AppContext';
import { StudentMarksheetInspectorModal } from './StudentMarksheetInspectorModal';

interface StudentRosterStatus {
  studentId: string;
  admissionNo: string;
  name: string;
  rollNo: string;
  classGrade: string;
  section: string;
  status: 'SUBMITTED' | 'NOT_ATTEMPTED';
  result?: QuizResult;
}

interface TeacherQuizAnalyticsProps {
  isTeacher?: boolean;
  currentUserId?: string;
  currentUserName?: string;
}

export const TeacherQuizAnalytics: React.FC<TeacherQuizAnalyticsProps> = ({
  isTeacher = true,
  currentUserId = '',
  currentUserName = ''
}) => {
  const { students } = useApp();
  const schedules: WeeklyTestSchedule[] = useMemo(() => sathiQuizService.getWeeklySchedules(), []);
  
  const [selectedQuizId, setSelectedQuizId] = useState<string>('quiz-2026-w38-science');
  const [selectedClassGrade, setSelectedClassGrade] = useState<string>('ALL');
  const [attemptType, setAttemptType] = useState<'OFFICIAL' | 'RE_QUIZ'>('OFFICIAL');
  const [analytics, setAnalytics] = useState<any>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterTab, setFilterTab] = useState<'all' | 'submitted' | 'pending'>('all');
  const [inspectingResult, setInspectingResult] = useState<QuizResult | null>(null);
  const [showReQuizModal, setShowReQuizModal] = useState(false);
  const [resettingStudent, setResettingStudent] = useState<StudentRosterStatus | null>(null);
  const [actionSuccessMsg, setActionSuccessMsg] = useState<string | null>(null);

  const selectedSchedule = useMemo(() => {
    return schedules.find(s => s.quizId === selectedQuizId) || schedules[1] || schedules[0];
  }, [schedules, selectedQuizId]);

  const loadAnalytics = () => {
    const data = sathiQuizService.getTeacherAnalytics(selectedQuizId, attemptType, selectedClassGrade, selectedClassGrade === '12' ? 'Science' : undefined);
    setAnalytics(data);
  };

  useEffect(() => {
    loadAnalytics();
    const handleReset = () => loadAnalytics();
    window.addEventListener('smartx-quiz-reset', handleReset);
    return () => window.removeEventListener('smartx-quiz-reset', handleReset);
  }, [selectedQuizId, attemptType, selectedClassGrade]);

  const showNotification = (msg: string) => {
    setActionSuccessMsg(msg);
    setTimeout(() => setActionSuccessMsg(null), 4500);
  };

  const handleConductReQuiz = () => {
    sathiQuizService.conductReQuiz(selectedQuizId);
    setAttemptType('RE_QUIZ');
    loadAnalytics();
    setShowReQuizModal(false);
    showNotification(`Re-Quiz activated for ${selectedSchedule.shortLabel}! Students can now give the Re-Quiz from their portal.`);
  };

  const handleDeactivateReQuiz = () => {
    sathiQuizService.deactivateReQuiz(selectedQuizId);
    setAttemptType('OFFICIAL');
    loadAnalytics();
    showNotification(`Re-Quiz closed for ${selectedSchedule.shortLabel}.`);
  };

  const handleResetSingleStudent = () => {
    if (!resettingStudent) return;
    sathiQuizService.resetStudentAttempt(selectedQuizId, resettingStudent.studentId);
    loadAnalytics();
    const sName = resettingStudent.name;
    setResettingStudent(null);
    showNotification(`Test attempt reset for ${sName}.`);
  };

  // Helper to strictly identify staff/teacher accounts
  const isStaffOrTeacher = (id: string, name?: string) => {
    const lId = (id || '').toLowerCase().trim();
    const lName = (name || '').toLowerCase().trim();
    return (
      lId.startsWith('stf') ||
      lId.startsWith('staff') ||
      lId.startsWith('emp') ||
      lId.includes('admin') ||
      lName.includes('teacher') ||
      lName.startsWith('mr.') ||
      lName.startsWith('mr ') ||
      lName.startsWith('mrs.') ||
      lName.startsWith('mrs ') ||
      lName.startsWith('ms.') ||
      lName.startsWith('dr.') ||
      lName.includes('asis kumar')
    );
  };

  const submissions: QuizResult[] = useMemo(() => {
    const list: QuizResult[] = analytics?.submissions || [];
    // Strictly filter out staff and teacher attempts from student metrics
    return list.filter((r) => !isStaffOrTeacher(r.studentId, r.studentName));
  }, [analytics]);

    // Authoritative Registered Students Roster matching Class Selection
  const rosterStatusList: StudentRosterStatus[] = useMemo(() => {
    // 1. Authoritative registered institutional roster from app state
    const validStudents = (students && students.length > 0 ? students : [
      { id: 'AN001', admissionNo: 'AN001', name: 'Annudhyan Nath', rollNo: '01', classGrade: '12', section: 'Science' },
      { id: 'JIT001', admissionNo: 'JIT001', name: 'Jit Das', rollNo: '10', classGrade: '12', section: 'Science' },
      { id: 'SA001', admissionNo: 'SA001', name: 'Saptashwa Saha', rollNo: '01', classGrade: '10', section: 'A' },
      { id: 'TST001', admissionNo: 'TST001', name: 'Student1', rollNo: '02', classGrade: '10', section: 'A' },
      { id: 'TST002', admissionNo: 'TST002', name: 'Student2', rollNo: '03', classGrade: '10', section: 'A' },
      { id: 'TST003', admissionNo: 'TST003', name: 'Student3', rollNo: '03', classGrade: '10', section: 'A' },
      { id: 'TST004', admissionNo: 'TST004', name: 'Student4', rollNo: '04', classGrade: '10', section: 'A' }
    ]).filter(
      (s) => !isStaffOrTeacher(s.id, s.name) && s.id !== 'PVM-ADMIN-01' && s.classGrade?.toLowerCase() !== 'admin'
    );

    // 2. Filter strictly by selectedClassGrade ('ALL', '10', or '12')
    const classFilteredStudents = validStudents.filter((s) => {
      if (selectedClassGrade === 'ALL') return true;
      return String(s.classGrade).trim() === selectedClassGrade;
    });

    const submissionMap = new Map<string, QuizResult>();
    submissions.forEach((r) => {
      submissionMap.set(r.studentId.toLowerCase().trim(), r);
      if (r.studentName) submissionMap.set(r.studentName.toLowerCase().trim(), r);
    });

    // 3. Map students to roster status
    const list: StudentRosterStatus[] = classFilteredStudents.map((std) => {
      const match =
        submissionMap.get(std.id.toLowerCase().trim()) ||
        submissionMap.get((std.admissionNo || '').toLowerCase().trim()) ||
        submissionMap.get(std.name.toLowerCase().trim());

      return {
        studentId: std.id,
        admissionNo: std.admissionNo || std.id,
        name: std.name,
        rollNo: std.rollNo || '—',
        classGrade: std.classGrade,
        section: std.section,
        status: match ? 'SUBMITTED' : 'NOT_ATTEMPTED',
        result: match
      };
    });

    // 4. Also include any extra submitted student results matching the selected class
    submissions.forEach((sub) => {
      if (isStaffOrTeacher(sub.studentId, sub.studentName)) return;
      if (sub.studentName?.toLowerCase().includes('rohan') || sub.studentId?.toLowerCase().includes('1042')) return;
      if (selectedClassGrade !== 'ALL' && sub.classGrade && sub.classGrade !== selectedClassGrade) return;
      const alreadyInList = list.some(
        (item) => item.studentId.toLowerCase().trim() === sub.studentId.toLowerCase().trim() ||
                  item.name.toLowerCase().trim() === sub.studentName.toLowerCase().trim()
      );
      if (!alreadyInList) {
        list.push({
          studentId: sub.studentId,
          admissionNo: sub.studentId,
          name: sub.studentName,
          rollNo: '—',
          classGrade: sub.classGrade || (selectedClassGrade === '10' ? '10' : '12'),
          section: sub.stream || (sub.classGrade === '10' ? 'A' : 'Science'),
          status: 'SUBMITTED',
          result: sub
        });
      }
    });

    // Sort: Submitted first by rank ascending, then not attempted by roll number
    return list.sort((a, b) => {
      if (a.status === 'SUBMITTED' && b.status === 'SUBMITTED') {
        return (a.result?.rank || 99) - (b.result?.rank || 99);
      }
      if (a.status === 'SUBMITTED') return -1;
      if (b.status === 'SUBMITTED') return 1;
      return a.rollNo.localeCompare(b.rollNo);
    });
  }, [students, submissions, selectedClassGrade]);

  const totalEnrolled = rosterStatusList.length;
  const submittedCount = rosterStatusList.filter((s) => s.status === 'SUBMITTED').length;
  const notAttemptedCount = totalEnrolled - submittedCount;
  const turnoutPercentage = totalEnrolled > 0 ? Math.round((submittedCount / totalEnrolled) * 100) : 0;

  // Filtered students for display
  const filteredList = rosterStatusList.filter((item) => {
    // Filter tab
    if (filterTab === 'submitted' && item.status !== 'SUBMITTED') return false;
    if (filterTab === 'pending' && item.status !== 'NOT_ATTEMPTED') return false;

    // Search filter
    if (searchQuery.trim()) {
      const s = searchQuery.toLowerCase();
      const n = item.name.toLowerCase();
      const id = item.studentId.toLowerCase();
      const r = item.rollNo.toLowerCase();
      return n.includes(s) || id.includes(s) || r.includes(s);
    }
    return true;
  });

  const handleExportCSV = () => {
    const rows = [
      ['Roll No', 'Student Name', 'Admission No', 'Status', 'Rank', 'Score', 'Max Score', 'Percentage', 'Accuracy', 'Submission Date'],
      ...rosterStatusList.map((item) => [
        item.rollNo,
        item.name,
        item.admissionNo,
        item.status === 'SUBMITTED' ? 'Submitted' : 'Has Not Given Test',
        item.result?.rank || '—',
        item.result?.score ?? '—',
        item.result?.maxScore ?? '—',
        item.result ? `${item.result.percentage}%` : '—',
        item.result ? `${item.result.accuracy}%` : '—',
        item.result?.dateDisplay || 'Pending'
      ])
    ];

    const csvContent = 'data:text/csv;charset=utf-8,' + rows.map((e) => e.join(',')).join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', 'Class_12_Science_Weekly_Quiz_Master_Marksheet.csv');
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="space-y-6">
      {/* Top Banner & Multi-Week Selector */}
      <div className="space-y-4 pb-4 border-b border-white/[0.08]">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h2 className="text-xl font-bold text-white tracking-tight flex items-center gap-2">
              <BarChart3 className="h-5 w-5 text-cyan-400" />
              <span>
                {isTeacher
                  ? `Teacher & Staff Master Marksheet • ${selectedClassGrade === 'ALL' ? 'All Classes' : selectedClassGrade === '10' ? 'Class 10 Sec A' : 'Class 12 Science'}`
                  : `${selectedClassGrade === '10' ? 'Class 10 Sec A' : selectedClassGrade === '12' ? 'Class 12 Science' : 'All Classes'} Academic Leaderboard`}
              </span>
              {analytics?.isReQuizActive && (
                <span className="px-2.5 py-0.5 rounded-full text-[10px] font-mono font-bold bg-amber-500/20 text-amber-300 border border-amber-500/40 flex items-center gap-1 animate-pulse">
                  <Sparkles className="h-3 w-3 text-amber-400" />
                  Re-Quiz Active
                </span>
              )}
            </h2>
            <p className="text-xs text-slate-400">
              {isTeacher
                ? 'Authoritative multi-week test analytics, Official vs Re-Quiz result tracking, and student diagnostic review.'
                : 'Official weekly rank standings. You can inspect your own diagnostic marksheet below.'}
            </p>
          </div>

          <div className="flex items-center gap-2.5">
            {isTeacher && (
              analytics?.isReQuizActive ? (
                <button
                  onClick={handleDeactivateReQuiz}
                  className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-rose-500/20 hover:bg-rose-500/30 text-xs font-bold text-rose-300 border border-rose-500/40 transition-all shadow-sm active:scale-95"
                  title="Close and finalize the Re-Quiz window"
                >
                  <RotateCcw className="h-3.5 w-3.5 text-rose-400" />
                  <span>Close Re-Quiz Window</span>
                </button>
              ) : (
                <button
                  onClick={() => setShowReQuizModal(true)}
                  className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-gradient-to-r from-amber-500/20 to-orange-500/20 hover:from-amber-500/30 hover:to-orange-500/30 text-xs font-bold text-amber-300 border border-amber-500/40 transition-all shadow-sm active:scale-95"
                  title="Conduct Re-Quiz: Unlock Re-Quiz for all students while preserving official scores"
                >
                  <RotateCcw className="h-3.5 w-3.5 text-amber-400" />
                  <span>Conduct Re-Quiz</span>
                </button>
              )
            )}

            <button
              onClick={handleExportCSV}
              className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-xs font-semibold text-slate-200 border border-white/10 transition-colors"
            >
              <Download className="h-3.5 w-3.5" />
              <span>Export CSV</span>
            </button>
          </div>
        </div>

        {/* Multi-Week Schedule Tabs & Official vs Re-Quiz Result Selector */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pt-2">
          {/* Week Selector */}
          <div className="flex items-center gap-1.5 flex-wrap">
            <span className="text-[11px] font-mono uppercase text-slate-500 mr-1 flex items-center gap-1">
              <CalendarDays className="h-3.5 w-3.5 text-cyan-400" /> Test Week:
            </span>
            {schedules.map((sch) => {
              const isSelected = selectedQuizId === sch.quizId;
              return (
                <button
                  key={sch.quizId}
                  onClick={() => setSelectedQuizId(sch.quizId)}
                  className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition-all border flex items-center gap-1.5 ${
                    isSelected
                      ? 'bg-cyan-500 text-slate-950 border-cyan-400 font-bold shadow-md shadow-cyan-500/20'
                      : 'bg-slate-900/90 text-slate-400 hover:text-white border-white/10 hover:border-white/20'
                  }`}
                >
                  <span>{sch.shortLabel}</span>
                  {sch.isCurrentWeek && (
                    <span className={`text-[9px] px-1.5 py-0.2 rounded font-mono ${
                      isSelected ? 'bg-slate-950/30 text-slate-900 font-bold' : 'bg-cyan-500/20 text-cyan-300 font-bold'
                    }`}>
                      Live
                    </span>
                  )}
                </button>
              );
            })}
          </div>

        {/* Class Filter Bar (Class 10, Class 12, All Classes) */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2.5 pt-2 border-t border-white/[0.05]">
          <div className="flex items-center gap-1.5 flex-wrap">
            <span className="text-[11px] font-mono uppercase text-slate-400 mr-1 flex items-center gap-1">
              <GraduationCap className="h-3.5 w-3.5 text-purple-400" /> Class Selection:
            </span>
            {[
              { id: 'ALL', label: 'All Classes', badge: `All Enrolled (${(students || []).filter(s => !isStaffOrTeacher(s.id, s.name) && s.id !== 'PVM-ADMIN-01' && s.classGrade?.toLowerCase() !== 'admin').length || 7})` },
              { id: '10', label: 'Class 10', badge: `Sec A (${(students || []).filter(s => s.classGrade === '10').length || 5})` },
              { id: '12', label: 'Class 12', badge: `Science (${(students || []).filter(s => s.classGrade === '12').length || 2})` }
            ].map((c) => {
              const isSelected = selectedClassGrade === c.id;
              return (
                <button
                  key={c.id}
                  onClick={() => setSelectedClassGrade(c.id)}
                  className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition-all border flex items-center gap-1.5 ${
                    isSelected
                      ? 'bg-purple-600 text-white border-purple-400 font-bold shadow-md shadow-purple-600/25'
                      : 'bg-slate-900/80 text-slate-400 hover:text-white border-white/10 hover:border-white/20'
                  }`}
                >
                  <span>{c.label}</span>
                  <span className={`text-[9px] px-1.5 py-0.2 rounded font-mono ${
                    isSelected ? 'bg-white/25 text-white' : 'bg-white/5 text-slate-400'
                  }`}>
                    {c.badge}
                  </span>
                </button>
              );
            })}
          </div>

          <div className="text-[11px] text-slate-400 font-mono">
            Viewing: <strong className="text-purple-300 font-bold">{selectedClassGrade === 'ALL' ? 'All Classes (CBSE)' : `Class ${selectedClassGrade}`}</strong> • {rosterStatusList.length} Students
          </div>
        </div>

                  {/* Official Test vs Re-Quiz Result Sub-Toggle */}
          <div className="flex items-center gap-1.5 bg-black/40 border border-white/10 p-1 rounded-2xl self-start sm:self-auto">
            <button
              onClick={() => setAttemptType('OFFICIAL')}
              className={`px-3 py-1 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 ${
                attemptType === 'OFFICIAL'
                  ? 'bg-cyan-500 text-slate-950 shadow-sm'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              <span>📋 Official Test</span>
              <span className={`text-[10px] px-1.5 py-0.2 rounded-full font-mono ${
                attemptType === 'OFFICIAL' ? 'bg-slate-950/20 text-slate-900' : 'bg-white/10 text-slate-300'
              }`}>
                {analytics?.officialCount ?? 0}
              </span>
            </button>

            <button
              onClick={() => setAttemptType('RE_QUIZ')}
              className={`px-3 py-1 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 ${
                attemptType === 'RE_QUIZ'
                  ? 'bg-amber-500 text-slate-950 shadow-sm'
                  : 'text-slate-400 hover:text-amber-300'
              }`}
            >
              <span>🔄 Re-Quiz Result</span>
              <span className={`text-[10px] px-1.5 py-0.2 rounded-full font-mono ${
                attemptType === 'RE_QUIZ' ? 'bg-slate-950/20 text-slate-900' : 'bg-white/10 text-amber-300'
              }`}>
                {analytics?.reQuizCount ?? 0}
              </span>
            </button>
          </div>
        </div>
      </div>

      {/* Key Metric Overview Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Participation Card */}
        <div className="rounded-2xl border border-white/[0.08] bg-[#0A0E17]/80 p-5 backdrop-blur-sm">
          <div className="flex items-center justify-between text-xs text-slate-400 font-bold uppercase tracking-wider">
            <span>Class Participation</span>
            <Users className="h-4 w-4 text-cyan-400" />
          </div>
          <div className="mt-3 text-2xl font-black font-mono text-white">
            {submittedCount} <span className="text-sm font-normal text-slate-400">/ {totalEnrolled}</span>
          </div>
          <div className="mt-1 flex items-center justify-between text-[11px] font-mono">
            <span className="text-emerald-400 font-bold">{turnoutPercentage}% Turnout</span>
            <span className="text-amber-400">{notAttemptedCount} Pending</span>
          </div>
        </div>

        {/* Class Average Card */}
        <div className="rounded-2xl border border-white/[0.08] bg-[#0A0E17]/80 p-5 backdrop-blur-sm">
          <div className="flex items-center justify-between text-xs text-slate-400 font-bold uppercase tracking-wider">
            <span>Class Mean Score</span>
            <TrendingUp className="h-4 w-4 text-emerald-400" />
          </div>
          <div className="mt-3 text-2xl font-black font-mono text-emerald-400">
            {submittedCount > 0 ? `${analytics?.avgPercentage ?? 0}%` : 'N/A'}
          </div>
          <p className="text-[11px] text-slate-400 mt-1">
            {submittedCount > 0 ? `Avg: ${analytics?.avgScore ?? 0} pts across ${submittedCount} student${submittedCount > 1 ? 's' : ''}` : 'No submissions yet'}
          </p>
        </div>

        {/* Highest Score Card */}
        <div className="rounded-2xl border border-white/[0.08] bg-[#0A0E17]/80 p-5 backdrop-blur-sm">
          <div className="flex items-center justify-between text-xs text-slate-400 font-bold uppercase tracking-wider">
            <span>Class Highest</span>
            <Trophy className="h-4 w-4 text-amber-400" />
          </div>
          <div className="mt-3 text-2xl font-black font-mono text-amber-300">
            {analytics?.highestStudent ? `${analytics.highestStudent.score} / 200` : (submissions.length > 0 ? `${submissions[0].score} / 200` : 'N/A')}
          </div>
          <p className="text-[11px] text-slate-400 mt-1 truncate">
            {analytics?.highestStudent ? `${analytics.highestStudent.name} (${analytics.highestStudent.percentage}%)` : (submissions.length > 0 ? `${submissions[0].studentName} (${submissions[0].percentage}%)` : 'No submissions yet')}
          </p>
        </div>

        {/* Not Attempted Alerts Card */}
        <div className="rounded-2xl border border-white/[0.08] bg-[#0A0E17]/80 p-5 backdrop-blur-sm">
          <div className="flex items-center justify-between text-xs text-slate-400 font-bold uppercase tracking-wider">
            <span>Pending Students</span>
            <AlertTriangle className="h-4 w-4 text-amber-400" />
          </div>
          <div className="mt-3 text-2xl font-black font-mono text-amber-300">
            {notAttemptedCount}
          </div>
          <p className="text-[11px] text-slate-400 mt-1">Have not taken weekly test</p>
        </div>
      </div>

      {/* Student Leaderboard & Full Marksheet Table */}
      <div className="rounded-2xl border border-white/[0.08] bg-[#0A0E17]/80 shadow-xl overflow-hidden space-y-4">
        <div className="p-4 border-b border-white/[0.06] flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          {/* Filter Tabs */}
          <div className="flex items-center gap-1.5 flex-wrap">
            <button
              onClick={() => setFilterTab('all')}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold border transition-all ${
                filterTab === 'all'
                  ? 'bg-cyan-500 text-slate-950 border-cyan-400 shadow-sm'
                  : 'bg-slate-900 border-white/10 text-slate-400 hover:text-white'
              }`}
            >
              All Students ({totalEnrolled})
            </button>
            <button
              onClick={() => setFilterTab('submitted')}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold border transition-all flex items-center gap-1 ${
                filterTab === 'submitted'
                  ? 'bg-emerald-500 text-slate-950 border-emerald-400 shadow-sm'
                  : 'bg-slate-900 border-white/10 text-emerald-400 hover:bg-emerald-500/10'
              }`}
            >
              <CheckCircle2 className="h-3.5 w-3.5" />
              <span>Submitted ({submittedCount})</span>
            </button>
            <button
              onClick={() => setFilterTab('pending')}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold border transition-all flex items-center gap-1 ${
                filterTab === 'pending'
                  ? 'bg-amber-500 text-slate-950 border-amber-400 shadow-sm'
                  : 'bg-slate-900 border-white/10 text-amber-400 hover:bg-amber-500/10'
              }`}
            >
              <XCircle className="h-3.5 w-3.5" />
              <span>Not Attempted ({notAttemptedCount})</span>
            </button>
          </div>

          {/* Search Box */}
          <div className="relative">
            <Search className="h-3.5 w-3.5 text-slate-400 absolute left-3 top-1/2 transform -translate-y-1/2" />
            <input
              type="text"
              placeholder="Search student or roll..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="bg-slate-900 border border-white/10 rounded-xl pl-8 pr-3 py-1.5 text-xs text-white focus:outline-none focus:border-cyan-500/40 w-full sm:w-60"
            />
          </div>
        </div>

        {/* Master Table */}
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-900/80 text-slate-400 font-semibold border-b border-white/[0.06]">
              <tr>
                <th className="py-3 px-4">Student</th>
                <th className="py-3 px-4">Status</th>
                <th className="py-3 px-4">Score</th>
                <th className="py-3 px-4">Accuracy</th>
                <th className="py-3 px-4">Questions Breakdown</th>
                <th className="py-3 px-4">Time Taken</th>
                <th className="py-3 px-4 text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/[0.04]">
              {filteredList.length === 0 ? (
                <tr>
                  <td colSpan={7} className="py-10 text-center text-slate-500">
                    No students found matching your criteria.
                  </td>
                </tr>
              ) : (
                filteredList.map((item) => {
                  const isSub = item.status === 'SUBMITTED';
                  const res = item.result;

                  return (
                    <tr
                      key={item.studentId}
                      onClick={() => {
                        if (isSub && res) setInspectingResult(res);
                      }}
                      className={`transition-colors ${
                        isSub
                          ? 'hover:bg-cyan-500/5 cursor-pointer'
                          : 'hover:bg-slate-900/30'
                      }`}
                    >
                      {/* Student Info */}
                      <td className="py-3.5 px-4">
                        <div className="flex items-center gap-2.5">
                          <div className="h-8 w-8 rounded-full bg-gradient-to-br from-cyan-500/20 to-blue-500/20 border border-white/10 flex items-center justify-center text-cyan-300 font-bold text-xs">
                            {item.name.charAt(0)}
                          </div>
                          <div>
                            <div className="font-semibold text-white flex items-center gap-1.5">
                              <span>{item.name}</span>
                              {isSub && res?.rank === 1 && (
                                <span className="text-[10px] px-1.5 py-0.2 rounded bg-amber-500/20 text-amber-300 font-mono font-bold">#1</span>
                              )}
                            </div>
                            <div className="text-[11px] text-slate-500 font-mono">
                              Roll: {item.rollNo} • Adm: {item.admissionNo}
                            </div>
                          </div>
                        </div>
                      </td>

                      {/* Status */}
                      <td className="py-3.5 px-4">
                        {isSub ? (
                          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-emerald-500/15 text-emerald-300 border border-emerald-500/30">
                            <CheckCircle2 className="h-3 w-3" />
                            <span>Submitted</span>
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-rose-500/15 text-rose-300 border border-rose-500/30">
                            <XCircle className="h-3 w-3" />
                            <span>Has Not Given Test</span>
                          </span>
                        )}
                      </td>

                      {/* Score */}
                      <td className="py-3.5 px-4 font-mono">
                        {isSub && res ? (
                          <div>
                            <span className="font-bold text-white text-sm">
                              {res.score}
                            </span>
                            <span className="text-slate-500 text-[11px]"> / {res.maxScore}</span>
                            <span className="text-cyan-400 font-semibold block text-[10px]">
                              ({res.percentage}%)
                            </span>
                          </div>
                        ) : (
                          <span className="text-slate-600 font-mono">—</span>
                        )}
                      </td>

                      {/* Accuracy */}
                      <td className="py-3.5 px-4 font-mono">
                        {isSub && res ? (
                          <span className="text-emerald-400 font-bold text-xs">
                            {res.accuracy}%
                          </span>
                        ) : (
                          <span className="text-slate-600 font-mono">—</span>
                        )}
                      </td>

                      {/* Question Breakdown */}
                      <td className="py-3.5 px-4 font-mono text-[11px]">
                        {isSub && res ? (
                          <div className="space-y-0.5">
                            <span className="text-emerald-400 font-semibold">{res.correctCount} Correct</span>
                            <span className="text-slate-600"> • </span>
                            <span className="text-rose-400 font-semibold">{res.incorrectCount} Wrong</span>
                            <span className="text-slate-600"> • </span>
                            <span className="text-slate-400">{res.skippedCount} Skipped</span>
                          </div>
                        ) : (
                          <span className="text-slate-500 italic">50 Questions Pending</span>
                        )}
                      </td>

                      {/* Time Taken */}
                      <td className="py-3.5 px-4 text-slate-400 text-[11px]">
                        {isSub && res ? (
                          <div>
                            <span>{res.timeTakenDisplay || `${res.timeTakenMinutes || 1} Minutes`}</span>
                            <span className="text-[10px] text-slate-500 block font-mono">{res.dateDisplay}</span>
                          </div>
                        ) : (
                          <span className="text-slate-600">—</span>
                        )}
                      </td>

                      {/* Action */}
                      <td className="py-3.5 px-4 text-right">
                        {(() => {
                          const isOwnStudentRow = 
                            !isTeacher && (
                              item.studentId.toLowerCase() === (currentUserId || '').toLowerCase() ||
                              item.admissionNo.toLowerCase() === (currentUserId || '').toLowerCase() ||
                              item.name.toLowerCase() === (currentUserName || '').toLowerCase()
                            );

                          if (isTeacher) {
                            if (isSub && res) {
                              return (
                                <div className="flex items-center justify-end gap-2">
                                  <button
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      setInspectingResult(res);
                                    }}
                                    className="inline-flex items-center gap-1 px-2.5 py-1 rounded-xl bg-cyan-500/10 hover:bg-cyan-500/20 text-cyan-300 border border-cyan-500/30 text-xs font-semibold transition-colors"
                                  >
                                    <Eye className="h-3.5 w-3.5" />
                                    <span>Inspect</span>
                                  </button>
                                  <button
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      setResettingStudent(item);
                                    }}
                                    className="inline-flex items-center gap-1 px-2 py-1 rounded-xl bg-amber-500/10 hover:bg-amber-500/20 text-amber-300 border border-amber-500/20 text-xs font-semibold transition-colors"
                                    title="Reset test attempt for this student"
                                  >
                                    <RotateCcw className="h-3 w-3" />
                                    <span className="hidden sm:inline">Re-Quiz</span>
                                  </button>
                                </div>
                              );
                            }
                            return (
                              <span className="text-[11px] text-amber-400/80 font-mono">
                                Pending Test
                              </span>
                            );
                          }

                          // STUDENT LEADERBOARD VIEW
                          if (isOwnStudentRow) {
                            if (isSub && res) {
                              return (
                                <button
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    setInspectingResult(res);
                                  }}
                                  className="inline-flex items-center gap-1 px-3 py-1 rounded-xl bg-cyan-500/20 hover:bg-cyan-500/30 text-cyan-300 border border-cyan-500/40 text-xs font-bold transition-colors"
                                >
                                  <Eye className="h-3.5 w-3.5" />
                                  <span>My Marksheet</span>
                                </button>
                              );
                            }
                            return (
                              <span className="text-[11px] text-amber-400 font-mono">
                                Not Attempted
                              </span>
                            );
                          }

                          // Other students' rows: strictly private!
                          return (
                            <span className="text-[11px] text-slate-500 font-mono inline-flex items-center gap-1">
                              <Lock className="h-3 w-3" />
                              Private
                            </span>
                          );
                        })()}
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Success Notification Toast */}
      {actionSuccessMsg && (
        <div className="fixed bottom-6 right-6 z-50 flex items-center gap-2.5 px-4 py-3 rounded-2xl bg-emerald-950/90 border border-emerald-500/40 text-emerald-200 text-xs font-bold shadow-2xl backdrop-blur-md animate-in slide-in-from-bottom-3 duration-200">
          <Check className="h-4 w-4 text-emerald-400 shrink-0" />
          <span>{actionSuccessMsg}</span>
        </div>
      )}

      {/* Re-Quiz Confirmation Modal for All Students */}
      {showReQuizModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
          <div className="w-full max-w-md rounded-3xl border border-amber-500/30 bg-[#0A0E17] p-6 shadow-2xl space-y-5 animate-in zoom-in-95 duration-150">
            <div className="flex items-start gap-3">
              <div className="p-3 rounded-2xl bg-amber-500/15 border border-amber-500/30 text-amber-400">
                <AlertOctagon className="h-6 w-6" />
              </div>
              <div className="space-y-1">
                <h3 className="text-base font-bold text-white tracking-tight">Conduct Class Re-Quiz</h3>
                <p className="text-xs text-slate-400">
                  Are you sure you want to reset the weekly test for <span className="text-white font-semibold">all students</span>?
                </p>
              </div>
            </div>

            <div className="p-3.5 rounded-2xl bg-amber-950/20 border border-amber-500/20 text-xs text-amber-200/90 leading-relaxed">
              • All student submissions and active attempts for the weekly test will be cleared.
              <br />
              • Every student must take the quiz again from their student portal.
              <br />
              • Turnout will reset to 0% and all students will be marked as Pending.
            </div>

            <div className="flex items-center justify-end gap-3 pt-2">
              <button
                onClick={() => setShowReQuizModal(false)}
                className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-300 hover:bg-white/[0.06] transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleConductReQuiz}
                className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-gradient-to-r from-amber-500 to-orange-600 hover:from-amber-400 hover:to-orange-500 text-slate-950 font-bold text-xs shadow-lg shadow-amber-500/20 transition-all active:scale-95"
              >
                <RotateCcw className="h-3.5 w-3.5" />
                <span>Confirm & Conduct Re-Quiz</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Individual Student Re-Quiz Modal */}
      {resettingStudent && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
          <div className="w-full max-w-md rounded-3xl border border-white/10 bg-[#0A0E17] p-6 shadow-2xl space-y-5 animate-in zoom-in-95 duration-150">
            <div className="flex items-start gap-3">
              <div className="p-3 rounded-2xl bg-cyan-500/15 border border-cyan-500/30 text-cyan-400">
                <RotateCcw className="h-6 w-6" />
              </div>
              <div className="space-y-1">
                <h3 className="text-base font-bold text-white tracking-tight">
                  Re-Quiz {resettingStudent.name}
                </h3>
                <p className="text-xs text-slate-400">
                  Reset weekly quiz for Roll No: <span className="text-cyan-300 font-mono">{resettingStudent.rollNo}</span>
                </p>
              </div>
            </div>

            <p className="text-xs text-slate-300 leading-relaxed">
              This will clear the current submission for <strong className="text-white">{resettingStudent.name}</strong> so they can retake the weekly assessment.
            </p>

            <div className="flex items-center justify-end gap-3 pt-2">
              <button
                onClick={() => setResettingStudent(null)}
                className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-300 hover:bg-white/[0.06] transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleResetSingleStudent}
                className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs shadow-md transition-all active:scale-95"
              >
                <RotateCcw className="h-3.5 w-3.5" />
                <span>Reset for Retake</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Student Marksheet Diagnostic Inspector Modal */}
      {inspectingResult && (
        <StudentMarksheetInspectorModal
          result={inspectingResult}
          onClose={() => setInspectingResult(null)}
        />
      )}
    </div>
  );
};
