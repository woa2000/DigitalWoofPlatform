import { sql } from "drizzle-orm";
import { pgTable, pgSchema, text, varchar, timestamp, jsonb, integer, decimal, boolean, uuid } from "drizzle-orm/pg-core";
import { relations } from "drizzle-orm";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

// Note: We're not using the auth schema directly to avoid schema reference issues
// Instead, we'll use a simple userId reference that can be validated at the application level

// ============================================
// TENANT SYSTEM TABLES
// ============================================

// Tenants table - organizations/companies
export const tenants = pgTable("tenants", {
  id: uuid("id").primaryKey().default(sql`gen_random_uuid()`),
  
  // Identificação
  name: text("name").notNull(),
  slug: text("slug").unique().notNull(), // URL-friendly name
  domain: text("domain").unique(), // Optional custom domain
  
  // Business Info
  businessType: text("business_type"), // veterinaria, petshop, hotel, etc.
  subscriptionPlan: text("subscription_plan").default("free"), // free, basic, premium
  subscriptionStatus: text("subscription_status").default("active"),
  subscriptionEndDate: timestamp("subscription_end_date"),
  
  // Settings & Preferences
  settings: jsonb("settings").default({}),
  brandGuidelines: jsonb("brand_guidelines").default({}),
  billingInfo: jsonb("billing_info").default({}),
  
  // Owner & Status
  ownerId: uuid("owner_id").notNull(), // References the user who created/owns the tenant
  status: text("status").default("active"),
  
  // Metadata
  createdAt: timestamp("created_at").default(sql`now()`).notNull(),
  updatedAt: timestamp("updated_at").default(sql`now()`).notNull(),
});

// Tenant Users relationship table
export const tenantUsers = pgTable("tenant_users", {
  id: uuid("id").primaryKey().default(sql`gen_random_uuid()`),
  tenantId: uuid("tenant_id").notNull().references(() => tenants.id, { onDelete: "cascade" }),
  userId: uuid("user_id").notNull(), // References auth.users(id) but no FK due to RLS
  
  // Role & Permissions
  role: text("role").default("member"), // owner, admin, member, viewer
  permissions: jsonb("permissions").default([]),
  
  // Status
  status: text("status").default("active"), // active, invited, suspended
  invitedBy: uuid("invited_by"), // References auth.users(id) but no FK due to RLS
  invitedAt: timestamp("invited_at"),
  joinedAt: timestamp("joined_at").default(sql`now()`),
  
  // Metadata
  createdAt: timestamp("created_at").default(sql`now()`).notNull(),
  updatedAt: timestamp("updated_at").default(sql`now()`).notNull(),
}, (table) => ({
  uniqueTenantUser: sql`UNIQUE(${table.tenantId}, ${table.userId})`
}));

// User profiles table - application-specific user data
export const profiles = pgTable("profiles", {
  id: uuid("id").primaryKey().notNull(),
  tenantId: uuid("tenant_id").references(() => tenants.id), // References the tenant this profile belongs to
  fullName: text("full_name"),
  avatarUrl: text("avatar_url"),
  businessName: text("business_name"),
  businessType: text("business_type"), // veterinaria, petshop, hotel, etc.
  phone: text("phone"),
  website: text("website"),
  address: text("address"),
  city: text("city"),
  state: text("state"),
  zipCode: text("zip_code"),
  country: text("country").default("BR"),
  
  // Subscription and plan info
  planType: text("plan_type").default("free"), // free, basic, premium
  subscriptionStatus: text("subscription_status").default("active"), // active, cancelled, expired
  subscriptionEndDate: timestamp("subscription_end_date"),
  
  // Onboarding status
  onboardingCompleted: boolean("onboarding_completed").default(false),
  onboardingStep: text("onboarding_step").default("welcome"), // welcome, brand-setup, preferences, complete
  
  // User preferences
  timezone: text("timezone").default("America/Sao_Paulo"),
  language: text("language").default("pt-BR"),
  notifications: jsonb("notifications").default({
    email: true,
    browser: true,
    marketing: false
  }),
  
  // Metadata
  metadata: jsonb("metadata").default({}),
  
  // Timestamps
  createdAt: timestamp("created_at").default(sql`now()`).notNull(),
  updatedAt: timestamp("updated_at").default(sql`now()`).notNull(),
});

