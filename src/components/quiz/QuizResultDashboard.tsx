import React, { useState } from 'react';
import { 
  Trophy, 
  Award, 
  CheckCircle2, 
  XCircle, 
  Clock, 
  Sparkles, 
  RotateCcw, 
  ArrowRight, 
  Share2, 
  ChevronDown, 
  ChevronUp, 
  BookOpen, 
  Target, 
  HelpCircle, 
  AlertCircle, 
  BarChart3, 
  Lightbulb, 
  MessageSquare,
  ShieldCheck
} from 'lucide-react';
import { QuizResult, QuizReviewItem, SubjectResultMetric } from '../../types/quiz';

interface QuizResultDashboardProps {
  result: QuizResult;
  onRetakePractice?: () => void;
  onBackToList?: () => void;
  onOpenStudySathi?: (prompt?: string, title?: string) => void;
}

const SUBJECT_THEMES: Record<string, { bar: string; text: string }> = {
  Physics: { bar: 'from-blue-500 to-cyan-400', text: 'text-cyan-400' },
  Chemistry: { bar: 'from-emerald-500 to-teal-400', text: 'text-emerald-400' },
  Mathematics: { bar: 'from-amber-500 to-orange-400', text: 'text-amber-400' },
  'AI / Computer': { bar: 'from-purple-500 to-pink-400', text: 'text-purple-400' },
  English: { bar: 'from-rose-500 to-red-400', text: 'text-rose-400' },
  'Physical Education': { bar: 'from-lime-500 to-green-400', text: 'text-lime-400' }
};

