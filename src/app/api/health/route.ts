import { NextResponse } from 'next/server';
import mongoose from 'mongoose';
import { connectToDatabase } from '@/lib/mongodb';

export async function GET() {
  const hasUri = Boolean(process.env.MONGODB_URI);
  const uriSnippet = process.env.MONGODB_URI
    ? `${process.env.MONGODB_URI.slice(0, 20)}...`
    : 'MISSING';

  try {
    const start = Date.now();
    await connectToDatabase();
    const duration = Date.now() - start;

    return NextResponse.json({
      status: 'healthy',
      connected: true,
      databaseState: mongoose.connection.readyState, // 1 = connected
      pingMs: duration,
      hasUri,
      uriSnippet,
      message: 'MongoDB Atlas is connected successfully!',
    });
  } catch (error: any) {
    return NextResponse.json(
      {
        status: 'unhealthy',
        connected: false,
        hasUri,
        uriSnippet,
        errorName: error.name,
        errorMessage: error.message,
        hint: error.message?.includes('buffering timed out') || error.message?.includes('Server selection')
          ? 'MongoDB Atlas Network Access issue: Please allow IP 0.0.0.0/0 in MongoDB Atlas dashboard under Network Access.'
          : 'Check your MONGODB_URI username, password, and database cluster.',
      },
      { status: 500 }
    );
  }
}
