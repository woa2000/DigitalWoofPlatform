import { eq, and, desc, asc, sql, gte, lte, inArray } from "drizzle-orm";
import { PostgresJsDatabase } from "drizzle-orm/postgres-js";
import { campaignPerformance, userCampaigns, campaignTemplates } from "../../shared/schema";
import { CampaignPerformanceCreate } from "../models/campaign";

// ============================================================================
// Campaign Performance Repository
// ============================================================================

export class CampaignPerformanceRepository {
  constructor(private db: PostgresJsDatabase<any>) {}

  /**
   * Record performance metrics for a campaign
   */
  async create(data: CampaignPerformanceCreate): Promise<typeof campaignPerformance.$inferSelect> {
    // Calculate rates from basic metrics
    const engagementRate = data.impressions > 0 
      ? (data.clicks + data.conversions) / data.impressions 
      : 0;
    
    const clickThroughRate = data.impressions > 0 
      ? data.clicks / data.impressions 
      : 0;
    
    const conversionRate = data.clicks > 0 
      ? data.conversions / data.clicks 
      : 0;

    const [performance] = await this.db
      .insert(campaignPerformance)
      .values({
        ...data,
        engagementRate: engagementRate.toString(),
        clickThroughRate: clickThroughRate.toString(),
        conversionRate: conversionRate.toString()
      })
      .returning();

    // Update template performance metrics
    await this.updateTemplatePerformanceMetrics(data.templateId);

    return performance;
  }

  /**
   * Get performance data for a campaign
   */
  async findByCampaign(campaignId: string): Promise<typeof campaignPerformance.$inferSelect[]> {
    return this.db
      .select()
      .from(campaignPerformance)
      .where(eq(campaignPerformance.campaignId, campaignId))
      .orderBy(desc(campaignPerformance.measuredAt));
  }

  /**
   * Get aggregated performance for a campaign
   */
  async getCampaignSummary(campaignId: string): Promise<{
    totalImpressions: number;
    totalReaches: number;
    totalClicks: number;
    totalConversions: number;
    avgEngagementRate: number;
    avgClickThroughRate: number;
    avgConversionRate: number;
    bestChannel: string | null;
    channelCount: number;
  } | null> {
    const [summary] = await this.db
      .select({
        totalImpressions: sql<number>`SUM(${campaignPerformance.impressions})`,
        totalReaches: sql<number>`SUM(${campaignPerformance.reaches})`,
        totalClicks: sql<number>`SUM(${campaignPerformance.clicks})`,
        totalConversions: sql<number>`SUM(${campaignPerformance.conversions})`,
        avgEngagementRate: sql<number>`AVG(${campaignPerformance.engagementRate})`,
        avgClickThroughRate: sql<number>`AVG(${campaignPerformance.clickThroughRate})`,
        avgConversionRate: sql<number>`AVG(${campaignPerformance.conversionRate})`,
        channelCount: sql<number>`COUNT(DISTINCT ${campaignPerformance.channel})`
      })
      .from(campaignPerformance)
      .where(eq(campaignPerformance.campaignId, campaignId));

    if (!summary) return null;

    // Get best performing channel
    const [bestChannelResult] = await this.db
      .select({
        channel: campaignPerformance.channel,
        avgEngagement: sql<number>`AVG(${campaignPerformance.engagementRate})`
      })
      .from(campaignPerformance)
      .where(eq(campaignPerformance.campaignId, campaignId))
      .groupBy(campaignPerformance.channel)
      .orderBy(sql`AVG(${campaignPerformance.engagementRate}) DESC`)
      .limit(1);

    return {
      totalImpressions: Number(summary.totalImpressions) || 0,
      totalReaches: Number(summary.totalReaches) || 0,
      totalClicks: Number(summary.totalClicks) || 0,
      totalConversions: Number(summary.totalConversions) || 0,
      avgEngagementRate: Number(summary.avgEngagementRate) || 0,
      avgClickThroughRate: Number(summary.avgClickThroughRate) || 0,
      avgConversionRate: Number(summary.avgConversionRate) || 0,
      bestChannel: bestChannelResult?.channel || null,
      channelCount: Number(summary.channelCount) || 0
    };
  }

