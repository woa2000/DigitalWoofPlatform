# 🏗️ DER - Digital Woof Platform
## Diagrama de Entidade e Relacionamento

**Data de Criação:** 07/09/2025  
**Versão:** 1.0  
**Sistema:** Digital Woof Platform - Plataforma de Marketing Digital para Pet Business

---

## 📊 Visão Geral do Sistema

A Digital Woof Platform é uma aplicação **multi-tenant** que oferece soluções de marketing digital especializadas para negócios do setor pet (veterinárias, petshops, hotéis para pets, etc.). O sistema é baseado em:

- **Sistema Multi-Tenant**: Isolamento por tenant_id
- **Autenticação**: Supabase Auth (auth.users)
- **IA Generativa**: Criação automática de conteúdo
- **Compliance**: Validação de conteúdo para setor veterinário
- **Brand Voice**: Personalização de tom de marca

---

## 🏢 SISTEMA DE TENANTS

### 📋 tenants
**Descrição:** Tabela principal de organizações/empresas no sistema
```sql
tenants {
  🔑 id: UUID [PK]
  📛 name: TEXT [NOT NULL] // Nome da empresa
  🔗 slug: TEXT [UNIQUE, NOT NULL] // URL-friendly
  🌐 domain: TEXT [UNIQUE] // Domínio personalizado
  🏪 business_type: TEXT // veterinaria, petshop, hotel
  💳 subscription_plan: TEXT [DEFAULT 'free']
  📊 subscription_status: TEXT [DEFAULT 'active']
  📅 subscription_end_date: TIMESTAMPTZ
  ⚙️ settings: JSONB [DEFAULT '{}']
  🎨 brand_guidelines: JSONB [DEFAULT '{}']
  💰 billing_info: JSONB [DEFAULT '{}']
  👤 owner_id: UUID [NOT NULL] // Dono do tenant
  📈 status: TEXT [DEFAULT 'active']
  📝 created_at: TIMESTAMPTZ [DEFAULT NOW()]
  🔄 updated_at: TIMESTAMPTZ [DEFAULT NOW()]
}
```

### 👥 tenant_users
**Descrição:** Relacionamento many-to-many entre tenants e usuários
```sql
tenant_users {
  🔑 id: UUID [PK]
  🏢 tenant_id: UUID [FK → tenants.id] [NOT NULL]
  👤 user_id: UUID [NOT NULL] // → auth.users.id
  🎭 role: TEXT [DEFAULT 'member'] // owner, admin, member, viewer
  🔐 permissions: JSONB [DEFAULT '[]']
  📊 status: TEXT [DEFAULT 'active'] // active, invited, suspended
  👥 invited_by: UUID // → auth.users.id
  📧 invited_at: TIMESTAMPTZ
  ✅ joined_at: TIMESTAMPTZ [DEFAULT NOW()]
  📝 created_at: TIMESTAMPTZ [DEFAULT NOW()]
  🔄 updated_at: TIMESTAMPTZ [DEFAULT NOW()]
  
  🔒 UNIQUE(tenant_id, user_id)
}
```

---

## 👤 SISTEMA DE USUÁRIOS

### 👤 profiles
**Descrição:** Perfis de usuários com informações específicas da aplicação
```sql
profiles {
  🔑 id: UUID [PK] // → auth.users.id
  🏢 tenant_id: UUID [FK → tenants.id]
  👤 full_name: TEXT
  🖼️ avatar_url: TEXT
  🏪 business_name: TEXT
  🏢 business_type: TEXT
  📞 phone: TEXT
  🌐 website: TEXT
  📍 address: TEXT
  🏙️ city: TEXT
  🗺️ state: TEXT
  📮 zip_code: TEXT
  🌍 country: TEXT [DEFAULT 'BR']
  💳 plan_type: TEXT [DEFAULT 'free']
  📊 subscription_status: TEXT [DEFAULT 'active']
  📅 subscription_end_date: TIMESTAMPTZ
  ✅ onboarding_completed: BOOLEAN [DEFAULT false]
  🚀 onboarding_step: TEXT [DEFAULT 'welcome']
  🕐 timezone: TEXT [DEFAULT 'America/Sao_Paulo']
  🌐 language: TEXT [DEFAULT 'pt-BR']
  🔔 notifications: JSONB [DEFAULT...]
  📝 metadata: JSONB [DEFAULT '{}']
  📝 created_at: TIMESTAMPTZ [DEFAULT NOW()]
  🔄 updated_at: TIMESTAMPTZ [DEFAULT NOW()]
}
```

