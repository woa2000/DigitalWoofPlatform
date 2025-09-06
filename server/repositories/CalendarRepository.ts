import { 
  CalendarItem, 
  CalendarStatus, 
  ContentType, 
  CalendarPriority,
  DateRange 
} from '../../shared/types/calendar.js';

export interface CalendarFilters {
  status?: CalendarStatus[];
  content_types?: ContentType[];
  priorities?: CalendarPriority[];
  campaigns?: string[];
  tags?: string[];
  channels?: string[];
  date_range?: DateRange;
  search?: string;
}

export interface CalendarItemCreateData {
  account_id: string;
  user_id: string;
  title: string;
  description?: string;
  content_type: ContentType;
  channels: string[];
  scheduled_for: Date;
  timezone: string;
  campaign_id?: string;
  template_id?: string;
  status?: CalendarStatus;
  priority?: CalendarPriority;
  objectives?: Record<string, number>;
  tags?: string[];
  predicted_engagement?: number;
  predicted_reach?: number;
  optimal_time_score?: number;
}

export interface CalendarItemUpdateData {
  title?: string;
  description?: string;
  content_type?: ContentType;
  channels?: string[];
  scheduled_for?: Date;
  timezone?: string;
  campaign_id?: string;
  template_id?: string;
  status?: CalendarStatus;
  priority?: CalendarPriority;
  objectives?: Record<string, number>;
  tags?: string[];
  predicted_engagement?: number;
  predicted_reach?: number;
  optimal_time_score?: number;
  published_at?: Date;
  actual_performance?: Record<string, any>;
}

export interface PaginationOptions {
  page?: number;
  limit?: number;
  sort_by?: 'scheduled_for' | 'created_at' | 'updated_at' | 'priority' | 'title';
  sort_order?: 'asc' | 'desc';
}

export interface CalendarItemsResponse {
  items: CalendarItem[];
  total: number;
  page: number;
  limit: number;
  total_pages: number;
}

/**
 * Calendar Repository - Mock implementation for Calendar Editorial System
 * 
 * This is a mock implementation that simulates database operations until 
 * the actual database schema is implemented. It provides all the required
 * CRUD operations and advanced querying capabilities.
 */
export class CalendarRepository {
  private items: Map<string, CalendarItem> = new Map();
  private versions: Array<any> = [];

  constructor() {
    console.log('[CalendarRepository] Mock implementation initialized');
    // Pre-populate with some mock data for testing
    this.initializeMockData();
  }

  /**
   * Create a new calendar item
   */
  async create(data: CalendarItemCreateData): Promise<CalendarItem> {
    console.log('[CalendarRepository] Creating calendar item:', data.title);

    try {
      const id = crypto.randomUUID();
      const now = new Date();
      
      const item: CalendarItem = {
        id,
        ...data,
        status: data.status || 'draft',
        priority: data.priority || 'medium',
        created_at: now,
        updated_at: now
      };

      this.items.set(id, item);
      
      // Create backup version
      await this.createBackupVersion(item, 'INSERT');

      console.log('[CalendarRepository] Calendar item created:', id);
      return item;
    } catch (error) {
      console.error('[CalendarRepository] Error creating calendar item:', error);
      throw new Error(`Failed to create calendar item: ${error}`);
    }
  }

  /**
   * Get calendar item by ID
   */
  async getById(id: string, accountId: string): Promise<CalendarItem | null> {
    console.log('[CalendarRepository] Getting calendar item by ID:', id);

    try {
      const item = this.items.get(id);
      
      // Check if item exists and belongs to account
      if (!item || item.account_id !== accountId) {
        return null;
      }

      return item;
    } catch (error) {
      console.error('[CalendarRepository] Error getting calendar item:', error);
      throw new Error(`Failed to get calendar item: ${error}`);
    }
  }

  /**
   * Update calendar item
   */
  async update(id: string, accountId: string, data: CalendarItemUpdateData): Promise<CalendarItem | null> {
    console.log('[CalendarRepository] Updating calendar item:', id);

    try {
      const existingItem = await this.getById(id, accountId);
      if (!existingItem) {
        return null;
      }

      // Create backup before updating
      await this.createBackupVersion(existingItem, 'UPDATE');

      const updatedItem: CalendarItem = {
        ...existingItem,
        ...data,
        updated_at: new Date()
      };

      this.items.set(id, updatedItem);

      console.log('[CalendarRepository] Calendar item updated:', id);
      return updatedItem;
    } catch (error) {
      console.error('[CalendarRepository] Error updating calendar item:', error);
      throw new Error(`Failed to update calendar item: ${error}`);
    }
  }

