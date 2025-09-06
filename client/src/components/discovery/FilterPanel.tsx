/**
 * Componente de filtros avançados para templates
 * 
 * Features:
 * - Filtros por categoria, tipo de serviço, performance
 * - Seletores de múltipla escolha para tags
 * - Range slider para performance
 * - Toggle para templates premium
 * - Contadores dinâmicos de resultados (facets)
 * - Reset rápido de filtros
 */

import React, { useState } from 'react';
import { Filter, X, ChevronDown, Star, TrendingUp, Tag } from 'lucide-react';
import { SearchFilters } from '../../hooks/useTemplates';

interface FilterPanelProps {
  filters: SearchFilters;
  facets: any;
  onFiltersChange: (filters: Partial<SearchFilters>) => void;
  onClearFilters: () => void;
  className?: string;
}

export function FilterPanel({
  filters,
  facets,
  onFiltersChange,
  onClearFilters,
  className = ""
}: FilterPanelProps) {
  const [expandedSections, setExpandedSections] = useState<Set<string>>(
    new Set(['category', 'serviceType'])
  );

  const toggleSection = (section: string) => {
    setExpandedSections(prev => {
      const next = new Set(prev);
      if (next.has(section)) {
        next.delete(section);
      } else {
        next.add(section);
      }
      return next;
    });
  };

  const hasActiveFilters = Object.keys(filters).some(key => {
    const value = filters[key as keyof SearchFilters];
    return value !== undefined && value !== '' && 
           !(Array.isArray(value) && value.length === 0);
  });

  const categories = facets.categories || {};
  const serviceTypes = facets.serviceTypes || {};
  const contentTypes = facets.contentTypes || {};
  const performanceRanges = facets.performanceRanges || {};

  return (
    <div className={`bg-white border border-gray-200 rounded-lg ${className}`}>
      {/* Header */}
      <div className="px-4 py-3 border-b border-gray-200">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <Filter className="h-5 w-5 text-gray-600" />
            <h3 className="text-sm font-medium text-gray-900">Filtros</h3>
          </div>
          
          {hasActiveFilters && (
            <button
              onClick={onClearFilters}
              className="text-xs text-blue-600 hover:text-blue-700 flex items-center space-x-1"
            >
              <X className="h-3 w-3" />
              <span>Limpar</span>
            </button>
          )}
        </div>
      </div>

      <div className="p-4 space-y-4">
        {/* Category Filter */}
        <FilterSection
          title="Categoria"
          count={Object.keys(categories).length}
          expanded={expandedSections.has('category')}
          onToggle={() => toggleSection('category')}
        >
          <div className="space-y-2">
            {Object.entries(categories).map(([category, count]) => (
              <label key={category} className="flex items-center space-x-2">
                <input
                  type="radio"
                  name="category"
                  value={category}
                  checked={filters.category === category}
                  onChange={(e) => onFiltersChange({ 
                    category: e.target.checked ? category : undefined 
                  })}
                  className="h-4 w-4 text-blue-600"
                />
                <span className="text-sm text-gray-700 flex-1">{category}</span>
                <span className="text-xs text-gray-500">({String(count)})</span>
              </label>
            ))}
          </div>
        </FilterSection>

        {/* Service Type Filter */}
        <FilterSection
          title="Tipo de Serviço"
          count={Object.keys(serviceTypes).length}
          expanded={expandedSections.has('serviceType')}
          onToggle={() => toggleSection('serviceType')}
        >
          <div className="space-y-2">
            {Object.entries(serviceTypes).map(([serviceType, count]) => (
              <label key={serviceType} className="flex items-center space-x-2">
                <input
                  type="radio"
                  name="serviceType"
                  value={serviceType}
                  checked={filters.serviceType === serviceType}
                  onChange={(e) => onFiltersChange({ 
                    serviceType: e.target.checked ? serviceType : undefined 
                  })}
                  className="h-4 w-4 text-blue-600"
                />
                <span className="text-sm text-gray-700 flex-1">{serviceType}</span>
                <span className="text-xs text-gray-500">({String(count)})</span>
              </label>
            ))}
          </div>
        </FilterSection>

        {/* Performance Range */}
        <FilterSection
          title="Performance"
          expanded={expandedSections.has('performance')}
          onToggle={() => toggleSection('performance')}
          icon={<TrendingUp className="h-4 w-4" />}
        >
          <div className="space-y-3">
            <div>
              <label className="text-xs text-gray-600">Engajamento mínimo</label>
              <input
                type="range"
                min="0"
                max="1"
                step="0.01"
                value={filters.performanceMin || 0}
                onChange={(e) => onFiltersChange({ 
                  performanceMin: parseFloat(e.target.value) 
                })}
                className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer"
              />
              <div className="flex justify-between text-xs text-gray-500">
                <span>0%</span>
                <span>{((filters.performanceMin || 0) * 100).toFixed(0)}%</span>
                <span>100%</span>
              </div>
            </div>
          </div>
        </FilterSection>

        {/* Content Types */}
        <FilterSection
          title="Tipos de Conteúdo"
          count={Object.keys(contentTypes).length}
          expanded={expandedSections.has('contentTypes')}
          onToggle={() => toggleSection('contentTypes')}
          icon={<Tag className="h-4 w-4" />}
        >
          <div className="space-y-2">
            {Object.entries(contentTypes).map(([contentType, count]) => (
              <label key={contentType} className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  value={contentType}
                  checked={filters.contentTypes?.includes(contentType) || false}
                  onChange={(e) => {
                    const current = filters.contentTypes || [];
                    const updated = e.target.checked
                      ? [...current, contentType]
                      : current.filter(t => t !== contentType);
                    onFiltersChange({ contentTypes: updated });
                  }}
                  className="h-4 w-4 text-blue-600"
                />
                <span className="text-sm text-gray-700 flex-1">{contentType}</span>
                <span className="text-xs text-gray-500">({String(count)})</span>
              </label>
            ))}
          </div>
        </FilterSection>

        {/* Premium Toggle */}
        <div className="flex items-center justify-between py-2">
          <div className="flex items-center space-x-2">
            <Star className="h-4 w-4 text-yellow-500" />
            <span className="text-sm text-gray-700">Templates Premium</span>
          </div>
          
          <label className="relative inline-flex items-center cursor-pointer">
            <input
              type="checkbox"
              checked={filters.isPremium || false}
              onChange={(e) => onFiltersChange({ isPremium: e.target.checked })}
              className="sr-only"
            />
            <div className="w-11 h-6 bg-gray-200 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
          </label>
        </div>

        {/* Sort Options */}
        <div className="pt-4 border-t border-gray-100">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Ordenar por
          </label>
          <select
            value={filters.sortBy || 'relevance'}
            onChange={(e) => onFiltersChange({ 
              sortBy: e.target.value as any 
            })}
            className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm"
          >
            <option value="relevance">Relevância</option>
            <option value="performance">Performance</option>
            <option value="usage">Mais Usado</option>
            <option value="date">Mais Recente</option>
            <option value="name">Nome A-Z</option>
          </select>
        </div>
      </div>
    </div>
  );
}

interface FilterSectionProps {
  title: string;
  count?: number;
  expanded: boolean;
  onToggle: () => void;
  icon?: React.ReactNode;
  children: React.ReactNode;
}

function FilterSection({
  title,
  count,
  expanded,
  onToggle,
  icon,
  children
}: FilterSectionProps) {
  return (
    <div className="border-b border-gray-100 pb-4 last:border-b-0">
      <button
        onClick={onToggle}
        className="w-full flex items-center justify-between py-2 text-left"
      >
        <div className="flex items-center space-x-2">
          {icon}
          <span className="text-sm font-medium text-gray-900">{title}</span>
          {count !== undefined && (
            <span className="text-xs text-gray-500">({count})</span>
          )}
        </div>
        <ChevronDown 
          className={`h-4 w-4 text-gray-500 transition-transform ${
            expanded ? 'rotate-180' : ''
          }`} 
        />
      </button>
      
      {expanded && (
        <div className="mt-2">
          {children}
        </div>
      )}
    </div>
  );
}

export default FilterPanel;