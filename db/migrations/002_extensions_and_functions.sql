-- Migration: Extensions and Basic Functions
-- Description: Instalar extensões necessárias e funções básicas do sistema
-- Created: 2025-09-07
-- Phase: 2 - Foundation Setup

-- =============================================
-- EXTENSIONS AND FUNCTIONS - PHASE 2
-- =============================================

-- Instalar extensões necessárias
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pg_trgm"; -- Para busca de texto
CREATE EXTENSION IF NOT EXISTS "unaccent"; -- Para normalização de texto

-- Função para atualizar updated_at automaticamente
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Função para gerar slug único
CREATE OR REPLACE FUNCTION generate_unique_slug(base_name TEXT, table_name TEXT DEFAULT 'tenants')
RETURNS TEXT AS $$
DECLARE
    base_slug TEXT;
    final_slug TEXT;
    counter INTEGER := 0;
    sql_query TEXT;
    slug_exists BOOLEAN;
BEGIN
    -- Normalizar para slug
    base_slug := LOWER(REGEXP_REPLACE(base_name, '[^a-zA-Z0-9]+', '-', 'g'));
    base_slug := TRIM(BOTH '-' FROM base_slug);
    
    -- Se vazio, usar default
    IF base_slug = '' THEN
        base_slug := 'item';
    END IF;
    
    final_slug := base_slug;
    
    -- Verificar se existe e gerar variante se necessário
    LOOP
        sql_query := format('SELECT EXISTS(SELECT 1 FROM %I WHERE slug = $1)', table_name);
        EXECUTE sql_query USING final_slug INTO slug_exists;
        
        EXIT WHEN NOT slug_exists;
        
        counter := counter + 1;
        final_slug := base_slug || '-' || counter;
    END LOOP;
    
    RETURN final_slug;
END;
$$ LANGUAGE plpgsql;

-- Função para validar email
CREATE OR REPLACE FUNCTION is_valid_email(email TEXT)
RETURNS BOOLEAN AS $$
BEGIN
    RETURN email ~* '^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}$';
END;
$$ LANGUAGE plpgsql IMMUTABLE;

-- Função para calcular score de qualidade
CREATE OR REPLACE FUNCTION calculate_quality_score(
    completeness NUMERIC DEFAULT 0,
    consistency NUMERIC DEFAULT 0,
    specificity NUMERIC DEFAULT 0,
    usability NUMERIC DEFAULT 0
)
RETURNS NUMERIC AS $$
BEGIN
    RETURN ROUND(
        (completeness * 0.3 + consistency * 0.25 + specificity * 0.25 + usability * 0.2),
        2
    );
END;
$$ LANGUAGE plpgsql IMMUTABLE;

-- Log de setup
DO $$
BEGIN
    RAISE NOTICE '🔧 Extensões e funções básicas instaladas';
    RAISE NOTICE '✅ uuid-ossp: Geração de UUIDs';
    RAISE NOTICE '✅ pg_trgm: Busca de texto otimizada';
    RAISE NOTICE '✅ unaccent: Normalização de caracteres';
    RAISE NOTICE '⚙️ Funções utilitárias criadas';
END $$;