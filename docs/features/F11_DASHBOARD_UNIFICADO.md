# F-11: Dashboard Unificado

**Versão:** 1.0  
**Status:** 📋 Backlog  
**Fase:** 4 - Inteligência e Escala  
**Prioridade:** P2 - Média  
**Responsável:** Frontend + Product Analytics  

---

## 📋 Visão Geral

**Objetivo:** Dashboard executivo que consolida todos os KPIs de negócio (agendamentos, receita, crescimento, satisfação) com drill-down capabilities e insights acionáveis para tomada de decisão estratégica.

**Proposta de Valor:** Visão 360° da saúde do negócio em tempo real, permitindo decisões rápidas e baseadas em dados para otimização contínua da operação.

**Job-to-be-Done:** "Como gestor de clínica veterinária, preciso entender rapidamente como está meu negócio e onde focar para crescer de forma sustentável."

---

## 🎯 Objetivos & Métricas

### Objetivos de Negócio
- **Executive Overview:** 100% dos KPIs críticos em uma tela
- **Actionable Insights:** 3-5 recomendações específicas por semana
- **Drill-down Capability:** Análise detalhada em < 3 cliques
- **Real-time Updates:** Métricas atualizadas a cada 15 minutos

### Métricas Técnicas
- **Dashboard Load:** < 2s para carregar dashboard completo
- **Query Performance:** < 500ms para drill-downs
- **Data Freshness:** < 15 min lag para métricas críticas
- **Mobile Performance:** 100% responsivo em tablets/smartphones

---

## 👥 Personas & Casos de Uso

### Persona Principal: Proprietário/Gestor de Clínica
**Cenário:** "Chegando na clínica às 8h, quero saber como foi ontem e o que precisa de atenção hoje"
**Input:** Acesso ao dashboard
**Output:** Snapshot executivo + ações prioritárias

### Persona Secundária: Coordenador Administrativo
**Cenário:** "Preciso preparar relatório semanal para o proprietário sobre performance operacional"
**Input:** Período + filtros específicos
**Output:** Relatório executivo com insights

---

## ⚙️ Especificação Funcional

### 📊 Executive Overview
**RF-11.1: KPIs Principais**

**Métricas de Receita:**
- Revenue atual vs. meta vs. período anterior
- ARR (Annual Recurring Revenue) e crescimento
- Average ticket por consulta/procedimento
- Receita por canal (consultório, produtos, preventivos)

**Métricas Operacionais:**
- Total de agendamentos e ocupação
- No-show rate e cancelamentos
- Tempo médio de consulta
- Utilização de salas/equipamentos

**Métricas de Crescimento:**
- Novos clientes adquiridos
- Taxa de retenção de clientes
- Customer Lifetime Value (CLV)
- Net Promoter Score (NPS)

```typescript
interface ExecutiveMetrics {
  revenue: {
    current_month: number
    target: number
    previous_period: number
    growth_rate: number
    arr: number
    average_ticket: number
  }
  operations: {
    appointments_total: number
    occupancy_rate: number
    no_show_rate: number
    average_consultation_time: number
  }
  growth: {
    new_customers: number
    retention_rate: number
    clv: number
    nps_score: number
  }
}
```

### 📈 Visual Dashboard Components
**RF-11.2: Dashboard Layout**

**Hero Metrics Cards:**
- Revenue atual com sparkline de tendência
- Agendamentos do dia/semana
- NPS score com histórico
- Ocupação em tempo real

**Trend Charts:**
- Revenue trend (últimos 12 meses)
- Customer acquisition trend
- Service mix evolution
- Satisfaction score evolution

**Performance Tables:**
- Top performing services
- Customer segments analysis
- Staff productivity metrics
- Marketing channel ROI

```typescript
interface DashboardLayout {
  hero_section: {
    primary_kpis: KPICard[]
    quick_actions: ActionButton[]
  }
  charts_section: {
    revenue_trend: ChartConfig
    customer_metrics: ChartConfig
    operational_metrics: ChartConfig
  }
  tables_section: {
    performance_rankings: TableConfig
    alerts_notifications: AlertsConfig
  }
  insights_section: {
    ai_recommendations: InsightCard[]
    anomaly_alerts: AnomalyCard[]
  }
}
```

