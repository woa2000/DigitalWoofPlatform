# F-1: Anamnese Digital

**Versão:** 1.0  
**Status:** ✅ Implementado (MVP)  
**Fase:** 1 - Cérebro da Marca  
**Prioridade:** P0 - Crítico  
**Responsável:** Backend + IA  

---

## 📋 Visão Geral

**Objetivo:** Análise automatizada da presença digital existente de negócios do setor pet através de um agente de IA que coleta e analisa dados públicos de sites e redes sociais.

**Proposta de Valor:** Gerar diagnóstico estratégico completo que alimenta o Brand Voice JSON e fornece insights acionáveis para melhoria da presença digital.

**Job-to-be-Done:** "Como proprietário de negócio pet, preciso entender minha atual presença digital para identificar oportunidades de melhoria e definir minha estratégia de marketing."

---

## 🎯 Objetivos & Métricas

### Objetivos de Negócio
- **Time-to-Value:** Novo cliente gera diagnóstico completo em < 60 min
- **NPS do Diagnóstico:** > 70
- **Qualidade da Análise:** Completude e confiabilidade dos sinais coletados

### Métricas Técnicas
- **Tempo de Processamento:** ≤ 2 min para análise mock
- **Taxa de Sucesso:** > 95% para URLs válidas
- **Deduplicação:** 100% efetiva para URLs normalizadas

---

## 👥 Personas & Casos de Uso

### Persona Principal: Proprietário de Clínica Veterinária
**Cenário:** "Quero entender como minha clínica é percebida online e onde posso melhorar"
**Entradas:** Site da clínica + Instagram + Facebook
**Saída Esperada:** Diagnóstico de identidade, personas dos clientes, auditoria UX, recomendações

### Persona Secundária: Gerente de Pet Shop
**Cenário:** "Preciso comparar minha presença digital com concorrentes"
**Entradas:** Site + múltiplas redes sociais + Google Business Profile
**Saída Esperada:** Análise de ecossistema, benchmark, plano de ação

---

## ⚙️ Especificação Funcional

### 🔤 Entrada de Dados
**RF-1.1: Coleta de URLs**
- **URL do site (obrigatória)** com validação de formato
- **Múltiplas redes sociais:** campos dinâmicos para adicionar/remover URLs
- **Suporte a:** Instagram, Facebook/Páginas, TikTok, YouTube, Google Business Profile
- **Validação automática** de formato e normalização de URL
- **Prevenção de duplicatas** por URL normalizada

**Critérios de Aceite:**
- [ ] Usuário pode adicionar 1 site obrigatório + até 10 redes sociais
- [ ] Validação em tempo real de formato de URL
- [ ] Normalização automática (remove www, trailing slash, lowercase)
- [ ] Campos dinâmicos com +/- para redes sociais

### 🔄 Processamento da Análise
**RF-1.2: Agente de IA**
- **Verificação de duplicatas** por URL normalizada (evita reprocesso)
- **Pipeline de análise:** fetch público → parsing → extração de sinais → sumarização → recomendações
- **Simulação de IA (mock atual):** placeholder para integração com modelo real
- **Loading states** e tratamento de erros com mensagens claras
- **Status tracking:** queued → running → done → error

**Critérios de Aceite:**
- [ ] Deduplicação ativa impede reprocessamento da mesma URL
- [ ] Loading states claros durante processamento
- [ ] Error handling com mensagens específicas
- [ ] Pipeline mock retorna estrutura compatível com produção

### 💾 Armazenamento
**RF-1.3: Persistência de Dados**
- **Supabase (PostgreSQL):** tabelas para análise, fontes, findings
- **Associação multitenant** por accountId/userId
- **Timestamps** de criação/atualização
- **Deduplicação** por hash da URL normalizada
- **Artefatos derivados:** BrandVoiceDraft, ActionPlan, HomeAnatomy

