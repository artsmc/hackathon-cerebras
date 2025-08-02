# Technology Stack

## Core Technologies
- **Frontend**: Next.js 15.4.5, TypeScript 5+, Tailwind CSS 4+
- **Backend**: Next.js App Router API routes, Node.js
- **Database**: SQLite, Prisma ORM 6.13.0+
- **State Management**: React useState and client-side state
- **UI Components**: Lucide React icons, custom Tailwind components

## Development Tools
- **Testing**: Jest, React Testing Library (planned)
- **CI/CD**: GitHub Actions (planned)
- **Linting**: ESLint 9+, Next.js linting
- **Documentation**: Mermaid.js diagrams, Markdown documentation
- **Styling**: Sass (globals.scss), Tailwind CSS

## Dependencies
```json
{
  "dependencies": {
    "lucide-react": "^0.536.0",
    "next": "15.4.5",
    "react": "19.1.0",
    "react-dom": "19.1.0"
  },
  "devDependencies": {
    "@eslint/eslintrc": "^3",
    "@prisma/client": "^6.13.0",
    "@tailwindcss/postcss": "^4",
    "@types/node": "^20",
    "@types/react": "^19",
    "@types/react-dom": "^19",
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
- Prisma schema-first database design
- Responsive design with mobile-first approach
