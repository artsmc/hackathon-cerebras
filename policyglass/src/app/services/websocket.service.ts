import { WebSocket } from 'ws';
import { 
  WebSocketMessage, 
  JobUpdateMessage, 
  PhaseUpdateMessage, 
  ErrorMessage, 
  CompleteMessage 
} from '../types/policy-audit.types';
import { JobStatusType } from '../lib/schemas/policy-audit.schema';

/**
 * WebSocketService - Manages WebSocket connections for real-time job updates
 * Handles connection lifecycle and message broadcasting
 */
export class WebSocketService {
  private static connections = new Map<string, Set<WebSocket>>();
  private static globalConnections = new Set<WebSocket>();

  /**
   * Adds a WebSocket connection for a specific job
   * @param jobId - Job identifier
   * @param ws - WebSocket connection
   */
  static addConnection(jobId: string, ws: WebSocket): void {
    if (!this.connections.has(jobId)) {
      this.connections.set(jobId, new Set());
    }
    
    this.connections.get(jobId)!.add(ws);
    this.globalConnections.add(ws);

    // Handle connection close
    ws.on('close', () => {
      this.removeConnection(jobId, ws);
    });

    // Handle connection error
    ws.on('error', (error) => {
      console.error(`WebSocket error for job ${jobId}:`, error);
      this.removeConnection(jobId, ws);
    });

    console.log(`WebSocket connected for job ${jobId}. Total connections: ${this.connections.get(jobId)!.size}`);
  }

  /**
   * Removes a WebSocket connection
   * @param jobId - Job identifier
   * @param ws - WebSocket connection
   */
  static removeConnection(jobId: string, ws: WebSocket): void {
    const jobConnections = this.connections.get(jobId);
    if (jobConnections) {
      jobConnections.delete(ws);
      if (jobConnections.size === 0) {
        this.connections.delete(jobId);
      }
    }
    
    this.globalConnections.delete(ws);
    
    if (ws.readyState === WebSocket.OPEN) {
      ws.close();
    }

    console.log(`WebSocket disconnected for job ${jobId}`);
  }

  /**
   * Broadcasts a job update message to all connections for a job
   * @param jobId - Job identifier
   * @param message - Update message
   */
  static broadcastJobUpdate(jobId: string, message: JobUpdateMessage): void {
    const connections = this.connections.get(jobId);
    if (!connections || connections.size === 0) {
      return;
    }

    const messageString = JSON.stringify({
      ...message,
      timestamp: new Date()
    });

    this.sendToConnections(connections, messageString);
  }

  /**
   * Broadcasts a phase update message
   * @param jobId - Job identifier
   * @param message - Phase update message
   */
  static broadcastPhaseUpdate(jobId: string, message: PhaseUpdateMessage): void {
    const connections = this.connections.get(jobId);
    if (!connections || connections.size === 0) {
      return;
    }

    const messageString = JSON.stringify({
      ...message,
      timestamp: new Date()
    });

    this.sendToConnections(connections, messageString);
  }

  /**
   * Broadcasts an error message
   * @param jobId - Job identifier
   * @param message - Error message
   */
  static broadcastError(jobId: string, message: ErrorMessage): void {
    const connections = this.connections.get(jobId);
    if (!connections || connections.size === 0) {
      return;
    }

    const messageString = JSON.stringify({
      ...message,
      timestamp: new Date()
    });

    this.sendToConnections(connections, messageString);
  }

  /**
   * Broadcasts a completion message
   * @param jobId - Job identifier
   * @param message - Completion message
   */
  static broadcastComplete(jobId: string, message: CompleteMessage): void {
    const connections = this.connections.get(jobId);
    if (!connections || connections.size === 0) {
      return;
    }

    const messageString = JSON.stringify({
      ...message,
      timestamp: new Date()
    });

    this.sendToConnections(connections, messageString);
  }

  /**
   * Sends a message to a set of WebSocket connections
   * @param connections - Set of WebSocket connections
   * @param message - Message to send
   */
  private static sendToConnections(connections: Set<WebSocket>, message: string): void {
    const deadConnections: WebSocket[] = [];

    connections.forEach(ws => {
      if (ws.readyState === WebSocket.OPEN) {
        try {
          ws.send(message);
        } catch (error) {
          console.error('Failed to send WebSocket message:', error);
          deadConnections.push(ws);
        }
      } else {
        deadConnections.push(ws);
      }
    });

    // Clean up dead connections
    deadConnections.forEach(ws => {
      connections.delete(ws);
      this.globalConnections.delete(ws);
    });
  }