**Modelo de Dados:**
```sql
-- Análise principal
AnamnesisAnalysis {
  id: uuid PRIMARY KEY,
  accountId: uuid REFERENCES accounts(id),
  userId: uuid REFERENCES users(id),
  primaryUrl: text NOT NULL,
  status: text NOT NULL, -- queued, running, done, error
  scoreCompleteness: float,
  createdAt: timestamp DEFAULT now(),
  updatedAt: timestamp DEFAULT now()
}

-- Fontes analisadas
AnamnesisSource {
  id: uuid PRIMARY KEY,
  analysisId: uuid REFERENCES anamnesis_analysis(id),
  type: text NOT NULL, -- site, social
  url: text NOT NULL,
  normalizedUrl: text NOT NULL,
  provider: text, -- instagram, facebook, etc.
  lastFetchedAt: timestamp,
  hash: text UNIQUE
}

-- Achados estruturados
AnamnesisFinding {
  id: uuid PRIMARY KEY,
  analysisId: uuid REFERENCES anamnesis_analysis(id),
  key: text NOT NULL,
  section: text NOT NULL, -- identity, personas, ux, etc.
  payload: jsonb NOT NULL
}
```

### 📊 Visualização dos Resultados
**RF-1.4: Interface de Resultados**
- **Cards por seção:** Identidade, Personas, Auditoria UX, Ecossistema, Plano de Ação
- **Navegação fluida** entre formulário e resultados
- **Exportação:** PDF e link compartilhável
- **Indicador de qualidade** da coleta
- **Seções específicas:**
  - Diagnóstico de Identidade e Propósito
  - Personas (múltiplas, com dores/objetivos)
  - Auditoria de Percepção & Experiência + Matriz Johari
  - Análise do Ecossistema (benchmark)
  - Plano de Tratamento (Quick Wins)
  - Roadmap Terapêutico (priorização)
  - Nova Anatomia da Home
  - Perguntas de Aprofundamento

**Critérios de Aceite:**
- [ ] Interface com 8 cards principais bem estruturados
- [ ] Exportação PDF funcional
- [ ] Link compartilhável com controle de privacidade
- [ ] Indicador visual de completude da análise

### 🔧 Gestão de Análises
**RF-1.5: CRUD de Análises**
- **Histórico por usuário** (lista de análises anteriores)
- **Reprocessamento** (refazer análise existente)
- **Exclusão** de análises
- **Carregamento automático** se URL já foi analisada

**Critérios de Aceite:**
- [ ] Lista histórico ordenado por data (mais recente primeiro)
- [ ] Botão "Reprocessar" refaz análise mantendo configurações
- [ ] Exclusão com confirmação
- [ ] Auto-load de resultados existentes ao inserir URL conhecida

---

## 🏗️ Especificação Técnica

### Stack Tecnológico
- **Backend:** Node.js + Express + TypeScript
- **Database:** Supabase (PostgreSQL) com RLS
- **IA:** OpenAI API (integração futura, mock atual)
- **Frontend:** React + TypeScript + shadcn/ui
- **ORM:** Drizzle com schemas type-safe

### Arquitetura do Agente de IA
```typescript
// Service principal
class AnamnesisService {
  async create(data: CreateAnalysisDto): Promise<AnamnesisAnalysis>
  async findByNormalizedUrl(url: string): Promise<AnamnesisAnalysis | null>
  async reprocess(analysisId: string): Promise<AnamnesisAnalysis>
  async delete(analysisId: string): Promise<void>
}

// Agente de processamento
class AnamnesisAgent {
  async analyzeWebsite(url: string): Promise<WebsiteAnalysis>
  async analyzeSocialMedia(urls: string[]): Promise<SocialAnalysis>
  async generateDiagnosis(data: CombinedAnalysis): Promise<DiagnosisReport>
}

// Mock implementation (atual)
class MockAnalysisEngine {
  async process(sources: AnamnesisSource[]): Promise<AnalysisResult>
}
```

### Integração com Brand Voice
```typescript
// Conecta F-1 com F-3
class BrandVoiceGenerator {
  async generateFromAnamnesis(analysis: AnamnesisAnalysis): Promise<BrandVoiceDraft>
}
```

---

## 🔒 Segurança & Compliance

### Coleta Responsável
- **Respeito a robots.txt** dos sites analisados
- **Rate limiting** configurável para evitar sobrecarga
- **User-agent identificável** nas requisições
- **Cache e TTL** por página para eficiência
- **Opt-out** por domínio se solicitado

### Privacidade & LGPD
- **Apenas dados públicos** são coletados
- **Remoção automática** de PII inadvertidamente coletada
- **Consentimento explícito** para análise de dados da empresa
- **Retenção configurável** dos dados de análise
- **Auditoria** de todas as coletas realizadas

