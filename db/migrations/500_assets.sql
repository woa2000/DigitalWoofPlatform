-- Migration: Assets System
-- Description: Sistema completo de assets visuais e coleções
-- Created: 2025-09-07
-- Phase: 2 - Assets System

-- =============================================
-- ASSETS SYSTEM - PHASE 2
-- =============================================

-- Biblioteca de assets visuais
CREATE TABLE IF NOT EXISTS assets (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(200) NOT NULL,
    description TEXT,
    type TEXT NOT NULL,
    category VARCHAR(100) NOT NULL,
    format VARCHAR(10) NOT NULL,
    url TEXT NOT NULL,
    thumbnail_url TEXT NOT NULL,
    preview_url TEXT,
    file_size INTEGER NOT NULL,
    dimensions JSONB NOT NULL,
    tags JSONB,
    colors JSONB,
    pet_types JSONB,
    emotions JSONB,
    is_premium BOOLEAN DEFAULT false NOT NULL,
    is_public BOOLEAN DEFAULT true NOT NULL,
    usage_rights TEXT DEFAULT 'free' NOT NULL,
    usage_count INTEGER DEFAULT 0 NOT NULL,
    download_count INTEGER DEFAULT 0 NOT NULL,
    rating NUMERIC(3,2) DEFAULT 0.0,
    variants JSONB,
    metadata JSONB,
    created_by UUID,
    created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
    updated_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
    
    -- Constraints
    CONSTRAINT assets_name_length CHECK (char_length(name) >= 1 AND char_length(name) <= 200),
    CONSTRAINT assets_type_valid CHECK (type IN ('image', 'video', 'icon', 'template', 'background', 'illustration')),
    CONSTRAINT assets_format_valid CHECK (format IN ('jpg', 'png', 'svg', 'mp4', 'gif', 'webp')),
    CONSTRAINT assets_usage_rights_valid CHECK (usage_rights IN ('free', 'premium', 'restricted')),
    CONSTRAINT assets_file_size_positive CHECK (file_size > 0),
    CONSTRAINT assets_usage_count_positive CHECK (usage_count >= 0),
    CONSTRAINT assets_download_count_positive CHECK (download_count >= 0),
    CONSTRAINT assets_rating_range CHECK (rating >= 0 AND rating <= 5)
);

-- Coleções de assets organizadas
CREATE TABLE IF NOT EXISTS asset_collections (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(200) NOT NULL,
    description TEXT,
    tenant_id UUID REFERENCES tenants(id) ON DELETE CASCADE,
    is_public BOOLEAN DEFAULT false NOT NULL,
    created_by UUID NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
    updated_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
    
    -- Constraints
    CONSTRAINT asset_collections_name_length CHECK (char_length(name) >= 1 AND char_length(name) <= 200)
);

-- Itens dentro das coleções
CREATE TABLE IF NOT EXISTS asset_collection_items (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    collection_id UUID REFERENCES asset_collections(id) ON DELETE CASCADE NOT NULL,
    asset_id UUID REFERENCES assets(id) ON DELETE CASCADE NOT NULL,
    added_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
    
    -- Constraints
    CONSTRAINT asset_collection_items_unique_item UNIQUE(collection_id, asset_id)
);

-- Assets favoritos dos usuários
CREATE TABLE IF NOT EXISTS asset_favorites (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL,
    asset_id UUID REFERENCES assets(id) ON DELETE CASCADE NOT NULL,
    added_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
    
    -- Constraints
    CONSTRAINT asset_favorites_unique_user_asset UNIQUE(user_id, asset_id)
);

-- Analytics de uso dos assets
CREATE TABLE IF NOT EXISTS asset_analytics (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    asset_id UUID REFERENCES assets(id) ON DELETE CASCADE NOT NULL,
    user_id UUID,
    action TEXT NOT NULL,
    metadata JSONB,
    created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
    
    -- Constraints
    CONSTRAINT asset_analytics_action_valid CHECK (action IN ('view', 'download', 'favorite', 'unfavorite', 'share'))
);

