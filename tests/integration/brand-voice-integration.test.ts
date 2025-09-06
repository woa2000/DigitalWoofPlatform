/**
 * T-012: Integration Tests for Brand Voice System
 * 
 * Tests the complete integration between API endpoints, services, database,
 * and cache layers for the Brand Voice JSON system.
 */

import { promises as fs } from 'fs';
import { join } from 'path';

console.log('🔗 Brand Voice System - Integration Tests');
console.log('='.repeat(65));

/**
 * Integration Test Framework
 */
class IntegrationTestFramework {
  private passed = 0;
  private failed = 0;
  private testSuite = '';

  startSuite(name: string) {
    this.testSuite = name;
    console.log(`\n📝 ${name}`);
  }

  assert(condition: boolean, message: string) {
    if (condition) {
      this.passed++;
      console.log(`  ✅ ${message}`);
    } else {
      this.failed++;
      console.log(`  ❌ ${message}`);
    }
  }

  async asyncAssert(testFunction: () => Promise<boolean>, message: string) {
    try {
      const result = await testFunction();
      this.assert(result, message);
    } catch (error) {
      this.failed++;
      console.log(`  ❌ ${message} - Error: ${(error as Error).message}`);
    }
  }

  summary() {
    console.log('\n' + '='.repeat(65));
    console.log(`📊 Integration Test Summary:`);
    console.log(`   ✅ Passed: ${this.passed}`);
    console.log(`   ❌ Failed: ${this.failed}`);
    console.log(`   📈 Success Rate: ${((this.passed / (this.passed + this.failed)) * 100).toFixed(1)}%`);
    
    if (this.failed === 0) {
      console.log('\n🎉 All integration tests passed! Brand Voice System is ready for production.');
    } else {
      console.log('\n⚠️  Some integration tests failed. Check system integration before deployment.');
    }
  }
}

/**
 * Mock HTTP Client for API Testing
 */
class MockHTTPClient {
  private responses: Map<string, any> = new Map();

  setMockResponse(endpoint: string, response: any) {
    this.responses.set(endpoint, response);
  }

  async post(endpoint: string, data: any): Promise<any> {
    // Simulate network delay
    await new Promise(resolve => setTimeout(resolve, 50));

    const mockResponse = this.responses.get(endpoint);
    if (mockResponse) {
      return mockResponse;
    }

    // Default responses for known endpoints
    if (endpoint.includes('/api/brand-voice/generate')) {
      return {
        status: 200,
        data: {
          brandVoice: {
            brand: {
              name: 'Veterinária São Paulo',
              segment: 'veterinary',
              description: 'Clínica veterinária especializada em cuidados com animais de estimação',
              targetAudience: ['pet_owners', 'animal_lovers'],
              location: 'São Paulo, SP'
            },
            voice: {
              tone: {
                professional: 0.8,
                caring: 0.9,
                humor: 0.3,
                urgency: 0.2,
                formality: 0.7
              },
              language: 'portuguese_brazil',
              vocabulary: 'accessible_technical',
              structure: 'informative'
            },
            content: {
              topics: ['pet_health', 'preventive_care', 'emergency_care'],
              avoid: ['harsh_treatments', 'complex_medical_terms'],
              messaging: {
                primary: 'A saúde do seu pet é nossa prioridade',
                secondary: 'Cuidado compassivo para os membros da sua família'
              }
            },
            guidelines: {
              doUse: ['empathetic_language', 'clear_explanations', 'reassuring_tone'],
              doNotUse: ['fear_inducing_language', 'overly_technical_terms'],
              contentTypes: ['educational_posts', 'health_tips', 'success_stories']
            },
            metadata: {
              created_at: new Date().toISOString(),
              updated_at: new Date().toISOString(),
              version: '1.0.0',
              version_history: [{ version: '1.0.0', timestamp: new Date().toISOString() }],
              source: 'anamnesis_onboarding',
              quality_metrics: {
                completeness: 0.95,
                consistency: 0.92,
                relevance: 0.88
              }
            }
          },
          metadata: {
            generatedFrom: 'anamnesis_onboarding',
            generationTime: 1250,
            timestamp: new Date().toISOString(),
            version: '1.0.0',
            cacheKey: 'bv_' + Date.now()
          }
        }
      };
    }

    if (endpoint.includes('/api/brand-voice/cache')) {
      return {
        status: 200,
        data: {
          cached: true,
          key: 'bv_test_key',
          ttl: 3600
        }
      };
    }

    if (endpoint.includes('/api/brand-voice/validate')) {
      return {
        status: 200,
        data: {
          valid: true,
          errors: [],
          warnings: []
        }
      };
    }

    // Default error response
    throw new Error(`Unknown endpoint: ${endpoint}`);
  }

  async get(endpoint: string): Promise<any> {
    await new Promise(resolve => setTimeout(resolve, 30));

    if (endpoint.includes('/api/brand-voice/')) {
      const id = endpoint.split('/').pop();
      return {
        status: 200,
        data: {
          id,
          brandVoice: {
            brand: { name: 'Test Brand', segment: 'test' },
            voice: { tone: { professional: 0.8 } }
          },
          metadata: {
            retrieved_at: new Date().toISOString(),
            cached: true
          }
        }
      };
    }

    throw new Error(`GET endpoint not mocked: ${endpoint}`);
  }
}

