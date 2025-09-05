# 📝 Diretrizes de Código - Digital Woof Platform

**Versão:** 1.0  
**Baseado em:** PRD v1.0 + Roadmap v1.0  
**Aplicação:** Obrigatória para todos os PRs  

---

## 🎯 Filosofia

**Princípio central:** Código deve ser **autoexplicativo, consistente e seguro**. Se você precisa de comentários extensos para explicar o que faz, provavelmente pode ser simplificado.

**Baseado no PRD (Seção 5 - NFRs):**
- ✅ Segurança em primeiro lugar (OAuth2, criptografia, RBAC)
- ✅ Performance (latência p95 ≤ 2s por operação UI)
- ✅ Escalabilidade multitenant
- ✅ Observabilidade (logs estruturados, métricas)

---

## 🛠️ Stack e Ferramentas

### Obrigatórias (configuradas no projeto)
- **TypeScript 5.6+** - Tipagem estrita obrigatória
- **ESLint** - Linting automático
- **Prettier** - Formatação consistente  
- **Drizzle ORM** - Type-safe database queries
- **Zod** - Validação de schemas
- **React Query** - Estado servidor/cache

### Comandos de verificação
```bash
# Antes de cada commit (obrigatório)
npm run check          # TypeScript check
npm run lint           # ESLint
npm run format         # Prettier

# Durante desenvolvimento
npm run dev            # Servidor com hot reload
npm run db:push        # Sincronizar schema DB
```

---

## 📁 Organização de Arquivos

### ✅ Convenções de Nomenclatura

#### Arquivos e Pastas
```bash
# ✅ CERTO
components/BrandVoiceProfile.tsx     # PascalCase para componentes React
hooks/useBrandVoice.ts              # camelCase com prefixo 'use'
services/anamnesis-agent.service.ts  # kebab-case para services
types/brand-voice.types.ts          # kebab-case para types
utils/url-normalizer.util.ts        # kebab-case para utils

# ❌ ERRADO  
components/brandvoiceprofile.tsx     # Sem separação clara
hooks/BrandVoiceHook.ts             # Sem prefixo 'use'
services/AnamnesisAgent.ts          # Sem sufixo '.service'
```

#### Variáveis e Funções
```typescript
// ✅ CERTO
const brandVoiceData = await fetchBrandVoice(userId);
const isAnalysisComplete = analysis.status === 'done';
const MAX_ANALYSIS_TIMEOUT = 120000; // Constantes em UPPER_SNAKE_CASE

function generateBrandVoiceJson(analysis: AnamnesisAnalysis): BrandVoiceJson {
  // Funções em camelCase
}

// ❌ ERRADO
const brand_voice_data = await fetchBrandVoice(userId);  // snake_case não
const IsAnalysisComplete = true;                         // PascalCase só para classes/tipos
const maxAnalysisTimeout = 120000;                       // Constantes em camelCase não
```

---

## 🔧 TypeScript - Regras Obrigatórias

### ✅ Tipagem Explícita Sempre

**Baseado no PRD (requisito 3.2):** "Todas as funções devem ter tipagem explícita em TypeScript"

```typescript
// ✅ CERTO
interface BrandVoiceApiResponse {
  id: string;
  name: string;
  tone: 'profissional-amigavel' | 'empatico' | 'tecnico';
  createdAt: Date;
}

async function fetchBrandVoice(userId: string): Promise<BrandVoiceApiResponse> {
  const response = await api.get<BrandVoiceApiResponse>(`/brand-voice/${userId}`);
  return response.data;
}

// Com error handling obrigatório
async function createAnalysis(data: CreateAnalysisDto): Promise<Result<Analysis, ApiError>> {
  try {
    const response = await api.post<Analysis>('/analysis', data);
    return { success: true, data: response.data };
  } catch (error) {
    logger.error('Failed to create analysis', { error, userId: data.userId });
    return { success: false, error: new ApiError('CREATE_ANALYSIS_FAILED') };
  }
}

// ❌ ERRADO
async function fetchBrandVoice(userId) {  // Sem tipagem nos parâmetros
  const response = await api.get(`/brand-voice/${userId}`);
  return response.data;  // Sem tipagem do retorno
}

// ❌ ERRADO - Uso de 'any'
function processAnalysis(data: any): any {
  return data.someProperty;
}
```

### ✅ Schemas Zod para Validação

**Baseado no PRD (Seção 7 - Regras de Negócio):** Validação obrigatória de inputs

