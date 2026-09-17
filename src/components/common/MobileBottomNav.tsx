import React from 'react';
import { useApp } from '../../context/AppContext';
import { Home, Sparkles, User, BookOpen, LogIn, GraduationCap, Briefcase, Wrench, ShieldCheck } from 'lucide-react';

interface MobileBottomNavProps {
  activeTab: string;
  setActiveTab: (tab: string) => void;
  onOpenAI: () => void;
}

export const MobileBottomNav: React.FC<MobileBottomNavProps> = ({
  activeTab,
  setActiveTab,
  onOpenAI
}) => {
  const { isAuthenticated, userRole } = useApp();

  const getAuthorizedPortalTab = () => {
    if (userRole === 'STUDENT') return 'student';
    if (userRole === 'STAFF') return 'staff';
    if (userRole === 'EMPLOYEE') return 'employee';
    if (userRole === 'SUPER_ADMIN' || userRole === 'ADMIN') return 'admin';
    return 'login';
  };

  const portalTab = getAuthorizedPortalTab();

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-40 flex h-14 items-center justify-around border-t border-white/[0.08] bg-[#06090e]/95 px-4 backdrop-blur-lg sm:hidden">
      <button
        onClick={() => setActiveTab('landing')}
        className={`flex flex-col items-center gap-0.5 text-[10px] ${
          activeTab === 'landing' ? 'text-cyan-400 font-bold' : 'text-slate-400'
        }`}
      >
        <Home className="h-4 w-4" />
        <span>Overview</span>
      </button>

      <button
        onClick={() => setActiveTab('about')}
        className={`flex flex-col items-center gap-0.5 text-[10px] ${
          activeTab === 'about' ? 'text-cyan-400 font-bold' : 'text-slate-400'
        }`}
      >
        <BookOpen className="h-4 w-4" />
        <span>About PVM</span>
      </button>

      <button
        onClick={onOpenAI}
        className="flex flex-col items-center gap-0.5 text-[10px] text-violet-400"
      >
        <Sparkles className="h-4 w-4" />
        <span>Pvm Sathi</span>
      </button>

      {isAuthenticated ? (
        <button
          onClick={() => setActiveTab(portalTab)}
          className={`flex flex-col items-center gap-0.5 text-[10px] ${
            activeTab === portalTab ? 'text-white font-bold' : 'text-slate-400'
          }`}
        >
          {userRole === 'STUDENT' ? (
            <GraduationCap className="h-4 w-4 text-cyan-400" />
          ) : userRole === 'STAFF' ? (
            <Briefcase className="h-4 w-4 text-emerald-400" />
          ) : userRole === 'EMPLOYEE' ? (
            <Wrench className="h-4 w-4 text-amber-400" />
          ) : (
            <ShieldCheck className="h-4 w-4 text-violet-400" />
          )}
          <span>Portal</span>
        </button>
      ) : (
        <button
          onClick={() => setActiveTab('login')}
          className={`flex flex-col items-center gap-0.5 text-[10px] ${
            activeTab === 'login' ? 'text-cyan-400 font-bold' : 'text-slate-400'
          }`}
        >
          <LogIn className="h-4 w-4" />
          <span>Sign In</span>
        </button>
      )}
    </nav>
  );
};