-- Assets específicos da marca (logos, cores, etc.)
CREATE TABLE IF NOT EXISTS brand_assets (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL,
    tenant_id UUID REFERENCES tenants(id) ON DELETE CASCADE,
    type TEXT NOT NULL,
    name TEXT NOT NULL,
    file_name TEXT NOT NULL,
    file_url TEXT NOT NULL,
    metadata JSONB,
    created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
    
    -- Constraints
    CONSTRAINT brand_assets_type_valid CHECK (type IN ('logo', 'color_palette', 'typography', 'pattern', 'icon'))
);

-- Índices para performance
CREATE INDEX IF NOT EXISTS idx_assets_type ON assets(type);
CREATE INDEX IF NOT EXISTS idx_assets_category ON assets(category);
CREATE INDEX IF NOT EXISTS idx_assets_format ON assets(format);
CREATE INDEX IF NOT EXISTS idx_assets_is_premium ON assets(is_premium);
CREATE INDEX IF NOT EXISTS idx_assets_is_public ON assets(is_public);
CREATE INDEX IF NOT EXISTS idx_assets_usage_rights ON assets(usage_rights);
CREATE INDEX IF NOT EXISTS idx_assets_created_by ON assets(created_by);
CREATE INDEX IF NOT EXISTS idx_assets_rating ON assets(rating);

-- Índice GIN para busca em tags
CREATE INDEX IF NOT EXISTS idx_assets_tags_gin ON assets USING GIN (tags);
CREATE INDEX IF NOT EXISTS idx_assets_colors_gin ON assets USING GIN (colors);
CREATE INDEX IF NOT EXISTS idx_assets_pet_types_gin ON assets USING GIN (pet_types);

CREATE INDEX IF NOT EXISTS idx_asset_collections_tenant_id ON asset_collections(tenant_id);
CREATE INDEX IF NOT EXISTS idx_asset_collections_created_by ON asset_collections(created_by);
CREATE INDEX IF NOT EXISTS idx_asset_collections_is_public ON asset_collections(is_public);

CREATE INDEX IF NOT EXISTS idx_asset_collection_items_collection_id ON asset_collection_items(collection_id);
CREATE INDEX IF NOT EXISTS idx_asset_collection_items_asset_id ON asset_collection_items(asset_id);

CREATE INDEX IF NOT EXISTS idx_asset_favorites_user_id ON asset_favorites(user_id);
CREATE INDEX IF NOT EXISTS idx_asset_favorites_asset_id ON asset_favorites(asset_id);

CREATE INDEX IF NOT EXISTS idx_asset_analytics_asset_id ON asset_analytics(asset_id);
CREATE INDEX IF NOT EXISTS idx_asset_analytics_user_id ON asset_analytics(user_id);
CREATE INDEX IF NOT EXISTS idx_asset_analytics_action ON asset_analytics(action);

CREATE INDEX IF NOT EXISTS idx_brand_assets_user_id ON brand_assets(user_id);
CREATE INDEX IF NOT EXISTS idx_brand_assets_tenant_id ON brand_assets(tenant_id);
CREATE INDEX IF NOT EXISTS idx_brand_assets_type ON brand_assets(type);

-- Triggers
CREATE TRIGGER update_assets_updated_at 
    BEFORE UPDATE ON assets 
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_asset_collections_updated_at 
    BEFORE UPDATE ON asset_collections 
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Comentários
COMMENT ON TABLE assets IS 'Biblioteca de assets visuais com metadados e tags';
COMMENT ON TABLE asset_collections IS 'Coleções organizadas de assets';
COMMENT ON TABLE asset_collection_items IS 'Itens/assets dentro das coleções';
COMMENT ON TABLE asset_favorites IS 'Assets marcados como favoritos pelos usuários';
COMMENT ON TABLE asset_analytics IS 'Analytics de uso e interação com assets';
COMMENT ON TABLE brand_assets IS 'Assets específicos da marca (logos, paletas, etc.)';

-- Log
DO $$
BEGIN
    RAISE NOTICE '🎨 Sistema de Assets criado com sucesso';
    RAISE NOTICE '✅ assets: Biblioteca visual principal';
    RAISE NOTICE '✅ asset_collections: Coleções organizadas';
    RAISE NOTICE '✅ asset_favorites: Favoritos dos usuários';
    RAISE NOTICE '✅ asset_analytics: Analytics de uso';
    RAISE NOTICE '✅ brand_assets: Assets da marca';
END $$;