# Tech Context

## Technologies Used
- **Framework**: Next.js 15 (App Router)
- **Language**: TypeScript 5.0+
- **Styling**: Tailwind CSS 4.0+ with Sass for custom variables
- **ORM**: Prisma 6.13.0+ with SQLite database
- **Authentication**: JWT (jose library), bcryptjs for password hashing
- **AI Integration**: @ai-sdk/openai 2.0+ for OpenAI integration, ai 5.0+ for AI SDK
- **Real-time Communication**: WebSocket (ws 8.18.3+) for job progress updates
- **State Management**: React useState and server-side session utilities
- **Validation**: Zod 4.0.14+ for comprehensive input validation
- **UI Components**: Lucide React icons for visual elements
- **Animations**: Framer Motion 12.23.12+ for smooth transitions
- **Utilities**: uuid 11.1.0 for secure session ID generation
- **API Documentation**: OpenAPI/Swagger with @omer-x/next-openapi-route-handler

## Development Setup
- **Node.js**: v20+ (LTS)
- **Required Tools**: 
  - SQLite database (local file-based)
  - Prisma CLI for migrations and client generation
  - VSCode with recommended extensions (ESLint, Prettier, Prisma)
- **Environment Variables**:
  - `DATABASE_URL` (SQLite connection string)
  - `JWT_SECRET` (for JWT token signing)
  - `OPENAI_RESEARCHREPORT` (OpenAI API key for policy research)
  - `CEREBRAS_API_KEY` (Cerebras API key for audit generation)

## Technical Constraints
- **Browser Support**: Modern browsers (Chrome, Firefox, Safari, Edge) last 2 versions
- **Performance**: 
  - Initial page load < 2s (Lighthouse target)
  - Responsive design for all viewport sizes
  - Smooth animations and transitions
  - Real-time WebSocket updates with < 100ms latency
- **Security**:
  - All authentication processing occurs server-side
  - Passwords hashed with bcrypt before storage
  - Session tokens signed with JWT secret
  - Account locking after 5 failed login attempts
  - Password history tracking (last 5 passwords)
  - Banned password checking
  - Audit logging for all security events
  - Middleware route protection
  - API rate limiting for job creation
- **Scalability**:
  - Background job processing with configurable concurrency
  - WebSocket connection management and cleanup
  - Database indexing for job queries and monitoring
  - Automatic cleanup of expired jobs and connections

## Dependencies

### Production Dependencies
```json
{
  "@ai-sdk/openai": "^2.0.0",
  "@omer-x/next-openapi-json-generator": "^2.0.2",
  "@omer-x/next-openapi-route-handler": "^2.0.0",
  "@types/swagger-ui-react": "^5.18.0",
  "@types/ws": "^8.18.1",
  "ai": "^5.0.0",
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
  "ws": "^8.18.3",
  "zod": "^4.0.14"
}
```

### Development Dependencies
```json
{
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
```

## Tool Usage Patterns

### ESLint Configuration
- **Configuration**: Defined in `eslint.config.mjs`
- **Rules**: Enforces strict TypeScript rules and React best practices
- **Integration**: Automatic linting on save and pre-commit hooks
- **Custom Rules**: Project-specific rules for service layer architecture

### Prisma ORM
- **Schema**: Defined in `policyglass/prisma/schema.prisma`
- **Migrations**: Managed through `npx prisma migrate dev`
- **Client Generation**: Auto-generated and imported from `generated/prisma`
- **Database Operations**: Type-safe Prisma Client methods with transaction support
- **Job Management**: Optimized queries for job status tracking and monitoring

### AI SDK Integration
- **OpenAI Integration**: Using @ai-sdk/openai for policy research phase
- **Cerebras Integration**: Direct API integration for audit generation
- **Error Handling**: Comprehensive retry logic and rate limiting
- **Response Validation**: Confidence scoring and result validation
- **API Management**: Secure key storage and usage tracking

### WebSocket Infrastructure
- **Server**: Built-in WebSocket server using ws library
- **Connection Management**: Job-specific channels with automatic cleanup
- **Message Protocol**: Structured JSON messages for different update types
- **Error Handling**: Connection recovery and fallback mechanisms
- **Performance**: Optimized for concurrent connections and message broadcasting

