import { sql } from "drizzle-orm";
import { pgTable, text, varchar, timestamp, jsonb, integer, decimal, boolean, uuid } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

// ==========================================
// USERS TABLE (Local - sem dependência do Supabase Auth schema)
// ==========================================

export const users = pgTable("users", {
  id: uuid("id").primaryKey().default(sql`gen_random_uuid()`),
  email: text("email").unique().notNull(),
  name: text("name"),
  businessType: text("business_type"), // veterinaria, petshop, hotel, etc.
  businessName: text("business_name"),
  password: text("password"), // Hash da senha
  createdAt: timestamp("created_at").default(sql`now()`),
  updatedAt: timestamp("updated_at").default(sql`now()`),
});

// ==========================================
// BRAND VOICES
// ==========================================

export const brandVoices = pgTable("brand_voices", {
  id: uuid("id").primaryKey().default(sql`gen_random_uuid()`),
  userId: uuid("user_id").references(() => users.id).notNull(),
  name: text("name").notNull(),
  tone: text("tone").notNull(), // profissional-amigavel, casual, formal, etc.
  persona: jsonb("persona").notNull(), // Demographics, psychographics
  values: jsonb("values").notNull().default("[]"), // Array of values
  guidelines: jsonb("guidelines").notNull(), // Do's and Don'ts
  isActive: boolean("is_active").default(true),
  createdAt: timestamp("created_at").default(sql`now()`),
  updatedAt: timestamp("updated_at").default(sql`now()`),
});

// ==========================================
// CAMPAIGNS
// ==========================================

export const campaigns = pgTable("campaigns", {
  id: uuid("id").primaryKey().default(sql`gen_random_uuid()`),
  userId: uuid("user_id").references(() => users.id).notNull(),
  name: text("name").notNull(),
  type: text("type").notNull(), // checkup_preventivo, programa_vip, etc.
  status: text("status").notNull().default("ativa"), // ativa, pausada, concluida, em_teste
  channels: jsonb("channels").notNull().default("[]"), // instagram, email, whatsapp, etc.
  targetAudience: jsonb("target_audience"), // Demographics and interests
  metrics: jsonb("metrics").default("{}"), // leads, conversions, engagement, etc.
  createdAt: timestamp("created_at").default(sql`now()`),
  updatedAt: timestamp("updated_at").default(sql`now()`),
});

// ==========================================
// AI CONTENT
// ==========================================

export const aiContent = pgTable("ai_content", {
  id: uuid("id").primaryKey().default(sql`gen_random_uuid()`),
  userId: uuid("user_id").references(() => users.id).notNull(),
  campaignId: uuid("campaign_id").references(() => campaigns.id),
  brandVoiceId: uuid("brand_voice_id").references(() => brandVoices.id),
  title: text("title").notNull(),
  content: text("content").notNull(),
  contentType: text("content_type").notNull(), // post, email, whatsapp, etc.
  platform: text("platform"), // instagram, facebook, linkedin, etc.
  complianceStatus: text("compliance_status").default("pending"), // pending, approved, rejected
  complianceScore: decimal("compliance_score"),
  humanReviewRequired: boolean("human_review_required").default(false),
  isPublished: boolean("is_published").default(false),
  publishedAt: timestamp("published_at"),
  createdAt: timestamp("created_at").default(sql`now()`),
});

// ==========================================
// COMPLIANCE CHECKS
// ==========================================

export const complianceChecks = pgTable("compliance_checks", {
  id: uuid("id").primaryKey().default(sql`gen_random_uuid()`),
  contentId: uuid("content_id").references(() => aiContent.id).notNull(),
  ruleType: text("rule_type").notNull(), // medical, promotional, legal
  ruleName: text("rule_name").notNull(),
  passed: boolean("passed").notNull(),
  severity: text("severity").notNull(), // low, medium, high, critical
  message: text("message"),
  suggestion: text("suggestion"),
  createdAt: timestamp("created_at").default(sql`now()`),
});

// ==========================================
// BRAND ASSETS
// ==========================================

export const brandAssets = pgTable("brand_assets", {
  id: uuid("id").primaryKey().default(sql`gen_random_uuid()`),
  userId: uuid("user_id").references(() => users.id).notNull(),
  name: text("name").notNull(),
  type: text("type").notNull(), // logo, image, video, document
  url: text("url").notNull(),
  size: integer("size"), // File size in bytes
  metadata: jsonb("metadata").default("{}"), // Additional metadata
  createdAt: timestamp("created_at").default(sql`now()`),
});

// ==========================================
// BUSINESS ANAMNESIS
// ==========================================

export const businessAnamnesis = pgTable("business_anamnesis", {
  id: uuid("id").primaryKey().default(sql`gen_random_uuid()`),
  userId: uuid("user_id").references(() => users.id).notNull(),
  businessType: text("business_type").notNull(),
  responses: jsonb("responses").notNull(), // Respostas do questionário
  analysis: jsonb("analysis").default("{}"), // Análise gerada pela IA
  recommendations: jsonb("recommendations").default("{}"), // Recomendações
  score: decimal("score"), // Score geral da análise
  completedAt: timestamp("completed_at").default(sql`now()`),
});

// ==========================================
// VALIDATION SCHEMAS
// ==========================================

export const insertUserSchema = createInsertSchema(users).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
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

export const insertBusinessAnamnesisSchema = createInsertSchema(businessAnamnesis).omit({
  id: true,
  completedAt: true,
});

// ==========================================
// TYPE EXPORTS
// ==========================================

export type User = typeof users.$inferSelect;
export type InsertUser = z.infer<typeof insertUserSchema>;

export type BrandVoice = typeof brandVoices.$inferSelect;
export type InsertBrandVoice = z.infer<typeof insertBrandVoiceSchema>;

export type Campaign = typeof campaigns.$inferSelect;
export type InsertCampaign = z.infer<typeof insertCampaignSchema>;

export type AIContent = typeof aiContent.$inferSelect;
export type InsertAIContent = z.infer<typeof insertAIContentSchema>;

export type ComplianceCheck = typeof complianceChecks.$inferSelect;
export type InsertComplianceCheck = z.infer<typeof insertComplianceCheckSchema>;

export type BrandAsset = typeof brandAssets.$inferSelect;
export type InsertBrandAsset = z.infer<typeof insertBrandAssetSchema>;

export type BusinessAnamnesis = typeof businessAnamnesis.$inferSelect;
export type InsertBusinessAnamnesis = z.infer<typeof insertBusinessAnamnesisSchema>;