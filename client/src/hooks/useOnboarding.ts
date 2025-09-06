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
    saveProgressLocally: () => Promise<void>;
    completWizard: () => Promise<void>;
    resetWizard: () => void;
  
  // Validation
  validateCurrentStep: () => boolean;
  validateAndNextStep: () => Promise<boolean>;
  getStepStatus: (stepIndex: number) => 'completed' | 'current' | 'pending';
}

export function useOnboarding(userId?: string): UseOnboardingReturn {
  // Initialize reducer with state
  const [state, dispatch] = useReducer(onboardingReducer, createInitialState());
  
  // Navigation hook
  const [, setLocation] = useLocation();

  // API client
  const apiClient = userId ? createOnboardingApiClient(userId) : null;

    // Load state from localStorage on mount (no BD loading)
  useEffect(() => {
    try {
      const savedState = localStorage.getItem(ONBOARDING_STORAGE_KEY);
      if (savedState) {
        const parsed = JSON.parse(savedState);
        dispatch({ type: 'LOAD_FROM_STORAGE', payload: parsed });
      }
    } catch (error) {
      console.warn('Failed to load onboarding state from localStorage:', error);
      // Continue with fresh default state
    }
  }, []);

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

  // New function to validate and move to next step
  const validateAndNextStep = async (): Promise<boolean> => {
    const isValid = validateCurrentStep();
    if (isValid) {
      await nextStep();
      return true;
    }
    return false;
  };

  // Navigation actions
  const nextStep = async () => {
    if (state.currentStep < STEPS.length - 1) {
      dispatch({ type: 'SET_CURRENT_STEP', payload: state.currentStep + 1 });
      // Remove auto-save - only save on completion
    }
  };

  const prevStep = async () => {
    if (state.currentStep > 0) {
      dispatch({ type: 'SET_CURRENT_STEP', payload: state.currentStep - 1 });
      // Remove auto-save - only save on completion
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

  // Save progress to localStorage only (no backend save until completion)
  const saveProgressLocally = async () => {
    try {
      localStorage.setItem(ONBOARDING_STORAGE_KEY, JSON.stringify(state));
      console.log('💾 Progress saved locally');
    } catch (error) {
      console.error('Failed to save progress locally:', error);
    }
  };

  // Auto-save to localStorage when state changes
  useEffect(() => {
    if (state.currentStep > 0 || state.logoData || Object.keys(state.errors).length === 0) {
      saveProgressLocally();
    }
  }, [state]);

  const completWizard = async () => {
    // Validate current step before proceeding
    if (!validateCurrentStep()) {
      return;
    }

    dispatch({ type: 'SET_LOADING', payload: true });
    
    try {
      // Prepare final brand voice data for single save
      const finalBrandVoiceData = {
        logoData: state.logoData,
        toneConfig: state.toneConfig,
        languageConfig: state.languageConfig,
        brandValues: state.brandValues,
        metadata: {
          completedAt: new Date().toISOString(),
          version: '1.0',
          userId: userId || 'current-user'
        }
      };

      // Single save to database (no incremental saves)
      if (apiClient) {
        const saveResult = await apiClient.saveOnboardingData(finalBrandVoiceData);
        if (!saveResult.success) {
          throw new Error(saveResult.error || 'Falha ao salvar dados no servidor');
        }

        // Generate Brand Voice JSON
        const brandVoiceResult = await apiClient.getBrandVoiceJson();
        if (brandVoiceResult.success) {
          dispatch({ type: 'UPDATE_BRAND_VOICE_JSON', payload: brandVoiceResult.data });
        }
      } else {
        // Fallback: save to localStorage as backup
        localStorage.setItem('brand_voice_backup', JSON.stringify(finalBrandVoiceData));
        console.warn('No API client available, saved to localStorage backup');
      }

      // Clear temporary localStorage
      localStorage.removeItem(ONBOARDING_STORAGE_KEY);
      
      // Navigate immediately to dashboard
      setLocation('/');
      
    } catch (error) {
      console.error('Failed to save onboarding data:', error);
      dispatch({ 
        type: 'SET_ERRORS', 
        payload: { general: 'Erro ao salvar dados. Verifique sua conexão e tente novamente.' } 
      });
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
    
    saveProgressLocally,
    completWizard,
    resetWizard,
    
    validateCurrentStep,
    validateAndNextStep,
    getStepStatus
  };
}