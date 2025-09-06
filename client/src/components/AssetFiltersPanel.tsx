/**
 * Painel de filtros avançados para biblioteca de assets
 * 
 * Filtros por tipo, categoria, formato, tags, cores, dimensões
 * e tamanho de arquivo com facetas e contadores
 */

import React from 'react';
import { X, ChevronDown, ChevronUp } from 'lucide-react';
import { AssetFilters } from '../hooks/useAssets';
import { Button } from './ui/button';
import { Badge } from './ui/badge';
import { Checkbox } from './ui/checkbox';
import { Slider } from './ui/slider';
import { Label } from './ui/label';
import { Input } from './ui/input';
import { Separator } from './ui/separator';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from './ui/collapsible';

interface Facet {
  value: string;
  count: number;
}

interface Facets {
  types: Facet[];
  categories: Facet[];
  formats: Facet[];
  tags: Facet[];
  colors: Facet[];
}

interface AssetFiltersPanelProps {
  facets: Facets;
  filters: AssetFilters;
  onFiltersChange: (filters: Partial<AssetFilters>) => void;
}

export function AssetFiltersPanel({
  facets,
  filters,
  onFiltersChange
}: AssetFiltersPanelProps) {
  // Toggle filter value
  const toggleArrayFilter = (key: keyof AssetFilters, value: string) => {
    const currentValues = (filters[key] as string[]) || [];
    const newValues = currentValues.includes(value)
      ? currentValues.filter(v => v !== value)
      : [...currentValues, value];
    
    onFiltersChange({ [key]: newValues.length > 0 ? newValues : undefined });
  };

  // Set range filter
  const setRangeFilter = (key: string, values: number[]) => {
    const [min, max] = values;
    if (key === 'width') {
      onFiltersChange({
        minWidth: min > 0 ? min : undefined,
        maxWidth: max < 5000 ? max : undefined
      });
    } else if (key === 'height') {
      onFiltersChange({
        minHeight: min > 0 ? min : undefined,
        maxHeight: max < 5000 ? max : undefined
      });
    } else if (key === 'fileSize') {
      onFiltersChange({
        maxFileSize: max < 100 ? max : undefined
      });
    }
  };

  // Clear all filters
  const clearFilters = () => {
    onFiltersChange({
      type: undefined,
      category: undefined,
      format: undefined,
      tags: undefined,
      colors: undefined,
      isPremium: undefined,
      minWidth: undefined,
      maxWidth: undefined,
      minHeight: undefined,
      maxHeight: undefined,
      maxFileSize: undefined
    });
  };

  // Get active filter count
  const getActiveFilterCount = () => {
    let count = 0;
    if (filters.type?.length) count += filters.type.length;
    if (filters.category?.length) count += filters.category.length;
    if (filters.format?.length) count += filters.format.length;
    if (filters.tags?.length) count += filters.tags.length;
    if (filters.colors?.length) count += filters.colors.length;
    if (filters.isPremium !== undefined) count += 1;
    if (filters.minWidth || filters.maxWidth) count += 1;
    if (filters.minHeight || filters.maxHeight) count += 1;
    if (filters.maxFileSize) count += 1;
    return count;
  };

  const activeFilterCount = getActiveFilterCount();

  return (
    <div className="space-y-6 p-4 bg-muted/30 rounded-lg">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <h3 className="font-medium">Filtros</h3>
          {activeFilterCount > 0 && (
            <Badge variant="secondary">
              {activeFilterCount}
            </Badge>
          )}
        </div>
        
        {activeFilterCount > 0 && (
          <Button
            variant="ghost"
            size="sm"
            onClick={clearFilters}
            className="text-muted-foreground hover:text-foreground"
          >
            Limpar
          </Button>
        )}
      </div>

      {/* Type Filters */}
      <Collapsible defaultOpen>
        <CollapsibleTrigger className="flex items-center justify-between w-full py-2 text-sm font-medium">
          Tipo de Asset
          <ChevronDown className="h-4 w-4" />
        </CollapsibleTrigger>
        <CollapsibleContent className="space-y-2 pt-2">
          {facets.types.map((facet) => (
            <div key={facet.value} className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <Checkbox
                  id={`type-${facet.value}`}
                  checked={filters.type?.includes(facet.value) || false}
                  onCheckedChange={() => toggleArrayFilter('type', facet.value)}
                />
                <Label
                  htmlFor={`type-${facet.value}`}
                  className="text-sm capitalize cursor-pointer"
                >
                  {facet.value}
                </Label>
              </div>
              <Badge variant="outline" className="text-xs">
                {facet.count}
              </Badge>
            </div>
          ))}
        </CollapsibleContent>
      </Collapsible>

      <Separator />

      {/* Category Filters */}
      <Collapsible defaultOpen>
        <CollapsibleTrigger className="flex items-center justify-between w-full py-2 text-sm font-medium">
          Categoria
          <ChevronDown className="h-4 w-4" />
        </CollapsibleTrigger>
        <CollapsibleContent className="space-y-2 pt-2">
          {facets.categories.map((facet) => (
            <div key={facet.value} className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <Checkbox
                  id={`category-${facet.value}`}
                  checked={filters.category?.includes(facet.value) || false}
                  onCheckedChange={() => toggleArrayFilter('category', facet.value)}
                />
                <Label
                  htmlFor={`category-${facet.value}`}
                  className="text-sm capitalize cursor-pointer"
                >
                  {facet.value}
                </Label>
              </div>
              <Badge variant="outline" className="text-xs">
                {facet.count}
              </Badge>
            </div>
          ))}
        </CollapsibleContent>
      </Collapsible>

      <Separator />

      {/* Format Filters */}
      <Collapsible>
        <CollapsibleTrigger className="flex items-center justify-between w-full py-2 text-sm font-medium">
          Formato
          <ChevronDown className="h-4 w-4" />
        </CollapsibleTrigger>
        <CollapsibleContent className="space-y-2 pt-2">
          {facets.formats.map((facet) => (
            <div key={facet.value} className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <Checkbox
                  id={`format-${facet.value}`}
                  checked={filters.format?.includes(facet.value) || false}
                  onCheckedChange={() => toggleArrayFilter('format', facet.value)}
                />
                <Label
                  htmlFor={`format-${facet.value}`}
                  className="text-sm uppercase cursor-pointer"
                >
                  {facet.value}
                </Label>
              </div>
              <Badge variant="outline" className="text-xs">
                {facet.count}
              </Badge>
            </div>
          ))}
        </CollapsibleContent>
      </Collapsible>

      <Separator />

      {/* Premium Filter */}
      <div className="space-y-2">
        <Label className="text-sm font-medium">Acesso</Label>
        <div className="space-y-2">
          <div className="flex items-center space-x-2">
            <Checkbox
              id="premium-only"
              checked={filters.isPremium === true}
              onCheckedChange={(checked) => 
                onFiltersChange({ isPremium: checked ? true : undefined })
              }
            />
            <Label htmlFor="premium-only" className="text-sm cursor-pointer">
              Apenas Premium
            </Label>
          </div>
          <div className="flex items-center space-x-2">
            <Checkbox
              id="free-only"
              checked={filters.isPremium === false}
              onCheckedChange={(checked) => 
                onFiltersChange({ isPremium: checked ? false : undefined })
              }
            />
            <Label htmlFor="free-only" className="text-sm cursor-pointer">
              Apenas Gratuitos
            </Label>
          </div>
        </div>
      </div>

      <Separator />

      {/* Dimensions */}
      <Collapsible>
        <CollapsibleTrigger className="flex items-center justify-between w-full py-2 text-sm font-medium">
          Dimensões
          <ChevronDown className="h-4 w-4" />
        </CollapsibleTrigger>
        <CollapsibleContent className="space-y-4 pt-2">
          {/* Width */}
          <div className="space-y-2">
            <Label className="text-sm">Largura (px)</Label>
            <Slider
              value={[filters.minWidth || 0, filters.maxWidth || 5000]}
              onValueChange={(values) => setRangeFilter('width', values)}
              max={5000}
              step={100}
              className="w-full"
            />
            <div className="flex items-center justify-between text-xs text-muted-foreground">
              <span>{filters.minWidth || 0}px</span>
              <span>{filters.maxWidth || 5000}px</span>
            </div>
          </div>

          {/* Height */}
          <div className="space-y-2">
            <Label className="text-sm">Altura (px)</Label>
            <Slider
              value={[filters.minHeight || 0, filters.maxHeight || 5000]}
              onValueChange={(values) => setRangeFilter('height', values)}
              max={5000}
              step={100}
              className="w-full"
            />
            <div className="flex items-center justify-between text-xs text-muted-foreground">
              <span>{filters.minHeight || 0}px</span>
              <span>{filters.maxHeight || 5000}px</span>
            </div>
          </div>
        </CollapsibleContent>
      </Collapsible>

      <Separator />

      {/* File Size */}
      <Collapsible>
        <CollapsibleTrigger className="flex items-center justify-between w-full py-2 text-sm font-medium">
          Tamanho do Arquivo
          <ChevronDown className="h-4 w-4" />
        </CollapsibleTrigger>
        <CollapsibleContent className="space-y-2 pt-2">
          <Label className="text-sm">Máximo (MB)</Label>
          <Slider
            value={[0, filters.maxFileSize || 100]}
            onValueChange={(values) => setRangeFilter('fileSize', values)}
            max={100}
            step={1}
            className="w-full"
          />
          <div className="flex items-center justify-between text-xs text-muted-foreground">
            <span>0 MB</span>
            <span>{filters.maxFileSize || 100} MB</span>
          </div>
        </CollapsibleContent>
      </Collapsible>

      <Separator />

      {/* Tags */}
      <Collapsible>
        <CollapsibleTrigger className="flex items-center justify-between w-full py-2 text-sm font-medium">
          Tags Populares
          <ChevronDown className="h-4 w-4" />
        </CollapsibleTrigger>
        <CollapsibleContent className="space-y-2 pt-2">
          <div className="flex flex-wrap gap-1">
            {facets.tags.slice(0, 15).map((facet) => (
              <Badge
                key={facet.value}
                variant={filters.tags?.includes(facet.value) ? "default" : "outline"}
                className="cursor-pointer text-xs"
                onClick={() => toggleArrayFilter('tags', facet.value)}
              >
                {facet.value} ({facet.count})
              </Badge>
            ))}
          </div>
        </CollapsibleContent>
      </Collapsible>

      <Separator />

      {/* Colors */}
      <Collapsible>
        <CollapsibleTrigger className="flex items-center justify-between w-full py-2 text-sm font-medium">
          Cores Dominantes
          <ChevronDown className="h-4 w-4" />
        </CollapsibleTrigger>
        <CollapsibleContent className="space-y-2 pt-2">
          <div className="grid grid-cols-4 gap-2">
            {facets.colors.slice(0, 12).map((facet) => (
              <div
                key={facet.value}
                className={`aspect-square rounded cursor-pointer border-2 ${
                  filters.colors?.includes(facet.value) 
                    ? 'border-primary' 
                    : 'border-muted'
                }`}
                style={{ backgroundColor: facet.value }}
                onClick={() => toggleArrayFilter('colors', facet.value)}
                title={`${facet.value} (${facet.count} assets)`}
              />
            ))}
          </div>
        </CollapsibleContent>
      </Collapsible>
    </div>
  );
}