---


### 🎨 brand_voice_jsons
**Descrição:** Sistema atual de Brand Voice JSON Schema v1.0
```sql
brand_voice_jsons {
  🔑 id: UUID [PK]
  👤 user_id: UUID [NOT NULL]
  🏢 tenant_id: UUID [FK → tenants.id]
  📋 brand_voice_json: JSONB [NOT NULL] // Schema completo
  📛 name: TEXT [NOT NULL]
  🔢 version: TEXT [DEFAULT '1.0']
  📊 status: TEXT [DEFAULT 'draft'] // draft, active, archived
  🔄 generated_from: TEXT // onboarding, anamnesis, manual
  🔬 source_analysis_id: UUID [FK → anamnesis_analysis.id]
  🚀 source_onboarding_id: UUID [FK → brand_onboarding.id]
  
  // Quality Metrics
  📊 quality_score_overall: NUMERIC(5,2)
  📈 quality_score_completeness: NUMERIC(5,2)
  🔄 quality_score_consistency: NUMERIC(5,2)
  🎯 quality_score_specificity: NUMERIC(5,2)
  💡 quality_score_usability: NUMERIC(5,2)
  
  // Cache & Performance
  ✅ last_validated_at: TIMESTAMPTZ
  🔑 cache_key: TEXT [UNIQUE]
  📊 usage_count: INTEGER [DEFAULT 0]
  ⏰ last_used_at: TIMESTAMPTZ
  
  📝 created_at: TIMESTAMPTZ [DEFAULT NOW()]
  🔄 updated_at: TIMESTAMPTZ [DEFAULT NOW()]
  ✅ activated_at: TIMESTAMPTZ
  📦 archived_at: TIMESTAMPTZ
}
```

### 🚀 brand_onboarding
**Descrição:** Wizard de configuração da marca
```sql
brand_onboarding {
  🔑 id: UUID [PK]
  👤 user_id: UUID [NOT NULL, UNIQUE]
  🏢 tenant_id: UUID [FK → tenants.id]
  
  // Visual Identity
  🖼️ logo_url: TEXT
  🎨 palette: JSONB // Array de cores hex
  📏 logo_metadata: JSONB // dimensões, formato, etc.
  
  // Tom de Voz (sliders 0.0-1.0)
  🎭 tone_config: JSONB [NOT NULL] // {confianca, acolhimento, humor, especializacao}
  
  // Configuração de Linguagem
  🗣️ language_config: JSONB [NOT NULL] // {preferredTerms, avoidTerms, defaultCTAs}
  
  // Valores da Marca
  💎 brand_values: JSONB // {mission, values, disclaimer}
  
  // Controle do Wizard
  🚀 step_completed: TEXT // logo, palette, tone, language, values, completed
  
  📝 created_at: TIMESTAMPTZ [DEFAULT NOW()]
  🔄 updated_at: TIMESTAMPTZ [DEFAULT NOW()]
  ✅ completed_at: TIMESTAMPTZ
}
```

---

## 🔬 SISTEMA DE ANAMNESE DIGITAL

### 🔍 anamnesis_analysis
**Descrição:** Análise de presença digital
```sql
anamnesis_analysis {
  🔑 id: UUID [PK]
  👤 user_id: UUID [NOT NULL]
  🏢 tenant_id: UUID [FK → tenants.id]
  🌐 primary_url: TEXT [NOT NULL]
  📊 status: TEXT [NOT NULL] // queued, running, done, error
  📈 score_completeness: NUMERIC(5,2)
  ❌ error_message: TEXT
  📝 created_at: TIMESTAMPTZ [DEFAULT NOW()]
  🔄 updated_at: TIMESTAMPTZ [DEFAULT NOW()]
}
```

