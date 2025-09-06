// Manual de Marca Digital - TypeScript Interfaces
// Generated from Manual_Marca_Digital_Plan.md
// Date: 2025-09-06

import { BrandVoice } from '@/shared/types/brand-voice';

// Core Manual Interfaces
export interface RenderedManual {
  brandVoice: BrandVoice;
  sections: {
    visual: VisualIdentitySection;
    voice: TomDeVozSection;
    language: LanguagemSection;
    compliance: ComplianceSection;
  };
  examples: {
    content_previews: string[];
    comparison_examples: ComparisonExample[];
    channel_adaptations: ChannelExample[];
  };
  quality: {
    completeness_score: number;
    consistency_warnings: string[];
    improvement_suggestions: string[];
  };
}

// Section Interfaces
export interface VisualIdentitySection {
  palette: {
    primary: string;
    secondary: string[];
    neutral: string[];
    usage_examples: ColorUsageExample[];
    accessibility: AccessibilityInfo;
  };
  logo: {
    url: string;
    variants: LogoVariant[];
    usage_guidelines: string[];
  };
  typography: {
    primary: string;
    style: string;
    examples: TypographyExample[];
  };
}

export interface TomDeVozSection {
  personality: {
    dimensions: VoiceDimension[];
    radar_data: RadarChartData;
    persona_description: string;
  };
  examples: {
    do_examples: VoiceExample[];
    dont_examples: VoiceExample[];
    channel_adaptations: ChannelVoiceExample[];
  };
  guidelines: {
    formal_context: string;
    casual_context: string;
    emergency_context: string;
  };
}

export interface LanguagemSection {
  glossary: {
    preferred_terms: GlossaryTerm[];
    prohibited_terms: GlossaryTerm[];
    searchable_index: GlossaryIndex;
  };
  ctas: {
    templates: CTATemplate[];
    context_variations: CTAVariation[];
  };
  style: {
    formatting_rules: FormattingRule[];
    punctuation_guidelines: string[];
    emoji_policy: EmojiPolicy;
  };
}

export interface ComplianceSection {
  policies: {
    content_policies: ContentPolicy[];
    medical_claims: MedicalClaimPolicy[];
    disclaimers: DisclaimerTemplate[];
  };
  checklist: {
    validation_items: ComplianceCheckItem[];
    automation_rules: AutomationRule[];
  };
  alerts: {
    warning_triggers: AlertTrigger[];
    escalation_process: EscalationStep[];
  };
}

// Component Props Interfaces
export interface ManualSectionProps {
  title: string;
  icon: React.ComponentType;
  data: any; // section-specific data
  interactive?: boolean;
  onEdit?: (data: any) => void;
  onExport?: (section: string) => void;
}

export interface ManualNavigationProps {
  sections: NavigationSection[];
  currentSection: string;
  onSectionChange: (section: string) => void;
  isMobile?: boolean;
}

export interface RadarChartProps {
  data: RadarChartData;
  dimensions: VoiceDimension[];
  interactive?: boolean;
  size?: 'small' | 'medium' | 'large';
  onHover?: (dimension: string, value: number) => void;
}

export interface ColorPaletteProps {
  colors: ColorInfo[];
  showAccessibility?: boolean;
  showCodes?: boolean;
  onColorClick?: (color: ColorInfo) => void;
}

// Data Type Interfaces
export interface VoiceDimension {
  name: string;
  value: number; // 0-10
  description: string;
  examples: string[];
}

export interface RadarChartData {
  dimensions: {
    name: string;
    value: number;
    max: number;
  }[];
  benchmarks?: {
    industry_average: number[];
    competitor_data?: CompetitorRadarData[];
  };
}

export interface ColorInfo {
  hex: string;
  name: string;
  usage: 'primary' | 'secondary' | 'accent' | 'neutral';
  accessibility: {
    contrast_ratios: Record<string, number>;
    wcag_compliance: 'AA' | 'AAA' | 'fail';
  };
}

export interface GlossaryTerm {
  term: string;
  alternative?: string;
  usage: 'preferred' | 'prohibited';
  context: string;
  examples: string[];
}

export interface CTATemplate {
  id: string;
  text: string;
  context: 'formal' | 'casual' | 'urgent' | 'educational';
  channel: 'social' | 'email' | 'website' | 'whatsapp';
  variations: string[];
}

export interface ComplianceCheckItem {
  id: string;
  rule: string;
  description: string;
  severity: 'info' | 'warning' | 'critical';
  automated: boolean;
  examples: {
    compliant: string[];
    non_compliant: string[];
  };
}

// Manual Configuration
export interface ManualDisplayConfig {
  theme: 'light' | 'dark' | 'brand_colors';
  layout: 'sidebar' | 'tabs' | 'accordion';
  sections_visible: string[];
  custom_sections?: CustomSection[];
}

export interface ManualOverrides {
  custom_examples: Record<string, string[]>;
  additional_guidelines: Record<string, string>;
  custom_compliance_rules: ComplianceRule[];
}

export interface SharingConfig {
  public_url?: string;
  access_level: 'private' | 'team' | 'public';
  allowed_users: string[];
  embed_enabled: boolean;
}

// Export Interfaces
export interface ExportOptions {
  format: 'pdf' | 'json' | 'brand_kit';
  sections: string[];
  options: {
    include_examples: boolean;
    include_history: boolean;
    custom_template?: string;
  };
}

export interface ExportResult {
  success: boolean;
  download_url?: string;
  format: string;
  file_size: number;
  expires_at: string;
  error?: string;
}

// API Response Interfaces
export interface ManualAPIResponse {
  success: boolean;
  data: {
    manual: RenderedManual;
    sharing: SharingConfig;
    metadata: {
      last_updated: string;
      last_viewed: string;
      version: string;
    };
  };
  error?: string;
}

// Utility Types
export type ManualSection = 'visual' | 'voice' | 'language' | 'compliance';

export type NavigationSection = {
  id: ManualSection;
  title: string;
  icon: React.ComponentType;
  description: string;
  progress?: number; // 0-100
};

export type ComparisonExample = {
  context: string;
  wrong_example: string;
  right_example: string;
  explanation: string;
};

export type ChannelExample = {
  channel: 'instagram' | 'facebook' | 'whatsapp' | 'email' | 'website';
  adaptation: string;
  example_content: string;
  specific_guidelines: string[];
};

// Performance & Cache Types
export interface ManualCacheKey {
  userId: string;
  brandVoiceId: string;
  version: string;
}

export interface CacheMetrics {
  hit_rate: number;
  miss_rate: number;
  invalidation_count: number;
  avg_generation_time: number;
}

// Error Types
export type ManualError = 
  | 'BRAND_VOICE_NOT_FOUND'
  | 'MANUAL_GENERATION_FAILED'
  | 'EXPORT_GENERATION_FAILED'
  | 'SHARING_ACCESS_DENIED'
  | 'SECTION_RENDER_FAILED';

export interface ManualErrorContext {
  error_type: ManualError;
  message: string;
  section?: ManualSection;
  user_id?: string;
  brand_voice_id?: string;
  timestamp: string;
}