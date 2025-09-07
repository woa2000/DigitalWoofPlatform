// Check onboarding table structure
import pg from 'pg';
import dotenv from 'dotenv';

dotenv.config();

const { Client } = pg;

const client = new Client({
  connectionString: process.env.DATABASE_URL,
  ssl: false
});

async function checkOnboardingSchema() {
  try {
    console.log('🔌 Connecting to database...');
    await client.connect();
    
    console.log('📋 Checking if onboarding-related tables exist...');
    
    // Check all tables
    const tablesQuery = await client.query(`
      SELECT tablename 
      FROM pg_tables 
      WHERE schemaname = 'public' 
      ORDER BY tablename
    `);
    
    console.log('\nAll tables in database:');
    console.table(tablesQuery.rows);
    
    // Look for onboarding table specifically
    const onboardingQuery = await client.query(`
      SELECT tablename 
      FROM pg_tables 
      WHERE schemaname = 'public' 
      AND tablename LIKE '%onboard%'
    `);
    
    console.log('\nOnboarding related tables:');
    if (onboardingQuery.rows.length > 0) {
      console.table(onboardingQuery.rows);
      
      // If found, show structure
      for (const table of onboardingQuery.rows) {
        console.log(`\n📋 Structure of ${table.tablename}:`);
        const columns = await client.query(`
          SELECT column_name, data_type, is_nullable 
          FROM information_schema.columns 
          WHERE table_name = $1 
          ORDER BY ordinal_position
        `, [table.tablename]);
        console.table(columns.rows);
      }
    } else {
      console.log('❌ No onboarding tables found');
      
      // Check for brand_voice or similar tables
      const brandQuery = await client.query(`
        SELECT tablename 
        FROM pg_tables 
        WHERE schemaname = 'public' 
        AND (tablename LIKE '%brand%' OR tablename LIKE '%voice%')
      `);
      
      console.log('\nBrand/Voice related tables:');
      if (brandQuery.rows.length > 0) {
        console.table(brandQuery.rows);
      } else {
        console.log('❌ No brand/voice tables found either');
      }
    }
    
  } catch (error) {
    console.error('❌ Error:', error);
  } finally {
    await client.end();
  }
}

checkOnboardingSchema();