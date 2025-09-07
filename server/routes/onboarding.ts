import { Router } from 'express';
import { BrandOnboardingPostgresService } from '../services/brand-onboarding-postgres.service';
import { TenantService } from '../services/tenant-basic.service';

const router = Router();

/**
 * GET /api/onboarding/:userId
 * Recupera dados de onboarding do usuário
 */
router.get('/:userId', async (req, res) => {
  try {
    const { userId } = req.params;
    
    const onboarding = await BrandOnboardingPostgresService.getByUserId(userId);
    
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
    
    // Progress tracking not implemented in PostgreSQL service yet
    const progress = null;
    
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
    
    const result = await BrandOnboardingPostgresService.create(userId, onboardingData);
    
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
    
    const result = await BrandOnboardingPostgresService.update(userId, updateData);
    
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
    
    const result = await BrandOnboardingPostgresService.upsert(userId, onboardingData);
    
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
    
    const result = await BrandOnboardingPostgresService.update(userId, { stepCompleted: step as any });
    
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
    
    const result = await BrandOnboardingPostgresService.complete(userId);
    
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
    
    const onboarding = await BrandOnboardingPostgresService.getByUserId(userId);
    const brandVoiceJSON = {
      metadata: { version: '1.0', generatedAt: new Date().toISOString(), userId },
      brand: { logo: { url: onboarding?.logo_url, palette: onboarding?.palette } },
      tone: onboarding?.tone_config,
      language: onboarding?.language_config,
      values: onboarding?.brand_values
    };
    
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
 * PUT /api/onboarding/:userId/step
 * Salva dados de uma etapa específica do onboarding
 */
router.put('/:userId/step', async (req, res) => {
  try {
    const { userId } = req.params;
    const stepData = req.body;
    
    console.log('🔄 Saving step data for user:', userId);
    console.log('📊 Step data:', stepData);
    
    // Obter tenant context
    const currentTenant = await TenantService.getUserCurrentTenant(userId);
    if (!currentTenant?.id) {
      return res.status(400).json({ 
        success: false, 
        error: 'Tenant context not found for user' 
      });
    }
    
    console.log('✅ Tenant context found:', currentTenant.id);
    
    // Tentar atualizar registro existente
    let result = await BrandOnboardingPostgresService.update(
      userId, 
      stepData, 
      currentTenant.id
    );
    
    // Se não existe, criar novo registro
    if (!result) {
      console.log('📝 Creating new onboarding record');
      result = await BrandOnboardingPostgresService.create(userId, {
        toneConfig: stepData.toneConfig || {
          confianca: 0.5,
          acolhimento: 0.5,
          humor: 0.5,
          especializacao: 0.5
        },
        languageConfig: stepData.languageConfig || {
          preferredTerms: [],
          avoidTerms: [],
          defaultCTAs: []
        },
        ...stepData
      }, currentTenant.id);
    }
    
    console.log('✅ Step data saved successfully');
    res.json({ 
      success: true, 
      data: result,
      message: 'Step data saved successfully'
    });
    
  } catch (error) {
    console.error('❌ Error saving step data:', error);
    res.status(500).json({ 
      success: false, 
      error: error instanceof Error ? error.message : 'Internal server error'
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
    
    const success = await BrandOnboardingPostgresService.delete(userId);
    
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