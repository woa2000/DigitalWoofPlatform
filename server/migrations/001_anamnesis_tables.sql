-- Migration: 001_anamnesis_tables.sql
-- Description: Create tables for anamnesis digital analysis system
-- Author: Backend_Developer (automated)
-- Date: 2025-09-05

-- Enable UUID extension if not exists
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Create anamnesis_analysis table
CREATE TABLE IF NOT EXISTS anamnesis_analysis (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    primary_url TEXT NOT NULL,
    status TEXT NOT NULL CHECK (status IN ('queued', 'running', 'done', 'error')),
    score_completeness DECIMAL(5,2),
    error_message TEXT,
    created_at TIMESTAMP DEFAULT NOW() NOT NULL,
    updated_at TIMESTAMP DEFAULT NOW() NOT NULL
);

-- Create anamnesis_source table
CREATE TABLE IF NOT EXISTS anamnesis_source (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    analysis_id UUID NOT NULL REFERENCES anamnesis_analysis(id) ON DELETE CASCADE,
    type TEXT NOT NULL CHECK (type IN ('site', 'social')),
    url TEXT NOT NULL,
    normalized_url TEXT NOT NULL,
    provider TEXT, -- instagram, facebook, etc.
    last_fetched_at TIMESTAMP,
    hash TEXT UNIQUE NOT NULL
);

-- Create anamnesis_finding table  
CREATE TABLE IF NOT EXISTS anamnesis_finding (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    analysis_id UUID NOT NULL REFERENCES anamnesis_analysis(id) ON DELETE CASCADE,
    key TEXT NOT NULL,
    section TEXT NOT NULL CHECK (section IN ('identity', 'personas', 'ux', 'ecosystem', 'actionPlan', 'roadmap', 'homeAnatomy', 'questions')),
    payload JSONB NOT NULL
);

-- Create performance indexes
CREATE INDEX IF NOT EXISTS idx_anamnesis_analysis_user_id ON anamnesis_analysis(user_id);
CREATE INDEX IF NOT EXISTS idx_anamnesis_analysis_status ON anamnesis_analysis(status);
CREATE INDEX IF NOT EXISTS idx_anamnesis_analysis_created_at ON anamnesis_analysis(created_at DESC);

CREATE INDEX IF NOT EXISTS idx_anamnesis_source_analysis_id ON anamnesis_source(analysis_id);
CREATE INDEX IF NOT EXISTS idx_anamnesis_source_normalized_url ON anamnesis_source(normalized_url);
CREATE INDEX IF NOT EXISTS idx_anamnesis_source_hash ON anamnesis_source(hash);

CREATE INDEX IF NOT EXISTS idx_anamnesis_finding_analysis_id ON anamnesis_finding(analysis_id);
CREATE INDEX IF NOT EXISTS idx_anamnesis_finding_section ON anamnesis_finding(section);

-- Create composite indexes for common queries
CREATE INDEX IF NOT EXISTS idx_anamnesis_analysis_user_status ON anamnesis_analysis(user_id, status);
CREATE INDEX IF NOT EXISTS idx_anamnesis_source_normalized_analysis ON anamnesis_source(normalized_url, analysis_id);

-- Add RLS (Row Level Security) policies
ALTER TABLE anamnesis_analysis ENABLE ROW LEVEL SECURITY;
ALTER TABLE anamnesis_source ENABLE ROW LEVEL SECURITY;
ALTER TABLE anamnesis_finding ENABLE ROW LEVEL SECURITY;

-- RLS Policy: Users can only access their own analysis
CREATE POLICY anamnesis_analysis_user_policy ON anamnesis_analysis
    FOR ALL USING (user_id = auth.uid());

-- RLS Policy: Users can only access sources from their analysis
CREATE POLICY anamnesis_source_user_policy ON anamnesis_source  
    FOR ALL USING (
        analysis_id IN (
            SELECT id FROM anamnesis_analysis WHERE user_id = auth.uid()
        )
    );

-- RLS Policy: Users can only access findings from their analysis
CREATE POLICY anamnesis_finding_user_policy ON anamnesis_finding
    FOR ALL USING (
        analysis_id IN (
            SELECT id FROM anamnesis_analysis WHERE user_id = auth.uid()
        )
    );

-- Create trigger for updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_anamnesis_analysis_updated_at 
    BEFORE UPDATE ON anamnesis_analysis 
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Add comments for documentation
COMMENT ON TABLE anamnesis_analysis IS 'Digital presence analysis for brands - main analysis record';
COMMENT ON TABLE anamnesis_source IS 'URLs being analyzed in each analysis - websites and social media';
COMMENT ON TABLE anamnesis_finding IS 'Analysis results organized by sections - identity, personas, ux, etc';

COMMENT ON COLUMN anamnesis_analysis.status IS 'Analysis processing status: queued → running → done/error';
COMMENT ON COLUMN anamnesis_analysis.score_completeness IS 'Overall completeness score (0-100) based on found data';
COMMENT ON COLUMN anamnesis_source.normalized_url IS 'URL normalized for deduplication (lowercase, no www, no trailing slash)';
COMMENT ON COLUMN anamnesis_source.hash IS 'Unique hash of normalized_url for efficient deduplication';
COMMENT ON COLUMN anamnesis_finding.section IS 'Analysis section: identity, personas, ux, ecosystem, actionPlan, roadmap, homeAnatomy, questions';
COMMENT ON COLUMN anamnesis_finding.payload IS 'JSON data specific to each section type';