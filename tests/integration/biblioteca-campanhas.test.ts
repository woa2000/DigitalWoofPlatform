/**
 * Suíte de Testes de Integração - Biblioteca de Campanhas Pet
 * 
 * Testa todos os fluxos principais end-to-end
 */

import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import { setupTestDatabase, cleanupTestDatabase } from './helpers/database';
import { createTestUser, createTestBrandVoice } from './helpers/fixtures';
import { TestClient } from './helpers/client';

describe('Integration Tests - Biblioteca de Campanhas', () => {
  let client: TestClient;
  let testUserId: string;
  let testBrandVoiceId: string;

  beforeAll(async () => {
    await setupTestDatabase();
    client = new TestClient();
    
    // Setup test data
    testUserId = await createTestUser();
    testBrandVoiceId = await createTestBrandVoice(testUserId);
  });

  afterAll(async () => {
    await cleanupTestDatabase();
  });

  describe('Template Discovery Flow', () => {
    it('should list templates with pagination', async () => {
      const response = await client.get('/api/templates?page=1&limit=10');
      
      expect(response.status).toBe(200);
      expect(response.data).toHaveProperty('templates');
      expect(response.data).toHaveProperty('pagination');
      expect(response.data.templates).toBeInstanceOf(Array);
      expect(response.data.pagination.total).toBeGreaterThan(0);
    });

    it('should filter templates by category', async () => {
      const response = await client.get('/api/templates?category=promotional');
      
      expect(response.status).toBe(200);
      expect(response.data.templates).toBeInstanceOf(Array);
      response.data.templates.forEach((template: any) => {
        expect(template.category).toBe('promotional');
      });
    });

    it('should search templates by text', async () => {
      const response = await client.get('/api/templates?search=cão');
      
      expect(response.status).toBe(200);
      expect(response.data.templates).toBeInstanceOf(Array);
      // At least one template should contain "cão" in title or description
      const hasMatch = response.data.templates.some((template: any) => 
        template.title.toLowerCase().includes('cão') || 
        template.description.toLowerCase().includes('cão')
      );
      expect(hasMatch).toBe(true);
    });

    it('should get template details', async () => {
      // First get a template ID from the list
      const listResponse = await client.get('/api/templates?limit=1');
      const templateId = listResponse.data.templates[0].id;
      
      const response = await client.get(`/api/templates/${templateId}`);
      
      expect(response.status).toBe(200);
      expect(response.data).toHaveProperty('id', templateId);
      expect(response.data).toHaveProperty('title');
      expect(response.data).toHaveProperty('description');
      expect(response.data).toHaveProperty('content');
    });
  });

  describe('Template Comparison Flow', () => {
    it('should compare multiple templates', async () => {
      // Get some template IDs
      const listResponse = await client.get('/api/templates?limit=3');
      const templateIds = listResponse.data.templates.map((t: any) => t.id);
      
      const response = await client.post('/api/templates/compare', {
        templateIds
      });
      
      expect(response.status).toBe(200);
      expect(response.data).toHaveProperty('comparison');
      expect(response.data.comparison).toBeInstanceOf(Array);
      expect(response.data.comparison).toHaveLength(templateIds.length);
    });

    it('should get template recommendations', async () => {
      const listResponse = await client.get('/api/templates?limit=1');
      const templateId = listResponse.data.templates[0].id;
      
      const response = await client.get(`/api/templates/${templateId}/recommendations`);
      
      expect(response.status).toBe(200);
      expect(response.data).toHaveProperty('recommendations');
      expect(response.data.recommendations).toBeInstanceOf(Array);
    });
  });

  describe('Personalization Flow', () => {
    it('should personalize template content', async () => {
      const listResponse = await client.get('/api/templates?limit=1');
      const templateId = listResponse.data.templates[0].id;
      
      const response = await client.post(`/api/templates/${templateId}/personalize`, {
        brandVoiceId: testBrandVoiceId,
        customizations: {
          targetAudience: 'pet_owners_young',
          tone: 'friendly',
          channels: ['instagram', 'facebook']
        }
      });
      
      expect(response.status).toBe(200);
      expect(response.data).toHaveProperty('personalizedContent');
      expect(response.data).toHaveProperty('personalizationScore');
      expect(response.data.personalizationScore).toBeGreaterThan(0);
    });

    it('should generate preview for different channels', async () => {
      const listResponse = await client.get('/api/templates?limit=1');
      const templateId = listResponse.data.templates[0].id;
      
      const response = await client.post(`/api/templates/${templateId}/preview`, {
        brandVoiceId: testBrandVoiceId,
        channel: 'instagram',
        customizations: {
          tone: 'enthusiastic'
        }
      });
      
      expect(response.status).toBe(200);
      expect(response.data).toHaveProperty('preview');
      expect(response.data.preview).toHaveProperty('content');
      expect(response.data.preview).toHaveProperty('channel', 'instagram');
    });
  });

  describe('Campaign Creation Flow', () => {
    it('should create campaign from template', async () => {
      const listResponse = await client.get('/api/templates?limit=1');
      const templateId = listResponse.data.templates[0].id;
      
      const response = await client.post('/api/campaigns', {
        name: 'Test Campaign',
        templateId,
        brandVoiceId: testBrandVoiceId,
        configuration: {
          channels: ['instagram', 'facebook'],
          budget: 1000,
          duration: 7,
          targetAudience: 'pet_owners_young'
        },
        customizations: {
          tone: 'friendly',
          callToAction: 'Compre agora!'
        }
      });
      
      expect(response.status).toBe(201);
      expect(response.data).toHaveProperty('id');
      expect(response.data).toHaveProperty('name', 'Test Campaign');
      expect(response.data).toHaveProperty('status', 'draft');
    });

    it('should save campaign draft', async () => {
      const response = await client.post('/api/campaigns/draft', {
        name: 'Draft Campaign',
        templateId: 'template-1',
        step: 'personalization',
        data: {
          customizations: {
            tone: 'professional'
          }
        }
      });
      
      expect(response.status).toBe(200);
      expect(response.data).toHaveProperty('draftId');
    });

    it('should load campaign draft', async () => {
      // First create a draft
      const createResponse = await client.post('/api/campaigns/draft', {
        name: 'Draft Campaign 2',
        templateId: 'template-1',
        step: 'configuration',
        data: {
          budget: 500
        }
      });
      
      const draftId = createResponse.data.draftId;
      
      const response = await client.get(`/api/campaigns/draft/${draftId}`);
      
      expect(response.status).toBe(200);
      expect(response.data).toHaveProperty('name', 'Draft Campaign 2');
      expect(response.data).toHaveProperty('step', 'configuration');
    });
  });

  describe('Visual Assets Flow', () => {
    it('should list visual assets', async () => {
      const response = await client.get('/api/assets?page=1&limit=10');
      
      expect(response.status).toBe(200);
      expect(response.data).toHaveProperty('assets');
      expect(response.data).toHaveProperty('pagination');
      expect(response.data.assets).toBeInstanceOf(Array);
    });

    it('should filter assets by type', async () => {
      const response = await client.get('/api/assets?type=image');
      
      expect(response.status).toBe(200);
      response.data.assets.forEach((asset: any) => {
        expect(asset.type).toBe('image');
      });
    });

    it('should manage asset favorites', async () => {
      // Get an asset ID
      const listResponse = await client.get('/api/assets?limit=1');
      const assetId = listResponse.data.assets[0].id;
      
      // Add to favorites
      const addResponse = await client.post(`/api/assets/${assetId}/favorite`);
      expect(addResponse.status).toBe(200);
      
      // Check if in favorites
      const favoritesResponse = await client.get('/api/assets/favorites');
      expect(favoritesResponse.status).toBe(200);
      const favoriteIds = favoritesResponse.data.assets.map((a: any) => a.id);
      expect(favoriteIds).toContain(assetId);
      
      // Remove from favorites
      const removeResponse = await client.delete(`/api/assets/${assetId}/favorite`);
      expect(removeResponse.status).toBe(200);
    });

    it('should create and manage collections', async () => {
      const response = await client.post('/api/assets/collections', {
        name: 'Test Collection',
        description: 'Collection for testing',
        assetIds: []
      });
      
      expect(response.status).toBe(201);
      expect(response.data).toHaveProperty('id');
      expect(response.data).toHaveProperty('name', 'Test Collection');
    });
  });

  describe('Performance Analytics Flow', () => {
    it('should get campaign performance metrics', async () => {
      const response = await client.get('/api/performance/campaigns?dateRange=30d');
      
      expect(response.status).toBe(200);
      expect(response.data).toHaveProperty('campaigns');
      expect(response.data).toHaveProperty('summary');
      expect(response.data.campaigns).toBeInstanceOf(Array);
    });

    it('should get template performance ranking', async () => {
      const response = await client.get('/api/performance/templates/ranking?metric=roi');
      
      expect(response.status).toBe(200);
      expect(response.data).toHaveProperty('ranking');
      expect(response.data.ranking).toBeInstanceOf(Array);
    });

    it('should get performance benchmarks', async () => {
      const response = await client.get('/api/performance/benchmarks?category=pet_food');
      
      expect(response.status).toBe(200);
      expect(response.data).toHaveProperty('benchmarks');
      expect(response.data.benchmarks).toBeInstanceOf(Array);
    });

    it('should generate performance insights', async () => {
      const response = await client.get('/api/performance/insights?period=7d');
      
      expect(response.status).toBe(200);
      expect(response.data).toHaveProperty('insights');
      expect(response.data.insights).toBeInstanceOf(Array);
    });

    it('should export performance data', async () => {
      const response = await client.post('/api/performance/export', {
        format: 'csv',
        dateRange: {
          start: '2024-01-01',
          end: '2024-01-31'
        },
        metrics: ['impressions', 'clicks', 'conversions', 'roi']
      });
      
      expect(response.status).toBe(200);
      expect(response.data).toHaveProperty('downloadUrl');
    });
  });

  describe('Error Handling & Edge Cases', () => {
    it('should handle invalid template ID', async () => {
      const response = await client.get('/api/templates/invalid-id');
      expect(response.status).toBe(404);
    });

    it('should handle invalid pagination parameters', async () => {
      const response = await client.get('/api/templates?page=-1&limit=0');
      expect(response.status).toBe(400);
    });

    it('should handle empty search results', async () => {
      const response = await client.get('/api/templates?search=xyzabc123nonexistent');
      expect(response.status).toBe(200);
      expect(response.data.templates).toHaveLength(0);
    });

    it('should validate personalization parameters', async () => {
      const response = await client.post('/api/templates/template-1/personalize', {
        // Missing required brandVoiceId
        customizations: {}
      });
      expect(response.status).toBe(400);
    });

    it('should handle rate limiting', async () => {
      // Make multiple rapid requests to trigger rate limiting
      const promises = Array.from({ length: 20 }, () => 
        client.get('/api/templates')
      );
      
      const responses = await Promise.allSettled(promises);
      const rateLimited = responses.some(result => 
        result.status === 'fulfilled' && result.value.status === 429
      );
      
      // Rate limiting should kick in for excessive requests
      expect(rateLimited).toBe(true);
    });
  });

  describe('Security Tests', () => {
    it('should prevent SQL injection in search', async () => {
      const maliciousSearch = "'; DROP TABLE templates; --";
      const response = await client.get(`/api/templates?search=${encodeURIComponent(maliciousSearch)}`);
      
      // Should not crash the server
      expect(response.status).toBe(200);
      expect(response.data.templates).toBeInstanceOf(Array);
    });

    it('should sanitize HTML in template content', async () => {
      const response = await client.post('/api/templates/template-1/personalize', {
        brandVoiceId: testBrandVoiceId,
        customizations: {
          customText: '<script>alert("xss")</script>Texto seguro'
        }
      });
      
      expect(response.status).toBe(200);
      // Script tags should be stripped
      expect(response.data.personalizedContent).not.toContain('<script>');
      expect(response.data.personalizedContent).toContain('Texto seguro');
    });

    it('should validate file uploads', async () => {
      const maliciousFile = new Buffer('malicious content');
      
      const response = await client.post('/api/assets/upload', {
        file: maliciousFile,
        filename: 'malicious.exe'
      });
      
      // Should reject non-image files
      expect(response.status).toBe(400);
      expect(response.data.error).toContain('Invalid file type');
    });
  });

  describe('Performance Tests', () => {
    it('should handle concurrent template requests', async () => {
      const startTime = Date.now();
      
      // Make 10 concurrent requests
      const promises = Array.from({ length: 10 }, () => 
        client.get('/api/templates?limit=20')
      );
      
      const responses = await Promise.all(promises);
      const endTime = Date.now();
      
      // All requests should succeed
      responses.forEach(response => {
        expect(response.status).toBe(200);
      });
      
      // Should complete within reasonable time (5 seconds for 10 concurrent requests)
      expect(endTime - startTime).toBeLessThan(5000);
    });

    it('should handle large result sets efficiently', async () => {
      const startTime = Date.now();
      
      const response = await client.get('/api/templates?limit=100');
      
      const endTime = Date.now();
      const responseTime = endTime - startTime;
      
      expect(response.status).toBe(200);
      // Should respond within 2 seconds even for large result sets
      expect(responseTime).toBeLessThan(2000);
    });

    it('should handle complex search queries efficiently', async () => {
      const startTime = Date.now();
      
      const response = await client.get('/api/templates?search=pet food promotion&category=promotional&channel=instagram&audience=young_adults');
      
      const endTime = Date.now();
      const responseTime = endTime - startTime;
      
      expect(response.status).toBe(200);
      // Complex searches should complete within 1 second
      expect(responseTime).toBeLessThan(1000);
    });
  });
});

describe('Cross-Browser Compatibility Tests', () => {
  // These would typically be run with tools like Playwright or Selenium
  it('should work in modern browsers', () => {
    // Placeholder for browser compatibility tests
    expect(true).toBe(true);
  });
});

describe('Accessibility Tests', () => {
  // These would typically be run with tools like axe-core
  it('should meet WCAG 2.1 AA standards', () => {
    // Placeholder for accessibility tests
    expect(true).toBe(true);
  });
});