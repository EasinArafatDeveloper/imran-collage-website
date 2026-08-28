import { NextRequest, NextResponse } from 'next/server';
import { connectToDatabase } from '@/lib/mongodb';
import { User, StudentProfile, AuditLog } from '@/lib/models';
import { getUserFromRequest } from '@/lib/auth';

export async function GET(request: NextRequest) {
  try {
    const user = getUserFromRequest(request);
    if (!user || user.role !== 'admin') {
      return NextResponse.json({ success: false, message: 'Forbidden. Admin access only.' }, { status: 403 });
    }

    await connectToDatabase();
    const { searchParams } = new URL(request.url);
    const search = searchParams.get('search') || '';
    const role = searchParams.get('role') || '';
    const status = searchParams.get('status') || '';

    const filter: any = {};
    if (role && role !== 'all') filter.role = role;
    if (status && status !== 'all') filter.status = status;
    if (search) {
      filter.$or = [
        { name: new RegExp(search, 'i') },
        { email: new RegExp(search, 'i') },
      ];
    }

    const users = await User.find(filter).select('-password').sort({ createdAt: -1 }).lean();
    const studentProfiles = await StudentProfile.find().lean();
    const profileMap = new Map(studentProfiles.map(p => [p.userId.toString(), p]));

    const merged = users.map(u => ({
      ...u,
      studentProfile: profileMap.get(u._id.toString()) || null,
    }));

    return NextResponse.json({
      success: true,
      count: merged.length,
      data: merged,
    });
  } catch (error: any) {
    return NextResponse.json({ success: false, message: 'Failed to fetch users', error: error.message }, { status: 500 });
  }
}

export async function PUT(request: NextRequest) {
  try {
    const user = getUserFromRequest(request);
    if (!user || user.role !== 'admin') {
      return NextResponse.json({ success: false, message: 'Forbidden' }, { status: 403 });
    }

    const { userId, role, status } = await request.json();
    if (!userId) {
      return NextResponse.json({ success: false, message: 'User ID is required' }, { status: 400 });
    }

    await connectToDatabase();

    const targetUser = await User.findById(userId);
    if (!targetUser) {
      return NextResponse.json({ success: false, message: 'User not found' }, { status: 404 });
    }

    if (role) targetUser.role = role;
    if (status) targetUser.status = status;
    await targetUser.save();

    await AuditLog.create({
      userId: user.userId,
      userName: user.name,
      userRole: user.role,
      action: 'USER_MODERATED',
      entityType: 'User',
      entityId: userId,
      details: `Updated user ${targetUser.email}: Role=${targetUser.role}, Status=${targetUser.status}`,
    });

    return NextResponse.json({
      success: true,
      message: 'User updated successfully',
      data: targetUser,
    });
  } catch (error: any) {
    return NextResponse.json({ success: false, message: 'Failed to update user', error: error.message }, { status: 500 });
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const user = getUserFromRequest(request);
    if (!user || user.role !== 'admin') {
      return NextResponse.json({ success: false, message: 'Forbidden. Admin access required.' }, { status: 403 });
    }

    const { searchParams } = new URL(request.url);
    const userId = searchParams.get('userId');

    if (!userId) {
      return NextResponse.json({ success: false, message: 'User ID is required' }, { status: 400 });
    }

    // Prevent deleting oneself
    if (userId === user.userId) {
      return NextResponse.json({ success: false, message: 'You cannot delete your own admin account.' }, { status: 400 });
    }

    await connectToDatabase();

    const targetUser = await User.findById(userId);
    if (!targetUser) {
      return NextResponse.json({ success: false, message: 'User not found' }, { status: 404 });
    }

    await User.findByIdAndDelete(userId);
    await StudentProfile.deleteOne({ userId });

    await AuditLog.create({
      userId: user.userId,
      userName: user.name,
      userRole: user.role,
      action: 'USER_DELETED',
      entityType: 'User',
      entityId: userId,
      details: `Deleted user account: ${targetUser.name} (${targetUser.email})`,
    });

    return NextResponse.json({
      success: true,
      message: `User ${targetUser.name} deleted successfully`,
    });
  } catch (error: any) {
    return NextResponse.json({ success: false, message: 'Failed to delete user', error: error.message }, { status: 500 });
  }
}

