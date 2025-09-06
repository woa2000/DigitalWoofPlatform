import { OpenAI } from 'openai';
import { BrandVoice } from '../../shared/schemas/brand-voice';
import { PetContentPrompts, PromptContext } from './petContentPrompts';
import { ComplianceChecker } from './complianceChecker';
import { withOpenAILimit } from './openai';
import { performanceMonitor } from './performance-monitor.service';
import Bottleneck from 'bottleneck';
import { CalendarItem, ContentType, BusinessType, CalendarPriority } from '../../shared/types/calendar.js';
import { SeasonalIntelligenceService } from './SeasonalIntelligenceService.js';
import { CampaignTemplateService } from './CampaignTemplateService.js';
import { TimingOptimizationService } from './TimingOptimizationService.js';

export interface ContentBrief {
  id: string;
  userId: string;
  brandVoiceId: string;
  theme: string;
  objective: 'educar' | 'vender' | 'engajar' | 'recall' | 'awareness';
  channel: 'instagram_post' | 'instagram_story' | 'facebook_post' | 'whatsapp' | 'email' | 'website';
  customInstructions?: string;
  wordsToAvoid?: string[];
  urgency: 'low' | 'medium' | 'high';
  createdAt: Date;
}

export interface GeneratedContent {
  id: string;
  briefId: string;
  title: string;
  body: string;
  cta: string;
  hashtags: string[];
  tone_analysis: {
    educational_score?: number;
    approachability?: number;
    persuasiveness?: number;
    trustworthiness?: number;
    brand_alignment: number;
  };
  compliance_notes: string[];
  engagement_prediction: {
    score: number;
    factors: string[];
    reasoning: string;
  };
  quality_metrics: {
    readability_score: number;
    relevance_score: number;
    brand_consistency: number;
    compliance_score: number;
  };
  createdAt: Date;
}

export interface ContentGenerationOptions {
  generateVariations?: number;
  includeEngagementPrediction?: boolean;
  skipComplianceCheck?: boolean;
  temperature?: number;
  maxTokens?: number;
}

// Calendar-specific content generation interfaces
export interface CalendarContentRequest {
  accountId: string;
  businessType: BusinessType;
  contentType: ContentType;
  targetDate: Date;
  channels: string[];
  objectives?: Record<string, number>;
  context?: {
    previousContent?: CalendarItem[];
    campaignId?: string;
    seasonalEvents?: string[];
    brandVoice?: string;
    targetAudience?: string;
    competitorAnalysis?: string;
  };
  preferences?: {
    tone?: 'formal' | 'casual' | 'friendly' | 'professional' | 'playful';
    length?: 'short' | 'medium' | 'long';
    includeHashtags?: boolean;
    includeEmojis?: boolean;
    includeCallToAction?: boolean;
  };
}

export interface CalendarContentResponse {
  title: string;
  description?: string;
  content: {
    primary: string;
    alternatives?: string[];
    captions?: Record<string, string>; // channel-specific captions
    hashtags?: string[];
    callToAction?: string;
    mediaRecommendations?: MediaRecommendation[];
  };
  optimization: {
    optimalPostingTime: Date;
    expectedEngagement: number;
    seasonalRelevance: number;
    audienceAlignment: number;
    competitiveAdvantage: number;
  };
  reasoning: {
    seasonalFactors: string[];
    audienceInsights: string[];
    competitiveAnalysis: string[];
    brandVoiceAlignment: string;
    optimizationNotes: string[];
  };
  metadata: {
    generatedAt: Date;
    confidence: number;
    version: string;
    sources: string[];
  };
}

export interface MediaRecommendation {
  type: 'image' | 'video' | 'carousel' | 'gif' | 'infographic';
  description: string;
  style: string;
  colors?: string[];
  elements?: string[];
  dimensions?: {
    width: number;
    height: number;
    aspectRatio: string;
  };
  channelSpecific?: Record<string, any>;
}

export interface ContentSuggestion {
  id: string;
  title: string;
  contentType: ContentType;
  suggestedDate: Date;
  priority: CalendarPriority;
  reasoning: string;
  seasonalEvent?: string;
  confidence: number;
  estimatedEngagement: number;
  keywords: string[];
  channels: string[];
}

export interface BatchCalendarContentRequest {
  accountId: string;
  businessType: BusinessType;
  period: {
    start: Date;
    end: Date;
  };
  contentTypes: ContentType[];
  channels: string[];
  frequency: number; // posts per week
  campaignId?: string;
  preferences?: CalendarContentRequest['preferences'];
}

export interface BatchCalendarContentResponse {
  suggestions: ContentSuggestion[];
  calendar: CalendarItem[];
  insights: {
    totalSuggestions: number;
    seasonalEvents: number;
    estimatedTotalEngagement: number;
    contentBalance: Record<ContentType, number>;
    channelDistribution: Record<string, number>;
  };
  recommendations: string[];
}

