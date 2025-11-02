/**
 * Error Handling and User Feedback System
 */

export class AppError extends Error {
  constructor(
    message: string,
    public code: string,
    public recoverable: boolean = true,
    public userMessage?: string
  ) {
    super(message);
    this.name = 'AppError';
  }
}

export class ValidationError extends AppError {
  constructor(message: string, public field?: string) {
    super(message, 'VALIDATION_ERROR', true, message);
    this.name = 'ValidationError';
  }
}

export class StorageError extends AppError {
  constructor(message: string, recoverable: boolean = true) {
    super(
      message,
      'STORAGE_ERROR',
      recoverable,
      recoverable ? 'Failed to save data. Please try again.' : 'Storage quota exceeded. Please delete some cards.'
    );
    this.name = 'StorageError';
  }
}

export class NetworkError extends AppError {
  constructor(message: string) {
    super(
      message,
      'NETWORK_ERROR',
      true,
      'Network error occurred. Please check your connection.'
    );
    this.name = 'NetworkError';
  }
}

/**
 * Error handler that logs and potentially reports errors
 */
export function handleError(error: unknown): AppError {
  if (error instanceof AppError) {
    console.error(`[${error.code}] ${error.message}`);
    return error;
  }

  if (error instanceof Error) {
    console.error('Unexpected error:', error);
    return new AppError(
      error.message,
      'UNKNOWN_ERROR',
      true,
      'An unexpected error occurred. Please try again.'
    );
  }

  console.error('Unknown error:', error);
  return new AppError(
    'Unknown error',
    'UNKNOWN_ERROR',
    true,
    'Something went wrong. Please try again.'
  );
}

/**
 * Toast notification types
 */
export type ToastType = 'success' | 'error' | 'warning' | 'info';

export interface Toast {
  id: string;
  type: ToastType;
  message: string;
  duration?: number;
  action?: {
    label: string;
    onClick: () => void;
  };
}

/**
 * Create a toast notification
 */
export function createToast(
  type: ToastType,
  message: string,
  duration: number = 5000
): Toast {
  return {
    id: `toast-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
    type,
    message,
    duration,
  };
}

/**
 * Format error for user display
 */
export function formatErrorMessage(error: unknown): string {
  if (error instanceof AppError && error.userMessage) {
    return error.userMessage;
  }

  if (error instanceof Error) {
    return error.message;
  }

  return 'An unexpected error occurred';
}

/**
 * Retry logic for async operations
 */
export async function retry<T>(
  fn: () => Promise<T>,
  maxAttempts: number = 3,
  delay: number = 1000
): Promise<T> {
  let lastError: Error | undefined;

  for (let attempt = 1; attempt <= maxAttempts; attempt++) {
    try {
      return await fn();
    } catch (error) {
      lastError = error instanceof Error ? error : new Error(String(error));
      
      if (attempt < maxAttempts) {
        // Wait before retrying
        await new Promise(resolve => setTimeout(resolve, delay * attempt));
      }
    }
  }

  throw lastError || new Error('All retry attempts failed');
}

/**
 * Safe async wrapper that catches and handles errors
 */
export async function safeAsync<T>(
  fn: () => Promise<T>,
  fallback: T
): Promise<T> {
  try {
    return await fn();
  } catch (error) {
    handleError(error);
    return fallback;
  }
}

/**
 * Debug logging utility (only in development)
 */
export function debugLog(category: string, message: string, data?: unknown): void {
  if (process.env.NODE_ENV === 'development') {
    console.log(`[${category}] ${message}`, data || '');
  }
}

/**
 * Performance monitoring
 */
export class PerformanceMonitor {
  private marks: Map<string, number> = new Map();

  start(label: string): void {
    this.marks.set(label, performance.now());
  }

  end(label: string): number {
    const startTime = this.marks.get(label);
    if (!startTime) {
      console.warn(`No start mark found for "${label}"`);
      return 0;
    }

    const duration = performance.now() - startTime;
    this.marks.delete(label);
    
    debugLog('Performance', `${label}: ${duration.toFixed(2)}ms`);
    return duration;
  }

  measure(label: string, fn: () => void): void {
    this.start(label);
    fn();
    this.end(label);
  }

  async measureAsync<T>(label: string, fn: () => Promise<T>): Promise<T> {
    this.start(label);
    try {
      return await fn();
    } finally {
      this.end(label);
    }
  }
}

export const perfMonitor = new PerformanceMonitor();
