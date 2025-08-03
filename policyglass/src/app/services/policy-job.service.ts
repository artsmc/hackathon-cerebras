import { PrismaClient } from '../../generated/prisma';
import { 
  PolicyJobStatus, 
  JobUpdateData,
  PolicyJobError 
} from '../types/policy-audit.types';
import { JobStatus, JobStatusType } from '../lib/schemas/policy-audit.schema';

const prisma = new PrismaClient();

/**
 * PolicyJobService - Manages the lifecycle of policy analysis jobs
 * Handles job creation, status updates, and cleanup operations
 */
export class PolicyJobService {
  
  /**
   * Creates a new policy analysis job
   * @param sourceUrl - The URL to analyze
   * @returns Job ID for tracking
   */
  static async createJob(sourceUrl: string): Promise<string> {
    try {
      const expiresAt = new Date();
      expiresAt.setHours(expiresAt.getHours() + 24); // 24-hour expiration

      const job = await prisma.policyJob.create({
        data: {
          source_url: sourceUrl,
          expires_at: expiresAt,
        }
      });

      return job.id;
    } catch (error) {
      console.error('Failed to create policy job:', error);
      throw new Error('Failed to create policy analysis job');
    }
  }

  /**
   * Updates job progress and status
   * @param jobId - Job identifier
   * @param updateData - Data to update
   */
  static async updateJob(jobId: string, updateData: JobUpdateData): Promise<void> {
    try {
      const updatePayload: Record<string, unknown> = {
        updated_at: new Date(),
      };

      // Map interface fields to database fields
      if (updateData.status !== undefined) updatePayload.status = updateData.status;
      if (updateData.progressPercentage !== undefined) updatePayload.progress_percentage = updateData.progressPercentage;
      if (updateData.researchStatus !== undefined) updatePayload.research_status = updateData.researchStatus;
      if (updateData.researchStartedAt !== undefined) updatePayload.research_started_at = updateData.researchStartedAt;
      if (updateData.researchCompletedAt !== undefined) updatePayload.research_completed_at = updateData.researchCompletedAt;
      if (updateData.researchError !== undefined) updatePayload.research_error = updateData.researchError;
      if (updateData.researchConfidence !== undefined) updatePayload.research_confidence = updateData.researchConfidence;
      if (updateData.policyId !== undefined) updatePayload.policy_id = updateData.policyId;
      if (updateData.auditStatus !== undefined) updatePayload.audit_status = updateData.auditStatus;
      if (updateData.auditStartedAt !== undefined) updatePayload.audit_started_at = updateData.auditStartedAt;
      if (updateData.auditCompletedAt !== undefined) updatePayload.audit_completed_at = updateData.auditCompletedAt;
      if (updateData.auditError !== undefined) updatePayload.audit_error = updateData.auditError;
      if (updateData.auditConfidence !== undefined) updatePayload.audit_confidence = updateData.auditConfidence;
      if (updateData.auditReportId !== undefined) updatePayload.audit_report_id = updateData.auditReportId;

      await prisma.policyJob.update({
        where: { id: jobId },
        data: updatePayload
      });
    } catch (error) {
      console.error(`Failed to update job ${jobId}:`, error);
      throw new PolicyJobError(`Failed to update job status`, jobId, 'research', error as Error);
    }
  }

  /**
   * Retrieves current job status with related data
   * @param jobId - Job identifier
   * @returns Complete job status information
   */
  static async getJobStatus(jobId: string): Promise<PolicyJobStatus | null> {
    try {
      const job = await prisma.policyJob.findUnique({
        where: { id: jobId },
        include: {
          policy: true,
          audit_report: {
            include: {
              section_scores: true
            }
          }
        }
      });

      if (!job) {
        return null;
      }

      // Convert database fields to interface format
      return {
        id: job.id,
        jobType: job.job_type,
        sourceUrl: job.source_url,
        status: job.status as JobStatusType,
        progressPercentage: job.progress_percentage,
        researchStatus: job.research_status as JobStatusType,
        researchStartedAt: job.research_started_at || undefined,
        researchCompletedAt: job.research_completed_at || undefined,
        researchError: job.research_error || undefined,
        researchConfidence: job.research_confidence || undefined,
        policyId: job.policy_id || undefined,
        auditStatus: job.audit_status as JobStatusType,
        auditStartedAt: job.audit_started_at || undefined,
        auditCompletedAt: job.audit_completed_at || undefined,
        auditError: job.audit_error || undefined,
        auditConfidence: job.audit_confidence || undefined,
        auditReportId: job.audit_report_id || undefined,
        createdAt: job.created_at,
        updatedAt: job.updated_at,
        expiresAt: job.expires_at
      };
    } catch (error) {
      console.error(`Failed to get job status for ${jobId}:`, error);
      throw new PolicyJobError(`Failed to retrieve job status`, jobId, 'research', error as Error);
    }
  }

