import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { ArrowLeft, ArrowRight, Check, Upload, Palette, Volume2, MessageSquare, Eye } from 'lucide-react';
import { useOnboarding } from '@/hooks/useOnboarding';
import { useTenantContext } from '@/hooks/useTenantContext';
import { cn } from '@/lib/utils';

// Step imports (placeholders for now)
import { 
  LogoUploadStep, 
  ToneConfigStep, 
  LanguageConfigStep, 
  BrandValuesStep, 
  PreviewStep 
} from './steps/PlaceholderSteps';

const STEPS = [
  {
    id: 'logo',
    title: 'Logo da Marca',
    description: 'Faça upload da logo para extrair a paleta de cores',
    icon: Upload,
    component: LogoUploadStep
  },
  {
    id: 'tone',
    title: 'Tom de Voz',
    description: 'Configure a personalidade da sua marca',
    icon: Volume2,
    component: ToneConfigStep
  },
  {
    id: 'language',
    title: 'Linguagem',
    description: 'Defina termos preferidos e CTAs padrão',
    icon: MessageSquare,
    component: LanguageConfigStep
  },
  {
    id: 'values',
    title: 'Valores da Marca',
    description: 'Configure missão, valores e disclaimer',
    icon: Palette,
    component: BrandValuesStep
  },
  {
    id: 'preview',
    title: 'Preview Final',
    description: 'Visualize sua identidade de marca',
    icon: Eye,
    component: PreviewStep
  }
];

