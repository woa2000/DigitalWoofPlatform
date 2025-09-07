import { pgTable, uuid, text, timestamp, jsonb, boolean, integer, decimal } from 'drizzle-orm/pg-core';
import { createInsertSchema, createSelectSchema } from 'drizzle-zod';
import { z } from 'zod';
import { tenantsTable } from '../tenant-system/tenants.schema';

/**
 * Schema da tabela assets - Biblioteca Visual Principal
 */
export const assetsTable = pgTable('assets', {
  id: uuid('id').primaryKey().defaultRandom(),
  name: text('name').notNull(),
  description: text('description'),
  type: text('type').$type<'image' | 'video' | 'audio' | 'document' | 'graphic' | 'template'>().notNull(),
  category: text('category').$type<'brand' | 'stock' | 'user_generated' | 'template' | 'icon' | 'background'>(),
  subCategory: text('sub_category'),
  fileUrl: text('file_url').notNull(),
  thumbnailUrl: text('thumbnail_url'),
  fileName: text('file_name').notNull(),
  fileSize: integer('file_size'), // em bytes
  mimeType: text('mime_type').notNull(),
  dimensions: jsonb('dimensions').$type<{ width: number; height: number }>(),
  duration: integer('duration'), // em segundos para videos/audio
  resolution: text('resolution'),
  colorPalette: jsonb('color_palette').$type<string[]>(),
  tags: jsonb('tags').$type<string[]>().default([]),
  keywords: jsonb('keywords').$type<string[]>().default([]),
  metadata: jsonb('metadata').$type<Record<string, any>>(),
  source: text('source').$type<'upload' | 'stock' | 'generated' | 'imported'>().default('upload'),
  sourceData: jsonb('source_data').$type<Record<string, any>>(),
  license: text('license').$type<'free' | 'premium' | 'custom' | 'owned'>().default('owned'),
  licenseData: jsonb('license_data').$type<Record<string, any>>(),
  isPublic: boolean('is_public').default(false),
  isActive: boolean('is_active').default(true),
  downloadCount: integer('download_count').default(0),
  viewCount: integer('view_count').default(0),
  uploadedBy: uuid('uploaded_by'),
  altText: text('alt_text'),
  createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
  updatedAt: timestamp('updated_at', { withTimezone: true }).defaultNow().notNull(),
});

/**
 * Schema da tabela asset_collections - Coleções de Assets
 */
export const assetCollectionsTable = pgTable('asset_collections', {
  id: uuid('id').primaryKey().defaultRandom(),
  tenantId: uuid('tenant_id').notNull().references(() => tenantsTable.id, { onDelete: 'cascade' }),
  name: text('name').notNull(),
  description: text('description'),
  type: text('type').$type<'folder' | 'album' | 'campaign' | 'project' | 'brand_kit'>().default('folder'),
  color: text('color'),
  icon: text('icon'),
  isPublic: boolean('is_public').default(false),
  isSystem: boolean('is_system').default(false),
  parentId: uuid('parent_id'),
  sortOrder: integer('sort_order').default(0),
  settings: jsonb('settings').$type<Record<string, any>>(),
  metadata: jsonb('metadata').$type<Record<string, any>>(),
  createdBy: uuid('created_by').notNull(),
  createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
  updatedAt: timestamp('updated_at', { withTimezone: true }).defaultNow().notNull(),
});

/**
 * Schema da tabela asset_collection_items - Itens dentro das Coleções
 */
export const assetCollectionItemsTable = pgTable('asset_collection_items', {
  id: uuid('id').primaryKey().defaultRandom(),
  collectionId: uuid('collection_id').notNull().references(() => assetCollectionsTable.id, { onDelete: 'cascade' }),
  assetId: uuid('asset_id').notNull().references(() => assetsTable.id, { onDelete: 'cascade' }),
  sortOrder: integer('sort_order').default(0),
  metadata: jsonb('metadata').$type<Record<string, any>>(),
  addedBy: uuid('added_by').notNull(),
  addedAt: timestamp('added_at', { withTimezone: true }).defaultNow().notNull(),
});

/**
 * Schema da tabela asset_favorites - Favoritos dos Usuários
 */
