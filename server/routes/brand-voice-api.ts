import { Router } from 'express';
import { z } from 'zod';
import { BrandVoiceDefaultsService } from '../services/brand-voice-defaults.service';
import { BrandVoiceCreateSchema } from '../../shared/schemas/brand-voice';
import { logger } from '../utils/logger';

/**
 * Brand Voice REST API Endpoints - Simplified Version
 * 
 * Provides basic RESTful API for Brand Voice management
 * with mock data and essential functionality
 */

const router = Router();

// Request validation schemas
const GenerateBrandVoiceRequestSchema = z.object({
  businessInfo: z.object({
    name: z.string().min(1),
    segment: z.enum(['veterinaria', 'petshop', 'banho_tosa', 'hotel_pet', 'agropet']),
    businessType: z.enum(['clinica', 'comercio', 'servico', 'misto']),
    description: z.string().optional()
  }),
  preferences: z.object({
    tone: z.object({
      formal: z.number().min(0).max(1).optional(),
      friendly: z.number().min(0).max(1).optional(),
      professional: z.number().min(0).max(1).optional()
    }).optional(),
    customValues: z.array(z.string()).optional(),
    targetAudience: z.string().optional()
  }).optional(),
  options: z.object({
    useDefaults: z.boolean().default(true),
    qualityOptimized: z.boolean().default(false)
  }).optional()
});

// Middleware for request validation
const validateRequest = (schema: z.ZodSchema) => {
  return (req: any, res: any, next: any) => {
    try {
      req.validatedBody = schema.parse(req.body);
      next();
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({
          error: 'Validation Error',
          message: 'Invalid request data',
          details: error.errors.map(err => ({
            field: err.path.join('.'),
            message: err.message,
            code: err.code
          }))
        });
      }
      next(error);
    }
  };
};

// Middleware for user authentication and context
const requireAuth = (req: any, res: any, next: any) => {
  const userId = req.headers['x-user-id'] || req.session?.userId || req.user?.id || 'default-user';
  req.userId = userId;
  next();
};

// Error handler middleware
const handleApiError = (error: any, req: any, res: any, next: any) => {
  logger.error('API Error', error?.message || 'Unknown error', {
    requestUrl: req.originalUrl,
    method: req.method,
    userId: req.userId
  });

  if (error.name === 'ValidationError') {
    return res.status(400).json({
      error: 'Validation Error',
      message: error.message
    });
  }

  if (error.message && error.message.includes('not found')) {
    return res.status(404).json({
      error: 'Not Found',
      message: error.message
    });
  }

  return res.status(500).json({
    error: 'Internal Server Error',
    message: 'An unexpected error occurred'
  });
};

/**
 * Legacy endpoint - Get brand voice profile for compatibility
 */
router.get("/profile", requireAuth, async (req: any, res: any, next: any) => {
  try {
    const userId = req.userId;
    
    logger.info('Fetching brand voice profile (legacy)', { userId });
    
    // Mock active brand voice for legacy compatibility
    const profile = {
      id: 'mock-profile-1',
      name: "VetCare Digital",
      tone: "profissional-empático",
      visualIdentity: {
        status: "complete",
        logo: true,
        colors: true,
        typography: true
      },
      voice: {
        status: "active",
        tone: "profissional-empático",
        description: "Tom profissional e empático, transmitindo confiança e cuidado"
      },
      audience: {
        status: "defined",
        description: "Tutores responsáveis que buscam cuidado veterinário de qualidade"
      },
      consistency: 92.5
    };
    
    res.json(profile);
    
  } catch (error) {
    next(error);
  }
});

/**
 * POST /api/brand-voice/generate
 * Generate a new Brand Voice from business information
 */
