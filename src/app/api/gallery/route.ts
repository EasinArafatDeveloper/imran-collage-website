import { NextRequest, NextResponse } from 'next/server';
import { connectToDatabase } from '@/lib/mongodb';
import { Gallery, AuditLog } from '@/lib/models';
import { getUserFromRequest } from '@/lib/auth';

export async function GET(request: NextRequest) {
  try {
    await connectToDatabase();
    const { searchParams } = new URL(request.url);
    const category = searchParams.get('category');
    const limit = parseInt(searchParams.get('limit') || '50', 10);

    const filter: any = {};
    if (category && category !== 'all') {
      filter.category = category;
    }

    const items = await Gallery.find(filter)
      .sort({ createdAt: -1 })
      .limit(limit)
      .lean();

    return NextResponse.json({
      success: true,
      count: items.length,
      data: items,
    });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, message: 'Failed to fetch gallery items', error: error.message },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const user = getUserFromRequest(request);
    if (!user || user.role !== 'admin') {
      return NextResponse.json(
        { success: false, message: 'Forbidden. Admin access required.' },
        { status: 403 }
      );
    }

    const body = await request.json();
    const { title, description, imageUrl, category = 'Campus Life', eventName, eventDate } = body;

    if (!title || !imageUrl) {
      return NextResponse.json(
        { success: false, message: 'Title and Image URL are required.' },
        { status: 400 }
      );
    }

    await connectToDatabase();

    const newPhoto = await Gallery.create({
      title: title.trim(),
      description: description?.trim() || '',
      imageUrl: imageUrl.trim(),
      category: category.trim(),
      eventName: eventName?.trim() || '',
      eventDate: eventDate ? new Date(eventDate) : new Date(),
      uploadedBy: user.name,
    });

    await AuditLog.create({
      userId: user.userId,
      userName: user.name,
      userRole: user.role,
      action: 'GALLERY_IMAGE_ADDED',
      entityType: 'Gallery',
      entityId: newPhoto._id.toString(),
      details: `Added new photo to gallery: "${newPhoto.title}"`,
    });

    return NextResponse.json({
      success: true,
      message: 'Photo added to gallery successfully',
      data: newPhoto,
    });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, message: 'Failed to add photo', error: error.message },
      { status: 500 }
    );
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const user = getUserFromRequest(request);
    if (!user || user.role !== 'admin') {
      return NextResponse.json(
        { success: false, message: 'Forbidden. Admin access required.' },
        { status: 403 }
      );
    }

    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');

    if (!id) {
      return NextResponse.json(
        { success: false, message: 'Gallery item ID is required.' },
        { status: 400 }
      );
    }

    await connectToDatabase();

    const photo = await Gallery.findByIdAndDelete(id);
    if (!photo) {
      return NextResponse.json(
        { success: false, message: 'Photo not found.' },
        { status: 404 }
      );
    }

    await AuditLog.create({
      userId: user.userId,
      userName: user.name,
      userRole: user.role,
      action: 'GALLERY_IMAGE_DELETED',
      entityType: 'Gallery',
      entityId: id,
      details: `Deleted gallery photo: "${photo.title}"`,
    });

    return NextResponse.json({
      success: true,
      message: 'Photo deleted from gallery successfully',
    });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, message: 'Failed to delete photo', error: error.message },
      { status: 500 }
    );
  }
}
