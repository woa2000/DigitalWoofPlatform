import { pgTable, uuid, text, timestamp, jsonb, boolean, integer, decimal } from 'drizzle-orm/pg-core';
import { createInsertSchema, createSelectSchema } from 'drizzle-zod';
import { z } from 'zod';
import { tenantsTable } from '../tenant-system/tenants.schema';

/**
 * Schema da tabela ai_prompts - Templates de Prompts para IA
 */
export const aiPromptsTable = pgTable('ai_prompts', {
  id: uuid('id').primaryKey().defaultRandom(),
  name: text('name').notNull(),
  description: text('description'),
  category: text('category').$type<'content_generation' | 'brand_voice' | 'campaign_ideas' | 'hashtags' | 'captions' | 'blog_posts'>().notNull(),
  promptTemplate: text('prompt_template').notNull(),
  variables: jsonb('variables').$type<Record<string, any>>(),
  expectedOutput: text('expected_output'),
  model: text('model').default('gpt-4'),
  maxTokens: integer('max_tokens').default(1000),
  temperature: decimal('temperature').default('0.7'),
  systemPrompt: text('system_prompt'),
  isActive: boolean('is_active').default(true),
  isPublic: boolean('is_public').default(false),
  usageCount: integer('usage_count').default(0),
  rating: decimal('rating'),
  tags: jsonb('tags').$type<string[]>().default([]),
  metadata: jsonb('metadata').$type<Record<string, any>>(),
  createdBy: text('created_by').default('system'),
  createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
  updatedAt: timestamp('updated_at', { withTimezone: true }).defaultNow().notNull(),
});

/**
 * Schema da tabela content_briefs - Especificações de Conteúdo
 */
export const contentBriefsTable = pgTable('content_briefs', {
  id: uuid('id').primaryKey().defaultRandom(),
  tenantId: uuid('tenant_id').notNull().references(() => tenantsTable.id, { onDelete: 'cascade' }),
  userId: uuid('user_id').notNull(),
  title: text('title').notNull(),
  description: text('description'),
  contentType: text('content_type').$type<'social_post' | 'blog_article' | 'email' | 'ad_copy' | 'caption' | 'story' | 'reel_script'>().notNull(),
  platform: text('platform'),
  targetAudience: text('target_audience'),
  tone: text('tone'),
  style: text('style'),
  keyMessages: jsonb('key_messages').$type<string[]>(),
  keywords: jsonb('keywords').$type<string[]>(),
  hashtags: jsonb('hashtags').$type<string[]>(),
  callToAction: text('call_to_action'),
  requirements: jsonb('requirements').$type<Record<string, any>>(),
  constraints: jsonb('constraints').$type<Record<string, any>>(),
  brandVoiceId: uuid('brand_voice_id'),
  campaignId: uuid('campaign_id'),
  status: text('status').$type<'draft' | 'ready' | 'in_progress' | 'completed' | 'archived'>().default('draft'),
  priority: text('priority').$type<'low' | 'medium' | 'high' | 'urgent'>().default('medium'),
  dueDate: timestamp('due_date', { withTimezone: true }),
  createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
  updatedAt: timestamp('updated_at', { withTimezone: true }).defaultNow().notNull(),
});

/**
 * Schema da tabela generated_content - Conteúdo Gerado com Variações
 */
export const generatedContentTable = pgTable('generated_content', {
  id: uuid('id').primaryKey().defaultRandom(),
  briefId: uuid('brief_id').references(() => contentBriefsTable.id, { onDelete: 'cascade' }),
  promptId: uuid('prompt_id').references(() => aiPromptsTable.id),
  version: integer('version').default(1),
  content: text('content').notNull(),
  variations: jsonb('variations').$type<Array<{ id: string; content: string; score?: number }>>(),
  generationParams: jsonb('generation_params').$type<Record<string, any>>(),
  qualityScore: decimal('quality_score'),
  brandVoiceScore: decimal('brand_voice_score'),
  complianceScore: decimal('compliance_score'),
  status: text('status').$type<'generated' | 'reviewed' | 'approved' | 'rejected' | 'published'>().default('generated'),
  feedback: text('feedback'),
  selectedVariation: integer('selected_variation'),
  generatedBy: text('generated_by').default('ai'),
  generatedAt: timestamp('generated_at', { withTimezone: true }).defaultNow(),
  reviewedBy: uuid('reviewed_by'),
  reviewedAt: timestamp('reviewed_at', { withTimezone: true }),
  createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
  updatedAt: timestamp('updated_at', { withTimezone: true }).defaultNow().notNull(),
});

/**
 * Schema da tabela ai_content - Conteúdo Principal de IA
 */
