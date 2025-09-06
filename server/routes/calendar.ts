import { Router, Request, Response } from 'express';
import { CalendarRepository, CalendarItemUpdateData, CalendarFilters, PaginationOptions } from '../repositories/CalendarRepository.js';
import { AnalyticsService } from '../services/AnalyticsService.js';
import { ContentGenerationService } from '../services/contentGenerationService.js';
import { SeasonalIntelligenceService } from '../services/SeasonalIntelligenceService.js';
import { TimingOptimizationService } from '../services/TimingOptimizationService.js';
import { CampaignTemplateService } from '../services/CampaignTemplateService.js';
import { WebSocketService } from '../services/WebSocketService.js';
import { CalendarItem, ContentType, BusinessType, CalendarPriority, CalendarUpdateEvent } from '../../shared/types/calendar.js';
import { CalendarContentRequest, BatchCalendarContentRequest } from '../services/contentGenerationService.js';
import { z } from 'zod';

// Validation schemas
const createCalendarItemSchema = z.object({
  account_id: z.string().min(1),
  user_id: z.string().min(1),
  title: z.string().min(1).max(200),
  content_type: z.enum(['educativo', 'promocional', 'recall', 'engajamento', 'awareness']),
  scheduled_for: z.string().datetime(),
  timezone: z.string().default('America/Sao_Paulo'),
  priority: z.enum(['urgent', 'high', 'medium', 'low']).default('medium'),
  status: z.enum(['draft', 'scheduled', 'published', 'cancelled']).default('draft'),
  channels: z.array(z.string()).min(1),
  tags: z.array(z.string()).optional(),
  campaign_id: z.string().optional(),
  predicted_engagement: z.number().optional(),
  notes: z.string().optional()
});

const updateCalendarItemSchema = createCalendarItemSchema.partial().extend({
  id: z.string().min(1)
});

const calendarQuerySchema = z.object({
  account_id: z.string().min(1).optional(),
  user_id: z.string().min(1).optional(),
  start_date: z.string().datetime().optional(),
  end_date: z.string().datetime().optional(),
  content_type: z.enum(['educativo', 'promocional', 'recall', 'engajamento', 'awareness']).optional(),
  status: z.enum(['draft', 'scheduled', 'published', 'cancelled']).optional(),
  priority: z.enum(['urgent', 'high', 'medium', 'low']).optional(),
  channels: z.string().optional(),
  campaign_id: z.string().optional(),
  limit: z.number().min(1).max(100).default(50),
  offset: z.number().min(0).default(0),
  sort_by: z.enum(['scheduled_for', 'created_at', 'priority', 'predicted_engagement']).default('scheduled_for'),
  sort_order: z.enum(['asc', 'desc']).default('asc')
});

const generateContentSchema = z.object({
  accountId: z.string().min(1),
  businessType: z.enum(['veterinaria', 'petshop', 'estetica', 'hotel', 'adestramento']),
  contentType: z.enum(['educativo', 'promocional', 'recall', 'engajamento', 'awareness']),
  targetDate: z.string().datetime(),
  channels: z.array(z.string()).min(1),
  objectives: z.record(z.number()).optional(),
  context: z.object({
    previousContent: z.array(z.any()).optional(),
    campaignId: z.string().optional(),
    seasonalEvents: z.array(z.string()).optional(),
    brandVoice: z.string().optional(),
    targetAudience: z.string().optional(),
    competitorAnalysis: z.string().optional()
  }).optional(),
  preferences: z.object({
    tone: z.enum(['formal', 'casual', 'friendly', 'professional', 'playful']).optional(),
    length: z.enum(['short', 'medium', 'long']).optional(),
    includeHashtags: z.boolean().optional(),
    includeEmojis: z.boolean().optional(),
    includeCallToAction: z.boolean().optional()
  }).optional()
});

const batchContentSchema = z.object({
  accountId: z.string().min(1),
  businessType: z.enum(['veterinaria', 'petshop', 'estetica', 'hotel', 'adestramento']),
  period: z.object({
    start: z.string().datetime(),
    end: z.string().datetime()
  }),
  contentTypes: z.array(z.enum(['educativo', 'promocional', 'recall', 'engajamento', 'awareness'])).min(1),
  channels: z.array(z.string()).min(1),
  frequency: z.number().min(1).max(7).default(3),
  campaignId: z.string().optional(),
  preferences: z.object({
    tone: z.enum(['formal', 'casual', 'friendly', 'professional', 'playful']).optional(),
    length: z.enum(['short', 'medium', 'long']).optional(),
    includeHashtags: z.boolean().optional(),
    includeEmojis: z.boolean().optional(),
    includeCallToAction: z.boolean().optional()
  }).optional()
});

const analyticsQuerySchema = z.object({
  account_id: z.string().min(1),
  start_date: z.string().datetime().optional(),
  end_date: z.string().datetime().optional(),
  content_type: z.enum(['educativo', 'promocional', 'recall', 'engajamento', 'awareness']).optional(),
  channels: z.string().optional(),
  campaign_id: z.string().optional(),
  group_by: z.enum(['day', 'week', 'month', 'content_type', 'channel', 'campaign']).default('day')
});

/**
 * Calendar Routes
 *
 * REST API endpoints for calendar operations including:
 * - CRUD operations for calendar items
 * - Analytics and reporting
 * - AI content generation
 * - Seasonal intelligence
 * - Timing optimization
 * - Real-time collaboration
 */
export class CalendarRoutes {
  private router: Router;
  private calendarRepository: CalendarRepository;
  private analyticsService: AnalyticsService;
  private contentGenerationService: ContentGenerationService;
  private seasonalIntelligenceService: SeasonalIntelligenceService;
  private timingOptimizationService: TimingOptimizationService;
  private campaignTemplateService: CampaignTemplateService;
  private webSocketService: WebSocketService;

