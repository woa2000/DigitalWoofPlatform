import React from 'react';
import { 
  Settings,
  Sliders,
  Palette,
  Type,
  Image,
  MessageSquare,
  Eye,
  RotateCcw,
  Save,
  Download,
  Info
} from 'lucide-react';

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

interface SettingsPanelProps {
  settings: PersonalizationSettings;
  onSettingsChange: (settings: PersonalizationSettings) => void;
  onReset: () => void;
  onSavePreset: () => void;
  onLoadPreset: (presetName: string) => void;
  presets: Array<{ name: string; settings: PersonalizationSettings }>;
  loading?: boolean;
  disabled?: boolean;
}

const SliderControl: React.FC<{
  label: string;
  value: number;
  onChange: (value: number) => void;
  min?: number;
  max?: number;
  step?: number;
  icon?: React.ComponentType<any>;
  description?: string;
  disabled?: boolean;
}> = ({ 
  label, 
  value, 
  onChange, 
  min = 0, 
  max = 100, 
  step = 1, 
  icon: Icon,
  description,
  disabled = false
}) => {
  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-2">
          {Icon && <Icon className="w-4 h-4 text-gray-500" />}
          <label className="text-sm font-medium text-gray-700">
            {label}
          </label>
        </div>
        <span className="text-sm text-gray-500 font-mono">
          {value}%
        </span>
      </div>
      
      <input
        type="range"
        min={min}
        max={max}
        step={step}
        value={value}
        onChange={(e) => onChange(Number(e.target.value))}
        disabled={disabled}
        className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer slider"
      />
      
      {description && (
        <p className="text-xs text-gray-500 mt-1">
          {description}
        </p>
      )}
    </div>
  );
};

const ToggleControl: React.FC<{
  label: string;
  checked: boolean;
  onChange: (checked: boolean) => void;
  icon?: React.ComponentType<any>;
  description?: string;
  disabled?: boolean;
}> = ({ label, checked, onChange, icon: Icon, description, disabled = false }) => {
  return (
    <div className="flex items-center justify-between">
      <div className="flex-1">
        <div className="flex items-center space-x-2">
          {Icon && <Icon className="w-4 h-4 text-gray-500" />}
          <label className="text-sm font-medium text-gray-700">
            {label}
          </label>
        </div>
        {description && (
          <p className="text-xs text-gray-500 mt-1">
            {description}
          </p>
        )}
      </div>
      
      <button
        type="button"
        onClick={() => onChange(!checked)}
        disabled={disabled}
        className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 ${
          checked ? 'bg-blue-600' : 'bg-gray-200'
        } ${disabled ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}`}
      >
        <span
          className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
            checked ? 'translate-x-6' : 'translate-x-1'
          }`}
        />
      </button>
    </div>
  );
};

const PresetSelector: React.FC<{
  presets: Array<{ name: string; settings: PersonalizationSettings }>;
  onLoadPreset: (presetName: string) => void;
  disabled?: boolean;
}> = ({ presets, onLoadPreset, disabled = false }) => {
  return (
    <div className="space-y-2">
      <label className="text-sm font-medium text-gray-700 flex items-center">
        <Save className="w-4 h-4 mr-2" />
        Presets Salvos
      </label>
      
      <select
        onChange={(e) => e.target.value && onLoadPreset(e.target.value)}
        disabled={disabled}
        className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 disabled:bg-gray-100 disabled:cursor-not-allowed"
        defaultValue=""
      >
        <option value="">Selecionar preset...</option>
        {presets.map((preset) => (
          <option key={preset.name} value={preset.name}>
            {preset.name}
          </option>
        ))}
      </select>
    </div>
  );
};

