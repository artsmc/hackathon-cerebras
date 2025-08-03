# PolicyGlass Job System Documentation

## Overview

The PolicyGlass Job System provides background processing for policy research and audit generation with real-time status updates via WebSockets. The system separates research and audit phases, allowing users to track progress and receive notifications when each phase completes.

## Architecture

```
┌─────────────────┐    ┌──────────────────┐    ┌─────────────────┐
│   Client API    │    │  Background      │    │   WebSocket     │
│   Endpoints     │───▶│  Processor       │───▶│   Service       │
└─────────────────┘    └──────────────────┘    └─────────────────┘
         │                       │                       │
         ▼                       ▼                       ▼
┌─────────────────┐    ┌──────────────────┐    ┌─────────────────┐
│   Job Service   │    │  Research &      │    │   Real-time     │
│   (Database)    │    │  Audit Services  │    │   Updates       │
└─────────────────┘    └──────────────────┘    └─────────────────┘
```

## Database Schema

### PolicyJob Table
```sql
CREATE TABLE PolicyJob (
  id            String   @id @default(cuid())
  sourceUrl     String
  status        JobStatus @default(PENDING)
  
  -- Research Phase
  researchStatus     JobStatus @default(PENDING)
  researchStartedAt  DateTime?
  researchCompletedAt DateTime?
  researchConfidence Float?
  researchError      String?
  policyId          Int?
  
  -- Audit Phase  
  auditStatus       JobStatus @default(PENDING)
  auditStartedAt    DateTime?
  auditCompletedAt  DateTime?
  auditConfidence   Float?
  auditError        String?
  auditReportId     Int?
  
  -- Metadata
  createdAt    DateTime @default(now())
  updatedAt    DateTime @updatedAt
  expiresAt    DateTime @default(dbgenerated("(now() + interval '24 hours')"))
)

enum JobStatus {
  PENDING
  PROCESSING  
  COMPLETED
  FAILED
}
```

## Core Services

### 1. PolicyJobService
Manages job lifecycle and database operations.

**Key Methods:**
- `createJob(sourceUrl)` - Creates new job
- `getJobStatus(jobId)` - Gets current job status
- `startResearchPhase(jobId)` - Marks research as started
- `completeResearchPhase(jobId, policyId, confidence)` - Completes research
- `startAuditPhase(jobId)` - Marks audit as started
- `completeAuditPhase(jobId, auditReportId, confidence)` - Completes audit
- `failJob(jobId, phase, error)` - Marks job as failed

### 2. BackgroundProcessorService
Orchestrates the complete workflow with queue management.

**Features:**
- Concurrent job processing (configurable limit)
- Automatic retry and error handling
- Queue management with priority
- Cleanup of expired jobs

**Workflow:**
1. Load pending jobs from database
2. Process research phase (URL → Policy data)
3. Process audit phase (Policy → Audit report)
4. Send real-time updates via WebSocket
5. Handle errors and cleanup

### 3. WebSocketService
Manages real-time communication with clients.

**Message Types:**
- `JOB_UPDATE` - Overall job progress
- `PHASE_UPDATE` - Research/audit phase updates
- `ERROR` - Error notifications
- `COMPLETE` - Final completion with results

### 4. AppInitializerService
Handles application startup and background service initialization.

## API Endpoints

### Job Management

#### Create Job
```http
POST /api/policy/jobs
Content-Type: application/json

{
  "url": "https://example.com/privacy-policy"
}

Response:
{
  "jobId": "clx123abc",
  "message": "Policy analysis job created successfully",
  "estimatedDuration": 300
}
```

#### Get Job Status
```http
GET /api/policy/jobs/{jobId}

Response:
{
  "job": {
    "id": "clx123abc",
    "sourceUrl": "https://example.com/privacy-policy",
    "status": "PROCESSING",
    "researchStatus": "COMPLETED",
    "auditStatus": "PROCESSING",
    "policyId": 123,
    "createdAt": "2025-01-01T00:00:00Z"
  },
  "policy": {
    "id": 123,
    "companyName": "Example Corp",
    "sourceUrl": "https://example.com/privacy-policy",
    "termsText": "...",
    "createdAt": "2025-01-01T00:00:00Z"
  },
  "auditReport": {
    "id": 456,
    "totalScore": 85,
    "letterGrade": "B+",
    "overallSummary": "...",
    "sections": [...],
    "createdAt": "2025-01-01T00:00:00Z"
  }
}
```

#### Cancel Job
```http
DELETE /api/policy/jobs/{jobId}

Response:
{
  "message": "Job cancelled successfully",
  "jobId": "clx123abc"
}
```

### WebSocket Connection

#### Connect to Job Updates
```javascript
const ws = new WebSocket(`ws://localhost:8080/api/policy/jobs/${jobId}/ws`);

