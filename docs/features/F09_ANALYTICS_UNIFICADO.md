# F-9: Analytics Unificado

**Versão:** 1.0  
**Status:** 📋 Backlog  
**Fase:** 3 - Publicação e Análise  
**Prioridade:** P1 - Alta  
**Responsável:** Backend + Analytics  

---

## 📋 Visão Geral

**Objetivo:** Dashboard unificado com KPIs de engajamento, tráfego e conversão consolidados de múltiplas plataformas em um local único com filtros avançados e insights acionáveis.

**Proposta de Valor:** Visão 360° da performance de marketing em um dashboard que permite decisões baseadas em dados e otimização contínua da estratégia.

**Job-to-be-Done:** "Como gestor de marketing pet, preciso entender o ROI das minhas ações em todas as plataformas para otimizar investimento e estratégia."

---

## 🎯 Objetivos & Métricas

### Objetivos de Negócio
- **Unified View:** 100% das métricas importantes em um lugar
- **Real-time Updates:** Dados atualizados a cada 15 min
- **Actionable Insights:** Recomendações automáticas baseadas em performance
- **ROI Tracking:** Correlação entre ações e resultados de negócio

### Métricas Técnicas
- **Dashboard Load:** < 3s para carregar métricas completas
- **Data Freshness:** < 15 min de lag para métricas críticas
- **Query Performance:** < 1s para filtros e drill-downs
- **Export Speed:** < 30s para relatórios completos

---

## 👥 Personas & Casos de Uso

### Persona Principal: Proprietário de Clínica
**Cenário:** "Quero saber se meus posts sobre vacinação estão gerando agendamentos"
**Input:** Período + filtro por tema
**Output:** Correlação entre posts e conversões

### Persona Secundária: Social Media Manager
**Cenário:** "Preciso otimizar horários de posting baseado em engajamento"
**Input:** Análise temporal + por plataforma
**Output:** Recommendations de timing otimizado

---

## ⚙️ Especificação Funcional

### 📊 Métricas Core
**RF-9.1: KPIs Essenciais**
- **Engajamento:** Curtidas, comentários, compartilhamentos, salvos
- **Alcance:** Impressões, alcance único, frequência
- **Tráfego:** Cliques, CTR, tráfego para site/whatsapp
- **Conversão:** Leads gerados, agendamentos, vendas
- **Performance:** Engagement rate, CPM, CPC, ROAS

**Métricas por Plataforma:**
```json
{
  "instagram": {
    "post_metrics": ["likes", "comments", "saves", "shares", "reach"],
    "story_metrics": ["views", "exits", "replies", "link_clicks"],
    "account_metrics": ["followers", "profile_visits", "website_clicks"]
  },
  "facebook": {
    "post_metrics": ["reactions", "comments", "shares", "clicks", "reach"],
    "page_metrics": ["page_likes", "page_views", "actions_on_page"]
  },
  "google_business": {
    "post_metrics": ["views", "clicks", "calls", "direction_requests"],
    "profile_metrics": ["searches", "views", "actions"]
  }
}
```

### 🔍 Filtros e Segmentação
**RF-9.2: Análise Dimensional**
- **Período:** Última semana, mês, trimestre, custom range
- **Plataformas:** Individual ou combinado
- **Tipo de Conteúdo:** Educativo, promocional, recall, engajamento
- **Campanhas:** Performance por campanha específica
- **Demografia:** Idade, gênero, localização (quando disponível)
- **Dispositivo:** Mobile vs. desktop

**Critérios de Aceite:**
- [ ] Filtros múltiplos aplicáveis simultaneamente
- [ ] Persistência de filtros entre sessões
- [ ] Quick filters para períodos comuns
- [ ] Reset filters functionality

### 📈 Visualizações e Dashboards
**RF-9.3: Interface de Analytics**
- **Overview Dashboard:** KPIs principais em cards
- **Trend Charts:** Evolução temporal das métricas
- **Comparison Views:** Período vs. período anterior
- **Platform Breakdown:** Performance por canal
- **Content Performance:** Top/bottom performing posts
- **Funnel Analysis:** Da impressão à conversão

