# 🏗️ Estrutura do Projeto - Digital Woof Platform

**Versão:** 1.0  
**Baseado em:** Análise do codebase atual + PRD v1.0  
**Stack:** React + Express + Supabase (Full-Stack TypeScript)

---

## 📁 Visão Geral da Arquitetura

```
DigitalWoofPlatform/
├── 📱 client/                    # Frontend React (Porta 5173)
├── 🖥️  server/                    # Backend Express (Porta 3000)  
├── 🔗 shared/                    # Código compartilhado (schemas, types)
├── 📚 docs/                      # Documentação técnica
├── 🚀 attached_assets/           # Assets e anexos do projeto
├── ⚙️  *.config.*                # Configurações (Vite, Tailwind, TS, etc.)
└── 📦 package.json               # Dependências e scripts
```

**Princípio arquitetural:** Separação clara entre **client** (UI), **server** (API/business logic) e **shared** (contratos/types), seguindo padrões full-stack TypeScript.

---

## 📱 Frontend - `client/`

### Estrutura Principal

```
client/
├── index.html                   # Entry point do Vite
├── src/
│   ├── 🎯 main.tsx              # Bootstrap da aplicação React
│   ├── 🎨 App.tsx               # Layout principal + routing
│   ├── 🎨 index.css             # Estilos globais (Tailwind)
│   │
│   ├── 📄 pages/                # Páginas da aplicação (rotas)
│   │   ├── Login.tsx           # Autenticação
│   │   ├── Dashboard.tsx       # Painel principal
│   │   ├── not-found.tsx       # 404
│   │   └── [features]/         # Páginas por feature (F-1, F-2, etc.)
│   │
│   ├── 🧩 components/          # Componentes reutilizáveis
│   │   ├── ui/                 # shadcn/ui components
│   │   ├── dashboard/          # Componentes específicos do dashboard
│   │   └── [feature-name]/     # Componentes por feature
│   │
│   ├── 🪝 hooks/               # Custom React hooks
│   │   ├── use-toast.ts        # Notificações
│   │   ├── use-mobile.tsx      # Responsividade
│   │   ├── useBrandVoice.ts    # Gestão Brand Voice
│   │   └── useDashboard.ts     # Dados do dashboard
│   │
│   ├── 🔧 lib/                 # Utilitários e configurações
│   │   ├── utils.ts            # Helpers gerais (clsx, formatters)
│   │   ├── api.ts              # Cliente HTTP (axios/fetch)
│   │   ├── auth.ts             # Autenticação frontend
│   │   ├── supabase.ts         # Cliente Supabase
│   │   └── queryClient.ts      # Configuração React Query
│   │
│   └── 📝 types/               # Types específicos do frontend
│       ├── api.types.ts        # Tipos de response da API
│       └── ui.types.ts         # Tipos de componentes UI
```

### 📄 Responsabilidade das Pastas

#### `pages/` - Rotas da Aplicação
**Quando usar:** Para cada rota principal da aplicação  
**Convenção:** Um arquivo por rota, PascalCase  
**Exemplo:**
```typescript
// pages/Dashboard.tsx - Rota principal '/'
export default function Dashboard() {
  return (
    <div className="container mx-auto py-6">
      <h1>Digital Woof Dashboard</h1>
      {/* Componentes do dashboard */}
    </div>
  );
}
```

#### `components/` - Componentes Reutilizáveis
**Organização por contexto:**

```
components/
├── ui/                         # shadcn/ui - Design System
│   ├── button.tsx
│   ├── card.tsx
│   ├── input.tsx
│   └── [outros-componentes-ui]
│
├── dashboard/                  # Específicos do Dashboard
│   ├── StatsCards.tsx         # Cards de estatísticas
│   ├── PerformanceChart.tsx   # Gráficos de performance
│   └── QuickActions.tsx       # Ações rápidas
│
└── anamnesis/                 # Feature F-1 (quando implementada)
    ├── AnamnesisForm.tsx      # Formulário de entrada
    ├── ResultsViewer.tsx      # Visualização de resultados
    └── AnalysisCard.tsx       # Card de análise
```

**Convenção de nome:** PascalCase, descritivo e específico

