import { eq, and, desc, sql, inArray } from "drizzle-orm";
import { PostgresJsDatabase } from "drizzle-orm/postgres-js";
import { userCampaigns, campaignTemplates, campaignPerformance } from "../../shared/schema";
import { 
  UserCampaignCreate, 
  UserCampaignUpdate,
  CampaignStatusType,
  Pagination
} from "../models/campaign";

// ============================================================================
// User Campaign Repository
// ============================================================================

export class UserCampaignRepository {
  constructor(private db: PostgresJsDatabase<any>) {}

  /**
   * Create a new user campaign
   */
  async create(userId: string, data: UserCampaignCreate): Promise<typeof userCampaigns.$inferSelect> {
    const [campaign] = await this.db
      .insert(userCampaigns)
      .values({
        userId,
        templateId: data.templateId || null,
        brandVoiceId: data.brandVoiceId,
        campaignConfig: data.campaignConfig,
        personalizedContent: data.personalizedContent,
        status: data.status || 'draft',
        scheduledAt: data.scheduledAt ? new Date(data.scheduledAt) : null
      })
      .returning();

    // Increment template usage if template was used
    if (data.templateId) {
      await this.db
        .update(campaignTemplates)
        .set({
          usageCount: sql`${campaignTemplates.usageCount} + 1`
        })
        .where(eq(campaignTemplates.id, data.templateId));
    }

    return campaign;
  }

  /**
   * Get campaign by ID with user ownership check
   */
  async findById(id: string, userId: string): Promise<(typeof userCampaigns.$inferSelect & { 
    template?: typeof campaignTemplates.$inferSelect;
    performanceData?: any;
  }) | null> {
    const campaignQuery = await this.db
      .select({
        campaign: userCampaigns,
        template: campaignTemplates
      })
      .from(userCampaigns)
      .leftJoin(campaignTemplates, eq(userCampaigns.templateId, campaignTemplates.id))
      .where(and(
        eq(userCampaigns.id, id),
        eq(userCampaigns.userId, userId)
      ))
      .limit(1);

    if (!campaignQuery.length) return null;

    const result = campaignQuery[0];

    // Get performance data if campaign is published
    let performanceData = null;
    if (result.campaign.status === 'published' || result.campaign.status === 'completed') {
      const performance = await this.db
        .select({
          totalImpressions: sql<number>`SUM(${campaignPerformance.impressions})`,
          totalReaches: sql<number>`SUM(${campaignPerformance.reaches})`,
          totalClicks: sql<number>`SUM(${campaignPerformance.clicks})`,
          totalConversions: sql<number>`SUM(${campaignPerformance.conversions})`,
          avgEngagement: sql<number>`AVG(${campaignPerformance.engagementRate})`,
          avgConversion: sql<number>`AVG(${campaignPerformance.conversionRate})`,
          channels: sql<string[]>`ARRAY_AGG(DISTINCT ${campaignPerformance.channel})`
        })
        .from(campaignPerformance)
        .where(eq(campaignPerformance.campaignId, id));

      performanceData = performance[0];
    }

    return {
      ...result.campaign,
      template: result.template || undefined,
      performanceData
    };
  }

