# TODO — Anamnese Digital

## Legenda
- [ ] todo • [~] in_progress • [/] review • [x] done • [!] blocked • [>] deferred

## Backlog

### Foundation & Database
- [ ] T-001 — Implementar Schema de Banco de Dados (owner: Database_Admin)
  - deps: —
  - aceitação: schema valida; migrations sem erro; índices aplicados; RLS policies funcionando
  - effort: 3 SP

- [ ] T-002 — Implementar Validação e Normalização de URLs (owner: Backend_Developer)
  - deps: T-001
  - aceitação: URLs inválidas rejeitadas; normalização funcional; hash determinístico
  - effort: 2 SP

### Core Implementation  
- [ ] T-003 — Implementar Mock Analysis Engine (owner: Backend_Developer)
  - deps: T-001, T-002
  - aceitação: 8 seções estruturadas; processamento ≤ 2min; score calculado
  - effort: 4 SP

- [ ] T-004 — Implementar CRUD Service para Análises (owner: Backend_Developer)
  - deps: T-001, T-002, T-003
  - aceitação: Create/Read/Update/Delete funcionais; deduplicação; soft delete
  - effort: 5 SP

- [ ] T-005 — Implementar Deduplicação por URL Normalizada (owner: Backend_Developer)
  - deps: T-002, T-004
  - aceitação: hash único; constraint DB; retorna análise existente; UI feedback
  - effort: 2 SP

### API Layer
- [ ] T-006 — Implementar REST API Endpoints (owner: Backend_Developer)
  - deps: T-004, T-005
  - aceitação: POST/GET/DELETE endpoints; validation middleware; consistent response
  - effort: 4 SP

- [ ] T-007 — Implementar Error Handling e Status Tracking (owner: Backend_Developer)
  - deps: T-004, T-006
  - aceitação: status transitions; timeout handling; structured errors; retry logic
  - effort: 3 SP

### Testing & Quality
- [ ] T-008 — Implementar Unit Tests (owner: QA_Engineer)
  - deps: T-002, T-003, T-004
  - aceitação: cobertura conforme docs/TODO.md; cenários validação; mock behavior
  - effort: 4 SP

- [ ] T-009 — Implementar Integration Tests (owner: QA_Engineer)
  - deps: T-006, T-007, T-008
  - aceitação: fluxo API→DB; contract validation; auth testing; performance targets
  - effort: 3 SP

### Observability
- [ ] T-010 — Implementar Logging Estruturado (owner: Backend_Developer)
  - deps: T-006, T-007
  - aceitação: JSON format; correlation IDs; context fields; PII masking
  - effort: 2 SP

- [!] T-011 — Implementar Performance Monitoring (owner: DevOps_Specialist)
  - deps: T-006, T-010
  - aceitação: latency tracking; processing monitoring; automated alerts
  - effort: 3 SP
  - **BLOQUEADO:** Ferramenta de APM não definida

## Em Execução
*Nenhuma tarefa em execução (modo dry-run)*

## Em Review  
*Nenhuma tarefa em review (modo dry-run)*

## Concluídas
*Nenhuma tarefa concluída (modo dry-run)*

## Tarefas Bloqueadas
- **T-011:** Performance Monitoring - Ferramenta de APM não definida
  - Owner: DevOps_Specialist
  - Next Step: Definir ferramenta (DataDog, New Relic, Grafana, etc.)

---
**Total de Tarefas:** 11  
**Total de Story Points:** 34  
**Estimativa:** 8-10 dias de desenvolvimento  
**Critical Path:** T-001 → T-002 → T-003 → T-004 → T-006 → T-007 → T-009