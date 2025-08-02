import generateOpenApiSpec from '@omer-x/next-openapi-json-generator';
import { NextResponse } from 'next/server';

// Import schemas to include in the OpenAPI spec
import { 
  UserSchema,
  LoginRequestSchema,
  LoginResponseSchema,
  RegisterRequestSchema,
  RegisterResponseSchema,
  LogoutResponseSchema,
  VerifyResponseSchema,
  PasswordResetRequestSchema,
  PasswordResetResponseSchema,
  PasswordResetConfirmRequestSchema,
  PasswordResetConfirmResponseSchema,
  UpdateUserRoleRequestSchema,
  UpdateUserRoleResponseSchema,
  GetAllUsersResponseSchema
} from '@/app/lib/openapi/schemas';

const openApiSpec = await generateOpenApiSpec({
  User: UserSchema,
  LoginRequest: LoginRequestSchema,
  LoginResponse: LoginResponseSchema,
  RegisterRequest: RegisterRequestSchema,
  RegisterResponse: RegisterResponseSchema,
  LogoutResponse: LogoutResponseSchema,
  VerifyResponse: VerifyResponseSchema,
  PasswordResetRequest: PasswordResetRequestSchema,
  PasswordResetResponse: PasswordResetResponseSchema,
  PasswordResetConfirmRequest: PasswordResetConfirmRequestSchema,
  PasswordResetConfirmResponse: PasswordResetConfirmResponseSchema,
  UpdateUserRoleRequest: UpdateUserRoleRequestSchema,
  UpdateUserRoleResponse: UpdateUserRoleResponseSchema,
  GetAllUsersResponse: GetAllUsersResponseSchema,
}, {
  info: {
    title: 'PolicyGlass API Documentation',
    version: '1.0.0',
    description: 'Comprehensive API documentation for the PolicyGlass application',
  },
  servers: [
    {
      url: 'http://localhost:3000/api',
      description: 'Development server',
    },
  ],
});

export async function GET() {
  return NextResponse.json(openApiSpec);
}
