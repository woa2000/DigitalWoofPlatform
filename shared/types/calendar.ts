// Calendar Editorial System Types
// Generated from schema: calendar_editorial_schema.sql

export type ContentType = 'educativo' | 'promocional' | 'recall' | 'engajamento' | 'awareness';
export type CalendarStatus = 'draft' | 'scheduled' | 'published' | 'failed' | 'cancelled';
export type CalendarPriority = 'low' | 'medium' | 'high' | 'urgent';
export type BusinessType = 'veterinaria' | 'petshop' | 'estetica' | 'hotel' | 'adestramento';
export type CampaignType = 'seasonal' | 'promotional' | 'educational' | 'retention' | 'acquisition';
export type SeasonalEventType = 'holiday' | 'weather' | 'pet_health' | 'business_cycle' | 'industry_event';

// Calendar Item - Core entity for scheduled content
export interface CalendarItem {
  id: string;
  account_id: string;
  user_id: string;
  
  // Content
  title: string;
  description?: string;
  content_type: ContentType;
  channels: string[];
  
  // Scheduling
  scheduled_for: Date;
  timezone: string;
  
  // Relationships
  campaign_id?: string;
  template_id?: string;
  generated_content_id?: string;
  
  // Status & metadata
  status: CalendarStatus;
  priority: CalendarPriority;
  objectives?: Record<string, number>;
  tags?: string[];
  
  // Performance prediction
  predicted_engagement?: number;
  predicted_reach?: number;
  optimal_time_score?: number;
  
  // Tracking
  published_at?: Date;
  actual_performance?: Record<string, any>;
  
  created_at: Date;
  updated_at: Date;
}

// Campaign Template - Structured campaign definitions
export interface CampaignTemplate {
  id: string;
  name: string;
  description?: string;
  
  // Classification
  business_type: BusinessType;
  campaign_type: CampaignType;
  season?: string;
  
  // Temporal structure
  duration: string; // ISO duration
  phases: CampaignPhase[];
  
  // Default objectives
  default_objectives?: Record<string, number>;
  success_metrics?: Record<string, number>;
  
  // Historical performance
  usage_count: number;
  avg_success_rate?: number;
  
  // Metadata
  is_public: boolean;
  created_by?: string;
  created_at: Date;
}

export interface CampaignPhase {
  week: number;
  theme: string;
  posts: PostSpecification[];
  objectives?: Record<string, number>;
}

export interface PostSpecification {
  type: ContentType;
  preferred_day?: string;
  title_template?: string;
  content_guidelines?: string[];
}

// Calendar Suggestions - AI-generated intelligent suggestions
export interface CalendarSuggestion {
  id: string;
  account_id: string;
  
  // Period
  suggested_for: Date;
  period_type: 'week' | 'month';
  
  // Context
  business_type: BusinessType;
  seasonal_factors?: Record<string, any>;
  local_events?: Record<string, any>;
  
  // Generated suggestions
  content_suggestions: ContentSuggestion[];
  campaign_suggestions: CampaignSuggestion[];
  timing_suggestions: TimingSuggestion[];
  
  // Performance tracking
  applied_count: number;
  user_rating?: number;
  
  // Metadata
  generated_at: Date;
  expires_at?: Date;
}

export interface ContentSuggestion {
  id: string;
  type: 'seasonal' | 'performance' | 'trending';
  content_type: ContentType;
  title: string;
  description: string;
  suggested_date?: Date;
  seasonal_event_id?: string;
  confidence_score: number;
  reasoning: string;
}

export interface CampaignSuggestion {
  id: string;
  template_id: string;
  template_name: string;
  suggested_start_date: Date;
  relevance_score: number;
  reasoning: string;
}

export interface TimingSuggestion {
  content_type: ContentType;
  channel: string;
  optimal_day_of_week: number;
  optimal_hour: number;
  confidence_score: number;
  expected_engagement: number;
}

// Optimal Timing - Historical performance analytics
export interface OptimalTiming {
  id: string;
  account_id: string;
  
  // Segmentation
  content_type: ContentType;
  channel: string;
  day_of_week: number; // 0=Sunday, 6=Saturday
  hour_of_day: number; // 0-23
  
  // Historical metrics
  total_posts: number;
  avg_engagement: number;
  avg_reach: number;
  avg_clicks: number;
  confidence_score: number;
  
  last_calculated: Date;
}

// Seasonal Knowledge - Pet industry seasonal intelligence
export interface SeasonalEvent {
  id: string;
  name: string;
  description?: string;
  event_type: SeasonalEventType;
  
  // Timing
  start_month: number;
  end_month: number;
  peak_weeks?: number[];
  
  // Applicability
  business_types: BusinessType[];
  regions?: string[];
  
