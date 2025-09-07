// 🎯 Digital Woof Platform - Shared Types & Schemas
// Centralização de todos os tipos e schemas da plataforma

// ==========================================
// 📋 SCHEMAS - Drizzle ORM + Zod Validation
// ==========================================

// Sistema de Tenants (Multi-tenancy)
export * from './schemas/tenant-system';

// Sistema de Marca (Brand Voice, Onboarding)
export * from './schemas/brand-system';

// Sistema de Campanhas (Templates, Performance)
// export * from './schemas/campaign-system';

// Sistema de IA e Conteúdo (Prompts, Geração, Feedback)
// export * from './schemas/ai-content';

// Sistema de Assets (Biblioteca Visual, Coleções)
// export * from './schemas/assets';

// Sistema de Anamnese (Análise, Insights, Business)
export * from './schemas/anamnesis';

// ==========================================
// 🔧 TYPES - TypeScript Interfaces
// ==========================================

// Tipos do Sistema de Tenants
// export * from './types/tenant-system';

// Tipos do Sistema de Marca
// export * from './types/brand-system';

// Tipos do Sistema de Campanhas
// export * from './types/campaign-system';

// Tipos do Sistema de IA e Conteúdo
// export * from './types/ai-content';

// Tipos do Sistema de Assets
// export * from './types/assets';

// Tipos do Sistema de Anamnese
// export * from './types/anamnesis';

// ==========================================
// 🌟 UTILITIES & HELPERS
// ==========================================

// Tipos utilitários comuns
export type UUID = string;
export type JSONValue = string | number | boolean | null | JSONValue[] | { [key: string]: JSONValue };
export type Timestamp = Date;

// Status comuns utilizados em toda a plataforma
export type CommonStatus = 'active' | 'inactive' | 'pending' | 'archived';
export type ProcessingStatus = 'pending' | 'processing' | 'completed' | 'failed';
export type ApprovalStatus = 'pending' | 'approved' | 'rejected' | 'needs_revision';
export type Priority = 'low' | 'medium' | 'high' | 'urgent';

// Tipos para paginação
export interface PaginationParams {
  page: number;
  limit: number;
  offset?: number;
}

export interface PaginatedResponse<T> {
  data: T[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
    hasNext: boolean;
    hasPrev: boolean;
  };
}

// Tipos para filtros
export interface BaseFilters {
  startDate?: Date;
  endDate?: Date;
  status?: string[];
  tags?: string[];
  createdBy?: string;
  updatedAfter?: Date;
}

// Tipos para ordenação
export interface SortParams {
  field: string;
  direction: 'asc' | 'desc';
}

// Tipos para resposta de API
export interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  error?: {
    code: string;
    message: string;
    details?: any;
  };
  metadata?: {
    timestamp: Date;
    requestId: string;
    version: string;
  };
}

// Tipos para validação
export interface ValidationError {
  field: string;
  message: string;
  code: string;
}

export interface ValidationResult {
  isValid: boolean;
  errors: ValidationError[];
  warnings: ValidationError[];
}

// Tipos para uploads
export interface FileUpload {
  file: File;
  name?: string;
  description?: string;
  metadata?: Record<string, any>;
}

export interface UploadProgress {
  loaded: number;
  total: number;
  percentage: number;
  speed?: number;
  eta?: number;
}

// Tipos para notificações
export interface Notification {
  id: string;
  type: 'info' | 'success' | 'warning' | 'error';
  title: string;
  message: string;
  timestamp: Date;
  read: boolean;
  actionUrl?: string;
  actionText?: string;
}

// Tipos para configurações
export interface SystemSettings {
  maintenance: {
    enabled: boolean;
    message?: string;
    estimatedEnd?: Date;
  };
  features: {
    aiContent: boolean;
    campaigns: boolean;
    assets: boolean;
    anamnesis: boolean;
    collaboration: boolean;
  };
  limits: {
    maxFileSize: number;
    maxCampaignsPerTenant: number;
    maxUsersPerTenant: number;
    aiRequestsPerDay: number;
  };
  integrations: {
    openai: {
      enabled: boolean;
      models: string[];
    };
    socialMedia: {
      instagram: boolean;
      facebook: boolean;
      twitter: boolean;
      linkedin: boolean;
      tiktok: boolean;
    };
    storage: {
      provider: 'local' | 'aws' | 'gcp' | 'azure';
      bucket?: string;
      region?: string;
    };
  };
}