  /**
   * Gets the number of active connections for a job
   * @param jobId - Job identifier
   * @returns Number of active connections
   */
  static getConnectionCount(jobId: string): number {
    const connections = this.connections.get(jobId);
    return connections ? connections.size : 0;
  }

  /**
   * Gets total number of active connections
   * @returns Total number of connections
   */
  static getTotalConnectionCount(): number {
    return this.globalConnections.size;
  }

  /**
   * Closes all connections for a job
   * @param jobId - Job identifier
   */
  static closeJobConnections(jobId: string): void {
    const connections = this.connections.get(jobId);
    if (!connections) {
      return;
    }

    connections.forEach(ws => {
      if (ws.readyState === WebSocket.OPEN) {
        ws.close();
      }
    });

    this.connections.delete(jobId);
  }

  /**
   * Closes all WebSocket connections
   */
  static closeAllConnections(): void {
    this.globalConnections.forEach(ws => {
      if (ws.readyState === WebSocket.OPEN) {
        ws.close();
      }
    });

    this.connections.clear();
    this.globalConnections.clear();
  }

  /**
   * Sends a ping to all connections to keep them alive
   */
  static pingAllConnections(): void {
    const deadConnections: WebSocket[] = [];

    this.globalConnections.forEach(ws => {
      if (ws.readyState === WebSocket.OPEN) {
        try {
          ws.ping();
        } catch (error) {
          console.error('Failed to ping WebSocket:', error);
          deadConnections.push(ws);
        }
      } else {
        deadConnections.push(ws);
      }
    });

    // Clean up dead connections
    deadConnections.forEach(ws => {
      this.globalConnections.delete(ws);
      // Remove from job-specific connections too
      this.connections.forEach((jobConnections, jobId) => {
        if (jobConnections.has(ws)) {
          jobConnections.delete(ws);
          if (jobConnections.size === 0) {
            this.connections.delete(jobId);
          }
        }
      });
    });
  }

  /**
   * Helper method to create job update messages
   */
  static createJobUpdateMessage(
    jobId: string,
    status: string,
    progressPercentage: number,
    phase: 'research' | 'audit',
    phaseStatus: string,
    confidence?: number,
    error?: string
  ): JobUpdateMessage {
    return {
      type: 'JOB_UPDATE',
      jobId,
      data: {
        status: status as JobStatusType,
        progressPercentage,
        phase,
        phaseStatus: phaseStatus as JobStatusType,
        confidence,
        error
      },
      timestamp: new Date()
    };
  }

  /**
   * Helper method to create phase update messages
   */
  static createPhaseUpdateMessage(
    jobId: string,
    phase: 'research' | 'audit',
    status: string,
    startedAt?: Date,
    completedAt?: Date,
    confidence?: number,
    error?: string,
    resultId?: number
  ): PhaseUpdateMessage {
    return {
      type: 'PHASE_UPDATE',
      jobId,
      data: {
        phase,
        status: status as JobStatusType,
        startedAt,
        completedAt,
        confidence,
        error,
        resultId
      },
      timestamp: new Date()
    };
  }

  /**
   * Helper method to create error messages
   */
  static createErrorMessage(
    jobId: string,
    phase: 'research' | 'audit' | 'system',
    error: string,
    details?: Record<string, unknown>
  ): ErrorMessage {
    return {
      type: 'ERROR',
      jobId,
      data: {
        phase,
        error,
        details
      },
      timestamp: new Date()
    };
  }

  /**
   * Helper method to create completion messages
   */
  static createCompleteMessage(
    jobId: string,
    policyId: number,
    auditReportId: number,
    finalScore: number,
    letterGrade: string,
    confidence: number
  ): CompleteMessage {
    return {
      type: 'COMPLETE',
      jobId,
      data: {
        policyId,
        auditReportId,
        finalScore,
        letterGrade,
        confidence
      },
      timestamp: new Date()
    };
  }
}

// Start a ping interval to keep connections alive
if (typeof setInterval !== 'undefined') {
  setInterval(() => {
    WebSocketService.pingAllConnections();
  }, 30000); // Ping every 30 seconds
}
