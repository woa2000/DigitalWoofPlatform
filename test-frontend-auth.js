// Test frontend authentication
import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';

dotenv.config();

const supabaseUrl = process.env.VITE_SUPABASE_URL || process.env.SUPABASE_URL;
const supabaseAnonKey = process.env.VITE_SUPABASE_ANON_KEY || process.env.SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  console.error('❌ Supabase environment variables not found');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseAnonKey);

async function testFrontendAuth() {
  try {
    console.log('🧪 Testing Frontend Authentication...');
    console.log(`📡 Supabase URL: ${supabaseUrl}`);
    console.log(`🔑 Anon Key: ${supabaseAnonKey.substring(0, 20)}...`);
    
    // Check current session
    const { data: { session }, error } = await supabase.auth.getSession();
    
    console.log('📊 Session check:', {
      hasSession: !!session,
      hasAccessToken: !!session?.access_token,
      userId: session?.user?.id,
      email: session?.user?.email,
      error: error?.message
    });
    
    if (session?.access_token) {
      console.log('🎟️ Access Token Preview:', session.access_token.substring(0, 50) + '...');
      
      // Test the API call
      const response = await fetch('http://localhost:3001/api/tenants/current', {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${session.access_token}`
        }
      });
      
      console.log('📊 API Response:', {
        status: response.status,
        statusText: response.statusText,
        ok: response.ok
      });
      
      if (response.ok) {
        const data = await response.json();
        console.log('✅ API Success:', data);
      } else {
        const errorText = await response.text();
        console.log('❌ API Error:', errorText);
      }
    } else {
      console.log('❌ No access token available');
      
      // Try to sign in the existing test user
      console.log('🔄 Attempting to sign in with test@example.com...');
      
      const { data: signInData, error: signInError } = await supabase.auth.signInWithPassword({
        email: 'test@example.com',
        password: 'testpassword123'
      });
      
      if (signInError) {
        console.error('❌ Sign in error:', signInError.message);
        
        // Try creating a new test user
        console.log('� Attempting to create new test user...');
        
        const { data: signUpData, error: signUpError } = await supabase.auth.signUp({
          email: 'test@digitalwoof.com',
          password: 'TestPassword123!',
          options: {
            emailRedirectTo: undefined // Skip email confirmation
          }
        });
        
        if (signUpError) {
          console.error('❌ Sign up error:', signUpError.message);
        } else {
          console.log('✅ Signed up successfully:', {
            userId: signUpData.user?.id,
            email: signUpData.user?.email,
            emailConfirmed: signUpData.user?.email_confirmed_at
          });
          
          // Test API with new user
          if (signUpData.session?.access_token) {
            console.log('🧪 Testing API with new user...');
            
            const response = await fetch('http://localhost:3001/api/tenants/current', {
              method: 'GET',
              headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${signUpData.session.access_token}`
              }
            });
            
            console.log('📊 New user API Response:', {
              status: response.status,
              statusText: response.statusText,
              ok: response.ok
            });
            
            if (response.ok) {
              const data = await response.json();
              console.log('✅ New user API Success:', data);
            } else {
              const errorText = await response.text();
              console.log('❌ New user API Error:', errorText);
            }
          }
        }
      } else {
        console.log('✅ Signed in successfully:', {
          userId: signInData.user?.id,
          email: signInData.user?.email,
          hasSession: !!signInData.session,
          hasAccessToken: !!signInData.session?.access_token
        });
        
        // Test API with signed in user
        if (signInData.session?.access_token) {
          console.log('🧪 Testing API with signed in user...');
          
          const response = await fetch('http://localhost:3001/api/tenants/current', {
            method: 'GET',
            headers: {
              'Content-Type': 'application/json',
              'Authorization': `Bearer ${signInData.session.access_token}`
            }
          });
          
          console.log('📊 Signed in user API Response:', {
            status: response.status,
            statusText: response.statusText,
            ok: response.ok
          });
          
          if (response.ok) {
            const data = await response.json();
            console.log('✅ Signed in user API Success:', data);
          } else {
            const errorText = await response.text();
            console.log('❌ Signed in user API Error:', errorText);
          }
        }
      }
    }
    
  } catch (error) {
    console.error('❌ Test error:', error);
  }
}

testFrontendAuth();