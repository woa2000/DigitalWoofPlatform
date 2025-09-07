-- Migration: User Profiles
-- Description: Criar tabela de perfis de usuários com informações específicas da aplicação
-- Created: 2025-09-07
-- Phase: 2 - User System

-- =============================================
-- USER PROFILES - PHASE 2
-- =============================================

-- Tabela de perfis de usuários
CREATE TABLE IF NOT EXISTS profiles (
    id UUID PRIMARY KEY NOT NULL,
    tenant_id UUID REFERENCES tenants(id) ON DELETE SET NULL,
    
    -- Informações pessoais
    full_name TEXT,
    avatar_url TEXT,
    phone TEXT,
    
    -- Informações do negócio
    business_name TEXT,
    business_type TEXT,
    website TEXT,
    
    -- Endereço
    address TEXT,
    city TEXT,
    state TEXT,
    zip_code TEXT,
    country TEXT DEFAULT 'BR',
    
    -- Subscription e plano
    plan_type TEXT DEFAULT 'free',
    subscription_status TEXT DEFAULT 'active',
    subscription_end_date TIMESTAMPTZ,
    
    -- Onboarding
    onboarding_completed BOOLEAN DEFAULT false,
    onboarding_step TEXT DEFAULT 'welcome',
    
    -- Preferências
    timezone TEXT DEFAULT 'America/Sao_Paulo',
    language TEXT DEFAULT 'pt-BR',
    notifications JSONB DEFAULT '{"email": true, "browser": true, "marketing": false}',
    
    -- Metadata
    metadata JSONB DEFAULT '{}',
    
    -- Timestamps
    created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
    updated_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
    
    -- Constraints
    CONSTRAINT profiles_business_type_valid CHECK (business_type IN ('veterinaria', 'petshop', 'hotel', 'creche', 'adestramento', 'outros')),
    CONSTRAINT profiles_plan_type_valid CHECK (plan_type IN ('free', 'basic', 'premium')),
    CONSTRAINT profiles_subscription_status_valid CHECK (subscription_status IN ('active', 'cancelled', 'expired')),
    CONSTRAINT profiles_onboarding_step_valid CHECK (onboarding_step IN ('welcome', 'brand-setup', 'preferences', 'complete')),
    CONSTRAINT profiles_language_valid CHECK (language IN ('pt-BR', 'en-US', 'es-ES')),
    CONSTRAINT profiles_phone_format CHECK (phone IS NULL OR phone ~ '^[\+]?[0-9\(\)\-\s]*$'),
    CONSTRAINT profiles_website_format CHECK (website IS NULL OR website = '' OR website ~ '^https?://')
);

-- Índices para performance
CREATE INDEX IF NOT EXISTS idx_profiles_tenant_id ON profiles(tenant_id);
CREATE INDEX IF NOT EXISTS idx_profiles_business_type ON profiles(business_type);
CREATE INDEX IF NOT EXISTS idx_profiles_plan_type ON profiles(plan_type);
CREATE INDEX IF NOT EXISTS idx_profiles_onboarding_completed ON profiles(onboarding_completed);
CREATE INDEX IF NOT EXISTS idx_profiles_subscription_status ON profiles(subscription_status);

-- Trigger para updated_at
CREATE TRIGGER update_profiles_updated_at 
    BEFORE UPDATE ON profiles 
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Comentários
COMMENT ON TABLE profiles IS 'Perfis de usuários com informações específicas da aplicação e business';
COMMENT ON COLUMN profiles.id IS 'Referencia auth.users.id do Supabase';
COMMENT ON COLUMN profiles.tenant_id IS 'Tenant padrão do usuário (pode ser null se multi-tenant)';
COMMENT ON COLUMN profiles.onboarding_step IS 'Passo atual do onboarding: welcome, brand-setup, preferences, complete';
COMMENT ON COLUMN profiles.notifications IS 'Configurações de notificação em formato JSON';
COMMENT ON COLUMN profiles.metadata IS 'Dados adicionais específicos do usuário';

-- Log de criação
DO $$
BEGIN
    RAISE NOTICE '👤 Sistema de Profiles criado com sucesso';
    RAISE NOTICE '✅ profiles: Informações dos usuários';
    RAISE NOTICE '🔗 Relacionado com tenants (optional)';
    RAISE NOTICE '📊 Índices de performance criados';
    RAISE NOTICE '🔧 Trigger de updated_at configurado';
END $$;