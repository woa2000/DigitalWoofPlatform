#!/usr/bin/env node

/**
 * Script para executar migrações usando conexão PostgreSQL direta com Service Role Key
 * Usa a mesma abordagem do Drizzle, mas com fallback para instruções manuais
 */

import 'dotenv/config';
import postgres from 'postgres';

const SUPABASE_URL = process.env.SUPABASE_URL;
const SUPABASE_SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!SUPABASE_URL || !SUPABASE_SERVICE_ROLE_KEY) {
  console.error('❌ Credenciais Supabase não configuradas');
  process.exit(1);
}

// Construir URL de conexão PostgreSQL usando Service Role Key
// Formato: postgresql://postgres:[SERVICE_ROLE_KEY]@db.[project-ref].supabase.co:5432/postgres
const projectRef = SUPABASE_URL.replace('https://', '').replace('.supabase.co', '');
const postgresUrl = `postgresql://postgres.${projectRef}:${SUPABASE_SERVICE_ROLE_KEY}@aws-0-us-east-1.pooler.supabase.com:5432/postgres`;

console.log('🚀 Executando migrações via PostgreSQL pooler...\n');
console.log(`📋 Projeto: ${projectRef}`);
console.log(`🔗 Usando pooler connection\n`);

// SQL das migrações
const migrations = [
  {
    name: 'Enable UUID extension',
    sql: `CREATE EXTENSION IF NOT EXISTS "uuid-ossp";`
  },
  {
    name: 'Create profiles table',
    sql: `
      CREATE TABLE IF NOT EXISTS profiles (
        id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
        full_name TEXT,
        avatar_url TEXT,
        business_name TEXT,
        business_type TEXT,
        phone TEXT,
        website TEXT,
        address TEXT,
        city TEXT,
        state TEXT,
        zip_code TEXT,
        country TEXT DEFAULT 'BR',
        plan_type TEXT DEFAULT 'free',
        subscription_status TEXT DEFAULT 'active',
        subscription_end_date TIMESTAMP WITH TIME ZONE,
        onboarding_completed BOOLEAN DEFAULT false,
        onboarding_step TEXT DEFAULT 'welcome',
        timezone TEXT DEFAULT 'America/Sao_Paulo',
        language TEXT DEFAULT 'pt-BR',
        notifications JSONB DEFAULT '{"email": true, "browser": true, "marketing": false}',
        created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
        updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
      );
    `
  },
  {
    name: 'Create brand_onboarding table',
    sql: `
      CREATE TABLE IF NOT EXISTS brand_onboarding (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
        brand_name TEXT,
        brand_description TEXT,
        brand_values JSONB,
        brand_personality JSONB,
        target_audience TEXT,
        unique_selling_proposition TEXT,
        brand_voice_tone TEXT,
        business_category TEXT,
        business_size TEXT,
        years_in_business INTEGER,
        main_services JSONB,
        service_area TEXT,
        competitors JSONB,
        has_website BOOLEAN DEFAULT false,
        website_url TEXT,
        social_media_presence JSONB,
        current_marketing_channels JSONB,
        marketing_budget_range TEXT,
        primary_goals JSONB,
        success_metrics JSONB,
        content_themes JSONB,
        preferred_content_types JSONB,
        posting_frequency TEXT,
        brand_guidelines_exist BOOLEAN DEFAULT false,
        status TEXT DEFAULT 'draft',
        completed_steps JSONB DEFAULT '[]',
        current_step TEXT DEFAULT 'brand-identity',
        created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
        updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
      );
    `
  },
  {
    name: 'Create campaigns table',
    sql: `
      CREATE TABLE IF NOT EXISTS campaigns (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
        title TEXT NOT NULL,
        description TEXT,
        campaign_type TEXT,
        status TEXT DEFAULT 'draft',
        start_date TIMESTAMP WITH TIME ZONE,
        end_date TIMESTAMP WITH TIME ZONE,
        target_audience TEXT,
        budget_range TEXT,
        expected_reach INTEGER,
        content_themes JSONB,
        hashtags JSONB,
        visual_style JSONB,
        call_to_action TEXT,
        primary_goal TEXT,
        success_metrics JSONB,
        kpis JSONB,
        generated_content JSONB,
        ai_suggestions JSONB,
        created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
        updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
      );
    `
  },
  {
    name: 'Create ai_content table',
    sql: `
      CREATE TABLE IF NOT EXISTS ai_content (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
        campaign_id UUID REFERENCES campaigns(id) ON DELETE CASCADE,
        content_type TEXT NOT NULL,
        platform TEXT,
        title TEXT,
        content TEXT NOT NULL,
        hashtags JSONB,
        visual_suggestions JSONB,
        prompt_used TEXT,
        ai_model TEXT,
        generation_params JSONB,
        status TEXT DEFAULT 'draft',
        approval_status TEXT DEFAULT 'pending',
        scheduled_date TIMESTAMP WITH TIME ZONE,
        published_date TIMESTAMP WITH TIME ZONE,
        engagement_metrics JSONB,
        created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
        updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
      );
    `
  },
  {
    name: 'Create brand_voice_jsons table',
    sql: `
      CREATE TABLE IF NOT EXISTS brand_voice_jsons (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
        name TEXT NOT NULL,
        description TEXT,
        brand_voice JSONB NOT NULL,
        status TEXT DEFAULT 'active',
        version INTEGER DEFAULT 1,
        is_default BOOLEAN DEFAULT false,
        created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
        updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
      );
    `
  },
  {
    name: 'Enable RLS and create policies',
    sql: `
      -- Enable RLS
      ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
      ALTER TABLE brand_onboarding ENABLE ROW LEVEL SECURITY;
      ALTER TABLE campaigns ENABLE ROW LEVEL SECURITY;
      ALTER TABLE ai_content ENABLE ROW LEVEL SECURITY;
      ALTER TABLE brand_voice_jsons ENABLE ROW LEVEL SECURITY;
      
      -- Create policies
      CREATE POLICY IF NOT EXISTS "Users can view own profile" ON profiles FOR SELECT USING (auth.uid() = id);
      CREATE POLICY IF NOT EXISTS "Users can update own profile" ON profiles FOR UPDATE USING (auth.uid() = id);
      CREATE POLICY IF NOT EXISTS "Users can insert own profile" ON profiles FOR INSERT WITH CHECK (auth.uid() = id);
      
      CREATE POLICY IF NOT EXISTS "Users can view own brand onboarding" ON brand_onboarding FOR SELECT USING (auth.uid() = user_id);
      CREATE POLICY IF NOT EXISTS "Users can update own brand onboarding" ON brand_onboarding FOR UPDATE USING (auth.uid() = user_id);
      CREATE POLICY IF NOT EXISTS "Users can insert own brand onboarding" ON brand_onboarding FOR INSERT WITH CHECK (auth.uid() = user_id);
      
      CREATE POLICY IF NOT EXISTS "Users can view own campaigns" ON campaigns FOR SELECT USING (auth.uid() = user_id);
      CREATE POLICY IF NOT EXISTS "Users can update own campaigns" ON campaigns FOR UPDATE USING (auth.uid() = user_id);
      CREATE POLICY IF NOT EXISTS "Users can insert own campaigns" ON campaigns FOR INSERT WITH CHECK (auth.uid() = user_id);
      CREATE POLICY IF NOT EXISTS "Users can delete own campaigns" ON campaigns FOR DELETE USING (auth.uid() = user_id);
      
      CREATE POLICY IF NOT EXISTS "Users can view own ai content" ON ai_content FOR SELECT USING (auth.uid() = user_id);
      CREATE POLICY IF NOT EXISTS "Users can update own ai content" ON ai_content FOR UPDATE USING (auth.uid() = user_id);
      CREATE POLICY IF NOT EXISTS "Users can insert own ai content" ON ai_content FOR INSERT WITH CHECK (auth.uid() = user_id);
      CREATE POLICY IF NOT EXISTS "Users can delete own ai content" ON ai_content FOR DELETE USING (auth.uid() = user_id);
      
      CREATE POLICY IF NOT EXISTS "Users can view own brand voice" ON brand_voice_jsons FOR SELECT USING (auth.uid() = user_id);
      CREATE POLICY IF NOT EXISTS "Users can update own brand voice" ON brand_voice_jsons FOR UPDATE USING (auth.uid() = user_id);
      CREATE POLICY IF NOT EXISTS "Users can insert own brand voice" ON brand_voice_jsons FOR INSERT WITH CHECK (auth.uid() = user_id);
      CREATE POLICY IF NOT EXISTS "Users can delete own brand voice" ON brand_voice_jsons FOR DELETE USING (auth.uid() = user_id);
    `
  }
];

