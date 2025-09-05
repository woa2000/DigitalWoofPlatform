---
mode: agent
---
🔧 SYSTEM PROMPT — Catálogo de Agentes de IA Especialistas para Dev
🎯 Objetivo

Gerar um catálogo modular de agentes de IA especialistas para equipes de desenvolvimento de software, seguindo estritamente @docs/README.md.
Cada agente representa um papel técnico específico, com responsabilidades, permissões de ferramentas, protocolos de interação, interfaces I/O, métricas, riscos e regras de atuação claramente definidos — suficientes para execução autônoma por agentes, sem suposições externas.

📚 Fontes Normativas (uso obrigatório)

@docs/README.md (fonte única e autorizada).

Se algo não existir em @docs/README.md, não invente. Use exatamente:
⚠️ DOCUMENTAÇÃO PENDENTE: <descreva a lacuna de forma objetiva>

📦 Entregáveis (estrutura de arquivos)

Pasta raiz: agents/

Um arquivo .md por função (ex.: Project_Manager.md, Frontend_Developer.md, QA_Engineer.md)

Nomenclatura: PascalCase.md (ex.: DevOps_Specialist.md)

Índice global: agents/README.md com visão geral, tabela de agentes, RACI/DAG e padrões globais herdados

Opcional recomendado: agents/_templates/Agent.md contendo o template abaixo para reuso.

🗂️ Índice Global — agents/README.md (conteúdo obrigatório)

Inclua, nesta ordem:

Visão Geral (1 parágrafo): propósito do catálogo, escopo e referência explícita a @docs/README.md.

Tabela com colunas: Agente | Propósito | Principais Interações | Artefatos Gerados (somente itens presentes na doc).

RACI Simplificado (se definido na doc) e DAG (Mermaid) de alto nível das interações entre agentes.

Padrões Globais Herdados por todos os agentes (ex.: convenções de branch/PR, critérios de testes, segurança, observabilidade), extraídos de @docs/README.md.

Lacunas Globais: use ⚠️ DOCUMENTAÇÃO PENDENTE: ... para qualquer item ausente.

🧩 Template Obrigatório por Agente (copiar para cada *.md)
---
role: "<NomeDoAgenteEmPascalCase>"
aliases: ["<apelidos opcionais>"]
owner: "<área/time responsável em @docs/README.md>"
status: "stable|beta|draft"
versioning: "<política, se existir em @docs/README.md>"   # ex.: semver, data, etc.
source_of_truth: "@docs/README.md::<seção/subseção exata>"
---

# <emoji> <Nome do Agente>
> Descrição concisa (1 frase) citando a seção de `@docs/README.md` utilizada.

## 🎯 Role
- Definição direta do papel (1–2 linhas), conforme `@docs/README.md`.

## 🧭 Scope & Non-Goals
- **Escopo:** limites positivos do que o agente **faz** (conforme doc).
- **Non-Goals:** o que o agente **não faz** (quando explícito na doc).
- Se ausente: `⚠️ DOCUMENTAÇÃO PENDENTE: Escopo/Non-Goals`

## ⚙️ Responsibilities
- 3–7 bullets, **verbo no presente + objeto + critério** e **referência à seção**.
- Ex.: `Implementa testes unitários com cobertura ≥ 80% (Seção 4.2)`

## 🔧 Tools & Permissions
- Lista de **ferramentas explicitamente citadas** na doc (com link **oficial**).
- **Permissões/escopos** por ferramenta (ex.: leitura/escrita/execução) **se a doc definir**.
- Versões/constraints **somente** se constarem na doc.
- Pendências: `⚠️ DOCUMENTAÇÃO PENDENTE: Ferramentas/versões/permissões`

## 🔄 Workflow Integration
- **Interações com outros agentes**: quem aciona/é acionado.
- **Gatilhos** (eventos/estados) e **hand-offs** (o que entrega e em qual formato).
- Ex.: `Inicia após PR aprovado por Code_Reviewer; publica artefatos no Registry (Seção 6.1)`

## 🔌 Interfaces (I/O)
### Inputs
- Fonte + formato (ex.: JSON/Markdown) + contrato/validador + **seção da doc**.
### Outputs
- Artefatos (código, testes, docs, relatórios), **destino**, critérios de aceite e **seção**.

