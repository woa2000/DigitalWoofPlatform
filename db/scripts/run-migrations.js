import { readFile, readdir } from 'fs/promises';
import { join } from 'path';
import { createHash } from 'crypto';
import sql, { testConnection, closeConnection } from '../config.js';

/**
 * Sistema de migrations com tracking automático
 * Executa migrations em ordem sequencial e registra histórico
 */

class MigrationRunner {
  constructor() {
    this.migrationsDir = join(process.cwd(), 'db', 'migrations');
  }

  /**
   * Calcular checksum de um arquivo para detectar mudanças
   */
  calculateChecksum(content) {
    return createHash('sha256').update(content).digest('hex').substring(0, 16);
  }

  /**
   * Verificar se a tabela de tracking existe
   */
  async ensureTrackingTable() {
    try {
      await sql`
        CREATE TABLE IF NOT EXISTS migration_history (
          id SERIAL PRIMARY KEY,
          filename VARCHAR(255) NOT NULL UNIQUE,
          executed_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
          checksum VARCHAR(64) NOT NULL,
          execution_time_ms INTEGER,
          status VARCHAR(20) DEFAULT 'success'
        )
      `;

      await sql`
        CREATE INDEX IF NOT EXISTS idx_migration_history_filename 
        ON migration_history(filename)
      `;

      console.log('✅ Tabela de tracking inicializada');
    } catch (error) {
      console.error('❌ Erro ao criar tabela de tracking:', error.message);
      throw error;
    }
  }

  /**
   * Buscar migrations já executadas
   */
  async getExecutedMigrations() {
    try {
      const result = await sql`
        SELECT filename, checksum, executed_at 
        FROM migration_history 
        ORDER BY filename
      `;
      return result.reduce((acc, row) => {
        acc[row.filename] = {
          checksum: row.checksum,
          executed_at: row.executed_at
        };
        return acc;
      }, {});
    } catch (error) {
      console.error('⚠️  Não foi possível buscar histórico de migrations:', error.message);
      return {};
    }
  }

  /**
   * Buscar arquivos de migration
   */
  async getMigrationFiles() {
    try {
      const files = await readdir(this.migrationsDir);
      return files
        .filter(file => file.endsWith('.sql'))
        .sort(); // Ordem alfabética/numérica
    } catch (error) {
      console.error('❌ Erro ao listar migrations:', error.message);
      return [];
    }
  }

  /**
   * Executar uma migration específica
   */
  async executeMigration(filename, content, executed) {
    const startTime = Date.now();
    const checksum = this.calculateChecksum(content);
    
    try {
      // Verificar se já foi executada com mesmo checksum
      if (executed[filename]) {
        if (executed[filename].checksum === checksum) {
          console.log(`⏭️  ${filename} - Já executada (checksum igual)`);
          return { status: 'skipped', reason: 'already_executed' };
        } else {
          console.log(`⚠️  ${filename} - Checksum diferente, re-executando...`);
        }
      }

      console.log(`🔄 Executando: ${filename}`);
      
      // Executar a migration
      await sql.unsafe(content);
      
      const executionTime = Date.now() - startTime;
      
      // Registrar no histórico
      await sql`
        INSERT INTO migration_history (filename, checksum, execution_time_ms, status)
        VALUES (${filename}, ${checksum}, ${executionTime}, 'success')
        ON CONFLICT (filename) 
        DO UPDATE SET 
          checksum = EXCLUDED.checksum,
          executed_at = NOW(),
          execution_time_ms = EXCLUDED.execution_time_ms,
          status = EXCLUDED.status
      `;
      
      console.log(`✅ ${filename} - Executada com sucesso (${executionTime}ms)`);
      return { status: 'success', executionTime };
      
    } catch (error) {
      const executionTime = Date.now() - startTime;
      
      // Categorizar tipos de erro
      const errorMsg = error.message.toLowerCase();
      let status = 'error';
      let reason = error.message;
      
      if (errorMsg.includes('already exists') || 
          errorMsg.includes('relation') && errorMsg.includes('does not exist') ||
          errorMsg.includes('column') && errorMsg.includes('already exists')) {
        status = 'skipped';
        reason = 'object_already_exists';
        console.log(`⚠️  ${filename} - Objeto já existe, continuando...`);
      } else {
        console.log(`❌ ${filename} - Erro: ${error.message}`);
      }
      
      // Registrar erro no histórico
      await sql`
        INSERT INTO migration_history (filename, checksum, execution_time_ms, status)
        VALUES (${filename}, ${checksum}, ${executionTime}, ${status})
        ON CONFLICT (filename) 
        DO UPDATE SET 
          checksum = EXCLUDED.checksum,
          executed_at = NOW(),
          execution_time_ms = EXCLUDED.execution_time_ms,
          status = EXCLUDED.status
      `;
      
      return { status, reason, executionTime };
    }
  }

