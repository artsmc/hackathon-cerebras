import { PrismaClient } from '../../generated/prisma';
import { QuotaStatus, JobHistoryItem, UserStats } from '../types/user-quota.types';

const prisma = new PrismaClient();

export class UserQuotaService {
  private static readonly DAILY_JOB_LIMIT = 3;
  private static readonly HOURS_IN_DAY = 24;

  /**
   * Check if user can create a new job based on daily quota
   */
  static async checkDailyQuota(userId: number): Promise<QuotaStatus> {
    const now = new Date();
    const twentyFourHoursAgo = new Date(now.getTime() - (this.HOURS_IN_DAY * 60 * 60 * 1000));

    // Count jobs created in the last 24 hours
    const jobsInLast24Hours = await prisma.policyJob.count({
      where: {
        user_id: userId,
        created_at: {
          gte: twentyFourHoursAgo
        }
      }
    });

    const remainingJobs = Math.max(0, this.DAILY_JOB_LIMIT - jobsInLast24Hours);
    const canCreateJob = remainingJobs > 0;

    // Calculate reset time (24 hours from the oldest job in the current window)
    const oldestJobInWindow = await prisma.policyJob.findFirst({
      where: {
        user_id: userId,
        created_at: {
          gte: twentyFourHoursAgo
        }
      },
      orderBy: {
        created_at: 'asc'
      }
    });

    const resetTime = oldestJobInWindow 
      ? new Date(oldestJobInWindow.created_at.getTime() + (this.HOURS_IN_DAY * 60 * 60 * 1000))
      : now;

    return {
      remainingJobs,
      totalJobs: jobsInLast24Hours,
      resetTime,
      canCreateJob
    };
  }

  /**
   * Get remaining jobs for a user
   */
  static async getRemainingJobs(userId: number): Promise<number> {
    const quotaStatus = await this.checkDailyQuota(userId);
    return quotaStatus.remainingJobs;
  }

  /**
   * Validate if user can create a job and throw error if not
   */
  static async validateJobCreation(userId: number): Promise<void> {
    const quotaStatus = await this.checkDailyQuota(userId);
    
    if (!quotaStatus.canCreateJob) {
      const resetTimeString = quotaStatus.resetTime.toLocaleString();
      throw new Error(
        `Daily job limit of ${this.DAILY_JOB_LIMIT} reached. ` +
        `You can create new jobs after ${resetTimeString}.`
      );
    }
  }

  /**
   * Get user's job history for the last 24 hours
   */
  static async getUserJobHistory(userId: number): Promise<JobHistoryItem[]> {
    const now = new Date();
    const twentyFourHoursAgo = new Date(now.getTime() - (this.HOURS_IN_DAY * 60 * 60 * 1000));

    return await prisma.policyJob.findMany({
      where: {
        user_id: userId,
        created_at: {
          gte: twentyFourHoursAgo
        }
      },
      orderBy: {
        created_at: 'desc'
      },
      select: {
        id: true,
        source_url: true,
        status: true,
        created_at: true,
        progress_percentage: true
      }
    });
  }

  /**
   * Get comprehensive user statistics
   */
  static async getUserStats(userId: number): Promise<UserStats> {
    const [quota, recentJobs, totalJobsAllTime] = await Promise.all([
      this.checkDailyQuota(userId),
      this.getUserJobHistory(userId),
      prisma.policyJob.count({
        where: { user_id: userId }
      })
    ]);

    return {
      quota,
      recentJobs,
      totalJobsAllTime
    };
  }

  /**
   * Check if user has any active jobs (PENDING or PROCESSING)
   */
  static async hasActiveJobs(userId: number): Promise<boolean> {
    const activeJobCount = await prisma.policyJob.count({
      where: {
        user_id: userId,
        status: {
          in: ['PENDING', 'PROCESSING']
        }
      }
    });

    return activeJobCount > 0;
  }

  /**
   * Get time until quota resets in milliseconds
   */
  static async getTimeUntilReset(userId: number): Promise<number> {
    const quotaStatus = await this.checkDailyQuota(userId);
    const now = new Date();
    return Math.max(0, quotaStatus.resetTime.getTime() - now.getTime());
  }

  /**
   * Format time until reset as human readable string
   */
  static async getFormattedTimeUntilReset(userId: number): Promise<string> {
    const timeUntilReset = await this.getTimeUntilReset(userId);
    
    if (timeUntilReset === 0) {
      return 'Now';
    }

    const hours = Math.floor(timeUntilReset / (1000 * 60 * 60));
    const minutes = Math.floor((timeUntilReset % (1000 * 60 * 60)) / (1000 * 60));

    if (hours > 0) {
      return `${hours}h ${minutes}m`;
    } else {
      return `${minutes}m`;
    }
  }
}
