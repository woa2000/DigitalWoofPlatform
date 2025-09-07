// Re-exportações de tipos do sistema de anamnese
export type {
  AnamnesisAnalysis,
  NewAnamnesisAnalysis,
  UpdateAnamnesisAnalysis,
  AnamnesisSource,
  NewAnamnesisSource,
  UpdateAnamnesisSource,
  AnamnesiseFinding,
  NewAnamnesiseFinding,
  UpdateAnamnesiseFinding,
  BusinessAnamnesis,
  NewBusinessAnamnesis,
  UpdateBusinessAnamnesis,
  CompleteAnalysis,
  AnalysisWithInsights,
  BusinessProfile,
  AnalysisReport
} from '../schemas/anamnesis';

export {
  ANALYSIS_TYPES,
  ANALYSIS_STATUSES,
  SOURCE_TYPES,
  SOURCE_STATUSES,
  FINDING_CATEGORIES,
  IMPACT_LEVELS,
  SENTIMENT_TYPES,
  BUSINESS_STAGES,
  BUSINESS_MODELS,
  RECOMMENDATION_TYPES,
  PRIORITY_LEVELS,
  SUPPORTED_PLATFORMS,
  AI_MODELS,
  calculateAnalysisProgress,
  calculateConfidenceScore,
  categorizeFindings,
  prioritizeRecommendations,
  extractKeyInsights,
  generateSWOTAnalysis,
  calculateBusinessAnamnesisProgress,
  suggestAnalysisTargets,
  validateAnalysisData,
  insightSchema,
  recommendationSchema,
  customerPersonaSchema,
  marketingGoalSchema,
  seasonalitySchema,
  contentDataSchema,
  analysisDataSchema
} from '../schemas/anamnesis';

// Tipos básicos para anamnese
export type AnalysisType = 'website' | 'social_media' | 'competitor' | 'brand' | 'market' | 'audience';
export type AnalysisStatus = 'pending' | 'analyzing' | 'completed' | 'failed' | 'archived';
export type SourceType = 'webpage' | 'social_post' | 'image' | 'video' | 'document' | 'api';
export type SourceStatus = 'pending' | 'processing' | 'completed' | 'failed' | 'skipped';
export type FindingCategory = 'brand_voice' | 'visual_identity' | 'content_strategy' | 'audience' | 'competitors' | 'market_trends' | 'opportunities' | 'threats';
export type ImpactLevel = 'low' | 'medium' | 'high' | 'critical';
export type SentimentType = 'positive' | 'negative' | 'neutral';
export type BusinessStage = 'startup' | 'growth' | 'established' | 'enterprise' | 'franchise';
export type BusinessModel = 'b2c' | 'b2b' | 'b2b2c' | 'marketplace' | 'saas' | 'ecommerce' | 'service' | 'product';
export type RecommendationType = 'content' | 'strategy' | 'design' | 'platform' | 'timing' | 'budget' | 'audience';

// Interface para insights
export interface Insight {
  category: string;
  insight: string;
  confidence: number;
  impact: ImpactLevel;
  evidence?: string[];
  source?: string;
}

// Interface para recomendações
export interface Recommendation {
  type: RecommendationType;
  action: string;
  priority: Priority;
  reasoning: string;
  estimatedImpact?: ImpactLevel;
  resources?: string[];
  timeframe?: string;
  cost?: {
    min?: number;
    max?: number;
    currency?: string;
  };
}

// Interface para persona de cliente
export interface CustomerPersona {
  name: string;
  age: {
    min: number;
    max: number;
  };
  gender: 'male' | 'female' | 'all';
  location: string[];
  income?: {
    min?: number;
    max?: number;
    currency?: string;
  };
  education?: 'basic' | 'secondary' | 'higher' | 'postgraduate';
  occupation?: string;
  interests: string[];
  painPoints: string[];
  behaviors: {
    onlineTime?: string;
    socialMedia: string[];
    shoppingHabits: string[];
    informationSources: string[];
  };
  goals: string[];
  frustrations: string[];
  preferredChannels: string[];
  buyingProcess?: {
    awareness: string[];
    consideration: string[];
    decision: string[];
  };
}

// Interface para metas de marketing
export interface MarketingGoal {
  goal: string;
  priority: number; // 1-10
  timeframe: 'short' | 'medium' | 'long';
  metrics?: string[];
  target?: {
    value: number;
    unit: string;
  };
  budget?: {
    allocated?: number;
    currency?: string;
  };
}

// Interface para sazonalidade
export interface Seasonality {
  month: string;
  factor: number; // 0-5, multiplicador sazonal
  notes?: string;
  events?: string[];
  trends?: string[];
}

