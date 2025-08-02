import { NextRequest, NextResponse } from 'next/server';
import { AuthController } from '@/app/controllers/auth.controller';
import { z } from 'zod';

const passwordResetRequestSchema = z.object({
  email: z.string().email(),
});

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    passwordResetRequestSchema.parse(body);

    const result = await AuthController.requestPasswordReset(request);

    if ('error' in result) {
      return NextResponse.json(result, { status: 400 });
    }

    return NextResponse.json(result, { status: 200 });

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
