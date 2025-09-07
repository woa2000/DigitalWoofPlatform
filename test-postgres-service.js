// Test PostgreSQL service directly
import { BrandOnboardingPostgresService } from './server/services/brand-onboarding-postgres.service.js';
import dotenv from 'dotenv';

dotenv.config();

const USER_ID = 'd2b5ffcd-44df-4cd6-9aa6-27341194f789';
const TENANT_ID = '2a9e300d-b240-44ea-a8e8-b35868cd5762';

async function testPostgresService() {
  try {
    console.log('🧪 Testing BrandOnboardingPostgresService...');
    console.log('👤 User ID:', USER_ID);
    console.log('🏢 Tenant ID:', TENANT_ID);
    
    // Test 1: Get existing data
    console.log('\n📋 Step 1: Getting existing data...');
    const existing = await BrandOnboardingPostgresService.getByUserId(USER_ID);
    console.log('📊 Existing data:', existing);
    
    // Test 2: Update existing record
    if (existing) {
      console.log('\n📝 Step 2: Updating existing record...');
      const updateData = {
        logoUrl: 'https://example.com/new-logo.png',
        stepCompleted: 'palette',
        toneConfig: {
          confianca: 0.9,
          acolhimento: 0.8,
          humor: 0.7,
          especializacao: 0.8
        }
      };
      
      const updated = await BrandOnboardingPostgresService.update(USER_ID, updateData, TENANT_ID);
      console.log('✅ Updated data:', updated);
    } else {
      console.log('\n📝 Step 2: Creating new record...');
      const createData = {
        logoUrl: 'https://example.com/test-logo.png',
        stepCompleted: 'logo',
        toneConfig: {
          confianca: 0.8,
          acolhimento: 0.9,
          humor: 0.6,
          especializacao: 0.7
        },
        languageConfig: {
          preferredTerms: ['pets', 'carinho'],
          avoidTerms: ['bicho'],
          defaultCTAs: ['Agende já!']
        }
      };
      
      const created = await BrandOnboardingPostgresService.create(USER_ID, createData, TENANT_ID);
      console.log('✅ Created data:', created);
    }
    
    // Test 3: Get final data
    console.log('\n🔍 Step 3: Getting final data...');
    const final = await BrandOnboardingPostgresService.getByUserId(USER_ID);
    console.log('📊 Final data:', final);
    
    console.log('\n🎉 SUCCESS! PostgreSQL service is working correctly!');
    
  } catch (error) {
    console.error('❌ Error:', error);
    console.error('❌ Stack:', error.stack);
  }
}

testPostgresService();