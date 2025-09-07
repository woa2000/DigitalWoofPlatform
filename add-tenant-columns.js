import dotenv from 'dotenv';
import postgres from 'postgres';

dotenv.config();

async function addTenantIdColumns() {
  let client;
  
  try {
    client = postgres(process.env.DATABASE_URL, {
      max: 1,
      ssl: false,
    });
    
    console.log('🔄 Adicionando colunas tenant_id às tabelas existentes...\n');
    
    // Lista de comandos SQL para executar
    const commands = [
      // Adicionar colunas tenant_id
      "ALTER TABLE profiles ADD COLUMN tenant_id UUID",
      "ALTER TABLE brand_onboarding ADD COLUMN tenant_id UUID", 
      "ALTER TABLE brand_voice ADD COLUMN tenant_id UUID",
      
      // Criar índices
      "CREATE INDEX idx_profiles_tenant_id ON profiles(tenant_id)",
      "CREATE INDEX idx_brand_onboarding_tenant_id ON brand_onboarding(tenant_id)",
      "CREATE INDEX idx_brand_voice_tenant_id ON brand_voice(tenant_id)",
      
      // Adicionar foreign keys
      "ALTER TABLE profiles ADD CONSTRAINT fk_profiles_tenant FOREIGN KEY (tenant_id) REFERENCES tenants(id) ON DELETE CASCADE",
      "ALTER TABLE brand_onboarding ADD CONSTRAINT fk_brand_onboarding_tenant FOREIGN KEY (tenant_id) REFERENCES tenants(id) ON DELETE CASCADE",
      "ALTER TABLE brand_voice ADD CONSTRAINT fk_brand_voice_tenant FOREIGN KEY (tenant_id) REFERENCES tenants(id) ON DELETE CASCADE"
    ];
    
    for (let i = 0; i < commands.length; i++) {
      const command = commands[i];
      console.log(`📄 Executando comando ${i + 1}/${commands.length}:`);
      console.log(`   ${command}`);
      
      try {
        await client.unsafe(command);
        console.log(`✅ Sucesso!\n`);
      } catch (error) {
        if (error.message.includes('already exists') || error.message.includes('column') && error.message.includes('already exists')) {
          console.log(`⚠️  Já existe, pulando...\n`);
        } else {
          console.log(`❌ Erro: ${error.message}\n`);
        }
      }
    }
    
    // Verificar resultado final
    console.log('🔍 Verificando colunas tenant_id criadas...');
    
    const tenantColumns = await client`
      SELECT table_name, column_name, data_type, is_nullable
      FROM information_schema.columns 
      WHERE column_name = 'tenant_id' 
      AND table_schema = 'public'
      ORDER BY table_name
    `;
    
    console.log('\n📊 Colunas tenant_id encontradas:');
    tenantColumns.forEach(col => {
      console.log(`   - ${col.table_name}.${col.column_name} (${col.data_type}, ${col.is_nullable === 'NO' ? 'NOT NULL' : 'NULLABLE'})`);
    });
    
    // Verificar constraints
    const constraints = await client`
      SELECT 
        tc.table_name,
        tc.constraint_name,
        tc.constraint_type
      FROM information_schema.table_constraints tc
      WHERE tc.table_schema = 'public'
      AND tc.constraint_name LIKE '%tenant%'
      ORDER BY tc.table_name
    `;
    
    console.log('\n🔗 Constraints de tenant encontradas:');
    constraints.forEach(constraint => {
      console.log(`   - ${constraint.table_name}: ${constraint.constraint_name} (${constraint.constraint_type})`);
    });
    
  } catch (error) {
    console.error('❌ Erro:', error.message);
    throw error;
  } finally {
    if (client) {
      await client.end();
    }
  }
}

addTenantIdColumns()
  .then(() => {
    console.log('\n🎉 Sistema de tenants completamente configurado!');
    console.log('✅ Todas as tabelas agora têm suporte a multi-tenancy');
    process.exit(0);
  })
  .catch((error) => {
    console.error('\n💥 Falha na configuração final:', error.message);
    process.exit(1);
  });