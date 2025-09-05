# F-6: Geração de Conteúdo IA

**Versão:** 1.0  
**Status:** 📅 Planejado  
**Fase:** 2 - Fábrica de Conteúdo  
**Prioridade:** P0 - Crítico  
**Responsável:** Backend + IA  

---

## 📋 Visão Geral

**Objetivo:** Engine de IA para criação automática de conteúdo (copies + criativos sugeridos) que mantém consistência com a Brand Voice JSON e atende aos objetivos de marketing do setor pet.

**Proposta de Valor:** Gerar conteúdo de alta qualidade com ≥ 50% de aprovação sem edição, reduzindo bloqueio criativo e acelerando produção de marketing.

**Job-to-be-Done:** "Como social media/proprietário, preciso de conteúdo consistente e envolvente para manter presença ativa sem gastar horas criando posts do zero."

---

## 🎯 Objetivos & Métricas

### Objetivos de Negócio
- **Taxa de Aprovação:** ≥ 50% das peças aprovadas sem edição
- **Produtividade:** ≥ 3× vs. processo manual
- **Consistência de Marca:** 100% de conteúdo usando Brand Voice JSON
- **Compliance:** Zero claims de saúde animal não aprovados

### Métricas Técnicas
- **Tempo de Geração:** < 30s para 3 variações por item
- **Quality Score:** Avaliação automática de aderência à marca
- **Cost Control:** Budget tracking de tokens OpenAI
- **Error Rate:** < 2% de falhas na geração

---

## 👥 Personas & Casos de Uso

### Persona Principal: Social Media Interno
**Cenário:** "Preciso criar 10 posts para a próxima semana sobre vacinação"
**Input:** Tema + objetivo + canal
**Output:** 3 variações de copy + hashtags + sugestões de criativo

### Persona Secundária: Proprietário de Clínica
**Cenário:** "Quero post educativo sobre prevenção que não pareça propaganda"
**Input:** Assunto + tom educativo
**Output:** Copy didático + disclaimer + CTA sutil

---

## ⚙️ Especificação Funcional

### 🎨 Entrada de Dados
**RF-6.1: Brief de Conteúdo**
- **Tema/Assunto:** texto livre ou seleção de templates
- **Objetivo:** educar, vender, engajar, recall
- **Canal:** Instagram post, stories, Facebook, email
- **Formato:** texto, carrossel, vídeo (script)
- **Tom específico:** ajuste opcional do Brand Voice
- **Restrições:** palavras a evitar, compliance específico

**Critérios de Aceite:**
- [ ] Interface de brief intuitiva com campos obrigatórios/opcionais
- [ ] Validação de inputs antes de enviar para IA
- [ ] Salvamento de briefs como templates reutilizáveis
- [ ] Sugestões automáticas baseadas em histórico

### 🤖 Processamento IA
**RF-6.2: Engine de Geração**
- **Consumo de Brand Voice JSON:** tom, lexicon, CTAs preferidos
- **Prompts especializados** por tipo de conteúdo pet
- **3 variações por item** com diferentes abordagens
- **Checagem automática de compliance** (claims de saúde)
- **Validação anti-prompt leakage**
- **Fallbacks** para casos de error/rate limit

**Critérios de Aceite:**
- [ ] Geração usa 100% das definições do Brand Voice JSON
- [ ] 3 variações distintas mas coerentes com a marca
- [ ] Filtro automático de claims médicos inadequados
- [ ] Fallback gracioso em caso de falha da IA

