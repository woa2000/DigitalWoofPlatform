-- Migration: Anamnesis Analysis
-- Description: Análise de presença digital
-- Created: 2025-09-07
-- Phase: 2 - Anamnesis System

-- =============================================
-- ANAMNESIS ANALYSIS - PHASE 2
-- =============================================

-- Tabela principal de análise
CREATE TABLE IF NOT EXISTS anamnesis_analysis (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL,
    tenant_id UUID REFERENCES tenants(id) ON DELETE CASCADE,
    primary_url TEXT NOT NULL,
    status TEXT NOT NULL,
    score_completeness NUMERIC(5,2),
    error_message TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
    updated_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
    
    -- Constraints
    CONSTRAINT anamnesis_analysis_status_valid CHECK (status IN ('queued', 'running', 'done', 'error')),
    CONSTRAINT anamnesis_analysis_score_valid CHECK (score_completeness IS NULL OR (score_completeness >= 0 AND score_completeness <= 100))
);

-- Tabela de fontes/URLs analisadas
CREATE TABLE IF NOT EXISTS anamnesis_source (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    analysis_id UUID REFERENCES anamnesis_analysis(id) ON DELETE CASCADE NOT NULL,
    type TEXT NOT NULL,
    url TEXT NOT NULL,
    normalized_url TEXT NOT NULL,
    provider TEXT,
    last_fetched_at TIMESTAMPTZ,
    hash TEXT UNIQUE NOT NULL,
    
    -- Constraints
    CONSTRAINT anamnesis_source_type_valid CHECK (type IN ('site', 'social'))
);

-- Tabela de descobertas/resultados
CREATE TABLE IF NOT EXISTS anamnesis_finding (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    analysis_id UUID REFERENCES anamnesis_analysis(id) ON DELETE CASCADE NOT NULL,
    key TEXT NOT NULL,
    section TEXT NOT NULL,
    payload JSONB NOT NULL,
    
    -- Constraints
    CONSTRAINT anamnesis_finding_section_valid CHECK (section IN ('identity', 'personas', 'ux', 'ecosystem', 'actionPlan', 'roadmap', 'homeAnatomy', 'questions'))
);

-- Tabela de anamnese do negócio
CREATE TABLE IF NOT EXISTS business_anamnesis (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL,
    tenant_id UUID REFERENCES tenants(id) ON DELETE CASCADE,
    responses JSONB NOT NULL,
    analysis JSONB,
    recommendations JSONB,
    score INTEGER,
    completed_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
    
    -- Constraints
    CONSTRAINT business_anamnesis_score_valid CHECK (score IS NULL OR (score >= 0 AND score <= 100))
);

-- Índices
CREATE INDEX IF NOT EXISTS idx_anamnesis_analysis_user_id ON anamnesis_analysis(user_id);
CREATE INDEX IF NOT EXISTS idx_anamnesis_analysis_tenant_id ON anamnesis_analysis(tenant_id);
CREATE INDEX IF NOT EXISTS idx_anamnesis_analysis_status ON anamnesis_analysis(status);

CREATE INDEX IF NOT EXISTS idx_anamnesis_source_analysis_id ON anamnesis_source(analysis_id);
CREATE INDEX IF NOT EXISTS idx_anamnesis_source_type ON anamnesis_source(type);
CREATE INDEX IF NOT EXISTS idx_anamnesis_source_hash ON anamnesis_source(hash);

CREATE INDEX IF NOT EXISTS idx_anamnesis_finding_analysis_id ON anamnesis_finding(analysis_id);
CREATE INDEX IF NOT EXISTS idx_anamnesis_finding_section ON anamnesis_finding(section);

CREATE INDEX IF NOT EXISTS idx_business_anamnesis_user_id ON business_anamnesis(user_id);
CREATE INDEX IF NOT EXISTS idx_business_anamnesis_tenant_id ON business_anamnesis(tenant_id);

-- Triggers
CREATE TRIGGER update_anamnesis_analysis_updated_at 
    BEFORE UPDATE ON anamnesis_analysis 
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Comentários
COMMENT ON TABLE anamnesis_analysis IS 'Análise de presença digital - processo principal';
COMMENT ON TABLE anamnesis_source IS 'URLs e fontes sendo analisadas';
COMMENT ON TABLE anamnesis_finding IS 'Resultados da análise organizados por seção';
COMMENT ON TABLE business_anamnesis IS 'Anamnese do negócio com respostas e análises';

-- Log
DO $$
BEGIN
    RAISE NOTICE '🔬 Sistema de Anamnese criado com sucesso';
    RAISE NOTICE '✅ anamnesis_analysis: Análise principal';
    RAISE NOTICE '✅ anamnesis_source: URLs analisadas';
    RAISE NOTICE '✅ anamnesis_finding: Resultados por seção';
    RAISE NOTICE '✅ business_anamnesis: Anamnese do negócio';
END $$;