**Critérios de Aceite:**
- [ ] Layout responsivo para desktop, tablet e mobile
- [ ] Drag & drop customization de widgets
- [ ] Export capabilities (PDF, Excel, PNG)
- [ ] Real-time updates sem refresh da página

### 🔍 Drill-Down Capabilities
**RF-11.3: Interactive Analysis**

**Revenue Deep Dive:**
- Breakdown por serviço/produto
- Análise temporal com comparações
- Segmentação por cliente/pet
- Margem de contribuição por categoria

**Customer Analytics:**
- Segmentação por valor/frequência
- Churn analysis e prevenção
- Geographic distribution
- Demographic insights

**Operational Analysis:**
- Schedule optimization insights
- Resource utilization details
- Staff performance metrics
- Service delivery analytics

```typescript
interface DrillDownCapability {
  metric: string
  dimensions: string[] // service, time, customer, location
  filters: FilterOption[]
  aggregations: AggregationType[] // sum, avg, count, rate
  comparisons: ComparisonType[] // period, cohort, benchmark
}

class DrillDownEngine {
  async analyzeMetric(
    metric: string, 
    dimensions: string[], 
    filters: Record<string, any>
  ): Promise<DrillDownResult>
  
  async generateInsights(analysis: DrillDownResult): Promise<Insight[]>
  
  async exportAnalysis(analysis: DrillDownResult, format: ExportFormat): Promise<Buffer>
}
```

### 🚨 Alerts & Notifications
**RF-11.4: Proactive Monitoring**

**Business Alerts:**
- Revenue abaixo da meta (threshold configurável)
- No-show rate acima do normal
- Customer churn spike detectado
- NPS score declining

**Operational Alerts:**
- Schedule overbooking detected
- Equipment maintenance due
- Staff productivity alerts
- Inventory low levels

**Opportunity Alerts:**
- High-value customer due for visit
- Seasonal service opportunity
- Cross-sell opportunity identified
- Marketing campaign performing well

```typescript
interface AlertRule {
  id: string
  name: string
  metric: string
  condition: AlertCondition
  threshold: number
  severity: 'low' | 'medium' | 'high' | 'critical'
  notification_channels: NotificationChannel[]
  is_active: boolean
}

interface AlertCondition {
  operator: '>' | '<' | '=' | 'trend_up' | 'trend_down' | 'anomaly'
  comparison_period?: 'previous_day' | 'previous_week' | 'previous_month'
  duration?: number // minutes for sustained condition
}

class AlertingEngine {
  async evaluateAlerts(): Promise<Alert[]>
  async sendNotification(alert: Alert, channels: NotificationChannel[]): Promise<void>
  async acknowledgeAlert(alertId: string, userId: string): Promise<void>
}
```

---

## 🏗️ Especificação Técnica

### Stack Tecnológico
- **Frontend:** React com Chart.js/D3.js para visualizações
- **Backend:** Node.js com aggregation pipelines
- **Database:** PostgreSQL com materialized views para performance
- **Caching:** Redis para queries frequentes
- **Real-time:** WebSockets para updates automáticos

### Data Architecture
```typescript
// Data aggregation service
class MetricsAggregationService {
  async aggregateRevenueMetrics(period: DateRange, granularity: 'day' | 'week' | 'month'): Promise<RevenueMetrics>
  async aggregateOperationalMetrics(period: DateRange): Promise<OperationalMetrics>
  async aggregateCustomerMetrics(period: DateRange): Promise<CustomerMetrics>
  async calculateKPIs(accountId: string): Promise<ExecutiveKPIs>
}

// Real-time updates
class DashboardUpdatesService {
  async subscribeToUpdates(dashboardId: string, userId: string): Promise<EventStream>
  async publishMetricUpdate(metric: string, value: any): Promise<void>
  async calculateIncrementalUpdate(previousState: DashboardState, newData: any): Promise<DashboardDelta>
}
```

