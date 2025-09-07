import { db } from '../db';
import { tenants, profiles, type Tenant } from '@shared/schema';
import { eq, and } from 'drizzle-orm';

export interface CreateTenantData {
  name: string;
  slug?: string;
  businessType?: string;
  domain?: string;
  settings?: any;
}

export interface UpdateTenantData {
  name?: string;
  businessType?: string;
  domain?: string;
  settings?: any;
  brandGuidelines?: any;
  subscriptionPlan?: 'free' | 'basic' | 'premium';
  subscriptionStatus?: 'active' | 'cancelled' | 'expired' | 'trial';
  status?: 'active' | 'suspended' | 'archived';
}

export class TenantService {
  
  /**
   * Generate unique slug for tenant
   */
  private static async generateUniqueSlug(baseName: string): Promise<string> {
    const baseSlug = baseName
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-+|-+$/g, '');
    
    if (!baseSlug) {
      throw new Error('Nome inválido para geração de slug');
    }
    
    let slug = baseSlug;
    let counter = 0;
    
    // Get database instance
    const dbInstance = await db;
    
    // Check if slug exists and generate variant if needed
    while (true) {
      try {
        const existing = await (dbInstance as any)
          .select({ id: tenants.id })
          .from(tenants)
          .where(eq(tenants.slug, slug))
          .limit(1);
          
        if (existing.length === 0) {
          break;
        }
        
        counter++;
        slug = `${baseSlug}-${counter}`;
      } catch (error) {
        // If database error, just use the slug with counter
        console.warn('Warning: Could not check slug uniqueness, using:', slug);
        break;
      }
    }
    
