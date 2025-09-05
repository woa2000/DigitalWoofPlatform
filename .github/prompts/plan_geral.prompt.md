---
mode: agent
---
📑 System Prompt — Planos de Desenvolvimento Orquestrados por Agentes de IA
🎯 Objetivo

Gerar planos executáveis e completos para cada funcionalidade do projeto, orquestrados por agentes de IA, alinhados estritamente a @docs/README.md, @docs/features/README.md e @agents/README.md.
Cada plano deve permitir que um agente execute as tarefas sem depender de perguntas adicionais a humanos, cobrindo tarefas, artefatos, contratos de interface, validações, segurança e dependências.
Não incluir cronogramas ou datas.

✅ Saída Esperada (Arquitetura de Arquivos)

Criar a pasta raiz plans/.

Para cada funcionalidade listada em @docs/README.md, gerar um arquivo:

Nome: PascalCase_Plan.md (ex.: UserAuthentication_Plan.md, PaymentGateway_Integration_Plan.md).

Gerar um índice global em plans/plan.md com:

Lista de planos e dependências inter-planos.

Matriz de responsabilidade por agente.

Invariantes globais (segurança, qualidade, observabilidade).

Grafo de dependências entre planos (Mermaid).

🧱 Estrutura Obrigatória de cada Plano (*_Plan.md)

Use exatamente as seções abaixo, nesta ordem.

1) 🎯 Feature Scope

Fonte (obrigatória): citação pontual de @docs/README.md (ex.: @docs/README.md#3.1).

Critérios de Aceitação (2–6 itens): copiar literalmente da documentação.

Contexto de Negócio & Valor: bullets objetivos.

[⚠️ DOCUMENTAÇÃO PENDENTE]: lacunas ou ambiguidades detectadas.

2) 📎 Premissas, Restrições & Políticas

Tecnologias/versões obrigatórias, padrões de arquitetura, limites de desempenho, SLAs/SLIs, requisitos de compliance (ex.: LGPD), políticas de secret management e naming.

3) 🔌 Contratos & Interfaces (Data & API)

Entradas / Saídas (por tarefa e no todo).

Esquemas (JSON/YAML/SQL) com tipos, obrigatoriedade e validações.

APIs & Eventos: endpoints, métodos, códigos de status, payloads, tópicos/filas.

Config & Env Vars: chaves, formatos e origem segura.

4) 📦 Artefatos a Entregar

Código (módulos, paths), IaC/Manifests, migrações de banco, pipelines (CI steps), coleções de testes (unitários/e2e/performance/segurança), guias de uso/runbooks e documentação anexada.

5) 🤖 Orquestração de Agentes

Responsible Agent: agente principal conforme @agents/README.md.

Se inexistente: [⚠️ AGENTE NÃO DEFINIDO: Sugira NomeEmPascalCase].

Collaborator Agents: quem apoia e em quais passos.

Permissões de Ferramentas: quais ferramentas cada agente pode usar e em que contexto.

Handoffs & Protocolos: formato de mensagens entre agentes (JSON Schema), gatilhos, critérios de passagem e rollback.

6) 🗺️ Task Graph (Visão de Dependências)

Lista hierárquica das tarefas (do macro ao granular).

Grafo (Mermaid) de dependências intra-plano (opcional, recomendado).

7) 📋 Task Breakdown (Detalhamento Executável)

Para cada tarefa:

[ ] Título (imperativo técnico)

Responsible Agent: (de @agents/README.md)

Purpose: objetivo mensurável da tarefa

Inputs: fontes, arquivos, APIs, variáveis

Outputs: arquivos/artefatos/resultados (com esquema e local de gravação)

Tools & Stack: ferramentas e versões citadas na doc

Dependencies: tarefas ou planos necessários (ex.: Depende de DataEncryption_Plan.md)

Acceptance Checks (DoD da Tarefa): asserts objetivos, incluindo testes e validações

Observabilidade: logs/ métricas/ traces a instrumentar

Security Notes: ameaças, mitigação, secrets, políticas

Effort Unit: unidade definida em @docs/README.md (ex.: “story points”)

Padronização:

Usar verbos no imperativo técnico: “Implementar”, “Validar”, “Testar”, “Instrumentar”.

Referenciar a origem sempre: “Baseado em @docs/README.md#X.Y”.

8) ✅ Success Metrics (do Plano)

Métricas quantificáveis (ex.: cobertura ≥ 90%, p95 < 300ms, 0 vulnerabilidades críticas).

Como validar: ferramenta/relatório (ex.: SonarQube, OWASP ZAP, k6), critérios de aprovação automatizáveis.

9) 🔍 Estratégia de Validação & Qualidade

Testes: unidade, contrato, integração, e2e, carga, segurança.

Gates de Qualidade: linters, SAST/DAST, análise de cobertura, critérios de merge.

10) 🔒 Segurança, Privacidade & Compliance

Ameaças (modelo resumido), controles (OWASP ASVS), política de dados pessoais, retenção/anonymização, segregação de credenciais, rota de incidentes.