### Modelo de Dados
```sql
-- Métricas agregadas materializadas
AggregatedMetrics {
  id: uuid PRIMARY KEY,
  accountId: uuid REFERENCES accounts(id),
  metricType: text NOT NULL, -- revenue, operational, customer
  period: date NOT NULL,
  granularity: text NOT NULL, -- day, week, month, quarter
  dimensions: jsonb, -- breakdowns (service, location, etc.)
  values: jsonb NOT NULL, -- actual metric values
  calculatedAt: timestamp DEFAULT now(),
  UNIQUE(accountId, metricType, period, granularity, dimensions)
}

-- Dashboard configuration
DashboardConfig {
  id: uuid PRIMARY KEY,
  accountId: uuid REFERENCES accounts(id),
  name: text NOT NULL,
  layout: jsonb NOT NULL, -- widget positions and configs
  filters: jsonb, -- default filters
  refreshInterval: integer DEFAULT 900, -- seconds
  isDefault: boolean DEFAULT false,
  createdBy: uuid REFERENCES users(id),
  createdAt: timestamp DEFAULT now(),
  updatedAt: timestamp DEFAULT now()
}

-- Alerts configuration
AlertRule {
  id: uuid PRIMARY KEY,
  accountId: uuid REFERENCES accounts(id),
  name: text NOT NULL,
  description: text,
  metricPath: text NOT NULL, -- revenue.current_month
  condition: jsonb NOT NULL,
  threshold: numeric,
  severity: text NOT NULL,
  notificationConfig: jsonb,
  isActive: boolean DEFAULT true,
  createdBy: uuid REFERENCES users(id),
  createdAt: timestamp DEFAULT now()
}

-- Alert instances
AlertInstance {
  id: uuid PRIMARY KEY,
  ruleId: uuid REFERENCES alert_rules(id),
  triggeredAt: timestamp DEFAULT now(),
  metricValue: numeric,
  threshold: numeric,
  status: text DEFAULT 'active', -- active, acknowledged, resolved
  acknowledgedBy: uuid REFERENCES users(id),
  acknowledgedAt: timestamp,
  resolvedAt: timestamp,
  notificationsSent: jsonb
}
```

---

## 📊 Widgets e Componentes

### KPI Cards
```typescript
interface KPICard {
  id: string
  title: string
  value: number | string
  format: 'currency' | 'percentage' | 'number' | 'duration'
  trend: {
    direction: 'up' | 'down' | 'stable'
    percentage: number
    comparison_period: string
  }
  sparkline?: number[]
  target?: number
  status: 'good' | 'warning' | 'critical'
  drill_down_enabled: boolean
}

// Revenue card example
const revenueCard: KPICard = {
  id: 'revenue_current_month',
  title: 'Receita do Mês',
  value: 45750.00,
  format: 'currency',
  trend: {
    direction: 'up',
    percentage: 12.5,
    comparison_period: 'mês anterior'
  },
  target: 50000.00,
  status: 'warning', // below target but trending up
  drill_down_enabled: true
}
```

### Chart Components
```typescript
interface ChartWidget {
  id: string
  type: 'line' | 'bar' | 'pie' | 'area' | 'combo'
  title: string
  data_source: DataSourceConfig
  chart_config: ChartOptions
  filters: FilterConfig[]
  refresh_interval: number
}

// Revenue trend chart
const revenueTrendChart: ChartWidget = {
  id: 'revenue_trend_12m',
  type: 'line',
  title: 'Evolução da Receita (12 meses)',
  data_source: {
    endpoint: '/api/metrics/revenue/trend',
    params: { period: '12_months', granularity: 'month' }
  },
  chart_config: {
    responsive: true,
    interaction: {
      mode: 'index',
      intersect: false
    },
    plugins: {
      legend: { position: 'top' },
      tooltip: { enabled: true }
    }
  }
}
```

