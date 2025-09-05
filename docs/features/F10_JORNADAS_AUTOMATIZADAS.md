# F-10: Jornadas Automatizadas

**Versão:** 1.0  
**Status:** 📋 Backlog  
**Fase:** 3 - Publicação e Análise  
**Prioridade:** P1 - Alta  
**Responsável:** Backend + Business Logic  

---

## 📋 Visão Geral

**Objetivo:** Sequências automatizadas de recall de vacinas, check-ups e cuidados preventivos baseadas no histórico do animal, enviadas via WhatsApp/email com confirmação de agendamento integrada.

**Proposta de Valor:** Automatiza comunicação preventiva aumentando retenção de clientes, reduzindo no-shows e melhorando a saúde dos pets através de lembretes inteligentes.

**Job-to-be-Done:** "Como clínica veterinária, preciso lembrar proprietários sobre cuidados preventivos automaticamente para manter a saúde dos pets e garantir receita recorrente."

---

## 🎯 Objetivos & Métricas

### Objetivos de Negócio
- **Recall Automation:** 90% dos recalls enviados automaticamente
- **Response Rate:** 40% de taxa de resposta em campanhas de recall
- **Booking Conversion:** 25% de conversão para agendamento
- **Revenue Impact:** 15% aumento em serviços preventivos

### Métricas Técnicas
- **Trigger Accuracy:** 99% dos triggers disparados no tempo correto
- **Delivery Rate:** 95% de entrega bem-sucedida (WhatsApp + Email)
- **Processing Time:** < 30s para processamento de uma jornada
- **Response Handling:** < 1s para captura de interações

---

## 👥 Personas & Casos de Uso

### Persona Principal: Clínica Veterinária
**Cenário:** "Quero que todos os cães sejam lembrados da vacina anual automaticamente"
**Input:** Configuração de jornada + dados do animal
**Output:** Sequência de lembretes até agendamento

### Persona Secundária: Proprietário do Pet
**Cenário:** "Recebo lembrete sobre vermifugação do Rex e posso agendar direto pelo WhatsApp"
**Input:** Resposta ao lembrete
**Output:** Agendamento confirmado na agenda

---

## ⚙️ Especificação Funcional

### 🎯 Tipos de Jornadas
**RF-10.1: Campanhas de Recall**

**Vacinação Anual:**
- Trigger: 11 meses após última vacina
- Sequência: Lembrete → Follow-up (7 dias) → Last call (14 dias)
- Personalização: Idade do animal, histórico de vacinação

**Vermifugação:**
- Trigger: A cada 3-6 meses baseado no protocolo
- Sequência: Lembrete preventivo → Agendamento facilitado
- Personalização: Peso do animal, ambiente (interno/externo)

**Check-ups Geriátricos:**
- Trigger: Animais > 7 anos, a cada 6 meses
- Sequência: Educativo → Lembrete → Urgência gradual
- Personalização: Raça, histórico de saúde

```typescript
interface JourneyTemplate {
  id: string
  name: string
  category: 'vaccination' | 'checkup' | 'treatment' | 'preventive'
  triggers: JourneyTrigger[]
  steps: JourneyStep[]
  personalizations: PersonalizationRule[]
  successMetrics: string[]
}

interface JourneyTrigger {
  type: 'date_based' | 'event_based' | 'condition_based'
  condition: string // "last_vaccine + 11 months"
  filters: AnimalFilter[] // age, species, breed
}
```

### 📋 Configuração de Jornadas
**RF-10.2: Template System**

**Biblioteca de Templates:**
- Templates pré-configurados por especialidade
- Customização de timing e mensagens
- Aprovação médica veterinária obrigatória
- Versionamento de templates

**Personalização Avançada:**
```typescript
interface JourneyPersonalization {
  animal_conditions: {
    age_groups: ['puppy', 'adult', 'senior']
    health_status: ['healthy', 'chronic', 'recovering']
    breed_specific: BreedRecommendation[]
  }
  timing_rules: {
    preferred_contact_time: TimeRange
    blackout_periods: DateRange[] // férias, feriados
    urgency_escalation: EscalationRule[]
  }
  content_variations: {
    tone: 'professional' | 'friendly' | 'urgent'
    channel_specific: ChannelContent
    multimedia: MediaAsset[]
  }
}
```

