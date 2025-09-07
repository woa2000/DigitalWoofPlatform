-- Migration: Brand Voice JSON Schema v1.0
-- Implements complete Brand Voice JSON storage with performance optimizations
-- Created: T-002 Brand Voice JSON Plan
-- PostgreSQL syntax

CREATE TABLE brand_voice_jsons (
	id uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	user_id uuid NOT NULL,
	brand_voice_json jsonb NOT NULL,
	name text NOT NULL,
	version text DEFAULT '1.0' NOT NULL,
	status text DEFAULT 'draft' NOT NULL,
	generated_from text,
	source_analysis_id uuid,
	source_onboarding_id uuid,
	quality_score_overall numeric(5,2),
	quality_score_completeness numeric(5,2),
	quality_score_consistency numeric(5,2),
	quality_score_specificity numeric(5,2),
	quality_score_usability numeric(5,2),
	last_validated_at timestamp,
	cache_key text UNIQUE,
	usage_count integer DEFAULT 0 NOT NULL,
	last_used_at timestamp,
	created_at timestamp DEFAULT now() NOT NULL,
	updated_at timestamp DEFAULT now() NOT NULL,
	activated_at timestamp,
	archived_at timestamp
);

-- Add foreign key constraints
ALTER TABLE brand_voice_jsons ADD CONSTRAINT brand_voice_jsons_user_id_users_id_fk 
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE cascade;

ALTER TABLE brand_voice_jsons ADD CONSTRAINT brand_voice_jsons_source_analysis_id_anamnesis_analysis_id_fk 
  FOREIGN KEY (source_analysis_id) REFERENCES anamnesis_analysis(id) ON DELETE set null;

ALTER TABLE brand_voice_jsons ADD CONSTRAINT brand_voice_jsons_source_onboarding_id_brand_onboarding_id_fk 
  FOREIGN KEY (source_onboarding_id) REFERENCES brand_onboarding(id) ON DELETE set null;

-- Performance indexes for common queries
CREATE INDEX idx_brand_voice_jsons_user_id ON brand_voice_jsons (user_id);
CREATE INDEX idx_brand_voice_jsons_status ON brand_voice_jsons (status);
CREATE INDEX idx_brand_voice_jsons_user_status ON brand_voice_jsons (user_id, status);
CREATE INDEX idx_brand_voice_jsons_generated_from ON brand_voice_jsons (generated_from);
CREATE INDEX idx_brand_voice_jsons_quality_overall ON brand_voice_jsons (quality_score_overall);

-- JSONB GIN indexes for fast JSON queries
CREATE INDEX idx_brand_voice_jsons_json_gin ON brand_voice_jsons USING gin(brand_voice_json);

-- Specific JSONB path indexes for common searches
CREATE INDEX idx_brand_voice_jsons_brand_name ON brand_voice_jsons 
  USING gin(((brand_voice_json->'brand'->>'name')) gin_trgm_ops);

CREATE INDEX idx_brand_voice_jsons_voice_tone ON brand_voice_jsons 
  USING gin(((brand_voice_json->'voice'->'tone'->>'primary')) gin_trgm_ops);

CREATE INDEX idx_brand_voice_jsons_channels ON brand_voice_jsons 
  USING gin((brand_voice_json->'channels') jsonb_path_ops);

-- Timestamp indexes for performance
CREATE INDEX idx_brand_voice_jsons_created_at ON brand_voice_jsons (created_at DESC);
CREATE INDEX idx_brand_voice_jsons_updated_at ON brand_voice_jsons (updated_at DESC);
CREATE INDEX idx_brand_voice_jsons_last_used_at ON brand_voice_jsons (last_used_at DESC);

-- Cache key index for fast lookups
CREATE UNIQUE INDEX idx_brand_voice_jsons_cache_key ON brand_voice_jsons (cache_key);

-- Multi-tenant RLS (Row Level Security) policies
ALTER TABLE brand_voice_jsons ENABLE ROW LEVEL SECURITY;

-- Policy: Users can only access their own brand voice JSONs
CREATE POLICY "Users can view their own brand voice JSONs" ON brand_voice_jsons
  FOR SELECT USING (auth.uid()::text = user_id::text);

CREATE POLICY "Users can insert their own brand voice JSONs" ON brand_voice_jsons
  FOR INSERT WITH CHECK (auth.uid()::text = user_id::text);

CREATE POLICY "Users can update their own brand voice JSONs" ON brand_voice_jsons
  FOR UPDATE USING (auth.uid()::text = user_id::text);

CREATE POLICY "Users can delete their own brand voice JSONs" ON brand_voice_jsons
  FOR DELETE USING (auth.uid()::text = user_id::text);

-- Trigger to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_brand_voice_jsons_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_update_brand_voice_jsons_updated_at
  BEFORE UPDATE ON brand_voice_jsons
  FOR EACH ROW
  EXECUTE FUNCTION update_brand_voice_jsons_updated_at();

