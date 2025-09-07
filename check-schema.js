import dotenv from 'dotenv';
import postgres from 'postgres';

dotenv.config();

async function checkDatabaseSchema() {
  let client;
  
  try {
    client = postgres(process.env.DATABASE_URL, {
      max: 1,
      ssl: false,
    });
    
    console.log('🔍 Verificando esquema do banco de dados...\n');
    
    // Listar todas as tabelas
    const tables = await client`
      SELECT table_name 
      FROM information_schema.tables 
      WHERE table_schema = 'public'
      ORDER BY table_name
    `;
    
    console.log('📋 Tabelas existentes:');
    if (tables.length === 0) {
      console.log('   (Nenhuma tabela encontrada)');
    } else {
      tables.forEach(table => {
        console.log(`   - ${table.table_name}`);
      });
    }
    
    console.log('\n🏗️ Estrutura das tabelas de tenant:');
    
    // Verificar estrutura da tabela tenants
    try {
      const tenantCols = await client`
        SELECT column_name, data_type, is_nullable
        FROM information_schema.columns 
        WHERE table_name = 'tenants' AND table_schema = 'public'
        ORDER BY ordinal_position
      `;
      
      console.log('\n📊 Tabela "tenants":');
      tenantCols.forEach(col => {
        console.log(`   - ${col.column_name}: ${col.data_type} ${col.is_nullable === 'NO' ? '(NOT NULL)' : '(NULLABLE)'}`);
      });
    } catch (e) {
      console.log('   Tabela "tenants" não encontrada');
    }
    
    // Verificar estrutura da tabela tenant_users
    try {
      const tenantUserCols = await client`
        SELECT column_name, data_type, is_nullable
        FROM information_schema.columns 
        WHERE table_name = 'tenant_users' AND table_schema = 'public'
        ORDER BY ordinal_position
      `;
      
      console.log('\n📊 Tabela "tenant_users":');
      tenantUserCols.forEach(col => {
        console.log(`   - ${col.column_name}: ${col.data_type} ${col.is_nullable === 'NO' ? '(NOT NULL)' : '(NULLABLE)'}`);
      });
    } catch (e) {
      console.log('   Tabela "tenant_users" não encontrada');
    }
    
    // Verificar se há dados nas tabelas
    try {
      const tenantCount = await client`SELECT COUNT(*) as count FROM tenants`;
      const tenantUserCount = await client`SELECT COUNT(*) as count FROM tenant_users`;
      
      console.log('\n📊 Contagem de dados:');
      console.log(`   - tenants: ${tenantCount[0].count} registros`);
      console.log(`   - tenant_users: ${tenantUserCount[0].count} registros`);
    } catch (e) {
      console.log('\n⚠️  Não foi possível contar registros');
    }
    
  } catch (error) {
    console.error('❌ Erro:', error.message);
  } finally {
    if (client) {
      await client.end();
    }
  }
}

checkDatabaseSchema();