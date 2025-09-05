# 📚 Glossário - Digital Woof Platform

**Versão:** 1.0  
**Objetivo:** Definições claras de termos técnicos e de negócio  
**Audiência:** Toda a equipe (desenvolvedores, product, stakeholders)

---

## 🎯 Como Usar

**Convenções:**
- **Negrito:** Termo principal  
- *Itálico:* Sinônimos ou termos relacionados  
- 🔗 Links: Referências para documentação adicional  
- 📝 Exemplo: Casos práticos de uso

**Organização:** Alfabética com categorias por contexto

---

## 🏢 Termos de Negócio

### **Anamnese Digital**
*Sinônimos: Análise de Marca, Diagnóstico Digital*

Processo automatizado de análise da presença digital de uma marca (site + redes sociais) realizado por agente de IA. Gera diagnóstico estratégico com identidade, personas, UX e recomendações.

📝 **Exemplo:** Cliente informa URL "clinicaamigopet.com" + Instagram. IA analisa conteúdo público e gera relatório com tom de voz, público-alvo e sugestões de melhoria.

🔗 **Referência:** [F-1: Anamnese Digital](features/F01_ANAMNESE_DIGITAL.md)

---

### **Brand Voice JSON**
*Sinônimos: Perfil de Marca, Voice Profile*

Artefato central em formato JSON que contém a "personalidade digital" da marca: tom de voz, paleta de cores, termos preferidos/proibidos, CTAs padrão. Usado por todos os módulos de IA para manter consistência.

📝 **Exemplo:**
```json
{
  "brand": {"name": "Clínica Amigo Pet", "segment": "pet"},
  "voice": {
    "tone": {"confiança": 0.8, "acolhimento": 0.9},
    "lexicon": {"prefer": ["tutor"], "avoid": ["dono"]}
  }
}
```

