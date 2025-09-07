import { pgTable, uuid, text, timestamp, jsonb, boolean, integer, decimal } from 'drizzle-orm/pg-core';
import { createInsertSchema, createSelectSchema } from 'drizzle-zod';
import { z } from 'zod';
import { tenantsTable } from '../tenant-system/tenants.schema';

/**
 * Schema da tabela anamnesis_analysis - Análise Principal de Anamnese
 */
export const anamnesisAnalysisTable = pgTable('anamnesis_analysis', {
  id: uuid('id').primaryKey().defaultRandom(),
  tenantId: uuid('tenant_id').notNull().references(() => tenantsTable.id, { onDelete: 'cascade' }),
  userId: uuid('user_id').notNull(),
  analysisType: text('analysis_type').$type<'website' | 'social_media' | 'competitor' | 'brand' | 'market' | 'audience'>().notNull(),
  targetUrl: text('target_url'),
  targetName: text('target_name').notNull(),
  description: text('description'),
  status: text('status').$type<'pending' | 'analyzing' | 'completed' | 'failed' | 'archived'>().default('pending'),
  progress: integer('progress').default(0),
  analysisData: jsonb('analysis_data').$type<Record<string, any>>(),
  insights: jsonb('insights').$type<Array<{ category: string; insight: string; confidence: number; impact: string }>>(),
  recommendations: jsonb('recommendations').$type<Array<{ type: string; action: string; priority: string; reasoning: string }>>(),
  metadata: jsonb('metadata').$type<Record<string, any>>(),
  aiModel: text('ai_model').default('gpt-4'),
  analysisVersion: text('analysis_version').default('1.0'),
  confidenceScore: decimal('confidence_score'),
  qualityScore: decimal('quality_score'),
  startedAt: timestamp('started_at', { withTimezone: true }),
  completedAt: timestamp('completed_at', { withTimezone: true }),
  createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
  updatedAt: timestamp('updated_at', { withTimezone: true }).defaultNow().notNull(),
});

/**
 * Schema da tabela anamnesis_source - URLs e Fontes Analisadas
 */
export const anamnesisSourceTable = pgTable('anamnesis_source', {
  id: uuid('id').primaryKey().defaultRandom(),
  analysisId: uuid('analysis_id').notNull().references(() => anamnesisAnalysisTable.id, { onDelete: 'cascade' }),
  sourceType: text('source_type').$type<'webpage' | 'social_post' | 'image' | 'video' | 'document' | 'api'>().notNull(),
  sourceUrl: text('source_url').notNull(),
  sourceName: text('source_name'),
  platform: text('platform'),
  status: text('status').$type<'pending' | 'processing' | 'completed' | 'failed' | 'skipped'>().default('pending'),
  crawledAt: timestamp('crawled_at', { withTimezone: true }),
  contentData: jsonb('content_data').$type<Record<string, any>>(),
  extractedText: text('extracted_text'),
  metadata: jsonb('metadata').$type<Record<string, any>>(),
  errorMessage: text('error_message'),
  processingTime: integer('processing_time'), // em milissegundos
  retryCount: integer('retry_count').default(0),
  createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
  updatedAt: timestamp('updated_at', { withTimezone: true }).defaultNow().notNull(),
});

/**
 * Schema da tabela anamnesis_finding - Resultados por Seção de Análise
 */
export const anamnesiseFindingTable = pgTable('anamnesis_finding', {
  id: uuid('id').primaryKey().defaultRandom(),
  analysisId: uuid('analysis_id').notNull().references(() => anamnesisAnalysisTable.id, { onDelete: 'cascade' }),
  sourceId: uuid('source_id').references(() => anamnesisSourceTable.id, { onDelete: 'cascade' }),
  category: text('category').$type<'brand_voice' | 'visual_identity' | 'content_strategy' | 'audience' | 'competitors' | 'market_trends' | 'opportunities' | 'threats'>().notNull(),
  subcategory: text('subcategory'),
  finding: text('finding').notNull(),
  evidence: text('evidence'),
  confidence: decimal('confidence'), // 0-1
  impact: text('impact').$type<'low' | 'medium' | 'high' | 'critical'>().default('medium'),
  sentiment: text('sentiment').$type<'positive' | 'negative' | 'neutral'>(),
  tags: jsonb('tags').$type<string[]>().default([]),
  relatedFindings: jsonb('related_findings').$type<string[]>(),
  actionable: boolean('actionable').default(false),
  priority: integer('priority').default(5), // 1-10
  metadata: jsonb('metadata').$type<Record<string, any>>(),
  createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
  updatedAt: timestamp('updated_at', { withTimezone: true }).defaultNow().notNull(),
});

