import { CalendarItem, ContentType, BusinessType, OptimalTimingResult, TimeSlot } from '../../shared/types/calendar.js';

export interface TimingData {
  post_id: string;
  content_type: ContentType;
  channel: string;
  day_of_week: number; // 0=Sunday, 6=Saturday
  hour: number; // 0-23
  engagement_rate: number;
  reach: number;
  clicks: number;
  posted_at: Date;
}

export interface IndustryBenchmark {
  content_type: ContentType;
  channel: string;
  day_of_week: number;
  hour: number;
  avg_engagement: number;
  avg_reach: number;
  avg_clicks: number;
  confidence_score: number;
}

export class TimingOptimizationService {
  private industryBenchmarks: IndustryBenchmark[] = [];

  constructor() {
    this.loadIndustryBenchmarks();
  }

  /**
   * Calculate optimal timing for content based on historical data + industry benchmarks
   */
  async calculateOptimalTiming(
    accountId: string,
    contentType: ContentType,
    channel: string,
    targetDate?: Date
  ): Promise<OptimalTimingResult> {
    
    console.log(`[TimingOptimization] Calculating optimal timing for ${contentType} on ${channel}`);

    try {
      // 1. Get historical data for this account
      const historicalData = await this.getHistoricalData(accountId, contentType, channel);
      
      // 2. Fall back to industry benchmarks if insufficient data
      const benchmarkData = this.getIndustryBenchmarks(contentType, channel);
      
      // 3. Combine and weight the data
      const combinedData = this.combineDataSources(historicalData, benchmarkData);
      
      // 4. Calculate best time slots
      const optimalSlots = this.calculateTimeSlots(combinedData);
      
      // 5. Consider target date constraints if provided
      let finalSlots = optimalSlots;
      if (targetDate) {
        finalSlots = this.filterByDate(optimalSlots, targetDate);
      }
      
      // 6. Return top 3 recommendations
      const topSlots = finalSlots.slice(0, 3);
      const confidence = this.calculateConfidence(combinedData, historicalData.length);
      const dataSource = this.determineDataSource(historicalData.length, benchmarkData.length);
      
      return {
        recommended_times: topSlots,
        confidence_score: confidence,
        data_source: dataSource,
        sample_size: historicalData.length + benchmarkData.length
      };
      
    } catch (error) {
      console.error('[TimingOptimization] Error calculating optimal timing:', error);
      
      // Return safe defaults on error
      return this.getSafeDefaults(contentType, channel);
    }
  }

  /**
   * Get optimal timing for multiple content types over a period
   */
  async getBestTimesForPeriod(
    accountId: string,
    period: { start: Date; end: Date },
    contentTypes: ContentType[] = ['educativo', 'promocional', 'engajamento']
  ): Promise<Record<ContentType, OptimalTimingResult>> {
    
    const results: Record<string, OptimalTimingResult> = {};
    
    for (const contentType of contentTypes) {
      // Consider Instagram as primary channel for now
      const timing = await this.calculateOptimalTiming(
        accountId, 
        contentType, 
        'instagram'
      );
      
      results[contentType] = timing;
    }
    
    return results as Record<ContentType, OptimalTimingResult>;
  }

  /**
   * Optimize calendar item timing based on content type and historical performance
   */
  async optimizeCalendarItemTiming(
    calendarItem: CalendarItem,
    accountId: string
  ): Promise<Date> {
    
    const timing = await this.calculateOptimalTiming(
      accountId,
      calendarItem.content_type,
      calendarItem.channels[0] || 'instagram'
    );
    
    if (timing.recommended_times.length === 0) {
      return calendarItem.scheduled_for;
    }
    
    // Use the best recommended time
    const bestSlot = timing.recommended_times[0];
    const originalDate = calendarItem.scheduled_for;
    
    // Calculate the date offset to get to the desired day of week
    const currentDayOfWeek = originalDate.getDay();
    const targetDayOfWeek = bestSlot.day_of_week;
    const dayOffset = targetDayOfWeek - currentDayOfWeek;
    
    // Create optimized date with proper day and time
    const optimizedDate = new Date(originalDate);
    optimizedDate.setDate(originalDate.getDate() + dayOffset);
    optimizedDate.setHours(bestSlot.hour, 0, 0, 0);
    
    return optimizedDate;
  }