export const assetFavoritesTable = pgTable('asset_favorites', {
  id: uuid('id').primaryKey().defaultRandom(),
  userId: uuid('user_id').notNull(),
  assetId: uuid('asset_id').notNull().references(() => assetsTable.id, { onDelete: 'cascade' }),
  collectionId: uuid('collection_id').references(() => assetCollectionsTable.id, { onDelete: 'cascade' }),
  notes: text('notes'),
  tags: jsonb('tags').$type<string[]>().default([]),
  createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
});

/**
 * Schema da tabela asset_analytics - Analytics de Uso de Assets
 */
export const assetAnalyticsTable = pgTable('asset_analytics', {
  id: uuid('id').primaryKey().defaultRandom(),
  assetId: uuid('asset_id').notNull().references(() => assetsTable.id, { onDelete: 'cascade' }),
  userId: uuid('user_id'),
  action: text('action').$type<'view' | 'download' | 'share' | 'favorite' | 'use_in_content' | 'edit'>().notNull(),
  context: text('context').$type<'search' | 'collection' | 'campaign' | 'content_creation' | 'direct'>(),
  metadata: jsonb('metadata').$type<Record<string, any>>(),
  userAgent: text('user_agent'),
  ipAddress: text('ip_address'),
  timestamp: timestamp('timestamp', { withTimezone: true }).defaultNow().notNull(),
});

/**
 * Schema da tabela brand_assets - Assets Específicos da Marca
 */
export const brandAssetsTable = pgTable('brand_assets', {
  id: uuid('id').primaryKey().defaultRandom(),
  tenantId: uuid('tenant_id').notNull().references(() => tenantsTable.id, { onDelete: 'cascade' }),
  assetId: uuid('asset_id').notNull().references(() => assetsTable.id, { onDelete: 'cascade' }),
  brandElement: text('brand_element').$type<'logo' | 'logo_variation' | 'icon' | 'color_palette' | 'font' | 'pattern' | 'template' | 'signature'>().notNull(),
  variant: text('variant'),
  usage: text('usage').$type<'primary' | 'secondary' | 'watermark' | 'favicon' | 'social' | 'print' | 'digital'>(),
  format: text('format').$type<'png' | 'jpg' | 'svg' | 'pdf' | 'eps' | 'ai' | 'psd'>(),
  colorMode: text('color_mode').$type<'rgb' | 'cmyk' | 'pantone' | 'grayscale' | 'monochrome'>(),
  size: text('size').$type<'thumbnail' | 'small' | 'medium' | 'large' | 'xlarge' | 'vector'>(),
  guidelines: text('guidelines'),
  restrictions: jsonb('restrictions').$type<string[]>(),
  approvedUses: jsonb('approved_uses').$type<string[]>(),
  isActive: boolean('is_active').default(true),
  approvedBy: uuid('approved_by'),
  approvedAt: timestamp('approved_at', { withTimezone: true }),
  createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
  updatedAt: timestamp('updated_at', { withTimezone: true }).defaultNow().notNull(),
});

// Schemas de validação Zod para assets
export const insertAssetSchema = createInsertSchema(assetsTable, {
  name: z.string().min(1, 'Nome do asset é obrigatório').max(200),
  description: z.string().max(1000).optional(),
  type: z.enum(['image', 'video', 'audio', 'document', 'graphic', 'template']),
  category: z.enum(['brand', 'stock', 'user_generated', 'template', 'icon', 'background']).optional(),
  subCategory: z.string().max(50).optional(),
  fileUrl: z.string().url('URL do arquivo deve ser válida'),
  thumbnailUrl: z.string().url().optional(),
  fileName: z.string().min(1, 'Nome do arquivo é obrigatório').max(255),
  fileSize: z.number().positive().optional(),
  mimeType: z.string().regex(/^[a-z]+\/[a-z0-9\-\+\.]+$/i, 'MIME type deve ser válido'),
  resolution: z.string().optional(),
  source: z.enum(['upload', 'stock', 'generated', 'imported']),
  license: z.enum(['free', 'premium', 'custom', 'owned']),
  uploadedBy: z.string().uuid().optional(),
  altText: z.string().max(200).optional(),
});

export const selectAssetSchema = createSelectSchema(assetsTable);
export const updateAssetSchema = insertAssetSchema.partial().omit({ id: true });