```typescript
// ✅ CERTO - Schema Zod primeiro
const CreateAnalysisSchema = z.object({
  primaryUrl: z.string().url('URL inválida'),
  socialUrls: z.array(z.string().url()).max(10, 'Máximo 10 redes sociais'),
  businessType: z.enum(['veterinaria', 'petshop', 'banho_tosa', 'hotel_pet'])
});

type CreateAnalysisDto = z.infer<typeof CreateAnalysisSchema>;

// Validação no controller
app.post('/analysis', async (req, res) => {
  const validationResult = CreateAnalysisSchema.safeParse(req.body);
  
  if (!validationResult.success) {
    return res.status(400).json({
      error: 'VALIDATION_ERROR',
      details: validationResult.error.format()
    });
  }
  
  const analysis = await anamnesisService.create(validationResult.data);
  res.json(analysis);
});

// ❌ ERRADO - Sem validação
app.post('/analysis', async (req, res) => {
  const analysis = await anamnesisService.create(req.body);  // Perigoso!
  res.json(analysis);
});
```

---

## 🗃️ Banco de Dados - Drizzle ORM

### ✅ Queries Type-Safe

**Baseado no PRD (Seção 6 - Arquitetura):** "Supabase (Postgres, multitenant)"

```typescript
// ✅ CERTO - Type-safe com Drizzle
async function findAnalysisByUser(userId: string): Promise<AnamnesisAnalysis[]> {
  return await db
    .select()
    .from(anamnesisAnalysis)
    .where(eq(anamnesisAnalysis.userId, userId))
    .orderBy(desc(anamnesisAnalysis.createdAt));
}

// Com joins tipados
async function getAnalysisWithSources(analysisId: string) {
  return await db
    .select({
      analysis: anamnesisAnalysis,
      sources: anamnesisSource,
    })
    .from(anamnesisAnalysis)
    .leftJoin(anamnesisSource, eq(anamnesisAnalysis.id, anamnesisSource.analysisId))
    .where(eq(anamnesisAnalysis.id, analysisId));
}

// ❌ ERRADO - SQL raw sem tipagem
async function findAnalysisByUser(userId: string) {
  return await db.execute(sql`
    SELECT * FROM anamnesis_analysis WHERE user_id = ${userId}
  `);  // Sem type safety
}
```

### ✅ Migrations e Schema

```typescript
// ✅ CERTO - Schema no shared/schema.ts
export const anamnesisAnalysis = pgTable("anamnesis_analysis", {
  id: uuid("id").primaryKey().default(sql`gen_random_uuid()`),
  userId: uuid("user_id").references(() => users.id).notNull(),
  primaryUrl: text("primary_url").notNull(),
  status: text("status").$type<'queued' | 'running' | 'done' | 'error'>().notNull(),
  // Multitenant conforme PRD (Seção 5 - NFRs)
  accountId: uuid("account_id").references(() => accounts.id).notNull(),
  createdAt: timestamp("created_at").default(sql`now()`).notNull(),
});

// Migration command obrigatório após mudanças
// npm run db:push
```

---

## ⚛️ React - Componentes e Hooks

### ✅ Componentes Funcionais com TypeScript

```typescript
// ✅ CERTO - Props interface clara
interface BrandVoiceProfileProps {
  brandVoice: BrandVoice;
  onEdit: (id: string) => void;
  isLoading?: boolean;
}

export function BrandVoiceProfile({ 
  brandVoice, 
  onEdit, 
  isLoading = false 
}: BrandVoiceProfileProps) {
  const handleEditClick = useCallback(() => {
    onEdit(brandVoice.id);
  }, [onEdit, brandVoice.id]);

  if (isLoading) {
    return <Skeleton className="h-48 w-full" />;
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>{brandVoice.name}</CardTitle>
      </CardHeader>
      {/* ... */}
    </Card>
  );
}

// ❌ ERRADO - Sem tipagem de props
export function BrandVoiceProfile({ brandVoice, onEdit }) {
  return <div>{brandVoice.name}</div>;
}
```

### ✅ Custom Hooks com React Query

**Baseado no PRD (Seção 5 - NFRs):** "Performance com latência p95 ≤ 2s"