  /**
   * Simulate historical data - in production this would query the database
   */
  private async getHistoricalData(
    accountId: string, 
    contentType: ContentType, 
    channel: string
  ): Promise<TimingData[]> {
    
    // Mock historical data - in production this would be a database query
    // For now, return sample data to demonstrate the service
    const mockData: TimingData[] = [];
    
    // Generate some realistic mock data
    for (let i = 0; i < 20; i++) {
      const dayOfWeek = Math.floor(Math.random() * 7);
      const hour = Math.floor(Math.random() * 24);
      
      // Better engagement during business hours for educational content
      let baseEngagement = 0.03;
      if (contentType === 'educativo' && hour >= 9 && hour <= 17) {
        baseEngagement = 0.06;
      }
      
      // Better engagement in evenings for engagement content
      if (contentType === 'engajamento' && hour >= 18 && hour <= 22) {
        baseEngagement = 0.08;
      }
      
      // Promotional content works better on weekends
      if (contentType === 'promocional' && (dayOfWeek === 0 || dayOfWeek === 6)) {
        baseEngagement = 0.05;
      }
      
      mockData.push({
        post_id: `post-${i}`,
        content_type: contentType,
        channel: channel,
        day_of_week: dayOfWeek,
        hour: hour,
        engagement_rate: baseEngagement + (Math.random() * 0.02),
        reach: Math.floor(Math.random() * 10000) + 1000,
        clicks: Math.floor(Math.random() * 500) + 50,
        posted_at: new Date(Date.now() - Math.random() * 30 * 24 * 60 * 60 * 1000) // Last 30 days
      });
    }
    
    console.log(`[TimingOptimization] Generated ${mockData.length} historical data points for ${contentType}/${channel}`);
    return mockData;
  }

  /**
   * Load industry benchmarks for fallback when historical data is insufficient
   */
  private loadIndustryBenchmarks(): void {
    // Industry benchmarks for Brazilian pet market
    this.industryBenchmarks = [
      // Educational content - best during business hours
      { content_type: 'educativo', channel: 'instagram', day_of_week: 1, hour: 10, avg_engagement: 0.055, avg_reach: 8500, avg_clicks: 340, confidence_score: 0.8 },
      { content_type: 'educativo', channel: 'instagram', day_of_week: 2, hour: 14, avg_engagement: 0.052, avg_reach: 7800, avg_clicks: 312, confidence_score: 0.75 },
      { content_type: 'educativo', channel: 'instagram', day_of_week: 3, hour: 11, avg_engagement: 0.058, avg_reach: 9200, avg_clicks: 368, confidence_score: 0.82 },
      
      // Promotional content - best on weekends and evenings
      { content_type: 'promocional', channel: 'instagram', day_of_week: 0, hour: 19, avg_engagement: 0.048, avg_reach: 12000, avg_clicks: 600, confidence_score: 0.78 },
      { content_type: 'promocional', channel: 'instagram', day_of_week: 6, hour: 20, avg_engagement: 0.051, avg_reach: 13500, avg_clicks: 675, confidence_score: 0.8 },
      { content_type: 'promocional', channel: 'instagram', day_of_week: 5, hour: 18, avg_engagement: 0.046, avg_reach: 11000, avg_clicks: 550, confidence_score: 0.72 },
      
      // Engagement content - best in evenings when people are relaxed
      { content_type: 'engajamento', channel: 'instagram', day_of_week: 4, hour: 20, avg_engagement: 0.072, avg_reach: 6500, avg_clicks: 195, confidence_score: 0.85 },
      { content_type: 'engajamento', channel: 'instagram', day_of_week: 6, hour: 19, avg_engagement: 0.068, avg_reach: 7200, avg_clicks: 216, confidence_score: 0.83 },
      { content_type: 'engajamento', channel: 'instagram', day_of_week: 0, hour: 21, avg_engagement: 0.065, avg_reach: 6800, avg_clicks: 204, confidence_score: 0.8 },
      
      // Facebook benchmarks
      { content_type: 'educativo', channel: 'facebook', day_of_week: 2, hour: 15, avg_engagement: 0.035, avg_reach: 15000, avg_clicks: 525, confidence_score: 0.7 },
      { content_type: 'promocional', channel: 'facebook', day_of_week: 6, hour: 13, avg_engagement: 0.032, avg_reach: 18000, avg_clicks: 720, confidence_score: 0.75 },
      { content_type: 'engajamento', channel: 'facebook', day_of_week: 0, hour: 16, avg_engagement: 0.045, avg_reach: 12000, avg_clicks: 360, confidence_score: 0.72 }
    ];
    
    console.log(`[TimingOptimization] Loaded ${this.industryBenchmarks.length} industry benchmarks`);
  }

