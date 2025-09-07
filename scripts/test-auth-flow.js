#!/usr/bin/env node

import 'dotenv/config';
import { createClient } from '@supabase/supabase-js';

async function createTestUser() {
  const adminClient = createClient(
    process.env.SUPABASE_URL, 
    process.env.SUPABASE_SERVICE_ROLE_KEY
  );
  
  const testEmail = 'testuser@digitalwoof.dev';
  const testPassword = 'TestPassword123!';
  
  console.log('🔄 Criando usuário de teste...');
  
  try {
    const createResult = await adminClient.auth.admin.createUser({
      email: testEmail,
      password: testPassword,
      user_metadata: {
        name: 'Test User Dev',
        business_type: 'pet_shop',
        business_name: 'Test Business Dev'
      },
      email_confirm: true
    });
    
    if (createResult.error) {
      if (createResult.error.message.includes('already been registered')) {
        console.log('ℹ️  Usuário já existe, continuando...');
      } else {
        console.log('❌ Erro na criação:', createResult.error.message);
        return false;
      }
    } else {
      console.log('✅ Usuário criado:', createResult.data?.user?.email);
    }
    
    // Aguardar um pouco antes do login
    await new Promise(resolve => setTimeout(resolve, 2000));
    
    // Testar login
    console.log('🔑 Testando login...');
    const userClient = createClient(
      process.env.SUPABASE_URL, 
      process.env.SUPABASE_ANON_KEY
    );
    
    const loginResult = await userClient.auth.signInWithPassword({
      email: testEmail,
      password: testPassword
    });
    
    if (loginResult.error) {
      console.log('❌ Erro no login:', loginResult.error.message);
      return false;
    } else {
      console.log('✅ Login realizado com sucesso!');
      console.log('   User ID:', loginResult.data.user?.id);
      console.log('   Email:', loginResult.data.user?.email);
      console.log('   Token length:', loginResult.data.session?.access_token?.length);
      
      // Agora testar a API com este token
      return await testAPIWithToken(loginResult.data.session?.access_token);
    }
    
  } catch (error) {
    console.log('❌ Erro geral:', error.message);
    return false;
  }
}

async function testAPIWithToken(token) {
  console.log('🌐 Testando API com token...');
  
  try {
    const response = await fetch('http://localhost:5000/api/dashboard/stats', {
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      }
    });
    
    const data = await response.json();
    
    console.log('   Status:', response.status);
    console.log('   Response:', JSON.stringify(data, null, 2));
    
    return response.ok;
  } catch (error) {
    console.log('❌ Erro na API:', error.message);
    return false;
  }
}

createTestUser().then(success => {
  console.log('\n📊 Resultado final:', success ? '✅ SUCESSO' : '❌ FALHA');
}).catch(console.error);