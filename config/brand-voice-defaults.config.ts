/**
 * Configuration file for Brand Voice Default Values System
 * Allows customization of segment-specific defaults
 */

import { BrandVoice } from '../shared/schemas/brand-voice';

export interface DefaultsConfiguration {
  segments: {
    [K in BrandVoice['brand']['segment']]: {
      enabled: boolean;
      overrides?: {
        toneAdjustments?: Partial<{
          confiança: number;
          acolhimento: number;
          humor: number;
          especialização: number;
          urgência?: number;
          formalidade?: number;
        }>;
        communicationStyleOverride?: BrandVoice['voice']['persona']['communication_style'];
        complianceLevelOverride?: 'strict' | 'moderate' | 'flexible';
        additionalTerms?: {
          prefer?: string[];
          avoid?: string[];
          banned?: string[];
        };
        customMission?: string;
        customValues?: Array<{ name: string; description: string; weight: number }>;
      };
    };
  };
  globalSettings: {
    qualityOptimization: {
      enabled: boolean;
      targetScores: {
        completeness: number;
        consistency: number;
        specificity: number;
        usability: number;
      };
    };
    performance: {
      cacheEnabled: boolean;
      cacheTTL: number; // seconds
      precomputeDefaults: boolean;
    };
    compliance: {
      globalDisclaimerRequired: boolean;
      customGlobalDisclaimer?: string;
      strictModeSegments: BrandVoice['brand']['segment'][];
    };
  };
}

// Default configuration - can be overridden by environment or external config
export const DEFAULT_CONFIGURATION: DefaultsConfiguration = {
  segments: {
    veterinaria: {
      enabled: true,
      overrides: {
        // Veterinária pode ter tone mais técnico se necessário
        toneAdjustments: {
          especialização: 0.98,
          confiança: 0.92
        }
      }
    },
    petshop: {
      enabled: true,
      overrides: {
        // Petshop pode ser mais casual e amigável
        toneAdjustments: {
          humor: 0.7,
          acolhimento: 0.95
        }
      }
    },
    banho_tosa: {
      enabled: true,
      overrides: {
        // Banho e tosa foca em carinho e cuidado
        toneAdjustments: {
          acolhimento: 0.98,
          humor: 0.8
        }
      }
    },
    hotel_pet: {
      enabled: true,
      overrides: {
        // Hotel pet foca em segurança e diversão
        toneAdjustments: {
          confiança: 0.85,
          acolhimento: 0.92
        }
      }
    },
    agropet: {
      enabled: true,
      overrides: {
        // Agropet mais técnico e profissional
        toneAdjustments: {
          especialização: 0.85,
          formalidade: 0.7
        }
      }
    }
  },
  globalSettings: {
    qualityOptimization: {
      enabled: true,
      targetScores: {
        completeness: 0.85,
        consistency: 0.90,
        specificity: 0.80,
        usability: 0.88
      }
    },
    performance: {
      cacheEnabled: true,
      cacheTTL: 300, // 5 minutes
      precomputeDefaults: true
    },
    compliance: {
      globalDisclaimerRequired: true,
      strictModeSegments: ['veterinaria']
    }
  }
};

// Environment-specific configurations
export const PRODUCTION_CONFIG: Partial<DefaultsConfiguration> = {
  globalSettings: {
    compliance: {
      globalDisclaimerRequired: true,
      customGlobalDisclaimer: 'Este conteúdo é gerado por IA e deve ser revisado por profissionais qualificados.',
      strictModeSegments: ['veterinaria', 'agropet']
    },
    qualityOptimization: {
      enabled: true,
      targetScores: {
        completeness: 0.90,
        consistency: 0.95,
        specificity: 0.85,
        usability: 0.92
      }
    },
    performance: {
      cacheEnabled: true,
      cacheTTL: 600, // 10 minutes in production
      precomputeDefaults: true
    }
  }
};

export const DEVELOPMENT_CONFIG: Partial<DefaultsConfiguration> = {
  globalSettings: {
    performance: {
      cacheEnabled: false,
      cacheTTL: 60,
      precomputeDefaults: false
    },
    compliance: {
      globalDisclaimerRequired: false,
      strictModeSegments: []
    },
    qualityOptimization: {
      enabled: false,
      targetScores: {
        completeness: 0.70,
        consistency: 0.70,
        specificity: 0.70,
        usability: 0.70
      }
    }
  }
};

// Configuration manager
export class DefaultsConfigurationManager {
  private static instance: DefaultsConfigurationManager;
  private config: DefaultsConfiguration;

  private constructor() {
    this.config = { ...DEFAULT_CONFIGURATION };
    this.loadEnvironmentConfig();
  }

  static getInstance(): DefaultsConfigurationManager {
    if (!DefaultsConfigurationManager.instance) {
      DefaultsConfigurationManager.instance = new DefaultsConfigurationManager();
    }
    return DefaultsConfigurationManager.instance;
  }

  private loadEnvironmentConfig(): void {
    const env = process.env.NODE_ENV || 'development';
    
    if (env === 'production') {
      this.mergeConfig(PRODUCTION_CONFIG);
    } else if (env === 'development') {
      this.mergeConfig(DEVELOPMENT_CONFIG);
    }

    // Load from environment variables if available
    this.loadFromEnvironmentVariables();
  }