  /**
   * Executar todas as migrations
   */
  async runMigrations() {
    console.log('🚀 Iniciando execução de migrations...\n');
    
    try {
      // Testar conexão
      const connected = await testConnection();
      if (!connected) {
        throw new Error('Não foi possível conectar ao banco de dados');
      }

      // Garantir tabela de tracking
      await this.ensureTrackingTable();

      // Buscar migrations executadas e arquivos disponíveis
      const [executed, files] = await Promise.all([
        this.getExecutedMigrations(),
        this.getMigrationFiles()
      ]);

      if (files.length === 0) {
        console.log('⚠️  Nenhuma migration encontrada');
        return;
      }

      console.log(`📋 Encontradas ${files.length} migrations\n`);

      // Contadores
      let successCount = 0;
      let skippedCount = 0;
      let errorCount = 0;
      const results = [];

      // Executar migrations em ordem
      for (let i = 0; i < files.length; i++) {
        const filename = files[i];
        console.log(`\n📄 [${i + 1}/${files.length}] ${filename}`);
        
        try {
          const content = await readFile(join(this.migrationsDir, filename), 'utf-8');
          
          // Verificar se tem conteúdo útil
          const meaningfulContent = content
            .split('\n')
            .filter(line => line.trim() && !line.trim().startsWith('--'))
            .join('');
            
          if (!meaningfulContent) {
            console.log(`⚠️  ${filename} - Arquivo vazio, pulando...`);
            skippedCount++;
            continue;
          }

          const result = await this.executeMigration(filename, content, executed);
          results.push({ filename, ...result });
          
          if (result.status === 'success') successCount++;
          else if (result.status === 'skipped') skippedCount++;
          else errorCount++;
          
        } catch (error) {
          console.log(`💥 ${filename} - Erro ao ler arquivo: ${error.message}`);
          errorCount++;
        }
      }

      // Relatório final
      console.log('\n' + '='.repeat(60));
      console.log('📊 RELATÓRIO DE MIGRATIONS');
      console.log('='.repeat(60));
      console.log(`✅ Sucessos: ${successCount}`);
      console.log(`⏭️  Puladas: ${skippedCount}`);
      console.log(`❌ Erros: ${errorCount}`);
      console.log(`📋 Total: ${files.length}`);
      
      // Mostrar detalhes se houver erros
      const errors = results.filter(r => r.status === 'error');
      if (errors.length > 0) {
        console.log('\n❌ Migrations com erro:');
        errors.forEach(error => {
          console.log(`   - ${error.filename}: ${error.reason}`);
        });
      }

      // Status do banco após migrations
      await this.showDatabaseStatus();
      
      return { successCount, skippedCount, errorCount, results };
      
    } catch (error) {
      console.error('\n💥 Erro crítico durante execução:', error.message);
      throw error;
    }
  }

  /**
   * Mostrar status do banco após migrations
   */
  async showDatabaseStatus() {
    try {
      console.log('\n🔍 Status do banco de dados...\n');
      
      // Listar tabelas
      const tables = await sql`
        SELECT tablename 
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
      
      // Verificar sistema multi-tenant
      const tenantTables = await sql`
        SELECT table_name
        FROM information_schema.columns 
        WHERE column_name = 'tenant_id' 
        AND table_schema = 'public'
        ORDER BY table_name
      `;
      
      if (tenantTables.length > 0) {
        console.log(`\n🏢 Sistema multi-tenant: ${tenantTables.length} tabelas configuradas`);
        tenantTables.forEach(table => {
          console.log(`   - ${table.table_name}`);
        });
      }
      
    } catch (error) {
      console.log('⚠️  Não foi possível verificar status do banco:', error.message);
    }
  }

  /**
   * Mostrar histórico de migrations
   */
  async showHistory() {
    try {
      const history = await sql`
        SELECT filename, executed_at, execution_time_ms, status
        FROM migration_history 
        ORDER BY executed_at DESC
        LIMIT 20
      `;
      
      console.log('\n📚 Últimas 20 migrations executadas:');
      console.log('='.repeat(80));
      
      if (history.length === 0) {
        console.log('(Nenhuma migration executada ainda)');
        return;
      }
      
      history.forEach(row => {
        const date = new Date(row.executed_at).toLocaleString('pt-BR');
        const status = row.status === 'success' ? '✅' : 
                      row.status === 'skipped' ? '⏭️' : '❌';
        const time = row.execution_time_ms ? `${row.execution_time_ms}ms` : '-';
        
        console.log(`${status} ${row.filename.padEnd(40)} ${date} (${time})`);
      });
      
    } catch (error) {
      console.log('⚠️  Não foi possível buscar histórico:', error.message);
    }
  }
}

// Executar se chamado diretamente
if (process.argv[1].endsWith('run-migrations.js')) {
  const runner = new MigrationRunner();
  
  // Verificar argumentos
  const command = process.argv[2];
  
  if (command === 'history') {
    runner.showHistory()
      .then(() => process.exit(0))
      .catch(() => process.exit(1));
  } else {
    runner.runMigrations()
      .then((result) => {
        if (result && result.errorCount === 0) {
          console.log('\n🎉 Todas as migrations executadas com sucesso!');
          process.exit(0);
        } else {
          console.log('\n⚠️  Algumas migrations falharam, verificar logs acima');
          process.exit(1);
        }
      })
      .catch((error) => {
        console.error('💀 Falha crítica:', error.message);
        process.exit(1);
      })
      .finally(() => {
        closeConnection();
      });
  }
}

export default MigrationRunner;