const SettingsPanel: React.FC<SettingsPanelProps> = ({
  settings,
  onSettingsChange,
  onReset,
  onSavePreset,
  onLoadPreset,
  presets,
  loading = false,
  disabled = false
}) => {
  const handleSettingChange = <K extends keyof PersonalizationSettings>(
    key: K,
    value: PersonalizationSettings[K]
  ) => {
    onSettingsChange({
      ...settings,
      [key]: value
    });
  };

  return (
    <div className="bg-white rounded-lg border border-gray-200 p-4 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between border-b border-gray-200 pb-3">
        <div className="flex items-center space-x-2">
          <Settings className="w-5 h-5 text-gray-600" />
          <h3 className="text-lg font-medium text-gray-900">
            Configurações de Personalização
          </h3>
        </div>
        
        <div className="flex items-center space-x-2">
          <button
            onClick={onReset}
            disabled={disabled || loading}
            className="inline-flex items-center px-3 py-1 border border-gray-300 rounded-md text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <RotateCcw className="w-4 h-4 mr-1" />
            Reset
          </button>
          
          <button
            onClick={onSavePreset}
            disabled={disabled || loading}
            className="inline-flex items-center px-3 py-1 bg-blue-600 text-white rounded-md text-sm font-medium hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <Save className="w-4 h-4 mr-1" />
            Salvar
          </button>
        </div>
      </div>

      {/* Preset Selector */}
      {presets.length > 0 && (
        <PresetSelector
          presets={presets}
          onLoadPreset={onLoadPreset}
          disabled={disabled || loading}
        />
      )}

      {/* Core Settings */}
      <div className="space-y-4">
        <h4 className="text-sm font-semibold text-gray-900 flex items-center">
          <Sliders className="w-4 h-4 mr-2" />
          Configurações Principais
        </h4>

        <SliderControl
          label="Intensidade da Personalização"
          value={settings.intensity}
          onChange={(value) => handleSettingChange('intensity', value)}
          icon={Type}
          description="Controla o quanto o conteúdo será modificado para refletir a voz da marca"
          disabled={disabled || loading}
        />

        <SliderControl
          label="Ajuste de Tom"
          value={settings.toneAdjustment}
          onChange={(value) => handleSettingChange('toneAdjustment', value)}
          icon={MessageSquare}
          description="Ajusta o tom de voz para ser mais formal (0%) ou casual (100%)"
          disabled={disabled || loading}
        />

        <SliderControl
          label="Nível de Criatividade"
          value={settings.creativityLevel}
          onChange={(value) => handleSettingChange('creativityLevel', value)}
          icon={Palette}
          description="Controla a criatividade nas adaptações de conteúdo"
          disabled={disabled || loading}
        />

        <SliderControl
          label="Consistência da Marca"
          value={settings.brandConsistency}
          onChange={(value) => handleSettingChange('brandConsistency', value)}
          icon={Eye}
          description="Garante aderência rigorosa às diretrizes da marca"
          disabled={disabled || loading}
        />
      </div>

      {/* Advanced Settings */}
      <div className="space-y-4">
        <h4 className="text-sm font-semibold text-gray-900 flex items-center">
          <Settings className="w-4 h-4 mr-2" />
          Configurações Avançadas
        </h4>

        <ToggleControl
          label="Preservar Estrutura"
          checked={settings.preserveStructure}
          onChange={(checked) => handleSettingChange('preserveStructure', checked)}
          icon={Type}
          description="Mantém a estrutura original do template (seções, parágrafos, etc.)"
          disabled={disabled || loading}
        />

        <ToggleControl
          label="Adaptação Visual"
          checked={settings.visualAdaptation}
          onChange={(checked) => handleSettingChange('visualAdaptation', checked)}
          icon={Image}
          description="Adapta elementos visuais (cores, fontes) para a identidade da marca"
          disabled={disabled || loading}
        />

        <ToggleControl
          label="Otimização por Canal"
          checked={settings.channelOptimization}
          onChange={(checked) => handleSettingChange('channelOptimization', checked)}
          icon={Download}
          description="Otimiza o conteúdo para o canal específico selecionado"
          disabled={disabled || loading}
        />
      </div>

      {/* Custom Instructions */}
      <div className="space-y-2">
        <label className="text-sm font-medium text-gray-700 flex items-center">
          <MessageSquare className="w-4 h-4 mr-2" />
          Instruções Personalizadas
        </label>
        
        <textarea
          value={settings.customInstructions}
          onChange={(e) => handleSettingChange('customInstructions', e.target.value)}
          placeholder="Instruções específicas para a personalização (ex: 'Usar mais emojis', 'Focar em benefícios', etc.)"
          disabled={disabled || loading}
          className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 disabled:bg-gray-100 disabled:cursor-not-allowed"
          rows={3}
        />
      </div>

      {/* Info Panel */}
      <div className="bg-blue-50 border border-blue-200 rounded-md p-3">
        <div className="flex items-start space-x-2">
          <Info className="w-4 h-4 text-blue-600 mt-0.5 flex-shrink-0" />
          <div className="text-xs text-blue-800">
            <p className="font-medium mb-1">Dica:</p>
            <p>
              As alterações são aplicadas em tempo real. Use configurações mais baixas para 
              mudanças sutis ou mais altas para transformações significativas.
            </p>
          </div>
        </div>
      </div>

      {/* Loading Overlay */}
      {loading && (
        <div className="absolute inset-0 bg-white bg-opacity-75 flex items-center justify-center rounded-lg">
          <div className="flex items-center space-x-2">
            <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-blue-600"></div>
            <span className="text-sm text-gray-600">Aplicando configurações...</span>
          </div>
        </div>
      )}
    </div>
  );
};

export default SettingsPanel;