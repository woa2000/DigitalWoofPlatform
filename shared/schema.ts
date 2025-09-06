import { sql } from "drizzle-orm";
import { pgTable, text, varchar, timestamp, jsonb, integer, decimal, boolean, uuid } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

// Users table
export const users = pgTable("users", {
  id: uuid("id").primaryKey().default(sql`gen_random_uuid()`),
  email: text("email").notNull().unique(),
  password: text("password").notNull(),
  name: text("name").notNull(),
  businessType: text("business_type").notNull(), // veterinaria, petshop, banho_tosa, hotel_pet
  businessName: text("business_name").notNull(),
  createdAt: timestamp("created_at").default(sql`now()`).notNull(),
  updatedAt: timestamp("updated_at").default(sql`now()`).notNull(),
});

// Brand Voice profiles (legacy - deprecated in favor of brandVoiceJsons)
export const brandVoices = pgTable("brand_voices", {
  id: uuid("id").primaryKey().default(sql`gen_random_uuid()`),
  userId: uuid("user_id").references(() => users.id).notNull(),
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
  userId: uuid("user_id").references(() => users.id).notNull(),
  
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
  userId: uuid("user_id").references(() => users.id).notNull(),
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
  userId: uuid("user_id").references(() => users.id).notNull(),
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
  userId: uuid("user_id").references(() => users.id).notNull(),
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
  userId: uuid("user_id").references(() => users.id).notNull().unique(), // Único por usuário
  
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
  userId: uuid("user_id").references(() => users.id).notNull(),
  responses: jsonb("responses").notNull(), // Anamnesis questions and answers
  analysis: jsonb("analysis"), // AI analysis results
  recommendations: jsonb("recommendations"), // Marketing recommendations
  score: integer("score"), // Overall business health score
  completedAt: timestamp("completed_at").default(sql`now()`).notNull(),
});

// Anamnesis Analysis - Digital presence analysis
export const anamnesisAnalysis = pgTable("anamnesis_analysis", {
  id: uuid("id").primaryKey().default(sql`gen_random_uuid()`),
  userId: uuid("user_id").references(() => users.id).notNull(),
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
export const insertUserSchema = createInsertSchema(users).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
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

export const insertAnamnesisSourceSchema = createInsertSchema(anamnesisSource).omit({
  id: true,
});

export const insertAnamnesisFindingSchema = createInsertSchema(anamnesisFinding).omit({
  id: true,
});

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
  createdBy: uuid("created_by").references(() => users.id),
  isPublic: boolean("is_public").default(true).notNull(),
  isPremium: boolean("is_premium").default(false).notNull(),
  
  createdAt: timestamp("created_at").default(sql`now()`).notNull(),
  updatedAt: timestamp("updated_at").default(sql`now()`).notNull(),
});

// Campanhas personalizadas dos usuários
export const userCampaigns = pgTable("user_campaigns", {
  id: uuid("id").primaryKey().default(sql`gen_random_uuid()`),
  userId: uuid("user_id").notNull().references(() => users.id),
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

// Assets visuais
export const visualAssets = pgTable("visual_assets", {
  id: uuid("id").primaryKey().default(sql`gen_random_uuid()`),
  name: varchar("name", { length: 200 }).notNull(),
  type: text("type").notNull(), // References asset_type enum
  category: varchar("category", { length: 100 }).notNull(),
  
  // Arquivo
  url: text("url").notNull(),
  fileSize: integer("file_size"),
  dimensions: jsonb("dimensions"), // {width: 1080, height: 1080}
  
  // Variants para diferentes formatos
  variants: jsonb("variants"), // {instagram_post: 'url', instagram_story: 'url'}
  
  // Customização
  customizableElements: jsonb("customizable_elements"),
  
  // Metadata para busca
  tags: jsonb("tags").$type<string[]>(), // Array de tags
  petTypes: jsonb("pet_types").$type<string[]>(), // Array de tipos de pet
  emotions: jsonb("emotions").$type<string[]>(), // Array de emoções
  usageRights: text("usage_rights").default("free").notNull(), // References usage_rights_type enum
  
  // Performance
  usageCount: integer("usage_count").default(0).notNull(),
  avgEngagement: decimal("avg_engagement", { precision: 5, scale: 4 }),
  
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

export const insertVisualAssetSchema = createInsertSchema(visualAssets).omit({
  id: true,
  createdAt: true,
});

// Infer types
export type User = typeof users.$inferSelect;
export type InsertUser = z.infer<typeof insertUserSchema>;
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

// Campaign Library types
export type CampaignTemplate = typeof campaignTemplates.$inferSelect;
export type InsertCampaignTemplate = z.infer<typeof insertCampaignTemplateSchema>;
export type UserCampaign = typeof userCampaigns.$inferSelect;
export type InsertUserCampaign = z.infer<typeof insertUserCampaignSchema>;
export type CampaignPerformance = typeof campaignPerformance.$inferSelect;
export type InsertCampaignPerformance = z.infer<typeof insertCampaignPerformanceSchema>;
export type VisualAsset = typeof visualAssets.$inferSelect;
export type InsertVisualAsset = z.infer<typeof insertVisualAssetSchema>;
