import { PolicyJobService } from './policy-job.service';
import { PolicyResearchService } from './policy-research.service';
import { PolicyAuditService } from './policy-audit.service';
import { WebSocketService } from './websocket.service';
import { JobLoggerService } from './job-logger.service';
import { JobStatus } from '../lib/schemas/policy-audit.schema';
import { ResearchError, AuditError } from '../types/policy-audit.types';


/**
 * BackgroundProcessorService - Orchestrates the complete policy analysis workflow
 * Manages the research → audit pipeline with real-time updates
 */
export class BackgroundProcessorService {
  private static isProcessing = false;
  private static processingQueue: string[] = [];
  private static maxConcurrentJobs = 3;
  private static activeJobs = new Set<string>();

  /**
   * Starts the background processing loop
   */
  static startProcessing(): void {
    if (this.isProcessing) {
      console.log('Background processor already running');
      JobLoggerService.logProcessorStartup();
      return;
    }

    this.isProcessing = true;
    console.log('Starting background processor...');
    JobLoggerService.logProcessorStartup();
    
    // Start the main processing loop
    this.processLoop();
    
    // Start cleanup interval (every hour)
    setInterval(() => {
      this.cleanupExpiredJobs();
    }, 60 * 60 * 1000);
  }

  /**
   * Stops the background processing
   */
  static stopProcessing(): void {
    this.isProcessing = false;
    console.log('Background processor stopped');
  }

  /**
   * Adds a job to the processing queue
   * @param jobId - Job identifier
   */
  static queueJob(jobId: string): void {
    if (!this.processingQueue.includes(jobId) && !this.activeJobs.has(jobId)) {
      this.processingQueue.push(jobId);
      console.log(`Job ${jobId} queued for processing. Queue length: ${this.processingQueue.length}`);
      JobLoggerService.logJobQueued(jobId, this.processingQueue.length);
      JobLoggerService.logQueueStats(this.processingQueue.length, this.activeJobs.size, this.maxConcurrentJobs);
    }
  }

  /**
   * Main processing loop
   */
  private static async processLoop(): Promise<void> {
    while (this.isProcessing) {
      try {
        // Check for pending jobs from database
        await this.loadPendingJobs();
        
        // Process jobs from queue
        await this.processQueuedJobs();
        
        // Wait before next iteration
        await this.sleep(5000); // 5 second interval
        
      } catch (error) {
        console.error('Error in processing loop:', error);
        await this.sleep(10000); // Wait longer on error
      }
    }
  }

  /**
   * Loads pending jobs from database into queue
   */
  private static async loadPendingJobs(): Promise<void> {
    try {
      const pendingJobs = await PolicyJobService.getPendingJobs(10);
      
      for (const jobId of pendingJobs) {
        if (!this.processingQueue.includes(jobId) && !this.activeJobs.has(jobId)) {
          this.processingQueue.push(jobId);
        }
      }
    } catch (error) {
      console.error('Failed to load pending jobs:', error);
    }
  }

  /**
   * Processes jobs from the queue
   */
  private static async processQueuedJobs(): Promise<void> {
    while (this.processingQueue.length > 0 && this.activeJobs.size < this.maxConcurrentJobs) {
      const jobId = this.processingQueue.shift();
      if (jobId) {
        this.activeJobs.add(jobId);
        
        // Process job asynchronously
        this.processJob(jobId)
          .catch(error => {
            console.error(`Failed to process job ${jobId}:`, error);
          })
          .finally(() => {
            this.activeJobs.delete(jobId);
          });
      }
    }
  }

