// Check constraints on brand_onboarding table
import pg from 'pg';
import dotenv from 'dotenv';

dotenv.config();

const { Client } = pg;

const client = new Client({
  connectionString: process.env.DATABASE_URL,
  ssl: false
});

async function checkConstraints() {
  try {
    console.log('🔌 Connecting to database...');
    await client.connect();
    
    console.log('📋 Checking constraints on brand_onboarding table...');
    
    // Get constraint details
    const constraintsQuery = await client.query(`
      SELECT 
        conname as constraint_name,
        contype as constraint_type,
        pg_get_constraintdef(oid) as constraint_definition
      FROM pg_constraint 
      WHERE conrelid = (
        SELECT oid FROM pg_class WHERE relname = 'brand_onboarding'
      )
      AND contype = 'c'
    `);
    
    console.log('\nTable constraints:');
    console.table(constraintsQuery.rows);
    
    // Check specific step constraint
    const stepConstraint = constraintsQuery.rows.find(row => 
      row.constraint_name === 'brand_onboarding_step_valid'
    );
    
    if (stepConstraint) {
      console.log('\n🎯 Step constraint definition:');
      console.log(stepConstraint.constraint_definition);
    }
    
    // Get enum values if it's an enum
    const enumQuery = await client.query(`
      SELECT 
        t.typname,
        e.enumlabel
      FROM pg_type t 
      JOIN pg_enum e ON t.oid = e.enumtypid 
      WHERE t.typname LIKE '%step%'
      ORDER BY e.enumsortorder
    `);
    
    if (enumQuery.rows.length > 0) {
      console.log('\nEnum values for step-related types:');
      console.table(enumQuery.rows);
    }
    
    // Check column data type
    const columnQuery = await client.query(`
      SELECT 
        column_name,
        data_type,
        is_nullable,
        column_default
      FROM information_schema.columns 
      WHERE table_name = 'brand_onboarding' 
      AND column_name = 'step_completed'
    `);
    
    console.log('\nColumn info for step_completed:');
    console.table(columnQuery.rows);
    
  } catch (error) {
    console.error('❌ Error:', error);
  } finally {
    await client.end();
  }
}

checkConstraints();