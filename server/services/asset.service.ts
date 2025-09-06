/**
 * Asset Service - Gerenciamento completo de assets visuais
 *
 * Funcionalidades:
 * - CRUD de assets
 * - Busca e filtros avançados
 * - Sistema de favoritos
 * - Gerenciamento de coleções
 * - Analytics e métricas
 * - Upload e processamento de arquivos
 */

import { eq, and, or, like, inArray, desc, asc, sql } from "drizzle-orm";
import { db } from "../db";
import {
  assets,
  assetCollections,
  assetCollectionItems,
  assetFavorites,
  assetAnalytics,
  Asset,
  InsertAsset,
  AssetCollection,
  InsertAssetCollection,
  AssetCollectionItem,
  InsertAssetCollectionItem,
  AssetFavorite,
  InsertAssetFavorite,
  AssetAnalytics,
  InsertAssetAnalytics
} from "../../shared/schema";

export interface AssetSearchFilters {
  query?: string;
  type?: string[];
  category?: string[];
  format?: string[];
  tags?: string[];
  colors?: string[];
  isPremium?: boolean;
  minWidth?: number;
  maxWidth?: number;
  minHeight?: number;
  maxHeight?: number;
  maxFileSize?: number;
  sortBy?: 'relevance' | 'name' | 'date' | 'usage' | 'rating' | 'downloads';
  sortOrder?: 'asc' | 'desc';
}

export interface AssetSearchResult {
  assets: Asset[];
  total: number;
  facets: {
    types: { value: string; count: number }[];
    categories: { value: string; count: number }[];
    formats: { value: string; count: number }[];
    tags: { value: string; count: number }[];
    colors: { value: string; count: number }[];
  };
  pagination: {
    page: number;
    limit: number;
    hasMore: boolean;
  };
}

export class AssetService {
  /**
   * Busca assets com filtros avançados
   */
  async searchAssets(
    filters: AssetSearchFilters,
    page: number = 1,
    limit: number = 24,
    userId?: string
  ): Promise<AssetSearchResult> {
    const offset = (page - 1) * limit;

    // Construir condições de filtro
    const conditions = [];

    if (filters.query) {
      conditions.push(or(
        like(assets.name, `%${filters.query}%`),
        like(assets.description, `%${filters.query}%`),
        sql`${assets.tags}::text ILIKE ${`%${filters.query}%`}`
      ));
    }

    if (filters.type?.length) {
      conditions.push(inArray(assets.type, filters.type));
    }

    if (filters.category?.length) {
      conditions.push(inArray(assets.category, filters.category));
    }

    if (filters.format?.length) {
      conditions.push(inArray(assets.format, filters.format));
    }

    if (filters.tags?.length) {
      // Filtrar por tags usando JSON contains
      const tagConditions = filters.tags.map(tag =>
        sql`${assets.tags}::jsonb ? ${tag}`
      );
      conditions.push(or(...tagConditions));
    }

    if (filters.colors?.length) {
      const colorConditions = filters.colors.map(color =>
        sql`${assets.colors}::jsonb ? ${color}`
      );
      conditions.push(or(...colorConditions));
    }

    if (filters.isPremium !== undefined) {
      conditions.push(eq(assets.isPremium, filters.isPremium));
    }

    if (filters.minWidth || filters.maxWidth) {
      if (filters.minWidth) {
        conditions.push(sql`(assets.dimensions->>'width')::int >= ${filters.minWidth}`);
      }
      if (filters.maxWidth) {
        conditions.push(sql`(assets.dimensions->>'width')::int <= ${filters.maxWidth}`);
      }
    }

    if (filters.minHeight || filters.maxHeight) {
      if (filters.minHeight) {
        conditions.push(sql`(assets.dimensions->>'height')::int >= ${filters.minHeight}`);
      }
      if (filters.maxHeight) {
        conditions.push(sql`(assets.dimensions->>'height')::int <= ${filters.maxHeight}`);
      }
    }

    if (filters.maxFileSize) {
      conditions.push(sql`assets.file_size <= ${filters.maxFileSize * 1024 * 1024}`); // Convert MB to bytes
    }

    // Assets públicos ou criados pelo usuário
    if (userId) {
      conditions.push(or(
        eq(assets.isPublic, true),
        eq(assets.createdBy, userId)
      ));
    } else {
      conditions.push(eq(assets.isPublic, true));
    }

    const whereClause = conditions.length > 0 ? and(...conditions) : undefined;

    // Ordenação
    let orderBy;
    switch (filters.sortBy) {
      case 'name':
        orderBy = filters.sortOrder === 'desc' ? desc(assets.name) : asc(assets.name);
        break;
      case 'date':
        orderBy = filters.sortOrder === 'desc' ? desc(assets.createdAt) : asc(assets.createdAt);
        break;
      case 'usage':
        orderBy = filters.sortOrder === 'desc' ? desc(assets.usageCount) : asc(assets.usageCount);
        break;
      case 'rating':
        orderBy = filters.sortOrder === 'desc' ? desc(assets.rating) : asc(assets.rating);
        break;
      case 'downloads':
        orderBy = filters.sortOrder === 'desc' ? desc(assets.downloadCount) : asc(assets.downloadCount);
        break;
      default:
        orderBy = desc(assets.createdAt);
    }

    // Buscar assets
    const assetsResult = await db
      .select()
      .from(assets)
      .where(whereClause)
      .orderBy(orderBy)
      .limit(limit)
      .offset(offset);

    // Contar total
    const totalResult = await db
      .select({ count: sql<number>`count(*)` })
      .from(assets)
      .where(whereClause);

    const total = totalResult[0]?.count || 0;

    // Calcular facets
    const facets = await this.calculateFacets(whereClause);

    return {
      assets: assetsResult,
      total,
      facets,
      pagination: {
        page,
        limit,
        hasMore: offset + limit < total
      }
    };
  }

