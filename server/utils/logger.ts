/**
 * Structured Logger for Anamnesis System
 * Provides JSON-formatted logging with correlation IDs and contextual information
 */

import { randomUUID } from 'crypto';

// Log levels
export enum LogLevel {
  ERROR = 'error',
  WARN = 'warn',
  INFO = 'info',
  DEBUG = 'debug',
  TRACE = 'trace'
}

// Log severity for filtering
const LOG_LEVEL_PRIORITY: Record<LogLevel, number> = {
  [LogLevel.ERROR]: 50,
  [LogLevel.WARN]: 40,
  [LogLevel.INFO]: 30,
  [LogLevel.DEBUG]: 20,
  [LogLevel.TRACE]: 10
};

// Environment configuration
const LOG_LEVEL = (process.env.LOG_LEVEL as LogLevel) || LogLevel.INFO;
const NODE_ENV = process.env.NODE_ENV || 'development';
const SERVICE_NAME = 'anamnesis-service';
const SERVICE_VERSION = process.env.npm_package_version || '1.0.0';

// Base log structure
interface LogEntry {
  timestamp: string;
  level: LogLevel;
  message: string;
  service: string;
  version: string;
  environment: string;
  correlationId?: string;
  userId?: string;
  requestId?: string;
  operation?: string;
  duration?: number;
  context?: Record<string, any>;
  error?: {
    name: string;
    message: string;
    stack?: string;
    code?: string;
    category?: string;
  };
  performance?: {
    startTime: number;
    endTime: number;
    duration: number;
    memory?: {
      used: number;
      total: number;
    };
  };
  security?: {
    event: string;
    severity: 'low' | 'medium' | 'high' | 'critical';
    details?: Record<string, any>;
  };
}

// Sensitive data patterns to mask
const SENSITIVE_PATTERNS = [
  /password/i,
  /token/i,
  /key/i,
  /secret/i,
  /auth/i,
  /credential/i,
  /email/i,
  /phone/i,
  /ssn/i,
  /credit/i
];

/**
 * Context for maintaining correlation across async operations
 */
class LogContext {
  private static instance: LogContext;
  private context = new Map<string, any>();

  static getInstance(): LogContext {
    if (!LogContext.instance) {
      LogContext.instance = new LogContext();
    }
    return LogContext.instance;
  }

  setCorrelationId(correlationId: string): void {
    this.context.set('correlationId', correlationId);
  }

  getCorrelationId(): string | undefined {
    return this.context.get('correlationId');
  }

  setUserId(userId: string): void {
    this.context.set('userId', userId);
  }

  getUserId(): string | undefined {
    return this.context.get('userId');
  }

  setRequestId(requestId: string): void {
    this.context.set('requestId', requestId);
  }

  getRequestId(): string | undefined {
    return this.context.get('requestId');
  }

  setOperation(operation: string): void {
    this.context.set('operation', operation);
  }

  getOperation(): string | undefined {
    return this.context.get('operation');
  }

  clear(): void {
    this.context.clear();
  }

  getAll(): Record<string, any> {
    return Object.fromEntries(this.context);
  }
}

/**
 * Performance timer for measuring operation duration
 */
class PerformanceTimer {
  private startTime: number;
  private startMemory: NodeJS.MemoryUsage;

  constructor() {
    this.startTime = performance.now();
    this.startMemory = process.memoryUsage();
  }

  end(): {
    duration: number;
    memory: {
      used: number;
      total: number;
      delta: number;
    };
  } {
    const endTime = performance.now();
    const endMemory = process.memoryUsage();
    
    return {
      duration: endTime - this.startTime,
      memory: {
        used: endMemory.heapUsed,
        total: endMemory.heapTotal,
        delta: endMemory.heapUsed - this.startMemory.heapUsed
      }
    };
  }
}

/**
 * Data sanitization utilities
 */
class DataSanitizer {
  /**
   * Masks sensitive data in objects
   */
  static sanitize(data: any): any {
    if (data === null || data === undefined) {
      return data;
    }

    if (typeof data === 'string') {
      return this.maskSensitiveString(data);
    }

    if (Array.isArray(data)) {
      return data.map(item => this.sanitize(item));
    }

    if (typeof data === 'object') {
      const sanitized: Record<string, any> = {};
      
      for (const [key, value] of Object.entries(data)) {
        if (this.isSensitiveKey(key)) {
          sanitized[key] = this.maskValue(value);
        } else {
          sanitized[key] = this.sanitize(value);
        }
      }
      
      return sanitized;
    }

    return data;
  }

