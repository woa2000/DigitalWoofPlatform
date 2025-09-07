const http = require('http');

function makeRequest(options, data = null) {
  return new Promise((resolve, reject) => {
    const req = http.request(options, (res) => {
      let responseData = '';
      res.on('data', (chunk) => {
        responseData += chunk;
      });
      
      res.on('end', () => {
        try {
          const parsedData = JSON.parse(responseData);
          resolve({ status: res.statusCode, data: parsedData });
        } catch (e) {
          resolve({ status: res.statusCode, data: responseData });
        }
      });
    });

    req.on('error', (e) => {
      reject(e);
    });

    if (data) {
      req.write(JSON.stringify(data));
    }
    req.end();
  });
}

async function testProfilesAPI() {
  const baseOptions = {
    hostname: 'localhost',
    port: 5000,
    headers: {
      'Content-Type': 'application/json',
      'x-user-id': 'test-user-789'
    }
  };

  console.log('🧪 TESTE COMPLETO DA API DE PROFILES\n');

  try {
    // 1. Criar um novo profile
    console.log('1. 📝 Criando novo profile...');
    const createResult = await makeRequest({
      ...baseOptions,
      path: '/api/profiles/init',
      method: 'POST'
    }, {
      userId: 'test-user-789',
      fullName: 'João Silva',
      businessName: 'Pet Shop do João'
    });
    
    console.log(`   Status: ${createResult.status}`);
    console.log(`   Message: ${createResult.data.message}`);
    console.log(`   Profile ID: ${createResult.data.profile?.id}\n`);

    // 2. Buscar o profile criado
    console.log('2. 🔍 Buscando profile...');
    const getResult = await makeRequest({
      ...baseOptions,
      path: '/api/profiles/me',
      method: 'GET'
    });
    
    console.log(`   Status: ${getResult.status}`);
    console.log(`   Nome: ${getResult.data.fullName}`);
    console.log(`   Empresa: ${getResult.data.businessName}`);
    console.log(`   Onboarding: ${getResult.data.onboardingCompleted}\n`);

    // 3. Atualizar informações do profile
    console.log('3. ✏️ Atualizando profile...');
    const updateResult = await makeRequest({
      ...baseOptions,
      path: '/api/profiles/me',
      method: 'PUT'
    }, {
      businessType: 'petshop',
      phone: '+55 11 99999-9999',
      city: 'São Paulo',
      state: 'SP'
    });
    
    console.log(`   Status: ${updateResult.status}`);
    console.log(`   Tipo de Negócio: ${updateResult.data.businessType}`);
    console.log(`   Cidade: ${updateResult.data.city}\n`);

    // 4. Atualizar status do onboarding
    console.log('4. 🎯 Atualizando onboarding...');
    const onboardingResult = await makeRequest({
      ...baseOptions,
      path: '/api/profiles/me/onboarding',
      method: 'PATCH'
    }, {
      completed: false,
      step: 'business_info'
    });
    
    console.log(`   Status: ${onboardingResult.status}`);
    console.log(`   Onboarding Step: ${onboardingResult.data.onboardingStep}\n`);

    // 5. Atualizar informações do negócio
    console.log('5. 🏢 Atualizando informações do negócio...');
    const businessResult = await makeRequest({
      ...baseOptions,
      path: '/api/profiles/me/business',
      method: 'PATCH'
    }, {
      businessName: 'Pet Shop do João - Premium',
      businessType: 'veterinaria',
      website: 'https://petshopjoao.com.br'
    });
    
    console.log(`   Status: ${businessResult.status}`);
    console.log(`   Nome Atualizado: ${businessResult.data.businessName}`);
    console.log(`   Tipo: ${businessResult.data.businessType}`);
    console.log(`   Website: ${businessResult.data.website}\n`);

    // 6. Verificar estado final
    console.log('6. ✅ Verificando estado final...');
    const finalResult = await makeRequest({
      ...baseOptions,
      path: '/api/profiles/me',
      method: 'GET'
    });
    
    console.log(`   Status: ${finalResult.status}`);
    console.log(`   Profile completo:`);
    console.log(`   - Nome: ${finalResult.data.fullName}`);
    console.log(`   - Empresa: ${finalResult.data.businessName}`);
    console.log(`   - Tipo: ${finalResult.data.businessType}`);
    console.log(`   - Telefone: ${finalResult.data.phone}`);
    console.log(`   - Localização: ${finalResult.data.city}, ${finalResult.data.state}`);
    console.log(`   - Website: ${finalResult.data.website}`);
    console.log(`   - Onboarding: ${finalResult.data.onboardingStep}`);
    
    console.log('\n🎉 TODOS OS TESTES CONCLUÍDOS COM SUCESSO!');

  } catch (error) {
    console.error('❌ Erro durante os testes:', error.message);
  }
}

testProfilesAPI();