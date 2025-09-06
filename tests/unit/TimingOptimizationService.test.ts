import { describe, it, expect, beforeEach, vi } from 'vitest';
import { TimingOptimizationService } from '../../server/services/TimingOptimizationService.js';
import { CalendarItem, ContentType, CalendarStatus, CalendarPriority } from '../../shared/types/calendar.js';

describe('TimingOptimizationService', () => {
  let service: TimingOptimizationService;
  
  beforeEach(() => {
    service = new TimingOptimizationService();
  });

  describe('calculateOptimalTiming', () => {
    it('should return optimal timing results with confidence score', async () => {
      const result = await service.calculateOptimalTiming(
        'account-123',
        'educativo',
        'instagram'
      );

      expect(result).toHaveProperty('recommended_times');
      expect(result).toHaveProperty('confidence_score');
      expect(result).toHaveProperty('data_source');
      expect(result).toHaveProperty('sample_size');
      
      expect(result.recommended_times).toBeInstanceOf(Array);
      expect(result.confidence_score).toBeGreaterThanOrEqual(0);
      expect(result.confidence_score).toBeLessThanOrEqual(1);
      expect(['historical', 'benchmark', 'hybrid']).toContain(result.data_source);
    });

    it('should return recommendations sorted by engagement rate', async () => {
      const result = await service.calculateOptimalTiming(
        'account-123',
        'engajamento',
        'instagram'
      );

      const times = result.recommended_times;
      expect(times.length).toBeGreaterThan(0);
      
      // Verify sorted order (descending by engagement)
      for (let i = 1; i < times.length; i++) {
        expect(times[i-1].avg_engagement).toBeGreaterThanOrEqual(times[i].avg_engagement);
      }
    });

    it('should include all required fields in TimeSlot objects', async () => {
      const result = await service.calculateOptimalTiming(
        'account-123',
        'promocional',
        'facebook'
      );

      const timeSlot = result.recommended_times[0];
      expect(timeSlot).toHaveProperty('day_of_week');
      expect(timeSlot).toHaveProperty('hour');
      expect(timeSlot).toHaveProperty('avg_engagement');
      expect(timeSlot).toHaveProperty('avg_reach');
      expect(timeSlot).toHaveProperty('avg_clicks');
      expect(timeSlot).toHaveProperty('sample_size');
      expect(timeSlot).toHaveProperty('confidence');

      expect(timeSlot.day_of_week).toBeGreaterThanOrEqual(0);
      expect(timeSlot.day_of_week).toBeLessThanOrEqual(6);
      expect(timeSlot.hour).toBeGreaterThanOrEqual(0);
      expect(timeSlot.hour).toBeLessThanOrEqual(23);
    });

    it('should handle different content types appropriately', async () => {
      const contentTypes: ContentType[] = ['educativo', 'promocional', 'engajamento', 'recall', 'awareness'];
      
      for (const contentType of contentTypes) {
        const result = await service.calculateOptimalTiming(
          'account-123',
          contentType,
          'instagram'
        );
        
        expect(result.recommended_times.length).toBeGreaterThan(0);
        expect(result.confidence_score).toBeGreaterThan(0);
      }
    });
  });

  describe('getBestTimesForPeriod', () => {
    it('should return timing for multiple content types', async () => {
      const period = {
        start: new Date('2024-01-01'),
        end: new Date('2024-01-31')
      };

      const result = await service.getBestTimesForPeriod('account-123', period);

      expect(result).toHaveProperty('educativo');
      expect(result).toHaveProperty('promocional');
      expect(result).toHaveProperty('engajamento');
      
      expect(result.educativo.recommended_times.length).toBeGreaterThan(0);
      expect(result.promocional.recommended_times.length).toBeGreaterThan(0);
      expect(result.engajamento.recommended_times.length).toBeGreaterThan(0);
    });

    it('should handle custom content types list', async () => {
      const period = {
        start: new Date('2024-01-01'),
        end: new Date('2024-01-31')
      };

      const result = await service.getBestTimesForPeriod(
        'account-123', 
        period, 
        ['educativo', 'recall']
      );

      expect(result).toHaveProperty('educativo');
      expect(result).toHaveProperty('recall');
      expect(result).not.toHaveProperty('promocional');
      expect(result).not.toHaveProperty('engajamento');
    });
  });

  describe('optimizeCalendarItemTiming', () => {
    it('should optimize timing for calendar item and return new date', async () => {
      const calendarItem: CalendarItem = {
        id: 'cal-123',
        account_id: 'account-123',
        user_id: 'user-123',
        title: 'Test Educational Post',
        content_type: 'educativo',
        channels: ['instagram'],
        scheduled_for: new Date('2024-01-15T10:00:00Z'),
        timezone: 'America/Sao_Paulo',
        status: 'draft' as CalendarStatus,
        priority: 'medium' as CalendarPriority,
        created_at: new Date(),
        updated_at: new Date()
      };

      const optimizedDate = await service.optimizeCalendarItemTiming(calendarItem, 'account-123');

      expect(optimizedDate).toBeInstanceOf(Date);
      expect(optimizedDate.getTime()).not.toBe(calendarItem.scheduled_for.getTime());
    });

    it('should handle calendar item without channels gracefully', async () => {
      const calendarItem: CalendarItem = {
        id: 'cal-123',
        account_id: 'account-123',
        user_id: 'user-123',
        title: 'Test Post',
        content_type: 'educativo',
        channels: [],
        scheduled_for: new Date('2024-01-15T10:00:00Z'),
        timezone: 'America/Sao_Paulo',
        status: 'draft' as CalendarStatus,
        priority: 'medium' as CalendarPriority,
        created_at: new Date(),
        updated_at: new Date()
      };

      const optimizedDate = await service.optimizeCalendarItemTiming(calendarItem, 'account-123');

      // Should still work and use Instagram as default
      expect(optimizedDate).toBeInstanceOf(Date);
    });

    it('should preserve date components when optimizing timing', async () => {
      const originalDate = new Date('2024-01-15T10:00:00Z');
      const calendarItem: CalendarItem = {
        id: 'cal-123',
        account_id: 'account-123',
        user_id: 'user-123',
        title: 'Test Post',
        content_type: 'promocional',
        channels: ['facebook'],
        scheduled_for: originalDate,
        timezone: 'America/Sao_Paulo',
        status: 'draft' as CalendarStatus,
        priority: 'medium' as CalendarPriority,
        created_at: new Date(),
        updated_at: new Date()
      };

      const optimizedDate = await service.optimizeCalendarItemTiming(calendarItem, 'account-123');

      // Should be in the same week (within 7 days)
      const daysDiff = Math.abs((optimizedDate.getTime() - originalDate.getTime()) / (1000 * 60 * 60 * 24));
      expect(daysDiff).toBeLessThanOrEqual(6);
      
      // Minutes and seconds should be reset to 0
      expect(optimizedDate.getMinutes()).toBe(0);
      expect(optimizedDate.getSeconds()).toBe(0);
    });
  });

  describe('Safe defaults handling', () => {
    it('should return safe defaults when service fails', async () => {
      // Mock the service to throw error
      const serviceSpy = vi.spyOn(service as any, 'getHistoricalData');
      serviceSpy.mockRejectedValue(new Error('Database error'));

      const result = await service.calculateOptimalTiming(
        'account-123',
        'educativo',
        'instagram'
      );

      expect(result.recommended_times.length).toBeGreaterThan(0);
      expect(result.confidence_score).toBe(0.3); // Safe default confidence
      expect(result.data_source).toBe('benchmark');
      expect(result.sample_size).toBe(0);

      serviceSpy.mockRestore();
    });

    it('should handle all content types in safe defaults', async () => {
      const contentTypes: ContentType[] = ['educativo', 'promocional', 'engajamento', 'recall', 'awareness'];
      
      // Mock the service to force safe defaults
      const serviceSpy = vi.spyOn(service as any, 'getHistoricalData');
      serviceSpy.mockRejectedValue(new Error('Test error'));

      for (const contentType of contentTypes) {
        const result = await service.calculateOptimalTiming(
          'account-123',
          contentType,
          'instagram'
        );
        
        expect(result.recommended_times.length).toBe(1);
        expect(result.confidence_score).toBe(0.3);
        expect(result.data_source).toBe('benchmark');
      }

      serviceSpy.mockRestore();
    });
  });

  describe('Data source determination', () => {
    it('should use historical data when available', async () => {
      // Mock historical data to return many results
      const serviceSpy = vi.spyOn(service as any, 'getHistoricalData');
      serviceSpy.mockResolvedValue(Array(15).fill({
        post_id: 'post-1',
        content_type: 'educativo',
        channel: 'instagram',
        day_of_week: 1,
        hour: 10,
        engagement_rate: 0.05,
        reach: 5000,
        clicks: 200,
        posted_at: new Date()
      }));

      const result = await service.calculateOptimalTiming(
        'account-123',
        'educativo',
        'instagram'
      );

      expect(result.data_source).toBe('historical');
      expect(result.confidence_score).toBeGreaterThan(0.5);

      serviceSpy.mockRestore();
    });

    it('should use hybrid approach with limited historical data', async () => {
      // Mock historical data to return few results
      const serviceSpy = vi.spyOn(service as any, 'getHistoricalData');
      serviceSpy.mockResolvedValue(Array(5).fill({
        post_id: 'post-1',
        content_type: 'educativo',
        channel: 'instagram',
        day_of_week: 1,
        hour: 10,
        engagement_rate: 0.05,
        reach: 5000,
        clicks: 200,
        posted_at: new Date()
      }));

      const result = await service.calculateOptimalTiming(
        'account-123',
        'educativo',
        'instagram'
      );

      expect(result.data_source).toBe('hybrid');

      serviceSpy.mockRestore();
    });

    it('should use benchmark data when no historical data exists', async () => {
      // Mock historical data to return empty array
      const serviceSpy = vi.spyOn(service as any, 'getHistoricalData');
      serviceSpy.mockResolvedValue([]);

      const result = await service.calculateOptimalTiming(
        'account-123',
        'educativo',
        'instagram'
      );

      expect(result.data_source).toBe('benchmark');

      serviceSpy.mockRestore();
    });
  });

  describe('Industry benchmarks', () => {
    it('should have industry benchmarks loaded', () => {
      const benchmarks = (service as any).industryBenchmarks;
      
      expect(benchmarks).toBeInstanceOf(Array);
      expect(benchmarks.length).toBeGreaterThan(0);
      
      // Check structure of first benchmark
      const benchmark = benchmarks[0];
      expect(benchmark).toHaveProperty('content_type');
      expect(benchmark).toHaveProperty('channel');
      expect(benchmark).toHaveProperty('day_of_week');
      expect(benchmark).toHaveProperty('hour');
      expect(benchmark).toHaveProperty('avg_engagement');
      expect(benchmark).toHaveProperty('confidence_score');
    });

    it('should include benchmarks for all content types', () => {
      const benchmarks = (service as any).industryBenchmarks;
      const contentTypes = [...new Set(benchmarks.map((b: any) => b.content_type))];
      
      expect(contentTypes).toContain('educativo');
      expect(contentTypes).toContain('promocional');
      expect(contentTypes).toContain('engajamento');
    });

    it('should include benchmarks for different channels', () => {
      const benchmarks = (service as any).industryBenchmarks;
      const channels = [...new Set(benchmarks.map((b: any) => b.channel))];
      
      expect(channels).toContain('instagram');
      expect(channels).toContain('facebook');
    });
  });

  describe('Edge cases', () => {
    it('should handle invalid account IDs gracefully', async () => {
      const result = await service.calculateOptimalTiming(
        '',
        'educativo',
        'instagram'
      );

      expect(result).toHaveProperty('recommended_times');
      expect(result.recommended_times.length).toBeGreaterThan(0);
    });

    it('should handle future target dates', async () => {
      const futureDate = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000); // 7 days from now
      
      const result = await service.calculateOptimalTiming(
        'account-123',
        'educativo',
        'instagram',
        futureDate
      );

      expect(result.recommended_times.length).toBeGreaterThan(0);
    });

    it('should handle day of week edge cases correctly', async () => {
      const calendarItem: CalendarItem = {
        id: 'cal-123',
        account_id: 'account-123',
        user_id: 'user-123',
        title: 'Test Post',
        content_type: 'educativo',
        channels: ['instagram'],
        scheduled_for: new Date('2024-01-07T10:00:00Z'), // Sunday
        timezone: 'America/Sao_Paulo',
        status: 'draft' as CalendarStatus,
        priority: 'medium' as CalendarPriority,
        created_at: new Date(),
        updated_at: new Date()
      };

      const optimizedDate = await service.optimizeCalendarItemTiming(calendarItem, 'account-123');

      // Should handle Sunday (day 0) correctly
      expect(optimizedDate).toBeInstanceOf(Date);
      expect(optimizedDate.getDay()).toBeGreaterThanOrEqual(0);
      expect(optimizedDate.getDay()).toBeLessThanOrEqual(6);
    });
  });
});