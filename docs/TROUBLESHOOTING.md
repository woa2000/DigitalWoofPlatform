# 🚨 Troubleshooting - Digital Woof Platform

**Versão:** 1.0  
**Baseado em:** Problemas reais encontrados durante desenvolvimento  
**Objetivo:** Soluções rápidas para problemas comuns

---

## 🎯 Como Usar Este Guia

**Estrutura de cada problema:**
1. **Sintoma:** Como o problema se manifesta
2. **Causa:** Por que acontece
3. **Solução:** Passo-a-passo para resolver
4. **Prevenção:** Como evitar no futuro

**⚡ Tip:** Use `Ctrl/Cmd + F` para buscar por palavra-chave do seu erro.

---

## 🚀 Problemas de Setup/Configuração

### ❌ "Cannot connect to database" / "Connection timeout"

**Sintomas:**
```bash
Error: connect ETIMEDOUT
Database connection failed
500 Internal Server Error on /api/health
```

**Causas possíveis:**
1. `.env` não configurado ou incorreto
2. Supabase project pausado/inativo
3. Network/firewall bloqueando conexão
4. URL do banco incorreta

**Soluções:**

```bash
# 1. Verificar .env
cat .env | grep DATABASE_URL
# Deve ter formato: postgresql://[user]:[pass]@[host]:[port]/[db]

# 2. Testar conexão direta
npx drizzle-kit studio
# Se abrir interface = conexão OK

# 3. Regenerar .env do Supabase
# Vá em Supabase Dashboard > Settings > Database
# Copie nova Connection String

# 4. Verificar se Supabase está ativo
# Dashboard deve mostrar "Project is active"
```

**Prevenção:**
- Usar `.env.example` como template
- Documentar todas as variáveis obrigatórias
- Setup de health check em `/api/health`

---

### ❌ "Module not found" after git pull

**Sintomas:**
```bash
Error: Cannot resolve module '@/components/...' 
TypeScript: Cannot find module '@shared/schema'
npm run dev fails with import errors
```

**Causas:**
1. Dependências novas não instaladas
2. TypeScript paths desatualizados
3. Node modules corrompidos

**Soluções:**

```bash
# 1. Reinstalar dependências
rm -rf node_modules package-lock.json
npm install

# 2. Verificar TypeScript paths
npm run check
# Se falhar, verificar tsconfig.json paths

# 3. Restart TS server (VS Code)
# Cmd+Shift+P > "TypeScript: Restart TS Server"

# 4. Clear cache e restart
npm run dev --force
```

**Prevenção:**
- Sempre `npm install` após `git pull`
- Incluir `package-lock.json` no git
- Documentar mudanças de dependências no PR

---

### ❌ "Database schema out of sync"

**Sintomas:**
```bash
PostgreSQL error: relation "new_table" does not exist
Type error: Property 'newField' does not exist
Drizzle: Query failed - column doesn't exist
```

**Causas:**
1. Schema mudou mas não foi aplicado no banco
2. Branch com schema diferente
3. Rollback de migration não executado

**Soluções:**

```bash
# 1. Aplicar schema atual
npm run db:push
# ⚠️ CUIDADO: Pode perder dados em development

# 2. Verificar diferenças
npx drizzle-kit introspect
# Compara schema.ts com banco real

# 3. Reset completo (development only!)
# DANGER: Apaga todos os dados
npm run db:reset  # TODO: implementar este script

# 4. Sync manual via Supabase Dashboard
# SQL Editor > executar CREATE TABLE statements
```

**Prevenção:**
- Sempre `npm run db:push` após mudanças em `shared/schema.ts`
- Documentar schema changes no PR
- Backup antes de mudanças grandes

---

## 🔧 Problemas de Development

### ❌ TypeScript errors após mudanças

**Sintomas:**
```bash
TS2339: Property 'newField' does not exist on type 'User'
TS2345: Argument of type 'string' is not assignable to type 'number'
TS2322: Type 'undefined' is not assignable to type 'string'
```

