/**
 * Unit Tests: Brand Voice Generator Service
 * 
 * Simple unit tests for Brand Voice Generator without external dependencies.
 * Tests the core generation logic and validation.
 */

import { BrandVoiceGeneratorService, type GenerationInput } from '../../server/services/brand-voice-generator.service.js';
import { BrandVoiceSchema } from '../../shared/schemas/brand-voice.js';
import testData from '../fixtures/brand-voice-test-data.json';

console.log('🧪 Running Brand Voice Generator Unit Tests\n');

class BrandVoiceGeneratorTests {
  private service: BrandVoiceGeneratorService;
  private testResults: { passed: number; failed: number; errors: string[] };

  constructor() {
    this.service = new BrandVoiceGeneratorService();
    this.testResults = { passed: 0, failed: 0, errors: [] };
  }

  /**
   * Test runner with simple assertion framework
   */
  private assert(condition: boolean, message: string): void {
    if (condition) {
      console.log('✓', message);
      this.testResults.passed++;
    } else {
      console.log('✗', message);
      this.testResults.failed++;
      this.testResults.errors.push(message);
    }
  }

  private async asyncAssert(
    testFn: () => Promise<boolean>, 
    message: string,
    errorMessage?: string
  ): Promise<void> {
    try {
      const result = await testFn();
      this.assert(result, message);
    } catch (error) {
      console.log('✗', message, '- Error:', errorMessage || (error instanceof Error ? error.message : String(error)));
      this.testResults.failed++;
      this.testResults.errors.push(`${message}: ${errorMessage || error}`);
    }
  }

  /**
   * Test Brand Voice generation with minimal valid input
   */
  async testBasicGeneration(): Promise<void> {
    console.log('\n1. Testing Basic Brand Voice Generation...');

    const input: GenerationInput = {
      userId: '123e4567-e89b-12d3-a456-426614174000',
      options: {
        preferQuality: true,
        includeDefaults: true,
        validateOutput: true
      }
    };

    await this.asyncAssert(async () => {
      const result = await this.service.generateBrandVoice(input);
      return !!result && !!result.brandVoice && !!result.metadata;
    }, 'Should generate brand voice with minimal input');

    await this.asyncAssert(async () => {
      const result = await this.service.generateBrandVoice(input);
      return result.metadata.generationTime > 0;
    }, 'Should track generation time');

    await this.asyncAssert(async () => {
      const result = await this.service.generateBrandVoice(input);
      return result.brandVoice.version === '1.0';
    }, 'Should set correct version');
  }

  /**
   * Test generation with anamnesis data
   */
  async testAnamnesisGeneration(): Promise<void> {
    console.log('\n2. Testing Generation with Anamnesis Data...');

    const input: GenerationInput = {
      userId: '123e4567-e89b-12d3-a456-426614174001',
      anamnesisAnalysisId: '123e4567-e89b-12d3-a456-426614174002',
      options: { includeDefaults: true, preferQuality: true, validateOutput: true }
    };

    await this.asyncAssert(async () => {
      const result = await this.service.generateBrandVoice(input);
      return result.metadata.generatedFrom === 'anamnesis' || result.metadata.generatedFrom === 'merged';
    }, 'Should indicate anamnesis as source');

    await this.asyncAssert(async () => {
      const result = await this.service.generateBrandVoice(input);
      return !!result.metadata.sourceAnalysisId;
    }, 'Should track anamnesis source ID');
  }

  /**
   * Test generation with onboarding data
   */
  async testOnboardingGeneration(): Promise<void> {
    console.log('\n3. Testing Generation with Onboarding Data...');

    const input: GenerationInput = {
      userId: '123e4567-e89b-12d3-a456-426614174003',
      brandOnboardingId: '123e4567-e89b-12d3-a456-426614174004',
      options: { includeDefaults: true, preferQuality: true, validateOutput: true }
    };

    await this.asyncAssert(async () => {
      const result = await this.service.generateBrandVoice(input);
      return result.metadata.generatedFrom === 'onboarding' || result.metadata.generatedFrom === 'merged';
    }, 'Should indicate onboarding as source');

    await this.asyncAssert(async () => {
      const result = await this.service.generateBrandVoice(input);
      return !!result.metadata.sourceOnboardingId;
    }, 'Should track onboarding source ID');
  }

