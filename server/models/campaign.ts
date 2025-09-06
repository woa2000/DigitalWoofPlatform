import { z } from "zod";

// ============================================================================
// Campaign Template Core Types
// ============================================================================

// Enums as const objects for better type inference
export const CampaignCategory = {
  AQUISICAO: 'aquisicao',
  RETENCAO: 'retencao', 
  UPSELL: 'upsell',
  EDUCACAO: 'educacao',
  EMERGENCIA: 'emergencia'
} as const;

export const ServiceType = {
  VETERINARIA: 'veterinaria',
  ESTETICA: 'estetica',
  HOTEL: 'hotel', 
  PETSHOP: 'petshop',
  ADESTRAMENTO: 'adestramento'
} as const;

export const CampaignStatus = {
  DRAFT: 'draft',
  SCHEDULED: 'scheduled',
  PUBLISHED: 'published',
  PAUSED: 'paused',
  COMPLETED: 'completed'
} as const;

export const AssetType = {
  PHOTO: 'photo',
  ILLUSTRATION: 'illustration',
  TEMPLATE: 'template',
  VIDEO: 'video'
} as const;

export const UsageRightsType = {
  FREE: 'free',
  PREMIUM: 'premium',
  EXCLUSIVE: 'exclusive'
} as const;

// ============================================================================
// Zod Validation Schemas
// ============================================================================

// Content Piece Schema
export const ContentPieceSchema = z.object({
  id: z.string().uuid(),
  type: z.enum(['instagram_post', 'instagram_story', 'facebook_post', 'whatsapp_message', 'email']),
  baseCopy: z.string().min(1).max(3000),
  variables: z.array(z.object({
    name: z.string(),
    type: z.enum(['text', 'number', 'date', 'boolean']),
    required: z.boolean().default(false),
    defaultValue: z.string().optional(),
    placeholder: z.string().optional()
  })),
  formatting: z.object({
    maxLength: z.number().positive().optional(),
    includeHashtags: z.boolean().default(true),
    includeEmojis: z.boolean().default(true),
    tone: z.enum(['formal', 'casual', 'friendly', 'professional']).default('friendly')
  }),
  performanceBaseline: z.object({
    avgEngagementRate: z.number().min(0).max(1).optional(),
    avgReachRate: z.number().min(0).max(1).optional(),
    avgClickThroughRate: z.number().min(0).max(1).optional()
  }).optional()
});

// Visual Asset Schema
export const VisualAssetReferenceSchema = z.object({
  id: z.string().uuid(),
  type: z.nativeEnum(AssetType),
  url: z.string().url(),
  alt: z.string(),
  dimensions: z.object({
    width: z.number().positive(),
    height: z.number().positive()
  }).optional(),
  variants: z.record(z.string(), z.string().url()).optional() // {instagram_post: 'url', instagram_story: 'url'}
});

// Customization Options Schema
export const CustomizationOptionSchema = z.object({
  id: z.string(),
  name: z.string(),
  type: z.enum(['color', 'text', 'image', 'toggle']),
  label: z.string(),
  description: z.string().optional(),
  defaultValue: z.union([z.string(), z.boolean(), z.number()]),
  options: z.array(z.object({
    value: z.union([z.string(), z.boolean(), z.number()]),
    label: z.string()
  })).optional(),
  validation: z.object({
    required: z.boolean().default(false),
    minLength: z.number().optional(),
    maxLength: z.number().optional(),
    pattern: z.string().optional()
  }).optional()
});

// Seasonality Schema
export const SeasonalitySchema = z.object({
  months: z.array(z.number().min(1).max(12)), // 1-12 for months
  peakPerformance: z.enum(['high', 'medium', 'low']),
  description: z.string().optional(),
  factors: z.array(z.string()).optional() // ['christmas', 'summer_vacation', 'school_year']
});

