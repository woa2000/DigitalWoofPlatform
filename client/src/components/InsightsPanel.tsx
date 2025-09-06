/**
 * Painel de insights de performance
 * 
 * Analisa dados e fornece insights automatizados e recomendações
 */

import React, { useState, useMemo } from 'react';
import { 
  Brain, 
  TrendingUp, 
  TrendingDown, 
  Target, 
  AlertTriangle, 
  CheckCircle, 
  Lightbulb,
  BarChart3,
  Users,
  DollarSign,
  Calendar,
  Zap
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Badge } from './ui/badge';
import { Button } from './ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from './ui/tabs';
import { Skeleton } from './ui/skeleton';

interface PerformanceInsight {
  insightId: string;
  title: string;
  description: string;
  type: string;
  category: string;
  priority: 'high' | 'medium' | 'low';
  confidence: number;
  generatedAt: string;
  impact?: {
    metric: string;
    expectedChange: number;
    unit: string;
  };
  dataPoints?: Array<{
    metric: string;
    value: string;
    unit: string;
  }>;
  recommendations?: Array<{
    id: string;
    title: string;
    description: string;
    effort?: string;
  }>;
}

interface InsightsPanelProps {
  insights: PerformanceInsight[];
  loading?: boolean;
  onApplyRecommendation?: (insightId: string, recommendationId: string) => void;
  onDismissInsight?: (insightId: string) => void;
}

