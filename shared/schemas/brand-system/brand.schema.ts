import { pgTable, uuid, text, timestamp, jsonb, boolean, integer } from 'drizzle-orm/pg-core';
import { createInsertSchema, createSelectSchema } from 'drizzle-zod';
import { z } from 'zod';
import { tenantsTable } from '../tenant-system/tenants.schema';

/**
 * Schema da tabela brand_onboarding - Processo de Onboarding da Marca
 */
export const brandOnboardingTable = pgTable('brand_onboarding', {
  id: uuid('id').primaryKey().defaultRandom(),
  tenantId: uuid('tenant_id').notNull().references(() => tenantsTable.id, { onDelete: 'cascade' }),
  userId: uuid('user_id').notNull(),
  brandName: text('brand_name'),
  brandDescription: text('brand_description'),
  targetAudience: text('target_audience'),
  businessGoals: jsonb('business_goals').$type<string[]>(),
  competitorAnalysis: jsonb('competitor_analysis').$type<Record<string, any>>(),
  currentStage: text('current_stage').$type<'basic_info' | 'audience' | 'goals' | 'competitors' | 'voice' | 'assets' | 'completed'>().default('basic_info'),
  completionPercentage: integer('completion_percentage').default(0),
  status: text('status').$type<'draft' | 'in_progress' | 'review' | 'completed' | 'archived'>().default('draft'),
  onboardingData: jsonb('onboarding_data').$type<Record<string, any>>(),
  completedSteps: jsonb('completed_steps').$type<string[]>().default([]),
  createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
  updatedAt: timestamp('updated_at', { withTimezone: true }).defaultNow().notNull(),
  completedAt: timestamp('completed_at', { withTimezone: true }),
});

/**
 * Schema da tabela brand_voice_jsons - Brand Voice em formato JSON
 */
export const brandVoiceJsonsTable = pgTable('brand_voice_jsons', {
  id: uuid('id').primaryKey().defaultRandom(),
  tenantId: uuid('tenant_id').notNull().references(() => tenantsTable.id, { onDelete: 'cascade' }),
  userId: uuid('user_id').notNull(),
  brandName: text('brand_name').notNull(),
  version: text('version').default('1.0'),
  status: text('status').$type<'draft' | 'active' | 'archived' | 'deprecated'>().default('draft'),
  brandVoiceData: jsonb('brand_voice_data').$type<Record<string, any>>().notNull(),
  isActive: boolean('is_active').default(false),
  metadata: jsonb('metadata').$type<Record<string, any>>(),
  generatedBy: text('generated_by').$type<'manual' | 'ai_assisted' | 'imported'>().default('manual'),
  validationScore: integer('validation_score'),
  createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
  updatedAt: timestamp('updated_at', { withTimezone: true }).defaultNow().notNull(),
  publishedAt: timestamp('published_at', { withTimezone: true }),
});

// Schemas de validação Zod para brand_onboarding
export const insertBrandOnboardingSchema = createInsertSchema(brandOnboardingTable, {
  tenantId: z.string().uuid('ID do tenant deve ser um UUID válido'),
  userId: z.string().uuid('ID do usuário deve ser um UUID válido'),
  brandName: z.string().min(1, 'Nome da marca é obrigatório').max(100).optional(),
  brandDescription: z.string().max(1000).optional(),
  targetAudience: z.string().max(500).optional(),
  currentStage: z.enum(['basic_info', 'audience', 'goals', 'competitors', 'voice', 'assets', 'completed']),
  completionPercentage: z.number().min(0).max(100),
  status: z.enum(['draft', 'in_progress', 'review', 'completed', 'archived']),
});

export const selectBrandOnboardingSchema = createSelectSchema(brandOnboardingTable);
export const updateBrandOnboardingSchema = insertBrandOnboardingSchema.partial().omit({ id: true });

// Schemas de validação Zod para brand_voice_jsons
export const insertBrandVoiceJsonSchema = createInsertSchema(brandVoiceJsonsTable, {
  tenantId: z.string().uuid('ID do tenant deve ser um UUID válido'),
  userId: z.string().uuid('ID do usuário deve ser um UUID válido'),
  brandName: z.string().min(1, 'Nome da marca é obrigatório').max(100),
  version: z.string().regex(/^\d+\.\d+$/, 'Versão deve seguir o formato x.y'),
  status: z.enum(['draft', 'active', 'archived', 'deprecated']),
  generatedBy: z.enum(['manual', 'ai_assisted', 'imported']),
  validationScore: z.number().min(0).max(100).optional(),
});