#### `hooks/` - Lógica de Estado
**Quando criar um hook:**
- Lógica de estado complexa compartilhada entre componentes
- Integração com APIs (React Query)
- Lógica de UI que pode ser reutilizada

```typescript
// hooks/useBrandVoice.ts - Exemplo atual
export function useBrandVoice(userId: string) {
  return useQuery({
    queryKey: ['brandVoice', userId],
    queryFn: () => api.get(`/brand-voice/${userId}`),
    staleTime: 5 * 60 * 1000, // Cache por 5 min
  });
}
```

#### `lib/` - Utilitários e Configurações
**Arquivo por responsabilidade:**

```typescript
// lib/api.ts - Cliente HTTP centralizado
import axios from 'axios';

export const api = axios.create({
  baseURL: '/api',
  timeout: 10000,
});

// lib/utils.ts - Helpers gerais
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatDate(date: Date): string {
  return new Intl.DateTimeFormat('pt-BR').format(date);
}
```

---

## 🖥️ Backend - `server/`

### Estrutura Principal

```
server/
├── 🎯 index.ts                 # Entry point do servidor Express
├── 🔀 routes.ts                # Configuração centralizada de rotas
├── 💾 storage.ts               # Configuração de upload/storage
├── ⚡ vite.ts                  # Proxy Vite para dev
│
├── 🛡️ middleware/              # Middlewares Express
│   ├── auth.ts                # Autenticação JWT
│   ├── cors.ts                # CORS configuration
│   ├── validation.ts          # Validação Zod
│   └── error-handler.ts       # Tratamento de erros global
│
├── 🔀 routes/                  # Rotas por feature/domínio
│   ├── auth.ts               # /api/auth/* - Login, register
│   ├── users.ts              # /api/users/* - Gestão usuários  
│   ├── brand-voice.ts        # /api/brand-voice/* - F-2/F-3
│   ├── anamnesis.ts          # /api/anamnesis/* - F-1
│   └── [feature].ts          # Outras features conforme desenvolvimento
│
└── 🔧 services/               # Lógica de negócio
    ├── auth.service.ts       # Autenticação e autorização
    ├── anamnesis.service.ts  # F-1: Análise de sites/redes
    ├── brand-voice.service.ts # F-2/F-3: Gestão de marca
    ├── openai.service.ts     # Integração com IA
    └── [feature].service.ts  # Outros serviços
```

### 🔀 Responsabilidade das Pastas

#### `routes/` - Endpoints da API
**Organização por feature conforme PRD:**

```typescript
// routes/anamnesis.ts - Feature F-1
import { Router } from 'express';
import { anamnesisService } from '../services/anamnesis.service';
import { requireAuth } from '../middleware/auth';
import { validateRequest } from '../middleware/validation';
import { CreateAnalysisSchema } from '@shared/schema';

const router = Router();

// POST /api/anamnesis - Criar nova análise
router.post('/', 
  requireAuth, 
  validateRequest(CreateAnalysisSchema),
  async (req, res, next) => {
    try {
      const analysis = await anamnesisService.create({
        ...req.body,
        userId: req.user.id
      });
      res.status(201).json(analysis);
    } catch (error) {
      next(error);
    }
  }
);

export default router;
```

#### `services/` - Lógica de Negócio
**Um service por domínio/feature:**

```typescript
// services/anamnesis.service.ts - Feature F-1
import { db } from '@shared/db';
import { anamnesisAnalysis, anamnesisSource } from '@shared/schema';
import { logger } from '../lib/logger';

export class AnamnesisService {
  async create(data: CreateAnalysisDto): Promise<AnamnesisAnalysis> {
    const startTime = Date.now();
    
    try {
      // 1. Verificar duplicatas por URL normalizada
      const existingAnalysis = await this.findByNormalizedUrl(data.primaryUrl);
      if (existingAnalysis) {
        return existingAnalysis;
      }
      
      // 2. Criar análise
      const analysis = await db.insert(anamnesisAnalysis).values({
        userId: data.userId,
        primaryUrl: data.primaryUrl,
        status: 'queued'
      }).returning();
      
      // 3. Agendar processamento (fila)
      await this.scheduleAnalysis(analysis[0].id);
      
      logger.info('Analysis created successfully', {
        analysisId: analysis[0].id,
        userId: data.userId,
        duration: Date.now() - startTime
      });
      
      return analysis[0];
    } catch (error) {
      logger.error('Failed to create analysis', { error, data });
      throw error;
    }
  }
}

export const anamnesisService = new AnamnesisService();
```