### 📄 anamnesis_source
**Descrição:** URLs sendo analisadas
```sql
anamnesis_source {
  🔑 id: UUID [PK]
  🔬 analysis_id: UUID [FK → anamnesis_analysis.id] [NOT NULL]
  📝 type: TEXT [NOT NULL] // site, social
  🌐 url: TEXT [NOT NULL]
  🔗 normalized_url: TEXT [NOT NULL]
  📱 provider: TEXT // instagram, facebook, etc.
  ⏰ last_fetched_at: TIMESTAMPTZ
  #️⃣ hash: TEXT [UNIQUE, NOT NULL]
}
```

### 📊 anamnesis_finding
**Descrição:** Resultados da análise por seção
```sql
anamnesis_finding {
  🔑 id: UUID [PK]
  🔬 analysis_id: UUID [FK → anamnesis_analysis.id] [NOT NULL]
  🔑 key: TEXT [NOT NULL]
  📂 section: TEXT [NOT NULL] // identity, personas, ux, ecosystem, etc.
  📋 payload: JSONB [NOT NULL]
}
```

### 🏥 business_anamnesis
**Descrição:** Anamnese do negócio
```sql
business_anamnesis {
  🔑 id: UUID [PK]
  👤 user_id: UUID [NOT NULL]
  🏢 tenant_id: UUID [FK → tenants.id]
  📋 responses: JSONB [NOT NULL]
  🔬 analysis: JSONB
  💡 recommendations: JSONB
  📊 score: INTEGER
  ✅ completed_at: TIMESTAMPTZ [DEFAULT NOW()]
}
```

---

## 📢 SISTEMA DE CAMPANHAS

### 📋 campaigns
**Descrição:** Campanhas de marketing
```sql
campaigns {
  🔑 id: UUID [PK]
  👤 user_id: UUID [NOT NULL]
  🏢 tenant_id: UUID [FK → tenants.id]
  📛 name: TEXT [NOT NULL]
  📝 type: TEXT [NOT NULL]
  📊 status: TEXT [NOT NULL]
  📱 channels: JSONB [NOT NULL]
  🎯 target_audience: JSONB [NOT NULL]
  📊 metrics: JSONB
  📝 created_at: TIMESTAMPTZ [DEFAULT NOW()]
  🔄 updated_at: TIMESTAMPTZ [DEFAULT NOW()]
}
```

### 📋 campaign_templates
**Descrição:** Templates de campanhas pré-definidas
```sql
campaign_templates {
  🔑 id: UUID [PK]
  📛 name: VARCHAR(200) [NOT NULL]
  📝 description: TEXT
  📂 category: TEXT [NOT NULL]
  🏥 service_type: TEXT [NOT NULL]
  📄 content_pieces: JSONB [NOT NULL]
  🎨 visual_assets: JSONB
  ⚙️ customization_options: JSONB
  📊 usage_count: INTEGER [DEFAULT 0]
  📈 avg_engagement_rate: NUMERIC(5,4)
  💰 avg_conversion_rate: NUMERIC(5,4)
  ✅ success_cases: INTEGER [DEFAULT 0]
  🌱 seasonality: JSONB
  👤 created_by: UUID
  🌐 is_public: BOOLEAN [DEFAULT true]
  💎 is_premium: BOOLEAN [DEFAULT false]
  📝 created_at: TIMESTAMPTZ [DEFAULT NOW()]
  🔄 updated_at: TIMESTAMPTZ [DEFAULT NOW()]
}
```