// Performance Data Schema
export const PerformanceDataSchema = z.object({
  avgEngagementRate: z.number().min(0).max(1).optional(),
  avgConversionRate: z.number().min(0).max(1).optional(),
  successCases: z.number().min(0).default(0),
  industryBenchmark: z.number().min(0).max(1).optional(),
  usageCount: z.number().min(0).default(0),
  avgRating: z.number().min(0).max(5).optional(),
  lastUpdated: z.string().datetime().optional()
});

// ============================================================================
// Main Campaign Template Schema
// ============================================================================

export const CampaignTemplateCreateSchema = z.object({
  name: z.string().min(1).max(200),
  description: z.string().max(1000).optional(),
  category: z.nativeEnum(CampaignCategory),
  serviceType: z.nativeEnum(ServiceType),
  
  // Content structure
  contentPieces: z.array(ContentPieceSchema).min(1).max(10),
  visualAssets: z.array(VisualAssetReferenceSchema).optional(),
  customizationOptions: z.array(CustomizationOptionSchema).optional(),
  
  // Performance and seasonality
  seasonality: SeasonalitySchema.optional(),
  performanceData: PerformanceDataSchema.optional(),
  
  // Metadata
  isPublic: z.boolean().default(true),
  isPremium: z.boolean().default(false),
  tags: z.array(z.string()).max(20).optional()
});

export const CampaignTemplateUpdateSchema = CampaignTemplateCreateSchema.partial();

// ============================================================================
// User Campaign Schemas
// ============================================================================

export const CampaignConfigSchema = z.object({
  objective: z.string(),
  targetAudience: z.object({
    ageRange: z.string().optional(),
    interests: z.array(z.string()).optional(),
    demographics: z.record(z.string(), z.unknown()).optional()
  }).optional(),
  customizations: z.record(z.string(), z.unknown()).optional(),
  schedule: z.object({
    startDate: z.string().datetime().optional(),
    endDate: z.string().datetime().optional(),
    frequency: z.enum(['once', 'daily', 'weekly', 'monthly']).optional()
  }).optional()
});

export const PersonalizedContentPieceSchema = z.object({
  originalId: z.string().uuid(),
  type: z.enum(['instagram_post', 'instagram_story', 'facebook_post', 'whatsapp_message', 'email']),
  personalizedCopy: z.string(),
  appliedCustomizations: z.record(z.string(), z.unknown()).optional(),
  personalizationScore: z.number().min(0).max(1).optional(),
  complianceScore: z.number().min(0).max(1).optional(),
  generatedAt: z.string().datetime()
});

export const UserCampaignCreateSchema = z.object({
  templateId: z.string().uuid().optional(),
  brandVoiceId: z.string().uuid(),
  campaignConfig: CampaignConfigSchema,
  personalizedContent: z.array(PersonalizedContentPieceSchema),
  status: z.nativeEnum(CampaignStatus).default(CampaignStatus.DRAFT),
  scheduledAt: z.string().datetime().optional()
});

export const UserCampaignUpdateSchema = UserCampaignCreateSchema.partial();

// ============================================================================
// Performance Tracking Schemas
// ============================================================================

export const CampaignPerformanceCreateSchema = z.object({
  campaignId: z.string().uuid(),
  templateId: z.string().uuid(),
  channel: z.string().min(1).max(50),
  
  // Basic metrics
  impressions: z.number().min(0).default(0),
  reaches: z.number().min(0).default(0),
  clicks: z.number().min(0).default(0),
  conversions: z.number().min(0).default(0),
  
  // Calculated rates (computed from basic metrics)
  engagementRate: z.number().min(0).max(1).optional(),
  clickThroughRate: z.number().min(0).max(1).optional(),
  conversionRate: z.number().min(0).max(1).optional()
});

// ============================================================================
// Visual Assets Schemas  
// ============================================================================

