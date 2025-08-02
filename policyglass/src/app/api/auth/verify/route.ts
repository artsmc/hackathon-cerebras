import { NextRequest, NextResponse } from 'next/server'
import { getSession } from '@/app/lib/session'

export async function POST(request: NextRequest) {
  try {
    const session = await getSession()
    
    if (!session) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    return NextResponse.json(
      { 
        message: 'Authorized',
        user: {
          id: session.userId,
          username: session.username,
          role: session.role,
        }
      },
      { status: 200 }
    )
  } catch (error) {
    console.error('Verification error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
