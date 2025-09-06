import { eq, and, or, like, desc, asc, sql, inArray, gte, lte, ne } from "drizzle-orm";
import { PostgresJsDatabase } from "drizzle-orm/postgres-js";
import { campaignTemplates, userCampaigns, campaignPerformance, visualAssets } from "../../shared/schema";
import { 
  CampaignTemplateCreate, 
  CampaignTemplateUpdate, 
  TemplateFilters, 
  Pagination,
  CampaignCategoryType,
  ServiceTypeType
} from "../models/campaign";

// ============================================================================
// Campaign Template Repository
// ============================================================================

export class CampaignTemplateRepository {
  constructor(private db: PostgresJsDatabase<any>) {}

  /**
   * Create a new campaign template
   */
  async create(data: CampaignTemplateCreate, createdBy?: string): Promise<typeof campaignTemplates.$inferSelect> {
    const [template] = await this.db
      .insert(campaignTemplates)
      .values({
        ...data,
        contentPieces: data.contentPieces,
        visualAssets: data.visualAssets || null,
        customizationOptions: data.customizationOptions || null,
        seasonality: data.seasonality || null,
        createdBy: createdBy || null,
        category: data.category,
        serviceType: data.serviceType,
      })
      .returning();

    return template;
  }

  /**
   * Get template by ID with optional performance data
   */
  async findById(id: string, includePerformance = false): Promise<(typeof campaignTemplates.$inferSelect & { performanceData?: any }) | null> {
    const template = await this.db
      .select()
      .from(campaignTemplates)
      .where(eq(campaignTemplates.id, id))
      .limit(1);

    if (!template.length) return null;

    const result = template[0];

    if (includePerformance) {
      // Aggregate performance data from campaign_performance table
      const performanceAgg = await this.db
        .select({
          avgEngagement: sql<number>`AVG(${campaignPerformance.engagementRate})`,
          avgConversion: sql<number>`AVG(${campaignPerformance.conversionRate})`,
          totalImpressions: sql<number>`SUM(${campaignPerformance.impressions})`,
          totalConversions: sql<number>`SUM(${campaignPerformance.conversions})`,
          channelCount: sql<number>`COUNT(DISTINCT ${campaignPerformance.channel})`
        })
        .from(campaignPerformance)
        .where(eq(campaignPerformance.templateId, id));

      return {
        ...result,
        performanceData: performanceAgg[0]
      };
    }

    return result;
  }

  /**
   * List templates with filters and pagination
   */
  async findMany(filters: TemplateFilters = {}, pagination: Pagination = { page: 1, limit: 20, sortBy: 'createdAt', sortOrder: 'desc' }): Promise<{
    templates: (typeof campaignTemplates.$inferSelect)[];
    totalCount: number;
    hasMore: boolean;
  }> {
    // Build WHERE conditions
    const conditions = [];

    if (filters.category) {
      conditions.push(eq(campaignTemplates.category, filters.category));
    }

    if (filters.serviceType) {
      conditions.push(eq(campaignTemplates.serviceType, filters.serviceType));
    }

    if (filters.isPremium !== undefined) {
      conditions.push(eq(campaignTemplates.isPremium, filters.isPremium));
    }

    if (filters.isPublic !== undefined) {
      conditions.push(eq(campaignTemplates.isPublic, filters.isPublic));
    }

    if (filters.search) {
      conditions.push(
        or(
          like(campaignTemplates.name, `%${filters.search}%`),
          like(campaignTemplates.description, `%${filters.search}%`)
        )
      );
    }

    if (filters.minEngagementRate) {
      conditions.push(gte(campaignTemplates.avgEngagementRate, filters.minEngagementRate.toString()));
    }

    if (filters.minSuccessCases) {
      conditions.push(gte(campaignTemplates.successCases, filters.minSuccessCases));
    }

    // Seasonality filter for current month
    if (filters.currentSeason) {
      const currentMonth = new Date().getMonth() + 1;
      conditions.push(
        sql`${campaignTemplates.seasonality}->>'months' @> ${JSON.stringify([currentMonth])}`
      );
    }

    if (filters.peakPerformance) {
      conditions.push(
        sql`${campaignTemplates.seasonality}->>'peak_performance' = ${filters.peakPerformance}`
      );
    }

    // Calculate offset
    const offset = (pagination.page - 1) * pagination.limit;

    // Build ORDER BY
    let orderBy;
    const direction = pagination.sortOrder === 'asc' ? asc : desc;
    
    switch (pagination.sortBy) {
      case 'name':
        orderBy = direction(campaignTemplates.name);
        break;
      case 'usageCount':
        orderBy = direction(campaignTemplates.usageCount);
        break;
      case 'avgEngagementRate':
        orderBy = direction(campaignTemplates.avgEngagementRate);
        break;
      case 'createdAt':
      default:
        orderBy = direction(campaignTemplates.createdAt);
        break;
    }

    // Execute query
    const whereClause = conditions.length > 0 ? and(...conditions) : undefined;

    const [templates, [{ count }]] = await Promise.all([
      this.db
        .select()
        .from(campaignTemplates)
        .where(whereClause)
        .orderBy(orderBy)
        .limit(pagination.limit)
        .offset(offset),
      
      this.db
        .select({ count: sql<number>`count(*)` })
        .from(campaignTemplates)
        .where(whereClause)
    ]);

    const totalCount = Number(count);
    const hasMore = offset + templates.length < totalCount;

    return {
      templates,
      totalCount,
      hasMore
    };
  }

