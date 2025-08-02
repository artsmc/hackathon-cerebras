import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient } from '../../../../generated/prisma';
import { decrypt } from '@/app/lib/session';
import { cookies } from 'next/headers';

const prisma = new PrismaClient();

export async function POST(request: NextRequest) {
  try {
    // Get the session from cookies
    const sessionCookie = request.cookies.get('session')?.value;
    
    // Decrypt the session to get user information
    const decryptedSession = await decrypt(sessionCookie);
    const userId = decryptedSession?.userId;

    // Delete session cookie first
    const cookieStore = await cookies();
    cookieStore.delete('session');

    // If we have user info, find and invalidate the session in database
    if (userId) {
      const session = await prisma.session.findFirst({
        where: {
          user_id: userId,
          valid: true,
        },
        orderBy: {
          last_activity: 'desc'
        }
      });

      if (session) {
        await prisma.session.update({
          where: { id: session.id },
          data: {
            valid: false,
            terminated_at: new Date(),
          }
        });

        await prisma.auditLog.create({
          data: {
            user_id: userId,
            event_type: 'logout',
            description: 'User logged out successfully',
            source_ip: request.headers.get('x-forwarded-for') || request.headers.get('x-real-ip') || 'unknown',
            user_agent: request.headers.get('user-agent') || '',
          }
        });
      }
    }

    return NextResponse.json({
      message: 'Logout successful',
    }, { status: 200 });

  } catch (error: unknown) {
    console.error('Logout error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