ws.onmessage = (event) => {
  const message = JSON.parse(event.data);
  
  switch (message.type) {
    case 'JOB_UPDATE':
      console.log('Job progress:', message.data.progressPercentage);
      break;
    case 'PHASE_UPDATE':
      console.log('Phase update:', message.data.phase, message.data.status);
      break;
    case 'ERROR':
      console.error('Job error:', message.data.error);
      break;
    case 'COMPLETE':
      console.log('Job completed:', message.data);
      break;
  }
};
```

### Health Check
```http
GET /api/health

Response:
{
  "status": "healthy",
  "service": "PolicyGlass",
  "version": "1.0.0",
  "initialized": true,
  "backgroundProcessor": {
    "isProcessing": true,
    "queueLength": 2,
    "activeJobs": 1,
    "maxConcurrentJobs": 3,
    "totalConnections": 5
  },
  "timestamp": "2025-01-01T00:00:00Z"
}
```

## Usage Examples

### Basic Job Creation and Monitoring

```javascript
// 1. Create a job
const response = await fetch('/api/policy/jobs', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({ url: 'https://example.com/privacy' })
});
const { jobId } = await response.json();

// 2. Connect to WebSocket for real-time updates
const ws = new WebSocket(`ws://localhost:8080/api/policy/jobs/${jobId}/ws`);

ws.onmessage = (event) => {
  const message = JSON.parse(event.data);
  updateUI(message);
};

// 3. Poll for status updates (alternative to WebSocket)
const pollStatus = async () => {
  const response = await fetch(`/api/policy/jobs/${jobId}`);
  const status = await response.json();
  
  if (status.job.status === 'COMPLETED') {
    console.log('Job completed!', status.auditReport);
  } else if (status.job.status === 'FAILED') {
    console.error('Job failed:', status.job.researchError || status.job.auditError);
  } else {
    setTimeout(pollStatus, 5000); // Poll every 5 seconds
  }
};
```

### Error Handling

```javascript
// Handle different error scenarios
ws.onmessage = (event) => {
  const message = JSON.parse(event.data);
  
  if (message.type === 'ERROR') {
    switch (message.data.phase) {
      case 'research':
        showError('Failed to research policy. Please check the URL.');
        break;
      case 'audit':
        showError('Failed to generate audit report. Please try again.');
        break;
      case 'system':
        showError('System error occurred. Please contact support.');
        break;
    }
  }
};
```

## Configuration

### Environment Variables
```env
# Database
DATABASE_URL="postgresql://..."

# OpenAI API (for research)
OPENAI_RESEARCHREPORT="sk-..."

# Cerebras API (for audit)
CEREBRAS_API_KEY="csk-..."
```

### Background Processor Settings
```javascript
// Adjust concurrent job limit
BackgroundProcessorService.setMaxConcurrentJobs(5);

// Get processing statistics
const stats = BackgroundProcessorService.getProcessingStats();
console.log('Active jobs:', stats.activeJobs);
console.log('Queue length:', stats.queueLength);
```

## Monitoring and Debugging

### Health Monitoring
- Use `/api/health` endpoint for system status
- Monitor background processor statistics
- Track WebSocket connection counts

### Logging
- All services include comprehensive logging
- Job lifecycle events are logged with timestamps
- Error details are captured for debugging

### Database Queries
```sql
-- Check job status
SELECT * FROM PolicyJob WHERE id = 'job_id';

-- Find failed jobs
SELECT * FROM PolicyJob WHERE status = 'FAILED';

-- Monitor processing times
SELECT 
  id,
  sourceUrl,
  researchStartedAt,
  researchCompletedAt,
  auditStartedAt,
  auditCompletedAt,
  EXTRACT(EPOCH FROM (auditCompletedAt - createdAt)) as total_duration_seconds
FROM PolicyJob 
WHERE status = 'COMPLETED';
```

## Best Practices

1. **Always use WebSockets** for real-time updates when possible
2. **Implement proper error handling** for all job states
3. **Set reasonable timeouts** for long-running operations
4. **Monitor system health** regularly via health endpoint
5. **Clean up expired jobs** to maintain database performance
6. **Use job cancellation** for better user experience
7. **Implement retry logic** for transient failures

## Troubleshooting

### Common Issues

1. **Jobs stuck in PENDING**
   - Check if background processor is running
   - Verify database connectivity
   - Check for errors in application logs

2. **WebSocket connections failing**
   - Ensure WebSocket server is initialized
   - Check firewall settings for port 8080
   - Verify job ID exists and is valid

3. **Research phase failures**
   - Verify OpenAI API key is valid
   - Check if URL is accessible
   - Review rate limiting settings

4. **Audit phase failures**
   - Verify Cerebras API key is valid
   - Check if policy data exists
   - Review API quota limits

### Debug Commands
```javascript
// Force process a specific job
await BackgroundProcessorService.forceProcessJob(jobId);

// Remove job from queue
BackgroundProcessorService.removeFromQueue(jobId);

// Get connection count for job
const count = WebSocketService.getConnectionCount(jobId);

// Close all connections for job
WebSocketService.closeJobConnections(jobId);
