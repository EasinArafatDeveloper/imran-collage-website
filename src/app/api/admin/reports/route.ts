import { NextRequest, NextResponse } from 'next/server';
import { connectToDatabase } from '@/lib/mongodb';
import { User, Event, EventRegistration, Attendance, Certificate, Club } from '@/lib/models';
import { getUserFromRequest } from '@/lib/auth';

export async function GET(request: NextRequest) {
  try {
    const user = getUserFromRequest(request);
    if (!user || !['admin', 'organizer'].includes(user.role)) {
      return NextResponse.json({ success: false, message: 'Forbidden' }, { status: 403 });
    }

    await connectToDatabase();

    const [
      totalUsers,
      totalStudents,
      totalEvents,
      activeEvents,
      totalRegistrations,
      totalAttended,
      totalCertificates,
      totalClubs,
      registrations,
    ] = await Promise.all([
      User.countDocuments(),
      User.countDocuments({ role: 'student' }),
      Event.countDocuments(),
      Event.countDocuments({ status: { $in: ['published', 'approved'] } }),
      EventRegistration.countDocuments({ status: { $in: ['registered', 'attended'] } }),
      Attendance.countDocuments(),
      Certificate.countDocuments(),
      Club.countDocuments({ status: 'active' }),
      EventRegistration.find().select('department status registeredAt amountPaid').lean(),
    ]);

    // Department breakdown
    const deptCounts: Record<string, number> = {};
    let totalRevenue = 0;
    registrations.forEach(r => {
      const d = r.department || 'General';
      deptCounts[d] = (deptCounts[d] || 0) + 1;
      if (r.amountPaid) totalRevenue += r.amountPaid;
    });

    const departmentStats = Object.entries(deptCounts).map(([department, count]) => ({
      department,
      count,
      percentage: totalRegistrations > 0 ? ((count / totalRegistrations) * 100).toFixed(1) : 0,
    }));

    const attendanceRate = totalRegistrations > 0 
      ? ((totalAttended / totalRegistrations) * 100).toFixed(1) 
      : '0';

    return NextResponse.json({
      success: true,
      kpis: {
        totalStudents,
        totalEvents,
        activeEvents,
        totalRegistrations,
        totalAttended,
        attendanceRate: `${attendanceRate}%`,
        totalCertificates,
        totalClubs,
        totalRevenue: `৳ ${totalRevenue.toLocaleString()}`,
      },
      departmentStats,
    });
  } catch (error: any) {
    return NextResponse.json({ success: false, message: 'Failed to generate report', error: error.message }, { status: 500 });
  }
}
