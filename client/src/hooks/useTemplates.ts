/**
 * Hook para gerenciar busca e descoberta de templates
 * 
 * Funcionalidades:
 * - Busca textual com debounce
 * - Filtros múltiplos em tempo real
 * - Paginação otimizada
 * - Cache local de resultados
 * - Estado de loading e errors
 */

import { useState, useEffect, useMemo, useCallback } from 'react';
import { useDebounce } from './useDebounce';

// Types
interface SearchFilters {
  query?: string;
  serviceType?: string;
  category?: string;
  tags?: string[];
  performanceMin?: number;
  performanceMax?: number;
  isPremium?: boolean;
  contentTypes?: string[];
  sortBy?: 'relevance' | 'performance' | 'usage' | 'date' | 'name';
  sortOrder?: 'asc' | 'desc';
}

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

interface SearchResult {
  items: Template[];
  total: number;
  facets?: any;
  filters?: SearchFilters;
}

interface UseTemplatesReturn {
  templates: Template[];
  loading: boolean;
  error: string | null;
  total: number;
  facets: any;
  filters: SearchFilters;
  pagination: {
    page: number;
    limit: number;
    hasMore: boolean;
  };
  // Actions
  search: (query: string) => void;
  setFilters: (filters: Partial<SearchFilters>) => void;
  clearFilters: () => void;
  loadMore: () => void;
  refresh: () => void;
}

const DEFAULT_FILTERS: SearchFilters = {
  sortBy: 'relevance',
  sortOrder: 'desc'
};

const PAGE_SIZE = 20;

export function useTemplates(): UseTemplatesReturn {
  // State
  const [templates, setTemplates] = useState<Template[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [total, setTotal] = useState(0);
  const [facets, setFacets] = useState({});
  const [filters, setFiltersState] = useState<SearchFilters>(DEFAULT_FILTERS);
  const [page, setPage] = useState(1);

  // Debounced query for performance
  const debouncedQuery = useDebounce(filters.query || '', 300);

  // Memoized search params
  const searchParams = useMemo(() => ({
    ...filters,
    query: debouncedQuery,
    page,
    limit: PAGE_SIZE
  }), [filters, debouncedQuery, page]);

  // Search function
  const performSearch = useCallback(async (params: any, isLoadMore = false) => {
    try {
      setLoading(true);
      setError(null);

      const response = await fetch('/api/template-search/search', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(params)
      });

      if (!response.ok) {
        throw new Error('Falha na busca de templates');
      }

      const result = await response.json();
      
      if (result.success) {
        const searchResult: SearchResult = result.data;
        
        if (isLoadMore) {
          setTemplates(prev => [...prev, ...searchResult.items]);
        } else {
          setTemplates(searchResult.items);
        }
        
        setTotal(searchResult.total);
        setFacets(searchResult.facets || {});
      } else {
        throw new Error(result.error || 'Erro na busca');
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erro desconhecido');
      console.error('Search error:', err);
    } finally {
      setLoading(false);
    }
  }, []);

  // Load facets
  const loadFacets = useCallback(async () => {
    try {
      const queryParams = new URLSearchParams();
      if (debouncedQuery) queryParams.set('query', debouncedQuery);
      if (filters.serviceType) queryParams.set('serviceType', filters.serviceType);

      const response = await fetch(`/api/template-search/facets?${queryParams}`);
      
      if (response.ok) {
        const result = await response.json();
        if (result.success) {
          setFacets(result.data);
        }
      }
    } catch (err) {
      console.error('Facets error:', err);
    }
  }, [debouncedQuery, filters.serviceType]);

  // Effects
  useEffect(() => {
    setPage(1); // Reset page when filters change
  }, [debouncedQuery, filters.serviceType, filters.category, filters.isPremium]);

  useEffect(() => {
    performSearch(searchParams, false);
  }, [searchParams, performSearch]);

  useEffect(() => {
    loadFacets();
  }, [loadFacets]);

  // Actions
  const search = useCallback((query: string) => {
    setFiltersState(prev => ({ ...prev, query }));
  }, []);

  const setFilters = useCallback((newFilters: Partial<SearchFilters>) => {
    setFiltersState(prev => ({ ...prev, ...newFilters }));
  }, []);

  const clearFilters = useCallback(() => {
    setFiltersState(DEFAULT_FILTERS);
    setPage(1);
  }, []);

  const loadMore = useCallback(() => {
    if (loading || templates.length >= total) return;
    
    const nextPage = page + 1;
    setPage(nextPage);
    
    performSearch({ ...searchParams, page: nextPage }, true);
  }, [loading, templates.length, total, page, searchParams, performSearch]);

  const refresh = useCallback(() => {
    setPage(1);
    performSearch({ ...searchParams, page: 1 }, false);
  }, [searchParams, performSearch]);

  // Computed values
  const hasMore = templates.length < total;

  return {
    templates,
    loading,
    error,
    total,
    facets,
    filters,
    pagination: {
      page,
      limit: PAGE_SIZE,
      hasMore
    },
    search,
    setFilters,
    clearFilters,
    loadMore,
    refresh
  };
}

export type { Template, SearchFilters, UseTemplatesReturn };