export class ContentGenerationService {
  private openai: OpenAI;
  private promptService: PetContentPrompts;
  private complianceChecker: ComplianceChecker;
  private limiter: Bottleneck;
  private seasonalIntelligenceService?: SeasonalIntelligenceService;
  private campaignTemplateService?: CampaignTemplateService;
  private timingOptimizationService?: TimingOptimizationService;

  constructor(
    openai: OpenAI,
    complianceChecker: ComplianceChecker,
    seasonalIntelligenceService?: SeasonalIntelligenceService,
    campaignTemplateService?: CampaignTemplateService,
    timingOptimizationService?: TimingOptimizationService
  ) {
    this.openai = openai;
    this.promptService = new PetContentPrompts();
    this.complianceChecker = complianceChecker;
    this.seasonalIntelligenceService = seasonalIntelligenceService;
    this.campaignTemplateService = campaignTemplateService;
    this.timingOptimizationService = timingOptimizationService;
    
    // Rate limiting configuration
    this.limiter = new Bottleneck({
      reservoir: 50, // 50 requests per interval
      reservoirRefreshAmount: 50,
      reservoirRefreshInterval: 60 * 1000, // 1 minute
      maxConcurrent: 5,
      minTime: 1000 // 1 second between requests
    });

    console.log('[ContentGenerationService] Service initialized with calendar integration');
  }

