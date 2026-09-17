import React, { useEffect, useRef } from 'react';
import gsap from 'gsap';

interface StudentTrendGraphProps {
  percentage: number;
  trendChange?: string;
}

export const StudentTrendGraph: React.FC<StudentTrendGraphProps> = ({
  percentage,
  trendChange = '+2.8% this month'
}) => {
  const pathRef = useRef<SVGPathElement>(null);
  const areaRef = useRef<SVGPathElement>(null);

  // 12 timeline points across the past 30 days showing realistic smooth progression
  const points = [
    { day: 'Aug 10', val: 89.2 },
    { day: 'Aug 14', val: 89.8 },
    { day: 'Aug 18', val: 90.4 },
    { day: 'Aug 22', val: 90.1 },
    { day: 'Aug 26', val: 91.0 },
    { day: 'Aug 30', val: 91.5 },
    { day: 'Sep 01', val: 91.2 },
    { day: 'Sep 03', val: 91.8 },
    { day: 'Sep 05', val: 92.0 },
    { day: 'Sep 06', val: 92.1 },
    { day: 'Sep 07', val: 92.3 },
    { day: 'Today', val: percentage }
  ];

  const minVal = 85;
  const maxVal = 100;
  const width = 600;
  const height = 180;
  const paddingX = 20;
  const paddingY = 20;

  const getCoordinates = (index: number, val: number) => {
    const x = paddingX + (index / (points.length - 1)) * (width - 2 * paddingX);
    const normalizedY = (val - minVal) / (maxVal - minVal);
    const y = height - paddingY - normalizedY * (height - 2 * paddingY);
    return { x, y };
  };

  // Generate smooth SVG Catmull-Rom or cubic Bezier path
  const coords = points.map((p, i) => getCoordinates(i, p.val));
  let d = `M ${coords[0].x} ${coords[0].y}`;
  for (let i = 0; i < coords.length - 1; i++) {
    const p0 = coords[i];
    const p1 = coords[i + 1];
    const mx = (p0.x + p1.x) / 2;
    d += ` C ${mx} ${p0.y}, ${mx} ${p1.y}, ${p1.x} ${p1.y}`;
  }

  const areaD = `${d} L ${coords[coords.length - 1].x} ${height} L ${coords[0].x} ${height} Z`;

  useEffect(() => {
    if (pathRef.current) {
      const length = pathRef.current.getTotalLength();
      gsap.fromTo(
        pathRef.current,
        { strokeDasharray: length, strokeDashoffset: length },
        { strokeDashoffset: 0, duration: 1.4, ease: 'power3.out' }
      );
    }
    if (areaRef.current) {
      gsap.fromTo(
        areaRef.current,
        { opacity: 0 },
        { opacity: 0.15, duration: 1.2, delay: 0.4, ease: 'power2.out' }
      );
    }
  }, [percentage]);

  return (
    <div className="surface-card p-6 rounded-2xl relative overflow-hidden">
      {/* Header */}
      <div className="flex items-baseline justify-between mb-4">
        <div>
          <span className="text-xs font-mono uppercase tracking-wider text-slate-400">
            Your attendance is trending...
          </span>
          <div className="flex items-baseline gap-2.5 mt-1">
            <span className="text-3xl font-extrabold text-white font-mono tracking-tight">
              {percentage}%
            </span>
            <span className="text-xs font-medium text-emerald-400 font-mono">
              ↑ {trendChange}
            </span>
          </div>
        </div>
        <div className="text-right">
          <span className="text-[11px] text-slate-500 font-mono">30-Day Window</span>
        </div>
      </div>

      {/* SVG Chart */}
      <div className="w-full">
        <svg viewBox={`0 0 ${width} ${height}`} className="w-full h-auto overflow-visible">
          <defs>
            <linearGradient id="trendGradient" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#10b981" stopOpacity="0.4" />
              <stop offset="100%" stopColor="#10b981" stopOpacity="0.0" />
            </linearGradient>
          </defs>

          {/* Subtle Grid reference lines */}
          <line x1={paddingX} y1={height / 2} x2={width - paddingX} y2={height / 2} stroke="rgba(255,255,255,0.04)" strokeDasharray="3 3" />

          {/* Area Fill */}
          <path ref={areaRef} d={areaD} fill="url(#trendGradient)" />

          {/* Smooth Line */}
          <path
            ref={pathRef}
            d={d}
            fill="none"
            stroke="#10b981"
            strokeWidth="2.5"
            strokeLinecap="round"
          />

          {/* Current Day Point */}
          <circle
            cx={coords[coords.length - 1].x}
            cy={coords[coords.length - 1].y}
            r="4.5"
            fill="#10b981"
            stroke="#06090e"
            strokeWidth="2"
          />
        </svg>
      </div>

      {/* Date Labels */}
      <div className="flex justify-between text-[10px] text-slate-500 font-mono mt-2 px-1">
        <span>Aug 10</span>
        <span>Aug 22</span>
        <span>Sep 01</span>
        <span className="text-emerald-400 font-semibold">Today</span>
      </div>
    </div>
  );
};
