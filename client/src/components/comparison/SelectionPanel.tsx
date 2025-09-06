import React, { useState } from 'react';
import { Plus, X, Check, Search, Filter } from 'lucide-react';

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

interface SelectionPanelProps {
  availableTemplates: Template[];
  selectedTemplates: Template[];
  loading: boolean;
  maxSelections: number;
  onAddTemplate: (template: Template) => void;
  onRemoveTemplate: (templateId: string) => void;
  onClearAll: () => void;
  isSelected: (templateId: string) => boolean;
}

const SelectionPanel: React.FC<SelectionPanelProps> = ({
  availableTemplates,
  selectedTemplates,
  loading,
  maxSelections,
  onAddTemplate,
  onRemoveTemplate,
  onClearAll,
  isSelected,
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [categoryFilter, setCategoryFilter] = useState<string>('all');
  const [serviceFilter, setServiceFilter] = useState<string>('all');

  // Filter templates based on search and filters
  const filteredTemplates = availableTemplates.filter(template => {
    const matchesSearch = !searchQuery || 
      template.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      template.description.toLowerCase().includes(searchQuery.toLowerCase());
    
    const matchesCategory = categoryFilter === 'all' || template.category === categoryFilter;
    const matchesService = serviceFilter === 'all' || template.serviceType === serviceFilter;
    
    return matchesSearch && matchesCategory && matchesService;
  });

  // Get unique categories and service types
  const categories = Array.from(new Set(availableTemplates.map(t => t.category)));
  const serviceTypes = Array.from(new Set(availableTemplates.map(t => t.serviceType)));

  const canAddMore = selectedTemplates.length < maxSelections;

  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200">
      {/* Header */}
      <div className="p-4 border-b border-gray-200">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-medium text-gray-900">
            Selecionar Templates
          </h3>
          <div className="text-sm text-gray-600">
            {selectedTemplates.length}/{maxSelections} selecionados
          </div>
        </div>

        {/* Search */}
        <div className="relative mb-4">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={16} />
          <input
            type="text"
            placeholder="Buscar templates..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>

        {/* Filters */}
        <div className="grid grid-cols-2 gap-3">
          <select
            value={categoryFilter}
            onChange={(e) => setCategoryFilter(e.target.value)}
            className="border border-gray-300 rounded-md px-3 py-2 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="all">Todas as categorias</option>
            {categories.map(category => (
              <option key={category} value={category}>{category}</option>
            ))}
          </select>

          <select
            value={serviceFilter}
            onChange={(e) => setServiceFilter(e.target.value)}
            className="border border-gray-300 rounded-md px-3 py-2 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="all">Todos os serviços</option>
            {serviceTypes.map(service => (
              <option key={service} value={service}>{service}</option>
            ))}
          </select>
        </div>
      </div>

      {/* Selected Templates */}
      {selectedTemplates.length > 0 && (
        <div className="p-4 bg-blue-50 border-b border-gray-200">
          <div className="flex items-center justify-between mb-3">
            <h4 className="text-sm font-medium text-gray-900">
              Templates Selecionados
            </h4>
            <button
              onClick={onClearAll}
              className="text-xs text-red-600 hover:text-red-700"
            >
              Limpar todos
            </button>
          </div>
          
          <div className="flex flex-wrap gap-2">
            {selectedTemplates.map(template => (
              <div
                key={template.id}
                className="inline-flex items-center bg-white border border-blue-200 rounded-md px-3 py-1"
              >
                <span className="text-sm text-gray-900 mr-2">
                  {template.name}
                </span>
                <button
                  onClick={() => onRemoveTemplate(template.id)}
                  className="text-gray-400 hover:text-red-500"
                >
                  <X size={14} />
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Available Templates */}
      <div className="max-h-96 overflow-y-auto">
        {loading ? (
          <div className="p-4 text-center">
            <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600 mx-auto mb-2"></div>
            <p className="text-sm text-gray-600">Carregando templates...</p>
          </div>
        ) : (
          <div className="divide-y divide-gray-100">
            {filteredTemplates.length === 0 ? (
              <div className="p-4 text-center text-gray-500">
                <Filter size={24} className="mx-auto mb-2 text-gray-400" />
                <p className="text-sm">Nenhum template encontrado</p>
              </div>
            ) : (
              filteredTemplates.map(template => {
                const selected = isSelected(template.id);
                return (
                  <div
                    key={template.id}
                    className={`p-4 hover:bg-gray-50 transition-colors ${
                      selected ? 'bg-blue-50' : ''
                    }`}
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center space-x-2 mb-1">
                          <h4 className="text-sm font-medium text-gray-900 truncate">
                            {template.name}
                          </h4>
                          {template.isPremium && (
                            <span className="bg-yellow-100 text-yellow-800 text-xs px-2 py-0.5 rounded">
                              Premium
                            </span>
                          )}
                        </div>
                        
                        <p className="text-xs text-gray-600 mb-2 line-clamp-2">
                          {template.description}
                        </p>
                        
                        <div className="flex items-center space-x-3 text-xs text-gray-500">
                          <span>{template.category}</span>
                          <span>•</span>
                          <span>{template.serviceType}</span>
                          <span>•</span>
                          <span>{template.usageCount} usos</span>
                        </div>
                      </div>

                      <div className="ml-4 flex-shrink-0">
                        {selected ? (
                          <button
                            onClick={() => onRemoveTemplate(template.id)}
                            className="inline-flex items-center justify-center w-8 h-8 bg-blue-600 text-white rounded-full hover:bg-blue-700"
                            title="Remover da comparação"
                          >
                            <Check size={16} />
                          </button>
                        ) : (
                          <button
                            onClick={() => onAddTemplate(template)}
                            disabled={!canAddMore}
                            className={`inline-flex items-center justify-center w-8 h-8 rounded-full border-2 border-dashed transition-colors ${
                              canAddMore
                                ? 'border-gray-300 text-gray-400 hover:border-blue-400 hover:text-blue-600'
                                : 'border-gray-200 text-gray-300 cursor-not-allowed'
                            }`}
                            title={canAddMore ? 'Adicionar à comparação' : 'Limite máximo atingido'}
                          >
                            <Plus size={16} />
                          </button>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        )}
      </div>

      {/* Footer */}
      {!canAddMore && (
        <div className="p-4 bg-yellow-50 border-t border-yellow-200">
          <p className="text-sm text-yellow-800">
            Limite máximo de {maxSelections} templates atingido. 
            Remova alguns templates para adicionar outros.
          </p>
        </div>
      )}
    </div>
  );
};

export default SelectionPanel;