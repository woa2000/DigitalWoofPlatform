#!/usr/bin/env node

/**
 * Script para testar criação de usuário via API
 */

const API_BASE = 'http://localhost:3001';

async function testUserCreation() {
  try {
    // Dados de teste para criação de usuário
    const userData = {
      email: 'test@digitalwoof.com.br',
      name: 'Usuário Teste',
      role: 'admin'
    };

    console.log('🔄 Testando criação de usuário...');
    console.log('Dados:', userData);

    // Fazer requisição para criar usuário
    const response = await fetch(`${API_BASE}/api/users`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        // TODO: Adicionar token de autenticação aqui
        'Authorization': 'Bearer fake-token-for-testing'
      },
      body: JSON.stringify(userData)
    });

    const result = await response.json();
    
    console.log('📊 Resposta da API:');
    console.log('Status:', response.status);
    console.log('Dados:', JSON.stringify(result, null, 2));

    if (response.ok) {
      console.log('✅ Usuário criado com sucesso!');
    } else {
      console.log('❌ Erro ao criar usuário');
    }

  } catch (error) {
    console.error('❌ Erro na requisição:', error);
  }
}

// Executar teste
testUserCreation();