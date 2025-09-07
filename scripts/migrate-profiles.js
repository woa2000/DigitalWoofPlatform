#!/usr/bin/env node

import fs from 'fs';
import path from 'path';
import postgres from 'postgres';
import dotenv from 'dotenv';

// Load environment variables
dotenv.config();

const DATABASE_URL = process.env.DATABASE_URL;

if (!DATABASE_URL) {
  console.error('DATABASE_URL not found in environment variables');
  process.exit(1);
}

async function runMigration() {
  const sql = postgres(DATABASE_URL);

  try {
    console.log('🚀 Starting profiles table migration...');

    // Read the migration file
    const migrationPath = path.join(process.cwd(), 'migrations', '0004_create_profiles_table.sql');
    const migrationSQL = fs.readFileSync(migrationPath, 'utf8');

    console.log('📖 Reading migration file...');

    // Split by statements and execute each one
    const statements = migrationSQL
      .split(';')
      .map(stmt => stmt.trim())
      .filter(stmt => stmt.length > 0);

    console.log(`📝 Found ${statements.length} statements to execute`);

    for (let i = 0; i < statements.length; i++) {
      const statement = statements[i];
      console.log(`⚡ Executing statement ${i + 1}/${statements.length}...`);
      
      try {
        await sql.unsafe(statement);
        console.log(`✅ Statement ${i + 1} executed successfully`);
      } catch (error) {
        console.warn(`⚠️  Statement ${i + 1} failed (might already exist):`, error.message);
      }
    }

    console.log('🎉 Migration completed successfully!');

    // Test the table by checking if it exists
    const result = await sql`
      SELECT table_name 
      FROM information_schema.tables 
      WHERE table_schema = 'public' 
      AND table_name = 'profiles'
    `;

    if (result.length > 0) {
      console.log('✅ Profiles table exists and is ready to use');
    } else {
      console.error('❌ Profiles table was not created');
    }

  } catch (error) {
    console.error('❌ Migration failed:', error);
    process.exit(1);
  } finally {
    await sql.end();
  }
}

// Run the migration
runMigration().catch(console.error);