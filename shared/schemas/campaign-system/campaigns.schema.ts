import { pgTable, uuid, text, timestamp, jsonb, boolean, integer, decimal } from 'drizzle-orm/pg-core';
import { createInsertSchema, createSelectSchema } from 'drizzle-zod';
import { z } from 'zod';
import { tenantsTable } from '../tenant-system/tenants.schema';

/**
 * Schema da tabela campaigns - Campanhas Principais
 */
export const campaignsTable = pgTable('campaigns', {
  id: uuid('id').primaryKey().defaultRandom(),
  tenantId: uuid('tenant_id').notNull().references(() => tenantsTable.id, { onDelete: 'cascade' }),
  name: text('name').notNull(),
  description: text('description'),
  type: text('type').$type<'social_media' | 'email' | 'blog' | 'ads' | 'mixed'>().notNull(),
  status: text('status').$type<'draft' | 'scheduled' | 'active' | 'paused' | 'completed' | 'archived'>().default('draft'),
  objective: text('objective').$type<'awareness' | 'engagement' | 'conversion' | 'retention' | 'growth'>(),
  targetAudience: jsonb('target_audience').$type<Record<string, any>>(),
  budget: decimal('budget'),
  currency: text('currency').default('BRL'),
  startDate: timestamp('start_date', { withTimezone: true }),
  endDate: timestamp('end_date', { withTimezone: true }),
  platforms: jsonb('platforms').$type<string[]>().default([]),
  tags: jsonb('tags').$type<string[]>().default([]),
  metadata: jsonb('metadata').$type<Record<string, any>>(),
  settings: jsonb('settings').$type<Record<string, any>>(),
  createdBy: uuid('created_by').notNull(),
  createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
  updatedAt: timestamp('updated_at', { withTimezone: true }).defaultNow().notNull(),
  publishedAt: timestamp('published_at', { withTimezone: true }),
});

/**
 * Schema da tabela campaign_templates - Templates de Campanha
 */
export const campaignTemplatesTable = pgTable('campaign_templates', {
  id: uuid('id').primaryKey().defaultRandom(),
  name: text('name').notNull(),
  description: text('description'),
  category: text('category').$type<'seasonal' | 'promotional' | 'educational' | 'engagement' | 'launch'>().notNull(),
  type: text('type').$type<'social_media' | 'email' | 'blog' | 'ads' | 'mixed'>().notNull(),
  industry: text('industry'),
  templateData: jsonb('template_data').$type<Record<string, any>>().notNull(),
  contentStructure: jsonb('content_structure').$type<Record<string, any>>(),
  defaultSettings: jsonb('default_settings').$type<Record<string, any>>(),
  tags: jsonb('tags').$type<string[]>().default([]),
  isActive: boolean('is_active').default(true),
  usageCount: integer('usage_count').default(0),
  rating: decimal('rating'),
  createdBy: text('created_by').default('system'),
  createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
  updatedAt: timestamp('updated_at', { withTimezone: true }).defaultNow().notNull(),
});

/**
 * Schema da tabela user_campaigns - Campanhas dos Usuários (instâncias)
 */
export const userCampaignsTable = pgTable('user_campaigns', {
  id: uuid('id').primaryKey().defaultRandom(),
  tenantId: uuid('tenant_id').notNull().references(() => tenantsTable.id, { onDelete: 'cascade' }),
  userId: uuid('user_id').notNull(),
  campaignId: uuid('campaign_id').references(() => campaignsTable.id, { onDelete: 'cascade' }),
  templateId: uuid('template_id').references(() => campaignTemplatesTable.id),
  name: text('name').notNull(),
  customData: jsonb('custom_data').$type<Record<string, any>>(),
  progress: integer('progress').default(0),
  status: text('status').$type<'planning' | 'creating' | 'review' | 'scheduled' | 'active' | 'completed'>().default('planning'),
  generatedContent: jsonb('generated_content').$type<Record<string, any>>(),
  approvalStatus: text('approval_status').$type<'pending' | 'approved' | 'rejected' | 'needs_revision'>(),
  scheduledFor: timestamp('scheduled_for', { withTimezone: true }),
  executedAt: timestamp('executed_at', { withTimezone: true }),
  createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
  updatedAt: timestamp('updated_at', { withTimezone: true }).defaultNow().notNull(),
});

