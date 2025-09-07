-- Migration: Campaign Library Schema v1.0
-- Implements complete campaign template system with performance tracking
-- Created: T-001 Biblioteca de Campanhas Plan
-- PostgreSQL syntax

-- Enums for campaign library
CREATE TYPE campaign_category AS ENUM ('aquisicao', 'retencao', 'upsell', 'educacao', 'emergencia');
CREATE TYPE service_type AS ENUM ('veterinaria', 'estetica', 'hotel', 'petshop', 'adestramento');
CREATE TYPE campaign_status AS ENUM ('draft', 'scheduled', 'published', 'paused', 'completed');
CREATE TYPE asset_type AS ENUM ('photo', 'illustration', 'template', 'video');
CREATE TYPE usage_rights_type AS ENUM ('free', 'premium', 'exclusive');

-- Templates de campanhas
CREATE TABLE campaign_templates (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
  name varchar(200) NOT NULL,
  description text,
  category campaign_category NOT NULL,
  service_type service_type NOT NULL,

  -- Conteúdo estruturado
  content_pieces jsonb NOT NULL,
  visual_assets jsonb,
  customization_options jsonb,

  -- Performance data
  usage_count integer DEFAULT 0 NOT NULL,
  avg_engagement_rate numeric(5,4),
  avg_conversion_rate numeric(5,4),
  success_cases integer DEFAULT 0 NOT NULL,

  -- Sazonalidade
  seasonality jsonb, -- {months: [1,2,3], peak_performance: 'high'}

  -- Metadata
  created_by uuid REFERENCES users(id),
  is_public boolean DEFAULT true NOT NULL,
  is_premium boolean DEFAULT false NOT NULL,

  created_at timestamp DEFAULT now() NOT NULL,
  updated_at timestamp DEFAULT now() NOT NULL
);

-- Campanhas personalizadas dos usuários
CREATE TABLE user_campaigns (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
  user_id uuid NOT NULL REFERENCES users(id),
  template_id uuid REFERENCES campaign_templates(id),
  brand_voice_id uuid REFERENCES brand_voices(id),

  -- Configuração da campanha
  campaign_config jsonb NOT NULL,
  personalized_content jsonb NOT NULL,

  -- Status e execução
  status campaign_status DEFAULT 'draft' NOT NULL,
  scheduled_at timestamp,
  published_at timestamp,

  -- Tracking de performance
  performance_metrics jsonb,

  created_at timestamp DEFAULT now() NOT NULL,
  updated_at timestamp DEFAULT now() NOT NULL
);

-- Performance tracking
CREATE TABLE campaign_performance (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
  campaign_id uuid NOT NULL REFERENCES user_campaigns(id),
  template_id uuid NOT NULL REFERENCES campaign_templates(id),
  channel varchar(50) NOT NULL,

  -- Metrics básicas
  impressions integer DEFAULT 0 NOT NULL,
  reaches integer DEFAULT 0 NOT NULL,
  clicks integer DEFAULT 0 NOT NULL,
  conversions integer DEFAULT 0 NOT NULL,

  -- Rates calculadas
  engagement_rate numeric(5,4),
  click_through_rate numeric(5,4),
  conversion_rate numeric(5,4),

  -- Metadata
  measured_at timestamp DEFAULT now() NOT NULL,

  UNIQUE(campaign_id, channel, DATE(measured_at))
);

-- Assets visuais
CREATE TABLE visual_assets (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
  name varchar(200) NOT NULL,
  type asset_type NOT NULL,
  category varchar(100) NOT NULL,

  -- Arquivo
  url text NOT NULL,
  file_size integer,
  dimensions jsonb, -- {width: 1080, height: 1080}

  -- Variants para diferentes formatos
  variants jsonb, -- {instagram_post: 'url', instagram_story: 'url'}

  -- Customização
  customizable_elements jsonb,

  -- Metadata para busca
  tags text[], -- Array de tags
  pet_types text[], -- Array de tipos de pet
  emotions text[], -- Array de emoções
  usage_rights usage_rights_type DEFAULT 'free' NOT NULL,

  -- Performance
  usage_count integer DEFAULT 0 NOT NULL,
  avg_engagement numeric(5,4),

  created_at timestamp DEFAULT now() NOT NULL
);

