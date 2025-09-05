# 📋 Resumo Pré-Execução: Anamnese Digital

## 🆔 Identificação do Plano

- **Título:** Anamnese Digital - Execution Plan
- **Versão:** 1.0
- **Status:** 📅 Pronto para execução por agente
- **Agente Responsável:** Backend_Developer
- **Data de Geração:** 2025-09-05
- **Modo de Execução:** dry-run

## 🎯 Escopo (8-12 bullets)

• **RF-1.1:** Sistema de validação automática para 1 site obrigatório + até 10 URLs de redes sociais
• **RF-1.2:** Pipeline de análise mock que processa URLs e retorna diagnóstico estruturado em ≤ 2 min  
• **RF-1.3:** Persistência no Supabase com deduplicação automática por URL normalizada
• **RF-1.4:** Interface de resultados estruturados em 8 seções (Identidade, Personas, UX, Ecosystem, etc.)
• **RF-1.5:** CRUD completo com histórico, reprocessamento e exclusão de análises
• **Performance:** API latency p95 ≤ 300ms, processamento ≤ 2min, success rate > 95%
• **Deduplicação:** 100% efetiva para URLs normalizadas idênticas usando hash determinístico
• **Stack:** Node.js + Express + TypeScript + Supabase + Drizzle ORM + Zod validation
• **Segurança:** JWT auth, RLS policies, input sanitization, rate limiting configurável
• **Observabilidade:** Logs JSON estruturados, métricas de performance, alertas automáticos
• **Compliance:** LGPD, apenas dados públicos, PII masking, respeito ao robots.txt
• **Escalabilidade:** Preparado para transição de mock para IA real (OpenAI integration)

## ✅ Critérios de Aceitação

1. Database schema implementado com migrations executadas sem erro
2. Sistema de validação de URLs rejeita formatos inválidos com mensagens claras  
3. Normalização de URLs remove www, trailing slash, converte para lowercase
4. Mock analysis engine retorna 8 seções estruturadas em formato JSON válido
5. Deduplicação impede criação de análises para URLs já processadas
6. API REST endpoints funcionais: POST /api/anamnesis, GET /api/anamnesis/:id, GET /api/anamnesis
7. Error handling robusto com status tracking (queued → running → done/error)
8. Unit tests com cobertura conforme definido em docs/TODO.md
9. Integration tests validando fluxo completo API → Database
10. Logging estruturado com campos obrigatórios (contextId, userId, timestamp)
11. Performance targets atingidos: p95 ≤ 300ms API, ≤ 2min processamento
12. Security scan sem vulnerabilidades críticas (OWASP ZAP)

## 🔌 Interfaces & Dados

### API Endpoints
- **POST /api/anamnesis** - Cria nova análise com validação Zod
- **GET /api/anamnesis/:id** - Retorna análise com findings estruturados  
- **GET /api/anamnesis** - Lista análises do usuário com paginação
- **DELETE /api/anamnesis/:id** - Remove análise (soft delete)

### Database Schema
```sql
-- Tabelas principais: anamnesis_analysis, anamnesis_source, anamnesis_finding
-- Indexes: normalized_url, user_id, status para performance
-- Constraints: hash unique, RLS policies por accountId
```

### Response Format
```json
{
  "success": true,
  "data": {
    "id": "uuid",
    "status": "done|running|queued|error", 
    "findings": { /* 8 seções estruturadas */ }
  }
}
```

## 🛠️ Stack & Padrões

- **Runtime:** Node.js + TypeScript (strict mode)
- **Framework:** Express.js com middleware stack
- **Database:** Supabase PostgreSQL + Drizzle ORM
- **Validation:** Zod schemas para todos inputs/outputs
- **Auth:** Supabase Auth + JWT + RBAC
- **Error Handling:** Structured errors com error codes
- **Logging:** JSON format (Winston/Pino) com correlation IDs
- **Testing:** Jest para unit/integration tests
- **Security:** OWASP ASVS controls, input sanitization
- **Performance:** Connection pooling, query optimization, indexing

