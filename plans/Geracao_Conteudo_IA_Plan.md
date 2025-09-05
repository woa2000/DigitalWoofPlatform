# Plano de Execução: Geração de Conteúdo IA

**Plan ID:** GER_CONT_001  
**Versão:** 1.0  
**Data:** 2025-01-16  
**Responsável Principal:** Backend_Developer  
**Agentes Envolvidos:** Backend_Developer, Frontend_Developer, QA_Engineer  
**Dependências:** Brand_Voice_JSON_Plan.md, Biblioteca_Campanhas_Plan.md  

---

## 📋 Resumo Executivo

### Objetivo
Desenvolver engine de IA para criação automática de conteúdo (copies + sugestões criativas) que mantém consistência com Brand Voice JSON e atende objetivos de marketing do setor pet.

### Escopo
- Engine de geração com OpenAI GPT-4
- Sistema de prompts especializados para setor pet
- Compliance automático para claims de saúde animal
- Interface de aprovação e edição
- Tracking de performance e custo

### Resultados Esperados
- ≥ 50% taxa de aprovação sem edição
- Tempo de geração < 30s para 3 variações
- 100% de conteúdo usando Brand Voice JSON
- Zero claims de saúde animal não aprovados

---

## 🎯 Especificação Detalhada

### Feature Overview
Sistema que gera automaticamente conteúdo de marketing de alta qualidade para o setor pet, mantendo consistência de marca e compliance regulatório.

### Inputs Requeridos
- **Content Brief**: Tema, objetivo, canal, formato, restrições
- **Brand Voice JSON** (F-3): Tom, lexicon, CTAs, compliance rules
- **Campaign Context**: Template base (se aplicável) da Biblioteca de Campanhas
- **User Preferences**: Tom específico, palavras a evitar

### Outputs Esperados
- **Content Variations**: 3 variações de copy com diferentes abordagens
- **Creative Brief**: Especificações para assets visuais
- **Compliance Report**: Validação automática + disclaimers
- **Performance Prediction**: Score estimado de engajamento

---

## 📊 Schema de Dados

### Database Schema
```sql
-- Briefs de conteúdo
CREATE TABLE content_briefs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  account_id UUID NOT NULL REFERENCES accounts(id),
  user_id UUID NOT NULL REFERENCES users(id),
  
  -- Especificação do conteúdo
  theme TEXT NOT NULL,
  objective content_objective NOT NULL,
  channel content_channel NOT NULL,
  format content_format NOT NULL,
  
  -- Configuração
  brand_voice_id UUID NOT NULL REFERENCES brand_voice(id),
  custom_instructions TEXT,
  words_to_avoid TEXT[],
  
  -- Metadata
  campaign_id UUID REFERENCES user_campaigns(id),
  template_id UUID REFERENCES campaign_templates(id),
  
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Conteúdo gerado
CREATE TABLE generated_content (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  brief_id UUID NOT NULL REFERENCES content_briefs(id),
  
  -- Conteúdo gerado
  variations JSONB NOT NULL, -- array de ContentVariation
  creative_brief JSONB,
  
  -- Compliance e qualidade
  compliance_flags JSONB DEFAULT '[]',
  compliance_score DECIMAL(3,2) NOT NULL,
  quality_metrics JSONB,
  
  -- Status e aprovação
  status content_status DEFAULT 'generated',
  approved_variation_id TEXT,
  approved_by UUID REFERENCES users(id),
  approved_at TIMESTAMP WITH TIME ZONE,
  
  -- Métricas de geração
  generation_metrics JSONB, -- tokens, time, cost
  
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Feedback para melhoria da IA
CREATE TABLE content_feedback (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  content_id UUID NOT NULL REFERENCES generated_content(id),
  variation_id TEXT NOT NULL,
  
  -- Tipo de feedback
  feedback_type feedback_type NOT NULL,
  feedback_text TEXT,
  rating INTEGER CHECK (rating >= 1 AND rating <= 5),
  
  -- Melhorias específicas
  improvement_suggestions JSONB,
  regeneration_notes TEXT,
  
  -- Metadata
  user_id UUID NOT NULL REFERENCES users(id),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Prompts e configurações
CREATE TABLE ai_prompts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name VARCHAR(200) NOT NULL,
  prompt_type prompt_type NOT NULL,
  
  -- Conteúdo do prompt
  system_prompt TEXT NOT NULL,
  user_prompt_template TEXT NOT NULL,
  
  -- Configuração
  model VARCHAR(50) DEFAULT 'gpt-4',
  temperature DECIMAL(3,2) DEFAULT 0.7,
  max_tokens INTEGER DEFAULT 1000,
  
  -- Versionamento
  version INTEGER DEFAULT 1,
  is_active BOOLEAN DEFAULT true,
  
  -- Performance
  usage_count INTEGER DEFAULT 0,
  avg_quality_score DECIMAL(3,2),
  
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enums necessários
CREATE TYPE content_objective AS ENUM ('educar', 'vender', 'engajar', 'recall', 'awareness');
CREATE TYPE content_channel AS ENUM ('instagram_post', 'instagram_story', 'facebook_post', 'whatsapp', 'email', 'website');
CREATE TYPE content_format AS ENUM ('texto', 'carrossel', 'video_script', 'email_campaign');
CREATE TYPE content_status AS ENUM ('generated', 'approved', 'rejected', 'regenerated', 'published');
CREATE TYPE feedback_type AS ENUM ('approval', 'rejection', 'edit_request', 'regeneration', 'rating');
CREATE TYPE prompt_type AS ENUM ('educational', 'promotional', 'recall', 'engagement', 'health_awareness');
```

