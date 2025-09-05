# F-4: Manual de Marca Digital

**Status:** 📅 Planejado  
**Fase:** 1 - Cérebro da Marca  
**Prioridade:** P1 (Alta)  
**Responsáveis:** Frontend, Design, Backend  
**Depende de:** F-3 (Brand Voice JSON)

---

## Visão Geral
Interface visual e interativa que apresenta a identidade da marca de forma organizada e consultável. Transforma o **Brand Voice JSON** em um documento visual navegável, facilitando consulta por equipes e garantindo aplicação consistente da marca.

## Objetivo
Criar uma **fonte visual única da verdade** sobre a marca que possa ser facilmente consultada, compartilhada e utilizada como referência para criação de conteúdo e materiais de marketing.

---

## Funcionalidades

### 📊 Dashboard Visual da Marca

**Visão Geral:**
- Card principal com logo, nome e resumo da marca
- Métricas de completude do perfil de marca
- Status de compliance e últimas atualizações
- Navegação rápida para seções específicas

**Layout:**
```
┌─────────────────────────────────────────┐
│ MANUAL DE MARCA - Clínica Pet Life      │
├─────────────────────────────────────────┤
│ [LOGO]    │ Missão: Cuidar com ciência │
│           │ Segmento: Veterinária       │
│           │ Completude: 87%             │
├─────────────────────────────────────────┤
│ [Tom] [Visual] [Linguagem] [Compliance] │
└─────────────────────────────────────────┘
```

---

### 🎨 Seção Visual Identity

**Paleta de Cores:**
- Grid visual das cores com códigos hex
- Preview das cores em diferentes contextos
- Combinações recomendadas e a evitar
- Download de paleta (.ase, .json, .css)

```typescript
interface ColorSection {
  palette: {
    primary: string;
    secondary: string[];
    accent?: string;
    neutral: string[];
  };
  usage_examples: {
    background_combinations: string[][];
    text_combinations: string[][];
    accent_usage: string;
  };
  accessibility: {
    contrast_ratios: Record<string, number>;
    wcag_compliance: boolean;
  };
}
```

**Logo e Tipografia:**
- Display do logo em diferentes tamanhos
- Versões (colorida, monocromática, invertida)
- Guidelines de uso mínimo e espaçamentos
- Exemplos de aplicação correta e incorreta

**Mood Board:**
- Exemplos visuais do estilo de imagem
- Filtros e treatments recomendados
- Galeria de referências aprovadas

---

### 🗣️ Seção Tom de Voz

**Personalidade Visual:**
- Radar chart com as 4 dimensões de tom
- Comparação com benchmarks do setor
- Exemplos de como cada dimensão se manifesta

```
Confiança ████████░░ 8/10
Acolhimento ██████████ 10/10  
Humor ██░░░░░░░░ 2/10
Especialização ██████░░░░ 6/10
```

**Persona da Marca:**
- Descrição da personalidade como se fosse uma pessoa
- Características principais destacadas
- Estilo de comunicação explicado com exemplos

**Exemplos Práticos:**
- Comparação lado-a-lado: "Como NÃO dizer" vs "Como DIZER"
- Diferentes contextos: formal, casual, emergência, educativo
- Adaptação para diferentes canais (WhatsApp, Instagram, etc.)

---

### 📝 Seção Linguagem

**Glossário de Termos:**

*Preferidos:*
```
✅ tutor          (não "dono")
✅ bem-estar      (não "saúde")  
✅ amigo pet      (não "animal")
✅ consulta       (não "atendimento")
```

*Proibidos:*
```
❌ cura, milagroso, garante resultado
❌ barato, promocional
❌ bicho, animal (preferir "pet", "amigo")
```

**CTAs e Frases-Modelo:**
- Lista de calls-to-action aprovados
- Templates de frases para diferentes situações
- Fórmulas de copy com placeholders

**Formatação e Estilo:**
- Guidelines de uso de emojis, listas, negrito
- Tamanho de frases e parágrafos preferidos
- Padrões de pontuação e estruturação

---

### ⚖️ Seção Compliance

**Políticas de Conteúdo:**
- Claims médicos permitidos vs proibidos
- Disclaimers obrigatórios com exemplos
- Processo de review para conteúdo sensível

**Checklist de Compliance:**
```
□ Disclaimer médico incluído
□ Nenhum termo proibido utilizado
□ Claims validados por especialista
□ LGPD compliance verificado
□ Direitos autorais respeitados
```

**Alertas Automáticos:**
- Lista de palavras que acionam review manual
- Níveis de severidade (Info, Warning, Crítico)
- Processo de escalação para conteúdo problemático

---

### 📱 Adaptação por Canal

**Redes Sociais:**

