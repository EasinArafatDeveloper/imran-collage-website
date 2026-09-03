import { NextRequest, NextResponse } from 'next/server';
import { connectToDatabase } from '@/lib/mongodb';
import { User, StudentProfile } from '@/lib/models';
import { hashPassword, signToken } from '@/lib/auth';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { 
      name, 
      email, 
      password, 
      studentId, 
      department = 'Computer Science & Engineering', 
      faculty = 'Faculty of Science & Engineering', 
      phone = '', 
      program = 'Undergraduate Program',
      semester = 'Spring 2026'
    } = body;

    if (!name || !email || !password) {
      return NextResponse.json(
        { success: false, message: 'Name, email, and password are required' },
        { status: 400 }
      );
    }

    if (password.length < 6) {
      return NextResponse.json(
        { success: false, message: 'Password must be at least 6 characters' },
        { status: 400 }
      );
    }

    await connectToDatabase();

    const normalizedEmail = email.toLowerCase().trim();

    // Check existing email
    const existingUser = await User.findOne({ email: normalizedEmail });
    if (existingUser) {
      return NextResponse.json(
        { success: false, message: 'An account with this email address already exists.' },
        { status: 400 }
      );
    }

    // Ensure studentId is unique if provided
    const cleanStudentId = studentId?.trim() || `2024-${Math.floor(1000 + Math.random() * 9000)}`;
    const existingProfile = await StudentProfile.findOne({ studentId: cleanStudentId });
    if (existingProfile) {
      return NextResponse.json(
        { success: false, message: 'This Student ID is already registered.' },
        { status: 400 }
      );
    }

    const hashedPassword = await hashPassword(password);
    const avatar = `https://api.dicebear.com/7.x/avataaars/svg?seed=${encodeURIComponent(name.trim())}`;

    // All registered users through signup are strictly 'student'
    const newUser = await User.create({
      name: name.trim(),
      email: normalizedEmail,
      password: hashedPassword,
      role: 'student',
      status: 'active',
      avatar,
      emailVerified: true,
    });

    const studentProfile = await StudentProfile.create({
      userId: newUser._id,
      studentId: cleanStudentId,
      faculty,
      department: department.trim() || 'Computer Science & Engineering',
      program,
      semester,
      phone: phone.trim() || '+880 1700-000000',
      avatar,
    });

    const token = signToken({
      userId: newUser._id.toString(),
      name: newUser.name,
      email: newUser.email,
      role: 'student',
      studentId: studentProfile.studentId,
      department: studentProfile.department,
    });

    const response = NextResponse.json({
      success: true,
      message: 'Registration successful! Welcome.',
      token,
      user: {
        _id: newUser._id.toString(),
        name: newUser.name,
        email: newUser.email,
        role: 'student',
        status: newUser.status,
        avatar: newUser.avatar,
        studentProfile: {
          studentId: studentProfile.studentId,
          department: studentProfile.department,
          faculty: studentProfile.faculty,
          semester: studentProfile.semester,
          phone: studentProfile.phone,
        },
      },
    });

    response.cookies.set('auth_token', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      path: '/',
      maxAge: 7 * 24 * 60 * 60, // 7 days
    });

    return response;
  } catch (error: any) {
    console.error('Registration error:', error);
    return NextResponse.json(
      { success: false, message: 'Registration failed due to a server issue. Please try again.', error: error.message },
      { status: 500 }
    );
  }
}
