# F-8: Publisher Multi-Canal

**Versão:** 1.0  
**Status:** 📋 Backlog  
**Fase:** 3 - Publicação e Análise  
**Prioridade:** P1 - Alta  
**Responsável:** Backend + Integrações  

---

## 📋 Visão Geral

**Objetivo:** Sistema de publicação automática em múltiplas plataformas (Meta + Google Business Profile) com agendamento, reintentos e pré-visualização por canal.

**Proposta de Valor:** Time-to-Publish < 5 min entre aprovação e agendamento, com publicação confiável e logs detalhados para auditoria.

**Job-to-be-Done:** "Como gestor de marketing pet, preciso publicar o mesmo conteúdo adaptado em múltiplos canais sem trabalho manual repetitivo."

---

## 🎯 Objetivos & Métricas

### Objetivos de Negócio
- **Time-to-Publish:** < 5 min entre aprovação e agendamento
- **Success Rate:** > 95% de posts publicados com sucesso
- **Multi-channel Efficiency:** 1 click → N canais
- **Error Recovery:** Retry automático + manual fallback

### Métricas Técnicas
- **API Response Time:** < 2s para agendamento
- **Retry Success:** > 90% de sucessos no retry
- **Queue Processing:** < 30s para processar lote
- **Uptime:** 99.9% de disponibilidade do publisher

---

## 👥 Personas & Casos de Uso

### Persona Principal: Social Media Manager
**Cenário:** "Tenho 20 posts aprovados para publicar em Instagram + Facebook"
**Input:** Batch de posts + timing preferences
**Output:** Agendamento automático com confirmação

### Persona Secundária: Proprietário Solo
**Cenário:** "Quero que meu post saia no Instagram às 18h e Facebook às 19h"
**Input:** Post + timing específico por canal
**Output:** Publicação otimizada por plataforma

---

## ⚙️ Especificação Funcional

### 🔗 Conexões OAuth
**RF-8.1: Autenticação com Plataformas**
- **Meta Business:** Instagram + Facebook Pages via Graph API
- **Google Business Profile:** Locations API
- **Token Management:** Refresh automático + alertas de expiração
- **Multiple Accounts:** Suporte a múltiplas páginas/perfis
- **Permission Validation:** Check de permissões necessárias

**Critérios de Aceite:**
- [ ] OAuth flow completo para Meta e Google
- [ ] Token refresh automático antes da expiração
- [ ] Interface para gerenciar múltiplas contas conectadas
- [ ] Validação de permissões post/publish

### 📅 Agendamento Inteligente
**RF-8.2: Scheduling System**
- **Fuso horário por conta:** Configuração individual
- **Rate limit respect:** Cumprimento dos limites das APIs
- **Optimal timing:** Sugestões baseadas em analytics
- **Bulk scheduling:** Múltiplos posts de uma vez
- **Conflict detection:** Evitar sobreposição de posts similares

**Critérios de Aceite:**
- [ ] Timezone handling correto para cada conta
- [ ] Rate limiting automático respeitando APIs
- [ ] Bulk operations para eficiência
- [ ] Detecção de conflitos de timing

### 🎨 Adaptação por Canal
**RF-8.3: Content Optimization**
- **Format adaptation:** Aspect ratio, character limits por plataforma
- **Hashtag optimization:** Diferentes estratégias por canal
- **CTA adaptation:** Botões/links apropriados por plataforma
- **Preview fidelity:** Exatamente como aparecerá
- **Asset optimization:** Compressão/resize automático de imagens

**Critérios de Aceite:**
- [ ] Preview fiel ao formato de cada plataforma
- [ ] Adaptação automática de imagens/texto
- [ ] Hashtag strategy diferenciada por canal
- [ ] Asset optimization mantendo qualidade

### 🔄 Retry e Error Handling
**RF-8.4: Reliability System**
- **Exponential backoff:** Retry inteligente em falhas
- **Dead letter queue:** Posts que falharam definitivamente
- **Manual retry:** Interface para tentar novamente
- **Error categorization:** Diferentes tipos de erro
- **Notification system:** Alertas para falhas críticas

**Critérios de Aceite:**
- [ ] Retry automático com backoff strategy
- [ ] Classification clara de tipos de erro
- [ ] Interface para retry manual
- [ ] Alertas em tempo real para falhas

