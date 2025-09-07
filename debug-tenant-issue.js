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
    
    // First, check what schemas and tables exist
    console.log('\n� Available schemas:');
    const schemasResult = await pool.query(`
      SELECT schema_name 
      FROM information_schema.schemata 
      ORDER BY schema_name
    `);
    console.table(schemasResult.rows);
    
    // Check available tables in public schema
    console.log('\n📋 Tables in public schema:');
    const tablesResult = await pool.query(`
      SELECT table_name 
      FROM information_schema.tables 
      WHERE table_schema = 'public'
      ORDER BY table_name
    `);
    console.table(tablesResult.rows);
    
    // Check if we have a users table in public schema
    const usersTableCheck = await pool.query(`
      SELECT EXISTS (
        SELECT FROM information_schema.tables 
        WHERE table_schema = 'public' 
        AND table_name = 'users'
      ) as table_exists
    `);
    
    if (usersTableCheck.rows[0].table_exists) {
      console.log('\n📊 Users in public.users table:');
      const usersResult = await pool.query(`
        SELECT id, email, created_at 
        FROM users 
        ORDER BY created_at DESC 
        LIMIT 5
      `);
      console.table(usersResult.rows);
    } else {
      console.log('\n❌ No users table found in public schema');
    }
    
    // Check tenants table
    const tenantsTableCheck = await pool.query(`
      SELECT EXISTS (
        SELECT FROM information_schema.tables 
        WHERE table_schema = 'public' 
        AND table_name = 'tenants'
      ) as table_exists
    `);
    
    if (tenantsTableCheck.rows[0].table_exists) {
      console.log('\n🏢 Tenants in database:');
      const tenantsResult = await pool.query(`
        SELECT id, name, slug, business_type, created_at
        FROM tenants 
        ORDER BY created_at DESC 
        LIMIT 10
      `);
      console.table(tenantsResult.rows);
    } else {
      console.log('\n❌ No tenants table found');
    }
    
    // Check user_tenants table
    const userTenantsTableCheck = await pool.query(`
      SELECT EXISTS (
        SELECT FROM information_schema.tables 
        WHERE table_schema = 'public' 
        AND table_name = 'user_tenants'
      ) as table_exists
    `);
    
    if (userTenantsTableCheck.rows[0].table_exists) {
      console.log('\n🔗 User-Tenant relationships:');
      const userTenantsResult = await pool.query(`
        SELECT user_id, tenant_id, role, is_default, created_at
        FROM user_tenants 
        ORDER BY created_at DESC
        LIMIT 10
      `);
      console.table(userTenantsResult.rows);
    } else {
      console.log('\n❌ No user_tenants table found');
    }
    
  } catch (error) {
    console.error('❌ Error debugging tenant issue:', error);
  } finally {
    await pool.end();
  }
}

debugTenantIssue();