/**
 * Schema da tabela business_anamnesis - Anamnese Específica do Negócio
 */
export const businessAnamnesisTable = pgTable('business_anamnesis', {
  id: uuid('id').primaryKey().defaultRandom(),
  tenantId: uuid('tenant_id').notNull().references(() => tenantsTable.id, { onDelete: 'cascade' }),
  userId: uuid('user_id').notNull(),
  businessType: text('business_type'),
  industry: text('industry'),
  businessStage: text('business_stage').$type<'startup' | 'growth' | 'established' | 'enterprise' | 'franchise'>(),
  targetMarket: text('target_market'),
  geographicFocus: jsonb('geographic_focus').$type<string[]>(),
  businessModel: text('business_model').$type<'b2c' | 'b2b' | 'b2b2c' | 'marketplace' | 'saas' | 'ecommerce' | 'service' | 'product'>(),
  revenueModel: jsonb('revenue_model').$type<string[]>(),
  currentChallenges: jsonb('current_challenges').$type<string[]>(),
  marketingGoals: jsonb('marketing_goals').$type<Array<{ goal: string; priority: number; timeframe: string }>>(),
  competitiveAdvantages: jsonb('competitive_advantages').$type<string[]>(),
  brandPositioning: text('brand_positioning'),
  valueProposition: text('value_proposition'),
  customerPersonas: jsonb('customer_personas').$type<Array<Record<string, any>>>(),
  currentMarketingChannels: jsonb('current_marketing_channels').$type<string[]>(),
  marketingBudget: decimal('marketing_budget'),
  budgetCurrency: text('budget_currency').default('BRL'),
  seasonality: jsonb('seasonality').$type<Array<{ month: string; factor: number; notes: string }>>(),
  brandGuidelines: jsonb('brand_guidelines').$type<Record<string, any>>(),
  contentPreferences: jsonb('content_preferences').$type<Record<string, any>>(),
  complianceRequirements: jsonb('compliance_requirements').$type<string[]>(),
  isCompleted: boolean('is_completed').default(false),
  completionPercentage: integer('completion_percentage').default(0),
  lastUpdatedSection: text('last_updated_section'),
  createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
  updatedAt: timestamp('updated_at', { withTimezone: true }).defaultNow().notNull(),
  completedAt: timestamp('completed_at', { withTimezone: true }),
});

// Schemas de validação Zod para anamnesis_analysis
export const insertAnamnesisAnalysisSchema = createInsertSchema(anamnesisAnalysisTable, {
  tenantId: z.string().uuid('ID do tenant deve ser um UUID válido'),
  userId: z.string().uuid('ID do usuário deve ser um UUID válido'),
  analysisType: z.enum(['website', 'social_media', 'competitor', 'brand', 'market', 'audience']),
  targetUrl: z.string().url().optional(),
  targetName: z.string().min(1, 'Nome do alvo é obrigatório').max(200),
  description: z.string().max(1000).optional(),
  status: z.enum(['pending', 'analyzing', 'completed', 'failed', 'archived']),
  progress: z.number().min(0).max(100),
  aiModel: z.string().default('gpt-4'),
  analysisVersion: z.string().default('1.0'),
  confidenceScore: z.string().regex(/^[0-1](\.\d+)?$/).optional(),
  qualityScore: z.string().regex(/^[0-1](\.\d+)?$/).optional(),
});

export const selectAnamnesisAnalysisSchema = createSelectSchema(anamnesisAnalysisTable);
export const updateAnamnesisAnalysisSchema = insertAnamnesisAnalysisSchema.partial().omit({ id: true });

// Schemas de validação Zod para anamnesis_source
export const insertAnamnesisSourceSchema = createInsertSchema(anamnesisSourceTable, {
  analysisId: z.string().uuid('ID da análise deve ser um UUID válido'),
  sourceType: z.enum(['webpage', 'social_post', 'image', 'video', 'document', 'api']),
  sourceUrl: z.string().url('URL da fonte deve ser válida'),
  sourceName: z.string().max(200).optional(),
  platform: z.string().max(50).optional(),
  status: z.enum(['pending', 'processing', 'completed', 'failed', 'skipped']),
  extractedText: z.string().optional(),
  errorMessage: z.string().max(500).optional(),
  processingTime: z.number().min(0).optional(),
  retryCount: z.number().min(0).max(10),
});

