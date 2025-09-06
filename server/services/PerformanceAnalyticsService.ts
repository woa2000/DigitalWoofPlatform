/**
 * Performance Analytics Service
 * 
 * Serviço avançado para análise de performance de campanhas e templates.
 * Funcionalidades:
 * - Análise de performance em tempo real
 * - Recomendações baseadas em dados
 * - Comparações e benchmarks
 * - Predições de performance
 * - Insights automatizados
 * 
 * Performance target: < 3s para análises complexas
 */

import { z } from 'zod';
import { CampaignPerformanceRepository } from '../repositories/CampaignPerformanceRepository';
import { CampaignTemplateRepository } from '../repositories/CampaignTemplateRepository';
import { ServiceTypeType, CampaignCategoryType } from '../models/campaign';

// ============================================================================
// Analytics Schemas & Types
// ============================================================================

const PerformanceMetricsSchema = z.object({
  impressions: z.number().min(0),
  reaches: z.number().min(0),
  clicks: z.number().min(0),
  conversions: z.number().min(0),
  engagementRate: z.number().min(0).max(1),
  clickThroughRate: z.number().min(0).max(1),
  conversionRate: z.number().min(0).max(1),
  costPerClick: z.number().min(0).optional(),
  costPerConversion: z.number().min(0).optional()
});

const AnalyticsContextSchema = z.object({
  serviceType: z.string(),
  category: z.string(),
  channel: z.string(),
  timeframe: z.enum(['7d', '30d', '90d', 'custom']),
  includeIndustryBenchmarks: z.boolean().default(true),
  includePredictions: z.boolean().default(false)
});

const PerformanceInsightSchema = z.object({
  type: z.enum(['opportunity', 'warning', 'success', 'recommendation']),
  title: z.string(),
  description: z.string(),
  impact: z.enum(['low', 'medium', 'high', 'critical']),
  actionItems: z.array(z.string()),
  priority: z.number().min(1).max(10),
  category: z.enum(['engagement', 'conversion', 'reach', 'cost', 'channel', 'content'])
});

const PerformanceRecommendationSchema = z.object({
  templateId: z.string(),
  type: z.enum(['optimization', 'replacement', 'enhancement', 'experiment']),
  confidence: z.number().min(0).max(1),
  expectedImprovement: z.number().min(0),
  reasoning: z.string(),
  suggestedActions: z.array(z.string()),
  estimatedImpact: z.object({
    engagementLift: z.number(),
    conversionLift: z.number(),
    reachLift: z.number()
  })
});

const AnalyticsReportSchema = z.object({
  summary: z.object({
    totalCampaigns: z.number(),
    totalImpressions: z.number(),
    totalClicks: z.number(),
    totalConversions: z.number(),
    overallEngagementRate: z.number(),
    overallConversionRate: z.number(),
    topPerformingChannel: z.string().nullable(),
    topPerformingTemplate: z.string().nullable()
  }),
  trends: z.array(z.object({
    date: z.string(),
    metrics: PerformanceMetricsSchema
  })),
  channelAnalysis: z.array(z.object({
    channel: z.string(),
    metrics: PerformanceMetricsSchema,
    benchmark: PerformanceMetricsSchema.optional(),
    performance: z.enum(['excellent', 'good', 'average', 'poor'])
  })),
  templateAnalysis: z.array(z.object({
    templateId: z.string(),
    templateName: z.string(),
    metrics: PerformanceMetricsSchema,
    usageCount: z.number(),
    performance: z.enum(['excellent', 'good', 'average', 'poor'])
  })),
  insights: z.array(PerformanceInsightSchema),
  recommendations: z.array(PerformanceRecommendationSchema),
  industryBenchmarks: PerformanceMetricsSchema.optional(),
  predictions: z.object({
    nextPeriodForecast: PerformanceMetricsSchema,
    confidenceInterval: z.object({
      lower: PerformanceMetricsSchema,
      upper: PerformanceMetricsSchema
    }),
    factors: z.array(z.string())
  }).optional()
});