export const VisualAssetCreateSchema = z.object({
  name: z.string().min(1).max(200),
  type: z.nativeEnum(AssetType),
  category: z.string().min(1).max(100),
  url: z.string().url(),
  
  // File metadata
  fileSize: z.number().positive().optional(),
  dimensions: z.object({
    width: z.number().positive(),
    height: z.number().positive()
  }).optional(),
  
  // Variants for different formats
  variants: z.record(z.string(), z.string().url()).optional(),
  
  // Customization capabilities
  customizableElements: z.array(z.object({
    type: z.enum(['text', 'color', 'image']),
    selector: z.string(),
    constraints: z.record(z.string(), z.unknown()).optional()
  })).optional(),
  
  // Metadata for search and discovery
  tags: z.array(z.string()).max(50),
  petTypes: z.array(z.string()).max(20),
  emotions: z.array(z.string()).max(15),
  usageRights: z.nativeEnum(UsageRightsType).default(UsageRightsType.FREE)
});

export const VisualAssetUpdateSchema = VisualAssetCreateSchema.partial();

// ============================================================================
// Query and Filter Schemas
// ============================================================================

export const TemplateFiltersSchema = z.object({
  category: z.nativeEnum(CampaignCategory).optional(),
  serviceType: z.nativeEnum(ServiceType).optional(),
  isPremium: z.boolean().optional(),
  isPublic: z.boolean().optional(),
  tags: z.array(z.string()).optional(),
  search: z.string().max(100).optional(),
  
  // Performance filters
  minEngagementRate: z.number().min(0).max(1).optional(),
  minSuccessCases: z.number().min(0).optional(),
  
  // Seasonality filters  
  currentSeason: z.boolean().optional(), // Filter by current month
  peakPerformance: z.enum(['high', 'medium', 'low']).optional()
});

export const PaginationSchema = z.object({
  page: z.number().min(1).default(1),
  limit: z.number().min(1).max(100).default(20),
  sortBy: z.enum(['name', 'createdAt', 'usageCount', 'avgEngagementRate']).default('createdAt'),
  sortOrder: z.enum(['asc', 'desc']).default('desc')
});

export const AssetFiltersSchema = z.object({
  type: z.nativeEnum(AssetType).optional(),
  category: z.string().optional(),
  petTypes: z.array(z.string()).optional(),
  emotions: z.array(z.string()).optional(),
  usageRights: z.nativeEnum(UsageRightsType).optional(),
  tags: z.array(z.string()).optional(),
  search: z.string().max(100).optional()
});

// ============================================================================
// Type Exports
// ============================================================================

export type CampaignCategoryType = typeof CampaignCategory[keyof typeof CampaignCategory];
export type ServiceTypeType = typeof ServiceType[keyof typeof ServiceType];
export type CampaignStatusType = typeof CampaignStatus[keyof typeof CampaignStatus];
export type AssetTypeType = typeof AssetType[keyof typeof AssetType];
export type UsageRightsTypeType = typeof UsageRightsType[keyof typeof UsageRightsType];

export type ContentPiece = z.infer<typeof ContentPieceSchema>;
export type VisualAssetReference = z.infer<typeof VisualAssetReferenceSchema>;
export type CustomizationOption = z.infer<typeof CustomizationOptionSchema>;
export type Seasonality = z.infer<typeof SeasonalitySchema>;
export type PerformanceData = z.infer<typeof PerformanceDataSchema>;

export type CampaignTemplateCreate = z.infer<typeof CampaignTemplateCreateSchema>;
export type CampaignTemplateUpdate = z.infer<typeof CampaignTemplateUpdateSchema>;

export type CampaignConfig = z.infer<typeof CampaignConfigSchema>;
export type PersonalizedContentPiece = z.infer<typeof PersonalizedContentPieceSchema>;
export type UserCampaignCreate = z.infer<typeof UserCampaignCreateSchema>;
export type UserCampaignUpdate = z.infer<typeof UserCampaignUpdateSchema>;

export type CampaignPerformanceCreate = z.infer<typeof CampaignPerformanceCreateSchema>;
export type VisualAssetCreate = z.infer<typeof VisualAssetCreateSchema>;
export type VisualAssetUpdate = z.infer<typeof VisualAssetUpdateSchema>;

export type TemplateFilters = z.infer<typeof TemplateFiltersSchema>;
export type Pagination = z.infer<typeof PaginationSchema>;
export type AssetFilters = z.infer<typeof AssetFiltersSchema>;