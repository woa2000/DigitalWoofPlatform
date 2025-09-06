/**
 * Mock Database Service for Brand Voice CRUD operations
 * This is a development mock - in production this would use actual database
 */

import { BrandVoice } from '../../shared/schemas/brand-voice';

// Database record interface
export interface BrandVoiceRecord {
  id: string;
  userId: string;
  brandVoice: BrandVoice;
  qualityScore: number;
  isActive: boolean;
  version: string;
  createdAt: string;
  updatedAt: string;
  activatedAt: string | null;
  deletedAt: string | null;
}

// List result interface
export interface BrandVoiceListResult {
  items: BrandVoiceRecord[];
  total: number;
}

// List options interface
export interface BrandVoiceListOptions {
  offset: number;
  limit: number;
  isActive?: boolean;
  minQuality?: number;
}

/**
 * Mock Brand Voice database operations
 */
class BrandVoiceDatabase {
  private records = new Map<string, BrandVoiceRecord>();

  /**
   * Create a new Brand Voice record
   */
  async create(data: {
    id: string;
    userId: string;
    brandVoice: BrandVoice;
    qualityScore: number;
    isActive: boolean;
    version: string;
    activatedAt: string | null;
  }): Promise<BrandVoiceRecord> {
    const now = new Date().toISOString();
    
    const record: BrandVoiceRecord = {
      ...data,
      createdAt: now,
      updatedAt: now,
      deletedAt: null
    };

    this.records.set(data.id, record);
    return record;
  }

  /**
   * Find Brand Voice by ID and user
   */
  async findById(id: string, userId: string): Promise<BrandVoiceRecord | null> {
    const record = this.records.get(id);
    if (!record || record.userId !== userId || record.deletedAt) {
      return null;
    }
    return record;
  }

  /**
   * Find active Brand Voice for user
   */
  async findActive(userId: string): Promise<BrandVoiceRecord | null> {
    for (const record of Array.from(this.records.values())) {
      if (record.userId === userId && record.isActive && !record.deletedAt) {
        return record;
      }
    }
    return null;
  }

  /**
   * Update Brand Voice record
   */
  async update(id: string, updates: {
    brandVoice?: BrandVoice;
    qualityScore?: number;
    version?: string;
    updatedAt?: string;
  }): Promise<BrandVoiceRecord> {
    const record = this.records.get(id);
    if (!record) {
      throw new Error('Brand Voice not found');
    }

    const updatedRecord = {
      ...record,
      ...updates,
      updatedAt: updates.updatedAt || new Date().toISOString()
    };

    this.records.set(id, updatedRecord);
    return updatedRecord;
  }

  /**
   * Activate Brand Voice
   */
  async activate(id: string, activatedAt: string): Promise<void> {
    const record = this.records.get(id);
    if (!record) {
      throw new Error('Brand Voice not found');
    }

    record.isActive = true;
    record.activatedAt = activatedAt;
    record.updatedAt = new Date().toISOString();
  }

  /**
   * Deactivate Brand Voice
   */
  async deactivate(id: string): Promise<void> {
    const record = this.records.get(id);
    if (!record) {
      throw new Error('Brand Voice not found');
    }

    record.isActive = false;
    record.updatedAt = new Date().toISOString();
  }

  /**
   * List Brand Voices with filtering and pagination
   */
  async list(userId: string, options: BrandVoiceListOptions): Promise<BrandVoiceListResult> {
    let filtered: BrandVoiceRecord[] = [];

    // Filter by user and not deleted
    for (const record of Array.from(this.records.values())) {
      if (record.userId === userId && !record.deletedAt) {
        // Apply filters
        if (options.isActive !== undefined && record.isActive !== options.isActive) {
          continue;
        }
        
        if (options.minQuality !== undefined && record.qualityScore < options.minQuality) {
          continue;
        }

        filtered.push(record);
      }
    }

    // Sort by updated date (newest first)
    filtered.sort((a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime());

    // Apply pagination
    const total = filtered.length;
    const items = filtered.slice(options.offset, options.offset + options.limit);

    return {
      items,
      total
    };
  }  /**
   * Soft delete Brand Voice
   */
  async softDelete(id: string): Promise<void> {
    const record = this.records.get(id);
    if (!record) {
      throw new Error('Brand Voice not found');
    }

    record.deletedAt = new Date().toISOString();
    record.isActive = false;
    record.updatedAt = new Date().toISOString();
  }

  /**
   * Get database statistics
   */
  getStats(): {
    total: number;
    active: number;
    deleted: number;
  } {
    let total = 0;
    let active = 0;
    let deleted = 0;

    for (const record of Array.from(this.records.values())) {
      total++;
      if (record.deletedAt) {
        deleted++;
      } else if (record.isActive) {
        active++;
      }
    }

    return { total, active, deleted };
  }

  /**
   * Clear all records (for testing)
   */
  clear(): void {
    this.records.clear();
  }
}

// Create and export the mock database
export const mockBrandVoiceDb = new BrandVoiceDatabase();

// Extended mock database with brandVoices property for compatibility
export const db = {
  brandVoices: mockBrandVoiceDb,
  
  // Mock other database methods for compatibility
  select: () => ({
    from: () => ({
      where: () => ({
        limit: () => Promise.resolve([])
      })
    })
  })
};