---

## 🏗️ Especificação Técnica

### Stack Tecnológico
- **Queue System:** Redis/Bull para agendamento
- **OAuth Provider:** Passport.js ou similar
- **Meta Integration:** Facebook Graph API v18+
- **Google Integration:** Google Business Profile API
- **Media Processing:** Sharp para otimização de imagens
- **Monitoring:** Status tracking detalhado

### Arquitetura do Sistema
```typescript
// Core publisher service
class PublisherService {
  async schedulePost(post: SchedulePostDto): Promise<ScheduledPublication>
  async publishNow(post: PublishDto): Promise<PublicationResult>
  async retryFailed(publicationId: string): Promise<PublicationResult>
  async cancelScheduled(publicationId: string): Promise<void>
}

// Platform adapters
interface PlatformAdapter {
  validateConnection(): Promise<boolean>
  adaptContent(content: Content): Promise<PlatformContent>
  publish(content: PlatformContent): Promise<PublicationResult>
  getPublicationStatus(postId: string): Promise<PostStatus>
}

class MetaAdapter implements PlatformAdapter {
  // Instagram + Facebook implementation
}

class GoogleBusinessAdapter implements PlatformAdapter {
  // Google Business Profile implementation
}
```

### Modelo de Dados
```sql
-- Contas conectadas
ConnectedAccount {
  id: uuid PRIMARY KEY,
  accountId: uuid REFERENCES accounts(id),
  platform: text NOT NULL, -- meta, google
  platformAccountId: text NOT NULL,
  platformAccountName: text,
  accessToken: text ENCRYPTED,
  refreshToken: text ENCRYPTED,
  tokenExpiresAt: timestamp,
  permissions: jsonb,
  isActive: boolean DEFAULT true,
  createdAt: timestamp DEFAULT now()
}

-- Publicações agendadas
ScheduledPublication {
  id: uuid PRIMARY KEY,
  accountId: uuid REFERENCES accounts(id),
  contentId: uuid REFERENCES generated_content(id),
  connectedAccountId: uuid REFERENCES connected_accounts(id),
  scheduledFor: timestamp NOT NULL,
  status: text NOT NULL, -- scheduled, published, failed, cancelled
  platformPostId: text, -- ID retornado pela plataforma
  adaptedContent: jsonb, -- conteúdo adaptado para a plataforma
  errorMessage: text,
  retryCount: integer DEFAULT 0,
  publishedAt: timestamp,
  createdAt: timestamp DEFAULT now()
}

-- Log de publicações
PublicationLog {
  id: uuid PRIMARY KEY,
  publicationId: uuid REFERENCES scheduled_publications(id),
  action: text NOT NULL, -- attempt, success, error, retry
  details: jsonb,
  createdAt: timestamp DEFAULT now()
}
```

---

## 🔗 Integrações Específicas

### Meta (Instagram + Facebook)
```typescript
// Meta Graph API integration
class MetaGraphAPI {
  async publishToInstagram(pageId: string, content: InstagramContent): Promise<PostResult>
  async publishToFacebook(pageId: string, content: FacebookContent): Promise<PostResult>
  async schedulePost(pageId: string, content: Content, publishTime: Date): Promise<ScheduleResult>
  async getAccountInfo(pageId: string): Promise<AccountInfo>
}

// Content adaptation
interface InstagramContent {
  caption: string // max 2200 chars
  image_url?: string
  video_url?: string
  location_id?: string
}

interface FacebookContent {
  message: string
  link?: string
  picture?: string
  name?: string
  description?: string
}
```

### Google Business Profile
```typescript
// Google Business API integration
class GoogleBusinessAPI {
  async createPost(locationId: string, content: GoogleBusinessContent): Promise<PostResult>
  async getLocations(accountId: string): Promise<Location[]>
  async getPostInsights(postId: string): Promise<PostInsights>
}

interface GoogleBusinessContent {
  summary: string // max 1500 chars
  media?: {
    mediaFormat: 'PHOTO' | 'VIDEO'
    sourceUrl: string
  }[]
  topicType: 'STANDARD' | 'EVENT' | 'OFFER'
  callToAction?: {
    actionType: 'BOOK' | 'CALL' | 'LEARN_MORE'
    url?: string
  }
}
```