  /**
   * Get the raw SQL query for findMany for optimization analysis
   */
  getFindManyQuery(filters: TemplateFilters = {}, pagination: Pagination = { page: 1, limit: 20, sortBy: 'createdAt', sortOrder: 'desc' }): string {
    const conditions = [];

    if (filters.category) {
      conditions.push(eq(campaignTemplates.category, filters.category));
    }

    if (filters.serviceType) {
      conditions.push(eq(campaignTemplates.serviceType, filters.serviceType));
    }

    if (filters.isPremium !== undefined) {
      conditions.push(eq(campaignTemplates.isPremium, filters.isPremium));
    }

    if (filters.isPublic !== undefined) {
      conditions.push(eq(campaignTemplates.isPublic, filters.isPublic));
    }

    if (filters.search) {
      conditions.push(
        or(
          like(campaignTemplates.name, `%${filters.search}%`),
          like(campaignTemplates.description, `%${filters.search}%`)
        )
      );
    }

    if (filters.minEngagementRate) {
      conditions.push(gte(campaignTemplates.avgEngagementRate, filters.minEngagementRate.toString()));
    }

    if (filters.minSuccessCases) {
      conditions.push(gte(campaignTemplates.successCases, filters.minSuccessCases));
    }

    // Seasonality filter for current month
    if (filters.currentSeason) {
      const currentMonth = new Date().getMonth() + 1;
      conditions.push(
        sql`${campaignTemplates.seasonality}->>'months' @> ${JSON.stringify([currentMonth])}`
      );
    }

    if (filters.peakPerformance) {
      conditions.push(
        sql`${campaignTemplates.seasonality}->>'peak_performance' = ${filters.peakPerformance}`
      );
    }

    const whereClause = conditions.length > 0 ? and(...conditions) : undefined;

    const query = this.db
      .select()
      .from(campaignTemplates)
      .where(whereClause)
      .toSQL();

    return query.sql;
  }

  /**
   * Update template by ID
   */
  async update(id: string, data: CampaignTemplateUpdate): Promise<typeof campaignTemplates.$inferSelect | null> {
    const [template] = await this.db
      .update(campaignTemplates)
      .set({
        ...data,
        updatedAt: sql`now()`
      })
      .where(eq(campaignTemplates.id, id))
      .returning();

    return template || null;
  }

  /**
   * Delete template by ID
   */
  async delete(id: string): Promise<boolean> {
    const result = await this.db
      .delete(campaignTemplates)
      .where(eq(campaignTemplates.id, id));

    return result.length > 0;
  }

  /**
   * Get popular templates by usage count
   */
  async findPopular(limit = 10): Promise<typeof campaignTemplates.$inferSelect[]> {
    return this.db
      .select()
      .from(campaignTemplates)
      .where(eq(campaignTemplates.isPublic, true))
      .orderBy(desc(campaignTemplates.usageCount))
      .limit(limit);
  }

