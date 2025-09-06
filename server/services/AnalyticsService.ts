import { CalendarRepository, CalendarFilters } from '../repositories/CalendarRepository.js';
import { CalendarItem, CalendarStatus, ContentType, CalendarPriority, DateRange } from '../../shared/types/calendar.js';

export interface AnalyticsFilters extends CalendarFilters {
  include_predictions?: boolean;
  include_comparisons?: boolean;
}

export interface PerformanceMetrics {
  total_posts: number;
  published_posts: number;
  scheduled_posts: number;
  draft_posts: number;
  failed_posts: number;
  cancelled_posts: number;
  completion_rate: number;
  on_time_rate: number;
  avg_engagement_prediction: number;
  avg_reach_prediction: number;
}

export interface ContentTypeAnalytics {
  content_type: ContentType;
  total_posts: number;
  published_posts: number;
  avg_engagement_prediction: number;
  avg_reach_prediction: number;
  performance_score: number;
  trend: 'up' | 'down' | 'stable';
}

export interface ChannelAnalytics {
  channel: string;
  total_posts: number;
  published_posts: number;
  avg_engagement_prediction: number;
  avg_reach_prediction: number;
  performance_score: number;
  optimal_posting_times: Array<{
    day_of_week: number;
    hour: number;
    score: number;
  }>;
}

export interface SeasonalTrends {
  period: string; // 'week' | 'month' | 'quarter'
  trends: Array<{
    date: Date;
    total_posts: number;
    published_posts: number;
    avg_engagement_prediction: number;
    performance_index: number;
  }>;
  insights: string[];
}

export interface CampaignPerformance {
  campaign_id: string;
  campaign_name?: string;
  total_posts: number;
  published_posts: number;
  completion_rate: number;
  avg_engagement_prediction: number;
  avg_reach_prediction: number;
  roi_estimate: number;
  status: 'active' | 'completed' | 'paused';
  performance_vs_target: number; // percentage
}

export interface PriorityAnalytics {
  priority: CalendarPriority;
  total_posts: number;
  published_posts: number;
  completion_rate: number;
  avg_engagement_prediction: number;
  time_to_publish_avg: number; // hours
  on_time_rate: number;
}

export interface EngagementInsights {
  best_performing_content_types: ContentType[];
  worst_performing_content_types: ContentType[];
  best_performing_channels: string[];
  optimal_posting_frequency: {
    daily: number;
    weekly: number;
    monthly: number;
  };
  seasonal_recommendations: Array<{
    event: string;
    suggested_content_types: ContentType[];
    timing_advice: string;
    expected_lift: number;
  }>;
}

export interface CalendarHealthMetrics {
  content_balance_score: number; // 0-100
  posting_consistency_score: number; // 0-100
  seasonal_alignment_score: number; // 0-100
  overall_health_score: number; // 0-100
  recommendations: Array<{
    type: 'content_balance' | 'consistency' | 'seasonal_alignment' | 'optimization';
    priority: 'high' | 'medium' | 'low';
    message: string;
    action_required: boolean;
  }>;
}

export interface AnalyticsComparison {
  current_period: PerformanceMetrics;
  previous_period: PerformanceMetrics;
  growth_rates: {
    total_posts: number;
    published_posts: number;
    completion_rate: number;
    engagement_prediction: number;
    reach_prediction: number;
  };
  insights: string[];
}

export interface AnalyticsSummary {
  period: DateRange;
  performance: PerformanceMetrics;
  content_types: ContentTypeAnalytics[];
  channels: ChannelAnalytics[];
  priorities: PriorityAnalytics[];
  campaigns?: CampaignPerformance[];
  seasonal_trends: SeasonalTrends;
  engagement_insights: EngagementInsights;
  health_metrics: CalendarHealthMetrics;
  comparison?: AnalyticsComparison;
  generated_at: Date;
}

/**
 * Analytics Service - Comprehensive analytics and insights for Calendar Editorial System
 * 
 * This service provides detailed analytics, performance metrics, and actionable insights
 * for content planning and optimization. It analyzes calendar data to generate reports
 * on engagement, content performance, seasonal trends, and strategic recommendations.
 */
export class AnalyticsService {
  constructor(private calendarRepository: CalendarRepository) {
    console.log('[AnalyticsService] Service initialized');
  }

