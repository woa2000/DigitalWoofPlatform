import dotenv from 'dotenv';
import { Pool } from 'pg';

// Load environment variables
dotenv.config();

// Database connection
const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
});

async function debugTenantIssue() {
  try {
    console.log('🔍 Debugging tenant issue...');
    
    // First, check the structure of the profiles table
    console.log('\n� Profiles table structure:');
    const profilesStructure = await pool.query(`
      SELECT column_name, data_type, is_nullable
      FROM information_schema.columns
      WHERE table_name = 'profiles'
      ORDER BY ordinal_position
    `);
    console.table(profilesStructure.rows);
    
    // Check profiles table content (without assuming email column exists)
    console.log('\n� Profiles in database:');
    const profilesResult = await pool.query(`
      SELECT * 
      FROM profiles 
      ORDER BY created_at DESC 
      LIMIT 3
    `);
    console.table(profilesResult.rows);
    
    // Check tenants table
    console.log('\n🏢 Tenants in database:');
    const tenantsResult = await pool.query(`
      SELECT id, name, slug, business_type, created_at, created_by
      FROM tenants 
      ORDER BY created_at DESC 
      LIMIT 10
    `);
    console.table(tenantsResult.rows);
    
    // Check tenant_users table structure
    console.log('\n📋 Tenant_users table structure:');
    const tenantUsersStructure = await pool.query(`
      SELECT column_name, data_type, is_nullable
      FROM information_schema.columns
      WHERE table_name = 'tenant_users'
      ORDER BY ordinal_position
    `);
    console.table(tenantUsersStructure.rows);
    
    // Check tenant_users table content
    console.log('\n🔗 Tenant-User relationships:');
    const tenantUsersResult = await pool.query(`
      SELECT *
      FROM tenant_users 
      ORDER BY created_at DESC
      LIMIT 10
    `);
    console.table(tenantUsersResult.rows);
    
  } catch (error) {
    console.error('❌ Error debugging tenant issue:', error);
    console.error('Error details:', error.message);
  } finally {
    await pool.end();
  }
}

debugTenantIssue();