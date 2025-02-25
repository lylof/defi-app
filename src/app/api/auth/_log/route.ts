import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

// Types for auth logging
type AuthLogType = 'login' | 'logout' | 'register' | 'error';

interface AuthLogData {
  type: AuthLogType;
  userId?: string;
  message: string;
  metadata?: Record<string, any>;
}

/**
 * Handles authentication event logging
 * Stores auth-related events in the database for monitoring and debugging
 */
export async function POST(req: NextRequest) {
  try {
    const data: AuthLogData = await req.json();

    // Validate required fields
    if (!data.type || !data.message) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }

    // Create auth log entry
    const logEntry = await prisma.authLog.create({
      data: {
        type: data.type,
        userId: data.userId,
        message: data.message,
        metadata: data.metadata ? JSON.stringify(data.metadata) : null,
        timestamp: new Date()
      }
    });

    return NextResponse.json({ success: true, logId: logEntry.id });

  } catch (error) {
    console.error('Auth logging error:', error);
    return NextResponse.json(
      { error: 'Internal server error during auth logging' },
      { status: 500 }
    );
  }
}