  /**
   * Calcula facets para filtros
   */
  private async calculateFacets(whereClause?: any) {
    const facetQueries = [
      // Types
      db.select({
        value: assets.type,
        count: sql<number>`count(*)`
      })
      .from(assets)
      .where(whereClause)
      .groupBy(assets.type),

      // Categories
      db.select({
        value: assets.category,
        count: sql<number>`count(*)`
      })
      .from(assets)
      .where(whereClause)
      .groupBy(assets.category),

      // Formats
      db.select({
        value: assets.format,
        count: sql<number>`count(*)`
      })
      .from(assets)
      .where(whereClause)
      .groupBy(assets.format),

      // Tags (mais complexo - precisa expandir array JSON)
      db.select({
        value: sql<string>`jsonb_array_elements_text(${assets.tags})`,
        count: sql<number>`count(*)`
      })
      .from(assets)
      .where(and(whereClause, sql`${assets.tags} IS NOT NULL`))
      .groupBy(sql`jsonb_array_elements_text(${assets.tags})`),

      // Colors
      db.select({
        value: sql<string>`jsonb_array_elements_text(${assets.colors})`,
        count: sql<number>`count(*)`
      })
      .from(assets)
      .where(and(whereClause, sql`${assets.colors} IS NOT NULL`))
      .groupBy(sql`jsonb_array_elements_text(${assets.colors})`)
    ];

    const [types, categories, formats, tags, colors] = await Promise.all(facetQueries);

    return {
      types: types as { value: string; count: number }[],
      categories: categories as { value: string; count: number }[],
      formats: formats as { value: string; count: number }[],
      tags: tags as { value: string; count: number }[],
      colors: colors as { value: string; count: number }[]
    };
  }

  /**
   * Busca asset por ID
   */
  async getAssetById(id: string, userId?: string): Promise<Asset | null> {
    const result = await db
      .select()
      .from(assets)
      .where(and(
        eq(assets.id, id),
        userId ? or(eq(assets.isPublic, true), eq(assets.createdBy, userId)) : eq(assets.isPublic, true)
      ))
      .limit(1);

    if (result.length === 0) {
      return null;
    }

    // Registrar visualização
    if (userId) {
      await this.trackAssetView(id, userId);
    }

    return result[0];
  }

  /**
   * Cria novo asset
   */
  async createAsset(assetData: InsertAsset): Promise<Asset> {
    const result = await db
      .insert(assets)
      .values(assetData)
      .returning();

    return result[0];
  }

  /**
   * Atualiza asset
   */
  async updateAsset(id: string, updates: Partial<InsertAsset>, userId?: string): Promise<Asset | null> {
    // Verificar se o usuário tem permissão
    const asset = await this.getAssetById(id, userId);
    if (!asset || (userId && asset.createdBy !== userId)) {
      return null;
    }

    const result = await db
      .update(assets)
      .set({ ...updates, updatedAt: new Date() })
      .where(eq(assets.id, id))
      .returning();

    return result[0] || null;
  }

  /**
   * Remove asset
   */
  async deleteAsset(id: string, userId?: string): Promise<boolean> {
    // Verificar se o usuário tem permissão
    const asset = await this.getAssetById(id, userId);
    if (!asset || (userId && asset.createdBy !== userId)) {
      return false;
    }

    await db.delete(assets).where(eq(assets.id, id));
    return true;
  }

  /**
   * Sistema de Favoritos
   */
  async addToFavorites(assetId: string, userId: string): Promise<boolean> {
    try {
      await db.insert(assetFavorites).values({
        userId,
        assetId
      });
      return true;
    } catch (error) {
      // Já é favorito
      return false;
    }
  }

  async removeFromFavorites(assetId: string, userId: string): Promise<boolean> {
    const result = await db
      .delete(assetFavorites)
      .where(and(
        eq(assetFavorites.assetId, assetId),
        eq(assetFavorites.userId, userId)
      ))
      .returning({ id: assetFavorites.id });

    return result.length > 0;
  }

