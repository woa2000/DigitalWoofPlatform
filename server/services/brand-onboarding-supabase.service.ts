import { createClient, SupabaseClient } from '@supabase/supabase-js';
import { OnboardingData } from './brand-onboarding.service.js';

const supabaseUrl = process.env.SUPABASE_URL || '';
const supabaseKey = process.env.SUPABASE_ANON_KEY || '';

if (!supabaseUrl || !supabaseKey) {
  throw new Error('Missing Supabase environment variables');
}

const supabase = createClient(supabaseUrl, supabaseKey);

export interface BrandOnboardingRecord {
  id: string;
  userId: string;
  logoUrl?: string;
  palette?: string[];
  logoMetadata?: {
    width: number;
    height: number;
    format: string;
    hasTransparency: boolean;
    fileSize: number;
  };
  toneConfig: {
    confianca: number;
    acolhimento: number;
    humor: number;
    especializacao: number;
  };
  languageConfig: {
    preferredTerms: string[];
    avoidTerms: string[];
    defaultCTAs: string[];
  };
  brandValues?: {
    mission?: string;
    values: Array<{
      name: string;
      description?: string;
      weight: number;
    }>;
    disclaimer: string;
  };
  stepCompleted?: 'logo' | 'palette' | 'tone' | 'language' | 'values' | 'completed';
  createdAt: string;
  updatedAt: string;
  completedAt?: string;
}

export class BrandOnboardingSupabaseService {

  /**
   * Get onboarding data for a user
   */
  static async getByUserId(userId: string): Promise<BrandOnboardingRecord | null> {
    try {
      console.log(`🔍 Getting onboarding data for user: ${userId}`);

      const { data, error } = await supabase
        .from('brand_onboarding')
        .select('*')
        .eq('user_id', userId)
        .single();

      if (error) {
        if (error.code === 'PGRST116') { // No rows returned
          console.log('📊 No onboarding data found for user');
          return null;
        }
        console.error('❌ Error fetching onboarding data:', error);
        throw error;
      }

      console.log('✅ Onboarding data retrieved successfully');
      return data as BrandOnboardingRecord;
    } catch (error) {
      console.error('❌ Database error in getByUserId:', error);
      throw new Error('Failed to fetch onboarding data');
    }
  }

  /**
   * Create new onboarding record
   */
  static async create(userId: string, data: OnboardingData): Promise<BrandOnboardingRecord> {
    try {
      console.log(`📝 Creating onboarding record for user: ${userId}`);

      const record = {
        user_id: userId,
        logoUrl: data.logoUrl || null,
        palette: data.palette || null,
        logoMetadata: data.logoMetadata || null,
        toneConfig: data.toneConfig,
        languageConfig: data.languageConfig,
        brandValues: data.brandValues || null,
        stepCompleted: data.stepCompleted || null,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        completedAt: null
      };

      const { data: result, error } = await supabase
        .from('brand_onboarding')
        .insert(record)
        .select()
        .single();

      if (error) {
        console.error('❌ Error creating onboarding record:', error);
        throw error;
      }

      console.log('✅ Onboarding record created successfully');
      return result as BrandOnboardingRecord;
    } catch (error) {
      console.error('❌ Database error in create:', error);
      throw new Error('Failed to create onboarding record');
    }
  }

  /**
   * Update existing onboarding record
   */
  static async update(userId: string, data: Partial<OnboardingData>): Promise<BrandOnboardingRecord | null> {
    try {
      console.log(`📝 Updating onboarding record for user: ${userId}`);

      const updateData: any = {
        updatedAt: new Date().toISOString()
      };

      if (data.logoUrl !== undefined) updateData.logoUrl = data.logoUrl;
      if (data.palette !== undefined) updateData.palette = data.palette;
      if (data.logoMetadata !== undefined) updateData.logoMetadata = data.logoMetadata;
      if (data.toneConfig !== undefined) updateData.toneConfig = data.toneConfig;
      if (data.languageConfig !== undefined) updateData.languageConfig = data.languageConfig;
      if (data.brandValues !== undefined) updateData.brandValues = data.brandValues;
      if (data.stepCompleted !== undefined) updateData.stepCompleted = data.stepCompleted;

      const { data: result, error } = await supabase
        .from('brand_onboarding')
        .update(updateData)
        .eq('user_id', userId)
        .select()
        .single();

      if (error) {
        if (error.code === 'PGRST116') { // No rows returned
          console.log('📊 No onboarding data found to update');
          return null;
        }
        console.error('❌ Error updating onboarding record:', error);
        throw error;
      }

      console.log('✅ Onboarding record updated successfully');
      return result as BrandOnboardingRecord;
    } catch (error) {
      console.error('❌ Database error in update:', error);
      throw new Error('Failed to update onboarding record');
    }
  }

  /**
   * Upsert onboarding data (create or update)
   */
  static async upsert(userId: string, data: OnboardingData): Promise<BrandOnboardingRecord> {
    try {
      console.log(`📝 Upserting onboarding data for user: ${userId}`);

      const existing = await this.getByUserId(userId);

      if (existing) {
        return await this.update(userId, data) || existing;
      } else {
        return await this.create(userId, data);
      }
    } catch (error) {
      console.error('❌ Database error in upsert:', error);
      throw new Error('Failed to save onboarding data');
    }
  }

  /**
   * Mark onboarding as completed
   */
  static async complete(userId: string): Promise<{
    onboarding: BrandOnboardingRecord;
    brandVoiceData: {
      tone: any;
      language: any;
      values?: any;
    };
  } | null> {
    try {
      console.log(`🎉 Completing onboarding for user: ${userId}`);

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
    } catch (error) {
      console.error('❌ Database error in complete:', error);
      throw new Error('Failed to complete onboarding');
    }
  }

  /**
   * Delete onboarding data
   */
  static async delete(userId: string): Promise<boolean> {
    try {
      console.log(`🗑️ Deleting onboarding data for user: ${userId}`);

      const { error } = await supabase
        .from('brand_onboarding')
        .delete()
        .eq('user_id', userId);

      if (error) {
        console.error('❌ Error deleting onboarding data:', error);
        return false;
      }

      console.log('✅ Onboarding data deleted successfully');
      return true;
    } catch (error) {
      console.error('❌ Database error in delete:', error);
      return false;
    }
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
    try {
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
    } catch (error) {
      console.error('❌ Database error in getProgress:', error);
      return null;
    }
  }

  /**
   * Update step progress
   */
  static async updateStep(userId: string, step: string): Promise<BrandOnboardingRecord | null> {
    return await this.update(userId, {
      stepCompleted: step as 'logo' | 'palette' | 'tone' | 'language' | 'values' | 'completed'
    });
  }

  /**
   * Generate Brand Voice JSON from onboarding data
   */
  static async generateBrandVoiceJSON(userId: string): Promise<any> {
    try {
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
    } catch (error) {
      console.error('❌ Database error in generateBrandVoiceJSON:', error);
      throw new Error('Failed to generate Brand Voice JSON');
    }
  }
}