// Brand Voice profiles (legacy - deprecated in favor of brandVoiceJsons)
export const brandVoices = pgTable("brand_voices", {
  id: uuid("id").primaryKey().default(sql`gen_random_uuid()`),
  userId: uuid("user_id").notNull(),
  name: text("name").notNull(),
  tone: text("tone").notNull(), // profissional-amigavel, empatico, tecnico
  persona: jsonb("persona").notNull(), // Target audience characteristics
  values: jsonb("values").notNull(), // Brand values and principles
  guidelines: jsonb("guidelines").notNull(), // Communication guidelines
  isActive: boolean("is_active").default(true).notNull(),
  createdAt: timestamp("created_at").default(sql`now()`).notNull(),
  updatedAt: timestamp("updated_at").default(sql`now()`).notNull(),
});

// Brand Voice JSON Schema v1.0 - Complete brand voice profiles
export const brandVoiceJsons = pgTable("brand_voice_jsons", {
  id: uuid("id").primaryKey().default(sql`gen_random_uuid()`),
  userId: uuid("user_id").notNull(),
  tenantId: uuid("tenant_id").references(() => tenants.id), // References the tenant this brand voice belongs to
  
  // Core Schema Data (JSONB for full search and indexing)
  brandVoiceJson: jsonb("brand_voice_json").notNull(), // Complete Brand Voice JSON Schema v1.0
  
  // Extracted fields for performance and queries
  name: text("name").notNull(), // From brandVoiceJson.brand.name
  version: text("version").notNull().default("1.0"), // Schema version
  status: text("status").notNull().default("draft"), // draft, active, archived
  
  // Generation tracking
  generatedFrom: text("generated_from"), // onboarding, anamnesis, manual, merged
  sourceAnalysisId: uuid("source_analysis_id").references(() => anamnesisAnalysis.id), // If from anamnesis
  sourceOnboardingId: uuid("source_onboarding_id").references(() => brandOnboarding.id), // If from onboarding
  
  // Quality metrics (calculated fields for performance)
  qualityScoreOverall: decimal("quality_score_overall", { precision: 5, scale: 2 }), // 0-100
  qualityScoreCompleteness: decimal("quality_score_completeness", { precision: 5, scale: 2 }), // 0-100
  qualityScoreConsistency: decimal("quality_score_consistency", { precision: 5, scale: 2 }), // 0-100
  qualityScoreSpecificity: decimal("quality_score_specificity", { precision: 5, scale: 2 }), // 0-100
  qualityScoreUsability: decimal("quality_score_usability", { precision: 5, scale: 2 }), // 0-100
  
  // Cache and performance
  lastValidatedAt: timestamp("last_validated_at"), // Last schema validation
  cacheKey: text("cache_key").unique(), // For Redis caching
  
  // Usage tracking
  usageCount: integer("usage_count").default(0).notNull(), // How many times used for generation
  lastUsedAt: timestamp("last_used_at"), // Last time used for content generation
  
  // Timestamps
  createdAt: timestamp("created_at").default(sql`now()`).notNull(),
  updatedAt: timestamp("updated_at").default(sql`now()`).notNull(),
  activatedAt: timestamp("activated_at"), // When status changed to active
  archivedAt: timestamp("archived_at"), // When status changed to archived
});

// Campaigns
export const campaigns = pgTable("campaigns", {
  id: uuid("id").primaryKey().default(sql`gen_random_uuid()`),
  userId: uuid("user_id").notNull(),
  tenantId: uuid("tenant_id").references(() => tenants.id), // References the tenant this campaign belongs to
  name: text("name").notNull(),
  type: text("type").notNull(), // checkup_preventivo, programa_vip, etc
  status: text("status").notNull(), // ativa, em_teste, pausada, finalizada
  channels: jsonb("channels").notNull(), // instagram, email, whatsapp
  targetAudience: jsonb("target_audience").notNull(),
  metrics: jsonb("metrics"), // leads, conversions, engagement
  createdAt: timestamp("created_at").default(sql`now()`).notNull(),
  updatedAt: timestamp("updated_at").default(sql`now()`).notNull(),
});

// AI Generated Content
export const aiContent = pgTable("ai_content", {
  id: uuid("id").primaryKey().default(sql`gen_random_uuid()`),
  userId: uuid("user_id").notNull(),
  tenantId: uuid("tenant_id").references(() => tenants.id), // References the tenant this content belongs to
  campaignId: uuid("campaign_id").references(() => campaigns.id),
  type: text("type").notNull(), // post_instagram, email, whatsapp_template
  content: text("content").notNull(),
  prompt: text("prompt").notNull(),
  brandVoiceId: uuid("brand_voice_id").references(() => brandVoices.id),
  complianceStatus: text("compliance_status").notNull(), // approved, pending, rejected
  complianceScore: decimal("compliance_score", { precision: 3, scale: 2 }),
  humanReviewRequired: boolean("human_review_required").default(false),
  isPublished: boolean("is_published").default(false),
  publishedAt: timestamp("published_at"),
  createdAt: timestamp("created_at").default(sql`now()`).notNull(),
});