### TypeScript Interfaces
```typescript
interface ContentBrief {
  id: string;
  account_id: string;
  user_id: string;
  theme: string;
  objective: ContentObjective;
  channel: ContentChannel;
  format: ContentFormat;
  brand_voice_id: string;
  custom_instructions?: string;
  words_to_avoid?: string[];
  campaign_id?: string;
  template_id?: string;
}

interface GeneratedContent {
  id: string;
  brief_id: string;
  variations: ContentVariation[];
  creative_brief: CreativeBrief;
  compliance_flags: ComplianceFlag[];
  compliance_score: number;
  quality_metrics: QualityMetrics;
  status: ContentStatus;
  generation_metrics: GenerationMetrics;
}

interface ContentVariation {
  id: string;
  title: string;
  body: string;
  cta: string;
  hashtags: string[];
  tone_score: ToneScore;
  readability_score: number;
  estimated_performance: number;
}

interface CreativeBrief {
  type: 'photo' | 'illustration' | 'video' | 'carousel';
  description: string;
  style_notes: string;
  required_elements: string[];
  avoid_elements: string[];
}
```

---

## 🔄 Fluxo de Dados

### Input Flow
1. **Content Brief** → Especificação do usuário
2. **Brand Voice Fetch** → Dados de personalização (F-3)
3. **Template Context** → Base de campanha (F-5) se aplicável
4. **AI Processing** → Geração via OpenAI
5. **Compliance Check** → Validação automática
6. **Quality Scoring** → Avaliação de aderência à marca

### Output Flow
1. **Content Presentation** → 3 variações para usuário
2. **User Feedback** → Aprovação/edição/regeneração
3. **Performance Tracking** → Métricas de uso e qualidade
4. **Learning Loop** → Feedback para otimização de prompts

---

## 👥 Handoffs Entre Agentes

### Backend_Developer → Frontend_Developer
**Deliverable:** APIs de geração de conteúdo  
**Formato:** OpenAPI 3.0 specification + exemplo de responses  
**Critério de Aceite:** Endpoint funcionais com tempo < 30s  
**Timeline:** Task 8 → Task 9  

