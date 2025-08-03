import { BackgroundProcessorService } from './background-processor.service';

/**
 * AppInitializerService - Handles application startup initialization
 * Starts background services and performs initial setup
 */
export class AppInitializerService {
  private static isInitialized = false;

  /**
   * Initializes the application services
   */
  static async initialize(): Promise<void> {
    if (this.isInitialized) {
      console.log('Application already initialized');
      return;
    }

    try {
      console.log('Initializing PolicyGlass application...');

      // Start background processor
      BackgroundProcessorService.startProcessing();

      // Set initialization flag
      this.isInitialized = true;

      console.log('PolicyGlass application initialized successfully');

    } catch (error) {
      console.error('Failed to initialize application:', error);
      throw error;
    }
  }

  /**
   * Shuts down application services gracefully
   */
  static async shutdown(): Promise<void> {
    if (!this.isInitialized) {
      console.log('Application not initialized, nothing to shutdown');
      return;
    }

    try {
      console.log('Shutting down PolicyGlass application...');

      // Stop background processor
      BackgroundProcessorService.stopProcessing();

      // Reset initialization flag
      this.isInitialized = false;

      console.log('PolicyGlass application shutdown complete');

    } catch (error) {
      console.error('Error during application shutdown:', error);
      throw error;
    }
  }

  /**
   * Gets the initialization status
   */
  static isAppInitialized(): boolean {
    return this.isInitialized;
  }

  /**
   * Gets application health status
   */
  static getHealthStatus(): {
    initialized: boolean;
    backgroundProcessor: {
      isProcessing: boolean;
      queueLength: number;
      activeJobs: number;
      maxConcurrentJobs: number;
      totalConnections: number;
    };
    timestamp: string;
  } {
    return {
      initialized: this.isInitialized,
      backgroundProcessor: BackgroundProcessorService.getProcessingStats(),
      timestamp: new Date().toISOString()
    };
  }
}

// Auto-initialize when the module is loaded (for server-side)
if (typeof window === 'undefined') {
  // Only initialize on server-side
  AppInitializerService.initialize().catch(error => {
    console.error('Failed to auto-initialize application:', error);
  });
}
