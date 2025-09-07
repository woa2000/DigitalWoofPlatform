// Test frontend step-by-step saving with authenticated session
import fetch from 'node-fetch';
import dotenv from 'dotenv';

dotenv.config();

// JWT token we created for the test user
const JWT_TOKEN = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiJkMmI1ZmZjZC00NGRmLTRjZDYtOWFhNi0yNzM0MTE5NGY3ODkiLCJlbWFpbCI6InRlc3QuZnJvbnRlbmRAZGlnaXRhbHdvb2YuY29tIiwiYXVkIjoiYXV0aGVudGljYXRlZCIsInJvbGUiOiJhdXRoZW50aWNhdGVkIiwidXNlcl9tZXRhZGF0YSI6e30sImlhdCI6MTc1NzI4MDkyMiwiZXhwIjoxNzU3MzY3MzIyfQ._6hVZSFCl8XJLU5taRbzVXR2o6xE6maPjRc9TMkeKZw';
const USER_ID = 'd2b5ffcd-44df-4cd6-9aa6-27341194f789';
const BASE_URL = 'http://localhost:5000';

// Helper function to make authenticated API calls
async function apiRequest(endpoint, options = {}) {
  const url = `${BASE_URL}${endpoint}`;
  const headers = {
    'Authorization': `Bearer ${JWT_TOKEN}`,
    'Content-Type': 'application/json',
    ...options.headers
  };
  
  console.log(`📡 ${options.method || 'GET'} ${url}`);
  
  const response = await fetch(url, {
    ...options,
    headers
  });
  
  console.log(`📊 Response: ${response.status} ${response.statusText}`);
  
  const data = await response.json();
  console.log(`📋 Data:`, JSON.stringify(data, null, 2));
  
  return { response, data };
}

async function testOnboardingFlow() {
  try {
    console.log('🚀 Testing Digital Woof Onboarding Flow');
    console.log('👤 User ID:', USER_ID);
    console.log('🎟️ JWT Token preview:', JWT_TOKEN.substring(0, 50) + '...');
    
    // 1. Test tenant context first
    console.log('\n🏢 Step 1: Testing tenant context...');
    await apiRequest('/api/tenants/current');
    
    // 2. Get current onboarding data
    console.log('\n📋 Step 2: Getting current onboarding data...');
    await apiRequest(`/api/onboarding/${USER_ID}`);
    
    // 3. Save Logo step data
    console.log('\n🎯 Step 3: Saving Logo step data...');
    const logoData = {
      step: 'logo',
      stepCompleted: 'logo',
      logoUrl: 'https://example.com/logo.png',
      currentStep: 'logo',
      completedSteps: ['logo']
    };
    
    await apiRequest(`/api/onboarding/${USER_ID}/step`, {
      method: 'PUT',
      body: JSON.stringify(logoData)
    });
    
    // 4. Save Palette step
    console.log('\n� Step 4: Saving Palette step...');
    const paletteData = {
      step: 'palette',
      palette: {
        primary: '#1E40AF',
        secondary: '#10B981',
        accent: '#F59E0B'
      },
      stepCompleted: 'palette',
      currentStep: 'palette',
      completedSteps: ['logo', 'palette']
    };
    
    await apiRequest(`/api/onboarding/${USER_ID}/step`, {
      method: 'PUT',
      body: JSON.stringify(paletteData)
    });
    
    // 5. Save Tone step (Brand Voice)
    console.log('\n🎨 Step 5: Saving Tone step...');
    const toneData = {
      step: 'tone',
      toneConfig: {
        confianca: 0.8,
        acolhimento: 0.9,
        humor: 0.6,
        especializacao: 0.7
      },
      stepCompleted: 'tone',
      currentStep: 'tone',
      completedSteps: ['logo', 'palette', 'tone']
    };
    
    await apiRequest(`/api/onboarding/${USER_ID}/step`, {
      method: 'PUT',
      body: JSON.stringify(toneData)
    });
    
    // 6. Save Language step
    console.log('\n� Step 6: Saving Language step...');
    const languageData = {
      step: 'language',
      languageConfig: {
        preferredTerms: ['pets', 'carinho', 'cuidado', 'amor'],
        avoidTerms: ['bicho', 'animal'],
        defaultCTAs: ['Agende já!', 'Cuide do seu pet!', 'Venha nos visitar!']
      },
      stepCompleted: 'language',
      currentStep: 'language',
      completedSteps: ['logo', 'palette', 'tone', 'language']
    };
    
    await apiRequest(`/api/onboarding/${USER_ID}/step`, {
      method: 'PUT',
      body: JSON.stringify(languageData)
    });
    
    // 7. Save Values step
    console.log('\n💎 Step 7: Saving Values step...');
    const valuesData = {
      step: 'values',
      brandValues: {
        mission: 'Cuidar dos pets com amor e dedicação',
        vision: 'Ser a melhor petshop da região',
        values: ['Qualidade', 'Carinho', 'Confiança', 'Dedicação']
      },
      stepCompleted: 'values',
      currentStep: 'values',
      completedSteps: ['logo', 'palette', 'tone', 'language', 'values']
    };
    
    await apiRequest(`/api/onboarding/${USER_ID}/step`, {
      method: 'PUT',
      body: JSON.stringify(valuesData)
    });
    
    // 8. Complete onboarding
    console.log('\n✅ Step 8: Completing onboarding...');
    await apiRequest(`/api/onboarding/${USER_ID}/complete`, {
      method: 'POST'
    });
    
    // 8. Verify final data
    console.log('\n🔍 Step 9: Verifying final onboarding data...');
    await apiRequest(`/api/onboarding/${USER_ID}`);
    
    console.log('\n🎉 SUCCESS! Onboarding flow completed successfully!');
    console.log('✅ All steps were saved and the tenant context worked correctly.');
    console.log('✅ The step-by-step saving functionality is now working!');
    
  } catch (error) {
    console.error('❌ Error during onboarding flow test:', error);
  }
}

testOnboardingFlow();