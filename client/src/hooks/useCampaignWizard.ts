/**
 * Hook para gerenciar o fluxo do Campaign Creation Wizard
 * 
 * Funcionalidades:
 * - Navegação entre 4 steps (Template, Personalize, Configure, Review)
 * - Validação por step impedindo avanço incorreto
 * - Draft saving automático
 * - Progress tracking visual
 * - Estado persistente durante a sessão
 */

import { useState, useEffect, useCallback, useMemo } from 'react';
import { useDebounce } from './useDebounce';

interface Template {
  id: string;
  name: string;
  description: string;
  category: string;
  serviceType: string;
  contentPieces: any[];
  visualAssets: any[];
  isPremium: boolean;
  previewUrl?: string;
  tags: string[];
}

interface PersonalizationConfig {
  brandVoiceId: string;
  intensity: number;
  preserveStructure: boolean;
  adaptVisuals: boolean;
  customizeLanguage: boolean;
  applyBrandColors: boolean;
  adjustTone: boolean;
  includePersonality: boolean;
  customInstructions: string;
}

interface CampaignConfig {
  name: string;
  description: string;
  targetAudience: string;
  channels: string[];
  scheduledDate?: string;
  budget?: number;
  goals: string[];
  kpis: string[];
  tags: string[];
  isActive: boolean;
}

interface ReviewData {
  estimatedPerformance: {
    reach: number;
    engagement: number;
    conversion: number;
    cost: number;
  };
  complianceScore: number;
  personalizedPreview: any;
  recommendations: string[];
  warnings: string[];
}

interface WizardData {
  // Step 1: Template Selection
  selectedTemplate: Template | null;
  
  // Step 2: Personalization
  personalization: PersonalizationConfig;
  
  // Step 3: Campaign Configuration
  campaign: CampaignConfig;
  
  // Step 4: Review
  review: ReviewData | null;
}

interface WizardValidation {
  step1: boolean;
  step2: boolean;
  step3: boolean;
  step4: boolean;
}

interface UseCampaignWizardReturn {
  // Current state
  currentStep: number;
  wizardData: WizardData;
  validation: WizardValidation;
  isLoading: boolean;
  error: string | null;
  isDraftSaved: boolean;
  
  // Navigation
  goToStep: (step: number) => void;
  nextStep: () => void;
  previousStep: () => void;
  canGoNext: boolean;
  canGoPrevious: boolean;
  
  // Data management
  updateTemplate: (template: Template) => void;
  updatePersonalization: (config: Partial<PersonalizationConfig>) => void;
  updateCampaign: (config: Partial<CampaignConfig>) => void;
  
  // Draft management
  saveDraft: () => Promise<void>;
  loadDraft: (draftId: string) => Promise<void>;
  deleteDraft: (draftId: string) => Promise<void>;
  
  // Campaign creation
  createCampaign: () => Promise<string>; // Returns campaign ID
  
  // Review generation
  generateReview: () => Promise<void>;
  
  // Utility
  resetWizard: () => void;
  getStepProgress: () => number;
}

const INITIAL_PERSONALIZATION: PersonalizationConfig = {
  brandVoiceId: '',
  intensity: 50,
  preserveStructure: true,
  adaptVisuals: true,
  customizeLanguage: true,
  applyBrandColors: true,
  adjustTone: true,
  includePersonality: true,
  customInstructions: '',
};

const INITIAL_CAMPAIGN: CampaignConfig = {
  name: '',
  description: '',
  targetAudience: '',
  channels: [],
  goals: [],
  kpis: [],
  tags: [],
  isActive: false,
};

const INITIAL_WIZARD_DATA: WizardData = {
  selectedTemplate: null,
  personalization: INITIAL_PERSONALIZATION,
  campaign: INITIAL_CAMPAIGN,
  review: null,
};

