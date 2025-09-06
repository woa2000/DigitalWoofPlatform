import { eq, and, or, like, desc, asc, sql, inArray, ilike } from "drizzle-orm";
import { PostgresJsDatabase } from "drizzle-orm/postgres-js";
import { visualAssets } from "../../shared/schema";
import { 
  VisualAssetCreate, 
  VisualAssetUpdate, 
  AssetFilters, 
  Pagination,
  AssetTypeType,
  UsageRightsTypeType
} from "../models/campaign";

// ============================================================================
// Visual Assets Repository
// ============================================================================

export class VisualAssetsRepository {
  constructor(private db: PostgresJsDatabase<any>) {}

  /**
   * Create a new visual asset
   */
  async create(data: VisualAssetCreate): Promise<typeof visualAssets.$inferSelect> {
    const [asset] = await this.db
      .insert(visualAssets)
      .values({
        ...data,
        tags: data.tags || [],
        petTypes: data.petTypes || [],
        emotions: data.emotions || [],
        usageRights: data.usageRights || 'free',
        usageCount: 0,
        avgEngagement: null
      })
      .returning();

    return asset;
  }

  /**
   * Get asset by ID
   */
  async findById(id: string): Promise<typeof visualAssets.$inferSelect | null> {
    const [asset] = await this.db
      .select()
      .from(visualAssets)
      .where(eq(visualAssets.id, id))
      .limit(1);

    return asset || null;
  }

  /**
   * List assets with filters and pagination
   */
  async findMany(filters: AssetFilters = {}, pagination: Pagination = { page: 1, limit: 24, sortBy: 'createdAt', sortOrder: 'desc' }): Promise<{
    assets: (typeof visualAssets.$inferSelect)[];
    totalCount: number;
    hasMore: boolean;
  }> {
    // Build WHERE conditions
    const conditions = [];

    if (filters.type) {
      conditions.push(eq(visualAssets.type, filters.type));
    }

    if (filters.category) {
      conditions.push(eq(visualAssets.category, filters.category));
    }

    if (filters.usageRights) {
      conditions.push(eq(visualAssets.usageRights, filters.usageRights));
    }

    if (filters.petTypes && filters.petTypes.length > 0) {
      // Use PostgreSQL array overlap operator
      conditions.push(
        sql`${visualAssets.petTypes} && ${JSON.stringify(filters.petTypes)}`
      );
    }

    if (filters.emotions && filters.emotions.length > 0) {
      conditions.push(
        sql`${visualAssets.emotions} && ${JSON.stringify(filters.emotions)}`
      );
    }

    if (filters.tags && filters.tags.length > 0) {
      conditions.push(
        sql`${visualAssets.tags} && ${JSON.stringify(filters.tags)}`
      );
    }

    if (filters.search) {
      conditions.push(
        or(
          ilike(visualAssets.name, `%${filters.search}%`),
          sql`${visualAssets.tags}::text ILIKE ${`%${filters.search}%`}`
        )
      );
    }

    // Calculate offset
    const offset = (pagination.page - 1) * pagination.limit;

    // Build ORDER BY
    let orderBy;
    const direction = pagination.sortOrder === 'asc' ? asc : desc;
    
    switch (pagination.sortBy) {
      case 'name':
        orderBy = direction(visualAssets.name);
        break;
      case 'usageCount':
        orderBy = direction(visualAssets.usageCount);
        break;
      case 'createdAt':
      default:
        orderBy = direction(visualAssets.createdAt);
        break;
    }

    // Execute query
    const whereClause = conditions.length > 0 ? and(...conditions) : undefined;

    const [assets, [{ count }]] = await Promise.all([
      this.db
        .select()
        .from(visualAssets)
        .where(whereClause)
        .orderBy(orderBy)
        .limit(pagination.limit)
        .offset(offset),
      
      this.db
        .select({ count: sql<number>`count(*)` })
        .from(visualAssets)
        .where(whereClause)
    ]);

    const totalCount = Number(count);
    const hasMore = offset + assets.length < totalCount;

    return {
      assets,
      totalCount,
      hasMore
    };
  }

  /**
   * Update asset by ID
   */
  async update(id: string, data: VisualAssetUpdate): Promise<typeof visualAssets.$inferSelect | null> {
    const [asset] = await this.db
      .update(visualAssets)
      .set(data)
      .where(eq(visualAssets.id, id))
      .returning();

    return asset || null;
  }

  /**
   * Delete asset by ID
   */
  async delete(id: string): Promise<boolean> {
    const result = await this.db
      .delete(visualAssets)
      .where(eq(visualAssets.id, id));

    return result.length > 0;
  }

  /**
   * Get popular assets by usage count
   */
  async findPopular(limit = 20): Promise<typeof visualAssets.$inferSelect[]> {
    return this.db
      .select()
      .from(visualAssets)
      .orderBy(desc(visualAssets.usageCount))
      .limit(limit);
  }

