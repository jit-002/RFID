import React, { useState, useEffect, useMemo, useCallback, useRef } from 'react';
import { 
  Clock, 
  AlertTriangle, 
  ChevronLeft, 
  ChevronRight, 
  Bookmark, 
  CheckCircle2, 
  Send, 
  RotateCcw, 
  BookOpen,
  Flag,
  Wifi,
  WifiOff
} from 'lucide-react';
import { WeeklyQuizConfig, QuizQuestion, ActiveQuizAttempt } from '../../types/quiz';

interface QuizTakingViewProps {
  config: WeeklyQuizConfig;
  questions: QuizQuestion[];
  studentId: string;
  studentName: string;
  isPractice?: boolean;
  attempt: ActiveQuizAttempt;
  onAutosaveAnswers: (answers: Record<string, string>) => void;
  onSubmit: (answers: Record<string, string>, timeTakenSeconds: number) => void;
  onCancel: () => void;
}

/**
 * Isolated Real-Time Countdown Timer Badge.
 * Runs completely independent of option clicks and question navigation,
 * preventing any page lag or interval resets.
 */
interface RealtimeQuizTimerProps {
  expiresEpoch: number;
  onExpire: () => void;
}

const RealtimeQuizTimer: React.FC<RealtimeQuizTimerProps> = React.memo(({
  expiresEpoch,
  onExpire
}) => {
  const [remaining, setRemaining] = useState<number>(() =>
    Math.max(0, Math.round((expiresEpoch - Date.now()) / 1000))
  );

  const onExpireRef = useRef(onExpire);
  onExpireRef.current = onExpire;

  useEffect(() => {
    const updateCountdown = () => {
      const now = Date.now();
      const rem = Math.max(0, Math.round((expiresEpoch - now) / 1000));
      setRemaining(rem);

      if (rem <= 0) {
        clearInterval(timer);
        onExpireRef.current();
      }
    };

    updateCountdown();
    // 1000ms drift-corrected interval
    const timer = setInterval(updateCountdown, 1000);
    return () => clearInterval(timer);
  }, [expiresEpoch]);

  const formattedTime = useMemo(() => {
    if (remaining <= 0) return '00:00 (EXPIRED)';
    const hours = Math.floor(remaining / 3600);
    const minutes = Math.floor((remaining % 3600) / 60);
    const seconds = remaining % 60;
    if (hours > 0) {
      return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
    }
    return `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
  }, [remaining]);

  const isLowTime = remaining > 0 && remaining <= 300; // Under 5 mins
  const isCriticalTime = remaining > 0 && remaining <= 60; // Under 1 min
  const isExpired = remaining <= 0;

  return (
    <div
      className={`flex items-center gap-2 px-3.5 py-1.5 rounded-xl border text-xs font-mono font-semibold transition-all shadow-sm ${
        isExpired
          ? 'bg-rose-950/80 border-rose-500 text-rose-300'
          : isCriticalTime
          ? 'bg-rose-500/20 border-rose-500/50 text-rose-400 animate-pulse'
          : isLowTime
          ? 'bg-amber-500/15 border-amber-500/40 text-amber-300'
          : 'bg-slate-900/80 border-white/10 text-cyan-300'
      }`}
    >
      <Clock className={`h-3.5 w-3.5 ${isCriticalTime ? 'text-rose-400' : isLowTime ? 'text-amber-400' : 'text-cyan-400'}`} />
      <span>Time Left: {formattedTime}</span>
    </div>
  );
});

export const QuizTakingView: React.FC<QuizTakingViewProps> = ({
  config,
  questions,
  studentId,
  studentName,
  isPractice = false,
  attempt,
  onAutosaveAnswers,
  onSubmit,
  onCancel
}) => {
  const [currentIndex, setCurrentIndex] = useState(0);
  // Restore saved answers from active attempt upon page refresh or multi-tab
  const [selectedAnswers, setSelectedAnswers] = useState<Record<string, string>>(
    () => attempt.savedAnswers || {}
  );
  const [markedForReview, setMarkedForReview] = useState<Set<string>>(new Set());
  const [subjectFilter, setSubjectFilter] = useState<string>('all');
  const [showSubmitModal, setShowSubmitModal] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isOnline, setIsOnline] = useState(navigator.onLine);

  // Server-authoritative timer: calculate remaining from attempt.expiresAt
  const expiresEpoch = useMemo(() => new Date(attempt.expiresAt).getTime(), [attempt.expiresAt]);
  const startedEpoch = useMemo(() => new Date(attempt.startedAt).getTime(), [attempt.startedAt]);
  const [isExpired, setIsExpired] = useState(() => Date.now() >= expiresEpoch);

  // Keep stable ref of selectedAnswers to completely decouple timer callbacks from answer updates
  const answersRef = useRef<Record<string, string>>(selectedAnswers);
  useEffect(() => {
    answersRef.current = selectedAnswers;
  }, [selectedAnswers]);

  // Online / Offline monitor
  useEffect(() => {
    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);
    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);
    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  // Stable Auto-submit callback
  const isSubmittingRef = useRef(false);
  const handleAutoSubmit = useCallback(() => {
    if (isSubmittingRef.current) return;
    isSubmittingRef.current = true;
    setIsSubmitting(true);
    setIsExpired(true);
    const elapsedSeconds = Math.max(1, Math.round((Date.now() - startedEpoch) / 1000));
    onSubmit(answersRef.current, elapsedSeconds);
  }, [onSubmit, startedEpoch]);

  // Debounced Autosave answers
  const autosaveTimeoutRef = useRef<any>(null);
  const triggerAutosave = (updatedAnswers: Record<string, string>) => {
    if (autosaveTimeoutRef.current) {
      clearTimeout(autosaveTimeoutRef.current);
    }
    autosaveTimeoutRef.current = setTimeout(() => {
      onAutosaveAnswers(updatedAnswers);
    }, 600);
  };

  const currentQuestion = questions[currentIndex] || questions[0];

  // Stats calculation
  const totalCount = questions.length;
  const answeredCount = Object.keys(selectedAnswers).length;
  const reviewCount = markedForReview.size;
  const unansweredCount = totalCount - answeredCount;

  // Filtered questions for OMR
  const filteredQuestions = useMemo(() => {
    if (subjectFilter === 'all') return questions;
    return questions.filter((q) => q.subject === subjectFilter);
  }, [questions, subjectFilter]);

  // Handle Option Select (toggles selection off if clicked again -> marks as skipped)
  const handleSelectOption = (optionId: string) => {
    if (!currentQuestion || isExpired || isSubmitting) return;
    const isCurrentlySelected = selectedAnswers[currentQuestion.id] === optionId;
    const updated = { ...selectedAnswers };
    if (isCurrentlySelected) {
      delete updated[currentQuestion.id];
    } else {
      updated[currentQuestion.id] = optionId;
    }
    setSelectedAnswers(updated);
    triggerAutosave(updated);
  };

  // Clear answer
  const handleClearAnswer = () => {
    if (!currentQuestion || isExpired || isSubmitting) return;
    const updated = { ...selectedAnswers };
    delete updated[currentQuestion.id];
    setSelectedAnswers(updated);
    triggerAutosave(updated);
  };

  // Toggle Review
  const handleToggleReview = () => {
    if (!currentQuestion) return;
    setMarkedForReview((prev) => {
      const next = new Set(prev);
      if (next.has(currentQuestion.id)) {
        next.delete(currentQuestion.id);
      } else {
        next.add(currentQuestion.id);
      }
      return next;
    });
  };

  // Manual Submission Confirmation
  const handleConfirmSubmit = () => {
    if (isSubmittingRef.current) return;
    isSubmittingRef.current = true;
    setShowSubmitModal(false);
    setIsSubmitting(true);
    const elapsedSeconds = Math.max(1, Math.round((Date.now() - startedEpoch) / 1000));
    onSubmit(selectedAnswers, elapsedSeconds);
  };

  return (
    <div className="min-h-screen bg-[#050811] text-slate-100 flex flex-col">
      {/* Top Examination Navigation Bar */}
      <header className="sticky top-0 z-40 border-b border-white/[0.08] bg-[#0A0E17]/95 backdrop-blur-xl px-4 py-3 flex items-center justify-between shadow-lg">
        <div className="flex items-center gap-3">
          <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-cyan-500/10 border border-cyan-500/30 text-cyan-400">
            <BookOpen className="h-4 w-4" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-sm font-bold text-white tracking-wide">{config.title}</h1>
              <span className="px-2 py-0.5 text-[10px] font-semibold rounded-full bg-cyan-500/10 border border-cyan-500/20 text-cyan-300">
                {isPractice ? 'Practice Mock' : 'Official Weekly'}
              </span>
              <span className="hidden sm:inline-flex items-center gap-1 text-[10px] text-slate-400">
                {isOnline ? (
                  <span className="text-emerald-400 flex items-center gap-1">
                    <Wifi className="h-3 w-3" /> Online
                  </span>
                ) : (
                  <span className="text-rose-400 flex items-center gap-1">
                    <WifiOff className="h-3 w-3" /> Offline (Timer Active)
                  </span>
                )}
              </span>
            </div>
            <p className="text-[11px] text-slate-400">
              {studentName} ({studentId}) • Class {config.classGrade || '12'} {config.stream || 'Science'} • {questions.length} MCQs
            </p>
          </div>
        </div>

        {/* Server-Authoritative Real-Time Timer & Submit Controls */}
        <div className="flex items-center gap-3">
          <RealtimeQuizTimer expiresEpoch={expiresEpoch} onExpire={handleAutoSubmit} />

          <button
            onClick={() => setShowSubmitModal(true)}
            disabled={isSubmitting || isExpired}
            className="flex items-center gap-2 px-4 py-1.5 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-400 hover:to-teal-500 text-slate-950 font-bold text-xs tracking-wide shadow-lg shadow-emerald-500/20 transition-all active:scale-95 disabled:opacity-50"
          >
            <Send className="h-3.5 w-3.5" />
            <span>Submit Test</span>
          </button>
        </div>
      </header>

      {/* Main Dual-Pane Test Container */}
      <div className="flex-1 flex flex-col lg:flex-row overflow-hidden max-w-7xl w-full mx-auto p-4 md:p-6 gap-6">
        {/* Left / Main Question Area */}
        <div className="flex-1 flex flex-col justify-between bg-[#0A0E17]/80 border border-white/[0.08] rounded-3xl p-6 md:p-8 shadow-2xl backdrop-blur-sm">
          <div className="space-y-6">
            {/* Question Header & Subject Meta */}
            <div className="flex items-center justify-between pb-4 border-b border-white/[0.06]">
              <div className="flex items-center gap-3">
                <span className="flex h-8 w-8 items-center justify-center rounded-xl bg-cyan-500/15 border border-cyan-500/30 text-cyan-300 font-mono font-bold text-xs">
                  Q{currentIndex + 1}
                </span>
                <div>
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-bold text-slate-200">{currentQuestion.subject}</span>
                    <span className="text-slate-600">•</span>
                    <span className="text-[11px] text-slate-400">{currentQuestion.chapter}</span>
                  </div>
                  <p className="text-[10px] text-slate-500 font-mono">{currentQuestion.topic}</p>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <button
                  onClick={handleToggleReview}
                  className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold border transition-all ${
                    markedForReview.has(currentQuestion.id)
                      ? 'bg-amber-500/20 border-amber-500/40 text-amber-300'
                      : 'bg-slate-900 border-white/10 text-slate-400 hover:text-slate-200'
                  }`}
                >
                  <Bookmark className="h-3.5 w-3.5" />
                  <span>{markedForReview.has(currentQuestion.id) ? 'Marked' : 'Mark for Review'}</span>
                </button>

                <div className="hidden sm:inline-flex px-2.5 py-1 rounded-lg bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 font-mono text-xs font-bold">
                  +{config.positiveMarks || 4} / -{config.negativeMarks || 1} Marks
                </div>
              </div>
            </div>

            {/* Question Text */}
            <div className="text-sm md:text-base text-slate-100 leading-relaxed font-sans font-medium whitespace-pre-wrap">
              {currentQuestion.text}
            </div>

            {/* Multiple Choice Options */}
            <div className="space-y-3 pt-2">
              {currentQuestion.options.map((opt) => {
                const isSelected = selectedAnswers[currentQuestion.id] === opt.id;

                return (
                  <button
                    key={opt.id}
                    onClick={() => handleSelectOption(opt.id)}
                    disabled={isExpired || isSubmitting}
                    className={`w-full flex items-center justify-between p-4 rounded-2xl border text-left text-xs md:text-sm transition-all ${
                      isSelected
                        ? 'bg-gradient-to-r from-cyan-500/20 to-blue-500/10 border-cyan-500/50 text-white shadow-lg shadow-cyan-500/10'
                        : 'bg-slate-900/40 border-white/[0.06] text-slate-300 hover:bg-slate-900/80 hover:border-white/10'
                    }`}
                  >
                    <div className="flex items-center gap-3.5">
                      <span className={`flex h-7 w-7 shrink-0 items-center justify-center rounded-xl font-mono text-xs font-bold border transition-colors ${
                        isSelected
                          ? 'bg-cyan-500 text-slate-950 border-cyan-400 shadow-glow-cyan'
                          : 'bg-slate-800 text-slate-400 border-white/10'
                      }`}>
                        {opt.optionKey}
                      </span>
                      <span className="leading-snug">{opt.text}</span>
                    </div>

                    {isSelected && (
                      <CheckCircle2 className="h-4 w-4 text-cyan-400 shrink-0 ml-2" />
                    )}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Question Action Footer */}
          <div className="flex items-center justify-between pt-8 border-t border-white/[0.06] mt-6 gap-3">
            <button
              onClick={() => setCurrentIndex((prev) => Math.max(0, prev - 1))}
              disabled={currentIndex === 0}
              className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 text-xs font-semibold text-slate-300 border border-white/10 disabled:opacity-30 transition-colors"
            >
              <ChevronLeft className="h-4 w-4" />
              <span>Previous</span>
            </button>

            <div className="flex items-center gap-2">
              {selectedAnswers[currentQuestion.id] ? (
                <button
                  onClick={handleClearAnswer}
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold text-rose-300 bg-rose-500/15 hover:bg-rose-500/25 border border-rose-500/30 transition-colors"
                  title="Clear selected option and leave this question skipped (0 marks)"
                >
                  <RotateCcw className="h-3.5 w-3.5" />
                  <span>Clear Selection</span>
                </button>
              ) : (
                <span className="hidden sm:inline-flex items-center gap-1 text-[11px] text-amber-400/90 font-mono px-2.5 py-1 rounded-lg bg-amber-500/10 border border-amber-500/20">
                  Skipped (0 Marks)
                </span>
              )}

              {currentIndex === questions.length - 1 ? (
                <button
                  id="submit-test-final-btn"
                  onClick={() => setShowSubmitModal(true)}
                  disabled={isSubmitting || isExpired}
                  className="flex items-center gap-2 px-6 py-2 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-400 hover:to-teal-400 text-slate-950 font-black text-xs shadow-lg shadow-emerald-500/30 transition-all active:scale-95 animate-pulse"
                >
                  <Send className="h-4 w-4" />
                  <span>Submit Test</span>
                </button>
              ) : (
                <button
                  onClick={() => setCurrentIndex((prev) => Math.min(questions.length - 1, prev + 1))}
                  className="flex items-center gap-1.5 px-5 py-2 rounded-xl bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-bold text-xs shadow-md shadow-cyan-500/20 transition-all"
                >
                  <span>Next</span>
                  <ChevronRight className="h-4 w-4" />
                </button>
              )}
            </div>
          </div>
        </div>

        {/* Right OMR Palette & Section Nav */}
        <div className="w-full lg:w-80 flex flex-col bg-[#0A0E17]/80 border border-white/[0.08] rounded-3xl p-5 shadow-2xl backdrop-blur-sm space-y-4">
          {/* Section Subject Selector */}
          <div className="space-y-1.5">
            <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">Filter Section</span>
            <div className="flex flex-wrap gap-1.5">
              {['all', 'Physics', 'Chemistry', 'Mathematics', 'AI / Computer', 'English', 'Physical Education'].map((sub) => (
                <button
                  key={sub}
                  onClick={() => setSubjectFilter(sub)}
                  className={`px-2.5 py-1 rounded-lg text-[10px] font-semibold border transition-all ${
                    subjectFilter === sub
                      ? 'bg-cyan-500 text-slate-950 border-cyan-400 font-bold'
                      : 'bg-slate-900 text-slate-400 border-white/5 hover:border-white/10'
                  }`}
                >
                  {sub === 'all' ? 'All (50)' : sub}
                </button>
              ))}
            </div>
          </div>

          {/* Quick Metrics Bar */}
          <div className="grid grid-cols-3 gap-2 p-2.5 rounded-2xl bg-slate-900/50 border border-white/5 text-center font-mono text-[11px]">
            <div>
              <span className="text-slate-500 block text-[9px] uppercase font-sans">Answered</span>
              <span className="font-bold text-emerald-400">{answeredCount}</span>
            </div>
            <div>
              <span className="text-slate-500 block text-[9px] uppercase font-sans">Review</span>
              <span className="font-bold text-amber-400">{reviewCount}</span>
            </div>
            <div>
              <span className="text-slate-500 block text-[9px] uppercase font-sans">Skipped</span>
              <span className="font-bold text-slate-400">{unansweredCount}</span>
            </div>
          </div>

          {/* OMR Question Matrix */}
          <div className="space-y-1.5 flex-1 flex flex-col">
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">Question Matrix</span>
              {answeredCount > 0 && (
                <button
                  type="button"
                  onClick={() => {
                    if (window.confirm('Reset all answers? All questions will be marked as Skipped (0 marks).')) {
                      setSelectedAnswers({});
                      triggerAutosave({});
                    }
                  }}
                  className="text-[10px] text-rose-400 hover:text-rose-300 font-mono underline"
                  title="Clear all answered questions"
                >
                  Clear All ({answeredCount})
                </button>
              )}
            </div>
            <div className="flex-1 max-h-72 lg:max-h-80 overflow-y-auto pr-1">
              <div className="grid grid-cols-5 gap-2">
                {filteredQuestions.map((q) => {
                  const isCurrent = questions[currentIndex]?.id === q.id;
                  const isAnswered = !!selectedAnswers[q.id];
                  const isMarked = markedForReview.has(q.id);

                  let btnStyle = 'bg-slate-900/80 text-slate-400 border-white/5 hover:border-white/20';
                  if (isCurrent) {
                    btnStyle = 'border-2 border-cyan-400 text-white font-bold bg-cyan-500/20 shadow-glow-cyan';
                  } else if (isMarked) {
                    btnStyle = 'bg-amber-500/20 border-amber-500/40 text-amber-300 font-semibold';
                  } else if (isAnswered) {
                    btnStyle = 'bg-emerald-500/20 border-emerald-500/40 text-emerald-300 font-semibold';
                  }

                  const globalIdx = questions.findIndex((item) => item.id === q.id);

                  return (
                    <button
                      key={q.id}
                      onClick={() => setCurrentIndex(globalIdx)}
                      className={`h-9 rounded-xl font-mono text-xs flex items-center justify-center border transition-all ${btnStyle}`}
                    >
                      {globalIdx + 1}
                    </button>
                  );
                })}
              </div>
            </div>
          </div>

          {/* Legend */}
          <div className="pt-2 border-t border-white/[0.06] grid grid-cols-2 gap-2 text-[10px] text-slate-400">
            <div className="flex items-center gap-1.5">
              <span className="h-2.5 w-2.5 rounded-full bg-emerald-400" />
              <span>Answered</span>
            </div>
            <div className="flex items-center gap-1.5">
              <span className="h-2.5 w-2.5 rounded-full bg-amber-400" />
              <span>Marked</span>
            </div>
            <div className="flex items-center gap-1.5">
              <span className="h-2.5 w-2.5 rounded-full border border-cyan-400" />
              <span>Current</span>
            </div>
            <div className="flex items-center gap-1.5">
              <span className="h-2.5 w-2.5 rounded-full bg-slate-800" />
              <span>Unanswered</span>
            </div>
          </div>

          {/* Abandon Test */}
          <div className="pt-2">
            <button
              onClick={onCancel}
              className="w-full py-2 rounded-xl text-xs font-semibold text-slate-500 hover:text-rose-400 hover:bg-rose-500/10 transition-colors"
            >
              Exit / Abandon Test
            </button>
          </div>
        </div>
      </div>

      {/* Submit Confirmation Modal */}
      {showSubmitModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md">
          <div className="w-full max-w-md rounded-3xl border border-white/10 bg-[#0c1424] p-6 shadow-2xl space-y-5">
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 rounded-2xl bg-cyan-500/10 border border-cyan-500/30 flex items-center justify-center text-cyan-400">
                <Flag className="h-5 w-5" />
              </div>
              <div>
                <h3 className="text-base font-bold text-white">Confirm Official Submission</h3>
                <p className="text-xs text-slate-400">Review your attempt statistics before grading.</p>
              </div>
            </div>

            <div className="grid grid-cols-3 gap-2 p-3 rounded-2xl bg-slate-900 border border-white/5 text-center font-mono text-xs">
              <div>
                <span className="text-[10px] text-slate-500 block uppercase font-sans">Answered</span>
                <span className="text-base font-bold text-emerald-400">{answeredCount}</span>
              </div>
              <div>
                <span className="text-[10px] text-slate-500 block uppercase font-sans">Marked</span>
                <span className="text-base font-bold text-amber-400">{reviewCount}</span>
              </div>
              <div>
                <span className="text-[10px] text-slate-500 block uppercase font-sans">Skipped</span>
                <span className="text-base font-bold text-rose-400">{unansweredCount}</span>
              </div>
            </div>

            <p className="text-xs text-slate-400 leading-relaxed">
              Once submitted, your responses will be locked and graded server-side. Your authoritative marksheet, accuracy breakdown, and KaTeX solutions will be generated immediately.
            </p>

            <div className="flex items-center justify-end gap-2.5 pt-2">
              <button
                onClick={() => setShowSubmitModal(false)}
                className="px-4 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 text-xs font-semibold text-slate-300 border border-white/10 transition-colors"
              >
                Back to Test
              </button>
              <button
                onClick={handleConfirmSubmit}
                disabled={isSubmitting}
                className="flex items-center gap-1.5 px-5 py-2 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-400 hover:to-teal-500 text-slate-950 font-bold text-xs shadow-lg shadow-emerald-500/20 transition-all active:scale-95"
              >
                <CheckCircle2 className="h-4 w-4" />
                <span>{isSubmitting ? 'Grading...' : 'Yes, Submit Now'}</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
