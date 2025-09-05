import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { FileUpload } from '@/components/ui/FileUpload';
import { Palette } from 'lucide-react';

interface LogoUploadStepProps {
  onNext: (data: any) => void;
  onPrevious: () => void;
  stepNumber: number;
  isCompleted: boolean;
}

interface LogoData {
  file: File | null;
  preview: string | null;
  palette: string[];
  metadata: {
    width: number;
    height: number;
    format: string;
    fileSize: number;
  } | null;
}

export function LogoUploadStep({ onNext, onPrevious, stepNumber, isCompleted }: LogoUploadStepProps) {
  const [logoData, setLogoData] = useState<LogoData>({
    file: null,
    preview: null,
    palette: [],
    metadata: null
  });
  const [isUploading, setIsUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleFileSelect = async (file: File) => {
    setError(null);
    setIsUploading(true);

    try {
      // Create preview
      const preview = URL.createObjectURL(file);
      
      // Mock palette extraction for now (will be replaced with actual API call)
      const mockPalette = ['#2563eb', '#7c3aed', '#dc2626', '#059669', '#d97706'];
      
      // Mock metadata
      const mockMetadata = {
        width: 800,
        height: 600,
        format: file.type.split('/')[1],
        fileSize: file.size
      };

      setLogoData({
        file,
        preview,
        palette: mockPalette,
        metadata: mockMetadata
      });

      // Simulate upload delay
      await new Promise(resolve => setTimeout(resolve, 1500));

    } catch (err) {
      setError('Erro ao processar arquivo. Tente novamente.');
      console.error('Upload error:', err);
    } finally {
      setIsUploading(false);
    }
  };

  const handleFileRemove = () => {
    if (logoData.preview) {
      URL.revokeObjectURL(logoData.preview);
    }
    setLogoData({
      file: null,
      preview: null,
      palette: [],
      metadata: null
    });
    setError(null);
  };

  const handleNext = () => {
    if (logoData.file && logoData.preview) {
      onNext({
        logoFile: logoData.file,
        logoUrl: logoData.preview,
        palette: logoData.palette,
        metadata: logoData.metadata
      });
    }
  };

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  return (
    <div className="space-y-6">
      <div className="text-center">
        <h2 className="text-2xl font-bold">Upload da Logo</h2>
        <p className="text-muted-foreground mt-2">
          Faça upload da logo da sua marca para extrair automaticamente a paleta de cores
        </p>
      </div>

      <FileUpload
        onFileSelect={handleFileSelect}
        onFileRemove={handleFileRemove}
        preview={logoData.preview}
        isLoading={isUploading}
        error={error}
        maxSize={5 * 1024 * 1024} // 5MB
      />

      {logoData.palette.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Palette className="h-5 w-5" />
              Paleta de Cores Extraída
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex gap-3 mb-4">
              {logoData.palette.map((color, index) => (
                <div key={index} className="text-center">
                  <div 
                    className="w-12 h-12 rounded-lg border shadow-sm"
                    style={{ backgroundColor: color }}
                  />
                  <p className="text-xs font-mono mt-1">{color}</p>
                </div>
              ))}
            </div>
            
            {logoData.metadata && (
              <div className="text-sm text-muted-foreground space-y-1">
                <p>Dimensões: {logoData.metadata.width}x{logoData.metadata.height}px</p>
                <p>Formato: {logoData.metadata.format.toUpperCase()}</p>
                <p>Tamanho: {formatFileSize(logoData.metadata.fileSize)}</p>
              </div>
            )}
          </CardContent>
        </Card>
      )}

      <div className="flex justify-between">
        <Button variant="outline" onClick={onPrevious} disabled={stepNumber === 1}>
          Anterior
        </Button>
        
        <Button 
          onClick={handleNext} 
          disabled={!logoData.file || isUploading}
        >
          {isUploading ? 'Processando...' : 'Próximo'}
        </Button>
      </div>
    </div>
  );
}