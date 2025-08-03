import { AuthController } from '@/app/controllers/auth.controller';
import { z } from 'zod';
import defineRoute from '@omer-x/next-openapi-route-handler';

// Import schemas
import { PasswordResetRequestSchema, PasswordResetResponseSchema } from '@/app/lib/openapi/schemas';

export const { POST } = defineRoute({
  operationId: 'requestPasswordReset',
  method: 'POST',
  summary: 'Request password reset',
  description: 'Request a password reset token for a user account',
  tags: ['Authentication'],
  requestBody: PasswordResetRequestSchema,
  action: async ({ body }) => {
    const request = new Request('http://localhost/api/auth/password-reset/request', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body),
    });
    
    const result = await AuthController.requestPasswordReset(request as any);
    
    if ('error' in result) {
      return new Response(JSON.stringify(result), { status: 400 });
    }
    
    return new Response(JSON.stringify(result), { status: 200 });
  },
  responses: {
    200: { description: 'Password reset request processed' },
    400: { description: 'Invalid input data' },
    500: { description: 'Internal server error' },
  },
  handleErrors: (errorType, issues) => {
    switch (errorType) {
      case 'PARSE_REQUEST_BODY':
        return new Response(JSON.stringify({ error: 'Invalid input data', details: issues }), { status: 400 });
      default:
        return new Response(JSON.stringify({ error: 'Internal server error' }), { status: 500 });
    }
  }
});
