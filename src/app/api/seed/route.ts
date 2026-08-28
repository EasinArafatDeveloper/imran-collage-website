import { NextResponse } from 'next/server';
import { connectToDatabase } from '@/lib/mongodb';
import { 
  User, 
  StudentProfile, 
  Event, 
  EventRegistration, 
  Attendance, 
  Certificate, 
  Club, 
  Notification, 
  Feedback, 
  AuditLog,
  Gallery
} from '@/lib/models';
import { hashPassword } from '@/lib/auth';

async function handleSeed() {
  try {
    await connectToDatabase();

    // 1. Clear existing collections sequentially to avoid race condition
    await User.deleteMany({});
    await StudentProfile.deleteMany({});
    await Event.deleteMany({});
    await EventRegistration.deleteMany({});
    await Attendance.deleteMany({});
    await Certificate.deleteMany({});
    await Club.deleteMany({});
    await Notification.deleteMany({});
    await Feedback.deleteMany({});
    await AuditLog.deleteMany({});
    await Gallery.deleteMany({});

    const defaultPasswordHash = await hashPassword('password123');

    // 2. Create Core Admin User
    const adminUser = await User.create({
      name: 'University Super Admin',
      email: 'admin@university.edu',
      password: defaultPasswordHash,
      role: 'admin',
      status: 'active',
      avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=200&auto=format&fit=crop&q=80',
      emailVerified: true,
    });

    // 3. Create EXACTLY 2 Clean University Events
    const createdEvents = await Event.create([
      {
        title: 'National University Tech Fest 2026',
        slug: 'national-university-tech-fest-2026',
        shortDescription: 'The largest inter-university technology and innovation symposium in the country.',
        description: 'The largest inter-university technology and innovation symposium in the country, featuring Competitive Programming, AI Agent Hackathon, Robotics Showcases, and Tech Startup Project Showcases with top industry leaders.',
        category: 'Tech Fest',
        venue: 'University Central Auditorium & Computer Labs',
        coverImage: 'https://images.unsplash.com/photo-1540575467063-178a50c2df87?w=1200&auto=format&fit=crop&q=80',
        startAt: new Date(Date.now() + 5 * 24 * 60 * 60 * 1000), // In 5 days
        endAt: new Date(Date.now() + 6 * 24 * 60 * 60 * 1000),
        registrationDeadline: new Date(Date.now() + 4 * 24 * 60 * 60 * 1000),
        capacity: 250,
        registeredCount: 0,
        waitlistCount: 0,
        isWaitlistEnabled: true,
        registrationFee: 500,
        status: 'published',
        organizerId: adminUser._id,
        organizerName: 'University Central Authority',
        organizerEmail: adminUser.email,
        tags: ['hackathon', 'ai', 'robotics', 'programming', 'techfest'],
        agenda: [
          { time: '09:00 AM', title: 'Grand Opening & Keynote by VC', speaker: 'Vice Chancellor & Guest of Honor' },
          { time: '10:30 AM', title: '24-Hour AI Agent Hackathon Kickoff', speaker: 'Lead AI Engineer' },
          { time: '02:00 PM', title: 'Inter-University Coding Championship', speaker: 'CPC Mentors' },
          { time: '05:30 PM', title: 'Prize Giving Gala & Closing Ceremony', speaker: 'Chief Guests' },
        ],
      },
      {
        title: 'Generative AI & LLM Engineering Masterclass',
        slug: 'generative-ai-llm-engineering-masterclass',
        shortDescription: 'Hands-on masterclass on building and deploying production-grade AI agents.',
        description: 'An intensive, hands-on masterclass on building and deploying production-grade AI agents, Retrieval-Augmented Generation (RAG) pipelines, and multimodal applications with Google Gemini & modern open-source models.',
        category: 'Seminar & Tech Talk',
        venue: 'ICT Innovation Lab, Academic Building 3',
        coverImage: 'https://images.unsplash.com/photo-1591453089816-0fbb971b454c?w=1200&auto=format&fit=crop&q=80',
        startAt: new Date(Date.now() + 12 * 24 * 60 * 60 * 1000), // In 12 days
        endAt: new Date(Date.now() + 12 * 24 * 60 * 60 * 1000 + 4 * 60 * 60 * 1000),
        registrationDeadline: new Date(Date.now() + 10 * 24 * 60 * 60 * 1000),
        capacity: 100,
        registeredCount: 0,
        waitlistCount: 0,
        isWaitlistEnabled: true,
        registrationFee: 0, // Free
        status: 'published',
        organizerId: adminUser._id,
        organizerName: 'Faculty of Science & Engineering',
        organizerEmail: adminUser.email,
        tags: ['ai', 'generative-ai', 'llm', 'python', 'workshop'],
        agenda: [
          { time: '10:00 AM', title: 'Introduction to LLM Architecture & Prompt Engineering', speaker: 'AI Researcher' },
          { time: '11:30 AM', title: 'Hands-on: Building Autonomous Agents & Tools', speaker: 'Senior ML Engineer' },
          { time: '01:00 PM', title: 'Production Deployment & Evaluation', speaker: 'Industry Experts' },
        ],
      }
    ]);

    // 4. Create Initial Campus Moments & Gallery Photos
    await Gallery.create([
      {
        title: 'National University Tech Fest Opening Ceremony',
        description: 'Auditorium packed with thousands of enthusiastic students and honorable faculty guests.',
        imageUrl: 'https://images.unsplash.com/photo-1540575467063-178a50c2df87?w=1200&auto=format&fit=crop&q=80',
        category: 'Tech Fest',
        eventName: 'National University Tech Fest 2026',
        eventDate: new Date(),
        uploadedBy: 'University Admin',
      },
      {
        title: '24-Hour AI Agent Hackathon Brainstorming',
        description: 'Teams collaborating and building innovative full-stack solutions overnight.',
        imageUrl: 'https://images.unsplash.com/photo-1522071820081-009f0129c71c?w=1200&auto=format&fit=crop&q=80',
        category: 'Workshop',
        eventName: 'Generative AI & LLM Masterclass',
        eventDate: new Date(),
        uploadedBy: 'University Admin',
      },
      {
        title: 'Annual Cultural Festival & Music Night',
        description: 'Mesmerizing musical performances and cultural dance by university students.',
        imageUrl: 'https://images.unsplash.com/photo-1514525253161-7a46d19cd819?w=1200&auto=format&fit=crop&q=80',
        category: 'Cultural',
        eventName: 'Spring Cultural Gala',
        eventDate: new Date(),
        uploadedBy: 'University Admin',
      },
      {
        title: 'Champions of Inter-University Programming Contest',
        description: 'Winners receiving trophies and prize money on stage from the Vice Chancellor.',
        imageUrl: 'https://images.unsplash.com/photo-1511578314322-379afb476865?w=1200&auto=format&fit=crop&q=80',
        category: 'Tech Fest',
        eventName: 'Coding Championship 2026',
        eventDate: new Date(),
        uploadedBy: 'University Admin',
      },
      {
        title: 'University Annual Sports & Football Tournament',
        description: 'Thrilling final match between CSE and BBA departments at the university stadium.',
        imageUrl: 'https://images.unsplash.com/photo-1508098682722-e99c43a406b2?w=1200&auto=format&fit=crop&q=80',
        category: 'Sports',
        eventName: 'Inter-Department Football Tournament',
        eventDate: new Date(),
        uploadedBy: 'University Admin',
      },
      {
        title: 'Robotics & Hardware Exhibition Showcase',
        description: 'Autonomous drones and IoT prototypes presented by engineering students.',
        imageUrl: 'https://images.unsplash.com/photo-1485827404703-89b55fcc595e?w=1200&auto=format&fit=crop&q=80',
        category: 'Workshop',
        eventName: 'Robotics Expo 2026',
        eventDate: new Date(),
        uploadedBy: 'University Admin',
      }
    ]);

    // 5. Initial Audit Log
    await AuditLog.create({
      userId: adminUser._id,
      userName: adminUser.name,
      userRole: adminUser.role,
      action: 'SYSTEM_INITIALIZED',
      entityType: 'System',
      entityId: adminUser._id.toString(),
      details: 'Clean database initialized with Admin and 2 featured university events.',
    });

    return NextResponse.json({
      success: true,
      message: 'Database initialized cleanly with Admin, 2 events, and campus photo gallery!',
      demoAccounts: {
        admin: { email: 'admin@university.edu', password: 'password123', role: 'admin' },
      },
      stats: {
        users: 1,
        clubs: 0,
        events: createdEvents.length,
        galleryPhotos: 6,
      },
    });
  } catch (error: any) {
    console.error('Database seed error:', error);
    return NextResponse.json(
      { success: false, message: 'Failed to seed database', error: error.message },
      { status: 500 }
    );
  }
}

export async function GET() {
  return handleSeed();
}

export async function POST() {
  return handleSeed();
}

