/**
 * Performance Load Tests
 * 
 * Testa performance sob diferentes cargas
 */

import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import { TestClient } from '../helpers/client';

interface LoadTestResult {
  averageResponseTime: number;
  maxResponseTime: number;
  minResponseTime: number;
  successRate: number;
  errorRate: number;
  requestsPerSecond: number;
}

interface PerformanceMetrics {
  memoryUsage: number;
  cpuUsage: number;
  responseTime: number;
  throughput: number;
}

describe('Performance Load Tests', () => {
  let client: TestClient;

  beforeAll(async () => {
    client = new TestClient();
  });

  describe('Template Discovery Performance', () => {
    it('should handle 100 concurrent template requests', async () => {
      const concurrentRequests = 100;
      const startTime = Date.now();
      
      const promises = Array.from({ length: concurrentRequests }, () => 
        client.get('/api/templates?limit=20')
      );
      
      const results = await Promise.allSettled(promises);
      const endTime = Date.now();
      const totalTime = endTime - startTime;
      
      const successfulRequests = results.filter(r => 
        r.status === 'fulfilled' && r.value.status === 200
      ).length;
      
      const loadTestResult: LoadTestResult = {
        averageResponseTime: totalTime / concurrentRequests,
        maxResponseTime: totalTime,
        minResponseTime: totalTime / concurrentRequests,
        successRate: (successfulRequests / concurrentRequests) * 100,
        errorRate: ((concurrentRequests - successfulRequests) / concurrentRequests) * 100,
        requestsPerSecond: (concurrentRequests / totalTime) * 1000
      };
      
      // Performance assertions
      expect(loadTestResult.successRate).toBeGreaterThan(95); // 95% success rate
      expect(loadTestResult.averageResponseTime).toBeLessThan(1000); // Under 1 second
      expect(loadTestResult.requestsPerSecond).toBeGreaterThan(10); // At least 10 RPS
    });

    it('should handle pagination efficiently with large datasets', async () => {
      const pages = [1, 2, 3, 4, 5];
      const itemsPerPage = 50;
      
      const startTime = Date.now();
      
      const promises = pages.map(page => 
        client.get(`/api/templates?page=${page}&limit=${itemsPerPage}`)
      );
      
      const results = await Promise.all(promises);
      const endTime = Date.now();
      
      const totalTime = endTime - startTime;
      const averageResponseTime = totalTime / pages.length;
      
      // All requests should succeed
      results.forEach(result => {
        expect(result.status).toBe(200);
        expect(result.data.templates).toBeInstanceOf(Array);
      });
      
      // Performance should remain consistent across pages
      expect(averageResponseTime).toBeLessThan(500); // Under 500ms per page
    });

    it('should handle complex search queries efficiently', async () => {
      const complexQueries = [
        '/api/templates?search=cão+gato&category=promotional&channel=instagram',
        '/api/templates?search=ração+premium&audience=young_adults&tags=nutrition',
        '/api/templates?category=educational&channel=facebook&sort=popularity',
        '/api/templates?search=veterinário&category=healthcare&audience=pet_owners',
        '/api/templates?tags=emergency&channel=whatsapp&sort=recent'
      ];
      
      const startTime = Date.now();
      
      const promises = complexQueries.map(query => client.get(query));
      const results = await Promise.all(promises);
      
      const endTime = Date.now();
      const totalTime = endTime - startTime;
      const averageResponseTime = totalTime / complexQueries.length;
      
      // All complex queries should succeed
      results.forEach(result => {
        expect(result.status).toBe(200);
      });
      
      // Complex searches should complete quickly
      expect(averageResponseTime).toBeLessThan(800); // Under 800ms average
    });
  });

  describe('Template Personalization Performance', () => {
    it('should handle concurrent personalization requests', async () => {
      const concurrentPersonalizations = 50;
      
      const promises = Array.from({ length: concurrentPersonalizations }, (_, i) => 
        client.post('/api/templates/template-1/personalize', {
          brandVoiceId: `brand-voice-${i}`,
          customizations: {
            tone: 'friendly',
            targetAudience: 'pet_owners_young',
            channel: 'instagram'
          }
        })
      );
      
      const startTime = Date.now();
      const results = await Promise.allSettled(promises);
      const endTime = Date.now();
      
      const successfulRequests = results.filter(r => 
        r.status === 'fulfilled' && r.value.status === 200
      ).length;
      
      const totalTime = endTime - startTime;
      const successRate = (successfulRequests / concurrentPersonalizations) * 100;
      
      expect(successRate).toBeGreaterThan(90); // 90% success rate
      expect(totalTime).toBeLessThan(5000); // Complete within 5 seconds
    });

    it('should handle large content personalization efficiently', async () => {
      const largeContent = 'Lorem ipsum dolor sit amet, '.repeat(1000); // ~27KB content
      
      const startTime = Date.now();
      
      const result = await client.post('/api/templates/template-1/personalize', {
        brandVoiceId: 'test-brand-voice',
        customizations: {
          customText: largeContent,
          tone: 'professional',
          targetAudience: 'pet_owners_premium'
        }
      });
      
      const endTime = Date.now();
      const responseTime = endTime - startTime;
      
      expect(result.status).toBe(200);
      expect(responseTime).toBeLessThan(2000); // Process large content under 2 seconds
    });
  });

  describe('Performance Analytics Load Tests', () => {
    it('should handle dashboard data requests efficiently', async () => {
      const dashboardRequests = [
        '/api/performance/campaigns?dateRange=30d',
        '/api/performance/templates/ranking?metric=roi',
        '/api/performance/benchmarks?category=pet_food',
        '/api/performance/insights?period=7d'
      ];
      
      const iterations = 10; // Simulate 10 users loading dashboard
      const allRequests: Promise<any>[] = [];
      
      // Generate concurrent requests for each dashboard component
      for (let i = 0; i < iterations; i++) {
        dashboardRequests.forEach(endpoint => {
          allRequests.push(client.get(endpoint));
        });
      }
      
      const startTime = Date.now();
      const results = await Promise.allSettled(allRequests);
      const endTime = Date.now();
      
      const totalTime = endTime - startTime;
      const successfulRequests = results.filter(r => 
        r.status === 'fulfilled' && r.value.status === 200
      ).length;
      
      const successRate = (successfulRequests / allRequests.length) * 100;
      const requestsPerSecond = (allRequests.length / totalTime) * 1000;
      
      expect(successRate).toBeGreaterThan(95);
      expect(requestsPerSecond).toBeGreaterThan(20); // At least 20 RPS for analytics
    });

    it('should handle large date range queries efficiently', async () => {
      const largeDateRangeQueries = [
        '/api/performance/campaigns?dateRange=365d', // 1 year
        '/api/performance/campaigns?dateRange=180d', // 6 months
        '/api/performance/campaigns?dateRange=90d',  // 3 months
      ];
      
      const startTime = Date.now();
      
      const promises = largeDateRangeQueries.map(query => client.get(query));
      const results = await Promise.all(promises);
      
      const endTime = Date.now();
      const totalTime = endTime - startTime;
      const averageResponseTime = totalTime / largeDateRangeQueries.length;
      
      // Large date ranges should still perform reasonably
      expect(averageResponseTime).toBeLessThan(3000); // Under 3 seconds
      
      results.forEach(result => {
        expect(result.status).toBe(200);
        expect(result.data.campaigns).toBeInstanceOf(Array);
      });
    });
  });

  describe('Asset Management Performance', () => {
    it('should handle concurrent asset requests', async () => {
      const concurrentAssetRequests = 25;
      
      const promises = Array.from({ length: concurrentAssetRequests }, () => 
        client.get('/api/assets?page=1&limit=20')
      );
      
      const startTime = Date.now();
      const results = await Promise.allSettled(promises);
      const endTime = Date.now();
      
      const totalTime = endTime - startTime;
      const successfulRequests = results.filter(r => 
        r.status === 'fulfilled' && r.value.status === 200
      ).length;
      
      const successRate = (successfulRequests / concurrentAssetRequests) * 100;
      
      expect(successRate).toBeGreaterThan(95);
      expect(totalTime).toBeLessThan(3000); // Complete within 3 seconds
    });

    it('should handle asset filtering efficiently', async () => {
      const filterQueries = [
        '/api/assets?type=image&tags=dogs',
        '/api/assets?type=image&tags=cats',
        '/api/assets?type=video&category=educational',
        '/api/assets?size=large&format=jpg',
        '/api/assets?recent=true&favorites=true'
      ];
      
      const startTime = Date.now();
      
      const promises = filterQueries.map(query => client.get(query));
      const results = await Promise.all(promises);
      
      const endTime = Date.now();
      const averageResponseTime = (endTime - startTime) / filterQueries.length;
      
      expect(averageResponseTime).toBeLessThan(600); // Under 600ms per filter
      
      results.forEach(result => {
        expect(result.status).toBe(200);
      });
    });
  });

  describe('Campaign Creation Performance', () => {
    it('should handle concurrent campaign creation', async () => {
      const concurrentCampaigns = 20;
      
      const promises = Array.from({ length: concurrentCampaigns }, (_, i) => 
        client.post('/api/campaigns', {
          name: `Test Campaign ${i}`,
          templateId: 'template-1',
          brandVoiceId: 'brand-voice-1',
          configuration: {
            channels: ['instagram', 'facebook'],
            budget: 500 + i * 100,
            duration: 7
          }
        })
      );
      
      const startTime = Date.now();
      const results = await Promise.allSettled(promises);
      const endTime = Date.now();
      
      const totalTime = endTime - startTime;
      const successfulRequests = results.filter(r => 
        r.status === 'fulfilled' && r.value.status === 201
      ).length;
      
      const successRate = (successfulRequests / concurrentCampaigns) * 100;
      
      expect(successRate).toBeGreaterThan(90);
      expect(totalTime).toBeLessThan(4000); // Create 20 campaigns within 4 seconds
    });

    it('should handle draft operations efficiently', async () => {
      const draftOperations = 50;
      const promises: Promise<any>[] = [];
      
      // Mix of save and load operations
      for (let i = 0; i < draftOperations; i++) {
        if (i % 2 === 0) {
          // Save draft
          promises.push(
            client.post('/api/campaigns/draft', {
              name: `Draft ${i}`,
              templateId: 'template-1',
              step: 'personalization',
              data: { tone: 'friendly' }
            })
          );
        } else {
          // Load draft (simulated)
          promises.push(
            client.get('/api/campaigns/draft/draft-123')
          );
        }
      }
      
      const startTime = Date.now();
      const results = await Promise.allSettled(promises);
      const endTime = Date.now();
      
      const totalTime = endTime - startTime;
      const successfulRequests = results.filter(r => 
        r.status === 'fulfilled' && r.value.status === 200
      ).length;
      
      const successRate = (successfulRequests / draftOperations) * 100;
      
      expect(successRate).toBeGreaterThan(95);
      expect(totalTime).toBeLessThan(3000); // Handle 50 draft operations within 3 seconds
    });
  });

  describe('Memory and Resource Management', () => {
    it('should not have memory leaks during extended usage', async () => {
      const longRunningOperations = 100;
      const memoryUsageBefore = process.memoryUsage();
      
      // Simulate extended usage
      for (let i = 0; i < longRunningOperations; i++) {
        await client.get('/api/templates?limit=10');
        await client.get('/api/performance/insights');
        
        // Force garbage collection periodically
        if (i % 20 === 0 && global.gc) {
          global.gc();
        }
      }
      
      const memoryUsageAfter = process.memoryUsage();
      const memoryIncrease = memoryUsageAfter.heapUsed - memoryUsageBefore.heapUsed;
      const memoryIncreaseRatio = memoryIncrease / memoryUsageBefore.heapUsed;
      
      // Memory usage should not increase significantly (less than 50%)
      expect(memoryIncreaseRatio).toBeLessThan(0.5);
    });

    it('should handle high-frequency requests without degradation', async () => {
      const highFrequencyTests = 5;
      const requestsPerTest = 20;
      const responseTimes: number[] = [];
      
      for (let test = 0; test < highFrequencyTests; test++) {
        const promises = Array.from({ length: requestsPerTest }, () => {
          const startTime = Date.now();
          return client.get('/api/templates?limit=5').then(result => {
            const endTime = Date.now();
            responseTimes.push(endTime - startTime);
            return result;
          });
        });
        
        await Promise.all(promises);
        
        // Small delay between test batches
        await new Promise(resolve => setTimeout(resolve, 100));
      }
      
      // Response times should remain consistent
      const firstBatchAvg = responseTimes.slice(0, requestsPerTest)
        .reduce((a, b) => a + b, 0) / requestsPerTest;
      const lastBatchAvg = responseTimes.slice(-requestsPerTest)
        .reduce((a, b) => a + b, 0) / requestsPerTest;
      
      const degradationRatio = lastBatchAvg / firstBatchAvg;
      
      // Performance should not degrade more than 50%
      expect(degradationRatio).toBeLessThan(1.5);
    });
  });

  describe('Error Handling Under Load', () => {
    it('should maintain stability during error conditions', async () => {
      const mixedRequests = 50;
      const promises: Promise<any>[] = [];
      
      for (let i = 0; i < mixedRequests; i++) {
        if (i % 5 === 0) {
          // Inject some requests that will fail
          promises.push(client.get('/api/invalid-endpoint'));
        } else {
          // Normal requests
          promises.push(client.get('/api/templates?limit=10'));
        }
      }
      
      const results = await Promise.allSettled(promises);
      
      const successfulRequests = results.filter(r => 
        r.status === 'fulfilled' && r.value.status === 200
      ).length;
      
      const failedRequests = results.filter(r => 
        r.status === 'fulfilled' && r.value.status >= 400
      ).length;
      
      // Should handle errors gracefully without affecting valid requests
      expect(successfulRequests).toBeGreaterThan(30); // Most requests should succeed
      expect(failedRequests).toBeGreaterThan(5); // Some should fail as expected
      
      // No requests should be rejected due to system instability
      const rejectedRequests = results.filter(r => r.status === 'rejected').length;
      expect(rejectedRequests).toBe(0);
    });
  });
});