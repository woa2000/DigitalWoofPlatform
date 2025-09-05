# PRD — Plataforma de Marketing Operada por IA (vertical inicial: Pet)

**Versão:** 1.0  
**Status:** Rascunho para validação  
**Última atualização:** 2025-09-05  
**Responsáveis:** Product Owner (você), CTO (RA System), UX Lead, Eng. Backend, Eng. Frontend, Data/ML, QA, Compliance (LGPD)

---

## 1) Visão & Contexto
**Visão:** Tornar-se o “gestor de marketing digital” assistido por IA para negócios do setor pet, automatizando a maior parte do planejamento, criação e publicação de conteúdo com qualidade e coerência de marca, e entregando resultados mensuráveis com supervisão humana.

**Problema central (Job‑to‑Be‑Done):** donos(as) de clínicas, pet shops e grooming precisam atrair e fidelizar clientes, mas não têm tempo/equipe/conhecimento para manter um marketing consistente e especializado no setor (com sazonalidades e linguagem próprias).

**Proposta de valor:** uma plataforma que diagnostica, planeja, cria, publica e mede — com IA no loop e controle humano — reduzindo esforço operacional ~80% e aumentando consistência da marca.

**Core loop de valor:** Diagnosticar → Planejar → Criar → Publicar → Medir.

**Escopo deste PRD:** requisitos funcionais e não‑funcionais do produto. O **roadmap** (releases/timelines) será entregue como documento separado.

---

## 2) Objetivos, Métricas & Sinais de Sucesso
- **Time‑to‑Value:** novo cliente gera diagnóstico e manual de marca em < 60 min.  
- **NPS do Diagnóstico/Marca:** > 70.  
- **Taxa de aprovação sem edição do conteúdo:** > 50%.  
- **Produtividade em conteúdo:** ≥ 3× vs. processo manual.  
- **Time‑to‑Publish:** < 5 min entre aprovação e agendamento.  
- **Adoção de recall (Jornadas):** % de contas com pelo menos 1 jornada ativa.  
- **Engajamento com dashboard:** % de usuários semanais.  
- **CPA controlado com Ads Guardrails:** −15% em contas que ativarem a regra.

**KPIs complementares:** taxa de posts agendados com >7 dias de antecedência; % de briefings completos; % de peças reprovadas por desalinhamento de voz; tempo médio de ciclo (brief → publicado).

---

## 3) Personas & Usuários‑Alvo
1. **Proprietário(a) de Clínica/Veterinário(a)** – foco em recall de vacinas/retorno, precisa de marketing “no piloto automático”.  
2. **Gerente de Pet Shop/Banho & Tosa** – busca calendário e peças prontas que convertam visita em ticket.  
3. **Social Media interno(a)** – quer ferramenta que elimine bloqueio criativo e acelere produção.  
4. **Agência/Parceiro B2B** – usa a plataforma para escalar operação multi‑contas, com governança.  

**Ambiente de uso:** desktop (admin), mobile responsivo (aprovação/alertas).

---

## 4) Escopo Funcional (MVP por “fluxos de valor”)
> Observação: as entregas serão orquestradas em releases; aqui focamos **requisitos**. O detalhamento de sprints e datas estará no Roadmap.

### 4.1 Diagnóstico & Identidade (Cérebro da Marca)
**F‑1 Anamnese Digital (via Agente de IA)**  
*Descrição:* um **agente de IA** analisa **o site e as redes sociais** informados para gerar um **diagnóstico estratégico**. A coleta é de **dados públicos** e cobre identidade de marca, personas, experiência do usuário e recomendações de melhoria. Os resultados alimentam o **Brand Voice JSON** e o plano de ação.

**Escopo implementado (MVP atual)**

**✅ Entrada de Dados**  
- **URL do site (obrigatória)** com validação de formato.  
- **Múltiplas redes sociais**: campos dinâmicos para adicionar/remover URLs (Instagram, Facebook/Páginas, TikTok, YouTube, Google Business Profile, etc.).  
- **Validação** automática de formato e normalização de URL.

