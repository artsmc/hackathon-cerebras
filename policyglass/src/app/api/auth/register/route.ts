import { AuthController } from '@/app/controllers/auth.controller';
import defineRoute from '@omer-x/next-openapi-route-handler';
import { NextRequest } from 'next/server';

// Import schemas
import { RegisterRequestSchema } from '@/app/lib/openapi/schemas';

export const { POST } = defineRoute({
  operationId: 'registerUser',
  method: 'POST',
  summary: 'User registration',
  description: 'Register a new user with username, email, and password',
  tags: ['Authentication'],
  requestBody: RegisterRequestSchema,
  action: async ({ body }) => {
    const request = new NextRequest('http://localhost/api/auth/register', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body),
    });
    
    const result = await AuthController.register(request);
    
    if ('error' in result) {
      return new Response(JSON.stringify(result), { status: 400 });
    }
    
    return new Response(JSON.stringify(result), { status: 201 });
  },
  responses: {
    200: { description: 'Registration successful' },
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
