import { CampaignTemplate, BusinessType, ContentType, CampaignPhase, PostSpecification } from '../../shared/types/calendar.js';
import { SeasonalIntelligenceService } from './SeasonalIntelligenceService.js';

export interface CampaignItem {
  id: string;
  template_id: string;
  campaign_name: string;
  phase: string;
  title: string;
  description: string;
  content_type: ContentType;
  scheduled_date: Date;
  priority: number;
  estimated_reach: number;
  tags?: string[];
  metadata?: Record<string, any>;
  seasonal_context?: {
    event_id: string;
    event_name: string;
    confidence_score: number;
    optimization_applied: boolean;
  };
}

export interface CampaignTemplateApplication {
  template: CampaignTemplate;
  generated_items: CampaignItem[];
  start_date: Date;
  end_date: Date;
  customizations: Record<string, any>;
  business_context: {
    type: BusinessType;
    region?: string;
    audience?: string;
  };
}

export interface CampaignCustomization {
  content_adjustments?: {
    tone?: 'formal' | 'casual' | 'enthusiastic' | 'educational';
    focus?: 'promotional' | 'educational' | 'engagement' | 'awareness';
    include_pricing?: boolean;
    include_testimonials?: boolean;
  };
  timing_adjustments?: {
    preferred_days?: string[]; // ['monday', 'wednesday', 'friday']
    preferred_times?: string[]; // ['09:00', '18:00']
    frequency_multiplier?: number; // 0.5 = half frequency, 2.0 = double
  };
  visual_adjustments?: {
    color_scheme?: string;
    brand_elements?: string[];
    image_style?: 'photography' | 'illustration' | 'mixed';
  };
}

export interface CampaignValidation {
  is_valid: boolean;
  warnings: string[];
  errors: string[];
  suggestions: string[];
  estimated_performance: {
    reach_score: number; // 1-10
    engagement_score: number; // 1-10
    conversion_score: number; // 1-10
  };
}

export class CampaignTemplateService {
  private seasonalService: SeasonalIntelligenceService;

  constructor(seasonalService?: SeasonalIntelligenceService) {
    this.seasonalService = seasonalService || new SeasonalIntelligenceService();
  }

  /**
   * Parse ISO duration to days
   */
  private parseDuration(duration: string): number {
    // Parse ISO 8601 duration format (e.g., "P30D" = 30 days, "P4W" = 4 weeks)
    const match = duration.match(/P(?:(\d+)W)?(?:(\d+)D)?/);
    if (!match) return 30; // Default to 30 days
    
    const weeks = parseInt(match[1] || '0');
    const days = parseInt(match[2] || '0');
    
    return (weeks * 7) + days;
  }

  /**
   * Apply a campaign template with customizations
   */
  async applyCampaignTemplate(
    template: CampaignTemplate,
    startDate: Date,
    businessType: BusinessType,
    customizations: CampaignCustomization = {},
    location?: { region?: 'N' | 'NE' | 'CO' | 'SE' | 'S'; state?: string }
  ): Promise<CampaignTemplateApplication> {
    
    console.log(`[CampaignTemplate] Applying template "${template.name}" for ${businessType}`);

    // 1. Parse duration and calculate end date
    const durationDays = this.parseDuration(template.duration);
    const endDate = this.calculateCampaignEndDate(startDate, durationDays);

    // 2. Generate campaign items based on template structure
    const generatedItems = await this.generateCampaignItems(
      template,
      startDate,
      endDate,
      businessType,
      customizations,
      location
    );

    // 3. Apply seasonal intelligence for optimal timing
    const optimizedItems = await this.applySeasonalOptimization(
      generatedItems,
      businessType,
      { start: startDate, end: endDate },
      location
    );

    // 4. Apply business-specific customizations
    const customizedItems = this.applyBusinessCustomizations(
      optimizedItems,
      businessType,
      customizations
    );

    return {
      template,
      generated_items: customizedItems,
      start_date: startDate,
      end_date: endDate,
      customizations: customizations as Record<string, any>,
      business_context: {
        type: businessType,
        region: location?.region
      }
    };
  }

  /**
   * Generate campaign items from template phases
   */
  private async generateCampaignItems(
    template: CampaignTemplate,
    startDate: Date,
    endDate: Date,
    businessType: BusinessType,
    customizations: CampaignCustomization,
    location?: { region?: 'N' | 'NE' | 'CO' | 'SE' | 'S'; state?: string }
  ): Promise<CampaignItem[]> {
    
    const items: CampaignItem[] = [];
    const frequencyMultiplier = customizations.timing_adjustments?.frequency_multiplier || 1.0;
    
    // Generate items for each phase
    for (const phase of template.phases) {
      const phaseItems = await this.generatePhaseItems(
        template,
        phase,
        startDate,
        businessType,
        customizations,
        frequencyMultiplier
      );
      
      items.push(...phaseItems);
    }

    return items;
  }