**Causas:**
1. Schema mudou mas types não regenerados
2. Imports incorretos após refatoração
3. Strict null checks

**Soluções:**

```bash
# 1. Regenerar types
npm run check
# Se Drizzle types desatualizados:
npm run db:push

# 2. Fix imports automático (VS Code)
# Cmd+Shift+P > "TypeScript: Organize Imports"

# 3. Verificar type guards
// ❌ Problema:
const userName = user.name; // user pode ser undefined

// ✅ Solução:
const userName = user?.name ?? 'Anonymous';
if (user) {
  const userName = user.name; // agora é safe
}
```

**Debugging TypeScript:**
```bash
# Ver tipos inferred
# Hover sobre variável no VS Code
# Ou usar:
type DebugType<T> = T;
type UserType = DebugType<typeof user>; // Mostra tipo real
```

**Prevenção:**
- Usar TypeScript strict mode
- Type guards para todos os nullable values
- Explicitar tipos em APIs: `Promise<User[]>` não `Promise<any>`

---

### ❌ Infinite re-renders no React

**Sintomas:**
```bash
Warning: Maximum update depth exceeded
Browser trava/fica lento
RAM usage muito alto
Console com centenas de logs
```

**Causas mais comuns:**

```typescript
// ❌ Problema 1: useEffect sem dependências corretas
useEffect(() => {
  fetchData();
}); // Sem array de dependências = executa toda render

// ❌ Problema 2: setState dentro de render
function Component() {
  const [count, setCount] = useState(0);
  setCount(count + 1); // Executa toda render
  return <div>{count}</div>;
}

// ❌ Problema 3: Objeto/array como dependência
const data = { userId: 1 };
useEffect(() => {
  fetchUser(data);
}, [data]); // data é sempre novo objeto
```

**Soluções:**

```typescript
// ✅ Solução 1: Dependências corretas
useEffect(() => {
  fetchData();
}, [userId]); // Só executa quando userId muda

// ✅ Solução 2: setState em event handler
function Component() {
  const [count, setCount] = useState(0);
  
  const handleClick = () => {
    setCount(count + 1); // Só executa no click
  };
  
  return <button onClick={handleClick}>{count}</button>;
}

// ✅ Solução 3: useMemo para objetos estáveis
const data = useMemo(() => ({ userId: 1 }), []);
useEffect(() => {
  fetchUser(data);
}, [data]);

// ✅ Ou usar primitivos:
useEffect(() => {
  fetchUser({ userId: 1 });
}, [userId]); // userId é primitivo
```

**Debugging infinite renders:**
```bash
# 1. React DevTools Profiler
# Instalar extensão > aba Profiler > Record
# Mostra quais componentes re-renderizam

# 2. Console log em useEffect
useEffect(() => {
  console.log('Effect triggered', { userId, data });
  fetchData();
}, [userId, data]);

# 3. Use why-did-you-render (development)
npm install @welldone-software/why-did-you-render
```

---

### ❌ React Query not updating/caching incorrectly

**Sintomas:**
```bash
Data não atualiza após mutation
Stale data sendo mostrada
useQuery retorna cached data incorreta
Mutation success mas UI não reflete
```

**Causas e soluções:**

```typescript
// ❌ Problema 1: Query key inconsistente
function useBrandVoice(userId: string) {
  return useQuery({
    queryKey: ['brandVoice'], // ❌ Não inclui userId
    queryFn: () => fetchBrandVoice(userId),
  });
}

// ✅ Solução 1: Query key específica
function useBrandVoice(userId: string) {
  return useQuery({
    queryKey: ['brandVoice', userId], // ✅ Inclui todos os params
    queryFn: () => fetchBrandVoice(userId),
  });
}

// ❌ Problema 2: Não invalida cache após mutation
function useCreateBrandVoice() {
  return useMutation({
    mutationFn: createBrandVoice,
    // ❌ Cache não é invalidado
  });
}

// ✅ Solução 2: Invalidar cache relacionado
function useCreateBrandVoice() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: createBrandVoice,
    onSuccess: (data) => {
      // Invalida lista
      queryClient.invalidateQueries({ queryKey: ['brandVoice', data.userId] });
      // Ou atualiza diretamente
      queryClient.setQueryData(['brandVoice', data.userId], data);
    },
  });
}
```

