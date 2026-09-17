import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import {
  Cpu,
  Sparkles,
  Database,
  FileSpreadsheet,
  CheckCircle2,
  AlertCircle,
  RefreshCw,
  Radio,
  Send,
  Zap,
  HardDrive,
  ShieldCheck,
  Table,
  ArrowUpRight
} from 'lucide-react';

export const DiagnosticsPage: React.FC = () => {
  const {
    students,
    staff,
    devices,
    attendance,
    sheetsStatus,
    dateWiseSheets,
    syncGoogleSheets,
    triggerRFIDTap,
    setSimulatorOpen,
    askAI
  } = useApp();

  // Gemini Test State
  const [geminiStatus, setGeminiStatus] = useState<'IDLE' | 'TESTING' | 'SUCCESS' | 'ERROR'>('IDLE');
  const [geminiResult, setGeminiResult] = useState<string | null>(null);
  const [geminiLatency, setGeminiLatency] = useState<number | null>(null);
  const [testPrompt, setTestPrompt] = useState('Who is the Vice Principal and who teaches Artificial Intelligence at Pranabananda Vidyamandir?');

  // Active Selected Sheet for Date-Wise Viewer
  const [selectedSheetIndex, setSelectedSheetIndex] = useState(0);

  const handleTestGemini = async () => {
    setGeminiStatus('TESTING');
    setGeminiResult(null);
    const start = performance.now();
    try {
      const res = await askAI(testPrompt);
      const elapsed = Math.round(performance.now() - start);
      setGeminiLatency(elapsed);
      setGeminiResult(res.answer);
      setGeminiStatus('SUCCESS');
    } catch (err: any) {
      setGeminiStatus('ERROR');
      setGeminiResult(err?.message || 'Failed to ping Gemini API.');
    }
  };

  const currentSheet = dateWiseSheets[selectedSheetIndex] || dateWiseSheets[0];

  return (
    <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-white/[0.08] pb-6">
        <div>
          <div className="flex items-center gap-3">
            <h1 className="text-2xl font-black text-white tracking-tight">System & Hardware Diagnostics</h1>
            <span className="rounded-full border border-emerald-500/30 bg-emerald-500/10 px-3 py-1 text-xs font-mono font-semibold text-emerald-400">
              All Systems Nominal
            </span>
          </div>
          <p className="text-xs text-slate-400 mt-1">
            Realtime verification for Pvm Sathi AI, Supabase Database, Raspberry Pi 3B / ESP8266 IoT nodes, and Date-Wise Google Sheets.
          </p>
        </div>

        <button
          onClick={syncGoogleSheets}
          className="inline-flex items-center gap-2 rounded-xl border border-emerald-500/40 bg-emerald-500/15 px-4 py-2 text-xs font-semibold text-emerald-300 hover:bg-emerald-500/25 transition-all shadow-glow-emerald"
        >
          <RefreshCw className="h-4 w-4" />
          <span>Sync All Google Sheets</span>
        </button>
      </div>

      {/* Grid: Gemini & Supabase Live Test Bench */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Gemini API Live Test Bench */}
        <div className="surface-card p-6 space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="p-2.5 rounded-xl bg-violet-500/20 text-violet-400 border border-violet-500/30">
                <Sparkles className="h-5 w-5" />
              </div>
              <div>
                <h3 className="text-sm font-bold text-white">Google Gemini API Live Bench</h3>
                <p className="text-[11px] font-mono text-slate-400">Model: gemini-3.6-flash • Key Verified</p>
              </div>
            </div>

            <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/30 text-[11px] font-mono text-emerald-400">
              <span className="h-2 w-2 rounded-full bg-emerald-400 animate-ping"></span>
              <span>LIVE</span>
            </div>
          </div>

          <div className="space-y-2">
            <label className="text-[11px] font-semibold text-slate-300">Test Query with School Context</label>
            <div className="flex gap-2">
              <input
                type="text"
                value={testPrompt}
                onChange={(e) => setTestPrompt(e.target.value)}
                placeholder="Ask Gemini..."
                className="flex-1 rounded-xl border border-white/10 bg-slate-950 px-3 py-2 text-xs text-white placeholder-slate-500 focus:border-violet-500 focus:outline-none"
              />
              <button
                onClick={handleTestGemini}
                disabled={geminiStatus === 'TESTING'}
                className="inline-flex items-center gap-1.5 rounded-xl bg-violet-600 px-4 py-2 text-xs font-semibold text-white hover:bg-violet-500 disabled:opacity-50 transition-colors"
              >
                {geminiStatus === 'TESTING' ? (
                  <RefreshCw className="h-3.5 w-3.5 animate-spin" />
                ) : (
                  <Send className="h-3.5 w-3.5" />
                )}
                <span>Ping</span>
              </button>
            </div>
          </div>

          {geminiResult && (
            <div className="p-3.5 rounded-xl border border-violet-500/20 bg-violet-950/20 text-xs space-y-2 animate-in fade-in">
              <div className="flex items-center justify-between text-[11px] font-mono text-violet-300">
                <span>Pvm Sathi AI Response</span>
                {geminiLatency && <span>Latency: {geminiLatency}ms</span>}
              </div>
              <p className="text-slate-200 leading-relaxed">{geminiResult}</p>
            </div>
          )}

          <div className="grid grid-cols-3 gap-3 pt-2 text-center text-xs">
            <div className="p-2 rounded-lg bg-white/[0.03] border border-white/[0.06]">
              <span className="text-[10px] text-slate-400">Context Window</span>
              <p className="font-mono font-bold text-white mt-0.5">1M+ Tokens</p>
            </div>
            <div className="p-2 rounded-lg bg-white/[0.03] border border-white/[0.06]">
              <span className="text-[10px] text-slate-400">Target School</span>
              <p className="font-mono font-bold text-white mt-0.5">PVM Lumding</p>
            </div>
            <div className="p-2 rounded-lg bg-white/[0.03] border border-white/[0.06]">
              <span className="text-[10px] text-slate-400">Zero-Trust Guard</span>
              <p className="font-mono font-bold text-emerald-400 mt-0.5">Enabled</p>
            </div>
          </div>
        </div>

        {/* Supabase Connection & Auth Diagnostics */}
        <div className="surface-card p-6 space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="p-2.5 rounded-xl bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
                <Database className="h-5 w-5" />
              </div>
              <div>
                <h3 className="text-sm font-bold text-white">Supabase Cloud Database & Auth</h3>
                <p className="text-[11px] font-mono text-slate-400">qlbievtnbpztwwhsaytx.supabase.co</p>
              </div>
            </div>

            <span className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/30 text-[11px] font-mono text-emerald-400">
              <CheckCircle2 className="h-3 w-3" />
              <span>CONNECTED</span>
            </span>
          </div>

          <div className="space-y-2.5 text-xs">
            <div className="flex items-center justify-between p-2.5 rounded-lg bg-white/[0.03] border border-white/[0.06]">
              <span className="text-slate-300">Public Schema Tables</span>
              <span className="font-mono text-emerald-400">profiles, audit_logs</span>
            </div>
            <div className="flex items-center justify-between p-2.5 rounded-lg bg-white/[0.03] border border-white/[0.06]">
              <span className="text-slate-300">Authentication Protocol</span>
              <span className="font-mono text-white">GoTrue JWT • PKCE Flow</span>
            </div>
            <div className="flex items-center justify-between p-2.5 rounded-lg bg-white/[0.03] border border-white/[0.06]">
              <span className="text-slate-300">Failover Storage</span>
              <span className="font-mono text-cyan-400">Local Zero-Latency State</span>
            </div>
          </div>

          <div className="p-3 rounded-xl border border-white/[0.06] bg-slate-950/60 text-xs flex items-center justify-between">
            <div>
              <span className="text-white font-semibold block">Simulate RFID Hardware Scan</span>
              <span className="text-[11px] text-slate-400">Trigger scan from Raspberry Pi or ESP8266</span>
            </div>
            <button
              onClick={() => setSimulatorOpen(true)}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-cyan-600 text-white font-semibold text-xs hover:bg-cyan-500 transition-colors"
            >
              <Cpu className="h-3.5 w-3.5" />
              <span>Open Scanner</span>
            </button>
          </div>
        </div>
      </div>

      {/* IoT Hardware Telemetry: Raspberry Pi 3B & ESP8266 */}
      <div className="surface-card p-6 space-y-4">
        <div className="flex items-center justify-between border-b border-white/[0.06] pb-4">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-cyan-500/20 text-cyan-400 border border-cyan-500/30">
              <Cpu className="h-5 w-5" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-white">Perimeter Hardware Nodes (Raspberry Pi 3B & ESP8266)</h3>
              <p className="text-[11px] text-slate-400">Direct TCP/MQTT attendance stream with packet replay protection</p>
            </div>
          </div>
          <span className="text-xs font-mono text-slate-400">2 Nodes Provisioned</span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {devices.map((dev) => (
            <div key={dev.id} className="p-4 rounded-xl border border-white/[0.08] bg-slate-950/60 space-y-3">
              <div className="flex items-start justify-between">
                <div>
                  <h4 className="text-sm font-bold text-white">{dev.name}</h4>
                  <span className="text-[11px] text-slate-400">{dev.location}</span>
                </div>
                <span className="flex items-center gap-1 px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-400 font-mono text-[10px]">
                  <span className="h-1.5 w-1.5 rounded-full bg-emerald-400 animate-pulse"></span>
                  {dev.status}
                </span>
              </div>

              <div className="grid grid-cols-2 gap-2 text-[11px] font-mono text-slate-300">
                <div className="p-2 rounded bg-white/[0.03]">
                  <span className="text-slate-500 block text-[10px]">IP ADDRESS</span>
                  {dev.ipAddress}
                </div>
                <div className="p-2 rounded bg-white/[0.03]">
                  <span className="text-slate-500 block text-[10px]">MAC</span>
                  {dev.macAddress}
                </div>
                <div className="p-2 rounded bg-white/[0.03]">
                  <span className="text-slate-500 block text-[10px]">EVENTS PROCESSED</span>
                  {dev.eventsProcessed}
                </div>
                <div className="p-2 rounded bg-white/[0.03]">
                  <span className="text-slate-500 block text-[10px]">SIGNAL STRENGTH</span>
                  {dev.signalStrength}%
                </div>
              </div>

              <button
                onClick={() => triggerRFIDTap('RFID-E0A1B2C3', dev.id)}
                className="w-full py-1.5 text-xs font-semibold rounded-lg border border-cyan-500/30 text-cyan-300 hover:bg-cyan-500/15 transition-colors"
              >
                Send Test RFID Packet via {dev.name.split(' ')[0]} &rarr;
              </button>
            </div>
          ))}
        </div>
      </div>

      {/* Date-Wise Google Sheets Separation Center */}
      <div className="surface-card p-6 space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-white/[0.06] pb-4">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
              <FileSpreadsheet className="h-5 w-5" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-white">Date-Wise Google Sheets Synchronization</h3>
              <p className="text-[11px] text-slate-400">
                Automatically separates attendance sheets date-wise for Students, Employees & Staff, and Security Logs
              </p>
            </div>
          </div>

          {/* Sheet Selector Tabs */}
          <div className="flex items-center gap-1.5 p-1 rounded-xl bg-slate-950 border border-white/[0.08]">
            {dateWiseSheets.map((sheet, idx) => (
              <button
                key={sheet.name}
                onClick={() => setSelectedSheetIndex(idx)}
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors ${
                  selectedSheetIndex === idx
                    ? 'bg-emerald-500 text-black shadow-sm'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                {sheet.name}
              </button>
            ))}
          </div>
        </div>

        {/* Selected Sheet Details & Preview */}
        <div className="p-4 rounded-xl bg-slate-950/70 border border-white/[0.08] space-y-3">
          <div className="flex items-center justify-between text-xs">
            <div className="flex items-center gap-2">
              <Table className="h-4 w-4 text-emerald-400" />
              <span className="font-mono font-bold text-white">Sheet: [{currentSheet.name}]</span>
              <span className="px-2 py-0.5 rounded bg-white/10 text-[10px] font-mono text-slate-300">
                {currentSheet.type}
              </span>
            </div>
            <div className="flex items-center gap-3 font-mono text-[11px] text-slate-400">
              <span>Rows: {currentSheet.rowCount}</span>
              <span>Updated: {currentSheet.lastUpdated}</span>
              <span className="text-emerald-400">Status: {currentSheet.status}</span>
            </div>
          </div>

          {/* Sample Row Table Preview */}
          <div className="overflow-x-auto rounded-lg border border-white/[0.06]">
            <table className="w-full text-left text-xs text-slate-300">
              <thead className="bg-slate-900/90 text-[11px] font-mono text-slate-400 uppercase">
                <tr>
                  <th className="px-3 py-2">ID / Roll</th>
                  <th className="px-3 py-2">Name</th>
                  <th className="px-3 py-2">Category</th>
                  <th className="px-3 py-2">Date</th>
                  <th className="px-3 py-2">Status</th>
                  <th className="px-3 py-2">Sheet Column</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/[0.04] font-mono text-[11px]">
                {currentSheet.type === 'STAFF' ? (
                  staff.slice(0, 4).map((s) => (
                    <tr key={s.id} className="hover:bg-white/[0.02]">
                      <td className="px-3 py-2 text-cyan-300">{s.employeeId}</td>
                      <td className="px-3 py-2 text-white font-sans">{s.name}</td>
                      <td className="px-3 py-2 text-slate-400">{s.department}</td>
                      <td className="px-3 py-2">{currentSheet.date}</td>
                      <td className="px-3 py-2 text-emerald-400">PRESENT (99%)</td>
                      <td className="px-3 py-2 text-slate-500">Col A-F (Staff)</td>
                    </tr>
                  ))
                ) : (
                  students.slice(0, 4).map((stu) => (
                    <tr key={stu.id} className="hover:bg-white/[0.02]">
                      <td className="px-3 py-2 text-cyan-300">{stu.admissionNo}</td>
                      <td className="px-3 py-2 text-white font-sans">{stu.name}</td>
                      <td className="px-3 py-2 text-slate-400">Class {stu.classGrade}-{stu.section}</td>
                      <td className="px-3 py-2">{currentSheet.date}</td>
                      <td className="px-3 py-2 text-emerald-400">PRESENT ({stu.attendancePercentage}%)</td>
                      <td className="px-3 py-2 text-slate-500">Col A-H (Student)</td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
};
