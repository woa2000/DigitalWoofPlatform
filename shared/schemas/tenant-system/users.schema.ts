import { pgTable, uuid, text, timestamp, jsonb, boolean } from 'drizzle-orm/pg-core';
import { createInsertSchema, createSelectSchema } from 'drizzle-zod';
import { z } from 'zod';
import { tenantsTable } from './tenants.schema';

/**
 * Schema da tabela tenant_users - Usuários por Tenant
 */
export const tenantUsersTable = pgTable('tenant_users', {
  id: uuid('id').primaryKey().defaultRandom(),
  tenantId: uuid('tenant_id').notNull().references(() => tenantsTable.id, { onDelete: 'cascade' }),
  userId: uuid('user_id').notNull(),
  role: text('role').$type<'owner' | 'admin' | 'editor' | 'viewer'>().notNull().default('viewer'),
  permissions: jsonb('permissions').$type<Record<string, boolean>>(),
  status: text('status').$type<'active' | 'inactive' | 'pending' | 'suspended'>().notNull().default('pending'),
  invitedBy: uuid('invited_by'),
  invitedAt: timestamp('invited_at', { withTimezone: true }),
  joinedAt: timestamp('joined_at', { withTimezone: true }),
  createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
  updatedAt: timestamp('updated_at', { withTimezone: true }).defaultNow().notNull(),
});

/**
 * Schema da tabela profiles - Perfis de Usuário
 */
export const profilesTable = pgTable('profiles', {
  id: uuid('id').primaryKey(), // Referencia auth.users(id)
  fullName: text('full_name'),
  businessName: text('business_name'),
  businessType: text('business_type'),
  onboardingCompleted: boolean('onboarding_completed').default(false),
  avatar: text('avatar'),
  phone: text('phone'),
  position: text('position'),
  bio: text('bio'),
  preferences: jsonb('preferences').$type<Record<string, any>>(),
  createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
  updatedAt: timestamp('updated_at', { withTimezone: true }).defaultNow().notNull(),
});

// Schemas de validação Zod para tenant_users
export const insertTenantUserSchema = createInsertSchema(tenantUsersTable, {
  tenantId: z.string().uuid('ID do tenant deve ser um UUID válido'),
  userId: z.string().uuid('ID do usuário deve ser um UUID válido'),
  role: z.enum(['owner', 'admin', 'editor', 'viewer']),
  status: z.enum(['active', 'inactive', 'pending', 'suspended']),
  invitedBy: z.string().uuid().optional(),
});

export const selectTenantUserSchema = createSelectSchema(tenantUsersTable);
export const updateTenantUserSchema = insertTenantUserSchema.partial().omit({ id: true });

// Schemas de validação Zod para profiles
export const insertProfileSchema = createInsertSchema(profilesTable, {
  id: z.string().uuid('ID deve ser um UUID válido'),
  fullName: z.string().min(1, 'Nome é obrigatório').max(100).optional(),
  businessName: z.string().max(100).optional(),
  businessType: z.string().max(50).optional(),
  avatar: z.string().url().optional(),
  phone: z.string().regex(/^\+?[\d\s\-\(\)]+$/).optional(),
  position: z.string().max(100).optional(),
  bio: z.string().max(500).optional(),
});

export const selectProfileSchema = createSelectSchema(profilesTable);
export const updateProfileSchema = insertProfileSchema.partial().omit({ id: true });

// Tipos TypeScript
export type TenantUser = typeof tenantUsersTable.$inferSelect;
export type NewTenantUser = typeof tenantUsersTable.$inferInsert;
export type UpdateTenantUser = Partial<Omit<NewTenantUser, 'id' | 'createdAt' | 'updatedAt'>>;

export type Profile = typeof profilesTable.$inferSelect;
export type NewProfile = typeof profilesTable.$inferInsert;
export type UpdateProfile = Partial<Omit<NewProfile, 'id' | 'createdAt' | 'updatedAt'>>;

// Schemas específicos para validação de permissões
export const permissionsSchema = z.object({
  canManageUsers: z.boolean().default(false),
  canManageBilling: z.boolean().default(false),
  canManageSettings: z.boolean().default(false),
  canCreateCampaigns: z.boolean().default(true),
  canEditCampaigns: z.boolean().default(true),
  canDeleteCampaigns: z.boolean().default(false),
  canManageAssets: z.boolean().default(true),
  canGenerateContent: z.boolean().default(true),
  canViewAnalytics: z.boolean().default(true),
  canExportData: z.boolean().default(false),
});

export const preferencesSchema = z.object({
  theme: z.enum(['light', 'dark', 'auto']).default('light'),
  language: z.string().default('pt-BR'),
  timezone: z.string().default('America/Sao_Paulo'),
  notifications: z.object({
    email: z.boolean().default(true),
    push: z.boolean().default(true),
    campaigns: z.boolean().default(true),
    mentions: z.boolean().default(true),
  }),
  dashboard: z.object({
    layout: z.enum(['grid', 'list']).default('grid'),
    showTutorials: z.boolean().default(true),
    autoSave: z.boolean().default(true),
  }),
});

// Schemas para convites
export const inviteUserSchema = z.object({
  email: z.string().email('Email deve ser válido'),
  role: z.enum(['admin', 'editor', 'viewer']),
  permissions: permissionsSchema.optional(),
  message: z.string().max(500).optional(),
});

// Schemas para atualização de status
export const updateUserStatusSchema = z.object({
  status: z.enum(['active', 'inactive', 'suspended']),
  reason: z.string().max(200).optional(),
});