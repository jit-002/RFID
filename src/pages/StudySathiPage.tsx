import { QuizSubject } from '../types/quiz';
import React, { useState, useEffect, useRef } from 'react';
import { useApp } from '../context/AppContext';
import { ClaudeChatInput, FileWithPreview, PastedContent, DEFAULT_STUDY_MODELS } from '../components/ui/claude-style-ai-input';
import { studySathiService, StudyMessage, StudyThread } from '../services/studySathiService';
import { routeUserIntent } from '../services/ai/intentRouter';
import { LoginRequiredCard } from '../components/common/LoginRequiredCard';
import { AcademicRenderer } from '../components/ui/academic-renderer';
import {
  ArrowLeft,
  BookOpen,
  Sparkles,
  Plus,
  Trash2,
  Volume2,
  VolumeX,
  Copy,
  Check,
  Bot,
  User,
  GraduationCap,
  MessageSquare,
  FileText,
  ImageIcon,
  ShieldCheck,
  ExternalLink,
  Download,
  RefreshCw,
  Square
} from 'lucide-react';

interface StudySathiPageProps {
  onNavigate: (tab: string) => void;
}

export const StudySathiPage: React.FC<StudySathiPageProps> = ({ onNavigate }) => {
  const {
    userRole,
    isAuthenticated,
    currentStudent,
    currentStaff,
    currentEmployee,
    studySathiApiKey
  } = useApp();

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
  const studentName = userRole === 'STUDENT' ? (currentStudent?.name || 'Student') : userRole === 'STAFF' ? (currentStaff?.name || 'Teacher') : 'Scholar';
  const threadsKey = `smartx_study_sathi_threads_${userRole || 'GUEST'}_${cleanUserId}`;

  // Threads state
  
  // Automatically create a NEW Study Sathi conversation and preload the prompt from Sathi Quiz doubts
  useEffect(() => {
    try {
      const pendingPrompt = localStorage.getItem('sathi_quiz_doubt_prompt');
      const pendingTitle = localStorage.getItem('sathi_quiz_doubt_title') || 'AI — Mistake Review';
      if (pendingPrompt) {
        localStorage.removeItem('sathi_quiz_doubt_prompt');
        localStorage.removeItem('sathi_quiz_doubt_title');

        const newId = `th-doubt-${Date.now()}`;
        const newThread: StudyThread = {
          id: newId,
          title: pendingTitle,
          createdAt: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
          updatedAt: new Date().toISOString(),
          messages: []
        };

        setThreads(prev => [newThread, ...prev]);
        setActiveThreadId(newId);

        // Preload prompt into composer without sending
        setComposerText(pendingPrompt);

        // Focus composer textarea
        setTimeout(() => {
          const textarea = document.querySelector('textarea');
          if (textarea) {
            textarea.focus();
            textarea.setSelectionRange(textarea.value.length, textarea.value.length);
          }
        }, 150);
      }
    } catch (e) {
      console.warn('Could not read pending doubt prompt:', e);
    }
  }, []);

  const [threads, setThreads] = useState<StudyThread[]>(() => {
    try {
      const saved = localStorage.getItem(threadsKey);
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) {
          // Sort by last active / updatedAt descending so most recent is at the top (index 0)
          return parsed.sort((a, b) => {
            const timeA = new Date(a.updatedAt || a.createdAt || 0).getTime();
            const timeB = new Date(b.updatedAt || b.createdAt || 0).getTime();
            return timeB - timeA;
          });
        }
      }
    } catch {}
    return [
      {
        id: `th-${Date.now()}`,
        title: 'New Study Session',
        createdAt: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        updatedAt: new Date().toISOString(),
        messages: []
      }
    ];
  });

  const [composerText, setComposerText] = useState<string>('');
  const [activeThreadId, setActiveThreadId] = useState<string>(() => threads[0]?.id || `th-${Date.now()}`);
  const [loading, setLoading] = useState(false);
  const [isImageGenerating, setIsImageGenerating] = useState(false);
  const [activeModel, setActiveModel] = useState('auto');
  const [copiedMsgId, setCopiedMsgId] = useState<string | null>(null);
  const [speakingMsgId, setSpeakingMsgId] = useState<string | null>(null);
  const [autoSpeak, setAutoSpeak] = useState(false);
  const [isListening, setIsListening] = useState(false);
  const [threadToDelete, setThreadToDelete] = useState<StudyThread | null>(null);
  const [isOnline, setIsOnline] = useState<boolean>(navigator.onLine);

  useEffect(() => {
    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);
    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);
    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  // Strict Sathi Branding sanitizer (Req 14, 18, 33, 47)
  const cleanModelBadge = (modelUsed?: string, isImage?: boolean): string => {
    if (isImage || (modelUsed && (
      modelUsed.toLowerCase().includes('puter') || 
      modelUsed.toLowerCase().includes('creative') || 
      modelUsed.toLowerCase().includes('canvas') || 
      modelUsed.toLowerCase().includes('image')
    ))) {
      return 'Sathi Creative';
    }
    if (!modelUsed) return 'Study Sathi';
    const lower = modelUsed.toLowerCase();
    if (lower.includes('offline')) {
      return isOnline ? 'Study Sathi' : 'Study Sathi (Offline)';
    }
    if (lower.includes('vision')) return 'Study Sathi Vision';
    if (lower.includes('pro') || lower.includes('2.5-pro') || lower.includes('3.1-pro') || lower.includes('3.5-pro')) {
      return 'Study Sathi Pro';
    }
    return 'Study Sathi';
  };

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const recognitionRef = useRef<any>(null);
  const abortControllerRef = useRef<AbortController | null>(null);

  const handleStopGeneration = () => {
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
      abortControllerRef.current = null;
    }
    setLoading(false);
  };

  // Save threads to localStorage (strictly authenticated only)
  useEffect(() => {
    if (!isAuthenticated) return;
    try {
      localStorage.setItem(threadsKey, JSON.stringify(threads));
    } catch (e) {
      console.warn('Failed to save study sathi threads:', e);
    }
  }, [threads, threadsKey, isAuthenticated]);

  const activeThread = threads.find(t => t.id === activeThreadId) || threads[0];

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [activeThread?.messages, loading]);

  // Handle SpeechSynthesis audio playback with clean spoken math conversion
  const handleToggleSpeak = (msgId: string, text: string) => {
    if (typeof window === 'undefined' || !window.speechSynthesis) return;

    if (speakingMsgId === msgId) {
      window.speechSynthesis.cancel();
      setSpeakingMsgId(null);
      return;
    }

    window.speechSynthesis.cancel();
    // Convert mathematical and LaTeX symbols into natural spoken English
    let cleanText = text
      .replace(/\\int/g, 'integral of ')
      .replace(/\\frac\{([^}]+)\}\{([^}]+)\}/g, '$1 over $2')
      .replace(/\\sqrt\{([^}]+)\}/g, 'square root of $1')
      .replace(/\^2/g, ' squared')
      .replace(/\^3/g, ' cubed')
      .replace(/e\^x/g, 'e to the power x')
      .replace(/\\sum/g, 'sum of ')
      .replace(/\\cdot/g, ' times ')
      .replace(/\\times/g, ' times ')
      .replace(/\\pm/g, ' plus or minus ')
      .replace(/\\approx/g, ' approximately ')
      .replace(/\\neq/g, ' is not equal to ')
      .replace(/\\leq/g, ' is less than or equal to ')
      .replace(/\\geq/g, ' is greater than or equal to ')
      .replace(/\\rightarrow/g, ' approaches ')
      .replace(/[*_#`$]/g, '')
      .replace(/\\[a-zA-Z]+/g, '')
      .trim();

    const utterance = new SpeechSynthesisUtterance(cleanText);
    utterance.rate = 1.0;
    utterance.pitch = 1.0;

    utterance.onend = () => setSpeakingMsgId(null);
    utterance.onerror = () => setSpeakingMsgId(null);

    setSpeakingMsgId(msgId);
    window.speechSynthesis.speak(utterance);
  };

  // Voice speech recognition
  const handleToggleVoice = () => {
    if (typeof window === 'undefined') return;

    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (!SpeechRecognition) {
      alert('Speech recognition is not supported in this browser. Please use Chrome or Edge.');
      return;
    }

    if (isListening) {
      recognitionRef.current?.stop();
      setIsListening(false);
      return;
    }

    try {
      const recognition = new SpeechRecognition();
      recognition.continuous = false;
      recognition.interimResults = false;
      recognition.lang = 'en-IN';

      recognition.onstart = () => setIsListening(true);
      recognition.onresult = (event: any) => {
        const transcript = event.results[0]?.[0]?.transcript;
        if (transcript) {
          handleSendMessage(transcript, [], []);
        }
      };
      recognition.onerror = () => setIsListening(false);
      recognition.onend = () => setIsListening(false);

      recognitionRef.current = recognition;
      recognition.start();
    } catch (err) {
      console.warn('Speech recognition error:', err);
      setIsListening(false);
    }
  };

  const handleSelectThread = (threadId: string) => {
    setActiveThreadId(threadId);
    setThreads(prev => {
      const idx = prev.findIndex(t => t.id === threadId);
      if (idx <= 0) return prev;
      const selected = { ...prev[idx], updatedAt: new Date().toISOString() };
      const rest = prev.filter(t => t.id !== threadId);
      return [selected, ...rest];
    });
  };

  const handleCreateNewThread = () => {
    const newThread: StudyThread = {
      id: `th-${Date.now()}`,
      title: 'New Study Session',
      createdAt: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      updatedAt: new Date().toISOString(),
      messages: []
    };
    setThreads(prev => [newThread, ...prev]);
    setActiveThreadId(newThread.id);
  };

  const confirmDeleteThread = (id: string) => {
    setThreads(prev => {
      const filtered = prev.filter(t => t.id !== id);
      if (filtered.length === 0) {
        const fresh: StudyThread = {
          id: `th-${Date.now()}`,
          title: 'New Study Session',
          createdAt: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
          updatedAt: new Date().toISOString(),
          messages: []
        };
        setActiveThreadId(fresh.id);
        return [fresh];
      }
      if (activeThreadId === id) {
        setActiveThreadId(filtered[0].id);
      }
      return filtered;
    });
  };

  const handleCopy = (id: string, text: string) => {
    navigator.clipboard.writeText(text);
    setCopiedMsgId(id);
    setTimeout(() => setCopiedMsgId(null), 2000);
  };

  const handleCopyImage = async (url: string) => {
    try {
      if (url.startsWith('data:image')) {
        const res = await fetch(url);
        const blob = await res.blob();
        await navigator.clipboard.write([new ClipboardItem({ [blob.type]: blob })]);
      } else {
        await navigator.clipboard.writeText(url);
      }
      setCopiedMsgId(url);
      setTimeout(() => setCopiedMsgId(null), 2000);
    } catch {
      navigator.clipboard.writeText(url);
      setCopiedMsgId(url);
      setTimeout(() => setCopiedMsgId(null), 2000);
    }
  };

  const handleSaveImage = (url: string, filename: string = 'Study-Sathi-Diagram.png') => {
    const link = document.createElement('a');
    link.href = url;
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleSendMessage = async (
    userText: string,
    attachedFiles: FileWithPreview[] = [],
    pasted: PastedContent[] = []
  ) => {
    if (!userText.trim() && attachedFiles.length === 0 && pasted.length === 0) return;

    const userMsgId = `m-${Date.now()}`;
    const userMsg: StudyMessage = {
      id: userMsgId,
      sender: 'USER',
      text: userText,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      files: attachedFiles.map(f => ({ name: f.file.name, type: f.type, preview: f.preview }))
    };

    // Update active thread with user message
    const updatedMessages = [...(activeThread.messages || []), userMsg];
    const threadTitle = activeThread.messages.length === 0
      ? (userText.slice(0, 32) || 'Study Session')
      : activeThread.title;

    // Update active thread with user message and bubble to top of thread list
    setThreads(prev => {
      const existing = prev.find(t => t.id === activeThreadId);
      if (!existing) return prev;
      const updated = {
        ...existing,
        title: threadTitle,
        messages: updatedMessages,
        updatedAt: new Date().toISOString()
      };
      const rest = prev.filter(t => t.id !== activeThreadId);
      return [updated, ...rest];
    });

    // Build memory history from current thread messages
    const history = (activeThread.messages || []).slice(-8).map(m => ({
      role: (m.sender === 'USER' ? 'user' : 'model') as 'user' | 'model',
      text: m.text
    }));

    // Pre-route intent to set accurate UI loading states (Req 14, 42)
    const structuredIntent = routeUserIntent({
      query: userText,
      history,
      hasImages: attachedFiles.some(f => f.type.startsWith('image/')),
      hasPdfs: attachedFiles.some(f => f.type === 'application/pdf' || f.file.name.toLowerCase().endsWith('.pdf')),
      studentGrade: currentStudent?.classGrade || '12'
    });
    const isImageReq = structuredIntent.intent === 'IMAGE_GENERATION' || activeModel === 'sathi-creative' || activeModel === 'sathi-canvas';
    setIsImageGenerating(isImageReq);
    setLoading(true);

    // Detect Quiz Generation Request (e.g. "take a 2 min quiz for me", "quick quiz on physics")
    const quizRegex = /(?:take|start|give|create|generate|conduct)\s+(?:a\s+)?(?:(\d+)\s*(?:min|minute|question|mcq)?)?\s*quiz|quiz\s+me|quick\s+quiz/i;
    const isQuizMatch = quizRegex.test(userText);

    if (isQuizMatch) {
      // Extract requested duration or question count
      const match = userText.match(/(\d+)\s*(?:min|minute)/i);
      const minutes = match ? parseInt(match[1], 10) : 2;

      // Extract subject if mentioned
      let detectedSubject: QuizSubject = 'Physics';
      if (/chem/i.test(userText)) detectedSubject = 'Chemistry';
      else if (/math/i.test(userText)) detectedSubject = 'Mathematics';
      else if (/comp|python|cs|ai/i.test(userText)) detectedSubject = 'AI / Computer';
      else if (/eng/i.test(userText)) detectedSubject = 'English';
      else if (/pe|physical/i.test(userText)) detectedSubject = 'Physical Education';

      const qCount = Math.max(3, Math.min(minutes * 2.5, 10));

      // Save auto-launch payload for Sathi Quiz engine
      localStorage.setItem('sathi_auto_launch_quiz', JSON.stringify({
        subject: detectedSubject,
        questionCount: Math.round(qCount),
        durationMinutes: minutes,
        topic: userText.slice(0, 50),
        timestamp: Date.now()
      }));

      const aiMsgId = `ai-${Date.now()}`;
      const aiMsg: StudyMessage = {
        id: aiMsgId,
        sender: 'AI',
        text: `### 🚀 Launching ${minutes}-Minute ${detectedSubject} Quick Quiz!\n\nI've generated a customized ${Math.round(qCount)}-MCQ rapid assessment in **${detectedSubject}** tailored for Class 12 CBSE.\n\n- **Questions**: ${Math.round(qCount)} MCQs (+4 / -1 marking)\n- **Duration**: ${minutes} Minutes\n- **Evaluation**: Instant OMR Diagnostic with KaTeX step-by-step solutions.\n\n*Redirecting you to the live quiz examination screen now...*`,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        modelUsed: 'Study Sathi 2.0 Quiz Engine',
        type: 'text'
      };

      setThreads(prev => {
        const existing = prev.find(t => t.id === activeThreadId);
        if (!existing) return prev;
        return [
          {
            ...existing,
            messages: [...existing.messages, userMsg, aiMsg],
            updatedAt: new Date().toISOString()
          },
          ...prev.filter(t => t.id !== activeThreadId)
        ];
      });

      setLoading(false);

      // Auto-redirect to Sathi Quiz within 1.2 seconds
      setTimeout(() => {
        onNavigate('sathi-quiz');
        window.location.hash = '#sathi-quiz';
      }, 1200);

      return;
    }

    const filesPayload = attachedFiles.map(f => ({
      name: f.file.name,
      type: f.type,
      base64: f.base64,
      preview: f.preview,
      textContent: f.textContent
    }));

    // Extract image base64
    const images = attachedFiles
      .filter(f => f.base64 && f.type.startsWith('image/'))
      .map(f => f.base64 as string);

    // Extract document / PDF base64
    const documents = attachedFiles
      .filter(f => f.base64 && (f.type === 'application/pdf' || f.file.name.toLowerCase().endsWith('.pdf')))
      .map(f => ({
        base64: f.base64 as string,
        mimeType: 'application/pdf',
        name: f.file.name
      }));

    const controller = new AbortController();
    abortControllerRef.current = controller;

    try {
      const response = await studySathiService.askStudySathi({
        query: userText,
        history,
        files: filesPayload,
        images,
        documents,
        studentName,
        classGrade: currentStudent?.classGrade || '12',
        modelId: activeModel,
        apiKey: studySathiApiKey,
        signal: controller.signal
      });

      const aiMsgId = `ai-${Date.now()}`;
      const aiMsg: StudyMessage = {
        id: aiMsgId,
        sender: 'AI',
        text: response.answer,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        modelUsed: response.modelUsed || (response.messageType === 'IMAGE_GENERATION' ? 'Sathi Creative' : 'Study Sathi'),
        audioAvailable: true,
        generatedImageUrl: response.generatedImageUrl,
        modelSwitchedNotice: undefined, // Suppress switch notice per Req 14 & 16
        type: response.messageType === 'IMAGE_GENERATION' ? 'image_generation' : 'text',
        prompt: userText,
        generationId: response.generationId,
        isTruncated: response.isTruncated
      };

      // Functional update to avoid race conditions: bubble active thread to top of list
      setThreads(prev => {
        const existing = prev.find(t => t.id === activeThreadId);
        if (!existing) return prev;
        const updated = {
          ...existing,
          messages: [...existing.messages, aiMsg],
          updatedAt: new Date().toISOString()
        };
        const rest = prev.filter(t => t.id !== activeThreadId);
        return [updated, ...rest];
      });

      if (autoSpeak) {
        handleToggleSpeak(aiMsgId, response.answer);
      }
    } catch (err: any) {
      if (err?.message === 'Generation stopped by user.' || err?.structured?.errorCode === 'ABORTED') {
        // User aborted, do not show scary error
        return;
      }
      const errorText = isImageReq
        ? '⚠ Image generation failed. Please try again.'
        : (err?.structured?.userMessage || 'Sorry, I couldn\'t connect to Study Sathi right now. Please try again.');
      const errorMsg: StudyMessage = {
        id: `err-${Date.now()}`,
        sender: 'AI',
        text: errorText,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        modelUsed: isImageReq ? 'Sathi Creative' : 'Study Sathi'
      };
      setThreads(prev => {
        const existing = prev.find(t => t.id === activeThreadId);
        if (!existing) return prev;
        const updated = {
          ...existing,
          messages: [...existing.messages, errorMsg],
          updatedAt: new Date().toISOString()
        };
        const rest = prev.filter(t => t.id !== activeThreadId);
        return [updated, ...rest];
      });
    } finally {
      abortControllerRef.current = null;
      setIsImageGenerating(false);
      setLoading(false);
    }
  };

  const starterPrompts = [
    {
      title: "📐 Solve Calculus & Integration",
      desc: "Step-by-step methods, formulas, and substitution rules",
      prompt: "Explain integration by substitution with a step-by-step CBSE Class 12 example problem."
    },
    {
      title: "🔬 Physics Concepts & Derivations",
      desc: "Mechanics, Electromagnetism, and Optics formulas",
      prompt: "Derive the formula for electric field due to a dipole on the axial line with CBSE format."
    },
    {
      title: "📄 Question Paper / Photo Inspection",
      desc: "Upload a picture of any problem for instant analysis",
      prompt: "How can I solve CBSE sample paper question 5 on matrix inversion?"
    },
    {
      title: "💻 Computer Science & Python (AI 843)",
      desc: "Algorithm analysis, SQL queries, and Python logic",
      prompt: "Write a clean Python program to implement binary search on a sorted list with comments."
    }
  ];

  // 1. Mandatory Authentication Gate
  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-[#07090E] text-slate-100 flex flex-col justify-center">
        <LoginRequiredCard
          title="PVM Sathi 2.0 Requires Sign In"
          description="PVM Sathi 2.0 and Study Sathi are private academic tools and AI learning companions. Please log in to continue and keep your academic history private."
          onLogin={() => onNavigate('login')}
          onBack={() => onNavigate('landing')}
        />
      </div>
    );
  }

  return (
    <div className="flex h-screen w-full bg-[#07090E] text-slate-100 overflow-hidden font-sans">
      {/* Sidebar: Chat History Threads */}
      <aside className="w-72 hidden md:flex flex-col border-r border-white/[0.08] bg-[#0A0D14]/90 backdrop-blur-xl">
        {/* Sidebar Header */}
        <div className="p-3.5 border-b border-white/[0.08] flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="p-1.5 rounded-xl bg-gradient-to-br from-cyan-500 to-blue-600 text-black shadow-glow-cyan">
              <GraduationCap className="h-4 w-4" />
            </div>
            <div>
              <h2 className="text-xs font-bold text-white tracking-tight">Study Sathi</h2>
              <span className="text-[9px] font-mono text-cyan-400">PVM Sathi 2.0 Academic</span>
            </div>
          </div>

          <button
            onClick={handleCreateNewThread}
            className="p-1.5 rounded-xl border border-white/10 hover:bg-white/10 text-slate-300 hover:text-white transition-all shadow-sm"
            title="Start New Study Session"
          >
            <Plus className="h-4 w-4" />
          </button>
        </div>

        {/* Sessions List */}
        <div className="flex-1 overflow-y-auto p-2 space-y-1 custom-scrollbar">
          <div className="px-2.5 py-1 text-[10px] font-mono text-slate-500 uppercase tracking-wider">
            Your Study Threads ({threads.length})
          </div>

          {threads.map(thread => (
            <div
              key={thread.id}
              onClick={() => handleSelectThread(thread.id)}
              className={`group flex items-center justify-between px-3 py-2 rounded-xl text-xs cursor-pointer transition-all ${
                activeThreadId === thread.id
                  ? 'bg-cyan-500/15 text-cyan-200 border border-cyan-500/30 font-semibold shadow-sm'
                  : 'text-slate-400 hover:bg-white/[0.04] hover:text-slate-200'
              }`}
            >
              <div className="flex items-center gap-2 min-w-0 pr-2">
                <MessageSquare className="h-3.5 w-3.5 shrink-0 text-cyan-400" />
                <span className="truncate">{thread.title}</span>
              </div>

              <button
                onClick={(e) => {
                  e.stopPropagation();
                  setThreadToDelete(thread);
                }}
                className="opacity-0 group-hover:opacity-100 p-1 hover:text-rose-400 rounded transition-opacity"
                title="Delete study session"
              >
                <Trash2 className="h-3.5 w-3.5" />
              </button>
            </div>
          ))}
        </div>

        {/* User Badge Footer */}
        <div className="p-3 border-t border-white/[0.08] bg-black/20 flex items-center justify-between text-xs">
          <div className="flex items-center gap-2 min-w-0">
            <div className="h-7 w-7 rounded-full bg-gradient-to-tr from-cyan-500 to-indigo-500 flex items-center justify-center font-bold text-black text-[11px] shrink-0">
              {studentName[0]?.toUpperCase() || 'S'}
            </div>
            <div className="min-w-0">
              <p className="text-xs font-semibold text-white truncate">{studentName}</p>
              <p className="text-[10px] text-slate-400 font-mono truncate">{userRole || 'Guest'}</p>
            </div>
          </div>
          <span title="Private & Encrypted Session">
            <ShieldCheck className="h-4 w-4 text-emerald-400 shrink-0" />
          </span>
        </div>
      </aside>

      {/* Main Study Hub Area */}
      <div className="flex-1 flex flex-col h-full overflow-hidden bg-gradient-to-b from-[#07090E] via-[#0A0D15] to-[#05060A]">
        {/* Top Header Navigation */}
        <header className="h-14 border-b border-white/[0.08] px-4 flex items-center justify-between bg-black/40 backdrop-blur-xl shrink-0">
          <div className="flex items-center gap-3">
            <button
              onClick={() => {
                if (userRole === 'STUDENT') onNavigate('student');
                else if (userRole === 'STAFF') onNavigate('staff');
                else if (userRole === 'SUPER_ADMIN' || userRole === 'ADMIN') onNavigate('admin');
                else onNavigate('landing');
              }}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-white/10 hover:bg-white/[0.08] text-xs font-semibold text-slate-300 hover:text-white transition-colors"
            >
              <ArrowLeft className="h-3.5 w-3.5 text-cyan-400" />
              <span>Back to Campus Dashboard</span>
            </button>

            <div className="hidden sm:flex items-center gap-2 pl-3 border-l border-white/[0.08]">
              <span className="font-display italic text-sm font-bold text-white">Study Sathi</span>
              <span className="px-2 py-0.5 rounded-full text-[9px] font-mono bg-cyan-500/15 text-cyan-300 border border-cyan-500/30">
                PVM Sathi 2.0
              </span>
              <div className={`flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-mono ${
                isOnline
                  ? 'bg-emerald-500/10 border border-emerald-500/25 text-emerald-300'
                  : 'bg-amber-500/10 border border-amber-500/25 text-amber-300'
              }`}>
                <span className={`h-1.5 w-1.5 rounded-full ${isOnline ? 'bg-emerald-400 animate-pulse' : 'bg-amber-400'}`} />
                <span>{isOnline ? 'Online' : 'Offline'}</span>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {/* Audio Auto-Read Toggle */}
            <button
              onClick={() => setAutoSpeak(!autoSpeak)}
              className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl border text-xs font-medium transition-colors ${
                autoSpeak
                  ? 'bg-cyan-500/20 text-cyan-300 border-cyan-500/40 shadow-glow-cyan'
                  : 'bg-white/[0.02] text-slate-400 border-white/10 hover:text-white'
              }`}
              title="Toggle automatic speech audio readout"
            >
              {autoSpeak ? <Volume2 className="h-3.5 w-3.5 text-cyan-400" /> : <VolumeX className="h-3.5 w-3.5 text-slate-400" />}
              <span className="hidden md:inline">{autoSpeak ? 'Voice On' : 'Voice Off'}</span>
            </button>
          </div>
        </header>

        {/* Messages Body */}
        <div className="flex-1 overflow-y-auto p-4 md:p-6 space-y-5 custom-scrollbar">
          {(!activeThread?.messages || activeThread.messages.length === 0) ? (
            /* Welcome Hero with Instant Starters */
            <div className="max-w-3xl mx-auto py-8 md:py-12 space-y-6 text-center animate-fade-in">
              <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-tr from-cyan-500/20 to-blue-500/10 border border-cyan-500/30 text-cyan-400 shadow-[0_0_30px_rgba(6,182,212,0.2)]">
                <Sparkles className="h-7 w-7 animate-pulse" />
              </div>

              <div className="space-y-1.5">
                <h1 className="text-2xl md:text-3xl font-display font-bold text-white tracking-tight">
                  What would you like to study today, <span className="text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-blue-400">{studentName}</span>?
                </h1>
                <p className="text-xs md:text-sm text-slate-400 max-w-lg mx-auto">
                  I am **Study Sathi** (PVM Sathi 2.0). Drop textbook questions, upload exam papers, solve math formulas, or generate derivations.
                </p>
              </div>

              {/* Instant Starters Grid */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-left pt-2">
                {starterPrompts.map((s, idx) => (
                  <div
                    key={idx}
                    onClick={() => handleSendMessage(s.prompt, [], [])}
                    className="p-3.5 rounded-2xl bg-white/[0.02] border border-white/[0.06] hover:border-cyan-500/40 hover:bg-white/[0.04] cursor-pointer transition-all duration-200 group"
                  >
                    <h3 className="text-xs font-bold text-white group-hover:text-cyan-300 transition-colors">
                      {s.title}
                    </h3>
                    <p className="text-[11px] text-slate-400 mt-1 leading-relaxed">{s.desc}</p>
                  </div>
                ))}
              </div>
            </div>
          ) : (
            /* Active Message Bubbles */
            <div className="max-w-3xl mx-auto space-y-5">
              {activeThread.messages.map(msg => (
                <div
                  key={msg.id}
                  className={`flex gap-3 text-xs leading-relaxed animate-fade-in ${
                    msg.sender === 'USER' ? 'justify-end' : 'justify-start'
                  }`}
                >
                  {msg.sender === 'AI' && (
                    <div className="h-8 w-8 rounded-xl bg-gradient-to-br from-cyan-500 to-blue-600 flex items-center justify-center text-black font-bold shrink-0 shadow-glow-cyan">
                      <Bot className="h-4 w-4" />
                    </div>
                  )}

                  <div className={`max-w-[85%] sm:max-w-[78%] space-y-2 ${msg.sender === 'USER' ? 'items-end text-right' : 'items-start text-left'}`}>
                    {/* User Uploads Previews */}
                    {msg.files && msg.files.length > 0 && (
                      <div className="flex flex-wrap gap-2 justify-end mb-1">
                        {msg.files.map((f, i) => (
                          <div key={i} className="flex items-center gap-1.5 p-1.5 rounded-lg bg-black/60 border border-white/10 text-[10px] font-mono text-cyan-300">
                            {f.type.startsWith('image/') ? <ImageIcon className="h-3 w-3" /> : <FileText className="h-3 w-3" />}
                            <span className="truncate max-w-[140px]">{f.name}</span>
                          </div>
                        ))}
                      </div>
                    )}

                    {/* Bubble Content */}
                    <div
                      className={`p-4 rounded-2xl shadow-md ${
                        msg.sender === 'USER'
                          ? 'bg-gradient-to-r from-cyan-500 to-blue-600 text-black font-medium rounded-br-none shadow-glow-cyan whitespace-pre-wrap'
                          : 'bg-[#10141E] border border-white/[0.08] text-slate-100 rounded-bl-none'
                      }`}
                    >
                      {msg.sender === 'USER' ? (
                        msg.text
                      ) : (
                        <div className="space-y-3">
                          {/* Note: modelSwitchedNotice suppressed per Req 14/16/47 to avoid leaking internal provider details */}

                          {msg.generatedImageUrl && (
                            <div className="my-3 rounded-2xl overflow-hidden border border-white/10 bg-[#0B0E17] shadow-2xl space-y-0">
                              <div className="relative group overflow-hidden bg-black/60 flex items-center justify-center p-1">
                                <img
                                  src={msg.generatedImageUrl}
                                  alt="Generated academic asset"
                                  className="w-full max-h-[520px] object-contain rounded-t-xl transition-transform duration-300 group-hover:scale-[1.01]"
                                />
                                <div className="absolute top-2.5 right-2.5 flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                                  <a
                                    href={msg.generatedImageUrl}
                                    target="_blank"
                                    rel="noreferrer"
                                    className="px-3 py-1.5 rounded-xl bg-black/85 hover:bg-black text-cyan-300 text-[11px] font-mono border border-cyan-500/40 backdrop-blur-md shadow-lg flex items-center gap-1.5"
                                  >
                                    <ExternalLink className="h-3 w-3" />
                                    <span>Full View</span>
                                  </a>
                                </div>
                              </div>

                              {/* Footer Action Bar (Section 13 & 14) */}
                              <div className="p-3 bg-white/[0.02] border-t border-white/[0.06] flex flex-wrap items-center justify-between gap-2">
                                <div className="flex items-center gap-1.5 text-[11px] font-mono text-cyan-300">
                                  <Sparkles className="h-3.5 w-3.5 text-cyan-400 animate-pulse" />
                                  <span>Generated with Sathi Creative</span>
                                </div>

                                <div className="flex items-center gap-1.5 text-xs">
                                  <button
                                    onClick={() => handleCopyImage(msg.generatedImageUrl!)}
                                    className="px-2.5 py-1 rounded-lg border border-white/10 hover:border-white/20 bg-white/[0.03] text-slate-300 hover:text-white text-[11px] font-mono flex items-center gap-1 transition-colors"
                                    title="Copy image or link to clipboard"
                                  >
                                    {copiedMsgId === msg.generatedImageUrl ? <Check className="h-3 w-3 text-emerald-400" /> : <Copy className="h-3 w-3" />}
                                    <span>{copiedMsgId === msg.generatedImageUrl ? 'Copied' : 'Copy'}</span>
                                  </button>
                                  <a
                                    href={msg.generatedImageUrl}
                                    target="_blank"
                                    rel="noreferrer"
                                    className="px-2.5 py-1 rounded-lg border border-white/10 hover:border-white/20 bg-white/[0.03] text-slate-300 hover:text-white text-[11px] font-mono flex items-center gap-1 transition-colors"
                                    title="Open image in full size"
                                  >
                                    <ExternalLink className="h-3 w-3" />
                                    <span>Open</span>
                                  </a>
                                  <button
                                    onClick={() => handleSaveImage(msg.generatedImageUrl!, 'Study-Sathi-Image.png')}
                                    className="px-2.5 py-1 rounded-lg border border-cyan-500/30 bg-cyan-500/10 hover:bg-cyan-500/20 text-cyan-300 text-[11px] font-mono flex items-center gap-1 transition-colors"
                                    title="Download image"
                                  >
                                    <Download className="h-3 w-3" />
                                    <span>Save</span>
                                  </button>
                                  {msg.prompt && (
                                    <button
                                      onClick={() => handleSendMessage(msg.prompt!, [], [])}
                                      className="px-2.5 py-1 rounded-lg border border-violet-500/30 bg-violet-500/10 hover:bg-violet-500/20 text-violet-300 text-[11px] font-mono flex items-center gap-1 transition-colors"
                                      title="Regenerate this image"
                                    >
                                      <RefreshCw className="h-3 w-3" />
                                      <span>Regenerate</span>
                                    </button>
                                  )}
                                </div>
                              </div>
                            </div>
                          )}

                          <AcademicRenderer content={msg.text} />

                          {msg.isTruncated && (
                            <div className="mt-3 p-3 rounded-xl bg-amber-500/10 border border-amber-500/30 flex flex-wrap items-center justify-between gap-2.5">
                              <span className="text-[11px] text-amber-200">
                                ⚠️ Response was truncated because it reached the model's output limit.
                              </span>
                              <button
                                onClick={() => handleSendMessage("Please continue generating from where you left off. Do not repeat previous text.", [], [])}
                                className="px-3 py-1.5 rounded-lg bg-cyan-500/20 hover:bg-cyan-500/30 text-cyan-300 font-semibold border border-cyan-500/40 text-[11px] transition-colors"
                              >
                                Continue Generating ➔
                              </button>
                            </div>
                          )}
                        </div>
                      )}
                    </div>

                    {/* Metadata & Actions */}
                    <div className={`flex items-center gap-2 text-[10px] font-mono text-slate-500 ${msg.sender === 'USER' ? 'justify-end' : 'justify-start'}`}>
                      <span>{msg.timestamp}</span>
                      {msg.sender === 'AI' && (
                        <span>• {cleanModelBadge(msg.modelUsed, !!msg.generatedImageUrl)}</span>
                      )}

                      {msg.sender === 'AI' && (
                        <div className="flex items-center gap-1 pl-2">
                          <button
                            onClick={() => handleCopy(msg.id, msg.text)}
                            className="p-1 hover:text-white transition-colors"
                            title="Copy answer"
                          >
                            {copiedMsgId === msg.id ? <Check className="h-3 w-3 text-emerald-400" /> : <Copy className="h-3 w-3" />}
                          </button>
                          <button
                            onClick={() => handleToggleSpeak(msg.id, msg.text)}
                            className={`p-1 transition-colors ${speakingMsgId === msg.id ? 'text-cyan-400 animate-pulse' : 'hover:text-white'}`}
                            title={speakingMsgId === msg.id ? 'Stop audio' : 'Listen to answer'}
                          >
                            <Volume2 className="h-3 w-3" />
                          </button>
                        </div>
                      )}
                    </div>
                  </div>

                  {msg.sender === 'USER' && (
                    <div className="h-8 w-8 rounded-xl bg-slate-800 border border-white/10 flex items-center justify-center text-white shrink-0">
                      <User className="h-4 w-4" />
                    </div>
                  )}
                </div>
              ))}

              {/* Generating Animation */}
              {loading && (
                <div className="flex gap-3 text-xs justify-start items-center animate-pulse">
                  <div className="h-8 w-8 rounded-xl bg-gradient-to-br from-cyan-500 to-blue-600 flex items-center justify-center text-black font-bold shrink-0 shadow-glow-cyan">
                    <Bot className="h-4 w-4" />
                  </div>
                  <div className="p-3.5 rounded-2xl bg-[#10141E] border border-white/[0.08] text-cyan-300 font-mono flex items-center justify-between gap-3 min-w-[320px]">
                    <div className="flex items-center gap-2.5">
                      <Sparkles className="h-4 w-4 animate-spin text-cyan-400 shrink-0" />
                      <div className="flex flex-col text-left">
                        {isImageGenerating && <span className="text-[10px] text-cyan-400 font-mono font-bold tracking-wider uppercase">Sathi Creative</span>}
                        <span className="text-xs">{isImageGenerating ? 'Creating your image…' : 'Thinking & solving...'}</span>
                      </div>
                    </div>
                    <button
                      onClick={handleStopGeneration}
                      className="px-2.5 py-1 rounded-lg bg-rose-500/20 hover:bg-rose-500/30 text-rose-300 border border-rose-500/40 text-[11px] font-sans flex items-center gap-1 transition-colors shrink-0"
                      title="Stop generation"
                    >
                      <Square className="h-3 w-3 fill-current" />
                      <span>Stop</span>
                    </button>
                  </div>
                </div>
              )}

              <div ref={messagesEndRef} />
            </div>
          )}
        </div>

        {/* Bottom Input Area */}
        <div className="p-4 border-t border-white/[0.08] bg-black/50 backdrop-blur-xl shrink-0">
          <ClaudeChatInput
            initialValue={composerText}
            key={activeThreadId + (composerText ? '-preloaded' : '')}
            onSendMessage={handleSendMessage}
            onStopGeneration={handleStopGeneration}
            disabled={loading}
            models={DEFAULT_STUDY_MODELS}
            defaultModel={activeModel}
            onModelChange={m => setActiveModel(m)}
            isListening={isListening}
            onToggleVoice={handleToggleVoice}
            placeholder={`Ask Study Sathi 2.0 (e.g. solve question paper, math problem, physics formula)...`}
          />
        </div>
      </div>

      {/* Delete Thread Confirmation Modal */}
      {threadToDelete && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="w-full max-w-sm rounded-2xl border border-white/10 bg-[#0C101A] p-5 shadow-2xl space-y-4">
            <h4 className="text-sm font-bold text-white tracking-tight">Delete this study session?</h4>
            <p className="text-xs text-slate-300 leading-relaxed">
              This will permanently remove the conversation &ldquo;{threadToDelete.title}&rdquo; from your private study history.
            </p>
            <div className="flex items-center justify-end gap-2 pt-2">
              <button
                onClick={() => setThreadToDelete(null)}
                className="px-3.5 py-1.5 rounded-xl border border-white/10 hover:bg-white/10 text-xs font-semibold text-slate-300 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={() => {
                  confirmDeleteThread(threadToDelete.id);
                  setThreadToDelete(null);
                }}
                className="px-3.5 py-1.5 rounded-xl bg-rose-600 hover:bg-rose-500 text-xs font-bold text-white shadow-sm transition-colors"
              >
                Delete Session
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
