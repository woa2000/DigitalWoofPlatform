/**
 * Hook para gerenciar biblioteca de assets visuais
 * 
 * Funcionalidades:
 * - Busca e filtros de assets por categoria, tipo, tags
 * - Upload e gerenciamento de assets personalizados
 * - Sistema de favoritos persistente
 * - Preview e download de assets
 * - Métricas de uso e popularidade
 */

import { useState, useEffect, useCallback, useMemo } from 'react';
import { useDebounce } from './useDebounce';
import { supabase } from '../lib/supabase';

export interface Asset {
  id: string;
  name: string;
  description: string;
  type: 'image' | 'video' | 'icon' | 'template' | 'background' | 'illustration';
  category: string; // 'pets', 'medical', 'seasonal', 'promotional', 'educational'
  format: string; // 'jpg', 'png', 'svg', 'mp4', 'gif'
  dimensions: {
    width: number;
    height: number;
  };
  fileSize: number; // in bytes
  url: string;
  thumbnailUrl: string;
  previewUrl?: string;
  tags: string[];
  colors: string[]; // Dominant colors for filtering
  isPremium: boolean;
  isPublic: boolean;
  createdBy: string;
  usageCount: number;
  downloadCount: number;
  rating: number;
  createdAt: string;
  updatedAt: string;
  metadata?: {
    alt?: string;
    caption?: string;
    attribution?: string;
    license?: string;
  };
}

export interface AssetFilters {
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
  maxFileSize?: number; // in MB
  sortBy?: 'relevance' | 'name' | 'date' | 'usage' | 'rating' | 'downloads';
  sortOrder?: 'asc' | 'desc';
}

export interface AssetCollection {
  id: string;
  name: string;
  description: string;
  assets: Asset[];
  isPublic: boolean;
  createdBy: string;
  createdAt: string;
}

export interface UseAssetsReturn {
  assets: Asset[];
  collections: AssetCollection[];
  loading: boolean;
  error: string | null;
  total: number;
  facets: {
    types: { value: string; count: number }[];
    categories: { value: string; count: number }[];
    formats: { value: string; count: number }[];
    tags: { value: string; count: number }[];
    colors: { value: string; count: number }[];
  };
  filters: AssetFilters;
  pagination: {
    page: number;
    limit: number;
    hasMore: boolean;
  };
  favorites: string[];
  selectedAssets: Asset[];
  
  // Search and filtering
  search: (query: string) => void;
  setFilters: (filters: Partial<AssetFilters>) => void;
  clearFilters: () => void;
  loadMore: () => void;
  refresh: () => void;
  
  // Asset management
  getAsset: (id: string) => Promise<Asset | null>;
  uploadAsset: (file: File, metadata: Partial<Asset>) => Promise<Asset>;
  updateAsset: (id: string, updates: Partial<Asset>) => Promise<Asset>;
  deleteAsset: (id: string) => Promise<void>;
  downloadAsset: (id: string) => Promise<void>;
  
  // Favorites
  toggleFavorite: (assetId: string) => void;
  isFavorite: (assetId: string) => boolean;
  getFavorites: () => Promise<Asset[]>;
  
  // Selection
  selectAsset: (asset: Asset) => void;
  deselectAsset: (assetId: string) => void;
  clearSelection: () => void;
  isSelected: (assetId: string) => boolean;
  
  // Collections
  createCollection: (name: string, description: string, assetIds: string[]) => Promise<AssetCollection>;
  updateCollection: (id: string, updates: Partial<AssetCollection>) => Promise<AssetCollection>;
  deleteCollection: (id: string) => Promise<void>;
  addToCollection: (collectionId: string, assetIds: string[]) => Promise<void>;
  removeFromCollection: (collectionId: string, assetIds: string[]) => Promise<void>;
  
  // Analytics
  trackAssetView: (assetId: string) => void;
  getAssetAnalytics: (assetId: string) => Promise<any>;
  getTrendingAssets: () => Promise<Asset[]>;
  getSimilarAssets: (assetId: string) => Promise<Asset[]>;
}

const DEFAULT_FILTERS: AssetFilters = {
  sortBy: 'relevance',
  sortOrder: 'desc'
};

