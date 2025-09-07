#!/usr/bin/env node

/**
 * Teste da nova configuração de banco com fallback
 */

import 'dotenv/config';

async function testFallbackConnection() {
  console.log('🚀 Testando conexão com fallback...\n');
  
  try {
    const { connectionPromise } = await import('../server/db-fallback.ts');
    const connection = await connectionPromise;
    
    console.log(`✅ Conexão estabelecida usando: ${connection.type}`);
    
    if (connection.type === 'postgres') {
      // Teste com Drizzle
      const { db } = await import('../server/db-fallback.ts');
      const drizzleDb = await db;
      const result = await drizzleDb.execute({ sql: 'SELECT version()', values: [] });
      console.log('📊 PostgreSQL Version:', result[0]?.version?.substring(0, 50) + '...');
      
    } else if (connection.type === 'supabase') {
      // Teste com Supabase Client
      const result = await connection.db
        .from('users')
        .select('count')
        .limit(1);
        
      if (result.error) {
        console.log('⚠️ Erro esperado (tabela não existe):', result.error.message);
        console.log('💡 Isso é normal se o schema ainda não foi aplicado');
      } else {
        console.log('📊 Dados encontrados:', result.data);
      }
      
      // Teste de sistema
      const { data, error } = await connection.db.auth.getUser();
      console.log('🔐 Sistema de auth disponível:', !error ? 'Sim' : 'Não autenticado (normal)');
    }
    
    console.log('\n✅ Teste de fallback bem-sucedido!');
    
  } catch (error) {
    console.error('❌ Erro no teste de fallback:', error.message);
    process.exit(1);
  }
}

testFallbackConnection();