  private loadFromEnvironmentVariables(): void {
    // Quality thresholds
    if (process.env.BRAND_VOICE_QUALITY_COMPLETENESS) {
      this.config.globalSettings.qualityOptimization.targetScores.completeness = 
        parseFloat(process.env.BRAND_VOICE_QUALITY_COMPLETENESS);
    }

    if (process.env.BRAND_VOICE_QUALITY_CONSISTENCY) {
      this.config.globalSettings.qualityOptimization.targetScores.consistency = 
        parseFloat(process.env.BRAND_VOICE_QUALITY_CONSISTENCY);
    }

    // Cache settings
    if (process.env.BRAND_VOICE_CACHE_TTL) {
      this.config.globalSettings.performance.cacheTTL = 
        parseInt(process.env.BRAND_VOICE_CACHE_TTL);
    }

    if (process.env.BRAND_VOICE_CACHE_ENABLED) {
      this.config.globalSettings.performance.cacheEnabled = 
        process.env.BRAND_VOICE_CACHE_ENABLED === 'true';
    }

    // Compliance
    if (process.env.BRAND_VOICE_GLOBAL_DISCLAIMER) {
      this.config.globalSettings.compliance.customGlobalDisclaimer = 
        process.env.BRAND_VOICE_GLOBAL_DISCLAIMER;
    }
  }

  private mergeConfig(override: Partial<DefaultsConfiguration>): void {
    this.config = this.deepMerge(this.config, override);
  }

  private deepMerge(target: any, source: any): any {
    const result = { ...target };
    
    for (const key in source) {
      if (source[key] !== null && typeof source[key] === 'object' && !Array.isArray(source[key])) {
        result[key] = this.deepMerge(target[key] || {}, source[key]);
      } else {
        result[key] = source[key];
      }
    }
    
    return result;
  }

  // Public API
  getConfig(): DefaultsConfiguration {
    return { ...this.config };
  }

  getSegmentConfig(segment: BrandVoice['brand']['segment']) {
    return this.config.segments[segment];
  }

  getGlobalSettings() {
    return this.config.globalSettings;
  }

  isSegmentEnabled(segment: BrandVoice['brand']['segment']): boolean {
    return this.config.segments[segment]?.enabled ?? true;
  }

  getQualityTargets() {
    return this.config.globalSettings.qualityOptimization.targetScores;
  }

  isCacheEnabled(): boolean {
    return this.config.globalSettings.performance.cacheEnabled;
  }

  getCacheTTL(): number {
    return this.config.globalSettings.performance.cacheTTL;
  }

  isStrictMode(segment: BrandVoice['brand']['segment']): boolean {
    return this.config.globalSettings.compliance.strictModeSegments.includes(segment);
  }

  getGlobalDisclaimer(): string | undefined {
    return this.config.globalSettings.compliance.customGlobalDisclaimer;
  }

  // Dynamic configuration updates
  updateSegmentConfig(
    segment: BrandVoice['brand']['segment'], 
    overrides: NonNullable<DefaultsConfiguration['segments'][typeof segment]['overrides']>
  ): void {
    if (!this.config.segments[segment]) {
      this.config.segments[segment] = { enabled: true };
    }
    
    this.config.segments[segment].overrides = {
      ...this.config.segments[segment].overrides,
      ...overrides
    };
  }

  updateQualityTargets(targets: Partial<DefaultsConfiguration['globalSettings']['qualityOptimization']['targetScores']>): void {
    this.config.globalSettings.qualityOptimization.targetScores = {
      ...this.config.globalSettings.qualityOptimization.targetScores,
      ...targets
    };
  }

  enableSegment(segment: BrandVoice['brand']['segment']): void {
    if (!this.config.segments[segment]) {
      this.config.segments[segment] = { enabled: true };
    } else {
      this.config.segments[segment].enabled = true;
    }
  }

  disableSegment(segment: BrandVoice['brand']['segment']): void {
    if (this.config.segments[segment]) {
      this.config.segments[segment].enabled = false;
    }
  }

  // Export current configuration for backup/debugging
  exportConfig(): string {
    return JSON.stringify(this.config, null, 2);
  }

  // Import configuration from JSON
  importConfig(configJson: string): void {
    try {
      const importedConfig = JSON.parse(configJson);
      this.validateConfig(importedConfig);
      this.config = importedConfig;
    } catch (error) {
      throw new Error(`Invalid configuration JSON: ${error}`);
    }
  }

  private validateConfig(config: any): void {
    // Basic validation
    if (!config.segments || !config.globalSettings) {
      throw new Error('Configuration must have segments and globalSettings');
    }

    // Validate quality scores are between 0 and 1
    const qualityScores = config.globalSettings?.qualityOptimization?.targetScores;
    if (qualityScores) {
      for (const [key, value] of Object.entries(qualityScores)) {
        if (typeof value !== 'number' || value < 0 || value > 1) {
          throw new Error(`Quality score ${key} must be a number between 0 and 1`);
        }
      }
    }

    // Validate cache TTL is positive
    const cacheTTL = config.globalSettings?.performance?.cacheTTL;
    if (cacheTTL && (typeof cacheTTL !== 'number' || cacheTTL <= 0)) {
      throw new Error('Cache TTL must be a positive number');
    }
  }
}

// Export singleton instance
export const defaultsConfig = DefaultsConfigurationManager.getInstance();