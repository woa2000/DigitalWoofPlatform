import { writeFile, readdir } from 'fs/promises';
import { join } from 'path';
import { format } from 'date-fns';

/**
 * Script para criar novas migrations
 */

class MigrationCreator {
  constructor() {
    this.migrationsDir = join(process.cwd(), 'db', 'migrations');
  }

  /**
   * Obter próximo número sequencial
   */
  async getNextNumber() {
    try {
      const files = await readdir(this.migrationsDir);
      const migrationFiles = files
        .filter(file => file.endsWith('.sql') && /^\d{3}_/.test(file))
        .sort();
      
      if (migrationFiles.length === 0) {
        return '001';
      }
      
      const lastFile = migrationFiles[migrationFiles.length - 1];
      const lastNumber = parseInt(lastFile.substring(0, 3));
      const nextNumber = lastNumber + 1;
      
      return nextNumber.toString().padStart(3, '0');
    } catch (error) {
      console.error('Erro ao determinar próximo número:', error.message);
      return '001';
    }
  }

  /**
   * Gerar template de migration
   */
  generateTemplate(description) {
    const timestamp = format(new Date(), 'yyyy-MM-dd HH:mm:ss');
    
    return `-- Migration: ${description}
-- Created: ${timestamp}
-- 
-- Description:
-- Add your migration description here
--

-- =============================================
-- UP Migration
-- =============================================

-- Add your migration SQL here
-- Example:
-- CREATE TABLE example_table (
--     id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
--     name TEXT NOT NULL,
--     created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
-- );

-- CREATE INDEX idx_example_name ON example_table(name);

-- =============================================
-- Notes
-- =============================================
-- 
-- Remember to:
-- - Use IF NOT EXISTS when possible
-- - Add proper indexes for performance
-- - Consider foreign keys and constraints
-- - Add triggers if needed for updated_at
-- - Test locally before deploying
--
`;
  }

  /**
   * Criar nova migration
   */
  async createMigration(description) {
    if (!description || description.trim() === '') {
      throw new Error('Descrição da migration é obrigatória');
    }

    // Sanitizar descrição para nome de arquivo
    const sanitized = description
      .toLowerCase()
      .replace(/[^a-z0-9\s]/g, '')
      .replace(/\s+/g, '_')
      .substring(0, 50);

    const number = await this.getNextNumber();
    const filename = `${number}_${sanitized}.sql`;
    const filepath = join(this.migrationsDir, filename);

    // Gerar conteúdo
    const content = this.generateTemplate(description);

    try {
      await writeFile(filepath, content, 'utf-8');
      
      console.log('✅ Migration criada com sucesso!');
      console.log('📄 Arquivo:', filename);
      console.log('📍 Local:', filepath);
      console.log('\n📝 Próximos passos:');
      console.log('1. Edite o arquivo para adicionar seu SQL');
      console.log('2. Execute: npm run db:migrate');
      
      return { filename, filepath };
    } catch (error) {
      console.error('❌ Erro ao criar migration:', error.message);
      throw error;
    }
  }

  /**
   * Listar migrations existentes
   */
  async listMigrations() {
    try {
      const files = await readdir(this.migrationsDir);
      const migrationFiles = files
        .filter(file => file.endsWith('.sql'))
        .sort();
      
      console.log(`📋 Migrations existentes (${migrationFiles.length}):`);
      console.log('='.repeat(50));
      
      if (migrationFiles.length === 0) {
        console.log('(Nenhuma migration encontrada)');
        return;
      }
      
      migrationFiles.forEach((file, index) => {
        const number = file.substring(0, 3);
        const description = file.substring(4, file.length - 4).replace(/_/g, ' ');
        console.log(`${number}. ${description}`);
      });
      
    } catch (error) {
      console.error('❌ Erro ao listar migrations:', error.message);
    }
  }
}

// Função auxiliar para mostrar ajuda
function showHelp() {
  console.log(`
📖 Migration Creator - Como usar:

Criar nova migration:
  node db/scripts/create-migration.js "descrição da migration"

Exemplos:
  node db/scripts/create-migration.js "add users table"
  node db/scripts/create-migration.js "add email column to profiles"
  node db/scripts/create-migration.js "create campaign templates schema"

Listar migrations:
  node db/scripts/create-migration.js --list

Ajuda:
  node db/scripts/create-migration.js --help
`);
}

// Executar se chamado diretamente
if (process.argv[1].endsWith('create-migration.js')) {
  const creator = new MigrationCreator();
  const argument = process.argv[2];

  if (!argument || argument === '--help' || argument === '-h') {
    showHelp();
    process.exit(0);
  } else if (argument === '--list' || argument === '-l') {
    creator.listMigrations()
      .then(() => process.exit(0))
      .catch(() => process.exit(1));
  } else {
    creator.createMigration(argument)
      .then(() => process.exit(0))
      .catch((error) => {
        console.error('💥 Falha ao criar migration:', error.message);
        process.exit(1);
      });
  }
}

export default MigrationCreator;