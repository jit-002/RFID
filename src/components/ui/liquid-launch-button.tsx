import React, { useState, useRef, useEffect } from 'react';
import { Sparkles, Bot } from 'lucide-react';
import { GlassFilter } from './liquid-glass-button';

interface LiquidLaunchButtonProps {
  onClick?: () => void;
  className?: string;
}

export const LiquidLaunchButton: React.FC<LiquidLaunchButtonProps> = ({ onClick, className = '' }) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const [mousePos, setMousePos] = useState({ x: 0.5, y: 0.5 });
  const [lerpPos, setLerpPos] = useState({ x: 0.5, y: 0.5 });
  const [isHovered, setIsHovered] = useState(false);
  const [isPressed, setIsPressed] = useState(false);

  // Smooth spring lerp for the backlight vortex following the mouse
  useEffect(() => {
    let animationFrameId: number;
    const animate = () => {
      setLerpPos(prev => ({
        x: prev.x + (mousePos.x - prev.x) * 0.1,
        y: prev.y + (mousePos.y - prev.y) * 0.1
      }));
      animationFrameId = requestAnimationFrame(animate);
    };
    animationFrameId = requestAnimationFrame(animate);
    return () => cancelAnimationFrame(animationFrameId);
  }, [mousePos]);

  // Global pointer move listener when hovering container
  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!containerRef.current) return;
    const rect = containerRef.current.getBoundingClientRect();
    const x = Math.max(0, Math.min(1, (e.clientX - rect.left) / rect.width));
    const y = Math.max(0, Math.min(1, (e.clientY - rect.top) / rect.height));
    setMousePos({ x, y });
  };

  const handleMouseEnter = () => setIsHovered(true);
  const handleMouseLeave = () => {
    setIsHovered(false);
    setMousePos({ x: 0.5, y: 0.5 });
  };

  // Convert normalized lerp position to coordinates & transform
  const offsetX = (lerpPos.x - 0.5) * 80;
  const offsetY = (lerpPos.y - 0.5) * 60;
  const rotationAngle = (lerpPos.x - 0.5) * 45;

  return (
    <div
      ref={containerRef}
      onMouseMove={handleMouseMove}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
      className={`relative flex items-center justify-center p-12 select-none pointer-events-auto ${className}`}
    >
      {/* 1. Dynamic Interactive Aurora & Liquid Vortex Backlight (Behind the Glass) */}
      <div className="absolute inset-0 pointer-events-none flex items-center justify-center overflow-visible">
        {/* Primary Liquid Swirl (Matches screenshot purple vortex) */}
        <div
          className="absolute w-72 h-72 rounded-full transition-transform duration-75 ease-out"
          style={{
            transform: `translate3d(${offsetX}px, ${offsetY}px, 0) rotate(${rotationAngle}deg) scale(${isHovered ? 1.25 : 1.0})`,
            filter: 'blur(32px)',
            background: `radial-gradient(ellipse at center, rgba(168, 85, 247, ${isHovered ? '0.75' : '0.45'}) 0%, rgba(139, 92, 246, 0.4) 35%, rgba(6, 182, 212, 0.25) 60%, transparent 80%)`
          }}
        />

        {/* Secondary Twisted Fluid Ray Ribbon */}
        <div
          className="absolute w-80 h-32 rounded-[100%] transition-transform duration-100 ease-out"
          style={{
            transform: `translate3d(${offsetX * 1.3}px, ${offsetY * 1.2}px, 0) rotate(${-rotationAngle * 1.5 + 25}deg) scale(${isHovered ? 1.3 : 1.05})`,
            filter: 'blur(24px)',
            background: `linear-gradient(135deg, rgba(192, 132, 252, ${isHovered ? '0.8' : '0.5'}) 0%, rgba(99, 102, 241, 0.5) 45%, rgba(34, 211, 238, 0.4) 80%, transparent 100%)`
          }}
        />

        {/* Ambient Neon Filament Stream */}
        <div
          className="absolute w-64 h-64 border-[3px] border-violet-400/40 rounded-full transition-all duration-150 ease-out"
          style={{
            transform: `translate3d(${offsetX * 0.7}px, ${offsetY * 0.8}px, 0) scale(${isHovered ? 1.15 : 0.95}) rotate(${rotationAngle * 2}deg)`,
            filter: 'blur(8px)',
            boxShadow: `0 0 40px rgba(168, 85, 247, ${isHovered ? '0.8' : '0.4'})`
          }}
        />
      </div>

      {/* 2. Pure Liquid Glass Pill Button */}
      <button
        onClick={onClick}
        onMouseDown={() => setIsPressed(true)}
        onMouseUp={() => setIsPressed(false)}
        onTouchStart={() => setIsPressed(true)}
        onTouchEnd={() => setIsPressed(false)}
        className={`relative z-10 flex items-center justify-center gap-3 px-8 py-4 rounded-full transition-all duration-300 cursor-pointer outline-none ${
          isPressed ? 'scale-95' : isHovered ? 'scale-105' : 'scale-100'
        }`}
        style={{
          boxShadow: isHovered
            ? '0 12px 40px rgba(0, 0, 0, 0.4), 0 0 35px rgba(168, 85, 247, 0.45), inset 0 1px 2px rgba(255, 255, 255, 0.8), inset 0 -2px 4px rgba(0, 0, 0, 0.3)'
            : '0 8px 30px rgba(0, 0, 0, 0.35), 0 0 20px rgba(139, 92, 246, 0.25), inset 0 1px 2px rgba(255, 255, 255, 0.6), inset 0 -2px 4px rgba(0, 0, 0, 0.25)'
        }}
      >
        {/* Liquid Glass Refraction Layer (Uses SVG turbulence from button.md) */}
        <div
          className="absolute inset-0 rounded-full pointer-events-none -z-10"
          style={{
            backdropFilter: 'url("#container-glass") blur(16px)',
            WebkitBackdropFilter: 'url("#container-glass") blur(16px)',
            background: 'rgba(255, 255, 255, 0.12)'
          }}
        />

        {/* Specular Rim Gloss & Highlights */}
        <div
          className="absolute inset-0 rounded-full pointer-events-none"
          style={{
            boxShadow: `
              0 0 6px rgba(0,0,0,0.04),
              0 2px 6px rgba(0,0,0,0.1),
              inset 3px 3px 1px -3px rgba(255,255,255,0.9),
              inset -3px -3px 1px -3px rgba(255,255,255,0.7),
              inset 1px 1px 1px -0.5px rgba(255,255,255,0.8),
              inset -1px -1px 1px -0.5px rgba(255,255,255,0.6),
              inset 0 0 8px 4px rgba(255,255,255,0.15)
            `
          }}
        />

        {/* Content Inside Button */}
        <div className="relative z-20 flex items-center gap-2.5 text-white">
          <div className="flex h-7 w-7 items-center justify-center rounded-full bg-white/20 border border-white/40 shadow-sm backdrop-blur-md">
            <Sparkles className="h-4 w-4 text-white animate-pulse" />
          </div>
          <span className="text-base font-bold tracking-tight text-white drop-shadow-[0_1px_2px_rgba(0,0,0,0.8)] whitespace-nowrap font-sans">
            Launch Study Sathi
          </span>
          <span className="px-2 py-0.5 rounded-full text-[10px] font-mono font-bold bg-white/20 text-white border border-white/30 backdrop-blur-md">
            2.0
          </span>
        </div>

        {/* SVG Filter for Glass Distortion */}
        <GlassFilter />
      </button>
    </div>
  );
};
