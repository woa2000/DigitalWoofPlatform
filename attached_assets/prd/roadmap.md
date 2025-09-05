# Roadmap — Plataforma de Marketing Operada por IA (vertical inicial: Pet)

**Versão:** 1.0  
**Status:** Proposta para validação  
**Última atualização:** 2025-09-05  
**Horizonte:** 6 meses (Sprints de 2 semanas)  
**Dependência:** PRD 1.0 (atualizado com Anamnese via Agente de IA)

---

## 0) Premissas & Diretrizes de Execução
- **Sprints:** 2 semanas. **Marcos** ao fim de cada fase com *gate* de qualidade.  
- **Ambiente/Stack:** Frontend (Next.js + Tailwind + shadcn/ui), Backend (.NET 8/9 ou NestJS), Supabase (Postgres), Redis, filas (SQS/Azure Queue), LLM provider.  
- **Swimlanes:** Produto/UX, Frontend, Backend, Data/ML, Integrações, DevOps/Sec, QA.  
- **Critérios de saída (gerais):** DoR/DoD aprovados, testes (unit/e2e) passando, documentação atualizada, telemetria e alertas configurados.

---

## 1) Fases & Marcos
**Fase 0 — Fundações (2 semanas)**  
**Objetivo:** preparar ambientes, CI/CD, observabilidade, esquema base no Supabase e autenticação.  
**Marcos:** M0 Ambientes prontos; M0.1 Esquema inicial + migrações; M0.2 CI/CD com deploy automatizado.

**Fase 1 — Cérebro da Marca (4 semanas, 2 sprints)**  
**Objetivo:** entregar **Anamnese Digital (Agente de IA)** + **Onboarding de Marca** + **Brand Voice JSON v1** + **Manual de Marca (viewer)**.  
**Marcos:** M1 Agente mock end‑to‑end; M2 Brand Voice JSON v1; M3 Manual de Marca compartilhável; **Gate de Fase 1**.

**Fase 2 — Fábrica de Conteúdo (4 semanas, 2 sprints)**  
**Objetivo:** **Calendário Editorial**, **Geração de Conteúdo v1 (3 variações)**, **Biblioteca de Campanhas** e **Fluxo de Aprovação**.  
**Marcos:** M4 Calendário funcional; M5 Geração v1 com compliance; M6 Aprovação/Kanban; **Gate de Fase 2**.

**Fase 3 — Piloto Automático (4 semanas, 2 sprints)**  
**Objetivo:** **Publicação/Agendamento (Meta + GBP)** e **Jornadas de Recall**.  
**Marcos:** M7 Publicação Meta/GBP; M8 Jornadas com upload CSV e métricas; **Gate de Fase 3**.

**Fase 4 — Copiloto Inteligente (4 semanas, 2 sprints)**  
**Objetivo:** **Dashboard v1**, **Ads Guardrails v1** e **Alertas Proativos**.  
**Marcos:** M9 Dashboard essencial; M10 Guardrails (regra de CPA>alvo/48h); M11 Alertas; **Gate de Fase 4** / **MVP Ready**.

**Lançamento:** Beta fechado (após Fase 2) e **MVP GA** (após Fase 4), conforme DoD do PRD.

---

## 2) Linha do Tempo Sugerida (Set/2025 → Fev/2026)
- **Sprint 0 (Set/2025):** Fundações (M0–M0.2).
- **Sprints 1–2 (Set–Out/2025):** Fase 1 (M1–M3, Gate F1). **Beta técnico** com 3 contas.
- **Sprints 3–4 (Nov/2025):** Fase 2 (M4–M6, Gate F2). **Beta fechado** (5–10 contas).  
- **Sprints 5–6 (Dez/2025–Jan/2026):** Fase 3 (M7–M8, Gate F3).  
- **Sprints 7–8 (Fev/2026):** Fase 4 (M9–M11, Gate F4). **MVP GA**.

> As datas podem ser ajustadas conforme capacidade e integração com provedores.

---

## 3) Sprints por Swimlane (Resumo de Entregas)
### Sprint 0 — Fundações
- **Produto/UX:** mapa de navegação inicial; fluxos F‑1 a F‑4 (alto nível).  
- **Frontend:** layout base (shell, auth, toasts), tema, roteamento público/privado.  
- **Backend:** esqueleto de serviços; endpoints de saúde; RBAC mínimo.  
- **Dados:** Supabase: `Account`, `User`, `Role` iniciais; *migrations*; seeds.  
- **DevOps/Sec:** CI/CD, secrets, observabilidade (logs, métricas), Sentry/OTel.  
- **QA:** estratégia de testes; smoke e2e iniciais.

### Sprints 1–2 — Fase 1 (Cérebro da Marca)
- **Produto/UX:** formulários de entrada para URLs; cards de resultados; viewer do Manual.  
- **Frontend:** tela de **Anamnese Digital** (entradas/validação, rede sociais dinâmicas, loading/erros); tela de resultados; export PDF/Link; viewer do **Manual de Marca**.  
- **Backend:** serviço **Anamnesis Agent** (crawler + parser + sumarização mock), deduplicação por URL normalizada/hash; *jobs* em fila; APIs para resultados.  
- **Data/ML:** contrato de saída da anamnese; prompts e estrutura canônica; **Brand Voice JSON v1**.  
- **Integrações:** política de *robots.txt*, *user‑agent*, *rate‑limit*.  
- **QA:** testes e2e: informar URLs → relatório estruturado (≤2 min no mock); dedup; export.

