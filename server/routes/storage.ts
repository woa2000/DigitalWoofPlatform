import { Router, Request, Response, NextFunction } from 'express';
import multer from 'multer';
import { LogoStorageService } from '../services/logo-storage.service.js';
import { BrandOnboardingSupabaseService } from '../services/brand-onboarding-supabase.service.js';

const router = Router();

// Extend Request interface to include file
interface MulterRequest extends Request {
  file?: Express.Multer.File;
}

// Configure multer for file upload
const upload = multer({
  storage: multer.memoryStorage(),
  limits: {
    fileSize: 5 * 1024 * 1024, // 5MB limit
  },
  fileFilter: (req: Request, file: Express.Multer.File, cb: multer.FileFilterCallback) => {
    // Allow only image files
    if (file.mimetype.startsWith('image/')) {
      cb(null, true);
    } else {
      cb(new Error('Only image files are allowed'));
    }
  }
});

/**
 * POST /api/storage/logo/:userId
 * Upload logo for user
 */
router.post('/logo/:userId', upload.single('logo'), async (req: MulterRequest, res: Response) => {
  try {
    const { userId } = req.params;
    const file = req.file;
    
    if (!file) {
      return res.status(400).json({
        success: false,
        error: 'No file uploaded'
      });
    }
    
    // Bucket creation is now handled in the uploadLogo method
    console.log('🔄 Processing logo upload for user:', userId);
    
    // Upload logo
    const uploadResult = await LogoStorageService.uploadLogo(
      userId,
      file.buffer,
      file.originalname,
      file.mimetype
    );
    
    if (!uploadResult.success) {
      return res.status(500).json({
        success: false,
        error: uploadResult.error
      });
    }
    
    // Update onboarding data with logo info
    try {
      await BrandOnboardingSupabaseService.update(userId, {
        logoUrl: uploadResult.logoUrl,
        logoMetadata: uploadResult.metadata,
        palette: uploadResult.palette,
        stepCompleted: 'logo'
      });
    } catch (updateError) {
      console.error('Error updating onboarding with logo data:', updateError);
      // Continue - logo was uploaded successfully even if DB update failed
    }
    
    res.json({
      success: true,
      data: {
        logoUrl: uploadResult.logoUrl,
        metadata: uploadResult.metadata,
        palette: uploadResult.palette
      }
    });
    
  } catch (error) {
    console.error('Error uploading logo:', error);
    res.status(500).json({
      success: false,
      error: 'Internal server error'
    });
  }
});

/**
 * DELETE /api/storage/logo/:userId
 * Delete logo for user
 */
router.delete('/logo/:userId', async (req: Request, res: Response) => {
  try {
    const { userId } = req.params;
    
    // Get current onboarding data to find logo URL
    const onboarding = await BrandOnboardingSupabaseService.getByUserId(userId);
    
    if (!onboarding || !onboarding.logoUrl) {
      return res.status(404).json({
        success: false,
        error: 'No logo found for user'
      });
    }
    
    // Delete from storage
    const deleted = await LogoStorageService.deleteLogo(onboarding.logoUrl);
    
    if (!deleted) {
      return res.status(500).json({
        success: false,
        error: 'Failed to delete logo from storage'
      });
    }
    
    // Update onboarding data to remove logo info
    await BrandOnboardingSupabaseService.update(userId, {
      logoUrl: undefined,
      logoMetadata: undefined,
      palette: undefined
    });
    
    res.json({
      success: true,
      message: 'Logo deleted successfully'
    });
    
  } catch (error) {
    console.error('Error deleting logo:', error);
    res.status(500).json({
      success: false,
      error: 'Internal server error'
    });
  }
});

/**
 * GET /api/storage/logo/:userId/metadata
 * Get logo metadata for user
 */
router.get('/logo/:userId/metadata', async (req: Request, res: Response) => {
  try {
    const { userId } = req.params;
    
    const onboarding = await BrandOnboardingSupabaseService.getByUserId(userId);
    
    if (!onboarding || !onboarding.logoUrl) {
      return res.status(404).json({
        success: false,
        error: 'No logo found for user'
      });
    }
    
    const metadata = await LogoStorageService.getLogoMetadata(onboarding.logoUrl);
    
    res.json({
      success: true,
      data: {
        logoUrl: onboarding.logoUrl,
        metadata,
        palette: onboarding.palette
      }
    });
    
  } catch (error) {
    console.error('Error getting logo metadata:', error);
    res.status(500).json({
      success: false,
      error: 'Internal server error'
    });
  }
});

/**
 * GET /api/storage/logo/:userId/palette
 * Extract color palette from logo
 */
router.get('/logo/:userId/palette', async (req: Request, res: Response) => {
  try {
    const { userId } = req.params;
    
    const onboarding = await BrandOnboardingSupabaseService.getByUserId(userId);
    
    if (!onboarding || !onboarding.logoUrl) {
      return res.status(404).json({
        success: false,
        error: 'No logo found for user'
      });
    }
    
    // If palette already exists, return it
    if (onboarding.palette && onboarding.palette.length > 0) {
      return res.json({
        success: true,
        data: {
          palette: onboarding.palette,
          cached: true
        }
      });
    }
    
    // Extract new palette
    const palette = await LogoStorageService.extractColorPalette(onboarding.logoUrl);
    
    if (!palette) {
      return res.status(500).json({
        success: false,
        error: 'Failed to extract color palette'
      });
    }
    
    // Update onboarding with new palette
    await BrandOnboardingSupabaseService.update(userId, {
      palette,
      stepCompleted: 'palette'
    });
    
    res.json({
      success: true,
      data: {
        palette,
        cached: false
      }
    });
    
  } catch (error) {
    console.error('Error extracting color palette:', error);
    res.status(500).json({
      success: false,
      error: 'Internal server error'
    });
  }
});

/**
 * Error handling middleware for multer
 */
router.use((error: any, req: Request, res: Response, next: NextFunction) => {
  if (error instanceof multer.MulterError) {
    if (error.code === 'LIMIT_FILE_SIZE') {
      return res.status(400).json({
        success: false,
        error: 'File too large. Maximum size is 5MB.'
      });
    }
  }
  
  if (error.message === 'Only image files are allowed') {
    return res.status(400).json({
      success: false,
      error: 'Only image files are allowed'
    });
  }
  
  next(error);
});

export default router;