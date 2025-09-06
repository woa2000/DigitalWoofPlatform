import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { BarChart3, Plus, RefreshCw, ArrowLeft } from 'lucide-react';
import { useComparison } from '../hooks/useComparison';
import { useTemplates } from '../hooks/useTemplates';
import ComparisonTable from '../components/comparison/ComparisonTable';
import SelectionPanel from '../components/comparison/SelectionPanel';
import RecommendationsPanel from '../components/comparison/RecommendationsPanel';

const TemplateComparison: React.FC = () => {
  const [showSelectionPanel, setShowSelectionPanel] = useState(false);
  const [showRecommendations, setShowRecommendations] = useState(true);

  // Comparison hook
  const {
    selectedTemplates,
    comparisonMetrics,
    recommendations,
    loading: comparisonLoading,
    error,
    maxComparisons,
    canAddMore,
    addTemplate,
    removeTemplate,
    clearComparison,
    isSelected,
    getComparisonData,
    exportComparison,
  } = useComparison();

  // Templates hook for available templates
  const {
    templates: availableTemplates,
    loading: templatesLoading,
    refresh: refreshTemplates,
  } = useTemplates();

  // Auto-show selection panel when no templates are selected
  useEffect(() => {
    if (selectedTemplates.length === 0) {
      setShowSelectionPanel(true);
    }
  }, [selectedTemplates.length]);

  const handleAddTemplate = (template: any) => {
    addTemplate(template);
    if (selectedTemplates.length + 1 >= 2) {
      setShowSelectionPanel(false);
    }
  };

  const handleRefreshRecommendations = () => {
    getComparisonData();
  };

  const goToTemplateLibrary = () => {
    // TODO: Navigate to template library
    window.location.href = '/templates';
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="py-6">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-4">
                <Link
                  to="/biblioteca-campanhas"
                  className="inline-flex items-center text-gray-600 hover:text-gray-900"
                >
                  <ArrowLeft size={20} className="mr-2" />
                  Voltar à Biblioteca
                </Link>
                
                <div className="h-6 w-px bg-gray-300"></div>
                
                <div>
                  <h1 className="text-2xl font-bold text-gray-900 flex items-center">
                    <BarChart3 className="mr-3 text-blue-600" size={28} />
                    Comparação de Templates
                  </h1>
                  <p className="mt-1 text-sm text-gray-600">
                    Compare até {maxComparisons} templates lado a lado para encontrar a melhor opção
                  </p>
                </div>
              </div>

              <div className="flex items-center space-x-3">
                <button
                  onClick={() => setShowSelectionPanel(!showSelectionPanel)}
                  className="inline-flex items-center px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50"
                >
                  <Plus size={16} className="mr-2" />
                  {showSelectionPanel ? 'Ocultar Seleção' : 'Adicionar Templates'}
                </button>

                <button
                  onClick={() => setShowRecommendations(!showRecommendations)}
                  className="inline-flex items-center px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50"
                >
                  <RefreshCw size={16} className="mr-2" />
                  {showRecommendations ? 'Ocultar' : 'Mostrar'} Recomendações
                </button>
              </div>
            </div>

            {/* Quick Stats */}
            <div className="mt-4 flex items-center justify-between">
              <div className="flex items-center space-x-6 text-sm text-gray-600">
                <span>
                  {selectedTemplates.length} template{selectedTemplates.length !== 1 ? 's' : ''} selecionado{selectedTemplates.length !== 1 ? 's' : ''}
                </span>
                {selectedTemplates.length > 0 && (
                  <span>
                    {comparisonMetrics.length} métrica{comparisonMetrics.length !== 1 ? 's' : ''} carregada{comparisonMetrics.length !== 1 ? 's' : ''}
                  </span>
                )}
                {recommendations.length > 0 && (
                  <span>
                    {recommendations.length} recomendaç{recommendations.length !== 1 ? 'ões' : 'ão'}
                  </span>
                )}
              </div>

              {error && (
                <div className="text-sm text-red-600 bg-red-50 px-3 py-1 rounded">
                  {error}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          {/* Selection Panel */}
          {showSelectionPanel && (
            <div className="lg:col-span-1">
              <SelectionPanel
                availableTemplates={availableTemplates}
                selectedTemplates={selectedTemplates}
                loading={templatesLoading}
                maxSelections={maxComparisons}
                onAddTemplate={handleAddTemplate}
                onRemoveTemplate={removeTemplate}
                onClearAll={clearComparison}
                isSelected={isSelected}
              />
            </div>
          )}

          {/* Main Comparison Area */}
          <div className={`${showSelectionPanel ? 'lg:col-span-3' : 'lg:col-span-4'}`}>
            <div className="space-y-6">
              {/* Comparison Table */}
              <ComparisonTable
                templates={selectedTemplates}
                metrics={comparisonMetrics}
                loading={comparisonLoading}
                onRemoveTemplate={removeTemplate}
                onClearAll={clearComparison}
                onExport={exportComparison}
              />

              {/* Recommendations */}
              {showRecommendations && selectedTemplates.length >= 2 && (
                <RecommendationsPanel
                  recommendations={recommendations}
                  availableTemplates={availableTemplates}
                  loading={comparisonLoading}
                  onAddTemplate={handleAddTemplate}
                  onRefresh={handleRefreshRecommendations}
                  isSelected={isSelected}
                />
              )}
            </div>
          </div>
        </div>

        {/* Getting Started Guide */}
        {selectedTemplates.length === 0 && (
          <div className="mt-12 bg-white rounded-lg shadow-sm border border-gray-200 p-8">
            <div className="text-center">
              <BarChart3 className="w-12 h-12 text-gray-400 mx-auto mb-4" />
              <h2 className="text-xl font-semibold text-gray-900 mb-2">
                Como comparar templates
              </h2>
              <p className="text-gray-600 mb-6 max-w-2xl mx-auto">
                Use nossa ferramenta de comparação para avaliar diferentes templates lado a lado 
                e encontrar a melhor opção para sua campanha.
              </p>
              
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-4xl mx-auto">
                <div className="text-center">
                  <div className="inline-flex items-center justify-center w-12 h-12 bg-blue-100 text-blue-600 rounded-lg mb-3">
                    <Plus size={24} />
                  </div>
                  <h3 className="text-lg font-medium text-gray-900 mb-2">
                    1. Selecionar Templates
                  </h3>
                  <p className="text-sm text-gray-600">
                    Escolha até {maxComparisons} templates que você gostaria de comparar
                  </p>
                </div>
                
                <div className="text-center">
                  <div className="inline-flex items-center justify-center w-12 h-12 bg-green-100 text-green-600 rounded-lg mb-3">
                    <BarChart3 size={24} />
                  </div>
                  <h3 className="text-lg font-medium text-gray-900 mb-2">
                    2. Analisar Métricas
                  </h3>
                  <p className="text-sm text-gray-600">
                    Compare performance, recursos, custos e complexidade
                  </p>
                </div>
                
                <div className="text-center">
                  <div className="inline-flex items-center justify-center w-12 h-12 bg-purple-100 text-purple-600 rounded-lg mb-3">
                    <RefreshCw size={24} />
                  </div>
                  <h3 className="text-lg font-medium text-gray-900 mb-2">
                    3. Receber Recomendações
                  </h3>
                  <p className="text-sm text-gray-600">
                    Obtenha sugestões inteligentes baseadas na sua seleção
                  </p>
                </div>
              </div>

              <div className="mt-8">
                <button
                  onClick={() => setShowSelectionPanel(true)}
                  className="inline-flex items-center px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-medium"
                >
                  <Plus size={20} className="mr-2" />
                  Começar Comparação
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default TemplateComparison;