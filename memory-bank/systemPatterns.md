# System Patterns

## Architecture Overview
- **Frontend**: Next.js 14 App Router with TypeScript
  - Feature-based component organization in `src/app/`
  - Server Actions for data mutations
  - React Server Components for initial data loading
  - Client Components for interactive elements

- **Backend**: Prisma ORM with PostgreSQL
  - Relational database schema for Policy, User, and Analysis entities
  - Type-safe database access through Prisma Client
  - Transaction support for complex operations
  - Connection pooling for performance

- **Data Flow**
  1. User uploads document via frontend form
  2. Server Action processes file and stores in database
  3. Analysis service parses document structure
  4. Results stored in PostgreSQL with JSONB fields
  5. Visualization components render analysis data

## Key Technical Decisions
- **App Router over Pages Router**: Better data fetching patterns and simplified routing
- **Prisma ORM**: Chosen for type safety and developer experience over raw SQL
- **Server Actions**: Preferred for data mutations to avoid client-side API routes
- **Tailwind CSS**: JIT compiler enables rapid UI development with responsive design
- **JSONB for Analysis Results**: Flexible storage for unstructured analysis data

## Design Patterns
- **Component Organization**: Feature-based structure in `src/app/`
- **State Management**: React Context API for authentication state
- **Error Handling**: Centralized error boundaries with user-friendly messages
- **Data Validation**: Zod schemas for form inputs and API responses
- **Modular Services**: Separation of parsing, analysis, and storage logic

## Critical Implementation Paths
1. **Document Upload Flow**
   - Client: Drag-and-drop UI component
   - Server: File validation → storage → parsing trigger
   - Database: Policy record creation with metadata

2. **Analysis Visualization**
   - Data retrieval from PostgreSQL
   - Transformation to Mermaid.js compatible format
   - Client-side rendering with interactive elements

3. **Authentication Flow**
   - NextAuth configuration with credentials provider
   - Role-based middleware for protected routes
   - Session management with JWT tokens

## Component Relationships
- `layout.tsx` provides global styling and auth context
- `page.tsx` components handle route-specific logic
- Server Actions in `actions/` directory interact with Prisma
- Visualization components consume analysis data from API routes