#### `middleware/` - Cross-Cutting Concerns
**Responsabilidades específicas:**

```typescript
// middleware/auth.ts - Autenticação
export function requireAuth(req: Request, res: Response, next: NextFunction) {
  const token = req.headers.authorization?.replace('Bearer ', '');
  
  if (!token) {
    return res.status(401).json({ error: 'TOKEN_REQUIRED' });
  }
  
  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET!) as JwtPayload;
    req.user = decoded;
    next();
  } catch (error) {
    return res.status(401).json({ error: 'INVALID_TOKEN' });
  }
}

// middleware/validation.ts - Validação Zod
export function validateRequest(schema: ZodSchema) {
  return (req: Request, res: Response, next: NextFunction) => {
    const result = schema.safeParse(req.body);
    
    if (!result.success) {
      return res.status(400).json({
        error: 'VALIDATION_ERROR',
        details: result.error.format()
      });
    }
    
    req.body = result.data;
    next();
  };
}
```

---

## 🔗 Shared - `shared/`

### Estrutura e Responsabilidades

```
shared/
├── 📝 schema.ts               # Schema Drizzle + Zod (fonte única da verdade)
├── 🔧 types.ts               # Types compartilhados frontend/backend
├── 🗃️ db.ts                  # Configuração do banco (Supabase)
└── 📋 constants.ts           # Constantes do domínio
```

#### `schema.ts` - Fonte Única da Verdade
**Baseado no PRD - Modelo de Dados:**

```typescript
// Exemplo atual em shared/schema.ts
export const users = pgTable("users", {
  id: uuid("id").primaryKey().default(sql`gen_random_uuid()`),
  email: text("email").notNull().unique(),
  businessType: text("business_type").notNull(), // PRD: Personas por tipo
  // ...
});

export const anamnesisAnalysis = pgTable("anamnesis_analysis", {
  id: uuid("id").primaryKey().default(sql`gen_random_uuid()`),
  userId: uuid("user_id").references(() => users.id).notNull(),
  primaryUrl: text("primary_url").notNull(),
  status: text("status").notNull(), // queued, running, done, error
  // Multitenant conforme PRD Seção 5
  accountId: uuid("account_id").references(() => accounts.id).notNull(),
  // ...
});

// Schemas Zod derivados automaticamente
export const insertUserSchema = createInsertSchema(users);
export type User = typeof users.$inferSelect;
export type InsertUser = z.infer<typeof insertUserSchema>;
```

**Fluxo de mudanças no schema:**
1. Alterar `shared/schema.ts`
2. Executar `npm run db:push` (aplica no Supabase)
3. Types TypeScript atualizados automaticamente
4. Frontend e backend usam os mesmos types

---

## 📚 Documentação - `docs/`

### Organização por Propósito

```
docs/
├── 📖 README.md                # Índice principal (este arquivo)
├── 📝 CODE_GUIDELINES.md       # Padrões de código
├── 🏗️ PROJECT_STRUCTURE.md     # Estrutura (este arquivo)
├── 🤝 CONTRIBUTING.md          # Fluxo de contribuição
├── 🧠 DESIGN_DECISIONS.md      # Decisões técnicas
├── 🚨 TROUBLESHOOTING.md       # Soluções para problemas
├── 📚 GLOSSARY.md              # Definições de termos
├── ✅ TODO.md                  # Lacunas pendentes
│
├── architecture/               # Especificações técnicas
│   ├── SYSTEM_ARCHITECTURE.md # Visão geral da arquitetura
│   ├── DATABASE_SCHEMA.md     # Modelo de dados detalhado
│   └── API_CONTRACTS.md       # Contratos de API
│
├── features/                  # Especificações por funcionalidade
│   ├── F01_ANAMNESE_DIGITAL.md
│   ├── F02_ONBOARDING_MARCA.md
│   └── [outras features conforme PRD]
│
├── prd/                       # Product Requirements
│   ├── PRD.md                # Documento principal de requisitos
│   └── roadmap.md            # Cronograma e marcos
│
└── setup/                     # Guias de configuração
    └── SETUP_GUIDE.md        # Configuração inicial
```