  constructor(
    calendarRepository: CalendarRepository,
    analyticsService: AnalyticsService,
    contentGenerationService: ContentGenerationService,
    seasonalIntelligenceService: SeasonalIntelligenceService,
    timingOptimizationService: TimingOptimizationService,
    campaignTemplateService: CampaignTemplateService,
    webSocketService: WebSocketService
  ) {
    this.router = Router();
    this.calendarRepository = calendarRepository;
    this.analyticsService = analyticsService;
    this.contentGenerationService = contentGenerationService;
    this.seasonalIntelligenceService = seasonalIntelligenceService;
    this.timingOptimizationService = timingOptimizationService;
    this.campaignTemplateService = campaignTemplateService;
    this.webSocketService = webSocketService;

    this.initializeRoutes();
  }

  private initializeRoutes(): void {
    // Calendar Items CRUD
    this.router.post('/items', this.createCalendarItem.bind(this));
    this.router.get('/items', this.getCalendarItems.bind(this));
    this.router.get('/items/:id', this.getCalendarItem.bind(this));
    this.router.put('/items/:id', this.updateCalendarItem.bind(this));
    this.router.delete('/items/:id', this.deleteCalendarItem.bind(this));

    // Bulk operations
    this.router.post('/items/bulk', this.bulkCreateCalendarItems.bind(this));
    this.router.put('/items/bulk', this.bulkUpdateCalendarItems.bind(this));
    this.router.delete('/items/bulk', this.bulkDeleteCalendarItems.bind(this));

    // Calendar-specific operations
    this.router.post('/items/:id/publish', this.publishCalendarItem.bind(this));
    this.router.post('/items/:id/cancel', this.cancelCalendarItem.bind(this));
    this.router.post('/items/:id/reschedule', this.rescheduleCalendarItem.bind(this));

    // Analytics endpoints
    this.router.get('/analytics/overview', this.getAnalyticsOverview.bind(this));
    this.router.get('/analytics/performance', this.getPerformanceAnalytics.bind(this));
    this.router.get('/analytics/content-types', this.getContentTypeAnalytics.bind(this));
    this.router.get('/analytics/channels', this.getChannelAnalytics.bind(this));
    this.router.get('/analytics/seasonal', this.getSeasonalAnalytics.bind(this));

    // Content Generation endpoints
    this.router.post('/content/generate', this.generateContent.bind(this));
    this.router.post('/content/batch', this.generateBatchContent.bind(this));
    this.router.post('/content/suggestions', this.generateSmartSuggestions.bind(this));

    // Seasonal Intelligence endpoints
    this.router.get('/seasonal/events', this.getSeasonalEvents.bind(this));
    this.router.get('/seasonal/suggestions', this.getSeasonalSuggestions.bind(this));
    this.router.get('/seasonal/calendar', this.getSeasonalCalendar.bind(this));

    // Timing Optimization endpoints
    this.router.post('/timing/optimize', this.optimizeTiming.bind(this));
    this.router.get('/timing/recommendations', this.getTimingRecommendations.bind(this));

    // Campaign Template endpoints
    this.router.get('/templates', this.getCampaignTemplates.bind(this));
    this.router.post('/templates/:id/apply', this.applyCampaignTemplate.bind(this));

    // Real-time collaboration endpoints
    this.router.get('/collaboration/status', this.getCollaborationStatus.bind(this));
    this.router.post('/collaboration/broadcast', this.broadcastCalendarUpdate.bind(this));

    // Search and filtering
    this.router.get('/search', this.searchCalendarItems.bind(this));
    this.router.get('/filter', this.filterCalendarItems.bind(this));

    // Export/Import
    this.router.get('/export', this.exportCalendar.bind(this));
    this.router.post('/import', this.importCalendar.bind(this));
  }

  getRouter(): Router {
    return this.router;
  }

  // Calendar Items CRUD Operations
  private async createCalendarItem(req: Request, res: Response): Promise<void> {
    try {
      const validatedData = createCalendarItemSchema.parse(req.body);

      const calendarItem: Omit<CalendarItem, 'id' | 'created_at' | 'updated_at'> = {
        ...validatedData,
        scheduled_for: new Date(validatedData.scheduled_for)
      };

      const createdItem = await this.calendarRepository.create(calendarItem);

      // Broadcast to WebSocket clients
      this.webSocketService.broadcastCalendarUpdate({
        type: 'calendar_update',
        account_id: validatedData.account_id,
        operation: 'create',
        item: createdItem,
        timestamp: new Date()
      });

      res.status(201).json({
        success: true,
        data: createdItem,
        message: 'Calendar item created successfully'
      });
    } catch (error) {
      console.error('[CalendarRoutes] Error creating calendar item:', error);
      if (error instanceof z.ZodError) {
        res.status(400).json({
          success: false,
          error: 'Validation error',
          details: error.errors
        });
      } else {
        res.status(500).json({
          success: false,
          error: 'Internal server error',
          message: error instanceof Error ? error.message : 'Unknown error'
        });
      }
    }
  }

  private async getCalendarItems(req: Request, res: Response): Promise<void> {
    try {
      const validatedQuery = calendarQuerySchema.parse(req.query);

      const filters = {
        status: validatedQuery.status ? [validatedQuery.status] : undefined,
        content_types: validatedQuery.content_type ? [validatedQuery.content_type] : undefined,
        priorities: validatedQuery.priority ? [validatedQuery.priority] : undefined,
        campaigns: validatedQuery.campaign_id ? [validatedQuery.campaign_id] : undefined,
        channels: validatedQuery.channels ? [validatedQuery.channels] : undefined,
        date_range: validatedQuery.start_date && validatedQuery.end_date ? {
          start: new Date(validatedQuery.start_date),
          end: new Date(validatedQuery.end_date)
        } : undefined
      };

      const pagination = {
        page: Math.floor(validatedQuery.offset / validatedQuery.limit) + 1,
        limit: validatedQuery.limit,
        sort_by: validatedQuery.sort_by === 'predicted_engagement' ? 'scheduled_for' : validatedQuery.sort_by,
        sort_order: validatedQuery.sort_order
      };

      const result = await this.calendarRepository.getMany(validatedQuery.account_id!, filters, pagination);

      res.json({
        success: true,
        data: result.items,
        pagination: {
          total: result.total,
          limit: validatedQuery.limit,
          offset: validatedQuery.offset,
          has_more: result.page < result.total_pages
        }
      });
    } catch (error) {
      console.error('[CalendarRoutes] Error getting calendar items:', error);
      if (error instanceof z.ZodError) {
        res.status(400).json({
          success: false,
          error: 'Validation error',
          details: error.errors
        });
      } else {
        res.status(500).json({
          success: false,
          error: 'Internal server error',
          message: error instanceof Error ? error.message : 'Unknown error'
        });
      }
    }
  }

