/**
 * Modal de preview detalhado de asset
 * 
 * Visualização ampliada com informações técnicas,
 * metadados, ações e assets similares
 */

import React, { useState, useEffect } from 'react';
import { X, Heart, Download, Share, Edit, Trash2, Copy, ExternalLink, Info, Tag, Calendar, User, Eye } from 'lucide-react';
import { Asset } from '../hooks/useAssets';
import { useAssets } from '../hooks/useAssets';
import { Button } from './ui/button';
import { Badge } from './ui/badge';
import { Separator } from './ui/separator';
import { Tabs, TabsContent, TabsList, TabsTrigger } from './ui/tabs';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from './ui/dialog';
import { formatBytes, formatDistanceToNow } from '../lib/utils';
import { AssetCard } from './AssetCard';

interface AssetPreviewModalProps {
  asset: Asset;
  isOpen: boolean;
  onClose: () => void;
  onFavorite: () => void;
  onDownload: () => void;
  isFavorite: boolean;
}

export function AssetPreviewModal({
  asset,
  isOpen,
  onClose,
  onFavorite,
  onDownload,
  isFavorite
}: AssetPreviewModalProps) {
  const { getSimilarAssets, getAssetAnalytics } = useAssets();
  const [similarAssets, setSimilarAssets] = useState<Asset[]>([]);
  const [analytics, setAnalytics] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [copied, setCopied] = useState(false);

  // Load similar assets and analytics
  useEffect(() => {
    if (isOpen && asset) {
      loadSimilarAssets();
      loadAnalytics();
    }
  }, [isOpen, asset.id]);

  const loadSimilarAssets = async () => {
    try {
      setLoading(true);
      const similar = await getSimilarAssets(asset.id);
      setSimilarAssets(similar);
    } catch (error) {
      console.error('Error loading similar assets:', error);
    } finally {
      setLoading(false);
    }
  };

  const loadAnalytics = async () => {
    try {
      const data = await getAssetAnalytics(asset.id);
      setAnalytics(data);
    } catch (error) {
      console.error('Error loading analytics:', error);
    }
  };

  // Copy asset URL
  const copyUrl = async () => {
    try {
      await navigator.clipboard.writeText(asset.url);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (error) {
      console.error('Error copying URL:', error);
    }
  };

  // Share asset
  const shareAsset = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: asset.name,
          text: asset.description,
          url: asset.url
        });
      } catch (error) {
        console.error('Error sharing:', error);
      }
    } else {
      // Fallback to copy URL
      copyUrl();
    }
  };

  // Format file size
  const fileSize = formatBytes(asset.fileSize);
  const createdDate = formatDistanceToNow(new Date(asset.createdAt), { addSuffix: true });

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-6xl max-h-[90vh] overflow-hidden p-0">
        <div className="grid grid-cols-12 h-full">
          {/* Preview Area */}
          <div className="col-span-7 bg-muted/30 relative flex items-center justify-center p-6">
            {asset.type === 'video' ? (
              <video
                src={asset.url}
                controls
                className="max-w-full max-h-full rounded-lg shadow-lg"
                poster={asset.thumbnailUrl}
              />
            ) : (
              <img
                src={asset.previewUrl || asset.url}
                alt={asset.name}
                className="max-w-full max-h-full rounded-lg shadow-lg object-contain"
              />
            )}
            
            {/* Overlay Actions */}
            <div className="absolute top-4 right-4 flex gap-2">
              <Button
                variant="secondary"
                size="sm"
                onClick={onFavorite}
                className={`bg-white/90 backdrop-blur-sm ${
                  isFavorite ? 'text-red-500 hover:text-red-600' : ''
                }`}
              >
                <Heart className={`h-4 w-4 ${isFavorite ? 'fill-current' : ''}`} />
              </Button>
              
              <Button
                variant="secondary"
                size="sm"
                onClick={shareAsset}
                className="bg-white/90 backdrop-blur-sm"
              >
                <Share className="h-4 w-4" />
              </Button>
              
              <Button
                variant="secondary"
                size="sm"
                onClick={copyUrl}
                className="bg-white/90 backdrop-blur-sm"
              >
                {copied ? (
                  <span className="text-green-600">✓</span>
                ) : (
                  <Copy className="h-4 w-4" />
                )}
              </Button>
            </div>
          </div>

          {/* Details Sidebar */}
          <div className="col-span-5 flex flex-col">
            {/* Header */}
            <DialogHeader className="p-6 pb-4">
              <div className="flex items-start justify-between">
                <div className="flex-1 min-w-0">
                  <DialogTitle className="text-lg font-semibold truncate">
                    {asset.name}
                  </DialogTitle>
                  <p className="text-sm text-muted-foreground mt-1">
                    {asset.description}
                  </p>
                </div>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={onClose}
                  className="flex-shrink-0 ml-2"
                >
                  <X className="h-4 w-4" />
                </Button>
              </div>
              
              {/* Quick Actions */}
              <div className="flex gap-2 mt-4">
                <Button onClick={onDownload} className="flex-1">
                  <Download className="h-4 w-4 mr-2" />
                  Download
                </Button>
                
                <Button variant="outline" onClick={onFavorite}>
                  <Heart className={`h-4 w-4 ${isFavorite ? 'fill-current text-red-500' : ''}`} />
                </Button>
              </div>
            </DialogHeader>

            <Separator />

            {/* Content Tabs */}
            <div className="flex-1 overflow-hidden">
              <Tabs defaultValue="details" className="h-full flex flex-col">
                <TabsList className="grid w-full grid-cols-3 mx-6 mt-4">
                  <TabsTrigger value="details">Detalhes</TabsTrigger>
                  <TabsTrigger value="analytics">Analytics</TabsTrigger>
                  <TabsTrigger value="similar">Similares</TabsTrigger>
                </TabsList>

                <div className="flex-1 overflow-y-auto p-6 pt-4">
                  <TabsContent value="details" className="mt-0 space-y-4">
                    {/* Technical Info */}
                    <div className="space-y-3">
                      <h4 className="font-medium flex items-center gap-2">
                        <Info className="h-4 w-4" />
                        Informações Técnicas
                      </h4>
                      
                      <div className="grid grid-cols-2 gap-3 text-sm">
                        <div>
                          <span className="text-muted-foreground">Tipo:</span>
                          <p className="font-medium capitalize">{asset.type}</p>
                        </div>
                        
                        <div>
                          <span className="text-muted-foreground">Formato:</span>
                          <p className="font-medium uppercase">{asset.format}</p>
                        </div>
                        
                        <div>
                          <span className="text-muted-foreground">Dimensões:</span>
                          <p className="font-medium">
                            {asset.dimensions.width} × {asset.dimensions.height}px
                          </p>
                        </div>
                        
                        <div>
                          <span className="text-muted-foreground">Tamanho:</span>
                          <p className="font-medium">{fileSize}</p>
                        </div>
                      </div>
                    </div>

                    <Separator />

                    {/* Category and Tags */}
                    <div className="space-y-3">
                      <h4 className="font-medium flex items-center gap-2">
                        <Tag className="h-4 w-4" />
                        Categoria e Tags
                      </h4>
                      
                      <div className="space-y-2">
                        <div>
                          <span className="text-sm text-muted-foreground">Categoria:</span>
                          <Badge variant="secondary" className="ml-2 capitalize">
                            {asset.category}
                          </Badge>
                        </div>
                        
                        {asset.tags.length > 0 && (
                          <div>
                            <span className="text-sm text-muted-foreground">Tags:</span>
                            <div className="flex flex-wrap gap-1 mt-1">
                              {asset.tags.map((tag) => (
                                <Badge key={tag} variant="outline" className="text-xs">
                                  {tag}
                                </Badge>
                              ))}
                            </div>
                          </div>
                        )}
                      </div>
                    </div>

                    <Separator />

                    {/* Colors */}
                    {asset.colors.length > 0 && (
                      <>
                        <div className="space-y-3">
                          <h4 className="font-medium">Cores Dominantes</h4>
                          <div className="flex gap-2">
                            {asset.colors.map((color, index) => (
                              <div
                                key={index}
                                className="w-8 h-8 rounded border border-muted"
                                style={{ backgroundColor: color }}
                                title={color}
                              />
                            ))}
                          </div>
                        </div>
                        <Separator />
                      </>
                    )}

                    {/* Metadata */}
                    <div className="space-y-3">
                      <h4 className="font-medium flex items-center gap-2">
                        <Calendar className="h-4 w-4" />
                        Metadados
                      </h4>
                      
                      <div className="space-y-2 text-sm">
                        <div className="flex justify-between">
                          <span className="text-muted-foreground">Criado por:</span>
                          <span className="font-medium">{asset.createdBy}</span>
                        </div>
                        
                        <div className="flex justify-between">
                          <span className="text-muted-foreground">Criado:</span>
                          <span>{createdDate}</span>
                        </div>
                        
                        <div className="flex justify-between">
                          <span className="text-muted-foreground">Público:</span>
                          <Badge variant={asset.isPublic ? "default" : "secondary"}>
                            {asset.isPublic ? 'Sim' : 'Não'}
                          </Badge>
                        </div>
                        
                        {asset.isPremium && (
                          <div className="flex justify-between">
                            <span className="text-muted-foreground">Premium:</span>
                            <Badge variant="destructive">Premium</Badge>
                          </div>
                        )}
                      </div>
                    </div>

                    {/* License and Attribution */}
                    {asset.metadata && (
                      <>
                        <Separator />
                        <div className="space-y-3">
                          <h4 className="font-medium">Licença e Atribuição</h4>
                          
                          {asset.metadata.license && (
                            <div>
                              <span className="text-sm text-muted-foreground">Licença:</span>
                              <p className="text-sm font-medium">{asset.metadata.license}</p>
                            </div>
                          )}
                          
                          {asset.metadata.attribution && (
                            <div>
                              <span className="text-sm text-muted-foreground">Atribuição:</span>
                              <p className="text-sm">{asset.metadata.attribution}</p>
                            </div>
                          )}
                        </div>
                      </>
                    )}
                  </TabsContent>

                  <TabsContent value="analytics" className="mt-0 space-y-4">
                    <div className="space-y-4">
                      <h4 className="font-medium flex items-center gap-2">
                        <Eye className="h-4 w-4" />
                        Estatísticas de Uso
                      </h4>
                      
                      <div className="grid grid-cols-2 gap-4">
                        <div className="text-center p-3 bg-muted/50 rounded-lg">
                          <div className="text-2xl font-bold">{asset.usageCount}</div>
                          <div className="text-sm text-muted-foreground">Usos</div>
                        </div>
                        
                        <div className="text-center p-3 bg-muted/50 rounded-lg">
                          <div className="text-2xl font-bold">{asset.downloadCount}</div>
                          <div className="text-sm text-muted-foreground">Downloads</div>
                        </div>
                        
                        <div className="text-center p-3 bg-muted/50 rounded-lg">
                          <div className="text-2xl font-bold">
                            {asset.rating > 0 ? asset.rating.toFixed(1) : 'N/A'}
                          </div>
                          <div className="text-sm text-muted-foreground">Avaliação</div>
                        </div>
                        
                        <div className="text-center p-3 bg-muted/50 rounded-lg">
                          <div className="text-2xl font-bold">
                            {analytics?.views || 0}
                          </div>
                          <div className="text-sm text-muted-foreground">Visualizações</div>
                        </div>
                      </div>
                      
                      {analytics && (
                        <div className="space-y-2">
                          <h5 className="font-medium">Tendências</h5>
                          <div className="text-sm text-muted-foreground">
                            {analytics.trend || 'Dados insuficientes para análise de tendência'}
                          </div>
                        </div>
                      )}
                    </div>
                  </TabsContent>

                  <TabsContent value="similar" className="mt-0 space-y-4">
                    <div className="space-y-4">
                      <h4 className="font-medium">Assets Similares</h4>
                      
                      {loading ? (
                        <div className="text-center py-4 text-muted-foreground">
                          Carregando assets similares...
                        </div>
                      ) : similarAssets.length > 0 ? (
                        <div className="grid grid-cols-2 gap-3">
                          {similarAssets.slice(0, 6).map((similarAsset) => (
                            <div
                              key={similarAsset.id}
                              className="aspect-square rounded-lg bg-muted bg-cover bg-center cursor-pointer hover:shadow-md transition-shadow"
                              style={{ backgroundImage: `url(${similarAsset.thumbnailUrl})` }}
                              onClick={onClose} // Close modal before navigating to similar asset
                              title={similarAsset.name}
                            />
                          ))}
                        </div>
                      ) : (
                        <div className="text-center py-4 text-muted-foreground">
                          Nenhum asset similar encontrado
                        </div>
                      )}
                    </div>
                  </TabsContent>
                </div>
              </Tabs>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}