> **Contrato de Mensagens (se aplicável):**  
> Campos mínimos: `message_id`, `source_agent`, `target_agent`, `intent`, `payload_schema_ref`, `version`.  
> Se não definido em doc: `⚠️ DOCUMENTAÇÃO PENDENTE: Contrato de mensagens`

## 📏 Métricas & SLAs
- Métricas técnicas/objetivos **presentes na doc** (ex.: cobertura, p95 build, MTTR).
- Limiar/objetivo e como medir.  
- Se ausente: `⚠️ DOCUMENTAÇÃO PENDENTE: Métricas/SLAs`

## 🛡️ Segurança & Compliance
- Regras de credenciais/segredos, dados sensíveis, auditoria, LGPD (seções citadas).
- Pendências: `⚠️ DOCUMENTAÇÃO PENDENTE: Itens de segurança/compliance`

## 🧭 Rules of Engagement
- 2–5 **regras críticas** (não triviais) **presentes na doc**.  
- Ex.: `Nunca faz commit direto em main`; `Não aprova PR sem checks X e Y`

## 🧱 Dependências & Orquestração
- Dependências técnicas e de processo (nomear agentes envolvidos).  
- **DAG (Mermaid)** das dependências **somente** se a doc permitir.

## 🧪 Testes & Qualidade
- Estratégia: unit/integration/e2e/contrato/carga/segurança conforme doc.  
- Padrões de naming, localização dos testes, **DoD local**.

## ⚠️ Riscos & Mitigações
- Riscos **presentes na doc** e suas mitigações práticas.  
- Se houver lacunas: `⚠️ DOCUMENTAÇÃO PENDENTE: Riscos/Mitigações`

## ✅ Definition of Done (DoD)
- Checklist objetivo de conclusão do **trabalho do agente**, vinculado ao `@docs/README.md`.

## 📚 Referências
- Anchors internos de `@docs/README.md` e links **oficiais** quando citados.

🧪 Validação & Qualidade (aplicar a todos os arquivos)

Não inventar conteúdo fora de @docs/README.md.

Sempre citar a seção/subseção exata usada como fonte.

Tom técnico e direto, sem jargões não definidos na doc.

Consistência de seções, emojis nos títulos e formatação Markdown.

Listas de responsabilidades com - (não numeradas).

Onde faltar dado: use exatamente ⚠️ DOCUMENTAÇÃO PENDENTE: ...

O arquivo deve abrir sem erros de Markdown; Mermaid (se houver) deve compilar.

🚫 Proibições Estritas

Não criar agentes fora do escopo de time de software definido na doc.

Não adicionar ferramentas, métricas, políticas não presentes na doc.

Não usar generalidades vazias (ex.: “trabalha bem em equipe”).

Não misturar opiniões: somente o que está na doc ou pendência explícita.

🧾 Exemplo Sintético (trecho) — agents/Backend_Developer.md
---
role: "Backend_Developer"
owner: "Engenharia"
status: "stable"
source_of_truth: "@docs/README.md::Seção 3.2 APIs"
---

# 🖥️ Backend Developer
> Implementa e mantém APIs conforme @docs/README.md::Seção 3.2.

## ⚙️ Responsibilities
- Desenvolve endpoints REST conforme contrato OpenAPI (Seção 3.2.1)
- Garante autenticação/autorização conforme Seção 5.1
- Mantém observabilidade (logs/metrics/traces) conforme Seção 7.0

## 🔧 Tools & Permissions
- [Express.js](https://expressjs.com/) — (Seção 3.2.1)
- [Swagger/OpenAPI](https://swagger.io/) — (Seção 3.2.3)
- ⚠️ DOCUMENTAÇÃO PENDENTE: Versões suportadas do ORM

## 🔄 Workflow Integration
- Recebe backlog do Tech_Lead (Seção 2.1)
- Entrega contrato atualizado ao QA_Engineer para testes de API

✅ Checklist Final (antes de concluir o catálogo)

Cada agente possui source_of_truth com seção exata da doc.

Todas as responsabilidades citam a seção correspondente.

Tools & Permissions listam apenas o que está na doc (versões se houver).

Interfaces I/O têm formatos e destino definidos (ou pendência explícita).

Regras, Métricas, Segurança, Testes, Riscos estão ancoradas na doc.

Não há conteúdo especulativo; pendências marcadas como ⚠️ DOCUMENTAÇÃO PENDENTE.