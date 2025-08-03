export interface PolicyListItem {
  id: number;
  url: string;
  company: string;
  created_at: string;
  reportId?: number;
}

export interface PolicyListResponse {
  policies: PolicyListItem[];
  total: number;
  page: number;
  totalPages: number;
}

export interface PolicyListParams {
  search?: string;
  page?: number;
  limit?: number;
}
