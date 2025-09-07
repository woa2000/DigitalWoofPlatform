#!/usr/bin/env node

/**
 * Script de Diagnóstico da Autenticação Supabase
 * Testa todo o fluxo de autenticação do frontend ao backend
 */

import 'dotenv/config';
import { createClient } from '@supabase/supabase-js';
import fetch from 'node-fetch';

const SUPABASE_URL = process.env.VITE_SUPABASE_URL || process.env.SUPABASE_URL;
const SUPABASE_ANON_KEY = process.env.VITE_SUPABASE_ANON_KEY || process.env.SUPABASE_ANON_KEY;
const SUPABASE_JWT_SECRET = process.env.SUPABASE_JWT_SECRET;
const API_BASE_URL = 'http://localhost:5000';

console.log('🔍 DIAGNÓSTICO DE AUTENTICAÇÃO SUPABASE\n');

async function testSupabaseConnection() {
  console.log('📡 1. Testando conexão com Supabase...');
  
  if (!SUPABASE_URL || !SUPABASE_ANON_KEY) {
    console.log('❌ Credenciais Supabase não encontradas');
    console.log('   SUPABASE_URL:', !!SUPABASE_URL);
    console.log('   SUPABASE_ANON_KEY:', !!SUPABASE_ANON_KEY);
    return false;
  }

  try {
    const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
    const { data: { session }, error } = await supabase.auth.getSession();
    
    console.log('✅ Conexão Supabase estabelecida');
    console.log('   URL:', SUPABASE_URL);
    console.log('   Sessão atual:', session ? 'Existe' : 'Não existe');
    return true;
  } catch (error) {
    console.log('❌ Erro na conexão Supabase:', error.message);
    return false;
  }
}

async function testJWTSecret() {
  console.log('\n🔐 2. Testando JWT Secret...');
  
  if (!SUPABASE_JWT_SECRET) {
    console.log('❌ SUPABASE_JWT_SECRET não configurado');
    return false;
  }
  
  console.log('✅ JWT Secret configurado');
  console.log('   Length:', SUPABASE_JWT_SECRET.length);
  return true;
}

async function testUserRegistration() {
  console.log('\n👤 3. Testando registro de usuário...');
  
  try {
    const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
    const testEmail = `test-${Date.now()}@digitalwoof.com`;
    const testPassword = 'test123456';
    
    console.log(`   Tentando registrar: ${testEmail}`);
    
    const { data, error } = await supabase.auth.signUp({
      email: testEmail,
      password: testPassword,
      options: {
        data: {
          name: 'Test User',
          business_type: 'pet_shop',
          business_name: 'Test Business'
        }
      }
    });

    if (error) {
      if (error.message.includes('User already registered')) {
        console.log('ℹ️  Usuário já existe (isso é normal)');
        return testUserLogin(testEmail, testPassword);
      }
      console.log('❌ Erro no registro:', error.message);
      return null;
    }

    console.log('✅ Usuário registrado com sucesso');
    console.log('   User ID:', data.user?.id);
    console.log('   Access Token:', data.session?.access_token ? 'Presente' : 'Ausente');
    
    return data.session;
  } catch (error) {
    console.log('❌ Erro no teste de registro:', error.message);
    return null;
  }
}

async function testUserLogin(email = 'test@digitalwoof.com', password = 'test123456') {
  console.log('\n🔑 4. Testando login de usuário...');
  
  try {
    const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
    
    console.log(`   Tentando login: ${email}`);
    
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password
    });

    if (error) {
      console.log('❌ Erro no login:', error.message);
      return null;
    }

    console.log('✅ Login realizado com sucesso');
    console.log('   User ID:', data.user?.id);
    console.log('   Email:', data.user?.email);
    console.log('   Access Token Length:', data.session?.access_token?.length || 0);
    console.log('   Token Type:', data.session?.token_type);
    console.log('   Expires At:', new Date(data.session?.expires_at * 1000));
    
    return data.session;
  } catch (error) {
    console.log('❌ Erro no teste de login:', error.message);
    return null;
  }
}

