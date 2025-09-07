-- Adicionar tenant_id às tabelas existentes
-- Migração complementar para as tabelas que foram criadas

-- Adicionar tenant_id à tabela profiles
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS tenant_id UUID;

-- Adicionar tenant_id à tabela brand_onboarding  
ALTER TABLE brand_onboarding ADD COLUMN IF NOT EXISTS tenant_id UUID;

-- Adicionar tenant_id à tabela brand_voice
ALTER TABLE brand_voice ADD COLUMN IF NOT EXISTS tenant_id UUID;

-- Criar índices para tenant_id
CREATE INDEX IF NOT EXISTS idx_profiles_tenant_id ON profiles(tenant_id);
CREATE INDEX IF NOT EXISTS idx_brand_onboarding_tenant_id ON brand_onboarding(tenant_id);
CREATE INDEX IF NOT EXISTS idx_brand_voice_tenant_id ON brand_voice(tenant_id);

-- Adicionar foreign key constraints
ALTER TABLE profiles ADD CONSTRAINT IF NOT EXISTS fk_profiles_tenant 
    FOREIGN KEY (tenant_id) REFERENCES tenants(id) ON DELETE CASCADE;

ALTER TABLE brand_onboarding ADD CONSTRAINT IF NOT EXISTS fk_brand_onboarding_tenant 
    FOREIGN KEY (tenant_id) REFERENCES tenants(id) ON DELETE CASCADE;

ALTER TABLE brand_voice ADD CONSTRAINT IF NOT EXISTS fk_brand_voice_tenant 
    FOREIGN KEY (tenant_id) REFERENCES tenants(id) ON DELETE CASCADE;