  /**
   * Get templates by category with performance stats
   */
  async findByCategory(category: CampaignCategoryType, limit = 20): Promise<(typeof campaignTemplates.$inferSelect & { avgPerformance?: number })[]> {
    const templates = await this.db
      .select({
        template: campaignTemplates,
        avgPerformance: sql<number>`AVG(${campaignPerformance.engagementRate})`
      })
      .from(campaignTemplates)
      .leftJoin(campaignPerformance, eq(campaignTemplates.id, campaignPerformance.templateId))
      .where(and(
        eq(campaignTemplates.category, category),
        eq(campaignTemplates.isPublic, true)
      ))
      .groupBy(campaignTemplates.id)
      .orderBy(desc(campaignTemplates.usageCount))
      .limit(limit);

    return templates.map(row => ({
      ...row.template,
      avgPerformance: row.avgPerformance
    }));
  }

  /**
   * Get seasonal templates for current month
   */
  async findSeasonal(limit = 15): Promise<typeof campaignTemplates.$inferSelect[]> {
    const currentMonth = new Date().getMonth() + 1;
    
    return this.db
      .select()
      .from(campaignTemplates)
      .where(
        and(
          eq(campaignTemplates.isPublic, true),
          sql`${campaignTemplates.seasonality}->>'months' @> ${JSON.stringify([currentMonth])}`
        )
      )
      .orderBy(
        sql`CASE WHEN ${campaignTemplates.seasonality}->>'peak_performance' = 'high' THEN 1 
                 WHEN ${campaignTemplates.seasonality}->>'peak_performance' = 'medium' THEN 2 
                 ELSE 3 END`,
        desc(campaignTemplates.usageCount)
      )
      .limit(limit);
  }

  /**
   * Increment usage count for template
   */
  async incrementUsage(id: string): Promise<void> {
    await this.db
      .update(campaignTemplates)
      .set({
        usageCount: sql`${campaignTemplates.usageCount} + 1`
      })
      .where(eq(campaignTemplates.id, id));
  }

  /**
   * Update performance metrics for template
   */
  async updatePerformanceMetrics(id: string): Promise<void> {
    // Recalculate performance metrics from campaign_performance table
    const metrics = await this.db
      .select({
        avgEngagement: sql<number>`AVG(${campaignPerformance.engagementRate})`,
        avgConversion: sql<number>`AVG(${campaignPerformance.conversionRate})`,
        successCases: sql<number>`COUNT(CASE WHEN ${campaignPerformance.conversionRate} > 0.05 THEN 1 END)`
      })
      .from(campaignPerformance)
      .where(eq(campaignPerformance.templateId, id));

    if (metrics[0]) {
      await this.db
        .update(campaignTemplates)
        .set({
          avgEngagementRate: metrics[0].avgEngagement?.toString(),
          avgConversionRate: metrics[0].avgConversion?.toString(),
          successCases: Number(metrics[0].successCases) || 0,
          updatedAt: sql`now()`
        })
        .where(eq(campaignTemplates.id, id));
    }
  }

  /**
   * Search templates by content
   */
  async search(query: string, limit = 20): Promise<typeof campaignTemplates.$inferSelect[]> {
    return this.db
      .select()
      .from(campaignTemplates)
      .where(
        and(
          eq(campaignTemplates.isPublic, true),
          or(
            like(campaignTemplates.name, `%${query}%`),
            like(campaignTemplates.description, `%${query}%`),
            sql`${campaignTemplates.contentPieces}::text ILIKE ${`%${query}%`}`
          )
        )
      )
      .orderBy(desc(campaignTemplates.usageCount))
      .limit(limit);
  }

