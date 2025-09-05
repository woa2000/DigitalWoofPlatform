# Plano de Execução: Biblioteca de Campanhas Pet

**Plan ID:** BIB_CAMP_001  
**Versão:** 1.0  
**Data:** 2025-01-16  
**Responsável Principal:** Backend_Developer  
**Agentes Envolvidos:** Backend_Developer, Frontend_Developer, QA_Engineer  
**Dependências:** Brand_Voice_JSON_Plan.md, Manual_Marca_Digital_Plan.md  

---

## 📋 Resumo Executivo

### Objetivo
Desenvolver sistema de catálogo inteligente de templates de campanhas específicas para o setor pet, com conteúdo pré-gerado e personalizável baseado no Brand Voice da marca.

### Escopo
- Catálogo de 50+ templates de alta performance
- Engine de personalização baseada em Brand Voice JSON
- Sistema de performance tracking por template
- Interface de discovery e comparação
- Biblioteca de assets visuais pet-specific

### Resultados Esperados
- Templates geram 25% mais engagement vs campanhas manuais
- 80% dos usuários usam pelo menos 1 template/mês
- 90% redução no tempo de criação de campanha
- 99% taxa de compliance check para campanhas

---

## 🎯 Especificação Detalhada

### Feature Overview
Sistema que combina conhecimento especializado do setor pet com IA para acelerar criação de campanhas, permitindo que marcas criem campanhas profissionais em < 10 minutos.

### Inputs Requeridos
- **Brand Voice JSON** (F-3): Dados de personalização da marca
- **Manual de Marca** (F-4): Elementos visuais e diretrizes
- **User Preferences**: Objetivo, sazonalidade, tipo de serviço
- **Template Selection**: Template escolhido pelo usuário

### Outputs Esperados
- **Personalized Campaign**: Campanhas adaptadas ao Brand Voice
- **Content Pieces**: Posts, stories, emails personalizados
- **Visual Assets**: Sugestões de criativos compatíveis
- **Performance Prediction**: Score previsto de engajamento

---

## 📊 Schema de Dados

### Database Schema
```sql
-- Templates de campanhas
CREATE TABLE campaign_templates (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name VARCHAR(200) NOT NULL,
  description TEXT,
  category campaign_category NOT NULL,
  service_type service_type NOT NULL,
  
  -- Conteúdo estruturado
  content_pieces JSONB NOT NULL,
  visual_assets JSONB,
  customization_options JSONB,
  
  -- Performance data
  usage_count INTEGER DEFAULT 0,
  avg_engagement_rate DECIMAL(5,4),
  avg_conversion_rate DECIMAL(5,4),
  success_cases INTEGER DEFAULT 0,
  
  -- Sazonalidade
  seasonality JSONB, -- {months: [1,2,3], peak_performance: 'high'}
  
  -- Metadata
  created_by UUID REFERENCES users(id),
  is_public BOOLEAN DEFAULT true,
  is_premium BOOLEAN DEFAULT false,
  
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Campanhas personalizadas dos usuários
CREATE TABLE user_campaigns (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(id),
  template_id UUID REFERENCES campaign_templates(id),
  brand_voice_id UUID REFERENCES brand_voice(id),
  
  -- Configuração da campanha
  campaign_config JSONB NOT NULL,
  personalized_content JSONB NOT NULL,
  
  -- Status e execução
  status campaign_status DEFAULT 'draft',
  scheduled_at TIMESTAMP WITH TIME ZONE,
  published_at TIMESTAMP WITH TIME ZONE,
  
  -- Tracking de performance
  performance_metrics JSONB,
  
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Performance tracking
CREATE TABLE campaign_performance (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  campaign_id UUID NOT NULL REFERENCES user_campaigns(id),
  template_id UUID NOT NULL REFERENCES campaign_templates(id),
  channel VARCHAR(50) NOT NULL,
  
  -- Metrics básicas
  impressions INTEGER DEFAULT 0,
  reaches INTEGER DEFAULT 0,
  clicks INTEGER DEFAULT 0,
  conversions INTEGER DEFAULT 0,
  
  -- Rates calculadas
  engagement_rate DECIMAL(5,4),
  click_through_rate DECIMAL(5,4),
  conversion_rate DECIMAL(5,4),
  
  -- Metadata
  measured_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  
  UNIQUE(campaign_id, channel, DATE(measured_at))
);

-- Assets visuais
CREATE TABLE visual_assets (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name VARCHAR(200) NOT NULL,
  type asset_type NOT NULL,
  category VARCHAR(100) NOT NULL,
  
  -- Arquivo
  url TEXT NOT NULL,
  file_size INTEGER,
  dimensions JSONB, -- {width: 1080, height: 1080}
  
  -- Variants para diferentes formatos
  variants JSONB, -- {instagram_post: 'url', instagram_story: 'url'}
  
  -- Customização
  customizable_elements JSONB,
  
  -- Metadata para busca
  tags TEXT[],
  pet_types TEXT[],
  emotions TEXT[],
  usage_rights usage_rights_type DEFAULT 'free',
  
  -- Performance
  usage_count INTEGER DEFAULT 0,
  avg_engagement DECIMAL(5,4),
  
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enums necessários
CREATE TYPE campaign_category AS ENUM ('aquisicao', 'retencao', 'upsell', 'educacao', 'emergencia');
CREATE TYPE service_type AS ENUM ('veterinaria', 'estetica', 'hotel', 'petshop', 'adestramento');
CREATE TYPE campaign_status AS ENUM ('draft', 'scheduled', 'published', 'paused', 'completed');
CREATE TYPE asset_type AS ENUM ('photo', 'illustration', 'template', 'video');
CREATE TYPE usage_rights_type AS ENUM ('free', 'premium', 'exclusive');
```

