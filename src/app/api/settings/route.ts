import { NextRequest, NextResponse } from 'next/server';
import { connectToDatabase } from '@/lib/mongodb';
import { SiteSettings, AuditLog } from '@/lib/models';
import { getUserFromRequest } from '@/lib/auth';

const defaultSettings = {
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

// GET: Fetch Site Theme & Content Settings
export async function GET() {
  try {
    await connectToDatabase();
    let settings = await SiteSettings.findOne();
    if (!settings) {
      settings = await SiteSettings.create(defaultSettings);
    }
    return NextResponse.json({ success: true, data: settings });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, message: 'Failed to fetch site settings', error: error.message },
      { status: 500 }
    );
  }
}

// PUT / POST: Admin Update Site Theme & Content Settings
export async function PUT(request: NextRequest) {
  try {
    const user = getUserFromRequest(request);
    if (!user || user.role !== 'admin') {
      return NextResponse.json(
        { success: false, message: 'Unauthorized. Admin access required.' },
        { status: 403 }
      );
    }

    const body = await request.json();
    await connectToDatabase();

    let settings = await SiteSettings.findOne();
    if (!settings) {
      settings = new SiteSettings(defaultSettings);
    }

    // Update fields
    const allowedFields = [
      'logoText',
      'logoTagline',
      'logoIcon',
      'logoImageUrl',
      'colorTheme',
      'navHomeText',
      'navEventsText',
      'navMomentsText',
      'navClubsText',
      'navEnrolledText',
      'navAnalyticsText',
      'loginButtonText',
      'heroBadgeText',
      'heroTitle',
      'heroHighlightedWord',
      'heroSubtitle',
      'heroPrimaryBtnText',
      'heroSecondaryBtnText',
      'footerDescription',
      'contactAddress',
      'contactEmail',
      'contactPhone',
      'copyrightText',
      'facebookUrl',
      'youtubeUrl',
      'linkedinUrl',
    ];

    allowedFields.forEach((field) => {
      if (body[field] !== undefined) {
        (settings as any)[field] = body[field];
      }
    });

    await settings.save();

    // Log Audit Trail
    await AuditLog.create({
      userId: user.userId,
      userName: user.name,
      userRole: user.role,
      action: 'SITE_THEME_UPDATED',
      entityType: 'SiteSettings',
      entityId: settings._id.toString(),
      details: `Admin updated site theme and content: logoText="${settings.logoText}", heroTitle="${settings.heroTitle}"`,
    });

    return NextResponse.json({
      success: true,
      message: 'সাইট থিম ও কন্টেন্ট সফলভাবে আপডেট করা হয়েছে!',
      data: settings,
    });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, message: 'Failed to update site settings', error: error.message },
      { status: 500 }
    );
  }
}