-- Performance indexes for campaign templates
CREATE INDEX idx_campaign_templates_category ON campaign_templates (category);
CREATE INDEX idx_campaign_templates_service_type ON campaign_templates (service_type);
CREATE INDEX idx_campaign_templates_usage_count ON campaign_templates (usage_count DESC);
CREATE INDEX idx_campaign_templates_avg_engagement ON campaign_templates (avg_engagement_rate DESC);
CREATE INDEX idx_campaign_templates_created_at ON campaign_templates (created_at DESC);

-- JSONB GIN indexes for content search
CREATE INDEX idx_campaign_templates_content_pieces_gin ON campaign_templates USING gin(content_pieces);
CREATE INDEX idx_campaign_templates_seasonality_gin ON campaign_templates USING gin(seasonality);

-- Performance indexes for user campaigns
CREATE INDEX idx_user_campaigns_user_id ON user_campaigns (user_id);
CREATE INDEX idx_user_campaigns_status ON user_campaigns (status);
CREATE INDEX idx_user_campaigns_template_id ON user_campaigns (template_id);
CREATE INDEX idx_user_campaigns_brand_voice_id ON user_campaigns (brand_voice_id);
CREATE INDEX idx_user_campaigns_created_at ON user_campaigns (created_at DESC);

-- Performance indexes for campaign performance
CREATE INDEX idx_campaign_performance_campaign_id ON campaign_performance (campaign_id);
CREATE INDEX idx_campaign_performance_template_id ON campaign_performance (template_id);
CREATE INDEX idx_campaign_performance_channel ON campaign_performance (channel);
CREATE INDEX idx_campaign_performance_measured_at ON campaign_performance (measured_at DESC);

-- Performance indexes for visual assets
CREATE INDEX idx_visual_assets_type ON visual_assets (type);
CREATE INDEX idx_visual_assets_category ON visual_assets (category);
CREATE INDEX idx_visual_assets_usage_rights ON visual_assets (usage_rights);
CREATE INDEX idx_visual_assets_usage_count ON visual_assets (usage_count DESC);
CREATE INDEX idx_visual_assets_avg_engagement ON visual_assets (avg_engagement DESC);

-- GIN indexes for array searches
CREATE INDEX idx_visual_assets_tags_gin ON visual_assets USING gin(tags);
CREATE INDEX idx_visual_assets_pet_types_gin ON visual_assets USING gin(pet_types);
CREATE INDEX idx_visual_assets_emotions_gin ON visual_assets USING gin(emotions);

-- Comments for documentation
COMMENT ON TABLE campaign_templates IS 'Campaign templates with content pieces and performance data';
COMMENT ON TABLE user_campaigns IS 'User-created campaigns based on templates';
COMMENT ON TABLE campaign_performance IS 'Performance metrics for user campaigns';
COMMENT ON TABLE visual_assets IS 'Visual assets library for campaigns';

-- Insert seed data with 20 basic templates
INSERT INTO campaign_templates (name, description, category, service_type, content_pieces, visual_assets, customization_options, seasonality) VALUES
-- Veterinária - Aquisição
('Consulta Preventiva - Cães', 'Template para promover consultas preventivas em cães', 'aquisicao', 'veterinaria',
 '[{"type": "instagram_post", "base_copy": "Proteja seu melhor amigo! Agende a consulta preventiva e garanta a saúde do seu cão por apenas R$ 89,90", "variables": ["nome_pet", "preco"], "formatting": {"hashtags": ["#SaudePet", "#ConsultaPreventiva"]}}]'::jsonb,
 '[{"type": "photo", "url": "/assets/vet/preventive-dog.jpg"}]'::jsonb,
 '{"colors": ["#4CAF50", "#2196F3"], "fonts": ["Arial", "Helvetica"]}'::jsonb,
 '{"months": [1,2,3,4,5,6,7,8,9,10,11,12], "peak_performance": "medium"}'::jsonb),

('Vacinação Completa - Gatos', 'Campanha para vacinação completa de gatos', 'aquisicao', 'veterinaria',
 '[{"type": "facebook_post", "base_copy": "Vacinação completa para seu gato! Todas as vacinas essenciais em um único pacote por R$ 149,90", "variables": ["preco"], "formatting": {"call_to_action": "Agendar Agora"}}]'::jsonb,
 '[{"type": "illustration", "url": "/assets/vet/vaccination-cat.jpg"}]'::jsonb,
 '{"colors": ["#FF9800", "#9C27B0"], "fonts": ["Verdana", "Georgia"]}'::jsonb,
 '{"months": [1,3,6,9], "peak_performance": "high"}'::jsonb),

