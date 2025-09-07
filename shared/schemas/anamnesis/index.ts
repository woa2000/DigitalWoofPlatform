// Re-exportações centralizadas do sistema de anamnese
export * from './anamnesis.schema';

// Tipos combinados úteis
export type CompleteAnalysis = {
  analysis: typeof import('./anamnesis.schema').anamnesisAnalysisTable.$inferSelect;
  sources: Array<typeof import('./anamnesis.schema').anamnesisSourceTable.$inferSelect>;
  findings: Array<typeof import('./anamnesis.schema').anamnesiseFindingTable.$inferSelect>;
  businessAnamnesis?: typeof import('./anamnesis.schema').businessAnamnesisTable.$inferSelect;
  tenant: typeof import('../tenant-system/tenants.schema').tenantsTable.$inferSelect;
};

export type AnalysisWithInsights = {
  analysis: typeof import('./anamnesis.schema').anamnesisAnalysisTable.$inferSelect;
  insights: Array<{
    category: string;
    insight: string;
    confidence: number;
    impact: string;
    sources: Array<typeof import('./anamnesis.schema').anamnesisSourceTable.$inferSelect>;
  }>;
  recommendations: Array<{
    type: string;
    action: string;
    priority: string;
    reasoning: string;
    relatedFindings: Array<typeof import('./anamnesis.schema').anamnesiseFindingTable.$inferSelect>;
  }>;
};

export type BusinessProfile = {
  businessAnamnesis: typeof import('./anamnesis.schema').businessAnamnesisTable.$inferSelect;
  relatedAnalyses: Array<typeof import('./anamnesis.schema').anamnesisAnalysisTable.$inferSelect>;
  tenant: typeof import('../tenant-system/tenants.schema').tenantsTable.$inferSelect;
  completionStats: {
    overallProgress: number;
    sectionsCompleted: string[];
    missingInfo: string[];
    recommendations: string[];
  };
};

export type AnalysisReport = {
  analysis: typeof import('./anamnesis.schema').anamnesisAnalysisTable.$inferSelect;
  executiveSummary: {
    keyFindings: string[];
    mainOpportunities: string[];
    criticalIssues: string[];
    overallScore: number;
  };
  detailedFindings: Array<{
    category: string;
    findings: Array<typeof import('./anamnesis.schema').anamnesiseFindingTable.$inferSelect>;
    categoryScore: number;
    recommendations: string[];
  }>;
  actionPlan: Array<{
    priority: string;
    actions: string[];
    timeframe: string;
    resources: string[];
  }>;
};

// Constantes úteis
export const ANALYSIS_TYPES = [
  'website',
  'social_media',
  'competitor',
  'brand',
  'market',
  'audience'
] as const;

export const ANALYSIS_STATUSES = [
  'pending',
  'analyzing',
  'completed',
  'failed',
  'archived'
] as const;

export const SOURCE_TYPES = [
  'webpage',
  'social_post',
  'image',
  'video',
  'document',
  'api'
] as const;

export const SOURCE_STATUSES = [
  'pending',
  'processing',
  'completed',
  'failed',
  'skipped'
] as const;

export const FINDING_CATEGORIES = [
  'brand_voice',
  'visual_identity',
  'content_strategy',
  'audience',
  'competitors',
  'market_trends',
  'opportunities',
  'threats'
] as const;

export const IMPACT_LEVELS = [
  'low',
  'medium',
  'high',
  'critical'
] as const;

export const SENTIMENT_TYPES = [
  'positive',
  'negative',
  'neutral'
] as const;

export const BUSINESS_STAGES = [
  'startup',
  'growth',
  'established',
  'enterprise',
  'franchise'
] as const;

export const BUSINESS_MODELS = [
  'b2c',
  'b2b',
  'b2b2c',
  'marketplace',
  'saas',
  'ecommerce',
  'service',
  'product'
] as const;

export const RECOMMENDATION_TYPES = [
  'content',
  'strategy',
  'design',
  'platform',
  'timing',
  'budget',
  'audience'
] as const;

