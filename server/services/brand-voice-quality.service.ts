import { z } from 'zod';
import { BrandVoice, BrandVoiceSchema } from '../../shared/schemas/brand-voice';
import { logger } from '../utils/logger';

// Quality Metrics Schema
export const qualityMetricsSchema = z.object({
  overall: z.number().min(0).max(1),
  completeness: z.number().min(0).max(1),
  consistency: z.number().min(0).max(1),
  specificity: z.number().min(0).max(1),
  usability: z.number().min(0).max(1),
  details: z.object({
    completeness: z.object({
      filled_fields: z.number(),
      total_fields: z.number(),
      missing_critical: z.array(z.string()),
      missing_optional: z.array(z.string())
    }),
    consistency: z.object({
      tone_conflicts: z.array(z.string()),
      voice_mismatches: z.array(z.string()),
      compliance_contradictions: z.array(z.string()),
      severity_score: z.number().min(0).max(1)
    }),
    specificity: z.object({
      generic_phrases: z.array(z.string()),
      industry_relevance: z.number().min(0).max(1),
      brand_uniqueness: z.number().min(0).max(1),
      actionability: z.number().min(0).max(1)
    }),
    usability: z.object({
      content_generation_readiness: z.number().min(0).max(1),
      ai_prompt_clarity: z.number().min(0).max(1),
      template_compatibility: z.number().min(0).max(1),
      user_guidance_quality: z.number().min(0).max(1)
    })
  }),
  recommendations: z.array(z.object({
    category: z.enum(['completeness', 'consistency', 'specificity', 'usability']),
    priority: z.enum(['high', 'medium', 'low']),
    message: z.string(),
    suggested_action: z.string()
  })),
  calculated_at: z.string(),
  calculation_time_ms: z.number()
});

export type QualityMetrics = z.infer<typeof qualityMetricsSchema>;

export class BrandVoiceQualityService {
  // Quality thresholds
  private static readonly QUALITY_THRESHOLDS = {
    excellent: 0.9,
    good: 0.75,
    acceptable: 0.6,
    needs_improvement: 0.4
  };

  // Critical fields that heavily impact quality (using actual schema structure)
  private static readonly CRITICAL_FIELDS = [
    'brand.name',
    'brand.segment',
    'voice.tone.confiança',
    'brand.targetAudience.primary',
    'voice.persona.description'
  ];

  // Generic phrases that reduce specificity
  private static readonly GENERIC_PHRASES = [
    'alta qualidade',
    'excelente atendimento',
    'melhor preço',
    'satisfação garantida',
    'tradição e confiança',
    'inovação constante',
    'compromisso com você'
  ];

  /**
   * Calculate comprehensive quality metrics for a Brand Voice
   */
  async calculateQualityMetrics(brandVoice: BrandVoice): Promise<QualityMetrics> {
    const startTime = Date.now();
    
    try {
      logger.info('Starting quality metrics calculation', {
        brandName: brandVoice.brand.name,
        segment: brandVoice.brand.segment
      });

      // Validate input
      const validatedBrandVoice = BrandVoiceSchema.parse(brandVoice);

      // Calculate individual metrics
      const completeness = this.calculateCompleteness(validatedBrandVoice);
      const consistency = this.calculateConsistency(validatedBrandVoice);
      const specificity = this.calculateSpecificity(validatedBrandVoice);
      const usability = this.calculateUsability(validatedBrandVoice);

      // Calculate overall score (weighted average)
      const overall = this.calculateOverallScore({
        completeness: completeness.score,
        consistency: consistency.score,
        specificity: specificity.score,
        usability: usability.score
      });

      // Generate recommendations
      const recommendations = this.generateRecommendations({
        completeness,
        consistency,
        specificity,
        usability,
        overall
      });

      const calculationTime = Date.now() - startTime;

      const metrics: QualityMetrics = {
        overall,
        completeness: completeness.score,
        consistency: consistency.score,
        specificity: specificity.score,
        usability: usability.score,
        details: {
          completeness: completeness.details,
          consistency: consistency.details,
          specificity: specificity.details,
          usability: usability.details
        },
        recommendations,
        calculated_at: new Date().toISOString(),
        calculation_time_ms: calculationTime
      };

      logger.info('Quality metrics calculation completed', {
        brandName: brandVoice.brand.name,
        overall_score: overall,
        calculation_time_ms: calculationTime
      });

      return qualityMetricsSchema.parse(metrics);

    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      logger.error('Error calculating quality metrics', error instanceof Error ? error : new Error(errorMessage));
      throw new Error(`Quality metrics calculation failed: ${errorMessage}`);
    }
  }

