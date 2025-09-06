import { Router } from 'express';
import { performanceMonitor } from '../services/performance-monitor.service';

const router = Router();

/**
 * GET /api/performance/health
 * Basic health check endpoint
 */
router.get('/health', (req, res) => {
  res.json({
    status: 'healthy',
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
    memory: process.memoryUsage(),
    version: process.version
  });
});

/**
 * GET /api/performance/stats
 * Get performance statistics
 */
router.get('/stats', (req, res) => {
  try {
    const timeWindow = parseInt(req.query.window as string) || 60 * 60 * 1000; // Default 1 hour
    const stats = performanceMonitor.getStats(timeWindow);
    
    res.json({
      success: true,
      data: stats,
      timeWindow: timeWindow,
      timestamp: Date.now()
    });
  } catch (error) {
    console.error('Error getting performance stats:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to get performance statistics',
      details: error instanceof Error ? error.message : 'Unknown error'
    });
  }
});

/**
 * GET /api/performance/report
 * Get comprehensive performance report
 */
router.get('/report', (req, res) => {
  try {
    const timeWindow = parseInt(req.query.window as string) || 60 * 60 * 1000; // Default 1 hour
    const report = performanceMonitor.generateReport(timeWindow);
    
    res.json({
      success: true,
      data: report,
      timeWindow: timeWindow,
      timestamp: Date.now()
    });
  } catch (error) {
    console.error('Error generating performance report:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to generate performance report',
      details: error instanceof Error ? error.message : 'Unknown error'
    });
  }
});

/**
 * GET /api/performance/errors
 * Get recent errors for debugging
 */
router.get('/errors', (req, res) => {
  try {
    const limit = parseInt(req.query.limit as string) || 50;
    const timeWindow = parseInt(req.query.window as string) || 60 * 60 * 1000; // Default 1 hour
    
    const errors = performanceMonitor.getRecentErrors(limit, timeWindow);
    
    res.json({
      success: true,
      data: errors,
      count: errors.length,
      timeWindow: timeWindow,
      timestamp: Date.now()
    });
  } catch (error) {
    console.error('Error getting recent errors:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to get recent errors',
      details: error instanceof Error ? error.message : 'Unknown error'
    });
  }
});

/**
 * GET /api/performance/slow
 * Get slowest operations for optimization
 */
router.get('/slow', (req, res) => {
  try {
    const limit = parseInt(req.query.limit as string) || 20;
    const timeWindow = parseInt(req.query.window as string) || 60 * 60 * 1000; // Default 1 hour
    
    const slowOperations = performanceMonitor.getSlowestOperations(limit, timeWindow);
    
    res.json({
      success: true,
      data: slowOperations,
      count: slowOperations.length,
      timeWindow: timeWindow,
      timestamp: Date.now()
    });
  } catch (error) {
    console.error('Error getting slow operations:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to get slow operations',
      details: error instanceof Error ? error.message : 'Unknown error'
    });
  }
});

/**
 * GET /api/performance/metrics
 * Export metrics in various formats
 */
router.get('/metrics', (req, res) => {
  try {
    const format = req.query.format as 'json' | 'prometheus' || 'json';
    const timeWindow = parseInt(req.query.window as string) || 60 * 60 * 1000; // Default 1 hour
    
    const metrics = performanceMonitor.exportMetrics(format, timeWindow);
    
    if (format === 'prometheus') {
      res.setHeader('Content-Type', 'text/plain');
      res.send(metrics);
    } else {
      res.json({
        success: true,
        data: metrics
      });
    }
  } catch (error) {
    console.error('Error exporting metrics:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to export metrics',
      details: error instanceof Error ? error.message : 'Unknown error'
    });
  }
});

/**
 * POST /api/performance/alerts
 * Configure performance alerts
 */
router.post('/alerts', (req, res) => {
  try {
    const { name, condition, threshold, enabled, recipients } = req.body;
    
    if (!name || !condition || threshold === undefined) {
      return res.status(400).json({
        success: false,
        error: 'Missing required fields',
        details: 'name, condition, and threshold are required'
      });
    }
    
    const validConditions = ['averageResponseTime', 'errorRate', 'successRate'];
    if (!validConditions.includes(condition)) {
      return res.status(400).json({
        success: false,
        error: 'Invalid condition',
        details: `condition must be one of: ${validConditions.join(', ')}`
      });
    }
    
    performanceMonitor.configureAlert({
      name,
      condition,
      threshold,
      enabled: enabled !== false, // Default to true
      recipients
    });
    
    res.json({
      success: true,
      message: 'Alert configured successfully',
      alert: { name, condition, threshold, enabled, recipients }
    });
  } catch (error) {
    console.error('Error configuring alert:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to configure alert',
      details: error instanceof Error ? error.message : 'Unknown error'
    });
  }
});

/**
 * POST /api/performance/test
 * Test endpoint for performance monitoring
 */
router.post('/test', async (req, res) => {
  try {
    const timer = performanceMonitor.startTimer('test_operation', {
      testType: req.body.type || 'default',
      userId: req.body.userId || 'anonymous'
    });
    
    // Simulate some work
    const delay = req.body.delay || 100;
    const shouldFail = req.body.shouldFail || false;
    
    await new Promise(resolve => setTimeout(resolve, delay));
    
    if (shouldFail) {
      timer.end(false, 'Simulated failure');
      return res.status(500).json({
        success: false,
        error: 'Simulated failure for testing'
      });
    }
    
    const duration = timer.end(true);
    
    res.json({
      success: true,
      message: 'Test operation completed',
      duration: Math.round(duration),
      timestamp: Date.now()
    });
  } catch (error) {
    console.error('Error in test endpoint:', error);
    res.status(500).json({
      success: false,
      error: 'Test endpoint failed',
      details: error instanceof Error ? error.message : 'Unknown error'
    });
  }
});

export default router;