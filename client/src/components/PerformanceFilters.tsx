/**
 * Componente de filtros para performance dashboard
 * 
 * Filtros avançados para segmentar dados de performance
 */

import React, { useState } from 'react';
import { Filter, X, Calendar, Tag, Target, TrendingUp } from 'lucide-react';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { Checkbox } from './ui/checkbox';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Badge } from './ui/badge';
import { Popover, PopoverContent, PopoverTrigger } from './ui/popover';

interface PerformanceFilters {
  dateRange: {
    start: string;
    end: string;
  };
  campaigns?: string[];
  templates?: string[];
  channels?: string[];
  status?: string[];
  metrics?: string[];
  minROI?: number;
  maxSpend?: number;
  audienceSegments?: string[];
}

interface PerformanceFiltersProps {
  filters: PerformanceFilters;
  onFiltersChange: (filters: PerformanceFilters) => void;
  availableOptions?: {
    campaigns?: Array<{ id: string; name: string }>;
    templates?: Array<{ id: string; name: string }>;
    channels?: string[];
    audienceSegments?: string[];
  };
}

export function PerformanceFilters({
  filters,
  onFiltersChange,
  availableOptions = {}
}: PerformanceFiltersProps) {
  const [isOpen, setIsOpen] = useState(false);

  // Update specific filter
  const updateFilter = (key: keyof PerformanceFilters, value: any) => {
    onFiltersChange({
      ...filters,
      [key]: value
    });
  };

  // Toggle array filter value
  const toggleArrayFilter = (key: keyof PerformanceFilters, value: string) => {
    const currentValues = (filters[key] as string[]) || [];
    const newValues = currentValues.includes(value)
      ? currentValues.filter(v => v !== value)
      : [...currentValues, value];
    
    updateFilter(key, newValues);
  };

  // Clear all filters
  const clearFilters = () => {
    onFiltersChange({
      dateRange: {
        start: '',
        end: ''
      }
    });
  };

  // Count active filters
  const activeFiltersCount = Object.entries(filters).reduce((count, [key, value]) => {
    if (key === 'dateRange') {
      return count + (value.start || value.end ? 1 : 0);
    }
    if (Array.isArray(value)) {
      return count + (value.length > 0 ? 1 : 0);
    }
    if (value !== undefined && value !== null && value !== '') {
      return count + 1;
    }
    return count;
  }, 0);

  const statusOptions = [
    { value: 'active', label: 'Ativa' },
    { value: 'paused', label: 'Pausada' },
    { value: 'completed', label: 'Finalizada' },
    { value: 'draft', label: 'Rascunho' }
  ];

  const metricOptions = [
    { value: 'impressions', label: 'Impressões' },
    { value: 'clicks', label: 'Cliques' },
    { value: 'conversions', label: 'Conversões' },
    { value: 'ctr', label: 'CTR' },
    { value: 'conversionRate', label: 'Taxa de Conversão' },
    { value: 'roi', label: 'ROI' },
    { value: 'engagementRate', label: 'Taxa de Engajamento' }
  ];

  return (
    <div className="flex items-center gap-2">
      <Popover open={isOpen} onOpenChange={setIsOpen}>
        <PopoverTrigger asChild>
          <Button variant="outline" size="sm">
            <Filter className="w-4 h-4 mr-2" />
            Filtros
            {activeFiltersCount > 0 && (
              <Badge variant="secondary" className="ml-2">
                {activeFiltersCount}
              </Badge>
            )}
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-96 p-0" align="start">
          <Card className="border-0 shadow-none">
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <CardTitle className="text-base">Filtros de Performance</CardTitle>
                <div className="flex items-center gap-2">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={clearFilters}
                    disabled={activeFiltersCount === 0}
                  >
                    Limpar
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setIsOpen(false)}
                  >
                    <X className="w-4 h-4" />
                  </Button>
                </div>
              </div>
            </CardHeader>
            <CardContent className="space-y-4 max-h-96 overflow-y-auto">
              {/* Date Range */}
              <div className="space-y-2">
                <Label className="flex items-center gap-2">
                  <Calendar className="w-4 h-4" />
                  Período
                </Label>
                <div className="grid grid-cols-2 gap-2">
                  <Input
                    type="date"
                    placeholder="Data inicial"
                    value={filters.dateRange.start}
                    onChange={(e) => updateFilter('dateRange', {
                      ...filters.dateRange,
                      start: e.target.value
                    })}
                  />
                  <Input
                    type="date"
                    placeholder="Data final"
                    value={filters.dateRange.end}
                    onChange={(e) => updateFilter('dateRange', {
                      ...filters.dateRange,
                      end: e.target.value
                    })}
                  />
                </div>
              </div>

              {/* Campaign Selection */}
              {availableOptions.campaigns && (
                <div className="space-y-2">
                  <Label className="flex items-center gap-2">
                    <Target className="w-4 h-4" />
                    Campanhas
                  </Label>
                  <div className="space-y-1 max-h-32 overflow-y-auto">
                    {availableOptions.campaigns.map((campaign) => (
                      <div key={campaign.id} className="flex items-center space-x-2">
                        <Checkbox
                          id={`campaign-${campaign.id}`}
                          checked={(filters.campaigns || []).includes(campaign.id)}
                          onCheckedChange={() => toggleArrayFilter('campaigns', campaign.id)}
                        />
                        <Label
                          htmlFor={`campaign-${campaign.id}`}
                          className="text-sm font-normal truncate"
                          title={campaign.name}
                        >
                          {campaign.name}
                        </Label>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Template Selection */}
              {availableOptions.templates && (
                <div className="space-y-2">
                  <Label className="flex items-center gap-2">
                    <Tag className="w-4 h-4" />
                    Templates
                  </Label>
                  <div className="space-y-1 max-h-32 overflow-y-auto">
                    {availableOptions.templates.map((template) => (
                      <div key={template.id} className="flex items-center space-x-2">
                        <Checkbox
                          id={`template-${template.id}`}
                          checked={(filters.templates || []).includes(template.id)}
                          onCheckedChange={() => toggleArrayFilter('templates', template.id)}
                        />
                        <Label
                          htmlFor={`template-${template.id}`}
                          className="text-sm font-normal truncate"
                          title={template.name}
                        >
                          {template.name}
                        </Label>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Channel Selection */}
              {availableOptions.channels && (
                <div className="space-y-2">
                  <Label>Canais</Label>
                  <div className="space-y-1">
                    {availableOptions.channels.map((channel) => (
                      <div key={channel} className="flex items-center space-x-2">
                        <Checkbox
                          id={`channel-${channel}`}
                          checked={(filters.channels || []).includes(channel)}
                          onCheckedChange={() => toggleArrayFilter('channels', channel)}
                        />
                        <Label
                          htmlFor={`channel-${channel}`}
                          className="text-sm font-normal capitalize"
                        >
                          {channel}
                        </Label>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Status Filter */}
              <div className="space-y-2">
                <Label>Status da Campanha</Label>
                <div className="space-y-1">
                  {statusOptions.map((status) => (
                    <div key={status.value} className="flex items-center space-x-2">
                      <Checkbox
                        id={`status-${status.value}`}
                        checked={(filters.status || []).includes(status.value)}
                        onCheckedChange={() => toggleArrayFilter('status', status.value)}
                      />
                      <Label
                        htmlFor={`status-${status.value}`}
                        className="text-sm font-normal"
                      >
                        {status.label}
                      </Label>
                    </div>
                  ))}
                </div>
              </div>

              {/* Metrics Filter */}
              <div className="space-y-2">
                <Label className="flex items-center gap-2">
                  <TrendingUp className="w-4 h-4" />
                  Métricas
                </Label>
                <div className="space-y-1 max-h-32 overflow-y-auto">
                  {metricOptions.map((metric) => (
                    <div key={metric.value} className="flex items-center space-x-2">
                      <Checkbox
                        id={`metric-${metric.value}`}
                        checked={(filters.metrics || []).includes(metric.value)}
                        onCheckedChange={() => toggleArrayFilter('metrics', metric.value)}
                      />
                      <Label
                        htmlFor={`metric-${metric.value}`}
                        className="text-sm font-normal"
                      >
                        {metric.label}
                      </Label>
                    </div>
                  ))}
                </div>
              </div>

              {/* ROI Filter */}
              <div className="space-y-2">
                <Label>ROI Mínimo (%)</Label>
                <Input
                  type="number"
                  placeholder="Ex: 20"
                  value={filters.minROI || ''}
                  onChange={(e) => updateFilter('minROI', 
                    e.target.value ? parseFloat(e.target.value) : undefined
                  )}
                />
              </div>

              {/* Spend Filter */}
              <div className="space-y-2">
                <Label>Investimento Máximo (R$)</Label>
                <Input
                  type="number"
                  placeholder="Ex: 5000"
                  value={filters.maxSpend || ''}
                  onChange={(e) => updateFilter('maxSpend', 
                    e.target.value ? parseFloat(e.target.value) : undefined
                  )}
                />
              </div>

              {/* Audience Segments */}
              {availableOptions.audienceSegments && (
                <div className="space-y-2">
                  <Label>Segmentos de Audiência</Label>
                  <div className="space-y-1 max-h-32 overflow-y-auto">
                    {availableOptions.audienceSegments.map((segment) => (
                      <div key={segment} className="flex items-center space-x-2">
                        <Checkbox
                          id={`segment-${segment}`}
                          checked={(filters.audienceSegments || []).includes(segment)}
                          onCheckedChange={() => toggleArrayFilter('audienceSegments', segment)}
                        />
                        <Label
                          htmlFor={`segment-${segment}`}
                          className="text-sm font-normal"
                        >
                          {segment}
                        </Label>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </PopoverContent>
      </Popover>

      {/* Active Filters Display */}
      {activeFiltersCount > 0 && (
        <div className="flex items-center gap-1 flex-wrap">
          {filters.dateRange.start && (
            <Badge variant="secondary" className="gap-1">
              Data: {new Date(filters.dateRange.start).toLocaleDateString('pt-BR')}
              {filters.dateRange.end && ` - ${new Date(filters.dateRange.end).toLocaleDateString('pt-BR')}`}
              <X 
                className="w-3 h-3 cursor-pointer" 
                onClick={() => updateFilter('dateRange', { start: '', end: '' })}
              />
            </Badge>
          )}
          
          {(filters.campaigns || []).length > 0 && (
            <Badge variant="secondary" className="gap-1">
              {filters.campaigns!.length} campanha{filters.campaigns!.length !== 1 ? 's' : ''}
              <X 
                className="w-3 h-3 cursor-pointer" 
                onClick={() => updateFilter('campaigns', [])}
              />
            </Badge>
          )}

          {(filters.templates || []).length > 0 && (
            <Badge variant="secondary" className="gap-1">
              {filters.templates!.length} template{filters.templates!.length !== 1 ? 's' : ''}
              <X 
                className="w-3 h-3 cursor-pointer" 
                onClick={() => updateFilter('templates', [])}
              />
            </Badge>
          )}

          {(filters.channels || []).length > 0 && (
            <Badge variant="secondary" className="gap-1">
              {filters.channels!.length} canal{filters.channels!.length !== 1 ? 'is' : ''}
              <X 
                className="w-3 h-3 cursor-pointer" 
                onClick={() => updateFilter('channels', [])}
              />
            </Badge>
          )}

          {(filters.status || []).length > 0 && (
            <Badge variant="secondary" className="gap-1">
              Status: {filters.status!.join(', ')}
              <X 
                className="w-3 h-3 cursor-pointer" 
                onClick={() => updateFilter('status', [])}
              />
            </Badge>
          )}

          {filters.minROI && (
            <Badge variant="secondary" className="gap-1">
              ROI ≥ {filters.minROI}%
              <X 
                className="w-3 h-3 cursor-pointer" 
                onClick={() => updateFilter('minROI', undefined)}
              />
            </Badge>
          )}

          {filters.maxSpend && (
            <Badge variant="secondary" className="gap-1">
              Gasto ≤ R$ {filters.maxSpend.toLocaleString('pt-BR')}
              <X 
                className="w-3 h-3 cursor-pointer" 
                onClick={() => updateFilter('maxSpend', undefined)}
              />
            </Badge>
          )}
        </div>
      )}
    </div>
  );
}