**✅ Processamento da Análise**  
- **Verificação de duplicatas** por URL normalizada (evita reprocesso redundante).  
- **Simulação de IA (mock)**: placeholder para integração com modelo real; retorna estrutura de saída compatível.  
- **Loading states** e **tratamento de erros** com mensagens claras.  
- **Agente de IA** com etapas: *fetch público → parsing → extração de sinais → sumarização → recomendações*.

**✅ Armazenamento**  
- **Supabase (Postgres)**: tabelas para análise, fontes (URLs), e artefatos derivados.  
- **Associação por usuário/conta** (multitenant).  
- **Timestamps** (criação/atualização) e status de processamento (queued, running, done, error).  
- **Deduplicação** por hash da URL normalizada.

**✅ Visualização dos Resultados**  
- **Interface completa** com **cards** por seção (Identidade/Propósito; Personas; Auditoria de Percepção & Experiência; Ecossistema/Referências; Plano de Tratamento; Roadmap Terapêutico; Nova Anatomia da Home; Perguntas de Aprofundamento).  
- **Navegação** entre formulário e resultados; exportação (PDF/Link).  
- **Qualidade da coleta**: indicador de completude e confiabilidade dos sinais.

**✅ Gestão de Análises**  
- **Histórico** por usuário (lista de análises anteriores).  
- **Reprocessamento** (refazer análise existente).  
- **Exclusão** de análises.  
- **Carregamento automático** se a URL já foi analisada (evita retrabalho).

**Modelo de dados (Anamnese)**  
- `AnamnesisAnalysis(id, accountId, userId, primaryUrl, status, scoreCompleteness, createdAt, updatedAt)`  
- `AnamnesisSource(id, analysisId, type=site|social, url, normalizedUrl, provider, lastFetchedAt, hash)`  
- `AnamnesisFinding(analysisId, key, section, payload JSONB)` — armazena blocos estruturados (identidade, personas, UX, etc.).  
- Artefatos derivados: `BrandVoiceDraft(analysisId, json)`, `ActionPlan(analysisId, items[])`, `HomeAnatomy(analysisId, layout JSON)`

**Critérios de aceite**  
- Usuário informa **1 site** e ≥ **0 redes** e recebe **relatório estruturado** com todas as seções em ≤ **2 min** na análise mock.  
- Deduplicação ativa para mesma **URL normalizada**.  
- Resultados persistidos no **Supabase** e vinculados ao usuário.  
- Export (PDF/Link) disponível.  
- Botões: **Reprocessar**, **Excluir**, **Ver histórico**.

**Compliance & Ética**  
- Respeito a **robots.txt** e **ToS** dos sites/redes (apenas dados públicos).  
- **Rate‑limit** e *throttling* para evitar sobrecarga.  
- Opt‑out por domínio se solicitado.  
- Remoção de PII sensível inadvertidamente coletada.  

**F‑2 Onboarding de Marca**  
*Descrição:* upload de logo; detecção/extração de paleta; definição de missão/valores/voz; termos preferidos e proibidos; CTAs padrão.  
*Requisitos:* validação de arquivos (SVG/PNG/JPG); seletor de paleta; editor de tom de voz (sliders/descritores); revisão final antes de gerar **Brand Voice JSON**.  
*Critérios de aceite:* gerar Brand Voice JSON válido (schema abaixo) em ≤ 5 min.

**F‑3 Brand Voice JSON (artefato central)**  
*Descrição:* estrutura canônica usada por todos os módulos de IA.  
*Schema (mínimo):*
```json
{
  "brand": {"name": "string", "segment": "pet|...", "mission": "string", "values": ["string"]},
  "visual": {"logoUrl": "string", "palette": ["#hex"], "fontHints": ["string"]},
  "voice": {
    "tone": {"confiança": 0.7, "acolhimento": 0.9, "humor": 0.2},
    "persona": "ex.: especialista acolhedor(a) e didático(a)",
    "lexicon": {"prefer": ["tutor", "pet"], "avoid": ["dono"], "banned": ["promessas médicas"]},
    "style": {"long": "parágrafos curtos", "cta": ["Agende agora", "Fale no WhatsApp"], "formatting": ["listas", "emoji moderado"]}
  },
  "compliance": {"claimsPolicy": "string", "disclaimer": "string"}
}
```

