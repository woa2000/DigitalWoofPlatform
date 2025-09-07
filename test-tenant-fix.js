#!/usr/bin/env node

/**
 * Test script to verify tenant creation and user profile fixes
 * Run with: node test-tenant-fix.js
 */

const { createClient } = require('@supabase/supabase-js');

// You'll need to set these environment variables or replace with actual values
const SUPABASE_URL = process.env.SUPABASE_URL || 'your-supabase-url';
const SUPABASE_ANON_KEY = process.env.SUPABASE_ANON_KEY || 'your-anon-key';

async function testTenantFlow() {
  console.log('🧪 Testing tenant creation and user profile fixes...\n');

  const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

  try {
    // Test 1: Sign up a test user
    console.log('1️⃣ Creating test user...');
    const testEmail = `test-${Date.now()}@example.com`;
    const testPassword = 'testpassword123';

    const { data: authData, error: authError } = await supabase.auth.signUp({
      email: testEmail,
      password: testPassword
    });

    if (authError) {
      console.error('❌ Auth signup failed:', authError);
      return;
    }

    console.log('✅ User created:', authData.user?.id);

    // Test 2: Try to access tenant endpoint
    console.log('\n2️⃣ Testing tenant endpoint access...');

    // Get session
    const { data: { session } } = await supabase.auth.getSession();

    if (!session) {
      console.error('❌ No session found');
      return;
    }

    // Make request to tenant endpoint
    const response = await fetch('http://localhost:5000/api/tenants/current', {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${session.access_token}`,
        'Content-Type': 'application/json'
      }
    });

    console.log('Response status:', response.status);
    const responseData = await response.json();
    console.log('Response data:', responseData);

    if (response.ok && responseData.success) {
      console.log('✅ Tenant endpoint working correctly!');
      console.log('Tenant data:', responseData.data);
    } else {
      console.log('❌ Tenant endpoint failed:', responseData.error);
    }

  } catch (error) {
    console.error('❌ Test failed:', error);
  }
}

// Run the test
testTenantFlow().then(() => {
  console.log('\n🏁 Test completed');
  process.exit(0);
}).catch((error) => {
  console.error('💥 Test crashed:', error);
  process.exit(1);
});