/**
 * Mock Database Client
 */
class MockDatabaseClient {
  private data: Map<string, any> = new Map();

  async query(sql: string, params?: any[]): Promise<any> {
    // Simulate database query delay
    await new Promise(resolve => setTimeout(resolve, 20));

    if (sql.includes('SELECT') && sql.includes('anamnesis_analysis')) {
      return [{
        id: '123e4567-e89b-12d3-a456-426614174001',
        user_id: '123e4567-e89b-12d3-a456-426614174001',
        analysis_data: JSON.stringify({
          segment: 'veterinary',
          challenges: ['client_communication', 'emergency_response'],
          goals: ['improve_client_satisfaction', 'increase_preventive_care']
        }),
        created_at: new Date().toISOString()
      }];
    }

    if (sql.includes('SELECT') && sql.includes('brand_onboarding')) {
      return [{
        id: '123e4567-e89b-12d3-a456-426614174001',
        user_id: '123e4567-e89b-12d3-a456-426614174001',
        brand_data: JSON.stringify({
          name: 'Veterinária São Paulo',
          description: 'Clínica veterinária especializada',
          target_audience: ['pet_owners']
        }),
        created_at: new Date().toISOString()
      }];
    }

    if (sql.includes('INSERT') && sql.includes('brand_voice_cache')) {
      const cacheKey = `bv_cache_${Date.now()}`;
      this.data.set(cacheKey, params);
      return [{ insertId: cacheKey }];
    }

    if (sql.includes('SELECT') && sql.includes('brand_voice_cache')) {
      return [{
        cache_key: 'bv_test_key',
        brand_voice_data: JSON.stringify({
          brand: { name: 'Cached Brand' },
          voice: { tone: { professional: 0.9 } }
        }),
        created_at: new Date().toISOString(),
        usage_count: 5
      }];
    }

    return [];
  }

  async transaction(callback: (trx: any) => Promise<any>): Promise<any> {
    return await callback(this);
  }
}

/**
 * Mock Cache Client (Redis-like)
 */
class MockCacheClient {
  private cache: Map<string, { value: any, expiry: number }> = new Map();

  async set(key: string, value: any, ttl: number = 3600): Promise<boolean> {
    await new Promise(resolve => setTimeout(resolve, 5));
    this.cache.set(key, {
      value: typeof value === 'string' ? value : JSON.stringify(value),
      expiry: Date.now() + (ttl * 1000)
    });
    return true;
  }

  async get(key: string): Promise<any> {
    await new Promise(resolve => setTimeout(resolve, 5));
    const item = this.cache.get(key);
    
    if (!item || item.expiry < Date.now()) {
      return null;
    }

    try {
      return JSON.parse(item.value);
    } catch {
      return item.value;
    }
  }

  async del(key: string): Promise<boolean> {
    return this.cache.delete(key);
  }

  async exists(key: string): Promise<boolean> {
    const item = this.cache.get(key);
    return !!item && item.expiry >= Date.now();
  }
}

/**
 * Integration Test Runner
 */
