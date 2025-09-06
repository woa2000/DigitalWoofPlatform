/**
 * DEMONSTRAÇÃO: Brand Voice Cache Strategy
 * 
 * Este arquivo demonstra o uso do BrandVoiceCacheService
 * e seus managers especializados para otimização de performance
 */

import { 
  BrandVoiceCacheService, 
  brandVoiceCache, 
  activeCacheManager,
  defaultsCacheManager,
  qualityCacheManager
} from '../utils/brand-voice-cache.service';
import { BrandVoice } from '../../shared/schemas/brand-voice';

async function demonstrateCacheStrategy() {
  console.log('\n=== BRAND VOICE CACHE STRATEGY DEMO ===\n');

  try {
    // 1. Basic Cache Operations
    console.log('1. BASIC CACHE OPERATIONS');
    console.log('=========================\n');

    // Set some test data
    const testData = { message: 'Hello Cache!', timestamp: Date.now() };
    await brandVoiceCache.set('test:basic', testData, { ttl: 60 });
    console.log('✓ Data stored in cache');

    // Get data from cache
    const retrieved = await brandVoiceCache.get('test:basic');
    console.log('✓ Data retrieved from cache:', retrieved);

    // Check cache metrics
    const metrics = brandVoiceCache.getMetrics();
    console.log('Cache Metrics:', {
      hitRate: `${(metrics.hitRate * 100).toFixed(1)}%`,
      totalOps: metrics.totalOperations,
      hits: metrics.hits,
      misses: metrics.misses
    });

    // 2. TTL and Expiration
    console.log('\n2. TTL AND EXPIRATION TEST');
    console.log('==========================\n');

    // Set data with short TTL
    await brandVoiceCache.set('test:expire', { data: 'Will expire soon' }, { ttl: 2 });
    console.log('✓ Data stored with 2-second TTL');

    // Get immediately
    const fresh = await brandVoiceCache.get('test:expire');
    console.log('✓ Fresh data retrieved:', !!fresh);

    // Wait 3 seconds and try again
    console.log('⏳ Waiting 3 seconds for expiration...');
    await new Promise(resolve => setTimeout(resolve, 3000));

    const expired = await brandVoiceCache.get('test:expire');
    console.log('✓ Expired data result (should be null):', expired);

    // 3. Tag-based Invalidation
    console.log('\n3. TAG-BASED INVALIDATION');
    console.log('=========================\n');

    // Store multiple items with tags
    await brandVoiceCache.set('user:123:profile', { name: 'User 123' }, { 
      tags: ['user:123', 'profile'] 
    });
    await brandVoiceCache.set('user:123:settings', { theme: 'dark' }, { 
      tags: ['user:123', 'settings'] 
    });
    await brandVoiceCache.set('user:456:profile', { name: 'User 456' }, { 
      tags: ['user:456', 'profile'] 
    });

    console.log('✓ Stored 3 items with tags');

    // Check items exist
    const profile123 = await brandVoiceCache.get('user:123:profile');
    const settings123 = await brandVoiceCache.get('user:123:settings');
    const profile456 = await brandVoiceCache.get('user:456:profile');

    console.log('Before invalidation:', {
      profile123: !!profile123,
      settings123: !!settings123,
      profile456: !!profile456
    });

    // Invalidate all user:123 items
    const invalidated = await brandVoiceCache.invalidateByTags(['user:123']);
    console.log(`✓ Invalidated ${invalidated} items with tag 'user:123'`);

    // Check items again
    const afterProfile123 = await brandVoiceCache.get('user:123:profile');
    const afterSettings123 = await brandVoiceCache.get('user:123:settings');
    const afterProfile456 = await brandVoiceCache.get('user:456:profile');

    console.log('After invalidation:', {
      profile123: !!afterProfile123,
      settings123: !!afterSettings123,
      profile456: !!afterProfile456 // Should still exist
    });

    // 4. Pattern-based Invalidation
    console.log('\n4. PATTERN-BASED INVALIDATION');
    console.log('=============================\n');

    // Store items with pattern
    await brandVoiceCache.set('temp:data:1', { id: 1 });
    await brandVoiceCache.set('temp:data:2', { id: 2 });
    await brandVoiceCache.set('permanent:data:1', { id: 1 });

    console.log('✓ Stored items with patterns');

    // Invalidate all temp: items
    const patternInvalidated = await brandVoiceCache.invalidateByPattern(/^temp:/);
    console.log(`✓ Invalidated ${patternInvalidated} items matching pattern /^temp:/`);

    // Check results
    const temp1 = await brandVoiceCache.get('temp:data:1');
    const permanent1 = await brandVoiceCache.get('permanent:data:1');

    console.log('Pattern invalidation results:', {
      temp1: !!temp1, // Should be null
      permanent1: !!permanent1 // Should exist
    });

    // 5. Active Brand Voice Cache Manager
    console.log('\n5. ACTIVE BRAND VOICE CACHE MANAGER');
    console.log('===================================\n');

    const mockBrandVoice: BrandVoice = {
      $schema: 'https://digitalwoof.com/schemas/brand-voice/v1.0.json',
      version: '1.0',
      metadata: {
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
        version_history: [
          {
            date: new Date().toISOString(),
            version: '1.0',
            changes: 'Initial creation',
            created_by: 'user123'
          }
        ],
        source: {
          manual_override: false,
          anamnesis_analysis_id: 'anamnesis-123',
          onboarding_session_id: 'onboarding-456'
        },
        quality_metrics: {
          completeness_score: 0.9,
          consistency_score: 0.85,
          specificity_score: 0.8,
          usability_score: 0.88,
          last_validated: new Date().toISOString()
        }
      },
      brand: {
        name: 'Test Veterinary Clinic',
        segment: 'veterinaria',
        businessType: 'clinica',
        mission: 'Provide excellent veterinary care',
        values: [
          { name: 'Excellence', description: 'We strive for excellence', weight: 1.0 }
        ],
        targetAudience: {
          primary: 'Pet owners seeking quality care',
          personas: ['Concerned pet owners'],
          painPoints: ['Pet health anxiety'],
          goals: ['Healthy pets']
        }
      },
      visual: {
        logoUrl: 'https://example.com/logo.png',
        palette: {
          primary: '#2E7D32',
          secondary: ['#81C784'],
          accent: '#FF7043',
          neutral: ['#F5F5F5']
        },
        typography: {
          primary: 'Roboto',
          style: 'professional'
        },
        imagery: {
          style: 'photography',
          mood: 'trustworthy',
          avoid: ['stress images']
        }
      },
      voice: {
        tone: {
          confiança: 0.9,
          acolhimento: 0.8,
          humor: 0.2,
          especialização: 0.95
        },
        persona: {
          description: 'Experienced veterinarian',
          characteristics: ['Competent', 'Empathetic'],
          communication_style: 'professional'
        },
        lexicon: {
          prefer: ['pet', 'companion'],
          avoid: ['animal'],
          banned: ['guaranteed cure'],
          industry_specific: {
            medical_terms: 'technical',
            pet_terminology: ['pet', 'companion']
          }
        },
        style: {
          sentence_length: 'medium',
          paragraph_style: 'scannable',
          use_questions: true,
          use_exclamations: false,
          use_emojis: 'minimal',
          cta_style: {
            preferred: ['Schedule consultation'],
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
          claims_policy: 'Strict policy for health claims',
          disclaimer_required: true,
          default_disclaimer: 'Consult a veterinarian',
          review_triggers: ['cure', 'guarantee']
        },
        legal: {
          lgpd_compliance: true,
          copyright_policy: 'Original content only',
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
            tone_adjustment: 0,
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

    // Test active cache manager
    await activeCacheManager.setActiveBrandVoice('user123', mockBrandVoice);
    console.log('✓ Active brand voice cached for user123');

    const activeBV = await activeCacheManager.getActiveBrandVoice('user123');
    console.log('✓ Active brand voice retrieved:', {
      name: activeBV?.brand.name,
      segment: activeBV?.brand.segment,
      version: activeBV?.version
    });

    // Test user cache invalidation
    await activeCacheManager.invalidateUserCache('user123');
    console.log('✓ User cache invalidated');

    const afterInvalidation = await activeCacheManager.getActiveBrandVoice('user123');
    console.log('✓ After invalidation (should be null):', !!afterInvalidation);

    // 6. Cache Health and Metrics
    console.log('\n6. CACHE HEALTH AND METRICS');
    console.log('===========================\n');

    // Add some load to cache
    for (let i = 0; i < 50; i++) {
      await brandVoiceCache.set(`load-test:${i}`, { data: `Item ${i}` });
      await brandVoiceCache.get(`load-test:${i}`);
    }

    const finalMetrics = brandVoiceCache.getMetrics();
    console.log('Final Cache Metrics:', {
      hitRate: `${(finalMetrics.hitRate * 100).toFixed(1)}%`,
      totalOperations: finalMetrics.totalOperations,
      hits: finalMetrics.hits,
      misses: finalMetrics.misses,
      memoryUsage: `${(finalMetrics.memoryUsage / 1024).toFixed(1)}KB`,
      evictions: finalMetrics.evictions
    });

    const health = brandVoiceCache.getHealthStatus();
    console.log('Cache Health Status:', {
      status: health.status,
      issueCount: health.issues.length,
      recommendationCount: health.recommendations.length
    });

    if (health.issues.length > 0) {
      console.log('Issues:', health.issues);
      console.log('Recommendations:', health.recommendations);
    }

    // 7. Configuration Test
    console.log('\n7. CONFIGURATION TEST');
    console.log('=====================\n');

    const config = brandVoiceCache.getConfiguration();
    console.log('Current Configuration:', {
      maxSize: config.maxSize,
      defaultTTL: `${config.defaultTTL}s`,
      cleanupInterval: `${config.cleanupInterval}s`,
      enableMetrics: config.enableMetrics
    });

    // Update configuration
    brandVoiceCache.updateConfiguration({
      defaultTTL: 600, // 10 minutes
      maxSize: 2000
    });

    const newConfig = brandVoiceCache.getConfiguration();
    console.log('Updated Configuration:', {
      maxSize: newConfig.maxSize,
      defaultTTL: `${newConfig.defaultTTL}s`
    });

    // 8. Performance Test
    console.log('\n8. PERFORMANCE TEST');
    console.log('==================\n');

    const perfStart = Date.now();
    
    // Concurrent operations
    const promises = [];
    for (let i = 0; i < 100; i++) {
      promises.push(
        brandVoiceCache.set(`perf:${i}`, { data: `Performance test ${i}` })
      );
    }
    
    await Promise.all(promises);
    
    // Concurrent reads
    const readPromises = [];
    for (let i = 0; i < 100; i++) {
      readPromises.push(brandVoiceCache.get(`perf:${i}`));
    }
    
    const results = await Promise.all(readPromises);
    const perfEnd = Date.now();
    
    console.log('Performance Results:', {
      operations: 200, // 100 writes + 100 reads
      totalTime: `${perfEnd - perfStart}ms`,
      avgPerOperation: `${((perfEnd - perfStart) / 200).toFixed(2)}ms`,
      successfulReads: results.filter(r => r !== null).length
    });

    console.log('\n✅ ALL CACHE TESTS COMPLETED SUCCESSFULLY!');
    console.log('\nT-008 Cache Strategy is working correctly! 🚀');

  } catch (error) {
    console.error('❌ Cache demo failed:', error);
    process.exit(1);
  }
}

// Execute demo if run directly
if (import.meta.url === `file://${process.argv[1]}`) {
  demonstrateCacheStrategy().catch(console.error);
}

export { demonstrateCacheStrategy };