  /**
   * Processes a single job through the complete workflow
   * @param jobId - Job identifier
   */
  private static async processJob(jobId: string): Promise<void> {
    const startTime = Date.now();
    console.log(`Starting processing for job ${jobId}`);
    JobLoggerService.logJobQueued(jobId, 0); // Processing started
    
    try {
      // Validate job exists and is not expired
      const isValid = await PolicyJobService.isValidJob(jobId);
      if (!isValid) {
        console.log(`Job ${jobId} is invalid or expired, skipping`);
        return;
      }

      // Get current job status
      const jobStatus = await PolicyJobService.getJobStatus(jobId);
      if (!jobStatus) {
        console.log(`Job ${jobId} not found, skipping`);
        return;
      }

      // Determine what phase to process
      if (jobStatus.researchStatus === JobStatus.PENDING) {
        await this.processResearchPhase(jobId, jobStatus.sourceUrl);
      } else if (jobStatus.researchStatus === JobStatus.COMPLETED && 
                 jobStatus.auditStatus === JobStatus.PENDING && 
                 jobStatus.policyId) {
        await this.processAuditPhase(jobId, jobStatus.policyId);
      } else {
        console.log(`Job ${jobId} is in an unexpected state, skipping`);
        // Clean up stuck jobs that are in PROCESSING state but not actually processing
        if (jobStatus.status === JobStatus.PROCESSING) {
          console.log(`Cleaning up stuck job ${jobId}`);
          await PolicyJobService.failJob(jobId, 'research', 'Job appears to be stuck - cleaning up');
        }
      }

      const totalTime = Date.now() - startTime;
      JobLoggerService.logJobCompleted(jobId, totalTime);

    } catch (error) {
      console.error(`Error processing job ${jobId}:`, error);
      JobLoggerService.logJobFailed(jobId, 'unknown', error as Error);
      
      // Determine which phase failed and update accordingly
      const jobStatus = await PolicyJobService.getJobStatus(jobId);
      if (jobStatus) {
        const phase = jobStatus.researchStatus === JobStatus.PROCESSING ? 'research' : 'audit';
        await PolicyJobService.failJob(jobId, phase, error instanceof Error ? error.message : 'Unknown error');
        
        // Broadcast error
        const errorMessage = WebSocketService.createErrorMessage(
          jobId,
          phase,
          error instanceof Error ? error.message : 'Unknown error',
          { originalError: error }
        );
        WebSocketService.broadcastError(jobId, errorMessage);
      }
    }
  }

  /**
   * Processes the research phase of a job
   * @param jobId - Job identifier
   * @param sourceUrl - URL to research
   */
  private static async processResearchPhase(jobId: string, sourceUrl: string): Promise<void> {
    const startTime = Date.now();
    console.log(`Starting research phase for job ${jobId}`);
    JobLoggerService.logResearchStarted(jobId, sourceUrl);
    
    try {
      // Start research phase
      await PolicyJobService.startResearchPhase(jobId);
      
      // Broadcast research start
      const startMessage = WebSocketService.createPhaseUpdateMessage(
        jobId,
        'research',
        JobStatus.PROCESSING,
        new Date()
      );
      WebSocketService.broadcastPhaseUpdate(jobId, startMessage);

      // Perform research with timeout
      const policyId = await Promise.race([
        PolicyResearchService.researchAndStorePolicy(sourceUrl),
        new Promise<number>((_, reject) => 
          setTimeout(() => reject(new Error('Research phase timeout after 5 minutes')), 5 * 60 * 1000)
        )
      ]);
      
      const researchDuration = Date.now() - startTime;
      JobLoggerService.logPolicyResearchCompleted(jobId, policyId, researchDuration);
      
      // Complete research phase (using default confidence of 0.8 for now)
      await PolicyJobService.completeResearchPhase(
        jobId, 
        policyId, 
        0.8
      );
      
      // Broadcast research completion
      const completeMessage = WebSocketService.createPhaseUpdateMessage(
        jobId,
        'research',
        JobStatus.COMPLETED,
        undefined,
        new Date(),
        0.8,
        undefined,
        policyId
      );
      WebSocketService.broadcastPhaseUpdate(jobId, completeMessage);

      console.log(`Research phase completed for job ${jobId}, policy ID: ${policyId}`);
      
      // Queue for audit phase
      this.queueJob(jobId);

    } catch (error) {
      console.error(`Research phase failed for job ${jobId}:`, error);
      JobLoggerService.logJobFailed(jobId, 'research', error as Error);
      
      await PolicyJobService.failJob(jobId, 'research', error instanceof Error ? error.message : 'Research failed');
      
      const errorMessage = WebSocketService.createErrorMessage(
        jobId,
        'research',
        error instanceof Error ? error.message : 'Research failed',
        { originalError: error }
      );
      WebSocketService.broadcastError(jobId, errorMessage);
      
      throw new ResearchError(
        `Research failed: ${error instanceof Error ? error.message : 'Unknown error'}`,
        jobId,
        error as Error
      );
    }
  }

