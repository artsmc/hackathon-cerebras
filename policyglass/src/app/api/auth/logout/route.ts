import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient } from '../../../../generated/prisma';
import { z } from 'zod';

const prisma = new PrismaClient();

const logoutSchema = z.object({
  token: z.string(),
});

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { token } = logoutSchema.parse(body);

    // Find and invalidate the session
    const session = await prisma.session.findFirst({
      where: {
        jwt_token: token,
      }
    });

    if (!session) {
      return NextResponse.json(
        { error: 'Invalid session token' },
        { status: 401 }
      );
    }

    // Invalidate the session
    await prisma.session.update({
      where: { id: session.id },
      data: {
        valid: false,
        terminated_at: new Date(),
      }
    });

    // Log logout event
    await prisma.auditLog.create({
      data: {
        user_id: session.user_id,
        event_type: 'logout',
        description: 'User logged out successfully',
        source_ip: request.headers.get('x-forwarded-for') || request.headers.get('x-real-ip') || 'unknown',
        user_agent: request.headers.get('user-agent') || '',
      }
    });

    return NextResponse.json({
      message: 'Logout successful',
    }, { status: 200 });

  } catch (error: unknown) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Invalid input data', details: error.issues },
        { status: 400 }
      );
    }

    console.error('Logout error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
