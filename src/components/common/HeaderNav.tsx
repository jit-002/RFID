import React, { useState, useEffect } from 'react';
import { useApp } from '../../context/AppContext';
import {
  ShieldCheck,
  Trophy,
  Sparkles,
  User,
  LogIn,
  LogOut,
  GraduationCap,
  Briefcase,
  Wrench,
  ChevronDown,
  Bot,
  Menu,
  X,
  Layers,
  Activity,
  Home,
  BookOpen
} from 'lucide-react';

interface HeaderNavProps {
  activeTab: string;
  setActiveTab: (tab: string) => void;
  onOpenCommandPalette: () => void;
  onOpenAI: () => void;
}

export const HeaderNav: React.FC<HeaderNavProps> = ({
  activeTab,
  setActiveTab,
  onOpenCommandPalette,
  onOpenAI
}) => {
  const {
    userRole,
    isAuthenticated,
    logoutUser,
    currentStudent,
    currentStaff,
    currentEmployee
  } = useApp();

  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  // Close mobile menu on tab change or window resize
  const navigateTo = (tab: string) => {
    setActiveTab(tab);
    setMobileMenuOpen(false);
  };

  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth >= 1024) {
        setMobileMenuOpen(false);
      }
    };
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const getRoleInfo = () => {
    switch (userRole) {
      case 'STUDENT':
        return {
          label: 'Student',
          portalTab: 'student',
          portalTitle: 'Student Portal',
          name: currentStudent?.name ? currentStudent.name.split(' ')[0] : 'Student',
          badgeColor: 'border-cyan-500/30 bg-cyan-500/10 text-cyan-300',
          icon: <GraduationCap className="h-3.5 w-3.5 text-cyan-400" />
        };
      case 'STAFF':
        return {
          label: 'Faculty',
          portalTab: 'staff',
          portalTitle: 'Faculty Portal',
          name: currentStaff?.name ? currentStaff.name.split(' ')[0] : 'Faculty',
          badgeColor: 'border-emerald-500/30 bg-emerald-500/10 text-emerald-300',
          icon: <Briefcase className="h-3.5 w-3.5 text-emerald-400" />
        };
      case 'EMPLOYEE':
        return {
          label: 'Employee',
          portalTab: 'employee',
          portalTitle: 'Employee Portal',
          name: currentEmployee?.name ? currentEmployee.name.split(' ')[0] : 'Employee',
          badgeColor: 'border-amber-500/30 bg-amber-500/10 text-amber-300',
          icon: <Wrench className="h-3.5 w-3.5 text-amber-400" />
        };
      case 'SUPER_ADMIN':
      case 'ADMIN':
        return {
          label: 'Admin',
          portalTab: 'admin',
          portalTitle: 'Command Center',
          name: 'Admin',
          badgeColor: 'border-violet-500/30 bg-violet-500/10 text-violet-300',
          icon: <ShieldCheck className="h-3.5 w-3.5 text-violet-400" />
        };
      default:
        return null;
    }
  };

  const roleInfo = getRoleInfo();
  const isAdmin = isAuthenticated && (userRole === 'SUPER_ADMIN' || userRole === 'ADMIN');

  return (
    <header className="sticky top-0 z-50 w-full border-b border-white/[0.08] bg-[#000000]/95 backdrop-blur-2xl shadow-xl">
      <div className="mx-auto flex h-16 max-w-[1680px] items-center justify-between px-3 sm:px-6 lg:px-8 gap-2 flex-nowrap">
        {/* Brand Logo & School Identity (Clean, responsive, non-wrapping) */}
        <div className="flex items-center gap-2.5 sm:gap-3 shrink-0 min-w-0">
          <button
            onClick={() => navigateTo(isAuthenticated && roleInfo ? roleInfo.portalTab : 'landing')}
            className="flex items-center gap-2.5 text-left group shrink-0"
          >
            {/* School Crest Logo */}
            <div className="relative flex h-9 w-9 sm:h-10 sm:w-10 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-amber-400 via-rose-500 to-cyan-500 p-0.5 shadow-[0_0_15px_rgba(245,158,11,0.25)] transition-transform group-hover:scale-105">
              <img
                src="/school-logo.jpg"
                alt="PVM Crest"
                className="h-full w-full rounded-[10px] object-cover bg-white"
                onError={(e) => {
                  (e.target as HTMLElement).style.display = 'none';
                }}
              />
            </div>

            {/* School Branding - Clean & Never Overlapping */}
            <div className="flex flex-col justify-center select-none">
              <div className="flex items-center gap-2">
                <span className="font-display italic text-base sm:text-lg font-bold tracking-tight text-white group-hover:text-amber-300 transition-colors whitespace-nowrap">
                  <span className="hidden sm:inline">Pranabananda Vidyamandir</span>
                  <span className="sm:hidden">PVM Lumding</span>
                </span>
                <span className="inline-flex items-center rounded-full border border-amber-500/40 bg-amber-500/15 px-1.5 py-0.2 text-[9px] font-semibold text-amber-300 whitespace-nowrap">
                  CBSE #230043
                </span>
              </div>
              <div className="flex items-center gap-1.5 text-[10px] text-slate-400 whitespace-nowrap">
                <span className="font-mono text-cyan-400 font-semibold">SmartX OS</span>
                <span>•</span>
                <span>Lumding, Assam</span>
              </div>
            </div>
          </button>
        </div>

        {/* Center Desktop Navigation (>= 1024px) */}
        <nav className="hidden lg:flex items-center gap-1 text-xs shrink-0">
          <button
            onClick={() => navigateTo('landing')}
            className={`hidden xl:block px-3 py-1.5 rounded-lg font-medium transition-all whitespace-nowrap ${
              activeTab === 'landing'
                ? 'text-white font-bold bg-white/[0.1] border border-white/20'
                : 'text-slate-400 hover:text-white hover:bg-white/[0.04]'
            }`}
          >
            Overview
          </button>

          <button
            onClick={() => navigateTo('about')}
            className={`hidden xl:block px-3 py-1.5 rounded-lg font-medium transition-all whitespace-nowrap ${
              activeTab === 'about'
                ? 'text-white font-bold bg-white/[0.1] border border-white/20'
                : 'text-slate-400 hover:text-white hover:bg-white/[0.04]'
            }`}
          >
            About PVM
          </button>

          {/* If Normal Role (Student/Staff/Employee), show single portal button */}
          {isAuthenticated && roleInfo && !isAdmin && (
            <button
              onClick={() => navigateTo(roleInfo.portalTab)}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl font-bold transition-all border whitespace-nowrap ${
                activeTab === roleInfo.portalTab
                  ? 'bg-cyan-500 text-black border-cyan-400 shadow-glow-cyan'
                  : 'text-cyan-300 bg-cyan-500/15 border-cyan-500/30 hover:bg-cyan-500/25'
              }`}
            >
              {roleInfo.icon}
              <span>{roleInfo.portalTitle}</span>
            </button>
          )}

          {/* If Admin: Clean Segmented Controls to avoid overcrowding and overlapping */}
          {isAdmin && (
            <div className="flex items-center gap-1 bg-white/[0.03] p-0.5 rounded-xl border border-white/10">
              <button
                onClick={() => navigateTo('admin')}
                className={`flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-semibold transition-all whitespace-nowrap ${
                  activeTab === 'admin'
                    ? 'bg-violet-500 text-white shadow-sm font-bold'
                    : 'text-slate-300 hover:text-white hover:bg-white/[0.06]'
                }`}
                title="Admin Command Center"
              >
                <ShieldCheck className="h-3.5 w-3.5 text-white" />
                <span>Command Center</span>
              </button>

              <button
                onClick={() => navigateTo('staff')}
                className={`flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-semibold transition-all whitespace-nowrap ${
                  activeTab === 'staff'
                    ? 'bg-emerald-500 text-black shadow-sm font-bold'
                    : 'text-slate-300 hover:text-white hover:bg-white/[0.06]'
                }`}
                title="Faculty & Staff Roster & Attendance"
              >
                <Briefcase className="h-3.5 w-3.5 text-emerald-400" />
                <span>Faculty Roster</span>
              </button>

              <button
                onClick={() => navigateTo('student')}
                className={`flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-semibold transition-all whitespace-nowrap ${
                  activeTab === 'student'
                    ? 'bg-cyan-500 text-black shadow-sm font-bold'
                    : 'text-slate-300 hover:text-white hover:bg-white/[0.06]'
                }`}
                title="Student Attendance & Performance Inspector"
              >
                <GraduationCap className="h-3.5 w-3.5 text-cyan-400" />
                <span>Student Inspector</span>
              </button>

              <button
                onClick={() => navigateTo('diagnostics')}
                className={`p-1.5 rounded-lg text-xs font-semibold transition-all whitespace-nowrap ${
                  activeTab === 'diagnostics'
                    ? 'bg-white/20 text-white font-bold'
                    : 'text-slate-400 hover:text-white hover:bg-white/[0.04]'
                }`}
                title="System Diagnostics"
              >
                <Activity className="h-3.5 w-3.5" />
              </button>
            </div>
          )}
        </nav>

        {/* Right Actions (AI triggers, Quiz, User profile, Hamburger) */}
        <div className="flex items-center gap-1.5 sm:gap-2 shrink-0 flex-nowrap">
          {/* Pvm Sathi AI Trigger */}
          <button
            onClick={onOpenAI}
            className="flex items-center gap-1.5 rounded-xl border border-violet-500/40 bg-violet-500/15 px-2 sm:px-2.5 py-1.5 text-xs font-semibold text-violet-300 hover:bg-violet-500/25 transition-all shadow-glow-violet whitespace-nowrap"
            title="Ask Pvm Sathi Campus AI"
          >
            <Sparkles className="h-3.5 w-3.5 text-violet-400 animate-pulse shrink-0" />
            <span className="hidden sm:inline font-medium">Pvm Sathi</span>
          </button>

          {/* Study Sathi 2.0 Academic Engine */}
          <button
            onClick={() => navigateTo('study-sathi')}
            className={`flex items-center gap-1.5 rounded-xl border px-2 sm:px-2.5 py-1.5 text-xs font-semibold transition-all shadow-sm whitespace-nowrap ${
              activeTab === 'study-sathi'
                ? 'bg-cyan-500 text-black border-cyan-400 font-bold shadow-glow-cyan'
                : 'border-cyan-500/40 bg-cyan-500/15 text-cyan-300 hover:bg-cyan-500/25'
            }`}
            title="Launch Study Sathi 2.0 AI Engine"
          >
            <Bot className="h-3.5 w-3.5 text-cyan-400 shrink-0" />
            <span className="hidden sm:inline font-medium">Study Sathi</span>
            <span className="text-[9px] font-mono font-bold px-1 rounded bg-cyan-400/20 text-cyan-200 border border-cyan-400/30">2.0</span>
          </button>

          {/* Sathi Quiz 50-MCQ Challenge */}
          <button
            onClick={() => navigateTo('sathi-quiz')}
            className={`flex items-center gap-1.5 rounded-xl border px-2 sm:px-2.5 py-1.5 text-xs font-semibold transition-all shadow-sm whitespace-nowrap ${
              activeTab === 'sathi-quiz'
                ? 'bg-amber-500 text-black border-amber-400 font-bold shadow-glow-amber'
                : 'border-amber-500/40 bg-amber-500/15 text-amber-300 hover:bg-amber-500/25'
            }`}
            title="Sathi Academic Challenge (Weekly 50 MCQs)"
          >
            <Trophy className="h-3.5 w-3.5 text-amber-400 shrink-0" />
            <span className="hidden md:inline font-medium">Sathi Quiz</span>
          </button>

          {/* User Account / Auth Control */}
          {isAuthenticated && roleInfo ? (
            <div className="hidden sm:flex items-center gap-1.5 shrink-0">
              <button
                onClick={() => navigateTo(roleInfo.portalTab)}
                className={`flex items-center gap-1.5 px-2.5 py-1 rounded-xl border text-xs font-semibold ${roleInfo.badgeColor} whitespace-nowrap hover:opacity-90 transition-opacity`}
                title={`Logged in as ${roleInfo.label} (${roleInfo.name})`}
              >
                {roleInfo.icon}
                <span className="font-bold">{roleInfo.name}</span>
              </button>

              <button
                onClick={() => {
                  logoutUser();
                  navigateTo('landing');
                }}
                className="flex items-center gap-1 px-2.5 py-1 rounded-xl border border-rose-500/40 bg-rose-500/15 text-xs font-bold text-rose-300 hover:bg-rose-500/25 hover:text-white transition-all whitespace-nowrap shadow-sm active:scale-95"
                title="Sign Out of SmartX PVM"
              >
                <LogOut className="h-3.5 w-3.5 shrink-0 text-rose-400" />
                <span className="inline font-semibold">Sign Out</span>
              </button>
            </div>
          ) : (
            <button
              onClick={() => navigateTo('login')}
              className={`flex items-center gap-1.5 rounded-xl px-3 sm:px-4 py-1.5 text-xs font-bold transition-all whitespace-nowrap ${
                activeTab === 'login'
                  ? 'bg-cyan-500 text-black shadow-glow-cyan'
                  : 'bg-white/[0.08] hover:bg-white/[0.15] text-white border border-white/10'
              }`}
            >
              <LogIn className="h-3.5 w-3.5 shrink-0" />
              <span>Sign In</span>
            </button>
          )}

          {/* Mobile Hamburger Toggle Button (< 1024px) */}
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="lg:hidden flex items-center justify-center h-8 w-8 rounded-xl border border-white/10 bg-white/[0.05] text-slate-300 hover:text-white hover:bg-white/10 transition-all"
            aria-label="Toggle Mobile Menu"
          >
            {mobileMenuOpen ? <X className="h-4 w-4 text-rose-400" /> : <Menu className="h-4 w-4" />}
          </button>
        </div>
      </div>

      {/* Mobile & Tablet Full-Screen Drawer Menu */}
      {mobileMenuOpen && (
        <div className="lg:hidden fixed inset-x-0 top-16 bottom-0 z-50 bg-[#000000]/95 backdrop-blur-2xl border-t border-white/10 p-4 overflow-y-auto animate-in fade-in slide-in-from-top-2 duration-200">
          <div className="max-w-md mx-auto space-y-4 pb-20">
            {/* User Session Header */}
            {isAuthenticated && roleInfo ? (
              <div className="flex items-center justify-between p-3 rounded-2xl border border-white/10 bg-white/[0.03]">
                <div className="flex items-center gap-3">
                  <div className={`p-2 rounded-xl border ${roleInfo.badgeColor}`}>
                    {roleInfo.icon}
                  </div>
                  <div>
                    <div className="text-xs font-semibold text-white">Logged in as {roleInfo.name}</div>
                    <div className="text-[10px] text-slate-400">Role: {roleInfo.label} Clearance</div>
                  </div>
                </div>
                <button
                  onClick={() => {
                    logoutUser();
                    navigateTo('landing');
                  }}
                  className="px-3 py-1.5 rounded-xl border border-rose-500/30 bg-rose-500/10 text-xs font-semibold text-rose-300 hover:bg-rose-500/20 flex items-center gap-1.5"
                >
                  <LogOut className="h-3.5 w-3.5" />
                  <span>Sign Out</span>
                </button>
              </div>
            ) : (
              <button
                onClick={() => navigateTo('login')}
                className="w-full flex items-center justify-center gap-2 py-3 rounded-2xl bg-cyan-500 text-black font-bold text-sm shadow-glow-cyan"
              >
                <LogIn className="h-4 w-4" />
                <span>Sign In to PVM SmartX Portal</span>
              </button>
            )}

            {/* Navigation Sections */}
            <div className="space-y-1.5">
              <div className="text-[10px] font-mono uppercase tracking-wider text-slate-400 px-2 pt-2">
                Institutional Navigation
              </div>
              <button
                onClick={() => navigateTo('landing')}
                className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-xs font-medium transition-all ${
                  activeTab === 'landing' ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/30' : 'text-slate-300 hover:bg-white/[0.05]'
                }`}
              >
                <Home className="h-4 w-4 text-cyan-400" />
                <span>Overview & Campus Status</span>
              </button>
              <button
                onClick={() => navigateTo('about')}
                className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-xs font-medium transition-all ${
                  activeTab === 'about' ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/30' : 'text-slate-300 hover:bg-white/[0.05]'
                }`}
              >
                <BookOpen className="h-4 w-4 text-amber-400" />
                <span>About Pranabananda Vidyamandir</span>
              </button>
            </div>

            {/* Role-Specific Portals */}
            {isAdmin ? (
              <div className="space-y-1.5">
                <div className="text-[10px] font-mono uppercase tracking-wider text-violet-400 px-2 pt-2">
                  Administrative Command Suite
                </div>
                <button
                  onClick={() => navigateTo('admin')}
                  className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-xs font-medium transition-all ${
                    activeTab === 'admin' ? 'bg-violet-500/20 text-violet-300 border border-violet-500/30' : 'text-slate-300 hover:bg-white/[0.05]'
                  }`}
                >
                  <ShieldCheck className="h-4 w-4 text-violet-400" />
                  <span>Admin Command Center</span>
                </button>
                <button
                  onClick={() => navigateTo('staff')}
                  className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-xs font-medium transition-all ${
                    activeTab === 'staff' ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30' : 'text-slate-300 hover:bg-white/[0.05]'
                  }`}
                >
                  <Briefcase className="h-4 w-4 text-emerald-400" />
                  <span>Faculty & Staff Attendance Controller</span>
                </button>
                <button
                  onClick={() => navigateTo('student')}
                  className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-xs font-medium transition-all ${
                    activeTab === 'student' ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/30' : 'text-slate-300 hover:bg-white/[0.05]'
                  }`}
                >
                  <GraduationCap className="h-4 w-4 text-cyan-400" />
                  <span>Student Attendance & Score Inspector</span>
                </button>
                <button
                  onClick={() => navigateTo('diagnostics')}
                  className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-xs font-medium transition-all ${
                    activeTab === 'diagnostics' ? 'bg-white/20 text-white border border-white/30' : 'text-slate-300 hover:bg-white/[0.05]'
                  }`}
                >
                  <Activity className="h-4 w-4 text-rose-400" />
                  <span>System Diagnostics & Sync Engine</span>
                </button>
              </div>
            ) : isAuthenticated && roleInfo ? (
              <div className="space-y-1.5">
                <div className="text-[10px] font-mono uppercase tracking-wider text-cyan-400 px-2 pt-2">
                  Authorized Portal
                </div>
                <button
                  onClick={() => navigateTo(roleInfo.portalTab)}
                  className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-xs font-medium transition-all ${
                    activeTab === roleInfo.portalTab ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/30' : 'text-slate-300 hover:bg-white/[0.05]'
                  }`}
                >
                  {roleInfo.icon}
                  <span>{roleInfo.portalTitle}</span>
                </button>
              </div>
            ) : null}

            {/* Academic & AI Applications */}
            <div className="space-y-1.5">
              <div className="text-[10px] font-mono uppercase tracking-wider text-amber-400 px-2 pt-2">
                Academic & AI Engines
              </div>
              <button
                onClick={() => navigateTo('sathi-quiz')}
                className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-xs font-medium transition-all ${
                  activeTab === 'sathi-quiz' ? 'bg-amber-500/20 text-amber-300 border border-amber-500/30' : 'text-slate-300 hover:bg-white/[0.05]'
                }`}
              >
                <Trophy className="h-4 w-4 text-amber-400" />
                <span>Sathi Quiz (Weekly 50 MCQs Challenge)</span>
              </button>
              <button
                onClick={() => navigateTo('study-sathi')}
                className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-xs font-medium transition-all ${
                  activeTab === 'study-sathi' ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/30' : 'text-slate-300 hover:bg-white/[0.05]'
                }`}
              >
                <Bot className="h-4 w-4 text-cyan-400" />
                <span>Study Sathi 2.0 (Full Screen AI Engine)</span>
              </button>
              <button
                onClick={() => {
                  setMobileMenuOpen(false);
                  onOpenAI();
                }}
                className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-xs font-medium text-violet-300 hover:bg-violet-500/10 border border-violet-500/20 transition-all"
              >
                <Sparkles className="h-4 w-4 text-violet-400 animate-pulse" />
                <span>Ask Pvm Sathi AI Assistant</span>
              </button>
            </div>

            {/* School Footer info */}
            <div className="pt-4 text-center text-[10px] text-slate-500 space-y-1 border-t border-white/5">
              <p className="font-medium text-slate-400">Pranabananda Vidyamandir • CBSE #230043</p>
              <p>SmartX Campus Operating System • Lumding, Assam</p>
            </div>
          </div>
        </div>
      )}
    </header>
  );
};