---

## 🎯 Convenções de Adição de Arquivos

### ✅ Onde Adicionar Novos Arquivos

#### 🆕 Nova Feature (Ex: F-5 Calendário Editorial)

```
# 1. Backend (Business Logic)
server/
├── routes/calendar.ts          # POST /api/calendar, GET /api/calendar/:id
├── services/calendar.service.ts # Lógica de negócio do calendário
└── middleware/calendar-auth.ts  # Middleware específico (se necessário)

# 2. Frontend (UI)
client/src/
├── pages/Calendar.tsx          # Página principal do calendário
├── components/calendar/        # Componentes específicos
│   ├── CalendarGrid.tsx
│   ├── EventCard.tsx
│   └── AddEventModal.tsx
├── hooks/useCalendar.ts        # Estado e API calls
└── types/calendar.types.ts     # Types específicos do frontend

# 3. Shared (Contratos)
shared/
└── schema.ts                   # Adicionar tabelas calendarEvents, etc.

# 4. Documentação
docs/features/
└── F05_CALENDARIO_EDITORIAL.md # Especificação completa
```

#### 🧩 Novo Componente UI Reutilizável

```
client/src/components/ui/
└── data-table.tsx              # Componente genérico de tabela

# OU componente específico:
client/src/components/dashboard/
└── MetricsWidget.tsx           # Widget específico do dashboard
```

#### 🔧 Novo Utilitário/Helper

```
# Frontend
client/src/lib/
└── date-utils.ts               # Formatação de datas específica

# Backend  
server/services/
└── email.service.ts            # Serviço de envio de email

# Compartilhado
shared/
└── validation.ts               # Validações compartilhadas
```

### ❌ O que NÃO fazer

```bash
# ❌ Arquivos na raiz
DigitalWoofPlatform/
└── my-component.tsx            # Deve estar em client/src/components/

# ❌ Misturar responsabilidades
client/src/components/
└── ApiService.tsx              # API service deve estar em lib/

# ❌ Nomes genéricos demais
server/routes/
└── stuff.ts                    # Nome não descritivo

# ❌ Duplicação entre client/server
client/src/types/user.ts        # Types devem estar em shared/
server/types/user.ts            # Duplicação desnecessária
```

---

## 🔧 Scripts e Comandos

### 📦 Package.json - Scripts Principais

```json
{
  "scripts": {
    "dev": "NODE_ENV=development tsx server/index.ts",     // Servidor dev
    "build": "vite build && esbuild server/index.ts ...", // Build produção
    "start": "NODE_ENV=production node dist/index.js",    // Produção
    "check": "tsc",                                        // TypeScript check
    "db:push": "drizzle-kit push"                         // Sincronizar DB
  }
}
```

### 🚀 Fluxo de Desenvolvimento

```bash
# 1. Configuração inicial
npm install
cp .env.example .env    # Configurar variáveis
npm run db:push         # Sincronizar schema

# 2. Desenvolvimento diário  
npm run dev             # Inicia servidor (frontend + backend)
npm run check           # Verificar TypeScript
npm run db:push         # Após mudanças no schema

# 3. Antes de commit
npm run check           # Zero erros TypeScript
npm run lint            # Zero warnings ESLint  
npm run format          # Prettier aplicado
```

---

## 🗺️ Mapeamento PRD → Estrutura

### Features por Fase (Roadmap)

| Feature PRD | Localização Atual | Status | Próximos Arquivos |
|-------------|-------------------|--------|-------------------|
| **F-1** Anamnese Digital | `✅ Implementado` | Completo | - |
| **F-2** Onboarding Marca | `📁 client/src/pages/BrandOnboarding.tsx` | Planejado | `server/routes/brand-onboarding.ts` |
| **F-3** Brand Voice JSON | `📁 shared/schema.ts (brandVoices)` | Parcial | `server/services/brand-voice.service.ts` |
| **F-4** Manual de Marca | `📁 client/src/pages/BrandManual.tsx` | Planejado | `server/routes/brand-manual.ts` |
| **F-5** Calendário Editorial | 📅 Fase 2 | Não iniciado | `routes/calendar.ts`, `components/calendar/` |
| **F-6** Geração de Conteúdo | 📅 Fase 2 | Não iniciado | `services/content-generation.service.ts` |

