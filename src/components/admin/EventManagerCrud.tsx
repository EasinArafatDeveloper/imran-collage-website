'use client';

import React, { useState } from 'react';
import { IEvent } from '@/types';
import { 
  Calendar, 
  Search, 
  Plus, 
  Edit3, 
  Trash2, 
  Eye, 
  CheckCircle2, 
  XCircle, 
  MapPin, 
  Clock, 
  DollarSign, 
  Users, 
  Sparkles,
  RefreshCw,
  Layers,
  ChevronRight
} from 'lucide-react';
import { SweetAlertState } from '@/components/common/SweetAlert';
import { formatDate } from '@/lib/utils';

interface EventManagerCrudProps {
  events: IEvent[];
  onOpenCreateModal: () => void;
  onOpenEditModal: (event: IEvent) => void;
  onViewEvent: (event: IEvent) => void;
  onStatusChange: (eventId: string, status: string, reason?: string) => Promise<void>;
  onDeleteEvent: (eventId: string, title: string) => void;
  onRefresh: () => void;
  loading?: boolean;
}

export default function EventManagerCrud({
  events = [],
  onOpenCreateModal,
  onOpenEditModal,
  onViewEvent,
  onStatusChange,
  onDeleteEvent,
  onRefresh,
  loading = false,
}: EventManagerCrudProps) {
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [categoryFilter, setCategoryFilter] = useState('all');

  const categories = [
    'Tech Fest',
    'Cultural',
    'Sports',
    'Debate',
    'Career & Workshop',
    'Seminar & Tech Talk',
    'Robotics & AI',
    'Business & Case Competition',
  ];

  const filteredEvents = events.filter((evt) => {
    const matchesSearch =
      !search.trim() ||
      evt.title.toLowerCase().includes(search.toLowerCase()) ||
      evt.venue.toLowerCase().includes(search.toLowerCase()) ||
      (evt.organizerName && evt.organizerName.toLowerCase().includes(search.toLowerCase()));

    const matchesStatus = statusFilter === 'all' || evt.status === statusFilter;
    const matchesCategory = categoryFilter === 'all' || evt.category === categoryFilter;

    return matchesSearch && matchesStatus && matchesCategory;
  });

  return (
    <div className="space-y-6">
      {/* Top Banner */}
      <div className="p-6 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 flex flex-col md:flex-row items-start md:items-center justify-between gap-4 shadow-sm dark:shadow-xl">
        <div>
          <h2 className="text-xl font-bold text-slate-900 dark:text-white flex items-center gap-2">
            <Calendar className="w-5 h-5 text-pink-500" />
            Events Management & Controls (Full CRUD)
          </h2>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
            Add new events, edit information, approve submissions, or remove events as needed
          </p>
        </div>

        <button
          onClick={onOpenCreateModal}
          className="bg-gradient-to-r from-pink-500 to-purple-600 hover:from-pink-600 text-white font-bold text-xs px-5 py-2.5 rounded-xl shadow-lg shadow-pink-500/25 transition flex items-center gap-2"
        >
          <Plus className="w-4 h-4" />
          <span>+ Create New Event</span>
        </button>
      </div>

      {/* Filter Bar */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 bg-white dark:bg-slate-900/60 p-4 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm dark:shadow-none">
        <div className="relative">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search by event title, venue, or organizer..."
            className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl pl-10 pr-4 py-2 text-xs text-slate-900 dark:text-white placeholder-slate-400 dark:placeholder-slate-500 focus:outline-none focus:border-pink-500"
          />
        </div>

        <div>
          <select
            value={categoryFilter}
            onChange={(e) => setCategoryFilter(e.target.value)}
            className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl px-3 py-2 text-xs text-slate-700 dark:text-slate-300 font-semibold focus:outline-none focus:border-pink-500"
          >
            <option value="all">All Categories</option>
            {categories.map((cat) => (
              <option key={cat} value={cat}>
                {cat}
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
            <option value="published">🟢 Published</option>
            <option value="pending_approval">🟡 Pending Approval</option>
            <option value="draft">⚪ Draft</option>
            <option value="completed">🔵 Completed</option>
            <option value="cancelled">🔴 Cancelled</option>
          </select>

          <button
            onClick={onRefresh}
            className="p-2 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-600 dark:text-slate-300 transition shrink-0"
            title="Refresh"
          >
            <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
          </button>
        </div>
      </div>

      {/* Events Table */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl overflow-hidden shadow-sm dark:shadow-xl">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-slate-700 dark:text-slate-300">
            <thead className="bg-slate-50 dark:bg-slate-950 text-[11px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider border-b border-slate-200 dark:border-slate-800">
              <tr>
                <th className="py-3.5 px-4">Event Details</th>
                <th className="py-3.5 px-4">Category</th>
                <th className="py-3.5 px-4">Date & Time</th>
                <th className="py-3.5 px-4">Registration & Capacity</th>
                <th className="py-3.5 px-4">Fee</th>
                <th className="py-3.5 px-4">Status</th>
                <th className="py-3.5 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800/60">
              {loading ? (
                <tr>
                  <td colSpan={7} className="py-12 text-center text-slate-500">
                    <div className="flex flex-col items-center gap-2">
                      <div className="w-6 h-6 border-2 border-pink-500 border-t-transparent rounded-full animate-spin" />
                      <span>Loading events list...</span>
                    </div>
                  </td>
                </tr>
              ) : filteredEvents.length === 0 ? (
                <tr>
                  <td colSpan={7} className="py-12 text-center text-slate-500">
                    No events found.
                  </td>
                </tr>
              ) : (
                filteredEvents.map((evt) => (
                  <tr key={evt._id} className="hover:bg-slate-50 dark:hover:bg-slate-800/40 transition">
                    {/* Event Banner & Title */}
                    <td className="py-3.5 px-4">
                      <div className="flex items-center gap-3">
                        <img
                          src={evt.coverImage || 'https://images.unsplash.com/photo-1540575467063-178a50c2df87?w=100&auto=format&fit=crop&q=80'}
                          alt={evt.title}
                          className="w-12 h-10 rounded-xl object-cover border border-slate-200 dark:border-slate-700 shrink-0"
                        />
                        <div className="overflow-hidden max-w-[220px]">
                          <p className="font-bold text-slate-900 dark:text-white truncate">{evt.title}</p>
                          <p className="text-[10px] text-slate-500 dark:text-slate-400 truncate flex items-center gap-1">
                            <MapPin className="w-3 h-3 text-pink-500" />
                            <span>{evt.venue}</span>
                          </p>
                        </div>
                      </div>
                    </td>

                    {/* Category */}
                    <td className="py-3.5 px-4">
                      <span className="bg-pink-500/10 text-pink-600 dark:text-pink-400 border border-pink-500/20 px-2.5 py-1 rounded-lg text-[10px] font-bold">
                        {evt.category}
                      </span>
                    </td>

                    {/* Date */}
                    <td className="py-3.5 px-4 text-slate-600 dark:text-slate-300 text-[11px]">
                      <div className="flex items-center gap-1">
                        <Clock className="w-3.5 h-3.5 text-slate-400 dark:text-slate-500" />
                        <span>{formatDate(evt.startAt)}</span>
                      </div>
                    </td>

                    {/* Registrations / Capacity */}
                    <td className="py-3.5 px-4">
                      <div className="space-y-1">
                        <div className="flex items-center justify-between text-[10px] font-bold">
                          <span className="text-slate-900 dark:text-white">{evt.registeredCount || 0}</span>
                          <span className="text-slate-400 dark:text-slate-500">/ {evt.capacity} Seats</span>
                        </div>
                        <div className="w-24 bg-slate-100 dark:bg-slate-800 rounded-full h-1.5 overflow-hidden">
                          <div
                            className="bg-gradient-to-r from-pink-500 to-purple-600 h-1.5 rounded-full"
                            style={{
                              width: `${Math.min(100, ((evt.registeredCount || 0) / (evt.capacity || 1)) * 100)}%`,
                            }}
                          />
                        </div>
                      </div>
                    </td>

                    {/* Fee */}
                    <td className="py-3.5 px-4 font-bold">
                      {evt.registrationFee > 0 ? (
                        <span className="text-emerald-600 dark:text-emerald-400">৳ {evt.registrationFee}</span>
                      ) : (
                        <span className="text-emerald-600 dark:text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded text-[10px]">
                          Free
                        </span>
                      )}
                    </td>

                    {/* Status Dropdown */}
                    <td className="py-3.5 px-4">
                      <select
                        value={evt.status}
                        onChange={(e) => onStatusChange(evt._id, e.target.value)}
                        className={`text-[10px] font-bold px-2 py-1 rounded-lg border focus:outline-none ${
                          evt.status === 'published'
                            ? 'bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 border-emerald-500/30'
                            : evt.status === 'pending_approval'
                            ? 'bg-amber-500/15 text-amber-600 dark:text-amber-400 border-amber-500/30'
                            : evt.status === 'completed'
                            ? 'bg-blue-500/15 text-blue-600 dark:text-blue-400 border-blue-500/30'
                            : 'bg-rose-500/15 text-rose-600 dark:text-rose-400 border-rose-500/30'
                        }`}
                      >
                        <option value="published">🟢 Published</option>
                        <option value="pending_approval">🟡 Pending</option>
                        <option value="draft">⚪ Draft</option>
                        <option value="completed">🔵 Completed</option>
                        <option value="cancelled">🔴 Cancelled</option>
                      </select>
                    </td>

                    {/* Action Buttons */}
                    <td className="py-3.5 px-4 text-right">
                      <div className="flex items-center justify-end gap-1.5">
                        <button
                          onClick={() => onViewEvent(evt)}
                          className="p-1.5 rounded-lg bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-600 dark:text-slate-300 transition"
                          title="View Details"
                        >
                          <Eye className="w-3.5 h-3.5" />
                        </button>
                        <button
                          onClick={() => onOpenEditModal(evt)}
                          className="p-1.5 rounded-lg bg-pink-500/10 hover:bg-pink-500/20 text-pink-600 dark:text-pink-400 border border-pink-500/30 transition"
                          title="Edit Event"
                        >
                          <Edit3 className="w-3.5 h-3.5" />
                        </button>
                        <button
                          onClick={() => onDeleteEvent(evt._id, evt.title)}
                          className="p-1.5 rounded-lg bg-rose-500/10 hover:bg-rose-500/20 text-rose-600 dark:text-rose-400 border border-rose-500/30 transition"
                          title="Delete Event"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
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
