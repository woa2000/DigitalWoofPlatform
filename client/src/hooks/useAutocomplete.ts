/**
 * Hook para autocompletamento de busca
 * Fornece sugestões inteligentes baseadas na API
 */

import { useState, useEffect, useCallback } from 'react';
import { useDebounce } from './useDebounce';

interface AutocompleteSuggestion {
  type: 'template' | 'category' | 'tag' | 'query';
  value: string;
  label: string;
  metadata?: any;
}

interface UseAutocompleteReturn {
  suggestions: AutocompleteSuggestion[];
  loading: boolean;
  error: string | null;
  selectedIndex: number;
  selectSuggestion: (index: number) => void;
  clearSuggestions: () => void;
}

interface UseAutocompleteOptions {
  minLength?: number;
  maxSuggestions?: number;
  serviceType?: string;
}

export function useAutocomplete(
  query: string,
  options: UseAutocompleteOptions = {}
): UseAutocompleteReturn {
  const {
    minLength = 2,
    maxSuggestions = 10,
    serviceType
  } = options;

  const [suggestions, setSuggestions] = useState<AutocompleteSuggestion[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [selectedIndex, setSelectedIndex] = useState(-1);

  const debouncedQuery = useDebounce(query, 200);

  const fetchSuggestions = useCallback(async (searchQuery: string) => {
    if (searchQuery.length < minLength) {
      setSuggestions([]);
      return;
    }

    try {
      setLoading(true);
      setError(null);

      const response = await fetch('/api/template-search/autocomplete', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          query: searchQuery,
          serviceType,
          limit: maxSuggestions
        })
      });

      if (!response.ok) {
        throw new Error('Falha ao buscar sugestões');
      }

      const result = await response.json();
      
      if (result.success) {
        // Transform API response to suggestions format
        const apiSuggestions = result.data;
        const formattedSuggestions: AutocompleteSuggestion[] = [
          // Query suggestions
          ...(apiSuggestions.suggestions || []).map((s: any) => ({
            type: 'query' as const,
            value: s.query,
            label: s.query,
            metadata: { matches: s.matches }
          })),
          // Category suggestions
          ...(apiSuggestions.categories || []).map((c: any) => ({
            type: 'category' as const,
            value: c.name,
            label: `Categoria: ${c.name}`,
            metadata: { count: c.count }
          })),
          // Template suggestions
          ...(apiSuggestions.templates || []).map((t: any) => ({
            type: 'template' as const,
            value: t.name,
            label: t.name,
            metadata: { id: t.id, category: t.category }
          }))
        ];

        setSuggestions(formattedSuggestions);
        setSelectedIndex(-1);
      } else {
        throw new Error(result.error || 'Erro ao buscar sugestões');
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erro desconhecido');
      setSuggestions([]);
      console.error('Autocomplete error:', err);
    } finally {
      setLoading(false);
    }
  }, [minLength, maxSuggestions, serviceType]);

  useEffect(() => {
    fetchSuggestions(debouncedQuery);
  }, [debouncedQuery, fetchSuggestions]);

  const selectSuggestion = useCallback((index: number) => {
    if (index >= 0 && index < suggestions.length) {
      setSelectedIndex(index);
    }
  }, [suggestions.length]);

  const clearSuggestions = useCallback(() => {
    setSuggestions([]);
    setSelectedIndex(-1);
  }, []);

  return {
    suggestions,
    loading,
    error,
    selectedIndex,
    selectSuggestion,
    clearSuggestions
  };
}

export type { AutocompleteSuggestion };