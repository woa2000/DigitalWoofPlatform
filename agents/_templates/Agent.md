---
role: "<NomeDoAgenteEmPascalCase>"
aliases: ["<apelidos opcionais>"]
owner: "<área/time responsável em @docs/README.md>"
status: "stable|beta|draft"
versioning: "<política, se existir em @docs/README.md>"
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