// T-001: Manual Data Model and Rendering - Data Hook
// Manual de Marca Digital Data Management

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useState, useCallback, useMemo } from 'react';
import { 
  RenderedManual, 
  ManualSection, 
  ManualDisplayConfig, 
  SharingConfig,
  ExportOptions,
  ExportResult,
  ManualErrorContext,
  ManualCacheKey,
  ValidationResult
} from '../../../shared/types/manual';
import { BrandVoice } from '../../../shared/types/brand-voice';

// API Functions
const manualAPI = {
  // Fetch complete manual for user
  getManual: async (userId: string, brandVoiceId?: string): Promise<RenderedManual> => {
    const params = new URLSearchParams({ userId });
    if (brandVoiceId) params.append('brandVoiceId', brandVoiceId);
    
    const response = await fetch(`/api/manual-marca?${params}`);
    if (!response.ok) {
      throw new Error(`Failed to fetch manual: ${response.statusText}`);
    }
    
    const data = await response.json();
    return data.data.manual;
  },

  // Update display configuration
  updateDisplayConfig: async (manualId: string, config: Partial<ManualDisplayConfig>): Promise<void> => {
    const response = await fetch(`/api/manual-marca/${manualId}/config`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(config),
    });
    
    if (!response.ok) {
      throw new Error(`Failed to update config: ${response.statusText}`);
    }
  },

  // Update sharing settings
  updateSharing: async (manualId: string, sharing: Partial<SharingConfig>): Promise<SharingConfig> => {
    const response = await fetch(`/api/manual-marca/${manualId}/sharing`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(sharing),
    });
    
    if (!response.ok) {
      throw new Error(`Failed to update sharing: ${response.statusText}`);
    }
    
    const data = await response.json();
    return data.data;
  },

  // Export manual
  exportManual: async (userId: string, options: ExportOptions): Promise<ExportResult> => {
    const response = await fetch('/api/manual-marca/export', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ userId, ...options }),
    });
    
    if (!response.ok) {
      throw new Error(`Failed to export manual: ${response.statusText}`);
    }
    
    const data = await response.json();
    return data.data;
  },

  // Validate manual content
  validateManual: async (manual: RenderedManual): Promise<ValidationResult> => {
    const response = await fetch('/api/manual-marca/validate', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ manual }),
    });
    
    if (!response.ok) {
      throw new Error(`Failed to validate manual: ${response.statusText}`);
    }
    
    const data = await response.json();
    return data.data;
  }
};

// Cache key factory
const createCacheKey = (userId: string, brandVoiceId?: string): ManualCacheKey => ({
  userId,
  brandVoiceId: brandVoiceId || 'default',
  version: '1.0',
  sections: ['visual', 'voice', 'language', 'compliance']
});

// Query key factory
const queryKeys = {
  manual: (userId: string, brandVoiceId?: string) => 
    ['manual', userId, brandVoiceId || 'default'],
  validation: (manualId: string) => 
    ['manual-validation', manualId],
  exports: (userId: string) => 
    ['manual-exports', userId],
};

