import { NextRequest, NextResponse } from 'next/server';
import { connectToDatabase } from '@/lib/mongodb';
import { Feedback, Attendance, AuditLog } from '@/lib/models';
import { getUserFromRequest } from '@/lib/auth';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const eventId = searchParams.get('eventId');
    if (!eventId) {
      return NextResponse.json({ success: false, message: 'Event ID required' }, { status: 400 });
    }

    await connectToDatabase();
    const reviews = await Feedback.find({ eventId }).sort({ createdAt: -1 }).lean();

    const avgRating = reviews.length
      ? (reviews.reduce((acc, curr) => acc + curr.rating, 0) / reviews.length).toFixed(1)
      : '5.0';

    return NextResponse.json({
      success: true,
      count: reviews.length,
      averageRating: avgRating,
      data: reviews,
    });
  } catch (error: any) {
    return NextResponse.json({ success: false, message: 'Failed to fetch reviews', error: error.message }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const user = getUserFromRequest(request);
    if (!user) {
      return NextResponse.json({ success: false, message: 'Unauthorized. Please login.' }, { status: 401 });
    }

    const { eventId, rating, organizationRating, speakerRating, venueRating, comment } = await request.json();
    if (!eventId || !rating || !comment) {
      return NextResponse.json({ success: false, message: 'Event ID, rating and comment required' }, { status: 400 });
    }

    await connectToDatabase();

    // Critical Business Rule: Only verified attendees can submit feedback!
    const attendance = await Attendance.findOne({ eventId, userId: user.userId });
    if (!attendance && user.role !== 'admin') {
      return NextResponse.json(
        { 
          success: false, 
          message: 'Access Denied. Only students who actually attended this event can submit reviews and feedback.' 
        },
        { status: 403 }
      );
    }

    // Check duplicate feedback
    const existingFeedback = await Feedback.findOne({ eventId, userId: user.userId });
    if (existingFeedback) {
      return NextResponse.json(
        { success: false, message: 'You have already submitted a review for this event.' },
        { status: 400 }
      );
    }

    const feedback = await Feedback.create({
      eventId,
      userId: user.userId,
      userName: user.name,
      studentId: user.studentId || '2024-UNIV',
      rating: Number(rating),
      organizationRating: Number(organizationRating || 5),
      speakerRating: Number(speakerRating || 5),
      venueRating: Number(venueRating || 5),
      comment: comment.trim(),
    });

    await AuditLog.create({
      userId: user.userId,
      userName: user.name,
      userRole: user.role,
      action: 'FEEDBACK_SUBMITTED',
      entityType: 'Feedback',
      entityId: feedback._id.toString(),
      details: `Submitted rating ${rating}★ for event`,
    });

    return NextResponse.json({
      success: true,
      message: 'Thank you! Your feedback has been recorded.',
      data: feedback,
    });
  } catch (error: any) {
    return NextResponse.json({ success: false, message: 'Failed to submit feedback', error: error.message }, { status: 500 });
  }
}