  /**
   * Generate comprehensive analytics summary for specified period
   */
  async generateAnalyticsSummary(
    accountId: string,
    dateRange: DateRange,
    filters: AnalyticsFilters = {}
  ): Promise<AnalyticsSummary> {
    console.log(`[AnalyticsService] Generating analytics summary for account ${accountId}`);
    console.log(`[AnalyticsService] Date range: ${dateRange.start.toISOString()} to ${dateRange.end.toISOString()}`);

    try {
      // Get all calendar items for the period
      const items = await this.calendarRepository.getByDateRange(
        accountId,
        dateRange.start,
        dateRange.end,
        filters
      );

      console.log(`[AnalyticsService] Analyzing ${items.length} calendar items`);

      // Generate all analytics components
      const [
        performance,
        contentTypes,
        channels,
        priorities,
        campaigns,
        seasonalTrends,
        engagementInsights,
        healthMetrics,
        comparison
      ] = await Promise.all([
        this.calculatePerformanceMetrics(items),
        this.analyzeContentTypes(items),
        this.analyzeChannels(items),
        this.analyzePriorities(items),
        this.analyzeCampaigns(accountId, items),
        this.analyzeSeasonalTrends(accountId, dateRange),
        this.generateEngagementInsights(items),
        this.calculateHealthMetrics(items),
        filters.include_comparisons ? this.generateComparison(accountId, dateRange) : undefined
      ]);

      const summary: AnalyticsSummary = {
        period: dateRange,
        performance,
        content_types: contentTypes,
        channels,
        priorities,
        campaigns,
        seasonal_trends: seasonalTrends,
        engagement_insights: engagementInsights,
        health_metrics: healthMetrics,
        comparison,
        generated_at: new Date()
      };

      console.log('[AnalyticsService] Analytics summary generated successfully');
      return summary;
    } catch (error) {
      console.error('[AnalyticsService] Error generating analytics summary:', error);
      throw new Error(`Failed to generate analytics summary: ${error}`);
    }
  }

  /**
   * Calculate overall performance metrics
   */
  private async calculatePerformanceMetrics(items: CalendarItem[]): Promise<PerformanceMetrics> {
    console.log('[AnalyticsService] Calculating performance metrics');

    try {
      const totalPosts = items.length;
      const publishedPosts = items.filter(item => item.status === 'published').length;
      const scheduledPosts = items.filter(item => item.status === 'scheduled').length;
      const draftPosts = items.filter(item => item.status === 'draft').length;
      const failedPosts = items.filter(item => item.status === 'failed').length;
      const cancelledPosts = items.filter(item => item.status === 'cancelled').length;

      const completionRate = totalPosts > 0 ? (publishedPosts / totalPosts) * 100 : 0;

      // Calculate on-time rate (posts published within 1 hour of scheduled time)
      const onTimePosts = items.filter(item => {
        if (item.status !== 'published' || !item.published_at) return false;
        const timeDiff = Math.abs(item.published_at.getTime() - item.scheduled_for.getTime());
        return timeDiff <= 60 * 60 * 1000; // 1 hour tolerance
      }).length;

      const onTimeRate = publishedPosts > 0 ? (onTimePosts / publishedPosts) * 100 : 0;

      // Calculate average predictions
      const itemsWithEngagement = items.filter(item => item.predicted_engagement);
      const avgEngagementPrediction = itemsWithEngagement.length > 0
        ? itemsWithEngagement.reduce((sum, item) => sum + (item.predicted_engagement || 0), 0) / itemsWithEngagement.length
        : 0;

      const itemsWithReach = items.filter(item => item.predicted_reach);
      const avgReachPrediction = itemsWithReach.length > 0
        ? itemsWithReach.reduce((sum, item) => sum + (item.predicted_reach || 0), 0) / itemsWithReach.length
        : 0;

      const metrics: PerformanceMetrics = {
        total_posts: totalPosts,
        published_posts: publishedPosts,
        scheduled_posts: scheduledPosts,
        draft_posts: draftPosts,
        failed_posts: failedPosts,
        cancelled_posts: cancelledPosts,
        completion_rate: Math.round(completionRate * 100) / 100,
        on_time_rate: Math.round(onTimeRate * 100) / 100,
        avg_engagement_prediction: Math.round(avgEngagementPrediction * 10000) / 10000,
        avg_reach_prediction: Math.round(avgReachPrediction)
      };

      console.log('[AnalyticsService] Performance metrics calculated:', metrics);
      return metrics;
    } catch (error) {
      console.error('[AnalyticsService] Error calculating performance metrics:', error);
      throw error;
    }
  }

