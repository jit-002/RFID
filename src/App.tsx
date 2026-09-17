import React, { useState } from 'react';
import { AppProvider, useApp } from './context/AppContext';
import { HeaderNav } from './components/common/HeaderNav';
import { ToastContainer } from './components/common/ToastContainer';
import { CommandPalette } from './components/common/CommandPalette';
import { MobileBottomNav } from './components/common/MobileBottomNav';
import { HardwareSimulatorModal } from './components/hardware/HardwareSimulatorModal';
import { VerificationModal } from './components/hardware/VerificationModal';
import { AIAssistantDrawer } from './components/analytics/AIAssistantDrawer';

// Pages
import { LandingPage } from './pages/LandingPage';
import { AboutPage } from './pages/AboutPage';
import { StudentPortal } from './pages/StudentPortal';
import { StaffPortal } from './pages/StaffPortal';
import { EmployeePortal } from './pages/EmployeePortal';
import { AdminDashboard } from './pages/AdminDashboard';
import { DiagnosticsPage } from './pages/DiagnosticsPage';
import { LoginPage } from './pages/LoginPage';
import { LiveAttendanceWall } from './pages/LiveAttendanceWall';
import { NotFoundPage } from './pages/NotFoundPage';
import { StudySathiPage } from './pages/StudySathiPage';
import { ImageTestPage } from './pages/ImageTestPage';
import { SathiQuizPage } from './pages/SathiQuizPage';
import { LoginRequiredCard } from './components/common/LoginRequiredCard';
import { ShieldAlert, ArrowLeft } from 'lucide-react';

const getInitialTab = (role: string | null, isAuth: boolean): string => {
  if (typeof window !== 'undefined') {
    const hash = window.location.hash.replace('#', '').trim();
    if (['landing', 'about', 'student', 'staff', 'employee', 'admin', 'diagnostics', 'live', 'login', 'study-sathi', 'image-test', 'sathi-quiz'].includes(hash)) {
      return hash;
    }
    const saved = localStorage.getItem('smartattend_active_tab');
    if (saved && ['landing', 'about', 'student', 'staff', 'employee', 'admin', 'diagnostics', 'live', 'study-sathi', 'image-test', 'sathi-quiz'].includes(saved)) {
      return saved;
    }
  }
  if (isAuth && role) {
    if (role === 'STUDENT') return 'student';
    if (role === 'STAFF') return 'staff';
    if (role === 'EMPLOYEE') return 'employee';
    if (role === 'SUPER_ADMIN' || role === 'ADMIN') return 'admin';
  }
  return 'landing';
};

