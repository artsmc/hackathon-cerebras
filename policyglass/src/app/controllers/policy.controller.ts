import { NextRequest } from 'next/server';
import { PolicyResearchService } from '../services/policy-research.service';
import { ZodError } from 'zod';
import { PolicyResearchRequestSchema } from '../lib/openapi/schemas';

export class PolicyController {
  static async researchPolicy(request: NextRequest) {
    try {
      const body = await request.json();
      
      // Validate input using Zod schema
      const validatedData = PolicyResearchRequestSchema.parse(body);
      const { url } = validatedData;

      // Research and store policy
      const policyId = await PolicyResearchService.researchAndStorePolicy(url);

      return {
        policyId,
        message: 'Policy research completed and stored successfully'
      };

    } catch (error: unknown) {
      if (error instanceof ZodError) {
        return { error: 'Invalid input data', details: error.issues };
      }

      console.error('Policy research controller error:', error);
      return { error: 'Failed to research and store policy' };
    }
  }
}
