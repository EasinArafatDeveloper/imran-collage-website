'use client';

import React, { useState, useEffect } from 'react';
import { 
  Users, 
  Search, 
  ShieldCheck, 
  GraduationCap, 
  Trash2, 
  UserCheck, 
  UserX, 
  Mail, 
  IdCard, 
  Building2, 
  Calendar, 
  Sparkles,
  RefreshCw,
  AlertCircle
} from 'lucide-react';
import { SweetAlertState } from '@/components/common/SweetAlert';
import { formatDate } from '@/lib/utils';

interface RegisteredUsersDirectoryProps {
  onTriggerAlert?: (alert: SweetAlertState) => void;
}

export default function RegisteredUsersDirectory({ onTriggerAlert }: RegisteredUsersDirectoryProps) {
  const [users, setUsers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [roleFilter, setRoleFilter] = useState('all');
  const [statusFilter, setStatusFilter] = useState('all');
  const [actionLoadingId, setActionLoadingId] = useState<string | null>(null);

  const fetchUsers = async () => {
    try {
      setLoading(true);
      const res = await fetch(`/api/admin/users?role=${roleFilter}&status=${statusFilter}&search=${search}`);
      const data = await res.json();
      if (data.success && data.data) {
        setUsers(data.data);
      }
    } catch (e) {
      // ignore
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, [roleFilter, statusFilter]);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    fetchUsers();
  };

  const handleRoleChange = async (userId: string, newRole: string) => {
    try {
      setActionLoadingId(userId);
      const res = await fetch('/api/admin/users', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId, role: newRole }),
      });
      const data = await res.json();
      if (data.success) {
        setUsers(prev => prev.map(u => u._id === userId ? { ...u, role: newRole } : u));
        onTriggerAlert && onTriggerAlert({
          isOpen: true,
          type: 'success',
          title: 'রোল পরিবর্তন সফল!',
          message: `ব্যবহারকারীর রোল পরিবর্তন করে "${newRole === 'admin' ? 'এডমিন' : 'শিক্ষার্থী'}" করা হয়েছে।`,
          confirmText: 'ঠিক আছে',
        });
      }
    } catch (e) {
      // ignore
    } finally {
      setActionLoadingId(null);
    }
  };

  const handleStatusToggle = async (userId: string, currentStatus: string) => {
    const nextStatus = currentStatus === 'active' ? 'suspended' : 'active';
    try {
      setActionLoadingId(userId);
      const res = await fetch('/api/admin/users', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId, status: nextStatus }),
      });
      const data = await res.json();
      if (data.success) {
        setUsers(prev => prev.map(u => u._id === userId ? { ...u, status: nextStatus } : u));
        onTriggerAlert && onTriggerAlert({
          isOpen: true,
          type: 'success',
          title: 'স্ট্যাটাস আপডেট সফল!',
          message: `একাউন্ট স্ট্যাটাস "${nextStatus === 'active' ? 'সক্রিয় (Active)' : 'স্থগিত (Suspended)'}" করা হয়েছে।`,
          confirmText: 'ঠিক আছে',
        });
      }
    } catch (e) {
      // ignore
    } finally {
      setActionLoadingId(null);
    }
  };

  const handleDeleteUser = (userItem: any) => {
    if (!onTriggerAlert) {
      if (confirm(`আপনি কি সত্যিই "${userItem.name}" একাউন্টটি স্থায়ীভাবে ডিলিট করতে চান?`)) {
        executeDelete(userItem._id);
      }
      return;
    }

    onTriggerAlert({
      isOpen: true,
      type: 'confirm',
      title: 'ইউজার একাউন্ট ডিলিট নিশ্চিত করুন!',
      message: `আপনি কি নিশ্চিত যে "${userItem.name}" (${userItem.email}) একাউন্টটি এবং তার সম্পর্কিত সমস্ত প্রোফাইল ও ডাটা স্থায়ীভাবে মুছে ফেলতে চান? এটি পুনরুদ্ধার করা যাবে না।`,
      confirmText: 'হ্যাঁ, ডিলিট করুন',
      cancelText: 'বাতিল',
      onConfirm: async () => {
        await executeDelete(userItem._id);
      },
    });
  };

  const executeDelete = async (userId: string) => {
    try {
      setActionLoadingId(userId);
      const res = await fetch(`/api/admin/users?userId=${userId}`, {
        method: 'DELETE',
      });
      const data = await res.json();
      if (data.success) {
        setUsers(prev => prev.filter(u => u._id !== userId));
        onTriggerAlert && onTriggerAlert({
          isOpen: true,
          type: 'success',
          title: 'ইউজার মুছে ফেলা হয়েছে!',
          message: 'ব্যবহারকারীর একাউন্ট ও সকল ডাটা সফলভাবে ডেটাবেস থেকে মুছে ফেলা হয়েছে।',
          confirmText: 'ঠিক আছে',
        });
      } else {
        onTriggerAlert && onTriggerAlert({
          isOpen: true,
          type: 'error',
          title: 'ডিলিট ব্যর্থ হয়েছে',
          message: data.message || 'ইউজার ডিলিট করা যায়নি।',
          confirmText: 'বন্ধ করুন',
        });
      }
    } catch (e) {
      // ignore
    } finally {
      setActionLoadingId(null);
    }
  };

  const studentCount = users.filter(u => u.role === 'student').length;
  const adminCount = users.filter(u => u.role === 'admin').length;

  return (
    <div className="space-y-6">
      {/* Header Info Banner */}
      <div className="p-6 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 flex flex-col md:flex-row items-start md:items-center justify-between gap-4 shadow-sm dark:shadow-xl">
        <div>
          <h2 className="text-xl font-bold text-slate-900 dark:text-white flex items-center gap-2">
            <Users className="w-5 h-5 text-pink-500" />
            নিবন্ধিত সকল শিক্ষার্থী ও ইউজার ডিরেক্টরি
          </h2>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
            বিশ্ববিদ্যালয়ে একাউন্ট তৈরি করা সকল শিক্ষার্থী ও এডমিনদের তালিকা, তথ্য ও একাউন্ট ম্যানেজমেন্ট
          </p>
        </div>

        <div className="flex items-center gap-3">
          <div className="px-3.5 py-1.5 rounded-xl bg-pink-500/10 border border-pink-500/20 text-pink-600 dark:text-pink-400 text-xs font-bold">
            👨‍🎓 মোট শিক্ষার্থী: {studentCount}
          </div>
          <div className="px-3.5 py-1.5 rounded-xl bg-purple-500/10 border border-purple-500/20 text-purple-600 dark:text-purple-400 text-xs font-bold">
            🛡️ এডমিন: {adminCount}
          </div>
        </div>
      </div>

      {/* Filter & Search Bar */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-3 bg-white dark:bg-slate-900/60 p-4 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm dark:shadow-none">
        <form onSubmit={handleSearchSubmit} className="relative flex-1 w-full">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="নাম, রোল/স্টুডেন্ট আইডি বা ইমেইল দিয়ে সার্চ করুন..."
            className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl pl-10 pr-4 py-2 text-xs text-slate-900 dark:text-white placeholder-slate-400 dark:placeholder-slate-500 focus:outline-none focus:border-pink-500"
          />
        </form>

        <div className="flex items-center gap-2.5 w-full sm:w-auto">
          <select
            value={roleFilter}
            onChange={(e) => setRoleFilter(e.target.value)}
            className="bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl px-3 py-2 text-xs text-slate-700 dark:text-slate-300 font-semibold focus:outline-none focus:border-pink-500"
          >
            <option value="all">সকল রোল (All Roles)</option>
            <option value="student">👨‍🎓 শুধুমাত্র শিক্ষার্থী (Student)</option>
            <option value="admin">🛡️ শুধুমাত্র এডমিন (Admin)</option>
          </select>

          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl px-3 py-2 text-xs text-slate-700 dark:text-slate-300 font-semibold focus:outline-none focus:border-pink-500"
          >
            <option value="all">সকল স্ট্যাটাস</option>
            <option value="active">🟢 Active</option>
            <option value="suspended">🔴 Suspended</option>
          </select>

          <button
            onClick={fetchUsers}
            className="p-2 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-600 dark:text-slate-300 transition"
            title="রিফ্রেশ করুন"
          >
            <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
          </button>
        </div>
      </div>

      {/* Users Table */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl overflow-hidden shadow-sm dark:shadow-xl">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-slate-700 dark:text-slate-300">
            <thead className="bg-slate-50 dark:bg-slate-950 text-[11px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider border-b border-slate-200 dark:border-slate-800">
              <tr>
                <th className="py-3.5 px-4">ইউজার ও শিক্ষার্থী</th>
                <th className="py-3.5 px-4">স্টুডেন্ট আইডি / রোল</th>
                <th className="py-3.5 px-4">ডিপার্টমেন্ট</th>
                <th className="py-3.5 px-4">যোগদানের তারিখ</th>
                <th className="py-3.5 px-4">রোল (RBAC)</th>
                <th className="py-3.5 px-4">স্ট্যাটাস</th>
                <th className="py-3.5 px-4 text-right">অ্যাকশন</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800/60">
              {loading ? (
                <tr>
                  <td colSpan={7} className="py-12 text-center text-slate-500">
                    <div className="flex flex-col items-center gap-2">
                      <div className="w-6 h-6 border-2 border-pink-500 border-t-transparent rounded-full animate-spin" />
                      <span>ইউজার তালিকা লোড হচ্ছে...</span>
                    </div>
                  </td>
                </tr>
              ) : users.length === 0 ? (
                <tr>
                  <td colSpan={7} className="py-12 text-center text-slate-500">
                    কোন ব্যবহারকারী পাওয়া যায়নি।
                  </td>
                </tr>
              ) : (
                users.map((item) => (
                  <tr key={item._id} className="hover:bg-slate-50 dark:hover:bg-slate-800/40 transition">
                    {/* User Info */}
                    <td className="py-3.5 px-4">
                      <div className="flex items-center gap-3">
                        <img
                          src={item.avatar || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=100&auto=format&fit=crop&q=80'}
                          alt={item.name}
                          className="w-9 h-9 rounded-xl object-cover border border-slate-200 dark:border-slate-700 shrink-0"
                        />
                        <div className="overflow-hidden">
                          <p className="font-bold text-slate-900 dark:text-white truncate">{item.name}</p>
                          <p className="text-[10px] text-slate-500 dark:text-slate-400 truncate flex items-center gap-1">
                            <Mail className="w-3 h-3" />
                            <span>{item.email}</span>
                          </p>
                        </div>
                      </div>
                    </td>

                    {/* Student ID */}
                    <td className="py-3.5 px-4">
                      {item.studentProfile?.studentId ? (
                        <span className="font-mono text-[11px] font-bold text-pink-600 dark:text-pink-400 bg-pink-500/10 px-2 py-1 rounded-md border border-pink-500/20">
                          {item.studentProfile.studentId}
                        </span>
                      ) : (
                        <span className="text-slate-400 dark:text-slate-500 text-[11px]">N/A (Admin)</span>
                      )}
                    </td>

                    {/* Department */}
                    <td className="py-3.5 px-4">
                      <span className="text-[11px] text-slate-600 dark:text-slate-300">
                        {item.studentProfile?.department || 'University Administration'}
                      </span>
                    </td>

                    {/* Created Date */}
                    <td className="py-3.5 px-4 text-slate-500 dark:text-slate-400 text-[11px]">
                      {item.createdAt ? formatDate(item.createdAt) : 'N/A'}
                    </td>

                    {/* Role Dropdown */}
                    <td className="py-3.5 px-4">
                      <select
                        value={item.role}
                        disabled={actionLoadingId === item._id}
                        onChange={(e) => handleRoleChange(item._id, e.target.value)}
                        className={`text-[11px] font-bold px-2.5 py-1 rounded-lg border focus:outline-none ${
                          item.role === 'admin'
                            ? 'bg-pink-500/15 text-pink-600 dark:text-pink-400 border-pink-500/40'
                            : 'bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 border-emerald-500/40'
                        }`}
                      >
                        <option value="student">👨‍🎓 Student</option>
                        <option value="admin">🛡️ Admin</option>
                      </select>
                    </td>

                    {/* Status */}
                    <td className="py-3.5 px-4">
                      <button
                        onClick={() => handleStatusToggle(item._id, item.status || 'active')}
                        disabled={actionLoadingId === item._id}
                        className={`px-2.5 py-1 rounded-lg text-[10px] font-bold transition flex items-center gap-1 ${
                          item.status === 'suspended'
                            ? 'bg-rose-500/15 text-rose-600 dark:text-rose-400 border border-rose-500/30 hover:bg-rose-500/25'
                            : 'bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 border border-emerald-500/30 hover:bg-emerald-500/25'
                        }`}
                      >
                        {item.status === 'suspended' ? (
                          <>
                            <UserX className="w-3 h-3" />
                            <span>Suspended</span>
                          </>
                        ) : (
                          <>
                            <UserCheck className="w-3 h-3" />
                            <span>Active</span>
                          </>
                        )}
                      </button>
                    </td>

                    {/* Actions */}
                    <td className="py-3.5 px-4 text-right">
                      <button
                        onClick={() => handleDeleteUser(item)}
                        disabled={actionLoadingId === item._id}
                        className="p-2 rounded-xl bg-rose-500/10 hover:bg-rose-500/20 text-rose-600 dark:text-rose-400 border border-rose-500/30 transition inline-flex items-center gap-1.5"
                        title="ইউজার ডিলিট করুন"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                        <span className="text-[10px] font-bold">ডিলিট</span>
                      </button>
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
