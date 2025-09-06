/**
 * Brand Voice Prompt Builder
 * 
 * Utility for building AI prompts dynamically using Brand Voice JSON data.
 * Converts brand characteristics into AI-readable instructions for consistent
 * content generation across all platforms and content types.
 */

import type { BrandVoice } from '../../shared/schemas/brand-voice.js';
import { BrandVoicePromptTemplates, type ContentType, type PromptContext } from '../templates/prompt-templates.js';
import { logger } from '../utils/logger.js';

/**
 * Configuration for prompt building behavior
 */
export interface PromptBuilderConfig {
  includeExamples?: boolean;
  maxPromptLength?: number;
  includeDebugInfo?: boolean;
  adaptiveComplexity?: boolean;
  customPlaceholders?: Record<string, string>;
}

/**
 * Result of prompt building operation
 */
export interface PromptBuildResult {
  prompt: string;
  metadata: {
    contentType: ContentType;
    wordEstimate: { min: number; max: number };
    complexity: 'low' | 'medium' | 'high';
    processingTime: number;
    templateVersion: string;
  };
  warnings?: string[];
}

/**
 * Brand Voice analysis for prompt optimization
 */
interface BrandVoiceAnalysis {
  primaryTone: string;
  secondaryTones: string[];
  communicationStyle: string;
  formalityLevel: number; // 0-1 scale
  emotionalRange: string[];
  keyPersonalityTraits: string[];
  languagePreferences: string[];
  coreMessages: string[];
}

/**
 * Main class for building AI prompts from Brand Voice data
 */
export class BrandVoicePromptBuilder {
  private config: Required<PromptBuilderConfig>;
  private static readonly DEFAULT_CONFIG: Required<PromptBuilderConfig> = {
    includeExamples: true,
    maxPromptLength: 3000,
    includeDebugInfo: false,
    adaptiveComplexity: true,
    customPlaceholders: {}
  };

  constructor(config: PromptBuilderConfig = {}) {
    this.config = { ...BrandVoicePromptBuilder.DEFAULT_CONFIG, ...config };
  }

  /**
   * Build prompt for specific content type and context
   */
  async buildPrompt(
    brandVoice: BrandVoice,
    contentType: ContentType,
    context: PromptContext
  ): Promise<PromptBuildResult> {
    const startTime = Date.now();

    try {
      // Validate inputs
      this.validateInputs(brandVoice, contentType, context);

      // Get template for content type
      const template = BrandVoicePromptTemplates.getTemplate(contentType);
      
      // Analyze brand voice for prompt optimization
      const analysis = this.analyzeBrandVoice(brandVoice);
      
      // Build placeholder values
      const placeholders = this.buildPlaceholders(brandVoice, context, analysis);
      
      // Generate prompt from template
      let prompt = this.replaceTemplatePlaceholders(template.baseTemplate, placeholders);
      
      // Add sections based on template structure
      prompt = this.addTemplateSection(prompt, 'brandContext', this.buildBrandContext(brandVoice));
      prompt = this.addTemplateSection(prompt, 'voiceGuidelines', this.buildVoiceGuidelines(brandVoice, analysis));
      prompt = this.addTemplateSection(prompt, 'toneInstructions', this.buildToneInstructions(brandVoice, analysis));
      prompt = this.addTemplateSection(prompt, 'constraints', this.buildConstraints(brandVoice, context, template));

      // Apply adaptive complexity if enabled
      if (this.config.adaptiveComplexity) {
        prompt = this.adaptPromptComplexity(prompt, analysis, context);
      }

      // Trim to max length if specified
      if (prompt.length > this.config.maxPromptLength) {
        prompt = this.trimPromptToLength(prompt, this.config.maxPromptLength);
      }

      const processingTime = Date.now() - startTime;

      return {
        prompt: prompt.trim(),
        metadata: {
          contentType,
          wordEstimate: {
            min: template.minWords || 50,
            max: template.maxWords || 500
          },
          complexity: this.calculateComplexity(analysis, context),
          processingTime,
          templateVersion: '1.0'
        },
        warnings: this.collectWarnings(brandVoice, context)
      };

    } catch (error) {
      logger.error('Failed to build prompt: ' + (error instanceof Error ? error.message : String(error)));
      logger.error('Brand version: ' + (brandVoice.version || 'unknown'));
      logger.error('Content type: ' + contentType);
      throw error;
    }
  }