export function RobustOnboardingWizard({ userId }: { userId?: string }) {
  const [isCompleting, setIsCompleting] = useState(false);
  const [showSuccessMessage, setShowSuccessMessage] = useState(false);
  
  // 🆕 Adicionar contexto de tenant
  const { currentTenant, loading: tenantLoading, error: tenantError } = useTenantContext();
  
  const {
    currentStep,
    state,
    isLoading,
    errors,
    nextStep,
    prevStep,
    canGoNext,
    canGoPrev,
    getStepStatus,
    completWizard,
    validateCurrentStep,
    validateAndNextStep,
    updateLogoData,
    updateToneConfig,
    updateLanguageConfig,
    updateBrandValues
  } = useOnboarding(userId);

  // 🆕 Não renderizar até ter contexto de tenant
  if (tenantLoading) {
    return (
      <div className="max-w-4xl mx-auto">
        <div className="text-center py-12">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <h2 className="text-xl font-semibold text-gray-900 mb-2">Carregando contexto...</h2>
          <p className="text-gray-600">Preparando ambiente para configuração da marca</p>
        </div>
      </div>
    );
  }

  if (tenantError || !currentTenant?.id) {
    return (
      <div className="max-w-4xl mx-auto">
        <div className="text-center py-12">
          <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <span className="text-red-600 text-2xl">⚠️</span>
          </div>
          <h2 className="text-xl font-semibold text-red-900 mb-2">Erro de Contexto</h2>
          <p className="text-red-700 mb-4">
            {tenantError || 'Não foi possível encontrar o contexto da empresa'}
          </p>
          <Button onClick={() => window.location.reload()} variant="outline">
            Tentar Novamente
          </Button>
        </div>
      </div>
    );
  }

  const CurrentStepComponent = STEPS[currentStep]?.component;
  const progressPercentage = ((currentStep + 1) / STEPS.length) * 100;

  const handleNext = async () => {
    if (currentStep === STEPS.length - 1) {
      // Last step - complete wizard
      setIsCompleting(true);
      try {
        await completWizard();
        setShowSuccessMessage(true);
      } catch (error) {
        setIsCompleting(false);
      }
    } else {
      // Use the new validation function
      const success = await validateAndNextStep();
      if (!success) {
        // Validation failed, error is already set in state
        console.log('Validation failed for step:', currentStep);
      }
    }
  };

  const handleValidateAndNext = () => {
    handleNext();
  };

  return (
    <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            Configuração da Identidade de Marca
          </h1>
          <p className="text-gray-600 max-w-2xl mx-auto">
            Vamos criar a identidade digital da sua marca pet em alguns passos simples. 
            Este processo levará cerca de 10-15 minutos.
          </p>
          {/* 🆕 Mostrar contexto do tenant */}
          {currentTenant && (
            <div className="mt-4 inline-flex items-center px-3 py-1 rounded-full text-sm bg-blue-50 text-blue-700 border border-blue-200">
              <span className="font-medium">{currentTenant.name}</span>
              {currentTenant.businessType && (
                <>
                  <span className="mx-2">•</span>
                  <span className="capitalize">{currentTenant.businessType}</span>
                </>
              )}
            </div>
          )}
        </div>

        {/* Progress Bar */}
        <div className="mb-8">
          <div className="flex justify-between items-center mb-4">
            <span className="text-sm font-medium text-gray-700">
              Progresso: {currentStep + 1} de {STEPS.length}
            </span>
            <span className="text-sm text-gray-500">
              {Math.round(progressPercentage)}% concluído
            </span>
          </div>
          <Progress value={progressPercentage} className="h-3" />
        </div>

        {/* Steps Navigation */}
        <div className="grid grid-cols-5 gap-2 mb-8">
          {STEPS.map((step, index) => {
            const status = getStepStatus(index);
            const Icon = step.icon;
            
            return (
              <div key={step.id} className="flex flex-col items-center">
                <div
                  className={cn(
                    "w-12 h-12 rounded-full flex items-center justify-center mb-2 transition-all",
                    status === 'completed' && "bg-green-500 text-white",
                    status === 'current' && "bg-blue-500 text-white ring-4 ring-blue-200",
                    status === 'pending' && "bg-gray-200 text-gray-400"
                  )}
                >
                  {status === 'completed' ? (
                    <Check className="w-6 h-6" />
                  ) : (
                    <Icon className="w-6 h-6" />
                  )}
                </div>
                <span className={cn(
                  "text-xs text-center font-medium",
                  status === 'current' && "text-blue-600",
                  status === 'completed' && "text-green-600",
                  status === 'pending' && "text-gray-400"
                )}>
                  {step.title}
                </span>
              </div>
            );
          })}
        </div>

        {/* Error Display */}
        {Object.keys(errors).length > 0 && (
          <Card className="mb-6 border-red-200 bg-red-50">
            <CardContent className="pt-6">
              <div className="flex items-center space-x-2">
                <div className="w-2 h-2 bg-red-500 rounded-full" />
                <p className="text-red-700 text-sm">
                  {Object.values(errors)[0]}
                </p>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Main Content */}
        <Card className="mb-8">
          <CardHeader>
            <div className="flex items-center space-x-3">
              <div className="p-2 bg-blue-100 rounded-lg">
                {React.createElement(STEPS[currentStep]?.icon, { 
                  className: "w-6 h-6 text-blue-600" 
                })}
              </div>
              <div>
                <CardTitle className="text-xl">
                  {STEPS[currentStep]?.title}
                </CardTitle>
                <p className="text-gray-600 text-sm mt-1">
                  {STEPS[currentStep]?.description}
                </p>
              </div>
              <div className="ml-auto">
                <Badge variant="outline">
                  Passo {currentStep + 1}
                </Badge>
              </div>
            </div>
          </CardHeader>
          <CardContent className="pb-8">
            {CurrentStepComponent && (
              <CurrentStepComponent
                state={state}
                onNext={() => {}} // Empty function - steps shouldn't navigate directly
                onPrevious={() => {}} // Empty function - navigation handled by wizard
                errors={errors}
                isLoading={false} // Don't pass global loading state to individual steps
                updateLogoData={updateLogoData}
                updateToneConfig={updateToneConfig}
                updateLanguageConfig={updateLanguageConfig}
                updateBrandValues={updateBrandValues}
                userId={userId}
              />
            )}
          </CardContent>
          
          {/* Navigation integrated in card footer */}
          <div className="border-t px-6 py-4 bg-gray-50 rounded-b-lg">
            <div className="flex justify-between items-center">
              <Button
                onClick={() => prevStep()}
                disabled={!canGoPrev || isLoading}
                variant="outline"
                className="flex items-center space-x-2"
              >
                <ArrowLeft className="w-4 h-4" />
                <span>Anterior</span>
              </Button>

              <div className="flex items-center space-x-4">
                {/* Save Progress Indicator */}
                {isLoading && (
                  <div className="flex items-center space-x-2 text-sm text-gray-500">
                    <div className="w-4 h-4 border-2 border-gray-300 border-t-blue-600 rounded-full animate-spin" />
                    <span>Salvando...</span>
                  </div>
                )}
                
                {/* 🆕 Indicador de contexto */}
                {!isLoading && currentTenant?.id && (
                  <div className="flex items-center space-x-2 text-sm text-green-600">
                    <Check className="w-4 h-4" />
                    <span>Dados seguros</span>
                  </div>
                )}
                
                {/* Step indicator */}
                <span className="text-sm text-gray-500">
                  {currentStep + 1} de {STEPS.length}
                </span>
              </div>

              <Button
                onClick={handleValidateAndNext}
                disabled={isCompleting}
                className="flex items-center space-x-2"
              >
                {isCompleting ? (
                  <>
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    <span>Finalizando...</span>
                  </>
                ) : (
                  <>
                    <span>
                      {currentStep === STEPS.length - 1 ? 'Finalizar Configuração' : 'Próximo'}
                    </span>
                    {currentStep === STEPS.length - 1 ? (
                      <Check className="w-4 h-4" />
                    ) : (
                      <ArrowRight className="w-4 h-4" />
                    )}
                  </>
                )}
              </Button>
            </div>
          </div>
        </Card>

        {/* Success Message */}
        {showSuccessMessage && (
          <Card className="mb-6 border-green-200 bg-green-50">
            <CardContent className="pt-6">
              <div className="flex items-center space-x-3">
                <div className="w-8 h-8 bg-green-500 rounded-full flex items-center justify-center">
                  <Check className="w-5 h-5 text-white" />
                </div>
                <div>
                  <p className="text-green-800 font-medium">
                    🎉 Configuração concluída com sucesso!
                  </p>
                  <p className="text-green-700 text-sm">
                    Redirecionando para o dashboard...
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Help Text */}
        <div className="mt-6 text-center">
          {currentStep === STEPS.length - 1 ? (
            <div className="space-y-2">
              <p className="text-sm text-gray-700 font-medium">
                🎉 Configuração quase concluída!
              </p>
              <p className="text-sm text-gray-500">
                Ao finalizar, seus dados serão salvos e você será redirecionado para o dashboard.
              </p>
            </div>
          ) : (
            <div className="space-y-2">
              <p className="text-sm text-gray-700 font-medium">
                💾 Salvamento Automático Ativo
              </p>
              <p className="text-sm text-gray-500">
                Seus dados são salvos automaticamente a cada mudança. Pode navegar tranquilamente entre as etapas.
              </p>
            </div>
          )}
        </div>
    </div>
  );
}