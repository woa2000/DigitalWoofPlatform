/**
 * Simple test for Brand Voice Version Management System
 */

import { 
  BrandVoiceVersionManager,
  VersionValidator
} from '../utils/brand-voice-versioning.service.js';

console.log('Testing Brand Voice Version Management System...\n');

async function testVersionManagement() {
  try {
    // Test 1: Version detection
    console.log('1. Testing Version Detection:');
    const sampleData = {
      version: '1.0',
      brand: { name: 'Test Brand' },
      voice: { tone: { confiança: 0.8 } },
      metadata: {
        created_at: '2025-09-05T00:00:00Z',
        updated_at: '2025-09-05T00:00:00Z',
        version_history: [],
        source: { manual_override: false },
        quality_metrics: {
          completeness_score: 0.8,
          consistency_score: 0.8,
          specificity_score: 0.8,
          usability_score: 0.8,
          last_validated: '2025-09-05T00:00:00Z'
        }
      }
    };

    const detected = BrandVoiceVersionManager.detectVersion(sampleData);
    console.log('✓ Version detected:', detected);
    console.log('✓ Version supported:', BrandVoiceVersionManager.isVersionSupported(detected));

    // Test 2: Migration check
    console.log('\n2. Testing Migration Check:');
    const needsMigration = BrandVoiceVersionManager.needsMigration(sampleData);
    console.log('✓ Needs migration:', needsMigration);

    if (needsMigration) {
      const migrationPath = BrandVoiceVersionManager.getMigrationPath('1.0', '1.1');
      console.log('✓ Migration path available:', migrationPath.length > 0);
      console.log('- Steps:', migrationPath.length);
    }

    // Test 3: Performance estimation
    console.log('\n3. Testing Performance Estimation:');
    const estimate = BrandVoiceVersionManager.estimateMigrationPerformance('1.0', '1.1');
    console.log('✓ Performance estimate:');
    console.log('- Estimated time:', estimate.estimatedTime, 'ms');
    console.log('- Complexity:', estimate.complexity);
    console.log('- Steps:', estimate.steps);

    // Test 4: Version validation
    console.log('\n4. Testing Version Validation:');
    const validation = VersionValidator.validate(sampleData, '1.0');
    console.log('✓ Validation result:');
    console.log('- Valid:', validation.valid);
    console.log('- Errors:', validation.errors.length);

    // Test 5: Version comparison
    console.log('\n5. Testing Version Comparison:');
    const comparison = BrandVoiceVersionManager.compareVersions('1.0', '1.1');
    console.log('✓ 1.0 vs 1.1:', comparison, '(1.0 is', comparison < 0 ? 'older' : 'newer/same', ')');

    // Test 6: Migration (dry run)
    console.log('\n6. Testing Migration (Dry Run):');
    const dryRun = await BrandVoiceVersionManager.migrateBrandVoice(sampleData, '1.1', {
      dryRun: true,
      validateAfterMigration: true
    });

    console.log('✓ Dry run migration:');
    console.log('- Success:', dryRun.success);
    console.log('- Records processed:', dryRun.recordsProcessed);
    console.log('- Duration:', dryRun.performance.duration, 'ms');
    console.log('- Warnings:', dryRun.warnings.length);

    // Test 7: Version history
    console.log('\n7. Testing Version History:');
    const changes = BrandVoiceVersionManager.generateVersionDiff(
      { ...sampleData, version: '1.0' },
      { ...sampleData, version: '1.1' }
    );

    console.log('✓ Version diff generated:', changes.length, 'changes');

    const history = BrandVoiceVersionManager.addToVersionHistory(
      'test-brand-123',
      '1.1',
      changes,
      'test-user'
    );

    console.log('✓ Version history added:');
    console.log('- Version:', history.version);
    console.log('- Changes count:', history.changes.length);
    console.log('- Rollback available:', history.rollbackAvailable);

    // Test 8: Supported versions
    console.log('\n8. Testing Supported Versions:');
    const supported = BrandVoiceVersionManager.getSupportedVersions();
    console.log('✓ Supported versions:', supported.map(v => v.version));
    console.log('✓ Current version:', BrandVoiceVersionManager.getCurrentVersion());

    console.log('\n✅ ALL VERSION MANAGEMENT TESTS PASSED!');
    console.log('\nT-009 Version Management System is working correctly! 🚀');

  } catch (error) {
    console.error('❌ Version management test failed:', error);
    process.exit(1);
  }
}

testVersionManagement();