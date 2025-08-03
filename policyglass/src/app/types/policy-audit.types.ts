import { JobStatusType } from '../lib/schemas/policy-audit.schema';

/**
 * Policy Job Status Interface
 * Represents the complete status of a policy analysis job
 */
export interface PolicyJobStatus {
  id: string;
  jobType: string;
  sourceUrl: string;
  status: JobStatusType;
  progressPercentage: number;
  
  // Research phase
  researchStatus: JobStatusType;
  researchStartedAt?: Date;
  researchCompletedAt?: Date;
  researchError?: string;
  researchConfidence?: number;
  policyId?: number;
  
  // Audit phase
  auditStatus: JobStatusType;
  auditStartedAt?: Date;
  auditCompletedAt?: Date;
  auditError?: string;
  auditConfidence?: number;
  auditReportId?: number;
  
  // Metadata
  createdAt: Date;
  updatedAt: Date;
  expiresAt: Date;
}

/**
 * WebSocket Message Types for real-time updates
 */
export interface WebSocketMessage {
  type: 'JOB_UPDATE' | 'PHASE_UPDATE' | 'ERROR' | 'COMPLETE';
  jobId: string;
  data: Record<string, unknown>;
  timestamp: Date;
}

export interface JobUpdateMessage extends WebSocketMessage {
  type: 'JOB_UPDATE';
  data: {
    status: JobStatusType;
    progressPercentage: number;
    phase: 'research' | 'audit';
    phaseStatus: JobStatusType;
    confidence?: number;
    error?: string;
  };
}

export interface PhaseUpdateMessage extends WebSocketMessage {
  type: 'PHASE_UPDATE';
  data: {
    phase: 'research' | 'audit';
    status: JobStatusType;
    startedAt?: Date;
    completedAt?: Date;
    confidence?: number;
    error?: string;
    resultId?: number; // policyId for research, auditReportId for audit
  };
}

export interface ErrorMessage extends WebSocketMessage {
  type: 'ERROR';
  data: {
    phase: 'research' | 'audit' | 'system';
    error: string;
    details?: Record<string, unknown>;
  };
}

export interface CompleteMessage extends WebSocketMessage {
  type: 'COMPLETE';
  data: {
    policyId: number;
    auditReportId: number;
    finalScore: number;
    letterGrade: string;
    confidence: number;
  };
}

/**
 * API Request/Response Types
 */
export interface CreateJobRequest {
  url: string;
}

export interface CreateJobResponse {
  jobId: string;
  message: string;
  estimatedDuration?: number; // in seconds
}

export interface JobStatusResponse {
  job: PolicyJobStatus;
  policy?: {
    id: number;
    companyName: string;
    sourceUrl: string;
    termsText: string;
    createdAt: Date;
  };
  auditReport?: {
    id: number;
    totalScore: number;
    letterGrade: string;
    overallSummary: string;
    createdAt: Date;
    sections: Array<{
      sectionName: string;
      score: number;
      maxScore: number;
      commentary: string;
    }>;
  };
}

/**
 * Service Layer Types
 */
export interface JobUpdateData {
  status?: JobStatusType;
  progressPercentage?: number;
  researchStatus?: JobStatusType;
  researchStartedAt?: Date;
  researchCompletedAt?: Date;
  researchError?: string;
  researchConfidence?: number;
  policyId?: number;
  auditStatus?: JobStatusType;
  auditStartedAt?: Date;
  auditCompletedAt?: Date;
  auditError?: string;
  auditConfidence?: number;
  auditReportId?: number;
}

/**
 * Background Processing Types
 */
export interface JobQueueItem {
  jobId: string;
  priority: number;
  retryCount: number;
  maxRetries: number;
  scheduledAt: Date;
}

export interface ProcessingContext {
  jobId: string;
  phase: 'research' | 'audit';
  startTime: Date;
  websocketConnections: Set<string>;
}

/**
 * Error Types
 */
export class PolicyJobError extends Error {
  constructor(
    message: string,
    public jobId: string,
    public phase: 'research' | 'audit',
    public originalError?: Error
  ) {
    super(message);
    this.name = 'PolicyJobError';
  }
}

export class ResearchError extends PolicyJobError {
  constructor(message: string, jobId: string, originalError?: Error) {
    super(message, jobId, 'research', originalError);
    this.name = 'ResearchError';
  }
}

export class AuditError extends PolicyJobError {
  constructor(message: string, jobId: string, originalError?: Error) {
    super(message, jobId, 'audit', originalError);
    this.name = 'AuditError';
  }
}