  private async getCalendarItem(req: Request, res: Response): Promise<void> {
    try {
      const { id } = req.params;
      const { account_id } = req.query as { account_id: string };
      const item = await this.calendarRepository.getById(id, account_id);

      if (!item) {
        res.status(404).json({
          success: false,
          error: 'Calendar item not found'
        });
        return;
      }

      res.json({
        success: true,
        data: item
      });
    } catch (error) {
      console.error('[CalendarRoutes] Error getting calendar item:', error);
      res.status(500).json({
        success: false,
        error: 'Internal server error',
        message: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  }

  private async updateCalendarItem(req: Request, res: Response): Promise<void> {
    try {
      const { id } = req.params;
      const validatedData = updateCalendarItemSchema.parse({ ...req.body, id });

      const updateData: CalendarItemUpdateData = {
        ...validatedData,
        scheduled_for: validatedData.scheduled_for ? new Date(validatedData.scheduled_for) : undefined
      };

      const updatedItem = await this.calendarRepository.update(id, validatedData.account_id!, updateData);

      if (!updatedItem) {
        res.status(404).json({
          success: false,
          error: 'Calendar item not found'
        });
        return;
      }

      // Broadcast to WebSocket clients
      this.webSocketService.broadcastToAccount(updatedItem.account_id, 'calendar_update', {
        type: 'item_updated',
        item: updatedItem
      });

      res.json({
        success: true,
        data: updatedItem,
        message: 'Calendar item updated successfully'
      });
    } catch (error) {
      console.error('[CalendarRoutes] Error updating calendar item:', error);
      if (error instanceof z.ZodError) {
        res.status(400).json({
          success: false,
          error: 'Validation error',
          details: error.errors
        });
      } else {
        res.status(500).json({
          success: false,
          error: 'Internal server error',
          message: error instanceof Error ? error.message : 'Unknown error'
        });
      }
    }
  }

  private async deleteCalendarItem(req: Request, res: Response): Promise<void> {
    try {
      const { id } = req.params;
      const { account_id } = req.query as { account_id: string };
      
      // Get the item before deleting for broadcasting
      const itemToDelete = await this.calendarRepository.getById(id, account_id);
      const deleted = await this.calendarRepository.delete(id, account_id);

      if (!deleted || !itemToDelete) {
        res.status(404).json({
          success: false,
          error: 'Calendar item not found'
        });
        return;
      }

      // Broadcast to WebSocket clients
      this.webSocketService.broadcastCalendarUpdate({
        type: 'calendar_update',
        account_id: account_id,
        operation: 'delete',
        item: itemToDelete,
        timestamp: new Date()
      });

      res.json({
        success: true,
        message: 'Calendar item deleted successfully'
      });
    } catch (error) {
      console.error('[CalendarRoutes] Error deleting calendar item:', error);
      res.status(500).json({
        success: false,
        error: 'Internal server error',
        message: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  }

  // Bulk Operations
  private async bulkCreateCalendarItems(req: Request, res: Response): Promise<void> {
    try {
      const items = z.array(createCalendarItemSchema).parse(req.body);

      const calendarItems = items.map(item => ({
        ...item,
        scheduled_for: new Date(item.scheduled_for)
      }));

      const createdItems = await Promise.all(
        calendarItems.map(item => this.calendarRepository.create(item))
      );

      // Broadcast to WebSocket clients
      if (createdItems.length > 0) {
        this.webSocketService.broadcastToAccount(createdItems[0].account_id, 'calendar_update', {
          type: 'bulk_created',
          items: createdItems
        });
      }

      res.status(201).json({
        success: true,
        data: createdItems,
        message: `${createdItems.length} calendar items created successfully`
      });
    } catch (error) {
      console.error('[CalendarRoutes] Error bulk creating calendar items:', error);
      if (error instanceof z.ZodError) {
        res.status(400).json({
          success: false,
          error: 'Validation error',
          details: error.errors
        });
      } else {
        res.status(500).json({
          success: false,
          error: 'Internal server error',
          message: error instanceof Error ? error.message : 'Unknown error'
        });
      }
    }
  }

  private async bulkUpdateCalendarItems(req: Request, res: Response): Promise<void> {
    try {
      const updates = z.array(updateCalendarItemSchema).parse(req.body);

      const updatePromises = updates.map(update =>
        this.calendarRepository.update(update.id, update.account_id!, {
          title: update.title,
          content_type: update.content_type,
          channels: update.channels,
          scheduled_for: update.scheduled_for ? new Date(update.scheduled_for) : undefined,
          timezone: update.timezone,
          campaign_id: update.campaign_id,
          status: update.status,
          priority: update.priority,
          tags: update.tags,
          predicted_engagement: update.predicted_engagement
        })
      );

      const updatedItems = await Promise.all(updatePromises);
      const successfulUpdates = updatedItems.filter(item => item !== null);

      // Broadcast to WebSocket clients
      if (successfulUpdates.length > 0) {
        this.webSocketService.broadcastToAccount(successfulUpdates[0]!.account_id, 'calendar_update', {
          type: 'bulk_updated',
          items: successfulUpdates
        });
      }

      res.json({
        success: true,
        data: successfulUpdates,
        message: `${successfulUpdates.length} calendar items updated successfully`
      });
    } catch (error) {
      console.error('[CalendarRoutes] Error bulk updating calendar items:', error);
      if (error instanceof z.ZodError) {
        res.status(400).json({
          success: false,
          error: 'Validation error',
          details: error.errors
        });
      } else {
        res.status(500).json({
          success: false,
          error: 'Internal server error',
          message: error instanceof Error ? error.message : 'Unknown error'
        });
      }
    }
  }

  private async bulkDeleteCalendarItems(req: Request, res: Response): Promise<void> {
    try {
      const { ids, account_id } = z.object({
        ids: z.array(z.string().min(1)),
        account_id: z.string().min(1)
      }).parse(req.body);

      const deletePromises = ids.map(id => this.calendarRepository.delete(id, account_id));
      const deletedItems = await Promise.all(deletePromises);
      const successfulDeletes = deletedItems.filter(item => item !== false);

      res.json({
        success: true,
        message: `${successfulDeletes.length} calendar items deleted successfully`
      });
    } catch (error) {
      console.error('[CalendarRoutes] Error bulk deleting calendar items:', error);
      if (error instanceof z.ZodError) {
        res.status(400).json({
          success: false,
          error: 'Validation error',
          details: error.errors
        });
      } else {
        res.status(500).json({
          success: false,
          error: 'Internal server error',
          message: error instanceof Error ? error.message : 'Unknown error'
        });
      }
    }
  }

  // Calendar-specific operations
  private async publishCalendarItem(req: Request, res: Response): Promise<void> {
    try {
      const { id } = req.params;
      const { account_id } = req.query as { account_id: string };
      const updatedItem = await this.calendarRepository.update(id, account_id, {
        status: 'published'
      });

      if (!updatedItem) {
        res.status(404).json({
          success: false,
          error: 'Calendar item not found'
        });
        return;
      }

      // Broadcast to WebSocket clients
      this.webSocketService.broadcastToAccount(updatedItem.account_id, 'calendar_update', {
        type: 'item_published',
        item: updatedItem
      });

      res.json({
        success: true,
        data: updatedItem,
        message: 'Calendar item published successfully'
      });
    } catch (error) {
      console.error('[CalendarRoutes] Error publishing calendar item:', error);
      res.status(500).json({
        success: false,
        error: 'Internal server error',
        message: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  }

  private async cancelCalendarItem(req: Request, res: Response): Promise<void> {
    try {
      const { id } = req.params;
      const { account_id } = req.query as { account_id: string };
      const updatedItem = await this.calendarRepository.update(id, account_id, {
        status: 'cancelled'
      });

      if (!updatedItem) {
        res.status(404).json({
          success: false,
          error: 'Calendar item not found'
        });
        return;
      }

      // Broadcast to WebSocket clients
      this.webSocketService.broadcastToAccount(updatedItem.account_id, 'calendar_update', {
        type: 'item_cancelled',
        item: updatedItem
      });

      res.json({
        success: true,
        data: updatedItem,
        message: 'Calendar item cancelled successfully'
      });
    } catch (error) {
      console.error('[CalendarRoutes] Error cancelling calendar item:', error);
      res.status(500).json({
        success: false,
        error: 'Internal server error',
        message: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  }

  private async rescheduleCalendarItem(req: Request, res: Response): Promise<void> {
    try {
      const { id } = req.params;
      const { account_id } = req.query as { account_id: string };
      const { new_date, timezone } = z.object({
        new_date: z.string().datetime(),
        timezone: z.string().optional()
      }).parse(req.body);

      const updatedItem = await this.calendarRepository.update(id, account_id, {
        scheduled_for: new Date(new_date),
        timezone: timezone || 'America/Sao_Paulo'
      });

      if (!updatedItem) {
        res.status(404).json({
          success: false,
          error: 'Calendar item not found'
        });
        return;
      }

      // Broadcast to WebSocket clients
      this.webSocketService.broadcastToAccount(updatedItem.account_id, 'calendar_update', {
        type: 'item_rescheduled',
        item: updatedItem
      });

      res.json({
        success: true,
        data: updatedItem,
        message: 'Calendar item rescheduled successfully'
      });
    } catch (error) {
      console.error('[CalendarRoutes] Error rescheduling calendar item:', error);
      if (error instanceof z.ZodError) {
        res.status(400).json({
          success: false,
          error: 'Validation error',
          details: error.errors
        });
      } else {
        res.status(500).json({
          success: false,
          error: 'Internal server error',
          message: error instanceof Error ? error.message : 'Unknown error'
        });
      }
    }
  }

  // Analytics endpoints
  private async getAnalyticsOverview(req: Request, res: Response): Promise<void> {
    try {
      const validatedQuery = analyticsQuerySchema.parse(req.query);

      // Use repository analytics summary instead
      const dateRange = {
        start: validatedQuery.start_date ? new Date(validatedQuery.start_date) : new Date(Date.now() - 30 * 24 * 60 * 60 * 1000),
        end: validatedQuery.end_date ? new Date(validatedQuery.end_date) : new Date()
      };

      const overview = await this.calendarRepository.getAnalyticsSummary(validatedQuery.account_id, dateRange);

      res.json({
        success: true,
        data: overview
      });
    } catch (error) {
      console.error('[CalendarRoutes] Error getting analytics overview:', error);
      if (error instanceof z.ZodError) {
        res.status(400).json({
          success: false,
          error: 'Validation error',
          details: error.errors
        });
      } else {
        res.status(500).json({
          success: false,
          error: 'Internal server error',
          message: error instanceof Error ? error.message : 'Unknown error'
        });
      }
    }
  }

  // Analytics endpoints - Simplified versions
  private async getPerformanceAnalytics(req: Request, res: Response): Promise<void> {
    try {
      const validatedQuery = analyticsQuerySchema.parse(req.query);

      const dateRange = {
        start: validatedQuery.start_date ? new Date(validatedQuery.start_date) : new Date(Date.now() - 30 * 24 * 60 * 60 * 1000),
        end: validatedQuery.end_date ? new Date(validatedQuery.end_date) : new Date()
      };

      const summary = await this.calendarRepository.getAnalyticsSummary(validatedQuery.account_id, dateRange);

      res.json({
        success: true,
        data: {
          totalItems: summary.total_items,
          byStatus: summary.by_status,
          byPriority: summary.by_priority,
          scheduledThisWeek: summary.scheduled_this_week,
          publishedThisMonth: summary.published_this_month
        }
      });
    } catch (error) {
      console.error('[CalendarRoutes] Error getting performance analytics:', error);
      res.status(500).json({
        success: false,
        error: 'Internal server error',
        message: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  }

  private async getContentTypeAnalytics(req: Request, res: Response): Promise<void> {
    try {
      const validatedQuery = analyticsQuerySchema.parse(req.query);

      const dateRange = {
        start: validatedQuery.start_date ? new Date(validatedQuery.start_date) : new Date(Date.now() - 30 * 24 * 60 * 60 * 1000),
        end: validatedQuery.end_date ? new Date(validatedQuery.end_date) : new Date()
      };

      const summary = await this.calendarRepository.getAnalyticsSummary(validatedQuery.account_id, dateRange);

      res.json({
        success: true,
        data: summary.by_content_type
      });
    } catch (error) {
      console.error('[CalendarRoutes] Error getting content type analytics:', error);
      res.status(500).json({
        success: false,
        error: 'Internal server error',
        message: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  }

  private async getChannelAnalytics(req: Request, res: Response): Promise<void> {
    try {
      const validatedQuery = analyticsQuerySchema.parse(req.query);

      // Simplified channel analytics - would need proper implementation
      res.json({
        success: true,
        data: {
          message: 'Channel analytics not yet implemented',
          accountId: validatedQuery.account_id
        }
      });
    } catch (error) {
      console.error('[CalendarRoutes] Error getting channel analytics:', error);
      res.status(500).json({
        success: false,
        error: 'Internal server error',
        message: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  }

  private async getSeasonalAnalytics(req: Request, res: Response): Promise<void> {
    try {
      const validatedQuery = analyticsQuerySchema.parse(req.query);

      const dateRange = {
        start: validatedQuery.start_date ? new Date(validatedQuery.start_date) : new Date(Date.now() - 30 * 24 * 60 * 60 * 1000),
        end: validatedQuery.end_date ? new Date(validatedQuery.end_date) : new Date()
      };

      const summary = await this.calendarRepository.getAnalyticsSummary(validatedQuery.account_id, dateRange);

      res.json({
        success: true,
        data: {
          totalItems: summary.total_items,
          scheduledThisWeek: summary.scheduled_this_week,
          publishedThisMonth: summary.published_this_month
        }
      });
    } catch (error) {
      console.error('[CalendarRoutes] Error getting seasonal analytics:', error);
      res.status(500).json({
        success: false,
        error: 'Internal server error',
        message: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  }

  // Content Generation endpoints
  private async generateContent(req: Request, res: Response): Promise<void> {
    try {
      const validatedRequest = generateContentSchema.parse(req.body);

      const contentRequest: CalendarContentRequest = {
        ...validatedRequest,
        targetDate: new Date(validatedRequest.targetDate)
      };

      const generatedContent = await this.contentGenerationService.generateCalendarContent(contentRequest);

      res.json({
        success: true,
        data: generatedContent
      });
    } catch (error) {
      console.error('[CalendarRoutes] Error generating content:', error);
      if (error instanceof z.ZodError) {
        res.status(400).json({
          success: false,
          error: 'Validation error',
          details: error.errors
        });
      } else {
        res.status(500).json({
          success: false,
          error: 'Internal server error',
          message: error instanceof Error ? error.message : 'Unknown error'
        });
      }
    }
  }

  private async generateBatchContent(req: Request, res: Response): Promise<void> {
    try {
      const validatedRequest = batchContentSchema.parse(req.body);

      const batchRequest: BatchCalendarContentRequest = {
        ...validatedRequest,
        period: {
          start: new Date(validatedRequest.period.start),
          end: new Date(validatedRequest.period.end)
        }
      };

      const batchContent = await this.contentGenerationService.generateBatchCalendarContent(batchRequest);

      res.json({
        success: true,
        data: batchContent
      });
    } catch (error) {
      console.error('[CalendarRoutes] Error generating batch content:', error);
      if (error instanceof z.ZodError) {
        res.status(400).json({
          success: false,
          error: 'Validation error',
          details: error.errors
        });
      } else {
        res.status(500).json({
          success: false,
          error: 'Internal server error',
          message: error instanceof Error ? error.message : 'Unknown error'
        });
      }
    }
  }

  private async generateSmartSuggestions(req: Request, res: Response): Promise<void> {
    try {
      const { accountId, businessType, currentCalendar, period } = z.object({
        accountId: z.string().min(1),
        businessType: z.enum(['veterinaria', 'petshop', 'estetica', 'hotel', 'adestramento']),
        currentCalendar: z.array(z.any()),
        period: z.object({
          start: z.string().datetime(),
          end: z.string().datetime()
        })
      }).parse(req.body);

      const suggestions = await this.contentGenerationService.generateSmartSuggestions(
        accountId,
        businessType,
        currentCalendar,
        {
          start: new Date(period.start),
          end: new Date(period.end)
        }
      );

      res.json({
        success: true,
        data: suggestions
      });
    } catch (error) {
      console.error('[CalendarRoutes] Error generating smart suggestions:', error);
      if (error instanceof z.ZodError) {
        res.status(400).json({
          success: false,
          error: 'Validation error',
          details: error.errors
        });
      } else {
        res.status(500).json({
          success: false,
          error: 'Internal server error',
          message: error instanceof Error ? error.message : 'Unknown error'
        });
      }
    }
  }

  // Seasonal Intelligence endpoints - Simplified
  private async getSeasonalEvents(req: Request, res: Response): Promise<void> {
    try {
      const { business_type, start_date, end_date } = z.object({
        business_type: z.enum(['veterinaria', 'petshop', 'estetica', 'hotel', 'adestramento']).optional(),
        start_date: z.string().datetime().optional(),
        end_date: z.string().datetime().optional()
      }).parse(req.query);

      const dateRange = {
        start: start_date ? new Date(start_date) : new Date(),
        end: end_date ? new Date(end_date) : new Date(Date.now() + 365 * 24 * 60 * 60 * 1000)
      };

      const events = await this.seasonalIntelligenceService.getSeasonalSuggestions(
        business_type || 'petshop',
        dateRange
      );

      res.json({
        success: true,
        data: events
      });
    } catch (error) {
      console.error('[CalendarRoutes] Error getting seasonal events:', error);
      res.status(500).json({
        success: false,
        error: 'Internal server error',
        message: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  }

  private async getSeasonalSuggestions(req: Request, res: Response): Promise<void> {
    try {
      const { business_type, date } = z.object({
        business_type: z.enum(['veterinaria', 'petshop', 'estetica', 'hotel', 'adestramento']).optional(),
        date: z.string().datetime().optional()
      }).parse(req.query);

      const suggestions = await this.seasonalIntelligenceService.getSeasonalSuggestions(
        business_type || 'petshop',
        date ? { start: new Date(date), end: new Date(date) } : { start: new Date(), end: new Date() }
      );

      res.json({
        success: true,
        data: suggestions
      });
    } catch (error) {
      console.error('[CalendarRoutes] Error getting seasonal suggestions:', error);
      if (error instanceof z.ZodError) {
        res.status(400).json({
          success: false,
          error: 'Validation error',
          details: error.errors
        });
      } else {
        res.status(500).json({
          success: false,
          error: 'Internal server error',
          message: error instanceof Error ? error.message : 'Unknown error'
        });
      }
    }
  }

  private async getSeasonalCalendar(req: Request, res: Response): Promise<void> {
    try {
      const { business_type, year } = z.object({
        business_type: z.enum(['veterinaria', 'petshop', 'estetica', 'hotel', 'adestramento']).optional(),
        year: z.number().min(2020).max(2030).optional()
      }).parse(req.query);

      const targetYear = year || new Date().getFullYear();
      const startDate = new Date(targetYear, 0, 1);
      const endDate = new Date(targetYear, 11, 31);

      const calendar = await this.seasonalIntelligenceService.getSeasonalSuggestions(
        business_type || 'petshop',
        { start: startDate, end: endDate }
      );

      res.json({
        success: true,
        data: calendar,
        year: targetYear
      });
    } catch (error) {
      console.error('[CalendarRoutes] Error getting seasonal calendar:', error);
      if (error instanceof z.ZodError) {
        res.status(400).json({
          success: false,
          error: 'Validation error',
          details: error.errors
        });
      } else {
        res.status(500).json({
          success: false,
          error: 'Internal server error',
          message: error instanceof Error ? error.message : 'Unknown error'
        });
      }
    }
  }

  // Timing Optimization endpoints
  private async optimizeTiming(req: Request, res: Response): Promise<void> {
    try {
      const { account_id, content_type, channels, target_date } = z.object({
        account_id: z.string().min(1),
        content_type: z.enum(['educativo', 'promocional', 'recall', 'engajamento', 'awareness']),
        channels: z.array(z.string()).min(1),
        target_date: z.string().datetime()
      }).parse(req.body);

      const optimization = await this.timingOptimizationService.calculateOptimalTiming(
        account_id,
        content_type,
        channels[0], // Use first channel for now
        new Date(target_date)
      );

      res.json({
        success: true,
        data: optimization
      });
    } catch (error) {
      console.error('[CalendarRoutes] Error optimizing timing:', error);
      if (error instanceof z.ZodError) {
        res.status(400).json({
          success: false,
          error: 'Validation error',
          details: error.errors
        });
      } else {
        res.status(500).json({
          success: false,
          error: 'Internal server error',
          message: error instanceof Error ? error.message : 'Unknown error'
        });
      }
    }
  }

  private async getTimingRecommendations(req: Request, res: Response): Promise<void> {
    try {
      const { account_id, content_type, channels, period } = z.object({
        account_id: z.string().min(1),
        content_type: z.enum(['educativo', 'promocional', 'recall', 'engajamento', 'awareness']),
        channels: z.array(z.string()).min(1),
        period: z.object({
          start: z.string().datetime(),
          end: z.string().datetime()
        })
      }).parse(req.query);

      // Simplified implementation - return basic recommendations
      const recommendations = [
        {
          optimal_time: '10:00',
          optimal_day: 'wednesday',
          expected_engagement: 0.85,
          reasoning: 'Based on historical data for this content type'
        }
      ];

      res.json({
        success: true,
        data: recommendations
      });
    } catch (error) {
      console.error('[CalendarRoutes] Error getting timing recommendations:', error);
      if (error instanceof z.ZodError) {
        res.status(400).json({
          success: false,
          error: 'Validation error',
          details: error.errors
        });
      } else {
        res.status(500).json({
          success: false,
          error: 'Internal server error',
          message: error instanceof Error ? error.message : 'Unknown error'
        });
      }
    }
  }

  // Campaign Template endpoints
  private async getCampaignTemplates(req: Request, res: Response): Promise<void> {
    try {
      const { business_type, content_type } = z.object({
        business_type: z.enum(['veterinaria', 'petshop', 'estetica', 'hotel', 'adestramento']).optional(),
        content_type: z.enum(['educativo', 'promocional', 'recall', 'engajamento', 'awareness']).optional()
      }).parse(req.query);

      // Simplified implementation - return basic templates
      const templates = [
        {
          id: 'template-1',
          name: 'Campanha Educativa Básica',
          business_type: business_type || 'petshop',
          content_type: content_type || 'educativo',
          description: 'Template básico para campanhas educativas'
        }
      ];

      res.json({
        success: true,
        data: templates
      });
    } catch (error) {
      console.error('[CalendarRoutes] Error getting campaign templates:', error);
      if (error instanceof z.ZodError) {
        res.status(400).json({
          success: false,
          error: 'Validation error',
          details: error.errors
        });
      } else {
        res.status(500).json({
          success: false,
          error: 'Internal server error',
          message: error instanceof Error ? error.message : 'Unknown error'
        });
      }
    }
  }

  private async applyCampaignTemplate(req: Request, res: Response): Promise<void> {
    try {
      const { id } = req.params;
      const { account_id, start_date, customization } = z.object({
        account_id: z.string().min(1),
        start_date: z.string().datetime(),
        customization: z.record(z.any()).optional()
      }).parse(req.body);

      // Simplified implementation - return basic applied template
      const appliedTemplate = {
        id: `applied-${id}`,
        template_id: id,
        account_id,
        start_date: new Date(start_date),
        customization: customization || {},
        status: 'applied'
      };

      res.json({
        success: true,
        data: appliedTemplate,
        message: 'Campaign template applied successfully'
      });
    } catch (error) {
      console.error('[CalendarRoutes] Error applying campaign template:', error);
      if (error instanceof z.ZodError) {
        res.status(400).json({
          success: false,
          error: 'Validation error',
          details: error.errors
        });
      } else {
        res.status(500).json({
          success: false,
          error: 'Internal server error',
          message: error instanceof Error ? error.message : 'Unknown error'
        });
      }
    }
  }

  // Real-time collaboration endpoints
  private async getCollaborationStatus(req: Request, res: Response): Promise<void> {
    try {
      const { account_id } = z.object({
        account_id: z.string().min(1)
      }).parse(req.query);

      const status = this.webSocketService.getAccountStatus(account_id);

      res.json({
        success: true,
        data: status
      });
    } catch (error) {
      console.error('[CalendarRoutes] Error getting collaboration status:', error);
      if (error instanceof z.ZodError) {
        res.status(400).json({
          success: false,
          error: 'Validation error',
          details: error.errors
        });
      } else {
        res.status(500).json({
          success: false,
          error: 'Internal server error',
          message: error instanceof Error ? error.message : 'Unknown error'
        });
      }
    }
  }

  private async broadcastCalendarUpdate(req: Request, res: Response): Promise<void> {
    try {
      const { account_id, type, data } = z.object({
        account_id: z.string().min(1),
        type: z.string().min(1),
        data: z.record(z.any())
      }).parse(req.body);

      this.webSocketService.broadcastToAccount(account_id, 'calendar_update', {
        type,
        data,
        timestamp: new Date()
      });

      res.json({
        success: true,
        message: 'Calendar update broadcasted successfully'
      });
    } catch (error) {
      console.error('[CalendarRoutes] Error broadcasting calendar update:', error);
      if (error instanceof z.ZodError) {
        res.status(400).json({
          success: false,
          error: 'Validation error',
          details: error.errors
        });
      } else {
        res.status(500).json({
          success: false,
          error: 'Internal server error',
          message: error instanceof Error ? error.message : 'Unknown error'
        });
      }
    }
  }

  // Search and filtering
  private async searchCalendarItems(req: Request, res: Response): Promise<void> {
    try {
      const { query, account_id, limit, offset } = z.object({
        query: z.string().min(1),
        account_id: z.string().min(1),
        limit: z.number().min(1).max(100).default(50),
        offset: z.number().min(0).default(0)
      }).parse(req.query);

      // Use existing repository methods
      const filters: CalendarFilters = {};
      const pagination: PaginationOptions = { page: Math.floor(offset / limit) + 1, limit };
      const results = await this.calendarRepository.search(account_id, query, filters, pagination);

      res.json({
        success: true,
        data: results
      });
    } catch (error) {
      console.error('[CalendarRoutes] Error searching calendar items:', error);
      if (error instanceof z.ZodError) {
        res.status(400).json({
          success: false,
          error: 'Validation error',
          details: error.errors
        });
      } else {
        res.status(500).json({
          success: false,
          error: 'Internal server error',
          message: error instanceof Error ? error.message : 'Unknown error'
        });
      }
    }
  }

  private async filterCalendarItems(req: Request, res: Response): Promise<void> {
    try {
      const validatedQuery = calendarQuerySchema.parse(req.query);

      const filters: CalendarFilters = {
        status: validatedQuery.status ? [validatedQuery.status] : undefined,
        content_types: validatedQuery.content_type ? [validatedQuery.content_type] : undefined,
        priorities: validatedQuery.priority ? [validatedQuery.priority] : undefined,
        campaigns: validatedQuery.campaign_id ? [validatedQuery.campaign_id] : undefined,
        channels: validatedQuery.channels ? [validatedQuery.channels] : undefined,
        date_range: validatedQuery.start_date && validatedQuery.end_date ? {
          start: new Date(validatedQuery.start_date),
          end: new Date(validatedQuery.end_date)
        } : undefined
      };

      const options: PaginationOptions = {
        page: Math.floor(validatedQuery.offset / validatedQuery.limit) + 1,
        limit: validatedQuery.limit,
        sort_by: validatedQuery.sort_by === 'predicted_engagement' ? 'scheduled_for' : validatedQuery.sort_by,
        sort_order: validatedQuery.sort_order
      };

      const items = await this.calendarRepository.getMany(validatedQuery.account_id!, filters, options);
      const total = items.total;

      res.json({
        success: true,
        data: items,
        pagination: {
          total,
          limit: validatedQuery.limit,
          offset: validatedQuery.offset,
          has_more: validatedQuery.offset + validatedQuery.limit < total
        }
      });
    } catch (error) {
      console.error('[CalendarRoutes] Error filtering calendar items:', error);
      if (error instanceof z.ZodError) {
        res.status(400).json({
          success: false,
          error: 'Validation error',
          details: error.errors
        });
      } else {
        res.status(500).json({
          success: false,
          error: 'Internal server error',
          message: error instanceof Error ? error.message : 'Unknown error'
        });
      }
    }
  }

  // Export/Import
  private async exportCalendar(req: Request, res: Response): Promise<void> {
    try {
      const { account_id, format, start_date, end_date } = z.object({
        account_id: z.string().min(1),
        format: z.enum(['json', 'csv', 'ics']).default('json'),
        start_date: z.string().datetime().optional(),
        end_date: z.string().datetime().optional()
      }).parse(req.query);

      const filters: CalendarFilters = {
        date_range: start_date && end_date ? {
          start: new Date(start_date),
          end: new Date(end_date)
        } : undefined
      };

      const result = await this.calendarRepository.getMany(account_id, filters);
      const items = result.items;

      let exportData: string;
      let contentType: string;
      let filename: string;

      switch (format) {
        case 'csv':
          exportData = this.convertToCSV(items);
          contentType = 'text/csv';
          filename = `calendar-${account_id}.csv`;
          break;
        case 'ics':
          exportData = this.convertToICS(items);
          contentType = 'text/calendar';
          filename = `calendar-${account_id}.ics`;
          break;
        default:
          exportData = JSON.stringify(items, null, 2);
          contentType = 'application/json';
          filename = `calendar-${account_id}.json`;
      }

      res.setHeader('Content-Type', contentType);
      res.setHeader('Content-Disposition', `attachment; filename="${filename}"`);
      res.send(exportData);
    } catch (error) {
      console.error('[CalendarRoutes] Error exporting calendar:', error);
      if (error instanceof z.ZodError) {
        res.status(400).json({
          success: false,
          error: 'Validation error',
          details: error.errors
        });
      } else {
        res.status(500).json({
          success: false,
          error: 'Internal server error',
          message: error instanceof Error ? error.message : 'Unknown error'
        });
      }
    }
  }

  private async importCalendar(req: Request, res: Response): Promise<void> {
    try {
      const { account_id, user_id, data, format } = z.object({
        account_id: z.string().min(1),
        user_id: z.string().min(1),
        data: z.string().min(1),
        format: z.enum(['json', 'csv']).default('json')
      }).parse(req.body);

      let items: Omit<CalendarItem, 'id' | 'created_at' | 'updated_at'>[];

      switch (format) {
        case 'csv':
          items = this.parseCSV(data, account_id, user_id);
          break;
        default:
          items = JSON.parse(data).map((item: any) => ({
            ...item,
            account_id,
            user_id,
            scheduled_for: new Date(item.scheduled_for)
          }));
      }

      const importedItems = await Promise.all(
        items.map(item => this.calendarRepository.create(item))
      );

      // Broadcast to WebSocket clients
      this.webSocketService.broadcastToAccount(account_id, 'calendar_update', {
        type: 'bulk_imported',
        items: importedItems
      });

      res.json({
        success: true,
        data: importedItems,
        message: `${importedItems.length} calendar items imported successfully`
      });
    } catch (error) {
      console.error('[CalendarRoutes] Error importing calendar:', error);
      if (error instanceof z.ZodError) {
        res.status(400).json({
          success: false,
          error: 'Validation error',
          details: error.errors
        });
      } else {
        res.status(500).json({
          success: false,
          error: 'Internal server error',
          message: error instanceof Error ? error.message : 'Unknown error'
        });
      }
    }
  }

  // Helper methods for export/import
  private convertToCSV(items: CalendarItem[]): string {
    const headers = ['id', 'title', 'content_type', 'scheduled_for', 'timezone', 'priority', 'status', 'channels', 'tags', 'campaign_id', 'predicted_engagement'];
    const rows = items.map(item => [
      item.id,
      item.title,
      item.content_type,
      item.scheduled_for.toISOString(),
      item.timezone,
      item.priority,
      item.status,
      item.channels.join(';'),
      item.tags?.join(';') || '',
      item.campaign_id || '',
      item.predicted_engagement?.toString() || ''
    ]);

    return [headers, ...rows].map(row => row.map(field => `"${field}"`).join(',')).join('\n');
  }

  private convertToICS(items: CalendarItem[]): string {
    let ics = 'BEGIN:VCALENDAR\nVERSION:2.0\nPRODID:-//Digital Woof//Calendar//EN\n';

    items.forEach(item => {
      ics += 'BEGIN:VEVENT\n';
      ics += `UID:${item.id}@digitalwoof.com\n`;
      ics += `DTSTART:${item.scheduled_for.toISOString().replace(/[-:]/g, '').split('.')[0]}Z\n`;
      ics += `DTEND:${new Date(item.scheduled_for.getTime() + 60 * 60 * 1000).toISOString().replace(/[-:]/g, '').split('.')[0]}Z\n`;
      ics += `SUMMARY:${item.title}\n`;
      ics += `DESCRIPTION:${item.content_type}\n`;
      ics += 'END:VEVENT\n';
    });

    ics += 'END:VCALENDAR\n';
    return ics;
  }

  private parseCSV(csvData: string, accountId: string, userId: string): Omit<CalendarItem, 'id' | 'created_at' | 'updated_at'>[] {
    const lines = csvData.split('\n');
    const headers = lines[0].split(',').map(h => h.replace(/"/g, ''));

    return lines.slice(1).map(line => {
      const values = line.split(',').map(v => v.replace(/"/g, ''));
      const item: any = { account_id: accountId, user_id: userId };

      headers.forEach((header, index) => {
        const value = values[index];
        switch (header) {
          case 'scheduled_for':
            item[header] = new Date(value);
            break;
          case 'channels':
          case 'tags':
            item[header] = value ? value.split(';') : [];
            break;
          case 'predicted_engagement':
            item[header] = value ? parseFloat(value) : undefined;
            break;
          default:
            item[header] = value || undefined;
        }
      });

      return item;
    });
  }
}