  /**
   * Analyze performance by content type
   */
  private async analyzeContentTypes(items: CalendarItem[]): Promise<ContentTypeAnalytics[]> {
    console.log('[AnalyticsService] Analyzing content types');

    try {
      const contentTypeMap = new Map<ContentType, CalendarItem[]>();

      // Group items by content type
      items.forEach(item => {
        if (!contentTypeMap.has(item.content_type)) {
          contentTypeMap.set(item.content_type, []);
        }
        contentTypeMap.get(item.content_type)!.push(item);
      });

      const analytics: ContentTypeAnalytics[] = [];

      for (const [contentType, typeItems] of Array.from(contentTypeMap.entries())) {
        const totalPosts = typeItems.length;
        const publishedPosts = typeItems.filter((item: CalendarItem) => item.status === 'published').length;

        const itemsWithEngagement = typeItems.filter((item: CalendarItem) => item.predicted_engagement);
        const avgEngagementPrediction = itemsWithEngagement.length > 0
          ? itemsWithEngagement.reduce((sum: number, item: CalendarItem) => sum + (item.predicted_engagement || 0), 0) / itemsWithEngagement.length
          : 0;

        const itemsWithReach = typeItems.filter((item: CalendarItem) => item.predicted_reach);
        const avgReachPrediction = itemsWithReach.length > 0
          ? itemsWithReach.reduce((sum: number, item: CalendarItem) => sum + (item.predicted_reach || 0), 0) / itemsWithReach.length
          : 0;

        // Calculate performance score based on engagement and completion rate
        const completionRate = totalPosts > 0 ? publishedPosts / totalPosts : 0;
        const performanceScore = (avgEngagementPrediction * 0.6 + completionRate * 0.4) * 100;

        // Determine trend (simplified - in real implementation would compare with historical data)
        const trend = this.calculateTrend(performanceScore);

        analytics.push({
          content_type: contentType,
          total_posts: totalPosts,
          published_posts: publishedPosts,
          avg_engagement_prediction: Math.round(avgEngagementPrediction * 10000) / 10000,
          avg_reach_prediction: Math.round(avgReachPrediction),
          performance_score: Math.round(performanceScore * 100) / 100,
          trend
        });
      }

      // Sort by performance score descending
      analytics.sort((a, b) => b.performance_score - a.performance_score);

      console.log('[AnalyticsService] Content type analysis completed:', analytics.length, 'types');
      return analytics;
    } catch (error) {
      console.error('[AnalyticsService] Error analyzing content types:', error);
      throw error;
    }
  }

  /**
   * Analyze performance by channel
   */
  private async analyzeChannels(items: CalendarItem[]): Promise<ChannelAnalytics[]> {
    console.log('[AnalyticsService] Analyzing channels');

    try {
      const channelMap = new Map<string, CalendarItem[]>();

      // Group items by channel (items can have multiple channels)
      items.forEach(item => {
        item.channels.forEach(channel => {
          if (!channelMap.has(channel)) {
            channelMap.set(channel, []);
          }
          channelMap.get(channel)!.push(item);
        });
      });

      const analytics: ChannelAnalytics[] = [];

      for (const [channel, channelItems] of Array.from(channelMap.entries())) {
        const totalPosts = channelItems.length;
        const publishedPosts = channelItems.filter((item: CalendarItem) => item.status === 'published').length;

        const itemsWithEngagement = channelItems.filter((item: CalendarItem) => item.predicted_engagement);
        const avgEngagementPrediction = itemsWithEngagement.length > 0
          ? itemsWithEngagement.reduce((sum: number, item: CalendarItem) => sum + (item.predicted_engagement || 0), 0) / itemsWithEngagement.length
          : 0;

        const itemsWithReach = channelItems.filter((item: CalendarItem) => item.predicted_reach);
        const avgReachPrediction = itemsWithReach.length > 0
          ? itemsWithReach.reduce((sum: number, item: CalendarItem) => sum + (item.predicted_reach || 0), 0) / itemsWithReach.length
          : 0;

        const completionRate = totalPosts > 0 ? publishedPosts / totalPosts : 0;
        const performanceScore = (avgEngagementPrediction * 0.6 + completionRate * 0.4) * 100;

        // Generate optimal posting times for this channel
        const optimalTimes = this.calculateOptimalPostingTimes(channelItems);

        analytics.push({
          channel,
          total_posts: totalPosts,
          published_posts: publishedPosts,
          avg_engagement_prediction: Math.round(avgEngagementPrediction * 10000) / 10000,
          avg_reach_prediction: Math.round(avgReachPrediction),
          performance_score: Math.round(performanceScore * 100) / 100,
          optimal_posting_times: optimalTimes
        });
      }

      // Sort by performance score descending
      analytics.sort((a, b) => b.performance_score - a.performance_score);

      console.log('[AnalyticsService] Channel analysis completed:', analytics.length, 'channels');
      return analytics;
    } catch (error) {
      console.error('[AnalyticsService] Error analyzing channels:', error);
      throw error;
    }
  }

