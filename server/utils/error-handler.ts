/**
 * Centralized Error Handling for Anamnesis System
 * Provides structured error handling, status tracking, and recovery mechanisms
 */

import { z } from 'zod';

// Error severity levels
export enum ErrorSeverity {
  LOW = 'low',
  MEDIUM = 'medium',
  HIGH = 'high',
  CRITICAL = 'critical'
}

// Error categories for classification
export enum ErrorCategory {
  VALIDATION = 'validation',
  AUTHENTICATION = 'authentication',
  AUTHORIZATION = 'authorization',
  NETWORK = 'network',
  TIMEOUT = 'timeout',
  RATE_LIMIT = 'rate_limit',
  ANALYSIS = 'analysis',
  DATABASE = 'database',
  EXTERNAL_SERVICE = 'external_service',
  INTERNAL = 'internal'
}

// Analysis status enum
export enum AnalysisStatus {
  QUEUED = 'queued',
  RUNNING = 'running',
  DONE = 'done',
  ERROR = 'error',
  TIMEOUT = 'timeout',
  CANCELLED = 'cancelled'
}

// Base error interface
export interface StructuredError {
  code: string;
  message: string;
  category: ErrorCategory;
  severity: ErrorSeverity;
  details?: Record<string, any>;
  timestamp: Date;
  requestId?: string;
  userId?: string;
  retryable: boolean;
  suggestedAction?: string;
}

/**
 * Custom error classes for different scenarios
 */

export class AnamnesisError extends Error implements StructuredError {
  public readonly code: string;
  public readonly category: ErrorCategory;
  public readonly severity: ErrorSeverity;
  public readonly details?: Record<string, any>;
  public readonly timestamp: Date;
  public readonly requestId?: string;
  public readonly userId?: string;
  public readonly retryable: boolean;
  public readonly suggestedAction?: string;

  constructor(
    code: string,
    message: string,
    category: ErrorCategory,
    severity: ErrorSeverity = ErrorSeverity.MEDIUM,
    options: {
      details?: Record<string, any>;
      requestId?: string;
      userId?: string;
      retryable?: boolean;
      suggestedAction?: string;
      cause?: Error;
    } = {}
  ) {
    super(message);
    this.name = 'AnamnesisError';
    this.code = code;
    this.category = category;
    this.severity = severity;
    this.details = options.details;
    this.timestamp = new Date();
    this.requestId = options.requestId;
    this.userId = options.userId;
    this.retryable = options.retryable ?? false;
    this.suggestedAction = options.suggestedAction;

    if (options.cause) {
      this.cause = options.cause;
    }

    // Maintain proper stack trace
    if (Error.captureStackTrace) {
      Error.captureStackTrace(this, AnamnesisError);
    }
  }

  /**
   * Converts error to safe JSON format for API responses
   */
  toJSON(): Record<string, any> {
    return {
      code: this.code,
      message: this.message,
      category: this.category,
      severity: this.severity,
      details: this.details,
      timestamp: this.timestamp.toISOString(),
      retryable: this.retryable,
      suggestedAction: this.suggestedAction
    };
  }

  /**
   * Checks if error should be logged (based on severity)
   */
  shouldLog(): boolean {
    return [ErrorSeverity.HIGH, ErrorSeverity.CRITICAL].includes(this.severity);
  }
}

export class ValidationError extends AnamnesisError {
  constructor(message: string, details?: Record<string, any>, requestId?: string) {
    super(
      'VALIDATION_FAILED',
      message,
      ErrorCategory.VALIDATION,
      ErrorSeverity.LOW,
      {
        details,
        requestId,
        retryable: false,
        suggestedAction: 'Please check your input and try again'
      }
    );
  }
}

export class TimeoutError extends AnamnesisError {
  constructor(operation: string, timeoutMs: number, requestId?: string) {
    super(
      'OPERATION_TIMEOUT',
      `Operation '${operation}' timed out after ${timeoutMs}ms`,
      ErrorCategory.TIMEOUT,
      ErrorSeverity.MEDIUM,
      {
        details: { operation, timeoutMs },
        requestId,
        retryable: true,
        suggestedAction: 'The operation took longer than expected. Please try again.'
      }
    );
  }
}

export class AnalysisError extends AnamnesisError {
  constructor(message: string, details?: Record<string, any>, requestId?: string) {
    super(
      'ANALYSIS_FAILED',
      message,
      ErrorCategory.ANALYSIS,
      ErrorSeverity.HIGH,
      {
        details,
        requestId,
        retryable: true,
        suggestedAction: 'Analysis failed. Please try again or contact support if the issue persists.'
      }
    );
  }
}

export class RateLimitError extends AnamnesisError {
  constructor(limit: number, resetTime: Date, requestId?: string) {
    super(
      'RATE_LIMIT_EXCEEDED',
      `Rate limit of ${limit} requests exceeded`,
      ErrorCategory.RATE_LIMIT,
      ErrorSeverity.MEDIUM,
      {
        details: { limit, resetTime: resetTime.toISOString() },
        requestId,
        retryable: true,
        suggestedAction: `Rate limit exceeded. Please wait until ${resetTime.toLocaleTimeString()} before trying again.`
      }
    );
  }
}

