import React, { useState, useEffect, useRef } from 'react';
import { useApp } from '../../context/AppContext';
import {
  Search,
  Trophy,
  Cpu,
  GraduationCap,
  Briefcase,
  Layers,
  Radio,
  FileSpreadsheet,
  Download,
  Sparkles,
  X,
  User
} from 'lucide-react';

interface CommandPaletteProps {
  isOpen: boolean;
  onClose: () => void;
  onNavigate: (tab: string) => void;
  onOpenAI: () => void;
}

export const CommandPalette: React.FC<CommandPaletteProps> = ({
  isOpen,
  onClose,
  onNavigate,
  onOpenAI
}) => {
  const { students, staff, setSimulatorOpen, exportToExcel, exportToCSV, syncGoogleSheets, setCurrentStudent } = useApp();
  const [query, setQuery] = useState('');
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 'k') {
        e.preventDefault();
        isOpen ? onClose() : undefined;
      }
      if (e.key === 'Escape' && isOpen) {
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  useEffect(() => {
    if (isOpen) {
      setTimeout(() => inputRef.current?.focus(), 50);
    } else {
      setQuery('');
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const filteredStudents = query.trim()
    ? students.filter(s =>
        s.name.toLowerCase().includes(query.toLowerCase()) ||
        s.admissionNo.toLowerCase().includes(query.toLowerCase()) ||
        s.rfidUid.toLowerCase().includes(query.toLowerCase())
      ).slice(0, 4)
    : [];

  const filteredStaff = query.trim()
    ? staff.filter(st =>
        st.name.toLowerCase().includes(query.toLowerCase()) ||
        st.department.toLowerCase().includes(query.toLowerCase())
      ).slice(0, 3)
    : [];

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center bg-black/75 p-4 pt-20 backdrop-blur-md animate-in fade-in duration-200">
      <div
        className="w-full max-w-xl overflow-hidden rounded-2xl border border-white/[0.12] bg-obsidian-900 shadow-2xl transition-all"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Search Header */}
        <div className="flex items-center border-b border-white/[0.08] px-4 py-3">
          <Search className="h-5 w-5 text-slate-400" />
          <input
            ref={inputRef}
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Type a command or search students, staff, RFID cards..."
            className="flex-1 bg-transparent px-3 text-sm text-white placeholder-slate-500 focus:outline-none"
          />
          <button
            onClick={onClose}
            className="rounded-lg p-1 text-slate-400 hover:bg-white/10 hover:text-white"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        {/* Action Commands List */}
        <div className="max-h-96 overflow-y-auto p-2 text-xs">
          {/* Quick Actions */}
          {!query && (
            <div className="space-y-1">
              <div className="px-2 py-1.5 font-mono text-[10px] font-semibold text-slate-500 uppercase tracking-wider">
                System Commands
              </div>

              <button
                onClick={() => {
                  setSimulatorOpen(true);
                  onClose();
                }}
                className="flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-left text-slate-200 hover:bg-cyan-500/10 hover:text-cyan-300 transition-colors"
              >
                <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-cyan-500/20 text-cyan-400">
                  <Cpu className="h-4 w-4" />
                </div>
                <div>
                  <div className="font-medium text-white">Simulate Hardware Event (RFID + Biometric)</div>
                  <div className="text-[11px] text-slate-400">Trigger simulated Raspberry Pi & ESP8266 2FA tap</div>
                </div>
              </button>

              <button
                onClick={() => {
                  onNavigate('about');
                  onClose();
                }}
                className="flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-left text-slate-200 hover:bg-emerald-500/10 hover:text-emerald-300 transition-colors"
              >
                <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-emerald-500/20 text-emerald-400">
                  <Briefcase className="h-4 w-4" />
                </div>
                <div>
                  <div className="font-medium text-white">About Pranabananda Vidyamandir (Interactive Gaze)</div>
                  <div className="text-[11px] text-slate-400">School pillars, CBSE affiliation, and mouse watch video</div>
                </div>
              </button>

              <button
                onClick={() => {
                  onNavigate('sathi-quiz');
                  onClose();
                }}
                className="flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-left text-slate-200 hover:bg-amber-500/10 hover:text-amber-300 transition-colors"
              >
                <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-amber-500/20 text-amber-400">
                  <Trophy className="h-4 w-4" />
                </div>
                <div>
                  <div className="font-medium text-white">Sathi Quiz � Weekly Academic Challenge</div>
                  <div className="text-[11px] text-slate-400">Official Class 12 Science 50-MCQ test, OMR bubble sheet, and practice mocks</div>
                </div>
              </button>

              <button
                onClick={() => {
                  onNavigate('diagnostics');
                  onClose();
                }}
                className="flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-left text-slate-200 hover:bg-cyan-500/10 hover:text-cyan-300 transition-colors"
              >
                <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-cyan-500/20 text-cyan-400">
                  <Cpu className="h-4 w-4" />
                </div>
                <div>
                  <div className="font-medium text-white">Hardware & Realtime Diagnostics Center</div>
                  <div className="text-[11px] text-slate-400">Verify Pvm Sathi AI, Supabase DB, and Raspberry Pi / ESP8266</div>
                </div>
              </button>

              <button
                onClick={() => {
                  onNavigate('login');
                  onClose();
                }}
                className="flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-left text-slate-200 hover:bg-blue-500/10 hover:text-blue-300 transition-colors"
              >
                <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-blue-500/20 text-blue-400">
                  <User className="h-4 w-4" />
                </div>
                <div>
                  <div className="font-medium text-white">Sign In & Admin Credential Generator</div>
                  <div className="text-[11px] text-slate-400">Supabase login, password strength meter, and OTP verifier</div>
                </div>
              </button>

              <button
                onClick={() => {
                  onOpenAI();
                  onClose();
                }}
                className="flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-left text-slate-200 hover:bg-violet-500/10 hover:text-violet-300 transition-colors"
              >
                <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-violet-500/20 text-violet-400">
                  <Sparkles className="h-4 w-4" />
                </div>
                <div>
                  <div className="font-medium text-white">Ask AI Attendance Intelligence</div>
                  <div className="text-[11px] text-slate-400">Query attendance trends, anomalies, and risk reports</div>
                </div>
              </button>

              <button
                onClick={() => {
                  onNavigate('live');
                  onClose();
                }}
                className="flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-left text-slate-200 hover:bg-rose-500/10 hover:text-rose-300 transition-colors"
              >
                <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-rose-500/20 text-rose-400">
                  <Radio className="h-4 w-4" />
                </div>
                <div>
                  <div className="font-medium text-white">Open Live Operations Wall</div>
                  <div className="text-[11px] text-slate-400">Full-screen real-time airport-style arrivals screen</div>
                </div>
              </button>

              <button
                onClick={() => {
                  syncGoogleSheets();
                  onClose();
                }}
                className="flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-left text-slate-200 hover:bg-emerald-500/10 hover:text-emerald-300 transition-colors"
              >
                <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-emerald-500/20 text-emerald-400">
                  <FileSpreadsheet className="h-4 w-4" />
                </div>
                <div>
                  <div className="font-medium text-white">Sync with Google Sheets</div>
                  <div className="text-[11px] text-slate-400">Synchronize today's attendance records to downstream workbook</div>
                </div>
              </button>

              <button
                onClick={() => {
                  exportToExcel();
                  onClose();
                }}
                className="flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-left text-slate-200 hover:bg-slate-800 transition-colors"
              >
                <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-slate-800 text-slate-300">
                  <Download className="h-4 w-4" />
                </div>
                <div>
                  <div className="font-medium text-white">Export Attendance to Excel (.xlsx)</div>
                  <div className="text-[11px] text-slate-400">Download formatted multi-column workbook</div>
                </div>
              </button>
            </div>
          )}

          {/* Filtered Students */}
          {filteredStudents.length > 0 && (
            <div className="mt-2 space-y-1">
              <div className="px-2 py-1.5 font-mono text-[10px] font-semibold text-slate-500 uppercase tracking-wider">
                Students Found
              </div>
              {filteredStudents.map(student => (
                <button
                  key={student.id}
                  onClick={() => {
                    setCurrentStudent(student);
                    onNavigate('student');
                    onClose();
                  }}
                  className="flex w-full items-center justify-between rounded-xl px-3 py-2 text-left hover:bg-cyan-500/10 transition-colors"
                >
                  <div className="flex items-center gap-2.5">
                    <img src={student.avatarUrl} alt={student.name} className="h-7 w-7 rounded-full object-cover border border-white/10" />
                    <div>
                      <div className="font-semibold text-white">{student.name}</div>
                      <div className="text-[11px] text-slate-400">Grade {student.classGrade}-{student.section} • Roll #{student.rollNo}</div>
                    </div>
                  </div>
                  <span className="font-mono text-[11px] text-cyan-400">{student.attendancePercentage}% Rate</span>
                </button>
              ))}
            </div>
          )}

          {/* Filtered Staff */}
          {filteredStaff.length > 0 && (
            <div className="mt-2 space-y-1">
              <div className="px-2 py-1.5 font-mono text-[10px] font-semibold text-slate-500 uppercase tracking-wider">
                Faculty & Staff Found
              </div>
              {filteredStaff.map(st => (
                <button
                  key={st.id}
                  onClick={() => {
                    onNavigate('staff');
                    onClose();
                  }}
                  className="flex w-full items-center justify-between rounded-xl px-3 py-2 text-left hover:bg-violet-500/10 transition-colors"
                >
                  <div className="flex items-center gap-2.5">
                    <img src={st.avatarUrl} alt={st.name} className="h-7 w-7 rounded-full object-cover border border-white/10" />
                    <div>
                      <div className="font-semibold text-white">{st.name}</div>
                      <div className="text-[11px] text-slate-400">{st.department} • {st.designation}</div>
                    </div>
                  </div>
                  <span className="font-mono text-[11px] text-violet-400">{st.rfidUid}</span>
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Footer shortcuts */}
        <div className="flex items-center justify-between border-t border-white/[0.08] bg-obsidian-950 px-4 py-2 text-[11px] text-slate-400">
          <span>Navigate with <kbd className="rounded bg-slate-800 px-1 py-0.5 font-mono text-[10px]">↑</kbd> <kbd className="rounded bg-slate-800 px-1 py-0.5 font-mono text-[10px]">↓</kbd></span>
          <span>Press <kbd className="rounded bg-slate-800 px-1 py-0.5 font-mono text-[10px]">ESC</kbd> to exit</span>
        </div>
      </div>
    </div>
  );
};
