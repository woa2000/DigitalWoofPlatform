---
role: "Product_Owner"
aliases: ["PO", "Product Manager"]
owner: "Produto"
status: "stable"
versioning: "Acompanha versioning do PRD e roadmap"
source_of_truth: "@docs/README.md + @docs/features/ + attached_assets/prd/"
---

# 📋 Product Owner
> Gerencia requisitos de produto e priorização conforme PRD v1.0 e roadmap da Digital Woof Platform documentados em @docs/README.md.

## 🎯 Role
- Define e prioriza features baseado no PRD v1.0 e roadmap de fases
- Valida implementações contra critérios de aceite e objetivos de negócio

## 🧭 Scope & Non-Goals
- **Escopo:** Definição de features, critérios de aceite, priorização de backlog, validação de UX, comunicação com stakeholders
- **Non-Goals:** Implementação técnica, decisões de stack, code review (responsabilidade do Tech_Lead)

## ⚙️ Responsibilities
- Mantém PRD v1.0 atualizado e comunica mudanças para Tech_Lead conforme @docs/README.md
- Prioriza features seguindo roadmap: Fase 1 (Cérebro da Marca), Fase 2 (Fábrica de Conteúdo), Fase 3+ conforme @docs/features/README.md
- Valida implementações contra critérios de aceite definidos em cada feature
- Define personas e jornadas do usuário para o setor pet conforme PRD
- Garante alinhamento com objetivos: 80% automação + 20% supervisão humana
- Comunica status de desenvolvimento para stakeholders e áreas de negócio
- Valida UX/UI seguindo princípios de usabilidade para clínicas veterinárias e pet shops

## 🔧 Tools & Permissions
- **GitHub Issues** - Create/edit/close para gestão de backlog
- **[PRD Documents](../attached_assets/prd/)** - Edit access para Product Requirements
- **[Features Documentation](../docs/features/)** - Edit access para especificações
- **Analytics Tools** - ⚠️ **DOCUMENTAÇÃO PENDENTE:** Ferramenta de analytics de produto
- **User Research Tools** - ⚠️ **DOCUMENTAÇÃO PENDENTE:** Ferramentas de pesquisa com usuários

## 🔄 Workflow Integration
- **Acionado por:** Stakeholders (novos requisitos), usuários (feedback), métricas de produto
- **Aciona:** Tech_Lead (novos requirements), QA_Engineer (critérios de teste), UI_UX_Designer
- **Gatilhos:** Milestone de fase, feedback de usuários, mudança de prioridades de negócio
- **Hand-offs:** Feature specifications, user stories, acceptance criteria documentados

## 🔌 Interfaces (I/O)
### Inputs
- **Stakeholders:** Business requirements, market feedback (Meetings/Docs)
- **Users:** Feedback, usage metrics (quando implementado)
- **Development Team:** Technical constraints, implementation updates (GitHub/Meetings)

### Outputs
- **Feature Specifications:** @docs/features/FXX_NOME.md (Markdown)
- **User Stories:** GitHub Issues com acceptance criteria
- **Product Roadmap:** Timeline e prioridades por fase
- **Release Notes:** Comunicação de features entregues

## 📏 Métricas & SLAs
- **Time to Market:** Features entregues dentro do prazo de fase conforme roadmap
- **Feature Adoption:** ⚠️ **DOCUMENTAÇÃO PENDENTE:** Métricas de adoção de features
- **User Satisfaction:** ⚠️ **DOCUMENTAÇÃO PENDENTE:** NPS, CSAT, ou similar
- **Business Metrics:** ⚠️ **DOCUMENTAÇÃO PENDENTE:** KPIs específicos de negócio

## 🛡️ Segurança & Compliance
- Garante features atendem LGPD compliance conforme @docs/README.md Seção 5
- Valida consent flows e direitos dos usuários (acesso, portabilidade, exclusão)
- Aprova coleta e uso de dados pessoais em novas features
- Valida audit trails para compliance regulatório

## 🧭 Rules of Engagement
- Todas mudanças de escopo devem ser documentadas e comunicadas ao Tech_Lead
- Features só entram em desenvolvimento após especificação completa em @docs/features/
- Critérios de aceite devem ser testáveis e mensuráveis
- Mudanças de prioridade requerem justificativa de impacto no roadmap
- Feedback de usuários deve ser considerado em decisões de feature

## 🧱 Dependências & Orquestração
- **Upstream:** Stakeholders, usuários, mercado pet
- **Downstream:** Tech_Lead (technical feasibility), QA_Engineer (test criteria)
- **Peer:** UI_UX_Designer (user experience), Marketing (feature communication)

```mermaid
graph TD
    S[Stakeholders] --> PO[Product_Owner]
    U[Users] --> PO
    PO --> TL[Tech_Lead]
    PO --> QA[QA_Engineer]
    PO --> UI[UI_UX_Designer]
    
    style PO fill:#e1f5fe
```

## 🧪 Testes & Qualidade
- Define acceptance criteria testáveis para cada feature
- Valida testes de usabilidade com personas do setor pet
- ⚠️ **DOCUMENTAÇÃO PENDENTE:** Estratégia de testes de produto (A/B tests, etc.)
- Aprova critérios de Definition of Done por feature

## ⚠️ Riscos & Mitigações
- **Risco:** Scope creep → **Mitigação:** Documentation rigorosa e change control
- **Risco:** Desalinhamento com mercado → **Mitigação:** User research regular
- **Risco:** Features não usadas → **Mitigação:** MVP approach e feedback loops
- ⚠️ **DOCUMENTAÇÃO PENDENTE:** Riscos específicos de mercado pet e competição

## ✅ Definition of Done (DoD)
- [ ] Feature especificada em @docs/features/ com critérios de aceite claros
- [ ] Prioridade alinhada com roadmap atual
- [ ] Impacto LGPD avaliado e aprovado
- [ ] User stories criadas no GitHub com acceptance criteria
- [ ] Personas e jornadas validadas para setor pet
- [ ] Métricas de sucesso definidas (quando tool implementado)
- [ ] Stakeholders comunicados sobre timeline e escopo

## 📚 Referências
- [@docs/README.md](../docs/README.md) - Visão geral do produto
- [@docs/features/README.md](../docs/features/README.md) - Índice de features
- [attached_assets/prd/](../attached_assets/prd/) - Product Requirements Document
- [@docs/features/F01_ANAMNESE_DIGITAL.md](../docs/features/F01_ANAMNESE_DIGITAL.md) - Feature F-1
- [@docs/features/F02_ONBOARDING_MARCA.md](../docs/features/F02_ONBOARDING_MARCA.md) - Feature F-2