  // Content guidance
  content_themes: string[];
  recommended_frequency: number;
  priority_score: number;
  
  // Performance
  avg_engagement_lift?: number;
  conversion_impact?: number;
  
  is_active: boolean;
  created_at: Date;
}

// Analytics - Post performance metrics for baseline
export interface AnalyticsPostMetrics {
  id: string;
  account_id: string;
  calendar_item_id?: string;
  
  // Platform
  platform: 'instagram' | 'facebook' | 'gbp' | 'linkedin' | 'tiktok';
  posted_at: Date;
  media_type?: string;
  
  // Engagement metrics
  impressions: number;
  reach: number;
  likes: number;
  comments: number;
  saves: number;
  shares: number;
  clicks: number;
  
  // Calculated metrics
  engagement_rate?: number;
  click_through_rate?: number;
  
  // Metadata
  imported_at: Date;
  data_source: string;
}

// Calendar Events Versioning - Backup system
export interface CalendarEventVersion {
  id: string;
  original_id: string;
  account_id: string;
  user_id: string;
  
  // Snapshot
  title: string;
  description?: string;
  content_type: ContentType;
  channels: string[];
  scheduled_for: Date;
  status: CalendarStatus;
  priority: CalendarPriority;
  objectives?: Record<string, any>;
  tags?: string[];
  
  // Versioning
  operation_type: 'INSERT' | 'UPDATE' | 'DELETE';
  versioned_at: Date;
  versioned_by?: string;
}

// Seasonality Knowledge Base - External JSON structure
export interface SeasonalityKnowledgeBase {
  version: string;
  region: string;
  description: string;
  last_updated: string;
  items: SeasonalityItem[];
  compliance_guidelines: Record<string, string>;
  regional_notes: Record<string, string>;
}

export interface SeasonalityItem {
  id: string;
  name: string;
  month: number;
  date?: number;
  movable: boolean;
  calculation?: string;
  regions: string[];
  event_type: SeasonalEventType;
  business_types: BusinessType[];
  tags: string[];
  copy_guidelines: string[];
  compliance_flags: string[];
  content_themes: string[];
  recommended_frequency: number;
  priority_score: number;
}

// Request/Response types for API
export interface CalendarSuggestionRequest {
  business_type: BusinessType;
  period_start: string; // ISO date
  period_end: string; // ISO date
  objectives?: Record<string, number>;
  preferences?: {
    content_types?: ContentType[];
    channels?: string[];
    frequency?: number;
  };
}

export interface CalendarSuggestionResponse {
  suggested_for: Date;
  content_suggestions: ContentSuggestion[];
  campaign_suggestions: CampaignSuggestion[];
  timing_suggestions: TimingSuggestion[];
  seasonal_context: {
    events: SeasonalityItem[];
    themes: string[];
  };
}

export interface CampaignTemplateApplicationRequest {
  templateId: string;
  startDate: string; // ISO date
  customizations?: {
    objectives?: Record<string, number>;
    phase_adjustments?: Record<number, Partial<CampaignPhase>>;
    content_preferences?: {
      tone?: string;
      focus_areas?: string[];
    };
  };
}

export interface OptimalTimingResult {
  recommended_times: TimeSlot[];
  confidence_score: number;
  data_source: 'historical' | 'benchmark' | 'hybrid';
  sample_size?: number;
}

export interface TimeSlot {
  day_of_week: number;
  hour: number;
  avg_engagement: number;
  avg_reach: number;
  avg_clicks: number;
  sample_size: number;
  confidence: number;
}

// Utility types for date/time handling
export interface DateRange {
  start: Date;
  end: Date;
}

export interface CalendarViewConfig {
  view: 'week' | 'month' | 'quarter';
  start_date: Date;
  end_date: Date;
  filters?: {
    content_types?: ContentType[];
    status?: CalendarStatus[];
    campaigns?: string[];
    tags?: string[];
  };
}

// WebSocket events for real-time updates
export interface CalendarUpdateEvent {
  type: 'calendar_update' | 'suggestions_update' | 'template_applied';
  account_id: string;
  operation: 'create' | 'update' | 'delete' | 'move';
  item?: CalendarItem;
  suggestions?: CalendarSuggestion;
  affected_dates?: Date[];
  timestamp: Date;
}

// Export/Import types for scheduler integration
export interface CalendarExportConfig {
  format: 'ics' | 'csv' | 'json';
  date_range: DateRange;
  filters?: CalendarViewConfig['filters'];
  include_metadata?: boolean;
}

export interface ICSEvent {
  title: string;
  description: string;
  start: [number, number, number, number, number]; // [year, month, day, hour, minute]
  duration: { minutes: number };
  uid?: string;
  categories?: string[];
}