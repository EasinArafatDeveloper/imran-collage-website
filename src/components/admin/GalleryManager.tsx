'use client';

import React, { useState, useEffect } from 'react';
import Modal from '@/components/common/Modal';
import { 
  Image as ImageIcon, 
  Plus, 
  Trash2, 
  Search, 
  Sparkles, 
  RefreshCw, 
  Calendar, 
  Tag, 
  ExternalLink,
  Save,
  AlertCircle
} from 'lucide-react';
import { SweetAlertState } from '@/components/common/SweetAlert';
import { formatDate } from '@/lib/utils';

interface GalleryManagerProps {
  onTriggerAlert?: (alert: SweetAlertState) => void;
}

export default function GalleryManager({ onTriggerAlert }: GalleryManagerProps) {
  const [photos, setPhotos] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [categoryFilter, setCategoryFilter] = useState('all');
  const [search, setSearch] = useState('');
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);

  // Add Photo Form State
  const [newTitle, setNewTitle] = useState('');
  const [newImageUrl, setNewImageUrl] = useState('');
  const [newCategory, setNewCategory] = useState('Campus Life');
  const [newEventName, setNewEventName] = useState('');
  const [newDescription, setNewDescription] = useState('');
  const [uploading, setUploading] = useState(false);
  const [formError, setFormError] = useState('');

  const categories = [
    'Campus Life',
    'Tech Fest',
    'Cultural',
    'Sports',
    'Workshop',
    'Convocation',
    'Seminar',
  ];

  const fetchPhotos = async () => {
    try {
      setLoading(true);
      const res = await fetch(`/api/gallery?category=${categoryFilter}&limit=100`);
      const data = await res.json();
      if (data.success && data.data) {
        setPhotos(data.data);
      }
    } catch (e) {
      // ignore
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPhotos();
  }, [categoryFilter]);

  const handleAddPhoto = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError('');

    if (!newTitle.trim() || !newImageUrl.trim()) {
      setFormError('ছবির শিরোনাম এবং ছবির ইমেজ ইউআরএল (URL) প্রদান আবশ্যক');
      return;
    }

    setUploading(true);
    try {
      const res = await fetch('/api/gallery', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title: newTitle.trim(),
          imageUrl: newImageUrl.trim(),
          category: newCategory,
          eventName: newEventName.trim(),
          description: newDescription.trim(),
        }),
      });

      const data = await res.json();
      if (data.success && data.data) {
        setPhotos((prev) => [data.data, ...prev]);
        setIsAddModalOpen(false);
        setNewTitle('');
        setNewImageUrl('');
        setNewEventName('');
        setNewDescription('');

        onTriggerAlert && onTriggerAlert({
          isOpen: true,
          type: 'success',
          title: 'ছবি সফলভাবে যুক্ত হয়েছে! 📸',
          message: `"${data.data.title}" ছবিটি স্মৃতি গ্যালারি ও হোম পেইজে প্রদর্শিত হবে।`,
          confirmText: 'চমৎকার',
        });
      } else {
        setFormError(data.message || 'ছবি আপলোড ব্যর্থ হয়েছে');
      }
    } catch (err: any) {
      setFormError('সার্ভার ইরর হয়েছে।');
    } finally {
      setUploading(false);
    }
  };

  const handleDeletePhoto = (photo: any) => {
    onTriggerAlert && onTriggerAlert({
      isOpen: true,
      type: 'confirm',
      title: 'ছবি ডিলিট নিশ্চিত করুন!',
      message: `আপনি কি "${photo.title}" ছবিটি গ্যালারি থেকে স্থায়ীভাবে মুছে ফেলতে চান?`,
      confirmText: 'হ্যাঁ, ডিলিট করুন',
      cancelText: 'বাতিল',
      onConfirm: async () => {
        try {
          const res = await fetch(`/api/gallery?id=${photo._id}`, {
            method: 'DELETE',
          });
          const data = await res.json();
          if (data.success) {
            setPhotos((prev) => prev.filter((p) => p._id !== photo._id));
            onTriggerAlert({
              isOpen: true,
              type: 'success',
              title: 'ছবি ডিলিট সম্পন্ন!',
              message: 'ছবিটি সফলভাবে মুছে ফেলা হয়েছে।',
              confirmText: 'ঠিক আছে',
            });
          }
        } catch (e) {
          // ignore
        }
      },
    });
  };

  const filteredPhotos = photos.filter((p) => {
    if (!search.trim()) return true;
    const q = search.toLowerCase();
    return (
      p.title?.toLowerCase().includes(q) ||
      p.eventName?.toLowerCase().includes(q) ||
      p.category?.toLowerCase().includes(q)
    );
  });

  return (
    <div className="space-y-6">
      {/* Top Banner */}
      <div className="p-6 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 flex flex-col md:flex-row items-start md:items-center justify-between gap-4 shadow-sm dark:shadow-xl">
        <div>
          <h2 className="text-xl font-bold text-slate-900 dark:text-white flex items-center gap-2">
            <ImageIcon className="w-5 h-5 text-pink-500" />
            ক্যাম্পাস স্মৃতি ও ফটো গ্যালারি ম্যানেজমেন্ট
          </h2>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
            এখানে যুক্ত করা সমস্ত ছবি হোম পেজের গ্যালারি সেকশন এবং পূর্ণ স্মৃতি মেমোরিজ পেজে লাইভ প্রদর্শিত হবে
          </p>
        </div>

        <button
          onClick={() => setIsAddModalOpen(true)}
          className="bg-gradient-to-r from-pink-500 to-purple-600 hover:from-pink-600 text-white font-bold text-xs px-5 py-2.5 rounded-xl shadow-lg shadow-pink-500/25 transition flex items-center gap-2"
        >
          <Plus className="w-4 h-4" />
          <span>+ নতুন ছবি যুক্ত করুন</span>
        </button>
      </div>

      {/* Filter Bar */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-3 bg-white dark:bg-slate-900/60 p-4 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm dark:shadow-none">
        <div className="relative flex-1 w-full">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="ছবির শিরোনাম বা ইভেন্টের নাম দিয়ে খুঁজুন..."
            className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl pl-10 pr-4 py-2 text-xs text-slate-900 dark:text-white placeholder-slate-400 dark:placeholder-slate-500 focus:outline-none focus:border-pink-500"
          />
        </div>

        <div className="flex items-center gap-2.5 w-full sm:w-auto">
          <select
            value={categoryFilter}
            onChange={(e) => setCategoryFilter(e.target.value)}
            className="bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl px-3 py-2 text-xs text-slate-700 dark:text-slate-300 font-semibold focus:outline-none focus:border-pink-500"
          >
            <option value="all">সকল ক্যাটাগরি</option>
            {categories.map((cat) => (
              <option key={cat} value={cat}>
                {cat}
              </option>
            ))}
          </select>

          <button
            onClick={fetchPhotos}
            className="p-2 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-600 dark:text-slate-300 transition"
            title="রিফ্রেশ করুন"
          >
            <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
          </button>
        </div>
      </div>

      {/* Photos Grid */}
      {loading ? (
        <div className="py-20 text-center text-slate-500 flex flex-col items-center gap-2">
          <div className="w-7 h-7 border-2 border-pink-500 border-t-transparent rounded-full animate-spin" />
          <span className="text-xs font-semibold">ছবিগুলো লোড হচ্ছে...</span>
        </div>
      ) : filteredPhotos.length === 0 ? (
        <div className="p-12 text-center rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 space-y-3 shadow-sm dark:shadow-none">
          <ImageIcon className="w-12 h-12 text-slate-400 dark:text-slate-600 mx-auto" />
          <h3 className="font-bold text-slate-900 dark:text-white text-sm">কোন ছবি পাওয়া যায়নি</h3>
          <p className="text-xs text-slate-500 dark:text-slate-400">
            উপরে "+ নতুন ছবি যুক্ত করুন" বাটনে ক্লিক করে প্রথম ক্যাম্পাস স্মৃতি যুক্ত করুন।
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
          {filteredPhotos.map((item) => (
            <div
              key={item._id}
              className="group bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl overflow-hidden shadow-sm dark:shadow-lg hover:border-pink-500/40 transition flex flex-col justify-between"
            >
              <div className="relative aspect-video overflow-hidden bg-slate-100 dark:bg-slate-950">
                <img
                  src={item.imageUrl}
                  alt={item.title}
                  className="w-full h-full object-cover group-hover:scale-105 transition duration-500"
                />
                <span className="absolute top-2.5 left-2.5 bg-slate-900/80 dark:bg-slate-950/80 backdrop-blur-md text-pink-400 border border-pink-500/30 text-[10px] font-bold px-2.5 py-0.5 rounded-full">
                  {item.category}
                </span>
                <button
                  onClick={() => handleDeletePhoto(item)}
                  className="absolute top-2.5 right-2.5 p-1.5 rounded-lg bg-rose-600/90 hover:bg-rose-600 text-white shadow-md opacity-0 group-hover:opacity-100 transition"
                  title="ছবি ডিলিট করুন"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              </div>

              <div className="p-4 space-y-1.5 flex-1 flex flex-col justify-between">
                <div>
                  <h4 className="font-bold text-xs text-slate-900 dark:text-white line-clamp-1">{item.title}</h4>
                  {item.eventName && (
                    <p className="text-[10px] text-pink-500 dark:text-pink-400 line-clamp-1">📍 {item.eventName}</p>
                  )}
                  {item.description && (
                    <p className="text-[11px] text-slate-500 dark:text-slate-400 line-clamp-2 mt-1">{item.description}</p>
                  )}
                </div>

                <div className="pt-2 border-t border-slate-100 dark:border-slate-800/80 flex items-center justify-between text-[10px] text-slate-400 dark:text-slate-500">
                  <span>{item.createdAt ? formatDate(item.createdAt) : ''}</span>
                  <a
                    href={item.imageUrl}
                    target="_blank"
                    rel="noreferrer"
                    className="hover:text-pink-500 dark:hover:text-pink-400 flex items-center gap-1"
                  >
                    <span>মূল ছবি</span>
                    <ExternalLink className="w-3 h-3" />
                  </a>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Add Photo Modal */}
      <Modal
        isOpen={isAddModalOpen}
        onClose={() => setIsAddModalOpen(false)}
        title="📸 নতুন ক্যাম্পাস স্মৃতি ও ছবি যুক্ত করুন"
        maxWidth="lg"
      >
        <form onSubmit={handleAddPhoto} className="space-y-4 text-xs text-slate-700 dark:text-slate-300">
          {formError && (
            <div className="p-3 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-600 dark:text-rose-400 font-semibold flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{formError}</span>
            </div>
          )}

          {/* Title */}
          <div className="space-y-1">
            <label className="font-bold text-slate-700 dark:text-slate-300">
              ছবির শিরোনাম (Title) <span className="text-rose-500">*</span>
            </label>
            <input
              type="text"
              required
              value={newTitle}
              onChange={(e) => setNewTitle(e.target.value)}
              placeholder="e.g. ন্যাশনাল টেক ফেস্ট ২০২৬ ওপেনিং সেরেমনি"
              className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl px-3.5 py-2.5 text-xs text-slate-900 dark:text-white focus:outline-none focus:border-pink-500"
            />
          </div>

          {/* Image URL */}
          <div className="space-y-1">
            <label className="font-bold text-slate-700 dark:text-slate-300">
              ছবির সরাসরি ওয়েব লিংক (Image URL) <span className="text-rose-500">*</span>
            </label>
            <input
              type="url"
              required
              value={newImageUrl}
              onChange={(e) => setNewImageUrl(e.target.value)}
              placeholder="https://images.unsplash.com/..."
              className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl px-3.5 py-2.5 text-xs text-slate-900 dark:text-white focus:outline-none focus:border-pink-500 font-mono"
            />
          </div>

          {/* Image Live Preview */}
          {newImageUrl && (
            <div className="relative aspect-video rounded-xl overflow-hidden border border-slate-200 dark:border-slate-800 bg-slate-100 dark:bg-slate-950">
              <img
                src={newImageUrl}
                alt="Preview"
                className="w-full h-full object-cover"
                onError={(e) => {
                  (e.target as any).src = 'https://images.unsplash.com/photo-1540575467063-178a50c2df87?w=600&auto=format&fit=crop&q=80';
                }}
              />
              <span className="absolute bottom-2 right-2 bg-slate-900/80 text-[10px] px-2 py-0.5 rounded text-white font-mono">
                Live Preview
              </span>
            </div>
          )}

          {/* Category & Event Name */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div className="space-y-1">
              <label className="font-bold text-slate-700 dark:text-slate-300">ক্যাটাগরি</label>
              <select
                value={newCategory}
                onChange={(e) => setNewCategory(e.target.value)}
                className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl px-3 py-2.5 text-xs text-slate-900 dark:text-white focus:outline-none focus:border-pink-500"
              >
                {categories.map((cat) => (
                  <option key={cat} value={cat}>
                    {cat}
                  </option>
                ))}
              </select>
            </div>

            <div className="space-y-1">
              <label className="font-bold text-slate-700 dark:text-slate-300">সম্পর্কিত ইভেন্টের নাম</label>
              <input
                type="text"
                value={newEventName}
                onChange={(e) => setNewEventName(e.target.value)}
                placeholder="e.g. Tech Fest 2026"
                className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl px-3.5 py-2.5 text-xs text-slate-900 dark:text-white focus:outline-none focus:border-pink-500"
              />
            </div>
          </div>

          {/* Description */}
          <div className="space-y-1">
            <label className="font-bold text-slate-700 dark:text-slate-300">সংক্ষিপ্ত বিবরণ (Optional)</label>
            <textarea
              rows={2}
              value={newDescription}
              onChange={(e) => setNewDescription(e.target.value)}
              placeholder="মুহূর্তটির সংক্ষিপ্ত বর্ণনা লিখুন..."
              className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl p-3 text-xs text-slate-900 dark:text-white focus:outline-none focus:border-pink-500"
            />
          </div>

          {/* Action Buttons */}
          <div className="flex justify-end gap-3 pt-3 border-t border-slate-200 dark:border-slate-800">
            <button
              type="button"
              onClick={() => setIsAddModalOpen(false)}
              className="px-5 py-2 rounded-xl border border-slate-300 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-300 font-bold transition"
            >
              বাতিল
            </button>
            <button
              type="submit"
              disabled={uploading}
              className="px-6 py-2 rounded-xl bg-gradient-to-r from-pink-500 to-purple-600 hover:from-pink-600 text-white font-bold shadow-lg shadow-pink-500/25 transition flex items-center gap-2 disabled:opacity-50"
            >
              <Save className="w-4 h-4" />
              <span>{uploading ? 'যুক্ত হচ্ছে...' : 'ছবি সংরক্ষণ করুন'}</span>
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