  /**
   * Generate items for a specific campaign phase
   */
  private async generatePhaseItems(
    template: CampaignTemplate,
    phase: CampaignPhase,
    startDate: Date,
    businessType: BusinessType,
    customizations: CampaignCustomization,
    frequencyMultiplier: number
  ): Promise<CampaignItem[]> {
    
    const items: CampaignItem[] = [];
    
    // Calculate posts for this phase
    const postsCount = Math.ceil(phase.posts.length * frequencyMultiplier);
    
    for (let i = 0; i < postsCount; i++) {
      const postSpec = phase.posts[i % phase.posts.length];
      
      // Calculate scheduled date
      const dayOffset = (phase.week - 1) * 7; // Convert week to day offset
      let scheduledDate = new Date(startDate);
      scheduledDate.setDate(scheduledDate.getDate() + dayOffset + i);
      
      // Apply preferred days if specified
      if (customizations.timing_adjustments?.preferred_days && postSpec.preferred_day) {
        scheduledDate = this.adjustToPreferredDay(scheduledDate, customizations.timing_adjustments.preferred_days);
      }

      const item: CampaignItem = {
        id: `${template.id}-phase${phase.week}-post${i + 1}`,
        template_id: template.id,
        campaign_name: template.name,
        phase: `Week ${phase.week}: ${phase.theme}`,
        title: this.generateItemTitle(template, phase, postSpec, businessType, i + 1),
        description: this.generateItemDescription(template, phase, postSpec),
        content_type: postSpec.type,
        scheduled_date: scheduledDate,
        priority: this.calculateItemPriority(phase, postSpec.type, i),
        estimated_reach: this.estimateReach(postSpec.type, businessType),
        tags: this.generateItemTags(template, phase, postSpec.type),
        metadata: {
          phase_week: phase.week,
          phase_theme: phase.theme,
          template_name: template.name,
          business_type: businessType,
          post_specification: postSpec
        }
      };

      items.push(item);
    }

    return items;
  }

  /**
   * Apply seasonal optimization to campaign items
   */
  private async applySeasonalOptimization(
    items: CampaignItem[],
    businessType: BusinessType,
    period: { start: Date; end: Date },
    location?: { region?: 'N' | 'NE' | 'CO' | 'SE' | 'S'; state?: string }
  ): Promise<CampaignItem[]> {
    
    try {
      // Get seasonal suggestions for the campaign period
      const seasonalSuggestions = await this.seasonalService.getSeasonalSuggestions(
        businessType,
        period,
        location
      );

      // Optimize timing based on seasonal intelligence
      return items.map(item => {
        const relevantSuggestion = seasonalSuggestions.find(suggestion => 
          this.isSeasonallyRelevant(item, suggestion.event, suggestion.content_themes)
        );

        if (relevantSuggestion) {
          // Adjust timing to align with seasonal opportunity
          const optimizedDate = this.findOptimalDateNear(
            item.scheduled_date,
            relevantSuggestion.recommended_timing
          );

          return {
            ...item,
            scheduled_date: optimizedDate,
            seasonal_context: {
              event_id: relevantSuggestion.event.id,
              event_name: relevantSuggestion.event.name,
              confidence_score: relevantSuggestion.priority / 10,
              optimization_applied: true
            },
            estimated_reach: Math.min(10, item.estimated_reach * 1.2), // Boost reach for seasonal content
            priority: Math.min(10, item.priority + 1) // Increase priority
          };
        }

        return item;
      });
    } catch (error) {
      console.warn('[CampaignTemplate] Seasonal optimization failed:', error);
      return items; // Return original items if optimization fails
    }
  }

  /**
   * Check if campaign item is seasonally relevant
   */
  private isSeasonallyRelevant(
    item: CampaignItem,
    seasonalEvent: any,
    seasonalThemes: string[]
  ): boolean {
    // Check if item tags overlap with seasonal themes
    const itemTags = item.tags || [];
    const themeOverlap = seasonalThemes.some(theme => 
      itemTags.some(tag => tag.toLowerCase().includes(theme.toLowerCase()))
    );

    // Check if content type is appropriate for seasonal event
    const appropriateContentTypes: Record<string, ContentType[]> = {
      'promocional': ['promocional', 'engajamento'],
      'educativo': ['educativo', 'awareness'],
      'awareness': ['awareness', 'educativo'],
      'recall': ['recall', 'promocional']
    };

    const contentTypeMatch = appropriateContentTypes[item.content_type]?.includes(item.content_type);

    return themeOverlap || contentTypeMatch;
  }

