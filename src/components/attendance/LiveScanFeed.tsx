import React from 'react';
import { useApp } from '../../context/AppContext';
import { getStatusBadge } from '../../lib/utils';
import { Radio, ShieldCheck, Check, MessageSquare, FileSpreadsheet, AlertCircle } from 'lucide-react';

export const LiveScanFeed: React.FC = () => {
  const { attendance, securityEvents } = useApp();

  return (
    <div className="rounded-3xl border border-white/[0.08] bg-obsidian-900/60 backdrop-blur-xl p-5 shadow-glass">
      <div className="flex items-center justify-between border-b border-white/[0.08] pb-4 mb-4">
        <div className="flex items-center gap-2.5">
          <span className="relative flex h-3 w-3">
            <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-cyan-400 opacity-75"></span>
            <span className="relative inline-flex h-3 w-3 rounded-full bg-cyan-500"></span>
          </span>
          <h3 className="text-sm font-bold text-white tracking-wide uppercase font-mono">
            Perimeter Inflow Live Stream
          </h3>
        </div>
        <span className="text-xs text-slate-400 font-mono">
          {attendance.length} Total Events Today
        </span>
      </div>

      {/* Events List */}
      <div className="space-y-3 max-h-[480px] overflow-y-auto pr-1">
        {attendance.slice(0, 8).map((record) => {
          const badge = getStatusBadge(record.status);

          return (
            <div
              key={record.id}
              className="flex items-center justify-between rounded-2xl border border-white/[0.06] bg-slate-950/60 p-3.5 transition-all hover:border-white/20 hover:bg-slate-900/60"
            >
              <div className="flex items-center gap-3">
                <img
                  src={record.personAvatar}
                  alt={record.personName}
                  className="h-10 w-10 rounded-full object-cover border border-white/10"
                />
                <div>
                  <div className="flex items-center gap-2">
                    <span className="font-semibold text-sm text-white">{record.personName}</span>
                    <span className={`inline-flex items-center gap-1 rounded-full border px-2 py-0.5 text-[10px] font-semibold ${badge.className}`}>
                      <span className={`h-1.5 w-1.5 rounded-full ${badge.dotColor}`}></span>
                      {badge.label}
                    </span>
                  </div>
                  <div className="text-xs text-slate-400 font-mono mt-0.5">
                    {record.classOrDept} • {record.location}
                  </div>
                </div>
              </div>

              {/* Status and Telemetry Indicators */}
              <div className="flex flex-col items-end gap-1">
                <span className="font-mono text-xs font-semibold text-cyan-300">
                  {record.timeDisplay}
                </span>
                <div className="flex items-center gap-2 text-[10px] text-slate-400 font-mono">
                  <span className="flex items-center gap-0.5 text-emerald-400" title="2FA Verified">
                    <ShieldCheck className="h-3 w-3" />
                    2FA
                  </span>
                  {record.parentNotified && (
                    <span className="flex items-center gap-0.5 text-blue-400" title="Parent Notified">
                      <MessageSquare className="h-3 w-3" />
                      Parent
                    </span>
                  )}
                  {record.googleSheetsSynced && (
                    <span className="flex items-center gap-0.5 text-emerald-400" title="Google Sheets Synced">
                      <FileSpreadsheet className="h-3 w-3" />
                      Synced
                    </span>
                  )}
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
