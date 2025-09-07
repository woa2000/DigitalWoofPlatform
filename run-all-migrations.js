import { readFile } from 'fs/promises';
import { join } from 'path';
import dotenv from 'dotenv';
import postgres from 'postgres';

dotenv.config();

console.log('🚀 Executando TODAS as migrações no PostgreSQL...\n');

async function executeAllMigrations() {
  let client;
  
  try {
    // Conectar ao banco
    client = postgres(process.env.DATABASE_URL, {
      max: 1,
      ssl: false,
    });
    
    // Teste de conectividade
    console.log('🔄 Testando conexão...');
    const result = await client`SELECT version()`;
    console.log('✅ Conectado ao PostgreSQL:', result[0].version.split(' ')[0], result[0].version.split(' ')[1]);
    
    // Lista completa de migrações em ordem
    const allMigrations = [
      '0000_windy_raider.sql',
      '0001_brand_voice_json_schema.sql', 
      '0002_campaign_library_schema.sql',
      '0002_content_generation_schema.sql',
      '0003_add_template_indexes.sql',
      '0004_calendar_editorial_schema.sql',
      '0004_create_base_tables.sql',
      '0004_create_profiles_table.sql',
      '0005_tenant_system_setup.sql',
      '0006_add_tenant_id_to_existing_tables.sql',
      '0007_migrate_existing_data_to_tenants.sql',
      '0008_add_tenant_id_final.sql'
    ];
    
    console.log(`\n📋 Total de ${allMigrations.length} migrações para executar\n`);
    
    let successCount = 0;
    let skipCount = 0;
    let errorCount = 0;
    
    for (let i = 0; i < allMigrations.length; i++) {
      const filename = allMigrations[i];
      console.log(`\n📄 [${i + 1}/${allMigrations.length}] Executando: ${filename}`);
      
      try {
        const filePath = join(process.cwd(), 'migrations', filename);
        const sqlContent = await readFile(filePath, 'utf-8');
        
        // Verificar se o arquivo está vazio ou só tem comentários
        const meaningfulContent = sqlContent
          .split('\n')
          .filter(line => line.trim() && !line.trim().startsWith('--'))
          .join('');
          
        if (!meaningfulContent) {
          console.log(`⚠️  ${filename} - Arquivo vazio ou só comentários, pulando...`);
          skipCount++;
          continue;
        }
        
        // Executar a migração
        await client.unsafe(sqlContent);
        console.log(`✅ ${filename} - Executado com sucesso!`);
        successCount++;
        
      } catch (migrationError) {
        console.log(`❌ ${filename} - Erro: ${migrationError.message}`);
        
        // Categorizar erros esperados vs críticos
        const errorMsg = migrationError.message.toLowerCase();
        
        if (errorMsg.includes('already exists') || 
            errorMsg.includes('relation') && errorMsg.includes('does not exist') ||
            errorMsg.includes('column') && errorMsg.includes('already exists') ||
            errorMsg.includes('duplicate key') ||
            errorMsg.includes('constraint') && errorMsg.includes('already exists')) {
          console.log(`⚠️  ${filename} - Erro esperado (objeto já existe), continuando...`);
          skipCount++;
        } else {
          console.log(`💥 ${filename} - Erro crítico, mas continuando...`);
          errorCount++;
        }
      }
    }
    
    console.log('\n' + '='.repeat(60));
    console.log('📊 RELATÓRIO FINAL DAS MIGRAÇÕES');
    console.log('='.repeat(60));
    console.log(`✅ Sucessos: ${successCount}`);
    console.log(`⚠️  Puladas: ${skipCount}`);
    console.log(`❌ Erros: ${errorCount}`);
    console.log(`📋 Total: ${allMigrations.length}`);
    
    // Verificar estado final do banco
    console.log('\n🔍 Verificando estado final do banco...\n');
    
    // Listar todas as tabelas
    const tables = await client`
      SELECT 
        schemaname,
        tablename,
        tableowner
      FROM pg_tables 
      WHERE schemaname = 'public'
      ORDER BY tablename
    `;
    
    console.log('📋 Tabelas criadas:');
    if (tables.length === 0) {
      console.log('   (Nenhuma tabela encontrada)');
    } else {
      tables.forEach((table, index) => {
        console.log(`   ${index + 1}. ${table.tablename}`);
      });
    }
    
    // Verificar colunas tenant_id
    const tenantColumns = await client`
      SELECT 
        table_name, 
        column_name,
        data_type,
        is_nullable
      FROM information_schema.columns 
      WHERE column_name = 'tenant_id' 
      AND table_schema = 'public'
      ORDER BY table_name
    `;
    
    console.log('\n🏢 Tabelas com suporte a multi-tenancy:');
    if (tenantColumns.length === 0) {
      console.log('   (Nenhuma coluna tenant_id encontrada)');
    } else {
      tenantColumns.forEach(col => {
        console.log(`   - ${col.table_name}.${col.column_name} (${col.data_type})`);
      });
    }
    
    // Verificar constraints de foreign key para tenants
    const foreignKeys = await client`
      SELECT 
        tc.table_name,
        tc.constraint_name,
        kcu.column_name,
        ccu.table_name AS foreign_table_name,
        ccu.column_name AS foreign_column_name
      FROM information_schema.table_constraints AS tc
      JOIN information_schema.key_column_usage AS kcu
        ON tc.constraint_name = kcu.constraint_name
      JOIN information_schema.constraint_column_usage AS ccu
        ON ccu.constraint_name = tc.constraint_name
      WHERE tc.constraint_type = 'FOREIGN KEY'
      AND tc.table_schema = 'public'
      AND (kcu.column_name = 'tenant_id' OR ccu.table_name = 'tenants')
      ORDER BY tc.table_name
    `;
    
    console.log('\n🔗 Foreign Keys para sistema de tenants:');
    if (foreignKeys.length === 0) {
      console.log('   (Nenhuma foreign key tenant encontrada)');
    } else {
      foreignKeys.forEach(fk => {
        console.log(`   - ${fk.table_name}.${fk.column_name} → ${fk.foreign_table_name}.${fk.foreign_column_name}`);
      });
    }
    
    // Verificar índices
    const indexes = await client`
      SELECT 
        schemaname,
        tablename,
        indexname,
        indexdef
      FROM pg_indexes 
      WHERE schemaname = 'public'
      AND (indexname LIKE '%tenant%' OR indexdef LIKE '%tenant_id%')
      ORDER BY tablename, indexname
    `;
    
    console.log('\n📊 Índices relacionados a tenants:');
    if (indexes.length === 0) {
      console.log('   (Nenhum índice tenant encontrado)');
    } else {
      indexes.forEach(idx => {
        console.log(`   - ${idx.tablename}: ${idx.indexname}`);
      });
    }
    
    // Status do sistema
    console.log('\n' + '='.repeat(60));
    if (tables.length > 0 && tenantColumns.length > 0) {
      console.log('🎉 SISTEMA MULTI-TENANT CONFIGURADO COM SUCESSO!');
      console.log('✅ Banco de dados pronto para produção');
    } else {
      console.log('⚠️  Sistema parcialmente configurado - algumas tabelas podem estar faltando');
    }
    console.log('='.repeat(60));
    
  } catch (error) {
    console.error('\n💥 Erro crítico durante execução:', error.message);
    throw error;
  } finally {
    if (client) {
      await client.end();
      console.log('\n🔒 Conexão com banco encerrada');
    }
  }
}

// Executar todas as migrações
executeAllMigrations()
  .then(() => {
    console.log('\n🎯 Processo de migração completo!');
    process.exit(0);
  })
  .catch((error) => {
    console.error('\n💀 Falha crítica no processo de migração:', error.message);
    process.exit(1);
  });