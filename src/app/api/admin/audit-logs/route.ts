import { NextRequest, NextResponse } from 'next/server';
import { connectToDatabase } from '@/lib/mongodb';
import { AuditLog } from '@/lib/models';
import { getUserFromRequest } from '@/lib/auth';

export async function GET(request: NextRequest) {
  try {
    const user = getUserFromRequest(request);
    if (!user || user.role !== 'admin') {
      return NextResponse.json({ success: false, message: 'Forbidden. Admin access required.' }, { status: 403 });
    }

    await connectToDatabase();
    const { searchParams } = new URL(request.url);
    const action = searchParams.get('action');
    const limit = parseInt(searchParams.get('limit') || '50');

    const filter: any = {};
    if (action && action !== 'all') filter.action = new RegExp(action, 'i');

    const logs = await AuditLog.find(filter).sort({ createdAt: -1 }).limit(limit).lean();

    return NextResponse.json({
      success: true,
      count: logs.length,
      data: logs,
    });
  } catch (error: any) {
    return NextResponse.json({ success: false, message: 'Error fetching audit logs', error: error.message }, { status: 500 });
  }
}
