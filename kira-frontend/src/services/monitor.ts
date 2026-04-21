/**
 * Error Monitoring & Logging Service
 * Centralized error handling with optional Sentry integration
 */

import { config } from '../config/env';
import { eventBus } from './state';

export interface ErrorContext {
  operation?: string;
  userId?: string;
  timestamp: string;
  [key: string]: any;
}

export interface ErrorLog {
  message: string;
  context: ErrorContext;
  stack?: string;
  severity: 'info' | 'warning' | 'error' | 'critical';
}

/**
 * MonitorService - Centralized error monitoring and logging
 */
export class MonitorService {
  private errorLogs: ErrorLog[] = [];
  private maxLogs: number = 100;

  constructor() {
    this.initializeSentry();
  }

  /**
   * Initialize Sentry error tracking (if enabled)
   */
  private initializeSentry(): void {
    if (!config.sentry.enabled || !config.sentry.dsn) {
      return;
    }

    // Note: Sentry initialization would go here if available
    // For now, we log errors to console in development
    if (config.isDevelopment) {
      console.log('🔍 Error monitoring enabled (Sentry)');
    }
  }

  /**
   * Wrap a function with error handling
   */
  wrap<T extends any[], R>(
    fn: (...args: T) => Promise<R> | R,
    operationName?: string
  ): (...args: T) => Promise<R> {
    return async (...args: T): Promise<R> => {
      try {
        return await fn(...args);
      } catch (error) {
        this.capture(error, { operation: operationName });
        throw error;
      }
    };
  }

  /**
   * Capture and log error with context
   */
  capture(
    error: unknown,
    context: Partial<ErrorContext> = {},
    severity: 'info' | 'warning' | 'error' | 'critical' = 'error'
  ): void {
    const errorMessage = error instanceof Error ? error.message : String(error);
    const stackTrace = error instanceof Error ? error.stack : undefined;

    const errorLog: ErrorLog = {
      message: errorMessage,
      context: {
        ...context,
        timestamp: new Date().toISOString(),
      },
      stack: stackTrace,
      severity,
    };

    // Store error log
    this.errorLogs.push(errorLog);
    if (this.errorLogs.length > this.maxLogs) {
      this.errorLogs.shift();
    }

    // Log to console in development
    if (config.isDevelopment) {
      const logLevel = severity === 'error' || severity === 'critical' ? 'error' : 'warn';
      console[logLevel as any](
        `[${severity.toUpperCase()}] ${errorMessage}`,
        errorLog.context
      );
      if (stackTrace) {
        console.error(stackTrace);
      }
    }

    // Send to Sentry if enabled
    if (config.sentry.enabled) {
      this.sendToSentry(errorLog);
    }

    // Emit error event
    eventBus.emit('error:occurred', {
      message: errorMessage,
      severity,
      context: errorLog.context,
    });
  }

  /**
   * Send error to Sentry
   */
  private sendToSentry(errorLog: ErrorLog): void {
    // TODO: Implement Sentry.captureException() when Sentry SDK is available
    if (config.isDevelopment) {
      console.log('📤 Would send to Sentry:', errorLog);
    }
  }

  /**
   * Log info message
   */
  info(message: string, context?: Partial<ErrorContext>): void {
    this.capture(new Error(message), context, 'info');
  }

  /**
   * Log warning message
   */
  warn(message: string, context?: Partial<ErrorContext>): void {
    this.capture(new Error(message), context, 'warning');
  }

  /**
   * Log error message
   */
  error(message: string, context?: Partial<ErrorContext>): void {
    this.capture(new Error(message), context, 'error');
  }

  /**
   * Log critical error
   */
  critical(message: string, context?: Partial<ErrorContext>): void {
    this.capture(new Error(message), context, 'critical');
  }

  /**
   * Get all error logs
   */
  getLogs(severity?: ErrorLog['severity']): ErrorLog[] {
    if (severity) {
      return this.errorLogs.filter(log => log.severity === severity);
    }
    return [...this.errorLogs];
  }

  /**
   * Clear error logs
   */
  clearLogs(): void {
    this.errorLogs = [];
  }

  /**
   * Export error logs for debugging
   */
  exportLogs(): string {
    return JSON.stringify(this.errorLogs, null, 2);
  }

  /**
   * Handle unhandled promise rejections
   */
  handleUnhandledRejection(event: PromiseRejectionEvent): void {
    this.capture(event.reason, {
      operation: 'unhandledRejection',
    }, 'critical');
  }

  /**
   * Handle window errors
   */
  handleWindowError(event: ErrorEvent): void {
    this.capture(event.error, {
      operation: 'windowError',
      filename: event.filename,
      lineno: event.lineno,
      colno: event.colno,
    }, 'critical');
  }
}

/**
 * Global monitor service instance
 */
export const monitor = new MonitorService();

/**
 * Setup global error handlers
 */
export function setupGlobalErrorHandlers(): void {
  // Unhandled promise rejections
  window.addEventListener('unhandledrejection', (event) => {
    monitor.handleUnhandledRejection(event);
  });

  // Window errors
  window.addEventListener('error', (event) => {
    monitor.handleWindowError(event);
  });

  if (config.isDevelopment) {
    console.log('🛡️ Global error handlers installed');
  }
}

export default monitor;