  /**
   * Analyze performance by priority level
   */
  private async analyzePriorities(items: CalendarItem[]): Promise<PriorityAnalytics[]> {
    console.log('[AnalyticsService] Analyzing priorities');

    try {
      const priorityMap = new Map<CalendarPriority, CalendarItem[]>();

      // Group items by priority
      items.forEach((item: CalendarItem) => {
        if (!priorityMap.has(item.priority)) {
          priorityMap.set(item.priority, []);
        }
        priorityMap.get(item.priority)!.push(item);
      });

      const analytics: PriorityAnalytics[] = [];

      for (const [priority, priorityItems] of Array.from(priorityMap.entries())) {
        const totalPosts = priorityItems.length;
        const publishedPosts = priorityItems.filter((item: CalendarItem) => item.status === 'published').length;
        const completionRate = totalPosts > 0 ? (publishedPosts / totalPosts) * 100 : 0;

        const itemsWithEngagement = priorityItems.filter((item: CalendarItem) => item.predicted_engagement);
        const avgEngagementPrediction = itemsWithEngagement.length > 0
          ? itemsWithEngagement.reduce((sum: number, item: CalendarItem) => sum + (item.predicted_engagement || 0), 0) / itemsWithEngagement.length
          : 0;

        // Calculate average time to publish
        const publishedItems = priorityItems.filter((item: CalendarItem) => item.status === 'published' && item.published_at);
        const timeToPublishAvg = publishedItems.length > 0
          ? publishedItems.reduce((sum: number, item: CalendarItem) => {
              const timeDiff = (item.published_at!.getTime() - item.created_at.getTime()) / (1000 * 60 * 60); // hours
              return sum + timeDiff;
            }, 0) / publishedItems.length
          : 0;

        // Calculate on-time rate
        const onTimePosts = publishedItems.filter((item: CalendarItem) => {
          const timeDiff = Math.abs(item.published_at!.getTime() - item.scheduled_for.getTime());
          return timeDiff <= 60 * 60 * 1000; // 1 hour tolerance
        }).length;

        const onTimeRate = publishedPosts > 0 ? (onTimePosts / publishedPosts) * 100 : 0;

        analytics.push({
          priority,
          total_posts: totalPosts,
          published_posts: publishedPosts,
          completion_rate: Math.round(completionRate * 100) / 100,
          avg_engagement_prediction: Math.round(avgEngagementPrediction * 10000) / 10000,
          time_to_publish_avg: Math.round(timeToPublishAvg * 100) / 100,
          on_time_rate: Math.round(onTimeRate * 100) / 100
        });
      }

      // Sort by priority order: urgent, high, medium, low
      const priorityOrder: CalendarPriority[] = ['urgent', 'high', 'medium', 'low'];
      analytics.sort((a, b) => priorityOrder.indexOf(a.priority) - priorityOrder.indexOf(b.priority));

      console.log('[AnalyticsService] Priority analysis completed:', analytics.length, 'priorities');
      return analytics;
    } catch (error) {
      console.error('[AnalyticsService] Error analyzing priorities:', error);
      throw error;
    }
  }

