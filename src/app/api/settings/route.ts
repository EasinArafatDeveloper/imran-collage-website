import { NextRequest, NextResponse } from 'next/server';
import { connectToDatabase } from '@/lib/mongodb';
import { SiteSettings, AuditLog } from '@/lib/models';
import { getUserFromRequest } from '@/lib/auth';

const defaultSettings = {
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

// GET: Fetch Site Theme & Content Settings
export async function GET() {
  try {
    await connectToDatabase();
    let settings = await SiteSettings.findOne();
    if (!settings) {
      settings = await SiteSettings.create(defaultSettings);
    } else {
      let needsSave = false;
      if (!settings.get('heroVideoUrl')) {
        settings.set('heroVideoUrl', defaultSettings.heroVideoUrl);
        needsSave = true;
      }
      if (!settings.get('heroBgType')) {
        settings.set('heroBgType', defaultSettings.heroBgType);
        needsSave = true;
      }
      if (settings.get('heroVideoOpacity') === undefined || settings.get('heroVideoOpacity') === null) {
        settings.set('heroVideoOpacity', defaultSettings.heroVideoOpacity);
        needsSave = true;
      }
      if (settings.get('heroOverlayDarkness') === undefined || settings.get('heroOverlayDarkness') === null) {
        settings.set('heroOverlayDarkness', defaultSettings.heroOverlayDarkness);
        needsSave = true;
      }
      if (needsSave) {
        await settings.save();
      }
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
      'heroBgType',
      'heroVideoUrl',
      'heroVideoOpacity',
      'heroOverlayDarkness',
      'heroVideoBlur',
      'heroVideoMuted',
      'heroVideoLoop',
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
      message: 'Site theme and settings updated successfully!',
      data: settings,
    });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, message: 'Failed to update site settings', error: error.message },
      { status: 500 }
    );
  }
}
