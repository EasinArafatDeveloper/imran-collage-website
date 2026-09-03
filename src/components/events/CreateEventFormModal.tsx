'use client';

import React, { useState } from 'react';
import Modal from '@/components/common/Modal';
import { useAuth } from '@/context/AuthContext';
import { seedCategories, seedDepartments } from '@/lib/seedData';
import { 
  Calendar, 
  MapPin, 
  Users, 
  Plus, 
  Trash2, 
  Sparkles, 
  Image as ImageIcon,
  Clock,
  DollarSign
} from 'lucide-react';

interface CreateEventFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  onEventCreated?: (newEvent: any) => void;
  onSuccess?: (newEvent: any) => void;
}

export default function CreateEventFormModal({
  isOpen,
  onClose,
  onEventCreated,
  onSuccess,
}: CreateEventFormModalProps) {
  const { user } = useAuth();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  // Form State
  const [title, setTitle] = useState('');
  const [category, setCategory] = useState('Tech & Innovation');
  const [department, setDepartment] = useState('Computer Science & Engineering');
  const [shortDescription, setShortDescription] = useState('');
  const [description, setDescription] = useState('');
  const [coverImage, setCoverImage] = useState('https://images.unsplash.com/photo-1504384308090-c894fdcc538d?w=1200&auto=format&fit=crop&q=80');
  const [eventType, setEventType] = useState<'offline' | 'online' | 'hybrid'>('offline');
  const [venue, setVenue] = useState('University Central Auditorium');
  const [building, setBuilding] = useState('Academic Complex 1');
  const [room, setRoom] = useState('Auditorium Hall');
  
  // Date & Capacity
  const [startAt, setStartAt] = useState(new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString().slice(0, 16));
  const [endAt, setEndAt] = useState(new Date(Date.now() + 7 * 24 * 60 * 60 * 1000 + 4 * 60 * 60 * 1000).toISOString().slice(0, 16));
  const [registrationDeadline, setRegistrationDeadline] = useState(new Date(Date.now() + 6 * 24 * 60 * 60 * 1000).toISOString().slice(0, 16));
  const [capacity, setCapacity] = useState(250);
  const [registrationFee, setRegistrationFee] = useState(0);
  const [isWaitlistEnabled, setIsWaitlistEnabled] = useState(true);

  // Speakers & Agenda
  const [speakers, setSpeakers] = useState<{ name: string; designation: string; organization: string }[]>([
    { name: 'Dr. Rafiqul Islam', designation: 'Professor & Keynote Speaker', organization: 'University Faculty' }
  ]);
  const [agenda, setAgenda] = useState<{ time: string; title: string; speaker: string }[]>([
    { time: '10:00 AM', title: 'Opening & Welcome', speaker: 'Event Committee' },
    { time: '11:00 AM', title: 'Main Keynote Session', speaker: 'Dr. Rafiqul Islam' },
  ]);

  const addSpeaker = () => {
    setSpeakers([...speakers, { name: '', designation: '', organization: '' }]);
  };

  const removeSpeaker = (index: number) => {
    setSpeakers(speakers.filter((_, i) => i !== index));
  };

  const addAgendaItem = () => {
    setAgenda([...agenda, { time: '12:00 PM', title: '', speaker: '' }]);
  };

  const removeAgendaItem = (index: number) => {
    setAgenda(agenda.filter((_, i) => i !== index));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title || !description || !venue) {
      setError('Please fill in all required fields (title, description, venue)');
      return;
    }

    try {
      setLoading(true);
      setError('');

      const payload = {
        title,
        category,
        department,
        shortDescription: shortDescription || title,
        description,
        coverImage,
        eventType,
        venue,
        building,
        room,
        startAt: new Date(startAt),
        endAt: new Date(endAt),
        registrationDeadline: new Date(registrationDeadline),
        capacity: Number(capacity),
        registrationFee: Number(registrationFee),
        isWaitlistEnabled,
        speakers: speakers.filter((s) => s.name.trim() !== ''),
        agenda: agenda.filter((a) => a.title.trim() !== ''),
      };

      const res = await fetch('/api/events', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      const data = await res.json();
      if (!res.ok || !data.success) {
        setError(data.message || 'Failed to create event');
        setLoading(false);
        return;
      }

      if (onSuccess) onSuccess(data.data);
      if (onEventCreated) onEventCreated(data.data);
      onClose();
    } catch (err: any) {
      setError(err.message || 'Error occurred');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="🎉 Create New Campus Event" maxWidth="3xl">
      <form onSubmit={handleSubmit} className="space-y-6">
        {error && (
          <div className="p-3 rounded-xl bg-rose-500/10 border border-rose-500/20 text-rose-600 text-xs">
            {error}
          </div>
        )}

        {/* Basic Info */}
        <div className="space-y-4">
          <h4 className="text-xs font-bold uppercase tracking-wider text-pink-600 dark:text-pink-400">
            1. Basic Information
          </h4>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="sm:col-span-2">
              <label className="block text-xs font-semibold mb-1">Event Title *</label>
              <input
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="e.g. National University Tech Fest 2026"
                required
                className="w-full bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl px-3.5 py-2.5 text-xs focus:border-pink-500"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold mb-1">Category</label>
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                className="w-full bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl px-3.5 py-2.5 text-xs focus:border-pink-500"
              >
                {seedCategories.map((c) => (
                  <option key={c.slug} value={c.name}>
                    {c.name}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold mb-1">Department</label>
              <select
                value={department}
                onChange={(e) => setDepartment(e.target.value)}
                className="w-full bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl px-3.5 py-2.5 text-xs focus:border-pink-500"
              >
                {seedDepartments.map((d) => (
                  <option key={d} value={d}>
                    {d}
                  </option>
                ))}
              </select>
            </div>

            <div className="sm:col-span-2">
              <label className="block text-xs font-semibold mb-1">Cover Image URL</label>
              <input
                type="text"
                value={coverImage}
                onChange={(e) => setCoverImage(e.target.value)}
                className="w-full bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl px-3.5 py-2.5 text-xs focus:border-pink-500"
              />
            </div>

            <div className="sm:col-span-2">
              <label className="block text-xs font-semibold mb-1">Detailed Description *</label>
              <textarea
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                rows={3}
                placeholder="Write event schedule, highlights, objectives and rules..."
                required
                className="w-full bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl px-3.5 py-2.5 text-xs focus:border-pink-500"
              />
            </div>
          </div>
        </div>

        {/* Date, Location & Capacity */}
        <div className="space-y-4 pt-4 border-t border-slate-200 dark:border-slate-800">
          <h4 className="text-xs font-bold uppercase tracking-wider text-pink-600 dark:text-pink-400">
            2. Date, Venue & Capacity
          </h4>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div>
              <label className="block text-xs font-semibold mb-1">Start Date & Time *</label>
              <input
                type="datetime-local"
                value={startAt}
                onChange={(e) => setStartAt(e.target.value)}
                required
                className="w-full bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl px-3 py-2 text-xs focus:border-pink-500"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold mb-1">End Date & Time *</label>
              <input
                type="datetime-local"
                value={endAt}
                onChange={(e) => setEndAt(e.target.value)}
                required
                className="w-full bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl px-3 py-2 text-xs focus:border-pink-500"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold mb-1">Registration Deadline *</label>
              <input
                type="datetime-local"
                value={registrationDeadline}
                onChange={(e) => setRegistrationDeadline(e.target.value)}
                required
                className="w-full bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl px-3 py-2 text-xs focus:border-pink-500"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold mb-1">Venue *</label>
              <input
                type="text"
                value={venue}
                onChange={(e) => setVenue(e.target.value)}
                required
                className="w-full bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl px-3 py-2 text-xs focus:border-pink-500"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold mb-1">Capacity (Seats) *</label>
              <input
                type="number"
                value={capacity}
                onChange={(e) => setCapacity(Number(e.target.value))}
                min={1}
                required
                className="w-full bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl px-3 py-2 text-xs focus:border-pink-500"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold mb-1">Registration Fee (৳)</label>
              <input
                type="number"
                value={registrationFee}
                onChange={(e) => setRegistrationFee(Number(e.target.value))}
                min={0}
                placeholder="0 = Free"
                className="w-full bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl px-3 py-2 text-xs focus:border-pink-500"
              />
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="pt-4 border-t border-slate-200 dark:border-slate-800 flex justify-end gap-3">
          <button
            type="button"
            onClick={onClose}
            className="px-5 py-2.5 rounded-xl text-xs font-semibold border border-slate-200 dark:border-slate-800 hover:bg-slate-100 dark:hover:bg-slate-800"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={loading}
            className="bg-gradient-to-r from-pink-500 to-purple-600 hover:from-pink-600 hover:to-purple-700 text-white px-6 py-2.5 rounded-xl text-xs font-bold shadow-lg shadow-pink-500/25 transition disabled:opacity-50"
          >
            {loading ? 'Processing...' : user?.role === 'admin' ? 'Create & Publish Event' : 'Submit for Approval'}
          </button>
        </div>
      </form>
    </Modal>
  );
}
