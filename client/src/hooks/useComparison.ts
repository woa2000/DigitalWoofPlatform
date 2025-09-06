/**
 * Hook para gerenciar comparação de templates
 * 
 * Funcionalidades:
 * - Seleção múltipla de templates
 * - Limite máximo de comparação
 * - Persistência local da seleção
 * - Métricas comparativas
 * - Recomendações baseadas na seleção
 */

import { useState, useEffect, useMemo, useCallback } from 'react';

interface Template {
  id: string;
  name: string;
  description: string;
  category: string;
  serviceType: string;
  contentPieces: any[];
  visualAssets: any[];
  usageCount: number;
  avgEngagementRate: string;
  avgConversionRate: string;
  successCases: number;
  isPremium: boolean;
  isPublic: boolean;
  createdAt: string;
  updatedAt: string;
}

interface ComparisonMetrics {
  templateId: string;
  performance: {
    engagementRate: number;
    conversionRate: number;
    usageCount: number;
    successScore: number;
  };
  complexity: {
    contentPieces: number;
    visualAssets: number;
    setupTime: string;
    difficulty: 'easy' | 'medium' | 'hard';
  };
  features: {
    channels: string[];
    contentTypes: string[];
    automationLevel: number;
    customizationOptions: number;
  };
  costs: {
    isPremium: boolean;
    estimatedSetupCost: number;
    maintenanceCost: number;
  };
}

interface Recommendation {
  templateId: string;
  reason: string;
  score: number;
  category: 'performance' | 'similar' | 'alternative' | 'trending';
}

interface UseComparisonReturn {
  selectedTemplates: Template[];
  comparisonMetrics: ComparisonMetrics[];
  recommendations: Recommendation[];
  loading: boolean;
  error: string | null;
  maxComparisons: number;
  canAddMore: boolean;
  // Actions
  addTemplate: (template: Template) => void;
  removeTemplate: (templateId: string) => void;
  clearComparison: () => void;
  isSelected: (templateId: string) => boolean;
  getComparisonData: () => Promise<void>;
  exportComparison: (format: 'pdf' | 'csv') => Promise<void>;
}

const MAX_COMPARISONS = 4;
const STORAGE_KEY = 'template-comparison-selection';

export function useComparison(): UseComparisonReturn {
  // State
  const [selectedTemplates, setSelectedTemplates] = useState<Template[]>([]);
  const [comparisonMetrics, setComparisonMetrics] = useState<ComparisonMetrics[]>([]);
  const [recommendations, setRecommendations] = useState<Recommendation[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Load selection from localStorage on mount
  useEffect(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) {
        const parsed = JSON.parse(saved);
        setSelectedTemplates(parsed);
      }
    } catch (err) {
      console.error('Failed to load comparison selection:', err);
    }
  }, []);

  // Save selection to localStorage when it changes
  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(selectedTemplates));
    } catch (err) {
      console.error('Failed to save comparison selection:', err);
    }
  }, [selectedTemplates]);

  // Computed values
  const canAddMore = useMemo(() => {
    return selectedTemplates.length < MAX_COMPARISONS;
  }, [selectedTemplates.length]);

  const isSelected = useCallback((templateId: string) => {
    return selectedTemplates.some(t => t.id === templateId);
  }, [selectedTemplates]);

  // Actions
  const addTemplate = useCallback((template: Template) => {
    if (!canAddMore) {
      setError(`Máximo de ${MAX_COMPARISONS} templates podem ser comparados`);
      return;
    }

    if (isSelected(template.id)) {
      setError('Template já está selecionado para comparação');
      return;
    }

    setSelectedTemplates(prev => [...prev, template]);
    setError(null);
  }, [canAddMore, isSelected]);

  const removeTemplate = useCallback((templateId: string) => {
    setSelectedTemplates(prev => prev.filter(t => t.id !== templateId));
    setError(null);
  }, []);

  const clearComparison = useCallback(() => {
    setSelectedTemplates([]);
    setComparisonMetrics([]);
    setRecommendations([]);
    setError(null);
    localStorage.removeItem(STORAGE_KEY);
  }, []);

  // Fetch detailed comparison data
  const getComparisonData = useCallback(async () => {
    if (selectedTemplates.length === 0) return;

    setLoading(true);
    setError(null);

    try {
      const templateIds = selectedTemplates.map(t => t.id);
      
      // Fetch comparison metrics
      const metricsResponse = await fetch('/api/templates/comparison/metrics', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ templateIds })
      });

      if (!metricsResponse.ok) {
        throw new Error('Failed to fetch comparison metrics');
      }

      const metricsData = await metricsResponse.json();
      setComparisonMetrics(metricsData.metrics);

      // Fetch recommendations based on selection
      const recsResponse = await fetch('/api/templates/comparison/recommendations', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ templateIds })
      });

      if (!recsResponse.ok) {
        throw new Error('Failed to fetch recommendations');
      }

      const recsData = await recsResponse.json();
      setRecommendations(recsData.recommendations);

    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load comparison data');
    } finally {
      setLoading(false);
    }
  }, [selectedTemplates]);

  // Auto-fetch data when selection changes
  useEffect(() => {
    if (selectedTemplates.length >= 2) {
      getComparisonData();
    } else {
      setComparisonMetrics([]);
      setRecommendations([]);
    }
  }, [selectedTemplates, getComparisonData]);

  // Export comparison data
  const exportComparison = useCallback(async (format: 'pdf' | 'csv') => {
    if (selectedTemplates.length === 0) {
      setError('Nenhum template selecionado para exportar');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const response = await fetch('/api/templates/comparison/export', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          templateIds: selectedTemplates.map(t => t.id),
          format,
          includeMetrics: comparisonMetrics.length > 0
        })
      });

      if (!response.ok) {
        throw new Error('Failed to export comparison');
      }

      // Download the file
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `template-comparison.${format}`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);

    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to export comparison');
    } finally {
      setLoading(false);
    }
  }, [selectedTemplates, comparisonMetrics]);

  return {
    selectedTemplates,
    comparisonMetrics,
    recommendations,
    loading,
    error,
    maxComparisons: MAX_COMPARISONS,
    canAddMore,
    addTemplate,
    removeTemplate,
    clearComparison,
    isSelected,
    getComparisonData,
    exportComparison,
  };
}