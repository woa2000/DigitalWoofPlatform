# F-5: Biblioteca de Campanhas Pet

**Status:** 📅 Planejado  
**Fase:** 2 - Criação de Conteúdo  
**Prioridade:** P0 (Crítico)  
**Responsáveis:** IA/ML, Frontend, Backend  
**Depende de:** F-3 (Brand Voice JSON), F-4 (Manual de Marca)

---

## Visão Geral
Catálogo inteligente de templates de campanhas específicas para o setor pet, com conteúdo pré-gerado e personalizável baseado no Brand Voice da marca. Combina conhecimento especializado do setor com IA para acelerar a criação de campanhas de marketing.

## Objetivo
Permitir que qualquer marca do setor pet crie campanhas profissionais e eficazes em < 10 minutos, utilizando templates cientificamente validados e automaticamente personalizados com sua identidade de marca.

---

## Funcionalidades

### 📚 Catálogo de Templates

**Categorização Inteligente:**

*Por Objetivo de Negócio:*
- **Aquisição:** Primeira consulta, novos clientes, trial services
- **Retenção:** Loyalty programs, check-ups regulares, aniversários
- **Upsell:** Procedimentos extras, produtos premium, pacotes
- **Educação:** Prevenção, cuidados sazonais, bem-estar geral
- **Emergência:** Comunicação de crises, mudanças de protocolo

*Por Sazonalidade:*
- **Janeiro:** Detox pós-festas, check-up de início de ano
- **Março/Abril:** Outono, vacinas, mudança de pelo
- **Junho:** Inverno, cuidados respiratórios, aquecimento
- **Setembro:** Primavera, alergia sazonal, reprodução
- **Dezembro:** Festas, viagem com pets, cuidados especiais

*Por Tipo de Serviço:*
- **Veterinária:** Consultas, exames, cirurgias, emergências
- **Estética:** Banho, tosa, hidratação, nail care
- **Hotel/Daycare:** Hospedagem, recreação, socialização
- **Pet Shop:** Produtos, alimentação, acessórios
- **Adestramento:** Comportamento, obediência, socialização

```typescript
interface CampaignTemplate {
  id: string;
  name: string;
  description: string;
  
  // Categorização
  category: 'aquisicao' | 'retencao' | 'upsell' | 'educacao' | 'emergencia';
  service_type: 'veterinaria' | 'estetica' | 'hotel' | 'petshop' | 'adestramento';
  seasonality: {
    months: number[]; // [1,2,3] = Jan-Mar
    peak_performance: 'high' | 'medium' | 'low';
  };
  
  // Conteúdo
  content_pieces: ContentPiece[];
  visual_assets: VisualAsset[];
  copy_variations: CopyVariation[];
  
  // Metadata de performance
  performance_data: {
    avg_engagement_rate: number;
    avg_conversion_rate: number;
    success_cases: number;
    industry_benchmark: number;
  };
  
  // Configuração de personalização
  customization_options: CustomizationOption[];
  required_brand_voice_fields: string[];
}
```

### 🎯 Templates de Alta Performance

**Template Exemplo: "Check-up de Outono"**

*Objetivo:* Retenção + Prevenção  
*Performance:* 4.2% CTR, 18% conversion rate  
*Uso ideal:* Março-Abril, clínicas veterinárias

**Peças incluídas:**
1. **Instagram Post (Carrossel):**
   - Slide 1: Hook visual + problema (mudança de estação)
   - Slide 2: 3 sinais de alerta para observar
   - Slide 3: Benefícios do check-up preventivo
   - Slide 4: CTA + contato

2. **Instagram Stories (Sequência):**
   - Story 1: Enquete "Seu pet está preparado para o outono?"
   - Story 2: Tip rápido + swipe up
   - Story 3: Depoimento de cliente
   - Story 4: Call-to-action com urgência

3. **WhatsApp Message:**
   - Personalizada com nome do pet
   - Lembrança carinhosa da última visita
   - Oferta especial para agendamento

4. **Email de Follow-up:**
   - Subject line otimizado
   - Conteúdo educativo + oferta
   - Social proof integrado

**Copy Base (antes da personalização):**
```
🍂 [PET_NAME] está preparado para o outono?

A mudança de estação pode afetar a saúde do seu [PET_TYPE]. 
Sinais como [SYMPTOMS_LIST] podem indicar necessidade de cuidados especiais.

Nosso check-up de outono inclui:
✓ [SERVICE_1]
✓ [SERVICE_2] 
✓ [SERVICE_3]

[CTA_PERSONALIZADO]
```

