/**
 * Componente de card para exibir métricas de performance
 * 
 * Exibe valores, tendências, comparações com período anterior
 * e indicadores visuais de performance
 */

import React from 'react';
import { TrendingUp, TrendingDown, Minus, Target, AlertCircle } from 'lucide-react';
import { PerformanceMetric } from '../hooks/usePerformance';
import { Card, CardContent } from './ui/card';
import { Badge } from './ui/badge';
import { Progress } from './ui/progress';
import { Skeleton } from './ui/skeleton';

interface MetricCardProps {
  metric: PerformanceMetric;
  icon?: React.ReactNode;
  loading?: boolean;
  compact?: boolean;
}

export function MetricCard({ metric, icon, loading, compact = false }: MetricCardProps) {
  if (loading) {
    return (
      <Card>
        <CardContent className="p-6">
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <Skeleton className="h-4 w-24" />
              <Skeleton className="h-4 w-4" />
            </div>
            <Skeleton className="h-8 w-20" />
            <div className="flex items-center gap-2">
              <Skeleton className="h-4 w-4" />
              <Skeleton className="h-4 w-16" />
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }

  // Format value based on unit
  const formatValue = (value: number, unit: string, format?: string) => {
    switch (unit) {
      case 'percentage':
        return `${value.toFixed(1)}%`;
      case 'currency':
        return new Intl.NumberFormat('pt-BR', { 
          style: 'currency', 
          currency: 'BRL',
          notation: format === 'compact' ? 'compact' : 'standard',
          maximumFractionDigits: format === 'compact' ? 1 : 2
        }).format(value);
      case 'time':
        if (value >= 3600) {
          return `${(value / 3600).toFixed(1)}h`;
        } else if (value >= 60) {
          return `${(value / 60).toFixed(1)}m`;
        }
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

  // Get trend indicator
  const getTrendIndicator = () => {
    if (!metric.change && metric.change !== 0) {
      return null;
    }

    const isPositive = metric.change > 0;
    const isNegative = metric.change < 0;
    
    // For some metrics, positive change might be bad (e.g., cost)
    const isGoodChange = metric.id === 'cost' ? isNegative : isPositive;
    
    if (metric.change === 0) {
      return (
        <div className="flex items-center gap-1 text-muted-foreground">
          <Minus className="h-3 w-3" />
          <span className="text-xs">0%</span>
        </div>
      );
    }

    return (
      <div className={`flex items-center gap-1 ${
        isGoodChange ? 'text-green-600' : 'text-red-600'
      }`}>
        {isPositive ? (
          <TrendingUp className="h-3 w-3" />
        ) : (
          <TrendingDown className="h-3 w-3" />
        )}
        <span className="text-xs">
          {Math.abs(metric.changePercent || 0).toFixed(1)}%
        </span>
      </div>
    );
  };

  // Get benchmark indicator
  const getBenchmarkIndicator = () => {
    if (!metric.benchmark) return null;

    const diff = metric.value - metric.benchmark;
    const diffPercent = (diff / metric.benchmark) * 100;
    const isAbove = diff > 0;
    
    // For some metrics, being above benchmark might be bad
    const isGood = metric.id === 'cost' ? !isAbove : isAbove;

    return (
      <div className="mt-2">
        <div className="flex items-center justify-between text-xs text-muted-foreground mb-1">
          <span>vs. Benchmark</span>
          <span className={isGood ? 'text-green-600' : 'text-red-600'}>
            {isAbove ? '+' : ''}{diffPercent.toFixed(1)}%
          </span>
        </div>
        <Progress 
          value={Math.min((metric.value / metric.benchmark) * 100, 100)} 
          className="h-1"
        />
      </div>
    );
  };

  // Get target indicator
  const getTargetIndicator = () => {
    if (!metric.target) return null;

    const progress = (metric.value / metric.target) * 100;
    const isOnTrack = progress >= 80;

    return (
      <div className="mt-2">
        <div className="flex items-center justify-between text-xs text-muted-foreground mb-1">
          <span className="flex items-center gap-1">
            <Target className="h-3 w-3" />
            Meta
          </span>
          <span className={isOnTrack ? 'text-green-600' : 'text-orange-600'}>
            {progress.toFixed(0)}%
          </span>
        </div>
        <Progress 
          value={Math.min(progress, 100)} 
          className="h-1"
        />
      </div>
    );
  };

  const formattedValue = formatValue(metric.value, metric.unit, metric.format);
  const trendIndicator = getTrendIndicator();
  const benchmarkIndicator = getBenchmarkIndicator();
  const targetIndicator = getTargetIndicator();

  return (
    <Card className={compact ? 'h-auto' : 'h-full'}>
      <CardContent className={compact ? 'p-4' : 'p-6'}>
        <div className="space-y-3">
          {/* Header */}
          <div className="flex items-start justify-between">
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-muted-foreground truncate">
                {metric.name}
              </p>
              {metric.description && !compact && (
                <p className="text-xs text-muted-foreground mt-1">
                  {metric.description}
                </p>
              )}
            </div>
            {icon && (
              <div className="text-muted-foreground ml-2 flex-shrink-0">
                {icon}
              </div>
            )}
          </div>

          {/* Value */}
          <div className="space-y-1">
            <div className="flex items-end gap-2">
              <span className={`font-bold ${compact ? 'text-xl' : 'text-2xl'}`}>
                {formattedValue}
              </span>
              {trendIndicator}
            </div>
            
            {metric.previousValue && (
              <p className="text-xs text-muted-foreground">
                vs. {formatValue(metric.previousValue, metric.unit, metric.format)} anterior
              </p>
            )}
          </div>

          {/* Progress indicators */}
          {!compact && (
            <div className="space-y-2">
              {benchmarkIndicator}
              {targetIndicator}
            </div>
          )}

          {/* Trend badge */}
          {metric.trend && !compact && (
            <div className="flex items-center justify-between">
              <Badge 
                variant={
                  metric.trend === 'up' ? 'default' :
                  metric.trend === 'down' ? 'destructive' : 
                  'secondary'
                }
                className="text-xs"
              >
                {metric.trend === 'up' ? 'Em alta' :
                 metric.trend === 'down' ? 'Em baixa' :
                 'Estável'}
              </Badge>
              
              {/* Warning indicator for concerning trends */}
              {metric.trend === 'down' && ['revenue', 'conversions', 'ctr'].includes(metric.id) && (
                <AlertCircle className="h-4 w-4 text-orange-500" />
              )}
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}