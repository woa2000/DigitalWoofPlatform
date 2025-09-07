// Re-exportações de tipos do sistema de assets
export type {
  Asset,
  NewAsset,
  UpdateAsset,
  AssetCollection,
  NewAssetCollection,
  UpdateAssetCollection,
  AssetCollectionItem,
  NewAssetCollectionItem,
  UpdateAssetCollectionItem,
  AssetFavorite,
  NewAssetFavorite,
  UpdateAssetFavorite,
  AssetAnalytics,
  NewAssetAnalytics,
  BrandAsset,
  NewBrandAsset,
  UpdateBrandAsset,
  AssetWithCollections,
  CollectionWithAssets,
  BrandAssetLibrary,
  AssetUsageAnalytics
} from '../schemas/assets';

export {
  ASSET_TYPES,
  ASSET_CATEGORIES,
  COLLECTION_TYPES,
  ASSET_SOURCES,
  LICENSE_TYPES,
  BRAND_ELEMENTS,
  BRAND_USAGES,
  FILE_FORMATS,
  COLOR_MODES,
  ASSET_SIZES,
  ANALYTICS_ACTIONS,
  ANALYTICS_CONTEXTS,
  SUPPORTED_IMAGE_MIMES,
  SUPPORTED_VIDEO_MIMES,
  SUPPORTED_AUDIO_MIMES,
  SUPPORTED_DOCUMENT_MIMES,
  isImageAsset,
  isVideoAsset,
  isAudioAsset,
  isDocumentAsset,
  getAssetTypeFromMime,
  formatFileSize,
  formatDuration,
  extractColorsFromImage,
  generateThumbnail,
  validateAssetConstraints,
  calculateAssetScore,
  suggestTags,
  dimensionsSchema,
  sourceDataSchema,
  licenseDataSchema,
  collectionSettingsSchema,
  assetMetadataSchema
} from '../schemas/assets';

// Tipos básicos para assets
export type AssetType = 'image' | 'video' | 'audio' | 'document' | 'graphic' | 'template';
export type AssetCategory = 'brand' | 'stock' | 'user_generated' | 'template' | 'icon' | 'background';
export type CollectionType = 'folder' | 'album' | 'campaign' | 'project' | 'brand_kit';
export type AssetSource = 'upload' | 'stock' | 'generated' | 'imported';
export type LicenseType = 'free' | 'premium' | 'custom' | 'owned';
export type BrandElement = 'logo' | 'logo_variation' | 'icon' | 'color_palette' | 'font' | 'pattern' | 'template' | 'signature';
export type BrandUsage = 'primary' | 'secondary' | 'watermark' | 'favicon' | 'social' | 'print' | 'digital';
export type FileFormat = 'png' | 'jpg' | 'svg' | 'pdf' | 'eps' | 'ai' | 'psd';
export type ColorMode = 'rgb' | 'cmyk' | 'pantone' | 'grayscale' | 'monochrome';
export type AssetSize = 'thumbnail' | 'small' | 'medium' | 'large' | 'xlarge' | 'vector';
export type AnalyticsAction = 'view' | 'download' | 'share' | 'favorite' | 'use_in_content' | 'edit';
export type AnalyticsContext = 'search' | 'collection' | 'campaign' | 'content_creation' | 'direct';

// Interface para dimensões
export interface AssetDimensions {
  width: number;
  height: number;
  aspectRatio?: string;
  orientation?: 'landscape' | 'portrait' | 'square';
}

// Interface para dados de origem
export interface AssetSourceData {
  originalUrl?: string;
  stockProvider?: string;
  stockId?: string;
  aiModel?: string;
  aiPrompt?: string;
  importSource?: string;
  importDate?: string;
  attribution?: string;
}

// Interface para dados de licença
export interface AssetLicenseData {
  provider?: string;
  licenseType?: string;
  licenseUrl?: string;
  attribution?: string;
  restrictions?: string[];
  expiryDate?: string;
  cost?: number;
  currency?: string;
  usage?: string[];
}

// Interface para configurações de coleção
export interface CollectionSettings {
  sortBy: 'name' | 'date' | 'size' | 'type' | 'custom';
  sortOrder: 'asc' | 'desc';
  viewMode: 'grid' | 'list' | 'masonry';
  thumbnail?: {
    size: 'small' | 'medium' | 'large';
    quality: 'low' | 'medium' | 'high';
  };
  permissions?: {
    canView?: string[];
    canEdit?: string[];
    canDelete?: string[];
    canShare?: string[];
  };
  autoSync: boolean;
  notifications: boolean;
}

