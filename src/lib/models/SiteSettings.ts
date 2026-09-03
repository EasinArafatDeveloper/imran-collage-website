import mongoose, { Schema, Document } from 'mongoose';

export interface ISiteSettings extends Document {
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

  // Footer & Contact Details
  footerDescription: string;
  contactAddress: string;
  contactEmail: string;
  contactPhone: string;
  copyrightText: string;
  facebookUrl?: string;
  youtubeUrl?: string;
  linkedinUrl?: string;

  updatedAt: Date;
}

const SiteSettingsSchema = new Schema<ISiteSettings>(
  {
    logoText: { type: String, default: 'CampusEvents.' },
    logoTagline: { type: String, default: 'University Event Hub' },
    logoIcon: { type: String, default: 'Sparkles' },
    logoImageUrl: { type: String, default: '' },
    colorTheme: { type: String, default: 'pink-purple' },

    navHomeText: { type: String, default: 'Home' },
    navEventsText: { type: String, default: 'All Events' },
    navMomentsText: { type: String, default: 'Moments Gallery' },
    navClubsText: { type: String, default: 'Clubs & Socs' },
    navEnrolledText: { type: String, default: 'Enrolled Members' },
    navAnalyticsText: { type: String, default: 'Analytics' },
    loginButtonText: { type: String, default: 'Login / Sign Up' },

    heroBadgeText: { type: String, default: 'Welcome! University Event Hub' },
    heroTitle: { type: String, default: 'Discover & Join Campus Events' },
    heroHighlightedWord: { type: String, default: 'Campus Events' },
    heroSubtitle: { 
      type: String, 
      default: 'The ultimate modern platform for university tech fests, cultural nights, sports tournaments, workshops, and student clubs. Register today and get your digital QR pass.' 
    },
    heroPrimaryBtnText: { type: String, default: 'Explore Events' },
    heroSecondaryBtnText: { type: String, default: 'View Campus Moments' },
    heroBgType: { type: String, default: 'video' },
    heroVideoUrl: { 
      type: String, 
      default: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerBlazes.mp4' 
    },
    heroVideoOpacity: { type: Number, default: 75 },
    heroOverlayDarkness: { type: Number, default: 45 },
    heroVideoBlur: { type: Number, default: 0 },
    heroVideoMuted: { type: Boolean, default: true },
    heroVideoLoop: { type: Boolean, default: true },

    footerDescription: { 
      type: String, 
      default: 'The unified modern platform for university seminars, competitions, workshops, and cultural fests.' 
    },
    contactAddress: { type: String, default: 'University Central Campus, Dhaka' },
    contactEmail: { type: String, default: 'events@university.edu' },
    contactPhone: { type: String, default: '+880 1712-345678' },
    copyrightText: { 
      type: String, 
      default: '© 2026 CampusEvents - University Student Event Management System. All rights reserved.' 
    },
    facebookUrl: { type: String, default: 'https://facebook.com' },
    youtubeUrl: { type: String, default: 'https://youtube.com' },
    linkedinUrl: { type: String, default: 'https://linkedin.com' },
  },
  { timestamps: true }
);

if (mongoose.models && mongoose.models.SiteSettings) {
  delete (mongoose.models as any).SiteSettings;
}

export const SiteSettings = mongoose.model<ISiteSettings>('SiteSettings', SiteSettingsSchema);
