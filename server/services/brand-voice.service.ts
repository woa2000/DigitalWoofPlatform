import { z } from 'zod';
import { BrandVoice, BrandVoiceSchema, BrandVoiceCreate, BrandVoiceUpdate } from '../../shared/schemas/brand-voice';
import { BrandVoiceQualityService, QualityMetrics } from './brand-voice-quality.service';
import { logger } from '../utils/logger';
import { db } from '../utils/brand-voice-database';

// CRUD operation results
export const brandVoiceResultSchema = z.object({
  id: z.string().uuid(),
  brandVoice: BrandVoiceSchema,
  qualityMetrics: z.object({
    overall: z.number().min(0).max(1),
    completeness: z.number().min(0).max(1),
    consistency: z.number().min(0).max(1),
    specificity: z.number().min(0).max(1),
    usability: z.number().min(0).max(1)
  }),
  metadata: z.object({
    isActive: z.boolean(),
    version: z.string(),
    createdAt: z.string(),
    updatedAt: z.string(),
    activatedAt: z.string().optional()
  })
});

export const brandVoiceListSchema = z.object({
  items: z.array(brandVoiceResultSchema),
  pagination: z.object({
    total: z.number(),
    page: z.number(),
    limit: z.number(),
    hasNext: z.boolean(),
    hasPrev: z.boolean()
  }),
  filters: z.object({
    userId: z.string(),
    isActive: z.boolean().optional(),
    minQuality: z.number().optional()
  })
});

export type BrandVoiceResult = z.infer<typeof brandVoiceResultSchema>;
export type BrandVoiceList = z.infer<typeof brandVoiceListSchema>;

// Cache interface
interface CacheEntry {
  data: BrandVoiceResult;
  timestamp: number;
  ttl: number;
}

export class BrandVoiceCRUDService {
  private qualityService: BrandVoiceQualityService;
  private cache = new Map<string, CacheEntry>();
  
  // Cache configuration
  private static readonly CACHE_TTL = 5 * 60 * 1000; // 5 minutes
  private static readonly MAX_CACHE_SIZE = 1000;
  private static readonly QUALITY_THRESHOLD = 0.7;

  constructor() {
    this.qualityService = new BrandVoiceQualityService();
  }

