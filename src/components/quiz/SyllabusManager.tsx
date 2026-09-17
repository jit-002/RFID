import React, { useState, useEffect, useMemo } from 'react';
import { 
  BookOpen, 
  CheckCircle2, 
  Clock, 
  Plus, 
  Trash2, 
  Save, 
  AlertCircle,
  BarChart2,
  Layers,
  Search,
  Sparkles,
  TrendingUp,
  Award,
  Filter,
  Check
} from 'lucide-react';
import { QuizSyllabusItem, QuizSubject } from '../../types/quiz';
import { sathiQuizService } from '../../services/quizService';
import { useApp } from '../../context/AppContext';

interface SyllabusManagerProps {
  isTeacher?: boolean;
  studentGrade?: string;
}

export const SyllabusManager: React.FC<SyllabusManagerProps> = ({ isTeacher = false, studentGrade }) => {
  const { currentStudent } = useApp();
  const initialGrade = studentGrade || ((currentStudent?.classGrade === '10' || currentStudent?.id === 'SA001') ? '10' : '12');
  const [selectedClassGrade, setSelectedClassGrade] = useState<string>(initialGrade);

  useEffect(() => {
    if (studentGrade) {
      setSelectedClassGrade(studentGrade);
    }
  }, [studentGrade]);
  const [items, setItems] = useState<QuizSyllabusItem[]>([]);
  const [selectedSubject, setSelectedSubject] = useState<string>('all');
  const [selectedStatus, setSelectedStatus] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [isSaving, setIsSaving] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);
  const [showAddModal, setShowAddModal] = useState(false);

  // New item form state
  const [newSubject, setNewSubject] = useState<QuizSubject>('Physics');
  const [newChapter, setNewChapter] = useState('');
  const [newTopic, setNewTopic] = useState('');

  useEffect(() => {
    const list = sathiQuizService.getSyllabusProgress(selectedClassGrade);
    setItems(list);
  }, [selectedClassGrade]);

  // Update item progress
  const handleUpdateProgress = (id: string, progress: number) => {
    const clamped = Math.max(0, Math.min(100, progress));
    const status: 'NOT_STARTED' | 'IN_PROGRESS' | 'COMPLETED' = 
      clamped === 100 ? 'COMPLETED' : clamped > 0 ? 'IN_PROGRESS' : 'NOT_STARTED';

    setItems((prev) =>
      prev.map((item) => {
        if (item.id === id) {
          return { ...item, progressPercent: clamped, status };
        }
        return item;
      })
    );
  };

  // Add item
  const handleAddItem = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newChapter.trim()) return;

    const newItem: QuizSyllabusItem = {
      id: `syl-${Date.now()}`,
      subject: newSubject,
      chapter: newChapter.trim(),
      topic: newTopic.trim() || 'Core concepts and applications',
      status: 'NOT_STARTED',
      progressPercent: 0,
      lastUpdated: new Date().toISOString()
    };

    setItems((prev) => [...prev, newItem]);
    setNewChapter('');
    setNewTopic('');
    setShowAddModal(false);
  };

  // Delete item
  const handleDeleteItem = (id: string) => {
    setItems((prev) => prev.filter((it) => it.id !== id));
  };

  // Save all
  const handleSaveAll = () => {
    setIsSaving(true);
    items.forEach((it) => {
      sathiQuizService.updateSyllabusProgress(it.id, it.progressPercent, it.status, selectedClassGrade);
    });
    setTimeout(() => {
      setIsSaving(false);
      setSaveSuccess(true);
      setTimeout(() => setSaveSuccess(false), 2500);
    }, 400);
  };

  // Calculated Metrics
  const metrics = useMemo(() => {
    if (items.length === 0) return { overall: 0, completed: 0, inProgress: 0, notStarted: 0 };
    const totalPct = items.reduce((acc, it) => acc + (it.progressPercent || 0), 0);
    return {
      overall: Math.round(totalPct / items.length),
      completed: items.filter((it) => it.status === 'COMPLETED').length,
      inProgress: items.filter((it) => it.status === 'IN_PROGRESS').length,
      notStarted: items.filter((it) => it.status === 'NOT_STARTED').length
    };
  }, [items]);

  // Filtered Items
  const filteredItems = useMemo(() => {
    return items.filter((it) => {
      const matchSubject = selectedSubject === 'all' || it.subject === selectedSubject;
      const matchStatus = selectedStatus === 'all' || it.status === selectedStatus;
      const matchQuery =
        searchQuery.trim() === '' ||
        it.chapter.toLowerCase().includes(searchQuery.toLowerCase()) ||
        it.topic.toLowerCase().includes(searchQuery.toLowerCase()) ||
        it.subject.toLowerCase().includes(searchQuery.toLowerCase());
      return matchSubject && matchStatus && matchQuery;
    });
  }, [items, selectedSubject, selectedStatus, searchQuery]);

  // Subject Pill Colors
  const getSubjectBadge = (subject: string) => {
    switch (subject) {
      case 'Physics':
        return 'bg-cyan-500/15 text-cyan-300 border-cyan-500/30';
      case 'Chemistry':
        return 'bg-emerald-500/15 text-emerald-300 border-emerald-500/30';
      case 'Mathematics':
        return 'bg-violet-500/15 text-violet-300 border-violet-500/30';
      case 'AI / Computer':
        return 'bg-amber-500/15 text-amber-300 border-amber-500/30';
      case 'English':
        return 'bg-rose-500/15 text-rose-300 border-rose-500/30';
      case 'Physical Education':
        return 'bg-blue-500/15 text-blue-300 border-blue-500/30';
      default:
        return 'bg-slate-800 text-slate-300 border-white/10';
    }
  };

  const getSubjectBlueprintCount = (subject: string) => {
    switch (subject) {
      case 'Physics':
      case 'Chemistry':
      case 'Mathematics':
      case 'English':
        return '10 MCQs';
      case 'AI / Computer':
      case 'Physical Education':
        return '5 MCQs';
      default:
        return 'MCQs';
    }
  };

  return (
    <div className="space-y-6">
      {/* Class Syllabus Selector */}
      <div className="flex items-center gap-2 bg-slate-900/90 p-1.5 rounded-2xl border border-white/10 w-fit">
        <button
          type="button"
          onClick={() => setSelectedClassGrade('10')}
          className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all ${
            selectedClassGrade === '10'
              ? 'bg-gradient-to-r from-purple-600 to-indigo-600 text-white shadow-lg shadow-purple-600/30'
              : 'text-slate-400 hover:text-white hover:bg-white/5'
          }`}
        >
          <BookOpen className="h-3.5 w-3.5" />
          <span>Class 10 CBSE Syllabus</span>
          <span className={`text-[9px] px-1.5 py-0.2 rounded font-mono ${
            selectedClassGrade === '10' ? 'bg-white/20 text-white' : 'bg-white/5 text-slate-400'
          }`}>
            10th Grade
          </span>
        </button>

        <button
          type="button"
          onClick={() => setSelectedClassGrade('12')}
          className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all ${
            selectedClassGrade === '12'
              ? 'bg-gradient-to-r from-purple-600 to-indigo-600 text-white shadow-lg shadow-purple-600/30'
              : 'text-slate-400 hover:text-white hover:bg-white/5'
          }`}
        >
          <BookOpen className="h-3.5 w-3.5" />
          <span>Class 12 CBSE Syllabus</span>
          <span className={`text-[9px] px-1.5 py-0.2 rounded font-mono ${
            selectedClassGrade === '12' ? 'bg-white/20 text-white' : 'bg-white/5 text-slate-400'
          }`}>
            12th Science
          </span>
        </button>
      </div>

      {/* Header Banner */}
      <div className="rounded-2xl border border-white/[0.08] bg-gradient-to-r from-slate-900/90 to-[#0A0E17] p-4 sm:p-6 backdrop-blur-xl shadow-dashboard">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-cyan-500/15 text-cyan-300 border border-cyan-500/30 flex items-center gap-1">
                <Layers className="h-3 w-3" />
                <span>CBSE Class 12 Science Blueprint</span>
              </span>
              <span className="text-[10px] font-mono text-slate-400">PVM Lumding 2026-27</span>
            </div>
            <h2 className="text-xl sm:text-2xl font-bold text-white tracking-tight flex items-center gap-2 font-display italic">
              Academic Curriculum & Blueprint Tracker
            </h2>
            <p className="text-xs text-slate-400 mt-1 max-w-2xl">
              Track Class 12 Science syllabus coverage in real-time, monitor weekly 50-MCQ question weightages, and optimize preparation.
            </p>
          </div>

          <div className="flex items-center gap-2 shrink-0">
            {isTeacher ? (
              <>
                <button
                  onClick={() => setShowAddModal(true)}
                  className="flex items-center gap-1.5 px-3 sm:px-3.5 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-xs font-semibold text-slate-200 border border-white/10 transition-colors shadow-sm active:scale-95"
                >
                  <Plus className="h-3.5 w-3.5 text-cyan-400" />
                  <span>Add Unit</span>
                </button>

                <button
                  onClick={handleSaveAll}
                  disabled={isSaving}
                  className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-400 hover:to-teal-500 text-slate-950 font-bold text-xs shadow-lg shadow-emerald-500/20 transition-all active:scale-95 disabled:opacity-50"
                >
                  {saveSuccess ? <Check className="h-3.5 w-3.5" /> : <Save className="h-3.5 w-3.5" />}
                  <span>{isSaving ? 'Saving...' : saveSuccess ? 'Saved Live!' : 'Save Progress'}</span>
                </button>
              </>
            ) : (
              <span className="px-3 py-1.5 rounded-xl text-xs font-semibold bg-cyan-500/10 text-cyan-300 border border-cyan-500/20 flex items-center gap-1.5 shadow-sm">
                <BookOpen className="h-3.5 w-3.5 text-cyan-400" />
                <span>Student Academic View</span>
              </span>
            )}
          </div>
        </div>

        {/* Dynamic Analytics & Metrics Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-5 mt-5 border-t border-white/[0.06]">
          <div className="rounded-xl border border-white/5 bg-black/40 p-3">
            <span className="text-[10px] uppercase font-mono text-slate-400 block">Overall Completion</span>
            <div className="flex items-baseline gap-2 mt-1">
              <span className="text-xl sm:text-2xl font-bold font-mono text-cyan-300">{metrics.overall}%</span>
              <span className="text-[10px] text-slate-500">Syllabus Covered</span>
            </div>
            <div className="w-full h-1.5 bg-slate-800 rounded-full mt-2 overflow-hidden">
              <div
                className="h-full bg-gradient-to-r from-cyan-500 to-emerald-400 rounded-full transition-all duration-700"
                style={{ width: `${metrics.overall}%` }}
              />
            </div>
          </div>

          <div className="rounded-xl border border-white/5 bg-black/40 p-3">
            <span className="text-[10px] uppercase font-mono text-slate-400 block">Completed Units</span>
            <div className="flex items-baseline gap-2 mt-1">
              <span className="text-xl sm:text-2xl font-bold font-mono text-emerald-400">{metrics.completed}</span>
              <span className="text-[10px] text-slate-500">of {items.length} Units</span>
            </div>
            <span className="text-[10px] text-emerald-400/80 font-medium block mt-1.5">100% Prepared</span>
          </div>

          <div className="rounded-xl border border-white/5 bg-black/40 p-3">
            <span className="text-[10px] uppercase font-mono text-slate-400 block">In Progress</span>
            <div className="flex items-baseline gap-2 mt-1">
              <span className="text-xl sm:text-2xl font-bold font-mono text-amber-400">{metrics.inProgress}</span>
              <span className="text-[10px] text-slate-500">Active Units</span>
            </div>
            <span className="text-[10px] text-amber-400/80 font-medium block mt-1.5">Under Active Teaching</span>
          </div>

          <div className="rounded-xl border border-white/5 bg-black/40 p-3">
            <span className="text-[10px] uppercase font-mono text-slate-400 block">Weekly Exam Blueprint</span>
            <div className="flex items-baseline gap-2 mt-1">
              <span className="text-xl sm:text-2xl font-bold font-mono text-violet-400">50</span>
              <span className="text-[10px] text-slate-500">Questions (200 M)</span>
            </div>
            <span className="text-[10px] text-violet-400/80 font-medium block mt-1.5">Standard Allocation</span>
          </div>
        </div>
      </div>

      {/* 50-MCQ Blueprint Distribution Info Strip */}
      <div className="rounded-2xl border border-white/[0.08] bg-[#0A0E17]/80 p-4 shadow-xl">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
          <div className="flex items-center gap-2.5">
            <div className="h-8 w-8 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 flex items-center justify-center shrink-0">
              <BarChart2 className="h-4 w-4" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h4 className="text-xs font-bold text-white">50-MCQ Weekly Challenge Distribution:</h4>
                <span className="text-[10px] font-mono text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded border border-emerald-500/20">
                  +4 / -1 Marking
                </span>
              </div>
              <p className="text-[11px] text-slate-400 mt-0.5">
                Physics (10) • Chemistry (10) • Mathematics (10) • AI & Computer (5) • English Core (10) • Physical Ed (5)
              </p>
            </div>
          </div>
          <div className="flex items-center gap-1.5 flex-wrap text-[10px] font-mono text-slate-400">
            <span className="px-2 py-0.5 rounded bg-cyan-500/10 text-cyan-300 border border-cyan-500/20">Physics: 10</span>
            <span className="px-2 py-0.5 rounded bg-emerald-500/10 text-emerald-300 border border-emerald-500/20">Chem: 10</span>
            <span className="px-2 py-0.5 rounded bg-violet-500/10 text-violet-300 border border-violet-500/20">Math: 10</span>
            <span className="px-2 py-0.5 rounded bg-amber-500/10 text-amber-300 border border-amber-500/20">AI: 5</span>
            <span className="px-2 py-0.5 rounded bg-rose-500/10 text-rose-300 border border-rose-500/20">Eng: 10</span>
            <span className="px-2 py-0.5 rounded bg-blue-500/10 text-blue-300 border border-blue-500/20">PE: 5</span>
          </div>
        </div>
      </div>

      {/* Search & Filtering Toolbar (Mobile-friendly) */}
      <div className="space-y-3">
        <div className="flex flex-col sm:flex-row gap-3">
          {/* Search Input */}
          <div className="relative flex-1">
            <Search className="absolute left-3.5 top-2.5 h-3.5 w-3.5 text-slate-500" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search chapters, units, or key topics (e.g. Optics, AC, Calculus)..."
              className="w-full rounded-xl border border-white/10 bg-[#0A0E17] pl-9 pr-3 py-2 text-xs text-white placeholder-slate-500 focus:border-cyan-400 focus:outline-none shadow-sm"
            />
          </div>

          {/* Status Filter */}
          <div className="flex items-center gap-1 bg-[#0A0E17] p-1 rounded-xl border border-white/10 shrink-0">
            {[
              { id: 'all', label: 'All' },
              { id: 'COMPLETED', label: 'Done' },
              { id: 'IN_PROGRESS', label: 'Active' },
              { id: 'NOT_STARTED', label: 'Upcoming' }
            ].map((st) => (
              <button
                key={st.id}
                onClick={() => setSelectedStatus(st.id)}
                className={`px-2.5 py-1 rounded-lg text-[11px] font-semibold transition-all ${
                  selectedStatus === st.id
                    ? 'bg-white/[0.12] text-white font-bold'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                {st.label}
              </button>
            ))}
          </div>
        </div>

        {/* Subject Filter Tabs (Horizontal Scrollable) */}
        <div className="flex gap-2 overflow-x-auto pb-1 scrollbar-none">
          {[
            { id: 'all', label: 'All Subjects', count: items.length },
            { id: 'Physics', label: 'Physics', count: items.filter((i) => i.subject === 'Physics').length },
            { id: 'Chemistry', label: 'Chemistry', count: items.filter((i) => i.subject === 'Chemistry').length },
            { id: 'Mathematics', label: 'Mathematics', count: items.filter((i) => i.subject === 'Mathematics').length },
            { id: 'AI / Computer', label: 'AI & CS', count: items.filter((i) => i.subject === 'AI / Computer').length },
            { id: 'English', label: 'English', count: items.filter((i) => i.subject === 'English').length },
            { id: 'Physical Education', label: 'Physical Ed.', count: items.filter((i) => i.subject === 'Physical Education').length }
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setSelectedSubject(tab.id)}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition-all border ${
                selectedSubject === tab.id
                  ? 'bg-cyan-500 text-slate-950 font-bold border-cyan-400 shadow-sm'
                  : 'bg-slate-900/70 text-slate-400 hover:text-slate-200 border-white/5 hover:border-white/10'
              }`}
            >
              <span>{tab.label}</span>
              <span
                className={`px-1.5 py-0.2 rounded text-[10px] font-mono ${
                  selectedSubject === tab.id ? 'bg-black/20 text-slate-950 font-bold' : 'bg-white/5 text-slate-400'
                }`}
              >
                {tab.count}
              </span>
            </button>
          ))}
        </div>
      </div>

      {/* Chapters Grid (Responsive & Touch-Friendly) */}
      {filteredItems.length === 0 ? (
        <div className="rounded-2xl border border-white/10 bg-[#0A0E17]/60 p-8 text-center text-slate-400 space-y-2">
          <BookOpen className="h-8 w-8 text-slate-500 mx-auto" />
          <p className="text-sm font-semibold text-slate-300">No curriculum units found</p>
          <p className="text-xs text-slate-500">Try adjusting your search query or subject filter.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {filteredItems.map((item) => (
            <div
              key={item.id}
              className="rounded-2xl border border-white/[0.08] bg-[#0A0E17]/90 p-4 sm:p-5 space-y-3.5 hover:border-white/15 transition-all shadow-md"
            >
              {/* Card Header: Subject, Class, Delete */}
              <div className="flex items-start justify-between gap-3">
                <div className="min-w-0">
                  <div className="flex items-center gap-2 mb-1.5 flex-wrap">
                    <span
                      className={`px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider rounded-md border ${getSubjectBadge(
                        item.subject
                      )}`}
                    >
                      {item.subject}
                    </span>
                    <span className="text-[10px] font-mono text-slate-400 bg-white/5 px-2 py-0.5 rounded">
                      Blueprint: {getSubjectBlueprintCount(item.subject)}
                    </span>
                    <span className="text-[10px] text-slate-500">Class 12 Science</span>
                  </div>
                  <h4 className="text-sm sm:text-base font-bold text-white tracking-tight leading-snug">
                    {item.chapter}
                  </h4>
                  <p className="text-xs text-slate-400 mt-1 leading-relaxed line-clamp-2">
                    {item.topic}
                  </p>
                </div>

                {isTeacher && (
                  <button
                    onClick={() => handleDeleteItem(item.id)}
                    className="text-slate-500 hover:text-rose-400 transition-colors p-1.5 rounded-lg hover:bg-rose-500/10 shrink-0"
                    title="Remove Unit"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                )}
              </div>

              {/* Progress & Controls */}
              <div className="space-y-2 pt-2 border-t border-white/[0.06]">
                <div className="flex items-center justify-between text-xs">
                  <div className="flex items-center gap-2">
                    <span className="text-slate-400 text-[11px] font-medium">Completion Progress</span>
                    <span
                      className={`px-2 py-0.2 rounded-full text-[9px] font-semibold uppercase tracking-wider ${
                        item.status === 'COMPLETED'
                          ? 'bg-emerald-500/15 text-emerald-300 border border-emerald-500/30'
                          : item.status === 'IN_PROGRESS'
                          ? 'bg-cyan-500/15 text-cyan-300 border border-cyan-500/30'
                          : 'bg-slate-800 text-slate-400 border border-white/5'
                      }`}
                    >
                      {item.status === 'COMPLETED' ? 'Completed' : item.status === 'IN_PROGRESS' ? 'In Progress' : 'Upcoming'}
                    </span>
                  </div>
                  <span className="font-mono font-bold text-cyan-300 text-xs sm:text-sm">
                    {item.progressPercent}%
                  </span>
                </div>

                {/* Interactive Sliders & Presets for Teachers / Admin */}
                {isTeacher ? (
                  <div className="space-y-2">
                    <input
                      type="range"
                      min="0"
                      max="100"
                      step="5"
                      value={item.progressPercent}
                      onChange={(e) => handleUpdateProgress(item.id, Number(e.target.value))}
                      className="w-full accent-cyan-400 h-2 bg-slate-800 rounded-lg cursor-pointer"
                    />
                    {/* 1-Tap Preset Buttons (Senior web dev touch for mobile & tablet efficiency) */}
                    <div className="flex items-center justify-between gap-1 pt-0.5">
                      <span className="text-[10px] text-slate-500 font-mono">Quick Set:</span>
                      <div className="flex items-center gap-1">
                        {[0, 25, 50, 75, 100].map((pct) => (
                          <button
                            key={pct}
                            type="button"
                            onClick={() => handleUpdateProgress(item.id, pct)}
                            className={`px-2 py-0.5 text-[10px] font-mono rounded-md border transition-all ${
                              item.progressPercent === pct
                                ? 'bg-cyan-500 text-black font-bold border-cyan-400'
                                : 'bg-slate-800/80 text-slate-400 hover:text-white border-white/5 hover:border-white/15'
                            }`}
                          >
                            {pct}%
                          </button>
                        ))}
                      </div>
                    </div>
                  </div>
                ) : (
                  /* Read-Only Clean Gauge for Students */
                  <div className="space-y-1.5">
                    <div className="w-full h-2.5 bg-slate-800/90 rounded-full overflow-hidden border border-white/5">
                      <div
                        className="h-full bg-gradient-to-r from-cyan-500 via-teal-400 to-emerald-400 rounded-full transition-all duration-500"
                        style={{ width: `${item.progressPercent}%` }}
                      />
                    </div>
                    <div className="flex items-center justify-between text-[10px] text-slate-500 font-mono">
                      <span>Unit Status: {item.progressPercent === 100 ? 'Fully Prepared' : `${100 - item.progressPercent}% Remaining`}</span>
                      <span>CBSE Aligned</span>
                    </div>
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Add Chapter Modal */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-md p-4 animate-in fade-in">
          <form
            onSubmit={handleAddItem}
            className="w-full max-w-lg rounded-2xl border border-white/10 bg-[#0A0E17] p-5 sm:p-6 shadow-2xl space-y-4 max-h-[90vh] overflow-y-auto"
          >
            <div className="flex items-center justify-between border-b border-white/10 pb-3">
              <h3 className="text-base font-bold text-white flex items-center gap-2 font-display italic">
                <Layers className="h-4 w-4 text-cyan-400" />
                <span>Add Curriculum Unit</span>
              </h3>
              <span className="text-[10px] font-mono text-cyan-300 bg-cyan-500/10 px-2 py-0.5 rounded border border-cyan-500/20">
                Class 12 Science
              </span>
            </div>

            <div className="space-y-3.5 text-xs">
              <div>
                <label className="block text-slate-400 mb-1 font-medium">Target Subject</label>
                <select
                  value={newSubject}
                  onChange={(e) => setNewSubject(e.target.value as QuizSubject)}
                  className="w-full bg-slate-900 border border-white/10 rounded-xl px-3 py-2 text-white focus:outline-none focus:border-cyan-400"
                >
                  <option value="Physics">Physics (10 MCQs)</option>
                  <option value="Chemistry">Chemistry (10 MCQs)</option>
                  <option value="Mathematics">Mathematics (10 MCQs)</option>
                  <option value="AI / Computer">AI & Computer Science (5 MCQs)</option>
                  <option value="English">English Core (10 MCQs)</option>
                  <option value="Physical Education">Physical Education (5 MCQs)</option>
                </select>
              </div>

              <div>
                <label className="block text-slate-400 mb-1 font-medium">Chapter / Unit Title</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Electromagnetic Induction & Alternating Currents"
                  value={newChapter}
                  onChange={(e) => setNewChapter(e.target.value)}
                  className="w-full bg-slate-900 border border-white/10 rounded-xl px-3 py-2 text-white placeholder-slate-500 focus:outline-none focus:border-cyan-400"
                />
              </div>

              <div>
                <label className="block text-slate-400 mb-1 font-medium">Key Subtopics & Concepts</label>
                <input
                  type="text"
                  placeholder="e.g. Faraday's Law, Lenz's Law, Eddy Currents, AC Generator"
                  value={newTopic}
                  onChange={(e) => setNewTopic(e.target.value)}
                  className="w-full bg-slate-900 border border-white/10 rounded-xl px-3 py-2 text-white placeholder-slate-500 focus:outline-none focus:border-cyan-400"
                />
              </div>
            </div>

            <div className="flex items-center justify-end gap-3 pt-3 border-t border-white/10">
              <button
                type="button"
                onClick={() => setShowAddModal(false)}
                className="px-4 py-2 rounded-xl bg-slate-800 text-xs font-semibold text-slate-300 hover:bg-slate-700 transition-colors"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-5 py-2 rounded-xl bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-bold text-xs shadow-glow-cyan transition-colors"
              >
                Add Unit to Curriculum
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
};
