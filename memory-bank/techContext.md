# Tech Context

## Technologies Used
- **Framework**: Next.js 14 (App Router)
- **Language**: TypeScript 5.0+
- **Styling**: Tailwind CSS 3.3+ with JIT compiler
- **ORM**: Prisma 5.0+ with PostgreSQL 15
- **Authentication**: NextAuth.js 4.22+
- **State Management**: React Context API
- **Validation**: Zod 3.22+
- **Visualization**: Mermaid.js (planned)
- **Testing**: Jest, React Testing Library, Playwright

## Development Setup
- **Node.js**: v18.17.0+ (LTS)
- **Required Tools**: 
  - PostgreSQL database (local or cloud)
  - Prisma CLI for migrations
  - VSCode with recommended extensions (ESLint, Prettier, Prisma)
- **Environment Variables**:
  - DATABASE_URL (PostgreSQL connection string)
  - NEXTAUTH_SECRET (for JWT signing)
  - NEXT_PUBLIC_API_BASE_URL (for client-side API calls)

## Technical Constraints
- **Browser Support**: Modern browsers (Chrome, Firefox, Safari, Edge) last 2 versions
- **Performance**: 
  - Initial page load < 2s (Lighthouse target)
  - Document parsing must handle 50+ page PDFs
  - Mobile viewport support down to 320px width
- **Security**:
  - All document processing must occur server-side
  - Authentication state must be protected from XSS
  - Database queries must be parameterized

## Dependencies
```json
{
  "dependencies": {
    "next": "^14.0.0",
    "react": "^18.2.0",
    "react-dom": "^18.2.0",
    "typescript": "^5.0.0",
    "@prisma/client": "^5.0.0",
    "next-auth": "^4.22.0",
    "zod": "^3.22.0",
    "mermaid": "^10.0.0"
  },
  "devDependencies": {
    "@types/node": "^20.0.0",
    "@types/react": "^18.2.0",
    "eslint": "^8.0.0",
    "prettier": "^3.0.0",
    "postcss": "^8.4.0",
    "tailwindcss": "^3.3.0"
  }
}
```

## Tool Usage Patterns
- **ESLint**: 
  - Configured in `eslint.config.mjs`
  - Enforces strict TypeScript rules and React best practices
  - Run automatically on commit via Husky

- **Prisma**:
  - Schema defined in `policyglass/prisma/schema.prisma`
  - Migrations managed through `npx prisma migrate dev`
  - Client initialized in `lib/db.ts`

- **Tailwind CSS**:
  - Configured in `tailwind.config.ts`
  - Custom theme variables in `src/app/globals.scss`
  - JIT mode enabled for development

- **Testing**:
  - Unit tests in `__tests__/` directories
  - Playwright for end-to-end testing
  - Coverage threshold set at 95% for critical paths

- **Build Process**:
  - `npm run dev` for development server
  - `npm run build` for production build
  - `npm run start` for production server
