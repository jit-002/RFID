import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import {
  Cpu,
  Radio,
  Scan,
  UserCheck,
  AlertTriangle,
  X,
  CreditCard,
  Camera,
  Fingerprint,
  Layers,
  Sparkles
} from 'lucide-react';

export const HardwareSimulatorModal: React.FC = () => {
  const {
    isSimulatorOpen,
    setSimulatorOpen,
    students,
    staff,
    devices,
    triggerRFIDTap,
    currentStudent
  } = useApp();

  const [selectedPersonType, setSelectedPersonType] = useState<'STUDENT' | 'STAFF' | 'UNKNOWN'>('STUDENT');
  const [selectedStudentId, setSelectedStudentId] = useState<string>(currentStudent.id);
  const [selectedStaffId, setSelectedStaffId] = useState<string>(staff[0].id);
  const [selectedDeviceId, setSelectedDeviceId] = useState<string>(devices[0].id);

  if (!isSimulatorOpen) return null;

  const handleSimulateTap = () => {
    let rfidUid = '';
    if (selectedPersonType === 'STUDENT') {
      const stu = students.find(s => s.id === selectedStudentId);
      rfidUid = stu ? stu.rfidUid : 'RFID-E0A1B2C3';
    } else if (selectedPersonType === 'STAFF') {
      const stf = staff.find(s => s.id === selectedStaffId);
      rfidUid = stf ? stf.rfidUid : 'RFID-STAFF-9001';
    } else {
      rfidUid = 'RFID-UNREGISTERED-9F42';
    }

    triggerRFIDTap(rfidUid, selectedDeviceId);
    // Don't close immediately so the 2FA biometric dialog will take over seamlessly
    setSimulatorOpen(false);
  };

  const currentDev = devices.find(d => d.id === selectedDeviceId);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-4 backdrop-blur-md animate-in fade-in duration-200">
      <div
        className="w-full max-w-xl overflow-hidden rounded-3xl border border-cyan-500/30 bg-obsidian-900 shadow-glow-cyan"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header with Hardware Specs */}
        <div className="flex items-center justify-between border-b border-white/[0.08] bg-obsidian-950 px-6 py-4">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-cyan-500/20 text-cyan-400 border border-cyan-500/30">
              <Cpu className="h-5 w-5 animate-pulse" />
            </div>
            <div>
              <h3 className="text-base font-bold text-white tracking-tight">IoT Hardware Simulation Engine</h3>
              <p className="text-xs text-slate-400">Raspberry Pi 3B Gateway & ESP8266 RFID 2FA Test Bench</p>
            </div>
          </div>
          <button
            onClick={() => setSimulatorOpen(false)}
            className="rounded-xl p-1.5 text-slate-400 hover:bg-white/10 hover:text-white transition-colors"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <div className="p-6 space-y-5">
          {/* Identity Selection */}
          <div>
            <label className="text-xs font-semibold text-slate-300 uppercase tracking-wider">
              1. Choose Badge Identity
            </label>
            <div className="mt-2 grid grid-cols-3 gap-2">
              <button
                type="button"
                onClick={() => setSelectedPersonType('STUDENT')}
                className={`flex items-center justify-center gap-2 rounded-xl border p-2.5 text-xs font-semibold transition-all ${
                  selectedPersonType === 'STUDENT'
                    ? 'border-cyan-500 bg-cyan-500/20 text-cyan-300 shadow-glow-cyan'
                    : 'border-white/10 bg-slate-800/40 text-slate-400 hover:border-white/20'
                }`}
              >
                <UserCheck className="h-4 w-4" />
                Student Badge
              </button>

              <button
                type="button"
                onClick={() => setSelectedPersonType('STAFF')}
                className={`flex items-center justify-center gap-2 rounded-xl border p-2.5 text-xs font-semibold transition-all ${
                  selectedPersonType === 'STAFF'
                    ? 'border-violet-500 bg-violet-500/20 text-violet-300 shadow-glow-violet'
                    : 'border-white/10 bg-slate-800/40 text-slate-400 hover:border-white/20'
                }`}
              >
                <Layers className="h-4 w-4" />
                Faculty Badge
              </button>

              <button
                type="button"
                onClick={() => setSelectedPersonType('UNKNOWN')}
                className={`flex items-center justify-center gap-2 rounded-xl border p-2.5 text-xs font-semibold transition-all ${
                  selectedPersonType === 'UNKNOWN'
                    ? 'border-rose-500 bg-rose-500/20 text-rose-300 shadow-glow-rose'
                    : 'border-white/10 bg-slate-800/40 text-slate-400 hover:border-white/20'
                }`}
              >
                <AlertTriangle className="h-4 w-4" />
                Unknown Card
              </button>
            </div>
          </div>

          {/* Student / Staff Selector Dropdown */}
          {selectedPersonType === 'STUDENT' && (
            <div>
              <label className="text-xs font-medium text-slate-400">Select Student</label>
              <select
                value={selectedStudentId}
                onChange={(e) => setSelectedStudentId(e.target.value)}
                className="mt-1.5 w-full rounded-xl border border-white/10 bg-slate-950 px-3 py-2 text-xs text-white focus:border-cyan-500 focus:outline-none"
              >
                {students.slice(0, 15).map(s => (
                  <option key={s.id} value={s.id}>
                    {s.name} ({s.admissionNo}) — Grade {s.classGrade}-{s.section} [RFID: {s.rfidUid}]
                  </option>
                ))}
              </select>
            </div>
          )}

          {selectedPersonType === 'STAFF' && (
            <div>
              <label className="text-xs font-medium text-slate-400">Select Staff Member</label>
              <select
                value={selectedStaffId}
                onChange={(e) => setSelectedStaffId(e.target.value)}
                className="mt-1.5 w-full rounded-xl border border-white/10 bg-slate-950 px-3 py-2 text-xs text-white focus:border-violet-500 focus:outline-none"
              >
                {staff.map(st => (
                  <option key={st.id} value={st.id}>
                    {st.name} ({st.employeeId}) — {st.department} [RFID: {st.rfidUid}]
                  </option>
                ))}
              </select>
            </div>
          )}

          {selectedPersonType === 'UNKNOWN' && (
            <div className="rounded-xl border border-rose-500/30 bg-rose-950/20 p-3 text-xs text-rose-300">
              Simulates an unauthorized or counterfeit RFID card (UID: 0x9F42B108). Tests whether the security engine rejects the badge and creates an alert event.
            </div>
          )}

          {/* Physical Reader Gateway Selector */}
          <div>
            <label className="text-xs font-semibold text-slate-300 uppercase tracking-wider">
              2. Select Hardware Node / Gate
            </label>
            <select
              value={selectedDeviceId}
              onChange={(e) => setSelectedDeviceId(e.target.value)}
              className="mt-2 w-full rounded-xl border border-white/10 bg-slate-950 px-3 py-2 text-xs text-white focus:border-cyan-500 focus:outline-none"
            >
              {devices.map(d => (
                <option key={d.id} value={d.id}>
                  {d.name} — {d.location} ({d.ipAddress})
                </option>
              ))}
            </select>
            {currentDev && (
              <div className="mt-2 flex items-center justify-between text-[11px] text-slate-400 font-mono">
                <span>Firmware: {currentDev.firmwareVersion}</span>
                <span>Signal: {currentDev.signalStrength}% (WiFi RSSI)</span>
              </div>
            )}
          </div>

          {/* Action Trigger Button */}
          <div className="pt-2">
            <button
              onClick={handleSimulateTap}
              className="w-full relative flex items-center justify-center gap-2.5 rounded-2xl bg-gradient-to-r from-cyan-500 via-blue-600 to-violet-600 p-3.5 text-sm font-bold text-white shadow-glow-cyan transition-all hover:opacity-95 active:scale-[0.98]"
            >
              <CreditCard className="h-5 w-5" />
              <span>TAP PHYSICAL RFID CARD</span>
            </button>
            <p className="mt-2 text-center text-[11px] text-slate-500">
              Emulates contactless 13.56MHz ISO14443A packet broadcast via ESP8266 / RC522 SPI bus.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};
