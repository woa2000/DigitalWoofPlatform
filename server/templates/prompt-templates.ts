/**
 * Brand Voice Prompt Templates
 * 
 * Templates optimized for AI content generation using Brand Voice JSON data.
 * Provides consistent prompt structure for different content types while maintaining
 * brand identity and voice characteristics.
 */

import type { BrandVoice } from '../../shared/schemas/brand-voice.js';

/**
 * Content type definitions for template selection
 */
export type ContentType = 
  | 'social-media-post'
  | 'blog-article'
  | 'email-campaign'
  | 'product-description'
  | 'ad-copy'
  | 'website-copy'
  | 'video-script'
  | 'press-release'
  | 'customer-support'
  | 'internal-communication';

/**
 * Prompt generation context for dynamic content creation
 */
export interface PromptContext {
  contentType: ContentType;
  targetAudience?: string;
  contentGoal?: string;
  platform?: string;
  contentLength?: 'short' | 'medium' | 'long';
  callToAction?: string;
  keywords?: string[];
  constraints?: string[];
  customInstructions?: string;
}

/**
 * Template structure for consistent prompt generation
 */
interface PromptTemplate {
  type: ContentType;
  baseTemplate: string;
  toneSection: string;
  voiceSection: string;
  constraintsSection: string;
  examplesSection?: string;
  minWords?: number;
  maxWords?: number;
}

/**
 * Core prompt templates for different content types
 */