  /**
   * Processes the audit phase of a job
   * @param jobId - Job identifier
   * @param policyId - Policy ID to audit
   */
  private static async processAuditPhase(jobId: string, policyId: number): Promise<void> {
    const startTime = Date.now();
    console.log(`Starting audit phase for job ${jobId}, policy ID: ${policyId}`);
    JobLoggerService.logAuditStarted(jobId, policyId);
    
    try {
      // Start audit phase
      await PolicyJobService.startAuditPhase(jobId);
      
      // Broadcast audit start
      const startMessage = WebSocketService.createPhaseUpdateMessage(
        jobId,
        'audit',
        JobStatus.PROCESSING,
        new Date()
      );
      WebSocketService.broadcastPhaseUpdate(jobId, startMessage);

      // Perform audit with timeout
      const auditResult = await Promise.race([
        PolicyAuditService.generateAuditReport(policyId),
        new Promise<{ auditReportId: number; confidence: number }>((_, reject) => 
          setTimeout(() => reject(new Error('Audit phase timeout after 5 minutes')), 5 * 60 * 1000)
        )
      ]);
      
      const auditDuration = Date.now() - startTime;
      JobLoggerService.logAuditCompleted(jobId, auditResult.auditReportId, 0, auditDuration); // TODO: Get actual score
      
      // Complete audit phase
      await PolicyJobService.completeAuditPhase(
        jobId, 
        auditResult.auditReportId, 
        auditResult.confidence
      );
      
      // Get final audit report for completion message
      const auditReport = await PolicyAuditService.getAuditReport(auditResult.auditReportId);
      
      // Broadcast audit completion
      const completeMessage = WebSocketService.createPhaseUpdateMessage(
        jobId,
        'audit',
        JobStatus.COMPLETED,
        undefined,
        new Date(),
        auditResult.confidence,
        undefined,
        auditResult.auditReportId
      );
      WebSocketService.broadcastPhaseUpdate(jobId, completeMessage);

      // Broadcast final completion
      if (auditReport) {
        const finalMessage = WebSocketService.createCompleteMessage(
          jobId,
          policyId,
          auditResult.auditReportId,
          auditReport.totalScore,
          auditReport.letterGrade,
          auditResult.confidence
        );
        WebSocketService.broadcastComplete(jobId, finalMessage);
      }

      console.log(`Audit phase completed for job ${jobId}, audit report ID: ${auditResult.auditReportId}`);

    } catch (error) {
      console.error(`Audit phase failed for job ${jobId}:`, error);
      JobLoggerService.logJobFailed(jobId, 'audit', error as Error);
      
      await PolicyJobService.failJob(jobId, 'audit', error instanceof Error ? error.message : 'Audit failed');
      
      const errorMessage = WebSocketService.createErrorMessage(
        jobId,
        'audit',
        error instanceof Error ? error.message : 'Audit failed',
        { originalError: error }
      );
      WebSocketService.broadcastError(jobId, errorMessage);
      
      throw new AuditError(
        `Audit failed: ${error instanceof Error ? error.message : 'Unknown error'}`,
        jobId,
        error as Error
      );
    }
  }

  /**
   * Cleans up expired jobs
   */
  private static async cleanupExpiredJobs(): Promise<void> {
    try {
      const cleanedCount = await PolicyJobService.cleanupExpiredJobs();
      if (cleanedCount > 0) {
        console.log(`Cleaned up ${cleanedCount} expired jobs`);
      }
    } catch (error) {
      console.error('Failed to cleanup expired jobs:', error);
    }
  }

  /**
   * Gets current processing statistics
   */
  static getProcessingStats(): {
    isProcessing: boolean;
    queueLength: number;
    activeJobs: number;
    maxConcurrentJobs: number;
    totalConnections: number;
  } {
    return {
      isProcessing: this.isProcessing,
      queueLength: this.processingQueue.length,
      activeJobs: this.activeJobs.size,
      maxConcurrentJobs: this.maxConcurrentJobs,
      totalConnections: WebSocketService.getTotalConnectionCount()
    };
  }

  /**
   * Updates the maximum concurrent jobs setting
   * @param maxJobs - Maximum number of concurrent jobs
   */
  static setMaxConcurrentJobs(maxJobs: number): void {
    this.maxConcurrentJobs = Math.max(1, Math.min(maxJobs, 10)); // Limit between 1-10
    console.log(`Max concurrent jobs set to ${this.maxConcurrentJobs}`);
  }

  /**
   * Utility method to sleep for a specified duration
   * @param ms - Milliseconds to sleep
   */
  private static sleep(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  /**
   * Forces processing of a specific job (bypasses queue)
   * @param jobId - Job identifier
   */
  static async forceProcessJob(jobId: string): Promise<void> {
    if (this.activeJobs.has(jobId)) {
      throw new Error(`Job ${jobId} is already being processed`);
    }

    this.activeJobs.add(jobId);
    
    try {
      await this.processJob(jobId);
    } finally {
      this.activeJobs.delete(jobId);
    }
  }

  /**
   * Removes a job from the processing queue
   * @param jobId - Job identifier
   */
  static removeFromQueue(jobId: string): boolean {
    const index = this.processingQueue.indexOf(jobId);
    if (index > -1) {
      this.processingQueue.splice(index, 1);
      console.log(`Job ${jobId} removed from processing queue`);
      return true;
    }
    return false;
  }
}