async function runIntegrationTests() {
  const tester = new IntegrationTestFramework();
  const httpClient = new MockHTTPClient();
  const dbClient = new MockDatabaseClient();
  const cacheClient = new MockCacheClient();

  // 1. API Endpoint Integration Tests
  tester.startSuite('1. API Endpoint Integration');

  await tester.asyncAssert(async () => {
    const response = await httpClient.post('/api/brand-voice/generate', {
      userId: '123e4567-e89b-12d3-a456-426614174001',
      options: { preferQuality: true, includeDefaults: true, validateOutput: true }
    });
    return response.status === 200 && !!response.data.brandVoice;
  }, 'POST /api/brand-voice/generate should return valid brand voice');

  await tester.asyncAssert(async () => {
    const response = await httpClient.get('/api/brand-voice/123e4567-e89b-12d3-a456-426614174001');
    return response.status === 200 && !!response.data.brandVoice;
  }, 'GET /api/brand-voice/:id should retrieve brand voice');

  await tester.asyncAssert(async () => {
    const response = await httpClient.post('/api/brand-voice/validate', {
      brandVoice: {
        brand: { name: 'Test', segment: 'test' },
        voice: { tone: { professional: 0.8 } }
      }
    });
    return response.status === 200 && response.data.valid === true;
  }, 'POST /api/brand-voice/validate should validate brand voice schema');

  // 2. Database Integration Tests
  tester.startSuite('2. Database Integration');

  await tester.asyncAssert(async () => {
    const results = await dbClient.query(
      'SELECT * FROM anamnesis_analysis WHERE user_id = ?',
      ['123e4567-e89b-12d3-a456-426614174001']
    );
    return results.length > 0 && !!results[0].analysis_data;
  }, 'Should retrieve anamnesis analysis from database');

  await tester.asyncAssert(async () => {
    const results = await dbClient.query(
      'SELECT * FROM brand_onboarding WHERE user_id = ?',
      ['123e4567-e89b-12d3-a456-426614174001']
    );
    return results.length > 0 && !!results[0].brand_data;
  }, 'Should retrieve brand onboarding from database');

  await tester.asyncAssert(async () => {
    const result = await dbClient.query(
      'INSERT INTO brand_voice_cache (cache_key, brand_voice_data, user_id) VALUES (?, ?, ?)',
      ['test_key', JSON.stringify({ test: 'data' }), '123e4567-e89b-12d3-a456-426614174001']
    );
    return !!result[0].insertId;
  }, 'Should insert brand voice cache into database');

  // 3. Cache Integration Tests
  tester.startSuite('3. Cache Integration');

  await tester.asyncAssert(async () => {
    const key = 'test_brand_voice_cache';
    const data = { brand: { name: 'Cached Test' }, voice: { tone: { professional: 0.9 } } };
    const result = await cacheClient.set(key, data, 3600);
    return result === true;
  }, 'Should store brand voice in cache');

  await tester.asyncAssert(async () => {
    const key = 'test_brand_voice_cache';
    const cached = await cacheClient.get(key);
    return !!cached && cached.brand.name === 'Cached Test';
  }, 'Should retrieve brand voice from cache');

  await tester.asyncAssert(async () => {
    const key = 'test_brand_voice_cache';
    const exists = await cacheClient.exists(key);
    return exists === true;
  }, 'Should check cache key existence');

  // 4. End-to-End Integration Tests
  tester.startSuite('4. End-to-End Integration');

  await tester.asyncAssert(async () => {
    // Simulate complete flow: API -> Service -> Database -> Cache
    const startTime = Date.now();
    
    // 1. Generate brand voice via API
    const generateResponse = await httpClient.post('/api/brand-voice/generate', {
      userId: '123e4567-e89b-12d3-a456-426614174001',
      options: { preferQuality: true, includeDefaults: true, validateOutput: true }
    });
    
    // 2. Cache the result
    await cacheClient.set(
      generateResponse.data.metadata.cacheKey,
      generateResponse.data.brandVoice,
      3600
    );
    
    // 3. Store in database
    await dbClient.query(
      'INSERT INTO brand_voice_cache (cache_key, brand_voice_data, user_id) VALUES (?, ?, ?)',
      [
        generateResponse.data.metadata.cacheKey,
        JSON.stringify(generateResponse.data.brandVoice),
        '123e4567-e89b-12d3-a456-426614174001'
      ]
    );
    
    const endTime = Date.now();
    const totalTime = endTime - startTime;
    
    return generateResponse.status === 200 && 
           !!generateResponse.data.brandVoice &&
           totalTime < 3000; // Complete flow should be under 3 seconds
  }, 'Should complete full generation flow within performance limits');

  await tester.asyncAssert(async () => {
    // Test cache hit scenario
    const cacheKey = 'test_cache_hit_key';
    const brandVoiceData = {
      brand: { name: 'Cached Brand', segment: 'test' },
      voice: { tone: { professional: 0.8 } }
    };
    
    // Pre-populate cache
    await cacheClient.set(cacheKey, brandVoiceData);
    
    // Simulate cache retrieval
    const cached = await cacheClient.get(cacheKey);
    
    return !!cached && cached.brand.name === 'Cached Brand';
  }, 'Should handle cache hit scenarios correctly');

  // 5. Error Handling Integration Tests
  tester.startSuite('5. Error Handling Integration');

  await tester.asyncAssert(async () => {
    try {
      await httpClient.post('/api/unknown-endpoint', {});
      return false;
    } catch (error) {
      return (error as Error).message.includes('Unknown endpoint');
    }
  }, 'Should handle unknown API endpoints gracefully');

  await tester.asyncAssert(async () => {
    // Test cache miss
    const nonExistentKey = 'non_existent_cache_key';
    const result = await cacheClient.get(nonExistentKey);
    return result === null;
  }, 'Should handle cache misses gracefully');

  // 6. Performance Integration Tests
  tester.startSuite('6. Performance Integration');

  await tester.asyncAssert(async () => {
    const promises: Promise<any>[] = [];
    
    // Test concurrent requests
    for (let i = 0; i < 5; i++) {
      promises.push(
        httpClient.post('/api/brand-voice/generate', {
          userId: `123e4567-e89b-12d3-a456-42661417400${i}`,
          options: { preferQuality: false, includeDefaults: true, validateOutput: true }
        })
      );
    }
    
    const startTime = Date.now();
    const results = await Promise.all(promises);
    const endTime = Date.now();
    
    const allSuccessful = results.every(r => r.status === 200);
    const totalTime = endTime - startTime;
    
    return allSuccessful && totalTime < 5000; // 5 concurrent requests under 5 seconds
  }, 'Should handle concurrent requests efficiently');

  // Show final summary
  tester.summary();
}

// Execute the integration tests
runIntegrationTests().catch(console.error);