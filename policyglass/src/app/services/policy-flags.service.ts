import { PrismaClient } from '../../generated/prisma';

const prisma = new PrismaClient();

export interface PolicyFlag {
  type: 'flag' | 'warning';
  title: string;
  description: string;
  sectionName: string;
  score: number;
  maxScore: number;
  percentage: number;
}

export interface PolicyFlagsResult {
  flags: PolicyFlag[];
  warnings: PolicyFlag[];
  totalFlags: number;
  totalWarnings: number;
}

export class PolicyFlagsService {
  private static readonly FLAG_THRESHOLD = 40; // Below 40% is flagged
  private static readonly WARNING_THRESHOLD = 69; // 40-69% is warning

  /**
   * Generate flags and warnings for an audit report based on section scores
   */
  static async generateFlags(reportId: number): Promise<PolicyFlagsResult> {
    try {
      // Get all section scores for the report
      const sectionScores = await prisma.sectionScore.findMany({
        where: {
          report_id: reportId
        },
        orderBy: {
          section_name: 'asc'
        }
      });

      const flags: PolicyFlag[] = [];
      const warnings: PolicyFlag[] = [];

      for (const section of sectionScores) {
        const percentage = (section.score / section.max_score) * 100;

        if (percentage < this.FLAG_THRESHOLD) {
          // This is a flag (critical issue)
          flags.push({
            type: 'flag',
            title: this.generateFlagTitle(section.section_name, percentage),
            description: this.generateFlagDescription(section.section_name, section.commentary, percentage),
            sectionName: section.section_name,
            score: section.score,
            maxScore: section.max_score,
            percentage: Math.round(percentage * 100) / 100
          });
        } else if (percentage < this.WARNING_THRESHOLD) {
          // This is a warning (needs attention)
          warnings.push({
            type: 'warning',
            title: this.generateWarningTitle(section.section_name, percentage),
            description: this.generateWarningDescription(section.section_name, section.commentary, percentage),
            sectionName: section.section_name,
            score: section.score,
            maxScore: section.max_score,
            percentage: Math.round(percentage * 100) / 100
          });
        }
      }

      return {
        flags,
        warnings,
        totalFlags: flags.length,
        totalWarnings: warnings.length
      };

    } catch (error) {
      console.error('Error generating policy flags:', error);
      throw new Error('Failed to generate policy flags');
    }
  }

  /**
   * Generate a flag title based on section name and score
   */
  private static generateFlagTitle(sectionName: string, percentage: number): string {
    const severity = percentage < 20 ? 'Critical' : 'Major';
    return `${severity} issue detected in ${sectionName}`;
  }

  /**
   * Generate a flag description
   */
  private static generateFlagDescription(sectionName: string, commentary: string, percentage: number): string {
    const baseDescription = `Section "${sectionName}" scored ${percentage.toFixed(1)}% (below 40% threshold).`;
    
    if (commentary && commentary.trim()) {
      return `${baseDescription} ${commentary}`;
    }

    // Generate generic descriptions based on common section types
    const genericDescriptions = this.getGenericDescriptions(sectionName, 'flag');
    return `${baseDescription} ${genericDescriptions}`;
  }

  /**
   * Generate a warning title based on section name and score
   */
  private static generateWarningTitle(sectionName: string, percentage: number): string {
    return `${sectionName} needs attention`;
  }

  /**
   * Generate a warning description
   */
  private static generateWarningDescription(sectionName: string, commentary: string, percentage: number): string {
    const baseDescription = `Section "${sectionName}" scored ${percentage.toFixed(1)}% (below optimal 70% threshold).`;
    
    if (commentary && commentary.trim()) {
      return `${baseDescription} ${commentary}`;
    }

    // Generate generic descriptions based on common section types
    const genericDescriptions = this.getGenericDescriptions(sectionName, 'warning');
    return `${baseDescription} ${genericDescriptions}`;
  }

  /**
   * Get generic descriptions for common policy sections
   */
  private static getGenericDescriptions(sectionName: string, type: 'flag' | 'warning'): string {
    const section = sectionName.toLowerCase();
    
    const descriptions: Record<string, { flag: string; warning: string }> = {
      'privacy': {
        flag: 'This indicates potential privacy violations or inadequate data protection measures.',
        warning: 'Consider strengthening privacy protections and data handling procedures.'
      },
      'data collection': {
        flag: 'Data collection practices may be excessive or lack proper justification.',
        warning: 'Review data collection practices to ensure they are necessary and proportionate.'
      },
      'user rights': {
        flag: 'User rights may be inadequately protected or difficult to exercise.',
        warning: 'Consider enhancing user rights provisions and making them more accessible.'
      },
      'transparency': {
        flag: 'Lack of transparency may undermine user trust and regulatory compliance.',
        warning: 'Improve transparency in policy language and data practices.'
      },
      'consent': {
        flag: 'Consent mechanisms may not meet legal requirements or best practices.',
        warning: 'Review consent processes to ensure they are clear and meaningful.'
      },
      'security': {
        flag: 'Security measures appear insufficient to protect user data adequately.',
        warning: 'Consider strengthening security measures and incident response procedures.'
      },
      'retention': {
        flag: 'Data retention periods may be excessive or poorly justified.',
        warning: 'Review data retention policies to ensure they are reasonable and necessary.'
      },
      'sharing': {
        flag: 'Data sharing practices may pose significant privacy risks.',
        warning: 'Consider limiting data sharing or improving safeguards for shared data.'
      }
    };

    // Find matching section
    for (const [key, desc] of Object.entries(descriptions)) {
      if (section.includes(key)) {
        return desc[type];
      }
    }

    // Default descriptions
    if (type === 'flag') {
      return 'This section requires immediate attention to address potential compliance or user protection issues.';
    } else {
      return 'This section could be improved to better protect users and ensure compliance.';
    }
  }

  /**
   * Get flags summary for display
   */
  static async getFlagsSummary(reportId: number): Promise<{
    criticalIssues: number;
    warningsCount: number;
    overallRisk: 'low' | 'medium' | 'high';
  }> {
    const flagsResult = await this.generateFlags(reportId);
    
    const criticalFlags = flagsResult.flags.filter(f => f.percentage < 20).length;
    const overallRisk = this.calculateOverallRisk(flagsResult);

    return {
      criticalIssues: criticalFlags,
      warningsCount: flagsResult.totalWarnings,
      overallRisk
    };
  }

  /**
   * Calculate overall risk level based on flags and warnings
   */
  private static calculateOverallRisk(flagsResult: PolicyFlagsResult): 'low' | 'medium' | 'high' {
    const criticalFlags = flagsResult.flags.filter(f => f.percentage < 20).length;
    const totalIssues = flagsResult.totalFlags + flagsResult.totalWarnings;

    if (criticalFlags > 0 || flagsResult.totalFlags > 2) {
      return 'high';
    } else if (flagsResult.totalFlags > 0 || flagsResult.totalWarnings > 3) {
      return 'medium';
    } else {
      return 'low';
    }
  }

  /**
   * Get formatted flags for results display
   */
  static async getFormattedFlags(reportId: number): Promise<{
    flagsIdentified: string[];
    warnings: string[];
  }> {
    const flagsResult = await this.generateFlags(reportId);

    const flagsIdentified = flagsResult.flags.map(flag => flag.title);
    const warnings = flagsResult.warnings.map(warning => warning.title);

    return {
      flagsIdentified,
      warnings
    };
  }
}
