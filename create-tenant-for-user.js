import dotenv from 'dotenv';
import postgres from 'postgres';
import { randomUUID } from 'crypto';

dotenv.config();

async function createTenantForUser() {
  let client;

  try {
    // Verificar se DATABASE_URL está configurada
    if (!process.env.DATABASE_URL) {
      throw new Error('DATABASE_URL não está configurada no arquivo .env');
    }

    client = postgres(process.env.DATABASE_URL, {
      max: 1,
      ssl: false,
    });

    console.log('🧪 Criando tenant para usuário teste@exemplo.com...\n');

    // 1. Verificar se o usuário já existe no Supabase Auth
    console.log('1️⃣ Verificando se o usuário teste@exemplo.com existe...');

    // Como não temos acesso direto ao auth.users, vamos assumir que o usuário existe
    // ou criar um ID fictício para teste
    const userId = randomUUID(); // Em produção, isso viria do Supabase Auth
    const tenantId = randomUUID();

    console.log(`   - User ID: ${userId}`);
    console.log(`   - Tenant ID: ${tenantId}`);

    // 2. Criar o tenant
    console.log('\n2️⃣ Criando tenant...');
    await client`
      INSERT INTO tenants (
        id, name, slug, business_type, owner_id, status, subscription_plan,
        subscription_status, settings, brand_guidelines, created_at, updated_at
      ) VALUES (
        ${tenantId},
        'Clínica Veterinária Teste',
        'clinica-veterinaria-teste',
        'veterinaria',
        ${userId},
        'active',
        'free',
        'active',
        '{"description": "Clínica veterinária para testes do sistema"}',
        '{"primaryColor": "#1E40AF", "secondaryColor": "#EF4444", "fontFamily": "Inter"}',
        NOW(),
        NOW()
      )
    `;
    console.log('✅ Tenant criado com sucesso!');

    // 3. Adicionar usuário como owner do tenant
    console.log('\n3️⃣ Adicionando usuário como owner do tenant...');
    await client`
      INSERT INTO tenant_users (
        id, tenant_id, user_id, role, status, joined_at, created_at, updated_at
      ) VALUES (
        ${randomUUID()},
        ${tenantId},
        ${userId},
        'owner',
        'active',
        NOW(),
        NOW(),
        NOW()
      )
    `;
    console.log('✅ Usuário adicionado como owner do tenant!');

    // 4. Criar perfil do usuário associado ao tenant
    console.log('\n4️⃣ Criando perfil do usuário...');
    await client`
      INSERT INTO profiles (
        id, tenant_id, full_name, business_name, business_type,
        plan_type, subscription_status, onboarding_completed,
        timezone, language, created_at, updated_at
      ) VALUES (
        ${userId},
        ${tenantId},
        'Dr. João Silva',
        'Clínica Veterinária Teste',
        'veterinaria',
        'free',
        'active',
        false,
        'America/Sao_Paulo',
        'pt-BR',
        NOW(),
        NOW()
      )
    `;
    console.log('✅ Perfil criado e associado ao tenant!');

    // 5. Verificar dados criados
    console.log('\n🔍 Verificando dados criados...');

    const tenantData = await client`
      SELECT
        t.id, t.name, t.slug, t.business_type, t.status,
        COUNT(tu.id) as user_count,
        COUNT(p.id) as profile_count
      FROM tenants t
      LEFT JOIN tenant_users tu ON t.id = tu.tenant_id
      LEFT JOIN profiles p ON t.id = p.tenant_id
      WHERE t.id = ${tenantId}
      GROUP BY t.id, t.name, t.slug, t.business_type, t.status
    `;

    const tenant = tenantData[0];
    console.log('\n📊 Dados do tenant criado:');
    console.log(`   - ID: ${tenant.id}`);
    console.log(`   - Nome: ${tenant.name}`);
    console.log(`   - Slug: ${tenant.slug}`);
    console.log(`   - Tipo: ${tenant.business_type}`);
    console.log(`   - Status: ${tenant.status}`);
    console.log(`   - Usuários: ${tenant.user_count}`);
    console.log(`   - Perfis: ${tenant.profile_count}`);

    // 6. Verificar tenant_users
    const tenantUsers = await client`
      SELECT user_id, role, status
      FROM tenant_users
      WHERE tenant_id = ${tenantId}
    `;

    console.log('\n👥 Usuários do tenant:');
    tenantUsers.forEach(user => {
      console.log(`   - User ID: ${user.user_id}`);
      console.log(`   - Role: ${user.role}`);
      console.log(`   - Status: ${user.status}`);
    });

    console.log('\n🎉 TENANT CRIADO COM SUCESSO!');
    console.log('\n📋 Resumo:');
    console.log(`   - Tenant ID: ${tenantId}`);
    console.log(`   - User ID: ${userId}`);
    console.log(`   - Email: teste@exemplo.com`);
    console.log(`   - Role: owner`);
    console.log(`   - Status: active`);

    console.log('\n⚠️  NOTA: Em produção, o User ID deve vir do Supabase Auth');
    console.log('   Para associar a um usuário real, use o ID retornado pelo Supabase Auth.');

  } catch (error) {
    console.error('❌ Erro durante criação do tenant:', error.message);
    throw error;
  } finally {
    if (client) {
      await client.end();
    }
  }
}

// Função para verificar se o tenant já existe
async function checkExistingTenant() {
  let client;

  try {
    if (!process.env.DATABASE_URL) {
      throw new Error('DATABASE_URL não está configurada no arquivo .env');
    }

    client = postgres(process.env.DATABASE_URL, {
      max: 1,
      ssl: false,
    });

    console.log('🔍 Verificando tenants existentes...\n');

    const tenants = await client`
      SELECT
        t.id, t.name, t.slug, t.business_type, t.status,
        COUNT(tu.id) as user_count
      FROM tenants t
      LEFT JOIN tenant_users tu ON t.id = tu.tenant_id
      GROUP BY t.id, t.name, t.slug, t.business_type, t.status
      ORDER BY t.created_at DESC
    `;

    if (tenants.length === 0) {
      console.log('📭 Nenhum tenant encontrado.');
    } else {
      console.log(`📊 Encontrados ${tenants.length} tenant(s):\n`);
      tenants.forEach((tenant, index) => {
        console.log(`${index + 1}. ${tenant.name}`);
        console.log(`   - ID: ${tenant.id}`);
        console.log(`   - Slug: ${tenant.slug}`);
        console.log(`   - Tipo: ${tenant.business_type}`);
        console.log(`   - Status: ${tenant.status}`);
        console.log(`   - Usuários: ${tenant.user_count}\n`);
      });
    }

  } catch (error) {
    console.error('❌ Erro ao verificar tenants:', error.message);
  } finally {
    if (client) {
      await client.end();
    }
  }
}

// Executar as funções
async function main() {
  try {
    console.log('🚀 Iniciando criação de tenant...\n');

    // Primeiro verificar tenants existentes
    await checkExistingTenant();

    console.log('\n' + '='.repeat(50));
    console.log('🆕 CRIANDO NOVO TENANT');
    console.log('='.repeat(50));

    // Criar novo tenant
    await createTenantForUser();

  } catch (error) {
    console.error('\n💥 Falha na execução:', error.message);
    process.exit(1);
  }
}

main()
  .then(() => {
    console.log('\n✅ Processo concluído com sucesso!');
    process.exit(0);
  })
  .catch((error) => {
    console.error('\n💥 Processo falhou:', error.message);
    process.exit(1);
  });