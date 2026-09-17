import React, { useEffect, useState, useRef } from 'react';
import { ArrowLeft, Menu, X, Home, ShieldAlert, LogIn } from 'lucide-react';
import { useApp } from '../context/AppContext';

interface NotFoundPageProps {
  onNavigate: (tab: string) => void;
}

export const NotFoundPage: React.FC<NotFoundPageProps> = ({ onNavigate }) => {
  const { unregisteredGoogleEmail, clearUnregisteredEmail } = useApp();
  const [scaleY, setScaleY] = useState(1);
  const [menuOpen, setMenuOpen] = useState(false);
  const textRef = useRef<HTMLHeadingElement>(null);

  useEffect(() => {
    const handleResize = () => {
      if (textRef.current) {
        const h = textRef.current.offsetHeight || 200;
        const computed = (window.innerHeight / h) * 1.4;
        setScaleY(computed);
      }
    };
    handleResize();
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const handleReturnHome = () => {
    clearUnregisteredEmail();
    onNavigate('landing');
  };

  const handleReturnLogin = () => {
    clearUnregisteredEmail();
    onNavigate('login');
  };

  return (
    <div className="relative w-full h-screen overflow-hidden flex flex-col bg-gradient-to-b from-[#FF8233] to-[#FDAC55] font-sans selection:bg-white selection:text-[#F16524]">
      {/* Background 404 Text & Masked Layer */}
      <div className="absolute inset-0 pointer-events-none flex items-center justify-center opacity-80 z-0">
        <div className="relative flex items-center justify-center">
          <h1
            ref={textRef}
            className="text-white font-black leading-none tracking-tighter whitespace-nowrap select-none"
            style={{
              fontSize: 'clamp(200px, 46vw, 760px)',
              transform: `scale(1.15, ${Math.max(1, scaleY)})`,
              transformOrigin: 'center'
            }}
          >
            404
          </h1>

          {/* White Oval Accent */}
          <div
            className="absolute rounded-full bg-white select-none pointer-events-none"
            style={{
              height: 'clamp(140px, 30vh, 360px)',
              width: 'clamp(120px, 20vw, 400px)',
              transform: `scale(1, ${Math.max(1, scaleY)})`,
              transformOrigin: 'center',
              opacity: 0.85
            }}
          />
        </div>
      </div>

      {/* Navigation Bar */}
      <header className="relative z-20 flex items-center justify-between px-6 sm:px-12 py-5">
        <div
          onClick={handleReturnHome}
          className="flex items-center gap-3 cursor-pointer group"
        >
          <img src="/school-logo.jpg" alt="Logo" className="h-9 w-9 rounded-xl object-cover bg-white p-0.5 shadow-md" />
          <span className="text-white font-bold text-lg sm:text-xl tracking-tight">
            Pranabananda Vidyamandir
          </span>
        </div>

        {/* Desktop Nav Links */}
        <div className="hidden md:flex items-center gap-2">
          {['Overview', 'About PVM', 'Login'].map((item) => (
            <button
              key={item}
              onClick={() => {
                clearUnregisteredEmail();
                onNavigate(item === 'Login' ? 'login' : item === 'About PVM' ? 'about' : 'landing');
              }}
              className="px-4 py-1.5 text-xs font-semibold rounded-full bg-white text-[#F16524] hover:opacity-90 transition-opacity shadow-sm"
            >
              {item}
            </button>
          ))}
        </div>

        {/* Mobile Menu Button */}
        <button
          onClick={() => setMenuOpen(!menuOpen)}
          className="md:hidden flex items-center gap-1.5 px-4 py-2 rounded-full bg-[#F16524] text-white text-xs font-semibold shadow-md"
        >
          <Menu className="h-4 w-4" />
          <span>Menu</span>
        </button>
      </header>

      {/* Mobile Menu Slide-Over */}
      {menuOpen && (
        <div className="fixed inset-0 z-50 flex justify-end bg-black/50 backdrop-blur-sm animate-in fade-in duration-300">
          <div className="relative h-full w-4/5 max-w-sm bg-gradient-to-br from-[#FF6B1A] to-[#FF9642] p-6 text-white flex flex-col justify-between shadow-2xl">
            <div>
              <div className="flex items-center justify-between pb-6 border-b border-white/20">
                <span className="font-bold text-lg">PVM Lumding</span>
                <button
                  onClick={() => setMenuOpen(false)}
                  className="p-2 rounded-full bg-white/20 text-white"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>

              <div className="space-y-3 mt-6">
                {[
                  { label: 'Dashboard Overview', tab: 'landing' },
                  { label: 'About School', tab: 'about' },
                  { label: 'Account Sign In', tab: 'login' }
                ].map((l) => (
                  <button
                    key={l.label}
                    onClick={() => {
                      clearUnregisteredEmail();
                      setMenuOpen(false);
                      onNavigate(l.tab);
                    }}
                    className="w-full text-left p-3.5 rounded-2xl bg-white/10 hover:bg-white/20 font-semibold text-sm transition-all"
                  >
                    {l.label}
                  </button>
                ))}
              </div>
            </div>

            <button
              onClick={handleReturnHome}
              className="w-full py-3.5 rounded-full bg-white text-[#F16524] font-bold text-sm flex items-center justify-center gap-2 shadow-lg"
            >
              <ArrowLeft className="h-4 w-4" />
              <span>Back to Overview</span>
            </button>
          </div>
        </div>
      )}

      {/* Center Animated Character Video */}
      <div className="absolute inset-0 flex items-center justify-center pointer-events-none z-10 -mt-10">
        <div className="w-[120vw] h-[75vh] sm:w-[65vw] sm:h-[65vh] md:w-[50vw] md:h-[68vh] max-w-xl">
          <video
            autoPlay
            loop
            muted
            playsInline
            src="https://d8j0ntlcm91z4.cloudfront.net/user_38xzZboKViGWJOttwIXH07lWA1P/hf_20260713_234424_b1332b69-2e69-4302-8dbc-40f86846afbd.mp4"
            className="w-full h-full object-contain pointer-events-none mix-blend-darken"
          />
        </div>
      </div>

      {/* Bottom Content Actions */}
      <div className="relative z-20 mt-auto pb-12 flex flex-col items-center text-center px-4">
        {unregisteredGoogleEmail ? (
          <div className="max-w-md space-y-3 mb-4 animate-in fade-in">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/20 text-white text-xs font-semibold backdrop-blur-sm">
              <ShieldAlert className="h-3.5 w-3.5" />
              <span>Google Account Not Registered</span>
            </div>
            <h2 className="text-white text-xl sm:text-2xl font-black tracking-tight">
              User Record Not Found
            </h2>
            <p className="text-white/90 text-xs sm:text-sm leading-relaxed">
              The Google account <strong className="underline underline-offset-2">{unregisteredGoogleEmail}</strong> is not listed in the Pranabananda Vidyamandir database. Access is restricted to verified students, faculty, and employees.
            </p>
          </div>
        ) : (
          <div className="max-w-md space-y-2 mb-4">
            <h2 className="text-white text-xl sm:text-2xl font-bold tracking-tight">
              Oops, this destination doesn't exist!
            </h2>
            <p className="text-white/80 text-xs sm:text-sm">
              The requested institutional page or route could not be located.
            </p>
          </div>
        )}

        <div className="flex flex-wrap items-center justify-center gap-3">
          <button
            onClick={handleReturnLogin}
            className="inline-flex items-center gap-2 px-6 py-3 rounded-full text-white font-bold text-xs sm:text-sm bg-[#F16524] hover:scale-105 hover:shadow-xl transition-all shadow-md"
          >
            <LogIn className="h-4 w-4" />
            <span>Sign In with Registered ID</span>
          </button>
          <button
            onClick={handleReturnHome}
            className="inline-flex items-center gap-2 px-6 py-3 rounded-full text-[#F16524] font-bold text-xs sm:text-sm bg-white hover:opacity-90 transition-opacity shadow-md"
          >
            <ArrowLeft className="h-4 w-4" />
            <span>Back to Dashboard Home</span>
          </button>
        </div>
      </div>
    </div>
  );
};
