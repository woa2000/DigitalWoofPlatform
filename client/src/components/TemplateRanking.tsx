/**
 * Componente de ranking de templates
 * 
 * Exibe templates ordenados por performance com métricas comparativas
 */

import React, { useState, useMemo } from 'react';
import { Trophy, Medal, Award, TrendingUp, TrendingDown, Star, Eye, Copy } from 'lucide-react';
import { TemplatePerformance } from '../hooks/usePerformance';
import { Badge } from './ui/badge';
import { Button } from './ui/button';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Progress } from './ui/progress';
import { Skeleton } from './ui/skeleton';

interface TemplateRankingProps {
  templates: TemplatePerformance[];
  loading?: boolean;
  maxItems?: number;
  showDetailedMetrics?: boolean;
  onViewTemplate?: (templateId: string) => void;
  onUseTemplate?: (templateId: string) => void;
}

type RankingMetric = 'roi' | 'conversionRate' | 'engagementRate' | 'ctr';

export function TemplateRanking({
  templates,
  loading,
  maxItems = 10,
  showDetailedMetrics = true,
  onViewTemplate,
  onUseTemplate
}: TemplateRankingProps) {
  const [selectedMetric, setSelectedMetric] = useState<RankingMetric>('roi');

    // Sort templates by selected metric
  const rankedTemplates = useMemo(() => {
    const sorted = [...templates].sort((a, b) => {
      const aValue = a.averagePerformance[selectedMetric];
      const bValue = b.averagePerformance[selectedMetric];
      return bValue - aValue;
    });

    return sorted.slice(0, maxItems);
  }, [templates, selectedMetric, maxItems]);

  // Get ranking position icon
  const getRankingIcon = (position: number) => {
    switch (position) {
      case 1:
        return <Trophy className="w-5 h-5 text-yellow-500" />;
      case 2:
        return <Medal className="w-5 h-5 text-gray-400" />;
      case 3:
        return <Award className="w-5 h-5 text-amber-600" />;
      default:
        return (
          <div className="w-5 h-5 rounded-full bg-muted flex items-center justify-center text-xs font-medium">
            {position}
          </div>
        );
    }
  };

  // Get template category badge
  const getCategoryBadge = (category: string) => {
    const variants: Record<string, any> = {
      promotional: 'default',
      educational: 'secondary',
      seasonal: 'outline',
      product: 'destructive'
    };

    return variants[category] || 'secondary';
  };

  // Format metric value
  const formatMetricValue = (value: number, metric: RankingMetric) => {
    switch (metric) {
      case 'roi':
        return `${value > 0 ? '+' : ''}${value.toFixed(1)}%`;
      case 'conversionRate':
      case 'engagementRate':
      case 'ctr':
        return `${value.toFixed(2)}%`;
      default:
        return value.toLocaleString('pt-BR');
    }
  };

  // Get metric label
  const getMetricLabel = (metric: RankingMetric) => {
    switch (metric) {
      case 'roi':
        return 'ROI';
      case 'conversionRate':
        return 'Taxa de Conversão';
      case 'engagementRate':
        return 'Taxa de Engajamento';
      case 'ctr':
        return 'CTR';
      default:
        return metric;
    }
  };

  // Calculate performance score (0-100)
  const calculateScore = (template: TemplatePerformance) => {
    const maxValues = templates.reduce(
      (max, t) => ({
        roi: Math.max(max.roi, t.averagePerformance.roi),
        conversionRate: Math.max(max.conversionRate, t.averagePerformance.conversionRate),
        engagementRate: Math.max(max.engagementRate, t.averagePerformance.engagementRate),
        ctr: Math.max(max.ctr, t.averagePerformance.ctr)
      }),
      { roi: 0, conversionRate: 0, engagementRate: 0, ctr: 0 }
    );

    const scores = [
      (template.averagePerformance.roi / maxValues.roi) * 25,
      (template.averagePerformance.conversionRate / maxValues.conversionRate) * 25,
      (template.averagePerformance.engagementRate / maxValues.engagementRate) * 25,
      (template.averagePerformance.ctr / maxValues.ctr) * 25
    ];

    return Math.round(scores.reduce((sum, score) => sum + score, 0));
  };

  if (loading) {
    return (
      <div className="space-y-4">
        <div className="flex items-center gap-2 mb-4">
          <Skeleton className="h-8 w-32" />
          <Skeleton className="h-8 w-24" />
          <Skeleton className="h-8 w-28" />
          <Skeleton className="h-8 w-20" />
        </div>
        {Array.from({ length: 5 }).map((_, i) => (
          <Card key={i}>
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <Skeleton className="w-8 h-8" />
                  <div>
                    <Skeleton className="h-5 w-32 mb-1" />
                    <Skeleton className="h-4 w-24" />
                  </div>
                </div>
                <Skeleton className="h-6 w-16" />
              </div>
            </CardHeader>
            <CardContent className="pt-0">
              <div className="grid grid-cols-4 gap-4">
                {Array.from({ length: 4 }).map((_, j) => (
                  <div key={j}>
                    <Skeleton className="h-4 w-16 mb-1" />
                    <Skeleton className="h-6 w-12" />
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  if (!templates || templates.length === 0) {
    return (
      <Card>
        <CardContent className="flex items-center justify-center py-12">
          <div className="text-center">
            <Star className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
            <p className="text-muted-foreground">Nenhum template encontrado</p>
            <p className="text-sm text-muted-foreground mt-1">
              Crie templates para ver o ranking de performance
            </p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-4">
      {/* Metric selector */}
      <div className="flex items-center gap-2 flex-wrap">
        <span className="text-sm font-medium">Ordenar por:</span>
        {(['roi', 'conversionRate', 'engagementRate', 'ctr'] as RankingMetric[]).map((metric) => (
          <Button
            key={metric}
            variant={selectedMetric === metric ? 'default' : 'outline'}
            size="sm"
            onClick={() => setSelectedMetric(metric)}
          >
            {getMetricLabel(metric)}
          </Button>
        ))}
      </div>

      {/* Rankings */}
      <div className="space-y-3">
        {rankedTemplates.map((template, index) => {
          const position = index + 1;
          const score = calculateScore(template);
          const isTopPerformer = position <= 3;

          return (
            <Card 
              key={template.templateId} 
              className={isTopPerformer ? 'border-primary/20 bg-primary/5' : ''}
            >
              <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="flex items-center gap-2">
                      {getRankingIcon(position)}
                      <span className="text-sm font-medium text-muted-foreground">
                        #{position}
                      </span>
                    </div>
                    <div>
                      <CardTitle className="text-base">{template.templateName}</CardTitle>
                      <div className="flex items-center gap-2 mt-1">
                        <Badge variant={getCategoryBadge(template.category)}>
                          {template.category}
                        </Badge>
                        <span className="text-xs text-muted-foreground">
                          {template.totalUsage} uso{template.totalUsage !== 1 ? 's' : ''}
                        </span>
                      </div>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="text-lg font-bold">
                      {formatMetricValue(template.averagePerformance[selectedMetric], selectedMetric)}
                    </div>
                    <div className="text-xs text-muted-foreground">
                      Score: {score}/100
                    </div>
                  </div>
                </div>
              </CardHeader>

              {showDetailedMetrics && (
                <CardContent className="pt-0">
                  <div className="space-y-3">
                    {/* Performance Score Bar */}
                    <div>
                      <div className="flex items-center justify-between text-sm mb-1">
                        <span>Performance Score</span>
                        <span>{score}/100</span>
                      </div>
                      <Progress value={score} className="h-2" />
                    </div>

                    {/* Detailed Metrics */}
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                      <div>
                        <div className="text-muted-foreground">ROI</div>
                        <div className={`font-medium ${
                          template.averagePerformance.roi > 0 ? 'text-green-600' : 'text-red-600'
                        }`}>
                          {formatMetricValue(template.averagePerformance.roi, 'roi')}
                        </div>
                      </div>
                      <div>
                        <div className="text-muted-foreground">Conversão</div>
                        <div className="font-medium">
                          {formatMetricValue(template.averagePerformance.conversionRate, 'conversionRate')}
                        </div>
                      </div>
                      <div>
                        <div className="text-muted-foreground">Engajamento</div>
                        <div className="font-medium">
                          {formatMetricValue(template.averagePerformance.engagementRate, 'engagementRate')}
                        </div>
                      </div>
                      <div>
                        <div className="text-muted-foreground">CTR</div>
                        <div className="font-medium">
                          {formatMetricValue(template.averagePerformance.ctr, 'ctr')}
                        </div>
                      </div>
                    </div>

                    {/* Additional Stats */}
                    <div className="grid grid-cols-3 gap-4 pt-2 border-t text-sm">
                      <div className="text-center">
                        <div className="text-muted-foreground">Total de Usos</div>
                        <div className="font-medium">
                          {template.totalUsage.toLocaleString('pt-BR')}
                        </div>
                      </div>
                      <div className="text-center">
                        <div className="text-muted-foreground">Melhor Campanha</div>
                        <div className="font-medium text-xs">
                          {template.bestPerformingCampaign.campaignName}
                        </div>
                      </div>
                      <div className="text-center">
                        <div className="text-muted-foreground">Tendência</div>
                        <div className={`font-medium ${
                          template.trends.performance === 'improving' ? 'text-green-600' :
                          template.trends.performance === 'declining' ? 'text-red-600' : 'text-gray-600'
                        }`}>
                          {template.trends.performance === 'improving' ? 'Melhorando' :
                           template.trends.performance === 'declining' ? 'Declinando' : 'Estável'}
                        </div>
                      </div>
                    </div>

                    {/* Actions */}
                    <div className="flex items-center gap-2 pt-2">
                      {onViewTemplate && (
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => onViewTemplate(template.templateId)}
                        >
                          <Eye className="w-4 h-4 mr-2" />
                          Ver detalhes
                        </Button>
                      )}
                      {onUseTemplate && (
                        <Button
                          size="sm"
                          onClick={() => onUseTemplate(template.templateId)}
                        >
                          <Copy className="w-4 h-4 mr-2" />
                          Usar template
                        </Button>
                      )}
                    </div>
                  </div>
                </CardContent>
              )}
            </Card>
          );
        })}
      </div>

      {/* Summary */}
      {rankedTemplates.length > 0 && (
        <Card>
          <CardContent className="pt-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-center">
              <div>
                <div className="text-2xl font-bold text-green-600">
                  {rankedTemplates.filter(t => t.averagePerformance.roi > 0).length}
                </div>
                <div className="text-sm text-muted-foreground">
                  Templates com ROI positivo
                </div>
              </div>
              <div>
                <div className="text-2xl font-bold">
                  {(rankedTemplates.reduce((sum, t) => sum + t.averagePerformance.conversionRate, 0) / rankedTemplates.length).toFixed(2)}%
                </div>
                <div className="text-sm text-muted-foreground">
                  Taxa de conversão média
                </div>
              </div>
              <div>
                <div className="text-2xl font-bold text-blue-600">
                  {rankedTemplates.reduce((sum, t) => sum + t.totalUsage, 0)}
                </div>
                <div className="text-sm text-muted-foreground">
                  Total de utilizações
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}