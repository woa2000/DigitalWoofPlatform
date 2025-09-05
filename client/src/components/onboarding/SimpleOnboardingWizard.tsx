import React from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useSimpleOnboarding } from '@/hooks/useOnboardingSimple';

const STEPS = ['Logo', 'Tom', 'Linguagem', 'Valores', 'Preview'];

export function SimpleOnboardingWizard() {
  const {
    currentStep,
    nextStep,
    prevStep,
    canGoNext,
    canGoPrev,
    getStepStatus
  } = useSimpleOnboarding();

  console.log('SimpleOnboardingWizard render - currentStep:', currentStep);

  return (
    <div className="min-h-screen bg-gray-50 p-4">
      <div className="max-w-2xl mx-auto">
        <Card>
          <CardHeader>
            <CardTitle>Onboarding Teste - Step {currentStep + 1}</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {/* Steps indicator */}
              <div className="flex space-x-2">
                {STEPS.map((step, index) => {
                  const status = getStepStatus(index);
                  return (
                    <div 
                      key={index} 
                      className={`px-3 py-1 rounded text-sm ${
                        status === 'current' ? 'bg-blue-500 text-white' :
                        status === 'completed' ? 'bg-green-500 text-white' :
                        'bg-gray-200 text-gray-600'
                      }`}
                    >
                      {step}
                    </div>
                  );
                })}
              </div>

              {/* Current step content */}
              <div className="p-4 border rounded">
                <h3 className="text-lg font-semibold">
                  {STEPS[currentStep]}
                </h3>
                <p className="text-gray-600">
                  Esta é a etapa {currentStep + 1} do processo de onboarding.
                </p>
              </div>

              {/* Navigation */}
              <div className="flex justify-between">
                <Button 
                  onClick={prevStep} 
                  disabled={!canGoPrev}
                  variant="outline"
                >
                  Anterior
                </Button>
                <Button 
                  onClick={nextStep} 
                  disabled={!canGoNext}
                >
                  Próximo
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}