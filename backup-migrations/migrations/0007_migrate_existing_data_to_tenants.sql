-- ============================================
-- MIGRATION: 0007_migrate_existing_data_to_tenants.sql
-- DESCRIPTION: Migrar dados existentes para o sistema de tenants
-- DATE: 2025-09-07
-- ============================================

-- Script para migrar dados existentes para o sistema de tenants
-- Cria um tenant padrão para cada usuário existente e associa todos os dados

DO $$
DECLARE
    user_record RECORD;
    new_tenant_id UUID;
    tenant_name TEXT;
    tenant_slug TEXT;
BEGIN
    -- Iterar sobre todos os usuários existentes que têm perfil
    FOR user_record IN 
        SELECT DISTINCT p.id as user_id, p.business_name, p.full_name, p.business_type, p.plan_type
        FROM profiles p
        WHERE p.tenant_id IS NULL -- Apenas usuários que ainda não têm tenant
    LOOP
        -- Determinar nome do tenant
        tenant_name := COALESCE(
            user_record.business_name, 
            user_record.full_name, 
            'Minha Empresa'
        );
        
        -- Gerar slug único
        tenant_slug := LOWER(REGEXP_REPLACE(tenant_name, '[^a-zA-Z0-9]+', '-', 'g'));
        tenant_slug := TRIM(BOTH '-' FROM tenant_slug);
        
        -- Se slug vazio, usar default
        IF tenant_slug = '' THEN
            tenant_slug := 'tenant-' || user_record.user_id;
        END IF;
        
        -- Garantir que o slug é único
        WHILE EXISTS (SELECT 1 FROM tenants WHERE slug = tenant_slug) LOOP
            tenant_slug := tenant_slug || '-' || floor(random() * 1000);
        END LOOP;
        
        -- Criar tenant padrão para o usuário
        INSERT INTO tenants (
            name, 
            slug, 
            owner_id, 
            business_type,
            subscription_plan,
            status
        ) VALUES (
            tenant_name,
            tenant_slug,
            user_record.user_id,
            COALESCE(user_record.business_type, 'outros'),
            COALESCE(user_record.plan_type, 'free'),
            'active'
        ) RETURNING id INTO new_tenant_id;
        
        -- Adicionar usuário ao tenant como owner
        INSERT INTO tenant_users (tenant_id, user_id, role, status)
        VALUES (new_tenant_id, user_record.user_id, 'owner', 'active');
        
        -- Migrar dados existentes para o novo tenant
        -- Profiles
        UPDATE profiles 
        SET tenant_id = new_tenant_id 
        WHERE id = user_record.user_id AND tenant_id IS NULL;
        
        -- Brand Onboarding
        UPDATE brand_onboarding 
        SET tenant_id = new_tenant_id 
        WHERE user_id = user_record.user_id AND tenant_id IS NULL;
        
        -- Brand Voice JSONs
        UPDATE brand_voice_jsons 
        SET tenant_id = new_tenant_id 
        WHERE user_id = user_record.user_id AND tenant_id IS NULL;
        
        -- Campaigns
        UPDATE campaigns 
        SET tenant_id = new_tenant_id 
        WHERE user_id = user_record.user_id AND tenant_id IS NULL;
        
        -- AI Content
        UPDATE ai_content 
        SET tenant_id = new_tenant_id 
        WHERE user_id = user_record.user_id AND tenant_id IS NULL;
        
        -- Content Briefs
        UPDATE content_briefs 
        SET tenant_id = new_tenant_id 
        WHERE user_id = user_record.user_id AND tenant_id IS NULL;
        
        -- Generated Content (via content briefs)
        UPDATE generated_content 
        SET tenant_id = new_tenant_id 
        WHERE brief_id IN (
            SELECT id FROM content_briefs WHERE user_id = user_record.user_id
        ) AND tenant_id IS NULL;
        
        -- User Campaigns
        UPDATE user_campaigns 
        SET tenant_id = new_tenant_id 
        WHERE user_id = user_record.user_id AND tenant_id IS NULL;
        
        -- Asset Collections
        UPDATE asset_collections 
        SET tenant_id = new_tenant_id 
        WHERE created_by = user_record.user_id AND tenant_id IS NULL;
        
        -- Business Anamnesis
        UPDATE business_anamnesis 
        SET tenant_id = new_tenant_id 
        WHERE user_id = user_record.user_id AND tenant_id IS NULL;
        
        -- Anamnesis Analysis
        UPDATE anamnesis_analysis 
        SET tenant_id = new_tenant_id 
        WHERE user_id = user_record.user_id AND tenant_id IS NULL;
        
        RAISE NOTICE 'Migrated user % to tenant % (%)', user_record.user_id, new_tenant_id, tenant_name;
        
    END LOOP;
    
    RAISE NOTICE 'Migration completed successfully';
END $$;