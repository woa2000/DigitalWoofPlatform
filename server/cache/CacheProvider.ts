import Redis from 'ioredis';

/**
 * Cache Provider Interface & Implementation
 * 
 * Sistema de cache híbrido L1 (memória) + L2 (Redis) para otimização de performance
 */

export interface CacheProvider {
  get<T>(key: string): Promise<T | null>;
  set<T>(key: string, value: T, ttl?: number): Promise<void>;
  delete(key: string): Promise<void>;
  clear(pattern?: string): Promise<void>;
  getStats(): Promise<CacheStats>;
}

export interface CacheStats {
  hitRate: number;
  missRate: number;
  totalRequests: number;
  totalHits: number;
  totalMisses: number;
  memoryUsage: number;
  keyCount: number;
}

export interface CacheConfig {
  defaultTTL: number;
  maxMemoryKeys: number;
  redisUrl?: string;
  enableL1: boolean;
  enableL2: boolean;
  keyPrefix: string;
}

/**
 * Hybrid Cache Implementation (L1 Memory + L2 Redis)
 */
export class HybridCacheProvider implements CacheProvider {
  private l1Cache = new Map<string, { value: any; expires: number }>();
  private l2Cache: Redis | null = null;
  private config: CacheConfig;
  private stats = {
    hitRate: 0,
    missRate: 0,
    totalRequests: 0,
    totalHits: 0,
    totalMisses: 0,
    memoryUsage: 0,
    keyCount: 0
  };

  constructor(config: CacheConfig) {
    this.config = config;
    this.initializeL2Cache();
    this.startStatisticsUpdater();
  }

  private initializeL2Cache(): void {
    if (this.config.enableL2 && this.config.redisUrl) {
      try {
        this.l2Cache = new Redis(this.config.redisUrl, {
          maxRetriesPerRequest: 3,
          connectTimeout: 10000,
        });
        console.log('L2 Cache (Redis) initialized');
      } catch (error) {
        console.warn('L2 Cache initialization failed, using L1 only:', error);
        this.l2Cache = null;
      }
    }
  }

  async get<T>(key: string): Promise<T | null> {
    this.stats.totalRequests++;
    const prefixedKey = `${this.config.keyPrefix}:${key}`;

    // Try L1 Cache first
    if (this.config.enableL1) {
      const l1Result = this.getFromL1<T>(prefixedKey);
      if (l1Result !== null) {
        this.stats.totalHits++;
        return l1Result;
      }
    }

    // Try L2 Cache (Redis)
    if (this.config.enableL2 && this.l2Cache) {
      try {
        const l2Result = await this.getFromL2<T>(prefixedKey);
        if (l2Result !== null) {
          // Populate L1 cache for faster future access
          if (this.config.enableL1) {
            this.setToL1(prefixedKey, l2Result, this.config.defaultTTL);
          }
          this.stats.totalHits++;
          return l2Result;
        }
      } catch (error) {
        console.warn('L2 Cache read failed:', error);
      }
    }

    this.stats.totalMisses++;
    return null;
  }

  async set<T>(key: string, value: T, ttl = this.config.defaultTTL): Promise<void> {
    const prefixedKey = `${this.config.keyPrefix}:${key}`;

    // Set in L1 Cache
    if (this.config.enableL1) {
      this.setToL1(prefixedKey, value, ttl);
    }

    // Set in L2 Cache
    if (this.config.enableL2 && this.l2Cache) {
      try {
        await this.setToL2(prefixedKey, value, ttl);
      } catch (error) {
        console.warn('L2 Cache write failed:', error);
      }
    }
  }

  async delete(key: string): Promise<void> {
    const prefixedKey = `${this.config.keyPrefix}:${key}`;

    // Delete from L1
    if (this.config.enableL1) {
      this.l1Cache.delete(prefixedKey);
    }

    // Delete from L2
    if (this.config.enableL2 && this.l2Cache) {
      try {
        await this.l2Cache.del(prefixedKey);
      } catch (error) {
        console.warn('L2 Cache delete failed:', error);
      }
    }
  }

  async clear(pattern?: string): Promise<void> {
    if (pattern) {
      const regex = new RegExp(pattern);
      
      // Clear L1 with pattern
      if (this.config.enableL1) {
        Array.from(this.l1Cache.keys()).forEach(key => {
          if (regex.test(key)) {
            this.l1Cache.delete(key);
          }
        });
      }

      // Clear L2 with pattern
      if (this.config.enableL2 && this.l2Cache) {
        try {
          const keys = await this.l2Cache.keys(`${this.config.keyPrefix}:*`);
          const matchingKeys = keys.filter((key: string) => regex.test(key));
          if (matchingKeys.length > 0) {
            await this.l2Cache.del(...matchingKeys);
          }
        } catch (error) {
          console.warn('L2 Cache pattern clear failed:', error);
        }
      }
    } else {
      // Clear all
      if (this.config.enableL1) {
        this.l1Cache.clear();
      }
      if (this.config.enableL2 && this.l2Cache) {
        try {
          await this.l2Cache.flushdb();
        } catch (error) {
          console.warn('L2 Cache clear failed:', error);
        }
      }
    }
  }