**API Contract:**
```yaml
paths:
  /api/content/generate:
    post:
      summary: Generate content from brief
      requestBody:
        required: true
        content:
          application/json:
            schema:
              $ref: '#/components/schemas/ContentBrief'
      responses:
        200:
          description: Content generated successfully
          content:
            application/json:
              schema:
                $ref: '#/components/schemas/GeneratedContent'
        202:
          description: Generation in progress
          content:
            application/json:
              schema:
                type: object
                properties:
                  job_id:
                    type: string
                  estimated_completion:
                    type: string
                    format: date-time

  /api/content/{id}/feedback:
    post:
      summary: Submit feedback for content
      parameters:
        - name: id
          in: path
          required: true
          schema:
            type: string
      requestBody:
        required: true
        content:
          application/json:
            schema:
              $ref: '#/components/schemas/ContentFeedback'
      responses:
        200:
          description: Feedback recorded
```

### Frontend_Developer → QA_Engineer
**Deliverable:** Interface completa de geração  
**Formato:** Deployed interface + test account  
**Critério de Aceite:** Fluxo end-to-end funcional  
**Timeline:** Task 14 → Task 15  

---

## 📋 Tasks Detalhadas

### Task 1: Setup OpenAI Integration
**Responsável:** Backend_Developer  
**Duração:** 1 dia  
**Input:** OpenAI API key + rate limits  
**Output:** OpenAI service wrapper  

**Definição Técnica:**
```typescript
class OpenAIService {
  private client: OpenAI;
  
  async generateContent(
    prompt: string, 
    options: GenerationOptions
  ): Promise<AIResponse> {
    // Implementation with error handling, retries, rate limiting
  }
  
  async validateHealthClaims(content: string): Promise<ComplianceCheck> {
    // Specialized prompt for health claim validation
  }
}
```

**Critérios de Aceite:**
- [ ] OpenAI client configurado com API key
- [ ] Rate limiting implementado
- [ ] Error handling para timeouts e failures
- [ ] Cost tracking por request

### Task 2: Database Schema Implementation
**Responsável:** Backend_Developer  
**Duração:** 1 dia  
**Input:** Schema specification (acima)  
**Output:** Drizzle migrations + models  

**Definição Técnica:**
- Implementar todas as tabelas com relacionamentos
- Setup de indexes para performance de queries
- Validações de constraint no nível database
- Seed data com prompts básicos

**Critérios de Aceite:**
- [ ] Todas as tabelas criadas sem erros
- [ ] Indexes otimizados para busca
- [ ] Constraints validando corretamente
- [ ] Seed data com 10 prompts base

### Task 3: Prompt Engineering System
**Responsável:** Backend_Developer  
**Duração:** 3 dias  
**Input:** Pet industry knowledge + Brand Voice structure  
**Output:** Specialized prompts para cada tipo de conteúdo  

**Definição Técnica:**
```typescript
class PetContentPrompts {
  educational(topic: string, brandVoice: BrandVoice): string {
    return `
Você é um especialista em marketing para o setor pet, criando conteúdo educativo para ${brandVoice.brand.name}.

BRAND VOICE:
- Tom: ${brandVoice.voice.tone.join(', ')}
- Persona: ${brandVoice.brand.persona}
- Palavras preferidas: ${brandVoice.voice.lexicon.preferred.join(', ')}
- Palavras a evitar: ${brandVoice.voice.lexicon.avoid.join(', ')}

COMPLIANCE PET:
- Nunca prometa cura de doenças
- Use disclaimers para conteúdo de saúde
- Prefira "tutor" ao invés de "dono"
- Evite termos que causem medo desnecessário

TAREFA:
Crie 3 variações de post educativo sobre "${topic}".

FORMATO DE SAÍDA:
JSON com array de variações, cada uma contendo title, body, cta, hashtags.
    `;
  }
  
  promotional(product: string, brandVoice: BrandVoice): string {
    // Similar structure for promotional content
  }
}
```

**Critérios de Aceite:**
- [ ] Prompts para 5 tipos de conteúdo (educativo, promocional, recall, engajamento, awareness)
- [ ] Brand Voice integration em todos os prompts
- [ ] Compliance rules embedded nos prompts
- [ ] Testing com diferentes Brand Voices

