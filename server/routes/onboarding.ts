import { Router } from 'express';
import { BrandOnboardingService } from '../services/brand-onboarding.service.js';

const router = Router();

/**
 * GET /api/onboarding/:userId
 * Recupera dados de onboarding do usuário
 */
router.get('/:userId', async (req, res) => {
  try {
    const { userId } = req.params;
    
    const onboarding = await BrandOnboardingService.getByUserId(userId);
    
    if (!onboarding) {
      return res.status(404).json({ 
        success: false, 
        error: 'Onboarding data not found' 
      });
    }
    
    res.json({ 
      success: true, 
      data: onboarding 
    });
  } catch (error) {
    console.error('Error fetching onboarding data:', error);
    res.status(500).json({ 
      success: false, 
      error: 'Internal server error' 
    });
  }
});

/**
 * GET /api/onboarding/:userId/progress
 * Recupera progresso do onboarding
 */
router.get('/:userId/progress', async (req, res) => {
  try {
    const { userId } = req.params;
    
    const progress = await BrandOnboardingService.getProgress(userId);
    
    if (!progress) {
      return res.json({ 
        success: true, 
        data: {
          currentStep: 'logo',
          completed: false,
          completedSteps: [],
          totalSteps: 5
        }
      });
    }
    
    res.json({ 
      success: true, 
      data: progress 
    });
  } catch (error) {
    console.error('Error fetching onboarding progress:', error);
    res.status(500).json({ 
      success: false, 
      error: 'Internal server error' 
    });
  }
});

/**
 * POST /api/onboarding/:userId
 * Cria novo registro de onboarding
 */
router.post('/:userId', async (req, res) => {
  try {
    const { userId } = req.params;
    const onboardingData = req.body;
    
    // Validação básica
    if (!onboardingData.toneConfig || !onboardingData.languageConfig) {
      return res.status(400).json({ 
        success: false, 
        error: 'toneConfig and languageConfig are required' 
      });
    }
    
    const result = await BrandOnboardingService.create(userId, onboardingData);
    
    res.status(201).json({ 
      success: true, 
      data: result 
    });
  } catch (error) {
    console.error('Error creating onboarding data:', error);
    res.status(500).json({ 
      success: false, 
      error: 'Internal server error' 
    });
  }
});

/**
 * PUT /api/onboarding/:userId
 * Atualiza dados de onboarding existentes
 */
router.put('/:userId', async (req, res) => {
  try {
    const { userId } = req.params;
    const updateData = req.body;
    
    const result = await BrandOnboardingService.update(userId, updateData);
    
    if (!result) {
      return res.status(404).json({ 
        success: false, 
        error: 'Onboarding data not found' 
      });
    }
    
    res.json({ 
      success: true, 
      data: result 
    });
  } catch (error) {
    console.error('Error updating onboarding data:', error);
    res.status(500).json({ 
      success: false, 
      error: 'Internal server error' 
    });
  }
});

/**
 * PUT /api/onboarding/:userId/upsert
 * Cria ou atualiza dados de onboarding
 */
router.put('/:userId/upsert', async (req, res) => {
  try {
    const { userId } = req.params;
    const onboardingData = req.body;
    
    // Validação básica
    if (!onboardingData.toneConfig || !onboardingData.languageConfig) {
      return res.status(400).json({ 
        success: false, 
        error: 'toneConfig and languageConfig are required' 
      });
    }
    
    const result = await BrandOnboardingService.upsert(userId, onboardingData);
    
    res.json({ 
      success: true, 
      data: result 
    });
  } catch (error) {
    console.error('Error upserting onboarding data:', error);
    res.status(500).json({ 
      success: false, 
      error: 'Internal server error' 
    });
  }
});

/**
 * POST /api/onboarding/:userId/step/:step
 * Atualiza step atual do wizard
 */
router.post('/:userId/step/:step', async (req, res) => {
  try {
    const { userId, step } = req.params;
    
    const validSteps = ['logo', 'palette', 'tone', 'language', 'values', 'completed'];
    if (!validSteps.includes(step)) {
      return res.status(400).json({ 
        success: false, 
        error: 'Invalid step' 
      });
    }
    
    const result = await BrandOnboardingService.updateStep(userId, step);
    
    if (!result) {
      return res.status(404).json({ 
        success: false, 
        error: 'Onboarding data not found' 
      });
    }
    
    res.json({ 
      success: true, 
      data: result 
    });
  } catch (error) {
    console.error('Error updating onboarding step:', error);
    res.status(500).json({ 
      success: false, 
      error: 'Internal server error' 
    });
  }
});

/**
 * POST /api/onboarding/:userId/complete
 * Marca onboarding como completo e gera Brand Voice JSON
 */
router.post('/:userId/complete', async (req, res) => {
  try {
    const { userId } = req.params;
    
    const result = await BrandOnboardingService.complete(userId);
    
    if (!result) {
      return res.status(404).json({ 
        success: false, 
        error: 'Onboarding data not found' 
      });
    }
    
    res.json({ 
      success: true, 
      data: result 
    });
  } catch (error) {
    console.error('Error completing onboarding:', error);
    res.status(500).json({ 
      success: false, 
      error: 'Internal server error' 
    });
  }
});

/**
 * GET /api/onboarding/:userId/brand-voice-json
 * Gera Brand Voice JSON a partir dos dados de onboarding
 */
router.get('/:userId/brand-voice-json', async (req, res) => {
  try {
    const { userId } = req.params;
    
    const brandVoiceJSON = await BrandOnboardingService.generateBrandVoiceJSON(userId);
    
    res.json({ 
      success: true, 
      data: brandVoiceJSON 
    });
  } catch (error) {
    console.error('Error generating brand voice JSON:', error);
    
    if (error instanceof Error && error.message === 'Onboarding data not found') {
      return res.status(404).json({ 
        success: false, 
        error: 'Onboarding data not found' 
      });
    }
    
    res.status(500).json({ 
      success: false, 
      error: 'Internal server error' 
    });
  }
});

/**
 * DELETE /api/onboarding/:userId
 * Remove dados de onboarding do usuário
 */
router.delete('/:userId', async (req, res) => {
  try {
    const { userId } = req.params;
    
    const success = await BrandOnboardingService.delete(userId);
    
    if (!success) {
      return res.status(404).json({ 
        success: false, 
        error: 'Onboarding data not found' 
      });
    }
    
    res.json({ 
      success: true, 
      message: 'Onboarding data deleted successfully' 
    });
  } catch (error) {
    console.error('Error deleting onboarding data:', error);
    res.status(500).json({ 
      success: false, 
      error: 'Internal server error' 
    });
  }
});

export default router;