  /**
   * Create a new Brand Voice with quality validation
   */
  async create(
    userId: string,
    brandVoiceData: BrandVoiceCreate,
    options: { 
      skipQualityCheck?: boolean;
      autoActivate?: boolean;
    } = {}
  ): Promise<BrandVoiceResult> {
    const startTime = Date.now();
    
    try {
      logger.info('Creating new Brand Voice', {
        userId,
        brandName: brandVoiceData.brand.name,
        segment: brandVoiceData.brand.segment,
        autoActivate: options.autoActivate
      });

      // Add metadata for complete Brand Voice
      const now = new Date().toISOString();
      const brandVoiceId = crypto.randomUUID();
      
      const completeBrandVoice: BrandVoice = {
        ...brandVoiceData,
        metadata: {
          created_at: now,
          updated_at: now,
          version_history: [
            {
              version: '1.0',
              date: now,
              changes: 'Initial Brand Voice creation',
              created_by: userId
            }
          ],
          source: {
            manual_override: false
          },
          quality_metrics: {
            completeness_score: 0,
            consistency_score: 0,
            specificity_score: 0,
            usability_score: 0,
            last_validated: now
          }
        }
      };

      // Validate schema
      const validatedBrandVoice = BrandVoiceSchema.parse(completeBrandVoice);

      // Calculate quality metrics
      let qualityMetrics: QualityMetrics;
      if (!options.skipQualityCheck) {
        qualityMetrics = await this.qualityService.calculateQualityMetrics(validatedBrandVoice);
        
        // Update metadata with calculated metrics
        validatedBrandVoice.metadata.quality_metrics = {
          completeness_score: qualityMetrics.completeness,
          consistency_score: qualityMetrics.consistency,
          specificity_score: qualityMetrics.specificity,
          usability_score: qualityMetrics.usability,
          last_validated: qualityMetrics.calculated_at
        };

        // Check quality threshold
        if (qualityMetrics.overall < BrandVoiceCRUDService.QUALITY_THRESHOLD) {
          logger.warn('Brand Voice quality below threshold', {
            userId,
            brandVoiceId,
            qualityScore: qualityMetrics.overall,
            threshold: BrandVoiceCRUDService.QUALITY_THRESHOLD
          });
        }
      } else {
        // Mock quality metrics if skipped
        qualityMetrics = {
          overall: 0.8,
          completeness: 0.8,
          consistency: 0.8,
          specificity: 0.8,
          usability: 0.8,
          details: {
            completeness: { filled_fields: 0, total_fields: 0, missing_critical: [], missing_optional: [] },
            consistency: { tone_conflicts: [], voice_mismatches: [], compliance_contradictions: [], severity_score: 0.8 },
            specificity: { generic_phrases: [], industry_relevance: 0.8, brand_uniqueness: 0.8, actionability: 0.8 },
            usability: { content_generation_readiness: 0.8, ai_prompt_clarity: 0.8, template_compatibility: 0.8, user_guidance_quality: 0.8 }
          },
          recommendations: [],
          calculated_at: now,
          calculation_time_ms: 0
        };
      }

      // Save to database
      const isActive = options.autoActivate || false;
      if (isActive) {
        // Deactivate any existing active Brand Voice for this user
        await this.deactivateExisting(userId);
      }

      await db.brandVoices.create({
        id: brandVoiceId,
        userId,
        brandVoice: validatedBrandVoice,
        qualityScore: qualityMetrics.overall,
        isActive,
        version: '1.0',
        activatedAt: isActive ? now : null
      });

      // Build result
      const result: BrandVoiceResult = {
        id: brandVoiceId,
        brandVoice: validatedBrandVoice,
        qualityMetrics: {
          overall: qualityMetrics.overall,
          completeness: qualityMetrics.completeness,
          consistency: qualityMetrics.consistency,
          specificity: qualityMetrics.specificity,
          usability: qualityMetrics.usability
        },
        metadata: {
          isActive,
          version: '1.0',
          createdAt: now,
          updatedAt: now,
          activatedAt: isActive ? now : undefined
        }
      };

      // Cache the result
      this.setCache(`${userId}:${brandVoiceId}`, result);
      if (isActive) {
        this.setCache(`${userId}:active`, result);
      }

      const duration = Date.now() - startTime;
      logger.info('Brand Voice created successfully', {
        userId,
        brandVoiceId,
        qualityScore: qualityMetrics.overall,
        isActive,
        duration
      });

      return brandVoiceResultSchema.parse(result);

    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      logger.error('Error creating Brand Voice', error instanceof Error ? error : new Error(errorMessage), {
        userId,
        brandName: brandVoiceData.brand?.name
      });
      throw new Error(`Brand Voice creation failed: ${errorMessage}`);
    }
  }

  /**
   * Get Brand Voice by ID with cache-first retrieval
   */
  async getById(userId: string, brandVoiceId: string): Promise<BrandVoiceResult | null> {
    const startTime = Date.now();
    
    try {
      // Check cache first
      const cacheKey = `${userId}:${brandVoiceId}`;
      const cached = this.getCache(cacheKey);
      if (cached) {
        const duration = Date.now() - startTime;
        logger.debug('Brand Voice retrieved from cache', {
          userId,
          brandVoiceId,
          duration,
          cacheHit: true
        });
        return cached;
      }

      // Retrieve from database
      const dbResult = await db.brandVoices.findById(brandVoiceId, userId);
      if (!dbResult) {
        logger.debug('Brand Voice not found', { userId, brandVoiceId });
        return null;
      }

      // Build result
      const result: BrandVoiceResult = {
        id: dbResult.id,
        brandVoice: dbResult.brandVoice,
        qualityMetrics: {
          overall: dbResult.qualityScore,
          completeness: dbResult.brandVoice.metadata.quality_metrics.completeness_score,
          consistency: dbResult.brandVoice.metadata.quality_metrics.consistency_score,
          specificity: dbResult.brandVoice.metadata.quality_metrics.specificity_score,
          usability: dbResult.brandVoice.metadata.quality_metrics.usability_score
        },
        metadata: {
          isActive: dbResult.isActive,
          version: dbResult.version,
          createdAt: dbResult.createdAt,
          updatedAt: dbResult.updatedAt,
          activatedAt: dbResult.activatedAt || undefined
        }
      };

      // Cache the result
      this.setCache(cacheKey, result);

      const duration = Date.now() - startTime;
      logger.info('Brand Voice retrieved from database', {
        userId,
        brandVoiceId,
        duration,
        cacheHit: false
      });

      return brandVoiceResultSchema.parse(result);

    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      logger.error('Error retrieving Brand Voice', error instanceof Error ? error : new Error(errorMessage), {
        userId,
        brandVoiceId
      });
      throw new Error(`Brand Voice retrieval failed: ${errorMessage}`);
    }
  }

