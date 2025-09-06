import React from 'react';
import { 
  TrendingUp, 
  Lightbulb, 
  BarChart3, 
  RefreshCw,
  Star,
  ArrowRight,
  Target,
  Zap
} from 'lucide-react';

interface Recommendation {
  templateId: string;
  reason: string;
  score: number;
  category: 'performance' | 'similar' | 'alternative' | 'trending';
}

interface Template {
  id: string;
  name: string;
  description: string;
  category: string;
  serviceType: string;
  isPremium: boolean;
  avgEngagementRate: string;
  avgConversionRate: string;
  usageCount: number;
}

interface RecommendationsPanelProps {
  recommendations: Recommendation[];
  availableTemplates: Template[];
  loading: boolean;
  onAddTemplate: (template: Template) => void;
  onRefresh: () => void;
  isSelected: (templateId: string) => boolean;
}

const RecommendationsPanel: React.FC<RecommendationsPanelProps> = ({
  recommendations,
  availableTemplates,
  loading,
  onAddTemplate,
  onRefresh,
  isSelected,
}) => {
  const getTemplateById = (id: string) => {
    return availableTemplates.find(t => t.id === id);
  };

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case 'performance':
        return <BarChart3 size={16} className="text-green-600" />;
      case 'similar':
        return <Target size={16} className="text-blue-600" />;
      case 'alternative':
        return <Lightbulb size={16} className="text-purple-600" />;
      case 'trending':
        return <TrendingUp size={16} className="text-orange-600" />;
      default:
        return <Star size={16} className="text-gray-600" />;
    }
  };

  const getCategoryLabel = (category: string) => {
    switch (category) {
      case 'performance':
        return 'Alta Performance';
      case 'similar':
        return 'Similar';
      case 'alternative':
        return 'Alternativa';
      case 'trending':
        return 'Trending';
      default:
        return 'Recomendado';
    }
  };

  const getCategoryColor = (category: string) => {
    switch (category) {
      case 'performance':
        return 'bg-green-100 text-green-800';
      case 'similar':
        return 'bg-blue-100 text-blue-800';
      case 'alternative':
        return 'bg-purple-100 text-purple-800';
      case 'trending':
        return 'bg-orange-100 text-orange-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getScoreColor = (score: number) => {
    if (score >= 80) return 'text-green-600';
    if (score >= 60) return 'text-yellow-600';
    return 'text-red-600';
  };

  if (recommendations.length === 0) {
    return (
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <div className="text-center">
          <Lightbulb className="w-12 h-12 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">
            Recomendações Inteligentes
          </h3>
          <p className="text-gray-600 mb-4">
            Selecione pelo menos 2 templates para receber recomendações personalizadas
          </p>
          <button
            onClick={onRefresh}
            className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
          >
            <RefreshCw size={16} className="mr-2" />
            Gerar Recomendações
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200">
      {/* Header */}
      <div className="p-4 border-b border-gray-200">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <Zap className="w-5 h-5 text-blue-600" />
            <h3 className="text-lg font-medium text-gray-900">
              Recomendações Inteligentes
            </h3>
          </div>
          
          <button
            onClick={onRefresh}
            disabled={loading}
            className="inline-flex items-center px-3 py-1.5 text-sm border border-gray-300 rounded-md text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50"
          >
            <RefreshCw size={14} className={`mr-1.5 ${loading ? 'animate-spin' : ''}`} />
            Atualizar
          </button>
        </div>
        
        <p className="text-sm text-gray-600 mt-1">
          Baseado na sua seleção atual, encontramos {recommendations.length} recomendação{recommendations.length !== 1 ? 'ões' : ''}
        </p>
      </div>

      {/* Recommendations */}
      <div className="max-h-96 overflow-y-auto divide-y divide-gray-100">
        {loading ? (
          <div className="p-6 text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-3"></div>
            <p className="text-sm text-gray-600">Analisando templates e gerando recomendações...</p>
          </div>
        ) : (
          recommendations.map((rec) => {
            const template = getTemplateById(rec.templateId);
            const selected = isSelected(rec.templateId);
            
            if (!template) return null;

            return (
              <div key={rec.templateId} className="p-4 hover:bg-gray-50 transition-colors">
                <div className="flex items-start justify-between">
                  <div className="flex-1 min-w-0">
                    {/* Template Info */}
                    <div className="flex items-center space-x-2 mb-2">
                      <h4 className="text-sm font-medium text-gray-900">
                        {template.name}
                      </h4>
                      
                      <span className={`text-xs px-2 py-0.5 rounded font-medium ${getCategoryColor(rec.category)}`}>
                        {getCategoryLabel(rec.category)}
                      </span>
                      
                      {template.isPremium && (
                        <span className="bg-yellow-100 text-yellow-800 text-xs px-2 py-0.5 rounded">
                          Premium
                        </span>
                      )}
                    </div>

                    {/* Recommendation Reason */}
                    <p className="text-sm text-gray-600 mb-3">
                      {rec.reason}
                    </p>

                    {/* Template Metrics */}
                    <div className="flex items-center space-x-4 text-xs text-gray-500 mb-2">
                      <div className="flex items-center space-x-1">
                        {getCategoryIcon(rec.category)}
                        <span>Score: </span>
                        <span className={`font-medium ${getScoreColor(rec.score)}`}>
                          {rec.score}/100
                        </span>
                      </div>
                      
                      <span>•</span>
                      
                      <span>
                        {parseFloat(template.avgEngagementRate)}% engagement
                      </span>
                      
                      <span>•</span>
                      
                      <span>
                        {template.usageCount} usos
                      </span>
                    </div>

                    {/* Categories */}
                    <div className="flex flex-wrap gap-1">
                      <span className="bg-gray-100 text-gray-700 text-xs px-2 py-0.5 rounded">
                        {template.category}
                      </span>
                      <span className="bg-gray-100 text-gray-700 text-xs px-2 py-0.5 rounded">
                        {template.serviceType}
                      </span>
                    </div>
                  </div>

                  {/* Action Button */}
                  <div className="ml-4 flex-shrink-0">
                    {selected ? (
                      <div className="inline-flex items-center px-3 py-1.5 bg-green-100 text-green-800 rounded-md text-sm">
                        <Star size={14} className="mr-1" />
                        Selecionado
                      </div>
                    ) : (
                      <button
                        onClick={() => onAddTemplate(template)}
                        className="inline-flex items-center px-3 py-1.5 bg-blue-600 text-white rounded-md text-sm hover:bg-blue-700 transition-colors"
                      >
                        Adicionar
                        <ArrowRight size={14} className="ml-1" />
                      </button>
                    )}
                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* Insights Footer */}
      {!loading && recommendations.length > 0 && (
        <div className="p-4 bg-blue-50 border-t border-blue-200">
          <div className="flex items-start space-x-2">
            <Lightbulb className="w-4 h-4 text-blue-600 mt-0.5 flex-shrink-0" />
            <div>
              <h4 className="text-sm font-medium text-blue-900 mb-1">
                Insights da Análise
              </h4>
              <ul className="text-sm text-blue-800 space-y-1">
                {recommendations.filter(r => r.category === 'performance').length > 0 && (
                  <li>• {recommendations.filter(r => r.category === 'performance').length} template{recommendations.filter(r => r.category === 'performance').length !== 1 ? 's' : ''} com alta performance encontrado{recommendations.filter(r => r.category === 'performance').length !== 1 ? 's' : ''}</li>
                )}
                {recommendations.filter(r => r.category === 'trending').length > 0 && (
                  <li>• {recommendations.filter(r => r.category === 'trending').length} template{recommendations.filter(r => r.category === 'trending').length !== 1 ? 's' : ''} em alta no momento</li>
                )}
                {recommendations.filter(r => r.category === 'alternative').length > 0 && (
                  <li>• {recommendations.filter(r => r.category === 'alternative').length} alternativa{recommendations.filter(r => r.category === 'alternative').length !== 1 ? 's' : ''} interessante{recommendations.filter(r => r.category === 'alternative').length !== 1 ? 's' : ''} para diversificar</li>
                )}
              </ul>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default RecommendationsPanel;