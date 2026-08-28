import { NextRequest, NextResponse } from 'next/server';
import { connectToDatabase } from '@/lib/mongodb';
import { Event, EventRegistration, Attendance, Notification, AuditLog } from '@/lib/models';
import { getUserFromRequest } from '@/lib/auth';

export async function GET(request: NextRequest) {
  try {
    const user = getUserFromRequest(request);
    if (!user || user.role !== 'admin') {
      return NextResponse.json({ success: false, message: 'Forbidden. Admin permission required.' }, { status: 403 });
    }

    const { searchParams } = new URL(request.url);
    const eventId = searchParams.get('eventId');
    if (!eventId) {
      return NextResponse.json({ success: false, message: 'Event ID required' }, { status: 400 });
    }

    await connectToDatabase();

    const [event, attendees, allRegistrations] = await Promise.all([
      Event.findById(eventId).lean(),
      Attendance.find({ eventId }).sort({ checkedInAt: -1 }).lean(),
      EventRegistration.find({ eventId, status: { $in: ['registered', 'attended'] } }).lean(),
    ]);

    if (!event) {
      return NextResponse.json({ success: false, message: 'Event not found' }, { status: 404 });
    }

    const totalRegistered = allRegistrations.length;
    const totalAttended = attendees.length;
    const totalAbsent = Math.max(0, totalRegistered - totalAttended);
    const attendanceRate = totalRegistered > 0 ? ((totalAttended / totalRegistered) * 100).toFixed(1) : '0';

    return NextResponse.json({
      success: true,
      stats: {
        totalRegistered,
        totalAttended,
        totalAbsent,
        attendanceRate: `${attendanceRate}%`,
      },
      attendees,
      allRegistrations,
    });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, message: 'Error fetching attendance', error: error.message },
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

    const { eventId, registrationId, studentId } = await request.json();
    if (!eventId || (!registrationId && !studentId)) {
      return NextResponse.json(
        { success: false, message: 'Event ID and Registration ID or Student ID required' },
        { status: 400 }
      );
    }

    await connectToDatabase();

    let registration = null;
    if (registrationId) {
      registration = await EventRegistration.findById(registrationId);
    } else {
      registration = await EventRegistration.findOne({ eventId, studentId });
    }

    if (!registration) {
      return NextResponse.json(
        { success: false, message: 'No active registration found for this student.' },
        { status: 404 }
      );
    }

    // Check duplicate check-in
    const existingAttendance = await Attendance.findOne({ eventId, registrationId: registration._id });
    if (existingAttendance) {
      return NextResponse.json(
        { 
          success: false, 
          message: `Already checked in at ${new Date(existingAttendance.checkedInAt).toLocaleTimeString()}`,
          attendance: existingAttendance 
        },
        { status: 400 }
      );
    }

    // Create attendance
    const attendance = await Attendance.create({
      eventId,
      registrationId: registration._id,
      userId: registration.userId,
      studentId: registration.studentId,
      studentName: registration.userName,
      department: registration.department,
      checkedInAt: new Date(),
      checkedInBy: user.name,
      verificationMethod: 'manual',
    });

    registration.status = 'attended';
    registration.attendedAt = new Date();
    await registration.save();

    await Notification.create({
      userId: registration.userId,
      title: '✅ Attendance Confirmed',
      message: `Your attendance has been marked for "${registration.eventTitle}". You are now eligible for event certification and feedback.`,
      type: 'approval',
      link: '/dashboard/student',
    });

    await AuditLog.create({
      userId: user.userId,
      userName: user.name,
      userRole: user.role,
      action: 'MANUAL_ATTENDANCE_CHECKIN',
      entityType: 'Attendance',
      entityId: attendance._id.toString(),
      details: `Manually checked in student ${registration.userName} (${registration.studentId}) for event ${registration.eventTitle}`,
    });

    return NextResponse.json({
      success: true,
      message: `Attendance marked for ${registration.userName} (${registration.studentId})`,
      attendance,
    });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, message: 'Failed to record attendance', error: error.message },
      { status: 500 }
    );
  }
}
