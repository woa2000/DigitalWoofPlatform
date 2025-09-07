-- Migration: Calendar Editorial System Schema
-- Created: 2025-09-06
-- Description: Complete schema for calendar editorial system with seasonal intelligence

-- Create enums for calendar system
CREATE TYPE IF NOT EXISTS content_type AS ENUM ('educativo', 'promocional', 'recall', 'engajamento', 'awareness');
CREATE TYPE IF NOT EXISTS calendar_status AS ENUM ('draft', 'scheduled', 'published', 'failed', 'cancelled');
CREATE TYPE IF NOT EXISTS calendar_priority AS ENUM ('low', 'medium', 'high', 'urgent');
CREATE TYPE IF NOT EXISTS business_type AS ENUM ('veterinaria', 'petshop', 'estetica', 'hotel', 'adestramento');
CREATE TYPE IF NOT EXISTS campaign_type AS ENUM ('seasonal', 'promotional', 'educational', 'retention', 'acquisition');
CREATE TYPE IF NOT EXISTS seasonal_event_type AS ENUM ('holiday', 'weather', 'pet_health', 'business_cycle', 'industry_event');

-- Items do calendário
CREATE TABLE IF NOT EXISTS calendar_items (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  account_id UUID NOT NULL,
  user_id UUID NOT NULL,
  
  -- Conteúdo básico
  title TEXT NOT NULL,
  description TEXT,
  content_type content_type NOT NULL,
  channels TEXT[] NOT NULL DEFAULT '{}',
  
  -- Scheduling
  scheduled_for TIMESTAMP WITH TIME ZONE NOT NULL,
  timezone VARCHAR(50) DEFAULT 'America/Sao_Paulo',
  
  -- Relacionamentos
  campaign_id UUID,
  template_id UUID,
  generated_content_id UUID,
  
  -- Status e metadata
  status calendar_status DEFAULT 'draft',
  priority calendar_priority DEFAULT 'medium',
  objectives JSONB DEFAULT '{}',
  tags TEXT[] DEFAULT '{}',
  
  -- Performance prediction
  predicted_engagement DECIMAL(5,4),
  predicted_reach INTEGER,
  optimal_time_score DECIMAL(3,2),
  
  -- Tracking
  published_at TIMESTAMP WITH TIME ZONE,
  actual_performance JSONB DEFAULT '{}',
  
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Templates de campanha estruturada
CREATE TABLE IF NOT EXISTS campaign_templates (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name VARCHAR(200) NOT NULL,
  description TEXT,
  
  -- Classificação
  business_type business_type NOT NULL,
  campaign_type campaign_type NOT NULL,
  season VARCHAR(50), -- 'verão', 'inverno', 'year-round'
  
  -- Estrutura temporal
  duration INTERVAL NOT NULL, -- '4 weeks'
  phases JSONB NOT NULL DEFAULT '[]', -- estrutura da campanha por fase
  
  -- Objetivos padrão
  default_objectives JSONB DEFAULT '{}',
  success_metrics JSONB DEFAULT '{}',
  
  -- Performance histórica
  usage_count INTEGER DEFAULT 0,
  avg_success_rate DECIMAL(5,4),
  
  -- Metadata
  is_public BOOLEAN DEFAULT true,
  created_by UUID,
  
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Sugestões inteligentes
CREATE TABLE IF NOT EXISTS calendar_suggestions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  account_id UUID NOT NULL,
  
  -- Período das sugestões
  suggested_for DATE NOT NULL,
  period_type VARCHAR(20) NOT NULL, -- 'week', 'month'
  
  -- Contexto da sugestão
  business_type business_type NOT NULL,
  seasonal_factors JSONB DEFAULT '{}',
  local_events JSONB DEFAULT '{}',
  
  -- Sugestões geradas
  content_suggestions JSONB NOT NULL DEFAULT '[]',
  campaign_suggestions JSONB DEFAULT '[]',
  timing_suggestions JSONB DEFAULT '[]',
  
  -- Performance
  applied_count INTEGER DEFAULT 0,
  user_rating DECIMAL(3,2),
  
  -- Metadata
  generated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  expires_at TIMESTAMP WITH TIME ZONE,
  
  UNIQUE(account_id, suggested_for, period_type)
);

-- Analytics de timing
CREATE TABLE IF NOT EXISTS optimal_timing (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  account_id UUID NOT NULL,
  
  -- Segmentação
  content_type content_type NOT NULL,
  channel VARCHAR(50) NOT NULL,
  day_of_week INTEGER NOT NULL, -- 0=Sunday, 6=Saturday
  hour_of_day INTEGER NOT NULL, -- 0-23
  
  -- Métricas históricas
  total_posts INTEGER DEFAULT 0,
  avg_engagement DECIMAL(5,4),
  avg_reach INTEGER,
  avg_clicks INTEGER,
  confidence_score DECIMAL(3,2),
  
  -- Última atualização
  last_calculated TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  
  UNIQUE(account_id, content_type, channel, day_of_week, hour_of_day)
);

-- Base de conhecimento sazonal
CREATE TABLE IF NOT EXISTS seasonal_knowledge (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  
  -- Evento/sazonalidade
  name VARCHAR(200) NOT NULL,
  description TEXT,
  event_type seasonal_event_type NOT NULL,
  
  -- Timing
  start_month INTEGER NOT NULL, -- 1-12
  end_month INTEGER NOT NULL,
  peak_weeks INTEGER[] DEFAULT '{}', -- semanas de pico no período
  
  -- Aplicabilidade
  business_types business_type[] DEFAULT '{}',
  regions TEXT[] DEFAULT '{}', -- códigos de região/estado
  
  -- Conteúdo sugerido
  content_themes TEXT[] DEFAULT '{}',
  recommended_frequency INTEGER DEFAULT 1, -- posts por semana
  priority_score INTEGER DEFAULT 5, -- 1-10
  
  -- Performance histórica
  avg_engagement_lift DECIMAL(5,4) DEFAULT 0, -- vs baseline
  conversion_impact DECIMAL(5,4) DEFAULT 0,
  
  -- Metadata
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Analytics de post performance (baseline interno)
CREATE TABLE IF NOT EXISTS analytics_post_metrics (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  account_id UUID NOT NULL,
  calendar_item_id UUID,
  
  -- Platform info
  platform TEXT CHECK (platform IN ('instagram','facebook','gbp','linkedin','tiktok')),
  posted_at TIMESTAMPTZ NOT NULL,
  media_type TEXT,
  
  -- Engagement metrics
  impressions INTEGER DEFAULT 0,
  reach INTEGER DEFAULT 0,
  likes INTEGER DEFAULT 0,
  comments INTEGER DEFAULT 0,
  saves INTEGER DEFAULT 0,
  shares INTEGER DEFAULT 0,
  clicks INTEGER DEFAULT 0,
  
  -- Calculated metrics
  engagement_rate DECIMAL(5,4),
  click_through_rate DECIMAL(5,4),
  
  -- Metadata
  imported_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  data_source VARCHAR(50) DEFAULT 'manual',
  
  CONSTRAINT impressions_nonneg CHECK (impressions >= 0),
  CONSTRAINT reach_nonneg CHECK (reach >= 0)
);

-- Calendar events versioning para backup
CREATE TABLE IF NOT EXISTS calendar_events_versions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  original_id UUID NOT NULL,
  account_id UUID NOT NULL,
  user_id UUID NOT NULL,
  
  -- Snapshot do evento original
  title TEXT NOT NULL,
  description TEXT,
  content_type content_type NOT NULL,
  channels TEXT[] NOT NULL,
  scheduled_for TIMESTAMP WITH TIME ZONE NOT NULL,
  status calendar_status NOT NULL,
  priority calendar_priority NOT NULL,
  objectives JSONB,
  tags TEXT[],
  
  -- Versioning metadata
  operation_type VARCHAR(20) NOT NULL, -- 'INSERT', 'UPDATE', 'DELETE'
  versioned_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  versioned_by UUID
);

-- Indexes para performance
CREATE INDEX IF NOT EXISTS idx_calendar_items_account_scheduled ON calendar_items(account_id, scheduled_for);
CREATE INDEX IF NOT EXISTS idx_calendar_items_status ON calendar_items(status);
CREATE INDEX IF NOT EXISTS idx_calendar_items_campaign ON calendar_items(campaign_id) WHERE campaign_id IS NOT NULL;

CREATE INDEX IF NOT EXISTS idx_campaign_templates_business_type ON campaign_templates(business_type);
CREATE INDEX IF NOT EXISTS idx_campaign_templates_campaign_type ON campaign_templates(campaign_type);

CREATE INDEX IF NOT EXISTS idx_calendar_suggestions_account_period ON calendar_suggestions(account_id, suggested_for);

CREATE INDEX IF NOT EXISTS idx_optimal_timing_account_type ON optimal_timing(account_id, content_type, channel);

CREATE INDEX IF NOT EXISTS idx_seasonal_knowledge_months ON seasonal_knowledge(start_month, end_month);
CREATE INDEX IF NOT EXISTS idx_seasonal_knowledge_business_types ON seasonal_knowledge USING GIN(business_types);

CREATE INDEX IF NOT EXISTS idx_analytics_post_metrics_account_posted ON analytics_post_metrics(account_id, posted_at);
CREATE INDEX IF NOT EXISTS idx_analytics_post_metrics_platform ON analytics_post_metrics(platform);

CREATE INDEX IF NOT EXISTS idx_calendar_versions_original ON calendar_events_versions(original_id, versioned_at);

-- Trigger para versionamento automático
CREATE OR REPLACE FUNCTION version_calendar_event() RETURNS TRIGGER AS $$
BEGIN
  IF TG_OP = 'INSERT' OR TG_OP = 'UPDATE' THEN
    INSERT INTO calendar_events_versions (
      original_id, account_id, user_id, title, description, content_type,
      channels, scheduled_for, status, priority, objectives, tags,
      operation_type, versioned_by
    ) VALUES (
      NEW.id, NEW.account_id, NEW.user_id, NEW.title, NEW.description, NEW.content_type,
      NEW.channels, NEW.scheduled_for, NEW.status, NEW.priority, NEW.objectives, NEW.tags,
      TG_OP, NEW.user_id
    );
    RETURN NEW;
  ELSIF TG_OP = 'DELETE' THEN
    INSERT INTO calendar_events_versions (
      original_id, account_id, user_id, title, description, content_type,
      channels, scheduled_for, status, priority, objectives, tags,
      operation_type, versioned_by
    ) VALUES (
      OLD.id, OLD.account_id, OLD.user_id, OLD.title, OLD.description, OLD.content_type,
      OLD.channels, OLD.scheduled_for, OLD.status, OLD.priority, OLD.objectives, OLD.tags,
      TG_OP, OLD.user_id
    );
    RETURN OLD;
  END IF;
  RETURN NULL;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trg_version_calendar_event
  AFTER INSERT OR UPDATE OR DELETE ON calendar_items
  FOR EACH ROW EXECUTE FUNCTION version_calendar_event();

-- Trigger para updated_at automático
CREATE OR REPLACE FUNCTION update_updated_at_column() RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trg_calendar_items_updated_at
  BEFORE UPDATE ON calendar_items
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Comentários das tabelas
COMMENT ON TABLE calendar_items IS 'Items do calendário editorial com scheduling e performance tracking';
COMMENT ON TABLE campaign_templates IS 'Templates estruturados de campanhas por business type';
COMMENT ON TABLE calendar_suggestions IS 'Sugestões inteligentes baseadas em sazonalidade e performance';
COMMENT ON TABLE optimal_timing IS 'Analytics de timing ótimo por tipo de conteúdo e canal';
COMMENT ON TABLE seasonal_knowledge IS 'Base de conhecimento de sazonalidades específicas do setor pet';
COMMENT ON TABLE analytics_post_metrics IS 'Métricas de performance dos posts para baseline interno';
COMMENT ON TABLE calendar_events_versions IS 'Versionamento completo dos eventos de calendário para backup';