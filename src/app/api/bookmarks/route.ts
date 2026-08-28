import { NextRequest, NextResponse } from 'next/server';
import { connectToDatabase } from '@/lib/mongodb';
import { Bookmark, Event } from '@/lib/models';
import { getUserFromRequest } from '@/lib/auth';

export async function GET(request: NextRequest) {
  try {
    const user = getUserFromRequest(request);
    if (!user) {
      return NextResponse.json({ success: false, message: 'Unauthorized' }, { status: 401 });
    }

    await connectToDatabase();
    const bookmarks = await Bookmark.find({ userId: user.userId }).lean();
    const eventIds = bookmarks.map(b => b.eventId);

    const events = await Event.find({ _id: { $in: eventIds } }).lean();

    return NextResponse.json({
      success: true,
      count: events.length,
      data: events,
      bookmarkedIds: eventIds.map(id => id.toString()),
    });
  } catch (error: any) {
    return NextResponse.json({ success: false, message: 'Failed to fetch bookmarks', error: error.message }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const user = getUserFromRequest(request);
    if (!user) {
      return NextResponse.json({ success: false, message: 'Unauthorized' }, { status: 401 });
    }

    const { eventId } = await request.json();
    if (!eventId) {
      return NextResponse.json({ success: false, message: 'Event ID required' }, { status: 400 });
    }

    await connectToDatabase();

    const existing = await Bookmark.findOne({ userId: user.userId, eventId });
    if (existing) {
      await Bookmark.findByIdAndDelete(existing._id);
      return NextResponse.json({ success: true, isBookmarked: false, message: 'Event removed from bookmarks' });
    } else {
      await Bookmark.create({ userId: user.userId, eventId });
      return NextResponse.json({ success: true, isBookmarked: true, message: 'Event saved to bookmarks' });
    }
  } catch (error: any) {
    return NextResponse.json({ success: false, message: 'Error toggling bookmark', error: error.message }, { status: 500 });
  }
}