**Componentes de Dashboard:**
```typescript
interface DashboardConfig {
  overview: {
    kpi_cards: ['total_reach', 'engagement_rate', 'conversions', 'roas']
    time_period: 'last_30_days'
  }
  charts: {
    engagement_trend: { type: 'line', period: 'daily' }
    platform_breakdown: { type: 'pie', metric: 'reach' }
    content_performance: { type: 'bar', top_n: 10 }
  }
  tables: {
    recent_posts: { limit: 20, sort_by: 'engagement_rate' }
    campaign_summary: { group_by: 'campaign', period: 'last_month' }
  }
}
```

### 🎯 Insights e Recomendações
**RF-9.4: Intelligence Layer**
- **Performance Insights:** "Seus posts educativos têm 40% mais engajamento"
- **Timing Recommendations:** "Publique terças às 18h para máximo alcance"
- **Content Suggestions:** "Conteúdo sobre vacinação performa melhor em março"
- **Anomaly Detection:** Alertas para drops/spikes anormais
- **Competitive Benchmarks:** Como você se compara ao setor (futuro)

**Critérios de Aceite:**
- [ ] Insights gerados automaticamente baseados em dados
- [ ] Recommendations acionáveis e específicas
- [ ] Anomaly detection com alertas
- [ ] Trending topics identification

---

## 🏗️ Especificação Técnica

### Stack Tecnológico
- **Data Collection:** Platform APIs + webhooks
- **Data Storage:** PostgreSQL + TimescaleDB para séries temporais
- **Processing:** ETL jobs com Node.js/Python
- **Visualization:** Chart.js, D3.js ou similar
- **Caching:** Redis para queries frequentes
- **Export:** PDF/Excel generation

### Arquitetura do Sistema
```typescript
// Analytics service
class AnalyticsService {
  async getOverviewMetrics(accountId: string, filters: AnalyticsFilters): Promise<OverviewMetrics>
  async getTrendData(accountId: string, metric: string, period: DateRange): Promise<TrendData>
  async getContentPerformance(accountId: string, filters: ContentFilters): Promise<ContentMetrics[]>
  async generateInsights(accountId: string): Promise<Insight[]>
}

// Data collection
class MetricsCollector {
  async collectInstagramMetrics(connectedAccount: ConnectedAccount): Promise<InstagramMetrics>
  async collectFacebookMetrics(connectedAccount: ConnectedAccount): Promise<FacebookMetrics>
  async collectGoogleBusinessMetrics(connectedAccount: ConnectedAccount): Promise<GoogleMetrics>
}

// Intelligence engine
class InsightsEngine {
  async analyzePerformanceTrends(data: TimeSeriesData): Promise<Insight[]>
  async recommendOptimalTiming(historicalData: PostMetrics[]): Promise<TimingRecommendation>
  async detectAnomalies(metrics: MetricsData): Promise<Anomaly[]>
}
```

### Modelo de Dados
```sql
-- Métricas por post
PostMetrics {
  id: uuid PRIMARY KEY,
  publicationId: uuid REFERENCES scheduled_publications(id),
  platform: text NOT NULL,
  platformPostId: text NOT NULL,
  collectedAt: timestamp NOT NULL,
  metrics: jsonb NOT NULL, -- métricas específicas por plataforma
  normalizedMetrics: jsonb, -- métricas padronizadas
  createdAt: timestamp DEFAULT now()
}

-- Métricas agregadas por período
AggregatedMetrics {
  id: uuid PRIMARY KEY,
  accountId: uuid REFERENCES accounts(id),
  platform: text,
  contentType: text,
  period: date NOT NULL,
  periodType: text NOT NULL, -- day, week, month
  metrics: jsonb NOT NULL,
  createdAt: timestamp DEFAULT now(),
  UNIQUE(accountId, platform, contentType, period, periodType)
}

-- Insights gerados
GeneratedInsight {
  id: uuid PRIMARY KEY,
  accountId: uuid REFERENCES accounts(id),
  type: text NOT NULL, -- performance, timing, content, anomaly
  title: text NOT NULL,
  description: text NOT NULL,
  recommendation: text,
  confidence: float, -- 0-1
  dataPoints: jsonb, -- supporting data
  createdAt: timestamp DEFAULT now(),
  isActive: boolean DEFAULT true
}
```

---

## 📊 Coleta de Dados