### 👤 user_campaigns
**Descrição:** Campanhas personalizadas dos usuários
```sql
user_campaigns {
  🔑 id: UUID [PK]
  👤 user_id: UUID [NOT NULL]
  🏢 tenant_id: UUID [FK → tenants.id]
  📋 template_id: UUID [FK → campaign_templates.id]
  🎭 brand_voice_id: UUID [FK → brand_voices.id]
  ⚙️ campaign_config: JSONB [NOT NULL]
  📝 personalized_content: JSONB [NOT NULL]
  📊 status: TEXT [DEFAULT 'draft']
  📅 scheduled_at: TIMESTAMPTZ
  📤 published_at: TIMESTAMPTZ
  📊 performance_metrics: JSONB
  📝 created_at: TIMESTAMPTZ [DEFAULT NOW()]
  🔄 updated_at: TIMESTAMPTZ [DEFAULT NOW()]
}
```

### 📊 campaign_performance
**Descrição:** Métricas de performance das campanhas
```sql
campaign_performance {
  🔑 id: UUID [PK]
  📋 campaign_id: UUID [FK → user_campaigns.id] [NOT NULL]
  📋 template_id: UUID [FK → campaign_templates.id] [NOT NULL]
  📱 channel: VARCHAR(50) [NOT NULL]
  👁️ impressions: INTEGER [DEFAULT 0]
  📈 reaches: INTEGER [DEFAULT 0]
  🖱️ clicks: INTEGER [DEFAULT 0]
  💰 conversions: INTEGER [DEFAULT 0]
  📊 engagement_rate: NUMERIC(5,4)
  🔗 click_through_rate: NUMERIC(5,4)
  💹 conversion_rate: NUMERIC(5,4)
  📅 measured_at: TIMESTAMPTZ [DEFAULT NOW()]
}
```

---

## 🤖 SISTEMA DE IA E CONTEÚDO

### 📝 ai_content
**Descrição:** Conteúdo gerado por IA
```sql
ai_content {
  🔑 id: UUID [PK]
  👤 user_id: UUID [NOT NULL]
  🏢 tenant_id: UUID [FK → tenants.id]
  📋 campaign_id: UUID [FK → campaigns.id]
  📝 type: TEXT [NOT NULL]
  📱 platform: TEXT
  📰 title: TEXT
  📄 content: TEXT [NOT NULL]
  #️⃣ hashtags: JSONB
  🎨 visual_suggestions: JSONB
  💭 prompt_used: TEXT
  🤖 ai_model: TEXT
  ⚙️ generation_params: JSONB
  📊 status: TEXT [DEFAULT 'draft']
  ✅ approval_status: TEXT [DEFAULT 'pending']
  📅 scheduled_date: TIMESTAMPTZ
  📤 published_date: TIMESTAMPTZ
  📊 engagement_metrics: JSONB
  📝 created_at: TIMESTAMPTZ [DEFAULT NOW()]
  🔄 updated_at: TIMESTAMPTZ [DEFAULT NOW()]
}
```

### 📋 content_briefs
**Descrição:** Especificações para geração de conteúdo
```sql
content_briefs {
  🔑 id: UUID [PK]
  👤 user_id: UUID [NOT NULL]
  🏢 tenant_id: UUID [FK → tenants.id]
  🎯 theme: TEXT [NOT NULL]
  🎯 objective: TEXT [NOT NULL]
  📱 channel: TEXT [NOT NULL]
  📝 format: TEXT [NOT NULL]
  🎭 brand_voice_id: UUID [FK → brand_voice_jsons.id] [NOT NULL]
  📝 custom_instructions: TEXT
  🚫 words_to_avoid: JSONB
  📋 campaign_id: UUID [FK → campaigns.id]
  📋 template_id: UUID
  📝 created_at: TIMESTAMPTZ [DEFAULT NOW()]
  🔄 updated_at: TIMESTAMPTZ [DEFAULT NOW()]
}
```

