// Re-exportações centralizadas do sistema de campanhas
export * from './campaigns.schema';

// Tipos combinados úteis
export type CampaignWithTemplate = {
  campaign: typeof import('./campaigns.schema').campaignsTable.$inferSelect;
  template?: typeof import('./campaigns.schema').campaignTemplatesTable.$inferSelect;
  performance?: Array<typeof import('./campaigns.schema').campaignPerformanceTable.$inferSelect>;
};

export type UserCampaignWithDetails = {
  userCampaign: typeof import('./campaigns.schema').userCampaignsTable.$inferSelect;
  campaign?: typeof import('./campaigns.schema').campaignsTable.$inferSelect;
  template?: typeof import('./campaigns.schema').campaignTemplatesTable.$inferSelect;
  performance?: Array<typeof import('./campaigns.schema').campaignPerformanceTable.$inferSelect>;
};

export type CampaignAnalytics = {
  campaign: typeof import('./campaigns.schema').campaignsTable.$inferSelect;
  totalMetrics: {
    impressions: number;
    reach: number;
    engagement: number;
    clicks: number;
    conversions: number;
    cost: number;
    revenue: number;
    roi: number;
  };
  platformBreakdown: Record<string, any>;
  timeSeriesData: Array<{
    date: string;
    metrics: Record<string, number>;
  }>;
};

// Constantes úteis
export const CAMPAIGN_TYPES = [
  'social_media',
  'email',
  'blog', 
  'ads',
  'mixed'
] as const;

export const CAMPAIGN_STATUSES = [
  'draft',
  'scheduled',
  'active',
  'paused',
  'completed',
  'archived'
] as const;

export const CAMPAIGN_OBJECTIVES = [
  'awareness',
  'engagement',
  'conversion',
  'retention',
  'growth'
] as const;

export const TEMPLATE_CATEGORIES = [
  'seasonal',
  'promotional',
  'educational',
  'engagement',
  'launch'
] as const;

export const USER_CAMPAIGN_STATUSES = [
  'planning',
  'creating',
  'review',
  'scheduled',
  'active',
  'completed'
] as const;

export const APPROVAL_STATUSES = [
  'pending',
  'approved',
  'rejected',
  'needs_revision'
] as const;

export const SUPPORTED_PLATFORMS = [
  'instagram',
  'facebook',
  'twitter',
  'linkedin',
  'tiktok',
  'youtube',
  'pinterest',
  'email',
  'blog',
  'google_ads',
  'facebook_ads'
] as const;

// Helpers para cálculos
export const calculateROI = (revenue: number, cost: number): number => {
  if (cost === 0) return 0;
  return ((revenue - cost) / cost) * 100;
};

export const calculateCTR = (clicks: number, impressions: number): number => {
  if (impressions === 0) return 0;
  return (clicks / impressions) * 100;
};

export const calculateEngagementRate = (engagement: number, reach: number): number => {
  if (reach === 0) return 0;
  return (engagement / reach) * 100;
};

export const calculateConversionRate = (conversions: number, clicks: number): number => {
  if (clicks === 0) return 0;
  return (conversions / clicks) * 100;
};

export const calculateCPC = (cost: number, clicks: number): number => {
  if (clicks === 0) return 0;
  return cost / clicks;
};

export const calculateCPM = (cost: number, impressions: number): number => {
  if (impressions === 0) return 0;
  return (cost / impressions) * 1000;
};

// Status helpers
export const isActiveCampaign = (status: string): boolean => {
  return ['scheduled', 'active'].includes(status);
};

export const canEditCampaign = (status: string): boolean => {
  return ['draft', 'scheduled', 'paused'].includes(status);
};

export const requiresApproval = (status: string): boolean => {
  return ['review', 'scheduled'].includes(status);
};