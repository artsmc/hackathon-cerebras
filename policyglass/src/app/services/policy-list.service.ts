import { PrismaClient } from '../../generated/prisma';
import { PolicyListItem, PolicyListParams, PolicyListResponse } from '../types/policy-list.types';

const prisma = new PrismaClient();

export class PolicyListService {
  /**
   * Search policies with fuzzy matching against company name and URL
   * Returns limited data for security: url, company, id, created_at, reportId
   */
  async searchPolicies(params: PolicyListParams): Promise<PolicyListResponse> {
    const { search = '', page = 1, limit = 20 } = params;
    const skip = (page - 1) * limit;

    // Build search conditions
    const searchConditions = search
      ? {
          OR: [
            { company_name: { contains: search } },
            { source_url: { contains: search } }
          ]
        }
      : {};

    // Get total count for pagination
    const total = await prisma.policy.count({
      where: searchConditions
    });

    // Get policies with limited fields
    const policies = await prisma.policy.findMany({
      where: searchConditions,
      skip,
      take: limit,
      orderBy: {
        created_at: 'desc'
      },
      select: {
        id: true,
        source_url: true,
        company_name: true,
        created_at: true,
        audit_reports: {
          select: {
            id: true
          },
          orderBy: {
            created_at: 'desc'
          },
          take: 1
        }
      }
    });

    // Transform to PolicyListItem format
    const policyListItems: PolicyListItem[] = policies.map(policy => ({
      id: policy.id,
      url: policy.source_url,
      company: policy.company_name,
      created_at: policy.created_at.toISOString(),
      reportId: policy.audit_reports[0]?.id
    }));

    return {
      policies: policyListItems,
      total,
      page,
      totalPages: Math.ceil(total / limit)
    };
  }

  /**
   * Get search suggestions based on recent company names
   * Limited to 10 most recent unique companies
   */
  async getSearchSuggestions(query: string): Promise<string[]> {
    if (!query) return [];

    const suggestions = await prisma.policy.findMany({
      where: {
        company_name: {
          contains: query
        }
      },
      take: 10,
      orderBy: {
        created_at: 'desc'
      },
      select: {
        company_name: true
      }
    });

    // Return unique company names
    return Array.from(new Set(suggestions.map(s => s.company_name)));
  }
}
