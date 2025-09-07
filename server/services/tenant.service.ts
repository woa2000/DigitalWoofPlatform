/**/**import { db } from '../db';

 * Tenant Service - Simplified

 * Core service for handling tenant context and operations * Tenant Service - Simplifiedimport { tenants, tenantUsers, profiles, type Tenant, type TenantUser, type InsertTenant, type InsertTenantUser } from '@shared/schema';

 */

 * Core service for handling tenant context and operationsimport { eq, and, sql } from 'drizzle-orm';

import { eq, and } from 'drizzle-orm';

import { getDatabase } from '../database'; */

import { tenants, tenantUsers, profiles } from '../../shared/schema';

export interface CreateTenantData {

export interface TenantContext {

  tenantId: string;import { eq } from 'drizzle-orm';  name: string;

  userId: string;

  role: string;import { getDatabase } from '../database';  slug?: string;

}

import { tenants, tenantUsers, profiles } from '../../shared/schema';  businessType?: string;

export class TenantService {

  /**  domain?: string;

   * Get tenant context for user

   */export interface TenantContext {  settings?: any;

  static async getTenantContext(userId: string): Promise<TenantContext | null> {

    try {  tenantId: string;}

      const db = await getDatabase();

        userId: string;

      // Get user's tenant info

      const result = await db  role: string;export interface UpdateTenantData {

        .select({

          tenantId: tenantUsers.tenantId,}  name?: string;

          role: tenantUsers.role

        })  businessType?: string;

        .from(tenantUsers)

        .where(eq(tenantUsers.userId, userId))export class TenantService {  domain?: string;

        .limit(1);

  /**  settings?: any;

      if (result.length === 0) {

        return null;   * Get tenant context for user  brandGuidelines?: any;

      }

   */  subscriptionPlan?: 'free' | 'basic' | 'premium';

      return {

        tenantId: result[0].tenantId,  static async getTenantContext(userId: string): Promise<TenantContext | null> {  subscriptionStatus?: 'active' | 'cancelled' | 'expired' | 'trial';

        userId,

        role: result[0].role    try {  status?: 'active' | 'suspended' | 'archived';

      };

    } catch (error) {      const db = await getDatabase();}

      console.error('Failed to get tenant context:', error);

      return null;      

    }

  }      // Get user's tenant infoexport interface TenantWithUserRole extends Tenant {



  /**      const result = await db  userRole: string;

   * Check if user has required role in tenant

   */        .select({  userStatus: string;

  static async hasRole(userId: string, tenantId: string, requiredRoles: string[]): Promise<boolean> {

    try {          tenantId: tenantUsers.tenantId,  memberCount: number;

      const db = await getDatabase();

                role: tenantUsers.role}

      const result = await db

        .select({        })

          role: tenantUsers.role

        })        .from(tenantUsers)export interface InviteUserData {

        .from(tenantUsers)

        .where(        .where(eq(tenantUsers.userId, userId))  email: string;

          and(

            eq(tenantUsers.userId, userId),        .limit(1);  role: 'admin' | 'member' | 'viewer';

            eq(tenantUsers.tenantId, tenantId)

          )  permissions?: string[];

        )

        .limit(1);      if (result.length === 0) {}



      if (result.length === 0) {        return null;

        return false;

      }      }export class TenantService {



      return requiredRoles.includes(result[0].role);  

    } catch (error) {

      console.error('Failed to check user role:', error);      return {  /**

      return false;

    }        tenantId: result[0].tenantId,   * Generate unique slug for tenant

  }

        userId,   */

  /**

   * Get tenant users with their profiles        role: result[0].role  private static async generateUniqueSlug(baseName: string): Promise<string> {

   */

  static async getTenantUsers(tenantId: string) {      };    const baseSlug = baseName

    try {

      const db = await getDatabase();    } catch (error) {      .toLowerCase()

      

      const users = await db      console.error('Failed to get tenant context:', error);      .replace(/[^a-z0-9]+/g, '-')

        .select({

          userId: tenantUsers.userId,      return null;      .replace(/^-+|-+$/g, '');

          role: tenantUsers.role,

          status: tenantUsers.status,    }    

          joinedAt: tenantUsers.createdAt,

          profile: {  }    if (!baseSlug) {

            name: profiles.name,

            email: profiles.email,      throw new Error('Nome inválido para geração de slug');

            avatarUrl: profiles.avatarUrl

          }  /**    }

        })

        .from(tenantUsers)   * Check if user has required role in tenant    

        .leftJoin(profiles, eq(profiles.userId, tenantUsers.userId))

        .where(eq(tenantUsers.tenantId, tenantId));   */    let slug = baseSlug;



      return users;  static async hasRole(userId: string, tenantId: string, requiredRoles: string[]): Promise<boolean> {    let counter = 0;

    } catch (error) {

      console.error('Failed to get tenant users:', error);    try {    

      return [];

    }      const db = await getDatabase();    // Get database instance

  }

          const dbInstance = await db;

  /**

   * Add user to tenant      const result = await db    

   */

  static async addUserToTenant(tenantId: string, userId: string, role: string) {        .select({    // Check if slug exists and generate variant if needed

    try {

      const db = await getDatabase();          role: tenantUsers.role    while (true) {

      

      const [tenantUser] = await db        })      const existing = await (dbInstance as any)

        .insert(tenantUsers)

        .values({        .from(tenantUsers)        .select({ id: tenants.id })

          tenantId,

          userId,        .where(        .from(tenants)

          role,

          status: 'active'          eq(tenantUsers.userId, userId) &&         .where(eq(tenants.slug, slug))

        })

        .returning();          eq(tenantUsers.tenantId, tenantId)        .limit(1);



      return tenantUser;        )        

    } catch (error) {

      console.error('Failed to add user to tenant:', error);        .limit(1);      if (existing.length === 0) {

      throw error;

    }        break;

  }

      if (result.length === 0) {      }

  /**

   * Update user role in tenant        return false;      

   */

  static async updateUserRole(tenantId: string, userId: string, newRole: string) {      }      counter++;

    try {

      const db = await getDatabase();      slug = `${baseSlug}-${counter}`;

      

      const [updated] = await db      return requiredRoles.includes(result[0].role);    }

        .update(tenantUsers)

        .set({     } catch (error) {    

          role: newRole,

          updatedAt: new Date()      console.error('Failed to check user role:', error);    return slug;

        })

        .where(      return false;  }

          and(

            eq(tenantUsers.tenantId, tenantId),    }  

            eq(tenantUsers.userId, userId)

          )  }  /**

        )

        .returning();   * Create new tenant



      return updated;  /**   */

    } catch (error) {

      console.error('Failed to update user role:', error);   * Get tenant users with their profiles  static async createTenant(ownerId: string, data: CreateTenantData): Promise<Tenant> {

      throw error;

    }   */    try {

  }

  static async getTenantUsers(tenantId: string) {      // Generate unique slug if not provided

  /**

   * Remove user from tenant    try {      const slug = data.slug || await this.generateUniqueSlug(data.name);

   */

  static async removeUserFromTenant(tenantId: string, userId: string) {      const db = await getDatabase();      

    try {

      const db = await getDatabase();            // Create tenant

      

      await db      const users = await db      const [newTenant] = await db

        .delete(tenantUsers)

        .where(        .select({        .insert(tenants)

          and(

            eq(tenantUsers.tenantId, tenantId),          userId: tenantUsers.userId,        .values({

            eq(tenantUsers.userId, userId)

          )          role: tenantUsers.role,          name: data.name,

        );

          status: tenantUsers.status,          slug,

      return true;

    } catch (error) {          joinedAt: tenantUsers.createdAt,          ownerId,

      console.error('Failed to remove user from tenant:', error);

      throw error;          profile: {          businessType: data.businessType,

    }

  }            name: profiles.name,          domain: data.domain,

}

            email: profiles.email,          settings: data.settings || {},

export default TenantService;
            avatarUrl: profiles.avatarUrl          subscriptionPlan: 'free',

          }          subscriptionStatus: 'active',

        })          status: 'active'

        .from(tenantUsers)        })

        .leftJoin(profiles, eq(profiles.userId, tenantUsers.userId))        .returning();

        .where(eq(tenantUsers.tenantId, tenantId));      

      // Add owner to tenant_users

      return users;      await db

    } catch (error) {        .insert(tenantUsers)

      console.error('Failed to get tenant users:', error);        .values({

      return [];          tenantId: newTenant.id,

    }          userId: ownerId,

  }          role: 'owner',

          status: 'active'

  /**        });

   * Add user to tenant      

   */      console.log(`✅ Created tenant ${newTenant.id} for user ${ownerId}`);

  static async addUserToTenant(tenantId: string, userId: string, role: string) {      return newTenant;

    try {      

      const db = await getDatabase();    } catch (error) {

            console.error('❌ Error creating tenant:', error);

      const [tenantUser] = await db      throw new Error('Falha ao criar tenant');

        .insert(tenantUsers)    }

        .values({  }

          tenantId,  

          userId,  /**

          role,   * Get tenants for a user

          status: 'active'   */

        })  static async getTenantsByUser(userId: string): Promise<TenantWithUserRole[]> {

        .returning();    try {

      const result = await db

      return tenantUser;        .select({

    } catch (error) {          id: tenants.id,

      console.error('Failed to add user to tenant:', error);          name: tenants.name,

      throw error;          slug: tenants.slug,

    }          domain: tenants.domain,

  }          businessType: tenants.businessType,

          subscriptionPlan: tenants.subscriptionPlan,

  /**          subscriptionStatus: tenants.subscriptionStatus,

   * Update user role in tenant          subscriptionEndDate: tenants.subscriptionEndDate,

   */          settings: tenants.settings,

  static async updateUserRole(tenantId: string, userId: string, newRole: string) {          brandGuidelines: tenants.brandGuidelines,

    try {          billingInfo: tenants.billingInfo,

      const db = await getDatabase();          ownerId: tenants.ownerId,

                status: tenants.status,

      const [updated] = await db          createdAt: tenants.createdAt,

        .update(tenantUsers)          updatedAt: tenants.updatedAt,

        .set({           userRole: tenantUsers.role,

          role: newRole,          userStatus: tenantUsers.status,

          updatedAt: new Date()        })

        })        .from(tenants)

        .where(        .innerJoin(tenantUsers, eq(tenants.id, tenantUsers.tenantId))

          eq(tenantUsers.tenantId, tenantId) &&         .where(and(

          eq(tenantUsers.userId, userId)          eq(tenantUsers.userId, userId),

        )          eq(tenantUsers.status, 'active')

        .returning();        ));

      

      return updated;      // Get member count for each tenant

    } catch (error) {      const tenantsWithMemberCount = await Promise.all(

      console.error('Failed to update user role:', error);        result.map(async (tenant) => {

      throw error;          const [memberCount] = await db

    }            .select({ count: sql<number>`count(*)` })

  }            .from(tenantUsers)

            .where(and(

  /**              eq(tenantUsers.tenantId, tenant.id),

   * Remove user from tenant              eq(tenantUsers.status, 'active')

   */            ));

  static async removeUserFromTenant(tenantId: string, userId: string) {          

    try {          return {

      const db = await getDatabase();            ...tenant,

                  memberCount: memberCount.count || 0

      await db          } as TenantWithUserRole;

        .delete(tenantUsers)        })

        .where(      );

          eq(tenantUsers.tenantId, tenantId) &&       

          eq(tenantUsers.userId, userId)      return tenantsWithMemberCount;

        );      

    } catch (error) {

      return true;      console.error('❌ Error getting user tenants:', error);

    } catch (error) {      throw new Error('Falha ao buscar tenants do usuário');

      console.error('Failed to remove user from tenant:', error);    }

      throw error;  }

    }  

  }  /**

}   * Get tenant details by ID

   */

export default TenantService;  static async getTenantById(tenantId: string, userId: string): Promise<TenantWithUserRole | null> {
    try {
      const [result] = await db
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
          userRole: tenantUsers.role,
          userStatus: tenantUsers.status,
        })
        .from(tenants)
        .innerJoin(tenantUsers, eq(tenants.id, tenantUsers.tenantId))
        .where(and(
          eq(tenants.id, tenantId),
          eq(tenantUsers.userId, userId),
          eq(tenantUsers.status, 'active')
        ))
        .limit(1);
      
      if (!result) {
        return null;
      }
      
      // Get member count
      const [memberCount] = await db
        .select({ count: sql<number>`count(*)` })
        .from(tenantUsers)
        .where(and(
          eq(tenantUsers.tenantId, tenantId),
          eq(tenantUsers.status, 'active')
        ));
      
      return {
        ...result,
        memberCount: memberCount.count || 0
      } as TenantWithUserRole;
      
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
      // Check if user has permission to update (owner or admin)
      const userAccess = await this.checkUserAccess(tenantId, userId, ['owner', 'admin']);
      if (!userAccess) {
        throw new Error('Permissão insuficiente para atualizar tenant');
      }
      
      const [updatedTenant] = await db
        .update(tenants)
        .set({
          ...data,
          updatedAt: sql`now()`
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
   * Get tenant members
   */
  static async getTenantMembers(tenantId: string, userId: string): Promise<Array<TenantUser & { userProfile?: any }>> {
    try {
      // Check if user has access to this tenant
      const userAccess = await this.checkUserAccess(tenantId, userId);
      if (!userAccess) {
        throw new Error('Acesso negado ao tenant');
      }
      
      const members = await db
        .select({
          id: tenantUsers.id,
          tenantId: tenantUsers.tenantId,
          userId: tenantUsers.userId,
          role: tenantUsers.role,
          permissions: tenantUsers.permissions,
          status: tenantUsers.status,
          invitedBy: tenantUsers.invitedBy,
          invitedAt: tenantUsers.invitedAt,
          joinedAt: tenantUsers.joinedAt,
          createdAt: tenantUsers.createdAt,
          updatedAt: tenantUsers.updatedAt,
          // User profile data
          userFullName: profiles.fullName,
          userAvatarUrl: profiles.avatarUrl,
        })
        .from(tenantUsers)
        .leftJoin(profiles, eq(tenantUsers.userId, profiles.id))
        .where(eq(tenantUsers.tenantId, tenantId))
        .orderBy(tenantUsers.createdAt);
      
      return members;
      
    } catch (error) {
      console.error('❌ Error getting tenant members:', error);
      throw new Error('Falha ao buscar membros do tenant');
    }
  }\n  \n  /**\n   * Invite user to tenant\n   */\n  static async inviteUserToTenant(\n    tenantId: string, \n    inviterUserId: string, \n    data: InviteUserData\n  ): Promise<{ success: boolean; message: string; tenantUser?: TenantUser }> {\n    try {\n      // Check if inviter has permission (owner or admin)\n      const inviterAccess = await this.checkUserAccess(tenantId, inviterUserId, ['owner', 'admin']);\n      if (!inviterAccess) {\n        return { success: false, message: 'Permissão insuficiente para convidar usuários' };\n      }\n      \n      // For now, we'll assume the user exists and use their email as userId\n      // In a real implementation, you'd look up the user by email\n      // and possibly send an invitation email\n      \n      // Check if user is already in tenant\n      const existing = await db\n        .select()\n        .from(tenantUsers)\n        .where(and(\n          eq(tenantUsers.tenantId, tenantId),\n          eq(tenantUsers.userId, data.email) // Using email as placeholder for userId\n        ))\n        .limit(1);\n      \n      if (existing.length > 0) {\n        return { success: false, message: 'Usuário já é membro deste tenant' };\n      }\n      \n      // Add user to tenant\n      const [newTenantUser] = await db\n        .insert(tenantUsers)\n        .values({\n          tenantId,\n          userId: data.email, // Using email as placeholder\n          role: data.role,\n          permissions: data.permissions || [],\n          status: 'invited',\n          invitedBy: inviterUserId,\n          invitedAt: sql`now()`\n        })\n        .returning();\n      \n      console.log(`✅ Invited user ${data.email} to tenant ${tenantId}`);\n      return { \n        success: true, \n        message: 'Usuário convidado com sucesso',\n        tenantUser: newTenantUser\n      };\n      \n    } catch (error) {\n      console.error('❌ Error inviting user to tenant:', error);\n      return { success: false, message: 'Falha ao convidar usuário' };\n    }\n  }\n  \n  /**\n   * Remove user from tenant\n   */\n  static async removeUserFromTenant(\n    tenantId: string, \n    targetUserId: string, \n    requesterUserId: string\n  ): Promise<{ success: boolean; message: string }> {\n    try {\n      // Check if requester has permission (owner or admin)\n      const requesterAccess = await this.checkUserAccess(tenantId, requesterUserId, ['owner', 'admin']);\n      if (!requesterAccess) {\n        return { success: false, message: 'Permissão insuficiente para remover usuários' };\n      }\n      \n      // Can't remove the owner\n      const [targetUser] = await db\n        .select()\n        .from(tenantUsers)\n        .where(and(\n          eq(tenantUsers.tenantId, tenantId),\n          eq(tenantUsers.userId, targetUserId)\n        ))\n        .limit(1);\n      \n      if (!targetUser) {\n        return { success: false, message: 'Usuário não encontrado no tenant' };\n      }\n      \n      if (targetUser.role === 'owner') {\n        return { success: false, message: 'Não é possível remover o proprietário do tenant' };\n      }\n      \n      // Remove user from tenant\n      await db\n        .delete(tenantUsers)\n        .where(and(\n          eq(tenantUsers.tenantId, tenantId),\n          eq(tenantUsers.userId, targetUserId)\n        ));\n      \n      console.log(`✅ Removed user ${targetUserId} from tenant ${tenantId}`);\n      return { success: true, message: 'Usuário removido com sucesso' };\n      \n    } catch (error) {\n      console.error('❌ Error removing user from tenant:', error);\n      return { success: false, message: 'Falha ao remover usuário' };\n    }\n  }\n  \n  /**\n   * Update user role in tenant\n   */\n  static async updateUserRole(\n    tenantId: string, \n    targetUserId: string, \n    newRole: 'admin' | 'member' | 'viewer',\n    requesterUserId: string\n  ): Promise<{ success: boolean; message: string; tenantUser?: TenantUser }> {\n    try {\n      // Check if requester has permission (only owner can change roles)\n      const requesterAccess = await this.checkUserAccess(tenantId, requesterUserId, ['owner']);\n      if (!requesterAccess) {\n        return { success: false, message: 'Apenas o proprietário pode alterar funções' };\n      }\n      \n      // Can't change owner role\n      const [targetUser] = await db\n        .select()\n        .from(tenantUsers)\n        .where(and(\n          eq(tenantUsers.tenantId, tenantId),\n          eq(tenantUsers.userId, targetUserId)\n        ))\n        .limit(1);\n      \n      if (!targetUser) {\n        return { success: false, message: 'Usuário não encontrado no tenant' };\n      }\n      \n      if (targetUser.role === 'owner') {\n        return { success: false, message: 'Não é possível alterar a função do proprietário' };\n      }\n      \n      // Update user role\n      const [updatedTenantUser] = await db\n        .update(tenantUsers)\n        .set({ \n          role: newRole,\n          updatedAt: sql`now()`\n        })\n        .where(and(\n          eq(tenantUsers.tenantId, tenantId),\n          eq(tenantUsers.userId, targetUserId)\n        ))\n        .returning();\n      \n      console.log(`✅ Updated user ${targetUserId} role to ${newRole} in tenant ${tenantId}`);\n      return { \n        success: true, \n        message: 'Função atualizada com sucesso',\n        tenantUser: updatedTenantUser\n      };\n      \n    } catch (error) {\n      console.error('❌ Error updating user role:', error);\n      return { success: false, message: 'Falha ao atualizar função' };\n    }\n  }\n  \n  /**\n   * Check if user has access to tenant with specific roles\n   */\n  static async checkUserAccess(\n    tenantId: string, \n    userId: string, \n    requiredRoles?: string[]\n  ): Promise<{ tenant: Tenant; role: string } | null> {\n    try {\n      const [result] = await db\n        .select({\n          tenant: tenants,\n          role: tenantUsers.role,\n          status: tenantUsers.status\n        })\n        .from(tenants)\n        .innerJoin(tenantUsers, eq(tenants.id, tenantUsers.tenantId))\n        .where(and(\n          eq(tenants.id, tenantId),\n          eq(tenantUsers.userId, userId),\n          eq(tenantUsers.status, 'active')\n        ))\n        .limit(1);\n      \n      if (!result) {\n        return null;\n      }\n      \n      // Check role requirement\n      if (requiredRoles && !requiredRoles.includes(result.role)) {\n        return null;\n      }\n      \n      return {\n        tenant: result.tenant,\n        role: result.role\n      };\n      \n    } catch (error) {\n      console.error('❌ Error checking user access:', error);\n      return null;\n    }\n  }\n  \n  /**\n   * Get user's current tenant context\n   */\n  static async getUserCurrentTenant(userId: string): Promise<TenantWithUserRole | null> {\n    try {\n      // Get user's preferred tenant or first active tenant\n      const userTenants = await this.getTenantsByUser(userId);\n      \n      if (userTenants.length === 0) {\n        return null;\n      }\n      \n      // Return first tenant (could be enhanced to use user preferences)\n      return userTenants[0];\n      \n    } catch (error) {\n      console.error('❌ Error getting user current tenant:', error);\n      return null;\n    }\n  }\n  \n  /**\n   * Delete tenant (only by owner)\n   */\n  static async deleteTenant(tenantId: string, userId: string): Promise<{ success: boolean; message: string }> {\n    try {\n      // Check if user is the owner\n      const access = await this.checkUserAccess(tenantId, userId, ['owner']);\n      if (!access) {\n        return { success: false, message: 'Apenas o proprietário pode excluir o tenant' };\n      }\n      \n      // Delete tenant (cascade will handle tenant_users)\n      await db\n        .delete(tenants)\n        .where(eq(tenants.id, tenantId));\n      \n      console.log(`✅ Deleted tenant ${tenantId}`);\n      return { success: true, message: 'Tenant excluído com sucesso' };\n      \n    } catch (error) {\n      console.error('❌ Error deleting tenant:', error);\n      return { success: false, message: 'Falha ao excluir tenant' };\n    }\n  }\n}\n\nexport default TenantService;