// Test Supabase connection and auth
import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';

dotenv.config();

const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseAnonKey = process.env.VITE_SUPABASE_ANON_KEY;

console.log('🔧 Supabase Configuration:');
console.log('URL:', supabaseUrl);
console.log('Anon Key:', supabaseAnonKey ? `${supabaseAnonKey.substring(0, 20)}...` : 'Missing');

if (!supabaseUrl || !supabaseAnonKey) {
  console.error('❌ Missing Supabase environment variables');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseAnonKey);

async function testSupabaseAuth() {
  try {
    console.log('\n🧪 Testing Supabase connection...');
    
    // Check current session
    const { data: { session }, error: sessionError } = await supabase.auth.getSession();
    console.log('📊 Current session:', {
      hasSession: !!session,
      sessionError: sessionError?.message,
      userId: session?.user?.id,
      email: session?.user?.email
    });
    
    // Try to get current user
    const { data: { user }, error: userError } = await supabase.auth.getUser();
    console.log('👤 Current user:', {
      hasUser: !!user,
      userError: userError?.message,
      userId: user?.id,
      email: user?.email
    });
    
    // Try to sign in with test credentials
    console.log('\n🔐 Attempting test sign in...');
    const { data: signInData, error: signInError } = await supabase.auth.signInWithPassword({
      email: 'test@digitalwoof.com',
      password: 'TestPassword123!'
    });
    
    if (signInError) {
      console.log('❌ Sign in failed:', signInError.message);
      
      // Try to sign up instead
      console.log('📝 Attempting test sign up...');
      const { data: signUpData, error: signUpError } = await supabase.auth.signUp({
        email: 'test@digitalwoof.com',
        password: 'TestPassword123!'
      });
      
      if (signUpError) {
        console.log('❌ Sign up failed:', signUpError.message);
      } else {
        console.log('✅ Sign up successful:', {
          userId: signUpData.user?.id,
          email: signUpData.user?.email,
          needsConfirmation: !signUpData.session
        });
      }
    } else {
      console.log('✅ Sign in successful:', {
        userId: signInData.user?.id,
        email: signInData.user?.email,
        hasSession: !!signInData.session
      });
      
      // Test API call with new session
      if (signInData.session?.access_token) {
        console.log('\n🌐 Testing API with fresh token...');
        const response = await fetch('http://localhost:5000/api/tenants/current', {
          headers: {
            'Authorization': `Bearer ${signInData.session.access_token}`,
            'Content-Type': 'application/json'
          }
        });
        
        console.log('📊 API Response:', {
          status: response.status,
          statusText: response.statusText
        });
        
        if (response.ok) {
          const data = await response.json();
          console.log('✅ API Success:', data);
        } else {
          const errorText = await response.text();
          console.log('❌ API Error:', errorText);
        }
      }
    }
    
  } catch (error) {
    console.error('❌ Test error:', error);
  }
}

testSupabaseAuth();