// ==========================================
// 📊 ANALYTICS & METRICS
// ==========================================

export interface MetricValue {
  value: number;
  unit?: string;
  change?: {
    value: number;
    percentage: number;
    period: string;
  };
}

export interface TimeSeriesData {
  timestamp: Date;
  value: number;
  metadata?: Record<string, any>;
}

export interface AnalyticsData {
  metrics: Record<string, MetricValue>;
  timeSeries: Record<string, TimeSeriesData[]>;
  segments: Record<string, Record<string, number>>;
  period: {
    start: Date;
    end: Date;
  };
}

// ==========================================
// 🔄 EVENTS & WEBHOOKS
// ==========================================

export interface SystemEvent {
  id: string;
  type: string;
  source: string;
  timestamp: Date;
  data: Record<string, any>;
  metadata?: {
    userId?: string;
    tenantId?: string;
    sessionId?: string;
    userAgent?: string;
    ip?: string;
  };
}

export interface WebhookEvent {
  id: string;
  event: string;
  data: Record<string, any>;
  timestamp: Date;
  signature: string;
  retryCount?: number;
}

// ==========================================
// 🚀 CONSTANTES GLOBAIS
// ==========================================

export const SUPPORTED_LANGUAGES = ['pt-BR', 'en-US', 'es-ES'] as const;
export const SUPPORTED_TIMEZONES = [
  'America/Sao_Paulo',
  'America/New_York', 
  'Europe/London',
  'Europe/Madrid'
] as const;

export const FILE_SIZE_LIMITS = {
  image: 10 * 1024 * 1024, // 10MB
  video: 100 * 1024 * 1024, // 100MB
  audio: 50 * 1024 * 1024, // 50MB
  document: 25 * 1024 * 1024, // 25MB
} as const;

export const RATE_LIMITS = {
  api: {
    requests: 1000,
    window: 3600, // 1 hour
  },
  ai: {
    requests: 100,
    window: 3600, // 1 hour
  },
  uploads: {
    requests: 50,
    window: 3600, // 1 hour
  },
} as const;

export const CACHE_DURATIONS = {
  static: 86400, // 24 hours
  dynamic: 3600, // 1 hour
  realtime: 60, // 1 minute
} as const;

// ==========================================
// 📝 VERSIONING & COMPATIBILITY
// ==========================================

export const SCHEMA_VERSION = '1.0.0';
export const API_VERSION = 'v1';
export const PLATFORM_VERSION = '1.0.0-beta';

export interface SchemaVersion {
  version: string;
  released: Date;
  breaking: boolean;
  changes: Array<{
    type: 'added' | 'modified' | 'deprecated' | 'removed';
    component: string;
    description: string;
  }>;
}

// ==========================================
// 🛡️ SECURITY & PERMISSIONS
// ==========================================

export type Permission = 
  // Tenant Management
  | 'tenant:read' | 'tenant:write' | 'tenant:delete'
  // User Management  
  | 'user:read' | 'user:write' | 'user:delete' | 'user:invite'
  // Brand Management
  | 'brand:read' | 'brand:write' | 'brand:delete'
  // Campaign Management
  | 'campaign:read' | 'campaign:write' | 'campaign:delete' | 'campaign:publish'
  // Content Management
  | 'content:read' | 'content:write' | 'content:delete' | 'content:generate'
  // Asset Management
  | 'asset:read' | 'asset:write' | 'asset:delete' | 'asset:upload'
  // Analytics
  | 'analytics:read' | 'analytics:export'
  // System
  | 'system:read' | 'system:write' | 'system:admin';

export interface SecurityContext {
  userId: string;
  tenantId?: string;
  role: string;
  permissions: Permission[];
  session: {
    id: string;
    createdAt: Date;
    expiresAt: Date;
    lastActivity: Date;
  };
}

// ==========================================
// 🔚 FINAL EXPORTS
// ==========================================

// Export default para facilitar imports
export default {
  version: PLATFORM_VERSION,
  schemas: {
    version: SCHEMA_VERSION,
  },
  api: {
    version: API_VERSION,
  },
};