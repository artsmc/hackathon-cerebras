import { AdminController } from '@/app/controllers/admin.controller';
import { getSession } from '@/app/lib/session';
// import { z } from 'zod';
import defineRoute from '@omer-x/next-openapi-route-handler';
import { NextRequest } from 'next/server';

// Import schemas
import { 
  UpdateUserRoleRequestSchema, 
   
} from '@/app/lib/openapi/schemas';

// GET - Get all users (admin only)
export const { GET } = defineRoute({
  operationId: 'getAllUsers',
  method: 'GET',
  summary: 'Get all users',
  description: 'Retrieve a list of all users (admin only)',
  tags: ['Admin'],
  action: async () => {
    const session = await getSession();
    
    // Check if user is admin
    if (!session || session.role !== 'admin') {
      return new Response(JSON.stringify({ error: 'Unauthorized access' }), { status: 403 });
    }

    // const request = new Request('http://localhost/api/admin/users', {
    //   method: 'GET',
    //   headers: { 'Content-Type': 'application/json' },
    // });
    
    const result = await AdminController.getAllUsers();
    
    if ('error' in result) {
      return new Response(JSON.stringify(result), { status: 500 });
    }
    
    return new Response(JSON.stringify(result), { status: 200 });
  },
  responses: {
    200: { description: 'Users retrieved successfully' },
    403: { description: 'Forbidden - Admin access required' },
    500: { description: 'Internal server error' },
  },
});

// PUT - Update user role (admin only)
export const { PUT } = defineRoute({
  operationId: 'updateUserRole',
  method: 'PUT',
  summary: 'Update user role',
  description: 'Update a user\'s role (admin only)',
  tags: ['Admin'],
  requestBody: UpdateUserRoleRequestSchema,
  action: async ({ body }) => {
    const session = await getSession();
    
    // Check if user is admin
    if (!session || session.role !== 'admin') {
      return new Response(JSON.stringify({ error: 'Unauthorized access' }), { status: 403 });
    }

    // Prevent admin from removing their own admin role
    if (session.userId === body.userId && body.role !== 'admin') {
      return new Response(JSON.stringify({ error: 'Cannot remove your own admin role' }), { status: 400 });
    }

    const request = new NextRequest('http://localhost/api/admin/users', {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body),
    });
    
    const result = await AdminController.updateUserRole(request);
    
    if ('error' in result) {
      return new Response(JSON.stringify(result), { status: 500 });
    }
    
    return new Response(JSON.stringify(result), { status: 200 });
  },
  responses: {
    200: { description: 'User role updated successfully' },
    400: { description: 'Invalid input data or cannot remove own admin role' },
    403: { description: 'Forbidden - Admin access required' },
    500: { description: 'Internal server error' },
  },
});
