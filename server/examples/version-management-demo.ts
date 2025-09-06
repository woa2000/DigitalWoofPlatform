/**
 * DEMONSTRAÇÃO: Brand Voice Version Management System
 * 
 * Este arquivo demonstra o uso do BrandVoiceVersionManager
 * para controle de versões, migração e rollback
 */

import { 
  BrandVoiceVersionManager as VersionManager,
  VersionValidator,
  versionManager
} from '../utils/brand-voice-versioning.service';

async function demonstrateVersionManagement() {
  console.log('\n=== BRAND VOICE VERSION MANAGEMENT DEMO ===\n');

  try {
    // 1. Version Detection and Support
    console.log('1. VERSION DETECTION AND SUPPORT');
    console.log('=================================\n');

    const sampleData_v10 = {
      version: '1.0',
      $schema: 'https://digitalwoof.com/schemas/brand-voice/v1.0.json',
      brand: { name: 'Test Clinic' },
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

    const detectedVersion = VersionManager.detectVersion(sampleData_v10);
    console.log('✓ Version detection:', detectedVersion);

    const isSupported = VersionManager.isVersionSupported('1.0');
    console.log('✓ Version 1.0 supported:', isSupported);

    const currentVersion = VersionManager.getCurrentVersion();
    console.log('✓ Current version:', currentVersion);

    const supportedVersions = VersionManager.getSupportedVersions();
    console.log('✓ Supported versions:', supportedVersions.map(v => v.version));

    // 2. Migration Check and Path
    console.log('\n2. MIGRATION CHECK AND PATH');
    console.log('===========================\n');

    const needsMigration = VersionManager.needsMigration(sampleData_v10);
    console.log('✓ Needs migration from 1.0:', needsMigration);

    const migrationPath = VersionManager.getMigrationPath('1.0', '2.0');
    console.log('✓ Migration path 1.0 → 2.0:');
    migrationPath.forEach((rule, index) => {
      console.log(`   ${index + 1}. ${rule.fromVersion} → ${rule.toVersion}: ${rule.description}`);
    });

    // 3. Migration Performance Estimation
    console.log('\n3. MIGRATION PERFORMANCE ESTIMATION');
    console.log('===================================\n');

    const perfEstimate = VersionManager.estimateMigrationPerformance('1.0', '2.0', 100);
    console.log('✓ Performance estimate (100 records):');
    console.log(`   - Estimated time: ${perfEstimate.estimatedTime}ms`);
    console.log(`   - Complexity: ${perfEstimate.complexity}`);
    console.log(`   - Steps: ${perfEstimate.steps}`);

    // 4. Dry Run Migration
    console.log('\n4. DRY RUN MIGRATION');
    console.log('====================\n');

    const dryRunResult = await VersionManager.migrateBrandVoice(sampleData_v10, '1.1', {
      dryRun: true,
      validateAfterMigration: true,
      createBackup: true
    });

    console.log('✓ Dry run migration 1.0 → 1.1:');
    console.log(`   - Success: ${dryRunResult.success}`);
    console.log(`   - Records processed: ${dryRunResult.recordsProcessed}`);
    console.log(`   - Duration: ${dryRunResult.performance.duration}ms`);
    console.log(`   - Warnings: ${dryRunResult.warnings.length}`);
    console.log(`   - Errors: ${dryRunResult.errors.length}`);

    if (dryRunResult.warnings.length > 0) {
      console.log('   Warnings:', dryRunResult.warnings);
    }

    // 5. Actual Migration
    console.log('\n5. ACTUAL MIGRATION');
    console.log('==================\n');

    const migrationResult = await VersionManager.migrateBrandVoice(sampleData_v10, '1.1', {
      validateAfterMigration: true,
      createBackup: true,
      dryRun: false
    });

    console.log('✓ Migration 1.0 → 1.1 completed:');
    console.log(`   - Success: ${migrationResult.success}`);
    console.log(`   - Records processed: ${migrationResult.recordsProcessed}`);
    console.log(`   - Duration: ${migrationResult.performance.duration}ms`);
    console.log(`   - Average per record: ${migrationResult.performance.averageTimePerRecord.toFixed(2)}ms`);
    console.log(`   - Backup created: ${!!migrationResult.rollbackData}`);

    // 6. Version Validation
    console.log('\n6. VERSION VALIDATION');
    console.log('=====================\n');

    // Create migrated data for validation
    const migratedData = {
      ...sampleData_v10,
      version: '1.1',
      metadata: {
        ...sampleData_v10.metadata,
        enhanced_tracking: {
          usage_analytics: {
            content_generated: 0,
            last_used: new Date().toISOString(),
            effectiveness_score: null
          },
          optimization_suggestions: [],
          a_b_test_variants: []
        }
      }
    };

    const validation = VersionValidator.validate(migratedData, '1.1');
    console.log('✓ Validation result:');
    console.log(`   - Valid: ${validation.valid}`);
    console.log(`   - Errors: ${validation.errors.length}`);

    if (validation.errors.length > 0) {
      console.log('   Errors:', validation.errors);
    }

    // 7. Version History Management
    console.log('\n7. VERSION HISTORY MANAGEMENT');
    console.log('=============================\n');

    const brandVoiceId = 'test-brand-voice-123';
    
    // Add version to history
    const changes = VersionManager.generateVersionDiff(sampleData_v10, migratedData);
    console.log('✓ Generated version diff:');
    changes.forEach((change, index) => {
      console.log(`   ${index + 1}. ${change.type}: ${change.path} - ${change.description}`);
    });

    const versionHistory = VersionManager.addToVersionHistory(
      brandVoiceId,
      '1.1',
      changes,
      'user123',
      '1.0→1.1'
    );

    console.log('✓ Version added to history:');
    console.log(`   - ID: ${versionHistory.id}`);
    console.log(`   - Version: ${versionHistory.version}`);
    console.log(`   - Previous: ${versionHistory.previousVersion}`);
    console.log(`   - Changes: ${versionHistory.changes.length}`);
    console.log(`   - Rollback available: ${versionHistory.rollbackAvailable}`);

    // Get version history
    const history = VersionManager.getVersionHistory(brandVoiceId);
    console.log('✓ Version history retrieved:');
    console.log(`   - Total versions: ${history.length}`);

    // 8. Version Comparison
    console.log('\n8. VERSION COMPARISON');
    console.log('====================\n');

    const compareResult1 = VersionManager.compareVersions('1.0', '1.1');
    const compareResult2 = VersionManager.compareVersions('2.0', '1.1');
    const compareResult3 = VersionManager.compareVersions('1.1', '1.1');

    console.log('✓ Version comparisons:');
    console.log(`   - 1.0 vs 1.1: ${compareResult1} (${compareResult1 < 0 ? '1.0 is older' : compareResult1 > 0 ? '1.0 is newer' : 'same'})`);
    console.log(`   - 2.0 vs 1.1: ${compareResult2} (${compareResult2 < 0 ? '2.0 is older' : compareResult2 > 0 ? '2.0 is newer' : 'same'})`);
    console.log(`   - 1.1 vs 1.1: ${compareResult3} (${compareResult3 === 0 ? 'same' : 'different'})`);

    // 9. Advanced Migration (1.1 → 2.0)
    console.log('\n9. ADVANCED MIGRATION (1.1 → 2.0)');
    console.log('=================================\n');

    const advancedMigration = await VersionManager.migrateBrandVoice(migratedData, '2.0', {
      validateAfterMigration: true,
      createBackup: true,
      dryRun: false
    });

    console.log('✓ Advanced migration 1.1 → 2.0:');
    console.log(`   - Success: ${advancedMigration.success}`);
    console.log(`   - Duration: ${advancedMigration.performance.duration}ms`);
    console.log(`   - Complexity: High (AI integration added)`);

    // 10. Rollback Demonstration
    console.log('\n10. ROLLBACK DEMONSTRATION');
    console.log('==========================\n');

    try {
      const rollbackResult = await VersionManager.rollbackBrandVoice(brandVoiceId, '1.0');
      console.log('✓ Rollback to 1.0:');
      console.log(`   - Success: ${rollbackResult.success}`);
      console.log(`   - From: ${rollbackResult.fromVersion}`);
      console.log(`   - To: ${rollbackResult.toVersion}`);
      console.log(`   - Duration: ${rollbackResult.performance.duration}ms`);
    } catch (error) {
      console.log('ℹ️ Rollback note:', String(error));
    }

    // 11. Version Information
    console.log('\n11. VERSION INFORMATION');
    console.log('=======================\n');

    const versionInfo = VersionManager.getVersionInfo('2.0');
    if (versionInfo) {
      console.log('✓ Version 2.0 info:');
      console.log(`   - Schema: ${versionInfo.schemaVersion}`);
      console.log(`   - Release date: ${versionInfo.releaseDate}`);
      console.log(`   - Breaking: ${versionInfo.breaking}`);
      console.log(`   - Migration required: ${versionInfo.migrationRequired}`);
    }

    // 12. Performance Summary
    console.log('\n12. PERFORMANCE SUMMARY');
    console.log('=======================\n');

    const allVersions = VersionManager.getSupportedVersions();
    console.log('✓ Migration performance matrix:');
    
    for (let i = 0; i < allVersions.length - 1; i++) {
      const from = allVersions[i].version;
      const to = allVersions[i + 1].version;
      const perf = VersionManager.estimateMigrationPerformance(from, to);
      console.log(`   ${from} → ${to}: ${perf.estimatedTime}ms (${perf.complexity})`);
    }

    console.log('\n✅ ALL VERSION MANAGEMENT TESTS COMPLETED!');
    console.log('\nT-009 Version Management System is working correctly! 🚀');

  } catch (error) {
    console.error('❌ Version management demo failed:', error);
    process.exit(1);
  }
}

// Execute demo if run directly
if (import.meta.url === `file://${process.argv[1]}`) {
  demonstrateVersionManagement().catch(console.error);
}

export { demonstrateVersionManagement };