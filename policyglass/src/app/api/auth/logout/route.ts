import { AuthController } from '@/app/controllers/auth.controller';
import { cookies } from 'next/headers';
import defineRoute from '@omer-x/next-openapi-route-handler';

// Import schemas
import { LogoutResponseSchema } from '@/app/lib/openapi/schemas';

export const { POST } = defineRoute({
  operationId: 'logoutUser',
  method: 'POST',
  summary: 'User logout',
  description: 'Logout the current user and invalidate their session',
  tags: ['Authentication'],
  action: async () => {
    const result = await AuthController.logout();
    
    // Delete session cookie
    const cookieStore = await cookies();
    cookieStore.delete('session');
    
    if ('error' in result) {
      return new Response(JSON.stringify(result), { status: 500 });
    }
    
    return new Response(JSON.stringify(result), { status: 200 });
  },
  responses: {
    200: { description: 'Logout successful', content: LogoutResponseSchema },
    500: { description: 'Internal server error' },
  },
});