  /**
   * Build prompts for multiple content types in batch
   */
  async buildBatchPrompts(
    brandVoice: BrandVoice,
    requests: Array<{ contentType: ContentType; context: PromptContext }>
  ): Promise<PromptBuildResult[]> {
    const results: PromptBuildResult[] = [];
    
    for (const request of requests) {
      try {
        const result = await this.buildPrompt(brandVoice, request.contentType, request.context);
        results.push(result);
      } catch (error) {
        logger.error(`Failed to build prompt for ${request.contentType}: ` + (error instanceof Error ? error.message : String(error)));
        // Continue with other prompts
      }
    }
    
    return results;
  }

  /**
   * Generate tone description from brand voice data
   */
  generateToneDescription(brandVoice: BrandVoice): string {
    const analysis = this.analyzeBrandVoice(brandVoice);
    
    const toneElements = [
      `Primary tone: ${analysis.primaryTone}`,
      analysis.secondaryTones.length > 0 ? `Secondary elements: ${analysis.secondaryTones.join(', ')}` : '',
      `Communication style: ${analysis.communicationStyle}`,
      `Personality traits: ${analysis.keyPersonalityTraits.slice(0, 3).join(', ')}`,
      analysis.emotionalRange.length > 0 ? `Emotional range: ${analysis.emotionalRange.join(' to ')}` : ''
    ].filter(Boolean);

    return toneElements.join('. ') + '.';
  }

  /**
   * Build compliance checking prompts
   */
  buildCompliancePrompt(brandVoice: BrandVoice, content: string): string {
    const compliance = brandVoice.compliance || {};
    
    const checks = [
      'Review the following content for brand compliance:',
      '',
      `Content to check: "${content}"`,
      '',
      'Brand Compliance Guidelines:',
      compliance.content_policies?.review_triggers?.length ? `- Review triggers: ${compliance.content_policies.review_triggers.join(', ')}` : '',
      compliance.content_policies?.disclaimer_required ? `- Disclaimer required: ${compliance.content_policies.default_disclaimer}` : '',
      compliance.regulatory ? `- Regulatory: medical claims (${compliance.regulatory.medical_claims}), veterinary advice (${compliance.regulatory.veterinary_advice})` : '',
      compliance.regulatory ? `- Regulatory requirements: medical claims (${compliance.regulatory.medical_claims}), veterinary advice (${compliance.regulatory.veterinary_advice})` : '',
      '',
      'Provide a compliance assessment with:',
      '1. Compliance status (PASS/FAIL)',
      '2. Specific violations found (if any)',
      '3. Recommended corrections',
      '4. Confidence score (0-100%)'
    ].filter(Boolean);

    return checks.join('\n');
  }

  /**
   * Validate input parameters
   */
  private validateInputs(brandVoice: BrandVoice, contentType: ContentType, context: PromptContext): void {
    if (!brandVoice || typeof brandVoice !== 'object') {
      throw new Error('Valid Brand Voice object is required');
    }

    if (!BrandVoicePromptTemplates.isSupported(contentType)) {
      throw new Error(`Content type '${contentType}' is not supported`);
    }

    if (!context || typeof context !== 'object') {
      throw new Error('Valid prompt context is required');
    }

    if (context.contentType !== contentType) {
      throw new Error('Context content type must match requested content type');
    }
  }

