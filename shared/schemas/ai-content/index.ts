// Re-exportações centralizadas do sistema de IA e conteúdo
export * from './ai-content.schema';

// Tipos combinados úteis
export type ContentWithGeneratedData = {
  content: typeof import('./ai-content.schema').aiContentTable.$inferSelect;
  brief?: typeof import('./ai-content.schema').contentBriefsTable.$inferSelect;
  generatedContent?: typeof import('./ai-content.schema').generatedContentTable.$inferSelect;
  feedback?: Array<typeof import('./ai-content.schema').contentFeedbackTable.$inferSelect>;
  complianceChecks?: Array<typeof import('./ai-content.schema').complianceChecksTable.$inferSelect>;
};

export type BriefWithGeneratedContent = {
  brief: typeof import('./ai-content.schema').contentBriefsTable.$inferSelect;
  generatedContent?: Array<typeof import('./ai-content.schema').generatedContentTable.$inferSelect>;
  finalContent?: typeof import('./ai-content.schema').aiContentTable.$inferSelect;
};

export type ContentGenerationRequest = {
  brief: typeof import('./ai-content.schema').contentBriefsTable.$inferInsert;
  prompt: typeof import('./ai-content.schema').aiPromptsTable.$inferSelect;
  brandVoice?: any; // Brand voice data
  parameters?: Record<string, any>;
};

export type ContentAnalysis = {
  content: typeof import('./ai-content.schema').aiContentTable.$inferSelect;
  scores: {
    quality: number;
    brandVoice: number;
    compliance: number;
    engagement: number;
  };
  suggestions: string[];
  issues: Array<{
    type: string;
    severity: 'low' | 'medium' | 'high';
    message: string;
    fix?: string;
  }>;
};

// Constantes úteis
export const CONTENT_TYPES = [
  'social_post',
  'blog_article',
  'email',
  'ad_copy',
  'caption',
  'story',
  'reel_script'
] as const;

export const AI_PROMPT_CATEGORIES = [
  'content_generation',
  'brand_voice',
  'campaign_ideas',
  'hashtags',
  'captions',
  'blog_posts'
] as const;

export const CONTENT_STATUSES = [
  'draft',
  'review',
  'approved',
  'scheduled',
  'published',
  'archived'
] as const;

export const BRIEF_STATUSES = [
  'draft',
  'ready',
  'in_progress',
  'completed',
  'archived'
] as const;

export const GENERATED_CONTENT_STATUSES = [
  'generated',
  'reviewed',
  'approved',
  'rejected',
  'published'
] as const;

export const FEEDBACK_TYPES = [
  'quality',
  'brand_voice',
  'accuracy',
  'relevance',
  'tone',
  'style'
] as const;

export const COMPLIANCE_CHECK_TYPES = [
  'legal',
  'ethical',
  'brand_safety',
  'platform_policy',
  'industry_standards'
] as const;

export const COMPLIANCE_STATUSES = [
  'pending',
  'passed',
  'failed',
  'warning',
  'manual_review'
] as const;

export const PRIORITIES = [
  'low',
  'medium',
  'high',
  'urgent'
] as const;

export const SUPPORTED_AI_MODELS = [
  'gpt-4',
  'gpt-4-turbo',
  'gpt-3.5-turbo',
  'claude-3-opus',
  'claude-3-sonnet',
  'claude-3-haiku'
] as const;

export const PLATFORMS = [
  'instagram',
  'facebook',
  'twitter',
  'linkedin',
  'tiktok',
  'youtube',
  'pinterest',
  'email',
  'blog',
  'website'
] as const;

// Helpers para cálculos e validações
export const calculateContentScore = (
  qualityScore: number = 0,
  brandVoiceScore: number = 0,
  complianceScore: number = 0
): number => {
  return (qualityScore + brandVoiceScore + complianceScore) / 3;
};

export const getContentLength = (content: string): number => {
  return content.length;
};

export const extractHashtags = (content: string): string[] => {
  const hashtags = content.match(/#[\w\u00C0-\u017F]+/g) || [];
  return hashtags.map(tag => tag.toLowerCase());
};

export const extractMentions = (content: string): string[] => {
  const mentions = content.match(/@[\w\u00C0-\u017F.]+/g) || [];
  return mentions.map(mention => mention.toLowerCase());
};

export const validateContentLength = (content: string, platform: string): boolean => {
  const limits = {
    instagram: 2200,
    facebook: 8000,
    twitter: 280,
    linkedin: 3000,
    tiktok: 4000,
    youtube: 5000,
    pinterest: 500,
    email: 50000,
    blog: 100000,
  };
  
  const limit = limits[platform as keyof typeof limits];
  return limit ? content.length <= limit : true;
};

export const getPlatformConstraints = (platform: string) => {
  const constraints = {
    instagram: {
      characterLimit: 2200,
      hashtagLimit: 30,
      mentionLimit: 20,
      mediaLimit: 10,
    },
    facebook: {
      characterLimit: 8000,
      hashtagLimit: 50,
      mentionLimit: 50,
      mediaLimit: 100,
    },
    twitter: {
      characterLimit: 280,
      hashtagLimit: 4,
      mentionLimit: 10,
      mediaLimit: 4,
    },
    linkedin: {
      characterLimit: 3000,
      hashtagLimit: 30,
      mentionLimit: 30,
      mediaLimit: 20,
    },
    tiktok: {
      characterLimit: 4000,
      hashtagLimit: 100,
      mentionLimit: 20,
      mediaLimit: 12,
    },
  };
  
  return constraints[platform as keyof typeof constraints] || {
    characterLimit: 10000,
    hashtagLimit: 50,
    mentionLimit: 50,
    mediaLimit: 50,
  };
};

export const isContentCompliant = (complianceChecks: Array<{ status: string }>): boolean => {
  return complianceChecks.every(check => 
    ['passed', 'warning'].includes(check.status)
  );
};

export const needsReview = (
  content: typeof import('./ai-content.schema').aiContentTable.$inferSelect,
  complianceChecks: Array<typeof import('./ai-content.schema').complianceChecksTable.$inferSelect>
): boolean => {
  const hasFailedCompliance = complianceChecks.some(check => check.status === 'failed');
  const needsManualReview = complianceChecks.some(check => check.status === 'manual_review');
  const isHighPriority = content.metadata?.priority === 'high' || content.metadata?.priority === 'urgent';
  
  return hasFailedCompliance || needsManualReview || isHighPriority;
};

// Template helpers
export const buildPromptFromTemplate = (
  template: string,
  variables: Record<string, any>
): string => {
  let prompt = template;
  
  Object.entries(variables).forEach(([key, value]) => {
    const placeholder = new RegExp(`{{${key}}}`, 'g');
    prompt = prompt.replace(placeholder, String(value));
  });
  
  return prompt;
};

export const getDefaultGenerationParams = (model: string = 'gpt-4') => {
  const defaults = {
    'gpt-4': {
      temperature: 0.7,
      maxTokens: 1000,
      topP: 1,
      frequencyPenalty: 0,
      presencePenalty: 0,
    },
    'gpt-3.5-turbo': {
      temperature: 0.7,
      maxTokens: 800,
      topP: 1,
      frequencyPenalty: 0,
      presencePenalty: 0,
    },
    'claude-3-opus': {
      temperature: 0.7,
      maxTokens: 1000,
    },
  };
  
  return defaults[model as keyof typeof defaults] || defaults['gpt-4'];
};