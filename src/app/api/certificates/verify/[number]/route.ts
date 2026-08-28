import { NextRequest, NextResponse } from 'next/server';
import { connectToDatabase } from '@/lib/mongodb';
import { Certificate, Event } from '@/lib/models';

export async function GET(
  request: NextRequest,
  { params }: { params: { number: string } }
) {
  try {
    const { number } = params;
    if (!number) {
      return NextResponse.json({ success: false, message: 'Certificate number required' }, { status: 400 });
    }

    await connectToDatabase();

    const certificate = await Certificate.findOne({
      certificateNumber: number.toUpperCase().trim(),
    }).lean();

    if (!certificate) {
      return NextResponse.json(
        {
          success: false,
          verified: false,
          message: '❌ Invalid Certificate Number. No authentic record found in university registry.',
        },
        { status: 404 }
      );
    }

    const event = await Event.findById(certificate.eventId).lean();

    return NextResponse.json({
      success: true,
      verified: true,
      message: '✅ Verified Authentic University Event Certificate',
      certificate: {
        certificateNumber: certificate.certificateNumber,
        studentName: certificate.studentName,
        studentId: certificate.studentId,
        department: certificate.department,
        eventTitle: certificate.eventTitle,
        eventDate: event ? event.startAt : certificate.issueDate,
        venue: event ? event.venue : 'University Campus',
        issueDate: certificate.issueDate,
        organizerName: certificate.organizerName,
        university: 'University Student Event Management System',
      },
    });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, message: 'Error verifying certificate', error: error.message },
      { status: 500 }
    );
  }
}
