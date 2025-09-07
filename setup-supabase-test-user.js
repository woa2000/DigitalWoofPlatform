#!/usr/bin/env node

/**
 * Criar usuário de teste no Supabase Auth
 */

import 'dotenv/config';
import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL = process.env.SUPABASE_URL;
const SUPABASE_SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;

const TEST_USER = {
  email: 'auth-test@digitalwoof.com',
  password: 'TestPassword123!',
  name: 'Auth Test User',
  businessType: 'Technology',
  businessName: 'Digital Woof Frontend Test'
};

async function createSupabaseTestUser() {
  console.log('🔧 Creating test user in Supabase Auth...');
  
  // Use service role key for admin operations
  const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY, {
    auth: {
      autoRefreshToken: false,
      persistSession: false
    }
  });

  try {
    // Try to create the user with admin API
    const { data, error } = await supabase.auth.admin.createUser({
      email: TEST_USER.email,
      password: TEST_USER.password,
      user_metadata: {
        name: TEST_USER.name,
        business_type: TEST_USER.businessType,
        business_name: TEST_USER.businessName,
      },
      email_confirm: true // Skip email confirmation
    });

    if (error) {
      if (error.message.includes('already registered')) {
        console.log('✅ User already exists in Supabase Auth');
        
        // Try to get the existing user
        const { data: users, error: listError } = await supabase.auth.admin.listUsers();
        
        if (listError) {
          console.error('❌ Error listing users:', listError);
        } else {
          const existingUser = users.users.find(u => u.email === TEST_USER.email);
          if (existingUser) {
            console.log('📋 Existing user details:');
            console.log('  - ID:', existingUser.id);
            console.log('  - Email:', existingUser.email);
            console.log('  - Created:', existingUser.created_at);
            console.log('  - Email confirmed:', existingUser.email_confirmed_at ? 'Yes' : 'No');
          }
        }
        
        return true;
      } else {
        console.error('❌ Error creating user:', error);
        return false;
      }
    }

    console.log('✅ Test user created successfully in Supabase Auth');
    console.log('📋 User details:');
    console.log('  - ID:', data.user.id);
    console.log('  - Email:', data.user.email);
    console.log('  - Created:', data.user.created_at);
    
    return true;
  } catch (error) {
    console.error('❌ Unexpected error:', error);
    return false;
  }
}

async function testLogin() {
  console.log('\n🔐 Testing login with created user...');
  
  const supabase = createClient(SUPABASE_URL, process.env.SUPABASE_ANON_KEY);

  try {
    const { data, error } = await supabase.auth.signInWithPassword({
      email: TEST_USER.email,
      password: TEST_USER.password,
    });

    if (error) {
      console.error('❌ Login test failed:', error.message);
      return false;
    }

    console.log('✅ Login test successful');
    console.log('📋 Session details:');
    console.log('  - Access token preview:', data.session.access_token.substring(0, 30) + '...');
    console.log('  - Expires at:', new Date(data.session.expires_at * 1000).toLocaleString());
    
    // Logout after test
    await supabase.auth.signOut();
    console.log('🚪 Logged out after test');
    
    return true;
  } catch (error) {
    console.error('❌ Login test error:', error);
    return false;
  }
}

async function main() {
  console.log('🚀 Setting up Supabase Auth test user...');
  console.log('📋 Supabase URL:', SUPABASE_URL);
  console.log('📋 Test user email:', TEST_USER.email);
  
  if (!SUPABASE_URL || !SUPABASE_SERVICE_ROLE_KEY) {
    console.error('❌ Missing required environment variables');
    console.log('Required: SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY');
    process.exit(1);
  }
  
  const userCreated = await createSupabaseTestUser();
  
  if (userCreated) {
    const loginSuccessful = await testLogin();
    
    if (loginSuccessful) {
      console.log('\n🎉 Setup complete! User is ready for testing.');
    } else {
      console.log('\n⚠️ User created but login test failed.');
    }
  } else {
    console.log('\n❌ Failed to create user.');
    process.exit(1);
  }
}

main().catch(console.error);