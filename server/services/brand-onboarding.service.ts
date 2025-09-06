import { db } from '../db.js';
import { brandOnboarding, type BrandOnboarding, type InsertBrandOnboarding } from '../../shared/schema.js';
import { eq } from 'drizzle-orm';

// Interface para dados de entrada (alinhada com o schema)
export interface OnboardingData {
  // Logo Management
  logoUrl?: string;
  palette?: string[]; // Array de cores em hex
  logoMetadata?: {
    width: number;
    height: number;
    format: string;
    hasTransparency: boolean;
    fileSize: number;
  };
  
  // Tone Configuration (4 sliders 0.0-1.0)
  toneConfig: {
    confianca: number;
    acolhimento: number;
    humor: number;
    especializacao: number;
  };
  
  // Language Configuration
  languageConfig: {
    preferredTerms: string[]; // max 20
    avoidTerms: string[]; // max 15
    defaultCTAs: string[]; // max 5
  };
  
  // Brand Values
  brandValues?: {
    mission?: string; // max 200 chars
    values: Array<{
      name: string;
      description?: string;
      weight: number; // 0.0-1.0
    }>; // max 5
    disclaimer: string; // required
  };
  
  // Wizard Control
  stepCompleted?: 'logo' | 'palette' | 'tone' | 'language' | 'values' | 'completed';
}

export class BrandOnboardingService {
  
  /**
   * Get onboarding data for a user
   */
  static async getByUserId(userId: string): Promise<BrandOnboarding | null> {
    const result = await db
      .select()
      .from(brandOnboarding)
      .where(eq(brandOnboarding.userId, userId))
      .limit(1);
    
    return result[0] || null;
  }
  
  /**
   * Create new onboarding record
   */
  static async create(userId: string, data: OnboardingData): Promise<BrandOnboarding> {
    const insertData: InsertBrandOnboarding = {
      userId,
      logoUrl: data.logoUrl || null,
      palette: data.palette || null,
      logoMetadata: data.logoMetadata || null,
      toneConfig: data.toneConfig,
      languageConfig: data.languageConfig,
      brandValues: data.brandValues || null,
      stepCompleted: data.stepCompleted || null,
    };
    
    const result = await db
      .insert(brandOnboarding)
      .values(insertData as any) // Type assertion to bypass the array type issue
      .returning();
    
    return result[0];
  }
  
  /**
   * Update existing onboarding record
   */
  static async update(userId: string, data: Partial<OnboardingData>): Promise<BrandOnboarding | null> {
    const updateData: Partial<InsertBrandOnboarding> = {};
    
    if (data.logoUrl !== undefined) updateData.logoUrl = data.logoUrl;
    if (data.palette !== undefined) updateData.palette = data.palette;
    if (data.logoMetadata !== undefined) updateData.logoMetadata = data.logoMetadata;
    if (data.toneConfig !== undefined) updateData.toneConfig = data.toneConfig;
    if (data.languageConfig !== undefined) updateData.languageConfig = data.languageConfig;
    if (data.brandValues !== undefined) updateData.brandValues = data.brandValues;
    if (data.stepCompleted !== undefined) updateData.stepCompleted = data.stepCompleted;
    
    const result = await db
      .update(brandOnboarding)
      .set(updateData as any) // Type assertion to bypass the array type issue
      .where(eq(brandOnboarding.userId, userId))
      .returning();
    
    return result.length > 0 ? result[0] : null;
  }
  
  /**
   * Upsert onboarding data (create or update)
   */
  static async upsert(userId: string, data: OnboardingData): Promise<BrandOnboarding> {
    const existing = await this.getByUserId(userId);
    
    if (existing) {
      return await this.update(userId, data) || existing;
    } else {
      return await this.create(userId, data);
    }
  }
  
  /**
   * Mark onboarding as completed
   */
  static async complete(userId: string): Promise<{
    onboarding: BrandOnboarding;
    brandVoiceData: {
      tone: any;
      language: any;
      values?: any;
    };
  } | null> {
    const updated = await this.update(userId, { stepCompleted: 'completed' });
    
    if (!updated) {
      return null;
    }
    
    // Format data for Brand Voice JSON
    const brandVoiceData = {
      tone: updated.toneConfig,
      language: updated.languageConfig,
      values: updated.brandValues
    };
    
    return {
      onboarding: updated,
      brandVoiceData
    };
  }
  
  /**
   * Delete onboarding data
   */
  static async delete(userId: string): Promise<boolean> {
    const result = await db
      .delete(brandOnboarding)
      .where(eq(brandOnboarding.userId, userId))
      .returning();
    
    return result.length > 0;
  }
  
  /**
   * Get onboarding progress
   */
  static async getProgress(userId: string): Promise<{
    currentStep: string;
    completed: boolean;
    completedSteps: string[];
    totalSteps: number;
  } | null> {
    const onboarding = await this.getByUserId(userId);
    
    if (!onboarding) {
      return null;
    }
    
    const allSteps = ['logo', 'palette', 'tone', 'language', 'values'];
    const completedSteps: string[] = [];
    
    // Determine completed steps based on data
    if (onboarding.logoUrl) completedSteps.push('logo');
    if (onboarding.palette && onboarding.palette.length > 0) completedSteps.push('palette');
    if (onboarding.toneConfig) completedSteps.push('tone');
    if (onboarding.languageConfig) completedSteps.push('language');
    if (onboarding.brandValues) completedSteps.push('values');
    
    const currentStep = onboarding.stepCompleted || 'logo';
    const completed = currentStep === 'completed';
    
    return {
      currentStep,
      completed,
      completedSteps,
      totalSteps: allSteps.length
    };
  }
  
  /**
   * Update step progress
   */
  static async updateStep(userId: string, step: string): Promise<BrandOnboarding | null> {
    return await this.update(userId, { 
      stepCompleted: step as 'logo' | 'palette' | 'tone' | 'language' | 'values' | 'completed'
    });
  }
  
  /**
   * Generate Brand Voice JSON from onboarding data
   */
  static async generateBrandVoiceJSON(userId: string): Promise<any> {
    const onboarding = await this.getByUserId(userId);
    
    if (!onboarding) {
      throw new Error('Onboarding data not found');
    }
    
    return {
      metadata: {
        version: '1.0',
        generatedAt: new Date().toISOString(),
        userId: userId
      },
      brand: {
        logo: {
          url: onboarding.logoUrl,
          palette: onboarding.palette,
          metadata: onboarding.logoMetadata
        }
      },
      tone: onboarding.toneConfig,
      language: onboarding.languageConfig,
      values: onboarding.brandValues
    };
  }
}