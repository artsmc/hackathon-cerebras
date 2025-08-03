export interface SectionScore {
  id: number;
  report_id: number;
  section_name: string;
  score: number;
  max_score: number;
  commentary: string;
}

export interface Policy {
  id: number;
  company_name: string;
  source_url: string;
  terms_text: string;
  raw_response: string | null;
  created_at: Date;
}

export interface AuditReport {
  id: number;
  policy_id: number;
  total_score: number;
  letter_grade: string;
  overall_summary: string;
  raw_audit_json: string | null;
  created_at: Date;
  policy: Policy;
  section_scores: SectionScore[];
}

export interface AuditReportDisplay {
  id: number;
  url: string;
  flags: string[];
  warnings: string[];
  overallSummary: string;
  letterGrade: string;
  totalScore: number;
  createdAt: Date;
}
