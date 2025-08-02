import { NextRequest, NextResponse } from 'next/server';
import { AuthController } from '@/app/controllers/auth.controller';
import { cookies } from 'next/headers';

export async function POST(request: NextRequest) {
  try {
    const result = await AuthController.logout(request);

    // Delete session cookie
    const cookieStore = await cookies();
    cookieStore.delete('session');

    if ('error' in result) {
      return NextResponse.json(result, { status: 500 });
    }

    return NextResponse.json(result, { status: 200 });

  } catch (error: unknown) {
    console.error('Logout error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
