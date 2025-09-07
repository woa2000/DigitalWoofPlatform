-- Migration: Add Content Generation System Tables
-- Created: 2025-09-06
-- Description: Adds tables for AI content generation feature

-- Content Briefs table
CREATE TABLE IF NOT EXISTS "content_briefs" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_id" uuid NOT NULL,
	"theme" text NOT NULL,
	"objective" text NOT NULL,
	"channel" text NOT NULL,
	"format" text NOT NULL,
	"brand_voice_id" uuid NOT NULL,
	"custom_instructions" text,
	"words_to_avoid" jsonb,
	"campaign_id" uuid,
	"template_id" uuid,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);

-- Generated Content table
CREATE TABLE IF NOT EXISTS "generated_content" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"brief_id" uuid NOT NULL,
	"variations" jsonb NOT NULL,
	"creative_brief" jsonb,
	"compliance_flags" jsonb DEFAULT '[]',
	"compliance_score" numeric(3,2) NOT NULL,
	"quality_metrics" jsonb,
	"status" text DEFAULT 'generated' NOT NULL,
	"approved_variation_id" text,
	"approved_by" uuid,
	"approved_at" timestamp,
	"generation_metrics" jsonb,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);

-- Content Feedback table
CREATE TABLE IF NOT EXISTS "content_feedback" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"content_id" uuid NOT NULL,
	"variation_id" text NOT NULL,
	"feedback_type" text NOT NULL,
	"feedback_text" text,
	"rating" integer,
	"improvement_suggestions" jsonb,
	"regeneration_notes" text,
	"user_id" uuid NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL
);

-- AI Prompts table
CREATE TABLE IF NOT EXISTS "ai_prompts" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"name" varchar(200) NOT NULL,
	"prompt_type" text NOT NULL,
	"system_prompt" text NOT NULL,
	"user_prompt_template" text NOT NULL,
	"model" varchar(50) DEFAULT 'gpt-4',
	"temperature" numeric(3,2) DEFAULT 0.7,
	"max_tokens" integer DEFAULT 1000,
	"version" integer DEFAULT 1,
	"is_active" boolean DEFAULT true,
	"usage_count" integer DEFAULT 0,
	"avg_quality_score" numeric(3,2),
	"created_at" timestamp DEFAULT now() NOT NULL
);

-- Add foreign key constraints
DO $$ BEGIN
 ALTER TABLE "content_briefs" ADD CONSTRAINT "content_briefs_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "auth"."users"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
 ALTER TABLE "content_briefs" ADD CONSTRAINT "content_briefs_brand_voice_id_brand_voice_jsons_id_fk" FOREIGN KEY ("brand_voice_id") REFERENCES "brand_voice_jsons"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
 ALTER TABLE "content_briefs" ADD CONSTRAINT "content_briefs_campaign_id_campaigns_id_fk" FOREIGN KEY ("campaign_id") REFERENCES "campaigns"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
 ALTER TABLE "generated_content" ADD CONSTRAINT "generated_content_brief_id_content_briefs_id_fk" FOREIGN KEY ("brief_id") REFERENCES "content_briefs"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
 ALTER TABLE "generated_content" ADD CONSTRAINT "generated_content_approved_by_users_id_fk" FOREIGN KEY ("approved_by") REFERENCES "auth"."users"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
 ALTER TABLE "content_feedback" ADD CONSTRAINT "content_feedback_content_id_generated_content_id_fk" FOREIGN KEY ("content_id") REFERENCES "generated_content"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
 ALTER TABLE "content_feedback" ADD CONSTRAINT "content_feedback_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "auth"."users"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS "idx_content_briefs_user_id" ON "content_briefs"("user_id");
CREATE INDEX IF NOT EXISTS "idx_content_briefs_brand_voice_id" ON "content_briefs"("brand_voice_id");
CREATE INDEX IF NOT EXISTS "idx_content_briefs_campaign_id" ON "content_briefs"("campaign_id");
CREATE INDEX IF NOT EXISTS "idx_content_briefs_created_at" ON "content_briefs"("created_at");

CREATE INDEX IF NOT EXISTS "idx_generated_content_brief_id" ON "generated_content"("brief_id");
CREATE INDEX IF NOT EXISTS "idx_generated_content_status" ON "generated_content"("status");
CREATE INDEX IF NOT EXISTS "idx_generated_content_approved_by" ON "generated_content"("approved_by");
CREATE INDEX IF NOT EXISTS "idx_generated_content_created_at" ON "generated_content"("created_at");

CREATE INDEX IF NOT EXISTS "idx_content_feedback_content_id" ON "content_feedback"("content_id");
CREATE INDEX IF NOT EXISTS "idx_content_feedback_user_id" ON "content_feedback"("user_id");
CREATE INDEX IF NOT EXISTS "idx_content_feedback_feedback_type" ON "content_feedback"("feedback_type");

