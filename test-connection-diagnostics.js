import { exec } from 'child_process';
import { promisify } from 'util';
import { Client } from 'pg';

const execAsync = promisify(exec);

const targetConnectionString = 'postgres://rasystem:M@asterKey_0000@rasystem_rasystem-db:5440/rasystem?sslmode=disable';

async function diagnosticTests() {
  console.log('🔍 Executando diagnósticos de conectividade...');
  console.log('=' .repeat(60));
  
  // Teste 1: Resolução DNS
  console.log('📡 Teste 1: Resolução DNS');
  try {
    await execAsync('nslookup rasystem_rasystem-db');
    console.log('✅ DNS: rasystem_rasystem-db pode ser resolvido');
  } catch (error) {
    console.log('❌ DNS: rasystem_rasystem-db NÃO pode ser resolvido');
    console.log('   Isso indica que o hostname não existe ou não está acessível');
  }
  
  // Teste 2: Ping
  console.log('\n🏓 Teste 2: Conectividade (ping)');
  try {
    await execAsync('ping -c 3 rasystem_rasystem-db');
    console.log('✅ PING: rasystem_rasystem-db responde ao ping');
  } catch (error) {
    console.log('❌ PING: rasystem_rasystem-db não responde ao ping');
  }
  
  // Teste 3: Telnet para porta específica
  console.log('\n🔌 Teste 3: Conectividade na porta 5440');
  try {
    // Timeout de 5 segundos para telnet
    await execAsync('timeout 5 telnet rasystem_rasystem-db 5440', { timeout: 6000 });
    console.log('✅ PORTA: 5440 está acessível');
  } catch (error) {
    console.log('❌ PORTA: 5440 não está acessível ou não responde');
  }
  
  // Teste 4: Verificar se é um ambiente Docker
  console.log('\n🐳 Teste 4: Verificação de ambiente Docker');
  try {
    await execAsync('which docker');
    console.log('✅ Docker está instalado');
    
    try {
      await execAsync('docker --version');
      console.log('✅ Docker está funcionando');
    } catch (dockerError) {
      console.log('❌ Docker instalado mas não está rodando');
    }
  } catch (error) {
    console.log('❌ Docker não está instalado');
  }
  
  // Teste 5: Verificar hosts file
  console.log('\n📄 Teste 5: Verificação do arquivo hosts');
  try {
    const { stdout } = await execAsync('grep rasystem /etc/hosts');
    console.log('✅ Entrada encontrada no /etc/hosts:');
    console.log('   ', stdout.trim());
  } catch (error) {
    console.log('❌ Nenhuma entrada para rasystem encontrada no /etc/hosts');
  }
  
  // Teste 6: Teste final de conexão PostgreSQL
  console.log('\n🗄️  Teste 6: Teste de conexão PostgreSQL');
  const client = new Client({
    connectionString: targetConnectionString
  });
  
  try {
    console.log('🔄 Tentando conectar...');
    await client.connect();
    console.log('✅ CONEXÃO PostgreSQL: SUCESSO!');
    
    const result = await client.query('SELECT version(), current_database();');
    console.log('📊 Versão:', result.rows[0].version.split(' ')[0] + ' ' + result.rows[0].version.split(' ')[1]);
    console.log('📊 Database:', result.rows[0].current_database);
    
  } catch (error) {
    console.log('❌ CONEXÃO PostgreSQL: FALHOU');
    console.log('   Erro:', error.code, '-', error.message);
  } finally {
    try {
      await client.end();
    } catch (endError) {
      // Ignorar
    }
  }
  
  console.log('\n' + '=' .repeat(60));
  console.log('📋 RESUMO DOS DIAGNÓSTICOS:');
  console.log('   String testada:', targetConnectionString.replace(/:[^@]*@/, ':****@'));
  console.log('\n💡 RECOMENDAÇÕES:');
  console.log('   1. Se DNS falhou: O hostname rasystem_rasystem-db não existe');
  console.log('   2. Se ping falhou: O servidor não está acessível');
  console.log('   3. Se porta falhou: O PostgreSQL não está rodando na porta 5440');
  console.log('   4. Considere usar localhost ou IP direto se for serviço local');
  console.log('   5. Se for Docker, certifique-se de que os containers estão rodando');
}

diagnosticTests().catch(console.error);