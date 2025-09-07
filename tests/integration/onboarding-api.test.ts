/**
 * Integration tests for Onboarding API endpoints
 */

import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import request from 'supertest';
import { createServer } from '../../server/index.js';

describe('Onboarding API Integration Tests', () => {
  let app: any;
  let server: any;
  const testUserId = 'test-user-integration-123';

  beforeAll(async () => {
    // Create test server
    const result = await createServer();
    app = result.app;
    server = result.server;
  });

  afterAll(async () => {
    if (server) {
      await new Promise((resolve) => server.close(resolve));
    }
  });

  describe('POST /api/onboarding/:userId', () => {
    it('should create new onboarding record', async () => {
      const onboardingData = {
        toneConfig: {
          confianca: 0.8,
          acolhimento: 0.7,
          humor: 0.3,
          especializacao: 0.9
        },
        languageConfig: {
          preferredTerms: ['inovação', 'qualidade'],
          avoidTerms: ['barato'],
          defaultCTAs: ['Saiba mais', 'Entre em contato']
        },
        brandValues: {
          values: [
            { name: 'Qualidade', weight: 0.9, description: 'Compromisso com excelência' }
          ],
          disclaimer: 'Nossos valores guiam todas as decisões'
        }
      };

      const response = await request(app)
        .post(`/api/onboarding/${testUserId}`)
        .send(onboardingData)
        .expect(201);

      expect(response.body.success).toBe(true);
      expect(response.body.data).toBeDefined();
      expect(response.body.data.toneConfig).toEqual(onboardingData.toneConfig);
      expect(response.body.data.languageConfig).toEqual(onboardingData.languageConfig);
      expect(response.body.data.brandValues).toEqual(onboardingData.brandValues);
    });

    it('should return 400 for invalid data', async () => {
      const invalidData = {
        // Missing required toneConfig and languageConfig
        brandValues: {
          values: [],
          disclaimer: 'Test'
        }
      };

      const response = await request(app)
        .post(`/api/onboarding/${testUserId}`)
        .send(invalidData)
        .expect(400);

      expect(response.body.success).toBe(false);
      expect(response.body.error).toContain('required');
    });
  });

  describe('GET /api/onboarding/:userId', () => {
    it('should return onboarding data when exists', async () => {
      const response = await request(app)
        .get(`/api/onboarding/${testUserId}`)
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data).toBeDefined();
      expect(response.body.data.toneConfig).toBeDefined();
      expect(response.body.data.languageConfig).toBeDefined();
    });

    it('should return 404 when onboarding data not found', async () => {
      const nonExistentUserId = 'non-existent-user-123';

      const response = await request(app)
        .get(`/api/onboarding/${nonExistentUserId}`)
        .expect(404);

      expect(response.body.success).toBe(false);
      expect(response.body.error).toBe('Onboarding data not found');
    });
  });

  describe('PUT /api/onboarding/:userId/upsert', () => {
    it('should upsert onboarding data', async () => {
      const updateData = {
        toneConfig: {
          confianca: 0.9,
          acolhimento: 0.8,
          humor: 0.2,
          especializacao: 0.95
        },
        languageConfig: {
          preferredTerms: ['inovação', 'qualidade', 'excelência'],
          avoidTerms: ['barato', 'simples'],
          defaultCTAs: ['Saiba mais', 'Entre em contato', 'Descubra']
        }
      };

      const response = await request(app)
        .put(`/api/onboarding/${testUserId}/upsert`)
        .send(updateData)
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data.toneConfig.confianca).toBe(0.9);
      expect(response.body.data.languageConfig.preferredTerms).toContain('excelência');
    });
  });

  describe('GET /api/onboarding/:userId/progress', () => {
    it('should return onboarding progress', async () => {
      const response = await request(app)
        .get(`/api/onboarding/${testUserId}/progress`)
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data).toBeDefined();
      expect(response.body.data).toHaveProperty('currentStep');
      expect(response.body.data).toHaveProperty('completed');
      expect(response.body.data).toHaveProperty('completedSteps');
      expect(response.body.data).toHaveProperty('totalSteps');
    });
  });

  describe('POST /api/onboarding/:userId/complete', () => {
    it('should complete onboarding', async () => {
      const response = await request(app)
        .post(`/api/onboarding/${testUserId}/complete`)
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data).toBeDefined();
      expect(response.body.data.onboarding).toBeDefined();
      expect(response.body.data.brandVoiceData).toBeDefined();
    });
  });

  describe('GET /api/onboarding/:userId/brand-voice-json', () => {
    it('should generate Brand Voice JSON', async () => {
      const response = await request(app)
        .get(`/api/onboarding/${testUserId}/brand-voice-json`)
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data).toBeDefined();
      expect(response.body.data.metadata).toBeDefined();
      expect(response.body.data.metadata.version).toBe('1.0');
      expect(response.body.data.brand).toBeDefined();
      expect(response.body.data.tone).toBeDefined();
      expect(response.body.data.language).toBeDefined();
      expect(response.body.data.values).toBeDefined();
    });
  });

  describe('DELETE /api/onboarding/:userId', () => {
    it('should delete onboarding data', async () => {
      const response = await request(app)
        .delete(`/api/onboarding/${testUserId}`)
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.message).toBe('Onboarding data deleted successfully');
    });
  });

  describe('Storage API - Logo Upload', () => {
    it('should handle logo upload endpoint (will fail without file but tests route)', async () => {
      const response = await request(app)
        .post(`/api/storage/logo/${testUserId}`)
        .expect(400); // Should fail because no file provided

      expect(response.body.success).toBe(false);
      expect(response.body.error).toBe('No file uploaded');
    });

    it('should handle invalid file type', async () => {
      const response = await request(app)
        .post(`/api/storage/logo/${testUserId}`)
        .attach('logo', Buffer.from('invalid file content'), { filename: 'test.txt', contentType: 'text/plain' })
        .expect(400);

      expect(response.body.success).toBe(false);
      expect(response.body.error).toBe('Only image files are allowed');
    });
  });
});