**Critérios de Aceite:**
- [ ] Templates editáveis com approval workflow
- [ ] Preview das mensagens antes da ativação
- [ ] A/B testing capability para otimização
- [ ] Compliance com CFMV guidelines

### 🚀 Engine de Automação
**RF-10.3: Journey Execution**

**Trigger Engine:**
- Processamento batch diário para triggers baseados em data
- Real-time processing para triggers baseados em eventos
- Condition evaluation com animal/owner context
- Deduplication para evitar spam

**Message Orchestration:**
```typescript
class JourneyOrchestrator {
  async triggerJourney(animalId: string, journeyTemplate: JourneyTemplate): Promise<JourneyInstance>
  async processNextStep(journeyInstance: JourneyInstance): Promise<void>
  async handleResponse(journeyInstance: JourneyInstance, response: CustomerResponse): Promise<void>
  async pauseJourney(journeyInstanceId: string, reason: string): Promise<void>
}

interface JourneyInstance {
  id: string
  templateId: string
  animalId: string
  currentStep: number
  status: 'active' | 'paused' | 'completed' | 'cancelled'
  variables: Record<string, any> // personalization data
  timeline: JourneyEvent[]
  nextAction: Date
}
```

**Critérios de Aceite:**
- [ ] Triggers processados com 99% de precisão
- [ ] Fallback mechanism para delivery failures
- [ ] Rate limiting para evitar spam
- [ ] Pausar jornadas durante tratamento ativo

### 📱 Canais de Comunicação
**RF-10.4: Multi-channel Delivery**

**WhatsApp Business API:**
- Templates aprovados pelo Meta
- Rich media support (imagens, documentos)
- Interactive buttons para agendamento
- Status tracking (entregue, lido, respondido)

**Email Marketing:**
- HTML templates responsivos
- Personalização com dados do animal
- Call-to-action direto para agendamento
- Tracking de abertura e cliques

**SMS (Futuro):**
- Backup channel para WhatsApp failures
- Mensagens concisas com link para agendamento
- Opt-out compliance

```typescript
interface DeliveryChannel {
  type: 'whatsapp' | 'email' | 'sms'
  priority: number
  failover: DeliveryChannel | null
  templates: MessageTemplate[]
  capabilities: ChannelCapability[]
}

interface MessageTemplate {
  id: string
  name: string
  channel: string
  subject?: string // email only
  content: string
  variables: TemplateVariable[]
  media_attachments?: MediaAsset[]
  interactive_elements?: InteractiveElement[]
}
```

### 📅 Integração com Agendamento
**RF-10.5: Booking Integration**

**One-click Scheduling:**
- Botões de agendamento direto nas mensagens
- Disponibilidade em tempo real
- Confirmação automática
- Sync com agenda da clínica

**Appointment Flow:**
```typescript
interface AppointmentRequest {
  journey_instance_id: string
  animal_id: string
  service_type: string
  preferred_dates: Date[]
  notes?: string
}

class BookingIntegration {
  async getAvailableSlots(clinicId: string, serviceType: string, date: Date): Promise<TimeSlot[]>
  async createAppointment(request: AppointmentRequest): Promise<Appointment>
  async sendConfirmation(appointment: Appointment): Promise<void>
  async handleReschedule(appointmentId: string, newSlot: TimeSlot): Promise<void>
}
```

**Critérios de Aceite:**
- [ ] Integração seamless com sistema de agenda
- [ ] Disponibilidade em tempo real
- [ ] Confirmação automática via canal preferido
- [ ] Reminder automático 24h antes

---

## 🏗️ Especificação Técnica

### Stack Tecnológico
- **Journey Engine:** Node.js com Bull Queue para processing
- **Database:** PostgreSQL com triggers temporais
- **Message Queue:** Redis para orchestration
- **WhatsApp:** Meta Business API
- **Email:** SendGrid ou Amazon SES
- **Scheduling:** Cron jobs + event-driven triggers