async function runMigrations() {
  let client;
  
  try {
    // Tentar diferentes conexões pooler
    const poolerUrls = [
      `postgresql://postgres.${projectRef}:${SUPABASE_SERVICE_ROLE_KEY}@aws-0-us-east-1.pooler.supabase.com:5432/postgres`,
      `postgresql://postgres.${projectRef}:${SUPABASE_SERVICE_ROLE_KEY}@aws-0-us-east-1.pooler.supabase.com:6543/postgres`,
      `postgresql://postgres.${projectRef}:${SUPABASE_SERVICE_ROLE_KEY}@aws-0-sa-east-1.pooler.supabase.com:5432/postgres`,
      `postgresql://postgres.${projectRef}:${SUPABASE_SERVICE_ROLE_KEY}@aws-0-sa-east-1.pooler.supabase.com:6543/postgres`,
    ];
    
    let connected = false;
    
    for (const url of poolerUrls) {
      try {
        console.log(`🔄 Tentando conexão: ${url.replace(SUPABASE_SERVICE_ROLE_KEY, '***KEY***')}`);
        client = postgres(url, {
          max: 1,
          ssl: 'require',
          connect_timeout: 10,
        });
        
        // Teste de conectividade
        await client`SELECT 1`;
        console.log('✅ Conexão estabelecida!\n');
        connected = true;
        break;
        
      } catch (err) {
        console.log(`❌ Falhou: ${err.message}`);
        if (client) {
          try { await client.end(); } catch {}
        }
      }
    }
    
    if (!connected) {
      throw new Error('Não foi possível conectar ao banco via pooler');
    }
    
    // Executar migrações
    console.log('🔧 Executando migrações...\n');
    
    for (let i = 0; i < migrations.length; i++) {
      const migration = migrations[i];
      console.log(`${i + 1}/${migrations.length} ${migration.name}...`);
      
      try {
        await client.unsafe(migration.sql);
        console.log(`✅ ${migration.name} - Concluído`);
      } catch (err) {
        console.log(`⚠️  ${migration.name} - ${err.message}`);
        // Continuar com próximas migrações mesmo se uma falhar
      }
      
      console.log('');
    }
    
    console.log('🎉 Migrações concluídas!');
    
  } catch (error) {
    console.error('❌ Erro fatal:', error.message);
    console.log('\n💡 Alternativa: Execute o SQL manualmente no Supabase Dashboard');
    console.log('   Arquivo: scripts/create-tables.sql');
    process.exit(1);
  } finally {
    if (client) {
      try {
        await client.end();
      } catch {}
    }
  }
}

runMigrations();