#!/usr/bin/env node

/**
 * Script para testar diferentes formatos de conexão Supabase
 */

import 'dotenv/config';
import postgres from 'postgres';

const projectRef = 'fzknihkqgjkcaoeecxfq';
const password = 'FugnSSHSrY7crTIG';

// Diferentes formatos de URL de conexão
const connectionStrings = [
  // Formato original (atual no .env)
  `postgresql://postgres:${password}@db.${projectRef}.supabase.co:5432/postgres`,
  
  // Connection Pooler (porta 6543)
  `postgresql://postgres:${password}@db.${projectRef}.supabase.co:6543/postgres?pgbouncer=true`,
  
  // Formato alternativo sem SSL
  `postgresql://postgres:${password}@db.${projectRef}.supabase.co:5432/postgres?sslmode=disable`,
  
  // Formato com SSL require
  `postgresql://postgres:${password}@db.${projectRef}.supabase.co:5432/postgres?sslmode=require`,
  
  // Pooler mode transaction
  `postgresql://postgres.${projectRef}:${password}@aws-0-us-east-1.pooler.supabase.com:6543/postgres`,
  
  // Pooler mode session
  `postgresql://postgres.${projectRef}:${password}@aws-0-us-east-1.pooler.supabase.com:5432/postgres`,
];

async function testConnection(url, index) {
  console.log(`\n🔍 Teste ${index + 1}: ${url.replace(password, '***PASSWORD***')}`);
  
  try {
    const client = postgres(url, {
      max: 1,
      connect_timeout: 10,
      ssl: url.includes('sslmode=disable') ? false : 'require',
    });
    
    const result = await client`SELECT 1 as test`;
    console.log(`✅ Conexão ${index + 1} SUCESSO!`);
    
    // Teste adicional
    const version = await client`SELECT version()`;
    console.log(`📊 PostgreSQL: ${version[0].version.substring(0, 50)}...`);
    
    await client.end();
    return { success: true, url, index: index + 1 };
    
  } catch (error) {
    console.log(`❌ Conexão ${index + 1} FALHOU: ${error.message}`);
    return { success: false, url, error: error.message, index: index + 1 };
  }
}

async function main() {
  console.log('🚀 Testando múltiplos formatos de conexão Supabase\n');
  console.log(`📋 Projeto: ${projectRef}`);
  console.log(`🔐 Password: ${password.substring(0, 4)}***\n`);
  
  const results = [];
  
  for (let i = 0; i < connectionStrings.length; i++) {
    const result = await testConnection(connectionStrings[i], i);
    results.push(result);
    
    if (result.success) {
      console.log(`\n🎉 ENCONTRADO! Use a conexão ${result.index}`);
      console.log(`📝 URL: ${result.url}`);
      break;
    }
  }
  
  const successfulConnections = results.filter(r => r.success);
  
  if (successfulConnections.length === 0) {
    console.log('\n❌ Nenhuma conexão funcionou. Possíveis causas:');
    console.log('1. 🔑 Senha incorreta');
    console.log('2. 🌐 Projeto pausado/inativo');
    console.log('3. 🔒 Acesso direto ao DB desabilitado');
    console.log('4. 🏗️ Projeto ainda inicializando');
    console.log('\n💡 Próximos passos:');
    console.log('- Verificar senha no dashboard Supabase');
    console.log('- Confirmar se o projeto está ativo');
    console.log('- Tentar recriar o projeto se necessário');
  } else {
    console.log(`\n✅ Conexão funcionando! Use o formato ${successfulConnections[0].index}`);
  }
}

main().catch(console.error);