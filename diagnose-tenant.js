// Diagnóstico simples do problema do tenant
import fetch from 'node-fetch';

async function diagnoseTenantIssue() {
  console.log('🔍 Diagnosticando problema do tenant...\n');
  
  // 1. Teste sem autenticação
  console.log('1️⃣ Testando sem autenticação:');
  try {
    const response = await fetch('http://localhost:5000/api/tenants/current');
    console.log(`   Status: ${response.status}`);
    const data = await response.text();
    console.log(`   Response: ${data}\n`);
  } catch (error) {
    console.log(`   Erro: ${error.message}\n`);
  }
  
  // 2. Teste com token inválido
  console.log('2️⃣ Testando com token inválido:');
  try {
    const response = await fetch('http://localhost:5000/api/tenants/current', {
      headers: { 'Authorization': 'Bearer invalid-token' }
    });
    console.log(`   Status: ${response.status}`);
    const data = await response.text();
    console.log(`   Response: ${data}\n`);
  } catch (error) {
    console.log(`   Erro: ${error.message}\n`);
  }
  
  // 3. Teste com token de usuário inexistente
  console.log('3️⃣ Testando com usuário inexistente:');
  try {
    // Simular token de usuário que não existe no DB
    const fakePayload = {
      sub: '00000000-0000-0000-0000-000000000000',
      email: 'fake@example.com',
      aud: 'authenticated',
      role: 'authenticated'
    };
    
    // Não vou gerar JWT real aqui, apenas explicar o teste
    console.log('   (Teste conceitual - usuário inexistente retornaria 404)\n');
  } catch (error) {
    console.log(`   Erro: ${error.message}\n`);
  }
  
  // 4. Verificar se servidor está respondendo
  console.log('4️⃣ Testando saúde do servidor:');
  try {
    const response = await fetch('http://localhost:5000/api/analytics');
    console.log(`   Status Analytics: ${response.status}`);
    
    // Teste outra rota
    const response2 = await fetch('http://localhost:5000/api/dashboard');
    console.log(`   Status Dashboard: ${response2.status}\n`);
  } catch (error) {
    console.log(`   Erro servidor: ${error.message}\n`);
  }
  
  console.log('✅ Diagnóstico completo!');
  console.log('💡 Próximos passos:');
  console.log('   - Verificar logs do servidor no terminal');
  console.log('   - Verificar se há usuário autenticado no frontend');
  console.log('   - Testar com token válido do Supabase');
}

diagnoseTenantIssue();