### TypeScript Interfaces
```typescript
interface CampaignTemplate {
  id: string;
  name: string;
  description: string;
  category: 'aquisicao' | 'retencao' | 'upsell' | 'educacao' | 'emergencia';
  service_type: 'veterinaria' | 'estetica' | 'hotel' | 'petshop' | 'adestramento';
  
  content_pieces: ContentPiece[];
  visual_assets: VisualAsset[];
  customization_options: CustomizationOption[];
  
  seasonality: {
    months: number[];
    peak_performance: 'high' | 'medium' | 'low';
  };
  
  performance_data: {
    avg_engagement_rate: number;
    avg_conversion_rate: number;
    success_cases: number;
    industry_benchmark: number;
  };
}

interface ContentPiece {
  id: string;
  type: 'instagram_post' | 'instagram_story' | 'facebook_post' | 'whatsapp_message' | 'email';
  base_copy: string;
  variables: TemplateVariable[];
  formatting: FormattingRules;
  performance_baseline: PerformanceBaseline;
}

interface PersonalizedCampaign {
  id: string;
  template_id: string;
  brand_voice_id: string;
  personalized_content: PersonalizedContentPiece[];
  campaign_config: CampaignConfig;
  personalization_score: number;
  compliance_score: number;
}
```

---

## 🔄 Fluxo de Dados

### Input Flow
1. **User Selection** → Template escolhido via interface
2. **Brand Voice Fetch** → Dados da personalização (F-3)
3. **Template Processing** → Aplicação das regras de personalização
4. **Content Generation** → Peças personalizadas criadas
5. **Compliance Check** → Validação automática
6. **User Preview** → Apresentação para aprovação

### Output Flow
1. **Approved Campaign** → Campanha aprovada pelo usuário
2. **Performance Tracking** → Setup de métricas
3. **Publishing Queue** → Agendamento para publicação
4. **Analytics Feedback** → Dados retornam para otimização

---

## 👥 Handoffs Entre Agentes

### Backend_Developer → Frontend_Developer
**Deliverable:** APIs de templates e personalização  
**Formato:** OpenAPI 3.0 specification  
**Critério de Aceite:** Endpoints funcionais com dados de teste  
**Timeline:** Task 6 → Task 7  