  /**
   * Calculate completeness score (% of fields filled)
   */
  private calculateCompleteness(brandVoice: BrandVoice) {
    const allFields = this.getAllFieldPaths(brandVoice);
    const filledFields = allFields.filter(path => this.isFieldFilled(brandVoice, path));
    const missingCritical = BrandVoiceQualityService.CRITICAL_FIELDS.filter(
      path => !this.isFieldFilled(brandVoice, path)
    );
    const missingOptional = allFields.filter(
      path => !this.isFieldFilled(brandVoice, path) && 
              !BrandVoiceQualityService.CRITICAL_FIELDS.includes(path)
    );

    // Critical fields have higher weight
    const criticalWeight = 0.7;
    const optionalWeight = 0.3;
    
    const criticalCompleteness = 1 - (missingCritical.length / BrandVoiceQualityService.CRITICAL_FIELDS.length);
    const optionalCompleteness = filledFields.length / allFields.length;
    
    const score = (criticalCompleteness * criticalWeight) + (optionalCompleteness * optionalWeight);

    return {
      score: Math.max(0, Math.min(1, score)),
      details: {
        filled_fields: filledFields.length,
        total_fields: allFields.length,
        missing_critical: missingCritical,
        missing_optional: missingOptional
      }
    };
  }

  /**
   * Calculate consistency score (detect internal contradictions)
   */
  private calculateConsistency(brandVoice: BrandVoice) {
    const conflicts: string[] = [];
    const voiceMismatches: string[] = [];
    const complianceContradictions: string[] = [];

    // Check tone vs communication style consistency
    const toneValues = brandVoice.voice.tone;
    const communicationStyle = brandVoice.voice.persona.communication_style;

    // High confidence + low formality might conflict with professional style
    if (toneValues.confiança > 0.8 && communicationStyle === 'professional' && 
        (toneValues.formalidade !== undefined && toneValues.formalidade < 0.5)) {
      conflicts.push('High confidence with professional style but low formality setting');
    }

    // High humor with authoritative style
    if (toneValues.humor > 0.7 && communicationStyle === 'authoritative') {
      conflicts.push('High humor conflicts with authoritative communication style');
    }

    // Check voice vs compliance consistency
    if (brandVoice.voice.lexicon.banned.length > 0 && 
        brandVoice.voice.lexicon.prefer.some(term => 
          brandVoice.voice.lexicon.banned.includes(term)
        )) {
      voiceMismatches.push('Preferred terms conflict with banned terms');
    }

    // Check compliance vs segment consistency
    if (brandVoice.brand.segment === 'veterinaria' && 
        brandVoice.compliance.regulatory.medical_claims === 'flexible') {
      complianceContradictions.push('Veterinaria segment should have stricter medical claims policy');
    }

    const totalIssues = conflicts.length + voiceMismatches.length + complianceContradictions.length;
    const severityScore = Math.max(0, 1 - (totalIssues * 0.2)); // Each issue reduces score by 0.2
    const score = severityScore;

    return {
      score,
      details: {
        tone_conflicts: conflicts,
        voice_mismatches: voiceMismatches,
        compliance_contradictions: complianceContradictions,
        severity_score: severityScore
      }
    };
  }

