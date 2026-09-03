'use client';

import React, { useState, useEffect } from 'react';
import Modal from '@/components/common/Modal';
import { IClub } from '@/types';
import { 
  Building2, 
  Plus, 
  Trash2, 
  Search, 
  Users, 
  RefreshCw, 
  Sparkles, 
  Mail, 
  Calendar, 
  ExternalLink,
  Save,
  AlertCircle
} from 'lucide-react';
import { SweetAlertState } from '@/components/common/SweetAlert';

interface ClubManagerProps {
  onTriggerAlert?: (alert: SweetAlertState) => void;
}

export default function ClubManager({ onTriggerAlert }: ClubManagerProps) {
  const [clubs, setClubs] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);

  // Add Club Form State
  const [name, setName] = useState('');
  const [category, setCategory] = useState('Technology & Coding');
  const [department, setDepartment] = useState('Computer Science & Engineering');
  const [presidentName, setPresidentName] = useState('');
  const [presidentEmail, setPresidentEmail] = useState('');
  const [contactEmail, setContactEmail] = useState('');
  const [establishedYear, setEstablishedYear] = useState(2024);
  const [logo, setLogo] = useState('');
  const [coverImage, setCoverImage] = useState('');
  const [description, setDescription] = useState('');
  const [saving, setSaving] = useState(false);
  const [formError, setFormError] = useState('');

  const categories = [
    'Technology & Coding',
    'Robotics & AI',
    'Business & Entrepreneurship',
    'Cultural & Music',
    'Debate & Public Speaking',
    'Sports & Athletics',
    'Science & Research',
  ];

  const fetchClubs = async () => {
    try {
      setLoading(true);
      const res = await fetch('/api/clubs');
      const data = await res.json();
      if (data.success && data.data) {
        setClubs(data.data);
      }
    } catch (e) {
      // ignore
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchClubs();
  }, []);

  const handleAddClub = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError('');

    if (!name.trim() || !presidentName.trim() || !description.trim()) {
      setFormError('Club name, president name, and club description are required');
      return;
    }

    setSaving(true);
    try {
      const res = await fetch('/api/clubs', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: name.trim(),
          category,
          department,
          presidentName: presidentName.trim(),
          presidentEmail: presidentEmail.trim() || 'president@university.edu',
          contactEmail: contactEmail.trim() || 'club@university.edu',
          establishedYear: Number(establishedYear) || 2024,
          logo: logo.trim() || 'https://images.unsplash.com/photo-1526374965328-7f61d4dc18c5?w=200&auto=format&fit=crop&q=80',
          coverImage: coverImage.trim() || 'https://images.unsplash.com/photo-1517245386807-bb43f82c33c4?w=1200&auto=format&fit=crop&q=80',
          description: description.trim(),
        }),
      });

      const data = await res.json();
      if (data.success && data.data) {
        setClubs((prev) => [data.data, ...prev]);
        setIsAddModalOpen(false);
        setName('');
        setPresidentName('');
        setPresidentEmail('');
        setDescription('');
        setLogo('');
        setCoverImage('');

        onTriggerAlert && onTriggerAlert({
          isOpen: true,
          type: 'success',
          title: 'New Club Created! 🏛️',
          message: `"${data.data.name}" has been successfully established and activated.`,
          confirmText: 'Great',
        });
      } else {
        setFormError(data.message || 'Failed to create club');
      }
    } catch (err: any) {
      setFormError('A server error occurred.');
    } finally {
      setSaving(false);
    }
  };

  const handleDeleteClub = (club: any) => {
    onTriggerAlert && onTriggerAlert({
      isOpen: true,
      type: 'confirm',
      title: 'Confirm Club Deletion',
      message: `Are you sure you want to permanently delete "${club.name}"?`,
      confirmText: 'Yes, Delete',
      cancelText: 'Cancel',
      onConfirm: async () => {
        try {
          const res = await fetch(`/api/clubs?id=${club._id}`, {
            method: 'DELETE',
          });
          const data = await res.json();
          if (data.success) {
            setClubs((prev) => prev.filter((c) => c._id !== club._id));
            onTriggerAlert({
              isOpen: true,
              type: 'success',
              title: 'Club Deleted!',
              message: `"${club.name}" was successfully removed.`,
              confirmText: 'OK',
            });
          }
        } catch (e) {
          // ignore
        }
      },
    });
  };

  const filteredClubs = clubs.filter((c) => {
    if (!search.trim()) return true;
    const q = search.toLowerCase();
    return (
      c.name?.toLowerCase().includes(q) ||
      c.category?.toLowerCase().includes(q) ||
      c.department?.toLowerCase().includes(q)
    );
  });

  return (
    <div className="space-y-6">
      {/* Top Banner */}
      <div className="p-6 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 flex flex-col md:flex-row items-start md:items-center justify-between gap-4 shadow-sm dark:shadow-xl">
        <div>
          <h2 className="text-xl font-bold text-slate-900 dark:text-white flex items-center gap-2">
            <Building2 className="w-5 h-5 text-indigo-500" />
            University Clubs & Forums Control
          </h2>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
            Create student clubs, organize leadership directories, and manage club profiles
          </p>
        </div>

        <button
          onClick={() => setIsAddModalOpen(true)}
          className="bg-gradient-to-r from-pink-500 to-purple-600 hover:from-pink-600 text-white font-bold text-xs px-5 py-2.5 rounded-xl shadow-lg shadow-pink-500/25 transition flex items-center gap-2"
        >
          <Plus className="w-4 h-4" />
          <span>+ Add New Club</span>
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
            placeholder="Search by club name or category..."
            className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl pl-10 pr-4 py-2 text-xs text-slate-900 dark:text-white placeholder-slate-400 dark:placeholder-slate-500 focus:outline-none focus:border-pink-500"
          />
        </div>

        <button
          onClick={fetchClubs}
          className="p-2 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-600 dark:text-slate-300 transition shrink-0"
          title="Refresh Clubs"
        >
          <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
        </button>
      </div>

      {/* Clubs Grid */}
      {loading ? (
        <div className="py-20 text-center text-slate-500 flex flex-col items-center gap-2">
          <div className="w-7 h-7 border-2 border-indigo-500 border-t-transparent rounded-full animate-spin" />
          <span className="text-xs font-semibold">Loading clubs list...</span>
        </div>
      ) : filteredClubs.length === 0 ? (
        <div className="p-12 text-center rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 space-y-3 shadow-sm dark:shadow-none">
          <Building2 className="w-12 h-12 text-slate-400 dark:text-slate-600 mx-auto" />
          <h3 className="font-bold text-slate-900 dark:text-white text-sm">No active clubs found</h3>
          <p className="text-xs text-slate-500 dark:text-slate-400">
            Click "+ Add New Club" above to establish a new student club or department society.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredClubs.map((club) => (
            <div
              key={club._id}
              className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl overflow-hidden shadow-sm dark:shadow-xl hover:border-indigo-500/40 transition flex flex-col justify-between"
            >
              <div className="relative h-32 bg-slate-100 dark:bg-slate-950">
                <img
                  src={club.coverImage || 'https://images.unsplash.com/photo-1517245386807-bb43f82c33c4?w=800&auto=format&fit=crop&q=80'}
                  alt={club.name}
                  className="w-full h-full object-cover"
                />
                <button
                  onClick={() => handleDeleteClub(club)}
                  className="absolute top-3 right-3 p-1.5 rounded-lg bg-rose-600/90 hover:bg-rose-600 text-white shadow-md transition"
                  title="Delete Club"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              </div>

              <div className="p-5 space-y-3 flex-1 flex flex-col justify-between -mt-6">
                <div className="space-y-2">
                  <div className="flex items-center gap-3">
                    <img
                      src={club.logo}
                      alt={club.name}
                      className="w-12 h-12 rounded-2xl object-cover border-2 border-white dark:border-slate-900 bg-white dark:bg-slate-950 shadow-md shrink-0"
                    />
                    <div className="overflow-hidden">
                      <span className="text-[10px] bg-indigo-500/15 text-indigo-600 dark:text-indigo-400 border border-indigo-500/30 px-2 py-0.5 rounded-full font-bold">
                        {club.category}
                      </span>
                      <h4 className="font-bold text-sm text-slate-900 dark:text-white truncate mt-1">{club.name}</h4>
                    </div>
                  </div>

                  <p className="text-xs text-slate-600 dark:text-slate-400 line-clamp-2 leading-relaxed">
                    {club.description}
                  </p>
                </div>

                <div className="pt-3 border-t border-slate-100 dark:border-slate-800 text-[11px] text-slate-500 dark:text-slate-400 space-y-1">
                  <p>👤 President: <strong className="text-slate-900 dark:text-white">{club.presidentName}</strong></p>
                  <p>🏛️ Department: <span>{club.department || 'All Departments'}</span></p>
                  <p>📅 Established: <span>{club.establishedYear}</span></p>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Add Club Modal */}
      <Modal
        isOpen={isAddModalOpen}
        onClose={() => setIsAddModalOpen(false)}
        title="🏛️ Establish New University Club"
        maxWidth="xl"
      >
        <form onSubmit={handleAddClub} noValidate className="space-y-4 text-xs text-slate-700 dark:text-slate-300">
          {formError && (
            <div className="p-3 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-600 dark:text-rose-400 font-semibold flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{formError}</span>
            </div>
          )}

          {/* Club Name */}
          <div className="space-y-1">
            <label className="font-bold text-slate-700 dark:text-slate-300">
              Full Club Name <span className="text-rose-500">*</span>
            </label>
            <input
              type="text"
              required
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g. Computer & Programming Club (CPC)"
              className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl px-3.5 py-2.5 text-xs text-slate-900 dark:text-white focus:outline-none focus:border-pink-500"
            />
          </div>

          {/* Category & Department */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div className="space-y-1">
              <label className="font-bold text-slate-700 dark:text-slate-300">Category</label>
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value)}
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
              <label className="font-bold text-slate-700 dark:text-slate-300">Affiliated Department</label>
              <input
                type="text"
                value={department}
                onChange={(e) => setDepartment(e.target.value)}
                placeholder="e.g. Computer Science & Engineering"
                className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl px-3.5 py-2.5 text-xs text-slate-900 dark:text-white focus:outline-none focus:border-pink-500"
              />
            </div>
          </div>

          {/* President Name & Email */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div className="space-y-1">
              <label className="font-bold text-slate-700 dark:text-slate-300">
                President / Lead Coordinator <span className="text-rose-500">*</span>
              </label>
              <input
                type="text"
                required
                value={presidentName}
                onChange={(e) => setPresidentName(e.target.value)}
                placeholder="President's Full Name"
                className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl px-3.5 py-2.5 text-xs text-slate-900 dark:text-white focus:outline-none focus:border-pink-500"
              />
            </div>

            <div className="space-y-1">
              <label className="font-bold text-slate-700 dark:text-slate-300">Contact Email</label>
              <input
                type="email"
                value={contactEmail}
                onChange={(e) => setContactEmail(e.target.value)}
                placeholder="club@university.edu"
                className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl px-3.5 py-2.5 text-xs text-slate-900 dark:text-white focus:outline-none focus:border-pink-500"
              />
            </div>
          </div>

          {/* Logo & Cover URLs */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div className="space-y-1">
              <label className="font-bold text-slate-700 dark:text-slate-300">Logo Image URL</label>
              <input
                type="text"
                value={logo}
                onChange={(e) => setLogo(e.target.value)}
                placeholder="https://... or /uploads/..."
                className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl px-3.5 py-2.5 text-xs text-slate-900 dark:text-white focus:outline-none focus:border-pink-500"
              />
            </div>

            <div className="space-y-1">
              <label className="font-bold text-slate-700 dark:text-slate-300">Cover Banner URL</label>
              <input
                type="text"
                value={coverImage}
                onChange={(e) => setCoverImage(e.target.value)}
                placeholder="https://... or /uploads/..."
                className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl px-3.5 py-2.5 text-xs text-slate-900 dark:text-white focus:outline-none focus:border-pink-500"
              />
            </div>
          </div>

          {/* Description */}
          <div className="space-y-1">
            <label className="font-bold text-slate-700 dark:text-slate-300">
              Club Mission & Description <span className="text-rose-500">*</span>
            </label>
            <textarea
              rows={3}
              required
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Write about the club's activities, mission, and joining info..."
              className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl p-3 text-xs text-slate-900 dark:text-white focus:outline-none focus:border-pink-500"
            />
          </div>

          {/* Actions */}
          <div className="flex justify-end gap-3 pt-3 border-t border-slate-200 dark:border-slate-800">
            <button
              type="button"
              onClick={() => setIsAddModalOpen(false)}
              className="px-5 py-2 rounded-xl border border-slate-300 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-300 font-bold transition"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={saving}
              className="px-6 py-2 rounded-xl bg-gradient-to-r from-pink-500 to-purple-600 hover:from-pink-600 text-white font-bold shadow-lg shadow-pink-500/25 transition flex items-center gap-2 disabled:opacity-50"
            >
              <Save className="w-4 h-4" />
              <span>{saving ? 'Creating...' : 'Create Club'}</span>
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
