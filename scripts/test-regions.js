#!/usr/bin/env node

/**
 * Script para testar conexões Supabase com diferentes regiões
 */

import 'dotenv/config';
import postgres from 'postgres';

const projectRef = 'fzknihkqgjkcaoeecxfq';
const password = 'FugnSSHSrY7crTIG';

// Diferentes regiões de pooler
const poolerRegions = [
  'aws-0-us-east-1',
  'aws-0-us-west-1', 
  'aws-0-eu-west-1',
  'aws-0-ap-southeast-1',
  'aws-0-sa-east-1', // São Paulo
  'aws-0-us-west-2',
  'aws-0-eu-central-1',
  'aws-0-ap-northeast-1',
];

async function testPoolerConnection(region, port, mode) {
  const url = `postgresql://postgres.${projectRef}:${password}@${region}.pooler.supabase.com:${port}/postgres`;
  const description = `${region} porta ${port} (${mode})`;
  
  console.log(`🔍 Testando: ${description}`);
  
  try {
    const client = postgres(url, {
      max: 1,
      connect_timeout: 10,
      ssl: 'require',
    });
    
    const result = await client`SELECT 1 as test`;
    console.log(`✅ SUCESSO: ${description}`);
    
    await client.end();
    return { success: true, url, region, port, mode };
    
  } catch (error) {
    console.log(`❌ FALHOU: ${description} - ${error.message}`);
    return { success: false, region, port, mode, error: error.message };
  }
}

async function main() {
  console.log('🌍 Testando conexões Supabase em diferentes regiões\n');
  
  for (const region of poolerRegions) {
    console.log(`\n🌐 Região: ${region}`);
    
    // Testa porta 6543 (transaction mode)
    const result6543 = await testPoolerConnection(region, 6543, 'transaction');
    if (result6543.success) {
      console.log(`\n🎉 CONEXÃO ENCONTRADA!`);
      console.log(`📝 URL: ${result6543.url}`);
      console.log(`\n✏️ Atualize seu .env com:`);
      console.log(`DATABASE_URL=${result6543.url}`);
      return;
    }
    
    // Testa porta 5432 (session mode)
    const result5432 = await testPoolerConnection(region, 5432, 'session');
    if (result5432.success) {
      console.log(`\n🎉 CONEXÃO ENCONTRADA!`);
      console.log(`📝 URL: ${result5432.url}`);
      console.log(`\n✏️ Atualize seu .env com:`);
      console.log(`DATABASE_URL=${result5432.url}`);
      return;
    }
  }
  
  console.log('\n❌ Nenhuma região funcionou.');
  console.log('\n💡 Isso indica que:');
  console.log('1. 🔑 A senha pode estar incorreta');
  console.log('2. 🏗️ O projeto pode não estar totalmente ativo');
  console.log('3. 🔒 O acesso ao banco pode estar restrito');
  console.log('\n📋 Verifique no dashboard Supabase:');
  console.log('- Settings → Database → Connection string');
  console.log('- Confirm se o projeto está "Active"');
  console.log('- Verifique se a senha está correta');
}

main().catch(console.error);