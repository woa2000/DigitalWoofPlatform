// Re-exportações de tipos do sistema de campanhas
export type {
  Campaign,
  NewCampaign,
  UpdateCampaign,
  CampaignTemplate,
  NewCampaignTemplate,
  UpdateCampaignTemplate,
  UserCampaign,
  NewUserCampaign,
  UpdateUserCampaign,
  CampaignPerformance,
  NewCampaignPerformance,
  UpdateCampaignPerformance,
  CampaignWithTemplate,
  UserCampaignWithDetails,
  CampaignAnalytics
} from '../schemas/campaign-system';

export {
  CAMPAIGN_TYPES,
  CAMPAIGN_STATUSES,
  CAMPAIGN_OBJECTIVES,
  TEMPLATE_CATEGORIES,
  USER_CAMPAIGN_STATUSES,
  APPROVAL_STATUSES,
  SUPPORTED_PLATFORMS,
  calculateROI,
  calculateCTR,
  calculateEngagementRate,
  calculateConversionRate,
  calculateCPC,
  calculateCPM,
  isActiveCampaign,
  canEditCampaign,
  requiresApproval,
  targetAudienceSchema,
  campaignSettingsSchema,
  performanceMetricsSchema
} from '../schemas/campaign-system';

// Tipos básicos para campanhas
export type CampaignType = 'social_media' | 'email' | 'blog' | 'ads' | 'mixed';
export type CampaignStatus = 'draft' | 'scheduled' | 'active' | 'paused' | 'completed' | 'archived';
export type CampaignObjective = 'awareness' | 'engagement' | 'conversion' | 'retention' | 'growth';
export type TemplateCategory = 'seasonal' | 'promotional' | 'educational' | 'engagement' | 'launch';
export type UserCampaignStatus = 'planning' | 'creating' | 'review' | 'scheduled' | 'active' | 'completed';
export type ApprovalStatus = 'pending' | 'approved' | 'rejected' | 'needs_revision';
export type Platform = 'instagram' | 'facebook' | 'twitter' | 'linkedin' | 'tiktok' | 'youtube' | 'pinterest' | 'email' | 'blog' | 'google_ads' | 'facebook_ads';

// Interface para target audience
export interface TargetAudience {
  demographics?: {
    ageRange?: string;
    gender?: 'male' | 'female' | 'all';
    location?: string[];
    interests?: string[];
    behaviors?: string[];
  };
  psychographics?: {
    values?: string[];
    lifestyle?: string[];
    personality?: string[];
  };
  technographics?: {
    devices?: string[];
    platforms?: string[];
    usage?: string[];
  };
}

// Interface para configurações de campanha
export interface CampaignSettings {
  autoPublish: boolean;
  requireApproval: boolean;
  allowComments: boolean;
  trackMetrics: boolean;
  notifications?: {
    email: boolean;
    inApp: boolean;
    milestones: boolean;
  };
  content?: {
    autoGenerate: boolean;
    brandVoiceStrict: boolean;
    complianceCheck: boolean;
  };
}

// Interface para métricas de performance
export interface PerformanceMetrics {
  impressions?: number;
  reach?: number;
  engagement?: number;
  clicks?: number;
  shares?: number;
  saves?: number;
  comments?: number;
  likes?: number;
  conversions?: number;
  cost?: number;
  revenue?: number;
  custom?: Record<string, number>;
}

// Interface para dados do template
export interface TemplateData {
  structure: {
    sections: Array<{
      type: 'header' | 'content' | 'cta' | 'footer';
      content: string;
      variables?: string[];
    }>;
  };
  variables: Record<string, {
    type: 'text' | 'image' | 'link' | 'date';
    required: boolean;
    default?: any;
    description?: string;
  }>;
  contentGuidelines: {
    tone: string;
    style: string;
    length: {
      min?: number;
      max?: number;
    };
  };
  platformConstraints: Record<string, {
    characterLimit?: number;
    hashtageLimit?: number;
    mediaLimit?: number;
  }>;
}

// Interface para análise de performance
export interface CampaignPerformanceAnalysis {
  overview: {
    totalImpressions: number;
    totalReach: number;
    totalEngagement: number;
    totalConversions: number;
    overallROI: number;
    engagementRate: number;
    conversionRate: number;
  };
  platformBreakdown: Record<string, PerformanceMetrics>;
  timeSeriesData: Array<{
    date: string;
    metrics: PerformanceMetrics;
  }>;
  topPerformingContent: Array<{
    contentId: string;
    metrics: PerformanceMetrics;
    performance: 'excellent' | 'good' | 'average' | 'poor';
  }>;
  insights: Array<{
    type: 'positive' | 'negative' | 'neutral';
    message: string;
    recommendation?: string;
  }>;
}

// Interface para relatório de campanha
export interface CampaignReport {
  campaign: Campaign;
  executiveSummary: {
    status: string;
    duration: number;
    totalBudget: number;
    totalSpent: number;
    keyMetrics: PerformanceMetrics;
    successRate: number;
  };
  performance: CampaignPerformanceAnalysis;
  contentAnalysis: {
    totalPieces: number;
    bestPerforming: Array<{
      title: string;
      type: string;
      metrics: PerformanceMetrics;
    }>;
    worstPerforming: Array<{
      title: string;
      type: string;
      metrics: PerformanceMetrics;
    }>;
  };
  audienceInsights: {
    demographics: Record<string, number>;
    engagement: Record<string, number>;
    behavior: Record<string, number>;
  };
  recommendations: Array<{
    category: string;
    suggestion: string;
    priority: 'high' | 'medium' | 'low';
    impact: string;
  }>;
}

// Interface para agendamento
export interface CampaignSchedule {
  startDate: Date;
  endDate?: Date;
  timezone: string;
  frequency?: {
    type: 'daily' | 'weekly' | 'monthly' | 'custom';
    interval?: number;
    days?: number[]; // 0-6, domingo a sábado
    times?: string[]; // HH:MM format
  };
  autoPublish: boolean;
  contentQueue: Array<{
    contentId: string;
    scheduledFor: Date;
    platform: string[];
    status: 'scheduled' | 'published' | 'failed';
  }>;
}

// Interface para colaboração
export interface CampaignCollaboration {
  teamMembers: Array<{
    userId: string;
    role: 'creator' | 'reviewer' | 'approver' | 'viewer';
    permissions: string[];
  }>;
  workflow: {
    stages: Array<{
      name: string;
      requiredApprovals: number;
      approvers: string[];
      autoAdvance: boolean;
    }>;
    currentStage: number;
  };
  comments: Array<{
    id: string;
    userId: string;
    message: string;
    timestamp: Date;
    resolved: boolean;
  }>;
  approvals: Array<{
    userId: string;
    status: 'approved' | 'rejected' | 'pending';
    comments?: string;
    timestamp: Date;
  }>;
}