import { Router } from 'express';
import { z } from 'zod';
import { BrandVoiceCRUDService } from '../services/brand-voice.service';
import { BrandVoiceGeneratorService } from '../services/brand-voice-generator.service';
import { BrandVoiceQualityService } from '../services/brand-voice-quality.service';
import { BrandVoiceDefaultsService } from '../services/brand-voice-defaults.service';
import { BrandVoiceCreateSchema, BrandVoiceSchema } from '../../shared/schemas/brand-voice';
import { logger } from '../utils/logger';

/**
 * Brand Voice REST API Endpoints
 * 
 * Provides comprehensive RESTful API for Brand Voice management
 * with validation, error handling, and performance optimization
 */

const router = Router();

// Request validation schemas
const GenerateBrandVoiceRequestSchema = z.object({
  anamnesisData: z.object({
    businessInfo: z.object({
      name: z.string().min(1),
      segment: z.enum(['veterinaria', 'petshop', 'banho_tosa', 'hotel_pet', 'agropet']),
      businessType: z.enum(['clinica', 'comercio', 'servico', 'misto']),
      yearsInBusiness: z.number().min(0).optional(),
      teamSize: z.number().min(1).optional(),
      location: z.string().optional()
    }),
    targetAudience: z.object({
      primary: z.string().optional(),
      demographics: z.array(z.string()).optional(),
      painPoints: z.array(z.string()).optional(),
      goals: z.array(z.string()).optional()
    }).optional(),
    currentChallenges: z.array(z.string()).optional(),
    marketingGoals: z.array(z.string()).optional()
  }),
  onboardingData: z.object({
    brandPersonality: z.object({
      adjectives: z.array(z.string()).optional(),
      tonePreferences: z.object({
        formal: z.number().min(0).max(1).optional(),
        friendly: z.number().min(0).max(1).optional(),
        authoritative: z.number().min(0).max(1).optional(),
        playful: z.number().min(0).max(1).optional()
      }).optional()
    }).optional(),
    communicationStyle: z.object({
      preferredChannels: z.array(z.string()).optional(),
      contentTypes: z.array(z.string()).optional(),
      messagingFrequency: z.string().optional()
    }).optional(),
    brandValues: z.array(z.object({
      name: z.string(),
      description: z.string().optional(),
      importance: z.number().min(0).max(1).optional()
    })).optional()
  }).optional(),
  userOverrides: BrandVoiceCreateSchema.partial().optional(),
  options: z.object({
    useQualityOptimization: z.boolean().default(true),
    generateDefaults: z.boolean().default(true),
    validateQuality: z.boolean().default(true),
    activateImmediately: z.boolean().default(true)
  }).optional()
});

const UpdateBrandVoiceRequestSchema = BrandVoiceCreateSchema.partial();

