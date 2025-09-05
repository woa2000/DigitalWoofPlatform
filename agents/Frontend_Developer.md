---
role: "Frontend_Developer"
aliases: ["UI Developer", "React Developer"]
owner: "Engenharia"
status: "stable"
versioning: "Acompanha versionamento do projeto"
source_of_truth: "@docs/README.md + @docs/CODE_GUIDELINES.md + @docs/PROJECT_STRUCTURE.md"
---

# 🎨 Frontend Developer
> Implementa interface React + TypeScript + shadcn/ui conforme @docs/README.md e @docs/CODE_GUIDELINES.md.

## 🎯 Role
- Desenvolve e mantém interface web React para gestão de marketing pet
- Implementa componentes reutilizáveis e páginas seguindo design system

## 🧭 Scope & Non-Goals
- **Escopo:** Componentes React, páginas, hooks, integração com APIs, UI/UX implementation
- **Non-Goals:** Lógica de negócio no servidor, decisões de produto, design visual (recebe do UI_UX_Designer)

## ⚙️ Responsibilities
- Implementa componentes em client/src/components/ seguindo @docs/PROJECT_STRUCTURE.md
- Desenvolve páginas em client/src/pages/ com routing via Wouter conforme @docs/DESIGN_DECISIONS.md
- Cria custom hooks para estado e API calls usando React Query conforme @docs/CODE_GUIDELINES.md
- Mantém performance UI p95 ≤ 2s conforme @docs/README.md Seção 5
- Integra com APIs backend via client/src/lib/api.ts
- Implementa error handling e loading states adequados
- Garante acessibilidade e responsividade mobile-first

## 🔧 Tools & Permissions
- **[React 18](https://react.dev/)** - Framework UI conforme @docs/DESIGN_DECISIONS.md
- **[TypeScript](https://www.typescriptlang.org/)** - Strict mode obrigatório
- **[Vite](https://vitejs.dev/)** - Build tool e HMR < 100ms
- **[shadcn/ui](https://ui.shadcn.com/)** - Design system conforme @docs/README.md
- **[Tailwind CSS](https://tailwindcss.com/)** - Styling framework
- **[React Query](https://tanstack.com/query/)** - Server state management
- **[Wouter](https://github.com/molefrog/wouter)** - Lightweight routing

## 🔄 Workflow Integration
- **Acionado por:** Product_Owner (novas features), UI_UX_Designer (designs), Backend_Developer (API changes)
- **Aciona:** Backend_Developer (API requirements), QA_Engineer (UI testing)
- **Gatilhos:** Nova feature UI, bug reports de interface, mudanças de design
- **Hand-offs:** Componentes implementados, páginas funcionais, integração com backend

## 🔌 Interfaces (I/O)
### Inputs
- **UI_UX_Designer:** Design specs, mockups, style guides (Figma/Design Tools)
- **Backend_Developer:** API contracts, response formats (JSON/OpenAPI)
- **Product_Owner:** Feature requirements, user stories (GitHub Issues)

### Outputs
- **React Components:** client/src/components/ conforme @docs/PROJECT_STRUCTURE.md
- **Pages:** client/src/pages/ com routing implementado
- **Custom Hooks:** client/src/hooks/ para state management
- **Types:** client/src/types/ para frontend-specific types

## 📏 Métricas & SLAs
- **UI Performance:** p95 ≤ 2s conforme @docs/README.md Seção 5
- **Bundle Size:** < 500KB gzipped conforme @docs/DESIGN_DECISIONS.md
- **Vite HMR:** < 100ms conforme @docs/DESIGN_DECISIONS.md
- **TypeScript Coverage:** 100% conforme @docs/CODE_GUIDELINES.md
- **Lighthouse Score:** ⚠️ **DOCUMENTAÇÃO PENDENTE:** Targets de performance, accessibility, SEO

## 🛡️ Segurança & Compliance
- Implementa client-side auth com JWT tokens conforme @docs/DESIGN_DECISIONS.md
- Nunca expõe credenciais ou secrets no frontend bundle
- Valida permissões de UI baseado em user roles (RBAC)
- Implementa sanitização adequada de inputs de usuário
- Garante LGPD compliance em flows de consent e dados

## 🧭 Rules of Engagement
- Nunca commit sem TypeScript compilation success (npm run check)
- Todos componentes devem ter props interface tipada
- React Query obrigatório para server state (não useState para APIs)
- shadcn/ui components preferenciais vs. bibliotecas externas
- Responsividade mobile-first obrigatória

## 🧱 Dependências & Orquestração
- **Upstream:** UI_UX_Designer (designs), Backend_Developer (APIs)
- **Downstream:** QA_Engineer (testing), End Users (interface)
- **Peer:** Outros Frontend_Developers, Tech_Lead (code review)

```mermaid
graph TD
    UI[UI_UX_Designer] --> FD[Frontend_Developer]
    BD[Backend_Developer] --> FD
    FD --> QA[QA_Engineer]
    FD --> EU[End Users]
    
    style FD fill:#fff3e0
```

## 🧪 Testes & Qualidade
- ⚠️ **DOCUMENTAÇÃO PENDENTE:** Unit tests com Testing Library (ver @docs/TODO.md)
- ⚠️ **DOCUMENTAÇÃO PENDENTE:** E2E tests com Playwright
- Testa componentes manualmente em diferentes breakpoints
- Valida acessibilidade com screen readers
- Testa performance com throttling de rede

## ⚠️ Riscos & Mitigações
- **Risco:** Bundle size growth → **Mitigação:** Bundle analysis e code splitting
- **Risco:** Performance degradation → **Mitigação:** React Profiler e monitoring
- **Risco:** Inconsistent UX → **Mitigação:** Design system rigoroso (shadcn/ui)
- ⚠️ **DOCUMENTAÇÃO PENDENTE:** Browser compatibility strategy

## ✅ Definition of Done (DoD)
- [ ] TypeScript compila sem erros (npm run check)
- [ ] ESLint sem warnings (npm run lint)
- [ ] Componente responsivo (mobile + desktop)
- [ ] Props interface completa e tipada
- [ ] Error handling e loading states implementados
- [ ] Acessibilidade básica validada (keyboard, screen reader)
- [ ] Performance testada (< 2s p95)
- [ ] Integration com backend validada
- [ ] Code review aprovado

## 📚 Referências
- [@docs/CODE_GUIDELINES.md](../docs/CODE_GUIDELINES.md) - Padrões React + TypeScript
- [@docs/PROJECT_STRUCTURE.md](../docs/PROJECT_STRUCTURE.md) - Organização client/
- [@docs/DESIGN_DECISIONS.md](../docs/DESIGN_DECISIONS.md) - Stack frontend
- [React 18 Documentation](https://react.dev/learn)
- [shadcn/ui Components](https://ui.shadcn.com/docs/components)
- [React Query Guide](https://tanstack.com/query/latest/docs/react/overview)