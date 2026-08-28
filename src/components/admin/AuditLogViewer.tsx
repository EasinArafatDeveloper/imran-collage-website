'use client';

import React, { useState, useEffect } from 'react';
import { IAuditLog } from '@/types';
import { formatDateTime } from '@/lib/utils';
import { Shield, Search, Clock, Activity, CheckCircle, AlertCircle } from 'lucide-react';

export default function AuditLogViewer() {
  const [logs, setLogs] = useState<IAuditLog[]>([]);
  const [loading, setLoading] = useState(false);
  const [actionFilter, setActionFilter] = useState('all');

  const fetchLogs = async () => {
    try {
      setLoading(true);
      const res = await fetch(`/api/admin/audit-logs?action=${actionFilter}&limit=100`);
      const data = await res.json();
      if (data.success) {
        setLogs(data.data || []);
      }
    } catch (e) {
      // ignore
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchLogs();
  }, [actionFilter]);

  const getActionBadge = (action: string) => {
    if (action.includes('APPROVED') || action.includes('SUCCESS') || action.includes('CHECKIN')) {
      return <span className="bg-emerald-500/10 text-emerald-500 border border-emerald-500/20 px-2 py-0.5 rounded text-[10px] font-mono font-bold">{action}</span>;
    }
    if (action.includes('REJECTED') || action.includes('CANCELLED') || action.includes('DELETED')) {
      return <span className="bg-rose-500/10 text-rose-500 border border-rose-500/20 px-2 py-0.5 rounded text-[10px] font-mono font-bold">{action}</span>;
    }
    return <span className="bg-purple-500/10 text-purple-500 border border-purple-500/20 px-2 py-0.5 rounded text-[10px] font-mono font-bold">{action}</span>;
  };

  return (
    <div className="space-y-4">
      <div className="flex flex-col sm:flex-row gap-3 items-center justify-between">
        <div>
          <h3 className="font-bold text-sm text-slate-900 dark:text-white flex items-center gap-1.5">
            <Shield className="w-4 h-4 text-pink-500" />
            সিস্টেম সিকিউরিটি অডিট লগ (Audit Trail)
          </h3>
          <p className="text-xs text-slate-400 mt-0.5">বিশ্ববিদ্যালয় নিয়মানুবর্তিতা ও নিরাপত্তার সকল রেকর্ড</p>
        </div>

        <div className="flex items-center gap-2">
          <select
            value={actionFilter}
            onChange={(e) => setActionFilter(e.target.value)}
            className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl px-3 py-1.5 text-xs focus:border-pink-500"
          >
            <option value="all">সকল অডিট ইভেন্ট</option>
            <option value="EVENT">ইভেন্ট সংক্রান্ত (Events)</option>
            <option value="ATTENDANCE">উপস্থিতি যাচাই (Attendance)</option>
            <option value="REGISTRATION">রেজিস্ট্রেশন (Registrations)</option>
            <option value="USER">ইউজার মডারেশন (User)</option>
          </select>
          <button
            onClick={fetchLogs}
            className="bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 text-slate-700 dark:text-slate-300 px-3 py-1.5 rounded-xl text-xs font-semibold"
          >
            রিফ্রেশ
          </button>
        </div>
      </div>

      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl overflow-x-auto shadow-xl">
        <table className="w-full text-left text-xs">
          <thead className="bg-slate-50 dark:bg-slate-950 text-slate-500 dark:text-slate-400 uppercase font-semibold border-b border-slate-200 dark:border-slate-800">
            <tr>
              <th className="p-4">সময় (Timestamp)</th>
              <th className="p-4">অ্যাকশন (Action)</th>
              <th className="p-4">ব্যবহারকারী (User & Role)</th>
              <th className="p-4">এনটিটি</th>
              <th className="p-4">বিস্তারিত তথ্য</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 dark:divide-slate-800 text-slate-700 dark:text-slate-300">
            {logs.map((log) => (
              <tr key={log._id} className="hover:bg-slate-50 dark:hover:bg-slate-800/40 transition">
                <td className="p-4 font-mono text-[11px] text-slate-400 whitespace-nowrap">
                  {formatDateTime(log.createdAt)}
                </td>
                <td className="p-4">{getActionBadge(log.action)}</td>
                <td className="p-4">
                  <span className="font-bold text-slate-900 dark:text-white">{log.userName}</span>
                  <span className="block text-[10px] text-slate-400 uppercase font-semibold">{log.userRole}</span>
                </td>
                <td className="p-4 font-mono text-[11px]">{log.entityType}</td>
                <td className="p-4 text-slate-600 dark:text-slate-300 max-w-sm truncate">{log.details}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