  /**
   * Checks if a key contains sensitive information
   */
  private static isSensitiveKey(key: string): boolean {
    return SENSITIVE_PATTERNS.some(pattern => pattern.test(key));
  }

  /**
   * Masks a sensitive value
   */
  private static maskValue(value: any): string {
    if (typeof value === 'string') {
      if (value.length <= 4) return '***';
      return value.substring(0, 2) + '*'.repeat(value.length - 4) + value.substring(value.length - 2);
    }
    return '***';
  }

  /**
   * Masks sensitive patterns in strings
   */
  private static maskSensitiveString(str: string): string {
    // Email pattern
    str = str.replace(/([a-zA-Z0-9._%+-]+)@([a-zA-Z0-9.-]+\.[a-zA-Z]{2,})/g, 
      (match, user, domain) => {
        const maskedUser = user.substring(0, 2) + '***';
        return `${maskedUser}@${domain}`;
      });

    // Phone pattern (simple)
    str = str.replace(/(\d{3})-?(\d{3})-?(\d{4})/g, '$1-***-$3');

    return str;
  }
}

/**
 * Main structured logger class
 */
export class StructuredLogger {
  private context: LogContext;

  constructor() {
    this.context = LogContext.getInstance();
  }

  /**
   * Creates a base log entry with common fields
   */
  private createBaseEntry(level: LogLevel, message: string): LogEntry {
    return {
      timestamp: new Date().toISOString(),
      level,
      message,
      service: SERVICE_NAME,
      version: SERVICE_VERSION,
      environment: NODE_ENV,
      correlationId: this.context.getCorrelationId(),
      userId: this.context.getUserId(),
      requestId: this.context.getRequestId(),
      operation: this.context.getOperation()
    };
  }

  /**
   * Checks if log level should be output
   */
  private shouldLog(level: LogLevel): boolean {
    return LOG_LEVEL_PRIORITY[level] >= LOG_LEVEL_PRIORITY[LOG_LEVEL];
  }

  /**
   * Outputs log entry to console (in production, this would go to a log aggregator)
   */
  private output(entry: LogEntry): void {
    if (!this.shouldLog(entry.level)) {
      return;
    }

    // Sanitize sensitive data
    const sanitizedEntry = DataSanitizer.sanitize(entry);

    if (NODE_ENV === 'development') {
      // Pretty print for development
      console.log(`[${entry.timestamp}] ${entry.level.toUpperCase()}: ${entry.message}`, 
        entry.context ? sanitizedEntry.context : '');
    } else {
      // JSON format for production
      console.log(JSON.stringify(sanitizedEntry));
    }
  }

  /**
   * Logs an error with full context
   */
  error(message: string, error?: Error, context?: Record<string, any>): void {
    const entry = this.createBaseEntry(LogLevel.ERROR, message);
    
    if (error) {
      entry.error = {
        name: error.name,
        message: error.message,
        stack: error.stack,
        ...(error as any).code && { code: (error as any).code },
        ...(error as any).category && { category: (error as any).category }
      };
    }

    if (context) {
      entry.context = context;
    }

    this.output(entry);
  }

  /**
   * Logs a warning
   */
  warn(message: string, context?: Record<string, any>): void {
    const entry = this.createBaseEntry(LogLevel.WARN, message);
    if (context) entry.context = context;
    this.output(entry);
  }

  /**
   * Logs general information
   */
  info(message: string, context?: Record<string, any>): void {
    const entry = this.createBaseEntry(LogLevel.INFO, message);
    if (context) entry.context = context;
    this.output(entry);
  }

  /**
   * Logs debug information
   */
  debug(message: string, context?: Record<string, any>): void {
    const entry = this.createBaseEntry(LogLevel.DEBUG, message);
    if (context) entry.context = context;
    this.output(entry);
  }

  /**
   * Logs trace information (most verbose)
   */
  trace(message: string, context?: Record<string, any>): void {
    const entry = this.createBaseEntry(LogLevel.TRACE, message);
    if (context) entry.context = context;
    this.output(entry);
  }