  /**
   * Get active Brand Voice for user (optimized)
   */
  async getActive(userId: string): Promise<BrandVoiceResult | null> {
    const startTime = Date.now();
    
    try {
      // Check cache first
      const cacheKey = `${userId}:active`;
      const cached = this.getCache(cacheKey);
      if (cached) {
        const duration = Date.now() - startTime;
        logger.debug('Active Brand Voice retrieved from cache', {
          userId,
          duration,
          cacheHit: true
        });
        return cached;
      }

      // Retrieve from database
      const dbResult = await db.brandVoices.findActive(userId);
      if (!dbResult) {
        logger.debug('No active Brand Voice found', { userId });
        return null;
      }

      // Build result
      const result: BrandVoiceResult = {
        id: dbResult.id,
        brandVoice: dbResult.brandVoice,
        qualityMetrics: {
          overall: dbResult.qualityScore,
          completeness: dbResult.brandVoice.metadata.quality_metrics.completeness_score,
          consistency: dbResult.brandVoice.metadata.quality_metrics.consistency_score,
          specificity: dbResult.brandVoice.metadata.quality_metrics.specificity_score,
          usability: dbResult.brandVoice.metadata.quality_metrics.usability_score
        },
        metadata: {
          isActive: true,
          version: dbResult.version,
          createdAt: dbResult.createdAt,
          updatedAt: dbResult.updatedAt,
          activatedAt: dbResult.activatedAt!
        }
      };

      // Cache the result
      this.setCache(cacheKey, result);
      this.setCache(`${userId}:${dbResult.id}`, result);

      const duration = Date.now() - startTime;
      logger.info('Active Brand Voice retrieved from database', {
        userId,
        brandVoiceId: dbResult.id,
        duration,
        cacheHit: false
      });

      return brandVoiceResultSchema.parse(result);

    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      logger.error('Error retrieving active Brand Voice', error instanceof Error ? error : new Error(errorMessage), {
        userId
      });
      throw new Error(`Active Brand Voice retrieval failed: ${errorMessage}`);
    }
  }

  /**
   * Update Brand Voice with automatic versioning
   */
  async update(
    userId: string,
    brandVoiceId: string,
    updates: BrandVoiceUpdate,
    changeDescription: string
  ): Promise<BrandVoiceResult> {
    const startTime = Date.now();
    
    try {
      logger.info('Updating Brand Voice', {
        userId,
        brandVoiceId,
        changeDescription
      });

      // Get existing Brand Voice
      const existing = await this.getById(userId, brandVoiceId);
      if (!existing) {
        throw new Error('Brand Voice not found');
      }

      // Merge updates with existing data
      const updatedBrandVoice: BrandVoice = {
        ...existing.brandVoice,
        ...updates,
        metadata: {
          ...existing.brandVoice.metadata,
          updated_at: new Date().toISOString(),
          version_history: [
            ...existing.brandVoice.metadata.version_history,
            {
              version: this.getNextVersion(existing.metadata.version),
              date: new Date().toISOString(),
              changes: changeDescription,
              created_by: userId
            }
          ]
        }
      };

      // Validate updated Brand Voice
      const validatedBrandVoice = BrandVoiceSchema.parse(updatedBrandVoice);

      // Recalculate quality metrics
      const qualityMetrics = await this.qualityService.calculateQualityMetrics(validatedBrandVoice);
      
      // Update metadata with new quality metrics
      validatedBrandVoice.metadata.quality_metrics = {
        completeness_score: qualityMetrics.completeness,
        consistency_score: qualityMetrics.consistency,
        specificity_score: qualityMetrics.specificity,
        usability_score: qualityMetrics.usability,
        last_validated: qualityMetrics.calculated_at
      };

      // Update in database
      const newVersion = this.getNextVersion(existing.metadata.version);
      await db.brandVoices.update(brandVoiceId, {
        brandVoice: validatedBrandVoice,
        qualityScore: qualityMetrics.overall,
        version: newVersion,
        updatedAt: validatedBrandVoice.metadata.updated_at
      });

      // Build result
      const result: BrandVoiceResult = {
        id: brandVoiceId,
        brandVoice: validatedBrandVoice,
        qualityMetrics: {
          overall: qualityMetrics.overall,
          completeness: qualityMetrics.completeness,
          consistency: qualityMetrics.consistency,
          specificity: qualityMetrics.specificity,
          usability: qualityMetrics.usability
        },
        metadata: {
          isActive: existing.metadata.isActive,
          version: newVersion,
          createdAt: existing.metadata.createdAt,
          updatedAt: validatedBrandVoice.metadata.updated_at,
          activatedAt: existing.metadata.activatedAt
        }
      };

      // Invalidate and update cache
      this.invalidateCache(`${userId}:${brandVoiceId}`);
      if (existing.metadata.isActive) {
        this.invalidateCache(`${userId}:active`);
        this.setCache(`${userId}:active`, result);
      }
      this.setCache(`${userId}:${brandVoiceId}`, result);

      const duration = Date.now() - startTime;
      logger.info('Brand Voice updated successfully', {
        userId,
        brandVoiceId,
        newVersion,
        qualityScore: qualityMetrics.overall,
        duration
      });

      return brandVoiceResultSchema.parse(result);

    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      logger.error('Error updating Brand Voice', error instanceof Error ? error : new Error(errorMessage), {
        userId,
        brandVoiceId,
        changeDescription
      });
      throw new Error(`Brand Voice update failed: ${errorMessage}`);
    }
  }