// Interface para metadados de asset
export interface AssetMetadata {
  exif?: Record<string, any>;
  camera?: {
    make?: string;
    model?: string;
    lens?: string;
    settings?: {
      iso?: number;
      aperture?: string;
      shutter?: string;
      focal?: string;
    };
  };
  location?: {
    latitude?: number;
    longitude?: number;
    address?: string;
    city?: string;
    country?: string;
  };
  processing?: {
    software?: string;
    filters?: string[];
    adjustments?: Record<string, any>;
  };
  usage?: {
    campaigns?: string[];
    content?: string[];
    platforms?: string[];
    performance?: Record<string, number>;
  };
}

// Interface para filtros de busca
export interface AssetSearchFilters {
  type?: AssetType[];
  category?: AssetCategory[];
  tags?: string[];
  dimensions?: {
    minWidth?: number;
    maxWidth?: number;
    minHeight?: number;
    maxHeight?: number;
    aspectRatio?: string[];
  };
  fileSize?: {
    min?: number;
    max?: number;
  };
  dateRange?: {
    start?: Date;
    end?: Date;
  };
  license?: LicenseType[];
  source?: AssetSource[];
  colors?: string[];
  orientation?: 'landscape' | 'portrait' | 'square';
}

// Interface para resultados de busca
export interface AssetSearchResults {
  assets: Asset[];
  total: number;
  page: number;
  limit: number;
  filters: AssetSearchFilters;
  facets: {
    types: Record<AssetType, number>;
    categories: Record<AssetCategory, number>;
    tags: Record<string, number>;
    colors: Record<string, number>;
    orientations: Record<string, number>;
  };
  suggestions?: string[];
}

// Interface para upload de asset
export interface AssetUpload {
  file: File;
  name?: string;
  description?: string;
  tags?: string[];
  category?: AssetCategory;
  collections?: string[];
  metadata?: Partial<AssetMetadata>;
  processing?: {
    generateThumbnail: boolean;
    extractColors: boolean;
    analyzeContent: boolean;
    optimizeSize: boolean;
  };
}

// Interface para processamento de asset
export interface AssetProcessing {
  id: string;
  assetId: string;
  status: 'queued' | 'processing' | 'completed' | 'failed';
  progress: number;
  steps: Array<{
    name: string;
    status: 'pending' | 'running' | 'completed' | 'failed';
    duration?: number;
    error?: string;
  }>;
  results?: {
    thumbnails?: string[];
    colors?: string[];
    tags?: string[];
    metadata?: AssetMetadata;
  };
}

// Interface para otimização de asset
export interface AssetOptimization {
  original: {
    size: number;
    format: string;
    quality: number;
  };
  optimized: {
    size: number;
    format: string;
    quality: number;
    savings: number;
    savingsPercentage: number;
  };
  variants: Array<{
    name: string;
    url: string;
    size: number;
    dimensions: AssetDimensions;
    purpose: string;
  }>;
}

// Interface para análise de uso
export interface AssetUsageReport {
  asset: Asset;
  period: {
    start: Date;
    end: Date;
  };
  metrics: {
    totalViews: number;
    totalDownloads: number;
    totalShares: number;
    uniqueUsers: number;
    averageEngagement: number;
  };
  trends: Array<{
    date: string;
    views: number;
    downloads: number;
    shares: number;
  }>;
  topUsers: Array<{
    userId: string;
    userName: string;
    actions: number;
    lastUsed: Date;
  }>;
  contexts: Record<AnalyticsContext, number>;
  performance: {
    popularityScore: number;
    engagementRate: number;
    retentionRate: number;
  };
}

// Interface para biblioteca de marca
export interface BrandLibrary {
  tenant: any;
  assets: {
    logos: BrandAsset[];
    colors: BrandAsset[];
    fonts: BrandAsset[];
    patterns: BrandAsset[];
    templates: BrandAsset[];
    signatures: BrandAsset[];
  };
  guidelines: {
    logoUsage: string;
    colorGuidelines: string;
    fontGuidelines: string;
    doAndDonts: string[];
  };
  versions: Array<{
    version: string;
    date: Date;
    changes: string[];
    assets: string[];
  }>;
}