'use client';

import React, { useState, useEffect } from 'react';
import { IEvent } from '@/types';
import { exportToCSV, formatDate } from '@/lib/utils';
import { 
  Users, 
  CheckCircle2, 
  XCircle, 
  Award, 
  Download, 
  Scan, 
  Search, 
  Clock, 
  FileSpreadsheet,
  Sparkles
} from 'lucide-react';

interface AttendanceManagerProps {
  events?: IEvent[];
  onOpenScanner?: () => void;
}

export default function AttendanceManager({ events = [], onOpenScanner }: AttendanceManagerProps) {
  const [selectedEventId, setSelectedEventId] = useState(
    events && events.length > 0 ? events[0]?._id : ''
  );
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [search, setSearch] = useState('');
  const [issuingCerts, setIssuingCerts] = useState(false);
  const [certMessage, setCertMessage] = useState('');

  useEffect(() => {
    if (!selectedEventId && events && events.length > 0) {
      setSelectedEventId(events[0]._id);
    }
  }, [events, selectedEventId]);

  const fetchAttendance = async () => {
    if (!selectedEventId) return;
    try {
      setLoading(true);
      const res = await fetch(`/api/attendance?eventId=${selectedEventId}`);
      const result = await res.json();
      if (result.success) {
        setData(result);
      }
    } catch (e) {
      // ignore
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAttendance();
  }, [selectedEventId]);

  const handleManualCheckIn = async (registrationId: string) => {
    try {
      const res = await fetch('/api/attendance', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ eventId: selectedEventId, registrationId }),
      });
      const result = await res.json();
      if (result.success) {
        fetchAttendance();
      }
    } catch (e) {
      // ignore
    }
  };

  const handleBatchIssueCerts = async () => {
    try {
      setIssuingCerts(true);
      setCertMessage('');
      const res = await fetch('/api/certificates', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ eventId: selectedEventId }),
      });
      const result = await res.json();
      setCertMessage(result.message);
      setTimeout(() => setCertMessage(''), 4000);
    } catch (e: any) {
      setCertMessage('Failed to issue certificates.');
    } finally {
      setIssuingCerts(false);
    }
  };

  const handleExportCSV = () => {
    if (!data?.allRegistrations?.length) return;
    const exportRows = data.allRegistrations.map((r: any) => ({
      'Registration Code': r.registrationCode,
      'Student Name': r.userName,
      'Student ID': r.studentId,
      'Department': r.department,
      'Phone': r.phone,
      'Status': r.status,
      'Payment Status': r.paymentStatus,
      'Amount Paid': r.amountPaid,
      'T-Shirt': r.tshirtSize,
      'Food': r.foodPreference,
      'Registered At': formatDate(r.registeredAt),
    }));

    exportToCSV(`Attendance_${selectedEventId}.csv`, exportRows);
  };

  const filteredRegistrations = (data?.allRegistrations || []).filter((r: any) => {
    if (!search) return true;
    const s = search.toLowerCase();
    return (
      r.userName.toLowerCase().includes(s) ||
      r.studentId.toLowerCase().includes(s) ||
      r.registrationCode.toLowerCase().includes(s) ||
      r.department.toLowerCase().includes(s)
    );
  });

  return (
    <div className="space-y-6">
      {/* Event Selector & Actions Bar */}
      <div className="flex flex-col md:flex-row gap-4 items-stretch md:items-center justify-between p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm">
        <div className="flex-1">
          <label className="block text-xs font-semibold text-slate-500 mb-1">Select Event</label>
          <select
            value={selectedEventId}
            onChange={(e) => setSelectedEventId(e.target.value)}
            className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl px-3.5 py-2.5 text-xs font-bold text-slate-900 dark:text-white focus:border-pink-500"
          >
            {events.map((evt) => (
              <option key={evt._id} value={evt._id}>
                {evt.title} ({formatDate(evt.startAt)})
              </option>
            ))}
          </select>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          {onOpenScanner && (
            <button
              onClick={onOpenScanner}
              className="bg-gradient-to-r from-pink-500 to-purple-600 hover:from-pink-600 text-white px-4 py-2.5 rounded-xl text-xs font-bold shadow-md shadow-pink-500/20 transition flex items-center gap-1.5"
            >
              <Scan className="w-4 h-4" />
              Live QR Scanner
            </button>
          )}

          <button
            onClick={handleBatchIssueCerts}
            disabled={issuingCerts}
            className="bg-amber-600 hover:bg-amber-700 text-white px-4 py-2.5 rounded-xl text-xs font-bold shadow-md transition flex items-center gap-1.5 disabled:opacity-50"
            title="Issue official certificates for all verified attended students"
          >
            <Award className="w-4 h-4" />
            {issuingCerts ? 'Issuing Certificates...' : 'Issue Certificates'}
          </button>

          <button
            onClick={handleExportCSV}
            className="bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-800 dark:text-slate-200 px-4 py-2.5 rounded-xl text-xs font-bold border border-slate-200 dark:border-slate-700 transition flex items-center gap-1.5"
          >
            <FileSpreadsheet className="w-4 h-4 text-emerald-500" />
            Export CSV
          </button>
        </div>
      </div>

      {certMessage && (
        <div className="p-3 rounded-xl bg-amber-500/10 border border-amber-500/20 text-amber-600 dark:text-amber-400 text-xs font-bold flex items-center gap-2">
          <Sparkles className="w-4 h-4" />
          <span>{certMessage}</span>
        </div>
      )}

      {/* KPI Stats Cards */}
      {data?.stats && (
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          <div className="glass-card p-4 text-center">
            <span className="text-[11px] text-slate-400">Total Registered</span>
            <p className="text-2xl font-black text-slate-900 dark:text-white mt-1">
              {data.stats.totalRegistered}
            </p>
          </div>
          <div className="glass-card p-4 text-center border-emerald-500/30">
            <span className="text-[11px] text-emerald-500 font-semibold">Attended</span>
            <p className="text-2xl font-black text-emerald-500 mt-1">{data.stats.totalAttended}</p>
          </div>
          <div className="glass-card p-4 text-center">
            <span className="text-[11px] text-rose-500 font-semibold">Absent</span>
            <p className="text-2xl font-black text-rose-500 mt-1">{data.stats.totalAbsent}</p>
          </div>
          <div className="glass-card p-4 text-center">
            <span className="text-[11px] text-purple-500 font-semibold">Attendance Rate (%)</span>
            <p className="text-2xl font-black text-purple-500 mt-1">{data.stats.attendanceRate}</p>
          </div>
        </div>
      )}

      {/* Search & Participant Table */}
      <div className="space-y-3">
        <div className="relative">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Filter by booking code, name, or student ID..."
            className="w-full bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl pl-10 pr-4 py-2.5 text-xs focus:outline-none focus:border-pink-500"
          />
        </div>

        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl overflow-x-auto shadow-xl">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 dark:bg-slate-950 text-slate-500 dark:text-slate-400 uppercase font-semibold border-b border-slate-200 dark:border-slate-800">
              <tr>
                <th className="p-4">Code & Student</th>
                <th className="p-4">Student ID & Department</th>
                <th className="p-4">Fee & Payment</th>
                <th className="p-4">Attendance Status</th>
                <th className="p-4 text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800 text-slate-700 dark:text-slate-300">
              {filteredRegistrations.map((r: any) => (
                <tr key={r._id} className="hover:bg-slate-50 dark:hover:bg-slate-800/40 transition">
                  <td className="p-4">
                    <div>
                      <span className="font-mono text-pink-500 font-bold">{r.registrationCode}</span>
                      <h4 className="font-bold text-slate-900 dark:text-white mt-0.5">{r.userName}</h4>
                      <p className="text-[10px] text-slate-400">{r.phone}</p>
                    </div>
                  </td>
                  <td className="p-4">
                    <span className="font-mono font-bold text-slate-900 dark:text-white">{r.studentId}</span>
                    <p className="text-[11px] text-slate-400 truncate max-w-xs">{r.department}</p>
                  </td>
                  <td className="p-4">
                    <span className="font-semibold">{r.amountPaid > 0 ? `৳ ${r.amountPaid}` : 'Free'}</span>
                    <span className="block text-[10px] text-emerald-500 capitalize">{r.paymentMethod || 'Paid'}</span>
                  </td>
                  <td className="p-4">
                    {r.status === 'attended' ? (
                      <span className="bg-emerald-500/10 text-emerald-500 border border-emerald-500/20 px-2.5 py-1 rounded-full text-[10px] font-bold flex items-center gap-1 w-fit">
                        <CheckCircle2 className="w-3 h-3" />
                        Checked In
                      </span>
                    ) : (
                      <span className="bg-amber-500/10 text-amber-500 border border-amber-500/20 px-2.5 py-1 rounded-full text-[10px] font-bold flex items-center gap-1 w-fit">
                        <Clock className="w-3 h-3" />
                        Pending (Registered)
                      </span>
                    )}
                  </td>
                  <td className="p-4 text-right">
                    {r.status !== 'attended' ? (
                      <button
                        onClick={() => handleManualCheckIn(r._id)}
                        className="bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-[11px] px-3 py-1.5 rounded-lg shadow-sm"
                      >
                        Mark Present
                      </button>
                    ) : (
                      <span className="text-[10px] text-slate-400">Checked In</span>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
