import { AuthController } from '@/app/controllers/auth.controller';
import { z } from 'zod';
import defineRoute from '@omer-x/next-openapi-route-handler';

// Import schemas
import { PasswordResetConfirmRequestSchema, PasswordResetConfirmResponseSchema } from '@/app/lib/openapi/schemas';

export const { POST } = defineRoute({
  operationId: 'confirmPasswordReset',
  method: 'POST',
  summary: 'Confirm password reset',
  description: 'Confirm password reset using a reset token and new password',
  tags: ['Authentication'],
  requestBody: PasswordResetConfirmRequestSchema,
  action: async ({ body }) => {
    const request = new Request('http://localhost/api/auth/password-reset/confirm', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body),
    });
    
    const result = await AuthController.confirmPasswordReset(request as any);
    
    if ('error' in result) {
      return new Response(JSON.stringify(result), { status: 400 });
    }
    
    return new Response(JSON.stringify(result), { status: 200 });
  },
  responses: {
    200: { description: 'Password reset confirmed successfully', content: PasswordResetConfirmResponseSchema },
    400: { description: 'Invalid input data or reset token' },
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
