import { NextRequest, NextResponse } from 'next/server';
import { PolicyJobService } from '../../../services/policy-job.service';
import { BackgroundProcessorService } from '../../../services/background-processor.service';
import { UserQuotaService } from '../../../services/user-quota.service';
import { JobLoggerService } from '../../../services/job-logger.service';
import { CreateJobRequest, CreateJobResponse } from '../../../types/policy-audit.types';
import { verifySession } from '../../../lib/session';
import { z } from 'zod';

// Request validation schema
const createJobSchema = z.object({
  url: z.string().url('Invalid URL format')
});

/**
 * POST /api/policy/jobs
 * Creates a new policy analysis job
 */
export async function POST(request: NextRequest): Promise<NextResponse> {
  try {
    // Verify user session
    const session = await verifySession();
    if (!session) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const body = await request.json();
    
    // Validate request body
    const validation = createJobSchema.safeParse(body);
    if (!validation.success) {
      return NextResponse.json(
        { 
          error: 'Invalid request', 
          details: validation.error.issues 
        },
        { status: 400 }
      );
    }

    const { url } = validation.data;

    // Check user quota before creating job
    try {
      await UserQuotaService.validateJobCreation(session.userId);
    } catch (quotaError) {
      const quotaStatus = await UserQuotaService.checkDailyQuota(session.userId);
      const timeUntilReset = await UserQuotaService.getFormattedTimeUntilReset(session.userId);

      return NextResponse.json({
        error: quotaError instanceof Error ? quotaError.message : 'Quota exceeded',
        quota: {
          ...quotaStatus,
          timeUntilReset
        }
      }, { status: 429 }); // Too Many Requests
    }

    // Create job with user ID
    const jobId = await PolicyJobService.createJob(url, session.userId);
    
    // Log job creation
    JobLoggerService.logJobCreated(jobId, url, session.userId);
    
    // Queue job for processing
    BackgroundProcessorService.queueJob(jobId);

    const response: CreateJobResponse = {
      jobId,
      message: 'Policy analysis job created successfully',
      estimatedDuration: 300 // 5 minutes estimate
    };

    return NextResponse.json(response, { status: 201 });

  } catch (error) {
    console.error('Failed to create policy job:', error);
    return NextResponse.json(
      { 
        error: 'Failed to create policy analysis job',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}

/**
 * GET /api/policy/jobs
 * Gets processing statistics
 */
export async function GET(): Promise<NextResponse> {
  try {
    const stats = BackgroundProcessorService.getProcessingStats();
    
    return NextResponse.json({
      processingStats: stats,
      timestamp: new Date().toISOString()
    });

  } catch (error) {
    console.error('Failed to get processing stats:', error);
    return NextResponse.json(
      { 
        error: 'Failed to retrieve processing statistics',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}