  /**
   * Find optimal date near original schedule that aligns with seasonal timing
   */
  private findOptimalDateNear(originalDate: Date, seasonalDates: Date[]): Date {
    if (seasonalDates.length === 0) return originalDate;

    // Find the seasonal date closest to the original
    let closestDate = seasonalDates[0];
    let smallestDiff = Math.abs(originalDate.getTime() - seasonalDates[0].getTime());

    for (const seasonalDate of seasonalDates) {
      const diff = Math.abs(originalDate.getTime() - seasonalDate.getTime());
      if (diff < smallestDiff) {
        smallestDiff = diff;
        closestDate = seasonalDate;
      }
    }

    // Don't move more than 7 days from original schedule
    const maxDrift = 7 * 24 * 60 * 60 * 1000; // 7 days in milliseconds
    if (smallestDiff <= maxDrift) {
      return closestDate;
    }

    return originalDate;
  }

  /**
   * Apply business-specific customizations
   */
  private applyBusinessCustomizations(
    items: CampaignItem[],
    businessType: BusinessType,
    customizations: CampaignCustomization
  ): CampaignItem[] {
    
    return items.map(item => {
      let customizedItem = { ...item };

      // Apply content adjustments
      if (customizations.content_adjustments) {
        customizedItem = this.applyContentAdjustments(customizedItem, customizations.content_adjustments);
      }

      // Apply visual adjustments
      if (customizations.visual_adjustments) {
        customizedItem.metadata = {
          ...customizedItem.metadata,
          visual_style: customizations.visual_adjustments
        };
      }

      // Apply business-type specific enhancements
      customizedItem = this.applyBusinessTypeEnhancements(customizedItem, businessType);

      return customizedItem;
    });
  }

  /**
   * Apply content tone and focus adjustments
   */
  private applyContentAdjustments(
    item: CampaignItem,
    adjustments: NonNullable<CampaignCustomization['content_adjustments']>
  ): CampaignItem {
    
    let adjustedItem = { ...item };

    // Adjust title based on tone
    if (adjustments.tone) {
      adjustedItem.title = this.adjustContentTone(item.title, adjustments.tone);
    }

    // Adjust description based on focus
    if (adjustments.focus) {
      adjustedItem.description = this.adjustContentFocus(item.description, adjustments.focus);
    }

    // Add pricing context if requested
    if (adjustments.include_pricing && item.content_type === 'promocional') {
      adjustedItem.metadata = {
        ...adjustedItem.metadata,
        include_pricing: true,
        pricing_context: 'promotional_offer'
      };
    }

    // Add testimonial context if requested
    if (adjustments.include_testimonials && ['engajamento', 'awareness'].includes(item.content_type)) {
      adjustedItem.metadata = {
        ...adjustedItem.metadata,
        include_testimonials: true,
        testimonial_type: 'customer_success'
      };
    }

    return adjustedItem;
  }

  /**
   * Adjust content tone
   */
  private adjustContentTone(text: string, tone: string): string {
    const toneAdjustments: Record<string, (text: string) => string> = {
      formal: (text) => text.replace(/!/g, '.').replace(/😊|🐕|🐱/g, ''),
      casual: (text) => text + ' 😊',
      enthusiastic: (text) => text.replace(/\./g, '!') + ' 🎉',
      educational: (text) => 'Dica importante: ' + text
    };

    return toneAdjustments[tone]?.(text) || text;
  }

  /**
   * Adjust content focus
   */
  private adjustContentFocus(text: string, focus: string): string {
    const focusAdjustments: Record<string, string> = {
      promotional: 'Aproveite nossa oferta especial! ',
      educational: 'Saiba mais sobre ',
      engagement: 'Compartilhe sua experiência! ',
      awareness: 'É importante saber que '
    };

    const prefix = focusAdjustments[focus];
    return prefix ? prefix + text.toLowerCase() : text;
  }

