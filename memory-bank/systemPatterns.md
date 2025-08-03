# System Patterns

## Architecture Overview
- **Frontend**: Next.js 15 App Router with TypeScript, Tailwind CSS, and Sass
  - Feature-based component organization in `src/app/`
  - React Server Components for initial data loading and auth checks
  - Client Components for interactive elements and state management
  - Responsive design with Tailwind CSS utility classes
  - Real-time UI updates via WebSocket integration with polling fallback
  - Toast notifications for user feedback

- **Backend**: Prisma ORM with SQLite database and Next.js API routes
  - Relational database schema with proper entity relationships
  - Type-safe database access through Prisma Client
  - Transaction support for complex operations
  - Connection pooling for performance
  - Background job processing with queue management and two-phase workflow

- **Authentication**: Comprehensive JWT-based system
  - Server-side session management with cookie storage
  - Database session tracking for security audit
  - Password hashing with bcryptjs
  - Account locking after failed login attempts
  - Password history tracking and validation
  - Banned password checking
  - Password reset with token expiration

- **Authorization**: Role-Based Access Control (RBAC)
  - User and admin roles with distinct permissions
  - Middleware route protection
  - Server-side role validation
  - Conditional UI rendering based on roles

- **Job Processing System**: Background processing with real-time updates
  - PolicyJob model with research and audit phases and comprehensive status tracking
  - Queue management with configurable concurrency (default max 3 jobs)
  - WebSocket communication for real-time progress updates with polling fallback
  - AI service integration (OpenAI for research and audit phases)
  - Comprehensive error handling and retry mechanisms
  - Job expiration and automatic cleanup processes (24-hour expiration)
  - User quota management (3 jobs per 24 hours per user)

- **Policy Analysis**: Document storage and reporting system
  - Policy document storage with metadata and source URL tracking
  - Comprehensive audit reporting with structured scoring (0-100) and letter grades (A-E)
  - Section-by-section analysis results with detailed commentary
  - User dashboard saving functionality with custom display names and notes
  - Background processing for AI analysis with confidence scoring

- **API Documentation**: OpenAPI/Swagger integration
  - Zod schema validation for all API endpoints
  - Automatic documentation generation
  - Swagger UI for interactive API exploration
  - Postman collection for development testing

- **Real-time Communication**: WebSocket infrastructure
  - Job progress updates and status notifications with structured message types
  - Connection management and cleanup with ping keep-alive
  - Fallback to polling for compatibility (3-second intervals)
  - Connection recovery and state synchronization
  - Phase-specific update broadcasting (research, audit, completion, errors)

## Data Flow Architecture

### Authentication Flow
1. User submits credentials via frontend forms
2. API routes delegate to AuthController for business logic
3. AuthController coordinates AuthService and PasswordService
4. Services handle Prisma database operations and password validation
5. JWT tokens generated and stored in secure cookies
6. Session tracking in database for audit and security
7. Middleware validates sessions and roles for protected routes

### Policy Analysis Workflow
1. **Job Creation**
   - User submits policy URL via home page form
   - API creates PolicyJob record with PENDING status
   - Job added to background processing queue
   - WebSocket connection established for real-time updates

2. **Research Phase**
   - BackgroundProcessorService picks up job from queue
   - PolicyResearchService calls OpenAI API to analyze URL
   - Policy document data extracted and stored in Policy table
   - Job status updated to research COMPLETED with confidence score
   - Real-time progress sent via WebSocket

3. **Audit Phase**
   - PolicyAuditService processes Policy data with Cerebras API
   - Comprehensive audit report generated with section scores
   - AuditReport and SectionScore records created
   - Job status updated to audit COMPLETED
   - Final results sent via WebSocket

4. **Results Display**
   - Frontend receives completion notification
   - Results page displays audit report with flag visualization
   - Users can save reports to dashboard via UserSavedReport
   - Toggle between summary and detailed report views

### Admin Management Flow
1. Admin authentication with elevated permissions
2. Admin dashboard displays system statistics and user management
3. AdminController coordinates AdminService for user operations
4. Audit logging for all administrative actions
5. Real-time monitoring of job processing and system health

## Key Technical Decisions
- **Background Job Processing**: Chose asynchronous processing over synchronous API calls for better user experience and scalability
- **WebSocket Communication**: Real-time updates provide immediate feedback for long-running AI operations
- **Dual-Phase Job Design**: Separate research and audit phases allow for granular progress tracking and error handling
- **AI Service Separation**: OpenAI for research and Cerebras for audit leverages specialized capabilities of each service
- **Controller-Service Architecture**: Clear separation of concerns with thin API routes, business logic in controllers, and data operations in services
- **Database Job Persistence**: Job state stored in database for recovery and monitoring capabilities
- **Queue Management**: In-memory queue with database backing for performance and reliability
- **Comprehensive Error Handling**: Phase-specific error tracking with retry mechanisms and user feedback

## Design Patterns