## 📊 Métricas & SLOs

- **API Latency:** p95 ≤ 300ms para endpoints CRUD
- **Processing Time:** p95 ≤ 2min para análise mock completa  
- **Success Rate:** > 95% para URLs válidas
- **Error Rate:** < 5% de falhas irrecuperáveis
- **Availability:** 99.5% SLO target
- **Deduplication:** 100% effectiveness para URLs normalizadas
- **Test Coverage:** Conforme definido em docs/TODO.md
- **Security:** 0 vulnerabilidades críticas no scan

## ⚠️ Riscos & Mitigações

1. **Mock Realismo** - Mock pode não refletir complexidade real da IA
   - *Mitigação:* Output estruturado compatível com futura integração OpenAI
   
2. **Performance Database** - Queries lentas com volume de análises
   - *Mitigação:* Indexing otimizado, connection pooling, query optimization
   
3. **URL Edge Cases** - Sites com estruturas de URL complexas  
   - *Mitigação:* Test cases extensivos, fallback normalization
   
4. **Rate Limiting Abuse** - Potencial abuse de endpoints de análise
   - *Mitigação:* Rate limiting configurável, monitoring proativo
   
5. **Data Privacy** - Coleta inadvertida de PII de sites analisados
   - *Mitigação:* PII masking automático, apenas dados públicos

## 🔗 Dependências

### Técnicas
- Supabase instance configurada e acessível
- Database permissions para migrations
- Environment variables definidas (.env)
- Node.js + npm dependencies instaladas

### Entre Planos  
- **Nenhuma** - Esta é a feature inicial do sistema
- **Consume:** Brand_Voice_JSON_Plan.md consumirá dados desta análise
- **Afeta:** Onboarding_Marca_Plan.md pode usar insights para pre-fill

### Ordem Sugerida
1. Database schema & migrations
2. URL validation & normalization  
3. Mock analysis engine
4. CRUD operations
5. REST API endpoints
6. Testing & quality assurance

## 🚫 Gaps/Bloqueios

### [⚠️ DOCUMENTAÇÃO PENDENTE]
1. **APM Tool** - Ferramenta de observabilidade não definida
   - *Owner:* DevOps_Specialist
   - *Next Step:* Definir entre DataDog, New Relic, ou alternativa open-source

2. **Test Coverage Target** - Percentual mínimo não especificado
   - *Owner:* QA_Engineer  
   - *Next Step:* Consultar docs/TODO.md e definir target

3. **Rollback Strategy** - Processo específico para rollback de migrations
   - *Owner:* Database_Admin
   - *Next Step:* Documentar procedimento de rollback seguro

### [⚠️ PERGUNTAS ABERTAS]
1. **AI Integration Timeline** - Quando substituir mock por OpenAI real?
   - *Owner:* Tech_Lead
   - *Next Step:* Roadmap definition meeting

## 📋 Plano de Execução

1. **Foundation** (Database_Admin): Schema design → migrations → validation
2. **Core Logic** (Backend_Developer): URL validation → normalization → deduplication  
3. **Mock Engine** (Backend_Developer): Analysis engine → structured output → timing
4. **Service Layer** (Backend_Developer): CRUD operations → error handling → status tracking
5. **API Layer** (Backend_Developer): REST endpoints → middleware → authentication
6. **Quality** (QA_Engineer): Unit tests → integration tests → contract validation
7. **Observability** (Backend_Developer): Structured logging → metrics collection
8. **Monitoring** (DevOps_Specialist): Performance monitoring → alerting setup
9. **Integration** (QA_Engineer): End-to-end validation → performance testing
10. **Documentation** (Backend_Developer): API docs → runbooks → deployment guide

---
*Tempo estimado total: 8-10 dias de desenvolvimento*  
*Próximo passo: Revisar gaps e executar em modo `execute` quando desbloqueados*