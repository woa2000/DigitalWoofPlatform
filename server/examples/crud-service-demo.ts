/**
 * Example usage of Brand Voice CRUD Service
 * Demonstrates all CRUD operations with caching and versioning
 */

import { BrandVoiceCRUDService } from '../services/brand-voice.service';
import { BrandVoiceCreate } from '../../shared/schemas/brand-voice';

// Example usage function
export async function demonstrateCRUDOperations() {
  const crudService = new BrandVoiceCRUDService();
  const userId = 'user-123e4567-e89b-12d3-a456-426614174000';

  console.log('🔧 BRAND VOICE CRUD SERVICE DEMONSTRATION');
  console.log('='.repeat(60));

  try {
    // 1. CREATE - New Brand Voice
    console.log('\n📝 1. CREATING NEW BRAND VOICE');
    console.log('-'.repeat(40));

    const newBrandVoiceData: BrandVoiceCreate = {
      $schema: 'https://digitalwoof.com/schemas/brand-voice/v1.0.json',
      version: '1.0',
      brand: {
        name: 'Pet Clinic Excellence',
        segment: 'veterinaria',
        businessType: 'clinica',
        mission: 'Proporcionar cuidado veterinário de excelência com tecnologia avançada e atendimento humanizado para todos os pets.',
        values: [
          {
            name: 'Excelência Técnica',
            description: 'Sempre buscamos as melhores práticas veterinárias',
            weight: 0.9
          },
          {
            name: 'Cuidado Humanizado',
            description: 'Tratamos cada pet com carinho e respeito',
            weight: 0.85
          }
        ],
        targetAudience: {
          primary: 'Tutores que buscam cuidado veterinário especializado e de qualidade',
          personas: ['Tutores preocupados com saúde', 'Famílias com múltiplos pets', 'Idosos com animais de companhia'],
          painPoints: ['Ansiedade do pet em consultas', 'Custos de tratamento', 'Falta de comunicação clara'],
          goals: ['Pet saudável e feliz', 'Transparência no tratamento', 'Confiança no veterinário']
        }
      },
      visual: {
        logoUrl: 'https://example.com/pet-clinic-logo.png',
        palette: {
          primary: '#2E7D32',
          secondary: ['#81C784', '#4CAF50', '#66BB6A'],
          accent: '#FF7043',
          neutral: ['#F5F5F5', '#E0E0E0', '#BDBDBD']
        },
        typography: {
          primary: 'Roboto',
          style: 'professional'
        },
        imagery: {
          style: 'photography',
          mood: 'trustworthy',
          avoid: ['pets em stress', 'imagens muito técnicas', 'ambientes frios']
        }
      },
      voice: {
        tone: {
          confiança: 0.9,
          acolhimento: 0.85,
          humor: 0.2,
          especialização: 0.95,
          urgência: 0.3,
          formalidade: 0.7
        },
        persona: {
          description: 'Um veterinário experiente e competente que combina conhecimento técnico avançado com uma abordagem calorosa e empática, sempre explicando procedimentos de forma clara e tranquilizadora.',
          characteristics: ['Competente', 'Empático', 'Didático', 'Confiável', 'Calmo'],
          communication_style: 'professional'
        },
        lexicon: {
          prefer: ['pet', 'companheiro', 'tutor', 'cuidado especializado', 'saúde integral', 'bem-estar'],
          avoid: ['animal', 'dono', 'barato', 'rápido', 'simples'],
          banned: ['garantia de cura', '100% eficaz', 'milagroso', 'infalível'],
          industry_specific: {
            medical_terms: 'simplified',
            pet_terminology: ['pet', 'tutor responsável', 'companheiro de vida', 'amigo de quatro patas']
          }
        },
        style: {
          sentence_length: 'medium',
          paragraph_style: 'scannable',
          use_questions: true,
          use_exclamations: false,
          use_emojis: 'minimal',
          cta_style: {
            preferred: ['Agende sua consulta', 'Entre em contato conosco', 'Saiba mais sobre nossos serviços', 'Consulte nossos especialistas'],
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
      },
      compliance: {
        regulatory: {
          medical_claims: 'strict',
          veterinary_advice: 'required_disclaimer',
          medication_mentions: 'with_disclaimer'
        },
        content_policies: {
          claims_policy: 'Evitamos promessas de cura e sempre orientamos sobre a necessidade de consulta presencial',
          disclaimer_required: true,
          default_disclaimer: 'Este conteúdo é informativo. Sempre consulte um veterinário para orientações específicas sobre seu pet.',
          review_triggers: ['cura', 'garantia', 'medicamento', 'diagnóstico', 'tratamento', 'cirurgia']
        },
        legal: {
          lgpd_compliance: true,
          copyright_policy: 'Todo conteúdo é original ou devidamente licenciado, respeitando direitos autorais',
          user_generated_content: 'moderated'
        }
      },
      channels: {
        social_media: {
          instagram: {
            tone_adjustment: 0.1,
            hashtag_strategy: 'moderate',
            story_style: 'educational'
          },
          facebook: {
            tone_adjustment: 0.0,
            post_length: 'medium',
            engagement_style: 'informational'
          },
          whatsapp: {
            formality_level: 'semi-formal',
            response_style: 'personalized'
          }
        },
        content_types: {
          educational: {
            depth_level: 'intermediate',
            use_examples: true,
            include_sources: true
          },
          promotional: {
            sales_approach: 'consultative',
            urgency_tactics: 'minimal',
            social_proof: 'testimonials'
          },
          customer_service: {
            response_tone: 'helpful',
            problem_solving: 'consultative'
          }
        }
      }
    };

    const created = await crudService.create(userId, newBrandVoiceData, { autoActivate: true });
    console.log(`✅ Created Brand Voice: ${created.id}`);
    console.log(`📊 Quality Score: ${(created.qualityMetrics.overall * 100).toFixed(1)}%`);
    console.log(`🎯 Status: ${created.metadata.isActive ? 'Active' : 'Inactive'}`);
    console.log(`📅 Version: ${created.metadata.version}`);

    // 2. READ - Get by ID (should hit cache)
    console.log('\n📖 2. READING BRAND VOICE (Cache Test)');
    console.log('-'.repeat(40));

    const retrieved = await crudService.getById(userId, created.id);
    console.log(`✅ Retrieved Brand Voice: ${retrieved?.brandVoice.brand.name}`);
    console.log(`📊 Quality Score: ${(retrieved!.qualityMetrics.overall * 100).toFixed(1)}%`);

    // 3. READ - Get active Brand Voice
    console.log('\n🔍 3. GETTING ACTIVE BRAND VOICE');
    console.log('-'.repeat(40));

    const active = await crudService.getActive(userId);
    console.log(`✅ Active Brand Voice: ${active?.brandVoice.brand.name}`);
    console.log(`📅 Activated at: ${active?.metadata.activatedAt}`);

    // 4. UPDATE - Modify Brand Voice
    console.log('\n✏️  4. UPDATING BRAND VOICE');
    console.log('-'.repeat(40));

    const updates = {
      brand: {
        ...created.brandVoice.brand,
        mission: 'Proporcionar cuidado veterinário de excelência com tecnologia de ponta e atendimento humanizado, sendo referência em bem-estar animal.'
      },
      voice: {
        ...created.brandVoice.voice,
        tone: {
          ...created.brandVoice.voice.tone,
          acolhimento: 0.9 // Increase warmth
        }
      }
    };

    const updated = await crudService.update(userId, created.id, updates, 'Increased warmth tone and enhanced mission statement');
    console.log(`✅ Updated Brand Voice to version: ${updated.metadata.version}`);
    console.log(`📊 New Quality Score: ${(updated.qualityMetrics.overall * 100).toFixed(1)}%`);
    console.log(`🔄 Warmth increased to: ${updated.brandVoice.voice.tone.acolhimento}`);

    // 5. CREATE - Second Brand Voice
    console.log('\n📝 5. CREATING SECOND BRAND VOICE');
    console.log('-'.repeat(40));

    const secondBrandVoice: BrandVoiceCreate = {
      ...newBrandVoiceData,
      brand: {
        ...newBrandVoiceData.brand,
        name: 'Pet Shop Premium',
        segment: 'petshop',
        businessType: 'comercio',
        mission: 'Oferecer produtos premium e acessórios de qualidade para pets especiais'
      }
    };

    const second = await crudService.create(userId, secondBrandVoice, { autoActivate: false });
    console.log(`✅ Created second Brand Voice: ${second.id}`);
    console.log(`🎯 Status: ${second.metadata.isActive ? 'Active' : 'Inactive'}`);

    // 6. LIST - All Brand Voices
    console.log('\n📋 6. LISTING ALL BRAND VOICES');
    console.log('-'.repeat(40));

    const list = await crudService.list(userId, { page: 1, limit: 10 });
    console.log(`✅ Found ${list.items.length} Brand Voices (Total: ${list.pagination.total})`);
    
    list.items.forEach((item, index) => {
      console.log(`   ${index + 1}. ${item.brandVoice.brand.name} (${item.metadata.version}) - ${item.metadata.isActive ? 'Active' : 'Inactive'}`);
      console.log(`      Quality: ${(item.qualityMetrics.overall * 100).toFixed(1)}% | Updated: ${new Date(item.metadata.updatedAt).toLocaleDateString()}`);
    });

    // 7. ACTIVATE - Switch active Brand Voice
    console.log('\n🔄 7. SWITCHING ACTIVE BRAND VOICE');
    console.log('-'.repeat(40));

    const activated = await crudService.activate(userId, second.id);
    console.log(`✅ Activated: ${activated.brandVoice.brand.name}`);
    
    // Verify the switch
    const newActive = await crudService.getActive(userId);
    console.log(`🔍 Current active: ${newActive?.brandVoice.brand.name}`);

    // 8. LIST - Filter by active status
    console.log('\n🔍 8. FILTERING BY ACTIVE STATUS');
    console.log('-'.repeat(40));

    const activeList = await crudService.list(userId, { isActive: true });
    const inactiveList = await crudService.list(userId, { isActive: false });
    
    console.log(`✅ Active Brand Voices: ${activeList.items.length}`);
    console.log(`📝 Inactive Brand Voices: ${inactiveList.items.length}`);

    // 9. QUALITY FILTERING
    console.log('\n📊 9. FILTERING BY QUALITY SCORE');
    console.log('-'.repeat(40));

    const highQuality = await crudService.list(userId, { minQuality: 0.8 });
    console.log(`✅ High quality Brand Voices (>80%): ${highQuality.items.length}`);

    // 10. CACHE STATISTICS
    console.log('\n📈 10. CACHE PERFORMANCE');
    console.log('-'.repeat(40));

    const cacheStats = crudService.getCacheStats();
    console.log(`📦 Cache size: ${cacheStats.size}/${cacheStats.maxSize}`);
    console.log(`⏰ Expired entries: ${cacheStats.expired}`);

    // 11. DELETE - Remove Brand Voice
    console.log('\n🗑️  11. DELETING BRAND VOICE');
    console.log('-'.repeat(40));

    await crudService.delete(userId, second.id);
    console.log(`✅ Deleted Brand Voice: ${second.id}`);

    // Verify deletion
    const afterDelete = await crudService.list(userId);
    console.log(`📋 Remaining Brand Voices: ${afterDelete.items.length}`);

    console.log('\n🎉 CRUD OPERATIONS COMPLETED SUCCESSFULLY!');
    console.log('='.repeat(60));

    return {
      created,
      updated,
      final_active: await crudService.getActive(userId),
      final_list: await crudService.list(userId)
    };

  } catch (error) {
    console.error('❌ Error during CRUD operations:', error);
    throw error;
  }
}

// Performance test
export async function performanceTest() {
  const crudService = new BrandVoiceCRUDService();
  const userId = 'perf-test-user';
  
  console.log('\n⚡ PERFORMANCE TEST');
  console.log('-'.repeat(30));

  // Mock Brand Voice for testing
  const mockBrandVoice: BrandVoiceCreate = {
    $schema: 'https://digitalwoof.com/schemas/brand-voice/v1.0.json',
    version: '1.0',
    brand: {
      name: 'Test Clinic',
      segment: 'veterinaria',
      businessType: 'clinica',
      mission: 'Test mission',
      values: [{ name: 'Test', weight: 0.8 }],
      targetAudience: {
        primary: 'Test audience',
        personas: ['Test persona'],
        painPoints: ['Test pain'],
        goals: ['Test goal']
      }
    },
    visual: {
      logoUrl: 'https://example.com/logo.png',
      palette: { primary: '#000000', secondary: ['#FFFFFF'], neutral: ['#CCCCCC'] },
      typography: { primary: 'Arial', style: 'clean' },
      imagery: { style: 'photography', mood: 'professional', avoid: [] }
    },
    voice: {
      tone: { confiança: 0.8, acolhimento: 0.7, humor: 0.3, especialização: 0.9 },
      persona: { description: 'Test persona', characteristics: ['test'], communication_style: 'professional' },
      lexicon: { prefer: ['test'], avoid: [], banned: [], industry_specific: { medical_terms: 'simplified', pet_terminology: [] } },
      style: {
        sentence_length: 'medium', paragraph_style: 'scannable', use_questions: false, use_exclamations: false, use_emojis: 'none',
        cta_style: { preferred: [], urgency_level: 'low', personalization: 'generic' },
        formatting: { use_lists: false, use_bold: 'minimal', use_italics: false, use_quotes: false }
      }
    },
    compliance: {
      regulatory: { medical_claims: 'moderate', veterinary_advice: 'optional_disclaimer', medication_mentions: 'allowed' },
      content_policies: { claims_policy: 'test', disclaimer_required: false, default_disclaimer: '', review_triggers: [] },
      legal: { lgpd_compliance: true, copyright_policy: 'test', user_generated_content: 'allowed' }
    },
    channels: {
      social_media: {
        instagram: { tone_adjustment: 0, hashtag_strategy: 'minimal', story_style: 'casual' },
        facebook: { tone_adjustment: 0, post_length: 'short', engagement_style: 'conversational' },
        whatsapp: { formality_level: 'casual', response_style: 'quick' }
      },
      content_types: {
        educational: { depth_level: 'basic', use_examples: false, include_sources: false },
        promotional: { sales_approach: 'soft', urgency_tactics: 'none', social_proof: 'testimonials' },
        customer_service: { response_tone: 'friendly', problem_solving: 'direct' }
      }
    }
  };

  // Test CREATE performance
  const createStart = Date.now();
  const created = await crudService.create(userId, mockBrandVoice, { skipQualityCheck: true });
  const createTime = Date.now() - createStart;
  console.log(`📝 CREATE: ${createTime}ms`);

  // Test READ performance (first call - cache miss)
  const readStart = Date.now();
  await crudService.getById(userId, created.id);
  const readTime = Date.now() - readStart;
  console.log(`📖 READ (cache miss): ${readTime}ms`);

  // Test READ performance (second call - cache hit)
  const cacheStart = Date.now();
  await crudService.getById(userId, created.id);
  const cacheTime = Date.now() - cacheStart;
  console.log(`📖 READ (cache hit): ${cacheTime}ms`);

  // Test ACTIVE retrieval
  const activeStart = Date.now();
  await crudService.getActive(userId);
  const activeTime = Date.now() - activeStart;
  console.log(`🔍 GET ACTIVE: ${activeTime}ms`);

  console.log('\n📊 Performance Summary:');
  console.log(`- Cache improvement: ${Math.round((readTime - cacheTime) / readTime * 100)}%`);
  console.log(`- All operations under target: ${createTime < 2000 && readTime < 100 ? '✅' : '❌'}`);
}

// Export the service for use in other modules
export { BrandVoiceCRUDService };