### Interactive Tables
```typescript
interface DataTable {
  id: string
  title: string
  data_source: DataSourceConfig
  columns: TableColumn[]
  pagination: PaginationConfig
  sorting: SortingConfig
  filters: FilterConfig[]
  actions: TableAction[]
}

interface TableColumn {
  key: string
  label: string
  type: 'text' | 'number' | 'currency' | 'percentage' | 'date'
  sortable: boolean
  filterable: boolean
  format?: FormatOptions
  width?: string
}

// Top services performance table
const topServicesTable: DataTable = {
  id: 'top_services_performance',
  title: 'Serviços Mais Rentáveis',
  data_source: {
    endpoint: '/api/analytics/services/performance',
    params: { period: 'last_30_days', limit: 10 }
  },
  columns: [
    { key: 'service_name', label: 'Serviço', type: 'text', sortable: true },
    { key: 'revenue', label: 'Receita', type: 'currency', sortable: true },
    { key: 'appointments', label: 'Consultas', type: 'number', sortable: true },
    { key: 'avg_ticket', label: 'Ticket Médio', type: 'currency', sortable: true },
    { key: 'growth_rate', label: 'Crescimento', type: 'percentage', sortable: true }
  ]
}
```

---

## 🤖 Intelligence Layer

### AI-Powered Insights
```typescript
class BusinessIntelligenceEngine {
  async generateInsights(metrics: ExecutiveMetrics): Promise<BusinessInsight[]> {
    // Analyze patterns and generate actionable insights
    const insights = []
    
    // Revenue analysis
    if (metrics.revenue.growth_rate < -5) {
      insights.push({
        type: 'revenue_decline',
        severity: 'high',
        title: 'Queda na receita detectada',
        description: 'Receita caiu 12% vs. mês anterior',
        recommendations: [
          'Analisar principais serviços com queda',
          'Verificar campaigns de marketing ativas',
          'Revisar preços dos serviços'
        ]
      })
    }
    
    // Operational insights
    if (metrics.operations.no_show_rate > 15) {
      insights.push({
        type: 'operational_efficiency',
        severity: 'medium',
        title: 'Taxa de no-show acima do normal',
        description: 'No-show rate em 18% (normal: <15%)',
        recommendations: [
          'Implementar lembretes automáticos',
          'Revisar política de confirmação',
          'Analisar horários com maior no-show'
        ]
      })
    }
    
    return insights
  }
  
  async predictTrends(historicalData: TimeSeriesData): Promise<TrendPrediction[]> {
    // Machine learning for trend prediction
  }
  
  async identifyOpportunities(businessData: BusinessData): Promise<Opportunity[]> {
    // Cross-sell, upsell, and expansion opportunities
  }
}

interface BusinessInsight {
  id: string
  type: string
  severity: 'low' | 'medium' | 'high' | 'critical'
  title: string
  description: string
  recommendations: string[]
  confidence: number
  supporting_data: any
  created_at: Date
}
```

### Anomaly Detection
```typescript
class AnomalyDetectionEngine {
  async detectAnomalies(metrics: TimeSeriesData): Promise<Anomaly[]> {
    // Statistical analysis for outlier detection
    const anomalies = []
    
    // Revenue anomalies
    const revenueAnomaly = this.detectStatisticalOutliers(metrics.revenue, {
      method: 'z_score',
      threshold: 2.5,
      window_size: 30
    })
    
    // Seasonal adjustments
    const seasonallyAdjusted = this.applySeasonalAdjustment(metrics.revenue)
    
    return anomalies
  }
  
  async classifyAnomaly(anomaly: Anomaly): Promise<AnomalyClassification> {
    // Determine if anomaly is positive, negative, or neutral
  }
}

interface Anomaly {
  metric: string
  value: number
  expected_value: number
  deviation: number
  timestamp: Date
  classification: 'positive' | 'negative' | 'neutral'
  potential_causes: string[]
}
```

---

## 📱 Mobile & Responsiveness

### Mobile-First Design
```typescript
// Responsive dashboard layout
interface ResponsiveLayout {
  breakpoints: {
    mobile: '320px'
    tablet: '768px'
    desktop: '1024px'
    wide: '1440px'
  }
  layout_configs: {
    mobile: MobileLayoutConfig
    tablet: TabletLayoutConfig
    desktop: DesktopLayoutConfig
  }
}

interface MobileLayoutConfig {
  stack_vertically: boolean
  hide_secondary_metrics: boolean
  simplified_charts: boolean
  touch_optimized: boolean
  swipe_navigation: boolean
}

// Mobile-optimized widgets
class MobileWidgetRenderer {
  async renderKPICard(card: KPICard, viewport: ViewportSize): Promise<ReactElement>
  async renderChart(chart: ChartWidget, viewport: ViewportSize): Promise<ReactElement>
  async renderTable(table: DataTable, viewport: ViewportSize): Promise<ReactElement>
}
```