  /**
   * Get template comparison data for multiple templates
   */
  async getComparisonData(templateIds: string[]): Promise<Array<typeof campaignTemplates.$inferSelect & { 
    performanceScore?: number;
    usageRank?: number;
  }>> {
    if (templateIds.length === 0) return [];

    const templates = await this.db
      .select()
      .from(campaignTemplates)
      .where(inArray(campaignTemplates.id, templateIds));

    // Add performance scores and rankings
    const enrichedTemplates = await Promise.all(
      templates.map(async (template) => {
        const performance = await this.db
          .select({
            avgEngagement: sql<number>`AVG(${campaignPerformance.engagementRate})`,
            avgConversion: sql<number>`AVG(${campaignPerformance.conversionRate})`
          })
          .from(campaignPerformance)
          .where(eq(campaignPerformance.templateId, template.id));

        const performanceScore = performance[0] 
          ? ((performance[0].avgEngagement || 0) * 0.6) + ((performance[0].avgConversion || 0) * 0.4)
          : 0;

        return {
          ...template,
          performanceScore,
          usageRank: template.usageCount
        };
      })
    );

    return enrichedTemplates.sort((a, b) => (b.performanceScore || 0) - (a.performanceScore || 0));
  }

  /**
   * Find similar templates based on category, service type, and content similarity
   */
  async findSimilar(templateId: string, limit = 5): Promise<Array<typeof campaignTemplates.$inferSelect & { similarityScore?: number }>> {
    const baseTemplate = await this.findById(templateId);
    if (!baseTemplate) return [];

    // Find templates with same category and similar attributes
    const similar = await this.db
      .select()
      .from(campaignTemplates)
      .where(
        and(
          ne(campaignTemplates.id, templateId),
          eq(campaignTemplates.isPublic, true),
          eq(campaignTemplates.category, baseTemplate.category)
        )
      )
      .limit(limit * 2); // Get more to calculate similarity

    // Calculate similarity scores
    const withScores = similar.map(template => {
      let score = 0;
      
      // Category match (40%) - already filtered
      score += 0.4;

      // Service type similarity (30%)
      if (template.serviceType === baseTemplate.serviceType) {
        score += 0.3;
      }

      // Performance tier similarity (20%)
      const basePerf = parseFloat(baseTemplate.avgEngagementRate || '0');
      const templatePerf = parseFloat(template.avgEngagementRate || '0');
      if (basePerf > 0 && templatePerf > 0) {
        const perfDiff = Math.abs(basePerf - templatePerf) / Math.max(basePerf, templatePerf);
        score += (1 - perfDiff) * 0.2;
      }

      // Usage count similarity (10%)
      const usageDiff = Math.abs(baseTemplate.usageCount - template.usageCount);
      const maxUsage = Math.max(baseTemplate.usageCount, template.usageCount);
      if (maxUsage > 0) {
        score += (1 - (usageDiff / maxUsage)) * 0.1;
      }

      return {
        ...template,
        similarityScore: Math.round(score * 100) / 100
      };
    });

    return withScores
      .sort((a, b) => (b.similarityScore || 0) - (a.similarityScore || 0))
      .slice(0, limit);
  }

  /**
   * Find trending templates based on recent usage and performance
   */
  async findTrending(limit = 10): Promise<Array<typeof campaignTemplates.$inferSelect & { trendScore?: number }>> {
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

    // Get templates with recent performance data
    const trending = await this.db
      .select({
        template: campaignTemplates,
        recentUsage: sql<number>`COUNT(${campaignPerformance.id})`,
        avgRecentEngagement: sql<number>`AVG(${campaignPerformance.engagementRate})`,
        avgRecentConversion: sql<number>`AVG(${campaignPerformance.conversionRate})`
      })
      .from(campaignTemplates)
      .leftJoin(
        campaignPerformance,
        and(
          eq(campaignTemplates.id, campaignPerformance.templateId),
          sql`${campaignPerformance.measuredAt} >= ${thirtyDaysAgo.toISOString()}`
        )
      )
      .where(eq(campaignTemplates.isPublic, true))
      .groupBy(campaignTemplates.id)
      .having(sql`COUNT(${campaignPerformance.id}) > 0`)
      .limit(limit * 2);

    // Calculate trend scores
    const withScores = trending.map(row => {
      const recentUsage = Number(row.recentUsage) || 0;
      const avgEngagement = Number(row.avgRecentEngagement) || 0;
      const avgConversion = Number(row.avgRecentConversion) || 0;

      // Trend score: recent usage (50%) + performance (30%) + engagement growth (20%)
      const usageScore = Math.min(recentUsage / 10, 1) * 0.5; // Normalize to max 10 uses
      const perfScore = (avgEngagement * 0.6 + avgConversion * 0.4) * 0.3;
      const growthScore = recentUsage > row.template.usageCount * 0.1 ? 0.2 : 0; // 10% recent growth

      const trendScore = usageScore + perfScore + growthScore;

      return {
        ...row.template,
        trendScore: Math.round(trendScore * 100) / 100
      };
    });

    return withScores
      .sort((a, b) => (b.trendScore || 0) - (a.trendScore || 0))
      .slice(0, limit);
  }