  /**
   * Calculate specificity score (how specific vs generic)
   */
  private calculateSpecificity(brandVoice: BrandVoice) {
    const genericPhrases: string[] = [];
    
    // Check for generic phrases in brand description
    const brandMission = brandVoice.brand.mission || '';
    BrandVoiceQualityService.GENERIC_PHRASES.forEach(generic => {
      if (brandMission.toLowerCase().includes(generic.toLowerCase())) {
        genericPhrases.push(`"${generic}" found in brand mission`);
      }
    });

    // Check persona description for specificity
    const personaDescription = brandVoice.voice.persona.description;
    const hasSpecificDetails = personaDescription.length > 50 && 
      !BrandVoiceQualityService.GENERIC_PHRASES.some(generic => 
        personaDescription.toLowerCase().includes(generic.toLowerCase())
      );

    // Industry relevance based on segment-specific terms
    const industryRelevance = this.calculateIndustryRelevance(brandVoice);
    
    // Brand uniqueness based on specific values and descriptions
    const brandUniqueness = this.calculateBrandUniqueness(brandVoice);
    
    // Actionability based on specific guidance
    const actionability = this.calculateActionability(brandVoice);

    const genericityPenalty = Math.min(0.5, genericPhrases.length * 0.1);
    const specificityBonus = hasSpecificDetails ? 0.2 : 0;
    
    const score = Math.max(0, Math.min(1, 
      (industryRelevance + brandUniqueness + actionability) / 3 + 
      specificityBonus - genericityPenalty
    ));

    return {
      score,
      details: {
        generic_phrases: genericPhrases,
        industry_relevance: industryRelevance,
        brand_uniqueness: brandUniqueness,
        actionability: actionability
      }
    };
  }

  /**
   * Calculate usability score (readiness for content generation)
   */
  private calculateUsability(brandVoice: BrandVoice) {
    // Content generation readiness
    const hasEssentialElements = !!(
      brandVoice.voice.tone.confiança !== undefined &&
      brandVoice.brand.targetAudience.primary &&
      brandVoice.voice.persona.description
    );
    const contentGenerationReadiness = hasEssentialElements ? 0.8 : 0.3;

    // AI prompt clarity
    const hasDetailedGuidance = !!(
      brandVoice.voice.persona.description &&
      brandVoice.voice.persona.communication_style &&
      brandVoice.voice.lexicon.prefer.length > 0
    );
    const aiPromptClarity = hasDetailedGuidance ? 0.9 : 0.5;

    // Template compatibility (based on voice style configuration)
    const hasStructuredData = !!(
      brandVoice.voice.style.sentence_length &&
      brandVoice.voice.style.cta_style.preferred.length > 0
    );
    const templateCompatibility = hasStructuredData ? 0.8 : 0.6;

    // User guidance quality
    const hasActionableGuidance = !!(
      brandVoice.voice.lexicon.avoid.length > 0 ||
      brandVoice.compliance.content_policies.default_disclaimer ||
      brandVoice.voice.persona.characteristics.length > 0
    );
    const userGuidanceQuality = hasActionableGuidance ? 0.8 : 0.4;

    const score = (
      contentGenerationReadiness + 
      aiPromptClarity + 
      templateCompatibility + 
      userGuidanceQuality
    ) / 4;

    return {
      score,
      details: {
        content_generation_readiness: contentGenerationReadiness,
        ai_prompt_clarity: aiPromptClarity,
        template_compatibility: templateCompatibility,
        user_guidance_quality: userGuidanceQuality
      }
    };
  }

  /**
   * Calculate overall weighted score
   */
  private calculateOverallScore(scores: {
    completeness: number;
    consistency: number;
    specificity: number;
    usability: number;
  }): number {
    const weights = {
      completeness: 0.25,
      consistency: 0.3,   // Higher weight - consistency is critical
      specificity: 0.2,
      usability: 0.25
    };

    return (
      scores.completeness * weights.completeness +
      scores.consistency * weights.consistency +
      scores.specificity * weights.specificity +
      scores.usability * weights.usability
    );
  }

