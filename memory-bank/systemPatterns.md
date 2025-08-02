# System Patterns

## Architecture Overview
- **Frontend**: Next.js 15 App Router with TypeScript and Sass
  - Feature-based component organization in `src/app/`
  - React Server Components for initial data loading and auth checks
  - Client Components for interactive elements and state management
  - Responsive design with Tailwind CSS utility classes

- **Backend**: Prisma ORM with SQLite database
  - Relational database schema with proper entity relationships
  - Type-safe database access through Prisma Client
  - Transaction support for complex operations
  - Connection pooling for performance

- **Authentication**: Comprehensive JWT-based system
  - Server-side session management with cookie storage
  - Database session tracking for security audit
  - Password hashing with bcryptjs
  - Account locking after failed login attempts
  - Password history tracking and validation
  - Banned password checking
  - Password reset with token expiration

- **Authorization**: Role-Based Access Control (RBAC)
  - User and admin roles with distinct permissions
  - Middleware route protection
  - Server-side role validation
  - Conditional UI rendering based on roles

- **Data Flow**
  1. User authentication via frontend forms
  2. API routes handle auth logic and database operations
  3. Session management with JWT tokens and database storage
  4. Protected routes validate sessions and roles
  5. Policy document input via home page form
  6. Results displayed with flag/warning visualization
  7. Admin users can manage system via admin dashboard

## Key Technical Decisions
- **Next.js 15 App Router**: Better data fetching patterns and simplified routing over Pages Router
- **Prisma ORM**: Chosen for type safety and developer experience over raw SQL
- **JWT + Database Sessions**: Combined approach for stateless tokens with stateful tracking
- **SQLite for Development**: Simple local database with migration path to PostgreSQL
- **Tailwind CSS + Sass**: Hybrid styling approach for rapid development with customization
- **Zod Validation**: Comprehensive input validation for all API routes
- **UUID for Session IDs**: Secure random identifiers for sessions
- **Comprehensive Security Features**: Password history, banned passwords, account locking

## Design Patterns
- **Component Organization**: Feature-based structure in `src/app/` directory
- **Server/Client Components**: Proper separation of server-side data loading and client-side interactivity
- **Middleware Protection**: Centralized route protection logic
- **Session Utilities**: Reusable authentication functions in `lib/session.ts`
- **Error Handling**: Centralized error responses with proper HTTP status codes
- **Data Validation**: Zod schemas for consistent validation across frontend and backend
- **Role-Based Rendering**: Conditional UI display based on user permissions
- **Responsive Layout**: Mobile-first design with flexbox and grid layouts

## Critical Implementation Paths
1. **Authentication Flow**
   - Client: LoginForm, RegisterForm, PasswordReset components
   - Server: Auth API routes with comprehensive validation
   - Database: User, Session, PasswordHistory, PasswordResetRequest tables
   - Security: bcrypt hashing, JWT tokens, audit logging

2. **Authorization System**
   - Middleware: Route protection with role validation
   - Server: Session verification utilities
   - Client: Conditional rendering based on user roles
   - Database: User roles and permissions

3. **Policy Analysis Interface**
   - Client: Home page input form with AuthCheck wrapper
   - UI: Results page with flag visualization and report toggle
   - Design: Responsive layout with smooth animations
   - Data: Placeholder content awaiting AI analysis integration

4. **Admin Dashboard**
   - Client: Protected admin pages with user management
   - Server: Admin-only API routes for user management
   - Database: Audit logs and user data retrieval
   - Security: Role validation for all admin operations

## Component Relationships
- `layout.tsx` provides global styling and font configuration
- `page.tsx` components handle route-specific UI logic
- `lib/session.ts` contains shared authentication utilities
- Auth API routes (`/api/auth/*`) handle authentication database operations
- Admin API routes (`/api/admin/*`) handle admin-only database operations
- Frontend components communicate with API routes via fetch requests
- Middleware protects routes based on authentication status and roles
- AuthCheck wrapper component provides client-side session validation
- Dashboard pages conditionally render content based on user roles
