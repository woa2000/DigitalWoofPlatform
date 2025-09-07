// Check database schema
import pg from 'pg';
import dotenv from 'dotenv';

dotenv.config();

const { Client } = pg;

const client = new Client({
  connectionString: process.env.DATABASE_URL,
  ssl: false
});

async function checkSchema() {
  try {
    console.log('🔌 Connecting to database...');
    await client.connect();
    
    console.log('📋 Checking profiles table structure...');
    const profilesColumns = await client.query(`
      SELECT column_name, data_type, is_nullable 
      FROM information_schema.columns 
      WHERE table_name = 'profiles' 
      ORDER BY ordinal_position
    `);
    
    console.log('Profiles table columns:');
    console.table(profilesColumns.rows);
    
    console.log('\n📋 Checking tenants table structure...');
    const tenantsColumns = await client.query(`
      SELECT column_name, data_type, is_nullable 
      FROM information_schema.columns 
      WHERE table_name = 'tenants' 
      ORDER BY ordinal_position
    `);
    
    console.log('Tenants table columns:');
    console.table(tenantsColumns.rows);
    
    console.log('\n📋 Sample data from profiles...');
    const profilesSample = await client.query('SELECT * FROM profiles LIMIT 3');
    console.table(profilesSample.rows);
    
    console.log('\n📋 Sample data from tenants...');
    const tenantsSample = await client.query('SELECT * FROM tenants LIMIT 3');
    console.table(tenantsSample.rows);
    
  } catch (error) {
    console.error('❌ Error:', error);
  } finally {
    await client.end();
  }
}

checkSchema();