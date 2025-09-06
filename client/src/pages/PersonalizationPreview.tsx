import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { 
  ArrowLeft, 
  Download, 
  Share2, 
  Save, 
  Eye,
  Settings,
  Monitor,
  RefreshCw,
  AlertCircle,
  CheckCircle
} from 'lucide-react';
import { usePersonalizationPreview } from '../hooks/usePersonalizationPreview';
import PreviewDisplay from '../components/preview/PreviewDisplay';
import SettingsPanel from '../components/preview/SettingsPanel';
import ChannelSelector from '../components/preview/ChannelSelector';

// Mock settings type matching the SettingsPanel component
interface PersonalizationSettings {
  intensity: number;
  preserveStructure: boolean;
  visualAdaptation: boolean;
  toneAdjustment: number;
  creativityLevel: number;
  brandConsistency: number;
  channelOptimization: boolean;
  customInstructions: string;
}

interface PersonalizationPreviewPageProps {}

const PersonalizationPreviewPage: React.FC<PersonalizationPreviewPageProps> = () => {
  const { templateId } = useParams<{ templateId: string }>();
  const navigate = useNavigate();
  
  const [activeTab, setActiveTab] = useState<'preview' | 'settings' | 'channels'>('preview');
  const [showOriginal, setShowOriginal] = useState(false);
  const [isGenerating, setIsGenerating] = useState(false);

  const {
    preview,
    settings: hookSettings,
    currentChannel,
    loading,
    error,
    availableChannels,
    generatePreview,
    setChannel,
    togglePreview,
    updateSettings,
    regenerateWithSettings,
    exportPreview,
    clearPreview
  } = usePersonalizationPreview();

  // Convert hook settings to component expected format
  const settingsForPanel = {
    intensity: hookSettings.intensity,
    preserveStructure: hookSettings.preserveStructure,
    visualAdaptation: hookSettings.adaptVisuals || false,
    toneAdjustment: 50, // Default value
    creativityLevel: 50, // Default value
    brandConsistency: 80, // Default value
    channelOptimization: true, // Default value
    customInstructions: '', // Default value
  };

  // Mock presets for now
  const presets: Array<{ name: string; settings: PersonalizationSettings }> = [];

  // Generate preview on mount
  useEffect(() => {
    if (templateId && !preview) {
      generatePreview(templateId, 'default-brand-voice');
    }
  }, [templateId]);

  // Auto-focus on preview tab when preview is ready
  useEffect(() => {
    if (preview && activeTab !== 'preview') {
      setActiveTab('preview');
    }
  }, [preview]);

  const handleRegeneratePreview = async () => {
    if (templateId) {
      setIsGenerating(true);
      try {
        await regenerateWithSettings();
      } finally {
        setIsGenerating(false);
      }
    }
  };

  const handleChangeChannel = (channelId: string) => {
    setChannel(channelId);
  };

  const handleResetSettings = () => {
    // Reset settings to default values
    const defaultSettings = {
      intensity: 50,
      preserveStructure: true,
      adaptVisuals: false,
      customizeLanguage: true,
      applyBrandColors: true,
      adjustTone: true,
      includePersonality: true,
    };
    updateSettings(defaultSettings);
  };

  const handleSavePreset = async () => {
    const presetName = prompt('Nome do preset:');
    if (presetName) {
      // Save preset logic would go here
      console.log('Save preset:', presetName);
    }
  };

  const handleLoadPreset = (presetName: string) => {
    // Load preset logic would go here
    console.log('Load preset:', presetName);
  };

  const handleSettingsChange = (newSettings: PersonalizationSettings) => {
    // Convert component settings to hook format
    updateSettings({
      intensity: newSettings.intensity,
      preserveStructure: newSettings.preserveStructure,
      adaptVisuals: newSettings.visualAdaptation,
      customizeLanguage: true,
      applyBrandColors: true,
      adjustTone: true,
      includePersonality: true,
    });
  };

  const handleExport = async (format: 'pdf' | 'docx') => {
    try {
      await exportPreview(format);
    } catch (error) {
      console.error('Export failed:', error);
    }
  };

  const handleShare = async () => {
    if (navigator.share && preview) {
      try {
        await navigator.share({
          title: 'Preview de Template Personalizado',
          text: `Confira este template personalizado: ${preview.personalized.content.title}`,
          url: window.location.href
        });
      } catch (error) {
        // Fallback to copy to clipboard
        navigator.clipboard.writeText(window.location.href);
        alert('Link copiado para a área de transferência!');
      }
    } else {
      // Fallback to copy to clipboard
      navigator.clipboard.writeText(window.location.href);
      alert('Link copiado para a área de transferência!');
    }
  };

  if (!templateId) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <AlertCircle className="w-12 h-12 text-red-500 mx-auto mb-4" />
          <h1 className="text-xl font-semibold text-gray-900 mb-2">
            Template não encontrado
          </h1>
          <p className="text-gray-600 mb-4">
            O ID do template não foi fornecido ou é inválido.
          </p>
          <button
            onClick={() => navigate('/biblioteca')}
            className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Voltar à Biblioteca
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200 sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            {/* Left side */}
            <div className="flex items-center space-x-4">
              <button
                onClick={() => navigate('/biblioteca')}
                className="inline-flex items-center px-3 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 bg-white hover:bg-gray-50"
              >
                <ArrowLeft className="w-4 h-4 mr-2" />
                Voltar
              </button>
              
              <div>
                <h1 className="text-xl font-semibold text-gray-900">
                  Preview de Personalização
                </h1>
                <p className="text-sm text-gray-600">
                  Template: {templateId} • Canal: {currentChannel}
                </p>
              </div>
            </div>

            {/* Right side */}
            <div className="flex items-center space-x-3">
              <button
                onClick={handleRegeneratePreview}
                disabled={loading || isGenerating}
                className="inline-flex items-center px-3 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50"
              >
                <RefreshCw className={`w-4 h-4 mr-2 ${isGenerating ? 'animate-spin' : ''}`} />
                Regenerar
              </button>

              <button
                onClick={handleShare}
                disabled={!preview}
                className="inline-flex items-center px-3 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50"
              >
                <Share2 className="w-4 h-4 mr-2" />
                Compartilhar
              </button>

              <button
                onClick={() => handleExport('pdf')}
                disabled={loading || !preview}
                className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-md text-sm font-medium hover:bg-blue-700 disabled:opacity-50"
              >
                <Download className="w-4 h-4 mr-2" />
                Exportar
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        {/* Error State */}
        {error && (
          <div className="mb-6 bg-red-50 border border-red-200 rounded-md p-4">
            <div className="flex items-center">
              <AlertCircle className="w-5 h-5 text-red-500 mr-2" />
              <div>
                <h3 className="text-sm font-medium text-red-800">
                  Erro ao carregar preview
                </h3>
                <p className="text-sm text-red-700 mt-1">
                  {error}
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Tab Navigation */}
        <div className="mb-6">
          <nav className="flex space-x-8">
            <button
              onClick={() => setActiveTab('preview')}
              className={`flex items-center space-x-2 py-2 px-1 border-b-2 font-medium text-sm ${
                activeTab === 'preview'
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              <Eye className="w-4 h-4" />
              <span>Preview</span>
              {preview && (
                <CheckCircle className="w-4 h-4 text-green-500" />
              )}
            </button>

            <button
              onClick={() => setActiveTab('settings')}
              className={`flex items-center space-x-2 py-2 px-1 border-b-2 font-medium text-sm ${
                activeTab === 'settings'
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              <Settings className="w-4 h-4" />
              <span>Configurações</span>
            </button>

            <button
              onClick={() => setActiveTab('channels')}
              className={`flex items-center space-x-2 py-2 px-1 border-b-2 font-medium text-sm ${
                activeTab === 'channels'
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              <Monitor className="w-4 h-4" />
              <span>Canais</span>
            </button>
          </nav>
        </div>

        {/* Tab Content */}
        <div className="space-y-6">
          {activeTab === 'preview' && (
            <div className="grid grid-cols-1 xl:grid-cols-4 gap-6">
              {/* Main Preview */}
              <div className="xl:col-span-3">
                {preview ? (
                  <PreviewDisplay
                    preview={preview}
                    showOriginal={showOriginal}
                    currentChannel={currentChannel}
                    onTogglePreview={() => setShowOriginal(!showOriginal)}
                    onExport={handleExport}
                    loading={isGenerating}
                  />
                ) : loading ? (
                  <div className="bg-white rounded-lg border border-gray-200 p-8 text-center">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
                    <p className="text-gray-600">Gerando preview personalizado...</p>
                  </div>
                ) : (
                  <div className="bg-white rounded-lg border border-gray-200 p-8 text-center">
                    <Eye className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                    <h3 className="text-lg font-medium text-gray-900 mb-2">
                      Nenhum preview disponível
                    </h3>
                    <p className="text-gray-600 mb-4">
                      Configure as opções de personalização e selecione um canal para gerar o preview.
                    </p>
                    <button
                      onClick={handleRegeneratePreview}
                      className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
                    >
                      <RefreshCw className="w-4 h-4 mr-2" />
                      Gerar Preview
                    </button>
                  </div>
                )}
              </div>

              {/* Quick Settings Sidebar */}
              <div className="xl:col-span-1">
                <div className="bg-white rounded-lg border border-gray-200 p-4 space-y-4">
                  <h4 className="font-medium text-gray-900">Configurações Rápidas</h4>
                  
                  <div className="space-y-3">
                    <div>
                      <label className="text-sm font-medium text-gray-700 mb-1 block">
                        Intensidade: {settingsForPanel.intensity}%
                      </label>
                      <input
                        type="range"
                        min="0"
                        max="100"
                        value={settingsForPanel.intensity}
                        onChange={(e) => handleSettingsChange({ 
                          ...settingsForPanel, 
                          intensity: Number(e.target.value) 
                        })}
                        className="w-full"
                      />
                    </div>

                    <div>
                      <label className="text-sm font-medium text-gray-700 mb-1 block">
                        Canal Atual
                      </label>
                      <select
                        value={currentChannel}
                        onChange={(e) => handleChangeChannel(e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm"
                      >
                        <option value="email-newsletter">Newsletter</option>
                        <option value="social-instagram-post">Instagram</option>
                        <option value="web-landing-page">Landing Page</option>
                        <option value="print-flyer">Flyer</option>
                        <option value="video-youtube">YouTube</option>
                      </select>
                    </div>

                    <button
                      onClick={() => setActiveTab('settings')}
                      className="w-full inline-flex items-center justify-center px-3 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 bg-white hover:bg-gray-50"
                    >
                      <Settings className="w-4 h-4 mr-2" />
                      Configurações Avançadas
                    </button>
                  </div>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'settings' && (
            <SettingsPanel
              settings={settingsForPanel}
              onSettingsChange={handleSettingsChange}
              onReset={handleResetSettings}
              onSavePreset={handleSavePreset}
              onLoadPreset={handleLoadPreset}
              presets={presets}
              loading={loading || isGenerating}
            />
          )}

          {activeTab === 'channels' && (
            <ChannelSelector
              selectedChannel={currentChannel}
              onChannelChange={handleChangeChannel}
              loading={loading}
            />
          )}
        </div>
      </div>
    </div>
  );
};

export default PersonalizationPreviewPage;