  /**
   * Get performance trends for a campaign over time
   */
  async getCampaignTrends(
    campaignId: string, 
    startDate?: Date, 
    endDate?: Date
  ): Promise<Array<{
    date: string;
    impressions: number;
    clicks: number;
    conversions: number;
    engagementRate: number;
  }>> {
    const conditions = [eq(campaignPerformance.campaignId, campaignId)];

    if (startDate) {
      conditions.push(gte(campaignPerformance.measuredAt, startDate));
    }
    if (endDate) {
      conditions.push(lte(campaignPerformance.measuredAt, endDate));
    }

    const trends = await this.db
      .select({
        date: sql<string>`DATE(${campaignPerformance.measuredAt})`,
        impressions: sql<number>`SUM(${campaignPerformance.impressions})`,
        clicks: sql<number>`SUM(${campaignPerformance.clicks})`,
        conversions: sql<number>`SUM(${campaignPerformance.conversions})`,
        engagementRate: sql<number>`AVG(${campaignPerformance.engagementRate})`
      })
      .from(campaignPerformance)
      .where(and(...conditions))
      .groupBy(sql`DATE(${campaignPerformance.measuredAt})`)
      .orderBy(sql`DATE(${campaignPerformance.measuredAt})`);

    return trends.map(trend => ({
      date: trend.date,
      impressions: Number(trend.impressions) || 0,
      clicks: Number(trend.clicks) || 0,
      conversions: Number(trend.conversions) || 0,
      engagementRate: Number(trend.engagementRate) || 0
    }));
  }

  /**
   * Get template performance summary
   */
  async getTemplatePerformance(templateId: string): Promise<{
    totalUsage: number;
    avgEngagementRate: number;
    avgConversionRate: number;
    bestPerformingCampaign: string | null;
    channelPerformance: Array<{
      channel: string;
      avgEngagement: number;
      usageCount: number;
    }>;
  }> {
    // Get overall metrics
    const [summary] = await this.db
      .select({
        totalUsage: sql<number>`COUNT(DISTINCT ${campaignPerformance.campaignId})`,
        avgEngagementRate: sql<number>`AVG(${campaignPerformance.engagementRate})`,
        avgConversionRate: sql<number>`AVG(${campaignPerformance.conversionRate})`
      })
      .from(campaignPerformance)
      .where(eq(campaignPerformance.templateId, templateId));

    // Get best performing campaign
    const [bestCampaign] = await this.db
      .select({
        campaignId: campaignPerformance.campaignId,
        avgEngagement: sql<number>`AVG(${campaignPerformance.engagementRate})`
      })
      .from(campaignPerformance)
      .where(eq(campaignPerformance.templateId, templateId))
      .groupBy(campaignPerformance.campaignId)
      .orderBy(sql`AVG(${campaignPerformance.engagementRate}) DESC`)
      .limit(1);

    // Get channel performance
    const channelPerformance = await this.db
      .select({
        channel: campaignPerformance.channel,
        avgEngagement: sql<number>`AVG(${campaignPerformance.engagementRate})`,
        usageCount: sql<number>`COUNT(*)`
      })
      .from(campaignPerformance)
      .where(eq(campaignPerformance.templateId, templateId))
      .groupBy(campaignPerformance.channel)
      .orderBy(sql`AVG(${campaignPerformance.engagementRate}) DESC`);

    return {
      totalUsage: Number(summary?.totalUsage) || 0,
      avgEngagementRate: Number(summary?.avgEngagementRate) || 0,
      avgConversionRate: Number(summary?.avgConversionRate) || 0,
      bestPerformingCampaign: bestCampaign?.campaignId || null,
      channelPerformance: channelPerformance.map(cp => ({
        channel: cp.channel,
        avgEngagement: Number(cp.avgEngagement) || 0,
        usageCount: Number(cp.usageCount) || 0
      }))
    };
  }

