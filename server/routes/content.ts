import express from 'express';
import { ContentGenerationService } from '../services/contentGenerationService';
import { ComplianceChecker } from '../services/complianceChecker';
import { QualityMetricsService } from '../services/qualityMetricsService';
import { validateBrandVoice } from '../../shared/schemas/brand-voice';
import { openai } from '../services/openai';

const router = express.Router();

// Initialize services
const complianceChecker = new ComplianceChecker();
const contentGenerationService = new ContentGenerationService(openai, complianceChecker);
const qualityMetricsService = new QualityMetricsService();

/**
 * POST /api/content/generate
 * Generate content based on brief and brand voice
 */
router.post('/generate', async (req, res) => {
  try {
    const { brief, brandVoice, options } = req.body;

    // Validate required fields
    if (!brief || !brandVoice) {
      return res.status(400).json({
        error: 'Missing required fields',
        details: 'brief and brandVoice are required'
      });
    }

    // Validate brand voice schema
    const brandVoiceValidation = validateBrandVoice(brandVoice);
    if (!brandVoiceValidation.success) {
      return res.status(400).json({
        error: 'Invalid brand voice schema',
        details: brandVoiceValidation.error.errors
      });
    }

    // Validate brief structure
    const requiredBriefFields = ['id', 'userId', 'brandVoiceId', 'theme', 'objective', 'channel'];
    const missingFields = requiredBriefFields.filter(field => !brief[field]);
    if (missingFields.length > 0) {
      return res.status(400).json({
        error: 'Invalid brief structure',
        details: `Missing fields: ${missingFields.join(', ')}`
      });
    }

    // Generate content
    const generatedContent = await contentGenerationService.generateContent(
      brief,
      brandVoice,
      options
    );

    res.json({
      success: true,
      data: {
        brief_id: brief.id,
        generated_content: generatedContent,
        total_variations: generatedContent.length
      }
    });

  } catch (error) {
    console.error('Content generation error:', error);
    res.status(500).json({
      error: 'Content generation failed',
      details: error instanceof Error ? error.message : 'Unknown error'
    });
  }
});

/**
 * POST /api/content/generate/batch
 * Generate content for multiple briefs
 */
router.post('/generate/batch', async (req, res) => {
  try {
    const { briefs, brandVoices, options } = req.body;

    if (!Array.isArray(briefs) || !brandVoices) {
      return res.status(400).json({
        error: 'Invalid request format',
        details: 'briefs must be an array and brandVoices must be provided'
      });
    }

    // Convert brandVoices array to Map
    const brandVoiceMap = new Map();
    if (Array.isArray(brandVoices)) {
      for (const bv of brandVoices) {
        if (bv.id && bv.data) {
          brandVoiceMap.set(bv.id, bv.data);
        }
      }
    } else {
      // Assume brandVoices is an object with id->data mapping
      for (const [id, data] of Object.entries(brandVoices)) {
        brandVoiceMap.set(id, data);
      }
    }

    // Validate all brand voices
    let validationError: any = null;
    brandVoiceMap.forEach((brandVoice, id) => {
      if (!validationError) {
        const validation = validateBrandVoice(brandVoice);
        if (!validation.success) {
          validationError = {
            error: `Invalid brand voice schema for ${id}`,
            details: validation.error.errors
          };
        }
      }
    });

    if (validationError) {
      return res.status(400).json(validationError);
    }

    // Generate batch content
    const results = await contentGenerationService.generateBatchContent(
      briefs,
      brandVoiceMap,
      options
    );

    // Convert Map to object for JSON response
    const resultsObject: Record<string, any> = {};
    results.forEach((content, briefId) => {
      resultsObject[briefId] = content;
    });

    res.json({
      success: true,
      data: {
        results: resultsObject,
        total_briefs: briefs.length,
        processed_briefs: results.size
      }
    });

  } catch (error) {
    console.error('Batch content generation error:', error);
    res.status(500).json({
      error: 'Batch content generation failed',
      details: error instanceof Error ? error.message : 'Unknown error'
    });
  }
});

/**
 * POST /api/content/analyze
 * Analyze content quality without generating new content
 */