**F‑4 Manual de Marca Digital (viewer)**  
*Descrição:* página compartilhável com logo, paleta, exemplos de copy (gerados pela IA usando o Brand Voice JSON) e guias rápidas de uso da marca.  
*Requisitos:* URL pública com token; controles de privacidade; exportação PDF.

### 4.2 Planejamento & Criação (Fábrica de Conteúdo)
**F‑5 Calendário Editorial assistido por IA**  
*Descrição:* agenda semanal com temas/formatos/objetivos; drag‑and‑drop; sazonalidades pet; feriados locais.  
*Requisitos:* gerar rascunhos com 3 variações por item; tags de objetivo (educar, vender, engajar); hints de criativos/imagens; limites de frequência por canal.  
*Critérios de aceite:* criar 2 semanas de pauta em ≤ 5 min a partir do Brand Voice JSON.

**F‑6 Geração de Conteúdo (copies + criativos sugeridos)**  
*Descrição:* IA gera 3 variações por item, com títulos, legendas, hashtags sugeridas e instruções para criativo estático/vídeo.  
*Requisitos:* “respeitar voz da marca”; botões **Aprovar/Regenerar/Editar**; histórico de versões; checagem automática de compliance (ex.: claims sensíveis de saúde animal).  
*Critérios de aceite:* ≥ 50% das peças aprovadas sem edição em contas com Brand Voice JSON completo.

**F‑7 Biblioteca de Campanhas (templates)**  
*Descrição:* kits prontos (p.ex.: **Vacinação** e **Banho & Tosa**) com sequência recomendada de posts/stories/e‑mails.  
*Requisitos:* clonar/adaptar; metas por campanha; checklist.

**F‑8 Fluxo de Aprovação**  
*Descrição:* kanban simples (Rascunho → Em revisão → Aprovado → Agendado).  
*Requisitos:* comentários; menções; registro de quem aprovou/quando; permissões.

### 4.3 Publicação & Jornadas (Piloto Automático)
**F‑9 Publicação/Agendamento (Meta + Google Business Profile)**  
*Descrição:* conexão OAuth; agendamento; reintentos em caso de erro; pré‑visualização por canal.  
*Requisitos:* fuso horário por conta; calendário de saídas; logs por post; limites de API e rate limit.

**F‑10 Jornadas Simples (recall)**  
*Descrição:* upload de CSV (nome, contato, serviço/data); criação de mensagem‑modelo (e‑mail/WhatsApp via parceiro) para **recall de vacina** ou **retorno de banho/tosa**.  
*Requisitos:* validação de consentimento; modelos editáveis; janela de envio; trilhas (1ª tentativa → lembrete); deduplicação; relatório (taxa de entrega, resposta, conversão).  
*Critérios de aceite:* conta com jornada ativa tem ≥ 1 disparo/semana e estatísticas visíveis.

### 4.4 Otimização & Alertas (Copiloto)
**F‑11 Dashboard unificado**  
*Descrição:* KPIs de engajamento (curtidas, comentários), tráfego (cliques), conversão (leads/jornadas) em um lugar; filtros por período/canal/campanha.  
*Requisitos:* eventos padronizados; metas por KPI; comparação vs. período anterior; export CSV.

**F‑12 Ads Guardrails (MVP)**  
*Descrição:* criação simplificada de campanha no Meta Ads + **regra de segurança** para pausar criativos com **CPA acima do alvo por >48h** (liga/desliga por conta).  
*Requisitos:* alvo de CPA por campanha; janela de observação; log de ações; reversão manual; permissão granular.

**F‑13 Alertas proativos**  
*Descrição:* aviso via e‑mail/UI para: “sem posts agendados nos próximos 2 dias”; “criativo X pausado por baixa performance”; “token de integração expirando”.  
*Requisitos:* centro de alertas; silenciar/assinar; SLA de entrega.

---

