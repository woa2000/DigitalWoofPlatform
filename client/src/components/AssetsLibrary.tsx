/**
 * Componente principal da biblioteca de assets visuais
 * 
 * Interface navegável com grid de assets, filtros avançados,
 * sistema de favoritos, upload de assets e coleções
 */

import React, { useState, useCallback } from 'react';
import { Search, Filter, Upload, Grid, List, Heart, Download, Eye, Settings, Plus, Folder } from 'lucide-react';
import { useAssets, Asset } from '../hooks/useAssets';
import { AssetCard } from './AssetCard';
import { AssetFiltersPanel } from './AssetFiltersPanel';
import { AssetPreviewModal } from './AssetPreviewModal';
import { AssetUploadModal } from './AssetUploadModal';
import { CollectionModal } from './CollectionModal';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Badge } from './ui/badge';
import { Skeleton } from './ui/skeleton';
import { Separator } from './ui/separator';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from './ui/tabs';

type ViewMode = 'grid' | 'list';
type TabMode = 'browse' | 'favorites' | 'collections' | 'uploads';

export function AssetsLibrary() {
  const {
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
    search,
    setFilters,
    clearFilters,
    loadMore,
    refresh,
    toggleFavorite,
    isFavorite,
    getFavorites,
    selectAsset,
    deselectAsset,
    clearSelection,
    isSelected,
    downloadAsset,
    trackAssetView
  } = useAssets();

  // Local state
  const [viewMode, setViewMode] = useState<ViewMode>('grid');
  const [activeTab, setActiveTab] = useState<TabMode>('browse');
  const [showFilters, setShowFilters] = useState(false);
  const [selectedAssetForPreview, setSelectedAssetForPreview] = useState<Asset | null>(null);
  const [showUploadModal, setShowUploadModal] = useState(false);
  const [showCollectionModal, setShowCollectionModal] = useState(false);
  const [searchQuery, setSearchQuery] = useState(filters.query || '');
  const [favoriteAssets, setFavoriteAssets] = useState<Asset[]>([]);

  // Handle search
  const handleSearch = useCallback((value: string) => {
    setSearchQuery(value);
    search(value);
  }, [search]);

  // Handle sort change
  const handleSortChange = useCallback((value: string) => {
    const [sortBy, sortOrder] = value.split('-');
    setFilters({ sortBy: sortBy as any, sortOrder: sortOrder as any });
  }, [setFilters]);

  // Handle asset click
  const handleAssetClick = useCallback((asset: Asset) => {
    trackAssetView(asset.id);
    setSelectedAssetForPreview(asset);
  }, [trackAssetView]);

  // Handle asset selection
  const handleAssetSelection = useCallback((asset: Asset, selected: boolean) => {
    if (selected) {
      selectAsset(asset);
    } else {
      deselectAsset(asset.id);
    }
  }, [selectAsset, deselectAsset]);

  // Load favorites when tab changes
  const handleTabChange = useCallback(async (tab: TabMode) => {
    setActiveTab(tab);
    if (tab === 'favorites') {
      const favAssets = await getFavorites();
      setFavoriteAssets(favAssets);
    }
  }, [getFavorites]);

  // Render loading state
  if (loading && assets.length === 0) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <Skeleton className="h-8 w-48" />
          <div className="flex items-center gap-2">
            <Skeleton className="h-10 w-32" />
            <Skeleton className="h-10 w-10" />
            <Skeleton className="h-10 w-10" />
          </div>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6 gap-4">
          {Array.from({ length: 12 }).map((_, i) => (
            <Skeleton key={i} className="aspect-square rounded-lg" />
          ))}
        </div>
      </div>
    );
  }

  // Current assets to display based on active tab
  const currentAssets = activeTab === 'favorites' ? favoriteAssets : assets;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Biblioteca de Assets</h1>
          <p className="text-muted-foreground">
            Gerencie e organize seus assets visuais para campanhas
          </p>
        </div>
        
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => setShowUploadModal(true)}
          >
            <Upload className="h-4 w-4 mr-2" />
            Upload
          </Button>
          
          <Button
            variant="outline"
            size="sm"
            onClick={() => setShowCollectionModal(true)}
            disabled={selectedAssets.length === 0}
          >
            <Folder className="h-4 w-4 mr-2" />
            Coleção
          </Button>
          
          <Separator orientation="vertical" className="h-6" />
          
          <Button
            variant="outline"
            size="sm"
            onClick={() => setViewMode(viewMode === 'grid' ? 'list' : 'grid')}
          >
            {viewMode === 'grid' ? <List className="h-4 w-4" /> : <Grid className="h-4 w-4" />}
          </Button>
          
          <Button
            variant="outline"
            size="sm"
            onClick={() => setShowFilters(!showFilters)}
          >
            <Filter className="h-4 w-4" />
          </Button>
        </div>
      </div>

      {/* Tabs */}
      <Tabs value={activeTab} onValueChange={handleTabChange as (value: string) => void}>
        <TabsList>
          <TabsTrigger value="browse">
            Explorar
            {total > 0 && (
              <Badge variant="secondary" className="ml-2">
                {total.toLocaleString()}
              </Badge>
            )}
          </TabsTrigger>
          <TabsTrigger value="favorites">
            Favoritos
            <Heart className="h-3 w-3 ml-1" />
            {favorites.length > 0 && (
              <Badge variant="secondary" className="ml-2">
                {favorites.length}
              </Badge>
            )}
          </TabsTrigger>
          <TabsTrigger value="collections">
            Coleções
            <Folder className="h-3 w-3 ml-1" />
            {collections.length > 0 && (
              <Badge variant="secondary" className="ml-2">
                {collections.length}
              </Badge>
            )}
          </TabsTrigger>
          <TabsTrigger value="uploads">
            Meus Uploads
          </TabsTrigger>
        </TabsList>

        {/* Search and Controls */}
        <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Buscar assets por nome, tags, categoria..."
              value={searchQuery}
              onChange={(e) => handleSearch(e.target.value)}
              className="pl-10"
            />
          </div>
          
          <div className="flex items-center gap-2">
            <Select
              value={`${filters.sortBy}-${filters.sortOrder}`}
              onValueChange={handleSortChange}
            >
              <SelectTrigger className="w-48">
                <SelectValue placeholder="Ordenar por..." />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="relevance-desc">Mais Relevantes</SelectItem>
                <SelectItem value="date-desc">Mais Recentes</SelectItem>
                <SelectItem value="date-asc">Mais Antigos</SelectItem>
                <SelectItem value="name-asc">Nome A-Z</SelectItem>
                <SelectItem value="name-desc">Nome Z-A</SelectItem>
                <SelectItem value="usage-desc">Mais Usados</SelectItem>
                <SelectItem value="rating-desc">Melhor Avaliados</SelectItem>
                <SelectItem value="downloads-desc">Mais Baixados</SelectItem>
              </SelectContent>
            </Select>
            
            {selectedAssets.length > 0 && (
              <Button
                variant="outline"
                size="sm"
                onClick={clearSelection}
              >
                Limpar ({selectedAssets.length})
              </Button>
            )}
          </div>
        </div>

        {/* Active filters */}
        {(filters.type?.length || filters.category?.length || filters.tags?.length) && (
          <div className="flex items-center gap-2 flex-wrap">
            <span className="text-sm text-muted-foreground">Filtros ativos:</span>
            
            {filters.type?.map(type => (
              <Badge key={type} variant="secondary">
                Tipo: {type}
                <button
                  onClick={() => setFilters({ 
                    type: filters.type?.filter(t => t !== type) 
                  })}
                  className="ml-1 hover:text-destructive"
                >
                  ×
                </button>
              </Badge>
            ))}
            
            {filters.category?.map(category => (
              <Badge key={category} variant="secondary">
                Categoria: {category}
                <button
                  onClick={() => setFilters({ 
                    category: filters.category?.filter(c => c !== category) 
                  })}
                  className="ml-1 hover:text-destructive"
                >
                  ×
                </button>
              </Badge>
            ))}
            
            {filters.tags?.map(tag => (
              <Badge key={tag} variant="secondary">
                Tag: {tag}
                <button
                  onClick={() => setFilters({ 
                    tags: filters.tags?.filter(t => t !== tag) 
                  })}
                  className="ml-1 hover:text-destructive"
                >
                  ×
                </button>
              </Badge>
            ))}
            
            <Button
              variant="ghost"
              size="sm"
              onClick={clearFilters}
              className="text-muted-foreground hover:text-foreground"
            >
              Limpar todos
            </Button>
          </div>
        )}

        {/* Content */}
        <div className="grid grid-cols-12 gap-6">
          {/* Filters Panel */}
          {showFilters && (
            <div className="col-span-12 lg:col-span-3">
              <AssetFiltersPanel
                facets={facets}
                filters={filters}
                onFiltersChange={setFilters}
              />
            </div>
          )}
          
          {/* Main Content */}
          <div className={`col-span-12 ${showFilters ? 'lg:col-span-9' : ''}`}>
            <TabsContent value="browse" className="mt-0">
              {error ? (
                <div className="text-center py-8">
                  <p className="text-destructive mb-4">{error}</p>
                  <Button onClick={refresh} variant="outline">
                    Tentar novamente
                  </Button>
                </div>
              ) : currentAssets.length === 0 ? (
                <div className="text-center py-12">
                  <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-muted flex items-center justify-center">
                    <Search className="h-8 w-8 text-muted-foreground" />
                  </div>
                  <h3 className="text-lg font-medium mb-2">Nenhum asset encontrado</h3>
                  <p className="text-muted-foreground mb-4">
                    Tente ajustar os filtros ou fazer uma nova busca
                  </p>
                  <Button onClick={clearFilters} variant="outline">
                    Limpar filtros
                  </Button>
                </div>
              ) : (
                <>
                  {/* Assets Grid/List */}
                  <div className={`${
                    viewMode === 'grid' 
                      ? 'grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 2xl:grid-cols-6 gap-4' 
                      : 'space-y-4'
                  }`}>
                    {currentAssets.map((asset) => (
                      <AssetCard
                        key={asset.id}
                        asset={asset}
                        viewMode={viewMode}
                        isSelected={isSelected(asset.id)}
                        isFavorite={isFavorite(asset.id)}
                        onSelect={(selected: boolean) => handleAssetSelection(asset, selected)}
                        onFavorite={() => toggleFavorite(asset.id)}
                        onPreview={() => handleAssetClick(asset)}
                        onDownload={() => downloadAsset(asset.id)}
                      />
                    ))}
                  </div>
                  
                  {/* Load More */}
                  {pagination.hasMore && (
                    <div className="text-center mt-8">
                      <Button
                        onClick={loadMore}
                        disabled={loading}
                        variant="outline"
                      >
                        {loading ? 'Carregando...' : 'Carregar mais'}
                      </Button>
                    </div>
                  )}
                </>
              )}
            </TabsContent>
            
            <TabsContent value="favorites" className="mt-0">
              {favoriteAssets.length === 0 ? (
                <div className="text-center py-12">
                  <Heart className="h-16 w-16 mx-auto mb-4 text-muted-foreground" />
                  <h3 className="text-lg font-medium mb-2">Nenhum favorito ainda</h3>
                  <p className="text-muted-foreground">
                    Marque assets como favoritos para acessá-los rapidamente
                  </p>
                </div>
              ) : (
                <div className={`${
                  viewMode === 'grid' 
                    ? 'grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 2xl:grid-cols-6 gap-4' 
                    : 'space-y-4'
                }`}>
                  {favoriteAssets.map((asset) => (
                    <AssetCard
                      key={asset.id}
                      asset={asset}
                      viewMode={viewMode}
                      isSelected={isSelected(asset.id)}
                      isFavorite={true}
                      onSelect={(selected: boolean) => handleAssetSelection(asset, selected)}
                      onFavorite={() => toggleFavorite(asset.id)}
                      onPreview={() => handleAssetClick(asset)}
                      onDownload={() => downloadAsset(asset.id)}
                    />
                  ))}
                </div>
              )}
            </TabsContent>
            
            <TabsContent value="collections" className="mt-0">
              {collections.length === 0 ? (
                <div className="text-center py-12">
                  <Folder className="h-16 w-16 mx-auto mb-4 text-muted-foreground" />
                  <h3 className="text-lg font-medium mb-2">Nenhuma coleção criada</h3>
                  <p className="text-muted-foreground mb-4">
                    Organize seus assets em coleções temáticas
                  </p>
                  <Button onClick={() => setShowCollectionModal(true)}>
                    <Plus className="h-4 w-4 mr-2" />
                    Criar primeira coleção
                  </Button>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {collections.map((collection) => (
                    <div
                      key={collection.id}
                      className="border rounded-lg p-4 hover:shadow-md transition-shadow"
                    >
                      <div className="flex items-start justify-between mb-3">
                        <div>
                          <h3 className="font-medium">{collection.name}</h3>
                          <p className="text-sm text-muted-foreground">
                            {collection.description}
                          </p>
                        </div>
                        <Badge variant="secondary">
                          {collection.assets.length}
                        </Badge>
                      </div>
                      
                      {collection.assets.length > 0 && (
                        <div className="grid grid-cols-3 gap-1 mb-3">
                          {collection.assets.slice(0, 3).map((asset) => (
                            <div
                              key={asset.id}
                              className="aspect-square rounded bg-muted bg-cover bg-center"
                              style={{ backgroundImage: `url(${asset.thumbnailUrl})` }}
                            />
                          ))}
                        </div>
                      )}
                      
                      <div className="flex items-center justify-between text-sm text-muted-foreground">
                        <span>{new Date(collection.createdAt).toLocaleDateString()}</span>
                        <Button variant="ghost" size="sm">
                          <Eye className="h-3 w-3 mr-1" />
                          Ver
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </TabsContent>
            
            <TabsContent value="uploads" className="mt-0">
              <div className="text-center py-12">
                <Upload className="h-16 w-16 mx-auto mb-4 text-muted-foreground" />
                <h3 className="text-lg font-medium mb-2">Seus uploads</h3>
                <p className="text-muted-foreground mb-4">
                  Visualize e gerencie os assets que você enviou
                </p>
                <Button onClick={() => setShowUploadModal(true)}>
                  <Upload className="h-4 w-4 mr-2" />
                  Fazer upload
                </Button>
              </div>
            </TabsContent>
          </div>
        </div>
      </Tabs>

      {/* Modals */}
      {selectedAssetForPreview && (
        <AssetPreviewModal
          asset={selectedAssetForPreview}
          isOpen={!!selectedAssetForPreview}
          onClose={() => setSelectedAssetForPreview(null)}
          onFavorite={() => toggleFavorite(selectedAssetForPreview.id)}
          onDownload={() => downloadAsset(selectedAssetForPreview.id)}
          isFavorite={isFavorite(selectedAssetForPreview.id)}
        />
      )}
      
      {showUploadModal && (
        <AssetUploadModal
          isOpen={showUploadModal}
          onClose={() => setShowUploadModal(false)}
          onUploadComplete={refresh}
        />
      )}
      
      {showCollectionModal && (
        <CollectionModal
          isOpen={showCollectionModal}
          onClose={() => setShowCollectionModal(false)}
          selectedAssets={selectedAssets}
          onCreateComplete={() => {
            setShowCollectionModal(false);
            clearSelection();
          }}
        />
      )}
    </div>
  );
}