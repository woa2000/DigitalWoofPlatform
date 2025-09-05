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

// Brand Voice profiles
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

// Create insert schemas
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

// Infer types
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
