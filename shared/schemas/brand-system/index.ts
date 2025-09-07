// Re-exportações centralizadas do sistema de marca
export * from './brand.schema';

// Tipos combinados úteis
export type BrandOnboardingWithVoice = {
  onboarding: typeof import('./brand.schema').brandOnboardingTable.$inferSelect;
  brandVoice?: typeof import('./brand.schema').brandVoiceJsonsTable.$inferSelect;
};

export type CompleteBrandSetup = {
  onboarding: typeof import('./brand.schema').brandOnboardingTable.$inferSelect;
  brandVoice: typeof import('./brand.schema').brandVoiceJsonsTable.$inferSelect;
  tenant: typeof import('../tenant-system/tenants.schema').tenantsTable.$inferSelect;
};

// Constantes úteis
export const ONBOARDING_STAGES = [
  'basic_info',
  'audience', 
  'goals',
  'competitors',
  'voice',
  'assets',
  'completed'
] as const;

export const ONBOARDING_STATUSES = [
  'draft',
  'in_progress', 
  'review',
  'completed',
  'archived'
] as const;

export const BRAND_VOICE_STATUSES = [
  'draft',
  'active',
  'archived',
  'deprecated'
] as const;

export const BRAND_VOICE_GENERATORS = [
  'manual',
  'ai_assisted',
  'imported'
] as const;

// Helpers para cálculo de progresso
export const STAGE_WEIGHTS = {
  basic_info: 15,
  audience: 20,
  goals: 15,
  competitors: 10,
  voice: 25,
  assets: 15,
} as const;

export const calculateOnboardingProgress = (completedSteps: string[]) => {
  return completedSteps.reduce((total, step) => {
    return total + (STAGE_WEIGHTS[step as keyof typeof STAGE_WEIGHTS] || 0);
  }, 0);
};