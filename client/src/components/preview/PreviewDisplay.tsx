import React from 'react';
import { 
  Eye, 
  EyeOff, 
  Palette, 
  Type, 
  MessageSquare, 
  Star,
  TrendingUp,
  Shield,
  Clock,
  Download
} from 'lucide-react';

interface PreviewContent {
  channel: string;
  content: {
    title: string;
    description: string;
    callToAction: string;
    body: string;
    visualElements: {
      colors: string[];
      fonts: string[];
      images: string[];
    };
  };
  metadata: {
    generatedAt: string;
    personalizationScore: number;
    complianceScore: number;
    estimatedPerformance: number;
  };
}

interface PersonalizationPreview {
  original: PreviewContent;
  personalized: PreviewContent;
  changes: {
    field: string;
    original: string;
    personalized: string;
    reason: string;
  }[];
  recommendations: string[];
}

interface PreviewDisplayProps {
  preview: PersonalizationPreview;
  showOriginal: boolean;
  currentChannel: string;
  onTogglePreview: () => void;
  onExport: (format: 'pdf' | 'docx') => void;
  loading?: boolean;
}

const ChannelIcons = {
  email: MessageSquare,
  social: Star,
  web: Eye,
  print: Download,
  video: Eye
};

const ScoreIndicator: React.FC<{ 
  score: number; 
  label: string; 
  icon: React.ComponentType<any> 
}> = ({ score, label, icon: Icon }) => {
  const getScoreColor = (score: number) => {
    if (score >= 80) return 'text-green-600 bg-green-100';
    if (score >= 60) return 'text-yellow-600 bg-yellow-100';
    return 'text-red-600 bg-red-100';
  };

  return (
    <div className="flex items-center space-x-2">
      <Icon className="w-4 h-4 text-gray-500" />
      <span className="text-sm text-gray-700">{label}</span>
      <span className={`px-2 py-1 rounded-full text-xs font-medium ${getScoreColor(score)}`}>
        {score}%
      </span>
    </div>
  );
};

