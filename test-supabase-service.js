// Test the specific error from BrandOnboardingSupabaseService
import { BrandOnboardingSupabaseService } from '../server/services/brand-onboarding-supabase.service.js';

const USER_ID = 'd2b5ffcd-44df-4cd6-9aa6-27341194f789';

async function testSupabaseService() {
  try {
    console.log('🧪 Testing BrandOnboardingSupabaseService...');
    console.log('👤 User ID:', USER_ID);
    
    // Test getting data
    console.log('\n📋 Testing getByUserId...');
    const data = await BrandOnboardingSupabaseService.getByUserId(USER_ID);
    console.log('📊 Result:', data);
    
  } catch (error) {
    console.error('❌ Error:', error);
    console.error('❌ Stack:', error.stack);
  }
}

testSupabaseService();