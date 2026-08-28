import { NextRequest, NextResponse } from 'next/server';
import mongoose from 'mongoose';
import { connectToDatabase } from '@/lib/mongodb';
import { Event, AuditLog } from '@/lib/models';
import { getUserFromRequest } from '@/lib/auth';

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    await connectToDatabase();
    const { id } = params;

    let event = null;
    if (mongoose.Types.ObjectId.isValid(id)) {
      event = await Event.findById(id).lean();
    } else {
      // Find by slug
      event = await Event.findOne({ slug: id }).lean();
    }

    if (!event) {
      return NextResponse.json(
        { success: false, message: 'Event not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      data: event,
    });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, message: 'Error fetching event', error: error.message },
      { status: 500 }
    );
  }
}

export async function PUT(
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
    const updateData = await request.json();

    const existingEvent = await Event.findById(id);
    if (!existingEvent) {
      return NextResponse.json({ success: false, message: 'Event not found' }, { status: 404 });
    }

    // Permission check: Admin or the owner organizer
    if (user.role !== 'admin' && existingEvent.organizerId.toString() !== user.userId) {
      return NextResponse.json(
        { success: false, message: 'Forbidden. You do not have permission to edit this event.' },
        { status: 403 }
      );
    }

    // Update fields
    const updatedEvent = await Event.findByIdAndUpdate(id, updateData, { new: true });

    await AuditLog.create({
      userId: user.userId,
      userName: user.name,
      userRole: user.role,
      action: 'EVENT_UPDATED',
      entityType: 'Event',
      entityId: id,
      details: `Updated details for event: ${updatedEvent?.title}`,
    });

    return NextResponse.json({
      success: true,
      message: 'Event updated successfully',
      data: updatedEvent,
    });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, message: 'Error updating event', error: error.message },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const user = getUserFromRequest(request);
    if (!user || user.role !== 'admin') {
      return NextResponse.json(
        { success: false, message: 'Forbidden. Only University Admins can delete events.' },
        { status: 403 }
      );
    }

    await connectToDatabase();
    const { id } = params;

    const deletedEvent = await Event.findByIdAndDelete(id);
    if (!deletedEvent) {
      return NextResponse.json({ success: false, message: 'Event not found' }, { status: 404 });
    }

    await AuditLog.create({
      userId: user.userId,
      userName: user.name,
      userRole: user.role,
      action: 'EVENT_DELETED',
      entityType: 'Event',
      entityId: id,
      details: `Deleted event: ${deletedEvent.title}`,
    });

    return NextResponse.json({
      success: true,
      message: 'Event deleted successfully',
    });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, message: 'Error deleting event', error: error.message },
      { status: 500 }
    );
  }
}