  /**
   * Get relevant industry benchmarks for content type and channel
   */
  private getIndustryBenchmarks(contentType: ContentType, channel: string): IndustryBenchmark[] {
    return this.industryBenchmarks.filter(
      benchmark => 
        benchmark.content_type === contentType && 
        benchmark.channel === channel
    );
  }

  /**
   * Combine historical data with industry benchmarks, weighting by data quality
   */
  private combineDataSources(
    historicalData: TimingData[], 
    benchmarkData: IndustryBenchmark[]
  ): TimingData[] {
    
    const combinedData: TimingData[] = [...historicalData];
    
    // If we have insufficient historical data, supplement with benchmarks
    if (historicalData.length < 10) {
      const weight = Math.max(0.3, (10 - historicalData.length) / 10);
      
      benchmarkData.forEach(benchmark => {
        combinedData.push({
          post_id: `benchmark-${benchmark.content_type}-${benchmark.day_of_week}-${benchmark.hour}`,
          content_type: benchmark.content_type,
          channel: benchmark.channel,
          day_of_week: benchmark.day_of_week,
          hour: benchmark.hour,
          engagement_rate: benchmark.avg_engagement * weight,
          reach: benchmark.avg_reach * weight,
          clicks: benchmark.avg_clicks * weight,
          posted_at: new Date() // Benchmark data is current
        });
      });
    }
    
    return combinedData;
  }

  /**
   * Calculate optimal time slots from combined data
   */
  private calculateTimeSlots(data: TimingData[]): TimeSlot[] {
    // Group by day of week and hour
    const grouped = this.groupByDayAndHour(data);
    
    // Calculate engagement rates for each slot
    const slots: TimeSlot[] = Object.entries(grouped).map(([key, posts]) => {
      const [dayOfWeek, hour] = key.split('-').map(Number);
      
      const avgEngagement = posts.reduce((sum, p) => sum + p.engagement_rate, 0) / posts.length;
      const avgReach = Math.round(posts.reduce((sum, p) => sum + p.reach, 0) / posts.length);
      const avgClicks = Math.round(posts.reduce((sum, p) => sum + p.clicks, 0) / posts.length);
      
      return {
        day_of_week: dayOfWeek,
        hour: hour,
        avg_engagement: avgEngagement,
        avg_reach: avgReach,
        avg_clicks: avgClicks,
        sample_size: posts.length,
        confidence: this.calculateSlotConfidence(posts.length)
      };
    });
    
    // Sort by engagement rate (primary) and reach (secondary)
    return slots.sort((a, b) => {
      if (Math.abs(a.avg_engagement - b.avg_engagement) < 0.005) {
        return b.avg_reach - a.avg_reach;
      }
      return b.avg_engagement - a.avg_engagement;
    });
  }

