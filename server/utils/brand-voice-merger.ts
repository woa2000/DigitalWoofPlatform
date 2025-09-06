import { type BrandVoice } from '../../shared/schemas/brand-voice.js';
import { getBrandVoiceDefaults } from '../../config/brand-voice-defaults.js';

export interface MergeInput {
  anamnesisData?: any;
  onboardingData?: any;
  userOverrides?: Record<string, any>;
  userId: string;
  options: {
    preferQuality: boolean;
    includeDefaults: boolean;
    validateOutput: boolean;
  };
}

export interface MergeResult {
  brandVoice: BrandVoice;
  metadata: {
    generatedFrom: 'anamnesis' | 'onboarding' | 'merged' | 'manual';
    qualityScore?: number;
    mergeDecisions: Array<{
      field: string;
      source: 'anamnesis' | 'onboarding' | 'default' | 'override';
      confidence: number;
      reason: string;
    }>;
  };
}

export class BrandVoiceMerger {
  private mergeDecisions: Array<{
    field: string;
    source: 'anamnesis' | 'onboarding' | 'default' | 'override';
    confidence: number;
    reason: string;
  }> = [];

  /**
   * Main merge logic - simplified version for MVP
   */
  async merge(input: MergeInput): Promise<MergeResult> {
    this.mergeDecisions = [];

    try {
      // Get base defaults
      const defaults = getBrandVoiceDefaults('veterinaria');
      let brandVoice = { ...defaults };

      // Simple merge strategy for MVP
      if (input.onboardingData) {
        brandVoice = this.mergeOnboardingData(brandVoice, input.onboardingData);
      }

      if (input.userOverrides) {
        brandVoice = this.mergeUserOverrides(brandVoice, input.userOverrides);
      }

      // Determine generation source
      const generatedFrom = this.determineGeneratedFrom(
        !!input.anamnesisData,
        !!input.onboardingData,
        !!input.userOverrides
      );

      // Basic quality score
      const qualityScore = this.calculateBasicQualityScore(brandVoice);

      return {
        brandVoice,
        metadata: {
          generatedFrom,
          qualityScore,
          mergeDecisions: [...this.mergeDecisions]
        }
      };

    } catch (error) {
      throw new Error(`Brand Voice merge failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  /**
   * Simplified onboarding merge
   */
  private mergeOnboardingData(brandVoice: BrandVoice, onboardingData: any): BrandVoice {
    const merged = { ...brandVoice };

    // Logo URL
    if (onboardingData.logoUrl) {
      merged.visual.logoUrl = onboardingData.logoUrl;
      this.addMergeDecision('visual.logoUrl', 'onboarding', 0.9, 'Logo from onboarding');
    }

    // Brand name
    if (onboardingData.brandName) {
      merged.brand.name = onboardingData.brandName;
      this.addMergeDecision('brand.name', 'onboarding', 0.9, 'Name from onboarding');
    }

    // Color palette
    if (onboardingData.palette && Array.isArray(onboardingData.palette)) {
      if (onboardingData.palette[0]) merged.visual.palette.primary = onboardingData.palette[0];
      this.addMergeDecision('visual.palette', 'onboarding', 0.8, 'Colors from onboarding');
    }

    // Tone values
    if (onboardingData.toneConfig) {
      const config = onboardingData.toneConfig;
      if (config.confianca !== undefined) merged.voice.tone.confiança = config.confianca;
      if (config.acolhimento !== undefined) merged.voice.tone.acolhimento = config.acolhimento;
      if (config.humor !== undefined) merged.voice.tone.humor = config.humor;
      if (config.especializacao !== undefined) merged.voice.tone.especialização = config.especializacao;
      this.addMergeDecision('voice.tone', 'onboarding', 0.8, 'Tone from onboarding sliders');
    }

    return merged;
  }

  /**
   * Apply user overrides
   */
  private mergeUserOverrides(brandVoice: BrandVoice, overrides: Record<string, any>): BrandVoice {
    const merged = { ...brandVoice };

    // Simple flat override for MVP
    Object.keys(overrides).forEach(key => {
      if (overrides[key] !== undefined) {
        // Basic path setting (can be enhanced later)
        if (key === 'brand.name') merged.brand.name = overrides[key];
        if (key === 'brand.mission') merged.brand.mission = overrides[key];
        if (key === 'visual.logoUrl') merged.visual.logoUrl = overrides[key];
        
        this.addMergeDecision(key, 'override', 1.0, 'Manual user override');
      }
    });

    return merged;
  }

  /**
   * Determine generation source
   */
  private determineGeneratedFrom(
    hasAnamnesis: boolean,
    hasOnboarding: boolean,
    hasOverrides: boolean
  ): 'anamnesis' | 'onboarding' | 'merged' | 'manual' {
    if (hasOverrides) return 'manual';
    if (hasAnamnesis && hasOnboarding) return 'merged';
    if (hasAnamnesis) return 'anamnesis';
    if (hasOnboarding) return 'onboarding';
    return 'manual';
  }

  /**
   * Basic quality score calculation
   */
  private calculateBasicQualityScore(brandVoice: BrandVoice): number {
    let score = 0;
    let maxScore = 100;

    // Brand completeness
    if (brandVoice.brand.name) score += 20;
    if (brandVoice.brand.mission) score += 15;
    if (brandVoice.brand.values.length > 0) score += 10;

    // Visual completeness
    if (brandVoice.visual.logoUrl) score += 15;
    if (brandVoice.visual.palette.primary) score += 10;

    // Voice completeness
    if (brandVoice.voice.lexicon.prefer.length > 0) score += 15;
    if (brandVoice.voice.persona.description) score += 15;

    return Math.min(score, maxScore);
  }

  /**
   * Add merge decision
   */
  private addMergeDecision(
    field: string,
    source: 'anamnesis' | 'onboarding' | 'default' | 'override',
    confidence: number,
    reason: string
  ) {
    this.mergeDecisions.push({ field, source, confidence, reason });
  }
}