*Instagram:*
- Tom ajustado: +20% mais casual
- Hashtag strategy: moderada (8-12 hashtags)
- Stories style: branded educativo
- Exemplos de posts por tipo (carrossel, story, reel)

*Facebook:*
- Posts mais longos e informativos
- Engagement style: conversacional
- Exemplos de copy para diferentes objetivos

*WhatsApp Business:*
- Nível de formalidade: semi-formal
- Templates de resposta rápida
- Fluxos de atendimento padronizados

**Email Marketing:**
- Tom para newsletters vs campanhas
- Subject lines aprovados
- Templates de assinatura

---

### 🔄 Versionamento e Histórico

**Controle de Versões:**
- Timeline de mudanças na marca
- Justificativas para cada alteração
- Comparação entre versões (diff visual)

**Aprovações:**
- Status de aprovação por seção
- Histórico de quem aprovou/rejeitou
- Comentários e feedback incorporado

```typescript
interface VersionHistory {
  version: string;
  date: string;
  changes: {
    section: 'visual' | 'voice' | 'language' | 'compliance';
    field: string;
    oldValue: any;
    newValue: any;
    reason: string;
    approvedBy?: string;
  }[];
  status: 'draft' | 'pending_approval' | 'approved' | 'archived';
}
```

---

### 📤 Exportação e Compartilhamento

**Formatos de Export:**
- PDF completo (para impressão/apresentação)
- Resumo executivo (1 página)
- Guia rápido (checklist para equipe)
- Brand kit (assets + guidelines)

**Compartilhamento:**
- Link público com controle de acesso
- Embed widgets para sites/intranets
- API endpoints para integração com ferramentas

---

## Interface e UX

### Layout Responsivo

**Desktop:**
- Sidebar com navegação por seções
- Conteúdo principal com scroll infinito
- Preview panel para exemplos práticos
- Toolbar com ações (export, edit, share)

**Mobile:**
- Bottom navigation com ícones
- Cards colapsáveis por seção
- Swipe gestures para navegação
- FAB para ações rápidas

### Interatividade

**Elementos Dinâmicos:**
- Sliders para ajustar tom em tempo real
- Preview instantâneo de mudanças
- Simulador de aplicação em diferentes contextos
- Comparador lado-a-lado de versões

**Feedback Visual:**
- Progress bars para completude
- Status indicators (aprovado, pendente, alerta)
- Tooltips explicativos para conceitos técnicos
- Animações suaves para transições

---

## Integração com IA

### Sugestões Inteligentes

**Melhorias Automáticas:**
- Análise de gaps no brand voice
- Sugestões de termos baseadas em tendências do setor
- Alertas de inconsistências detectadas
- Recomendações de benchmark com concorrentes

**Content Preview:**
- Geração automática de exemplos usando Brand Voice JSON
- Preview de como posts ficariam com as configurações atuais
- A/B testing de diferentes tons para o mesmo conteúdo

### Compliance Inteligente

**Validação Automática:**
- Scan em tempo real de violações
- Sugestões de correção para problemas encontrados
- Score de compliance por seção
- Alertas proativos sobre mudanças regulatórias

---

## Modelo de Dados

### Estrutura de Apresentação

```typescript
interface ManualDeMarca {
  id: string;
  userId: string;
  brandVoiceId: string; // referência ao Brand Voice JSON
  
  // Configurações de apresentação
  display: {
    theme: 'light' | 'dark' | 'brand_colors';
    layout: 'sidebar' | 'tabs' | 'accordion';
    sections_visible: string[];
    custom_sections?: CustomSection[];
  };
  
  // Conteúdo editável sobreposto ao Brand Voice JSON
  overrides: {
    custom_examples: Record<string, string[]>;
    additional_guidelines: Record<string, string>;
    custom_compliance_rules: ComplianceRule[];
  };
  
  // Controle de acesso
  sharing: {
    public_url?: string;
    access_level: 'private' | 'team' | 'public';
    allowed_users: string[];
    embed_enabled: boolean;
  };
  
  // Metadata
  created_at: string;
  last_viewed: string;
  export_history: ExportRecord[];
}

interface CustomSection {
  id: string;
  title: string;
  content: string; // Markdown
  order: number;
  visible: boolean;
}
```

### Cache e Performance

```typescript
class ManualMarcaService {
  // Cache da versão renderizada
  private renderedCache = new Map<string, RenderedManual>();
  
  async getManual(userId: string): Promise<RenderedManual> {
    const cacheKey = `manual:${userId}`;
    
    // Check cache first
    if (this.renderedCache.has(cacheKey)) {
      return this.renderedCache.get(cacheKey)!;
    }
    
    // Fetch brand voice + presentation config
    const [brandVoice, displayConfig] = await Promise.all([
      this.brandVoiceService.get(userId),
      this.getDisplayConfig(userId)
    ]);
    
    // Render manual
    const rendered = await this.renderManual(brandVoice, displayConfig);
    
    // Cache result
    this.renderedCache.set(cacheKey, rendered);
    
    return rendered;
  }
  
  private async renderManual(brandVoice: BrandVoice, config: DisplayConfig): Promise<RenderedManual> {
    // Transform Brand Voice JSON into presentation format
    // Apply custom overrides and examples
    // Generate compliance checks and scores
    // Create interactive elements data
  }
}
```

