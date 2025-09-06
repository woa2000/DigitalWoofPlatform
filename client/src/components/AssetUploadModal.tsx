/**
 * Modal para upload de novos assets
 * 
 * Upload com drag & drop, preview, metadados
 * e validação de arquivos
 */

import React, { useState, useCallback } from 'react';
import { Upload, X, Image, Video, FileText, AlertCircle, Check } from 'lucide-react';
import { useAssets, Asset } from '../hooks/useAssets';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Textarea } from './ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from './ui/dialog';
import { Progress } from './ui/progress';
import { Badge } from './ui/badge';
import { Separator } from './ui/separator';
import { formatBytes } from '../lib/utils';

interface AssetUploadModalProps {
  isOpen: boolean;
  onClose: () => void;
  onUploadComplete: () => void;
}

interface FileWithPreview {
  file: File;
  preview: string;
  id: string;
}

interface UploadProgress {
  [fileId: string]: {
    progress: number;
    status: 'uploading' | 'completed' | 'error';
    error?: string;
  };
}

export function AssetUploadModal({
  isOpen,
  onClose,
  onUploadComplete
}: AssetUploadModalProps) {
  const { uploadAsset } = useAssets();
  
  // State
  const [files, setFiles] = useState<FileWithPreview[]>([]);
  const [uploading, setUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState<UploadProgress>({});
  const [dragActive, setDragActive] = useState(false);
  
  // Form data for current file
  const [selectedFileId, setSelectedFileId] = useState<string | null>(null);
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    category: '',
    tags: '',
    isPublic: true,
    isPremium: false
  });

  // Accepted file types
  const acceptedTypes = {
    'image/jpeg': ['.jpg', '.jpeg'],
    'image/png': ['.png'],
    'image/svg+xml': ['.svg'],
    'image/gif': ['.gif'],
    'video/mp4': ['.mp4'],
    'video/webm': ['.webm']
  };

  const maxFileSize = 50 * 1024 * 1024; // 50MB

  // Handle drag events
  const handleDrag = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setDragActive(true);
    } else if (e.type === 'dragleave') {
      setDragActive(false);
    }
  }, []);

  // Handle drop
  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);

    const droppedFiles = Array.from(e.dataTransfer.files);
    handleFiles(droppedFiles);
  }, []);

  // Handle file input
  const handleFileInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFiles = Array.from(e.target.files || []);
    handleFiles(selectedFiles);
  };

  // Process files
  const handleFiles = (fileList: File[]) => {
    const validFiles = fileList.filter(file => {
      const isValidType = Object.keys(acceptedTypes).includes(file.type);
      const isValidSize = file.size <= maxFileSize;
      return isValidType && isValidSize;
    });

    const newFiles: FileWithPreview[] = validFiles.map(file => ({
      file,
      preview: URL.createObjectURL(file),
      id: `${Date.now()}-${Math.random()}`
    }));

    setFiles(prev => [...prev, ...newFiles]);
    
    // Select first file if none selected
    if (!selectedFileId && newFiles.length > 0) {
      setSelectedFileId(newFiles[0].id);
      setFormData(prev => ({
        ...prev,
        name: newFiles[0].file.name.split('.')[0]
      }));
    }
  };

  // Remove file
  const removeFile = (fileId: string) => {
    setFiles(prev => {
      const updated = prev.filter(f => f.id !== fileId);
      const fileToRemove = prev.find(f => f.id === fileId);
      
      if (fileToRemove) {
        URL.revokeObjectURL(fileToRemove.preview);
      }
      
      // Update selected file if removed
      if (selectedFileId === fileId) {
        setSelectedFileId(updated.length > 0 ? updated[0].id : null);
        if (updated.length > 0) {
          setFormData(prev => ({
            ...prev,
            name: updated[0].file.name.split('.')[0]
          }));
        }
      }
      
      return updated;
    });
  };

  // Select file for editing
  const selectFile = (fileId: string) => {
    setSelectedFileId(fileId);
    const selectedFile = files.find(f => f.id === fileId);
    if (selectedFile) {
      setFormData(prev => ({
        ...prev,
        name: selectedFile.file.name.split('.')[0]
      }));
    }
  };

  // Get file type icon
  const getFileIcon = (file: File) => {
    if (file.type.startsWith('image/')) return <Image className="h-4 w-4" />;
    if (file.type.startsWith('video/')) return <Video className="h-4 w-4" />;
    return <FileText className="h-4 w-4" />;
  };

  // Get file type
  const getFileType = (file: File): Asset['type'] => {
    if (file.type.startsWith('image/')) {
      if (file.type === 'image/svg+xml') return 'icon';
      return 'image';
    }
    if (file.type.startsWith('video/')) return 'video';
    return 'template';
  };

  // Upload files
  const handleUpload = async () => {
    if (files.length === 0) return;

    setUploading(true);
    const results: Asset[] = [];

    for (const fileWithPreview of files) {
      const fileId = fileWithPreview.id;
      
      try {
        setUploadProgress(prev => ({
          ...prev,
          [fileId]: { progress: 0, status: 'uploading' }
        }));

        // Create metadata
        const metadata: Partial<Asset> = {
          name: fileId === selectedFileId ? formData.name : fileWithPreview.file.name.split('.')[0],
          description: fileId === selectedFileId ? formData.description : '',
          type: getFileType(fileWithPreview.file),
          category: fileId === selectedFileId ? formData.category : 'general',
          tags: fileId === selectedFileId ? formData.tags.split(',').map(tag => tag.trim()).filter(Boolean) : [],
          isPublic: fileId === selectedFileId ? formData.isPublic : true,
          isPremium: fileId === selectedFileId ? formData.isPremium : false
        };

        // Simulate upload progress
        const progressInterval = setInterval(() => {
          setUploadProgress(prev => ({
            ...prev,
            [fileId]: {
              ...prev[fileId],
              progress: Math.min(prev[fileId]?.progress + 10, 90)
            }
          }));
        }, 200);

        const uploadedAsset = await uploadAsset(fileWithPreview.file, metadata);
        
        clearInterval(progressInterval);
        
        setUploadProgress(prev => ({
          ...prev,
          [fileId]: { progress: 100, status: 'completed' }
        }));
        
        results.push(uploadedAsset);

      } catch (error) {
        setUploadProgress(prev => ({
          ...prev,
          [fileId]: {
            progress: 0,
            status: 'error',
            error: error instanceof Error ? error.message : 'Erro no upload'
          }
        }));
      }
    }

    setUploading(false);
    
    if (results.length > 0) {
      onUploadComplete();
      handleClose();
    }
  };

  // Close modal
  const handleClose = () => {
    // Cleanup object URLs
    files.forEach(file => URL.revokeObjectURL(file.preview));
    setFiles([]);
    setUploadProgress({});
    setSelectedFileId(null);
    setFormData({
      name: '',
      description: '',
      category: '',
      tags: '',
      isPublic: true,
      isPremium: false
    });
    onClose();
  };

  const selectedFile = files.find(f => f.id === selectedFileId);
  const canUpload = files.length > 0 && !uploading;

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-hidden p-0">
        <DialogHeader className="p-6 pb-4">
          <DialogTitle>Upload de Assets</DialogTitle>
        </DialogHeader>

        <div className="grid grid-cols-12 gap-6 p-6 pt-0 h-[600px]">
          {/* Upload Area */}
          <div className="col-span-5 space-y-4">
            {/* Drag & Drop Area */}
            <div
              className={`border-2 border-dashed rounded-lg p-8 text-center transition-colors ${
                dragActive 
                  ? 'border-primary bg-primary/10' 
                  : 'border-muted-foreground/25 hover:border-muted-foreground/50'
              }`}
              onDragEnter={handleDrag}
              onDragLeave={handleDrag}
              onDragOver={handleDrag}
              onDrop={handleDrop}
            >
              <Upload className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
              <h3 className="text-lg font-medium mb-2">
                Arraste arquivos aqui
              </h3>
              <p className="text-muted-foreground mb-4">
                ou clique para selecionar
              </p>
              
              <input
                type="file"
                multiple
                accept={Object.keys(acceptedTypes).join(',')}
                onChange={handleFileInput}
                className="hidden"
                id="file-upload"
              />
              
              <Label
                htmlFor="file-upload"
                className="cursor-pointer inline-flex items-center justify-center rounded-md text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:opacity-50 disabled:pointer-events-none ring-offset-background bg-primary text-primary-foreground hover:bg-primary/90 h-10 px-4 py-2"
              >
                Selecionar Arquivos
              </Label>
              
              <div className="mt-4 text-xs text-muted-foreground">
                <p>Formatos suportados: JPG, PNG, SVG, GIF, MP4, WebM</p>
                <p>Tamanho máximo: {formatBytes(maxFileSize)}</p>
              </div>
            </div>

            {/* Files List */}
            {files.length > 0 && (
              <div className="space-y-2 max-h-64 overflow-y-auto">
                <h4 className="font-medium">Arquivos Selecionados</h4>
                {files.map((fileWithPreview) => {
                  const progress = uploadProgress[fileWithPreview.id];
                  return (
                    <div
                      key={fileWithPreview.id}
                      className={`border rounded-lg p-3 cursor-pointer transition-colors ${
                        selectedFileId === fileWithPreview.id 
                          ? 'border-primary bg-primary/5' 
                          : 'border-muted hover:border-muted-foreground/50'
                      }`}
                      onClick={() => selectFile(fileWithPreview.id)}
                    >
                      <div className="flex items-center gap-3">
                        <div className="w-12 h-12 rounded bg-muted bg-cover bg-center flex-shrink-0">
                          {fileWithPreview.file.type.startsWith('image/') ? (
                            <img
                              src={fileWithPreview.preview}
                              alt=""
                              className="w-full h-full object-cover rounded"
                            />
                          ) : (
                            <div className="w-full h-full flex items-center justify-center">
                              {getFileIcon(fileWithPreview.file)}
                            </div>
                          )}
                        </div>
                        
                        <div className="flex-1 min-w-0">
                          <p className="font-medium truncate">
                            {fileWithPreview.file.name}
                          </p>
                          <p className="text-sm text-muted-foreground">
                            {formatBytes(fileWithPreview.file.size)}
                          </p>
                          
                          {progress && (
                            <div className="mt-1">
                              <Progress value={progress.progress} className="h-1" />
                              {progress.status === 'error' && (
                                <p className="text-xs text-destructive mt-1">
                                  {progress.error}
                                </p>
                              )}
                            </div>
                          )}
                        </div>
                        
                        <div className="flex items-center gap-1">
                          {progress?.status === 'completed' && (
                            <Check className="h-4 w-4 text-green-600" />
                          )}
                          {progress?.status === 'error' && (
                            <AlertCircle className="h-4 w-4 text-destructive" />
                          )}
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={(e) => {
                              e.stopPropagation();
                              removeFile(fileWithPreview.id);
                            }}
                            disabled={uploading}
                          >
                            <X className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          {/* Metadata Form */}
          <div className="col-span-7 space-y-4">
            {selectedFile ? (
              <>
                <div className="space-y-4">
                  <h4 className="font-medium">
                    Detalhes do Asset: {selectedFile.file.name}
                  </h4>
                  
                  {/* Preview */}
                  <div className="w-full h-48 rounded-lg bg-muted bg-cover bg-center">
                    {selectedFile.file.type.startsWith('image/') ? (
                      <img
                        src={selectedFile.preview}
                        alt=""
                        className="w-full h-full object-contain rounded-lg"
                      />
                    ) : selectedFile.file.type.startsWith('video/') ? (
                      <video
                        src={selectedFile.preview}
                        controls
                        className="w-full h-full rounded-lg"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center">
                        {getFileIcon(selectedFile.file)}
                        <span className="ml-2">{selectedFile.file.name}</span>
                      </div>
                    )}
                  </div>

                  <Separator />

                  {/* Form Fields */}
                  <div className="space-y-4">
                    <div>
                      <Label htmlFor="name">Nome do Asset</Label>
                      <Input
                        id="name"
                        value={formData.name}
                        onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                        placeholder="Nome descritivo do asset"
                      />
                    </div>

                    <div>
                      <Label htmlFor="description">Descrição</Label>
                      <Textarea
                        id="description"
                        value={formData.description}
                        onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                        placeholder="Descreva o asset e seu uso..."
                        rows={3}
                      />
                    </div>

                    <div>
                      <Label htmlFor="category">Categoria</Label>
                      <Select
                        value={formData.category}
                        onValueChange={(value) => setFormData(prev => ({ ...prev, category: value }))}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Selecione uma categoria" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="pets">Pets</SelectItem>
                          <SelectItem value="medical">Médico</SelectItem>
                          <SelectItem value="seasonal">Sazonal</SelectItem>
                          <SelectItem value="promotional">Promocional</SelectItem>
                          <SelectItem value="educational">Educacional</SelectItem>
                          <SelectItem value="general">Geral</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    <div>
                      <Label htmlFor="tags">Tags</Label>
                      <Input
                        id="tags"
                        value={formData.tags}
                        onChange={(e) => setFormData(prev => ({ ...prev, tags: e.target.value }))}
                        placeholder="cachorro, gato, veterinário (separadas por vírgula)"
                      />
                    </div>

                    <div className="flex items-center gap-4">
                      <div className="flex items-center space-x-2">
                        <input
                          type="checkbox"
                          id="isPublic"
                          checked={formData.isPublic}
                          onChange={(e) => setFormData(prev => ({ ...prev, isPublic: e.target.checked }))}
                          className="rounded"
                        />
                        <Label htmlFor="isPublic">Público</Label>
                      </div>

                      <div className="flex items-center space-x-2">
                        <input
                          type="checkbox"
                          id="isPremium"
                          checked={formData.isPremium}
                          onChange={(e) => setFormData(prev => ({ ...prev, isPremium: e.target.checked }))}
                          className="rounded"
                        />
                        <Label htmlFor="isPremium">Premium</Label>
                      </div>
                    </div>
                  </div>
                </div>
              </>
            ) : (
              <div className="flex items-center justify-center h-full text-muted-foreground">
                <div className="text-center">
                  <Upload className="h-12 w-12 mx-auto mb-4" />
                  <p>Selecione arquivos para começar</p>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between p-6 pt-0 border-t">
          <div className="text-sm text-muted-foreground">
            {files.length} arquivo{files.length !== 1 ? 's' : ''} selecionado{files.length !== 1 ? 's' : ''}
          </div>
          
          <div className="flex gap-2">
            <Button variant="outline" onClick={handleClose} disabled={uploading}>
              Cancelar
            </Button>
            <Button onClick={handleUpload} disabled={!canUpload}>
              {uploading ? 'Fazendo Upload...' : 'Upload'}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}