export class BrandVoicePromptTemplates {
  private static readonly templates: Record<ContentType, PromptTemplate> = {
    'social-media-post': {
      type: 'social-media-post',
      baseTemplate: `Create a social media post that captures attention and drives engagement while staying true to the brand identity.

Content Requirements:
- Platform: {platform}
- Target Audience: {targetAudience}
- Goal: {contentGoal}
- Length: {contentLength}
{callToAction}

{brandContext}
{voiceGuidelines}
{toneInstructions}
{constraints}

Generate content that feels authentic to this brand and resonates with the target audience.`,
      
      toneSection: `Tone Characteristics to Emphasize:
{toneMapping}

Maintain these tone qualities throughout the content while adapting to the platform's style.`,

      voiceSection: `Voice Guidelines:
- Personality: {personality}
- Communication Style: {communicationStyle}
- Language Preferences: {languageStyle}
- Values to Highlight: {coreValues}`,

      constraintsSection: `Content Constraints:
- Character/word limits: {wordLimits}
- Platform guidelines: {platformConstraints}
- Brand restrictions: {brandConstraints}
{customConstraints}`,
      
      minWords: 10,
      maxWords: 100
    },

    'blog-article': {
      type: 'blog-article',
      baseTemplate: `Write a comprehensive blog article that provides value to readers while showcasing the brand's expertise and personality.

Article Requirements:
- Topic: {contentGoal}
- Target Audience: {targetAudience}
- Length: {contentLength}
- SEO Keywords: {keywords}
{callToAction}

{brandContext}
{voiceGuidelines}
{toneInstructions}

Structure the article with:
1. Compelling headline
2. Engaging introduction
3. Well-organized main content with subheadings
4. Practical takeaways or actionable insights
5. Strong conclusion with clear next steps

{constraints}`,

      toneSection: `Tone Guidelines for Article:
{toneMapping}

Balance professionalism with the brand's unique personality to create engaging yet authoritative content.`,

      voiceSection: `Brand Voice Application:
- Writing Style: {writingStyle}
- Expertise Level: {expertiseLevel}
- Reader Relationship: {readerConnection}
- Content Approach: {contentApproach}`,

      constraintsSection: `Article Guidelines:
- Word count: {wordLimits}
- SEO considerations: {seoGuidelines}
- Brand compliance: {brandConstraints}
{customConstraints}`,

      minWords: 800,
      maxWords: 2500
    },

    'email-campaign': {
      type: 'email-campaign',
      baseTemplate: `Create an email that builds relationship with subscribers while achieving the campaign goal.

Email Campaign Details:
- Campaign Type: {contentGoal}
- Subscriber Segment: {targetAudience}
- Email Goal: {callToAction}
- Length: {contentLength}

{brandContext}
{voiceGuidelines}
{toneInstructions}

Email Structure:
1. Subject line that drives opens
2. Personal greeting
3. Engaging opening that hooks the reader
4. Clear value proposition or main message
5. Compelling call-to-action
6. Professional sign-off

{constraints}`,

      toneSection: `Email Tone Strategy:
{toneMapping}

Create a tone that feels personal and valuable, not promotional or pushy.`,

      voiceSection: `Email Voice Guidelines:
- Conversational Level: {conversationalStyle}
- Relationship Building: {relationshipTone}
- Authority Balance: {authorityLevel}
- Personal Touch: {personalityExpression}`,

      constraintsSection: `Email Best Practices:
- Subject line: {subjectLineGuidelines}
- Content length: {wordLimits}
- CTA guidelines: {ctaConstraints}
- Compliance: {emailCompliance}
{customConstraints}`,

      minWords: 100,
      maxWords: 400
    },

    'product-description': {
      type: 'product-description',
      baseTemplate: `Write a compelling product description that highlights benefits while maintaining the brand's unique voice.

Product Information:
- Product: {contentGoal}
- Target Customer: {targetAudience}
- Key Benefits: {keywords}
- Usage Context: {platform}
{callToAction}

{brandContext}
{voiceGuidelines}
{toneInstructions}

Description Structure:
1. Attention-grabbing headline
2. Primary benefit/value proposition
3. Key features and benefits
4. Social proof or credibility indicators
5. Clear purchase motivation

{constraints}`,

      toneSection: `Product Description Tone:
{toneMapping}

Balance excitement about the product with credibility and trustworthiness.`,

      voiceSection: `Brand Voice in Product Copy:
- Selling Style: {sellingApproach}
- Feature Focus: {featurePriorities}
- Customer Connection: {customerRelation}
- Benefit Communication: {benefitStyle}`,

      constraintsSection: `Product Copy Guidelines:
- Length requirements: {wordLimits}
- Feature priorities: {featureConstraints}
- Compliance: {productCompliance}
- Platform specs: {platformConstraints}
{customConstraints}`,

      minWords: 50,
      maxWords: 300
    },

    'ad-copy': {
      type: 'ad-copy',
      baseTemplate: `Create high-converting ad copy that captures attention and drives action while staying true to brand identity.

Ad Campaign Details:
- Ad Platform: {platform}
- Campaign Goal: {contentGoal}
- Target Audience: {targetAudience}
- Ad Format: {contentLength}
{callToAction}

{brandContext}
{voiceGuidelines}
{toneInstructions}

Ad Copy Requirements:
1. Attention-grabbing headline
2. Clear value proposition
3. Compelling call-to-action
4. Urgency or motivation to act
5. Trust/credibility elements

{constraints}`,

      toneSection: `Ad Copy Tone:
{toneMapping}

Create urgency and excitement while maintaining brand authenticity and trust.`,

      voiceSection: `Brand Voice in Advertising:
- Persuasion Style: {persuasionApproach}
- Credibility Building: {credibilityFactors}
- Audience Connection: {audienceRelation}
- Action Motivation: {motivationStyle}`,

      constraintsSection: `Ad Platform Requirements:
- Character limits: {wordLimits}
- Platform policies: {platformConstraints}
- Brand guidelines: {brandConstraints}
- Performance targets: {performanceGoals}
{customConstraints}`,

      minWords: 15,
      maxWords: 80
    },

    'website-copy': {
      type: 'website-copy',
      baseTemplate: `Write website copy that clearly communicates value while guiding visitors toward desired actions.

Website Section:
- Page Type: {contentGoal}
- Visitor Intent: {targetAudience}
- Page Goal: {callToAction}
- Section: {platform}

{brandContext}
{voiceGuidelines}
{toneInstructions}

Copy Structure:
1. Clear headline that communicates value
2. Supporting subheadline or explanation
3. Benefit-focused body content
4. Trust signals and credibility elements
5. Clear call-to-action

{constraints}`,

      toneSection: `Website Tone Strategy:
{toneMapping}

Balance professionalism with approachability to build trust and encourage action.`,

      voiceSection: `Website Voice Guidelines:
- Authority Level: {authorityExpression}
- Visitor Relationship: {visitorConnection}
- Information Style: {informationDelivery}
- Action Guidance: {actionMotivation}`,

      constraintsSection: `Website Copy Standards:
- Section length: {wordLimits}
- SEO considerations: {seoRequirements}
- User experience: {uxGuidelines}
- Brand consistency: {brandConstraints}
{customConstraints}`,

      minWords: 50,
      maxWords: 500
    },

    'video-script': {
      type: 'video-script',
      baseTemplate: `Write a video script that engages viewers while delivering the brand message effectively.

Video Details:
- Video Type: {contentGoal}
- Target Audience: {targetAudience}
- Video Length: {contentLength}
- Platform: {platform}
{callToAction}

{brandContext}
{voiceGuidelines}
{toneInstructions}

Script Structure:
1. Hook (first 3-5 seconds)
2. Introduction/context setting
3. Main content delivery
4. Key points reinforcement
5. Clear call-to-action
6. Closing/sign-off

{constraints}

Format as: [VISUAL DESCRIPTION] + spoken content for each scene.`,

      toneSection: `Video Tone Guidelines:
{toneMapping}

Adapt tone for spoken delivery - more conversational and engaging than written content.`,

      voiceSection: `Video Voice Characteristics:
- Speaking Style: {speakingStyle}
- Energy Level: {energyExpression}
- Viewer Connection: {viewerRelation}
- Content Pacing: {pacingStyle}`,

      constraintsSection: `Video Production Guidelines:
- Script length: {wordLimits}
- Platform requirements: {platformConstraints}
- Visual considerations: {visualConstraints}
- Audio/timing: {audioConstraints}
{customConstraints}`,

      minWords: 100,
      maxWords: 800
    },

    'press-release': {
      type: 'press-release',
      baseTemplate: `Write a professional press release that communicates news effectively while maintaining brand credibility.

Press Release Details:
- Announcement: {contentGoal}
- Target Media: {targetAudience}
- News Angle: {platform}
- Distribution: {contentLength}

{brandContext}
{voiceGuidelines}
{toneInstructions}

Press Release Structure:
1. Compelling headline
2. Dateline and lead paragraph (who, what, when, where, why)
3. Supporting paragraphs with details and context
4. Quotes from key stakeholders
5. Company boilerplate
6. Contact information

{constraints}`,

      toneSection: `Press Release Tone:
{toneMapping}

Maintain journalistic professionalism while allowing brand personality to show through quotes and language choices.`,

      voiceSection: `Press Voice Guidelines:
- Authority Level: {pressAuthority}
- News Value: {newsPresentation}
- Credibility: {credibilityFactors}
- Media Relations: {mediaApproach}`,

      constraintsSection: `Press Release Standards:
- Length requirements: {wordLimits}
- Journalistic style: {journalisticStandards}
- Media guidelines: {mediaConstraints}
- Legal compliance: {legalConstraints}
{customConstraints}`,

      minWords: 300,
      maxWords: 600
    },

    'customer-support': {
      type: 'customer-support',
      baseTemplate: `Create customer support content that resolves issues while reinforcing positive brand experience.

Support Context:
- Issue Type: {contentGoal}
- Customer Segment: {targetAudience}
- Communication Channel: {platform}
- Resolution Goal: {callToAction}

{brandContext}
{voiceGuidelines}
{toneInstructions}

Support Communication Structure:
1. Acknowledgment of customer concern
2. Empathy and understanding
3. Clear explanation or solution
4. Step-by-step guidance if needed
5. Follow-up or next steps
6. Positive closing with support availability

{constraints}`,

      toneSection: `Customer Support Tone:
{toneMapping}

Prioritize empathy, helpfulness, and solution-focus while maintaining brand warmth.`,

      voiceSection: `Support Voice Guidelines:
- Empathy Expression: {empathyStyle}
- Solution Delivery: {solutionApproach}
- Customer Relationship: {customerCare}
- Problem Resolution: {resolutionStyle}`,

      constraintsSection: `Support Standards:
- Response length: {wordLimits}
- Resolution time: {responseConstraints}
- Escalation triggers: {escalationGuidelines}
- Brand consistency: {brandConstraints}
{customConstraints}`,

      minWords: 50,
      maxWords: 300
    },

    'internal-communication': {
      type: 'internal-communication',
      baseTemplate: `Write internal communication that aligns teams while maintaining brand values and culture.

Communication Details:
- Message Type: {contentGoal}
- Audience: {targetAudience}
- Channel: {platform}
- Urgency: {contentLength}

{brandContext}
{voiceGuidelines}
{toneInstructions}

Communication Structure:
1. Clear subject/purpose
2. Context and background
3. Key information or decisions
4. Action items or next steps
5. Timeline and responsibilities
6. Contact for questions

{constraints}`,

      toneSection: `Internal Communication Tone:
{toneMapping}

Balance professionalism with company culture and values.`,

      voiceSection: `Internal Voice Guidelines:
- Authority Level: {internalAuthority}
- Team Relationship: {teamConnection}
- Information Sharing: {informationStyle}
- Culture Expression: {cultureReflection}`,

      constraintsSection: `Internal Communication Standards:
- Message length: {wordLimits}
- Clarity requirements: {clarityStandards}
- Cultural alignment: {cultureConstraints}
- Confidentiality: {confidentialityGuidelines}
{customConstraints}`,

      minWords: 75,
      maxWords: 400
    }
  };

  /**
   * Get template for specific content type
   */
  static getTemplate(contentType: ContentType): PromptTemplate {
    const template = this.templates[contentType];
    if (!template) {
      throw new Error(`Template not found for content type: ${contentType}`);
    }
    return { ...template };
  }

  /**
   * Get all available content types
   */
  static getAvailableTypes(): ContentType[] {
    return Object.keys(this.templates) as ContentType[];
  }

  /**
   * Check if content type is supported
   */
  static isSupported(contentType: string): contentType is ContentType {
    return contentType in this.templates;
  }

  /**
   * Get template metadata for UI/selection purposes
   */
  static getTemplateMetadata() {
    return Object.entries(this.templates).map(([type, template]) => ({
      type: type as ContentType,
      minWords: template.minWords,
      maxWords: template.maxWords,
      hasExamples: !!template.examplesSection
    }));
  }
}

export default BrandVoicePromptTemplates;