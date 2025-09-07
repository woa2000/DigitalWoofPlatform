-- Migration: Database Cleanup
-- Description: Remove todas as tabelas existentes exceto migration_history
-- Created: 2025-09-07
-- Phase: 1 - Database Cleanup

-- =============================================
-- DATABASE CLEANUP - PHASE 1
-- =============================================

-- Desabilitar triggers e constraints temporariamente
SET session_replication_role = replica;

-- Remover todas as tabelas em ordem (dependências primeiro)
DROP TABLE IF EXISTS brand_voice CASCADE;
DROP TABLE IF EXISTS brand_voice_jsons CASCADE;
DROP TABLE IF EXISTS brand_onboarding CASCADE;
DROP TABLE IF EXISTS tenant_users CASCADE;
DROP TABLE IF EXISTS profiles CASCADE;
DROP TABLE IF EXISTS tenants CASCADE;

-- Remover funções e triggers se existirem
DROP FUNCTION IF EXISTS update_updated_at_column() CASCADE;
DROP FUNCTION IF EXISTS generate_unique_slug(TEXT) CASCADE;
DROP FUNCTION IF EXISTS create_default_tenant_for_user() CASCADE;

-- Remover tipos customizados se existirem
DROP TYPE IF EXISTS user_role CASCADE;
DROP TYPE IF EXISTS subscription_plan CASCADE;
DROP TYPE IF EXISTS business_type CASCADE;

-- Remover extensões não utilizadas (manter apenas as essenciais)
-- Manter uuid-ossp para geração de UUIDs

-- Reabilitar triggers e constraints
SET session_replication_role = DEFAULT;

-- Log de limpeza
DO $$
BEGIN
    RAISE NOTICE '🧹 Limpeza do banco de dados concluída';
    RAISE NOTICE '✅ Todas as tabelas removidas exceto migration_history';
    RAISE NOTICE '📋 Banco pronto para receber nova estrutura';
END $$;