**API Contract:**
```yaml
paths:
  /api/templates:
    get:
      summary: List campaign templates
      parameters:
        - name: category
          in: query
          schema:
            type: string
            enum: [aquisicao, retencao, upsell, educacao, emergencia]
        - name: service_type
          in: query
          schema:
            type: string
            enum: [veterinaria, estetica, hotel, petshop, adestramento]
      responses:
        200:
          description: Lista de templates
          content:
            application/json:
              schema:
                type: array
                items:
                  $ref: '#/components/schemas/CampaignTemplate'

  /api/campaigns/personalize:
    post:
      summary: Personalize template with brand voice
      requestBody:
        required: true
        content:
          application/json:
            schema:
              type: object
              properties:
                template_id:
                  type: string
                brand_voice_id:
                  type: string
                customizations:
                  type: object
      responses:
        200:
          description: Campanha personalizada
          content:
            application/json:
              schema:
                $ref: '#/components/schemas/PersonalizedCampaign'
```

### Frontend_Developer → QA_Engineer
**Deliverable:** Interface completa de templates  
**Formato:** Deployed application + test credentials  
**Critério de Aceite:** Todos os fluxos funcionais navegáveis  
**Timeline:** Task 12 → Task 13  

---

## 📋 Tasks Detalhadas

### Task 1: Setup Database Schema
**Responsável:** Backend_Developer  
**Duração:** 1 dia  
**Input:** Especificação de schema (acima)  
**Output:** Database migrations + seed data  

**Definição Técnica:**
- Criar todas as tabelas com relacionamentos
- Inserir dados de seed com 20 templates básicos
- Setup de indexes para performance de busca
- Validações de constraint no nível DB

**Critérios de Aceite:**
- [ ] Todas as tabelas criadas sem erros
- [ ] Foreign keys funcionando corretamente
- [ ] 20 templates de exemplo inseridos
- [ ] Queries de busca < 100ms

**Commands:**
```bash
npx drizzle-kit generate
npx drizzle-kit migrate
npm run seed:templates
```

### Task 2: Campaign Template Model
**Responsável:** Backend_Developer  
**Duração:** 2 dias  
**Input:** Database schema + TypeScript interfaces  
**Output:** Drizzle models + repository classes  

**Definição Técnica:**
- Implementar modelos Drizzle para todas as entidades
- Criar repository pattern para abstrair queries
- Validações com Zod para dados de entrada
- Setup de relações entre entidades

**Critérios de Aceite:**
- [ ] Modelos Drizzle type-safe implementados
- [ ] Repository classes com CRUD completo
- [ ] Validações Zod para todos os inputs
- [ ] Testes unitários para repositories

### Task 3: Template Listing API
**Responsável:** Backend_Developer  
**Duração:** 2 dias  
**Input:** Repository classes + API specification  
**Output:** GET /api/templates endpoint  

**Definição Técnica:**
- Endpoint com filtros por categoria e service_type
- Paginação para performance com large datasets
- Busca textual por nome e descrição
- Ordenação por performance e popularidade

**Critérios de Aceite:**
- [ ] Filtros funcionando corretamente
- [ ] Paginação implementada (limit/offset)
- [ ] Busca textual operacional
- [ ] Response time < 200ms para 100 templates

### Task 4: Personalization Engine
**Responsável:** Backend_Developer  
**Duração:** 3 dias  
**Input:** Brand Voice JSON + Template data  
**Output:** CampaignPersonalizer class  

**Definição Técnica:**
```typescript
class CampaignPersonalizer {
  async personalizeCampaign(
    template: CampaignTemplate, 
    brandVoice: BrandVoice,
    customizations?: CustomizationOptions
  ): Promise<PersonalizedCampaign> {
    // 1. Apply voice tone to copy
    const toneAdjusted = await this.applyVoiceTone(template.content_pieces, brandVoice.voice.tone);
    
    // 2. Replace terms according to lexicon
    const lexiconAdjusted = this.applyLexicon(toneAdjusted, brandVoice.voice.lexicon);
    
    // 3. Apply formatting style
    const styleAdjusted = this.applyFormattingStyle(lexiconAdjusted, brandVoice.voice.style);
    
    // 4. Insert brand elements
    const brandAdjusted = this.insertBrandElements(styleAdjusted, brandVoice.brand);
    
    // 5. Ensure compliance
    const complianceChecked = await this.ensureCompliance(brandAdjusted, brandVoice.compliance);
    
    return {
      ...template,
      personalized_content: complianceChecked,
      personalization_score: this.calculatePersonalizationScore(template, brandVoice),
      compliance_score: this.calculateComplianceScore(complianceChecked, brandVoice.compliance)
    };
  }
}
```

