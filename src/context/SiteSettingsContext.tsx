'use client';

import React, { createContext, useContext, useState, useEffect } from 'react';

export interface ISiteSettingsData {
  _id?: string;
  logoText: string;
  logoTagline: string;
  logoIcon: string;
  logoImageUrl?: string;
  colorTheme: string;

  // Navbar Texts
  navHomeText: string;
  navEventsText: string;
  navMomentsText: string;
  navClubsText: string;
  navEnrolledText: string;
  navAnalyticsText: string;
  loginButtonText: string;

  // Hero Section
  heroBadgeText: string;
  heroTitle: string;
  heroHighlightedWord: string;
  heroSubtitle: string;
  heroPrimaryBtnText: string;
  heroSecondaryBtnText: string;

  // Footer & Contact
  footerDescription: string;
  contactAddress: string;
  contactEmail: string;
  contactPhone: string;
  copyrightText: string;
  facebookUrl?: string;
  youtubeUrl?: string;
  linkedinUrl?: string;
}

export const defaultSiteSettings: ISiteSettingsData = {
  logoText: 'আমার অনুষ্ঠান.',
  logoTagline: 'University Event Hub',
  logoIcon: 'Sparkles',
  logoImageUrl: '',
  colorTheme: 'pink-purple',

  navHomeText: 'হোম',
  navEventsText: 'ইভেন্ট সমূহ',
  navMomentsText: 'স্মৃতি গ্যালারি',
  navClubsText: 'ক্লাব সমূহ',
  navEnrolledText: 'এনরোল্ড সদস্য',
  navAnalyticsText: 'অ্যানালিটিক্স',
  loginButtonText: 'লগইন / সাইন আপ',

  heroBadgeText: 'স্বাগতম! University Event Hub',
  heroTitle: 'আমার অনুষ্ঠানে আপনাকে স্বাগতম',
  heroHighlightedWord: 'স্বাগতম',
  heroSubtitle: 'বিশ্ববিদ্যালয়ের সকল টেক ফেস্ট, সাংস্কৃতিক সন্ধ্যা, প্রতিযোগিতা, সেমিনার ও উৎসবের জন্য আধুনিক প্ল্যাটফর্ম। এখনই রেজিস্ট্রেশন করে আপনার ডিজিটাল কিউআর পাস সংগ্রহ করুন।',
  heroPrimaryBtnText: 'ইভেন্ট এক্সপ্লোর করুন',
  heroSecondaryBtnText: 'ক্যাম্পাস স্মৃতি দেখুন',

  footerDescription: 'বিশ্ববিদ্যালয়ের সকল অনুষ্ঠান, সেমিনার, প্রতিযোগিতা ও সাংস্কৃতিক উৎসবের সমন্বিত আধুনিক প্ল্যাটফর্ম।',
  contactAddress: 'ইউনিভার্সিটি সেন্ট্রাল ক্যাম্পাস, ঢাকা',
  contactEmail: 'events@university.edu',
  contactPhone: '+880 1712-345678',
  copyrightText: '© 2026 আমার অনুষ্ঠান - University Student Event Management System. সর্বস্বত্ব সংরক্ষিত।',
  facebookUrl: 'https://facebook.com',
  youtubeUrl: 'https://youtube.com',
  linkedinUrl: 'https://linkedin.com',
};

interface SiteSettingsContextType {
  settings: ISiteSettingsData;
  loading: boolean;
  updateSettings: (newSettings: Partial<ISiteSettingsData>) => Promise<{ success: boolean; message?: string }>;
  refreshSettings: () => Promise<void>;
}

const SiteSettingsContext = createContext<SiteSettingsContextType | undefined>(undefined);

export function SiteSettingsProvider({ children }: { children: React.ReactNode }) {
  const [settings, setSettings] = useState<ISiteSettingsData>(defaultSiteSettings);
  const [loading, setLoading] = useState(true);

  const fetchSettings = async () => {
    try {
      setLoading(true);
      const res = await fetch('/api/settings');
      const data = await res.json();
      if (data.success && data.data) {
        setSettings(data.data);
      }
    } catch (e) {
      // ignore
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSettings();
  }, []);

  const updateSettings = async (newSettings: Partial<ISiteSettingsData>) => {
    try {
      const res = await fetch('/api/settings', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newSettings),
      });
      const data = await res.json();
      if (data.success && data.data) {
        setSettings(data.data);
        return { success: true, message: data.message };
      }
      return { success: false, message: data.message || 'আপডেট ব্যর্থ হয়েছে' };
    } catch (e: any) {
      return { success: false, message: e.message || 'সার্ভার ইরর হয়েছে' };
    }
  };

  return (
    <SiteSettingsContext.Provider
      value={{
        settings,
        loading,
        updateSettings,
        refreshSettings: fetchSettings,
      }}
    >
      {children}
    </SiteSettingsContext.Provider>
  );
}

export function useSiteSettings() {
  const context = useContext(SiteSettingsContext);
  if (!context) {
    throw new Error('useSiteSettings must be used within a SiteSettingsProvider');
  }
  return context;
}