router.post('/analyze', async (req, res) => {
  try {
    const { content, theme, brandVoice, contentData } = req.body;

    if (!content || !theme || !brandVoice) {
      return res.status(400).json({
        error: 'Missing required fields',
        details: 'content, theme, and brandVoice are required'
      });
    }

    // Validate brand voice
    const brandVoiceValidation = validateBrandVoice(brandVoice);
    if (!brandVoiceValidation.success) {
      return res.status(400).json({
        error: 'Invalid brand voice schema',
        details: brandVoiceValidation.error.errors
      });
    }

    // Run compliance check
    const complianceResult = await complianceChecker.checkContent(
      content,
      brandVoice.brand.segment
    );

    // Calculate quality metrics
    const brandData = {
      preferredWords: brandVoice.voice.lexicon.prefer,
      avoidWords: brandVoice.voice.lexicon.avoid,
      bannedWords: brandVoice.voice.lexicon.banned,
      toneAlignment: 0.8 // Default if not provided
    };

    const defaultContentData = {
      cta: '',
      hashtags: [],
      channel: 'instagram_post',
      keywords: [],
      ...contentData
    };

    const qualityAssessment = qualityMetricsService.assessQuality(
      content,
      theme,
      brandData,
      defaultContentData,
      complianceResult.score
    );

    res.json({
      success: true,
      data: {
        compliance: complianceResult,
        quality: qualityAssessment
      }
    });

  } catch (error) {
    console.error('Content analysis error:', error);
    res.status(500).json({
      error: 'Content analysis failed',
      details: error instanceof Error ? error.message : 'Unknown error'
    });
  }
});

/**
 * GET /api/content/compliance/rules
 * Get available compliance rules
 */
router.get('/compliance/rules', async (req, res) => {
  try {
    const rules = complianceChecker.getRules();
    
    res.json({
      success: true,
      data: {
        rules,
        total_rules: rules.length
      }
    });

  } catch (error) {
    console.error('Get compliance rules error:', error);
    res.status(500).json({
      error: 'Failed to get compliance rules',
      details: error instanceof Error ? error.message : 'Unknown error'
    });
  }
});

/**
 * POST /api/content/compliance/check
 * Check content compliance
 */
router.post('/compliance/check', async (req, res) => {
  try {
    const { content, segment } = req.body;

    if (!content || !segment) {
      return res.status(400).json({
        error: 'Missing required fields',
        details: 'content and segment are required'
      });
    }

    const complianceResult = await complianceChecker.checkContent(content, segment);

    res.json({
      success: true,
      data: complianceResult
    });

  } catch (error) {
    console.error('Compliance check error:', error);
    res.status(500).json({
      error: 'Compliance check failed',
      details: error instanceof Error ? error.message : 'Unknown error'
    });
  }
});

/**
 * GET /api/content/health
 * Health check endpoint
 */
router.get('/health', (req, res) => {
  res.json({
    success: true,
    status: 'healthy',
    services: {
      content_generation: 'operational',
      compliance_checker: 'operational',
      quality_metrics: 'operational'
    },
    timestamp: new Date().toISOString()
  });
});

/**
 * GET /api/content/status
 * Get service status and configuration
 */
router.get('/status', (req, res) => {
  try {
    const totalRules = complianceChecker.getRules().length;
    
    res.json({
      success: true,
      data: {
        version: '1.0.0',
        features: {
          content_generation: true,
          compliance_checking: true,
          quality_metrics: true,
          batch_processing: true
        },
        configuration: {
          total_compliance_rules: totalRules,
          supported_segments: ['veterinaria', 'petshop', 'banho_tosa', 'hotel_pet', 'agropet'],
          supported_channels: ['instagram_post', 'instagram_story', 'facebook_post', 'whatsapp', 'email', 'website'],
          supported_objectives: ['educar', 'vender', 'engajar', 'recall', 'awareness']
        }
      }
    });

  } catch (error) {
    console.error('Status check error:', error);
    res.status(500).json({
      error: 'Status check failed',
      details: error instanceof Error ? error.message : 'Unknown error'
    });
  }
});

export default router;