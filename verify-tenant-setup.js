import dotenv from 'dotenv';
import postgres from 'postgres';

dotenv.config();

async function verifyTenantSetup() {
  let client;

  try {
    if (!process.env.DATABASE_URL) {
      throw new Error('DATABASE_URL não está configurada no arquivo .env');
    }

    client = postgres(process.env.DATABASE_URL, {
      max: 1,
      ssl: false,
    });

    console.log('🔍 Verificando configuração do tenant...\n');

    // 1. Verificar tenants criados
    console.log('1️⃣ Tenants criados:');
    const tenants = await client`
      SELECT
        id, name, slug, business_type, status, subscription_plan,
        created_at, updated_at
      FROM tenants
      ORDER BY created_at DESC
    `;

    if (tenants.length === 0) {
      console.log('   📭 Nenhum tenant encontrado.');
      return;
    }

    tenants.forEach((tenant, index) => {
      console.log(`\n${index + 1}. ${tenant.name}`);
      console.log(`   - ID: ${tenant.id}`);
      console.log(`   - Slug: ${tenant.slug}`);
      console.log(`   - Tipo: ${tenant.business_type}`);
      console.log(`   - Status: ${tenant.status}`);
      console.log(`   - Plano: ${tenant.subscription_plan}`);
      console.log(`   - Criado: ${tenant.created_at.toLocaleString('pt-BR')}`);
    });

    // 2. Verificar usuários dos tenants
    console.log('\n2️⃣ Usuários dos tenants:');
    const tenantUsers = await client`
      SELECT
        tu.tenant_id, tu.user_id, tu.role, tu.status,
        t.name as tenant_name
      FROM tenant_users tu
      JOIN tenants t ON tu.tenant_id = t.id
      ORDER BY tu.created_at DESC
    `;

    if (tenantUsers.length === 0) {
      console.log('   📭 Nenhum usuário associado aos tenants.');
    } else {
      tenantUsers.forEach((user, index) => {
        console.log(`\n${index + 1}. Tenant: ${user.tenant_name}`);
        console.log(`   - User ID: ${user.user_id}`);
        console.log(`   - Role: ${user.role}`);
        console.log(`   - Status: ${user.status}`);
      });
    }

    // 3. Verificar perfis criados
    console.log('\n3️⃣ Perfis criados:');
    const profiles = await client`
      SELECT
        p.id, p.full_name, p.business_name, p.business_type,
        p.plan_type, p.onboarding_completed,
        t.name as tenant_name
      FROM profiles p
      LEFT JOIN tenants t ON p.tenant_id = t.id
      ORDER BY p.created_at DESC
    `;

    if (profiles.length === 0) {
      console.log('   📭 Nenhum perfil encontrado.');
    } else {
      profiles.forEach((profile, index) => {
        console.log(`\n${index + 1}. ${profile.full_name || 'Usuário sem nome'}`);
        console.log(`   - ID: ${profile.id}`);
        console.log(`   - Empresa: ${profile.business_name || 'N/A'}`);
        console.log(`   - Tipo: ${profile.business_type || 'N/A'}`);
        console.log(`   - Plano: ${profile.plan_type}`);
        console.log(`   - Onboarding: ${profile.onboarding_completed ? 'Completo' : 'Pendente'}`);
        console.log(`   - Tenant: ${profile.tenant_name || 'Nenhum'}`);
      });
    }

    // 4. Verificar estrutura das tabelas
    console.log('\n4️⃣ Verificando estrutura das tabelas:');

    const tables = ['tenants', 'tenant_users', 'profiles'];
    for (const table of tables) {
      const count = await client`
        SELECT COUNT(*) as count FROM ${client(table)}
      `;
      console.log(`   - ${table}: ${count[0].count} registros`);
    }

    console.log('\n✅ Verificação concluída!');

  } catch (error) {
    console.error('❌ Erro durante verificação:', error.message);
    throw error;
  } finally {
    if (client) {
      await client.end();
    }
  }
}

// Função para testar a API do tenant (se existir)
async function testTenantAPI() {
  try {
    console.log('\n🔗 Testando API do tenant...');

    // Testar endpoint de tenants
    const tenantResponse = await fetch('http://localhost:5000/api/tenants');
    if (tenantResponse.ok) {
      const tenants = await tenantResponse.json();
      console.log(`   ✅ API /api/tenants: ${tenants.length || 0} tenants encontrados`);
    } else {
      console.log(`   ⚠️  API /api/tenants: ${tenantResponse.status} ${tenantResponse.statusText}`);
    }

    // Testar endpoint de tenant atual
    const currentTenantResponse = await fetch('http://localhost:5000/api/tenants/current');
    if (currentTenantResponse.ok) {
      console.log('   ✅ API /api/tenants/current: OK');
    } else {
      console.log(`   ⚠️  API /api/tenants/current: ${currentTenantResponse.status} ${currentTenantResponse.statusText}`);
    }

  } catch (error) {
    console.log(`   ❌ Erro ao testar API: ${error.message}`);
    console.log('   💡 Certifique-se de que o servidor está rodando na porta 5000');
  }
}

async function main() {
  try {
    await verifyTenantSetup();
    await testTenantAPI();

    console.log('\n🎉 Verificação completa!');
    console.log('\n📋 Próximos passos:');
    console.log('   1. Configure o Supabase Auth com o usuário teste@exemplo.com');
    console.log('   2. Atualize o user_id no banco com o ID real do Supabase');
    console.log('   3. Teste o acesso ao TenantSettings no frontend');
    console.log('   4. Configure as permissões RLS se necessário');

  } catch (error) {
    console.error('\n💥 Falha na verificação:', error.message);
    process.exit(1);
  }
}

main();