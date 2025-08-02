import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient } from '../../../../../generated/prisma';
import { z } from 'zod';
import { v4 as uuidv4 } from 'uuid';

const prisma = new PrismaClient();

const passwordResetRequestSchema = z.object({
  email: z.string().email(),
});

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { email } = passwordResetRequestSchema.parse(body);

    // Find user by email
    const user = await prisma.user.findUnique({
      where: { email: email }
    });

    if (!user) {
      // Don't reveal if user exists or not for security
      return NextResponse.json({
        message: 'If the email exists, a reset link has been sent'
      }, { status: 200 });
    }

    // Create password reset request
    const resetRequest = await prisma.passwordResetRequest.create({
      data: {
        user_id: user.id,
        reset_token: uuidv4(),
        expires_at: new Date(Date.now() + 24 * 60 * 60 * 1000), // 24 hours from now
      }
    });

    // Log password reset request
    await prisma.auditLog.create({
      data: {
        user_id: user.id,
        event_type: 'password_reset_request',
        description: 'Password reset requested',
        source_ip: request.headers.get('x-forwarded-for') || request.headers.get('x-real-ip') || 'unknown',
        user_agent: request.headers.get('user-agent') || '',
      }
    });

    // TODO: Send email with reset link
    // For now, we'll just return the token (in a real app, this would be sent via email)
    console.log(`Password reset token for user ${user.id}: ${resetRequest.reset_token}`);

    return NextResponse.json({
      message: 'If the email exists, a reset link has been sent'
    }, { status: 200 });

  } catch (error: unknown) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Invalid input data', details: error.issues },
        { status: 400 }
      );
    }

    console.error('Password reset request error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
