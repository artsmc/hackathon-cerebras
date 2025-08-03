import { PrismaClient } from './src/generated/prisma';
import { PolicyJobService } from './src/app/services/policy-job.service';
import { BackgroundProcessorService } from './src/app/services/background-processor.service';

async function checkJobs() {
  const prisma = new PrismaClient();
  
  try {
    // Check current jobs in database
    const jobs = await prisma.policyJob.findMany({
      orderBy: { created_at: 'desc' },
      take: 10
    });
    
    console.log('=== Current Policy Jobs ===');
    jobs.forEach(job => {
      console.log(`
Job ID: ${job.id}
Status: ${job.status}
Research Status: ${job.research_status}
Audit Status: ${job.audit_status}
Progress: ${job.progress_percentage}%
Source URL: ${job.source_url}
Created: ${job.created_at}
Updated: ${job.updated_at}
Expires: ${job.expires_at}
Research Started: ${job.research_started_at || 'Not started'}
Research Completed: ${job.research_completed_at || 'Not completed'}
Audit Started: ${job.audit_started_at || 'Not started'}
Audit Completed: ${job.audit_completed_at || 'Not completed'}
Policy ID: ${job.policy_id || 'None'}
Audit Report ID: ${job.audit_report_id || 'None'}
Research Error: ${job.research_error || 'None'}
Audit Error: ${job.audit_error || 'None'}
      `);
    });
    
    // Check processing stats
    console.log('\n=== Background Processor Stats ===');
    const stats = BackgroundProcessorService.getProcessingStats();
    console.log(JSON.stringify(stats, null, 2));
    
    // Check pending jobs
    console.log('\n=== Pending Jobs for Processing ===');
    const pendingJobs = await PolicyJobService.getPendingJobs(10);
    console.log(`Found ${pendingJobs.length} pending jobs:`, pendingJobs);
    
  } catch (error) {
    console.error('Error checking jobs:', error);
  } finally {
    await prisma.$disconnect();
  }
}

checkJobs();