### Task 4: Content Generation Service
**Responsável:** Backend_Developer  
**Duração:** 3 dias  
**Input:** OpenAI service + prompts + Brand Voice data  
**Output:** ContentGenerationService com business logic  

**Definição Técnica:**
```typescript
class ContentGenerationService {
  async generateContent(brief: ContentBrief): Promise<GeneratedContent> {
    // 1. Fetch Brand Voice data
    const brandVoice = await this.brandVoiceService.getById(brief.brand_voice_id);
    
    // 2. Select appropriate prompt
    const prompt = this.promptService.getByType(brief.objective, brandVoice);
    
    // 3. Generate content via OpenAI
    const aiResponse = await this.openaiService.generateContent(prompt, {
      temperature: 0.7,
      max_tokens: 1000
    });
    
    // 4. Parse and validate response
    const variations = this.parseAIResponse(aiResponse);
    
    // 5. Compliance checking
    const complianceChecks = await Promise.all(
      variations.map(v => this.validateCompliance(v))
    );
    
    // 6. Quality scoring
    const qualityMetrics = this.calculateQuality(variations, brandVoice);
    
    return {
      variations,
      compliance_flags: complianceChecks.flatMap(c => c.flags),
      compliance_score: Math.min(...complianceChecks.map(c => c.score)),
      quality_metrics,
      creative_brief: this.generateCreativeBrief(brief, variations)
    };
  }
}
```

**Critérios de Aceite:**
- [ ] Geração de 3 variações consistentes
- [ ] Compliance checking automático
- [ ] Quality scoring implementado
- [ ] Creative brief generation

### Task 5: Compliance Checker
**Responsável:** Backend_Developer  
**Duração:** 2 dias  
**Input:** Regulatory guidelines para setor pet  
**Output:** PetComplianceChecker service  

**Definição Técnica:**
```typescript
class PetComplianceChecker {
  private healthClaimPatterns = [
    /cura[r]?\s+doen[çc]as?/i,
    /trata[r]?\s+c[âa]ncer/i,
    /elimina[r]?\s+v[íi]rus/i,
    // ... outros padrões proibidos
  ];
  
  async checkHealthClaims(content: string): Promise<ComplianceResult> {
    const flags = [];
    
    // Check for prohibited health claims
    for (const pattern of this.healthClaimPatterns) {
      if (pattern.test(content)) {
        flags.push({
          type: 'health_claim',
          severity: 'high',
          message: 'Possível claim médico não aprovado',
          suggestion: 'Reformule para evitar promessas de cura'
        });
      }
    }
    
    // Check for required disclaimers
    if (this.requiresDisclaimer(content)) {
      flags.push({
        type: 'missing_disclaimer',
        severity: 'medium',
        message: 'Conteúdo requer disclaimer',
        suggestion: 'Adicione: "Consulte sempre um veterinário"'
      });
    }
    
    return {
      score: flags.length === 0 ? 1.0 : Math.max(0, 1 - (flags.length * 0.2)),
      flags,
      suggested_disclaimers: this.getSuggestedDisclaimers(content)
    };
  }
}
```

**Critérios de Aceite:**
- [ ] Detecção de claims médicos proibidos
- [ ] Sugestão automática de disclaimers
- [ ] Score de compliance calculado
- [ ] False positive rate < 10%

### Task 6: Quality Metrics System
**Responsável:** Backend_Developer  
**Duração:** 2 dias  
**Input:** Brand Voice adherence criteria  
**Output:** Quality scoring algorithms  

