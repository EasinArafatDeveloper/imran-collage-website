'use client';

import React, { useState } from 'react';
import { IEvent } from '@/types';
import { formatDate } from '@/lib/utils';
import { CheckCircle2, XCircle, Clock, AlertTriangle, Eye, Trash2 } from 'lucide-react';

interface EventApprovalTableProps {
  events: IEvent[];
  onStatusChange: (eventId: string, newStatus: string, reason?: string) => void;
  onViewEvent: (event: IEvent) => void;
  onDeleteEvent?: (eventId: string) => void;
}

export default function EventApprovalTable({
  events,
  onStatusChange,
  onViewEvent,
  onDeleteEvent,
}: EventApprovalTableProps) {
  const [rejectingId, setRejectingId] = useState<string | null>(null);
  const [rejectReason, setRejectReason] = useState('');

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'published':
      case 'approved':
        return <span className="bg-emerald-500/10 text-emerald-500 border border-emerald-500/20 px-2.5 py-1 rounded-full text-[10px] font-bold">● প্রকাশিত (Published)</span>;
      case 'pending_approval':
        return <span className="bg-amber-500/10 text-amber-500 border border-amber-500/20 px-2.5 py-1 rounded-full text-[10px] font-bold animate-pulse">⏳ অপেক্ষমান (Pending)</span>;
      case 'rejected':
        return <span className="bg-rose-500/10 text-rose-500 border border-rose-500/20 px-2.5 py-1 rounded-full text-[10px] font-bold">❌ প্রত্যাখ্যাত (Rejected)</span>;
      case 'cancelled':
        return <span className="bg-slate-500/10 text-slate-400 border border-slate-500/20 px-2.5 py-1 rounded-full text-[10px] font-bold">🚫 বাতিল (Cancelled)</span>;
      default:
        return <span className="bg-slate-500/10 text-slate-400 px-2 py-0.5 rounded text-[10px]">{status}</span>;
    }
  };

  return (
    <div className="space-y-4">
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl overflow-x-auto shadow-xl">
        <table className="w-full text-left text-xs">
          <thead className="bg-slate-50 dark:bg-slate-950 text-slate-500 dark:text-slate-400 uppercase font-semibold border-b border-slate-200 dark:border-slate-800">
            <tr>
              <th className="p-4">ইভেন্ট ও আয়োজক</th>
              <th className="p-4">ক্যাটাগরি</th>
              <th className="p-4">তারিখ ও ভেন্যু</th>
              <th className="p-4">আসন ও ফি</th>
              <th className="p-4">স্ট্যাটাস</th>
              <th className="p-4 text-right">অ্যাকশন</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 dark:divide-slate-800 text-slate-700 dark:text-slate-300">
            {events.map((evt) => (
              <tr key={evt._id} className="hover:bg-slate-50 dark:hover:bg-slate-800/40 transition">
                <td className="p-4">
                  <div className="flex items-center gap-3">
                    <img
                      src={evt.coverImage}
                      alt={evt.title}
                      className="w-10 h-10 rounded-xl object-cover shrink-0"
                    />
                    <div>
                      <h4 className="font-bold text-slate-900 dark:text-white truncate max-w-xs">{evt.title}</h4>
                      <p className="text-[11px] text-slate-400">{evt.clubName || evt.organizerName}</p>
                    </div>
                  </div>
                </td>
                <td className="p-4">
                  <span className="font-medium text-pink-600 dark:text-pink-400">{evt.category}</span>
                  <p className="text-[10px] text-slate-400">{evt.department || 'General'}</p>
                </td>
                <td className="p-4">
                  <p className="font-semibold text-slate-900 dark:text-white">{formatDate(evt.startAt)}</p>
                  <p className="text-[10px] text-slate-400 truncate max-w-[150px]">{evt.venue}</p>
                </td>
                <td className="p-4">
                  <p className="font-bold">{evt.registeredCount || 0} / {evt.capacity}</p>
                  <p className="text-[10px] text-slate-400">{evt.registrationFee > 0 ? `৳ ${evt.registrationFee}` : 'Free'}</p>
                </td>
                <td className="p-4">{getStatusBadge(evt.status)}</td>
                <td className="p-4 text-right">
                  <div className="flex items-center justify-end gap-1.5">
                    <button
                      onClick={() => onViewEvent(evt)}
                      className="p-1.5 rounded-lg bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:text-pink-500"
                      title="ভিউ ডিটেইলস"
                    >
                      <Eye className="w-4 h-4" />
                    </button>

                    {evt.status === 'pending_approval' && (
                      <>
                        <button
                          onClick={() => onStatusChange(evt._id, 'published')}
                          className="px-2.5 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-[11px] shadow-sm flex items-center gap-1"
                        >
                          <CheckCircle2 className="w-3.5 h-3.5" />
                          অনুমোদন
                        </button>
                        <button
                          onClick={() => setRejectingId(evt._id)}
                          className="px-2.5 py-1.5 rounded-lg bg-rose-600 hover:bg-rose-700 text-white font-bold text-[11px] shadow-sm flex items-center gap-1"
                        >
                          <XCircle className="w-3.5 h-3.5" />
                          বাতিল
                        </button>
                      </>
                    )}

                    {evt.status === 'published' && (
                      <button
                        onClick={() => onStatusChange(evt._id, 'cancelled')}
                        className="px-2 py-1 rounded-lg border border-rose-500/30 text-rose-500 hover:bg-rose-500/10 text-[10px] font-semibold"
                      >
                        ক্যান্সেল
                      </button>
                    )}

                    {onDeleteEvent && (
                      <button
                        onClick={() => onDeleteEvent(evt._id)}
                        className="p-1.5 rounded-lg text-slate-400 hover:text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-950/20"
                        title="Delete event"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    )}
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Reject Modal */}
      {rejectingId && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 max-w-md w-full space-y-4 shadow-2xl">
            <h3 className="font-bold text-base text-slate-900 dark:text-white">ইভেন্ট বাতিলের কারণ উল্লেখ করুন</h3>
            <textarea
              value={rejectReason}
              onChange={(e) => setRejectReason(e.target.value)}
              placeholder="যেমন: তারিখের সাংঘর্ষিকতা বা অপর্যাপ্ত নিরাপত্তা পরিকল্পনা..."
              rows={3}
              className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl p-3 text-xs focus:outline-none focus:border-pink-500"
            />
            <div className="flex justify-end gap-2">
              <button
                onClick={() => setRejectingId(null)}
                className="px-4 py-2 rounded-xl text-xs font-semibold border border-slate-200 dark:border-slate-800"
              >
                ফিরে যান
              </button>
              <button
                onClick={() => {
                  onStatusChange(rejectingId, 'rejected', rejectReason);
                  setRejectingId(null);
                  setRejectReason('');
                }}
                className="px-4 py-2 rounded-xl text-xs font-bold bg-rose-600 hover:bg-rose-700 text-white"
              >
                বাতিল নিশ্চিত করুন
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