### 🤖 Engine de Personalização

**Algoritmo de Adaptação:**

```typescript
class CampaignPersonalizer {
  async personalizeCampaign(
    template: CampaignTemplate, 
    brandVoice: BrandVoice,
    targetAudience?: AudienceData
  ): Promise<PersonalizedCampaign> {
    
    const personalized = {
      ...template,
      content_pieces: await Promise.all(
        template.content_pieces.map(piece => 
          this.personalizeContentPiece(piece, brandVoice, targetAudience)
        )
      )
    };
    
    return personalized;
  }
  
  private async personalizeContentPiece(
    piece: ContentPiece, 
    brandVoice: BrandVoice,
    audience?: AudienceData
  ): Promise<PersonalizedContentPiece> {
    
    // 1. Aplicar tom de voz
    const toneAdjusted = this.applyVoiceTone(piece.copy, brandVoice.voice.tone);
    
    // 2. Substituir termos según lexicon
    const lexiconAdjusted = this.applyLexicon(toneAdjusted, brandVoice.voice.lexicon);
    
    // 3. Aplicar estilo de formatação
    const styleAdjusted = this.applyFormattingStyle(lexiconAdjusted, brandVoice.voice.style);
    
    // 4. Inserir elementos de marca
    const brandAdjusted = this.insertBrandElements(styleAdjusted, brandVoice.brand);
    
    // 5. Aplicar compliance
    const complianceChecked = await this.ensureCompliance(brandAdjusted, brandVoice.compliance);
    
    return {
      ...piece,
      copy: complianceChecked,
      personalization_score: this.calculatePersonalizationScore(piece, brandVoice),
      compliance_score: this.calculateComplianceScore(complianceChecked, brandVoice.compliance)
    };
  }
}
```

**Variáveis Dinâmicas:**

```typescript
interface DynamicVariables {
  // Marca
  brand_name: string;
  brand_mission: string;
  brand_values: string[];
  
  // Serviços
  primary_services: string[];
  specialties: string[];
  pricing_range: 'economico' | 'medio' | 'premium';
  
  // Localização  
  city: string;
  neighborhood: string;
  climate_zone: string;
  
  // Audiência
  typical_pet_types: string[]; // ['cão', 'gato', 'ave']
  audience_age_range: string;
  audience_income_level: string;
  
  // Contexto
  current_season: 'verao' | 'outono' | 'inverno' | 'primavera';
  local_events: string[]; // eventos locais relevantes
  recent_news: string[]; // notícias do setor
}
```

### 📊 Sistema de Performance Tracking

**Métricas por Template:**

```typescript
interface TemplatePerformance {
  template_id: string;
  usage_stats: {
    total_uses: number;
    unique_brands: number;
    avg_customization_rate: number;
    most_customized_elements: string[];
  };
  
  performance_metrics: {
    // Por canal
    instagram: ChannelMetrics;
    facebook: ChannelMetrics;
    whatsapp: ChannelMetrics;
    email: ChannelMetrics;
    
    // Por objetivo
    awareness: number;
    engagement: number;
    conversion: number;
    retention: number;
  };
  
  a_b_test_results: {
    winning_variations: CopyVariation[];
    performance_improvements: Record<string, number>;
    statistical_significance: number;
  };
  
  user_feedback: {
    avg_rating: number;
    common_improvements: string[];
    success_stories: UserTestimonial[];
  };
}

interface ChannelMetrics {
  reach: number;
  engagement_rate: number;
  click_through_rate: number;
  conversion_rate: number;
  cost_per_result: number;
}
```

**Dashboard de Performance:**
- Ranking de templates por resultado
- Comparação com industry benchmarks
- Sugestões de otimização baseadas em dados
- A/B tests automáticos de variações

### 🎨 Biblioteca de Assets Visuais

**Categorias de Assets:**

*Fotografias Profissionais:*
- Pets em diferentes contextos (clínica, casa, natureza)
- Procedimentos veterinários (friendly, não invasivos)
- Família pet + humanos
- Antes/depois (tosa, tratamento)
- Lifestyle (alimentação, exercício, brincadeiras)

