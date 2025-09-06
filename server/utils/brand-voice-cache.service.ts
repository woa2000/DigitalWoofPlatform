import { BrandVoice, BrandVoiceCreate } from '../../shared/schemas/brand-voice';
import { logger } from '../utils/logger';
import { defaultsConfig } from '../../config/brand-voice-defaults.config';

/**
 * Advanced Cache Strategy for Brand Voice System
 * Provides intelligent caching with TTL, LRU eviction, and performance monitoring
 */

export interface CacheEntry<T> {
  data: T;
  createdAt: number;
  lastAccessed: number;
  accessCount: number;
  ttl: number;
  tags: string[];
  version: string;
}

export interface CacheMetrics {
  hits: number;
  misses: number;
  hitRate: number;
  totalOperations: number;
  averageRetrievalTime: number;
  memoryUsage: number;
  evictions: number;
  expiredEntries: number;
}

export interface CacheConfiguration {
  maxSize: number;
  defaultTTL: number; // seconds
  cleanupInterval: number; // seconds
  enableMetrics: boolean;
  enableCompression: boolean;
  persistToDisk: boolean;
  diskCachePath?: string;
}

export class BrandVoiceCacheService {
  private cache = new Map<string, CacheEntry<any>>();
  private metrics: CacheMetrics = {
    hits: 0,
    misses: 0,
    hitRate: 0,
    totalOperations: 0,
    averageRetrievalTime: 0,
    memoryUsage: 0,
    evictions: 0,
    expiredEntries: 0
  };
  
  private config: CacheConfiguration;
  private cleanupTimer?: NodeJS.Timeout;
  private performanceTimer = new Map<string, number>();

  constructor(config?: Partial<CacheConfiguration>) {
    this.config = {
      maxSize: 1000,
      defaultTTL: 300, // 5 minutes
      cleanupInterval: 60, // 1 minute
      enableMetrics: true,
      enableCompression: false,
      persistToDisk: false,
      ...config
    };

    // Apply configuration from defaults config
    if (defaultsConfig.isCacheEnabled()) {
      this.config.defaultTTL = defaultsConfig.getCacheTTL();
    }

    this.startCleanupTimer();
    logger.info('Brand Voice Cache Service initialized', {
      config: this.config,
      maxSize: this.config.maxSize,
      defaultTTL: this.config.defaultTTL
    });
  }

  /**
   * Get item from cache with performance tracking
   */
  async get<T>(key: string, options?: { updateAccess?: boolean }): Promise<T | null> {
    const startTime = Date.now();
    const { updateAccess = true } = options || {};

    try {
      const entry = this.cache.get(key);
      
      if (!entry) {
        this.recordMiss();
        return null;
      }

      // Check if expired
      if (this.isExpired(entry)) {
        this.cache.delete(key);
        this.metrics.expiredEntries++;
        this.recordMiss();
        return null;
      }

      // Update access info if requested
      if (updateAccess) {
        entry.lastAccessed = Date.now();
        entry.accessCount++;
      }

      this.recordHit();
      this.recordRetrievalTime(Date.now() - startTime);

      logger.debug('Cache hit', {
        key,
        accessCount: entry.accessCount,
        age: Date.now() - entry.createdAt,
        ttl: entry.ttl
      });

      return entry.data as T;
    } catch (error) {
      logger.error(`Cache get error for key ${key}: ${error}`);
      this.recordMiss();
      return null;
    }
  }

  /**
   * Set item in cache with automatic eviction
   */
  async set<T>(
    key: string, 
    data: T, 
    options?: { 
      ttl?: number; 
      tags?: string[]; 
      version?: string;
      priority?: 'low' | 'normal' | 'high';
    }
  ): Promise<void> {
    const { ttl = this.config.defaultTTL, tags = [], version = '1.0', priority = 'normal' } = options || {};

    try {
      // Check if we need to evict
      if (this.cache.size >= this.config.maxSize) {
        this.evictLeastRecentlyUsed();
      }

      const entry: CacheEntry<T> = {
        data,
        createdAt: Date.now(),
        lastAccessed: Date.now(),
        accessCount: 0,
        ttl: ttl * 1000, // Convert to milliseconds
        tags,
        version
      };

      this.cache.set(key, entry);
      this.updateMemoryUsage();

      logger.debug('Cache set', {
        key,
        ttl,
        tags,
        version,
        priority,
        cacheSize: this.cache.size
      });

    } catch (error) {
      logger.error(`Cache set error for key ${key}: ${error}`);
      throw error;
    }
  }

  /**
   * Remove item from cache
   */
  async delete(key: string): Promise<boolean> {
    const deleted = this.cache.delete(key);
    if (deleted) {
      this.updateMemoryUsage();
      logger.debug('Cache delete', { key });
    }
    return deleted;
  }

  /**
   * Clear all cache entries
   */
  async clear(): Promise<void> {
    const size = this.cache.size;
    this.cache.clear();
    this.updateMemoryUsage();
    logger.info('Cache cleared', { previousSize: size });
  }

