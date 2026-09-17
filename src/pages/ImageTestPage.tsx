import React, { useState } from 'react';
import { generateStudySathiImageWithPuter, PUTER_IMAGE_MODELS } from '../services/imageGenerationService';
import { Sparkles, ArrowLeft, Loader2, CheckCircle2, AlertTriangle, RefreshCw } from 'lucide-react';

export const ImageTestPage: React.FC<{ onNavigate?: (tab: string) => void }> = ({ onNavigate }) => {
  const [prompt, setPrompt] = useState('Create an A4 handwritten-style study sheet containing all important Class 12 relation and function formulas');
  const [selectedModel, setSelectedModel] = useState(PUTER_IMAGE_MODELS[0].model);
  const [status, setStatus] = useState<'idle' | 'generating' | 'completed' | 'failed'>('idle');
  const [resultImage, setResultImage] = useState<string | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [logs, setLogs] = useState<string[]>([]);

  const addLog = (msg: string) => {
    const time = new Date().toLocaleTimeString();
    setLogs(prev => [...prev, `[${time}] ${msg}`]);
  };

  const handleGenerate = async () => {
    if (!prompt.trim()) return;
    setStatus('generating');
    setResultImage(null);
    setErrorMsg(null);
    setLogs([]);

    addLog(`Initiating generation for prompt: "${prompt}"`);
    addLog(`Requested model: ${selectedModel}`);

    try {
      const res = await generateStudySathiImageWithPuter({
        prompt,
        topic: prompt.toLowerCase().includes('relation') || prompt.toLowerCase().includes('function')
          ? 'Relations and Functions'
          : prompt.toLowerCase().includes('determinant')
          ? 'Determinants'
          : 'Study Sheet',
        subject: 'Mathematics',
        classLevel: 'Class 12',
        style: 'handwritten',
        options: {
          model: selectedModel
        }
      });

      addLog(`Puter/Service response received: Provider=${res.provider}, Model=${res.model}`);
      addLog(`Generation ID: ${res.generationId}`);
      setResultImage(res.imageUrl);
      setStatus('completed');
    } catch (err: any) {
      const errTxt = err?.userMessage || err?.message || 'Image generation failed.';
      addLog(`Generation Failed: ${errTxt}`);
      setErrorMsg(errTxt);
      setStatus('failed');
    }
  };

  return (
    <div className="min-h-screen bg-[#07090E] text-slate-100 p-4 md:p-8">
      <div className="max-w-4xl mx-auto space-y-6">
        <div className="flex items-center justify-between pb-4 border-b border-white/10">
          <div className="flex items-center gap-3">
            {onNavigate && (
              <button
                onClick={() => onNavigate('study-sathi')}
                className="p-2 rounded-xl border border-white/10 hover:bg-white/10 text-slate-300 transition-colors"
                title="Back to Study Sathi"
              >
                <ArrowLeft className="h-4 w-4" />
              </button>
            )}
            <div>
              <h1 className="text-xl font-bold font-display text-white flex items-center gap-2">
                <Sparkles className="h-5 w-5 text-cyan-400" />
                Puter.js Live Image Generation Test Bench
              </h1>
              <p className="text-xs text-slate-400 font-mono">
                Study Sathi 2.0 • Real-time AI txt2img verification (/dev/image-test)
              </p>
            </div>
          </div>
        </div>

        {/* Quick Test Presets */}
        <div className="space-y-2">
          <label className="text-xs font-semibold text-slate-400 font-mono uppercase tracking-wider">
            Quick Test Scenarios
          </label>
          <div className="flex flex-wrap gap-2">
            <button
              onClick={() => setPrompt('Create an A4 handwritten-style study sheet containing all important Class 12 relation and function formulas')}
              className="text-xs px-3 py-1.5 rounded-lg border border-cyan-500/30 bg-cyan-500/10 hover:bg-cyan-500/20 text-cyan-300 transition-colors"
            >
              Test 1: Class 12 Relations & Functions
            </button>
            <button
              onClick={() => setPrompt('Create an A4 handwritten-style study sheet containing all important Class 12 determinant formulas')}
              className="text-xs px-3 py-1.5 rounded-lg border border-indigo-500/30 bg-indigo-500/10 hover:bg-indigo-500/20 text-indigo-300 transition-colors"
            >
              Test 2: Class 12 Determinants
            </button>
            <button
              onClick={() => setPrompt('A simple red apple on a white background')}
              className="text-xs px-3 py-1.5 rounded-lg border border-emerald-500/30 bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-300 transition-colors"
            >
              Test 3: Simple Object (Red Apple)
            </button>
            <button
              onClick={() => setPrompt('A completely different futuristic cyberpunk city at night with neon lights')}
              className="text-xs px-3 py-1.5 rounded-lg border border-purple-500/30 bg-purple-500/10 hover:bg-purple-500/20 text-purple-300 transition-colors"
            >
              Test 4: Topic Switch (Futuristic City)
            </button>
          </div>
        </div>

        {/* Prompt Input & Model Selector */}
        <div className="p-4 rounded-2xl bg-white/[0.03] border border-white/10 space-y-4">
          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1">
              Image Prompt
            </label>
            <textarea
              value={prompt}
              onChange={e => setPrompt(e.target.value)}
              rows={3}
              className="w-full bg-black/40 border border-white/15 rounded-xl p-3 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-cyan-500"
              placeholder="Enter image description..."
            />
          </div>

          <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="w-full sm:w-auto flex items-center gap-2">
              <label className="text-xs font-mono text-slate-400">Puter Model:</label>
              <select
                value={selectedModel}
                onChange={e => setSelectedModel(e.target.value)}
                className="bg-black/60 border border-white/15 rounded-xl px-3 py-1.5 text-xs text-cyan-300 focus:outline-none focus:border-cyan-500"
              >
                {PUTER_IMAGE_MODELS.map(m => (
                  <option key={m.id} value={m.model}>
                    {m.model} (Priority {m.priority})
                  </option>
                ))}
              </select>
            </div>

            <button
              onClick={handleGenerate}
              disabled={status === 'generating' || !prompt.trim()}
              className="w-full sm:w-auto px-6 py-2.5 rounded-xl bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 font-semibold text-xs text-black flex items-center justify-center gap-2 transition-all disabled:opacity-50"
            >
              {status === 'generating' ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin text-black" />
                  <span>Awaiting Puter API...</span>
                </>
              ) : (
                <>
                  <Sparkles className="h-4 w-4 fill-current" />
                  <span>Generate Live Image</span>
                </>
              )}
            </button>
          </div>
        </div>

        {/* Live Execution Logs */}
        {logs.length > 0 && (
          <div className="p-4 rounded-2xl bg-black/60 border border-white/10 font-mono text-[11px] text-slate-300 space-y-1 max-h-40 overflow-y-auto custom-scrollbar">
            <div className="text-slate-500 uppercase tracking-wider text-[10px] pb-1 border-b border-white/5">
              Live Pipeline Logs
            </div>
            {logs.map((log, i) => (
              <div key={i} className="leading-relaxed">
                {log}
              </div>
            ))}
          </div>
        )}

        {/* Status & Display Canvas */}
        <div className="p-6 rounded-2xl bg-white/[0.02] border border-white/10 flex flex-col items-center justify-center min-h-[350px]">
          {status === 'generating' && (
            <div className="text-center space-y-3">
              <Loader2 className="h-10 w-10 animate-spin text-cyan-400 mx-auto" />
              <p className="text-sm font-semibold text-cyan-300">✨ Generating image with Puter.js...</p>
              <p className="text-xs text-slate-400 max-w-sm">
                Awaiting txt2img Promise. Does not return until actual image is loaded.
              </p>
            </div>
          )}

          {status === 'failed' && (
            <div className="text-center space-y-3 text-rose-400">
              <AlertTriangle className="h-10 w-10 mx-auto text-rose-400" />
              <p className="text-sm font-semibold">⚠ Image generation failed.</p>
              <p className="text-xs text-slate-400">{errorMsg}</p>
              <button
                onClick={handleGenerate}
                className="inline-flex items-center gap-1.5 px-4 py-1.5 rounded-xl bg-rose-500/20 hover:bg-rose-500/30 text-rose-300 text-xs transition-colors"
              >
                <RefreshCw className="h-3.5 w-3.5" />
                <span>Retry</span>
              </button>
            </div>
          )}

          {status === 'completed' && resultImage && (
            <div className="w-full space-y-4 animate-in fade-in duration-300 text-center">
              <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-xs font-mono">
                <CheckCircle2 className="h-3.5 w-3.5" />
                <span>Real Image Generated Successfully</span>
              </div>
              <div className="max-w-lg mx-auto rounded-2xl overflow-hidden border border-white/20 shadow-2xl bg-black">
                <img
                  src={resultImage}
                  alt="Generated"
                  className="w-full h-auto object-contain"
                />
              </div>
            </div>
          )}

          {status === 'idle' && (
            <div className="text-center text-slate-500 text-xs font-mono">
              Click &quot;Generate Live Image&quot; to test the real Puter pipeline.
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