### Sprints 3–4 — Fase 2 (Fábrica de Conteúdo)
- **Produto/UX:** calendário drag‑and‑drop, estados e filtros; fluxos de aprovação.  
- **Frontend:** calendário; cartões de pauta; geração de 3 variações; editor com histórico.  
- **Backend:** serviços **Content Planner** e **Generation**; versionamento de prompts; logs de compliance.  
- **Data/ML:** *prompt library* v1; checagem de claims sensíveis; telemetria de qualidade.  
- **Integrações:** feriados/sazonalidade (fonte interna, arquivo ou API);  
- **QA:** métrica de **% aprovação sem edição**; testes de regressão de voz.

### Sprints 5–6 — Fase 3 (Piloto Automático)
- **Produto/UX:** publicação/agendamento e jornada de recall.  
- **Frontend:** conexão OAuth; pré‑visualização por canal; tela de **Jornadas** com upload CSV, templates e métricas.  
- **Backend:** **Scheduler/Publisher**; webhooks; **Journeys** (dedupe/opt‑out); relatórios.  
- **Integrações:** Meta (IG/FB), **Google Business Profile**, BSP de WhatsApp (transacional).  
- **QA:** testes de publicação em *sandbox*; validações de consentimento; auditoria de logs.

### Sprints 7–8 — Fase 4 (Copiloto)
- **Produto/UX:** métricas essenciais e alertas.  
- **Frontend:** **Dashboard v1**; **Centro de Alertas**.  
- **Backend:** **Metrics/Events** (ETL leve), **Ads Guardrails v1** (regra CPA>alvo/48h), **Alerts**.  
- **Data/ML:** *playbooks* por métrica; recomendações contextuais.  
- **QA:** testes de regras de pausa; verificação de alertas; desempenho.

---

## 4) Gates & Critérios de Saída por Fase
**Fase 1**  
- Anamnese: informar 1 site + 0..N redes → relatório completo em ≤2 min (mock).  
- Deduplicação por URL; Supabase persistindo análises; **Brand Voice JSON v1**; Manual de Marca com link público/token; export PDF.  

**Fase 2**  
- Calendário gera 2 semanas de pauta em ≤5 min; geração de 3 variações por item; **≥50%** aprovação sem edição em contas com Brand Voice completo; fluxo de aprovação com histórico.  

**Fase 3**  
- Publicação em Meta/GBP com logs e reintentos; **Jornadas** ativas (upload CSV, opt‑out, métricas básicas).  

**Fase 4**  
- **Dashboard v1** (engajamento, tráfego, conversão); **Alertas** (sem posts em 48h; token expirando); **Ads Guardrails v1** (pausa automática com janela de 48h), reversão manual.

---

## 5) Dependências & Riscos por Fase
- **F0:** risco de atraso na infra → *templates IaC*, checklists, ambientes *preview*.  
- **F1:** qualidade da coleta (sites com *anti‑bot*) → respeito a **robots.txt**, fallback para captura manual; *throttling*.  
- **F2:** conteúdo genérico → feedback estruturado treina prompts; *A/B* de instruções.  
- **F3:** integrações (quotas/rate limit) → *feature flags*, *canary* por canal.  
- **F4:** dados superficiais → foco em 2–3 métricas acionáveis + *playbooks*.

---

## 6) RACI (marcos principais)
| Marco | R (Responsible) | A (Accountable) | C (Consulted) | I (Informed) |
|---|---|---|---|---|
| M0 Fundações | Eng. Backend/DevOps | CTO | PO, Sec | Equipe |
| M1 Agente (mock) | Eng. Backend/Data | PO | UX | Equipe |
| M2 Brand Voice v1 | Data/ML | PO | UX | Equipe |
| M3 Manual Marca | Frontend | PO | UX | Equipe |
| M4 Calendário | Frontend/Backend | PO | Data/ML | Beta |
| M5 Geração v1 | Data/ML | PO | QA | Beta |
| M7 Publicação | Backend/Integrações | CTO | Sec | Beta |
| M8 Jornadas | Backend | PO | Jurídico (LGPD) | Beta |
| M9 Dashboard | Backend/Data | PO | UX | Beta |
| M10 Guardrails | Backend/Integrações | CTO | Mídia | Beta |
| GA MVP | PO | CTO | Comercial/Suporte | Stakeholders |

---

## 7) Capacidade & Alocação (estimativa)
- **Produto/UX:** 0.5–1 FTE ao longo do ciclo; picos em F1/F2.  
- **Frontend:** 1 FTE (S0–S8).  
- **Backend:** 1–1.5 FTE (S0–S8).  
- **Data/ML:** 0.5 FTE (F1/F2/F4).  
- **Integrações:** 0.5 FTE (F3/F4).  
- **QA:** 0.5 FTE (contínuo, picos nos Gates).  
- **DevOps/Sec:** 0.25–0.5 FTE (S0 e marcos de integração).

---

## 8) Métricas de Saúde do Projeto
- *Lead time* por épico, *burndown* por sprint, taxa de *carryover*, taxa de defeitos escapados, flakiness de testes, erro p95 das APIs críticas, custo de LLM/tokens por peça.

---

## 9) Plano de Beta & Lançamento
- **Beta Técnico (fim F1):** 3 contas; foco em estabilidade da Anamnese e Brand Voice.  
- **Beta Fechado (fim F2):** 5–10 contas; metas: >50% aprovação sem edição; TT‑Publish <5 min.  
- **Go/No‑Go F3:** publicar em ambiente real com 2 contas; revisar LGPD/DPA.  
- **GA MVP (fim F4):** suportar 10–20 contas; SLAs definidos; base de conhecimento.

---

## 10) Pós‑MVP (Backlog Prioritário)
- SEO Briefs/Blog; Social Care (comentários/inbox); integrações com agenda/prontuário; recomendador de budget; editor de vídeo IA; I18N EN/ES; marketplace de templates; IA de variação de criativos.

---

**Fim do documento (Roadmap 1.0).**

