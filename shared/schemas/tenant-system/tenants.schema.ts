import { pgTable, uuid, text, timestamp, jsonb } from 'drizzle-orm/pg-core';
import { createInsertSchema, createSelectSchema } from 'drizzle-zod';
import { z } from 'zod';

/**
 * Schema da tabela tenants - Sistema Multi-tenant
 */
export const tenantsTable = pgTable('tenants', {
  id: uuid('id').primaryKey().defaultRandom(),
  name: text('name').notNull(),
  slug: text('slug').notNull().unique(),
  domain: text('domain'),
  businessType: text('business_type'),
  subscriptionPlan: text('subscription_plan').$type<'free' | 'pro' | 'enterprise'>(),
  subscriptionStatus: text('subscription_status').$type<'active' | 'inactive' | 'trial' | 'expired'>(),
  subscriptionEndDate: timestamp('subscription_end_date', { withTimezone: true }),
  settings: jsonb('settings').$type<Record<string, any>>(),
  brandGuidelines: jsonb('brand_guidelines').$type<Record<string, any>>(),
  billingInfo: jsonb('billing_info').$type<Record<string, any>>(),
  ownerId: uuid('owner_id').notNull(),
  status: text('status').$type<'active' | 'inactive' | 'suspended'>().default('active'),
  createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
  updatedAt: timestamp('updated_at', { withTimezone: true }).defaultNow().notNull(),
});

// Schemas de validação Zod
export const insertTenantSchema = createInsertSchema(tenantsTable, {
  name: z.string().min(1, 'Nome é obrigatório').max(100),
  slug: z.string().min(1, 'Slug é obrigatório').max(50).regex(/^[a-z0-9-]+$/),
  domain: z.string().url().optional(),
  businessType: z.string().max(50).optional(),
  subscriptionPlan: z.enum(['free', 'pro', 'enterprise']).optional(),
  subscriptionStatus: z.enum(['active', 'inactive', 'trial', 'expired']).optional(),
  ownerId: z.string().uuid('ID do proprietário deve ser um UUID válido'),
  status: z.enum(['active', 'inactive', 'suspended']).optional(),
});

export const selectTenantSchema = createSelectSchema(tenantsTable);
export const updateTenantSchema = insertTenantSchema.partial().omit({ id: true });

// Tipos TypeScript
export type Tenant = typeof tenantsTable.$inferSelect;
export type NewTenant = typeof tenantsTable.$inferInsert;
export type UpdateTenant = Partial<Omit<NewTenant, 'id' | 'createdAt' | 'updatedAt'>>;

// Schemas específicos para validação
export const tenantSettingsSchema = z.object({
  theme: z.object({
    primaryColor: z.string().optional(),
    secondaryColor: z.string().optional(),
    logo: z.string().url().optional(),
  }).optional(),
  notifications: z.object({
    email: z.boolean().default(true),
    push: z.boolean().default(true),
  }).optional(),
  features: z.object({
    aiContent: z.boolean().default(true),
    campaigns: z.boolean().default(true),
    assets: z.boolean().default(true),
    anamnesis: z.boolean().default(true),
  }).optional(),
});

export const brandGuidelinesSchema = z.object({
  colors: z.object({
    primary: z.string().optional(),
    secondary: z.string().optional(),
    accent: z.string().optional(),
  }).optional(),
  fonts: z.object({
    primary: z.string().optional(),
    secondary: z.string().optional(),
  }).optional(),
  logoGuidelines: z.object({
    primaryLogo: z.string().url().optional(),
    variations: z.array(z.string().url()).optional(),
    usage: z.string().optional(),
  }).optional(),
  voiceTone: z.object({
    description: z.string().optional(),
    keywords: z.array(z.string()).optional(),
    avoidWords: z.array(z.string()).optional(),
  }).optional(),
});

export const billingInfoSchema = z.object({
  paymentMethod: z.string().optional(),
  billingAddress: z.object({
    street: z.string().optional(),
    city: z.string().optional(),
    state: z.string().optional(),
    zipCode: z.string().optional(),
    country: z.string().optional(),
  }).optional(),
  taxId: z.string().optional(),
  company: z.string().optional(),
});