router.post('/generate', 
  requireAuth,
  validateRequest(GenerateBrandVoiceRequestSchema),
  async (req: any, res: any, next: any) => {
    try {
      const { businessInfo, preferences, options } = req.validatedBody;
      const userId = req.userId;

      const startTime = Date.now();

      logger.info('Brand Voice generation started', {
        userId,
        segment: businessInfo.segment,
        businessType: businessInfo.businessType,
        hasPreferences: !!preferences,
        options
      });

      // Step 1: Get defaults for the segment
      let brandVoiceDefaults;
      
      if (options?.qualityOptimized) {
        brandVoiceDefaults = BrandVoiceDefaultsService.getQualityOptimizedDefaults(businessInfo.segment);
      } else if (businessInfo.businessType) {
        brandVoiceDefaults = BrandVoiceDefaultsService.getBusinessTypeDefaults(
          businessInfo.segment, 
          businessInfo.businessType
        );
      } else {
        brandVoiceDefaults = BrandVoiceDefaultsService.getSegmentDefaults(businessInfo.segment);
      }

      // Step 2: Apply user preferences
      const customizedBrandVoice = {
        ...brandVoiceDefaults,
        brand: {
          ...brandVoiceDefaults.brand!,
          name: businessInfo.name
        }
      };

      // Apply tone preferences if provided
      if (preferences?.tone) {
        const currentTone = customizedBrandVoice.voice?.tone;
        if (currentTone) {
          customizedBrandVoice.voice = {
            ...customizedBrandVoice.voice!,
            tone: {
              ...currentTone,
              confiança: preferences.tone.professional || currentTone.confiança,
              acolhimento: preferences.tone.friendly || currentTone.acolhimento,
              formalidade: preferences.tone.formal || currentTone.formalidade || 0.6
            }
          };
        }
      }

      // Apply custom target audience if provided
      if (preferences?.targetAudience) {
        customizedBrandVoice.brand!.targetAudience!.primary = preferences.targetAudience;
      }

      // Mock quality calculation
      const qualityScore = Math.random() * 0.3 + 0.7; // Between 0.7 and 1.0

      const totalTime = Date.now() - startTime;

      // Mock saved brand voice
      const savedBrandVoice = {
        id: `brand-voice-${Date.now()}`,
        userId,
        data: customizedBrandVoice,
        metadata: {
          version: '1.0',
          isActive: true,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
          activatedAt: new Date().toISOString()
        },
        qualityScore
      };

      logger.info('Brand Voice generation completed', {
        userId,
        brandVoiceId: savedBrandVoice.id,
        totalTime,
        qualityScore,
        segment: businessInfo.segment
      });

      res.status(201).json({
        success: true,
        data: {
          brandVoice: savedBrandVoice,
          qualityMetrics: {
            overall: qualityScore,
            completeness: Math.random() * 0.2 + 0.8,
            consistency: Math.random() * 0.2 + 0.8,
            specificity: Math.random() * 0.3 + 0.7,
            usability: Math.random() * 0.2 + 0.8
          },
          metadata: {
            generationTime: totalTime,
            activated: true,
            segment: businessInfo.segment
          }
        }
      });

    } catch (error) {
      next(error);
    }
  }
);

/**
 * GET /api/brand-voice/active
 * Get the currently active Brand Voice for the user
 */
router.get('/active',
  requireAuth,
  async (req: any, res: any, next: any) => {
    try {
      const userId = req.userId;
      const includeQuality = req.query.includeQuality === 'true';

      logger.info('Fetching active Brand Voice', { userId, includeQuality });

      // Mock active brand voice
      const veterinariaDefaults = BrandVoiceDefaultsService.getSegmentDefaults('veterinaria');
      
      const activeBrandVoice = {
        id: 'active-brand-voice-1',
        userId,
        data: {
          ...veterinariaDefaults,
          brand: {
            ...veterinariaDefaults.brand!,
            name: 'VetCare Digital'
          }
        },
        metadata: {
          version: '1.0',
          isActive: true,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
          activatedAt: new Date().toISOString()
        },
        qualityScore: 0.92
      };

      let qualityMetrics = null;
      if (includeQuality) {
        qualityMetrics = {
          overall: 0.92,
          completeness: 0.95,
          consistency: 0.88,
          specificity: 0.85,
          usability: 0.90,
          recommendations: [
            {
              category: 'specificity' as const,
              priority: 'medium' as const,
              message: 'Considere adicionar mais termos específicos do seu negócio',
              suggested_action: 'Revisar lexicon preferido'
            }
          ]
        };
      }

      res.json({
        success: true,
        data: {
          brandVoice: activeBrandVoice,
          qualityMetrics
        }
      });

    } catch (error) {
      next(error);
    }
  }
);

/**
 * GET /api/brand-voice/defaults/:segment
 * Get default values for a specific business segment
 */
