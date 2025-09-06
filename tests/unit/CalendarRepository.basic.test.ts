import { describe, it, expect, beforeEach } from 'vitest';
import { CalendarRepository, CalendarItemCreateData, CalendarItemUpdateData } from '../../server/repositories/CalendarRepository.js';
import { CalendarStatus, ContentType, CalendarPriority } from '../../shared/types/calendar.js';

describe('CalendarRepository', () => {
  let repository: CalendarRepository;
  const mockAccountId = 'account-test-123';
  const mockUserId = 'user-test-123';

  beforeEach(() => {
    repository = new CalendarRepository();
  });

  describe('create', () => {
    it('should create a new calendar item successfully', async () => {
      const itemData: CalendarItemCreateData = {
        account_id: mockAccountId,
        user_id: mockUserId,
        title: 'Test Calendar Item',
        description: 'This is a test item',
        content_type: 'educativo',
        channels: ['instagram', 'facebook'],
        scheduled_for: new Date('2024-12-15T10:00:00Z'),
        timezone: 'America/Sao_Paulo',
        status: 'draft',
        priority: 'medium',
        tags: ['test', 'calendar'],
        predicted_engagement: 0.05,
        predicted_reach: 1000
      };

      const createdItem = await repository.create(itemData);

      expect(createdItem).toBeDefined();
      expect(createdItem.id).toBeDefined();
      expect(createdItem.title).toBe(itemData.title);
      expect(createdItem.description).toBe(itemData.description);
      expect(createdItem.content_type).toBe(itemData.content_type);
      expect(createdItem.channels).toEqual(itemData.channels);
      expect(createdItem.status).toBe(itemData.status);
      expect(createdItem.priority).toBe(itemData.priority);
      expect(createdItem.account_id).toBe(itemData.account_id);
      expect(createdItem.user_id).toBe(itemData.user_id);
      expect(createdItem.created_at).toBeInstanceOf(Date);
      expect(createdItem.updated_at).toBeInstanceOf(Date);
    });

    it('should set default values for optional fields', async () => {
      const itemData: CalendarItemCreateData = {
        account_id: mockAccountId,
        user_id: mockUserId,
        title: 'Minimal Test Item',
        content_type: 'promocional',
        channels: ['instagram'],
        scheduled_for: new Date('2024-12-15T10:00:00Z'),
        timezone: 'America/Sao_Paulo'
      };

      const createdItem = await repository.create(itemData);

      expect(createdItem.status).toBe('draft');
      expect(createdItem.priority).toBe('medium');
    });
  });

  describe('getById', () => {
    it('should retrieve an existing calendar item by ID', async () => {
      const itemData: CalendarItemCreateData = {
        account_id: mockAccountId,
        user_id: mockUserId,
        title: 'Retrievable Item',
        content_type: 'educativo',
        channels: ['instagram'],
        scheduled_for: new Date('2024-12-15T10:00:00Z'),
        timezone: 'America/Sao_Paulo'
      };

      const createdItem = await repository.create(itemData);
      const retrievedItem = await repository.getById(createdItem.id, mockAccountId);

      expect(retrievedItem).toBeDefined();
      expect(retrievedItem?.id).toBe(createdItem.id);
      expect(retrievedItem?.title).toBe(itemData.title);
    });

    it('should return null for non-existent item', async () => {
      const retrievedItem = await repository.getById('non-existent-id', mockAccountId);
      expect(retrievedItem).toBeNull();
    });

    it('should return null for item from different account', async () => {
      const itemData: CalendarItemCreateData = {
        account_id: 'different-account',
        user_id: mockUserId,
        title: 'Different Account Item',
        content_type: 'educativo',
        channels: ['instagram'],
        scheduled_for: new Date('2024-12-15T10:00:00Z'),
        timezone: 'America/Sao_Paulo'
      };

      const createdItem = await repository.create(itemData);
      const retrievedItem = await repository.getById(createdItem.id, mockAccountId);

      expect(retrievedItem).toBeNull();
    });
  });

  describe('update', () => {
    it('should update an existing calendar item', async () => {
      const itemData: CalendarItemCreateData = {
        account_id: mockAccountId,
        user_id: mockUserId,
        title: 'Original Title',
        content_type: 'educativo',
        channels: ['instagram'],
        scheduled_for: new Date('2024-12-15T10:00:00Z'),
        timezone: 'America/Sao_Paulo'
      };

      const createdItem = await repository.create(itemData);

      const updateData: CalendarItemUpdateData = {
        title: 'Updated Title',
        description: 'Updated description',
        status: 'scheduled',
        priority: 'high'
      };

      const updatedItem = await repository.update(createdItem.id, mockAccountId, updateData);

      expect(updatedItem).toBeDefined();
      expect(updatedItem?.title).toBe(updateData.title);
      expect(updatedItem?.description).toBe(updateData.description);
      expect(updatedItem?.status).toBe(updateData.status);
      expect(updatedItem?.priority).toBe(updateData.priority);
      expect(updatedItem?.updated_at).not.toEqual(createdItem.updated_at);
    });

    it('should return null when updating non-existent item', async () => {
      const updateData: CalendarItemUpdateData = {
        title: 'Updated Title'
      };

      const updatedItem = await repository.update('non-existent-id', mockAccountId, updateData);
      expect(updatedItem).toBeNull();
    });
  });

  describe('delete', () => {
    it('should delete an existing calendar item', async () => {
      const itemData: CalendarItemCreateData = {
        account_id: mockAccountId,
        user_id: mockUserId,
        title: 'Item to Delete',
        content_type: 'educativo',
        channels: ['instagram'],
        scheduled_for: new Date('2024-12-15T10:00:00Z'),
        timezone: 'America/Sao_Paulo'
      };

      const createdItem = await repository.create(itemData);
      const deleteResult = await repository.delete(createdItem.id, mockAccountId);

      expect(deleteResult).toBe(true);

      // Verify item is actually deleted
      const retrievedItem = await repository.getById(createdItem.id, mockAccountId);
      expect(retrievedItem).toBeNull();
    });

    it('should return false when deleting non-existent item', async () => {
      const deleteResult = await repository.delete('non-existent-id', mockAccountId);
      expect(deleteResult).toBe(false);
    });
  });

  describe('getMany', () => {
    beforeEach(async () => {
      // Create test items
      const testItems: CalendarItemCreateData[] = [
        {
          account_id: mockAccountId,
          user_id: mockUserId,
          title: 'Educational Post 1',
          content_type: 'educativo',
          channels: ['instagram'],
          scheduled_for: new Date('2024-12-15T10:00:00Z'),
          timezone: 'America/Sao_Paulo',
          status: 'draft',
          priority: 'high',
          tags: ['education', 'pets']
        },
        {
          account_id: mockAccountId,
          user_id: mockUserId,
          title: 'Promotional Post 1',
          content_type: 'promocional',
          channels: ['facebook'],
          scheduled_for: new Date('2024-12-16T14:00:00Z'),
          timezone: 'America/Sao_Paulo',
          status: 'scheduled',
          priority: 'medium',
          tags: ['promotion', 'sale']
        },
        {
          account_id: mockAccountId,
          user_id: mockUserId,
          title: 'Engagement Post 1',
          content_type: 'engajamento',
          channels: ['instagram', 'tiktok'],
          scheduled_for: new Date('2024-12-17T16:00:00Z'),
          timezone: 'America/Sao_Paulo',
          status: 'published',
          priority: 'low',
          tags: ['fun', 'pets']
        }
      ];

      for (const itemData of testItems) {
        await repository.create(itemData);
      }
    });

    it('should retrieve all items for account with default pagination', async () => {
      const result = await repository.getMany(mockAccountId);

      expect(result.items.length).toBeGreaterThan(0);
      expect(result.total).toBeGreaterThan(0);
      expect(result.page).toBe(1);
      expect(result.limit).toBe(50);
    });

    it('should filter by status', async () => {
      const result = await repository.getMany(mockAccountId, {
        status: ['scheduled']
      });

      expect(result.items.length).toBeGreaterThan(0);
      result.items.forEach(item => {
        expect(item.status).toBe('scheduled');
      });
    });

    it('should filter by content type', async () => {
      const result = await repository.getMany(mockAccountId, {
        content_types: ['educativo']
      });

      expect(result.items.length).toBeGreaterThan(0);
      result.items.forEach(item => {
        expect(item.content_type).toBe('educativo');
      });
    });

    it('should filter by priority', async () => {
      const result = await repository.getMany(mockAccountId, {
        priorities: ['high']
      });

      expect(result.items.length).toBeGreaterThan(0);
      result.items.forEach(item => {
        expect(item.priority).toBe('high');
      });
    });

    it('should filter by tags', async () => {
      const result = await repository.getMany(mockAccountId, {
        tags: ['pets']
      });

      expect(result.items.length).toBeGreaterThan(0);
      result.items.forEach(item => {
        expect(item.tags?.some(tag => tag === 'pets')).toBe(true);
      });
    });

    it('should filter by channels', async () => {
      const result = await repository.getMany(mockAccountId, {
        channels: ['instagram']
      });

      expect(result.items.length).toBeGreaterThan(0);
      result.items.forEach(item => {
        expect(item.channels.includes('instagram')).toBe(true);
      });
    });

    it('should search by title', async () => {
      const result = await repository.getMany(mockAccountId, {
        search: 'Educational'
      });

      expect(result.items.length).toBeGreaterThan(0);
      result.items.forEach(item => {
        expect(item.title.toLowerCase()).toContain('educational');
      });
    });

    it('should handle pagination correctly', async () => {
      const pageSize = 2;
      const page1 = await repository.getMany(mockAccountId, {}, {
        page: 1,
        limit: pageSize
      });

      expect(page1.items.length).toBeLessThanOrEqual(pageSize);
      expect(page1.page).toBe(1);
      expect(page1.limit).toBe(pageSize);

      if (page1.total > pageSize) {
        const page2 = await repository.getMany(mockAccountId, {}, {
          page: 2,
          limit: pageSize
        });

        expect(page2.items.length).toBeLessThanOrEqual(pageSize);
        expect(page2.page).toBe(2);
        expect(page2.limit).toBe(pageSize);
      }
    });
  });

  describe('getByDateRange', () => {
    it('should retrieve items within specified date range', async () => {
      const itemData: CalendarItemCreateData = {
        account_id: mockAccountId,
        user_id: mockUserId,
        title: 'Date Range Test Item',
        content_type: 'educativo',
        channels: ['instagram'],
        scheduled_for: new Date('2024-12-15T10:00:00Z'),
        timezone: 'America/Sao_Paulo'
      };

      await repository.create(itemData);

      const startDate = new Date('2024-12-14T00:00:00Z');
      const endDate = new Date('2024-12-16T23:59:59Z');

      const items = await repository.getByDateRange(mockAccountId, startDate, endDate);

      expect(items.length).toBeGreaterThan(0);
      items.forEach(item => {
        expect(item.scheduled_for >= startDate && item.scheduled_for <= endDate).toBe(true);
      });
    });
  });

  describe('move', () => {
    it('should move calendar item to new date', async () => {
      const itemData: CalendarItemCreateData = {
        account_id: mockAccountId,
        user_id: mockUserId,
        title: 'Item to Move',
        content_type: 'educativo',
        channels: ['instagram'],
        scheduled_for: new Date('2024-12-15T10:00:00Z'),
        timezone: 'America/Sao_Paulo'
      };

      const createdItem = await repository.create(itemData);
      const newDate = new Date('2024-12-20T15:00:00Z');

      const movedItem = await repository.move(createdItem.id, mockAccountId, newDate, mockUserId);

      expect(movedItem).toBeDefined();
      expect(movedItem?.scheduled_for).toEqual(newDate);
    });
  });

  describe('bulkUpdate', () => {
    it('should update multiple items in bulk', async () => {
      const item1Data: CalendarItemCreateData = {
        account_id: mockAccountId,
        user_id: mockUserId,
        title: 'Bulk Item 1',
        content_type: 'educativo',
        channels: ['instagram'],
        scheduled_for: new Date('2024-12-15T10:00:00Z'),
        timezone: 'America/Sao_Paulo'
      };

      const item2Data: CalendarItemCreateData = {
        account_id: mockAccountId,
        user_id: mockUserId,
        title: 'Bulk Item 2',
        content_type: 'promocional',
        channels: ['facebook'],
        scheduled_for: new Date('2024-12-16T10:00:00Z'),
        timezone: 'America/Sao_Paulo'
      };

      const item1 = await repository.create(item1Data);
      const item2 = await repository.create(item2Data);

      const updates = [
        { id: item1.id, data: { status: 'scheduled' as CalendarStatus } },
        { id: item2.id, data: { status: 'published' as CalendarStatus } }
      ];

      const updatedItems = await repository.bulkUpdate(mockAccountId, updates, mockUserId);

      expect(updatedItems.length).toBe(2);
      expect(updatedItems[0].status).toBe('scheduled');
      expect(updatedItems[1].status).toBe('published');
    });
  });

  describe('getAnalyticsSummary', () => {
    it('should return analytics summary for given date range', async () => {
      const startDate = new Date('2024-12-01T00:00:00Z');
      const endDate = new Date('2024-12-31T23:59:59Z');

      const summary = await repository.getAnalyticsSummary(mockAccountId, {
        start: startDate,
        end: endDate
      });

      expect(summary).toBeDefined();
      expect(summary.total_items).toBeGreaterThanOrEqual(0);
      expect(summary.by_status).toBeDefined();
      expect(summary.by_content_type).toBeDefined();
      expect(summary.by_priority).toBeDefined();
      expect(summary.scheduled_this_week).toBeGreaterThanOrEqual(0);
      expect(summary.published_this_month).toBeGreaterThanOrEqual(0);
    });
  });

  describe('search', () => {
    it('should search calendar items by query', async () => {
      const itemData: CalendarItemCreateData = {
        account_id: mockAccountId,
        user_id: mockUserId,
        title: 'Searchable Test Item',
        description: 'This item should be found in search',
        content_type: 'educativo',
        channels: ['instagram'],
        scheduled_for: new Date('2024-12-15T10:00:00Z'),
        timezone: 'America/Sao_Paulo'
      };

      await repository.create(itemData);

      const result = await repository.search(mockAccountId, 'Searchable');

      expect(result.items.length).toBeGreaterThan(0);
      expect(result.items[0].title.toLowerCase()).toContain('searchable');
    });
  });

  describe('getVersionHistory', () => {
    it('should return version history for calendar item', async () => {
      const itemData: CalendarItemCreateData = {
        account_id: mockAccountId,
        user_id: mockUserId,
        title: 'Versioned Item',
        content_type: 'educativo',
        channels: ['instagram'],
        scheduled_for: new Date('2024-12-15T10:00:00Z'),
        timezone: 'America/Sao_Paulo'
      };

      const createdItem = await repository.create(itemData);

      // Update the item to create a version
      await repository.update(createdItem.id, mockAccountId, {
        title: 'Updated Versioned Item'
      });

      const versions = await repository.getVersionHistory(createdItem.id, mockAccountId);

      expect(versions.length).toBeGreaterThan(0);
      expect(versions[0].original_id).toBe(createdItem.id);
    });
  });
});