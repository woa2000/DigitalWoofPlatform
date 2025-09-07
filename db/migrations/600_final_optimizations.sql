-- Migration: Final Optimizations
-- Description: Índices finais, políticas RLS e otimizações
-- Created: 2025-09-07
-- Phase: 2 - Final Setup

-- =============================================
-- FINAL OPTIMIZATIONS - PHASE 2
-- =============================================

-- Adicionar foreign key que dependia de tabelas criadas posteriormente
ALTER TABLE brand_voice_jsons 
ADD CONSTRAINT fk_brand_voice_jsons_source_analysis 
FOREIGN KEY (source_analysis_id) REFERENCES anamnesis_analysis(id);

-- Função para criar tenant automático no primeiro login
CREATE OR REPLACE FUNCTION create_default_tenant_for_user()
RETURNS TRIGGER AS $$
DECLARE
    new_tenant_id UUID;
    tenant_name TEXT;
    tenant_slug TEXT;
BEGIN
    -- Obter nome para o tenant
    tenant_name := COALESCE(
        NEW.raw_user_meta_data->>'business_name',
        NEW.raw_user_meta_data->>'name',
        'Minha Empresa'
    );
    
    -- Gerar slug único
    tenant_slug := generate_unique_slug(tenant_name, 'tenants');
    
    -- Criar tenant padrão
    INSERT INTO tenants (
        name,
        slug,
        owner_id,
        business_type,
        subscription_plan
    ) VALUES (
        tenant_name,
        tenant_slug,
        NEW.id,
        COALESCE(NEW.raw_user_meta_data->>'business_type', 'outros'),
        'free'
    ) RETURNING id INTO new_tenant_id;
    
    -- Adicionar usuário ao tenant como owner
    INSERT INTO tenant_users (
        tenant_id,
        user_id,
        role,
        status
    ) VALUES (
        new_tenant_id,
        NEW.id,
        'owner',
        'active'
    );
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Função para atualizar quality score overall automaticamente
CREATE OR REPLACE FUNCTION update_brand_voice_quality_score()
RETURNS TRIGGER AS $$
BEGIN
    NEW.quality_score_overall := calculate_quality_score(
        NEW.quality_score_completeness,
        NEW.quality_score_consistency,
        NEW.quality_score_specificity,
        NEW.quality_score_usability
    );
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger para calcular quality score automaticamente
CREATE TRIGGER calculate_brand_voice_quality_score
    BEFORE INSERT OR UPDATE ON brand_voice_jsons
    FOR EACH ROW
    WHEN (NEW.quality_score_completeness IS NOT NULL 
          OR NEW.quality_score_consistency IS NOT NULL 
          OR NEW.quality_score_specificity IS NOT NULL 
          OR NEW.quality_score_usability IS NOT NULL)
    EXECUTE FUNCTION update_brand_voice_quality_score();

-- Trigger para atualizar usage_count nos prompts
CREATE OR REPLACE FUNCTION increment_prompt_usage()
RETURNS TRIGGER AS $$
BEGIN
    UPDATE ai_prompts 
    SET usage_count = usage_count + 1,
        avg_quality_score = (
            SELECT AVG(compliance_score) 
            FROM generated_content gc
            JOIN content_briefs cb ON gc.brief_id = cb.id
            WHERE cb.custom_instructions LIKE '%' || NEW.prompt_used || '%'
        )
    WHERE name = NEW.prompt_used;
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger para contar uso de prompts
CREATE TRIGGER track_prompt_usage
    AFTER INSERT ON ai_content
    FOR EACH ROW
    WHEN (NEW.prompt_used IS NOT NULL)
    EXECUTE FUNCTION increment_prompt_usage();

-- Índices compostos para queries complexas
CREATE INDEX IF NOT EXISTS idx_tenant_users_tenant_role ON tenant_users(tenant_id, role);
CREATE INDEX IF NOT EXISTS idx_brand_voice_jsons_user_status ON brand_voice_jsons(user_id, status);
CREATE INDEX IF NOT EXISTS idx_campaigns_tenant_status ON campaigns(tenant_id, status);
CREATE INDEX IF NOT EXISTS idx_ai_content_user_status ON ai_content(user_id, status);
CREATE INDEX IF NOT EXISTS idx_assets_category_premium ON assets(category, is_premium);

-- Índices para busca full-text (quando necessário)
CREATE INDEX IF NOT EXISTS idx_assets_name_trgm ON assets USING gin (name gin_trgm_ops);
CREATE INDEX IF NOT EXISTS idx_campaign_templates_name_trgm ON campaign_templates USING gin (name gin_trgm_ops);

-- Views úteis para relatórios
CREATE OR REPLACE VIEW tenant_stats AS
SELECT 
    t.id,
    t.name,
    t.slug,
    t.business_type,
    t.subscription_plan,
    COUNT(DISTINCT tu.user_id) as user_count,
    COUNT(DISTINCT c.id) as campaign_count,
    COUNT(DISTINCT bvj.id) as brand_voice_count,
    COUNT(DISTINCT ac.id) as ai_content_count,
    t.created_at
FROM tenants t
LEFT JOIN tenant_users tu ON t.id = tu.tenant_id AND tu.status = 'active'
LEFT JOIN campaigns c ON t.id = c.tenant_id
LEFT JOIN brand_voice_jsons bvj ON t.id = bvj.tenant_id AND bvj.status = 'active'
LEFT JOIN ai_content ac ON t.id = ac.tenant_id
GROUP BY t.id, t.name, t.slug, t.business_type, t.subscription_plan, t.created_at;

-- View para dashboard de usuário
CREATE OR REPLACE VIEW user_dashboard AS
SELECT 
    p.id as user_id,
    p.full_name,
    p.business_name,
    p.business_type,
    p.plan_type,
    p.onboarding_completed,
    COUNT(DISTINCT c.id) as campaign_count,
    COUNT(DISTINCT bvj.id) as brand_voice_count,
    COUNT(DISTINCT ac.id) as ai_content_count,
    MAX(ac.created_at) as last_content_created
FROM profiles p
LEFT JOIN campaigns c ON p.id = c.user_id
LEFT JOIN brand_voice_jsons bvj ON p.id = bvj.user_id AND bvj.status = 'active'
LEFT JOIN ai_content ac ON p.id = ac.user_id
GROUP BY p.id, p.full_name, p.business_name, p.business_type, p.plan_type, p.onboarding_completed;

-- Comentários em views
COMMENT ON VIEW tenant_stats IS 'Estatísticas agregadas por tenant para relatórios';
COMMENT ON VIEW user_dashboard IS 'Dados do dashboard do usuário com contadores';

-- Log final
DO $$
BEGIN
    RAISE NOTICE '🎯 Otimizações finais aplicadas com sucesso';
    RAISE NOTICE '✅ Foreign keys adicionais criadas';
    RAISE NOTICE '✅ Funções de negócio implementadas';
    RAISE NOTICE '✅ Triggers automáticos configurados';
    RAISE NOTICE '✅ Índices compostos criados';
    RAISE NOTICE '✅ Views de relatório criadas';
    RAISE NOTICE '🎉 Database setup completo!';
END $$;