### Platform APIs Integration
```typescript
// Instagram Basic Display API + Instagram Graph API
interface InstagramMetrics {
  post_id: string
  media_type: 'IMAGE' | 'VIDEO' | 'CAROUSEL_ALBUM'
  like_count: number
  comments_count: number
  media_url: string
  permalink: string
  timestamp: string
  insights?: {
    impressions: number
    reach: number
    saves: number
    video_views?: number
  }
}

// Facebook Graph API
interface FacebookMetrics {
  post_id: string
  message: string
  created_time: string
  insights: {
    post_impressions: number
    post_engaged_users: number
    post_clicks: number
    post_reactions_like_total: number
    post_reactions_love_total: number
  }
}

// Google Business Profile API
interface GoogleBusinessMetrics {
  name: string // Post resource name
  viewCount: number
  clickCount: number
  callCount?: number
  directionRequestCount?: number
  mediaViewCounts?: MediaViewCount[]
}
```

### Data Processing Pipeline
```typescript
// ETL pipeline
class DataPipeline {
  async extract(): Promise<RawMetrics[]> {
    // Collect from all connected platforms
  }
  
  async transform(raw: RawMetrics[]): Promise<NormalizedMetrics[]> {
    // Normalize metrics across platforms
    // Calculate derived metrics (engagement_rate, etc.)
  }
  
  async load(metrics: NormalizedMetrics[]): Promise<void> {
    // Store in TimescaleDB for time-series analysis
    // Update aggregated tables
  }
}

// Scheduled jobs
class MetricsScheduler {
  @Cron('*/15 * * * *') // Every 15 minutes
  async collectRecentMetrics(): Promise<void>
  
  @Cron('0 2 * * *') // Daily at 2 AM
  async generateDailyAggregates(): Promise<void>
  
  @Cron('0 3 * * *') // Daily at 3 AM
  async generateInsights(): Promise<void>
}
```

---

## 📈 Visualizações e Componentes

### Dashboard Components
```typescript
// Main dashboard
interface AnalyticsDashboard {
  overview: OverviewSection
  trends: TrendsSection
  content: ContentPerformanceSection
  insights: InsightsSection
  export: ExportSection
}

// KPI Cards component
interface KPICard {
  title: string
  value: number | string
  change: {
    value: number
    period: string
    trend: 'up' | 'down' | 'stable'
  }
  sparkline?: number[]
}

// Chart configurations
interface ChartConfig {
  type: 'line' | 'bar' | 'pie' | 'area'
  data: ChartData
  options: {
    responsive: boolean
    plugins: {
      legend: LegendOptions
      tooltip: TooltipOptions
    }
    scales?: ScaleOptions
  }
}
```

### Export Functionality
```typescript
// Report generation
class ReportGenerator {
  async generatePDFReport(accountId: string, config: ReportConfig): Promise<Buffer>
  async generateExcelReport(accountId: string, config: ReportConfig): Promise<Buffer>
  async generateCSVExport(accountId: string, filters: AnalyticsFilters): Promise<string>
}

interface ReportConfig {
  period: DateRange
  sections: ('overview' | 'trends' | 'content' | 'insights')[]
  includeCharts: boolean
  format: 'pdf' | 'excel' | 'csv'
  branding: {
    logo?: string
    companyName: string
    colors: string[]
  }
}
```

---

## 🤖 Intelligence e Machine Learning

### Insights Engine
```typescript
// Automated insights
class AnalyticsIntelligence {
  async analyzeBestPostingTimes(data: PostMetrics[]): Promise<TimingInsight> {
    // Analyze engagement by hour/day of week
    // Return optimal posting schedule
  }
  
  async identifyTopContentTypes(data: ContentMetrics[]): Promise<ContentInsight> {
    // Analyze performance by content type
    // Recommend content mix optimization
  }
  
  async detectSeasonalTrends(data: TimeSeriesData): Promise<SeasonalInsight> {
    // Identify seasonal patterns
    // Predict future trends
  }
  
  async benchmarkPerformance(accountMetrics: AccountMetrics): Promise<BenchmarkInsight> {
    // Compare against industry averages
    // Identify performance gaps
  }
}

// Anomaly detection
class AnomalyDetector {
  async detectMetricAnomalies(timeSeries: MetricTimeSeries): Promise<Anomaly[]> {
    // Statistical analysis for outliers
    // Machine learning for pattern recognition
  }
}
```

### Prediction Models
```typescript
// Future implementations
interface PredictiveAnalytics {
  predictEngagement(postFeatures: PostFeatures): Promise<EngagementPrediction>
  forecastReach(campaignPlan: CampaignPlan): Promise<ReachForecast>
  optimizeContentMix(currentMix: ContentMix, goals: Goals): Promise<OptimizedMix>
}
```

