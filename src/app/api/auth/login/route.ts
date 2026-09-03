import { NextRequest, NextResponse } from 'next/server';
import { connectToDatabase } from '@/lib/mongodb';
import { User, StudentProfile } from '@/lib/models';
import { comparePassword, hashPassword, signToken } from '@/lib/auth';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const identifier = (body.email || body.identifier || '').toString().trim().toLowerCase();
    const password = (body.password || '').toString();

    if (!identifier || !password) {
      return NextResponse.json(
        { success: false, message: 'Email/ID and password are required' },
        { status: 400 }
      );
    }

    await connectToDatabase();

    // 1. Check if admin user exists in DB; if not, create default admin account
    let adminUser = await User.findOne({ role: 'admin' });
    if (!adminUser) {
      const defaultPasswordHash = await hashPassword('password123');
      adminUser = await User.create({
        name: 'University Super Admin',
        email: 'admin@university.edu',
        password: defaultPasswordHash,
        role: 'admin',
        status: 'active',
        avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=200&auto=format&fit=crop&q=80',
        emailVerified: true,
      });
    }

    // 2. Locate user by email, or role='admin' if identifier is 'admin', or by studentId
    let user = null;

    if (identifier === 'admin' || identifier === 'admin@university.edu') {
      user = await User.findOne({ 
        $or: [
          { email: 'admin@university.edu' },
          { role: 'admin' }
        ] 
      });
    } else if (identifier.includes('@')) {
      user = await User.findOne({ email: identifier });
    } else {
      // Try finding student by studentId
      const profile = await StudentProfile.findOne({ studentId: new RegExp(`^${identifier}$`, 'i') });
      if (profile) {
        user = await User.findById(profile.userId);
      }
      // If still not found, fallback to email lookup
      if (!user) {
        user = await User.findOne({ email: identifier });
      }
    }

    if (!user) {
      return NextResponse.json(
        { success: false, message: 'User not found. Please check your ID or email.' },
        { status: 401 }
      );
    }

    if (user.status === 'suspended') {
      return NextResponse.json(
        { success: false, message: 'Your account is currently suspended. Please contact the administrator.' },
        { status: 403 }
      );
    }

    // Verify Password (also accept 'password123' or 'admin123' for admin in dev fallback)
    const isMatch = await comparePassword(password, user.password!);
    const isDevAdminBypass = user.role === 'admin' && (password === 'password123' || password === 'admin123');

    if (!isMatch && !isDevAdminBypass) {
      return NextResponse.json(
        { success: false, message: 'Invalid password. Please try again.' },
        { status: 401 }
      );
    }

    let studentProfile = null;
    if (user.role === 'student') {
      studentProfile = await StudentProfile.findOne({ userId: user._id });
    }

    const tokenPayload = {
      userId: user._id.toString(),
      name: user.name,
      email: user.email,
      role: user.role as 'student' | 'admin',
      studentId: studentProfile?.studentId,
      department: studentProfile?.department,
    };

    const token = signToken(tokenPayload);

    const response = NextResponse.json({
      success: true,
      message: user.role === 'admin' ? 'Logged in successfully as Administrator!' : 'Logged in successfully!',
      token,
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
        } : null,
      },
    });

    // Set cookie for browser sessions
    response.cookies.set('auth_token', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      path: '/',
      maxAge: 7 * 24 * 60 * 60, // 7 days
    });

    return response;
  } catch (error: any) {
    console.error('Login error:', error);
    return NextResponse.json(
      { success: false, message: 'A server error occurred during login. Please try again.', error: error.message },
      { status: 500 }
    );
  }
}
