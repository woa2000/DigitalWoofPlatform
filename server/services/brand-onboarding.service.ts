import { db } from '../db';
import { brandOnboarding, type BrandOnboarding, type InsertBrandOnboarding } from '../../shared/schema';
import { eq } from 'drizzle-orm';
import { createClient } from '@supabase/supabase-js';

// Supabase client for development
const supabaseUrl = process.env.SUPABASE_URL || '';
const supabaseKey = process.env.SUPABASE_ANON_KEY || '';
const supabase = supabaseUrl && supabaseKey ? createClient(supabaseUrl, supabaseKey) : null;

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
  
  // In-memory storage for development when DB is not available
  private static inMemoryStorage: Map<string, BrandOnboarding> = new Map();
  
  // Initialize with some mock data for testing
  private static initializeMockData() {
    if (BrandOnboardingService.inMemoryStorage.size === 0) {
      const mockData: BrandOnboarding = {
        id: 'mock-test-user-123',
        userId: 'test-user-123',
        logoUrl: null,
        palette: ['#1E40AF', '#EF4444', '#10B981'],
        logoMetadata: null,
        toneConfig: {
          confianca: 0.8,
          acolhimento: 0.6,
          humor: 0.4,
          especializacao: 0.9,
        },
        languageConfig: {
          preferredTerms: ['inovação', 'qualidade', 'excelência'],
          avoidTerms: ['barato', 'simples'],
          defaultCTAs: ['Saiba mais', 'Entre em contato', 'Descubra'],
        },
        brandValues: {
          mission: 'Transformar a experiência digital dos pets',
          values: [
            { name: 'Inovação', description: 'Sempre buscando novas soluções', weight: 0.9 },
            { name: 'Cuidado', description: 'Cada pet é especial', weight: 0.8 },
          ],
          disclaimer: 'Nossos valores guiam todas as nossas decisões',
        },
        stepCompleted: 'completed',
        createdAt: new Date(),
        updatedAt: new Date(),
        completedAt: new Date(),
      };
      
      BrandOnboardingService.inMemoryStorage.set('test-user-123', mockData);
      console.log('🎭 Mock data initialized for test-user-123');
    }
  }
  
  /**
   * Check if database is available
   */
  private static async isDatabaseAvailable(): Promise<boolean> {
    try {
      console.log('🔍 Testing database connection...');

      // In development, use Supabase as it's working and provides persistence
      if (process.env.NODE_ENV === 'development' && supabase) {
        console.log('🏠 Development mode: Using Supabase for persistent storage');
        return true;
      }

      // In production, try direct database connection
      const dbInstance = await db;
      if (dbInstance && typeof (dbInstance as any).select === 'function') {
        await (dbInstance as any).select().from(brandOnboarding).limit(1);
        console.log('✅ Direct database connection available');
        return true;
      }

      console.warn('⚠️ No database connection available, using in-memory storage');
      return false;
    } catch (error) {
      console.warn('⚠️ Database not available, using in-memory storage:', error instanceof Error ? error.message : String(error));
      return false;
    }
  }
  
  /**
    * Get onboarding data for a user
    */
   static async getByUserId(userId: string): Promise<BrandOnboarding | null> {
     try {
       console.log(`🔍 Getting onboarding data for user: ${userId}`);
       
       // Initialize mock data if needed
       BrandOnboardingService.initializeMockData();
       
       const dbAvailable = await this.isDatabaseAvailable();
       
       if (dbAvailable && process.env.NODE_ENV === 'development' && supabase) {
         console.log('📋 Using Supabase storage for development');
         try {
           const { data, error } = await supabase
             .from('brand_onboarding')
             .select('*')
             .eq('user_id', userId)
             .single();

           if (error && error.code !== 'PGRST116') { // PGRST116 = no rows
             throw error;
           }

           const result = data || null;
           console.log(`📊 Supabase result:`, result ? 'Found' : 'Not found');
           return result;
         } catch (error) {
           console.warn('⚠️ Supabase query failed, falling back to in-memory:', error);
           const data = BrandOnboardingService.inMemoryStorage.get(userId) || null;
           return data;
         }
       } else if (dbAvailable) {
         console.log('📋 Using database storage');
         const dbInstance = await db;
         const result = await (dbInstance as any)
           .select()
           .from(brandOnboarding)
           .where(eq(brandOnboarding.userId, userId))
           .limit(1);

         const data = result[0] || null;
         console.log(`📊 Database result:`, data ? 'Found' : 'Not found');
         return data;
       } else {
         // Fallback to in-memory storage
         console.log('💾 Using in-memory storage');
         const data = BrandOnboardingService.inMemoryStorage.get(userId) || null;
         console.log(`📊 In-memory result:`, data ? 'Found' : 'Not found');
         return data;
       }
     } catch (error) {
       console.error('❌ Database error in getByUserId:', error);
       // Return from in-memory storage as fallback
       const data = BrandOnboardingService.inMemoryStorage.get(userId) || null;
       console.log(`📊 Fallback in-memory result:`, data ? 'Found' : 'Not found');
       return data;
     }
   }
  
  /**
    * Create new onboarding record
    */
   static async create(userId: string, data: OnboardingData): Promise<BrandOnboarding> {
     try {
       const dbAvailable = await this.isDatabaseAvailable();
       
       if (dbAvailable && process.env.NODE_ENV === 'development' && supabase) {
         console.log('📝 Using Supabase for development storage');
         try {
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
             throw error;
           }

           return result as BrandOnboarding;
         } catch (error) {
           console.warn('⚠️ Supabase insert failed, falling back to in-memory:', error);
           const mockRecord: BrandOnboarding = {
             id: `mock-${Date.now()}`,
             userId,
             logoUrl: data.logoUrl || null,
             palette: data.palette || null,
             logoMetadata: data.logoMetadata || null,
             toneConfig: data.toneConfig,
             languageConfig: data.languageConfig,
             brandValues: data.brandValues || null,
             stepCompleted: data.stepCompleted || null,
             createdAt: new Date(),
             updatedAt: new Date(),
             completedAt: null,
           };

           BrandOnboardingService.inMemoryStorage.set(userId, mockRecord);
           return mockRecord;
         }
       } else if (dbAvailable) {
         const dbInstance = await db;
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

         const result = await (dbInstance as any)
           .insert(brandOnboarding)
           .values(insertData as any)
           .returning();

         return result[0];
       } else {
         // Fallback to in-memory storage
         const mockRecord: BrandOnboarding = {
           id: `mock-${Date.now()}`,
           userId,
           logoUrl: data.logoUrl || null,
           palette: data.palette || null,
           logoMetadata: data.logoMetadata || null,
           toneConfig: data.toneConfig,
           languageConfig: data.languageConfig,
           brandValues: data.brandValues || null,
           stepCompleted: data.stepCompleted || null,
           createdAt: new Date(),
           updatedAt: new Date(),
           completedAt: null,
         };

         BrandOnboardingService.inMemoryStorage.set(userId, mockRecord);
         return mockRecord;
       }
     } catch (error) {
       console.error('Database error in create:', error);
       // Fallback to in-memory storage
       const mockRecord: BrandOnboarding = {
         id: `mock-${Date.now()}`,
         userId,
         logoUrl: data.logoUrl || null,
         palette: data.palette || null,
         logoMetadata: data.logoMetadata || null,
         toneConfig: data.toneConfig,
         languageConfig: data.languageConfig,
         brandValues: data.brandValues || null,
         stepCompleted: data.stepCompleted || null,
         createdAt: new Date(),
         updatedAt: new Date(),
         completedAt: null,
       };
       
       BrandOnboardingService.inMemoryStorage.set(userId, mockRecord);
       return mockRecord;
     }
   }
  
  /**
   * Update existing onboarding record
   */
  static async update(userId: string, data: Partial<OnboardingData>): Promise<BrandOnboarding | null> {
    try {
      const dbAvailable = await this.isDatabaseAvailable();
      
      if (dbAvailable && process.env.NODE_ENV === 'development' && supabase) {
        console.log('📝 Using Supabase for development update');
        try {
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

          if (error && error.code !== 'PGRST116') {
            throw error;
          }

          return result || null;
        } catch (error) {
          console.warn('⚠️ Supabase update failed, falling back to in-memory:', error);
          const existing = BrandOnboardingService.inMemoryStorage.get(userId);
          if (!existing) return null;

          const updated = {
            ...existing,
            ...data,
            updatedAt: new Date(),
          };

          BrandOnboardingService.inMemoryStorage.set(userId, updated);
          return updated;
        }
      } else if (dbAvailable) {
        const dbInstance = await db;
        const updateData: Partial<InsertBrandOnboarding> = {};

        if (data.logoUrl !== undefined) updateData.logoUrl = data.logoUrl;
        if (data.palette !== undefined) updateData.palette = data.palette;
        if (data.logoMetadata !== undefined) updateData.logoMetadata = data.logoMetadata;
        if (data.toneConfig !== undefined) updateData.toneConfig = data.toneConfig;
        if (data.languageConfig !== undefined) updateData.languageConfig = data.languageConfig;
        if (data.brandValues !== undefined) updateData.brandValues = data.brandValues;
        if (data.stepCompleted !== undefined) updateData.stepCompleted = data.stepCompleted;

        const result = await (dbInstance as any)
          .update(brandOnboarding)
          .set(updateData as any)
          .where(eq(brandOnboarding.userId, userId))
          .returning();

        return result.length > 0 ? result[0] : null;
      } else {
        // Fallback to in-memory storage
        const existing = BrandOnboardingService.inMemoryStorage.get(userId);
        if (!existing) return null;

        const updated = {
          ...existing,
          ...data,
          updatedAt: new Date(),
        };

        BrandOnboardingService.inMemoryStorage.set(userId, updated);
        return updated;
      }
    } catch (error) {
      console.error('Database error in update:', error);
      // Fallback to in-memory storage
      const existing = BrandOnboardingService.inMemoryStorage.get(userId);
      if (!existing) return null;
      
      const updated = {
        ...existing,
        ...data,
        updatedAt: new Date(),
      };
      
      BrandOnboardingService.inMemoryStorage.set(userId, updated);
      return updated;
    }
  }
  
  /**
    * Upsert onboarding data (create or update)
    */
   static async upsert(userId: string, data: OnboardingData): Promise<BrandOnboarding> {
     try {
       const existing = await this.getByUserId(userId);

       if (existing) {
         return await this.update(userId, data) || existing;
       } else {
         return await this.create(userId, data);
       }
     } catch (error) {
       console.error('Database error in upsert:', error);
       throw new Error('Database connection failed. Please try again later.');
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
    try {
      const dbAvailable = await this.isDatabaseAvailable();
      
      if (dbAvailable && process.env.NODE_ENV === 'development' && supabase) {
        console.log('🗑️ Using Supabase for development delete');
        try {
          const { error } = await supabase
            .from('brand_onboarding')
            .delete()
            .eq('user_id', userId);

          if (error) {
            throw error;
          }

          return true;
        } catch (error) {
          console.warn('⚠️ Supabase delete failed, falling back to in-memory:', error);
          return BrandOnboardingService.inMemoryStorage.delete(userId);
        }
      } else if (dbAvailable) {
        const dbInstance = await db;
        const result = await (dbInstance as any)
          .delete(brandOnboarding)
          .where(eq(brandOnboarding.userId, userId))
          .returning();

        return result.length > 0;
      } else {
        // Fallback to in-memory storage
        return BrandOnboardingService.inMemoryStorage.delete(userId);
      }
    } catch (error) {
      console.error('Database error in delete:', error);
      // Fallback to in-memory storage
      return BrandOnboardingService.inMemoryStorage.delete(userId);
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