export const aiContentTable = pgTable('ai_content', {
  id: uuid('id').primaryKey().defaultRandom(),
  tenantId: uuid('tenant_id').notNull().references(() => tenantsTable.id, { onDelete: 'cascade' }),
  userId: uuid('user_id').notNull(),
  title: text('title').notNull(),
  content: text('content').notNull(),
  contentType: text('content_type').$type<'social_post' | 'blog_article' | 'email' | 'ad_copy' | 'caption' | 'story' | 'reel_script'>().notNull(),
  platform: text('platform'),
  briefId: uuid('brief_id').references(() => contentBriefsTable.id),
  generatedContentId: uuid('generated_content_id').references(() => generatedContentTable.id),
  brandVoiceId: uuid('brand_voice_id'),
  campaignId: uuid('campaign_id'),
  status: text('status').$type<'draft' | 'review' | 'approved' | 'scheduled' | 'published' | 'archived'>().default('draft'),
  metadata: jsonb('metadata').$type<Record<string, any>>(),
  tags: jsonb('tags').$type<string[]>().default([]),
  hashtags: jsonb('hashtags').$type<string[]>(),
  mentions: jsonb('mentions').$type<string[]>(),
  media: jsonb('media').$type<Array<{ type: string; url: string; alt?: string }>>(),
  scheduledFor: timestamp('scheduled_for', { withTimezone: true }),
  publishedAt: timestamp('published_at', { withTimezone: true }),
  performance: jsonb('performance').$type<Record<string, number>>(),
  createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
  updatedAt: timestamp('updated_at', { withTimezone: true }).defaultNow().notNull(),
});

/**
 * Schema da tabela content_feedback - Feedback para Melhoria da IA
 */
export const contentFeedbackTable = pgTable('content_feedback', {
  id: uuid('id').primaryKey().defaultRandom(),
  contentId: uuid('content_id').references(() => aiContentTable.id, { onDelete: 'cascade' }),
  generatedContentId: uuid('generated_content_id').references(() => generatedContentTable.id, { onDelete: 'cascade' }),
  userId: uuid('user_id').notNull(),
  feedbackType: text('feedback_type').$type<'quality' | 'brand_voice' | 'accuracy' | 'relevance' | 'tone' | 'style'>().notNull(),
  rating: integer('rating').notNull(), // 1-5
  feedback: text('feedback'),
  suggestions: text('suggestions'),
  isUseful: boolean('is_useful'),
  issues: jsonb('issues').$type<string[]>(),
  improvements: jsonb('improvements').$type<string[]>(),
  metadata: jsonb('metadata').$type<Record<string, any>>(),
  createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
  updatedAt: timestamp('updated_at', { withTimezone: true }).defaultNow().notNull(),
});

/**
 * Schema da tabela compliance_checks - Verificações de Compliance
 */
export const complianceChecksTable = pgTable('compliance_checks', {
  id: uuid('id').primaryKey().defaultRandom(),
  contentId: uuid('content_id').references(() => aiContentTable.id, { onDelete: 'cascade' }),
  generatedContentId: uuid('generated_content_id').references(() => generatedContentTable.id, { onDelete: 'cascade' }),
  checkType: text('check_type').$type<'legal' | 'ethical' | 'brand_safety' | 'platform_policy' | 'industry_standards'>().notNull(),
  status: text('status').$type<'pending' | 'passed' | 'failed' | 'warning' | 'manual_review'>().default('pending'),
  score: decimal('score'),
  issues: jsonb('issues').$type<Array<{ type: string; severity: string; message: string; suggestion?: string }>>(),
  recommendations: jsonb('recommendations').$type<string[]>(),
  automaticFix: boolean('automatic_fix').default(false),
  checkedBy: text('checked_by').default('system'),
  checkedAt: timestamp('checked_at', { withTimezone: true }).defaultNow(),
  metadata: jsonb('metadata').$type<Record<string, any>>(),
  createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
  updatedAt: timestamp('updated_at', { withTimezone: true }).defaultNow().notNull(),
});

// Schemas de validação Zod para ai_prompts
export const insertAiPromptSchema = createInsertSchema(aiPromptsTable, {
  name: z.string().min(1, 'Nome do prompt é obrigatório').max(200),
  description: z.string().max(1000).optional(),
  category: z.enum(['content_generation', 'brand_voice', 'campaign_ideas', 'hashtags', 'captions', 'blog_posts']),
  promptTemplate: z.string().min(10, 'Template do prompt deve ter pelo menos 10 caracteres'),
  model: z.string().default('gpt-4'),
  maxTokens: z.number().min(100).max(4000),
  temperature: z.string().regex(/^[0-1](\.\d+)?$/, 'Temperature deve ser entre 0 e 1'),
  rating: z.string().regex(/^[1-5](\.\d)?$/).optional(),
});