  /**
   * Analyze brand voice characteristics for prompt optimization
   */
  private analyzeBrandVoice(brandVoice: BrandVoice): BrandVoiceAnalysis {
    const voice = brandVoice.voice || {};
    const brand = brandVoice.brand || {};

    // Extract primary tone (highest scoring tone characteristic)
    const tones = voice.tone || {};
    const primaryTone = Object.entries(tones)
      .sort(([,a], [,b]) => (b as number) - (a as number))[0]?.[0] || 'neutral';

    // Get secondary tones (scores > 0.6)
    const secondaryTones = Object.entries(tones)
      .filter(([key, value]) => key !== primaryTone && (value as number) > 0.6)
      .map(([key]) => key);

    // Determine communication style
    const style = voice.style || {};
    // Extract communication style from voice.style
    const communicationStyle = style.sentence_length || 'balanced';

    // Calculate formality level from available tones
    const formalityLevel = tones.formalidade || 0.5;

    // Extract personality traits from persona
    const persona = voice.persona || {};
    const keyPersonalityTraits = [
      persona.characteristics ? persona.characteristics.slice(0, 3).join(', ') : '',
      persona.communication_style ? persona.communication_style : ''
    ].filter(Boolean);

    // Build emotional range
    const emotionalRange = this.buildEmotionalRange(tones);

    // Extract language preferences
    const languagePreferences = this.extractLanguagePreferences(voice);

    // Build core messages
    const coreMessages = this.extractCoreMessages(brand, voice);

    return {
      primaryTone,
      secondaryTones,
      communicationStyle,
      formalityLevel,
      emotionalRange,
      keyPersonalityTraits,
      languagePreferences,
      coreMessages
    };
  }

  /**
   * Build placeholder values for template replacement
   */
  private buildPlaceholders(
    brandVoice: BrandVoice,
    context: PromptContext,
    analysis: BrandVoiceAnalysis
  ): Record<string, string> {
    const placeholders: Record<string, string> = {
      // Context placeholders
      platform: context.platform || 'generic platform',
      targetAudience: context.targetAudience || 'general audience',
      contentGoal: context.contentGoal || 'engage and inform',
      contentLength: context.contentLength || 'medium',
      callToAction: context.callToAction ? `Call to Action: ${context.callToAction}` : '',
      keywords: context.keywords?.join(', ') || '',

      // Brand placeholders
      brandName: brandVoice.brand?.name || 'the brand',
      brandValues: brandVoice.brand?.values?.join(', ') || '',
      brandMission: brandVoice.brand?.mission || '',
      brandPersonality: analysis.keyPersonalityTraits.join(', '),

      // Voice placeholders
      primaryTone: analysis.primaryTone,
      communicationStyle: analysis.communicationStyle,
      formalityLevel: this.formatFormalityLevel(analysis.formalityLevel),

      // Tone mapping
      toneMapping: this.buildToneMapping(brandVoice.voice?.tone || {}),

      // Word limits
      wordLimits: this.formatWordLimits(context, BrandVoicePromptTemplates.getTemplate(context.contentType)),

      // Custom constraints
      customConstraints: context.constraints?.map(c => `- ${c}`).join('\n') || '',

      // Custom placeholders
      ...this.config.customPlaceholders
    };

    return placeholders;
  }

  /**
   * Replace template placeholders with actual values
   */
  private replaceTemplatePlaceholders(template: string, placeholders: Record<string, string>): string {
    let result = template;
    
    for (const [key, value] of Object.entries(placeholders)) {
      const placeholder = `{${key}}`;
      result = result.replace(new RegExp(placeholder.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'g'), value);
    }

    // Remove any unreplaced placeholders
    result = result.replace(/\{[^}]+\}/g, '');
    
