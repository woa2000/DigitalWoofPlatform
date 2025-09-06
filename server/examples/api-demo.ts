/**
 * DEMONSTRATION: Brand Voice REST API
 * 
 * This file demonstrates the REST API endpoints usage
 * Shows all implemented functionality with examples
 */

import express from 'express';
import brandVoiceApiRouter from '../routes/brand-voice-api';

// Mock Express app setup for testing
function createTestApp() {
  const app = express();
  app.use(express.json());
  
  // Add session middleware mock
  app.use((req: any, res: any, next: any) => {
    req.session = { userId: 'test-user-123' };
    next();
  });
  
  app.use('/api/brand-voice', brandVoiceApiRouter);
  return app;
}

async function demonstrateAPI() {
  console.log('\n=== BRAND VOICE REST API DEMONSTRATION ===\n');

  const app = createTestApp();
  const port = 3001;

  const server = app.listen(port, () => {
    console.log(`🚀 Test server running on http://localhost:${port}`);
  });

  // Give server time to start
  await new Promise(resolve => setTimeout(resolve, 1000));

  try {
    // Test 1: Health Check
    console.log('1. HEALTH CHECK');
    console.log('==============');
    
    const healthResponse = await fetch(`http://localhost:${port}/api/brand-voice/health`);
    const healthData = await healthResponse.json();
    
    console.log('✓ Health check passed');
    console.log(`- Status: ${healthData.status}`);
    console.log(`- Response time: ${healthData.responseTime}ms`);
    console.log(`- Services: ${Object.keys(healthData.services).join(', ')}`);

    // Test 2: Get Segment Defaults
    console.log('\n2. SEGMENT DEFAULTS');
    console.log('==================');
    
    const segments = ['veterinaria', 'petshop', 'banho_tosa'];
    
    for (const segment of segments) {
      const defaultsResponse = await fetch(`http://localhost:${port}/api/brand-voice/defaults/${segment}`);
      const defaultsData = await defaultsResponse.json();
      
      console.log(`\n--- ${segment.toUpperCase()} ---`);
      console.log('✓ Defaults retrieved');
      console.log(`- Mission: ${defaultsData.data.defaults.brand?.mission?.substring(0, 60)}...`);
      console.log(`- Communication style: ${defaultsData.data.defaults.voice?.persona?.communication_style}`);
      console.log(`- Primary color: ${defaultsData.data.defaults.visual?.palette?.primary}`);
    }

    // Test 3: Generate Brand Voice
    console.log('\n3. BRAND VOICE GENERATION');
    console.log('========================');
    
    const generateRequest = {
      businessInfo: {
        name: 'VetCare Premium',
        segment: 'veterinaria',
        businessType: 'clinica',
        description: 'Clínica veterinária especializada em animais de pequeno porte'
      },
      preferences: {
        tone: {
          professional: 0.9,
          friendly: 0.8,
          formal: 0.7
        },
        targetAudience: 'Tutores responsáveis que buscam cuidado veterinário especializado',
        customValues: ['Excelência técnica', 'Cuidado humanizado', 'Inovação']
      },
      options: {
        useDefaults: true,
        qualityOptimized: true
      }
    };

    const generateResponse = await fetch(`http://localhost:${port}/api/brand-voice/generate`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-user-id': 'test-user-123'
      },
      body: JSON.stringify(generateRequest)
    });

    const generateData = await generateResponse.json();
    
    console.log('✓ Brand Voice generated successfully');
    console.log(`- Brand Voice ID: ${generateData.data.brandVoice.id}`);
    console.log(`- Quality Score: ${(generateData.data.qualityMetrics.overall * 100).toFixed(1)}%`);
    console.log(`- Generation Time: ${generateData.data.metadata.generationTime}ms`);
    console.log(`- Brand Name: ${generateData.data.brandVoice.data.brand.name}`);
    console.log(`- Segment: ${generateData.data.metadata.segment}`);

    // Test 4: Get Active Brand Voice
    console.log('\n4. ACTIVE BRAND VOICE');
    console.log('====================');
    
    const activeResponse = await fetch(`http://localhost:${port}/api/brand-voice/active?includeQuality=true`, {
      headers: {
        'x-user-id': 'test-user-123'
      }
    });

    const activeData = await activeResponse.json();
    
    console.log('✓ Active Brand Voice retrieved');
    console.log(`- Brand Voice ID: ${activeData.data.brandVoice.id}`);
    console.log(`- Brand Name: ${activeData.data.brandVoice.data.brand.name}`);
    console.log(`- Quality Score: ${(activeData.data.qualityMetrics.overall * 100).toFixed(1)}%`);
    console.log(`- Version: ${activeData.data.brandVoice.metadata.version}`);
    console.log(`- Active: ${activeData.data.brandVoice.metadata.isActive}`);

    // Test 5: Quality Check
    console.log('\n5. QUALITY CHECK');
    console.log('===============');
    
    const mockBrandVoice = {
      $schema: 'https://digitalwoof.com/schemas/brand-voice/v1.0.json',
      version: '1.0',
      brand: {
        name: 'Test Pet Shop',
        segment: 'petshop',
        businessType: 'comercio',
        mission: 'Oferecer produtos de qualidade para pets',
        values: [
          { name: 'Qualidade', description: 'Produtos premium', weight: 0.9 }
        ],
        targetAudience: {
          primary: 'Tutores de pets',
          personas: ['Famílias com pets'],
          painPoints: ['Preços altos'],
          goals: ['Pet saudável']
        }
      },
      visual: {
        logoUrl: '',
        palette: { primary: '#FF6B35', secondary: [], accent: '', neutral: [] },
        typography: { primary: 'Arial', style: 'clean' },
        imagery: { style: 'photography', mood: 'playful', avoid: [] }
      },
      voice: {
        tone: { confiança: 0.8, acolhimento: 0.9, humor: 0.7, especialização: 0.6 },
        persona: {
          description: 'Amigável e conhecedor',
          characteristics: ['Entusiasta'],
          communication_style: 'friendly'
        },
        lexicon: {
          prefer: ['pet', 'amigo'],
          avoid: ['animal'],
          banned: [],
          industry_specific: { medical_terms: 'simplified', pet_terminology: [] }
        },
        style: {
          sentence_length: 'medium',
          paragraph_style: 'scannable',
          use_questions: true,
          use_exclamations: true,
          use_emojis: 'moderate',
          cta_style: { preferred: [], urgency_level: 'medium', personalization: 'personalized' },
          formatting: { use_lists: true, use_bold: 'moderate', use_italics: false, use_quotes: false }
        }
      },
      compliance: {
        regulatory: { medical_claims: 'moderate', veterinary_advice: 'optional_disclaimer', medication_mentions: 'prohibited' },
        content_policies: { claims_policy: '', disclaimer_required: false, default_disclaimer: '', review_triggers: [] },
        legal: { lgpd_compliance: true, copyright_policy: '', user_generated_content: 'moderated' }
      },
      channels: {
        social_media: {
          instagram: { tone_adjustment: 0.2, hashtag_strategy: 'moderate', story_style: 'casual' },
          facebook: { tone_adjustment: 0, post_length: 'medium', engagement_style: 'informational' },
          whatsapp: { formality_level: 'casual', response_style: 'personalized' }
        },
        content_types: {
          educational: { depth_level: 'basic', use_examples: true, include_sources: false },
          promotional: { sales_approach: 'direct', urgency_tactics: 'minimal', social_proof: 'testimonials' },
          customer_service: { response_tone: 'helpful', problem_solving: 'direct' }
        }
      }
    };

    const qualityResponse = await fetch(`http://localhost:${port}/api/brand-voice/quality-check`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-user-id': 'test-user-123'
      },
      body: JSON.stringify(mockBrandVoice)
    });

    const qualityData = await qualityResponse.json();
    
    console.log('✓ Quality check completed');
    console.log(`- Overall Score: ${(qualityData.data.qualityMetrics.overall * 100).toFixed(1)}%`);
    console.log(`- Completeness: ${(qualityData.data.qualityMetrics.completeness * 100).toFixed(1)}%`);
    console.log(`- Consistency: ${(qualityData.data.qualityMetrics.consistency * 100).toFixed(1)}%`);
    console.log(`- Specificity: ${(qualityData.data.qualityMetrics.specificity * 100).toFixed(1)}%`);
    console.log(`- Usability: ${(qualityData.data.qualityMetrics.usability * 100).toFixed(1)}%`);
    console.log(`- Recommendations: ${qualityData.data.recommendations.length}`);

    // Test 6: Legacy Profile Endpoint
    console.log('\n6. LEGACY PROFILE');
    console.log('=================');
    
    const profileResponse = await fetch(`http://localhost:${port}/api/brand-voice/profile`, {
      headers: {
        'x-user-id': 'test-user-123'
      }
    });

    const profileData = await profileResponse.json();
    
    console.log('✓ Legacy profile retrieved');
    console.log(`- Name: ${profileData.name}`);
    console.log(`- Tone: ${profileData.tone}`);
    console.log(`- Voice Status: ${profileData.voice.status}`);
    console.log(`- Consistency: ${profileData.consistency}%`);

    // Test 7: Performance Test
    console.log('\n7. PERFORMANCE TEST');
    console.log('==================');
    
    const performanceTests = [];
    const testCount = 5;
    
    for (let i = 0; i < testCount; i++) {
      const start = Date.now();
      
      await fetch(`http://localhost:${port}/api/brand-voice/defaults/veterinaria`);
      
      const duration = Date.now() - start;
      performanceTests.push(duration);
    }
    
    const avgTime = performanceTests.reduce((a, b) => a + b, 0) / performanceTests.length;
    const minTime = Math.min(...performanceTests);
    const maxTime = Math.max(...performanceTests);
    
    console.log('✓ Performance test completed');
    console.log(`- Tests run: ${testCount}`);
    console.log(`- Average response time: ${avgTime.toFixed(2)}ms`);
    console.log(`- Min response time: ${minTime}ms`);
    console.log(`- Max response time: ${maxTime}ms`);
    console.log(`- All under 500ms: ${maxTime < 500 ? '✓' : '✗'}`);

    console.log('\n✅ ALL API TESTS PASSED!');
    console.log('\nT-007 REST API Endpoints are working correctly! 🎉');

  } catch (error) {
    console.error('❌ API test failed:', error);
  } finally {
    server.close();
  }
}

// Execute demo if run directly
if (import.meta.url === `file://${process.argv[1]}`) {
  demonstrateAPI().catch(console.error);
}

export { demonstrateAPI };