  /**
   * Delete calendar item
   */
  async delete(id: string, accountId: string): Promise<boolean> {
    console.log('[CalendarRepository] Deleting calendar item:', id);

    try {
      const existingItem = await this.getById(id, accountId);
      if (!existingItem) {
        return false;
      }

      // Create backup before deletion
      await this.createBackupVersion(existingItem, 'DELETE');

      this.items.delete(id);

      console.log('[CalendarRepository] Calendar item deleted:', id);
      return true;
    } catch (error) {
      console.error('[CalendarRepository] Error deleting calendar item:', error);
      throw new Error(`Failed to delete calendar item: ${error}`);
    }
  }

  /**
   * Get calendar items with advanced filtering and pagination
   */
  async getMany(
    accountId: string,
    filters: CalendarFilters = {},
    pagination: PaginationOptions = {}
  ): Promise<CalendarItemsResponse> {
    console.log('[CalendarRepository] Getting calendar items with filters:', filters);

    try {
      const {
        page = 1,
        limit = 50,
        sort_by = 'scheduled_for',
        sort_order = 'asc'
      } = pagination;

      // Filter items by account
      let filteredItems = Array.from(this.items.values())
        .filter(item => item.account_id === accountId);

      // Apply filters
      if (filters.status && filters.status.length > 0) {
        filteredItems = filteredItems.filter(item => filters.status!.includes(item.status));
      }

      if (filters.content_types && filters.content_types.length > 0) {
        filteredItems = filteredItems.filter(item => filters.content_types!.includes(item.content_type));
      }

      if (filters.priorities && filters.priorities.length > 0) {
        filteredItems = filteredItems.filter(item => filters.priorities!.includes(item.priority));
      }

      if (filters.campaigns && filters.campaigns.length > 0) {
        filteredItems = filteredItems.filter(item => 
          item.campaign_id && filters.campaigns!.includes(item.campaign_id)
        );
      }

      if (filters.date_range) {
        filteredItems = filteredItems.filter(item => 
          item.scheduled_for >= filters.date_range!.start && 
          item.scheduled_for <= filters.date_range!.end
        );
      }

      if (filters.search) {
        const searchTerm = filters.search.toLowerCase();
        filteredItems = filteredItems.filter(item =>
          item.title.toLowerCase().includes(searchTerm) ||
          (item.description && item.description.toLowerCase().includes(searchTerm))
        );
      }

      if (filters.tags && filters.tags.length > 0) {
        filteredItems = filteredItems.filter(item =>
          item.tags && filters.tags!.some(tag => item.tags!.includes(tag))
        );
      }

      if (filters.channels && filters.channels.length > 0) {
        filteredItems = filteredItems.filter(item =>
          filters.channels!.some(channel => item.channels.includes(channel))
        );
      }

      // Sort items
      filteredItems.sort((a, b) => {
        let aValue: any;
        let bValue: any;

        switch (sort_by) {
          case 'title':
            aValue = a.title;
            bValue = b.title;
            break;
          case 'created_at':
            aValue = a.created_at;
            bValue = b.created_at;
            break;
          case 'updated_at':
            aValue = a.updated_at;
            bValue = b.updated_at;
            break;
          case 'priority':
            const priorityOrder = { urgent: 4, high: 3, medium: 2, low: 1 };
            aValue = priorityOrder[a.priority];
            bValue = priorityOrder[b.priority];
            break;
          default:
            aValue = a.scheduled_for;
            bValue = b.scheduled_for;
        }

        if (sort_order === 'desc') {
          return bValue > aValue ? 1 : -1;
        } else {
          return aValue > bValue ? 1 : -1;
        }
      });

      const total = filteredItems.length;
      const totalPages = Math.ceil(total / limit);
      const offset = (page - 1) * limit;
      const paginatedItems = filteredItems.slice(offset, offset + limit);

      console.log(`[CalendarRepository] Retrieved ${paginatedItems.length} items (${total} total)`);

      return {
        items: paginatedItems,
        total,
        page,
        limit,
        total_pages: totalPages
      };
    } catch (error) {
      console.error('[CalendarRepository] Error getting calendar items:', error);
      throw new Error(`Failed to get calendar items: ${error}`);
    }
  }

