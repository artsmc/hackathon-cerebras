// Simple test script to verify logging system
import { JobLoggerService } from './src/app/services/job-logger.service';

console.log('Testing Job Logger Service...');

// Test basic logging functions
JobLoggerService.logJobCreated('test-job-123', 'https://example.com/privacy', 1);
JobLoggerService.logJobQueued('test-job-123', 1);
JobLoggerService.logResearchStarted('test-job-123', 'https://example.com/privacy');
JobLoggerService.logCompanyNameFound('test-job-123', 'Example Corp');
JobLoggerService.logPolicyResearchCompleted('test-job-123', 456, 2500);
JobLoggerService.logAuditStarted('test-job-123', 456);
JobLoggerService.logAuditCompleted('test-job-123', 789, 85, 3200);
JobLoggerService.logJobCompleted('test-job-123', 5700);

console.log('Logging test completed successfully!');
