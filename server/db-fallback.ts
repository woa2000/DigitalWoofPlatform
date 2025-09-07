import dotenv from 'dotenv';
import path from 'path';

dotenv.config({ path: path.join(process.cwd(), '.env') });

import { drizzle } from 'drizzle-orm/postgres-js';
import postgres from 'postgres';
import { createClient } from '@supabase/supabase-js';
import * as schema from '../shared/schema';

console.log('🔄 Configurando conexão com banco de dados...');
console.log('DATABASE_URL:', process.env.DATABASE_URL ? 'Configurado' : 'Não configurado');
console.log('SUPABASE_URL:', process.env.SUPABASE_URL);
console.log('NODE_ENV:', process.env.NODE_ENV);

// Função para tentar conexão PostgreSQL direta
async function createPostgresConnection() {
  if (!process.env.DATABASE_URL) {
    throw new Error('DATABASE_URL environment variable is required');
  }

  try {
    const client = postgres(process.env.DATABASE_URL, {
      max: 1,
      ssl: 'require',
      connect_timeout: 5, // Timeout mais curto para falhar rapidamente
    });
    
    // Teste rápido de conectividade
    await client`SELECT 1`;
    console.log('✅ Conexão PostgreSQL direta estabelecida');
    
    return { type: 'postgres', db: drizzle(client, { schema }) };
  } catch (error: any) {
    console.log('❌ Conexão PostgreSQL direta falhou:', error.message);
    throw error;
  }
}

// Função para criar conexão via Supabase Client
function createSupabaseConnection() {
  if (!process.env.SUPABASE_URL || !process.env.SUPABASE_ANON_KEY) {
    throw new Error('SUPABASE_URL and SUPABASE_ANON_KEY are required for Supabase connection');
  }

  console.log('🔄 Usando conexão via Supabase Client');
  
  const supabase = createClient(
    process.env.SUPABASE_URL,
    process.env.SUPABASE_ANON_KEY
  );
  
  return { type: 'supabase', db: supabase };
}

// Função para inicializar conexão
async function initializeConnection() {
  try {
    return await createPostgresConnection();
  } catch (postgresError: any) {
    console.log('🔄 Tentando conexão alternativa via Supabase Client...');
    
    try {
      const connection = createSupabaseConnection();
      console.log('✅ Conexão Supabase Client estabelecida com sucesso');
      return connection;
    } catch (supabaseError: any) {
      console.error('❌ Ambas as conexões falharam:');
      console.error('PostgreSQL:', postgresError.message);
      console.error('Supabase:', supabaseError.message);
      throw new Error('Não foi possível estabelecer conexão com o banco de dados');
    }
  }
}

// Exportar a conexão inicializada
export const connectionPromise = initializeConnection();
export const db = connectionPromise.then(conn => conn.db);