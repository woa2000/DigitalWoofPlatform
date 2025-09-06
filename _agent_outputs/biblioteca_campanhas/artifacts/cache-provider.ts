// Cache Provider Interface and Implementation
// Arquivo: server/services/cache/cache-provider.ts

/**
 * Unified Cache Provider Interface
 * Supports both L1 (in-memory) and L2 (Redis) caching strategies
 */

export interface CacheProvider {
  get<T>(key: string): Promise<T | null>;
  set<T>(key: string, value: T, ttlSeconds: number): Promise<void>;
  del(key: string): Promise<void>;
  withSingleFlight<T>(key: string, fn: () => Promise<T>): Promise<T>;
  getStats(): Promise<CacheStats>;
}

export interface CacheStats {
  hits: number;
  misses: number;
  hitRate: number;
  size: number;
  keys: string[];
}

// L1 Cache Implementation (LRU In-Memory)
export class L1CacheProvider implements CacheProvider {
  private cache: Map<string, { value: any; expiresAt: number }>;
  private maxSize: number;
  private stats: { hits: number; misses: number };
  private inflight: Map<string, Promise<any>>;

  constructor(maxSize = 5000) {
    this.cache = new Map();
    this.maxSize = maxSize;
    this.stats = { hits: 0, misses: 0 };
    this.inflight = new Map();
  }

  async get<T>(key: string): Promise<T | null> {
    const entry = this.cache.get(key);
    
    if (!entry) {
      this.stats.misses++;
      return null;
    }
    
    if (Date.now() > entry.expiresAt) {
      this.cache.delete(key);
      this.stats.misses++;
      return null;
    }
    
    this.stats.hits++;
    return entry.value as T;
  }

  async set<T>(key: string, value: T, ttlSeconds: number): Promise<void> {
    // Implement LRU eviction if at capacity
    if (this.cache.size >= this.maxSize) {
      const oldestKey = this.cache.keys().next().value;
      this.cache.delete(oldestKey);
    }
    
    const expiresAt = Date.now() + (ttlSeconds * 1000);
    this.cache.set(key, { value, expiresAt });
  }

  async del(key: string): Promise<void> {
    this.cache.delete(key);
  }

  async withSingleFlight<T>(key: string, fn: () => Promise<T>): Promise<T> {
    // Check if already in flight
    if (this.inflight.has(key)) {
      return this.inflight.get(key)!;
    }

    // Start new flight
    const promise = fn().finally(() => {
      this.inflight.delete(key);
    });
    
    this.inflight.set(key, promise);
    return promise;
  }

  async getStats(): Promise<CacheStats> {
    const total = this.stats.hits + this.stats.misses;
    return {
      hits: this.stats.hits,
      misses: this.stats.misses,
      hitRate: total > 0 ? this.stats.hits / total : 0,
      size: this.cache.size,
      keys: Array.from(this.cache.keys())
    };
  }
}

// L2 Cache Implementation (Redis)
export class L2CacheProvider implements CacheProvider {
  private redisClient: any; // Redis client type
  private stats: { hits: number; misses: number };

  constructor(redisClient: any) {
    this.redisClient = redisClient;
    this.stats = { hits: 0, misses: 0 };
  }

  async get<T>(key: string): Promise<T | null> {
    try {
      const value = await this.redisClient.get(key);
      
      if (value === null) {
        this.stats.misses++;
        return null;
      }
      
      this.stats.hits++;
      return JSON.parse(value) as T;
    } catch (error) {
      console.error('Redis get error:', error);
      this.stats.misses++;
      return null;
    }
  }

  async set<T>(key: string, value: T, ttlSeconds: number): Promise<void> {
    try {
      await this.redisClient.setex(key, ttlSeconds, JSON.stringify(value));
    } catch (error) {
      console.error('Redis set error:', error);
      // Fail silently for cache errors
    }
  }

  async del(key: string): Promise<void> {
    try {
      await this.redisClient.del(key);
    } catch (error) {
      console.error('Redis del error:', error);
    }
  }

