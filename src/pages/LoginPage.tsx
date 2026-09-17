import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import {
  Eye,
  EyeOff,
  Sparkles,
  Lock,
  Mail,
  User,
  ShieldCheck,
  KeyRound,
  CheckCircle2,
  Cpu,
  ArrowRight,
  Phone,
  GraduationCap,
  Briefcase,
  Wrench
} from 'lucide-react';
import { motion } from 'motion/react';

interface LoginPageProps {
  onNavigate: (tab: string) => void;
}

export const LoginPage: React.FC<LoginPageProps> = ({ onNavigate }) => {
  const {
    loginUser,
    loginWithGoogleOAuth,
    requestPhoneOTP,
    confirmPhoneOTP,
    userRole
  } = useApp();

  const [authMode, setAuthMode] = useState<'PASSWORD' | 'PHONE_OTP'>('PASSWORD');

  // Password Login State
  const [usernameOrEmail, setUsernameOrEmail] = useState('admin');
  const [password, setPassword] = useState('1234');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [authError, setAuthError] = useState<string | null>(null);

  // Phone OTP State
  const [phone, setPhone] = useState('');
  const [otpToken, setOtpToken] = useState('');
  const [otpSent, setOtpSent] = useState(false);
  const [otpLoading, setOtpLoading] = useState(false);

  const routeByRole = (role?: string | null) => {
    if (role === 'STUDENT') onNavigate('student');
    else if (role === 'STAFF') onNavigate('staff');
    else if (role === 'EMPLOYEE') onNavigate('employee');
    else onNavigate('admin');
  };

  const handlePasswordSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setAuthError(null);
    try {
      const res = await loginUser(usernameOrEmail, password);
      if (res.success) {
        routeByRole(res.role);
      } else {
        setAuthError(res.error || 'Invalid credentials.');
      }
    } finally {
      setLoading(false);
    }
  };

  const handleQuickLogin = async (roleType: 'ADMIN' | 'STAFF' | 'STUDENT' | 'EMPLOYEE') => {
    setLoading(true);
    setAuthError(null);
    try {
      const userKey = roleType === 'ADMIN' ? 'admin' : roleType === 'STAFF' ? 'staff' : roleType === 'EMPLOYEE' ? 'employee' : 'student';
      const res = await loginUser(userKey, '1234');
      if (res.success) {
        routeByRole(res.role);
      }
    } finally {
      setLoading(false);
    }
  };

  const handleSendPhoneOTP = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!phone || phone.length < 8) {
      setAuthError('Please enter a valid phone number.');
      return;
    }
    setOtpLoading(true);
    setAuthError(null);
    try {
      const res = await requestPhoneOTP(phone);
      if (res.success) {
        setOtpSent(true);
      } else {
        setAuthError(res.error || 'Failed to send OTP.');
      }
    } finally {
      setOtpLoading(false);
    }
  };

  const handleVerifyPhoneOTP = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!otpToken) return;
    setOtpLoading(true);
    setAuthError(null);
    try {
      const res = await confirmPhoneOTP(phone, otpToken);
      if (res.success) {
        onNavigate('student');
      } else {
        setAuthError(res.error || 'Invalid OTP code.');
      }
    } finally {
      setOtpLoading(false);
    }
  };

  const handleGoogleSignIn = async () => {
    setLoading(true);
    try {
      const res = await loginWithGoogleOAuth();
      if (res.notRegistered) {
        onNavigate('404');
      } else if (res.success) {
        routeByRole(userRole);
      } else if (res.error) {
        setAuthError(res.error);
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="relative min-h-screen bg-[#05070B] text-white flex flex-col lg:flex-row items-stretch overflow-hidden font-sans">
      {/* Left Animated Orbit Section with Official School Crest */}
      <div className="relative flex-1 hidden lg:flex flex-col items-center justify-center p-12 border-r border-white/[0.06] bg-radial-gradient">
        {/* Background Concentric Ripples */}
        <div className="absolute inset-0 flex items-center justify-center pointer-events-none opacity-30">
          {[120, 220, 340, 460, 580].map((size, idx) => (
            <div
              key={idx}
              className="absolute rounded-full border border-cyan-500/20"
              style={{
                width: `${size}px`,
                height: `${size}px`,
                animation: `pulse 4s ease-in-out infinite ${idx * 0.6}s`
              }}
            />
          ))}
        </div>

        {/* Central Brand Display */}
        <div className="relative z-10 text-center space-y-6 max-w-md flex flex-col items-center">
          {/* Large School Crest */}
          <motion.div
            initial={{ scale: 0.85, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ duration: 0.8 }}
            className="h-28 w-28 rounded-3xl bg-gradient-to-br from-amber-400 via-rose-500 to-cyan-500 p-1 shadow-[0_0_40px_rgba(245,158,11,0.4)]"
          >
            <img
              src="/school-logo.jpg"
              alt="Pranabananda Vidyamandir Crest"
              className="h-full w-full rounded-[22px] object-cover bg-white"
            />
          </motion.div>

          <div className="space-y-2">
            <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-amber-500/10 border border-amber-500/30 text-amber-300 text-xs font-mono">
              <Sparkles className="h-3.5 w-3.5 text-amber-400" />
              <span>Pranabananda Vidyamandir • CBSE #230043</span>
            </div>

            <h2 className="font-display italic text-4xl sm:text-5xl font-bold tracking-tight text-white leading-tight">
              Pranabananda Vidyamandir
            </h2>
            <p className="text-xs font-mono text-cyan-400 uppercase tracking-wider">
              SmartX Institutional Digital Operating System
            </p>
          </div>

          <p className="text-sm text-slate-400 leading-relaxed max-w-sm">
            Zero-Trust campus attendance with Raspberry Pi 3B perimeter turnstiles, ESP8266 classroom nodes, and Pvm Sathi personalized intelligence.
          </p>

          {/* 1-Click Fast Demo Login Tiles */}
          <div className="w-full pt-4 border-t border-white/[0.08] space-y-2">
            <span className="text-[11px] font-mono text-slate-400 block uppercase tracking-wider">
              1-Click Fast Role Sign In (Password: 1234):
            </span>
            <div className="grid grid-cols-2 gap-2">
              <button
                type="button"
                onClick={() => handleQuickLogin('ADMIN')}
                className="flex items-center justify-center gap-1.5 p-2 rounded-xl border border-violet-500/30 bg-violet-500/10 text-violet-300 text-xs font-bold hover:bg-violet-500/20 transition-all shadow-glow-violet"
              >
                <ShieldCheck className="h-3.5 w-3.5" />
                <span>Admin (admin)</span>
              </button>

              <button
                type="button"
                onClick={() => handleQuickLogin('STAFF')}
                className="flex items-center justify-center gap-1.5 p-2 rounded-xl border border-emerald-500/30 bg-emerald-500/10 text-emerald-300 text-xs font-bold hover:bg-emerald-500/20 transition-all shadow-glow-emerald"
              >
                <Briefcase className="h-3.5 w-3.5" />
                <span>Faculty (staff)</span>
              </button>

              <button
                type="button"
                onClick={async () => {
                  setLoading(true);
                  try {
                    const res = await loginUser('jit001', '1234');
                    if (res.success) routeByRole(res.role);
                  } finally { setLoading(false); }
                }}
                className="flex items-center justify-center gap-1.5 p-2 rounded-xl border border-cyan-500/30 bg-cyan-500/10 text-cyan-300 text-xs font-bold hover:bg-cyan-500/20 transition-all shadow-glow-cyan"
                title="Sign in as Class 12 Science Student (Jit Das)"
              >
                <GraduationCap className="h-3.5 w-3.5" />
                <span>Class 12: Jit Das</span>
              </button>

              <button
                type="button"
                onClick={async () => {
                  setLoading(true);
                  try {
                    const res = await loginUser('sa001', '1234');
                    if (res.success) routeByRole(res.role);
                  } finally { setLoading(false); }
                }}
                className="flex items-center justify-center gap-1.5 p-2 rounded-xl border border-purple-500/30 bg-purple-500/10 text-purple-300 text-xs font-bold hover:bg-purple-500/20 transition-all shadow-glow-purple"
                title="Sign in as Class 10 Sec A Student (Saptashwa Saha)"
              >
                <GraduationCap className="h-3.5 w-3.5" />
                <span>Class 10: Saptashwa</span>
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Right Login / Credential Form */}
      <div className="w-full lg:w-[480px] xl:w-[520px] flex flex-col justify-center px-6 sm:px-12 py-12 relative z-10 bg-[#080B12]/80 backdrop-blur-xl">
        <div className="w-full max-w-sm mx-auto space-y-6">
          {/* School Header Mobile Only */}
          <div className="lg:hidden text-center space-y-2">
            <img src="/school-logo.jpg" alt="Logo" className="h-16 w-16 mx-auto rounded-2xl border border-amber-500/40 object-cover" />
            <h2 className="font-display italic text-2xl font-bold text-white">Pranabananda Vidyamandir</h2>
          </div>

          {/* Auth Method Tabs */}
          <div className="flex p-1 rounded-xl bg-slate-950 border border-white/[0.08]">
            <button
              onClick={() => { setAuthMode('PASSWORD'); setAuthError(null); }}
              className={`flex-1 py-2 text-xs font-bold rounded-lg transition-colors ${
                authMode === 'PASSWORD' ? 'bg-cyan-500 text-black shadow-sm' : 'text-slate-400 hover:text-white'
              }`}
            >
              Password Login
            </button>
            <button
              onClick={() => { setAuthMode('PHONE_OTP'); setAuthError(null); }}
              className={`flex-1 py-2 text-xs font-bold rounded-lg transition-colors ${
                authMode === 'PHONE_OTP' ? 'bg-cyan-500 text-black shadow-sm' : 'text-slate-400 hover:text-white'
              }`}
            >
              Phone OTP
            </button>
          </div>

          {authError && (
            <div className="p-3 rounded-xl border border-rose-500/30 bg-rose-500/10 text-xs text-rose-300 animate-in fade-in">
              {authError}
            </div>
          )}

          {/* Google OAuth Button */}
          <button
            type="button"
            onClick={handleGoogleSignIn}
            disabled={loading}
            className="w-full py-2.5 px-4 rounded-xl border border-white/15 bg-white/[0.04] hover:bg-white/[0.08] text-white text-xs font-semibold flex items-center justify-center gap-2 transition-all"
          >
            <svg className="h-4 w-4" viewBox="0 0 24 24">
              <path fill="#4285F4" d="M23.745 12.27c0-.7-.06-1.4-.19-2.07H12v4.51h6.6c-.29 1.52-1.14 2.82-2.4 3.68v3.05h3.88c2.27-2.09 3.66-5.17 3.66-9.17z"/>
              <path fill="#34A853" d="M12 24c3.24 0 5.95-1.08 7.93-2.91l-3.88-3.05c-1.08.72-2.45 1.16-4.05 1.16-3.12 0-5.77-2.1-6.72-4.93H1.26v3.15C3.25 21.36 7.31 24 12 24z"/>
              <path fill="#FBBC05" d="M5.28 14.27c-.25-.72-.38-1.49-.38-2.27s.13-1.55.38-2.27V6.58H1.26C.46 8.16 0 9.94 0 12s.46 3.84 1.26 5.42l4.02-3.15z"/>
              <path fill="#EA4335" d="M12 4.75c1.77 0 3.35.61 4.6 1.8l3.42-3.42C17.95 1.19 15.24 0 12 0 7.31 0 3.25 2.64 1.26 6.58l4.02 3.15c.95-2.83 3.6-4.98 6.72-4.98z"/>
            </svg>
            <span>Sign In with Google</span>
          </button>

          <div className="flex items-center gap-3 text-slate-500 text-[11px]">
            <div className="flex-1 h-px bg-white/10" />
            <span>OR CONTINUE WITH CREDENTIALS</span>
            <div className="flex-1 h-px bg-white/10" />
          </div>

          {authMode === 'PASSWORD' ? (
            /* Standard Username & Password Form */
            <form onSubmit={handlePasswordSubmit} className="space-y-4">
              <div className="space-y-1.5">
                <label className="text-xs font-medium text-slate-300">Username or Email</label>
                <div className="relative">
                  <User className="absolute left-3 top-2.5 h-4 w-4 text-slate-500" />
                  <input
                    type="text"
                    required
                    value={usernameOrEmail}
                    onChange={(e) => setUsernameOrEmail(e.target.value)}
                    placeholder="admin, staff, student, or employee"
                    className="w-full rounded-xl border border-white/10 bg-slate-950 pl-9 pr-3 py-2.5 text-xs text-white placeholder-slate-600 focus:border-cyan-500 focus:outline-none"
                  />
                </div>
              </div>

              <div className="space-y-1.5">
                <div className="flex items-center justify-between text-xs">
                  <label className="font-medium text-slate-300">Password</label>
                  <span className="text-[11px] text-cyan-400 font-mono">Demo: 1234</span>
                </div>
                <div className="relative">
                  <Lock className="absolute left-3 top-2.5 h-4 w-4 text-slate-500" />
                  <input
                    type={showPassword ? 'text' : 'password'}
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="••••••••"
                    className="w-full rounded-xl border border-white/10 bg-slate-950 pl-9 pr-10 py-2.5 text-xs text-white placeholder-slate-600 focus:border-cyan-500 focus:outline-none"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-2.5 text-slate-500 hover:text-white"
                  >
                    {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </button>
                </div>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full py-2.5 rounded-xl bg-gradient-to-r from-cyan-500 to-blue-600 text-black font-bold text-xs tracking-wide hover:opacity-90 disabled:opacity-50 transition-all shadow-glow-cyan"
              >
                {loading ? 'Authenticating...' : 'Sign In to Portal →'}
              </button>
            </form>
          ) : (
            /* Phone OTP Form */
            <div className="space-y-4">
              {!otpSent ? (
                <form onSubmit={handleSendPhoneOTP} className="space-y-4">
                  <div className="space-y-1.5">
                    <label className="text-xs font-medium text-slate-300">Mobile Phone Number</label>
                    <div className="relative">
                      <Phone className="absolute left-3 top-2.5 h-4 w-4 text-slate-500" />
                      <input
                        type="tel"
                        required
                        value={phone}
                        onChange={(e) => setPhone(e.target.value)}
                        placeholder="+91 9435012345"
                        className="w-full rounded-xl border border-white/10 bg-slate-950 pl-9 pr-3 py-2.5 text-xs text-white placeholder-slate-600 focus:border-cyan-500 focus:outline-none"
                      />
                    </div>
                  </div>

                  <button
                    type="submit"
                    disabled={otpLoading}
                    className="w-full py-2.5 rounded-xl bg-gradient-to-r from-cyan-500 to-blue-600 text-black font-bold text-xs tracking-wide hover:opacity-90 disabled:opacity-50 transition-all shadow-glow-cyan"
                  >
                    {otpLoading ? 'Sending OTP...' : 'Send Verification OTP →'}
                  </button>
                </form>
              ) : (
                <form onSubmit={handleVerifyPhoneOTP} className="space-y-4">
                  <div className="space-y-1.5">
                    <div className="flex items-center justify-between text-xs">
                      <label className="font-medium text-slate-300">Enter 6-Digit OTP</label>
                      <span className="text-[11px] text-cyan-400 font-mono">Test code: 123456</span>
                    </div>
                    <input
                      type="text"
                      required
                      maxLength={6}
                      value={otpToken}
                      onChange={(e) => setOtpToken(e.target.value)}
                      placeholder="123456"
                      className="w-full rounded-xl border border-white/10 bg-slate-950 text-center tracking-widest text-lg font-mono py-2 text-white focus:border-cyan-500 focus:outline-none"
                    />
                  </div>

                  <div className="flex gap-2">
                    <button
                      type="button"
                      onClick={() => setOtpSent(false)}
                      className="flex-1 py-2.5 rounded-xl border border-white/10 text-xs font-semibold text-slate-400 hover:text-white"
                    >
                      Change Phone
                    </button>
                    <button
                      type="submit"
                      disabled={otpLoading}
                      className="flex-1 py-2.5 rounded-xl bg-cyan-500 hover:bg-cyan-400 text-black font-bold text-xs transition-all shadow-glow-cyan"
                    >
                      {otpLoading ? 'Verifying...' : 'Verify OTP'}
                    </button>
                  </div>
                </form>
              )}
            </div>
          )}

          {/* Quick Nav Links */}
          <div className="pt-2 text-center flex items-center justify-between text-xs text-slate-400">
            <button
              type="button"
              onClick={() => onNavigate('landing')}
              className="hover:text-white"
            >
              ← Back to Overview
            </button>
            <button
              type="button"
              onClick={() => onNavigate('about')}
              className="hover:text-white underline underline-offset-4"
            >
              About PVM Lumding
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
