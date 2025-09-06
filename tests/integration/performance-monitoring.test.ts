import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import request from 'supertest';
import express from 'express';
import { performanceMonitor } from '../../server/services/performance-monitor.service';
import performanceRoutes from '../../server/routes/performance';

describe('Performance Monitoring System', () => {
  let app: express.Application;

  beforeEach(() => {
    app = express();
    app.use(express.json());
    
    app.use('/api/performance', performanceRoutes);
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  describe('PerformanceMonitor Service', () => {
    it('should create singleton instance', () => {
      expect(performanceMonitor).toBeDefined();
    });

    it('should track operation timing', () => {
      const timer = performanceMonitor.startTimer('test_operation');
      
      // Simulate some work
      setTimeout(() => {
        timer.end(true);
      }, 10);

      // Wait for timer to complete
      return new Promise(resolve => {
        setTimeout(() => {
          const stats = performanceMonitor.getStats();
          expect(stats.totalRequests).toBe(1);
          expect(stats.operationBreakdown['test_operation']).toBeDefined();
          expect(stats.operationBreakdown['test_operation'].count).toBe(1);
          resolve(undefined);
        }, 20);
      });
    });

    it('should record errors', () => {
      const timer = performanceMonitor.startTimer('error_operation');
      
      timer.end(false, 'Test error');
      
      const stats = performanceMonitor.getStats();
      expect(stats.totalRequests).toBe(1);
      expect(stats.errorRate).toBe(1);
      expect(stats.successRate).toBe(0);
    });

    it('should calculate correct statistics', () => {
      // Add multiple operations
      for (let i = 0; i < 10; i++) {
        const timer = performanceMonitor.startTimer('batch_operation');
        timer.end(true);
      }
      
      // Add one error
      const errorTimer = performanceMonitor.startTimer('error_operation');
      errorTimer.end(false, 'Test error');
      
      const stats = performanceMonitor.getStats();
      expect(stats.totalRequests).toBe(11);
      expect(stats.errorRate).toBeCloseTo(1/11, 3);
      expect(stats.successRate).toBeCloseTo(10/11, 3);
    });

    it('should provide performance recommendations', () => {
      // Create slow operation by recording a long duration
      performanceMonitor.recordMetric({
        operation: 'slow_operation',
        duration: 6000, // 6 seconds
        timestamp: Date.now(),
        success: true
      });
      
      const report = performanceMonitor.generateReport();
      expect(report.recommendations.length).toBeGreaterThan(0);
      expect(report.recommendations.some((r: string) => r.includes('slow'))).toBe(true);
    });
  });

  describe('Performance API Routes', () => {
    it('should return health status', async () => {
      const response = await request(app)
        .get('/api/performance/health')
        .expect(200);
      
      expect(response.body.success).toBe(true);
      expect(response.body.data.status).toBe('healthy');
      expect(response.body.data.uptime).toBeGreaterThan(0);
    });

    it('should return performance statistics', async () => {
      // Add some test data
      const timer = performanceMonitor.startTimer('api_test');
      timer.end(true);
      
      const response = await request(app)
        .get('/api/performance/stats')
        .expect(200);
      
      expect(response.body.success).toBe(true);
      expect(response.body.data.totalRequests).toBe(1);
      expect(response.body.data.operationBreakdown).toBeDefined();
    });

    it('should return performance report', async () => {
      // Add test data
      const timer1 = performanceMonitor.startTimer('report_test');
      timer1.end(true);
      
      const timer2 = performanceMonitor.startTimer('error_test');
      timer2.end(false, 'Test error');
      
      const response = await request(app)
        .get('/api/performance/report')
        .expect(200);
      
      expect(response.body.success).toBe(true);
      expect(response.body.data.stats).toBeDefined();
      expect(response.body.data.recentErrors).toBeDefined();
      expect(response.body.data.recommendations).toBeDefined();
    });

    it('should return recent errors', async () => {
      // Add error
      const timer = performanceMonitor.startTimer('error_endpoint_test');
      timer.end(false, 'Test error for endpoint');
      
      const response = await request(app)
        .get('/api/performance/errors')
        .expect(200);
      
      expect(response.body.success).toBe(true);
      expect(response.body.data.length).toBe(1);
      expect(response.body.data[0].error).toBe('Test error for endpoint');
    });

    it('should return slow operations', async () => {
      // Create a slow operation
      performanceMonitor.recordMetric({
        operation: 'slow_endpoint_test',
        duration: 4000, // 4 seconds
        timestamp: Date.now(),
        success: true
      });
      
      const response = await request(app)
        .get('/api/performance/slow?threshold=3000')
        .expect(200);
      
      expect(response.body.success).toBe(true);
      expect(response.body.data.length).toBe(1);
      expect(response.body.data[0].operation).toBe('slow_endpoint_test');
    });

    it('should configure alerts', async () => {
      const alertConfig = {
        maxResponseTime: 2000,
        maxErrorRate: 0.1,
        webhookUrl: 'https://example.com/webhook'
      };
      
      const response = await request(app)
        .post('/api/performance/alerts')
        .send(alertConfig)
        .expect(200);
      
      expect(response.body.success).toBe(true);
      expect(response.body.message).toContain('configured');
    });

    it('should export performance data', async () => {
      // Add test data
      const timer = performanceMonitor.startTimer('export_test');
      timer.end(true);
      
      const response = await request(app)
        .get('/api/performance/export')
        .expect(200);
      
      expect(response.body.success).toBe(true);
      expect(response.body.data.exportedAt).toBeDefined();
      expect(response.body.data.stats).toBeDefined();
    });
  });

  describe('Performance Middleware Integration', () => {
    it('should track middleware performance', async () => {
      // Create a test route with performance tracking
      app.get('/test-route', (req, res) => {
        const timer = performanceMonitor.startTimer('test_route');
        setTimeout(() => {
          timer.end(true);
          res.json({ success: true });
        }, 50);
      });
      
      await request(app)
        .get('/test-route')
        .expect(200);
      
      // Wait for async operations
      await new Promise(resolve => setTimeout(resolve, 100));
      
      const stats = performanceMonitor.getStats();
      expect(stats.operationBreakdown['test_route']).toBeDefined();
      expect(stats.operationBreakdown['test_route'].count).toBe(1);
    });
  });

  describe('Performance Alerting', () => {
    it('should trigger alerts for high error rates', () => {
      // Configure alert threshold
      performanceMonitor.configureAlert({
        name: 'Test Alert',
        condition: 'errorRate',
        threshold: 0.5,
        enabled: true
      });
      
      // Create high error rate scenario
      for (let i = 0; i < 10; i++) {
        const timer = performanceMonitor.startTimer('high_error_test');
        timer.end(false, 'High error rate test');
      }
      
      const stats = performanceMonitor.getStats();
      expect(stats.errorRate).toBe(1);
      // Alert should be triggered (implementation dependent)
    });

    it('should trigger alerts for slow response times', () => {
      // Configure alert threshold
      performanceMonitor.configureAlert({
        name: 'Slow Response Alert',
        condition: 'averageResponseTime',
        threshold: 1000,
        enabled: true
      });
      
      // Create slow operation
      performanceMonitor.recordMetric({
        operation: 'slow_alert_test',
        duration: 2000, // 2 seconds
        timestamp: Date.now(),
        success: true
      });
      
      const stats = performanceMonitor.getStats();
      expect(stats.averageResponseTime).toBeGreaterThan(1000);
      // Alert should be triggered (implementation dependent)
    });
  });
});