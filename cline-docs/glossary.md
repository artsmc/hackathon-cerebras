# Glossary

## Domain-Specific Terms
- **PolicyGlass**: AI-powered policy document analysis platform that transforms complex regulatory text into actionable insights
- **Policy Analysis**: Process of examining policy documents to identify potential issues, contradictions, and compliance concerns
- **Flags**: Critical issues identified in policy documents that require immediate attention (displayed in red)
- **Warnings**: Potential concerns or areas that need careful review in policy documents (displayed in yellow)
- **Audit Report**: Comprehensive analysis results for a policy document including scores and commentary
- **Section Score**: Individual scoring and commentary for specific sections within a policy audit report
- **Policy Job**: Background processing task that manages the complete policy analysis workflow through research and audit phases
- **Research Phase**: First phase of policy analysis that extracts and stores policy document content from URLs
- **Audit Phase**: Second phase that generates comprehensive audit reports with scoring and analysis
- **Job Status**: Current state of a policy job (PENDING, PROCESSING, COMPLETED, FAILED)
- **Background Processor**: Service that orchestrates the complete policy analysis workflow with queue management
- **WebSocket Connection**: Real-time communication channel for job progress updates and notifications
- **Job Queue**: Processing queue that manages pending policy analysis jobs with concurrent processing limits
- **Confidence Score**: AI-generated confidence level (0.0-1.0) indicating reliability of analysis results
- **Job Expiration**: Automatic cleanup mechanism for jobs older than 24 hours to maintain system performance

## Technical Terms
- **Next.js App Router**: Modern routing architecture in Next.js that uses file-based routing and server components
- **Client Components**: React components that run in the browser and handle interactive UI elements (marked with "use client")
- **Prisma ORM**: Database toolkit that provides type-safe database access and migrations
- **SQLite**: Lightweight, file-based database used for local development and testing
- **Server Components**: React components that render on the server and can fetch data directly
- **Role-Based Access Control (RBAC)**: Security pattern that restricts system access based on user roles
- **JWT**: JSON Web Token - Standard for creating signed access tokens for session management
- **Session Management**: Process of maintaining user authentication state across requests using cookies
- **Password Reset Token**: Temporary token used to verify password reset requests with expiration
- **User Saved Report**: User's saved policy audit reports with custom display names and notes
- **Controller-Service Pattern**: Architecture pattern separating business logic (controllers) from data operations (services)

## Acronyms & Abbreviations
- **PIV**: Personal Identity Verification - Authentication method for verifying user identity
- **JWT**: JSON Web Token - Standard for creating access tokens
- **UK**: Unique Key - Database constraint for unique values
- **PK**: Primary Key - Database constraint for primary key identification
- **RBAC**: Role-Based Access Control - Security access pattern based on user roles
- **API**: Application Programming Interface - Interface for system communication
- **UI**: User Interface - Visual elements users interact with
- **UX**: User Experience - Overall experience of a user interacting with the application