---

## Critérios de Aceite

### Funcional
- [ ] Visualização completa do Brand Voice JSON
- [ ] Navegação intuitiva por seções (visual, voz, linguagem, compliance)
- [ ] Preview de exemplos práticos em tempo real
- [ ] Export em múltiplos formatos (PDF, resumo, brand kit)
- [ ] Compartilhamento com controle de acesso
- [ ] Histórico de versões com diff visual
- [ ] Sugestões automáticas de melhorias

### Visual
- [ ] Interface responsiva (desktop + mobile)
- [ ] Tema customizável (cores da marca)
- [ ] Tipografia acessível e legível
- [ ] Elementos interativos (sliders, previews)
- [ ] Animações suaves e feedback visual
- [ ] Paleta de cores com accessibility compliance

### Performance
- [ ] Carregamento inicial < 3s
- [ ] Navegação entre seções < 500ms
- [ ] Export PDF < 10s
- [ ] Suporte offline para visualização
- [ ] Cache inteligente para dados frequentes

### Integrações
- [ ] Sync automático com Brand Voice JSON
- [ ] API para embed em outras ferramentas
- [ ] Webhook para notificações de mudanças
- [ ] Integração com F-5 (Biblioteca de Campanhas)

---

## Fluxo de Desenvolvimento

### Fase 1: MVP (Sprint 1-2)
- Layout básico com seções principais
- Visualização do Brand Voice JSON
- Export PDF simples
- Navegação por abas

### Fase 2: Interatividade (Sprint 3-4)
- Elementos dinâmicos (sliders, previews)
- Sugestões de melhorias
- Compartilhamento básico
- Histórico de versões

### Fase 3: Avançado (Sprint 5-6)
- Compliance dashboard
- Export customizável
- Embed widgets
- Otimizações de performance

---

## Métricas de Sucesso

### Produto
- **Adoption Rate:** > 70% dos usuários acessam manual após criar Brand Voice
- **Time Spent:** > 5 min médio na primeira visita
- **Return Rate:** > 40% voltam dentro de 7 dias
- **Export Usage:** > 30% fazem pelo menos 1 export

### Negócio
- **Team Consistency:** Redução de 50% em inconsistências de marca
- **Onboarding Speed:** Novos membros da equipe productive em < 2h
- **Content Quality:** Melhoria de 30% em compliance score
- **Client Satisfaction:** NPS > 8 para facilidade de uso

### Técnico
- **Page Load:** < 3s em 95% dos casos
- **Error Rate:** < 0.5% de falhas críticas
- **Cache Hit Rate:** > 90% para dados frequentes
- **Mobile Usage:** > 25% dos acessos via mobile

---

## Riscos e Mitigações

### Risco: Overload de informação
**Mitigação:**
- Design progressivo (overview → detalhes)
- Navegação contextual inteligente
- Filtros e busca para encontrar informações específicas

### Risco: Desatualização vs Brand Voice JSON
**Mitigação:**
- Sync automático em tempo real
- Alertas de mudanças pendentes
- Versioning claro com highlights de diferenças

### Risco: Performance com grandes manuais
**Mitigação:**
- Lazy loading de seções
- Cache inteligente multi-layer
- Compressão de assets visuais
- CDN para recursos estáticos

---

## Integrações Futuras

### Fase 2 da Plataforma
- **F-5 Biblioteca de Campanhas:** Templates auto-configurados com brand voice
- **F-6 Geração de Conteúdo:** Preview em tempo real usando manual
- **F-7 Calendário Editorial:** Aplicação automática de guidelines

### Ferramentas Externas
- **Canva/Figma:** Import/export de brand kits
- **Mailchimp/RD:** Sync automático de guidelines
- **Slack/Teams:** Notifications de mudanças de marca
- **Google Workspace:** Embed de manual em documentos

---

## Documentação Técnica
- [F-3: Brand Voice JSON](F03_BRAND_VOICE_JSON.md) - Fonte de dados
- [F-5: Biblioteca de Campanhas](F05_BIBLIOTECA_CAMPANHAS.md) - Consumidor principal
- [Design System](../design/DESIGN_SYSTEM.md) - Padrões visuais
- [API Contracts](../architecture/API_CONTRACTS.md#manual-marca)