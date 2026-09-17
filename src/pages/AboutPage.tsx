import React, { useEffect, useRef } from 'react';
import gazeFrames from '../data/gaze-frames.json';
import { ArrowLeft, ExternalLink, Shield, Sparkles, BookOpen, Award } from 'lucide-react';

const TAU = Math.PI * 2;
const wrappedAngle = (angle: number) => (angle % TAU + TAU) % TAU;

function timeForAngle(angle: number) {
  const target = wrappedAngle(angle);
  let nearestTime = gazeFrames[0][1];
  let nearestDistance = Infinity;
  for (const [sampleAngle, time] of gazeFrames) {
    const difference = Math.abs(target - sampleAngle);
    const distance = Math.min(difference, TAU - difference);
    if (distance < nearestDistance) {
      nearestDistance = distance;
      nearestTime = time;
    }
  }
  return nearestTime + 1 / 240;
}

interface AboutPageProps {
  onNavigate: (tab: string) => void;
}

export const AboutPage: React.FC<AboutPageProps> = ({ onNavigate }) => {
  const videoRef = useRef<HTMLVideoElement>(null);

  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;

    let frame = 0;
    let desiredTime = 0;
    let pointer: { x: number; y: number } | null = null;
    let disposed = false;
    const mobile = window.matchMedia('(max-width: 700px)');
    const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)');

    const seek = () => {
      frame = 0;
      if (disposed || mobile.matches || video.readyState < 2 || video.seeking) return;
      if (Math.abs(video.currentTime - desiredTime) > 1 / 48) {
        video.currentTime = Math.min(desiredTime, video.duration - 1 / 24);
      }
    };

    const schedule = () => {
      if (!frame) frame = requestAnimationFrame(seek);
    };

    const updateTarget = () => {
      if (mobile.matches || !pointer) return;
      const rect = video.getBoundingClientRect();
      const scale = Math.max(rect.width / 1920, rect.height / 1080);
      const eyeX = rect.left + rect.width / 2 + (948 - 960) * scale;
      const eyeY = rect.top + rect.height / 2 + (418 - 540) * scale;
      const dx = pointer.x - eyeX;
      const dy = pointer.y - eyeY;
      if (Math.hypot(dx, dy) > 8) {
        desiredTime = timeForAngle(Math.atan2(dy, dx));
        schedule();
      }
    };

    const move = (event: PointerEvent) => {
      pointer = { x: event.clientX, y: event.clientY };
      updateTarget();
    };

    const ready = () => {
      video.loop = mobile.matches;
      if (mobile.matches && !reducedMotion.matches) {
        void video.play().catch(() => {});
      } else {
        video.pause();
        if (!mobile.matches) {
          updateTarget();
          schedule();
        }
      }
    };

    video.addEventListener('seeked', schedule);
    video.addEventListener('loadeddata', ready);
    mobile.addEventListener('change', ready);
    reducedMotion.addEventListener('change', ready);
    window.addEventListener('pointermove', move, { passive: true });
    window.addEventListener('resize', updateTarget);
    window.addEventListener('scroll', updateTarget, { passive: true });

    if (video.readyState >= 2) ready();

    return () => {
      disposed = true;
      cancelAnimationFrame(frame);
      video.removeEventListener('seeked', schedule);
      video.removeEventListener('loadeddata', ready);
      mobile.removeEventListener('change', ready);
      reducedMotion.removeEventListener('change', ready);
      window.removeEventListener('pointermove', move);
      window.removeEventListener('resize', updateTarget);
      window.removeEventListener('scroll', updateTarget);
    };
  }, []);

  return (
    <div className="relative min-h-screen bg-[#dfe4f2] text-[#080909] overflow-hidden selection:bg-[#080909] selection:text-white font-sans">
      {/* Top Floating Control Bar */}
      <div className="relative z-30 flex items-center justify-between px-6 py-4 border-b border-black/[0.06] bg-white/40 backdrop-blur-md">
        <button
          onClick={() => onNavigate('landing')}
          className="inline-flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-[#080909] hover:opacity-75 transition-opacity"
        >
          <ArrowLeft className="h-4 w-4" />
          <span>Back to Dashboard</span>
        </button>

        <div className="flex items-center gap-2">
          <span className="text-[11px] font-mono text-[#080909]/70">
            Interactive Eye-Gaze Tracking Active (Move Cursor)
          </span>
          <span className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse"></span>
        </div>
      </div>

      {/* Main Interactive Footer Canvas */}
      <footer
        className="relative min-h-[calc(100vh-60px)] pt-[6.54vw] pb-16 isolate overflow-hidden max-md:flex max-md:flex-col max-md:gap-8 max-md:p-6"
        aria-label="Footer"
      >
        {/* Background Video Layer with Scrubbing */}
        <div className="absolute inset-0 -z-10 pointer-events-none max-md:relative max-md:inset-auto max-md:order-4 max-md:w-full max-md:aspect-[4/3] max-md:mt-4">
          <video
            ref={videoRef}
            muted
            playsInline
            preload="auto"
            src="https://d8j0ntlcm91z4.cloudfront.net/user_38xzZboKViGWJOttwIXH07lWA1P/hf_20260908_073327_03643c0a-db33-417a-ae8f-4a39259c7f9c.mp4"
            className="absolute inset-0 w-full h-full object-cover object-center max-md:rounded-2xl"
          />
        </div>

        {/* Left Information Column */}
        <div className="ml-[8.65vw] w-[25vw] max-md:m-0 max-md:w-full max-md:order-1">
          <span className="inline-flex items-center rounded-full bg-[#f7f8fa] px-[0.61vw] py-[0.39vw] text-[0.88vw] max-md:text-xs max-md:px-3 max-md:py-1 font-medium shadow-sm border border-black/5">
            Pranabananda Vidyamandir
          </span>
          <h2 className="block mt-[1.45vw] text-[1.66vw] max-md:text-2xl font-black leading-tight tracking-tight text-[#080909]">
            Where Vision<br />Meets Verification
          </h2>
          <div className="flex flex-col items-start gap-[0.93vw] mt-[1.3vw] text-[1.075vw] max-md:text-sm max-md:gap-3 font-semibold text-[#080909]/80">
            <button
              onClick={() => onNavigate('landing')}
              className="hover:text-black hover:translate-x-1 transition-all text-left"
            >
              • Overview & Real-Time Campus Telemetry
            </button>
            <button
              onClick={() => onNavigate('staff')}
              className="hover:text-black hover:translate-x-1 transition-all text-left"
            >
              • Faculty & Staff Directory (pvmlumding.com)
            </button>
            <button
              onClick={() => onNavigate('student')}
              className="hover:text-black hover:translate-x-1 transition-all text-left"
            >
              • Student Attendance & CBSE 75% Rules
            </button>
            <button
              onClick={() => onNavigate('diagnostics')}
              className="hover:text-black hover:translate-x-1 transition-all text-left"
            >
              • Hardware & Realtime Diagnostics
            </button>
          </div>
        </div>

        {/* Center Emblem / Brand Logo */}
        <div
          className="absolute left-[40.33vw] top-[7.7vw] w-[17vw] max-md:static max-md:w-full max-md:order-0 max-md:mb-2"
          role="img"
          aria-label="Studio logo"
        >
          <div className="p-4 rounded-2xl bg-white/40 backdrop-blur-md border border-white/60 shadow-lg text-center">
            <div className="flex items-center justify-center gap-2">
              <Shield className="h-6 w-6 text-[#080909]" />
              <span className="text-xl font-black tracking-tighter">SmartX</span>
            </div>
            <p className="text-[11px] font-bold text-[#080909]/70 mt-1 uppercase tracking-wider">
              CBSE Affiliation #230043
            </p>
            <p className="text-[10px] text-[#080909]/60">
              Bharat Sevashram Sangha • Lumding
            </p>
          </div>
        </div>

        {/* Right Contact / Pillars Column */}
        <div className="absolute left-[74.3vw] top-[6.54vw] w-[20vw] max-md:static max-md:w-full max-md:order-2">
          <span className="inline-flex items-center rounded-full bg-[#f7f8fa] px-[0.61vw] py-[0.39vw] text-[0.88vw] max-md:text-xs max-md:px-3 max-md:py-1 font-medium shadow-sm border border-black/5">
            Core Pillars
          </span>
          <div className="flex flex-col items-start mt-[1.45vw] text-[1.66vw] max-md:text-xl font-black leading-tight text-[#080909]">
            <span>Self-Sacrifice</span>
            <span>Self-Discipline*</span>
          </div>
          <p className="mt-[1.05vw] text-[0.733vw] max-md:text-xs leading-relaxed text-[#080909]/80">
            *“They only live, who live for others the rest are more dead than alive.” — Srimat Swami Pranabanandaji Maharaj
          </p>

          <div className="flex items-center gap-[1.43vw] max-md:gap-4 mt-[1.61vw]">
            <a
              href="https://pvmlumding.com"
              target="_blank"
              rel="noopener noreferrer"
              className="p-2.5 rounded-full bg-white/80 hover:bg-white text-[#080909] shadow-sm border border-black/10 transition-transform hover:scale-105"
              title="Official School Website"
            >
              <ExternalLink className="h-4 w-4" />
            </a>
            <button
              onClick={() => onNavigate('diagnostics')}
              className="p-2.5 rounded-full bg-white/80 hover:bg-white text-[#080909] shadow-sm border border-black/10 transition-transform hover:scale-105"
              title="Perimeter Diagnostics"
            >
              <Sparkles className="h-4 w-4" />
            </button>
            <button
              onClick={() => onNavigate('admin')}
              className="p-2.5 rounded-full bg-white/80 hover:bg-white text-[#080909] shadow-sm border border-black/10 transition-transform hover:scale-105"
              title="Staff & Student Registry"
            >
              <BookOpen className="h-4 w-4" />
            </button>
          </div>
        </div>
      </footer>
    </div>
  );
};