export const selectAnamnesisSourceSchema = createSelectSchema(anamnesisSourceTable);
export const updateAnamnesisSourceSchema = insertAnamnesisSourceSchema.partial().omit({ id: true });

// Schemas de validação Zod para anamnesis_finding
export const insertAnamnesiseFindingSchema = createInsertSchema(anamnesiseFindingTable, {
  analysisId: z.string().uuid('ID da análise deve ser um UUID válido'),
  sourceId: z.string().uuid().optional(),
  category: z.enum(['brand_voice', 'visual_identity', 'content_strategy', 'audience', 'competitors', 'market_trends', 'opportunities', 'threats']),
  subcategory: z.string().max(100).optional(),
  finding: z.string().min(10, 'Resultado deve ter pelo menos 10 caracteres'),
  evidence: z.string().optional(),
  confidence: z.string().regex(/^[0-1](\.\d+)?$/, 'Confiança deve ser entre 0 e 1').optional(),
  impact: z.enum(['low', 'medium', 'high', 'critical']),
  sentiment: z.enum(['positive', 'negative', 'neutral']).optional(),
  priority: z.number().min(1).max(10),
});

export const selectAnamnesiseFindingSchema = createSelectSchema(anamnesiseFindingTable);
export const updateAnamnesiseFindingSchema = insertAnamnesiseFindingSchema.partial().omit({ id: true });

// Schemas de validação Zod para business_anamnesis
export const insertBusinessAnamnesisSchema = createInsertSchema(businessAnamnesisTable, {
  tenantId: z.string().uuid('ID do tenant deve ser um UUID válido'),
  userId: z.string().uuid('ID do usuário deve ser um UUID válido'),
  businessType: z.string().max(100).optional(),
  industry: z.string().max(100).optional(),
  businessStage: z.enum(['startup', 'growth', 'established', 'enterprise', 'franchise']).optional(),
  targetMarket: z.string().max(500).optional(),
  businessModel: z.enum(['b2c', 'b2b', 'b2b2c', 'marketplace', 'saas', 'ecommerce', 'service', 'product']).optional(),
  brandPositioning: z.string().max(1000).optional(),
  valueProposition: z.string().max(1000).optional(),
  marketingBudget: z.string().regex(/^\d+(\.\d{1,2})?$/).optional(),
  budgetCurrency: z.string().length(3).default('BRL'),
  completionPercentage: z.number().min(0).max(100),
  lastUpdatedSection: z.string().max(100).optional(),
});

export const selectBusinessAnamnesisSchema = createSelectSchema(businessAnamnesisTable);
export const updateBusinessAnamnesisSchema = insertBusinessAnamnesisSchema.partial().omit({ id: true });

// Tipos TypeScript
export type AnamnesisAnalysis = typeof anamnesisAnalysisTable.$inferSelect;
export type NewAnamnesisAnalysis = typeof anamnesisAnalysisTable.$inferInsert;
export type UpdateAnamnesisAnalysis = Partial<Omit<NewAnamnesisAnalysis, 'id' | 'createdAt' | 'updatedAt'>>;

export type AnamnesisSource = typeof anamnesisSourceTable.$inferSelect;
export type NewAnamnesisSource = typeof anamnesisSourceTable.$inferInsert;
export type UpdateAnamnesisSource = Partial<Omit<NewAnamnesisSource, 'id' | 'createdAt' | 'updatedAt'>>;

export type AnamnesiseFinding = typeof anamnesiseFindingTable.$inferSelect;
export type NewAnamnesiseFinding = typeof anamnesiseFindingTable.$inferInsert;
export type UpdateAnamnesiseFinding = Partial<Omit<NewAnamnesiseFinding, 'id' | 'createdAt' | 'updatedAt'>>;

export type BusinessAnamnesis = typeof businessAnamnesisTable.$inferSelect;
export type NewBusinessAnamnesis = typeof businessAnamnesisTable.$inferInsert;
export type UpdateBusinessAnamnesis = Partial<Omit<NewBusinessAnamnesis, 'id' | 'createdAt' | 'updatedAt'>>;

// Schemas específicos para validação de dados complexos
export const insightSchema = z.object({
  category: z.string(),
  insight: z.string(),
  confidence: z.number().min(0).max(1),
  impact: z.enum(['low', 'medium', 'high', 'critical']),
  evidence: z.array(z.string()).optional(),
  source: z.string().optional(),
});