  /**
   * Invalidate cache entries by tags
   */
  async invalidateByTags(tags: string[]): Promise<number> {
    let invalidated = 0;
    
    for (const [key, entry] of Array.from(this.cache.entries())) {
      if (tags.some(tag => entry.tags.includes(tag))) {
        this.cache.delete(key);
        invalidated++;
      }
    }

    this.updateMemoryUsage();
    logger.info('Cache invalidated by tags', { tags, invalidated });
    return invalidated;
  }

  /**
   * Invalidate cache entries by key pattern
   */
  async invalidateByPattern(pattern: string | RegExp): Promise<number> {
    let invalidated = 0;
    const regex = typeof pattern === 'string' ? new RegExp(pattern) : pattern;
    
    for (const key of Array.from(this.cache.keys())) {
      if (regex.test(key)) {
        this.cache.delete(key);
        invalidated++;
      }
    }

    this.updateMemoryUsage();
    logger.info('Cache invalidated by pattern', { pattern: pattern.toString(), invalidated });
    return invalidated;
  }

  /**
   * Get cache statistics
   */
  getMetrics(): CacheMetrics {
    this.updateMemoryUsage();
    return { ...this.metrics };
  }

  /**
   * Get cache configuration
   */
  getConfiguration(): CacheConfiguration {
    return { ...this.config };
  }

  /**
   * Update cache configuration
   */
  updateConfiguration(newConfig: Partial<CacheConfiguration>): void {
    this.config = { ...this.config, ...newConfig };
    
    // Restart cleanup timer if interval changed
    if (newConfig.cleanupInterval) {
      this.stopCleanupTimer();
      this.startCleanupTimer();
    }

    logger.info('Cache configuration updated', { newConfig: this.config });
  }

  /**
   * Preload data into cache
   */
  async preload<T>(entries: Array<{ key: string; data: T; options?: any }>): Promise<void> {
    logger.info('Starting cache preload', { entryCount: entries.length });
    
    for (const entry of entries) {
      await this.set(entry.key, entry.data, entry.options);
    }
    
    logger.info('Cache preload completed', { 
      loaded: entries.length,
      totalSize: this.cache.size 
    });
  }

  /**
   * Get cache health status
   */
  getHealthStatus(): {
    status: 'healthy' | 'warning' | 'critical';
    issues: string[];
    recommendations: string[];
  } {
    const health: {
      status: 'healthy' | 'warning' | 'critical';
      issues: string[];
      recommendations: string[];
    } = {
      status: 'healthy',
      issues: [],
      recommendations: []
    };

    // Check hit rate
    if (this.metrics.hitRate < 0.7) {
      health.status = 'warning';
      health.issues.push(`Low hit rate: ${(this.metrics.hitRate * 100).toFixed(1)}%`);
      health.recommendations.push('Consider increasing TTL or reviewing cache keys');
    }

    // Check memory usage
    if (this.cache.size > this.config.maxSize * 0.9) {
      health.status = 'warning';
      health.issues.push(`High memory usage: ${this.cache.size}/${this.config.maxSize}`);
      health.recommendations.push('Consider increasing maxSize or reducing TTL');
    }

    // Check eviction rate
    const evictionRate = this.metrics.evictions / Math.max(this.metrics.totalOperations, 1);
    if (evictionRate > 0.1) {
      health.status = 'warning';
      health.issues.push(`High eviction rate: ${(evictionRate * 100).toFixed(1)}%`);
      health.recommendations.push('Consider increasing cache size');
    }

    if (health.issues.length > 2) {
      health.status = 'critical';
    }

    return health;
  }

  /**
   * Export cache data for backup
   */
  async exportCache(): Promise<string> {
    const exportData = {
      timestamp: new Date().toISOString(),
      config: this.config,
      metrics: this.metrics,
      entries: Array.from(this.cache.entries()).map(([key, entry]) => ({
        key,
        ...entry,
        data: JSON.stringify(entry.data)
      }))
    };

    return JSON.stringify(exportData, null, 2);
  }

  /**
   * Import cache data from backup
   */
  async importCache(data: string): Promise<void> {
    try {
      const importData = JSON.parse(data);
      
      this.cache.clear();
      
      for (const entry of importData.entries) {
        if (!this.isExpired({ ...entry, data: JSON.parse(entry.data) })) {
          this.cache.set(entry.key, {
            ...entry,
            data: JSON.parse(entry.data)
          });
        }
      }

      this.updateMemoryUsage();
      logger.info('Cache imported successfully', { 
        importedEntries: importData.entries.length,
        activeEntries: this.cache.size 
      });

    } catch (error) {
      logger.error(`Cache import failed: ${error}`);
      throw new Error(`Cache import failed: ${error}`);
    }
  }

  // Private methods

  private isExpired(entry: CacheEntry<any>): boolean {
    return Date.now() - entry.createdAt > entry.ttl;
  }