### Service Layer Architecture
- **Controllers** (`/controllers/*`): Handle HTTP requests, coordinate services, manage business logic
- **Services** (`/services/*`): Encapsulate data access, external API calls, and domain operations
- **API Routes** (`/api/*`): Thin handlers that delegate to controllers
- **Background Services**: Separate service layer for job processing and queue management

### Job Processing Patterns
- **Queue Management**: FIFO queue with configurable concurrency limits
- **State Machine**: Clear job status transitions (PENDING → PROCESSING → COMPLETED/FAILED)
- **Phase Tracking**: Independent status tracking for research and audit phases
- **Error Recovery**: Comprehensive error capture with retry logic and graceful degradation
- **Progress Reporting**: Real-time progress updates via WebSocket communication

### Real-time Communication Patterns
- **WebSocket Management**: Connection pooling and cleanup for job-specific channels
- **Message Types**: Structured message format for different update types (progress, error, completion)
- **Fallback Strategy**: Polling mechanism for clients that cannot maintain WebSocket connections
- **Connection Recovery**: Automatic reconnection and state synchronization

### Data Persistence Patterns
- **Transactional Operations**: Atomic job state changes with database transactions
- **Audit Trail**: Comprehensive logging of job lifecycle events
- **Cleanup Mechanisms**: Automatic expiration and cleanup of completed jobs
- **Indexing Strategy**: Optimized database indexes for job queries and monitoring

## Critical Implementation Paths

1. **Job Creation and Processing**
   - Client: Home page form submission
   - API: Job creation endpoint (`/api/policy/jobs`)
   - Controller: PolicyController coordinates job creation
   - Service: PolicyJobService manages database operations
   - Background: BackgroundProcessorService handles queue processing
   - AI: PolicyResearchService and PolicyAuditService handle AI integration
   - Communication: WebSocketService provides real-time updates

2. **Real-time Progress Tracking**
   - WebSocket: Connection establishment via `/api/policy/jobs/[jobId]/ws`
   - Service: WebSocketService manages connections and message broadcasting
   - Background: Job processors send progress updates through WebSocket
   - Client: Frontend receives and displays real-time progress updates
   - Fallback: Polling mechanism for status updates when WebSocket unavailable

3. **AI Service Integration**
   - Research: PolicyResearchService integrates with OpenAI API
   - Audit: PolicyAuditService integrates with Cerebras API
   - Error Handling: Comprehensive error capture and retry mechanisms
   - Confidence Scoring: AI response validation and confidence assessment
   - Rate Limiting: API call management and abuse prevention

4. **System Health and Monitoring**
   - Health Check: `/api/health` endpoint provides system status
   - Job Monitoring: Background processor statistics and queue management
   - Error Tracking: Comprehensive error logging and alerting
   - Performance Metrics: Job processing times and success rates

## Component Relationships

### Core Application Structure
- `layout.tsx` provides global styling and font configuration
- `page.tsx` components handle route-specific UI logic
- `lib/session.ts` contains shared authentication utilities
- Middleware protects routes based on authentication status and roles

### Service Layer Integration
- **Controllers** handle business logic and coordinate multiple services
- **Services** encapsulate specific domain operations and external integrations
- **Background Services** operate independently for job processing
- **WebSocket Service** provides real-time communication infrastructure

### Database Model Relationships
- **User** → **Session** (one-to-many for session tracking)
- **User** → **UserSavedReport** (many-to-many via saved reports)
- **Policy** → **AuditReport** (one-to-many for multiple audits)
- **AuditReport** → **SectionScore** (one-to-many for detailed scoring)
- **PolicyJob** → **Policy** (one-to-one for research results)
- **PolicyJob** → **AuditReport** (one-to-one for audit results)

### API and Frontend Integration
- Frontend components communicate with API routes via fetch requests
- WebSocket connections provide real-time updates for long-running operations
- AuthCheck wrapper component provides client-side session validation
- Dashboard pages conditionally render content based on user roles
- Results pages display job outcomes with interactive visualizations

## Performance and Scalability Patterns

### Background Processing Optimization
- **Concurrent Job Limits**: Configurable concurrency to prevent resource exhaustion
- **Queue Prioritization**: FIFO processing with potential for priority queuing
- **Resource Management**: Memory and CPU optimization for AI service calls
- **Database Optimization**: Efficient queries and indexing for job management

### Real-time Communication Efficiency
- **Connection Pooling**: Efficient WebSocket connection management
- **Message Batching**: Optimized message delivery for progress updates
- **Memory Management**: Proper cleanup of completed job connections
- **Scalability Considerations**: Architecture supports horizontal scaling

### Database Performance
- **Indexing Strategy**: Optimized indexes for job queries and status lookups
- **Query Optimization**: Efficient database operations for job management
- **Connection Pooling**: Prisma connection management for concurrent operations
- **Cleanup Processes**: Automated cleanup of expired jobs and old data
