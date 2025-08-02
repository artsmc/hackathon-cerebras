import { getSession } from '@/app/lib/session';
import defineRoute from '@omer-x/next-openapi-route-handler';

// Import schemas
import { VerifyResponseSchema } from '@/app/lib/openapi/schemas';

export const { POST } = defineRoute({
  operationId: 'verifyUser',
  method: 'POST',
  summary: 'Verify user session',
  description: 'Verify if the current user has a valid session',
  tags: ['Authentication'],
  action: async () => {
    const session = await getSession();
    
    if (!session) {
      return new Response(JSON.stringify({ error: 'Unauthorized' }), { status: 401 });
    }

    return new Response(JSON.stringify({ 
      message: 'Authorized',
      user: {
        id: session.userId,
        username: session.username,
        role: session.role,
      }
    }), { status: 200 });
  },
  responses: {
    200: { description: 'Session verified', content: VerifyResponseSchema },
    401: { description: 'Unauthorized - No valid session' },
    500: { description: 'Internal server error' },
  },
});
