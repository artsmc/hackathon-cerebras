import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient } from '../../../../generated/prisma';
import bcrypt from 'bcryptjs';
import { z, ZodError } from 'zod';
import { createSession } from '@/app/lib/session';

const prisma = new PrismaClient();

const registerSchema = z.object({
  username: z.string().min(3).max(255),
  email: z.string().email(),
  password: z.string().min(8),
});

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { username, email, password } = registerSchema.parse(body);

    // Check if user already exists
    const existingUser = await prisma.user.findFirst({
      where: {
        OR: [
          { username: username },
          { email: email }
        ]
      }
    });

    if (existingUser) {
      return NextResponse.json(
        { error: 'User with this username or email already exists' },
        { status: 400 }
      );
    }

    // Check if password is banned
    const bannedPassword = await prisma.bannedPassword.findFirst({
      where: {
        password: password
      }
    });

    if (bannedPassword) {
      return NextResponse.json(
        { error: 'Password is too common or banned' },
        { status: 400 }
      );
    }

    // Hash password
    const saltRounds = 10;
    const salt = await bcrypt.genSalt(saltRounds);
    const password_hash = await bcrypt.hash(password, salt);

    // Create user
    const user = await prisma.user.create({
      data: {
        username,
        email,
        password_hash,
        password_salt: salt,
        role: 'user', // Default role
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

    // Create session for automatic login
    await createSession(user.id, user.username, user.role);

    return NextResponse.json({
      message: 'User registered successfully',
      user: {
        id: user.id,
        username: user.username,
        email: user.email,
        role: user.role,
      }
    }, { status: 201 });

  } catch (error: unknown) {
    if (error instanceof ZodError) {
      return NextResponse.json(
        { error: 'Invalid input data', details: error.issues },
        { status: 400 }
      );
    }

    console.error('Registration error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