  /**
   * Analyze campaign performance
   */
  private async analyzeCampaigns(accountId: string, items: CalendarItem[]): Promise<CampaignPerformance[]> {
    console.log('[AnalyticsService] Analyzing campaigns');

    try {
      const campaignMap = new Map<string, CalendarItem[]>();

      // Group items by campaign
      items.forEach((item: CalendarItem) => {
        if (item.campaign_id) {
          if (!campaignMap.has(item.campaign_id)) {
            campaignMap.set(item.campaign_id, []);
          }
          campaignMap.get(item.campaign_id)!.push(item);
        }
      });

      const analytics: CampaignPerformance[] = [];

      for (const [campaignId, campaignItems] of Array.from(campaignMap.entries())) {
        const totalPosts = campaignItems.length;
        const publishedPosts = campaignItems.filter((item: CalendarItem) => item.status === 'published').length;
        const completionRate = totalPosts > 0 ? (publishedPosts / totalPosts) * 100 : 0;

        const itemsWithEngagement = campaignItems.filter((item: CalendarItem) => item.predicted_engagement);
        const avgEngagementPrediction = itemsWithEngagement.length > 0
          ? itemsWithEngagement.reduce((sum: number, item: CalendarItem) => sum + (item.predicted_engagement || 0), 0) / itemsWithEngagement.length
          : 0;

        const itemsWithReach = campaignItems.filter((item: CalendarItem) => item.predicted_reach);
        const avgReachPrediction = itemsWithReach.length > 0
          ? itemsWithReach.reduce((sum: number, item: CalendarItem) => sum + (item.predicted_reach || 0), 0) / itemsWithReach.length
          : 0;

        // Estimate ROI (simplified calculation)
        const roiEstimate = this.calculateROIEstimate(avgEngagementPrediction, avgReachPrediction, totalPosts);

        // Determine campaign status
        const now = new Date();
        const futureItems = campaignItems.filter((item: CalendarItem) => item.scheduled_for > now);
        const status: 'active' | 'completed' | 'paused' = futureItems.length > 0 ? 'active' : 'completed';

        // Performance vs target (simplified - would use campaign objectives in real implementation)
        const performanceVsTarget = Math.min(completionRate, 100);

        analytics.push({
          campaign_id: campaignId,
          campaign_name: `Campanha ${campaignId.slice(-6)}`, // Simplified name
          total_posts: totalPosts,
          published_posts: publishedPosts,
          completion_rate: Math.round(completionRate * 100) / 100,
          avg_engagement_prediction: Math.round(avgEngagementPrediction * 10000) / 10000,
          avg_reach_prediction: Math.round(avgReachPrediction),
          roi_estimate: Math.round(roiEstimate * 100) / 100,
          status,
          performance_vs_target: Math.round(performanceVsTarget * 100) / 100
        });
      }

      // Sort by ROI estimate descending
      analytics.sort((a, b) => b.roi_estimate - a.roi_estimate);

      console.log('[AnalyticsService] Campaign analysis completed:', analytics.length, 'campaigns');
      return analytics;
    } catch (error) {
      console.error('[AnalyticsService] Error analyzing campaigns:', error);
      throw error;
    }
  }

  /**
   * Analyze seasonal trends
   */
  private async analyzeSeasonalTrends(accountId: string, dateRange: DateRange): Promise<SeasonalTrends> {
    console.log('[AnalyticsService] Analyzing seasonal trends');

    try {
      // For now, return weekly trends within the date range
      const weeklyTrends = await this.calculateWeeklyTrends(accountId, dateRange);

      const insights = this.generateSeasonalInsights(weeklyTrends);

      const trends: SeasonalTrends = {
        period: 'week',
        trends: weeklyTrends,
        insights
      };

      console.log('[AnalyticsService] Seasonal trends analysis completed');
      return trends;
    } catch (error) {
      console.error('[AnalyticsService] Error analyzing seasonal trends:', error);
      throw error;
    }
  }

