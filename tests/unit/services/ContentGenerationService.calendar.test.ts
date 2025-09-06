import { describe, it, expect, beforeEach, vi, Mock } from 'vitest';
import { ContentGenerationService } from '../../../server/services/ContentGenerationService';
import type { CalendarContentRequest, BatchCalendarContentRequest, ContentSuggestion } from '../../../server/services/ContentGenerationService';
import type { CalendarItem, BusinessType, ContentType } from '../../../shared/types/calendar';

// Mock dependencies
const mockOpenAI = {
  chat: {
    completions: {
      create: vi.fn()
    }
  }
} as any;

const mockComplianceChecker = {
  checkContent: vi.fn().mockResolvedValue({
    isCompliant: true,
    issues: [],
    suggestions: [],
    score: 1.0
  })
} as any;

const mockSeasonalIntelligenceService = {
  getSeasonalSuggestions: vi.fn()
} as any;

const mockCampaignTemplateService = {
  findTemplates: vi.fn()
} as any;

const mockTimingOptimizationService = {
  calculateOptimalTiming: vi.fn()
} as any;

describe('ContentGenerationService - Calendar Integration', () => {
  let contentGenerationService: ContentGenerationService;

  beforeEach(() => {
    // Reset mocks
    vi.clearAllMocks();

    // Create service instance
    contentGenerationService = new ContentGenerationService(
      mockOpenAI,
      mockComplianceChecker,
      mockSeasonalIntelligenceService,
      mockCampaignTemplateService,
      mockTimingOptimizationService
    );
  });

  describe('generateCalendarContent', () => {
    it('should generate content with seasonal intelligence integration', async () => {
      // Arrange
      const request: CalendarContentRequest = {
        accountId: 'test-account',
        businessType: 'veterinaria',
        contentType: 'educativo',
        targetDate: new Date('2024-12-25'),
        channels: ['instagram', 'facebook'],
        preferences: {
          tone: 'professional',
          includeHashtags: true,
          includeEmojis: true
        }
      };

      const mockSeasonalSuggestions = {
        suggestions: [{
          name: 'Natal',
          reasoning: 'Cuidados especiais com pets durante as festas',
          suggestedDate: new Date('2024-12-25')
        }],
        insights: []
      };

      const mockOptimalTiming = {
        recommendedTimes: [{
          timestamp: new Date('2024-12-25T10:00:00Z'),
          expectedEngagement: 750,
          reasoning: 'Horário de pico para engagement'
        }]
      };

      mockSeasonalIntelligenceService.getSeasonalSuggestions.mockResolvedValue(mockSeasonalSuggestions);
      mockTimingOptimizationService.calculateOptimalTiming.mockResolvedValue(mockOptimalTiming);

      // Act
      const result = await contentGenerationService.generateCalendarContent(request);

      // Assert
      expect(result).toBeDefined();
      expect(result.title).toContain('Natal');
      expect(result.content.primary).toContain('Natal');
      expect(result.content.hashtags).toContain('#pets');
      expect(result.content.captions).toHaveProperty('instagram');
      expect(result.content.captions).toHaveProperty('facebook');
      expect(result.optimization.seasonalRelevance).toBe(85);
      expect(result.optimization.optimalPostingTime).toEqual(mockOptimalTiming.recommendedTimes[0].timestamp);
      expect(result.reasoning.seasonalFactors).toHaveLength(1);
      expect(result.metadata.sources).toContain('SeasonalIntelligence');
      expect(result.metadata.sources).toContain('TimingOptimization');

      // Verify service calls
      expect(mockSeasonalIntelligenceService.getSeasonalSuggestions).toHaveBeenCalledWith(
        'veterinaria',
        { start: request.targetDate, end: request.targetDate }
      );
      expect(mockTimingOptimizationService.calculateOptimalTiming).toHaveBeenCalledWith(
        'test-account',
        'educativo',
        'instagram',
        request.targetDate
      );
    });

    it('should handle missing seasonal intelligence service gracefully', async () => {
      // Arrange
      const serviceWithoutSeasonal = new ContentGenerationService(
        mockOpenAI,
        mockComplianceChecker
      );

      const request: CalendarContentRequest = {
        accountId: 'test-account',
        businessType: 'petshop',
        contentType: 'promocional',
        targetDate: new Date('2024-12-25'),
        channels: ['instagram']
      };

      // Act
      const result = await serviceWithoutSeasonal.generateCalendarContent(request);

      // Assert
      expect(result).toBeDefined();
      expect(result.optimization.seasonalRelevance).toBe(50); // Default when no seasonal data
      expect(result.metadata.sources).toContain('AIGeneration');
    });

    it('should optimize content for different channels', async () => {
      // Arrange
      const request: CalendarContentRequest = {
        accountId: 'test-account',
        businessType: 'estetica',
        contentType: 'engajamento',
        targetDate: new Date('2024-12-25'),
        channels: ['instagram', 'facebook', 'tiktok', 'linkedin']
      };

      mockSeasonalIntelligenceService.getSeasonalSuggestions.mockResolvedValue({
        suggestions: [],
        insights: []
      });

      // Act
      const result = await contentGenerationService.generateCalendarContent(request);

      // Assert
      expect(result.content.captions).toHaveProperty('instagram');
      expect(result.content.captions).toHaveProperty('facebook');
      expect(result.content.captions).toHaveProperty('tiktok');
      expect(result.content.captions).toHaveProperty('linkedin');

      // Instagram optimization
      expect(result.content.captions?.instagram).toContain('📸');
      expect(result.content.captions?.instagram).toContain('🐾');

      // LinkedIn optimization (should be more professional)
      expect(result.content.captions?.linkedin).not.toContain('🐾');
      expect(result.content.captions?.linkedin).not.toContain('📸');

      // TikTok optimization
      expect(result.content.captions?.tiktok).toContain('#PetTok');

      // Media recommendations
      expect(result.content.mediaRecommendations).toBeDefined();
      expect(result.content.mediaRecommendations?.some(m => m.type === 'image')).toBe(true);
      expect(result.content.mediaRecommendations?.some(m => m.type === 'video')).toBe(true);
    });

    it('should calculate audience alignment based on business type and content type', async () => {
      // Arrange
      const veterinariaEducativo: CalendarContentRequest = {
        accountId: 'vet-account',
        businessType: 'veterinaria',
        contentType: 'educativo',
        targetDate: new Date('2024-12-25'),
        channels: ['instagram']
      };

      const petshopPromocional: CalendarContentRequest = {
        accountId: 'shop-account',
        businessType: 'petshop',
        contentType: 'promocional',
        targetDate: new Date('2024-12-25'),
        channels: ['instagram']
      };

      mockSeasonalIntelligenceService.getSeasonalSuggestions.mockResolvedValue({
        suggestions: [],
        insights: []
      });

      // Act
      const vetResult = await contentGenerationService.generateCalendarContent(veterinariaEducativo);
      const shopResult = await contentGenerationService.generateCalendarContent(petshopPromocional);

      // Assert
      expect(vetResult.optimization.audienceAlignment).toBe(95); // High alignment for vet + educational
      expect(shopResult.optimization.audienceAlignment).toBe(90); // High alignment for shop + promotional
    });
  });

  describe('generateBatchCalendarContent', () => {
    it('should generate content suggestions for a full month', async () => {
      // Arrange
      const request: BatchCalendarContentRequest = {
        accountId: 'test-account',
        businessType: 'veterinaria',
        period: {
          start: new Date('2024-12-01'),
          end: new Date('2024-12-31')
        },
        contentTypes: ['educativo', 'promocional', 'engajamento'],
        channels: ['instagram', 'facebook'],
        frequency: 3 // 3 posts per week
      };

      const mockSeasonalSuggestions = {
        suggestions: [
          {
            name: 'Natal',
            suggestedDate: new Date('2024-12-25'),
            reasoning: 'Cuidados especiais durante as festas'
          },
          {
            name: 'Ano Novo',
            suggestedDate: new Date('2024-12-31'),
            reasoning: 'Preparação para fogos de artifício'
          }
        ],
        insights: []
      };

      mockSeasonalIntelligenceService.getSeasonalSuggestions.mockResolvedValue(mockSeasonalSuggestions);

      // Act
      const result = await contentGenerationService.generateBatchCalendarContent(request);

      // Assert
      expect(result.suggestions).toBeDefined();
      expect(result.suggestions.length).toBeGreaterThan(0);
      expect(result.calendar).toBeDefined();
      expect(result.calendar.length).toBe(result.suggestions.length);

      // Check for seasonal content
      const seasonalSuggestions = result.suggestions.filter(s => s.seasonalEvent);
      expect(seasonalSuggestions.length).toBeGreaterThan(0);

      // Check insights
      expect(result.insights.totalSuggestions).toBe(result.suggestions.length);
      expect(result.insights.seasonalEvents).toBeGreaterThan(0);
      expect(result.insights.contentBalance).toBeDefined();
      expect(result.insights.channelDistribution).toBeDefined();

      // Check recommendations
      expect(result.recommendations).toBeDefined();
      expect(Array.isArray(result.recommendations)).toBe(true);

      // Verify calendar items structure
      result.calendar.forEach(item => {
        expect(item.account_id).toBe('test-account');
        expect(item.user_id).toBe('ai-generated');
        expect(item.status).toBe('draft');
        expect(item.channels).toEqual(['instagram', 'facebook']);
        expect(item.predicted_engagement).toBeGreaterThan(0);
      });
    });

    it('should distribute content types evenly across the period', async () => {
      // Arrange
      const request: BatchCalendarContentRequest = {
        accountId: 'test-account',
        businessType: 'petshop',
        period: {
          start: new Date('2024-12-01'),
          end: new Date('2024-12-14') // 2 weeks
        },
        contentTypes: ['educativo', 'promocional'],
        channels: ['instagram'],
        frequency: 2 // 2 posts per week = 4 total posts
      };

      mockSeasonalIntelligenceService.getSeasonalSuggestions.mockResolvedValue({
        suggestions: [],
        insights: []
      });

      // Act
      const result = await contentGenerationService.generateBatchCalendarContent(request);

      // Assert
      expect(result.suggestions.length).toBe(4); // 2 weeks * 2 posts per week

      // Check content type distribution
      const educativoCount = result.suggestions.filter(s => s.contentType === 'educativo').length;
      const promocionalCount = result.suggestions.filter(s => s.contentType === 'promocional').length;

      expect(educativoCount).toBe(2);
      expect(promocionalCount).toBe(2);

      // Check insights content balance
      expect(result.insights.contentBalance.educativo).toBe(2);
      expect(result.insights.contentBalance.promocional).toBe(2);
    });
  });

  describe('generateSmartSuggestions', () => {
    it('should identify calendar gaps and suggest content', async () => {
      // Arrange
      const currentCalendar: CalendarItem[] = [
        {
          id: '1',
          account_id: 'test-account',
          user_id: 'user1',
          title: 'First Post',
          content_type: 'educativo',
          scheduled_for: new Date('2024-12-01T10:00:00Z'),
          timezone: 'America/Sao_Paulo',
          priority: 'medium',
          status: 'scheduled',
          channels: ['instagram'],
          tags: ['pets'],
          created_at: new Date(),
          updated_at: new Date()
        },
        {
          id: '2',
          account_id: 'test-account',
          user_id: 'user1',
          title: 'Second Post',
          content_type: 'promocional',
          scheduled_for: new Date('2024-12-10T14:00:00Z'), // 9-day gap
          timezone: 'America/Sao_Paulo',
          priority: 'high',
          status: 'scheduled',
          channels: ['facebook'],
          tags: ['promotion'],
          created_at: new Date(),
          updated_at: new Date()
        }
      ];

      const period = {
        start: new Date('2024-12-01'),
        end: new Date('2024-12-31')
      };

      const mockSeasonalSuggestions = {
        suggestions: [{
          name: 'Feriado de Dezembro',
          suggestedDate: new Date('2024-12-05'),
          reasoning: 'Oportunidade de conteúdo sazonal'
        }],
        insights: []
      };

      mockSeasonalIntelligenceService.getSeasonalSuggestions.mockResolvedValue(mockSeasonalSuggestions);

      // Act
      const result = await contentGenerationService.generateSmartSuggestions(
        'test-account',
        'veterinaria',
        currentCalendar,
        period
      );

      // Assert
      expect(result).toBeDefined();
      expect(result.length).toBeGreaterThan(0);

      // Should suggest content for the gap between Dec 1 and Dec 10
      const gapSuggestion = result.find(s => 
        s.suggestedDate > new Date('2024-12-01') && 
        s.suggestedDate < new Date('2024-12-10')
      );
      expect(gapSuggestion).toBeDefined();

      // Check priority ordering (high priority first)
      for (let i = 1; i < result.length; i++) {
        const current = result[i];
        const previous = result[i - 1];
        
        const priorityWeight = { urgent: 4, high: 3, medium: 2, low: 1 };
        const currentWeight = priorityWeight[current.priority];
        const previousWeight = priorityWeight[previous.priority];
        
        expect(previousWeight).toBeGreaterThanOrEqual(currentWeight);
      }
    });

    it('should handle empty calendar gracefully', async () => {
      // Arrange
      const currentCalendar: CalendarItem[] = [];
      const period = {
        start: new Date('2024-12-01'),
        end: new Date('2024-12-07')
      };

      mockSeasonalIntelligenceService.getSeasonalSuggestions.mockResolvedValue({
        suggestions: [],
        insights: []
      });

      // Act
      const result = await contentGenerationService.generateSmartSuggestions(
        'test-account',
        'petshop',
        currentCalendar,
        period
      );

      // Assert
      expect(result).toBeDefined();
      expect(Array.isArray(result)).toBe(true);
      // With empty calendar, no gaps to fill, but should not error
    });
  });

  describe('Business Type Context', () => {
    it('should generate appropriate content for veterinaria business', async () => {
      // Arrange
      const request: CalendarContentRequest = {
        accountId: 'vet-account',
        businessType: 'veterinaria',
        contentType: 'educativo',
        targetDate: new Date('2024-12-25'),
        channels: ['instagram']
      };

      mockSeasonalIntelligenceService.getSeasonalSuggestions.mockResolvedValue({
        suggestions: [],
        insights: []
      });

      // Act
      const result = await contentGenerationService.generateCalendarContent(request);

      // Assert
      expect(result.title).toMatch(/saúde|cuidado|médico|wellness|veterinária/i);
      expect(result.reasoning.brandVoiceAlignment).toContain('professional');
    });

    it('should generate appropriate content for petshop business', async () => {
      // Arrange
      const request: CalendarContentRequest = {
        accountId: 'shop-account',
        businessType: 'petshop',
        contentType: 'promocional',
        targetDate: new Date('2024-12-25'),
        channels: ['instagram']
      };

      mockSeasonalIntelligenceService.getSeasonalSuggestions.mockResolvedValue({
        suggestions: [],
        insights: []
      });

      // Act
      const result = await contentGenerationService.generateCalendarContent(request);

      // Assert
      expect(result.title).toMatch(/oferta|promoção|desconto|produto/i);
      expect(result.optimization.audienceAlignment).toBeGreaterThan(70);
    });
  });

  describe('Error Handling', () => {
    it('should handle seasonal intelligence service errors gracefully', async () => {
      // Arrange
      const request: CalendarContentRequest = {
        accountId: 'test-account',
        businessType: 'veterinaria',
        contentType: 'educativo',
        targetDate: new Date('2024-12-25'),
        channels: ['instagram']
      };

      mockSeasonalIntelligenceService.getSeasonalSuggestions.mockRejectedValue(
        new Error('Seasonal service unavailable')
      );

      // Act & Assert
      await expect(contentGenerationService.generateCalendarContent(request))
        .rejects.toThrow('Calendar content generation failed');
    });

    it('should handle timing optimization service errors gracefully', async () => {
      // Arrange
      const request: CalendarContentRequest = {
        accountId: 'test-account',
        businessType: 'veterinaria',
        contentType: 'educativo',
        targetDate: new Date('2024-12-25'),
        channels: ['instagram']
      };

      mockSeasonalIntelligenceService.getSeasonalSuggestions.mockResolvedValue({
        suggestions: [],
        insights: []
      });
      mockTimingOptimizationService.calculateOptimalTiming.mockRejectedValue(
        new Error('Timing service unavailable')
      );

      // Act & Assert
      await expect(contentGenerationService.generateCalendarContent(request))
        .rejects.toThrow('Calendar content generation failed');
    });
  });

  describe('Content Optimization', () => {
    it('should include proper hashtags for different business types', async () => {
      // Arrange
      const request: CalendarContentRequest = {
        accountId: 'test-account',
        businessType: 'adestramento',
        contentType: 'educativo',
        targetDate: new Date('2024-12-25'),
        channels: ['instagram'],
        preferences: {
          includeHashtags: true
        }
      };

      mockSeasonalIntelligenceService.getSeasonalSuggestions.mockResolvedValue({
        suggestions: [],
        insights: []
      });

      // Act
      const result = await contentGenerationService.generateCalendarContent(request);

      // Assert
      expect(result.content.hashtags).toBeDefined();
      expect(result.content.hashtags?.length).toBeGreaterThan(0);
      expect(result.content.hashtags).toContain('#pets');
      expect(result.content.hashtags).toContain('#cuidadoanimal');
    });

    it('should generate different media recommendations for different channels', async () => {
      // Arrange
      const request: CalendarContentRequest = {
        accountId: 'test-account',
        businessType: 'estetica',
        contentType: 'promocional',
        targetDate: new Date('2024-12-25'),
        channels: ['instagram', 'tiktok', 'facebook']
      };

      mockSeasonalIntelligenceService.getSeasonalSuggestions.mockResolvedValue({
        suggestions: [],
        insights: []
      });

      // Act
      const result = await contentGenerationService.generateCalendarContent(request);

      // Assert
      expect(result.content.mediaRecommendations).toBeDefined();
      expect(result.content.mediaRecommendations?.length).toBeGreaterThan(0);

      // Should have different types for different platforms
      const hasImage = result.content.mediaRecommendations?.some(m => m.type === 'image');
      const hasVideo = result.content.mediaRecommendations?.some(m => m.type === 'video');

      expect(hasImage).toBe(true);
      expect(hasVideo).toBe(true);

      // Check dimensions
      result.content.mediaRecommendations?.forEach(rec => {
        expect(rec.dimensions).toBeDefined();
        expect(rec.dimensions?.width).toBeGreaterThan(0);
        expect(rec.dimensions?.height).toBeGreaterThan(0);
        expect(rec.dimensions?.aspectRatio).toBeDefined();
      });
    });
  });
});