### Progressive Web App Features
```typescript
// PWA capabilities
interface PWAFeatures {
  offline_support: boolean
  push_notifications: boolean
  home_screen_install: boolean
  background_sync: boolean
}

class OfflineDashboard {
  async cacheEssentialData(): Promise<void> {
    // Cache critical metrics for offline viewing
  }
  
  async syncWhenOnline(): Promise<void> {
    // Sync data when connection restored
  }
}
```

---

## 🔔 Notifications & Alerts

### Real-time Notifications
```typescript
class NotificationService {
  async sendPushNotification(userId: string, notification: PushNotification): Promise<void>
  async sendEmailAlert(email: string, alert: EmailAlert): Promise<void>
  async sendSlackAlert(channel: string, alert: SlackAlert): Promise<void>
}

interface PushNotification {
  title: string
  body: string
  icon: string
  badge: string
  data: {
    action: string
    dashboard_url: string
    metric_id: string
  }
}

// Smart notification timing
class NotificationScheduler {
  async determineOptimalTiming(userId: string, notificationType: string): Promise<Date> {
    // Analyze user behavior to optimize notification timing
  }
  
  async respectQuietHours(userId: string, notification: Notification): Promise<boolean> {
    // Check user preferences for quiet hours
  }
}
```

### Alert Management
```typescript
// Alert workflow
class AlertWorkflowManager {
  async createAlert(rule: AlertRule, triggerValue: number): Promise<AlertInstance>
  async escalateAlert(alertId: string): Promise<void>
  async acknowledgeAlert(alertId: string, userId: string, notes?: string): Promise<void>
  async resolveAlert(alertId: string, resolution: string): Promise<void>
}

interface AlertWorkflow {
  initial_notification: NotificationConfig
  escalation_rules: EscalationRule[]
  auto_resolution: AutoResolutionConfig
  follow_up_actions: FollowUpAction[]
}
```

---

## 📊 Reporting & Export

### Executive Reports
```typescript
class ExecutiveReportGenerator {
  async generateMonthlyReport(accountId: string, month: Date): Promise<ExecutiveReport>
  async generateQuarterlyReport(accountId: string, quarter: Quarter): Promise<QuarterlyReport>
  async generateYearlyReport(accountId: string, year: number): Promise<YearlyReport>
}

interface ExecutiveReport {
  period: DateRange
  executive_summary: {
    key_achievements: string[]
    challenges: string[]
    recommendations: string[]
  }
  financial_performance: FinancialMetrics
  operational_performance: OperationalMetrics
  customer_metrics: CustomerMetrics
  market_insights: MarketInsight[]
  appendices: ReportAppendix[]
}

// Custom report builder
class CustomReportBuilder {
  async buildReport(config: ReportConfig): Promise<CustomReport>
  async scheduleRecurringReport(config: ReportConfig, schedule: CronSchedule): Promise<string>
  async exportReport(report: CustomReport, format: ExportFormat): Promise<Buffer>
}
```

### Data Export
```typescript
interface ExportService {
  async exportToPDF(dashboard: DashboardState): Promise<Buffer>
  async exportToExcel(data: TableData[], worksheets: WorksheetConfig[]): Promise<Buffer>
  async exportToCSV(data: any[], filename: string): Promise<string>
  async exportToPNG(chartId: string, resolution: Resolution): Promise<Buffer>
}

// Automated exports
class ScheduledExportService {
  async scheduleExport(config: ExportConfig): Promise<string>
  async sendExportViaEmail(exportData: Buffer, recipients: string[]): Promise<void>
  async uploadToCloudStorage(exportData: Buffer, path: string): Promise<string>
}
```

---

## 🔒 Security & Access Control

