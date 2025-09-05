import { useState, useCallback } from 'react';

interface SimpleOnboardingState {
  currentStep: number;
  errors: Record<string, string>;
}

interface UseSimpleOnboardingReturn {
  currentStep: number;
  errors: Record<string, string>;
  nextStep: () => void;
  prevStep: () => void;
  canGoNext: boolean;
  canGoPrev: boolean;
  getStepStatus: (stepIndex: number) => 'completed' | 'current' | 'pending';
}

const TOTAL_STEPS = 5;

export function useSimpleOnboarding(): UseSimpleOnboardingReturn {
  const [state, setState] = useState<SimpleOnboardingState>({
    currentStep: 0,
    errors: {}
  });

  const nextStep = useCallback(() => {
    setState(prev => ({
      ...prev,
      currentStep: Math.min(prev.currentStep + 1, TOTAL_STEPS - 1),
      errors: {}
    }));
  }, []);

  const prevStep = useCallback(() => {
    setState(prev => ({
      ...prev,
      currentStep: Math.max(prev.currentStep - 1, 0),
      errors: {}
    }));
  }, []);

  const getStepStatus = useCallback((stepIndex: number): 'completed' | 'current' | 'pending' => {
    if (stepIndex < state.currentStep) return 'completed';
    if (stepIndex === state.currentStep) return 'current';
    return 'pending';
  }, [state.currentStep]);

  return {
    currentStep: state.currentStep,
    errors: state.errors,
    nextStep,
    prevStep,
    canGoNext: state.currentStep < TOTAL_STEPS - 1,
    canGoPrev: state.currentStep > 0,
    getStepStatus
  };
}