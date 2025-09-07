#!/usr/bin/env node

/**
 * Script para executar migrações via Supabase Client
 * Como a conexão PostgreSQL direta não funciona, usamos a API REST
 */

import 'dotenv/config';
import { createClient } from '@supabase/supabase-js';
import fs from 'fs';
import path from 'path';

const SUPABASE_URL = process.env.SUPABASE_URL;
const SUPABASE_SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!SUPABASE_URL) {
  console.error('❌ SUPABASE_URL não configurado no .env');
  process.exit(1);
}

if (!SUPABASE_SERVICE_ROLE_KEY) {
  console.error('❌ SUPABASE_SERVICE_ROLE_KEY não configurado no .env');
  console.log('💡 Você precisa da Service Role Key para executar migrações');
  console.log('   Acesse: Supabase Dashboard → Settings → API → Service Role Key');
  process.exit(1);
}

// Criar client com service role key para operações admin
const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);

async function executeSQL(sql, description) {
  console.log(`🔧 Executando: ${description}`);
  
  try {
    const { data, error } = await supabase.rpc('exec_sql', { 
      sql_query: sql 
    });
    
    if (error) {
      console.error(`❌ Erro: ${error.message}`);
      return false;
    }
    
    console.log(`✅ Sucesso: ${description}`);
    return true;
  } catch (err) {
    console.error(`❌ Erro executando SQL: ${err.message}`);
    return false;
  }
}

async function executeSQLDirect(sql, description) {
  console.log(`🔧 Executando: ${description}`);
  
  try {
    // Para comandos DDL, usamos uma abordagem diferente
    const response = await fetch(`${SUPABASE_URL}/rest/v1/rpc/exec_sql`, {
      method: 'POST',
      headers: {
        'apikey': SUPABASE_SERVICE_ROLE_KEY,
        'Authorization': `Bearer ${SUPABASE_SERVICE_ROLE_KEY}`,
        'Content-Type': 'application/json',
        'Accept': 'application/json'
      },
      body: JSON.stringify({
        sql_query: sql
      })
    });
    
    if (!response.ok) {
      const errorText = await response.text();
      console.error(`❌ Erro HTTP ${response.status}: ${errorText}`);
      return false;
    }
    
    console.log(`✅ Sucesso: ${description}`);
    return true;
  } catch (err) {
    console.error(`❌ Erro: ${err.message}`);
    return false;
  }
}

async function createTables() {
  console.log('🚀 Iniciando criação de tabelas no Supabase...\n');
  
  // SQL dividido em comandos menores para melhor compatibilidade
  const sqlCommands = [
    {
      sql: `CREATE EXTENSION IF NOT EXISTS "uuid-ossp";`,
      description: 'Habilitando extensão UUID'
    },
    {
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
      `,
      description: 'Criando tabela profiles'
    },
    {
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
      `,
      description: 'Criando tabela brand_onboarding'
    },
    {
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
      `,
      description: 'Criando tabela campaigns'
    },
    {
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
      `,
      description: 'Criando tabela ai_content'
    },
    {
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
      `,
      description: 'Criando tabela brand_voice_jsons'
    }
  ];
  
  let successCount = 0;
  
  for (const command of sqlCommands) {
    // Tentar via RPC primeiro
    let success = await executeSQL(command.sql, command.description);
    
    // Se falhar, tentar via REST direto
    if (!success) {
      console.log('🔄 Tentando método alternativo...');
      success = await executeSQLDirect(command.sql, command.description + ' (método alternativo)');
    }
    
    if (success) {
      successCount++;
    }
    
    console.log(''); // linha em branco
  }
  
  console.log(`\n📊 Resultado: ${successCount}/${sqlCommands.length} comandos executados com sucesso`);
  
  if (successCount === sqlCommands.length) {
    console.log('🎉 Todas as tabelas foram criadas com sucesso!');
    console.log('\n📋 Próximos passos:');
    console.log('1. npm run db:test  # Verificar se as tabelas foram criadas');
    console.log('2. npm run dev      # Iniciar aplicação');
  } else {
    console.log('⚠️  Algumas tabelas podem não ter sido criadas corretamente');
    console.log('💡 Tente executar o SQL manualmente no Supabase Dashboard');
  }
}

async function main() {
  try {
    await createTables();
  } catch (error) {
    console.error('❌ Erro fatal:', error.message);
    console.log('\n💡 Alternativa: Execute o SQL manualmente');
    console.log('   Arquivo: scripts/create-tables.sql');
    console.log('   Local: Supabase Dashboard → SQL Editor');
    process.exit(1);
  }
}

main();