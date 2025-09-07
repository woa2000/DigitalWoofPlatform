-- Migration: Campaigns System
-- Description: Sistema completo de campanhas de marketing
-- Created: 2025-09-07
-- Phase: 2 - Campaigns System

-- =============================================
-- CAMPAIGNS SYSTEM - PHASE 2
-- =============================================

-- Tabela principal de campanhas
CREATE TABLE IF NOT EXISTS campaigns (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL,
    tenant_id UUID REFERENCES tenants(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    type TEXT NOT NULL,
    status TEXT NOT NULL,
    channels JSONB NOT NULL,
    target_audience JSONB NOT NULL,
    metrics JSONB,
    created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
    updated_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
    
    -- Constraints
    CONSTRAINT campaigns_name_length CHECK (char_length(name) >= 1 AND char_length(name) <= 200),
    CONSTRAINT campaigns_status_valid CHECK (status IN ('ativa', 'em_teste', 'pausada', 'finalizada'))
);

-- Templates de campanhas pré-definidas
CREATE TABLE IF NOT EXISTS campaign_templates (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(200) NOT NULL,
    description TEXT,
    category TEXT NOT NULL,
    service_type TEXT NOT NULL,
    content_pieces JSONB NOT NULL,
    visual_assets JSONB,
    customization_options JSONB,
    usage_count INTEGER DEFAULT 0 NOT NULL,
    avg_engagement_rate NUMERIC(5,4),
    avg_conversion_rate NUMERIC(5,4),
    success_cases INTEGER DEFAULT 0 NOT NULL,
    seasonality JSONB,
    created_by UUID,
    is_public BOOLEAN DEFAULT true NOT NULL,
    is_premium BOOLEAN DEFAULT false NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
    updated_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
    
    -- Constraints
    CONSTRAINT campaign_templates_name_length CHECK (char_length(name) >= 1 AND char_length(name) <= 200),
    CONSTRAINT campaign_templates_usage_count_positive CHECK (usage_count >= 0),
    CONSTRAINT campaign_templates_success_cases_positive CHECK (success_cases >= 0)
);

-- Campanhas personalizadas dos usuários
CREATE TABLE IF NOT EXISTS user_campaigns (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL,
    tenant_id UUID REFERENCES tenants(id) ON DELETE CASCADE,
    template_id UUID REFERENCES campaign_templates(id),
    brand_voice_id UUID REFERENCES brand_voice_jsons(id),
    campaign_config JSONB NOT NULL,
    personalized_content JSONB NOT NULL,
    status TEXT DEFAULT 'draft' NOT NULL,
    scheduled_at TIMESTAMPTZ,
    published_at TIMESTAMPTZ,
    performance_metrics JSONB,
    created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
    updated_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
    
    -- Constraints
    CONSTRAINT user_campaigns_status_valid CHECK (status IN ('draft', 'scheduled', 'published', 'paused', 'completed'))
);

-- Performance das campanhas
CREATE TABLE IF NOT EXISTS campaign_performance (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    campaign_id UUID NOT NULL REFERENCES user_campaigns(id) ON DELETE CASCADE,
    template_id UUID NOT NULL REFERENCES campaign_templates(id),
    channel VARCHAR(50) NOT NULL,
    impressions INTEGER DEFAULT 0 NOT NULL,
    reaches INTEGER DEFAULT 0 NOT NULL,
    clicks INTEGER DEFAULT 0 NOT NULL,
    conversions INTEGER DEFAULT 0 NOT NULL,
    engagement_rate NUMERIC(5,4),
    click_through_rate NUMERIC(5,4),
    conversion_rate NUMERIC(5,4),
    measured_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
    
    -- Constraints
    CONSTRAINT campaign_performance_metrics_positive CHECK (
        impressions >= 0 AND reaches >= 0 AND clicks >= 0 AND conversions >= 0
    )
);

-- Índices
CREATE INDEX IF NOT EXISTS idx_campaigns_user_id ON campaigns(user_id);
CREATE INDEX IF NOT EXISTS idx_campaigns_tenant_id ON campaigns(tenant_id);
CREATE INDEX IF NOT EXISTS idx_campaigns_status ON campaigns(status);
CREATE INDEX IF NOT EXISTS idx_campaigns_type ON campaigns(type);

CREATE INDEX IF NOT EXISTS idx_campaign_templates_category ON campaign_templates(category);
CREATE INDEX IF NOT EXISTS idx_campaign_templates_service_type ON campaign_templates(service_type);
CREATE INDEX IF NOT EXISTS idx_campaign_templates_is_public ON campaign_templates(is_public);
CREATE INDEX IF NOT EXISTS idx_campaign_templates_is_premium ON campaign_templates(is_premium);

CREATE INDEX IF NOT EXISTS idx_user_campaigns_user_id ON user_campaigns(user_id);
CREATE INDEX IF NOT EXISTS idx_user_campaigns_tenant_id ON user_campaigns(tenant_id);
CREATE INDEX IF NOT EXISTS idx_user_campaigns_template_id ON user_campaigns(template_id);
CREATE INDEX IF NOT EXISTS idx_user_campaigns_status ON user_campaigns(status);

CREATE INDEX IF NOT EXISTS idx_campaign_performance_campaign_id ON campaign_performance(campaign_id);
CREATE INDEX IF NOT EXISTS idx_campaign_performance_channel ON campaign_performance(channel);

-- Triggers
CREATE TRIGGER update_campaigns_updated_at 
    BEFORE UPDATE ON campaigns 
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_campaign_templates_updated_at 
    BEFORE UPDATE ON campaign_templates 
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_user_campaigns_updated_at 
    BEFORE UPDATE ON user_campaigns 
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Comentários
COMMENT ON TABLE campaigns IS 'Campanhas de marketing principais';
COMMENT ON TABLE campaign_templates IS 'Templates pré-definidos de campanhas';
COMMENT ON TABLE user_campaigns IS 'Campanhas personalizadas dos usuários';
COMMENT ON TABLE campaign_performance IS 'Métricas de performance das campanhas';

-- Log
DO $$
BEGIN
    RAISE NOTICE '📢 Sistema de Campanhas criado com sucesso';
    RAISE NOTICE '✅ campaigns: Campanhas principais';
    RAISE NOTICE '✅ campaign_templates: Templates pré-definidos';
    RAISE NOTICE '✅ user_campaigns: Campanhas dos usuários';
    RAISE NOTICE '✅ campaign_performance: Métricas de performance';
END $$;