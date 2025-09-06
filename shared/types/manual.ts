// Manual de Marca Digital - Type Definitions
// T-001: Manual Data Model and Rendering

import { BrandVoice } from './brand-voice';

// Core Manual Interfaces
export interface RenderedManual {
  id: string;
  userId: string;
  brandVoiceId: string;
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
  displayConfig: ManualDisplayConfig;
  sharing: SharingConfig;
  metadata: ManualMetadata;
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
  moodBoard: {
    images: MoodBoardImage[];
    style_references: string[];
    visual_guidelines: string[];
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
    educational_context: string;
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
  writingSamples: {
    good_examples: WritingExample[];
    bad_examples: WritingExample[];
    context_specific_samples: ContextualExample[];
  };
}

export interface ComplianceSection {
  policies: {
    content_policies: ContentPolicy[];
    medical_claims: MedicalClaimPolicy[];
    disclaimers: DisclaimerTemplate[];
    regulatory_requirements: RegulatoryRule[];
  };
  checklist: {
    validation_items: ComplianceCheckItem[];
    automation_rules: AutomationRule[];
    compliance_score: number;
  };
  alerts: {
    warning_triggers: AlertTrigger[];
    escalation_process: EscalationStep[];
    review_workflow: ReviewStep[];
  };
  templates: {
    disclaimer_templates: DisclaimerTemplate[];
    legal_text_samples: LegalTextSample[];
    compliance_shortcuts: ComplianceShortcut[];
  };
}

// Component Props Interfaces
export interface ManualSectionProps {
  title: string;
  icon: React.ComponentType;
  data: any;
  interactive?: boolean;
  onEdit?: (data: any) => void;
  onExport?: (section: string) => void;
  loading?: boolean;
  error?: string;
}

export interface ManualNavigationProps {
  sections: NavigationSection[];
  currentSection: string;
  onSectionChange: (section: string) => void;
  isMobile?: boolean;
  progress?: Record<string, number>;
}

export interface RadarChartProps {
  data: RadarChartData;
  dimensions: VoiceDimension[];
  interactive?: boolean;
  size?: 'small' | 'medium' | 'large';
  onHover?: (dimension: string, value: number) => void;
  benchmarks?: BenchmarkData;
}

export interface ColorPaletteProps {
  colors: ColorInfo[];
  showAccessibility?: boolean;
  showCodes?: boolean;
  onColorClick?: (color: ColorInfo) => void;
  layout?: 'grid' | 'list' | 'compact';
}

// Data Type Interfaces
export interface VoiceDimension {
  name: string;
  value: number; // 0-10
  description: string;
  examples: string[];
  context: 'formal' | 'casual' | 'emergency' | 'educational';
}

export interface RadarChartData {
  dimensions: {
    name: string;
    value: number;
    max: number;
    color?: string;
  }[];
  benchmarks?: {
    industry_average: number[];
    competitor_data?: CompetitorRadarData[];
  };
  metadata: {
    generated_at: string;
    version: string;
  };
}

export interface ColorInfo {
  hex: string;
  name: string;
  usage: 'primary' | 'secondary' | 'accent' | 'neutral';
  accessibility: {
    contrast_ratios: Record<string, number>;
    wcag_compliance: 'AA' | 'AAA' | 'fail';
    color_blind_safe: boolean;
  };
  variations?: {
    lighter: string;
    darker: string;
    tints: string[];
    shades: string[];
  };
}

export interface GlossaryTerm {
  term: string;
  alternative?: string;
  usage: 'preferred' | 'prohibited' | 'conditional';
  context: string;
  examples: string[];
  category: 'medical' | 'marketing' | 'technical' | 'general';
  severity?: 'info' | 'warning' | 'critical';
}

export interface CTATemplate {
  id: string;
  text: string;
  context: 'formal' | 'casual' | 'urgent' | 'educational';
  channel: 'social' | 'email' | 'website' | 'whatsapp' | 'sms';
  variations: string[];
  performance_data?: {
    click_rate: number;
    conversion_rate: number;
    a_b_test_winner: boolean;
  };
}

export interface ComplianceCheckItem {
  id: string;
  rule: string;
  description: string;
  severity: 'info' | 'warning' | 'critical';
  automated: boolean;
  category: 'medical' | 'legal' | 'privacy' | 'advertising';
  examples: {
    compliant: string[];
    non_compliant: string[];
  };
  action_required?: string;
}

// Manual Configuration
export interface ManualDisplayConfig {
  theme: 'light' | 'dark' | 'brand_colors';
  layout: 'sidebar' | 'tabs' | 'accordion';
  sections_visible: ManualSection[];
  custom_sections?: CustomSection[];
  responsive_config: {
    mobile_navigation: 'bottom' | 'hamburger';
    tablet_layout: 'sidebar' | 'tabs';
    desktop_layout: 'sidebar' | 'split';
  };
}

export interface ManualOverrides {
  custom_examples: Record<string, string[]>;
  additional_guidelines: Record<string, string>;
  custom_compliance_rules: ComplianceRule[];
  section_overrides: Record<ManualSection, any>;
}

export interface SharingConfig {
  public_url?: string;
  access_level: 'private' | 'team' | 'public';
  allowed_users: string[];
  allowed_domains: string[];
  embed_enabled: boolean;
  watermark_enabled: boolean;
  download_allowed: boolean;
  expires_at?: string;
}

export interface ManualMetadata {
  created_at: string;
  updated_at: string;
  last_viewed: string;
  view_count: number;
  version: string;
  export_history: ExportRecord[];
  performance_metrics: {
    load_time: number;
    cache_hit_rate: number;
    user_engagement: Record<ManualSection, number>;
  };
}

// Export Interfaces
export interface ExportOptions {
  format: 'pdf' | 'json' | 'brand_kit' | 'summary';
  sections: ManualSection[];
  options: {
    include_examples: boolean;
    include_history: boolean;
    custom_template?: string;
    watermark: boolean;
    compress: boolean;
    page_format: 'A4' | 'Letter' | 'A3';
    orientation: 'portrait' | 'landscape';
  };
}

export interface ExportResult {
  success: boolean;
  export_id: string;
  download_url?: string;
  format: string;
  file_size: number;
  page_count?: number;
  expires_at: string;
  generation_time: number;
  error?: string;
}

export interface ExportRecord {
  id: string;
  format: string;
  sections: ManualSection[];
  created_at: string;
  download_count: number;
  file_size: number;
  expires_at: string;
}

// API Response Interfaces
export interface ManualAPIResponse {
  success: boolean;
  data: {
    manual: RenderedManual;
    sharing: SharingConfig;
    metadata: ManualMetadata;
    cache_info: {
      cached: boolean;
      cache_key: string;
      ttl: number;
    };
  };
  error?: APIError;
}

export interface APIError {
  code: string;
  message: string;
  details?: any;
  timestamp: string;
}

// Utility Types
export type ManualSection = 'visual' | 'voice' | 'language' | 'compliance';

export type NavigationSection = {
  id: ManualSection;
  title: string;
  icon: React.ComponentType;
  description: string;
  progress?: number; // 0-100
  enabled: boolean;
  beta?: boolean;
};

export type ComparisonExample = {
  context: string;
  wrong_example: string;
  right_example: string;
  explanation: string;
  category: 'tone' | 'style' | 'compliance' | 'visual';
};

export type ChannelExample = {
  channel: 'instagram' | 'facebook' | 'whatsapp' | 'email' | 'website' | 'linkedin';
  adaptation: string;
  example_content: string;
  specific_guidelines: string[];
  character_limits?: {
    min: number;
    max: number;
    optimal: number;
  };
};

// Supporting Type Definitions
export interface ColorUsageExample {
  context: string;
  combination: string[];
  usage_description: string;
  accessibility_note?: string;
}

export interface AccessibilityInfo {
  wcag_aa_compliant: boolean;
  wcag_aaa_compliant: boolean;
  color_blind_friendly: boolean;
  contrast_ratios: Record<string, number>;
  recommendations: string[];
}

export interface LogoVariant {
  name: string;
  url: string;
  format: 'svg' | 'png' | 'jpg';
  usage_context: string[];
  size_variants: {
    small: string;
    medium: string;
    large: string;
  };
}

export interface TypographyExample {
  text: string;
  size: string;
  weight: string;
  usage_context: string;
  preview_url?: string;
}

export interface MoodBoardImage {
  url: string;
  description: string;
  style_tags: string[];
  usage_context: string;
}

export interface VoiceExample {
  context: string;
  example_text: string;
  explanation: string;
  channel?: string;
  audience?: string;
}

export interface ChannelVoiceExample {
  channel: string;
  tone_adjustment: string;
  example_content: string;
  specific_guidelines: string[];
}

export interface GlossaryIndex {
  categories: string[];
  search_index: Record<string, string[]>;
  alphabetical_index: Record<string, GlossaryTerm[]>;
}

export interface CTAVariation {
  original: string;
  variation: string;
  context: string;
  performance_lift?: number;
}

export interface FormattingRule {
  rule: string;
  description: string;
  examples: {
    correct: string;
    incorrect: string;
  };
  applies_to: string[];
}

export interface EmojiPolicy {
  usage_level: 'none' | 'minimal' | 'moderate' | 'extensive';
  allowed_categories: string[];
  forbidden_emojis: string[];
  context_guidelines: Record<string, string>;
}

export interface WritingExample {
  text: string;
  context: string;
  explanation: string;
  improvement_suggestions?: string[];
}

export interface ContextualExample {
  context: string;
  audience: string;
  channel: string;
  example_text: string;
  tone_notes: string;
}

export interface ContentPolicy {
  title: string;
  description: string;
  rules: string[];
  examples: {
    allowed: string[];
    forbidden: string[];
  };
  severity: 'info' | 'warning' | 'critical';
}

export interface MedicalClaimPolicy {
  claim_type: string;
  allowed: boolean;
  conditions: string[];
  required_disclaimers: string[];
  examples: string[];
}

export interface DisclaimerTemplate {
  id: string;
  title: string;
  text: string;
  usage_context: string[];
  required_fields: string[];
}

export interface RegulatoryRule {
  regulation: string;
  description: string;
  compliance_requirements: string[];
  penalties: string;
  update_frequency: string;
}

export interface AutomationRule {
  trigger: string;
  action: string;
  conditions: string[];
  severity: 'info' | 'warning' | 'critical';
}

export interface AlertTrigger {
  keyword: string;
  context: string;
  severity: 'info' | 'warning' | 'critical';
  message: string;
  escalation_required: boolean;
}

export interface EscalationStep {
  step: number;
  role: string;
  action: string;
  timeline: string;
}

export interface ReviewStep {
  step: string;
  responsible: string;
  criteria: string[];
  approval_required: boolean;
}

export interface LegalTextSample {
  category: string;
  text: string;
  usage_context: string[];
  last_updated: string;
}

export interface ComplianceShortcut {
  name: string;
  template: string;
  variables: string[];
  usage_instructions: string;
}

export interface CustomSection {
  id: string;
  title: string;
  content: string; // Markdown
  order: number;
  visible: boolean;
  editable: boolean;
}

export interface ComplianceRule {
  id: string;
  rule: string;
  category: string;
  severity: 'info' | 'warning' | 'critical';
  automated_check: boolean;
}

export interface CompetitorRadarData {
  name: string;
  dimensions: number[];
  color: string;
}

export interface BenchmarkData {
  industry_average: number[];
  top_performers: CompetitorRadarData[];
  user_position: number[];
}

// Performance & Cache Types
export interface ManualCacheKey {
  userId: string;
  brandVoiceId: string;
  version: string;
  sections: ManualSection[];
}

export interface CacheMetrics {
  hit_rate: number;
  miss_rate: number;
  invalidation_count: number;
  avg_generation_time: number;
  cache_size: number;
  memory_usage: number;
}

// Error Types
export type ManualError = 
  | 'BRAND_VOICE_NOT_FOUND'
  | 'MANUAL_GENERATION_FAILED'
  | 'EXPORT_GENERATION_FAILED'
  | 'SHARING_ACCESS_DENIED'
  | 'SECTION_RENDER_FAILED'
  | 'CACHE_ERROR'
  | 'VALIDATION_ERROR';

export interface ManualErrorContext {
  error_type: ManualError;
  message: string;
  section?: ManualSection;
  user_id?: string;
  brand_voice_id?: string;
  timestamp: string;
  stack_trace?: string;
  recovery_suggestions?: string[];
}

// State Management Types
export interface ManualState {
  manual: RenderedManual | null;
  currentSection: ManualSection;
  loading: boolean;
  error: ManualErrorContext | null;
  cache: {
    manual_data: Map<string, RenderedManual>;
    section_data: Map<string, any>;
    last_updated: Record<string, string>;
  };
  ui: {
    navigation_expanded: boolean;
    export_panel_open: boolean;
    sharing_panel_open: boolean;
    mobile_view: boolean;
    theme: 'light' | 'dark' | 'brand_colors';
  };
}

export interface ManualActions {
  loadManual: (userId: string, brandVoiceId?: string) => Promise<void>;
  setCurrentSection: (section: ManualSection) => void;
  updateDisplayConfig: (config: Partial<ManualDisplayConfig>) => void;
  exportManual: (options: ExportOptions) => Promise<ExportResult>;
  updateSharing: (config: Partial<SharingConfig>) => Promise<void>;
  clearCache: () => void;
  retryOnError: () => void;
}

// Validation Schema Types
export interface ValidationResult {
  valid: boolean;
  errors: ValidationError[];
  warnings: ValidationWarning[];
  score: number; // 0-100
}

export interface ValidationError {
  field: string;
  message: string;
  severity: 'error' | 'warning';
  suggestion?: string;
}

export interface ValidationWarning {
  field: string;
  message: string;
  impact: 'low' | 'medium' | 'high';
  suggestion: string;
}