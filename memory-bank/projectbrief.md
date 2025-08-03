# Project Brief

## Core Requirements
- Build a comprehensive policy analysis web application using Next.js 15 with App Router
- Implement Prisma ORM for database operations with SQLite (development) and PostgreSQL (production)
- Create responsive UI for policy document visualization with real-time progress tracking
- Support user authentication and role-based access control with comprehensive security features
- Enable AI-powered policy document analysis with background job processing and visual flagging
- Implement real-time communication via WebSocket for job progress updates
- Provide comprehensive API documentation and testing infrastructure

## Goals
- Provide intuitive interface for parsing and analyzing complex policy documents
- Achieve real-time user experience with background processing and WebSocket updates
- Maintain clean architecture with controller-service pattern and separation of concerns
- Ensure mobile-responsive design across all views with smooth animations
- Implement comprehensive security features including password management and audit logging
- Support concurrent job processing with queue management and error recovery
- Achieve 95%+ test coverage for critical components and workflows
- Provide production-ready deployment with monitoring and scalability considerations

## Scope

### Frontend Architecture
- **Framework**: Next.js 15 App Router with TypeScript
- **Styling**: Tailwind CSS 4.0+ with Sass for custom variables
- **Components**: Feature-based organization with React Server/Client Components
- **Real-time UI**: WebSocket integration for live progress updates
- **Responsive Design**: Mobile-first approach with smooth animations
- **State Management**: React hooks with server-side session utilities

### Backend Infrastructure
- **API Layer**: Next.js API routes with controller-service architecture
- **Database**: Prisma ORM with SQLite (dev) and PostgreSQL (production)
- **Authentication**: JWT-based system with comprehensive security features
- **Job Processing**: Background processing with queue management and concurrency control
- **Real-time Communication**: WebSocket server for job progress updates
- **Documentation**: OpenAPI/Swagger integration with interactive API exploration

### Core Features
- **Authentication System**: Registration, login, logout, password reset with security features
- **Policy Analysis Interface**: URL input with background job processing and real-time updates
- **Results Visualization**: Interactive audit reports with flag/warning display and toggleable views
- **User Dashboard**: Saved reports management and job history tracking
- **Admin Dashboard**: User management, system monitoring, and audit log viewing
- **Job Management**: Background processing with research and audit phases

### Security Implementation
- **Password Security**: bcrypt hashing, history tracking, banned password checking
- **Session Management**: JWT tokens with database tracking and audit logging
- **Account Protection**: Locking after failed attempts, comprehensive audit trails
- **Route Protection**: Middleware-based authentication and role validation
- **API Security**: Rate limiting, input validation, and abuse prevention

### AI Integration
- **Research Phase**: OpenAI integration for policy document analysis and extraction
- **Audit Phase**: Cerebras integration for comprehensive policy audit generation
- **Confidence Scoring**: AI response validation and reliability assessment
- **Error Handling**: Comprehensive retry logic and graceful degradation

### Database Schema
- **User Management**: User, Session, PasswordHistory, PasswordResetRequest, AuditLog, BannedPassword
- **Policy Storage**: Policy, AuditReport, SectionScore models with relationships
- **Job Processing**: PolicyJob model with research and audit phase tracking
- **User Features**: UserSavedReport for dashboard functionality and report management

### Real-time Features
- **WebSocket Communication**: Job-specific channels with connection management
- **Progress Tracking**: Real-time updates for research and audit phases
- **Error Notifications**: Immediate feedback for job failures and system issues
- **Completion Alerts**: Instant notification when analysis is complete

### Testing and Quality
- **API Testing**: Comprehensive Postman collection with automated workflows
- **Unit Testing**: Service layer and component testing with high coverage
- **Integration Testing**: End-to-end job workflows and API endpoint testing
- **Performance Testing**: Concurrent job processing and WebSocket stress testing

### Production Readiness
- **Monitoring**: Health check endpoints and system performance metrics
- **Scalability**: Horizontal scaling support with distributed job processing
- **Security Hardening**: Production security measures and vulnerability scanning
- **Deployment**: Containerization and CI/CD pipeline considerations

## Current Implementation Status

