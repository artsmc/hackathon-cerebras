import { NextRequest } from 'next/server';
import { PolicyListService } from '../../../services/policy-list.service';

const policyListService = new PolicyListService();

/**
 * GET /api/policy/list
 * 
 * Returns a list of policies with limited fields for security
 * Query parameters:
 * - search: string (optional) - Search term for fuzzy matching
 * - page: number (optional, default: 1) - Page number
 * - limit: number (optional, default: 20) - Items per page
 */
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const search = searchParams.get('search') || '';
    const page = parseInt(searchParams.get('page') || '1', 10);
    const limit = parseInt(searchParams.get('limit') || '20', 10);

    // Validate parameters
    if (page < 1) {
      return Response.json(
        { error: 'Page must be greater than 0' },
        { status: 400 }
      );
    }

    if (limit < 1 || limit > 100) {
      return Response.json(
        { error: 'Limit must be between 1 and 100' },
        { status: 400 }
      );
    }

    const result = await policyListService.searchPolicies({
      search,
      page,
      limit
    });

    return Response.json(result);
  } catch (error) {
    console.error('Error fetching policy list:', error);
    return Response.json(
      { error: 'Failed to fetch policies' },
      { status: 500 }
    );
  }
}