-- Estética - Retenção
('Banho e Tosa Premium', 'Template para serviços de banho e tosa premium', 'retencao', 'estetica',
 '[{"type": "instagram_story", "base_copy": "Dia de spa para o seu pet! ✨ Banho e tosa premium com produtos importados", "variables": ["servico"], "formatting": {"emoji": true}}]'::jsonb,
 '[{"type": "photo", "url": "/assets/grooming/premium-spa.jpg"}]'::jsonb,
 '{"colors": ["#E91E63", "#3F51B5"], "fonts": ["Comic Sans", "Impact"]}'::jsonb,
 '{"months": [1,2,3,4,5,6,7,8,9,10,11,12], "peak_performance": "high"}'::jsonb),

('Hidratação Profunda', 'Campanha para tratamento de hidratação profunda', 'retencao', 'estetica',
 '[{"type": "whatsapp_message", "base_copy": "Dê brilho aos pelos do seu pet! Tratamento de hidratação profunda com resultados visíveis", "variables": ["beneficio"], "formatting": {"bold": true}}]'::jsonb,
 '[{"type": "photo", "url": "/assets/grooming/hydration.jpg"}]'::jsonb,
 '{"colors": ["#009688", "#607D8B"], "fonts": ["Arial", "Sans Serif"]}'::jsonb,
 '{"months": [6,7,8,9,10,11,12], "peak_performance": "medium"}'::jsonb),

-- Hotel - Upsell
('Pacote Fim de Semana', 'Template para pacotes especiais de fim de semana', 'upsell', 'hotel',
 '[{"type": "email", "base_copy": "Pacote especial fim de semana! Seu pet merece férias de luxo com monitoramento 24h", "variables": ["duracao", "preco"], "formatting": {"subject": "Oferta Especial: Fim de Semana Pet"}}]'::jsonb,
 '[{"type": "photo", "url": "/assets/hotel/weekend-package.jpg"}]'::jsonb,
 '{"colors": ["#FF5722", "#795548"], "fonts": ["Times New Roman", "Serif"]}'::jsonb,
 '{"months": [12,1,2,7], "peak_performance": "high"}'::jsonb),

('Suite Presidencial', 'Campanha para suítes premium do hotel', 'upsell', 'hotel',
 '[{"type": "instagram_post", "base_copy": "Suite presidencial para seu pet! Cama king size, TV e serviço de quarto 24h 🐾", "variables": ["comodidades"], "formatting": {"hashtags": ["#LuxoPet", "#Hotel5Estrelas"]}}]'::jsonb,
 '[{"type": "photo", "url": "/assets/hotel/presidential-suite.jpg"}]'::jsonb,
 '{"colors": ["#9C27B0", "#673AB7"], "fonts": ["Luxury", "Elegant"]}'::jsonb,
 '{"months": [11,12,1], "peak_performance": "high"}'::jsonb),

-- Petshop - Educação
('Alimentação Natural', 'Template educativo sobre alimentação natural', 'educacao', 'petshop',
 '[{"type": "facebook_post", "base_copy": "Aprenda sobre alimentação natural! Nossos especialistas explicam os benefícios dos alimentos frescos", "variables": ["beneficio"], "formatting": {"link": "Saiba Mais"}}]'::jsonb,
 '[{"type": "illustration", "url": "/assets/petshop/natural-food.jpg"}]'::jsonb,
 '{"colors": ["#4CAF50", "#8BC34A"], "fonts": ["Clean", "Modern"]}'::jsonb,
 '{"months": [1,2,3,4,5,6,7,8,9,10,11,12], "peak_performance": "medium"}'::jsonb),

('Cuidados com Pele', 'Campanha educativa sobre cuidados com a pele', 'educacao', 'petshop',
 '[{"type": "instagram_carousel", "base_copy": "Cuidados com a pele do seu pet: 5 dicas essenciais para manter saudável", "variables": ["dica1", "dica2"], "formatting": {"numbered_list": true}}]'::jsonb,
 '[{"type": "photo", "url": "/assets/petshop/skin-care.jpg"}]'::jsonb,
 '{"colors": ["#00BCD4", "#009688"], "fonts": ["Arial", "Helvetica"]}'::jsonb,
 '{"months": [6,7,8,9], "peak_performance": "medium"}'::jsonb),