export const selectAiPromptSchema = createSelectSchema(aiPromptsTable);
export const updateAiPromptSchema = insertAiPromptSchema.partial().omit({ id: true });

// Schemas de validação Zod para content_briefs
export const insertContentBriefSchema = createInsertSchema(contentBriefsTable, {
  tenantId: z.string().uuid('ID do tenant deve ser um UUID válido'),
  userId: z.string().uuid('ID do usuário deve ser um UUID válido'),
  title: z.string().min(1, 'Título é obrigatório').max(200),
  description: z.string().max(1000).optional(),
  contentType: z.enum(['social_post', 'blog_article', 'email', 'ad_copy', 'caption', 'story', 'reel_script']),
  platform: z.string().max(50).optional(),
  targetAudience: z.string().max(500).optional(),
  tone: z.string().max(100).optional(),
  style: z.string().max(100).optional(),
  callToAction: z.string().max(200).optional(),
  status: z.enum(['draft', 'ready', 'in_progress', 'completed', 'archived']),
  priority: z.enum(['low', 'medium', 'high', 'urgent']),
  brandVoiceId: z.string().uuid().optional(),
  campaignId: z.string().uuid().optional(),
});

export const selectContentBriefSchema = createSelectSchema(contentBriefsTable);
export const updateContentBriefSchema = insertContentBriefSchema.partial().omit({ id: true });

// Schemas de validação Zod para generated_content
export const insertGeneratedContentSchema = createInsertSchema(generatedContentTable, {
  briefId: z.string().uuid().optional(),
  promptId: z.string().uuid().optional(),
  version: z.number().min(1),
  content: z.string().min(1, 'Conteúdo é obrigatório'),
  qualityScore: z.string().regex(/^[0-9](\.\d+)?$/).optional(),
  brandVoiceScore: z.string().regex(/^[0-9](\.\d+)?$/).optional(),
  complianceScore: z.string().regex(/^[0-9](\.\d+)?$/).optional(),
  status: z.enum(['generated', 'reviewed', 'approved', 'rejected', 'published']),
  selectedVariation: z.number().min(0).optional(),
  reviewedBy: z.string().uuid().optional(),
});

export const selectGeneratedContentSchema = createSelectSchema(generatedContentTable);
export const updateGeneratedContentSchema = insertGeneratedContentSchema.partial().omit({ id: true });

// Schemas de validação Zod para ai_content
export const insertAiContentSchema = createInsertSchema(aiContentTable, {
  tenantId: z.string().uuid('ID do tenant deve ser um UUID válido'),
  userId: z.string().uuid('ID do usuário deve ser um UUID válido'),
  title: z.string().min(1, 'Título é obrigatório').max(200),
  content: z.string().min(1, 'Conteúdo é obrigatório'),
  contentType: z.enum(['social_post', 'blog_article', 'email', 'ad_copy', 'caption', 'story', 'reel_script']),
  platform: z.string().max(50).optional(),
  status: z.enum(['draft', 'review', 'approved', 'scheduled', 'published', 'archived']),
  briefId: z.string().uuid().optional(),
  generatedContentId: z.string().uuid().optional(),
  brandVoiceId: z.string().uuid().optional(),
  campaignId: z.string().uuid().optional(),
});

export const selectAiContentSchema = createSelectSchema(aiContentTable);
export const updateAiContentSchema = insertAiContentSchema.partial().omit({ id: true });

// Schemas de validação Zod para content_feedback
export const insertContentFeedbackSchema = createInsertSchema(contentFeedbackTable, {
  contentId: z.string().uuid().optional(),
  generatedContentId: z.string().uuid().optional(),
  userId: z.string().uuid('ID do usuário deve ser um UUID válido'),
  feedbackType: z.enum(['quality', 'brand_voice', 'accuracy', 'relevance', 'tone', 'style']),
  rating: z.number().min(1).max(5),
  feedback: z.string().max(1000).optional(),
  suggestions: z.string().max(1000).optional(),
});

export const selectContentFeedbackSchema = createSelectSchema(contentFeedbackTable);
export const updateContentFeedbackSchema = insertContentFeedbackSchema.partial().omit({ id: true });

