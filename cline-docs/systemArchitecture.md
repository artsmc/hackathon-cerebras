# System Architecture

## High-Level Overview
PolicyGlass is a Next.js web application that provides AI-powered policy document analysis. The system consists of:

- **Frontend**: Next.js 15 application with App Router architecture, TypeScript, and Tailwind CSS for styling
- **Backend**: Server-side processing with Prisma ORM for database operations
- **Database**: SQLite database (configured via DATABASE_URL environment variable)
- **Authentication**: Built-in user authentication system with session management
- **Data Models**: User management, password security, configuration, session tracking, and audit logging

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
    B --> C[Policy Document Input]
    C --> D[Server-side Document Processing]
    D --> E[AI Analysis Engine]
    E --> F[Results Generation]
    F --> G[Visual Flag Display]
    G --> H[Full Report View Toggle]
    H --> I[Results Dashboard]
```

## File Structure
- **policyglass/src/app/**: Next.js App Router pages and layout components
  - **home/**: Main dashboard with policy input interface
  - **results/**: Analysis results display with flags and warnings
  - **layout.tsx**: Root layout with font configuration and global styles
  - **page.tsx**: Default landing page
- **policyglass/prisma/**: Database schema and Prisma configuration
  - **schema.prisma**: Data models for users, sessions, audit logs, etc.
- **memory-bank/**: Project memory and context documentation