export function useCampaignWizard(): UseCampaignWizardReturn {
  const [currentStep, setCurrentStep] = useState(1);
  const [wizardData, setWizardData] = useState<WizardData>(INITIAL_WIZARD_DATA);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isDraftSaved, setIsDraftSaved] = useState(false);

  // Debounced wizard data for auto-saving
  const debouncedWizardData = useDebounce(wizardData, 2000);

  // Validation per step
  const validation = useMemo<WizardValidation>(() => {
    return {
      step1: !!wizardData.selectedTemplate,
      step2: !!wizardData.personalization.brandVoiceId && 
             wizardData.personalization.intensity > 0,
      step3: wizardData.campaign.name.length > 0 && 
             wizardData.campaign.description.length > 0 &&
             wizardData.campaign.channels.length > 0,
      step4: !!wizardData.review,
    };
  }, [wizardData]);

  // Navigation helpers
  const canGoNext = useMemo(() => {
    switch (currentStep) {
      case 1: return validation.step1;
      case 2: return validation.step2;
      case 3: return validation.step3;
      case 4: return validation.step4;
      default: return false;
    }
  }, [currentStep, validation]);

  const canGoPrevious = currentStep > 1;

  // Navigation functions
  const goToStep = useCallback((step: number) => {
    if (step < 1 || step > 4) return;
    
    // Check if can navigate to this step
    for (let i = 1; i < step; i++) {
      if (!validation[`step${i}` as keyof WizardValidation]) {
        setError(`Você precisa completar o Step ${i} antes de prosseguir`);
        return;
      }
    }
    
    setCurrentStep(step);
    setError(null);
  }, [validation]);

  const nextStep = useCallback(() => {
    if (!canGoNext) return;
    
    // Generate review data when entering step 4
    if (currentStep === 3) {
      generateReview();
    }
    
    goToStep(currentStep + 1);
  }, [currentStep, canGoNext]);

  const previousStep = useCallback(() => {
    if (!canGoPrevious) return;
    goToStep(currentStep - 1);
  }, [currentStep, canGoPrevious]);

  // Data update functions
  const updateTemplate = useCallback((template: Template) => {
    setWizardData(prev => ({
      ...prev,
      selectedTemplate: template,
    }));
  }, []);

  const updatePersonalization = useCallback((config: Partial<PersonalizationConfig>) => {
    setWizardData(prev => ({
      ...prev,
      personalization: {
        ...prev.personalization,
        ...config,
      },
    }));
  }, []);

  const updateCampaign = useCallback((config: Partial<CampaignConfig>) => {
    setWizardData(prev => ({
      ...prev,
      campaign: {
        ...prev.campaign,
        ...config,
      },
    }));
  }, []);

  // Draft management
  const saveDraft = useCallback(async () => {
    if (!wizardData.selectedTemplate) return;

    setIsLoading(true);
    try {
      const response = await fetch('/api/campaigns/drafts', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          wizardData,
          currentStep,
          savedAt: new Date().toISOString(),
        }),
      });

      if (!response.ok) {
        throw new Error('Erro ao salvar draft');
      }

      setIsDraftSaved(true);
      setTimeout(() => setIsDraftSaved(false), 3000); // Reset after 3s
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erro ao salvar draft');
    } finally {
      setIsLoading(false);
    }
  }, [wizardData, currentStep]);

  const loadDraft = useCallback(async (draftId: string) => {
    setIsLoading(true);
    try {
      const response = await fetch(`/api/campaigns/drafts/${draftId}`);
      
      if (!response.ok) {
        throw new Error('Draft não encontrado');
      }

      const draft = await response.json();
      setWizardData(draft.wizardData);
      setCurrentStep(draft.currentStep);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erro ao carregar draft');
    } finally {
      setIsLoading(false);
    }
  }, []);

  const deleteDraft = useCallback(async (draftId: string) => {
    try {
      const response = await fetch(`/api/campaigns/drafts/${draftId}`, {
        method: 'DELETE',
      });

      if (!response.ok) {
        throw new Error('Erro ao deletar draft');
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erro ao deletar draft');
    }
  }, []);

  // Review generation
  const generateReview = useCallback(async () => {
    if (!wizardData.selectedTemplate || !wizardData.personalization.brandVoiceId) {
      return;
    }

    setIsLoading(true);
    try {
      const response = await fetch('/api/campaigns/review', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          templateId: wizardData.selectedTemplate.id,
          personalization: wizardData.personalization,
          campaign: wizardData.campaign,
        }),
      });

      if (!response.ok) {
        throw new Error('Erro ao gerar review');
      }

      const reviewData = await response.json();
      setWizardData(prev => ({
        ...prev,
        review: reviewData,
      }));
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erro ao gerar review');
    } finally {
      setIsLoading(false);
    }
  }, [wizardData.selectedTemplate, wizardData.personalization, wizardData.campaign]);

  // Campaign creation
  const createCampaign = useCallback(async (): Promise<string> => {
    if (!validation.step1 || !validation.step2 || !validation.step3) {
      throw new Error('Wizard incompleto. Complete todos os steps.');
    }

    setIsLoading(true);
    try {
      const response = await fetch('/api/campaigns', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          templateId: wizardData.selectedTemplate!.id,
          personalization: wizardData.personalization,
          campaign: wizardData.campaign,
          review: wizardData.review,
        }),
      });

      if (!response.ok) {
        throw new Error('Erro ao criar campanha');
      }

      const result = await response.json();
      return result.campaignId;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erro ao criar campanha');
      throw err;
    } finally {
      setIsLoading(false);
    }
  }, [wizardData, validation]);

  // Utility functions
  const resetWizard = useCallback(() => {
    setWizardData(INITIAL_WIZARD_DATA);
    setCurrentStep(1);
    setError(null);
    setIsDraftSaved(false);
  }, []);

  const getStepProgress = useCallback(() => {
    let completedSteps = 0;
    if (validation.step1) completedSteps++;
    if (validation.step2) completedSteps++;
    if (validation.step3) completedSteps++;
    if (validation.step4) completedSteps++;
    
    return (completedSteps / 4) * 100;
  }, [validation]);

  // Auto-save drafts
  useEffect(() => {
    if (wizardData.selectedTemplate && debouncedWizardData) {
      saveDraft();
    }
  }, [debouncedWizardData]);

  // Clear error after 5 seconds
  useEffect(() => {
    if (error) {
      const timer = setTimeout(() => setError(null), 5000);
      return () => clearTimeout(timer);
    }
  }, [error]);

  return {
    // Current state
    currentStep,
    wizardData,
    validation,
    isLoading,
    error,
    isDraftSaved,
    
    // Navigation
    goToStep,
    nextStep,
    previousStep,
    canGoNext,
    canGoPrevious,
    
    // Data management
    updateTemplate,
    updatePersonalization,
    updateCampaign,
    
    // Draft management
    saveDraft,
    loadDraft,
    deleteDraft,
    
    // Campaign creation
    createCampaign,
    
    // Review generation
    generateReview,
    
    // Utility
    resetWizard,
    getStepProgress,
  };
}