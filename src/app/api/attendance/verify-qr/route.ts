import { NextRequest, NextResponse } from 'next/server';
import { connectToDatabase } from '@/lib/mongodb';
import { Event, EventRegistration, Attendance, Notification, AuditLog } from '@/lib/models';
import { getUserFromRequest } from '@/lib/auth';
import { decodeQrPayload } from '@/lib/utils';

export async function POST(request: NextRequest) {
  try {
    const user = getUserFromRequest(request);
    if (!user || user.role !== 'admin') {
      return NextResponse.json({ success: false, message: 'Forbidden. Admin scanner permission required.' }, { status: 403 });
    }

    const { qrToken, eventId } = await request.json();

    if (!qrToken || !eventId) {
      return NextResponse.json(
        { success: false, message: 'QR token and Event ID are required' },
        { status: 400 }
      );
    }

    await connectToDatabase();

    // Decode QR payload token
    const decoded = decodeQrPayload(qrToken);
    let registration = null;

    if (decoded && decoded.code) {
      registration = await EventRegistration.findOne({
        eventId,
        registrationCode: decoded.code,
      });
    } else {
      // Direct token lookup fallback or code string
      registration = await EventRegistration.findOne({
        eventId,
        $or: [{ qrPayloadToken: qrToken }, { registrationCode: qrToken.trim() }],
      });
    }

    if (!registration) {
      return NextResponse.json(
        { 
          success: false, 
          message: '❌ Invalid QR Pass! This registration does not match this event.' 
        },
        { status: 404 }
      );
    }

    if (registration.status === 'cancelled') {
      return NextResponse.json(
        { success: false, message: '⚠️ This registration was cancelled by the student.' },
        { status: 400 }
      );
    }

    if (registration.status === 'waitlisted') {
      return NextResponse.json(
        { success: false, message: '⚠️ Student is on the waitlist and does not have a confirmed seat.' },
        { status: 400 }
      );
    }

    // Check duplicate check-in
    const alreadyAttended = await Attendance.findOne({
      eventId,
      registrationId: registration._id,
    });

    if (alreadyAttended) {
      return NextResponse.json(
        {
          success: false,
          duplicate: true,
          message: `⚠️ Already Checked-in at ${new Date(alreadyAttended.checkedInAt).toLocaleTimeString()} by ${alreadyAttended.checkedInBy}`,
          participant: {
            name: registration.userName,
            studentId: registration.studentId,
            department: registration.department,
            checkedInAt: alreadyAttended.checkedInAt,
          },
        },
        { status: 400 }
      );
    }

    // Record verified attendance
    const attendance = await Attendance.create({
      eventId,
      registrationId: registration._id,
      userId: registration.userId,
      studentId: registration.studentId,
      studentName: registration.userName,
      department: registration.department,
      checkedInAt: new Date(),
      checkedInBy: user.name,
      verificationMethod: 'qr_scan',
    });

    registration.status = 'attended';
    registration.attendedAt = new Date();
    await registration.save();

    // Send instant in-app notification
    await Notification.create({
      userId: registration.userId,
      title: '✅ QR Check-in Verified!',
      message: `Welcome to "${registration.eventTitle}"! Your QR pass was successfully scanned at the entrance.`,
      type: 'approval',
      link: '/dashboard/student',
    });

    await AuditLog.create({
      userId: user.userId,
      userName: user.name,
      userRole: user.role,
      action: 'QR_ATTENDANCE_CHECKIN',
      entityType: 'Attendance',
      entityId: attendance._id.toString(),
      details: `Scanned QR Pass for ${registration.userName} (${registration.studentId}) - Event: ${registration.eventTitle}`,
    });

    return NextResponse.json({
      success: true,
      message: `✅ Check-in Verified: ${registration.userName} (${registration.studentId})`,
      participant: {
        name: registration.userName,
        studentId: registration.studentId,
        department: registration.department,
        registrationCode: registration.registrationCode,
        checkedInAt: attendance.checkedInAt,
        checkedInBy: user.name,
      },
    });
  } catch (error: any) {
    console.error('QR Scanner verification error:', error);
    return NextResponse.json(
      { success: false, message: 'QR verification failed', error: error.message },
      { status: 500 }
    );
  }
}
