import { z } from 'zod';

// User schema
export const UserSchema = z.object({
  id: z.number().describe('Unique identifier of the user'),
  username: z.string().describe('Username of the user'),
  email: z.string().email().describe('Email address of the user'),
  role: z.string().describe('Role of the user (user, admin)'),
});

// Login request schema
export const LoginRequestSchema = z.object({
  username: z.string().describe('Username or email for login'),
  password: z.string().describe('Password for login'),
});

// Login response schema
export const LoginResponseSchema = z.object({
  message: z.string().optional().describe('Success message'),
  user: UserSchema.optional(),
  error: z.string().optional().describe('Error message'),
});

// Register request schema
export const RegisterRequestSchema = z.object({
  username: z.string().describe('Desired username'),
  email: z.string().email().describe('Email address'),
  password: z.string().describe('Password'),
});

// Register response schema
export const RegisterResponseSchema = z.object({
  message: z.string().optional().describe('Success message'),
  user: UserSchema.optional(),
  error: z.string().optional().describe('Error message'),
});

// Logout response schema
export const LogoutResponseSchema = z.object({
  message: z.string().optional().describe('Logout success message'),
  error: z.string().optional().describe('Error message'),
});

// Verify response schema
export const VerifyResponseSchema = z.object({
  message: z.string().optional().describe('Verification status message'),
  user: z.object({
    id: z.number().describe('User ID'),
    username: z.string().describe('Username'),
    role: z.string().describe('User role'),
  }).optional(),
  error: z.string().optional().describe('Error message'),
});

// Password reset request schema
export const PasswordResetRequestSchema = z.object({
  email: z.string().email().describe('Email address for password reset'),
});

// Password reset response schema
export const PasswordResetResponseSchema = z.object({
  message: z.string().describe('Password reset status message'),
  error: z.string().optional().describe('Error message'),
});

// Password reset confirm request schema
export const PasswordResetConfirmRequestSchema = z.object({
  token: z.string().describe('Password reset token'),
  new_password: z.string().describe('New password'),
});

// Password reset confirm response schema
export const PasswordResetConfirmResponseSchema = z.object({
  message: z.string().describe('Password reset confirmation message'),
  user: UserSchema.optional(),
  error: z.string().optional().describe('Error message'),
});

// Update user role request schema
export const UpdateUserRoleRequestSchema = z.object({
  userId: z.number().describe('ID of the user to update'),
  role: z.string().describe('New role for the user'),
});

// Update user role response schema
export const UpdateUserRoleResponseSchema = z.object({
  user: UserSchema.optional(),
  error: z.string().optional().describe('Error message'),
});

// Get all users response schema
export const GetAllUsersResponseSchema = z.object({
  users: z.array(UserSchema).describe('List of all users'),
  error: z.string().optional().describe('Error message'),
});
