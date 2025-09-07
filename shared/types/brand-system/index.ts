// Re-exportações de tipos do sistema de marca
export type {
  BrandOnboarding,
  NewBrandOnboarding,
  UpdateBrandOnboarding,
  BrandVoiceJson,
  NewBrandVoiceJson,
  UpdateBrandVoiceJson,
  BrandOnboardingWithVoice,
  CompleteBrandSetup
} from '../schemas/brand-system';

export {
  ONBOARDING_STAGES,
  ONBOARDING_STATUSES,
  BRAND_VOICE_STATUSES,
  BRAND_VOICE_GENERATORS,
  STAGE_WEIGHTS,
  calculateOnboardingProgress,
  brandVoiceV1Schema,
  onboardingDataSchema
} from '../schemas/brand-system';

// Tipos específicos para Brand Voice
export type OnboardingStage = 'basic_info' | 'audience' | 'goals' | 'competitors' | 'voice' | 'assets' | 'completed';
export type OnboardingStatus = 'draft' | 'in_progress' | 'review' | 'completed' | 'archived';
export type BrandVoiceStatus = 'draft' | 'active' | 'archived' | 'deprecated';
export type BrandVoiceGenerator = 'manual' | 'ai_assisted' | 'imported';

// Interface para Brand Voice v1.0
export interface BrandVoiceV1 {
  version: '1.0';
  brand: {
    name: string;
    description: string;
    industry: string;
    targetAudience: {
      primary: string;
      demographics: {
        ageRange: string;
        location: string;
        interests: string[];
      };
    };
  };
  voice: {
    personality: {
      traits: string[];
      archetype: string;
    };
    tone: {
      formal: number; // 1-5
      friendly: number; // 1-5
      expert: number; // 1-5
      playful: number; // 1-5
    };
    language: {
      vocabulary: {
        preferred: string[];
        avoid: string[];
      };
      style: {
        sentenceLength: 'short' | 'medium' | 'long' | 'varied';
        punctuation: 'minimal' | 'standard' | 'expressive';
      };
    };
  };
  messaging: {
    valueProposition: string;
    keyMessages: string[];
    callToAction: {
      primary: string;
      variations: string[];
    };
  };
  content: {
    themes: string[];
    formats: string[];
    guidelines: {
      dos: string[];
      donts: string[];
    };
  };
  compliance: {
    industry: string[];
    legal: string[];
    ethical: string[];
  };
}

// Interface para dados de onboarding
export interface OnboardingData {
  basicInfo?: {
    brandName?: string;
    description?: string;
    website?: string;
    industry?: string;
  };
  audience?: {
    primary?: string;
    secondary?: string;
    demographics?: {
      ageRange?: string;
      location?: string[];
      interests?: string[];
      painPoints?: string[];
    };
  };
  goals?: {
    business?: string[];
    marketing?: string[];
    content?: string[];
    metrics?: string[];
  };
  competitors?: {
    direct?: Array<{
      name: string;
      website?: string;
      strengths?: string[];
      weaknesses?: string[];
    }>;
    indirect?: string[];
  };
  voice?: {
    personality?: string[];
    tone?: {
      formal?: number;
      friendly?: number;
      expert?: number;
      playful?: number;
    };
    examples?: {
      good?: string[];
      bad?: string[];
    };
  };
  assets?: {
    logo?: string;
    colors?: {
      primary?: string;
      secondary?: string;
      accent?: string;
    };
    fonts?: {
      primary?: string;
      secondary?: string;
    };
    images?: string[];
  };
}

// Tipos para progressão do onboarding
export interface OnboardingProgress {
  currentStage: OnboardingStage;
  completedSteps: string[];
  totalSteps: number;
  progressPercentage: number;
  nextStep?: string;
  requirements?: string[];
}

// Tipos para validação de brand voice
export interface BrandVoiceValidation {
  isValid: boolean;
  score: number;
  issues: Array<{
    field: string;
    message: string;
    severity: 'error' | 'warning' | 'info';
  }>;
  suggestions: string[];
}

// Tipos para análise de consistência
export interface BrandConsistencyAnalysis {
  overallScore: number;
  voice: {
    score: number;
    issues: string[];
  };
  visual: {
    score: number;
    issues: string[];
  };
  messaging: {
    score: number;
    issues: string[];
  };
  recommendations: Array<{
    area: string;
    action: string;
    priority: 'high' | 'medium' | 'low';
  }>;
}