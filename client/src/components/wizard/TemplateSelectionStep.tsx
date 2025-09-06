import React, { useState, useEffect } from 'react';
import { 
  Search, 
  Filter, 
  Star, 
  Eye, 
  Tag, 
  Users, 
  Clock,
  TrendingUp,
  Check,
  X
} from 'lucide-react';
import { useTemplates, type Template } from '../../hooks/useTemplates';
import { Badge } from '@/components/ui/badge';

interface TemplateSelectionStepProps {
  selectedTemplate: Template | null;
  onTemplateSelect: (template: Template) => void;
  onNext: () => void;
  canProceed: boolean;
}

const TemplateCard: React.FC<{
  template: Template;
  isSelected: boolean;
  onSelect: () => void;
  onPreview: () => void;
}> = ({ template, isSelected, onSelect, onPreview }) => {
  return (
    <div 
      className={`relative bg-white rounded-lg border-2 transition-all duration-200 hover:shadow-md ${
        isSelected 
          ? 'border-blue-500 shadow-lg' 
          : 'border-gray-200 hover:border-gray-300'
      }`}
    >
      {/* Selection Indicator */}
      {isSelected && (
        <div className="absolute top-3 right-3 z-10">
          <div className="w-6 h-6 bg-blue-500 rounded-full flex items-center justify-center">
            <Check className="w-4 h-4 text-white" />
          </div>
        </div>
      )}

      {/* Premium Badge */}
      {template.isPremium && (
        <div className="absolute top-3 left-3 z-10">
          <div className="bg-yellow-500 text-white text-xs px-2 py-1 rounded-full font-medium flex items-center">
            <Star className="w-3 h-3 mr-1" />
            Premium
          </div>
        </div>
      )}

      {/* Template Preview */}
      <div className="aspect-video bg-gray-100 rounded-t-lg relative overflow-hidden">
        {template.visualAssets && template.visualAssets.length > 0 ? (
          <img 
            src={template.visualAssets[0]?.url || '/placeholder-template.jpg'} 
            alt={template.name}
            className="w-full h-full object-cover"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center">
            <div className="text-center text-gray-400">
              <Eye className="w-8 h-8 mx-auto mb-2" />
              <span className="text-sm">Preview em breve</span>
            </div>
          </div>
        )}
        
        {/* Preview Overlay */}
        <div className="absolute inset-0 bg-black bg-opacity-0 hover:bg-opacity-20 transition-all duration-200 flex items-center justify-center">
          <button
            onClick={onPreview}
            className="opacity-0 hover:opacity-100 bg-white text-gray-800 px-4 py-2 rounded-md text-sm font-medium transition-all duration-200 flex items-center"
          >
            <Eye className="w-4 h-4 mr-2" />
            Preview
          </button>
        </div>
      </div>

      {/* Template Info */}
      <div className="p-4">
        <div className="mb-3">
          <h3 className="font-semibold text-gray-900 mb-1">
            {template.name}
          </h3>
          <p className="text-sm text-gray-600 line-clamp-2">
            {template.description}
          </p>
        </div>

        {/* Tags */}
        {template.category && (
          <div className="flex flex-wrap gap-1 mb-3">
            <Badge variant="secondary" className="text-xs">
              {template.category}
            </Badge>
            {template.serviceType && (
              <Badge variant="secondary" className="text-xs">
                {template.serviceType}
              </Badge>
            )}
          </div>
        )}

        {/* Performance Metrics */}
        <div className="flex items-center justify-between text-xs text-gray-500 mb-2">
          <div className="flex items-center gap-1">
            <TrendingUp className="w-3 h-3" />
            <span>Engajamento</span>
            <span className="font-medium">
              {template.avgEngagementRate}
            </span>
          </div>
          <div className="flex items-center gap-1">
            <Users className="w-3 h-3" />
            <span>Conversão</span>
            <span className="font-medium">
              {template.avgConversionRate}
            </span>
          </div>
          <div className="flex items-center gap-1">
            <Clock className="w-3 h-3" />
            <span>Usos</span>
            <span className="font-medium">
              {template.usageCount}
            </span>
          </div>
        </div>        {/* Category and Service Type */}
        <div className="flex items-center justify-between text-xs text-gray-500 mb-3">
          <span className="flex items-center">
            <Users className="w-3 h-3 mr-1" />
            {template.category}
          </span>
          <span className="flex items-center">
            <Clock className="w-3 h-3 mr-1" />
            {template.serviceType}
          </span>
        </div>

        {/* Select Button */}
        <button
          onClick={onSelect}
          className={`w-full py-2 px-4 rounded-md text-sm font-medium transition-colors ${
            isSelected
              ? 'bg-blue-600 text-white hover:bg-blue-700'
              : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
          }`}
        >
          {isSelected ? 'Selecionado' : 'Selecionar Template'}
        </button>
      </div>
    </div>
  );
};

