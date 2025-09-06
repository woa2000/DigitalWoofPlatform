-- Migration: Add performance indexes to campaign_templates

-- Index for common filtering criteria
CREATE INDEX IF NOT EXISTS idx_template_category_service ON campaign_templates (category, service_type);

-- Index for boolean flags used in filtering
CREATE INDEX IF NOT EXISTS idx_template_flags ON campaign_templates (is_public, is_premium);

-- Index for sorting by usage and engagement
CREATE INDEX IF NOT EXISTS idx_template_performance ON campaign_templates (usage_count DESC, avg_engagement_rate DESC);

-- Index for sorting by creation date
CREATE INDEX IF NOT EXISTS idx_template_created_at ON campaign_templates (created_at DESC);

-- Index for text search on name
-- Using GIN index for better text search performance with pg_trgm extension
-- This requires the pg_trgm extension to be enabled on the database.
CREATE EXTENSION IF NOT EXISTS pg_trgm;
CREATE INDEX IF NOT EXISTS idx_template_name_search ON campaign_templates USING gin (name gin_trgm_ops);

-- Index on createdBy for filtering by user
CREATE INDEX IF NOT EXISTS idx_template_created_by ON campaign_templates (created_by);