  /**
   * Generate engagement insights and recommendations
   */
  private async generateEngagementInsights(items: CalendarItem[]): Promise<EngagementInsights> {
    console.log('[AnalyticsService] Generating engagement insights');

    try {
      // Analyze content type performance
      const contentTypeScores = new Map<ContentType, number>();
      
      items.forEach((item: CalendarItem) => {
        if (item.predicted_engagement) {
          const currentScore = contentTypeScores.get(item.content_type) || 0;
          contentTypeScores.set(item.content_type, currentScore + item.predicted_engagement);
        }
      });

      // Get best and worst performing content types
      const sortedContentTypes = Array.from(contentTypeScores.entries())
        .sort((a, b) => b[1] - a[1]);

      const bestPerforming = sortedContentTypes.slice(0, 2).map(([type]) => type);
      const worstPerforming = sortedContentTypes.slice(-2).map(([type]) => type);

      // Analyze channel performance
      const channelScores = new Map<string, number>();
      
      items.forEach((item: CalendarItem) => {
        if (item.predicted_engagement) {
          item.channels.forEach(channel => {
            const currentScore = channelScores.get(channel) || 0;
            channelScores.set(channel, currentScore + item.predicted_engagement!);
          });
        }
      });

      const bestChannels = Array.from(channelScores.entries())
        .sort((a, b) => b[1] - a[1])
        .slice(0, 3)
        .map(([channel]) => channel);

      // Calculate optimal posting frequency
      const totalDays = Math.ceil((items[items.length - 1]?.scheduled_for.getTime() - items[0]?.scheduled_for.getTime()) / (1000 * 60 * 60 * 24)) || 30;
      const optimalFrequency = {
        daily: Math.round((items.length / totalDays) * 100) / 100,
        weekly: Math.round((items.length / (totalDays / 7)) * 100) / 100,
        monthly: Math.round((items.length / (totalDays / 30)) * 100) / 100
      };

      // Generate seasonal recommendations (mock data)
      const seasonalRecommendations = [
        {
          event: 'Verão Pet',
          suggested_content_types: ['educativo' as ContentType, 'awareness' as ContentType],
          timing_advice: 'Poste dicas de cuidados no verão pela manhã (8h-10h)',
          expected_lift: 15
        },
        {
          event: 'Dia do Animal',
          suggested_content_types: ['engajamento' as ContentType, 'recall' as ContentType],
          timing_advice: 'Campanha de 3 dias com posts emotivos',
          expected_lift: 25
        }
      ];

      const insights: EngagementInsights = {
        best_performing_content_types: bestPerforming,
        worst_performing_content_types: worstPerforming,
        best_performing_channels: bestChannels,
        optimal_posting_frequency: optimalFrequency,
        seasonal_recommendations: seasonalRecommendations
      };

      console.log('[AnalyticsService] Engagement insights generated');
      return insights;
    } catch (error) {
      console.error('[AnalyticsService] Error generating engagement insights:', error);
      throw error;
    }
  }

  /**
   * Calculate calendar health metrics
   */
  private async calculateHealthMetrics(items: CalendarItem[]): Promise<CalendarHealthMetrics> {
    console.log('[AnalyticsService] Calculating health metrics');

    try {
      // Content balance score (variety of content types)
      const contentTypes = new Set(items.map(item => item.content_type));
      const contentBalanceScore = Math.min((contentTypes.size / 5) * 100, 100); // 5 is max content types

      // Posting consistency score (regular posting pattern)
      const consistencyScore = this.calculatePostingConsistency(items);

      // Seasonal alignment score (using seasonal events and timing)
      const seasonalScore = this.calculateSeasonalAlignment(items);

      // Overall health score (weighted average)
      const overallHealthScore = (
        contentBalanceScore * 0.3 +
        consistencyScore * 0.4 +
        seasonalScore * 0.3
      );

      // Generate recommendations
      const recommendations = this.generateHealthRecommendations(
        contentBalanceScore,
        consistencyScore,
        seasonalScore
      );

      const healthMetrics: CalendarHealthMetrics = {
        content_balance_score: Math.round(contentBalanceScore * 100) / 100,
        posting_consistency_score: Math.round(consistencyScore * 100) / 100,
        seasonal_alignment_score: Math.round(seasonalScore * 100) / 100,
        overall_health_score: Math.round(overallHealthScore * 100) / 100,
        recommendations
      };

      console.log('[AnalyticsService] Health metrics calculated:', healthMetrics.overall_health_score);
      return healthMetrics;
    } catch (error) {
      console.error('[AnalyticsService] Error calculating health metrics:', error);
      throw error;
    }
  }

  /**
   * Generate comparison with previous period
   */
  private async generateComparison(accountId: string, dateRange: DateRange): Promise<AnalyticsComparison> {
    console.log('[AnalyticsService] Generating period comparison');

    try {
      // Calculate previous period
      const periodLength = dateRange.end.getTime() - dateRange.start.getTime();
      const previousStart = new Date(dateRange.start.getTime() - periodLength);
      const previousEnd = new Date(dateRange.end.getTime() - periodLength);

      // Get items for both periods
      const currentItems = await this.calendarRepository.getByDateRange(
        accountId,
        dateRange.start,
        dateRange.end
      );

      const previousItems = await this.calendarRepository.getByDateRange(
        accountId,
        previousStart,
        previousEnd
      );

      // Calculate metrics for both periods
      const currentMetrics = await this.calculatePerformanceMetrics(currentItems);
      const previousMetrics = await this.calculatePerformanceMetrics(previousItems);

      // Calculate growth rates
      const growthRates = {
        total_posts: this.calculateGrowthRate(previousMetrics.total_posts, currentMetrics.total_posts),
        published_posts: this.calculateGrowthRate(previousMetrics.published_posts, currentMetrics.published_posts),
        completion_rate: this.calculateGrowthRate(previousMetrics.completion_rate, currentMetrics.completion_rate),
        engagement_prediction: this.calculateGrowthRate(previousMetrics.avg_engagement_prediction, currentMetrics.avg_engagement_prediction),
        reach_prediction: this.calculateGrowthRate(previousMetrics.avg_reach_prediction, currentMetrics.avg_reach_prediction)
      };

      // Generate insights
      const insights = this.generateComparisonInsights(growthRates);

      const comparison: AnalyticsComparison = {
        current_period: currentMetrics,
        previous_period: previousMetrics,
        growth_rates: growthRates,
        insights
      };

      console.log('[AnalyticsService] Period comparison generated');
      return comparison;
    } catch (error) {
      console.error('[AnalyticsService] Error generating comparison:', error);
      throw error;
    }
  }

