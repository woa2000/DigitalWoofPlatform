import { z } from 'zod';
import { BrandVoiceSchema, type BrandVoice } from '../../shared/schemas/brand-voice.js';
import { BrandVoiceMerger } from '../utils/brand-voice-merger.js';
import { logger } from '../utils/logger.js';
import { db } from '../db.js';
import { anamnesisAnalysis, anamnesisFinding, brandOnboarding } from '../../shared/schema.js';
import { eq } from 'drizzle-orm';

// Input schemas for generation
const GenerationInputSchema = z.object({
  userId: z.string().uuid(),
  anamnesisAnalysisId: z.string().uuid().optional(),
  brandOnboardingId: z.string().uuid().optional(),
  overrides: z.record(z.any()).optional(), // Manual overrides from user
  options: z.object({
    preferQuality: z.boolean().default(true), // Prioritize quality over speed
    includeDefaults: z.boolean().default(true), // Use segment defaults
    validateOutput: z.boolean().default(true), // Full validation
  }).default({})
});

export type GenerationInput = z.infer<typeof GenerationInputSchema>;

export interface GenerationResult {
  brandVoice: BrandVoice;
  metadata: {
    generatedFrom: 'anamnesis' | 'onboarding' | 'merged' | 'manual';
    sourceAnalysisId?: string;
    sourceOnboardingId?: string;
    generationTime: number; // milliseconds
    qualityScore?: number;
    mergeDecisions: Array<{
      field: string;
      source: 'anamnesis' | 'onboarding' | 'default' | 'override';
      confidence: number;
      reason: string;
    }>;
  };
}

export class BrandVoiceGeneratorService {
  private merger: BrandVoiceMerger;

  constructor() {
    this.merger = new BrandVoiceMerger();
  }

  /**
   * Main entry point for Brand Voice generation
   * Merges anamnesis + onboarding data with intelligent prioritization
   */
  async generateBrandVoice(input: GenerationInput): Promise<GenerationResult> {
    const startTime = Date.now();
    
    try {
      // Validate input
      const validatedInput = GenerationInputSchema.parse(input);
      
      logger.info('Starting Brand Voice generation', {
        userId: validatedInput.userId,
        anamnesisId: validatedInput.anamnesisAnalysisId,
        onboardingId: validatedInput.brandOnboardingId,
        hasOverrides: !!validatedInput.overrides
      });

      // Fetch source data
      const [anamnesisData, onboardingData] = await Promise.all([
        this.fetchAnamnesisData(validatedInput.anamnesisAnalysisId),
        this.fetchOnboardingData(validatedInput.brandOnboardingId)
      ]);

      // Determine generation strategy
      const strategy = this.determineGenerationStrategy(anamnesisData, onboardingData, validatedInput.overrides);
      
      logger.info('Generation strategy determined', { strategy });

      // Perform merge based on strategy
      const mergeResult = await this.merger.merge({
        anamnesisData,
        onboardingData,
        userOverrides: validatedInput.overrides,
        userId: validatedInput.userId,
        options: validatedInput.options
      });

      // Validate output if requested
      if (validatedInput.options.validateOutput) {
        const validation = BrandVoiceSchema.safeParse(mergeResult.brandVoice);
        if (!validation.success) {
          throw new Error(`Generated Brand Voice validation failed: ${validation.error.message}`);
        }
      }

      const generationTime = Date.now() - startTime;

      // Log performance metrics
      logger.info('Brand Voice generation completed', {
        userId: validatedInput.userId,
        generationTime,
        strategy: mergeResult.metadata.generatedFrom,
        qualityScore: mergeResult.metadata.qualityScore,
        mergeDecisionCount: mergeResult.metadata.mergeDecisions.length
      });

      // Check performance target (<2s)
      if (generationTime > 2000) {
        logger.warn('Brand Voice generation exceeded 2s target', {
          userId: validatedInput.userId,
          generationTime,
          target: 2000
        });
      }

      return {
        brandVoice: mergeResult.brandVoice,
        metadata: {
          ...mergeResult.metadata,
          generationTime,
          sourceAnalysisId: validatedInput.anamnesisAnalysisId,
          sourceOnboardingId: validatedInput.brandOnboardingId
        }
      };

    } catch (error) {
      const generationTime = Date.now() - startTime;
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      
      logger.error('Brand Voice generation failed', error instanceof Error ? error : new Error(errorMessage), {
        userId: input.userId,
        generationTime
      });

      throw new Error(`Brand Voice generation failed: ${errorMessage}`);
    }
  }