-- Adestramento - Emergência
('Adestramento de Emergência', 'Template para situações de emergência comportamental', 'emergencia', 'adestramento',
 '[{"type": "whatsapp_message", "base_copy": "Problemas comportamentais? Agende avaliação de emergência hoje mesmo!", "variables": ["problema"], "formatting": {"urgent": true}}]'::jsonb,
 '[{"type": "illustration", "url": "/assets/training/emergency.jpg"}]'::jsonb,
 '{"colors": ["#F44336", "#E91E63"], "fonts": ["Bold", "Impact"]}'::jsonb,
 '{"months": [1,2,3,4,5,6,7,8,9,10,11,12], "peak_performance": "high"}'::jsonb),

('Socialização Intensiva', 'Programa de socialização para pets agressivos', 'emergencia', 'adestramento',
 '[{"type": "email", "base_copy": "Programa intensivo de socialização: Transforme seu pet agressivo em um companheiro sociável", "variables": ["duracao", "resultado"], "formatting": {"subject": "Solução para Agressividade"}}]'::jsonb,
 '[{"type": "photo", "url": "/assets/training/socialization.jpg"}]'::jsonb,
 '{"colors": ["#FF9800", "#FF5722"], "fonts": ["Professional", "Clean"]}'::jsonb,
 '{"months": [1,2,3,4,5,6,7,8,9,10,11,12], "peak_performance": "medium"}'::jsonb),

-- Mais templates para completar 20
('Check-up Sazonal', 'Campanha para check-ups sazonais', 'aquisicao', 'veterinaria',
 '[{"type": "instagram_post", "base_copy": "Check-up sazonal: Monitore a saúde do seu pet durante todo o ano", "variables": ["estacao"], "formatting": {"hashtags": ["#SaudePet", "#CheckUp"]}}]'::jsonb,
 '[{"type": "illustration", "url": "/assets/vet/seasonal-checkup.jpg"}]'::jsonb,
 '{"colors": ["#2196F3", "#03A9F4"], "fonts": ["Arial", "Sans Serif"]}'::jsonb,
 '{"months": [3,6,9,12], "peak_performance": "high"}'::jsonb),

('Tosa Criativa', 'Tosa artística para pets', 'retencao', 'estetica',
 '[{"type": "instagram_story", "base_copy": "Tosa criativa: Transforme seu pet em uma obra de arte! 🎨✂️", "variables": ["estilo"], "formatting": {"emoji": true}}]'::jsonb,
 '[{"type": "photo", "url": "/assets/grooming/creative-cut.jpg"}]'::jsonb,
 '{"colors": ["#E91E63", "#9C27B0"], "fonts": ["Playful", "Fun"]}'::jsonb,
 '{"months": [1,2,3,4,5,6,7,8,9,10,11,12], "peak_performance": "medium"}'::jsonb),

('Pacote Natalino', 'Pacote especial de Natal', 'upsell', 'hotel',
 '[{"type": "email", "base_copy": "Natal no hotel pet! Presenteie seu amigo com uma estadia inesquecível", "variables": ["duracao", "presente"], "formatting": {"subject": "Feliz Natal - Presente Especial"}}]'::jsonb,
 '[{"type": "photo", "url": "/assets/hotel/christmas-package.jpg"}]'::jsonb,
 '{"colors": ["#F44336", "#4CAF50"], "fonts": ["Festive", "Holiday"]}'::jsonb,
 '{"months": [12], "peak_performance": "high"}'::jsonb),

('Ração Premium', 'Linha premium de rações', 'educacao', 'petshop',
 '[{"type": "facebook_post", "base_copy": "Descubra nossa linha premium: Nutrição superior para seu pet de estimação", "variables": ["beneficio_principal"], "formatting": {"link": "Conheça a Linha"}}]'::jsonb,
 '[{"type": "photo", "url": "/assets/petshop/premium-food.jpg"}]'::jsonb,
 '{"colors": ["#FF9800", "#FFC107"], "fonts": ["Modern", "Clean"]}'::jsonb,
 '{"months": [1,2,3,4,5,6,7,8,9,10,11,12], "peak_performance": "medium"}'::jsonb),

('Obediência Básica', 'Curso básico de obediência', 'emergencia', 'adestramento',
 '[{"type": "whatsapp_message", "base_copy": "Curso básico de obediência: Ensine comandos essenciais ao seu pet", "variables": ["comando1", "comando2"], "formatting": {"list": true}}]'::jsonb,
 '[{"type": "illustration", "url": "/assets/training/basic-obedience.jpg"}]'::jsonb,
 '{"colors": ["#4CAF50", "#8BC34A"], "fonts": ["Clear", "Readable"]}'::jsonb,
 '{"months": [1,2,3,4,5,6,7,8,9,10,11,12], "peak_performance": "medium"}'::jsonb),