  /**
   * List user campaigns with filters and pagination
   */
  async findByUser(
    userId: string, 
    filters: { 
      status?: CampaignStatusType;
      templateId?: string;
      search?: string;
    } = {},
    pagination: Pagination = { page: 1, limit: 20, sortBy: 'createdAt', sortOrder: 'desc' }
  ): Promise<{
    campaigns: (typeof userCampaigns.$inferSelect & { template?: typeof campaignTemplates.$inferSelect })[];
    totalCount: number;
    hasMore: boolean;
  }> {
    // Build WHERE conditions
    const conditions = [eq(userCampaigns.userId, userId)];

    if (filters.status) {
      conditions.push(eq(userCampaigns.status, filters.status));
    }

    if (filters.templateId) {
      conditions.push(eq(userCampaigns.templateId, filters.templateId));
    }

    // Calculate offset
    const offset = (pagination.page - 1) * pagination.limit;

    // Build ORDER BY
    let orderBy;
    const direction = pagination.sortOrder === 'asc' ? sql`ASC` : sql`DESC`;
    
    switch (pagination.sortBy) {
      case 'createdAt':
      default:
        orderBy = sql`${userCampaigns.createdAt} ${direction}`;
        break;
    }

    // Execute query
    const whereClause = and(...conditions);

    const [campaigns, [{ count }]] = await Promise.all([
      this.db
        .select({
          campaign: userCampaigns,
          template: campaignTemplates
        })
        .from(userCampaigns)
        .leftJoin(campaignTemplates, eq(userCampaigns.templateId, campaignTemplates.id))
        .where(whereClause)
        .orderBy(orderBy)
        .limit(pagination.limit)
        .offset(offset),
      
      this.db
        .select({ count: sql<number>`count(*)` })
        .from(userCampaigns)
        .where(whereClause)
    ]);

    const totalCount = Number(count);
    const hasMore = offset + campaigns.length < totalCount;

    return {
      campaigns: campaigns.map(row => ({
        ...row.campaign,
        template: row.template || undefined
      })),
      totalCount,
      hasMore
    };
  }

  /**
   * Update campaign by ID with user ownership check
   */
  async update(id: string, userId: string, data: UserCampaignUpdate): Promise<typeof userCampaigns.$inferSelect | null> {
    const [campaign] = await this.db
      .update(userCampaigns)
      .set({
        ...data,
        scheduledAt: data.scheduledAt ? new Date(data.scheduledAt) : undefined,
        updatedAt: sql`now()`
      })
      .where(and(
        eq(userCampaigns.id, id),
        eq(userCampaigns.userId, userId)
      ))
      .returning();

    return campaign || null;
  }

  /**
   * Update campaign status
   */
  async updateStatus(id: string, userId: string, status: CampaignStatusType): Promise<typeof userCampaigns.$inferSelect | null> {
    const updateData: any = { 
      status, 
      updatedAt: sql`now()` 
    };

    // Set published timestamp when publishing
    if (status === 'published') {
      updateData.publishedAt = sql`now()`;
    }

    const [campaign] = await this.db
      .update(userCampaigns)
      .set(updateData)
      .where(and(
        eq(userCampaigns.id, id),
        eq(userCampaigns.userId, userId)
      ))
      .returning();

    return campaign || null;
  }

  /**
   * Delete campaign by ID with user ownership check
   */
  async delete(id: string, userId: string): Promise<boolean> {
    const result = await this.db
      .delete(userCampaigns)
      .where(and(
        eq(userCampaigns.id, id),
        eq(userCampaigns.userId, userId)
      ));

    return result.length > 0;
  }

  /**
   * Get campaigns scheduled for publication
   */
  async findScheduled(limit = 50): Promise<typeof userCampaigns.$inferSelect[]> {
    const now = new Date();
    
    return this.db
      .select()
      .from(userCampaigns)
      .where(and(
        eq(userCampaigns.status, 'scheduled'),
        sql`${userCampaigns.scheduledAt} <= ${now}`
      ))
      .orderBy(userCampaigns.scheduledAt)
      .limit(limit);
  }

  /**
   * Get campaign drafts for user
   */
  async findDrafts(userId: string, limit = 10): Promise<(typeof userCampaigns.$inferSelect & { template?: typeof campaignTemplates.$inferSelect })[]> {
    const drafts = await this.db
      .select({
        campaign: userCampaigns,
        template: campaignTemplates
      })
      .from(userCampaigns)
      .leftJoin(campaignTemplates, eq(userCampaigns.templateId, campaignTemplates.id))
      .where(and(
        eq(userCampaigns.userId, userId),
        eq(userCampaigns.status, 'draft')
      ))
      .orderBy(desc(userCampaigns.updatedAt))
      .limit(limit);

    return drafts.map(row => ({
      ...row.campaign,
      template: row.template || undefined
    }));
  }

