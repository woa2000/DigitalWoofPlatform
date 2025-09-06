/**
 * Tests for PersonalizationEngine Service
 * 
 * Testa funcionalidades principais:
 * - Cálculo de compatibilidade
 * - Personalização de conteúdo
 * - Integração com Brand Voice JSON
 * - Performance e validação
 */

import { PersonalizationEngine } from '../PersonalizationEngine';
import { ServiceType, CampaignCategory } from '../../models/campaign';

describe('PersonalizationEngine', () => {
  let engine: PersonalizationEngine;

  beforeEach(() => {
    engine = new PersonalizationEngine();
  });

  describe('calculateCompatibilityScore', () => {
    it('should return high score for perfect match', () => {
      const template = {
        id: '123',
        name: 'Test Template',
        description: 'Test Description',
        category: CampaignCategory.AQUISICAO,
        serviceType: ServiceType.VETERINARIA,
        contentPieces: [{
          type: 'instagram_post',
          content: 'Test content',
          formatting: {
            tone: 'friendly' as const,
            includeEmojis: true
          }
        }],
        customizationOptions: [],
        performance: {
          avgEngagementRate: 5.5,
          avgConversionRate: 2.3,
          totalUses: 100
        },
        seasonality: [],
        tags: [],
        createdAt: new Date(),
        updatedAt: new Date()
      };

      const brandVoice = {
        id: '456',
        businessName: 'Pet Clinic Test',
        businessType: ServiceType.VETERINARIA,
        targetAudience: {
          primaryAge: '25-45',
          interests: ['pets', 'health'],
          painPoints: ['pet health'],
          preferredChannels: ['instagram']
        },
        brandPersonality: {
          tone: 'friendly' as const,
          formality: 'neutral' as const,
          energy: 'moderate' as const
        },
        communicationStyle: {
          useEmojis: true,
          preferredHashtags: ['#pets'],
          vocabularyRestrictions: []
        },
        visualIdentity: {
          primaryColors: ['#blue'],
          secondaryColors: ['#white'],
          logoUsageRules: 'standard'
        },
        compliance: {
          avoidWords: [],
          mandatoryDisclaimer: '',
          regulatoryRequirements: []
        }
      };

      const score = engine.calculateCompatibilityScore(template, brandVoice);
      expect(score).toBeGreaterThan(70); // High compatibility expected
    });

    it('should return low score for poor match', () => {
      const template = {
        id: '123',
        name: 'Test Template',
        description: 'Test Description',
        category: CampaignCategory.AQUISICAO,
        serviceType: ServiceType.HOTEL, // Different service type
        contentPieces: [{
          type: 'email',
          content: 'Test content',
          formatting: {
            tone: 'authoritative' as const, // Different tone
            includeEmojis: false // Different emoji preference
          }
        }],
        customizationOptions: [],
        performance: {
          avgEngagementRate: 2.0,
          avgConversionRate: 1.0,
          totalUses: 10
        },
        seasonality: [],
        tags: [],
        createdAt: new Date(),
        updatedAt: new Date()
      };

      const brandVoice = {
        id: '456',
        businessName: 'Pet Clinic Test',
        businessType: ServiceType.VETERINARIA,
        targetAudience: {
          primaryAge: '25-45',
          interests: ['pets', 'health'],
          painPoints: ['pet health'],
          preferredChannels: ['instagram'] // Different channel
        },
        brandPersonality: {
          tone: 'friendly' as const,
          formality: 'neutral' as const,
          energy: 'moderate' as const
        },
        communicationStyle: {
          useEmojis: true,
          preferredHashtags: ['#pets'],
          vocabularyRestrictions: []
        },
        visualIdentity: {
          primaryColors: ['#blue'],
          secondaryColors: ['#white'],
          logoUsageRules: 'standard'
        },
        compliance: {
          avoidWords: [],
          mandatoryDisclaimer: '',
          regulatoryRequirements: []
        }
      };

      const score = engine.calculateCompatibilityScore(template, brandVoice);
      expect(score).toBeLessThan(50); // Low compatibility expected
    });
  });

  describe('personalizeTemplate', () => {
    it('should personalize template content successfully', async () => {
      const template = {
        id: '123',
        name: 'Pet Health Campaign',
        description: 'General pet health template',
        category: CampaignCategory.EDUCACAO,
        serviceType: ServiceType.VETERINARIA,
        contentPieces: [{
          type: 'instagram_post',
          content: 'Cuide da saúde do seu pet!',
          formatting: {
            tone: 'friendly' as const,
            includeEmojis: false
          }
        }],
        customizationOptions: [],
        performance: {
          avgEngagementRate: 4.2,
          avgConversionRate: 1.8,
          totalUses: 50
        },
        seasonality: [],
        tags: ['health', 'prevention'],
        createdAt: new Date(),
        updatedAt: new Date()
      };

      const brandVoice = {
        id: '456',
        businessName: 'Clínica Veterinária Amigo Fiel',
        businessType: ServiceType.VETERINARIA,
        targetAudience: {
          primaryAge: '30-50',
          interests: ['pets', 'health', 'family'],
          painPoints: ['pet health concerns', 'veterinary costs'],
          preferredChannels: ['instagram', 'facebook']
        },
        brandPersonality: {
          tone: 'friendly' as const,
          formality: 'informal' as const,
          energy: 'moderate' as const
        },
        communicationStyle: {
          useEmojis: true,
          preferredHashtags: ['#veterinaria', '#pets', '#saude'],
          vocabularyRestrictions: []
        },
        visualIdentity: {
          primaryColors: ['#4A90E2'],
          secondaryColors: ['#F5F5F5'],
          logoUsageRules: 'always include in posts'
        },
        compliance: {
          avoidWords: ['cheap', 'discount'],
          mandatoryDisclaimer: 'Consulte sempre um veterinário.',
          regulatoryRequirements: ['CRMV registration']
        }
      };

      const result = await engine.personalizeTemplate(template, brandVoice, {
        targetChannel: 'instagram',
        includeSeasonalContext: true
      });

      expect(result.compatibilityScore).toBeGreaterThan(0);
      expect(result.personalizedContent).toHaveLength(1);
      expect(result.personalizedContent[0].personalizedText).toContain('Amigo Fiel');
      expect(result.complianceIssues).toBeDefined();
      expect(result.recommendations).toBeDefined();
    });

    it('should include seasonal context when requested', async () => {
      const template = {
        id: '123',
        name: 'Summer Pet Care',
        description: 'Summer care tips',
        category: CampaignCategory.EDUCACAO,
        serviceType: ServiceType.VETERINARIA,
        contentPieces: [{
          type: 'facebook_post',
          content: 'Dicas de cuidados para seu pet',
          formatting: {
            tone: 'friendly' as const,
            includeEmojis: true
          }
        }],
        customizationOptions: [],
        performance: {
          avgEngagementRate: 3.8,
          avgConversionRate: 1.5,
          totalUses: 25
        },
        seasonality: [],
        tags: ['summer', 'care'],
        createdAt: new Date(),
        updatedAt: new Date()
      };

      const brandVoice = {
        id: '456',
        businessName: 'Pet Care Center',
        businessType: ServiceType.VETERINARIA,
        targetAudience: {
          primaryAge: '25-45',
          interests: ['pets'],
          painPoints: ['seasonal care'],
          preferredChannels: ['facebook']
        },
        brandPersonality: {
          tone: 'friendly' as const,
          formality: 'neutral' as const,
          energy: 'moderate' as const
        },
        communicationStyle: {
          useEmojis: true,
          preferredHashtags: ['#pets'],
          vocabularyRestrictions: []
        },
        visualIdentity: {
          primaryColors: ['#green'],
          secondaryColors: ['#white'],
          logoUsageRules: 'standard'
        },
        compliance: {
          avoidWords: [],
          mandatoryDisclaimer: '',
          regulatoryRequirements: []
        }
      };

      const result = await engine.personalizeTemplate(template, brandVoice, {
        includeSeasonalContext: true
      });

      expect(result.seasonalContext).toBeDefined();
      expect(result.seasonalContext?.season).toBeDefined();
    });
  });

  describe('checkCompliance', () => {
    it('should detect compliance issues', () => {
      const brandVoice = {
        id: '456',
        businessName: 'Test Clinic',
        businessType: ServiceType.VETERINARIA,
        targetAudience: {
          primaryAge: '25-45',
          interests: ['pets'],
          painPoints: ['health'],
          preferredChannels: ['instagram']
        },
        brandPersonality: {
          tone: 'friendly' as const,
          formality: 'neutral' as const,
          energy: 'moderate' as const
        },
        communicationStyle: {
          useEmojis: true,
          preferredHashtags: ['#pets'],
          vocabularyRestrictions: []
        },
        visualIdentity: {
          primaryColors: ['#blue'],
          secondaryColors: ['#white'],
          logoUsageRules: 'standard'
        },
        compliance: {
          avoidWords: ['cheap', 'free'],
          mandatoryDisclaimer: 'Professional advice required.',
          regulatoryRequirements: ['licensing']
        }
      };

      const content = 'Get cheap veterinary care! Free consultation today!';
      
      const issues = engine.checkCompliance(content, brandVoice);
      
      expect(issues).toHaveLength(2); // Should detect 'cheap' and 'free'
      expect(issues[0].type).toBe('restricted_word');
      expect(issues[1].type).toBe('restricted_word');
    });

    it('should pass compliance when content is clean', () => {
      const brandVoice = {
        id: '456',
        businessName: 'Test Clinic',
        businessType: ServiceType.VETERINARIA,
        targetAudience: {
          primaryAge: '25-45',
          interests: ['pets'],
          painPoints: ['health'],
          preferredChannels: ['instagram']
        },
        brandPersonality: {
          tone: 'friendly' as const,
          formality: 'neutral' as const,
          energy: 'moderate' as const
        },
        communicationStyle: {
          useEmojis: true,
          preferredHashtags: ['#pets'],
          vocabularyRestrictions: []
        },
        visualIdentity: {
          primaryColors: ['#blue'],
          secondaryColors: ['#white'],
          logoUsageRules: 'standard'
        },
        compliance: {
          avoidWords: ['cheap', 'free'],
          mandatoryDisclaimer: 'Professional advice required.',
          regulatoryRequirements: ['licensing']
        }
      };

      const content = 'Professional veterinary care for your beloved pet.';
      
      const issues = engine.checkCompliance(content, brandVoice);
      
      expect(issues).toHaveLength(0);
    });
  });
});