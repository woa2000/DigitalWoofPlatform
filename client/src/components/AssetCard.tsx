/**
 * Componente de card para exibir asset individual
 * 
 * Suporte para grid e list view, com ações de seleção,
 * favoritar, preview e download
 */

import React from 'react';
import { Heart, Download, Eye, MoreVertical, Check, FileText, Image, Video, Music } from 'lucide-react';
import { Asset } from '../hooks/useAssets';
import { Button } from './ui/button';
import { Badge } from './ui/badge';
import { Checkbox } from './ui/checkbox';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from './ui/dropdown-menu';
import { formatBytes, formatDistanceToNow } from '../lib/utils';
import { useInView } from 'react-intersection-observer';

interface AssetCardProps {
  asset: Asset;
  viewMode: 'grid' | 'list';
  isSelected: boolean;
  isFavorite: boolean;
  onSelect: (selected: boolean) => void;
  onFavorite: () => void;
  onPreview: () => void;
  onDownload: () => void;
}

export function AssetCard({
  asset,
  viewMode,
  isSelected,
  isFavorite,
  onSelect,
  onFavorite,
  onPreview,
  onDownload
}: AssetCardProps) {
  const { ref, inView } = useInView({
    triggerOnce: true,
    rootMargin: '200px 0px',
  });

  // Get icon based on asset type
  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'image':
        return <Image className="h-4 w-4" />;
      case 'video':
        return <Video className="h-4 w-4" />;
      case 'icon':
        return <FileText className="h-4 w-4" />;
      default:
        return <FileText className="h-4 w-4" />;
    }
  };

  // Format file size
  const fileSize = formatBytes(asset.fileSize);

  // Format creation date
  const createdDate = formatDistanceToNow(new Date(asset.createdAt), { addSuffix: true });

  if (viewMode === 'list') {
    return (
      <div ref={ref} className={`border rounded-lg p-4 hover:shadow-md transition-all ${
        isSelected ? 'ring-2 ring-primary' : ''
      }`}>
        <div className="flex items-center gap-4">
          {/* Selection checkbox */}
          <Checkbox
            checked={isSelected}
            onCheckedChange={onSelect}
            className="flex-shrink-0"
          />
          
          {/* Thumbnail */}
          <div className="w-16 h-16 rounded-lg bg-muted bg-cover bg-center flex-shrink-0 relative overflow-hidden">
            {inView && (
              <img
                src={asset.thumbnailUrl}
                alt={asset.name}
                className="w-full h-full object-cover"
              />
            )}
            <div className="absolute inset-0 bg-black/0 hover:bg-black/10 transition-colors cursor-pointer"
                 onClick={onPreview} />
          </div>
          
          {/* Content */}
          <div className="flex-1 min-w-0">
            <div className="flex items-start justify-between">
              <div className="min-w-0 flex-1">
                <h3 className="font-medium truncate">{asset.name}</h3>
                <p className="text-sm text-muted-foreground truncate">
                  {asset.description}
                </p>
                
                <div className="flex items-center gap-2 mt-2">
                  <Badge variant="secondary" className="text-xs">
                    {getTypeIcon(asset.type)}
                    <span className="ml-1 capitalize">{asset.type}</span>
                  </Badge>
                  
                  <Badge variant="outline" className="text-xs">
                    {asset.format.toUpperCase()}
                  </Badge>
                  
                  <span className="text-xs text-muted-foreground">
                    {asset.dimensions.width} × {asset.dimensions.height}
                  </span>
                  
                  <span className="text-xs text-muted-foreground">
                    {fileSize}
                  </span>
                  
                  {asset.isPremium && (
                    <Badge variant="destructive" className="text-xs">
                      Premium
                    </Badge>
                  )}
                </div>
                
                <div className="flex items-center gap-4 mt-2 text-xs text-muted-foreground">
                  <span>Criado {createdDate}</span>
                  <span>{asset.usageCount} usos</span>
                  <span>{asset.downloadCount} downloads</span>
                  {asset.rating > 0 && (
                    <span>★ {asset.rating.toFixed(1)}</span>
                  )}
                </div>
              </div>
              
              {/* Actions */}
              <div className="flex items-center gap-1 flex-shrink-0 ml-4">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={onFavorite}
                  className={isFavorite ? 'text-red-500 hover:text-red-600' : ''}
                >
                  <Heart className={`h-4 w-4 ${isFavorite ? 'fill-current' : ''}`} />
                </Button>
                
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={onPreview}
                >
                  <Eye className="h-4 w-4" />
                </Button>
                
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={onDownload}
                >
                  <Download className="h-4 w-4" />
                </Button>
                
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" size="sm">
                      <MoreVertical className="h-4 w-4" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    <DropdownMenuItem onClick={onPreview}>
                      <Eye className="h-4 w-4 mr-2" />
                      Visualizar
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={onDownload}>
                      <Download className="h-4 w-4 mr-2" />
                      Download
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={onFavorite}>
                      <Heart className="h-4 w-4 mr-2" />
                      {isFavorite ? 'Remover dos favoritos' : 'Adicionar aos favoritos'}
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Grid view
  return (
    <div ref={ref} className={`group relative border rounded-lg overflow-hidden hover:shadow-lg transition-all ${
      isSelected ? 'ring-2 ring-primary' : ''
    }`}>
      {/* Selection checkbox */}
      <div className="absolute top-2 left-2 z-10 opacity-0 group-hover:opacity-100 transition-opacity">
        <Checkbox
          checked={isSelected}
          onCheckedChange={onSelect}
          className="bg-white/90 backdrop-blur-sm"
        />
      </div>
      
      {/* Selected indicator */}
      {isSelected && (
        <div className="absolute top-2 right-2 z-10">
          <div className="w-6 h-6 bg-primary rounded-full flex items-center justify-center">
            <Check className="h-4 w-4 text-primary-foreground" />
          </div>
        </div>
      )}
      
      {/* Thumbnail */}
      <div className="aspect-square bg-muted bg-cover bg-center relative overflow-hidden">
        {inView && (
          <img
            src={asset.thumbnailUrl}
            alt={asset.name}
            className="w-full h-full object-cover"
          />
        )}
        
        {/* Overlay with actions */}
        <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-colors">
          <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
            <Button
              variant="secondary"
              size="sm"
              onClick={onPreview}
              className="bg-white/90 backdrop-blur-sm hover:bg-white"
            >
              <Eye className="h-4 w-4" />
            </Button>
            
            <Button
              variant="secondary"
              size="sm"
              onClick={onDownload}
              className="bg-white/90 backdrop-blur-sm hover:bg-white"
            >
              <Download className="h-4 w-4" />
            </Button>
          </div>
        </div>
        
        {/* Type badge */}
        <div className="absolute bottom-2 left-2">
          <Badge variant="secondary" className="text-xs bg-black/60 text-white">
            {asset.format.toUpperCase()}
          </Badge>
        </div>
        
        {/* Premium badge */}
        {asset.isPremium && (
          <div className="absolute top-2 left-2">
            <Badge variant="destructive" className="text-xs">
              Premium
            </Badge>
          </div>
        )}
        
        {/* Favorite button */}
        <div className="absolute bottom-2 right-2">
          <Button
            variant="ghost"
            size="sm"
            onClick={onFavorite}
            className={`bg-black/60 hover:bg-black/80 ${
              isFavorite ? 'text-red-400 hover:text-red-300' : 'text-white hover:text-white'
            }`}
          >
            <Heart className={`h-4 w-4 ${isFavorite ? 'fill-current' : ''}`} />
          </Button>
        </div>
      </div>
      
      {/* Content */}
      <div className="p-3">
        <h3 className="font-medium text-sm truncate" title={asset.name}>
          {asset.name}
        </h3>
        
        <div className="flex items-center gap-1 mt-1">
          <Badge variant="outline" className="text-xs">
            {getTypeIcon(asset.type)}
            <span className="ml-1 capitalize">{asset.type}</span>
          </Badge>
        </div>
        
        <div className="flex items-center justify-between mt-2 text-xs text-muted-foreground">
          <span>{asset.dimensions.width} × {asset.dimensions.height}</span>
          <span>{fileSize}</span>
        </div>
        
        <div className="flex items-center justify-between mt-1 text-xs text-muted-foreground">
          <span>{asset.usageCount} usos</span>
          {asset.rating > 0 && (
            <span>★ {asset.rating.toFixed(1)}</span>
          )}
        </div>
      </div>
    </div>
  );
}