-- Migration: AI Content System
-- Description: Sistema completo de geração de conteúdo por IA
-- Created: 2025-09-07
-- Phase: 2 - AI Content System

-- =============================================
-- AI CONTENT SYSTEM - PHASE 2
-- =============================================

-- Templates e configurações de prompts de IA
CREATE TABLE IF NOT EXISTS ai_prompts (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(200) NOT NULL,
    prompt_type TEXT NOT NULL,
    system_prompt TEXT NOT NULL,
    user_prompt_template TEXT NOT NULL,
    model VARCHAR(50) DEFAULT 'gpt-4',
    temperature NUMERIC(3,2) DEFAULT 0.7,
    max_tokens INTEGER DEFAULT 1000,
    version INTEGER DEFAULT 1,
    is_active BOOLEAN DEFAULT true,
    usage_count INTEGER DEFAULT 0,
    avg_quality_score NUMERIC(3,2),
    created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
    
    -- Constraints
    CONSTRAINT ai_prompts_name_length CHECK (char_length(name) >= 1 AND char_length(name) <= 200),
    CONSTRAINT ai_prompts_prompt_type_valid CHECK (prompt_type IN ('educational', 'promotional', 'recall', 'engagement', 'health_awareness')),
    CONSTRAINT ai_prompts_temperature_range CHECK (temperature >= 0 AND temperature <= 2),
    CONSTRAINT ai_prompts_max_tokens_positive CHECK (max_tokens > 0),
    CONSTRAINT ai_prompts_version_positive CHECK (version > 0),
    CONSTRAINT ai_prompts_usage_count_positive CHECK (usage_count >= 0)
);

-- Especificações para geração de conteúdo
CREATE TABLE IF NOT EXISTS content_briefs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL,
    tenant_id UUID REFERENCES tenants(id) ON DELETE CASCADE,
    theme TEXT NOT NULL,
    objective TEXT NOT NULL,
    channel TEXT NOT NULL,
    format TEXT NOT NULL,
    brand_voice_id UUID REFERENCES brand_voice_jsons(id) NOT NULL,
    custom_instructions TEXT,
    words_to_avoid JSONB,
    campaign_id UUID REFERENCES campaigns(id),
    template_id UUID,
    created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
    updated_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
    
    -- Constraints
    CONSTRAINT content_briefs_objective_valid CHECK (objective IN ('educar', 'vender', 'engajar', 'recall', 'awareness')),
    CONSTRAINT content_briefs_channel_valid CHECK (channel IN ('instagram_post', 'instagram_story', 'facebook_post', 'whatsapp', 'email', 'website')),
    CONSTRAINT content_briefs_format_valid CHECK (format IN ('texto', 'carrossel', 'video_script', 'email_campaign'))
);

-- Conteúdo gerado com variações
CREATE TABLE IF NOT EXISTS generated_content (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    brief_id UUID REFERENCES content_briefs(id) ON DELETE CASCADE NOT NULL,
    variations JSONB NOT NULL,
    creative_brief JSONB,
    compliance_flags JSONB DEFAULT '[]',
    compliance_score NUMERIC(3,2) NOT NULL,
    quality_metrics JSONB,
    status TEXT DEFAULT 'generated' NOT NULL,
    approved_variation_id TEXT,
    approved_by UUID,
    approved_at TIMESTAMPTZ,
    generation_metrics JSONB,
    created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
    updated_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
    
    -- Constraints
    CONSTRAINT generated_content_status_valid CHECK (status IN ('generated', 'approved', 'rejected', 'regenerated', 'published')),
    CONSTRAINT generated_content_compliance_score_range CHECK (compliance_score >= 0 AND compliance_score <= 1)
);

-- Conteúdo gerado por IA (tabela principal)
CREATE TABLE IF NOT EXISTS ai_content (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL,
    tenant_id UUID REFERENCES tenants(id) ON DELETE CASCADE,
    campaign_id UUID REFERENCES campaigns(id),
    type TEXT NOT NULL,
    platform TEXT,
    title TEXT,
    content TEXT NOT NULL,
    hashtags JSONB,
    visual_suggestions JSONB,
    prompt_used TEXT,
    ai_model TEXT,
    generation_params JSONB,
    status TEXT DEFAULT 'draft',
    approval_status TEXT DEFAULT 'pending',
    scheduled_date TIMESTAMPTZ,
    published_date TIMESTAMPTZ,
    engagement_metrics JSONB,
    created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
    updated_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
    
    -- Constraints
    CONSTRAINT ai_content_type_valid CHECK (type IN ('post_instagram', 'email', 'whatsapp_template', 'story_instagram', 'post_facebook')),
    CONSTRAINT ai_content_status_valid CHECK (status IN ('draft', 'scheduled', 'published', 'archived')),
    CONSTRAINT ai_content_approval_status_valid CHECK (approval_status IN ('pending', 'approved', 'rejected', 'needs_review'))
);