// Main hook for manual data management
export function useManualData(userId: string, brandVoiceId?: string) {
  const queryClient = useQueryClient();
  const [currentSection, setCurrentSection] = useState<ManualSection>('visual');
  const [error, setError] = useState<ManualErrorContext | null>(null);

  // Cache management
  const cacheKey = useMemo(() => 
    createCacheKey(userId, brandVoiceId), 
    [userId, brandVoiceId]
  );

  // Fetch manual data
  const {
    data: manual,
    isPending: isLoading,
    error: queryError,
    refetch,
    isFetching
  } = useQuery({
    queryKey: queryKeys.manual(userId, brandVoiceId),
    queryFn: () => manualAPI.getManual(userId, brandVoiceId),
    enabled: !!(userId && brandVoiceId),
    staleTime: 5 * 60 * 1000, // 5 minutes
    gcTime: 30 * 60 * 1000, // 30 minutes (renamed from cacheTime)
    retry: 1, // Reduce retries for demo
    retryDelay: attemptIndex => Math.min(1000 * 2 ** attemptIndex, 30000),
    // For demo, return mock data on error
    placeholderData: () => createMockManual(userId, brandVoiceId || 'default')
  });

  // Validate manual
  const {
    data: validation,
    isLoading: isValidating,
    refetch: revalidate
  } = useQuery({
    queryKey: queryKeys.validation(manual?.id || ''),
    queryFn: () => manualAPI.validateManual(manual!),
    enabled: !!manual,
    staleTime: 10 * 60 * 1000, // 10 minutes
  });

  // Update display config mutation
  const updateConfigMutation = useMutation({
    mutationFn: (config: Partial<ManualDisplayConfig>) => 
      manualAPI.updateDisplayConfig(manual!.id, config),
    onSuccess: () => {
      queryClient.invalidateQueries({ 
        queryKey: queryKeys.manual(userId, brandVoiceId) 
      });
    },
    onError: (err: Error) => {
      setError({
        error_type: 'MANUAL_GENERATION_FAILED',
        message: `Failed to update configuration: ${err.message}`,
        user_id: userId,
        timestamp: new Date().toISOString()
      });
    }
  });

  // Update sharing mutation
  const updateSharingMutation = useMutation({
    mutationFn: (sharing: Partial<SharingConfig>) => 
      manualAPI.updateSharing(manual!.id, sharing),
    onSuccess: (updatedSharing) => {
      // Optimistically update cache
      queryClient.setQueryData(
        queryKeys.manual(userId, brandVoiceId),
        (old: RenderedManual | undefined) => 
          old ? { ...old, sharing: { ...old.sharing, ...updatedSharing } } : old
      );
    },
    onError: (err: Error) => {
      setError({
        error_type: 'SHARING_ACCESS_DENIED',
        message: `Failed to update sharing: ${err.message}`,
        user_id: userId,
        timestamp: new Date().toISOString()
      });
    }
  });

  // Export manual mutation
  const exportMutation = useMutation({
    mutationFn: (options: ExportOptions) => 
      manualAPI.exportManual(userId, options),
    onError: (err: Error) => {
      setError({
        error_type: 'EXPORT_GENERATION_FAILED',
        message: `Failed to export manual: ${err.message}`,
        user_id: userId,
        timestamp: new Date().toISOString()
      });
    }
  });

  // Transform Brand Voice JSON to Rendered Manual structure
  const processManualData = useCallback((brandVoice: BrandVoice, manual: RenderedManual) => {
    // Enrich manual data with processed Brand Voice information
    const processed = {
      ...manual,
      sections: {
        visual: {
          ...manual.sections.visual,
          palette: {
            ...manual.sections.visual.palette,
            accessibility: calculateAccessibility(manual.sections.visual.palette)
          }
        },
        voice: {
          ...manual.sections.voice,
          personality: {
            ...manual.sections.voice.personality,
            radar_data: processRadarData(brandVoice.voice)
          }
        },
        language: {
          ...manual.sections.language,
          glossary: {
            ...manual.sections.language.glossary,
            searchable_index: buildSearchIndex(manual.sections.language.glossary)
          }
        },
        compliance: {
          ...manual.sections.compliance,
          checklist: {
            ...manual.sections.compliance.checklist,
            compliance_score: calculateComplianceScore(manual.sections.compliance)
          }
        }
      },
      quality: {
        ...manual.quality,
        completeness_score: calculateCompletenessScore(manual),
        consistency_warnings: validateConsistency(manual),
        improvement_suggestions: generateSuggestions(manual)
      }
    };

    return processed;
  }, []);

  // Section-specific data getters
  const getSectionData = useCallback((section: ManualSection) => {
    if (!manual) return null;
    return manual.sections[section];
  }, [manual]);

  // Navigation helpers
  const navigateToSection = useCallback((section: ManualSection) => {
    setCurrentSection(section);
    setError(null); // Clear errors when navigating
  }, []);

  const getNextSection = useCallback((): ManualSection | null => {
    const sections: ManualSection[] = ['visual', 'voice', 'language', 'compliance'];
    const currentIndex = sections.indexOf(currentSection);
    return currentIndex < sections.length - 1 ? sections[currentIndex + 1] : null;
  }, [currentSection]);

  const getPreviousSection = useCallback((): ManualSection | null => {
    const sections: ManualSection[] = ['visual', 'voice', 'language', 'compliance'];
    const currentIndex = sections.indexOf(currentSection);
    return currentIndex > 0 ? sections[currentIndex - 1] : null;
  }, [currentSection]);

  // Cache management functions
  const clearCache = useCallback(() => {
    queryClient.removeQueries({ 
      queryKey: queryKeys.manual(userId, brandVoiceId) 
    });
    setError(null);
  }, [queryClient, userId, brandVoiceId]);

  const invalidateCache = useCallback(() => {
    queryClient.invalidateQueries({ 
      queryKey: queryKeys.manual(userId, brandVoiceId) 
    });
  }, [queryClient, userId, brandVoiceId]);

  // Error handling
  const retryOnError = useCallback(() => {
    setError(null);
    refetch();
  }, [refetch]);

  const clearError = useCallback(() => {
    setError(null);
  }, []);

  // Performance metrics
  const performanceMetrics = useMemo(() => {
    if (!manual) return null;
    
    return {
      load_time: manual.metadata.performance_metrics.load_time,
      cache_hit_rate: manual.metadata.performance_metrics.cache_hit_rate,
      user_engagement: manual.metadata.performance_metrics.user_engagement,
      last_updated: manual.metadata.updated_at
    };
  }, [manual]);

  return {
    // Data
    manual: manual || createMockManual(userId, brandVoiceId || 'default'),
    validation,
    currentSection,
    
    // Loading states
    isLoading: false, // Don't show loading state with mock data
    isValidating,
    isUpdatingConfig: updateConfigMutation.isPending,
    isUpdatingSharing: updateSharingMutation.isPending,
    isExporting: exportMutation.isPending,
    
    // Error handling
    error: error || null, // Show actual errors or null
    clearError,
    retryOnError,
    
    // Actions
    navigateToSection,
    getNextSection,
    getPreviousSection,
    getSectionData,
    
    // Mutations
    updateDisplayConfig: updateConfigMutation.mutate,
    updateSharing: updateSharingMutation.mutate,
    exportManual: exportMutation.mutate,
    revalidate,
    
    // Cache management
    clearCache,
    invalidateCache,
    cacheKey,
    
    // Utilities
    performanceMetrics,
    
    // Export results
    exportResult: exportMutation.data,
    exportError: exportMutation.error,
  };
}