  /**
   * Get industry benchmarks for comparison
   */
  async getIndustryBenchmarks(serviceType?: string): Promise<{
    avgEngagementRate: number;
    avgConversionRate: number;
    topPerformingChannels: string[];
    sampleSize: number;
  }> {
    let query = this.db
      .select({
        avgEngagementRate: sql<number>`AVG(${campaignPerformance.engagementRate})`,
        avgConversionRate: sql<number>`AVG(${campaignPerformance.conversionRate})`,
        sampleSize: sql<number>`COUNT(*)`
      })
      .from(campaignPerformance)
      .innerJoin(campaignTemplates, eq(campaignPerformance.templateId, campaignTemplates.id));

    if (serviceType) {
      query = query.where(eq(campaignTemplates.serviceType, serviceType)) as any;
    }

    const [benchmarks] = await query;

    // Get top performing channels
    const topChannels = await this.db
      .select({
        channel: campaignPerformance.channel,
        avgEngagement: sql<number>`AVG(${campaignPerformance.engagementRate})`
      })
      .from(campaignPerformance)
      .innerJoin(campaignTemplates, eq(campaignPerformance.templateId, campaignTemplates.id))
      .where(serviceType ? eq(campaignTemplates.serviceType, serviceType) : undefined)
      .groupBy(campaignPerformance.channel)
      .orderBy(sql`AVG(${campaignPerformance.engagementRate}) DESC`)
      .limit(5);

    return {
      avgEngagementRate: Number(benchmarks?.avgEngagementRate) || 0,
      avgConversionRate: Number(benchmarks?.avgConversionRate) || 0,
      topPerformingChannels: topChannels.map(tc => tc.channel),
      sampleSize: Number(benchmarks?.sampleSize) || 0
    };
  }

  /**
   * Update template performance metrics
   */
  private async updateTemplatePerformanceMetrics(templateId: string): Promise<void> {
    const [metrics] = await this.db
      .select({
        avgEngagement: sql<number>`AVG(${campaignPerformance.engagementRate})`,
        avgConversion: sql<number>`AVG(${campaignPerformance.conversionRate})`,
        successCases: sql<number>`COUNT(CASE WHEN ${campaignPerformance.conversionRate} > 0.05 THEN 1 END)`
      })
      .from(campaignPerformance)
      .where(eq(campaignPerformance.templateId, templateId));

    if (metrics) {
      await this.db
        .update(campaignTemplates)
        .set({
          avgEngagementRate: metrics.avgEngagement?.toString(),
          avgConversionRate: metrics.avgConversion?.toString(),
          successCases: Number(metrics.successCases) || 0,
          updatedAt: sql`now()`
        })
        .where(eq(campaignTemplates.id, templateId));
    }
  }

  /**
   * Get performance comparison between templates
   */
  async compareTemplates(templateIds: string[]): Promise<Array<{
    templateId: string;
    templateName: string;
    avgEngagementRate: number;
    avgConversionRate: number;
    totalUsage: number;
    bestChannel: string | null;
  }>> {
    if (templateIds.length === 0) return [];

    const comparison = await this.db
      .select({
        templateId: campaignPerformance.templateId,
        templateName: campaignTemplates.name,
        avgEngagementRate: sql<number>`AVG(${campaignPerformance.engagementRate})`,
        avgConversionRate: sql<number>`AVG(${campaignPerformance.conversionRate})`,
        totalUsage: sql<number>`COUNT(DISTINCT ${campaignPerformance.campaignId})`
      })
      .from(campaignPerformance)
      .innerJoin(campaignTemplates, eq(campaignPerformance.templateId, campaignTemplates.id))
      .where(inArray(campaignPerformance.templateId, templateIds))
      .groupBy(campaignPerformance.templateId, campaignTemplates.name);

    // Get best channel for each template
    const bestChannels = await Promise.all(
      templateIds.map(async (templateId) => {
        const [bestChannel] = await this.db
          .select({
            templateId: campaignPerformance.templateId,
            channel: campaignPerformance.channel,
            avgEngagement: sql<number>`AVG(${campaignPerformance.engagementRate})`
          })
          .from(campaignPerformance)
          .where(eq(campaignPerformance.templateId, templateId))
          .groupBy(campaignPerformance.templateId, campaignPerformance.channel)
          .orderBy(sql`AVG(${campaignPerformance.engagementRate}) DESC`)
          .limit(1);

        return { templateId, bestChannel: bestChannel?.channel || null };
      })
    );

    const channelMap = new Map(bestChannels.map(bc => [bc.templateId, bc.bestChannel]));

    return comparison.map(comp => ({
      templateId: comp.templateId,
      templateName: comp.templateName,
      avgEngagementRate: Number(comp.avgEngagementRate) || 0,
      avgConversionRate: Number(comp.avgConversionRate) || 0,
      totalUsage: Number(comp.totalUsage) || 0,
      bestChannel: channelMap.get(comp.templateId) || null
    }));
  }