### 📄 generated_content
**Descrição:** Conteúdo gerado com variações
```sql
generated_content {
  🔑 id: UUID [PK]
  📋 brief_id: UUID [FK → content_briefs.id] [NOT NULL]
  🔄 variations: JSONB [NOT NULL]
  💡 creative_brief: JSONB
  🚨 compliance_flags: JSONB [DEFAULT '[]']
  📊 compliance_score: NUMERIC(3,2) [NOT NULL]
  📊 quality_metrics: JSONB
  📊 status: TEXT [DEFAULT 'generated']
  ✅ approved_variation_id: TEXT
  👤 approved_by: UUID
  ✅ approved_at: TIMESTAMPTZ
  📊 generation_metrics: JSONB
  📝 created_at: TIMESTAMPTZ [DEFAULT NOW()]
  🔄 updated_at: TIMESTAMPTZ [DEFAULT NOW()]
}
```

### 📝 content_feedback
**Descrição:** Feedback para melhoria da IA
```sql
content_feedback {
  🔑 id: UUID [PK]
  📄 content_id: UUID [FK → generated_content.id] [NOT NULL]
  🔄 variation_id: TEXT [NOT NULL]
  📝 feedback_type: TEXT [NOT NULL]
  📄 feedback_text: TEXT
  ⭐ rating: INTEGER // 1-5
  💡 improvement_suggestions: JSONB
  🔄 regeneration_notes: TEXT
  👤 user_id: UUID [NOT NULL]
  📝 created_at: TIMESTAMPTZ [DEFAULT NOW()]
}
```

### 🤖 ai_prompts
**Descrição:** Templates e configurações de prompts de IA
```sql
ai_prompts {
  🔑 id: UUID [PK]
  📛 name: VARCHAR(200) [NOT NULL]
  📝 prompt_type: TEXT [NOT NULL]
  🤖 system_prompt: TEXT [NOT NULL]
  👤 user_prompt_template: TEXT [NOT NULL]
  🤖 model: VARCHAR(50) [DEFAULT 'gpt-4']
  🌡️ temperature: NUMERIC(3,2) [DEFAULT 0.7]
  📊 max_tokens: INTEGER [DEFAULT 1000]
  🔢 version: INTEGER [DEFAULT 1]
  ✅ is_active: BOOLEAN [DEFAULT true]
  📊 usage_count: INTEGER [DEFAULT 0]
  📊 avg_quality_score: NUMERIC(3,2)
  📝 created_at: TIMESTAMPTZ [DEFAULT NOW()]
}
```

---

## 🛡️ SISTEMA DE COMPLIANCE

### ✅ compliance_checks
**Descrição:** Verificações de compliance automáticas
```sql
compliance_checks {
  🔑 id: UUID [PK]
  📄 content_id: UUID [FK → ai_content.id] [NOT NULL]
  📂 category: TEXT [NOT NULL] // medical, promotional, safety
  🚨 severity: TEXT [NOT NULL] // critical, high, medium, low
  📋 rule: TEXT [NOT NULL]
  ✅ passed: BOOLEAN [NOT NULL]
  📄 message: TEXT
  💡 suggestion: TEXT
  📝 created_at: TIMESTAMPTZ [DEFAULT NOW()]
}
```

---

## 🎨 SISTEMA DE ASSETS

### 🖼️ assets
**Descrição:** Biblioteca de assets visuais
```sql
assets {
  🔑 id: UUID [PK]
  📛 name: VARCHAR(200) [NOT NULL]
  📝 description: TEXT
  📝 type: TEXT [NOT NULL] // image, video, icon, template
  📂 category: VARCHAR(100) [NOT NULL] // pets, medical, seasonal
  📄 format: VARCHAR(10) [NOT NULL] // jpg, png, svg, mp4
  🌐 url: TEXT [NOT NULL]
  🖼️ thumbnail_url: TEXT [NOT NULL]
  👁️ preview_url: TEXT
  📊 file_size: INTEGER [NOT NULL]
  📏 dimensions: JSONB [NOT NULL]
  🏷️ tags: JSONB
  🎨 colors: JSONB
  🐕 pet_types: JSONB
  😊 emotions: JSONB
  💎 is_premium: BOOLEAN [DEFAULT false]
  🌐 is_public: BOOLEAN [DEFAULT true]
  📋 usage_rights: TEXT [DEFAULT 'free']
  📊 usage_count: INTEGER [DEFAULT 0]
  📥 download_count: INTEGER [DEFAULT 0]
  ⭐ rating: NUMERIC(3,2) [DEFAULT 0.0]
  🔄 variants: JSONB
  📋 metadata: JSONB
  👤 created_by: UUID
  📝 created_at: TIMESTAMPTZ [DEFAULT NOW()]
  🔄 updated_at: TIMESTAMPTZ [DEFAULT NOW()]
}
```

