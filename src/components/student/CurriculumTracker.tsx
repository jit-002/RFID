import React, { useState } from 'react';
import { 
  BookOpen, 
  Sparkles, 
  Trophy, 
  CheckCircle2, 
  ExternalLink, 
  Layers, 
  Cpu, 
  ChevronRight,
  GraduationCap
} from 'lucide-react';
import { sathiQuizService } from '../../services/quizService';
import { QuizSyllabusItem } from '../../types/quiz';

interface CurriculumTrackerProps {
  onOpenAI: (query?: string) => void;
  onNavigateQuiz: () => void;
  studentGrade?: string;
}

export const CurriculumTracker: React.FC<CurriculumTrackerProps> = ({
  onOpenAI,
  onNavigateQuiz,
  studentGrade = '12'
}) => {
  const [activeSubject, setActiveSubject] = useState<string>('all');
  const isClass10 = studentGrade === '10';
  const syllabusItems: QuizSyllabusItem[] = sathiQuizService.getSyllabusProgress(studentGrade);

  const filteredItems = activeSubject === 'all'
    ? syllabusItems
    : syllabusItems.filter((it) => it.subject === activeSubject);

  return (
    <div className="space-y-6 animate-in fade-in duration-200">
      {/* Top Banner Card */}
      <div className="rounded-3xl border border-white/[0.08] bg-[#0A0E17]/80 p-6 md:p-8 shadow-2xl backdrop-blur-sm space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-white/[0.06]">
          <div>
            <div className="flex items-center gap-2 mb-1.5">
              <span className="px-2.5 py-0.5 text-xs font-bold font-mono rounded-md bg-purple-500/15 border border-purple-500/30 text-purple-300">
                {isClass10 ? 'CBSE CLASS 10' : 'CBSE AI CODE 843'}
              </span>
              <span className="px-2.5 py-0.5 text-[11px] font-semibold rounded-full bg-cyan-500/10 text-cyan-300 border border-cyan-500/20">
                {isClass10 ? 'Class 10 General' : 'Class 12 Science Stream'}
              </span>
            </div>
            <h2 className="text-xl md:text-2xl font-black text-white tracking-tight">
              {isClass10 ? 'Class 10 Curriculum & Blueprint Tracker' : 'Class 12 Curriculum & Blueprint Tracker'}
            </h2>
            <p className="text-xs md:text-sm text-slate-400 mt-1 max-w-2xl">
              Track chapter completion rates, review NCERT topics for board exams, and test your readiness with the official weekly 50-MCQ challenge.
            </p>
          </div>

          <button
            onClick={onNavigateQuiz}
            className="flex items-center gap-2 px-5 py-3 rounded-2xl bg-gradient-to-r from-amber-500 to-orange-600 hover:from-amber-400 hover:to-orange-500 text-slate-950 font-bold text-xs shadow-lg shadow-amber-500/20 transition-all active:scale-95 whitespace-nowrap self-start sm:self-auto"
          >
            <Trophy className="h-4 w-4" />
            <span>Launch Sathi Quiz (50 MCQs)</span>
          </button>
        </div>

        {/* CBSE Skill Subject 843 Highlights Banner */}
        <div className="rounded-2xl border border-purple-500/20 bg-gradient-to-r from-purple-950/20 to-slate-900/40 p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-xl bg-purple-500/15 border border-purple-500/30 flex items-center justify-center text-purple-400 shrink-0">
              <Cpu className="h-5 w-5" />
            </div>
            <div>
              <h3 className="text-xs font-bold text-white uppercase tracking-wider">
                Artificial Intelligence (Subject Code 843)
              </h3>
              <p className="text-[11px] text-slate-400 mt-0.5">
                Capstone Project, Convolutional Neural Networks (CNN), Natural Language Processing (NLP) & AI Ethics.
              </p>
            </div>
          </div>

          <button
            onClick={() => onOpenAI('Give me a quick overview of CBSE Class 12 AI Code 843 curriculum and key exam topics.')}
            className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-purple-500/20 hover:bg-purple-500/30 text-purple-300 text-xs font-semibold border border-purple-500/30 transition-colors whitespace-nowrap self-start sm:self-auto"
          >
            <Sparkles className="h-3.5 w-3.5" />
            <span>Ask AI Curriculum Doubts</span>
          </button>
        </div>
      </div>

      {/* Subject Filter Tabs */}
      <div className="flex gap-2 overflow-x-auto pb-1">
        {[
          { id: 'all', label: 'All Subjects' },
          { id: 'Physics', label: 'Physics' },
          { id: 'Chemistry', label: 'Chemistry' },
          { id: 'Mathematics', label: 'Mathematics' },
          { id: 'AI / Computer', label: 'AI Code 843' },
          { id: 'English', label: 'English' },
          { id: 'Physical Education', label: 'Physical Ed.' }
        ].map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveSubject(tab.id)}
            className={`px-3.5 py-2 rounded-xl text-xs font-semibold whitespace-nowrap transition-colors ${
              activeSubject === tab.id
                ? 'bg-cyan-500 text-slate-950 font-bold shadow-md shadow-cyan-500/10'
                : 'bg-slate-900/60 text-slate-400 hover:text-slate-200 border border-white/5'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Syllabus Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {filteredItems.map((item) => (
          <div
            key={item.id}
            className="rounded-2xl border border-white/[0.08] bg-[#0A0E17]/80 p-5 space-y-4 hover:border-cyan-500/30 transition-all shadow-xl"
          >
            <div className="flex items-start justify-between gap-3">
              <div>
                <div className="flex items-center gap-2 mb-1">
                  <span className="px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider rounded-md bg-cyan-500/10 text-cyan-300 border border-cyan-500/20">
                    {item.subject}
                  </span>
                  <span className="text-[11px] text-slate-500">
                    NCERT Unit
                  </span>
                </div>
                <h4 className="text-sm font-bold text-white">{item.chapter}</h4>
                <p className="text-xs text-slate-400 mt-1">{item.topic}</p>
              </div>

              <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold whitespace-nowrap ${
                item.status === 'COMPLETED'
                  ? 'bg-emerald-500/10 text-emerald-300 border border-emerald-500/20'
                  : item.status === 'IN_PROGRESS'
                  ? 'bg-cyan-500/10 text-cyan-300 border border-cyan-500/20'
                  : 'bg-slate-800 text-slate-400 border border-white/5'
              }`}>
                {item.progressPercent}% {item.status === 'COMPLETED' ? 'Done' : item.status === 'IN_PROGRESS' ? 'Active' : 'Upcoming'}
              </span>
            </div>

            {/* Progress Bar */}
            <div className="space-y-1 pt-2 border-t border-white/[0.06]">
              <div className="h-1.5 w-full bg-slate-800 rounded-full overflow-hidden">
                <div
                  className={`h-full rounded-full transition-all duration-500 ${
                    item.status === 'COMPLETED'
                      ? 'bg-gradient-to-r from-emerald-500 to-teal-400'
                      : 'bg-gradient-to-r from-cyan-500 to-blue-400'
                  }`}
                  style={{ width: `${item.progressPercent}%` }}
                />
              </div>
            </div>

            {/* Actions */}
            <div className="flex items-center justify-between pt-2">
              <button
                onClick={() => onOpenAI(`Explain key formulas, derivations, and board questions for ${item.subject} - chapter "${item.chapter}": ${item.topic}.`)}
                className="flex items-center gap-1 text-[11px] text-cyan-400 hover:text-cyan-300 font-semibold"
              >
                <Sparkles className="h-3 w-3" />
                <span>Explain Topic with Sathi AI</span>
              </button>

              <button
                onClick={onNavigateQuiz}
                className="flex items-center gap-1 text-[11px] text-amber-400 hover:text-amber-300 font-semibold"
              >
                <span>Practice MCQs</span>
                <ChevronRight className="h-3 w-3" />
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