async function testAPIWithoutAuth() {
  console.log('\n🌐 5. Testando API sem autenticação...');
  
  try {
    const response = await fetch(`${API_BASE_URL}/api/config/status`);
    const data = await response.json();
    
    console.log('✅ API pública funcionando');
    console.log('   Status:', response.status);
    console.log('   Response:', data.message || 'OK');
    return true;
  } catch (error) {
    console.log('❌ Erro na API pública:', error.message);
    return false;
  }
}

async function testAPIWithAuth(session) {
  console.log('\n🔒 6. Testando API com autenticação...');
  
  if (!session?.access_token) {
    console.log('❌ Não há token disponível para teste');
    return false;
  }
  
  try {
    const response = await fetch(`${API_BASE_URL}/api/dashboard/stats`, {
      headers: {
        'Authorization': `Bearer ${session.access_token}`,
        'Content-Type': 'application/json'
      }
    });
    
    const data = await response.json();
    
    if (response.ok) {
      console.log('✅ API autenticada funcionando');
      console.log('   Status:', response.status);
      console.log('   Response keys:', Object.keys(data));
      return true;
    } else {
      console.log('❌ API autenticada falhou');
      console.log('   Status:', response.status);
      console.log('   Error:', data.message || data);
      return false;
    }
  } catch (error) {
    console.log('❌ Erro na API autenticada:', error.message);
    return false;
  }
}

async function testJWTDecoding(session) {
  console.log('\n🔓 7. Testando decodificação JWT...');
  
  if (!session?.access_token) {
    console.log('❌ Não há token para decodificar');
    return false;
  }
  
  try {
    // Simular o que o middleware faz
    const jwt = await import('jsonwebtoken');
    const decoded = jwt.verify(session.access_token, SUPABASE_JWT_SECRET);
    
    console.log('✅ Token JWT válido');
    console.log('   Subject (user ID):', decoded.sub);
    console.log('   Email:', decoded.email);
    console.log('   Role:', decoded.role);
    console.log('   Audience:', decoded.aud);
    console.log('   Issued At:', new Date(decoded.iat * 1000));
    console.log('   Expires At:', new Date(decoded.exp * 1000));
    
    return true;
  } catch (error) {
    console.log('❌ Erro na decodificação JWT:', error.message);
    console.log('   JWT Secret length:', SUPABASE_JWT_SECRET?.length || 0);
    return false;
  }
}

async function main() {
  console.log('Starting diagnosis...\n');
  
  const results = {
    supabaseConnection: await testSupabaseConnection(),
    jwtSecret: await testJWTSecret(),
    apiPublic: await testAPIWithoutAuth()
  };
  
  // Só testa autenticação se os básicos funcionarem
  if (results.supabaseConnection) {
    const session = await testUserRegistration() || await testUserLogin();
    
    if (session) {
      results.authentication = true;
      results.apiAuth = await testAPIWithAuth(session);
      results.jwtDecoding = await testJWTDecoding(session);
    } else {
      results.authentication = false;
    }
  }
  
  console.log('\n📊 RESUMO DOS RESULTADOS:');
  console.log('='.repeat(40));
  console.log('✅ Conexão Supabase:', results.supabaseConnection ? 'OK' : 'FALHA');
  console.log('✅ JWT Secret:', results.jwtSecret ? 'OK' : 'FALHA');
  console.log('✅ API Pública:', results.apiPublic ? 'OK' : 'FALHA');
  console.log('✅ Autenticação:', results.authentication ? 'OK' : 'FALHA');
  console.log('✅ API Autenticada:', results.apiAuth ? 'OK' : 'FALHA');
  console.log('✅ JWT Decodificação:', results.jwtDecoding ? 'OK' : 'FALHA');
  
  const totalTests = Object.keys(results).length;
  const passedTests = Object.values(results).filter(Boolean).length;
  
  console.log(`\n📈 SCORE: ${passedTests}/${totalTests} testes passaram`);
  
  if (passedTests === totalTests) {
    console.log('🎉 Todos os testes passaram! O sistema de autenticação está funcionando.');
  } else {
    console.log('⚠️  Alguns testes falharam. Verifique os erros acima.');
  }
}

main().catch(console.error);