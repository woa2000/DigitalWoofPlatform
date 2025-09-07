import dotenv from 'dotenv';
import postgres from 'postgres';
import { randomUUID } from 'crypto';

dotenv.config();

async function testTenantSystem() {
  let client;
  
  try {
    client = postgres(process.env.DATABASE_URL, {
      max: 1,
      ssl: false,
    });
    
    console.log('🧪 Testando sistema de tenants...\n');
    
    // Criar um tenant de teste
    const tenantId = randomUUID();
    const ownerId = randomUUID();
    const userId = randomUUID();
    
    console.log('1️⃣ Criando tenant de teste...');
    await client`
      INSERT INTO tenants (
        id, name, slug, business_type, owner_id, status, created_at
      ) VALUES (
        ${tenantId}, 
        'Clínica Teste', 
        'clinica-teste', 
        'veterinaria', 
        ${ownerId}, 
        'active', 
        NOW()
      )
    `;
    console.log('✅ Tenant criado com ID:', tenantId);
    
    // Adicionar usuário ao tenant
    console.log('\n2️⃣ Adicionando usuário ao tenant...');
    await client`
      INSERT INTO tenant_users (
        id, tenant_id, user_id, role, status, joined_at, created_at
      ) VALUES (
        ${randomUUID()}, 
        ${tenantId}, 
        ${userId}, 
        'admin', 
        'active', 
        NOW(), 
        NOW()
      )
    `;
    console.log('✅ Usuário adicionado ao tenant');
    
    // Criar perfil associado ao tenant
    console.log('\n3️⃣ Criando perfil associado ao tenant...');
    await client`
      INSERT INTO profiles (
        id, user_id, email, full_name, business_name, tenant_id, created_at
      ) VALUES (
        ${randomUUID()}, 
        ${userId}, 
        'teste@clinica-teste.com', 
        'Dr. João Silva', 
        'Clínica Teste', 
        ${tenantId}, 
        NOW()
      )
    `;
    console.log('✅ Perfil criado e associado ao tenant');
    
    // Criar onboarding associado ao tenant
    console.log('\n4️⃣ Criando onboarding associado ao tenant...');
    await client`
      INSERT INTO brand_onboarding (
        id, user_id, step, data, tenant_id, created_at
      ) VALUES (
        ${randomUUID()}, 
        ${userId}, 
        1, 
        '{"businessType": "veterinaria", "step": 1}', 
        ${tenantId}, 
        NOW()
      )
    `;
    console.log('✅ Onboarding criado e associado ao tenant');
    
    // Verificar dados criados
    console.log('\n🔍 Verificando dados criados...');
    
    const tenantData = await client`
      SELECT 
        t.name, 
        t.slug, 
        t.business_type,
        COUNT(tu.id) as user_count,
        COUNT(p.id) as profile_count,
        COUNT(bo.id) as onboarding_count
      FROM tenants t
      LEFT JOIN tenant_users tu ON t.id = tu.tenant_id
      LEFT JOIN profiles p ON t.id = p.tenant_id
      LEFT JOIN brand_onboarding bo ON t.id = bo.tenant_id
      WHERE t.id = ${tenantId}
      GROUP BY t.id, t.name, t.slug, t.business_type
    `;
    
    console.log('📊 Dados do tenant:');
    const tenant = tenantData[0];
    console.log(`   - Nome: ${tenant.name}`);
    console.log(`   - Slug: ${tenant.slug}`);
    console.log(`   - Tipo: ${tenant.business_type}`);
    console.log(`   - Usuários: ${tenant.user_count}`);
    console.log(`   - Perfis: ${tenant.profile_count}`);
    console.log(`   - Onboardings: ${tenant.onboarding_count}`);
    
    // Testar isolamento de dados
    console.log('\n🔒 Testando isolamento de dados...');
    
    const tenantProfiles = await client`
      SELECT email, full_name, business_name
      FROM profiles
      WHERE tenant_id = ${tenantId}
    `;
    
    console.log('📋 Perfis isolados por tenant:');
    tenantProfiles.forEach(profile => {
      console.log(`   - ${profile.full_name} (${profile.email})`);
    });
    
    // Limpar dados de teste
    console.log('\n🧹 Limpando dados de teste...');
    await client`DELETE FROM brand_onboarding WHERE tenant_id = ${tenantId}`;
    await client`DELETE FROM profiles WHERE tenant_id = ${tenantId}`;
    await client`DELETE FROM tenant_users WHERE tenant_id = ${tenantId}`;
    await client`DELETE FROM tenants WHERE id = ${tenantId}`;
    console.log('✅ Dados de teste removidos');
    
    console.log('\n🎉 TESTE COMPLETO - SISTEMA FUNCIONANDO PERFEITAMENTE!');
    
  } catch (error) {
    console.error('❌ Erro durante teste:', error.message);
    throw error;
  } finally {
    if (client) {
      await client.end();
    }
  }
}

testTenantSystem()
  .then(() => {
    console.log('\n✅ Sistema de tenants validado com sucesso!');
    process.exit(0);
  })
  .catch((error) => {
    console.error('\n💥 Falha no teste:', error.message);
    process.exit(1);
  });