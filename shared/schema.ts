import { sql } from "drizzle-orm";
import { pgTable, pgSchema, text, varchar, timestamp, jsonb, integer, decimal, boolean, uuid } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

// Reference to Supabase auth schema
export const authSchema = pgSchema("auth");

// Reference to Supabase auth.users table
// This table is managed by Supabase Auth and contains user authentication data
export const authUsers = authSchema.table("users", {
  id: uuid("id").primaryKey(),
  email: text("email"),
  rawUserMetaData: jsonb("raw_user_meta_data"),
  createdAt: timestamp("created_at"),
  updatedAt: timestamp("updated_at"),
});

// Brand Voice profiles (legacy - deprecated in favor of brandVoiceJsons)
export const brandVoices = pgTable("brand_voices", {
  id: uuid("id").primaryKey().default(sql`gen_random_uuid()`),
  userId: uuid("user_id").references(() => authUsers.id).notNull(),
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
  userId: uuid("user_id").references(() => authUsers.id).notNull(),
  
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
  userId: uuid("user_id").references(() => authUsers.id).notNull(),
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
  userId: uuid("user_id").references(() => authUsers.id).notNull(),
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
  userId: uuid("user_id").references(() => authUsers.id).notNull(),
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
  userId: uuid("user_id").references(() => authUsers.id).notNull().unique(), // Único por usuário
  
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
  userId: uuid("user_id").references(() => authUsers.id).notNull(),
  responses: jsonb("responses").notNull(), // Anamnesis questions and answers
  analysis: jsonb("analysis"), // AI analysis results
  recommendations: jsonb("recommendations"), // Marketing recommendations
  score: integer("score"), // Overall business health score
  completedAt: timestamp("completed_at").default(sql`now()`).notNull(),
});

// Anamnesis Analysis - Digital presence analysis
export const anamnesisAnalysis = pgTable("anamnesis_analysis", {
  id: uuid("id").primaryKey().default(sql`gen_random_uuid()`),
  userId: uuid("user_id").references(() => authUsers.id).notNull(),
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
  userId: uuid("user_id").references(() => authUsers.id).notNull(),
  
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
  approvedBy: uuid("approved_by").references(() => authUsers.id),
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
  userId: uuid("user_id").references(() => authUsers.id).notNull(),
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

// User metadata type for raw_user_meta_data in auth.users
export type UserMetadata = {
  name?: string;
  business_type?: 'veterinaria' | 'petshop' | 'banho_tosa' | 'hotel_pet';
  business_name?: string;
};

// Infer types
export type AuthUser = typeof authUsers.$inferSelect;
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
