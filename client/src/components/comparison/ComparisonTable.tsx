import React, { useState } from 'react';
import { 
  X, 
  BarChart3, 
  TrendingUp, 
  Users, 
  Clock, 
  Star, 
  Download, 
  FileText,
  Zap,
  DollarSign,
  Target,
  Eye,
  Plus
} from 'lucide-react';

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

interface ComparisonTableProps {
  templates: Template[];
  metrics: ComparisonMetrics[];
  loading: boolean;
  onRemoveTemplate: (templateId: string) => void;
  onClearAll: () => void;
  onExport: (format: 'pdf' | 'csv') => void;
}

const ComparisonTable: React.FC<ComparisonTableProps> = ({
  templates,
  metrics,
  loading,
  onRemoveTemplate,
  onClearAll,
  onExport,
}) => {
  const [activeView, setActiveView] = useState<'overview' | 'performance' | 'features' | 'costs'>('overview');

  if (templates.length === 0) {
    return (
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-12 text-center">
        <div className="text-gray-400 mb-4">
          <BarChart3 size={48} className="mx-auto" />
        </div>
        <h3 className="text-lg font-medium text-gray-900 mb-2">
          Nenhum template selecionado
        </h3>
        <p className="text-gray-600 mb-4">
          Selecione ao menos 2 templates para iniciar a comparação
        </p>
        <div className="inline-flex items-center px-4 py-2 bg-blue-50 text-blue-700 rounded-lg">
          <Plus size={16} className="mr-2" />
          Adicione templates para comparar
        </div>
      </div>
    );
  }

  const getMetricsForTemplate = (templateId: string) => {
    return metrics.find(m => m.templateId === templateId);
  };

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case 'easy': return 'bg-green-100 text-green-800';
      case 'medium': return 'bg-yellow-100 text-yellow-800';
      case 'hard': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getPerformanceColor = (score: number) => {
    if (score >= 80) return 'text-green-600';
    if (score >= 60) return 'text-yellow-600';
    return 'text-red-600';
  };

  const renderOverviewView = () => (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
      {templates.map((template) => {
        const templateMetrics = getMetricsForTemplate(template.id);
        return (
          <div key={template.id} className="bg-white border border-gray-200 rounded-lg p-4 relative">
            {/* Remove Button */}
            <button
              onClick={() => onRemoveTemplate(template.id)}
              className="absolute top-2 right-2 p-1 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded"
              title="Remover da comparação"
            >
              <X size={16} />
            </button>

            {/* Template Info */}
            <div className="mb-4">
              <h3 className="font-semibold text-gray-900 mb-1 pr-6">
                {template.name}
              </h3>
              <p className="text-sm text-gray-600 line-clamp-2">
                {template.description}
              </p>
            </div>

            {/* Category & Service */}
            <div className="flex flex-wrap gap-1 mb-3">
              <span className="bg-blue-100 text-blue-800 text-xs px-2 py-1 rounded">
                {template.category}
              </span>
              <span className="bg-purple-100 text-purple-800 text-xs px-2 py-1 rounded">
                {template.serviceType}
              </span>
              {template.isPremium && (
                <span className="bg-yellow-100 text-yellow-800 text-xs px-2 py-1 rounded">
                  Premium
                </span>
              )}
            </div>

            {/* Key Metrics */}
            {templateMetrics && (
              <div className="space-y-2">
                <div className="flex items-center justify-between text-sm">
                  <span className="text-gray-600">Engagement:</span>
                  <span className={`font-medium ${getPerformanceColor(templateMetrics.performance.engagementRate)}`}>
                    {templateMetrics.performance.engagementRate}%
                  </span>
                </div>
                <div className="flex items-center justify-between text-sm">
                  <span className="text-gray-600">Conversão:</span>
                  <span className={`font-medium ${getPerformanceColor(templateMetrics.performance.conversionRate)}`}>
                    {templateMetrics.performance.conversionRate}%
                  </span>
                </div>
                <div className="flex items-center justify-between text-sm">
                  <span className="text-gray-600">Complexidade:</span>
                  <span className={`text-xs px-2 py-1 rounded font-medium ${getDifficultyColor(templateMetrics.complexity.difficulty)}`}>
                    {templateMetrics.complexity.difficulty}
                  </span>
                </div>
              </div>
            )}
          </div>
        );
      })}
    </div>
  );

  const renderPerformanceView = () => (
    <div className="overflow-x-auto">
      <table className="w-full">
        <thead>
          <tr className="border-b border-gray-200">
            <th className="text-left py-3 px-4 font-medium text-gray-900">Template</th>
            <th className="text-center py-3 px-4 font-medium text-gray-900">
              <div className="flex items-center justify-center">
                <TrendingUp size={16} className="mr-1" />
                Engagement
              </div>
            </th>
            <th className="text-center py-3 px-4 font-medium text-gray-900">
              <div className="flex items-center justify-center">
                <Target size={16} className="mr-1" />
                Conversão
              </div>
            </th>
            <th className="text-center py-3 px-4 font-medium text-gray-900">
              <div className="flex items-center justify-center">
                <Users size={16} className="mr-1" />
                Uso
              </div>
            </th>
            <th className="text-center py-3 px-4 font-medium text-gray-900">
              <div className="flex items-center justify-center">
                <Star size={16} className="mr-1" />
                Score
              </div>
            </th>
          </tr>
        </thead>
        <tbody>
          {templates.map((template) => {
            const templateMetrics = getMetricsForTemplate(template.id);
            return (
              <tr key={template.id} className="border-b border-gray-100 hover:bg-gray-50">
                <td className="py-3 px-4">
                  <div>
                    <div className="font-medium text-gray-900">{template.name}</div>
                    <div className="text-sm text-gray-600">{template.category}</div>
                  </div>
                </td>
                <td className="text-center py-3 px-4">
                  {templateMetrics ? (
                    <span className={`font-medium ${getPerformanceColor(templateMetrics.performance.engagementRate)}`}>
                      {templateMetrics.performance.engagementRate}%
                    </span>
                  ) : (
                    <span className="text-gray-400">-</span>
                  )}
                </td>
                <td className="text-center py-3 px-4">
                  {templateMetrics ? (
                    <span className={`font-medium ${getPerformanceColor(templateMetrics.performance.conversionRate)}`}>
                      {templateMetrics.performance.conversionRate}%
                    </span>
                  ) : (
                    <span className="text-gray-400">-</span>
                  )}
                </td>
                <td className="text-center py-3 px-4">
                  {templateMetrics ? (
                    <span className="text-gray-900">
                      {templateMetrics.performance.usageCount.toLocaleString()}
                    </span>
                  ) : (
                    <span className="text-gray-400">-</span>
                  )}
                </td>
                <td className="text-center py-3 px-4">
                  {templateMetrics ? (
                    <span className={`font-medium ${getPerformanceColor(templateMetrics.performance.successScore)}`}>
                      {templateMetrics.performance.successScore}/100
                    </span>
                  ) : (
                    <span className="text-gray-400">-</span>
                  )}
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );

  const renderFeaturesView = () => (
    <div className="overflow-x-auto">
      <table className="w-full">
        <thead>
          <tr className="border-b border-gray-200">
            <th className="text-left py-3 px-4 font-medium text-gray-900">Template</th>
            <th className="text-center py-3 px-4 font-medium text-gray-900">
              <div className="flex items-center justify-center">
                <FileText size={16} className="mr-1" />
                Conteúdo
              </div>
            </th>
            <th className="text-center py-3 px-4 font-medium text-gray-900">
              <div className="flex items-center justify-center">
                <Eye size={16} className="mr-1" />
                Visuais
              </div>
            </th>
            <th className="text-center py-3 px-4 font-medium text-gray-900">
              <div className="flex items-center justify-center">
                <Zap size={16} className="mr-1" />
                Automação
              </div>
            </th>
            <th className="text-center py-3 px-4 font-medium text-gray-900">
              <div className="flex items-center justify-center">
                <Clock size={16} className="mr-1" />
                Setup
              </div>
            </th>
          </tr>
        </thead>
        <tbody>
          {templates.map((template) => {
            const templateMetrics = getMetricsForTemplate(template.id);
            return (
              <tr key={template.id} className="border-b border-gray-100 hover:bg-gray-50">
                <td className="py-3 px-4">
                  <div>
                    <div className="font-medium text-gray-900">{template.name}</div>
                    <div className="text-sm text-gray-600">{template.serviceType}</div>
                  </div>
                </td>
                <td className="text-center py-3 px-4">
                  {templateMetrics ? (
                    <div>
                      <div className="font-medium text-gray-900">
                        {templateMetrics.complexity.contentPieces}
                      </div>
                      <div className="text-xs text-gray-600">
                        {templateMetrics.features.contentTypes.slice(0, 2).join(', ')}
                        {templateMetrics.features.contentTypes.length > 2 && '...'}
                      </div>
                    </div>
                  ) : (
                    <span className="text-gray-400">-</span>
                  )}
                </td>
                <td className="text-center py-3 px-4">
                  {templateMetrics ? (
                    <span className="text-gray-900">
                      {templateMetrics.complexity.visualAssets}
                    </span>
                  ) : (
                    <span className="text-gray-400">-</span>
                  )}
                </td>
                <td className="text-center py-3 px-4">
                  {templateMetrics ? (
                    <div className="flex items-center justify-center">
                      <div className="w-12 bg-gray-200 rounded-full h-2">
                        <div
                          className="bg-blue-600 h-2 rounded-full"
                          style={{ width: `${templateMetrics.features.automationLevel}%` }}
                        ></div>
                      </div>
                      <span className="ml-2 text-sm text-gray-600">
                        {templateMetrics.features.automationLevel}%
                      </span>
                    </div>
                  ) : (
                    <span className="text-gray-400">-</span>
                  )}
                </td>
                <td className="text-center py-3 px-4">
                  {templateMetrics ? (
                    <div>
                      <div className="font-medium text-gray-900">
                        {templateMetrics.complexity.setupTime}
                      </div>
                      <div className={`text-xs px-2 py-1 rounded font-medium ${getDifficultyColor(templateMetrics.complexity.difficulty)}`}>
                        {templateMetrics.complexity.difficulty}
                      </div>
                    </div>
                  ) : (
                    <span className="text-gray-400">-</span>
                  )}
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );

  const renderCostsView = () => (
    <div className="overflow-x-auto">
      <table className="w-full">
        <thead>
          <tr className="border-b border-gray-200">
            <th className="text-left py-3 px-4 font-medium text-gray-900">Template</th>
            <th className="text-center py-3 px-4 font-medium text-gray-900">
              <div className="flex items-center justify-center">
                <Star size={16} className="mr-1" />
                Plano
              </div>
            </th>
            <th className="text-center py-3 px-4 font-medium text-gray-900">
              <div className="flex items-center justify-center">
                <DollarSign size={16} className="mr-1" />
                Setup
              </div>
            </th>
            <th className="text-center py-3 px-4 font-medium text-gray-900">
              <div className="flex items-center justify-center">
                <Clock size={16} className="mr-1" />
                Manutenção
              </div>
            </th>
            <th className="text-center py-3 px-4 font-medium text-gray-900">ROI Estimado</th>
          </tr>
        </thead>
        <tbody>
          {templates.map((template) => {
            const templateMetrics = getMetricsForTemplate(template.id);
            return (
              <tr key={template.id} className="border-b border-gray-100 hover:bg-gray-50">
                <td className="py-3 px-4">
                  <div>
                    <div className="font-medium text-gray-900">{template.name}</div>
                    <div className="text-sm text-gray-600">{template.category}</div>
                  </div>
                </td>
                <td className="text-center py-3 px-4">
                  <span className={`px-2 py-1 text-xs rounded font-medium ${
                    template.isPremium 
                      ? 'bg-yellow-100 text-yellow-800' 
                      : 'bg-green-100 text-green-800'
                  }`}>
                    {template.isPremium ? 'Premium' : 'Gratuito'}
                  </span>
                </td>
                <td className="text-center py-3 px-4">
                  {templateMetrics ? (
                    <span className="text-gray-900">
                      R$ {templateMetrics.costs.estimatedSetupCost.toLocaleString()}
                    </span>
                  ) : (
                    <span className="text-gray-400">-</span>
                  )}
                </td>
                <td className="text-center py-3 px-4">
                  {templateMetrics ? (
                    <span className="text-gray-900">
                      R$ {templateMetrics.costs.maintenanceCost.toLocaleString()}/mês
                    </span>
                  ) : (
                    <span className="text-gray-400">-</span>
                  )}
                </td>
                <td className="text-center py-3 px-4">
                  {templateMetrics ? (
                    <span className="text-green-600 font-medium">
                      {Math.round(templateMetrics.performance.conversionRate * 3.2)}%
                    </span>
                  ) : (
                    <span className="text-gray-400">-</span>
                  )}
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );

  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200">
      {/* Header */}
      <div className="p-6 border-b border-gray-200">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-xl font-semibold text-gray-900">
              Comparação de Templates
            </h2>
            <p className="text-sm text-gray-600 mt-1">
              {templates.length} template{templates.length !== 1 ? 's' : ''} selecionado{templates.length !== 1 ? 's' : ''}
            </p>
          </div>
          
          <div className="flex items-center space-x-3">
            <button
              onClick={() => onExport('csv')}
              className="inline-flex items-center px-3 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 bg-white hover:bg-gray-50"
              disabled={loading}
            >
              <Download size={16} className="mr-2" />
              CSV
            </button>
            <button
              onClick={() => onExport('pdf')}
              className="inline-flex items-center px-3 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 bg-white hover:bg-gray-50"
              disabled={loading}
            >
              <FileText size={16} className="mr-2" />
              PDF
            </button>
            <button
              onClick={onClearAll}
              className="inline-flex items-center px-3 py-2 bg-red-600 text-white rounded-md text-sm font-medium hover:bg-red-700"
            >
              <X size={16} className="mr-2" />
              Limpar Tudo
            </button>
          </div>
        </div>

        {/* View Tabs */}
        <div className="flex space-x-1 mt-4 bg-gray-100 rounded-lg p-1">
          {[
            { key: 'overview', label: 'Visão Geral', icon: Eye },
            { key: 'performance', label: 'Performance', icon: BarChart3 },
            { key: 'features', label: 'Recursos', icon: Zap },
            { key: 'costs', label: 'Custos', icon: DollarSign },
          ].map(({ key, label, icon: Icon }) => (
            <button
              key={key}
              onClick={() => setActiveView(key as any)}
              className={`flex items-center px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                activeView === key
                  ? 'bg-white text-blue-600 shadow-sm'
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              <Icon size={16} className="mr-2" />
              {label}
            </button>
          ))}
        </div>
      </div>

      {/* Content */}
      <div className="p-6">
        {loading && (
          <div className="flex items-center justify-center py-8">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
            <span className="ml-2 text-gray-600">Carregando dados de comparação...</span>
          </div>
        )}

        {!loading && (
          <>
            {activeView === 'overview' && renderOverviewView()}
            {activeView === 'performance' && renderPerformanceView()}
            {activeView === 'features' && renderFeaturesView()}
            {activeView === 'costs' && renderCostsView()}
          </>
        )}
      </div>
    </div>
  );
};

export default ComparisonTable;