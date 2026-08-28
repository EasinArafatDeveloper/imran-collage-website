import { NextRequest, NextResponse } from 'next/server';
import { connectToDatabase } from '@/lib/mongodb';
import { Event, Notification, AuditLog } from '@/lib/models';
import { getUserFromRequest } from '@/lib/auth';

export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  return handleStatusUpdate(request, params);
}

export async function PATCH(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  return handleStatusUpdate(request, params);
}

async function handleStatusUpdate(
  request: NextRequest,
  params: { id: string }
) {
  try {
    const user = getUserFromRequest(request);
    if (!user) {
      return NextResponse.json({ success: false, message: 'Unauthorized' }, { status: 401 });
    }

    const { status, rejectionReason } = await request.json();
    const { id } = params;

    if (!['approved', 'published', 'rejected', 'cancelled', 'completed'].includes(status)) {
      return NextResponse.json({ success: false, message: 'Invalid status' }, { status: 400 });
    }

    await connectToDatabase();

    const event = await Event.findById(id);
    if (!event) {
      return NextResponse.json({ success: false, message: 'Event not found' }, { status: 404 });
    }

    // Only Admin can approve/reject/cancel; Organizer can cancel their own event
    if (['approved', 'published', 'rejected'].includes(status) && user.role !== 'admin') {
      return NextResponse.json(
        { success: false, message: 'Forbidden. Only University Admins can review event approvals.' },
        { status: 403 }
      );
    }

    if (status === 'cancelled') {
      if (user.role !== 'admin' && event.organizerId.toString() !== user.userId) {
        return NextResponse.json(
          { success: false, message: 'Forbidden. You cannot cancel this event.' },
          { status: 403 }
        );
      }
    }

    event.status = status;
    if (rejectionReason) {
      event.rejectionReason = rejectionReason;
    }
    await event.save();

    // Send notification to organizer
    let notifTitle = `Event status updated: ${status.toUpperCase()}`;
    let notifMsg = `Your event "${event.title}" status has been changed to ${status}.`;
    if (status === 'approved' || status === 'published') {
      notifTitle = '🎉 Event Approved & Published!';
      notifMsg = `Congratulations! "${event.title}" has been approved by the University Admin and is now open for registrations.`;
    } else if (status === 'rejected') {
      notifTitle = '⚠️ Event Requires Revision';
      notifMsg = `Your event "${event.title}" was not approved. Reason: ${rejectionReason || 'Please review guidelines'}.`;
    }

    await Notification.create({
      userId: event.organizerId,
      title: notifTitle,
      message: notifMsg,
      type: status === 'approved' || status === 'published' ? 'approval' : 'system',
      link: `/events/${event.slug}`,
    });

    await AuditLog.create({
      userId: user.userId,
      userName: user.name,
      userRole: user.role,
      action: `EVENT_STATUS_${status.toUpperCase()}`,
      entityType: 'Event',
      entityId: id,
      details: `Changed status of "${event.title}" to ${status}. ${rejectionReason ? `Reason: ${rejectionReason}` : ''}`,
    });

    return NextResponse.json({
      success: true,
      message: `Event status updated to ${status}`,
      data: event,
    });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, message: 'Error updating event status', error: error.message },
      { status: 500 }
    );
  }
}
