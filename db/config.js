import postgres from 'postgres';
import dotenv from 'dotenv';

// Carregar variáveis de ambiente
dotenv.config();

/**
 * Configuração da conexão PostgreSQL
 * Usando apenas PostgreSQL standalone, sem Supabase
 */
const config = {
  max: 10,
  idle_timeout: 20,
  connect_timeout: 60,
  ssl: false, // Forçar ssl=false para sslmode=disable
};

// Validar configuração
if (!process.env.DATABASE_URL) {
  throw new Error('DATABASE_URL environment variable is required');
}

// Criar instância de conexão
export const sql = postgres(process.env.DATABASE_URL, config);

/**
 * Testar conexão com o banco
 */
export async function testConnection() {
  try {
    console.log('🔄 Testando conexão com:', process.env.DATABASE_URL?.replace(/:[^:@]*@/, ':***@'));
    const result = await sql`SELECT version()`;
    console.log('✅ Conexão PostgreSQL estabelecida:', result[0].version.split(' ')[0], result[0].version.split(' ')[1]);
    return true;
  } catch (error) {
    console.error('❌ Erro na conexão PostgreSQL:');
    console.error('   Mensagem:', error.message);
    console.error('   Código:', error.code);
    console.error('   HOST:', error.hostname || 'N/A');
    console.error('   DATABASE_URL configurado:', !!process.env.DATABASE_URL);
    return false;
  }
}

/**
 * Fechar conexão
 */
export async function closeConnection() {
  await sql.end();
  console.log('🔒 Conexão PostgreSQL encerrada');
}

export default sql;