const ITEMS_PER_PAGE = 24;

// Helper function to make authenticated requests
const makeAuthenticatedRequest = async (url: string, options: RequestInit = {}) => {
  const { data: { session } } = await supabase.auth.getSession();

  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    ...options.headers as Record<string, string>,
  };

  if (session?.access_token) {
    headers['Authorization'] = `Bearer ${session.access_token}`;
  }

  return fetch(url, {
    ...options,
    headers,
  });
};

export function useAssets(): UseAssetsReturn {
  // State
  const [assets, setAssets] = useState<Asset[]>([]);
  const [collections, setCollections] = useState<AssetCollection[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [total, setTotal] = useState(0);
  const [facets, setFacets] = useState({
    types: [],
    categories: [],
    formats: [],
    tags: [],
    colors: []
  });
  const [filters, setFiltersState] = useState<AssetFilters>(DEFAULT_FILTERS);
  const [page, setPage] = useState(1);
  const [favorites, setFavorites] = useState<string[]>([]);
  const [selectedAssets, setSelectedAssets] = useState<Asset[]>([]);

  // Debounced search
  const debouncedQuery = useDebounce(filters.query || '', 300);

  // Memoized search params
  const searchParams = useMemo(() => ({
    ...filters,
    query: debouncedQuery,
    page,
    limit: ITEMS_PER_PAGE
  }), [filters, debouncedQuery, page]);

  // Load assets
  const loadAssets = useCallback(async (params: any, append = false) => {
    setLoading(true);
    setError(null);

    try {
      const response = await makeAuthenticatedRequest('/api/assets/search', {
        method: 'POST',
        body: JSON.stringify(params)
      });

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }

      const data = await response.json();

      setAssets(prev => append ? [...prev, ...data.assets] : data.assets);
      setTotal(data.total);
      setFacets(data.facets);

    } catch (err) {
      const message = err instanceof Error ? err.message : 'Erro ao carregar assets';
      setError(message);
      console.error('Error loading assets:', err);
    } finally {
      setLoading(false);
    }
  }, []);

  // Load collections
  const loadCollections = useCallback(async () => {
    try {
      const response = await makeAuthenticatedRequest('/api/assets/collections');
      if (response.ok) {
        const data = await response.json();
        setCollections(data.collections);
      }
    } catch (err) {
      console.error('Error loading collections:', err);
    }
  }, []);

  // Load favorites
  const loadFavorites = useCallback(async () => {
    try {
      const response = await makeAuthenticatedRequest('/api/assets/favorites');
      if (response.ok) {
        const data = await response.json();
        setFavorites(data.favoriteIds);
      }
    } catch (err) {
      console.error('Error loading favorites:', err);
    }
  }, []);

  // Search function
  const search = useCallback((query: string) => {
    setFiltersState(prev => ({ ...prev, query }));
    setPage(1);
  }, []);

  // Set filters
  const setFilters = useCallback((newFilters: Partial<AssetFilters>) => {
    setFiltersState(prev => ({ ...prev, ...newFilters }));
    setPage(1);
  }, []);

  // Clear filters
  const clearFilters = useCallback(() => {
    setFiltersState(DEFAULT_FILTERS);
    setPage(1);
  }, []);

  // Load more
  const loadMore = useCallback(() => {
    if (!loading && assets.length < total) {
      setPage(prev => prev + 1);
    }
  }, [loading, assets.length, total]);

  // Refresh
  const refresh = useCallback(() => {
    setPage(1);
    loadAssets(searchParams, false);
  }, [loadAssets, searchParams]);

  // Get single asset
  const getAsset = useCallback(async (id: string): Promise<Asset | null> => {
    try {
      const response = await makeAuthenticatedRequest(`/api/assets/${id}`);
      if (response.ok) {
        const data = await response.json();
        return data.asset;
      }
      return null;
    } catch (err) {
      console.error('Error getting asset:', err);
      return null;
    }
  }, []);

  // Upload asset
  const uploadAsset = useCallback(async (file: File, metadata: Partial<Asset>): Promise<Asset> => {
    const formData = new FormData();
    formData.append('file', file);
    formData.append('metadata', JSON.stringify(metadata));

    const response = await fetch('/api/assets/upload', {
      method: 'POST',
      body: formData
    });

    if (!response.ok) {
      throw new Error(`Upload failed: ${response.statusText}`);
    }

    const data = await response.json();
    
    // Add to current assets list
    setAssets(prev => [data.asset, ...prev]);
    
    return data.asset;
  }, []);

  // Update asset
  const updateAsset = useCallback(async (id: string, updates: Partial<Asset>): Promise<Asset> => {
    const response = await fetch(`/api/assets/${id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(updates)
    });

    if (!response.ok) {
      throw new Error(`Update failed: ${response.statusText}`);
    }

    const data = await response.json();
    
    // Update in current assets list
    setAssets(prev => prev.map(asset => asset.id === id ? data.asset : asset));
    
    return data.asset;
  }, []);

  // Delete asset
  const deleteAsset = useCallback(async (id: string): Promise<void> => {
    const response = await fetch(`/api/assets/${id}`, {
      method: 'DELETE'
    });

    if (!response.ok) {
      throw new Error(`Delete failed: ${response.statusText}`);
    }

    // Remove from current assets list
    setAssets(prev => prev.filter(asset => asset.id !== id));
    setSelectedAssets(prev => prev.filter(asset => asset.id !== id));
    setFavorites(prev => prev.filter(favId => favId !== id));
  }, []);

  // Download asset
  const downloadAsset = useCallback(async (id: string): Promise<void> => {
    try {
      const response = await fetch(`/api/assets/${id}/download`, {
        method: 'POST'
      });

      if (response.ok) {
        const blob = await response.blob();
        const asset = assets.find(a => a.id === id);
        
        if (asset) {
          const url = window.URL.createObjectURL(blob);
          const a = document.createElement('a');
          a.href = url;
          a.download = `${asset.name}.${asset.format}`;
          document.body.appendChild(a);
          a.click();
          window.URL.revokeObjectURL(url);
          document.body.removeChild(a);
        }
      }
    } catch (err) {
      console.error('Error downloading asset:', err);
    }
  }, [assets]);

  // Favorites management
  const toggleFavorite = useCallback(async (assetId: string) => {
    try {
      const isFav = favorites.includes(assetId);
      const method = isFav ? 'DELETE' : 'POST';
      
      const response = await fetch(`/api/assets/${assetId}/favorite`, {
        method
      });

      if (response.ok) {
        setFavorites(prev => 
          isFav 
            ? prev.filter(id => id !== assetId)
            : [...prev, assetId]
        );
      }
    } catch (err) {
      console.error('Error toggling favorite:', err);
    }
  }, [favorites]);

  const isFavorite = useCallback((assetId: string) => {
    return favorites.includes(assetId);
  }, [favorites]);

  const getFavorites = useCallback(async (): Promise<Asset[]> => {
    try {
      const response = await fetch('/api/assets/favorites/detailed');
      if (response.ok) {
        const data = await response.json();
        return data.assets;
      }
      return [];
    } catch (err) {
      console.error('Error getting favorites:', err);
      return [];
    }
  }, []);

  // Selection management
  const selectAsset = useCallback((asset: Asset) => {
    setSelectedAssets(prev => {
      if (prev.find(a => a.id === asset.id)) {
        return prev;
      }
      return [...prev, asset];
    });
  }, []);

  const deselectAsset = useCallback((assetId: string) => {
    setSelectedAssets(prev => prev.filter(asset => asset.id !== assetId));
  }, []);

  const clearSelection = useCallback(() => {
    setSelectedAssets([]);
  }, []);

  const isSelected = useCallback((assetId: string) => {
    return selectedAssets.some(asset => asset.id === assetId);
  }, [selectedAssets]);

  // Collections management
  const createCollection = useCallback(async (name: string, description: string, assetIds: string[]): Promise<AssetCollection> => {
    const response = await fetch('/api/assets/collections', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name, description, assetIds })
    });

    if (!response.ok) {
      throw new Error(`Failed to create collection: ${response.statusText}`);
    }

    const data = await response.json();
    setCollections(prev => [data.collection, ...prev]);
    
    return data.collection;
  }, []);

  const updateCollection = useCallback(async (id: string, updates: Partial<AssetCollection>): Promise<AssetCollection> => {
    const response = await fetch(`/api/assets/collections/${id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(updates)
    });

    if (!response.ok) {
      throw new Error(`Failed to update collection: ${response.statusText}`);
    }

    const data = await response.json();
    setCollections(prev => prev.map(col => col.id === id ? data.collection : col));
    
    return data.collection;
  }, []);

  const deleteCollection = useCallback(async (id: string): Promise<void> => {
    const response = await fetch(`/api/assets/collections/${id}`, {
      method: 'DELETE'
    });

    if (!response.ok) {
      throw new Error(`Failed to delete collection: ${response.statusText}`);
    }

    setCollections(prev => prev.filter(col => col.id !== id));
  }, []);

  const addToCollection = useCallback(async (collectionId: string, assetIds: string[]): Promise<void> => {
    const response = await fetch(`/api/assets/collections/${collectionId}/assets`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ assetIds })
    });

    if (!response.ok) {
      throw new Error(`Failed to add assets to collection: ${response.statusText}`);
    }

    // Reload collections to get updated data
    loadCollections();
  }, [loadCollections]);

  const removeFromCollection = useCallback(async (collectionId: string, assetIds: string[]): Promise<void> => {
    const response = await fetch(`/api/assets/collections/${collectionId}/assets`, {
      method: 'DELETE',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ assetIds })
    });

    if (!response.ok) {
      throw new Error(`Failed to remove assets from collection: ${response.statusText}`);
    }

    // Reload collections to get updated data
    loadCollections();
  }, [loadCollections]);

  // Analytics functions
  const trackAssetView = useCallback(async (assetId: string) => {
    try {
      await fetch(`/api/assets/${assetId}/view`, {
        method: 'POST'
      });
    } catch (err) {
      console.error('Error tracking asset view:', err);
    }
  }, []);

  const getAssetAnalytics = useCallback(async (assetId: string) => {
    try {
      const response = await fetch(`/api/assets/${assetId}/analytics`);
      if (response.ok) {
        return await response.json();
      }
      return null;
    } catch (err) {
      console.error('Error getting asset analytics:', err);
      return null;
    }
  }, []);

  const getTrendingAssets = useCallback(async (): Promise<Asset[]> => {
    try {
      const response = await fetch('/api/assets/trending');
      if (response.ok) {
        const data = await response.json();
        return data.assets;
      }
      return [];
    } catch (err) {
      console.error('Error getting trending assets:', err);
      return [];
    }
  }, []);

  const getSimilarAssets = useCallback(async (assetId: string): Promise<Asset[]> => {
    try {
      const response = await fetch(`/api/assets/${assetId}/similar`);
      if (response.ok) {
        const data = await response.json();
        return data.assets;
      }
      return [];
    } catch (err) {
      console.error('Error getting similar assets:', err);
      return [];
    }
  }, []);

  // Effects
  useEffect(() => {
    loadAssets(searchParams, page > 1);
  }, [searchParams, page, loadAssets]);

  useEffect(() => {
    loadCollections();
    loadFavorites();
  }, [loadCollections, loadFavorites]);

  // Computed values
  const pagination = useMemo(() => ({
    page,
    limit: ITEMS_PER_PAGE,
    hasMore: assets.length < total
  }), [page, assets.length, total]);

  return {
    assets,
    collections,
    loading,
    error,
    total,
    facets,
    filters,
    pagination,
    favorites,
    selectedAssets,
    
    // Search and filtering
    search,
    setFilters,
    clearFilters,
    loadMore,
    refresh,
    
    // Asset management
    getAsset,
    uploadAsset,
    updateAsset,
    deleteAsset,
    downloadAsset,
    
    // Favorites
    toggleFavorite,
    isFavorite,
    getFavorites,
    
    // Selection
    selectAsset,
    deselectAsset,
    clearSelection,
    isSelected,
    
    // Collections
    createCollection,
    updateCollection,
    deleteCollection,
    addToCollection,
    removeFromCollection,
    
    // Analytics
    trackAssetView,
    getAssetAnalytics,
    getTrendingAssets,
    getSimilarAssets
  };
}