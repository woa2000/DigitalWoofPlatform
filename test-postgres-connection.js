import { Client } from 'pg';

// String de conexão a ser testada
const connectionString = 'postgres://rasystem:M@asterKey_0000@rasystem_rasystem-db:5432/rasystem?sslmode=disable';

async function testConnection() {
  const client = new Client({
    connectionString: connectionString
  });

  try {
    console.log('🔄 Tentando conectar ao PostgreSQL...');
    console.log('📍 String de conexão:', connectionString.replace(/:[^@]*@/, ':****@'));
    
    await client.connect();
    console.log('✅ Conexão estabelecida com sucesso!');
    
    // Teste básico de query
    const result = await client.query('SELECT version(), current_database(), current_user;');
    console.log('📊 Informações do banco:');
    console.log('   - Versão PostgreSQL:', result.rows[0].version.split(' ')[0] + ' ' + result.rows[0].version.split(' ')[1]);
    console.log('   - Database atual:', result.rows[0].current_database);
    console.log('   - Usuário atual:', result.rows[0].current_user);
    
    // Teste de criação de tabela temporária (para verificar permissões)
    try {
      await client.query('CREATE TEMP TABLE test_connection (id SERIAL PRIMARY KEY, test_field TEXT);');
      await client.query('INSERT INTO test_connection (test_field) VALUES ($1);', ['Teste de conectividade']);
      const testResult = await client.query('SELECT * FROM test_connection;');
      console.log('✅ Teste de escrita: OK - Permissões adequadas');
      console.log('📝 Dados inseridos:', testResult.rows[0]);
    } catch (writeError) {
      console.log('⚠️  Teste de escrita: FALHOU - Permissões limitadas');
      console.log('   Erro:', writeError.message);
    }
    
  } catch (error) {
    console.log('❌ Falha na conexão!');
    console.log('🔍 Detalhes do erro:');
    console.log('   - Código:', error.code || 'N/A');
    console.log('   - Mensagem:', error.message);
    
    // Diagnósticos específicos
    if (error.code === 'ENOTFOUND') {
      console.log('💡 Possível causa: Host não encontrado. Verifique o endereço do servidor.');
    } else if (error.code === 'ECONNREFUSED') {
      console.log('💡 Possível causa: Conexão recusada. Verifique se o servidor está rodando e a porta está correta.');
    } else if (error.code === '28P01') {
      console.log('💡 Possível causa: Falha na autenticação. Verifique usuário e senha.');
    } else if (error.code === '3D000') {
      console.log('💡 Possível causa: Database não existe.');
    }
    
  } finally {
    try {
      await client.end();
      console.log('🔌 Conexão encerrada.');
    } catch (endError) {
      console.log('⚠️  Erro ao encerrar conexão:', endError.message);
    }
  }
}

// Executar o teste
console.log('🚀 Iniciando teste de conexão PostgreSQL...');
console.log('=' .repeat(50));

testConnection().then(() => {
  console.log('=' .repeat(50));
  console.log('✨ Teste finalizado.');
}).catch((error) => {
  console.log('💥 Erro inesperado:', error);
  process.exit(1);
});