// Interface para dados de conteúdo analisado
export interface ContentData {
  title?: string;
  description?: string;
  keywords?: string[];
  images?: Array<{
    url: string;
    alt?: string;
    caption?: string;
  }>;
  videos?: Array<{
    url: string;
    title?: string;
    duration?: number;
  }>;
  socialMetrics?: {
    likes?: number;
    shares?: number;
    comments?: number;
    views?: number;
    engagement?: number;
  };
  textAnalysis?: {
    wordCount?: number;
    readabilityScore?: number;
    sentiment?: SentimentType;
    topics?: string[];
    entities?: string[];
  };
}

// Interface para dados de análise
export interface AnalysisData {
  summary?: string;
  keyFindings: string[];
  strengths: string[];
  weaknesses: string[];
  opportunities: string[];
  threats: string[];
  brandVoice?: {
    tone: string[];
    style: string[];
    personality: string[];
    consistency: number; // 0-1
  };
  visualIdentity?: {
    colors: string[];
    fonts: string[];
    style: string;
    consistency: number; // 0-1
  };
  contentStrategy?: {
    themes: string[];
    formats: string[];
    frequency: string;
    engagement: number; // 0-1
  };
  competitorAnalysis?: {
    direct: Array<{
      name: string;
      strengths: string[];
      weaknesses: string[];
      opportunities: string[];
    }>;
    indirect: string[];
    positioning: string;
  };
}

// Interface para análise SWOT
export interface SWOTAnalysis {
  strengths: string[];
  weaknesses: string[];
  opportunities: string[];
  threats: string[];
  recommendations: Array<{
    quadrant: 'SO' | 'WO' | 'ST' | 'WT';
    strategy: string;
    priority: Priority;
  }>;
}

// Interface para progresso de análise
export interface AnalysisProgress {
  currentStage: string;
  totalStages: number;
  progress: number; // 0-100
  estimatedCompletion?: Date;
  stages: Array<{
    name: string;
    status: 'pending' | 'running' | 'completed' | 'failed';
    duration?: number;
    startTime?: Date;
    endTime?: Date;
  }>;
}

// Interface para configuração de análise
export interface AnalysisConfig {
  targets: Array<{
    type: AnalysisType;
    url?: string;
    name: string;
    priority: Priority;
  }>;
  scope: {
    depth: 'shallow' | 'medium' | 'deep';
    includeCompetitors: boolean;
    includeMarketTrends: boolean;
    includeAudience: boolean;
  };
  ai: {
    model: string;
    temperature: number;
    maxTokens: number;
  };
  output: {
    format: 'json' | 'report' | 'both';
    language: string;
    includeEvidence: boolean;
    confidenceThreshold: number;
  };
}

// Interface para relatório de análise
export interface AnalysisReportData {
  executiveSummary: {
    keyFindings: string[];
    mainOpportunities: string[];
    criticalIssues: string[];
    overallScore: number; // 0-100
    confidence: number; // 0-1
  };
  sections: Array<{
    category: FindingCategory;
    findings: Array<{
      finding: string;
      evidence: string;
      confidence: number;
      impact: ImpactLevel;
    }>;
    score: number; // 0-100
    recommendations: string[];
  }>;
  swotAnalysis: SWOTAnalysis;
  actionPlan: Array<{
    priority: Priority;
    actions: string[];
    timeframe: string;
    resources: string[];
    expectedImpact: string;
  }>;
  appendices: {
    methodology: string;
    sources: string[];
    limitations: string[];
    nextSteps: string[];
  };
}

// Interface para comparação competitiva
export interface CompetitiveAnalysis {
  target: {
    name: string;
    url?: string;
    industry: string;
  };
  competitors: Array<{
    name: string;
    url?: string;
    type: 'direct' | 'indirect';
    marketShare?: number;
    strengths: string[];
    weaknesses: string[];
    positioning: string;
    contentStrategy: {
      themes: string[];
      frequency: string;
      platforms: string[];
      engagement: number;
    };
  }>;
  benchmarks: {
    contentVolume: Record<string, number>;
    engagement: Record<string, number>;
    brandVoice: Record<string, number>;
    visualIdentity: Record<string, number>;
  };
  gaps: Array<{
    area: string;
    description: string;
    opportunity: string;
    difficulty: 'low' | 'medium' | 'high';
  }>;
  recommendations: Recommendation[];
}

// Interface para análise de tendências
export interface TrendAnalysis {
  period: {
    start: Date;
    end: Date;
  };
  trends: Array<{
    category: string;
    trend: string;
    growth: number; // percentual
    confidence: number; // 0-1
    relevance: number; // 0-1
    sources: string[];
    timeline: Array<{
      date: Date;
      value: number;
    }>;
  }>;
  predictions: Array<{
    trend: string;
    prediction: string;
    timeframe: string;
    confidence: number;
    impact: ImpactLevel;
  }>;
  recommendations: Array<{
    trend: string;
    action: string;
    timing: string;
    resources: string[];
  }>;
}