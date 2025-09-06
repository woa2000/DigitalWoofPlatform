import { BrandVoice, BrandVoiceCreate } from '../../shared/schemas/brand-voice';
import { logger } from '../utils/logger';
import { brandVoiceCache } from './brand-voice-cache.service';

/**
 * Advanced Version Management System for Brand Voice
 * Handles schema evolution, migration, rollback, and version control
 */

export interface VersionInfo {
  version: string;
  schemaVersion: string;
  releaseDate: string;
  breaking: boolean;
  migrationRequired: boolean;
  deprecated?: boolean;
  supportEndsAt?: string;
}

export interface MigrationRule {
  fromVersion: string;
  toVersion: string;
  transformation: (data: any) => any;
  validation: (data: any) => boolean;
  rollback?: (data: any) => any;
  description: string;
  performance: {
    estimatedTime: number; // milliseconds per record
    complexity: 'low' | 'medium' | 'high';
  };
}

export interface VersionHistory {
  id: string;
  brandVoiceId: string;
  version: string;
  previousVersion?: string;
  createdAt: string;
  createdBy: string;
  changes: VersionChange[];
  migrationApplied?: string;
  rollbackAvailable: boolean;
  size: number; // bytes
  checksum: string;
}

export interface VersionChange {
  type: 'addition' | 'modification' | 'removal' | 'migration';
  path: string;
  oldValue?: any;
  newValue?: any;
  description: string;
}

export interface MigrationResult {
  success: boolean;
  fromVersion: string;
  toVersion: string;
  recordsProcessed: number;
  errors: string[];
  warnings: string[];
  performance: {
    startTime: string;
    endTime: string;
    duration: number;
    averageTimePerRecord: number;
  };
  rollbackData?: any;
}

export class BrandVoiceVersionManager {
  private static readonly SUPPORTED_VERSIONS: VersionInfo[] = [
    {
      version: '1.0',
      schemaVersion: 'https://digitalwoof.com/schemas/brand-voice/v1.0.json',
      releaseDate: '2025-09-05',
      breaking: false,
      migrationRequired: false
    },
    {
      version: '1.1',
      schemaVersion: 'https://digitalwoof.com/schemas/brand-voice/v1.1.json',
      releaseDate: '2025-10-01',
      breaking: false,
      migrationRequired: true
    },
    {
      version: '2.0',
      schemaVersion: 'https://digitalwoof.com/schemas/brand-voice/v2.0.json',
      releaseDate: '2025-12-01',
      breaking: true,
      migrationRequired: true
    }
  ];

