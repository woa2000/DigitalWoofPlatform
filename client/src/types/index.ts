export interface DashboardStats {
  activeCampaigns: number;
  aiContentGenerated: number;
  complianceRate: number;
  engagementRate: number;
  trends: {
    campaigns: number;
    content: number;
    compliance: number;
    engagement: number;
  };
}

export interface BrandVoiceProfile {
  id: string;
  name: string;
  tone: string;
  visualIdentity: {
    status: 'complete' | 'incomplete';
    logo: boolean;
    colors: boolean;
    typography: boolean;
  };
  voice: {
    status: 'active' | 'inactive';
    tone: string;
    description: string;
  };
  audience: {
    status: 'defined' | 'undefined';
    description: string;
  };
  consistency: number; // 0-100
}

export interface QuickAction {
  id: string;
  title: string;
  description: string;
  icon: string;
  action: () => void;
}

export interface CampaignSummary {
  id: string;
  name: string;
  type: string;
  status: 'ativa' | 'em_teste' | 'pausada';
  description: string;
  metrics: {
    leads: number;
    conversion: number;
  };
}

export interface AIContentStatus {
  type: string;
  title: string;
  description: string;
  status: 'completed' | 'processing' | 'pending';
  progress?: number;
}

export interface ComplianceMetrics {
  overall: number;
  categories: {
    medical: number;
    promotional: number;
    legal: number;
  };
}

export interface PerformanceData {
  instagram: number;
  email: number;
  whatsapp: number;
}

export interface BrandManualSection {
  id: string;
  title: string;
  icon: string;
  status: 'complete' | 'active' | 'defined' | 'in_use';
  description: string;
}

// Content Generation Types
export interface ContentBrief {
  theme: string;
  objective: 'educar' | 'vender' | 'engajar' | 'recall_marca' | 'awareness';
  channel: 'instagram_post' | 'instagram_story' | 'facebook_post' | 'linkedin_post' | 'twitter_post' | 'email' | 'blog' | 'newsletter';
  format: 'texto' | 'video_script' | 'infografico' | 'carrossel' | 'story_sequence' | 'email_template';
  target_audience?: string;
  custom_instructions?: string;
  words_to_avoid?: string[];
  tone_adjustments?: string;
  call_to_action?: string;
  context?: string;
}

export interface ContentVariation {
  id: string;
  title: string;
  body: string;
  hashtags?: string[];
  call_to_action?: string;
  tone_analysis?: {
    detected_tone: string;
    brand_alignment: number;
    confidence: number;
  };
  estimated_performance?: {
    engagement_score: number;
    viral_potential: number;
    conversion_likelihood: number;
  };
}

export interface QualityMetrics {
  readability_score: number;
  relevance_score: number;
  brand_consistency: number;
  compliance_score: number;
}

export interface EngagementPrediction {
  score: number;
  confidence: number;
  factors: string[];
  recommendations: string[];
}

export interface GeneratedContent {
  id: string;
  content_brief: ContentBrief;
  variations: ContentVariation[];
  quality_metrics: QualityMetrics;
  compliance_notes: string[];
  engagement_prediction: EngagementPrediction;
  created_at: string;
  brand_voice_id: string;
}

export interface ContentPreviewProps {
  content: GeneratedContent;
  channel: ContentBrief['channel'];
  selectedVariation?: number;
  onVariationSelect?: (index: number) => void;
  onRegenerate?: () => void;
  onFeedback?: (feedback: ContentFeedback) => void;
}

export interface ContentFeedback {
  content_id: string;
  variation_id: string;
  rating: number; // 1-5
  feedback_type: 'tone' | 'relevance' | 'compliance' | 'engagement' | 'general';
  comments?: string;
  suggested_improvements?: string;
}
