import dotenv from 'dotenv';
dotenv.config();

import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.SUPABASE_URL || '';
const supabaseKey = process.env.SUPABASE_ANON_KEY || '';

if (!supabaseUrl || !supabaseKey) {
  throw new Error('Missing Supabase environment variables');
}

const supabase = createClient(supabaseUrl, supabaseKey);

export interface LogoUploadResult {
  success: boolean;
  logoUrl?: string;
  metadata?: {
    width: number;
    height: number;
    format: string;
    hasTransparency: boolean;
    fileSize: number;
  };
  palette?: string[];
  error?: string;
}

export class LogoStorageService {
  
  /**
   * Upload logo to Supabase Storage
   */
  static async uploadLogo(
    userId: string, 
    file: Buffer, 
    fileName: string,
    mimeType: string
  ): Promise<LogoUploadResult> {
    try {
      // Generate unique file name
      const timestamp = Date.now();
      const extension = fileName.split('.').pop();
      const uniqueFileName = `${userId}/${timestamp}-logo.${extension}`;
      
      // Upload to Supabase Storage
      const { data, error } = await supabase.storage
        .from('brand-assets')
        .upload(uniqueFileName, file, {
          contentType: mimeType,
          cacheControl: '3600',
          upsert: true
        });
      
      if (error) {
        console.error('Error uploading to Supabase Storage:', error);
        return {
          success: false,
          error: error.message
        };
      }
      
      // Get public URL
      const { data: urlData } = supabase.storage
        .from('brand-assets')
        .getPublicUrl(uniqueFileName);
      
      const logoUrl = urlData.publicUrl;
      
      // Extract metadata (simplified version - in real app would use image processing)
      const metadata = {
        width: 200, // Placeholder - would extract from actual image
        height: 200, // Placeholder - would extract from actual image
        format: extension || 'unknown',
        hasTransparency: mimeType === 'image/png',
        fileSize: file.length
      };
      
      // Extract color palette (simplified - in real app would use image analysis)
      const palette = [
        '#FF6B6B', // Placeholder colors - would extract from actual image
        '#4ECDC4',
        '#45B7D1'
      ];
      
      return {
        success: true,
        logoUrl,
        metadata,
        palette
      };
      
    } catch (error) {
      console.error('Error in logo upload service:', error);
      return {
        success: false,
        error: 'Internal server error'
      };
    }
  }
  
  /**
   * Delete logo from storage
   */
  static async deleteLogo(logoUrl: string): Promise<boolean> {
    try {
      // Extract file path from URL
      const urlParts = logoUrl.split('/');
      const fileName = urlParts[urlParts.length - 1];
      const folder = urlParts[urlParts.length - 2];
      const filePath = `${folder}/${fileName}`;
      
      const { error } = await supabase.storage
        .from('brand-assets')
        .remove([filePath]);
      
      if (error) {
        console.error('Error deleting from Supabase Storage:', error);
        return false;
      }
      
      return true;
      
    } catch (error) {
      console.error('Error in logo deletion service:', error);
      return false;
    }
  }
  
  /**
   * Check if bucket exists and create if not
   */
  static async ensureBucketExists(): Promise<boolean> {
    try {
      const { data: buckets, error } = await supabase.storage.listBuckets();
      
      if (error) {
        console.error('Error listing buckets:', error);
        return false;
      }
      
      const bucketExists = buckets?.some(bucket => bucket.name === 'brand-assets');
      
      if (!bucketExists) {
        const { error: createError } = await supabase.storage.createBucket('brand-assets', {
          public: true,
          allowedMimeTypes: ['image/png', 'image/jpeg', 'image/gif', 'image/webp', 'image/svg+xml'],
          fileSizeLimit: 5242880 // 5MB
        });
        
        if (createError) {
          console.error('Error creating bucket:', createError);
          return false;
        }
      }
      
      return true;
      
    } catch (error) {
      console.error('Error ensuring bucket exists:', error);
      return false;
    }
  }
  
  /**
   * Get logo metadata from URL
   */
  static async getLogoMetadata(logoUrl: string): Promise<{
    width: number;
    height: number;
    format: string;
    hasTransparency: boolean;
    fileSize: number;
  } | null> {
    try {
      // In a real implementation, this would fetch the image and extract metadata
      // For now, returning placeholder data
      return {
        width: 200,
        height: 200,
        format: 'png',
        hasTransparency: true,
        fileSize: 1024
      };
    } catch (error) {
      console.error('Error getting logo metadata:', error);
      return null;
    }
  }
  
  /**
   * Extract color palette from logo
   */
  static async extractColorPalette(logoUrl: string): Promise<string[] | null> {
    try {
      // In a real implementation, this would analyze the image and extract colors
      // For now, returning placeholder palette
      return [
        '#FF6B6B',
        '#4ECDC4',
        '#45B7D1',
        '#FFA726',
        '#66BB6A'
      ];
    } catch (error) {
      console.error('Error extracting color palette:', error);
      return null;
    }
  }
}