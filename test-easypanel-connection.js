import { Client } from 'pg';
import { exec } from 'child_process';
import { promisify } from 'util';

const execAsync = promisify(exec);

const connectionString = 'postgres://rasystem:M@asterKey_0000@easypanel.rasystem.com.br:5440/rasystem?sslmode=disable';

async function testEasypanelConnection() {
  console.log('🚀 Testando conexão PostgreSQL - Easypanel');
  console.log('=' .repeat(60));
  console.log('🔗 String:', connectionString.replace(/:[^@]*@/, ':****@'));
  console.log('');

  // Teste 1: Resolução DNS
  console.log('📡 Teste 1: Resolução DNS do hostname');
  try {
    const { stdout } = await execAsync('nslookup easypanel.rasystem.com.br');
    console.log('✅ DNS: easypanel.rasystem.com.br pode ser resolvido');
    // Extrair IP se possível
    const ipMatch = stdout.match(/Address: (\d+\.\d+\.\d+\.\d+)/);
    if (ipMatch) {
      console.log('   IP encontrado:', ipMatch[1]);
    }
  } catch (error) {
    console.log('❌ DNS: Falha na resolução do hostname');
    console.log('   Erro:', error.message);
  }

  // Teste 2: Ping para verificar conectividade
  console.log('\n🏓 Teste 2: Conectividade (ping)');
  try {
    const { stdout } = await execAsync('ping -c 3 easypanel.rasystem.com.br');
    console.log('✅ PING: Host responde ao ping');
    
    // Extrair tempo de resposta
    const timeMatch = stdout.match(/time=(\d+\.?\d*)/);
    if (timeMatch) {
      console.log('   Tempo de resposta:', timeMatch[1], 'ms');
    }
  } catch (error) {
    console.log('❌ PING: Host não responde ao ping');
  }

  // Teste 3: Verificar se a porta 5440 está acessível
  console.log('\n🔌 Teste 3: Conectividade na porta 5440');
  try {
    await execAsync('nc -z -v easypanel.rasystem.com.br 5440', { timeout: 10000 });
    console.log('✅ PORTA: 5440 está acessível');
  } catch (error) {
    console.log('❌ PORTA: 5440 não está acessível ou filtrada por firewall');
  }

  // Teste 4: Conexão PostgreSQL
  console.log('\n🗄️  Teste 4: Conexão PostgreSQL');
  const client = new Client({
    connectionString: connectionString,
    connectionTimeoutMillis: 10000, // 10 segundos de timeout
  });

  try {
    console.log('🔄 Tentando conectar ao PostgreSQL...');
    await client.connect();
    console.log('✅ CONEXÃO: Estabelecida com sucesso!');

    // Informações básicas do servidor
    const versionResult = await client.query('SELECT version(), current_database(), current_user, inet_server_addr(), inet_server_port();');
    const row = versionResult.rows[0];
    
    console.log('📊 Informações do servidor:');
    console.log('   - Versão:', row.version.split(' ')[0] + ' ' + row.version.split(' ')[1]);
    console.log('   - Database:', row.current_database);
    console.log('   - Usuário:', row.current_user);
    console.log('   - IP servidor:', row.inet_server_addr || 'N/A');
    console.log('   - Porta servidor:', row.inet_server_port || 'N/A');

    // Teste de permissões
    console.log('\n🔐 Teste 5: Verificação de permissões');
    try {
      // Listar schemas disponíveis
      const schemaResult = await client.query('SELECT schema_name FROM information_schema.schemata WHERE schema_name NOT IN (\'information_schema\', \'pg_catalog\', \'pg_toast\');');
      console.log('✅ SCHEMAS: Acesso de leitura OK');
      console.log('   Schemas disponíveis:', schemaResult.rows.map(r => r.schema_name).join(', '));

      // Teste de criação de tabela temporária
      await client.query('CREATE TEMP TABLE test_permissions (id SERIAL PRIMARY KEY, test_data TEXT);');
      await client.query('INSERT INTO test_permissions (test_data) VALUES ($1);', ['Teste de conectividade']);
      const testResult = await client.query('SELECT * FROM test_permissions;');
      console.log('✅ ESCRITA: Permissões de escrita OK');
      console.log('   Registro inserido:', testResult.rows[0]);

    } catch (permError) {
      console.log('⚠️  PERMISSÕES: Limitadas');
      console.log('   Erro:', permError.message);
    }

    // Teste de performance básico
    console.log('\n⚡ Teste 6: Performance básica');
    const startTime = Date.now();
    await client.query('SELECT 1;');
    const endTime = Date.now();
    console.log('✅ LATÊNCIA: Query simples executada em', endTime - startTime, 'ms');

  } catch (error) {
    console.log('❌ CONEXÃO: Falhou');
    console.log('🔍 Detalhes do erro:');
    console.log('   - Código:', error.code || 'N/A');
    console.log('   - Mensagem:', error.message);
    
    // Diagnóstico específico do erro
    if (error.code === 'ENOTFOUND') {
      console.log('💡 Causa: Hostname não encontrado');
    } else if (error.code === 'ECONNREFUSED') {
      console.log('💡 Causa: Conexão recusada - servidor pode estar offline');
    } else if (error.code === 'ETIMEDOUT') {
      console.log('💡 Causa: Timeout - servidor demorou para responder');
    } else if (error.code === '28P01') {
      console.log('💡 Causa: Falha na autenticação - usuário/senha incorretos');
    } else if (error.code === '3D000') {
      console.log('💡 Causa: Database "rasystem" não existe');
    } else if (error.code === '28000') {
      console.log('💡 Causa: Falha na autenticação - método SSL/TLS');
    }

  } finally {
    try {
      await client.end();
      console.log('🔌 Conexão encerrada');
    } catch (endError) {
      console.log('⚠️  Erro ao encerrar conexão:', endError.message);
    }
  }

  console.log('\n' + '=' .repeat(60));
  console.log('✨ Teste finalizado');
}

testEasypanelConnection().catch(console.error);