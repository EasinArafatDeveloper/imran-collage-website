'use client';

import React, { useState, useEffect } from 'react';
import { IUser, UserRole } from '@/types';
import { Search, UserCheck, ShieldAlert, UserX, Check, Shield } from 'lucide-react';

export default function UserManagementTable() {
  const [users, setUsers] = useState<any[]>([]);
  const [search, setSearch] = useState('');
  const [roleFilter, setRoleFilter] = useState('all');
  const [loading, setLoading] = useState(false);
  const [actionMessage, setActionMessage] = useState('');

  const fetchUsers = async () => {
    try {
      setLoading(true);
      let url = `/api/admin/users?role=${roleFilter}`;
      if (search) url += `&search=${encodeURIComponent(search)}`;

      const res = await fetch(url);
      const data = await res.json();
      if (data.success) {
        setUsers(data.data || []);
      }
    } catch (e) {
      // ignore
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, [roleFilter]);

  const handleUpdateUser = async (userId: string, newRole?: UserRole, newStatus?: string) => {
    try {
      const res = await fetch('/api/admin/users', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId, role: newRole, status: newStatus }),
      });
      const data = await res.json();
      if (data.success) {
        setActionMessage('ইউজার আপডেট সফল হয়েছে!');
        setTimeout(() => setActionMessage(''), 3000);
        fetchUsers();
      }
    } catch (e) {
      // ignore
    }
  };

  return (
    <div className="space-y-4">
      {actionMessage && (
        <div className="p-3 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-500 text-xs font-semibold animate-fade-in flex items-center gap-2">
          <Check className="w-4 h-4" />
          <span>{actionMessage}</span>
        </div>
      )}

      {/* Filter Row */}
      <div className="flex flex-col sm:flex-row gap-3 items-center justify-between">
        <div className="relative flex-1 w-full">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && fetchUsers()}
            placeholder="ইউজারের নাম, ইমেইল বা স্টুডেন্ট আইডি দিয়ে খুঁজুন..."
            className="w-full bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl pl-10 pr-4 py-2.5 text-xs focus:outline-none focus:border-pink-500"
          />
        </div>

        <div className="flex items-center gap-2 w-full sm:w-auto">
          <select
            value={roleFilter}
            onChange={(e) => setRoleFilter(e.target.value)}
            className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl px-3 py-2 text-xs focus:outline-none focus:border-pink-500 font-semibold"
          >
            <option value="all">সকল রোল (All Roles)</option>
            <option value="student">👨‍🎓 শিক্ষার্থী (Student)</option>
            <option value="admin">🛡️ এডমিন (Admin)</option>
          </select>
          <button
            onClick={fetchUsers}
            className="bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 text-slate-700 dark:text-slate-300 px-4 py-2 rounded-xl text-xs font-semibold transition shrink-0"
          >
            সার্চ করুন
          </button>
        </div>
      </div>

      {/* Users Table */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl overflow-x-auto shadow-xl">
        <table className="w-full text-left text-xs">
          <thead className="bg-slate-50 dark:bg-slate-950 text-slate-500 dark:text-slate-400 uppercase font-semibold border-b border-slate-200 dark:border-slate-800">
            <tr>
              <th className="p-4">ব্যবহারকারী (User)</th>
              <th className="p-4">স্টুডেন্ট তথ্য</th>
              <th className="p-4">বর্তমান রোল (Role)</th>
              <th className="p-4">স্ট্যাটাস</th>
              <th className="p-4 text-right">অ্যাকশন</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 dark:divide-slate-800 text-slate-700 dark:text-slate-300">
            {users.map((u) => (
              <tr key={u._id} className="hover:bg-slate-50 dark:hover:bg-slate-800/40 transition">
                <td className="p-4">
                  <div className="flex items-center gap-3">
                    <img
                      src={u.avatar || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=100&auto=format&fit=crop&q=80'}
                      alt={u.name}
                      className="w-9 h-9 rounded-full object-cover shrink-0"
                    />
                    <div>
                      <p className="font-bold text-slate-900 dark:text-white">{u.name}</p>
                      <p className="text-[11px] text-slate-400">{u.email}</p>
                    </div>
                  </div>
                </td>
                <td className="p-4">
                  {u.studentProfile ? (
                    <div>
                      <span className="font-mono text-pink-500 font-bold">{u.studentProfile.studentId}</span>
                      <p className="text-[10px] text-slate-400 truncate max-w-xs">{u.studentProfile.department}</p>
                    </div>
                  ) : (
                    <span className="text-slate-400 italic text-[11px]">System Administrator</span>
                  )}
                </td>
                <td className="p-4">
                  <select
                    value={u.role}
                    onChange={(e) => handleUpdateUser(u._id, e.target.value as UserRole)}
                    className="bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-lg px-2.5 py-1 text-xs font-semibold focus:border-pink-500"
                  >
                    <option value="student">Student (শিক্ষার্থী)</option>
                    <option value="admin">Admin (এডমিন)</option>
                  </select>
                </td>
                <td className="p-4">
                  <span
                    className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase ${
                      u.status === 'active'
                        ? 'bg-emerald-500/10 text-emerald-500 border border-emerald-500/20'
                        : 'bg-rose-500/10 text-rose-500 border border-rose-500/20'
                    }`}
                  >
                    {u.status}
                  </span>
                </td>
                <td className="p-4 text-right">
                  {u.status === 'active' ? (
                    <button
                      onClick={() => handleUpdateUser(u._id, undefined, 'suspended')}
                      className="px-2.5 py-1 rounded-lg border border-rose-500/30 text-rose-500 hover:bg-rose-500/10 text-[11px] font-semibold"
                    >
                      স্থগিত (Suspend)
                    </button>
                  ) : (
                    <button
                      onClick={() => handleUpdateUser(u._id, undefined, 'active')}
                      className="px-2.5 py-1 rounded-lg border border-emerald-500/30 text-emerald-500 hover:bg-emerald-500/10 text-[11px] font-semibold"
                    >
                      পুনরুজ্জীবিত (Activate)
                    </button>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
