-- ============================================
-- MIGRATION: 0006_add_tenant_id_to_existing_tables.sql
-- DESCRIPTION: Adicionar tenant_id às tabelas existentes
-- DATE: 2025-09-07
-- ============================================

-- Adicionar coluna tenant_id às tabelas existentes
-- Começamos com nullable para permitir migração gradual

-- Profiles
ALTER TABLE profiles ADD COLUMN tenant_id UUID REFERENCES tenants(id);
CREATE INDEX idx_profiles_tenant_id ON profiles(tenant_id);

-- Brand Onboarding
ALTER TABLE brand_onboarding ADD COLUMN tenant_id UUID REFERENCES tenants(id);
CREATE INDEX idx_brand_onboarding_tenant_id ON brand_onboarding(tenant_id);

-- Brand Voice JSONs
ALTER TABLE brand_voice_jsons ADD COLUMN tenant_id UUID REFERENCES tenants(id);
CREATE INDEX idx_brand_voice_jsons_tenant_id ON brand_voice_jsons(tenant_id);

-- Campaigns
ALTER TABLE campaigns ADD COLUMN tenant_id UUID REFERENCES tenants(id);
CREATE INDEX idx_campaigns_tenant_id ON campaigns(tenant_id);

-- AI Content
ALTER TABLE ai_content ADD COLUMN tenant_id UUID REFERENCES tenants(id);
CREATE INDEX idx_ai_content_tenant_id ON ai_content(tenant_id);

-- Content Briefs
ALTER TABLE content_briefs ADD COLUMN tenant_id UUID REFERENCES tenants(id);
CREATE INDEX idx_content_briefs_tenant_id ON content_briefs(tenant_id);

-- Generated Content
ALTER TABLE generated_content ADD COLUMN tenant_id UUID REFERENCES tenants(id);
CREATE INDEX idx_generated_content_tenant_id ON generated_content(tenant_id);

-- Campaign Templates
ALTER TABLE campaign_templates ADD COLUMN tenant_id UUID REFERENCES tenants(id);
CREATE INDEX idx_campaign_templates_tenant_id ON campaign_templates(tenant_id);

-- User Campaigns
ALTER TABLE user_campaigns ADD COLUMN tenant_id UUID REFERENCES tenants(id);
CREATE INDEX idx_user_campaigns_tenant_id ON user_campaigns(tenant_id);

-- Assets
ALTER TABLE assets ADD COLUMN tenant_id UUID REFERENCES tenants(id);
CREATE INDEX idx_assets_tenant_id ON assets(tenant_id);

-- Asset Collections
ALTER TABLE asset_collections ADD COLUMN tenant_id UUID REFERENCES tenants(id);
CREATE INDEX idx_asset_collections_tenant_id ON asset_collections(tenant_id);

-- Business Anamnesis
ALTER TABLE business_anamnesis ADD COLUMN tenant_id UUID REFERENCES tenants(id);
CREATE INDEX idx_business_anamnesis_tenant_id ON business_anamnesis(tenant_id);

-- Anamnesis Analysis
ALTER TABLE anamnesis_analysis ADD COLUMN tenant_id UUID REFERENCES tenants(id);
CREATE INDEX idx_anamnesis_analysis_tenant_id ON anamnesis_analysis(tenant_id);

-- Comentários
COMMENT ON COLUMN profiles.tenant_id IS 'Referência ao tenant ao qual este perfil pertence';
COMMENT ON COLUMN brand_onboarding.tenant_id IS 'Referência ao tenant ao qual este onboarding pertence';
COMMENT ON COLUMN brand_voice_jsons.tenant_id IS 'Referência ao tenant ao qual este brand voice pertence';
COMMENT ON COLUMN campaigns.tenant_id IS 'Referência ao tenant ao qual esta campanha pertence';
COMMENT ON COLUMN ai_content.tenant_id IS 'Referência ao tenant ao qual este conteúdo pertence';