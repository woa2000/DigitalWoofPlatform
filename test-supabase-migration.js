import { readFile } from 'fs/promises';
import { join } from 'path';
import dotenv from 'dotenv';
import { createClient } from '@supabase/supabase-js';

// Carregar variáveis de ambiente
dotenv.config();

console.log('🔄 Testando conexão via Supabase e executando migrações...');

async function testSupabaseAndMigrate() {
  try {
    // Verificar variáveis de ambiente
    if (!process.env.SUPABASE_URL || !process.env.SUPABASE_ANON_KEY) {
      throw new Error('SUPABASE_URL ou SUPABASE_ANON_KEY não configurados no .env');
    }
    
    console.log('✅ Credenciais Supabase encontradas');
    console.log('🔗 URL:', process.env.SUPABASE_URL);
    
    // Criar cliente Supabase
    const supabase = createClient(
      process.env.SUPABASE_URL,
      process.env.SUPABASE_ANON_KEY
    );
    
    // Testar conexão básica
    console.log('🔄 Testando conexão Supabase...');
    const { data: testData, error: testError } = await supabase
      .from('information_schema.tables')
      .select('table_name')
      .limit(1);
    
    if (testError) {
      throw new Error(`Erro na conexão Supabase: ${testError.message}`);
    }
    
    console.log('✅ Conexão Supabase estabelecida com sucesso!');
    
    // Lista de arquivos de migração em ordem
    const migrationFiles = [
      '0005_tenant_system_setup.sql',
      '0006_add_tenant_id_to_existing_tables.sql', 
      '0007_migrate_existing_data_to_tenants.sql'
    ];
    
    console.log('\n🚀 Executando migrações via Supabase...');
    
    for (const filename of migrationFiles) {
      console.log(`\n📄 Executando: ${filename}`);
      
      try {
        const filePath = join(process.cwd(), 'migrations', filename);
        const sqlContent = await readFile(filePath, 'utf-8');
        
        // Dividir em comandos individuais (separados por ';')
        const commands = sqlContent
          .split(';')
          .map(cmd => cmd.trim())
          .filter(cmd => cmd.length > 0 && !cmd.startsWith('--'));
        
        console.log(`📊 ${commands.length} comandos SQL encontrados`);
        
        for (let i = 0; i < commands.length; i++) {
          const command = commands[i];
          if (command.trim()) {
            console.log(`  🔄 Executando comando ${i + 1}/${commands.length}...`);
            
            const { data, error } = await supabase.rpc('execute_sql', {
              sql_query: command
            });
            
            if (error) {
              console.log(`  ⚠️  Erro no comando ${i + 1}: ${error.message}`);
              // Continuar para o próximo comando
            } else {
              console.log(`  ✅ Comando ${i + 1} executado com sucesso`);
            }
          }
        }
        
        console.log(`✅ ${filename} processado!`);
        
      } catch (migrationError) {
        console.error(`❌ Erro ao processar ${filename}:`, migrationError.message);
      }
    }
    
    // Verificar se as tabelas foram criadas
    console.log('\n🔍 Verificando tabelas criadas...');
    
    const { data: tables, error: tablesError } = await supabase
      .from('information_schema.tables')
      .select('table_name')
      .eq('table_schema', 'public')
      .in('table_name', ['tenants', 'tenant_users']);
    
    if (tablesError) {
      console.log('⚠️  Não foi possível verificar tabelas:', tablesError.message);
    } else {
      console.log('📋 Tabelas de tenant encontradas:', tables?.map(t => t.table_name) || []);
    }
    
  } catch (error) {
    console.error('❌ Erro durante execução:', error.message);
    throw error;
  }
}

// Executar o teste
testSupabaseAndMigrate()
  .then(() => {
    console.log('\n🎉 Processo de migração concluído!');
    console.log('💡 Nota: Algumas migrações podem precisar ser executadas diretamente no painel do Supabase');
    process.exit(0);
  })
  .catch((error) => {
    console.error('\n💥 Falha na execução:', error.message);
    process.exit(1);
  });