// Compliance checks
export const complianceChecks = pgTable("compliance_checks", {
  id: uuid("id").primaryKey().default(sql`gen_random_uuid()`),
  contentId: uuid("content_id").references(() => aiContent.id).notNull(),
  category: text("category").notNull(), // medical, promotional, safety, legal, ethical
  severity: text("severity").notNull(), // critical, high, medium, low
  rule: text("rule").notNull(),
  passed: boolean("passed").notNull(),
  message: text("message"),
  suggestion: text("suggestion"),
  createdAt: timestamp("created_at").default(sql`now()`).notNull(),
});

// Brand assets
export const brandAssets = pgTable("brand_assets", {
  id: uuid("id").primaryKey().default(sql`gen_random_uuid()`),
  userId: uuid("user_id").notNull(),
  type: text("type").notNull(), // logo, color_palette, typography
  name: text("name").notNull(),
  fileName: text("file_name").notNull(),
  fileUrl: text("file_url").notNull(),
  metadata: jsonb("metadata"), // dimensions, colors, etc
  createdAt: timestamp("created_at").default(sql`now()`).notNull(),
});

// Brand onboarding - Wizard de configuração da marca
export const brandOnboarding = pgTable("brand_onboarding", {
  id: uuid("id").primaryKey().default(sql`gen_random_uuid()`),
  userId: uuid("user_id").notNull().unique(), // Único por usuário
  tenantId: uuid("tenant_id").references(() => tenants.id), // References the tenant this onboarding belongs to
  
  // Logo e Visual
  logoUrl: text("logo_url"),
  palette: jsonb("palette").$type<string[]>(), // Array de cores em hex
  logoMetadata: jsonb("logo_metadata").$type<{
    width: number;
    height: number;
    format: string;
    hasTransparency: boolean;
    fileSize: number;
  }>(),
  
  // Tom de Voz (4 sliders 0.0-1.0)
  toneConfig: jsonb("tone_config").$type<{
    confianca: number;
    acolhimento: number;
    humor: number;
    especializacao: number;
  }>().notNull(),
  
  // Configuração de Linguagem
  languageConfig: jsonb("language_config").$type<{
    preferredTerms: string[]; // max 20
    avoidTerms: string[]; // max 15
    defaultCTAs: string[]; // max 5
  }>().notNull(),
  
  // Valores e Missão da Marca
  brandValues: jsonb("brand_values").$type<{
    mission?: string; // opcional, max 200 chars
    values: Array<{
      name: string;
      description?: string;
      weight: number; // 0.0-1.0
    }>; // max 5
    disclaimer: string; // obrigatório
  }>(),
  
  // Controle do Wizard
  stepCompleted: text("step_completed").$type<'logo' | 'palette' | 'tone' | 'language' | 'values' | 'completed'>(),
  
  // Timestamps
  createdAt: timestamp("created_at").default(sql`now()`).notNull(),
  updatedAt: timestamp("updated_at").default(sql`now()`).notNull(),
  completedAt: timestamp("completed_at"),
});

// Business anamnesis
export const businessAnamnesis = pgTable("business_anamnesis", {
  id: uuid("id").primaryKey().default(sql`gen_random_uuid()`),
  userId: uuid("user_id").notNull(),
  tenantId: uuid("tenant_id").references(() => tenants.id), // References the tenant this anamnesis belongs to
  responses: jsonb("responses").notNull(), // Anamnesis questions and answers
  analysis: jsonb("analysis"), // AI analysis results
  recommendations: jsonb("recommendations"), // Marketing recommendations
  score: integer("score"), // Overall business health score
  completedAt: timestamp("completed_at").default(sql`now()`).notNull(),
});

// Anamnesis Analysis - Digital presence analysis
export const anamnesisAnalysis = pgTable("anamnesis_analysis", {
  id: uuid("id").primaryKey().default(sql`gen_random_uuid()`),
  userId: uuid("user_id").notNull(),
  tenantId: uuid("tenant_id").references(() => tenants.id), // References the tenant this analysis belongs to
  primaryUrl: text("primary_url").notNull(),
  status: text("status").notNull().$type<'queued' | 'running' | 'done' | 'error'>(),
  scoreCompleteness: decimal("score_completeness", { precision: 5, scale: 2 }),
  errorMessage: text("error_message"),
  createdAt: timestamp("created_at").default(sql`now()`).notNull(),
  updatedAt: timestamp("updated_at").default(sql`now()`).notNull(),
});

