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
    logoText: { type: String, default: 'আমার অনুষ্ঠান.' },
    logoTagline: { type: String, default: 'University Event Hub' },
    logoIcon: { type: String, default: 'Sparkles' },
    logoImageUrl: { type: String, default: '' },
    colorTheme: { type: String, default: 'pink-purple' },

    navHomeText: { type: String, default: 'হোম' },
    navEventsText: { type: String, default: 'ইভেন্ট সমূহ' },
    navMomentsText: { type: String, default: 'স্মৃতি গ্যালারি' },
    navClubsText: { type: String, default: 'ক্লাব সমূহ' },
    navEnrolledText: { type: String, default: 'এনরোল্ড সদস্য' },
    navAnalyticsText: { type: String, default: 'অ্যানালিটিক্স' },
    loginButtonText: { type: String, default: 'লগইন / সাইন আপ' },

    heroBadgeText: { type: String, default: 'স্বাগতম! University Event Hub' },
    heroTitle: { type: String, default: 'আমার অনুষ্ঠানে আপনাকে স্বাগতম' },
    heroHighlightedWord: { type: String, default: 'স্বাগতম' },
    heroSubtitle: { 
      type: String, 
      default: 'বিশ্ববিদ্যালয়ের সকল টেক ফেস্ট, সাংস্কৃতিক সন্ধ্যা, প্রতিযোগিতা, সেমিনার ও উৎসবের জন্য আধুনিক প্ল্যাটফর্ম। এখনই রেজিস্ট্রেশন করে আপনার ডিজিটাল কিউআর পাস সংগ্রহ করুন।' 
    },
    heroPrimaryBtnText: { type: String, default: 'ইভেন্ট এক্সপ্লোর করুন' },
    heroSecondaryBtnText: { type: String, default: 'ক্যাম্পাস স্মৃতি দেখুন' },

    footerDescription: { 
      type: String, 
      default: 'বিশ্ববিদ্যালয়ের সকল অনুষ্ঠান, সেমিনার, প্রতিযোগিতা ও সাংস্কৃতিক উৎসবের সমন্বিত আধুনিক প্ল্যাটফর্ম।' 
    },
    contactAddress: { type: String, default: 'ইউনিভার্সিটি সেন্ট্রাল ক্যাম্পাস, ঢাকা' },
    contactEmail: { type: String, default: 'events@university.edu' },
    contactPhone: { type: String, default: '+880 1712-345678' },
    copyrightText: { 
      type: String, 
      default: '© 2026 আমার অনুষ্ঠান - University Student Event Management System. সর্বস্বত্ব সংরক্ষিত।' 
    },
    facebookUrl: { type: String, default: 'https://facebook.com' },
    youtubeUrl: { type: String, default: 'https://youtube.com' },
    linkedinUrl: { type: String, default: 'https://linkedin.com' },
  },
  { timestamps: true }
);

export const SiteSettings =
  mongoose.models.SiteSettings || mongoose.model<ISiteSettings>('SiteSettings', SiteSettingsSchema);
