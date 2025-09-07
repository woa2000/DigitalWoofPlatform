#!/usr/bin/env node

/**
 * Teste usando a API REST do Supabase para verificar se conseguimos acessar dados
 */

import 'dotenv/config';

const SUPABASE_URL = 'https://fzknihkqgjkcaoeecxfq.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImZ6a25paGtxZ2prY2FvZWVjeGZxIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTYxODAyOTEsImV4cCI6MjA3MTc1NjI5MX0.ENulkfJ-6ljx54UYWq-EDRRHjo-E6oNL_MniG6cdrdU';

async function testRestAPI() {
  console.log('🔍 Testando API REST do Supabase...\n');
  
  try {
    // Teste 1: Verificar se a API está funcionando
    const response = await fetch(`${SUPABASE_URL}/rest/v1/`, {
      headers: {
        'apikey': SUPABASE_ANON_KEY,
        'Authorization': `Bearer ${SUPABASE_ANON_KEY}`,
        'Content-Type': 'application/json'
      }
    });
    
    console.log(`📊 Status da API: ${response.status}`);
    
    if (response.status === 200) {
      console.log('✅ API REST funcionando!');
      
      // Teste 2: Listar tabelas existentes
      const tablesResponse = await fetch(`${SUPABASE_URL}/rest/v1/`, {
        headers: {
          'apikey': SUPABASE_ANON_KEY,
          'Authorization': `Bearer ${SUPABASE_ANON_KEY}`,
          'Accept': 'application/vnd.pgrst.object+json'
        }
      });
      
      const apiInfo = await tablesResponse.json();
      console.log('📋 Informações da API:', apiInfo);
      
    } else {
      console.log('❌ Problema com a API REST');
      const errorText = await response.text();
      console.log('🔍 Erro:', errorText);
    }
    
  } catch (error) {
    console.error('❌ Erro ao testar API REST:', error.message);
  }
}

async function testSupabaseClient() {
  console.log('\n🔍 Testando Supabase Client...\n');
  
  try {
    // Importação dinâmica para evitar problemas de módulo
    const { createClient } = await import('@supabase/supabase-js');
    
    const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
    
    // Teste simples
    const { data, error } = await supabase.from('users').select('count').limit(1);
    
    if (error) {
      console.log('⚠️ Erro esperado (tabela pode não existir):', error.message);
      console.log('💡 Isso é normal se o schema ainda não foi aplicado');
    } else {
      console.log('✅ Supabase Client funcionando!');
      console.log('📊 Dados:', data);
    }
    
    // Teste de funções básicas
    const { data: authData, error: authError } = await supabase.auth.getUser();
    console.log('🔐 Status de autenticação:', authError ? 'Não autenticado (normal)' : 'Autenticado');
    
  } catch (error) {
    console.error('❌ Erro no Supabase Client:', error.message);
  }
}

async function main() {
  console.log('🚀 Teste de Conectividade Supabase via API\n');
  console.log(`📋 URL: ${SUPABASE_URL}`);
  console.log(`🔑 Key: ${SUPABASE_ANON_KEY.substring(0, 20)}...\n`);
  
  await testRestAPI();
  await testSupabaseClient();
  
  console.log('\n📋 PRÓXIMOS PASSOS:');
  console.log('1. Se a API REST funcionar, podemos usar Supabase-js como alternativa');
  console.log('2. Vamos configurar o Drizzle para usar a API REST em vez de conexão direta');
  console.log('3. Ou investigar mais a fundo a configuração do banco PostgreSQL');
}

main().catch(console.error);