*Ilustrações Customizáveis:*
- Ícones de serviços vetoriais
- Anatomia pet educativa
- Timeline de cuidados
- Infográficos de prevenção
- Emoticons e stickers pet-specific

*Templates de Design:*
- Layouts para Instagram (post, story, carousel)
- Banners para Facebook/site
- Thumbnails para YouTube
- Templates de email responsivos
- Materiais impressos (flyers, cartões)

```typescript
interface VisualAsset {
  id: string;
  type: 'photo' | 'illustration' | 'template' | 'video';
  category: string;
  
  // Arquivo
  url: string;
  variants: { // diferentes formatos/tamanhos
    instagram_post: string; // 1080x1080
    instagram_story: string; // 1080x1920
    facebook_cover: string; // 1200x630
    email_header: string; // 600x200
  };
  
  // Customização
  customizable_elements: {
    text_areas: TextArea[];
    color_zones: ColorZone[];
    logo_placement: LogoPlacement[];
  };
  
  // Metadata
  tags: string[];
  pet_types: string[]; // ['cao', 'gato', 'ave']
  emotions: string[]; // ['feliz', 'carinhoso', 'profissional']
  usage_rights: 'free' | 'premium' | 'exclusive';
  
  // Performance
  usage_count: number;
  avg_engagement: number;
  success_rate: number;
}
```

### 🚀 Geração de Campanhas Automática

**Wizard de Criação:**

**Step 1: Objetivo e Contexto**
- Seleção de objetivo (aquisição, retenção, etc.)
- Período da campanha
- Orçamento aproximado
- Canais preferidos

**Step 2: Template Selection**
- Sugestões baseadas no perfil da marca
- Filtros por performance e relevância
- Preview rápido dos templates
- Comparação lado-a-lado

**Step 3: Personalização**
- Ajustes automáticos aplicados
- Preview em tempo real
- Opção de fine-tuning manual
- Validação de compliance

**Step 4: Aprovação e Deploy**
- Review final com checklist
- Agendamento de publicação
- Setup de tracking
- Export para ferramentas de gestão

```typescript
interface CampaignCreationWizard {
  // Configuração inicial
  campaign_config: {
    objective: CampaignObjective;
    duration: DateRange;
    budget: BudgetRange;
    channels: Channel[];
    target_audience?: AudienceSegment;
  };
  
  // Template selecionado
  selected_template: CampaignTemplate;
  
  // Personalização aplicada
  personalization: {
    brand_voice_applied: boolean;
    custom_adjustments: Record<string, any>;
    compliance_validated: boolean;
    performance_predicted: PerformancePrediction;
  };
  
  // Output final
  final_campaign: {
    content_pieces: PersonalizedContentPiece[];
    publishing_schedule: PublishingSchedule;
    tracking_setup: TrackingConfiguration;
    success_metrics: SuccessMetrics;
  };
}
```

### 📈 Intelligence Layer

**Recomendações Inteligentes:**

```typescript
class CampaignIntelligence {
  async getRecommendations(brandProfile: BrandProfile): Promise<CampaignRecommendation[]> {
    const recommendations = [];
    
    // 1. Análise sazonal
    const seasonal = await this.getSeasonalRecommendations(brandProfile.location);
    
    // 2. Análise de performance histórica
    const performance = await this.getPerformanceBasedRecommendations(brandProfile.id);
    
    // 3. Análise de concorrência
    const competitive = await this.getCompetitiveRecommendations(brandProfile.segment);
    
    // 4. Trending topics
    const trending = await this.getTrendingRecommendations(brandProfile.segment);
    
    return this.rankRecommendations([...seasonal, ...performance, ...competitive, ...trending]);
  }
  
  private async getSeasonalRecommendations(location: Location): Promise<CampaignRecommendation[]> {
    const currentMonth = new Date().getMonth() + 1;
    const climateZone = this.getClimateZone(location);
    
    // Templates com alta performance para estação atual + localização
    return this.templateService.getTemplatesBySeason(currentMonth, climateZone);
  }
  
  private async getPerformanceBasedRecommendations(brandId: string): Promise<CampaignRecommendation[]> {
    const history = await this.getPerformanceHistory(brandId);
    
    // Templates similares aos que performaram bem historicamente
    return this.templateService.getSimilarTemplates(history.top_performing_templates);
  }
}
```

**Predictive Analytics:**
- Estimativa de performance baseada em dados históricos
- Sugestão de melhor timing para lançamento
- Previsão de ROI por canal
- Identificação de audience segments com maior potencial

