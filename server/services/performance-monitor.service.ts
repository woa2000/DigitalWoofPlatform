import { performance } from 'perf_hooks';

export interface PerformanceMetric {
  operation: string;
  duration: number;
  timestamp: number;
  metadata?: Record<string, any>;
  success: boolean;
  error?: string;
}

export interface PerformanceStats {
  totalRequests: number;
  averageResponseTime: number;
  successRate: number;
  errorRate: number;
  p95ResponseTime: number;
  p99ResponseTime: number;
  operationBreakdown: Record<string, {
    count: number;
    averageTime: number;
    successRate: number;
  }>;
}

export interface AlertConfig {
  name: string;
  condition: string;
  threshold: number;
  enabled: boolean;
  recipients?: string[];
}

class PerformanceMonitor {
  private metrics: PerformanceMetric[] = [];
  private alerts: AlertConfig[] = [];
  private readonly maxMetricsHistory = 10000; // Keep last 10k metrics

  constructor() {
    // Set up default alerts
    this.alerts = [
      {
        name: 'High Response Time',
        condition: 'averageResponseTime',
        threshold: 5000, // 5 seconds
        enabled: true
      },
      {
        name: 'High Error Rate', 
        condition: 'errorRate',
        threshold: 0.1, // 10%
        enabled: true
      },
      {
        name: 'Low Success Rate',
        condition: 'successRate',
        threshold: 0.9, // 90%
        enabled: true
      }
    ];

    // Clean up old metrics every hour
    setInterval(() => {
      this.cleanupOldMetrics();
    }, 60 * 60 * 1000);
  }

  /**
   * Start timing an operation
   */
  startTimer(operation: string, metadata?: Record<string, any>) {
    const startTime = performance.now();
    
    return {
      end: (success: boolean = true, error?: string) => {
        const endTime = performance.now();
        const duration = endTime - startTime;
        
        this.recordMetric({
          operation,
          duration,
          timestamp: Date.now(),
          metadata,
          success,
          error
        });
        
        return duration;
      }
    };
  }

  /**
   * Record a performance metric
   */
  recordMetric(metric: PerformanceMetric) {
    this.metrics.push(metric);
    
    // Maintain metrics history limit
    if (this.metrics.length > this.maxMetricsHistory) {
      this.metrics = this.metrics.slice(-this.maxMetricsHistory);
    }

    // Check alerts
    this.checkAlerts();
  }

  /**
   * Get performance statistics for a time window
   */
  getStats(timeWindowMs: number = 60 * 60 * 1000): PerformanceStats {
    const cutoffTime = Date.now() - timeWindowMs;
    const recentMetrics = this.metrics.filter(m => m.timestamp >= cutoffTime);
    
    if (recentMetrics.length === 0) {
      return {
        totalRequests: 0,
        averageResponseTime: 0,
        successRate: 1,
        errorRate: 0,
        p95ResponseTime: 0,
        p99ResponseTime: 0,
        operationBreakdown: {}
      };
    }

    const durations = recentMetrics.map(m => m.duration).sort((a, b) => a - b);
    const successfulRequests = recentMetrics.filter(m => m.success).length;
    
    // Calculate percentiles
    const p95Index = Math.floor(durations.length * 0.95);
    const p99Index = Math.floor(durations.length * 0.99);
    
    // Operation breakdown
    const operationBreakdown: Record<string, any> = {};
    
    for (const metric of recentMetrics) {
      if (!operationBreakdown[metric.operation]) {
        operationBreakdown[metric.operation] = {
          count: 0,
          totalTime: 0,
          successCount: 0
        };
      }
      
      operationBreakdown[metric.operation].count++;
      operationBreakdown[metric.operation].totalTime += metric.duration;
      if (metric.success) {
        operationBreakdown[metric.operation].successCount++;
      }
    }

    // Finalize operation breakdown
    for (const operation in operationBreakdown) {
      const data = operationBreakdown[operation];
      operationBreakdown[operation] = {
        count: data.count,
        averageTime: data.totalTime / data.count,
        successRate: data.successCount / data.count
      };
    }

    return {
      totalRequests: recentMetrics.length,
      averageResponseTime: durations.reduce((a, b) => a + b, 0) / durations.length,
      successRate: successfulRequests / recentMetrics.length,
      errorRate: (recentMetrics.length - successfulRequests) / recentMetrics.length,
      p95ResponseTime: durations[p95Index] || 0,
      p99ResponseTime: durations[p99Index] || 0,
      operationBreakdown
    };
  }

  /**
   * Get recent errors for debugging
   */
  getRecentErrors(limit: number = 50, timeWindowMs: number = 60 * 60 * 1000): PerformanceMetric[] {
    const cutoffTime = Date.now() - timeWindowMs;
    return this.metrics
      .filter(m => m.timestamp >= cutoffTime && !m.success)
      .slice(-limit);
  }

  /**
   * Get slowest operations for optimization
   */
  getSlowestOperations(limit: number = 20, timeWindowMs: number = 60 * 60 * 1000): PerformanceMetric[] {
    const cutoffTime = Date.now() - timeWindowMs;
    return this.metrics
      .filter(m => m.timestamp >= cutoffTime)
      .sort((a, b) => b.duration - a.duration)
      .slice(0, limit);
  }

