import { readFile } from 'fs/promises';
import { join } from 'path';
import dotenv from 'dotenv';
import postgres from 'postgres';

// Carregar variáveis de ambiente
dotenv.config();

console.log('🔄 Testando conexão e executando migrações...');

async function testConnectionAndMigrate() {
  let client;
  
  try {
    // Verificar variáveis de ambiente
    if (!process.env.DATABASE_URL) {
      throw new Error('DATABASE_URL não configurado no .env');
    }
    
    console.log('✅ DATABASE_URL encontrado');
    
    // Criar conexão
    client = postgres(process.env.DATABASE_URL, {
      max: 1,
      ssl: false, // Desabilitar SSL conforme sslmode=disable
    });
    
    // Testar conexão
    console.log('🔄 Testando conexão...');
    const result = await client`SELECT version()`;
    console.log('✅ Conexão estabelecida com sucesso!');
    console.log('📊 Versão PostgreSQL:', result[0].version);
    
    // Lista de arquivos de migração em ordem
    const migrationFiles = [
      '0005_tenant_system_setup.sql',
      '0006_add_tenant_id_to_existing_tables.sql',
      '0007_migrate_existing_data_to_tenants.sql'
    ];
    
    console.log('\n🚀 Executando migrações...');
    
    for (const filename of migrationFiles) {
      console.log(`\n📄 Executando: ${filename}`);
      
      try {
        const filePath = join(process.cwd(), 'migrations', filename);
        const sqlContent = await readFile(filePath, 'utf-8');
        
        // Executar a migração
        await client.unsafe(sqlContent);
        console.log(`✅ ${filename} executado com sucesso!`);
        
      } catch (migrationError) {
        console.error(`❌ Erro em ${filename}:`, migrationError.message);
        
        // Para alguns erros esperados, continuamos
        if (migrationError.message.includes('already exists') || 
            migrationError.message.includes('relation') && migrationError.message.includes('does not exist')) {
          console.log(`⚠️  ${filename} - Tabela/função já existe ou dado não encontrado, continuando...`);
        } else {
          throw migrationError;
        }
      }
    }
    
    // Verificar se as tabelas foram criadas
    console.log('\n🔍 Verificando tabelas criadas...');
    
    const tables = await client`
      SELECT table_name 
      FROM information_schema.tables 
      WHERE table_schema = 'public' 
      AND table_name IN ('tenants', 'tenant_users')
    `;
    
    console.log('📋 Tabelas de tenant encontradas:', tables.map(t => t.table_name));
    
    if (tables.length === 2) {
      console.log('✅ Sistema de tenants configurado com sucesso!');
    } else {
      console.log('⚠️  Algumas tabelas podem estar faltando');
    }
    
    // Verificar colunas tenant_id adicionadas
    const tenantColumns = await client`
      SELECT table_name, column_name 
      FROM information_schema.columns 
      WHERE column_name = 'tenant_id' 
      AND table_schema = 'public'
    `;
    
    console.log('🔗 Colunas tenant_id encontradas:', tenantColumns.map(c => c.table_name));
    
  } catch (error) {
    console.error('❌ Erro durante execução:', error.message);
    throw error;
  } finally {
    if (client) {
      await client.end();
      console.log('🔒 Conexão fechada');
    }
  }
}

// Executar o teste
testConnectionAndMigrate()
  .then(() => {
    console.log('\n🎉 Migrações executadas com sucesso!');
    process.exit(0);
  })
  .catch((error) => {
    console.error('\n💥 Falha na execução das migrações:', error.message);
    process.exit(1);
  });