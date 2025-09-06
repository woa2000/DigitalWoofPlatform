/**
 * Modal de exportação de dados de performance
 * 
 * Permite exportar dados em diferentes formatos com opções de customização
 */

import React, { useState } from 'react';
import { Download, FileText, Table, BarChart3, Calendar, Settings } from 'lucide-react';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { Checkbox } from './ui/checkbox';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Badge } from './ui/badge';
import { Textarea } from './ui/textarea';
import { Tabs, TabsContent, TabsList, TabsTrigger } from './ui/tabs';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from './ui/dialog';

interface ExportOptions {
  format: 'pdf' | 'excel' | 'csv';
  dateRange: {
    start: string;
    end: string;
  };
  includeCharts: boolean;
  includeSummary: boolean;
  includeRecommendations: boolean;
  selectedMetrics: string[];
  selectedCampaigns: string[];
  selectedTemplates: string[];
  customTitle?: string;
  customDescription?: string;
}

interface ExportModalProps {
  isOpen: boolean;
  onClose: () => void;
  onExport: (options: ExportOptions) => Promise<void>;
  availableOptions?: {
    campaigns?: Array<{ id: string; name: string }>;
    templates?: Array<{ id: string; name: string }>;
    metrics?: Array<{ id: string; name: string }>;
  };
  loading?: boolean;
}

