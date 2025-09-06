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
}

// Use the real components
export function LogoUploadStep({ state, onNext, onPrevious, errors, isLoading, updateLogoData }: StepProps) {
  return (
    <RealLogoUploadStep
      stepNumber={1}
      onNext={onNext}
      onPrevious={onPrevious}
      isCompleted={!!state.logoData}
      updateLogoData={updateLogoData}
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
    <RealPreviewStep
      stepNumber={5}
      onNext={onNext}
      onPrevious={onPrevious}
      isCompleted={!!state.brandVoiceJson}
      wizardData={state}
    />
  );
}