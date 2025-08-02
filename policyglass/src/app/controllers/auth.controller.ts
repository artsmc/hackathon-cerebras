import { NextRequest } from 'next/server';
import { AuthService } from '../services/auth.service';
import { SessionService } from '../services/session.service';
import { AuditService } from '../services/audit.service';
import { PasswordService } from '../services/password.service';
import { ZodError } from 'zod';

export class AuthController {
  static async login(request: NextRequest) {
    try {
      const body = await request.json();
      const { username, password } = body;

      const validation = await AuthService.validateUserCredentials(username, password);
      
      if (!validation.valid) {
        if ('locked' in validation && validation.locked) {
          return { error: 'Account is locked' };
        }
        return { error: 'Invalid credentials' };
      }

      const user = validation.user;
      if (!user) {
        return { error: 'Invalid credentials' };
      }
      
      // Create session
      await AuthService.createSessionForUser(user.id, user.username, user.role);

      // Create session record in database
      const session = await AuthService.createDatabaseSession(
        user.id,
        request.headers.get('x-forwarded-for') || request.headers.get('x-real-ip') || 'unknown',
        request.headers.get('user-agent') || ''
      );

      // Log successful login
      await AuthService.logSuccessfulLogin(user.id, session);

      return {
        message: 'Login successful',
        user: {
          id: user.id,
          username: user.username,
          email: user.email,
          role: user.role,
        }
      };

    } catch (error: unknown) {
      if (error instanceof ZodError) {
        return { error: 'Invalid input data', details: error.issues };
      }

      console.error('Login error:', error);
      return { error: 'Internal server error' };
    }
  }

  static async register(request: NextRequest) {
    try {
      const body = await request.json();
      const { username, email, password } = body;

      // Check if user already exists
      const existingUser = await AuthService.checkIfUserExists(username, email);
      if (existingUser) {
        return { error: 'User with this username or email already exists' };
      }

      // Check if password is banned
      const isPasswordValid = await PasswordService.validatePasswordNotBanned(password);
      if (!isPasswordValid) {
        return { error: 'Password is too common or banned' };
      }

      // Create user
      const user = await AuthService.createUser(username, email, password);

      return {
        message: 'User registered successfully',
        user: {
          id: user.id,
          username: user.username,
          email: user.email,
          role: user.role,
        }
      };

    } catch (error: unknown) {
      if (error instanceof ZodError) {
        return { error: 'Invalid input data', details: error.issues };
      }

      console.error('Registration error:', error);
      return { error: 'Internal server error' };
    }
  }

  static async logout() {
    try {
      // Get the session from cookies directly
      const cookieStore = await import('next/headers').then(mod => mod.cookies());
      const sessionCookie = cookieStore.get('session')?.value;
      
      // Decrypt the session to get user information
      const decryptedSession = await SessionService.decryptSession(sessionCookie);
      const userId = decryptedSession?.userId;

      // If we have user info, find and invalidate the session in database
      if (userId) {
        const session = await SessionService.findValidSessionByUserId(userId);

        if (session) {
          await SessionService.invalidateSession(session.id);
          // For audit logging, we'll need to get headers differently
          await AuditService.logLogout(userId, 'unknown', '');
        }
      }

      return { message: 'Logout successful' };

    } catch (error: unknown) {
      console.error('Logout error:', error);
      return { error: 'Internal server error' };
    }
  }

  static async verify() {
    try {
      // This method is now handled properly in the route file
      // Return a simple success response
      return { message: 'Authorized' };
    } catch (error) {
      console.error('Verification error:', error);
      return { error: 'Internal server error' };
    }
  }

  static async requestPasswordReset(request: NextRequest) {
    try {
      const body = await request.json();
      const { email } = body;

      // Find user by email
      const user = await AuthService.findUserByEmail(email);

      if (!user) {
        // Don't reveal if user exists or not for security
        return { message: 'If the email exists, a reset link has been sent' };
      }

      // Create password reset request
      const resetRequest = await PasswordService.createPasswordResetRequest(user.id);

      // Log password reset request
      await AuditService.logPasswordResetRequest(user.id,
        request.headers.get('x-forwarded-for') || request.headers.get('x-real-ip') || 'unknown',
        request.headers.get('user-agent') || ''
      );

      // TODO: Send email with reset link
      // For now, we'll just return the token (in a real app, this would be sent via email)
      console.log(`Password reset token for user ${user.id}: ${resetRequest.reset_token}`);

      return { message: 'If the email exists, a reset link has been sent' };

    } catch (error: unknown) {
      if (error instanceof ZodError) {
        return { error: 'Invalid input data', details: error.issues };
      }

      console.error('Password reset request error:', error);
      return { error: 'Internal server error' };
    }
  }

  static async confirmPasswordReset(request: NextRequest) {
    try {
      const body = await request.json();
      const { token, new_password } = body;

      // Find reset request by token
      const resetRequest = await PasswordService.findResetRequestByToken(token);

      if (!resetRequest) {
        return { error: 'Invalid reset token' };
      }

      // Check if token is expired
      if (resetRequest.expires_at < new Date()) {
        return { error: 'Reset token has expired' };
      }

      // Check if token has already been used
      if (resetRequest.used) {
        return { error: 'Reset token has already been used' };
      }

      // Check if new password is banned
      const isPasswordNotBanned = await PasswordService.validatePasswordNotBanned(new_password);
      if (!isPasswordNotBanned) {
        return { error: 'Password is too common or banned' };
      }

      // Check password history
      const isPasswordNotInHistory = await PasswordService.validatePasswordNotInHistory(resetRequest.user_id, new_password);
      if (!isPasswordNotInHistory) {
        return { error: 'Password cannot be the same as recent passwords' };
      }

      // Update user password
      const { user } = await PasswordService.updateUserPassword(resetRequest.user_id, new_password);

      // Mark reset token as used
      await PasswordService.markResetTokenAsUsed(resetRequest.id);

      // Log password reset
      await AuditService.logPasswordResetCompleted(user.id,
        request.headers.get('x-forwarded-for') || request.headers.get('x-real-ip') || 'unknown',
        request.headers.get('user-agent') || ''
      );

      return {
        message: 'Password reset successful',
        user: {
          id: user.id,
          username: user.username,
          email: user.email,
        }
      };

    } catch (error: unknown) {
      if (error instanceof ZodError) {
        return { error: 'Invalid input data', details: error.issues };
      }

      console.error('Password reset confirm error:', error);
      return { error: 'Internal server error' };
    }
  }
}
