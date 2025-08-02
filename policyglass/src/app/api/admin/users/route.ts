import { NextRequest, NextResponse } from 'next/server'
import { AdminController } from '@/app/controllers/admin.controller'
import { getSession } from '@/app/lib/session'
import { z } from 'zod'

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

    const result = await AdminController.getAllUsers();

    if ('error' in result) {
      return NextResponse.json(result, { status: 500 });
    }

    return NextResponse.json(result, { status: 200 });

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

    const result = await AdminController.updateUserRole(request);

    if ('error' in result) {
      return NextResponse.json(result, { status: 500 });
    }

    // Log the role change
    // TODO: Add proper audit logging to admin controller

    return NextResponse.json(result, { status: 200 });

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
