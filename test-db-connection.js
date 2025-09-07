import 'dotenv/config';
import { db, getConnectionType } from './server/db.js';
import { sql } from 'drizzle-orm';

async function testConnection() {
  try {
    console.log('🔍 Testando conexão com o banco de dados...');
    
    const connectionType = await getConnectionType();
    console.log(`📊 Tipo de conexão: ${connectionType}`);
    
    if (connectionType === 'postgres') {
      // Teste com Drizzle
      const database = await db;
      const result = await database.execute(sql`SELECT version()`);
      console.log('✅ Conexão estabelecida com sucesso!');
      console.log('📊 Versão do PostgreSQL:', result[0].version);
      
      // Teste das tabelas
      const tables = await database.execute(sql`
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
      
    } else if (connectionType === 'supabase') {
      // Teste com Supabase Client
      const supabase = await db;
      
      console.log('✅ Conexão Supabase estabelecida com sucesso!');
      
      // Tentar listar algumas tabelas conhecidas
      const testTables = ['users', 'brand_onboarding', 'campaigns', 'brand_voice_jsons'];
      console.log('\n📋 Verificando tabelas do schema:');
      
      let tablesFound = 0;
      for (const tableName of testTables) {
        try {
          const { data, error } = await supabase
            .from(tableName)
            .select('*')
            .limit(1);
            
          if (!error) {
            console.log(`  ✅ ${tableName} - OK`);
            tablesFound++;
          } else if (error.message.includes('does not exist')) {
            console.log(`  ⚠️  ${tableName} - Não existe`);
          } else {
            console.log(`  ❓ ${tableName} - ${error.message}`);
          }
        } catch (e) {
          console.log(`  ❌ ${tableName} - Erro: ${e.message}`);
        }
      }
      
      if (tablesFound === 0) {
        console.log('\n⚠️  Nenhuma tabela do schema encontrada.');
        console.log('💡 Execute "npm run db:push" para criar o schema via PostgreSQL');
        console.log('   ou configure as tabelas manualmente no Supabase Dashboard');
      } else {
        console.log(`\n✅ ${tablesFound} tabela(s) encontrada(s) e acessível(is)!`);
      }
      
      // Testar autenticação
      const { data: user, error: authError } = await supabase.auth.getUser();
      console.log('\n🔐 Sistema de autenticação:', authError ? 'Disponível (não logado)' : 'Logado');
    }
    
    console.log('\n🎉 Teste de conexão concluído com sucesso!');
    console.log(`📡 Usando ${connectionType === 'postgres' ? 'conexão direta PostgreSQL' : 'Supabase API'}`);
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