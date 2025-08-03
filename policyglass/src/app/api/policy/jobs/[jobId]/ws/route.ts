import { NextRequest, NextResponse } from 'next/server';
import { WebSocketServer, WebSocket } from 'ws';
import { WebSocketService } from '../../../../../services/websocket.service';
import { PolicyJobService } from '../../../../../services/policy-job.service';

// Global WebSocket server instance
let wss: WebSocketServer | null = null;

/**
 * GET /api/policy/jobs/[jobId]/ws
 * WebSocket endpoint for real-time job updates
 */
export async function GET(
  request: NextRequest,
  { params }: { params: { jobId: string } }
): Promise<NextResponse> {
  try {
    const { jobId } = params;

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

    // Check if this is a WebSocket upgrade request
    const upgrade = request.headers.get('upgrade');
    if (upgrade !== 'websocket') {
      return NextResponse.json(
        { 
          error: 'WebSocket upgrade required',
          message: 'This endpoint requires a WebSocket connection',
          jobId,
          connectionInfo: {
            protocol: 'ws',
            endpoint: `/api/policy/jobs/${jobId}/ws`,
            expectedHeaders: {
              'Upgrade': 'websocket',
              'Connection': 'Upgrade'
            }
          }
        },
        { status: 426 } // Upgrade Required
      );
    }

    // Initialize WebSocket server if not already done
    if (!wss) {
      wss = new WebSocketServer({ 
        port: 8080,
        path: `/api/policy/jobs/${jobId}/ws`
      });

      wss.on('connection', (ws: WebSocket, request) => {
        const url = new URL(request.url || '', `http://${request.headers.host}`);
        const pathParts = url.pathname.split('/');
        const jobIdFromPath = pathParts[pathParts.length - 2]; // Extract jobId from path

        if (jobIdFromPath) {
          // Add connection to WebSocket service
          WebSocketService.addConnection(jobIdFromPath, ws);

          // Send initial connection confirmation
          ws.send(JSON.stringify({
            type: 'CONNECTION_ESTABLISHED',
            jobId: jobIdFromPath,
            message: 'WebSocket connection established',
            timestamp: new Date()
          }));

          // Handle incoming messages (for potential client commands)
          ws.on('message', (data) => {
            try {
              const message = JSON.parse(data.toString());
              console.log(`WebSocket message from client for job ${jobIdFromPath}:`, message);
              
              // Handle client commands if needed
              if (message.type === 'PING') {
                ws.send(JSON.stringify({
                  type: 'PONG',
                  timestamp: new Date()
                }));
              }
            } catch (error) {
              console.error('Failed to parse WebSocket message:', error);
            }
          });

          console.log(`WebSocket connection established for job ${jobIdFromPath}`);
        }
      });

      wss.on('error', (error) => {
        console.error('WebSocket server error:', error);
      });

      console.log('WebSocket server initialized on port 8080');
    }

    // Return connection information
    return NextResponse.json({
      message: 'WebSocket server ready',
      jobId,
      connectionInfo: {
        port: 8080,
        path: `/api/policy/jobs/${jobId}/ws`,
        protocol: 'ws',
        url: `ws://localhost:8080/api/policy/jobs/${jobId}/ws`
      }
    });

  } catch (error) {
    console.error(`Failed to setup WebSocket for job ${params.jobId}:`, error);
    return NextResponse.json(
      { 
        error: 'Failed to setup WebSocket connection',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}

/**
 * POST /api/policy/jobs/[jobId]/ws
 * Send a test message to WebSocket connections for a job
 */
export async function POST(
  request: NextRequest,
  { params }: { params: { jobId: string } }
): Promise<NextResponse> {
  try {
    const { jobId } = params;
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

    // Send test message
    const testMessage = WebSocketService.createJobUpdateMessage(
      jobId,
      body.status || 'PROCESSING',
      body.progressPercentage || 50,
      body.phase || 'research',
      body.phaseStatus || 'PROCESSING',
      body.confidence,
      body.error
    );

    WebSocketService.broadcastJobUpdate(jobId, testMessage);

    return NextResponse.json({
      message: 'Test message sent',
      jobId,
      connectionCount: WebSocketService.getConnectionCount(jobId),
      sentMessage: testMessage
    });

  } catch (error) {
    console.error(`Failed to send test message for job ${params.jobId}:`, error);
    return NextResponse.json(
      { 
        error: 'Failed to send test message',
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
  { params }: { params: { jobId: string } }
): Promise<NextResponse> {
  try {
    const { jobId } = params;

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
    console.error(`Failed to close WebSocket connections for job ${params.jobId}:`, error);
    return NextResponse.json(
      { 
        error: 'Failed to close WebSocket connections',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}
