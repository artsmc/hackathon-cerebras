import { AuthController } from '@/app/controllers/auth.controller';
import { z } from 'zod';
import defineRoute from '@omer-x/next-openapi-route-handler';

// Import schemas
import { LoginRequestSchema, LoginResponseSchema } from '@/app/lib/openapi/schemas';

export const { POST } = defineRoute({
  operationId: 'loginUser',
  method: 'POST',
  summary: 'User login',
  description: 'Authenticate a user with username/email and password',
  tags: ['Authentication'],
  requestBody: LoginRequestSchema,
  action: async ({ body }) => {
    const request = new Request('http://localhost/api/auth/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body),
    });
    
    const result = await AuthController.login(request as any);
    
    if ('error' in result) {
      const status = result.error === 'Account is locked' ? 401 : 401;
      return new Response(JSON.stringify(result), { status });
    }
    
    return new Response(JSON.stringify(result), { status: 200 });
  },
  responses: {
    200: { description: 'Login successful' },
    400: { description: 'Invalid credentials' },
    401: { description: 'Unauthorized - Email not verified' },
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
