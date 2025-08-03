import { toast, ToastOptions } from 'react-toastify';

export class ToastService {
  private static defaultOptions: ToastOptions = {
    position: 'top-right',
    autoClose: 5000,
    hideProgressBar: false,
    closeOnClick: true,
    pauseOnHover: true,
    draggable: true,
  };

  /**
   * Show success toast
   */
  static success(message: string, options?: ToastOptions): void {
    toast.success(message, { ...this.defaultOptions, ...options });
  }

  /**
   * Show error toast
   */
  static error(message: string, options?: ToastOptions): void {
    toast.error(message, { ...this.defaultOptions, ...options });
  }

  /**
   * Show warning toast
   */
  static warning(message: string, options?: ToastOptions): void {
    toast.warning(message, { ...this.defaultOptions, ...options });
  }

  /**
   * Show info toast
   */
  static info(message: string, options?: ToastOptions): void {
    toast.info(message, { ...this.defaultOptions, ...options });
  }

  /**
   * Show quota limit warning
   */
  static quotaLimitWarning(remainingJobs: number, resetTime: string): void {
    if (remainingJobs === 1) {
      this.warning(
        `You have 1 job remaining today. Quota resets in ${resetTime}.`,
        { autoClose: 8000 }
      );
    } else if (remainingJobs === 0) {
      this.error(
        `Daily job limit reached! You can create new jobs in ${resetTime}.`,
        { autoClose: 10000 }
      );
    }
  }

  /**
   * Show quota exceeded error
   */
  static quotaExceeded(resetTime: string): void {
    this.error(
      `Daily limit of 3 jobs reached. You can create new jobs in ${resetTime}.`,
      { 
        autoClose: 10000,
        closeOnClick: false,
        pauseOnHover: true
      }
    );
  }

  /**
   * Show job creation success with quota info
   */
  static jobCreatedSuccess(remainingJobs: number): void {
    const message = remainingJobs > 0 
      ? `Job created successfully! You have ${remainingJobs} job${remainingJobs !== 1 ? 's' : ''} remaining today.`
      : 'Job created successfully! This was your last job for today.';
    
    this.success(message, { autoClose: 6000 });
  }

  /**
   * Show processing step updates
   */
  static processingStep(step: string, progress?: number): void {
    const message = progress 
      ? `${step} (${progress}%)`
      : step;
    
    this.info(message, { 
      autoClose: 3000,
      hideProgressBar: false
    });
  }

  /**
   * Show job completion
   */
  static jobCompleted(jobId: string): void {
    this.success(
      `Policy analysis completed! View your results.`,
      { 
        autoClose: 8000,
        onClick: () => {
          // Could navigate to results page
          window.location.href = `/results?jobId=${jobId}`;
        }
      }
    );
  }

  /**
   * Show job failed
   */
  static jobFailed(error: string): void {
    this.error(
      `Job failed: ${error}`,
      { autoClose: 10000 }
    );
  }

  /**
   * Dismiss all toasts
   */
  static dismissAll(): void {
    toast.dismiss();
  }
}