**Definição Técnica:**
```typescript
class QualityScorer {
  calculateBrandVoiceAdherence(
    content: ContentVariation, 
    brandVoice: BrandVoice
  ): number {
    let score = 0;
    
    // Tone adherence (40% weight)
    const toneScore = this.assessTone(content.body, brandVoice.voice.tone);
    score += toneScore * 0.4;
    
    // Lexicon usage (30% weight)
    const lexiconScore = this.assessLexicon(content.body, brandVoice.voice.lexicon);
    score += lexiconScore * 0.3;
    
    // CTA consistency (20% weight)
    const ctaScore = this.assessCTA(content.cta, brandVoice.voice.ctas);
    score += ctaScore * 0.2;
    
    // Style adherence (10% weight)
    const styleScore = this.assessStyle(content, brandVoice.voice.style);
    score += styleScore * 0.1;
    
    return Math.max(0, Math.min(1, score));
  }
  
  calculateReadabilityScore(content: string): number {
    // Flesch reading ease adapted for Portuguese
    // Target: 60-70 (easy to read)
  }
  
  predictEngagement(
    content: ContentVariation, 
    channel: string, 
    historicalData?: PerformanceData[]
  ): number {
    // ML model or heuristic-based prediction
    // Based on length, hashtag count, emotional words, etc.
  }
}
```

**Critérios de Aceite:**
- [ ] Brand Voice adherence scoring funcionando
- [ ] Readability score implementado
- [ ] Engagement prediction com accuracy > 70%
- [ ] Performance baseline < 100ms por variation

### Task 7: Feedback Learning System
**Responsável:** Backend_Developer  
**Duração:** 2 dias  
**Input:** User feedback data + content performance  
**Output:** Prompt optimization system  

**Definição Técnica:**
```typescript
class FeedbackLearningService {
  async analyzeUserFeedback(timeframe: DateRange): Promise<PromptOptimization[]> {
    // Analyze patterns in user feedback
    const feedback = await this.getFeedbackData(timeframe);
    const patterns = this.identifyPatterns(feedback);
    
    return patterns.map(pattern => ({
      prompt_type: pattern.prompt_type,
      issue: pattern.common_issue,
      suggested_modification: pattern.suggested_fix,
      confidence: pattern.confidence_score
    }));
  }
  
  async updatePromptBasedOnFeedback(
    promptId: string, 
    optimization: PromptOptimization
  ): Promise<AIPrompt> {
    // A/B test new prompt version
    const newPrompt = this.modifyPrompt(promptId, optimization);
    return this.createPromptVersion(newPrompt);
  }
}
```

**Critérios de Aceite:**
- [ ] Coleta sistemática de feedback
- [ ] Pattern recognition em feedback negativo
- [ ] A/B testing de prompt modifications
- [ ] Performance improvement tracking

### Task 8: Generation API Endpoints
**Responsável:** Backend_Developer  
**Duração:** 2 dias  
**Input:** ContentGenerationService + validation schemas  
**Output:** REST APIs para geração de conteúdo  

**Definição Técnica:**
- POST /api/content/generate - Gerar conteúdo novo
- GET /api/content/:id - Buscar conteúdo gerado
- POST /api/content/:id/regenerate - Regenerar com feedback
- POST /api/content/:id/feedback - Submeter feedback
- GET /api/content/templates - Listar prompts disponíveis

**Critérios de Aceite:**
- [ ] Todas as operações CRUD funcionando
- [ ] Validação de entrada com Zod
- [ ] Error handling robusto
- [ ] Response time < 30s para geração

### Task 9: Content Brief Interface
**Responsável:** Frontend_Developer  
**Duração:** 2 dias  
**Input:** Design system + API contracts  
**Output:** Form de criação de brief  

**Definição Técnica:**
```tsx
const ContentBriefForm = () => {
  const [brief, setBrief] = useState<ContentBrief>();
  const { mutate: generateContent } = useGenerateContent();
  
  return (
    <Card>
      <CardHeader>
        <CardTitle>Novo Conteúdo</CardTitle>
      </CardHeader>
      <CardContent>
        <Form>
          <FormField name="theme" label="Tema/Assunto" required />
          <FormField name="objective" type="select" options={objectives} />
          <FormField name="channel" type="select" options={channels} />
          <FormField name="format" type="select" options={formats} />
          <FormField name="custom_instructions" type="textarea" />
          <FormField name="words_to_avoid" type="tags" />
        </Form>
        <Button onClick={() => generateContent(brief)}>
          Gerar Conteúdo
        </Button>
      </CardContent>
    </Card>
  );
};
```

