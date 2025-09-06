import { useReducer, useEffect, useCallback } from 'react';
import { useLocation } from 'wouter';
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
import { createOnboardingApiClient } from '@/lib/onboarding-api';

// Action types for reducer
type OnboardingAction =
  | { type: 'SET_CURRENT_STEP'; payload: number }
  | { type: 'UPDATE_LOGO_DATA'; payload: LogoProcessingResult }
  | { type: 'UPDATE_TONE_CONFIG'; payload: ToneConfiguration }
  | { type: 'UPDATE_LANGUAGE_CONFIG'; payload: LanguageConfiguration }
  | { type: 'UPDATE_BRAND_VALUES'; payload: BrandValues }
  | { type: 'UPDATE_BRAND_VOICE_JSON'; payload: any }
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

    case 'UPDATE_BRAND_VOICE_JSON':
      return { ...state, brandVoiceJson: action.payload };

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

export function useOnboarding(userId?: string): UseOnboardingReturn {
  // Initialize reducer with state
  const [state, dispatch] = useReducer(onboardingReducer, createInitialState());
  
  // Navigation hook
  const [, setLocation] = useLocation();

  // API client
  const apiClient = userId ? createOnboardingApiClient(userId) : null;

  // Load from backend or localStorage on mount
  useEffect(() => {
    const loadOnboardingData = async () => {
      if (apiClient) {
        // Try to load from backend first
        const result = await apiClient.getOnboardingData();
        if (result.success && result.data) {
          dispatch({ type: 'LOAD_FROM_STORAGE', payload: result.data });
          return;
        }
      }

      // Fallback to localStorage
      const savedState = localStorage.getItem(ONBOARDING_STORAGE_KEY);
      if (savedState) {
        try {
          const parsed = JSON.parse(savedState);
          dispatch({ type: 'LOAD_FROM_STORAGE', payload: parsed });
        } catch (error) {
          console.warn('Failed to parse saved onboarding state:', error);
        }
      }
    };

    loadOnboardingData();
  }, [apiClient]);

  // Validation function without useCallback to avoid dependency issues
  const validateStep = (stepToValidate: number, currentState = state): { isValid: boolean; errors: Record<string, string> } => {
    const errors: Record<string, string> = {};
    let isValid = true;

    switch (stepToValidate) {
      case 0: // Logo step
        if (!currentState.logoData?.logoUrl) {
          errors.logo = 'Por favor, faça upload de uma logo';
          isValid = false;
        }
        break;

      case 1: // Tone step
        const { confianca, acolhimento, humor, especializacao } = currentState.toneConfig;
        if ([confianca, acolhimento, humor, especializacao].some(v => v < 0 || v > 1)) {
          errors.tone = 'Valores de tom devem estar entre 0 e 1';
          isValid = false;
        }
        break;

      case 2: // Language step
        const { preferredTerms, defaultCTAs } = currentState.languageConfig;
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
        const { values, disclaimer } = currentState.brandValues;
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
  };

  const validateCurrentStep = (): boolean => {
    const { isValid, errors } = validateStep(state.currentStep, state);
    
    if (!isValid) {
      dispatch({ type: 'SET_ERRORS', payload: errors });
    } else {
      dispatch({ type: 'CLEAR_ERRORS' });
    }
    return isValid;
  };

  // Navigation actions
  const nextStep = async () => {
    if (state.currentStep < STEPS.length - 1) {
      dispatch({ type: 'SET_CURRENT_STEP', payload: state.currentStep + 1 });
      // Auto-save progress when moving to next step
      if (apiClient) {
        await saveProgress();
      }
    }
  };

  const prevStep = async () => {
    if (state.currentStep > 0) {
      dispatch({ type: 'SET_CURRENT_STEP', payload: state.currentStep - 1 });
      // Auto-save progress when moving to previous step
      if (apiClient) {
        await saveProgress();
      }
    }
  };

  const goToStep = (step: number) => {
    if (step >= 0 && step < STEPS.length) {
      dispatch({ type: 'SET_CURRENT_STEP', payload: step });
    }
  };

  // Data update actions
  const updateLogoData = (data: LogoProcessingResult) => {
    dispatch({ type: 'UPDATE_LOGO_DATA', payload: data });
  };

  const updateToneConfig = (config: ToneConfiguration) => {
    dispatch({ type: 'UPDATE_TONE_CONFIG', payload: config });
  };

  const updateLanguageConfig = (config: LanguageConfiguration) => {
    dispatch({ type: 'UPDATE_LANGUAGE_CONFIG', payload: config });
  };

  const updateBrandValues = (values: BrandValues) => {
    dispatch({ type: 'UPDATE_BRAND_VALUES', payload: values });
  };

  // Async actions
  const saveProgress = async () => {
    dispatch({ type: 'SET_LOADING', payload: true });
    try {
      if (apiClient) {
        // Save to backend
        const result = await apiClient.saveOnboardingData(state);
        if (!result.success) {
          dispatch({ type: 'SET_ERRORS', payload: { general: result.error || 'Failed to save progress' } });
          return;
        }
      }

      // Also save to localStorage as backup
      localStorage.setItem(ONBOARDING_STORAGE_KEY, JSON.stringify(state));
    } catch (error) {
      console.error('Failed to save progress:', error);
      dispatch({ type: 'SET_ERRORS', payload: { general: 'Failed to save progress' } });
    } finally {
      dispatch({ type: 'SET_LOADING', payload: false });
    }
  };

  const completWizard = async () => {
    dispatch({ type: 'SET_LOADING', payload: true });
    try {
      if (apiClient) {
        // Complete onboarding on backend
        const result = await apiClient.completeOnboarding();
        if (!result.success) {
          dispatch({ type: 'SET_ERRORS', payload: { general: result.error || 'Failed to complete onboarding' } });
          return;
        }

        // Get the generated Brand Voice JSON
        const brandVoiceResult = await apiClient.getBrandVoiceJson();
        if (brandVoiceResult.success) {
          dispatch({ type: 'UPDATE_BRAND_VOICE_JSON', payload: brandVoiceResult.data });
        }
      }

      // Clear localStorage on successful completion
      localStorage.removeItem(ONBOARDING_STORAGE_KEY);
      
      // Navigate to dashboard after completion
      setLocation('/');
    } catch (error) {
      console.error('Failed to complete wizard:', error);
      dispatch({ type: 'SET_ERRORS', payload: { general: 'Failed to complete onboarding' } });
    } finally {
      dispatch({ type: 'SET_LOADING', payload: false });
    }
  };

  const resetWizard = () => {
    localStorage.removeItem(ONBOARDING_STORAGE_KEY);
    dispatch({ type: 'RESET_STATE' });
  };

  // Step status computation
  const getStepStatus = (stepIndex: number): 'completed' | 'current' | 'pending' => {
    if (stepIndex < state.currentStep) return 'completed';
    if (stepIndex === state.currentStep) return 'current';
    return 'pending';
  };

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