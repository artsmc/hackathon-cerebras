# Project Brief

## Core Requirements
- Build a policy analysis web application using Next.js 15 with App Router
- Implement Prisma ORM for database operations with SQLite
- Create responsive UI for policy document visualization
- Support user authentication and role-based access control
- Enable AI-powered policy document analysis with visual flagging

## Goals
- Provide intuitive interface for parsing and analyzing complex policy documents
- Achieve 95%+ test coverage for critical components
- Maintain clean architecture with separation of concerns
- Ensure mobile-responsive design across all views
- Implement comprehensive security features including password management and audit logging

## Scope
- Frontend: Next.js application with TypeScript and Sass styling
- Backend: Prisma data layer with SQLite database
- Features: Document upload, analysis dashboard, results visualization, authentication system
- Security: Password hashing, session management, audit logging, password history, banned passwords
- RBAC: User and admin roles with protected routes
- Out of scope: Mobile app development, third-party API integrations beyond auth, external email services

## Current Status
- Authentication system fully implemented with registration, login, logout, and password reset
- Role-based access control with admin/user roles
- Database schema with User, Session, PasswordHistory, PasswordResetRequest, AuditLog, BannedPassword, and Config models
- Responsive UI components for all authentication flows
- Middleware protection for routes
- API endpoints for all auth operations
- Frontend pages for home, dashboard, admin dashboard, and user management
- Policy analysis interface with flag visualization and report toggle