type PerformanceMetrics = z.infer<typeof PerformanceMetricsSchema>;
type AnalyticsContext = z.infer<typeof AnalyticsContextSchema>;
type PerformanceInsight = z.infer<typeof PerformanceInsightSchema>;
type PerformanceRecommendation = z.infer<typeof PerformanceRecommendationSchema>;
type AnalyticsReport = z.infer<typeof AnalyticsReportSchema>;

// ============================================================================
// Performance Analytics Service
// ============================================================================

export class PerformanceAnalyticsService {
  constructor(
    private performanceRepo: CampaignPerformanceRepository,
    private templateRepo: CampaignTemplateRepository
  ) {}

  /**
   * Gera relatório completo de analytics
   */
  async generateAnalyticsReport(
    userId: string,
    context: AnalyticsContext,
    startDate?: Date,
    endDate?: Date
  ): Promise<AnalyticsReport> {
    const [
      dailyAggregates,
      industryBenchmarks,
      templatePerformances,
      channelAnalysis
    ] = await Promise.all([
      this.getDailyAggregates(userId, context.timeframe),
      context.includeIndustryBenchmarks 
        ? this.performanceRepo.getIndustryBenchmarks(context.serviceType)
        : null,
      this.getTemplatePerformanceAnalysis(userId, context),
      this.getChannelPerformanceAnalysis(userId, context)
    ]);

    const summary = this.calculateSummaryMetrics(dailyAggregates);
    const trends = this.formatTrendsData(dailyAggregates);
    const insights = await this.generateInsights(summary, templatePerformances, channelAnalysis, industryBenchmarks);
    const recommendations = await this.generateRecommendations(userId, context, templatePerformances);

    const report: AnalyticsReport = {
      summary,
      trends,
      channelAnalysis,
      templateAnalysis: templatePerformances,
      insights,
      recommendations,
      industryBenchmarks: industryBenchmarks ? this.formatBenchmarkMetrics(industryBenchmarks) : undefined
    };

    // Adicionar predições se solicitado
    if (context.includePredictions) {
      const predictions = await this.generatePredictions(trends, context);
      if (predictions) {
        report.predictions = predictions;
      }
    }

    return AnalyticsReportSchema.parse(report);
  }

  /**
   * Análise de performance em tempo real
   */
  async getRealTimePerformance(campaignId: string): Promise<{
    currentMetrics: PerformanceMetrics;
    todayVsYesterday: {
      impressions: number;
      clicks: number;
      conversions: number;
      engagementRate: number;
    };
    hourlyTrends: Array<{
      hour: number;
      impressions: number;
      clicks: number;
      conversions: number;
    }>;
    alerts: Array<{
      type: 'opportunity' | 'warning' | 'critical';
      message: string;
      timestamp: Date;
    }>;
  }> {
    const today = new Date();
    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);

    const [todayPerformance, yesterdayPerformance] = await Promise.all([
      this.performanceRepo.getCampaignTrends(campaignId, today, today),
      this.performanceRepo.getCampaignTrends(campaignId, yesterday, yesterday)
    ]);

    const currentMetrics = this.aggregateMetrics(todayPerformance);
    const yesterdayMetrics = this.aggregateMetrics(yesterdayPerformance);

    const comparison = {
      impressions: this.calculateChange(currentMetrics.impressions, yesterdayMetrics.impressions),
      clicks: this.calculateChange(currentMetrics.clicks, yesterdayMetrics.clicks),
      conversions: this.calculateChange(currentMetrics.conversions, yesterdayMetrics.conversions),
      engagementRate: this.calculateChange(currentMetrics.engagementRate, yesterdayMetrics.engagementRate)
    };

    const alerts = this.generateRealTimeAlerts(currentMetrics, comparison);
    const hourlyTrends = await this.getHourlyTrends(campaignId, today);