export const PRIORITY_LEVELS = [
  'low',
  'medium',
  'high',
  'urgent'
] as const;

export const SUPPORTED_PLATFORMS = [
  'instagram',
  'facebook',
  'twitter',
  'linkedin',
  'tiktok',
  'youtube',
  'pinterest',
  'website',
  'blog',
  'email'
] as const;

export const AI_MODELS = [
  'gpt-4',
  'gpt-4-turbo',
  'gpt-3.5-turbo',
  'claude-3-opus',
  'claude-3-sonnet'
] as const;

// Helpers para cálculos e processamento
export const calculateAnalysisProgress = (
  totalSources: number,
  completedSources: number,
  totalFindings: number,
  processedFindings: number
): number => {
  if (totalSources === 0) return 0;
  
  const sourceProgress = (completedSources / totalSources) * 0.6; // 60% do progresso
  const findingProgress = totalFindings > 0 ? (processedFindings / totalFindings) * 0.4 : 0; // 40% do progresso
  
  return Math.round((sourceProgress + findingProgress) * 100);
};

export const calculateConfidenceScore = (findings: Array<{ confidence?: number }>): number => {
  const validFindings = findings.filter(f => f.confidence !== undefined);
  if (validFindings.length === 0) return 0;
  
  const sum = validFindings.reduce((acc, f) => acc + (f.confidence || 0), 0);
  return sum / validFindings.length;
};

export const categorizeFindings = (
  findings: Array<typeof import('./anamnesis.schema').anamnesiseFindingTable.$inferSelect>
): Record<string, Array<typeof import('./anamnesis.schema').anamnesiseFindingTable.$inferSelect>> => {
  return findings.reduce((acc, finding) => {
    if (!acc[finding.category]) {
      acc[finding.category] = [];
    }
    acc[finding.category].push(finding);
    return acc;
  }, {} as Record<string, Array<typeof import('./anamnesis.schema').anamnesiseFindingTable.$inferSelect>>);
};

export const prioritizeRecommendations = (
  recommendations: Array<{ priority: string; impact?: string }>
): Array<{ priority: string; impact?: string }> => {
  const priorityOrder = { urgent: 4, high: 3, medium: 2, low: 1 };
  const impactOrder = { critical: 4, high: 3, medium: 2, low: 1 };
  
  return recommendations.sort((a, b) => {
    const priorityDiff = (priorityOrder[a.priority as keyof typeof priorityOrder] || 0) - 
                        (priorityOrder[b.priority as keyof typeof priorityOrder] || 0);
    
    if (priorityDiff !== 0) return -priorityDiff; // Prioridade maior primeiro
    
    const impactDiff = (impactOrder[a.impact as keyof typeof impactOrder] || 0) - 
                      (impactOrder[b.impact as keyof typeof impactOrder] || 0);
    
    return -impactDiff; // Impacto maior primeiro
  });
};

export const extractKeyInsights = (
  findings: Array<typeof import('./anamnesis.schema').anamnesiseFindingTable.$inferSelect>,
  limit: number = 5
): Array<typeof import('./anamnesis.schema').anamnesiseFindingTable.$inferSelect> => {
  return findings
    .filter(f => f.confidence && f.confidence > 0.7) // Alta confiança
    .filter(f => ['high', 'critical'].includes(f.impact)) // Alto impacto
    .sort((a, b) => {
      const confidenceA = a.confidence || 0;
      const confidenceB = b.confidence || 0;
      const priorityA = a.priority || 5;
      const priorityB = b.priority || 5;
      
      // Ordena por confiança e prioridade
      return (confidenceB + (10 - priorityA)) - (confidenceA + (10 - priorityB));
    })
    .slice(0, limit);
};

