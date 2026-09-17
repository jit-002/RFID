import React, { useState } from 'react';
import {
  X,
  Trophy,
  Award,
  CheckCircle2,
  XCircle,
  Clock,
  Calendar,
  AlertTriangle,
  User,
  GraduationCap,
  Sparkles,
  Search,
  Filter,
  Layers,
  ChevronRight,
  Printer
} from 'lucide-react';
import { QuizResult, QuizReviewItem, QuizSubject } from '../../types/quiz';

interface StudentMarksheetInspectorModalProps {
  result: QuizResult;
  onClose: () => void;
  onOpenStudySathi?: (prompt: string) => void;
}

export const StudentMarksheetInspectorModal: React.FC<StudentMarksheetInspectorModalProps> = ({
  result,
  onClose,
  onOpenStudySathi
}) => {
  const [filterType, setFilterType] = useState<'all' | 'wrong' | 'skipped' | 'correct'>('all');
  const [selectedSubject, setSelectedSubject] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState<string>('');

  const reviewQuestions = result.reviewQuestions || [];

  const filteredQuestions = reviewQuestions.filter((q) => {
    // Status filter
    if (filterType === 'wrong' && q.status !== 'INCORRECT') return false;
    if (filterType === 'skipped' && q.status !== 'SKIPPED') return false;
    if (filterType === 'correct' && q.status !== 'CORRECT') return false;

    // Subject filter
    if (selectedSubject !== 'all' && q.subject !== selectedSubject) return false;

    // Search query
    if (searchQuery.trim()) {
      const qText = (q.text || '').toLowerCase();
      const qTopic = (q.topic || '').toLowerCase();
      const qChapter = (q.chapter || '').toLowerCase();
      const s = searchQuery.toLowerCase();
      return qText.includes(s) || qTopic.includes(s) || qChapter.includes(s);
    }
    return true;
  });

  const wrongCount = reviewQuestions.filter((q) => q.status === 'INCORRECT').length;
  const skippedCount = reviewQuestions.filter((q) => q.status === 'SKIPPED').length;
  const correctCount = reviewQuestions.filter((q) => q.status === 'CORRECT').length;

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center p-3 sm:p-6 pt-4 sm:pt-6 bg-black/85 backdrop-blur-md overflow-y-auto">
      <div className="w-full max-w-5xl rounded-3xl border border-white/10 bg-[#0A0E17] p-5 md:p-7 shadow-2xl space-y-5 max-h-[94vh] flex flex-col relative">
        {/* Modal Header */}
        <div className="flex items-start justify-between pb-4 border-b border-white/[0.08] shrink-0">
          <div className="flex items-center gap-3.5">
            <div className="h-12 w-12 rounded-2xl bg-gradient-to-br from-cyan-500/20 to-blue-600/20 border border-cyan-500/30 flex items-center justify-center text-cyan-400 shadow-glow-cyan">
              <GraduationCap className="h-6 w-6" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-xl font-black text-white tracking-tight">
                  {result.studentName} — Official Marksheet
                </h2>
                <span className="px-2.5 py-0.5 rounded-full text-xs font-mono font-bold bg-cyan-500/15 text-cyan-300 border border-cyan-500/30">
                  Roll: {result.studentId}
                </span>
                <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                  Class {result.classGrade || '12'} {result.stream || 'Science'}
                </span>
              </div>
              <p className="text-xs text-slate-400 mt-1 flex items-center gap-3">
                <span className="flex items-center gap-1">
                  <Calendar className="h-3.5 w-3.5 text-slate-500" />
                  {result.dateDisplay}
                </span>
                <span>•</span>
                <span className="flex items-center gap-1">
                  <Clock className="h-3.5 w-3.5 text-slate-500" />
                  Duration: {result.timeTakenDisplay || (result.timeTakenMinutes + ' Minutes')}
                </span>
                <span>•</span>
                <span className="text-purple-300 font-mono font-bold">
                  {result.isClassStandingAvailable ? ('Rank #' + result.rank + ' of ' + result.totalStudents) : 'Class Standing: Pending Turnout'}
                </span>
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="rounded-xl p-2 text-slate-400 hover:bg-white/[0.06] hover:text-white transition-colors"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Scrollable Content */}
        <div className="flex-1 overflow-y-auto pr-1 space-y-6">
          {/* Key Scorecard Summary Grid */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3.5">
            <div className="rounded-2xl border border-cyan-500/20 bg-cyan-500/5 p-4">
              <span className="text-[11px] font-bold text-cyan-400 uppercase tracking-wider block">Total Marks</span>
              <div className="text-2xl font-black font-mono text-white mt-1">
                {result.score} <span className="text-xs font-normal text-slate-400">/ {result.maxScore}</span>
              </div>
              <span className="text-[11px] text-slate-400 font-mono mt-0.5 block">
                Score: {result.percentage}%
              </span>
            </div>

            <div className="rounded-2xl border border-emerald-500/20 bg-emerald-500/5 p-4">
              <span className="text-[11px] font-bold text-emerald-400 uppercase tracking-wider block">Accuracy</span>
              <div className="text-2xl font-black font-mono text-emerald-300 mt-1">
                {result.accuracy}%
              </div>
              <span className="text-[11px] text-slate-400 font-mono mt-0.5 block">
                Over {result.attempted} attempted
              </span>
            </div>

            <div className="rounded-2xl border border-rose-500/20 bg-rose-500/5 p-4">
              <span className="text-[11px] font-bold text-rose-400 uppercase tracking-wider block">Incorrect Penalty</span>
              <div className="text-2xl font-black font-mono text-rose-400 mt-1">
                {result.incorrectCount} <span className="text-xs font-normal text-slate-400">(-{result.negativeMarks || result.incorrectCount} pts)</span>
              </div>
              <span className="text-[11px] text-slate-400 font-mono mt-0.5 block">
                {result.correctCount} correct (+{result.positiveMarks || (result.correctCount * 4)} pts)
              </span>
            </div>

            <div className="rounded-2xl border border-amber-500/20 bg-amber-500/5 p-4">
              <span className="text-[11px] font-bold text-amber-400 uppercase tracking-wider block">Skipped Questions</span>
              <div className="text-2xl font-black font-mono text-amber-300 mt-1">
                {result.skippedCount}
              </div>
              <span className="text-[11px] text-slate-400 font-mono mt-0.5 block">
                0 negative marks
              </span>
            </div>
          </div>

          {/* Subject Performance Breakdown Table */}
          {result.subjectMetrics && Object.keys(result.subjectMetrics).length > 0 && (
            <div className="rounded-2xl border border-white/[0.08] bg-slate-900/40 p-4 space-y-3">
              <h3 className="text-xs font-bold text-white uppercase tracking-wider flex items-center gap-2">
                <Layers className="h-4 w-4 text-cyan-400" />
                <span>Subject Score & Accuracy Breakdown</span>
              </h3>
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-3">
                {Object.values(result.subjectMetrics).map((metric) => (
                  <div key={metric.subject} className="p-3 rounded-xl bg-slate-900 border border-white/5 space-y-1">
                    <p className="text-[11px] font-bold text-slate-200 truncate">{metric.subject}</p>
                    <p className="text-sm font-black font-mono text-cyan-400">
                      {metric.finalMarks}/{metric.totalPossibleMarks}
                    </p>
                    <div className="text-[10px] text-slate-400 font-mono space-y-0.5">
                      <div>Acc: <strong className="text-emerald-400">{metric.accuracy}%</strong></div>
                      <div>{metric.correct}C • {metric.incorrect}W • {metric.skipped}S</div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* QUESTION DIAGNOSTIC INSPECTOR */}
          <div className="space-y-4 pt-2">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 pb-3 border-b border-white/[0.06]">
              <div>
                <h3 className="text-sm font-bold text-white uppercase tracking-wider flex items-center gap-2">
                  <span>Student Answer & Error Diagnostic</span>
                  <span className="px-2 py-0.5 text-[10px] font-mono rounded bg-white/10 text-slate-300">
                    {filteredQuestions.length} Questions
                  </span>
                </h3>
                <p className="text-xs text-slate-400">
                  Inspect student choices, incorrect responses, skipped items, and pedagogical explanations.
                </p>
              </div>

              {/* Status Filter Tabs */}
              <div className="flex items-center gap-1.5 flex-wrap">
                <button
                  onClick={() => setFilterType('all')}
                  className={`px-3 py-1 rounded-xl text-xs font-semibold border transition-all ${
                    filterType === 'all'
                      ? 'bg-cyan-500 text-slate-950 border-cyan-400 font-bold shadow-sm'
                      : 'bg-slate-900 border-white/10 text-slate-400 hover:text-white'
                  }`}
                >
                  All (50)
                </button>
                <button
                  onClick={() => setFilterType('wrong')}
                  className={`px-3 py-1 rounded-xl text-xs font-semibold border transition-all flex items-center gap-1 ${
                    filterType === 'wrong'
                      ? 'bg-rose-500 text-white border-rose-400 font-bold shadow-sm shadow-rose-500/20'
                      : 'bg-slate-900 border-white/10 text-rose-400 hover:bg-rose-500/10'
                  }`}
                >
                  <XCircle className="h-3.5 w-3.5" />
                  <span>Attempted Wrong ({wrongCount})</span>
                </button>
                <button
                  onClick={() => setFilterType('skipped')}
                  className={`px-3 py-1 rounded-xl text-xs font-semibold border transition-all flex items-center gap-1 ${
                    filterType === 'skipped'
                      ? 'bg-amber-500 text-slate-950 border-amber-400 font-bold shadow-sm'
                      : 'bg-slate-900 border-white/10 text-amber-400 hover:bg-amber-500/10'
                  }`}
                >
                  <AlertTriangle className="h-3.5 w-3.5" />
                  <span>Skipped ({skippedCount})</span>
                </button>
                <button
                  onClick={() => setFilterType('correct')}
                  className={`px-3 py-1 rounded-xl text-xs font-semibold border transition-all flex items-center gap-1 ${
                    filterType === 'correct'
                      ? 'bg-emerald-500 text-slate-950 border-emerald-400 font-bold shadow-sm'
                      : 'bg-slate-900 border-white/10 text-emerald-400 hover:bg-emerald-500/10'
                  }`}
                >
                  <CheckCircle2 className="h-3.5 w-3.5" />
                  <span>Correct ({correctCount})</span>
                </button>
              </div>
            </div>

            {/* Questions List */}
            <div className="space-y-3.5">
              {filteredQuestions.length === 0 ? (
                <div className="py-12 text-center text-slate-500 bg-slate-900/30 rounded-2xl border border-white/5">
                  No questions match the selected filter criteria.
                </div>
              ) : (
                filteredQuestions.map((q, idx) => {
                  const isWrong = q.status === 'INCORRECT';
                  const isSkipped = q.status === 'SKIPPED';
                  const isCorrect = q.status === 'CORRECT';

                  const studentChosenOpt = q.options.find(
                    (o) => o.id === q.selectedOptionId || o.optionKey === q.selectedOptionKey
                  );
                  const correctOpt = q.options.find(
                    (o) => o.id === q.correctOptionId || o.optionKey === q.correctOptionKey
                  );

                  return (
                    <div
                      key={q.id}
                      className={`rounded-2xl border p-4 transition-all space-y-3 ${
                        isWrong
                          ? 'bg-rose-950/20 border-rose-500/30 hover:border-rose-500/50'
                          : isSkipped
                          ? 'bg-amber-950/20 border-amber-500/30 hover:border-amber-500/50'
                          : 'bg-slate-900/50 border-white/[0.06] hover:border-white/10'
                      }`}
                    >
                      {/* Item Header */}
                      <div className="flex items-center justify-between gap-2">
                        <div className="flex items-center gap-2">
                          <span className="font-mono text-xs font-bold text-slate-400">
                            Q{q.index || idx + 1}
                          </span>
                          <span className="px-2 py-0.5 rounded-md text-[10px] font-semibold bg-white/5 text-slate-300 border border-white/10">
                            {q.subject}
                          </span>
                          <span className="text-slate-600 text-xs">•</span>
                          <span className="text-[11px] text-slate-400">{q.chapter}</span>
                        </div>

                        {/* Status Badge */}
                        <div>
                          {isWrong ? (
                            <span className="px-2.5 py-0.5 rounded-full text-[10px] font-mono font-bold bg-rose-500/20 text-rose-300 border border-rose-500/40">
                              -1 Mark • Incorrect Attempt
                            </span>
                          ) : isSkipped ? (
                            <span className="px-2.5 py-0.5 rounded-full text-[10px] font-mono font-bold bg-amber-500/20 text-amber-300 border border-amber-500/40">
                              0 Marks • Skipped
                            </span>
                          ) : (
                            <span className="px-2.5 py-0.5 rounded-full text-[10px] font-mono font-bold bg-emerald-500/20 text-emerald-300 border border-emerald-500/40">
                              +4 Marks • Correct
                            </span>
                          )}
                        </div>
                      </div>

                      {/* Question Text */}
                      <div className="text-xs sm:text-sm text-slate-200 font-medium leading-relaxed">
                        {q.text}
                      </div>

                      {/* Options & Choices Comparison */}
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs pt-1 font-sans">
                        {/* Student Response */}
                        <div className={`p-2.5 rounded-xl border ${
                          isWrong
                            ? 'bg-rose-900/30 border-rose-500/40 text-rose-200'
                            : isSkipped
                            ? 'bg-slate-900/80 border-white/5 text-slate-400 italic'
                            : 'bg-emerald-950/40 border-emerald-500/40 text-emerald-200'
                        }`}>
                          <span className="text-[10px] uppercase tracking-wider font-bold block mb-1 opacity-70">
                            Student Choice:
                          </span>
                          {isSkipped ? (
                            <span>Question was not attempted (Skipped)</span>
                          ) : (
                            <div className="font-semibold flex items-center gap-1.5">
                              <span className="font-mono">Option {q.selectedOptionKey}:</span>
                              <span>{studentChosenOpt ? studentChosenOpt.text : 'Selected Option'}</span>
                            </div>
                          )}
                        </div>

                        {/* Correct Answer */}
                        <div className="p-2.5 rounded-xl border bg-emerald-950/20 border-emerald-500/30 text-emerald-200">
                          <span className="text-[10px] uppercase tracking-wider font-bold block mb-1 opacity-70">
                            Authoritative Correct Answer:
                          </span>
                          <div className="font-semibold flex items-center gap-1.5">
                            <span className="font-mono">Option {q.correctOptionKey}:</span>
                            <span>{correctOpt ? correctOpt.text : 'Correct Answer'}</span>
                          </div>
                        </div>
                      </div>

                      {/* Pedagogical Explanation */}
                      {(q.userExplanation || q.explanation) && (
                        <div className="p-3 rounded-xl bg-black/40 border border-white/5 text-xs text-slate-300 leading-relaxed font-mono">
                          <span className="text-cyan-400 font-bold block mb-0.5 text-[10px] uppercase">
                            Concept & Solution:
                          </span>
                          {q.userExplanation || q.explanation}
                        </div>
                      )}
                    </div>
                  );
                })
              )}
            </div>
          </div>
        </div>

        {/* Modal Footer Actions */}
        <div className="flex items-center justify-between pt-4 border-t border-white/[0.08] shrink-0">
          <button
            onClick={() => window.print()}
            className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 text-xs font-semibold text-slate-300 border border-white/10 transition-colors"
          >
            <Printer className="h-4 w-4" />
            <span>Print Marksheet</span>
          </button>

          <button
            onClick={onClose}
            className="px-6 py-2 rounded-xl bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-slate-950 font-bold text-xs tracking-wide shadow-md transition-all active:scale-95"
          >
            Close Marksheet
          </button>
        </div>
      </div>
    </div>
  );
};
