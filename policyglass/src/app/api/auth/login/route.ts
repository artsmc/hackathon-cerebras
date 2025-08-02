import { NextRequest, NextResponse } from 'next/server';
import { AuthController } from '@/app/controllers/auth.controller';
import { z } from 'zod';

const loginSchema = z.object({
  username: z.string(),
  password: z.string(),
});

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { username, password } = loginSchema.parse(body);

    const result = await AuthController.login(request);

    if ('error' in result) {
      const status = result.error === 'Account is locked' ? 401 : 401;
      return NextResponse.json(result, { status });
    }

    return NextResponse.json(result, { status: 200 });

  } catch (error: unknown) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Invalid input data', details: error.issues },
        { status: 400 }
      );
    }

    console.error('Login error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