  /**
   * Test generation with both sources
   */
  async testMergedGeneration(): Promise<void> {
    console.log('\n4. Testing Generation with Both Sources...');

    const input: GenerationInput = {
      userId: '123e4567-e89b-12d3-a456-426614174005',
      anamnesisAnalysisId: '123e4567-e89b-12d3-a456-426614174006',
      brandOnboardingId: '123e4567-e89b-12d3-a456-426614174007',
      options: { preferQuality: true, includeDefaults: true, validateOutput: true }
    };

    await this.asyncAssert(async () => {
      const result = await this.service.generateBrandVoice(input);
      return result.metadata.generatedFrom === 'merged';
    }, 'Should indicate merged generation');

    await this.asyncAssert(async () => {
      const result = await this.service.generateBrandVoice(input);
      return !!result.metadata.sourceAnalysisId && !!result.metadata.sourceOnboardingId;
    }, 'Should track both source IDs');

    await this.asyncAssert(async () => {
      const result = await this.service.generateBrandVoice(input);
      return Array.isArray(result.metadata.mergeDecisions) && result.metadata.mergeDecisions.length > 0;
    }, 'Should provide merge decisions');
  }

  /**
   * Test generation with manual overrides
   */
  async testManualOverrides(): Promise<void> {
    console.log('\n5. Testing Generation with Manual Overrides...');

    const input: GenerationInput = {
      userId: '123e4567-e89b-12d3-a456-426614174008',
      overrides: {
        brand: {
          name: 'Override Test Clinic'
        },
        voice: {
          tone: {
            humor: 0.9
          }
        }
      },
      options: { validateOutput: true, preferQuality: true, includeDefaults: true }
    };

    await this.asyncAssert(async () => {
      const result = await this.service.generateBrandVoice(input);
      return result.metadata.generatedFrom === 'manual' || result.metadata.generatedFrom === 'merged';
    }, 'Should handle manual overrides');

    await this.asyncAssert(async () => {
      const result = await this.service.generateBrandVoice(input);
      return result.brandVoice.brand.name === 'Override Test Clinic';
    }, 'Should apply brand name override');
  }

  /**
   * Test schema validation
   */
  async testSchemaValidation(): Promise<void> {
    console.log('\n6. Testing Schema Validation...');

    // Test valid data
    this.assert(
      BrandVoiceSchema.safeParse(testData.complete_veterinaria).success,
      'Should validate complete veterinaria data'
    );

    this.assert(
      BrandVoiceSchema.safeParse(testData.incomplete_petshop).success,
      'Should validate incomplete but valid petshop data'
    );

    // Test invalid data
    this.assert(
      !BrandVoiceSchema.safeParse(testData.invalid_brand_voice).success,
      'Should reject invalid brand voice data'
    );

    this.assert(
      !BrandVoiceSchema.safeParse({}).success,
      'Should reject empty object'
    );

    this.assert(
      !BrandVoiceSchema.safeParse(null).success,
      'Should reject null data'
    );
  }

  /**
   * Test error handling
   */
  async testErrorHandling(): Promise<void> {
    console.log('\n7. Testing Error Handling...');

    // Test invalid user ID
    await this.asyncAssert(async () => {
      try {
        await this.service.generateBrandVoice({
          userId: 'invalid-uuid',
          options: { preferQuality: true, includeDefaults: true, validateOutput: true }
        });
        return false; // Should not reach here
      } catch (error) {
        return true; // Expected error
      }
    }, 'Should reject invalid user ID');

    // Test invalid options
    await this.asyncAssert(async () => {
      try {
        await this.service.generateBrandVoice({
          userId: '123e4567-e89b-12d3-a456-426614174009',
          options: {
            preferQuality: 'not_boolean' as any,
            includeDefaults: 'not_boolean' as any,
            validateOutput: 'not_boolean' as any
          }
        });
        return false; // Should not reach here
      } catch (error) {
        return true; // Expected error
      }
    }, 'Should reject invalid options');
  }