    return result;
  }

  /**
   * Add template section to prompt
   */
  private addTemplateSection(prompt: string, sectionName: string, content: string): string {
    const placeholder = `{${sectionName}}`;
    return prompt.replace(placeholder, content);
  }

  /**
   * Build brand context section
   */
  private buildBrandContext(brandVoice: BrandVoice): string {
    const brand = brandVoice.brand || {};
    
    const context = [
      `Brand: ${brand.name || 'Unnamed Brand'}`,
      brand.mission ? `Mission: ${brand.mission}` : '',
      brand.values?.length ? `Values: ${brand.values.join(', ')}` : '',
      brand.targetAudience ? `Target Audience: ${brand.targetAudience.primary || 'general'}` : '',
      brand.businessType ? `Industry: ${brand.businessType}` : ''
    ].filter(Boolean);

    return context.join('\n');
  }

  /**
   * Build voice guidelines section
   */
  private buildVoiceGuidelines(brandVoice: BrandVoice, analysis: BrandVoiceAnalysis): string {
    const guidelines = [
      `Primary Communication Style: ${analysis.communicationStyle}`,
      `Personality: ${analysis.keyPersonalityTraits.join(', ') || 'balanced'}`,
      `Formality Level: ${this.formatFormalityLevel(analysis.formalityLevel)}`,
      analysis.languagePreferences.length ? `Language Preferences: ${analysis.languagePreferences.join(', ')}` : '',
      analysis.coreMessages.length ? `Core Messages: ${analysis.coreMessages.join(', ')}` : ''
    ].filter(Boolean);

    return guidelines.join('\n');
  }

  /**
   * Build tone instructions section
   */
  private buildToneInstructions(brandVoice: BrandVoice, analysis: BrandVoiceAnalysis): string {
    const instructions = [
      `Primary Tone: ${analysis.primaryTone} (emphasize this throughout)`,
      analysis.secondaryTones.length ? `Secondary Tones: ${analysis.secondaryTones.join(', ')} (use sparingly for variation)` : '',
      analysis.emotionalRange.length ? `Emotional Range: ${analysis.emotionalRange.join(' to ')}` : '',
      `Tone Consistency: Maintain the ${analysis.primaryTone} tone while adapting to content requirements`
    ].filter(Boolean);

    return instructions.join('\n');
  }

  /**
   * Build constraints section
   */
  private buildConstraints(brandVoice: BrandVoice, context: PromptContext, template: any): string {
    const constraints = [];

    // Word count constraints
    if (template.minWords || template.maxWords) {
      constraints.push(`Word count: ${template.minWords || 'minimum'} - ${template.maxWords || 'maximum'} words`);
    }

    // Platform constraints
    if (context.platform) {
      constraints.push(`Platform requirements: Optimized for ${context.platform}`);
    }

    // Brand compliance constraints
    const compliance = brandVoice.compliance || {};
    if (compliance.content_policies?.review_triggers?.length) {
      constraints.push(`Content review triggers: ${compliance.content_policies.review_triggers.join(', ')}`);
    }
    if (compliance.content_policies?.disclaimer_required) {
      constraints.push(`Required disclaimer: ${compliance.content_policies.default_disclaimer}`);
    }

    // Custom constraints
    if (context.constraints?.length) {
      constraints.push(...context.constraints.map(c => `Custom: ${c}`));
    }

    return constraints.join('\n');
  }

  /**
   * Helper methods for analysis and formatting
   */
  private buildEmotionalRange(tones: Record<string, any>): string[] {
    const toneValues = Object.entries(tones)
      .filter(([, value]) => typeof value === 'number' && value > 0.3)
      .sort(([,a], [,b]) => (a as number) - (b as number));

    if (toneValues.length >= 2) {
      return [toneValues[0][0], toneValues[toneValues.length - 1][0]];
    }
    return [];
  }

  private extractLanguagePreferences(voice: any): string[] {
    const prefs = [];
    if (voice.language_style?.formal > 0.7) prefs.push('formal language');
    if (voice.language_style?.casual > 0.7) prefs.push('casual language');
    if (voice.language_style?.technical > 0.7) prefs.push('technical terms');
    if (voice.language_style?.emotional > 0.7) prefs.push('emotional language');
    return prefs;
  }

  private extractCoreMessages(brand: any, voice: any): string[] {
    const messages = [];
    if (brand.unique_value_proposition) messages.push(brand.unique_value_proposition);
    if (brand.key_differentiators?.length) messages.push(...brand.key_differentiators);
    if (voice.key_messages?.length) messages.push(...voice.key_messages);
    return messages.slice(0, 3); // Limit to top 3
  }

  private formatFormalityLevel(level: number): string {
    if (level < 0.3) return 'very casual';
    if (level < 0.5) return 'casual';
    if (level < 0.7) return 'balanced';
    if (level < 0.9) return 'formal';
    return 'very formal';
  }

  private buildToneMapping(tones: Record<string, any>): string {
    return Object.entries(tones)
      .filter(([, value]) => typeof value === 'number' && value > 0.4)
      .sort(([,a], [,b]) => (b as number) - (a as number))
      .map(([tone, value]) => `${tone}: ${Math.round((value as number) * 100)}%`)
      .join(', ');
  }

  private formatWordLimits(context: PromptContext, template: any): string {
    const min = template.minWords || 'no minimum';
    const max = template.maxWords || 'no maximum';
    return `${min} - ${max} words`;
  }

  private adaptPromptComplexity(prompt: string, analysis: BrandVoiceAnalysis, context: PromptContext): string {
    // Simplified complexity adaptation
    const complexity = this.calculateComplexity(analysis, context);
    
    if (complexity === 'low') {
      // Simplify language and reduce detail
      return prompt.replace(/\b(comprehensive|extensively|meticulously)\b/g, 'clearly');
    } else if (complexity === 'high') {
      // Add more detailed instructions
      return prompt + '\n\nEnsure sophisticated execution with attention to nuanced brand characteristics.';
    }
    
    return prompt;
  }

  private calculateComplexity(analysis: BrandVoiceAnalysis, context: PromptContext): 'low' | 'medium' | 'high' {
    let complexityScore = 0;
    
    // Brand complexity factors
    if (analysis.secondaryTones.length > 2) complexityScore += 1;
    if (analysis.keyPersonalityTraits.length > 3) complexityScore += 1;
    if (analysis.emotionalRange.length > 0) complexityScore += 1;
    
    // Context complexity factors
    if (context.keywords && context.keywords.length > 5) complexityScore += 1;
    if (context.constraints && context.constraints.length > 2) complexityScore += 1;
    if (context.customInstructions) complexityScore += 1;
    
    if (complexityScore <= 2) return 'low';
    if (complexityScore <= 4) return 'medium';
    return 'high';
  }

  private trimPromptToLength(prompt: string, maxLength: number): string {
    if (prompt.length <= maxLength) return prompt;
    
    // Try to trim at sentence boundaries
    const sentences = prompt.split('. ');
    let result = '';
    
    for (const sentence of sentences) {
      if ((result + sentence + '. ').length > maxLength) break;
      result += sentence + '. ';
    }
    
    return result.trim() || prompt.substring(0, maxLength);
  }

  private collectWarnings(brandVoice: BrandVoice, context: PromptContext): string[] {
    const warnings: string[] = [];
    
    // Check for missing brand data
    if (!brandVoice.brand?.name) warnings.push('Brand name is missing');
    if (!brandVoice.voice?.tone || Object.keys(brandVoice.voice.tone).length === 0) {
      warnings.push('Tone characteristics are missing');
    }
    
    // Check for context completeness
    if (!context.targetAudience) warnings.push('Target audience not specified');
    if (!context.contentGoal) warnings.push('Content goal not specified');
    
    return warnings;
  }
}

