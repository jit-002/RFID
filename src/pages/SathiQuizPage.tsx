import React, { useState, useEffect } from 'react';
import { useApp } from '../context/AppContext';
import { 
  Trophy,
  Users,
  GraduationCap,
  AlertTriangle, 
  BookOpen, 
  Calendar, 
  Clock, 
  Award, 
  CheckCircle2, 
  ArrowRight, 
  Layers, 
  BarChart3, 
  History, 
  Zap, 
  Play, 
  RotateCcw,
  Sparkles,
  ShieldCheck,
  RotateCw
} from 'lucide-react';
import { 
  WeeklyQuizConfig, 
  QuizQuestion, 
  QuizResult, 
  QuizSubject,
  ActiveQuizAttempt 
} from '../types/quiz';
import { sathiQuizService } from '../services/quizService';
import { WEEKLY_TEST_SCHEDULES, OFFICIAL_WEEKLY_QUIZ_CONFIG } from '../services/quizQuestionsData';
import { WeeklyTestSchedule } from '../types/quiz';
import { QuizTakingView } from '../components/quiz/QuizTakingView';
import { QuizResultDashboard } from '../components/quiz/QuizResultDashboard';
import { SyllabusManager } from '../components/quiz/SyllabusManager';
import { TeacherQuizAnalytics } from '../components/quiz/TeacherQuizAnalytics';
import { LoginRequiredCard } from '../components/common/LoginRequiredCard';

interface SathiQuizPageProps {
  currentUser?: {
    id: string;
    name: string;
    role?: string;
  };
  isAuthenticated?: boolean;
  onNavigateTab?: (tabId: string) => void;
  onOpenStudySathiWithPrompt?: (prompt: string, title?: string) => void;
}

