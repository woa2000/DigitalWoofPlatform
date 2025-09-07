-- Migration: Brand Onboarding Table
-- Created: 2025-09-05
-- Description: Wizard de onboarding para configuração da identidade de marca

CREATE TABLE IF NOT EXISTS "brand_onboarding" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_id" uuid NOT NULL UNIQUE,
	"logo_url" text,
	"palette" jsonb,
	"logo_metadata" jsonb,
	"tone_config" jsonb NOT NULL,
	"language_config" jsonb NOT NULL,
	"brand_values" jsonb,
	"step_completed" text,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL,
	"completed_at" timestamp,
	CONSTRAINT "brand_onboarding_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE cascade ON UPDATE no action
);

-- Create unique index on user_id to ensure one onboarding per user
CREATE UNIQUE INDEX IF NOT EXISTS "brand_onboarding_user_id_unique" ON "brand_onboarding" ("user_id");

-- Create index on step_completed for progress tracking
CREATE INDEX IF NOT EXISTS "brand_onboarding_step_completed_idx" ON "brand_onboarding" ("step_completed");

-- Create index on completed_at for analytics
CREATE INDEX IF NOT EXISTS "brand_onboarding_completed_at_idx" ON "brand_onboarding" ("completed_at");

-- Add RLS (Row Level Security) policy
ALTER TABLE "brand_onboarding" ENABLE ROW LEVEL SECURITY;

-- Policy: Users can only see their own onboarding data
CREATE POLICY "brand_onboarding_user_isolation" ON "brand_onboarding"
    FOR ALL
    USING (user_id = auth.uid());

-- Create trigger for updated_at
CREATE OR REPLACE FUNCTION update_brand_onboarding_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_brand_onboarding_updated_at
    BEFORE UPDATE ON "brand_onboarding"
    FOR EACH ROW
    EXECUTE FUNCTION update_brand_onboarding_updated_at();

-- Add comments for documentation
COMMENT ON TABLE "brand_onboarding" IS 'Wizard de configuração da identidade de marca - dados do onboarding';
COMMENT ON COLUMN "brand_onboarding"."palette" IS 'Array de cores em formato hex extraídas da logo';
COMMENT ON COLUMN "brand_onboarding"."tone_config" IS 'Configuração dos 4 sliders de personalidade (0.0-1.0)';
COMMENT ON COLUMN "brand_onboarding"."language_config" IS 'Termos preferidos, evitados e CTAs padrão';
COMMENT ON COLUMN "brand_onboarding"."brand_values" IS 'Missão, valores da marca e disclaimer';
COMMENT ON COLUMN "brand_onboarding"."step_completed" IS 'Último step completado no wizard';