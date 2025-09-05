# 📋 PRE-EXECUTION SUMMARY — Brand Voice JSON Plan

**Plano:** Brand Voice JSON - Execution Plan  
**Versão:** 1.0  
**Status:** 📅 Pronto para execução por agente  
**Agente Responsável:** Backend_Developer  
**Data de Geração:** 5 de setembro de 2025  
**Modo de Execução:** dry-run  

---

## 🎯 Escopo em Bullets (Clareza Operacional)

• **Artefato Central:** JSON Schema v1.0 completo para Brand Voice como fonte única da verdade  
• **Generation Engine:** Sistema inteligente de merge entre Anamnese Digital + Onboarding de Marca  
• **Quality System:** Métricas automatizadas (completeness, consistency, specificity, usability)  
• **Versioning Control:** Sistema de versionamento semântico com migration automática  
• **CRUD APIs:** Endpoints REST completos para generation, retrieval, activation e history  
• **Caching Strategy:** Cache in-memory com TTL de 5min para performance < 100ms  
• **Database Schema:** JSONB híbrido com indexed fields para queries otimizadas  
• **Integration Layer:** Templates de prompt e utilities para consumo por módulos de IA  
• **Default Values:** Sistema inteligente de defaults por segment (veterinaria, petshop, etc.)  
• **Compliance System:** Validação automática de compliance e content policies  
• **Performance Targets:** Generation < 2s, API retrieval < 100ms, quality calc < 500ms  
• **Testing Suite:** Unit e integration tests completos com fixtures e performance validation  

---

## ✅ Critérios de Aceitação (Testáveis)

1. **Schema v1.0 Completo:** Zod schema validando 100% dos campos com type safety runtime  
2. **Generation Performance:** Merge de anamnesis + onboarding executado em < 2s  
3. **Quality Metrics:** Sistema de scoring retornando 4 métricas (0.0-1.0) em < 500ms  
4. **API Compliance:** Todos endpoints respondem conforme contratos especificados  
5. **Database Persistence:** Brand Voice armazenado em JSONB com indexes funcionais  
6. **Cache Performance:** Cache hit rate > 90% para Brand Voice retrieval  
7. **Versioning System:** Migration automática entre versions sem data loss  
8. **Default Values:** Defaults apropriados aplicados por business segment  
9. **Integration Ready:** Templates de prompt funcionais para content generation  
10. **Quality Gates:** Apenas Brand Voice com quality score > 0.7 pode ser ativado  
11. **Unit Test Coverage:** Todos services cobertos com scenarios de merge e quality  
12. **Integration Tests:** Fluxo end-to-end generation → storage → retrieval validado  

---

## 🔌 Interfaces & Dados (Visão de 1 Tela)

### APIs REST Core
```typescript
POST /api/brand-voice/generate
  Input: { anamnesisAnalysisId?, onboardingSessionId?, manualOverrides? }
  Output: { id, version, brandVoiceJson, qualityMetrics, status }

GET /api/brand-voice/active
  Output: { brandVoice, metadata: { version, lastUpdated, qualityScore } }

PUT /api/brand-voice/:id/activate
  Output: { id, version, activated, previousVersion? }
```

### Database Schema
```sql
brand_voice (
  id UUID PRIMARY KEY,
  user_id UUID REFERENCES users(id),
  brand_voice_json JSONB NOT NULL,  -- Complete schema
  version VARCHAR(10),              -- Semantic version
  brand_name VARCHAR(100),          -- Indexed field
  segment VARCHAR(20),              -- Indexed field
  completeness_score DECIMAL(3,2),  -- Quality metric
  consistency_score DECIMAL(3,2),   -- Quality metric
  status VARCHAR(20),               -- draft|active|deprecated
  is_active BOOLEAN DEFAULT false   -- One active per user
)
```

### Brand Voice JSON Core Structure
```typescript
{
  version: "1.0",
  brand: { name, segment, mission, values, targetAudience },
  visual: { logoUrl, palette, typography, imagery },
  voice: { tone, persona, lexicon, style },
  compliance: { regulatory, content_policies, legal },
  channels: { social_media, content_types },
  metadata: { created_at, quality_metrics, source, version_history }
}
```

---

## 🛠️ Stack & Padrões