### Controles de Acesso
- **Multitenant:** isolamento por accountId
- **RBAC:** apenas usuários autorizados podem criar/ver análises
- **RLS (Row Level Security):** políticas do Supabase ativas

---

## 🧪 Testes & Qualidade

### Estratégia de Testes
- **Unit Tests:** Services de análise e validação
- **Integration Tests:** Pipeline completo mock
- **E2E Tests:** Fluxo usuário completo
- **Performance Tests:** Tempo de processamento < 2min

### Cenários de Teste
1. **Happy Path:** Site + 3 redes sociais → relatório completo
2. **Site Only:** Apenas URL principal → análise parcial mas útil
3. **Invalid URLs:** Tratamento de erros gracioso
4. **Duplicates:** Deduplicação funcionando
5. **Large Dataset:** Performance com múltiplas fontes

---

## 📈 Métricas & Monitoramento

### KPIs de Produto
- **Time-to-Value:** < 60min da entrada ao diagnóstico completo
- **User Satisfaction:** NPS > 70 para qualidade do diagnóstico
- **Completeness Score:** % médio de seções preenchidas
- **Reprocess Rate:** % de análises reprocessadas (target < 10%)

### Métricas Técnicas
- **Processing Time:** p95 < 2min para análise mock
- **Success Rate:** > 95% para URLs válidas
- **Error Rate:** < 5% de falhas no pipeline
- **Deduplication Effectiveness:** 100% para URLs idênticas

### Alertas
- Processing time > 5min
- Error rate > 10% em 1h
- Queue backup > 50 análises pendentes

---

## 🔮 Roadmap & Evoluções

### Atual (Implementado)
- ✅ Mock engine com estrutura completa
- ✅ CRUD de análises
- ✅ Interface de resultados
- ✅ Deduplicação e cache

### Próximos Passos
- 🔄 **Integração IA Real:** Substituir mock por OpenAI + prompts especializados
- 📊 **Métricas Avançadas:** Dashboard de quality score
- 🎯 **Refinamento Conversacional:** Chat para aprofundar insights
- 🔍 **Análise Competitiva:** Comparação automática com benchmarks

### Futuro (Fases 2+)
- **IA Multimodal:** Análise de imagens e vídeos
- **Real-time Monitoring:** Alerts de mudanças na presença digital
- **Integração CRM:** Sync com bases de clientes existentes

---

## ⚠️ Riscos & Mitigações

### Riscos Técnicos
- **Qualidade GIGO:** Dados ruins geram insights ruins
  - *Mitigação:* Validação rigorosa + feedback loop
- **API Limits:** Rate limits de sites/redes
  - *Mitigação:* Backoff exponencial + cache
- **IA Hallucination:** Mock pode mascarar problemas reais
  - *Mitigação:* Teste extensivo antes da integração real

### Riscos de Produto
- **Complexidade:** Interface pode intimidar usuários
  - *Mitigação:* Onboarding guiado + tooltips
- **Expectativas:** Usuários podem esperar análise impossível
  - *Mitigação:* Comunicação clara de limitações

---

## 📚 Referências & Links

- **Código:** `server/services/anamnesis.service.ts`
- **Schema:** `shared/schema.ts` (tabelas anamnesis_*)
- **Frontend:** `client/src/pages/Anamnesis.tsx`
- **PRD:** Seção 4.1 - Diagnóstico & Identidade
- **API Docs:** `/api/anamnesis` endpoints

---

## ✅ Definition of Done

### Funcional
- [ ] Usuário pode inserir 1 site + múltiplas redes sociais
- [ ] Análise mock retorna todas as 8 seções estruturadas
- [ ] Deduplicação por URL normalizada funcionando
- [ ] Interface de resultados completa e navegável
- [ ] Exportação PDF e link compartilhável
- [ ] CRUD completo (criar, listar, reprocessar, excluir)

### Técnico
- [ ] Schema do banco implementado e testado
- [ ] APIs REST com validação Zod
- [ ] Error handling robusto
- [ ] Logs estruturados
- [ ] Performance < 2min para análise mock
- [ ] Segurança RBAC + RLS ativa

### Qualidade
- [ ] Tests unitários > 80% coverage
- [ ] Tests E2E do fluxo principal
- [ ] Code review aprovado
- [ ] Documentation atualizada
- [ ] Compliance LGPD validado

---

*Última atualização: Setembro 2025*