### 📁 asset_collections
**Descrição:** Coleções de assets organizadas
```sql
asset_collections {
  🔑 id: UUID [PK]
  📛 name: VARCHAR(200) [NOT NULL]
  📝 description: TEXT
  🏢 tenant_id: UUID [FK → tenants.id]
  🌐 is_public: BOOLEAN [DEFAULT false]
  👤 created_by: UUID [NOT NULL]
  📝 created_at: TIMESTAMPTZ [DEFAULT NOW()]
  🔄 updated_at: TIMESTAMPTZ [DEFAULT NOW()]
}
```

### 📎 asset_collection_items
**Descrição:** Itens dentro das coleções
```sql
asset_collection_items {
  🔑 id: UUID [PK]
  📁 collection_id: UUID [FK → asset_collections.id] [NOT NULL]
  🖼️ asset_id: UUID [FK → assets.id] [NOT NULL]
  📝 added_at: TIMESTAMPTZ [DEFAULT NOW()]
}
```

### ⭐ asset_favorites
**Descrição:** Assets favoritos dos usuários
```sql
asset_favorites {
  🔑 id: UUID [PK]
  👤 user_id: UUID [NOT NULL]
  🖼️ asset_id: UUID [FK → assets.id] [NOT NULL]
  📝 added_at: TIMESTAMPTZ [DEFAULT NOW()]
  
  🔒 UNIQUE(user_id, asset_id)
}
```

### 📊 asset_analytics
**Descrição:** Analytics de uso dos assets
```sql
asset_analytics {
  🔑 id: UUID [PK]
  🖼️ asset_id: UUID [FK → assets.id] [NOT NULL]
  👤 user_id: UUID
  📝 action: TEXT [NOT NULL] // view, download, favorite
  📋 metadata: JSONB
  📝 created_at: TIMESTAMPTZ [DEFAULT NOW()]
}
```

---

## 🎨 SISTEMA DE BRAND ASSETS

### 🏢 brand_assets
**Descrição:** Assets específicos da marca (logos, cores, etc.)
```sql
brand_assets {
  🔑 id: UUID [PK]
  👤 user_id: UUID [NOT NULL]
  📝 type: TEXT [NOT NULL] // logo, color_palette, typography
  📛 name: TEXT [NOT NULL]
  📄 file_name: TEXT [NOT NULL]
  🌐 file_url: TEXT [NOT NULL]
  📋 metadata: JSONB
  📝 created_at: TIMESTAMPTZ [DEFAULT NOW()]
}
```

---

## 📊 TABELAS DE CONTROLE

### 📝 migration_history
**Descrição:** Histórico de execução das migrações
```sql
migration_history {
  🔑 id: UUID [PK]
  📄 filename: TEXT [UNIQUE, NOT NULL]
  #️⃣ checksum: TEXT [NOT NULL]
  📝 executed_at: TIMESTAMPTZ [DEFAULT NOW()]
  ⏱️ execution_time_ms: INTEGER
  📊 status: TEXT [DEFAULT 'success']
  💬 notes: TEXT
}
```

---

## 🔗 RELACIONAMENTOS PRINCIPAIS

### 🏢 Multi-Tenancy
```
tenants (1) ←→ (N) tenant_users ←→ (1) auth.users
tenants (1) ←→ (N) profiles
tenants (1) ←→ (N) brand_voice_jsons
tenants (1) ←→ (N) campaigns
tenants (1) ←→ (N) ai_content
tenants (1) ←→ (N) asset_collections
```

