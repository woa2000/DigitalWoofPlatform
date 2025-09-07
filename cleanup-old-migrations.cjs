#!/usr/bin/env node

/**
 * 🧹 Script de Limpeza das Migrações Antigas
 * 
 * Este script remove as pastas de migração antigas que foram
 * centralizadas em db/migrations/
 * 
 * Pastas que serão removidas:
 * - migrations/ (pasta principal antiga)
 * - server/migrations/ (pasta do servidor)
 * 
 * Uso: node cleanup-old-migrations.js [--backup] [--force]
 */

const fs = require('fs');
const path = require('path');

const PROJECT_ROOT = __dirname;
const BACKUP_DIR = path.join(PROJECT_ROOT, 'backup-migrations');

// Pastas antigas para remover
const OLD_MIGRATION_DIRS = [
  'migrations',
  'server/migrations'
];

// Parsear argumentos
const args = process.argv.slice(2);
const shouldBackup = args.includes('--backup');
const forceRemove = args.includes('--force');

console.log('🧹 Script de Limpeza das Migrações Antigas\n');

// Função para criar backup
function createBackup() {
  if (!fs.existsSync(BACKUP_DIR)) {
    fs.mkdirSync(BACKUP_DIR, { recursive: true });
  }

  console.log('📦 Criando backup das pastas antigas...\n');

  OLD_MIGRATION_DIRS.forEach(dirPath => {
    const fullPath = path.join(PROJECT_ROOT, dirPath);
    
    if (fs.existsSync(fullPath)) {
      const backupPath = path.join(BACKUP_DIR, dirPath.replace('/', '_'));
      
      console.log(`   📁 ${dirPath} → backup-migrations/${path.basename(backupPath)}`);
      
      // Copiar recursivamente
      fs.cpSync(fullPath, backupPath, { recursive: true });
    }
  });

  console.log('\n✅ Backup criado com sucesso!\n');
}

// Função para listar conteúdo das pastas
function listOldMigrations() {
  console.log('📋 Conteúdo das pastas antigas:\n');

  OLD_MIGRATION_DIRS.forEach(dirPath => {
    const fullPath = path.join(PROJECT_ROOT, dirPath);
    
    if (fs.existsSync(fullPath)) {
      console.log(`📁 ${dirPath}:`);
      
      try {
        const files = fs.readdirSync(fullPath, { withFileTypes: true });
        
        files.forEach(file => {
          const icon = file.isDirectory() ? '📂' : '📄';
          console.log(`   ${icon} ${file.name}`);
        });
        
      } catch (error) {
        console.log(`   ❌ Erro ao ler diretório: ${error.message}`);
      }
      
      console.log('');
    } else {
      console.log(`📁 ${dirPath}: (não existe)\n`);
    }
  });
}

// Função para remover pastas antigas
function removeOldMigrations() {
  console.log('🗑️  Removendo pastas antigas...\n');

  OLD_MIGRATION_DIRS.forEach(dirPath => {
    const fullPath = path.join(PROJECT_ROOT, dirPath);
    
    if (fs.existsSync(fullPath)) {
      console.log(`   🗑️  Removendo ${dirPath}...`);
      
      try {
        fs.rmSync(fullPath, { recursive: true, force: true });
        console.log(`   ✅ ${dirPath} removida com sucesso`);
      } catch (error) {
        console.log(`   ❌ Erro ao remover ${dirPath}: ${error.message}`);
      }
    } else {
      console.log(`   ⏭️  ${dirPath} não existe`);
    }
  });

  console.log('\n✅ Limpeza concluída!\n');
}

// Função para verificar status atual
function showCurrentStatus() {
  console.log('📊 Status atual das migrações:\n');
  
  // Verificar pasta centralizada
  const centralizedPath = path.join(PROJECT_ROOT, 'db/migrations');
  if (fs.existsSync(centralizedPath)) {
    console.log('✅ db/migrations/ (centralizada):');
    const files = fs.readdirSync(centralizedPath);
    files.forEach(file => {
      console.log(`   📄 ${file}`);
    });
    console.log('');
  }

  // Verificar pastas antigas
  listOldMigrations();
}

// Função principal
function main() {
  if (args.includes('--help') || args.includes('-h')) {
    console.log(`
Uso: node cleanup-old-migrations.js [opções]

Opções:
  --backup    Criar backup antes de remover
  --force     Remover sem confirmação
  --help      Mostrar esta ajuda

Exemplos:
  node cleanup-old-migrations.js --backup --force
  node cleanup-old-migrations.js
`);
    return;
  }

  showCurrentStatus();

  // Verificar se há algo para limpar
  const hasOldMigrations = OLD_MIGRATION_DIRS.some(dirPath => 
    fs.existsSync(path.join(PROJECT_ROOT, dirPath))
  );

  if (!hasOldMigrations) {
    console.log('🎉 Não há pastas antigas para limpar! Sistema já está organizado.\n');
    return;
  }

  if (shouldBackup) {
    createBackup();
  }

  if (!forceRemove) {
    console.log('⚠️  Esta operação irá REMOVER as pastas antigas de migração.');
    console.log('   Os scripts já foram centralizados em db/migrations/\n');
    console.log('💡 Para executar a remoção, use: node cleanup-old-migrations.js --force');
    console.log('💡 Para criar backup antes: node cleanup-old-migrations.js --backup --force\n');
    return;
  }

  removeOldMigrations();

  console.log('🎯 Próximos passos recomendados:');
  console.log('   1. Verificar se tudo está funcionando: npm run db:migrate:history');
  console.log('   2. Atualizar documentação que referencie as pastas antigas');
  console.log('   3. Fazer commit das mudanças\n');
}

// Executar
main();