import { PrismaClient } from '../../generated/prisma';
import { createOpenAI } from '@ai-sdk/openai';
import { generateText } from 'ai';

const prisma = new PrismaClient();

export class PolicyResearchService {
  private static openai = createOpenAI({
    apiKey: process.env.OPENAI_RESEARCHREPORT,
  });

  static async researchPolicyTerms(url: string): Promise<{ 
    company_name: string; 
    terms_text: string;
    raw_response: string;
  }> {
    try {
      const prompt = `You are a research assistant. Read the user's topic and return a full description of the terms and policy. give me at least 1500 words. pass the company name as well. translate to English

Research the policy terms for the website: ${url}

Please provide:
1. The company name
2. A comprehensive analysis of their terms and conditions/policy documents (at least 1500 words)
3. Any important clauses, restrictions, or user rights information

Format your response clearly with the company name at the beginning, followed by the detailed policy analysis.`;

      const { text } = await generateText({
        model: this.openai('gpt-4o'),
        prompt: prompt,
      });

      // Parse the response to extract company name and terms text
      const parsedResponse = this.parseAIResponse(text);
      
      return {
        company_name: parsedResponse.company_name,
        terms_text: parsedResponse.terms_text,
        raw_response: text,
      };

    } catch (error) {
      console.error('Policy research error:', error);
      throw new Error('Failed to research policy terms');
    }
  }

  static parseAIResponse(response: string): { company_name: string; terms_text: string } {
    // Simple parsing - extract company name from first line and rest as terms
    const lines = response.split('\n').filter(line => line.trim() !== '');
    
    if (lines.length === 0) {
      throw new Error('Invalid AI response format');
    }

    // Assume first line contains company name
    const company_name = lines[0].replace(/^Company Name:?\s*/i, '').trim();
    
    // Rest of the content is the terms text
    const terms_text = lines.slice(1).join('\n').trim();

    if (!terms_text) {
      throw new Error('AI response missing terms text');
    }

    return { company_name, terms_text };
  }

  static async storePolicyResearch(url: string, researchData: { 
    company_name: string; 
    terms_text: string;
    raw_response: string;
  }): Promise<number> {
    try {
      const policy = await prisma.policy.create({
        data: {
          company_name: researchData.company_name,
          source_url: url,
          terms_text: researchData.terms_text,
          raw_response: researchData.raw_response,
        }
      });

      return policy.id;

    } catch (error) {
      console.error('Policy storage error:', error);
      throw new Error('Failed to store policy research');
    }
  }

  static async researchAndStorePolicy(url: string): Promise<number> {
    try {
      const researchData = await this.researchPolicyTerms(url);
      const policyId = await this.storePolicyResearch(url, researchData);
      return policyId;
    } catch (error) {
      console.error('Research and store error:', error);
      throw error;
    }
  }
}