  /**
   * Get assets by category
   */
  async findByCategory(category: string, limit = 20): Promise<typeof visualAssets.$inferSelect[]> {
    return this.db
      .select()
      .from(visualAssets)
      .where(eq(visualAssets.category, category))
      .orderBy(desc(visualAssets.usageCount))
      .limit(limit);
  }

  /**
   * Search assets by text
   */
  async search(query: string, limit = 20): Promise<typeof visualAssets.$inferSelect[]> {
    return this.db
      .select()
      .from(visualAssets)
      .where(
        or(
          ilike(visualAssets.name, `%${query}%`),
          sql`${visualAssets.tags}::text ILIKE ${`%${query}%`}`,
          sql`${visualAssets.petTypes}::text ILIKE ${`%${query}%`}`,
          sql`${visualAssets.emotions}::text ILIKE ${`%${query}%`}`
        )
      )
      .orderBy(desc(visualAssets.usageCount))
      .limit(limit);
  }

  /**
   * Get assets by pet type
   */
  async findByPetType(petType: string, limit = 20): Promise<typeof visualAssets.$inferSelect[]> {
    return this.db
      .select()
      .from(visualAssets)
      .where(sql`${visualAssets.petTypes} @> ${JSON.stringify([petType])}`)
      .orderBy(desc(visualAssets.usageCount))
      .limit(limit);
  }

  /**
   * Get assets by emotion
   */
  async findByEmotion(emotion: string, limit = 20): Promise<typeof visualAssets.$inferSelect[]> {
    return this.db
      .select()
      .from(visualAssets)
      .where(sql`${visualAssets.emotions} @> ${JSON.stringify([emotion])}`)
      .orderBy(desc(visualAssets.usageCount))
      .limit(limit);
  }

  /**
   * Get assets by multiple tags
   */
  async findByTags(tags: string[], matchAll = false, limit = 20): Promise<typeof visualAssets.$inferSelect[]> {
    const operator = matchAll ? '@>' : '&&'; // Contains all vs overlaps
    
    return this.db
      .select()
      .from(visualAssets)
      .where(sql`${visualAssets.tags} ${sql.raw(operator)} ${JSON.stringify(tags)}`)
      .orderBy(desc(visualAssets.usageCount))
      .limit(limit);
  }

  /**
   * Increment usage count for asset
   */
  async incrementUsage(id: string): Promise<void> {
    await this.db
      .update(visualAssets)
      .set({
        usageCount: sql`${visualAssets.usageCount} + 1`
      })
      .where(eq(visualAssets.id, id));
  }

  /**
   * Update engagement metrics for asset
   */
  async updateEngagement(id: string, engagementRate: number): Promise<void> {
    // Calculate new average (simple moving average)
    const [current] = await this.db
      .select({ 
        avgEngagement: visualAssets.avgEngagement,
        usageCount: visualAssets.usageCount 
      })
      .from(visualAssets)
      .where(eq(visualAssets.id, id));

    if (current) {
      const currentAvg = Number(current.avgEngagement) || 0;
      const count = current.usageCount || 1;
      const newAvg = (currentAvg * (count - 1) + engagementRate) / count;

      await this.db
        .update(visualAssets)
        .set({
          avgEngagement: newAvg.toString()
        })
        .where(eq(visualAssets.id, id));
    }
  }

  /**
   * Get asset statistics
   */
  async getStatistics(): Promise<{
    totalAssets: number;
    assetsByType: Array<{ type: string; count: number }>;
    assetsByCategory: Array<{ category: string; count: number }>;
    assetsByUsageRights: Array<{ usageRights: string; count: number }>;
    topTags: Array<{ tag: string; count: number }>;
    topPetTypes: Array<{ petType: string; count: number }>;
    topEmotions: Array<{ emotion: string; count: number }>;
  }> {
    // Get total count
    const [{ totalAssets }] = await this.db
      .select({ totalAssets: sql<number>`count(*)` })
      .from(visualAssets);

    // Get counts by type
    const assetsByType = await this.db
      .select({
        type: visualAssets.type,
        count: sql<number>`count(*)`
      })
      .from(visualAssets)
      .groupBy(visualAssets.type)
      .orderBy(sql`count(*) DESC`);

    // Get counts by category
    const assetsByCategory = await this.db
      .select({
        category: visualAssets.category,
        count: sql<number>`count(*)`
      })
      .from(visualAssets)
      .groupBy(visualAssets.category)
      .orderBy(sql`count(*) DESC`)
      .limit(10);

    // Get counts by usage rights
    const assetsByUsageRights = await this.db
      .select({
        usageRights: visualAssets.usageRights,
        count: sql<number>`count(*)`
      })
      .from(visualAssets)
      .groupBy(visualAssets.usageRights)
      .orderBy(sql`count(*) DESC`);

    // Get top tags, pet types, and emotions
    const [topTags, topPetTypes, topEmotions] = await Promise.all([
      this.db
        .select({
          tag: sql<string>`unnest(${visualAssets.tags})`,
          count: sql<number>`count(*)`
        })
        .from(visualAssets)
        .groupBy(sql`unnest(${visualAssets.tags})`)
        .orderBy(sql`count(*) DESC`)
        .limit(20),
      
      this.db
        .select({
          petType: sql<string>`unnest(${visualAssets.petTypes})`,
          count: sql<number>`count(*)`
        })
        .from(visualAssets)
        .groupBy(sql`unnest(${visualAssets.petTypes})`)
        .orderBy(sql`count(*) DESC`)
        .limit(10),
      
      this.db
        .select({
          emotion: sql<string>`unnest(${visualAssets.emotions})`,
          count: sql<number>`count(*)`
        })
        .from(visualAssets)
        .groupBy(sql`unnest(${visualAssets.emotions})`)
        .orderBy(sql`count(*) DESC`)
        .limit(10)
    ]);

    return {
      totalAssets: Number(totalAssets),
      assetsByType: assetsByType.map(item => ({ 
        type: item.type, 
        count: Number(item.count) 
      })),
      assetsByCategory: assetsByCategory.map(item => ({ 
        category: item.category, 
        count: Number(item.count) 
      })),
      assetsByUsageRights: assetsByUsageRights.map(item => ({ 
        usageRights: item.usageRights, 
        count: Number(item.count) 
      })),
      topTags: topTags.map(item => ({ 
        tag: item.tag, 
        count: Number(item.count) 
      })),
      topPetTypes: topPetTypes.map(item => ({ 
        petType: item.petType, 
        count: Number(item.count) 
      })),
      topEmotions: topEmotions.map(item => ({ 
        emotion: item.emotion, 
        count: Number(item.count) 
      }))
    };
  }