  /**
   * Get calendar items by date range (optimized for calendar view)
   */
  async getByDateRange(
    accountId: string,
    startDate: Date,
    endDate: Date,
    filters: Omit<CalendarFilters, 'date_range'> = {}
  ): Promise<CalendarItem[]> {
    console.log(`[CalendarRepository] Getting items for date range: ${startDate.toISOString()} to ${endDate.toISOString()}`);

    try {
      const result = await this.getMany(
        accountId,
        {
          ...filters,
          date_range: { start: startDate, end: endDate }
        },
        {
          limit: 1000, // High limit for calendar view
          sort_by: 'scheduled_for',
          sort_order: 'asc'
        }
      );

      return result.items;
    } catch (error) {
      console.error('[CalendarRepository] Error getting items by date range:', error);
      throw new Error(`Failed to get items by date range: ${error}`);
    }
  }

  /**
   * Get calendar items by campaign ID
   */
  async getByCampaign(accountId: string, campaignId: string): Promise<CalendarItem[]> {
    console.log('[CalendarRepository] Getting items by campaign:', campaignId);

    try {
      const result = await this.getMany(
        accountId,
        { campaigns: [campaignId] },
        {
          limit: 1000,
          sort_by: 'scheduled_for',
          sort_order: 'asc'
        }
      );

      return result.items;
    } catch (error) {
      console.error('[CalendarRepository] Error getting items by campaign:', error);
      throw new Error(`Failed to get items by campaign: ${error}`);
    }
  }

  /**
   * Move calendar item to different date/time
   */
  async move(
    id: string, 
    accountId: string, 
    newScheduledFor: Date, 
    userId?: string
  ): Promise<CalendarItem | null> {
    console.log(`[CalendarRepository] Moving item ${id} to ${newScheduledFor.toISOString()}`);

    try {
      const existingItem = await this.getById(id, accountId);
      if (!existingItem) {
        return null;
      }

      await this.createBackupVersion(existingItem, 'UPDATE', userId);

      const updatedItem = await this.update(id, accountId, {
        scheduled_for: newScheduledFor
      });

      console.log('[CalendarRepository] Item moved successfully:', id);
      return updatedItem;
    } catch (error) {
      console.error('[CalendarRepository] Error moving item:', error);
      throw new Error(`Failed to move calendar item: ${error}`);
    }
  }

  /**
   * Bulk update multiple calendar items
   */
  async bulkUpdate(
    accountId: string,
    updates: Array<{ id: string; data: CalendarItemUpdateData }>,
    userId?: string
  ): Promise<CalendarItem[]> {
    console.log(`[CalendarRepository] Bulk updating ${updates.length} items`);

    try {
      const updatedItems: CalendarItem[] = [];

      for (const { id, data } of updates) {
        const existingItem = await this.getById(id, accountId);
        if (existingItem) {
          await this.createBackupVersion(existingItem, 'UPDATE', userId);
          
          const updatedItem = await this.update(id, accountId, data);
          if (updatedItem) {
            updatedItems.push(updatedItem);
          }
        }
      }

      console.log(`[CalendarRepository] Bulk update completed: ${updatedItems.length} items updated`);
      return updatedItems;
    } catch (error) {
      console.error('[CalendarRepository] Error in bulk update:', error);
      throw new Error(`Failed to bulk update calendar items: ${error}`);
    }
  }

  /**
   * Get calendar analytics summary
   */
  async getAnalyticsSummary(
    accountId: string,
    dateRange: DateRange
  ): Promise<{
    total_items: number;
    by_status: Record<CalendarStatus, number>;
    by_content_type: Record<ContentType, number>;
    by_priority: Record<CalendarPriority, number>;
    scheduled_this_week: number;
    published_this_month: number;
  }> {
    console.log('[CalendarRepository] Getting analytics summary');

    try {
      const items = await this.getByDateRange(accountId, dateRange.start, dateRange.end);

      const summary = {
        total_items: items.length,
        by_status: {} as Record<CalendarStatus, number>,
        by_content_type: {} as Record<ContentType, number>,
        by_priority: {} as Record<CalendarPriority, number>,
        scheduled_this_week: 0,
        published_this_month: 0
      };

      const now = new Date();
      const weekStart = new Date(now.getFullYear(), now.getMonth(), now.getDate() - now.getDay());
      const weekEnd = new Date(weekStart.getTime() + 7 * 24 * 60 * 60 * 1000);
      const monthStart = new Date(now.getFullYear(), now.getMonth(), 1);
      const monthEnd = new Date(now.getFullYear(), now.getMonth() + 1, 0);

      items.forEach(item => {
        // Count by status
        summary.by_status[item.status] = (summary.by_status[item.status] || 0) + 1;
        
        // Count by content type
        summary.by_content_type[item.content_type] = (summary.by_content_type[item.content_type] || 0) + 1;
        
        // Count by priority
        summary.by_priority[item.priority] = (summary.by_priority[item.priority] || 0) + 1;
        
        // Count scheduled this week
        if (item.scheduled_for >= weekStart && item.scheduled_for < weekEnd) {
          summary.scheduled_this_week++;
        }
        
        // Count published this month
        if (item.published_at && item.published_at >= monthStart && item.published_at <= monthEnd) {
          summary.published_this_month++;
        }
      });

      console.log('[CalendarRepository] Analytics summary generated');
      return summary;
    } catch (error) {
      console.error('[CalendarRepository] Error getting analytics summary:', error);
      throw new Error(`Failed to get analytics summary: ${error}`);
    }
  }

