# System Architecture

## High-Level Overview
PolicyGlass is a Next.js web application that provides AI-powered policy document analysis. The system consists of:

- **Frontend**: Next.js 15 application with App Router architecture, TypeScript, and Sass for styling
- **Backend**: Server-side processing with Prisma ORM for database operations and API routes
- **Database**: SQLite database (configured via DATABASE_URL environment variable)
- **Authentication**: Comprehensive user authentication system with session management, RBAC, and security features
- **Data Models**: User management, password security, configuration, session tracking, audit logging, and password reset functionality

The application follows a client-server architecture where policy documents are processed server-side for security and performance reasons. Users interact through a responsive web interface that provides real-time analysis results with visual flagging of potential issues.

## Database Schema
The application uses Prisma ORM with SQLite database. Key models and relationships:

```mermaid
erDiagram
    USER ||--o{ SESSION : "has"
    USER ||--o{ PASSWORD_HISTORY : "maintains"
    USER ||--o{ RESET_REQUEST : "requests"
    USER ||--o{ AUDIT_LOG : "generates"
    
    USER {
        int id PK
        string username UK
        string email UK
        string password_hash
        string password_salt
        datetime password_last_changed
        boolean is_temp_password
        datetime last_successful_login
        int failed_login_attempts
        boolean account_locked
        boolean piv_verified
        string role
        datetime created_at
    }
    
    PASSWORD_HISTORY {
        int id PK
        int user_id FK
        string password_hash
        string password_salt
        datetime changed_at
    }
    
    SESSION {
        string id PK
        int user_id FK
        datetime session_start
        datetime last_activity
        datetime terminated_at
        string jwt_token
        string ip_address
        string user_agent
        boolean valid
    }
    
    AUDIT_LOG {
        int id PK
        int user_id FK
        datetime event_time
        string event_type
        string description
        string source_ip
        string user_agent
    }
    
    RESET_REQUEST {
        int id PK
        int user_id FK
        string reset_token
        datetime created_at
        datetime expires_at
        boolean used
    }
    
    BANNED_PASSWORD {
        int id PK
        string password
        string source
        datetime created_at
    }
    
    CONFIG {
        int id PK
        string name
        string logo
        int appType
        string use_case
        boolean is_active
    }
```

## Key Processes
```mermaid
flowchart TD
    A[User Access PolicyGlass] --> B[User Authentication]
    B --> C[Role-Based Access Control]
    C --> D[Policy Document Input]
    D --> E[Server-side Document Processing]
    E --> F[AI Analysis Engine]
    F --> G[Results Generation]
    G --> H[Visual Flag Display]
    H --> I[Full Report View Toggle]
    I --> J[Results Dashboard]
```

## File Structure
- **policyglass/src/app/**: Next.js App Router pages and layout components
  - **home/**: Main landing page with navigation
  - **login/**: User login interface
  - **register/**: User registration interface
  - **dashboard/**: Authenticated user dashboard
  - **admin/**: Administrative dashboard and user management
  - **results/**: Analysis results display with flags and warnings
  - **layout.tsx**: Root layout with font configuration and global styles
  - **page.tsx**: Default landing page
- **policyglass/src/app/api/**: API routes for authentication and admin functionality
  - **auth/**: Authentication-related API endpoints (login, logout, register, password reset, verify)
  - **admin/**: Admin-only API endpoints (user management)
- **policyglass/src/app/controllers/**: Controller layer for handling business logic
  - **auth.controller.ts**: Authentication-related business logic
  - **admin.controller.ts**: Admin-related business logic
- **policyglass/src/app/services/**: Service layer for handling data access and external library concerns
  - **auth.service.ts**: Authentication data operations and user management
  - **admin.service.ts**: Admin data operations and user management
  - **password.service.ts**: Password hashing, validation, and reset operations
  - **session.service.ts**: Session management and validation operations
  - **audit.service.ts**: Audit logging operations
- **policyglass/src/app/components/**: Reusable React components for authentication and UI
- **policyglass/src/app/lib/**: Utility functions for session management and authentication
- **policyglass/prisma/**: Database schema and Prisma configuration
  - **schema.prisma**: Data models for users, sessions, audit logs, etc.
- **memory-bank/**: Project memory and context documentation