  async getUserFavorites(userId: string): Promise<Asset[]> {
    const result = await db
      .select({
        asset: assets
      })
      .from(assetFavorites)
      .innerJoin(assets, eq(assetFavorites.assetId, assets.id))
      .where(eq(assetFavorites.userId, userId))
      .orderBy(desc(assetFavorites.addedAt));

    return result.map(row => row.asset);
  }

  async isFavorite(assetId: string, userId: string): Promise<boolean> {
    const result = await db
      .select()
      .from(assetFavorites)
      .where(and(
        eq(assetFavorites.assetId, assetId),
        eq(assetFavorites.userId, userId)
      ))
      .limit(1);

    return result.length > 0;
  }

  /**
   * Sistema de Coleções
   */
  async createCollection(collectionData: InsertAssetCollection): Promise<AssetCollection> {
    const result = await db
      .insert(assetCollections)
      .values(collectionData)
      .returning();

    return result[0];
  }

  async getUserCollections(userId: string): Promise<AssetCollection[]> {
    return await db
      .select()
      .from(assetCollections)
      .where(eq(assetCollections.createdBy, userId))
      .orderBy(desc(assetCollections.createdAt));
  }

  async addAssetToCollection(collectionId: string, assetId: string, userId: string): Promise<boolean> {
    // Verificar se a coleção pertence ao usuário
    const collection = await db
      .select()
      .from(assetCollections)
      .where(and(
        eq(assetCollections.id, collectionId),
        eq(assetCollections.createdBy, userId)
      ))
      .limit(1);

    if (collection.length === 0) {
      return false;
    }

    try {
      await db.insert(assetCollectionItems).values({
        collectionId,
        assetId
      });
      return true;
    } catch (error) {
      // Já está na coleção
      return false;
    }
  }

  async removeAssetFromCollection(collectionId: string, assetId: string, userId: string): Promise<boolean> {
    // Verificar se a coleção pertence ao usuário
    const collection = await db
      .select()
      .from(assetCollections)
      .where(and(
        eq(assetCollections.id, collectionId),
        eq(assetCollections.createdBy, userId)
      ))
      .limit(1);

    if (collection.length === 0) {
      return false;
    }

    const result = await db
      .delete(assetCollectionItems)
      .where(and(
        eq(assetCollectionItems.collectionId, collectionId),
        eq(assetCollectionItems.assetId, assetId)
      ))
      .returning({ id: assetCollectionItems.id });

    return result.length > 0;
  }

  /**
   * Analytics e métricas
   */
  async trackAssetView(assetId: string, userId?: string): Promise<void> {
    await db.insert(assetAnalytics).values({
      assetId,
      userId: userId || null,
      action: 'view'
    });

    // Incrementar contador de uso
    await db
      .update(assets)
      .set({
        usageCount: sql`${assets.usageCount} + 1`,
        updatedAt: new Date()
      })
      .where(eq(assets.id, assetId));
  }

  async trackAssetDownload(assetId: string, userId?: string): Promise<void> {
    await db.insert(assetAnalytics).values({
      assetId,
      userId: userId || null,
      action: 'download'
    });

    // Incrementar contador de downloads
    await db
      .update(assets)
      .set({
        downloadCount: sql`${assets.downloadCount} + 1`,
        updatedAt: new Date()
      })
      .where(eq(assets.id, assetId));
  }

  async getAssetAnalytics(assetId: string): Promise<any> {
    const views = await db
      .select({ count: sql<number>`count(*)` })
      .from(assetAnalytics)
      .where(and(
        eq(assetAnalytics.assetId, assetId),
        eq(assetAnalytics.action, 'view')
      ));

    const downloads = await db
      .select({ count: sql<number>`count(*)` })
      .from(assetAnalytics)
      .where(and(
        eq(assetAnalytics.assetId, assetId),
        eq(assetAnalytics.action, 'download')
      ));

    return {
      views: views[0]?.count || 0,
      downloads: downloads[0]?.count || 0
    };
  }

  /**
   * Assets em alta (trending)
   */
  async getTrendingAssets(limit: number = 10): Promise<Asset[]> {
    return await db
      .select()
      .from(assets)
      .where(eq(assets.isPublic, true))
      .orderBy(desc(assets.usageCount))
      .limit(limit);
  }

  /**
   * Assets similares
   */
  async getSimilarAssets(assetId: string, limit: number = 6): Promise<Asset[]> {
    const asset = await this.getAssetById(assetId);
    if (!asset) return [];

    // Buscar por categoria e tipo similares
    return await db
      .select()
      .from(assets)
      .where(and(
        eq(assets.isPublic, true),
        or(
          eq(assets.category, asset.category),
          eq(assets.type, asset.type)
        ),
        sql`${assets.id} != ${assetId}`
      ))
      .orderBy(desc(assets.rating))
      .limit(limit);
  }
}

export const assetService = new AssetService();