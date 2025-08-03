import { NextResponse } from 'next/server';
import { verifySession } from '../../../../lib/session';
import { UserQuotaService } from '../../../../services/user-quota.service';

export async function GET() {
  try {
    // Verify user session
    const session = await verifySession();
    if (!session) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    // Get user quota status
    const quotaStatus = await UserQuotaService.checkDailyQuota(session.userId);
    const timeUntilReset = await UserQuotaService.getFormattedTimeUntilReset(session.userId);

    return NextResponse.json({
      success: true,
      data: {
        ...quotaStatus,
        timeUntilReset
      }
    });

  } catch (error) {
    console.error('Error checking quota:', error);
    return NextResponse.json(
      { 
        error: 'Failed to check quota',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}

export async function POST() {
  try {
    // Verify user session
    const session = await verifySession();
    if (!session) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    // Validate if user can create a job
    try {
      await UserQuotaService.validateJobCreation(session.userId);
      
      return NextResponse.json({
        success: true,
        message: 'Job creation allowed',
        canCreateJob: true
      });

    } catch (quotaError) {
      // User has hit their quota limit
      const quotaStatus = await UserQuotaService.checkDailyQuota(session.userId);
      const timeUntilReset = await UserQuotaService.getFormattedTimeUntilReset(session.userId);

      return NextResponse.json({
        success: false,
        error: quotaError instanceof Error ? quotaError.message : 'Quota exceeded',
        canCreateJob: false,
        quota: {
          ...quotaStatus,
          timeUntilReset
        }
      }, { status: 429 }); // Too Many Requests
    }

  } catch (error) {
    console.error('Error validating job creation:', error);
    return NextResponse.json(
      { 
        error: 'Failed to validate job creation',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}
