/**
 * Integration tests for Anamnesis API endpoints
 * Note: These tests require a running server instance
 */

import { describe, it, expect } from 'vitest';

describe('Anamnesis API Integration Tests', () => {
  const baseUrl = 'http://localhost:5000';
  let testAnalysisId: string;

  // Helper function to make API calls
  const makeRequest = async (method: string, path: string, data?: any) => {
    const url = `${baseUrl}${path}`;
    const config: RequestInit = {
      method,
      headers: {
        'Content-Type': 'application/json',
        // Add mock authorization for testing
        'Authorization': 'Bearer test-token'
      }
    };

    if (data && method !== 'GET') {
      config.body = JSON.stringify(data);
    }

    const response = await fetch(url, config);
    const responseData = await response.json().catch(() => ({}));

    return {
      status: response.status,
      data: responseData,
      ok: response.ok
    };
  };

  describe('POST /api/anamnesis', () => {
    it('should create a new analysis successfully', async () => {
      const response = await makeRequest('POST', '/api/anamnesis', {
        primaryUrl: 'https://example.com',
        socialUrls: ['https://instagram.com/example'],
        metadata: {
          requestId: 'test-request-123'
        }
      });

      expect(response.status).toBe(201);
      expect(response.data.success).toBe(true);
      expect(response.data.data).toBeDefined();
      expect(response.data.data.id).toBeDefined();
      expect(response.data.data.status).toBe('queued');

      // Store analysis ID for subsequent tests
      testAnalysisId = response.data.data.id;
    });

    it('should handle duplicate analysis', async () => {
      // First create an analysis
      const firstResponse = await request(server)
        .post('/api/anamnesis')
        .set('Authorization', `Bearer test-token`)
        .send({
          primaryUrl: 'https://duplicate-test.com',
          socialUrls: []
        });

      expect(firstResponse.status).toBe(201);

      // Try to create the same analysis again
      const secondResponse = await request(server)
        .post('/api/anamnesis')
        .set('Authorization', `Bearer test-token`)
        .send({
          primaryUrl: 'https://duplicate-test.com',
          socialUrls: []
        });

      expect(secondResponse.status).toBe(200);
      expect(secondResponse.body.success).toBe(true);
      expect(secondResponse.body.deduplication?.isDuplicate).toBe(true);
    });

    it('should validate required fields', async () => {
      const response = await request(server)
        .post('/api/anamnesis')
        .set('Authorization', `Bearer test-token`)
        .send({
          // Missing primaryUrl
          socialUrls: []
        });

      expect(response.status).toBe(400);
      expect(response.body.success).toBe(false);
      expect(response.body.error).toContain('Validation failed');
    });

    it('should validate URL format', async () => {
      const response = await request(server)
        .post('/api/anamnesis')
        .set('Authorization', `Bearer test-token`)
        .send({
          primaryUrl: 'not-a-valid-url',
          socialUrls: []
        });

      expect(response.status).toBe(400);
      expect(response.body.success).toBe(false);
    });
  });

  describe('GET /api/anamnesis/:id', () => {
    it('should retrieve analysis by ID', async () => {
      // First create an analysis
      const createResponse = await request(server)
        .post('/api/anamnesis')
        .set('Authorization', `Bearer test-token`)
        .send({
          primaryUrl: 'https://get-test.com',
          socialUrls: []
        });

      const analysisId = createResponse.body.data.id;

      // Wait a moment for processing
      await new Promise(resolve => setTimeout(resolve, 1000));

      // Retrieve the analysis
      const response = await request(server)
        .get(`/api/anamnesis/${analysisId}`)
        .set('Authorization', `Bearer test-token`);

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.data.id).toBe(analysisId);
      expect(response.body.data.status).toBeDefined();
    });

    it('should return 404 for non-existent analysis', async () => {
      const response = await request(server)
        .get('/api/anamnesis/non-existent-id')
        .set('Authorization', `Bearer test-token`);

      expect(response.status).toBe(404);
      expect(response.body.success).toBe(false);
      expect(response.body.error).toBe('Analysis not found');
    });

    it('should validate UUID format', async () => {
      const response = await request(server)
        .get('/api/anamnesis/invalid-uuid')
        .set('Authorization', `Bearer test-token`);

      expect(response.status).toBe(400);
      expect(response.body.success).toBe(false);
      expect(response.body.error).toBe('Invalid analysis ID format');
    });
  });

  describe('GET /api/anamnesis/:id/status', () => {
    it('should get analysis status', async () => {
      // Create an analysis first
      const createResponse = await request(server)
        .post('/api/anamnesis')
        .set('Authorization', `Bearer test-token`)
        .send({
          primaryUrl: 'https://status-test.com',
          socialUrls: []
        });

      const analysisId = createResponse.body.data.id;

      const response = await request(server)
        .get(`/api/anamnesis/${analysisId}/status`)
        .set('Authorization', `Bearer test-token`);

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.data.id).toBe(analysisId);
      expect(response.body.data.status).toBeDefined();
      expect(response.body.data.scoreCompleteness).toBeDefined();
    });
  });

  describe('GET /api/anamnesis', () => {
    it('should list analyses with pagination', async () => {
      const response = await request(server)
        .get('/api/anamnesis?page=1&limit=10')
        .set('Authorization', `Bearer test-token`);

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(Array.isArray(response.body.data)).toBe(true);
      expect(response.body.pagination).toBeDefined();
      expect(response.body.pagination.total).toBeDefined();
      expect(response.body.pagination.page).toBe(1);
      expect(response.body.pagination.limit).toBe(10);
    });

    it('should filter by status', async () => {
      const response = await request(server)
        .get('/api/anamnesis?status=done')
        .set('Authorization', `Bearer test-token`);

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(Array.isArray(response.body.data)).toBe(true);

      // All returned analyses should have the requested status
      response.body.data.forEach((analysis: any) => {
        expect(analysis.status).toBe('done');
      });
    });

    it('should validate pagination parameters', async () => {
      const response = await request(server)
        .get('/api/anamnesis?page=0&limit=200')
        .set('Authorization', `Bearer test-token`);

      expect(response.status).toBe(400);
      expect(response.body.success).toBe(false);
      expect(response.body.error).toContain('Invalid query parameters');
    });
  });

  describe('DELETE /api/anamnesis/:id', () => {
    it('should soft delete analysis', async () => {
      // Create an analysis first
      const createResponse = await request(server)
        .post('/api/anamnesis')
        .set('Authorization', `Bearer test-token`)
        .send({
          primaryUrl: 'https://delete-test.com',
          socialUrls: []
        });

      const analysisId = createResponse.body.data.id;

      // Delete the analysis
      const deleteResponse = await request(server)
        .delete(`/api/anamnesis/${analysisId}`)
        .set('Authorization', `Bearer test-token`);

      expect(deleteResponse.status).toBe(200);
      expect(deleteResponse.body.success).toBe(true);

      // Verify it's deleted (soft delete)
      const getResponse = await request(server)
        .get(`/api/anamnesis/${analysisId}`)
        .set('Authorization', `Bearer test-token`);

      // The analysis should still exist but with error status
      expect(getResponse.status).toBe(200);
      expect(getResponse.body.data.status).toBe('error');
    });
  });

  describe('GET /api/anamnesis/metrics/errors', () => {
    it('should return error statistics', async () => {
      const response = await request(server)
        .get('/api/anamnesis/metrics/errors')
        .set('Authorization', `Bearer test-token`);

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.data).toBeDefined();
      expect(typeof response.body.data.errorCounts).toBe('object');
      expect(typeof response.body.data.statusDistribution).toBe('object');
    });
  });

  describe('GET /api/anamnesis/metrics/deduplication', () => {
    it('should return deduplication metrics', async () => {
      const response = await request(server)
        .get('/api/anamnesis/metrics/deduplication')
        .set('Authorization', `Bearer test-token`);

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.data).toBeDefined();
    });
  });

  describe('Error handling', () => {
    it('should handle unauthorized requests', async () => {
      const response = await request(server)
        .post('/api/anamnesis')
        .send({
          primaryUrl: 'https://example.com',
          socialUrls: []
        });

      // Should return 401 or handle gracefully
      expect([400, 401, 500].includes(response.status)).toBe(true);
    });

    it('should handle malformed JSON', async () => {
      const response = await request(server)
        .post('/api/anamnesis')
        .set('Authorization', `Bearer test-token`)
        .set('Content-Type', 'application/json')
        .send('{ invalid json }');

      expect(response.status).toBe(400);
      expect(response.body.success).toBe(false);
    });
  });
});