export const generateSWOTAnalysis = (
  findings: Array<typeof import('./anamnesis.schema').anamnesiseFindingTable.$inferSelect>
) => {
  const swot = {
    strengths: [] as string[],
    weaknesses: [] as string[],
    opportunities: [] as string[],
    threats: [] as string[]
  };
  
  findings.forEach(finding => {
    const sentiment = finding.sentiment;
    const category = finding.category;
    
    if (sentiment === 'positive') {
      if (['brand_voice', 'visual_identity', 'content_strategy'].includes(category)) {
        swot.strengths.push(finding.finding);
      } else if (['market_trends', 'opportunities'].includes(category)) {
        swot.opportunities.push(finding.finding);
      }
    } else if (sentiment === 'negative') {
      if (['brand_voice', 'visual_identity', 'content_strategy'].includes(category)) {
        swot.weaknesses.push(finding.finding);
      } else if (['competitors', 'threats'].includes(category)) {
        swot.threats.push(finding.finding);
      }
    }
  });
  
  return swot;
};

export const calculateBusinessAnamnesisProgress = (
  businessAnamnesis: typeof import('./anamnesis.schema').businessAnamnesisTable.$inferSelect
): { progress: number; completedSections: string[]; missingSections: string[] } => {
  const sections = {
    basicInfo: !!(businessAnamnesis.businessType && businessAnamnesis.industry && businessAnamnesis.businessStage),
    targetMarket: !!(businessAnamnesis.targetMarket && businessAnamnesis.geographicFocus?.length),
    businessModel: !!(businessAnamnesis.businessModel && businessAnamnesis.revenueModel?.length),
    positioning: !!(businessAnamnesis.brandPositioning && businessAnamnesis.valueProposition),
    customers: !!(businessAnamnesis.customerPersonas?.length),
    marketing: !!(businessAnamnesis.marketingGoals?.length && businessAnamnesis.currentMarketingChannels?.length),
    challenges: !!(businessAnamnesis.currentChallenges?.length),
    advantages: !!(businessAnamnesis.competitiveAdvantages?.length)
  };
  
  const completedSections = Object.entries(sections)
    .filter(([_, completed]) => completed)
    .map(([section, _]) => section);
  
  const missingSections = Object.entries(sections)
    .filter(([_, completed]) => !completed)
    .map(([section, _]) => section);
  
  const progress = Math.round((completedSections.length / Object.keys(sections).length) * 100);
  
  return { progress, completedSections, missingSections };
};

export const suggestAnalysisTargets = (
  businessAnamnesis: typeof import('./anamnesis.schema').businessAnamnesisTable.$inferSelect
): Array<{ type: string; target: string; priority: string; reasoning: string }> => {
  const suggestions = [];
  
  // Análise de competidores baseada no business model
  if (businessAnamnesis.businessType && businessAnamnesis.industry) {
    suggestions.push({
      type: 'competitor',
      target: `Top competitors in ${businessAnamnesis.industry}`,
      priority: 'high',
      reasoning: 'Understanding competitive landscape is crucial for positioning'
    });
  }
  
  // Análise de mercado baseada na localização
  if (businessAnamnesis.geographicFocus?.length) {
    suggestions.push({
      type: 'market',
      target: `Market trends in ${businessAnamnesis.geographicFocus.join(', ')}`,
      priority: 'medium',
      reasoning: 'Local market insights can reveal regional opportunities'
    });
  }
  
  // Análise de audiência baseada nas personas
  if (businessAnamnesis.customerPersonas?.length) {
    suggestions.push({
      type: 'audience',
      target: 'Target audience behavior analysis',
      priority: 'high',
      reasoning: 'Deep audience understanding drives effective content strategy'
    });
  }
  
  return suggestions;
};

export const validateAnalysisData = (
  data: Record<string, any>
): { valid: boolean; errors: string[] } => {
  const errors: string[] = [];
  
  // Validações básicas
  if (!data.summary || data.summary.length < 50) {
    errors.push('Summary must be at least 50 characters long');
  }
  
  if (!Array.isArray(data.keyFindings) || data.keyFindings.length === 0) {
    errors.push('At least one key finding is required');
  }
  
  if (data.brandVoice && data.brandVoice.consistency !== undefined) {
    if (data.brandVoice.consistency < 0 || data.brandVoice.consistency > 1) {
      errors.push('Brand voice consistency must be between 0 and 1');
    }
  }
  
  return {
    valid: errors.length === 0,
    errors
  };
};