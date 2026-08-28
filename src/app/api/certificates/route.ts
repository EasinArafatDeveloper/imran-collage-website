import { NextRequest, NextResponse } from 'next/server';
import { connectToDatabase } from '@/lib/mongodb';
import { Event, Attendance, Certificate, Notification, AuditLog } from '@/lib/models';
import { getUserFromRequest } from '@/lib/auth';
import { generateCertificateNumber } from '@/lib/utils';

export async function GET(request: NextRequest) {
  try {
    const user = getUserFromRequest(request);
    if (!user) {
      return NextResponse.json({ success: false, message: 'Unauthorized' }, { status: 401 });
    }

    await connectToDatabase();
    const { searchParams } = new URL(request.url);
    const eventId = searchParams.get('eventId');

    let query: any = {};
    if (user.role === 'student') {
      query.userId = user.userId;
    } else if (eventId) {
      query.eventId = eventId;
    }

    const certificates = await Certificate.find(query).sort({ issueDate: -1 }).lean();

    return NextResponse.json({
      success: true,
      count: certificates.length,
      data: certificates,
    });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, message: 'Error fetching certificates', error: error.message },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const user = getUserFromRequest(request);
    if (!user || user.role !== 'admin') {
      return NextResponse.json({ success: false, message: 'Forbidden. Admin permission required.' }, { status: 403 });
    }

    const { eventId } = await request.json();
    if (!eventId) {
      return NextResponse.json({ success: false, message: 'Event ID is required' }, { status: 400 });
    }

    await connectToDatabase();

    const event = await Event.findById(eventId);
    if (!event) {
      return NextResponse.json({ success: false, message: 'Event not found' }, { status: 404 });
    }

    // Find all attended participants
    const attendees = await Attendance.find({ eventId });
    if (!attendees.length) {
      return NextResponse.json(
        { success: false, message: 'No attended participants found to issue certificates for.' },
        { status: 400 }
      );
    }

    let issuedCount = 0;
    for (const attendee of attendees) {
      const existingCert = await Certificate.findOne({ eventId, userId: attendee.userId });
      if (!existingCert) {
        const certNumber = generateCertificateNumber();
        await Certificate.create({
          certificateNumber: certNumber,
          eventId: event._id,
          eventTitle: event.title,
          userId: attendee.userId,
          studentName: attendee.studentName,
          studentId: attendee.studentId,
          department: attendee.department,
          issueDate: new Date(),
          organizerName: event.clubName || event.organizerName,
          qrVerificationUrl: `http://localhost:3000/certificates/verify/${certNumber}`,
        });

        await Notification.create({
          userId: attendee.userId,
          title: '📜 Certificate Issued!',
          message: `Congratulations! Your certificate of completion for "${event.title}" is ready. Certificate No: ${certNumber}.`,
          type: 'certificate',
          link: '/dashboard/student',
        });

        issuedCount++;
      }
    }

    await AuditLog.create({
      userId: user.userId,
      userName: user.name,
      userRole: user.role,
      action: 'CERTIFICATES_BATCH_ISSUED',
      entityType: 'Certificate',
      entityId: eventId,
      details: `Issued ${issuedCount} new certificates for event "${event.title}"`,
    });

    return NextResponse.json({
      success: true,
      message: `Successfully issued ${issuedCount} certificates for "${event.title}".`,
      issuedCount,
    });
  } catch (error: any) {
    console.error('Issue certificate error:', error);
    return NextResponse.json(
      { success: false, message: 'Failed to issue certificates', error: error.message },
      { status: 500 }
    );
  }
}
