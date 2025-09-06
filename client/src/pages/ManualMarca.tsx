/**
 * @fileoverview Manual de Marca Digital - Main Page Component
 * Complete manual interface with navigation, routing, and content sections
 */

import React, { Suspense, lazy } from 'react';
import { ManualLayout } from '../components/manual/ManualLayout';
import { ManualRouter } from '../components/manual/ManualRouter';
import { useManualData } from '../hooks/useManualData';
import { Button } from '../components/ui/button';
import { Badge } from '../components/ui/badge';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../components/ui/card';
import { Alert, AlertDescription } from '../components/ui/alert';
import { 
  Download, 
  Share, 
  RefreshCw, 
  CheckCircle, 
  AlertTriangle,
  FileText,
  Loader2
} from 'lucide-react';

// Lazy load section components for better performance
const OverviewSection = lazy(() => import('../components/manual/sections/OverviewSection'));
const VisualIdentitySection = lazy(() => import('../components/manual/sections/VisualIdentitySection'));
const VoiceSection = lazy(() => import('../components/manual/sections/VoiceSection'));
const LanguageSection = lazy(() => import('../components/manual/sections/LanguageSection'));
const ComplianceSection = lazy(() => import('../components/manual/sections/ComplianceSection'));
// TODO: Implement remaining section components in T-005 to T-007
// const VoiceToneSection = lazy(() => import('../components/manual/sections/VoiceToneSection'));
// const LanguageSection = lazy(() => import('../components/manual/sections/LanguageSection'));
// const ComplianceSection = lazy(() => import('../components/manual/sections/ComplianceSection'));
// const ExportSection = lazy(() => import('../components/manual/sections/ExportSection'));
// const ShareSection = lazy(() => import('../components/manual/sections/ShareSection'));

// Loading component for section transitions
const SectionLoader = () => (
  <div className="flex items-center justify-center h-64">
    <div className="flex items-center space-x-2 text-muted-foreground">
      <Loader2 className="h-5 w-5 animate-spin" />
      <span>Carregando seção...</span>
    </div>
  </div>
);

// Error boundary for sections
const SectionErrorBoundary = ({ children, sectionId }: { children: React.ReactNode; sectionId: string }) => {
  return (
    <div className="p-6">
      <Alert className="border-red-200 bg-red-50">
        <AlertTriangle className="h-4 w-4 text-red-600" />
        <AlertDescription className="text-red-800">
          Erro ao carregar a seção {sectionId}. Tente recarregar a página.
        </AlertDescription>
      </Alert>
    </div>
  );
};

interface ManualMarcaPageProps {
  brandId?: string;
}

export default function ManualMarcaPage({ brandId = 'default' }: ManualMarcaPageProps) {
  return <ManualRouter brandId={brandId} />;
}

interface ManualContentProps {
  brandId: string;
  currentSection: string;
  currentSubsection?: string;
  onSectionChange: (sectionId: string, subsectionId?: string) => void;
}

