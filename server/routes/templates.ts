/**
 * Campaign Template API Routes
 * 
 * Provides REST endpoints for campaign template management
 */

import { Request, Response, Router } from 'express';
import { z } from 'zod';
import { createCampaignRepositories } from '../repositories';
import { QueryOptimizer } from '../services/QueryOptimizer';
import { 
  CampaignCategory, 
  ServiceType
} from '../models/campaign';

// Request validation schemas
const TemplateListQuerySchema = z.object({
  category: z.nativeEnum(CampaignCategory).optional(),
  serviceType: z.nativeEnum(ServiceType).optional(),
  isPublic: z.coerce.boolean().optional(),
  isPremium: z.coerce.boolean().optional(),
  createdBy: z.string().uuid().optional(),
  page: z.coerce.number().int().min(1).default(1),
  limit: z.coerce.number().int().min(1).max(100).default(20),
  sortBy: z.enum(['name', 'createdAt', 'usageCount', 'avgEngagementRate']).default('createdAt'),
  sortOrder: z.enum(['asc', 'desc']).default('desc'),
  search: z.string().min(1).max(100).optional(),
  minRating: z.coerce.number().min(0).max(5).optional(),
  maxUsageCount: z.coerce.number().int().min(0).optional(),
}).strict();

const TemplateSearchQuerySchema = z.object({
  q: z.string().min(1).max(100),
  limit: z.coerce.number().int().min(1).max(50).default(20),
}).strict();

const TemplatePopularQuerySchema = z.object({
  limit: z.coerce.number().int().min(1).max(50).default(10),
}).strict();

// Router instance
export const templateRouter = Router();

/**
 * GET /api/templates
 */
templateRouter.get('/', async (req: any, res: Response) => {
  try {
    const query = TemplateListQuerySchema.parse(req.query);
    const { campaignTemplates: templateRepository } = createCampaignRepositories(req.db);
    const optimizer = new QueryOptimizer();

    const filters = {
      category: query.category,
      serviceType: query.serviceType,
      isPublic: query.isPublic,
      isPremium: query.isPremium,
      createdBy: query.createdBy,
      search: query.search,
      minRating: query.minRating,
      maxUsageCount: query.maxUsageCount,
    };
    
    const pagination = {
      page: query.page,
      limit: query.limit,
      sortBy: query.sortBy,
      sortOrder: query.sortOrder,
    };
    
    // Otimização de query em tempo real
    const findManyQuery = templateRepository.getFindManyQuery(filters, pagination);
    const optimizationResult = await optimizer.optimizeQuery(findManyQuery);
    
    if (optimizationResult.performanceGain > 10) {
      console.log(`Query optimized, gain: ${optimizationResult.performanceGain.toFixed(2)}%`);
      // Em um cenário real, executaríamos a query otimizada
    }

    const result = await templateRepository.findMany(filters, pagination);
    
    const response = {
      templates: result.templates,
      pagination: {
        page: query.page,
        limit: query.limit,
        totalCount: result.totalCount,
        totalPages: Math.ceil(result.totalCount / query.limit),
        hasMore: result.hasMore,
      },
      filters: {
        category: query.category || null,
        serviceType: query.serviceType || null,
        isPublic: query.isPublic ?? null,
        isPremium: query.isPremium ?? null,
        search: query.search || null,
      },
      _optimization: {
        performanceGain: optimizationResult.performanceGain,
        recommendations: (await optimizer.analyzeQuery(findManyQuery)).recommendations
      }
    };
    
    res.json(response);
    
  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({
        error: 'Validation Error',
        message: 'Invalid query parameters',
        details: error.errors,
      });
    }
    
    console.error('Template listing error:', error);
    res.status(500).json({
      error: 'Internal Server Error',
      message: 'Failed to fetch templates',
    });
  }
});

/**
 * GET /api/templates/search
 */
templateRouter.get('/search', async (req: any, res: Response) => {
  try {
    const query = TemplateSearchQuerySchema.parse(req.query);
    const { campaignTemplates: templateRepository } = createCampaignRepositories(req.db);
    
    const templates = await templateRepository.search(query.q, query.limit);
    
    res.json({
      query: query.q,
      results: templates,
      count: templates.length,
    });
    
  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({
        error: 'Validation Error',
        message: 'Invalid search parameters',
        details: error.errors,
      });
    }
    
    console.error('Template search error:', error);
    res.status(500).json({
      error: 'Internal Server Error',
      message: 'Search failed',
    });
  }
});