  // Helper methods

  private calculateTrend(score: number): 'up' | 'down' | 'stable' {
    // Simplified trend calculation - in real implementation would compare with historical data
    if (score > 70) return 'up';
    if (score < 40) return 'down';
    return 'stable';
  }

  private calculateOptimalPostingTimes(items: CalendarItem[]): Array<{ day_of_week: number; hour: number; score: number }> {
    const timeMap = new Map<string, { count: number; engagementSum: number }>();

    items.forEach(item => {
      if (item.predicted_engagement) {
        const dayOfWeek = item.scheduled_for.getDay();
        const hour = item.scheduled_for.getHours();
        const key = `${dayOfWeek}-${hour}`;

        const current = timeMap.get(key) || { count: 0, engagementSum: 0 };
        timeMap.set(key, {
          count: current.count + 1,
          engagementSum: current.engagementSum + item.predicted_engagement
        });
      }
    });

    return Array.from(timeMap.entries())
      .map(([key, data]) => {
        const [dayOfWeek, hour] = key.split('-').map(Number);
        const avgEngagement = data.engagementSum / data.count;
        return {
          day_of_week: dayOfWeek,
          hour,
          score: Math.round(avgEngagement * 10000) / 10000
        };
      })
      .sort((a, b) => b.score - a.score)
      .slice(0, 5); // Top 5 optimal times
  }

  private calculateROIEstimate(engagement: number, reach: number, posts: number): number {
    // Simplified ROI calculation - in real implementation would use actual cost and revenue data
    const estimatedValue = (engagement * reach * posts) / 1000;
    const estimatedCost = posts * 50; // Assume $50 per post
    return estimatedCost > 0 ? (estimatedValue / estimatedCost) : 0;
  }

  private async calculateWeeklyTrends(accountId: string, dateRange: DateRange): Promise<Array<{
    date: Date;
    total_posts: number;
    published_posts: number;
    avg_engagement_prediction: number;
    performance_index: number;
  }>> {
    const trends = [];
    const weekMs = 7 * 24 * 60 * 60 * 1000;
    
    for (let current = dateRange.start; current < dateRange.end; current = new Date(current.getTime() + weekMs)) {
      const weekEnd = new Date(Math.min(current.getTime() + weekMs, dateRange.end.getTime()));
      
      const weekItems = await this.calendarRepository.getByDateRange(accountId, current, weekEnd);
      
      const totalPosts = weekItems.length;
      const publishedPosts = weekItems.filter(item => item.status === 'published').length;
      
      const itemsWithEngagement = weekItems.filter(item => item.predicted_engagement);
      const avgEngagement = itemsWithEngagement.length > 0
        ? itemsWithEngagement.reduce((sum, item) => sum + (item.predicted_engagement || 0), 0) / itemsWithEngagement.length
        : 0;

      const completionRate = totalPosts > 0 ? publishedPosts / totalPosts : 0;
      const performanceIndex = (avgEngagement * 0.6 + completionRate * 0.4) * 100;

      trends.push({
        date: current,
        total_posts: totalPosts,
        published_posts: publishedPosts,
        avg_engagement_prediction: Math.round(avgEngagement * 10000) / 10000,
        performance_index: Math.round(performanceIndex * 100) / 100
      });
    }

    return trends;
  }

