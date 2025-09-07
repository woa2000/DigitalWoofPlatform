-- Migration: Brand Voice JSON Schema
-- Created: 2025-09-07
-- 
-- Description:
-- Verificar se tabela brand_voice_jsons existe, caso contrário criar
-- Sistema completo de Brand Voice JSON com validação e performance otimizada

-- =============================================
-- UP Migration
-- =============================================

-- Verificar se a tabela já existe
DO $$
BEGIN
    IF NOT EXISTS (SELECT FROM information_schema.tables WHERE table_name = 'brand_voice_jsons') THEN
        -- Criar tabela apenas se não existir
        CREATE TABLE brand_voice_jsons (
            id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
            user_id UUID NOT NULL,
            tenant_id UUID,
            brand_voice_json JSONB NOT NULL,
            name TEXT NOT NULL,
            version TEXT DEFAULT '1.0',
            status TEXT DEFAULT 'draft',
            generated_from TEXT,
            source_analysis_id UUID,
            source_onboarding_id UUID,
            
            -- Quality scores
            quality_score_overall NUMERIC(5,2),
            quality_score_completeness NUMERIC(5,2),
            quality_score_consistency NUMERIC(5,2),
            quality_score_specificity NUMERIC(5,2),
            quality_score_usability NUMERIC(5,2),
            
            -- Metadata
            last_validated_at TIMESTAMP WITH TIME ZONE,
            cache_key TEXT UNIQUE,
            usage_count INTEGER DEFAULT 0,
            last_used_at TIMESTAMP WITH TIME ZONE,
            
            -- Timestamps
            created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
            updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
            activated_at TIMESTAMP WITH TIME ZONE,
            archived_at TIMESTAMP WITH TIME ZONE
        );
    ELSE
        -- Tabela já existe, apenas registrar no log
        RAISE NOTICE 'Tabela brand_voice_jsons já existe, pulando criação';
    END IF;
END $$;