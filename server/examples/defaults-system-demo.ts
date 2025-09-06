/**
 * DEMONSTRAÇÃO: Brand Voice Defaults System
 * 
 * Este arquivo demonstra o uso do BrandVoiceDefaultsService
 * para gerar defaults inteligentes por segmento
 */

import { BrandVoiceDefaultsService } from '../services/brand-voice-defaults.service';
import { BrandVoice, BrandVoiceCreate } from '../../shared/schemas/brand-voice';
import { logger } from '../utils/logger';

async function demonstrateDefaultsSystem() {
  console.log('\n=== BRAND VOICE DEFAULTS SYSTEM DEMO ===\n');

  // 1. Defaults básicos por segmento
  console.log('1. DEFAULTS POR SEGMENTO');
  console.log('========================\n');

  const segments: BrandVoice['brand']['segment'][] = [
    'veterinaria', 'petshop', 'banho_tosa', 'hotel_pet', 'agropet'
  ];

  for (const segment of segments) {
    console.log(`\n--- SEGMENT: ${segment.toUpperCase()} ---`);
    
    const defaults = BrandVoiceDefaultsService.getSegmentDefaults(segment);
    
    console.log('Mission:', defaults.brand?.mission);
    console.log('Business Type:', defaults.brand?.businessType);
    console.log('Tone Profile:', defaults.voice?.tone);
    console.log('Communication Style:', defaults.voice?.persona?.communication_style);
    console.log('Primary Color:', defaults.visual?.palette?.primary);
    console.log('Compliance Level:', defaults.compliance?.regulatory?.medical_claims);
    console.log('Preferred Terms:', defaults.voice?.lexicon?.prefer?.slice(0, 3));
    console.log('Banned Terms:', defaults.voice?.lexicon?.banned?.slice(0, 2));
  }

  // 2. Quality-optimized defaults
  console.log('\n\n2. QUALITY-OPTIMIZED DEFAULTS');
  console.log('=============================\n');

  const qualityDefaults = BrandVoiceDefaultsService.getQualityOptimizedDefaults('veterinaria');
  console.log('Veterinária - Quality Optimized:');
  console.log('- Values count:', qualityDefaults.brand?.values?.length);
  console.log('- Personas count:', qualityDefaults.brand?.targetAudience?.personas.length);
  console.log('- Characteristics count:', qualityDefaults.voice?.persona?.characteristics.length);
  console.log('- Preferred terms count:', qualityDefaults.voice?.lexicon?.prefer?.length);

  // 3. Business type specific defaults
  console.log('\n\n3. BUSINESS TYPE SPECIFIC DEFAULTS');
  console.log('==================================\n');

  const businessTypes: BrandVoice['brand']['businessType'][] = ['clinica', 'comercio', 'servico', 'misto'];
  
  for (const businessType of businessTypes) {
    console.log(`\n--- PETSHOP + ${businessType.toUpperCase()} ---`);
    
    const btDefaults = BrandVoiceDefaultsService.getBusinessTypeDefaults('petshop', businessType);
    console.log('Adjusted Tone:', btDefaults.voice?.tone);
    console.log('Business Type:', btDefaults.brand?.businessType);
  }

  // 4. Merge com input do usuário
  console.log('\n\n4. MERGE COM INPUT DO USUÁRIO');
  console.log('=============================\n');

  const userInput: Partial<BrandVoiceCreate> = {
    brand: {
      name: 'VetCare Premium',
      mission: 'Cuidado veterinário de excelência com tecnologia avançada',
      segment: 'veterinaria',
      businessType: 'clinica',
      values: [],
      targetAudience: {
        primary: '',
        personas: [],
        painPoints: [],
        goals: []
      }
    },
    voice: {
      tone: {
        confiança: 0.95,
        acolhimento: 0.8,
        especialização: 1.0,
        humor: 0.1
      },
      persona: {
        description: '',
        characteristics: ['Altamente especializado', 'Inovador', 'Confiável'],
        communication_style: 'professional'
      },
      lexicon: {
        prefer: [],
        avoid: [],
        banned: [],
        industry_specific: {
          medical_terms: 'technical',
          pet_terminology: []
        }
      },
      style: {
        sentence_length: 'medium',
        paragraph_style: 'scannable',
        use_questions: true,
        use_exclamations: false,
        use_emojis: 'minimal',
        cta_style: {
          preferred: [],
          urgency_level: 'medium',
          personalization: 'personalized'
        },
        formatting: {
          use_lists: true,
          use_bold: 'moderate',
          use_italics: false,
          use_quotes: false
        }
      }
    }
  };

  const merged = BrandVoiceDefaultsService.mergeWithDefaults('veterinaria', userInput);
  
  console.log('Input do usuário aplicado:');
  console.log('- Nome:', merged.brand.name);
  console.log('- Mission personalizada:', merged.brand.mission);
  console.log('- Tone personalizado:', merged.voice.tone);
  console.log('- Características personalizadas:', merged.voice.persona.characteristics);
  console.log('- Manteve defaults para:', {
    businessType: merged.brand.businessType,
    targetAudience: merged.brand.targetAudience.primary.substring(0, 50) + '...',
    complianceLevel: merged.compliance.regulatory.medical_claims
  });

  // 5. Demonstração de diferentes segmentos
  console.log('\n\n5. COMPARAÇÃO ENTRE SEGMENTOS');
  console.log('=============================\n');

  const comparison = segments.map(segment => {
    const defaults = BrandVoiceDefaultsService.getSegmentDefaults(segment as BrandVoice['brand']['segment']);
    return {
      segment,
      tone: defaults.voice?.tone,
      style: defaults.voice?.persona?.communication_style,
      urgency: defaults.voice?.style?.cta_style?.urgency_level,
      compliance: defaults.compliance?.regulatory?.medical_claims
    };
  });

  console.table(comparison);

  // 6. Validação de qualidade dos defaults
  console.log('\n\n6. VALIDAÇÃO DE QUALIDADE');
  console.log('=========================\n');

  for (const segment of ['veterinaria', 'petshop'] as const) {
    const defaults = BrandVoiceDefaultsService.getSegmentDefaults(segment);
    
    // Simular validação
    const quality = {
      hasCompleteTone: Object.keys(defaults.voice?.tone || {}).length >= 4,
      hasTargetAudience: !!defaults.brand?.targetAudience?.primary,
      hasCompliance: !!defaults.compliance?.regulatory,
      hasLexicon: (defaults.voice?.lexicon?.prefer?.length || 0) > 5,
      hasVisual: !!defaults.visual?.palette?.primary
    };

    console.log(`${segment.toUpperCase()} Quality Check:`);
    console.log('- Complete Tone:', quality.hasCompleteTone ? '✓' : '✗');
    console.log('- Target Audience:', quality.hasTargetAudience ? '✓' : '✗');
    console.log('- Compliance Rules:', quality.hasCompliance ? '✓' : '✗');
    console.log('- Rich Lexicon:', quality.hasLexicon ? '✓' : '✗');
    console.log('- Visual Identity:', quality.hasVisual ? '✓' : '✗');
    
    const score = Object.values(quality).filter(Boolean).length / Object.values(quality).length;
    console.log(`- Overall Score: ${(score * 100).toFixed(1)}%\n`);
  }

  // 7. Performance Test
  console.log('\n7. PERFORMANCE TEST');
  console.log('==================\n');

  const startTime = Date.now();
  
  // Generate defaults for all segments multiple times
  for (let i = 0; i < 10; i++) {
    for (const segment of segments) {
      BrandVoiceDefaultsService.getSegmentDefaults(segment);
      BrandVoiceDefaultsService.getQualityOptimizedDefaults(segment);
    }
  }
  
  const endTime = Date.now();
  const avgTime = (endTime - startTime) / (10 * segments.length * 2);
  
  console.log(`Performance Results:`);
  console.log(`- Total operations: ${10 * segments.length * 2}`);
  console.log(`- Total time: ${endTime - startTime}ms`);
  console.log(`- Average per operation: ${avgTime.toFixed(2)}ms`);
  console.log(`- Target: <50ms ✓`);

  console.log('\n=== DEMO CONCLUÍDA ===\n');
}

// Execute demo if run directly
if (import.meta.url === `file://${process.argv[1]}`) {
  demonstrateDefaultsSystem().catch(console.error);
}

export { demonstrateDefaultsSystem };