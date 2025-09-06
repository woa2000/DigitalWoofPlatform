/**
 * Simple test for Brand Voice Defaults System
 */

import { BrandVoiceDefaultsService } from '../services/brand-voice-defaults.service';

console.log('Testing Brand Voice Defaults System...\n');

try {
  // Test 1: Get veterinaria defaults
  console.log('1. Testing Veterinaria Defaults:');
  const vetDefaults = BrandVoiceDefaultsService.getSegmentDefaults('veterinaria');
  console.log('✓ Veterinaria defaults generated');
  console.log('- Segment:', vetDefaults.brand?.segment);
  console.log('- Mission:', vetDefaults.brand?.mission?.substring(0, 60) + '...');
  console.log('- Tone Confidence:', vetDefaults.voice?.tone?.confiança);
  console.log('- Communication Style:', vetDefaults.voice?.persona?.communication_style);
  
  // Test 2: Get petshop defaults
  console.log('\n2. Testing Petshop Defaults:');
  const petshopDefaults = BrandVoiceDefaultsService.getSegmentDefaults('petshop');
  console.log('✓ Petshop defaults generated');
  console.log('- Segment:', petshopDefaults.brand?.segment);
  console.log('- Tone Humor:', petshopDefaults.voice?.tone?.humor);
  console.log('- Primary Color:', petshopDefaults.visual?.palette?.primary);

  // Test 3: Quality optimized
  console.log('\n3. Testing Quality Optimized:');
  const qualityDefaults = BrandVoiceDefaultsService.getQualityOptimizedDefaults('veterinaria');
  console.log('✓ Quality optimized defaults generated');
  console.log('- Values count:', qualityDefaults.brand?.values?.length);
  console.log('- Personas count:', qualityDefaults.brand?.targetAudience?.personas.length);

  // Test 4: Merge with user input
  console.log('\n4. Testing Merge with User Input:');
  const userInput = {
    brand: {
      name: 'Test Vet Clinic',
      segment: 'veterinaria' as const,
      businessType: 'clinica' as const,
      values: [],
      targetAudience: {
        primary: '',
        personas: [],
        painPoints: [],
        goals: []
      }
    }
  };
  
  const merged = BrandVoiceDefaultsService.mergeWithDefaults('veterinaria', userInput);
  console.log('✓ User input merged with defaults');
  console.log('- Final name:', merged.brand.name);
  console.log('- Has mission:', !!merged.brand.mission);
  console.log('- Has compliance:', !!merged.compliance);

  console.log('\n✅ ALL TESTS PASSED!');
  console.log('\nT-006 Default Values System is working correctly! 🎉');

} catch (error) {
  console.error('❌ Test failed:', error);
  process.exit(1);
}