**Critérios de Aceite:**
- [ ] Personalização aplica todos os elementos do Brand Voice
- [ ] Score de personalização calculado corretamente
- [ ] Compliance checking automático funcionando
- [ ] Tempo de processamento < 5s por template

### Task 5: Template Performance Tracking
**Responsável:** Backend_Developer  
**Duração:** 2 dias  
**Input:** Performance data structure  
**Output:** Performance tracking system  

**Definição Técnica:**
- Sistema para coletar métricas de uso de templates
- Agregação de dados de performance por template
- Cálculo de benchmarks e comparações
- Endpoints para dashboard analytics

**Critérios de Aceite:**
- [ ] Coleta automática de métricas de uso
- [ ] Agregação de dados por período
- [ ] Cálculo de rates (CTR, engagement, conversion)
- [ ] API para dashboard de performance

### Task 6: Campaign Management API
**Responsável:** Backend_Developer  
**Duração:** 2 dias  
**Input:** User campaign model + personalization engine  
**Output:** CRUD APIs para campanhas do usuário  

**Definição Técnica:**
- APIs para criar, editar e deletar campanhas personalizadas
- Sistema de status (draft, scheduled, published)
- Versionamento de campanhas para histórico
- Integration hooks para publishing system

**Critérios de Aceite:**
- [ ] CRUD completo para user campaigns
- [ ] Status workflow implementado
- [ ] Versionamento funcionando
- [ ] Webhooks para external systems

### Task 7: Template Discovery UI
**Responsável:** Frontend_Developer  
**Duração:** 3 dias  
**Input:** Templates API + Design system  
**Output:** Interface de busca e filtros  

**Definição Técnica:**
- Grid layout responsivo para templates
- Filtros avançados por categoria, tipo, performance
- Busca textual com autocomplete
- Preview cards com informações essenciais

**Critérios de Aceite:**
- [ ] Grid responsivo funcionando
- [ ] Filtros aplicando em tempo real
- [ ] Busca com debounce e autocomplete
- [ ] Preview cards informativos

### Task 8: Template Comparison Interface
**Responsável:** Frontend_Developer  
**Duração:** 2 dias  
**Input:** Template data + comparison logic  
**Output:** Side-by-side comparison view  

**Definição Técnica:**
- Seleção de até 3 templates para comparação
- Exibição lado-a-lado de métricas e conteúdo
- Highlighting de diferenças principais
- Recomendação baseada no perfil da marca

**Critérios de Aceite:**
- [ ] Seleção múltipla de templates funcionando
- [ ] Layout de comparação legível
- [ ] Métricas comparativas exibidas
- [ ] Sistema de recomendação ativo

### Task 9: Personalization Preview
**Responsável:** Frontend_Developer  
**Duração:** 3 dias  
**Input:** Personalization API + Brand Voice data  
**Output:** Live preview de personalização  

**Definição Técnica:**
- Preview em tempo real aplicando Brand Voice
- Visualização por canal (Instagram, Facebook, etc.)
- Toggle before/after personalization
- Sliders para fine-tuning de personalização

**Critérios de Aceite:**
- [ ] Preview atualiza em tempo real
- [ ] Visualização por canal funcionando
- [ ] Toggle before/after operacional
- [ ] Fine-tuning sliders responsivos

### Task 10: Campaign Creation Wizard
**Responsável:** Frontend_Developer  
**Duração:** 3 dias  
**Input:** Template selection + personalization preview  
**Output:** Fluxo completo de criação  

