// Re-exportações centralizadas do sistema de assets
export * from './assets.schema';

// Tipos combinados úteis
export type AssetWithCollections = {
  asset: typeof import('./assets.schema').assetsTable.$inferSelect;
  collections?: Array<{
    collection: typeof import('./assets.schema').assetCollectionsTable.$inferSelect;
    addedAt: Date;
    sortOrder: number;
  }>;
  favorites?: Array<typeof import('./assets.schema').assetFavoritesTable.$inferSelect>;
  analytics?: {
    totalViews: number;
    totalDownloads: number;
    recentActivity: Array<typeof import('./assets.schema').assetAnalyticsTable.$inferSelect>;
  };
};

export type CollectionWithAssets = {
  collection: typeof import('./assets.schema').assetCollectionsTable.$inferSelect;
  assets?: Array<{
    asset: typeof import('./assets.schema').assetsTable.$inferSelect;
    addedAt: Date;
    sortOrder: number;
  }>;
  subCollections?: Array<typeof import('./assets.schema').assetCollectionsTable.$inferSelect>;
  statistics?: {
    totalAssets: number;
    totalSize: number;
    assetTypes: Record<string, number>;
  };
};

export type BrandAssetLibrary = {
  tenant: typeof import('../tenant-system/tenants.schema').tenantsTable.$inferSelect;
  brandAssets: Array<{
    brandAsset: typeof import('./assets.schema').brandAssetsTable.$inferSelect;
    asset: typeof import('./assets.schema').assetsTable.$inferSelect;
  }>;
  collections: Array<typeof import('./assets.schema').assetCollectionsTable.$inferSelect>;
  guidelines: Record<string, string>;
};

export type AssetUsageAnalytics = {
  asset: typeof import('./assets.schema').assetsTable.$inferSelect;
  usage: {
    totalViews: number;
    totalDownloads: number;
    totalShares: number;
    uniqueUsers: number;
    topContexts: Array<{ context: string; count: number }>;
    timelineData: Array<{
      date: string;
      views: number;
      downloads: number;
      shares: number;
    }>;
  };
  performance: {
    popularityScore: number;
    engagementRate: number;
    conversionRate: number;
  };
};

// Constantes úteis
export const ASSET_TYPES = [
  'image',
  'video',
  'audio',
  'document',
  'graphic',
  'template'
] as const;

export const ASSET_CATEGORIES = [
  'brand',
  'stock',
  'user_generated',
  'template',
  'icon',
  'background'
] as const;

export const COLLECTION_TYPES = [
  'folder',
  'album',
  'campaign',
  'project',
  'brand_kit'
] as const;

export const ASSET_SOURCES = [
  'upload',
  'stock',
  'generated',
  'imported'
] as const;

export const LICENSE_TYPES = [
  'free',
  'premium',
  'custom',
  'owned'
] as const;

export const BRAND_ELEMENTS = [
  'logo',
  'logo_variation',
  'icon',
  'color_palette',
  'font',
  'pattern',
  'template',
  'signature'
] as const;

export const BRAND_USAGES = [
  'primary',
  'secondary',
  'watermark',
  'favicon',
  'social',
  'print',
  'digital'
] as const;

export const FILE_FORMATS = [
  'png',
  'jpg',
  'svg',
  'pdf',
  'eps',
  'ai',
  'psd'
] as const;

export const COLOR_MODES = [
  'rgb',
  'cmyk',
  'pantone',
  'grayscale',
  'monochrome'
] as const;

export const ASSET_SIZES = [
  'thumbnail',
  'small',
  'medium',
  'large',
  'xlarge',
  'vector'
] as const;

export const ANALYTICS_ACTIONS = [
  'view',
  'download',
  'share',
  'favorite',
  'use_in_content',
  'edit'
] as const;

export const ANALYTICS_CONTEXTS = [
  'search',
  'collection',
  'campaign',
  'content_creation',
  'direct'
] as const;

// MIME Types suportados
export const SUPPORTED_IMAGE_MIMES = [
  'image/jpeg',
  'image/png',
  'image/gif',
  'image/webp',
  'image/svg+xml',
  'image/bmp',
  'image/tiff'
] as const;

export const SUPPORTED_VIDEO_MIMES = [
  'video/mp4',
  'video/webm',
  'video/quicktime',
  'video/x-msvideo',
  'video/x-ms-wmv'
] as const;

export const SUPPORTED_AUDIO_MIMES = [
  'audio/mpeg',
  'audio/wav',
  'audio/ogg',
  'audio/aac',
  'audio/x-m4a'
] as const;

export const SUPPORTED_DOCUMENT_MIMES = [
  'application/pdf',
  'application/msword',
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
  'application/vnd.ms-powerpoint',
  'application/vnd.openxmlformats-officedocument.presentationml.presentation',
  'text/plain',
  'text/html',
  'text/css'
] as const;