/**
 * Status tracking system with state machine logic
 */
export class StatusTracker {
  private static readonly STATUS_TRANSITIONS: Record<AnalysisStatus, AnalysisStatus[]> = {
    [AnalysisStatus.QUEUED]: [AnalysisStatus.RUNNING, AnalysisStatus.CANCELLED, AnalysisStatus.ERROR],
    [AnalysisStatus.RUNNING]: [AnalysisStatus.DONE, AnalysisStatus.ERROR, AnalysisStatus.TIMEOUT, AnalysisStatus.CANCELLED],
    [AnalysisStatus.DONE]: [], // Terminal state
    [AnalysisStatus.ERROR]: [AnalysisStatus.QUEUED], // Can be retried
    [AnalysisStatus.TIMEOUT]: [AnalysisStatus.QUEUED], // Can be retried
    [AnalysisStatus.CANCELLED]: [AnalysisStatus.QUEUED] // Can be retried
  };

  private static readonly TIMEOUT_MS = 2 * 60 * 1000; // 2 minutes

  /**
   * Validates if a status transition is allowed
   */
  static isValidTransition(from: AnalysisStatus, to: AnalysisStatus): boolean {
    const allowedTransitions = this.STATUS_TRANSITIONS[from] || [];
    return allowedTransitions.includes(to);
  }

  /**
   * Gets all possible next states for a given status
   */
  static getNextStates(current: AnalysisStatus): AnalysisStatus[] {
    return this.STATUS_TRANSITIONS[current] || [];
  }

  /**
   * Checks if a status is terminal (no further transitions allowed)
   */
  static isTerminalStatus(status: AnalysisStatus): boolean {
    return this.STATUS_TRANSITIONS[status].length === 0;
  }

  /**
   * Checks if a status represents an error state
   */
  static isErrorStatus(status: AnalysisStatus): boolean {
    return [AnalysisStatus.ERROR, AnalysisStatus.TIMEOUT].includes(status);
  }

  /**
   * Checks if a status can be retried
   */
  static isRetryableStatus(status: AnalysisStatus): boolean {
    return [AnalysisStatus.ERROR, AnalysisStatus.TIMEOUT, AnalysisStatus.CANCELLED].includes(status);
  }

  /**
   * Calculates if an analysis has timed out
   */
  static hasTimedOut(startTime: Date): boolean {
    return Date.now() - startTime.getTime() > this.TIMEOUT_MS;
  }

  /**
   * Gets timeout deadline for an analysis
   */
  static getTimeoutDeadline(startTime: Date): Date {
    return new Date(startTime.getTime() + this.TIMEOUT_MS);
  }
}

/**
 * Error recovery strategies
 */
export class ErrorRecovery {
  private static readonly MAX_RETRIES = 3;
  private static readonly RETRY_DELAYS = [1000, 2000, 5000]; // ms

  /**
   * Determines if an error is recoverable
   */
  static isRecoverable(error: Error | AnamnesisError): boolean {
    if (error instanceof AnamnesisError) {
      return error.retryable;
    }

    // For non-AnamnesisError, check if it's a known recoverable error
    const recoverableMessages = [
      'timeout',
      'network',
      'connection',
      'temporary',
      'retry'
    ];

    return recoverableMessages.some(keyword => 
      error.message.toLowerCase().includes(keyword)
    );
  }

  /**
   * Gets appropriate retry delay for attempt number
   */
  static getRetryDelay(attempt: number): number {
    if (attempt <= 0 || attempt > this.MAX_RETRIES) {
      return 0;
    }
    return this.RETRY_DELAYS[attempt - 1] || this.RETRY_DELAYS[this.RETRY_DELAYS.length - 1];
  }

  /**
   * Checks if we should retry based on attempt count
   */
  static shouldRetry(attempt: number): boolean {
    return attempt < this.MAX_RETRIES;
  }

  /**
   * Creates a retry strategy for an operation
   */
  static async withRetry<T>(
    operation: () => Promise<T>,
    maxAttempts: number = this.MAX_RETRIES,
    context?: { requestId?: string; operation?: string }
  ): Promise<T> {
    let lastError: Error;

    for (let attempt = 1; attempt <= maxAttempts; attempt++) {
      try {
        return await operation();
      } catch (error) {
        lastError = error as Error;

        // If it's not recoverable, don't retry
        if (!this.isRecoverable(lastError)) {
          throw lastError;
        }

        // If this is the last attempt, throw the error
        if (attempt === maxAttempts) {
          throw lastError;
        }

        // Wait before retrying
        const delay = this.getRetryDelay(attempt);
        if (delay > 0) {
          await new Promise(resolve => setTimeout(resolve, delay));
        }

        console.warn(`Retry attempt ${attempt}/${maxAttempts} for operation`, {
          error: lastError.message,
          requestId: context?.requestId,
          operation: context?.operation,
          nextRetryIn: this.getRetryDelay(attempt + 1)
        });
      }
    }

    throw lastError!;
  }
}

/**
 * Error context for tracking and correlation
 */