**Definição Técnica:**
- Step-by-step wizard (Objetivo → Template → Personalização → Aprovação)
- Validação de cada step antes de avançar
- Progress indicator e navegação entre steps
- Save draft functionality em cada etapa

**Critérios de Aceite:**
- [ ] Wizard de 4 steps funcionando
- [ ] Validação impedindo avanço incorreto
- [ ] Progress indicator visual
- [ ] Draft saving automático

### Task 11: Visual Assets Library
**Responsável:** Frontend_Developer  
**Duração:** 2 dias  
**Input:** Assets API + categorization system  
**Output:** Biblioteca de assets navegável  

**Definição Técnica:**
- Grid de imagens com lazy loading
- Filtros por categoria, tipo de pet, emoção
- Preview modal com detalhes do asset
- Sistema de favoritos para assets

**Critérios de Aceite:**
- [ ] Grid de assets com performance otimizada
- [ ] Filtros múltiplos funcionando
- [ ] Preview modal informativo
- [ ] Sistema de favoritos persistente

### Task 12: Performance Dashboard
**Responsável:** Frontend_Developer  
**Duração:** 2 dias  
**Input:** Performance API + analytics data  
**Output:** Dashboard de métricas de templates  

**Definição Técnica:**
- Charts mostrando performance por template
- Comparação com benchmarks da indústria
- Filtros por período e tipo de template
- Export de dados para relatórios

**Critérios de Aceite:**
- [ ] Charts de performance funcionando
- [ ] Comparação com benchmarks exibida
- [ ] Filtros temporais operacionais
- [ ] Export de dados implementado

### Task 13: Integration Testing
**Responsável:** QA_Engineer  
**Duração:** 3 dias  
**Input:** Complete system + test scenarios  
**Output:** Test report + bug list  

**Definição Técnica:**
- End-to-end testing de todos os fluxos
- Performance testing com large datasets
- Cross-browser compatibility testing
- Accessibility compliance verification

**Critérios de Aceite:**
- [ ] Todos os fluxos principais testados
- [ ] Performance aceitável com 1000+ templates
- [ ] Compatibilidade cross-browser verificada
- [ ] Accessibility guidelines atendidas

### Task 14: Performance Optimization
**Responsável:** Backend_Developer  
**Duração:** 2 dias  
**Input:** Test results + performance bottlenecks  
**Output:** Optimized system  

**Definição Técnica:**
- Database query optimization
- API response caching implementation
- Image loading optimization
- Bundle size reduction

**Critérios de Aceite:**
- [ ] Queries de template < 100ms
- [ ] Cache hit rate > 80%
- [ ] Image loading otimizado
- [ ] Bundle size reduzido em 30%

### Task 15: Documentation & Deployment
**Responsável:** Backend_Developer + QA_Engineer  
**Duração:** 1 dia  
**Input:** Complete system + deployment requirements  
**Output:** Deployed system + documentation  

**Definição Técnica:**
- API documentation completa
- User guide para criação de campanhas
- Admin guide para gestão de templates
- Deployment scripts e monitoring

**Critérios de Aceite:**
- [ ] API docs completas e atualizadas
- [ ] User guides escritos e testados
- [ ] Sistema deployed em produção
- [ ] Monitoring e alertas configurados

---

## ✅ Critérios de Aceite Globais

### Funcional
- [ ] Catálogo com 50+ templates de alta performance
- [ ] Personalização automática baseada em Brand Voice JSON
- [ ] Preview em tempo real para todos os formatos
- [ ] Sistema de comparação de templates
- [ ] Biblioteca de assets visuais com 500+ itens
- [ ] Dashboard de performance com métricas unificadas

### Performance
- [ ] Template listing < 200ms para 100 templates
- [ ] Personalização < 5s por template
- [ ] Preview generation < 2s
- [ ] Image loading otimizado com lazy loading

### Qualidade
- [ ] 99% de campanhas passam compliance check
- [ ] 25% improvement em engagement vs campanhas manuais
- [ ] 80% dos usuários usam pelo menos 1 template/mês
- [ ] 90% redução no tempo de criação

