import React from 'react';

interface AttendanceRingProps {
  percentage: number;
  size?: number;
  strokeWidth?: number;
  label?: string;
  sublabel?: string;
  color?: string;
}

export const AttendanceRing: React.FC<AttendanceRingProps> = ({
  percentage,
  size = 140,
  strokeWidth = 12,
  label = 'Attendance',
  sublabel = 'Overall',
  color = '#06b6d4' // cyan default
}) => {
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference - (percentage / 100) * circumference;

  return (
    <div className="relative flex flex-col items-center justify-center" style={{ width: size, height: size }}>
      <svg width={size} height={size} className="-rotate-90 transform">
        {/* Background Track */}
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          stroke="currentColor"
          strokeWidth={strokeWidth}
          className="text-slate-800/80"
          fill="transparent"
        />
        {/* Animated Progress Ring */}
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          stroke={color}
          strokeWidth={strokeWidth}
          strokeDasharray={circumference}
          strokeDashoffset={strokeDashoffset}
          strokeLinecap="round"
          fill="transparent"
          style={{
            transition: 'stroke-dashoffset 1s cubic-bezier(0.2, 0.8, 0.2, 1)'
          }}
        />
      </svg>
      {/* Center Label */}
      <div className="absolute flex flex-col items-center justify-center text-center">
        <span className="text-2xl font-extrabold tracking-tight text-white font-mono">
          {percentage}%
        </span>
        <span className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider">
          {label}
        </span>
      </div>
    </div>
  );
};
