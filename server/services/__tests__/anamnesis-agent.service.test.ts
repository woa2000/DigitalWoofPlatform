/**
 * Unit tests for Anamnesis Agent Service
 */

import { describe, it, expect, beforeEach, vi } from 'vitest';
import { AnamnesisAgentService } from '../anamnesis-agent.service.js';

// Mock the mock data
vi.mock('../fixtures/mock-analysis-results.json', () => ({
  default: {
    genericBusiness: {
      identity: { score: 75, findings: ['Generic business identity'], recommendations: [], confidence: 'medium' },
      personas: {
        primaryPersona: { name: 'Generic Customer', age: '25-45', profile: 'Business professional', needs: ['Quality service'], painPoints: ['High prices'] },
        secondaryPersonas: [],
        insights: ['Standard business insights']
      },
      ux: {
        navigation: { score: 70, issues: ['Complex navigation'], strengths: ['Clear branding'] },
        content: { score: 65, readability: 75, engagement: ['Good headlines'] },
        conversion: { score: 60, ctaPresence: true, trustSignals: ['Contact info'] },
        mobile: { score: 55, responsive: true, issues: ['Slow loading'] }
      },
      ecosystem: {
        socialPresence: [{ platform: 'LinkedIn', followers: 1000 }],
        competitors: ['Competitor A', 'Competitor B'],
        marketPosition: { category: 'B2B Services', differentiation: ['Quality'], threats: ['Competition'] }
      },
      actionPlan: {
        immediate: ['Improve mobile speed'],
        shortTerm: ['Update content'],
        longTerm: ['Expand social presence']
      },
      roadmap: {
        phases: ['Phase 1', 'Phase 2'],
        milestones: ['Milestone 1'],
        budget: { total: 50000, breakdown: [{ category: 'Marketing', amount: 20000 }] }
      },
      homeAnatomy: {
        structure: {
          header: { logo: true, navigation: ['Home', 'Services'], contact: true, cta: true },
          hero: { headline: 'Welcome', subheadline: 'We help you', cta: 'Contact us', media: 'image' },
          sections: ['About', 'Services', 'Contact'],
          footer: { links: ['Privacy'], contact: true, social: ['LinkedIn'] }
        },
        performance: { loadTime: 2.5, mobileOptimized: true, seoScore: 75, accessibilityScore: 80 }
      },
      questions: {
        brandStrategy: ['What is your brand mission?'],
        contentStrategy: ['What content performs best?'],
        technical: ['Is your site mobile-friendly?'],
        business: ['What are your business goals?']
      }
    }
  }
}));

describe('AnamnesisAgentService', () => {
  let service: AnamnesisAgentService;

  beforeEach(() => {
    vi.clearAllMocks();
    service = new AnamnesisAgentService();
  });

  describe('constructor', () => {
    it('should initialize with default config', () => {
      const service = new AnamnesisAgentService();
      expect(service).toBeDefined();
    });

    it('should accept custom config', () => {
      const customConfig = {
        processingTimeMs: 30000,
        enableRandomness: false,
        errorRate: 0.1
      };
      const service = new AnamnesisAgentService(customConfig);
      expect(service).toBeDefined();
    });
  });

  describe('analyzeDigitalPresence', () => {
    const mockRequest = {
      primaryUrl: 'https://example.com',
      socialUrls: ['https://instagram.com/example'],
      sources: [
        { id: '1', type: 'site' as const, url: 'https://example.com', normalizedUrl: 'https://example.com', hash: 'hash1', status: 'pending' as const },
        { id: '2', type: 'social' as const, url: 'https://instagram.com/example', normalizedUrl: 'https://instagram.com/example', hash: 'hash2', status: 'pending' as const }
      ],
      userId: 'user-123',
      requestId: 'request-123'
    };

    it('should analyze successfully', async () => {
      const result = await service.analyzeDigitalPresence(mockRequest);

      expect(result).toBeDefined();
      expect(result.id).toBe('request-123');
      expect(result.status).toBe('done');
      expect(result.scoreCompleteness).toBeGreaterThan(0);
      expect(result.findings).toBeDefined();
      expect(result.sources).toHaveLength(2);
      expect(result.metadata).toBeDefined();
    });

    it('should handle errors gracefully', async () => {
      // Create service with high error rate
      const errorService = new AnamnesisAgentService({
        errorRate: 1.0, // 100% error rate
        enableRandomness: false
      });

      const result = await errorService.analyzeDigitalPresence(mockRequest);

      expect(result.status).toBe('error');
      expect(result.scoreCompleteness).toBe(0);
      expect(result.errorMessage).toBeDefined();
    });

    it('should include all required finding sections', async () => {
      const result = await service.analyzeDigitalPresence(mockRequest);

      expect(result.findings.identity).toBeDefined();
      expect(result.findings.personas).toBeDefined();
      expect(result.findings.ux).toBeDefined();
      expect(result.findings.ecosystem).toBeDefined();
      expect(result.findings.actionPlan).toBeDefined();
      expect(result.findings.roadmap).toBeDefined();
      expect(result.findings.homeAnatomy).toBeDefined();
      expect(result.findings.questions).toBeDefined();
    });

    it('should calculate completeness score', async () => {
      const result = await service.analyzeDigitalPresence(mockRequest);

      expect(result.scoreCompleteness).toBeGreaterThanOrEqual(0);
      expect(result.scoreCompleteness).toBeLessThanOrEqual(100);
    });

    it('should include metadata', async () => {
      const startTime = Date.now();
      const result = await service.analyzeDigitalPresence(mockRequest);
      const endTime = Date.now();

      expect(result.metadata.startedAt).toBeDefined();
      expect(result.metadata.completedAt).toBeDefined();
      expect(result.metadata.duration).toBeGreaterThanOrEqual(0);
      expect(result.metadata.sourceCount).toBe(2);
      expect(result.metadata.confidence).toBeDefined();
    });
  });

  describe('detectBusinessType', () => {
    it('should detect veterinary business', () => {
      const service = new AnamnesisAgentService();
      const type = (service as any).detectBusinessType('https://clinicaveterinaria.com', []);
      expect(type).toBe('petVeterinary');
    });

    it('should detect pet shop business', () => {
      const service = new AnamnesisAgentService();
      const type = (service as any).detectBusinessType('https://petshop.com.br', []);
      expect(type).toBe('petShop');
    });

    it('should default to generic business', () => {
      const service = new AnamnesisAgentService();
      const type = (service as any).detectBusinessType('https://example.com', []);
      expect(type).toBe('genericBusiness');
    });
  });

  describe('config management', () => {
    it('should update config', () => {
      const newConfig = { processingTimeMs: 60000 };
      service.updateConfig(newConfig);

      const config = service.getConfig();
      expect(config.processingTimeMs).toBe(60000);
    });

    it('should get current config', () => {
      const config = service.getConfig();
      expect(config).toBeDefined();
      expect(config.processingTimeMs).toBeDefined();
      expect(config.enableRandomness).toBeDefined();
    });
  });
});