/**
 * TypeScript types for Brand Voice JSON v1.0
 * 
 * Auto-generated from Zod schema
 * Used across the application for type safety
 * 
 * @version 1.0
 * @generated-from shared/schemas/brand-voice.ts
 */

import type {
  BrandVoice,
  BrandVoiceUpdate,
  BrandVoiceCreate
} from '../schemas/brand-voice';

// Re-export types
export type {
  BrandVoice,
  BrandVoiceUpdate,
  BrandVoiceCreate
};

// Re-export utility functions for convenience
export {
  BrandVoiceSchema,
  BrandVoiceUpdateSchema,
  BrandVoiceCreateSchema,
  validateBrandVoice,
  validateBrandVoiceUpdate,
  getDefaultBrandVoice,
  isCompatibleVersion,
  migrateToLatestVersion
} from '../schemas/brand-voice';

// Additional types for API responses
export interface BrandVoiceGenerationRequest {
  anamnesisAnalysisId?: string;
  onboardingSessionId?: string;
  manualOverrides?: Partial<BrandVoice>;
}

export interface BrandVoiceGenerationResponse {
  success: true;
  data: {
    id: string;
    version: string;
    brandVoiceJson: BrandVoice;
    qualityMetrics: QualityMetrics;
    status: 'active' | 'draft';
    createdAt: string;
  };
}

export interface BrandVoiceActiveResponse {
  success: true;
  data: {
    brandVoice: BrandVoice;
    metadata: {
      version: string;
      lastUpdated: string;
      qualityScore: number;
    };
  };
}

export interface BrandVoiceActivationResponse {
  success: true;
  data: {
    id: string;
    version: string;
    activated: true;
    previousVersion?: string;
  };
}

// Quality metrics type
export interface QualityMetrics {
  completeness_score: number;
  consistency_score: number;
  specificity_score: number;
  usability_score: number;
  last_validated: string;
}

// Database entity types
export interface BrandVoiceEntity {
  id: string;
  userId: string;
  accountId: string;
  brandVoiceJson: BrandVoice;
  version: string;
  brandName: string;
  segment: string;
  completenessScore: number;
  consistencyScore: number;
  specificityScore: number;
  usabilityScore: number;
  status: 'draft' | 'active' | 'deprecated';
  isActive: boolean;
  anamnesisAnalysisId?: string;
  onboardingSessionId?: string;
  createdAt: Date;
  updatedAt: Date;
  activatedAt?: Date;
}

// Enums for better type safety
export const BusinessSegments = [
  'veterinaria',
  'petshop', 
  'banho_tosa',
  'hotel_pet',
  'agropet'
] as const;

export const BusinessTypes = [
  'clinica',
  'comercio',
  'servico',
  'misto'
] as const;

export const CommunicationStyles = [
  'conversational',
  'professional',
  'friendly',
  'authoritative'
] as const;

export const ToneAdjustmentRange = {
  min: -0.5,
  max: 0.5
} as const;

// Type guards
export const isBrandVoice = (obj: any): obj is BrandVoice => {
  return typeof obj === 'object' && 
         obj !== null && 
         obj.$schema === 'https://digitalwoof.com/schemas/brand-voice/v1.0.json' &&
         obj.version === '1.0';
};

export const isValidSegment = (segment: string): segment is BrandVoice['brand']['segment'] => {
  return BusinessSegments.includes(segment as any);
};

export const isValidBusinessType = (type: string): type is BrandVoice['brand']['businessType'] => {
  return BusinessTypes.includes(type as any);
};

// Utility types for partial updates
export type BrandSection = BrandVoice['brand'];
export type VisualSection = BrandVoice['visual'];
export type VoiceSection = BrandVoice['voice'];
export type ComplianceSection = BrandVoice['compliance'];
export type ChannelsSection = BrandVoice['channels'];
export type MetadataSection = BrandVoice['metadata'];

// API error types
export interface BrandVoiceError {
  success: false;
  error: {
    code: string;
    message: string;
    details?: any;
  };
}

// Generation context types
export interface GenerationContext {
  userId: string;
  accountId: string;
  source: 'anamnesis' | 'onboarding' | 'manual' | 'mixed';
  timestamp: string;
}

// Cache types
export interface BrandVoiceCacheEntry {
  brandVoice: BrandVoice;
  metadata: {
    userId: string;
    version: string;
    cachedAt: number;
    expiresAt: number;
  };
}

// Version history types
export interface VersionHistoryEntry {
  version: string;
  date: string;
  changes: string;
  created_by: string;
}

// Prompt building types
export interface PromptContext {
  contentType: 'social_post' | 'email' | 'blog' | 'ad_copy' | 'customer_service';
  channel?: 'instagram' | 'facebook' | 'whatsapp' | 'email' | 'website';
  audience?: 'primary' | 'secondary';
  campaign?: string;
  urgency?: 'low' | 'medium' | 'high';
}

export interface GeneratedPrompt {
  systemPrompt: string;
  userPrompt: string;
  context: PromptContext;
  brandVoiceVersion: string;
  metadata: {
    tone: VoiceSection['tone'];
    lexicon: VoiceSection['lexicon'];
    compliance: ComplianceSection;
  };
}