-- Feedback para melhoria da IA
CREATE TABLE IF NOT EXISTS content_feedback (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    content_id UUID REFERENCES generated_content(id) ON DELETE CASCADE NOT NULL,
    variation_id TEXT NOT NULL,
    feedback_type TEXT NOT NULL,
    feedback_text TEXT,
    rating INTEGER,
    improvement_suggestions JSONB,
    regeneration_notes TEXT,
    user_id UUID NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
    
    -- Constraints
    CONSTRAINT content_feedback_type_valid CHECK (feedback_type IN ('approval', 'rejection', 'edit_request', 'regeneration', 'rating')),
    CONSTRAINT content_feedback_rating_range CHECK (rating IS NULL OR (rating >= 1 AND rating <= 5))
);

-- Verificações de compliance automáticas
CREATE TABLE IF NOT EXISTS compliance_checks (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    content_id UUID REFERENCES ai_content(id) ON DELETE CASCADE NOT NULL,
    category TEXT NOT NULL,
    severity TEXT NOT NULL,
    rule TEXT NOT NULL,
    passed BOOLEAN NOT NULL,
    message TEXT,
    suggestion TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
    
    -- Constraints
    CONSTRAINT compliance_checks_category_valid CHECK (category IN ('medical', 'promotional', 'safety', 'legal', 'ethical')),
    CONSTRAINT compliance_checks_severity_valid CHECK (severity IN ('critical', 'high', 'medium', 'low'))
);

-- Índices para performance
CREATE INDEX IF NOT EXISTS idx_ai_prompts_prompt_type ON ai_prompts(prompt_type);
CREATE INDEX IF NOT EXISTS idx_ai_prompts_is_active ON ai_prompts(is_active);

CREATE INDEX IF NOT EXISTS idx_content_briefs_user_id ON content_briefs(user_id);
CREATE INDEX IF NOT EXISTS idx_content_briefs_tenant_id ON content_briefs(tenant_id);
CREATE INDEX IF NOT EXISTS idx_content_briefs_brand_voice_id ON content_briefs(brand_voice_id);
CREATE INDEX IF NOT EXISTS idx_content_briefs_campaign_id ON content_briefs(campaign_id);

CREATE INDEX IF NOT EXISTS idx_generated_content_brief_id ON generated_content(brief_id);
CREATE INDEX IF NOT EXISTS idx_generated_content_status ON generated_content(status);

CREATE INDEX IF NOT EXISTS idx_ai_content_user_id ON ai_content(user_id);
CREATE INDEX IF NOT EXISTS idx_ai_content_tenant_id ON ai_content(tenant_id);
CREATE INDEX IF NOT EXISTS idx_ai_content_campaign_id ON ai_content(campaign_id);
CREATE INDEX IF NOT EXISTS idx_ai_content_status ON ai_content(status);
CREATE INDEX IF NOT EXISTS idx_ai_content_type ON ai_content(type);

CREATE INDEX IF NOT EXISTS idx_content_feedback_content_id ON content_feedback(content_id);
CREATE INDEX IF NOT EXISTS idx_content_feedback_user_id ON content_feedback(user_id);

CREATE INDEX IF NOT EXISTS idx_compliance_checks_content_id ON compliance_checks(content_id);
CREATE INDEX IF NOT EXISTS idx_compliance_checks_category ON compliance_checks(category);
CREATE INDEX IF NOT EXISTS idx_compliance_checks_severity ON compliance_checks(severity);

-- Triggers
CREATE TRIGGER update_content_briefs_updated_at 
    BEFORE UPDATE ON content_briefs 
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_generated_content_updated_at 
    BEFORE UPDATE ON generated_content 
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_ai_content_updated_at 
    BEFORE UPDATE ON ai_content 
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Comentários
COMMENT ON TABLE ai_prompts IS 'Templates e configurações de prompts de IA';
COMMENT ON TABLE content_briefs IS 'Especificações para geração de conteúdo';
COMMENT ON TABLE generated_content IS 'Conteúdo gerado com variações e métricas';
COMMENT ON TABLE ai_content IS 'Conteúdo gerado por IA - tabela principal';
COMMENT ON TABLE content_feedback IS 'Feedback dos usuários para melhoria da IA';
COMMENT ON TABLE compliance_checks IS 'Verificações automáticas de compliance';

-- Log
DO $$
BEGIN
    RAISE NOTICE '🤖 Sistema de IA e Conteúdo criado com sucesso';
    RAISE NOTICE '✅ ai_prompts: Templates de prompts';
    RAISE NOTICE '✅ content_briefs: Especificações de conteúdo';
    RAISE NOTICE '✅ generated_content: Conteúdo com variações';
    RAISE NOTICE '✅ ai_content: Conteúdo principal';
    RAISE NOTICE '✅ content_feedback: Feedback para IA';
    RAISE NOTICE '✅ compliance_checks: Verificações de compliance';
END $$;