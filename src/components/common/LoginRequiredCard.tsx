import React from 'react';
import { ShieldCheck, LogIn, ArrowLeft, Lock } from 'lucide-react';

interface LoginRequiredCardProps {
  title?: string;
  description?: string;
  onLogin: () => void;
  onBack: () => void;
}

export const LoginRequiredCard: React.FC<LoginRequiredCardProps> = ({
  title = 'Authentication Required',
  description = 'PVM Sathi 2.0 and Sathi Quiz are private academic tools available only to enrolled students and authorized faculty.',
  onLogin,
  onBack
}) => {
  return (
    <div className="min-h-[80vh] flex items-center justify-center p-4">
      <div className="w-full max-w-md rounded-3xl border border-white/10 bg-gradient-to-b from-[#0c1424] to-[#0A0E17] p-8 text-center shadow-2xl space-y-6 relative overflow-hidden backdrop-blur-xl">
        <div className="absolute -top-12 -right-12 w-40 h-40 bg-cyan-500/10 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute -bottom-12 -left-12 w-40 h-40 bg-amber-500/10 rounded-full blur-3xl pointer-events-none" />

        {/* Lock Icon */}
        <div className="relative mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-to-br from-amber-500/20 to-cyan-500/20 border border-white/15 text-amber-400 shadow-glow-cyan">
          <Lock className="h-8 w-8" />
        </div>

        {/* Text */}
        <div className="space-y-2">
          <h2 className="text-xl font-black text-white tracking-tight">
            {title}
          </h2>
          <p className="text-xs text-slate-400 leading-relaxed max-w-xs mx-auto">
            {description}
          </p>
        </div>

        {/* Guardrail badge */}
        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-slate-900/80 border border-white/10 text-[11px] font-mono text-cyan-300">
          <ShieldCheck className="h-3.5 w-3.5 text-cyan-400" />
          <span>Student & Staff Data Isolation Protected</span>
        </div>

        {/* Action Buttons */}
        <div className="space-y-2.5 pt-2">
          <button
            onClick={onLogin}
            className="w-full flex items-center justify-center gap-2 py-3 rounded-xl bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-slate-950 font-bold text-xs tracking-wide shadow-lg shadow-cyan-500/20 transition-all active:scale-95"
          >
            <LogIn className="h-4 w-4" />
            <span>Sign In with School Credentials</span>
          </button>

          <button
            onClick={onBack}
            className="w-full flex items-center justify-center gap-2 py-2.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-xs font-semibold text-slate-300 border border-white/10 transition-colors"
          >
            <ArrowLeft className="h-3.5 w-3.5" />
            <span>Return to Public Overview</span>
          </button>
        </div>
      </div>
    </div>
  );
};
