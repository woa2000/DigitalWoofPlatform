#!/usr/bin/env node

/**
 * Script para testar diferentes formatos de conexão com Supabase
 */

import postgres from 'postgres';

const PROJECT_REF = 'fzknihkqgjkcaoeecxfq';

// Diferentes formatos de URL para testar
const testUrls = [
  // Formato atual
  `postgresql://postgres:FugnSSHSrY7crTIG@db.${PROJECT_REF}.supabase.co:5432/postgres`,
  
  // Formato alternativo 1 - sem subdomínio db
  `postgresql://postgres:FugnSSHSrY7crTIG@${PROJECT_REF}.supabase.co:5432/postgres`,
  
  // Formato alternativo 2 - porta 6543 (pooler)
  `postgresql://postgres:FugnSSHSrY7crTIG@db.${PROJECT_REF}.supabase.co:6543/postgres`,
  
  // Formato alternativo 3 - pooler sem ssl
  `postgresql://postgres:FugnSSHSrY7crTIG@${PROJECT_REF}.supabase.co:6543/postgres`,
];

async function testConnection(url, index) {
  console.log(`\n🔍 Teste ${index + 1}: Testando conexão...`);
  console.log(`📋 URL: ${url.replace(/:[^:@]+@/, ':***@')}`);
  
  try {
    const sql = postgres(url, {
      max: 1,
      connect_timeout: 10,
      idle_timeout: 10,
    });
    
    const result = await sql`SELECT version()`;
    console.log(`✅ Sucesso! Versão PostgreSQL: ${result[0].version.substring(0, 50)}...`);
    
    await sql.end();
    return true;
    
  } catch (error) {
    console.log(`❌ Falhou: ${error.message}`);
    
    if (error.code === 'ENOTFOUND') {
      console.log(`   🔍 DNS não resolve o hostname`);
    } else if (error.code === 'ECONNREFUSED') {
      console.log(`   🔍 Conexão recusada - porta pode estar bloqueada`);
    } else if (error.code === '28P01') {
      console.log(`   🔍 Erro de autenticação - senha incorreta`);
    }
    
    return false;
  }
}

async function main() {
  console.log('🚀 Testador de Conexão Supabase - Digital Woof Platform');
  console.log(`📋 Project Ref: ${PROJECT_REF}\n`);
  
  let successCount = 0;
  
  for (let i = 0; i < testUrls.length; i++) {
    const success = await testConnection(testUrls[i], i);
    if (success) {
      successCount++;
      console.log(`\n🎉 URL funcional encontrada! Use esta no seu .env:`);
      console.log(`DATABASE_URL=${testUrls[i]}`);
      break;
    }
  }
  
  if (successCount === 0) {
    console.log(`\n❌ Nenhuma URL de conexão funcionou.`);
    console.log(`\n💡 Possíveis soluções:`);
    console.log(`1. Verificar se a senha está correta no dashboard Supabase`);
    console.log(`2. Verificar se o projeto não foi pausado`);
    console.log(`3. Verificar se há restrições de IP`);
    console.log(`4. Tentar conectar via pooler (porta 6543)`);
    console.log(`\n📖 Acesse: https://supabase.com/dashboard/project/${PROJECT_REF}/settings/database`);
  }
}

main().catch(console.error);