// Schemas de validação Zod para asset_collections
export const insertAssetCollectionSchema = createInsertSchema(assetCollectionsTable, {
  tenantId: z.string().uuid('ID do tenant deve ser um UUID válido'),
  name: z.string().min(1, 'Nome da coleção é obrigatório').max(100),
  description: z.string().max(500).optional(),
  type: z.enum(['folder', 'album', 'campaign', 'project', 'brand_kit']),
  color: z.string().regex(/^#[0-9A-F]{6}$/i).optional(),
  icon: z.string().max(50).optional(),
  parentId: z.string().uuid().optional(),
  sortOrder: z.number().min(0),
  createdBy: z.string().uuid('ID do criador deve ser um UUID válido'),
});

export const selectAssetCollectionSchema = createSelectSchema(assetCollectionsTable);
export const updateAssetCollectionSchema = insertAssetCollectionSchema.partial().omit({ id: true });

// Schemas de validação Zod para asset_collection_items
export const insertAssetCollectionItemSchema = createInsertSchema(assetCollectionItemsTable, {
  collectionId: z.string().uuid('ID da coleção deve ser um UUID válido'),
  assetId: z.string().uuid('ID do asset deve ser um UUID válido'),
  sortOrder: z.number().min(0),
  addedBy: z.string().uuid('ID de quem adicionou deve ser um UUID válido'),
});

export const selectAssetCollectionItemSchema = createSelectSchema(assetCollectionItemsTable);
export const updateAssetCollectionItemSchema = insertAssetCollectionItemSchema.partial().omit({ id: true });

// Schemas de validação Zod para asset_favorites
export const insertAssetFavoriteSchema = createInsertSchema(assetFavoritesTable, {
  userId: z.string().uuid('ID do usuário deve ser um UUID válido'),
  assetId: z.string().uuid('ID do asset deve ser um UUID válido'),
  collectionId: z.string().uuid().optional(),
  notes: z.string().max(500).optional(),
});

export const selectAssetFavoriteSchema = createSelectSchema(assetFavoritesTable);
export const updateAssetFavoriteSchema = insertAssetFavoriteSchema.partial().omit({ id: true });

// Schemas de validação Zod para asset_analytics
export const insertAssetAnalyticsSchema = createInsertSchema(assetAnalyticsTable, {
  assetId: z.string().uuid('ID do asset deve ser um UUID válido'),
  userId: z.string().uuid().optional(),
  action: z.enum(['view', 'download', 'share', 'favorite', 'use_in_content', 'edit']),
  context: z.enum(['search', 'collection', 'campaign', 'content_creation', 'direct']).optional(),
  userAgent: z.string().max(500).optional(),
  ipAddress: z.string().ip().optional(),
});

export const selectAssetAnalyticsSchema = createSelectSchema(assetAnalyticsTable);

// Schemas de validação Zod para brand_assets
export const insertBrandAssetSchema = createInsertSchema(brandAssetsTable, {
  tenantId: z.string().uuid('ID do tenant deve ser um UUID válido'),
  assetId: z.string().uuid('ID do asset deve ser um UUID válido'),
  brandElement: z.enum(['logo', 'logo_variation', 'icon', 'color_palette', 'font', 'pattern', 'template', 'signature']),
  variant: z.string().max(50).optional(),
  usage: z.enum(['primary', 'secondary', 'watermark', 'favicon', 'social', 'print', 'digital']).optional(),
  format: z.enum(['png', 'jpg', 'svg', 'pdf', 'eps', 'ai', 'psd']).optional(),
  colorMode: z.enum(['rgb', 'cmyk', 'pantone', 'grayscale', 'monochrome']).optional(),
  size: z.enum(['thumbnail', 'small', 'medium', 'large', 'xlarge', 'vector']).optional(),
  guidelines: z.string().max(1000).optional(),
  approvedBy: z.string().uuid().optional(),
});

export const selectBrandAssetSchema = createSelectSchema(brandAssetsTable);
export const updateBrandAssetSchema = insertBrandAssetSchema.partial().omit({ id: true });

// Tipos TypeScript
export type Asset = typeof assetsTable.$inferSelect;
export type NewAsset = typeof assetsTable.$inferInsert;
export type UpdateAsset = Partial<Omit<NewAsset, 'id' | 'createdAt' | 'updatedAt'>>;

export type AssetCollection = typeof assetCollectionsTable.$inferSelect;
export type NewAssetCollection = typeof assetCollectionsTable.$inferInsert;
export type UpdateAssetCollection = Partial<Omit<NewAssetCollection, 'id' | 'createdAt' | 'updatedAt'>>;

export type AssetCollectionItem = typeof assetCollectionItemsTable.$inferSelect;
export type NewAssetCollectionItem = typeof assetCollectionItemsTable.$inferInsert;
export type UpdateAssetCollectionItem = Partial<Omit<NewAssetCollectionItem, 'id' | 'addedAt'>>;

export type AssetFavorite = typeof assetFavoritesTable.$inferSelect;
export type NewAssetFavorite = typeof assetFavoritesTable.$inferInsert;
export type UpdateAssetFavorite = Partial<Omit<NewAssetFavorite, 'id' | 'createdAt'>>;

export type AssetAnalytics = typeof assetAnalyticsTable.$inferSelect;
export type NewAssetAnalytics = typeof assetAnalyticsTable.$inferInsert;

export type BrandAsset = typeof brandAssetsTable.$inferSelect;
export type NewBrandAsset = typeof brandAssetsTable.$inferInsert;
export type UpdateBrandAsset = Partial<Omit<NewBrandAsset, 'id' | 'createdAt' | 'updatedAt'>>;

// Schemas específicos para validação de dados complexos
export const dimensionsSchema = z.object({
  width: z.number().positive(),
  height: z.number().positive(),
});

export const sourceDataSchema = z.object({
  originalUrl: z.string().url().optional(),
  stockProvider: z.string().optional(),
  stockId: z.string().optional(),
  aiModel: z.string().optional(),
  aiPrompt: z.string().optional(),
  importSource: z.string().optional(),
  importDate: z.string().datetime().optional(),
});

export const licenseDataSchema = z.object({
  provider: z.string().optional(),
  licenseType: z.string().optional(),
  licenseUrl: z.string().url().optional(),
  attribution: z.string().optional(),
  restrictions: z.array(z.string()).optional(),
  expiryDate: z.string().datetime().optional(),
  cost: z.number().optional(),
  currency: z.string().optional(),
});

export const collectionSettingsSchema = z.object({
  sortBy: z.enum(['name', 'date', 'size', 'type', 'custom']).default('date'),
  sortOrder: z.enum(['asc', 'desc']).default('desc'),
  viewMode: z.enum(['grid', 'list', 'masonry']).default('grid'),
  thumbnail: z.object({
    size: z.enum(['small', 'medium', 'large']).default('medium'),
    quality: z.enum(['low', 'medium', 'high']).default('medium'),
  }).optional(),
  permissions: z.object({
    canView: z.array(z.string()).optional(),
    canEdit: z.array(z.string()).optional(),
    canDelete: z.array(z.string()).optional(),
    canShare: z.array(z.string()).optional(),
  }).optional(),
  autoSync: z.boolean().default(false),
  notifications: z.boolean().default(true),
});

export const assetMetadataSchema = z.object({
  exif: z.record(z.string(), z.any()).optional(),
  camera: z.object({
    make: z.string().optional(),
    model: z.string().optional(),
    lens: z.string().optional(),
    settings: z.object({
      iso: z.number().optional(),
      aperture: z.string().optional(),
      shutter: z.string().optional(),
      focal: z.string().optional(),
    }).optional(),
  }).optional(),
  location: z.object({
    latitude: z.number().optional(),
    longitude: z.number().optional(),
    address: z.string().optional(),
    city: z.string().optional(),
    country: z.string().optional(),
  }).optional(),
  processing: z.object({
    software: z.string().optional(),
    filters: z.array(z.string()).optional(),
    adjustments: z.record(z.string(), z.any()).optional(),
  }).optional(),
  usage: z.object({
    campaigns: z.array(z.string()).optional(),
    content: z.array(z.string()).optional(),
    platforms: z.array(z.string()).optional(),
    performance: z.record(z.string(), z.number()).optional(),
  }).optional(),
});