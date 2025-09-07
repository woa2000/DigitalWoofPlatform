// Re-exportações de tipos do sistema de tenant
export type {
  Tenant,
  NewTenant,
  UpdateTenant,
  TenantUser,
  NewTenantUser,
  UpdateTenantUser,
  Profile,
  NewProfile,
  UpdateProfile,
  TenantWithUsers,
  UserWithTenants
} from '../schemas/tenant-system';

export {
  TENANT_ROLES,
  TENANT_STATUSES,
  USER_STATUSES,
  SUBSCRIPTION_PLANS,
  SUBSCRIPTION_STATUSES,
  permissionsSchema,
  preferencesSchema,
  inviteUserSchema,
  updateUserStatusSchema
} from '../schemas/tenant-system';

// Tipos utilitários para sistema de tenant
export type TenantRole = 'owner' | 'admin' | 'editor' | 'viewer';
export type TenantStatus = 'active' | 'inactive' | 'suspended';
export type UserStatus = 'active' | 'inactive' | 'pending' | 'suspended';
export type SubscriptionPlan = 'free' | 'pro' | 'enterprise';
export type SubscriptionStatus = 'active' | 'inactive' | 'trial' | 'expired';

export interface TenantPermissions {
  canManageUsers: boolean;
  canManageBilling: boolean;
  canManageSettings: boolean;
  canCreateCampaigns: boolean;
  canEditCampaigns: boolean;
  canDeleteCampaigns: boolean;
  canManageAssets: boolean;
  canGenerateContent: boolean;
  canViewAnalytics: boolean;
  canExportData: boolean;
}

export interface UserPreferences {
  theme: 'light' | 'dark' | 'auto';
  language: string;
  timezone: string;
  notifications: {
    email: boolean;
    push: boolean;
    campaigns: boolean;
    mentions: boolean;
  };
  dashboard: {
    layout: 'grid' | 'list';
    showTutorials: boolean;
    autoSave: boolean;
  };
}

export interface TenantSettings {
  theme?: {
    primaryColor?: string;
    secondaryColor?: string;
    logo?: string;
  };
  notifications?: {
    email: boolean;
    push: boolean;
  };
  features?: {
    aiContent: boolean;
    campaigns: boolean;
    assets: boolean;
    anamnesis: boolean;
  };
}

export interface BrandGuidelines {
  colors?: {
    primary?: string;
    secondary?: string;
    accent?: string;
  };
  fonts?: {
    primary?: string;
    secondary?: string;
  };
  logoGuidelines?: {
    primaryLogo?: string;
    variations?: string[];
    usage?: string;
  };
  voiceTone?: {
    description?: string;
    keywords?: string[];
    avoidWords?: string[];
  };
}

export interface BillingInfo {
  paymentMethod?: string;
  billingAddress?: {
    street?: string;
    city?: string;
    state?: string;
    zipCode?: string;
    country?: string;
  };
  taxId?: string;
  company?: string;
}