**Debug React Query:**
```typescript
// 1. React Query DevTools
import { ReactQueryDevtools } from '@tanstack/react-query-devtools';

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <MyApp />
      <ReactQueryDevtools initialIsOpen={false} />
    </QueryClientProvider>
  );
}

// 2. Log query state
const { data, isLoading, error, isStale } = useBrandVoice(userId);
console.log('Query state:', { data, isLoading, error, isStale });
```

---

## 🔌 Problemas de API/Backend

### ❌ 500 Internal Server Error

**Sintomas:**
```bash
POST /api/anamnesis → 500
Console: "Something went wrong"
Frontend mostra error toast genérico
```

**Debugging:**

```bash
# 1. Verificar logs do servidor
npm run dev
# Terminal deve mostrar stack trace completo

# 2. Se logs não são claros, adicionar debug:
// server/routes/anamnesis.ts
app.post('/api/anamnesis', async (req, res) => {
  try {
    console.log('Request body:', req.body);
    const result = await anamnesisService.create(req.body);
    console.log('Service result:', result);
    res.json(result);
  } catch (error) {
    console.error('Detailed error:', error);
    console.error('Stack trace:', error.stack);
    res.status(500).json({ error: error.message });
  }
});

# 3. Testar endpoint isoladamente
curl -X POST http://localhost:3000/api/anamnesis \
  -H "Content-Type: application/json" \
  -d '{"primaryUrl": "https://example.com"}'
```

**Erros comuns:**

```typescript
// ❌ Validation error não tratado
app.post('/api/anamnesis', async (req, res) => {
  const data = CreateAnalysisSchema.parse(req.body); // ❌ Pode throw
  // ...
});

// ✅ Validation error tratado
app.post('/api/anamnesis', async (req, res) => {
  const validationResult = CreateAnalysisSchema.safeParse(req.body);
  if (!validationResult.success) {
    return res.status(400).json({
      error: 'VALIDATION_ERROR',
      details: validationResult.error.format()
    });
  }
  // ...
});

// ❌ Database error não tratado
async function createAnalysis(data) {
  const result = await db.insert(analysis).values(data); // ❌ Pode falhar
  return result;
}

// ✅ Database error tratado
async function createAnalysis(data) {
  try {
    const result = await db.insert(analysis).values(data);
    return result;
  } catch (error) {
    if (error.code === '23505') { // Unique constraint
      throw new Error('Analysis already exists for this URL');
    }
    throw error; // Re-throw outros erros
  }
}
```

---

### ❌ CORS errors

**Sintomas:**
```bash
Access to fetch at 'localhost:3000' from origin 'localhost:5173' has been blocked by CORS policy
Preflight request failed
OPTIONS request returning 404
```

**Causa:** Frontend (5173) tentando acessar Backend (3000) sem CORS configurado.

**Solução:**

```typescript
// server/index.ts - Verificar se CORS está configurado
import cors from 'cors';

app.use(cors({
  origin: ['http://localhost:5173', 'https://yourdomain.com'],
  credentials: true, // Se usar cookies/auth
  methods: ['GET', 'POST', 'PUT', 'DELETE'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));
```

**Development fix rápido:**
```typescript
// ⚡ Permitir qualquer origin em development
if (process.env.NODE_ENV === 'development') {
  app.use(cors({ origin: true }));
}
```

---

