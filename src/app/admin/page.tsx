'use client';

import React, { useState, useEffect } from 'react';
import { useAuth } from '@/context/AuthContext';
import { IEvent } from '@/types';
import EventManagerCrud from '@/components/admin/EventManagerCrud';
import RegisteredUsersDirectory from '@/components/admin/RegisteredUsersDirectory';
import EventParticipantsDirectory from '@/components/admin/EventParticipantsDirectory';
import AttendanceManager from '@/components/admin/AttendanceManager';
import GalleryManager from '@/components/admin/GalleryManager';
import ClubManager from '@/components/admin/ClubManager';
import AnalyticsCharts from '@/components/admin/AnalyticsCharts';
import AuditLogViewer from '@/components/admin/AuditLogViewer';
import ThemeSettingsManager from '@/components/admin/ThemeSettingsManager';
import CreateEventFormModal from '@/components/events/CreateEventFormModal';
import EditEventModal from '@/components/admin/EditEventModal';
import QrScannerModal from '@/components/tickets/QrScannerModal';
import Modal from '@/components/common/Modal';
import SweetAlertModal, { SweetAlertState } from '@/components/common/SweetAlert';
import ThemeToggle from '@/components/common/ThemeToggle';
import { formatDate } from '@/lib/utils';
import { 
  Sparkles, 
  ShieldCheck, 
  LayoutDashboard, 
  Calendar, 
  QrCode, 
  Users, 
  Database, 
  BarChart3, 
  Plus, 
  RefreshCw, 
  LogOut, 
  Globe, 
  Lock, 
  Mail, 
  CheckCircle2, 
  AlertCircle, 
  ArrowRight,
  TrendingUp,
  Award,
  Ticket,
  ChevronRight,
  MapPin,
  Clock,
  Eye,
  EyeOff,
  Edit3,
  Trash2,
  Image as ImageIcon,
  Building2,
  Palette
} from 'lucide-react';