  /**
   * Starts the research phase for a job
   * @param jobId - Job identifier
   */
  static async startResearchPhase(jobId: string): Promise<void> {
    await this.updateJob(jobId, {
      status: JobStatus.PROCESSING,
      researchStatus: JobStatus.PROCESSING,
      researchStartedAt: new Date(),
      progressPercentage: 10
    });
  }

  /**
   * Completes the research phase and prepares for audit
   * @param jobId - Job identifier
   * @param policyId - Created policy ID
   * @param confidence - Research confidence level
   */
  static async completeResearchPhase(jobId: string, policyId: number, confidence: number): Promise<void> {
    await this.updateJob(jobId, {
      researchStatus: JobStatus.COMPLETED,
      researchCompletedAt: new Date(),
      researchConfidence: confidence,
      policyId: policyId,
      progressPercentage: 50
    });
  }

  /**
   * Starts the audit phase for a job
   * @param jobId - Job identifier
   */
  static async startAuditPhase(jobId: string): Promise<void> {
    await this.updateJob(jobId, {
      auditStatus: JobStatus.PROCESSING,
      auditStartedAt: new Date(),
      progressPercentage: 60
    });
  }

  /**
   * Completes the audit phase and marks job as complete
   * @param jobId - Job identifier
   * @param auditReportId - Created audit report ID
   * @param confidence - Audit confidence level
   */
  static async completeAuditPhase(jobId: string, auditReportId: number, confidence: number): Promise<void> {
    await this.updateJob(jobId, {
      status: JobStatus.COMPLETED,
      auditStatus: JobStatus.COMPLETED,
      auditCompletedAt: new Date(),
      auditConfidence: confidence,
      auditReportId: auditReportId,
      progressPercentage: 100
    });
  }

  /**
   * Marks a job as failed with error details
   * @param jobId - Job identifier
   * @param phase - Which phase failed
   * @param error - Error message
   */
  static async failJob(jobId: string, phase: 'research' | 'audit', error: string): Promise<void> {
    const updateData: JobUpdateData = {
      status: JobStatus.FAILED,
    };

    if (phase === 'research') {
      updateData.researchStatus = JobStatus.FAILED;
      updateData.researchError = error;
      updateData.researchCompletedAt = new Date();
    } else {
      updateData.auditStatus = JobStatus.FAILED;
      updateData.auditError = error;
      updateData.auditCompletedAt = new Date();
    }

    await this.updateJob(jobId, updateData);
  }

  /**
   * Cleans up expired jobs (24+ hours old)
   * @returns Number of jobs cleaned up
   */
  static async cleanupExpiredJobs(): Promise<number> {
    try {
      const now = new Date();
      const result = await prisma.policyJob.deleteMany({
        where: {
          expires_at: {
            lt: now
          }
        }
      });

      console.log(`Cleaned up ${result.count} expired jobs`);
      return result.count;
    } catch (error) {
      console.error('Failed to cleanup expired jobs:', error);
      throw new Error('Failed to cleanup expired jobs');
    }
  }

  /**
   * Gets jobs that are pending processing
   * @param limit - Maximum number of jobs to return
   * @returns Array of job IDs ready for processing
   */
  static async getPendingJobs(limit: number = 10): Promise<string[]> {
    try {
      const jobs = await prisma.policyJob.findMany({
        where: {
          status: JobStatus.PENDING
        },
        orderBy: {
          created_at: 'asc'
        },
        take: limit,
        select: {
          id: true
        }
      });

      return jobs.map(job => job.id);
    } catch (error) {
      console.error('Failed to get pending jobs:', error);
      throw new Error('Failed to retrieve pending jobs');
    }
  }

  /**
   * Checks if a job exists and is not expired
   * @param jobId - Job identifier
   * @returns True if job exists and is valid
   */
  static async isValidJob(jobId: string): Promise<boolean> {
    try {
      const job = await prisma.policyJob.findUnique({
        where: { id: jobId },
        select: { 
          id: true, 
          expires_at: true 
        }
      });

      if (!job) return false;
      
      const now = new Date();
      return job.expires_at > now;
    } catch (error) {
      console.error(`Failed to validate job ${jobId}:`, error);
      return false;
    }
  }
}
