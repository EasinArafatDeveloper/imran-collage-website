'use client';

import React, { useState, useEffect } from 'react';
import { useSiteSettings, defaultSiteSettings, ISiteSettingsData } from '@/context/SiteSettingsContext';
import { SweetAlertState } from '@/components/common/SweetAlert';
import { 
  Palette, 
  Sparkles, 
  Save, 
  RefreshCw, 
  Globe, 
  Image as ImageIcon, 
  Type, 
  Layout, 
  Phone, 
  Mail, 
  MapPin, 
  Link2, 
  Check, 
  Eye, 
  Compass, 
  HelpCircle,
  Zap,
  GraduationCap,
  Calendar,
  Award,
  Flame,
  Star
} from 'lucide-react';

interface ThemeSettingsManagerProps {
  onTriggerAlert?: (alert: SweetAlertState) => void;
}

export default function ThemeSettingsManager({ onTriggerAlert }: ThemeSettingsManagerProps) {
  const { settings, updateSettings, loading, refreshSettings } = useSiteSettings();
  
  // Local form state initialized from context
  const [formData, setFormData] = useState<ISiteSettingsData>(settings);
  const [saving, setSaving] = useState(false);
  const [activeSubTab, setActiveSubTab] = useState<'branding' | 'hero' | 'navbar' | 'footer' | 'colors'>('branding');

  // Keep form data synced when settings load
  useEffect(() => {
    if (settings) {
      setFormData(settings);
    }
  }, [settings]);

  const handleChange = (field: keyof ISiteSettingsData, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    try {
      const res = await updateSettings(formData);
      if (res.success) {
        onTriggerAlert && onTriggerAlert({
          isOpen: true,
          type: 'success',
          title: 'সাইট থিম ও সেটিংস সংরক্ষিত! 🎨',
          message: 'আপনার পরিবর্তিত লোগো, শিরোনাম, হিরো সেকশন ও ফুটার তথ্য লাইভ ওয়েবসাইটে আপডেট হয়েছে।',
          confirmText: 'চমৎকার',
        });
      } else {
        onTriggerAlert && onTriggerAlert({
          isOpen: true,
          type: 'error',
          title: 'সংরক্ষণ ব্যর্থ হয়েছে',
          message: res.message || 'সেটিংস আপডেট করা সম্ভব হয়নি।',
        });
      }
    } catch (e: any) {
      onTriggerAlert && onTriggerAlert({
        isOpen: true,
        type: 'error',
        title: 'সার্ভার ত্রুটি',
        message: e.message || 'সেটিংস আপডেট করা সম্ভব হয়নি।',
      });
    } finally {
      setSaving(false);
    }
  };

  const handleResetDefaults = () => {
    onTriggerAlert && onTriggerAlert({
      isOpen: true,
      type: 'confirm',
      title: 'ডিফল্ট সেটিংসে ফিরবেন?',
      message: 'আপনি কি সমস্ত সাইট কাস্টমাইজেশন ও টেক্সট ডিফল্ট অবস্থায় ফিরিয়ে নিতে চান?',
      confirmText: 'হ্যাঁ, রিসেট করুন',
      cancelText: 'বাতিল',
      onConfirm: () => {
        setFormData(defaultSiteSettings);
      },
    });
  };

  const iconOptions = [
    { name: 'Sparkles', icon: Sparkles, label: 'ম্যাজিক স্পার্কল' },
    { name: 'GraduationCap', icon: GraduationCap, label: 'একাডেমিক ক্যাপ' },
    { name: 'Calendar', icon: Calendar, label: 'ইভেন্ট ক্যালেন্ডার' },
    { name: 'Award', icon: Award, label: 'অ্যাওয়ার্ড মেডেল' },
    { name: 'Zap', icon: Zap, label: 'পাওয়ার লাইটনিং' },
    { name: 'Star', icon: Star, label: 'গোল্ড স্টার' },
  ];

  const colorThemes = [
    { id: 'pink-purple', name: 'Pink & Purple (Classic Glow)', class: 'from-pink-500 to-purple-600' },
    { id: 'emerald-teal', name: 'Emerald & Teal (Cyber Green)', class: 'from-emerald-500 to-teal-600' },
    { id: 'blue-cyan', name: 'Royal Blue & Cyan (Modern Tech)', class: 'from-blue-500 to-cyan-500' },
    { id: 'indigo-violet', name: 'Indigo & Violet (Luxury Dark)', class: 'from-indigo-500 to-violet-600' },
    { id: 'amber-orange', name: 'Amber & Sunset (Warm Flame)', class: 'from-amber-500 to-orange-600' },
  ];

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Top Banner */}
      <div className="p-6 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 flex flex-col md:flex-row items-start md:items-center justify-between gap-4 shadow-sm dark:shadow-xl">
        <div>
          <h2 className="text-xl font-bold text-slate-900 dark:text-white flex items-center gap-2">
            <Palette className="w-5 h-5 text-pink-500" />
            সাইট থিম, লোগো ও হোমপেজ কন্টেন্ট কন্ট্রোল
          </h2>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
            হোম পেজের লোগো, ট্যাগলাইন, হিরো সেকশন টেক্সট, বাটন ও ফুটার সরাসরি এডমিন প্যানেল থেকে কাস্টমাইজ করুন
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          <button
            type="button"
            onClick={handleResetDefaults}
            className="px-4 py-2.5 rounded-xl border border-slate-300 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-300 text-xs font-bold transition flex items-center gap-1.5"
          >
            <RefreshCw className="w-3.5 h-3.5" />
            <span>ডিফল্ট রিসেট</span>
          </button>

          <button
            type="button"
            onClick={handleSave}
            disabled={saving}
            className="bg-gradient-to-r from-pink-500 via-rose-500 to-purple-600 hover:from-pink-600 text-white font-bold text-xs px-6 py-2.5 rounded-xl shadow-lg shadow-pink-500/25 transition flex items-center gap-2 disabled:opacity-50"
          >
            <Save className="w-4 h-4" />
            <span>{saving ? 'সংরক্ষণ হচ্ছে...' : 'পরিবর্তন সংরক্ষণ করুন'}</span>
          </button>
        </div>
      </div>

      {/* Settings Sub Navigation Tabs */}
      <div className="flex flex-wrap items-center gap-2 p-1.5 bg-white dark:bg-slate-900/60 rounded-2xl border border-slate-200 dark:border-slate-800">
        <button
          onClick={() => setActiveSubTab('branding')}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition flex items-center gap-2 ${
            activeSubTab === 'branding'
              ? 'bg-pink-500 text-white shadow-md shadow-pink-500/20'
              : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
          }`}
        >
          <Sparkles className="w-3.5 h-3.5" />
          <span>লোগো ও ব্র্যান্ডিং</span>
        </button>

        <button
          onClick={() => setActiveSubTab('hero')}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition flex items-center gap-2 ${
            activeSubTab === 'hero'
              ? 'bg-pink-500 text-white shadow-md shadow-pink-500/20'
              : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
          }`}
        >
          <Layout className="w-3.5 h-3.5" />
          <span>হিরো সেকশন কন্টেন্ট</span>
        </button>

        <button
          onClick={() => setActiveSubTab('navbar')}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition flex items-center gap-2 ${
            activeSubTab === 'navbar'
              ? 'bg-pink-500 text-white shadow-md shadow-pink-500/20'
              : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
          }`}
        >
          <Compass className="w-3.5 h-3.5" />
          <span>ন্যাভবার ও বাটন টেক্সট</span>
        </button>

        <button
          onClick={() => setActiveSubTab('footer')}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition flex items-center gap-2 ${
            activeSubTab === 'footer'
              ? 'bg-pink-500 text-white shadow-md shadow-pink-500/20'
              : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
          }`}
        >
          <Phone className="w-3.5 h-3.5" />
          <span>ফুটার ও যোগাযোগের তথ্য</span>
        </button>

        <button
          onClick={() => setActiveSubTab('colors')}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition flex items-center gap-2 ${
            activeSubTab === 'colors'
              ? 'bg-pink-500 text-white shadow-md shadow-pink-500/20'
              : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
          }`}
        >
          <Palette className="w-3.5 h-3.5" />
          <span>কালার স্কিম প্রিসেট</span>
        </button>
      </div>

      {/* Main Settings Grid: Controls (Left) + Real-time Live Preview (Right) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* ================= CONTROLS FORM (7 COLS) ================= */}
        <div className="lg:col-span-7 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 sm:p-7 shadow-sm dark:shadow-xl space-y-6">
          <form onSubmit={handleSave} className="space-y-6">
            
            {/* 1. BRANDING & LOGO TAB */}
            {activeSubTab === 'branding' && (
              <div className="space-y-5 animate-fade-in text-xs">
                <h3 className="font-bold text-sm text-slate-900 dark:text-white flex items-center gap-2 border-b border-slate-100 dark:border-slate-800 pb-2">
                  <Sparkles className="w-4 h-4 text-pink-500" />
                  <span>ব্র্যান্ডিং ও লোগো সেটিংস</span>
                </h3>

                {/* Brand Name / Title */}
                <div className="space-y-1">
                  <label className="font-bold text-slate-700 dark:text-slate-300">
                    ওয়েবসাইটের নাম / ব্র্যান্ড টাইটেল
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.logoText}
                    onChange={(e) => handleChange('logoText', e.target.value)}
                    placeholder="e.g. আমার অনুষ্ঠান."
                    className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl px-3.5 py-2.5 text-xs text-slate-900 dark:text-white font-bold focus:border-pink-500 focus:outline-none"
                  />
                  <span className="text-[10px] text-slate-400">ন্যাভবার এবং ফুটার ব্র্যান্ডিং এ প্রদর্শিত হবে</span>
                </div>

                {/* Tagline */}
                <div className="space-y-1">
                  <label className="font-bold text-slate-700 dark:text-slate-300">
                    ব্র্যান্ড সাব-ট্যাগলাইন (Small Badge Text)
                  </label>
                  <input
                    type="text"
                    value={formData.logoTagline}
                    onChange={(e) => handleChange('logoTagline', e.target.value)}
                    placeholder="e.g. University Event Hub"
                    className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl px-3.5 py-2.5 text-xs text-slate-900 dark:text-white focus:border-pink-500 focus:outline-none font-mono"
                  />
                </div>

                {/* Logo Icon Selector */}
                <div className="space-y-2">
                  <label className="font-bold text-slate-700 dark:text-slate-300 block">
                    লোগো আইকন নির্বাচন করুন
                  </label>
                  <div className="grid grid-cols-3 gap-2.5">
                    {iconOptions.map((opt) => {
                      const IconComp = opt.icon;
                      const isSelected = formData.logoIcon === opt.name;
                      return (
                        <div
                          key={opt.name}
                          onClick={() => handleChange('logoIcon', opt.name)}
                          className={`p-3 rounded-2xl border cursor-pointer transition flex items-center gap-2 ${
                            isSelected
                              ? 'bg-pink-50 dark:bg-pink-500/15 border-pink-500 text-pink-600 dark:text-pink-400 font-bold'
                              : 'bg-slate-50 dark:bg-slate-950 border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-400 hover:border-slate-300'
                          }`}
                        >
                          <IconComp className="w-4 h-4 text-pink-500" />
                          <span className="text-[11px] truncate">{opt.label}</span>
                        </div>
                      );
                    })}
                  </div>
                </div>

                {/* Custom Logo Image URL */}
                <div className="space-y-1 pt-2 border-t border-slate-100 dark:border-slate-800">
                  <label className="font-bold text-slate-700 dark:text-slate-300">
                    কাস্টম লোগো ইমেজ ইউআরএল (ঐচ্ছিক)
                  </label>
                  <input
                    type="url"
                    value={formData.logoImageUrl || ''}
                    onChange={(e) => handleChange('logoImageUrl', e.target.value)}
                    placeholder="https://your-domain.com/logo.png"
                    className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl px-3.5 py-2.5 text-xs text-slate-900 dark:text-white focus:border-pink-500 focus:outline-none font-mono"
                  />
                  <span className="text-[10px] text-slate-400">খালি রাখলে আইকন সমৃদ্ধ ডিফল্ট লোগো ব্যবহার হবে</span>
                </div>
              </div>
            )}

            {/* 2. HERO SECTION TAB */}
            {activeSubTab === 'hero' && (
              <div className="space-y-5 animate-fade-in text-xs">
                <h3 className="font-bold text-sm text-slate-900 dark:text-white flex items-center gap-2 border-b border-slate-100 dark:border-slate-800 pb-2">
                  <Layout className="w-4 h-4 text-purple-500" />
                  <span>হোমপেজ হিরো ব্যানার টেক্সট</span>
                </h3>

                {/* Hero Badge Tagline */}
                <div className="space-y-1">
                  <label className="font-bold text-slate-700 dark:text-slate-300">
                    হিরো টপ ব্যাজ টেক্সট
                  </label>
                  <input
                    type="text"
                    value={formData.heroBadgeText}
                    onChange={(e) => handleChange('heroBadgeText', e.target.value)}
                    placeholder="e.g. স্বাগতম! University Event Hub"
                    className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl px-3.5 py-2.5 text-xs text-slate-900 dark:text-white focus:border-pink-500 focus:outline-none font-bold"
                  />
                </div>

                {/* Main Hero Title */}
                <div className="space-y-1">
                  <label className="font-bold text-slate-700 dark:text-slate-300">
                    হিরো প্রধান শিরোনাম (Main Heading)
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.heroTitle}
                    onChange={(e) => handleChange('heroTitle', e.target.value)}
                    placeholder="e.g. আমার অনুষ্ঠানে আপনাকে স্বাগতম"
                    className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl px-3.5 py-2.5 text-xs text-slate-900 dark:text-white font-bold focus:border-pink-500 focus:outline-none"
                  />
                </div>

                {/* Highlighted Word */}
                <div className="space-y-1">
                  <label className="font-bold text-slate-700 dark:text-slate-300">
                    গ্রেডিয়েন্ট রঙিন হাইলাইট শব্দ
                  </label>
                  <input
                    type="text"
                    value={formData.heroHighlightedWord}
                    onChange={(e) => handleChange('heroHighlightedWord', e.target.value)}
                    placeholder="e.g. স্বাগতম"
                    className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl px-3.5 py-2.5 text-xs text-pink-500 font-bold focus:border-pink-500 focus:outline-none"
                  />
                  <span className="text-[10px] text-slate-400">যে শব্দটি শিরোনামে রঙিন গ্রেডিয়েন্টে চমকাবে</span>
                </div>

                {/* Hero Subtitle / Description */}
                <div className="space-y-1">
                  <label className="font-bold text-slate-700 dark:text-slate-300">
                    হিরো সাবটাইটেল / বর্ণনা
                  </label>
                  <textarea
                    rows={3}
                    value={formData.heroSubtitle}
                    onChange={(e) => handleChange('heroSubtitle', e.target.value)}
                    placeholder="বিশ্ববিদ্যালয়ের সকল টেক ফেস্ট..."
                    className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl p-3 text-xs text-slate-900 dark:text-white focus:border-pink-500 focus:outline-none leading-relaxed"
                  />
                </div>

                {/* Hero Button Texts */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2 border-t border-slate-100 dark:border-slate-800">
                  <div className="space-y-1">
                    <label className="font-bold text-slate-700 dark:text-slate-300">
                      প্রধান বাটন টেক্সট (Primary Button)
                    </label>
                    <input
                      type="text"
                      value={formData.heroPrimaryBtnText}
                      onChange={(e) => handleChange('heroPrimaryBtnText', e.target.value)}
                      placeholder="e.g. ইভেন্ট এক্সপ্লোর করুন"
                      className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl px-3 py-2.5 text-xs text-slate-900 dark:text-white focus:border-pink-500 focus:outline-none"
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="font-bold text-slate-700 dark:text-slate-300">
                      দ্বিতীয় বাটন টেক্সট (Secondary Button)
                    </label>
                    <input
                      type="text"
                      value={formData.heroSecondaryBtnText}
                      onChange={(e) => handleChange('heroSecondaryBtnText', e.target.value)}
                      placeholder="e.g. ক্যাম্পাস স্মৃতি দেখুন"
                      className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl px-3 py-2.5 text-xs text-slate-900 dark:text-white focus:border-pink-500 focus:outline-none"
                    />
                  </div>
                </div>
              </div>
            )}

            {/* 3. NAVBAR & BUTTONS TAB */}
            {activeSubTab === 'navbar' && (
              <div className="space-y-5 animate-fade-in text-xs">
                <h3 className="font-bold text-sm text-slate-900 dark:text-white flex items-center gap-2 border-b border-slate-100 dark:border-slate-800 pb-2">
                  <Compass className="w-4 h-4 text-emerald-500" />
                  <span>ন্যাভবার মেনু ও বাটন টেক্সট কাস্টমাইজেশন</span>
                </h3>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                  <div className="space-y-1">
                    <label className="font-bold text-slate-700 dark:text-slate-300">১. হোম ট্যাব টেক্সট</label>
                    <input
                      type="text"
                      value={formData.navHomeText}
                      onChange={(e) => handleChange('navHomeText', e.target.value)}
                      className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl px-3.5 py-2 text-xs text-slate-900 dark:text-white focus:border-pink-500"
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="font-bold text-slate-700 dark:text-slate-300">২. ইভেন্ট ট্যাব টেক্সট</label>
                    <input
                      type="text"
                      value={formData.navEventsText}
                      onChange={(e) => handleChange('navEventsText', e.target.value)}
                      className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl px-3.5 py-2 text-xs text-slate-900 dark:text-white focus:border-pink-500"
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="font-bold text-slate-700 dark:text-slate-300">৩. স্মৃতি গ্যালারি ট্যাব</label>
                    <input
                      type="text"
                      value={formData.navMomentsText}
                      onChange={(e) => handleChange('navMomentsText', e.target.value)}
                      className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl px-3.5 py-2 text-xs text-slate-900 dark:text-white focus:border-pink-500"
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="font-bold text-slate-700 dark:text-slate-300">৪. ক্লাব সমূহ ট্যাব</label>
                    <input
                      type="text"
                      value={formData.navClubsText}
                      onChange={(e) => handleChange('navClubsText', e.target.value)}
                      className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl px-3.5 py-2 text-xs text-slate-900 dark:text-white focus:border-pink-500"
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="font-bold text-slate-700 dark:text-slate-300">৫. এনরোল্ড সদস্য ট্যাব</label>
                    <input
                      type="text"
                      value={formData.navEnrolledText}
                      onChange={(e) => handleChange('navEnrolledText', e.target.value)}
                      className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl px-3.5 py-2 text-xs text-slate-900 dark:text-white focus:border-pink-500"
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="font-bold text-slate-700 dark:text-slate-300">৬. অ্যানালিটিক্স ট্যাব</label>
                    <input
                      type="text"
                      value={formData.navAnalyticsText}
                      onChange={(e) => handleChange('navAnalyticsText', e.target.value)}
                      className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl px-3.5 py-2 text-xs text-slate-900 dark:text-white focus:border-pink-500"
                    />
                  </div>
                </div>

                <div className="space-y-1 pt-3 border-t border-slate-100 dark:border-slate-800">
                  <label className="font-bold text-slate-700 dark:text-slate-300">
                    লগইন / সাইন আপ বাটন টেক্সট
                  </label>
                  <input
                    type="text"
                    value={formData.loginButtonText}
                    onChange={(e) => handleChange('loginButtonText', e.target.value)}
                    placeholder="e.g. লগইন / সাইন আপ"
                    className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl px-3.5 py-2.5 text-xs text-slate-900 dark:text-white font-bold focus:border-pink-500"
                  />
                </div>
              </div>
            )}

            {/* 4. FOOTER & CONTACT DETAILS TAB */}
            {activeSubTab === 'footer' && (
              <div className="space-y-5 animate-fade-in text-xs">
                <h3 className="font-bold text-sm text-slate-900 dark:text-white flex items-center gap-2 border-b border-slate-100 dark:border-slate-800 pb-2">
                  <Phone className="w-4 h-4 text-indigo-500" />
                  <span>ফুটার ও যোগাযোগের তথ্য</span>
                </h3>

                <div className="space-y-1">
                  <label className="font-bold text-slate-700 dark:text-slate-300">ফুটার সংক্ষিপ্ত বিবরণ</label>
                  <textarea
                    rows={2}
                    value={formData.footerDescription}
                    onChange={(e) => handleChange('footerDescription', e.target.value)}
                    className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl p-3 text-xs text-slate-900 dark:text-white focus:border-pink-500"
                  />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                  <div className="space-y-1">
                    <label className="font-bold text-slate-700 dark:text-slate-300">ক্যাম্পাস ঠিকানা (Address)</label>
                    <input
                      type="text"
                      value={formData.contactAddress}
                      onChange={(e) => handleChange('contactAddress', e.target.value)}
                      className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl px-3.5 py-2 text-xs text-slate-900 dark:text-white focus:border-pink-500"
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="font-bold text-slate-700 dark:text-slate-300">অফিসিয়াল ইমেইল (Support Email)</label>
                    <input
                      type="email"
                      value={formData.contactEmail}
                      onChange={(e) => handleChange('contactEmail', e.target.value)}
                      className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl px-3.5 py-2 text-xs text-slate-900 dark:text-white focus:border-pink-500"
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="font-bold text-slate-700 dark:text-slate-300">যোগাযোগ নম্বর (Phone)</label>
                    <input
                      type="text"
                      value={formData.contactPhone}
                      onChange={(e) => handleChange('contactPhone', e.target.value)}
                      className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl px-3.5 py-2 text-xs text-slate-900 dark:text-white focus:border-pink-500 font-mono"
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="font-bold text-slate-700 dark:text-slate-300">কপিরাইট নোটিশ (Copyright)</label>
                    <input
                      type="text"
                      value={formData.copyrightText}
                      onChange={(e) => handleChange('copyrightText', e.target.value)}
                      className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl px-3.5 py-2 text-xs text-slate-900 dark:text-white focus:border-pink-500"
                    />
                  </div>
                </div>

                <div className="space-y-2 pt-2 border-t border-slate-100 dark:border-slate-800">
                  <label className="font-bold text-slate-700 dark:text-slate-300 block">সোশ্যাল মিডিয়া লিংকসমূহ</label>
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
                    <input
                      type="url"
                      value={formData.facebookUrl || ''}
                      onChange={(e) => handleChange('facebookUrl', e.target.value)}
                      placeholder="Facebook URL"
                      className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl px-3 py-2 text-xs text-slate-900 dark:text-white focus:border-pink-500 font-mono"
                    />
                    <input
                      type="url"
                      value={formData.youtubeUrl || ''}
                      onChange={(e) => handleChange('youtubeUrl', e.target.value)}
                      placeholder="YouTube URL"
                      className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl px-3 py-2 text-xs text-slate-900 dark:text-white focus:border-pink-500 font-mono"
                    />
                    <input
                      type="url"
                      value={formData.linkedinUrl || ''}
                      onChange={(e) => handleChange('linkedinUrl', e.target.value)}
                      placeholder="LinkedIn URL"
                      className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl px-3 py-2 text-xs text-slate-900 dark:text-white focus:border-pink-500 font-mono"
                    />
                  </div>
                </div>
              </div>
            )}

            {/* 5. COLOR SCHEMES TAB */}
            {activeSubTab === 'colors' && (
              <div className="space-y-5 animate-fade-in text-xs">
                <h3 className="font-bold text-sm text-slate-900 dark:text-white flex items-center gap-2 border-b border-slate-100 dark:border-slate-800 pb-2">
                  <Palette className="w-4 h-4 text-cyan-500" />
                  <span>কালার স্কিম ও গ্রেডিয়েন্ট প্রিসেট</span>
                </h3>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {colorThemes.map((thm) => (
                    <div
                      key={thm.id}
                      onClick={() => handleChange('colorTheme', thm.id)}
                      className={`p-4 rounded-2xl border cursor-pointer transition flex items-center justify-between ${
                        formData.colorTheme === thm.id
                          ? 'bg-pink-50/50 dark:bg-pink-500/10 border-pink-500 shadow-md ring-2 ring-pink-500/20'
                          : 'bg-slate-50 dark:bg-slate-950 border-slate-200 dark:border-slate-800 hover:border-slate-300'
                      }`}
                    >
                      <div className="flex items-center gap-3">
                        <div className={`w-8 h-8 rounded-xl bg-gradient-to-tr ${thm.class} shadow-md`} />
                        <div>
                          <span className="font-bold text-slate-900 dark:text-white block">{thm.name}</span>
                          <span className="text-[10px] text-slate-400 font-mono">{thm.id}</span>
                        </div>
                      </div>
                      {formData.colorTheme === thm.id && <Check className="w-4 h-4 text-pink-500 font-bold" />}
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Save Buttons Row */}
            <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-100 dark:border-slate-800">
              <button
                type="button"
                onClick={handleResetDefaults}
                className="px-5 py-2.5 rounded-xl border border-slate-300 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-300 text-xs font-bold transition"
              >
                রিসেট
              </button>

              <button
                type="submit"
                disabled={saving}
                className="bg-gradient-to-r from-pink-500 via-rose-500 to-purple-600 hover:from-pink-600 text-white font-bold text-xs px-7 py-2.5 rounded-xl shadow-lg shadow-pink-500/25 transition flex items-center gap-2 disabled:opacity-50"
              >
                <Save className="w-4 h-4" />
                <span>{saving ? 'সংরক্ষণ হচ্ছে...' : 'সেটিংস সেভ করুন'}</span>
              </button>
            </div>
          </form>
        </div>

        {/* ================= LIVE INTERACTIVE PREVIEW CARD (5 COLS) ================= */}
        <div className="lg:col-span-5 space-y-4">
          <div className="sticky top-24 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-5 sm:p-6 shadow-sm dark:shadow-xl space-y-4 overflow-hidden">
            <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3">
              <span className="text-xs font-bold text-slate-900 dark:text-white flex items-center gap-1.5">
                <Eye className="w-4 h-4 text-pink-500" />
                লাইভ প্রিভিউ (Live Preview)
              </span>
              <span className="text-[10px] bg-pink-500/10 text-pink-600 dark:text-pink-400 font-bold px-2 py-0.5 rounded-full">
                Interactive
              </span>
            </div>

            {/* Mini Navbar Preview */}
            <div className="bg-slate-50 dark:bg-slate-950 p-3 rounded-2xl border border-slate-200 dark:border-slate-800 space-y-2">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="w-6 h-6 rounded-lg bg-gradient-to-tr from-pink-500 to-purple-600 flex items-center justify-center text-white text-xs">
                    <Sparkles className="w-3 h-3" />
                  </div>
                  <div>
                    <span className="font-bold text-xs text-slate-900 dark:text-white block leading-none">
                      {formData.logoText}
                    </span>
                    <span className="text-[8px] text-slate-400 font-mono leading-none">
                      {formData.logoTagline}
                    </span>
                  </div>
                </div>

                <span className="bg-gradient-to-r from-pink-500 to-purple-600 text-white text-[9px] font-bold px-2 py-1 rounded-lg">
                  {formData.loginButtonText}
                </span>
              </div>

              {/* Navlinks mini pills */}
              <div className="flex flex-wrap gap-1 pt-1 text-[9px] font-semibold text-slate-500">
                <span className="text-pink-500 font-bold">{formData.navHomeText}</span> • 
                <span>{formData.navEventsText}</span> • 
                <span>{formData.navMomentsText}</span> • 
                <span>{formData.navClubsText}</span> • 
                <span>{formData.navAnalyticsText}</span>
              </div>
            </div>

            {/* Mini Hero Banner Preview */}
            <div className="relative rounded-2xl bg-gradient-to-br from-slate-900 via-purple-950 to-slate-900 p-4 text-white space-y-2.5 overflow-hidden shadow-lg border border-purple-500/30">
              <span className="inline-block text-[9px] font-bold text-pink-400 bg-pink-500/10 px-2 py-0.5 rounded-full border border-pink-500/20">
                {formData.heroBadgeText}
              </span>

              <h4 className="text-sm sm:text-base font-extrabold leading-snug">
                {formData.heroTitle}
              </h4>

              <p className="text-[10px] text-slate-300 line-clamp-2 leading-relaxed">
                {formData.heroSubtitle}
              </p>

              <div className="flex gap-2 pt-1">
                <span className="bg-gradient-to-r from-pink-500 to-purple-600 text-white text-[9px] font-bold px-3 py-1 rounded-lg shadow-sm">
                  {formData.heroPrimaryBtnText}
                </span>
                <span className="bg-white/10 text-slate-300 text-[9px] font-bold px-3 py-1 rounded-lg">
                  {formData.heroSecondaryBtnText}
                </span>
              </div>
            </div>

            {/* Mini Footer Preview */}
            <div className="bg-slate-50 dark:bg-slate-950 p-3 rounded-2xl border border-slate-200 dark:border-slate-800 space-y-2 text-[10px] text-slate-500">
              <div className="flex items-center justify-between font-bold text-slate-900 dark:text-white">
                <span>{formData.logoText}</span>
                <span className="text-[9px] font-normal text-slate-400">© 2026</span>
              </div>
              <p className="line-clamp-1">{formData.footerDescription}</p>
              <div className="text-[9px] text-slate-400 space-y-0.5">
                <p>📍 {formData.contactAddress}</p>
                <p>📧 {formData.contactEmail} • 📞 {formData.contactPhone}</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
