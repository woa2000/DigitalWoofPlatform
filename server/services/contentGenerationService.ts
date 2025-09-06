import { OpenAI } from 'openai';
import { BrandVoice } from '../../shared/schemas/brand-voice';
import { PetContentPrompts, PromptContext } from './petContentPrompts';
import { ComplianceChecker } from './complianceChecker';
import { withOpenAILimit } from './openai';
import { performanceMonitor } from './performance-monitor.service';
import Bottleneck from 'bottleneck';

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

export class ContentGenerationService {
  private openai: OpenAI;
  private promptService: PetContentPrompts;
  private complianceChecker: ComplianceChecker;
  private limiter: Bottleneck;

  constructor(
    openai: OpenAI,
    complianceChecker: ComplianceChecker
  ) {
    this.openai = openai;
    this.promptService = new PetContentPrompts();
    this.complianceChecker = complianceChecker;
    
    // Rate limiting configuration
    this.limiter = new Bottleneck({
      reservoir: 50, // 50 requests per interval
      reservoirRefreshAmount: 50,
      reservoirRefreshInterval: 60 * 1000, // 1 minute
      maxConcurrent: 5,
      minTime: 1000 // 1 second between requests
    });
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
          let complianceResult = { isCompliant: true, issues: [], suggestions: [] };
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
}