const ContentSection: React.FC<{
  title: string;
  content: PreviewContent;
  isPersonalized: boolean;
  channel: string;
}> = ({ title, content, isPersonalized, channel }) => {
  const ChannelIcon = ChannelIcons[channel as keyof typeof ChannelIcons] || Eye;

  return (
    <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
      {/* Header */}
      <div className={`px-4 py-3 border-b border-gray-200 ${
        isPersonalized ? 'bg-blue-50' : 'bg-gray-50'
      }`}>
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <ChannelIcon className="w-4 h-4 text-gray-600" />
            <h3 className="font-medium text-gray-900">
              {title}
            </h3>
            {isPersonalized && (
              <span className="bg-blue-600 text-white text-xs px-2 py-1 rounded-full">
                Personalizado
              </span>
            )}
          </div>
          <div className="text-xs text-gray-500">
            {content.metadata.generatedAt && new Date(content.metadata.generatedAt).toLocaleString()}
          </div>
        </div>
      </div>

      {/* Content Preview */}
      <div className="p-4">
        {/* Title */}
        <div className="mb-4">
          <h4 className="text-lg font-semibold text-gray-900 mb-2">
            {content.content.title}
          </h4>
          <p className="text-sm text-gray-600">
            {content.content.description}
          </p>
        </div>

        {/* Body Content */}
        <div className="mb-4">
          <div className="prose prose-sm max-w-none">
            <div 
              className="text-gray-700 leading-relaxed"
              dangerouslySetInnerHTML={{ __html: content.content.body }}
            />
          </div>
        </div>

        {/* Call to Action */}
        <div className="mb-4">
          <button 
            className="bg-blue-600 text-white px-4 py-2 rounded-md font-medium hover:bg-blue-700 transition-colors"
            disabled
          >
            {content.content.callToAction}
          </button>
        </div>

        {/* Visual Elements */}
        {content.content.visualElements && (
          <div className="mb-4 p-3 bg-gray-50 rounded-md">
            <h5 className="text-sm font-medium text-gray-900 mb-2 flex items-center">
              <Palette className="w-4 h-4 mr-1" />
              Elementos Visuais
            </h5>
            
            {/* Colors */}
            {content.content.visualElements.colors.length > 0 && (
              <div className="mb-2">
                <span className="text-xs text-gray-600 block mb-1">Cores:</span>
                <div className="flex space-x-1">
                  {content.content.visualElements.colors.map((color, idx) => (
                    <div
                      key={idx}
                      className="w-6 h-6 rounded border border-gray-300"
                      style={{ backgroundColor: color }}
                      title={color}
                    />
                  ))}
                </div>
              </div>
            )}

            {/* Fonts */}
            {content.content.visualElements.fonts.length > 0 && (
              <div className="mb-2">
                <span className="text-xs text-gray-600 block mb-1">Fontes:</span>
                <div className="flex flex-wrap gap-1">
                  {content.content.visualElements.fonts.map((font, idx) => (
                    <span 
                      key={idx}
                      className="text-xs bg-gray-200 text-gray-700 px-2 py-1 rounded"
                    >
                      {font}
                    </span>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}

        {/* Metrics */}
        <div className="border-t border-gray-200 pt-3">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <ScoreIndicator 
              score={content.metadata.personalizationScore}
              label="Personalização"
              icon={Star}
            />
            <ScoreIndicator 
              score={content.metadata.complianceScore}
              label="Compliance"
              icon={Shield}
            />
            <ScoreIndicator 
              score={content.metadata.estimatedPerformance}
              label="Performance Est."
              icon={TrendingUp}
            />
          </div>
        </div>
      </div>
    </div>
  );
};

const PreviewDisplay: React.FC<PreviewDisplayProps> = ({
  preview,
  showOriginal,
  currentChannel,
  onTogglePreview,
  onExport,
  loading = false
}) => {
  const currentContent = showOriginal ? preview.original : preview.personalized;
  const title = showOriginal ? 'Template Original' : 'Template Personalizado';

  return (
    <div className="space-y-6">
      {/* Controls */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <button
            onClick={onTogglePreview}
            className={`inline-flex items-center px-4 py-2 border border-gray-300 rounded-md text-sm font-medium transition-colors ${
              showOriginal 
                ? 'bg-gray-100 text-gray-700' 
                : 'bg-blue-50 text-blue-700 border-blue-300'
            }`}
          >
            {showOriginal ? <EyeOff className="w-4 h-4 mr-2" /> : <Eye className="w-4 h-4 mr-2" />}
            {showOriginal ? 'Mostrar Personalizado' : 'Mostrar Original'}
          </button>

          <div className="flex items-center space-x-2 text-sm text-gray-600">
            <Clock className="w-4 h-4" />
            <span>Canal: {currentChannel}</span>
          </div>
        </div>

        <div className="flex items-center space-x-2">
          <button
            onClick={() => onExport('pdf')}
            disabled={loading}
            className="inline-flex items-center px-3 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50"
          >
            <Download className="w-4 h-4 mr-2" />
            PDF
          </button>
          <button
            onClick={() => onExport('docx')}
            disabled={loading}
            className="inline-flex items-center px-3 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50"
          >
            <Download className="w-4 h-4 mr-2" />
            DOCX
          </button>
        </div>
      </div>

      {/* Main Preview */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Current View */}
        <div className="lg:col-span-1">
          <ContentSection
            title={title}
            content={currentContent}
            isPersonalized={!showOriginal}
            channel={currentChannel}
          />
        </div>

        {/* Changes and Recommendations */}
        <div className="lg:col-span-1 space-y-4">
          {/* Changes Made */}
          {preview.changes.length > 0 && (
            <div className="bg-white rounded-lg border border-gray-200 p-4">
              <h4 className="font-medium text-gray-900 mb-3 flex items-center">
                <Type className="w-4 h-4 mr-2" />
                Alterações Realizadas
              </h4>
              <div className="space-y-3">
                {preview.changes.map((change, idx) => (
                  <div key={idx} className="border-l-4 border-blue-400 pl-3">
                    <div className="text-sm font-medium text-gray-900">
                      {change.field}
                    </div>
                    <div className="text-xs text-gray-600 mt-1">
                      {change.reason}
                    </div>
                    <div className="mt-2 text-xs">
                      <div className="text-red-600 line-through">
                        {change.original.substring(0, 100)}...
                      </div>
                      <div className="text-green-600">
                        {change.personalized.substring(0, 100)}...
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Recommendations */}
          {preview.recommendations.length > 0 && (
            <div className="bg-white rounded-lg border border-gray-200 p-4">
              <h4 className="font-medium text-gray-900 mb-3 flex items-center">
                <Star className="w-4 h-4 mr-2" />
                Recomendações
              </h4>
              <ul className="space-y-2">
                {preview.recommendations.map((recommendation, idx) => (
                  <li key={idx} className="flex items-start space-x-2">
                    <div className="w-1.5 h-1.5 bg-blue-600 rounded-full mt-2 flex-shrink-0" />
                    <span className="text-sm text-gray-700">{recommendation}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>
      </div>

      {/* Loading Overlay */}
      {loading && (
        <div className="absolute inset-0 bg-white bg-opacity-75 flex items-center justify-center">
          <div className="flex items-center space-x-2">
            <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600"></div>
            <span className="text-sm text-gray-600">Gerando preview...</span>
          </div>
        </div>
      )}
    </div>
  );
};

export default PreviewDisplay;