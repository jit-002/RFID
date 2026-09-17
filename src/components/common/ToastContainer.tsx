import React, { useState, useEffect } from 'react';
import { useApp } from '../../context/AppContext';
import { CheckCircle2, AlertCircle, AlertTriangle, Info, X } from 'lucide-react';

interface ToastItemProps {
  toast: {
    id: string;
    title: string;
    description: string;
    type?: 'SUCCESS' | 'ERROR' | 'INFO' | 'WARNING';
  };
  onDismiss: (id: string) => void;
}

const ToastItem: React.FC<ToastItemProps> = ({ toast, onDismiss }) => {
  const [isLeaving, setIsLeaving] = useState(false);

  const handleDismiss = () => {
    setIsLeaving(true);
    setTimeout(() => {
      onDismiss(toast.id);
    }, 280);
  };

  let Icon = CheckCircle2;
  let colorClasses = 'border-emerald-500/30 bg-emerald-950/90 text-emerald-300 shadow-[0_10px_30px_rgba(16,185,129,0.15)]';
  let iconColor = 'text-emerald-400';

  if (toast.type === 'ERROR') {
    Icon = AlertCircle;
    colorClasses = 'border-rose-500/30 bg-rose-950/90 text-rose-300 shadow-[0_10px_30px_rgba(244,63,94,0.15)]';
    iconColor = 'text-rose-400';
  } else if (toast.type === 'WARNING') {
    Icon = AlertTriangle;
    colorClasses = 'border-amber-500/30 bg-amber-950/90 text-amber-300 shadow-[0_10px_30px_rgba(245,158,11,0.15)]';
    iconColor = 'text-amber-400';
  } else if (toast.type === 'INFO') {
    Icon = Info;
    colorClasses = 'border-cyan-500/30 bg-cyan-950/90 text-cyan-300 shadow-[0_10px_30px_rgba(6,182,212,0.15)]';
    iconColor = 'text-cyan-400';
  }

  return (
    <div
      className={`pointer-events-auto flex items-start gap-3 rounded-2xl border p-3.5 backdrop-blur-xl transition-all duration-300 ${
        isLeaving
          ? 'opacity-0 translate-y-3 scale-95 pointer-events-none'
          : 'opacity-100 translate-y-0 scale-100 animate-in fade-in slide-in-from-bottom-5'
      } ${colorClasses}`}
    >
      <Icon className={`h-5 w-5 shrink-0 mt-0.5 ${iconColor}`} />
      <div className="flex-1 text-xs pr-1">
        <h4 className="font-semibold text-white tracking-wide">{toast.title}</h4>
        <p className="mt-0.5 opacity-90 leading-relaxed text-[11px]">{toast.description}</p>
      </div>
      <button
        onClick={handleDismiss}
        className="shrink-0 p-1 text-white/50 hover:text-white rounded-lg hover:bg-white/10 transition-colors"
        title="Dismiss notification"
      >
        <X className="h-4 w-4" />
      </button>
    </div>
  );
};

export const ToastContainer: React.FC = () => {
  const { toasts, dismissToast } = useApp();

  if (toasts.length === 0) return null;

  return (
    <aside aria-label="System Notifications" className="fixed bottom-5 right-5 z-50 flex max-w-sm flex-col gap-2.5 pointer-events-none">
      {toasts.map((toast) => (
        <ToastItem key={toast.id} toast={toast} onDismiss={dismissToast} />
      ))}
    </aside>
  );
};