  /**
   * Group timing data by day of week and hour
   */
  private groupByDayAndHour(data: TimingData[]): Record<string, TimingData[]> {
    const grouped: Record<string, TimingData[]> = {};
    
    data.forEach(post => {
      const key = `${post.day_of_week}-${post.hour}`;
      if (!grouped[key]) {
        grouped[key] = [];
      }
      grouped[key].push(post);
    });
    
    return grouped;
  }

  /**
   * Filter time slots by target date constraints
   */
  private filterByDate(slots: TimeSlot[], targetDate: Date): TimeSlot[] {
    const targetDayOfWeek = targetDate.getDay();
    
    // Prefer slots on the same day of week, but include nearby days as alternatives
    const sameDay = slots.filter(slot => slot.day_of_week === targetDayOfWeek);
    const nearbyDays = slots.filter(slot => 
      Math.abs(slot.day_of_week - targetDayOfWeek) <= 1 ||
      Math.abs(slot.day_of_week - targetDayOfWeek) >= 6 // Handle week wrap-around
    );
    
    return sameDay.length > 0 ? sameDay : nearbyDays;
  }

  /**
   * Calculate confidence score based on data quality and quantity
   */
  private calculateConfidence(combinedData: TimingData[], historicalCount: number): number {
    const totalSamples = combinedData.length;
    const historicalRatio = historicalCount / totalSamples;
    
    // Higher confidence with more historical data
    let confidence = Math.min(0.9, totalSamples / 50); // Max 0.9 confidence
    
    // Boost confidence if we have historical data
    if (historicalRatio > 0.5) {
      confidence = Math.min(0.9, confidence + 0.2);
    }
    
    // Reduce confidence if we have very little data
    if (totalSamples < 5) {
      confidence = Math.max(0.3, confidence * 0.5);
    }
    
    return Math.round(confidence * 100) / 100; // Round to 2 decimals
  }

  /**
   * Calculate confidence score for individual time slot
   */
  private calculateSlotConfidence(sampleSize: number): number {
    if (sampleSize >= 10) return 0.9;
    if (sampleSize >= 5) return 0.7;
    if (sampleSize >= 3) return 0.5;
    return 0.3;
  }

  /**
   * Determine primary data source for transparency
   */
  private determineDataSource(
    historicalCount: number, 
    benchmarkCount: number
  ): 'historical' | 'benchmark' | 'hybrid' {
    if (historicalCount > 10) return 'historical';
    if (historicalCount === 0) return 'benchmark';
    return 'hybrid';
  }

  /**
   * Return safe default timing when calculation fails
   */
  private getSafeDefaults(contentType: ContentType, channel: string): OptimalTimingResult {
    // Safe defaults based on general best practices
    const defaults: Record<ContentType, TimeSlot[]> = {
      'educativo': [
        { day_of_week: 2, hour: 14, avg_engagement: 0.04, avg_reach: 5000, avg_clicks: 200, sample_size: 0, confidence: 0.3 }
      ],
      'promocional': [
        { day_of_week: 6, hour: 19, avg_engagement: 0.035, avg_reach: 8000, avg_clicks: 400, sample_size: 0, confidence: 0.3 }
      ],
      'engajamento': [
        { day_of_week: 0, hour: 20, avg_engagement: 0.055, avg_reach: 4000, avg_clicks: 160, sample_size: 0, confidence: 0.3 }
      ],
      'recall': [
        { day_of_week: 1, hour: 9, avg_engagement: 0.03, avg_reach: 6000, avg_clicks: 180, sample_size: 0, confidence: 0.3 }
      ],
      'awareness': [
        { day_of_week: 3, hour: 12, avg_engagement: 0.045, avg_reach: 7000, avg_clicks: 280, sample_size: 0, confidence: 0.3 }
      ]
    };
    
    return {
      recommended_times: defaults[contentType] || defaults['educativo'],
      confidence_score: 0.3,
      data_source: 'benchmark',
      sample_size: 0
    };
  }
}