// Schemas de validação Zod para compliance_checks
export const insertComplianceCheckSchema = createInsertSchema(complianceChecksTable, {
  contentId: z.string().uuid().optional(),
  generatedContentId: z.string().uuid().optional(),
  checkType: z.enum(['legal', 'ethical', 'brand_safety', 'platform_policy', 'industry_standards']),
  status: z.enum(['pending', 'passed', 'failed', 'warning', 'manual_review']),
  score: z.string().regex(/^[0-9](\.\d+)?$/).optional(),
  automaticFix: z.boolean(),
  checkedBy: z.string().default('system'),
});

export const selectComplianceCheckSchema = createSelectSchema(complianceChecksTable);
export const updateComplianceCheckSchema = insertComplianceCheckSchema.partial().omit({ id: true });

// Tipos TypeScript
export type AiPrompt = typeof aiPromptsTable.$inferSelect;
export type NewAiPrompt = typeof aiPromptsTable.$inferInsert;
export type UpdateAiPrompt = Partial<Omit<NewAiPrompt, 'id' | 'createdAt' | 'updatedAt'>>;

export type ContentBrief = typeof contentBriefsTable.$inferSelect;
export type NewContentBrief = typeof contentBriefsTable.$inferInsert;
export type UpdateContentBrief = Partial<Omit<NewContentBrief, 'id' | 'createdAt' | 'updatedAt'>>;

export type GeneratedContent = typeof generatedContentTable.$inferSelect;
export type NewGeneratedContent = typeof generatedContentTable.$inferInsert;
export type UpdateGeneratedContent = Partial<Omit<NewGeneratedContent, 'id' | 'createdAt' | 'updatedAt'>>;

export type AiContent = typeof aiContentTable.$inferSelect;
export type NewAiContent = typeof aiContentTable.$inferInsert;
export type UpdateAiContent = Partial<Omit<NewAiContent, 'id' | 'createdAt' | 'updatedAt'>>;

export type ContentFeedback = typeof contentFeedbackTable.$inferSelect;
export type NewContentFeedback = typeof contentFeedbackTable.$inferInsert;
export type UpdateContentFeedback = Partial<Omit<NewContentFeedback, 'id' | 'createdAt' | 'updatedAt'>>;

export type ComplianceCheck = typeof complianceChecksTable.$inferSelect;
export type NewComplianceCheck = typeof complianceChecksTable.$inferInsert;
export type UpdateComplianceCheck = Partial<Omit<NewComplianceCheck, 'id' | 'createdAt' | 'updatedAt'>>;

// Schemas específicos para validação de dados complexos
export const promptVariablesSchema = z.record(z.string(), z.union([
  z.string(),
  z.number(),
  z.boolean(),
  z.array(z.string()),
  z.object({
    type: z.enum(['text', 'number', 'boolean', 'array', 'select']),
    required: z.boolean().default(false),
    description: z.string().optional(),
    options: z.array(z.string()).optional(),
    default: z.any().optional(),
  })
]));

export const contentRequirementsSchema = z.object({
  length: z.object({
    min: z.number().optional(),
    max: z.number().optional(),
    ideal: z.number().optional(),
  }).optional(),
  format: z.object({
    structure: z.array(z.string()).optional(),
    sections: z.array(z.string()).optional(),
    style: z.enum(['formal', 'casual', 'professional', 'playful', 'educational']).optional(),
  }).optional(),
  inclusion: z.object({
    keywords: z.array(z.string()).optional(),
    hashtags: z.array(z.string()).optional(),
    mentions: z.array(z.string()).optional(),
    links: z.array(z.string().url()).optional(),
  }).optional(),
  exclusion: z.object({
    words: z.array(z.string()).optional(),
    topics: z.array(z.string()).optional(),
    competitors: z.array(z.string()).optional(),
  }).optional(),
});

export const contentConstraintsSchema = z.object({
  platform: z.object({
    characterLimit: z.number().optional(),
    hashtageLimit: z.number().optional(),
    mentionLimit: z.number().optional(),
    mediaLimit: z.number().optional(),
  }).optional(),
  brand: z.object({
    voiceCompliance: z.boolean().default(true),
    complianceRequired: z.boolean().default(true),
    approvalRequired: z.boolean().default(false),
  }).optional(),
  legal: z.object({
    disclaimers: z.array(z.string()).optional(),
    regulations: z.array(z.string()).optional(),
    restricted: z.array(z.string()).optional(),
  }).optional(),
});

export const generationParamsSchema = z.object({
  model: z.string(),
  temperature: z.number().min(0).max(1),
  maxTokens: z.number().min(1),
  topP: z.number().min(0).max(1).optional(),
  frequencyPenalty: z.number().min(-2).max(2).optional(),
  presencePenalty: z.number().min(-2).max(2).optional(),
  systemPrompt: z.string().optional(),
  userPrompt: z.string(),
  context: z.record(z.string(), z.any()).optional(),
});