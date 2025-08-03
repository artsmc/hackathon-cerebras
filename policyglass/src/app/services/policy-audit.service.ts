import { PrismaClient } from '../../generated/prisma';
import { generateObject } from 'ai';
import { createOpenAI } from '@ai-sdk/openai';
import { 
  policyAuditSchema, 
  PolicyAuditResult, 
  POLICY_AUDIT_SYSTEM_PROMPT,
  calculateLetterGrade 
} from '../lib/schemas/policy-audit.schema';
import { AuditError } from '../types/policy-audit.types';
import { JobLoggerService } from './job-logger.service';

const prisma = new PrismaClient();

const openai = createOpenAI({
  apiKey: process.env.OPENAI_RESEARCHREPORT,
});

const model = openai('gpt-4o-mini');

/**
 * PolicyAuditService - Generates AI-powered policy audits using AI-SDK
 * Creates comprehensive audit reports with structured scoring
 */
export class PolicyAuditService {

  /**
   * Generates a comprehensive policy audit using AI-SDK
   * @param policyId - Policy ID to audit
   * @returns Audit report ID and confidence score
   */
  static async generateAuditReport(policyId: number): Promise<{ auditReportId: number; confidence: number }> {
    const startTime = Date.now();
    try {
      // Fetch policy data
      const policy = await prisma.policy.findUnique({
        where: { id: policyId }
      });

      if (!policy) {
        throw new Error(`Policy with ID ${policyId} not found`);
      }

      // Generate audit using AI-SDK
      const auditResult = await this.performAIAudit(policy.terms_text);
      
      // Store audit report in database
      const auditReportId = await this.storeAuditReport(policyId, auditResult);

      const totalTime = Date.now() - startTime;
      JobLoggerService.logAIServiceCall('PolicyAuditService', 'generateAuditReport', totalTime, true);

      return {
        auditReportId,
        confidence: auditResult.confidence
      };

    } catch (error) {
      const totalTime = Date.now() - startTime;
      JobLoggerService.logAIServiceCall('PolicyAuditService', 'generateAuditReport', totalTime, false);
      console.error(`Failed to generate audit for policy ${policyId}:`, error);
      throw new AuditError(
        `Failed to generate policy audit: ${error instanceof Error ? error.message : 'Unknown error'}`,
        `policy-${policyId}`,
        error as Error
      );
    }
  }