// Anamnesis Sources - URLs being analyzed
export const anamnesisSource = pgTable("anamnesis_source", {
  id: uuid("id").primaryKey().default(sql`gen_random_uuid()`),
  analysisId: uuid("analysis_id").references(() => anamnesisAnalysis.id).notNull(),
  type: text("type").notNull().$type<'site' | 'social'>(),
  url: text("url").notNull(),
  normalizedUrl: text("normalized_url").notNull(),
  provider: text("provider"), // instagram, facebook, etc.
  lastFetchedAt: timestamp("last_fetched_at"),
  hash: text("hash").unique().notNull(),
});

// Anamnesis Findings - Analysis results by section
export const anamnesisFinding = pgTable("anamnesis_finding", {
  id: uuid("id").primaryKey().default(sql`gen_random_uuid()`),
  analysisId: uuid("analysis_id").references(() => anamnesisAnalysis.id).notNull(),
  key: text("key").notNull(),
  section: text("section").notNull().$type<'identity' | 'personas' | 'ux' | 'ecosystem' | 'actionPlan' | 'roadmap' | 'homeAnatomy' | 'questions'>(),
  payload: jsonb("payload").notNull(),
});

// Create insert schemas
export const insertProfileSchema = createInsertSchema(profiles).omit({
  createdAt: true,
  updatedAt: true,
}).extend({
  phone: z.string().optional(),
  website: z.string().url().optional().or(z.literal('')),
  businessType: z.enum(['veterinaria', 'petshop', 'hotel', 'creche', 'adestramento', 'outros']).optional(),
  planType: z.enum(['free', 'basic', 'premium']).default('free'),
  subscriptionStatus: z.enum(['active', 'cancelled', 'expired']).default('active'),
  onboardingStep: z.enum(['welcome', 'brand-setup', 'preferences', 'complete']).default('welcome'),
  timezone: z.string().default('America/Sao_Paulo'),
  language: z.enum(['pt-BR', 'en-US', 'es-ES']).default('pt-BR'),
});

export const insertBrandVoiceJsonSchema = createInsertSchema(brandVoiceJsons).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
  cacheKey: true,
  usageCount: true,
  lastUsedAt: true,
  lastValidatedAt: true,
  activatedAt: true,
  archivedAt: true,
});

export const insertBrandVoiceSchema = createInsertSchema(brandVoices).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export const insertCampaignSchema = createInsertSchema(campaigns).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export const insertAIContentSchema = createInsertSchema(aiContent).omit({
  id: true,
  createdAt: true,
});

export const insertComplianceCheckSchema = createInsertSchema(complianceChecks).omit({
  id: true,
  createdAt: true,
});

// === CONTENT GENERATION SYSTEM ===

// Content Briefs for Content Generation
export const contentBriefs = pgTable("content_briefs", {
  id: uuid("id").primaryKey().default(sql`gen_random_uuid()`),
  userId: uuid("user_id").notNull(),
  tenantId: uuid("tenant_id").references(() => tenants.id), // References the tenant this brief belongs to
  
  // Especificação do conteúdo
  theme: text("theme").notNull(),
  objective: text("objective").notNull(), // educar, vender, engajar, recall, awareness
  channel: text("channel").notNull(), // instagram_post, instagram_story, facebook_post, whatsapp, email, website
  format: text("format").notNull(), // texto, carrossel, video_script, email_campaign
  
  // Configuração
  brandVoiceId: uuid("brand_voice_id").references(() => brandVoiceJsons.id).notNull(),
  customInstructions: text("custom_instructions"),
  wordsToAvoid: jsonb("words_to_avoid").$type<string[]>(),
  
  // Metadata
  campaignId: uuid("campaign_id").references(() => campaigns.id),
  templateId: uuid("template_id"), // References campaign_templates if exists
  
  createdAt: timestamp("created_at").default(sql`now()`).notNull(),
  updatedAt: timestamp("updated_at").default(sql`now()`).notNull(),
});

