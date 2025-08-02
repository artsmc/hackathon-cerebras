# Active Context

## Current Work Focus
- Implementing document upload and parsing workflow
- Building policy visualization components
- Setting up authentication flow with NextAuth
- Finalizing database schema for policy analysis

## Recent Changes
- Created initial Next.js 14 App Router structure
- Implemented Prisma schema for Policy, User, and Analysis entities
- Added responsive layout with Tailwind CSS
- Set up basic page structure (Home, Results)

## Next Steps
- Complete authentication integration
- Implement document parsing service
- Build interactive policy relationship graph
- Add role-based access control middleware

## Active Decisions & Considerations
- Using Prisma for ORM vs direct SQL queries (chose Prisma for type safety)
- NextAuth vs custom auth solution (chose NextAuth for simplicity)
- Mermaid.js vs D3.js for visualization (leaning toward Mermaid for simplicity)
- PostgreSQL JSONB vs relational structure for analysis results

## Important Patterns & Preferences
- Strict TypeScript with noImplicitAny enabled
- Component organization by feature in src/app/
- Server actions for data mutations
- Tailwind CSS with custom theme variables
- Prisma transactions for complex operations

## Learnings & Project Insights
- Next.js 14 App Router simplifies data fetching patterns
- Prisma's type generation works well with TypeScript
- Tailwind's JIT compiler speeds up UI development
- Need to handle large document parsing with streaming