**Critérios de Aceite:**
- [ ] Form validação completa
- [ ] Auto-save de drafts
- [ ] Integration com Brand Voice selecionado
- [ ] UX intuitiva e responsiva

### Task 10: Content Preview System
**Responsável:** Frontend_Developer  
**Duração:** 3 dias  
**Input:** Generated content data + channel specifications  
**Output:** Multi-channel preview components  

**Definição Técnica:**
```tsx
const ContentPreview = ({ content, channel }: ContentPreviewProps) => {
  const PreviewComponent = useMemo(() => {
    switch (channel) {
      case 'instagram_post':
        return InstagramPostPreview;
      case 'instagram_story':
        return InstagramStoryPreview;
      case 'facebook_post':
        return FacebookPostPreview;
      case 'email':
        return EmailPreview;
      default:
        return GenericPreview;
    }
  }, [channel]);
  
  return (
    <div className="preview-container">
      <PreviewComponent content={content} />
      <div className="preview-metrics">
        <MetricCard 
          title="Brand Voice Score" 
          value={content.quality_metrics.brand_voice_score} 
        />
        <MetricCard 
          title="Compliance Score" 
          value={content.compliance_score} 
        />
        <MetricCard 
          title="Estimated Engagement" 
          value={content.variations[0].estimated_performance} 
        />
      </div>
    </div>
  );
};
```

**Critérios de Aceite:**
- [ ] Preview fiel para cada canal
- [ ] Switching entre variations fluido
- [ ] Métricas de qualidade visíveis
- [ ] Responsive design

### Task 11: Feedback Interface
**Responsável:** Frontend_Developer  
**Duração:** 2 dias  
**Input:** Content variations + feedback API  
**Output:** Approval/feedback workflow  

**Definição Técnica:**
```tsx
const ContentApprovalInterface = ({ generatedContent }: Props) => {
  const [selectedVariation, setSelectedVariation] = useState(0);
  const { mutate: submitFeedback } = useSubmitFeedback();
  
  return (
    <div className="approval-interface">
      <VariationSelector 
        variations={generatedContent.variations}
        selected={selectedVariation}
        onChange={setSelectedVariation}
      />
      
      <ContentEditor 
        content={generatedContent.variations[selectedVariation]}
        onChange={handleEdit}
      />
      
      <ApprovalActions>
        <Button 
          variant="outline" 
          onClick={() => submitFeedback({ type: 'regeneration' })}
        >
          Regenerar
        </Button>
        <Button 
          variant="default"
          onClick={() => submitFeedback({ type: 'approval' })}
        >
          Aprovar
        </Button>
      </ApprovalActions>
    </div>
  );
};
```

**Critérios de Aceite:**
- [ ] Editing inline funcionando
- [ ] Rating system implementado
- [ ] Regeneration com contexto
- [ ] Approval workflow completo

### Task 12: Batch Generation Feature
**Responsável:** Frontend_Developer  
**Duração:** 2 days  
**Input:** Multiple content briefs + queue system  
**Output:** Batch processing interface  

**Definição Técnica:**
- Interface para criar múltiplos briefs
- Queue status tracking
- Bulk approval/rejection
- Export functionality

**Critérios de Aceite:**
- [ ] Criação de até 10 briefs simultaneamente
- [ ] Progress tracking em tempo real
- [ ] Bulk operations funcionando
- [ ] Export para diferentes formatos

### Task 13: Cost Monitoring Dashboard
**Responsável:** Frontend_Developer  
**Duração:** 1 dia  
**Input:** Usage metrics + cost data  
**Output:** Dashboard de custos OpenAI  

