/**
 * Modal para criação e gerenciamento de coleções de assets
 * 
 * Criação de coleções, adição/remoção de assets,
 * compartilhamento e organização
 */

import React, { useState, useEffect } from 'react';
import { X, Plus, Folder, Image, Trash2, Share, Eye, Users } from 'lucide-react';
import { Asset, AssetCollection, useAssets } from '../hooks/useAssets';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Textarea } from './ui/textarea';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from './ui/dialog';
import { Badge } from './ui/badge';
import { Separator } from './ui/separator';
import { Tabs, TabsContent, TabsList, TabsTrigger } from './ui/tabs';
import { Checkbox } from './ui/checkbox';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';

interface CollectionModalProps {
  isOpen: boolean;
  onClose: () => void;
  selectedAssets: Asset[];
  onCreateComplete: () => void;
  existingCollection?: AssetCollection;
}

export function CollectionModal({
  isOpen,
  onClose,
  selectedAssets,
  onCreateComplete,
  existingCollection
}: CollectionModalProps) {
  const { 
    collections,
    createCollection, 
    updateCollection, 
    addToCollection, 
    removeFromCollection 
  } = useAssets();

  // State
  const [activeTab, setActiveTab] = useState<'new' | 'existing'>('new');
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    isPublic: true
  });
  const [selectedCollectionId, setSelectedCollectionId] = useState<string>('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Initialize form with existing collection data
  useEffect(() => {
    if (existingCollection) {
      setFormData({
        name: existingCollection.name,
        description: existingCollection.description,
        isPublic: existingCollection.isPublic
      });
      setActiveTab('new'); // Show edit form
    } else {
      setFormData({
        name: '',
        description: '',
        isPublic: true
      });
    }
  }, [existingCollection, isOpen]);

  // Handle form submission
  const handleSubmit = async () => {
    if (!formData.name.trim()) {
      setError('Nome da coleção é obrigatório');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      if (existingCollection) {
        // Update existing collection
        await updateCollection(existingCollection.id, {
          name: formData.name,
          description: formData.description,
          isPublic: formData.isPublic
        });
      } else {
        // Create new collection
        const assetIds = selectedAssets.map(asset => asset.id);
        await createCollection(
          formData.name,
          formData.description,
          assetIds
        );
      }

      onCreateComplete();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erro ao salvar coleção');
    } finally {
      setLoading(false);
    }
  };

  // Add to existing collection
  const handleAddToExisting = async () => {
    if (!selectedCollectionId) {
      setError('Selecione uma coleção');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const assetIds = selectedAssets.map(asset => asset.id);
      await addToCollection(selectedCollectionId, assetIds);
      onCreateComplete();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erro ao adicionar assets');
    } finally {
      setLoading(false);
    }
  };

  // Close modal and reset state
  const handleClose = () => {
    setFormData({
      name: '',
      description: '',
      isPublic: true
    });
    setSelectedCollectionId('');
    setError(null);
    setActiveTab('new');
    onClose();
  };

  // Get collection preview
  const getCollectionPreview = (collection: AssetCollection) => {
    const previewAssets = collection.assets.slice(0, 4);
    return (
      <div className="grid grid-cols-2 gap-1 w-16 h-16 rounded overflow-hidden">
        {previewAssets.map((asset, index) => (
          <div
            key={asset.id}
            className="bg-muted bg-cover bg-center"
            style={{ backgroundImage: `url(${asset.thumbnailUrl})` }}
          />
        ))}
        {Array.from({ length: 4 - previewAssets.length }).map((_, index) => (
          <div key={`empty-${index}`} className="bg-muted" />
        ))}
      </div>
    );
  };

  const isEditing = !!existingCollection;
  const canSubmit = formData.name.trim() && !loading;

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-hidden">
        <DialogHeader>
          <DialogTitle>
            {isEditing ? 'Editar Coleção' : 'Gerenciar Coleções'}
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-6">
          {/* Selected Assets Preview */}
          {selectedAssets.length > 0 && (
            <div className="space-y-3">
              <h4 className="font-medium flex items-center gap-2">
                <Image className="h-4 w-4" />
                Assets Selecionados ({selectedAssets.length})
              </h4>
              
              <div className="flex flex-wrap gap-2 max-h-32 overflow-y-auto">
                {selectedAssets.map((asset) => (
                  <div
                    key={asset.id}
                    className="flex items-center gap-2 bg-muted rounded-lg p-2"
                  >
                    <div
                      className="w-8 h-8 rounded bg-cover bg-center flex-shrink-0"
                      style={{ backgroundImage: `url(${asset.thumbnailUrl})` }}
                    />
                    <span className="text-sm truncate max-w-32" title={asset.name}>
                      {asset.name}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {error && (
            <div className="p-3 bg-destructive/10 border border-destructive/20 rounded-lg">
              <p className="text-sm text-destructive">{error}</p>
            </div>
          )}

          {!isEditing && (
            <Tabs value={activeTab} onValueChange={setActiveTab as (value: string) => void}>
              <TabsList className="grid w-full grid-cols-2">
                <TabsTrigger value="new">Nova Coleção</TabsTrigger>
                <TabsTrigger value="existing">Coleção Existente</TabsTrigger>
              </TabsList>

              <TabsContent value="new" className="space-y-4 mt-6">
                <div className="space-y-4">
                  <div>
                    <Label htmlFor="collection-name">Nome da Coleção</Label>
                    <Input
                      id="collection-name"
                      value={formData.name}
                      onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                      placeholder="Ex: Campanhas de Verão"
                    />
                  </div>

                  <div>
                    <Label htmlFor="collection-description">Descrição</Label>
                    <Textarea
                      id="collection-description"
                      value={formData.description}
                      onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                      placeholder="Descreva o propósito desta coleção..."
                      rows={3}
                    />
                  </div>

                  <div className="flex items-center space-x-2">
                    <Checkbox
                      id="collection-public"
                      checked={formData.isPublic}
                      onCheckedChange={(checked) => 
                        setFormData(prev => ({ ...prev, isPublic: checked as boolean }))
                      }
                    />
                    <Label htmlFor="collection-public" className="text-sm">
                      Coleção pública (visível para outros usuários)
                    </Label>
                  </div>
                </div>
              </TabsContent>

              <TabsContent value="existing" className="space-y-4 mt-6">
                <div className="space-y-4">
                  <div>
                    <Label htmlFor="existing-collection">Selecionar Coleção</Label>
                    <Select
                      value={selectedCollectionId}
                      onValueChange={setSelectedCollectionId}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Escolha uma coleção existente" />
                      </SelectTrigger>
                      <SelectContent>
                        {collections.map((collection) => (
                          <SelectItem key={collection.id} value={collection.id}>
                            <div className="flex items-center gap-3">
                              <Folder className="h-4 w-4" />
                              <div>
                                <div className="font-medium">{collection.name}</div>
                                <div className="text-xs text-muted-foreground">
                                  {collection.assets.length} assets
                                </div>
                              </div>
                            </div>
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  {/* Collections Grid */}
                  {collections.length > 0 && (
                    <div className="space-y-3">
                      <h5 className="font-medium">Suas Coleções</h5>
                      <div className="grid grid-cols-1 gap-3 max-h-48 overflow-y-auto">
                        {collections.map((collection) => (
                          <div
                            key={collection.id}
                            className={`border rounded-lg p-3 cursor-pointer transition-colors ${
                              selectedCollectionId === collection.id
                                ? 'border-primary bg-primary/5'
                                : 'border-muted hover:border-muted-foreground/50'
                            }`}
                            onClick={() => setSelectedCollectionId(collection.id)}
                          >
                            <div className="flex items-center gap-3">
                              {getCollectionPreview(collection)}
                              
                              <div className="flex-1 min-w-0">
                                <h4 className="font-medium truncate">{collection.name}</h4>
                                <p className="text-sm text-muted-foreground truncate">
                                  {collection.description}
                                </p>
                                
                                <div className="flex items-center gap-2 mt-1">
                                  <Badge variant="outline" className="text-xs">
                                    {collection.assets.length} assets
                                  </Badge>
                                  
                                  {collection.isPublic ? (
                                    <Badge variant="secondary" className="text-xs">
                                      <Users className="h-3 w-3 mr-1" />
                                      Pública
                                    </Badge>
                                  ) : (
                                    <Badge variant="outline" className="text-xs">
                                      Privada
                                    </Badge>
                                  )}
                                </div>
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {collections.length === 0 && (
                    <div className="text-center py-8 text-muted-foreground">
                      <Folder className="h-12 w-12 mx-auto mb-3" />
                      <p>Nenhuma coleção encontrada</p>
                      <p className="text-sm">Crie sua primeira coleção na aba "Nova Coleção"</p>
                    </div>
                  )}
                </div>
              </TabsContent>
            </Tabs>
          )}

          {/* Edit existing collection form */}
          {isEditing && (
            <div className="space-y-4">
              <div>
                <Label htmlFor="edit-name">Nome da Coleção</Label>
                <Input
                  id="edit-name"
                  value={formData.name}
                  onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                  placeholder="Nome da coleção"
                />
              </div>

              <div>
                <Label htmlFor="edit-description">Descrição</Label>
                <Textarea
                  id="edit-description"
                  value={formData.description}
                  onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                  placeholder="Descrição da coleção..."
                  rows={3}
                />
              </div>

              <div className="flex items-center space-x-2">
                <Checkbox
                  id="edit-public"
                  checked={formData.isPublic}
                  onCheckedChange={(checked) => 
                    setFormData(prev => ({ ...prev, isPublic: checked as boolean }))
                  }
                />
                <Label htmlFor="edit-public" className="text-sm">
                  Coleção pública (visível para outros usuários)
                </Label>
              </div>

              {/* Current assets in collection */}
              {existingCollection && existingCollection.assets.length > 0 && (
                <div className="space-y-3">
                  <h5 className="font-medium">Assets na Coleção ({existingCollection.assets.length})</h5>
                  <div className="grid grid-cols-4 gap-2 max-h-32 overflow-y-auto">
                    {existingCollection.assets.map((asset) => (
                      <div
                        key={asset.id}
                        className="aspect-square rounded bg-muted bg-cover bg-center"
                        style={{ backgroundImage: `url(${asset.thumbnailUrl})` }}
                        title={asset.name}
                      />
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between pt-6 border-t">
          <div className="text-sm text-muted-foreground">
            {isEditing ? 'Editando coleção existente' : 
             activeTab === 'new' ? 'Criar nova coleção' : 'Adicionar à coleção existente'
            }
          </div>
          
          <div className="flex gap-2">
            <Button variant="outline" onClick={handleClose} disabled={loading}>
              Cancelar
            </Button>
            
            {activeTab === 'new' || isEditing ? (
              <Button 
                onClick={handleSubmit} 
                disabled={!canSubmit}
              >
                {loading ? 'Salvando...' : isEditing ? 'Salvar' : 'Criar Coleção'}
              </Button>
            ) : (
              <Button 
                onClick={handleAddToExisting} 
                disabled={!selectedCollectionId || loading}
              >
                {loading ? 'Adicionando...' : 'Adicionar'}
              </Button>
            )}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}