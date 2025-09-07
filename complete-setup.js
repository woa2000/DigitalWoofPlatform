import { readFile } from 'fs/promises';
import { join } from 'path';
import dotenv from 'dotenv';
import postgres from 'postgres';

dotenv.config();

async function createBaseTables() {
  let client;
  
  try {
    client = postgres(process.env.DATABASE_URL, {
      max: 1,
      ssl: false,
    });
    
    console.log('🏗️ Criando tabelas básicas do sistema...\n');
    
    // Executar migração de tabelas básicas
    const filePath = join(process.cwd(), 'migrations', '0004_create_base_tables.sql');
    const sqlContent = await readFile(filePath, 'utf-8');
    
    await client.unsafe(sqlContent);
    console.log('✅ Tabelas básicas criadas com sucesso!\n');
    
    // Agora executar as migrações restantes
    const remainingMigrations = [
      '0006_add_tenant_id_to_existing_tables.sql',
      '0007_migrate_existing_data_to_tenants.sql'
    ];
    
    console.log('🔄 Executando migrações restantes...\n');
    
    for (const filename of remainingMigrations) {
      console.log(`📄 Executando: ${filename}`);
      
      try {
        const migrationPath = join(process.cwd(), 'migrations', filename);
        const migrationSql = await readFile(migrationPath, 'utf-8');
        
        await client.unsafe(migrationSql);
        console.log(`✅ ${filename} executado com sucesso!`);
        
      } catch (migrationError) {
        console.error(`❌ Erro em ${filename}:`, migrationError.message);
      }
    }
    
    // Verificar o resultado final
    console.log('\n🔍 Verificando resultado final...');
    
    const tables = await client`
      SELECT table_name 
      FROM information_schema.tables 
      WHERE table_schema = 'public'
      ORDER BY table_name
    `;
    
    console.log('\n📋 Todas as tabelas no banco:');
    tables.forEach(table => {
      console.log(`   - ${table.table_name}`);
    });
    
    // Verificar colunas tenant_id
    const tenantColumns = await client`
      SELECT table_name, column_name 
      FROM information_schema.columns 
      WHERE column_name = 'tenant_id' 
      AND table_schema = 'public'
      ORDER BY table_name
    `;
    
    console.log('\n🔗 Tabelas com tenant_id:');
    tenantColumns.forEach(col => {
      console.log(`   - ${col.table_name}.${col.column_name}`);
    });
    
  } catch (error) {
    console.error('❌ Erro:', error.message);
    throw error;
  } finally {
    if (client) {
      await client.end();
    }
  }
}

createBaseTables()
  .then(() => {
    console.log('\n🎉 Sistema de banco de dados completamente configurado!');
    process.exit(0);
  })
  .catch((error) => {
    console.error('\n💥 Falha na configuração:', error.message);
    process.exit(1);
  });