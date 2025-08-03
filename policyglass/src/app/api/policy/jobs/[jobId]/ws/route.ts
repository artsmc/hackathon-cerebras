import { NextRequest, NextResponse } from 'next/server';
import { WebSocketService } from '../../../../../services/websocket.service';
import { PolicyJobService } from '../../../../../services/policy-job.service';

/**
 * GET /api/policy/jobs/[jobId]/ws
 * WebSocket connection info endpoint
 * Note: Next.js API routes don't support WebSocket upgrades directly.
 * This endpoint provides connection information for polling fallback.
 */
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ jobId: string }> }
): Promise<NextResponse> {
  try {
    const { jobId } = await params;

    if (!jobId) {
      return NextResponse.json(
        { error: 'Job ID is required' },
        { status: 400 }
      );
    }

    // Validate job exists
    const jobExists = await PolicyJobService.isValidJob(jobId);
    if (!jobExists) {
      return NextResponse.json(
        { error: 'Job not found or expired' },
        { status: 404 }
      );
    }

    // Return connection information and current job status
    const jobStatus = await PolicyJobService.getJobStatus(jobId);
    
    return NextResponse.json({
      message: 'WebSocket endpoint info',
      jobId,
      currentStatus: jobStatus,
      connectionInfo: {
        note: 'WebSocket upgrades not supported in Next.js API routes',
        fallback: 'Use polling via GET /api/policy/jobs/[jobId]',
        pollingInterval: 2000, // 2 seconds
        connectionCount: WebSocketService.getConnectionCount(jobId)
      }
    });

  } catch (error) {
    console.error(`Failed to get WebSocket info for job:`, error);
    return NextResponse.json(
      { 
        error: 'Failed to get WebSocket connection info',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}

/**
 * POST /api/policy/jobs/[jobId]/ws
 * Send a test message to WebSocket connections for a job
 * This simulates WebSocket messaging for testing purposes
 */
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ jobId: string }> }
): Promise<NextResponse> {
  try {
    const { jobId } = await params;
    const body = await request.json();

    if (!jobId) {
      return NextResponse.json(
        { error: 'Job ID is required' },
        { status: 400 }
      );
    }

    // Validate job exists
    const jobExists = await PolicyJobService.isValidJob(jobId);
    if (!jobExists) {
      return NextResponse.json(
        { error: 'Job not found or expired' },
        { status: 404 }
      );
    }

    // Create test message (this would normally be sent via WebSocket)
    const testMessage = WebSocketService.createJobUpdateMessage(
      jobId,
      body.status || 'PROCESSING',
      body.progressPercentage || 50,
      body.phase || 'research',
      body.phaseStatus || 'PROCESSING',
      body.confidence,
      body.error
    );

    // In a real WebSocket implementation, this would broadcast to connected clients
    // For now, we'll just return the message that would be sent
    console.log(`Simulated WebSocket message for job ${jobId}:`, testMessage);

    return NextResponse.json({
      message: 'Test message created (WebSocket simulation)',
      jobId,
      connectionCount: WebSocketService.getConnectionCount(jobId),
      simulatedMessage: testMessage,
      note: 'In production, this would be sent via WebSocket to connected clients'
    });

  } catch (error) {
    console.error(`Failed to create test message for job:`, error);
    return NextResponse.json(
      { 
        error: 'Failed to create test message',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}

/**
 * DELETE /api/policy/jobs/[jobId]/ws
 * Close all WebSocket connections for a job
 */
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ jobId: string }> }
): Promise<NextResponse> {
  try {
    const { jobId } = await params;

    if (!jobId) {
      return NextResponse.json(
        { error: 'Job ID is required' },
        { status: 400 }
      );
    }

    const connectionCount = WebSocketService.getConnectionCount(jobId);
    WebSocketService.closeJobConnections(jobId);

    return NextResponse.json({
      message: 'WebSocket connections closed',
      jobId,
      closedConnections: connectionCount
    });

  } catch (error) {
    console.error(`Failed to close WebSocket connections for job:`, error);
    return NextResponse.json(
      { 
        error: 'Failed to close WebSocket connections',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}