export function InsightsPanel({
  insights,
  loading,
  onApplyRecommendation,
  onDismissInsight
}: InsightsPanelProps) {
  const [selectedCategory, setSelectedCategory] = useState<string>('all');

  // Group insights by category
  const insightsByCategory = useMemo(() => {
    const grouped = insights.reduce((acc, insight) => {
      if (!acc[insight.category]) {
        acc[insight.category] = [];
      }
      acc[insight.category].push(insight);
      return acc;
    }, {} as Record<string, PerformanceInsight[]>);

    return grouped;
  }, [insights]);

  // Filter insights by category and priority
  const filteredInsights = useMemo(() => {
    let filtered = selectedCategory === 'all' 
      ? insights 
      : insights.filter(i => i.category === selectedCategory);

    // Sort by priority (high > medium > low) and confidence
    return filtered.sort((a, b) => {
      const priorityOrder: Record<'high' | 'medium' | 'low', number> = { high: 3, medium: 2, low: 1 };
      const aPriority = priorityOrder[a.priority];
      const bPriority = priorityOrder[b.priority];
      
      if (aPriority !== bPriority) {
        return bPriority - aPriority;
      }
      
      return b.confidence - a.confidence;
    });
  }, [insights, selectedCategory]);

  // Get insight icon
  const getInsightIcon = (type: string) => {
    switch (type) {
      case 'trend':
        return <TrendingUp className="w-5 h-5" />;
      case 'anomaly':
        return <AlertTriangle className="w-5 h-5" />;
      case 'opportunity':
        return <Target className="w-5 h-5" />;
      case 'optimization':
        return <Zap className="w-5 h-5" />;
      case 'performance':
        return <BarChart3 className="w-5 h-5" />;
      case 'audience':
        return <Users className="w-5 h-5" />;
      case 'budget':
        return <DollarSign className="w-5 h-5" />;
      case 'timing':
        return <Calendar className="w-5 h-5" />;
      default:
        return <Lightbulb className="w-5 h-5" />;
    }
  };

  // Get priority badge variant
  const getPriorityVariant = (priority: string) => {
    switch (priority) {
      case 'high':
        return 'destructive';
      case 'medium':
        return 'default';
      case 'low':
        return 'secondary';
      default:
        return 'outline';
    }
  };

  // Get priority label
  const getPriorityLabel = (priority: string) => {
    switch (priority) {
      case 'high':
        return 'Alta';
      case 'medium':
        return 'Média';
      case 'low':
        return 'Baixa';
      default:
        return priority;
    }
  };

  // Get confidence color
  const getConfidenceColor = (confidence: number) => {
    if (confidence >= 80) return 'text-green-600';
    if (confidence >= 60) return 'text-yellow-600';
    return 'text-red-600';
  };

  // Format impact value
  const formatImpact = (impact: { metric: string; expectedChange: number; unit: string }) => {
    const sign = impact.expectedChange > 0 ? '+' : '';
    const value = impact.unit === 'percentage' 
      ? `${sign}${impact.expectedChange.toFixed(1)}%`
      : `${sign}${impact.expectedChange.toFixed(0)}`;
    
    return `${impact.metric}: ${value}`;
  };

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="flex items-center gap-2">
          {Array.from({ length: 5 }).map((_, i) => (
            <Skeleton key={i} className="h-10 w-20" />
          ))}
        </div>
        <div className="grid gap-4">
          {Array.from({ length: 4 }).map((_, i) => (
            <Card key={i}>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <Skeleton className="w-10 h-10 rounded-full" />
                    <div>
                      <Skeleton className="h-5 w-48 mb-2" />
                      <Skeleton className="h-4 w-32" />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Skeleton className="h-6 w-16" />
                    <Skeleton className="h-4 w-12" />
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <Skeleton className="h-16 w-full" />
                  <div className="flex gap-2">
                    <Skeleton className="h-8 w-24" />
                    <Skeleton className="h-8 w-20" />
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    );
  }

  if (!insights || insights.length === 0) {
    return (
      <Card>
        <CardContent className="flex items-center justify-center py-12">
          <div className="text-center">
            <Brain className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
            <p className="text-muted-foreground">Nenhum insight disponível</p>
            <p className="text-sm text-muted-foreground mt-1">
              Execute campanhas para gerar insights automatizados
            </p>
          </div>
        </CardContent>
      </Card>
    );
  }

  const categories = ['all', ...Object.keys(insightsByCategory)];

  return (
    <div className="space-y-6">
      {/* Category selector */}
      <Tabs value={selectedCategory} onValueChange={setSelectedCategory}>
        <TabsList>
          <TabsTrigger value="all">Todos</TabsTrigger>
          {categories.filter(c => c !== 'all').map((category) => (
            <TabsTrigger key={category} value={category} className="capitalize">
              {category}
            </TabsTrigger>
          ))}
        </TabsList>

        <TabsContent value={selectedCategory} className="space-y-4">
          {/* Summary Stats */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <Card>
              <CardContent className="pt-6">
                <div className="text-center">
                  <div className="text-2xl font-bold text-red-600">
                    {filteredInsights.filter(i => i.priority === 'high').length}
                  </div>
                  <div className="text-sm text-muted-foreground">
                    Alta Prioridade
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="pt-6">
                <div className="text-center">
                  <div className="text-2xl font-bold text-blue-600">
                    {filteredInsights.filter(i => i.type === 'opportunity').length}
                  </div>
                  <div className="text-sm text-muted-foreground">
                    Oportunidades
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="pt-6">
                <div className="text-center">
                  <div className="text-2xl font-bold text-green-600">
                    {filteredInsights.filter(i => i.confidence >= 80).length}
                  </div>
                  <div className="text-sm text-muted-foreground">
                    Alta Confiança
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="pt-6">
                <div className="text-center">
                  <div className="text-2xl font-bold">
                    {Math.round(
                      filteredInsights.reduce((sum, i) => sum + i.confidence, 0) / 
                      filteredInsights.length
                    )}%
                  </div>
                  <div className="text-sm text-muted-foreground">
                    Confiança Média
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Insights List */}
          <div className="space-y-4">
            {filteredInsights.map((insight) => (
              <Card key={insight.insightId} className="transition-all hover:shadow-md">
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <div className="flex items-start gap-3">
                      <div className="p-2 rounded-full bg-primary/10">
                        {getInsightIcon(insight.type)}
                      </div>
                      <div className="flex-1">
                        <CardTitle className="text-base mb-2">{insight.title}</CardTitle>
                        <p className="text-sm text-muted-foreground leading-relaxed">
                          {insight.description}
                        </p>
                        <div className="flex items-center gap-3 mt-3">
                          <Badge variant={getPriorityVariant(insight.priority)}>
                            {getPriorityLabel(insight.priority)}
                          </Badge>
                          <span className={`text-sm font-medium ${getConfidenceColor(insight.confidence)}`}>
                            {insight.confidence}% confiança
                          </span>
                          <Badge variant="outline">
                            {insight.category}
                          </Badge>
                        </div>
                      </div>
                    </div>
                  </div>
                </CardHeader>

                <CardContent>
                  {/* Expected Impact */}
                  {insight.impact && (
                    <div className="mb-4 p-3 bg-blue-50 border border-blue-200 rounded-lg">
                      <div className="flex items-center gap-2 mb-2">
                        <Target className="w-4 h-4 text-blue-600" />
                        <span className="font-medium text-blue-800">Impacto Esperado</span>
                      </div>
                      <div className="text-sm text-blue-700">
                        {formatImpact(insight.impact)}
                      </div>
                    </div>
                  )}

                  {/* Data Points */}
                  {insight.dataPoints && insight.dataPoints.length > 0 && (
                    <div className="mb-4">
                      <div className="text-sm font-medium mb-2">Dados de Suporte:</div>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                        {insight.dataPoints.map((point: any, index: number) => (
                          <div key={index} className="text-sm text-muted-foreground p-2 bg-gray-50 rounded">
                            <span className="font-medium">{point.metric}:</span> {point.value} {point.unit}
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Recommendations */}
                  {insight.recommendations && insight.recommendations.length > 0 && (
                    <div className="space-y-3">
                      <div className="text-sm font-medium">Recomendações:</div>
                      {insight.recommendations.map((rec: any) => (
                        <div key={rec.id} className="flex items-center justify-between p-3 border rounded-lg">
                          <div className="flex-1">
                            <div className="font-medium text-sm">{rec.title}</div>
                            <div className="text-sm text-muted-foreground mt-1">
                              {rec.description}
                            </div>
                            {rec.effort && (
                              <div className="text-xs text-muted-foreground mt-2">
                                Esforço: {rec.effort}
                              </div>
                            )}
                          </div>
                          {onApplyRecommendation && (
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => onApplyRecommendation(insight.insightId, rec.id)}
                            >
                              <CheckCircle className="w-4 h-4 mr-2" />
                              Aplicar
                            </Button>
                          )}
                        </div>
                      ))}
                    </div>
                  )}

                  {/* Actions */}
                  <div className="flex items-center justify-between pt-4 border-t mt-4">
                    <div className="text-xs text-muted-foreground">
                      Gerado em: {new Date(insight.generatedAt).toLocaleString('pt-BR')}
                    </div>
                    {onDismissInsight && (
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => onDismissInsight(insight.insightId)}
                      >
                        Dispensar
                      </Button>
                    )}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          {/* No insights in category */}
          {filteredInsights.length === 0 && selectedCategory !== 'all' && (
            <Card>
              <CardContent className="flex items-center justify-center py-8">
                <div className="text-center">
                  <Lightbulb className="w-8 h-8 text-muted-foreground mx-auto mb-2" />
                  <p className="text-muted-foreground">
                    Nenhum insight disponível para a categoria "{selectedCategory}"
                  </p>
                </div>
              </CardContent>
            </Card>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
}