  /**
   * Find personalized templates for a user based on their campaign history
   */
  async findPersonalized(userId: string, userContext: any, limit = 10): Promise<Array<typeof campaignTemplates.$inferSelect & { personalizedScore?: number }>> {
    // Get user's template usage history through userCampaigns
    const userHistory = await this.db
      .select({
        templateId: userCampaigns.templateId,
        campaignId: userCampaigns.id,
        status: userCampaigns.status
      })
      .from(userCampaigns)
      .where(eq(userCampaigns.userId, userId))
      .limit(100);

    // Get performance data for user's campaigns
    const userPerformance = await this.db
      .select({
        templateId: campaignPerformance.templateId,
        avgEngagement: sql<number>`AVG(${campaignPerformance.engagementRate})`,
        usageCount: sql<number>`COUNT(*)`
      })
      .from(campaignPerformance)
      .innerJoin(userCampaigns, eq(campaignPerformance.campaignId, userCampaigns.id))
      .where(eq(userCampaigns.userId, userId))
      .groupBy(campaignPerformance.templateId);

    // Get user's preferred categories and performance patterns
    const preferredCategories = new Set<string>();
    const performanceThreshold = 0.05; // 5% engagement threshold for good performance

    for (const perf of userPerformance) {
      if (Number(perf.avgEngagement) > performanceThreshold) {
        const template = await this.findById(perf.templateId);
        if (template) {
          preferredCategories.add(template.category);
        }
      }
    }

    // Get templates user hasn't used extensively
    const heavilyUsedTemplateIds = userHistory
      .filter(h => h.status === 'published')
      .map(h => h.templateId)
      .filter(Boolean);

    // Get candidate templates
    const candidates = await this.db
      .select()
      .from(campaignTemplates)
      .where(
        and(
          eq(campaignTemplates.isPublic, true),
          heavilyUsedTemplateIds.length > 0 
            ? sql`${campaignTemplates.id} NOT IN (${heavilyUsedTemplateIds.map(id => `'${id}'`).join(',')})`
            : sql`1=1`
        )
      )
      .limit(limit * 3);

    // Calculate personalization scores
    const withScores = candidates.map(template => {
      let score = 0;

      // Category preference (50%)
      if (preferredCategories.has(template.category)) {
        score += 0.5;
      }

      // Performance alignment (30%)
      const templatePerf = parseFloat(template.avgEngagementRate || '0');
      if (templatePerf > performanceThreshold) {
        score += 0.3;
      }

      // Freshness bonus (20%) - favor newer templates
      const daysSinceCreated = Math.floor(
        (Date.now() - new Date(template.createdAt).getTime()) / (1000 * 60 * 60 * 24)
      );
      if (daysSinceCreated < 30) {
        score += 0.2 * (1 - daysSinceCreated / 30);
      }

      return {
        ...template,
        personalizedScore: Math.round(score * 100) / 100
      };
    });

    return withScores
      .sort((a, b) => (b.personalizedScore || 0) - (a.personalizedScore || 0))
      .slice(0, limit);
  }