  /**
   * Get campaign analytics summary for user
   */
  async getUserAnalytics(userId: string): Promise<{
    totalCampaigns: number;
    publishedCampaigns: number;
    draftCampaigns: number;
    avgEngagementRate: number;
    avgConversionRate: number;
    topPerformingTemplates: string[];
  }> {
    const [stats] = await this.db
      .select({
        totalCampaigns: sql<number>`COUNT(*)`,
        publishedCampaigns: sql<number>`COUNT(CASE WHEN ${userCampaigns.status} IN ('published', 'completed') THEN 1 END)`,
        draftCampaigns: sql<number>`COUNT(CASE WHEN ${userCampaigns.status} = 'draft' THEN 1 END)`
      })
      .from(userCampaigns)
      .where(eq(userCampaigns.userId, userId));

    // Get performance metrics
    const performanceStats = await this.db
      .select({
        avgEngagement: sql<number>`AVG(${campaignPerformance.engagementRate})`,
        avgConversion: sql<number>`AVG(${campaignPerformance.conversionRate})`
      })
      .from(campaignPerformance)
      .innerJoin(userCampaigns, eq(campaignPerformance.campaignId, userCampaigns.id))
      .where(eq(userCampaigns.userId, userId));

    // Get top performing templates
    const topTemplates = await this.db
      .select({
        templateId: userCampaigns.templateId,
        avgPerformance: sql<number>`AVG(${campaignPerformance.engagementRate})`
      })
      .from(userCampaigns)
      .innerJoin(campaignPerformance, eq(userCampaigns.id, campaignPerformance.campaignId))
      .where(and(
        eq(userCampaigns.userId, userId),
        sql`${userCampaigns.templateId} IS NOT NULL`
      ))
      .groupBy(userCampaigns.templateId)
      .orderBy(sql`AVG(${campaignPerformance.engagementRate}) DESC`)
      .limit(5);

    return {
      totalCampaigns: Number(stats.totalCampaigns),
      publishedCampaigns: Number(stats.publishedCampaigns),
      draftCampaigns: Number(stats.draftCampaigns),
      avgEngagementRate: Number(performanceStats[0]?.avgEngagement || 0),
      avgConversionRate: Number(performanceStats[0]?.avgConversion || 0),
      topPerformingTemplates: topTemplates.map(t => t.templateId).filter(Boolean) as string[]
    };
  }

  /**
   * Clone an existing campaign
   */
  async clone(originalId: string, userId: string, newName?: string): Promise<typeof userCampaigns.$inferSelect | null> {
    const original = await this.findById(originalId, userId);
    if (!original || !original.brandVoiceId) return null;

    const originalConfig = original.campaignConfig as any;
    const originalContent = original.personalizedContent as any;

    const cloneData: UserCampaignCreate = {
      templateId: original.templateId || undefined,
      brandVoiceId: original.brandVoiceId,
      campaignConfig: {
        ...originalConfig,
        objective: newName || `${originalConfig?.objective || 'Campaign'} (Copy)`
      },
      personalizedContent: originalContent || [],
      status: 'draft'
    };

    return this.create(userId, cloneData);
  }

  /**
   * Bulk update campaign status
   */
  async bulkUpdateStatus(campaignIds: string[], userId: string, status: CampaignStatusType): Promise<number> {
    if (campaignIds.length === 0) return 0;

    const updateData: any = { 
      status, 
      updatedAt: sql`now()` 
    };

    if (status === 'published') {
      updateData.publishedAt = sql`now()`;
    }

    const result = await this.db
      .update(userCampaigns)
      .set(updateData)
      .where(and(
        inArray(userCampaigns.id, campaignIds),
        eq(userCampaigns.userId, userId)
      ));

    return result.length;
  }
}