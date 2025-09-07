// Create a user directly in PostgreSQL with a profile and tenant
import pg from 'pg';
import dotenv from 'dotenv';
import crypto from 'crypto';
import jwt from 'jsonwebtoken';

dotenv.config();

const { Client } = pg;

// Parse the DATABASE_URL
const databaseUrl = process.env.DATABASE_URL;
if (!databaseUrl) {
  console.error('❌ DATABASE_URL not found');
  process.exit(1);
}

// Connection configuration
const client = new Client({
  connectionString: databaseUrl,
  ssl: false
});

async function createTestUser() {
  try {
    console.log('🔌 Connecting to database...');
    await client.connect();
    
    console.log('🧪 Creating test user in PostgreSQL...');
    
    // Generate a unique user ID
    const userId = crypto.randomUUID();
    const tenantId = crypto.randomUUID();
    
    console.log(`📝 User ID: ${userId}`);
    console.log(`🏢 Tenant ID: ${tenantId}`);
    
    // First insert into tenants table
    const insertTenantQuery = `
      INSERT INTO tenants (
        id,
        name,
        slug,
        business_type,
        subscription_plan,
        subscription_status,
        owner_id,
        status,
        settings,
        brand_guidelines,
        billing_info,
        created_at,
        updated_at
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, NOW(), NOW())
      ON CONFLICT (id) DO UPDATE SET
        name = EXCLUDED.name,
        owner_id = EXCLUDED.owner_id,
        updated_at = NOW()
      RETURNING *
    `;
    
    const tenantResult = await client.query(insertTenantQuery, [
      tenantId,
      'Digital Woof Frontend Test',
      'digital-woof-frontend-test',
      'petshop',
      'free',
      'active',
      userId,
      'active',
      JSON.stringify({ description: 'Empresa de teste para frontend criada automaticamente' }),
      JSON.stringify({ 
        fontFamily: 'Inter', 
        primaryColor: '#1E40AF', 
        secondaryColor: '#10B981' 
      }),
      JSON.stringify({})
    ]);
    
    console.log('✅ Tenant created:', tenantResult.rows[0]);
    
    // Then insert into profiles table (simulating a Supabase user)
    const insertProfileQuery = `
      INSERT INTO profiles (
        id, 
        full_name,
        business_name,
        business_type,
        country,
        plan_type,
        subscription_status,
        onboarding_completed,
        onboarding_step,
        timezone,
        language,
        created_at, 
        updated_at,
        tenant_id
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, NOW(), NOW(), $12)
      ON CONFLICT (id) DO UPDATE SET
        full_name = EXCLUDED.full_name,
        tenant_id = EXCLUDED.tenant_id,
        updated_at = NOW()
      RETURNING *
    `;
    
    const profileResult = await client.query(insertProfileQuery, [
      userId,
      'Usuário Teste Frontend',
      'Digital Woof Frontend Test',
      'petshop',
      'BR',
      'free',
      'active',
      false,
      'welcome',
      'America/Sao_Paulo',
      'pt-BR',
      tenantId
    ]);
    
    console.log('✅ Profile created:', profileResult.rows[0]);
    
    // Insert into tenants table
    const insertTenant2Query = `
      INSERT INTO tenants (
        id,
        name,
        slug,
        business_type,
        subscription_plan,
        subscription_status,
        owner_id,
        status,
        settings,
        brand_guidelines,
        billing_info,
        created_at,
        updated_at
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, NOW(), NOW())
      ON CONFLICT (id) DO UPDATE SET
        name = EXCLUDED.name,
        owner_id = EXCLUDED.owner_id,
        updated_at = NOW()
      RETURNING *
    `;
    
    const tenant2Result = await client.query(insertTenant2Query, [
      tenantId,
      'Digital Woof Test Company',
      'digital-woof-test',
      'petshop',
      'free',
      'active',
      userId,
      'active',
      JSON.stringify({ description: 'Empresa de teste criada automaticamente' }),
      JSON.stringify({ 
        fontFamily: 'Inter', 
        primaryColor: '#1E40AF', 
        secondaryColor: '#10B981' 
      }),
      JSON.stringify({})
    ]);
    
    console.log('✅ Tenant created:', tenant2Result.rows[0]);
    
    // Now create a JWT token for this user
    const jwtSecret = process.env.SUPABASE_JWT_SECRET;
    
    if (!jwtSecret) {
      console.error('❌ SUPABASE_JWT_SECRET not found');
      return;
    }
    
    const payload = {
      sub: userId,
      email: 'test.frontend@digitalwoof.com',
      aud: 'authenticated',
      role: 'authenticated',
      user_metadata: {},
      iat: Math.floor(Date.now() / 1000),
      exp: Math.floor(Date.now() / 1000) + (60 * 60) // 1 hour
    };
    
    const token = jwt.sign(payload, jwtSecret);
    
    console.log('\n🎟️ JWT Token for testing:');
    console.log(token);
    
    console.log('\n🧪 Testing API with this token...');
    
    const response = await fetch('http://localhost:3001/api/tenants/current', {
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      }
    });
    
    console.log('📊 API Response status:', response.status);
    
    if (response.ok) {
      const data = await response.json();
      console.log('📊 API Response data:', JSON.stringify(data, null, 2));
    } else {
      const errorText = await response.text();
      console.log('❌ API Error:', errorText);
    }
    
  } catch (error) {
    console.error('❌ Error:', error);
  } finally {
    await client.end();
    console.log('🔌 Database connection closed');
  }
}

createTestUser();