  /**
   * Get related assets based on tags, pet types, and emotions
   */
  async findRelated(assetId: string, limit = 12): Promise<typeof visualAssets.$inferSelect[]> {
    const [baseAsset] = await this.db
      .select()
      .from(visualAssets)
      .where(eq(visualAssets.id, assetId))
      .limit(1);

    if (!baseAsset) return [];

    const baseTags = baseAsset.tags || [];
    const basePetTypes = baseAsset.petTypes || [];
    const baseEmotions = baseAsset.emotions || [];

    return this.db
      .select()
      .from(visualAssets)
      .where(
        and(
          sql`${visualAssets.id} != ${assetId}`, // Exclude the base asset
          or(
            // Match by tags
            sql`${visualAssets.tags} && ${JSON.stringify(baseTags)}`,
            // Match by pet types
            sql`${visualAssets.petTypes} && ${JSON.stringify(basePetTypes)}`,
            // Match by emotions
            sql`${visualAssets.emotions} && ${JSON.stringify(baseEmotions)}`,
            // Match by category
            eq(visualAssets.category, baseAsset.category)
          )
        )
      )
      .orderBy(
        // Score by overlap relevance + usage popularity
        sql`(
          CASE WHEN ${visualAssets.tags} && ${JSON.stringify(baseTags)} THEN 3 ELSE 0 END +
          CASE WHEN ${visualAssets.petTypes} && ${JSON.stringify(basePetTypes)} THEN 2 ELSE 0 END +
          CASE WHEN ${visualAssets.emotions} && ${JSON.stringify(baseEmotions)} THEN 1 ELSE 0 END +
          CASE WHEN ${visualAssets.category} = ${baseAsset.category} THEN 1 ELSE 0 END
        ) DESC`,
        desc(visualAssets.usageCount)
      )
      .limit(limit);
  }

  /**
   * Bulk update assets
   */
  async bulkUpdate(assetIds: string[], data: Partial<VisualAssetUpdate>): Promise<number> {
    if (assetIds.length === 0) return 0;

    const result = await this.db
      .update(visualAssets)
      .set(data)
      .where(inArray(visualAssets.id, assetIds));

    return result.length;
  }

  /**
   * Get assets that need optimization (large file sizes, missing metadata, etc.)
   */
  async findNeedingOptimization(): Promise<Array<typeof visualAssets.$inferSelect & { issue: string }>> {
    const largeSizeThreshold = 5 * 1024 * 1024; // 5MB
    
    const largeAssets = await this.db
      .select()
      .from(visualAssets)
      .where(sql`${visualAssets.fileSize} > ${largeSizeThreshold}`);

    const missingDimensions = await this.db
      .select()
      .from(visualAssets)
      .where(sql`${visualAssets.dimensions} IS NULL`);

    const missingTags = await this.db
      .select()
      .from(visualAssets)
      .where(sql`array_length(${visualAssets.tags}, 1) IS NULL OR array_length(${visualAssets.tags}, 1) < 3`);

    return [
      ...largeAssets.map(asset => ({ ...asset, issue: 'Large file size' })),
      ...missingDimensions.map(asset => ({ ...asset, issue: 'Missing dimensions' })),
      ...missingTags.map(asset => ({ ...asset, issue: 'Insufficient tags' }))
    ];
  }
}