/**
 * Schema da tabela campaign_performance - Métricas de Performance
 */
export const campaignPerformanceTable = pgTable('campaign_performance', {
  id: uuid('id').primaryKey().defaultRandom(),
  campaignId: uuid('campaign_id').references(() => campaignsTable.id, { onDelete: 'cascade' }),
  userCampaignId: uuid('user_campaign_id').references(() => userCampaignsTable.id, { onDelete: 'cascade' }),
  platform: text('platform').notNull(),
  date: timestamp('date', { withTimezone: true }).notNull(),
  metrics: jsonb('metrics').$type<Record<string, number>>().notNull(),
  impressions: integer('impressions'),
  reach: integer('reach'),
  engagement: integer('engagement'),
  clicks: integer('clicks'),
  conversions: integer('conversions'),
  cost: decimal('cost'),
  revenue: decimal('revenue'),
  roi: decimal('roi'),
  ctr: decimal('ctr'), // Click-through rate
  cpc: decimal('cpc'), // Cost per click
  cpm: decimal('cpm'), // Cost per mille
  engagementRate: decimal('engagement_rate'),
  conversionRate: decimal('conversion_rate'),
  rawData: jsonb('raw_data').$type<Record<string, any>>(),
  createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
  updatedAt: timestamp('updated_at', { withTimezone: true }).defaultNow().notNull(),
});

// Schemas de validação Zod para campaigns
export const insertCampaignSchema = createInsertSchema(campaignsTable, {
  tenantId: z.string().uuid('ID do tenant deve ser um UUID válido'),
  name: z.string().min(1, 'Nome da campanha é obrigatório').max(200),
  description: z.string().max(1000).optional(),
  type: z.enum(['social_media', 'email', 'blog', 'ads', 'mixed']),
  status: z.enum(['draft', 'scheduled', 'active', 'paused', 'completed', 'archived']),
  objective: z.enum(['awareness', 'engagement', 'conversion', 'retention', 'growth']).optional(),
  budget: z.string().regex(/^\d+(\.\d{1,2})?$/).optional(),
  currency: z.string().length(3).optional(),
  createdBy: z.string().uuid('ID do criador deve ser um UUID válido'),
});

export const selectCampaignSchema = createSelectSchema(campaignsTable);
export const updateCampaignSchema = insertCampaignSchema.partial().omit({ id: true });

// Schemas de validação Zod para campaign_templates
export const insertCampaignTemplateSchema = createInsertSchema(campaignTemplatesTable, {
  name: z.string().min(1, 'Nome do template é obrigatório').max(200),
  description: z.string().max(1000).optional(),
  category: z.enum(['seasonal', 'promotional', 'educational', 'engagement', 'launch']),
  type: z.enum(['social_media', 'email', 'blog', 'ads', 'mixed']),
  industry: z.string().max(50).optional(),
  rating: z.string().regex(/^[1-5](\.\d)?$/).optional(),
});

export const selectCampaignTemplateSchema = createSelectSchema(campaignTemplatesTable);
export const updateCampaignTemplateSchema = insertCampaignTemplateSchema.partial().omit({ id: true });

// Schemas de validação Zod para user_campaigns
export const insertUserCampaignSchema = createInsertSchema(userCampaignsTable, {
  tenantId: z.string().uuid('ID do tenant deve ser um UUID válido'),
  userId: z.string().uuid('ID do usuário deve ser um UUID válido'),
  campaignId: z.string().uuid().optional(),
  templateId: z.string().uuid().optional(),
  name: z.string().min(1, 'Nome da campanha é obrigatório').max(200),
  progress: z.number().min(0).max(100),
  status: z.enum(['planning', 'creating', 'review', 'scheduled', 'active', 'completed']),
  approvalStatus: z.enum(['pending', 'approved', 'rejected', 'needs_revision']).optional(),
});

