# Anamnese Digital - Documentação

## Visão Geral

A funcionalidade de Anamnese Digital permite analisar sites e redes sociais para gerar insights estratégicos detalhados. O sistema coleta informações sobre identidade de marca, personas, experiência do usuário e gera recomendações de melhoria.

## Funcionalidades Implementadas

### ✅ Entrada de Dados
- **Input para URL do site**: Campo obrigatório com validação de URL
- **Múltiplas redes sociais**: Campos dinâmicos para adicionar/remover URLs de redes sociais
- **Validação**: Verificação automática de formato de URL

### ✅ Processamento da Análise
- **Verificação de duplicatas**: Verifica se já existe análise para a URL informada
- **Simulação de IA**: Mock da análise que seria feita por IA (placeholder para integração real)
- **Loading states**: Estados visuais durante o processamento
- **Tratamento de erros**: Feedback ao usuário em caso de problemas

### ✅ Armazenamento
- **Banco Supabase**: Estrutura completa para armazenar todos os dados da anamnese
- **Associação por usuário**: Cada análise fica vinculada ao usuário autenticado
- **Timestamps**: Controle de criação e atualização

### ✅ Visualização dos Resultados
- **Interface completa**: Exibição organizada de todos os componentes da análise
- **Navegação**: Alternância entre formulário e resultados
- **Cards visuais**: Organização das informações em seções claras

### ✅ Gestão de Análises
- **Lista de análises anteriores**: Histórico de análises por usuário
- **Reprocessamento**: Opção de refazer análise existente
- **Exclusão**: Remoção de análises
- **Carregamento automático**: Recupera análise existente se URL já foi analisada

## Estrutura de Dados

A anamnese digital segue o modelo de dados fornecido, incluindo:

- **Diagnóstico de Identidade e Propósito**
- **Personas** (múltiplas)
- **Auditoria de Percepção e Experiência** (Jornada do Paciente + Johari)
- **Análise do Ecossistema** (inspirações)
- **Plano de Tratamento** (Quick Wins, reestruturação, etc.)
- **Roadmap Terapêutico** (priorização de ações)
- **Nova Anatomia da Home** (estrutura sugerida)
- **Perguntas de Aprofundamento**

## Arquivos Criados/Modificados

### Novos Arquivos
- `src/lib/types.ts` - Definições de tipos TypeScript para anamnese
- `src/hooks/useAnamneseDigital.ts` - Hook personalizado para gerenciar operações
- `src/components/anamnese/AnamneseResults.tsx` - Componente para exibir resultados
- `src/lib/anamnese-helpers.ts` - Utilitários para conversão de dados
- `sql/anamneses_digitais.sql` - Script SQL para criar tabela no Supabase

### Arquivos Modificados
- `src/app/(dashboard)/anamnese-digital/page.tsx` - Página principal da funcionalidade

## Configuração do Banco de Dados

Execute o script SQL fornecido (`sql/anamneses_digitais.sql`) no Supabase para criar:

1. **Tabela `anamneses_digitais`** com todos os campos necessários
2. **Índices** para otimização de performance
3. **Row Level Security (RLS)** para isolamento por usuário
4. **Triggers** para atualização automática de timestamps
5. **Função auxiliar** para inserção de dados complexos

## Próximos Passos para Produção

### 🔄 Integração com IA Real
Substitua a função `simulateAnalysis` no hook por integração real com:
- OpenAI GPT-4 para análise de conteúdo
- APIs de scraping para coleta de dados do site
- Ferramentas de análise de performance (Lighthouse, PageSpeed)

### 🎨 Melhorias de UX
- Upload de screenshots do site
- Gráficos e visualizações dos dados
- Export para PDF/Word dos relatórios
- Comparação entre análises (antes/depois)

### 🔧 Otimizações Técnicas
- Cache de análises para URLs similares
- Processamento em background (workers)
- Notificações push quando análise estiver pronta
- Versionamento de análises

### 📊 Analytics
- Métricas de uso da funcionalidade
- Tipos de sites mais analisados
- Tempo médio de processamento
- Taxa de reprocessamento

## Como Usar

1. **Acesse** a página de Anamnese Digital no dashboard
2. **Insira** a URL do site que deseja analisar
3. **Adicione** redes sociais opcionalmente
4. **Clique** em "Processar Análise"
5. **Aguarde** o processamento (simulado com 3 segundos)
6. **Visualize** os resultados detalhados
7. **Gerencie** suas análises através da lista de histórico

## Tecnologias Utilizadas

- **Next.js 14** com App Router
- **TypeScript** para tipagem forte
- **Tailwind CSS** para estilização
- **Supabase** para banco de dados e autenticação
- **Lucide React** para ícones
- **React Hooks** para gerenciamento de estado

## Considerações de Performance

- Lazy loading dos componentes pesados
- Paginação nas listas de análises (implementar quando necessário)
- Compressão de dados JSON no banco
- Cache de consultas frequentes

A funcionalidade está pronta para uso e pode ser facilmente estendida conforme as necessidades do projeto evoluem.
