// Re-exportações de tipos do sistema de IA e conteúdo
export type {
  AiPrompt,
  NewAiPrompt,
  UpdateAiPrompt,
  ContentBrief,
  NewContentBrief,
  UpdateContentBrief,
  GeneratedContent,
  NewGeneratedContent,
  UpdateGeneratedContent,
  AiContent,
  NewAiContent,
  UpdateAiContent,
  ContentFeedback,
  NewContentFeedback,
  UpdateContentFeedback,
  ComplianceCheck,
  NewComplianceCheck,
  UpdateComplianceCheck,
  ContentWithGeneratedData,
  BriefWithGeneratedContent,
  ContentGenerationRequest,
  ContentAnalysis
} from '../schemas/ai-content';

export {
  CONTENT_TYPES,
  AI_PROMPT_CATEGORIES,
  CONTENT_STATUSES,
  BRIEF_STATUSES,
  GENERATED_CONTENT_STATUSES,
  FEEDBACK_TYPES,
  COMPLIANCE_CHECK_TYPES,
  COMPLIANCE_STATUSES,
  PRIORITIES,
  SUPPORTED_AI_MODELS,
  PLATFORMS,
  calculateContentScore,
  getContentLength,
  extractHashtags,
  extractMentions,
  validateContentLength,
  getPlatformConstraints,
  isContentCompliant,
  needsReview,
  buildPromptFromTemplate,
  getDefaultGenerationParams,
  promptVariablesSchema,
  contentRequirementsSchema,
  contentConstraintsSchema,
  generationParamsSchema
} from '../schemas/ai-content';

// Tipos básicos para conteúdo
export type ContentType = 'social_post' | 'blog_article' | 'email' | 'ad_copy' | 'caption' | 'story' | 'reel_script';
export type ContentStatus = 'draft' | 'review' | 'approved' | 'scheduled' | 'published' | 'archived';
export type BriefStatus = 'draft' | 'ready' | 'in_progress' | 'completed' | 'archived';
export type GeneratedContentStatus = 'generated' | 'reviewed' | 'approved' | 'rejected' | 'published';
export type FeedbackType = 'quality' | 'brand_voice' | 'accuracy' | 'relevance' | 'tone' | 'style';
export type ComplianceCheckType = 'legal' | 'ethical' | 'brand_safety' | 'platform_policy' | 'industry_standards';
export type ComplianceStatus = 'pending' | 'passed' | 'failed' | 'warning' | 'manual_review';
export type Priority = 'low' | 'medium' | 'high' | 'urgent';
export type AiModel = 'gpt-4' | 'gpt-4-turbo' | 'gpt-3.5-turbo' | 'claude-3-opus' | 'claude-3-sonnet' | 'claude-3-haiku';
export type AiPromptCategory = 'content_generation' | 'brand_voice' | 'campaign_ideas' | 'hashtags' | 'captions' | 'blog_posts';

// Interface para variáveis de prompt
export interface PromptVariable {
  type: 'text' | 'number' | 'boolean' | 'array' | 'select';
  required: boolean;
  description?: string;
  options?: string[];
  default?: any;
}

// Interface para requisitos de conteúdo
export interface ContentRequirements {
  length?: {
    min?: number;
    max?: number;
    ideal?: number;
  };
  format?: {
    structure?: string[];
    sections?: string[];
    style?: 'formal' | 'casual' | 'professional' | 'playful' | 'educational';
  };
  inclusion?: {
    keywords?: string[];
    hashtags?: string[];
    mentions?: string[];
    links?: string[];
  };
  exclusion?: {
    words?: string[];
    topics?: string[];
    competitors?: string[];
  };
}

// Interface para restrições de conteúdo
export interface ContentConstraints {
  platform?: {
    characterLimit?: number;
    hashtageLimit?: number;
    mentionLimit?: number;
    mediaLimit?: number;
  };
  brand?: {
    voiceCompliance: boolean;
    complianceRequired: boolean;
    approvalRequired: boolean;
  };
  legal?: {
    disclaimers?: string[];
    regulations?: string[];
    restricted?: string[];
  };
}

// Interface para parâmetros de geração
export interface GenerationParams {
  model: string;
  temperature: number;
  maxTokens: number;
  topP?: number;
  frequencyPenalty?: number;
  presencePenalty?: number;
  systemPrompt?: string;
  userPrompt: string;
  context?: Record<string, any>;
}

// Interface para análise de conteúdo
export interface ContentScoreBreakdown {
  quality: {
    score: number;
    factors: {
      grammar: number;
      readability: number;
      structure: number;
      engagement: number;
    };
  };
  brandVoice: {
    score: number;
    factors: {
      tone: number;
      style: number;
      vocabulary: number;
      consistency: number;
    };
  };
  compliance: {
    score: number;
    factors: {
      legal: number;
      ethical: number;
      platform: number;
      industry: number;
    };
  };
  engagement: {
    score: number;
    factors: {
      hook: number;
      cta: number;
      relevance: number;
      emotional: number;
    };
  };
}

// Interface para feedback estruturado
export interface StructuredFeedback {
  overall: {
    rating: number; // 1-5
    summary: string;
  };
  categories: {
    quality: {
      rating: number;
      comments: string[];
      suggestions: string[];
    };
    brandVoice: {
      rating: number;
      comments: string[];
      suggestions: string[];
    };
    accuracy: {
      rating: number;
      comments: string[];
      suggestions: string[];
    };
    relevance: {
      rating: number;
      comments: string[];
      suggestions: string[];
    };
  };
  improvements: Array<{
    area: string;
    current: string;
    suggested: string;
    priority: 'high' | 'medium' | 'low';
  }>;
}

// Interface para variações de conteúdo
export interface ContentVariation {
  id: string;
  content: string;
  type: 'alternative' | 'shorter' | 'longer' | 'formal' | 'casual';
  score?: number;
  differences: string[];
  useCase: string;
}

// Interface para contexto de geração
export interface GenerationContext {
  brandVoice?: any;
  campaign?: any;
  audience?: any;
  platform?: string;
  previousContent?: string[];
  seasonality?: any;
  trends?: string[];
  competitors?: any[];
}

// Interface para otimização de conteúdo
export interface ContentOptimization {
  original: string;
  optimized: string;
  improvements: Array<{
    type: 'seo' | 'engagement' | 'readability' | 'length' | 'tone';
    description: string;
    impact: 'low' | 'medium' | 'high';
  }>;
  metrics: {
    readabilityScore: number;
    seoScore: number;
    engagementPotential: number;
    brandVoiceAlignment: number;
  };
}

// Interface para pipeline de conteúdo
export interface ContentPipeline {
  stages: Array<{
    name: string;
    status: 'pending' | 'in_progress' | 'completed' | 'failed';
    startTime?: Date;
    endTime?: Date;
    output?: any;
    errors?: string[];
  }>;
  currentStage: number;
  totalStages: number;
  progress: number;
}

// Interface para batch processing
export interface BatchContentGeneration {
  id: string;
  briefIds: string[];
  status: 'queued' | 'processing' | 'completed' | 'failed';
  progress: number;
  results: Array<{
    briefId: string;
    status: 'success' | 'failed';
    contentId?: string;
    error?: string;
  }>;
  metadata: {
    startTime: Date;
    estimatedCompletion?: Date;
    totalCost?: number;
    totalTokens?: number;
  };
}