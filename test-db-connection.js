import 'dotenv/config';
import { db } from './server/db.js';
import { sql } from 'drizzle-orm';

async function testConnection() {
  try {
    console.log('🔍 Testando conexão com o banco de dados...');
    
    // Teste básico de conectividade
    const result = await db.execute(sql`SELECT version()`);
    console.log('✅ Conexão estabelecida com sucesso!');
    console.log('📊 Versão do PostgreSQL:', result[0].version);
    
    // Teste das tabelas (verifica se o schema foi aplicado)
    const tables = await db.execute(sql`
      SELECT table_name 
      FROM information_schema.tables 
      WHERE table_schema = 'public' 
      ORDER BY table_name
    `);
    
    console.log('\n📋 Tabelas encontradas:');
    if (tables.length === 0) {
      console.log('⚠️  Nenhuma tabela encontrada. Execute "npm run db:push" para criar o schema.');
    } else {
      tables.forEach((table, index) => {
        console.log(`  ${index + 1}. ${table.table_name}`);
      });
    }
    
    console.log('\n🎉 Teste de conexão concluído com sucesso!');
    process.exit(0);
    
  } catch (error) {
    console.error('❌ Erro na conexão com o banco de dados:');
    console.error(error.message);
    
    if (error.code === '28P01') {
      console.error('\n💡 Dica: Verifique se a senha no DATABASE_URL está correta.');
      console.error('   Acesse: Supabase → Settings → Database → Connection string');
    } else if (error.code === 'ENOTFOUND') {
      console.error('\n💡 Dica: Verifique se a URL do Supabase está correta.');
    }
    
    process.exit(1);
  }
}

testConnection();