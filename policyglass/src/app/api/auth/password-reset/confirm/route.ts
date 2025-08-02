import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient } from '../../../../../generated/prisma';
import bcrypt from 'bcryptjs';
import { z } from 'zod';

const prisma = new PrismaClient();

const passwordResetConfirmSchema = z.object({
  token: z.string(),
  new_password: z.string().min(8),
});

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { token, new_password } = passwordResetConfirmSchema.parse(body);

    // Find reset request by token
    const resetRequest = await prisma.passwordResetRequest.findUnique({
      where: { reset_token: token }
    });

    if (!resetRequest) {
      return NextResponse.json(
        { error: 'Invalid reset token' },
        { status: 400 }
      );
    }

    // Check if token is expired
    if (resetRequest.expires_at < new Date()) {
      return NextResponse.json(
        { error: 'Reset token has expired' },
        { status: 400 }
      );
    }

    // Check if token has already been used
    if (resetRequest.used) {
      return NextResponse.json(
        { error: 'Reset token has already been used' },
        { status: 400 }
      );
    }

    // Check if new password is banned
    const bannedPassword = await prisma.bannedPassword.findFirst({
      where: { password: new_password }
    });

    if (bannedPassword) {
      return NextResponse.json(
        { error: 'Password is too common or banned' },
        { status: 400 }
      );
    }

    // Check password history
    const passwordHistory = await prisma.passwordHistory.findMany({
      where: { user_id: resetRequest.user_id },
      orderBy: { changed_at: 'desc' },
      take: 5, // Check last 5 passwords
    });

    for (const history of passwordHistory) {
      const isSamePassword = await bcrypt.compare(new_password, history.password_hash);
      if (isSamePassword) {
        return NextResponse.json(
          { error: 'Password cannot be the same as recent passwords' },
          { status: 400 }
        );
      }
    }

    // Hash new password
    const saltRounds = 10;
    const salt = await bcrypt.genSalt(saltRounds);
    const password_hash = await bcrypt.hash(new_password, salt);

    // Update user password
    const user = await prisma.user.update({
      where: { id: resetRequest.user_id },
      data: {
        password_hash,
        password_salt: salt,
        password_last_changed: new Date(),
        is_temp_password: false,
        account_locked: false, // Unlock account on password reset
        failed_login_attempts: 0,
      }
    });

    // Add to password history
    await prisma.passwordHistory.create({
      data: {
        user_id: user.id,
        password_hash: user.password_hash,
        password_salt: user.password_salt,
      }
    });

    // Mark reset token as used
    await prisma.passwordResetRequest.update({
      where: { id: resetRequest.id },
      data: { used: true }
    });

    // Log password reset
    await prisma.auditLog.create({
      data: {
        user_id: user.id,
        event_type: 'password_reset',
        description: 'Password reset completed successfully',
        source_ip: request.headers.get('x-forwarded-for') || request.headers.get('x-real-ip') || 'unknown',
        user_agent: request.headers.get('user-agent') || '',
      }
    });

    return NextResponse.json({
      message: 'Password reset successful',
      user: {
        id: user.id,
        username: user.username,
        email: user.email,
      }
    }, { status: 200 });

  } catch (error: unknown) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Invalid input data', details: error.issues },
        { status: 400 }
      );
    }

    console.error('Password reset confirm error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