### 🎨 Brand Voice System
```
brand_onboarding (1) ←→ (N) brand_voice_jsons
anamnesis_analysis (1) ←→ (N) brand_voice_jsons
brand_voice_jsons (1) ←→ (N) content_briefs
```

### 🔬 Anamnesis System
```
anamnesis_analysis (1) ←→ (N) anamnesis_source
anamnesis_analysis (1) ←→ (N) anamnesis_finding
```

### 📢 Campaign System
```
campaign_templates (1) ←→ (N) user_campaigns
user_campaigns (1) ←→ (N) campaign_performance
campaigns (1) ←→ (N) ai_content
campaigns (1) ←→ (N) content_briefs
```

### 🤖 Content Generation
```
content_briefs (1) ←→ (1) generated_content
generated_content (1) ←→ (N) content_feedback
ai_content (1) ←→ (N) compliance_checks
```

### 🎨 Asset Management
```
asset_collections (1) ←→ (N) asset_collection_items ←→ (1) assets
assets (1) ←→ (N) asset_favorites
assets (1) ←→ (N) asset_analytics
```

---

## 🔒 POLÍTICAS DE SEGURANÇA

### Row Level Security (RLS)
Todas as tabelas principais implementam RLS baseado em:
- **user_id**: Acesso apenas aos próprios dados
- **tenant_id**: Isolamento por tenant
- **tenant_users**: Controle de acesso baseado em roles

### Roles e Permissões
- **owner**: Controle total do tenant
- **admin**: Gestão de usuários e configurações
- **member**: Acesso às funcionalidades principais
- **viewer**: Apenas visualização

---

## 📈 ÍNDICES PRINCIPAIS

### Performance Crítica
```sql
-- Tenants
idx_tenants_slug, idx_tenants_owner_id
idx_tenant_users_tenant_id, idx_tenant_users_user_id

-- Brand Voice
idx_brand_voice_user_id, idx_brand_voice_tenant_id
idx_brand_onboarding_user_id

-- Campaigns
idx_campaigns_user_id, idx_campaigns_status
idx_ai_content_user_id, idx_ai_content_campaign_id

-- Assets
idx_assets_type, idx_assets_category
idx_asset_favorites_user_asset
```

---

## 🚀 TRIGGERS AUTOMÁTICOS

### Timestamps
- `update_updated_at_column()`: Atualiza `updated_at` automaticamente
- Aplicado em: tenants, tenant_users, profiles, brand_onboarding, campaigns, ai_content

### Tenant Management
- `create_default_tenant_for_user()`: Cria tenant automático no primeiro login
- `generate_unique_slug()`: Gera slugs únicos para tenants

---

## 🎯 CASOS DE USO PRINCIPAIS

### 1. 🚀 Onboarding de Nova Empresa
```
auth.users → profiles → tenants → tenant_users → brand_onboarding → brand_voice_jsons
```

### 2. 📝 Geração de Conteúdo
```
brand_voice_jsons → content_briefs → generated_content → ai_content
```

### 3. 📊 Análise de Presença Digital
```
anamnesis_analysis → anamnesis_source → anamnesis_finding → brand_voice_jsons
```

### 4. 📢 Campanha de Marketing
```
campaign_templates → user_campaigns → generated_content → campaign_performance
```

---

## 📋 STATUS DE IMPLEMENTAÇÃO

### ✅ Implementado e Funcional
- Sistema Multi-Tenant completo
- Autenticação e profiles
- Brand Voice JSON Schema
- Sistema de migrações centralizadas
- Anamnese digital básica
- Campanhas básicas

### 🚧 Em Desenvolvimento
- Sistema completo de assets
- Performance analytics avançado
- Compliance automático
- Sistema de feedback para IA

### 📋 Planejado
- Integração com redes sociais
- Agendamento de posts
- Dashboard de analytics
- Sistema de templates avançado

---

**Última Atualização:** 07/09/2025  
**Desenvolvido por:** Digital Woof Platform Team  
**Banco de Dados:** PostgreSQL 15+ com Supabase