  async generateContent(
    brief: ContentBrief,
    brandVoice: BrandVoice,
    options: ContentGenerationOptions = {}
  ): Promise<GeneratedContent[]> {
    const timer = performanceMonitor.startTimer('content_generation', {
      channel: brief.channel,
      objective: brief.objective,
      variations: options.generateVariations || 3,
      userId: brief.userId
    });

    try {
      const {
        generateVariations = 3,
        includeEngagementPrediction = true,
        skipComplianceCheck = false,
        temperature = 0.7,
        maxTokens = 1000
      } = options;

      // Build prompt context
      const promptContext: PromptContext = {
        theme: brief.theme,
        objective: brief.objective,
        channel: brief.channel,
        customInstructions: brief.customInstructions,
        wordsToAvoid: brief.wordsToAvoid
      };

      // Get specialized prompt for the objective
      const prompt = this.promptService.getPromptByObjective(
        brief.objective,
        brandVoice,
        promptContext
      );

      // Generate content with rate limiting
      const response = await this.limiter.schedule(() =>
        withOpenAILimit(async () => {
          return await this.openai.chat.completions.create({
            model: 'gpt-4',
            messages: [
              {
                role: 'system',
                content: 'Você é um especialista em marketing de conteúdo para o setor pet. Sempre retorne JSON válido conforme solicitado.'
              },
              {
                role: 'user',
                content: prompt
              }
            ],
            temperature,
            max_tokens: maxTokens,
            response_format: { type: 'json_object' }
          });
        })
      ) as OpenAI.Chat.Completions.ChatCompletion;

      const aiResponse = response.choices[0]?.message?.content;
      if (!aiResponse) {
        throw new Error('Empty response from OpenAI');
      }

      // Parse AI response
      let parsedResponse;
      try {
        parsedResponse = JSON.parse(aiResponse);
      } catch (error) {
        throw new Error(`Failed to parse AI response as JSON: ${error}`);
      }

      if (!parsedResponse.variations || !Array.isArray(parsedResponse.variations)) {
        throw new Error('Invalid response format: missing variations array');
      }

      // Process each variation
      const generatedContents: GeneratedContent[] = [];
      
      for (const [index, variation] of parsedResponse.variations.slice(0, generateVariations).entries()) {
        try {
          // Compliance check
          let complianceResult: any = { isCompliant: true, issues: [], suggestions: [], score: 1.0 };
          if (!skipComplianceCheck) {
            complianceResult = await this.complianceChecker.checkContent(
              variation.body,
              brandVoice.brand.segment
            );
          }

          // Engagement prediction
          let engagementPrediction = {
            score: 0.5,
            factors: ['baseline'],
            reasoning: 'Engagement prediction disabled'
          };
          if (includeEngagementPrediction) {
            engagementPrediction = await this.predictEngagement(variation, brief, brandVoice);
          }

          // Quality metrics calculation
          const qualityMetrics = this.calculateQualityMetrics(variation, brandVoice, complianceResult);

          const generatedContent: GeneratedContent = {
            id: `${brief.id}_gen_${index + 1}`,
            briefId: brief.id,
            title: variation.title || '',
            body: variation.body || '',
            cta: variation.cta || '',
            hashtags: Array.isArray(variation.hashtags) ? variation.hashtags : [],
            tone_analysis: {
              ...variation.tone_analysis,
              brand_alignment: variation.tone_analysis?.brand_alignment || 0.8
            },
            compliance_notes: [
              ...(variation.compliance_notes || []),
              ...complianceResult.issues,
              ...complianceResult.suggestions
            ],
            engagement_prediction: engagementPrediction,
            quality_metrics: qualityMetrics,
            createdAt: new Date()
          };

          generatedContents.push(generatedContent);
        } catch (variationError) {
          console.error(`Error processing variation ${index + 1}:`, variationError);
          // Continue with other variations
        }
      }

      if (generatedContents.length === 0) {
        timer.end(false, 'No valid content variations were generated');
        throw new Error('No valid content variations were generated');
      }

      timer.end(true);
      return generatedContents;

    } catch (error) {
      console.error('Content generation failed:', error);
      timer.end(false, error instanceof Error ? error.message : 'Unknown error');
      throw new Error(`Content generation failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  private async predictEngagement(
    variation: any,
    brief: ContentBrief,
    brandVoice: BrandVoice
  ): Promise<{ score: number; factors: string[]; reasoning: string }> {
    // Heuristic engagement prediction based on content analysis
    let score = 0.5; // Base score
    const factors: string[] = [];

    // Content length factor
    const wordCount = variation.body.split(' ').length;
    if (brief.channel.includes('instagram') && wordCount <= 150) {
      score += 0.1;
      factors.push('optimal_length_instagram');
    } else if (brief.channel.includes('facebook') && wordCount <= 250) {
      score += 0.1;
      factors.push('optimal_length_facebook');
    }

    // Question engagement factor
    if (variation.body.includes('?')) {
      score += 0.15;
      factors.push('includes_question');
    }

    // Emoji usage (based on brand voice settings)
    const emojiUsage = brandVoice.voice.style.use_emojis;
    const emojiRegex = /[\uD83C-\uDBFF\uDC00-\uDFFF]+/g;
    if (emojiUsage !== 'none' && emojiRegex.test(variation.body)) {
      score += 0.1;
      factors.push('emoji_usage');
    }

    // CTA presence and quality
    if (variation.cta && variation.cta.length > 5) {
      score += 0.1;
      factors.push('clear_cta');
    }

    // Brand alignment factor
    const brandAlignment = variation.tone_analysis?.brand_alignment || 0.8;
    score += (brandAlignment - 0.5) * 0.2;
    factors.push(`brand_alignment_${brandAlignment > 0.8 ? 'high' : 'medium'}`);

    // Urgency factor
    if (brief.urgency === 'high') {
      score += 0.05;
      factors.push('high_urgency');
    }

    // Cap score at 1.0
    score = Math.min(score, 1.0);

    return {
      score: Number(score.toFixed(2)),
      factors,
      reasoning: `Heuristic prediction based on ${factors.length} factors: ${factors.join(', ')}`
    };
  }

  private calculateQualityMetrics(
    variation: any,
    brandVoice: BrandVoice,
    complianceResult: any
  ): GeneratedContent['quality_metrics'] {
    // Readability score (simplified)
    const wordCount = variation.body.split(' ').length;
    const sentenceCount = variation.body.split(/[.!?]+/).length;
    const avgWordsPerSentence = wordCount / Math.max(sentenceCount, 1);
    let readabilityScore = 1.0;
    
    if (avgWordsPerSentence > 20) {
      readabilityScore -= 0.2; // Too complex
    } else if (avgWordsPerSentence < 5) {
      readabilityScore -= 0.1; // Too simple
    }

    // Relevance score (keyword presence)
    const themeWords = variation.body.toLowerCase();
    let relevanceScore = 0.7; // Base relevance
    
    if (themeWords.includes('pet') || themeWords.includes('tutor')) {
      relevanceScore += 0.1;
    }
    if (brandVoice.voice.lexicon.prefer.some(word => 
      themeWords.includes(word.toLowerCase())
    )) {
      relevanceScore += 0.1;
    }

    // Brand consistency
    const brandConsistency = variation.tone_analysis?.brand_alignment || 0.8;

    // Compliance score - use the score from compliance checker
    const complianceScore = complianceResult.score;

    return {
      readability_score: Number(readabilityScore.toFixed(2)),
      relevance_score: Number(relevanceScore.toFixed(2)),
      brand_consistency: Number(brandConsistency.toFixed(2)),
      compliance_score: Number(complianceScore.toFixed(2))
    };
  }

  async generateBatchContent(
    briefs: ContentBrief[],
    brandVoices: Map<string, BrandVoice>,
    options: ContentGenerationOptions = {}
  ): Promise<Map<string, GeneratedContent[]>> {
    const results = new Map<string, GeneratedContent[]>();
    
    // Process briefs with concurrency control
    const batches = this.chunkArray(briefs, 3); // Process 3 at a time
    
    for (const batch of batches) {
      const batchPromises = batch.map(async (brief) => {
        const brandVoice = brandVoices.get(brief.brandVoiceId);
        if (!brandVoice) {
          throw new Error(`Brand voice not found: ${brief.brandVoiceId}`);
        }
        
        try {
          const content = await this.generateContent(brief, brandVoice, options);
          results.set(brief.id, content);
        } catch (error) {
          console.error(`Failed to generate content for brief ${brief.id}:`, error);
          results.set(brief.id, []);
        }
      });
      
      await Promise.all(batchPromises);
    }
    
    return results;
  }

  private chunkArray<T>(array: T[], chunkSize: number): T[][] {
    const chunks: T[][] = [];
    for (let i = 0; i < array.length; i += chunkSize) {
      chunks.push(array.slice(i, i + chunkSize));
    }
    return chunks;
  }

  /**
   * Generate intelligent calendar-aware content for a specific request
   */
  async generateCalendarContent(request: CalendarContentRequest): Promise<CalendarContentResponse> {
    console.log(`[ContentGenerationService] Generating calendar content for ${request.contentType} on ${request.targetDate.toISOString()}`);

    try {
      // Get seasonal intelligence if available
      const seasonalContext = this.seasonalIntelligenceService 
        ? await this.seasonalIntelligenceService.getSeasonalSuggestions(
            request.businessType,
            { start: request.targetDate, end: request.targetDate }
          )
        : { suggestions: [], insights: [] };

      // Get optimal timing if available
      const optimalTiming = this.timingOptimizationService
        ? await this.timingOptimizationService.calculateOptimalTiming(
            request.accountId,
            request.contentType,
            request.channels[0] || 'instagram',
            request.targetDate
          )
        : { recommendedTimes: [{ timestamp: request.targetDate, expectedEngagement: 100 }] };

      // Generate base content using AI prompts with seasonal context
      const baseContent = await this.generateCalendarBaseContent(request, seasonalContext);

      // Optimize for channels
      const channelOptimizedContent = this.optimizeForChannels(baseContent, request.channels);

      // Calculate optimization metrics
      const optimization = this.calculateOptimizationMetrics(
        request,
        seasonalContext,
        optimalTiming
      );

      // Generate reasoning
      const reasoning = this.generateReasoning(request, seasonalContext, optimalTiming);

      return {
        title: baseContent.title,
        description: baseContent.description,
        content: channelOptimizedContent,
        optimization,
        reasoning,
        metadata: {
          generatedAt: new Date(),
          confidence: this.calculateConfidence(request, seasonalContext),
          version: '1.0.0',
          sources: ['SeasonalIntelligence', 'TimingOptimization', 'AIGeneration']
        }
      };

    } catch (error) {
      console.error('[ContentGenerationService] Error generating calendar content:', error);
      throw new Error(`Calendar content generation failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  /**
   * Generate batch content suggestions for a calendar period
   */
  async generateBatchCalendarContent(request: BatchCalendarContentRequest): Promise<BatchCalendarContentResponse> {
    console.log(`[ContentGenerationService] Generating batch calendar content for ${request.period.start.toISOString()} to ${request.period.end.toISOString()}`);

    try {
      // Get seasonal events for the period
      const seasonalSuggestions = this.seasonalIntelligenceService
        ? await this.seasonalIntelligenceService.getSeasonalSuggestions(
            request.businessType,
            request.period
          )
        : { suggestions: [], insights: [] };

      // Calculate content distribution
      const contentDistribution = this.calculateContentDistribution(
        request.contentTypes,
        request.frequency,
        request.period
      );

      // Generate suggestions for each content slot
      const suggestions: ContentSuggestion[] = [];
      const calendar: CalendarItem[] = [];

      for (const slot of contentDistribution) {
        const suggestion = await this.generateContentSuggestion(
          request,
          slot,
          seasonalSuggestions,
          suggestions.length
        );

        suggestions.push(suggestion);

        // Create calendar item
        const calendarItem: CalendarItem = {
          id: `generated-${Date.now()}-${suggestions.length}`,
          account_id: request.accountId,
          user_id: 'ai-generated',
          title: suggestion.title,
          content_type: suggestion.contentType,
          scheduled_for: suggestion.suggestedDate,
          timezone: 'America/Sao_Paulo',
          priority: suggestion.priority,
          status: 'draft',
          channels: suggestion.channels,
          tags: suggestion.keywords,
          campaign_id: request.campaignId,
          predicted_engagement: suggestion.estimatedEngagement,
          created_at: new Date(),
          updated_at: new Date()
        };

        calendar.push(calendarItem);
      }

      // Generate insights
      const insights = this.generateBatchInsights(suggestions, request);

      // Generate recommendations
      const recommendations = this.generateBatchRecommendations(suggestions, seasonalSuggestions);

      return {
        suggestions,
        calendar,
        insights,
        recommendations
      };

    } catch (error) {
      console.error('[ContentGenerationService] Error generating batch calendar content:', error);
      throw new Error(`Batch calendar content generation failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  /**
   * Generate content suggestions based on current trends and calendar gaps
   */
  async generateSmartSuggestions(
    accountId: string,
    businessType: BusinessType,
    currentCalendar: CalendarItem[],
    period: { start: Date; end: Date }
  ): Promise<ContentSuggestion[]> {
    console.log(`[ContentGenerationService] Generating smart suggestions for calendar gaps`);

    try {
      // Analyze calendar gaps
      const gaps = this.analyzeCalendarGaps(currentCalendar, period);

      // Get seasonal opportunities
      const seasonalSuggestions = this.seasonalIntelligenceService
        ? await this.seasonalIntelligenceService.getSeasonalSuggestions(
            businessType,
            period
          )
        : { suggestions: [], insights: [] };

      // Generate suggestions for gaps
      const suggestions: ContentSuggestion[] = [];

      for (const gap of gaps) {
        const seasonalEvents = Array.isArray(seasonalSuggestions) ? seasonalSuggestions : seasonalSuggestions.suggestions;
        const seasonalEvent = seasonalEvents.find((s: any) => 
          s.suggestedDate >= gap.start && s.suggestedDate <= gap.end
        );

        const suggestion = await this.generateGapSuggestion(
          gap,
          seasonalEvent,
          businessType,
          accountId
        );

        if (suggestion) {
          suggestions.push(suggestion);
        }
      }

      // Sort by priority and confidence
      return suggestions.sort((a, b) => {
        const priorityWeight = { urgent: 4, high: 3, medium: 2, low: 1 };
        const aPriority = priorityWeight[a.priority];
        const bPriority = priorityWeight[b.priority];
        
        if (aPriority !== bPriority) {
          return bPriority - aPriority;
        }
        
        return b.confidence - a.confidence;
      });

    } catch (error) {
      console.error('[ContentGenerationService] Error generating smart suggestions:', error);
      throw new Error(`Smart suggestions generation failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  // Calendar-specific helper methods
  private async generateCalendarBaseContent(
    request: CalendarContentRequest,
    seasonalContext: any
  ): Promise<{ title: string; description?: string; content: string }> {
    const seasonalEvent = seasonalContext.suggestions[0];
    const businessTypeContext = this.getBusinessTypeContext(request.businessType);
    const contentTypeTemplate = this.getContentTypeTemplate(request.contentType);

    // Generate title
    const title = this.generateTitle(request, seasonalEvent, businessTypeContext);

    // Generate main content
    const content = this.generateMainContent(
      request,
      seasonalEvent,
      businessTypeContext,
      contentTypeTemplate
    );

    // Generate description if needed
    const description = request.contentType === 'educativo' || request.contentType === 'promocional'
      ? this.generateDescription(title, content)
      : undefined;

    return {
      title,
      description,
      content
    };
  }

  private optimizeForChannels(
    baseContent: { title: string; description?: string; content: string },
    channels: string[]
  ): CalendarContentResponse['content'] {
    const captions: Record<string, string> = {};
    const mediaRecommendations: MediaRecommendation[] = [];

    for (const channel of channels) {
      switch (channel.toLowerCase()) {
        case 'instagram':
          captions[channel] = this.optimizeForInstagram(baseContent.content);
          mediaRecommendations.push({
            type: 'image',
            description: 'High-quality, visually appealing photo with pets',
            style: 'bright, colorful, engaging',
            dimensions: { width: 1080, height: 1080, aspectRatio: '1:1' },
            colors: ['warm tones', 'pet-friendly colors'],
            elements: ['pets', 'lifestyle', 'branding']
          });
          break;

        case 'facebook':
          captions[channel] = this.optimizeForFacebook(baseContent.content);
          mediaRecommendations.push({
            type: 'image',
            description: 'Informative image with text overlay',
            style: 'professional, trustworthy',
            dimensions: { width: 1200, height: 630, aspectRatio: '1.91:1' },
            elements: ['educational content', 'trust signals', 'clear text']
          });
          break;

        case 'linkedin':
          captions[channel] = this.optimizeForLinkedIn(baseContent.content);
          break;

        case 'tiktok':
          captions[channel] = this.optimizeForTikTok(baseContent.content);
          mediaRecommendations.push({
            type: 'video',
            description: 'Short, engaging video with pets',
            style: 'trendy, fun, authentic',
            dimensions: { width: 1080, height: 1920, aspectRatio: '9:16' },
            elements: ['pets in action', 'trending audio', 'quick tips']
          });
          break;

        default:
          captions[channel] = baseContent.content;
      }
    }

    // Generate hashtags
    const hashtags = this.generateHashtags(baseContent.content, channels);

    // Generate call to action
    const callToAction = this.generateCallToAction(channels);

    return {
      primary: baseContent.content,
      alternatives: this.generateAlternatives(baseContent.content),
      captions,
      hashtags,
      callToAction,
      mediaRecommendations
    };
  }

  private calculateOptimizationMetrics(
    request: CalendarContentRequest,
    seasonalContext: any,
    optimalTiming: any
  ): CalendarContentResponse['optimization'] {
    const seasonalRelevance = seasonalContext.suggestions.length > 0 ? 85 : 50;
    const audienceAlignment = this.calculateAudienceAlignment(request);
    const competitiveAdvantage = this.calculateCompetitiveAdvantage(request);
    
    return {
      optimalPostingTime: optimalTiming.recommendedTimes[0]?.timestamp || request.targetDate,
      expectedEngagement: optimalTiming.recommendedTimes[0]?.expectedEngagement || 0,
      seasonalRelevance,
      audienceAlignment,
      competitiveAdvantage
    };
  }

  private generateReasoning(
    request: CalendarContentRequest,
    seasonalContext: any,
    optimalTiming: any
  ): CalendarContentResponse['reasoning'] {
    const seasonalFactors = seasonalContext.suggestions.map((s: any) => 
      `${s.title}: ${s.reasoning}`
    );

    const audienceInsights = [
      `Target audience: ${request.context?.targetAudience || 'Pet owners'}`,
      `Business type: ${request.businessType}`,
      `Content type: ${request.contentType}`
    ];

    const competitiveAnalysis = [
      'Content positioned to stand out from competitors',
      'Seasonal relevance provides competitive advantage',
      'Multi-channel optimization ensures broader reach'
    ];

    const optimizationNotes = [
      `Optimal posting time: ${optimalTiming.recommendedTimes[0]?.reasoning || 'Based on general best practices'}`,
      'Content length optimized for platform engagement',
      'Hashtag strategy targets relevant pet community'
    ];

    return {
      seasonalFactors,
      audienceInsights,
      competitiveAnalysis,
      brandVoiceAlignment: 'Content aligns with professional yet friendly brand voice',
      optimizationNotes
    };
  }

  // Business type context helper
  private getBusinessTypeContext(businessType: BusinessType): Record<string, any> {
    const contexts = {
      veterinaria: {
        expertise: 'medical',
        tone: 'professional',
        focus: 'health and wellness',
        authority: 'high'
      },
      petshop: {
        expertise: 'products',
        tone: 'friendly',
        focus: 'convenience and quality',
        authority: 'medium'
      },
      estetica: {
        expertise: 'grooming',
        tone: 'caring',
        focus: 'beauty and comfort',
        authority: 'medium'
      },
      hotel: {
        expertise: 'care',
        tone: 'trustworthy',
        focus: 'safety and comfort',
        authority: 'high'
      },
      adestramento: {
        expertise: 'behavior',
        tone: 'encouraging',
        focus: 'training and development',
        authority: 'high'
      }
    };

    return contexts[businessType] || contexts.petshop;
  }

  private getContentTypeTemplate(contentType: ContentType): Record<string, any> {
    const templates = {
      educativo: {
        structure: 'problem -> solution -> action',
        elements: ['tip', 'explanation', 'call to action'],
        tone: 'informative'
      },
      promocional: {
        structure: 'benefit -> offer -> urgency',
        elements: ['value proposition', 'discount', 'deadline'],
        tone: 'persuasive'
      },
      recall: {
        structure: 'reminder -> importance -> action',
        elements: ['health reminder', 'consequences', 'scheduling'],
        tone: 'caring'
      },
      engajamento: {
        structure: 'question -> interaction -> community',
        elements: ['poll', 'question', 'user-generated content'],
        tone: 'conversational'
      },
      awareness: {
        structure: 'awareness -> education -> prevention',
        elements: ['issue highlight', 'information', 'prevention tips'],
        tone: 'informative'
      }
    };

    return templates[contentType] || templates.educativo;
  }

  private generateTitle(
    request: CalendarContentRequest,
    seasonalEvent: any,
    businessContext: any
  ): string {
    const templates: Record<string, string[]> = {
      educativo: [
        `Como cuidar do seu pet durante ${seasonalEvent?.name || 'esta época'}`,
        `Dicas importantes de ${businessContext.focus} para pets`,
        `O que todo tutor precisa saber sobre ${businessContext.expertise}`
      ],
      promocional: [
        `Oferta especial: ${businessContext.focus} com desconto`,
        `Aproveite nossa promoção de ${seasonalEvent?.name || 'temporada'}`,
        `Desconto imperdível em ${businessContext.expertise}`
      ],
      recall: [
        `Lembrete importante: ${businessContext.expertise}`,
        `Não esqueça: cuidados essenciais para seu pet`
      ],
      engajamento: [
        `Que tipo de pet você tem?`,
        `Compartilhe sua experiência com ${businessContext.focus}`
      ],
      awareness: [
        `Você sabia? Cuidados com ${businessContext.focus}`,
        `Alerta: ${businessContext.expertise} é fundamental`
      ]
    };

    const typeTemplates = templates[request.contentType] || templates.educativo;
    return typeTemplates[Math.floor(Math.random() * typeTemplates.length)];
  }

  private generateMainContent(
    request: CalendarContentRequest,
    seasonalEvent: any,
    businessContext: any,
    contentTemplate: any
  ): string {
    const baseContent = `Cuidar do seu pet é nossa prioridade! Como especialistas em ${businessContext.focus}, 
    queremos compartilhar dicas importantes para o bem-estar do seu companheiro.`;

    const seasonalAddon = seasonalEvent 
      ? `Durante ${seasonalEvent.name}, é especialmente importante ${seasonalEvent.reasoning}.`
      : '';

    const actionCall = contentTemplate.tone === 'persuasive'
      ? 'Entre em contato conosco e garante o melhor cuidado para seu pet!'
      : 'Tem dúvidas? Estamos aqui para ajudar!';

    return `${baseContent}\n\n${seasonalAddon}\n\n${actionCall}`;
  }

  private generateDescription(title: string, content: string): string {
    return content.split('\n')[0].substring(0, 160) + '...';
  }

  // Channel optimization methods
  private optimizeForInstagram(content: string): string {
    return content + '\n\n📸 Compartilhe sua experiência nos Stories!\n🐾 Marque nosso perfil para repost';
  }

  private optimizeForFacebook(content: string): string {
    return content + '\n\nCompartilhe este post para ajudar outros tutores!';
  }

  private optimizeForLinkedIn(content: string): string {
    return content.replace(/pet/g, 'animal de estimação')
                 .replace(/🐾/g, '')
                 .replace(/📸/g, '');
  }

  private optimizeForTikTok(content: string): string {
    return content.split('\n')[0] + '\n\n#PetTok #DicasPet #VetTips';
  }

  private generateHashtags(content: string, channels: string[]): string[] {
    const baseHashtags = ['#pets', '#cuidadoanimal', '#vetlife', '#petcare'];
    const channelSpecific = channels.includes('instagram') 
      ? ['#instadog', '#instacat', '#petlover']
      : [];

    return [...baseHashtags, ...channelSpecific];
  }

  private generateCallToAction(channels: string[]): string {
    if (channels.includes('instagram')) {
      return 'Salve este post e compartilhe com outros tutores! 📌';
    }
    return 'Entre em contato para mais informações!';
  }

  private generateAlternatives(content: string): string[] {
    return [
      content.replace(/nosso/g, 'nosso time'),
      content.replace(/pet/g, 'animalzinho'),
      content + '\n\nO que você acha dessa dica?'
    ];
  }

  // Calculation methods
  private calculateAudienceAlignment(request: CalendarContentRequest): number {
    const alignmentMatrix = {
      veterinaria: { educativo: 95, recall: 90, awareness: 85, promocional: 70, engajamento: 65 },
      petshop: { promocional: 90, educativo: 75, engajamento: 85, recall: 60, awareness: 70 },
      estetica: { promocional: 85, educativo: 70, engajamento: 80, recall: 75, awareness: 65 },
      hotel: { promocional: 80, educativo: 75, engajamento: 85, recall: 70, awareness: 65 },
      adestramento: { educativo: 90, engajamento: 85, awareness: 80, promocional: 75, recall: 60 }
    };

    return alignmentMatrix[request.businessType]?.[request.contentType] || 70;
  }

  private calculateCompetitiveAdvantage(request: CalendarContentRequest): number {
    return Math.floor(Math.random() * 30) + 60; // 60-90%
  }

  private calculateConfidence(request: CalendarContentRequest, seasonalContext: any): number {
    let confidence = 70; // base confidence

    if (seasonalContext.suggestions.length > 0) confidence += 15;
    if (this.calculateAudienceAlignment(request) > 80) confidence += 10;
    if (request.preferences) confidence += 5;

    return Math.min(confidence, 100);
  }

  // Batch generation methods
  private calculateContentDistribution(
    contentTypes: ContentType[],
    frequency: number,
    period: { start: Date; end: Date }
  ): Array<{ date: Date; contentType: ContentType }> {
    const distribution: Array<{ date: Date; contentType: ContentType }> = [];
    const daysInPeriod = Math.ceil((period.end.getTime() - period.start.getTime()) / (1000 * 60 * 60 * 24));
    const weeksInPeriod = Math.ceil(daysInPeriod / 7);
    const totalPosts = weeksInPeriod * frequency;

    const postsPerType = Math.floor(totalPosts / contentTypes.length);
    const extraPosts = totalPosts % contentTypes.length;

    let postIndex = 0;
    for (let i = 0; i < contentTypes.length; i++) {
      const postsForThisType = postsPerType + (i < extraPosts ? 1 : 0);
      
      for (let j = 0; j < postsForThisType; j++) {
        const dayOffset = Math.floor((postIndex * daysInPeriod) / totalPosts);
        const date = new Date(period.start.getTime() + dayOffset * 24 * 60 * 60 * 1000);
        
        distribution.push({
          date,
          contentType: contentTypes[i]
        });
        
        postIndex++;
      }
    }

    return distribution.sort((a, b) => a.date.getTime() - b.date.getTime());
  }

  private async generateContentSuggestion(
    request: BatchCalendarContentRequest,
    slot: { date: Date; contentType: ContentType },
    seasonalSuggestions: any,
    index: number
  ): Promise<ContentSuggestion> {
    const seasonalEvent = seasonalSuggestions.suggestions.find((s: any) => 
      Math.abs(s.suggestedDate.getTime() - slot.date.getTime()) < 7 * 24 * 60 * 60 * 1000
    );

    const businessContext = this.getBusinessTypeContext(request.businessType);
    const title = this.generateTitle(
      { ...request, contentType: slot.contentType, targetDate: slot.date } as CalendarContentRequest,
      seasonalEvent,
      businessContext
    );

    return {
      id: `suggestion-${Date.now()}-${index}`,
      title,
      contentType: slot.contentType,
      suggestedDate: slot.date,
      priority: seasonalEvent ? 'high' : 'medium',
      reasoning: seasonalEvent 
        ? `Relacionado ao evento sazonal: ${seasonalEvent.name}`
        : `Conteúdo ${slot.contentType} programado para manter consistência`,
      seasonalEvent: seasonalEvent?.name,
      confidence: seasonalEvent ? 85 : 70,
      estimatedEngagement: Math.floor(Math.random() * 500) + 100,
      keywords: ['pets', 'cuidado', businessContext.focus],
      channels: request.channels
    };
  }

  private generateBatchInsights(
    suggestions: ContentSuggestion[],
    request: BatchCalendarContentRequest
  ): BatchCalendarContentResponse['insights'] {
    const contentBalance: Record<ContentType, number> = {} as Record<ContentType, number>;
    const channelDistribution: Record<string, number> = {};

    suggestions.forEach(suggestion => {
      contentBalance[suggestion.contentType] = (contentBalance[suggestion.contentType] || 0) + 1;
      suggestion.channels.forEach(channel => {
        channelDistribution[channel] = (channelDistribution[channel] || 0) + 1;
      });
    });

    const seasonalEvents = suggestions.filter(s => s.seasonalEvent).length;
    const estimatedTotalEngagement = suggestions.reduce((sum, s) => sum + s.estimatedEngagement, 0);

    return {
      totalSuggestions: suggestions.length,
      seasonalEvents,
      estimatedTotalEngagement,
      contentBalance,
      channelDistribution
    };
  }

  private generateBatchRecommendations(
    suggestions: ContentSuggestion[],
    seasonalSuggestions: any
  ): string[] {
    const recommendations: string[] = [];

    const contentTypesSet = new Set(suggestions.map(s => s.contentType));
    const contentTypes = Array.from(contentTypesSet);
    if (contentTypes.length < 3) {
      recommendations.push('Considere diversificar os tipos de conteúdo para maior engajamento');
    }

    const seasonalCount = suggestions.filter(s => s.seasonalEvent).length;
    if (seasonalCount < suggestions.length * 0.3) {
      recommendations.push('Adicione mais conteúdo sazonal para aproveitar eventos relevantes');
    }

    const avgEngagement = suggestions.reduce((sum, s) => sum + s.estimatedEngagement, 0) / suggestions.length;
    if (avgEngagement < 200) {
      recommendations.push('Considere adicionar mais conteúdo de engajamento para aumentar interação');
    }

    return recommendations;
  }

  // Calendar analysis methods
  private analyzeCalendarGaps(
    currentCalendar: CalendarItem[],
    period: { start: Date; end: Date }
  ): Array<{ start: Date; end: Date; daysGap: number }> {
    const gaps: Array<{ start: Date; end: Date; daysGap: number }> = [];
    
    const sortedItems = currentCalendar
      .filter(item => item.scheduled_for >= period.start && item.scheduled_for <= period.end)
      .sort((a, b) => a.scheduled_for.getTime() - b.scheduled_for.getTime());

    for (let i = 0; i < sortedItems.length - 1; i++) {
      const current = sortedItems[i];
      const next = sortedItems[i + 1];
      const daysDiff = Math.floor((next.scheduled_for.getTime() - current.scheduled_for.getTime()) / (1000 * 60 * 60 * 24));

      if (daysDiff > 2) {
        gaps.push({
          start: new Date(current.scheduled_for.getTime() + 24 * 60 * 60 * 1000),
          end: new Date(next.scheduled_for.getTime() - 24 * 60 * 60 * 1000),
          daysGap: daysDiff - 1
        });
      }
    }

    return gaps;
  }

  private async generateGapSuggestion(
    gap: { start: Date; end: Date; daysGap: number },
    seasonalEvent: any,
    businessType: BusinessType,
    accountId: string
  ): Promise<ContentSuggestion | null> {
    if (gap.daysGap < 1) return null;

    const suggestedDate = new Date(gap.start.getTime() + Math.floor(gap.daysGap / 2) * 24 * 60 * 60 * 1000);
    const businessContext = this.getBusinessTypeContext(businessType);

    const contentType: ContentType = seasonalEvent ? 'awareness' : 'educativo';
    const title = seasonalEvent 
      ? `Cuidados especiais durante ${seasonalEvent.name}`
      : `Dica importante sobre ${businessContext.focus}`;

    return {
      id: `gap-suggestion-${Date.now()}`,
      title,
      contentType,
      suggestedDate,
      priority: seasonalEvent ? 'high' : 'medium',
      reasoning: seasonalEvent 
        ? `Oportunidade de conteúdo sazonal: ${seasonalEvent.name}`
        : `Preencher lacuna no calendário com conteúdo educativo`,
      seasonalEvent: seasonalEvent?.name,
      confidence: seasonalEvent ? 80 : 65,
      estimatedEngagement: seasonalEvent ? 300 : 150,
      keywords: ['pets', businessContext.focus],
      channels: ['instagram', 'facebook']
    };
  }
}