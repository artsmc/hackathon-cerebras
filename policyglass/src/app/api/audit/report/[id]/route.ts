import { NextRequest } from 'next/server';
import { AuditReportService } from '../../../../services/audit-report.service';

/**
 * GET /api/audit/report/[id]
 * 
 * Returns audit report data for display
 * Path parameter:
 * - id: number - Audit report ID
 */
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const reportId = parseInt(params.id, 10);
    
    if (isNaN(reportId)) {
      return Response.json(
        { error: 'Invalid report ID' },
        { status: 400 }
      );
    }

    const report = await AuditReportService.getAuditReport(reportId);
    const displayData = AuditReportService.transformAuditReportForDisplay(report);

    return Response.json(displayData);
  } catch (error: unknown) {
    console.error('Error fetching audit report:', error);
    
    if (error instanceof Error && error.message === 'Audit report not found') {
      return Response.json(
        { error: 'Audit report not found' },
        { status: 404 }
      );
    }
    
    return Response.json(
      { error: 'Failed to fetch audit report' },
      { status: 500 }
    );
  }
}
