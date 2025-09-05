import React, { useState, useCallback } from 'react';
import { useDropzone } from 'react-dropzone';
import { Button } from './button';
import { Card, CardContent } from './card';
import { Upload, X, FileImage } from 'lucide-react';
import { cn } from '@/lib/utils';

interface FileUploadProps {
  onFileSelect: (file: File) => void;
  onFileRemove: () => void;
  accept?: Record<string, string[]>;
  maxSize?: number;
  preview?: string | null;
  isLoading?: boolean;
  error?: string | null;
  className?: string;
}

export function FileUpload({
  onFileSelect,
  onFileRemove,
  accept = {
    'image/png': ['.png'],
    'image/jpeg': ['.jpg', '.jpeg'],
    'image/svg+xml': ['.svg']
  },
  maxSize = 5 * 1024 * 1024, // 5MB
  preview,
  isLoading = false,
  error,
  className
}: FileUploadProps) {
  const [dragActive, setDragActive] = useState(false);

  const onDrop = useCallback((acceptedFiles: File[]) => {
    if (acceptedFiles.length > 0) {
      onFileSelect(acceptedFiles[0]);
    }
    setDragActive(false);
  }, [onFileSelect]);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept,
    maxSize,
    multiple: false,
    onDragEnter: () => setDragActive(true),
    onDragLeave: () => setDragActive(false)
  });

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  return (
    <div className={cn("w-full", className)}>
      {!preview ? (
        <Card 
          {...getRootProps()} 
          className={cn(
            "border-2 border-dashed transition-colors cursor-pointer",
            isDragActive || dragActive ? "border-primary bg-primary/5" : "border-muted-foreground/25",
            error ? "border-destructive" : "",
            isLoading ? "opacity-50 cursor-not-allowed" : ""
          )}
        >
          <CardContent className="flex flex-col items-center justify-center py-12 px-6 text-center">
            <input {...getInputProps()} disabled={isLoading} />
            
            <div className={cn(
              "rounded-full p-4 mb-4",
              isDragActive || dragActive ? "bg-primary/10" : "bg-muted"
            )}>
              <Upload className="h-8 w-8 text-muted-foreground" />
            </div>
            
            <h3 className="text-lg font-medium mb-2">
              {isDragActive ? "Solte o arquivo aqui" : "Faça upload da sua logo"}
            </h3>
            
            <p className="text-sm text-muted-foreground mb-4">
              Arraste e solte ou clique para selecionar
            </p>
            
            <div className="text-xs text-muted-foreground space-y-1">
              <p>Formatos aceitos: PNG, JPG, SVG</p>
              <p>Tamanho máximo: {formatFileSize(maxSize)}</p>
            </div>
            
            {!isDragActive && (
              <Button type="button" variant="outline" className="mt-4" disabled={isLoading}>
                {isLoading ? "Processando..." : "Selecionar arquivo"}
              </Button>
            )}
          </CardContent>
        </Card>
      ) : (
        <Card>
          <CardContent className="p-6">
            <div className="flex items-start gap-4">
              <div className="flex-shrink-0">
                <div className="w-16 h-16 rounded-lg border bg-muted flex items-center justify-center overflow-hidden">
                  {preview.startsWith('data:') || preview.startsWith('blob:') ? (
                    <img 
                      src={preview} 
                      alt="Preview" 
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <FileImage className="h-8 w-8 text-muted-foreground" />
                  )}
                </div>
              </div>
              
              <div className="flex-1 min-w-0">
                <h4 className="text-sm font-medium">Logo carregada</h4>
                <p className="text-xs text-muted-foreground mt-1">
                  Arquivo processado com sucesso
                </p>
                
                {isLoading && (
                  <div className="flex items-center gap-2 mt-2">
                    <div className="w-2 h-2 rounded-full bg-primary animate-pulse"></div>
                    <span className="text-xs text-muted-foreground">Processando...</span>
                  </div>
                )}
              </div>
              
              <Button
                type="button"
                variant="ghost"
                size="sm"
                onClick={(e) => {
                  e.stopPropagation();
                  onFileRemove();
                }}
                disabled={isLoading}
              >
                <X className="h-4 w-4" />
              </Button>
            </div>
          </CardContent>
        </Card>
      )}
      
      {error && (
        <p className="text-sm text-destructive mt-2">{error}</p>
      )}
    </div>
  );
}