---

## Interface e Experiência

### 🔍 Discovery e Busca

**Filtros Avançados:**
- Por objetivo de negócio
- Por tipo de serviço
- Por sazonalidade
- Por performance histórica
- Por nível de customização necessário

**Search Intelligence:**
- Busca semântica: "campanhas para o dia das mães" → templates relevantes
- Autocomplete baseado em tendências
- Sugestões relacionadas
- Histórico de buscas e favoritos

**Interface de Comparação:**
- Lado-a-lado de até 3 templates
- Métricas de performance comparativas
- Pros/cons de cada opção
- Recomendação baseada no perfil da marca

### 🎨 Preview e Customização

**Live Preview:**
- Visualização em tempo real em diferentes dispositivos
- Aplicação instantânea do Brand Voice
- Toggle between versões antes/depois
- Simulação em feeds reais (Instagram, Facebook)

**Customization Panel:**
- Sliders para ajustes de tom
- Color picker integrado com paleta da marca
- Text editor com suggestions inteligentes
- Asset library com busca e filtros

**Collaboration Features:**
- Comentários em elementos específicos
- Versionamento com controle de mudanças
- Aprovação workflow (criador → revisor → aprovador)
- Real-time collaboration (Google Docs style)

---

## Integração com Ecossistema

### 📱 Publicação Direta

**Social Media Integration:**
- API Facebook/Instagram para publicação direta
- Agendamento nativo com preview
- Cross-posting inteligente (adaptação por canal)
- Tracking automático de métricas

**Email Marketing:**
- Integração Mailchimp, RD Station, HubSpot
- Import de listas de contatos
- Segmentação automática baseada em Brand Voice
- A/B testing de subject lines

**WhatsApp Business:**
- Templates pré-aprovados pelo WhatsApp
- Broadcast lists segmentadas
- Chatbot integration para follow-up
- Métricas de entrega e engagement

### 📊 Analytics e Otimização

**Performance Dashboard:**
- Métricas unificadas de todos os canais
- Comparação com benchmarks do setor
- ROI tracking por campanha
- Attribution modeling avançado

**Optimization Engine:**
- A/B testing automático de elementos
- Continuous optimization baseada em performance
- Anomaly detection para campanhas underperforming
- Predictive alerts para oportunidades

---

## Modelo de Dados

### Database Schema

```sql
-- Templates de campanhas
CREATE TABLE campaign_templates (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name VARCHAR(200) NOT NULL,
  description TEXT,
  category campaign_category NOT NULL,
  service_type service_type NOT NULL,
  
  -- Conteúdo
  content_pieces JSONB NOT NULL, -- array de ContentPiece
  visual_assets JSONB, -- array de VisualAsset references
  
  -- Performance data
  usage_count INTEGER DEFAULT 0,
  avg_engagement_rate DECIMAL(5,4),
  avg_conversion_rate DECIMAL(5,4),
  
  -- Metadata
  created_by UUID REFERENCES users(id),
  is_public BOOLEAN DEFAULT true,
  is_premium BOOLEAN DEFAULT false,
  
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Campanhas personalizadas
CREATE TABLE user_campaigns (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(id),
  template_id UUID REFERENCES campaign_templates(id),
  brand_voice_id UUID REFERENCES brand_voice(id),
  
  -- Configuração
  campaign_config JSONB NOT NULL,
  personalized_content JSONB NOT NULL,
  
  -- Status
  status campaign_status DEFAULT 'draft',
  scheduled_at TIMESTAMP WITH TIME ZONE,
  published_at TIMESTAMP WITH TIME ZONE,
  
  -- Performance tracking
  performance_metrics JSONB,
  
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Performance tracking
CREATE TABLE campaign_performance (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  campaign_id UUID NOT NULL REFERENCES user_campaigns(id),
  channel VARCHAR(50) NOT NULL,
  
  -- Metrics
  impressions INTEGER DEFAULT 0,
  reaches INTEGER DEFAULT 0,
  clicks INTEGER DEFAULT 0,
  conversions INTEGER DEFAULT 0,
  
  -- Calculated rates
  engagement_rate DECIMAL(5,4),
  click_through_rate DECIMAL(5,4),
  conversion_rate DECIMAL(5,4),
  
  -- Metadata
  measured_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  
  UNIQUE(campaign_id, channel, DATE(measured_at))
);
```