### Arquitetura do Sistema
```typescript
// Core journey engine
class JourneyEngine {
  private triggerProcessor: TriggerProcessor
  private messageOrchestrator: MessageOrchestrator
  private responseHandler: ResponseHandler
  
  async startJourney(animalId: string, journeyType: string): Promise<JourneyInstance>
  async processStep(journeyInstanceId: string): Promise<void>
  async handleInboundMessage(message: InboundMessage): Promise<void>
}

// Trigger processing
class TriggerProcessor {
  async evaluateDateTriggers(): Promise<TriggerEvent[]> {
    // Daily batch job para date-based triggers
  }
  
  async evaluateEventTriggers(event: SystemEvent): Promise<TriggerEvent[]> {
    // Real-time processing para event-based triggers
  }
}

// Message delivery
class MessageOrchestrator {
  async sendMessage(journeyInstance: JourneyInstance, step: JourneyStep): Promise<DeliveryResult>
  async handleDeliveryFailure(deliveryResult: DeliveryResult): Promise<void>
  async processScheduledMessages(): Promise<void>
}
```

### Modelo de Dados
```sql
-- Templates de jornada
JourneyTemplate {
  id: uuid PRIMARY KEY,
  name: text NOT NULL,
  category: text NOT NULL,
  description: text,
  isActive: boolean DEFAULT true,
  triggers: jsonb NOT NULL,
  steps: jsonb NOT NULL,
  personalizations: jsonb,
  approvedBy: uuid REFERENCES users(id),
  approvedAt: timestamp,
  createdBy: uuid REFERENCES users(id),
  createdAt: timestamp DEFAULT now(),
  updatedAt: timestamp DEFAULT now()
}

-- Instâncias de jornada
JourneyInstance {
  id: uuid PRIMARY KEY,
  templateId: uuid REFERENCES journey_templates(id),
  animalId: uuid REFERENCES animals(id),
  ownerId: uuid REFERENCES pet_owners(id),
  status: text NOT NULL DEFAULT 'active',
  currentStep: integer DEFAULT 0,
  variables: jsonb, -- dados de personalização
  nextActionAt: timestamp,
  startedAt: timestamp DEFAULT now(),
  completedAt: timestamp,
  pausedReason: text,
  INDEX idx_next_action (nextActionAt) WHERE status = 'active'
}

-- Eventos da jornada
JourneyEvent {
  id: uuid PRIMARY KEY,
  journeyInstanceId: uuid REFERENCES journey_instances(id),
  eventType: text NOT NULL, -- step_started, message_sent, response_received
  stepNumber: integer,
  channel: text,
  messageId: text,
  response: jsonb,
  metadata: jsonb,
  occurredAt: timestamp DEFAULT now()
}

-- Triggers agendados
ScheduledTrigger {
  id: uuid PRIMARY KEY,
  animalId: uuid REFERENCES animals(id),
  triggerType: text NOT NULL,
  triggerData: jsonb NOT NULL,
  scheduledFor: date NOT NULL,
  isProcessed: boolean DEFAULT false,
  processedAt: timestamp,
  journeyInstanceId: uuid REFERENCES journey_instances(id),
  INDEX idx_scheduled_pending (scheduledFor) WHERE NOT isProcessed
}
```

---

## 📬 Sistema de Messaging

### WhatsApp Business API
```typescript
// WhatsApp template management
class WhatsAppTemplateManager {
  async createTemplate(template: WhatsAppTemplate): Promise<string> {
    // Submit to Meta for approval
  }
  
  async sendTemplateMessage(to: string, templateName: string, params: string[]): Promise<MessageResult>
  
  async sendInteractiveMessage(to: string, message: InteractiveMessage): Promise<MessageResult>
}

interface WhatsAppTemplate {
  name: string
  category: 'MARKETING' | 'UTILITY' | 'AUTHENTICATION'
  language: string
  header?: TemplateHeader
  body: TemplateBody
  footer?: TemplateFooter
  buttons?: TemplateButton[]
}

// Interactive elements for booking
interface BookingButton {
  type: 'quick_reply'
  reply: {
    id: string // journey_instance_id + action
    title: string // "Agendar agora"
  }
}
```