  /**
   * Generate performance report
   */
  generateReport(timeWindowMs: number = 60 * 60 * 1000): {
    stats: PerformanceStats;
    recentErrors: PerformanceMetric[];
    slowestOperations: PerformanceMetric[];
    recommendations: string[];
  } {
    const stats = this.getStats(timeWindowMs);
    const recentErrors = this.getRecentErrors(10, timeWindowMs);
    const slowestOperations = this.getSlowestOperations(10, timeWindowMs);
    
    const recommendations: string[] = [];
    
    // Generate recommendations based on stats
    if (stats.averageResponseTime > 3000) {
      recommendations.push('Average response time is high (>3s). Consider optimizing slow operations.');
    }
    
    if (stats.errorRate > 0.05) {
      recommendations.push('Error rate is elevated (>5%). Investigate recent failures.');
    }
    
    if (stats.p95ResponseTime > 10000) {
      recommendations.push('95th percentile response time is very high (>10s). Check for outliers.');
    }

    // Check for specific operation issues
    for (const [operation, data] of Object.entries(stats.operationBreakdown)) {
      if (data.averageTime > 5000) {
        recommendations.push(`Operation "${operation}" is slow (${Math.round(data.averageTime)}ms average).`);
      }
      if (data.successRate < 0.9) {
        recommendations.push(`Operation "${operation}" has low success rate (${Math.round(data.successRate * 100)}%).`);
      }
    }

    return {
      stats,
      recentErrors,
      slowestOperations,
      recommendations
    };
  }

  /**
   * Configure alerts
   */
  configureAlert(config: AlertConfig) {
    const existingIndex = this.alerts.findIndex(a => a.name === config.name);
    if (existingIndex >= 0) {
      this.alerts[existingIndex] = config;
    } else {
      this.alerts.push(config);
    }
  }

  /**
   * Check for alert conditions
   */
  private checkAlerts() {
    const stats = this.getStats(60 * 60 * 1000); // Last hour
    
    for (const alert of this.alerts) {
      if (!alert.enabled) continue;
      
      let currentValue: number;
      
      switch (alert.condition) {
        case 'averageResponseTime':
          currentValue = stats.averageResponseTime;
          break;
        case 'errorRate':
          currentValue = stats.errorRate;
          break;
        case 'successRate':
          currentValue = stats.successRate;
          break;
        default:
          continue;
      }
      
      const shouldAlert = 
        (alert.condition === 'successRate' && currentValue < alert.threshold) ||
        (alert.condition !== 'successRate' && currentValue > alert.threshold);
        
      if (shouldAlert) {
        this.triggerAlert(alert, currentValue);
      }
    }
  }

  /**
   * Trigger an alert
   */
  private triggerAlert(alert: AlertConfig, currentValue: number) {
    const message = `ALERT: ${alert.name} - ${alert.condition}: ${currentValue} (threshold: ${alert.threshold})`;
    
    // Log the alert
    console.warn(`🚨 Performance Alert: ${message}`);
    
    // In production, you would send this to monitoring systems like:
    // - Email notifications
    // - Slack webhook
    // - PagerDuty
    // - Datadog/NewRelic alerts
    // - Custom webhook
    
    // For now, just log it
    this.logAlert(alert, currentValue, message);
  }

  /**
   * Log alert for later analysis
   */
  private logAlert(alert: AlertConfig, currentValue: number, message: string) {
    // In production, save to database or monitoring system
    console.log(`Alert logged: ${alert.name} at ${new Date().toISOString()}`);
  }

  /**
   * Clean up old metrics to prevent memory issues
   */
  private cleanupOldMetrics() {
    const cutoffTime = Date.now() - (24 * 60 * 60 * 1000); // Keep 24 hours
    this.metrics = this.metrics.filter(m => m.timestamp >= cutoffTime);
    console.log(`Cleaned up old metrics. Current count: ${this.metrics.length}`);
  }

  /**
   * Export metrics for external monitoring systems
   */
  exportMetrics(format: 'json' | 'prometheus' = 'json', timeWindowMs: number = 60 * 60 * 1000) {
    if (format === 'json') {
      return {
        timestamp: Date.now(),
        timeWindow: timeWindowMs,
        stats: this.getStats(timeWindowMs),
        recentMetrics: this.metrics.filter(m => m.timestamp >= Date.now() - timeWindowMs)
      };
    }
    
    if (format === 'prometheus') {
      const stats = this.getStats(timeWindowMs);
      return [
        `# HELP content_generation_requests_total Total number of content generation requests`,
        `# TYPE content_generation_requests_total counter`,
        `content_generation_requests_total ${stats.totalRequests}`,
        ``,
        `# HELP content_generation_response_time_avg Average response time in milliseconds`,
        `# TYPE content_generation_response_time_avg gauge`,
        `content_generation_response_time_avg ${stats.averageResponseTime}`,
        ``,
        `# HELP content_generation_success_rate Success rate as ratio`,
        `# TYPE content_generation_success_rate gauge`,
        `content_generation_success_rate ${stats.successRate}`,
        ``,
        `# HELP content_generation_response_time_p95 95th percentile response time`,
        `# TYPE content_generation_response_time_p95 gauge`,
        `content_generation_response_time_p95 ${stats.p95ResponseTime}`
      ].join('\n');
    }
  }
}

// Singleton instance
export const performanceMonitor = new PerformanceMonitor();

// Middleware for Express.js to automatically track request performance
export const performanceMiddleware = (req: any, res: any, next: any) => {
  const timer = performanceMonitor.startTimer('http_request', {
    method: req.method,
    path: req.path,
    userAgent: req.get('User-Agent')
  });

  // Capture original end method
  const originalEnd = res.end;
  
  res.end = function(chunk: any, encoding: any) {
    const success = res.statusCode < 400;
    const error = success ? undefined : `HTTP ${res.statusCode}`;
    
    timer.end(success, error);
    
    // Call original end method
    originalEnd.call(res, chunk, encoding);
  };

  next();
};

export default performanceMonitor;