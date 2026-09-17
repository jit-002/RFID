import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import {
  Wrench,
  Clock,
  Calendar,
  CheckCircle2,
  AlertCircle,
  MapPin,
  Sparkles,
  Search,
  ChevronRight,
  ShieldCheck,
  Send,
  FileText,
  UserCheck,
  Building2,
  Phone
} from 'lucide-react';

export const EmployeePortal: React.FC = () => {
  const { currentEmployee, attendance, askAI } = useApp();
  const [activeTab, setActiveTab] = useState<'overview' | 'duties' | 'leaves'>('overview');
  const [searchQuery, setSearchQuery] = useState('');
  const [aiQuestion, setAiQuestion] = useState('');
  const [aiResponse, setAiResponse] = useState<string | null>(null);
  const [loadingAI, setLoadingAI] = useState(false);

  const handleAskSathi = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!aiQuestion.trim() || loadingAI) return;
    setLoadingAI(true);
    try {
      const res = await askAI(aiQuestion);
      setAiResponse(res.answer);
    } catch {
      setAiResponse('Pvm Sathi was unable to process the question. Please try again.');
    } finally {
      setLoadingAI(false);
    }
  };

  // Hand-crafted cubic Bézier SVG area chart path
  const chartPath = "M 0 65 Q 45 45, 90 55 T 180 35 T 270 25 T 360 18 T 450 10 L 450 80 L 0 80 Z";
  const linePath = "M 0 65 Q 45 45, 90 55 T 180 35 T 270 25 T 360 18 T 450 10";

  const dutyTasks = [
    { id: 'tsk-1', time: '07:30 AM', task: 'Turnstile A & Kiosk 1 Power-on Verification', location: 'North Entrance', status: 'COMPLETED' },
    { id: 'tsk-2', time: '09:00 AM', task: 'Classroom ESP8266 Node Signal Sweep (Lane 1 & 2)', location: 'Academic Block A', status: 'COMPLETED' },
    { id: 'tsk-3', time: '11:45 AM', task: 'Perimeter Camera Lens Inspection & Clean', location: 'Main Gate Corridor', status: 'IN_PROGRESS' },
    { id: 'tsk-4', time: '02:30 PM', task: 'Evening Bus Fleet RFID Reader Pre-check', location: 'South Parking Terminal', status: 'PENDING' }
  ];

  return (
    <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-6 space-y-6">
      {/* Top Glass Bar */}
      <div className="rounded-2xl border border-white/[0.08] bg-[#0A0E17]/80 p-4 backdrop-blur-xl shadow-dashboard flex flex-col md:flex-row items-center justify-between gap-4">
        <div className="flex items-center gap-3 w-full md:w-auto">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-amber-400 to-orange-600 p-0.5 shadow-[0_0_20px_rgba(245,158,11,0.3)]">
            <img src="/school-logo.jpg" alt="Logo" className="h-full w-full rounded-[10px] object-cover bg-white" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="font-display italic text-lg font-bold text-white tracking-tight">Pranabananda Vidyamandir</span>
              <span className="rounded-full border border-amber-500/30 bg-amber-500/15 px-2 py-0.5 text-[10px] font-semibold text-amber-300">
                Staff & Operations
              </span>
            </div>
            <p className="text-[11px] font-mono text-slate-400">Campus Operations Management System</p>
          </div>
        </div>

        {/* Search Bar */}
        <div className="relative w-full md:w-72">
          <Search className="absolute left-3 top-2.5 h-3.5 w-3.5 text-slate-500" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search facility duties, logs (⌘K)..."
            className="w-full rounded-xl border border-white/10 bg-black/50 pl-8 pr-3 py-1.5 text-xs text-white placeholder-slate-500 focus:border-amber-500 focus:outline-none"
          />
        </div>

        {/* User Identity Chip */}
        <div className="flex items-center gap-3 w-full md:w-auto justify-end">
          <img
            src={currentEmployee.avatarUrl}
            alt={currentEmployee.name}
            className="h-9 w-9 rounded-xl object-cover border border-amber-500/40"
          />
          <div className="text-left text-xs">
            <div className="font-semibold text-white">{currentEmployee.name}</div>
            <div className="text-[10px] text-amber-400 font-mono">{currentEmployee.designation}</div>
          </div>
        </div>
      </div>

      {/* Main SaaS Layout: Sidebar + Main Content */}
      <div className="flex flex-col lg:flex-row gap-6">
        {/* Left Navigation Sidebar */}
        <div className="w-full lg:w-48 shrink-0 space-y-2">
          <div className="rounded-2xl border border-white/[0.08] bg-[#0A0E17]/60 p-3 backdrop-blur-xl shadow-dashboard space-y-1">
            {[
              { id: 'overview', label: 'Home Overview', badge: 'Active' },
              { id: 'duties', label: 'Daily Duties', badge: '4' },
              { id: 'leaves', label: 'Shift Roster', badge: null }
            ].map((item) => (
              <button
                key={item.id}
                onClick={() => setActiveTab(item.id as any)}
                className={`w-full flex items-center justify-between px-3 py-2 rounded-xl text-xs font-medium transition-all ${
                  activeTab === item.id
                    ? 'bg-amber-500 text-black font-bold shadow-sm'
                    : 'text-slate-400 hover:text-white hover:bg-white/[0.04]'
                }`}
              >
                <span>{item.label}</span>
                {item.badge && (
                  <span className={`px-1.5 py-0.5 text-[9px] rounded-md font-mono ${
                    activeTab === item.id ? 'bg-black/20 text-black' : 'bg-white/[0.08] text-slate-300'
                  }`}>
                    {item.badge}
                  </span>
                )}
              </button>
            ))}
          </div>

          {/* Quick Facility Contact Card */}
          <div className="rounded-2xl border border-white/[0.06] bg-[#0A0E17]/40 p-3 text-xs space-y-2">
            <span className="text-[10px] font-mono text-slate-500 block uppercase">Zone Incharge:</span>
            <div className="flex items-center gap-2 text-slate-300">
              <MapPin className="h-3.5 w-3.5 text-amber-400" />
              <span>{currentEmployee.dutyLocation}</span>
            </div>
            <div className="flex items-center gap-2 text-slate-400 text-[11px]">
              <Clock className="h-3.5 w-3.5 text-cyan-400" />
              <span>{currentEmployee.shift}</span>
            </div>
          </div>
        </div>

        {/* Main Content Area */}
        <div className="flex-1 space-y-6">
          {/* Greeting & Action Pill Row */}
          <div className="rounded-2xl border border-white/[0.08] bg-gradient-to-r from-slate-900/80 to-[#0A0E17] p-6 backdrop-blur-xl shadow-dashboard">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
              <div>
                <h1 className="font-display italic text-3xl sm:text-4xl font-bold text-white tracking-tight">
                  Welcome, {currentEmployee.name}
                </h1>
                <p className="text-xs text-slate-400 mt-1">
                  Employee ID: <span className="font-mono text-amber-400">{currentEmployee.employeeId}</span> • Department: {currentEmployee.department}
                </p>
              </div>

              {/* Action Buttons Row */}
              <div className="flex flex-wrap items-center gap-2">
                <button
                  onClick={() => alert('Clock-in confirmed via RFID Gateway Alpha.')}
                  className="rounded-full bg-amber-500 hover:bg-amber-400 text-black px-4 py-1.5 text-xs font-bold transition-all shadow-glow-amber"
                >
                  Confirm Check-in
                </button>
                <button
                  onClick={() => alert('Leave application submitted to Administration.')}
                  className="rounded-full border border-white/10 bg-white/[0.04] hover:bg-white/[0.08] text-white px-4 py-1.5 text-xs font-medium transition-all"
                >
                  Request Leave
                </button>
              </div>
            </div>
          </div>

          {/* Two Equal-Width Bento Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Card 1: Attendance Metric & SVG Area Chart */}
            <div className="rounded-2xl border border-white/[0.08] bg-[#0A0E17]/80 p-5 backdrop-blur-xl shadow-dashboard flex flex-col justify-between">
              <div>
                <div className="flex items-center justify-between text-xs mb-3">
                  <div className="flex items-center gap-2">
                    <CheckCircle2 className="h-4 w-4 text-emerald-400" />
                    <span className="font-bold text-white uppercase tracking-wider text-[11px]">Monthly Attendance Health</span>
                  </div>
                  <span className="font-mono text-emerald-400 font-bold">{currentEmployee.attendancePercentage}%</span>
                </div>

                <div className="flex items-baseline gap-2 mt-1">
                  <span className="font-display italic text-4xl sm:text-5xl font-bold text-white">
                    {currentEmployee.presentDays}
                  </span>
                  <span className="text-xs text-slate-400">
                    / {currentEmployee.totalDays} Days Verified
                  </span>
                </div>

                <div className="flex items-center gap-4 text-xs mt-3 pt-3 border-t border-white/[0.06]">
                  <div>
                    <span className="text-[10px] text-slate-500 block">Status</span>
                    <span className="text-emerald-400 font-semibold">{currentEmployee.status}</span>
                  </div>
                  <div>
                    <span className="text-[10px] text-slate-500 block">RFID Badge</span>
                    <span className="font-mono text-slate-300">{currentEmployee.rfidUid}</span>
                  </div>
                  <div>
                    <span className="text-[10px] text-slate-500 block">Biometric ID</span>
                    <span className="font-mono text-slate-300">{currentEmployee.biometricId}</span>
                  </div>
                </div>
              </div>

              {/* Hand-crafted Cubic Bézier SVG Area Chart */}
              <div className="mt-4 pt-2">
                <div className="text-[10px] font-mono text-slate-500 mb-1">Attendance Trend (Smooth Bézier)</div>
                <svg viewBox="0 0 450 80" className="w-full h-20 overflow-visible">
                  <defs>
                    <linearGradient id="empGradient" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor="#f59e0b" stopOpacity="0.4" />
                      <stop offset="100%" stopColor="#f59e0b" stopOpacity="0.0" />
                    </linearGradient>
                  </defs>
                  <path d={chartPath} fill="url(#empGradient)" />
                  <path d={linePath} fill="none" stroke="#f59e0b" strokeWidth="2.5" strokeLinecap="round" />
                </svg>
              </div>
            </div>

            {/* Card 2: Assigned Facility Tasks Overview */}
            <div className="rounded-2xl border border-white/[0.08] bg-[#0A0E17]/80 p-5 backdrop-blur-xl shadow-dashboard flex flex-col justify-between">
              <div>
                <div className="flex items-center justify-between text-xs mb-3">
                  <span className="font-bold text-white uppercase tracking-wider text-[11px]">Today's Facility Schedule</span>
                  <span className="px-2 py-0.5 rounded-full bg-amber-500/15 border border-amber-500/30 text-[10px] text-amber-300 font-mono">
                    Shift Active
                  </span>
                </div>

                <div className="space-y-2.5 mt-2">
                  {dutyTasks.map((d) => (
                    <div key={d.id} className="flex items-start justify-between gap-3 p-2.5 rounded-xl bg-white/[0.02] border border-white/[0.04]">
                      <div className="space-y-0.5">
                        <div className="text-xs font-medium text-slate-200">{d.task}</div>
                        <div className="flex items-center gap-2 text-[10px] text-slate-400">
                          <Clock className="h-3 w-3 text-cyan-400" />
                          <span>{d.time}</span>
                          <span>•</span>
                          <MapPin className="h-3 w-3 text-amber-400" />
                          <span>{d.location}</span>
                        </div>
                      </div>
                      <span className={`px-2 py-0.5 rounded-md text-[10px] font-mono shrink-0 ${
                        d.status === 'COMPLETED'
                          ? 'bg-emerald-500/15 text-emerald-400 border border-emerald-500/20'
                          : d.status === 'IN_PROGRESS'
                          ? 'bg-amber-500/15 text-amber-400 border border-amber-500/20'
                          : 'bg-white/[0.05] text-slate-400'
                      }`}>
                        {d.status}
                      </span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Pvm Sathi Mini Prompt */}
              <form onSubmit={handleAskSathi} className="mt-4 pt-3 border-t border-white/[0.06] flex items-center gap-2">
                <Sparkles className="h-3.5 w-3.5 text-amber-400 shrink-0" />
                <input
                  type="text"
                  value={aiQuestion}
                  onChange={(e) => setAiQuestion(e.target.value)}
                  placeholder="Ask Pvm Sathi about shifts & leave..."
                  className="w-full bg-transparent text-xs text-white placeholder-slate-500 focus:outline-none"
                />
                <button
                  type="submit"
                  disabled={loadingAI}
                  className="px-2 py-1 rounded-lg bg-amber-500/20 hover:bg-amber-500/30 text-amber-300 text-[10px] font-semibold"
                >
                  {loadingAI ? '...' : 'Ask'}
                </button>
              </form>
              {aiResponse && (
                <div className="mt-2 p-2 rounded-lg bg-amber-500/10 border border-amber-500/20 text-[11px] text-amber-200">
                  {aiResponse}
                </div>
              )}
            </div>
          </div>

          {/* Clean Transactions / Logs Table */}
          <div className="rounded-2xl border border-white/[0.08] bg-[#0A0E17]/80 p-5 backdrop-blur-xl shadow-dashboard">
            <h3 className="text-sm font-bold text-white tracking-tight mb-4">Recent Institutional Check-in History</h3>
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead>
                  <tr className="border-b border-white/[0.08] text-[11px] font-mono text-slate-500">
                    <th className="pb-3">Date</th>
                    <th className="pb-3">Punch Time</th>
                    <th className="pb-3">Gateway Node</th>
                    <th className="pb-3">Location</th>
                    <th className="pb-3">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/[0.04]">
                  {[
                    { date: '2026-09-08', time: '07:28:14 AM', node: 'dev-rpi-01 (Turnstile A)', loc: 'North Entrance', status: 'ON_TIME' },
                    { date: '2026-09-07', time: '07:31:02 AM', node: 'dev-rpi-01 (Turnstile A)', loc: 'North Entrance', status: 'ON_TIME' },
                    { date: '2026-09-06', time: '07:26:45 AM', node: 'dev-rpi-02 (South Wing)', loc: 'South Athletic Wing', status: 'ON_TIME' },
                    { date: '2026-09-05', time: '07:35:10 AM', node: 'dev-esp-01 (Lane 1)', loc: 'Main Gate', status: 'ON_TIME' }
                  ].map((row, idx) => (
                    <tr key={idx} className="hover:bg-white/[0.02] transition-colors">
                      <td className="py-3 font-mono text-slate-300">{row.date}</td>
                      <td className="py-3 font-mono text-slate-200">{row.time}</td>
                      <td className="py-3 text-slate-300">{row.node}</td>
                      <td className="py-3 text-slate-400">{row.loc}</td>
                      <td className="py-3">
                        <span className="inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[10px] font-mono bg-emerald-500/10 border border-emerald-500/20 text-emerald-300">
                          <CheckCircle2 className="h-2.5 w-2.5" />
                          {row.status}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