### ❌ JWT/Auth token expired or invalid

**Sintomas:**
```bash
401 Unauthorized
"TOKEN_REQUIRED" or "INVALID_TOKEN"
Redirect loop para login
Requests falham após algumas horas
```

**Debugging auth:**

```bash
# 1. Verificar token no localStorage
# Browser DevTools > Application > Local Storage
# Deve ter 'authToken' com JWT válido

# 2. Decodificar JWT
# Copiar token e colar em jwt.io
# Verificar exp (expiration) timestamp

# 3. Testar token manualmente
curl -H "Authorization: Bearer YOUR_TOKEN" \
  http://localhost:3000/api/protected-route
```

**Soluções:**

```typescript
// ❌ Problema 1: Token expiry não tratado
axios.interceptors.response.use(
  response => response,
  error => {
    // ❌ Não trata 401
    return Promise.reject(error);
  }
);

// ✅ Solução 1: Interceptor para refresh token
axios.interceptors.response.use(
  response => response,
  async error => {
    if (error.response?.status === 401) {
      // Token expirado - fazer logout ou refresh
      localStorage.removeItem('authToken');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

// ❌ Problema 2: JWT_SECRET não configurado
// server/.env missing JWT_SECRET

// ✅ Solução 2: Gerar secret forte
# .env
JWT_SECRET=your-super-secret-key-minimum-32-characters

// ❌ Problema 3: Token format incorreto
const token = localStorage.getItem('authToken');
headers: { Authorization: token } // ❌ Falta "Bearer "

// ✅ Solução 3: Format correto
const token = localStorage.getItem('authToken');
headers: { Authorization: `Bearer ${token}` }
```

---

## 🎨 Problemas de UI/Frontend

### ❌ Componentes shadcn/ui não funcionam

**Sintomas:**
```bash
Button component não renderiza estilos
Icon não aparece
ClassNames não aplicam cores/spacing
Components parecem unstyled
```

**Verificações:**

```bash
# 1. Tailwind CSS configurado?
# Verificar se components.json existe
cat components.json

# 2. Import do CSS global
# client/src/index.css deve ter:
@tailwind base;
@tailwind components;
@tailwind utilities;

# 3. shadcn components instalados?
ls client/src/components/ui/
# Deve ter button.tsx, card.tsx, etc.
```

**Problemas comuns:**

```typescript
// ❌ Problema 1: Import path incorreto
import { Button } from './ui/button'; // ❌ Path relativo

// ✅ Solução 1: Import absoluto
import { Button } from '@/components/ui/button';

// ❌ Problema 2: className override incorreto
<Button className="bg-red-500"> // ❌ Pode não funcionar
  Click me
</Button>

// ✅ Solução 2: Usar variant ou cn()
import { cn } from '@/lib/utils';

<Button className={cn("bg-red-500", className)}>
  Click me
</Button>
```

**Reinstalar shadcn component:**
```bash
# Se component específico tem problemas
npx shadcn-ui@latest add button
# Sobrescreve com versão mais recente
```

---

### ❌ Form validation not working

**Sintomas:**
```bash
Formulário submit sem validação
Error messages não aparecem
react-hook-form não funciona como esperado
Zod schema não valida
```

**Debugging forms:**

```typescript
// ✅ Template completo de form com validação
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';

const FormSchema = z.object({
  email: z.string().email('Email inválido'),
  password: z.string().min(6, 'Mínimo 6 caracteres'),
});

type FormData = z.infer<typeof FormSchema>;

function MyForm() {
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<FormData>({
    resolver: zodResolver(FormSchema), // ✅ Conecta Zod + RHF
  });

  const onSubmit = async (data: FormData) => {
    try {
      await apiCall(data);
    } catch (error) {
      console.error('Submit error:', error);
    }
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)}>
      <input
        {...register('email')} // ✅ Register input
        type="email"
        placeholder="Email"
      />
      {errors.email && ( // ✅ Show error
        <p className="text-red-500">{errors.email.message}</p>
      )}
      
      <button type="submit" disabled={isSubmitting}>
        {isSubmitting ? 'Loading...' : 'Submit'}
      </button>
    </form>
  );
}
```