/**
 * GET /api/templates/popular
 */
templateRouter.get('/popular', async (req: any, res: Response) => {
  try {
    const query = TemplatePopularQuerySchema.parse(req.query);
    const { campaignTemplates: templateRepository } = createCampaignRepositories(req.db);
    
    const templates = await templateRepository.findPopular(query.limit);
    
    res.json({
      popular: templates,
      count: templates.length,
    });
    
  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({
        error: 'Validation Error',
        message: 'Invalid parameters',
        details: error.errors,
      });
    }
    
    console.error('Popular templates error:', error);
    res.status(500).json({
      error: 'Internal Server Error',
      message: 'Failed to fetch popular templates',
    });
  }
});

/**
 * GET /api/templates/:id
 */
templateRouter.get('/:id', async (req: any, res: Response) => {
  try {
    const templateId = req.params.id;
    
    if (!templateId.match(/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i)) {
      return res.status(400).json({
        error: 'Validation Error',
        message: 'Invalid template ID format',
      });
    }
    
    const { campaignTemplates: templateRepository } = createCampaignRepositories(req.db);
    const template = await templateRepository.findById(templateId);
    
    if (!template) {
      return res.status(404).json({
        error: 'Not Found',
        message: 'Template not found',
      });
    }
    
    res.json(template);
    
  } catch (error) {
    console.error('Template detail error:', error);
    res.status(500).json({
      error: 'Internal Server Error',
      message: 'Failed to fetch template',
    });
  }
});

/**
 * POST /api/templates/:id/usage
 */
templateRouter.post('/:id/usage', async (req: any, res: Response) => {
  try {
    const templateId = req.params.id;
    
    if (!templateId.match(/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i)) {
      return res.status(400).json({
        error: 'Validation Error',
        message: 'Invalid template ID format',
      });
    }
    
    const { campaignTemplates: templateRepository } = createCampaignRepositories(req.db);
    await templateRepository.incrementUsage(templateId);
    
    res.json({
      success: true,
      message: 'Usage count incremented',
    });
    
  } catch (error) {
    console.error('Usage increment error:', error);
    res.status(500).json({
      error: 'Internal Server Error',
      message: 'Failed to increment usage',
    });
  }
});

/**
 * GET /api/templates/:id/performance
 */
templateRouter.get('/:id/performance', async (req: any, res: Response) => {
  try {
    const templateId = req.params.id;
    
    if (!templateId.match(/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i)) {
      return res.status(400).json({
        error: 'Validation Error',
        message: 'Invalid template ID format',
      });
    }
    
    const { performance: performanceRepository } = createCampaignRepositories(req.db);
    const performance = await performanceRepository.getTemplatePerformance(templateId);
    
    if (!performance) {
      return res.status(404).json({
        error: 'Not Found',
        message: 'Performance data not found',
      });
    }
    
    res.json(performance);
    
  } catch (error) {
    console.error('Performance data error:', error);
    res.status(500).json({
      error: 'Internal Server Error',
      message: 'Failed to fetch performance data',
    });
  }
});

/**
 * GET /api/templates/compare
 */
templateRouter.get('/compare', async (req: any, res: Response) => {
  try {
    const idsParam = req.query.ids as string;
    
    if (!idsParam) {
      return res.status(400).json({
        error: 'Validation Error',
        message: 'Template IDs are required',
      });
    }
    
    const templateIds = idsParam.split(',').map(id => id.trim());
    
    if (templateIds.length < 2 || templateIds.length > 5) {
      return res.status(400).json({
        error: 'Validation Error',
        message: 'Please provide 2-5 template IDs for comparison',
      });
    }
    
    const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
    const invalidIds = templateIds.filter(id => !uuidRegex.test(id));
    
    if (invalidIds.length > 0) {
      return res.status(400).json({
        error: 'Validation Error',
        message: `Invalid template ID format: ${invalidIds.join(', ')}`,
      });
    }
    
    const { campaignTemplates: templateRepository } = createCampaignRepositories(req.db);
    const comparison = await templateRepository.getComparisonData(templateIds);
    
    res.json({
      templates: comparison,
      count: comparison.length,
    });
    
  } catch (error) {
    console.error('Template comparison error:', error);
    res.status(500).json({
      error: 'Internal Server Error',
      message: 'Failed to compare templates',
    });
  }
});

export default templateRouter;