**Definição Técnica:**
```tsx
const CostMonitoringDashboard = () => {
  const { data: costData } = useCostMetrics();
  
  return (
    <div className="cost-dashboard">
      <MetricsGrid>
        <MetricCard title="Tokens Used Today" value={costData.tokens_today} />
        <MetricCard title="Est. Cost Today" value={costData.cost_today} />
        <MetricCard title="Budget Remaining" value={costData.budget_remaining} />
        <MetricCard title="Avg Cost per Content" value={costData.avg_cost} />
      </MetricsGrid>
      
      <Chart 
        data={costData.daily_usage} 
        type="line" 
        title="Usage Trend"
      />
      
      <AlertsPanel alerts={costData.budget_alerts} />
    </div>
  );
};
```

**Critérios de Aceite:**
- [ ] Métricas de custo em tempo real
- [ ] Budget alerts configuráveis
- [ ] Historical data visualization
- [ ] Export de relatórios

### Task 14: Performance Analytics
**Responsável:** Frontend_Developer  
**Duração:** 2 dias  
**Input:** Content performance data + analytics API  
**Output:** Analytics dashboard  

**Definição Técnica:**
- Dashboard showing generation success rates
- Quality score trends over time
- User satisfaction metrics
- Prompt performance comparison

**Critérios de Aceite:**
- [ ] Real-time metrics dashboard
- [ ] Historical trend analysis
- [ ] Prompt performance comparison
- [ ] User behavior insights

### Task 15: Integration Testing
**Responsável:** QA_Engineer  
**Duração:** 3 dias  
**Input:** Complete system + test scenarios  
**Output:** Test report + performance validation  

**Definição Técnica:**
```typescript
// End-to-end test scenarios
describe('Content Generation E2E', () => {
  it('should generate content within 30 seconds', async () => {
    const brief = createTestBrief();
    const start = Date.now();
    
    const result = await generateContent(brief);
    const duration = Date.now() - start;
    
    expect(duration).toBeLessThan(30000);
    expect(result.variations).toHaveLength(3);
    expect(result.compliance_score).toBeGreaterThan(0.9);
  });
  
  it('should maintain brand voice consistency', async () => {
    const brief = createTestBrief();
    const brandVoice = createTestBrandVoice();
    
    const result = await generateContent(brief);
    
    for (const variation of result.variations) {
      expect(variation.tone_score.confidence).toBeGreaterThan(0.8);
      expect(hasProhibitedWords(variation.body, brandVoice.voice.lexicon.avoid)).toBe(false);
    }
  });
});
```

**Critérios de Aceite:**
- [ ] All user flows tested end-to-end
- [ ] Performance requirements validated
- [ ] Brand voice consistency verified
- [ ] Compliance checking accuracy tested

### Task 16: Documentation & Deployment
**Responsável:** Backend_Developer + QA_Engineer  
**Duração:** 1 dia  
**Input:** Complete system + deployment requirements  
**Output:** Deployed system + user documentation  

**Definição Técnica:**
- API documentation complete
- User guide for content generation
- Admin guide for prompt management
- Deployment automation + monitoring

**Critérios de Aceite:**
- [ ] API docs complete and up to date
- [ ] User guides written and tested
- [ ] System deployed to production
- [ ] Monitoring and alerts configured

---

## ✅ Critérios de Aceite Globais

### Funcional
- [ ] Interface de brief completa e intuitiva
- [ ] Geração de 3 variações por brief
- [ ] Compliance checking automático com 99% accuracy
- [ ] Fluxo de aprovação/edição/regeneração
- [ ] Integration com Brand Voice JSON 100% funcional
- [ ] Cost monitoring e budget controls

### Performance
- [ ] Tempo de geração < 30s para 3 variações
- [ ] API response time < 500ms (exceto geração)
- [ ] Concurrent users suportados: 50+
- [ ] Uptime: 99.9% durante horário comercial