  /**
   * Generate actionable recommendations
   */
  private generateRecommendations(metrics: {
    completeness: { score: number; details: any };
    consistency: { score: number; details: any };
    specificity: { score: number; details: any };
    usability: { score: number; details: any };
    overall: number;
  }) {
    const recommendations: QualityMetrics['recommendations'] = [];

    // Completeness recommendations
    if (metrics.completeness.score < 0.7) {
      if (metrics.completeness.details.missing_critical.length > 0) {
        recommendations.push({
          category: 'completeness',
          priority: 'high',
          message: `${metrics.completeness.details.missing_critical.length} critical fields are missing`,
          suggested_action: `Fill missing critical fields: ${metrics.completeness.details.missing_critical.join(', ')}`
        });
      }
    }

    // Consistency recommendations
    if (metrics.consistency.score < 0.8) {
      if (metrics.consistency.details.tone_conflicts.length > 0) {
        recommendations.push({
          category: 'consistency',
          priority: 'high',
          message: 'Tone conflicts detected between different sections',
          suggested_action: 'Review tone settings and communication style for alignment'
        });
      }
    }

    // Specificity recommendations
    if (metrics.specificity.score < 0.6) {
      if (metrics.specificity.details.generic_phrases.length > 0) {
        recommendations.push({
          category: 'specificity',
          priority: 'medium',
          message: 'Generic phrases detected that reduce brand uniqueness',
          suggested_action: 'Replace generic phrases with specific, brand-unique language'
        });
      }
    }

    // Usability recommendations
    if (metrics.usability.score < 0.7) {
      recommendations.push({
        category: 'usability',
        priority: 'medium',
        message: 'Brand Voice needs more detailed guidance for content generation',
        suggested_action: 'Add more specific persona characteristics, preferred terms, and content guidelines'
      });
    }

    return recommendations;
  }

  // Helper methods
  private getAllFieldPaths(obj: any, prefix = ''): string[] {
    const paths: string[] = [];
    
    Object.keys(obj).forEach(key => {
      const value = obj[key];
      const path = prefix ? `${prefix}.${key}` : key;
      
      if (value !== null && typeof value === 'object' && !Array.isArray(value)) {
        paths.push(...this.getAllFieldPaths(value, path));
      } else {
        paths.push(path);
      }
    });
    
    return paths;
  }

  private isFieldFilled(obj: any, path: string): boolean {
    const keys = path.split('.');
    let current = obj;
    
    for (const key of keys) {
      if (current === null || current === undefined) return false;
      current = current[key];
    }
    
    if (Array.isArray(current)) {
      return current.length > 0;
    }
    
    return current !== null && current !== undefined && current !== '';
  }

  private calculateIndustryRelevance(brandVoice: BrandVoice): number {
    const segment = brandVoice.brand.segment;
    const mission = brandVoice.brand.mission?.toLowerCase() || '';
    const personaDescription = brandVoice.voice.persona.description.toLowerCase();
    
    const industryTerms = {
      veterinaria: ['pet', 'animal', 'veterinário', 'saúde', 'cuidado', 'clínica'],
      petshop: ['ração', 'brinquedo', 'acessório', 'pet', 'animal', 'cuidado'],
      banho_tosa: ['banho', 'tosa', 'higiene', 'beleza', 'cuidado', 'estética'],
      hotel_pet: ['hospedagem', 'hotel', 'cuidado', 'temporada', 'viagem'],
      agropet: ['agro', 'rural', 'fazenda', 'pecuária', 'agricultura']
    };
    
    const relevantTerms = industryTerms[segment] || [];
    const foundTerms = relevantTerms.filter(term => 
      mission.includes(term) || personaDescription.includes(term)
    );
    
    return foundTerms.length / relevantTerms.length;
  }

  private calculateBrandUniqueness(brandVoice: BrandVoice): number {
    const hasUniqueValues = !!(
      brandVoice.brand.mission &&
      brandVoice.brand.mission.length > 30 &&
      brandVoice.brand.values.length > 0
    );
    
    const hasSpecificPersona = !!(
      brandVoice.voice.persona.description.length > 50 &&
      brandVoice.voice.persona.characteristics.length > 0 &&
      brandVoice.voice.lexicon.prefer.length > 0
    );
    
    return (hasUniqueValues ? 0.5 : 0) + (hasSpecificPersona ? 0.5 : 0);
  }

  private calculateActionability(brandVoice: BrandVoice): number {
    const hasActionableElements = [
      brandVoice.voice.lexicon.prefer.length > 0,
      brandVoice.voice.lexicon.avoid.length > 0,
      brandVoice.voice.style.cta_style.preferred.length > 0,
      brandVoice.compliance.content_policies.default_disclaimer.length > 0
    ].filter(Boolean).length;
    
    return hasActionableElements / 4;
  }
}