export const selectBrandVoiceJsonSchema = createSelectSchema(brandVoiceJsonsTable);
export const updateBrandVoiceJsonSchema = insertBrandVoiceJsonSchema.partial().omit({ id: true });

// Tipos TypeScript
export type BrandOnboarding = typeof brandOnboardingTable.$inferSelect;
export type NewBrandOnboarding = typeof brandOnboardingTable.$inferInsert;
export type UpdateBrandOnboarding = Partial<Omit<NewBrandOnboarding, 'id' | 'createdAt' | 'updatedAt'>>;

export type BrandVoiceJson = typeof brandVoiceJsonsTable.$inferSelect;
export type NewBrandVoiceJson = typeof brandVoiceJsonsTable.$inferInsert;
export type UpdateBrandVoiceJson = Partial<Omit<NewBrandVoiceJson, 'id' | 'createdAt' | 'updatedAt'>>;

// Schema específico para Brand Voice JSON v1.0
export const brandVoiceV1Schema = z.object({
  version: z.literal('1.0'),
  brand: z.object({
    name: z.string(),
    description: z.string(),
    industry: z.string(),
    targetAudience: z.object({
      primary: z.string(),
      demographics: z.object({
        ageRange: z.string(),
        location: z.string(),
        interests: z.array(z.string()),
      }),
    }),
  }),
  voice: z.object({
    personality: z.object({
      traits: z.array(z.string()),
      archetype: z.string(),
    }),
    tone: z.object({
      formal: z.number().min(1).max(5),
      friendly: z.number().min(1).max(5),
      expert: z.number().min(1).max(5),
      playful: z.number().min(1).max(5),
    }),
    language: z.object({
      vocabulary: z.object({
        preferred: z.array(z.string()),
        avoid: z.array(z.string()),
      }),
      style: z.object({
        sentenceLength: z.enum(['short', 'medium', 'long', 'varied']),
        punctuation: z.enum(['minimal', 'standard', 'expressive']),
      }),
    }),
  }),
  messaging: z.object({
    valueProposition: z.string(),
    keyMessages: z.array(z.string()),
    callToAction: z.object({
      primary: z.string(),
      variations: z.array(z.string()),
    }),
  }),
  content: z.object({
    themes: z.array(z.string()),
    formats: z.array(z.string()),
    guidelines: z.object({
      dos: z.array(z.string()),
      donts: z.array(z.string()),
    }),
  }),
  compliance: z.object({
    industry: z.array(z.string()),
    legal: z.array(z.string()),
    ethical: z.array(z.string()),
  }),
});

// Schema para dados de onboarding
export const onboardingDataSchema = z.object({
  basicInfo: z.object({
    brandName: z.string().optional(),
    description: z.string().optional(),
    website: z.string().url().optional(),
    industry: z.string().optional(),
  }).optional(),
  audience: z.object({
    primary: z.string().optional(),
    secondary: z.string().optional(),
    demographics: z.object({
      ageRange: z.string().optional(),
      location: z.array(z.string()).optional(),
      interests: z.array(z.string()).optional(),
      painPoints: z.array(z.string()).optional(),
    }).optional(),
  }).optional(),
  goals: z.object({
    business: z.array(z.string()).optional(),
    marketing: z.array(z.string()).optional(),
    content: z.array(z.string()).optional(),
    metrics: z.array(z.string()).optional(),
  }).optional(),
  competitors: z.object({
    direct: z.array(z.object({
      name: z.string(),
      website: z.string().url().optional(),
      strengths: z.array(z.string()).optional(),
      weaknesses: z.array(z.string()).optional(),
    })).optional(),
    indirect: z.array(z.string()).optional(),
  }).optional(),
  voice: z.object({
    personality: z.array(z.string()).optional(),
    tone: z.object({
      formal: z.number().min(1).max(5).optional(),
      friendly: z.number().min(1).max(5).optional(),
      expert: z.number().min(1).max(5).optional(),
      playful: z.number().min(1).max(5).optional(),
    }).optional(),
    examples: z.object({
      good: z.array(z.string()).optional(),
      bad: z.array(z.string()).optional(),
    }).optional(),
  }).optional(),
  assets: z.object({
    logo: z.string().url().optional(),
    colors: z.object({
      primary: z.string().optional(),
      secondary: z.string().optional(),
      accent: z.string().optional(),
    }).optional(),
    fonts: z.object({
      primary: z.string().optional(),
      secondary: z.string().optional(),
    }).optional(),
    images: z.array(z.string().url()).optional(),
  }).optional(),
});