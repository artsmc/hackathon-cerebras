import { NextResponse } from 'next/server';
import { AppInitializerService } from '../../services/app-initializer.service';

/**
 * GET /api/health
 * Health check endpoint for monitoring system status
 */
export async function GET(): Promise<NextResponse> {
  try {
    const healthStatus = AppInitializerService.getHealthStatus();
    
    return NextResponse.json({
      status: 'healthy',
      service: 'PolicyGlass',
      version: '1.0.0',
      ...healthStatus
    });

  } catch (error) {
    console.error('Health check failed:', error);
    return NextResponse.json(
      { 
        status: 'unhealthy',
        service: 'PolicyGlass',
        error: error instanceof Error ? error.message : 'Unknown error',
        timestamp: new Date().toISOString()
      },
      { status: 500 }
    );
  }
}
