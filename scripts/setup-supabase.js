#!/usr/bin/env node

/**
 * Script para configurar um novo projeto Supabase
 * Este script ajuda a atualizar as configurações após criar um novo projeto
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const rootDir = path.join(__dirname, '..');
const envPath = path.join(rootDir, '.env');

console.log('🚀 Setup do Supabase - Digital Woof Platform\n');

// Função para atualizar o arquivo .env
function updateEnvFile(projectUrl, anonKey, serviceKey, dbPassword) {
  try {
    let envContent = fs.readFileSync(envPath, 'utf8');
    
    // Extrair o project ID da URL
    const projectId = projectUrl.replace('https://', '').replace('.supabase.co', '');
    const databaseUrl = `postgresql://postgres:${dbPassword}@db.${projectId}.supabase.co:5432/postgres`;
    
    // Atualizar as variáveis
    envContent = envContent.replace(
      /VITE_SUPABASE_URL=.*/,
      `VITE_SUPABASE_URL=${projectUrl}`
    );
    
    envContent = envContent.replace(
      /VITE_SUPABASE_ANON_KEY=.*/,
      `VITE_SUPABASE_ANON_KEY=${anonKey}`
    );
    
    envContent = envContent.replace(
      /SUPABASE_URL=.*/,
      `SUPABASE_URL=${projectUrl}`
    );
    
    envContent = envContent.replace(
      /SUPABASE_ANON_KEY=.*/,
      `SUPABASE_ANON_KEY=${anonKey}`
    );
    
    envContent = envContent.replace(
      /SUPABASE_SERVICE_ROLE_KEY=.*/,
      `SUPABASE_SERVICE_ROLE_KEY=${serviceKey}`
    );
    
    envContent = envContent.replace(
      /DATABASE_URL=.*/,
      `DATABASE_URL=${databaseUrl}`
    );
    
    // Criar backup do arquivo atual
    fs.writeFileSync(`${envPath}.backup`, fs.readFileSync(envPath));
    
    // Escrever o novo arquivo
    fs.writeFileSync(envPath, envContent);
    
    console.log('✅ Arquivo .env atualizado com sucesso!');
    console.log('📋 Backup criado em .env.backup');
    
    return true;
  } catch (error) {
    console.error('❌ Erro ao atualizar .env:', error.message);
    return false;
  }
}

// Função principal
async function main() {
  console.log('📝 Para configurar o Supabase, você precisa:');
  console.log('1. Criar um novo projeto em https://supabase.com');
  console.log('2. Obter as credenciais do projeto');
  console.log('3. Executar este script com as credenciais\n');
  
  console.log('💡 Formato do comando:');
  console.log('node scripts/setup-supabase.js <PROJECT_URL> <ANON_KEY> <SERVICE_KEY> <DB_PASSWORD>\n');
  
  console.log('📖 Exemplo:');
  console.log('node scripts/setup-supabase.js \\');
  console.log('  "https://abcdefgh.supabase.co" \\');
  console.log('  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..." \\');
  console.log('  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..." \\');
  console.log('  "sua-senha-do-banco"\n');
  
  const args = process.argv.slice(2);
  
  if (args.length === 4) {
    const [projectUrl, anonKey, serviceKey, dbPassword] = args;
    
    console.log('🔧 Atualizando configurações...\n');
    
    if (updateEnvFile(projectUrl, anonKey, serviceKey, dbPassword)) {
      console.log('🎉 Configuração concluída!');
      console.log('\n📋 Próximos passos:');
      console.log('1. npm run db:push  # Aplicar schema no banco');
      console.log('2. npm run db:test  # Testar conexão');
      console.log('3. npm run dev      # Iniciar aplicação');
    }
  } else {
    console.log('⚠️  Argumentos insuficientes. Consulte o formato acima.\n');
    
    console.log('🔍 Como obter as credenciais:');
    console.log('1. Acesse https://supabase.com');
    console.log('2. Crie um novo projeto');
    console.log('3. Vá em Settings → API para obter URL e keys');
    console.log('4. Vá em Settings → Database para obter a connection string');
    console.log('5. Use a senha que você definiu ao criar o projeto\n');
  }
}

main().catch(console.error);