export const QuizResultDashboard: React.FC<QuizResultDashboardProps> = ({

  result,
  onRetakePractice,
  onBackToList,
  onOpenStudySathi
}) => {
  const [showQuestions, setShowQuestions] = useState(false);
  const [questionFilter, setQuestionFilter] = useState<'all' | 'correct' | 'incorrect' | 'skipped'>('all');
  const [copiedLink, setCopiedLink] = useState(false);

  // Circular score calculation
  const radius = 78;
  const circumference = 2 * Math.PI * radius;
  // Score percentage determines the circle fill
  const scorePercentClamped = Math.max(0, Math.min(100, result.percentage));
  const strokeDashoffset = circumference - (scorePercentClamped / 100) * circumference;

  // Filtered review questions
  const reviewQuestions = result.reviewQuestions || [];
  
  const handleClearDoubtsClick = () => {
    if (!onOpenStudySathi) return;

    const wrongQuestions = (result.reviewQuestions || []).filter(q => !q.isCorrect && (q.selectedOptionId && q.selectedOptionId !== 'SKIPPED'));

    if (wrongQuestions.length === 0) {
      const topicStr = (result.topicsToImprove && result.topicsToImprove.length > 0)
        ? result.topicsToImprove.join(', ')
        : ((result as any).subject || 'curriculum concepts');
      const prompt = `I scored 100% on this assessment or skipped questions, but I want to deepen my conceptual mastery in ${topicStr}.\n\nPlease:\n1. Review the foundational concepts at my Class 12 CBSE level.\n2. Provide 3 challenging practice questions with step-by-step solutions.\n3. Give me a concise memory trick for exams.`;
      onOpenStudySathi(prompt, `${(result as any).subject || 'Academic'} — Review`);
      return;
    }

    // Group wrong questions by topic
    const topicGroups: Record<string, typeof wrongQuestions> = {};
    wrongQuestions.forEach(q => {
      const topicKey = q.topic || q.chapter || q.subject || 'General Concepts';
      if (!topicGroups[topicKey]) topicGroups[topicKey] = [];
      topicGroups[topicKey].push(q);
    });

    const sortedTopics = Object.keys(topicGroups).sort((a, b) => topicGroups[b].length - topicGroups[a].length);
    const primaryTopic = sortedTopics[0] || 'Target Weak Areas';
    const chosenQuestions = topicGroups[primaryTopic].slice(0, 4);

    const subjectName = chosenQuestions[0]?.subject || (result as any).subject || 'Subject';
    const gradeLevel = (result as any).classGrade === '10' ? 'Class 10' : 'Class 12';

    let questionsBlock = '';
    chosenQuestions.forEach((q, idx) => {
      const qNum = (result.reviewQuestions?.indexOf(q) ?? -1) !== -1 ? result.reviewQuestions!.indexOf(q) + 1 : idx + 1;
      const chosenOpt = q.options?.find(o => o.id === q.selectedOptionId);
      const correctOpt = q.options?.find(o => o.id === q.correctOptionId);
      const myAns = chosenOpt ? `${chosenOpt.optionKey ? chosenOpt.optionKey + ': ' : ''}${chosenOpt.text}` : 'Not answered';
      const correctAns = correctOpt ? `${correctOpt.optionKey ? correctOpt.optionKey + ': ' : ''}${correctOpt.text}` : 'Not specified';

      questionsBlock += `\nQ${qNum}:\n${q.text}\nMy answer:\n${myAns}\nCorrect answer:\n${correctAns}\n`;
    });

    const structuredPrompt = `I need help understanding my mistakes in ${primaryTopic}.

Here are the questions I got wrong:
${questionsBlock}
Please:
1. Identify the common concept I misunderstood.
2. Explain the concept at my ${gradeLevel} level.
3. Explain each mistake.
4. Show the correct reasoning.
5. Give me a short memory trick.
6. Give me 3 similar practice questions.
7. Ask me one quick check question.`;

    const chatTitle = `${subjectName} — ${primaryTopic} Doubts`;
    onOpenStudySathi(structuredPrompt, chatTitle);
  };

  const filteredQuestions = reviewQuestions.filter((ans: QuizReviewItem) => {
    if (questionFilter === 'correct') return ans.status === 'CORRECT';
    if (questionFilter === 'incorrect') return ans.status === 'INCORRECT';
    if (questionFilter === 'skipped') return ans.status === 'SKIPPED';
    return true;
  });

  const handleShare = () => {
    if (navigator.clipboard) {
      navigator.clipboard.writeText(
        `I scored ${result.score}/${result.maxScore} marks (${result.percentage}%) with ${result.accuracy}% accuracy on ${result.quizTitle}!`
      );
      setCopiedLink(true);
      setTimeout(() => setCopiedLink(false), 2500);
    }
  };

  // Safe fallback for subject metrics
  const subjectMetricsList: SubjectResultMetric[] = result.subjectMetrics
    ? Object.values(result.subjectMetrics)
    : Object.entries(result.subjectPerformance || {}).map(([subj, d]) => ({
        subject: subj as any,
        totalQuestions: d.total,
        attempted: Math.max(0, Math.round(d.score / 4)),
        correct: Math.max(0, Math.round(d.score / 4)),
        incorrect: 0,
        skipped: d.total - Math.max(0, Math.round(d.score / 4)),
        positiveMarks: d.score,
        negativeMarks: 0,
        finalMarks: d.score,
        totalPossibleMarks: d.total * 4,
        accuracy: 100,
        scorePercentage: d.percentage
      }));

  return (
    <div className="min-h-screen bg-[#050811] text-slate-100 py-6 px-4 md:px-8 max-w-6xl mx-auto space-y-6">
      {/* Toast alert when copied */}
      {copiedLink && (
        <div className="fixed top-6 right-6 z-50 flex items-center gap-2 bg-emerald-500 text-slate-950 px-4 py-2 rounded-xl text-xs font-bold shadow-2xl animate-in fade-in">
          <CheckCircle2 className="h-4 w-4" />
          <span>Result summary copied to clipboard!</span>
        </div>
      )}

      {/* Header Bar */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-4 border-b border-white/[0.08]">
        <div>
          <div className="flex items-center gap-2.5">
            <span className="px-2.5 py-0.5 text-xs font-bold rounded-full bg-cyan-500/15 border border-cyan-500/30 text-cyan-300">
              {result.isPractice ? 'Practice Mock Result' : result.quizTitle}
            </span>
            <span className="text-xs text-slate-400">
              Submitted: {result.dateDisplay}
            </span>
          </div>
          <h1 className="text-2xl font-black text-white tracking-tight mt-1">
            Performance Diagnostic & Scorecard
          </h1>
          <p className="text-xs text-slate-400">
            Student: <span className="text-slate-200 font-semibold">{result.studentName}</span> (ID: {result.studentId}) � Class {result.classGrade} {result.stream}
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          {onBackToList && (
            <button
              onClick={onBackToList}
              className="px-3.5 py-2 rounded-xl bg-slate-900 border border-white/10 hover:bg-slate-800 text-xs font-semibold text-slate-300 transition-colors"
            >
              Quiz Hub
            </button>
          )}

          {onRetakePractice && (
            <button
              onClick={onRetakePractice}
              className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-cyan-500/10 border border-cyan-500/30 hover:bg-cyan-500/20 text-xs font-semibold text-cyan-300 transition-colors"
            >
              <RotateCcw className="h-3.5 w-3.5" />
              <span>Practice Mock</span>
            </button>
          )}

          <button
            onClick={handleShare}
            className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-xs font-semibold text-slate-200 border border-white/10 transition-colors"
          >
            <Share2 className="h-3.5 w-3.5" />
            <span>Share</span>
          </button>
        </div>
      </div>

      {/* HERO SECTION: Score Gauge & 4 Core Metric Cards */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
        {/* Circular Score Ring Card (4 Columns) */}
        <div className="lg:col-span-4 rounded-3xl border border-white/[0.08] bg-gradient-to-b from-[#0e1626] to-[#0A0E17] p-6 flex flex-col items-center justify-center text-center shadow-2xl relative overflow-hidden">
          <div className="absolute inset-0 bg-cyan-500/5 blur-3xl pointer-events-none" />

          {/* SVG Score Circle */}
          <div className="relative w-48 h-48 flex items-center justify-center mb-3">
            <svg className="w-full h-full transform -rotate-90" viewBox="0 0 180 180">
              <circle
                cx="90"
                cy="90"
                r={radius}
                className="text-slate-800/80 stroke-current"
                strokeWidth="12"
                fill="transparent"
              />
              <circle
                cx="90"
                cy="90"
                r={radius}
                className="text-cyan-400 stroke-current transition-all duration-1000 ease-out"
                strokeWidth="12"
                strokeDasharray={circumference}
                strokeDashoffset={strokeDashoffset}
                strokeLinecap="round"
                fill="transparent"
              />
            </svg>

            {(() => {
              const solvePercent = result.totalQuestions > 0 ? Math.round((result.correctCount / result.totalQuestions) * 100) : 0;
              const displayPct = (result.percentage === 0 && result.correctCount > 0) ? solvePercent : result.percentage;
              const label = (result.percentage === 0 && result.correctCount > 0) ? 'Questions Solved' : 'Marks Percentage';

              return (
                <div className="absolute inset-0 flex flex-col items-center justify-center text-center">
                  <span className="text-4xl font-black font-mono tracking-tight text-white">
                    {displayPct}%
                  </span>
                  <span className="text-[11px] font-semibold text-cyan-300 uppercase tracking-wider mt-0.5">
                    {label}
                  </span>
                  <span className="text-[11px] text-slate-400 font-mono mt-0.5">
                    {result.score} / {result.maxScore} Marks
                    {result.percentage === 0 && result.correctCount > 0 && (
                      <span className="block text-[10px] text-amber-400 font-sans mt-0.5">
                        {result.correctCount}/{result.totalQuestions} Correct (-{result.negativeMarks} penalty)
                      </span>
                    )}
                  </span>
                </div>
              );
            })()}
          </div>

          {/* Performance Label Badge */}
          <div className={`px-3 py-1 rounded-full text-xs font-bold border ${
            result.percentage >= 80 
              ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-300'
              : result.percentage >= 60
              ? 'bg-cyan-500/10 border-cyan-500/30 text-cyan-300'
              : result.percentage >= 40
              ? 'bg-amber-500/10 border-amber-500/30 text-amber-300'
              : 'bg-rose-500/10 border-rose-500/30 text-rose-300'
          }`}>
            {result.performanceLabel || (result.percentage >= 60 ? 'Proficient' : 'Needs Targeted Practice')}
          </div>

          <p className="text-[11px] text-slate-400 mt-3 max-w-xs text-center">
            {result.correctCount} correct, {result.incorrectCount} incorrect, {result.skippedCount} skipped ({result.attempted} of {result.totalQuestions} attempted).
          </p>
        </div>

        {/* 4 Summary Stat Cards (8 Columns) */}
        <div className="lg:col-span-8 grid grid-cols-2 md:grid-cols-2 gap-4">
          {/* Card 1: Final Marks */}
          <div className="rounded-2xl border border-white/[0.08] bg-[#0A0E17]/80 p-5 backdrop-blur-sm flex flex-col justify-between hover:border-cyan-500/30 transition-all">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">Overall Marks</span>
              <div className="h-8 w-8 rounded-xl bg-cyan-500/10 border border-cyan-500/20 flex items-center justify-center text-cyan-400">
                <Trophy className="h-4 w-4" />
              </div>
            </div>
            <div className="mt-3">
              <div className="text-2xl font-black font-mono text-white">
                {result.score} <span className="text-xs font-normal text-slate-400">/ {result.maxScore}</span>
              </div>
              <p className="text-[11px] text-slate-400 mt-1 font-mono">
                +{result.positiveMarks} positive, -{result.negativeMarks} negative marks
              </p>
            </div>
          </div>

          {/* Card 2: Accuracy Rate */}
          <div className="rounded-2xl border border-white/[0.08] bg-[#0A0E17]/80 p-5 backdrop-blur-sm flex flex-col justify-between hover:border-emerald-500/30 transition-all">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">Accuracy Rate</span>
              <div className="h-8 w-8 rounded-xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-400">
                <Target className="h-4 w-4" />
              </div>
            </div>
            <div className="mt-3">
              <div className="text-2xl font-black font-mono text-emerald-400">
                {result.accuracy}%
              </div>
              <p className="text-[11px] text-slate-400 mt-1">
                {result.correctCount} correct of {result.attempted} attempted
              </p>
            </div>
          </div>

          {/* Card 3: Duration */}
          <div className="rounded-2xl border border-white/[0.08] bg-[#0A0E17]/80 p-5 backdrop-blur-sm flex flex-col justify-between hover:border-amber-500/30 transition-all">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">Time Taken</span>
              <div className="h-8 w-8 rounded-xl bg-amber-500/10 border border-amber-500/20 flex items-center justify-center text-amber-400">
                <Clock className="h-4 w-4" />
              </div>
            </div>
            <div className="mt-3">
              <div className="text-2xl font-black font-mono text-white">
                {result.timeTakenDisplay || `${result.timeTakenMinutes} mins`}
              </div>
              <p className="text-[11px] text-slate-400 mt-1">
                Pace: ~{Math.round(result.timeTakenSeconds / Math.max(1, result.attempted))}s per attempted question
              </p>
            </div>
          </div>

          {/* Card 4: Class Standing */}
          <div className="rounded-2xl border border-white/[0.08] bg-[#0A0E17]/80 p-5 backdrop-blur-sm flex flex-col justify-between hover:border-purple-500/30 transition-all">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">Class Standing</span>
              <div className="h-8 w-8 rounded-xl bg-purple-500/10 border border-purple-500/20 flex items-center justify-center text-purple-400">
                <Award className="h-4 w-4" />
              </div>
            </div>
            <div className="mt-3">
              {result.isClassStandingAvailable ? (
                <>
                  <div className="text-2xl font-black font-mono text-purple-300">
                    #{result.rank} <span className="text-xs font-normal text-slate-400">of {result.totalStudents}</span>
                  </div>
                  <p className="text-[11px] text-slate-400 mt-1">
                    Class 12 Science stream rank
                  </p>
                </>
              ) : (
                <>
                  <div className="text-sm font-bold font-mono text-slate-300 mt-1">
                    Class standing unavailable
                  </div>
                  <p className="text-[11px] text-slate-400 mt-1">
                    Requires 2+ submissions for comparison
                  </p>
                </>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* SUBJECT-WISE PERFORMANCE BREAKDOWN */}
      <div className="rounded-3xl border border-white/[0.08] bg-[#0A0E17]/80 p-6 shadow-xl backdrop-blur-sm space-y-4">
        <div className="flex items-center justify-between pb-3 border-b border-white/[0.06]">
          <div className="flex items-center gap-2.5">
            <BarChart3 className="h-4 w-4 text-cyan-400" />
            <h2 className="text-sm font-bold text-white uppercase tracking-wider">Subject-Wise Performance</h2>
          </div>
          <span className="text-xs text-slate-400 font-mono">6 NCERT Subjects</span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {subjectMetricsList.map((metric) => {
            const theme = SUBJECT_THEMES[metric.subject] || {
              bar: 'from-cyan-500 to-blue-400',
              text: 'text-cyan-400'
            };
            const pct = Math.max(0, Math.min(100, metric.scorePercentage));

            return (
              <div 
                key={metric.subject}
                className="rounded-2xl border border-white/[0.06] bg-slate-900/40 p-4 space-y-3 hover:border-white/10 transition-all"
              >
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-slate-200">{metric.subject}</span>
                  <div className="text-right">
                    <span className={`text-xs font-mono font-bold ${theme.text}`}>
                      {metric.finalMarks} / {metric.totalPossibleMarks} Marks
                    </span>
                    <span className="text-[10px] text-slate-400 block font-mono">
                      ({metric.scorePercentage}%)
                    </span>
                  </div>
                </div>

                {/* Progress Bar based on Score Percentage */}
                <div className="h-2 w-full bg-slate-800 rounded-full overflow-hidden">
                  <div 
                    className={`h-full bg-gradient-to-r ${theme.bar} rounded-full transition-all duration-500`}
                    style={{ width: `${pct}%` }}
                  />
                </div>

                <div className="flex items-center justify-between text-[11px] text-slate-400 font-mono">
                  <span>
                    {metric.correct}/{metric.totalQuestions} Correct � {metric.incorrect} Wrong
                  </span>
                  <span className="text-emerald-400 font-semibold">
                    {metric.accuracy}% Acc
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* SATHI AI ACADEMIC INSIGHTS & DIAGNOSTICS */}
      <div className="rounded-3xl border border-cyan-500/20 bg-gradient-to-br from-[#0c1a2e] to-[#0A0E17] p-6 shadow-2xl space-y-4">
        <div className="flex items-center gap-3">
          <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-cyan-500/10 border border-cyan-500/30 text-cyan-400">
            <Sparkles className="h-4 w-4" />
          </div>
          <div>
            <h2 className="text-sm font-bold text-white tracking-wide">Sathi AI Pedagogical Diagnostic</h2>
            <p className="text-xs text-slate-400">Personalized analytical review based on Class 12 CBSE curriculum.</p>
          </div>
        </div>

        <div className="space-y-2 bg-slate-900/50 p-4 rounded-xl border border-white/5">
          {(result.aiInsights || []).map((insight: string, idx: number) => (
            <p key={idx} className="text-xs md:text-sm text-slate-300 leading-relaxed">
              � {insight}
            </p>
          ))}
        </div>

        {/* WEAK TOPICS / RECOMMENDATIONS */}
        {result.topicsToImprove && result.topicsToImprove.length > 0 && (
          <div className="space-y-2.5 pt-2">
            <div className="flex items-center gap-2">
              <Lightbulb className="h-3.5 w-3.5 text-amber-400" />
              <span className="text-xs font-bold text-slate-300 uppercase tracking-wider">Identified Focus Areas:</span>
            </div>

            <div className="flex flex-wrap gap-2">
              {result.topicsToImprove.map((topic: string, i: number) => (
                <span 
                  key={i}
                  className="px-3 py-1 rounded-lg text-xs font-medium bg-amber-500/10 border border-amber-500/20 text-amber-300 flex items-center gap-1.5"
                >
                  <AlertCircle className="h-3 w-3" />
                  <span>{topic}</span>
                </span>
              ))}
            </div>

            {onOpenStudySathi && (
              <div className="pt-2">
                <button
                  onClick={handleClearDoubtsClick}
                  className="flex items-center gap-2 px-4 py-2 rounded-xl bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-bold text-xs transition-colors shadow-lg shadow-cyan-500/10"
                >
                  <MessageSquare className="h-3.5 w-3.5" />
                  <span>Clear Doubts on These Topics with Sathi AI</span>
                </button>
              </div>
            )}
          </div>
        )}
      </div>

      {/* DETAILED QUESTION REVIEW ACCORDION */}
      {reviewQuestions.length > 0 && (
        <div className="rounded-3xl border border-white/[0.08] bg-[#0A0E17]/80 p-6 shadow-xl backdrop-blur-sm space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-white/[0.06]">
            <div className="flex items-center gap-2.5">
              <BookOpen className="h-4 w-4 text-cyan-400" />
              <h2 className="text-sm font-bold text-white uppercase tracking-wider">
                Comprehensive 50 Question OMR Breakdown
              </h2>
            </div>

            <button
              onClick={() => setShowQuestions(!showQuestions)}
              className="flex items-center gap-1.5 px-4 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-xs font-semibold text-slate-200 border border-white/10 transition-colors self-start sm:self-auto"
            >
              <span>{showQuestions ? 'Hide All Explanations' : 'Review Questions & Explanations'}</span>
              {showQuestions ? <ChevronUp className="h-3.5 w-3.5" /> : <ChevronDown className="h-3.5 w-3.5" />}
            </button>
          </div>

          {showQuestions && (
            <div className="space-y-4 animate-in fade-in duration-300">
              <div className="flex gap-2 pb-2 overflow-x-auto">
                {[
                  { id: 'all', label: `All (${result.totalQuestions})` },
                  { id: 'correct', label: `Correct (${result.correctCount})` },
                  { id: 'incorrect', label: `Incorrect (${result.incorrectCount})` },
                  { id: 'skipped', label: `Skipped (${result.skippedCount})` }
                ].map((f) => (
                  <button
                    key={f.id}
                    onClick={() => setQuestionFilter(f.id as any)}
                    className={`px-3 py-1 rounded-lg text-xs font-medium transition-colors ${
                      questionFilter === f.id
                        ? 'bg-cyan-500 text-slate-950 font-bold'
                        : 'bg-slate-800/60 text-slate-400 hover:text-slate-200'
                    }`}
                  >
                    {f.label}
                  </button>
                ))}
              </div>

              <div className="space-y-3">
                {filteredQuestions.map((ans: QuizReviewItem, idx: number) => {
                  const isCorrect = ans.status === 'CORRECT';
                  const isSkipped = ans.status === 'SKIPPED';

                  return (
                    <div
                      key={ans.id}
                      className={`rounded-2xl border p-4 transition-all ${
                        isCorrect 
                          ? 'border-emerald-500/20 bg-emerald-950/10'
                          : isSkipped
                          ? 'border-slate-800 bg-slate-900/30'
                          : 'border-rose-500/20 bg-rose-950/10'
                      }`}
                    >
                      <div className="flex items-center justify-between mb-2">
                        <div className="flex items-center gap-2">
                          <span className="text-xs font-mono font-bold text-slate-400">
                            Q{idx + 1}
                          </span>
                          <span className="px-2 py-0.5 text-[10px] font-medium rounded-md bg-slate-800 text-slate-300">
                            {ans.subject}
                          </span>
                          {ans.chapter && (
                            <span className="text-[11px] text-slate-500">
                              � {ans.chapter}
                            </span>
                          )}
                        </div>

                        <div className="flex items-center gap-1.5 text-xs font-semibold">
                          {isCorrect ? (
                            <span className="text-emerald-400 flex items-center gap-1">
                              <CheckCircle2 className="h-3.5 w-3.5" /> Correct (+{result.marksPerCorrect})
                            </span>
                          ) : isSkipped ? (
                            <span className="text-slate-400 flex items-center gap-1">
                              <HelpCircle className="h-3.5 w-3.5" /> Skipped (0)
                            </span>
                          ) : (
                            <span className="text-rose-400 flex items-center gap-1">
                              <XCircle className="h-3.5 w-3.5" /> Incorrect (-{result.negativeMarksPerWrong})
                            </span>
                          )}
                        </div>
                      </div>

                      <p className="text-xs md:text-sm text-slate-200 font-medium whitespace-pre-line mb-3">
                        {ans.text}
                      </p>

                      <div className="space-y-1.5 mb-3">
                        {ans.options.map((opt) => {
                          const isChosen = opt.id === ans.selectedOptionId;
                          const isTheCorrectOne = opt.id === ans.correctOptionId;

                          let optStyle = 'bg-slate-900/50 border-white/5 text-slate-400';
                          if (isTheCorrectOne) {
                            optStyle = 'bg-emerald-500/15 border-emerald-500/40 text-emerald-200 font-semibold';
                          } else if (isChosen && !isTheCorrectOne) {
                            optStyle = 'bg-rose-500/15 border-rose-500/40 text-rose-200 line-through';
                          }

                          return (
                            <div
                              key={opt.id}
                              className={`p-2.5 rounded-xl border text-xs flex items-center justify-between ${optStyle}`}
                            >
                              <span><strong className="font-mono mr-2">{opt.optionKey}.</strong>{opt.text}</span>
                              {isTheCorrectOne && (
                                <span className="text-[10px] font-bold text-emerald-400 uppercase tracking-wider">
                                  Correct Answer
                                </span>
                              )}
                              {isChosen && !isTheCorrectOne && (
                                <span className="text-[10px] font-bold text-rose-400 uppercase tracking-wider">
                                  Your Selection
                                </span>
                              )}
                            </div>
                          );
                        })}
                      </div>

                      {ans.explanation && (
                        <div className="p-3 rounded-xl bg-slate-900/60 border border-white/5 text-xs space-y-1">
                          <span className="font-bold text-cyan-300 text-[11px] uppercase tracking-wider flex items-center gap-1">
                            <Lightbulb className="h-3 w-3" /> Pedagogical Explanation:
                          </span>
                          <p className="text-slate-300 leading-relaxed">
                            {ans.explanation}
                          </p>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};
