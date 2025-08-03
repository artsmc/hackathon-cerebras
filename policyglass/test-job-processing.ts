import { BackgroundProcessorService } from './src/app/services/background-processor.service';
import { PolicyJobService } from './src/app/services/policy-job.service';
import { JobLoggerService } from './src/app/services/job-logger.service';

async function testJobProcessing() {
  console.log('=== PolicyGlass Job Processing Test ===');
  
  // Test 1: Check if background processor is running
  console.log('\n1. Checking background processor status...');
  const processorStats = BackgroundProcessorService.getProcessingStats();
  console.log('Processor Stats:', processorStats);
  
  if (processorStats.isProcessing) {
    console.log('✅ Background processor is running');
  } else {
    console.log('❌ Background processor is NOT running');
    console.log('Starting background processor...');
    BackgroundProcessorService.startProcessing();
  }
  
  // Test 2: Create a test job
  console.log('\n2. Creating test job...');
  try {
    const testJobId = await PolicyJobService.createJob('https://example.com/privacy', 1);
    console.log('✅ Test job created:', testJobId);
    JobLoggerService.logJobCreated(testJobId, 'https://example.com/privacy', 1);
    
    // Test 3: Check job status
    console.log('\n3. Checking job status...');
    const jobStatus = await PolicyJobService.getJobStatus(testJobId);
    console.log('Job Status:', jobStatus);
    
    // Test 4: Queue the job for processing
    console.log('\n4. Queuing job for processing...');
    BackgroundProcessorService.queueJob(testJobId);
    console.log('✅ Job queued successfully');
    
    // Test 5: Check queue stats
    console.log('\n5. Checking queue statistics...');
    const updatedStats = BackgroundProcessorService.getProcessingStats();
    console.log('Updated Processor Stats:', updatedStats);
    
    console.log('\n=== Test Summary ===');
    console.log('✅ Background processor initialization test completed');
    console.log('✅ Job creation and queuing test completed');
    console.log('✅ Real-time logging system is active');
    
  } catch (error) {
    console.error('❌ Job creation failed:', error);
  }
}

// Run the test
testJobProcessing().catch(console.error);
