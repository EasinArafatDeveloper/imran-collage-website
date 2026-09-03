'use client';

import React from 'react';
import { useSiteSettings } from '@/context/SiteSettingsContext';
import { Sparkles, Heart, Globe, Mail, Phone, MapPin } from 'lucide-react';

export default function Footer({ setActiveTab }: { setActiveTab?: (tab: string) => void }) {
  const { settings } = useSiteSettings();

  return (
    <footer className="border-t border-slate-200 dark:border-slate-800 bg-white/50 dark:bg-slate-950/80 backdrop-blur-md pt-12 pb-8 mt-16 transition-colors">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8 pb-12 border-b border-slate-200 dark:border-slate-800/80">
          {/* Brand Col */}
          <div className="space-y-4 md:col-span-1">
            <div className="flex items-center gap-2.5">
              {settings.logoImageUrl ? (
                <img 
                  src={settings.logoImageUrl} 
                  alt={settings.logoText} 
                  className="w-9 h-9 object-contain rounded-xl shadow-md"
                />
              ) : (
                <div className="w-9 h-9 bg-gradient-to-tr from-pink-500 to-purple-600 rounded-xl flex items-center justify-center text-white shadow-md shadow-pink-500/20">
                  <Sparkles className="w-4 h-4" />
                </div>
              )}
              <span className="text-xl font-bold gradient-text">
                {settings.logoText}
              </span>
            </div>
            <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
              {settings.footerDescription}
            </p>
            <div className="flex items-center gap-3 text-slate-400 dark:text-slate-500">
              {settings.facebookUrl && (
                <a 
                  href={settings.facebookUrl} 
                  target="_blank" 
                  rel="noreferrer" 
                  className="w-8 h-8 rounded-full bg-slate-100 dark:bg-slate-900 flex items-center justify-center hover:text-pink-500 cursor-pointer transition"
                >
                  <Globe className="w-4 h-4" />
                </a>
              )}
              {settings.contactEmail && (
                <a 
                  href={`mailto:${settings.contactEmail}`} 
                  className="w-8 h-8 rounded-full bg-slate-100 dark:bg-slate-900 flex items-center justify-center hover:text-pink-500 cursor-pointer transition"
                >
                  <Mail className="w-4 h-4" />
                </a>
              )}
            </div>
          </div>

          {/* Quick Links */}
          <div className="space-y-3">
            <h4 className="font-bold text-xs uppercase tracking-wider text-slate-900 dark:text-white">
              Quick Links
            </h4>
            <ul className="space-y-2 text-xs text-slate-600 dark:text-slate-400">
              <li>
                <button onClick={() => setActiveTab && setActiveTab('events')} className="hover:text-pink-500 transition">
                  {settings.navEventsText || 'Explore Events'}
                </button>
              </li>
              <li>
                <button onClick={() => setActiveTab && setActiveTab('moments')} className="hover:text-pink-500 transition">
                  {settings.navMomentsText || 'Moments Gallery'}
                </button>
              </li>
              <li>
                <button onClick={() => setActiveTab && setActiveTab('clubs')} className="hover:text-pink-500 transition">
                  {settings.navClubsText || 'University Clubs'}
                </button>
              </li>
              <li>
                <button onClick={() => setActiveTab && setActiveTab('enrolled')} className="hover:text-pink-500 transition">
                  {settings.navEnrolledText || 'Enrolled Members'}
                </button>
              </li>
            </ul>
          </div>

          {/* Modules */}
          <div className="space-y-3">
            <h4 className="font-bold text-xs uppercase tracking-wider text-slate-900 dark:text-white">
              Services & Portals
            </h4>
            <ul className="space-y-2 text-xs text-slate-600 dark:text-slate-400">
              <li>
                <button onClick={() => setActiveTab && setActiveTab('my-events')} className="hover:text-pink-500 transition">
                  Digital QR Ticket Pass
                </button>
              </li>
              <li>
                <button onClick={() => setActiveTab && setActiveTab('verify-cert')} className="hover:text-pink-500 transition">
                  Certificate Verification
                </button>
              </li>
              <li>
                <button onClick={() => setActiveTab && setActiveTab('analytics')} className="hover:text-pink-500 transition">
                  Participation Analytics
                </button>
              </li>
              <li>
                <button onClick={() => setActiveTab && setActiveTab('organizer-panel')} className="hover:text-pink-500 transition">
                  Live QR Attendance Scanner
                </button>
              </li>
            </ul>
          </div>

          {/* Contact info */}
          <div className="space-y-3">
            <h4 className="font-bold text-xs uppercase tracking-wider text-slate-900 dark:text-white">
              Contact & Support
            </h4>
            <div className="space-y-2 text-xs text-slate-600 dark:text-slate-400">
              <p className="flex items-center gap-2">
                <MapPin className="w-3.5 h-3.5 text-pink-500 shrink-0" />
                <span>{settings.contactAddress}</span>
              </p>
              <p className="flex items-center gap-2">
                <Mail className="w-3.5 h-3.5 text-pink-500 shrink-0" />
                <span>{settings.contactEmail}</span>
              </p>
              <p className="flex items-center gap-2">
                <Phone className="w-3.5 h-3.5 text-pink-500 shrink-0" />
                <span>{settings.contactPhone}</span>
              </p>
            </div>
          </div>
        </div>

        <div className="pt-6 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-slate-500 dark:text-slate-400">
          <p>{settings.copyrightText}</p>
          <p className="flex items-center gap-1">
            Made with <Heart className="w-3.5 h-3.5 text-pink-500 fill-pink-500" /> for University Community
          </p>
        </div>
      </div>
    </footer>
  );
}
