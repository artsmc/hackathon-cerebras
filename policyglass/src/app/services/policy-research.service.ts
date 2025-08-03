import { PrismaClient } from '../../generated/prisma';
import { createOpenAI } from '@ai-sdk/openai';
import { generateText } from 'ai';
import { JobLoggerService } from './job-logger.service';

const prisma = new PrismaClient();

const openai = createOpenAI({
  apiKey: process.env.OPENAI_RESEARCHREPORT,
});

const model = openai('gpt-4o-mini');

export class PolicyResearchService {
  static async extractCompanyName(url: string): Promise<string> {
    // const startTime = Date.now();
    try {
      const { text } = await generateText({
        model: model,
        prompt: `Extract the company name from this website: ${url}. Return only the company name, nothing else.`,
        tools: {
          web_search_preview: openai.tools.webSearchPreview({
            searchContextSize: 'medium'
          }),
        },
      });

      const companyName = text.trim();
      JobLoggerService.logCompanyNameFound('unknown', companyName); // TODO: Pass jobId
      return companyName;
    } catch (error) {
      console.error('Company name extraction error:', error);
      throw new Error('Failed to extract company name');
    }
  }

  static async researchPolicyTerms(companyName: string, url: string): Promise<{ terms_text: string, raw_response: string }> {
    // const startTime = Date.now();
    try {
      const { text } = await generateText({
        model: model,
        prompt: `Research the terms of service and privacy policy for ${companyName} at ${url}. Provide a comprehensive analysis of at least 1500 words covering key clauses, user rights, restrictions, and important policy details. Translate to English if needed.`,
        tools: {
          web_search_preview: openai.tools.webSearchPreview({
            searchContextSize: 'medium'
          }),
        },
      });

      return {
        terms_text: text,
        raw_response: text
      };
    } catch (error) {
      console.error('Policy research error:', error);
      throw new Error('Failed to research policy terms');
    }
  }

  static async storePolicyResearch(url: string, researchData: { company_name: string, terms_text: string, raw_response: string }): Promise<number> {
    // const startTime = Date.now();
    try {
      const policy = await prisma.policy.create({
        data: {
          company_name: researchData.company_name,
          source_url: url,
          terms_text: researchData.terms_text,
          raw_response: researchData.raw_response,
        }
      });

      JobLoggerService.logDatabaseOperation('create', 'Policy', policy.id);
      return policy.id;
    } catch (error) {
      console.error('Policy storage error:', error);
      throw new Error('Failed to store policy research');
    }
  }

  static async researchAndStorePolicy(url: string): Promise<number> {
    const startTime = Date.now();
    try {
      const companyName = await this.extractCompanyName(url);
      const policyTerms = await this.researchPolicyTerms(companyName, url);
      const policyId = await this.storePolicyResearch(url, {
        company_name: companyName,
        terms_text: policyTerms.terms_text,
        raw_response: policyTerms.raw_response,
      });

      const totalTime = Date.now() - startTime;
      JobLoggerService.logAIServiceCall('PolicyResearchService', 'researchAndStorePolicy', totalTime, true);
      return policyId;
    } catch (error) {
      const totalTime = Date.now() - startTime;
      JobLoggerService.logAIServiceCall('PolicyResearchService', 'researchAndStorePolicy', totalTime, false);
      console.error('Research and store error:', error);
      throw error;
    }
  }
}
