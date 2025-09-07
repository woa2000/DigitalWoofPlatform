import { Router, Request, Response } from 'express';
import { uploadService } from '../services/upload.service';
import { BrandOnboardingService } from '../services/brand-onboarding.service';

const router = Router();

/**
 * POST /api/upload/logo/:userId
 * Upload and process logo for brand onboarding
 */
router.post('/logo/:userId', async (req: Request, res: Response) => {
  const upload = uploadService.getUploadMiddleware().single('logo');

  upload(req, res, async (err: any) => {
    try {
      if (err) {
        console.error('Upload error:', err);
        return res.status(400).json({
          success: false,
          error: err.message || 'Erro no upload do arquivo'
        });
      }

      if (!req.file) {
        return res.status(400).json({
          success: false,
          error: 'Nenhum arquivo foi enviado'
        });
      }

      const { userId } = req.params;

      // Validate file
      const validation = uploadService.validateFile(req.file);
      if (!validation.valid) {
        // Clean up uploaded file
        await uploadService.deleteFile(req.file.filename);
        return res.status(400).json({
          success: false,
          error: validation.error
        });
      }

      console.log(`Processing logo upload for user: ${userId}`);

      // Process the image
      const result = await uploadService.processImage(req.file.path, req.file.originalname);

      // Update onboarding data with logo information
      const onboardingData = {
        logoUrl: result.url,
        palette: result.palette,
        logoMetadata: result.metadata,
        stepCompleted: 'palette' as const
      };

      const updatedOnboarding = await BrandOnboardingService.update(userId, onboardingData);

      if (!updatedOnboarding) {
        // Clean up files if onboarding update fails
        await uploadService.deleteFile(result.filename);
        return res.status(404).json({
          success: false,
          error: 'Dados de onboarding não encontrados'
        });
      }

      res.json({
        success: true,
        data: {
          logo: {
            url: result.url,
            thumbnailUrl: result.thumbnailUrl,
            metadata: result.metadata
          },
          palette: result.palette,
          onboarding: updatedOnboarding,
          processingTime: result.processingTime
        }
      });

    } catch (error) {
      console.error('Logo upload processing error:', error);

      // Clean up file if processing fails
      if (req.file) {
        try {
          await uploadService.deleteFile(req.file.filename);
        } catch (cleanupError) {
          console.error('File cleanup error:', cleanupError);
        }
      }

      res.status(500).json({
        success: false,
        error: 'Erro interno do servidor durante processamento'
      });
    }
  });
});

/**
 * DELETE /api/upload/logo/:userId
 * Remove uploaded logo
 */
router.delete('/logo/:userId', async (req: Request, res: Response) => {
  try {
    const { userId } = req.params;

    // Get current onboarding data
    const onboarding = await BrandOnboardingService.getByUserId(userId);

    if (!onboarding || !onboarding.logoUrl) {
      return res.status(404).json({
        success: false,
        error: 'Logo não encontrada'
      });
    }

    // Extract filename from URL
    const filename = onboarding.logoUrl.split('/').pop();
    if (filename) {
      await uploadService.deleteFile(filename);
    }

    // Update onboarding data
    const updatedOnboarding = await BrandOnboardingService.update(userId, {
      logoUrl: undefined,
      palette: undefined,
      logoMetadata: undefined,
      stepCompleted: 'logo' as const
    });

    res.json({
      success: true,
      message: 'Logo removida com sucesso',
      onboarding: updatedOnboarding
    });

  } catch (error) {
    console.error('Logo deletion error:', error);
    res.status(500).json({
      success: false,
      error: 'Erro ao remover logo'
    });
  }
});

/**
 * GET /api/upload/stats
 * Get upload statistics
 */
router.get('/stats', async (req: Request, res: Response) => {
  try {
    const stats = await uploadService.getUploadStats();

    res.json({
      success: true,
      data: stats
    });

  } catch (error) {
    console.error('Upload stats error:', error);
    res.status(500).json({
      success: false,
      error: 'Erro ao obter estatísticas'
    });
  }
});

/**
 * POST /api/upload/test
 * Test endpoint for upload functionality
 */
router.post('/test', async (req: Request, res: Response) => {
  const upload = uploadService.getUploadMiddleware().single('file');

  upload(req, res, async (err: any) => {
    try {
      if (err) {
        return res.status(400).json({
          success: false,
          error: err.message
        });
      }

      if (!req.file) {
        return res.status(400).json({
          success: false,
          error: 'Nenhum arquivo enviado'
        });
      }

      // Process the test file
      const result = await uploadService.processImage(req.file.path, req.file.originalname);

      res.json({
        success: true,
        message: 'Upload de teste realizado com sucesso',
        data: result
      });

    } catch (error) {
      console.error('Test upload error:', error);
      res.status(500).json({
        success: false,
        error: 'Erro no upload de teste'
      });
    }
  });
});

export default router;