#!/usr/bin/env node

/**
 * Script alternativo para mostrar instruções de migração manual
 * e tentar alguns comandos básicos
 */

import 'dotenv/config';
import { createClient } from '@supabase/supabase-js';
import fs from 'fs';
import path from 'path';

const SUPABASE_URL = process.env.SUPABASE_URL;
const SUPABASE_ANON_KEY = process.env.SUPABASE_ANON_KEY;

if (!SUPABASE_URL || !SUPABASE_ANON_KEY) {
  console.error('❌ Credenciais Supabase não configuradas');
  process.exit(1);
}

const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

async function checkTables() {
  console.log('🔍 Verificando tabelas existentes...\n');
  
  const tablesToCheck = [
    'profiles',
    'brand_onboarding', 
    'campaigns',
    'ai_content',
    'brand_voice_jsons'
  ];
  
  const results = [];
  
  for (const table of tablesToCheck) {
    try {
      const { data, error } = await supabase
        .from(table)
        .select('count')
        .limit(1);
        
      if (error) {
        if (error.message.includes('does not exist') || error.message.includes('schema cache')) {
          console.log(`❌ ${table} - Não existe`);
          results.push({ table, exists: false, error: error.message });
        } else {
          console.log(`⚠️  ${table} - ${error.message}`);
          results.push({ table, exists: false, error: error.message });
        }
      } else {
        console.log(`✅ ${table} - Existe e acessível`);
        results.push({ table, exists: true });
      }
    } catch (e) {
      console.log(`❌ ${table} - Erro: ${e.message}`);
      results.push({ table, exists: false, error: e.message });
    }
  }
  
  const missingTables = results.filter(r => !r.exists);
  
  if (missingTables.length === 0) {
    console.log('\n🎉 Todas as tabelas já existem!');
    return true;
  } else {
    console.log(`\n⚠️  ${missingTables.length} tabela(s) precisam ser criadas:`);
    missingTables.forEach(t => console.log(`   - ${t.table}`));
    return false;
  }
}

function showManualInstructions() {
  console.log('\n📋 INSTRUÇÕES PARA CRIAR TABELAS MANUALMENTE:\n');
  
  console.log('1. 🌐 Acesse o Supabase Dashboard:');
  console.log(`   ${SUPABASE_URL.replace('/rest/v1', '')}`);
  
  console.log('\n2. 📝 Vá para o SQL Editor:');
  console.log('   Dashboard → SQL Editor → New Query');
  
  console.log('\n3. 📋 Copie e execute o SQL:');
  console.log('   Arquivo: scripts/create-tables.sql');
  console.log('   Ou use o conteúdo abaixo:\n');
  
  console.log('━'.repeat(60));
  
  // SQL simplificado para copy-paste
  const sqlContent = `
-- Criar tabelas principais
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Tabela de perfis
CREATE TABLE IF NOT EXISTS profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  full_name TEXT,
  business_name TEXT,
  business_type TEXT,
  onboarding_completed BOOLEAN DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Tabela de onboarding
CREATE TABLE IF NOT EXISTS brand_onboarding (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  brand_name TEXT,
  brand_description TEXT,
  status TEXT DEFAULT 'draft',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Tabela de campanhas
CREATE TABLE IF NOT EXISTS campaigns (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  description TEXT,
  status TEXT DEFAULT 'draft',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- RLS Policies
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE brand_onboarding ENABLE ROW LEVEL SECURITY;
ALTER TABLE campaigns ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own profile" ON profiles FOR ALL USING (auth.uid() = id);
CREATE POLICY "Users can manage own data" ON brand_onboarding FOR ALL USING (auth.uid() = user_id);
CREATE POLICY "Users can manage own campaigns" ON campaigns FOR ALL USING (auth.uid() = user_id);
`;

  console.log(sqlContent);
  console.log('━'.repeat(60));
  
  console.log('\n4. ▶️ Execute o SQL clicando em "Run"');
  console.log('\n5. ✅ Verifique se não há erros');
  console.log('\n6. 🧪 Teste a conexão:');
  console.log('   npm run db:test');
}

async function main() {
  console.log('🚀 Verificador de Migrações Supabase\n');
  
  const allTablesExist = await checkTables();
  
  if (!allTablesExist) {
    showManualInstructions();
    
    console.log('\n💡 ALTERNATIVAS:');
    console.log('1. Configurar Service Role Key no .env e usar scripts/run-migrations.js');
    console.log('2. Executar SQL manualmente no dashboard (recomendado)');
    console.log('3. Usar ferramentas como pgAdmin ou psql (se disponível)');
    
    console.log('\n🔑 Para obter Service Role Key:');
    console.log('   Supabase Dashboard → Settings → API → Service Role Key');
  } else {
    console.log('\n🎉 Migrações já aplicadas! Aplicação pronta para uso.');
  }
}

main().catch(console.error);