## 5) Requisitos Não‑Funcionais (NFRs)
- **Disponibilidade:** 99,5% mensal (SaaS).  
- **Desempenho:** geração de pauta de 2 semanas ≤ 60s com latência p95 ≤ 2s por operação de UI; publicação em lote de 20 posts ≤ 90s.  
- **Escalabilidade:** multitenant; isolamento lógico por conta.  
- **Segurança:** OAuth2; criptografia em repouso (AES‑256) e em trânsito (TLS 1.2+); rotação de segredos; RBAC.  
- **Privacidade/LGPD:** base legal (consentimento/legítimo interesse); minimização de dados; retenção configurável; DSR (acesso/eliminação); auditoria de uso de dados; DPA com parceiros (ex.: provedores de WhatsApp).  
- **Confiabilidade:** retentativas com backoff; DLQ para filas; idempotência em webhooks/publicações.  
- **Observabilidade:** logs estruturados; métricas; traces; auditoria de aprovação/publicação.  
- **Acessibilidade:** WCAG 2.1 AA.  
- **I18N/L10N:** pt‑BR (MVP); EN/ES em backlog.  
- **Coleta responsável (crawler):** respeito a **robots.txt**, *user‑agent* identificável, **rate‑limit** configurável, cache e TTL por página.  
- **Idempotência & deduplicação:** chave por URL normalizada/hash de conteúdo.  
- **Custos de IA:** *budget caps* e *circuit breaker* por conta; logs de tokens/latência.

---

