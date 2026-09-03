'use client';

import React, { useState } from 'react';
import Modal from '@/components/common/Modal';
import { IEvent } from '@/types';
import { QrCode, Scan, CheckCircle2, AlertTriangle, UserCheck, Search, Sparkles } from 'lucide-react';

interface QrScannerModalProps {
  isOpen: boolean;
  onClose: () => void;
  events?: IEvent[];
  selectedEventId?: string;
  onScanSuccess?: () => void;
}

export default function QrScannerModal({
  isOpen,
  onClose,
  events = [],
  selectedEventId,
  onScanSuccess,
}: QrScannerModalProps) {
  const [activeEventId, setActiveEventId] = useState(selectedEventId || (events && events.length > 0 ? events[0]?._id : '') || '');
  const [tokenInput, setTokenInput] = useState('');
  const [verifying, setVerifying] = useState(false);
  const [result, setResult] = useState<{
    success: boolean;
    message: string;
    duplicate?: boolean;
    participant?: any;
  } | null>(null);

  const handleVerify = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!tokenInput.trim() || !activeEventId) return;

    try {
      setVerifying(true);
      setResult(null);

      const res = await fetch('/api/attendance/verify-qr', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          qrToken: tokenInput.trim(),
          eventId: activeEventId,
        }),
      });

      const data = await res.json();
      setResult(data);
      if (data.success && onScanSuccess) {
        onScanSuccess();
      }
    } catch (err: any) {
      setResult({
        success: false,
        message: err.message || 'Verification failed due to network error.',
      });
    } finally {
      setVerifying(false);
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="⚡ Live QR Attendance Scanner" maxWidth="xl">
      <div className="space-y-5">
        {/* Event Selection */}
        <div>
          <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
            Select Event to Check-in
          </label>
          <select
            value={activeEventId}
            onChange={(e) => {
              setActiveEventId(e.target.value);
              setResult(null);
            }}
            className="w-full bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl px-3.5 py-2.5 text-xs text-slate-900 dark:text-white focus:outline-none focus:border-pink-500"
          >
            {events.map((evt) => (
              <option key={evt._id} value={evt._id}>
                {evt.title} ({evt.registeredCount || 0} Registered)
              </option>
            ))}
          </select>
        </div>

        {/* Camera / Manual Scanner Simulation Box */}
        <div className="relative aspect-video bg-gradient-to-br from-slate-950 via-slate-900 to-purple-950 border-2 border-dashed border-pink-500/50 rounded-2xl flex flex-col items-center justify-center p-6 text-center overflow-hidden">
          <div className="w-16 h-16 rounded-2xl bg-pink-500/10 border border-pink-500/30 flex items-center justify-center text-pink-400 mb-3 animate-pulse">
            <Scan className="w-8 h-8" />
          </div>
          <h4 className="text-sm font-bold text-white">Scan Attendee QR Code</h4>
          <p className="text-xs text-slate-400 max-w-xs mt-1">
            Point physical camera or enter registration booking code / QR token below
          </p>

          {/* Scanner laser animation line */}
          <div className="absolute inset-x-0 top-1/2 h-0.5 bg-gradient-to-r from-transparent via-pink-500 to-transparent animate-pulse" />
        </div>

        {/* Code Input Form */}
        <form onSubmit={handleVerify} className="space-y-3">
          <div className="flex gap-2">
            <input
              type="text"
              value={tokenInput}
              onChange={(e) => setTokenInput(e.target.value)}
              placeholder="e.g. REG-2026-X9A2 or QR Token"
              className="flex-1 bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl px-3.5 py-2.5 text-xs text-slate-900 dark:text-white font-mono uppercase focus:outline-none focus:border-pink-500"
            />
            <button
              type="submit"
              disabled={verifying || !tokenInput.trim()}
              className="bg-pink-600 hover:bg-pink-700 disabled:opacity-50 text-white px-5 py-2.5 rounded-xl text-xs font-bold transition flex items-center gap-1.5 shrink-0 shadow-lg shadow-pink-600/30"
            >
              {verifying ? 'Verifying...' : 'Verify Ticket'}
            </button>
          </div>
          <div className="flex items-center justify-between text-[11px] text-slate-400">
            <span>Quick Demo:</span>
            <button
              type="button"
              onClick={() => setTokenInput('REG-2026-')}
              className="text-pink-500 hover:underline font-mono"
            >
              Fill REG-2026- prefix
            </button>
          </div>
        </form>

        {/* Verification Result Feedback */}
        {result && (
          <div
            className={`p-4 rounded-2xl border text-xs space-y-2 animate-fade-in ${
              result.success
                ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-600 dark:text-emerald-400'
                : result.duplicate
                ? 'bg-amber-500/10 border-amber-500/30 text-amber-600 dark:text-amber-400'
                : 'bg-rose-500/10 border-rose-500/30 text-rose-600 dark:text-rose-400'
            }`}
          >
            <div className="flex items-center gap-2 font-bold text-sm">
              {result.success ? (
                <CheckCircle2 className="w-5 h-5" />
              ) : result.duplicate ? (
                <AlertTriangle className="w-5 h-5" />
              ) : (
                <AlertTriangle className="w-5 h-5" />
              )}
              <span>{result.message}</span>
            </div>

            {result.participant && (
              <div className="pt-2 border-t border-current/20 grid grid-cols-2 gap-2 text-slate-800 dark:text-slate-200">
                <div>
                  <span className="text-[10px] text-slate-400 block">Student Name</span>
                  <span className="font-bold">{result.participant.name}</span>
                </div>
                <div>
                  <span className="text-[10px] text-slate-400 block">Student ID</span>
                  <span className="font-mono font-bold">{result.participant.studentId}</span>
                </div>
                <div>
                  <span className="text-[10px] text-slate-400 block">Department</span>
                  <span>{result.participant.department}</span>
                </div>
                <div>
                  <span className="text-[10px] text-slate-400 block">Checked-in At</span>
                  <span>{new Date(result.participant.checkedInAt).toLocaleTimeString()}</span>
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </Modal>
  );
}
