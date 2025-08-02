# Active Context

## Current Work Focus
- Implementing document upload and parsing workflow
- Building policy visualization components with AI analysis
- Setting up authentication flow with comprehensive security features
- Finalizing database schema for policy analysis and user management
- Refactoring architecture to implement controller-service pattern

## Recent Changes
- Created initial Next.js 15 App Router structure
- Implemented Prisma schema for User, Session, PasswordHistory, PasswordResetRequest, AuditLog, BannedPassword, and Config entities
- Added responsive layout with Tailwind CSS and Sass styling
- Set up complete authentication system with registration, login, logout, and password reset
- Implemented role-based access control with admin/user roles
- Created session management with JWT tokens and database storage
- Built middleware for route protection
- Developed frontend components and pages for all auth flows
- Created policy analysis results page with flag visualization
- **Refactored API routes to implement controller-service architecture pattern**
  - Created service layer to encapsulate Prisma operations and external library concerns
  - Created controller layer to handle business logic and coordinate services
  - Updated API routes to delegate to controllers (thin route handlers)
  - Services now handle all database operations and external library interactions
  - Controllers now handle all business logic and validation

## Next Steps
- Complete document parsing service (PDF/DOCX to structured data)
- Implement AI-powered policy analysis engine
- Build interactive policy relationship graph visualization
- Add comprehensive test coverage for authentication system
- Implement document storage and retrieval system
- Create admin user management interface with API integration
- Add banned password database seeding
- Implement audit log viewing for admin users
- Add proper audit logging to admin controller

## Active Decisions & Considerations
- Using Prisma for ORM vs direct SQL queries (chose Prisma for type safety and developer experience)
- JWT-based session management vs other session strategies (chose JWT for stateless scalability)
- SQLite for local development vs PostgreSQL for production (using SQLite with easy migration path)
- Tailwind CSS for styling with Sass customization (hybrid approach for flexibility)
- Client-side animations for UI enhancement (using Framer Motion and custom CSS animations)

## Important Patterns & Preferences
- Strict TypeScript with comprehensive type safety
- Component organization by feature in src/app/
- Server Actions pattern for data mutations
- React Server Components for initial data loading
- Client Components for interactive elements
- Zod schemas for form validation and API response validation
- Prisma transactions for complex database operations
- Comprehensive error handling with user-friendly messages
- Security-focused implementation with audit logging

## Learnings & Project Insights
- Next.js 15 App Router provides excellent server-side rendering capabilities
- Prisma's type generation works seamlessly with TypeScript
- JWT token management requires careful implementation for security
- Role-based access control needs both frontend and backend validation
- Responsive design with Tailwind CSS enables rapid UI development
- Password security features (history, banned passwords) add significant value
- Session management with database storage provides better tracking
- Policy analysis visualization requires clear flag/warning distinction