// Helpers para validação e processamento
export const isImageAsset = (mimeType: string): boolean => {
  return SUPPORTED_IMAGE_MIMES.includes(mimeType as any);
};

export const isVideoAsset = (mimeType: string): boolean => {
  return SUPPORTED_VIDEO_MIMES.includes(mimeType as any);
};

export const isAudioAsset = (mimeType: string): boolean => {
  return SUPPORTED_AUDIO_MIMES.includes(mimeType as any);
};

export const isDocumentAsset = (mimeType: string): boolean => {
  return SUPPORTED_DOCUMENT_MIMES.includes(mimeType as any);
};

export const getAssetTypeFromMime = (mimeType: string): string => {
  if (isImageAsset(mimeType)) return 'image';
  if (isVideoAsset(mimeType)) return 'video';
  if (isAudioAsset(mimeType)) return 'audio';
  if (isDocumentAsset(mimeType)) return 'document';
  return 'document';
};

export const formatFileSize = (bytes: number): string => {
  if (bytes === 0) return '0 Bytes';
  
  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
};

export const formatDuration = (seconds: number): string => {
  if (seconds < 60) {
    return `${Math.floor(seconds)}s`;
  } else if (seconds < 3600) {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = Math.floor(seconds % 60);
    return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`;
  } else {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const remainingSeconds = Math.floor(seconds % 60);
    return `${hours}:${minutes.toString().padStart(2, '0')}:${remainingSeconds.toString().padStart(2, '0')}`;
  }
};

export const extractColorsFromImage = (imageUrl: string): Promise<string[]> => {
  // Implementação para extrair paleta de cores de uma imagem
  // Retorna promise com array de cores em formato hex
  return Promise.resolve(['#FF5733', '#33FF57', '#3357FF']);
};

export const generateThumbnail = (fileUrl: string, type: string): Promise<string> => {
  // Implementação para gerar thumbnail
  // Retorna promise com URL do thumbnail
  return Promise.resolve(`${fileUrl}?thumbnail=true`);
};

export const validateAssetConstraints = (
  asset: Partial<typeof import('./assets.schema').assetsTable.$inferInsert>,
  constraints?: {
    maxFileSize?: number;
    allowedTypes?: string[];
    requiredDimensions?: { width: number; height: number };
  }
): { valid: boolean; errors: string[] } => {
  const errors: string[] = [];
  
  if (constraints?.maxFileSize && asset.fileSize && asset.fileSize > constraints.maxFileSize) {
    errors.push(`Arquivo muito grande. Máximo permitido: ${formatFileSize(constraints.maxFileSize)}`);
  }
  
  if (constraints?.allowedTypes && asset.mimeType && !constraints.allowedTypes.includes(asset.mimeType)) {
    errors.push(`Tipo de arquivo não permitido. Permitidos: ${constraints.allowedTypes.join(', ')}`);
  }
  
  if (constraints?.requiredDimensions && asset.dimensions) {
    const dims = asset.dimensions as { width: number; height: number };
    if (dims.width !== constraints.requiredDimensions.width || dims.height !== constraints.requiredDimensions.height) {
      errors.push(`Dimensões incorretas. Requerido: ${constraints.requiredDimensions.width}x${constraints.requiredDimensions.height}`);
    }
  }
  
  return {
    valid: errors.length === 0,
    errors
  };
};

export const calculateAssetScore = (
  views: number,
  downloads: number,
  shares: number,
  favorites: number
): number => {
  // Algoritmo para calcular popularidade/score do asset
  const viewWeight = 1;
  const downloadWeight = 3;
  const shareWeight = 5;
  const favoriteWeight = 10;
  
  return (
    views * viewWeight +
    downloads * downloadWeight +
    shares * shareWeight +
    favorites * favoriteWeight
  );
};

export const suggestTags = (asset: typeof import('./assets.schema').assetsTable.$inferSelect): string[] => {
  const suggestions: string[] = [];
  
  // Baseado no tipo
  suggestions.push(asset.type);
  
  // Baseado na categoria
  if (asset.category) {
    suggestions.push(asset.category);
  }
  
  // Baseado nas dimensões
  if (asset.dimensions) {
    const dims = asset.dimensions as { width: number; height: number };
    if (dims.width > dims.height) {
      suggestions.push('landscape');
    } else if (dims.height > dims.width) {
      suggestions.push('portrait');
    } else {
      suggestions.push('square');
    }
  }
  
  // Baseado na resolução
  if (asset.resolution) {
    if (asset.resolution.includes('4K') || asset.resolution.includes('2160')) {
      suggestions.push('4k', 'high-resolution');
    } else if (asset.resolution.includes('HD') || asset.resolution.includes('1080')) {
      suggestions.push('hd', 'high-definition');
    }
  }
  
  return suggestions.filter((tag, index, array) => array.indexOf(tag) === index);
};