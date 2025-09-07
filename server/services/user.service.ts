import { supabase } from '../lib/supabase';
import { db } from '../db';
import { profiles, tenantUsers } from '../../shared/schema';
import { eq, and } from 'drizzle-orm';
import { generateSecurePassword } from '../utils/password.js';

export interface CreateUserData {
  email: string;
  fullName: string;
  role: 'admin' | 'member' | 'viewer';
  permissions?: string[];
}

export interface TenantUserWithProfile {
  id: string;
  userId: string;
  email: string;
  fullName: string;
  role: string;
  status: string;
  joinedAt: string;
  avatarUrl?: string;
  permissions: string[];
}

export interface CreateUserResult {
  user: TenantUserWithProfile;
  temporaryPassword: string;
}

export class UserService {
  /**
   * Create new user in tenant
   */
  static async createUser(tenantId: string, userData: CreateUserData, createdByUserId: string): Promise<CreateUserResult> {
    try {
      console.log(`📝 Creating user for tenant: ${tenantId}`);

      // Generate secure temporary password
      const temporaryPassword = generateSecurePassword();

      // Create user in Supabase Auth
      const { data: authUser, error: authError } = await supabase.auth.admin.createUser({
        email: userData.email,
        password: temporaryPassword,
        email_confirm: true, // Skip email confirmation
        user_metadata: {
          full_name: userData.fullName,
          tenant_id: tenantId,
          created_by: createdByUserId
        }
      });

      if (authError) {
        console.error('❌ Error creating user in Supabase Auth:', authError);
        throw new Error(`Falha ao criar usuário: ${authError.message}`);
      }

      if (!authUser.user) {
        throw new Error('Usuário não foi criado no Supabase Auth');
      }

      console.log(`✅ User created in Supabase Auth: ${authUser.user.id}`);

      // Get database instance
      const dbInstance = await db;

      // Create profile
      const [newProfile] = await (dbInstance as any)
        .insert(profiles)
        .values({
          id: authUser.user.id,
          tenantId,
          fullName: userData.fullName,
          onboardingCompleted: false
        })
        .returning();

      console.log(`✅ Profile created: ${newProfile.id}`);

      // Add to tenant_users
      const [tenantUser] = await (dbInstance as any)
        .insert(tenantUsers)
        .values({
          tenantId,
          userId: authUser.user.id,
          role: userData.role,
          permissions: userData.permissions || [],
          status: 'active',
          invitedBy: createdByUserId,
          invitedAt: new Date(),
          joinedAt: new Date()
        })
        .returning();

      console.log(`✅ Added to tenant_users: ${tenantUser.id}`);

      const userResult: TenantUserWithProfile = {
        id: tenantUser.id,
        userId: authUser.user.id,
        email: authUser.user.email!,
        fullName: userData.fullName,
        role: userData.role,
        status: 'active',
        joinedAt: tenantUser.joinedAt,
        permissions: userData.permissions || []
      };

      return {
        user: userResult,
        temporaryPassword
      };

    } catch (error) {
      console.error('❌ Error in createUser:', error);
      throw error;
    }
  }

  /**
   * List all users in a tenant
   */
  static async listTenantUsers(tenantId: string): Promise<TenantUserWithProfile[]> {
    try {
      console.log(`📋 Listing users for tenant: ${tenantId}`);

      const dbInstance = await db;

      // Get tenant users with profiles
      const tenantUsersData = await (dbInstance as any)
        .select({
          id: tenantUsers.id,
          userId: tenantUsers.userId,
          role: tenantUsers.role,
          permissions: tenantUsers.permissions,
          status: tenantUsers.status,
          joinedAt: tenantUsers.joinedAt,
          fullName: profiles.fullName,
          avatarUrl: profiles.avatarUrl
        })
        .from(tenantUsers)
        .leftJoin(profiles, eq(tenantUsers.userId, profiles.id))
        .where(eq(tenantUsers.tenantId, tenantId));

      // Get auth users data from Supabase
      const userIds = tenantUsersData.map((u: any) => u.userId);
      const authUsers = new Map();

      for (const userId of userIds) {
        try {
          const { data: authUser, error } = await supabase.auth.admin.getUserById(userId);
          if (!error && authUser.user) {
            authUsers.set(userId, authUser.user);
          }
        } catch (error) {
          console.warn(`Failed to fetch auth user ${userId}:`, error);
        }
      }

      // Combine data
      const users: TenantUserWithProfile[] = tenantUsersData.map((userData: any) => {
        const authUser = authUsers.get(userData.userId);
        return {
          id: userData.id,
          userId: userData.userId,
          email: authUser?.email || 'Email não disponível',
          fullName: userData.fullName || authUser?.user_metadata?.full_name || 'Nome não disponível',
          role: userData.role,
          status: userData.status,
          joinedAt: userData.joinedAt,
          avatarUrl: userData.avatarUrl,
          permissions: userData.permissions || []
        };
      });

      console.log(`✅ Found ${users.length} users for tenant ${tenantId}`);
      return users;

    } catch (error) {
      console.error('❌ Error listing tenant users:', error);
      throw new Error('Falha ao listar usuários do tenant');
    }
  }

  /**
   * Update user role and permissions
   */
  static async updateUserRole(tenantId: string, userId: string, role: string, permissions?: string[]): Promise<void> {
    try {
      console.log(`🔄 Updating user ${userId} role to ${role}`);

      const dbInstance = await db;

      await (dbInstance as any)
        .update(tenantUsers)
        .set({
          role,
          permissions: permissions || [],
          updatedAt: new Date()
        })
        .where(
          and(
            eq(tenantUsers.tenantId, tenantId),
            eq(tenantUsers.userId, userId)
          )
        );

      console.log(`✅ User role updated successfully`);

    } catch (error) {
      console.error('❌ Error updating user role:', error);
      throw new Error('Falha ao atualizar role do usuário');
    }
  }

  /**
   * Remove user from tenant
   */
  static async removeUser(tenantId: string, userId: string): Promise<void> {
    try {
      console.log(`🗑️ Removing user ${userId} from tenant ${tenantId}`);

      const dbInstance = await db;

      // Remove from tenant_users (this will not delete the auth user or profile)
      await (dbInstance as any)
        .delete(tenantUsers)
        .where(
          and(
            eq(tenantUsers.tenantId, tenantId),
            eq(tenantUsers.userId, userId)
          )
        );

      console.log(`✅ User removed from tenant successfully`);

    } catch (error) {
      console.error('❌ Error removing user:', error);
      throw new Error('Falha ao remover usuário do tenant');
    }
  }

  /**
   * Check if user has permission to manage users in tenant
   */
  static async canManageUsers(tenantId: string, userId: string): Promise<boolean> {
    try {
      const dbInstance = await db;

      const [userRole] = await (dbInstance as any)
        .select({ role: tenantUsers.role })
        .from(tenantUsers)
        .where(
          and(
            eq(tenantUsers.tenantId, tenantId),
            eq(tenantUsers.userId, userId)
          )
        )
        .limit(1);

      return userRole && ['owner', 'admin'].includes(userRole.role);

    } catch (error) {
      console.error('❌ Error checking user permissions:', error);
      return false;
    }
  }
}