### Email Templates
```typescript
// Email template engine
class EmailTemplateEngine {
  async renderTemplate(templateId: string, variables: TemplateVariables): Promise<RenderedEmail>
  async sendPersonalizedEmail(recipient: EmailRecipient, template: EmailTemplate): Promise<EmailResult>
}

interface EmailTemplate {
  id: string
  subject: string
  htmlContent: string
  textContent: string
  variables: TemplateVariable[]
  attachments?: EmailAttachment[]
}

// Tracking and analytics
interface EmailMetrics {
  messageId: string
  sent: boolean
  delivered: boolean
  opened: boolean
  clicked: boolean
  bounced: boolean
  unsubscribed: boolean
}
```

---

## 🔧 Triggers e Condições

### Date-based Triggers
```typescript
// Trigger evaluation engine
class TriggerEvaluator {
  async evaluateVaccinationTriggers(): Promise<VaccinationTrigger[]> {
    // Query animals due for vaccination
    const sql = `
      SELECT a.id, a.name, v.administeredAt, v.nextDueDate
      FROM animals a
      JOIN vaccinations v ON a.id = v.animalId
      WHERE v.nextDueDate <= CURRENT_DATE + INTERVAL '7 days'
      AND v.status = 'administered'
      AND NOT EXISTS (
        SELECT 1 FROM journey_instances ji 
        WHERE ji.animalId = a.id 
        AND ji.templateId = 'vaccination_recall'
        AND ji.status IN ('active', 'completed')
        AND ji.startedAt > v.administeredAt
      )
    `
  }
  
  async evaluateCheckupTriggers(): Promise<CheckupTrigger[]> {
    // Query animals due for regular checkups
  }
}

// Business rules
interface TriggerRule {
  id: string
  name: string
  condition: string // SQL-like condition
  cooldownPeriod: Duration // prevent duplicate triggers
  filters: AnimalFilter[]
}
```

### Event-based Triggers
```typescript
// System events that can trigger journeys
interface SystemEvent {
  type: 'appointment_completed' | 'vaccination_administered' | 'treatment_started' | 'pet_registered'
  entityId: string
  data: any
  timestamp: Date
}

class EventTriggerHandler {
  @EventHandler('appointment_completed')
  async handleAppointmentCompleted(event: AppointmentCompletedEvent): Promise<void> {
    // Start follow-up journey
    if (event.serviceType === 'vaccination') {
      await this.journeyEngine.startJourney(event.animalId, 'next_vaccination_reminder')
    }
  }
  
  @EventHandler('pet_registered')
  async handlePetRegistered(event: PetRegisteredEvent): Promise<void> {
    // Start welcome journey with preventive care education
    await this.journeyEngine.startJourney(event.animalId, 'welcome_preventive_care')
  }
}
```

---

## 🤖 Personalização e AI

### Content Personalization
```typescript
// AI-powered content generation
class ContentPersonalizer {
  async personalizeMessage(template: MessageTemplate, context: PersonalizationContext): Promise<string> {
    // Use OpenAI to adapt tone and content based on:
    // - Animal characteristics (age, breed, health status)
    // - Owner communication history
    // - Previous campaign responses
  }
  
  async optimizeDeliveryTiming(animalId: string, ownerId: string): Promise<OptimalTiming> {
    // Analyze response patterns to determine best sending time
  }
}

interface PersonalizationContext {
  animal: Animal
  owner: PetOwner
  clinic: Clinic
  previousInteractions: CustomerInteraction[]
  responseHistory: ResponseAnalytics
}

// A/B testing framework
class CampaignOptimizer {
  async createVariant(original: MessageTemplate, optimizationType: OptimizationType): Promise<MessageTemplate>
  async trackVariantPerformance(variant: string, metrics: CampaignMetrics): Promise<void>
  async selectWinningVariant(campaignId: string): Promise<MessageTemplate>
}
```

