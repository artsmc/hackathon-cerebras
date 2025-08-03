import { QuotaStatus } from '../types/user-quota.types';

export interface QuotaResponse {
  success: boolean;
  data?: QuotaStatus & { timeUntilReset: string };
  error?: string;
}

export interface QuotaValidationResponse {
  success: boolean;
  canCreateJob: boolean;
  message?: string;
  error?: string;
  quota?: QuotaStatus & { timeUntilReset: string };
}

export class QuotaClientService {
  private static readonly API_BASE = '/api/policy/jobs/quota';

  /**
   * Check user's current quota status
   */
  static async checkQuota(): Promise<QuotaResponse> {
    try {
      const response = await fetch(this.API_BASE, {
        method: 'GET',
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      const data = await response.json();

      if (!response.ok) {
        return {
          success: false,
          error: data.error || 'Failed to check quota'
        };
      }

      return {
        success: true,
        data: data.data
      };

    } catch (error) {
      console.error('Error checking quota:', error);
      return {
        success: false,
        error: 'Network error while checking quota'
      };
    }
  }

  /**
   * Validate if user can create a new job
   */
  static async validateJobCreation(): Promise<QuotaValidationResponse> {
    try {
      const response = await fetch(this.API_BASE, {
        method: 'POST',
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      const data = await response.json();

      if (response.status === 429) {
        // Quota exceeded
        return {
          success: false,
          canCreateJob: false,
          error: data.error,
          quota: data.quota
        };
      }

      if (!response.ok) {
        return {
          success: false,
          canCreateJob: false,
          error: data.error || 'Failed to validate job creation'
        };
      }

      return {
        success: true,
        canCreateJob: true,
        message: data.message
      };

    } catch (error) {
      console.error('Error validating job creation:', error);
      return {
        success: false,
        canCreateJob: false,
        error: 'Network error while validating job creation'
      };
    }
  }

  /**
   * Get formatted quota status message
   */
  static formatQuotaMessage(quota: QuotaStatus & { timeUntilReset: string }): string {
    if (quota.canCreateJob) {
      return `You have ${quota.remainingJobs} job${quota.remainingJobs !== 1 ? 's' : ''} remaining today.`;
    } else {
      return `Daily limit reached (${quota.totalJobs}/3). Resets in ${quota.timeUntilReset}.`;
    }
  }

  /**
   * Get quota status for dashboard display
   */
  static async getQuotaForDashboard(): Promise<{
    remainingJobs: number;
    totalJobs: number;
    canCreateJob: boolean;
    resetTime: string;
    message: string;
  } | null> {
    const response = await this.checkQuota();
    
    if (!response.success || !response.data) {
      return null;
    }

    const quota = response.data;
    return {
      remainingJobs: quota.remainingJobs,
      totalJobs: quota.totalJobs,
      canCreateJob: quota.canCreateJob,
      resetTime: quota.timeUntilReset,
      message: this.formatQuotaMessage(quota)
    };
  }
}