function ManualContent({ 
  brandId, 
  currentSection, 
  currentSubsection, 
  onSectionChange 
}: ManualContentProps) {
  const {
    manual,
    isLoading,
    error,
    validation,
    isValidating,
    revalidate,
    exportManual,
    updateSharing,
    isExporting
  } = useManualData('demo-user', brandId);

  // Handle refresh
  const handleRefresh = () => {
    revalidate();
  };

  // Handle export
  const handleExport = async (format: 'pdf' | 'json' | 'brand_kit') => {
    try {
      await exportManual({ 
        format, 
        sections: ['visual', 'voice', 'language', 'compliance'],
        options: {
          include_examples: true,
          include_history: false,
          watermark: false,
          compress: true,
          page_format: 'A4',
          orientation: 'portrait'
        }
      });
    } catch (err) {
      console.error('Export failed:', err);
    }
  };

  // Header actions
  const headerActions = (
    <div className="flex items-center space-x-2">
      {/* Validation status */}
      {validation && (
        <Badge 
          variant={validation.valid ? "default" : "destructive"}
          className="flex items-center space-x-1"
        >
          {validation.valid ? (
            <CheckCircle className="h-3 w-3" />
          ) : (
            <AlertTriangle className="h-3 w-3" />
          )}
          <span>{validation.valid ? 'Válido' : 'Requer Atenção'}</span>
        </Badge>
      )}

      {/* Quick actions */}
      <Button
        variant="outline"
        size="sm"
        onClick={() => handleExport('pdf')}
        disabled={isExporting || !manual}
        className="hidden sm:flex"
      >
        <Download className="h-4 w-4 mr-2" />
        {isExporting ? 'Exportando...' : 'Exportar'}
      </Button>

      <Button
        variant="outline"
        size="sm"
        onClick={() => onSectionChange('share')}
        disabled={!manual}
        className="hidden sm:flex"
      >
        <Share className="h-4 w-4 mr-2" />
        Compartilhar
      </Button>
    </div>
  );

  // Get subtitle based on validation
  const getSubtitle = () => {
    if (isValidating) return 'Validando conteúdo...';
    if (!manual) return 'Carregando manual...';
    
    if (validation) {
      const { errors, warnings } = validation;
      if (errors.length > 0) {
        return `${errors.length} erro(s) encontrado(s)`;
      }
      if (warnings.length > 0) {
        return `${warnings.length} aviso(s) de melhoria`;
      }
      return 'Manual validado com sucesso';
    }
    
    return undefined;
  };

  // Render current section content
  const renderSectionContent = () => {
    if (!manual && !isLoading) {
      return (
        <div className="flex items-center justify-center h-64">
          <Card className="w-96">
            <CardHeader>
              <CardTitle>Manual não encontrado</CardTitle>
              <CardDescription>
                Não foi possível carregar o manual para esta marca.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Button onClick={handleRefresh} className="w-full">
                <RefreshCw className="h-4 w-4 mr-2" />
                Tentar Novamente
              </Button>
            </CardContent>
          </Card>
        </div>
      );
    }

    // Section component mapping
    const sectionComponents: Record<string, React.ComponentType<any>> = {
      'overview': OverviewSection,
      'visual-identity': VisualIdentitySection,
      'voice': VoiceSection,
      'language': LanguageSection,
      'compliance': ComplianceSection,
    };

    const SectionComponent = sectionComponents[currentSection];

    if (!SectionComponent) {
      // Placeholder for unimplemented sections
      return (
        <div className="p-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <FileText className="h-5 w-5" />
                <span>Seção: {currentSection}</span>
              </CardTitle>
              <CardDescription>
                {currentSubsection && `Subseção: ${currentSubsection}`}
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <Alert>
                  <AlertTriangle className="h-4 w-4" />
                  <AlertDescription>
                    Esta seção está em desenvolvimento. Será implementada nas próximas tarefas (T-005 a T-007).
                  </AlertDescription>
                </Alert>
                
                {manual && (
                  <div className="bg-gray-50 p-4 rounded">
                    <h4 className="font-medium mb-2">Dados disponíveis:</h4>
                    <pre className="text-sm text-gray-600 overflow-auto max-h-40">
                      {JSON.stringify(manual.sections, null, 2)}
                    </pre>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </div>
      );
    }

    return (
      <Suspense fallback={<SectionLoader />}>
        <SectionComponent
          manual={manual}
          currentSubsection={currentSubsection}
          onSubsectionChange={(subsectionId: string) => 
            onSectionChange(currentSection, subsectionId)
          }
          onNavigateToSection={onSectionChange}
          validation={validation}
          isLoading={isLoading}
        />
      </Suspense>
    );
  };

  return (
    <ManualLayout
      currentSection={currentSection}
      onSectionChange={onSectionChange}
      isLoading={isLoading}
      error={error?.message || null}
      onRefresh={handleRefresh}
      title="Manual da Marca"
      subtitle={getSubtitle()}
      headerActions={headerActions}
      onBack={() => window.history.back()}
    >
      {renderSectionContent()}
    </ManualLayout>
  );
}

// Export page variants
export function ManualMarcaPreviewPage(props: ManualMarcaPageProps) {
  return (
    <div className="bg-gray-50 min-h-screen">
      <ManualMarcaPage {...props} />
    </div>
  );
}

export function ManualMarcaEmbedPage(props: ManualMarcaPageProps) {
  return (
    <div className="w-full h-full">
      <ManualMarcaPage {...props} />
    </div>
  );
}