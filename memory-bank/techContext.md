# Tech Context

## Technologies Used
- **Framework**: Next.js 15 (App Router)
- **Language**: TypeScript 5.0+
- **Styling**: Tailwind CSS 4.0+ with Sass for custom variables
- **ORM**: Prisma 6.13.0+ with SQLite database
- **Authentication**: JWT (jose library), bcryptjs for password hashing
- **State Management**: React useState and server-side session utilities
- **Validation**: Zod 4.0.14+ for comprehensive input validation
- **UI Components**: Lucide React icons for visual elements
- **Animations**: Framer Motion 12.23.12+ for smooth transitions
- **Utilities**: uuid 11.1.0 for secure session ID generation

## Development Setup
- **Node.js**: v20+ (LTS)
- **Required Tools**: 
  - SQLite database (local file-based)
  - Prisma CLI for migrations and client generation
  - VSCode with recommended extensions (ESLint, Prettier, Prisma)
- **Environment Variables**:
  - DATABASE_URL (SQLite connection string)
  - JWT_SECRET (for JWT token signing)

## Technical Constraints
- **Browser Support**: Modern browsers (Chrome, Firefox, Safari, Edge) last 2 versions
- **Performance**: 
  - Initial page load < 2s (Lighthouse target)
  - Responsive design for all viewport sizes
  - Smooth animations and transitions
- **Security**:
  - All authentication processing occurs server-side
  - Passwords hashed with bcrypt before storage
  - Session tokens signed with JWT secret
  - Account locking after 5 failed login attempts
  - Password history tracking (last 5 passwords)
  - Banned password checking
  - Audit logging for all security events
  - Middleware route protection

## Dependencies
```json
{
  "dependencies": {
    "bcryptjs": "^3.0.2",
    "framer-motion": "^12.23.12",
    "jose": "^6.0.12",
    "jsonwebtoken": "^9.0.2",
    "lucide-react": "^0.536.0",
    "next": "15.4.5",
    "react": "19.1.0",
    "react-dom": "19.1.0",
    "uuid": "^11.1.0",
    "zod": "^4.0.14"
  },
  "devDependencies": {
    "@eslint/eslintrc": "^3",
    "@prisma/client": "^6.13.0",
    "@tailwindcss/postcss": "^4",
    "@types/bcryptjs": "^2.4.6",
    "@types/jsonwebtoken": "^9.0.10",
    "@types/node": "^20",
    "@types/react": "^19",
    "@types/react-dom": "^19",
    "@types/uuid": "^10.0.0",
    "eslint": "^9",
    "eslint-config-next": "15.4.5",
    "prisma": "^6.13.0",
    "sass": "^1.89.2",
    "tailwindcss": "^4",
    "typescript": "^5"
  }
}

## Tool Usage Patterns
- **ESLint**: 
  - Configured in `eslint.config.mjs`
  - Enforces strict TypeScript rules and React best practices
  - Run automatically on commit via Husky (if configured)

- **Prisma**:
  - Schema defined in `policyglass/prisma/schema.prisma`
  - Migrations managed through `npx prisma migrate dev`
  - Client generated and imported from `generated/prisma`
  - Database operations use type-safe Prisma Client methods

- **Tailwind CSS**:
  - Configured with postcss in `postcss.config.mjs`
  - Custom theme variables integrated with Sass variables
  - Responsive utility classes for cross-device compatibility
  - Hover and transition effects for enhanced UX

- **Testing**:
  - Jest and React Testing Library planned for unit tests
  - Playwright planned for end-to-end testing
  - Test coverage tracking for critical paths
  - Currently minimal test implementation

- **Build Process**:
  - `npm run dev` for development server
  - `npm run build` for production build
  - `npm run start` for production server
  - Prisma client generation during build process

## Current Implementation Details
- **Database**: SQLite with Prisma ORM, local development setup
- **Session Management**: JWT tokens stored in cookies with database session tracking
- **Password Security**: bcrypt hashing with salt rounds = 10
- **Input Validation**: Zod schemas for all form submissions and API requests
- **UI Framework**: Tailwind CSS utility classes with Sass customizations
- **Component Architecture**: React Server Components and Client Components pattern
- **Routing**: Next.js App Router with middleware protection
- **Error Handling**: Comprehensive try/catch blocks with proper HTTP responses
- **Type Safety**: Strict TypeScript with explicit typing throughout
