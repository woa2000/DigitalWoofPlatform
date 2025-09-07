import { db } from '../db';
import { tenants, tenantUsers, type Tenant, type TenantUser } from '@shared/schema';
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
      // Generate unique slug if not provided
      const slug = data.slug || await this.generateUniqueSlug(data.name);
      
      // Get database instance
      const dbInstance = await db;
      
      // Create tenant
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
      
      // Add owner to tenant_users
      await (dbInstance as any)
        .insert(tenantUsers)
        .values({
          tenantId: newTenant.id,
          userId: ownerId,
          role: 'owner',
          status: 'active'
        });
      
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
      const dbInstance = await db;
      
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
        .innerJoin(tenantUsers, eq(tenants.id, tenantUsers.tenantId))
        .where(and(
          eq(tenantUsers.userId, userId),
          eq(tenantUsers.status, 'active')
        ));
      
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
        .innerJoin(tenantUsers, eq(tenants.id, tenantUsers.tenantId))
        .where(and(
          eq(tenants.id, tenantId),
          eq(tenantUsers.userId, userId),
          eq(tenantUsers.status, 'active')
        ))
        .limit(1);
      
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
      const userTenants = await this.getTenantsByUser(userId);
      
      if (userTenants.length === 0) {
        return null;
      }
      
      // Return first tenant (could be enhanced to use user preferences)
      return userTenants[0];
      
    } catch (error) {
      console.error('❌ Error getting user current tenant:', error);
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