import { NextRequest, NextResponse } from 'next/server';
import { connectToDatabase } from '@/lib/mongodb';
import { User, StudentProfile } from '@/lib/models';
import { getUserFromRequest } from '@/lib/auth';

export async function GET(request: NextRequest) {
  try {
    const tokenUser = getUserFromRequest(request);
    if (!tokenUser) {
      return NextResponse.json(
        { success: false, message: 'Unauthorized. No active session.' },
        { status: 401 }
      );
    }

    await connectToDatabase();

    const user = await User.findById(tokenUser.userId).select('-password');
    if (!user) {
      return NextResponse.json(
        { success: false, message: 'User profile not found' },
        { status: 404 }
      );
    }

    let studentProfile = null;
    if (user.role === 'student') {
      studentProfile = await StudentProfile.findOne({ userId: user._id });
    }

    return NextResponse.json({
      success: true,
      user: {
        _id: user._id.toString(),
        name: user.name,
        email: user.email,
        role: user.role,
        status: user.status,
        avatar: user.avatar,
        studentProfile: studentProfile ? {
          studentId: studentProfile.studentId,
          department: studentProfile.department,
          faculty: studentProfile.faculty,
          semester: studentProfile.semester,
          phone: studentProfile.phone,
          program: studentProfile.program,
          bio: studentProfile.bio,
        } : null,
      },
    });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, message: 'Error fetching session', error: error.message },
      { status: 500 }
    );
  }
}
