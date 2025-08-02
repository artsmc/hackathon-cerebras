import { NextRequest, NextResponse } from 'next/server'
import { PrismaClient } from '../../../../generated/prisma'
import { getSession } from '@/app/lib/session'
import { z } from 'zod'

const prisma = new PrismaClient()

// Schema for updating user roles
const updateUserRoleSchema = z.object({
  userId: z.number(),
  role: z.string(),
})

// GET - Get all users (admin only)
export async function GET(request: NextRequest) {
  try {
    const session = await getSession()
    
    // Check if user is admin
    if (!session || session.role !== 'admin') {
      return NextResponse.json(
        { error: 'Unauthorized access' },
        { status: 403 }
      )
    }

    // Get all users
    const users = await prisma.user.findMany({
      select: {
        id: true,
        username: true,
        email: true,
        role: true,
        created_at: true,
        last_successful_login: true,
        account_locked: true,
      },
      orderBy: {
        created_at: 'desc',
      }
    })

    return NextResponse.json({ users }, { status: 200 })
  } catch (error) {
    console.error('Error fetching users:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

// PUT - Update user role (admin only)
export async function PUT(request: NextRequest) {
  try {
    const session = await getSession()
    
    // Check if user is admin
    if (!session || session.role !== 'admin') {
      return NextResponse.json(
        { error: 'Unauthorized access' },
        { status: 403 }
      )
    }

    const body = await request.json()
    const { userId, role } = updateUserRoleSchema.parse(body)

    // Prevent admin from removing their own admin role
    if (session.userId === userId && role !== 'admin') {
      return NextResponse.json(
        { error: 'Cannot remove your own admin role' },
        { status: 400 }
      )
    }

    // Update user role
    const updatedUser = await prisma.user.update({
      where: { id: userId },
      data: { role },
      select: {
        id: true,
        username: true,
        email: true,
        role: true,
      }
    })

    // Log the role change
    await prisma.auditLog.create({
      data: {
        user_id: session.userId,
        event_type: 'role_change',
        description: `Changed user ${updatedUser.username} role to ${role}`,
        source_ip: request.headers.get('x-forwarded-for') || request.headers.get('x-real-ip') || 'unknown',
        user_agent: request.headers.get('user-agent') || '',
      }
    })

    return NextResponse.json({ user: updatedUser }, { status: 200 })
  } catch (error: unknown) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Invalid input data', details: error.issues },
        { status: 400 }
      )
    }

    console.error('Error updating user role:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
