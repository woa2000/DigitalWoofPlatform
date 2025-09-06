/**
 * Dashboard principal de performance e analytics
 * 
 * Interface completa com métricas overview, charts interativos,
 * comparações com benchmarks e insights acionáveis
 */

import React, { useState, useEffect } from 'react';
import { 
  TrendingUp, 
  TrendingDown, 
  BarChart3, 
  PieChart, 
  Calendar, 
  Download, 
  RefreshCw, 
  Filter,
  Settings,
  Target,
  Award,
  AlertTriangle,
  Lightbulb,
  Users,
  Eye,
  MousePointer,
  ShoppingCart,
  DollarSign
} from 'lucide-react';
import { usePerformance, PerformanceMetric } from '../hooks/usePerformance';
import { MetricCard } from './MetricCard';
import { PerformanceChart } from './PerformanceChart';
import { CampaignTable } from './CampaignTable';
import { TemplateRanking } from './TemplateRanking';
import { BenchmarkComparison } from './BenchmarkComparison';
import { InsightsPanel } from './InsightsPanel';
import { PerformanceFilters } from './PerformanceFilters';
import { ExportModal } from './ExportModal';
import { Button } from './ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Badge } from './ui/badge';
import { Separator } from './ui/separator';
import { Tabs, TabsContent, TabsList, TabsTrigger } from './ui/tabs';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';

