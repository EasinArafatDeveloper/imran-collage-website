'use client';

import React, { useState, useEffect } from 'react';
import Modal from '@/components/common/Modal';
import { IEvent } from '@/types';
import { 
  Calendar, 
  MapPin, 
  Users, 
  DollarSign, 
  Image as ImageIcon, 
  FileText, 
  Tag, 
  Sparkles,
  Save,
  CheckCircle2,
  AlertCircle
} from 'lucide-react';

interface EditEventModalProps {
  isOpen: boolean;
  onClose: () => void;
  event: IEvent | null;
  onSuccess: (updatedEvent: IEvent) => void;
}

export default function EditEventModal({
  isOpen,
  onClose,
  event,
  onSuccess,
}: EditEventModalProps) {
  const [title, setTitle] = useState('');
  const [category, setCategory] = useState('Tech Fest');
  const [venue, setVenue] = useState('');
  const [startAt, setStartAt] = useState('');
  const [endAt, setEndAt] = useState('');
  const [registrationDeadline, setRegistrationDeadline] = useState('');
  const [capacity, setCapacity] = useState(100);
  const [registrationFee, setRegistrationFee] = useState(0);
  const [organizerName, setOrganizerName] = useState('');
  const [coverImage, setCoverImage] = useState('');
  const [description, setDescription] = useState('');
  const [status, setStatus] = useState<'draft' | 'pending_approval' | 'published' | 'completed' | 'cancelled'>('published');
  const [tags, setTags] = useState('');

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

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

  useEffect(() => {
    if (event) {
      setTitle(event.title || '');
      setCategory(event.category || 'Tech Fest');
      setVenue(event.venue || '');
      setStartAt(event.startAt ? new Date(event.startAt).toISOString().slice(0, 16) : '');
      setEndAt(event.endAt ? new Date(event.endAt).toISOString().slice(0, 16) : '');
      setRegistrationDeadline(
        event.registrationDeadline ? new Date(event.registrationDeadline).toISOString().slice(0, 16) : ''
      );
      setCapacity(event.capacity || 100);
      setRegistrationFee(event.registrationFee || 0);
      setOrganizerName(event.organizerName || '');
      setCoverImage(event.coverImage || '');
      setDescription(event.description || '');
      setStatus((event.status as any) || 'published');
      setTags(event.tags ? event.tags.join(', ') : '');
      setError('');
    }
  }, [event]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!event) return;

    setError('');
    if (!title.trim() || !venue.trim() || !startAt) {
      setError('ইভেন্টের নাম, স্থান ও শুরুর সময় আবশ্যক');
      return;
    }

    setLoading(true);
    try {
      const res = await fetch(`/api/events/${event._id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title: title.trim(),
          category,
          venue: venue.trim(),
          startAt: new Date(startAt).toISOString(),
          endAt: endAt ? new Date(endAt).toISOString() : new Date(startAt).toISOString(),
          registrationDeadline: registrationDeadline
            ? new Date(registrationDeadline).toISOString()
            : new Date(startAt).toISOString(),
          capacity: Number(capacity),
          registrationFee: Number(registrationFee),
          organizerName: organizerName.trim(),
          coverImage: coverImage.trim(),
          description: description.trim(),
          status,
          tags: tags.split(',').map((t) => t.trim()).filter(Boolean),
        }),
      });

      const data = await res.json();
      if (data.success && data.data) {
        onSuccess(data.data);
        onClose();
      } else {
        setError(data.message || 'ইভেন্ট আপডেট করতে সমস্যা হয়েছে');
      }
    } catch (err: any) {
      setError('সার্ভারে ত্রুটি হয়েছে।');
    } finally {
      setLoading(false);
    }
  };

  if (!event) return null;

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="✏️ ইভেন্ট তথ্য এডিট ও আপডেট করুন"
      maxWidth="2xl"
    >
      <form onSubmit={handleSubmit} className="space-y-4 max-h-[75vh] overflow-y-auto pr-1 text-xs">
        {error && (
          <div className="p-3 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-600 dark:text-rose-400 font-semibold flex items-center gap-2">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        {/* Title */}
        <div className="space-y-1">
          <label className="font-bold text-slate-700 dark:text-slate-300">
            ইভেন্টের নাম (Title) <span className="text-rose-500">*</span>
          </label>
          <input
            type="text"
            required
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            className="w-full bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl px-3.5 py-2.5 text-xs text-slate-900 dark:text-white focus:border-pink-500 focus:outline-none"
          />
        </div>

        {/* Category & Status */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <div className="space-y-1">
            <label className="font-bold text-slate-700 dark:text-slate-300">ক্যাটাগরি</label>
            <select
              value={category}
              onChange={(e) => setCategory(e.target.value)}
              className="w-full bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl px-3.5 py-2.5 text-xs text-slate-900 dark:text-white focus:border-pink-500 focus:outline-none"
            >
              {categories.map((cat) => (
                <option key={cat} value={cat}>
                  {cat}
                </option>
              ))}
            </select>
          </div>

          <div className="space-y-1">
            <label className="font-bold text-slate-700 dark:text-slate-300">ইভেন্ট স্ট্যাটাস</label>
            <select
              value={status}
              onChange={(e) => setStatus(e.target.value as any)}
              className="w-full bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl px-3.5 py-2.5 text-xs text-slate-900 dark:text-white focus:border-pink-500 focus:outline-none font-bold"
            >
              <option value="published">🟢 Published (সরাসরি লাইভ)</option>
              <option value="pending_approval">🟡 Pending Approval</option>
              <option value="draft">⚪ Draft</option>
              <option value="completed">🔵 Completed</option>
              <option value="cancelled">🔴 Cancelled</option>
            </select>
          </div>
        </div>

        {/* Venue & Organizer */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <div className="space-y-1">
            <label className="font-bold text-slate-700 dark:text-slate-300">
              অনুষ্ঠানস্থল / ভেন্যু <span className="text-rose-500">*</span>
            </label>
            <div className="relative">
              <MapPin className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                required
                value={venue}
                onChange={(e) => setVenue(e.target.value)}
                className="w-full bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl pl-9 pr-3.5 py-2.5 text-xs text-slate-900 dark:text-white focus:border-pink-500 focus:outline-none"
              />
            </div>
          </div>

          <div className="space-y-1">
            <label className="font-bold text-slate-700 dark:text-slate-300">আয়োজক ক্লাব / বিভাগ</label>
            <input
              type="text"
              value={organizerName}
              onChange={(e) => setOrganizerName(e.target.value)}
              className="w-full bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl px-3.5 py-2.5 text-xs text-slate-900 dark:text-white focus:border-pink-500 focus:outline-none"
            />
          </div>
        </div>

        {/* Dates */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          <div className="space-y-1">
            <label className="font-bold text-slate-700 dark:text-slate-300">শুরুর সময়</label>
            <input
              type="datetime-local"
              required
              value={startAt}
              onChange={(e) => setStartAt(e.target.value)}
              className="w-full bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl px-3 py-2 text-xs text-slate-900 dark:text-white focus:border-pink-500 focus:outline-none"
            />
          </div>

          <div className="space-y-1">
            <label className="font-bold text-slate-700 dark:text-slate-300">সমাপ্তির সময়</label>
            <input
              type="datetime-local"
              value={endAt}
              onChange={(e) => setEndAt(e.target.value)}
              className="w-full bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl px-3 py-2 text-xs text-slate-900 dark:text-white focus:border-pink-500 focus:outline-none"
            />
          </div>

          <div className="space-y-1">
            <label className="font-bold text-slate-700 dark:text-slate-300">রেজিস্ট্রেশন ডেডলাইন</label>
            <input
              type="datetime-local"
              value={registrationDeadline}
              onChange={(e) => setRegistrationDeadline(e.target.value)}
              className="w-full bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl px-3 py-2 text-xs text-slate-900 dark:text-white focus:border-pink-500 focus:outline-none"
            />
          </div>
        </div>

        {/* Capacity & Fee */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <div className="space-y-1">
            <label className="font-bold text-slate-700 dark:text-slate-300">সর্বোচ্চ আসন সংখ্যা (Capacity)</label>
            <input
              type="number"
              min="1"
              value={capacity}
              onChange={(e) => setCapacity(Number(e.target.value))}
              className="w-full bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl px-3.5 py-2.5 text-xs text-slate-900 dark:text-white focus:border-pink-500 focus:outline-none"
            />
          </div>

          <div className="space-y-1">
            <label className="font-bold text-slate-700 dark:text-slate-300">রেজিস্ট্রেশন ফি (টাকা, 0 = ফ্রি)</label>
            <input
              type="number"
              min="0"
              value={registrationFee}
              onChange={(e) => setRegistrationFee(Number(e.target.value))}
              className="w-full bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl px-3.5 py-2.5 text-xs text-slate-900 dark:text-white focus:border-pink-500 focus:outline-none"
            />
          </div>
        </div>

        {/* Cover Image */}
        <div className="space-y-1">
          <label className="font-bold text-slate-700 dark:text-slate-300">কভার ইমেজ লিংক (Image URL)</label>
          <input
            type="url"
            value={coverImage}
            onChange={(e) => setCoverImage(e.target.value)}
            className="w-full bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl px-3.5 py-2 text-xs text-slate-900 dark:text-white focus:border-pink-500 focus:outline-none"
          />
        </div>

        {/* Description */}
        <div className="space-y-1">
          <label className="font-bold text-slate-700 dark:text-slate-300">ইভেন্টের পূর্ণ বিবরণ</label>
          <textarea
            rows={4}
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            className="w-full bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-3 text-xs text-slate-900 dark:text-white focus:border-pink-500 focus:outline-none leading-relaxed"
          />
        </div>

        {/* Tags */}
        <div className="space-y-1">
          <label className="font-bold text-slate-700 dark:text-slate-300">ট্যাগসমূহ (কমা দিয়ে আলাদা করুন)</label>
          <input
            type="text"
            value={tags}
            onChange={(e) => setTags(e.target.value)}
            placeholder="ai, python, workshop, free"
            className="w-full bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl px-3.5 py-2 text-xs text-slate-900 dark:text-white focus:border-pink-500 focus:outline-none"
          />
        </div>

        {/* Submit Actions */}
        <div className="flex justify-end gap-3 pt-3 border-t border-slate-200 dark:border-slate-800">
          <button
            type="button"
            onClick={onClose}
            className="px-5 py-2.5 rounded-xl border border-slate-300 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-300 font-bold transition"
          >
            বাতিল
          </button>
          <button
            type="submit"
            disabled={loading}
            className="px-6 py-2.5 rounded-xl bg-gradient-to-r from-pink-500 to-purple-600 hover:from-pink-600 text-white font-bold shadow-lg shadow-pink-500/25 transition flex items-center gap-2 disabled:opacity-50"
          >
            <Save className="w-4 h-4" />
            <span>{loading ? 'আপডেট হচ্ছে...' : 'পরিবর্তন সংরক্ষণ করুন'}</span>
          </button>
        </div>
      </form>
    </Modal>
  );
}