### Qualidade
- [ ] ≥ 50% approval rate sem edição em beta testing
- [ ] Zero compliance violations em test dataset
- [ ] Brand voice adherence score > 0.8 consistentemente
- [ ] User satisfaction score > 4.0/5.0

### Técnico
- [ ] Error handling robusto em todos os componentes
- [ ] OpenAI cost tracking e budget enforcement
- [ ] Queue system para processamento assíncrono
- [ ] Comprehensive logging para debugging

---

## 🔍 Validação de Qualidade

### Testes Automatizados
```typescript
// Prompt effectiveness tests
describe('Prompt Engineering', () => {
  it('should generate pet-appropriate content', async () => {
    const prompts = await promptService.getAllActive();
    
    for (const prompt of prompts) {
      const result = await testPrompt(prompt, sampleBriefs);
      expect(result.pet_relevance_score).toBeGreaterThan(0.8);
      expect(result.has_health_claims).toBe(false);
    }
  });
});

// Content quality tests
describe('Content Quality', () => {
  it('should maintain consistency across variations', async () => {
    const brief = createTestBrief();
    const result = await generateContent(brief);
    
    const toneConsistency = calculateToneConsistency(result.variations);
    expect(toneConsistency).toBeGreaterThan(0.7);
  });
});
```

### Manual Testing Checklist
- [ ] Content generation for all 5 objectives
- [ ] Brand voice application accuracy
- [ ] Compliance checking effectiveness
- [ ] User feedback loop functionality
- [ ] Cost monitoring accuracy

---

## 🚨 Cenários de Rollback

### Trigger Conditions
- Generation success rate < 80%
- Average response time > 45s
- Compliance failure rate > 5%
- OpenAI cost overrun > 150% of budget

### Rollback Procedures
1. **Disable New Generations:** Stop accepting new content briefs
2. **Queue Processing:** Complete pending generations
3. **Service Rollback:** Deploy previous stable version
4. **Data Integrity:** Verify no corruption in generated content
5. **User Communication:** Notify users of temporary service interruption

### Recovery Testing
- Rollback procedures tested monthly
- Backup prompts maintained for quick deployment
- RTO < 30 minutes for complete rollback
- RPO < 5 minutes for generation data

---

## 📊 Monitoramento e Alertas

### Métricas Técnicas
- **Generation Success Rate:** > 95% within 30s
- **API Response Time:** < 500ms (non-generation endpoints)
- **OpenAI API Errors:** < 2% of requests
- **Queue Processing Time:** < 60s for batch operations

### Métricas de Produto
- **Content Approval Rate:** Target ≥ 50% without edits
- **Brand Voice Adherence:** Average score > 0.8
- **User Satisfaction:** Rating > 4.0/5.0
- **Cost Efficiency:** Cost per approved content < $0.50

### Alertas Configurados
- Generation failure rate > 10% in 15 minutes
- Response time > 45s for 5 consecutive requests
- Daily OpenAI cost > 120% of budget
- Compliance failure > 3 instances in 1 hour

---

## 📈 Métricas de Sucesso

### KPIs Primários
- **Approval Rate:** ≥ 50% das peças aprovadas sem edição
- **Generation Speed:** < 30s para 3 variações consistentemente
- **Brand Consistency:** 100% de conteúdo usando Brand Voice JSON
- **Compliance Rate:** Zero claims de saúde não aprovados

### KPIs Secundários
- **User Productivity:** 3× improvement vs manual content creation
- **Cost Efficiency:** ROI positivo em cost per approved content
- **Feature Adoption:** 70% dos usuários ativos usam geração IA
- **Quality Consistency:** Score deviation < 0.2 entre variations

### Leading Indicators
- **Brief Completion Rate:** % de briefs que resultam em conteúdo
- **Regeneration Rate:** % que precisa regenerar (target < 30%)
- **Editing Frequency:** Quantidade de edições por piece
- **Template Usage:** Integration com Biblioteca de Campanhas

---

*Data de criação: 2025-01-16*  
*Última atualização: 2025-01-16*  
*Próxima revisão: Após Sprint 6*