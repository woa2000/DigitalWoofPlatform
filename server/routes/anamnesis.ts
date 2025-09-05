/**
 * Anamnesis REST API Routes
 * Implements RESTful endpoints for digital presence analysis
 */

import express from 'express';
import { z } from 'zod';
import { AnamnesisService } from '../services/anamnesis.service.js';
import { validateAnamnesisRequest } from '../utils/url-validation.js';

const router = express.Router();
const anamnesisService = new AnamnesisService();

// Request validation schemas
const createAnamnesisSchema = z.object({
  primaryUrl: z.string().url('Primary URL must be a valid URL'),
  socialUrls: z.array(z.string().url()).max(10, 'Maximum 10 social URLs allowed').optional(),
  metadata: z.object({
    requestId: z.string().optional(),
    userAgent: z.string().optional(),
    source: z.enum(['dashboard', 'api', 'bulk']).optional()
  }).optional()
});

const listAnalysesSchema = z.object({
  page: z.coerce.number().min(1).max(1000).optional(),
  limit: z.coerce.number().min(1).max(100).optional(),
  status: z.enum(['queued', 'running', 'done', 'error']).optional()
});

// Middleware for user context (simplified for MVP)
const requireUser = (req: express.Request, res: express.Response, next: express.NextFunction) => {
  // In a real implementation, this would validate JWT token
  // For MVP, we'll use a mock user ID
  (req as any).user = {
    id: 'mock-user-id',
    accountId: 'mock-account-id'
  };
  next();
};

// Validation middleware factory
const validateRequest = (schema: z.ZodSchema) => {
  return (req: express.Request, res: express.Response, next: express.NextFunction) => {
    try {
      const validationResult = schema.safeParse(req.body);
      if (!validationResult.success) {
        return res.status(400).json({
          success: false,
          error: 'Validation failed',
          details: validationResult.error.errors.map(err => ({
            field: err.path.join('.'),
            message: err.message
          }))
        });
      }
      req.body = validationResult.data;
      next();
    } catch (error) {
      res.status(400).json({
        success: false,
        error: 'Invalid request format'
      });
    }
  };
};

/**
 * POST /api/anamnesis
 * Creates a new digital presence analysis
 */
router.post('/', 
  requireUser,
  validateRequest(createAnamnesisSchema),
  async (req: express.Request, res: express.Response) => {
    try {
      const userId = (req as any).user.id;
      const result = await anamnesisService.createAnalysis(userId, req.body);

      if (!result.success) {
        return res.status(400).json(result);
      }

      res.status(201).json(result);
    } catch (error) {
      console.error('Error creating analysis:', error);
      res.status(500).json({
        success: false,
        error: 'Internal server error'
      });
    }
  }
);

/**
 * GET /api/anamnesis/:id
 * Retrieves a specific analysis by ID
 */
router.get('/:id', 
  requireUser,
  async (req: express.Request, res: express.Response) => {
    try {
      const userId = (req as any).user.id;
      const analysisId = req.params.id;

      // Validate UUID format
      const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
      if (!uuidRegex.test(analysisId)) {
        return res.status(400).json({
          success: false,
          error: 'Invalid analysis ID format'
        });
      }

      const result = await anamnesisService.getAnalysisById(userId, analysisId);

      if (!result.success) {
        const statusCode = result.error === 'Analysis not found' ? 404 : 400;
        return res.status(statusCode).json(result);
      }

      res.json(result);
    } catch (error) {
      console.error('Error getting analysis:', error);
      res.status(500).json({
        success: false,
        error: 'Internal server error'
      });
    }
  }
);

/**
 * GET /api/anamnesis
 * Lists analyses for the authenticated user with pagination
 */