11) 📈 Telemetria & Operação

Logs, Métricas, Traces: eventos chave e campos obrigatórios.

Alertas & SLOs: condições de alerta, limiares e canais.

Runbooks: passos para investigação e recuperação (sem datas).

12) 🧭 Alternativas Técnicas & Decisões

Opções consideradas, prós/ contras, decisão tomada, critério de reversão.

13) ⚠️ Riscos & Unknowns

Riscos priorizados, impacto/likelihood, mitigações acionáveis.

[⚠️ PERGUNTAS ABERTAS]: o que depende de confirmação em @docs/README.md.

14) 🔗 Dependências Entre Planos

Lista de planos requeridos/afetados e interface de acoplamento (o que troca entre eles, em que formato).

15) 🧾 Versionamento, Branching & PRs

Convenções de branch/commit, template de PR (itens de checagem), CODEOWNERS, política de revisão.

16) ✅ Checklist de Prontidão para Execução por Agente

“Um agente de IA consegue executar todas as tarefas com base apenas neste plano?”

“Todos os inputs/outputs estão especificados com esquemas e locais?”

“Critérios de aceitação são testáveis automaticamente?”

“Segurança/observabilidade estão claras e acionáveis?”

🔗 Regras de Alinhamento e Rastreabilidade

Com @docs/README.md: toda tarefa deve derivar explicitamente de requisitos/aceitação.

Usar: “Baseado em @docs/README.md#X.Y”.

Com @agents/README.md: Responsible Agent e Collaborator Agents devem existir.

Se não existirem, use: [⚠️ AGENTE NÃO DEFINIDO: Sugira NomeEmPascalCase].

Proveniência técnica: citar ferramentas, padrões e limites apenas se presentes nas fontes oficiais.

🧪 Padrões de Qualidade (Exemplos)

❌ “Configurar autenticação”

✅ “Implementar fluxo OAuth 2.0 (Client Credentials) com Auth0; emitir JWT RS256 com expiração 24h e refresh token; rejeitar após 5 tentativas falhas; Baseado em @docs/README.md#3.1; outputs: auth-config.json, endpoints /oauth/token, /auth/refresh conforme esquema X.”

🚫 Proibições Estritas

Não inventar agentes, ferramentas, requisitos ou métricas não presentes na documentação oficial.

Não criar tarefas genéricas; todas devem ter inputs/outputs, critérios e ferramentas.

Não usar datas, prazos ou cronogramas.

Não omitir dependências entre tarefas e entre planos.

Não deixar artefatos ou contratos sem formato/esquema.

📑 Índice Global (plans/plan.md) — Conteúdo Obrigatório

Plans Index: lista de todos os *_Plan.md com breve escopo e agente responsável.

Global Dependencies Graph (Mermaid): grafo entre funcionalidades.

Matriz RACI por Agente: quem responde por quê, por plano.

Invariantes Globais: segurança mínima, observabilidade mínima, qualidade mínima.

Regras de Versionamento & PRs (resumo).

Exemplo (trecho):

# 📑 Project Plans Index

## 🔗 Plans
1. DataEncryption_Plan.md — Agente: Security_Specialist
2. UserAuthentication_Plan.md — Depende: DataEncryption_Plan.md — Agente: Security_Specialist
3. PaymentGateway_Integration_Plan.md — Depende: UserAuthentication_Plan.md — Agente: Backend_Agent

## 🌐 Global Dependencies (Mermaid)
```mermaid
graph TD
  DataEncryption --> UserAuthentication
  UserAuthentication --> PaymentGateway_Integration


---

## 📂 Exemplo Minimalista de Tarefa (padrão)
```md
- [ ] Implementar OAuth 2.0 com Auth0
  - Responsible Agent: Security_Specialist
  - Purpose: emitir JWT RS256 com refresh token conforme política
  - Inputs: credenciais Auth0 (secret gerenciado), requisitos `@docs/README.md#3.1`
  - Outputs: endpoint `/oauth/token`, `/auth/refresh`, `auth-config.json`
  - Tools & Stack: Auth0, Node/.NET, OWASP ZAP para verificação
  - Dependencies: DataEncryption_Plan.md
  - Acceptance Checks: 
      - token expira em 24h; refresh funcional; 0 falhas ZAP críticas
  - Observability: logs de autenticação (sucesso/falha), métricas p95 de login
  - Security Notes: rate limit, lockout após 5 falhas, armazenamento de secrets no vault
  - Effort Unit: 5 story points
  - Baseado em: `@docs/README.md#3.1`

⚡ Heurística Final

Antes de finalizar um plano, responda sim para todas as perguntas:

Autonomia: Um agente de IA consegue executar cada tarefa com o que está escrito?

Rastreabilidade: Cada item aponta para a seção correta da doc?

Testabilidade: Os critérios de aceitação e métricas são verificáveis por ferramenta?

Segurança e Observabilidade: Estão especificadas de forma acionável?