  private static readonly MIGRATION_RULES: MigrationRule[] = [
    {
      fromVersion: '1.0',
      toVersion: '1.1',
      description: 'Add enhanced metadata and quality tracking',
      transformation: (data: any) => {
        return {
          ...data,
          version: '1.1',
          metadata: {
            ...data.metadata,
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
      },
      validation: (data: any) => {
        return data.version === '1.1' && 
               data.metadata?.enhanced_tracking?.usage_analytics !== undefined;
      },
      rollback: (data: any) => {
        const { enhanced_tracking, ...restMetadata } = data.metadata;
        return {
          ...data,
          version: '1.0',
          metadata: restMetadata
        };
      },
      performance: {
        estimatedTime: 50, // 50ms per record
        complexity: 'low'
      }
    },
    {
      fromVersion: '1.1',
      toVersion: '2.0',
      description: 'Major restructure with AI integration and advanced compliance',
      transformation: (data: any) => {
        return {
          ...data,
          version: '2.0',
          ai_integration: {
            model_preferences: {
              primary: 'openai-gpt-4',
              fallback: 'anthropic-claude-3',
              custom_instructions: []
            },
            performance_tuning: {
              temperature: 0.7,
              max_tokens: 2000,
              frequency_penalty: 0.1
            }
          },
          compliance: {
            ...data.compliance,
            advanced_monitoring: {
              real_time_scanning: true,
              auto_correction: false,
              escalation_rules: []
            },
            regulatory_updates: {
              last_sync: new Date().toISOString(),
              applicable_regulations: ['LGPD', 'ANVISA']
            }
          }
        };
      },
      validation: (data: any) => {
        return data.version === '2.0' && 
               data.ai_integration?.model_preferences !== undefined &&
               data.compliance?.advanced_monitoring !== undefined;
      },
      rollback: (data: any) => {
        const { ai_integration, ...rest } = data;
        const { advanced_monitoring, regulatory_updates, ...restCompliance } = data.compliance;
        return {
          ...rest,
          version: '1.1',
          compliance: restCompliance
        };
      },
      performance: {
        estimatedTime: 200, // 200ms per record
        complexity: 'high'
      }
    }
  ];

  private static versionHistory = new Map<string, VersionHistory[]>();

  /**
   * Get current supported version
   */
  static getCurrentVersion(): string {
    return this.SUPPORTED_VERSIONS[this.SUPPORTED_VERSIONS.length - 1].version;
  }

  /**
   * Check if version is supported
   */
  static isVersionSupported(version: string): boolean {
    return this.SUPPORTED_VERSIONS.some(v => v.version === version);
  }

  /**
   * Get version information
   */
  static getVersionInfo(version: string): VersionInfo | null {
    return this.SUPPORTED_VERSIONS.find(v => v.version === version) || null;
  }

  /**
   * Get all supported versions
   */
  static getSupportedVersions(): VersionInfo[] {
    return [...this.SUPPORTED_VERSIONS];
  }

  /**
   * Detect version from Brand Voice data
   */
  static detectVersion(data: any): string {
    // Try explicit version field first
    if (data.version) {
      return data.version;
    }

    // Try schema URL detection
    if (data.$schema) {
      const match = data.$schema.match(/v(\d+\.\d+)/);
      if (match) {
        return match[1];
      }
    }

    // Try structure-based detection
    if (data.ai_integration) {
      return '2.0';
    }
    
    if (data.metadata?.enhanced_tracking) {
      return '1.1';
    }

    // Default to 1.0 for basic structure
    return '1.0';
  }

  /**
   * Check if migration is needed
   */
  static needsMigration(data: any, targetVersion?: string): boolean {
    const currentVersion = this.detectVersion(data);
    const target = targetVersion || this.getCurrentVersion();
    
    if (currentVersion === target) {
      return false;
    }

    return this.MIGRATION_RULES.some(rule => 
      rule.fromVersion === currentVersion && 
      this.isVersionInPath(currentVersion, target)
    );
  }

  /**
   * Get migration path between versions
   */
  static getMigrationPath(fromVersion: string, toVersion: string): MigrationRule[] {
    const path: MigrationRule[] = [];
    let currentVersion = fromVersion;

    while (currentVersion !== toVersion) {
      const nextRule = this.MIGRATION_RULES.find(rule => 
        rule.fromVersion === currentVersion
      );

      if (!nextRule) {
        throw new Error(`No migration path found from ${currentVersion} to ${toVersion}`);
      }

      path.push(nextRule);
      currentVersion = nextRule.toVersion;

      // Prevent infinite loops
      if (path.length > 10) {
        throw new Error(`Migration path too complex from ${fromVersion} to ${toVersion}`);
      }
    }

    return path;
  }

  /**
   * Migrate Brand Voice to target version
   */
  static async migrateBrandVoice(
    data: any, 
    targetVersion?: string,
    options?: {
      validateAfterMigration?: boolean;
      createBackup?: boolean;
      dryRun?: boolean;
    }
  ): Promise<MigrationResult> {
    const startTime = Date.now();
    const { validateAfterMigration = true, createBackup = true, dryRun = false } = options || {};
    
    const currentVersion = this.detectVersion(data);
    const target = targetVersion || this.getCurrentVersion();

    logger.info('Starting Brand Voice migration', {
      fromVersion: currentVersion,
      toVersion: target,
      dryRun
    });

    const result: MigrationResult = {
      success: false,
      fromVersion: currentVersion,
      toVersion: target,
      recordsProcessed: 0,
      errors: [],
      warnings: [],
      performance: {
        startTime: new Date(startTime).toISOString(),
        endTime: '',
        duration: 0,
        averageTimePerRecord: 0
      }
    };

    try {
      // Check if migration is needed
      if (currentVersion === target) {
        result.success = true;
        result.warnings.push('No migration needed - already at target version');
        return result;
      }

      // Get migration path
      const migrationPath = this.getMigrationPath(currentVersion, target);
      
      if (migrationPath.length === 0) {
        result.errors.push('No migration path available');
        return result;
      }

      // Create backup if requested
      let backup: any = null;
      if (createBackup && !dryRun) {
        backup = this.createBackup(data);
        result.rollbackData = backup;
      }

      // Apply migrations in sequence
      let migratedData = { ...data };
      
      for (const rule of migrationPath) {
        if (dryRun) {
          logger.info('DRY RUN: Would apply migration', {
            fromVersion: rule.fromVersion,
            toVersion: rule.toVersion,
            description: rule.description
          });
          continue;
        }

        try {
          migratedData = rule.transformation(migratedData);
          
          // Validate transformation if validation function exists
          if (rule.validation && !rule.validation(migratedData)) {
            throw new Error(`Migration validation failed for ${rule.fromVersion} -> ${rule.toVersion}`);
          }

          result.recordsProcessed++;
          
          logger.info('Migration step completed', {
            fromVersion: rule.fromVersion,
            toVersion: rule.toVersion,
            description: rule.description
          });

        } catch (error) {
          result.errors.push(`Migration ${rule.fromVersion} -> ${rule.toVersion}: ${error}`);
          break;
        }
      }

      // Final validation
      if (validateAfterMigration && !dryRun && result.errors.length === 0) {
        const finalVersion = this.detectVersion(migratedData);
        if (finalVersion !== target) {
          result.errors.push(`Final validation failed: expected ${target}, got ${finalVersion}`);
        }
      }

      // Update cache if migration successful
      if (!dryRun && result.errors.length === 0 && data.metadata?.id) {
        await this.invalidateCache(data.metadata.id);
      }

      result.success = result.errors.length === 0;

    } catch (error) {
      result.errors.push(`Migration failed: ${error}`);
      logger.error(`Brand Voice migration failed: ${error}. From: ${currentVersion} To: ${target}`);
    }

    // Calculate performance metrics
    const endTime = Date.now();
    result.performance.endTime = new Date(endTime).toISOString();
    result.performance.duration = endTime - startTime;
    result.performance.averageTimePerRecord = result.recordsProcessed > 0 
      ? result.performance.duration / result.recordsProcessed 
      : 0;

    logger.info('Brand Voice migration completed', {
      success: result.success,
      duration: result.performance.duration,
      recordsProcessed: result.recordsProcessed,
      errorCount: result.errors.length
    });

    return result;
  }

  /**
   * Rollback to previous version
   */
  static async rollbackBrandVoice(
    brandVoiceId: string, 
    targetVersion?: string
  ): Promise<MigrationResult> {
    const history = this.getVersionHistory(brandVoiceId);
    
    if (history.length === 0) {
      throw new Error('No version history available for rollback');
    }

    const target = targetVersion || history[history.length - 2]?.version;
    if (!target) {
      throw new Error('No previous version available for rollback');
    }

    // Find the rollback migration rule
    const currentVersion = history[history.length - 1].version;
    const rollbackRule = this.MIGRATION_RULES.find(rule => 
      rule.toVersion === currentVersion && rule.fromVersion === target
    );

    if (!rollbackRule?.rollback) {
      throw new Error(`Rollback not supported from ${currentVersion} to ${target}`);
    }

    // Get current data (this would come from database in real implementation)
    const currentData = this.getMockCurrentData(brandVoiceId);
    
    try {
      const rolledBackData = rollbackRule.rollback(currentData);
      
      // Validate rollback
      const rolledBackVersion = this.detectVersion(rolledBackData);
      if (rolledBackVersion !== target) {
        throw new Error(`Rollback validation failed: expected ${target}, got ${rolledBackVersion}`);
      }

      await this.invalidateCache(brandVoiceId);

      return {
        success: true,
        fromVersion: currentVersion,
        toVersion: target,
        recordsProcessed: 1,
        errors: [],
        warnings: ['Rollback completed successfully'],
        performance: {
          startTime: new Date().toISOString(),
          endTime: new Date().toISOString(),
          duration: 50,
          averageTimePerRecord: 50
        }
      };

    } catch (error) {
      throw new Error(`Rollback failed: ${error}`);
    }
  }

  /**
   * Add version to history
   */
  static addToVersionHistory(
    brandVoiceId: string,
    version: string,
    changes: VersionChange[],
    createdBy: string,
    migrationApplied?: string
  ): VersionHistory {
    const history = this.getVersionHistory(brandVoiceId);
    const previousVersion = history.length > 0 ? history[history.length - 1].version : undefined;

    const versionEntry: VersionHistory = {
      id: `${brandVoiceId}-v${version}-${Date.now()}`,
      brandVoiceId,
      version,
      previousVersion,
      createdAt: new Date().toISOString(),
      createdBy,
      changes,
      migrationApplied,
      rollbackAvailable: this.isRollbackAvailable(version, previousVersion),
      size: JSON.stringify(changes).length,
      checksum: this.calculateChecksum(changes)
    };

    if (!this.versionHistory.has(brandVoiceId)) {
      this.versionHistory.set(brandVoiceId, []);
    }

    this.versionHistory.get(brandVoiceId)!.push(versionEntry);

    // Keep only last 10 versions
    const versions = this.versionHistory.get(brandVoiceId)!;
    if (versions.length > 10) {
      this.versionHistory.set(brandVoiceId, versions.slice(-10));
    }

    logger.info('Version added to history', {
      brandVoiceId,
      version,
      changesCount: changes.length,
      historySize: versions.length
    });

    return versionEntry;
  }

  /**
   * Get version history for Brand Voice
   */
  static getVersionHistory(brandVoiceId: string): VersionHistory[] {
    return this.versionHistory.get(brandVoiceId) || [];
  }

  /**
   * Get specific version from history
   */
  static getVersionFromHistory(
    brandVoiceId: string, 
    version: string
  ): VersionHistory | null {
    const history = this.getVersionHistory(brandVoiceId);
    return history.find(v => v.version === version) || null;
  }

  /**
   * Compare two versions
   */
  static compareVersions(version1: string, version2: string): -1 | 0 | 1 {
    const v1Parts = version1.split('.').map(Number);
    const v2Parts = version2.split('.').map(Number);

    for (let i = 0; i < Math.max(v1Parts.length, v2Parts.length); i++) {
      const v1Part = v1Parts[i] || 0;
      const v2Part = v2Parts[i] || 0;

      if (v1Part < v2Part) return -1;
      if (v1Part > v2Part) return 1;
    }

    return 0;
  }

  /**
   * Generate version diff
   */
  static generateVersionDiff(oldData: any, newData: any): VersionChange[] {
    const changes: VersionChange[] = [];

    // Compare version
    if (oldData.version !== newData.version) {
      changes.push({
        type: 'modification',
        path: 'version',
        oldValue: oldData.version,
        newValue: newData.version,
        description: `Version updated from ${oldData.version} to ${newData.version}`
      });
    }

    // Compare brand name
    if (oldData.brand?.name !== newData.brand?.name) {
      changes.push({
        type: 'modification',
        path: 'brand.name',
        oldValue: oldData.brand?.name,
        newValue: newData.brand?.name,
        description: 'Brand name updated'
      });
    }

    // Compare tone values
    if (oldData.voice?.tone && newData.voice?.tone) {
      for (const [key, value] of Object.entries(newData.voice.tone)) {
        if (oldData.voice.tone[key] !== value) {
          changes.push({
            type: 'modification',
            path: `voice.tone.${key}`,
            oldValue: oldData.voice.tone[key],
            newValue: value,
            description: `Tone ${key} updated`
          });
        }
      }
    }

    // Check for new fields (simplified)
    if (newData.ai_integration && !oldData.ai_integration) {
      changes.push({
        type: 'addition',
        path: 'ai_integration',
        newValue: 'AI integration added',
        description: 'AI integration functionality added'
      });
    }

    return changes;
  }

  /**
   * Get migration performance estimate
   */
  static estimateMigrationPerformance(
    fromVersion: string,
    toVersion: string,
    recordCount: number = 1
  ): { estimatedTime: number; complexity: string; steps: number } {
    const migrationPath = this.getMigrationPath(fromVersion, toVersion);
    
    const totalTime = migrationPath.reduce((sum, rule) => 
      sum + rule.performance.estimatedTime, 0
    ) * recordCount;

    const maxComplexity = migrationPath.reduce((max, rule) => {
      const complexityLevels: { [key: string]: number } = { low: 1, medium: 2, high: 3 };
      const current = complexityLevels[rule.performance.complexity];
      const maxLevel = complexityLevels[max];
      return current > maxLevel ? rule.performance.complexity : max;
    }, 'low');

    return {
      estimatedTime: totalTime,
      complexity: maxComplexity,
      steps: migrationPath.length
    };
  }

  // Private helper methods

  private static isVersionInPath(fromVersion: string, toVersion: string): boolean {
    try {
      this.getMigrationPath(fromVersion, toVersion);
      return true;
    } catch {
      return false;
    }
  }

  private static createBackup(data: any): any {
    return JSON.parse(JSON.stringify(data));
  }

  private static async invalidateCache(brandVoiceId: string): Promise<void> {
    await brandVoiceCache.invalidateByTags([`brand:${brandVoiceId}`]);
  }

  private static isRollbackAvailable(version: string, previousVersion?: string): boolean {
    if (!previousVersion) return false;
    
    return this.MIGRATION_RULES.some(rule => 
      rule.toVersion === version && 
      rule.fromVersion === previousVersion && 
      rule.rollback !== undefined
    );
  }

  private static calculateChecksum(data: any): string {
    const str = JSON.stringify(data);
    let hash = 0;
    for (let i = 0; i < str.length; i++) {
      const char = str.charCodeAt(i);
      hash = ((hash << 5) - hash) + char;
      hash = hash & hash; // Convert to 32-bit integer
    }
    return Math.abs(hash).toString(16);
  }

  private static getMockCurrentData(brandVoiceId: string): any {
    // In real implementation, this would fetch from database
    return {
      version: '1.1',
      brand: { name: 'Test Brand' },
      metadata: { id: brandVoiceId }
    };
  }
}

// Version validation utilities
export class VersionValidator {
  /**
   * Validate Brand Voice data against version schema
   */
  static validate(data: any, version?: string): { valid: boolean; errors: string[] } {
    const targetVersion = version || BrandVoiceVersionManager.detectVersion(data);
    const versionInfo = BrandVoiceVersionManager.getVersionInfo(targetVersion);

    if (!versionInfo) {
      return {
        valid: false,
        errors: [`Unsupported version: ${targetVersion}`]
      };
    }

    const errors: string[] = [];

    // Basic structure validation
    if (!data.brand) {
      errors.push('Missing required field: brand');
    }

    if (!data.voice) {
      errors.push('Missing required field: voice');
    }

    // Version-specific validation
    if (targetVersion === '2.0') {
      if (!data.ai_integration) {
        errors.push('Version 2.0 requires ai_integration field');
      }
    }

    if (parseFloat(targetVersion) >= 1.1) {
      if (!data.metadata?.enhanced_tracking) {
        errors.push(`Version ${targetVersion} requires enhanced_tracking in metadata`);
      }
    }

    return {
      valid: errors.length === 0,
      errors
    };
  }
}

// Export singleton for easy access
export const versionManager = BrandVoiceVersionManager;