  /**
   * Activate a Brand Voice (deactivates others)
   */
  async activate(userId: string, brandVoiceId: string): Promise<BrandVoiceResult> {
    const startTime = Date.now();
    
    try {
      logger.info('Activating Brand Voice', {
        userId,
        brandVoiceId
      });

      // Get Brand Voice to activate
      const brandVoice = await this.getById(userId, brandVoiceId);
      if (!brandVoice) {
        throw new Error('Brand Voice not found');
      }

      // Deactivate existing active Brand Voice
      await this.deactivateExisting(userId);

      // Activate the specified Brand Voice
      const now = new Date().toISOString();
      await db.brandVoices.activate(brandVoiceId, now);

      // Update result
      const result: BrandVoiceResult = {
        ...brandVoice,
        metadata: {
          ...brandVoice.metadata,
          isActive: true,
          activatedAt: now
        }
      };

      // Update cache
      this.invalidateCache(`${userId}:active`);
      this.setCache(`${userId}:active`, result);
      this.setCache(`${userId}:${brandVoiceId}`, result);

      const duration = Date.now() - startTime;
      logger.info('Brand Voice activated successfully', {
        userId,
        brandVoiceId,
        duration
      });

      return brandVoiceResultSchema.parse(result);

    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      logger.error('Error activating Brand Voice', error instanceof Error ? error : new Error(errorMessage), {
        userId,
        brandVoiceId
      });
      throw new Error(`Brand Voice activation failed: ${errorMessage}`);
    }
  }

  /**
   * List Brand Voices with pagination and filtering
   */
  async list(
    userId: string,
    options: {
      page?: number;
      limit?: number;
      isActive?: boolean;
      minQuality?: number;
    } = {}
  ): Promise<BrandVoiceList> {
    const startTime = Date.now();
    
    try {
      const page = options.page || 1;
      const limit = Math.min(options.limit || 10, 50); // Max 50 items per page
      const offset = (page - 1) * limit;

      logger.debug('Listing Brand Voices', {
        userId,
        page,
        limit,
        filters: {
          isActive: options.isActive,
          minQuality: options.minQuality
        }
      });

      // Get from database with filters
      const dbResults = await db.brandVoices.list(userId, {
        offset,
        limit,
        isActive: options.isActive,
        minQuality: options.minQuality
      });

      // Build results
      const items: BrandVoiceResult[] = dbResults.items.map((item: any) => ({
        id: item.id,
        brandVoice: item.brandVoice,
        qualityMetrics: {
          overall: item.qualityScore,
          completeness: item.brandVoice.metadata.quality_metrics.completeness_score,
          consistency: item.brandVoice.metadata.quality_metrics.consistency_score,
          specificity: item.brandVoice.metadata.quality_metrics.specificity_score,
          usability: item.brandVoice.metadata.quality_metrics.usability_score
        },
        metadata: {
          isActive: item.isActive,
          version: item.version,
          createdAt: item.createdAt,
          updatedAt: item.updatedAt,
          activatedAt: item.activatedAt || undefined
        }
      }));

      const result: BrandVoiceList = {
        items,
        pagination: {
          total: dbResults.total,
          page,
          limit,
          hasNext: (page * limit) < dbResults.total,
          hasPrev: page > 1
        },
        filters: {
          userId,
          isActive: options.isActive,
          minQuality: options.minQuality
        }
      };

      const duration = Date.now() - startTime;
      logger.info('Brand Voices listed successfully', {
        userId,
        count: items.length,
        total: dbResults.total,
        duration
      });

      return brandVoiceListSchema.parse(result);

    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      logger.error('Error listing Brand Voices', error instanceof Error ? error : new Error(errorMessage), {
        userId
      });
      throw new Error(`Brand Voice listing failed: ${errorMessage}`);
    }
  }