  /**
   * Apply business type specific enhancements
   */
  private applyBusinessTypeEnhancements(item: CampaignItem, businessType: BusinessType): CampaignItem {
    const enhancements: Record<BusinessType, (item: CampaignItem) => Partial<CampaignItem>> = {
      veterinaria: (item) => ({
        tags: [...(item.tags || []), 'saude', 'prevencao', 'medicina_veterinaria'],
        metadata: { ...item.metadata, authority_context: 'medical_expertise' }
      }),
      petshop: (item) => ({
        tags: [...(item.tags || []), 'produtos', 'variedade', 'conveniencia'],
        metadata: { ...item.metadata, commercial_context: 'product_showcase' }
      }),
      hotel: (item) => ({
        tags: [...(item.tags || []), 'hospedagem', 'cuidado', 'seguranca'],
        metadata: { ...item.metadata, service_context: 'care_quality' }
      }),
      estetica: (item) => ({
        tags: [...(item.tags || []), 'beleza', 'higiene', 'bem_estar'],
        metadata: { ...item.metadata, aesthetic_context: 'beauty_care' }
      }),
      adestramento: (item) => ({
        tags: [...(item.tags || []), 'comportamento', 'educacao', 'obediencia'],
        metadata: { ...item.metadata, training_context: 'behavioral_expertise' }
      })
    };

    const enhancement = enhancements[businessType]?.(item);
    return enhancement ? { ...item, ...enhancement } : item;
  }

  /**
   * Validate campaign before application
   */
  async validateCampaign(
    template: CampaignTemplate,
    startDate: Date,
    businessType: BusinessType,
    customizations: CampaignCustomization = {}
  ): Promise<CampaignValidation> {
    
    const validation: CampaignValidation = {
      is_valid: true,
      warnings: [],
      errors: [],
      suggestions: [],
      estimated_performance: {
        reach_score: 5,
        engagement_score: 5,
        conversion_score: 5
      }
    };

    // Validate business type compatibility
    if (template.business_type !== businessType) {
      validation.warnings.push(`Template foi projetado para ${template.business_type}, aplicando para ${businessType}`);
      validation.estimated_performance.reach_score -= 1;
    }

    // Validate timing
    const now = new Date();
    if (startDate < now) {
      validation.errors.push('Data de início não pode ser no passado');
      validation.is_valid = false;
    }

    // Validate duration
    const durationDays = this.parseDuration(template.duration);
    if (durationDays > 365) {
      validation.warnings.push('Campanha muito longa pode perder efetividade');
      validation.estimated_performance.engagement_score -= 1;
    }

    if (durationDays < 7) {
      validation.warnings.push('Campanha muito curta pode ter alcance limitado');
      validation.estimated_performance.reach_score -= 1;
    }

    // Calculate estimated performance based on template characteristics
    validation.estimated_performance = this.calculateEstimatedPerformance(
      template,
      businessType,
      customizations,
      validation.estimated_performance
    );

    // Generate suggestions
    if (validation.estimated_performance.reach_score < 5) {
      validation.suggestions.push('Considere aumentar a frequência de posts ou duração da campanha');
    }

    if (validation.estimated_performance.engagement_score < 5) {
      validation.suggestions.push('Adicione mais conteúdo interativo e calls-to-action');
    }

    if (validation.estimated_performance.conversion_score < 5) {
      validation.suggestions.push('Inclua mais conteúdo promocional e ofertas especiais');
    }

    return validation;
  }

  /**
   * Calculate estimated performance metrics
   */
  private calculateEstimatedPerformance(
    template: CampaignTemplate,
    businessType: BusinessType,
    customizations: CampaignCustomization,
    baseScores: { reach_score: number; engagement_score: number; conversion_score: number }
  ): { reach_score: number; engagement_score: number; conversion_score: number } {
    
    let { reach_score, engagement_score, conversion_score } = baseScores;

    // Adjust based on campaign type
    if (template.campaign_type === 'promotional') {
      conversion_score += 2;
      engagement_score += 1;
    } else if (template.campaign_type === 'educational') {
      reach_score += 1;
      engagement_score += 2;
    } else if (template.campaign_type === 'seasonal') {
      reach_score += 2;
      engagement_score += 1;
    }

    // Adjust based on customizations
    if (customizations.content_adjustments?.include_pricing) {
      conversion_score += 1;
    }

    if (customizations.content_adjustments?.include_testimonials) {
      engagement_score += 1;
      conversion_score += 1;
    }

    if (customizations.timing_adjustments?.preferred_days?.length) {
      reach_score += 1;
    }

    // Ensure scores stay within 1-10 range
    return {
      reach_score: Math.max(1, Math.min(10, reach_score)),
      engagement_score: Math.max(1, Math.min(10, engagement_score)),
      conversion_score: Math.max(1, Math.min(10, conversion_score))
    };
  }