### Tecnologias Obrigatórias
• **Backend:** Node.js + Express + TypeScript (strict mode)  
• **Database:** Supabase PostgreSQL + Drizzle ORM  
• **Validation:** Zod para runtime schema validation  
• **Cache:** In-memory Map com TTL management  
• **Testing:** Jest + Supertest para unit/integration  

### Padrões de Arquitetura
• **Schema-First:** JSON Schema como source of truth  
• **Immutable Versions:** Cada update cria nova versão  
• **Quality Gates:** Automatic validation antes de activation  
• **Error Handling:** Logs estruturados JSON com context  
• **Type Safety:** TypeScript strict + Zod runtime validation  

### Performance Limits
• **Generation Time:** < 2s para merge de dados  
• **API Response:** < 100ms para retrieval ativo  
• **Quality Calculation:** < 500ms para metrics computation  
• **Cache Hit Rate:** > 90% para Brand Voice retrieval  

---

## 📊 Métricas & SLOs

### Performance Targets
• **Generation Latency:** p95 < 2s (merge anamnesis + onboarding)  
• **API Response Time:** p95 < 100ms (active Brand Voice retrieval)  
• **Quality Calculation:** p95 < 500ms (4 metrics computation)  
• **Cache Performance:** Hit rate > 90%, TTL = 5min  

### Quality Targets
• **Schema Compliance:** 100% dos Brand Voice válidos com Zod  
• **Quality Score:** Minimum 0.7 para activation  
• **Completeness:** > 80% campos obrigatórios preenchidos  
• **Consistency:** > 90% internal consistency validation  

### Operational Targets
• **Migration Success:** 100% sem data loss  
• **API Availability:** 99.5% uptime  
• **Error Rate:** < 1% para endpoints críticos  

---

## ⚠️ Riscos & Mitigações (Top 5)

### 1. **Schema Evolution Complexity** (Alto Impacto / Alta Probabilidade)
- **Risco:** Future changes breaking existing Brand Voice  
- **Mitigação:** Robust migration system, backward compatibility testing  
- **Contingência:** Manual migration tools, rollback procedures  

### 2. **Quality Metrics Accuracy** (Alto Impacto / Média Probabilidade)
- **Risco:** Algorithm não reflecting real usefulness  
- **Mitigação:** User feedback integration, A/B testing quality algorithms  
- **Contingência:** Manual quality review process  

### 3. **Performance at Scale** (Médio Impacto / Média Probabilidade)
- **Risco:** Generation time degrading com volume  
- **Mitigação:** Performance monitoring, algorithm optimization  
- **Contingência:** Background processing, queue system  

### 4. **Data Source Quality** (Médio Impacto / Alta Probabilidade)
- **Risco:** Poor anamnesis/onboarding data affecting Brand Voice quality  
- **Mitigação:** Input validation, fallback to defaults, quality thresholds  
- **Contingência:** Manual override capabilities, quality warnings  

### 5. **Cache Invalidation Issues** (Baixo Impacto / Média Probabilidade)
- **Risco:** Stale data served from cache after updates  
- **Mitigação:** Event-driven invalidation, automatic TTL  
- **Contingência:** Manual cache flush, bypass cache option  

---

## 🔗 Dependências (Técnicas e Entre Planos)

### Planos Requeridos
• **Anamnese_Digital_Plan.md:** AnamnesisAnalysis.findings → merge input  
• **Onboarding_Marca_Plan.md:** OnboardingResult → user configuration  

### Planos Consumidores
• **Manual_Marca_Digital_Plan.md:** Brand Voice → visual rendering  
• **Biblioteca_Campanhas_Plan.md:** Brand Voice → template customization  
• **Geracao_Conteudo_IA_Plan.md:** Brand Voice → prompt building  

### Dependências Técnicas
• **Database Schema:** Migrations 001-002 (anamnesis + onboarding) devem existir  
• **Auth System:** JWT middleware para user isolation  
• **Shared Types:** TypeScript interfaces para anamnesis/onboarding  

### Ordem Sugerida de Execução
1. Schema Foundation (JSON + Database + Migration)  
2. Core Generation (Merge Algorithm + Quality Metrics)  
3. API Layer (CRUD + Validation + Cache)  
4. Quality & Versioning (Version Management + Default Values)  
5. Integration & Testing (API Tests + Performance Validation)  

---

## 🚧 Gaps/Bloqueios Identificados

