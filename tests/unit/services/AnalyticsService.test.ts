import { describe, it, expect, beforeEach, vi } from 'vitest';
import { AnalyticsService } from '../../../server/services/AnalyticsService';
import { CalendarRepository } from '../../../server/repositories/CalendarRepository';
import { CalendarItem, ContentType, CalendarPriority, CalendarStatus } from '../../../shared/types/calendar';

// Mock CalendarRepository
vi.mock('../../../server/repositories/CalendarRepository');

describe('AnalyticsService', () => {
  let analyticsService: AnalyticsService;
  let mockCalendarRepository: Partial<CalendarRepository>;

  beforeEach(() => {
    mockCalendarRepository = {
      getByDateRange: vi.fn(),
      search: vi.fn(),
    };

    analyticsService = new AnalyticsService(mockCalendarRepository as CalendarRepository);
  });

  const createMockCalendarItem = (overrides: Partial<CalendarItem> = {}): CalendarItem => ({
    id: '1',
    account_id: 'account-1',
    user_id: 'user-1',
    title: 'Test Post',
    description: 'Test description',
    content_type: 'educativo' as ContentType,
    scheduled_for: new Date('2024-01-15'),
    timezone: 'America/Sao_Paulo',
    priority: 'high' as CalendarPriority,
    status: 'published' as CalendarStatus,
    channels: ['instagram', 'facebook'],
    tags: ['pet', 'care'],
    created_at: new Date('2024-01-01'),
    updated_at: new Date('2024-01-01'),
    ...overrides
  });

  describe('generateAnalyticsSummary', () => {
    it('should generate comprehensive analytics summary', async () => {
      const mockItems = [
        createMockCalendarItem({
          id: '1',
          content_type: 'educativo' as ContentType,
          priority: 'high' as CalendarPriority,
          status: 'published' as CalendarStatus,
          channels: ['instagram'],
          scheduled_for: new Date('2024-01-15')
        }),
        createMockCalendarItem({
          id: '2',
          content_type: 'promocional' as ContentType,
          priority: 'medium' as CalendarPriority,
          status: 'draft' as CalendarStatus,
          channels: ['website'],
          scheduled_for: new Date('2024-01-20')
        }),
        createMockCalendarItem({
          id: '3',
          content_type: 'educativo' as ContentType,
          priority: 'low' as CalendarPriority,
          status: 'published' as CalendarStatus,
          channels: ['facebook'],
          scheduled_for: new Date('2024-02-10')
        })
      ];

      (mockCalendarRepository.getByDateRange as any)?.mockResolvedValue(mockItems);

      const result = await analyticsService.generateAnalyticsSummary(
        'account-1',
        {
          start: new Date('2024-01-01'),
          end: new Date('2024-02-28')
        }
      );

      expect(result).toHaveProperty('period');
      expect(result).toHaveProperty('performance');
      expect(result).toHaveProperty('content_types');
      expect(result).toHaveProperty('channels');
      expect(result).toHaveProperty('priorities');
      expect(result).toHaveProperty('seasonal_trends');
      expect(result).toHaveProperty('engagement_insights');
      expect(result).toHaveProperty('health_metrics');
      expect(result).toHaveProperty('generated_at');

      // Verify performance metrics
      expect(result.performance.total_posts).toBe(3);
      expect(result.performance.published_posts).toBe(2);
      expect(result.performance.draft_posts).toBe(1);
      expect(result.performance.scheduled_posts).toBe(0);

      // Verify content type analytics array structure
      expect(Array.isArray(result.content_types)).toBe(true);
      expect(result.content_types.length).toBeGreaterThan(0);

      // Verify channel analytics array structure
      expect(Array.isArray(result.channels)).toBe(true);
      expect(result.channels.length).toBeGreaterThan(0);
    });

    it('should handle empty dataset gracefully', async () => {
      (mockCalendarRepository.getByDateRange as any)?.mockResolvedValue([]);

      const result = await analyticsService.generateAnalyticsSummary(
        'account-1',
        {
          start: new Date('2024-01-01'),
          end: new Date('2024-02-28')
        }
      );

      expect(result.performance.total_posts).toBe(0);
      expect(result.performance.published_posts).toBe(0);
      expect(result.content_types).toEqual([]);
      expect(result.channels).toEqual([]);
    });
  });

  describe('calculatePerformanceMetrics', () => {
    it('should calculate accurate performance metrics', () => {
      const items = [
        createMockCalendarItem({ status: 'published' as CalendarStatus }),
        createMockCalendarItem({ status: 'published' as CalendarStatus }),
        createMockCalendarItem({ status: 'draft' as CalendarStatus }),
        createMockCalendarItem({ status: 'scheduled' as CalendarStatus })
      ];

      const metrics = (analyticsService as any).calculatePerformanceMetrics(items);

      expect(metrics.completion_rate).toBe(50); // 2 published out of 4 total
      expect(metrics.on_time_rate).toBeGreaterThanOrEqual(0);
      expect(metrics.avg_engagement_prediction).toBeGreaterThanOrEqual(0);
      expect(metrics.total_posts).toBe(4);
      expect(metrics.published_posts).toBe(2);
      expect(metrics.draft_posts).toBe(1);
      expect(metrics.scheduled_posts).toBe(1);
    });

    it('should handle edge case with no items', () => {
      const metrics = (analyticsService as any).calculatePerformanceMetrics([]);

      expect(metrics.completion_rate).toBe(0);
      expect(metrics.on_time_rate).toBe(0);
      expect(metrics.avg_engagement_prediction).toBe(0);
      expect(metrics.total_posts).toBe(0);
      expect(metrics.published_posts).toBe(0);
    });
  });

  describe('analyzeContentTypes', () => {
    it('should analyze content type distribution and performance', () => {
      const items = [
        createMockCalendarItem({ 
          content_type: 'educativo' as ContentType,
          status: 'published' as CalendarStatus 
        }),
        createMockCalendarItem({ 
          content_type: 'educativo' as ContentType,
          status: 'draft' as CalendarStatus 
        }),
        createMockCalendarItem({ 
          content_type: 'promocional' as ContentType,
          status: 'published' as CalendarStatus 
        }),
        createMockCalendarItem({ 
          content_type: 'recall' as ContentType,
          status: 'published' as CalendarStatus 
        })
      ];

      const analytics = (analyticsService as any).analyzeContentTypes(items);

      expect(Array.isArray(analytics)).toBe(true);
      expect(analytics.length).toBeGreaterThan(0);

      // Find educativo content type
      const educativoAnalytics = analytics.find((a: any) => a.content_type === 'educativo');
      expect(educativoAnalytics).toBeDefined();
      expect(educativoAnalytics.total_posts).toBe(2);
      expect(educativoAnalytics.published_posts).toBe(1);
      expect(educativoAnalytics.performance_score).toBeGreaterThanOrEqual(0);
    });

    it('should handle single content type', () => {
      const items = [
        createMockCalendarItem({ content_type: 'educativo' as ContentType }),
        createMockCalendarItem({ content_type: 'educativo' as ContentType })
      ];

      const analytics = (analyticsService as any).analyzeContentTypes(items);
      expect(analytics.length).toBe(1);
      expect(analytics[0].content_type).toBe('educativo');
      expect(analytics[0].total_posts).toBe(2);
    });
  });

  describe('analyzeChannels', () => {
    it('should analyze channel distribution and performance', () => {
      const items = [
        createMockCalendarItem({ 
          channels: ['instagram', 'facebook'],
          status: 'published' as CalendarStatus 
        }),
        createMockCalendarItem({ 
          channels: ['instagram'],
          status: 'draft' as CalendarStatus 
        }),
        createMockCalendarItem({ 
          channels: ['linkedin'],
          status: 'published' as CalendarStatus 
        })
      ];

      const analytics = (analyticsService as any).analyzeChannels(items);

      expect(Array.isArray(analytics)).toBe(true);
      expect(analytics.length).toBeGreaterThan(0);

      // Find instagram channel
      const instagramAnalytics = analytics.find((a: any) => a.channel === 'instagram');
      expect(instagramAnalytics).toBeDefined();
      expect(instagramAnalytics.total_posts).toBe(2);
      expect(instagramAnalytics.published_posts).toBe(1);
      expect(Array.isArray(instagramAnalytics.optimal_posting_times)).toBe(true);
    });

    it('should handle single channel', () => {
      const items = [
        createMockCalendarItem({ channels: ['instagram'] }),
        createMockCalendarItem({ channels: ['instagram'] })
      ];

      const analytics = (analyticsService as any).analyzeChannels(items);
      expect(analytics.length).toBe(1);
      expect(analytics[0].channel).toBe('instagram');
      expect(analytics[0].total_posts).toBe(2);
    });
  });

  describe('analyzePriorities', () => {
    it('should analyze priority distribution', () => {
      const items = [
        createMockCalendarItem({ priority: 'high' as CalendarPriority }),
        createMockCalendarItem({ priority: 'high' as CalendarPriority }),
        createMockCalendarItem({ priority: 'medium' as CalendarPriority }),
        createMockCalendarItem({ priority: 'low' as CalendarPriority })
      ];

      const analytics = (analyticsService as any).analyzePriorities(items);

      expect(Array.isArray(analytics)).toBe(true);
      expect(analytics.length).toBeGreaterThan(0);

      // Find high priority analytics
      const highPriorityAnalytics = analytics.find((a: any) => a.priority === 'high');
      expect(highPriorityAnalytics).toBeDefined();
      expect(highPriorityAnalytics.total_posts).toBe(2);
      expect(highPriorityAnalytics.completion_rate).toBeGreaterThanOrEqual(0);
    });
  });

  describe('analyzeCampaigns', () => {
    it('should analyze campaign performance', () => {
      const items = [
        createMockCalendarItem({ 
          campaign_id: 'campaign-1',
          status: 'published' as CalendarStatus 
        }),
        createMockCalendarItem({ 
          campaign_id: 'campaign-1',
          status: 'draft' as CalendarStatus 
        }),
        createMockCalendarItem({ 
          campaign_id: 'campaign-2',
          status: 'published' as CalendarStatus 
        }),
        createMockCalendarItem({ 
          campaign_id: undefined,
          status: 'published' as CalendarStatus 
        })
      ];

      const analytics = (analyticsService as any).analyzeCampaigns(items);

      expect(Array.isArray(analytics)).toBe(true);
      expect(analytics.length).toBe(2); // Two campaigns

      // Find campaign-1
      const campaign1Analytics = analytics.find((a: any) => a.campaign_id === 'campaign-1');
      expect(campaign1Analytics).toBeDefined();
      expect(campaign1Analytics.total_posts).toBe(2);
      expect(campaign1Analytics.published_posts).toBe(1);
      expect(campaign1Analytics.completion_rate).toBe(50);
    });
  });

  describe('analyzeSeasonalTrends', () => {
    it('should analyze trends over time', () => {
      const items = [
        createMockCalendarItem({ scheduled_for: new Date('2024-01-15') }),
        createMockCalendarItem({ scheduled_for: new Date('2024-01-20') }),
        createMockCalendarItem({ scheduled_for: new Date('2024-02-10') }),
        createMockCalendarItem({ scheduled_for: new Date('2024-03-05') })
      ];

      const trends = (analyticsService as any).analyzeSeasonalTrends(
        items,
        new Date('2024-01-01'),
        new Date('2024-03-31')
      );

      expect(trends).toHaveProperty('period');
      expect(trends).toHaveProperty('trends');
      expect(trends).toHaveProperty('insights');
      expect(Array.isArray(trends.trends)).toBe(true);
      expect(Array.isArray(trends.insights)).toBe(true);
    });
  });

  describe('calculateEngagementInsights', () => {
    it('should calculate engagement insights', () => {
      const items = [
        createMockCalendarItem({ 
          content_type: 'educativo' as ContentType,
          channels: ['instagram']
        }),
        createMockCalendarItem({ 
          content_type: 'promocional' as ContentType,
          channels: ['website']
        }),
        createMockCalendarItem({ 
          content_type: 'recall' as ContentType,
          channels: ['email']
        })
      ];

      const insights = (analyticsService as any).calculateEngagementInsights(items);

      expect(insights).toHaveProperty('best_performing_content_types');
      expect(insights).toHaveProperty('worst_performing_content_types');
      expect(insights).toHaveProperty('best_performing_channels');
      expect(insights).toHaveProperty('optimal_posting_frequency');
      expect(insights).toHaveProperty('seasonal_recommendations');

      expect(Array.isArray(insights.best_performing_content_types)).toBe(true);
      expect(Array.isArray(insights.best_performing_channels)).toBe(true);
      expect(Array.isArray(insights.seasonal_recommendations)).toBe(true);
    });
  });

  describe('assessCalendarHealth', () => {
    it('should assess calendar health metrics', () => {
      const items = [
        createMockCalendarItem({ 
          status: 'published' as CalendarStatus,
          scheduled_for: new Date('2024-01-15')
        }),
        createMockCalendarItem({ 
          status: 'draft' as CalendarStatus,
          scheduled_for: new Date('2024-01-20')
        }),
        createMockCalendarItem({ 
          status: 'scheduled' as CalendarStatus,
          scheduled_for: new Date('2024-01-25')
        })
      ];

      const health = (analyticsService as any).assessCalendarHealth(items);

      expect(health).toHaveProperty('content_balance_score');
      expect(health).toHaveProperty('posting_consistency_score');
      expect(health).toHaveProperty('seasonal_alignment_score');
      expect(health).toHaveProperty('overall_health_score');
      expect(health).toHaveProperty('recommendations');

      expect(health.content_balance_score).toBeGreaterThanOrEqual(0);
      expect(health.content_balance_score).toBeLessThanOrEqual(100);
      expect(health.overall_health_score).toBeGreaterThanOrEqual(0);
      expect(health.overall_health_score).toBeLessThanOrEqual(100);
      expect(Array.isArray(health.recommendations)).toBe(true);
    });

    it('should provide appropriate recommendations for poor health', () => {
      const items = [
        createMockCalendarItem({ status: 'draft' as CalendarStatus }),
        createMockCalendarItem({ status: 'draft' as CalendarStatus }),
        createMockCalendarItem({ status: 'draft' as CalendarStatus })
      ];

      const health = (analyticsService as any).assessCalendarHealth(items);

      expect(health.recommendations.length).toBeGreaterThan(0);
      expect(health.overall_health_score).toBeLessThan(100);
    });
  });

  describe('error handling', () => {
    it('should handle repository errors gracefully', async () => {
      (mockCalendarRepository.getByDateRange as any)?.mockRejectedValue(new Error('Database error'));

      await expect(
        analyticsService.generateAnalyticsSummary(
          'account-1',
          {
            start: new Date('2024-01-01'),
            end: new Date('2024-02-28')
          }
        )
      ).rejects.toThrow('Database error');
    });

    it('should handle invalid date ranges', async () => {
      const startDate = new Date('2024-02-01');
      const endDate = new Date('2024-01-01'); // End before start

      (mockCalendarRepository.getByDateRange as any)?.mockResolvedValue([]);

      const result = await analyticsService.generateAnalyticsSummary(
        'account-1',
        {
          start: startDate,
          end: endDate
        }
      );

      expect(result.performance.total_posts).toBe(0);
    });
  });
});