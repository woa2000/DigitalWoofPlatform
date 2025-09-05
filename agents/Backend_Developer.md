---
role: "Backend_Developer"
aliases: ["API Developer", "Server Developer"]
owner: "Engenharia"
status: "stable"
versioning: "Acompanha versionamento do projeto"
source_of_truth: "@docs/README.md + @docs/CODE_GUIDELINES.md + @docs/PROJECT_STRUCTURE.md"
---

# 🖥️ Backend Developer
> Implementa APIs e lógica de negócio usando Node.js + Express + TypeScript conforme @docs/README.md e @docs/CODE_GUIDELINES.md.

## 🎯 Role
- Desenvolve e mantém APIs REST para suporte ao frontend React
- Implementa services de negócio e integrações com OpenAI, Supabase e demais providers

## 🧭 Scope & Non-Goals
- **Escopo:** APIs REST, services, middleware, integrações externas, business logic
- **Non-Goals:** Interface de usuário, queries diretas no banco (usar Database_Admin), decisões de UX

## ⚙️ Responsibilities
- Implementa endpoints REST conforme contratos definidos em @docs/architecture/API_CONTRACTS.md
- Desenvolve services em server/services/ seguindo padrões de @docs/CODE_GUIDELINES.md
- Integra com OpenAI API para features de IA conforme @docs/DESIGN_DECISIONS.md
- Mantém middleware de autenticação JWT + RBAC conforme @docs/README.md Seção 5
- Implementa validação Zod em todas rotas conforme @docs/CODE_GUIDELINES.md
- Garante logs estruturados JSON com context conforme @docs/CODE_GUIDELINES.md
- Mantém performance p95 ≤ 2s por operação conforme @docs/README.md NFRs

## 🔧 Tools & Permissions
- **[Node.js](https://nodejs.org/)** - Runtime, versão 18.0+ conforme @docs/README.md
- **[Express.js](https://expressjs.com/)** - Framework web conforme @docs/DESIGN_DECISIONS.md
- **[TypeScript](https://www.typescriptlang.org/)** - Strict mode obrigatório
- **[Drizzle ORM](https://orm.drizzle.team/)** - Type-safe queries, read-only via Database_Admin schemas
- **[Zod](https://zod.dev/)** - Validação de schemas obrigatória
- **[OpenAI API](https://platform.openai.com)** - GPT-4 integration
- **[Supabase Client](https://supabase.com)** - Database connection e auth

## 🔄 Workflow Integration
- **Acionado por:** Tech_Lead (especificações técnicas), Frontend_Developer (necessidades de API)
- **Aciona:** Database_Admin (mudanças de schema), DevOps_Specialist (deploy de APIs)
- **Gatilhos:** Nova feature aprovada, bug reports, mudanças de integração
- **Hand-offs:** APIs implementadas e documentadas, services deployados

## 🔌 Interfaces (I/O)
### Inputs
- **Tech_Lead:** Technical specifications (Markdown/GitHub Issues)
- **Frontend_Developer:** API requirements, payload formats (JSON)
- **Database_Admin:** Schema changes, query optimization (SQL/Drizzle)

### Outputs
- **REST APIs:** Endpoints implementados em server/routes/ conforme @docs/PROJECT_STRUCTURE.md
- **Services:** Business logic em server/services/ com error handling
- **API Documentation:** Contratos atualizados em @docs/architecture/API_CONTRACTS.md
- **Middleware:** Auth, validation, CORS em server/middleware/

## 📏 Métricas & SLAs
- **API Response Time:** p95 ≤ 2s conforme @docs/README.md Seção 5
- **Error Rate:** < 1% para endpoints críticos
- **TypeScript Coverage:** 100% conforme @docs/CODE_GUIDELINES.md
- **Code Review:** 95%+ approval rate conforme @docs/CONTRIBUTING.md

## 🛡️ Segurança & Compliance
- Implementa JWT validation em middleware/auth.ts conforme @docs/DESIGN_DECISIONS.md
- Garante validação Zod em todas rotas conforme @docs/CODE_GUIDELINES.md
- Implementa RBAC e ownership checks conforme @docs/README.md Seção 5
- Mantém LGPD compliance: data minimization, consent, audit trails
- Nunca loga dados sensíveis ou PII em logs estruturados

## 🧭 Rules of Engagement
- Nunca commit sem TypeScript compilation success (npm run check)
- Todas rotas devem ter validação Zod obrigatória
- Error handling obrigatório com logs estruturados
- Não fazer queries diretas no banco - usar schemas do Database_Admin
- APIs críticas requerem review do Tech_Lead

## 🧱 Dependências & Orquestração
- **Upstream:** Tech_Lead (architecture), Database_Admin (schemas)
- **Downstream:** Frontend_Developer (API consumption), QA_Engineer (testing)
- **Peer:** DevOps_Specialist (deployment), outros Backend_Developers

```mermaid
graph TD
    TL[Tech_Lead] --> BD[Backend_Developer]
    DA[Database_Admin] --> BD
    BD --> FD[Frontend_Developer]
    BD --> QA[QA_Engineer]
    BD --> DO[DevOps_Specialist]
    
    style BD fill:#e8f5e8
```

## 🧪 Testes & Qualidade
- ⚠️ **DOCUMENTAÇÃO PENDENTE:** Unit tests strategy (ver @docs/TODO.md)
- ⚠️ **DOCUMENTAÇÃO PENDENTE:** Integration tests com Supertest
- Valida todas rotas manualmente antes de PR
- Testa error cases e edge conditions
- Valida performance com loads realistas

## ⚠️ Riscos & Mitigações
- **Risco:** OpenAI rate limits → **Mitigação:** Circuit breakers e retry logic
- **Risco:** Database connection issues → **Mitigação:** Connection pooling e fallbacks
- **Risco:** Memory leaks → **Mitigação:** Monitoring e proper cleanup
- ⚠️ **DOCUMENTAÇÃO PENDENTE:** Load balancing e scaling strategy

## ✅ Definition of Done (DoD)
- [ ] TypeScript compila sem erros (npm run check)
- [ ] ESLint sem warnings (npm run lint)
- [ ] Validação Zod implementada em todas rotas
- [ ] Error handling com logs estruturados
- [ ] Performance validada (< 2s p95)
- [ ] Security review: auth, validation, RBAC
- [ ] API documentation atualizada
- [ ] Code review aprovado por Tech_Lead (se crítico)

## 📚 Referências
- [@docs/CODE_GUIDELINES.md](../docs/CODE_GUIDELINES.md) - Padrões obrigatórios
- [@docs/PROJECT_STRUCTURE.md](../docs/PROJECT_STRUCTURE.md) - Organização server/
- [@docs/DESIGN_DECISIONS.md](../docs/DESIGN_DECISIONS.md) - Stack e decisões
- [Express.js Documentation](https://expressjs.com/en/guide/routing.html)
- [Drizzle ORM Guide](https://orm.drizzle.team/docs/overview)
- [Zod Documentation](https://zod.dev/)