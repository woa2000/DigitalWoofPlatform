/**
 * Componente de comparação de benchmarks
 * 
 * Compara performance com benchmarks da indústria e metas definidas
 */

import React, { useState } from 'react';
import { TrendingUp, TrendingDown, Target, Award, AlertCircle, CheckCircle } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Progress } from './ui/progress';
import { Badge } from './ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from './ui/tabs';
import { Skeleton } from './ui/skeleton';

interface PerformanceBenchmark {
  metricName: string;
  category: string;
  currentValue: number;
  benchmarkValue: number;
  targetValue?: number;
  unit: string;
  period: string;
  trend: 'improving' | 'declining' | 'stable';
}

interface BenchmarkComparisonProps {
  benchmarks: PerformanceBenchmark[];
  loading?: boolean;
  showTrends?: boolean;
  showTargets?: boolean;
}

export function BenchmarkComparison({
  benchmarks,
  loading,
  showTrends = true,
  showTargets = true
}: BenchmarkComparisonProps) {
  const [selectedCategory, setSelectedCategory] = useState<string>('overall');

  // Get unique categories
  const categories = ['overall', ...Array.from(new Set(benchmarks.map(b => b.category)))];

  // Filter benchmarks by category
  const filteredBenchmarks = selectedCategory === 'overall' 
    ? benchmarks 
    : benchmarks.filter(b => b.category === selectedCategory);

  // Format metric value
  const formatValue = (value: number, unit: string) => {
    switch (unit) {
      case 'percentage':
        return `${value.toFixed(1)}%`;
      case 'currency':
        return new Intl.NumberFormat('pt-BR', { 
          style: 'currency', 
          currency: 'BRL',
          notation: 'compact',
          maximumFractionDigits: 1
        }).format(value);
      case 'number':
        if (value >= 1000000) {
          return `${(value / 1000000).toFixed(1)}M`;
        } else if (value >= 1000) {
          return `${(value / 1000).toFixed(1)}K`;
        }
        return value.toLocaleString('pt-BR');
      default:
        return value.toString();
    }
  };

  // Get performance status
  const getPerformanceStatus = (current: number, benchmark: number, target?: number) => {
    const diff = ((current - benchmark) / benchmark) * 100;
    
    if (target && current >= target) {
      return { status: 'excellent', label: 'Excelente', color: 'text-green-600' };
    } else if (diff >= 20) {
      return { status: 'above', label: 'Acima do Benchmark', color: 'text-green-600' };
    } else if (diff >= 0) {
      return { status: 'good', label: 'Bom', color: 'text-blue-600' };
    } else if (diff >= -10) {
      return { status: 'below', label: 'Abaixo do Benchmark', color: 'text-yellow-600' };
    } else {
      return { status: 'poor', label: 'Necessita Melhoria', color: 'text-red-600' };
    }
  };

  // Get trend icon
  const getTrendIcon = (trend: 'improving' | 'declining' | 'stable') => {
    switch (trend) {
      case 'improving':
        return <TrendingUp className="w-4 h-4 text-green-500" />;
      case 'declining':
        return <TrendingDown className="w-4 h-4 text-red-500" />;
      default:
        return <div className="w-4 h-4 rounded-full bg-gray-300" />;
    }
  };

  // Get status icon
  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'excellent':
        return <Award className="w-5 h-5 text-green-500" />;
      case 'above':
      case 'good':
        return <CheckCircle className="w-5 h-5 text-blue-500" />;
      case 'below':
        return <AlertCircle className="w-5 h-5 text-yellow-500" />;
      case 'poor':
        return <AlertCircle className="w-5 h-5 text-red-500" />;
      default:
        return <Target className="w-5 h-5 text-gray-500" />;
    }
  };

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="flex items-center gap-2">
          {Array.from({ length: 4 }).map((_, i) => (
            <Skeleton key={i} className="h-10 w-24" />
          ))}
        </div>
        <div className="grid gap-4">
          {Array.from({ length: 6 }).map((_, i) => (
            <Card key={i}>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <Skeleton className="h-5 w-32" />
                  <Skeleton className="h-6 w-20" />
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <Skeleton className="h-2 w-full" />
                  <div className="grid grid-cols-3 gap-4">
                    <Skeleton className="h-8 w-full" />
                    <Skeleton className="h-8 w-full" />
                    <Skeleton className="h-8 w-full" />
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    );
  }

  if (!benchmarks || benchmarks.length === 0) {
    return (
      <Card>
        <CardContent className="flex items-center justify-center py-12">
          <div className="text-center">
            <Target className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
            <p className="text-muted-foreground">Nenhum benchmark disponível</p>
            <p className="text-sm text-muted-foreground mt-1">
              Configure benchmarks para comparar a performance
            </p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      {/* Category selector */}
      <Tabs value={selectedCategory} onValueChange={setSelectedCategory}>
        <TabsList>
          <TabsTrigger value="overall">Geral</TabsTrigger>
          {categories.filter(c => c !== 'overall').map((category) => (
            <TabsTrigger key={category} value={category} className="capitalize">
              {category}
            </TabsTrigger>
          ))}
        </TabsList>

        <TabsContent value={selectedCategory} className="space-y-4">
          {/* Overview Cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Card>
              <CardContent className="pt-6">
                <div className="text-center">
                  <div className="text-2xl font-bold text-green-600">
                    {filteredBenchmarks.filter(b => {
                      const status = getPerformanceStatus(b.currentValue, b.benchmarkValue, b.targetValue);
                      return status.status === 'excellent' || status.status === 'above';
                    }).length}
                  </div>
                  <div className="text-sm text-muted-foreground">
                    Métricas acima do benchmark
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="pt-6">
                <div className="text-center">
                  <div className="text-2xl font-bold text-blue-600">
                    {filteredBenchmarks.filter(b => b.trend === 'improving').length}
                  </div>
                  <div className="text-sm text-muted-foreground">
                    Métricas em melhoria
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="pt-6">
                <div className="text-center">
                  <div className="text-2xl font-bold">
                    {Math.round(
                      filteredBenchmarks.reduce((sum, b) => {
                        const diff = ((b.currentValue - b.benchmarkValue) / b.benchmarkValue) * 100;
                        return sum + diff;
                      }, 0) / filteredBenchmarks.length
                    )}%
                  </div>
                  <div className="text-sm text-muted-foreground">
                    Diferença média vs benchmark
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Detailed Benchmarks */}
          <div className="grid gap-4">
            {filteredBenchmarks.map((benchmark) => {
              const performanceStatus = getPerformanceStatus(
                benchmark.currentValue, 
                benchmark.benchmarkValue, 
                benchmark.targetValue
              );
              
              const progress = Math.min(
                Math.max((benchmark.currentValue / benchmark.benchmarkValue) * 100, 0), 
                200
              );

              const targetProgress = benchmark.targetValue 
                ? Math.min(Math.max((benchmark.currentValue / benchmark.targetValue) * 100, 0), 100)
                : 0;

              return (
                <Card key={benchmark.metricName}>
                  <CardHeader>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        {getStatusIcon(performanceStatus.status)}
                        <div>
                          <CardTitle className="text-base">{benchmark.metricName}</CardTitle>
                          <Badge variant="outline" className="mt-1">
                            {benchmark.category}
                          </Badge>
                        </div>
                      </div>
                      <div className="text-right">
                        <div className={`text-lg font-bold ${performanceStatus.color}`}>
                          {formatValue(benchmark.currentValue, benchmark.unit)}
                        </div>
                        <div className="text-xs text-muted-foreground">
                          {performanceStatus.label}
                        </div>
                      </div>
                    </div>
                  </CardHeader>

                  <CardContent>
                    <div className="space-y-4">
                      {/* Progress vs Benchmark */}
                      <div>
                        <div className="flex items-center justify-between text-sm mb-2">
                          <span>vs Benchmark da Indústria</span>
                          <span className="font-medium">
                            {formatValue(benchmark.benchmarkValue, benchmark.unit)}
                          </span>
                        </div>
                        <Progress value={Math.min(progress, 100)} className="h-2" />
                        <div className="text-xs text-muted-foreground mt-1">
                          {((benchmark.currentValue - benchmark.benchmarkValue) / benchmark.benchmarkValue * 100).toFixed(1)}% 
                          {benchmark.currentValue > benchmark.benchmarkValue ? ' acima' : ' abaixo'} do benchmark
                        </div>
                      </div>

                      {/* Progress vs Target */}
                      {showTargets && benchmark.targetValue && (
                        <div>
                          <div className="flex items-center justify-between text-sm mb-2">
                            <span>vs Meta Definida</span>
                            <span className="font-medium">
                              {formatValue(benchmark.targetValue, benchmark.unit)}
                            </span>
                          </div>
                          <Progress value={targetProgress} className="h-2" />
                          <div className="text-xs text-muted-foreground mt-1">
                            {targetProgress.toFixed(1)}% da meta alcançada
                          </div>
                        </div>
                      )}

                      {/* Trend and additional info */}
                      <div className="flex items-center justify-between pt-2 border-t">
                        {showTrends && (
                          <div className="flex items-center gap-2">
                            {getTrendIcon(benchmark.trend)}
                            <span className="text-sm text-muted-foreground">
                              Tendência: {
                                benchmark.trend === 'improving' ? 'Melhorando' :
                                benchmark.trend === 'declining' ? 'Declinando' : 'Estável'
                              }
                            </span>
                          </div>
                        )}
                        
                        <div className="text-xs text-muted-foreground">
                          Período: {benchmark.period}
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>

          {/* Recommendations */}
          {filteredBenchmarks.some(b => {
            const status = getPerformanceStatus(b.currentValue, b.benchmarkValue, b.targetValue);
            return status.status === 'below' || status.status === 'poor';
          }) && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <AlertCircle className="w-5 h-5 text-yellow-500" />
                  Recomendações de Melhoria
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {filteredBenchmarks
                    .filter(b => {
                      const status = getPerformanceStatus(b.currentValue, b.benchmarkValue, b.targetValue);
                      return status.status === 'below' || status.status === 'poor';
                    })
                    .map((benchmark) => (
                      <div key={benchmark.metricName} className="p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
                        <div className="font-medium text-yellow-800">
                          {benchmark.metricName}
                        </div>
                        <div className="text-sm text-yellow-700 mt-1">
                          Está {formatValue(benchmark.currentValue, benchmark.unit)} vs benchmark de{' '}
                          {formatValue(benchmark.benchmarkValue, benchmark.unit)}. 
                          Considere revisar estratégias para esta métrica.
                        </div>
                      </div>
                    ))}
                </div>
              </CardContent>
            </Card>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
}