### Completed Features (100%)
- **Authentication System**: Complete user registration, login, logout, password reset with comprehensive security features
- **Role-Based Access Control**: User/admin roles with protected routes and conditional rendering
- **Database Schema**: All models implemented with proper relationships and indexing
- **Job Processing Infrastructure**: Background processing with queue management and two-phase workflow
- **WebSocket Communication**: Real-time updates with connection management and message broadcasting
- **API Documentation**: OpenAPI/Swagger integration with interactive documentation
- **Testing Infrastructure**: Postman collection with comprehensive API coverage
- **User Quota System**: Daily job limits with quota tracking and validation

### Near Completion (90-95%)
- **AI Integration**: OpenAI research and audit services implemented with generateObject
- **Frontend Components**: UI components built with responsive design
- **Service Layer Architecture**: Controller-service pattern implemented throughout with clear separation of concerns

### In Progress (70-85%)
- **Frontend-Backend Integration**: Home page form connected to job creation API, results page displays job status
- **Real-time Progress Tracking**: WebSocket/polling implementation for live job updates
- **Error Handling**: Comprehensive error handling with user feedback and logging

### Planned (30-50%)
- **Production Deployment**: Architecture ready, deployment configuration pending
- **Comprehensive Testing**: Unit and integration tests pending
- **Performance Optimization**: Database and WebSocket optimization pending

## Technical Architecture

### Service Layer Pattern
- **Controllers**: Handle HTTP requests and coordinate business logic
- **Services**: Encapsulate data access and external API integrations
- **Background Services**: Independent job processing and queue management
- **WebSocket Services**: Real-time communication infrastructure

### Data Flow
1. **User Input**: Policy URL submission via responsive frontend form
2. **Job Creation**: Background job created with PENDING status
3. **Research Phase**: OpenAI integration for policy document analysis
4. **Audit Phase**: Cerebras integration for comprehensive audit generation
5. **Real-time Updates**: WebSocket communication for progress tracking
6. **Results Display**: Interactive visualization with save-to-dashboard functionality

### Security Architecture
- **Multi-layer Authentication**: JWT tokens with database session tracking
- **Comprehensive Audit Logging**: All security events tracked and monitored
- **Input Validation**: Zod schemas for all API endpoints and form submissions
- **Rate Limiting**: Protection against abuse and automated attacks
- **Role-based Authorization**: Granular permissions for different user types

## Success Criteria

### Technical Metrics
- **Performance**: < 2s page load times, < 100ms WebSocket latency
- **Reliability**: 99.9% uptime for core services and job processing
- **Security**: Zero critical vulnerabilities, comprehensive audit trails
- **Test Coverage**: 90%+ coverage for critical paths and workflows
- **Scalability**: Support for concurrent users and background job processing

### User Experience Metrics
- **Job Success Rate**: > 95% successful policy analysis completion
- **Real-time Responsiveness**: Immediate feedback for all user actions
- **Error Recovery**: < 5% user-facing errors with clear recovery paths
- **Mobile Responsiveness**: Consistent experience across all device types

### Business Metrics
- **User Adoption**: Successful onboarding and feature utilization
- **System Efficiency**: Optimal resource utilization and cost management
- **Feature Usage**: High engagement with saved reports and dashboard features
- **Admin Efficiency**: Effective user management and system monitoring

## Out of Scope
- **Mobile Native Applications**: Web-first approach with responsive design
- **Third-party Integrations**: Focus on core AI providers (OpenAI, Cerebras)
- **External Email Services**: Console-based email for development phase
- **Advanced Analytics**: Basic reporting, advanced analytics for future phases
- **Multi-tenant Architecture**: Single-tenant focus for initial implementation

## Future Considerations
- **Horizontal Scaling**: Architecture supports distributed deployment
- **Advanced AI Features**: Additional AI providers and analysis capabilities
- **Enterprise Features**: SSO integration, advanced admin controls
- **Mobile Applications**: Native mobile apps leveraging existing API infrastructure
- **Advanced Collaboration**: Report sharing, team features, and workflow management

## Risk Mitigation
- **AI Service Dependencies**: Multiple provider support and fallback mechanisms
- **Performance Bottlenecks**: Background processing and database optimization
- **Security Vulnerabilities**: Comprehensive security testing and monitoring
- **Scalability Challenges**: Architecture designed for horizontal scaling
- **User Experience Issues**: Real-time feedback and comprehensive error handling