router.get('/', 
  requireUser,
  async (req: express.Request, res: express.Response) => {
    try {
      const userId = (req as any).user.id;
      
      // Validate query parameters
      const queryValidation = listAnalysesSchema.safeParse(req.query);
      if (!queryValidation.success) {
        return res.status(400).json({
          success: false,
          error: 'Invalid query parameters',
          details: queryValidation.error.errors.map(err => ({
            field: err.path.join('.'),
            message: err.message
          }))
        });
      }

      const options = queryValidation.data;
      const result = await anamnesisService.listAnalyses(userId, options);

      if (!result.success) {
        return res.status(400).json(result);
      }

      res.json(result);
    } catch (error) {
      console.error('Error listing analyses:', error);
      res.status(500).json({
        success: false,
        error: 'Internal server error'
      });
    }
  }
);

/**
 * DELETE /api/anamnesis/:id
 * Soft deletes an analysis (marks as deleted)
 */
router.delete('/:id', 
  requireUser,
  async (req: express.Request, res: express.Response) => {
    try {
      const userId = (req as any).user.id;
      const analysisId = req.params.id;

      // Validate UUID format
      const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
      if (!uuidRegex.test(analysisId)) {
        return res.status(400).json({
          success: false,
          error: 'Invalid analysis ID format'
        });
      }

      const result = await anamnesisService.deleteAnalysis(userId, analysisId);

      if (!result.success) {
        const statusCode = result.error === 'Analysis not found' ? 404 : 400;
        return res.status(statusCode).json(result);
      }

      res.json({
        success: true,
        message: 'Analysis deleted successfully'
      });
    } catch (error) {
      console.error('Error deleting analysis:', error);
      res.status(500).json({
        success: false,
        error: 'Internal server error'
      });
    }
  }
);

/**
 * POST /api/anamnesis/:id/reprocess
 * Reprocesses an existing analysis
 */
router.post('/:id/reprocess', 
  requireUser,
  async (req: express.Request, res: express.Response) => {
    try {
      const userId = (req as any).user.id;
      const analysisId = req.params.id;

      // Validate UUID format
      const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
      if (!uuidRegex.test(analysisId)) {
        return res.status(400).json({
          success: false,
          error: 'Invalid analysis ID format'
        });
      }

      // For MVP, reprocess is not implemented in service yet
      // This is a placeholder for future implementation
      res.status(501).json({
        success: false,
        error: 'Reprocess functionality not yet implemented'
      });
    } catch (error) {
      console.error('Error reprocessing analysis:', error);
      res.status(500).json({
        success: false,
        error: 'Internal server error'
      });
    }
  }
);

/**
 * GET /api/anamnesis/:id/status
 * Gets the current status of an analysis (lightweight endpoint)
 */
router.get('/:id/status', 
  requireUser,
  async (req: express.Request, res: express.Response) => {
    try {
      const userId = (req as any).user.id;
      const analysisId = req.params.id;

      // Validate UUID format
      const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
      if (!uuidRegex.test(analysisId)) {
        return res.status(400).json({
          success: false,
          error: 'Invalid analysis ID format'
        });
      }

      // Get full analysis and extract status info
      const result = await anamnesisService.getAnalysisById(userId, analysisId);

      if (!result.success) {
        const statusCode = result.error === 'Analysis not found' ? 404 : 400;
        return res.status(statusCode).json(result);
      }

      // Return lightweight status response
      res.json({
        success: true,
        data: {
          id: result.data!.id,
          status: result.data!.status,
          scoreCompleteness: result.data!.scoreCompleteness,
          errorMessage: result.data!.errorMessage,
          updatedAt: result.data!.updatedAt,
          sourceCount: result.data!.sources.length
        }
      });
    } catch (error) {
      console.error('Error getting analysis status:', error);
      res.status(500).json({
        success: false,
        error: 'Internal server error'
      });
    }
  }
);

/**
 * GET /api/anamnesis/metrics/deduplication
 * Gets deduplication analytics and metrics
 */
router.get('/metrics/deduplication', 
  requireUser,
  async (req: express.Request, res: express.Response) => {
    try {
      const metrics = anamnesisService.getDeduplicationMetrics();
      
      res.json({
        success: true,
        data: metrics
      });
    } catch (error) {
      console.error('Error getting deduplication metrics:', error);
      res.status(500).json({
        success: false,
        error: 'Internal server error'
      });
    }
  }
);

export default router;