('Cirurgia Eletiva', 'Campanha para cirurgias eletivas', 'aquisicao', 'veterinaria',
 '[{"type": "instagram_post", "base_copy": "Cirurgias eletivas com tecnologia de ponta e recuperação rápida", "variables": ["procedimento"], "formatting": {"hashtags": ["#CirurgiaPet", "#Tecnologia"]}}]'::jsonb,
 '[{"type": "illustration", "url": "/assets/vet/elective-surgery.jpg"}]'::jsonb,
 '{"colors": ["#607D8B", "#9E9E9E"], "fonts": ["Professional", "Medical"]}'::jsonb,
 '{"months": [1,2,3,4,5,6,7,8,9,10,11,12], "peak_performance": "low"}'::jsonb),

('Spa Day Completo', 'Dia completo de spa para pets', 'retencao', 'estetica',
 '[{"type": "instagram_carousel", "base_copy": "Spa Day Completo: Massagem, hidratação e muito amor para seu pet", "variables": ["servico1", "servico2"], "formatting": {"numbered_list": true}}]'::jsonb,
 '[{"type": "photo", "url": "/assets/grooming/spa-day.jpg"}]'::jsonb,
 '{"colors": ["#E91E63", "#F48FB1"], "fonts": ["Elegant", "Luxury"]}'::jsonb,
 '{"months": [1,2,3,4,5,6,7,8,9,10,11,12], "peak_performance": "high"}'::jsonb),

('Pacote Aniversário', 'Pacote especial para aniversário do pet', 'upsell', 'hotel',
 '[{"type": "email", "base_copy": "Aniversário do seu pet no hotel! Celebre com festa e muito carinho", "variables": ["idade", "festa"], "formatting": {"subject": "Feliz Aniversário!"}}]'::jsonb,
 '[{"type": "photo", "url": "/assets/hotel/birthday-package.jpg"}]'::jsonb,
 '{"colors": ["#FF9800", "#FFD54F"], "fonts": ["Celebration", "Fun"]}'::jsonb,
 '{"months": [1,2,3,4,5,6,7,8,9,10,11,12], "peak_performance": "high"}'::jsonb),

('Suplementos Naturais', 'Linha de suplementos naturais', 'educacao', 'petshop',
 '[{"type": "facebook_post", "base_copy": "Suplementos naturais para saúde e vitalidade do seu pet", "variables": ["beneficio"], "formatting": {"link": "Ver Produtos"}}]'::jsonb,
 '[{"type": "illustration", "url": "/assets/petshop/natural-supplements.jpg"}]'::jsonb,
 '{"colors": ["#4CAF50", "#66BB6A"], "fonts": ["Natural", "Organic"]}'::jsonb,
 '{"months": [1,2,3,4,5,6,7,8,9,10,11,12], "peak_performance": "medium"}'::jsonb),

('Reabilitação Física', 'Programa de reabilitação para pets', 'emergencia', 'adestramento',
 '[{"type": "whatsapp_message", "base_copy": "Programa de reabilitação: Ajude seu pet a se recuperar com exercícios especializados", "variables": ["condicao"], "formatting": {"urgent": true}}]'::jsonb,
 '[{"type": "photo", "url": "/assets/training/rehabilitation.jpg"}]'::jsonb,
 '{"colors": ["#2196F3", "#64B5F6"], "fonts": ["Medical", "Professional"]}'::jsonb,
 '{"months": [1,2,3,4,5,6,7,8,9,10,11,12], "peak_performance": "medium"}'::jsonb),

('Campanha Vermifugação', 'Campanha preventiva de vermifugação', 'aquisicao', 'veterinaria',
 '[{"type": "instagram_story", "base_copy": "Vermifugação preventiva: Proteja seu pet contra parasitas", "variables": ["frequencia"], "formatting": {"emoji": true}}]'::jsonb,
 '[{"type": "illustration", "url": "/assets/vet/deworming.jpg"}]'::jsonb,
 '{"colors": ["#4CAF50", "#81C784"], "fonts": ["Friendly", "Approach"]}'::jsonb,
 '{"months": [1,4,7,10], "peak_performance": "high"}'::jsonb);