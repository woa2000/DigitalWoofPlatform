import React, { useState } from 'react';
import { Filter, SortAsc, Grid, List, Download, FileText } from 'lucide-react';
import SearchBar from '../components/discovery/SearchBar';
import FilterPanel from '../components/discovery/FilterPanel';
import TemplateGrid from '../components/discovery/TemplateGrid';
import { useTemplates } from '../hooks/useTemplates';

// Template interface compatible with API
interface TemplateDisplay {
  id: string;
  title: string;
  description: string;
  category: string;
  serviceType: string;
  contentTypes: string[];
  performanceScore: number;
  complexity: string;
  thumbnailUrl?: string;
  previewUrl?: string;
  downloadCount: number;
  rating: number;
  ratingCount: number;
  tags: string[];
  createdBy: string;
  createdAt: string;
  isPreview?: boolean;
  isPremium?: boolean;
}

const Templates: React.FC = () => {
  const [showFilters, setShowFilters] = useState(true);
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [selectedTemplate, setSelectedTemplate] = useState<TemplateDisplay | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [sortBy, setSortBy] = useState<string>('relevance');

  const {
    templates,
    facets,
    pagination,
    total,
    loading,
    error,
    filters,
    search,
    setFilters,
    loadMore,
    refresh,
  } = useTemplates();

  // Handle search query changes
  const handleSearchChange = (query: string) => {
    setSearchQuery(query);
    search(query);
  };

  // Handle sort changes
  const handleSortChange = (sort: string) => {
    setSortBy(sort);
    setFilters({ 
      ...filters, 
      sortBy: sort as any 
    });
  };

  // Convert API template to display template
  const convertTemplate = (template: any): TemplateDisplay => ({
    id: template.id,
    title: template.name || template.title,
    description: template.description,
    category: template.category,
    serviceType: template.serviceType,
    contentTypes: template.contentPieces?.map((p: any) => p.type) || [],
    performanceScore: parseFloat(template.avgEngagementRate) || 0,
    complexity: 'medium', // Default complexity
    downloadCount: template.usageCount || 0,
    rating: 4.5, // Default rating
    ratingCount: Math.floor(Math.random() * 100) + 10,
    tags: template.tags || [],
    createdBy: 'Sistema',
    createdAt: template.createdAt,
    isPremium: template.isPremium,
    isPreview: !template.isPublic,
  });

  const displayTemplates = templates.map(convertTemplate);

  const handleTemplateSelect = (template: TemplateDisplay) => {
    setSelectedTemplate(template);
    // TODO: Navigate to template detail view or open modal
    console.log('Selected template:', template);
  };

  const handlePreview = (template: TemplateDisplay) => {
    // TODO: Open template preview modal
    console.log('Preview template:', template);
  };

  const handleDownload = (template: TemplateDisplay) => {
    // TODO: Handle template download
    console.log('Download template:', template);
  };

  const handleExportResults = () => {
    // TODO: Export current search results to CSV/PDF
    console.log('Export results');
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="py-6">
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-2xl font-bold text-gray-900">
                  Biblioteca de Campanhas
                </h1>
                <p className="mt-1 text-sm text-gray-600">
                  Descubra e utilize templates de campanhas comprovados para pets
                </p>
              </div>
              
              <div className="flex items-center space-x-4">
                <button
                  onClick={handleExportResults}
                  className="inline-flex items-center px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                >
                  <Download className="w-4 h-4 mr-2" />
                  Exportar
                </button>
                
                <div className="flex items-center bg-gray-100 rounded-lg p-1">
                  <button
                    onClick={() => setViewMode('grid')}
                    className={`p-2 rounded ${
                      viewMode === 'grid'
                        ? 'bg-white text-blue-600 shadow-sm'
                        : 'text-gray-600 hover:text-gray-900'
                    }`}
                    title="Visualização em Grade"
                  >
                    <Grid className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => setViewMode('list')}
                    className={`p-2 rounded ${
                      viewMode === 'list'
                        ? 'bg-white text-blue-600 shadow-sm'
                        : 'text-gray-600 hover:text-gray-900'
                    }`}
                    title="Visualização em Lista"
                  >
                    <List className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </div>

            {/* Search Bar */}
            <div className="mt-6">
              <SearchBar
                value={searchQuery}
                onChange={handleSearchChange}
                placeholder="Buscar templates por título, descrição, tags..."
              />
            </div>

            {/* Quick Stats */}
            <div className="mt-4 flex items-center justify-between">
              <div className="flex items-center space-x-6 text-sm text-gray-600">
                <span>
                  {total.toLocaleString()} templates encontrados
                </span>
                {searchQuery && (
                  <span>
                    Resultados para "{searchQuery}"
                  </span>
                )}
              </div>
              
              <div className="flex items-center space-x-4">
                <button
                  onClick={() => setShowFilters(!showFilters)}
                  className={`inline-flex items-center px-3 py-2 border border-gray-300 rounded-md text-sm font-medium ${
                    showFilters
                      ? 'bg-blue-50 text-blue-700 border-blue-300'
                      : 'bg-white text-gray-700 hover:bg-gray-50'
                  }`}
                >
                  <Filter className="w-4 h-4 mr-2" />
                  Filtros
                  {Object.keys(filters).length > 0 && (
                    <span className="ml-2 bg-blue-600 text-white text-xs rounded-full px-2 py-0.5">
                      {Object.keys(filters).length}
                    </span>
                  )}
                </button>

                <div className="flex items-center space-x-2">
                  <SortAsc className="w-4 h-4 text-gray-400" />
                  <select
                    value={sortBy}
                    onChange={(e) => handleSortChange(e.target.value)}
                    className="border border-gray-300 rounded-md px-3 py-2 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="relevance">Relevância</option>
                    <option value="performance">Performance</option>
                    <option value="downloads">Downloads</option>
                    <option value="rating">Avaliação</option>
                    <option value="newest">Mais Recente</option>
                    <option value="oldest">Mais Antigo</option>
                    <option value="title">Título A-Z</option>
                  </select>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex gap-8">
          {/* Sidebar - Filters */}
          {showFilters && (
            <div className="w-80 flex-shrink-0">
              <div className="bg-white rounded-lg shadow-sm border border-gray-200 sticky top-8">
                <FilterPanel
                  filters={filters}
                  facets={facets}
                  onFiltersChange={(newFilters: any) => setFilters({ ...filters, ...newFilters })}
                  onClearFilters={() => setFilters({})}
                />
              </div>
            </div>
          )}

          {/* Main Content Area */}
          <div className="flex-1">
            {/* Results Header */}
            <div className="mb-6">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-4">
                  <h2 className="text-lg font-medium text-gray-900">
                    Templates de Campanha
                  </h2>
                  {loading && (
                    <div className="inline-flex items-center px-3 py-1 rounded-full text-sm bg-blue-100 text-blue-800">
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-600 mr-2"></div>
                      Carregando...
                    </div>
                  )}
                </div>

                <div className="text-sm text-gray-600">
                  Mostrando {displayTemplates.length} de {total} resultados
                </div>
              </div>
            </div>

            {/* Template Grid/List */}
            <div className="mb-8">
              {viewMode === 'grid' ? (
                <TemplateGrid
                  templates={displayTemplates}
                  loading={loading}
                  error={error}
                  onTemplateSelect={handleTemplateSelect}
                  onPreview={handlePreview}
                  onDownload={handleDownload}
                />
              ) : (
                // TODO: Implement list view component
                <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-8 text-center">
                  <FileText className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                  <h3 className="text-lg font-medium text-gray-900 mb-2">
                    Visualização em Lista
                  </h3>
                  <p className="text-gray-600">
                    A visualização em lista será implementada em breve.
                  </p>
                </div>
              )}
            </div>

            {/* Load More Button */}
            {pagination.hasMore && !loading && (
              <div className="text-center">
                <button
                  onClick={loadMore}
                  className="inline-flex items-center px-6 py-3 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                >
                  Carregar Mais Templates
                </button>
              </div>
            )}

            {/* No More Results */}
            {!pagination.hasMore && displayTemplates.length > 0 && !loading && (
              <div className="text-center py-8">
                <p className="text-gray-600">
                  Você visualizou todos os templates disponíveis.
                </p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Templates;