CREATE INDEX IF NOT EXISTS "idx_ai_prompts_prompt_type" ON "ai_prompts"("prompt_type");
CREATE INDEX IF NOT EXISTS "idx_ai_prompts_is_active" ON "ai_prompts"("is_active");

-- Add constraints
ALTER TABLE "content_briefs" ADD CONSTRAINT "chk_objective" CHECK ("objective" IN ('educar', 'vender', 'engajar', 'recall', 'awareness'));
ALTER TABLE "content_briefs" ADD CONSTRAINT "chk_channel" CHECK ("channel" IN ('instagram_post', 'instagram_story', 'facebook_post', 'whatsapp', 'email', 'website'));
ALTER TABLE "content_briefs" ADD CONSTRAINT "chk_format" CHECK ("format" IN ('texto', 'carrossel', 'video_script', 'email_campaign'));

ALTER TABLE "generated_content" ADD CONSTRAINT "chk_status" CHECK ("status" IN ('generated', 'approved', 'rejected', 'regenerated', 'published'));
ALTER TABLE "generated_content" ADD CONSTRAINT "chk_compliance_score" CHECK ("compliance_score" >= 0 AND "compliance_score" <= 1);

ALTER TABLE "content_feedback" ADD CONSTRAINT "chk_feedback_type" CHECK ("feedback_type" IN ('approval', 'rejection', 'edit_request', 'regeneration', 'rating'));
ALTER TABLE "content_feedback" ADD CONSTRAINT "chk_rating" CHECK ("rating" >= 1 AND "rating" <= 5);

ALTER TABLE "ai_prompts" ADD CONSTRAINT "chk_prompt_type" CHECK ("prompt_type" IN ('educational', 'promotional', 'recall', 'engagement', 'health_awareness'));
ALTER TABLE "ai_prompts" ADD CONSTRAINT "chk_temperature" CHECK ("temperature" >= 0 AND "temperature" <= 2);
ALTER TABLE "ai_prompts" ADD CONSTRAINT "chk_max_tokens" CHECK ("max_tokens" > 0);

-- Insert default prompts for pet industry
INSERT INTO "ai_prompts" ("name", "prompt_type", "system_prompt", "user_prompt_template", "version", "is_active") VALUES
(
  'Educational Content - Pet Health',
  'educational',
  'Você é um especialista em marketing para o setor pet brasileiro, criando conteúdo educativo de alta qualidade.

GUIDELINES:
- Use linguagem acessível mas informativa
- NUNCA prometa cura ou diagnóstico
- Sempre inclua disclaimer veterinário
- Foque no bem-estar animal
- Use "tutor" ao invés de "dono"
- Seja empático e acolhedor

COMPLIANCE OBRIGATÓRIO:
- Evite termos médicos diagnósticos
- Não prometa resultados específicos
- Inclua "consulte um veterinário" quando apropriado

Gere conteúdo em formato JSON com 3 variações.',
  'Crie conteúdo educativo sobre: {{theme}}
Brand Voice: {{brand_voice}}
Canal: {{channel}}
Público: {{target_audience}}',
  1,
  true
),
(
  'Promotional Content - Products/Services',
  'promotional',
  'Você é um especialista em marketing para o setor pet brasileiro, criando conteúdo promocional que converte.

GUIDELINES:
- Foque nos benefícios para o pet e tutor
- Use social proof quando apropriado
- Crie senso de urgência moderado
- Mantenha compliance veterinário
- Seja persuasivo mas ético

COMPLIANCE OBRIGATÓRIO:
- Não prometa resultados médicos
- Evite claims exagerados
- Use disclaimers apropriados

Gere conteúdo promocional em formato JSON com 3 variações.',
  'Crie conteúdo promocional para: {{theme}}
Produto/Serviço: {{product_service}}
Brand Voice: {{brand_voice}}
Canal: {{channel}}
Oferta especial: {{special_offer}}',
  1,
  true
),
(
  'Engagement Content - Community Building',
  'engagement',
  'Você é um especialista em marketing para o setor pet brasileiro, criando conteúdo que gera engajamento.

GUIDELINES:
- Crie conexão emocional com tutores
- Use storytelling quando apropriado
- Incentive interação e comentários
- Seja autêntico e humanizado
- Celebre a relação tutor-pet

FORMATO:
- Perguntas para engajamento
- Call-to-action claro
- Hashtags relevantes
- Tom conversacional

Gere conteúdo de engajamento em formato JSON com 3 variações.',
  'Crie conteúdo de engajamento sobre: {{theme}}
Tipo de interação: {{interaction_type}}
Brand Voice: {{brand_voice}}
Canal: {{channel}}
Ocasião: {{occasion}}',
  1,
  true
);

-- Add Row Level Security policies if needed
-- Note: RLS policies should be added based on your auth system