  /**
   * Delete performance data for a campaign
   */
  async deleteByCampaign(campaignId: string): Promise<boolean> {
    const result = await this.db
      .delete(campaignPerformance)
      .where(eq(campaignPerformance.campaignId, campaignId));

    return result.length > 0;
  }

  /**
   * Get daily performance aggregates for dashboard
   */
  async getDailyAggregates(
    userId?: string,
    days = 30
  ): Promise<Array<{
    date: string;
    totalImpressions: number;
    totalClicks: number;
    totalConversions: number;
    avgEngagementRate: number;
    activeCampaigns: number;
  }>> {
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - days);

    if (userId) {
      const aggregates = await this.db
        .select({
          date: sql<string>`DATE(${campaignPerformance.measuredAt})`,
          totalImpressions: sql<number>`SUM(${campaignPerformance.impressions})`,
          totalClicks: sql<number>`SUM(${campaignPerformance.clicks})`,
          totalConversions: sql<number>`SUM(${campaignPerformance.conversions})`,
          avgEngagementRate: sql<number>`AVG(${campaignPerformance.engagementRate})`,
          activeCampaigns: sql<number>`COUNT(DISTINCT ${campaignPerformance.campaignId})`
        })
        .from(campaignPerformance)
        .innerJoin(userCampaigns, eq(campaignPerformance.campaignId, userCampaigns.id))
        .where(and(
          gte(campaignPerformance.measuredAt, startDate),
          eq(userCampaigns.userId, userId)
        ))
        .groupBy(sql`DATE(${campaignPerformance.measuredAt})`)
        .orderBy(sql`DATE(${campaignPerformance.measuredAt})`);

      return aggregates.map(agg => ({
        date: agg.date,
        totalImpressions: Number(agg.totalImpressions) || 0,
        totalClicks: Number(agg.totalClicks) || 0,
        totalConversions: Number(agg.totalConversions) || 0,
        avgEngagementRate: Number(agg.avgEngagementRate) || 0,
        activeCampaigns: Number(agg.activeCampaigns) || 0
      }));
    } else {
      const aggregates = await this.db
        .select({
          date: sql<string>`DATE(${campaignPerformance.measuredAt})`,
          totalImpressions: sql<number>`SUM(${campaignPerformance.impressions})`,
          totalClicks: sql<number>`SUM(${campaignPerformance.clicks})`,
          totalConversions: sql<number>`SUM(${campaignPerformance.conversions})`,
          avgEngagementRate: sql<number>`AVG(${campaignPerformance.engagementRate})`,
          activeCampaigns: sql<number>`COUNT(DISTINCT ${campaignPerformance.campaignId})`
        })
        .from(campaignPerformance)
        .where(gte(campaignPerformance.measuredAt, startDate))
        .groupBy(sql`DATE(${campaignPerformance.measuredAt})`)
        .orderBy(sql`DATE(${campaignPerformance.measuredAt})`);

      return aggregates.map(agg => ({
        date: agg.date,
        totalImpressions: Number(agg.totalImpressions) || 0,
        totalClicks: Number(agg.totalClicks) || 0,
        totalConversions: Number(agg.totalConversions) || 0,
        avgEngagementRate: Number(agg.avgEngagementRate) || 0,
        activeCampaigns: Number(agg.activeCampaigns) || 0
      }));
    }
  }
}