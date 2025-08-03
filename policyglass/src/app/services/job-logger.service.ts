import { JobStatus } from '../lib/schemas/policy-audit.schema';

/**
 * JobLoggerService - Centralized logging for job processing system
 * Provides structured, detailed logging with context for debugging and monitoring
 */
export class JobLoggerService {
  private static formatTimestamp(): string {
    return new Date().toISOString();
  }

  private static log(level: string, message: string, context?: Record<string, unknown>): void {
    const timestamp = this.formatTimestamp();
    const logEntry = {
      timestamp,
      level,
      message,
      context: context || {}
    };
    
    // In production, this could send to a logging service
    // For now, we'll use console logging with structured format
    console.log(JSON.stringify(logEntry));
  }

  /**
   * Logs job creation
   */
  static logJobCreated(jobId: string, url: string, userId: number): void {
    this.log('INFO', `Job created`, {
      jobId,
      url,
      userId,
      phase: 'job_creation'
    });
  }

  /**
   * Logs job queuing
   */
  static logJobQueued(jobId: string, queuePosition: number): void {
    this.log('INFO', `Job queued for processing`, {
      jobId,
      queuePosition,
      phase: 'job_queuing'
    });
  }

  /**
   * Logs research phase start
   */
  static logResearchStarted(jobId: string, url: string): void {
    this.log('INFO', `Research phase started`, {
      jobId,
      url,
      phase: 'research',
      status: JobStatus.PROCESSING
    });
  }

  /**
   * Logs company name extraction
   */
  static logCompanyNameFound(jobId: string, companyName: string): void {
    this.log('INFO', `Company name extracted`, {
      jobId,
      companyName,
      phase: 'research',
      subphase: 'company_name_extraction'
    });
  }

  /**
   * Logs policy research completion
   */
  static logPolicyResearchCompleted(jobId: string, policyId: number, duration: number): void {
    this.log('INFO', `Policy research completed`, {
      jobId,
      policyId,
      durationMs: duration,
      phase: 'research',
      status: JobStatus.COMPLETED
    });
  }

  /**
   * Logs audit phase start
   */
  static logAuditStarted(jobId: string, policyId: number): void {
    this.log('INFO', `Audit phase started`, {
      jobId,
      policyId,
      phase: 'audit',
      status: JobStatus.PROCESSING
    });
  }

  /**
   * Logs audit phase completion
   */
  static logAuditCompleted(jobId: string, auditReportId: number, score: number, duration: number): void {
    this.log('INFO', `Audit phase completed`, {
      jobId,
      auditReportId,
      totalScore: score,
      durationMs: duration,
      phase: 'audit',
      status: JobStatus.COMPLETED
    });
  }

  /**
   * Logs job completion
   */
  static logJobCompleted(jobId: string, totalDuration: number): void {
    this.log('INFO', `Job completed successfully`, {
      jobId,
      totalDurationMs: totalDuration,
      phase: 'job_completion',
      status: JobStatus.COMPLETED
    });
  }

  /**
   * Logs job failure
   */
  static logJobFailed(jobId: string, phase: string, error: Error): void {
    this.log('ERROR', `Job failed in ${phase} phase`, {
      jobId,
      phase,
      error: {
        message: error.message,
        stack: error.stack,
        name: error.name
      }
    });
  }

  /**
   * Logs database operations
   */
  static logDatabaseOperation(operation: string, table: string, recordId?: number | string): void {
    this.log('INFO', `Database operation: ${operation}`, {
      operation,
      table,
      recordId,
      phase: 'database'
    });
  }

  /**
   * Logs AI service calls
   */
  static logAIServiceCall(service: string, method: string, duration: number, success: boolean): void {
    this.log(success ? 'INFO' : 'ERROR', `AI service call: ${service}.${method}`, {
      service,
      method,
      durationMs: duration,
      success,
      phase: 'ai_service'
    });
  }

  /**
   * Logs background processor startup
   */
  static logProcessorStartup(): void {
    this.log('INFO', `Background processor started`, {
      phase: 'processor_startup'
    });
  }

  /**
   * Logs background processor shutdown
   */
  static logProcessorShutdown(): void {
    this.log('INFO', `Background processor stopped`, {
      phase: 'processor_shutdown'
    });
  }

  /**
   * Logs queue statistics
   */
  static logQueueStats(queueLength: number, activeJobs: number, maxConcurrent: number): void {
    this.log('INFO', `Queue statistics updated`, {
      queueLength,
      activeJobs,
      maxConcurrentJobs: maxConcurrent,
      phase: 'queue_management'
    });
  }

  /**
   * Logs job cleanup operations
   */
  static logJobCleanup(expiredJobs: number): void {
    this.log('INFO', `Expired jobs cleaned up`, {
      expiredJobs,
      phase: 'job_cleanup'
    });
  }
}
