import { NextRequest, NextResponse } from 'next/server';
import { connectToDatabase } from '@/lib/mongodb';
import { Notification } from '@/lib/models';
import { getUserFromRequest } from '@/lib/auth';

export async function GET(request: NextRequest) {
  try {
    const user = getUserFromRequest(request);
    if (!user) {
      return NextResponse.json({ success: false, message: 'Unauthorized' }, { status: 401 });
    }

    await connectToDatabase();

    const notifications = await Notification.find({ userId: user.userId })
      .sort({ createdAt: -1 })
      .limit(30)
      .lean();

    const unreadCount = await Notification.countDocuments({ userId: user.userId, isRead: false });

    return NextResponse.json({
      success: true,
      unreadCount,
      data: notifications,
    });
  } catch (error: any) {
    return NextResponse.json({ success: false, message: 'Error fetching notifications', error: error.message }, { status: 500 });
  }
}

export async function PUT(request: NextRequest) {
  try {
    const user = getUserFromRequest(request);
    if (!user) {
      return NextResponse.json({ success: false, message: 'Unauthorized' }, { status: 401 });
    }

    await connectToDatabase();
    const { notificationId, markAllAsRead } = await request.json();

    if (markAllAsRead) {
      await Notification.updateMany({ userId: user.userId, isRead: false }, { isRead: true });
      return NextResponse.json({ success: true, message: 'All notifications marked as read' });
    }

    if (notificationId) {
      await Notification.findByIdAndUpdate(notificationId, { isRead: true });
      return NextResponse.json({ success: true, message: 'Notification marked as read' });
    }

    return NextResponse.json({ success: false, message: 'Invalid payload' }, { status: 400 });
  } catch (error: any) {
    return NextResponse.json({ success: false, message: 'Error updating notifications', error: error.message }, { status: 500 });
  }
}
