import { NextRequest, NextResponse } from 'next/server';
import { PolicyJobService } from '../../../../services/policy-job.service';
import { PolicyAuditService } from '../../../../services/policy-audit.service';
import { BackgroundProcessorService } from '../../../../services/background-processor.service';
import { JobStatusResponse } from '../../../../types/policy-audit.types';

/**
 * GET /api/policy/jobs/[jobId]
 * Gets the status of a specific policy analysis job
 */
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ jobId: string }> }
): Promise<NextResponse> {
  try {
    const { jobId } = await params;

    if (!jobId) {
      return NextResponse.json(
        { error: 'Job ID is required' },
        { status: 400 }
      );
    }

    // Get job status
    const jobStatus = await PolicyJobService.getJobStatus(jobId);
    
    if (!jobStatus) {
      return NextResponse.json(
        { error: 'Job not found' },
        { status: 404 }
      );
    }

    // If job is pending, queue it for processing
    if (jobStatus.status === 'PENDING') {
      BackgroundProcessorService.queueJob(jobId);
    }

    // Build response with related data
    const response: JobStatusResponse = {
      job: jobStatus
    };

    // Include policy data if available
    if (jobStatus.policyId) {
      // Note: We'd need to add a method to get policy data
      // For now, we'll include basic info in the job status
      response.policy = {
        id: jobStatus.policyId,
        companyName: 'Company Name', // This would come from the policy record
        sourceUrl: jobStatus.sourceUrl,
        termsText: 'Policy terms...', // This would come from the policy record
        createdAt: jobStatus.createdAt
      };
    }

    // Include audit report if available
    if (jobStatus.auditReportId) {
      const auditReport = await PolicyAuditService.getAuditReport(jobStatus.auditReportId);
      if (auditReport) {
        response.auditReport = {
          id: auditReport.id,
          totalScore: auditReport.totalScore,
          letterGrade: auditReport.letterGrade,
          overallSummary: auditReport.overallSummary,
          createdAt: auditReport.createdAt,
          sections: auditReport.sections
        };
      }
    }

    return NextResponse.json(response);

  } catch (error) {
    console.error(`Failed to get job status:`, error);
    return NextResponse.json(
      { 
        error: 'Failed to retrieve job status',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}

/**
 * DELETE /api/policy/jobs/[jobId]
 * Cancels a job (removes from queue if pending)
 */
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ jobId: string }> }
): Promise<NextResponse> {
  try {
    const { jobId } = await params;

    if (!jobId) {
      return NextResponse.json(
        { error: 'Job ID is required' },
        { status: 400 }
      );
    }

    // Check if job exists
    const jobStatus = await PolicyJobService.getJobStatus(jobId);
    if (!jobStatus) {
      return NextResponse.json(
        { error: 'Job not found' },
        { status: 404 }
      );
    }

    // Only allow cancellation of pending jobs
    if (jobStatus.status !== 'PENDING') {
      return NextResponse.json(
        { error: 'Can only cancel pending jobs' },
        { status: 400 }
      );
    }

    // Remove from processing queue
    const removed = await BackgroundProcessorService.removeFromQueue(jobId);
    
    if (removed) {
      return NextResponse.json({
        message: 'Job cancelled successfully',
        jobId
      });
    } else {
      return NextResponse.json({
        message: 'Job was not in queue (may have already started processing)',
        jobId
      });
    }

  } catch (error) {
    console.error(`Failed to cancel job:`, error);
    return NextResponse.json(
      { 
        error: 'Failed to cancel job',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}
