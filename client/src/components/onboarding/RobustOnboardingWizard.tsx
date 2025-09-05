import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { ArrowLeft, ArrowRight, Upload, Volume2, MessageSquare, Palette, Eye } from 'lucide-react';
import { useSimpleOnboarding } from '@/hooks/useOnboardingSimple';

const STEPS = [
  {
    id: 'logo',
    title: 'Logo da Marca',
    description: 'Faça upload da logo para extrair a paleta de cores',
    icon: Upload,
  },
  {
    id: 'tone',
    title: 'Tom de Voz',
    description: 'Configure a personalidade da sua marca',
    icon: Volume2,
  },
  {
    id: 'language',
    title: 'Linguagem',
    description: 'Defina termos preferidos e CTAs padrão',
    icon: MessageSquare,
  },
  {
    id: 'values',
    title: 'Valores da Marca',
    description: 'Configure missão, valores e disclaimer',
    icon: Palette,
  },
  {
    id: 'preview',
    title: 'Preview Final',
    description: 'Visualize sua identidade de marca',
    icon: Eye,
  }
];

export function RobustOnboardingWizard() {
  const {
    currentStep,
    nextStep,
    prevStep,
    canGoNext,
    canGoPrev,
    getStepStatus
  } = useSimpleOnboarding();

  console.log('RobustOnboardingWizard render - currentStep:', currentStep);

  const progressPercentage = ((currentStep + 1) / STEPS.length) * 100;
  const currentStepData = STEPS[currentStep];

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
              <div key={step.id} className="flex flex-col items-center space-y-2">
                <div className={`
                  w-12 h-12 rounded-full flex items-center justify-center border-2 transition-colors
                  ${status === 'current' ? 'bg-blue-600 border-blue-600 text-white' : ''}
                  ${status === 'completed' ? 'bg-green-600 border-green-600 text-white' : ''}
                  ${status === 'pending' ? 'bg-gray-100 border-gray-300 text-gray-400' : ''}
                `}>
                  <Icon className="w-6 h-6" />
                </div>
                <span className={`
                  text-xs text-center font-medium
                  ${status === 'current' ? 'text-blue-600' : ''}
                  ${status === 'completed' ? 'text-green-600' : ''}
                  ${status === 'pending' ? 'text-gray-400' : ''}
                `}>
                  {step.title}
                </span>
              </div>
            );
          })}
        </div>

        {/* Main Content */}
        <Card className="mb-8">
          <CardHeader>
            <div className="flex items-center space-x-3">
              <div className="p-2 bg-blue-100 rounded-lg">
                {React.createElement(currentStepData.icon, { 
                  className: "w-6 h-6 text-blue-600" 
                })}
              </div>
              <div>
                <CardTitle className="text-xl">
                  {currentStepData.title}
                </CardTitle>
                <p className="text-gray-600 text-sm mt-1">
                  {currentStepData.description}
                </p>
              </div>
              <div className="ml-auto">
                <Badge variant="outline">
                  Passo {currentStep + 1}
                </Badge>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            {/* Step Content */}
            <div className="min-h-[300px] flex items-center justify-center">
              <div className="text-center">
                <h3 className="text-2xl font-semibold mb-4">
                  {currentStepData.title}
                </h3>
                <p className="text-gray-600 mb-8">
                  Conteúdo da etapa {currentStep + 1} será implementado aqui.
                </p>
                <div className="p-8 bg-gray-50 rounded-lg">
                  <p className="text-sm text-gray-500">
                    Placeholder para componente do step: {currentStepData.id}
                  </p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Navigation Footer */}
        <div className="flex justify-between items-center">
          <Button
            onClick={prevStep}
            disabled={!canGoPrev}
            variant="outline"
            className="flex items-center space-x-2"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Anterior</span>
          </Button>

          <div className="text-center">
            <p className="text-sm text-gray-500">
              {currentStep + 1} de {STEPS.length} passos
            </p>
          </div>

          <Button
            onClick={nextStep}
            disabled={!canGoNext}
            className="flex items-center space-x-2"
          >
            <span>{currentStep === STEPS.length - 1 ? 'Finalizar' : 'Próximo'}</span>
            <ArrowRight className="w-4 h-4" />
          </Button>
        </div>
      </div>
    </div>
  );
}