// Helper functions for data processing
function calculateAccessibility(palette: any) {
  // Calculate WCAG contrast ratios and compliance
  return {
    wcag_aa_compliant: true, // Placeholder - implement actual calculation
    wcag_aaa_compliant: false,
    color_blind_friendly: true,
    contrast_ratios: {},
    recommendations: []
  };
}

function processRadarData(voiceTone: any) {
  // Transform voice tone data into radar chart format
  return {
    dimensions: voiceTone?.dimensions || [],
    benchmarks: {},
    metadata: {
      generated_at: new Date().toISOString(),
      version: '1.0'
    }
  };
}

function buildSearchIndex(glossary: any) {
  // Build searchable index for glossary terms
  return {
    categories: [],
    search_index: {},
    alphabetical_index: {}
  };
}

function calculateComplianceScore(compliance: any): number {
  // Calculate overall compliance score
  return 85; // Placeholder
}

function calculateCompletenessScore(manual: RenderedManual): number {
  // Calculate how complete the manual is
  let score = 0;
  const sections = Object.keys(manual.sections);
  
  sections.forEach(section => {
    if (manual.sections[section as ManualSection]) {
      score += 25; // 25 points per section
    }
  });
  
  return Math.min(score, 100);
}

function validateConsistency(manual: RenderedManual): string[] {
  // Validate consistency across sections
  const warnings: string[] = [];
  
  // Check for tone consistency between voice and language sections
  // Check for color consistency between visual and compliance
  // etc.
  
  return warnings;
}

