-- Migration: Brand Onboarding
-- Description: Wizard de configuração da marca
-- Created: 2025-09-07
-- Phase: 2 - Brand Voice System

-- =============================================
-- BRAND ONBOARDING - PHASE 2
-- =============================================

-- Tabela de onboarding da marca
CREATE TABLE IF NOT EXISTS brand_onboarding (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL UNIQUE,
    tenant_id UUID REFERENCES tenants(id) ON DELETE CASCADE,
    
    -- Visual Identity
    logo_url TEXT,
    palette JSONB, -- Array de cores em hex
    logo_metadata JSONB, -- {width, height, format, hasTransparency, fileSize}
    
    -- Tom de Voz (sliders 0.0-1.0)
    tone_config JSONB NOT NULL, -- {confianca, acolhimento, humor, especializacao}
    
    -- Configuração de Linguagem
    language_config JSONB NOT NULL, -- {preferredTerms, avoidTerms, defaultCTAs}
    
    -- Valores da Marca
    brand_values JSONB, -- {mission, values, disclaimer}
    
    -- Controle do Wizard
    step_completed TEXT,
    
    -- Timestamps
    created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
    updated_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
    completed_at TIMESTAMPTZ,
    
    -- Constraints
    CONSTRAINT brand_onboarding_step_valid CHECK (step_completed IN ('logo', 'palette', 'tone', 'language', 'values', 'completed'))
);

-- Índices
CREATE INDEX IF NOT EXISTS idx_brand_onboarding_user_id ON brand_onboarding(user_id);
CREATE INDEX IF NOT EXISTS idx_brand_onboarding_tenant_id ON brand_onboarding(tenant_id);
CREATE INDEX IF NOT EXISTS idx_brand_onboarding_step ON brand_onboarding(step_completed);

-- Trigger
CREATE TRIGGER update_brand_onboarding_updated_at 
    BEFORE UPDATE ON brand_onboarding 
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Comentários
COMMENT ON TABLE brand_onboarding IS 'Wizard de configuração da marca - processo de onboarding';
COMMENT ON COLUMN brand_onboarding.tone_config IS 'Configuração do tom: {confianca: 0.0-1.0, acolhimento: 0.0-1.0, humor: 0.0-1.0, especializacao: 0.0-1.0}';
COMMENT ON COLUMN brand_onboarding.language_config IS 'Configuração de linguagem: {preferredTerms: [], avoidTerms: [], defaultCTAs: []}';

-- Log
DO $$
BEGIN
    RAISE NOTICE '🚀 Brand Onboarding criado com sucesso';
    RAISE NOTICE '✅ Wizard de configuração da marca';
END $$;