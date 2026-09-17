import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';
import { AttendanceStatus } from '../types';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatDate(dateStr: string): string {
  try {
    const d = new Date(dateStr);
    return d.toLocaleDateString('en-US', {
      weekday: 'short',
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    });
  } catch {
    return dateStr;
  }
}

export function formatTime(timestamp: string): string {
  try {
    const d = new Date(timestamp);
    return d.toLocaleTimeString('en-US', {
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
      hour12: true
    });
  } catch {
    return timestamp;
  }
}

export function getStatusBadge(status: AttendanceStatus): {
  label: string;
  className: string;
  dotColor: string;
} {
  switch (status) {
    case 'PRESENT':
      return {
        label: 'Present',
        className: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20',
        dotColor: 'bg-emerald-400'
      };
    case 'LATE':
      return {
        label: 'Late',
        className: 'bg-amber-500/10 text-amber-400 border-amber-500/20',
        dotColor: 'bg-amber-400'
      };
    case 'ABSENT':
      return {
        label: 'Absent',
        className: 'bg-rose-500/10 text-rose-400 border-rose-500/20',
        dotColor: 'bg-rose-400'
      };
    case 'HALF_DAY':
      return {
        label: 'Half Day',
        className: 'bg-cyan-500/10 text-cyan-400 border-cyan-500/20',
        dotColor: 'bg-cyan-400'
      };
    case 'LEAVE':
      return {
        label: 'On Leave',
        className: 'bg-violet-500/10 text-violet-400 border-violet-500/20',
        dotColor: 'bg-violet-400'
      };
    case 'MANUALLY_CORRECTED':
      return {
        label: 'Corrected',
        className: 'bg-blue-500/10 text-blue-400 border-blue-500/20',
        dotColor: 'bg-blue-400'
      };
    case 'VERIFICATION_FAILED':
      return {
        label: 'Auth Failed',
        className: 'bg-red-600/20 text-red-400 border-red-500/30',
        dotColor: 'bg-red-500'
      };
    default:
      return {
        label: status,
        className: 'bg-slate-500/10 text-slate-400 border-slate-500/20',
        dotColor: 'bg-slate-400'
      };
  }
}