router.get('/defaults/:segment',
  async (req: any, res: any, next: any) => {
    try {
      const segment = req.params.segment;
      const businessType = req.query.businessType;
      const qualityOptimized = req.query.qualityOptimized === 'true';

      // Validate segment
      if (!['veterinaria', 'petshop', 'banho_tosa', 'hotel_pet', 'agropet'].includes(segment)) {
        return res.status(400).json({
          error: 'Invalid Segment',
          message: 'Segment must be one of: veterinaria, petshop, banho_tosa, hotel_pet, agropet'
        });
      }

      logger.info('Fetching segment defaults', { segment, businessType, qualityOptimized });

      let defaults;
      
      if (qualityOptimized) {
        defaults = BrandVoiceDefaultsService.getQualityOptimizedDefaults(segment as any);
      } else if (businessType) {
        defaults = BrandVoiceDefaultsService.getBusinessTypeDefaults(segment as any, businessType as any);
      } else {
        defaults = BrandVoiceDefaultsService.getSegmentDefaults(segment as any);
      }

      res.json({
        success: true,
        data: {
          segment,
          businessType,
          qualityOptimized,
          defaults
        }
      });

    } catch (error) {
      next(error);
    }
  }
);

/**
 * GET /api/brand-voice/health
 * Health check endpoint for monitoring
 */
router.get('/health',
  async (req: any, res: any, next: any) => {
    try {
      const startTime = Date.now();

      // Test basic functionality
      const testDefaults = BrandVoiceDefaultsService.getSegmentDefaults('veterinaria');

      const responseTime = Date.now() - startTime;

      res.json({
        success: true,
        status: 'healthy',
        timestamp: new Date().toISOString(),
        responseTime,
        services: {
          defaults: !!testDefaults,
          quality: true,  // Mock
          database: true, // Mock
          cache: true     // Mock
        },
        version: '1.0.0'
      });

    } catch (error: any) {
      const errorMsg = error?.message || 'Unknown error';
      logger.error('Health check failed', errorMsg);
      res.status(503).json({
        success: false,
        status: 'unhealthy',
        timestamp: new Date().toISOString(),
        error: errorMsg
      });
    }
  }
);

/**
 * POST /api/brand-voice/quality-check
 * Perform quality analysis on Brand Voice data without saving
 */
router.post('/quality-check',
  requireAuth,
  validateRequest(BrandVoiceCreateSchema),
  async (req: any, res: any, next: any) => {
    try {
      const brandVoiceData = req.validatedBody;
      const userId = req.userId;

      logger.info('Performing quality check', { userId });

      // Mock quality metrics calculation
      const qualityMetrics = {
        overall: Math.random() * 0.3 + 0.7,
        completeness: Math.random() * 0.2 + 0.8,
        consistency: Math.random() * 0.2 + 0.8,
        specificity: Math.random() * 0.3 + 0.7,
        usability: Math.random() * 0.2 + 0.8,
        recommendations: [
          {
            category: 'completeness' as const,
            priority: 'high' as const,
            message: 'Adicione mais detalhes à persona da marca',
            suggested_action: 'Preencher características específicas'
          },
          {
            category: 'specificity' as const,
            priority: 'medium' as const,
            message: 'Use termos mais específicos do seu setor',
            suggested_action: 'Revisar lexicon preferido'
          }
        ]
      };

      res.json({
        success: true,
        data: {
          qualityMetrics,
          recommendations: qualityMetrics.recommendations
        }
      });

    } catch (error) {
      next(error);
    }
  }
);

// Legacy create endpoint for backward compatibility
router.post("/", requireAuth, async (req: any, res: any, next: any) => {
  try {
    const userId = req.userId;
    
    logger.info('Legacy brand voice creation', { userId });
    
    // Convert legacy format to new format
    const legacyData = req.body;
    
    // Mock saved brand voice
    const savedBrandVoice = {
      id: `legacy-brand-voice-${Date.now()}`,
      userId,
      name: legacyData.name || 'Brand Voice',
      tone: legacyData.tone || 'professional',
      description: legacyData.description || '',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      isActive: true
    };
    
    res.json(savedBrandVoice);
    
  } catch (error) {
    next(error);
  }
});

// Apply error handler
router.use(handleApiError);

export default router;