-- Migration: Brand Voice JSONs
-- Description: Sistema atual de Brand Voice JSON Schema v1.0
-- Created: 2025-09-07
-- Phase: 2 - Brand Voice System

-- =============================================
-- BRAND VOICE JSONS - PHASE 2
-- =============================================

-- Tabela principal do Brand Voice JSON Schema
CREATE TABLE IF NOT EXISTS brand_voice_jsons (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL,
    tenant_id UUID REFERENCES tenants(id) ON DELETE CASCADE,
    
    -- Core Schema Data
    brand_voice_json JSONB NOT NULL, -- Complete Brand Voice JSON Schema v1.0
    
    -- Extracted fields for performance
    name TEXT NOT NULL,
    version TEXT NOT NULL DEFAULT '1.0',
    status TEXT NOT NULL DEFAULT 'draft', -- draft, active, archived
    
    -- Generation tracking
    generated_from TEXT, -- onboarding, anamnesis, manual, merged
    source_analysis_id UUID, -- FK to anamnesis_analysis
    source_onboarding_id UUID REFERENCES brand_onboarding(id),
    
    -- Quality metrics
    quality_score_overall NUMERIC(5,2),
    quality_score_completeness NUMERIC(5,2),
    quality_score_consistency NUMERIC(5,2),
    quality_score_specificity NUMERIC(5,2),
    quality_score_usability NUMERIC(5,2),
    
    -- Cache and performance
    last_validated_at TIMESTAMPTZ,
    cache_key TEXT UNIQUE,
    
    -- Usage tracking
    usage_count INTEGER DEFAULT 0 NOT NULL,
    last_used_at TIMESTAMPTZ,
    
    -- Timestamps
    created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
    updated_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
    activated_at TIMESTAMPTZ,
    archived_at TIMESTAMPTZ,
    
    -- Constraints
    CONSTRAINT brand_voice_jsons_status_valid CHECK (status IN ('draft', 'active', 'archived')),
    CONSTRAINT brand_voice_jsons_generated_from_valid CHECK (generated_from IN ('onboarding', 'anamnesis', 'manual', 'merged')),
    CONSTRAINT brand_voice_jsons_quality_scores_valid CHECK (
        quality_score_overall IS NULL OR (quality_score_overall >= 0 AND quality_score_overall <= 100)
    )
);

-- Índices para performance
CREATE INDEX IF NOT EXISTS idx_brand_voice_jsons_user_id ON brand_voice_jsons(user_id);
CREATE INDEX IF NOT EXISTS idx_brand_voice_jsons_tenant_id ON brand_voice_jsons(tenant_id);
CREATE INDEX IF NOT EXISTS idx_brand_voice_jsons_status ON brand_voice_jsons(status);
CREATE INDEX IF NOT EXISTS idx_brand_voice_jsons_generated_from ON brand_voice_jsons(generated_from);
CREATE INDEX IF NOT EXISTS idx_brand_voice_jsons_cache_key ON brand_voice_jsons(cache_key);
CREATE INDEX IF NOT EXISTS idx_brand_voice_jsons_quality_overall ON brand_voice_jsons(quality_score_overall);

-- Índice GIN para busca no JSON
CREATE INDEX IF NOT EXISTS idx_brand_voice_jsons_json_search ON brand_voice_jsons USING GIN (brand_voice_json);

-- Trigger
CREATE TRIGGER update_brand_voice_jsons_updated_at 
    BEFORE UPDATE ON brand_voice_jsons 
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Comentários
COMMENT ON TABLE brand_voice_jsons IS 'Sistema atual de Brand Voice JSON Schema v1.0 - perfis completos de marca';
COMMENT ON COLUMN brand_voice_jsons.brand_voice_json IS 'Schema completo do Brand Voice em formato JSON';
COMMENT ON COLUMN brand_voice_jsons.cache_key IS 'Chave única para cache Redis';
COMMENT ON COLUMN brand_voice_jsons.usage_count IS 'Número de vezes que foi usado para geração de conteúdo';

-- Log
DO $$
BEGIN
    RAISE NOTICE '🎨 Brand Voice JSONs criado com sucesso';
    RAISE NOTICE '✅ Sistema completo de Brand Voice Schema v1.0';
END $$;