// Generated Content
export const generatedContent = pgTable("generated_content", {
  id: uuid("id").primaryKey().default(sql`gen_random_uuid()`),
  briefId: uuid("brief_id").references(() => contentBriefs.id).notNull(),
  
  // Conteúdo gerado
  variations: jsonb("variations").notNull(), // array de ContentVariation
  creativeBrief: jsonb("creative_brief"),
  
  // Compliance e qualidade
  complianceFlags: jsonb("compliance_flags").default([]),
  complianceScore: decimal("compliance_score", { precision: 3, scale: 2 }).notNull(),
  qualityMetrics: jsonb("quality_metrics"),
  
  // Status e aprovação
  status: text("status").default("generated").notNull(), // generated, approved, rejected, regenerated, published
  approvedVariationId: text("approved_variation_id"),
  approvedBy: uuid("approved_by"),
  approvedAt: timestamp("approved_at"),
  
  // Métricas de geração
  generationMetrics: jsonb("generation_metrics"), // tokens, time, cost
  
  createdAt: timestamp("created_at").default(sql`now()`).notNull(),
  updatedAt: timestamp("updated_at").default(sql`now()`).notNull(),
});

// Content Feedback for AI improvement
export const contentFeedback = pgTable("content_feedback", {
  id: uuid("id").primaryKey().default(sql`gen_random_uuid()`),
  contentId: uuid("content_id").references(() => generatedContent.id).notNull(),
  variationId: text("variation_id").notNull(),
  
  // Tipo de feedback
  feedbackType: text("feedback_type").notNull(), // approval, rejection, edit_request, regeneration, rating
  feedbackText: text("feedback_text"),
  rating: integer("rating"), // 1-5 stars
  
  // Melhorias específicas
  improvementSuggestions: jsonb("improvement_suggestions"),
  regenerationNotes: text("regeneration_notes"),
  
  // Metadata
  userId: uuid("user_id").notNull(),
  createdAt: timestamp("created_at").default(sql`now()`).notNull(),
});

// AI Prompts and configurations
export const aiPrompts = pgTable("ai_prompts", {
  id: uuid("id").primaryKey().default(sql`gen_random_uuid()`),
  name: varchar("name", { length: 200 }).notNull(),
  promptType: text("prompt_type").notNull(), // educational, promotional, recall, engagement, health_awareness
  
  // Conteúdo do prompt
  systemPrompt: text("system_prompt").notNull(),
  userPromptTemplate: text("user_prompt_template").notNull(),
  
  // Configuração
  model: varchar("model", { length: 50 }).default("gpt-4"),
  temperature: decimal("temperature", { precision: 3, scale: 2 }).default("0.7"),
  maxTokens: integer("max_tokens").default(1000),
  
  // Versionamento
  version: integer("version").default(1),
  isActive: boolean("is_active").default(true),
  
  // Performance
  usageCount: integer("usage_count").default(0),
  avgQualityScore: decimal("avg_quality_score", { precision: 3, scale: 2 }),
  
  createdAt: timestamp("created_at").default(sql`now()`).notNull(),
});

export const insertBrandAssetSchema = createInsertSchema(brandAssets).omit({
  id: true,
  createdAt: true,
});

export const insertBrandOnboardingSchema = createInsertSchema(brandOnboarding).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export const insertBusinessAnamnesisSchema = createInsertSchema(businessAnamnesis).omit({
  id: true,
  completedAt: true,
});

export const insertAnamnesisAnalysisSchema = createInsertSchema(anamnesisAnalysis).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export const insertContentBriefSchema = createInsertSchema(contentBriefs).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export const insertGeneratedContentSchema = createInsertSchema(generatedContent).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export const insertContentFeedbackSchema = createInsertSchema(contentFeedback).omit({
  id: true,
  createdAt: true,
});

export const insertAIPromptSchema = createInsertSchema(aiPrompts).omit({
  id: true,
  createdAt: true,
});

export const insertAnamnesisSourceSchema = createInsertSchema(anamnesisSource).omit({
  id: true,
});

export const insertAnamnesisFindingSchema = createInsertSchema(anamnesisFinding).omit({
  id: true,
});

// Tenant Schemas
export const insertTenantSchema = createInsertSchema(tenants).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
}).extend({
  name: z.string().min(1, "Nome é obrigatório").max(200, "Nome muito longo"),
  slug: z.string().min(1, "Slug é obrigatório").max(100, "Slug muito longo").regex(/^[a-z0-9-]+$/, "Slug deve conter apenas letras minúsculas, números e hífens"),
  businessType: z.enum(['veterinaria', 'petshop', 'hotel', 'creche', 'adestramento', 'outros']).optional(),
  subscriptionPlan: z.enum(['free', 'basic', 'premium']).default('free'),
  subscriptionStatus: z.enum(['active', 'cancelled', 'expired', 'trial']).default('active'),
  status: z.enum(['active', 'suspended', 'archived']).default('active'),
});

export const insertTenantUserSchema = createInsertSchema(tenantUsers).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
  joinedAt: true,
}).extend({
  role: z.enum(['owner', 'admin', 'member', 'viewer']).default('member'),
  status: z.enum(['active', 'invited', 'suspended']).default('active'),
});