export interface ErrorContext {
  requestId?: string;
  userId?: string;
  operation?: string;
  analysisId?: string;
  metadata?: Record<string, any>;
}

/**
 * Centralized error handler
 */
export class ErrorHandler {
  private static errorCounts = new Map<string, number>();
  private static lastReset = Date.now();
  private static readonly RESET_INTERVAL = 60 * 60 * 1000; // 1 hour

  /**
   * Handles and processes errors with appropriate logging and response
   */
  static handle(error: Error, context: ErrorContext = {}): StructuredError {
    // Reset error counts periodically
    if (Date.now() - this.lastReset > this.RESET_INTERVAL) {
      this.errorCounts.clear();
      this.lastReset = Date.now();
    }

    let structuredError: StructuredError;

    if (error instanceof AnamnesisError) {
      structuredError = error;
    } else {
      // Convert generic errors to structured format
      structuredError = this.convertToStructuredError(error, context);
    }

    // Track error frequency
    this.trackError(structuredError.code);

    // Log error if necessary
    if (structuredError.severity === ErrorSeverity.HIGH || structuredError.severity === ErrorSeverity.CRITICAL) {
      this.logError(structuredError, context);
    }

    return structuredError;
  }

  /**
   * Converts generic errors to structured format
   */
  private static convertToStructuredError(error: Error, context: ErrorContext): StructuredError {
    // Detect error type based on message and context
    let category = ErrorCategory.INTERNAL;
    let severity = ErrorSeverity.MEDIUM;
    let retryable = false;
    let suggestedAction = 'An unexpected error occurred. Please try again or contact support.';

    const message = error.message.toLowerCase();

    if (message.includes('validation') || message.includes('invalid')) {
      category = ErrorCategory.VALIDATION;
      severity = ErrorSeverity.LOW;
      suggestedAction = 'Please check your input and try again.';
    } else if (message.includes('timeout')) {
      category = ErrorCategory.TIMEOUT;
      retryable = true;
      suggestedAction = 'The operation timed out. Please try again.';
    } else if (message.includes('network') || message.includes('connection')) {
      category = ErrorCategory.NETWORK;
      retryable = true;
      suggestedAction = 'Network error. Please check your connection and try again.';
    } else if (message.includes('rate limit')) {
      category = ErrorCategory.RATE_LIMIT;
      retryable = true;
      suggestedAction = 'Too many requests. Please wait a moment and try again.';
    }

    return {
      code: 'GENERIC_ERROR',
      message: error.message,
      category,
      severity,
      details: { originalError: error.name, stack: error.stack },
      timestamp: new Date(),
      requestId: context.requestId,
      userId: context.userId,
      retryable,
      suggestedAction
    };
  }

  /**
   * Tracks error frequency for monitoring
   */
  private static trackError(code: string): void {
    const count = this.errorCounts.get(code) || 0;
    this.errorCounts.set(code, count + 1);
  }

  /**
   * Logs errors with structured format
   */
  private static logError(error: StructuredError, context: ErrorContext): void {
    console.error('Structured Error:', {
      ...error,
      context,
      errorCount: this.errorCounts.get(error.code) || 1
    });
  }

  /**
   * Gets error statistics for monitoring
   */
  static getErrorStats(): Record<string, number> {
    return Object.fromEntries(this.errorCounts);
  }

  /**
   * Resets error tracking
   */
  static resetStats(): void {
    this.errorCounts.clear();
    this.lastReset = Date.now();
  }
}

/**
 * Graceful degradation utilities
 */
export class GracefulDegradation {
  /**
   * Provides fallback behavior when external services are unavailable
   */
  static async withFallback<T>(
    primary: () => Promise<T>,
    fallback: () => Promise<T>,
    context?: ErrorContext
  ): Promise<T> {
    try {
      return await primary();
    } catch (error) {
      console.warn('Primary operation failed, using fallback:', {
        error: (error as Error).message,
        context
      });
      
      try {
        return await fallback();
      } catch (fallbackError) {
        // If both fail, throw the original error
        throw error;
      }
    }
  }

  /**
   * Provides partial functionality when some features are unavailable
   */
  static async withPartialSuccess<T>(
    operations: Array<() => Promise<T>>,
    minimumSuccessCount: number = 1
  ): Promise<{ results: T[]; errors: Error[] }> {
    const results: T[] = [];
    const errors: Error[] = [];

    await Promise.allSettled(
      operations.map(async (operation) => {
        try {
          const result = await operation();
          results.push(result);
        } catch (error) {
          errors.push(error as Error);
        }
      })
    );

    if (results.length < minimumSuccessCount) {
      throw new AnamnesisError(
        'INSUFFICIENT_SUCCESS',
        `Only ${results.length} of ${operations.length} operations succeeded (minimum: ${minimumSuccessCount})`,
        ErrorCategory.INTERNAL,
        ErrorSeverity.HIGH,
        {
          retryable: true,
          details: {
            successCount: results.length,
            totalCount: operations.length,
            minimumRequired: minimumSuccessCount,
            errorCount: errors.length
          }
        }
      );
    }

    return { results, errors };
  }
}