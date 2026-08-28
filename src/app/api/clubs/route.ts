import { NextRequest, NextResponse } from 'next/server';
import { connectToDatabase } from '@/lib/mongodb';
import { Club, AuditLog } from '@/lib/models';
import { getUserFromRequest } from '@/lib/auth';
import { slugify } from '@/lib/utils';

export async function GET() {
  try {
    await connectToDatabase();
    const clubs = await Club.find({ status: 'active' }).sort({ memberCount: -1 }).lean();
    return NextResponse.json({ success: true, count: clubs.length, data: clubs });
  } catch (error: any) {
    return NextResponse.json({ success: false, message: 'Failed to fetch clubs', error: error.message }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const user = getUserFromRequest(request);
    if (!user || user.role !== 'admin') {
      return NextResponse.json({ success: false, message: 'Forbidden. Admin only.' }, { status: 403 });
    }

    const body = await request.json();
    const { name, description, category, logo, coverImage, department, establishedYear, presidentName, presidentEmail, contactEmail, socialLinks } = body;

    if (!name || !description || !presidentName) {
      return NextResponse.json({ success: false, message: 'Club name, description and president name required' }, { status: 400 });
    }

    await connectToDatabase();
    const slug = slugify(name);

    const club = await Club.create({
      name,
      slug,
      description,
      category: category || 'Technology',
      logo: logo || 'https://images.unsplash.com/photo-1526374965328-7f61d4dc18c5?w=200&auto=format&fit=crop&q=80',
      coverImage,
      department,
      establishedYear: establishedYear || new Date().getFullYear(),
      presidentName,
      presidentEmail: presidentEmail || user.email,
      contactEmail: contactEmail || user.email,
      memberCount: 1,
      socialLinks,
      status: 'active',
    });

    await AuditLog.create({
      userId: user.userId,
      userName: user.name,
      userRole: user.role,
      action: 'CLUB_CREATED',
      entityType: 'Club',
      entityId: club._id.toString(),
      details: `Created new student club: ${club.name}`,
    });

    return NextResponse.json({ success: true, message: 'Club created successfully', data: club });
  } catch (error: any) {
    return NextResponse.json({ success: false, message: 'Failed to create club', error: error.message }, { status: 500 });
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const user = getUserFromRequest(request);
    if (!user || user.role !== 'admin') {
      return NextResponse.json({ success: false, message: 'Forbidden. Admin only.' }, { status: 403 });
    }

    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');

    if (!id) {
      return NextResponse.json({ success: false, message: 'Club ID is required' }, { status: 400 });
    }

    await connectToDatabase();
    const club = await Club.findByIdAndDelete(id);
    if (!club) {
      return NextResponse.json({ success: false, message: 'Club not found' }, { status: 404 });
    }

    await AuditLog.create({
      userId: user.userId,
      userName: user.name,
      userRole: user.role,
      action: 'CLUB_DELETED',
      entityType: 'Club',
      entityId: id,
      details: `Deleted club: ${club.name}`,
    });

    return NextResponse.json({ success: true, message: 'Club deleted successfully' });
  } catch (error: any) {
    return NextResponse.json({ success: false, message: 'Failed to delete club', error: error.message }, { status: 500 });
  }
}
