# 🤝 Guia de Contribuição - Digital Woof Platform

**Versão:** 1.0  
**Baseado em:** PRD v1.0 + Roadmap v1.0  
**Objetivo:** Fluxo padronizado para contribuições seguras e consistentes

---

## 🎯 TL;DR - Fluxo Rápido

```bash
# 1. Setup (primeira vez apenas)
git clone [repo] && cd DigitalWoofPlatform
npm install && cp .env.example .env && npm run db:push

# 2. Nova feature/fix
git checkout main && git pull
git checkout -b feature/F01-anamnese-improvements
# [fazer mudanças seguindo CODE_GUIDELINES.md]
npm run check && npm run lint && npm run format

# 3. Commit e PR
git add . && git commit -m "feat(F01): improve anamnese error handling"
git push origin feature/F01-anamnese-improvements
# [abrir PR no GitHub com template]
```

**⏰ Tempo estimado:** 5 min setup inicial + desenvolvimento + 2 min para PR

---

## 📋 Pré-requisitos

### ✅ Ambiente de Desenvolvimento

| Ferramenta | Versão Mínima | Como Instalar |
|------------|---------------|---------------|
| **Node.js** | 18.0+ | [nodejs.org](https://nodejs.org) |
| **npm** | 9.0+ | Incluído com Node.js |
| **Git** | 2.30+ | [git-scm.com](https://git-scm.com) |
| **Editor** | VS Code (recomendado) | [code.visualstudio.com](https://code.visualstudio.com) |

### ✅ Conhecimento Base (15 min de leitura)

**Obrigatório antes do primeiro commit:**
- [ ] [PRD](prd/PRD.md) - Entender o produto e objetivos
- [ ] [Roadmap](roadmap/roadmap.md) - Saber em que fase estamos
- [ ] [CODE_GUIDELINES.md](CODE_GUIDELINES.md) - Padrões de código
- [ ] [PROJECT_STRUCTURE.md](PROJECT_STRUCTURE.md) - Organização de arquivos

**Recomendado:**
- [ ] [DESIGN_DECISIONS.md](DESIGN_DECISIONS.md) - Por que escolhemos cada tecnologia
- [ ] [Features implementadas](features/) - Especificações técnicas

---

## 🚀 Setup Inicial (5 minutos)

### 1. Clone e Configuração Base

```bash
# 1.1 Clone do repositório
git clone https://github.com/woa2000/DigitalWoofPlatform.git
cd DigitalWoofPlatform

# 1.2 Instalar dependências
npm install

# 1.3 Configurar ambiente
cp .env.example .env
# Editar .env com suas credenciais (Supabase, OpenAI, etc.)
```

### 2. Configuração do Banco

```bash
# 2.1 Sincronizar schema com Supabase
npm run db:push

# 2.2 Verificar conexão
npm run check
```

### 3. Primeiro Start

```bash
# 3.1 Iniciar servidor de desenvolvimento
npm run dev

# 3.2 Verificar se está funcionando
# Frontend: http://localhost:5173
# Backend: http://localhost:3000/api/health
```

### ✅ Checklist - Setup Completo

- [ ] Servidor inicia sem erros (`npm run dev`)
- [ ] Frontend carrega em `localhost:5173`
- [ ] TypeScript compila sem erros (`npm run check`)
- [ ] Banco conectado (check na interface)

---

## 🌿 Fluxo de Branches e Commits

### 🌳 Estratégia de Branching

**Branch principal:**
- `main` - Código estável, sempre deployável

**Branches de desenvolvimento:**
```bash
# Features novas (baseadas no PRD)
feature/F01-anamnese-improvements      # Feature F-1 (Anamnese Digital)
feature/F02-onboarding-wizard         # Feature F-2 (Onboarding)

# Bugfixes
fix/login-redirect-loop               # Fix específico
fix/F01-url-validation               # Fix em feature específica

# Melhorias técnicas
refactor/database-optimizations       # Refatoração
docs/update-api-contracts            # Documentação
```

### 📝 Convenção de Commits

**Seguimos [Conventional Commits](https://conventionalcommits.org/) com contexto do PRD:**

```bash
# Formato: <tipo>(escopo): <descrição>

# ✅ EXEMPLOS CORRETOS
feat(F01): add URL deduplication for anamnesis
fix(auth): resolve JWT token expiration handling  
docs(F02): update brand onboarding specification
refactor(db): optimize anamnesis queries for performance
test(F01): add unit tests for URL validation

# ❌ EXEMPLOS INCORRETOS
update stuff                          # Muito vago
fix bug                              # Sem contexto
Add new feature                      # Não segue formato
```

**Tipos permitidos:**
- `feat` - Nova funcionalidade
- `fix` - Correção de bug
- `docs` - Documentação
- `refactor` - Refatoração sem mudança de funcionalidade
- `test` - Adição/correção de testes
- `style` - Formatação, lint fixes
- `perf` - Melhoria de performance
- `chore` - Mudanças de build, dependências

---

## 🔨 Processo de Desenvolvimento

### 1. Escolher/Criar Issue

**Baseado na fase atual do Roadmap (Fase 1 - Cérebro da Marca):**

```bash
# Issues prioritárias (Setembro 2025):
- Implementar F-2: Onboarding de Marca
- Implementar F-3: Brand Voice JSON  
- Implementar F-4: Manual de Marca Digital
- Melhorar F-1: Anamnese Digital (performance, error handling)

# Como escolher:
1. Issues com label "good-first-issue" para iniciantes
2. Issues da sprint atual (ver milestone)
3. Bugs críticos (label "priority-high")
```

### 2. Criar Branch

```bash
# Sempre partir do main atualizado
git checkout main
git pull origin main

# Criar branch seguindo convenção
git checkout -b feature/F02-brand-onboarding

# OU para bugfix
git checkout -b fix/anamnesis-duplicate-urls
```

### 3. Desenvolvimento

#### ✅ Checklist Durante Desenvolvimento

**A cada mudança significativa:**
- [ ] Código segue [CODE_GUIDELINES.md](CODE_GUIDELINES.md)
- [ ] TypeScript compila: `npm run check`
- [ ] Linting passou: `npm run lint`
- [ ] Formatação aplicada: `npm run format`
- [ ] Funcionalidade testada manualmente
- [ ] Logs adequados adicionados (conforme PRD Seção 5)

**Exemplo de desenvolvimento típico:**

```typescript
// 1. Criar types em shared/ primeiro
// shared/schema.ts
export const brandOnboarding = pgTable("brand_onboarding", {
  id: uuid("id").primaryKey().default(sql`gen_random_uuid()`),
  userId: uuid("user_id").references(() => users.id).notNull(),
  // ... outros campos
});

// 2. Implementar service no backend
// server/services/brand-onboarding.service.ts
export class BrandOnboardingService {
  async create(data: CreateOnboardingDto): Promise<BrandOnboarding> {
    // Implementação seguindo guidelines...
  }
}

// 3. Criar rota da API
// server/routes/brand-onboarding.ts
router.post('/', requireAuth, validateRequest(CreateOnboardingSchema), async (req, res) => {
  // Implementação...
});

// 4. Implementar componentes no frontend
// client/src/pages/BrandOnboarding.tsx
export default function BrandOnboarding() {
  // Implementação...
}

// 5. Testar integração end-to-end
npm run dev
# Testar fluxo completo na interface
```

### 4. Testes e Validação

```bash
# Validação obrigatória antes de commit
npm run check          # TypeScript - zero erros
npm run lint           # ESLint - zero warnings  
npm run format         # Prettier formatação

# Validação funcional
npm run dev            # Testar funcionalidade manualmente
npm run db:push        # Se alterou schema

# TODO: Testes automatizados (ver TODO.md)
# npm test            # Quando implementados
```

---

## 📤 Pull Request Process

### 1. Preparar PR

```bash
# 1.1 Commit final
git add .
git commit -m "feat(F02): implement brand onboarding wizard

- Add brand asset upload functionality  
- Implement color palette extraction
- Create tone of voice configuration
- Generate Brand Voice JSON v1 schema

Closes #123"

# 1.2 Push para origin
git push origin feature/F02-brand-onboarding
```

### 2. Criar Pull Request

**Template obrigatório (será preenchido automaticamente):**

```markdown
## 📝 Descrição

### Resumo
Implementa o wizard de onboarding de marca conforme Feature F-2 do PRD.

### Mudanças
- ✅ Upload de logo com validação de formato
- ✅ Extração automática de paleta de cores  
- ✅ Configuração de tom de voz (sliders)
- ✅ Geração de Brand Voice JSON válido

### Feature/Issue Relacionada
Closes #123 - Implementar F-2: Onboarding de Marca

## 🧪 Como Testar

1. Acesse `/onboarding` após login
2. Faça upload de um logo (PNG/JPG/SVG)
3. Configure tom de voz usando os sliders
4. Clique "Finalizar" e verifique se Brand Voice JSON é gerado

## ✅ Checklist do Desenvolvedor

- [x] Código segue [CODE_GUIDELINES.md](docs/CODE_GUIDELINES.md)
- [x] TypeScript compila sem erros (`npm run check`)
- [x] ESLint passou sem warnings (`npm run lint`)
- [x] Prettier aplicado (`npm run format`)
- [x] Funcionalidade testada manualmente
- [x] Logs estruturados adicionados
- [x] Documentação atualizada (se aplicável)
- [x] Schema do banco atualizado (se aplicável)

## 🔄 Arquivos Alterados

### Novos Arquivos
- `client/src/pages/BrandOnboarding.tsx`
- `client/src/components/brand/LogoUpload.tsx`
- `client/src/components/brand/ToneSelector.tsx`
- `server/routes/brand-onboarding.ts`
- `server/services/brand-onboarding.service.ts`

### Arquivos Modificados
- `shared/schema.ts` - Adiciona tabela `brand_onboarding`
- `server/routes.ts` - Registra novas rotas

## 🚨 Breaking Changes
Nenhum breaking change.

## 📊 Impacto na Performance
- Upload de imagem limitado a 5MB
- Processamento de cor otimizado (< 200ms)
- Cache de Brand Voice por 5 minutos

## 🔗 Links de Referência
- [PRD F-2: Onboarding de Marca](docs/prd/PRD.md#f2-onboarding-de-marca)
- [Brand Voice JSON Schema](docs/prd/PRD.md#f3-brand-voice-json)
```

### 3. Revisão de Código

#### ✅ Critérios para Aprovação

**Automático (CI/CD - quando implementado):**
- [ ] TypeScript compila
- [ ] Linting passa
- [ ] Testes passam (quando implementados)
- [ ] Build de produção funciona

**Manual (Reviewer):**
- [ ] **Alinhamento com PRD:** Implementação segue especificação
- [ ] **Code Guidelines:** Segue padrões definidos
- [ ] **Segurança:** Validação adequada, autorização correta
- [ ] **Performance:** Queries otimizadas, cache apropriado  
- [ ] **UX:** Interface intuitiva, error handling claro
- [ ] **Documentação:** Atualizada se necessário

#### 🔍 Processo de Review

```markdown
# Exemplo de feedback de review:

## ✅ Aprovado com sugestões menores

Ótima implementação da Feature F-2! Código limpo e bem estruturado.

### 🎯 Pontos Positivos
- Validação Zod bem implementada
- Error handling robusto
- Interface intuitiva

### 💡 Sugestões (não bloqueantes)
- **Performance:** Considerar debounce no upload (line 45)  
- **UX:** Adicionar preview da paleta extraída
- **Logs:** Adicionar log de sucesso no onboarding completo

### 🚨 Bloqueantes
Nenhum.

**Status:** ✅ Aprovado para merge
```

### 4. Merge e Cleanup

```bash
# Após aprovação, merge será feito via GitHub (squash merge preferido)

# Cleanup local
git checkout main
git pull origin main
git branch -d feature/F02-brand-onboarding

# Verificar se main está estável
npm run dev
```

---

## 🔧 Ferramentas e Automação

### 🤖 Hooks Git (Recomendado)

```bash
# Setup de pre-commit hooks para validação automática
npm install -g husky
npx husky add .husky/pre-commit "npm run check && npm run lint"

# Agora a cada commit:
git commit -m "fix: something"
# -> Executa automaticamente check + lint
# -> Bloqueia commit se houver erros
```

### 🚀 Scripts Úteis

```bash
# Desenvolvimento diário
npm run dev              # Servidor completo (frontend + backend)
npm run check:watch      # TypeScript em modo watch
npm run lint:fix         # Corrigir warnings ESLint automaticamente

# Antes de commit (manual)
npm run validate         # TODO: Script que executa check + lint + format

# Debug e logs
npm run dev:debug        # TODO: Servidor com logs detalhados
npm run db:studio        # TODO: Interface visual do banco
```

---

## 🔄 Fluxos Específicos

### 🆕 Implementar Nova Feature do PRD

**Exemplo: Feature F-5 - Calendário Editorial (Fase 2)**

```bash
# 1. Preparação  
git checkout -b feature/F05-calendario-editorial

# 2. Criar documentação da feature primeiro
touch docs/features/F05_CALENDARIO_EDITORIAL.md
# [preencher conforme template das outras features]

# 3. Implementar backend (schema, service, routes)
# shared/schema.ts - adicionar tabelas calendar_events, etc.
# server/services/calendar.service.ts
# server/routes/calendar.ts

# 4. Implementar frontend (pages, components, hooks)  
# client/src/pages/Calendar.tsx
# client/src/components/calendar/
# client/src/hooks/useCalendar.ts

# 5. Integração e testes
npm run db:push
npm run dev
# [testar funcionalidade completa]

# 6. PR seguindo template
```

### 🐛 Corrigir Bug Crítico

**Processo acelerado para bugs em produção:**

```bash
# 1. Branch de hotfix
git checkout -b fix/critical-auth-loop

# 2. Implementar correção mínima
# [foco apenas no problema específico]

# 3. Teste direcionado
npm run check
# [testar apenas o fluxo afetado]

# 4. PR marcado como urgente
# Label: "priority-critical"
# Reviewers: @tech-lead + @product-owner

# 5. Merge fast-track (após 1 aprovação)
```

### 📝 Atualizar Documentação

```bash
# 1. Branch específica para docs
git checkout -b docs/update-api-contracts

# 2. Atualizar documentos relevantes
# docs/architecture/API_CONTRACTS.md
# docs/features/FXX_NOME.md

# 3. Verificar links
# [testar todos os links nos documentos alterados]

# 4. PR focado em documentação
# Label: "documentation"
# Review mais ágil (foco em clareza)
```

---

## 🚨 Troubleshooting Comum

### ❌ Problemas Frequentes

#### "TypeScript errors after git pull"
```bash
# Solução:
npm install          # Dependências podem ter mudado
npm run check        # Verificar erros específicos
npm run db:push      # Schema pode ter mudado
```

#### "Database connection failed"
```bash
# Verificar:
1. .env tem DATABASE_URL correto
2. Supabase está ativo
3. Schema está sincronizado: npm run db:push
```

#### "Merge conflicts in schema.ts"
```bash
# Cuidado especial:
1. Resolver conflitos manualmente
2. npm run db:push para verificar consistência
3. Testar todas as queries afetadas
```

#### "PR checks failing"
```bash
# Diagnóstico:
npm run check        # Erros TypeScript?
npm run lint         # Warnings ESLint?
npm run format       # Formatação Prettier?

# Se tudo local está OK, verificar:
- Node version compatibility  
- .env variables no CI (se configurado)
```

---

## 📊 Métricas de Qualidade

### 🎯 Metas do Time

**Objetivos para contribuições:**
- ⏱️ **Time to First Contribution:** < 1 hora para novos devs
- 🔄 **PR Turnaround:** < 24h para review + merge  
- 🐛 **Bug Rate:** < 5% de PRs que introduzem bugs
- 📝 **Documentation Coverage:** 100% de features documentadas

**Indicadores atuais:**
- 📈 **PR Success Rate:** 95%+ (low revert rate)
- 🔍 **Code Review Quality:** 2+ reviewers para features críticas
- 📚 **Knowledge Sharing:** Docs sempre atualizadas

### 📋 Templates e Checklists

**Todos os templates estão em `.github/` (quando configurado):**
- Pull Request Template
- Issue Templates (Feature, Bug, Question)  
- Code Review Checklist

---

## 🎓 Onboarding para Novos Desenvolvedores

### ⚡ First Day (1 hora)

```bash
# ✅ Checklist do primeiro dia:

# Setup técnico (20 min)
- [ ] Ambiente configurado (Node, Git, VS Code)
- [ ] Projeto rodando localmente
- [ ] Primeiro commit de teste

# Conhecimento do produto (30 min)  
- [ ] Leu PRD resumo executivo
- [ ] Entendeu a fase atual (Roadmap)
- [ ] Conhece as features já implementadas

# Integração com time (10 min)
- [ ] Acesso aos canais de comunicação
- [ ] Introdução com tech lead
- [ ] Issue "good-first-issue" atribuída
```

### 📚 First Week

- **Days 1-2:** Implementar primeira feature pequena (ex: melhorar validação)
- **Days 3-4:** Participar de review de PRs de outros devs
- **Day 5:** Propor melhoria na documentação/processo

### 🚀 Recursos para Crescimento

**Links essenciais:**
- [React Query Best Practices](https://tkdodo.eu/blog/practical-react-query)
- [Drizzle ORM Documentation](https://orm.drizzle.team/)
- [Conventional Commits](https://conventionalcommits.org/)
- [Clean Code TypeScript](https://github.com/labs42io/clean-code-typescript)

---

## 🤝 Comunidade e Comunicação

### 📢 Canais de Comunicação

**Issues do GitHub:**
- 🐛 **Bug reports:** Template estruturado com steps to reproduce
- 💡 **Feature requests:** Avaliados contra PRD e roadmap
- ❓ **Questions:** Respondidas rapidamente, viram FAQ

**Code Reviews:**
- 🤲 **Mindset colaborativo:** Reviews construtivos, focados em aprendizado
- 🎯 **Foco em qualidade:** Não apenas correção, mas melhoria contínua
- 📚 **Knowledge sharing:** Explicar decisões técnicas nos comentários

### 🏆 Reconhecimento

**Contribuições valorizadas:**
- 🚀 **Features bem implementadas** (alinhadas com PRD)
- 🔧 **Melhorias técnicas** (performance, segurança, DX)
- 📝 **Documentação** (manter docs atualizadas e claras)
- 🧹 **Code quality** (refatorações que melhoram legibilidade)
- 🤝 **Mentorship** (ajudar novos desenvolvedores)

---

*📚 Próximo passo: [Decisões de Design](DESIGN_DECISIONS.md) - Entenda as escolhas técnicas do projeto*