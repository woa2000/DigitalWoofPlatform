// Re-exportações centralizadas do sistema de tenants
export * from './tenants.schema';
export * from './users.schema';

// Tipos combinados úteis
export type TenantWithUsers = {
  tenant: typeof import('./tenants.schema').tenantsTable.$inferSelect;
  users: Array<typeof import('./users.schema').tenantUsersTable.$inferSelect & {
    profile?: typeof import('./users.schema').profilesTable.$inferSelect;
  }>;
};

export type UserWithTenants = {
  profile: typeof import('./users.schema').profilesTable.$inferSelect;
  tenants: Array<{
    tenant: typeof import('./tenants.schema').tenantsTable.$inferSelect;
    role: string;
    status: string;
    permissions?: Record<string, boolean>;
  }>;
};

// Constantes úteis
export const TENANT_ROLES = ['owner', 'admin', 'editor', 'viewer'] as const;
export const TENANT_STATUSES = ['active', 'inactive', 'suspended'] as const;
export const USER_STATUSES = ['active', 'inactive', 'pending', 'suspended'] as const;
export const SUBSCRIPTION_PLANS = ['free', 'pro', 'enterprise'] as const;
export const SUBSCRIPTION_STATUSES = ['active', 'inactive', 'trial', 'expired'] as const;