    return {
      currentMetrics,
      todayVsYesterday: comparison,
      hourlyTrends,
      alerts
    };
  }

  /**
   * Análise comparativa de templates
   */
  async compareTemplatePerformance(
    templateIds: string[],
    timeframe: string = '30d'
  ): Promise<{
    comparison: Array<{
      templateId: string;
      templateName: string;
      metrics: PerformanceMetrics;
      ranking: number;
      strengthsAndWeaknesses: {
        strengths: string[];
        weaknesses: string[];
      };
    }>;
    insights: PerformanceInsight[];
    recommendations: string[];
  }> {
    const templateComparison = await this.performanceRepo.compareTemplates(templateIds);
    
    // Rank templates by overall performance score
    const rankedTemplates = templateComparison
      .map(template => ({
        ...template,
        score: this.calculateOverallScore(template),
        metrics: {
          impressions: 0, // Will be filled from detailed data
          reaches: 0,
          clicks: 0,
          conversions: 0,
          engagementRate: template.avgEngagementRate,
          clickThroughRate: template.avgEngagementRate * 0.7, // Estimated
          conversionRate: template.avgConversionRate,
        } as PerformanceMetrics
      }))
      .sort((a, b) => b.score - a.score)
      .map((template, index) => ({
        templateId: template.templateId,
        templateName: template.templateName,
        metrics: template.metrics,
        ranking: index + 1,
        strengthsAndWeaknesses: this.analyzeTemplateStrengthsWeaknesses(template)
      }));

    const insights = this.generateComparisonInsights(rankedTemplates);
    const recommendations = this.generateComparisonRecommendations(rankedTemplates);

    return {
      comparison: rankedTemplates,
      insights,
      recommendations
    };
  }

  /**
   * Detecta anomalias na performance
   */
  async detectAnomalies(
    campaignId: string,
    lookbackDays: number = 30
  ): Promise<Array<{
    type: 'spike' | 'drop' | 'trend_change' | 'outlier';
    metric: 'impressions' | 'clicks' | 'conversions' | 'engagement_rate';
    severity: 'low' | 'medium' | 'high';
    description: string;
    detectedAt: Date;
    value: number;
    expectedRange: { min: number; max: number };
    possibleCauses: string[];
    recommendedActions: string[];
  }>> {
    const trends = await this.performanceRepo.getCampaignTrends(
      campaignId,
      new Date(Date.now() - lookbackDays * 24 * 60 * 60 * 1000)
    );

    const anomalies: Array<any> = [];

    // Analyze each metric for anomalies
    const metrics = ['impressions', 'clicks', 'conversions', 'engagementRate'] as const;
    
    for (const metric of metrics) {
      const values = trends.map(t => t[metric]);
      const analysis = this.analyzeMetricAnomalies(metric, values, trends.map(t => t.date));
      anomalies.push(...analysis);
    }

    return anomalies;
  }

  /**
   * Gera insights personalizados baseados em padrões
   */
  async generatePersonalizedInsights(
    userId: string,
    serviceType: ServiceTypeType
  ): Promise<Array<{
    category: 'performance' | 'optimization' | 'growth' | 'efficiency';
    insight: string;
    impact: 'high' | 'medium' | 'low';
    confidence: number;
    actionItems: string[];
    estimatedGain: {
      metric: string;
      expectedIncrease: number;
      timeframe: string;
    };
  }>> {
    // Get user's campaign performance data
    const userPerformance = await this.performanceRepo.getDailyAggregates(userId, 90);
    const industryBenchmarks = await this.performanceRepo.getIndustryBenchmarks(serviceType);

    const insights: Array<any> = [];

    // Performance insights
    if (userPerformance.length > 0) {
      const avgEngagement = userPerformance.reduce((sum, day) => sum + day.avgEngagementRate, 0) / userPerformance.length;
      
      if (avgEngagement < industryBenchmarks.avgEngagementRate * 0.8) {
        insights.push({
          category: 'performance',
          insight: 'Sua taxa de engajamento está 20% abaixo da média do setor. Isso pode indicar que o conteúdo não está ressoando com sua audiência.',
          impact: 'high',
          confidence: 0.85,
          actionItems: [
            'Revisar personas de audiência',
            'Testar diferentes tons de voz',
            'Analisar horários de postagem',
            'Experimentar formatos de conteúdo diversos'
          ],
          estimatedGain: {
            metric: 'engagement_rate',
            expectedIncrease: 25,
            timeframe: '30 dias'
          }
        });
      }

      // Growth insights
      const recentTrend = this.calculateTrendDirection(userPerformance.slice(-14));
      if (recentTrend === 'declining') {
        insights.push({
          category: 'growth',
          insight: 'Detectamos uma tendência de declínio nas suas métricas nos últimos 14 dias. É importante agir rapidamente para reverter essa situação.',
          impact: 'high',
          confidence: 0.9,
          actionItems: [
            'Audit de campanhas ativas',
            'Revisão de targeting',
            'Teste A/B de criativos',
            'Análise de concorrência'
          ],
          estimatedGain: {
            metric: 'overall_performance',
            expectedIncrease: 15,
            timeframe: '21 dias'
          }
        });
      }

      // Efficiency insights
      const channelEfficiency = await this.analyzeChannelEfficiency(userId);
      const inefficientChannels = channelEfficiency.filter(ch => ch.efficiency < 0.6);
      
      if (inefficientChannels.length > 0) {
        insights.push({
          category: 'efficiency',
          insight: `Identificamos ${inefficientChannels.length} canal(is) com baixa eficiência. Redistribuir orçamento pode melhorar ROI geral.`,
          impact: 'medium',
          confidence: 0.75,
          actionItems: [
            `Reduzir investimento em: ${inefficientChannels.map(ch => ch.channel).join(', ')}`,
            'Realocate budget para canais de alta performance',
            'Teste de novos formatos nos canais problemáticos',
            'Análise de audiência por canal'
          ],
          estimatedGain: {
            metric: 'cost_efficiency',
            expectedIncrease: 20,
            timeframe: '45 dias'
          }
        });
      }
    }

    return insights;
  }

  // ============================================================================
  // Helper Methods
  // ============================================================================

  private async getDailyAggregates(userId: string, timeframe: string) {
    const days = timeframe === '7d' ? 7 : timeframe === '30d' ? 30 : 90;
    return this.performanceRepo.getDailyAggregates(userId, days);
  }

  private async getTemplatePerformanceAnalysis(userId: string, context: AnalyticsContext) {
    // This would integrate with template repository to get user's templates
    // and their performance metrics
    return [];
  }

  private async getChannelPerformanceAnalysis(userId: string, context: AnalyticsContext) {
    // Analyze performance by channel
    return [];
  }

  private calculateSummaryMetrics(dailyAggregates: any[]) {
    const totals = dailyAggregates.reduce(
      (acc, day) => ({
        totalImpressions: acc.totalImpressions + day.totalImpressions,
        totalClicks: acc.totalClicks + day.totalClicks,
        totalConversions: acc.totalConversions + day.totalConversions,
        totalCampaigns: Math.max(acc.totalCampaigns, day.activeCampaigns)
      }),
      { totalImpressions: 0, totalClicks: 0, totalConversions: 0, totalCampaigns: 0 }
    );

    const avgEngagementRate = dailyAggregates.length > 0
      ? dailyAggregates.reduce((sum, day) => sum + day.avgEngagementRate, 0) / dailyAggregates.length
      : 0;

    return {
      totalCampaigns: totals.totalCampaigns,
      totalImpressions: totals.totalImpressions,
      totalClicks: totals.totalClicks,
      totalConversions: totals.totalConversions,
      overallEngagementRate: avgEngagementRate,
      overallConversionRate: totals.totalClicks > 0 ? totals.totalConversions / totals.totalClicks : 0,
      topPerformingChannel: null, // Would be calculated from detailed data
      topPerformingTemplate: null // Would be calculated from detailed data
    };
  }

  private formatTrendsData(dailyAggregates: any[]) {
    return dailyAggregates.map(day => ({
      date: day.date,
      metrics: {
        impressions: day.totalImpressions,
        reaches: day.totalImpressions * 0.8, // Estimated
        clicks: day.totalClicks,
        conversions: day.totalConversions,
        engagementRate: day.avgEngagementRate,
        clickThroughRate: day.totalImpressions > 0 ? day.totalClicks / day.totalImpressions : 0,
        conversionRate: day.totalClicks > 0 ? day.totalConversions / day.totalClicks : 0
      }
    }));
  }

  private async generateInsights(
    summary: any,
    templatePerformances: any[],
    channelAnalysis: any[],
    industryBenchmarks: any
  ): Promise<PerformanceInsight[]> {
    const insights: PerformanceInsight[] = [];

    // Engagement insights
    if (industryBenchmarks && summary.overallEngagementRate < industryBenchmarks.avgEngagementRate * 0.9) {
      insights.push({
        type: 'opportunity',
        title: 'Oportunidade de Melhoria no Engajamento',
        description: 'Sua taxa de engajamento está abaixo da média do setor. Há potencial para melhoria.',
        impact: 'high',
        actionItems: [
          'Revisar estratégia de conteúdo',
          'Testar novos formatos',
          'Analisar horários ótimos de postagem'
        ],
        priority: 8,
        category: 'engagement'
      });
    }

    // Conversion insights
    if (summary.overallConversionRate < 0.02) {
      insights.push({
        type: 'warning',
        title: 'Taxa de Conversão Baixa',
        description: 'A taxa de conversão está abaixo do esperado para campanhas de pet care.',
        impact: 'critical',
        actionItems: [
          'Revisar call-to-actions',
          'Otimizar landing pages',
          'Melhorar targeting de audiência'
        ],
        priority: 9,
        category: 'conversion'
      });
    }

    return insights;
  }

  private async generateRecommendations(
    userId: string,
    context: AnalyticsContext,
    templatePerformances: any[]
  ): Promise<PerformanceRecommendation[]> {
    // Implementation would analyze patterns and generate specific recommendations
    return [];
  }

  private formatBenchmarkMetrics(benchmarks: any): PerformanceMetrics {
    return {
      impressions: 0, // Not available in benchmarks
      reaches: 0,
      clicks: 0,
      conversions: 0,
      engagementRate: benchmarks.avgEngagementRate,
      clickThroughRate: 0, // Not available
      conversionRate: benchmarks.avgConversionRate
    };
  }

  private async generatePredictions(trends: any[], context: AnalyticsContext) {
    // Simple linear prediction based on recent trends
    const recentTrends = trends.slice(-7); // Last 7 days
    
    if (recentTrends.length < 3) {
      return null;
    }

    // Calculate trend slopes for each metric
    const engagementTrend = this.calculateLinearTrend(
      recentTrends.map(t => t.metrics.engagementRate)
    );

    const nextPeriodForecast = {
      impressions: Math.max(0, recentTrends[recentTrends.length - 1].metrics.impressions * 1.05),
      reaches: Math.max(0, recentTrends[recentTrends.length - 1].metrics.reaches * 1.05),
      clicks: Math.max(0, recentTrends[recentTrends.length - 1].metrics.clicks * 1.05),
      conversions: Math.max(0, recentTrends[recentTrends.length - 1].metrics.conversions * 1.05),
      engagementRate: Math.max(0, Math.min(1, recentTrends[recentTrends.length - 1].metrics.engagementRate + engagementTrend)),
      clickThroughRate: Math.max(0, Math.min(1, recentTrends[recentTrends.length - 1].metrics.clickThroughRate * 1.02)),
      conversionRate: Math.max(0, Math.min(1, recentTrends[recentTrends.length - 1].metrics.conversionRate * 1.02))
    };

    const confidenceInterval = {
      lower: {
        ...nextPeriodForecast,
        engagementRate: nextPeriodForecast.engagementRate * 0.9,
        clickThroughRate: nextPeriodForecast.clickThroughRate * 0.9,
        conversionRate: nextPeriodForecast.conversionRate * 0.9
      },
      upper: {
        ...nextPeriodForecast,
        engagementRate: Math.min(1, nextPeriodForecast.engagementRate * 1.1),
        clickThroughRate: Math.min(1, nextPeriodForecast.clickThroughRate * 1.1),
        conversionRate: Math.min(1, nextPeriodForecast.conversionRate * 1.1)
      }
    };

    return {
      nextPeriodForecast,
      confidenceInterval,
      factors: [
        'Tendência histórica',
        'Sazonalidade do setor',
        'Performance recente das campanhas'
      ]
    };
  }

  private aggregateMetrics(trends: any[]): PerformanceMetrics {
    if (trends.length === 0) {
      return {
        impressions: 0,
        reaches: 0,
        clicks: 0,
        conversions: 0,
        engagementRate: 0,
        clickThroughRate: 0,
        conversionRate: 0
      };
    }

    const totals = trends.reduce(
      (acc, trend) => ({
        impressions: acc.impressions + trend.impressions,
        clicks: acc.clicks + trend.clicks,
        conversions: acc.conversions + trend.conversions
      }),
      { impressions: 0, clicks: 0, conversions: 0 }
    );

    const avgEngagement = trends.reduce((sum, trend) => sum + trend.engagementRate, 0) / trends.length;

    return {
      impressions: totals.impressions,
      reaches: totals.impressions * 0.8, // Estimated
      clicks: totals.clicks,
      conversions: totals.conversions,
      engagementRate: avgEngagement,
      clickThroughRate: totals.impressions > 0 ? totals.clicks / totals.impressions : 0,
      conversionRate: totals.clicks > 0 ? totals.conversions / totals.clicks : 0
    };
  }

  private calculateChange(current: number, previous: number): number {
    if (previous === 0) return current > 0 ? 100 : 0;
    return ((current - previous) / previous) * 100;
  }

  private generateRealTimeAlerts(currentMetrics: PerformanceMetrics, comparison: any) {
    const alerts: Array<any> = [];

    // Performance drop alerts
    if (comparison.engagementRate < -20) {
      alerts.push({
        type: 'warning',
        message: 'Taxa de engajamento caiu mais de 20% em relação a ontem',
        timestamp: new Date()
      });
    }

    // Opportunity alerts
    if (comparison.conversions > 50) {
      alerts.push({
        type: 'opportunity',
        message: 'Conversões aumentaram significativamente! Considere aumentar o orçamento.',
        timestamp: new Date()
      });
    }

    // Critical alerts
    if (currentMetrics.impressions === 0 && new Date().getHours() > 12) {
      alerts.push({
        type: 'critical',
        message: 'Nenhuma impressão registrada hoje após meio-dia. Verifique status das campanhas.',
        timestamp: new Date()
      });
    }

    return alerts;
  }

  private async getHourlyTrends(campaignId: string, date: Date) {
    // This would require hourly data collection
    // For now, return mock data structure
    const hours = Array.from({ length: 24 }, (_, hour) => ({
      hour,
      impressions: Math.floor(Math.random() * 1000),
      clicks: Math.floor(Math.random() * 50),
      conversions: Math.floor(Math.random() * 5)
    }));

    return hours;
  }

  private calculateOverallScore(template: any): number {
    // Weighted score based on multiple factors
    const engagementWeight = 0.4;
    const conversionWeight = 0.3;
    const usageWeight = 0.2;
    const channelWeight = 0.1;

    const engagementScore = Math.min(template.avgEngagementRate * 20, 10); // Normalize to 0-10
    const conversionScore = Math.min(template.avgConversionRate * 100, 10); // Normalize to 0-10
    const usageScore = Math.min(template.totalUsage / 10, 10); // Normalize based on usage
    const channelScore = template.bestChannel ? 8 : 5; // Bonus for having a best channel

    return (
      engagementScore * engagementWeight +
      conversionScore * conversionWeight +
      usageScore * usageWeight +
      channelScore * channelWeight
    );
  }

  private analyzeTemplateStrengthsWeaknesses(template: any) {
    const strengths: string[] = [];
    const weaknesses: string[] = [];

    if (template.avgEngagementRate > 0.05) {
      strengths.push('Alta taxa de engajamento');
    } else {
      weaknesses.push('Baixa taxa de engajamento');
    }

    if (template.avgConversionRate > 0.02) {
      strengths.push('Boa taxa de conversão');
    } else {
      weaknesses.push('Taxa de conversão baixa');
    }

    if (template.totalUsage > 20) {
      strengths.push('Amplamente utilizado');
    } else {
      weaknesses.push('Pouco utilizado');
    }

    return { strengths, weaknesses };
  }

  private generateComparisonInsights(rankedTemplates: any[]): PerformanceInsight[] {
    const insights: PerformanceInsight[] = [];

    if (rankedTemplates.length > 1) {
      const topTemplate = rankedTemplates[0];
      const bottomTemplate = rankedTemplates[rankedTemplates.length - 1];

      if (topTemplate.metrics.engagementRate > bottomTemplate.metrics.engagementRate * 2) {
        insights.push({
          type: 'opportunity',
          title: 'Grande Diferença de Performance Entre Templates',
          description: `O template "${topTemplate.templateName}" está performando muito melhor que "${bottomTemplate.templateName}".`,
          impact: 'high',
          actionItems: [
            'Analisar elementos do template de alta performance',
            'Aplicar learnings aos templates de baixa performance',
            'Considerar deprecar templates com performance muito baixa'
          ],
          priority: 7,
          category: 'engagement'
        });
      }
    }

    return insights;
  }

  private generateComparisonRecommendations(rankedTemplates: any[]): string[] {
    const recommendations: string[] = [];

    if (rankedTemplates.length > 0) {
      const topTemplate = rankedTemplates[0];
      recommendations.push(`Considere usar mais o template "${topTemplate.templateName}" que está no topo do ranking.`);

      const poorPerformers = rankedTemplates.filter(t => t.ranking > rankedTemplates.length * 0.7);
      if (poorPerformers.length > 0) {
        recommendations.push(`Revise os templates: ${poorPerformers.map(t => t.templateName).join(', ')} que estão com baixa performance.`);
      }
    }

    return recommendations;
  }

  private analyzeMetricAnomalies(metric: string, values: number[], dates: string[]) {
    const anomalies: Array<any> = [];
    
    if (values.length < 7) return anomalies;

    const mean = values.reduce((sum, val) => sum + val, 0) / values.length;
    const stdDev = Math.sqrt(
      values.reduce((sum, val) => sum + Math.pow(val - mean, 2), 0) / values.length
    );

    const threshold = 2; // 2 standard deviations

    values.forEach((value, index) => {
      const zScore = Math.abs((value - mean) / stdDev);
      
      if (zScore > threshold) {
        anomalies.push({
          type: value > mean ? 'spike' : 'drop',
          metric,
          severity: zScore > 3 ? 'high' : zScore > 2.5 ? 'medium' : 'low',
          description: `${metric} apresentou valor ${value > mean ? 'muito alto' : 'muito baixo'} em ${dates[index]}`,
          detectedAt: new Date(dates[index]),
          value,
          expectedRange: {
            min: mean - stdDev,
            max: mean + stdDev
          },
          possibleCauses: this.getPossibleCauses(metric, value > mean),
          recommendedActions: this.getRecommendedActions(metric, value > mean)
        });
      }
    });

    return anomalies;
  }

  private calculateTrendDirection(recentData: any[]): 'growing' | 'declining' | 'stable' {
    if (recentData.length < 3) return 'stable';

    const firstHalf = recentData.slice(0, Math.floor(recentData.length / 2));
    const secondHalf = recentData.slice(Math.floor(recentData.length / 2));

    const firstAvg = firstHalf.reduce((sum, day) => sum + day.avgEngagementRate, 0) / firstHalf.length;
    const secondAvg = secondHalf.reduce((sum, day) => sum + day.avgEngagementRate, 0) / secondHalf.length;

    const change = (secondAvg - firstAvg) / firstAvg;

    if (change > 0.1) return 'growing';
    if (change < -0.1) return 'declining';
    return 'stable';
  }

  private async analyzeChannelEfficiency(userId: string) {
    // Mock implementation - would analyze actual channel performance
    return [
      { channel: 'instagram', efficiency: 0.85 },
      { channel: 'facebook', efficiency: 0.72 },
      { channel: 'tiktok', efficiency: 0.45 },
      { channel: 'email', efficiency: 0.91 }
    ];
  }

  private calculateLinearTrend(values: number[]): number {
    if (values.length < 2) return 0;

    const n = values.length;
    const x = Array.from({ length: n }, (_, i) => i);
    
    const sumX = x.reduce((sum, val) => sum + val, 0);
    const sumY = values.reduce((sum, val) => sum + val, 0);
    const sumXY = x.reduce((sum, val, i) => sum + val * values[i], 0);
    const sumXX = x.reduce((sum, val) => sum + val * val, 0);

    const slope = (n * sumXY - sumX * sumY) / (n * sumXX - sumX * sumX);
    
    return slope || 0;
  }

  private getPossibleCauses(metric: string, isSpike: boolean): string[] {
    const causes: Record<string, { spike: string[]; drop: string[] }> = {
      impressions: {
        spike: ['Viral content', 'Increased budget', 'New audience targeting'],
        drop: ['Budget exhausted', 'Campaign paused', 'Platform issues']
      },
      clicks: {
        spike: ['Compelling CTA', 'Seasonal trend', 'Trending topic'],
        drop: ['Ad fatigue', 'Poor targeting', 'Technical issues']
      },
      conversions: {
        spike: ['Promotional offer', 'Improved landing page', 'Better targeting'],
        drop: ['Website issues', 'Poor user experience', 'Competition']
      },
      engagementRate: {
        spike: ['Viral content', 'Community event', 'Influencer mention'],
        drop: ['Content quality', 'Audience mismatch', 'Algorithm changes']
      }
    };

    return causes[metric] ? causes[metric][isSpike ? 'spike' : 'drop'] : [];
  }

  private getRecommendedActions(metric: string, isSpike: boolean): string[] {
    const actions: Record<string, { spike: string[]; drop: string[] }> = {
      impressions: {
        spike: ['Monitor budget closely', 'Analyze what triggered the spike', 'Prepare for sustained volume'],
        drop: ['Check campaign status', 'Review budget allocation', 'Investigate platform issues']
      },
      clicks: {
        spike: ['Scale successful elements', 'Monitor conversion rate', 'Prepare infrastructure'],
        drop: ['Refresh creative assets', 'Review targeting', 'A/B test new approaches']
      },
      conversions: {
        spike: ['Analyze conversion path', 'Scale successful campaigns', 'Document learnings'],
        drop: ['Check website functionality', 'Review user experience', 'Audit conversion tracking']
      },
      engagementRate: {
        spike: ['Engage with comments quickly', 'Amplify successful content', 'Learn from success'],
        drop: ['Review content strategy', 'Analyze audience feedback', 'Test new content formats']
      }
    };

    return actions[metric] ? actions[metric][isSpike ? 'spike' : 'drop'] : [];
  }
}