function generateSuggestions(manual: RenderedManual): string[] {
  // Generate improvement suggestions based on manual content
  const suggestions: string[] = [];
  
  if (manual.quality.completeness_score < 80) {
    suggestions.push('Complete missing sections to improve manual quality');
  }
  
  if (manual.sections.visual.palette.accessibility.wcag_aa_compliant === false) {
    suggestions.push('Improve color contrast ratios for better accessibility');
  }
  
  return suggestions;
}

// Mock data factory for demo purposes - simplified for testing
function createMockManual(userId: string, brandVoiceId: string): any {
  return {
    id: `manual-${userId}-${brandVoiceId}`,
    user_id: userId,
    brand_voice_id: brandVoiceId,
    brand_name: "Digital Woof Demo",
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
    brandVoice: {
      brand: {
        name: "Digital Woof",
        segment: "Pet Tech",
        businessType: "Plataforma Digital",
        values: [
          { name: "Confiabilidade", weight: 85 },
          { name: "Inovação", weight: 92 },
          { name: "Cuidado", weight: 88 },
          { name: "Transparência", weight: 78 }
        ],
        targetAudience: {
          primary: "Donos de pets que buscam cuidado digital para seus animais",
          personas: [
            "Maria, 35 anos, mãe de pet preocupada com saúde",
            "João, 42 anos, profissional que viaja e precisa monitorar seu pet"
          ],
          goals: [
            "Monitorar a saúde do pet remotamente",
            "Ter acesso fácil a informações veterinárias",
            "Conectar-se com outros donos de pets"
          ],
          painPoints: [
            "Dificuldade para agendar consultas veterinárias",
            "Falta de informação sobre cuidados básicos",
            "Preocupação quando está longe do pet"
          ]
        }
      }
    },
    sections: {
      visual: {
        palette: {
          primary: "#2563eb",
          secondary: ["#10b981", "#f59e0b", "#ef4444"],
          neutral: ["#1f2937", "#6b7280", "#9ca3af", "#d1d5db", "#f9fafb"],
          usage_examples: [
            {
              context: "Headers e CTAs principais",
              colors: ["#2563eb"],
              description: "Usado para elementos de destaque e ações primárias"
            },
            {
              context: "Elementos de sucesso",
              colors: ["#10b981"],
              description: "Indica sucesso, confirmações e feedback positivo"
            },
            {
              context: "Avisos e alertas",
              colors: ["#f59e0b"],
              description: "Para chamar atenção e avisos importantes"
            }
          ],
          accessibility: {
            wcag_aa_compliant: true,
            wcag_aaa_compliant: false,
            color_blind_friendly: true,
            contrast_ratios: {
              "#2563eb": 7.2,
              "#10b981": 4.8,
              "#f59e0b": 3.1
            },
            recommendations: [
              "Sempre use texto branco sobre a cor primária",
              "Evite usar apenas cor para transmitir informações importantes",
              "Teste com simuladores de daltonismo"
            ]
          }
        },
        logo: {
          url: "/assets/logo-primary.svg",
          variants: [
            {
              name: "Logo Horizontal",
              url: "/assets/logo-horizontal.svg",
              format: "svg" as const,
              usage_context: ["cabeçalhos", "assinaturas", "materiais impressos"],
              size_variants: {
                small: "/assets/logo-horizontal-sm.svg",
                medium: "/assets/logo-horizontal-md.svg",
                large: "/assets/logo-horizontal-lg.svg"
              }
            },
            {
              name: "Logo Vertical",
              url: "/assets/logo-vertical.svg",
              format: "svg" as const,
              usage_context: ["materiais quadrados", "redes sociais"],
              size_variants: {
                small: "/assets/logo-vertical-sm.svg",
                medium: "/assets/logo-vertical-md.svg",
                large: "/assets/logo-vertical-lg.svg"
              }
            },
            {
              name: "Símbolo",
              url: "/assets/logo-symbol.svg",
              format: "svg" as const,
              usage_context: ["espaços pequenos", "favicon", "aplicativos"],
              size_variants: {
                small: "/assets/logo-symbol-16.svg",
                medium: "/assets/logo-symbol-32.svg",
                large: "/assets/logo-symbol-64.svg"
              }
            }
          ],
          usage_guidelines: [
            "Manter proporções originais sempre",
            "Usar em fundos com bom contraste",
            "Respeitar área de proteção mínima",
            "Não aplicar efeitos ou sombras",
            "Não alterar cores do logotipo"
          ]
        },
        typography: {
          primary: "Inter",
          style: "sans-serif",
          examples: [
            {
              text: "Heading 1 - Título Principal",
              size: "2.5rem",
              weight: "700",
              usage_context: "Títulos principais de páginas"
            },
            {
              text: "Heading 2 - Subtítulo",
              size: "2rem",
              weight: "600",
              usage_context: "Subtítulos de seções"
            },
            {
              text: "Body Text - Texto de corpo",
              size: "1rem",
              weight: "400",
              usage_context: "Texto principal e parágrafos"
            },
            {
              text: "Small Text - Texto pequeno",
              size: "0.875rem",
              weight: "400",
              usage_context: "Legendas e textos secundários"
            }
          ]
        },
        moodBoard: {
          images: [
            {
              url: "/assets/mood-modern.jpg",
              description: "Design moderno e minimalista",
              style_tags: ["moderno", "limpo", "minimalista"],
              usage_context: "Referência para layouts e interfaces"
            },
            {
              url: "/assets/mood-friendly.jpg",
              description: "Atmosfera amigável e acolhedora",
              style_tags: ["amigável", "caloroso", "acolhedor"],
              usage_context: "Referência para tom de comunicação visual"
            }
          ],
          style_references: [
            "Design system do Stripe - simplicidade e funcionalidade",
            "Interface do Notion - organização clara",
            "Branding do Airbnb - acessibilidade e humanização"
          ],
          visual_guidelines: [
            "Priorizar clareza e funcionalidade",
            "Usar espaçamento generoso",
            "Manter consistência visual",
            "Aplicar princípios de acessibilidade"
          ]
        }
      },
      voice: {},
      language: {},
      compliance: {}
    },
    metadata: {
      version: "1.0",
      language: "pt-BR",
      updated_at: new Date().toISOString(),
      performance_metrics: {
        load_time: 250,
        cache_hit_rate: 95,
        user_engagement: 78
      }
    }
  };
}

