import { PrismaClient } from '../../generated/prisma';
import { AuditReport, AuditReportDisplay } from '../types/audit-report.types';

const prisma = new PrismaClient();

export class AuditReportService {
  /**
   * Get audit report by ID with all related data
   * @param reportId - The audit report ID
   * @returns Complete audit report with section scores
   */
  static async getAuditReport(reportId: number): Promise<AuditReport> {
    try {
      const report = await prisma.auditReport.findUnique({
        where: { id: reportId },
        include: {
          section_scores: true,
          policy: true
        }
      });

      if (!report) {
        throw new Error('Audit report not found');
      }

      return report;
    } catch (error) {
      console.error('Error fetching audit report:', error);
      throw error;
    }
  }

  /**
   * Transform audit report data for frontend display
   * Extracts flags and warnings from section scores
   */
  static transformAuditReportForDisplay(report: AuditReport): AuditReportDisplay {
    const flags: string[] = [];
    const warnings: string[] = [];

    // Extract flags and warnings from section scores
    report.section_scores.forEach((section) => {
      // For now, we'll use simple logic - in practice this would be more sophisticated
      if (section.score < 50) {
        flags.push(`Critical issue in ${section.section_name}: ${section.commentary}`);
      } else if (section.score < 75) {
        warnings.push(`Warning in ${section.section_name}: ${section.commentary}`);
      }
    });

    return {
      id: report.id,
      url: report.policy.source_url,
      flags: flags.slice(0, 5), // Limit for display
      warnings: warnings.slice(0, 5), // Limit for display
      overallSummary: report.overall_summary,
      letterGrade: report.letter_grade,
      totalScore: report.total_score,
      createdAt: report.created_at
    };
  }
}