### Arquivos por Responsabilidade

| Responsabilidade | Arquivos Atuais | Arquivo de Referência |
|------------------|-----------------|----------------------|
| **Autenticação** | `client/src/lib/auth.ts`, `server/middleware/auth.ts` | [CODE_GUIDELINES.md](CODE_GUIDELINES.md#segurança) |
| **Database** | `shared/schema.ts`, `shared/db.ts` | [DATABASE_SCHEMA.md](architecture/DATABASE_SCHEMA.md) |
| **API Routes** | `server/routes/*.ts` | [API_CONTRACTS.md](architecture/API_CONTRACTS.md) |
| **UI Components** | `client/src/components/**` | [DESIGN_SYSTEM.md](design/DESIGN_SYSTEM.md) |

---

## 🔄 Evolução da Estrutura

### Próximas Fases (Conforme Roadmap)

#### Fase 2 - Fábrica de Conteúdo
```
# Novos módulos esperados:
server/services/
├── content-planner.service.ts     # F-5: Calendário
├── content-generation.service.ts  # F-6: Geração IA
└── compliance-check.service.ts    # F-6: Validação compliance

client/src/pages/
├── ContentCalendar.tsx            # F-5: Interface calendário
└── ContentLibrary.tsx             # F-7: Biblioteca campanhas
```

#### Fase 3 - Piloto Automático
```
# Integrações externas:
server/integrations/
├── meta-api.service.ts           # F-9: Facebook/Instagram
├── google-business.service.ts    # F-9: Google Business Profile  
└── whatsapp-bsp.service.ts      # F-10: WhatsApp Business
```

### 📏 Métricas de Qualidade da Estrutura

**Objetivos:**
- ✅ **Localização:** Encontrar qualquer arquivo em < 10 segundos
- ✅ **Consistência:** 100% dos arquivos seguem convenção de nomes
- ✅ **Separação:** Zero imports diretos entre client/server (via shared)
- ✅ **Escalabilidade:** Estrutura suporta 50+ features sem reorganização

**Indicadores atuais:**
- 📁 **Organização:** 8/10 (boa separação, pode melhorar docs por feature)
- 🔧 **Consistência:** 9/10 (nomes claros, algumas exceções históricas)
- 🔗 **Coupling:** 9/10 (shared bem utilizado, minimal coupling)

---

## 🤝 Contribuindo com a Estrutura

### ✅ Checklist - Novo Arquivo

Antes de criar qualquer arquivo novo:

1. **📍 Localização correta?**
   - Component UI → `client/src/components/`
   - Business logic → `server/services/`
   - API endpoint → `server/routes/`
   - Shared types → `shared/`

2. **📝 Nome descritivo?**
   - PascalCase para componentes: `BrandVoiceProfile.tsx`
   - kebab-case para services: `anamnesis-agent.service.ts`
   - camelCase para hooks: `useBrandVoice.ts`

3. **🔗 Imports corretos?**
   - Client não importa diretamente de server
   - Usar paths configurados: `@/` para client, `@shared/` para shared

4. **📚 Documentação atualizada?**
   - Feature nova → criar `docs/features/FXX_NOME.md`
   - Component reutilizável → documentar no próprio arquivo
   - API nova → atualizar `docs/architecture/API_CONTRACTS.md`

### 🛠️ Refatoração da Estrutura

**Se precisar reorganizar arquivos existentes:**

1. **Discussão primeiro:** Abrir issue explicando motivo e impacto
2. **Migration plan:** Como outros desenvolvedores devem se adaptar
3. **Backward compatibility:** Manter imports funcionando temporariamente
4. **Documentação:** Atualizar todos os links afetados

---

*📚 Próximo passo: [Como Contribuir](CONTRIBUTING.md) - Fluxo completo de desenvolvimento*