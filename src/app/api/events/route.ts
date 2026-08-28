import { NextRequest, NextResponse } from 'next/server';
import { connectToDatabase } from '@/lib/mongodb';
import { Event, AuditLog } from '@/lib/models';
import { getUserFromRequest } from '@/lib/auth';
import { slugify } from '@/lib/utils';

export async function GET(request: NextRequest) {
  try {
    await connectToDatabase();

    const { searchParams } = new URL(request.url);
    const search = searchParams.get('search') || '';
    const category = searchParams.get('category') || '';
    const department = searchParams.get('department') || '';
    const eventType = searchParams.get('eventType') || '';
    const isFree = searchParams.get('isFree');
    const status = searchParams.get('status') || '';
    const sort = searchParams.get('sort') || 'upcoming';
    const limit = parseInt(searchParams.get('limit') || '50');
    const featured = searchParams.get('featured');

    const query: any = {};

    // By default, public search only shows published/approved events unless specific status is asked (e.g. for organizer or admin dashboard)
    if (status) {
      query.status = status;
    } else {
      query.status = { $in: ['published', 'approved', 'completed'] };
    }

    if (featured === 'true') {
      query.featured = true;
    }

    if (category && category !== 'all') {
      query.category = new RegExp(category, 'i');
    }

    if (department && department !== 'all') {
      query.department = new RegExp(department, 'i');
    }

    if (eventType && eventType !== 'all') {
      query.eventType = eventType;
    }

    if (isFree === 'true') {
      query.registrationFee = 0;
    } else if (isFree === 'false') {
      query.registrationFee = { $gt: 0 };
    }

    if (search) {
      const searchRegex = new RegExp(search, 'i');
      query.$or = [
        { title: searchRegex },
        { shortDescription: searchRegex },
        { description: searchRegex },
        { department: searchRegex },
        { venue: searchRegex },
        { organizerName: searchRegex },
      ];
    }

    let sortOption: any = { startAt: 1 };
    if (sort === 'newest') sortOption = { createdAt: -1 };
    if (sort === 'popular') sortOption = { registeredCount: -1 };
    if (sort === 'deadline') sortOption = { registrationDeadline: 1 };

    const events = await Event.find(query).sort(sortOption).limit(limit).lean();

    return NextResponse.json({
      success: true,
      count: events.length,
      data: events,
    });
  } catch (error: any) {
    console.error('Events GET error:', error);
    return NextResponse.json(
      { success: false, message: 'Failed to fetch events', error: error.message },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const user = getUserFromRequest(request);
    if (!user) {
      return NextResponse.json(
        { success: false, message: 'Unauthorized. Please log in to create an event.' },
        { status: 401 }
      );
    }

    // Role check: Admin only
    if (user.role !== 'admin') {
      return NextResponse.json(
        { success: false, message: 'Forbidden. Admin permission required to create events.' },
        { status: 403 }
      );
    }

    const body = await request.json();
    const {
      title,
      shortDescription,
      description,
      coverImage,
      category,
      department,
      eventType = 'offline',
      venue,
      building,
      room,
      mapUrl,
      startAt,
      endAt,
      registrationDeadline,
      capacity = 100,
      registrationFee = 0,
      isWaitlistEnabled = true,
      speakers = [],
      agenda = [],
      requirements = [],
      rules = [],
      faq = [],
      clubId,
      clubName,
    } = body;

    if (!title || !description || !venue || !startAt || !endAt || !registrationDeadline) {
      return NextResponse.json(
        { success: false, message: 'Missing required event fields (title, description, venue, dates)' },
        { status: 400 }
      );
    }

    await connectToDatabase();

    // Unique slug generation
    let baseSlug = slugify(title);
    let slug = baseSlug;
    let counter = 1;
    while (await Event.findOne({ slug })) {
      slug = `${baseSlug}-${counter}`;
      counter++;
    }

    // Admins can publish directly; Organizers submit for approval
    const initialStatus = user.role === 'admin' ? 'published' : 'pending_approval';

    const newEvent = await Event.create({
      title,
      slug,
      shortDescription: shortDescription || title,
      description,
      coverImage: coverImage || 'https://images.unsplash.com/photo-1504384308090-c894fdcc538d?w=1200&auto=format&fit=crop&q=80',
      category: category || 'Tech & Innovation',
      organizerId: user.userId,
      organizerName: user.name,
      organizerEmail: user.email,
      organizerRole: user.role,
      clubId,
      clubName,
      department: department || 'University General',
      eventType,
      venue,
      building,
      room,
      mapUrl,
      startAt: new Date(startAt),
      endAt: new Date(endAt),
      registrationDeadline: new Date(registrationDeadline),
      capacity: Number(capacity),
      registrationFee: Number(registrationFee),
      isFeeRequired: Number(registrationFee) > 0,
      isWaitlistEnabled: Boolean(isWaitlistEnabled),
      status: initialStatus,
      speakers,
      agenda,
      requirements,
      rules,
      faq,
    });

    // Record audit log
    await AuditLog.create({
      userId: user.userId,
      userName: user.name,
      userRole: user.role,
      action: user.role === 'admin' ? 'EVENT_CREATED_PUBLISHED' : 'EVENT_SUBMITTED_FOR_APPROVAL',
      entityType: 'Event',
      entityId: newEvent._id.toString(),
      details: `Event "${newEvent.title}" was created with status "${newEvent.status}"`,
    });

    return NextResponse.json({
      success: true,
      message: user.role === 'admin' 
        ? 'Event created and published successfully!' 
        : 'Event submitted for university admin approval!',
      data: newEvent,
    });
  } catch (error: any) {
    console.error('Create Event error:', error);
    return NextResponse.json(
      { success: false, message: 'Failed to create event', error: error.message },
      { status: 500 }
    );
  }
}