const MainApp: React.FC = () => {
  const { isAuthenticated, userRole, currentStudent, currentStaff, isAIOpen, setAIOpen, openAIDrawer } = useApp();
  const [activeTab, setActiveTab] = useState<string>(() => getInitialTab(userRole, isAuthenticated));
  const [isCommandPaletteOpen, setCommandPaletteOpen] = useState(false);

  // Sync activeTab with localStorage and URL Hash
  React.useEffect(() => {
    if (activeTab && activeTab !== '404') {
      localStorage.setItem('smartattend_active_tab', activeTab);
      if (window.location.hash !== `#${activeTab}`) {
        window.location.hash = activeTab;
      }
    }
  }, [activeTab]);

  // Support browser Back/Forward navigation
  React.useEffect(() => {
    const onHashChange = () => {
      const hash = window.location.hash.replace('#', '').trim();
      if (
        hash &&
        hash !== activeTab &&
        ['landing', 'about', 'student', 'staff', 'employee', 'admin', 'diagnostics', 'live', 'login', 'study-sathi', 'image-test', 'sathi-quiz'].includes(hash)
      ) {
        setActiveTab(hash);
      }
    };
    window.addEventListener('hashchange', onHashChange);
    return () => window.removeEventListener('hashchange', onHashChange);
  }, [activeTab]);

  // If user signs in and is on landing/login, automatically navigate to their authorized portal
  React.useEffect(() => {
    if (isAuthenticated && userRole && (activeTab === 'landing' || activeTab === 'login')) {
      const saved = localStorage.getItem('smartattend_active_tab');
      if (!saved || saved === 'landing' || saved === 'login') {
        if (userRole === 'STUDENT') setActiveTab('student');
        else if (userRole === 'STAFF') setActiveTab('staff');
        else if (userRole === 'EMPLOYEE') setActiveTab('employee');
        else if (userRole === 'SUPER_ADMIN' || userRole === 'ADMIN') setActiveTab('admin');
      }
    }
  }, [isAuthenticated, userRole]);

  // Full-screen pages that hide header
  const isFullScreenPage = activeTab === '404' || activeTab === 'study-sathi' || activeTab === 'image-test';

  // Role Access Guard Verification
  const canAccessStudent = isAuthenticated && (userRole === 'STUDENT' || userRole === 'SUPER_ADMIN' || userRole === 'ADMIN');
  const canAccessStaff = isAuthenticated && (userRole === 'STAFF' || userRole === 'SUPER_ADMIN' || userRole === 'ADMIN');
  const canAccessEmployee = isAuthenticated && (userRole === 'EMPLOYEE' || userRole === 'SUPER_ADMIN' || userRole === 'ADMIN');
  const canAccessAdmin = isAuthenticated && (userRole === 'SUPER_ADMIN' || userRole === 'ADMIN');

  // Render Access Denied Gate
  const renderAccessDenied = (requiredRole: string) => (
    <div className="mx-auto max-w-lg px-4 py-20 text-center space-y-4">
      <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-rose-500/10 border border-rose-500/30 text-rose-400">
        <ShieldAlert className="h-8 w-8" />
      </div>
      <h2 className="text-2xl font-bold text-white tracking-tight">Access Restricted</h2>
      <p className="text-sm text-slate-400">
        This portal requires authorized {requiredRole} institutional clearance at Pranabananda Vidyamandir. Cross-role data access is strictly prohibited.
      </p>
      <div className="pt-2 flex items-center justify-center gap-3">
        <button
          onClick={() => setActiveTab('landing')}
          className="px-4 py-2 rounded-xl border border-white/10 text-xs font-semibold text-slate-300 hover:text-white"
        >
          ← Return to Overview
        </button>
        <button
          onClick={() => setActiveTab('login')}
          className="px-4 py-2 rounded-xl bg-cyan-500 text-black text-xs font-bold shadow-glow-cyan"
        >
          Switch Account (Sign In)
        </button>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-[#000000] text-slate-100 selection:bg-cyan-500/30 selection:text-cyan-200">
      {/* Top Header Navigation */}
      {!isFullScreenPage && activeTab !== 'live' && (
        <HeaderNav
          activeTab={activeTab}
          setActiveTab={setActiveTab}
          onOpenCommandPalette={() => setCommandPaletteOpen(true)}
          onOpenAI={() => setAIOpen(true)}
        />
      )}

      {/* Main View Router with Strict Role Isolation */}
      <main className={isFullScreenPage || activeTab === 'about' ? '' : 'pb-20 md:pb-10'}>
        {activeTab === 'landing' && <LandingPage onNavigate={setActiveTab} />}
        {activeTab === 'about' && <AboutPage onNavigate={setActiveTab} />}

        {/* Student Portal Protected Route */}
        {activeTab === 'student' && (
          !isAuthenticated ? <LoginPage onNavigate={setActiveTab} /> : (canAccessStudent ? <StudentPortal /> : renderAccessDenied('Student'))
        )}

        {/* Staff Portal Protected Route */}
        {activeTab === 'staff' && (
          !isAuthenticated ? <LoginPage onNavigate={setActiveTab} /> : (canAccessStaff ? <StaffPortal /> : renderAccessDenied('Faculty / Staff'))
        )}

        {/* Employee Portal Protected Route */}
        {activeTab === 'employee' && (
          !isAuthenticated ? <LoginPage onNavigate={setActiveTab} /> : (canAccessEmployee ? <EmployeePortal /> : renderAccessDenied('Operations Employee'))
        )}

        {/* Admin Dashboard Protected Route */}
        {activeTab === 'admin' && (
          !isAuthenticated ? <LoginPage onNavigate={setActiveTab} /> : (canAccessAdmin ? <AdminDashboard onNavigate={setActiveTab} /> : renderAccessDenied('Super Admin'))
        )}

        {/* Diagnostics Protected Route */}
        {activeTab === 'diagnostics' && (
          !isAuthenticated ? <LoginPage onNavigate={setActiveTab} /> : (canAccessAdmin ? <DiagnosticsPage /> : renderAccessDenied('Super Admin / Diagnostics'))
        )}

        {activeTab === 'login' && <LoginPage onNavigate={setActiveTab} />}
        {activeTab === '404' && <NotFoundPage onNavigate={setActiveTab} />}
        {activeTab === 'study-sathi' && (
          !isAuthenticated ? (
            <div className="min-h-screen bg-[#07090E] text-slate-100 flex flex-col justify-center">
              <LoginRequiredCard
                title="PVM Sathi 2.0 Requires Sign In"
                description="PVM Sathi 2.0 and Study Sathi are private academic tools and AI learning companions. Please log in to continue and keep your academic history private."
                onLogin={() => setActiveTab('login')}
                onBack={() => setActiveTab('landing')}
              />
            </div>
          ) : (
            <StudySathiPage onNavigate={setActiveTab} />
          )
        )}
        {activeTab === 'image-test' && <ImageTestPage onNavigate={setActiveTab} />}
        {activeTab === 'sathi-quiz' && (
          !isAuthenticated ? (
            <div className="min-h-screen bg-[#07090E] text-slate-100 flex flex-col justify-center">
              <LoginRequiredCard
                title="Sathi Quiz Requires Sign In"
                description="The Weekly Academic Challenge and Sathi Quiz are private academic tools available only to enrolled students and authorized faculty."
                onLogin={() => setActiveTab('login')}
                onBack={() => setActiveTab('landing')}
              />
            </div>
          ) : (
            <SathiQuizPage
              isAuthenticated={isAuthenticated}
              currentUser={{
                id: userRole === 'STUDENT' ? (currentStudent?.admissionNo || currentStudent?.id || 'student') : (currentStaff?.id || 'staff'),
                name: userRole === 'STUDENT' ? (currentStudent?.name || 'Student') : (currentStaff?.name || 'Faculty'),
                role: userRole?.toLowerCase() || 'student'
              }}
              onNavigateTab={setActiveTab}
              onOpenStudySathiWithPrompt={(prompt, title) => {
                localStorage.setItem('sathi_quiz_doubt_prompt', prompt);
                if (title) localStorage.setItem('sathi_quiz_doubt_title', title);
                setActiveTab('study-sathi');
              }}
            />
          )
        )}

        {activeTab === 'live' && (
          <div>
            <div className="p-4 flex items-center justify-between border-b border-white/[0.08] bg-black">
              <button
                onClick={() => setActiveTab('landing')}
                className="text-xs font-semibold text-cyan-400 hover:text-cyan-300 transition-colors"
              >
                ← Back to Dashboard Overview
              </button>
            </div>
            <LiveAttendanceWall />
          </div>
        )}
      </main>

      {/* Global Modals & Overlays */}
      <ToastContainer />

      <CommandPalette
        isOpen={isCommandPaletteOpen}
        onClose={() => setCommandPaletteOpen(false)}
        onNavigate={setActiveTab}
        onOpenAI={() => setAIOpen(true)}
      />
      <AIAssistantDrawer isOpen={isAIOpen} onClose={() => setAIOpen(false)} onNavigate={setActiveTab} />

      {/* Mobile Bottom Sheet Navigation */}
      {!isFullScreenPage && activeTab !== 'live' && activeTab !== 'about' && activeTab !== 'login' && (
        <MobileBottomNav
          activeTab={activeTab}
          setActiveTab={setActiveTab}
          onOpenAI={() => setAIOpen(true)}
        />
      )}
    </div>
  );
};

export default function App() {
  return (
    <AppProvider>
      <MainApp />
    </AppProvider>
  );
}
