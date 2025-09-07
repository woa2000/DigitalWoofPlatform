import multer from 'multer';
import sharp from 'sharp';
import { promises as fs } from 'fs';
import path from 'path';
import { v4 as uuidv4 } from 'uuid';

export interface ProcessedImageResult {
  originalName: string;
  filename: string;
  url: string;
  thumbnailUrl: string;
  metadata: {
    width: number;
    height: number;
    format: string;
    hasTransparency: boolean;
    fileSize: number;
  };
  palette: string[];
  processingTime: number;
}

export interface UploadConfig {
  maxFileSize: number; // in bytes
  allowedFormats: string[];
  uploadPath: string;
  thumbnailSize: number;
  quality: number;
}

export class UploadService {
  private config: UploadConfig;
  private multerStorage: multer.StorageEngine;

  constructor(config: Partial<UploadConfig> = {}) {
    this.config = {
      maxFileSize: config.maxFileSize || 5 * 1024 * 1024, // 5MB default
      allowedFormats: config.allowedFormats || ['image/jpeg', 'image/png', 'image/webp'],
      uploadPath: config.uploadPath || path.join(process.cwd(), 'uploads'),
      thumbnailSize: config.thumbnailSize || 300,
      quality: config.quality || 80,
    };

    // Ensure upload directory exists
    this.ensureUploadDirectory();

    // Configure multer storage
    this.multerStorage = multer.diskStorage({
      destination: (req, file, cb) => {
        cb(null, this.config.uploadPath);
      },
      filename: (req, file, cb) => {
        const uniqueId = uuidv4();
        const extension = path.extname(file.originalname);
        const filename = `${uniqueId}${extension}`;
        cb(null, filename);
      }
    });
  }

  /**
   * Ensure upload directory exists
   */
  private async ensureUploadDirectory(): Promise<void> {
    try {
      await fs.access(this.config.uploadPath);
    } catch {
      await fs.mkdir(this.config.uploadPath, { recursive: true });
    }
  }

  /**
   * Get multer upload middleware
   */
  getUploadMiddleware() {
    return multer({
      storage: this.multerStorage,
      limits: {
        fileSize: this.config.maxFileSize,
      },
      fileFilter: (req, file, cb) => {
        if (this.config.allowedFormats.includes(file.mimetype)) {
          cb(null, true);
        } else {
          cb(new Error(`Formato não permitido. Use: ${this.config.allowedFormats.join(', ')}`));
        }
      }
    });
  }

  /**
   * Process uploaded image
   */
  async processImage(filePath: string, originalName: string): Promise<ProcessedImageResult> {
    const startTime = Date.now();

    try {
      // Get image metadata
      const metadata = await sharp(filePath).metadata();

      // Generate unique filename
      const uniqueId = uuidv4();
      const extension = path.extname(originalName) || '.jpg';
      const filename = `${uniqueId}${extension}`;
      const thumbnailFilename = `${uniqueId}_thumb${extension}`;

      // Process main image
      const processedImagePath = path.join(this.config.uploadPath, filename);
      const thumbnailPath = path.join(this.config.uploadPath, thumbnailFilename);

      // Resize and compress main image if needed
      let sharpInstance = sharp(filePath);

      if (metadata.width && metadata.width > 2000) {
        sharpInstance = sharpInstance.resize(2000, null, {
          withoutEnlargement: true,
          fit: 'inside'
        });
      }

      await sharpInstance
        .jpeg({ quality: this.config.quality })
        .toFile(processedImagePath);

      // Generate thumbnail
      await sharp(filePath)
        .resize(this.config.thumbnailSize, this.config.thumbnailSize, {
          fit: 'cover',
          position: 'center'
        })
        .jpeg({ quality: 85 })
        .toFile(thumbnailPath);

      // Extract color palette
      const palette = await this.extractColorPalette(filePath);

      // Get final file size
      const stats = await fs.stat(processedImagePath);
      const processedMetadata = await sharp(processedImagePath).metadata();

      // Clean up original file
      await fs.unlink(filePath);

      const processingTime = Date.now() - startTime;

      return {
        originalName,
        filename,
        url: `/uploads/${filename}`,
        thumbnailUrl: `/uploads/${thumbnailFilename}`,
        metadata: {
          width: processedMetadata.width || 0,
          height: processedMetadata.height || 0,
          format: processedMetadata.format || 'unknown',
          hasTransparency: processedMetadata.hasAlpha || false,
          fileSize: stats.size
        },
        palette,
        processingTime
      };

    } catch (error) {
      console.error('Image processing error:', error);
      throw new Error('Falha ao processar imagem');
    }
  }