export function PerformanceDashboard() {
  const {
    overviewMetrics,
    campaignPerformance,
    templatePerformance,
    timeSeries,
    benchmarks,
    loading,
    error,
    filters,
    selectedCampaigns,
    selectedTemplates,
    selectedMetrics,
    timeRangePresets,
    setDateRange,
    selectCampaigns,
    selectTemplates,
    selectMetrics,
    clearFilters,
    refresh,
    getTopPerformers,
    getUnderperformers,
    getBenchmarkComparison,
    exportData,
    generateReport,
    getInsights
  } = usePerformance();

  // Local state
  const [showFilters, setShowFilters] = useState(false);
  const [showExportModal, setShowExportModal] = useState(false);
  const [selectedTimeRange, setSelectedTimeRange] = useState('30d');
  const [activeTab, setActiveTab] = useState('overview');
  const [insights, setInsights] = useState<any>(null);
  const [loadingInsights, setLoadingInsights] = useState(false);

  // Load insights
  useEffect(() => {
    loadInsights();
  }, [filters]);

  const loadInsights = async () => {
    setLoadingInsights(true);
    try {
      const insightsData = await getInsights();
      setInsights(insightsData);
    } catch (error) {
      console.error('Error loading insights:', error);
    } finally {
      setLoadingInsights(false);
    }
  };

  // Handle time range change
  const handleTimeRangeChange = (value: string) => {
    setSelectedTimeRange(value);
    const preset = timeRangePresets.find(p => p.value === value);
    if (preset) {
      setDateRange(preset.start, preset.end);
    }
  };

  // Format metric value
  const formatMetricValue = (metric: PerformanceMetric) => {
    const { value, unit, format } = metric;
    
    switch (unit) {
      case 'percentage':
        return `${value.toFixed(1)}%`;
      case 'currency':
        return new Intl.NumberFormat('pt-BR', { 
          style: 'currency', 
          currency: 'BRL' 
        }).format(value);
      case 'time':
        return `${value.toFixed(0)}s`;
      case 'number':
      default:
        if (format === 'compact') {
          return new Intl.NumberFormat('pt-BR', { 
            notation: 'compact',
            maximumFractionDigits: 1
          }).format(value);
        }
        return new Intl.NumberFormat('pt-BR').format(value);
    }
  };

  // Get metric icon
  const getMetricIcon = (metricId: string) => {
    switch (metricId) {
      case 'impressions':
        return <Eye className="h-4 w-4" />;
      case 'clicks':
        return <MousePointer className="h-4 w-4" />;
      case 'conversions':
        return <ShoppingCart className="h-4 w-4" />;
      case 'revenue':
      case 'cost':
      case 'roi':
        return <DollarSign className="h-4 w-4" />;
      case 'ctr':
      case 'conversionRate':
      case 'engagementRate':
        return <TrendingUp className="h-4 w-4" />;
      default:
        return <BarChart3 className="h-4 w-4" />;
    }
  };

  // Top performers for current view
  const topCampaigns = getTopPerformers('roi', 3).filter(item => 'campaignId' in item);
  const topTemplates = getTopPerformers('roi', 3).filter(item => 'templateId' in item);

  if (error) {
    return (
      <div className="container mx-auto px-4 py-6">
        <Card>
          <CardContent className="flex items-center justify-center py-12">
            <div className="text-center space-y-4">
              <AlertTriangle className="h-12 w-12 mx-auto text-destructive" />
              <h3 className="text-lg font-medium">Erro ao carregar dashboard</h3>
              <p className="text-muted-foreground">{error}</p>
              <Button onClick={refresh} variant="outline">
                <RefreshCw className="h-4 w-4 mr-2" />
                Tentar novamente
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-6 space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Dashboard de Performance</h1>
          <p className="text-muted-foreground">
            Análise de campanhas e templates com métricas em tempo real
          </p>
        </div>
        
        <div className="flex items-center gap-2">
          <Select value={selectedTimeRange} onValueChange={handleTimeRangeChange}>
            <SelectTrigger className="w-48">
              <Calendar className="h-4 w-4 mr-2" />
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {timeRangePresets.map((preset) => (
                <SelectItem key={preset.value} value={preset.value}>
                  {preset.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          
          <Button
            variant="outline"
            size="sm"
            onClick={() => setShowFilters(!showFilters)}
          >
            <Filter className="h-4 w-4 mr-2" />
            Filtros
          </Button>
          
          <Button
            variant="outline"
            size="sm"
            onClick={() => setShowExportModal(true)}
          >
            <Download className="h-4 w-4 mr-2" />
            Exportar
          </Button>
          
          <Button
            variant="outline"
            size="sm"
            onClick={refresh}
            disabled={loading}
          >
            <RefreshCw className={`h-4 w-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
            Atualizar
          </Button>
        </div>
      </div>

      {/* Filters Panel */}
      {showFilters && (
        <Card>
          <CardContent className="p-6">
            <PerformanceFilters
              filters={filters}
              selectedCampaigns={selectedCampaigns}
              selectedTemplates={selectedTemplates}
              onFiltersChange={() => {}}
              onSelectCampaigns={selectCampaigns}
              onSelectTemplates={selectTemplates}
              onClearFilters={clearFilters}
            />
          </CardContent>
        </Card>
      )}

      {/* Main Dashboard Content */}
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid w-full grid-cols-5">
          <TabsTrigger value="overview">Visão Geral</TabsTrigger>
          <TabsTrigger value="campaigns">Campanhas</TabsTrigger>
          <TabsTrigger value="templates">Templates</TabsTrigger>
          <TabsTrigger value="benchmarks">Benchmarks</TabsTrigger>
          <TabsTrigger value="insights">Insights</TabsTrigger>
        </TabsList>

        {/* Overview Tab */}
        <TabsContent value="overview" className="space-y-6">
          {/* Key Metrics */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {overviewMetrics.map((metric) => (
              <MetricCard
                key={metric.id}
                metric={metric}
                icon={getMetricIcon(metric.id)}
                loading={loading}
              />
            ))}
          </div>

          {/* Charts Row */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Performance Trends */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <TrendingUp className="h-5 w-5" />
                  Tendências de Performance
                </CardTitle>
                <CardDescription>
                  Evolução das principais métricas ao longo do tempo
                </CardDescription>
              </CardHeader>
              <CardContent>
                <PerformanceChart
                  data={timeSeries}
                  type="line"
                  height={300}
                  loading={loading}
                />
              </CardContent>
            </Card>

            {/* Top Performers */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Award className="h-5 w-5" />
                  Top Performers (ROI)
                </CardTitle>
                <CardDescription>
                  Campanhas e templates com melhor retorno
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <h4 className="font-medium mb-2">Campanhas</h4>
                  <div className="space-y-2">
                    {topCampaigns.map((campaign: any) => (
                      <div key={campaign.campaignId} className="flex items-center justify-between p-2 bg-muted/50 rounded">
                        <span className="font-medium truncate">{campaign.campaignName}</span>
                        <Badge variant="secondary">
                          {(campaign.metrics.roi * 100).toFixed(1)}%
                        </Badge>
                      </div>
                    ))}
                  </div>
                </div>
                
                <Separator />
                
                <div>
                  <h4 className="font-medium mb-2">Templates</h4>
                  <div className="space-y-2">
                    {topTemplates.map((template: any) => (
                      <div key={template.templateId} className="flex items-center justify-between p-2 bg-muted/50 rounded">
                        <span className="font-medium truncate">{template.templateName}</span>
                        <Badge variant="secondary">
                          {(template.averagePerformance.roi * 100).toFixed(1)}%
                        </Badge>
                      </div>
                    ))}
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Performance Distribution */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <PieChart className="h-5 w-5" />
                Distribuição de Performance
              </CardTitle>
              <CardDescription>
                Análise da performance por canal e categoria
              </CardDescription>
            </CardHeader>
            <CardContent>
              <PerformanceChart
                data={timeSeries}
                type="pie"
                height={400}
                loading={loading}
              />
            </CardContent>
          </Card>
        </TabsContent>

        {/* Campaigns Tab */}
        <TabsContent value="campaigns" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Performance de Campanhas</CardTitle>
              <CardDescription>
                Análise detalhada de todas as campanhas ativas e concluídas
              </CardDescription>
            </CardHeader>
            <CardContent>
              <CampaignTable
                campaigns={campaignPerformance}
                loading={loading}
                onSelectCampaigns={selectCampaigns}
                selectedCampaigns={selectedCampaigns}
              />
            </CardContent>
          </Card>
        </TabsContent>

        {/* Templates Tab */}
        <TabsContent value="templates" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Ranking de Templates</CardTitle>
                <CardDescription>
                  Templates ordenados por performance e uso
                </CardDescription>
              </CardHeader>
              <CardContent>
                <TemplateRanking
                  templates={templatePerformance}
                  loading={loading}
                  onSelectTemplates={selectTemplates}
                />
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Análise de Templates</CardTitle>
                <CardDescription>
                  Métricas comparativas e tendências
                </CardDescription>
              </CardHeader>
              <CardContent>
                <PerformanceChart
                  data={timeSeries.filter(series => series.metricId === 'template_usage')}
                  type="bar"
                  height={400}
                  loading={loading}
                />
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* Benchmarks Tab */}
        <TabsContent value="benchmarks" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Target className="h-5 w-5" />
                Comparação com Benchmarks
              </CardTitle>
              <CardDescription>
                Compare sua performance com padrões da indústria
              </CardDescription>
            </CardHeader>
            <CardContent>
              <BenchmarkComparison
                benchmarks={benchmarks}
                currentMetrics={overviewMetrics}
                getBenchmarkComparison={getBenchmarkComparison}
                loading={loading}
              />
            </CardContent>
          </Card>
        </TabsContent>

        {/* Insights Tab */}
        <TabsContent value="insights" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Lightbulb className="h-5 w-5" />
                Insights e Recomendações
              </CardTitle>
              <CardDescription>
                Análises automatizadas e sugestões de otimização
              </CardDescription>
            </CardHeader>
            <CardContent>
              <InsightsPanel
                insights={insights}
                loading={loadingInsights}
                onRefresh={loadInsights}
              />
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Export Modal */}
      {showExportModal && (
        <ExportModal
          isOpen={showExportModal}
          onClose={() => setShowExportModal(false)}
          onExport={exportData}
          onGenerateReport={generateReport}
          selectedMetrics={selectedMetrics}
          onSelectMetrics={selectMetrics}
          dateRange={filters.dateRange}
        />
      )}
    </div>
  );
}