'use client';

import React, { useState } from 'react';
import { useAuth } from '@/context/AuthContext';
import { useSiteSettings } from '@/context/SiteSettingsContext';
import ThemeToggle from './ThemeToggle';
import NotificationDropdown from './NotificationDropdown';
import { 
  Sparkles, 
  Calendar, 
  Users, 
  ShieldCheck, 
  Award, 
  Menu, 
  X, 
  LogIn, 
  LogOut, 
  ChevronDown, 
  LayoutDashboard,
  QrCode,
  GraduationCap,
  Ticket,
  Zap,
  Star,
  Flame
} from 'lucide-react';

interface NavbarProps {
  activeTab: string;
  setActiveTab: (tab: string) => void;
  onOpenLoginModal?: () => void;
}

export default function Navbar({ activeTab, setActiveTab, onOpenLoginModal }: NavbarProps) {
  const { user, logout } = useAuth();
  const { settings } = useSiteSettings();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [userMenuOpen, setUserMenuOpen] = useState(false);

  const handleNavClick = (tab: string) => {
    setActiveTab(tab);
    setMobileMenuOpen(false);
    setUserMenuOpen(false);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <header className="sticky top-0 z-40 glass-nav">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between gap-2">
        {/* Brand Logo */}
        <div
          onClick={() => handleNavClick('home')}
          className="flex items-center gap-2.5 cursor-pointer select-none shrink-0"
        >
          {settings.logoImageUrl ? (
            <img 
              src={settings.logoImageUrl} 
              alt={settings.logoText} 
              className="w-10 h-10 object-contain rounded-2xl shadow-md"
            />
          ) : (
            <div className="w-10 h-10 bg-gradient-to-tr from-pink-500 via-rose-500 to-purple-600 rounded-2xl flex items-center justify-center text-white shadow-lg shadow-pink-500/30 transform hover:scale-105 transition-transform duration-200">
              <Sparkles className="w-5 h-5" />
            </div>
          )}
          <div>
            <span className="text-xl font-bold tracking-wide gradient-text block leading-none">
              {settings.logoText}
            </span>
            <span className="text-[10px] text-slate-400 dark:text-slate-500 font-medium tracking-wider uppercase font-mono">
              {settings.logoTagline}
            </span>
          </div>
        </div>

        {/* Desktop Nav Links */}
        <nav className="hidden lg:flex items-center space-x-1 text-xs font-semibold text-slate-600 dark:text-slate-300">
          <button
            onClick={() => handleNavClick('home')}
            className={`px-3 py-2 rounded-xl transition ${
              activeTab === 'home'
                ? 'text-pink-600 dark:text-pink-400 bg-pink-50 dark:bg-pink-950/40 font-bold'
                : 'hover:text-pink-500 hover:bg-slate-100 dark:hover:bg-slate-800/60'
            }`}
          >
            {settings.navHomeText || 'Home'}
          </button>
          <button
            onClick={() => handleNavClick('events')}
            className={`px-3 py-2 rounded-xl transition ${
              activeTab === 'events'
                ? 'text-pink-600 dark:text-pink-400 bg-pink-50 dark:bg-pink-950/40 font-bold'
                : 'hover:text-pink-500 hover:bg-slate-100 dark:hover:bg-slate-800/60'
            }`}
          >
            {settings.navEventsText || 'All Events'}
          </button>
          <button
            onClick={() => handleNavClick('moments')}
            className={`px-3 py-2 rounded-xl transition ${
              activeTab === 'moments'
                ? 'text-pink-600 dark:text-pink-400 bg-pink-50 dark:bg-pink-950/40 font-bold'
                : 'hover:text-pink-500 hover:bg-slate-100 dark:hover:bg-slate-800/60'
            }`}
          >
            {settings.navMomentsText || 'Moments Gallery'}
          </button>
          <button
            onClick={() => handleNavClick('clubs')}
            className={`px-3 py-2 rounded-xl transition ${
              activeTab === 'clubs'
                ? 'text-pink-600 dark:text-pink-400 bg-pink-50 dark:bg-pink-950/40 font-bold'
                : 'hover:text-pink-500 hover:bg-slate-100 dark:hover:bg-slate-800/60'
            }`}
          >
            {settings.navClubsText || 'Clubs & Socs'}
          </button>
          <button
            onClick={() => handleNavClick('enrolled')}
            className={`px-3 py-2 rounded-xl transition ${
              activeTab === 'enrolled'
                ? 'text-pink-600 dark:text-pink-400 bg-pink-50 dark:bg-pink-950/40 font-bold'
                : 'hover:text-pink-500 hover:bg-slate-100 dark:hover:bg-slate-800/60'
            }`}
          >
            {settings.navEnrolledText || 'Enrolled Members'}
          </button>

          {/* Student Shortcut: My Events & Pass */}
          {user?.role === 'student' && (
            <button
              onClick={() => handleNavClick('my-events')}
              className={`px-3 py-2 rounded-xl transition flex items-center gap-1.5 ${
                activeTab === 'my-events'
                  ? 'text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/40 font-bold'
                  : 'hover:text-emerald-500 hover:bg-slate-100 dark:hover:bg-slate-800/60'
              }`}
            >
              <Ticket className="w-3.5 h-3.5" />
              My Events & Pass
            </button>
          )}

          <button
            onClick={() => handleNavClick('analytics')}
            className={`px-3 py-2 rounded-xl transition ${
              activeTab === 'analytics'
                ? 'text-pink-600 dark:text-pink-400 bg-pink-50 dark:bg-pink-950/40 font-bold'
                : 'hover:text-pink-500 hover:bg-slate-100 dark:hover:bg-slate-800/60'
            }`}
          >
            {settings.navAnalyticsText || 'Analytics'}
          </button>
        </nav>

        {/* Action Controls */}
        <div className="flex items-center gap-2 sm:gap-3">
          {/* Active Role Indicator Badge */}
          {user && (
            <div
              onClick={() => {
                if (user.role === 'admin') {
                  window.location.href = '/admin';
                } else {
                  handleNavClick('my-events');
                }
              }}
              className={`hidden sm:flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold cursor-pointer transition border ${
                user.role === 'admin'
                  ? 'bg-pink-500/10 text-pink-600 dark:text-pink-400 border-pink-500/30 hover:bg-pink-500/20'
                  : 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/30 hover:bg-emerald-500/20'
              }`}
              title={user.role === 'admin' ? 'Active as Admin - Open Dashboard' : 'Active as Student'}
            >
              {user.role === 'admin' ? (
                <>
                  <ShieldCheck className="w-3.5 h-3.5 text-pink-500" />
                  <span>Admin</span>
                </>
              ) : (
                <>
                  <GraduationCap className="w-3.5 h-3.5 text-emerald-500" />
                  <span>Student</span>
                </>
              )}
            </div>
          )}

          {user && <NotificationDropdown />}
          <ThemeToggle />

          {/* User Account / Profile Menu or Login Button */}
          {user ? (
            <div className="relative">
              <button
                onClick={() => setUserMenuOpen(!userMenuOpen)}
                className="flex items-center gap-2 p-1 rounded-full hover:ring-2 hover:ring-pink-500/50 transition"
              >
                <img
                  src={user.avatar || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=100&auto=format&fit=crop&q=80'}
                  alt={user.name}
                  className="w-8 h-8 rounded-full object-cover border border-pink-500/40"
                />
                <ChevronDown className="w-3.5 h-3.5 text-slate-400" />
              </button>

              {userMenuOpen && (
                <div className="absolute right-0 mt-2 w-64 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-2xl z-50 p-2 animate-fade-in">
                  <div className="p-3 border-b border-slate-100 dark:border-slate-800">
                    <div className="flex items-center gap-2">
                      <p className="font-bold text-xs text-slate-900 dark:text-white truncate">{user.name}</p>
                      <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                        user.role === 'admin' 
                          ? 'bg-pink-500/10 text-pink-500 border border-pink-500/20' 
                          : 'bg-emerald-500/10 text-emerald-500 border border-emerald-500/20'
                      }`}>
                        {user.role === 'admin' ? 'Admin' : 'Student'}
                      </span>
                    </div>
                    <p className="text-[10px] text-slate-400 truncate mt-0.5">{user.email}</p>
                    {user.studentProfile && (
                      <span className="inline-block mt-1.5 bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 text-[10px] px-2 py-0.5 rounded font-mono">
                        ID: {user.studentProfile.studentId}
                      </span>
                    )}
                  </div>

                  <div className="space-y-1 mt-1.5">
                    {user.role === 'admin' ? (
                      <a
                        href="/admin"
                        className="w-full text-left px-3 py-2 rounded-xl text-xs text-pink-600 dark:text-pink-400 hover:bg-pink-50 dark:hover:bg-pink-950/40 flex items-center gap-2 font-bold"
                      >
                        <ShieldCheck className="w-4 h-4 text-pink-500" />
                        Admin Control Dashboard
                      </a>
                    ) : (
                      <button
                        onClick={() => handleNavClick('my-events')}
                        className="w-full text-left px-3 py-2 rounded-xl text-xs text-emerald-600 dark:text-emerald-400 hover:bg-emerald-50 dark:hover:bg-emerald-950/40 flex items-center gap-2 font-bold"
                      >
                        <Ticket className="w-4 h-4 text-emerald-500" />
                        My Events & QR Pass
                      </button>
                    )}

                    <button
                      onClick={() => {
                        onOpenLoginModal && onOpenLoginModal();
                        setUserMenuOpen(false);
                      }}
                      className="w-full text-left px-3 py-2 rounded-xl text-xs text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 flex items-center gap-2"
                    >
                      <LogIn className="w-3.5 h-3.5 text-slate-400" />
                      Switch / Login Account
                    </button>

                    <button
                      onClick={() => {
                        logout();
                        setUserMenuOpen(false);
                      }}
                      className="w-full text-left px-3 py-2 rounded-xl text-xs text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/30 flex items-center gap-2 font-medium"
                    >
                      <LogOut className="w-3.5 h-3.5" />
                      Log Out
                    </button>
                  </div>
                </div>
              )}
            </div>
          ) : (
            <button
              onClick={onOpenLoginModal}
              className="bg-gradient-to-r from-pink-500 to-purple-600 hover:from-pink-600 hover:to-purple-700 text-white px-4 py-2 rounded-xl text-xs font-bold shadow-md shadow-pink-500/20 transition flex items-center gap-1.5"
            >
              <LogIn className="w-3.5 h-3.5" />
              {settings.loginButtonText || 'Login / Sign Up'}
            </button>
          )}

          {/* Mobile Menu Button */}
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="lg:hidden p-2 rounded-xl text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800"
            aria-label="Open mobile menu"
          >
            {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        </div>
      </div>

      {/* Mobile Drawer Menu */}
      {mobileMenuOpen && (
        <div className="lg:hidden bg-white dark:bg-slate-950 border-b border-slate-200 dark:border-slate-800 px-4 pt-2 pb-6 space-y-2 animate-fade-in shadow-xl">
          <div className="grid grid-cols-2 gap-2 text-xs font-medium">
            <button
              onClick={() => handleNavClick('home')}
              className="p-2.5 rounded-xl bg-slate-50 dark:bg-slate-900 text-left hover:text-pink-500 font-medium"
            >
              🏠 Home
            </button>
            <button
              onClick={() => handleNavClick('events')}
              className="p-2.5 rounded-xl bg-slate-50 dark:bg-slate-900 text-left hover:text-pink-500 font-medium"
            >
              🎉 All Events
            </button>
            <button
              onClick={() => handleNavClick('moments')}
              className="p-2.5 rounded-xl bg-slate-50 dark:bg-slate-900 text-left hover:text-pink-500 font-medium"
            >
              📸 Moments
            </button>
            <button
              onClick={() => handleNavClick('clubs')}
              className="p-2.5 rounded-xl bg-slate-50 dark:bg-slate-900 text-left hover:text-pink-500 font-medium"
            >
              🏛️ Clubs
            </button>
            <button
              onClick={() => handleNavClick('enrolled')}
              className="p-2.5 rounded-xl bg-slate-50 dark:bg-slate-900 text-left hover:text-pink-500 font-medium"
            >
              👥 Enrolled
            </button>
            <button
              onClick={() => handleNavClick('analytics')}
              className="p-2.5 rounded-xl bg-slate-50 dark:bg-slate-900 text-left hover:text-pink-500 font-medium"
            >
              📊 Analytics
            </button>

            {user?.role === 'admin' && (
              <a
                href="/admin"
                className="p-2.5 rounded-xl bg-pink-500/10 border border-pink-500/30 text-pink-600 dark:text-pink-400 font-bold text-left col-span-2 flex items-center gap-2"
              >
                <ShieldCheck className="w-4 h-4 text-pink-500" />
                🛡️ Admin Control Dashboard
              </a>
            )}

            {user?.role === 'student' && (
              <button
                onClick={() => handleNavClick('my-events')}
                className="p-2.5 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-600 dark:text-emerald-400 font-bold text-left col-span-2 flex items-center gap-2"
              >
                <Ticket className="w-4 h-4 text-emerald-500" />
                🎟️ My Events & Digital QR Pass
              </button>
            )}

            {!user ? (
              <button
                onClick={() => {
                  onOpenLoginModal && onOpenLoginModal();
                  setMobileMenuOpen(false);
                }}
                className="p-2.5 rounded-xl bg-gradient-to-r from-pink-500 to-purple-600 text-white font-bold text-center col-span-2"
              >
                Login / Sign Up
              </button>
            ) : (
              <button
                onClick={() => {
                  logout();
                  setMobileMenuOpen(false);
                }}
                className="p-2.5 rounded-xl bg-rose-50 dark:bg-rose-950/30 text-rose-600 font-semibold text-center col-span-2"
              >
                Log Out
              </button>
            )}
          </div>
        </div>
      )}
    </header>
  );
}
