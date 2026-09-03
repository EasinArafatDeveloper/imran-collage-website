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
  Star,
  Video,
  Film,
  Upload,
  Sliders,
  Layers
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
          title: 'Theme & Site Settings Saved! 🎨',
          message: 'Your modified logo, hero video background, banners, and footer information have been updated live.',
          confirmText: 'Great',
        });
      } else {
        onTriggerAlert && onTriggerAlert({
          isOpen: true,
          type: 'error',
          title: 'Failed to Save',
          message: res.message || 'Unable to update settings.',
        });
      }
    } catch (e: any) {
      onTriggerAlert && onTriggerAlert({
        isOpen: true,
        type: 'error',
        title: 'Server Error',
        message: e.message || 'Unable to update settings.',
      });
    } finally {
      setSaving(false);
    }
  };

  const handleResetDefaults = () => {
    onTriggerAlert && onTriggerAlert({
      isOpen: true,
      type: 'confirm',
      title: 'Reset to Defaults?',
      message: 'Are you sure you want to revert all theme customizations and text to default settings?',
      confirmText: 'Yes, Reset',
      cancelText: 'Cancel',
      onConfirm: () => {
        setFormData(defaultSiteSettings);
      },
    });
  };

  const iconOptions = [
    { name: 'Sparkles', icon: Sparkles, label: 'Magic Sparkles' },
    { name: 'GraduationCap', icon: GraduationCap, label: 'Academic Cap' },
    { name: 'Calendar', icon: Calendar, label: 'Event Calendar' },
    { name: 'Award', icon: Award, label: 'Award Medal' },
    { name: 'Zap', icon: Zap, label: 'Lightning Bolt' },
    { name: 'Star', icon: Star, label: 'Gold Star' },
  ];

  const colorThemes = [
    { id: 'pink-purple', name: 'Pink & Purple (Classic Glow)', class: 'from-pink-500 to-purple-600' },
    { id: 'emerald-teal', name: 'Emerald & Teal (Cyber Green)', class: 'from-emerald-500 to-teal-600' },
    { id: 'blue-cyan', name: 'Royal Blue & Cyan (Modern Tech)', class: 'from-blue-500 to-cyan-500' },
    { id: 'indigo-violet', name: 'Indigo & Violet (Luxury Dark)', class: 'from-indigo-500 to-violet-600' },
    { id: 'amber-orange', name: 'Amber & Sunset (Warm Flame)', class: 'from-amber-500 to-orange-600' },
  ];

  const videoPresets = [
    {
      id: 'tech-stage',
      name: 'Tech Fest & Arena Stage',
      desc: 'Conference stage with dynamic lighting',
      url: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerBlazes.mp4',
    },
    {
      id: 'campus-fest',
      name: 'Campus Event Celebration',
      desc: 'Festival crowd and celebration moments',
      url: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/WeAreGoingOnBullrun.mp4',
    },
    {
      id: 'cyber-light',
      name: 'Cyber Neon Lights',
      desc: 'Futuristic glowing neon stage loops',
      url: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerEscapes.mp4',
    },
    {
      id: 'ambient-rays',
      name: 'Cinematic Stage Rays',
      desc: 'Ambient light rays and subtle particle motion',
      url: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerFun.mp4',
    },
  ];

  const [videoUploading, setVideoUploading] = useState(false);
  const [videoUploadStatus, setVideoUploadStatus] = useState('');
  const previewVideoRef = React.useRef<HTMLVideoElement | null>(null);

  useEffect(() => {
    if (previewVideoRef.current) {
      previewVideoRef.current.muted = true;
      previewVideoRef.current.play().catch(() => {});
    }
  }, [formData.heroVideoUrl, formData.heroBgType]);

  const handleVideoFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 50 * 1024 * 1024) {
      alert('Video file size must be less than 50MB.');
      return;
    }

    setVideoUploading(true);
    setVideoUploadStatus('Uploading video...');

    try {
      const uploadFormData = new FormData();
      uploadFormData.append('file', file);

      const res = await fetch('/api/upload', {
        method: 'POST',
        body: uploadFormData,
      });

      const data = await res.json();
      if (data.success && data.url) {
        const updated = {
          ...formData,
          heroVideoUrl: data.url,
          heroBgType: 'video',
          heroVideoOpacity: formData.heroVideoOpacity ?? 75,
          heroOverlayDarkness: formData.heroOverlayDarkness ?? 40,
        };
        setFormData(updated);
        setVideoUploadStatus('✓ Video upload successful!');
      } else {
        alert(data.message || 'Video upload failed');
        setVideoUploadStatus('');
      }
    } catch (err: any) {
      alert('Error uploading video: ' + err.message);
      setVideoUploadStatus('');
    } finally {
      setVideoUploading(false);
    }
  };

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Top Banner */}
      <div className="p-6 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 flex flex-col md:flex-row items-start md:items-center justify-between gap-4 shadow-sm dark:shadow-xl">
        <div>
          <h2 className="text-xl font-bold text-slate-900 dark:text-white flex items-center gap-2">
            <Palette className="w-5 h-5 text-pink-500" />
            Theme, Logo & Homepage Content Control
          </h2>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
            Customize branding, logo, tagline, video background, buttons, and footer directly from the admin panel
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          <button
            type="button"
            onClick={handleResetDefaults}
            className="px-4 py-2.5 rounded-xl border border-slate-300 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-300 text-xs font-bold transition flex items-center gap-1.5"
          >
            <RefreshCw className="w-3.5 h-3.5" />
            <span>Reset Defaults</span>
          </button>

          <button
            type="button"
            onClick={handleSave}
            disabled={saving}
            className="bg-gradient-to-r from-pink-500 via-rose-500 to-purple-600 hover:from-pink-600 text-white font-bold text-xs px-6 py-2.5 rounded-xl shadow-lg shadow-pink-500/25 transition flex items-center gap-2 disabled:opacity-50"
          >
            <Save className="w-4 h-4" />
            <span>{saving ? 'Saving...' : 'Save Settings'}</span>
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
          <span>Logo & Branding</span>
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
          <span>Hero Section Content</span>
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
          <span>Navbar & Buttons</span>
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
          <span>Footer & Contact</span>
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
          <span>Color Schemes</span>
        </button>
      </div>

      {/* Main Settings Grid: Controls (Left) + Real-time Live Preview (Right) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* ================= CONTROLS FORM (7 COLS) ================= */}
        <div className="lg:col-span-7 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 sm:p-7 shadow-sm dark:shadow-xl space-y-6">
          <form onSubmit={handleSave} noValidate className="space-y-6">
            
            {/* 1. BRANDING & LOGO TAB */}
            {activeSubTab === 'branding' && (
              <div className="space-y-5 animate-fade-in text-xs">
                <h3 className="font-bold text-sm text-slate-900 dark:text-white flex items-center gap-2 border-b border-slate-100 dark:border-slate-800 pb-2">
                  <Sparkles className="w-4 h-4 text-pink-500" />
                  <span>Branding & Logo Configuration</span>
                </h3>

                {/* Brand Name / Title */}
                <div className="space-y-1">
                  <label className="font-bold text-slate-700 dark:text-slate-300">
                    Website Name / Brand Title
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.logoText}
                    onChange={(e) => handleChange('logoText', e.target.value)}
                    placeholder="e.g. CampusEvents."
                    className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl px-3.5 py-2.5 text-xs text-slate-900 dark:text-white font-bold focus:border-pink-500 focus:outline-none"
                  />
                  <span className="text-[10px] text-slate-400">Displayed across navbar, footer, and page headings</span>
                </div>

                {/* Tagline */}
                <div className="space-y-1">
                  <label className="font-bold text-slate-700 dark:text-slate-300">
                    Brand Sub-Tagline (Small Badge Text)
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
                    Choose Logo Icon
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
                    Custom Logo Image URL (Optional)
                  </label>
                  <input
                    type="text"
                    value={formData.logoImageUrl || ''}
                    onChange={(e) => handleChange('logoImageUrl', e.target.value)}
                    placeholder="https://your-domain.com/logo.png"
                    className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl px-3.5 py-2.5 text-xs text-slate-900 dark:text-white focus:border-pink-500 focus:outline-none font-mono"
                  />
                  <span className="text-[10px] text-slate-400">If left empty, the dynamic icon logo will be used</span>
                </div>
              </div>
            )}

            {/* 2. HERO SECTION TAB */}
            {activeSubTab === 'hero' && (
              <div className="space-y-6 animate-fade-in text-xs">
                <h3 className="font-bold text-sm text-slate-900 dark:text-white flex items-center gap-2 border-b border-slate-100 dark:border-slate-800 pb-2">
                  <Layout className="w-4 h-4 text-purple-500" />
                  <span>Hero Text & Video Background Controls</span>
                </h3>

                {/* Background Type Selector */}
                <div className="space-y-2">
                  <label className="font-bold text-slate-700 dark:text-slate-300 block">
                    Hero Section Background Mode
                  </label>
                  <div className="grid grid-cols-2 gap-3">
                    <button
                      type="button"
                      onClick={() => setFormData((prev) => ({ ...prev, heroBgType: 'video' }))}
                      className={`p-3.5 rounded-2xl border transition flex items-center gap-3 text-left ${
                        (formData.heroBgType || 'video') === 'video'
                          ? 'bg-pink-500/10 border-pink-500 text-pink-600 dark:text-pink-400 font-bold ring-2 ring-pink-500/20'
                          : 'bg-slate-50 dark:bg-slate-950 border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-400 hover:border-slate-300'
                      }`}
                    >
                      <Video className="w-5 h-5 text-pink-500 flex-shrink-0" />
                      <div>
                        <div className="text-xs font-bold">Video Loop Background</div>
                        <div className="text-[10px] opacity-75">Cinematic background video with opacity controls</div>
                      </div>
                    </button>

                    <button
                      type="button"
                      onClick={() => setFormData((prev) => ({ ...prev, heroBgType: 'gradient' }))}
                      className={`p-3.5 rounded-2xl border transition flex items-center gap-3 text-left ${
                        formData.heroBgType === 'gradient'
                          ? 'bg-pink-500/10 border-pink-500 text-pink-600 dark:text-pink-400 font-bold ring-2 ring-pink-500/20'
                          : 'bg-slate-50 dark:bg-slate-950 border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-400 hover:border-slate-300'
                      }`}
                    >
                      <Layers className="w-5 h-5 text-purple-500 flex-shrink-0" />
                      <div>
                        <div className="text-xs font-bold">Color Gradient</div>
                        <div className="text-[10px] opacity-75">Deep dark & purple glowing aesthetic gradient</div>
                      </div>
                    </button>
                  </div>
                </div>

                {/* Video Configuration Box */}
                {(formData.heroBgType || 'video') === 'video' && (
                  <div className="p-4.5 rounded-2xl bg-slate-50 dark:bg-slate-950 border border-purple-500/30 dark:border-purple-500/20 space-y-4">
                    <div className="flex items-center justify-between">
                      <span className="font-bold text-slate-900 dark:text-white flex items-center gap-2">
                        <Film className="w-4 h-4 text-pink-500" />
                        Video Source & Upload
                      </span>
                      <span className="text-[10px] text-pink-500 font-bold bg-pink-500/10 px-2.5 py-0.5 rounded-full">
                        Live Looping Video
                      </span>
                    </div>

                    {/* Video URL Input */}
                    <div className="space-y-1">
                      <label className="font-bold text-slate-700 dark:text-slate-300">
                        Video URL (Direct MP4 / WebM URL)
                      </label>
                      <input
                        type="text"
                        value={formData.heroVideoUrl || ''}
                        onChange={(e) => handleChange('heroVideoUrl', e.target.value)}
                        placeholder="https://example.com/background-video.mp4"
                        className="w-full bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl px-3.5 py-2.5 text-xs text-slate-900 dark:text-white focus:border-pink-500 focus:outline-none font-mono"
                      />
                      <span className="text-[10px] text-slate-400">
                        Paste any public direct MP4/WebM video stream URL
                      </span>
                    </div>

                    {/* Local Video Upload Option */}
                    <div className="space-y-1.5 pt-1">
                      <label className="font-bold text-slate-700 dark:text-slate-300 block">
                        Or Upload Video from Computer (Local Video Upload)
                      </label>
                      <div className="flex flex-wrap items-center gap-3">
                        <label
                          className={`cursor-pointer bg-gradient-to-r from-pink-500 to-purple-600 hover:from-pink-600 hover:to-purple-700 text-white font-bold px-4 py-2.5 rounded-xl text-xs flex items-center gap-2 shadow-sm transition ${
                            videoUploading ? 'opacity-60 pointer-events-none' : ''
                          }`}
                        >
                          {videoUploading ? (
                            <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                          ) : (
                            <Upload className="w-3.5 h-3.5" />
                          )}
                          <span>{videoUploading ? 'Uploading video...' : 'Select Video File'}</span>
                          <input
                            type="file"
                            accept="video/mp4,video/webm,video/ogg,video/quicktime"
                            className="hidden"
                            disabled={videoUploading}
                            onChange={handleVideoFileUpload}
                          />
                        </label>
                        {videoUploadStatus && (
                          <span
                            className={`text-xs font-semibold px-2.5 py-1 rounded-lg flex items-center gap-1.5 ${
                              videoUploadStatus.includes('✓')
                                ? 'text-emerald-400 bg-emerald-500/10 border border-emerald-500/20'
                                : 'text-pink-400 bg-pink-500/10'
                            }`}
                          >
                            <span>{videoUploadStatus}</span>
                          </span>
                        )}
                        {!videoUploadStatus && (
                          <span className="text-[10px] text-slate-400 font-mono truncate max-w-[240px]">
                            {formData.heroVideoUrl?.startsWith('/uploads/')
                              ? `✓ ${formData.heroVideoUrl}`
                              : 'MP4, WebM (Max 50MB)'}
                          </span>
                        )}
                      </div>

                      {/* Current Active Video Playback Box */}
                      {formData.heroVideoUrl && (
                        <div className="mt-3 p-3 rounded-xl bg-slate-900 border border-slate-800 space-y-2">
                          <div className="flex items-center justify-between text-[11px] font-bold text-slate-300">
                            <span className="flex items-center gap-1.5 text-pink-400">
                              <Video className="w-3.5 h-3.5" />
                              Current Active Video Preview
                            </span>
                            <span className="text-[10px] font-mono text-slate-400 truncate max-w-[180px]">
                              {formData.heroVideoUrl}
                            </span>
                          </div>
                          <div className="rounded-lg overflow-hidden border border-slate-800 bg-black aspect-video max-h-40">
                            <video
                              key={formData.heroVideoUrl}
                              src={formData.heroVideoUrl}
                              controls
                              playsInline
                              autoPlay
                              muted
                              loop
                              className="w-full h-full object-cover"
                            />
                          </div>
                        </div>
                      )}
                    </div>

                    {/* Preset HD Videos Selection */}
                    <div className="space-y-2 pt-2 border-t border-slate-200 dark:border-slate-800/80">
                      <label className="font-bold text-slate-700 dark:text-slate-300 block">
                        Quick 1-Click HD Preset Video Selection
                      </label>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                        {videoPresets.map((preset) => {
                          const isSelected = formData.heroVideoUrl === preset.url;
                          return (
                            <div
                              key={preset.id}
                              onClick={() => {
                                setFormData((prev) => ({
                                  ...prev,
                                  heroVideoUrl: preset.url,
                                  heroBgType: 'video',
                                }));
                              }}
                              className={`p-2.5 rounded-xl border cursor-pointer transition flex items-center justify-between ${
                                isSelected
                                  ? 'bg-pink-500/15 border-pink-500 text-pink-600 dark:text-pink-400 font-bold'
                                  : 'bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-400 hover:border-slate-300'
                              }`}
                            >
                              <div>
                                <div className="text-xs font-bold">{preset.name}</div>
                                <div className="text-[10px] text-slate-400">{preset.desc}</div>
                              </div>
                              {isSelected && <Check className="w-4 h-4 text-pink-500 font-bold flex-shrink-0" />}
                            </div>
                          );
                        })}
                      </div>
                    </div>

                    {/* Opacity & Darkness Range Sliders */}
                    <div className="pt-3 border-t border-slate-200 dark:border-slate-800/80 space-y-4">
                      <div className="font-bold text-slate-800 dark:text-slate-200 flex items-center gap-1.5">
                        <Sliders className="w-4 h-4 text-pink-500" />
                        <span>Video Opacity & Darkness Adjustments</span>
                      </div>

                      {/* Video Opacity Slider */}
                      <div className="space-y-1.5 bg-white dark:bg-slate-900 p-3 rounded-xl border border-slate-200 dark:border-slate-800">
                        <div className="flex items-center justify-between">
                          <label className="font-bold text-slate-700 dark:text-slate-300">
                            Video Opacity:
                          </label>
                          <span className="font-mono font-bold text-pink-500 bg-pink-500/10 px-2 py-0.5 rounded-md text-xs">
                            {formData.heroVideoOpacity ?? 45}%
                          </span>
                        </div>
                        <input
                          type="range"
                          min="10"
                          max="100"
                          step="5"
                          value={formData.heroVideoOpacity ?? 45}
                          onChange={(e) =>
                            setFormData((prev) => ({
                              ...prev,
                              heroVideoOpacity: parseInt(e.target.value, 10),
                            }))
                          }
                          className="w-full accent-pink-500 cursor-pointer h-2 bg-slate-200 dark:bg-slate-800 rounded-lg"
                        />
                        <div className="flex justify-between text-[9px] text-slate-400">
                          <span>10% (Subtle Background)</span>
                          <span>100% (Full Brightness)</span>
                        </div>
                      </div>

                      {/* Overlay Darkness Slider */}
                      <div className="space-y-1.5 bg-white dark:bg-slate-900 p-3 rounded-xl border border-slate-200 dark:border-slate-800">
                        <div className="flex items-center justify-between">
                          <label className="font-bold text-slate-700 dark:text-slate-300">
                            Overlay Darkness (Enhance Text Contrast):
                          </label>
                          <span className="font-mono font-bold text-purple-500 bg-purple-500/10 px-2 py-0.5 rounded-md text-xs">
                            {formData.heroOverlayDarkness ?? 65}%
                          </span>
                        </div>
                        <input
                          type="range"
                          min="0"
                          max="100"
                          step="5"
                          value={formData.heroOverlayDarkness ?? 65}
                          onChange={(e) =>
                            setFormData((prev) => ({
                              ...prev,
                              heroOverlayDarkness: parseInt(e.target.value, 10),
                            }))
                          }
                          className="w-full accent-purple-500 cursor-pointer h-2 bg-slate-200 dark:bg-slate-800 rounded-lg"
                        />
                        <div className="flex justify-between text-[9px] text-slate-400">
                          <span>0% (No Darkening)</span>
                          <span>100% (Deep Contrast)</span>
                        </div>
                      </div>

                      {/* Video Blur Slider */}
                      <div className="space-y-1.5 bg-white dark:bg-slate-900 p-3 rounded-xl border border-slate-200 dark:border-slate-800">
                        <div className="flex items-center justify-between">
                          <label className="font-bold text-slate-700 dark:text-slate-300">
                            Video Blur Effect (Background Soft Blur):
                          </label>
                          <span className="font-mono font-bold text-emerald-500 bg-emerald-500/10 px-2 py-0.5 rounded-md text-xs">
                            {formData.heroVideoBlur ?? 0}px
                          </span>
                        </div>
                        <input
                          type="range"
                          min="0"
                          max="10"
                          step="1"
                          value={formData.heroVideoBlur ?? 0}
                          onChange={(e) =>
                            setFormData((prev) => ({
                              ...prev,
                              heroVideoBlur: parseInt(e.target.value, 10),
                            }))
                          }
                          className="w-full accent-emerald-500 cursor-pointer h-2 bg-slate-200 dark:bg-slate-800 rounded-lg"
                        />
                        <div className="flex justify-between text-[9px] text-slate-400">
                          <span>0px (Sharp Crystal Clear)</span>
                          <span>10px (Soft Cinematic Blur)</span>
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                {/* Hero Badge Tagline */}
                <div className="space-y-1 pt-2 border-t border-slate-100 dark:border-slate-800">
                  <label className="font-bold text-slate-700 dark:text-slate-300">
                    Hero Top Badge Text
                  </label>
                  <input
                    type="text"
                    value={formData.heroBadgeText}
                    onChange={(e) => handleChange('heroBadgeText', e.target.value)}
                    placeholder="e.g. Welcome to University Event Hub"
                    className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl px-3.5 py-2.5 text-xs text-slate-900 dark:text-white focus:border-pink-500 focus:outline-none font-bold"
                  />
                </div>

                {/* Main Hero Title */}
                <div className="space-y-1">
                  <label className="font-bold text-slate-700 dark:text-slate-300">
                    Hero Main Heading Title
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.heroTitle}
                    onChange={(e) => handleChange('heroTitle', e.target.value)}
                    placeholder="e.g. Welcome to Campus Events Hub"
                    className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl px-3.5 py-2.5 text-xs text-slate-900 dark:text-white font-bold focus:border-pink-500 focus:outline-none"
                  />
                </div>

                {/* Highlighted Word */}
                <div className="space-y-1">
                  <label className="font-bold text-slate-700 dark:text-slate-300">
                    Gradient Highlighted Word
                  </label>
                  <input
                    type="text"
                    value={formData.heroHighlightedWord}
                    onChange={(e) => handleChange('heroHighlightedWord', e.target.value)}
                    placeholder="e.g. Welcome"
                    className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl px-3.5 py-2.5 text-xs text-pink-500 font-bold focus:border-pink-500 focus:outline-none"
                  />
                  <span className="text-[10px] text-slate-400">The specific word in the heading that glows with dynamic gradient</span>
                </div>

                {/* Hero Subtitle / Description */}
                <div className="space-y-1">
                  <label className="font-bold text-slate-700 dark:text-slate-300">
                    Hero Subtitle & Description
                  </label>
                  <textarea
                    rows={3}
                    value={formData.heroSubtitle}
                    onChange={(e) => handleChange('heroSubtitle', e.target.value)}
                    placeholder="Explore and participate in hackathons, workshops, cultural galas..."
                    className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl p-3 text-xs text-slate-900 dark:text-white focus:border-pink-500 focus:outline-none leading-relaxed"
                  />
                </div>

                {/* Hero Button Texts */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2 border-t border-slate-100 dark:border-slate-800">
                  <div className="space-y-1">
                    <label className="font-bold text-slate-700 dark:text-slate-300">
                      Primary Button Text
                    </label>
                    <input
                      type="text"
                      value={formData.heroPrimaryBtnText}
                      onChange={(e) => handleChange('heroPrimaryBtnText', e.target.value)}
                      placeholder="e.g. Explore Events"
                      className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl px-3 py-2.5 text-xs text-slate-900 dark:text-white focus:border-pink-500 focus:outline-none"
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="font-bold text-slate-700 dark:text-slate-300">
                      Secondary Button Text
                    </label>
                    <input
                      type="text"
                      value={formData.heroSecondaryBtnText}
                      onChange={(e) => handleChange('heroSecondaryBtnText', e.target.value)}
                      placeholder="e.g. Moments Gallery"
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
                  <span>Navbar Menu & Action Buttons Customization</span>
                </h3>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                  <div className="space-y-1">
                    <label className="font-bold text-slate-700 dark:text-slate-300">1. Home Tab Text</label>
                    <input
                      type="text"
                      value={formData.navHomeText}
                      onChange={(e) => handleChange('navHomeText', e.target.value)}
                      className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl px-3.5 py-2 text-xs text-slate-900 dark:text-white focus:border-pink-500"
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="font-bold text-slate-700 dark:text-slate-300">2. Events Tab Text</label>
                    <input
                      type="text"
                      value={formData.navEventsText}
                      onChange={(e) => handleChange('navEventsText', e.target.value)}
                      className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl px-3.5 py-2 text-xs text-slate-900 dark:text-white focus:border-pink-500"
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="font-bold text-slate-700 dark:text-slate-300">3. Moments Gallery Tab Text</label>
                    <input
                      type="text"
                      value={formData.navMomentsText}
                      onChange={(e) => handleChange('navMomentsText', e.target.value)}
                      className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl px-3.5 py-2 text-xs text-slate-900 dark:text-white focus:border-pink-500"
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="font-bold text-slate-700 dark:text-slate-300">4. Clubs Tab Text</label>
                    <input
                      type="text"
                      value={formData.navClubsText}
                      onChange={(e) => handleChange('navClubsText', e.target.value)}
                      className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl px-3.5 py-2 text-xs text-slate-900 dark:text-white focus:border-pink-500"
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="font-bold text-slate-700 dark:text-slate-300">5. Registered Students Tab Text</label>
                    <input
                      type="text"
                      value={formData.navEnrolledText}
                      onChange={(e) => handleChange('navEnrolledText', e.target.value)}
                      className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl px-3.5 py-2 text-xs text-slate-900 dark:text-white focus:border-pink-500"
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="font-bold text-slate-700 dark:text-slate-300">6. Analytics Tab Text</label>
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
                    Login / Sign In Button Text
                  </label>
                  <input
                    type="text"
                    value={formData.loginButtonText}
                    onChange={(e) => handleChange('loginButtonText', e.target.value)}
                    placeholder="e.g. Sign In"
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
                  <span>Footer & Contact Details</span>
                </h3>

                <div className="space-y-1">
                  <label className="font-bold text-slate-700 dark:text-slate-300">Footer Short Description</label>
                  <textarea
                    rows={2}
                    value={formData.footerDescription}
                    onChange={(e) => handleChange('footerDescription', e.target.value)}
                    className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl p-3 text-xs text-slate-900 dark:text-white focus:border-pink-500"
                  />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                  <div className="space-y-1">
                    <label className="font-bold text-slate-700 dark:text-slate-300">Campus Address</label>
                    <input
                      type="text"
                      value={formData.contactAddress}
                      onChange={(e) => handleChange('contactAddress', e.target.value)}
                      className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl px-3.5 py-2 text-xs text-slate-900 dark:text-white focus:border-pink-500"
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="font-bold text-slate-700 dark:text-slate-300">Official Support Email</label>
                    <input
                      type="email"
                      value={formData.contactEmail}
                      onChange={(e) => handleChange('contactEmail', e.target.value)}
                      className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl px-3.5 py-2 text-xs text-slate-900 dark:text-white focus:border-pink-500"
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="font-bold text-slate-700 dark:text-slate-300">Contact Phone Number</label>
                    <input
                      type="text"
                      value={formData.contactPhone}
                      onChange={(e) => handleChange('contactPhone', e.target.value)}
                      className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl px-3.5 py-2 text-xs text-slate-900 dark:text-white focus:border-pink-500 font-mono"
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="font-bold text-slate-700 dark:text-slate-300">Copyright Notice</label>
                    <input
                      type="text"
                      value={formData.copyrightText}
                      onChange={(e) => handleChange('copyrightText', e.target.value)}
                      className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl px-3.5 py-2 text-xs text-slate-900 dark:text-white focus:border-pink-500"
                    />
                  </div>
                </div>

                <div className="space-y-2 pt-2 border-t border-slate-100 dark:border-slate-800">
                  <label className="font-bold text-slate-700 dark:text-slate-300 block">Social Media Links</label>
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
                    <input
                      type="text"
                      value={formData.facebookUrl || ''}
                      onChange={(e) => handleChange('facebookUrl', e.target.value)}
                      placeholder="Facebook URL"
                      className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl px-3 py-2 text-xs text-slate-900 dark:text-white focus:border-pink-500 font-mono"
                    />
                    <input
                      type="text"
                      value={formData.youtubeUrl || ''}
                      onChange={(e) => handleChange('youtubeUrl', e.target.value)}
                      placeholder="YouTube URL"
                      className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl px-3 py-2 text-xs text-slate-900 dark:text-white focus:border-pink-500 font-mono"
                    />
                    <input
                      type="text"
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
                  <span>Color Schemes & Gradient Presets</span>
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
                Reset
              </button>

              <button
                type="submit"
                disabled={saving}
                className="bg-gradient-to-r from-pink-500 via-rose-500 to-purple-600 hover:from-pink-600 text-white font-bold text-xs px-7 py-2.5 rounded-xl shadow-lg shadow-pink-500/25 transition flex items-center gap-2 disabled:opacity-50"
              >
                <Save className="w-4 h-4" />
                <span>{saving ? 'Saving...' : 'Save Settings'}</span>
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
                Live Preview
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
            <div className="relative rounded-2xl bg-gradient-to-br from-slate-900 via-purple-950 to-slate-900 p-5 text-white space-y-2.5 overflow-hidden shadow-xl border border-purple-500/30 min-h-[220px] flex flex-col justify-center">
              {/* Background Video Layer */}
              {(formData.heroBgType || 'video') === 'video' && formData.heroVideoUrl && (
                <video
                  ref={previewVideoRef}
                  key={formData.heroVideoUrl}
                  autoPlay
                  loop
                  muted
                  playsInline
                  preload="auto"
                  className="absolute inset-0 w-full h-full object-cover pointer-events-none transition-all duration-300"
                  style={{
                    opacity: (formData.heroVideoOpacity ?? 75) / 100,
                    filter: formData.heroVideoBlur ? `blur(${formData.heroVideoBlur}px)` : undefined,
                  }}
                  src={formData.heroVideoUrl}
                />
              )}

              {/* Adjustable Darkness Overlay */}
              <div
                className="absolute inset-0 pointer-events-none bg-slate-950 transition-opacity duration-300"
                style={{
                  opacity: ((formData.heroOverlayDarkness ?? 65) / 100) * 0.9,
                }}
              />

              {/* Gradient Aesthetic Overlay */}
              <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-purple-950/40 to-slate-950/60 pointer-events-none" />

              {/* Glow Orbs */}
              <div className="absolute top-0 right-0 w-32 h-32 bg-pink-500/20 rounded-full blur-2xl pointer-events-none" />
              <div className="absolute bottom-0 left-0 w-32 h-32 bg-purple-500/20 rounded-full blur-2xl pointer-events-none" />

              <div className="relative z-10 space-y-2 text-center">
                <span className="inline-flex items-center gap-1 text-[9px] font-bold text-pink-400 bg-pink-500/15 px-2.5 py-0.5 rounded-full border border-pink-500/30">
                  <Sparkles className="w-2.5 h-2.5" />
                  {formData.heroBadgeText}
                </span>

                <h4 className="text-sm sm:text-base font-extrabold leading-snug">
                  {formData.heroTitle}
                </h4>

                <p className="text-[10px] text-slate-300 line-clamp-2 leading-relaxed max-w-sm mx-auto">
                  {formData.heroSubtitle}
                </p>

                <div className="flex justify-center gap-2 pt-1">
                  <span className="bg-gradient-to-r from-pink-500 to-purple-600 text-white text-[9px] font-bold px-3 py-1 rounded-lg shadow-sm">
                    {formData.heroPrimaryBtnText}
                  </span>
                  <span className="bg-slate-800/80 border border-slate-700 text-slate-300 text-[9px] font-bold px-3 py-1 rounded-lg">
                    {formData.heroSecondaryBtnText}
                  </span>
                </div>
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