// Export additional hooks for specific use cases
export function useManualNavigation(manual: RenderedManual | null) {
  const [currentSection, setCurrentSection] = useState<ManualSection>('visual');
  
  const sections: ManualSection[] = ['visual', 'voice', 'language', 'compliance'];
  
  const canGoNext = currentSection !== sections[sections.length - 1];
  const canGoPrevious = currentSection !== sections[0];
  
  const goNext = useCallback(() => {
    const currentIndex = sections.indexOf(currentSection);
    if (currentIndex < sections.length - 1) {
      setCurrentSection(sections[currentIndex + 1]);
    }
  }, [currentSection, sections]);
  
  const goPrevious = useCallback(() => {
    const currentIndex = sections.indexOf(currentSection);
    if (currentIndex > 0) {
      setCurrentSection(sections[currentIndex - 1]);
    }
  }, [currentSection, sections]);
  
  return {
    currentSection,
    setCurrentSection,
    canGoNext,
    canGoPrevious,
    goNext,
    goPrevious,
    sections,
    progress: Math.round(((sections.indexOf(currentSection) + 1) / sections.length) * 100)
  };
}

export function useManualExport(userId: string) {
  const [exportHistory, setExportHistory] = useState<ExportResult[]>([]);
  
  const { data: exports, isLoading } = useQuery({
    queryKey: queryKeys.exports(userId),
    queryFn: () => fetch(`/api/manual-marca/exports?userId=${userId}`).then(r => r.json()),
    enabled: !!userId,
  });
  
  return {
    exportHistory: exports?.data || [],
    isLoading,
    addExport: (exportResult: ExportResult) => {
      setExportHistory(prev => [exportResult, ...prev]);
    }
  };
}