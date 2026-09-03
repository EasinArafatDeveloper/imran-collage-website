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
  heroBgType?: string;
  heroVideoUrl?: string;
  heroVideoOpacity?: number;
  heroOverlayDarkness?: number;
  heroVideoBlur?: number;
  heroVideoMuted?: boolean;
  heroVideoLoop?: boolean;

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
  logoText: 'CampusEvents.',
  logoTagline: 'University Event Hub',
  logoIcon: 'Sparkles',
  logoImageUrl: '',
  colorTheme: 'pink-purple',

  navHomeText: 'Home',
  navEventsText: 'All Events',
  navMomentsText: 'Moments Gallery',
  navClubsText: 'Clubs & Socs',
  navEnrolledText: 'Enrolled Members',
  navAnalyticsText: 'Analytics',
  loginButtonText: 'Login / Sign Up',

  heroBadgeText: 'Welcome! University Event Hub',
  heroTitle: 'Discover & Join Campus Events',
  heroHighlightedWord: 'Campus Events',
  heroSubtitle: 'The ultimate modern platform for university tech fests, cultural nights, sports tournaments, workshops, and student clubs. Register today and get your digital QR pass.',
  heroPrimaryBtnText: 'Explore Events',
  heroSecondaryBtnText: 'View Campus Moments',
  heroBgType: 'video',
  heroVideoUrl: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerBlazes.mp4',
  heroVideoOpacity: 75,
  heroOverlayDarkness: 45,
  heroVideoBlur: 0,
  heroVideoMuted: true,
  heroVideoLoop: true,

  footerDescription: 'The unified modern platform for university seminars, competitions, workshops, and cultural fests.',
  contactAddress: 'University Central Campus, Dhaka',
  contactEmail: 'events@university.edu',
  contactPhone: '+880 1712-345678',
  copyrightText: '© 2026 CampusEvents - University Student Event Management System. All rights reserved.',
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

  // 1. Instantly load from localStorage on client mount (0ms latency)
  useEffect(() => {
    try {
      const cached = localStorage.getItem('imran_site_settings_cache');
      if (cached) {
        const parsed = JSON.parse(cached);
        setSettings((prev) => ({ ...prev, ...parsed }));
      }
    } catch (e) {
      // ignore
    }
  }, []);

  const fetchSettings = async () => {
    try {
      setLoading(true);
      const res = await fetch('/api/settings');
      const data = await res.json();
      if (data.success && data.data) {
        const merged = { ...defaultSiteSettings, ...data.data };
        setSettings(merged);
        try {
          localStorage.setItem('imran_site_settings_cache', JSON.stringify(merged));
        } catch (err) {
          // ignore
        }
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
        const merged = { ...defaultSiteSettings, ...data.data };
        setSettings(merged);
        try {
          localStorage.setItem('imran_site_settings_cache', JSON.stringify(merged));
        } catch (err) {
          // ignore
        }
        return { success: true, message: data.message };
      }
      return { success: false, message: data.message || 'Update failed' };
    } catch (e: any) {
      return { success: false, message: e.message || 'Server error occurred' };
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