### [⚠️ DOCUMENTAÇÃO PENDENTE]
• **Backup Strategy:** Disaster recovery para Brand Voice data *(Owner: DevOps_Specialist)*  
• **Manual Validation:** Processo de review quando quality score baixo *(Owner: Product_Owner)*  
• **AI Model Integration:** Como integrar com future models além OpenAI *(Owner: Tech_Lead)*  

### [⚠️ PERGUNTAS ABERTAS]
• **Schema Versioning:** Quantas versions antigas manter ativas? *(Next Step: Define retention policy)*  
• **Multi-tenant Performance:** Como otimizar para large number of users? *(Next Step: Load testing)*  
• **Quality Threshold:** 0.7 é adequado ou deve ser ajustável por user? *(Next Step: User research)*  

### Dependências Externas
• **OpenAI API Keys:** Configuração necessária para quality enhancement *(Status: Assumed available)*  
• **Supabase Setup:** Database connection e RLS policies *(Status: Assumed configured)*  

---

## 🗺️ Plano de Execução (Sequência Compacta)

### Fase 1: Foundation (3-4 tarefas)
1. **T-001:** Implementar JSON Schema v1.0 Completo (Zod + TypeScript)  
2. **T-002:** Implementar Database Schema e Migration (PostgreSQL + Drizzle)  
3. **T-003:** Implementar Brand Voice Generator Core (Merge Algorithm)  

### Fase 2: Core Logic (3-4 tarefas)
4. **T-004:** Implementar Quality Metrics Calculator (4 metrics + scoring)  
5. **T-005:** Implementar CRUD Service para Brand Voice (Database operations)  
6. **T-006:** Implementar Default Values System (Segment-specific defaults)  

### Fase 3: API & Performance (2-3 tarefas)
7. **T-007:** Implementar REST API Endpoints (3 main endpoints + validation)  
8. **T-008:** Implementar Cache Strategy (In-memory + TTL + invalidation)  
9. **T-009:** Implementar Version Management System (Migration + rollback)  

### Fase 4: Integration & Quality (3-4 tarefas)
10. **T-010:** Implementar Integration com Content Generation (Templates + utils)  
11. **T-011:** Implementar Unit Tests (Services + algorithms + edge cases)  
12. **T-012:** Implementar Integration Tests (End-to-end + performance validation)  

**Total Estimado:** 12 tarefas, ~45 story points, 3-4 dias de trabalho focado  

---

## 📁 Artefatos Esperados

### Código Principal
• `shared/schemas/brand-voice.ts` - Zod schema v1.0  
• `server/services/brand-voice-generator.service.ts` - Core generation  
• `server/services/brand-voice-quality.service.ts` - Quality metrics  
• `server/services/brand-voice.service.ts` - CRUD operations  
• `server/routes/brand-voice.ts` - REST endpoints  
• `server/migrations/003_brand_voice.sql` - Database schema  

### Configuration & Utilities
• `server/config/brand-voice-defaults.json` - Default values  
• `server/templates/prompt-templates.ts` - IA integration  
• `server/utils/brand-voice-cache.ts` - Caching strategy  
• `server/utils/brand-voice-merger.ts` - Merge algorithms  

### Testing
• `server/tests/unit/brand-voice-*.test.ts` - Unit tests  
• `server/tests/integration/brand-voice.api.test.ts` - Integration tests  
• `server/fixtures/brand-voice-samples.json` - Test fixtures  

---

## 🎯 Critérios de Sucesso Final

### Funcional
✅ **Generation:** Anamnesis + Onboarding → Brand Voice JSON válido  
✅ **Quality:** 4 métricas calculadas automaticamente com accuracy  
✅ **Storage:** Brand Voice persistido com versioning e retrieval  
✅ **Performance:** Targets de latência atingidos consistentemente  
✅ **Integration:** Ready para consumo por módulos de content generation  

### Técnico
✅ **Type Safety:** 100% TypeScript strict + Zod runtime validation  
✅ **Test Coverage:** Critical paths com unit e integration tests  
✅ **Documentation:** API contracts e schemas documentados  
✅ **Observability:** Logs estruturados e métricas de performance  
✅ **Security:** User isolation, input validation, compliance checks  

---

*Resumo gerado automaticamente pelo Plan Executor v1.0*
*Baseado em: plans/Brand_Voice_JSON_Plan.md | docs/features/F03_BRAND_VOICE_JSON.md*