// Test onboarding table directly in PostgreSQL
import pg from 'pg';
import dotenv from 'dotenv';

dotenv.config();

const { Client } = pg;

const client = new Client({
  connectionString: process.env.DATABASE_URL,
  ssl: false
});

const USER_ID = 'd2b5ffcd-44df-4cd6-9aa6-27341194f789';
const TENANT_ID = '2a9e300d-b240-44ea-a8e8-b35868cd5762';

async function testOnboardingTable() {
  try {
    console.log('🔌 Connecting to database...');
    await client.connect();
    
    console.log('🧪 Testing onboarding table operations...');
    console.log('👤 User ID:', USER_ID);
    console.log('🏢 Tenant ID:', TENANT_ID);
    
    // First check if record exists
    console.log('\n📋 Checking existing onboarding records...');
    const existingQuery = await client.query(
      'SELECT * FROM brand_onboarding WHERE user_id = $1',
      [USER_ID]
    );
    
    console.log('📊 Existing records found:', existingQuery.rows.length);
    if (existingQuery.rows.length > 0) {
      console.table(existingQuery.rows);
    }
    
    // Create or update record
    const recordId = crypto.randomUUID();
    
    if (existingQuery.rows.length === 0) {
      console.log('\n📝 Creating new onboarding record...');
      
      const insertQuery = `
        INSERT INTO brand_onboarding (
          id,
          user_id,
          tenant_id,
          tone_config,
          language_config,
          step_completed,
          created_at,
          updated_at
        ) VALUES ($1, $2, $3, $4, $5, $6, NOW(), NOW())
        RETURNING *
      `;
      
      const toneConfig = {
        confianca: 0.8,
        acolhimento: 0.9,
        humor: 0.6,
        especializacao: 0.7
      };
      
      const languageConfig = {
        preferredTerms: ['pets', 'carinho', 'cuidado'],
        avoidTerms: ['bicho'],
        defaultCTAs: ['Agende já!', 'Cuide do seu pet!']
      };
      
      const insertResult = await client.query(insertQuery, [
        recordId,
        USER_ID,
        TENANT_ID,
        JSON.stringify(toneConfig),
        JSON.stringify(languageConfig),
        'logo'
      ]);
      
      console.log('✅ Onboarding record created:');
      console.table(insertResult.rows);
      
    } else {
      console.log('\n📝 Updating existing onboarding record...');
      
      const updateQuery = `
        UPDATE brand_onboarding 
        SET 
          tone_config = $2,
          language_config = $3,
          step_completed = $4,
          updated_at = NOW()
        WHERE user_id = $1
        RETURNING *
      `;
      
      const toneConfig = {
        confianca: 0.9,
        acolhimento: 0.8,
        humor: 0.7,
        especializacao: 0.8
      };
      
      const languageConfig = {
        preferredTerms: ['pets', 'carinho', 'cuidado', 'amor'],
        avoidTerms: ['bicho', 'animal'],
        defaultCTAs: ['Agende já!', 'Cuide do seu pet!', 'Venha nos visitar!']
      };
      
      const updateResult = await client.query(updateQuery, [
        USER_ID,
        JSON.stringify(toneConfig),
        JSON.stringify(languageConfig),
        'tone'
      ]);
      
      console.log('✅ Onboarding record updated:');
      console.table(updateResult.rows);
    }
    
    // Test read after write
    console.log('\n🔍 Verifying final data...');
    const finalQuery = await client.query(
      'SELECT * FROM brand_onboarding WHERE user_id = $1',
      [USER_ID]
    );
    
    console.log('📊 Final record:');
    console.table(finalQuery.rows);
    
    console.log('\n✅ SUCCESS! Direct PostgreSQL operations work fine.');
    console.log('The issue is likely in the BrandOnboardingSupabaseService configuration.');
    
  } catch (error) {
    console.error('❌ Error:', error);
  } finally {
    await client.end();
  }
}

// Import crypto for UUID generation
import crypto from 'crypto';

testOnboardingTable();