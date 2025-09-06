/**
 * Hook para gerenciar preview de personalização de templates
 * 
 * Funcionalidades:
 * - Preview em tempo real de templates personalizados
 * - Toggle entre versão original e personalizada
 * - Visualização por canal (email, social, web)
 * - Ajustes fine-tuning de personalização
 * - Cache de previews gerados
 */

import { useState, useEffect, useCallback, useMemo } from 'react';
import { useDebounce } from './useDebounce';

interface BrandVoice {
  id: string;
  name: string;
  brand: {
    name: string;
    description: string;
    personality: string[];
    values: string[];
  };
  voice: {
    tone: {
      primary: string;
      secondary: string[];
      avoid: string[];
    };
    style: {
      formality: string;
      energy: string;
      friendliness: string;
    };
  };
  visual: {
    colors: {
      primary: string;
      secondary: string[];
      accent: string;
    };
    fonts: {
      primary: string;
      secondary: string;
    };
  };
  channels: {
    [key: string]: {
      preferences: any;
      adaptations: any;
    };
  };
}

interface Template {
  id: string;
  name: string;
  description: string;
  category: string;
  serviceType: string;
  contentPieces: any[];
  visualAssets: any[];
  isPremium: boolean;
}

interface PersonalizationSettings {
  intensity: number; // 0-100
  preserveStructure: boolean;
  adaptVisuals: boolean;
  customizeLanguage: boolean;
  applyBrandColors: boolean;
  adjustTone: boolean;
  includePersonality: boolean;
}

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

interface UsePersonalizationPreviewReturn {
  preview: PersonalizationPreview | null;
  loading: boolean;
  error: string | null;
  currentChannel: string;
  showOriginal: boolean;
  settings: PersonalizationSettings;
  availableChannels: string[];
  // Actions
  generatePreview: (templateId: string, brandVoiceId: string) => Promise<void>;
  setChannel: (channel: string) => void;
  togglePreview: () => void;
  updateSettings: (newSettings: Partial<PersonalizationSettings>) => void;
  regenerateWithSettings: () => Promise<void>;
  exportPreview: (format: 'pdf' | 'docx') => Promise<void>;
  clearPreview: () => void;
}

const DEFAULT_SETTINGS: PersonalizationSettings = {
  intensity: 80,
  preserveStructure: true,
  adaptVisuals: true,
  customizeLanguage: true,
  applyBrandColors: true,
  adjustTone: true,
  includePersonality: true,
};

const AVAILABLE_CHANNELS = ['email', 'social', 'web', 'print', 'video'];

export function usePersonalizationPreview(): UsePersonalizationPreviewReturn {
  // State
  const [preview, setPreview] = useState<PersonalizationPreview | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [currentChannel, setCurrentChannel] = useState('email');
  const [showOriginal, setShowOriginal] = useState(false);
  const [settings, setSettings] = useState<PersonalizationSettings>(DEFAULT_SETTINGS);
  const [currentTemplate, setCurrentTemplate] = useState<string | null>(null);
  const [currentBrandVoice, setCurrentBrandVoice] = useState<string | null>(null);

  // Debounced settings for real-time updates
  const debouncedSettings = useDebounce(settings, 500);

  // Available channels
  const availableChannels = useMemo(() => AVAILABLE_CHANNELS, []);

  // Generate preview
  const generatePreview = useCallback(async (templateId: string, brandVoiceId: string) => {
    setLoading(true);
    setError(null);
    setCurrentTemplate(templateId);
    setCurrentBrandVoice(brandVoiceId);

    try {
      const response = await fetch('/api/templates/personalize/preview', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          templateId,
          brandVoiceId,
          channel: currentChannel,
          settings: debouncedSettings,
        }),
      });

      if (!response.ok) {
        throw new Error(`Erro ao gerar preview: ${response.statusText}`);
      }

      const data = await response.json();
      setPreview(data.preview);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erro desconhecido');
      setPreview(null);
    } finally {
      setLoading(false);
    }
  }, [currentChannel, debouncedSettings]);

  // Set channel
  const setChannel = useCallback((channel: string) => {
    setCurrentChannel(channel);
  }, []);

  // Toggle between original and personalized
  const togglePreview = useCallback(() => {
    setShowOriginal(prev => !prev);
  }, []);

  // Update settings
  const updateSettings = useCallback((newSettings: Partial<PersonalizationSettings>) => {
    setSettings(prev => ({ ...prev, ...newSettings }));
  }, []);

  // Regenerate with current settings
  const regenerateWithSettings = useCallback(async () => {
    if (currentTemplate && currentBrandVoice) {
      await generatePreview(currentTemplate, currentBrandVoice);
    }
  }, [currentTemplate, currentBrandVoice, generatePreview]);

  // Export preview
  const exportPreview = useCallback(async (format: 'pdf' | 'docx') => {
    if (!preview) {
      setError('Nenhum preview disponível para exportar');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const response = await fetch('/api/templates/personalize/export', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          preview,
          format,
          channel: currentChannel,
          includeOriginal: true,
        }),
      });

      if (!response.ok) {
        throw new Error(`Erro ao exportar preview: ${response.statusText}`);
      }

      // Download the file
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `template-preview-${currentChannel}.${format}`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);

    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erro ao exportar preview');
    } finally {
      setLoading(false);
    }
  }, [preview, currentChannel]);

  // Clear preview
  const clearPreview = useCallback(() => {
    setPreview(null);
    setCurrentTemplate(null);
    setCurrentBrandVoice(null);
    setError(null);
  }, []);

  // Auto-regenerate when channel changes
  useEffect(() => {
    if (currentTemplate && currentBrandVoice && preview) {
      generatePreview(currentTemplate, currentBrandVoice);
    }
  }, [currentChannel]);

  // Auto-regenerate when settings change (debounced)
  useEffect(() => {
    if (currentTemplate && currentBrandVoice && preview) {
      regenerateWithSettings();
    }
  }, [debouncedSettings]);

  // Clear error after 5 seconds
  useEffect(() => {
    if (error) {
      const timer = setTimeout(() => setError(null), 5000);
      return () => clearTimeout(timer);
    }
  }, [error]);

  return {
    preview,
    loading,
    error,
    currentChannel,
    showOriginal,
    settings,
    availableChannels,
    generatePreview,
    setChannel,
    togglePreview,
    updateSettings,
    regenerateWithSettings,
    exportPreview,
    clearPreview,
  };
}