-- Trigger to auto-generate cache key if not provided
CREATE OR REPLACE FUNCTION generate_brand_voice_cache_key()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.cache_key IS NULL THEN
    NEW.cache_key = 'bv_' || NEW.user_id || '_' || extract(epoch from now()) || '_' || substr(md5(random()::text), 1, 8);
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_generate_brand_voice_cache_key
  BEFORE INSERT ON brand_voice_jsons
  FOR EACH ROW
  EXECUTE FUNCTION generate_brand_voice_cache_key();

-- Validation function to ensure JSON matches Brand Voice Schema v1.0
CREATE OR REPLACE FUNCTION validate_brand_voice_json_schema(brand_voice_json jsonb)
RETURNS boolean AS $$
DECLARE
  required_keys text[] := ARRAY['schemaVersion', 'brand', 'visual', 'voice', 'compliance', 'channels', 'metadata'];
  key text;
BEGIN
  -- Check if all required top-level keys exist
  FOREACH key IN ARRAY required_keys
  LOOP
    IF NOT (brand_voice_json ? key) THEN
      RAISE EXCEPTION 'Missing required key: %', key;
    END IF;
  END LOOP;
  
  -- Validate schema version
  IF (brand_voice_json->>'schemaVersion') != '1.0' THEN
    RAISE EXCEPTION 'Invalid schema version. Expected 1.0, got: %', (brand_voice_json->>'schemaVersion');
  END IF;
  
  -- Validate brand section has required fields
  IF NOT (brand_voice_json->'brand' ? 'name') THEN
    RAISE EXCEPTION 'Missing required brand.name field';
  END IF;
  
  -- Validate voice section has required fields  
  IF NOT (brand_voice_json->'voice' ? 'tone') THEN
    RAISE EXCEPTION 'Missing required voice.tone field';
  END IF;
  
  RETURN true;
END;
$$ LANGUAGE plpgsql;

-- Constraint to validate JSON schema on insert/update
ALTER TABLE brand_voice_jsons 
  ADD CONSTRAINT check_brand_voice_json_valid 
  CHECK (validate_brand_voice_json_schema(brand_voice_json));

-- Function to extract name from JSON for materialized column
CREATE OR REPLACE FUNCTION extract_brand_voice_name()
RETURNS TRIGGER AS $$
BEGIN
  NEW.name = NEW.brand_voice_json->'brand'->>'name';
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_extract_brand_voice_name
  BEFORE INSERT OR UPDATE ON brand_voice_jsons
  FOR EACH ROW
  EXECUTE FUNCTION extract_brand_voice_name();

-- Create function for quality score recalculation
CREATE OR REPLACE FUNCTION recalculate_quality_scores(brand_voice_id uuid)
RETURNS void AS $$
DECLARE
  bv_record RECORD;
  completeness_score numeric(5,2);
  consistency_score numeric(5,2);
  specificity_score numeric(5,2);
  usability_score numeric(5,2);
  overall_score numeric(5,2);
BEGIN
  SELECT * INTO bv_record FROM brand_voice_jsons WHERE id = brand_voice_id;
  
  IF NOT FOUND THEN
    RAISE EXCEPTION 'Brand Voice JSON not found: %', brand_voice_id;
  END IF;
  
  -- Calculate completeness (0-100 based on filled fields)
  SELECT CASE 
    WHEN jsonb_array_length(jsonb_path_query_array(bv_record.brand_voice_json, '$.**{?"text" == ""}')) = 0 
    THEN 100.0
    ELSE 75.0
  END INTO completeness_score;
  
  -- Calculate consistency (simplified - can be enhanced with AI)
  consistency_score := 85.0;
  
  -- Calculate specificity (based on text length and detail level)
  SELECT CASE 
    WHEN length(bv_record.brand_voice_json->'brand'->>'description') > 100 
    THEN 90.0
    ELSE 70.0
  END INTO specificity_score;
  
  -- Calculate usability (based on complete sections)
  SELECT CASE 
    WHEN (bv_record.brand_voice_json->'channels') IS NOT NULL 
    THEN 95.0
    ELSE 80.0
  END INTO usability_score;
  
  -- Calculate overall score (weighted average)
  overall_score := (completeness_score * 0.3 + consistency_score * 0.25 + specificity_score * 0.25 + usability_score * 0.2);
  
  -- Update the record
  UPDATE brand_voice_jsons 
  SET 
    quality_score_completeness = completeness_score,
    quality_score_consistency = consistency_score,
    quality_score_specificity = specificity_score,
    quality_score_usability = usability_score,
    quality_score_overall = overall_score,
    last_validated_at = now()
  WHERE id = brand_voice_id;
END;
$$ LANGUAGE plpgsql;

-- Comments for documentation
COMMENT ON TABLE brand_voice_jsons IS 'Complete Brand Voice JSON Schema v1.0 storage with performance optimizations';
COMMENT ON COLUMN brand_voice_jsons.brand_voice_json IS 'Complete Brand Voice JSON Schema v1.0 document';
COMMENT ON COLUMN brand_voice_jsons.quality_score_overall IS 'Overall quality score (0-100) calculated from all metrics';
COMMENT ON COLUMN brand_voice_jsons.cache_key IS 'Unique cache key for Redis caching of generated content';
COMMENT ON COLUMN brand_voice_jsons.usage_count IS 'Number of times this brand voice was used for content generation';