// User metadata type for raw_user_meta_data in auth.users
export type UserMetadata = {
  name?: string;
  business_type?: 'veterinaria' | 'petshop' | 'banho_tosa' | 'hotel_pet';
  business_name?: string;
  preferred_tenant_id?: string; // ID do tenant preferencial do usuário
};

// Enums necessários
export const campaignCategoryEnum = pgTable("campaign_category", {
  value: text("value").primaryKey(),
});

export const serviceTypeEnum = pgTable("service_type", {
  value: text("value").primaryKey(),
});

export const campaignStatusEnum = pgTable("campaign_status", {
  value: text("value").primaryKey(),
});

export const assetTypeEnum = pgTable("asset_type", {
  value: text("value").primaryKey(),
});

export const usageRightsTypeEnum = pgTable("usage_rights_type", {
  value: text("value").primaryKey(),
});

// Templates de campanhas
export const campaignTemplates = pgTable("campaign_templates", {
  id: uuid("id").primaryKey().default(sql`gen_random_uuid()`),
  name: varchar("name", { length: 200 }).notNull(),
  description: text("description"),
  category: text("category").notNull(), // References campaign_category enum
  serviceType: text("service_type").notNull(), // References service_type enum
  
  // Conteúdo estruturado
  contentPieces: jsonb("content_pieces").notNull(),
  visualAssets: jsonb("visual_assets"),
  customizationOptions: jsonb("customization_options"),
  
  // Performance data
  usageCount: integer("usage_count").default(0).notNull(),
  avgEngagementRate: decimal("avg_engagement_rate", { precision: 5, scale: 4 }),
  avgConversionRate: decimal("avg_conversion_rate", { precision: 5, scale: 4 }),
  successCases: integer("success_cases").default(0).notNull(),
  
  // Sazonalidade
  seasonality: jsonb("seasonality"), // {months: [1,2,3], peak_performance: 'high'}
  
  // Metadata
  createdBy: uuid("created_by"),
  isPublic: boolean("is_public").default(true).notNull(),
  isPremium: boolean("is_premium").default(false).notNull(),
  
  createdAt: timestamp("created_at").default(sql`now()`).notNull(),
  updatedAt: timestamp("updated_at").default(sql`now()`).notNull(),
});

// Campanhas personalizadas dos usuários
export const userCampaigns = pgTable("user_campaigns", {
  id: uuid("id").primaryKey().default(sql`gen_random_uuid()`),
  userId: uuid("user_id").notNull(),
  tenantId: uuid("tenant_id").references(() => tenants.id), // References the tenant this campaign belongs to
  templateId: uuid("template_id").references(() => campaignTemplates.id),
  brandVoiceId: uuid("brand_voice_id").references(() => brandVoices.id),
  
  // Configuração da campanha
  campaignConfig: jsonb("campaign_config").notNull(),
  personalizedContent: jsonb("personalized_content").notNull(),
  
  // Status e execução
  status: text("status").default("draft").notNull(), // References campaign_status enum
  scheduledAt: timestamp("scheduled_at"),
  publishedAt: timestamp("published_at"),
  
  // Tracking de performance
  performanceMetrics: jsonb("performance_metrics"),
  
  createdAt: timestamp("created_at").default(sql`now()`).notNull(),
  updatedAt: timestamp("updated_at").default(sql`now()`).notNull(),
});

// Performance tracking
export const campaignPerformance = pgTable("campaign_performance", {
  id: uuid("id").primaryKey().default(sql`gen_random_uuid()`),
  campaignId: uuid("campaign_id").notNull().references(() => userCampaigns.id),
  templateId: uuid("template_id").notNull().references(() => campaignTemplates.id),
  channel: varchar("channel", { length: 50 }).notNull(),
  
  // Metrics básicas
  impressions: integer("impressions").default(0).notNull(),
  reaches: integer("reaches").default(0).notNull(),
  clicks: integer("clicks").default(0).notNull(),
  conversions: integer("conversions").default(0).notNull(),
  
  // Rates calculadas
  engagementRate: decimal("engagement_rate", { precision: 5, scale: 4 }),
  clickThroughRate: decimal("click_through_rate", { precision: 5, scale: 4 }),
  conversionRate: decimal("conversion_rate", { precision: 5, scale: 4 }),
  
  // Metadata
  measuredAt: timestamp("measured_at").default(sql`now()`).notNull(),
});