### Content Structure

```typescript
interface ContentPiece {
  id: string;
  type: 'instagram_post' | 'instagram_story' | 'facebook_post' | 'whatsapp_message' | 'email';
  
  // Conteúdo base (template)
  base_copy: string;
  visual_assets: string[]; // asset IDs
  
  // Variáveis para personalização
  variables: {
    name: string;
    type: 'text' | 'brand_element' | 'dynamic_data';
    default_value?: string;
    required: boolean;
    validation_rules?: ValidationRule[];
  }[];
  
  // Configuração de formatação
  formatting: {
    max_length?: number;
    hashtag_limit?: number;
    emoji_style: 'none' | 'minimal' | 'moderate' | 'frequent';
    mention_strategy?: string;
  };
  
  // Performance tracking
  performance_baseline: {
    expected_engagement: number;
    expected_reach: number;
    benchmark_source: string;
  };
}
```

---

## Critérios de Aceite

### Funcional
- [ ] Catálogo com 50+ templates de alta performance
- [ ] Personalização automática baseada em Brand Voice JSON
- [ ] Preview em tempo real para todos os formatos
- [ ] Export para principais plataformas (Instagram, Facebook, WhatsApp, Email)
- [ ] Sistema de favoritos e histórico
- [ ] Recomendações inteligentes baseadas em perfil e performance
- [ ] Tracking de métricas unificado

### Conteúdo
- [ ] Templates validados por especialistas em marketing pet
- [ ] Cobertura de todos os principais objetivos de campanha
- [ ] Adaptação sazonal para calendário anual
- [ ] Compliance verificado para claims do setor
- [ ] Biblioteca de assets visuais com 500+ itens

### Performance
- [ ] Personalização de template < 10s
- [ ] Preview generation < 3s
- [ ] Busca e filtros < 1s
- [ ] Export de campanha < 30s
- [ ] Suporte a campanhas com 20+ peças de conteúdo

### UX
- [ ] Workflow completo (discovery → customização → export) < 10 min
- [ ] Interface responsiva para desktop e mobile
- [ ] Onboarding que ensina o usuário em < 5 min
- [ ] Comparação de templates lado-a-lado
- [ ] Collaboration features para equipes

---

## Roadmap de Desenvolvimento

### Sprint 1-3: Foundation
- Schema de dados e APIs
- Catálogo básico com 20 templates
- Engine de personalização MVP
- Interface de discovery

### Sprint 4-6: Personalization
- Brand Voice integration completa
- Preview engine para todos os formatos
- Sistema de recomendações básico
- Export para Instagram/Facebook

### Sprint 7-9: Intelligence
- Performance tracking
- A/B testing automático
- Predictive analytics
- Recomendações avançadas

### Sprint 10-12: Scale
- Biblioteca completa (50+ templates)
- Collaboration features
- Advanced customization
- Multi-channel publishing

---

## Métricas de Sucesso

### Adoção
- **Template Usage:** > 80% dos usuários usam pelo menos 1 template/mês
- **Customization Rate:** > 70% personalizam além do automático
- **Return Usage:** > 60% usam múltiplos templates
- **Premium Conversion:** > 15% upgradem para templates premium

### Performance
- **Campaign Success:** Templates geram 25% mais engagement vs campanhas manuais
- **Time Savings:** 90% redução no tempo de criação de campanha
- **ROI Improvement:** 30% melhoria média no ROI de campanhas
- **Compliance Rate:** 99% das campanhas passam no compliance check

### Produto
- **User Satisfaction:** NPS > 70 para facilidade de uso
- **Template Rating:** Média > 4.5/5 para templates
- **Feature Adoption:** > 50% usam recommendations, > 30% usam A/B testing
- **Platform Stickiness:** 40% dos usuários se tornam power users (5+ campanhas/mês)

---

## Documentação Técnica
- [F-3: Brand Voice JSON](F03_BRAND_VOICE_JSON.md) - Fonte de personalização
- [F-4: Manual de Marca](F04_MANUAL_MARCA_DIGITAL.md) - Referência visual
- [F-6: Geração de Conteúdo IA](F06_GERACAO_CONTEUDO_IA.md) - Engine de criação
- [API Contracts](../architecture/API_CONTRACTS.md#campaign-library)
- [Performance Analytics](../metrics/PRODUCT_METRICS.md#campaign-performance)