```typescript
// ✅ CERTO - Hook com cache e error handling
export function useBrandVoice(userId: string) {
  return useQuery({
    queryKey: ['brandVoice', userId],
    queryFn: () => brandVoiceService.getByUserId(userId),
    staleTime: 5 * 60 * 1000, // 5 min cache
    retry: 3,
    retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 30000),
  });
}

export function useCreateBrandVoice() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: brandVoiceService.create,
    onSuccess: (data) => {
      // Invalidar cache relacionado
      queryClient.invalidateQueries({ queryKey: ['brandVoice', data.userId] });
      toast.success('Brand Voice criado com sucesso!');
    },
    onError: (error) => {
      logger.error('Failed to create brand voice', { error });
      toast.error('Erro ao criar Brand Voice. Tente novamente.');
    },
  });
}

// ❌ ERRADO - useState para dados do servidor
const [brandVoice, setBrandVoice] = useState(null);

useEffect(() => {
  fetchBrandVoice(userId).then(setBrandVoice);  // Sem cache, error handling
}, [userId]);
```

---

## 🔒 Segurança e Error Handling

### ✅ Tratamento de Erros Obrigatório

**Baseado no PRD (Seção 5 - NFRs):** "Segurança OAuth2, logs estruturados"

```typescript
// ✅ CERTO - Error handling completo
class ApiError extends Error {
  constructor(
    public code: string,
    public message: string,
    public statusCode: number = 500
  ) {
    super(message);
    this.name = 'ApiError';
  }
}

async function generateContent(prompt: string, brandVoiceId: string): Promise<Result<string, ApiError>> {
  try {
    // Rate limiting check (PRD - Seção 5)
    await rateLimiter.checkLimit(brandVoiceId);
    
    const response = await openai.chat.completions.create({
      model: 'gpt-4',
      messages: [{ role: 'user', content: prompt }],
      max_tokens: 500,
    });
    
    // Log estruturado conforme PRD
    logger.info('Content generated successfully', {
      brandVoiceId,
      tokenCount: response.usage?.total_tokens,
      duration: Date.now() - startTime
    });
    
    return { success: true, data: response.choices[0].message.content };
    
  } catch (error) {
    // Log de erro estruturado
    logger.error('Content generation failed', {
      error: error.message,
      brandVoiceId,
      prompt: prompt.substring(0, 100) + '...' // Não logar prompt completo
    });
    
    if (error.code === 'rate_limit_exceeded') {
      return { success: false, error: new ApiError('RATE_LIMIT', 'Limite de uso excedido', 429) };
    }
    
    return { success: false, error: new ApiError('GENERATION_FAILED', 'Falha na geração de conteúdo') };
  }
}

// ❌ ERRADO - Sem tratamento de erro
async function generateContent(prompt: string, brandVoiceId: string): Promise<string> {
  const response = await openai.chat.completions.create({
    model: 'gpt-4',
    messages: [{ role: 'user', content: prompt }],
  });
  
  return response.choices[0].message.content;  // E se falhar?
}
```

### ✅ Validação de Autorização

```typescript
// ✅ CERTO - Middleware de autorização
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
    logger.warn('Invalid token attempt', { token: token.substring(0, 10) + '...' });
    return res.status(401).json({ error: 'INVALID_TOKEN' });
  }
}

// ✅ CERTO - Verificação de ownership
export async function requireOwnership(resourceId: string, userId: string): Promise<boolean> {
  const resource = await db.select().from(anamnesisAnalysis)
    .where(and(
      eq(anamnesisAnalysis.id, resourceId),
      eq(anamnesisAnalysis.userId, userId)
    ));
    
  return resource.length > 0;
}

// Uso no controller
app.get('/analysis/:id', requireAuth, async (req, res) => {
  const hasAccess = await requireOwnership(req.params.id, req.user.id);
  
  if (!hasAccess) {
    return res.status(403).json({ error: 'FORBIDDEN' });
  }
  
  // Continuar com a lógica...
});

// ❌ ERRADO - Sem verificação de ownership
app.get('/analysis/:id', async (req, res) => {
  const analysis = await getAnalysis(req.params.id);  // Qualquer um pode acessar!
  res.json(analysis);
});
```

---

## 📊 Logging e Observabilidade

### ✅ Logs Estruturados

**Baseado no PRD (Seção 5 - NFRs):** "Logs estruturados; métricas; traces; auditoria"

