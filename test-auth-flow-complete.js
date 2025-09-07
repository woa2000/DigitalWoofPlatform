#!/usr/bin/env node

/**
 * Teste Completo do Fluxo de Autenticação
 * 
 * Este script testa:
 * 1. Login no Supabase
 * 2. Obtenção do token JWT
 * 3. Acesso a APIs protegidas
 * 4. Refresh de token
 * 5. Logout
 */

import 'dotenv/config';
import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL = process.env.SUPABASE_URL;
const SUPABASE_ANON_KEY = process.env.SUPABASE_ANON_KEY;
const API_BASE_URL = 'http://localhost:5000';

// Usuário de teste (criado anteriormente)
const TEST_USER = {
  email: 'auth-test@digitalwoof.com',
  password: 'TestPassword123!'
};

class AuthFlowTester {
  constructor() {
    this.supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
    this.accessToken = null;
  }

  async testLogin() {
    console.log('\n🔐 === TESTE DE LOGIN ===');
    
    try {
      const { data, error } = await this.supabase.auth.signInWithPassword({
        email: TEST_USER.email,
        password: TEST_USER.password,
      });

      if (error) {
        console.error('❌ Login falhou:', error.message);
        return false;
      }

      if (data.session) {
        this.accessToken = data.session.access_token;
        console.log('✅ Login realizado com sucesso');
        console.log('📋 User ID:', data.user.id);
        console.log('📋 Email:', data.user.email);
        console.log('📋 Token Preview:', this.accessToken.substring(0, 30) + '...');
        return true;
      }

      console.error('❌ Login não retornou sessão');
      return false;
    } catch (error) {
      console.error('❌ Erro no login:', error.message);
      return false;
    }
  }

  async testPublicAPI() {
    console.log('\n🌐 === TESTE DE API PÚBLICA ===');
    
    try {
      const response = await fetch(`${API_BASE_URL}/api/config/status`);
      
      if (response.ok) {
        const data = await response.json();
        console.log('✅ API pública acessível');
        console.log('📊 Status dos serviços:', data.services?.length || 0, 'serviços');
        return true;
      } else {
        console.error('❌ API pública falhou:', response.status, response.statusText);
        return false;
      }
    } catch (error) {
      console.error('❌ Erro na API pública:', error.message);
      return false;
    }
  }

  async testProtectedAPI() {
    console.log('\n🔒 === TESTE DE API PROTEGIDA ===');
    
    if (!this.accessToken) {
      console.error('❌ Sem token de acesso para testar API protegida');
      return false;
    }

    try {
      const response = await fetch(`${API_BASE_URL}/api/dashboard/stats`, {
        headers: {
          'Authorization': `Bearer ${this.accessToken}`,
          'Content-Type': 'application/json'
        }
      });

      console.log('📡 Response status:', response.status);
      
      if (response.ok) {
        const data = await response.json();
        console.log('✅ API protegida acessível com token');
        console.log('📊 Dados recebidos:', Object.keys(data));
        return true;
      } else {
        console.error('❌ API protegida rejeitou o token:', response.status);
        const errorText = await response.text();
        console.log('📝 Error response:', errorText);
        return false;
      }
    } catch (error) {
      console.error('❌ Erro na API protegida:', error.message);
      return false;
    }
  }

  async testProtectedAPIWithoutToken() {
    console.log('\n🚫 === TESTE DE API PROTEGIDA SEM TOKEN ===');
    
    try {
      const response = await fetch(`${API_BASE_URL}/api/dashboard/stats`);
      
      if (response.status === 401) {
        console.log('✅ API corretamente rejeitou requisição sem token');
        return true;
      } else {
        console.error('❌ API deveria rejeitar requisição sem token, mas retornou:', response.status);
        return false;
      }
    } catch (error) {
      console.error('❌ Erro no teste sem token:', error.message);
      return false;
    }
  }