export const SathiQuizPage: React.FC<SathiQuizPageProps> = ({

  currentUser = { id: 'SA001', name: 'Saptashwa Saha', role: 'student', classGrade: '10' },
  isAuthenticated = true,
  onNavigateTab,
  onOpenStudySathiWithPrompt
}) => {
  // 1. Mandatory Authentication Gate
  if (!isAuthenticated) {
    return (
      <LoginRequiredCard
        title="Sathi Quiz Requires Authentication"
        description="The 50-MCQ weekly academic challenge, student rankings, and OMR answer reviews are private to enrolled students and teachers."
        onLogin={() => {
          if (onNavigateTab) onNavigateTab('login');
          else window.location.hash = 'login';
        }}
        onBack={() => {
          if (onNavigateTab) onNavigateTab('landing');
          else window.location.hash = 'landing';
        }}
      />
    );
  }

  const { students, userRole, currentStudent } = useApp();

  // Authoritative Registered Enrolled Student List
  const registeredStudentsList = React.useMemo(() => {
    return (students && students.length > 0 ? students : [
      { id: 'AN001', admissionNo: 'AN001', name: 'Annudhyan Nath', rollNo: '01', classGrade: '12', section: 'Science' },
      { id: 'JIT001', admissionNo: 'JIT001', name: 'Jit Das', rollNo: '10', classGrade: '12', section: 'Science' },
      { id: 'SA001', admissionNo: 'SA001', name: 'Saptashwa Saha', rollNo: '01', classGrade: '10', section: 'A' },
      { id: 'TST001', admissionNo: 'TST001', name: 'Student1', rollNo: '02', classGrade: '10', section: 'A' },
      { id: 'TST002', admissionNo: 'TST002', name: 'Student2', rollNo: '03', classGrade: '10', section: 'A' },
      { id: 'TST003', admissionNo: 'TST003', name: 'Student3', rollNo: '03', classGrade: '10', section: 'A' },
      { id: 'TST004', admissionNo: 'TST004', name: 'Student4', rollNo: '04', classGrade: '10', section: 'A' }
    ]).filter((s: any) => {
      const sId = (s.id || '').toLowerCase();
      const sName = (s.name || '').toLowerCase();
      return (
        !sId.startsWith('stf') &&
        !sId.startsWith('staff') &&
        !sId.startsWith('emp') &&
        !sId.includes('admin') &&
        !sName.includes('teacher') &&
        !sName.includes('asis kumar') &&
        !sName.includes('rohan') &&
        !sId.includes('1042')
      );
    });
  }, [students]);

  // Selected student persona for test execution and viewing
  const [selectedStudentId, setSelectedStudentId] = useState<string>(() => {
    return currentStudent?.id || currentUser?.id || 'JIT001';
  });

  const activeStudentProfile = React.useMemo(() => {
    const found = registeredStudentsList.find(
      s => s.id.toLowerCase() === selectedStudentId.toLowerCase() ||
           s.admissionNo.toLowerCase() === selectedStudentId.toLowerCase() ||
           s.name.toLowerCase() === selectedStudentId.toLowerCase()
    );
    return found || currentStudent || registeredStudentsList[0];
  }, [registeredStudentsList, selectedStudentId, currentStudent]);

  const studentClass = String(activeStudentProfile?.classGrade || '12').trim();
  const studentStream = String(activeStudentProfile?.section || (studentClass === '10' ? 'A' : 'Science')).trim();
  const effectiveUserId = activeStudentProfile?.id || currentUser.id;
  const effectiveUserName = activeStudentProfile?.name || currentUser.name;
    const scrollToQuizSection = () => {
    const el = document.getElementById('sathi-quiz-tab-content');
    if (el) {
      const yOffset = -90;
      const y = el.getBoundingClientRect().top + window.pageYOffset + yOffset;
      window.scrollTo({ top: y, behavior: 'smooth' });
    }
  };
  const isTeacher = userRole === 'STAFF' || userRole === 'EMPLOYEE' || userRole === 'ADMIN' || userRole === 'SUPER_ADMIN';
  const [activeTab, setActiveTab] = useState<'weekly' | 'practice' | 'results' | 'syllabus' | 'analytics'>(() => {
    return (userRole === 'STAFF' || userRole === 'SUPER_ADMIN' || userRole === 'ADMIN') ? 'analytics' : 'weekly';
  });
  const [currentWeekConfig, setCurrentWeekConfig] = useState<WeeklyQuizConfig | null>(null);
  const [hasAttemptedOfficial, setHasAttemptedOfficial] = useState(false);
  const [userResults, setUserResults] = useState<QuizResult[]>([]);
  const [selectedWeekQuizId, setSelectedWeekQuizId] = useState<string>(OFFICIAL_WEEKLY_QUIZ_CONFIG.quizId);
  const [viewingResultType, setViewingResultType] = useState<'OFFICIAL' | 'RE_QUIZ'>('OFFICIAL');
  const weeklySchedules: WeeklyTestSchedule[] = React.useMemo(() => sathiQuizService.getWeeklySchedules(), []);

  // Examination taking state
  const [takingConfig, setTakingConfig] = useState<WeeklyQuizConfig | null>(null);
  const [takingQuestions, setTakingQuestions] = useState<QuizQuestion[] | null>(null);
  const [activeAttempt, setActiveAttempt] = useState<ActiveQuizAttempt | null>(null);
  const [isPracticeMode, setIsPracticeMode] = useState(false);

  // Active result view state
  const [viewingResult, setViewingResult] = useState<QuizResult | null>(null);

  // Practice generator state
  const [practiceSubject, setPracticeSubject] = useState<QuizSubject>('Physics');
  const [practiceCount, setPracticeCount] = useState<number>(10);

  // Load initial data and check for in-progress attempt (refresh recovery)
  useEffect(() => {
    // Teachers and staff when viewing analytics tab
    if (isTeacher && activeTab === 'analytics') {
      sathiQuizService.clearStaffAttempts();
      setActiveAttempt(null);
      setTakingConfig(null);
      setTakingQuestions(null);
      setCurrentWeekConfig(sathiQuizService.getActiveWeeklyConfig());
      return;
    }

    const { config, questions } = sathiQuizService.getOfficialWeeklyQuiz(effectiveUserId, studentClass);
    setCurrentWeekConfig(config);

    const studentData = sathiQuizService.getStudentResults(effectiveUserId, config.quizId);
    const allHistory = [...studentData.weeklyHistory, ...studentData.practiceHistory];
    setUserResults(allHistory);
    
    // In Re-Quiz mode, student is considered attempted only if they took the re-quiz
    const isReQuizOpen = studentData.isReQuizActive;
    const attemptedTarget = isReQuizOpen ? !!studentData.reQuizResult : !!studentData.officialResult;
    setHasAttemptedOfficial(attemptedTarget);

    // Refresh recovery: check if student has an active unexpired attempt
    if (!attemptedTarget) {
      const resume = sathiQuizService.startOrResumeAttempt(
        effectiveUserId,
        effectiveUserName,
        config.quizId,
        config.durationMinutes,
        false
      );

      // If existing attempt was resumed and not newly created
      if (!resume.isNew && resume.remainingSeconds > 0) {
        setActiveAttempt(resume.attempt);
        setTakingConfig(config);
        setTakingQuestions(questions);
        setIsPracticeMode(false);
      }
    }

    const handleQuizReset = () => {
      const freshData = sathiQuizService.getStudentResults(effectiveUserId, config.quizId);
      setUserResults([...freshData.weeklyHistory, ...freshData.practiceHistory]);
      const isReQ = freshData.isReQuizActive;
      setHasAttemptedOfficial(isReQ ? !!freshData.reQuizResult : !!freshData.officialResult);
    };

    window.addEventListener('smartx-quiz-reset', handleQuizReset);
    return () => window.removeEventListener('smartx-quiz-reset', handleQuizReset);
  }, [effectiveUserId, effectiveUserName, isTeacher, studentClass, activeTab]);

    // Auto-launch quiz if directed from Study Sathi AI assistant
  useEffect(() => {
    if (isTeacher) return;
    try {
      const rawAuto = localStorage.getItem('sathi_auto_launch_quiz');
      if (rawAuto) {
        localStorage.removeItem('sathi_auto_launch_quiz');
        const payload = JSON.parse(rawAuto);
        const subject: QuizSubject = payload.subject || 'Physics';
        const qCount = payload.questionCount || 5;

        const practice = sathiQuizService.generatePracticeQuiz(
          subject,
          payload.topic || 'AI Quick Quiz',
          qCount,
          'MIXED'
        );

        const practiceConfig: WeeklyQuizConfig = {
          quizId: practice.practiceId,
          weekId: 'practice',
          title: practice.title,
          subtitle: 'AI-Generated ' + (payload.durationMinutes || 2) + '-Minute Quick Quiz',
          classGrade: '12',
          stream: 'Science',
          dateDisplay: new Date().toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' }),
          totalQuestions: practice.questions.length,
          durationMinutes: payload.durationMinutes || 2,
          subjectAllocation: {
            Physics: subject === 'Physics' ? qCount : 0,
            Chemistry: subject === 'Chemistry' ? qCount : 0,
            Mathematics: subject === 'Mathematics' ? qCount : 0,
            'AI / Computer': subject === 'AI / Computer' ? qCount : 0,
            English: subject === 'English' ? qCount : 0,
            'Physical Education': subject === 'Physical Education' ? qCount : 0
          },
          markingScheme: {
            marksPerCorrect: 4,
            negativeMarksPerWrong: 1,
            marksPerSkipped: 0
          },
          positiveMarks: 4,
          negativeMarks: 1,
          totalMarks: practice.questions.length * 4,
          status: 'ACTIVE'
        };

        const { attempt } = sathiQuizService.startOrResumeAttempt(
      effectiveUserId,
      effectiveUserName,
          practice.practiceId,
          practiceConfig.durationMinutes,
          true,
          true
        );

        setActiveAttempt(attempt);
        setTakingConfig(practiceConfig);
        setTakingQuestions(practice.questions);
        setIsPracticeMode(true);
        setViewingResult(null);
      }
    } catch (e) {
      console.error('Failed to auto-launch AI quiz:', e);
    }
  }, [currentUser.id, currentUser.name, isTeacher]);

  // Start Official Weekly Test
  const handleStartOfficialQuiz = () => {
    if (isTeacher || !currentWeekConfig) return;
    const { config, questions } = sathiQuizService.getOfficialWeeklyQuiz(currentUser.id, studentClass);

    const isReQuizActive = sathiQuizService.isReQuizActive(config.quizId);
    const { attempt } = sathiQuizService.startOrResumeAttempt(
      currentUser.id,
      currentUser.name,
      config.quizId,
      config.durationMinutes,
      false,
      isReQuizActive
    );

    setActiveAttempt(attempt);
    setTakingConfig(config);
    setTakingQuestions(questions);
    setIsPracticeMode(false);
    setViewingResult(null);
  };

  // Start Custom Practice Mock
  const handleStartPracticeQuiz = () => {
    if (isTeacher) return;
    const practice = sathiQuizService.generatePracticeQuiz(
      practiceSubject,
      'Practice Mock',
      practiceCount,
      'MIXED'
    );

    const practiceConfig: WeeklyQuizConfig = {
      quizId: practice.practiceId,
      weekId: 'practice',
      title: practice.title,
      subtitle: 'Self-paced practice mock',
      classGrade: '12',
      stream: 'Science',
      dateDisplay: new Date().toLocaleDateString(),
      totalQuestions: practice.questions.length,
      durationMinutes: Math.round(practice.questions.length * 1.5),
      subjectAllocation: {
        Physics: practiceSubject === 'Physics' ? practiceCount : 0,
        Chemistry: practiceSubject === 'Chemistry' ? practiceCount : 0,
        Mathematics: practiceSubject === 'Mathematics' ? practiceCount : 0,
        'AI / Computer': practiceSubject === 'AI / Computer' ? practiceCount : 0,
        English: practiceSubject === 'English' ? practiceCount : 0,
        'Physical Education': practiceSubject === 'Physical Education' ? practiceCount : 0
      },
      markingScheme: {
        marksPerCorrect: 4,
        negativeMarksPerWrong: 1,
        marksPerSkipped: 0
      },
      positiveMarks: 4,
      negativeMarks: 1,
      totalMarks: practice.questions.length * 4,
      status: 'ACTIVE'
    };

    const { attempt } = sathiQuizService.startOrResumeAttempt(
      currentUser.id,
      currentUser.name,
      practice.practiceId,
      practiceConfig.durationMinutes,
      true,
      true
    );

    setActiveAttempt(attempt);
    setTakingConfig(practiceConfig);
    setTakingQuestions(practice.questions);
    setIsPracticeMode(true);
    setViewingResult(null);
  };

  // Autosave answers during attempt
  const handleAutosaveAnswers = (answers: Record<string, string>) => {
    if (!activeAttempt) return;
    sathiQuizService.autosaveAttemptProgress(activeAttempt.attemptId, currentUser.id, answers);
  };

  // Submit test answers authoritative evaluation
  const handleSubmitQuiz = async (answers: Record<string, string>, timeTakenSeconds: number) => {
    if (!takingConfig) return;

    const isReQuiz = !isPracticeMode && sathiQuizService.isReQuizActive(takingConfig.quizId);

    const result = await sathiQuizService.submitQuizAttempt(
      {
        quizId: takingConfig.quizId,
        studentId: currentUser.id,
        attemptId: activeAttempt?.attemptId,
        answers,
        timeTakenSeconds,
        isPractice: isPracticeMode,
        attemptType: isReQuiz ? 'RE_QUIZ' : 'OFFICIAL'
      },
      {
        name: currentUser.name,
        classGrade: takingConfig.classGrade || '12',
        stream: takingConfig.stream || 'Science'
      }
    );

    // Refresh user results
    const studentData = sathiQuizService.getStudentResults(effectiveUserId);
    const allHistory = [...studentData.weeklyHistory, ...studentData.practiceHistory];
    setUserResults(allHistory);
    if (!isPracticeMode) {
      setHasAttemptedOfficial(true);
    }

    // Switch to result view
    setTakingConfig(null);
    setTakingQuestions(null);
    setActiveAttempt(null);
    setViewingResult(result);
  };

  // Cancel test
  const handleCancelQuiz = () => {
    if (window.confirm('Are you sure you want to abandon the test? Your responses will not be evaluated.')) {
      setTakingConfig(null);
      setTakingQuestions(null);
      setActiveAttempt(null);
    }
  };

  // If currently taking test, render the dual-pane exam screen
  if (!isTeacher && takingConfig && takingQuestions && activeAttempt) {
    return (
      <QuizTakingView
        config={takingConfig}
        questions={takingQuestions}
        studentId={currentUser.id}
        studentName={currentUser.name}
        isPractice={isPracticeMode}
        attempt={activeAttempt}
        onAutosaveAnswers={handleAutosaveAnswers}
        onSubmit={handleSubmitQuiz}
        onCancel={handleCancelQuiz}
      />
    );
  }

  // If viewing a result dashboard, render the reference scorecard
  if (viewingResult) {
    return (
      <QuizResultDashboard
        result={viewingResult}
        onRetakePractice={() => {
          setViewingResult(null);
          handleStartPracticeQuiz();
        }}
        onBackToList={() => setViewingResult(null)}
        onOpenStudySathi={(prompt) => {
          if (onOpenStudySathiWithPrompt && prompt) {
            onOpenStudySathiWithPrompt(prompt);
          } else if (onNavigateTab) {
            onNavigateTab('study-sathi');
          }
        }}
      />
    );
  }

  return (
    <div className="min-h-screen bg-[#050811] text-slate-100 py-8 px-4 md:px-8 max-w-7xl mx-auto space-y-8">
      {/* Hero Header Banner */}
      <div className="relative rounded-3xl border border-white/[0.08] bg-gradient-to-r from-[#0d1729] via-[#091122] to-[#0A0E17] p-6 md:p-8 shadow-2xl overflow-hidden">
        <div className="absolute -right-12 -bottom-12 w-64 h-64 bg-cyan-500/10 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute -left-12 -top-12 w-64 h-64 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none" />

        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-2">
            <div className="flex items-center gap-2.5">
              <span className="flex h-8 px-3 items-center justify-center rounded-xl bg-cyan-500/15 border border-cyan-500/30 text-cyan-300 text-xs font-bold font-mono tracking-wide">
                SATHI ACADEMIC CHALLENGE
              </span>
              <span className="px-2.5 py-0.5 text-xs font-semibold rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                CBSE Class 12 Science
              </span>
            </div>
            <h1 className="text-2xl md:text-3xl font-black text-white tracking-tight">
              Weekly 50-MCQ Academic Assessment
            </h1>
            <p className="text-xs md:text-sm text-slate-400 max-w-2xl leading-relaxed">
              Standardized weekly evaluation covering Physics, Chemistry, Mathematics, AI / Computer Science, English Core, and Physical Education with authoritative instant grading and AI diagnostics.
            </p>
          </div>

          {!isTeacher && currentWeekConfig && !hasAttemptedOfficial && (
            <button
              onClick={handleStartOfficialQuiz}
              className="flex items-center justify-center gap-2 px-6 py-3.5 rounded-2xl bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-slate-950 font-bold text-sm shadow-xl shadow-cyan-500/20 transition-all active:scale-95 whitespace-nowrap self-start md:self-auto"
            >
              <Play className="h-4 w-4 fill-current" />
              <span>Start {currentWeekConfig.title}</span>
            </button>
          )}
          {isTeacher && (
            <button
              onClick={() => setActiveTab('analytics')}
              className="flex items-center justify-center gap-2 px-6 py-3.5 rounded-2xl bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-bold text-sm shadow-xl shadow-cyan-500/20 transition-all active:scale-95 whitespace-nowrap self-start md:self-auto"
            >
              <BarChart3 className="h-4 w-4" />
              <span>Inspect Student Marksheets</span>
            </button>
          )}
        </div>
      </div>

      {/* Main Tab Navigation */}
      <div className="flex gap-2 border-b border-white/[0.08] pb-1 overflow-x-auto">
        {(isTeacher ? [
          { id: 'analytics', label: 'Master Student Marksheets & Diagnostic', icon: BarChart3 },
          { id: 'weekly', label: 'Weekly Challenge Overview', icon: Trophy },
          { id: 'syllabus', label: 'Curriculum & Blueprint', icon: Layers }
        ] : [
          { id: 'weekly', label: 'Weekly Challenge', icon: Trophy },
          { id: 'practice', label: 'Practice Mocks', icon: Zap },
          { id: 'results', label: 'My Results & Scorecards', icon: History },
          { id: 'syllabus', label: 'Curriculum & Blueprint', icon: Layers },
          { id: 'analytics', label: 'Class Leaderboard', icon: BarChart3 }
        ]).map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;

          return (
            <button
              key={tab.id}
              onClick={() => { setActiveTab(tab.id as any); scrollToQuizSection(); }}
              className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold transition-all whitespace-nowrap ${
                isActive
                  ? 'bg-cyan-500 text-slate-950 shadow-md shadow-cyan-500/10'
                  : 'bg-slate-900/40 text-slate-400 hover:text-slate-200 hover:bg-slate-800/60'
              }`}
            >
              <Icon className="h-4 w-4" />
              <span>{tab.label}</span>
            </button>
          );
        })}
      </div>


      {/* Registered Student Persona Selector (All 7 registered students can take quiz) */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-3.5 rounded-2xl bg-gradient-to-r from-slate-900/90 via-[#0A0E17] to-[#0A0E17] border border-white/[0.08] shadow-sm">
        <div className="flex items-center gap-2.5">
          <div className="h-8 w-8 rounded-xl bg-cyan-500/15 border border-cyan-500/30 flex items-center justify-center text-cyan-300 font-bold">
            {activeStudentProfile.name.charAt(0)}
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-xs text-slate-300 font-semibold">Active Student Persona:</span>
              <span className="text-xs font-bold text-white font-mono bg-white/10 px-2 py-0.5 rounded-md border border-white/10">
                {activeStudentProfile.name}
              </span>
              <span className={`text-[10px] font-mono px-2 py-0.5 rounded-full border ${
                studentClass === '10'
                  ? 'bg-purple-500/20 border-purple-500/40 text-purple-300'
                  : 'bg-cyan-500/20 border-cyan-500/40 text-cyan-300'
              }`}>
                Grade {studentClass}-{studentStream} • Roll #{activeStudentProfile.rollNo}
              </span>
            </div>
            <p className="text-[11px] text-slate-400 mt-0.5">
              Admission #{activeStudentProfile.admissionNo} • Questions & syllabus mapped directly to CBSE Class {studentClass}.
            </p>
          </div>
        </div>

        <div className="flex items-center gap-1.5 flex-wrap">
          <span className="text-[10px] uppercase font-mono text-slate-400 mr-1 flex items-center gap-1">
            <Users className="h-3 w-3 text-cyan-400" /> Switch Student:
          </span>
          {registeredStudentsList.map((std: any) => {
            const isSelected = std.id.toLowerCase() === selectedStudentId.toLowerCase();
            return (
              <button
                key={std.id}
                type="button"
                onClick={() => {
                  setSelectedStudentId(std.id);
                  setTakingConfig(null);
                  setTakingQuestions(null);
                  setActiveAttempt(null);
                  setViewingResult(null);
                }}
                className={`px-2.5 py-1 rounded-lg text-xs font-mono transition-all border flex items-center gap-1 ${
                  isSelected
                    ? (std.classGrade === '10'
                        ? 'bg-purple-600 border-purple-400 text-white font-bold shadow-md shadow-purple-600/25'
                        : 'bg-cyan-600 border-cyan-400 text-white font-bold shadow-md shadow-cyan-600/25')
                    : 'bg-white/[0.04] border-white/10 text-slate-300 hover:text-white hover:bg-white/[0.08]'
                }`}
              >
                <span>{std.name}</span>
                <span className={`text-[9px] px-1 py-0.2 rounded ${
                  isSelected ? 'bg-white/25 text-white' : 'bg-white/5 text-slate-400'
                }`}>
                  {std.classGrade}th
                </span>
              </button>
            );
          })}
        </div>
      </div>

      <div id="sathi-quiz-tab-content">
        {/* TAB 1: WEEKLY CHALLENGE */}
      {activeTab === 'weekly' && (
        <div className="space-y-6">
          {currentWeekConfig ? (
            <div className="rounded-3xl border border-white/[0.08] bg-[#0A0E17]/80 p-6 md:p-8 shadow-2xl backdrop-blur-sm space-y-6">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-white/[0.06]">
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <span className="px-2.5 py-0.5 text-xs font-bold rounded-md bg-cyan-500/15 border border-cyan-500/30 text-cyan-300">
                      OFFICIAL TEST
                    </span>
                    <span className="px-2 py-0.5 text-[11px] font-semibold rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                      {hasAttemptedOfficial ? 'Attempted' : 'Live Assessment'}
                    </span>
                  </div>
                  <h2 className="text-xl font-bold text-white tracking-tight">
                    {currentWeekConfig.title}
                  </h2>
                  <p className="text-xs text-slate-400 mt-0.5">{currentWeekConfig.subtitle}</p>
                </div>

                <div className="flex items-center gap-4 text-xs font-mono text-slate-400">
                  <div className="flex items-center gap-1.5">
                    <Clock className="h-4 w-4 text-cyan-400" />
                    <span>{currentWeekConfig.durationMinutes} Minutes</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <Award className="h-4 w-4 text-emerald-400" />
                    <span>{currentWeekConfig.totalMarks} Marks</span>
                  </div>
                </div>
              </div>

              {/* Blueprint Distribution Summary */}
              <div className="space-y-3">
                <h3 className="text-xs font-bold text-slate-300 uppercase tracking-wider">
                  Mandatory 50 MCQ Blueprint Breakdown
                </h3>
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-3">
                  {[
                    { sub: 'Physics', q: 10, marks: 40, col: 'text-cyan-400' },
                    { sub: 'Chemistry', q: 10, marks: 40, col: 'text-emerald-400' },
                    { sub: 'Mathematics', q: 10, marks: 40, col: 'text-amber-400' },
                    { sub: 'AI / Computer', q: 5, marks: 20, col: 'text-purple-400' },
                    { sub: 'English', q: 10, marks: 40, col: 'text-rose-400' },
                    { sub: 'Physical Ed.', q: 5, marks: 20, col: 'text-lime-400' }
                  ].map((s) => (
                    <div key={s.sub} className="p-3 rounded-2xl bg-slate-900/50 border border-white/5 text-center">
                      <p className="text-[11px] font-semibold text-slate-300">{s.sub}</p>
                      <p className={`text-lg font-black font-mono mt-0.5 ${s.col}`}>{s.q} MCQs</p>
                      <p className="text-[10px] text-slate-500 font-mono">{s.marks} Marks</p>
                    </div>
                  ))}
                </div>
              </div>

              {/* Class Participation & Turnout Overview */}
              {(() => {
                const enrolledForClass = (students || []).filter((s: any) => 
                  !s.id.toLowerCase().startsWith('staff') && 
                  (s.classGrade || '').trim() === studentClass
                );
                const totalEnrolled = Math.max(enrolledForClass.length, 1);
                const allOfficialSubmissions = sathiQuizService.getAllResults().filter(
                  r => !r.isPractice && (r.classGrade || '').trim() === studentClass
                );
                const subCount = allOfficialSubmissions.length;
                const pendingCount = Math.max(0, totalEnrolled - subCount);
                const turnoutPct = totalEnrolled > 0 ? Math.round((subCount / totalEnrolled) * 100) : 0;

                return (
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-4 rounded-2xl bg-slate-900/60 border border-white/[0.08]">
                    <div className="flex items-center gap-3">
                      <div className="h-9 w-9 rounded-xl bg-cyan-500/15 border border-cyan-500/30 flex items-center justify-center text-cyan-400">
                        <Users className="h-4 w-4" />
                      </div>
                      <div>
                        <span className="text-xs font-bold text-white tracking-wide">
                          Class {studentClass} {studentStream} Turnout Overview
                        </span>
                        <p className="text-[11px] text-slate-400">
                          {subCount} of {totalEnrolled} Students Submitted ({turnoutPct}% Turnout) • {pendingCount} Pending
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center gap-2">
                      <span className="px-3 py-1 rounded-xl text-xs font-mono font-bold bg-cyan-500/10 text-cyan-300 border border-cyan-500/20">
                        {turnoutPct}% Submitted
                      </span>
                    </div>
                  </div>
                );
              })()}

              {/* Student Status & Marksheet Card (Or Teacher Oversight Banner) */}
              {(() => {
                if (isTeacher) {
                  return (
                    <div className="rounded-2xl border border-cyan-500/30 bg-cyan-500/10 p-5 space-y-3">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2 text-cyan-300 font-bold text-sm">
                          <GraduationCap className="h-5 w-5" />
                          <span>Faculty Assessment Oversight Console</span>
                        </div>
                        <span className="px-2.5 py-0.5 rounded-full text-[11px] font-mono font-bold bg-cyan-500/20 text-cyan-300 border border-cyan-500/40">
                          Faculty / Teacher Mode
                        </span>
                      </div>
                      <p className="text-xs text-slate-300 leading-relaxed">
                        Teachers and faculty members do not take the student test. You can monitor enrolled Class 12 student turnout, inspect individual student marks, and view detailed question diagnostic errors.
                      </p>
                      <div className="pt-1 flex items-center gap-3">
                        <button
                          onClick={() => setActiveTab('analytics')}
                          className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-slate-950 font-bold text-xs tracking-wide shadow-lg shadow-cyan-500/20 transition-all active:scale-95"
                        >
                          <BarChart3 className="h-4 w-4" />
                          <span>Open Student Marksheets & Question Inspector</span>
                        </button>
                      </div>
                    </div>
                  );
                }

                const targetQuizId = currentWeekConfig?.quizId || OFFICIAL_WEEKLY_QUIZ_CONFIG.quizId;
                const studentBundle = sathiQuizService.getStudentResults(currentUser.id, targetQuizId);
                const isReQuizOpen = studentBundle.isReQuizActive;
                const officialResult = studentBundle.officialResult;
                const reQuizResult = studentBundle.reQuizResult;

                // Scenario A: Re-Quiz is active and student hasn't given the Re-Quiz yet
                if (isReQuizOpen && !reQuizResult) {
                  return (
                    <div className="rounded-2xl border border-amber-500/40 bg-gradient-to-r from-amber-500/15 via-[#0A0E17] to-[#0A0E17] p-5 space-y-4 shadow-xl">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2 text-amber-300 font-bold text-sm">
                          <Sparkles className="h-5 w-5 text-amber-400 animate-pulse" />
                          <span>Teacher Scheduled Re-Quiz • Live Assessment</span>
                        </div>
                        <span className="px-2.5 py-0.5 rounded-full text-[11px] font-mono font-bold bg-amber-500/25 text-amber-300 border border-amber-500/40">
                          Re-Quiz Active
                        </span>
                      </div>
                      <p className="text-xs text-slate-300 leading-relaxed">
                        A Re-Quiz has been initiated by the faculty for this test week. All enrolled students are required to retake the quiz. Your original official submission is safely recorded, and your Re-Quiz attempt will be evaluated and displayed side-by-side.
                      </p>
                      <div className="pt-1 flex flex-wrap items-center gap-3">
                        <button
                          onClick={handleStartOfficialQuiz}
                          className="flex items-center gap-2 px-6 py-2.5 rounded-xl bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-400 hover:to-orange-400 text-slate-950 font-bold text-xs tracking-wide shadow-lg shadow-amber-500/20 transition-all active:scale-95"
                        >
                          <RotateCcw className="h-3.5 w-3.5" />
                          <span>Start Re-Quiz Challenge (50 MCQs)</span>
                        </button>
                        {officialResult && (
                          <button
                            onClick={() => setViewingResult(officialResult)}
                            className="px-4 py-2 rounded-xl bg-slate-900 border border-white/10 hover:bg-slate-800 text-xs font-semibold text-slate-300 transition-colors"
                          >
                            View Official Test Marksheet ({officialResult.score} pts)
                          </button>
                        )}
                      </div>
                    </div>
                  );
                }

                // Scenario B: Student has NOT given the test at all
                if (!officialResult && !reQuizResult) {
                  return (
                    <div className="rounded-2xl border border-amber-500/30 bg-amber-500/10 p-5 space-y-3">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2 text-amber-400 font-bold text-sm">
                          <AlertTriangle className="h-4 w-4" />
                          <span>Student Assessment Status: Not Given Yet</span>
                        </div>
                        <span className="px-2.5 py-0.5 rounded-full text-[11px] font-mono font-bold bg-amber-500/20 text-amber-300 border border-amber-500/40">
                          Pending Attempt
                        </span>
                      </div>
                      <p className="text-xs text-slate-300 leading-relaxed">
                        You have not given this weekly test yet. Your score, accuracy, and subject breakdown will appear on your marksheet once you complete the assessment.
                      </p>
                      <div className="pt-1">
                        <button
                          onClick={handleStartOfficialQuiz}
                          className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-slate-950 font-bold text-xs tracking-wide shadow-lg shadow-cyan-500/20 transition-all active:scale-95"
                        >
                          <Play className="h-3.5 w-3.5 fill-current" />
                          <span>Start Official 50-MCQ Assessment Now</span>
                        </button>
                      </div>
                    </div>
                  );
                }

                // Scenario C: Student has evaluated result (supports switching between Official and Re-Quiz)
                const activeDisplayResult = (viewingResultType === 'RE_QUIZ' && reQuizResult) ? reQuizResult : (officialResult || reQuizResult!);

                return (
                  <div className="rounded-2xl border border-emerald-500/30 bg-gradient-to-br from-emerald-950/20 via-[#0A0E17] to-[#0A0E17] p-5 space-y-4">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-white/[0.06]">
                      <div className="flex items-center gap-2">
                        <CheckCircle2 className="h-4 w-4 text-emerald-400" />
                        <span className="text-sm font-bold text-white tracking-wide">
                          Your Evaluated Marksheet ({activeDisplayResult.studentName})
                        </span>
                        <span className={`px-2 py-0.2 rounded-full text-[10px] font-mono font-bold border ${
                          activeDisplayResult.attemptType === 'RE_QUIZ'
                            ? 'bg-amber-500/20 text-amber-300 border-amber-500/30'
                            : 'bg-emerald-500/20 text-emerald-300 border-emerald-500/30'
                        }`}>
                          {activeDisplayResult.attemptType === 'RE_QUIZ' ? 'Re-Quiz Evaluated' : 'Official Evaluated'}
                        </span>
                      </div>

                      {/* Official vs Re-Quiz Toggle Buttons if both exist or Re-Quiz is active */}
                      {(reQuizResult || isReQuizOpen) && (
                        <div className="flex items-center gap-1.5 bg-black/50 p-1 rounded-xl border border-white/10">
                          {officialResult && (
                            <button
                              onClick={() => setViewingResultType('OFFICIAL')}
                              className={`px-2.5 py-1 rounded-lg text-xs font-bold transition-all ${
                                viewingResultType === 'OFFICIAL'
                                  ? 'bg-cyan-500 text-slate-950 font-bold'
                                  : 'text-slate-400 hover:text-white'
                              }`}
                            >
                              Official Test ({officialResult.score} pts)
                            </button>
                          )}
                          {reQuizResult ? (
                            <button
                              onClick={() => setViewingResultType('RE_QUIZ')}
                              className={`px-2.5 py-1 rounded-lg text-xs font-bold transition-all ${
                                viewingResultType === 'RE_QUIZ'
                                  ? 'bg-amber-500 text-slate-950 font-bold'
                                  : 'text-slate-400 hover:text-amber-300'
                              }`}
                            >
                              Re-Quiz ({reQuizResult.score} pts)
                            </button>
                          ) : isReQuizOpen ? (
                            <button
                              onClick={handleStartOfficialQuiz}
                              className="px-2.5 py-1 rounded-lg text-xs font-bold bg-amber-500/20 text-amber-300 border border-amber-500/30 hover:bg-amber-500/30"
                            >
                              + Retake Re-Quiz
                            </button>
                          ) : null}
                        </div>
                      )}
                    </div>

                    {/* Mini Scorecard Metrics */}
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-center font-mono">
                      <div className="p-3 rounded-xl bg-slate-900 border border-white/5">
                        <span className="text-[10px] text-slate-400 block font-sans uppercase">Total Marks</span>
                        <span className="text-lg font-bold text-white">{activeDisplayResult.score} / {activeDisplayResult.maxScore}</span>
                        <span className="text-[10px] text-cyan-400 block font-sans">({activeDisplayResult.percentage}%)</span>
                      </div>

                      <div className="p-3 rounded-xl bg-slate-900 border border-white/5">
                        <span className="text-[10px] text-slate-400 block font-sans uppercase">Accuracy</span>
                        <span className="text-lg font-bold text-emerald-400">{activeDisplayResult.accuracy}%</span>
                        <span className="text-[10px] text-slate-500 block font-sans">Over {activeDisplayResult.attempted} attempted</span>
                      </div>

                      <div className="p-3 rounded-xl bg-slate-900 border border-white/5">
                        <span className="text-[10px] text-slate-400 block font-sans uppercase">Correct / Wrong</span>
                        <span className="text-lg font-bold text-slate-200">
                          <span className="text-emerald-400">{activeDisplayResult.correctCount}</span> / <span className="text-rose-400">{activeDisplayResult.incorrectCount}</span>
                        </span>
                        <span className="text-[10px] text-slate-500 block font-sans">+{activeDisplayResult.positiveMarks}/-{activeDisplayResult.negativeMarks} marks</span>
                      </div>

                      <div className="p-3 rounded-xl bg-slate-900 border border-white/5">
                        <span className="text-[10px] text-slate-400 block font-sans uppercase">Skipped</span>
                        <span className="text-lg font-bold text-amber-300">{activeDisplayResult.skippedCount}</span>
                        <span className="text-[10px] text-slate-500 block font-sans">0 penalty</span>
                      </div>
                    </div>

                    <div className="flex items-center justify-between pt-1">
                      <span className="text-xs text-slate-400">
                        Submitted on {activeDisplayResult.dateDisplay} ({activeDisplayResult.timeTakenDisplay || `${activeDisplayResult.timeTakenMinutes || 1} Minutes`})
                      </span>
                      <button
                        onClick={() => setViewingResult(activeDisplayResult)}
                        className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-bold text-xs shadow-md shadow-cyan-500/20 transition-all active:scale-95"
                      >
                        <span>View Full OMR & Solutions</span>
                        <ArrowRight className="h-3.5 w-3.5" />
                      </button>
                    </div>
                  </div>
                );
              })()}

              {/* Authoritative Marking Instructions */}
              <div className="rounded-2xl bg-slate-900/40 border border-white/5 p-4 space-y-2 text-xs text-slate-400">
                <div className="flex items-center gap-2 text-slate-300 font-bold">
                  <ShieldCheck className="h-4 w-4 text-cyan-400" />
                  <span>Authoritative Marking Scheme & Rules</span>
                </div>
                <ul className="list-disc list-inside space-y-1 pl-1 font-mono text-[11px]">
                  <li>Correct Answer: <strong className="text-emerald-400">+{currentWeekConfig.positiveMarks || 4} marks</strong></li>
                  <li>Incorrect Answer: <strong className="text-rose-400">-{currentWeekConfig.negativeMarks || 1} mark</strong> penalty</li>
                  <li>Skipped Question: <strong className="text-slate-300">0 marks</strong> (no negative penalty, does not reduce accuracy denominator)</li>
                  <li>Total Possible Marks: <strong className="text-cyan-300">{currentWeekConfig.totalMarks || 200} marks</strong> (50 questions)</li>
                  <li>Server-Authoritative Timer: Real-time countdown linked to server deadline; answers autosaved automatically.</li>
                </ul>
              </div>

              {/* Action Buttons */}
              <div className="flex items-center justify-between pt-2">
                <div className="text-xs text-slate-400">
                  {hasAttemptedOfficial ? (
                    <span className="text-emerald-400 flex items-center gap-1.5 font-semibold">
                      <CheckCircle2 className="h-4 w-4" /> You have already completed this week's official test.
                    </span>
                  ) : (
                    <span>Ready to take the challenge? Ensure uninterrupted focus for {currentWeekConfig.durationMinutes} minutes.</span>
                  )}
                </div>

                <div className="flex items-center gap-3">
                  {(() => {
                    const bundle = sathiQuizService.getStudentResults(currentUser.id, currentWeekConfig?.quizId || '');
                    if (bundle.isReQuizActive && !bundle.reQuizResult) {
                      return (
                        <button
                          onClick={handleStartOfficialQuiz}
                          className="flex items-center gap-2 px-6 py-2.5 rounded-xl bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-400 hover:to-orange-400 text-slate-950 font-bold text-xs shadow-lg shadow-amber-500/20 transition-all active:scale-95"
                        >
                          <RotateCcw className="h-3.5 w-3.5" />
                          <span>Start Re-Quiz Challenge</span>
                        </button>
                      );
                    }
                    if (bundle.officialResult || bundle.reQuizResult) {
                      return (
                        <button
                          onClick={() => {
                            const res = (viewingResultType === 'RE_QUIZ' && bundle.reQuizResult) ? bundle.reQuizResult : (bundle.officialResult || bundle.reQuizResult!);
                            if (res) setViewingResult(res);
                          }}
                          className="px-5 py-2.5 rounded-xl bg-cyan-500/10 border border-cyan-500/30 hover:bg-cyan-500/20 text-xs font-bold text-cyan-300 transition-colors"
                        >
                          View My Scorecard
                        </button>
                      );
                    }
                    return (
                      <button
                        onClick={handleStartOfficialQuiz}
                        className="flex items-center gap-2 px-6 py-2.5 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-400 hover:to-teal-500 text-slate-950 font-bold text-xs shadow-lg shadow-emerald-500/20 transition-all active:scale-95"
                      >
                        <Play className="h-3.5 w-3.5 fill-current" />
                        <span>Begin 50-MCQ Test</span>
                      </button>
                    );
                  })()}
                </div>
              </div>
            </div>
          ) : (
            <div className="p-8 text-center text-slate-500">No active weekly challenge configured.</div>
          )}
        </div>
      )}

      {/* TAB 2: PRACTICE MOCKS */}
      {activeTab === 'practice' && (
        <div className="space-y-6">
          <div className="rounded-3xl border border-white/[0.08] bg-[#0A0E17]/80 p-6 md:p-8 shadow-2xl backdrop-blur-sm space-y-6">
            <div>
              <h2 className="text-xl font-bold text-white tracking-tight flex items-center gap-2">
                <Zap className="h-5 w-5 text-cyan-400" />
                <span>Custom Practice Mock Generator</span>
              </h2>
              <p className="text-xs text-slate-400 mt-1">
                Generate personalized practice tests to sharpen concepts before the official weekly assessment. Practice results never impact your official class ranking.
              </p>
            </div>

            {/* Practice Options */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5 pt-2">
              <div>
                <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">
                  Select Subject Focus
                </label>
                <div className="grid grid-cols-2 gap-2">
                  {[
                    { id: 'Physics', label: 'Physics' },
                    { id: 'Chemistry', label: 'Chemistry' },
                    { id: 'Mathematics', label: 'Mathematics' },
                    { id: 'AI / Computer', label: 'AI & Computer' },
                    { id: 'English', label: 'English' },
                    { id: 'Physical Education', label: 'Physical Ed.' }
                  ].map((s) => (
                    <button
                      key={s.id}
                      type="button"
                      onClick={() => setPracticeSubject(s.id as any)}
                      className={`p-3 rounded-xl border text-xs font-semibold text-left transition-all ${
                        practiceSubject === s.id
                          ? 'bg-cyan-500/15 border-cyan-500/50 text-cyan-200'
                          : 'bg-slate-900/40 border-white/5 text-slate-400 hover:bg-slate-800/40'
                      }`}
                    >
                      {s.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Class Participation & Turnout Overview */}
              {(() => {
                const enrolledForClass = (students || []).filter((s: any) => 
                  !s.id.toLowerCase().startsWith('staff') && 
                  (s.classGrade || '').trim() === studentClass
                );
                const totalEnrolled = Math.max(enrolledForClass.length, 1);
                const allOfficialSubmissions = sathiQuizService.getAllResults().filter(
                  r => !r.isPractice && (r.classGrade || '').trim() === studentClass
                );
                const subCount = allOfficialSubmissions.length;
                const pendingCount = Math.max(0, totalEnrolled - subCount);
                const turnoutPct = totalEnrolled > 0 ? Math.round((subCount / totalEnrolled) * 100) : 0;

                return (
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-4 rounded-2xl bg-slate-900/60 border border-white/[0.08]">
                    <div className="flex items-center gap-3">
                      <div className="h-9 w-9 rounded-xl bg-cyan-500/15 border border-cyan-500/30 flex items-center justify-center text-cyan-400">
                        <Users className="h-4 w-4" />
                      </div>
                      <div>
                        <span className="text-xs font-bold text-white tracking-wide">
                          Class {studentClass} {studentStream} Turnout Overview
                        </span>
                        <p className="text-[11px] text-slate-400">
                          {subCount} of {totalEnrolled} Students Submitted ({turnoutPct}% Turnout) • {pendingCount} Pending
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center gap-2">
                      <span className="px-3 py-1 rounded-xl text-xs font-mono font-bold bg-cyan-500/10 text-cyan-300 border border-cyan-500/20">
                        {turnoutPct}% Submitted
                      </span>
                    </div>
                  </div>
                );
              })()}

              {/* Student Status & Marksheet Card (Or Teacher Oversight Banner) */}
              {(() => {
                if (isTeacher) {
                  return (
                    <div className="rounded-2xl border border-cyan-500/30 bg-cyan-500/10 p-5 space-y-3">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2 text-cyan-300 font-bold text-sm">
                          <GraduationCap className="h-5 w-5" />
                          <span>Faculty Assessment Oversight Console</span>
                        </div>
                        <span className="px-2.5 py-0.5 rounded-full text-[11px] font-mono font-bold bg-cyan-500/20 text-cyan-300 border border-cyan-500/40">
                          Faculty / Teacher Mode
                        </span>
                      </div>
                      <p className="text-xs text-slate-300 leading-relaxed">
                        Teachers and faculty members do not take the student test. You can monitor enrolled Class 12 student turnout, inspect individual student marks, and view detailed question diagnostic errors.
                      </p>
                      <div className="pt-1 flex items-center gap-3">
                        <button
                          onClick={() => setActiveTab('analytics')}
                          className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-slate-950 font-bold text-xs tracking-wide shadow-lg shadow-cyan-500/20 transition-all active:scale-95"
                        >
                          <BarChart3 className="h-4 w-4" />
                          <span>Open Student Marksheets & Question Inspector</span>
                        </button>
                      </div>
                    </div>
                  );
                }

                const officialResult = userResults.find(r => {
                    if (r.isPractice) return false;
                    if ((r.attemptType || 'OFFICIAL') !== 'OFFICIAL') return false;
                    const weekMatch = (currentWeekConfig?.quizId || '').match(/w\d+/i);
                    const weekKey = weekMatch ? weekMatch[0].toLowerCase() : '';
                    return r.quizId === currentWeekConfig?.quizId || (weekKey && (r.quizId || '').toLowerCase().includes(weekKey));
                  });

                if (!hasAttemptedOfficial || !officialResult) {
                  return (
                    <div className="rounded-2xl border border-amber-500/30 bg-amber-500/10 p-5 space-y-3">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2 text-amber-400 font-bold text-sm">
                          <AlertTriangle className="h-4 w-4" />
                          <span>Student Assessment Status: Not Given Yet</span>
                        </div>
                        <span className="px-2.5 py-0.5 rounded-full text-[11px] font-mono font-bold bg-amber-500/20 text-amber-300 border border-amber-500/40">
                          Pending Attempt
                        </span>
                      </div>
                      <p className="text-xs text-slate-300 leading-relaxed">
                        You have not given this weekly test yet. Your score, accuracy, and subject breakdown will appear on your marksheet once you complete the assessment.
                      </p>
                      <div className="pt-1">
                        <button
                          onClick={handleStartOfficialQuiz}
                          className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-slate-950 font-bold text-xs tracking-wide shadow-lg shadow-cyan-500/20 transition-all active:scale-95"
                        >
                          <Play className="h-3.5 w-3.5 fill-current" />
                          <span>Start Official 50-MCQ Assessment Now</span>
                        </button>
                      </div>
                    </div>
                  );
                }

                return (
                  <div className="rounded-2xl border border-emerald-500/30 bg-gradient-to-br from-emerald-950/20 via-[#0A0E17] to-[#0A0E17] p-5 space-y-4">
                    <div className="flex items-center justify-between pb-3 border-b border-white/[0.06]">
                      <div className="flex items-center gap-2">
                        <CheckCircle2 className="h-4 w-4 text-emerald-400" />
                        <span className="text-sm font-bold text-white tracking-wide">
                          Your Evaluated Marksheet ({officialResult.studentName})
                        </span>
                        <span className="px-2 py-0.2 rounded-full text-[10px] font-mono font-bold bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                          Evaluated
                        </span>
                      </div>

                      <div className="text-right">
                        <span className="text-xs font-mono font-bold text-purple-300">
                          {officialResult.isClassStandingAvailable ? `Rank #${officialResult.rank} of ${officialResult.totalStudents}` : 'Class Standing: Pending Turnout'}
                        </span>
                      </div>
                    </div>

                    {/* Mini Scorecard Metrics */}
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-center font-mono">
                      <div className="p-3 rounded-xl bg-slate-900 border border-white/5">
                        <span className="text-[10px] text-slate-400 block font-sans uppercase">Total Marks</span>
                        <span className="text-lg font-bold text-white">{officialResult.score} / {officialResult.maxScore}</span>
                        <span className="text-[10px] text-cyan-400 block font-sans">({officialResult.percentage}%)</span>
                      </div>

                      <div className="p-3 rounded-xl bg-slate-900 border border-white/5">
                        <span className="text-[10px] text-slate-400 block font-sans uppercase">Accuracy</span>
                        <span className="text-lg font-bold text-emerald-400">{officialResult.accuracy}%</span>
                        <span className="text-[10px] text-slate-500 block font-sans">Over {officialResult.attempted} attempted</span>
                      </div>

                      <div className="p-3 rounded-xl bg-slate-900 border border-white/5">
                        <span className="text-[10px] text-slate-400 block font-sans uppercase">Correct / Wrong</span>
                        <span className="text-lg font-bold text-slate-200">
                          <span className="text-emerald-400">{officialResult.correctCount}</span> / <span className="text-rose-400">{officialResult.incorrectCount}</span>
                        </span>
                        <span className="text-[10px] text-slate-500 block font-sans">+{officialResult.positiveMarks}/-{officialResult.negativeMarks} marks</span>
                      </div>

                      <div className="p-3 rounded-xl bg-slate-900 border border-white/5">
                        <span className="text-[10px] text-slate-400 block font-sans uppercase">Skipped</span>
                        <span className="text-lg font-bold text-amber-300">{officialResult.skippedCount}</span>
                        <span className="text-[10px] text-slate-500 block font-sans">0 penalty</span>
                      </div>
                    </div>

                    <div className="flex items-center justify-between pt-1">
                      <span className="text-xs text-slate-400">
                        Submitted on {officialResult.dateDisplay} ({officialResult.timeTakenDisplay || `${officialResult.timeTakenMinutes || 1} Minutes`})
                      </span>
                      <button
                        onClick={() => setViewingResult(officialResult)}
                        className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-bold text-xs shadow-md shadow-cyan-500/20 transition-all active:scale-95"
                      >
                        <span>View Full OMR & Solutions</span>
                        <ArrowRight className="h-3.5 w-3.5" />
                      </button>
                    </div>
                  </div>
                );
              })()}

              <div>
                <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">
                  Question Count
                </label>
                <div className="grid grid-cols-3 gap-2">
                  {[5, 10, 20].map((num) => (
                    <button
                      key={num}
                      type="button"
                      onClick={() => setPracticeCount(num)}
                      className={`p-3 rounded-xl border text-xs font-mono font-bold text-center transition-all ${
                        practiceCount === num
                          ? 'bg-emerald-500/15 border-emerald-500/50 text-emerald-200'
                          : 'bg-slate-900/40 border-white/5 text-slate-400 hover:bg-slate-800/40'
                      }`}
                    >
                      {num} MCQs
                    </button>
                  ))}
                </div>

                <div className="mt-5 p-4 rounded-xl bg-slate-900/50 border border-white/5 text-xs text-slate-400 space-y-1 font-mono">
                  <p>Estimated Duration: <strong className="text-white">{practiceCount * 1.5} minutes</strong></p>
                  <p>Total Marks: <strong className="text-white">{practiceCount * 4} marks (+4/-1)</strong></p>
                  <p>Evaluation: Instant detailed answer review with KaTeX formulas</p>
                </div>
              </div>
            </div>

            <div className="pt-4 border-t border-white/[0.06] flex justify-end">
              <button
                onClick={handleStartPracticeQuiz}
                className="flex items-center gap-2 px-6 py-3 rounded-xl bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-slate-950 font-bold text-xs shadow-lg shadow-cyan-500/20 transition-all active:scale-95"
              >
                <Play className="h-4 w-4 fill-current" />
                <span>Launch Practice Test</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* TAB 3: MY RESULTS & SCORECARDS */}
      {activeTab === 'results' && (
        <div className="space-y-4">
          <div className="flex items-center justify-between pb-2">
            <h2 className="text-sm font-bold text-white uppercase tracking-wider">
              Attempt History ({userResults.length})
            </h2>
          </div>

          {userResults.length === 0 ? (
            <div className="rounded-3xl border border-white/[0.08] bg-[#0A0E17]/80 p-8 text-center text-slate-500">
              You have not attempted any quizzes yet. Start this week's challenge above!
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {userResults.map((res) => (
                <div
                  key={res.attemptId}
                  className="rounded-2xl border border-white/[0.08] bg-[#0A0E17]/80 p-5 space-y-4 hover:border-cyan-500/30 transition-all shadow-xl"
                >
                  <div className="flex items-start justify-between">
                    <div>
                      {(() => {
                        const timeStr = res.submittedAt
                          ? new Date(res.submittedAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', hour12: true })
                          : res.startedAt
                          ? new Date(res.startedAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', hour12: true })
                          : '';

                        return (
                          <div className="flex flex-wrap items-center gap-2 mb-1">
                            <span className="px-2 py-0.5 text-[10px] font-bold rounded bg-cyan-500/10 border border-cyan-500/20 text-cyan-300">
                              {res.isPractice ? 'Practice Mock' : 'Official Test'}
                            </span>
                            <span className="text-[11px] text-slate-400 font-mono flex items-center gap-1">
                              <Calendar className="h-3 w-3 text-slate-500" />
                              <span>{res.dateDisplay}</span>
                              {timeStr && (
                                <>
                                  <span className="text-slate-600">•</span>
                                  <Clock className="h-3 w-3 text-cyan-400" />
                                  <span className="text-cyan-300 font-semibold">{timeStr}</span>
                                </>
                              )}
                            </span>
                          </div>
                        );
                      })()}
                      <h4 className="text-sm font-bold text-white">Score: {res.score} / {res.maxScore} Marks</h4>
                    </div>

                    <div className="text-right">
                      {(() => {
                        const solvePct = res.totalQuestions > 0 ? Math.round((res.correctCount / res.totalQuestions) * 100) : 0;
                        const displayPct = (res.percentage === 0 && res.correctCount > 0) ? solvePct : res.percentage;
                        return (
                          <span className="text-xl font-black font-mono text-emerald-400">
                            {displayPct}%
                          </span>
                        );
                      })()}
                      <p className="text-[10px] text-slate-400 font-mono">Accuracy: {res.accuracy}%</p>
                    </div>
                  </div>

                  <div className="flex items-center justify-between pt-2 border-t border-white/[0.06] text-xs">
                    <span className="text-slate-400 font-mono">
                      {res.correctCount} Correct � {res.incorrectCount} Wrong � {res.skippedCount} Skipped
                    </span>

                    <button
                      onClick={() => setViewingResult(res)}
                      className="flex items-center gap-1 text-cyan-400 hover:text-cyan-300 font-semibold"
                    >
                      <span>View Scorecard</span>
                      <ArrowRight className="h-3 w-3" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* TAB 4: SYLLABUS & BLUEPRINT */}
      {activeTab === 'syllabus' && (
        <SyllabusManager isTeacher={isTeacher} studentGrade={studentClass} />
      )}

      {/* TAB 5: TEACHER ANALYTICS & LEADERBOARD */}
      {activeTab === 'analytics' && (
        <TeacherQuizAnalytics
          isTeacher={isTeacher}
          currentUserId={currentUser.id}
          currentUserName={currentUser.name}
        />
      )}
      </div>
    </div>
  );
};
