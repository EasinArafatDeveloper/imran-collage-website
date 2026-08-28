import { NextRequest, NextResponse } from 'next/server';
import { connectToDatabase } from '@/lib/mongodb';
import { Event, EventRegistration, Notification, StudentProfile, AuditLog } from '@/lib/models';
import { getUserFromRequest } from '@/lib/auth';
import { generateRegistrationCode, generateQrPayload } from '@/lib/utils';

export async function GET(request: NextRequest) {
  try {
    const user = getUserFromRequest(request);
    if (!user) {
      return NextResponse.json({ success: false, message: 'Unauthorized' }, { status: 401 });
    }

    await connectToDatabase();
    const { searchParams } = new URL(request.url);
    const eventId = searchParams.get('eventId');
    const status = searchParams.get('status');
    const all = searchParams.get('all');

    // Admin requesting all registrations across all events
    if (all === 'true' && user.role === 'admin') {
      const filter: any = {};
      if (eventId && eventId !== 'all') filter.eventId = eventId;
      if (status && status !== 'all') filter.status = status;

      const allRegistrations = await EventRegistration.find(filter)
        .sort({ registeredAt: -1 })
        .lean();
      return NextResponse.json({
        success: true,
        count: allRegistrations.length,
        data: allRegistrations,
      });
    }

    // If eventId is provided and user is Organizer/Admin -> view all participants for this event
    if (eventId) {
      const event = await Event.findById(eventId);
      if (!event) {
        return NextResponse.json({ success: false, message: 'Event not found' }, { status: 404 });
      }

      if (user.role !== 'admin' && event.organizerId.toString() !== user.userId) {
        return NextResponse.json(
          { success: false, message: 'Forbidden. You do not manage this event.' },
          { status: 403 }
        );
      }

      const filter: any = { eventId };
      if (status && status !== 'all') filter.status = status;

      const participants = await EventRegistration.find(filter).sort({ registeredAt: -1 }).lean();
      return NextResponse.json({ success: true, count: participants.length, data: participants });
    }

    // Default: student viewing their own registrations
    const myRegistrations = await EventRegistration.find({ userId: user.userId })
      .sort({ registeredAt: -1 })
      .lean();

    return NextResponse.json({
      success: true,
      count: myRegistrations.length,
      data: myRegistrations,
    });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, message: 'Failed to fetch registrations', error: error.message },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const user = getUserFromRequest(request);
    if (!user) {
      return NextResponse.json(
        { success: false, message: 'Please log in to register for this event.' },
        { status: 401 }
      );
    }

    const body = await request.json();
    const { 
      eventId, 
      name,
      email,
      phone, 
      department, 
      studentId, 
      paymentMethod = 'Free', 
      trxId = '', 
      tshirtSize = 'L', 
    } = body;

    if (!eventId) {
      return NextResponse.json({ success: false, message: 'Event ID is required' }, { status: 400 });
    }

    await connectToDatabase();

    const event = await Event.findById(eventId);
    if (!event) {
      return NextResponse.json({ success: false, message: 'Event does not exist' }, { status: 404 });
    }

    if (event.status !== 'published' && event.status !== 'approved') {
      return NextResponse.json(
        { success: false, message: 'This event is currently not open for registration.' },
        { status: 400 }
      );
    }

    // Check registration deadline
    if (new Date() > new Date(event.registrationDeadline)) {
      return NextResponse.json(
        { success: false, message: 'The registration deadline for this event has passed.' },
        { status: 400 }
      );
    }

    // Check duplicate registration
    const existingRegistration = await EventRegistration.findOne({
      eventId: event._id,
      userId: user.userId,
      status: { $in: ['registered', 'waitlisted', 'attended'] },
    });

    if (existingRegistration) {
      return NextResponse.json(
        { 
          success: false, 
          message: `You are already registered for this event (Status: ${existingRegistration.status.toUpperCase()}). Check My Events to view your QR Ticket.`,
          data: existingRegistration 
        },
        { status: 400 }
      );
    }

    // Determine if capacity is full -> Waitlist or Registered
    const isFull = event.registeredCount >= event.capacity;
    if (isFull && !event.isWaitlistEnabled) {
      return NextResponse.json(
        { success: false, message: 'This event has reached full capacity and waitlist is closed.' },
        { status: 400 }
      );
    }

    const finalStatus = isFull ? 'waitlisted' : 'registered';
    const finalName = name || user.name;
    const finalEmail = email || user.email;
    const finalStudentId = studentId || user.studentId || '2024-UNIV-001';
    const finalDept = department || user.department || 'General University';
    const finalPhone = phone || '+880 1700-000000';

    const registrationCode = generateRegistrationCode();
    const qrPayloadToken = generateQrPayload(registrationCode, finalStudentId, event._id.toString());

    const isPaidEvent = event.registrationFee > 0;
    const paymentStatus = isPaidEvent ? (trxId ? 'paid' : 'pending') : 'free';

    const newRegistration = await EventRegistration.create({
      eventId: event._id,
      eventTitle: event.title,
      eventStartAt: event.startAt,
      eventVenue: event.venue,
      eventCoverImage: event.coverImage,
      userId: user.userId,
      userName: finalName,
      userEmail: finalEmail,
      studentId: finalStudentId,
      department: finalDept,
      phone: finalPhone,
      registrationCode,
      qrPayloadToken,
      status: finalStatus,
      paymentStatus,
      paymentMethod,
      trxId: trxId || (isPaidEvent ? 'SIMULATED-TRX' : undefined),
      amountPaid: isPaidEvent ? event.registrationFee : 0,
      tshirtSize: tshirtSize || 'L',
      registeredAt: new Date(),
    });

    // Update Event counts
    if (finalStatus === 'registered') {
      event.registeredCount = (event.registeredCount || 0) + 1;
    } else {
      event.waitlistCount = (event.waitlistCount || 0) + 1;
    }
    await event.save();

    // Send confirmation notification
    await Notification.create({
      userId: user.userId,
      title: finalStatus === 'registered' ? '🎟️ Event Registration Confirmed!' : '⏳ Added to Event Waitlist',
      message: finalStatus === 'registered'
        ? `You have successfully registered for "${event.title}". Your pass ID is ${registrationCode}.`
        : `Event is full. You are on the waitlist for "${event.title}". We will notify you if a seat opens up!`,
      type: 'registration',
      link: '/dashboard/student',
    });

    await AuditLog.create({
      userId: user.userId,
      userName: user.name,
      userRole: user.role,
      action: finalStatus === 'registered' ? 'REGISTRATION_SUCCESS' : 'WAITLIST_JOINED',
      entityType: 'EventRegistration',
      entityId: newRegistration._id.toString(),
      details: `Student registered for "${event.title}". Code: ${registrationCode}`,
    });

    return NextResponse.json({
      success: true,
      message: finalStatus === 'registered' 
        ? 'Registration successful! Your digital QR ticket is ready.' 
        : 'You have been placed on the priority waitlist.',
      data: newRegistration,
    });
  } catch (error: any) {
    console.error('Registration error:', error);
    return NextResponse.json(
      { success: false, message: 'Failed to process registration', error: error.message },
      { status: 500 }
    );
  }
}