### Role-Based Access
```typescript
interface DashboardPermissions {
  view_financial_data: boolean
  view_customer_data: boolean
  view_staff_metrics: boolean
  export_reports: boolean
  configure_alerts: boolean
  admin_dashboard: boolean
}

class AccessControlService {
  async checkPermission(userId: string, permission: string): Promise<boolean>
  async filterDashboardData(data: DashboardData, userPermissions: DashboardPermissions): Promise<DashboardData>
  async auditDashboardAccess(userId: string, action: string, resource: string): Promise<void>
}
```

### Data Privacy
```typescript
// LGPD compliance for dashboard
class DashboardPrivacyManager {
  async anonymizeCustomerData(data: CustomerMetrics): Promise<AnonymizedMetrics>
  async handleDataDeletionRequest(customerId: string): Promise<void>
  async generatePrivacyReport(period: DateRange): Promise<PrivacyReport>
}
```

---

## 📈 Métricas & Monitoramento

### Product KPIs
- **Dashboard Adoption:** % de usuários que acessam dashboard semanalmente
- **Insight Actionability:** % de insights que resultam em ações
- **Alert Response Time:** Tempo médio para responder a alertas críticos
- **Export Usage:** Frequência de geração de relatórios

### Technical Metrics
- **Dashboard Load Time:** P95 < 2s para dashboard completo
- **Query Performance:** P95 < 500ms para drill-downs
- **Data Freshness:** < 15 min lag para métricas críticas
- **Uptime:** 99.9% availability

### User Experience
- **Time to Insight:** Tempo para encontrar informação relevante
- **Mobile Usage:** % de acessos via mobile/tablet
- **Feature Discovery:** % de usuários que exploram drill-downs
- **User Satisfaction:** Rating do dashboard functionality

---

## 🔮 Roadmap & Evoluções

### Fase 4 (MVP)
- ✅ **Core KPIs:** Revenue, operational, customer metrics
- ✅ **Basic Drill-down:** Análise detalhada por dimensão
- ✅ **Mobile Responsive:** Layout adaptável

### Fase 4.1 (Enhanced)
- 📅 **AI Insights:** Recommendations automáticas
- 📅 **Custom Dashboards:** Layout personalizável
- 📅 **Advanced Alerts:** Machine learning para anomalias

### Fase 5 (Advanced)
- 🔮 **Predictive Analytics:** Forecasting com ML
- 🔮 **Competitive Benchmarking:** Comparação com mercado
- 🔮 **Voice Interface:** Dashboard controlado por voz

---

## ⚠️ Riscos & Mitigações

### Data Risks
- **Information Overload:** Muitas métricas podem confundir usuários
  - *Mitigação:* Progressive disclosure + role-based views
- **Data Quality Issues:** Métricas incorretas podem levar a decisões ruins
  - *Mitigação:* Data validation + source attribution
- **Performance Degradation:** Queries complexas podem ser lentas
  - *Mitigação:* Materialized views + intelligent caching

### Business Risks
- **Over-reliance on Metrics:** Decisões puramente baseadas em dados
  - *Mitigação:* Context provision + qualitative insights
- **Alert Fatigue:** Muitos alertas podem ser ignorados
  - *Mitigação:* Smart prioritization + ML-based filtering

---

## 📚 Referências & Links

- **PRD:** Seção 4.6 - F-13 Dashboard unificado de KPIs
- **Dependencies:** F-9 (Analytics), F-10 (Journeys), F-6 (AI Content)
- **Design System:** Componentes de dashboard e visualização
- **Analytics Framework:** Métricas e KPIs do negócio

---

## ✅ Definition of Done

### Funcional
- [ ] Dashboard executivo com KPIs principais
- [ ] Drill-down interativo funcionando
- [ ] Sistema de alertas configurável
- [ ] Relatórios executivos automáticos
- [ ] Mobile responsiveness completa
- [ ] Export capabilities funcionais

### Técnico
- [ ] Performance < 2s para dashboard load
- [ ] Real-time updates via WebSockets
- [ ] Materialized views para agregações
- [ ] Cache strategy implementada
- [ ] Error handling robusto

### Qualidade
- [ ] Load testing com datasets grandes
- [ ] Cross-device testing completo
- [ ] Accessibility compliance (WCAG 2.1)
- [ ] Security review aprovado
- [ ] User testing com gestores de clínica

---

*Última atualização: Setembro 2025*