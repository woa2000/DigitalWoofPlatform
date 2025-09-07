-- Criar tabelas básicas do sistema que ainda não existem
-- Baseado em shared/schema.ts

-- Tabela de perfis de usuário
CREATE TABLE IF NOT EXISTS profiles (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL,
    email TEXT NOT NULL UNIQUE,
    full_name TEXT,
    avatar_url TEXT,
    business_name TEXT,
    business_type TEXT,
    phone TEXT,
    website TEXT,
    social_media JSONB,
    preferences JSONB DEFAULT '{}',
    status TEXT DEFAULT 'active',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Tabela de onboarding de marca
CREATE TABLE IF NOT EXISTS brand_onboarding (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL,
    step INTEGER DEFAULT 1,
    data JSONB DEFAULT '{}',
    completed BOOLEAN DEFAULT FALSE,
    completed_at TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Tabela de voice da marca
CREATE TABLE IF NOT EXISTS brand_voice (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    profile_id UUID NOT NULL,
    brand_name TEXT NOT NULL,
    brand_personality JSONB,
    tone_guidelines JSONB,
    content_preferences JSONB,
    target_audience JSONB,
    competitor_analysis JSONB,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Índices para melhorar performance
CREATE INDEX IF NOT EXISTS idx_profiles_user_id ON profiles(user_id);
CREATE INDEX IF NOT EXISTS idx_profiles_email ON profiles(email);
CREATE INDEX IF NOT EXISTS idx_brand_onboarding_user_id ON brand_onboarding(user_id);
CREATE INDEX IF NOT EXISTS idx_brand_voice_profile_id ON brand_voice(profile_id);

-- Função para atualizar updated_at automaticamente
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Triggers para atualizar updated_at
CREATE TRIGGER update_profiles_updated_at BEFORE UPDATE ON profiles FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_brand_onboarding_updated_at BEFORE UPDATE ON brand_onboarding FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_brand_voice_updated_at BEFORE UPDATE ON brand_voice FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();