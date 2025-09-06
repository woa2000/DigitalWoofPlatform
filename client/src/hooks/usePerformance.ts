/**
 * Hook para gerenciar métricas e analytics de performance
 * 
 * Funcionalidades:
 * - Métricas de campanhas e templates
 * - Comparação com benchmarks
 * - Filtros temporais e segmentação
 * - Tendências e insights
 * - Exportação de dados
 */

import { useState, useEffect, useCallback, useMemo } from 'react';
import { useDebounce } from './useDebounce';

export interface PerformanceMetric {
  id: string;
  name: string;
  value: number;
  previousValue?: number;
  change?: number;
  changePercent?: number;
  trend: 'up' | 'down' | 'stable';
  unit: 'percentage' | 'number' | 'currency' | 'time';
  format?: string;
  benchmark?: number;
  target?: number;
  description: string;
}

export interface TimeSeriesPoint {
  timestamp: string;
  value: number;
  label?: string;
}

export interface MetricTimeSeries {
  metricId: string;
  metricName: string;
  data: TimeSeriesPoint[];
  unit: string;
  color?: string;
}

export interface CampaignPerformance {
  campaignId: string;
  campaignName: string;
  templateId: string;
  templateName: string;
  status: 'draft' | 'active' | 'paused' | 'completed';
  startDate: string;
  endDate?: string;
  metrics: {
    impressions: number;
    clicks: number;
    conversions: number;
    ctr: number;
    conversionRate: number;
    cost: number;
    revenue: number;
    roi: number;
    engagementRate: number;
  };
  channels: string[];
  audience: {
    size: number;
    demographics: Record<string, number>;
  };
}

export interface TemplatePerformance {
  templateId: string;
  templateName: string;
  category: string;
  totalUsage: number;
  averagePerformance: {
    ctr: number;
    conversionRate: number;
    engagementRate: number;
    roi: number;
  };
  bestPerformingCampaign: {
    campaignId: string;
    campaignName: string;
    metrics: Record<string, number>;
  };
  trends: {
    usage: 'increasing' | 'decreasing' | 'stable';
    performance: 'improving' | 'declining' | 'stable';
  };
}

export interface PerformanceFilter {
  dateRange: {
    start: string;
    end: string;
  };
  campaigns?: string[];
  templates?: string[];
  channels?: string[];
  categories?: string[];
  status?: string[];
  audience?: {
    minSize?: number;
    maxSize?: number;
    demographics?: Record<string, string[]>;
  };
}

export interface Benchmark {
  id: string;
  name: string;
  category: string;
  metrics: Record<string, number>;
  description: string;
  source: string;
  lastUpdated: string;
}

export interface ExportOptions {
  format: 'csv' | 'xlsx' | 'pdf' | 'json';
  metrics: string[];
  dateRange: {
    start: string;
    end: string;
  };
  includeCharts?: boolean;
  includeComparisons?: boolean;
}

export interface UsePerformanceReturn {
  // Metrics data
  overviewMetrics: PerformanceMetric[];
  campaignPerformance: CampaignPerformance[];
  templatePerformance: TemplatePerformance[];
  timeSeries: MetricTimeSeries[];
  benchmarks: Benchmark[];
  
  // State
  loading: boolean;
  error: string | null;
  filters: PerformanceFilter;
  selectedCampaigns: string[];
  selectedTemplates: string[];
  selectedMetrics: string[];
  
  // Time range presets
  timeRangePresets: {
    label: string;
    value: string;
    start: string;
    end: string;
  }[];
  
  // Actions
  setFilters: (filters: Partial<PerformanceFilter>) => void;
  setDateRange: (start: string, end: string) => void;
  selectCampaigns: (campaignIds: string[]) => void;
  selectTemplates: (templateIds: string[]) => void;
  selectMetrics: (metricIds: string[]) => void;
  clearFilters: () => void;
  refresh: () => void;
  
  // Analytics
  getTopPerformers: (metric: string, limit?: number) => (CampaignPerformance | TemplatePerformance)[];
  getUnderperformers: (metric: string, limit?: number) => (CampaignPerformance | TemplatePerformance)[];
  getTrends: (metricId: string, period: 'daily' | 'weekly' | 'monthly') => Promise<MetricTimeSeries>;
  getComparison: (itemA: string, itemB: string, metrics: string[]) => Record<string, { a: number; b: number; diff: number }>;
  getBenchmarkComparison: (benchmarkId: string, metrics: string[]) => Record<string, { actual: number; benchmark: number; diff: number }>;
  
