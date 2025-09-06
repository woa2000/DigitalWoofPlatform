import { describe, it, expect, beforeEach } from 'vitest';
import { TimingOptimizationService } from '../../server/services/TimingOptimizationService.js';
import { CalendarItem, ContentType, CalendarStatus, CalendarPriority } from '../../shared/types/calendar.js';

describe('TimingOptimizationService - Basic Tests', () => {
  let service: TimingOptimizationService;
  
  beforeEach(() => {
    service = new TimingOptimizationService();
  });

  describe('Service initialization', () => {
    it('should initialize service successfully', () => {
      expect(service).toBeInstanceOf(TimingOptimizationService);
    });

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

    it('should include benchmarks for all major content types', () => {
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

  describe('calculateOptimalTiming', () => {
    it('should return optimal timing results with all required properties', async () => {
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

    it('should return valid TimeSlot objects', async () => {
      const result = await service.calculateOptimalTiming(
        'account-123',
        'promocional',
        'facebook'
      );

      expect(result.recommended_times.length).toBeGreaterThan(0);
      
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

    it('should handle all content types', async () => {
      const contentTypes: ContentType[] = ['educativo', 'promocional', 'engajamento', 'recall', 'awareness'];
      
      for (const contentType of contentTypes) {
        const result = await service.calculateOptimalTiming(
          'account-123',
          contentType,
          'instagram'
        );
        
        expect(result.recommended_times.length).toBeGreaterThan(0);
        expect(result.confidence_score).toBeGreaterThan(0);
        expect(result.data_source).toBeDefined();
      }
    });

    it('should sort recommendations by engagement rate', async () => {
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
  });

  describe('getBestTimesForPeriod', () => {
    it('should return timing for default content types', async () => {
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
    it('should optimize timing for calendar item', async () => {
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
      
      // Should be in the same week (within 6 days)
      const daysDiff = Math.abs((optimizedDate.getTime() - calendarItem.scheduled_for.getTime()) / (1000 * 60 * 60 * 24));
      expect(daysDiff).toBeLessThanOrEqual(6);
      
      // Minutes and seconds should be reset to 0
      expect(optimizedDate.getMinutes()).toBe(0);
      expect(optimizedDate.getSeconds()).toBe(0);
    });

    it('should handle empty channels array', async () => {
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

      // Should still work with Instagram as default
      expect(optimizedDate).toBeInstanceOf(Date);
    });

    it('should handle day of week edge cases', async () => {
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

  describe('Edge cases and error handling', () => {
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
  });
});