🔗 **Referência:** [PRD Seção 4.1 F-3](prd/PRD.md#f3-brand-voice-json)

---

### **BSP (Business Solution Provider)**
*Sinônimos: WhatsApp Business Provider*

Parceiro oficial do WhatsApp que oferece API para envio de mensagens transacionais em escala. Necessário para implementar Jornadas de Recall via WhatsApp.

📝 **Exemplo:** 360Dialog, Twilio, MessageBird são BSPs que permitem enviar "Lembre-se: vacina do Rex vence amanhã!" via WhatsApp Business API.

🔗 **Referência:** [PRD Seção 4.3 F-10](prd/PRD.md#f10-jornadas-simples)

---

### **Compliance Check**
*Sinônimos: Validação de Conformidade, Content Moderation*

Processo automatizado que verifica se conteúdo gerado por IA está aderente às diretrizes do setor pet (sem promessas médicas, linguagem apropriada, termos permitidos).

📝 **Exemplo:** IA gera "Nossa vacina cura todas as doenças" → Compliance detecta "promessa médica" → Reprova conteúdo → Sugere "Nossa vacina ajuda na prevenção".

🔗 **Referência:** [PRD Seção 7](prd/PRD.md#regras-de-negócio)

---

### **Jornadas de Recall**
*Sinônimos: Fluxos de Retorno, Customer Journey Automation*

Sequencias automatizadas de mensagens (email/WhatsApp) para lembrar clientes de serviços periódicos como vacinação, vermifugação, retorno de banho.

📝 **Exemplo:** Cliente faz upload de CSV com "Rex, vacina em 15/09". Sistema envia automaticamente: 7 dias antes → WhatsApp lembrete; 1 dia antes → SMS; 1 dia depois → reagendamento.

🔗 **Referência:** [PRD Seção 4.3 F-10](prd/PRD.md#f10-jornadas-simples)

---

### **Multitenant**
*Sinônimos: Multi-inquilino, SaaS Architecture*

Arquitetura onde uma única instância da aplicação serve múltiplos clientes ("tenants") com isolamento lógico de dados. Cada clínica/pet shop é um tenant separado.

📝 **Exemplo:** Clínica A e Pet Shop B usam a mesma plataforma, mas nunca vêem dados um do outro. Implementado via PostgreSQL Row Level Security (RLS).

🔗 **Referência:** [PRD Seção 5 NFRs](prd/PRD.md#requisitos-não-funcionais)

---

### **Personas Pet**
*Sinônimos: Arquetipos de Cliente, Público-Alvo*

Perfis padronizados de clientes do setor pet identificados pela Anamnese Digital: "Tutor Ansioso", "Família com Crianças", "Idoso Companheiro", "Jovem Urbano".

📝 **Exemplo:** Persona "Tutor Ansioso" → Tom empático, informações detalhadas sobre saúde, CTAs como "Tire suas dúvidas no WhatsApp".

🔗 **Referência:** [PRD Seção 3](prd/PRD.md#personas--usuários-alvo)

---

### **Time-to-Publish**
*Sinônimos: TTP, Tempo de Publicação*

Métrica de eficiência: tempo entre aprovação de conteúdo e sua publicação efetiva nas redes sociais.

📝 **Exemplo:** Veterinario aprova post sobre vacinação às 14h30 → Sistema publica automaticamente no Instagram às 14h32 → TTP = 2 minutos.

🎯 **Meta PRD:** < 5 minutos

---

## 💻 Termos Técnicos

### **API Rate Limit**
*Sinônimos: Throttling, Quota Limit*

Limite de requisições por tempo impostas por APIs externas (OpenAI, Meta, Google). Requer estratégias de retry e cache para evitar bloqueios.

📝 **Exemplo:** OpenAI permite 3.500 requests/min. Se exceder, retorna HTTP 429. Sistema deve implementar exponential backoff: 1s → 2s → 4s → 8s.

🔗 **Referência:** [CODE_GUIDELINES.md - Error Handling](CODE_GUIDELINES.md#error-handling)

---

### **Circuit Breaker**
*Sinônimos: Disjuntor, Failure Protection*

Padrão que interrompe automaticamente requisições para serviço que está falhando, evitando efeito cascata. Especialmente importante para custos de IA.

📝 **Exemplo:** Se OpenAI API falha 5 vezes seguidas, circuit breaker "abre" por 60s. Durante esse tempo, retorna erro amigável sem tentar API. Após 60s, tenta novamente.

🔗 **Referência:** [DESIGN_DECISIONS.md - AI Integration](DESIGN_DECISIONS.md#aiml-integration)

---

### **Drizzle ORM**
*Sinônimos: Type-safe ORM, SQL Builder*

Biblioteca TypeScript para interação type-safe com banco PostgreSQL. Alternativa performática ao Prisma com queries SQL nativas.

📝 **Exemplo:**
```typescript
// Type-safe query
const analysis = await db
  .select()
  .from(anamnesisAnalysis)
  .where(eq(anamnesisAnalysis.userId, userId));
// ↑ TypeScript sabe que analysis é AnamnesisAnalysis[]
```

🔗 **Referência:** [CODE_GUIDELINES.md - Database](CODE_GUIDELINES.md#banco-de-dados)

---

### **HMR (Hot Module Replacement)**
*Sinônimos: Hot Reload, Live Reload*

Funcionalidade do Vite que atualiza módulos JavaScript em tempo real durante desenvolvimento, sem perder estado da aplicação.

📝 **Exemplo:** Altera cor de um botão em `Button.tsx` → Browser atualiza instantaneamente sem reload completo → Formulário preenchido continua intacto.

🎯 **Performance atual:** < 100ms (target: < 200ms)

---

### **Idempotência**
*Sinônimos: Operação Idempotente, Safe Retry*

Propriedade onde executar a mesma operação múltiplas vezes produz o mesmo resultado. Essencial para APIs e processamento de pagamentos.

📝 **Exemplo:** POST /api/anamnesis com mesma URL → Primeira chamada cria análise → Chamadas subsequentes retornam análise existente (não criam duplicata).

🔗 **Implementação:** Hash da URL normalizada como chave de deduplicação

---

### **JWT (JSON Web Token)**
*Sinônimos: Bearer Token, Access Token*

Padrão de token stateless para autenticação. Contém informações do usuário codificadas e assinadas, eliminando necessidade de sessões no servidor.

📝 **Exemplo:**
```
eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.
eyJzdWIiOiIxMjM0NTY3ODkwIiwibmFtZSI6IkpvaG4gRG9lIiwiaWF0IjoxNTE2MjM5MDIyfQ.
SflKxwRJSMeKKF2QT4fwpMeJf36POk6yJV_adQssw5c
```

🔗 **Configuração:** Expira em 24h, renovado via refresh token

---

### **Lazy Loading**
*Sinônimos: Code Splitting, Dynamic Import*

Técnica de carregar código JavaScript apenas quando necessário, reduzindo bundle inicial.

📝 **Exemplo:**
```typescript
// Carregar componente apenas quando rota é acessada
const Dashboard = lazy(() => import('./pages/Dashboard'));

// Carregar biblioteca pesada apenas quando usuário clica
const handleExport = async () => {
  const { jsPDF } = await import('jspdf');
  // usar jsPDF...
};
```

🎯 **Meta:** Bundle inicial < 500KB gzipped

---

### **Middleware**
*Sinônimos: Interceptor, Handler Chain*

Função que executa entre request HTTP e response, permitindo autenticação, logging, validação, etc.

📝 **Exemplo:**
```typescript
// Middleware de autenticação
app.use('/api/protected', requireAuth);

// Request → requireAuth() → route handler → response
```

🔗 **Implementação:** [server/middleware/](../server/middleware/)

---

### **Monorepo**
*Sinônimos: Mono-repository, Single Repository*

Estratégia de desenvolvimento onde frontend, backend e código compartilhado ficam no mesmo repositório Git.

📝 **Exemplo:**
```
DigitalWoofPlatform/
├── client/     # Frontend React
├── server/     # Backend Express  
└── shared/     # Types + schemas compartilhados
```

🎯 **Benefícios:** Zero inconsistência de types, easier code sharing, atomic commits

---

### **OAuth2**
*Sinônimos: Open Authorization, Delegated Authorization*

Protocolo padrão para autorização segura. Permite aplicação acessar APIs de terceiros (Meta, Google) em nome do usuário.

📝 **Exemplo:** Usuário clica "Conectar Instagram" → Redireciona para Meta → Meta retorna authorization code → Trocamos por access token → Podemos publicar posts.

🔗 **Fluxo:** Authorization Code Grant (mais seguro para web apps)

---

### **p95 Latency**
*Sinônimos: 95th Percentile, Performance Metric*

Métrica que indica que 95% das requisições são mais rápidas que este valor. Mais realista que média por ignorar outliers extremos.

📝 **Exemplo:** 100 requests com tempos: 90 rápidas (< 100ms), 5 lentas (500ms), 5 muito lentas (2s). p95 = 500ms.

🎯 **Meta PRD:** p95 ≤ 2s para operações de UI

---

### **RBAC (Role-Based Access Control)**
*Sinônimos: Controle de Acesso, Permission System*

Sistema de autorização baseado em perfis de usuário. Cada role tem permissões específicas.

📝 **Exemplo:**
- **Veterinário:** Pode aprovar conteúdo médico, acessar análises, publicar
- **Assistente:** Pode criar conteúdo, não pode aprovar  
- **Agência:** Pode gerenciar múltiplas contas, acesso a métricas avançadas

🔗 **Implementação:** PostgreSQL RLS + middleware Express

---

### **RLS (Row Level Security)**
*Sinônimos: Multi-tenant Security, Data Isolation*

Funcionalidade do PostgreSQL que restringe acesso a linhas baseado no usuário. Implementa multitenant a nível de banco.

📝 **Exemplo:**
```sql
-- RLS policy: usuário só vê suas próprias análises
CREATE POLICY user_analysis ON anamnesis_analysis
  FOR ALL TO authenticated
  USING (user_id = auth.uid());
```

🔗 **Configuração:** Supabase RLS policies

---

### **shadcn/ui**
*Sinônimos: Component Library, Design System*

Biblioteca de componentes React + Tailwind CSS que fornece components copiáveis e customizáveis, não NPM package.

📝 **Exemplo:**
```bash
# Instalar component
npx shadcn-ui@latest add button
# Cria client/src/components/ui/button.tsx
# Código fica no projeto (ownership completo)
```

🎯 **Benefícios:** Zero bundle overhead, customização total, TypeScript nativo

---

### **SSR vs CSR**
*Sinônimos: Server-Side vs Client-Side Rendering*

**SSR:** HTML gerado no servidor, enviado pronto para browser  
**CSR:** JavaScript roda no browser e gera HTML dinamicamente

📝 **Nossa escolha:** CSR (React SPA) porque:
- App privado (pós-login) = SEO não crítico
- Interatividade alta = melhor como SPA
- Desenvolvimento mais simples

🔗 **Justificativa:** [DESIGN_DECISIONS.md - Frontend Stack](DESIGN_DECISIONS.md#frontend-stack)

---

### **Type-safe**
*Sinônimos: Statically Typed, Compile-time Safety*

Propriedade onde TypeScript garante consistência de tipos em tempo de compilação, prevenindo erros de runtime.

📝 **Exemplo:**
```typescript
// Type-safe: TypeScript detecta erro
const user: User = { name: "João", age: "30" }; // ❌ Error: age deve ser number

// Não type-safe: Erro só em runtime
const user: any = { name: "João", age: "30" };
console.log(user.age + 5); // "305" 😱
```

🎯 **Meta:** 100% das funções tipadas explicitamente

---

### **Zod**
*Sinônimos: Schema Validation, Runtime Type Checking*

Biblioteca TypeScript para validação de schemas em runtime. Complementa TypeScript (compile-time) com runtime safety.

📝 **Exemplo:**
```typescript
const UserSchema = z.object({
  email: z.string().email(),
  age: z.number().min(18)
});

// Validação runtime
const result = UserSchema.safeParse(userInput);
if (result.success) {
  // result.data é type-safe User
}
```

🔗 **Uso:** API validation, form validation, environment variables

---

## 📈 Métricas e KPIs

### **CPA (Cost Per Acquisition)**
*Sinônimos: Custo por Aquisição, Customer Acquisition Cost*

Métrica de performance em ads: quanto se gasta para conseguir 1 cliente/lead.

📝 **Exemplo:** Gastou R$ 300 em ads no Instagram → Conseguiu 10 consultas agendadas → CPA = R$ 30 por consulta.

🎯 **Ads Guardrails:** Se CPA > meta por 48h → pausar criativo automaticamente

---

### **NPS (Net Promoter Score)**
*Sinônimos: Score de Recomendação*

Métrica de satisfação: % de clientes que recomendam - % que não recomendam.

📝 **Exemplo:** 10 usuários avaliaram Anamnese: 7 nota 9-10 (promotores), 2 nota 7-8 (neutros), 1 nota 0-6 (detrator) → NPS = 70% - 10% = 60.

🎯 **Meta PRD:** NPS > 70 para Diagnóstico/Marca

---

### **TTL (Time To Live)**
*Sinônimos: Cache Expiry, Data Freshness*

Tempo que dados ficam válidos no cache antes de serem renovados.

📝 **Exemplo:** Brand Voice JSON cached por 5 min TTL → Primeira request busca no banco → Próximas requests usam cache → Após 5 min, busca banco novamente.

🎯 **Configuração:** React Query staleTime

---

## 🔗 Acrônimos

### **API** - Application Programming Interface
Conjunto de endpoints HTTP que permite comunicação entre frontend e backend.

### **CRUD** - Create, Read, Update, Delete
Operações básicas de banco de dados.

### **DX** - Developer Experience  
Qualidade da experiência do desenvolvedor: setup rápido, docs claras, ferramentas úteis.

### **GDPR/LGPD** - General Data Protection Regulation / Lei Geral de Proteção de Dados
Regulações de privacidade que garantem direitos dos usuários sobre seus dados.

### **MVP** - Minimum Viable Product
Versão mínima do produto que entrega valor para validar hipóteses.

### **PRD** - Product Requirements Document
Documento que especifica funcionalmente o que o produto deve fazer.

### **SaaS** - Software as a Service
Modelo de negócio onde software é oferecido como serviço (subscription).

### **SLA** - Service Level Agreement
Compromsso formal de nível de serviço (ex: 99.9% uptime).

### **UX** - User Experience
Experiência completa do usuário ao interagir com o produto.

---

## 🔄 Como Contribuir com o Glossário

### ➕ Adicionar Novo Termo

**Quando adicionar:**
- Termo usado em 3+ documentos diferentes
- Conceito complexo que causa confusão
- Acrônimo ou jargão técnico
- Term specific do setor pet

**Template para novo termo:**
```markdown
### **Nome do Termo**
*Sinônimos: termo1, termo2*

Definição clara e concisa do conceito.

📝 **Exemplo:** Caso prático de uso no projeto.

🔗 **Referência:** Link para documentação relevante
```

### ✏️ Atualizar Termo Existente

**Critérios para atualização:**
- Definição ficou desatualizada
- Exemplo não reflete implementação atual
- Link quebrado ou desatualizado
- Novo sinônimo identificado

**Processo:**
1. Atualizar definição
2. Revisar exemplos
3. Verificar links
4. Mencionar mudança no PR

### 🔍 Solicitar Clarificação

**Se encontrar termo confuso:**
1. Abrir issue com label "documentation"
2. Marcar pessoas que podem esclarecer
3. Propor definição inicial se possível

---

*📚 Próximo passo: [TODO](TODO.md) - Lacunas pendentes de definição*