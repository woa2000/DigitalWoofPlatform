import React from 'react';
import { Star, Download, Eye, Clock, Tag, User, TrendingUp } from 'lucide-react';

interface Template {
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

interface TemplateGridProps {
  templates: Template[];
  loading: boolean;
  error: string | null;
  onTemplateSelect: (template: Template) => void;
  onPreview?: (template: Template) => void;
  onDownload?: (template: Template) => void;
}

const TemplateCard: React.FC<{
  template: Template;
  onSelect: (template: Template) => void;
  onPreview?: (template: Template) => void;
  onDownload?: (template: Template) => void;
}> = ({ template, onSelect, onPreview, onDownload }) => {
  const handlePreview = (e: React.MouseEvent) => {
    e.stopPropagation();
    onPreview?.(template);
  };

  const handleDownload = (e: React.MouseEvent) => {
    e.stopPropagation();
    onDownload?.(template);
  };

  const getComplexityColor = (complexity: string) => {
    switch (complexity.toLowerCase()) {
      case 'easy':
        return 'bg-green-100 text-green-800';
      case 'medium':
        return 'bg-yellow-100 text-yellow-800';
      case 'hard':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getPerformanceColor = (score: number) => {
    if (score >= 80) return 'text-green-600';
    if (score >= 60) return 'text-yellow-600';
    return 'text-red-600';
  };

  return (
    <div
      className="bg-white rounded-lg shadow-md hover:shadow-lg transition-shadow duration-200 cursor-pointer border border-gray-200 overflow-hidden"
      onClick={() => onSelect(template)}
    >
      {/* Thumbnail */}
      <div className="relative h-40 bg-gray-100">
        {template.thumbnailUrl ? (
          <img
            src={template.thumbnailUrl}
            alt={template.title}
            className="w-full h-full object-cover"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center text-gray-400">
            <Tag size={48} />
          </div>
        )}
        
        {/* Premium Badge */}
        {template.isPremium && (
          <div className="absolute top-2 right-2">
            <span className="bg-yellow-500 text-white text-xs px-2 py-1 rounded-full font-medium">
              Premium
            </span>
          </div>
        )}

        {/* Preview Badge */}
        {template.isPreview && (
          <div className="absolute top-2 left-2">
            <span className="bg-blue-500 text-white text-xs px-2 py-1 rounded-full font-medium">
              Preview
            </span>
          </div>
        )}

        {/* Action Buttons Overlay */}
        <div className="absolute inset-0 bg-black bg-opacity-0 hover:bg-opacity-30 transition-all duration-200 flex items-center justify-center opacity-0 hover:opacity-100">
          <div className="flex space-x-2">
            {onPreview && (
              <button
                onClick={handlePreview}
                className="bg-white bg-opacity-90 hover:bg-opacity-100 text-gray-800 p-2 rounded-full transition-all duration-200"
                title="Preview Template"
              >
                <Eye size={18} />
              </button>
            )}
            {onDownload && (
              <button
                onClick={handleDownload}
                className="bg-white bg-opacity-90 hover:bg-opacity-100 text-gray-800 p-2 rounded-full transition-all duration-200"
                title="Download Template"
              >
                <Download size={18} />
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="p-4">
        {/* Header */}
        <div className="mb-2">
          <h3 className="text-lg font-semibold text-gray-900 line-clamp-2">
            {template.title}
          </h3>
          <p className="text-sm text-gray-600 mt-1 line-clamp-2">
            {template.description}
          </p>
        </div>

        {/* Meta Information */}
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center space-x-3">
            {/* Rating */}
            <div className="flex items-center space-x-1">
              <Star className="w-4 h-4 text-yellow-400 fill-current" />
              <span className="text-sm text-gray-700">
                {template.rating.toFixed(1)}
              </span>
              <span className="text-xs text-gray-500">
                ({template.ratingCount})
              </span>
            </div>

            {/* Downloads */}
            <div className="flex items-center space-x-1">
              <Download className="w-4 h-4 text-gray-400" />
              <span className="text-sm text-gray-700">
                {template.downloadCount.toLocaleString()}
              </span>
            </div>
          </div>

          {/* Performance Score */}
          <div className="flex items-center space-x-1">
            <TrendingUp className={`w-4 h-4 ${getPerformanceColor(template.performanceScore)}`} />
            <span className={`text-sm font-medium ${getPerformanceColor(template.performanceScore)}`}>
              {template.performanceScore}%
            </span>
          </div>
        </div>

        {/* Categories and Complexity */}
        <div className="flex items-center justify-between mb-3">
          <div className="flex flex-wrap gap-1">
            <span className="bg-blue-100 text-blue-800 text-xs px-2 py-1 rounded">
              {template.category}
            </span>
            <span className="bg-purple-100 text-purple-800 text-xs px-2 py-1 rounded">
              {template.serviceType}
            </span>
          </div>
          <span className={`text-xs px-2 py-1 rounded font-medium ${getComplexityColor(template.complexity)}`}>
            {template.complexity}
          </span>
        </div>

        {/* Content Types */}
        <div className="mb-3">
          <div className="flex flex-wrap gap-1">
            {template.contentTypes.slice(0, 3).map((type, index) => (
              <span
                key={index}
                className="bg-gray-100 text-gray-700 text-xs px-2 py-1 rounded"
              >
                {type}
              </span>
            ))}
            {template.contentTypes.length > 3 && (
              <span className="bg-gray-100 text-gray-700 text-xs px-2 py-1 rounded">
                +{template.contentTypes.length - 3}
              </span>
            )}
          </div>
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between text-xs text-gray-500">
          <div className="flex items-center space-x-1">
            <User className="w-3 h-3" />
            <span>{template.createdBy}</span>
          </div>
          <div className="flex items-center space-x-1">
            <Clock className="w-3 h-3" />
            <span>{new Date(template.createdAt).toLocaleDateString()}</span>
          </div>
        </div>
      </div>
    </div>
  );
};

const TemplateGrid: React.FC<TemplateGridProps> = ({
  templates,
  loading,
  error,
  onTemplateSelect,
  onPreview,
  onDownload,
}) => {
  if (loading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        {Array.from({ length: 8 }).map((_, index) => (
          <div
            key={index}
            className="bg-white rounded-lg shadow-md border border-gray-200 overflow-hidden animate-pulse"
          >
            <div className="h-40 bg-gray-300"></div>
            <div className="p-4">
              <div className="h-4 bg-gray-300 rounded mb-2"></div>
              <div className="h-3 bg-gray-300 rounded mb-3"></div>
              <div className="flex space-x-2 mb-3">
                <div className="h-6 bg-gray-300 rounded w-16"></div>
                <div className="h-6 bg-gray-300 rounded w-20"></div>
              </div>
              <div className="flex space-x-1 mb-3">
                <div className="h-5 bg-gray-300 rounded w-12"></div>
                <div className="h-5 bg-gray-300 rounded w-16"></div>
              </div>
              <div className="flex justify-between">
                <div className="h-3 bg-gray-300 rounded w-16"></div>
                <div className="h-3 bg-gray-300 rounded w-20"></div>
              </div>
            </div>
          </div>
        ))}
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center py-12">
        <div className="text-red-500 mb-4">
          <Tag size={48} />
        </div>
        <h3 className="text-lg font-medium text-gray-900 mb-2">
          Erro ao carregar templates
        </h3>
        <p className="text-gray-600 text-center max-w-md">
          {error}
        </p>
      </div>
    );
  }

  if (templates.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-12">
        <div className="text-gray-400 mb-4">
          <Tag size={48} />
        </div>
        <h3 className="text-lg font-medium text-gray-900 mb-2">
          Nenhum template encontrado
        </h3>
        <p className="text-gray-600 text-center max-w-md">
          Tente ajustar seus filtros de busca ou explore diferentes categorias para encontrar templates relevantes.
        </p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
      {templates.map((template) => (
        <TemplateCard
          key={template.id}
          template={template}
          onSelect={onTemplateSelect}
          onPreview={onPreview}
          onDownload={onDownload}
        />
      ))}
    </div>
  );
};

export default TemplateGrid;