export function ExportModal({
  isOpen,
  onClose,
  onExport,
  availableOptions = {},
  loading = false
}: ExportModalProps) {
  const [exportOptions, setExportOptions] = useState<ExportOptions>({
    format: 'pdf',
    dateRange: {
      start: '',
      end: ''
    },
    includeCharts: true,
    includeSummary: true,
    includeRecommendations: true,
    selectedMetrics: [],
    selectedCampaigns: [],
    selectedTemplates: []
  });

  // Update export option
  const updateOption = (key: keyof ExportOptions, value: any) => {
    setExportOptions(prev => ({
      ...prev,
      [key]: value
    }));
  };

  // Toggle array option
  const toggleArrayOption = (key: keyof ExportOptions, value: string) => {
    const currentValues = (exportOptions[key] as string[]) || [];
    const newValues = currentValues.includes(value)
      ? currentValues.filter(v => v !== value)
      : [...currentValues, value];
    
    updateOption(key, newValues);
  };

  // Handle export
  const handleExport = async () => {
    try {
      await onExport(exportOptions);
      onClose();
    } catch (error) {
      console.error('Export failed:', error);
    }
  };

  // Get format icon
  const getFormatIcon = (format: string) => {
    switch (format) {
      case 'pdf':
        return <FileText className="w-4 h-4" />;
      case 'excel':
        return <Table className="w-4 h-4" />;
      case 'csv':
        return <BarChart3 className="w-4 h-4" />;
      default:
        return <Download className="w-4 h-4" />;
    }
  };

  // Get format description
  const getFormatDescription = (format: string) => {
    switch (format) {
      case 'pdf':
        return 'Relatório completo com gráficos e análises';
      case 'excel':
        return 'Planilha com dados tabulados e fórmulas';
      case 'csv':
        return 'Dados brutos para análise personalizada';
      default:
        return '';
    }
  };

  const defaultMetrics = [
    { id: 'impressions', name: 'Impressões' },
    { id: 'clicks', name: 'Cliques' },
    { id: 'conversions', name: 'Conversões' },
    { id: 'ctr', name: 'CTR' },
    { id: 'conversionRate', name: 'Taxa de Conversão' },
    { id: 'roi', name: 'ROI' },
    { id: 'cost', name: 'Custo' },
    { id: 'revenue', name: 'Receita' },
    { id: 'engagementRate', name: 'Taxa de Engajamento' }
  ];

  const metrics = availableOptions.metrics || defaultMetrics;

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Download className="w-5 h-5" />
            Exportar Dados de Performance
          </DialogTitle>
          <DialogDescription>
            Configure as opções de exportação para gerar seu relatório personalizado
          </DialogDescription>
        </DialogHeader>

        <Tabs defaultValue="format" className="w-full">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="format">Formato</TabsTrigger>
            <TabsTrigger value="data">Dados</TabsTrigger>
            <TabsTrigger value="options">Opções</TabsTrigger>
            <TabsTrigger value="preview">Prévia</TabsTrigger>
          </TabsList>

          {/* Format Selection */}
          <TabsContent value="format" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Formato do Arquivo</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  {(['pdf', 'excel', 'csv'] as const).map((format) => (
                    <Card 
                      key={format}
                      className={`cursor-pointer transition-all ${
                        exportOptions.format === format 
                          ? 'ring-2 ring-primary border-primary' 
                          : 'hover:border-primary/50'
                      }`}
                      onClick={() => updateOption('format', format)}
                    >
                      <CardContent className="pt-6 text-center">
                        <div className="flex flex-col items-center gap-3">
                          {getFormatIcon(format)}
                          <div>
                            <div className="font-medium uppercase">{format}</div>
                            <div className="text-sm text-muted-foreground mt-1">
                              {getFormatDescription(format)}
                            </div>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>

                {/* Custom Title and Description */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>Título do Relatório</Label>
                    <Input
                      placeholder="Ex: Relatório de Performance - Q1 2024"
                      value={exportOptions.customTitle || ''}
                      onChange={(e) => updateOption('customTitle', e.target.value)}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Descrição</Label>
                    <Textarea
                      placeholder="Descrição opcional do relatório..."
                      value={exportOptions.customDescription || ''}
                      onChange={(e) => updateOption('customDescription', e.target.value)}
                      rows={3}
                    />
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Data Selection */}
          <TabsContent value="data" className="space-y-4">
            {/* Date Range */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Calendar className="w-4 h-4" />
                  Período dos Dados
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>Data Inicial</Label>
                    <Input
                      type="date"
                      value={exportOptions.dateRange.start}
                      onChange={(e) => updateOption('dateRange', {
                        ...exportOptions.dateRange,
                        start: e.target.value
                      })}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Data Final</Label>
                    <Input
                      type="date"
                      value={exportOptions.dateRange.end}
                      onChange={(e) => updateOption('dateRange', {
                        ...exportOptions.dateRange,
                        end: e.target.value
                      })}
                    />
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Metrics Selection */}
            <Card>
              <CardHeader>
                <CardTitle>Métricas a Incluir</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                  {metrics.map((metric) => (
                    <div key={metric.id} className="flex items-center space-x-2">
                      <Checkbox
                        id={`metric-${metric.id}`}
                        checked={exportOptions.selectedMetrics.includes(metric.id)}
                        onCheckedChange={() => toggleArrayOption('selectedMetrics', metric.id)}
                      />
                      <Label
                        htmlFor={`metric-${metric.id}`}
                        className="text-sm font-normal"
                      >
                        {metric.name}
                      </Label>
                    </div>
                  ))}
                </div>
                <div className="flex gap-2 mt-4">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => updateOption('selectedMetrics', metrics.map(m => m.id))}
                  >
                    Selecionar Todos
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => updateOption('selectedMetrics', [])}
                  >
                    Limpar Seleção
                  </Button>
                </div>
              </CardContent>
            </Card>

            {/* Campaigns Selection */}
            {availableOptions.campaigns && (
              <Card>
                <CardHeader>
                  <CardTitle>Campanhas</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2 max-h-48 overflow-y-auto">
                    {availableOptions.campaigns.map((campaign) => (
                      <div key={campaign.id} className="flex items-center space-x-2">
                        <Checkbox
                          id={`campaign-${campaign.id}`}
                          checked={exportOptions.selectedCampaigns.includes(campaign.id)}
                          onCheckedChange={() => toggleArrayOption('selectedCampaigns', campaign.id)}
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
                  <div className="flex gap-2 mt-4">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => updateOption('selectedCampaigns', availableOptions.campaigns!.map(c => c.id))}
                    >
                      Selecionar Todas
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => updateOption('selectedCampaigns', [])}
                    >
                      Limpar Seleção
                    </Button>
                  </div>
                </CardContent>
              </Card>
            )}
          </TabsContent>

          {/* Export Options */}
          <TabsContent value="options" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Settings className="w-4 h-4" />
                  Opções de Conteúdo
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-3">
                  <div className="flex items-center space-x-2">
                    <Checkbox
                      id="includeCharts"
                      checked={exportOptions.includeCharts}
                      onCheckedChange={(checked) => updateOption('includeCharts', checked)}
                    />
                    <Label htmlFor="includeCharts">
                      Incluir gráficos e visualizações
                    </Label>
                  </div>

                  <div className="flex items-center space-x-2">
                    <Checkbox
                      id="includeSummary"
                      checked={exportOptions.includeSummary}
                      onCheckedChange={(checked) => updateOption('includeSummary', checked)}
                    />
                    <Label htmlFor="includeSummary">
                      Incluir resumo executivo
                    </Label>
                  </div>

                  <div className="flex items-center space-x-2">
                    <Checkbox
                      id="includeRecommendations"
                      checked={exportOptions.includeRecommendations}
                      onCheckedChange={(checked) => updateOption('includeRecommendations', checked)}
                    />
                    <Label htmlFor="includeRecommendations">
                      Incluir recomendações e insights
                    </Label>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Preview */}
          <TabsContent value="preview" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Prévia do Relatório</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <div className="text-sm font-medium">Formato:</div>
                  <Badge variant="outline" className="gap-2">
                    {getFormatIcon(exportOptions.format)}
                    {exportOptions.format.toUpperCase()}
                  </Badge>
                </div>

                {exportOptions.customTitle && (
                  <div className="space-y-2">
                    <div className="text-sm font-medium">Título:</div>
                    <div className="text-sm">{exportOptions.customTitle}</div>
                  </div>
                )}

                {exportOptions.dateRange.start && (
                  <div className="space-y-2">
                    <div className="text-sm font-medium">Período:</div>
                    <div className="text-sm">
                      {new Date(exportOptions.dateRange.start).toLocaleDateString('pt-BR')}
                      {exportOptions.dateRange.end && 
                        ` até ${new Date(exportOptions.dateRange.end).toLocaleDateString('pt-BR')}`
                      }
                    </div>
                  </div>
                )}

                <div className="space-y-2">
                  <div className="text-sm font-medium">Métricas incluídas:</div>
                  <div className="flex flex-wrap gap-1">
                    {exportOptions.selectedMetrics.length > 0 ? (
                      exportOptions.selectedMetrics.map(metricId => {
                        const metric = metrics.find(m => m.id === metricId);
                        return (
                          <Badge key={metricId} variant="secondary">
                            {metric?.name || metricId}
                          </Badge>
                        );
                      })
                    ) : (
                      <span className="text-sm text-muted-foreground">Todas as métricas</span>
                    )}
                  </div>
                </div>

                <div className="space-y-2">
                  <div className="text-sm font-medium">Conteúdo adicional:</div>
                  <div className="space-y-1">
                    {exportOptions.includeCharts && (
                      <div className="text-sm text-muted-foreground">✓ Gráficos e visualizações</div>
                    )}
                    {exportOptions.includeSummary && (
                      <div className="text-sm text-muted-foreground">✓ Resumo executivo</div>
                    )}
                    {exportOptions.includeRecommendations && (
                      <div className="text-sm text-muted-foreground">✓ Recomendações e insights</div>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>

        <DialogFooter>
          <Button variant="outline" onClick={onClose}>
            Cancelar
          </Button>
          <Button onClick={handleExport} disabled={loading}>
            {loading ? (
              <>
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-primary mr-2" />
                Exportando...
              </>
            ) : (
              <>
                <Download className="w-4 h-4 mr-2" />
                Exportar
              </>
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}