// Assets visuais - Sistema completo de assets
export const assets = pgTable("assets", {
  id: uuid("id").primaryKey().default(sql`gen_random_uuid()`),
  name: varchar("name", { length: 200 }).notNull(),
  description: text("description"),
  type: text("type").notNull(), // image, video, icon, template, background, illustration
  category: varchar("category", { length: 100 }).notNull(), // pets, medical, seasonal, promotional, educational
  format: varchar("format", { length: 10 }).notNull(), // jpg, png, svg, mp4, gif

  // Arquivos
  url: text("url").notNull(),
  thumbnailUrl: text("thumbnail_url").notNull(),
  previewUrl: text("preview_url"),
  fileSize: integer("file_size").notNull(), // in bytes
  dimensions: jsonb("dimensions").notNull(), // {width: 1080, height: 1080}

  // Metadata para busca e filtros
  tags: jsonb("tags").$type<string[]>(), // Array de tags
  colors: jsonb("colors").$type<string[]>(), // Dominant colors for filtering
  petTypes: jsonb("pet_types").$type<string[]>(), // Array de tipos de pet
  emotions: jsonb("emotions").$type<string[]>(), // Array de emoções

  // Controle de acesso
  isPremium: boolean("is_premium").default(false).notNull(),
  isPublic: boolean("is_public").default(true).notNull(),
  usageRights: text("usage_rights").default("free").notNull(), // free, premium, restricted

  // Performance e métricas
  usageCount: integer("usage_count").default(0).notNull(),
  downloadCount: integer("download_count").default(0).notNull(),
  rating: decimal("rating", { precision: 3, scale: 2 }).default("0.0"), // 0.0-5.0

  // Variants para diferentes formatos
  variants: jsonb("variants"), // {instagram_post: 'url', instagram_story: 'url'}

  // Metadata adicional
  metadata: jsonb("metadata"), // alt, caption, attribution, license

  // Controle de versão e timestamps
  createdBy: uuid("created_by"),
  createdAt: timestamp("created_at").default(sql`now()`).notNull(),
  updatedAt: timestamp("updated_at").default(sql`now()`).notNull(),
});

// Asset Collections
export const assetCollections = pgTable("asset_collections", {
  id: uuid("id").primaryKey().default(sql`gen_random_uuid()`),
  name: varchar("name", { length: 200 }).notNull(),
  description: text("description"),
  tenantId: uuid("tenant_id").references(() => tenants.id), // References the tenant this collection belongs to
  isPublic: boolean("is_public").default(false).notNull(),
  createdBy: uuid("created_by").notNull(),
  createdAt: timestamp("created_at").default(sql`now()`).notNull(),
  updatedAt: timestamp("updated_at").default(sql`now()`).notNull(),
});

// Asset Collection Items
export const assetCollectionItems = pgTable("asset_collection_items", {
  id: uuid("id").primaryKey().default(sql`gen_random_uuid()`),
  collectionId: uuid("collection_id").references(() => assetCollections.id).notNull(),
  assetId: uuid("asset_id").references(() => assets.id).notNull(),
  addedAt: timestamp("added_at").default(sql`now()`).notNull(),
});

// Asset Favorites
export const assetFavorites = pgTable("asset_favorites", {
  id: uuid("id").primaryKey().default(sql`gen_random_uuid()`),
  userId: uuid("user_id").notNull(),
  assetId: uuid("asset_id").references(() => assets.id).notNull(),
  addedAt: timestamp("added_at").default(sql`now()`).notNull(),
}, (table) => ({
  uniqueUserAsset: sql`UNIQUE(${table.userId}, ${table.assetId})`
}));

// Asset Analytics
export const assetAnalytics = pgTable("asset_analytics", {
  id: uuid("id").primaryKey().default(sql`gen_random_uuid()`),
  assetId: uuid("asset_id").references(() => assets.id).notNull(),
  userId: uuid("user_id"),
  action: text("action").notNull(), // view, download, favorite, unfavorite
  metadata: jsonb("metadata"), // additional context
  createdAt: timestamp("created_at").default(sql`now()`).notNull(),
});

// Create insert schemas for Campaign Library
export const insertCampaignTemplateSchema = createInsertSchema(campaignTemplates).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export const insertUserCampaignSchema = createInsertSchema(userCampaigns).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export const insertCampaignPerformanceSchema = createInsertSchema(campaignPerformance).omit({
  id: true,
  measuredAt: true,
});

export const insertAssetSchema = createInsertSchema(assets).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export const insertAssetCollectionSchema = createInsertSchema(assetCollections).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export const insertAssetCollectionItemSchema = createInsertSchema(assetCollectionItems).omit({
  id: true,
  addedAt: true,
});

