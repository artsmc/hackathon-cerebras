# Technology Stack

## Core Technologies
- **Frontend**: Next.js 15.4.5, TypeScript 5+, React 19.1.0
- **Backend**: Next.js App Router API routes, Node.js
- **Database**: SQLite, Prisma ORM 6.13.0+
- **State Management**: React useState and client-side state
- **UI Components**: Lucide React icons, Framer Motion for animations
- **Authentication**: JWT (jose library), bcryptjs for password hashing
- **API Documentation**: OpenAPI/Swagger integration with @omer-x/next-openapi-route-handler

## Development Tools
- **Testing**: Jest, React Testing Library (planned)
- **CI/CD**: GitHub Actions (planned)
- **Linting**: ESLint 9+, Next.js linting
- **Documentation**: Mermaid.js diagrams, Markdown documentation
- **Styling**: Tailwind CSS 4.0+ with Sass for custom variables

## Dependencies
```json
{
  "dependencies": {
    "@omer-x/next-openapi-json-generator": "^2.0.2",
    "@omer-x/next-openapi-route-handler": "^2.0.0",
    "@types/swagger-ui-react": "^5.18.0",
    "bcryptjs": "^3.0.2",
    "framer-motion": "^12.23.12",
    "jose": "^6.0.12",
    "jsonwebtoken": "^9.0.2",
    "lucide-react": "^0.536.0",
    "next": "15.4.5",
    "react": "19.1.0",
    "react-dom": "19.1.0",
    "swagger-ui-react": "^5.27.1",
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
```

## Architecture Patterns
- App Router architecture for Next.js pages and layouts
- Client Components pattern for interactive UI elements
- Server Components for data fetching and authentication checks
- Prisma schema-first database design
- Role-Based Access Control (RBAC) pattern
- Controller-Service architecture pattern for separation of concerns
- Responsive design with mobile-first approach
- API route handlers with OpenAPI documentation generation
