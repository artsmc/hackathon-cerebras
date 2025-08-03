import { z } from "zod";

/**
 * AI-SDK Schema for consumer policy audit
 * This schema defines the structure for policy analysis using generateObject/streamObject
 */
export const policyAuditSchema = z.object({
  sections: z.object({
    fairUse: z.object({
      score: z.number().min(0).max(10).describe("Score for Fair Use & Access"),
      maxScore: z.literal(10),
      commentary: z.string().describe("Brief rationale, highlighting any gaps")
    }),
    dataCollection: z.object({
      score: z.number().min(0).max(15).describe("Score for Data Collection practices"),
      maxScore: z.literal(15),
      commentary: z.string().describe("Analysis of data collection transparency and scope")
    }),
    dataSharing: z.object({
      score: z.number().min(0).max(15).describe("Score for Data Sharing policies"),
      maxScore: z.literal(15),
      commentary: z.string().describe("Evaluation of third-party sharing and user control")
    }),
    rightsAndControls: z.object({
      score: z.number().min(0).max(15).describe("Score for User Rights & Controls"),
      maxScore: z.literal(15),
      commentary: z.string().describe("Assessment of user rights and control mechanisms")
    }),
    liabilityAndSecurity: z.object({
      score: z.number().min(0).max(15).describe("Score for Liability & Security"),
      maxScore: z.literal(15),
      commentary: z.string().describe("Analysis of security measures and liability terms")
    }),
    policyChanges: z.object({
      score: z.number().min(0).max(10).describe("Score for Policy Changes notification"),
      maxScore: z.literal(10),
      commentary: z.string().describe("Evaluation of change notification and user consent")
    }),
    childrenVulnerable: z.object({
      score: z.number().min(0).max(5).describe("Score for Children & Vulnerable Groups protection"),
      maxScore: z.literal(5),
      commentary: z.string().describe("Assessment of protections for vulnerable populations")
    }),
    psychologicalAlgorithmic: z.object({
      score: z.number().min(0).max(5).describe("Score for Psychological & Algorithmic considerations"),
      maxScore: z.literal(5),
      commentary: z.string().describe("Analysis of algorithmic transparency and psychological impact")
    }),
    contentRights: z.object({
      score: z.number().min(0).max(5).describe("Score for Content Rights"),
      maxScore: z.literal(5),
      commentary: z.string().describe("Evaluation of user content ownership and usage rights")
    }),
    jurisdictionEnforcement: z.object({
      score: z.number().min(0).max(5).describe("Score for Jurisdiction & Enforcement"),
      maxScore: z.literal(5),
      commentary: z.string().describe("Assessment of legal jurisdiction and enforcement mechanisms")
    })
  }),
  totalScore: z.number().min(0).max(100).describe("Sum of all section scores"),
  letterGrade: z
    .enum(["A", "B", "C", "D", "E"])
    .describe("Letter grade from score: A (90-100), B (75-89), C (60-74), D (40-59), E (0-39)"),
  overallSummary: z.string().describe("Executive-style overview of strengths and gaps with actionable recommendations"),
  confidence: z.number().min(0).max(1).describe("AI confidence level in the analysis (0.0-1.0)")
});

/**
 * Type inference from the schema
 */
export type PolicyAuditResult = z.infer<typeof policyAuditSchema>;

/**
 * Individual section type for easier manipulation
 */
export type PolicySection = {
  score: number;
  maxScore: number;
  commentary: string;
};

/**
 * Job status enums for type safety
 */
export const JobStatus = {
  PENDING: "PENDING",
  PROCESSING: "PROCESSING", 
  COMPLETED: "COMPLETED",
  FAILED: "FAILED"
} as const;

export type JobStatusType = typeof JobStatus[keyof typeof JobStatus];

/**
 * Letter grade calculation utility
 */
export function calculateLetterGrade(score: number): "A" | "B" | "C" | "D" | "E" {
  if (score >= 90) return "A";
  if (score >= 75) return "B";
  if (score >= 60) return "C";
  if (score >= 40) return "D";
  return "E";
}

/**
 * System prompt template for AI-SDK generateObject
 */
export const POLICY_AUDIT_SYSTEM_PROMPT = `
You are a professional consumer privacy and policy auditor. Your job is to evaluate user-facing terms and privacy policy text based on a predefined 10-category scoring framework (total 100 points, mapped A–E). 

For each section, assign a numerical score (0 to max), provide a concise commentary noting alignment, strengths, gaps, and any misleading or missing elements. Then compute a totalScore and overallSummary, plus a letterGrade.

Scoring Guidelines:
- Fair Use & Access (10 points): Service availability, fair usage terms, accessibility
- Data Collection (15 points): Transparency, scope, necessity, user awareness
- Data Sharing (15 points): Third-party sharing, user control, transparency
- Rights & Controls (15 points): User rights, control mechanisms, data portability
- Liability & Security (15 points): Security measures, breach notification, liability terms
- Policy Changes (10 points): Change notification, user consent, grandfathering
- Children & Vulnerable (5 points): Special protections, age verification, vulnerable groups
- Psychological & Algorithmic (5 points): Algorithmic transparency, psychological manipulation
- Content Rights (5 points): User content ownership, usage rights, licensing
- Jurisdiction & Enforcement (5 points): Legal jurisdiction, dispute resolution, enforcement

Letter Grades: A (90-100), B (75-89), C (60-74), D (40-59), E (0-39)

You must output a JSON object strictly matching the provided schema. Do NOT output any additional keys or explanatory text.
`;