---

## 📊 Monitoramento e Analytics

### Health Monitoring
- **Platform Status:** APIs das plataformas funcionando
- **Queue Health:** Tamanho e processamento da fila
- **Token Status:** Tokens válidos e próximos a expirar
- **Success Rates:** Taxa de sucesso por plataforma

### Performance Metrics
- **Publication Latency:** Tempo entre agendamento e publicação
- **Error Rates:** % de falhas por tipo de erro
- **Retry Success:** Efetividade dos retries
- **Queue Processing Time:** Velocidade de processamento

### Alerting
- Token expiring em < 7 dias
- Error rate > 10% em 1 hora
- Queue backup > 100 items
- Platform API down

---

## 🔒 Segurança & Compliance

### Token Security
- **Encryption at Rest:** Tokens criptografados no banco
- **Rotation Policy:** Refresh automático de tokens
- **Access Audit:** Log de uso de tokens
- **Revocation:** Capability de revogar acesso

### Platform Compliance
- **Meta Guidelines:** Aderência às políticas do Meta
- **Google Policies:** Compliance com Google Business
- **Rate Limiting:** Respeito aos limites das APIs
- **Content Policy:** Validation contra ToS das plataformas

---

## 🧪 Testes & Qualidade

### Test Strategy
- **Integration Tests:** Cada platform adapter
- **Error Simulation:** Falhas de rede, API limits
- **Load Testing:** Publicação em lote
- **Token Management:** Expiration e refresh flows

### Quality Gates
- **Success Rate:** > 95% em ambiente de teste
- **Recovery Time:** < 1 min para retry successful
- **Token Refresh:** 100% de sucesso no refresh
- **Preview Accuracy:** 100% fidelidade visual

---

## 🔮 Roadmap & Evoluções

### Fase 3 (MVP)
- ✅ **Core Platforms:** Instagram, Facebook, Google Business
- ✅ **Basic Scheduling:** Agendamento com retry
- ✅ **Content Adaptation:** Format optimization

### Fase 3.1 (Expansion)
- 📅 **More Platforms:** LinkedIn, Twitter, TikTok
- 📅 **Advanced Scheduling:** Optimal timing AI
- 📅 **Bulk Operations:** Mass scheduling

### Fase 4 (Advanced)
- 🔮 **Cross-posting:** Intelligent content distribution
- 🔮 **Performance Optimization:** Auto-adjust timing
- 🔮 **WhatsApp Business:** Direct customer communication

---

## ⚠️ Riscos & Mitigações

### Platform Risks
- **API Changes:** Plataformas mudam APIs frequentemente
  - *Mitigação:* Versioning strategy + monitoring
- **Rate Limits:** Podem ser atingidos em picos
  - *Mitigação:* Queue management + throttling
- **Token Revocation:** Usuários podem revogar acesso
  - *Mitigação:* Graceful degradation + re-auth flow

### Technical Risks
- **Queue Failures:** Sistema de fila pode falhar
  - *Mitigação:* Redundancy + dead letter queues
- **Content Corruption:** Adaptação pode falhar
  - *Mitigação:* Validation + rollback capability

---

## 📚 Referências & Links

- **PRD:** Seção 4.3 - F-9 Publicação/Agendamento
- **Meta Graph API:** https://developers.facebook.com/docs/graph-api
- **Google Business Profile API:** https://developers.google.com/my-business
- **Dependencies:** F-6 (Content Generation), F-7 (Calendar)

---

## ✅ Definition of Done

### Funcional
- [ ] OAuth flow completo para Meta e Google
- [ ] Agendamento funcional com timezone support
- [ ] Content adaptation por plataforma
- [ ] Retry system robusto
- [ ] Bulk operations implementadas
- [ ] Preview accuracy verificada

### Técnico
- [ ] Queue system performante
- [ ] Token management seguro
- [ ] Error handling completo
- [ ] Monitoring e alerting
- [ ] Rate limiting respeitoso

### Qualidade
- [ ] Success rate > 95% em testes
- [ ] Integration tests para todas plataformas
- [ ] Load testing aprovado
- [ ] Security review completo
- [ ] Documentation completa

---

*Última atualização: Setembro 2025*