### Técnico
- [ ] APIs REST completas e documentadas
- [ ] Type safety com TypeScript em 100% do código
- [ ] Test coverage > 80% para lógica crítica
- [ ] Error handling robusto em todos os endpoints

---

## 🔍 Validação de Qualidade

### Testes Automatizados
```typescript
// Template personalization tests
describe('CampaignPersonalizer', () => {
  it('should apply brand voice tone correctly', async () => {
    const template = mockTemplate();
    const brandVoice = mockBrandVoice();
    const result = await personalizer.personalizeCampaign(template, brandVoice);
    
    expect(result.personalization_score).toBeGreaterThan(0.8);
    expect(result.personalized_content).toContainBrandElements(brandVoice.brand);
  });
  
  it('should ensure compliance for health claims', async () => {
    const template = mockHealthTemplate();
    const result = await personalizer.personalizeCampaign(template, brandVoice);
    
    expect(result.compliance_score).toBe(1.0);
    expect(result.personalized_content).not.toContainProhibitedClaims();
  });
});

// Performance tests
describe('Template API Performance', () => {
  it('should list 100 templates under 200ms', async () => {
    const start = Date.now();
    const response = await request(app).get('/api/templates?limit=100');
    const duration = Date.now() - start;
    
    expect(duration).toBeLessThan(200);
    expect(response.status).toBe(200);
  });
});
```

### Manual Testing Checklist
- [ ] Template discovery flow completo
- [ ] Personalização com diferentes Brand Voices
- [ ] Preview accuracy para cada canal
- [ ] Performance com datasets grandes
- [ ] Error handling em cenários edge

---

## 🚨 Cenários de Rollback

### Trigger Conditions
- Performance degradation > 50% vs baseline
- Error rate > 5% em operações críticas
- Compliance failures > 1% das campanhas
- User satisfaction score < 3.0/5.0

### Rollback Procedures
1. **Database:** Restore from last known good backup
2. **Application:** Deploy previous stable version
3. **Data Migration:** Run reverse migrations se necessário
4. **Cache:** Clear all template-related cache
5. **Monitoring:** Switch to previous version metrics

### Recovery Testing
- Backup/restore procedures testados semanalmente
- Rollback scripts validados em staging
- RTO < 15 minutos para rollback completo
- RPO < 1 hora para data loss

---

## 📊 Monitoramento e Alertas

### Métricas Técnicas
- **API Response Time:** < 200ms para 95% das requests
- **Error Rate:** < 1% para todas as operações
- **Database Query Time:** < 100ms para queries de template
- **Cache Hit Rate:** > 80% para template requests

### Métricas de Produto
- **Template Usage Rate:** Usuários ativos usando templates
- **Personalization Adoption:** % que personaliza vs usa default
- **Campaign Success Rate:** Templates vs campanhas manuais
- **User Satisfaction:** Rating médio por template

### Alertas Configurados
- Response time > 500ms por 5 minutos consecutivos
- Error rate > 5% em qualquer endpoint
- Database connection failures
- Compliance check failures > 10 em 1 hora

---

## 📈 Métricas de Sucesso

### KPIs Primários
- **Template Adoption:** 80% dos usuários usam pelo menos 1 template/mês
- **Performance Improvement:** 25% mais engagement vs campanhas manuais
- **Time Savings:** 90% redução no tempo de criação de campanha
- **Compliance Rate:** 99% das campanhas passam no compliance check

### KPIs Secundários
- **Template Rating:** Média > 4.5/5 para templates
- **Customization Rate:** 70% personalizam além do automático
- **Return Usage:** 60% usam múltiplos templates
- **Premium Conversion:** 15% upgradem para templates premium

### Leading Indicators
- **Discovery Rate:** Templates encontrados vs buscados
- **Preview Engagement:** Tempo gasto em preview
- **Comparison Usage:** % que compara antes de escolher
- **Regeneration Rate:** % que regenera conteúdo

---

*Data de criação: 2025-01-16*  
*Última atualização: 2025-01-16*  
*Próxima revisão: Após Sprint 3*