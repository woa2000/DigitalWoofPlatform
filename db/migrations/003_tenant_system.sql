-- Migration: Tenant System
-- Description: Criar sistema multi-tenant completo com tabelas principais
-- Created: 2025-09-07
-- Phase: 2 - Tenant System

-- =============================================
-- TENANT SYSTEM - PHASE 2
-- =============================================

-- Tabela principal de tenants/organizações
CREATE TABLE IF NOT EXISTS tenants (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    
    -- Identificação
    name TEXT NOT NULL,
    slug TEXT UNIQUE NOT NULL,
    domain TEXT UNIQUE,
    
    -- Business Info
    business_type TEXT,
    subscription_plan TEXT DEFAULT 'free',
    subscription_status TEXT DEFAULT 'active',
    subscription_end_date TIMESTAMPTZ,
    
    -- Settings & Preferences
    settings JSONB DEFAULT '{}',
    brand_guidelines JSONB DEFAULT '{}',
    billing_info JSONB DEFAULT '{}',
    
    -- Owner & Status
    owner_id UUID NOT NULL,
    status TEXT DEFAULT 'active',
    
    -- Metadata
    created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
    updated_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
    
    -- Constraints
    CONSTRAINT tenants_name_length CHECK (char_length(name) >= 1 AND char_length(name) <= 200),
    CONSTRAINT tenants_slug_format CHECK (slug ~ '^[a-z0-9-]+$'),
    CONSTRAINT tenants_business_type_valid CHECK (business_type IN ('veterinaria', 'petshop', 'hotel', 'creche', 'adestramento', 'outros')),
    CONSTRAINT tenants_subscription_plan_valid CHECK (subscription_plan IN ('free', 'basic', 'premium')),
    CONSTRAINT tenants_subscription_status_valid CHECK (subscription_status IN ('active', 'cancelled', 'expired', 'trial')),
    CONSTRAINT tenants_status_valid CHECK (status IN ('active', 'suspended', 'archived'))
);

-- Tabela de relacionamento tenant-usuários
CREATE TABLE IF NOT EXISTS tenant_users (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
    user_id UUID NOT NULL,
    
    -- Role & Permissions
    role TEXT DEFAULT 'member' NOT NULL,
    permissions JSONB DEFAULT '[]',
    
    -- Status
    status TEXT DEFAULT 'active' NOT NULL,
    invited_by UUID,
    invited_at TIMESTAMPTZ,
    joined_at TIMESTAMPTZ DEFAULT NOW(),
    
    -- Metadata
    created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
    updated_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
    
    -- Constraints
    CONSTRAINT tenant_users_unique_tenant_user UNIQUE(tenant_id, user_id),
    CONSTRAINT tenant_users_role_valid CHECK (role IN ('owner', 'admin', 'member', 'viewer')),
    CONSTRAINT tenant_users_status_valid CHECK (status IN ('active', 'invited', 'suspended'))
);

-- Índices para performance
CREATE INDEX IF NOT EXISTS idx_tenants_slug ON tenants(slug);
CREATE INDEX IF NOT EXISTS idx_tenants_owner_id ON tenants(owner_id);
CREATE INDEX IF NOT EXISTS idx_tenants_status ON tenants(status);
CREATE INDEX IF NOT EXISTS idx_tenants_subscription_plan ON tenants(subscription_plan);
CREATE INDEX IF NOT EXISTS idx_tenants_business_type ON tenants(business_type);

CREATE INDEX IF NOT EXISTS idx_tenant_users_tenant_id ON tenant_users(tenant_id);
CREATE INDEX IF NOT EXISTS idx_tenant_users_user_id ON tenant_users(user_id);
CREATE INDEX IF NOT EXISTS idx_tenant_users_role ON tenant_users(role);
CREATE INDEX IF NOT EXISTS idx_tenant_users_status ON tenant_users(status);

-- Triggers para updated_at
CREATE TRIGGER update_tenants_updated_at 
    BEFORE UPDATE ON tenants 
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_tenant_users_updated_at 
    BEFORE UPDATE ON tenant_users 
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Comentários para documentação
COMMENT ON TABLE tenants IS 'Tenants/organizações do sistema - cada tenant representa uma empresa/clínica veterinária';
COMMENT ON TABLE tenant_users IS 'Relacionamento many-to-many entre tenants e usuários com roles específicos';

COMMENT ON COLUMN tenants.slug IS 'Slug único para URLs amigáveis e identificação do tenant';
COMMENT ON COLUMN tenants.domain IS 'Domínio customizado opcional para white-label';
COMMENT ON COLUMN tenants.settings IS 'Configurações específicas do tenant (timezone, preferências, etc.)';
COMMENT ON COLUMN tenants.brand_guidelines IS 'Guidelines de marca compartilhadas no tenant';

COMMENT ON COLUMN tenant_users.role IS 'owner: dono do tenant, admin: administrador, member: membro, viewer: visualizador';
COMMENT ON COLUMN tenant_users.permissions IS 'Permissões específicas além do role (array de strings)';
COMMENT ON COLUMN tenant_users.status IS 'active: ativo, invited: convidado mas não aceitou, suspended: suspenso';

-- Log de criação
DO $$
BEGIN
    RAISE NOTICE '🏢 Sistema de Tenants criado com sucesso';
    RAISE NOTICE '✅ tenants: Organizações/empresas';
    RAISE NOTICE '✅ tenant_users: Relacionamento usuário-tenant';
    RAISE NOTICE '📊 Índices de performance criados';
    RAISE NOTICE '🔧 Triggers de updated_at configurados';
END $$;