  async testTokenRefresh() {
    console.log('\n🔄 === TESTE DE REFRESH TOKEN ===');
    
    try {
      const { data, error } = await this.supabase.auth.refreshSession();
      
      if (error) {
        console.error('❌ Refresh token falhou:', error.message);
        return false;
      }

      if (data.session) {
        const newToken = data.session.access_token;
        console.log('✅ Token refreshed com sucesso');
        console.log('🔄 Token mudou:', newToken !== this.accessToken ? 'Sim' : 'Não');
        this.accessToken = newToken;
        return true;
      }

      console.error('❌ Refresh não retornou nova sessão');
      return false;
    } catch (error) {
      console.error('❌ Erro no refresh:', error.message);
      return false;
    }
  }

  async testLogout() {
    console.log('\n🚪 === TESTE DE LOGOUT ===');
    
    try {
      const { error } = await this.supabase.auth.signOut();
      
      if (error) {
        console.error('❌ Logout falhou:', error.message);
        return false;
      }

      console.log('✅ Logout realizado com sucesso');
      
      // Verificar se a sessão foi limpa
      const { data: { session } } = await this.supabase.auth.getSession();
      
      if (session) {
        console.error('❌ Sessão ainda existe após logout');
        return false;
      }

      console.log('✅ Sessão limpa corretamente');
      this.accessToken = null;
      return true;
    } catch (error) {
      console.error('❌ Erro no logout:', error.message);
      return false;
    }
  }

  async runAllTests() {
    console.log('🚀 === INICIANDO TESTE COMPLETO DE AUTENTICAÇÃO ===');
    console.log('📋 API Base URL:', API_BASE_URL);
    console.log('📋 Supabase URL:', SUPABASE_URL);
    console.log('📋 Test User:', TEST_USER.email);
    
    const results = {};

    // Testes em sequência
    results.login = await this.testLogin();
    results.publicAPI = await this.testPublicAPI();
    results.protectedAPIWithoutToken = await this.testProtectedAPIWithoutToken();
    
    if (results.login) {
      results.protectedAPI = await this.testProtectedAPI();
      results.tokenRefresh = await this.testTokenRefresh();
      
      // Testar API protegida novamente após refresh
      if (results.tokenRefresh) {
        console.log('\n🔄 === TESTE DE API APÓS REFRESH ===');
        results.protectedAPIAfterRefresh = await this.testProtectedAPI();
      }
      
      results.logout = await this.testLogout();
    }

    // Relatório final
    console.log('\n📊 === RELATÓRIO FINAL ===');
    
    const allTests = [
      { name: 'Login', result: results.login },
      { name: 'API Pública', result: results.publicAPI },
      { name: 'API Protegida (sem token)', result: results.protectedAPIWithoutToken },
      { name: 'API Protegida (com token)', result: results.protectedAPI },
      { name: 'Refresh Token', result: results.tokenRefresh },
      { name: 'API após Refresh', result: results.protectedAPIAfterRefresh },
      { name: 'Logout', result: results.logout }
    ];

    let passedTests = 0;
    allTests.forEach(test => {
      if (test.result !== undefined) {
        const status = test.result ? '✅' : '❌';
        console.log(`${status} ${test.name}`);
        if (test.result) passedTests++;
      }
    });

    const totalTests = allTests.filter(t => t.result !== undefined).length;
    console.log(`\n🎯 Resultado: ${passedTests}/${totalTests} testes passaram`);
    
    if (passedTests === totalTests) {
      console.log('🎉 TODOS OS TESTES PASSARAM! Sistema de autenticação funcionando corretamente.');
    } else {
      console.log('⚠️ Alguns testes falharam. Verifique os logs acima para detalhes.');
    }

    return passedTests === totalTests;
  }
}

// Executar os testes
async function main() {
  const tester = new AuthFlowTester();
  
  try {
    const success = await tester.runAllTests();
    process.exit(success ? 0 : 1);
  } catch (error) {
    console.error('💥 Erro fatal no teste:', error);
    process.exit(1);
  }
}

main().catch(console.error);