### Background Processing
- **Queue Management**: In-memory FIFO queue with database persistence
- **Concurrency Control**: Configurable limits to prevent resource exhaustion
- **Job Lifecycle**: Comprehensive state tracking with timestamps
- **Error Recovery**: Automatic retry mechanisms and graceful degradation
- **Monitoring**: Real-time statistics and health monitoring

### Tailwind CSS
- **Configuration**: Configured with postcss in `postcss.config.mjs`
- **Custom Theme**: Variables integrated with Sass variables
- **Responsive Design**: Utility classes for cross-device compatibility
- **Animations**: Hover and transition effects for enhanced UX
- **Component Styling**: Consistent design system across all components

### Testing Infrastructure
- **Unit Testing**: Jest and React Testing Library for component testing
- **Integration Testing**: API endpoint testing with Postman collections
- **End-to-End Testing**: Playwright for complete user workflow testing
- **Performance Testing**: Load testing for concurrent job processing
- **API Testing**: Comprehensive Postman collection with automated tests

### Build and Development Process
- **Development**: `npm run dev` for hot-reload development server
- **Production Build**: `npm run build` for optimized production build
- **Production Server**: `npm run start` for production server
- **Database**: Prisma client generation during build process
- **Type Checking**: Strict TypeScript compilation with zero errors
- **Linting**: ESLint validation with zero warnings

## Current Implementation Details

### Database Architecture
- **Primary Database**: SQLite with Prisma ORM for local development
- **Production Path**: Easy migration to PostgreSQL for production deployment
- **Session Management**: JWT tokens stored in secure cookies with database session tracking
- **Job Persistence**: PolicyJob table with comprehensive two-phase job tracking
- **User Quota Management**: Daily job limits with quota tracking and validation
- **Performance**: Optimized indexes for job queries and user operations

### Security Implementation
- **Password Security**: bcrypt hashing with salt rounds = 10
- **Session Security**: JWT tokens with secure cookie storage
- **Input Validation**: Zod schemas for all form submissions and API requests
- **Rate Limiting**: API endpoint protection against abuse
- **Audit Logging**: Comprehensive security event tracking
- **Error Handling**: Secure error messages without information leakage

### API Architecture
- **RESTful Design**: Standard HTTP methods and status codes
- **OpenAPI Documentation**: Automatic documentation generation with Swagger UI
- **Validation**: Zod schema validation for all endpoints
- **Error Handling**: Consistent error response format
- **Authentication**: Bearer token authentication for protected endpoints
- **Real-time Updates**: WebSocket endpoints for job progress tracking

### Frontend Architecture
- **Component Structure**: Feature-based organization with clear separation
- **State Management**: React hooks with server-side session utilities
- **Responsive Design**: Mobile-first approach with Tailwind CSS
- **Real-time UI**: WebSocket integration for live updates
- **Error Handling**: User-friendly error messages and loading states
- **Performance**: Optimized rendering with React Server Components

### Background Services
- **Job Processing**: Asynchronous background processing with queue management
- **AI Integration**: Separate services for research and audit phases
- **WebSocket Communication**: Real-time progress updates and notifications
- **Health Monitoring**: System health checks and performance metrics
- **Cleanup Services**: Automatic cleanup of expired jobs and connections

## Production Considerations

### Deployment Requirements
- **Node.js Runtime**: v20+ with proper environment configuration
- **Database**: PostgreSQL for production with connection pooling
- **Environment Variables**: Secure storage of API keys and secrets
- **Process Management**: PM2 or similar for process monitoring
- **Reverse Proxy**: Nginx for static file serving and load balancing

### Monitoring and Logging
- **Application Monitoring**: Health check endpoints and metrics
- **Error Tracking**: Comprehensive error logging and alerting
- **Performance Monitoring**: Job processing times and success rates
- **Security Monitoring**: Audit log analysis and threat detection
- **Resource Monitoring**: Memory and CPU usage tracking

### Scalability Planning
- **Horizontal Scaling**: Architecture supports multiple server instances
- **Database Scaling**: Read replicas and connection pooling
- **Job Processing**: Distributed job processing with Redis queue
- **WebSocket Scaling**: Socket.io with Redis adapter for multi-server
- **CDN Integration**: Static asset delivery optimization

### Security Hardening
- **HTTPS Enforcement**: SSL/TLS certificates and secure headers
- **API Rate Limiting**: Advanced rate limiting with Redis
- **Input Sanitization**: Additional validation and sanitization layers
- **Security Headers**: CORS, CSP, and other security headers
- **Vulnerability Scanning**: Regular dependency and code scanning