/**
 * Default instance for easy usage
 */
export const brandVoicePromptBuilder = new BrandVoicePromptBuilder();

/**
 * Quick utility functions for common use cases
 */
export const promptUtils = {
  /**
   * Quick prompt for social media
   */
  async buildSocialPrompt(
    brandVoice: BrandVoice,
    platform: string,
    audience: string,
    goal: string
  ): Promise<string> {
    const result = await brandVoicePromptBuilder.buildPrompt(brandVoice, 'social-media-post', {
      contentType: 'social-media-post',
      platform,
      targetAudience: audience,
      contentGoal: goal,
      contentLength: 'short'
    });
    return result.prompt;
  },

  /**
   * Quick prompt for email campaigns
   */
  async buildEmailPrompt(
    brandVoice: BrandVoice,
    campaignType: string,
    audience: string,
    cta: string
  ): Promise<string> {
    const result = await brandVoicePromptBuilder.buildPrompt(brandVoice, 'email-campaign', {
      contentType: 'email-campaign',
      contentGoal: campaignType,
      targetAudience: audience,
      callToAction: cta,
      contentLength: 'medium'
    });
    return result.prompt;
  },

  /**
   * Get tone description for any content
   */
  getToneDescription(brandVoice: BrandVoice): string {
    return brandVoicePromptBuilder.generateToneDescription(brandVoice);
  }
};

export default BrandVoicePromptBuilder;