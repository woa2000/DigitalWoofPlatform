-- ============================================
-- MIGRATION: 0005_tenant_system_setup.sql
-- DESCRIPTION: Criar sistema de tenants
-- DATE: 2025-09-07
-- ============================================

-- Criar tabela de tenants
CREATE TABLE tenants (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  
  -- Identificação
  name TEXT NOT NULL,
  slug TEXT UNIQUE NOT NULL, -- URL-friendly name
  domain TEXT UNIQUE, -- Optional custom domain
  
  -- Business Info
  business_type TEXT, -- veterinaria, petshop, hotel, etc.
  subscription_plan TEXT DEFAULT 'free', -- free, basic, premium
  subscription_status TEXT DEFAULT 'active',
  subscription_end_date TIMESTAMPTZ,
  
  -- Settings & Preferences
  settings JSONB DEFAULT '{}',
  brand_guidelines JSONB DEFAULT '{}',
  billing_info JSONB DEFAULT '{}',
  
  -- Owner & Status
  owner_id UUID NOT NULL, -- References the user who created/owns the tenant
  status TEXT DEFAULT 'active',
  
  -- Metadata
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Criar tabela de relacionamento tenant_users
CREATE TABLE tenant_users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
  user_id UUID NOT NULL, -- References auth.users(id) but no FK due to RLS
  
  -- Role & Permissions
  role TEXT DEFAULT 'member', -- owner, admin, member, viewer
  permissions JSONB DEFAULT '[]',
  
  -- Status
  status TEXT DEFAULT 'active', -- active, invited, suspended
  invited_by UUID, -- References auth.users(id) but no FK due to RLS
  invited_at TIMESTAMPTZ,
  joined_at TIMESTAMPTZ DEFAULT NOW(),
  
  -- Metadata
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  
  -- Constraints
  UNIQUE(tenant_id, user_id)
);

-- Criar índices para performance
CREATE INDEX idx_tenants_slug ON tenants(slug);
CREATE INDEX idx_tenants_owner_id ON tenants(owner_id);
CREATE INDEX idx_tenants_status ON tenants(status);
CREATE INDEX idx_tenants_subscription_plan ON tenants(subscription_plan);

CREATE INDEX idx_tenant_users_tenant_id ON tenant_users(tenant_id);
CREATE INDEX idx_tenant_users_user_id ON tenant_users(user_id);
CREATE INDEX idx_tenant_users_role ON tenant_users(role);
CREATE INDEX idx_tenant_users_status ON tenant_users(status);

-- Função para atualizar updated_at automaticamente
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Triggers para updated_at
CREATE TRIGGER update_tenants_updated_at 
    BEFORE UPDATE ON tenants 
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_tenant_users_updated_at 
    BEFORE UPDATE ON tenant_users 
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Função para gerar slug único
CREATE OR REPLACE FUNCTION generate_unique_slug(base_name TEXT)
RETURNS TEXT AS $$
DECLARE
    base_slug TEXT;
    final_slug TEXT;
    counter INTEGER := 0;
BEGIN
    -- Normalizar para slug
    base_slug := LOWER(REGEXP_REPLACE(base_name, '[^a-zA-Z0-9]+', '-', 'g'));
    base_slug := TRIM(BOTH '-' FROM base_slug);
    
    -- Se vazio, usar default
    IF base_slug = '' THEN
        base_slug := 'tenant';
    END IF;
    
    final_slug := base_slug;
    
    -- Verificar se existe e gerar variante se necessário
    WHILE EXISTS (SELECT 1 FROM tenants WHERE slug = final_slug) LOOP
        counter := counter + 1;
        final_slug := base_slug || '-' || counter;
    END LOOP;
    
    RETURN final_slug;
END;
$$ LANGUAGE plpgsql;

-- Função para criar tenant automático na primeira criação de usuário
CREATE OR REPLACE FUNCTION create_default_tenant_for_user()
RETURNS TRIGGER AS $$
DECLARE
    new_tenant_id UUID;
    tenant_name TEXT;
BEGIN
    -- Obter nome para o tenant
    tenant_name := COALESCE(
        (NEW.raw_user_meta_data->>'business_name')::TEXT,
        (NEW.raw_user_meta_data->>'name')::TEXT,
        'Minha Empresa'
    );
    
    -- Criar tenant padrão
    INSERT INTO tenants (
        name,
        slug,
        owner_id,
        business_type,
        subscription_plan
    ) VALUES (
        tenant_name,
        generate_unique_slug(tenant_name),
        NEW.id,
        COALESCE((NEW.raw_user_meta_data->>'business_type')::TEXT, 'outros'),
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