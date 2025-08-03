# PolicyGlass Authentication System

This document provides an overview of the authentication system implementation for PolicyGlass.

## Features Implemented

- User registration with validation
- User login with JWT token generation
- Password hashing with bcrypt
- Session management
- Audit logging for security events
- Password history tracking
- Account locking after failed login attempts
- Password reset functionality
- Banned password checking
- **Role-Based Access Control (RBAC)** - New feature added

## API Routes

- `POST /api/auth/register` - User registration
- `POST /api/auth/login` - User login
- `POST /api/auth/logout` - User logout
- `POST /api/auth/password-reset/request` - Password reset request
- `POST /api/auth/password-reset/confirm` - Password reset confirmation
- `POST /api/auth/verify` - Session verification
- `GET /api/admin/users` - Get all users (admin only)
- `PUT /api/admin/users` - Update user role (admin only)

## Database Schema

The authentication system uses the following tables:
- `users` - User accounts with username, email, password hash, and role
- `sessions` - Active user sessions
- `audit_logs` - Security audit trail
- `password_histories` - Password change history
- `banned_passwords` - Common passwords that are not allowed

## Security Features

- Passwords are hashed with bcrypt before storage
- JWT tokens are signed with a secret key
- Failed login attempts are tracked and accounts are locked after 5 failures
- Password history is maintained to prevent reuse of old passwords
- Common passwords are checked against a banned list
- All API routes include proper error handling and validation
- Audit logs track all authentication-related events
- **Role-Based Access Control** - Users can have different roles (admin, user)
- **Protected Routes** - Middleware enforces authentication and authorization
- **Session Management** - Cookie-based sessions with automatic expiration

## Frontend Components

- LoginForm - Handles user login
- RegisterForm - Handles user registration
- PasswordResetRequestForm - Handles password reset requests
- PasswordResetConfirmForm - Handles password reset confirmation
- AuthCheck - Client-side authentication wrapper component

## RBAC Implementation Details

### Roles
- `user` - Standard user role (default for new registrations)
- `admin` - Administrative role with enhanced privileges

### Protected Pages
- `/dashboard` - User dashboard (requires authentication)
- `/admin` - Admin dashboard (requires admin role)
- `/admin/users` - User management page (requires admin role)

### Middleware Protection
The middleware automatically protects routes and redirects unauthenticated users to the login page. It also prevents non-admin users from accessing admin routes.

### Session Utilities
- `verifySession()` - Server-side session verification with automatic redirect
- `getSession()` - Server-side session verification without redirect
- `isAdmin()` - Check if current user has admin role
- `hasRole()` - Check if current user has specific role
- `hasAnyRole()` - Check if current user has any of the specified roles

## Testing the Authentication System

To test the authentication system with RBAC and dashboard access control, you can create test users with different roles using the Prisma Studio or by making API calls to the registration endpoint. The system will automatically redirect users based on their authentication status and role permissions when they access protected pages like the dashboard or admin sections.

The system is ready for integration with the main PolicyGlass application.
