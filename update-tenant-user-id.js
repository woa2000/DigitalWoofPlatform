import dotenv from 'dotenv';
import postgres from 'postgres';

dotenv.config();

async function updateUserIdForTenant() {
  let client;

  try {
    if (!process.env.DATABASE_URL) {
      throw new Error('DATABASE_URL não está configurada no arquivo .env');
    }

    client = postgres(process.env.DATABASE_URL, {
      max: 1,
      ssl: false,
    });

    console.log('🔄 Atualizando User ID do tenant...\n');

    // Solicitar o novo user ID
    const newUserId = process.argv[2];
    if (!newUserId) {
      console.log('❌ Uso: node update-tenant-user-id.js <new-user-id>');
      console.log('💡 Exemplo: node update-tenant-user-id.js 123e4567-e89b-12d3-a456-426614174000');
      console.log('\n📋 Para obter o User ID do Supabase:');
      console.log('   1. Acesse https://supabase.com/dashboard');
      console.log('   2. Vá para Authentication > Users');
      console.log('   3. Encontre o usuário teste@exemplo.com');
      console.log('   4. Copie o UUID do usuário');
      process.exit(1);
    }

    // Verificar se o user ID é um UUID válido
    const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
    if (!uuidRegex.test(newUserId)) {
      console.log('❌ User ID inválido. Deve ser um UUID válido.');
      process.exit(1);
    }

    console.log(`📋 Novo User ID: ${newUserId}`);

    // 1. Encontrar o tenant atual
    console.log('\n1️⃣ Buscando tenant atual...');
    const tenants = await client`
      SELECT id, name, owner_id FROM tenants ORDER BY created_at DESC LIMIT 1
    `;

    if (tenants.length === 0) {
      console.log('❌ Nenhum tenant encontrado.');
      return;
    }

    const tenant = tenants[0];
    const oldUserId = tenant.owner_id;

    console.log(`   - Tenant: ${tenant.name}`);
    console.log(`   - ID: ${tenant.id}`);
    console.log(`   - Owner atual: ${oldUserId}`);

    // 2. Atualizar owner_id do tenant
    console.log('\n2️⃣ Atualizando owner do tenant...');
    await client`
      UPDATE tenants
      SET owner_id = ${newUserId}, updated_at = NOW()
      WHERE id = ${tenant.id}
    `;
    console.log('✅ Owner do tenant atualizado!');

    // 3. Atualizar user_id na tabela tenant_users
    console.log('\n3️⃣ Atualizando tenant_users...');
    await client`
      UPDATE tenant_users
      SET user_id = ${newUserId}, updated_at = NOW()
      WHERE tenant_id = ${tenant.id} AND user_id = ${oldUserId}
    `;
    console.log('✅ Tenant users atualizado!');

    // 4. Atualizar id e tenant_id na tabela profiles
    console.log('\n4️⃣ Atualizando perfil...');
    await client`
      UPDATE profiles
      SET id = ${newUserId}, tenant_id = ${tenant.id}, updated_at = NOW()
      WHERE id = ${oldUserId}
    `;
    console.log('✅ Perfil atualizado!');

    // 5. Verificar atualizações
    console.log('\n🔍 Verificando atualizações...');

    const updatedTenant = await client`
      SELECT id, name, owner_id FROM tenants WHERE id = ${tenant.id}
    `;

    const updatedTenantUsers = await client`
      SELECT user_id, role FROM tenant_users WHERE tenant_id = ${tenant.id}
    `;

    const updatedProfile = await client`
      SELECT id, tenant_id, full_name FROM profiles WHERE id = ${newUserId}
    `;

    console.log('\n📊 Dados atualizados:');
    console.log(`   - Tenant Owner: ${updatedTenant[0].owner_id}`);
    console.log(`   - Tenant User: ${updatedTenantUsers[0].user_id}`);
    console.log(`   - Profile ID: ${updatedProfile[0].id}`);
    console.log(`   - Profile Tenant: ${updatedProfile[0].tenant_id}`);

    console.log('\n🎉 ATUALIZAÇÃO CONCLUÍDA!');
    console.log(`\n✅ User ID atualizado de ${oldUserId} para ${newUserId}`);
    console.log('✅ Tenant agora associado ao usuário real do Supabase Auth');

  } catch (error) {
    console.error('❌ Erro durante atualização:', error.message);
    throw error;
  } finally {
    if (client) {
      await client.end();
    }
  }
}

async function showUsageInstructions() {
  console.log('📋 Como atualizar o User ID do tenant:\n');

  console.log('1️⃣ Obter o User ID real do Supabase:');
  console.log('   - Acesse https://supabase.com/dashboard');
  console.log('   - Vá para Authentication > Users');
  console.log('   - Encontre o usuário teste@exemplo.com');
  console.log('   - Copie o UUID (ex: 123e4567-e89b-12d3-a456-426614174000)\n');

  console.log('2️⃣ Executar o comando:');
  console.log('   node update-tenant-user-id.js <user-id-do-supabase>\n');

  console.log('3️⃣ Exemplo:');
  console.log('   node update-tenant-user-id.js 123e4567-e89b-12d3-a456-426614174000\n');

  console.log('⚠️  IMPORTANTE:');
  console.log('   - O User ID deve ser um UUID válido');
  console.log('   - Certifique-se de que o usuário existe no Supabase Auth');
  console.log('   - Esta operação não pode ser desfeita');
}

async function main() {
  try {
    if (process.argv.length < 3) {
      await showUsageInstructions();
      return;
    }

    await updateUserIdForTenant();

  } catch (error) {
    console.error('\n💥 Falha na atualização:', error.message);
    process.exit(1);
  }
}

main();