  /**
   * Generate multiple campaign variations for A/B testing
   */
  async generateCampaignVariations(
    template: CampaignTemplate,
    startDate: Date,
    businessType: BusinessType,
    variationCount: number = 3
  ): Promise<CampaignTemplateApplication[]> {
    
    const variations: CampaignTemplateApplication[] = [];
    
    const customizationVariations: CampaignCustomization[] = [
      // Variation 1: Casual tone, high frequency
      {
        content_adjustments: { tone: 'casual', focus: 'engagement' },
        timing_adjustments: { frequency_multiplier: 1.5 }
      },
      // Variation 2: Professional tone, moderate frequency
      {
        content_adjustments: { tone: 'formal', focus: 'educational', include_testimonials: true },
        timing_adjustments: { frequency_multiplier: 1.0 }
      },
      // Variation 3: Enthusiastic tone, promotional focus
      {
        content_adjustments: { tone: 'enthusiastic', focus: 'promotional', include_pricing: true },
        timing_adjustments: { frequency_multiplier: 0.8 }
      }
    ];

    for (let i = 0; i < Math.min(variationCount, customizationVariations.length); i++) {
      const application = await this.applyCampaignTemplate(
        template,
        startDate,
        businessType,
        customizationVariations[i]
      );
      
      variations.push({
        ...application,
        generated_items: application.generated_items.map(item => ({
          ...item,
          id: `${item.id}-v${i + 1}` // Add variation suffix
        }))
      });
    }

    return variations;
  }

  // Helper methods
  private calculateCampaignEndDate(startDate: Date, durationDays: number): Date {
    const endDate = new Date(startDate);
    endDate.setDate(endDate.getDate() + durationDays);
    return endDate;
  }

  private adjustToPreferredDay(date: Date, preferredDays: string[]): Date {
    const dayNames = ['sunday', 'monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday'];
    const currentDay = dayNames[date.getDay()];
    
    if (preferredDays.includes(currentDay)) {
      return date;
    }

    // Find the nearest preferred day
    for (let offset = 1; offset <= 7; offset++) {
      const nextDate = new Date(date);
      nextDate.setDate(date.getDate() + offset);
      const nextDay = dayNames[nextDate.getDay()];
      
      if (preferredDays.includes(nextDay)) {
        return nextDate;
      }
    }

    return date; // Fallback to original date
  }

  private generateItemTitle(
    template: CampaignTemplate,
    phase: CampaignPhase,
    postSpec: PostSpecification,
    businessType: BusinessType,
    index: number
  ): string {
    if (postSpec.title_template) {
      return postSpec.title_template.replace('{phase}', phase.theme).replace('{index}', index.toString());
    }
    
    return `${template.name} - ${phase.theme} (Post ${index})`;
  }

  private generateItemDescription(
    template: CampaignTemplate,
    phase: CampaignPhase,
    postSpec: PostSpecification
  ): string {
    if (postSpec.content_guidelines && postSpec.content_guidelines.length > 0) {
      return postSpec.content_guidelines[0];
    }
    
    return template.description || `Conteúdo para ${phase.theme}`;
  }

  private calculateItemPriority(phase: CampaignPhase, contentType: ContentType, index: number): number {
    const basePriority = phase.week <= 2 ? 8 : 6; // Higher priority for early weeks
    const typeBonus = contentType === 'promocional' ? 1 : 0;
    return Math.min(10, basePriority + typeBonus);
  }

  private estimateReach(contentType: ContentType, businessType: BusinessType): number {
    const baseReach: Record<ContentType, number> = {
      promocional: 7,
      educativo: 5,
      engajamento: 6,
      awareness: 4,
      recall: 3
    };

    const businessMultiplier: Record<BusinessType, number> = {
      veterinaria: 1.1,
      petshop: 1.0,
      hotel: 0.9,
      estetica: 0.8,
      adestramento: 0.9
    };

    const base = baseReach[contentType] || 5;
    const multiplier = businessMultiplier[businessType] || 1.0;
    
    return Math.round(Math.min(10, base * multiplier));
  }

  private generateItemTags(template: CampaignTemplate, phase: CampaignPhase, contentType: ContentType): string[] {
    return [
      template.name.toLowerCase().replace(/\s+/g, '_'),
      `week_${phase.week}`,
      phase.theme.toLowerCase().replace(/\s+/g, '_'),
      contentType,
      template.campaign_type
    ];
  }
}