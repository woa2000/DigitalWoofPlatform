import { useState, useCallback } from 'react';
import { ContentBrief, GeneratedContent, ContentFeedback } from '../types';

const API_BASE_URL = '/api/content';

interface UseContentGenerationOptions {
  includeEngagementPrediction?: boolean;
  variationCount?: number;
}

interface UseContentGenerationReturn {
  isGenerating: boolean;
  error: string | null;
  generateContent: (brief: ContentBrief, brandVoiceId: string, options?: UseContentGenerationOptions) => Promise<GeneratedContent[]>;
  regenerateContent: (contentId: string, feedback?: ContentFeedback) => Promise<GeneratedContent[]>;
  submitFeedback: (feedback: ContentFeedback) => Promise<void>;
  getContentHistory: () => Promise<GeneratedContent[]>;
}

export const useContentGeneration = (): UseContentGenerationReturn => {
  const [isGenerating, setIsGenerating] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const generateContent = useCallback(async (
    brief: ContentBrief, 
    brandVoiceId: string, 
    options?: UseContentGenerationOptions
  ): Promise<GeneratedContent[]> => {
    setIsGenerating(true);
    setError(null);

    try {
      const response = await fetch(`${API_BASE_URL}/generate`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          ...brief,
          brand_voice_id: brandVoiceId,
          options: {
            include_engagement_prediction: options?.includeEngagementPrediction ?? true,
            variation_count: options?.variationCount ?? 3,
          },
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to generate content');
      }

      const result = await response.json();
      return Array.isArray(result) ? result : [result];
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Unknown error occurred';
      setError(errorMessage);
      throw err;
    } finally {
      setIsGenerating(false);
    }
  }, []);

  const regenerateContent = useCallback(async (
    contentId: string, 
    feedback?: ContentFeedback
  ): Promise<GeneratedContent[]> => {
    setIsGenerating(true);
    setError(null);

    try {
      const response = await fetch(`${API_BASE_URL}/${contentId}/regenerate`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ feedback }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to regenerate content');
      }

      const result = await response.json();
      return Array.isArray(result) ? result : [result];
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Unknown error occurred';
      setError(errorMessage);
      throw err;
    } finally {
      setIsGenerating(false);
    }
  }, []);

  const submitFeedback = useCallback(async (feedback: ContentFeedback): Promise<void> => {
    try {
      const response = await fetch(`${API_BASE_URL}/feedback`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(feedback),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to submit feedback');
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Unknown error occurred';
      setError(errorMessage);
      throw err;
    }
  }, []);

  const getContentHistory = useCallback(async (): Promise<GeneratedContent[]> => {
    try {
      const response = await fetch(`${API_BASE_URL}/history`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to fetch content history');
      }

      return await response.json();
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Unknown error occurred';
      setError(errorMessage);
      throw err;
    }
  }, []);

  return {
    isGenerating,
    error,
    generateContent,
    regenerateContent,
    submitFeedback,
    getContentHistory,
  };
};