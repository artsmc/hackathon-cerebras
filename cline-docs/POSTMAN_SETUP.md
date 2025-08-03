# PolicyGlass API - Postman Collection Setup Guide

This guide will help you set up and use the PolicyGlass API Postman collection for testing and development.

## Files Included

- `policyglass-postman-collection.json` - Complete API collection with all endpoints
- `policyglass-postman-environment.json` - Development environment variables
- `POSTMAN_SETUP.md` - This setup guide

## Quick Start

### 1. Import Collection and Environment

1. Open Postman
2. Click **Import** button
3. Import both files:
   - `policyglass-postman-collection.json`
   - `policyglass-postman-environment.json`

### 2. Set Up Environment

1. Select "PolicyGlass Development Environment" from the environment dropdown
2. Verify the base URL is set to `http://localhost:3000/api`
3. Update any credentials as needed

### 3. Start Development Server

Before testing, ensure your PolicyGlass development server is running:

```bash
cd policyglass
npm run dev
```

The server should be accessible at `http://localhost:3000`

## Collection Structure

### 📁 Authentication
- **User Login** - Authenticate with username/email and password
- **User Registration** - Register new user accounts
- **User Logout** - Invalidate user sessions
- **Verify User Session** - Check session validity
- **Request Password Reset** - Initiate password reset flow
- **Confirm Password Reset** - Complete password reset with token

### 📁 Admin
- **Get All Users** - Retrieve list of all users (admin only)
- **Update User Role** - Modify user roles (admin only)

### 📁 Policy Analysis
- **Create Policy Job** - Start background policy analysis from URL
- **Get Job Status** - Check progress and results of policy analysis job
- **Cancel Job** - Cancel pending policy analysis job
- **Get Processing Stats** - Retrieve background processor statistics
- **Research Policy Terms** - Direct policy research (legacy endpoint)
- **Get Policy by ID** - Retrieve specific policy with audit reports

### 📁 API Documentation
- **Get OpenAPI Specification** - Retrieve complete API documentation

## Environment Variables

| Variable | Description | Default Value |
|----------|-------------|---------------|
| `baseUrl` | API base URL | `http://localhost:3000/api` |
| `webUrl` | Web application URL | `http://localhost:3000` |
| `authToken` | JWT authentication token | (empty - set after login) |
| `userId` | Current user ID | `1` |
| `policyId` | Policy document ID | `1` |
| `testEmail` | Test user email | `testuser@example.com` |
| `testPassword` | Test user password | `password123` |
| `adminEmail` | Admin user email | `admin@example.com` |
| `adminPassword` | Admin user password | `admin123` |

## Testing Workflow

### 1. Authentication Flow

1. **Register a new user** (optional)
   - Use "User Registration" request
   - Update environment variables with new credentials

2. **Login**
   - Use "User Login" request
   - The auth token will be automatically captured and stored

3. **Verify session**
   - Use "Verify User Session" to confirm authentication

### 2. Policy Analysis Flow (Recommended)

1. **Create a policy analysis job**
   - Use "Create Policy Job" request
   - Provide a valid URL in the request body
   - Job ID will be automatically captured

2. **Monitor job progress**
   - Use "Get Job Status" request repeatedly
   - Or connect via WebSocket for real-time updates
   - Job will progress through research → audit phases

3. **Retrieve final results**
   - Job status will include policy and audit report data
   - Use "Get Policy by ID" for detailed policy information

### 3. Legacy Policy Research Flow

1. **Research a policy**
   - Use "Research Policy Terms" request
   - Provide a valid URL in the request body
   - Policy ID will be automatically captured

2. **Retrieve policy details**
   - Use "Get Policy by ID" request
   - Uses the captured policy ID from previous step

### 3. Admin Operations

1. **Login as admin**
   - Use admin credentials in "User Login"

2. **Manage users**
   - Use "Get All Users" to list users
   - Use "Update User Role" to modify permissions

## Request Examples

### Login Request
```json
{
  "username": "testuser@example.com",
  "password": "password123"
}
```

### Registration Request
```json
{
  "username": "newuser",
  "email": "newuser@example.com",
  "password": "securepassword123"
}
```

### Create Policy Job Request
```json
{
  "url": "https://example.com/privacy-policy"
}
```

### Policy Research Request (Legacy)
```json
{
  "url": "https://example.com/privacy-policy"
}
```

### Update User Role Request
```json
{
  "userId": 2,
  "role": "admin"
}
```

## Automated Testing

The collection includes automated tests for each request:

- **Status code validation** - Ensures proper HTTP responses
- **Response structure validation** - Verifies expected JSON properties
- **Data persistence** - Captures IDs and tokens for subsequent requests
- **Response time checks** - Monitors API performance

### Running Tests

1. Select the collection in Postman
2. Click **Run** to open Collection Runner
3. Select environment and configure options
4. Click **Run PolicyGlass API Collection**

## Authentication

The collection uses Bearer token authentication:

1. Login requests automatically capture JWT tokens
2. Protected endpoints include `Authorization: Bearer {{authToken}}` header
3. Tokens are stored in environment variables for reuse

## Error Handling

Common error responses:

- **400 Bad Request** - Invalid input data
- **401 Unauthorized** - Missing or invalid authentication
- **403 Forbidden** - Insufficient permissions (admin required)
- **404 Not Found** - Resource not found
- **500 Internal Server Error** - Server-side issues

## Development Tips

### Custom Variables

Add custom environment variables for your specific testing needs:

1. Go to Environment settings
2. Add new variables as needed
3. Reference them in requests using `{{variableName}}`

### Pre-request Scripts

The collection includes pre-request scripts that:
- Set default base URL if not configured
- Prepare authentication headers
- Validate required variables

### Test Scripts

Post-request test scripts:
- Validate response structure
- Extract and store important values
- Check response times
- Verify business logic

## Troubleshooting

### Common Issues

1. **Connection refused**
   - Ensure development server is running
   - Check if port 3000 is available
   - Verify firewall settings

2. **Authentication failures**
   - Check if user exists in database
   - Verify password requirements
   - Ensure JWT secret is configured

3. **Database errors**
   - Run Prisma migrations: `npx prisma migrate dev`
   - Check database connection
   - Verify schema is up to date

### Debug Mode

Enable Postman Console for detailed request/response logging:
1. View → Show Postman Console
2. Monitor network traffic and variable values
3. Check for script errors

## API Documentation

For complete API documentation, visit:
- Swagger UI: `http://localhost:3000/api-docs`
- Raw OpenAPI spec: `http://localhost:3000/api/docs`

## Support

For issues or questions:
1. Check the PolicyGlass project README
2. Review API documentation
3. Examine server logs for error details
4. Test endpoints individually to isolate issues

---

**Note**: This collection is designed for development and testing. Update URLs and credentials for production environments.