  async getStats(): Promise<CacheStats> {
    this.updateStats();
    return { ...this.stats };
  }

  private getFromL1<T>(key: string): T | null {
    const cached = this.l1Cache.get(key);
    if (cached && cached.expires > Date.now()) {
      return cached.value;
    }
    if (cached) {
      this.l1Cache.delete(key);
    }
    return null;
  }

  private setToL1<T>(key: string, value: T, ttl: number): void {
    // Evict oldest items if we're at capacity
    if (this.l1Cache.size >= this.config.maxMemoryKeys) {
      const oldestKey = this.l1Cache.keys().next().value;
      if (oldestKey) {
        this.l1Cache.delete(oldestKey);
      }
    }

    this.l1Cache.set(key, {
      value,
      expires: Date.now() + (ttl * 1000)
    });
  }

  private async getFromL2<T>(key: string): Promise<T | null> {
    if (!this.l2Cache) return null;
    
    try {
      const result = await this.l2Cache.get(key);
      return result ? JSON.parse(result) : null;
    } catch (error) {
      console.warn('L2 Cache parse error:', error);
      return null;
    }
  }

  private async setToL2<T>(key: string, value: T, ttl: number): Promise<void> {
    if (!this.l2Cache) return;
    
    try {
      await this.l2Cache.setex(key, ttl, JSON.stringify(value));
    } catch (error) {
      console.warn('L2 Cache stringify error:', error);
    }
  }

  private updateStats(): void {
    this.stats.hitRate = this.stats.totalRequests > 0 
      ? (this.stats.totalHits / this.stats.totalRequests) * 100 
      : 0;
    this.stats.missRate = this.stats.totalRequests > 0 
      ? (this.stats.totalMisses / this.stats.totalRequests) * 100 
      : 0;
    this.stats.keyCount = this.l1Cache.size;
    this.stats.memoryUsage = this.estimateMemoryUsage();
  }

  private estimateMemoryUsage(): number {
    let size = 0;
    Array.from(this.l1Cache.entries()).forEach(([key, value]) => {
      size += key.length * 2; // UTF-16
      size += JSON.stringify(value).length * 2;
    });
    return size;
  }

  private startStatisticsUpdater(): void {
    setInterval(() => {
      this.updateStats();
    }, 30000); // Update every 30 seconds
  }
}

/**
 * Cache Key Generators
 */
export class CacheKeys {
  static templates = {
    list: (filters: any) => `templates:list:${JSON.stringify(filters)}`,
    detail: (id: string) => `templates:detail:${id}`,
    search: (query: string, filters: any) => `templates:search:${query}:${JSON.stringify(filters)}`,
    popular: () => 'templates:popular',
    recommendations: (id: string) => `templates:recommendations:${id}`,
    personalized: (templateId: string, brandVoiceId: string) => `templates:personalized:${templateId}:${brandVoiceId}`
  };

  static performance = {
    campaigns: (dateRange: string) => `performance:campaigns:${dateRange}`,
    templates: (metric: string) => `performance:templates:${metric}`,
    benchmarks: (category: string) => `performance:benchmarks:${category}`,
    insights: (period: string) => `performance:insights:${period}`
  };

  static assets = {
    list: (filters: any) => `assets:list:${JSON.stringify(filters)}`,
    favorites: (userId: string) => `assets:favorites:${userId}`,
    collections: (userId: string) => `assets:collections:${userId}`
  };
}

/**
 * Cache Middleware for Express
 */
export function cacheMiddleware(cache: CacheProvider, keyGenerator: (req: any) => string, ttl = 300) {
  return async (req: any, res: any, next: any) => {
    const cacheKey = keyGenerator(req);
    
    try {
      const cached = await cache.get(cacheKey);
      if (cached) {
        res.set('X-Cache', 'HIT');
        res.set('X-Cache-Key', cacheKey);
        return res.json(cached);
      }

      // Override res.json to cache the response
      const originalJson = res.json;
      res.json = function(body: any) {
        // Cache successful responses only
        if (res.statusCode >= 200 && res.statusCode < 300) {
          cache.set(cacheKey, body, ttl).catch(error => {
            console.warn('Cache set failed:', error);
          });
        }
        
        res.set('X-Cache', 'MISS');
        res.set('X-Cache-Key', cacheKey);
        return originalJson.call(this, body);
      };

      next();
    } catch (error) {
      console.warn('Cache middleware error:', error);
      next();
    }
  };
}