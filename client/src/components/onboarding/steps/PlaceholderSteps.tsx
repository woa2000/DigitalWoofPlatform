import React from 'react';
import { OnboardingState, ToneConfiguration, LanguageConfiguration, BrandValues, LogoProcessingResult } from '@shared/types/onboarding';
import { ToneConfigStep as RealToneConfigStep } from './ToneConfigStep';
import { LanguageConfigStep as RealLanguageConfigStep } from './LanguageConfigStep';
import { BrandValuesStep as RealBrandValuesStep } from './BrandValuesStep';
import { LogoUploadStep as RealLogoUploadStep } from './LogoUploadStep';
import { PreviewStep as RealPreviewStep } from './PreviewStep';

interface StepProps {
  state: OnboardingState;
  onNext: (data?: any) => void;
  onPrevious: () => void;
  errors: Record<string, string>;
  isLoading: boolean;
  updateLogoData?: (data: LogoProcessingResult) => void;
  updateToneConfig?: (config: ToneConfiguration) => void;
  updateLanguageConfig?: (config: LanguageConfiguration) => void;
  updateBrandValues?: (values: BrandValues) => void;
  userId?: string;
}

// Use the real components
export function LogoUploadStep({ state, onNext, onPrevious, errors, isLoading, updateLogoData, userId }: StepProps) {
  return (
    <RealLogoUploadStep
      stepNumber={1}
      onNext={onNext}
      onPrevious={onPrevious}
      isCompleted={!!state.logoData}
      updateLogoData={updateLogoData}
      userId={userId}
    />
  );
}

export function ToneConfigStep(props: StepProps) {
  return <RealToneConfigStep {...props} updateToneConfig={props.updateToneConfig} />;
}

export function LanguageConfigStep(props: StepProps) {
  return <RealLanguageConfigStep {...props} updateLanguageConfig={props.updateLanguageConfig} />;
}

export function BrandValuesStep(props: StepProps) {
  return <RealBrandValuesStep {...props} updateBrandValues={props.updateBrandValues} />;
}

export function PreviewStep({ state, onNext, onPrevious, errors, isLoading }: StepProps) {
  return (
    <div className="space-y-4">
      {/* Informational banner about final save */}
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
        <div className="flex items-center space-x-2">
          <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
            <span className="text-blue-600 font-semibold text-sm">💾</span>
          </div>
          <div>
            <p className="font-medium text-blue-900">Revisão Final</p>
            <p className="text-sm text-blue-700">
              Revise todas as informações abaixo. Ao clicar em "Finalizar e Salvar", 
              todos os dados serão enviados para o servidor e sua identidade de marca será criada.
            </p>
          </div>
        </div>
      </div>

      <RealPreviewStep
        stepNumber={5}
        onNext={onNext}
        onPrevious={onPrevious}
        isCompleted={!!state.brandVoiceJson}
        wizardData={state}
      />
    </div>
  );
}