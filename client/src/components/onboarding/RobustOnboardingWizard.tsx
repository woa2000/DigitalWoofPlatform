import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { ArrowLeft, ArrowRight, Check, Upload, Palette, Volume2, MessageSquare, Eye } from 'lucide-react';
import { useOnboarding } from '@/hooks/useOnboarding';
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
    updateLogoData,
    updateToneConfig,
    updateLanguageConfig,
    updateBrandValues
  } = useOnboarding(userId);

  const CurrentStepComponent = STEPS[currentStep]?.component;
  const progressPercentage = ((currentStep + 1) / STEPS.length) * 100;

  const handleNext = async () => {
    if (currentStep === STEPS.length - 1) {
      // Last step - complete wizard
      setIsCompleting(true);
      try {
        await completWizard();
      } catch (error) {
        setIsCompleting(false);
      }
    } else {
      await nextStep();
    }
  };

  const handleValidateAndNext = () => {
    if (validateCurrentStep()) {
      handleNext();
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 p-4">
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
                isLoading={isLoading}
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
                
                {/* Step indicator */}
                <span className="text-sm text-gray-500">
                  {currentStep + 1} de {STEPS.length}
                </span>
              </div>

              <Button
                onClick={handleValidateAndNext}
                disabled={isLoading || isCompleting}
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

        {/* Help Text */}
        <div className="mt-6 text-center">
          {currentStep === STEPS.length - 1 ? (
            <div className="space-y-2">
              <p className="text-sm text-gray-700 font-medium">
                🎉 Configuração quase concluída!
              </p>
              <p className="text-sm text-gray-500">
                Ao finalizar, você será redirecionado para o dashboard onde poderá começar a usar a plataforma.
              </p>
            </div>
          ) : (
            <p className="text-sm text-gray-500">
              Seu progresso é salvo automaticamente. Você pode sair e retornar a qualquer momento.
            </p>
          )}
        </div>
      </div>
    </div>
  );
}