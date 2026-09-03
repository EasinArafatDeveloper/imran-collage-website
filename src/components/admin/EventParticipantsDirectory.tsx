'use client';

import React, { useState, useEffect } from 'react';
import { IEvent } from '@/types';
import { 
  Ticket, 
  Search, 
  Download, 
  Trash2, 
  CheckCircle2, 
  Clock, 
  XCircle, 
  Calendar, 
  QrCode, 
  Users, 
  Sparkles, 
  RefreshCw, 
  Mail, 
  Building2, 
  FileSpreadsheet 
} from 'lucide-react';
import { SweetAlertState } from '@/components/common/SweetAlert';
import { formatDate, exportToCSV } from '@/lib/utils';

interface EventParticipantsDirectoryProps {
  events: IEvent[];
  onTriggerAlert?: (alert: SweetAlertState) => void;
}

export default function EventParticipantsDirectory({
  events = [],
  onTriggerAlert,
}: EventParticipantsDirectoryProps) {
  const [registrations, setRegistrations] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedEventId, setSelectedEventId] = useState('all');
  const [statusFilter, setStatusFilter] = useState('all');
  const [search, setSearch] = useState('');
  const [actionLoadingId, setActionLoadingId] = useState<string | null>(null);

  const fetchRegistrations = async () => {
    try {
      setLoading(true);
      let url = '/api/registrations?all=true';
      if (selectedEventId && selectedEventId !== 'all') {
        url += `&eventId=${selectedEventId}`;
      }
      if (statusFilter && statusFilter !== 'all') {
        url += `&status=${statusFilter}`;
      }

      const res = await fetch(url);
      const data = await res.json();
      if (data.success && data.data) {
        setRegistrations(data.data);
      }
    } catch (e) {
      // ignore
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRegistrations();
  }, [selectedEventId, statusFilter]);

  const filteredRegistrations = registrations.filter((reg) => {
    if (!search.trim()) return true;
    const q = search.toLowerCase();
    return (
      reg.studentName?.toLowerCase().includes(q) ||
      reg.studentId?.toLowerCase().includes(q) ||
      reg.email?.toLowerCase().includes(q) ||
      reg.eventTitle?.toLowerCase().includes(q) ||
      reg.registrationCode?.toLowerCase().includes(q) ||
      reg.department?.toLowerCase().includes(q)
    );
  });

  const handleExportCSV = () => {
    if (filteredRegistrations.length === 0) {
      onTriggerAlert && onTriggerAlert({
        isOpen: true,
        type: 'warning',
        title: 'No Data to Export',
        message: 'No participant records match the current export criteria.',
      });
      return;
    }

    const csvData = filteredRegistrations.map((r) => ({
      'Registration Code': r.registrationCode,
      'Event Title': r.eventTitle,
      'Student Name': r.studentName,
      'Student ID': r.studentId,
      'Email': r.email,
      'Phone': r.phone,
      'Department': r.department,
      'Status': r.status,
      'Payment Method': r.paymentMethod,
      'Registered Date': r.registeredAt ? new Date(r.registeredAt).toLocaleString() : '',
      'Attended': r.attendedAt ? 'Yes' : 'No',
    }));

    exportToCSV(csvData, `Event_Participants_Export_${new Date().toISOString().slice(0, 10)}.csv`);

    onTriggerAlert && onTriggerAlert({
      isOpen: true,
      type: 'success',
      title: 'CSV Export Completed!',
      message: `Exported ${csvData.length} participant records to CSV file.`,
      confirmText: 'Great',
    });
  };

  const handleCancelRegistration = (regItem: any) => {
    if (!onTriggerAlert) {
      if (confirm(`Are you sure you want to cancel the registration for "${regItem.studentName}" on event "${regItem.eventTitle}"?`)) {
        executeCancel(regItem._id);
      }
      return;
    }

    onTriggerAlert({
      isOpen: true,
      type: 'confirm',
      title: 'Confirm Registration Cancellation',
      message: `Are you sure you want to cancel the registration for "${regItem.studentName}" (${regItem.studentId}) on "${regItem.eventTitle}"? Any waitlisted students will be automatically promoted.`,
      confirmText: 'Yes, Cancel Registration',
      cancelText: 'Go Back',
      onConfirm: async () => {
        await executeCancel(regItem._id);
      },
    });
  };

  const executeCancel = async (registrationId: string) => {
    try {
      setActionLoadingId(registrationId);
      const res = await fetch(`/api/registrations/${registrationId}`, {
        method: 'DELETE',
      });
      const data = await res.json();
      if (data.success) {
        setRegistrations((prev) =>
          prev.map((r) => (r._id === registrationId ? { ...r, status: 'cancelled' } : r))
        );
        onTriggerAlert && onTriggerAlert({
          isOpen: true,
          type: 'success',
          title: 'Registration Cancelled',
          message: 'The registration was cancelled and event capacity has been updated.',
          confirmText: 'OK',
        });
      } else {
        onTriggerAlert && onTriggerAlert({
          isOpen: true,
          type: 'error',
          title: 'Cancellation Failed',
          message: data.message || 'Unable to cancel registration.',
        });
      }
    } catch (e) {
      // ignore
    } finally {
      setActionLoadingId(null);
    }
  };

  const handleManualCheckIn = async (regItem: any) => {
    try {
      setActionLoadingId(regItem._id);
      const res = await fetch('/api/attendance', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          eventId: regItem.eventId,
          registrationId: regItem._id,
        }),
      });
      const data = await res.json();
      if (data.success) {
        setRegistrations((prev) =>
          prev.map((r) => (r._id === regItem._id ? { ...r, attendedAt: new Date() } : r))
        );
        onTriggerAlert && onTriggerAlert({
          isOpen: true,
          type: 'success',
          title: 'Check-in Verified! 🎉',
          message: `Attendance for ${regItem.studentName} (${regItem.studentId}) has been successfully recorded.`,
          confirmText: 'OK',
        });
      } else {
        onTriggerAlert && onTriggerAlert({
          isOpen: true,
          type: 'warning',
          title: 'Check-in Notice',
          message: data.message || 'Unable to record attendance.',
        });
      }
    } catch (e) {
      // ignore
    } finally {
      setActionLoadingId(null);
    }
  };

  return (
    <div className="space-y-6">
      {/* Top Banner */}
      <div className="p-6 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 flex flex-col md:flex-row items-start md:items-center justify-between gap-4 shadow-sm dark:shadow-xl">
        <div>
          <h2 className="text-xl font-bold text-slate-900 dark:text-white flex items-center gap-2">
            <Ticket className="w-5 h-5 text-purple-500" />
            Event Participants & Enrollments Directory
          </h2>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
            Complete records of student enrollments, ticket passes, payment methods, and check-in statuses
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={handleExportCSV}
            className="bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs px-4 py-2.5 rounded-xl shadow-md shadow-emerald-600/25 transition flex items-center gap-1.5"
          >
            <Download className="w-4 h-4" />
            Export CSV
          </button>
        </div>
      </div>

      {/* Filter Bar */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 bg-white dark:bg-slate-900/60 p-4 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm dark:shadow-none">
        <div className="relative">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search by student name, ID, booking code, or event..."
            className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl pl-10 pr-4 py-2 text-xs text-slate-900 dark:text-white placeholder-slate-400 dark:placeholder-slate-500 focus:outline-none focus:border-pink-500"
          />
        </div>

        <div>
          <select
            value={selectedEventId}
            onChange={(e) => setSelectedEventId(e.target.value)}
            className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl px-3 py-2 text-xs text-slate-700 dark:text-slate-300 font-semibold focus:outline-none focus:border-pink-500"
          >
            <option value="all">All Events</option>
            {events.map((evt) => (
              <option key={evt._id} value={evt._id}>
                {evt.title}
              </option>
            ))}
          </select>
        </div>

        <div className="flex items-center gap-2">
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl px-3 py-2 text-xs text-slate-700 dark:text-slate-300 font-semibold focus:outline-none focus:border-pink-500"
          >
            <option value="all">All Statuses</option>
            <option value="registered">🟢 Registered</option>
            <option value="waitlisted">🟡 Waitlisted</option>
            <option value="cancelled">🔴 Cancelled</option>
          </select>

          <button
            onClick={fetchRegistrations}
            className="p-2 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-600 dark:text-slate-300 transition shrink-0"
            title="Refresh"
          >
            <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
          </button>
        </div>
      </div>

      {/* Participants Table */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl overflow-hidden shadow-sm dark:shadow-xl">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-slate-700 dark:text-slate-300">
            <thead className="bg-slate-50 dark:bg-slate-950 text-[11px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider border-b border-slate-200 dark:border-slate-800">
              <tr>
                <th className="py-3.5 px-4">Booking Code</th>
                <th className="py-3.5 px-4">Event Title</th>
                <th className="py-3.5 px-4">Student & ID</th>
                <th className="py-3.5 px-4">Department & Contact</th>
                <th className="py-3.5 px-4">Registered Date</th>
                <th className="py-3.5 px-4">Attendance Status</th>
                <th className="py-3.5 px-4">Status</th>
                <th className="py-3.5 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800/60">
              {loading ? (
                <tr>
                  <td colSpan={8} className="py-12 text-center text-slate-500">
                    <div className="flex flex-col items-center gap-2">
                      <div className="w-6 h-6 border-2 border-purple-500 border-t-transparent rounded-full animate-spin" />
                      <span>Loading participant list...</span>
                    </div>
                  </td>
                </tr>
              ) : filteredRegistrations.length === 0 ? (
                <tr>
                  <td colSpan={8} className="py-12 text-center text-slate-500">
                    No participant records found.
                  </td>
                </tr>
              ) : (
                filteredRegistrations.map((reg) => (
                  <tr key={reg._id} className="hover:bg-slate-50 dark:hover:bg-slate-800/40 transition">
                    {/* Reg Code */}
                    <td className="py-3.5 px-4 font-mono font-bold text-purple-600 dark:text-purple-400">
                      <span className="bg-purple-500/10 px-2.5 py-1 rounded-lg border border-purple-500/20">
                        {reg.registrationCode}
                      </span>
                    </td>

                    {/* Event Title */}
                    <td className="py-3.5 px-4">
                      <p className="font-bold text-slate-900 dark:text-white max-w-[200px] truncate">{reg.eventTitle}</p>
                      <span className="text-[10px] text-slate-500 dark:text-slate-400 font-mono">
                        {reg.paymentMethod || 'Free'}
                      </span>
                    </td>

                    {/* Student */}
                    <td className="py-3.5 px-4">
                      <p className="font-bold text-slate-900 dark:text-white">{reg.studentName}</p>
                      <p className="text-[10px] text-slate-500 dark:text-slate-400 font-mono">ID: {reg.studentId}</p>
                    </td>

                    {/* Department & Phone */}
                    <td className="py-3.5 px-4">
                      <p className="text-[11px] text-slate-700 dark:text-slate-300">{reg.department}</p>
                      <p className="text-[10px] text-slate-400 dark:text-slate-500">{reg.phone || reg.email}</p>
                    </td>

                    {/* Registered Date */}
                    <td className="py-3.5 px-4 text-slate-500 dark:text-slate-400 text-[11px]">
                      {reg.registeredAt ? formatDate(reg.registeredAt) : 'N/A'}
                    </td>

                    {/* Attendance */}
                    <td className="py-3.5 px-4">
                      {reg.attendedAt ? (
                        <span className="inline-flex items-center gap-1 text-[10px] font-bold text-emerald-600 dark:text-emerald-400 bg-emerald-500/10 px-2.5 py-1 rounded-full border border-emerald-500/30">
                          <CheckCircle2 className="w-3 h-3" />
                          Checked In
                        </span>
                      ) : reg.status === 'registered' ? (
                        <button
                          onClick={() => handleManualCheckIn(reg)}
                          disabled={actionLoadingId === reg._id}
                          className="inline-flex items-center gap-1 text-[10px] font-bold text-purple-600 dark:text-purple-400 bg-purple-500/10 hover:bg-purple-500/20 px-2.5 py-1 rounded-full border border-purple-500/30 transition"
                          title="Verify attendance manually"
                        >
                          <Clock className="w-3 h-3" />
                          Check In
                        </button>
                      ) : (
                        <span className="text-[10px] text-slate-400 dark:text-slate-500">Absent</span>
                      )}
                    </td>

                    {/* Status */}
                    <td className="py-3.5 px-4">
                      <span
                        className={`text-[10px] font-bold px-2.5 py-1 rounded-full ${
                          reg.status === 'registered'
                            ? 'bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 border border-emerald-500/30'
                            : reg.status === 'waitlisted'
                            ? 'bg-amber-500/15 text-amber-600 dark:text-amber-400 border border-amber-500/30'
                            : 'bg-rose-500/15 text-rose-600 dark:text-rose-400 border border-rose-500/30'
                        }`}
                      >
                        {reg.status}
                      </span>
                    </td>

                    {/* Action */}
                    <td className="py-3.5 px-4 text-right">
                      {reg.status !== 'cancelled' ? (
                        <button
                          onClick={() => handleCancelRegistration(reg)}
                          disabled={actionLoadingId === reg._id}
                          className="p-1.5 rounded-lg bg-rose-500/10 hover:bg-rose-500/20 text-rose-600 dark:text-rose-400 border border-rose-500/30 transition inline-flex items-center gap-1 text-[10px] font-bold"
                          title="Cancel Registration"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                          <span>Cancel</span>
                        </button>
                      ) : (
                        <span className="text-[10px] text-slate-400 dark:text-slate-600">Cancelled</span>
                      )}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