  // Export
  exportData: (options: ExportOptions) => Promise<void>;
  generateReport: (options: { 
    type: 'summary' | 'detailed' | 'comparison';
    format: 'pdf' | 'html';
    includeCharts: boolean;
  }) => Promise<void>;
  
  // Insights
  getInsights: () => Promise<{
    summary: string;
    recommendations: string[];
    alerts: string[];
    opportunities: string[];
  }>;
}

// Default date range (last 30 days)
const getDefaultDateRange = () => {
  const end = new Date();
  const start = new Date();
  start.setDate(start.getDate() - 30);
  
  return {
    start: start.toISOString().split('T')[0],
    end: end.toISOString().split('T')[0]
  };
};

// Time range presets
const TIME_RANGE_PRESETS = [
  {
    label: 'Últimos 7 dias',
    value: '7d',
    start: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
    end: new Date().toISOString().split('T')[0]
  },
  {
    label: 'Últimos 30 dias',
    value: '30d', 
    start: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
    end: new Date().toISOString().split('T')[0]
  },
  {
    label: 'Últimos 90 dias',
    value: '90d',
    start: new Date(Date.now() - 90 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
    end: new Date().toISOString().split('T')[0]
  },
  {
    label: 'Este mês',
    value: 'this_month',
    start: new Date(new Date().getFullYear(), new Date().getMonth(), 1).toISOString().split('T')[0],
    end: new Date().toISOString().split('T')[0]
  },
  {
    label: 'Mês anterior',
    value: 'last_month',
    start: new Date(new Date().getFullYear(), new Date().getMonth() - 1, 1).toISOString().split('T')[0],
    end: new Date(new Date().getFullYear(), new Date().getMonth(), 0).toISOString().split('T')[0]
  },
  {
    label: 'Este ano',
    value: 'this_year',
    start: new Date(new Date().getFullYear(), 0, 1).toISOString().split('T')[0],
    end: new Date().toISOString().split('T')[0]
  }
];

export function usePerformance(): UsePerformanceReturn {
  // State
  const [overviewMetrics, setOverviewMetrics] = useState<PerformanceMetric[]>([]);
  const [campaignPerformance, setCampaignPerformance] = useState<CampaignPerformance[]>([]);
  const [templatePerformance, setTemplatePerformance] = useState<TemplatePerformance[]>([]);
  const [timeSeries, setTimeSeries] = useState<MetricTimeSeries[]>([]);
  const [benchmarks, setBenchmarks] = useState<Benchmark[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  const [filters, setFiltersState] = useState<PerformanceFilter>({
    dateRange: getDefaultDateRange()
  });
  
  const [selectedCampaigns, setSelectedCampaigns] = useState<string[]>([]);
  const [selectedTemplates, setSelectedTemplates] = useState<string[]>([]);
  const [selectedMetrics, setSelectedMetrics] = useState<string[]>([
    'impressions', 'clicks', 'conversions', 'ctr', 'roi'
  ]);

  // Debounced filters for API calls
  const debouncedFilters = useDebounce(filters, 500);

  // Load performance data
  const loadPerformanceData = useCallback(async (filterParams: PerformanceFilter) => {
    setLoading(true);
    setError(null);

    try {
      const [overviewRes, campaignsRes, templatesRes, timeSeriesRes, benchmarksRes] = await Promise.all([
        fetch('/api/performance/overview', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(filterParams)
        }),
        fetch('/api/performance/campaigns', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(filterParams)
        }),
        fetch('/api/performance/templates', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(filterParams)
        }),
        fetch('/api/performance/timeseries', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ ...filterParams, metrics: selectedMetrics })
        }),
        fetch('/api/performance/benchmarks')
      ]);

      const [overview, campaigns, templates, series, benchmarkData] = await Promise.all([
        overviewRes.json(),
        campaignsRes.json(),
        templatesRes.json(),
        timeSeriesRes.json(),
        benchmarksRes.json()
      ]);

      setOverviewMetrics(overview.metrics);
      setCampaignPerformance(campaigns.campaigns);
      setTemplatePerformance(templates.templates);
      setTimeSeries(series.timeSeries);
      setBenchmarks(benchmarkData.benchmarks);

    } catch (err) {
      const message = err instanceof Error ? err.message : 'Erro ao carregar dados de performance';
      setError(message);
      console.error('Error loading performance data:', err);
    } finally {
      setLoading(false);
    }
  }, [selectedMetrics]);

  // Effect to load data when filters change
  useEffect(() => {
    loadPerformanceData(debouncedFilters);
  }, [debouncedFilters, loadPerformanceData]);

  // Filter actions
  const setFilters = useCallback((newFilters: Partial<PerformanceFilter>) => {
    setFiltersState(prev => ({ ...prev, ...newFilters }));
  }, []);

  const setDateRange = useCallback((start: string, end: string) => {
    setFilters({ dateRange: { start, end } });
  }, [setFilters]);

  const selectCampaigns = useCallback((campaignIds: string[]) => {
    setSelectedCampaigns(campaignIds);
    setFilters({ campaigns: campaignIds.length > 0 ? campaignIds : undefined });
  }, [setFilters]);

  const selectTemplates = useCallback((templateIds: string[]) => {
    setSelectedTemplates(templateIds);
    setFilters({ templates: templateIds.length > 0 ? templateIds : undefined });
  }, [setFilters]);

  const selectMetrics = useCallback((metricIds: string[]) => {
    setSelectedMetrics(metricIds);
  }, []);

  const clearFilters = useCallback(() => {
    setFiltersState({ dateRange: getDefaultDateRange() });
    setSelectedCampaigns([]);
    setSelectedTemplates([]);
    setSelectedMetrics(['impressions', 'clicks', 'conversions', 'ctr', 'roi']);
  }, []);

  const refresh = useCallback(() => {
    loadPerformanceData(filters);
  }, [loadPerformanceData, filters]);

  // Analytics functions
  const getTopPerformers = useCallback((metric: string, limit = 5) => {
    const allItems = [...campaignPerformance, ...templatePerformance];
    return allItems
      .filter(item => {
        const value = 'metrics' in item ? item.metrics[metric as keyof typeof item.metrics] : 
                     'averagePerformance' in item ? item.averagePerformance[metric as keyof typeof item.averagePerformance] : 0;
        return typeof value === 'number' && !isNaN(value);
      })
      .sort((a, b) => {
        const aValue = 'metrics' in a ? a.metrics[metric as keyof typeof a.metrics] : 
                      'averagePerformance' in a ? a.averagePerformance[metric as keyof typeof a.averagePerformance] : 0;
        const bValue = 'metrics' in b ? b.metrics[metric as keyof typeof b.metrics] : 
                      'averagePerformance' in b ? b.averagePerformance[metric as keyof typeof b.averagePerformance] : 0;
        return (bValue as number) - (aValue as number);
      })
      .slice(0, limit);
  }, [campaignPerformance, templatePerformance]);

  const getUnderperformers = useCallback((metric: string, limit = 5) => {
    const allItems = [...campaignPerformance, ...templatePerformance];
    return allItems
      .filter(item => {
        const value = 'metrics' in item ? item.metrics[metric as keyof typeof item.metrics] : 
                     'averagePerformance' in item ? item.averagePerformance[metric as keyof typeof item.averagePerformance] : 0;
        return typeof value === 'number' && !isNaN(value);
      })
      .sort((a, b) => {
        const aValue = 'metrics' in a ? a.metrics[metric as keyof typeof a.metrics] : 
                      'averagePerformance' in a ? a.averagePerformance[metric as keyof typeof a.averagePerformance] : 0;
        const bValue = 'metrics' in b ? b.metrics[metric as keyof typeof b.metrics] : 
                      'averagePerformance' in b ? b.averagePerformance[metric as keyof typeof b.averagePerformance] : 0;
        return (aValue as number) - (bValue as number);
      })
      .slice(0, limit);
  }, [campaignPerformance, templatePerformance]);

  const getTrends = useCallback(async (metricId: string, period: 'daily' | 'weekly' | 'monthly'): Promise<MetricTimeSeries> => {
    try {
      const response = await fetch('/api/performance/trends', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          metricId,
          period,
          filters
        })
      });

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }

      const data = await response.json();
      return data.trend;
    } catch (err) {
      console.error('Error getting trends:', err);
      return {
        metricId,
        metricName: metricId,
        data: [],
        unit: 'number'
      };
    }
  }, [filters]);

  const getComparison = useCallback((itemA: string, itemB: string, metrics: string[]) => {
    const itemAData = [...campaignPerformance, ...templatePerformance].find(item => 
      ('campaignId' in item ? item.campaignId : item.templateId) === itemA
    );
    const itemBData = [...campaignPerformance, ...templatePerformance].find(item => 
      ('campaignId' in item ? item.campaignId : item.templateId) === itemB
    );

    if (!itemAData || !itemBData) return {};

    const comparison: Record<string, { a: number; b: number; diff: number }> = {};

    metrics.forEach(metric => {
      const valueA = 'metrics' in itemAData ? itemAData.metrics[metric as keyof typeof itemAData.metrics] : 
                    'averagePerformance' in itemAData ? itemAData.averagePerformance[metric as keyof typeof itemAData.averagePerformance] : 0;
      const valueB = 'metrics' in itemBData ? itemBData.metrics[metric as keyof typeof itemBData.metrics] : 
                    'averagePerformance' in itemBData ? itemBData.averagePerformance[metric as keyof typeof itemBData.averagePerformance] : 0;

      if (typeof valueA === 'number' && typeof valueB === 'number') {
        comparison[metric] = {
          a: valueA,
          b: valueB,
          diff: valueA - valueB
        };
      }
    });

    return comparison;
  }, [campaignPerformance, templatePerformance]);

  const getBenchmarkComparison = useCallback((benchmarkId: string, metrics: string[]) => {
    const benchmark = benchmarks.find(b => b.id === benchmarkId);
    if (!benchmark) return {};

    const comparison: Record<string, { actual: number; benchmark: number; diff: number }> = {};

    metrics.forEach(metric => {
      const benchmarkValue = benchmark.metrics[metric];
      const actualMetric = overviewMetrics.find(m => m.id === metric);

      if (benchmarkValue !== undefined && actualMetric) {
        comparison[metric] = {
          actual: actualMetric.value,
          benchmark: benchmarkValue,
          diff: actualMetric.value - benchmarkValue
        };
      }
    });

    return comparison;
  }, [benchmarks, overviewMetrics]);

  // Export functions
  const exportData = useCallback(async (options: ExportOptions) => {
    try {
      const response = await fetch('/api/performance/export', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...options,
          filters
        })
      });

      if (!response.ok) {
        throw new Error(`Export failed: ${response.statusText}`);
      }

      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `performance-data-${Date.now()}.${options.format}`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);

    } catch (err) {
      console.error('Error exporting data:', err);
      throw err;
    }
  }, [filters]);

  const generateReport = useCallback(async (options: { 
    type: 'summary' | 'detailed' | 'comparison';
    format: 'pdf' | 'html';
    includeCharts: boolean;
  }) => {
    try {
      const response = await fetch('/api/performance/report', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...options,
          filters,
          selectedCampaigns,
          selectedTemplates,
          selectedMetrics
        })
      });

      if (!response.ok) {
        throw new Error(`Report generation failed: ${response.statusText}`);
      }

      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `performance-report-${Date.now()}.${options.format}`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);

    } catch (err) {
      console.error('Error generating report:', err);
      throw err;
    }
  }, [filters, selectedCampaigns, selectedTemplates, selectedMetrics]);

  // Insights
  const getInsights = useCallback(async () => {
    try {
      const response = await fetch('/api/performance/insights', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          filters,
          metrics: selectedMetrics
        })
      });

      if (!response.ok) {
        throw new Error(`Insights failed: ${response.statusText}`);
      }

      return await response.json();
    } catch (err) {
      console.error('Error getting insights:', err);
      return {
        summary: 'Insights não disponíveis no momento',
        recommendations: [],
        alerts: [],
        opportunities: []
      };
    }
  }, [filters, selectedMetrics]);

  return {
    // Data
    overviewMetrics,
    campaignPerformance,
    templatePerformance,
    timeSeries,
    benchmarks,
    
    // State
    loading,
    error,
    filters,
    selectedCampaigns,
    selectedTemplates,
    selectedMetrics,
    timeRangePresets: TIME_RANGE_PRESETS,
    
    // Actions
    setFilters,
    setDateRange,
    selectCampaigns,
    selectTemplates,
    selectMetrics,
    clearFilters,
    refresh,
    
    // Analytics
    getTopPerformers,
    getUnderperformers,
    getTrends,
    getComparison,
    getBenchmarkComparison,
    
    // Export
    exportData,
    generateReport,
    
    // Insights
    getInsights
  };
}