    return slug;
  }
  
  /**
   * Create new tenant
   */
  static async createTenant(ownerId: string, data: CreateTenantData): Promise<Tenant> {
    try {
      console.log('🏗️ TenantService.createTenant - Starting creation for user:', ownerId, 'with data:', data);

      // Generate unique slug if not provided
      const slug = data.slug || await this.generateUniqueSlug(data.name);
      console.log('🏗️ TenantService.createTenant - Generated slug:', slug);

      // Get database instance
      const dbInstance = await db;
      console.log('🏗️ TenantService.createTenant - Database instance obtained');

      // Create tenant
      console.log('🏗️ TenantService.createTenant - Inserting tenant record');
      const [newTenant] = await (dbInstance as any)
        .insert(tenants)
        .values({
          name: data.name,
          slug,
          ownerId,
          businessType: data.businessType,
          domain: data.domain,
          settings: data.settings || {},
          subscriptionPlan: 'free',
          subscriptionStatus: 'active',
          status: 'active'
        })
        .returning();

      console.log('🏗️ TenantService.createTenant - Tenant created:', {
        id: newTenant.id,
        name: newTenant.name,
        slug: newTenant.slug
      });

      // Add owner to tenant_users
      console.log('🏗️ TenantService.createTenant - Updating user profile with tenantId');
      const updateResult = await (dbInstance as any)
        .update(profiles)
        .set({ tenantId: newTenant.id })
        .where(eq(profiles.id, ownerId));

      console.log('🏗️ TenantService.createTenant - Profile update result:', updateResult);

      // Also add to tenant_users table for proper relationship
      try {
        console.log('🏗️ TenantService.createTenant - Adding user to tenant_users table');
        await (dbInstance as any)
          .insert('tenant_users')
          .values({
            tenantId: newTenant.id,
            userId: ownerId,
            role: 'owner',
            status: 'active'
          });
        console.log('✅ TenantService.createTenant - User added to tenant_users successfully');
      } catch (tenantUserError) {
        console.warn('⚠️ TenantService.createTenant - Failed to add user to tenant_users (might already exist):', tenantUserError);
        // Don't fail the entire operation for this
      }

      console.log(`✅ Created tenant ${newTenant.id} for user ${ownerId}`);
      return newTenant;
      
    } catch (error) {
      console.error('❌ Error creating tenant:', error);
      throw new Error('Falha ao criar tenant');
    }
  }
  
  /**
   * Get tenants for a user
   */
  static async getTenantsByUser(userId: string): Promise<Tenant[]> {
    try {
      console.log('🔍 TenantService.getTenantsByUser - Called with userId:', userId);

      const dbInstance = await db;
      console.log('🔍 TenantService.getTenantsByUser - Database instance obtained');

      // Get the user's profile to find their tenant_id
      console.log('🔍 TenantService.getTenantsByUser - Querying profiles table');
      const userProfile = await (dbInstance as any)
        .select({
          tenantId: profiles.tenantId,
          id: profiles.id
        })
        .from(profiles)
        .where(eq(profiles.id, userId))
        .limit(1);

      console.log('🔍 TenantService.getTenantsByUser - Profile query result:', {
        found: userProfile.length > 0,
        profileData: userProfile[0] ? {
          id: userProfile[0].id,
          tenantId: userProfile[0].tenantId,
          tenantIdType: typeof userProfile[0].tenantId,
          tenantIdIsNull: userProfile[0].tenantId === null,
          tenantIdIsUndefined: userProfile[0].tenantId === undefined
        } : null
      });

      if (userProfile.length === 0) {
        console.log('❌ TenantService.getTenantsByUser - No profile found for userId:', userId);
        console.log('🔄 TenantService.getTenantsByUser - Attempting to create user profile');

        try {
          // Create a basic profile for the user
          await (dbInstance as any)
            .insert(profiles)
            .values({
              id: userId,
              tenantId: null, // Will be set when tenant is created
              planType: 'free',
              subscriptionStatus: 'active',
              onboardingCompleted: false,
              onboardingStep: 'welcome',
              timezone: 'America/Sao_Paulo',
              language: 'pt-BR',
              notifications: {
                email: true,
                browser: true,
                marketing: false
              },
              metadata: {}
            });

          console.log('✅ TenantService.getTenantsByUser - User profile created successfully');
          return []; // Return empty array since no tenant exists yet
        } catch (createError) {
          console.error('❌ TenantService.getTenantsByUser - Failed to create user profile:', createError);
          return [];
        }
      }

      if (!userProfile[0].tenantId) {
        console.log('❌ TenantService.getTenantsByUser - Profile found but tenantId is null/undefined for userId:', userId);
        return [];
      }
      
      // Get the tenant details
      console.log('🔍 TenantService.getTenantsByUser - Querying tenants table with tenantId:', userProfile[0].tenantId);
      const result = await (dbInstance as any)
        .select({
          id: tenants.id,
          name: tenants.name,
          slug: tenants.slug,
          domain: tenants.domain,
          businessType: tenants.businessType,
          subscriptionPlan: tenants.subscriptionPlan,
          subscriptionStatus: tenants.subscriptionStatus,
          subscriptionEndDate: tenants.subscriptionEndDate,
          settings: tenants.settings,
          brandGuidelines: tenants.brandGuidelines,
          billingInfo: tenants.billingInfo,
          ownerId: tenants.ownerId,
          status: tenants.status,
          createdAt: tenants.createdAt,
          updatedAt: tenants.updatedAt,
        })
        .from(tenants)
        .where(eq(tenants.id, userProfile[0].tenantId));
      
      console.log('✅ TenantService.getTenantsByUser - Tenants query result:', {
        count: result.length,
        tenants: result.map((t: any) => ({ id: t.id, name: t.name }))
      });
      
      return result;
      
    } catch (error) {
      console.error('❌ Error getting user tenants:', error);
      throw new Error('Falha ao buscar tenants do usuário');
    }
  }
  
  /**
   * Get tenant details by ID
   */
  static async getTenantById(tenantId: string, userId: string): Promise<Tenant | null> {
    try {
      const dbInstance = await db;
      
      const [result] = await (dbInstance as any)
        .select({
          id: tenants.id,
          name: tenants.name,
          slug: tenants.slug,
          domain: tenants.domain,
          businessType: tenants.businessType,
          subscriptionPlan: tenants.subscriptionPlan,
          subscriptionStatus: tenants.subscriptionStatus,
          subscriptionEndDate: tenants.subscriptionEndDate,
          settings: tenants.settings,
          brandGuidelines: tenants.brandGuidelines,
          billingInfo: tenants.billingInfo,
          ownerId: tenants.ownerId,
          status: tenants.status,
          createdAt: tenants.createdAt,
          updatedAt: tenants.updatedAt,
        })
        .from(tenants)
        .where(eq(tenants.id, tenantId))
        .limit(1);
      
      // Check if user has access to this tenant through their profile
      const userProfile = await (dbInstance as any)
        .select({
          tenantId: profiles.tenantId
        })
        .from(profiles)
        .where(eq(profiles.id, userId))
        .limit(1);
      
      if (userProfile.length === 0 || userProfile[0].tenantId !== tenantId) {
        return null; // User doesn't have access to this tenant
      }
      
      return result || null;
      
    } catch (error) {
      console.error('❌ Error getting tenant by ID:', error);
      throw new Error('Falha ao buscar tenant');
    }
  }
  
  /**
   * Update tenant
   */
  static async updateTenant(tenantId: string, userId: string, data: UpdateTenantData): Promise<Tenant | null> {
    try {
      const dbInstance = await db;
      
      // Check if user has access to this tenant
      const existing = await this.getTenantById(tenantId, userId);
      if (!existing) {
        throw new Error('Tenant não encontrado ou acesso negado');
      }
      
      const [updatedTenant] = await (dbInstance as any)
        .update(tenants)
        .set({
          ...data,
          updatedAt: new Date()
        })
        .where(eq(tenants.id, tenantId))
        .returning();
      
      console.log(`✅ Updated tenant ${tenantId}`);
      return updatedTenant;
      
    } catch (error) {
      console.error('❌ Error updating tenant:', error);
      throw new Error('Falha ao atualizar tenant');
    }
  }
  
  /**
   * Get user's current tenant context (first tenant for now)
   */
  static async getUserCurrentTenant(userId: string): Promise<Tenant | null> {
    try {
      console.log('🔍 TenantService.getUserCurrentTenant - Called with userId:', userId);
      
      const userTenants = await this.getTenantsByUser(userId);
      console.log('🔍 TenantService.getUserCurrentTenant - Found tenants:', {
        count: userTenants.length,
        tenants: userTenants.map(t => ({ id: t.id, name: t.name }))
      });
      
      if (userTenants.length === 0) {
        console.log('❌ TenantService.getUserCurrentTenant - No tenants found for user');
        return null;
      }
      
      // Return first tenant (could be enhanced to use user preferences)
      const currentTenant = userTenants[0];
      console.log('✅ TenantService.getUserCurrentTenant - Returning tenant:', {
        id: currentTenant.id,
        name: currentTenant.name
      });
      
      return currentTenant;
      
    } catch (error) {
      console.error('❌ TenantService.getUserCurrentTenant - Error:', error);
      return null;
    }
  }
  
  /**
   * Check if user has access to tenant
   */
  static async checkUserAccess(tenantId: string, userId: string): Promise<boolean> {
    try {
      const tenant = await this.getTenantById(tenantId, userId);
      return tenant !== null;
    } catch (error) {
      console.error('❌ Error checking user access:', error);
      return false;
    }
  }
}

export default TenantService;