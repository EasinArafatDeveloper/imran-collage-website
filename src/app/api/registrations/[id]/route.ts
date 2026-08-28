import { NextRequest, NextResponse } from 'next/server';
import { connectToDatabase } from '@/lib/mongodb';
import { Event, EventRegistration, Notification, AuditLog } from '@/lib/models';
import { getUserFromRequest } from '@/lib/auth';

export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const user = getUserFromRequest(request);
    if (!user) {
      return NextResponse.json({ success: false, message: 'Unauthorized' }, { status: 401 });
    }

    await connectToDatabase();
    const { id } = params;

    const registration = await EventRegistration.findById(id);
    if (!registration) {
      return NextResponse.json({ success: false, message: 'Registration record not found' }, { status: 404 });
    }

    // Permission check: only the student or admin can cancel
    if (user.role !== 'admin' && registration.userId.toString() !== user.userId) {
      return NextResponse.json(
        { success: false, message: 'Forbidden. You cannot cancel this registration.' },
        { status: 403 }
      );
    }

    const prevStatus = registration.status;
    registration.status = 'cancelled';
    registration.cancelledAt = new Date();
    await registration.save();

    const event = await Event.findById(registration.eventId);
    if (event) {
      if (prevStatus === 'registered') {
        event.registeredCount = Math.max(0, (event.registeredCount || 1) - 1);

        // Auto-promote top waitlisted student if available!
        const nextWaitlisted = await EventRegistration.findOne({
          eventId: event._id,
          status: 'waitlisted',
        }).sort({ registeredAt: 1 });

        if (nextWaitlisted) {
          nextWaitlisted.status = 'registered';
          await nextWaitlisted.save();

          event.registeredCount += 1;
          event.waitlistCount = Math.max(0, (event.waitlistCount || 1) - 1);

          // Notify the promoted student
          await Notification.create({
            userId: nextWaitlisted.userId,
            title: '🎉 Great News! You have been moved off the Waitlist!',
            message: `A seat became available for "${event.title}". You are now confirmed as Registered! View your QR Ticket in My Events.`,
            type: 'registration',
            link: '/dashboard/student',
          });
        }
      } else if (prevStatus === 'waitlisted') {
        event.waitlistCount = Math.max(0, (event.waitlistCount || 1) - 1);
      }
      await event.save();
    }

    await AuditLog.create({
      userId: user.userId,
      userName: user.name,
      userRole: user.role,
      action: 'REGISTRATION_CANCELLED',
      entityType: 'EventRegistration',
      entityId: id,
      details: `Cancelled registration for "${registration.eventTitle}" (Code: ${registration.registrationCode})`,
    });

    return NextResponse.json({
      success: true,
      message: 'Registration cancelled successfully',
      data: registration,
    });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, message: 'Error cancelling registration', error: error.message },
      { status: 500 }
    );
  }
}
