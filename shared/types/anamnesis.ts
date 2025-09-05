/**
 * Types for Anamnesis Analysis - Mock Engine
 * Defines the structure of analysis results by section
 */

// Base interfaces for analysis sections
export interface DiagnosisSection {
  score: number; // 0-100
  findings: string[];
  recommendations: string[];
  confidence: 'low' | 'medium' | 'high';
}

export interface PersonasSection {
  primaryPersona: {
    name: string;
    age: string;
    profile: string;
    needs: string[];
    painPoints: string[];
  };
  secondaryPersonas: Array<{
    name: string;
    profile: string;
    percentage: number;
  }>;
  insights: string[];
}

export interface UXAuditSection {
  navigation: {
    score: number;
    issues: string[];
    strengths: string[];
  };
  content: {
    score: number;
    readability: number;
    engagement: string[];
  };
  conversion: {
    score: number;
    ctaPresence: boolean;
    trustSignals: string[];
  };
  mobile: {
    score: number;
    responsive: boolean;
    issues: string[];
  };
}

export interface EcosystemSection {
  socialPresence: Array<{
    platform: string;
    handle: string;
    followers: number;
    engagement: number;
    lastPost: string;
    contentQuality: number;
  }>;
  competitors: Array<{
    name: string;
    url: string;
    strengths: string[];
    opportunities: string[];
  }>;
  marketPosition: {
    category: string;
    differentiation: string[];
    threats: string[];
  };
}

export interface ActionPlanSection {
  immediate: Array<{
    action: string;
    priority: 'high' | 'medium' | 'low';
    effort: 'small' | 'medium' | 'large';
    impact: 'high' | 'medium' | 'low';
    timeline: string;
  }>;
  shortTerm: Array<{
    action: string;
    priority: 'high' | 'medium' | 'low';
    effort: 'small' | 'medium' | 'large';
    impact: 'high' | 'medium' | 'low';
    timeline: string;
  }>;
  longTerm: Array<{
    action: string;
    priority: 'high' | 'medium' | 'low';
    effort: 'small' | 'medium' | 'large';
    impact: 'high' | 'medium' | 'low';
    timeline: string;
  }>;
}

export interface RoadmapSection {
  phases: Array<{
    name: string;
    duration: string;
    objectives: string[];
    deliverables: string[];
    dependencies: string[];
    risks: string[];
  }>;
  milestones: Array<{
    name: string;
    date: string;
    criteria: string[];
    responsible: string;
  }>;
  budget: {
    total: number;
    breakdown: Array<{
      category: string;
      amount: number;
      justification: string;
    }>;
  };
}

export interface HomeAnatomySection {
  structure: {
    header: {
      logo: boolean;
      navigation: string[];
      contact: boolean;
      cta: boolean;
    };
    hero: {
      headline: string;
      subheadline: string;
      cta: string;
      media: 'image' | 'video' | 'none';
    };
    sections: Array<{
      type: string;
      purpose: string;
      effectiveness: number;
    }>;
    footer: {
      links: string[];
      contact: boolean;
      social: string[];
    };
  };
  performance: {
    loadTime: number;
    mobileOptimized: boolean;
    seoScore: number;
    accessibilityScore: number;
  };
}

export interface QuestionsSection {
  brandStrategy: Array<{
    question: string;
    importance: 'critical' | 'important' | 'nice-to-have';
    rationale: string;
  }>;
  contentStrategy: Array<{
    question: string;
    importance: 'critical' | 'important' | 'nice-to-have';
    rationale: string;
  }>;
  technical: Array<{
    question: string;
    importance: 'critical' | 'important' | 'nice-to-have';
    rationale: string;
  }>;
  business: Array<{
    question: string;
    importance: 'critical' | 'important' | 'nice-to-have';
    rationale: string;
  }>;
}

// Complete analysis result structure
export interface AnamnesisFindings {
  identity: DiagnosisSection;
  personas: PersonasSection;
  ux: UXAuditSection;
  ecosystem: EcosystemSection;
  actionPlan: ActionPlanSection;
  roadmap: RoadmapSection;
  homeAnatomy: HomeAnatomySection;
  questions: QuestionsSection;
}

// Analysis processing status and metadata
export interface AnalysisMetadata {
  startedAt: Date;
  completedAt?: Date;
  duration?: number; // in milliseconds
  sourceCount: number;
  dataPoints: number;
  confidence: number; // overall confidence 0-100
  warnings: string[];
  limitations: string[];
}

// Source data structure
export interface AnalysisSource {
  id: string;
  type: 'site' | 'social';
  url: string;
  normalizedUrl: string;
  provider?: string;
  status: 'pending' | 'fetched' | 'error';
  errorMessage?: string;
  lastFetchedAt?: Date;
  hash: string;
}

// Complete analysis result
export interface AnalysisResult {
  id: string;
  status: 'queued' | 'running' | 'done' | 'error';
  scoreCompleteness: number;
  findings: AnamnesisFindings;
  sources: AnalysisSource[];
  metadata: AnalysisMetadata;
  errorMessage?: string;
  createdAt: Date;
  updatedAt: Date;
}

// Mock engine configuration
export interface MockEngineConfig {
  processingTimeMs: number; // Simulated processing time
  enableRandomness: boolean; // Add randomness to results
  errorRate: number; // Probability of generating errors (0-1)
  dataQualityVariation: number; // Variation in data quality (0-1)
}

// Analysis request input
export interface AnalysisRequest {
  primaryUrl: string;
  socialUrls: string[];
  sources: AnalysisSource[];
  userId: string;
  requestId: string;
}