## 6) Arquitetura de Referência
- **Front‑end:** Next.js + Tailwind + shadcn/ui; SSR/ISR onde fizer sentido; componente de calendário drag‑and‑drop; editor rich‑text com restrições de estilo; upload com validação.  
- **Back‑end:** .NET 8/9 (C#) ou Node/NestJS; serviços: *Brand Service*, *Content Planner*, *Generation Service* (LLMs), *Anamnesis Agent* (crawler/analisador com fila), *Scheduler/Publisher*, *Journeys*, *Ads Guardrails*, *Metrics/Events*, *Alerts*; comunicação via fila (SQS/Azure Queue).
- **Dados:** **Supabase (Postgres, multitenant)**; blob storage (assets); cache Redis; catálogo de fontes (URLs) com deduplicação/hash; índices para histórico por usuário.
- **IA:** provedor LLM (com instruções/guardrails), biblioteca de prompts versionados; camada de validação (toxicity/claims) e *prompt leakage* guard; humana‑no‑loop.  
- **Integrações:** Meta Graph API, Google Business Profile API, provedor oficial de WhatsApp (ex.: BSP) para disparos transacionais (via webhooks).  
- **Analytics:** coletor de eventos (ETL leve) → data mart (Postgres) → painéis.

**Modelo de Dados (alto nível): `Account`, `BrandKit`, `BrandVoice`, `User`, `Role`, `AnamnesisAnalysis`, `AnamnesisSource`, `AnamnesisFinding`, `CalendarItem`, `ContentPiece`, `Approval`, `ChannelAccount`, `Publication`, `Journey`, `AudienceContact`, `Campaign`, `MetricEvent`, `Alert`, `Rule`.

---

## 7) Regras de Negócio & Políticas
- **Aprovação obrigatória** antes de publicar (padrão), com bypass opcional por perfil.  
- **Diretrizes de linguagem**: sem promessas de resultado clínico; usar *tutor* em vez de *dono*; CTAs aprovados no Brand Voice JSON.  
- **Limites por canal:** horários recomendados; frequência máxima/dia por canal; evitar duplicação de copy.  
- **Consentimento de mensagens:** somente contatos com consentimento explícito; opt‑out simples; registro de consentimento.

---

## 8) Aceite do MVP (Definição de Pronto)
- Fluxos **F‑1 → F‑8** funcionando ponta‑a‑ponta para 1 conta real (beta).  
- **Brand Voice JSON** gerado e consumido pelos módulos de geração.  
- Publicação e **1 jornada** ativa por conta com métricas básicas.  
- Painel com KPIs essenciais; alertas “sem posts agendados” e “token expirando”.  
- Logs/auditoria; RBAC; política LGPD publicada.

---

## 9) Métricas de Produto (MVP)
- **TTValue Diagnóstico/Marca < 60 min**; **NPS > 70**.  
- **≥ 50%** aprovação sem edição; **≥ 3×** produtividade.  
- **Time‑to‑Publish < 5 min**; **% de contas com jornada ativa**; **% usuários semanais no dashboard**; **−15% CPA** com Ads Guardrails.

---

## 10) Riscos, Premissas & Mitigações
- **Qualidade da Anamnese (GIGO):** tornar o fluxo conversacional, com exemplos e refinamento por IA.  
- **Conteúdo genérico/robótico:** obsessão no Brand Voice JSON; feedback estruturado treina prompts.  
- **Integrações complexas/instáveis:** priorizar Meta/Google no MVP; usar provedores consolidados p/ WhatsApp; estratégia de *feature flags*.  
- **Dashboard superficial:** focar 2–3 métricas por objetivo com *playbooks* acionáveis no produto.  
- **Dependência de LLMs:** *fallbacks*, *rate limits* e cache semântico; custos monitorados.

**Premissas:** contas possuem ativos mínimos (logo/cores); acesso às APIs de canais; base de contatos com consentimento; orçamento básico de mídia opcional.

---

## 11) Lançamento & Governança (alto nível)
- **Beta fechado** (5–10 contas) para validar JTBD, métricas de eficácia e estabilidade.  
- **Releases canary** por módulo; *kill‑switch* para integrações.  
- **Suporte & SLA:** base de conhecimento, tutoriais; suporte em horário comercial (MVP).  
- **Governança de IA:** versionamento de prompts; *red‑teaming* de compliance; coleta de feedback por peça.

---

## 12) Questões em Aberto
- Quais BSPs de WhatsApp serão homologados no MVP?  
- Qual política de pricing (por conta, por assento, por volume de posts/disparos)?  
- Quais limites por plano (postagens/mês, jornadas ativas, contas por workspace)?  
- Precisamos de editor de vídeo/light studio no MVP ou fica para Pós‑MVP?  
- Escopo de SEO/Blog no curto prazo (fora do MVP).

---

## 13) Apêndice A — Exemplo de Brand Voice JSON
```json
{
  "brand": {"name": "Clínica Amigo Pet", "segment": "pet"},
  "visual": {"logoUrl": "https://.../logo.png", "palette": ["#1B365D","#F9C000","#EAEAEA"]},
  "voice": {
    "tone": {"confiança": 0.8, "acolhimento": 0.9, "humor": 0.2},
    "persona": "Veterinária experiente, didática e acolhedora",
    "lexicon": {"prefer": ["tutor", "bem-estar"], "avoid": ["barato"], "banned": ["curamos todas as doenças"]},
    "style": {"long": "frases curtas, listas quando possível", "cta": ["Agende agora", "Fale no WhatsApp"], "formatting": ["lista", "negrito moderado"]}
  },
  "compliance": {"claimsPolicy": "Evitar promessas clínicas; usar linguagem de prevenção", "disclaimer": "Conteúdo educativo; consulte o veterinário."}
}
```

---

## 14) Apêndice B — Estrutura de Dados da Anamnese Digital
**Seções retornadas pelo agente de IA (conforme escopo):**
- **Diagnóstico de Identidade e Propósito**  
- **Personas** (múltiplas, com dores, objetivos, gatilhos e canais)  
- **Auditoria de Percepção & Experiência**: Jornada do Paciente + matriz de **Johari** aplicada à marca  
- **Análise do Ecossistema** (inspirações, referências, benchmark)  
- **Plano de Tratamento** (Quick Wins; reestruturação; diretrizes)  
- **Roadmap Terapêutico** (priorização de ações por impacto/esforço)  
- **Nova Anatomia da Home** (estrutura recomendada de homepage)  
- **Perguntas de Aprofundamento** (para validações/entrevistas futuras)

---

**Fim do documento (PRD 1.0).**

