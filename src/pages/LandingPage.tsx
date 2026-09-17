import React from 'react';
import { useApp } from '../context/AppContext';
import { HandwritingText } from '../components/ui/handwriting-text';
import { DancingLetters } from '../components/ui/dancing-letters';
import { FeatureCard } from '../components/ui/glow-card';
import {
  Sparkles,
  Cpu,
  FileSpreadsheet,
  Users,
  ShieldCheck,
  ArrowRight,
  Radio,
  BookOpen,
  Activity,
  CheckCircle2
} from 'lucide-react';

interface LandingPageProps {
  onNavigate: (tab: string) => void;
}

export const LandingPage: React.FC<LandingPageProps> = ({ onNavigate }) => {
  const { students, staff, attendance, devices, dateWiseSheets, isAuthenticated, userRole, openAIDrawer } = useApp();

  const presentStudents = attendance.filter(a => a.personType === 'STUDENT' && a.status === 'PRESENT').length;
  const presentStaff = staff.filter(s => s.status === 'ACTIVE').length;

  return (
    <div className="relative min-h-screen bg-[#000000] text-white selection:bg-cyan-500/30 selection:text-cyan-200 overflow-x-hidden">
      {/* Background Ambient CloudFront Hero Video */}
      <div className="absolute inset-0 z-0 pointer-events-none opacity-40 overflow-hidden">
        <video
          autoPlay
          loop
          muted
          playsInline
          src="https://d8j0ntlcm91z4.cloudfront.net/user_38xzZboKViGWJOttwIXH07lWA1P/hf_20260818_072341_50851634-bbc3-4c33-9acc-7647d4db44aa.mp4"
          className="w-full h-full object-cover object-center"
        />
        <div className="absolute inset-0 bg-gradient-to-b from-black/80 via-black/40 to-black pointer-events-none" />
      </div>

      {/* Hero Container */}
      <div className="relative z-10 mx-auto max-w-6xl px-4 sm:px-6 lg:px-8 pt-12 sm:pt-20 pb-16 flex flex-col items-center text-center">
        {/* Interactive Physics Dancing Letters & School Crest */}
        <div className="flex flex-col items-center gap-3 mb-6 animate-in fade-in duration-700">
          <div className="flex flex-col sm:flex-row items-center gap-3">
            <img src="/school-logo.jpg" alt="Logo" className="h-12 w-12 sm:h-14 sm:w-14 rounded-2xl object-cover border border-amber-500/40 shadow-[0_0_25px_rgba(245,158,11,0.35)]" />
            <div className="py-1">
              <DancingLetters
                text="Pranabananda Vidyamandir"
                className="justify-center"
                letterClassName="text-2xl sm:text-4xl md:text-5xl font-display font-bold bg-gradient-to-r from-amber-300 via-yellow-200 to-amber-400 bg-clip-text text-transparent hover:text-cyan-400"
              />
            </div>
          </div>
          <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full border border-amber-500/30 bg-amber-500/10 text-amber-300 text-xs font-mono">
            <Sparkles className="h-3.5 w-3.5 text-amber-400" />
            <span>CBSE Affiliation #230043 • Estd. 1983 • Lumding, Assam</span>
          </div>
        </div>

        {/* H1 Main Branding with Handwriting Text */}
        <h1 className="text-4xl sm:text-6xl md:text-7xl font-extrabold tracking-tight text-white max-w-4xl leading-[1.12]">
          SmartX: Where Vision Meets{' '}
          <span className="bg-gradient-to-r from-cyan-400 via-teal-300 to-emerald-400 bg-clip-text text-transparent">
            Verification
          </span>
          <br />
          <span className="text-2xl sm:text-4xl md:text-5xl font-medium text-slate-300 block mt-2">
            Verification is{' '}
            <HandwritingText
              words={['instantaneous.', 'predictive.', 'live.', 'seamless.']}
              className="text-cyan-400"
              height="1.15em"
            />
          </span>
        </h1>

        {/* Lede Description */}
        <p className="mt-6 max-w-2xl text-sm sm:text-base text-slate-400 leading-relaxed">
          The next-generation digital operating system for Pranabananda Vidyamandir Lumding.
          Zero-Trust physical attendance, date-wise Google Sheets automation, and real-time Google Gemini conversational intelligence.
        </p>

        {/* Liquid Metal Action Buttons */}
        <div className="mt-8 flex flex-wrap items-center justify-center gap-3">
          {/* Primary Solid Button */}
          <button
            onClick={() => onNavigate(isAuthenticated ? (userRole === 'STUDENT' ? 'student' : userRole === 'STAFF' ? 'staff' : userRole === 'EMPLOYEE' ? 'employee' : 'admin') : 'login')}
            className="group relative inline-flex items-center justify-center gap-2 px-6 py-3 rounded-xl font-bold text-xs sm:text-sm text-black bg-gradient-to-b from-white via-zinc-200 to-zinc-300 hover:brightness-110 transition-all shadow-[0_0_26px_rgba(186,208,255,0.4),0_8px_18px_rgba(255,255,255,0.14)] active:scale-95"
          >
            <span>{isAuthenticated ? 'Open My Institutional Portal' : 'Access Portal (Sign In)'}</span>
            <ArrowRight className="h-4 w-4 group-hover:translate-x-1 transition-transform" />
          </button>

          {/* About School Button */}
          <button
            onClick={() => onNavigate('about')}
            className="group relative inline-flex items-center justify-center gap-2 px-6 py-3 rounded-xl font-semibold text-xs sm:text-sm text-white border border-white/20 bg-white/[0.06] hover:bg-white/[0.12] transition-all active:scale-95"
          >
            <BookOpen className="h-4 w-4 text-emerald-400" />
            <span>About PVM Lumding</span>
          </button>
        </div>

        {/* Realtime Live Telemetry Banner */}
        <div className="mt-14 w-full grid grid-cols-2 md:grid-cols-4 gap-3 text-left">
          <div className="p-4 rounded-2xl border border-white/10 bg-zinc-950/70 backdrop-blur-md">
            <span className="text-[10px] font-mono text-slate-400 uppercase">Enrolled Students</span>
            <div className="text-2xl font-black text-white font-mono mt-0.5">{students.length}</div>
            <span className="text-[11px] text-cyan-400 flex items-center gap-1 mt-1">
              <span className="h-1.5 w-1.5 rounded-full bg-cyan-400 animate-pulse"></span>
              PVM Lumding Roster
            </span>
          </div>

          <div className="p-4 rounded-2xl border border-white/10 bg-zinc-950/70 backdrop-blur-md">
            <span className="text-[10px] font-mono text-slate-400 uppercase">Faculty Turnout</span>
            <div className="text-2xl font-black text-emerald-400 font-mono mt-0.5">{presentStaff} Verified</div>
            <span className="text-[11px] text-emerald-500/90 mt-1 block">99.2% Teaching Staff Rate</span>
          </div>

          <div className="p-4 rounded-2xl border border-white/10 bg-zinc-950/70 backdrop-blur-md">
            <span className="text-[10px] font-mono text-slate-400 uppercase">Perimeter Nodes</span>
            <div className="text-2xl font-black text-white font-mono mt-0.5">{devices.length} Online</div>
            <span className="text-[11px] text-slate-400 mt-1 block">Raspberry Pi 3B & ESP8266</span>
          </div>

          <div className="p-4 rounded-2xl border border-white/10 bg-zinc-950/70 backdrop-blur-md">
            <span className="text-[10px] font-mono text-slate-400 uppercase">Google Sheets Sync</span>
            <div className="text-2xl font-black text-white font-mono mt-0.5">Automated</div>
            <span className="text-[11px] text-emerald-400 mt-1 block">Date-Wise Separation Active</span>
          </div>
        </div>
      </div>

      {/* Glowing Feature Cards Navigation Section */}
      <div className="relative z-10 mx-auto max-w-6xl px-4 sm:px-6 lg:px-8 py-12">
        <div className="text-center mb-10 space-y-2">
          <span className="text-[11px] font-mono uppercase tracking-widest text-cyan-400">
            Intelligent Infrastructure
          </span>
          <h2 className="text-2xl sm:text-3xl font-bold text-white tracking-tight">
            Engineered for Precision & Security
          </h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <FeatureCard
            title="Realtime IoT Stream"
            description="Raspberry Pi 3B perimeter turnstiles and ESP8266 classroom nodes streaming encrypted check-ins with anti-replay protection."
            icon={<Cpu className="h-6 w-6 text-pink-400" />}
            gradient="linear-gradient(137deg, #FF3D77 0%, #FFB1CE 45%, #FF9D3C 100%)"
            delay={0.1}
            badge="Hardware"
            onClick={() => onNavigate('diagnostics')}
          />

          <FeatureCard
            title="Pvm Sathi"
            description="Personalized conversational AI trained on Pranabananda Vidyamandir institutional rules, staff directory, and CBSE 75% attendance criteria."
            icon={<Sparkles className="h-6 w-6 text-cyan-400" />}
            gradient="linear-gradient(137deg, #FFFFFF 0%, #7DD3FC 45%, #06B6D4 100%)"
            delay={0.2}
            badge="AI Sathi"
            onClick={() => openAIDrawer()}
          />

          <FeatureCard
            title="Date-Wise Sheets Sync"
            description="Automatic synchronization separating student and staff data across date-partitioned sheets for zero administrative friction."
            icon={<FileSpreadsheet className="h-6 w-6 text-indigo-400" />}
            gradient="linear-gradient(137deg, #4361EE 0%, #E0AEFF 45%, #F72585 100%)"
            delay={0.3}
            badge="Google Sheets"
            onClick={() => onNavigate('diagnostics')}
          />
        </div>
      </div>

      {/* Stats Footer from Dashboard background prompt */}
      <footer className="relative z-10 border-t border-white/[0.08] bg-black/90 py-8 px-6 sm:px-12 mt-12">
        <div className="mx-auto max-w-6xl flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-slate-400 font-mono">
          <div className="flex items-center gap-2">
            <span className="h-2 w-2 rounded-full bg-emerald-400 animate-pulse"></span>
            <span className="text-white font-bold">SmartX Operational</span>
            <span>• Pranabananda Vidyamandir Lumding</span>
          </div>

          <div className="flex items-center gap-6">
            <button onClick={() => onNavigate('about')} className="hover:text-white transition-colors">
              About PVM
            </button>
            <button onClick={() => onNavigate('staff')} className="hover:text-white transition-colors">
              Staff Directory
            </button>
            <button onClick={() => onNavigate('student')} className="hover:text-white transition-colors">
              Student Portal
            </button>
            <button onClick={() => onNavigate('diagnostics')} className="hover:text-white transition-colors">
              Diagnostics
            </button>
            <button onClick={() => onNavigate('login')} className="hover:text-white transition-colors">
              Login
            </button>
          </div>
        </div>
      </footer>
    </div>
  );
};