export const selectUserCampaignSchema = createSelectSchema(userCampaignsTable);
export const updateUserCampaignSchema = insertUserCampaignSchema.partial().omit({ id: true });

// Schemas de validação Zod para campaign_performance
export const insertCampaignPerformanceSchema = createInsertSchema(campaignPerformanceTable, {
  campaignId: z.string().uuid().optional(),
  userCampaignId: z.string().uuid().optional(),
  platform: z.string().min(1, 'Plataforma é obrigatória').max(50),
  date: z.date(),
  impressions: z.number().min(0).optional(),
  reach: z.number().min(0).optional(),
  engagement: z.number().min(0).optional(),
  clicks: z.number().min(0).optional(),
  conversions: z.number().min(0).optional(),
});

export const selectCampaignPerformanceSchema = createSelectSchema(campaignPerformanceTable);
export const updateCampaignPerformanceSchema = insertCampaignPerformanceSchema.partial().omit({ id: true });

// Tipos TypeScript
export type Campaign = typeof campaignsTable.$inferSelect;
export type NewCampaign = typeof campaignsTable.$inferInsert;
export type UpdateCampaign = Partial<Omit<NewCampaign, 'id' | 'createdAt' | 'updatedAt'>>;

export type CampaignTemplate = typeof campaignTemplatesTable.$inferSelect;
export type NewCampaignTemplate = typeof campaignTemplatesTable.$inferInsert;
export type UpdateCampaignTemplate = Partial<Omit<NewCampaignTemplate, 'id' | 'createdAt' | 'updatedAt'>>;

export type UserCampaign = typeof userCampaignsTable.$inferSelect;
export type NewUserCampaign = typeof userCampaignsTable.$inferInsert;
export type UpdateUserCampaign = Partial<Omit<NewUserCampaign, 'id' | 'createdAt' | 'updatedAt'>>;

export type CampaignPerformance = typeof campaignPerformanceTable.$inferSelect;
export type NewCampaignPerformance = typeof campaignPerformanceTable.$inferInsert;
export type UpdateCampaignPerformance = Partial<Omit<NewCampaignPerformance, 'id' | 'createdAt' | 'updatedAt'>>;

// Schemas específicos para validação de dados
export const targetAudienceSchema = z.object({
  demographics: z.object({
    ageRange: z.string().optional(),
    gender: z.enum(['male', 'female', 'all']).optional(),
    location: z.array(z.string()).optional(),
    interests: z.array(z.string()).optional(),
    behaviors: z.array(z.string()).optional(),
  }).optional(),
  psychographics: z.object({
    values: z.array(z.string()).optional(),
    lifestyle: z.array(z.string()).optional(),
    personality: z.array(z.string()).optional(),
  }).optional(),
  technographics: z.object({
    devices: z.array(z.string()).optional(),
    platforms: z.array(z.string()).optional(),
    usage: z.array(z.string()).optional(),
  }).optional(),
});

export const campaignSettingsSchema = z.object({
  autoPublish: z.boolean().default(false),
  requireApproval: z.boolean().default(true),
  allowComments: z.boolean().default(true),
  trackMetrics: z.boolean().default(true),
  notifications: z.object({
    email: z.boolean().default(true),
    inApp: z.boolean().default(true),
    milestones: z.boolean().default(true),
  }).optional(),
  content: z.object({
    autoGenerate: z.boolean().default(false),
    brandVoiceStrict: z.boolean().default(true),
    complianceCheck: z.boolean().default(true),
  }).optional(),
});

export const performanceMetricsSchema = z.object({
  impressions: z.number().min(0).optional(),
  reach: z.number().min(0).optional(),
  engagement: z.number().min(0).optional(),
  clicks: z.number().min(0).optional(),
  shares: z.number().min(0).optional(),
  saves: z.number().min(0).optional(),
  comments: z.number().min(0).optional(),
  likes: z.number().min(0).optional(),
  conversions: z.number().min(0).optional(),
  cost: z.number().min(0).optional(),
  revenue: z.number().min(0).optional(),
  custom: z.record(z.string(), z.number()).optional(),
});