export const recommendationSchema = z.object({
  type: z.enum(['content', 'strategy', 'design', 'platform', 'timing', 'budget', 'audience']),
  action: z.string(),
  priority: z.enum(['low', 'medium', 'high', 'urgent']),
  reasoning: z.string(),
  estimatedImpact: z.enum(['low', 'medium', 'high']).optional(),
  resources: z.array(z.string()).optional(),
  timeframe: z.string().optional(),
  cost: z.object({
    min: z.number().optional(),
    max: z.number().optional(),
    currency: z.string().optional(),
  }).optional(),
});

export const customerPersonaSchema = z.object({
  name: z.string(),
  age: z.object({
    min: z.number(),
    max: z.number(),
  }),
  gender: z.enum(['male', 'female', 'all']),
  location: z.array(z.string()),
  income: z.object({
    min: z.number().optional(),
    max: z.number().optional(),
    currency: z.string().default('BRL'),
  }).optional(),
  education: z.enum(['basic', 'secondary', 'higher', 'postgraduate']).optional(),
  occupation: z.string().optional(),
  interests: z.array(z.string()),
  painPoints: z.array(z.string()),
  behaviors: z.object({
    onlineTime: z.string().optional(),
    socialMedia: z.array(z.string()),
    shoppingHabits: z.array(z.string()),
    informationSources: z.array(z.string()),
  }),
  goals: z.array(z.string()),
  frustrations: z.array(z.string()),
  preferredChannels: z.array(z.string()),
  buyingProcess: z.object({
    awareness: z.array(z.string()),
    consideration: z.array(z.string()),
    decision: z.array(z.string()),
  }).optional(),
});

export const marketingGoalSchema = z.object({
  goal: z.string(),
  priority: z.number().min(1).max(10),
  timeframe: z.enum(['short', 'medium', 'long']),
  metrics: z.array(z.string()).optional(),
  target: z.object({
    value: z.number(),
    unit: z.string(),
  }).optional(),
  budget: z.object({
    allocated: z.number().optional(),
    currency: z.string().default('BRL'),
  }).optional(),
});

export const seasonalitySchema = z.object({
  month: z.string(),
  factor: z.number().min(0).max(5), // multiplicador sazonal
  notes: z.string().optional(),
  events: z.array(z.string()).optional(),
  trends: z.array(z.string()).optional(),
});

export const contentDataSchema = z.object({
  title: z.string().optional(),
  description: z.string().optional(),
  keywords: z.array(z.string()).optional(),
  images: z.array(z.object({
    url: z.string().url(),
    alt: z.string().optional(),
    caption: z.string().optional(),
  })).optional(),
  videos: z.array(z.object({
    url: z.string().url(),
    title: z.string().optional(),
    duration: z.number().optional(),
  })).optional(),
  socialMetrics: z.object({
    likes: z.number().optional(),
    shares: z.number().optional(),
    comments: z.number().optional(),
    views: z.number().optional(),
    engagement: z.number().optional(),
  }).optional(),
  textAnalysis: z.object({
    wordCount: z.number().optional(),
    readabilityScore: z.number().optional(),
    sentiment: z.enum(['positive', 'negative', 'neutral']).optional(),
    topics: z.array(z.string()).optional(),
    entities: z.array(z.string()).optional(),
  }).optional(),
});

export const analysisDataSchema = z.object({
  summary: z.string().optional(),
  keyFindings: z.array(z.string()),
  strengths: z.array(z.string()),
  weaknesses: z.array(z.string()),
  opportunities: z.array(z.string()),
  threats: z.array(z.string()),
  brandVoice: z.object({
    tone: z.array(z.string()),
    style: z.array(z.string()),
    personality: z.array(z.string()),
    consistency: z.number().min(0).max(1),
  }).optional(),
  visualIdentity: z.object({
    colors: z.array(z.string()),
    fonts: z.array(z.string()),
    style: z.string(),
    consistency: z.number().min(0).max(1),
  }).optional(),
  contentStrategy: z.object({
    themes: z.array(z.string()),
    formats: z.array(z.string()),
    frequency: z.string(),
    engagement: z.number().min(0).max(1),
  }).optional(),
  competitorAnalysis: z.object({
    direct: z.array(z.object({
      name: z.string(),
      strengths: z.array(z.string()),
      weaknesses: z.array(z.string()),
      opportunities: z.array(z.string()),
    })),
    indirect: z.array(z.string()),
    positioning: z.string(),
  }).optional(),
});