export default function AdminDashboardPage() {
  const { user, login, logout, loading: authLoading } = useAuth();

  const [activeMenu, setActiveMenu] = useState<
    'overview' | 'events-crud' | 'users-directory' | 'participants-directory' | 'gallery' | 'clubs' | 'attendance' | 'audit' | 'analytics' | 'theme-settings'
  >('overview');

  const [events, setEvents] = useState<IEvent[]>([]);
  const [loadingEvents, setLoadingEvents] = useState(true);
  const [seeding, setSeeding] = useState(false);

  // Modals inside Admin
  const [isCreateEventOpen, setIsCreateEventOpen] = useState(false);
  const [isEditEventOpen, setIsEditEventOpen] = useState(false);
  const [selectedEventToEdit, setSelectedEventToEdit] = useState<IEvent | null>(null);
  const [isScannerOpen, setIsScannerOpen] = useState(false);
  const [selectedEvent, setSelectedEvent] = useState<IEvent | null>(null);

  // SweetAlert State
  const [alertState, setAlertState] = useState<SweetAlertState | null>(null);

  // Standalone Admin Login Form state for direct access
  const [adminEmail, setAdminEmail] = useState('');
  const [adminPassword, setAdminPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loginLoading, setLoginLoading] = useState(false);
  const [loginError, setLoginError] = useState('');

  const fetchEvents = async () => {
    try {
      setLoadingEvents(true);
      const res = await fetch('/api/events?limit=100');
      const data = await res.json();
      if (data.success && data.data) {
        setEvents(data.data);
      }
    } catch (e) {
      // ignore
    } finally {
      setLoadingEvents(false);
    }
  };

  useEffect(() => {
    if (user && user.role === 'admin') {
      fetchEvents();
    }
  }, [user]);

  const handleAdminStatusChange = async (eventId: string, newStatus: string, reason?: string) => {
    try {
      const res = await fetch(`/api/events/${eventId}/status`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: newStatus, rejectionReason: reason }),
      });
      const data = await res.json();
      if (data.success) {
        setEvents((prev) =>
          prev.map((e) => (e._id === eventId ? { ...e, status: newStatus as any } : e))
        );
        setAlertState({
          isOpen: true,
          type: 'success',
          title: 'ইভেন্ট স্ট্যাটাস আপডেট সফল!',
          message: `ইভেন্টের স্ট্যাটাস পরিবর্তন করে "${newStatus}" করা হয়েছে।`,
          confirmText: 'ঠিক আছে',
        });
      }
    } catch (e) {
      // ignore
    }
  };

  const handleDeleteEvent = (eventId: string, title: string) => {
    setAlertState({
      isOpen: true,
      type: 'confirm',
      title: 'ইভেন্ট ডিলিট নিশ্চিত করুন!',
      message: `আপনি কি সত্যিই "${title}" ইভেন্টটি ডেটাবেস থেকে স্থায়ীভাবে মুছে ফেলতে চান?`,
      confirmText: 'হ্যাঁ, ডিলিট করুন',
      cancelText: 'বাতিল',
      onConfirm: async () => {
        try {
          const res = await fetch(`/api/events/${eventId}`, {
            method: 'DELETE',
          });
          const data = await res.json();
          if (data.success) {
            setEvents((prev) => prev.filter((e) => e._id !== eventId));
            setAlertState({
              isOpen: true,
              type: 'success',
              title: 'ইভেন্ট মুছে ফেলা হয়েছে!',
              message: `"${title}" ইভেন্টটি সফলভাবে ডেটাবেস থেকে ডিলিট করা হয়েছে।`,
              confirmText: 'ঠিক আছে',
            });
          } else {
            setAlertState({
              isOpen: true,
              type: 'error',
              title: 'ডিলিট ব্যর্থ হয়েছে',
              message: data.message || 'ইভেন্ট ডিলিট করা সম্ভব হয়নি।',
            });
          }
        } catch (err: any) {
          setAlertState({
            isOpen: true,
            type: 'error',
            title: 'সার্ভার ইরর',
            message: 'ইভেন্ট ডিলিট করতে সমস্যা হয়েছে।',
          });
        }
      },
    });
  };

  const handleSeedDatabase = async () => {
    try {
      setSeeding(true);
      const res = await fetch('/api/seed', { method: 'POST' });
      const data = await res.json();
      if (data.success) {
        await fetchEvents();
        setAlertState({
          isOpen: true,
          type: 'success',
          title: 'ডেটাবেস সিড সফল! 🎉',
          message: 'সিস্টেমে অ্যাডমিন একাউন্ট, ২টি ফ্রেশ বিশ্ববিদ্যালয় ইভেন্ট এবং ক্যাম্পাস ফটো গ্যালারি সেট করা হয়েছে।',
          confirmText: 'অসাধারণ',
        });
      }
    } catch (e) {
      // ignore
    } finally {
      setSeeding(false);
    }
  };

  const handleDirectAdminLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoginError('');
    if (!adminEmail || !adminPassword) {
      setLoginError('এডমিন আইডি/ইমেইল এবং পাসওয়ার্ড প্রদান করুন');
      return;
    }

    setLoginLoading(true);
    try {
      const res = await login(adminEmail, adminPassword);
      if (!res.success || res.user?.role !== 'admin') {
        setLoginError('শুধুমাত্র অনুমোদিত এডমিন একাউন্ট প্রবেশ করতে পারবে।');
      } else {
        setAlertState({
          isOpen: true,
          type: 'success',
          title: 'এডমিন স্বাগতম! 🛡️',
          message: `স্বাগতম ${res.user.name}! বিশ্ববিদ্যালয়ের কেন্দ্রীয় এডমিন কনসোলে সফলভাবে লগইন হয়েছে।`,
          confirmText: 'ড্যাশবোর্ডে যান',
        });
      }
    } catch (err) {
      setLoginError('লগইনে সমস্যা হয়েছে।');
    } finally {
      setLoginLoading(false);
    }
  };

  // 1. Loading State
  if (authLoading) {
    return (
      <div className="min-h-screen bg-slate-50 dark:bg-slate-950 flex items-center justify-center text-slate-900 dark:text-white">
        <div className="flex flex-col items-center gap-3">
          <div className="w-10 h-10 border-4 border-pink-500 border-t-transparent rounded-full animate-spin" />
          <p className="text-xs text-slate-500 dark:text-slate-400 font-semibold">এডমিন নিরাপত্তা যাচাই করা হচ্ছে...</p>
        </div>
      </div>
    );
  }

  // 2. Unauthenticated / Not Admin Guard
  if (!user || user.role !== 'admin') {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-100 via-white to-slate-100 dark:from-slate-950 dark:via-slate-900 dark:to-slate-950 flex items-center justify-center p-4">
        <div className="max-w-md w-full bg-white/95 dark:bg-slate-900/90 border border-slate-200 dark:border-slate-800 rounded-3xl p-8 shadow-2xl backdrop-blur-xl space-y-6">
          <div className="text-center space-y-2">
            <div className="w-14 h-14 bg-gradient-to-tr from-pink-500 to-purple-600 rounded-2xl mx-auto flex items-center justify-center text-white shadow-xl shadow-pink-500/25">
              <ShieldCheck className="w-7 h-7" />
            </div>
            <h1 className="text-xl font-bold text-slate-900 dark:text-white tracking-wide">
              বিশ্ববিদ্যালয় এডমিন কন্ট্রোল সেন্টার
            </h1>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              শুধুমাত্র অনুমোদিত বিশ্ববিদ্যালয় কর্তৃপক্ষ ও এডমিনিস্ট্রেটরদের জন্য সংরক্ষিত
            </p>
          </div>

          {loginError && (
            <div className="p-3 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-600 dark:text-rose-400 text-xs flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{loginError}</span>
            </div>
          )}

          <form onSubmit={handleDirectAdminLogin} className="space-y-4">
            <div className="space-y-1">
              <label className="text-[11px] font-bold text-slate-700 dark:text-slate-300">এডমিন ইমেইল / ইউজারনেম</label>
              <div className="relative">
                <Mail className="w-4 h-4 text-slate-400 dark:text-slate-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  required
                  value={adminEmail}
                  onChange={(e) => setAdminEmail(e.target.value)}
                  placeholder="admin@university.edu"
                  className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl pl-10 pr-4 py-2.5 text-xs text-slate-900 dark:text-white focus:outline-none focus:border-pink-500"
                />
              </div>
            </div>

            <div className="space-y-1">
              <label className="text-[11px] font-bold text-slate-700 dark:text-slate-300">গোপন পাসওয়ার্ড</label>
              <div className="relative">
                <Lock className="w-4 h-4 text-slate-400 dark:text-slate-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type={showPassword ? 'text' : 'password'}
                  required
                  value={adminPassword}
                  onChange={(e) => setAdminPassword(e.target.value)}
                  placeholder="পাসওয়ার্ড লিখুন"
                  className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl pl-10 pr-10 py-2.5 text-xs text-slate-900 dark:text-white focus:outline-none focus:border-pink-500"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 dark:text-slate-500 dark:hover:text-slate-300"
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            <button
              type="submit"
              disabled={loginLoading}
              className="w-full bg-gradient-to-r from-pink-500 to-purple-600 hover:from-pink-600 text-white font-bold py-2.5 rounded-xl text-xs shadow-lg shadow-pink-500/25 transition flex items-center justify-center gap-2 disabled:opacity-50"
            >
              {loginLoading ? 'যাচাই করা হচ্ছে...' : 'এডমিন প্যানেলে প্রবেশ করুন'}
            </button>
          </form>

          <div className="pt-4 border-t border-slate-200 dark:border-slate-800 text-center">
            <a
              href="/"
              className="text-xs text-slate-500 dark:text-slate-400 hover:text-pink-500 dark:hover:text-pink-400 font-medium inline-flex items-center gap-1 transition"
            >
              <Globe className="w-3.5 h-3.5" />
              পাবলিক ওয়েবসাইটে ফিরে যান
            </a>
          </div>
        </div>
      </div>
    );
  }

  // 3. Full Standalone Executive Admin Dashboard
  const pendingApprovalsCount = events.filter((e) => e.status === 'pending_approval').length;
  const publishedEventsCount = events.filter((e) => e.status === 'published').length;
  const totalCapacity = events.reduce((acc, curr) => acc + (curr.capacity || 0), 0);
  const totalRegistrations = events.reduce((acc, curr) => acc + (curr.registeredCount || 0), 0);

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 flex flex-col lg:flex-row antialiased transition-colors duration-200">
      {/* ================= LEFT SIDEBAR ================= */}
      <aside className="w-full lg:w-72 bg-white dark:bg-slate-900/95 border-r border-slate-200 dark:border-slate-800/80 flex flex-col justify-between shrink-0 p-5 space-y-6 shadow-sm dark:shadow-none">
        <div className="space-y-6">
          {/* Admin Header Brand */}
          <div className="flex items-center gap-3 select-none">
            <div className="w-10 h-10 bg-gradient-to-tr from-pink-500 via-rose-500 to-purple-600 rounded-2xl flex items-center justify-center text-white shadow-lg shadow-pink-500/30">
              <Sparkles className="w-5 h-5" />
            </div>
            <div>
              <span className="text-lg font-bold gradient-text block leading-tight">
                আমার অনুষ্ঠান<span className="text-pink-500">.</span>
              </span>
              <span className="text-[10px] bg-pink-500/10 text-pink-600 dark:text-pink-400 border border-pink-500/30 px-2 py-0.5 rounded font-bold uppercase tracking-wider">
                Admin Control Hub
              </span>
            </div>
          </div>

          {/* Admin Profile Mini Card */}
          <div className="p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-950/70 border border-slate-200 dark:border-slate-800 flex items-center gap-3">
            <img
              src={user.avatar || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100&auto=format&fit=crop&q=80'}
              alt={user.name}
              className="w-10 h-10 rounded-xl object-cover border border-pink-500/40 shrink-0"
            />
            <div className="overflow-hidden">
              <p className="text-xs font-bold text-slate-900 dark:text-white truncate">{user.name}</p>
              <p className="text-[10px] text-slate-500 dark:text-slate-400 truncate">{user.email}</p>
              <span className="inline-block mt-0.5 text-[9px] text-emerald-600 dark:text-emerald-400 font-semibold">
                ● সুপার এডমিন হিসেবে সক্রিয়
              </span>
            </div>
          </div>

          {/* Navigation Menu Buttons */}
          <nav className="space-y-1.5 text-xs font-semibold">
            {/* 1. Overview */}
            <button
              onClick={() => setActiveMenu('overview')}
              className={`w-full text-left px-3.5 py-3 rounded-xl transition flex items-center justify-between ${
                activeMenu === 'overview'
                  ? 'bg-pink-50 dark:bg-pink-500/20 text-pink-600 dark:text-pink-400 font-bold border border-pink-200 dark:border-pink-500/30 shadow-sm'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800/50'
              }`}
            >
              <div className="flex items-center gap-2.5">
                <LayoutDashboard className="w-4 h-4 text-pink-500" />
                <span>ড্যাশবোর্ড ও ওভারভিউ</span>
              </div>
              <ChevronRight className="w-3.5 h-3.5 opacity-50" />
            </button>

            {/* 2. Events CRUD Management */}
            <button
              onClick={() => setActiveMenu('events-crud')}
              className={`w-full text-left px-3.5 py-3 rounded-xl transition flex items-center justify-between ${
                activeMenu === 'events-crud'
                  ? 'bg-pink-50 dark:bg-pink-500/20 text-pink-600 dark:text-pink-400 font-bold border border-pink-200 dark:border-pink-500/30 shadow-sm'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800/50'
              }`}
            >
              <div className="flex items-center gap-2.5">
                <Calendar className="w-4 h-4 text-rose-500" />
                <span>ইভেন্ট ম্যানেজমেন্ট (CRUD)</span>
              </div>
              {pendingApprovalsCount > 0 && (
                <span className="bg-rose-500 text-white text-[10px] font-bold px-2 py-0.5 rounded-full">
                  {pendingApprovalsCount}
                </span>
              )}
            </button>

            {/* 3. Registered Users Directory */}
            <button
              onClick={() => setActiveMenu('users-directory')}
              className={`w-full text-left px-3.5 py-3 rounded-xl transition flex items-center justify-between ${
                activeMenu === 'users-directory'
                  ? 'bg-pink-50 dark:bg-pink-500/20 text-pink-600 dark:text-pink-400 font-bold border border-pink-200 dark:border-pink-500/30 shadow-sm'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800/50'
              }`}
            >
              <div className="flex items-center gap-2.5">
                <Users className="w-4 h-4 text-emerald-500" />
                <span>নিবন্ধিত সকল ইউজার তালিকা</span>
              </div>
              <ChevronRight className="w-3.5 h-3.5 opacity-50" />
            </button>

            {/* 4. Event Participants Directory */}
            <button
              onClick={() => setActiveMenu('participants-directory')}
              className={`w-full text-left px-3.5 py-3 rounded-xl transition flex items-center justify-between ${
                activeMenu === 'participants-directory'
                  ? 'bg-pink-50 dark:bg-pink-500/20 text-pink-600 dark:text-pink-400 font-bold border border-pink-200 dark:border-pink-500/30 shadow-sm'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800/50'
              }`}
            >
              <div className="flex items-center gap-2.5">
                <Ticket className="w-4 h-4 text-purple-500" />
                <span>ইভেন্ট পার্টিসিপ্যান্ট ও এনরোল</span>
              </div>
              <ChevronRight className="w-3.5 h-3.5 opacity-50" />
            </button>

            {/* 5. Campus Moments & Gallery */}
            <button
              onClick={() => setActiveMenu('gallery')}
              className={`w-full text-left px-3.5 py-3 rounded-xl transition flex items-center justify-between ${
                activeMenu === 'gallery'
                  ? 'bg-pink-50 dark:bg-pink-500/20 text-pink-600 dark:text-pink-400 font-bold border border-pink-200 dark:border-pink-500/30 shadow-sm'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800/50'
              }`}
            >
              <div className="flex items-center gap-2.5">
                <ImageIcon className="w-4 h-4 text-pink-500" />
                <span>স্মৃতি গ্যালারি ও ফটোস</span>
              </div>
              <ChevronRight className="w-3.5 h-3.5 opacity-50" />
            </button>

            {/* 6. Clubs Management */}
            <button
              onClick={() => setActiveMenu('clubs')}
              className={`w-full text-left px-3.5 py-3 rounded-xl transition flex items-center justify-between ${
                activeMenu === 'clubs'
                  ? 'bg-pink-50 dark:bg-pink-500/20 text-pink-600 dark:text-pink-400 font-bold border border-pink-200 dark:border-pink-500/30 shadow-sm'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800/50'
              }`}
            >
              <div className="flex items-center gap-2.5">
                <Building2 className="w-4 h-4 text-indigo-500" />
                <span>ক্লাব ও ফোরাম কন্ট্রোল</span>
              </div>
              <ChevronRight className="w-3.5 h-3.5 opacity-50" />
            </button>

            {/* 7. Attendance & QR Scanner */}
            <button
              onClick={() => setActiveMenu('attendance')}
              className={`w-full text-left px-3.5 py-3 rounded-xl transition flex items-center justify-between ${
                activeMenu === 'attendance'
                  ? 'bg-pink-50 dark:bg-pink-500/20 text-pink-600 dark:text-pink-400 font-bold border border-pink-200 dark:border-pink-500/30 shadow-sm'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800/50'
              }`}
            >
              <div className="flex items-center gap-2.5">
                <QrCode className="w-4 h-4 text-indigo-500" />
                <span>উপস্থিতি ও কিউআর স্ক্যানার</span>
              </div>
              <ChevronRight className="w-3.5 h-3.5 opacity-50" />
            </button>

            {/* 8. Audit Logs */}
            <button
              onClick={() => setActiveMenu('audit')}
              className={`w-full text-left px-3.5 py-3 rounded-xl transition flex items-center justify-between ${
                activeMenu === 'audit'
                  ? 'bg-pink-50 dark:bg-pink-500/20 text-pink-600 dark:text-pink-400 font-bold border border-pink-200 dark:border-pink-500/30 shadow-sm'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800/50'
              }`}
            >
              <div className="flex items-center gap-2.5">
                <Database className="w-4 h-4 text-amber-500" />
                <span>সিকিউরিটি অডিট লগ</span>
              </div>
              <ChevronRight className="w-3.5 h-3.5 opacity-50" />
            </button>

            {/* 9. Analytics */}
            <button
              onClick={() => setActiveMenu('analytics')}
              className={`w-full text-left px-3.5 py-3 rounded-xl transition flex items-center justify-between ${
                activeMenu === 'analytics'
                  ? 'bg-pink-50 dark:bg-pink-500/20 text-pink-600 dark:text-pink-400 font-bold border border-pink-200 dark:border-pink-500/30 shadow-sm'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800/50'
              }`}
            >
              <div className="flex items-center gap-2.5">
                <BarChart3 className="w-4 h-4 text-cyan-500" />
                <span>সার্বিক অ্যানালিটিক্স</span>
              </div>
              <ChevronRight className="w-3.5 h-3.5 opacity-50" />
            </button>

            {/* 10. Site Theme & Content Settings */}
            <button
              onClick={() => setActiveMenu('theme-settings')}
              className={`w-full text-left px-3.5 py-3 rounded-xl transition flex items-center justify-between ${
                activeMenu === 'theme-settings'
                  ? 'bg-pink-50 dark:bg-pink-500/20 text-pink-600 dark:text-pink-400 font-bold border border-pink-200 dark:border-pink-500/30 shadow-sm'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800/50'
              }`}
            >
              <div className="flex items-center gap-2.5">
                <Palette className="w-4 h-4 text-pink-500" />
                <span>সাইট থিম ও কন্টেন্ট</span>
              </div>
              <ChevronRight className="w-3.5 h-3.5 opacity-50" />
            </button>
          </nav>
        </div>

        {/* Sidebar Bottom Actions */}
        <div className="pt-4 border-t border-slate-200 dark:border-slate-800 space-y-2">
          <a
            href="/"
            className="w-full text-left px-3.5 py-2.5 rounded-xl text-xs font-semibold text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800/60 flex items-center gap-2 transition"
          >
            <Globe className="w-4 h-4 text-slate-500" />
            পাবলিক ওয়েবসাইট ভিজিট করুন
          </a>
          <button
            onClick={() => {
              logout();
              window.location.href = '/';
            }}
            className="w-full text-left px-3.5 py-2.5 rounded-xl text-xs font-semibold text-rose-600 dark:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950/30 flex items-center gap-2 transition"
          >
            <LogOut className="w-4 h-4" />
            লগআউট করুন
          </button>
        </div>
      </aside>

      {/* ================= MAIN CONTENT AREA ================= */}
      <main className="flex-1 flex flex-col overflow-y-auto min-h-screen">
        {/* Top Header Bar */}
        <header className="sticky top-0 z-30 bg-white/80 dark:bg-slate-900/80 backdrop-blur-md border-b border-slate-200 dark:border-slate-800 px-6 py-4 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 shadow-sm dark:shadow-none">
          <div>
            <h1 className="text-xl font-bold text-slate-900 dark:text-white flex items-center gap-2">
              {activeMenu === 'overview' && 'ড্যাশবোর্ড ও ওভারভিউ'}
              {activeMenu === 'events-crud' && 'ইভেন্ট ম্যানেজমেন্ট (Add, Edit, Delete)'}
              {activeMenu === 'users-directory' && 'নিবন্ধিত সকল শিক্ষার্থী ও ইউজার তালিকা'}
              {activeMenu === 'participants-directory' && 'ইভেন্ট পার্টিসিপ্যান্ট ও এনরোলমেন্ট'}
              {activeMenu === 'gallery' && 'ক্যাম্পাস স্মৃতি ও ফটো গ্যালারি ম্যানেজমেন্ট'}
              {activeMenu === 'clubs' && 'বিশ্ববিদ্যালয় ক্লাব ও ফোরাম কন্ট্রোল'}
              {activeMenu === 'attendance' && 'উপস্থিতি ও লাইভ কিউআর স্ক্যানার'}
              {activeMenu === 'audit' && 'সিস্টেম সিকিউরিটি অডিট ট্রেইল'}
              {activeMenu === 'analytics' && 'টোটাল পার্টিসিপেশন অ্যানালিটিক্স'}
              {activeMenu === 'theme-settings' && 'সাইট থিম, লোগো ও হোমপেজ কন্টেন্ট কন্ট্রোল'}
            </h1>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              বিশ্ববিদ্যালয়ের কেন্দ্রীয় এডমিন ম্যানেজমেন্ট কন্ট্রোল
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <button
              onClick={() => setIsCreateEventOpen(true)}
              className="bg-gradient-to-r from-pink-500 to-purple-600 hover:from-pink-600 text-white font-bold text-xs px-4 py-2.5 rounded-xl shadow-md shadow-pink-500/25 transition flex items-center gap-1.5"
            >
              <Plus className="w-4 h-4" />
              নতুন ইভেন্ট তৈরি
            </button>

            <button
              onClick={() => setIsScannerOpen(true)}
              className="bg-purple-600 hover:bg-purple-700 text-white font-bold text-xs px-4 py-2.5 rounded-xl shadow-md shadow-purple-600/25 transition flex items-center gap-1.5"
            >
              <QrCode className="w-4 h-4" />
              লাইভ কিউআর স্ক্যানার
            </button>

            <button
              onClick={handleSeedDatabase}
              disabled={seeding}
              className="bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 font-bold text-xs px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 transition flex items-center gap-1.5 disabled:opacity-50"
              title="রিসেট ও ডেমো ডাটা সিড"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${seeding ? 'animate-spin' : ''}`} />
              {seeding ? 'রিসেট হচ্ছে...' : 'রিসেট & ক্লিন সিড'}
            </button>

            <ThemeToggle />
          </div>
        </header>

        {/* Dynamic Body Content */}
        <div className="p-6 sm:p-8 space-y-8 flex-1">
          {/* ================= TAB 1: OVERVIEW ================= */}
          {activeMenu === 'overview' && (
            <div className="space-y-8 animate-fade-in">
              {/* Highlight Stats Row */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                <div className="p-5 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm dark:shadow-xl space-y-2">
                  <div className="flex items-center justify-between text-pink-500">
                    <Calendar className="w-6 h-6" />
                    <span className="text-[10px] bg-pink-500/10 text-pink-600 dark:text-pink-400 border border-pink-500/20 px-2 py-0.5 rounded-full font-bold">
                      পাবলিশ্ড: {publishedEventsCount}
                    </span>
                  </div>
                  <p className="text-2xl font-extrabold text-slate-900 dark:text-white">{events.length}</p>
                  <p className="text-xs text-slate-500 dark:text-slate-400">সর্বমোট ইভেন্ট সংখ্যা</p>
                </div>

                <div className="p-5 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm dark:shadow-xl space-y-2">
                  <div className="flex items-center justify-between text-purple-500">
                    <Ticket className="w-6 h-6" />
                    <span className="text-[10px] bg-purple-500/10 text-purple-600 dark:text-purple-400 border border-purple-500/20 px-2 py-0.5 rounded-full font-bold">
                      সীট ক্যাপাসিটি: {totalCapacity}
                    </span>
                  </div>
                  <p className="text-2xl font-extrabold text-slate-900 dark:text-white">{totalRegistrations}</p>
                  <p className="text-xs text-slate-500 dark:text-slate-400">মোট এনরোলমেন্ট / রেজিস্ট্রেশন</p>
                </div>

                <div className="p-5 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm dark:shadow-xl space-y-2">
                  <div className="flex items-center justify-between text-emerald-500">
                    <ShieldCheck className="w-6 h-6" />
                    <span className="text-[10px] bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20 px-2 py-0.5 rounded-full font-bold">
                      Pending: {pendingApprovalsCount}
                    </span>
                  </div>
                  <p className="text-2xl font-extrabold text-slate-900 dark:text-white">
                    {pendingApprovalsCount === 0 ? 'অনুমোদিত' : `${pendingApprovalsCount} অপেক্ষমান`}
                  </p>
                  <p className="text-xs text-slate-500 dark:text-slate-400">ইভেন্ট অ্যাপ্রুভাল স্ট্যাটাস</p>
                </div>

                <div className="p-5 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm dark:shadow-xl space-y-2">
                  <div className="flex items-center justify-between text-cyan-500">
                    <Users className="w-6 h-6" />
                    <span className="text-[10px] bg-cyan-500/10 text-cyan-600 dark:text-cyan-400 border border-cyan-500/20 px-2 py-0.5 rounded-full font-bold">
                      Active
                    </span>
                  </div>
                  <p className="text-2xl font-extrabold text-slate-900 dark:text-white">১০০% সিকিউর</p>
                  <p className="text-xs text-slate-500 dark:text-slate-400">সিস্টেম সিকিউরিটি ও আরব্যাক</p>
                </div>
              </div>

              {/* Quick Actions Grid */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div 
                  onClick={() => setActiveMenu('events-crud')}
                  className="p-6 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 hover:border-pink-500/40 cursor-pointer transition space-y-3 group shadow-sm dark:shadow-md"
                >
                  <div className="w-12 h-12 rounded-2xl bg-pink-500/10 text-pink-500 flex items-center justify-center group-hover:scale-110 transition">
                    <Calendar className="w-6 h-6" />
                  </div>
                  <h4 className="font-bold text-sm text-slate-900 dark:text-white">ইভেন্ট কন্ট্রোল ও এডিটিং</h4>
                  <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
                    নতুন ইভেন্ট যুক্ত করুন, নাম বা স্থান পরিবর্তন করুন এবং ডিলিট করুন।
                  </p>
                  <span className="text-xs text-pink-600 dark:text-pink-400 font-bold inline-flex items-center gap-1 group-hover:translate-x-1 transition">
                    ম্যানেজ করুন →
                  </span>
                </div>

                <div 
                  onClick={() => setActiveMenu('gallery')}
                  className="p-6 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 hover:border-pink-500/40 cursor-pointer transition space-y-3 group shadow-sm dark:shadow-md"
                >
                  <div className="w-12 h-12 rounded-2xl bg-pink-500/10 text-pink-500 flex items-center justify-center group-hover:scale-110 transition">
                    <ImageIcon className="w-6 h-6" />
                  </div>
                  <h4 className="font-bold text-sm text-slate-900 dark:text-white">স্মৃতি গ্যালারি ও ফটো আপলোড</h4>
                  <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
                    অনুষ্ঠানের আকর্ষণীয় ছবি আপলোড করুন যা হোম পেজে লাইভ শো হবে।
                  </p>
                  <span className="text-xs text-pink-600 dark:text-pink-400 font-bold inline-flex items-center gap-1 group-hover:translate-x-1 transition">
                    গ্যালারি দেখুন →
                  </span>
                </div>

                <div 
                  onClick={() => setActiveMenu('clubs')}
                  className="p-6 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 hover:border-indigo-500/40 cursor-pointer transition space-y-3 group shadow-sm dark:shadow-md"
                >
                  <div className="w-12 h-12 rounded-2xl bg-indigo-500/10 text-indigo-500 flex items-center justify-center group-hover:scale-110 transition">
                    <Building2 className="w-6 h-6" />
                  </div>
                  <h4 className="font-bold text-sm text-slate-900 dark:text-white">ক্লাব ও ফোরাম কন্ট্রোল</h4>
                  <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
                    বিশ্ববিদ্যালয়ের সক্রিয় ক্লাব যুক্ত ও পরিচালনা করুন।
                  </p>
                  <span className="text-xs text-indigo-600 dark:text-indigo-400 font-bold inline-flex items-center gap-1 group-hover:translate-x-1 transition">
                    ক্লাব তৈরি করুন →
                  </span>
                </div>
              </div>
            </div>
          )}

          {/* ================= TAB 2: EVENTS CRUD ================= */}
          {activeMenu === 'events-crud' && (
            <div className="space-y-4 animate-fade-in">
              <EventManagerCrud
                events={events}
                onOpenCreateModal={() => setIsCreateEventOpen(true)}
                onOpenEditModal={(evt) => {
                  setSelectedEventToEdit(evt);
                  setIsEditEventOpen(true);
                }}
                onViewEvent={(evt) => setSelectedEvent(evt)}
                onStatusChange={handleAdminStatusChange}
                onDeleteEvent={handleDeleteEvent}
                onRefresh={fetchEvents}
                loading={loadingEvents}
              />
            </div>
          )}

          {/* ================= TAB 3: REGISTERED USERS DIRECTORY ================= */}
          {activeMenu === 'users-directory' && (
            <div className="space-y-4 animate-fade-in">
              <RegisteredUsersDirectory onTriggerAlert={(al) => setAlertState(al)} />
            </div>
          )}

          {/* ================= TAB 4: EVENT PARTICIPANTS DIRECTORY ================= */}
          {activeMenu === 'participants-directory' && (
            <div className="space-y-4 animate-fade-in">
              <EventParticipantsDirectory
                events={events}
                onTriggerAlert={(al) => setAlertState(al)}
              />
            </div>
          )}

          {/* ================= TAB 5: GALLERY MANAGEMENT ================= */}
          {activeMenu === 'gallery' && (
            <div className="space-y-4 animate-fade-in">
              <GalleryManager onTriggerAlert={(al) => setAlertState(al)} />
            </div>
          )}

          {/* ================= TAB 6: CLUBS MANAGEMENT ================= */}
          {activeMenu === 'clubs' && (
            <div className="space-y-4 animate-fade-in">
              <ClubManager onTriggerAlert={(al) => setAlertState(al)} />
            </div>
          )}

          {/* ================= TAB 7: ATTENDANCE & SCANNER ================= */}
          {activeMenu === 'attendance' && (
            <div className="space-y-4 animate-fade-in">
              <AttendanceManager
                events={events}
                onOpenScanner={() => setIsScannerOpen(true)}
              />
            </div>
          )}

          {/* ================= TAB 8: AUDIT LOGS ================= */}
          {activeMenu === 'audit' && (
            <div className="space-y-4 animate-fade-in">
              <AuditLogViewer />
            </div>
          )}

          {/* ================= TAB 9: ANALYTICS ================= */}
          {activeMenu === 'analytics' && (
            <div className="space-y-4 animate-fade-in">
              <AnalyticsCharts />
            </div>
          )}

          {/* ================= TAB 10: THEME & CONTENT SETTINGS ================= */}
          {activeMenu === 'theme-settings' && (
            <div className="space-y-4 animate-fade-in">
              <ThemeSettingsManager onTriggerAlert={(al) => setAlertState(al)} />
            </div>
          )}
        </div>
      </main>

      {/* ================= ADMIN MODALS & SWEETALERT ================= */}

      {/* 1. SweetAlert2 Modal */}
      <SweetAlertModal
        alert={alertState}
        onClose={() => setAlertState(null)}
      />

      {/* 2. Create Event Modal */}
      <CreateEventFormModal
        isOpen={isCreateEventOpen}
        onClose={() => setIsCreateEventOpen(false)}
        onSuccess={(created) => {
          setEvents((prev) => [created, ...prev]);
          setAlertState({
            isOpen: true,
            type: 'success',
            title: 'নতুন ইভেন্ট তৈরি সফল! 🎉',
            message: `"${created.title}" ইভেন্টটি সফলভাবে তৈরি ও সংরক্ষণ করা হয়েছে।`,
            confirmText: 'চমৎকার',
          });
        }}
      />

      {/* 3. Edit Event Modal */}
      <EditEventModal
        isOpen={isEditEventOpen}
        onClose={() => {
          setIsEditEventOpen(false);
          setSelectedEventToEdit(null);
        }}
        event={selectedEventToEdit}
        onSuccess={(updated) => {
          setEvents((prev) => prev.map((e) => (e._id === updated._id ? updated : e)));
          setAlertState({
            isOpen: true,
            type: 'success',
            title: 'ইভেন্ট আপডেট সফল! ✏️',
            message: `"${updated.title}" ইভেন্টের তথ্য সফলভাবে আপডেট করা হয়েছে।`,
            confirmText: 'ঠিক আছে',
          });
        }}
      />

      {/* 4. QR Scanner Modal */}
      <QrScannerModal
        isOpen={isScannerOpen}
        onClose={() => setIsScannerOpen(false)}
        events={events || []}
        selectedEventId={events && events.length > 0 ? events[0]._id : undefined}
      />

      {/* 5. Event Detail Modal */}
      {selectedEvent && (
        <Modal
          isOpen={Boolean(selectedEvent)}
          onClose={() => setSelectedEvent(null)}
          title={selectedEvent.title}
          maxWidth="3xl"
        >
          <div className="space-y-5 text-xs text-slate-700 dark:text-slate-300">
            <img
              src={selectedEvent.coverImage}
              alt={selectedEvent.title}
              className="w-full h-56 object-cover rounded-2xl"
            />
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-[11px]">
              <div className="p-2.5 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800">
                <span className="text-slate-400 dark:text-slate-500 block">ক্যাটাগরি</span>
                <span className="font-bold text-pink-500 dark:text-pink-400">{selectedEvent.category}</span>
              </div>
              <div className="p-2.5 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800">
                <span className="text-slate-400 dark:text-slate-500 block">তারিখ</span>
                <span className="font-bold text-slate-900 dark:text-white">{formatDate(selectedEvent.startAt)}</span>
              </div>
              <div className="p-2.5 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800">
                <span className="text-slate-400 dark:text-slate-500 block">ভ্যেনু</span>
                <span className="font-bold text-slate-900 dark:text-white">{selectedEvent.venue}</span>
              </div>
              <div className="p-2.5 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800">
                <span className="text-slate-400 dark:text-slate-500 block">রেজিস্ট্রেশন ফি</span>
                <span className="font-bold text-emerald-600 dark:text-emerald-400">
                  {selectedEvent.registrationFee > 0 ? `৳ ${selectedEvent.registrationFee}` : 'ফ্রি'}
                </span>
              </div>
            </div>

            <div className="space-y-1.5">
              <h4 className="font-bold text-sm text-slate-900 dark:text-white">বিবরণ</h4>
              <p className="whitespace-pre-line leading-relaxed text-slate-600 dark:text-slate-400">{selectedEvent.description}</p>
            </div>

            <div className="flex justify-end gap-3 pt-3 border-t border-slate-200 dark:border-slate-800">
              <button
                onClick={() => setSelectedEvent(null)}
                className="px-5 py-2 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-white font-bold"
              >
                বন্ধ করুন
              </button>
              <button
                onClick={() => {
                  setSelectedEventToEdit(selectedEvent);
                  setIsEditEventOpen(true);
                  setSelectedEvent(null);
                }}
                className="px-5 py-2 rounded-xl bg-pink-600 hover:bg-pink-700 text-white font-bold flex items-center gap-1.5"
              >
                <Edit3 className="w-3.5 h-3.5" />
                <span>এডিট করুন</span>
              </button>
              {selectedEvent.status === 'pending_approval' && (
                <button
                  onClick={() => {
                    handleAdminStatusChange(selectedEvent._id, 'approved');
                    setSelectedEvent(null);
                  }}
                  className="px-5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold"
                >
                  অনুমোদন দিন
                </button>
              )}
            </div>
          </div>
        </Modal>
      )}
    </div>
  );
}