  async withSingleFlight<T>(key: string, fn: () => Promise<T>): Promise<T> {
    // Redis-based single flight using SET NX
    const lockKey = `lock:${key}`;
    const lockValue = Date.now().toString();
    
    try {
      const acquired = await this.redisClient.set(lockKey, lockValue, 'PX', 5000, 'NX');
      
      if (acquired) {
        try {
          const result = await fn();
          return result;
        } finally {
          // Release lock
          await this.redisClient.del(lockKey);
        }
      } else {
        // Wait for other process to complete
        await new Promise(resolve => setTimeout(resolve, 100));
        return await this.get(key) || await fn();
      }
    } catch (error) {
      // Fallback to direct execution
      return await fn();
    }
  }

  async getStats(): Promise<CacheStats> {
    try {
      const info = await this.redisClient.info('keyspace');
      const total = this.stats.hits + this.stats.misses;
      
      return {
        hits: this.stats.hits,
        misses: this.stats.misses,
        hitRate: total > 0 ? this.stats.hits / total : 0,
        size: 0, // Would need separate tracking
        keys: [] // Would need separate SCAN operation
      };
    } catch (error) {
      return {
        hits: this.stats.hits,
        misses: this.stats.misses,
        hitRate: 0,
        size: 0,
        keys: []
      };
    }
  }
}

// Hybrid Cache (L1 + L2)
export class HybridCacheProvider implements CacheProvider {
  private l1: L1CacheProvider;
  private l2: L2CacheProvider;

  constructor(l1: L1CacheProvider, l2: L2CacheProvider) {
    this.l1 = l1;
    this.l2 = l2;
  }

  async get<T>(key: string): Promise<T | null> {
    // Try L1 first
    let value = await this.l1.get<T>(key);
    if (value !== null) {
      return value;
    }

    // Try L2 
    value = await this.l2.get<T>(key);
    if (value !== null) {
      // Warm L1 cache
      await this.l1.set(key, value, 900); // 15 min TTL for L1
      return value;
    }

    return null;
  }

  async set<T>(key: string, value: T, ttlSeconds: number): Promise<void> {
    // Set in both L1 and L2
    await Promise.all([
      this.l1.set(key, value, Math.min(ttlSeconds, 900)), // Max 15 min for L1
      this.l2.set(key, value, ttlSeconds) // Full TTL for L2
    ]);
  }

  async del(key: string): Promise<void> {
    // Delete from both layers
    await Promise.all([
      this.l1.del(key),
      this.l2.del(key)
    ]);
  }

  async withSingleFlight<T>(key: string, fn: () => Promise<T>): Promise<T> {
    // Use L1 single flight for local coordination
    return this.l1.withSingleFlight(key, async () => {
      // Check L2 first
      const cached = await this.l2.get<T>(key);
      if (cached !== null) {
        // Warm L1
        await this.l1.set(key, cached, 900);
        return cached;
      }
      
      // Execute function and cache result
      const result = await fn();
      await this.set(key, result, 3600); // 1 hour default TTL
      return result;
    });
  }

  async getStats(): Promise<CacheStats> {
    const [l1Stats, l2Stats] = await Promise.all([
      this.l1.getStats(),
      this.l2.getStats()
    ]);

    return {
      hits: l1Stats.hits + l2Stats.hits,
      misses: l1Stats.misses + l2Stats.misses,
      hitRate: (l1Stats.hits + l2Stats.hits) / (l1Stats.hits + l1Stats.misses + l2Stats.hits + l2Stats.misses),
      size: l1Stats.size,
      keys: l1Stats.keys
    };
  }
}

// Cache Key Patterns
export const CacheKeys = {
  templateList: (tenant: string, filters?: string) => 
    `tpl:v1:list:${tenant}${filters ? `:${filters}` : ''}`,
  
  templateById: (tenant: string, id: string) => 
    `tpl:v1:byId:${tenant}:${id}`,
  
  templatePerformance: (templateId: string) => 
    `tpl:v1:perf:${templateId}`,
  
  brandVoice: (id: string) => 
    `bv:v1:${id}`,
    
  personalizedCampaign: (templateId: string, brandVoiceId: string) =>
    `camp:v1:${templateId}:${brandVoiceId}`
} as const;