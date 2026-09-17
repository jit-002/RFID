import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import {
  Camera,
  Fingerprint,
  CheckCircle2,
  XCircle,
  ShieldCheck,
  User,
  Radio,
  X,
  ScanLine
} from 'lucide-react';

export const VerificationModal: React.FC = () => {
  const {
    activeVerificationSession,
    resolveBiometricChallenge,
    cancelVerificationSession
  } = useApp();

  const [isProcessing, setIsProcessing] = useState(false);

  if (!activeVerificationSession) return null;

  const isFace = activeVerificationSession.challengeMethod === 'FACE';

  const handleResolve = (success: boolean) => {
    setIsProcessing(true);
    setTimeout(() => {
      resolveBiometricChallenge(success);
      setIsProcessing(false);
    }, 600);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/85 p-4 backdrop-blur-xl animate-in fade-in duration-200">
      <div
        className="relative w-full max-w-md overflow-hidden rounded-3xl border border-cyan-500/40 bg-obsidian-900 shadow-2xl"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Top Status Banner */}
        <div className="flex items-center justify-between border-b border-white/[0.08] bg-obsidian-950 px-6 py-3.5">
          <div className="flex items-center gap-2">
            <span className="relative flex h-2.5 w-2.5">
              <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-cyan-400 opacity-75"></span>
              <span className="relative inline-flex h-2.5 w-2.5 rounded-full bg-cyan-500"></span>
            </span>
            <span className="font-mono text-xs font-semibold text-cyan-400 uppercase tracking-wider">
              2FA Biometric Challenge Active
            </span>
          </div>
          <button
            onClick={cancelVerificationSession}
            className="rounded-lg p-1 text-slate-400 hover:bg-white/10 hover:text-white"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        <div className="p-6 text-center">
          {/* Identified Student Header */}
          <div className="relative mx-auto mb-4 h-24 w-24 overflow-hidden rounded-full border-2 border-cyan-400/80 p-1 shadow-glow-cyan">
            <img
              src={activeVerificationSession.avatarUrl}
              alt={activeVerificationSession.personName}
              className="h-full w-full rounded-full object-cover"
            />
            {/* Hologram Scan Line overlay */}
            <div className="absolute inset-0 bg-gradient-to-b from-transparent via-cyan-400/20 to-transparent animate-scan"></div>
          </div>

          <h3 className="text-xl font-bold text-white tracking-tight">
            {activeVerificationSession.personName}
          </h3>
          <p className="text-xs text-slate-400 font-mono mt-0.5">
            {activeVerificationSession.classOrDept} • {activeVerificationSession.rfidUid}
          </p>

          {/* Biometric Sensor HUD */}
          <div className="my-5 relative overflow-hidden rounded-2xl border border-white/[0.1] bg-slate-950/80 p-5">
            <div className="flex flex-col items-center justify-center">
              {isFace ? (
                <div className="relative flex h-16 w-16 items-center justify-center rounded-2xl bg-cyan-500/10 text-cyan-400 border border-cyan-500/30">
                  <Camera className="h-8 w-8" />
                  <div className="absolute inset-0 rounded-2xl border border-cyan-400 animate-pulse"></div>
                </div>
              ) : (
                <div className="relative flex h-16 w-16 items-center justify-center rounded-2xl bg-violet-500/10 text-violet-400 border border-violet-500/30">
                  <Fingerprint className="h-8 w-8" />
                  <div className="absolute inset-0 rounded-2xl border border-violet-400 animate-pulse"></div>
                </div>
              )}

              <h4 className="mt-3 text-sm font-semibold text-white">
                {isFace ? 'Facial Geometry Alignment' : 'Optical Fingerprint Scanner'}
              </h4>
              <p className="mt-1 text-xs text-slate-400">
                {isFace ? 'Look directly into the kiosk camera' : 'Place registered thumb firmly on optical glass'}
              </p>
            </div>
          </div>

          {/* 2FA Action Triggers */}
          <div className="grid grid-cols-2 gap-3">
            <button
              disabled={isProcessing}
              onClick={() => handleResolve(true)}
              className="flex items-center justify-center gap-2 rounded-2xl bg-emerald-500 p-3 text-xs font-bold text-obsidian-950 shadow-glow-emerald transition-all hover:bg-emerald-400 active:scale-95 disabled:opacity-50"
            >
              <CheckCircle2 className="h-4 w-4" />
              <span>CONFIRM 2FA (PASS)</span>
            </button>

            <button
              disabled={isProcessing}
              onClick={() => handleResolve(false)}
              className="flex items-center justify-center gap-2 rounded-2xl border border-rose-500/40 bg-rose-500/20 p-3 text-xs font-bold text-rose-300 shadow-glow-rose transition-all hover:bg-rose-500/30 active:scale-95 disabled:opacity-50"
            >
              <XCircle className="h-4 w-4" />
              <span>SIMULATE REJECT</span>
            </button>
          </div>

          <div className="mt-3 text-[11px] text-slate-500">
            Node: {activeVerificationSession.deviceId} • Sub-second biometric template matching
          </div>
        </div>
      </div>
    </div>
  );
};