### Smart Recommendations
```typescript
// Recommendation engine
class JourneyRecommendationEngine {
  async recommendNextActions(journeyInstance: JourneyInstance): Promise<Recommendation[]> {
    // Analyze response patterns and suggest optimizations
  }
  
  async suggestJourneyImprovements(templateId: string): Promise<Improvement[]> {
    // Machine learning insights from campaign performance
  }
}

interface Recommendation {
  type: 'timing' | 'content' | 'channel' | 'followup'
  confidence: number
  description: string
  expectedImpact: {
    responseRate: number
    conversionRate: number
  }
}
```

---

## 📊 Analytics e Reporting

### Journey Analytics
```typescript
// Performance tracking
interface JourneyAnalytics {
  templateId: string
  totalInstances: number
  completionRate: number
  responseRate: number
  conversionRate: number
  averageResponseTime: Duration
  channelPerformance: ChannelMetrics[]
  stepAnalysis: StepMetrics[]
}

interface StepMetrics {
  stepNumber: number
  stepName: string
  deliveryRate: number
  responseRate: number
  dropoffRate: number
  conversionRate: number
}

// Real-time dashboard
class JourneyDashboard {
  async getActiveJourneys(clinicId: string): Promise<ActiveJourneysSummary>
  async getPerformanceMetrics(templateId: string, period: DateRange): Promise<JourneyAnalytics>
  async getResponseAnalysis(journeyInstanceId: string): Promise<ResponseAnalysis>
}
```

### Reporting & Insights
```typescript
// Automated reporting
class JourneyReportGenerator {
  async generateMonthlyReport(clinicId: string, month: Date): Promise<MonthlyJourneyReport>
  async generateCampaignAnalysis(templateId: string): Promise<CampaignAnalysisReport>
  async generateROIReport(clinicId: string, period: DateRange): Promise<ROIReport>
}

interface MonthlyJourneyReport {
  period: DateRange
  summary: {
    totalJourneysStarted: number
    totalAppointmentsBooked: number
    totalRevenue: number
    topPerformingJourneys: JourneyPerformance[]
  }
  insights: ReportInsight[]
  recommendations: ReportRecommendation[]
}
```

---

## 🔒 Compliance e Regulamentação

### CFMV Compliance
- **Professional Oversight:** Todos os templates aprovados por médico veterinário
- **Medical Accuracy:** Informações revisadas e validadas
- **Ethical Guidelines:** Aderência às normas do CFMV
- **Documentation:** Rastreabilidade completa das comunicações

### LGPD Compliance
```typescript
// Privacy controls
class PrivacyManager {
  async getOwnerConsent(ownerId: string): Promise<ConsentStatus>
  async updateConsentPreferences(ownerId: string, preferences: ConsentPreferences): Promise<void>
  async handleDataDeletionRequest(ownerId: string): Promise<void>
  async auditJourneyCompliance(journeyInstanceId: string): Promise<ComplianceReport>
}

interface ConsentPreferences {
  allowWhatsApp: boolean
  allowEmail: boolean
  allowSMS: boolean
  preferredFrequency: 'weekly' | 'monthly' | 'as_needed'
  dataRetentionPeriod: Duration
}
```

### Channel Compliance
- **WhatsApp:** Templates aprovados pelo Meta, opt-out handling
- **Email:** CAN-SPAM compliance, unsubscribe links
- **SMS:** TCPA compliance, carrier guidelines

---

## 🧪 Testes & Qualidade

### Test Strategy
```typescript
// Journey testing framework
class JourneyTestSuite {
  async testTriggerEvaluation(): Promise<TestResult[]>
  async testMessageDelivery(): Promise<TestResult[]>
  async testResponseHandling(): Promise<TestResult[]>
  async testPersonalization(): Promise<TestResult[]>
}

// Integration tests
class JourneyIntegrationTests {
  async testWhatsAppIntegration(): Promise<void>
  async testEmailDelivery(): Promise<void>
  async testBookingIntegration(): Promise<void>
  async testFullJourneyFlow(): Promise<void>
}
```

