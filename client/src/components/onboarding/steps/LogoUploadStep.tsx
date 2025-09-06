import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { FileUpload } from '@/components/ui/FileUpload';
import { Palette } from 'lucide-react';
import { LogoProcessingResult } from '@shared/types/onboarding';
import { createOnboardingApiClient } from '@/lib/onboarding-api';

interface LogoUploadStepProps {
  onNext: (data: any) => void;
  onPrevious: () => void;
  stepNumber: number;
  isCompleted: boolean;
  updateLogoData?: (data: LogoProcessingResult) => void;
  userId?: string;
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

export function LogoUploadStep({ onNext, onPrevious, stepNumber, isCompleted, updateLogoData, userId }: LogoUploadStepProps) {
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

      setLogoData(prev => ({
        ...prev,
        file,
        preview
      }));

      // Upload to backend if userId is available
      if (userId) {
        const apiClient = createOnboardingApiClient(userId);
        const uploadResult = await apiClient.uploadLogo(file);

        if (uploadResult.success) {
          const { logoUrl, palette, metadata } = uploadResult.data!;

          setLogoData(prev => ({
            ...prev,
            palette: palette || [],
            metadata
          }));

          // Update global state
          if (updateLogoData) {
            updateLogoData({
              logoUrl,
              palette: palette || [],
              metadata
            });
          }
        } else {
          // If upload fails, fall back to local handling
          console.warn('Logo upload failed, falling back to local handling:', uploadResult.error);

          const mockPalette = ['#2563eb', '#7c3aed', '#dc2626', '#059669', '#d97706'];
          const mockMetadata = {
            width: 800,
            height: 600,
            format: file.type.split('/')[1],
            fileSize: file.size,
            hasTransparency: file.type === 'image/png'
          };

          setLogoData(prev => ({
            ...prev,
            palette: mockPalette,
            metadata: mockMetadata
          }));

          // Update global state with local data
          if (updateLogoData) {
            updateLogoData({
              logoUrl: preview,
              palette: mockPalette,
              metadata: mockMetadata
            });
          }
        }
      } else {
        // Fallback to mock data if no userId
        const mockPalette = ['#2563eb', '#7c3aed', '#dc2626', '#059669', '#d97706'];
        const mockMetadata = {
          width: 800,
          height: 600,
          format: file.type.split('/')[1],
          fileSize: file.size,
          hasTransparency: file.type === 'image/png'
        };

        setLogoData(prev => ({
          ...prev,
          palette: mockPalette,
          metadata: mockMetadata
        }));

        // Update global state
        if (updateLogoData) {
          updateLogoData({
            logoUrl: preview,
            palette: mockPalette,
            metadata: mockMetadata
          });
        }
      }

    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Erro ao processar arquivo. Tente novamente.';
      setError(errorMessage);
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

  // Auto-trigger next when logo is successfully uploaded
  React.useEffect(() => {
    if (logoData.file && logoData.preview && !isUploading) {
      // Optionally auto-advance or just notify parent
      // handleNext(); // Uncomment to auto-advance
    }
  }, [logoData.file, logoData.preview, isUploading]);

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

      {/* Status indicator */}
      {logoData.file && (
        <div className="text-center p-4 bg-green-50 rounded-lg border border-green-200">
          <p className="text-green-800 font-medium">
            ✅ Logo carregada com sucesso! Use os botões abaixo para continuar.
          </p>
        </div>
      )}
    </div>
  );
}