  /**
   * Quick generation for preview purposes (reduced validation)
   */
  async generatePreview(input: Omit<GenerationInput, 'options'>): Promise<BrandVoice> {
    const result = await this.generateBrandVoice({
      ...input,
      options: {
        preferQuality: false,
        includeDefaults: true,
        validateOutput: false
      }
    });

    return result.brandVoice;
  }

  /**
   * Regenerate Brand Voice with updated data
   */
  async regenerateBrandVoice(
    existingBrandVoiceId: string,
    updates: Partial<GenerationInput>
  ): Promise<GenerationResult> {
    // TODO: Fetch existing Brand Voice for comparison
    // TODO: Preserve user customizations where possible
    
    logger.info('Regenerating Brand Voice', {
      existingId: existingBrandVoiceId,
      updates
    });

    // For now, generate fresh (will be enhanced in later iterations)
    return this.generateBrandVoice(updates as GenerationInput);
  }

  /**
   * Fetch anamnesis analysis data
   */
  private async fetchAnamnesisData(analysisId?: string) {
    if (!analysisId) return null;

    try {
      const analysis = await db
        .select()
        .from(anamnesisAnalysis)
        .where(eq(anamnesisAnalysis.id, analysisId))
        .limit(1);

      if (analysis.length === 0) {
        logger.warn('Anamnesis analysis not found', { analysisId });
        return null;
      }

      // Fetch all findings for this analysis
      const findings = await db
        .select()
        .from(anamnesisFinding)
        .where(eq(anamnesisFinding.analysisId, analysisId));

      return {
        analysis: analysis[0],
        findings: findings.reduce((acc: Record<string, Array<{ key: string; payload: any }>>, finding: any) => {
          if (!acc[finding.section]) acc[finding.section] = [];
          acc[finding.section].push({
            key: finding.key,
            payload: finding.payload
          });
          return acc;
        }, {} as Record<string, Array<{ key: string; payload: any }>>)
      };

    } catch (error) {
      logger.error('Failed to fetch anamnesis data', error instanceof Error ? error : new Error('Unknown error'), {
        analysisId
      });
      return null;
    }
  }

  /**
   * Fetch brand onboarding data
   */
  private async fetchOnboardingData(onboardingId?: string) {
    if (!onboardingId) return null;

    try {
      const onboarding = await db
        .select()
        .from(brandOnboarding)
        .where(eq(brandOnboarding.id, onboardingId))
        .limit(1);

      if (onboarding.length === 0) {
        logger.warn('Brand onboarding not found', { onboardingId });
        return null;
      }

      return onboarding[0];

    } catch (error) {
      logger.error('Failed to fetch onboarding data', error instanceof Error ? error : new Error('Unknown error'), {
        onboardingId
      });
      return null;
    }
  }

  /**
   * Determine the best generation strategy based on available data
   */
  private determineGenerationStrategy(
    anamnesisData: any,
    onboardingData: any,
    overrides?: Record<string, any>
  ): 'anamnesis' | 'onboarding' | 'merged' | 'manual' {
    
    if (overrides && Object.keys(overrides).length > 0) {
      return 'manual';
    }

    if (anamnesisData && onboardingData) {
      return 'merged';
    }

    if (anamnesisData) {
      return 'anamnesis';
    }

    if (onboardingData) {
      return 'onboarding';
    }

    // Fallback to defaults (handled by merger)
    return 'manual';
  }

  /**
   * Get generation statistics for monitoring
   */
  async getGenerationStats(userId: string, timeRange?: { start: Date; end: Date }) {
    // TODO: Implement statistics collection
    // This would track generation frequency, performance, quality scores, etc.
    
    return {
      totalGenerations: 0,
      averageGenerationTime: 0,
      averageQualityScore: 0,
      strategiesUsed: {
        anamnesis: 0,
        onboarding: 0,
        merged: 0,
        manual: 0
      }
    };
  }
}

// Singleton instance
export const brandVoiceGenerator = new BrandVoiceGeneratorService();