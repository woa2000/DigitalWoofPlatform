# Sistema de Manual da Marca - Digital Woof

## 📋 Visão Geral

O Sistema de Manual da Marca é uma solução completa para criação, gestão e distribuição de manuais de identidade visual e comunicação digital. O sistema oferece duas formas de criação:

1. **Criação Manual**: Preenchimento capítulo por capítulo
2. **Extração por IA**: Análise automática de materiais existentes

## 🏗️ Arquitetura do Sistema

### 1. Database Schema (`sql/brand_manuals.sql`)
- **Tabela Principal**: `brand_manuals` com dados estruturados em JSONB
- **Políticas RLS**: Segurança baseada em usuário
- **Triggers**: Atualização automática de timestamps
- **Functions**: Operações especializadas (publicação, duplicação)
- **Views**: Estatísticas agregadas por usuário

### 2. TypeScript Types (`src/lib/brand-manual-types.ts`)
- **15 Capítulos Especializados**: Cada um com estrutura específica
- **Template Completo**: Base para novos manuais
- **Union Types**: Flexibilidade de conteúdo
- **Metadata**: Versionamento e controle

### 3. React Hook (`src/hooks/useBrandManual.ts`)
- **CRUD Completo**: Criação, leitura, atualização, exclusão
- **Operações Especiais**: Publicação, duplicação, compartilhamento
- **AI Integration**: Extração e processamento de dados
- **Estado Global**: Gerenciamento unificado

### 4. UI Components
- **Página Principal**: Lista e gestão de manuais
- **Visualizador**: Interface de leitura com navegação
- **AI Loading**: Feedback visual durante extração
- **Modal de Criação**: Fluxo simplificado

## 📚 Estrutura dos 15 Capítulos

1. **Visão & Essência** - Propósito, manifesto, personalidade
2. **Sistema de Logotipo Digital** - Versões, formatos, especificações
3. **Paleta de Cores Web** - Cores primárias, suporte, modo escuro
4. **Tipografia Responsiva** - Fontes, hierarquia, escala
5. **Grid & Layout Digital** - Breakpoints, espaçamentos
6. **Component Library** - UI Kit e componentes
7. **Ícones & Ilustrações** - Estilo gráfico consistente
8. **Motion & Micro-interações** - Animações e transições
9. **Acessibilidade Web** - Padrões WCAG 2.2
10. **Tom de Voz Digital** - Comunicação unificada
11. **Social Media Toolkit** - Templates e diretrizes
12. **E-mail & Notificações** - Estruturas de comunicação
13. **Banners & Ads Digitais** - Formatos publicitários
14. **Gestão de Ativos** - Organização e nomenclatura
15. **Checklist de Aprovação** - Processo de validação

## 🚀 Funcionalidades Principais

### Gestão de Manuais
- ✅ Criação manual ou por IA
- ✅ Lista com filtros e busca
- ✅ Estatísticas do usuário
- ✅ Status (Rascunho/Publicado/Arquivado)
- ✅ Sistema de tags
- ✅ Duplicação de manuais

### Visualização
- ✅ Interface de leitura clean
- ✅ Navegação por capítulos
- ✅ Modo público/privado
- ✅ Compartilhamento seguro
- ✅ Download PDF (planejado)

### Extração por IA
- ✅ Upload de múltiplos arquivos
- ✅ URLs de referência
- ✅ Feedback visual detalhado
- ✅ Processamento por etapas
- ✅ Integração futura com APIs

### Colaboração
- ✅ Controle de acesso
- ✅ Versionamento
- ✅ Links de compartilhamento
- ✅ Templates públicos

## 🛠️ Implementação Técnica

### Stack
- **Next.js 14**: App Router + Server Components
- **TypeScript**: Type safety completa
- **Supabase**: Database + Auth + Storage
- **Tailwind CSS**: Styling moderno
- **Lucide Icons**: Iconografia consistente

### Patterns
- **Custom Hooks**: Lógica de negócio isolada
- **Compound Components**: UI flexível
- **Optimistic Updates**: UX responsiva
- **Error Boundaries**: Tratamento robusto

### Security
- **Row Level Security**: Isolamento por usuário
- **Share Tokens**: Compartilhamento seguro
- **Input Validation**: Sanitização de dados
- **Type Guards**: Validação runtime

## 📱 Rotas do Sistema

```
/manual-marca                    # Lista de manuais
/manual-marca/[id]              # Visualização do manual
/manual-marca/[id]/editar       # Edição do manual
/manual-marca/compartilhado/[token] # Visualização pública
```

## 🎯 Próximos Passos

### Fase 1 - Core Functionality
- [x] Database schema
- [x] TypeScript types
- [x] React hook
- [x] Página principal
- [x] Visualizador básico

### Fase 2 - Editor Avançado
- [ ] Interface de edição por capítulo
- [ ] Rich text editor
- [ ] Upload de imagens
- [ ] Preview em tempo real

### Fase 3 - AI Integration
- [ ] API de extração real
- [ ] Processamento de PDFs
- [ ] Análise de websites
- [ ] OCR para imagens

### Fase 4 - Export & Sharing
- [ ] Geração de PDF
- [ ] Templates customizáveis
- [ ] Colaboração em tempo real
- [ ] Controle de versões

## 🔧 Como Usar

### 1. Criação Manual
```typescript
// Hook usage
const { createManual } = useBrandManual();

await createManual({
  brand_name: "Minha Marca",
  creation_method: "manual",
  description: "Manual criado do zero"
});
```

### 2. Extração por IA
```typescript
// Com arquivos e URLs
await createManual({
  brand_name: "Marca IA",
  creation_method: "ai_extraction",
  files: [arquivo1, arquivo2],
  urls: ["https://site.com"]
});
```

### 3. Atualização de Capítulo
```typescript
// Atualizar conteúdo específico
await updateChapterContent(manualId, 0, {
  purpose: "Novo propósito da marca",
  manifesto: "Novo manifesto",
  personality_adjectives: ["Moderno", "Confiável"]
});
```

## 📊 Banco de Dados

O sistema utiliza uma estrutura híbrida:
- **Metadados relacionais**: ID, usuário, status, timestamps
- **Conteúdo JSONB**: Dados flexíveis dos capítulos
- **Índices otimizados**: Performance para buscas
- **Views materializadas**: Estatísticas em tempo real

## 🎨 Design System

O sistema segue padrões consistentes:
- **Colors**: Blue primary, semantic colors
- **Typography**: Hierarquia clara
- **Spacing**: Sistema de tokens 4px
- **Components**: Reutilizáveis e modulares
- **Interactions**: Feedback imediato

## 🔒 Segurança

- **Authentication**: Supabase Auth
- **Authorization**: RLS policies
- **Data Validation**: Zod schemas
- **XSS Protection**: Input sanitization
- **CSRF**: Token validation

---

**Digital Woof** - Sistema completo para gestão de identidade de marca digital.