  /**
   * Performs AI-powered audit using AI-SDK generateObject
   * @param policyText - Policy text to analyze
   * @returns Structured audit result
   */
  private static async performAIAudit(policyText: string): Promise<PolicyAuditResult> {
    const startTime = Date.now();
    try {
      const { object } = await generateObject({
        model: model,
        schema: policyAuditSchema,
        schemaName: "ConsumerPolicyAudit",
        schemaDescription: "Per-section scoring framework for consumer protection, total 0-100, letter grade A-E",
        prompt: `${POLICY_AUDIT_SYSTEM_PROMPT}

Here is the policy text to audit. Please begin evaluation:

${policyText}`,
        temperature: 0.3, // Lower temperature for more consistent scoring
      });

      // Add confidence field if missing (default to 0.8)
      if (object.confidence === undefined) {
        object.confidence = 0.8;
      }

      // Validate and calculate total score
      const calculatedTotal = this.calculateTotalScore(object.sections);
      const calculatedGrade = calculateLetterGrade(calculatedTotal);

      // Ensure consistency
      if (Math.abs(object.totalScore - calculatedTotal) > 1) {
        console.warn(`Score mismatch: AI reported ${object.totalScore}, calculated ${calculatedTotal}`);
        object.totalScore = calculatedTotal;
      }

      if (object.letterGrade !== calculatedGrade) {
        console.warn(`Grade mismatch: AI reported ${object.letterGrade}, calculated ${calculatedGrade}`);
        object.letterGrade = calculatedGrade;
      }

      const totalTime = Date.now() - startTime;
      JobLoggerService.logAIServiceCall('PolicyAuditService', 'performAIAudit', totalTime, true);

      return object;

    } catch (error) {
      const totalTime = Date.now() - startTime;
      JobLoggerService.logAIServiceCall('PolicyAuditService', 'performAIAudit', totalTime, false);
      console.error('AI audit generation failed:', error);
      throw new Error(`AI audit generation failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  /**
   * Calculates total score from all sections
   * @param sections - Audit sections
   * @returns Total score
   */
  private static calculateTotalScore(sections: PolicyAuditResult['sections']): number {
    return (
      sections.fairUse.score +
      sections.dataCollection.score +
      sections.dataSharing.score +
      sections.rightsAndControls.score +
      sections.liabilityAndSecurity.score +
      sections.policyChanges.score +
      sections.childrenVulnerable.score +
      sections.psychologicalAlgorithmic.score +
      sections.contentRights.score +
      sections.jurisdictionEnforcement.score
    );
  }

  /**
   * Stores audit report and section scores in database
   * @param policyId - Policy ID
   * @param auditResult - AI-generated audit result
   * @returns Created audit report ID
   */
  private static async storeAuditReport(policyId: number, auditResult: PolicyAuditResult): Promise<number> {
    const startTime = Date.now();
    try {
      // Create audit report
      const auditReport = await prisma.auditReport.create({
        data: {
          policy_id: policyId,
          total_score: auditResult.totalScore,
          letter_grade: auditResult.letterGrade,
          overall_summary: auditResult.overallSummary,
          raw_audit_json: JSON.stringify(auditResult),
        }
      });

      JobLoggerService.logDatabaseOperation('create', 'AuditReport', auditReport.id);

      // Create section scores
      const sectionScores = [
        {
          report_id: auditReport.id,
          section_name: 'Fair Use & Access',
          score: auditResult.sections.fairUse.score,
          max_score: auditResult.sections.fairUse.maxScore,
          commentary: auditResult.sections.fairUse.commentary,
        },
        {
          report_id: auditReport.id,
          section_name: 'Data Collection',
          score: auditResult.sections.dataCollection.score,
          max_score: auditResult.sections.dataCollection.maxScore,
          commentary: auditResult.sections.dataCollection.commentary,
        },
        {
          report_id: auditReport.id,
          section_name: 'Data Sharing',
          score: auditResult.sections.dataSharing.score,
          max_score: auditResult.sections.dataSharing.maxScore,
          commentary: auditResult.sections.dataSharing.commentary,
        },
        {
          report_id: auditReport.id,
          section_name: 'Rights & Controls',
          score: auditResult.sections.rightsAndControls.score,
          max_score: auditResult.sections.rightsAndControls.maxScore,
          commentary: auditResult.sections.rightsAndControls.commentary,
        },
        {
          report_id: auditReport.id,
          section_name: 'Liability & Security',
          score: auditResult.sections.liabilityAndSecurity.score,
          max_score: auditResult.sections.liabilityAndSecurity.maxScore,
          commentary: auditResult.sections.liabilityAndSecurity.commentary,
        },
        {
          report_id: auditReport.id,
          section_name: 'Policy Changes',
          score: auditResult.sections.policyChanges.score,
          max_score: auditResult.sections.policyChanges.maxScore,
          commentary: auditResult.sections.policyChanges.commentary,
        },
        {
          report_id: auditReport.id,
          section_name: 'Children & Vulnerable',
          score: auditResult.sections.childrenVulnerable.score,
          max_score: auditResult.sections.childrenVulnerable.maxScore,
          commentary: auditResult.sections.childrenVulnerable.commentary,
        },
        {
          report_id: auditReport.id,
          section_name: 'Psychological & Algorithmic',
          score: auditResult.sections.psychologicalAlgorithmic.score,
          max_score: auditResult.sections.psychologicalAlgorithmic.maxScore,
          commentary: auditResult.sections.psychologicalAlgorithmic.commentary,
        },
        {
          report_id: auditReport.id,
          section_name: 'Content Rights',
          score: auditResult.sections.contentRights.score,
          max_score: auditResult.sections.contentRights.maxScore,
          commentary: auditResult.sections.contentRights.commentary,
        },
        {
          report_id: auditReport.id,
          section_name: 'Jurisdiction & Enforcement',
          score: auditResult.sections.jurisdictionEnforcement.score,
          max_score: auditResult.sections.jurisdictionEnforcement.maxScore,
          commentary: auditResult.sections.jurisdictionEnforcement.commentary,
        },
      ];

      await prisma.sectionScore.createMany({
        data: sectionScores
      });

      JobLoggerService.logDatabaseOperation('createMany', 'SectionScore', auditReport.id);

      const totalTime = Date.now() - startTime;
      JobLoggerService.logAIServiceCall('PolicyAuditService', 'storeAuditReport', totalTime, true);

      return auditReport.id;

    } catch (error) {
      const totalTime = Date.now() - startTime;
      JobLoggerService.logAIServiceCall('PolicyAuditService', 'storeAuditReport', totalTime, false);
      console.error('Failed to store audit report:', error);
      throw new Error(`Failed to store audit report: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  /**
   * Retrieves a complete audit report with sections
   * @param auditReportId - Audit report ID
   * @returns Complete audit report data
   */
  static async getAuditReport(auditReportId: number) {
    const startTime = Date.now();
    try {
      const auditReport = await prisma.auditReport.findUnique({
        where: { id: auditReportId },
        include: {
          section_scores: true,
          policy: true
        }
      });

      if (!auditReport) {
        return null;
      }

      const result = {
        id: auditReport.id,
        policyId: auditReport.policy_id,
        totalScore: auditReport.total_score,
        letterGrade: auditReport.letter_grade,
        overallSummary: auditReport.overall_summary,
        createdAt: auditReport.created_at,
        policy: {
          id: auditReport.policy.id,
          companyName: auditReport.policy.company_name,
          sourceUrl: auditReport.policy.source_url,
          createdAt: auditReport.policy.created_at,
        },
        sections: auditReport.section_scores.map(section => ({
          sectionName: section.section_name,
          score: section.score,
          maxScore: section.max_score,
          commentary: section.commentary,
        })),
        rawAuditData: auditReport.raw_audit_json ? JSON.parse(auditReport.raw_audit_json) : null,
      };

      const totalTime = Date.now() - startTime;
      JobLoggerService.logAIServiceCall('PolicyAuditService', 'getAuditReport', totalTime, true);

      return result;

    } catch (error) {
      const totalTime = Date.now() - startTime;
      JobLoggerService.logAIServiceCall('PolicyAuditService', 'getAuditReport', totalTime, false);
      console.error(`Failed to get audit report ${auditReportId}:`, error);
      throw new Error(`Failed to retrieve audit report: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  /**
   * Validates audit result structure and scores
   * @param auditResult - Audit result to validate
   * @returns True if valid
   */
  private static validateAuditResult(auditResult: PolicyAuditResult): boolean {
    const startTime = Date.now();
    try {
      // Check score ranges
      const sections = auditResult.sections;
      const validations = [
        sections.fairUse.score >= 0 && sections.fairUse.score <= 10,
        sections.dataCollection.score >= 0 && sections.dataCollection.score <= 15,
        sections.dataSharing.score >= 0 && sections.dataSharing.score <= 15,
        sections.rightsAndControls.score >= 0 && sections.rightsAndControls.score <= 15,
        sections.liabilityAndSecurity.score >= 0 && sections.liabilityAndSecurity.score <= 15,
        sections.policyChanges.score >= 0 && sections.policyChanges.score <= 10,
        sections.childrenVulnerable.score >= 0 && sections.childrenVulnerable.score <= 5,
        sections.psychologicalAlgorithmic.score >= 0 && sections.psychologicalAlgorithmic.score <= 5,
        sections.contentRights.score >= 0 && sections.contentRights.score <= 5,
        sections.jurisdictionEnforcement.score >= 0 && sections.jurisdictionEnforcement.score <= 5,
      ];

      const isValid = validations.every(v => v) && 
             auditResult.totalScore >= 0 && 
             auditResult.totalScore <= 100 &&
             auditResult.confidence >= 0 && 
             auditResult.confidence <= 1;

      const totalTime = Date.now() - startTime;
      JobLoggerService.logAIServiceCall('PolicyAuditService', 'validateAuditResult', totalTime, isValid);

      return isValid;

    } catch (error) {
      const totalTime = Date.now() - startTime;
      JobLoggerService.logAIServiceCall('PolicyAuditService', 'validateAuditResult', totalTime, false);
      console.error('Audit result validation failed:', error);
      return false;
    }
  }
}