**Problemas comuns:**

```typescript
// ❌ Problema 1: Esqueceu zodResolver
const form = useForm<FormData>({
  // ❌ Sem resolver = validação não funciona
});

// ❌ Problema 2: Schema e tipo inconsistentes
const FormSchema = z.object({ email: z.string() });
type FormData = { email: string; password: string }; // ❌ Diferente do schema

// ❌ Problema 3: register não chamado
<input type="email" placeholder="Email" /> // ❌ Sem {...register('email')}
```

---

## 📊 Problemas de Performance

### ❌ App lento/travando

**Sintomas:**
```bash
Interface demorada para responder
Scrolling não fluido
CPU usage alto no browser
RAM usage crescendo
```

**Debugging performance:**

```bash
# 1. React DevTools Profiler
# Chrome Extension > Components tab > Profiler
# Record interaction > Ver quais components são lentos

# 2. Chrome DevTools Performance
# F12 > Performance tab > Record
# Ver JavaScript execution time

# 3. Bundle analyzer
npm run build
npx vite-bundle-analyzer dist
# Ver tamanho dos chunks
```

**Soluções comuns:**

```typescript
// ❌ Problema 1: Re-renders desnecessários
function ParentComponent() {
  const [count, setCount] = useState(0);
  
  // ❌ Objeto sempre novo = child re-render sempre
  const config = { theme: 'dark', userId: 1 };
  
  return <ChildComponent config={config} />;
}

// ✅ Solução 1: useMemo para objetos estáveis
function ParentComponent() {
  const [count, setCount] = useState(0);
  
  const config = useMemo(() => ({
    theme: 'dark',
    userId: 1
  }), []); // ✅ Só cria uma vez
  
  return <ChildComponent config={config} />;
}

// ❌ Problema 2: Lista sem key otimizada
function ItemList({ items }) {
  return (
    <div>
      {items.map(item => ( // ❌ Sem key = re-render todo item
        <ItemComponent item={item} />
      ))}
    </div>
  );
}

// ✅ Solução 2: Key estável + memo
const ItemComponent = memo(function ItemComponent({ item }) {
  return <div>{item.name}</div>;
});

function ItemList({ items }) {
  return (
    <div>
      {items.map(item => (
        <ItemComponent key={item.id} item={item} /> // ✅ Key estável
      ))}
    </div>
  );
}

// ❌ Problema 3: Bundle muito grande
// import toda biblioteca só para usar uma função
import _ from 'lodash'; // ❌ 70KB para usar só debounce

// ✅ Solução 3: Import específico
import { debounce } from 'lodash-es'; // ✅ Tree-shaking
// Ou implementar função simples se possível
```

---

## 🔍 Debugging Tools & Commands

### 🛠️ Comandos Úteis para Diagnóstico

```bash
# TypeScript
npm run check          # Verificar erros TypeScript
npm run check:watch    # TypeScript em modo watch

# Database
npm run db:push        # Sincronizar schema
npx drizzle-kit studio # Interface visual DB
npx drizzle-kit introspect # Comparar schema vs DB

# Build & Bundle
npm run build          # Build de produção
npm run preview        # Preview do build
npx vite-bundle-analyzer dist # Analisar bundle size

# Network & APIs
curl -v http://localhost:3000/api/health # Testar endpoint
npx http-server dist   # Servir build estático

# Dependencies
npm audit              # Verificar vulnerabilidades
npm outdated           # Dependências desatualizadas
npm ls                 # Tree de dependências
```

### 🔧 Environment Debug

