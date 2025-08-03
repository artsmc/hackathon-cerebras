export interface JobHistoryItem {
  id: string;
  source_url: string;
  status: string;
  created_at: Date;
  progress_percentage: number;
}

export interface QuotaStatus {
  remainingJobs: number;
  totalJobs: number;
  resetTime: Date;
  canCreateJob: boolean;
}

export interface UserStats {
  quota: QuotaStatus;
  recentJobs: JobHistoryItem[];
  totalJobsAllTime: number;
}