  /**
   * Find recommended templates based on collaborative filtering and performance
   */
  async findRecommended(userId?: string, limit = 10): Promise<Array<typeof campaignTemplates.$inferSelect & { recommendationScore?: number }>> {
    let recommendations: Array<typeof campaignTemplates.$inferSelect & { recommendationScore?: number }> = [];

    if (userId) {
      // Get templates used by current user
      const userTemplates = await this.db
        .select({ templateId: userCampaigns.templateId })
        .from(userCampaigns)
        .where(and(
          eq(userCampaigns.userId, userId),
          sql`${userCampaigns.templateId} IS NOT NULL`
        ));

      const userTemplateIds = userTemplates.map(t => t.templateId).filter(Boolean) as string[];

      if (userTemplateIds.length > 0) {
        // Find users with similar template usage
        const similarUsers = await this.db
          .select({
            userId: userCampaigns.userId,
            commonTemplates: sql<number>`COUNT(DISTINCT ${userCampaigns.templateId})`
          })
          .from(userCampaigns)
          .where(
            and(
              ne(userCampaigns.userId, userId),
              inArray(userCampaigns.templateId, userTemplateIds),
              sql`${userCampaigns.templateId} IS NOT NULL`
            )
          )
          .groupBy(userCampaigns.userId)
          .having(sql`COUNT(DISTINCT ${userCampaigns.templateId}) >= 2`)
          .orderBy(sql`COUNT(DISTINCT ${userCampaigns.templateId}) DESC`)
          .limit(20);

        const similarUserIds = similarUsers.map(u => u.userId);
        
        if (similarUserIds.length > 0) {
          // Get templates used by similar users but not by current user
          const candidateRecommendations = await this.db
            .select({
              template: campaignTemplates,
              usageBySimular: sql<number>`COUNT(DISTINCT ${userCampaigns.userId})`,
              avgPerformance: sql<number>`AVG(${campaignPerformance.engagementRate})`
            })
            .from(campaignTemplates)
            .innerJoin(userCampaigns, eq(campaignTemplates.id, userCampaigns.templateId))
            .leftJoin(campaignPerformance, eq(userCampaigns.id, campaignPerformance.campaignId))
            .where(
              and(
                eq(campaignTemplates.isPublic, true),
                inArray(userCampaigns.userId, similarUserIds),
                sql`${campaignTemplates.id} NOT IN (${userTemplateIds.map(id => `'${id}'`).join(',')})`
              )
            )
            .groupBy(campaignTemplates.id)
            .orderBy(
              sql`COUNT(DISTINCT ${userCampaigns.userId}) DESC`,
              sql`AVG(${campaignPerformance.engagementRate}) DESC`
            )
            .limit(limit * 2);

          // Calculate recommendation scores
          recommendations = candidateRecommendations.map(row => {
            const usageBySimular = Number(row.usageBySimular) || 0;
            const avgPerformance = Number(row.avgPerformance) || 0;
            
            // Score: collaborative signal (60%) + performance (40%)
            const collaborativeScore = Math.min(usageBySimular / 5, 1) * 0.6; // Max 5 similar users
            const performanceScore = avgPerformance * 0.4;
            
            return {
              ...row.template,
              recommendationScore: Math.round((collaborativeScore + performanceScore) * 100) / 100
            };
          });
        }
      }
    }

    // If not enough collaborative recommendations, fill with high-performing templates
    if (recommendations.length < limit) {
      const topPerforming = await this.db
        .select({
          template: campaignTemplates,
          avgPerformance: sql<number>`AVG(${campaignPerformance.engagementRate})`,
          usageCount: sql<number>`COUNT(${campaignPerformance.id})`
        })
        .from(campaignTemplates)
        .leftJoin(campaignPerformance, eq(campaignTemplates.id, campaignPerformance.templateId))
        .where(eq(campaignTemplates.isPublic, true))
        .groupBy(campaignTemplates.id)
        .having(sql`COUNT(${campaignPerformance.id}) >= 3`) // Min 3 uses
        .orderBy(
          sql`AVG(${campaignPerformance.engagementRate}) DESC`,
          desc(campaignTemplates.usageCount)
        )
        .limit(limit - recommendations.length);

      // Add performance-based recommendations
      const performanceRecs = topPerforming.map(row => ({
        ...row.template,
        recommendationScore: Math.round((Number(row.avgPerformance) || 0) * 100) / 100
      }));

      recommendations = [...recommendations, ...performanceRecs];
    }

    return recommendations
      .sort((a, b) => (b.recommendationScore || 0) - (a.recommendationScore || 0))
      .slice(0, limit);
  }
}