  private generateSeasonalInsights(trends: Array<any>): string[] {
    const insights = [];

    // Analyze trends and generate insights
    if (trends.length > 1) {
      const lastWeek = trends[trends.length - 1];
      const previousWeek = trends[trends.length - 2];

      if (lastWeek.performance_index > previousWeek.performance_index) {
        insights.push('Performance melhorando nas últimas semanas');
      }

      if (lastWeek.total_posts < previousWeek.total_posts) {
        insights.push('Frequência de posts diminuiu recentemente');
      }
    }

    // Add seasonal-specific insights
    const currentMonth = new Date().getMonth();
    if (currentMonth >= 11 || currentMonth <= 2) { // Summer months in Brazil
      insights.push('Período de verão - oportunidade para conteúdo de cuidados com calor');
    }

    return insights;
  }

  private calculatePostingConsistency(items: CalendarItem[]): number {
    if (items.length < 2) return 100;

    // Calculate variance in posting intervals
    const intervals = [];
    for (let i = 1; i < items.length; i++) {
      const interval = items[i].scheduled_for.getTime() - items[i-1].scheduled_for.getTime();
      intervals.push(interval / (1000 * 60 * 60 * 24)); // Convert to days
    }

    const meanInterval = intervals.reduce((sum, interval) => sum + interval, 0) / intervals.length;
    const variance = intervals.reduce((sum, interval) => sum + Math.pow(interval - meanInterval, 2), 0) / intervals.length;
    const standardDeviation = Math.sqrt(variance);

    // Lower standard deviation = higher consistency score
    const consistencyScore = Math.max(0, 100 - (standardDeviation * 10));
    return Math.min(consistencyScore, 100);
  }

  private calculateSeasonalAlignment(items: CalendarItem[]): number {
    // Simplified seasonal alignment calculation
    // In real implementation, would check against seasonal events database
    
    const currentMonth = new Date().getMonth();
    let alignmentScore = 50; // Base score

    // Check if there are educational posts during summer months
    if (currentMonth >= 11 || currentMonth <= 2) {
      const educationalPosts = items.filter(item => item.content_type === 'educativo').length;
      if (educationalPosts > 0) {
        alignmentScore += 25;
      }
    }

    // Check if there are promotional posts for special dates
    const promotionalPosts = items.filter(item => item.content_type === 'promocional').length;
    if (promotionalPosts > 0) {
      alignmentScore += 25;
    }

    return Math.min(alignmentScore, 100);
  }

  private generateHealthRecommendations(
    contentScore: number,
    consistencyScore: number,
    seasonalScore: number
  ): Array<{
    type: 'content_balance' | 'consistency' | 'seasonal_alignment' | 'optimization';
    priority: 'high' | 'medium' | 'low';
    message: string;
    action_required: boolean;
  }> {
    const recommendations = [];

    if (contentScore < 60) {
      recommendations.push({
        type: 'content_balance' as const,
        priority: 'high' as const,
        message: 'Diversifique os tipos de conteúdo para melhor engajamento',
        action_required: true
      });
    }

    if (consistencyScore < 70) {
      recommendations.push({
        type: 'consistency' as const,
        priority: 'medium' as const,
        message: 'Mantenha uma frequência mais regular de postagens',
        action_required: true
      });
    }

    if (seasonalScore < 50) {
      recommendations.push({
        type: 'seasonal_alignment' as const,
        priority: 'medium' as const,
        message: 'Aproveite melhor os eventos sazonais do mercado pet',
        action_required: false
      });
    }

    if (contentScore > 80 && consistencyScore > 80 && seasonalScore > 80) {
      recommendations.push({
        type: 'optimization' as const,
        priority: 'low' as const,
        message: 'Calendário está otimizado! Continue o excelente trabalho',
        action_required: false
      });
    }

    return recommendations;
  }

  private calculateGrowthRate(previous: number, current: number): number {
    if (previous === 0) return current > 0 ? 100 : 0;
    return Math.round(((current - previous) / previous) * 10000) / 100;
  }

  private generateComparisonInsights(growthRates: any): string[] {
    const insights = [];

    if (growthRates.total_posts > 10) {
      insights.push(`Aumento de ${growthRates.total_posts}% no volume de posts`);
    } else if (growthRates.total_posts < -10) {
      insights.push(`Redução de ${Math.abs(growthRates.total_posts)}% no volume de posts`);
    }

    if (growthRates.completion_rate > 5) {
      insights.push('Taxa de conclusão melhorou significativamente');
    } else if (growthRates.completion_rate < -5) {
      insights.push('Taxa de conclusão precisa de atenção');
    }

    if (growthRates.engagement_prediction > 15) {
      insights.push('Previsão de engajamento muito positiva');
    }

    return insights;
  }
}