  /**
   * Search calendar items with full-text search
   */
  async search(
    accountId: string,
    query: string,
    filters: CalendarFilters = {},
    pagination: PaginationOptions = {}
  ): Promise<CalendarItemsResponse> {
    console.log('[CalendarRepository] Searching calendar items:', query);

    return this.getMany(
      accountId,
      {
        ...filters,
        search: query
      },
      pagination
    );
  }

  /**
   * Get version history for a calendar item
   */
  async getVersionHistory(itemId: string, accountId: string): Promise<any[]> {
    console.log('[CalendarRepository] Getting version history for item:', itemId);

    try {
      const versions = this.versions.filter(v => 
        v.original_id === itemId && v.account_id === accountId
      );

      return versions.sort((a, b) => b.versioned_at.getTime() - a.versioned_at.getTime());
    } catch (error) {
      console.error('[CalendarRepository] Error getting version history:', error);
      throw new Error(`Failed to get version history: ${error}`);
    }
  }

  /**
   * Create backup version of calendar item for audit trail
   */
  private async createBackupVersion(
    item: CalendarItem, 
    operationType: 'INSERT' | 'UPDATE' | 'DELETE',
    userId?: string
  ): Promise<void> {
    try {
      const version = {
        id: crypto.randomUUID(),
        original_id: item.id,
        account_id: item.account_id,
        user_id: userId || item.user_id,
        title: item.title,
        description: item.description,
        content_type: item.content_type,
        channels: item.channels,
        scheduled_for: item.scheduled_for,
        status: item.status,
        priority: item.priority,
        objectives: item.objectives,
        tags: item.tags,
        operation_type: operationType,
        versioned_at: new Date(),
        versioned_by: userId
      };

      this.versions.push(version);

      console.log('[CalendarRepository] Backup version created for item:', item.id);
    } catch (error) {
      console.error('[CalendarRepository] Error creating backup version:', error);
      // Don't throw error for backup failures - log and continue
    }
  }

  /**
   * Initialize mock data for testing
   */
  private initializeMockData(): void {
    const mockItems: CalendarItemCreateData[] = [
      {
        account_id: 'account-123',
        user_id: 'user-123',
        title: 'Post Educativo: Cuidados no Verão',
        description: 'Dicas importantes para manter pets seguros no calor',
        content_type: 'educativo',
        channels: ['instagram', 'facebook'],
        scheduled_for: new Date(Date.now() + 24 * 60 * 60 * 1000), // Tomorrow
        timezone: 'America/Sao_Paulo',
        status: 'scheduled',
        priority: 'high',
        tags: ['verão', 'cuidados', 'saúde'],
        predicted_engagement: 0.05,
        predicted_reach: 2500
      },
      {
        account_id: 'account-123',
        user_id: 'user-123',
        title: 'Promoção: Banho e Tosa',
        description: 'Oferta especial de banho e tosa para o final de semana',
        content_type: 'promocional',
        channels: ['instagram'],
        scheduled_for: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000), // In 3 days
        timezone: 'America/Sao_Paulo',
        status: 'draft',
        priority: 'medium',
        tags: ['promoção', 'banho', 'tosa'],
        predicted_engagement: 0.08,
        predicted_reach: 3200
      }
    ];

    // Create mock items
    mockItems.forEach(async (itemData) => {
      await this.create(itemData);
    });

    console.log('[CalendarRepository] Mock data initialized with', mockItems.length, 'items');
  }
}