  /**
   * Test performance requirements
   */
  async testPerformance(): Promise<void> {
    console.log('\n8. Testing Performance Requirements...');

    const input: GenerationInput = {
      userId: '123e4567-e89b-12d3-a456-426614174010',
      options: { preferQuality: false, includeDefaults: true, validateOutput: true } // Optimize for speed
    };

    const startTime = Date.now();
    const result = await this.service.generateBrandVoice(input);
    const duration = Date.now() - startTime;

    this.assert(
      duration < 2000,
      `Should generate within 2s (actual: ${duration}ms)`
    );

    this.assert(
      result.metadata.generationTime <= duration,
      'Should track accurate generation time'
    );

    this.assert(
      result.metadata.generationTime > 0,
      'Should have positive generation time'
    );
  }

  /**
   * Test output consistency
   */
  async testConsistency(): Promise<void> {
    console.log('\n9. Testing Output Consistency...');

    const input: GenerationInput = {
      userId: '123e4567-e89b-12d3-a456-426614174011',
      options: { includeDefaults: true, preferQuality: true, validateOutput: true }
    };

    const result1 = await this.service.generateBrandVoice(input);
    const result2 = await this.service.generateBrandVoice(input);

    // Core brand data should be consistent (excluding timestamps)
    this.assert(
      result1.brandVoice.brand.segment === result2.brandVoice.brand.segment,
      'Should generate consistent segment'
    );

    this.assert(
      result1.brandVoice.brand.businessType === result2.brandVoice.brand.businessType,
      'Should generate consistent business type'
    );

    this.assert(
      result1.brandVoice.version === result2.brandVoice.version,
      'Should generate consistent version'
    );
  }

  /**
   * Test metadata completeness
   */
  async testMetadataCompleteness(): Promise<void> {
    console.log('\n10. Testing Metadata Completeness...');

    const input: GenerationInput = {
      userId: '123e4567-e89b-12d3-a456-426614174012',
      anamnesisAnalysisId: '123e4567-e89b-12d3-a456-426614174013',
      brandOnboardingId: '123e4567-e89b-12d3-a456-426614174014',
      overrides: { brand: { name: 'Metadata Test' } },
      options: { validateOutput: true }
    };

    const result = await this.service.generateBrandVoice(input);

    this.assert(
      !!result.brandVoice.metadata.created_at,
      'Should have creation timestamp'
    );

    this.assert(
      !!result.brandVoice.metadata.updated_at,
      'Should have update timestamp'
    );

    this.assert(
      Array.isArray(result.brandVoice.metadata.version_history),
      'Should have version history array'
    );

    this.assert(
      !!result.brandVoice.metadata.source,
      'Should have source information'
    );

    this.assert(
      !!result.brandVoice.metadata.quality_metrics,
      'Should have quality metrics'
    );
  }

  /**
   * Run all tests and show summary
   */
  async runAllTests(): Promise<void> {
    console.log('🧪 Brand Voice Generator Service - Unit Tests');
    console.log('='.repeat(60));

    try {
      await this.testBasicGeneration();
      await this.testAnamnesisGeneration();
      await this.testOnboardingGeneration();
      await this.testMergedGeneration();
      await this.testManualOverrides();
      await this.testSchemaValidation();
      await this.testErrorHandling();
      await this.testPerformance();
      await this.testConsistency();
      await this.testMetadataCompleteness();

      console.log('\n' + '='.repeat(60));
      console.log('📊 TEST SUMMARY:');
      console.log(`✓ Passed: ${this.testResults.passed}`);
      console.log(`✗ Failed: ${this.testResults.failed}`);
      console.log(`📈 Success Rate: ${Math.round((this.testResults.passed / (this.testResults.passed + this.testResults.failed)) * 100)}%`);

      if (this.testResults.failed > 0) {
        console.log('\n❌ FAILED TESTS:');
        this.testResults.errors.forEach(error => console.log(`- ${error}`));
      } else {
        console.log('\n🎉 ALL TESTS PASSED!');
      }

    } catch (error) {
      console.error('\n💥 TEST SUITE FAILED:', error instanceof Error ? error.message : String(error));
      process.exit(1);
    }
  }
}

// Run the tests
const testSuite = new BrandVoiceGeneratorTests();
testSuite.runAllTests().then(() => {
  console.log('\n✅ Brand Voice Generator Unit Tests Complete!');
}).catch(error => {
  console.error('❌ Test suite error:', error);
  process.exit(1);
});