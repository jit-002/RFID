import React from 'react';
import { useApp } from '../context/AppContext';
import { getStatusBadge } from '../lib/utils';
import { AttendanceRecord } from '../types';
import {
  Radio,
  ShieldCheck,
  Cpu,
  Users,
  Clock,
  MapPin,
  CheckCircle2
} from 'lucide-react';

export const LiveAttendanceWall: React.FC = () => {
  const { students, attendance, setSimulatorOpen } = useApp();

  const presentCount = attendance.filter(a => a.status === 'PRESENT').length;
  const lateCount = attendance.filter(a => a.status === 'LATE').length;
  const totalScanned = attendance.length;
  const rate = Math.round(((presentCount + lateCount) / students.length) * 1000) / 10;

  return (
    <div className="min-h-screen bg-obsidian-950 p-6 sm:p-10 space-y-8">
      {/* Wall Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-white/[0.08] pb-6">
        <div className="flex items-center gap-4">
          <div className="relative flex h-12 w-12 items-center justify-center rounded-2xl bg-rose-500/20 text-rose-400 border border-rose-500/30">
            <Radio className="h-6 w-6 animate-pulse" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-2xl font-black text-white tracking-wider uppercase font-mono">
                Perimeter Operations Live Wall
              </h1>
              <span className="rounded-full border border-emerald-500/30 bg-emerald-500/10 px-2.5 py-0.5 font-mono text-xs font-bold text-emerald-400">
                ACTIVE
              </span>
            </div>
            <p className="text-xs text-slate-400 font-mono mt-0.5">
              Zero-Trust 2FA Biometric Streaming • Raspberry Pi Gateway Turnstiles
            </p>
          </div>
        </div>

        <button
          onClick={() => setSimulatorOpen(true)}
          className="flex items-center gap-2 rounded-2xl bg-cyan-500 px-5 py-3 text-xs font-bold text-obsidian-950 shadow-glow-cyan hover:bg-cyan-400 active:scale-95 transition-all"
        >
          <Cpu className="h-4 w-4" />
          <span>SIMULATE CARD TAP</span>
        </button>
      </div>

      {/* Large Operations Counters */}
      <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
        <div className="rounded-3xl border border-white/[0.08] bg-obsidian-900/80 p-6 text-center shadow-glass">
          <span className="font-mono text-xs font-semibold text-slate-400 uppercase tracking-widest">Expected</span>
          <div className="text-5xl font-black text-white font-mono mt-2">{students.length}</div>
        </div>

        <div className="rounded-3xl border border-emerald-500/20 bg-emerald-950/30 p-6 text-center shadow-glow-emerald">
          <span className="font-mono text-xs font-semibold text-emerald-400 uppercase tracking-widest">Verified Present</span>
          <div className="text-5xl font-black text-emerald-400 font-mono mt-2">{presentCount}</div>
        </div>

        <div className="rounded-3xl border border-amber-500/20 bg-amber-950/30 p-6 text-center">
          <span className="font-mono text-xs font-semibold text-amber-400 uppercase tracking-widest">Late Arrival</span>
          <div className="text-5xl font-black text-amber-400 font-mono mt-2">{lateCount}</div>
        </div>

        <div className="rounded-3xl border border-cyan-500/20 bg-cyan-950/30 p-6 text-center shadow-glow-cyan">
          <span className="font-mono text-xs font-semibold text-cyan-400 uppercase tracking-widest">Campus Rate</span>
          <div className="text-5xl font-black text-cyan-400 font-mono mt-2">{rate}%</div>
        </div>
      </div>

      {/* Live Stream Grid */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <h3 className="font-mono text-xs font-bold uppercase tracking-wider text-slate-400">
            Realtime Verified Inflow Feed
          </h3>
          <span className="text-xs font-mono text-cyan-400">WebSocket / Supabase Realtime Connected</span>
        </div>

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {attendance.slice(0, 12).map((record) => {
            const badge = getStatusBadge(record.status);

            return (
              <div
                key={record.id}
                className="relative overflow-hidden rounded-3xl border border-white/[0.08] bg-slate-900/70 p-5 shadow-glass backdrop-blur-xl transition-all hover:border-cyan-500/30"
              >
                <div className="flex items-start gap-3.5">
                  <img
                    src={record.personAvatar}
                    alt={record.personName}
                    className="h-12 w-12 rounded-2xl object-cover border border-white/10"
                  />
                  <div className="flex-1 min-w-0">
                    <div className="font-bold text-sm text-white truncate">{record.personName}</div>
                    <div className="text-[11px] text-slate-400 font-mono truncate">{record.classOrDept}</div>
                    <div className="mt-2 flex items-center justify-between">
                      <span className={`inline-flex items-center gap-1 rounded-full border px-2 py-0.5 text-[10px] font-semibold ${badge.className}`}>
                        <span className={`h-1 w-1 rounded-full ${badge.dotColor}`}></span>
                        {badge.label}
                      </span>
                      <span className="font-mono text-[11px] text-cyan-300 font-bold">
                        {record.timeDisplay}
                      </span>
                    </div>
                  </div>
                </div>

                <div className="mt-3 border-t border-white/[0.06] pt-2 text-[10px] text-slate-500 font-mono flex items-center justify-between">
                  <span className="truncate">{record.location}</span>
                  <span className="text-emerald-400 font-semibold">2FA ✓</span>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};