export const insertAssetFavoriteSchema = createInsertSchema(assetFavorites).omit({
  id: true,
  addedAt: true,
});

export const insertAssetAnalyticsSchema = createInsertSchema(assetAnalytics).omit({
  id: true,
  createdAt: true,
});

// Note: AuthUser type removed as we're not using auth schema directly

// Tenant System Types
export type Tenant = typeof tenants.$inferSelect;
export type InsertTenant = typeof tenants.$inferInsert;
export type TenantUser = typeof tenantUsers.$inferSelect;
export type InsertTenantUser = typeof tenantUsers.$inferInsert;

// Existing Types
export type Profile = typeof profiles.$inferSelect;
export type InsertProfile = z.infer<typeof insertProfileSchema>;
export type BrandVoice = typeof brandVoices.$inferSelect;
export type InsertBrandVoice = z.infer<typeof insertBrandVoiceSchema>;
export type BrandVoiceJson = typeof brandVoiceJsons.$inferSelect;
export type InsertBrandVoiceJson = z.infer<typeof insertBrandVoiceJsonSchema>;
export type Campaign = typeof campaigns.$inferSelect;
export type InsertCampaign = z.infer<typeof insertCampaignSchema>;
export type AIContent = typeof aiContent.$inferSelect;
export type InsertAIContent = z.infer<typeof insertAIContentSchema>;
export type ComplianceCheck = typeof complianceChecks.$inferSelect;
export type InsertComplianceCheck = z.infer<typeof insertComplianceCheckSchema>;
export type BrandAsset = typeof brandAssets.$inferSelect;
export type InsertBrandAsset = z.infer<typeof insertBrandAssetSchema>;
export type BrandOnboarding = typeof brandOnboarding.$inferSelect;
export type InsertBrandOnboarding = z.infer<typeof insertBrandOnboardingSchema>;
export type BusinessAnamnesis = typeof businessAnamnesis.$inferSelect;
export type InsertBusinessAnamnesis = z.infer<typeof insertBusinessAnamnesisSchema>;
export type AnamnesisAnalysis = typeof anamnesisAnalysis.$inferSelect;
export type InsertAnamnesisAnalysis = z.infer<typeof insertAnamnesisAnalysisSchema>;
export type AnamnesisSource = typeof anamnesisSource.$inferSelect;
export type InsertAnamnesisSource = z.infer<typeof insertAnamnesisSourceSchema>;
export type AnamnesisFinding = typeof anamnesisFinding.$inferSelect;
export type InsertAnamnesisFinding = z.infer<typeof insertAnamnesisFindingSchema>;

// Content Generation Types
export type ContentBrief = typeof contentBriefs.$inferSelect;
export type InsertContentBrief = z.infer<typeof insertContentBriefSchema>;
export type GeneratedContent = typeof generatedContent.$inferSelect;
export type InsertGeneratedContent = z.infer<typeof insertGeneratedContentSchema>;
export type ContentFeedback = typeof contentFeedback.$inferSelect;
export type InsertContentFeedback = z.infer<typeof insertContentFeedbackSchema>;
export type AIPrompt = typeof aiPrompts.$inferSelect;
export type InsertAIPrompt = z.infer<typeof insertAIPromptSchema>;

// Campaign Library types
export type CampaignTemplate = typeof campaignTemplates.$inferSelect;
export type InsertCampaignTemplate = z.infer<typeof insertCampaignTemplateSchema>;
export type UserCampaign = typeof userCampaigns.$inferSelect;
export type InsertUserCampaign = z.infer<typeof insertUserCampaignSchema>;
export type CampaignPerformance = typeof campaignPerformance.$inferSelect;
export type InsertCampaignPerformance = z.infer<typeof insertCampaignPerformanceSchema>;

// Asset System Types
export type Asset = typeof assets.$inferSelect;
export type InsertAsset = z.infer<typeof insertAssetSchema>;
export type AssetCollection = typeof assetCollections.$inferSelect;
export type InsertAssetCollection = z.infer<typeof insertAssetCollectionSchema>;
export type AssetCollectionItem = typeof assetCollectionItems.$inferSelect;
export type InsertAssetCollectionItem = z.infer<typeof insertAssetCollectionItemSchema>;
export type AssetFavorite = typeof assetFavorites.$inferSelect;
export type InsertAssetFavorite = z.infer<typeof insertAssetFavoriteSchema>;
export type AssetAnalytics = typeof assetAnalytics.$inferSelect;
export type InsertAssetAnalytics = z.infer<typeof insertAssetAnalyticsSchema>;