  private evictLeastRecentlyUsed(): void {
    let oldestKey: string | null = null;
    let oldestTime = Date.now();

    for (const [key, entry] of Array.from(this.cache.entries())) {
      if (entry.lastAccessed < oldestTime) {
        oldestTime = entry.lastAccessed;
        oldestKey = key;
      }
    }

    if (oldestKey) {
      this.cache.delete(oldestKey);
      this.metrics.evictions++;
      logger.debug('Evicted LRU entry', { key: oldestKey });
    }
  }

  private recordHit(): void {
    this.metrics.hits++;
    this.metrics.totalOperations++;
    this.updateHitRate();
  }

  private recordMiss(): void {
    this.metrics.misses++;
    this.metrics.totalOperations++;
    this.updateHitRate();
  }

  private updateHitRate(): void {
    this.metrics.hitRate = this.metrics.totalOperations > 0 
      ? this.metrics.hits / this.metrics.totalOperations 
      : 0;
  }

  private recordRetrievalTime(time: number): void {
    const total = this.metrics.averageRetrievalTime * this.metrics.hits;
    this.metrics.averageRetrievalTime = (total + time) / this.metrics.hits;
  }

  private updateMemoryUsage(): void {
    // Rough estimate of memory usage
    this.metrics.memoryUsage = this.cache.size * 1024; // Assume 1KB per entry average
  }

  private startCleanupTimer(): void {
    this.cleanupTimer = setInterval(() => {
      this.cleanup();
    }, this.config.cleanupInterval * 1000);
  }

  private stopCleanupTimer(): void {
    if (this.cleanupTimer) {
      clearInterval(this.cleanupTimer);
      this.cleanupTimer = undefined;
    }
  }

  private cleanup(): void {
    let cleaned = 0;
    
    for (const [key, entry] of Array.from(this.cache.entries())) {
      if (this.isExpired(entry)) {
        this.cache.delete(key);
        cleaned++;
        this.metrics.expiredEntries++;
      }
    }

    if (cleaned > 0) {
      this.updateMemoryUsage();
      logger.debug('Cache cleanup completed', { cleaned, remaining: this.cache.size });
    }
  }

  /**
   * Cleanup resources
   */
  destroy(): void {
    this.stopCleanupTimer();
    this.cache.clear();
    logger.info('Brand Voice Cache Service destroyed');
  }
}

// Specialized cache managers for different Brand Voice entities

export class BrandVoiceActiveCacheManager {
  constructor(private cacheService: BrandVoiceCacheService) {}

  async getActiveBrandVoice(userId: string): Promise<BrandVoice | null> {
    const key = `brand-voice:active:${userId}`;
    return this.cacheService.get<BrandVoice>(key);
  }

  async setActiveBrandVoice(userId: string, brandVoice: BrandVoice): Promise<void> {
    const key = `brand-voice:active:${userId}`;
    await this.cacheService.set(key, brandVoice, {
      ttl: 300, // 5 minutes
      tags: ['brand-voice', 'active', `user:${userId}`],
      version: brandVoice.version
    });
  }

  async invalidateUserCache(userId: string): Promise<void> {
    await this.cacheService.invalidateByTags([`user:${userId}`]);
  }
}

export class BrandVoiceDefaultsCacheManager {
  constructor(private cacheService: BrandVoiceCacheService) {}

  async getSegmentDefaults(segment: BrandVoice['brand']['segment']): Promise<Partial<BrandVoiceCreate> | null> {
    const key = `brand-voice:defaults:${segment}`;
    return this.cacheService.get<Partial<BrandVoiceCreate>>(key);
  }

  async setSegmentDefaults(segment: BrandVoice['brand']['segment'], defaults: Partial<BrandVoiceCreate>): Promise<void> {
    const key = `brand-voice:defaults:${segment}`;
    await this.cacheService.set(key, defaults, {
      ttl: 3600, // 1 hour - defaults change less frequently
      tags: ['brand-voice', 'defaults', segment],
      version: defaults.version || '1.0'
    });
  }

  async invalidateAllDefaults(): Promise<void> {
    await this.cacheService.invalidateByTags(['defaults']);
  }
}

export class BrandVoiceQualityCacheManager {
  constructor(private cacheService: BrandVoiceCacheService) {}

  async getQualityMetrics(brandVoiceId: string): Promise<any | null> {
    const key = `brand-voice:quality:${brandVoiceId}`;
    return this.cacheService.get(key);
  }

  async setQualityMetrics(brandVoiceId: string, metrics: any): Promise<void> {
    const key = `brand-voice:quality:${brandVoiceId}`;
    await this.cacheService.set(key, metrics, {
      ttl: 1800, // 30 minutes
      tags: ['brand-voice', 'quality', `brand:${brandVoiceId}`]
    });
  }

  async invalidateBrandQuality(brandVoiceId: string): Promise<void> {
    await this.cacheService.invalidateByTags([`brand:${brandVoiceId}`]);
  }
}

// Export singleton instance
export const brandVoiceCache = new BrandVoiceCacheService();
export const activeCacheManager = new BrandVoiceActiveCacheManager(brandVoiceCache);
export const defaultsCacheManager = new BrandVoiceDefaultsCacheManager(brandVoiceCache);
export const qualityCacheManager = new BrandVoiceQualityCacheManager(brandVoiceCache);