```typescript
// ✅ CERTO - Logger estruturado
interface LogContext {
  userId?: string;
  analysisId?: string;
  duration?: number;
  error?: Error;
  [key: string]: any;
}

class Logger {
  info(message: string, context: LogContext = {}) {
    console.log(JSON.stringify({
      level: 'info',
      message,
      timestamp: new Date().toISOString(),
      ...context
    }));
  }
  
  error(message: string, context: LogContext = {}) {
    console.error(JSON.stringify({
      level: 'error',
      message,
      timestamp: new Date().toISOString(),
      stack: context.error?.stack,
      ...context
    }));
  }
}

export const logger = new Logger();

// Uso em serviços
async function createAnalysis(data: CreateAnalysisDto): Promise<Analysis> {
  const startTime = Date.now();
  
  try {
    const analysis = await anamnesisService.create(data);
    
    logger.info('Analysis created successfully', {
      userId: data.userId,
      analysisId: analysis.id,
      duration: Date.now() - startTime
    });
    
    return analysis;
  } catch (error) {
    logger.error('Failed to create analysis', {
      userId: data.userId,
      duration: Date.now() - startTime,
      error
    });
    throw error;
  }
}

// ❌ ERRADO - Logs não estruturados
console.log(`User ${userId} created analysis`);  // Difícil de filtrar/analisar
console.error(error);  // Sem contexto
```

---

## 🧪 Testes (Pendente - TODO)

**Status:** Definições em aberto conforme [TODO.md](TODO.md)

### Padrões Planejados
- **Unitários:** Jest + Testing Library
- **Integração:** Supertest para APIs
- **E2E:** Playwright (TBD)

### Cobertura Mínima (Meta)
- 80% para serviços críticos (anamnesis, brand-voice)
- 60% para componentes UI
- 100% para funções de validação/segurança

---

## 📝 Comentários e Documentação

### ✅ Quando Comentar

```typescript
// ✅ CERTO - Comentar decisões de negócio complexas
function calculateComplianceScore(analysis: AnamnesisAnalysis): number {
  // Conforme PRD Seção 7: Score baseado em presença de informações críticas
  // Identidade (30%) + Personas (25%) + UX (25%) + Ecossistema (20%)
  const identityScore = analysis.identity ? 0.3 : 0;
  const personasScore = analysis.personas?.length > 0 ? 0.25 : 0;
  const uxScore = analysis.userExperience ? 0.25 : 0;
  const ecosystemScore = analysis.ecosystem ? 0.2 : 0;
  
  return identityScore + personasScore + uxScore + ecosystemScore;
}

// ✅ CERTO - Documentar APIs públicas
/**
 * Normaliza URL removendo trailing slash, www, e convertendo para lowercase
 * Usado para deduplicação de análises conforme PRD F-1
 * 
 * @param url - URL original informada pelo usuário
 * @returns URL normalizada para comparação
 * @example normalizeUrl('https://www.Example.com/') // 'https://example.com'
 */
export function normalizeUrl(url: string): string {
  return url.toLowerCase()
    .replace(/^https?:\/\/(www\.)?/, 'https://')
    .replace(/\/$/, '');
}

// ❌ ERRADO - Comentar o óbvio
const userId = req.user.id;  // Pega o ID do usuário
if (userId) {  // Se o usuário tem ID
  // ...
}
```

---

## 🚨 Checklist de Code Review

### ✅ Antes de Abrir PR

- [ ] **TypeScript:** Sem erros de compilação (`npm run check`)
- [ ] **ESLint:** Sem warnings (`npm run lint`)
- [ ] **Prettier:** Código formatado (`npm run format`)
- [ ] **Testes:** Todos passando (quando implementados)
- [ ] **Logs:** Eventos importantes logados com contexto
- [ ] **Errors:** Tratamento adequado de erros
- [ ] **Security:** Validação de inputs e autorização
- [ ] **Performance:** Queries otimizadas, cache quando apropriado

### ✅ Durante Code Review

- [ ] **Tipagem:** Todas as funções tipadas explicitamente
- [ ] **Nomenclatura:** Segue convenções do projeto
- [ ] **Responsabilidade:** Cada função tem uma responsabilidade clara
- [ ] **PRD Compliance:** Implementação alinhada com requisitos
- [ ] **Documentação:** APIs públicas documentadas

---

## 🔄 Evolução das Diretrizes

Esta documentação será atualizada conforme o projeto evolui nas próximas fases:

- **Fase 2:** Padrões para geração de conteúdo e calendário editorial
- **Fase 3:** Guidelines para integrações (Meta, Google, WhatsApp)
- **Fase 4:** Padrões para métricas e alertas

**Sempre consulte a versão mais recente neste arquivo antes de implementar novas features.**

---

*📚 Próximo passo: [Estrutura do Projeto](PROJECT_STRUCTURE.md) - Entenda como organizar seus arquivos*