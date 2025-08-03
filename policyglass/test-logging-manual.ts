import { JobLoggerService } from './src/app/services/job-logger.service';

console.log('=== Manual Job Logger Test ===');

// Test all logging functions
console.log('\n1. Testing job creation log...');
JobLoggerService.logJobCreated('test-job-123', 'https://example.com/privacy', 1);

console.log('\n2. Testing job queuing log...');
JobLoggerService.logJobQueued('test-job-123', 1);

console.log('\n3. Testing research phase logs...');
JobLoggerService.logResearchStarted('test-job-123', 'https://example.com/privacy');
JobLoggerService.logCompanyNameFound('test-job-123', 'Example Corp');
JobLoggerService.logPolicyResearchCompleted('test-job-123', 456, 2500);

console.log('\n4. Testing audit phase logs...');
JobLoggerService.logAuditStarted('test-job-123', 456);
JobLoggerService.logAuditCompleted('test-job-123', 789, 85, 3200);

console.log('\n5. Testing job completion log...');
JobLoggerService.logJobCompleted('test-job-123', 5700);

console.log('\n6. Testing error log...');
JobLoggerService.logJobFailed('test-job-123', 'research', new Error('Test error'));

console.log('\n7. Testing AI service call log...');
JobLoggerService.logAIServiceCall('PolicyResearchService', 'extractCompanyName', 150, true);

console.log('\n8. Testing database operation log...');
JobLoggerService.logDatabaseOperation('create', 'Policy', 456);

console.log('\n9. Testing queue stats log...');
JobLoggerService.logQueueStats(2, 1, 3);

console.log('\n10. Testing processor startup log...');
JobLoggerService.logProcessorStartup();

console.log('\n=== All logging tests completed successfully! ===');