const FilterPanel: React.FC<{
  filters: any;
  onFiltersChange: (filters: any) => void;
  isOpen: boolean;
  onClose: () => void;
}> = ({ filters, onFiltersChange, isOpen, onClose }) => {
  if (!isOpen) return null;

  return (
    <div className="absolute top-full left-0 right-0 z-20 mt-2 bg-white border border-gray-200 rounded-lg shadow-lg p-4">
      <div className="flex items-center justify-between mb-4">
        <h3 className="font-medium text-gray-900">Filtros</h3>
        <button
          onClick={onClose}
          className="text-gray-400 hover:text-gray-600"
        >
          <X className="w-4 h-4" />
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* Category Filter */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Categoria
          </label>
          <select
            value={filters.category || ''}
            onChange={(e) => onFiltersChange({ ...filters, category: e.target.value })}
            className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm"
          >
            <option value="">Todas</option>
            <option value="veterinaria">Veterinária</option>
            <option value="petshop">Pet Shop</option>
            <option value="adestramento">Adestramento</option>
            <option value="hotel">Hotel Pet</option>
          </select>
        </div>

        {/* Service Type Filter */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Tipo de Serviço
          </label>
          <select
            value={filters.serviceType || ''}
            onChange={(e) => onFiltersChange({ ...filters, serviceType: e.target.value })}
            className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm"
          >
            <option value="">Todos</option>
            <option value="consulta">Consulta</option>
            <option value="cirurgia">Cirurgia</option>
            <option value="banho">Banho & Tosa</option>
            <option value="hospedagem">Hospedagem</option>
          </select>
        </div>

        {/* Premium Filter */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Tipo
          </label>
          <select
            value={filters.isPremium || ''}
            onChange={(e) => onFiltersChange({ ...filters, isPremium: e.target.value })}
            className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm"
          >
            <option value="">Todos</option>
            <option value="false">Gratuitos</option>
            <option value="true">Premium</option>
          </select>
        </div>
      </div>

      <div className="mt-4 flex justify-end space-x-2">
        <button
          onClick={() => onFiltersChange({})}
          className="px-3 py-2 text-sm text-gray-600 hover:text-gray-800"
        >
          Limpar Filtros
        </button>
        <button
          onClick={onClose}
          className="px-4 py-2 bg-blue-600 text-white text-sm rounded-md hover:bg-blue-700"
        >
          Aplicar
        </button>
      </div>
    </div>
  );
};

const TemplateSelectionStep: React.FC<TemplateSelectionStepProps> = ({
  selectedTemplate,
  onTemplateSelect,
  onNext,
  canProceed,
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [filters, setFiltersState] = useState({});
  const [showFilters, setShowFilters] = useState(false);
  const [previewTemplate, setPreviewTemplate] = useState<Template | null>(null);

  const {
    templates,
    loading,
    error,
    total,
    search,
    setFilters,
    clearFilters,
    refresh
  } = useTemplates();  // Search templates when query or filters change
  useEffect(() => {
    search(searchQuery);
    setFilters(filters);
  }, [searchQuery, filters, search, setFilters]);

  const handlePreview = (template: Template) => {
    setPreviewTemplate(template);
  };

  const closePreview = () => {
    setPreviewTemplate(null);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h2 className="text-2xl font-bold text-gray-900 mb-2">
          Selecione um Template
        </h2>
        <p className="text-gray-600">
          Escolha o template que melhor se adequa à sua campanha. 
          Você poderá personalizá-lo no próximo passo.
        </p>
      </div>

      {/* Search and Filters */}
      <div className="relative">
        <div className="flex space-x-4">
          {/* Search Bar */}
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
            <input
              type="text"
              placeholder="Pesquisar templates..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            />
          </div>

          {/* Filter Button */}
          <button
            onClick={() => setShowFilters(!showFilters)}
            className={`px-4 py-2 border border-gray-300 rounded-md flex items-center space-x-2 ${
              showFilters ? 'bg-gray-100' : 'bg-white hover:bg-gray-50'
            }`}
          >
            <Filter className="w-4 h-4" />
            <span>Filtros</span>
          </button>
        </div>

        {/* Filter Panel */}
        <FilterPanel
          filters={filters}
          onFiltersChange={setFilters}
          isOpen={showFilters}
          onClose={() => setShowFilters(false)}
        />
      </div>

      {/* Results Count */}
      <div className="flex items-center justify-between">
        <p className="text-sm text-gray-600">
          {total} templates encontrados
        </p>
        
        {selectedTemplate && (
          <div className="flex items-center space-x-2 text-sm text-green-600">
            <Check className="w-4 h-4" />
            <span>Template selecionado: {selectedTemplate.name}</span>
          </div>
        )}
      </div>

      {/* Templates Grid */}
      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[...Array(6)].map((_, i) => (
            <div key={i} className="bg-gray-100 rounded-lg h-80 animate-pulse" />
          ))}
        </div>
      ) : error ? (
        <div className="text-center py-12">
          <div className="text-red-500 mb-2">Erro ao carregar templates</div>
          <p className="text-gray-600">{error}</p>
        </div>
      ) : templates.length === 0 ? (
        <div className="text-center py-12">
          <Search className="w-12 h-12 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">
            Nenhum template encontrado
          </h3>
          <p className="text-gray-600">
            Tente ajustar seus filtros ou termo de busca.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {templates.map((template) => (
            <TemplateCard
              key={template.id}
              template={template}
              isSelected={selectedTemplate?.id === template.id}
              onSelect={() => onTemplateSelect(template)}
              onPreview={() => handlePreview(template)}
            />
          ))}
        </div>
      )}

      {/* Next Step Button */}
      <div className="flex justify-end pt-6 border-t border-gray-200">
        <button
          onClick={onNext}
          disabled={!canProceed}
          className={`px-6 py-3 rounded-md font-medium ${
            canProceed
              ? 'bg-blue-600 text-white hover:bg-blue-700'
              : 'bg-gray-300 text-gray-500 cursor-not-allowed'
          }`}
        >
          Próximo: Personalizar
        </button>
      </div>

      {/* Preview Modal */}
      {previewTemplate && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg max-w-4xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-xl font-semibold">
                  Preview: {previewTemplate.name}
                </h3>
                <button
                  onClick={closePreview}
                  className="text-gray-400 hover:text-gray-600"
                >
                  <X className="w-6 h-6" />
                </button>
              </div>
              
              {/* Preview content would go here */}
              <div className="aspect-video bg-gray-100 rounded-lg flex items-center justify-center">
                <div className="text-center text-gray-500">
                  <Eye className="w-16 h-16 mx-auto mb-4" />
                  <p>Preview detalhado em desenvolvimento</p>
                </div>
              </div>
              
              <div className="mt-4 flex justify-end space-x-3">
                <button
                  onClick={closePreview}
                  className="px-4 py-2 text-gray-600 hover:text-gray-800"
                >
                  Fechar
                </button>
                <button
                  onClick={() => {
                    onTemplateSelect(previewTemplate);
                    closePreview();
                  }}
                  className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
                >
                  Selecionar Este Template
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default TemplateSelectionStep;