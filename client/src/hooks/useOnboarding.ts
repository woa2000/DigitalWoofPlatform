import { useReducer, useEffect, useCallback } from 'react';
import {
  OnboardingState,
  ToneConfiguration,
  LanguageConfiguration,
  BrandValues,
  LogoProcessingResult,
  DEFAULT_TONE_CONFIG,
  DEFAULT_PET_TERMS,
  DEFAULT_DISCLAIMER
} from '@shared/types/onboarding';

// Action types for reducer
type OnboardingAction =
  | { type: 'SET_CURRENT_STEP'; payload: number }
  | { type: 'UPDATE_LOGO_DATA'; payload: LogoProcessingResult }
  | { type: 'UPDATE_TONE_CONFIG'; payload: ToneConfiguration }
  | { type: 'UPDATE_LANGUAGE_CONFIG'; payload: LanguageConfiguration }
  | { type: 'UPDATE_BRAND_VALUES'; payload: BrandValues }
  | { type: 'SET_LOADING'; payload: boolean }
  | { type: 'SET_ERRORS'; payload: Record<string, string> }
  | { type: 'CLEAR_ERRORS' }
  | { type: 'RESET_STATE' }
  | { type: 'LOAD_FROM_STORAGE'; payload: Partial<OnboardingState> };

const ONBOARDING_STORAGE_KEY = 'brand_onboarding_state';
const STEPS = ['logo', 'tone', 'language', 'values', 'preview'] as const;

// Initial state factory
const createInitialState = (): OnboardingState => ({
  currentStep: 0,
  logoData: null,
  toneConfig: DEFAULT_TONE_CONFIG,
  languageConfig: {
    preferredTerms: DEFAULT_PET_TERMS.preferred.slice(0, 5),
    avoidTerms: DEFAULT_PET_TERMS.avoid.slice(0, 3),
    defaultCTAs: DEFAULT_PET_TERMS.ctas.slice(0, 3)
  },
  brandValues: {
    values: [
      { name: "Amor pelos animais", weight: 1.0 },
      { name: "Profissionalismo", weight: 0.9 }
    ],
    disclaimer: DEFAULT_DISCLAIMER
  },
  brandVoiceJson: null,
  isLoading: false,
  errors: {}
});

// Reducer function
function onboardingReducer(state: OnboardingState, action: OnboardingAction): OnboardingState {
  switch (action.type) {
    case 'SET_CURRENT_STEP':
      return { ...state, currentStep: action.payload, errors: {} };
    
    case 'UPDATE_LOGO_DATA':
      return { ...state, logoData: action.payload };
    
    case 'UPDATE_TONE_CONFIG':
      return { ...state, toneConfig: action.payload };
    
    case 'UPDATE_LANGUAGE_CONFIG':
      return { ...state, languageConfig: action.payload };
    
    case 'UPDATE_BRAND_VALUES':
      return { ...state, brandValues: action.payload };
    
    case 'SET_LOADING':
      return { ...state, isLoading: action.payload };
    
    case 'SET_ERRORS':
      return { ...state, errors: action.payload };
    
    case 'CLEAR_ERRORS':
      return { ...state, errors: {} };
    
    case 'RESET_STATE':
      return createInitialState();
    
    case 'LOAD_FROM_STORAGE':
      return { ...state, ...action.payload };
    
    default:
      return state;
  }
}

interface UseOnboardingReturn {
  // State
  currentStep: number;
  state: OnboardingState;
  isLoading: boolean;
  errors: Record<string, string>;
  
  // Navigation
  nextStep: () => void;
  prevStep: () => void;
  goToStep: (step: number) => void;
  canGoNext: boolean;
  canGoPrev: boolean;
  
  // Data management
  updateLogoData: (data: LogoProcessingResult) => void;
  updateToneConfig: (config: ToneConfiguration) => void;
  updateLanguageConfig: (config: LanguageConfiguration) => void;
  updateBrandValues: (values: BrandValues) => void;
  
  // Actions
  saveProgress: () => Promise<void>;
  completWizard: () => Promise<void>;
  resetWizard: () => void;
  
  // Validation
  validateCurrentStep: () => boolean;
  getStepStatus: (stepIndex: number) => 'completed' | 'current' | 'pending';
}

