import React, { useState, useEffect, useRef } from 'react';
import { useApp } from '../../context/AppContext';
import { ChatMessage } from '../../services/aiIntelligence';
import {
  Sparkles,
  Send,
  X,
  CheckCircle2,
  Lock,
  ArrowRight,
  School,
  Bot,
  ShieldCheck,
  GraduationCap,
  Briefcase,
  Wrench,
  Trash2,
  History,
  ChevronDown
} from 'lucide-react';
import { LiquidButton } from '../ui/liquid-glass-button';
import { AcademicRenderer } from '../ui/academic-renderer';
import { LiquidLaunchButton } from '../ui/liquid-launch-button';

interface AIAssistantDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  onNavigate?: (tab: string) => void;
}

interface DisplayMessage {
  sender: 'USER' | 'AI';
  text: string;
  dataPoints?: string[];
  isRealtime?: boolean;
  modelUsed?: string;
}

export const AIAssistantDrawer: React.FC<AIAssistantDrawerProps> = ({ isOpen, onClose, onNavigate }) => {
  const {
    askAI,
    userRole,
    isAuthenticated,
    currentStudent,
    currentStaff,
    currentEmployee,
    initialAIQuery,
    setInitialAIQuery
  } = useApp();

  const [query, setQuery] = useState('');
  const [loading, setLoading] = useState(false);

  // Strictly isolate chat memory per individual user and role to prevent any cross-user leakage
  const currentUserId = isAuthenticated
    ? (userRole === 'STUDENT'
        ? (currentStudent?.admissionNo || currentStudent?.id || 'student')
        : userRole === 'STAFF'
        ? (currentStaff?.id || currentStaff?.email || 'staff')
        : userRole === 'EMPLOYEE'
        ? (currentEmployee?.id || 'employee')
        : 'admin')
    : 'guest';

  const cleanUserId = currentUserId.replace(/[^a-zA-Z0-9_-]/g, '_');
  const storageKey = `smartx_pvm_chat_v2_${userRole || 'GUEST'}_${cleanUserId}`;

  // Track active key and loaded state to completely prevent race conditions
  const activeKeyRef = useRef<string>(storageKey);
  const isLoadedRef = useRef<boolean>(false);

  // Purge legacy unversioned/contaminated keys on first mount
  useEffect(() => {
    try {
      const keysToRemove: string[] = [];
      for (let i = 0; i < localStorage.length; i++) {
        const k = localStorage.key(i);
        if (k && k.startsWith('smartx_pvm_chat_') && !k.startsWith('smartx_pvm_chat_v2_')) {
          keysToRemove.push(k);
        }
      }
      keysToRemove.forEach(k => localStorage.removeItem(k));
    } catch {}
  }, []);

  const getInitialGreeting = (): DisplayMessage => {
    if (!isAuthenticated || !userRole) {
      return {
        sender: 'AI',
        text: `Namaskar! I am Pvm Sathi, the official campus intelligence assistant for Pranabananda Vidyamandir (Lumding, Assam). You are browsing as a Guest. Please sign in to access your personal attendance records and class statistics.`
      };
    }

    if (userRole === 'STUDENT') {
      const studentFirstName = currentStudent?.name ? currentStudent.name.split(' ')[0] : 'Jit';
      return {
        sender: 'AI',
        text: `${studentFirstName}! I am Pvm Sathi, your student intelligence companion. You can check your attendance percentage, calculate days needed for 75% CBSE compliance, or check total classmates present today.`
      };
    }

    if (userRole === 'STAFF') {
      const staffName = currentStaff?.name || 'Faculty Member';
      return {
        sender: 'AI',
        text: `Namaskar, ${staffName}! I am Pvm Sathi for Faculty & Staff. Ask me for student roster details, attendance modifications with administrative reasons, or class turnout.`
      };
    }

    if (userRole === 'EMPLOYEE') {
      const empName = currentEmployee?.name || 'Staff';
      return {
        sender: 'AI',
        text: `Hello, ${empName}! I am Pvm Sathi for Campus Operations. Ask me about shift timings, duty locations, or facility protocols.`
      };
    }

    return {
      sender: 'AI',
      text: `Namaskar Admin! I am Pvm Sathi Command AI. You have full access to campus attendance analytics, IoT device fleet diagnostics, and date-wise Google Sheets automation.`
    };
  };

  const [chatHistory, setChatHistory] = useState<DisplayMessage[]>(() => {
    if (typeof window !== 'undefined') {
      try {
        const saved = localStorage.getItem(storageKey);
        if (saved) {
          const parsed = JSON.parse(saved);
          if (
            parsed &&
            parsed.version === 2 &&
            parsed.role === (userRole || 'GUEST') &&
            parsed.userId === cleanUserId &&
            Array.isArray(parsed.messages) &&
            parsed.messages.length > 0
          ) {
            return parsed.messages.map((m: DisplayMessage) => ({
              ...m,
              text: m.text.replace(/^Jai\s+Guru[,\s!:-]*/gi, '').replace(/\bJai\s+Guru\b[,\s!:-]*/gi, '').trim()
            }));
          }
        }
      } catch (e) {
        console.warn('Failed to load initial chat history:', e);
      }
    }
    return [getInitialGreeting()];
  });

  // Auto-scroll refs and handlers
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const [showScrollDownBtn, setShowScrollDownBtn] = useState(false);

  const scrollToBottom = (behavior: ScrollBehavior = 'smooth') => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior, block: 'end' });
    }
    if (scrollContainerRef.current) {
      scrollContainerRef.current.scrollTo({
        top: scrollContainerRef.current.scrollHeight,
        behavior
      });
    }
  };

  const handleScroll = () => {
    if (!scrollContainerRef.current) return;
    const { scrollTop, scrollHeight, clientHeight } = scrollContainerRef.current;
    const distanceFromBottom = scrollHeight - scrollTop - clientHeight;
    setShowScrollDownBtn(distanceFromBottom > 90);
  };

  // Automatically take user down to the answer whenever new messages or answers arrive
  useEffect(() => {
    scrollToBottom('smooth');
    const timer = setTimeout(() => scrollToBottom('smooth'), 80);
    return () => clearTimeout(timer);
  }, [chatHistory, loading]);

  // When drawer opens, take user down to latest message
  useEffect(() => {
    if (isOpen) {
      const timer = setTimeout(() => scrollToBottom('auto'), 60);
      return () => clearTimeout(timer);
    }
  }, [isOpen]);

  // Strictly switch and load conversation memory whenever active user or role changes
  useEffect(() => {
    activeKeyRef.current = storageKey;
    isLoadedRef.current = false;

    let loadedHistory: DisplayMessage[] | null = null;
    try {
      const saved = localStorage.getItem(storageKey);
      if (saved) {
        const parsed = JSON.parse(saved);
        if (
          parsed &&
          parsed.version === 2 &&
          parsed.role === (userRole || 'GUEST') &&
          parsed.userId === cleanUserId &&
          Array.isArray(parsed.messages) &&
          parsed.messages.length > 0
        ) {
          const firstMsg = parsed.messages[0]?.text || '';
          const isAlienGreeting =
            (userRole === 'STAFF' && (firstMsg.includes('student intelligence companion') || firstMsg.includes('Command AI') || firstMsg.includes('Super Admin'))) ||
            (userRole === 'STUDENT' && (firstMsg.includes('Faculty & Staff') || firstMsg.includes('Command AI') || firstMsg.includes('Super Admin'))) ||
            ((userRole === 'SUPER_ADMIN' || userRole === 'ADMIN') && (firstMsg.includes('student intelligence companion') || firstMsg.includes('Faculty & Staff')));

          if (!isAlienGreeting) {
            loadedHistory = parsed.messages.map((m: DisplayMessage) => ({
              ...m,
              text: m.text.replace(/^Jai\s+Guru[,\s!:-]*/gi, '').replace(/\bJai\s+Guru\b[,\s!:-]*/gi, '').trim()
            }));
          }
        }
      }
    } catch {}

    setChatHistory(loadedHistory || [getInitialGreeting()]);
    isLoadedRef.current = true;
  }, [storageKey, userRole, cleanUserId]);

  // Save conversation memory ONLY when in-memory history belongs strictly to the active storageKey
  useEffect(() => {
    if (
      typeof window !== 'undefined' &&
      isLoadedRef.current &&
      activeKeyRef.current === storageKey &&
      chatHistory.length > 0
    ) {
      try {
        const payload = {
          version: 2,
          role: userRole || 'GUEST',
          userId: cleanUserId,
          messages: chatHistory
        };
        localStorage.setItem(storageKey, JSON.stringify(payload));
      } catch (e) {
        console.warn('Failed to save chat history:', e);
      }
    }
  }, [chatHistory, storageKey, userRole, cleanUserId]);

  const handleClearMemory = () => {
    const fresh = [getInitialGreeting()];
    setChatHistory(fresh);
    try {
      localStorage.removeItem(storageKey);
    } catch {}
  };

  const handleSend = async (customQuery?: string) => {
    const q = customQuery || query;
    if (!q.trim() || loading) return;

    const userMessage: DisplayMessage = { sender: 'USER', text: q };
    const updatedHistory = [...chatHistory, userMessage];
    setChatHistory(updatedHistory);
    setQuery('');
    setLoading(true);

    try {
      // Build conversation history for multi-turn model memory (purging cross-role artifacts)
      const memory: ChatMessage[] = updatedHistory
        .slice(-8)
        .filter(m => {
          if (m.sender === 'AI') {
            if (
              m.text.includes('Namaskar Admin! I am Pvm Sathi Command AI') ||
              m.text.includes('Role: SUPER_ADMIN') ||
              m.text.includes('student intelligence companion')
            ) {
              return false;
            }
          }
          return true;
        })
        .map(m => ({
          role: m.sender === 'USER' ? 'user' : 'model',
          text: m.text
        }));

      const response = await askAI(q, memory);
      const cleanResponseText = (response.answer || '')
        .replace(/^Jai\s+Guru[,\s!:-]*/gi, '')
        .replace(/\bJai\s+Guru\b[,\s!:-]*/gi, '')
        .trim();

      setChatHistory(prev => [
        ...prev,
        {
          sender: 'AI',
          text: cleanResponseText,
          dataPoints: response.dataPoints,
          isRealtime: response.isRealtime,
          modelUsed: response.modelUsed
        }
      ]);
    } catch (err) {
      setChatHistory(prev => [
        ...prev,
        { sender: 'AI', text: 'Pvm Sathi encountered an issue connecting to the inference engine. Please try again shortly.' }
      ]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (isOpen && initialAIQuery && initialAIQuery.trim()) {
      handleSend(initialAIQuery);
      setInitialAIQuery('');
    }
  }, [isOpen, initialAIQuery]);

  const getSuggestions = () => {
    if (!isAuthenticated || !userRole) {
      return [
        'What is Pranabananda Vidyamandir?',
        'Who are the faculty members and teachers?',
        'What is the CBSE 75% attendance rule?'
      ];
    }

    if (userRole === 'STUDENT') {
      return [
        'What is my attendance percentage?',
        'How many more days needed to reach 75%?',
        'How many students are present in my class today?'
      ];
    } else if (userRole === 'STAFF') {
      return [
        'Summary of verified students present today',
        'How do I add reason to change attendance?',
        'Show absent count across sections'
      ];
    } else if (userRole === 'EMPLOYEE') {
      return [
        'What is my assigned duty shift & location?',
        'Show my attendance percentage',
        'Campus operations checklist'
      ];
    }
    return [
      'Campus-wide attendance health score',
      'Status of Raspberry Pi 3B & ESP8266 nodes',
      'Date-partitioned Google Sheets sync status'
    ];
  };

  // Close on Escape key
  useEffect(() => {
    if (!isOpen) return;
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        e.preventDefault();
        e.stopPropagation();
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  const suggestions = getSuggestions();

  if (!isOpen) return null;

  return (
    <div
      onClick={(e) => {
        if (e.target === e.currentTarget) {
          e.preventDefault();
          e.stopPropagation();
          onClose();
        }
      }}
      className="fixed inset-0 z-50 flex justify-end bg-black/60 backdrop-blur-sm animate-in fade-in duration-200"
    >
      {/* Centered Launch Study Sathi Animated Button with Mouse Move Backlights */}
      <div className="hidden md:flex flex-1 items-center justify-center pointer-events-none p-6 z-10">
        <LiquidLaunchButton
          onClick={() => {
            onClose();
            if (onNavigate) {
              onNavigate('study-sathi');
            }
          }}
        />
      </div>

      <div
        onClick={(e) => e.stopPropagation()}
        className="relative flex h-full w-full max-w-lg flex-col border-l border-white/[0.1] bg-[#070A10] p-5 sm:p-6 text-white shadow-2xl"
      >
        {/* Header */}
        <div className="flex items-center justify-between border-b border-white/[0.08] pb-4">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-violet-500 to-indigo-600 shadow-glow-violet">
              <Sparkles className="h-5 w-5 text-white" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-lg font-extrabold bg-gradient-to-r from-amber-300 via-orange-400 to-rose-400 bg-clip-text text-transparent tracking-tight">
                  Pvm Sathi
                </h3>
              </div>
              <p className="text-xs text-slate-300 font-medium">
                Pranabananda Vidyamandir
              </p>
            </div>
          </div>

          <div className="flex items-center gap-1">
            <button
              onClick={handleClearMemory}
              className="p-2 rounded-lg text-slate-400 hover:text-rose-300 hover:bg-rose-500/10 transition-colors"
              title="Clear Memory & Start New Conversation"
            >
              <Trash2 className="h-4 w-4" />
            </button>
            <button
              onClick={onClose}
              className="rounded-lg p-2 text-slate-400 hover:bg-white/[0.06] hover:text-white transition-colors"
            >
              <X className="h-5 w-5" />
            </button>
          </div>
        </div>

        {!isAuthenticated ? (
          <div className="flex-1 flex flex-col items-center justify-center p-6 text-center space-y-5">
            <div className="relative mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-to-br from-violet-500/20 to-purple-500/20 border border-violet-500/30 text-violet-400 shadow-glow-violet">
              <Lock className="h-8 w-8" />
            </div>
            <div className="space-y-2">
              <h4 className="text-lg font-black text-white tracking-tight">🔐 Login Required</h4>
              <p className="text-xs text-slate-400 max-w-xs leading-relaxed">
                PVM Sathi is private and available only to authenticated users. Please log in to continue and keep your academic data private.
              </p>
            </div>
            <div className="w-full space-y-2.5 pt-2 max-w-xs">
              <button
                onClick={() => {
                  onClose();
                  onNavigate?.('login');
                }}
                className="w-full py-3 rounded-xl bg-gradient-to-r from-violet-500 to-indigo-600 hover:from-violet-400 hover:to-indigo-500 text-white font-bold text-xs tracking-wide shadow-lg shadow-violet-500/20 transition-all active:scale-95"
              >
                Sign In to Continue
              </button>
              <button
                onClick={onClose}
                className="w-full py-2.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-xs font-semibold text-slate-300 border border-white/10 transition-colors"
              >
                Back to Dashboard
              </button>
            </div>
          </div>
        ) : (
          <>
        {/* Study Sathi 2.0 Quick Switch Banner */}
        <div className="flex items-center justify-between gap-2 p-2.5 rounded-xl bg-gradient-to-r from-cyan-500/10 via-blue-500/10 to-indigo-500/10 border border-cyan-500/30 text-xs my-2 shrink-0">
          <div className="flex items-center gap-2 min-w-0">
            <span className="flex h-2 w-2 rounded-full bg-cyan-400 shrink-0 animate-pulse" />
            <span className="text-slate-200 text-[11px] truncate">
              Need academic Q&A, problem solving, or vision?
            </span>
          </div>
          <button
            onClick={() => {
              onClose();
              onNavigate?.('study-sathi');
            }}
            className="shrink-0 px-2.5 py-1 rounded-lg bg-cyan-500 hover:bg-cyan-400 text-black font-bold text-[10px] transition-colors shadow-glow-cyan"
          >
            Study Sathi 2.0 →
          </button>
        </div>

        {/* Chat History Area with Auto-Scroll */}
        <div
          ref={scrollContainerRef}
          onScroll={handleScroll}
          className="flex-1 overflow-y-auto py-4 space-y-4 pr-1 scroll-smooth"
        >
          {chatHistory.map((msg, idx) => (
            <div
              key={idx}
              className={`flex flex-col ${msg.sender === 'USER' ? 'items-end' : 'items-start'}`}
            >
              <div
                className={`max-w-[85%] rounded-2xl px-4 py-3 text-xs sm:text-sm leading-relaxed font-sans ${
                  msg.sender === 'USER'
                    ? 'bg-gradient-to-r from-cyan-500 to-blue-600 text-black font-medium'
                    : 'border border-white/[0.08] bg-slate-900/90 text-slate-200 shadow-sm'
                }`}
              >
                {msg.sender === 'USER' ? (
                  <span className="whitespace-pre-wrap">{msg.text}</span>
                ) : (
                  <AcademicRenderer content={msg.text} className="text-xs sm:text-sm leading-relaxed text-slate-200" />
                )}

                {/* Structured verification badges */}
                {msg.dataPoints && msg.dataPoints.length > 0 && (
                  <div className="mt-3 pt-2.5 border-t border-white/[0.08] flex flex-wrap gap-1.5">
                    {msg.dataPoints.map((dp, i) => (
                      <span
                        key={i}
                        className="inline-flex items-center gap-1 rounded-md bg-white/[0.06] px-2 py-0.5 text-[10px] font-mono text-cyan-300"
                      >
                        <CheckCircle2 className="h-2.5 w-2.5 text-cyan-400" />
                        {dp}
                      </span>
                    ))}
                  </div>
                )}
              </div>
            </div>
          ))}

          {loading && (
            <div className="flex items-center gap-2 text-xs text-slate-400 p-2">
              <span className="h-2 w-2 rounded-full bg-violet-400 animate-ping"></span>
              <span>Pvm Sathi is analyzing verified records...</span>
            </div>
          )}

          {/* Anchor node for smooth auto-scroll to bottom */}
          <div ref={messagesEndRef} className="h-1" />
        </div>

        {/* Floating Quick Jump to Latest Message Button */}
        {showScrollDownBtn && (
          <div className="flex justify-center -mt-2 pb-2">
            <button
              type="button"
              onClick={() => scrollToBottom('smooth')}
              className="px-3 py-1 rounded-full bg-violet-600/90 hover:bg-violet-500 text-white text-[11px] font-semibold shadow-lg backdrop-blur-md flex items-center gap-1.5 transition-all animate-bounce"
            >
              <span>Latest answer</span>
              <ChevronDown className="h-3 w-3" />
            </button>
          </div>
        )}

        {/* Suggestion Chips */}
        <div className="space-y-1.5 pb-3">
          <span className="text-[11px] font-semibold text-slate-400">Personalized Prompts:</span>
          <div className="flex flex-wrap gap-1.5">
            {suggestions.map((s, idx) => (
              <button
                key={idx}
                onClick={() => handleSend(s)}
                className="rounded-lg border border-white/[0.08] bg-white/[0.02] px-2.5 py-1 text-[11px] text-slate-300 hover:border-violet-500/40 hover:bg-violet-500/10 hover:text-white transition-all text-left"
              >
                {s}
              </button>
            ))}
          </div>
        </div>

        {/* Input Bar */}
        <form
          onSubmit={(e) => {
            e.preventDefault();
            handleSend();
          }}
          className="relative flex items-center"
        >
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder={`Ask Pvm Sathi (${isAuthenticated && userRole ? userRole : 'Guest'})...`}
            className="w-full rounded-xl border border-white/10 bg-slate-950 pl-4 pr-12 py-3 text-xs text-white placeholder-slate-500 focus:border-violet-500 focus:outline-none"
          />
          <button
            type="submit"
            disabled={!query.trim() || loading}
            className="absolute right-2.5 rounded-lg p-1.5 text-violet-400 hover:bg-violet-500/20 disabled:opacity-30 transition-colors"
          >
            <Send className="h-4 w-4" />
          </button>
        </form>

        {/* Privacy Footer */}
        <div className="mt-3 flex items-center justify-between text-[10px] text-slate-500 border-t border-white/[0.06] pt-2">
          <span className="flex items-center gap-1">
            <Lock className="h-3 w-3 text-emerald-400" />
            Zero-Trust Protected Memory
          </span>
          <span>Pranabananda Vidyamandir</span>
        </div>
          </>
        )}
      </div>
    </div>
  );
};
