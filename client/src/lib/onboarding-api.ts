import { OnboardingState, LogoProcessingResult, ToneConfiguration, LanguageConfiguration, BrandValues } from '@shared/types/onboarding';

const API_BASE = '/api';

export interface OnboardingApiResponse<T = any> {
  success: boolean;
  data?: T;
  error?: string;
}

export class OnboardingApiClient {
  private userId: string;

  constructor(userId: string) {
    this.userId = userId;
  }

  // Get existing onboarding data
  async getOnboardingData(): Promise<OnboardingApiResponse<OnboardingState>> {
    try {
      const response = await fetch(`${API_BASE}/onboarding/${this.userId}`);
      const data = await response.json();

      if (!response.ok) {
        console.warn('Backend error, falling back to localStorage:', data.error);
        return { success: false, error: data.error || 'Failed to fetch onboarding data' };
      }

      return { success: true, data: this.transformFromBackend(data.data) };
    } catch (error) {
      console.warn('Network error, falling back to localStorage:', error);
      return { success: false, error: 'Network error' };
    }
  }

  // Get onboarding progress
  async getProgress(): Promise<OnboardingApiResponse<any>> {
    try {
      const response = await fetch(`${API_BASE}/onboarding/${this.userId}/progress`);
      const data = await response.json();

      if (!response.ok) {
        return { success: false, error: data.error || 'Failed to fetch progress' };
      }

      return { success: true, data: data.data };
    } catch (error) {
      console.error('Error fetching progress:', error);
      return { success: false, error: 'Network error' };
    }
  }

  // Save onboarding data (create or update)
  async saveOnboardingData(onboardingData: Partial<OnboardingState>): Promise<OnboardingApiResponse> {
    try {
      const transformedData = this.transformToBackend(onboardingData);
      const response = await fetch(`${API_BASE}/onboarding/${this.userId}/upsert`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(transformedData),
      });

      const data = await response.json();

      if (!response.ok) {
        return { success: false, error: data.error || 'Failed to save onboarding data' };
      }

      return { success: true, data: data.data };
    } catch (error) {
      console.error('Error saving onboarding data:', error);
      return { success: false, error: 'Network error' };
    }
  }

  // Update step progress
  async updateStep(step: string): Promise<OnboardingApiResponse> {
    try {
      const response = await fetch(`${API_BASE}/onboarding/${this.userId}/step/${step}`, {
        method: 'POST',
      });

      const data = await response.json();

      if (!response.ok) {
        return { success: false, error: data.error || 'Failed to update step' };
      }

      return { success: true, data: data.data };
    } catch (error) {
      console.error('Error updating step:', error);
      return { success: false, error: 'Network error' };
    }
  }

  // Complete onboarding
  async completeOnboarding(): Promise<OnboardingApiResponse> {
    try {
      const response = await fetch(`${API_BASE}/onboarding/${this.userId}/complete`, {
        method: 'POST',
      });

      const data = await response.json();

      if (!response.ok) {
        return { success: false, error: data.error || 'Failed to complete onboarding' };
      }

      return { success: true, data: data.data };
    } catch (error) {
      console.error('Error completing onboarding:', error);
      return { success: false, error: 'Network error' };
    }
  }

  // Get Brand Voice JSON
  async getBrandVoiceJson(): Promise<OnboardingApiResponse> {
    try {
      const response = await fetch(`${API_BASE}/onboarding/${this.userId}/brand-voice-json`);
      const data = await response.json();

      if (!response.ok) {
        return { success: false, error: data.error || 'Failed to generate Brand Voice JSON' };
      }

      return { success: true, data: data.data };
    } catch (error) {
      console.error('Error generating Brand Voice JSON:', error);
      return { success: false, error: 'Network error' };
    }
  }

  // Upload logo
  async uploadLogo(file: File): Promise<OnboardingApiResponse<LogoProcessingResult>> {
    try {
      const formData = new FormData();
      formData.append('logo', file);

      const response = await fetch(`${API_BASE}/storage/logo/${this.userId}`, {
        method: 'POST',
        body: formData,
      });

      const data = await response.json();

      if (!response.ok) {
        return { success: false, error: data.error || 'Failed to upload logo' };
      }

      return { success: true, data: data.data };
    } catch (error) {
      console.error('Error uploading logo:', error);
      return { success: false, error: 'Network error' };
    }
  }

  // Transform backend data to frontend format
  private transformFromBackend(backendData: any): OnboardingState {
    return {
      currentStep: this.getStepIndex(backendData.stepCompleted || 'logo'),
      logoData: backendData.logoUrl ? {
        logoUrl: backendData.logoUrl,
        palette: backendData.palette || [],
        metadata: backendData.logoMetadata || null
      } : null,
      toneConfig: backendData.toneConfig || {
        confianca: 0.8,
        acolhimento: 0.7,
        humor: 0.3,
        especializacao: 0.9
      },
      languageConfig: backendData.languageConfig || {
        preferredTerms: [],
        avoidTerms: [],
        defaultCTAs: []
      },
      brandValues: backendData.brandValues || {
        values: [],
        disclaimer: ''
      },
      brandVoiceJson: null,
      isLoading: false,
      errors: {}
    };
  }

  // Transform frontend data to backend format
  private transformToBackend(frontendData: Partial<OnboardingState>): any {
    const backendData: any = {};

    if (frontendData.logoData) {
      backendData.logoUrl = frontendData.logoData.logoUrl;
      backendData.palette = frontendData.logoData.palette;
      backendData.logoMetadata = frontendData.logoData.metadata;
    }

    if (frontendData.toneConfig) {
      backendData.toneConfig = frontendData.toneConfig;
    }

    if (frontendData.languageConfig) {
      backendData.languageConfig = frontendData.languageConfig;
    }

    if (frontendData.brandValues) {
      backendData.brandValues = frontendData.brandValues;
    }

    return backendData;
  }

  // Convert step name to index
  private getStepIndex(step: string): number {
    const stepMap: { [key: string]: number } = {
      'logo': 0,
      'palette': 0, // Logo and palette are combined
      'tone': 1,
      'language': 2,
      'values': 3,
      'completed': 4
    };
    return stepMap[step] || 0;
  }
}

export const createOnboardingApiClient = (userId: string) => new OnboardingApiClient(userId);