export function useOnboarding(): UseOnboardingReturn {
  // Initialize reducer with state
  const [state, dispatch] = useReducer(onboardingReducer, createInitialState());

  // Load from localStorage on mount
  useEffect(() => {
    const savedState = localStorage.getItem(ONBOARDING_STORAGE_KEY);
    if (savedState) {
      try {
        const parsed = JSON.parse(savedState);
        dispatch({ type: 'LOAD_FROM_STORAGE', payload: parsed });
      } catch (error) {
        console.warn('Failed to parse saved onboarding state:', error);
      }
    }
  }, []);

  // Note: Auto-save disabled to prevent re-render loops
  // Manual save will be implemented later

  // Validation functions (no setState to avoid loops)
  const validateStep = useCallback((stepToValidate: number): { isValid: boolean; errors: Record<string, string> } => {
    const errors: Record<string, string> = {};
    let isValid = true;

    switch (stepToValidate) {
      case 0: // Logo step
        if (!state.logoData?.logoUrl) {
          errors.logo = 'Por favor, faça upload de uma logo';
          isValid = false;
        }
        break;

      case 1: // Tone step
        const { confianca, acolhimento, humor, especializacao } = state.toneConfig;
        if ([confianca, acolhimento, humor, especializacao].some(v => v < 0 || v > 1)) {
          errors.tone = 'Valores de tom devem estar entre 0 e 1';
          isValid = false;
        }
        break;

      case 2: // Language step
        const { preferredTerms, defaultCTAs } = state.languageConfig;
        if (preferredTerms.length === 0) {
          errors.language = 'Adicione pelo menos 1 termo preferido';
          isValid = false;
        }
        if (defaultCTAs.length === 0) {
          errors.language = 'Adicione pelo menos 1 CTA padrão';
          isValid = false;
        }
        break;

      case 3: // Values step
        const { values, disclaimer } = state.brandValues;
        if (values.length === 0) {
          errors.values = 'Adicione pelo menos 1 valor da marca';
          isValid = false;
        }
        if (!disclaimer || disclaimer.length < 10) {
          errors.values = 'Disclaimer deve ter pelo menos 10 caracteres';
          isValid = false;
        }
        break;
    }

    return { isValid, errors };
  }, [state.logoData, state.toneConfig, state.languageConfig, state.brandValues]);

  const validateCurrentStep = useCallback((): boolean => {
    const { isValid, errors } = validateStep(state.currentStep);
    if (!isValid) {
      dispatch({ type: 'SET_ERRORS', payload: errors });
    } else {
      dispatch({ type: 'CLEAR_ERRORS' });
    }
    return isValid;
  }, [state.currentStep, validateStep]);

  // Navigation actions
  const nextStep = useCallback(() => {
    if (state.currentStep < STEPS.length - 1) {
      dispatch({ type: 'SET_CURRENT_STEP', payload: state.currentStep + 1 });
    }
  }, [state.currentStep]);

  const prevStep = useCallback(() => {
    if (state.currentStep > 0) {
      dispatch({ type: 'SET_CURRENT_STEP', payload: state.currentStep - 1 });
    }
  }, [state.currentStep]);

  const goToStep = useCallback((step: number) => {
    if (step >= 0 && step < STEPS.length) {
      dispatch({ type: 'SET_CURRENT_STEP', payload: step });
    }
  }, []);

  // Data update actions
  const updateLogoData = useCallback((data: LogoProcessingResult) => {
    dispatch({ type: 'UPDATE_LOGO_DATA', payload: data });
  }, []);

  const updateToneConfig = useCallback((config: ToneConfiguration) => {
    dispatch({ type: 'UPDATE_TONE_CONFIG', payload: config });
  }, []);

  const updateLanguageConfig = useCallback((config: LanguageConfiguration) => {
    dispatch({ type: 'UPDATE_LANGUAGE_CONFIG', payload: config });
  }, []);

  const updateBrandValues = useCallback((values: BrandValues) => {
    dispatch({ type: 'UPDATE_BRAND_VALUES', payload: values });
  }, []);

  // Async actions
  const saveProgress = useCallback(async () => {
    dispatch({ type: 'SET_LOADING', payload: true });
    try {
      // Implementation for saving progress to backend
      console.log('Saving progress:', state);
    } catch (error) {
      console.error('Failed to save progress:', error);
    } finally {
      dispatch({ type: 'SET_LOADING', payload: false });
    }
  }, [state]);

  const completWizard = useCallback(async () => {
    dispatch({ type: 'SET_LOADING', payload: true });
    try {
      // Implementation for completing wizard
      console.log('Completing wizard with state:', state);
      // TODO: Generate Brand Voice JSON and save to backend
    } catch (error) {
      console.error('Failed to complete wizard:', error);
    } finally {
      dispatch({ type: 'SET_LOADING', payload: false });
    }
  }, [state]);

  const resetWizard = useCallback(() => {
    localStorage.removeItem(ONBOARDING_STORAGE_KEY);
    dispatch({ type: 'RESET_STATE' });
  }, []);

  // Step status computation
  const getStepStatus = useCallback((stepIndex: number): 'completed' | 'current' | 'pending' => {
    if (stepIndex < state.currentStep) return 'completed';
    if (stepIndex === state.currentStep) return 'current';
    return 'pending';
  }, [state.currentStep]);

  // Computed properties
  const canGoNext = state.currentStep < STEPS.length - 1;
  const canGoPrev = state.currentStep > 0;

  return {
    currentStep: state.currentStep,
    state,
    isLoading: state.isLoading,
    errors: state.errors,
    
    nextStep,
    prevStep,
    goToStep,
    canGoNext,
    canGoPrev,
    
    updateLogoData,
    updateToneConfig,
    updateLanguageConfig,
    updateBrandValues,
    
    saveProgress,
    completWizard,
    resetWizard,
    
    validateCurrentStep,
    getStepStatus
  };
}