  /**
   * Delete Brand Voice (soft delete)
   */
  async delete(userId: string, brandVoiceId: string): Promise<void> {
    try {
      logger.info('Deleting Brand Voice', {
        userId,
        brandVoiceId
      });

      const existing = await this.getById(userId, brandVoiceId);
      if (!existing) {
        throw new Error('Brand Voice not found');
      }

      // Soft delete in database
      await db.brandVoices.softDelete(brandVoiceId);

      // Clear cache
      this.invalidateCache(`${userId}:${brandVoiceId}`);
      if (existing.metadata.isActive) {
        this.invalidateCache(`${userId}:active`);
      }

      logger.info('Brand Voice deleted successfully', {
        userId,
        brandVoiceId,
        wasActive: existing.metadata.isActive
      });

    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      logger.error('Error deleting Brand Voice', error instanceof Error ? error : new Error(errorMessage), {
        userId,
        brandVoiceId
      });
      throw new Error(`Brand Voice deletion failed: ${errorMessage}`);
    }
  }

  // Private helper methods

  private async deactivateExisting(userId: string): Promise<void> {
    const existing = await db.brandVoices.findActive(userId);
    if (existing) {
      await db.brandVoices.deactivate(existing.id);
      this.invalidateCache(`${userId}:active`);
      this.invalidateCache(`${userId}:${existing.id}`);
    }
  }

  private getNextVersion(currentVersion: string): string {
    const parts = currentVersion.split('.');
    const major = parseInt(parts[0] || '1');
    const minor = parseInt(parts[1] || '0');
    return `${major}.${minor + 1}`;
  }

  // Cache management

  private setCache(key: string, data: BrandVoiceResult): void {
    // Clean old entries if cache is full
    if (this.cache.size >= BrandVoiceCRUDService.MAX_CACHE_SIZE) {
      this.cleanExpiredCache();
    }

    this.cache.set(key, {
      data,
      timestamp: Date.now(),
      ttl: BrandVoiceCRUDService.CACHE_TTL
    });
  }

  private getCache(key: string): BrandVoiceResult | null {
    const entry = this.cache.get(key);
    if (!entry) return null;

    // Check if expired
    if (Date.now() - entry.timestamp > entry.ttl) {
      this.cache.delete(key);
      return null;
    }

    return entry.data;
  }

  private invalidateCache(key: string): void {
    this.cache.delete(key);
  }

  private cleanExpiredCache(): void {
    const now = Date.now();
    for (const [key, entry] of Array.from(this.cache.entries())) {
      if (now - entry.timestamp > entry.ttl) {
        this.cache.delete(key);
      }
    }
  }

  /**
   * Get cache statistics
   */
  getCacheStats(): {
    size: number;
    maxSize: number;
    hitRate: number;
    expired: number;
  } {
    let expired = 0;
    const now = Date.now();
    
    for (const entry of Array.from(this.cache.values())) {
      if (now - entry.timestamp > entry.ttl) {
        expired++;
      }
    }

    return {
      size: this.cache.size,
      maxSize: BrandVoiceCRUDService.MAX_CACHE_SIZE,
      hitRate: 0, // Would need to track hits/misses for actual calculation
      expired
    };
  }
}