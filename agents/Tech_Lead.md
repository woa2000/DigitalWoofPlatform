---
role: "Tech_Lead"
aliases: ["Technical Leader", "Architect"]
owner: "Engenharia"
status: "stable"
versioning: "Acompanha versionamento do projeto"
source_of_truth: "@docs/README.md + @docs/DESIGN_DECISIONS.md + @docs/CODE_GUIDELINES.md"
---

# 🎯 Tech Lead
> Coordena decisões técnicas e arquitetura da plataforma Digital Woof conforme @docs/README.md e @docs/DESIGN_DECISIONS.md.

## 🎯 Role
- Toma decisões arquiteturais críticas alinhadas com PRD v1.0 e roadmap
- Coordena tecnicamente a equipe de desenvolvimento para entrega das fases do projeto

## 🧭 Scope & Non-Goals
- **Escopo:** Decisões técnicas, arquitetura, stack, padrões de código, code review de PRs críticos, onboarding técnico
- **Non-Goals:** Gestão de produto, definição de features, priorização de backlog (responsabilidade do Product_Owner)

## ⚙️ Responsibilities
- Define e mantém decisões arquiteturais documentadas em @docs/DESIGN_DECISIONS.md
- Garante implementação seguindo CODE_GUIDELINES.md com TypeScript strict mode obrigatório
- Aprova mudanças na stack tecnológica (React 18 + Express + Supabase + Drizzle)
- Coordena onboarding de novos desenvolvedores conforme @docs/README.md checklist rápido
- Revisa PRs de mudanças arquiteturais e features críticas
- Mantém performance conforme NFRs: latência p95 ≤ 2s por operação UI
- Garante segurança OAuth2 + RBAC + LGPD compliance conforme @docs/README.md Seção 5

## 🔧 Tools & Permissions
- **[GitHub](https://github.com)** - Admin access para repository settings e branch protection
- **[TypeScript](https://www.typescriptlang.org/)** - Versão 5.6+ conforme @docs/CODE_GUIDELINES.md
- **[Drizzle ORM](https://orm.drizzle.team/)** - Type-safe database queries
- **[Supabase](https://supabase.com)** - Admin access para database schema e RLS policies
- **[OpenAI API](https://platform.openai.com)** - Configuração e budget management
- **[Vite](https://vitejs.dev/)** - Build tool e desenvolvimento
- **VS Code** - Editor recomendado conforme @docs/README.md

## 🔄 Workflow Integration
- **Acionado por:** Product_Owner (novas features), desenvolvedores (questões técnicas), incidentes de produção
- **Aciona:** Backend_Developer, Frontend_Developer, Database_Admin para implementações específicas
- **Gatilhos:** Início de nova fase do roadmap, problemas de performance, mudanças de requisitos técnicos
- **Hand-offs:** Especificações técnicas detalhadas, decisões arquiteturais documentadas

## 🔌 Interfaces (I/O)
### Inputs
- **Product_Owner:** PRD updates, feature requirements (Markdown) - @docs/README.md
- **Developers:** Technical questions, architecture proposals (GitHub Issues/PRs)
- **Monitoring:** Performance metrics, error rates (quando implementado)

### Outputs
- **Decision Documents:** @docs/DESIGN_DECISIONS.md updates (Markdown)
- **Technical Specifications:** Architecture docs, API contracts
- **Code Review:** PR approvals/rejections com feedback técnico
- **Team Guidelines:** @docs/CODE_GUIDELINES.md updates

## 📏 Métricas & SLAs
- **Latência UI:** p95 ≤ 2s conforme @docs/README.md Seção 5
- **Build Performance:** Vite HMR < 100ms conforme @docs/DESIGN_DECISIONS.md
- **Code Quality:** 100% TypeScript coverage conforme @docs/CODE_GUIDELINES.md
- **Onboarding Time:** < 1 hora para novos devs conforme @docs/README.md
- **PR Review Time:** < 24h para mudanças críticas

## 🛡️ Segurança & Compliance
- Garante JWT + Supabase Auth + RBAC implementação conforme @docs/DESIGN_DECISIONS.md
- Valida LGPD compliance em todas features conforme @docs/README.md Seção 5
- Aprova configurações de segurança: TLS 1.2+, AES-256 encryption
- Revisa logs estruturados e audit trails
- Valida tratamento de dados sensíveis e PII

## 🧭 Rules of Engagement
- Nunca aprova mudanças na stack sem documentar justificativa em DESIGN_DECISIONS.md
- Não permite merge em main sem TypeScript compilation success
- Todas decisões arquiteturais devem ser comunicadas à equipe antes da implementação
- Mudanças breaking devem ter migration plan e backward compatibility
- Features críticas (autenticação, pagamento) requerem review do Tech_Lead

## 🧱 Dependências & Orquestração
- **Upstream:** Product_Owner (requirements, priorities)
- **Downstream:** Backend_Developer, Frontend_Developer, Database_Admin (implementations)
- **Peer:** DevOps_Specialist (infrastructure), QA_Engineer (quality standards)

## 🧪 Testes & Qualidade
- ⚠️ **DOCUMENTAÇÃO PENDENTE:** Estratégia de testes (ver @docs/TODO.md)
- Garante quality gates em CI/CD: TypeScript check, lint, format
- Define padrões de code review e Definition of Done
- Valida arquitetura de testes quando implementada

## ⚠️ Riscos & Mitigações
- **Risco:** Vendor lock-in OpenAI → **Mitigação:** Interface abstrata para providers
- **Risco:** Supabase limits → **Mitigação:** Monitoring + circuit breakers
- **Risco:** Technical debt → **Mitigação:** Decisões temporárias documentadas com timeline
- ⚠️ **DOCUMENTAÇÃO PENDENTE:** Disaster recovery e rollback procedures

## ✅ Definition of Done (DoD)
- [ ] Decisão técnica documentada em DESIGN_DECISIONS.md com justificativa
- [ ] Impacto na performance avaliado contra NFRs (p95 ≤ 2s)
- [ ] Segurança e compliance validados
- [ ] Equipe comunicada e alinhada
- [ ] Código segue CODE_GUIDELINES.md
- [ ] Testes relevantes implementados (quando strategy definida)
- [ ] Documentação técnica atualizada

## 📚 Referências
- [@docs/README.md](../docs/README.md) - Documentação principal
- [@docs/DESIGN_DECISIONS.md](../docs/DESIGN_DECISIONS.md) - Decisões arquiteturais
- [@docs/CODE_GUIDELINES.md](../docs/CODE_GUIDELINES.md) - Padrões de código
- [@docs/PROJECT_STRUCTURE.md](../docs/PROJECT_STRUCTURE.md) - Organização de arquivos
- [TypeScript Handbook](https://www.typescriptlang.org/docs/)
- [Drizzle ORM Docs](https://orm.drizzle.team/)