---

## 🔒 Privacidade e Compliance

### Data Handling
- **Retention Policy:** Métricas retidas por 2 anos
- **Anonymization:** Dados demográficos anonimizados quando possível
- **LGPD Compliance:** Auditoria de uso de dados pessoais
- **Platform ToS:** Aderência aos termos das plataformas

### Access Control
- **Role-based Access:** Different views for different roles
- **Data Isolation:** Metrics isolated by account
- **Audit Logging:** Log de acesso a relatórios sensíveis

---

## 🧪 Testes & Qualidade

### Test Strategy
- **Data Accuracy:** Validation against platform APIs
- **Performance Tests:** Dashboard load with large datasets
- **Chart Rendering:** Visual regression testing
- **Export Quality:** PDF/Excel output validation

### Quality Metrics
- **Data Freshness:** < 15 min lag for critical metrics
- **Accuracy:** 99.9% match with platform native analytics
- **Uptime:** 99.5% analytics dashboard availability
- **Query Performance:** 95% of queries < 1s

---

## 📈 Métricas & Monitoramento

### Product KPIs
- **Dashboard Usage:** % de usuários que acessam analytics semanalmente
- **Insight Action:** % de insights que levam a ações
- **Report Generation:** Frequência de geração de relatórios
- **Feature Adoption:** Uso de filtros avançados e exports

### Technical Metrics
- **Data Pipeline Health:** Success rate de coleta de dados
- **Query Performance:** Response time por tipo de query
- **Cache Hit Rate:** Eficiência do cache Redis
- **Export Generation Time:** Tempo para gerar relatórios

### Alerting
- Data collection failure > 5% in 1 hour
- Dashboard load time > 5s
- Metric anomaly detected
- Platform API rate limit hit

---

## 🔮 Roadmap & Evoluções

### Fase 3 (MVP)
- ✅ **Core Metrics:** Engajamento, alcance, tráfego básico
- ✅ **Multi-platform:** Instagram, Facebook, Google Business
- ✅ **Basic Dashboards:** Overview e trend charts

### Fase 3.1 (Enhanced)
- 📅 **Advanced Insights:** AI-powered recommendations
- 📅 **Custom Dashboards:** User-configurable layouts
- 📅 **Automated Reports:** Scheduled email reports

### Fase 4 (Advanced)
- 🔮 **Predictive Analytics:** ML-based forecasting
- 🔮 **Competitive Intelligence:** Market benchmarking
- 🔮 **Attribution Modeling:** Multi-touch attribution

---

## ⚠️ Riscos & Mitigações

### Data Risks
- **API Rate Limits:** Platforms podem limitar acesso a dados
  - *Mitigação:* Caching strategy + incremental updates
- **Data Inconsistency:** Métricas podem variar entre plataformas
  - *Mitigação:* Clear documentation of definitions
- **Platform Changes:** APIs podem mudar sem aviso
  - *Mitigação:* Monitoring + fallback strategies

### Technical Risks
- **Performance Degradation:** Large datasets podem ser lentos
  - *Mitigação:* Data partitioning + intelligent caching
- **Storage Costs:** Time-series data cresce rapidamente
  - *Mitigação:* Data retention policies + archival

---

## 📚 Referências & Links

- **PRD:** Seção 4.4 - F-11 Dashboard unificado
- **Instagram API:** https://developers.facebook.com/docs/instagram-api
- **Facebook Graph API:** https://developers.facebook.com/docs/graph-api
- **Google Business API:** https://developers.google.com/my-business
- **Dependencies:** F-8 (Publisher) para dados de publicação

---

## ✅ Definition of Done

### Funcional
- [ ] Dashboard overview com KPIs principais
- [ ] Filtros avançados funcionando
- [ ] Charts interativos e responsivos
- [ ] Export para PDF/Excel/CSV
- [ ] Insights automáticos gerados
- [ ] Multi-platform data integration

### Técnico
- [ ] Data pipeline robusto e monitorado
- [ ] Performance < 3s para dashboard load
- [ ] Caching strategy implementada
- [ ] Error handling completo
- [ ] Scheduled jobs funcionando

### Qualidade
- [ ] Data accuracy > 99% vs. platform native
- [ ] Load testing com datasets grandes
- [ ] Cross-browser testing completo
- [ ] Mobile responsiveness validada
- [ ] Security review aprovado

---

*Última atualização: Setembro 2025*