### Quality Metrics
- **Trigger Accuracy:** 99% triggers fired at correct time
- **Delivery Success:** 95% successful delivery rate
- **Response Processing:** 99% inbound messages processed correctly
- **Data Integrity:** 100% journey state consistency

---

## 📈 Métricas & Monitoramento

### Business KPIs
- **Journey Completion Rate:** % de jornadas que chegam ao fim
- **Appointment Conversion:** % de jornadas que resultam em agendamento
- **Revenue per Journey:** ROI médio por jornada executada
- **Customer Satisfaction:** NPS de donos que receberam recalls

### Technical Metrics
- **Processing Latency:** Tempo entre trigger e primeiro envio
- **Queue Health:** Backlog size e processing rate
- **Channel Availability:** Uptime dos canais de comunicação
- **Error Rates:** Falhas por tipo e canal

### Alerting
```yaml
alerts:
  trigger_processing_delay:
    condition: "processing_time > 1_hour"
    severity: "high"
    
  delivery_failure_spike:
    condition: "failure_rate > 10% in 15_minutes"
    severity: "critical"
    
  journey_completion_drop:
    condition: "completion_rate < 50% for 24_hours"
    severity: "medium"
```

---

## 🔮 Roadmap & Evoluções

### Fase 3 (MVP)
- ✅ **Core Journeys:** Vacinação, vermifugação, check-ups básicos
- ✅ **WhatsApp + Email:** Dois canais principais
- ✅ **Basic Personalization:** Nome do animal, timing básico

### Fase 3.1 (Enhanced)
- 📅 **Advanced Triggers:** Machine learning para timing otimizado
- 📅 **Rich Templates:** Vídeos, carrosséis, documentos
- 📅 **A/B Testing:** Otimização automática de campanhas

### Fase 4 (AI-Powered)
- 🔮 **Predictive Journeys:** AI prevê quando pet precisa de cuidado
- 🔮 **Voice Messages:** WhatsApp voice notes personalizadas
- 🔮 **Sentiment Analysis:** Adaptação baseada em resposta do cliente

---

## ⚠️ Riscos & Mitigações

### Business Risks
- **Owner Fatigue:** Muitas mensagens podem irritar clientes
  - *Mitigação:* Frequency capping + preference management
- **Channel Dependency:** WhatsApp pode mudar políticas
  - *Mitigação:* Multi-channel strategy + SMS backup
- **Compliance Issues:** Regulamentações podem mudar
  - *Mitigação:* Regular legal review + flexible templates

### Technical Risks
- **Scale Challenges:** Milhares de jornadas simultâneas
  - *Mitigação:* Horizontal scaling + queue sharding
- **Data Accuracy:** Triggers baseados em dados incorretos
  - *Mitigação:* Data validation + manual override capability
- **Third-party Failures:** WhatsApp/Email APIs podem falhar
  - *Mitigação:* Circuit breakers + retry logic

---

## 📚 Referências & Links

- **PRD:** Seção 4.5 - F-12 Jornadas automatizadas
- **WhatsApp Business API:** https://developers.facebook.com/docs/whatsapp
- **CFMV Guidelines:** Resolução sobre comunicação veterinária
- **Dependencies:** F-3 (Brand Voice), F-8 (Publisher), F-6 (Agendamento)

---

## ✅ Definition of Done

### Funcional
- [ ] Journey templates configuráveis
- [ ] Multi-channel delivery (WhatsApp + Email)
- [ ] Booking integration funcionando
- [ ] Response handling automático
- [ ] Personalization engine ativo
- [ ] Analytics dashboard completo

### Técnico
- [ ] Trigger engine com 99% accuracy
- [ ] Message queue system robusto
- [ ] Error handling completo
- [ ] Rate limiting implementado
- [ ] LGPD compliance validado

### Qualidade
- [ ] Load testing com 10k jornadas simultâneas
- [ ] Integration testing com todas as APIs
- [ ] Message delivery > 95% success rate
- [ ] Response time < 30s para processamento
- [ ] Security review aprovado

---

*Última atualização: Setembro 2025*