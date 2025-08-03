# Key Pair Responsibility

## Project Overview & Business Context Summary
PolicyGlass is an AI-powered policy document analysis platform designed to help legal professionals, policymakers, and compliance officers understand complex policy documents. The application transforms dense regulatory text into actionable insights through visual flagging of potential issues, contradictions, and compliance concerns.

Business goals include providing an intuitive interface for policy analysis, achieving comprehensive document parsing, and maintaining clean architecture with proper separation of concerns. The platform targets legal compliance officers, government policy analysts, corporate regulatory teams, legislative researchers, and risk management professionals.

## Key Modules & Responsibilities
- **Policy Input Interface**: Handles user input for policy topics, document text, or URLs through a responsive form-based interface on the home page
- **Background Job Processing System**: Manages asynchronous policy analysis through a two-phase workflow (research → audit) with real-time progress tracking
- **WebSocket Communication**: Provides real-time updates to clients during job processing with connection management and message broadcasting
- **Policy Research Service**: Handles the first phase of analysis by extracting and storing policy document content from URLs using AI-powered research
- **Policy Audit Service**: Performs the second phase by generating comprehensive audit reports with scoring and section-by-section analysis
- **Results Visualization**: Displays analysis results with visual indicators for flags (red) and warnings (yellow) with toggleable full report view
- **User Authentication System**: Handles user registration, login, password management, session tracking, and role-based access control (RBAC)
- **Admin User Management**: Provides administrative interface for managing users and their roles through API endpoints
- **Audit Logging**: Tracks user activities, authentication events, and system interactions for compliance and security monitoring
- **Database Management**: Maintains user data, session information, password history, configuration settings, banned passwords, policy documents, audit reports, policy jobs, and user saved reports
- **Password Security**: Implements password history tracking, banned password checking, and reset functionality with expiration
- **User Dashboard**: Provides personalized dashboard views based on user roles with access to saved policy analyses
- **Admin Dashboard**: Offers administrative features including user management, system settings, and audit log viewing
- **Health Monitoring**: Provides system health checks and processing statistics through dedicated API endpoints
- **Application Initialization**: Manages startup processes and background service initialization for reliable system operation
