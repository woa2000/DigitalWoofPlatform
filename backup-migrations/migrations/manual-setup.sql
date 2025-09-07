-- DigitalWoof Platform - Migrações do Banco de Dados
-- Execute este SQL no Supabase Dashboard → SQL Editor

-- 1. Habilitar extensões necessárias
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- 2. Criar tabela de perfis de usuários
CREATE TABLE IF NOT EXISTS profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  full_name TEXT,
  avatar_url TEXT,
  business_name TEXT,
  business_type TEXT,
  phone TEXT,
  website TEXT,
  address TEXT,
  city TEXT,
  state TEXT,
  zip_code TEXT,
  country TEXT DEFAULT 'BR',
  plan_type TEXT DEFAULT 'free',
  subscription_status TEXT DEFAULT 'active',
  subscription_end_date TIMESTAMP WITH TIME ZONE,
  onboarding_completed BOOLEAN DEFAULT false,
  onboarding_step TEXT DEFAULT 'welcome',
  timezone TEXT DEFAULT 'America/Sao_Paulo',
  language TEXT DEFAULT 'pt-BR',
  notifications JSONB DEFAULT '{"email": true, "browser": true, "marketing": false}',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- 3. Criar tabela de onboarding da marca
CREATE TABLE IF NOT EXISTS brand_onboarding (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  brand_name TEXT,
  brand_description TEXT,
  brand_values JSONB,
  brand_personality JSONB,
  target_audience TEXT,
  unique_selling_proposition TEXT,
  brand_voice_tone TEXT,
  business_category TEXT,
  business_size TEXT,
  years_in_business INTEGER,
  main_services JSONB,
  service_area TEXT,
  competitors JSONB,
  has_website BOOLEAN DEFAULT false,
  website_url TEXT,
  social_media_presence JSONB,
  current_marketing_channels JSONB,
  marketing_budget_range TEXT,
  primary_goals JSONB,
  success_metrics JSONB,
  content_themes JSONB,
  preferred_content_types JSONB,
  posting_frequency TEXT,
  brand_guidelines_exist BOOLEAN DEFAULT false,
  status TEXT DEFAULT 'draft',
  completed_steps JSONB DEFAULT '[]',
  current_step TEXT DEFAULT 'brand-identity',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- 4. Criar tabela de campanhas
CREATE TABLE IF NOT EXISTS campaigns (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  description TEXT,
  campaign_type TEXT,
  status TEXT DEFAULT 'draft',
  start_date TIMESTAMP WITH TIME ZONE,
  end_date TIMESTAMP WITH TIME ZONE,
  target_audience TEXT,
  budget_range TEXT,
  expected_reach INTEGER,
  content_themes JSONB,
  hashtags JSONB,
  visual_style JSONB,
  call_to_action TEXT,
  primary_goal TEXT,
  success_metrics JSONB,
  kpis JSONB,
  generated_content JSONB,
  ai_suggestions JSONB,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- 5. Criar tabela de conteúdo gerado por IA
CREATE TABLE IF NOT EXISTS ai_content (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  campaign_id UUID REFERENCES campaigns(id) ON DELETE CASCADE,
  content_type TEXT NOT NULL,
  platform TEXT,
  title TEXT,
  content TEXT NOT NULL,
  hashtags JSONB,
  visual_suggestions JSONB,
  prompt_used TEXT,
  ai_model TEXT,
  generation_params JSONB,
  status TEXT DEFAULT 'draft',
  approval_status TEXT DEFAULT 'pending',
  scheduled_date TIMESTAMP WITH TIME ZONE,
  published_date TIMESTAMP WITH TIME ZONE,
  engagement_metrics JSONB,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- 6. Criar tabela de voice da marca
CREATE TABLE IF NOT EXISTS brand_voice_jsons (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  description TEXT,
  brand_voice JSONB NOT NULL,
  status TEXT DEFAULT 'active',
  version INTEGER DEFAULT 1,
  is_default BOOLEAN DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- 7. Criar índices para performance
CREATE INDEX IF NOT EXISTS idx_profiles_user_id ON profiles(id);
CREATE INDEX IF NOT EXISTS idx_profiles_onboarding_step ON profiles(onboarding_step);
CREATE INDEX IF NOT EXISTS idx_profiles_subscription_status ON profiles(subscription_status);
CREATE INDEX IF NOT EXISTS idx_brand_onboarding_user_id ON brand_onboarding(user_id);
CREATE INDEX IF NOT EXISTS idx_brand_onboarding_status ON brand_onboarding(status);
CREATE INDEX IF NOT EXISTS idx_campaigns_user_id ON campaigns(user_id);
CREATE INDEX IF NOT EXISTS idx_campaigns_status ON campaigns(status);
CREATE INDEX IF NOT EXISTS idx_ai_content_user_id ON ai_content(user_id);
CREATE INDEX IF NOT EXISTS idx_ai_content_campaign_id ON ai_content(campaign_id);
CREATE INDEX IF NOT EXISTS idx_ai_content_status ON ai_content(status);
CREATE INDEX IF NOT EXISTS idx_brand_voice_user_id ON brand_voice_jsons(user_id);
CREATE INDEX IF NOT EXISTS idx_brand_voice_status ON brand_voice_jsons(status);

-- 8. Habilitar Row Level Security (RLS)
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE brand_onboarding ENABLE ROW LEVEL SECURITY;
ALTER TABLE campaigns ENABLE ROW LEVEL SECURITY;
ALTER TABLE ai_content ENABLE ROW LEVEL SECURITY;
ALTER TABLE brand_voice_jsons ENABLE ROW LEVEL SECURITY;

-- 9. Criar políticas de segurança
-- Nota: Se alguma policy já existir, ignore o erro e continue

-- Policies para profiles
CREATE POLICY "Users can view own profile" ON profiles FOR SELECT USING (auth.uid() = id);
CREATE POLICY "Users can update own profile" ON profiles FOR UPDATE USING (auth.uid() = id);
CREATE POLICY "Users can insert own profile" ON profiles FOR INSERT WITH CHECK (auth.uid() = id);

-- Policies para brand_onboarding
CREATE POLICY "Users can view own brand onboarding" ON brand_onboarding FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can update own brand onboarding" ON brand_onboarding FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own brand onboarding" ON brand_onboarding FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Policies para campaigns
CREATE POLICY "Users can view own campaigns" ON campaigns FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can update own campaigns" ON campaigns FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own campaigns" ON campaigns FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can delete own campaigns" ON campaigns FOR DELETE USING (auth.uid() = user_id);

-- Policies para ai_content
CREATE POLICY "Users can view own ai content" ON ai_content FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can update own ai content" ON ai_content FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own ai content" ON ai_content FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can delete own ai content" ON ai_content FOR DELETE USING (auth.uid() = user_id);

-- Policies para brand_voice_jsons
CREATE POLICY "Users can view own brand voice" ON brand_voice_jsons FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can update own brand voice" ON brand_voice_jsons FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own brand voice" ON brand_voice_jsons FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can delete own brand voice" ON brand_voice_jsons FOR DELETE USING (auth.uid() = user_id);

-- 10. Criar função para updated_at automático
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = now();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- 11. Criar triggers para updated_at
CREATE OR REPLACE TRIGGER update_profiles_updated_at 
  BEFORE UPDATE ON profiles
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE OR REPLACE TRIGGER update_brand_onboarding_updated_at 
  BEFORE UPDATE ON brand_onboarding
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE OR REPLACE TRIGGER update_campaigns_updated_at 
  BEFORE UPDATE ON campaigns
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE OR REPLACE TRIGGER update_ai_content_updated_at 
  BEFORE UPDATE ON ai_content
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE OR REPLACE TRIGGER update_brand_voice_jsons_updated_at 
  BEFORE UPDATE ON brand_voice_jsons
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Fim das migrações
-- Execute este SQL no Supabase Dashboard e depois rode: npm run db:test