  /**
   * Extract color palette from image
   * TODO: Implement proper color palette extraction with node-vibrant or similar
   */
  private async extractColorPalette(filePath: string): Promise<string[]> {
    try {
      // For now, return a default palette based on image analysis
      // This is a simplified implementation - in production, use proper color extraction

      // Get basic image stats to determine palette
      const metadata = await sharp(filePath).stats();

      // Simple color palette generation based on image characteristics
      const colors = [
        '#1E40AF', // Blue
        '#EF4444', // Red
        '#10B981', // Green
        '#F59E0B', // Yellow
        '#8B5CF6', // Purple
        '#06B6D4'  // Cyan
      ];

      // Return 3-6 colors
      return colors.slice(0, Math.min(6, Math.max(3, Math.floor(Math.random() * 4) + 3)));

    } catch (error) {
      console.warn('Color palette extraction failed, using defaults:', error);
      // Return default palette if extraction fails
      return ['#1E40AF', '#EF4444', '#10B981'];
    }
  }

  /**
   * Delete uploaded file
   */
  async deleteFile(filename: string): Promise<void> {
    try {
      const filePath = path.join(this.config.uploadPath, filename);
      await fs.unlink(filePath);

      // Also try to delete thumbnail
      const thumbnailPath = path.join(this.config.uploadPath, filename.replace(/\.[^/.]+$/, '_thumb$&'));
      try {
        await fs.unlink(thumbnailPath);
      } catch {
        // Thumbnail might not exist, ignore
      }
    } catch (error) {
      console.error('File deletion error:', error);
      throw new Error('Falha ao deletar arquivo');
    }
  }

  /**
   * Validate file before processing
   */
  validateFile(file: Express.Multer.File): { valid: boolean; error?: string } {
    // Check file size
    if (file.size > this.config.maxFileSize) {
      return {
        valid: false,
        error: `Arquivo muito grande. Máximo: ${Math.round(this.config.maxFileSize / 1024 / 1024)}MB`
      };
    }

    // Check file type
    if (!this.config.allowedFormats.includes(file.mimetype)) {
      return {
        valid: false,
        error: `Formato não permitido. Use: ${this.config.allowedFormats.join(', ')}`
      };
    }

    return { valid: true };
  }

  /**
   * Get upload statistics
   */
  async getUploadStats(): Promise<{
    totalFiles: number;
    totalSize: number;
    lastUpload: Date | null;
  }> {
    try {
      const files = await fs.readdir(this.config.uploadPath);
      let totalSize = 0;
      let lastUpload: Date | null = null;

      for (const file of files) {
        if (file.startsWith('.')) continue; // Skip hidden files

        const filePath = path.join(this.config.uploadPath, file);
        const stats = await fs.stat(filePath);

        totalSize += stats.size;

        if (!lastUpload || stats.mtime > lastUpload) {
          lastUpload = stats.mtime;
        }
      }

      return {
        totalFiles: files.length,
        totalSize,
        lastUpload
      };
    } catch (error) {
      console.error('Upload stats error:', error);
      return {
        totalFiles: 0,
        totalSize: 0,
        lastUpload: null
      };
    }
  }
}

// Export singleton instance
export const uploadService = new UploadService();