```bash
# Verificar versões
node --version         # >= 18.0.0
npm --version          # >= 9.0.0
git --version          # >= 2.30.0

# Verificar environment variables
echo $NODE_ENV
echo $DATABASE_URL | cut -c1-20  # Primeiros 20 chars (segurança)

# Verificar ports em uso
lsof -i :3000          # Backend port
lsof -i :5173          # Frontend port

# Verificar disk space
df -h                  # Espaço em disco
du -sh node_modules    # Tamanho do node_modules
```

### 🐛 Browser DevTools Checklist

**Console tab:**
- [ ] Nenhum error vermelho crítico
- [ ] Warnings amarelos investigados
- [ ] Network requests com status 200

**Network tab:**
- [ ] API calls retornando dados corretos
- [ ] Tempo de response < 2s (PRD requirement)
- [ ] No failed requests 4xx/5xx

**Application tab:**
- [ ] LocalStorage tem authToken válido
- [ ] Cookies corretos (se usar)
- [ ] Service Worker funcionando (se usar)

---

## 📋 Checklists Rápidos

### ✅ "Não está funcionando" - Debug Geral

```bash
# 1. Verificar basics (2 min)
[ ] npm run dev roda sem erros
[ ] http://localhost:5173 carrega
[ ] http://localhost:3000/api/health retorna 200
[ ] Browser console sem errors críticos

# 2. Verificar environment (1 min)
[ ] .env existe e tem DATABASE_URL
[ ] Node.js versão >= 18
[ ] npm install executado recentemente

# 3. Verificar código (3 min)
[ ] npm run check passa
[ ] git status limpo ou mudanças intencionais
[ ] Último git pull executado

# 4. Reset completo (5 min)
[ ] rm -rf node_modules && npm install
[ ] npm run db:push
[ ] npm run dev
```

### ✅ "Deploy não funciona" - Produção

```bash
# 1. Build local funciona?
[ ] npm run build sem erros
[ ] npm run preview carrega corretamente
[ ] Variáveis de ambiente de prod configuradas

# 2. Database produção
[ ] CONNECTION_STRING de prod diferente de dev
[ ] Schema aplicado: npm run db:push
[ ] Permissions/firewall corretos

# 3. Environment variables
[ ] Todas as vars do .env.example configuradas
[ ] JWT_SECRET diferente de dev
[ ] URLs de APIs externas corretas
```

---

## 🆘 Quando Pedir Ajuda

### ❓ Antes de Abrir Issue

**Informações obrigatórias:**
```markdown
## 🐛 Bug Report

**Descrição:** O que deveria acontecer vs o que está acontecendo

**Steps to reproduce:**
1. Vá para ...
2. Clique em ...
3. Veja erro ...

**Environment:**
- OS: [Windows/Mac/Linux]
- Node version: [18.x.x]
- Browser: [Chrome/Safari/Firefox + version]
- Branch: [main/feature/...]
- Last commit: [git log --oneline -1]

**Error logs:**
```
[paste complete error message]
```

**Screenshots:** 
[if applicable]

**What I tried:**
- [ ] Checked this troubleshooting guide
- [ ] npm install && npm run dev
- [ ] npm run check passed
- [ ] Browser devtools checked
```

### 🚨 Problemas Críticos (Pedir Ajuda Imediatamente)

- 🔒 **Security issue:** Potencial vulnerabilidade
- 💾 **Data loss:** Dados deletados/corrompidos
- 🔥 **Production down:** Site/API indisponível
- 🔐 **Auth broken:** Ninguém consegue fazer login

### 💡 Problemas Normais (Seguir Processo)

- 🐛 **Feature bug:** Funcionalidade não funciona como esperado
- 🎨 **UI issue:** Layout quebrado, styling incorreto
- 📝 **Documentation:** Docs incorretas/desatualizadas
- 🔧 **DX issue:** Developer experience pode melhorar

---

*📚 Próximo passo: [Glossário](GLOSSARY.md) - Definições de termos técnicos*