### 📝 Estrutura de Output
**RF-6.3: Formato de Conteúdo**
- **Copy principal** (título + corpo + CTA)
- **Hashtags sugeridas** (#pet #veterinaria #saude)
- **Meta-informações** (melhor horário, frequência)
- **Instruções de criativo** (tipo de imagem/vídeo)
- **Variações por canal** (adaptação automática)
- **Compliance notes** (disclaimers necessários)

**Exemplo de Output:**
```json
{
  "contentId": "uuid",
  "theme": "Vacinação Anual",
  "objective": "educar",
  "channel": "instagram_post",
  "variations": [
    {
      "title": "🐾 Hora da Vacina Anual!",
      "body": "Seu pet está protegido? A vacinação anual...",
      "cta": "Agende agora",
      "hashtags": ["#vacinapet", "#prevencao"],
      "tone_score": {"confiança": 0.8, "acolhimento": 0.9}
    }
  ],
  "creative_brief": {
    "type": "photo",
    "description": "Pet feliz sendo vacinado, ambiente clínico limpo",
    "style": "natural, lighting suave"
  },
  "compliance": {
    "disclaimers": ["Consulte sempre um veterinário"],
    "flags": []
  }
}
```

### ✅ Fluxo de Aprovação
**RF-6.4: Review & Edição**
- **Visualização prévia** por canal
- **Botões de ação:** Aprovar / Regenerar / Editar
- **Editor inline** para ajustes rápidos
- **Histórico de versões** (original vs. editado)
- **Comentários** e feedback para melhoria da IA
- **Aprovação em lote** para múltiplos itens

**Critérios de Aceite:**
- [ ] Preview fiel ao formato do canal de destino
- [ ] Edição inline mantém formatação
- [ ] Regeneração usa feedback anterior
- [ ] Histórico preserva todas as versões

---

## 🏗️ Especificação Técnica

### Stack Tecnológico
- **IA Provider:** OpenAI GPT-4 com prompts especializados
- **Backend:** Node.js + Express para orchestração
- **Queue System:** Para processamento assíncrono
- **Cache:** Redis para prompts e respostas frequentes
- **Storage:** Supabase para conteúdo e metadados

### Arquitetura do Sistema
```typescript
// Service principal
class ContentGenerationService {
  async generateContent(brief: ContentBrief): Promise<ContentVariations>
  async regenerateWithFeedback(contentId: string, feedback: string): Promise<ContentVariations>
  async validateCompliance(content: string): Promise<ComplianceResult>
}

// Specialized prompts
class PetContentPrompts {
  educational(topic: string, brandVoice: BrandVoice): string
  promotional(product: string, brandVoice: BrandVoice): string
  recall(service: string, brandVoice: BrandVoice): string
}

// Compliance engine
class PetComplianceChecker {
  async checkHealthClaims(content: string): Promise<ComplianceFlags>
  async suggestDisclaimers(content: string): Promise<string[]>
}
```

### Modelo de Dados
```sql
-- Briefs de conteúdo
ContentBrief {
  id: uuid PRIMARY KEY,
  accountId: uuid REFERENCES accounts(id),
  userId: uuid REFERENCES users(id),
  theme: text NOT NULL,
  objective: text NOT NULL, -- educate, sell, engage, recall
  channel: text NOT NULL,
  brandVoiceId: uuid REFERENCES brand_voices(id),
  customInstructions: text,
  createdAt: timestamp DEFAULT now()
}

-- Conteúdo gerado
GeneratedContent {
  id: uuid PRIMARY KEY,
  briefId: uuid REFERENCES content_briefs(id),
  variations: jsonb NOT NULL, -- array de variações
  creativeBrief: jsonb,
  complianceFlags: jsonb,
  status: text NOT NULL, -- generated, approved, rejected
  approvedBy: uuid REFERENCES users(id),
  approvedAt: timestamp,
  generationMetrics: jsonb -- tokens, time, quality_score
}

-- Feedback para melhoria
ContentFeedback {
  id: uuid PRIMARY KEY,
  contentId: uuid REFERENCES generated_content(id),
  feedbackType: text NOT NULL, -- approval, rejection, edit
  feedback: text,
  userId: uuid REFERENCES users(id),
  createdAt: timestamp DEFAULT now()
}
```

---

## 🎯 Prompts Especializados

### Template Base Pet
```
Você é um especialista em marketing para o setor pet, criando conteúdo para [BRAND_NAME].

BRAND VOICE:
- Tom: {tone_descriptors}
- Persona: {brand_persona}
- Palavras preferidas: {preferred_terms}
- Palavras a evitar: {avoid_terms}
- CTAs padrão: {default_ctas}

COMPLIANCE PET:
- Nunca prometa cura de doenças
- Use disclaimers para conteúdo de saúde
- Prefira "tutor" ao invés de "dono"
- Evite termos que causem medo desnecessário

TAREFA:
Crie 3 variações de [CONTENT_TYPE] sobre [THEME] com objetivo de [OBJECTIVE].

FORMATO DE SAÍDA:
[JSON estruturado com variações]
```

### Prompts por Tipo
- **Educativo:** Foco em informação útil + disclaimer
- **Promocional:** Benefícios + social proof + CTA
- **Recall:** Urgência sutil + facilidade de agendamento
- **Engajamento:** Pergunta + emoção + interação

---

## 🔒 Segurança & Compliance

### Compliance Pet-Specific
- **Health Claims Filter:** Detecção automática de promessas médicas
- **CFMV Guidelines:** Aderência às diretrizes veterinárias
- **Disclaimers Automáticos:** Inserção contextual de avisos
- **Term Validation:** Check contra lexicon proibido

### Controles de Custo
- **Budget Caps:** Limite por conta/mês de tokens
- **Circuit Breakers:** Pausa automática se orçamento excedido
- **Usage Analytics:** Tracking de custo por tipo de conteúdo
- **Cache Inteligente:** Reutilização de respostas similares

### Data Privacy
- **Prompt Isolation:** Dados de clientes não vazam entre prompts
- **Content Retention:** Política clara de retenção
- **Audit Trail:** Log de toda geração para compliance

---

## 🧪 Testes & Qualidade

### Estratégia de Teste
- **Prompt Testing:** Validação sistemática de qualidade
- **A/B Testing:** Diferentes approaches para mesmo brief
- **Compliance Testing:** Validação automática de guidelines
- **Load Testing:** Performance com múltiplas gerações simultâneas

### Quality Metrics
- **Brand Voice Adherence:** Score automático 0-1
- **Engagement Prediction:** Modelo de previsão de performance
- **Compliance Score:** Automático + human review
- **Creativity Index:** Diversidade entre variações

---

## 📈 Métricas & Monitoramento

### KPIs de Produto
- **Approval Rate:** ≥ 50% sem edição (target principal)
- **Time to Publish:** < 5min de geração à aprovação
- **Content Velocity:** Posts/semana por cliente
- **Satisfaction Score:** Rating por peça gerada

### Métricas de IA
- **Token Efficiency:** Custo por peça aprovada
- **Quality Consistency:** Variação do quality score
- **Compliance Rate:** % de conteúdo sem flags
- **Regeneration Rate:** % que precisa ser regenerado

### Alertas Operacionais
- Generation time > 60s
- Compliance flags > 10% em 1h
- Budget utilization > 80%
- Quality score < 0.7 consistently

---

## 🔮 Roadmap & Evoluções

### Fase 2 (Inicial)
- ✅ **Core Engine:** Geração básica + compliance
- ✅ **3 Tipos:** Educativo, promocional, recall
- ✅ **2 Canais:** Instagram, Facebook

### Fase 2.1 (Expansão)
- 📅 **Mais Canais:** Email, Stories, LinkedIn
- 📅 **Creative Briefs:** Especificações detalhadas para design
- 📅 **Batch Generation:** Múltiplos posts de uma vez

### Fase 3 (Avançado)
- 🔮 **Multimodal:** Geração de imagens + copy
- 🔮 **Personalization:** Conteúdo baseado em audiência
- 🔮 **Performance Learning:** IA aprende com métricas reais

---

## ⚠️ Riscos & Mitigações

### Riscos de Produto
- **Conteúdo Genérico:** IA pode gerar texto robótico
  - *Mitigação:* Brand Voice rigoroso + feedback loop
- **Compliance Fails:** Claims inadequados passarem
  - *Mitigação:* Múltiplas camadas de validação
- **Over-dependence:** Usuários perdem capacidade criativa
  - *Mitigação:* Features de edição e customização

### Riscos Técnicos
- **OpenAI Costs:** Custos podem explodir
  - *Mitigação:* Budget controls + cache agressivo
- **Quality Inconsistency:** Variação grande entre gerações
  - *Mitigação:* Prompt engineering + quality scoring
- **Latency:** Gerações lentas frustrando usuários
  - *Mitigação:* Async processing + progress indicators

---

## 📚 Referências & Links

- **PRD:** Seção 4.2 - F-6 Geração de Conteúdo
- **Dependencies:** F-3 (Brand Voice JSON), F-5 (Templates)
- **Integration:** F-7 (Calendário Editorial)
- **Compliance:** CFMV guidelines, advertising regulations

---

## ✅ Definition of Done

### Funcional
- [ ] Interface de brief completa e intuitiva
- [ ] Geração de 3 variações por brief
- [ ] Compliance checking automático
- [ ] Fluxo de aprovação/edição/regeneração
- [ ] Integration com Brand Voice JSON
- [ ] Templates reutilizáveis

### Técnico
- [ ] OpenAI integration com error handling
- [ ] Budget controls e monitoring
- [ ] Performance < 30s per generation
- [ ] Queue system para processamento assíncrono
- [ ] Audit logging completo

### Qualidade
- [ ] ≥ 50% approval rate em testes beta
- [ ] Zero compliance violations em test dataset
- [ ] Prompt testing sistemático
- [ ] Load testing com 100 concurrent users
- [ ] Security review completo

---

*Última atualização: Setembro 2025*