  /**
   * Logs performance metrics
   */
  performance(message: string, timer: PerformanceTimer, context?: Record<string, any>): void {
    const entry = this.createBaseEntry(LogLevel.INFO, message);
    const perfData = timer.end();
    
    entry.performance = {
      startTime: Date.now() - perfData.duration,
      endTime: Date.now(),
      duration: perfData.duration,
      memory: perfData.memory
    };
    
    if (context) entry.context = context;
    this.output(entry);
  }

  /**
   * Logs security events
   */
  security(
    message: string, 
    event: string, 
    severity: 'low' | 'medium' | 'high' | 'critical',
    details?: Record<string, any>
  ): void {
    const entry = this.createBaseEntry(LogLevel.WARN, message);
    
    entry.security = {
      event,
      severity,
      details
    };

    this.output(entry);
  }

  /**
   * Creates a child logger with additional context
   */
  child(context: Record<string, any>): StructuredLogger {
    const childLogger = new StructuredLogger();
    
    // Preserve parent context and add child context
    Object.entries(context).forEach(([key, value]) => {
      if (key === 'correlationId') childLogger.context.setCorrelationId(value);
      else if (key === 'userId') childLogger.context.setUserId(value);
      else if (key === 'requestId') childLogger.context.setRequestId(value);
      else if (key === 'operation') childLogger.context.setOperation(value);
    });

    return childLogger;
  }

  /**
   * Measures and logs execution time of an async operation
   */
  async measureAsync<T>(
    operation: string,
    fn: () => Promise<T>,
    context?: Record<string, any>
  ): Promise<T> {
    const timer = new PerformanceTimer();
    const operationLogger = this.child({ operation });

    operationLogger.info(`Starting operation: ${operation}`, context);

    try {
      const result = await fn();
      operationLogger.performance(`Completed operation: ${operation}`, timer, {
        status: 'success',
        ...context
      });
      return result;
    } catch (error) {
      operationLogger.performance(`Failed operation: ${operation}`, timer, {
        status: 'error',
        ...context
      });
      operationLogger.error(`Operation failed: ${operation}`, error as Error, context);
      throw error;
    }
  }

  /**
   * Measures and logs execution time of a sync operation
   */
  measure<T>(
    operation: string,
    fn: () => T,
    context?: Record<string, any>
  ): T {
    const timer = new PerformanceTimer();
    const operationLogger = this.child({ operation });

    operationLogger.info(`Starting operation: ${operation}`, context);

    try {
      const result = fn();
      operationLogger.performance(`Completed operation: ${operation}`, timer, {
        status: 'success',
        ...context
      });
      return result;
    } catch (error) {
      operationLogger.performance(`Failed operation: ${operation}`, timer, {
        status: 'error',
        ...context
      });
      operationLogger.error(`Operation failed: ${operation}`, error as Error, context);
      throw error;
    }
  }
}

// Export singleton logger instance
export const logger = new StructuredLogger();

// Middleware for Express.js
export function loggingMiddleware(req: any, res: any, next: any): void {
  // Generate correlation ID for this request
  const correlationId = randomUUID();
  const requestId = req.headers['x-request-id'] || randomUUID();
  
  // Set context for this request
  const context = LogContext.getInstance();
  context.setCorrelationId(correlationId);
  context.setRequestId(requestId);

  // Add correlation ID to response headers
  res.setHeader('x-correlation-id', correlationId);
  res.setHeader('x-request-id', requestId);

  // Create request logger
  const requestLogger = logger.child({
    correlationId,
    requestId,
    operation: `${req.method} ${req.path}`
  });

  // Log incoming request
  requestLogger.info('Incoming request', {
    method: req.method,
    url: req.url,
    userAgent: req.headers['user-agent'],
    ip: req.ip || req.connection.remoteAddress,
    contentLength: req.headers['content-length']
  });

  // Track response time
  const timer = new PerformanceTimer();

  // Log response when finished
  res.on('finish', () => {
    requestLogger.performance('Request completed', timer, {
      statusCode: res.statusCode,
      method: req.method,
      url: req.url,
      contentLength: res.get('content-length')
    });
  });

  // Store logger in request for use in route handlers
  req.logger = requestLogger;

  next();
}

// Export utilities and types
export { LogContext, PerformanceTimer, DataSanitizer };
export type { LogEntry };