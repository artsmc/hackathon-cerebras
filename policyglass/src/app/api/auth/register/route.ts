import { NextRequest, NextResponse } from 'next/server';
import { AuthController } from '@/app/controllers/auth.controller';
import { z, ZodError } from 'zod';

const registerSchema = z.object({
  username: z.string().min(3).max(255),
  email: z.string().email(),
  password: z.string().min(8),
});

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    registerSchema.parse(body);

    const result = await AuthController.register(request);

    if ('error' in result) {
      const status = result.error === 'User with this username or email already exists' ? 400 : 400;
      return NextResponse.json(result, { status });
    }

    return NextResponse.json(result, { status: 201 });

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