const ActivateBrandVoiceRequestSchema = z.object({
  reason: z.string().optional()
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
  const userId = req.headers['x-user-id'] || req.session?.userId || req.user?.id;
  if (!userId) {
    return res.status(401).json({
      error: 'Authentication Required',
      message: 'User ID must be provided'
    });
  }
  req.userId = userId;
  next();
};

// Error handler middleware
const handleApiError = (error: any, req: any, res: any, next: any) => {
  logger.error('API Error', {
    endpoint: req.originalUrl,
    method: req.method,
    userId: req.userId,
    errorMessage: error?.message || 'Unknown error',
    stack: error?.stack
  });

  if (error.name === 'ValidationError') {
    return res.status(400).json({
      error: 'Validation Error',
      message: error.message
    });
  }

  if (error.message.includes('not found')) {
    return res.status(404).json({
      error: 'Not Found',
      message: error.message
    });
  }

  if (error.message.includes('already exists')) {
    return res.status(409).json({
      error: 'Conflict',
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
    
    const activeBrandVoice = await BrandVoiceService.getActive(userId);
    
    if (!activeBrandVoice) {
      // Return default profile structure for legacy compatibility
      return res.json({
        id: null,
        name: "Perfil Padrão",
        tone: "profissional-amigável",
        visualIdentity: {
          status: "incomplete",
          logo: false,
          colors: false,
          typography: false
        },
        voice: {
          status: "inactive",
          tone: "profissional-amigável",
          description: "Tom empático e profissional"
        },
        audience: {
          status: "undefined",
          description: "Tutores de pets preocupados com bem-estar"
        },
        consistency: 0
      });
    }
    
    // Transform new Brand Voice format to legacy format
    const profile = {
      id: activeBrandVoice.id,
      name: activeBrandVoice.data.brand.name,
      tone: activeBrandVoice.data.voice.persona.communication_style,
      visualIdentity: {
        status: "complete",
        logo: !!activeBrandVoice.data.visual.logoUrl,
        colors: !!activeBrandVoice.data.visual.palette,
        typography: !!activeBrandVoice.data.visual.typography
      },
      voice: {
        status: "active",
        tone: activeBrandVoice.data.voice.persona.communication_style,
        description: activeBrandVoice.data.voice.persona.description
      },
      audience: {
        status: "defined",
        description: activeBrandVoice.data.brand.targetAudience.primary
      },
      consistency: (activeBrandVoice.metadata?.qualityScore || 0) * 100
    };
    
    res.json(profile);
    
  } catch (error) {
    next(error);
  }
});

/**
 * POST /api/brand-voice/generate
 * Generate a new Brand Voice from anamnesis and onboarding data
 */
router.post('/generate', 
  requireAuth,
  validateRequest(GenerateBrandVoiceRequestSchema),
  async (req: any, res: any, next: any) => {
    try {
      const { anamnesisData, onboardingData, userOverrides, options } = req.validatedBody;
      const userId = req.userId;

      const startTime = Date.now();

      logger.info('Brand Voice generation started', {
        userId,
        segment: anamnesisData.businessInfo.segment,
        businessType: anamnesisData.businessInfo.businessType,
        hasOnboardingData: !!onboardingData,
        hasUserOverrides: !!userOverrides,
        options
      });

      // Step 1: Generate Brand Voice using all available data
      const generatorService = new BrandVoiceGeneratorService();
      const generationResult = await generatorService.generateBrandVoice({
        userId,
        anamnesisAnalysisId: anamnesisData.id || undefined,
        brandOnboardingId: onboardingData?.id || undefined,
        overrides: userOverrides,
        options: {
          includeDefaults: options?.generateDefaults ?? true,
          preferQuality: options?.useQualityOptimization ?? true
        }
      });
      
      const generatedBrandVoice = generationResult.brandVoice;

      // Step 2: Calculate quality metrics
      let qualityMetrics = null;
      if (options?.validateQuality !== false) {
        const qualityService = new BrandVoiceQualityService();
        qualityMetrics = await qualityService.calculateQualityMetrics(generatedBrandVoice);
        
        logger.info('Quality metrics calculated', {
          userId,
          overallScore: qualityMetrics.overallScore,
          dimensions: qualityMetrics.dimensions
        });
      }

      // Step 3: Save to database
      const crudService = new BrandVoiceCRUDService();
      const savedBrandVoice = await crudService.create(
        userId,
        generatedBrandVoice,
        {
          source: 'generated',
          qualityScore: qualityMetrics?.overall,
          metadata: {
            generationTime: Date.now() - startTime,
            hasAnamnesisData: true,
            hasOnboardingData: !!onboardingData,
            hasUserOverrides: !!userOverrides,
            segment: anamnesisData.businessInfo.segment
          }
        }
      );

      // Step 4: Activate immediately if requested
      if (options?.activateImmediately !== false) {
        await crudService.activate(userId, savedBrandVoice.id, 'Auto-activated after generation');
      }

      const totalTime = Date.now() - startTime;

      logger.info('Brand Voice generation completed', {
        userId,
        brandVoiceId: savedBrandVoice.id,
        totalTime,
        qualityScore: qualityMetrics?.overallScore,
        activated: options?.activateImmediately !== false
      });

      res.status(201).json({
        success: true,
        data: {
          brandVoice: savedBrandVoice,
          qualityMetrics,
          metadata: {
            generationTime: totalTime,
            activated: options?.activateImmediately !== false
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

      const crudService = new BrandVoiceCRUDService();
      const activeBrandVoice = await crudService.getActive(userId);

      if (!activeBrandVoice) {
        return res.status(404).json({
          error: 'Not Found',
          message: 'No active Brand Voice found for this user'
        });
      }

      let qualityMetrics = null;
      if (includeQuality) {
        const qualityService = new BrandVoiceQualityService();
        qualityMetrics = await qualityService.calculateQualityMetrics(activeBrandVoice.data);
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
 * GET /api/brand-voice/:id
 * Get a specific Brand Voice by ID
 */
router.get('/:id',
  requireAuth,
  async (req: any, res: any, next: any) => {
    try {
      const userId = req.userId;
      const brandVoiceId = req.params.id;
      const includeQuality = req.query.includeQuality === 'true';

      logger.info('Fetching Brand Voice by ID', { userId, brandVoiceId, includeQuality });

      const crudService = new BrandVoiceCRUDService();
      const brandVoice = await crudService.getById(userId, brandVoiceId);

      if (!brandVoice) {
        return res.status(404).json({
          error: 'Not Found',
          message: 'Brand Voice not found'
        });
      }

      let qualityMetrics = null;
      if (includeQuality) {
        const qualityService = new BrandVoiceQualityService();
        qualityMetrics = await qualityService.calculateQualityMetrics(brandVoice.data);
      }

      res.json({
        success: true,
        data: {
          brandVoice,
          qualityMetrics
        }
      });

    } catch (error) {
      next(error);
    }
  }
);

/**
 * PUT /api/brand-voice/:id
 * Update an existing Brand Voice
 */
router.put('/:id',
  requireAuth,
  validateRequest(UpdateBrandVoiceRequestSchema),
  async (req: any, res: any, next: any) => {
    try {
      const userId = req.userId;
      const brandVoiceId = req.params.id;
      const updates = req.validatedBody;

      logger.info('Updating Brand Voice', { userId, brandVoiceId, hasUpdates: Object.keys(updates).length > 0 });

      const crudService = new BrandVoiceCRUDService();
      const updatedBrandVoice = await crudService.update(userId, brandVoiceId, updates);

      // Calculate new quality metrics
      const qualityService = new BrandVoiceQualityService();
      const qualityMetrics = await qualityService.calculateQualityMetrics(updatedBrandVoice.data);

      logger.info('Brand Voice updated', {
        userId,
        brandVoiceId,
        newVersion: updatedBrandVoice.version,
        qualityScore: qualityMetrics.overallScore
      });

      res.json({
        success: true,
        data: {
          brandVoice: updatedBrandVoice,
          qualityMetrics
        }
      });

    } catch (error) {
      next(error);
    }
  }
);

/**
 * PUT /api/brand-voice/:id/activate
 * Activate a specific Brand Voice version
 */
router.put('/:id/activate',
  requireAuth,
  validateRequest(ActivateBrandVoiceRequestSchema),
  async (req: any, res: any, next: any) => {
    try {
      const userId = req.userId;
      const brandVoiceId = req.params.id;
      const { reason } = req.validatedBody;

      logger.info('Activating Brand Voice', { userId, brandVoiceId, reason });

      const crudService = new BrandVoiceCRUDService();
      const activatedBrandVoice = await crudService.activate(userId, brandVoiceId, reason);

      logger.info('Brand Voice activated', {
        userId,
        brandVoiceId,
        previousActiveId: activatedBrandVoice.previousActiveId
      });

      res.json({
        success: true,
        data: {
          brandVoice: activatedBrandVoice.brandVoice,
          previousActive: activatedBrandVoice.previousActive
        }
      });

    } catch (error) {
      next(error);
    }
  }
);

/**
 * GET /api/brand-voice/history
 * Get Brand Voice history for the user
 */
router.get('/history',
  requireAuth,
  async (req: any, res: any, next: any) => {
    try {
      const userId = req.userId;
      const page = parseInt(req.query.page) || 1;
      const limit = Math.min(parseInt(req.query.limit) || 20, 100); // Max 100 items
      const includeInactive = req.query.includeInactive === 'true';

      logger.info('Fetching Brand Voice history', { userId, page, limit, includeInactive });

      const history = await BrandVoiceService.list(userId, {
        page,
        limit,
        includeInactive,
        sortBy: 'created_at',
        sortOrder: 'desc'
      });

      res.json({
        success: true,
        data: history,
        pagination: {
          page,
          limit,
          total: history.total,
          totalPages: Math.ceil(history.total / limit)
        }
      });

    } catch (error) {
      next(error);
    }
  }
);

/**
 * DELETE /api/brand-voice/:id
 * Soft delete a Brand Voice
 */
router.delete('/:id',
  requireAuth,
  async (req: any, res: any, next: any) => {
    try {
      const userId = req.userId;
      const brandVoiceId = req.params.id;

      logger.info('Deleting Brand Voice', { userId, brandVoiceId });

      await BrandVoiceService.delete(userId, brandVoiceId);

      logger.info('Brand Voice deleted', { userId, brandVoiceId });

      res.status(204).send();

    } catch (error) {
      next(error);
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

      const qualityMetrics = await BrandVoiceQualityService.calculateQualityMetrics(brandVoiceData);

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
      const testQuality = await BrandVoiceQualityService.calculateQualityMetrics(testDefaults as any);

      const responseTime = Date.now() - startTime;

      res.json({
        success: true,
        status: 'healthy',
        timestamp: new Date().toISOString(),
        responseTime,
        services: {
          defaults: !!testDefaults,
          quality: !!testQuality,
          database: true, // Will be enhanced when real DB is connected
          cache: true     // Will be enhanced when cache is implemented
        },
        version: '1.0.0'
      });

    } catch (error) {
      logger.error('Health check failed', { error: error.message });
      res.status(503).json({
        success: false,
        status: 'unhealthy',
        timestamp: new Date().toISOString(),
        error: error.message
      });
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
    
    // Transform to new Brand Voice format
    const brandVoiceData = {
      brand: {
        name: legacyData.name || 'Brand Voice',
        segment: legacyData.segment || 'veterinaria',
        businessType: legacyData.businessType || 'clinica',
        mission: legacyData.mission || '',
        values: legacyData.values || [],
        targetAudience: {
          primary: legacyData.targetAudience || '',
          personas: [],
          painPoints: [],
          goals: []
        }
      },
      visual: {
        logoUrl: '',
        palette: {
          primary: '#2E7D32',
          secondary: ['#81C784', '#4CAF50'],
          accent: '#FF7043',
          neutral: ['#F5F5F5', '#E0E0E0']
        },
        typography: {
          primary: 'Roboto',
          style: 'professional'
        },
        imagery: {
          style: 'photography',
          mood: 'trustworthy',
          avoid: []
        }
      },
      voice: {
        tone: {
          confiança: 0.8,
          acolhimento: 0.7,
          humor: 0.3,
          especialização: 0.9
        },
        persona: {
          description: legacyData.description || '',
          characteristics: [],
          communication_style: legacyData.tone || 'professional'
        },
        lexicon: {
          prefer: [],
          avoid: [],
          banned: [],
          industry_specific: {
            medical_terms: 'technical',
            pet_terminology: []
          }
        },
        style: {
          sentence_length: 'medium',
          paragraph_style: 'scannable',
          use_questions: true,
          use_exclamations: false,
          use_emojis: 'minimal',
          cta_style: {
            preferred: [],
            urgency_level: 'medium',
            personalization: 'personalized'
          },
          formatting: {
            use_lists: true,
            use_bold: 'moderate',
            use_italics: false,
            use_quotes: false
          }
        }
      },
      compliance: {
        regulatory: {
          medical_claims: 'strict',
          veterinary_advice: 'required_disclaimer',
          medication_mentions: 'with_disclaimer'
        },
        content_policies: {
          claims_policy: 'Seguimos política strict para alegações relacionadas à saúde animal',
          disclaimer_required: true,
          default_disclaimer: 'Este conteúdo é informativo. Sempre consulte um veterinário.',
          review_triggers: []
        },
        legal: {
          lgpd_compliance: true,
          copyright_policy: 'Todo conteúdo é original ou devidamente licenciado',
          user_generated_content: 'moderated'
        }
      },
      channels: {
        social_media: {
          instagram: {
            tone_adjustment: 0.1,
            hashtag_strategy: 'moderate',
            story_style: 'educational'
          },
          facebook: {
            tone_adjustment: 0,
            post_length: 'medium',
            engagement_style: 'informational'
          },
          whatsapp: {
            formality_level: 'semi-formal',
            response_style: 'personalized'
          }
        },
        content_types: {
          educational: {
            depth_level: 'intermediate',
            use_examples: true,
            include_sources: true
          },
          promotional: {
            sales_approach: 'consultative',
            urgency_tactics: 'minimal',
            social_proof: 'testimonials'
          },
          customer_service: {
            response_tone: 'helpful',
            problem_solving: 'consultative'
          }
        }
      }
    };

    const savedBrandVoice = await BrandVoiceService.create(userId, brandVoiceData);
    
    res.json(savedBrandVoice);
    
  } catch (error) {
    next(error);
  }
});

// Apply error handler
router.use(handleApiError);

export default router;
