#!/usr/bin/env ts-node

import { SeasonalIntelligenceService } from '../services/SeasonalIntelligenceService.js';
import { SeasonalRepository } from '../repositories/SeasonalRepository.js';
import pg from 'pg';
import fs from 'fs/promises';
import path from 'path';

const { Pool } = pg;

/**
 * Script to sync seasonality knowledge base from JSON file to database
 * This ensures the database has the latest seasonal intelligence data
 */

async function syncSeasonalKnowledgeBase() {
  const startTime = Date.now();
  console.log('[SyncKB] Starting seasonality knowledge base synchronization...');

  // Database connection
  const db = new Pool({
    connectionString: process.env.DATABASE_URL,
    ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false
  });

  try {
    // Test database connection
    await db.query('SELECT 1');
    console.log('[SyncKB] Database connection established');

    // Load knowledge base from JSON file
    const kbPath = path.join(process.cwd(), 'data', 'seasonality.br-pet.json');
    const kbData = await fs.readFile(kbPath, 'utf-8');
    const knowledgeBase = JSON.parse(kbData);
    
    console.log(`[SyncKB] Loaded knowledge base v${knowledgeBase.version} with ${knowledgeBase.items.length} items`);

    // Initialize repository and sync
    const seasonalRepo = new SeasonalRepository(db);
    await seasonalRepo.syncKnowledgeBase(knowledgeBase.items);

    // Verify sync
    const syncedItems = await seasonalRepo.getSeasonalKnowledge({});
    console.log(`[SyncKB] Successfully synced ${syncedItems.length} seasonal knowledge items`);

    // Display summary by category
    const categorySet = new Set(syncedItems.map(item => item.type));
    const categories = Array.from(categorySet);
    console.log('[SyncKB] Items by category:');
    for (const category of categories) {
      const count = syncedItems.filter(item => item.type === category).length;
      console.log(`  - ${category}: ${count} items`);
    }

    // Display upcoming events (next 90 days)
    const upcomingDate = new Date();
    upcomingDate.setDate(upcomingDate.getDate() + 90);
    const currentMonth = new Date().getMonth() + 1;
    const next3Months = [
      currentMonth,
      currentMonth % 12 + 1,
      (currentMonth + 1) % 12 + 1
    ];

    const upcomingEvents = await seasonalRepo.getSeasonalKnowledge({
      months: next3Months,
      minPriority: 6
    });

    console.log(`[SyncKB] High-priority events in next 3 months: ${upcomingEvents.length}`);
    upcomingEvents.slice(0, 5).forEach(event => {
      console.log(`  - ${event.name} (Priority: ${event.priority_score}, Month: ${event.month})`);
    });

    const duration = Date.now() - startTime;
    console.log(`[SyncKB] Synchronization completed in ${duration}ms`);

  } catch (error) {
    console.error('[SyncKB] Error during synchronization:', error);
    process.exit(1);
  } finally {
    await db.end();
  }
}

/**
 * Test seasonal intelligence service functionality
 */
async function testSeasonalIntelligence() {
  console.log('\n[Test] Testing Seasonal Intelligence Service...');

  try {
    const service = new SeasonalIntelligenceService();
    
    // Test knowledge base info
    const kbInfo = service.getKnowledgeBaseInfo();
    console.log(`[Test] Knowledge base: v${kbInfo.version}, ${kbInfo.itemCount} items`);

    // Test seasonal suggestions for different business types
    const businessTypes = ['petshop', 'veterinaria', 'hotel_pet'];
    const testPeriod = {
      start: new Date(),
      end: new Date(Date.now() + 90 * 24 * 60 * 60 * 1000) // Next 90 days
    };

    for (const businessType of businessTypes) {
      console.log(`\n[Test] Testing suggestions for ${businessType}:`);
      
      const suggestions = await service.getSeasonalSuggestions(
        businessType as any,
        testPeriod,
        { region: 'SE' }
      );

      console.log(`  - Found ${suggestions.length} seasonal suggestions`);
      
      if (suggestions.length > 0) {
        const topSuggestion = suggestions[0];
        console.log(`  - Top suggestion: ${topSuggestion.event.name}`);
        console.log(`  - Priority: ${topSuggestion.priority}`);
        console.log(`  - Content themes: ${topSuggestion.content_themes.slice(0, 3).join(', ')}`);
        console.log(`  - Timing: ${topSuggestion.recommended_timing.length} recommended dates`);
      }

      // Test content suggestions
      const contentSuggestions = await service.generateContentSuggestions(
        businessType as any,
        testPeriod,
        { region: 'SE' },
        3
      );

      console.log(`  - Generated ${contentSuggestions.length} content suggestions`);
      contentSuggestions.forEach((cs, i) => {
        console.log(`    ${i + 1}. ${cs.title} (${cs.content_type}, confidence: ${cs.confidence_score.toFixed(2)})`);
      });
    }

    // Test current season detection
    const currentSeason = service.getCurrentSeason();
    console.log(`\n[Test] Current season: ${currentSeason}`);

  } catch (error) {
    console.error('[Test] Error during testing:', error);
  }
}

/**
 * Validate knowledge base data quality
 */
async function validateKnowledgeBase() {
  console.log('\n[Validation] Validating knowledge base data quality...');

  try {
    const kbPath = path.join(process.cwd(), 'data', 'seasonality.br-pet.json');
    const kbData = await fs.readFile(kbPath, 'utf-8');
    const knowledgeBase = JSON.parse(kbData);

    let issues = 0;

    // Validate required fields
    for (const item of knowledgeBase.items) {
      if (!item.id || !item.name || !item.event_type) {
        console.log(`[Validation] Missing required fields: ${item.id || 'NO_ID'}`);
        issues++;
      }

      if (item.month < 1 || item.month > 12) {
        console.log(`[Validation] Invalid month: ${item.id} - ${item.month}`);
        issues++;
      }

      if (item.priority_score < 1 || item.priority_score > 10) {
        console.log(`[Validation] Invalid priority score: ${item.id} - ${item.priority_score}`);
        issues++;
      }

      if (!Array.isArray(item.content_themes) || item.content_themes.length === 0) {
        console.log(`[Validation] Missing content themes: ${item.id}`);
        issues++;
      }

      if (!Array.isArray(item.business_types)) {
        console.log(`[Validation] Invalid business types: ${item.id}`);
        issues++;
      }

      if (!Array.isArray(item.regions) || item.regions.length === 0) {
        console.log(`[Validation] Missing regions: ${item.id}`);
        issues++;
      }
    }

    // Check for duplicates
    const ids = knowledgeBase.items.map((item: any) => item.id);
    const duplicateIds = ids.filter((id: string, index: number) => ids.indexOf(id) !== index);
    if (duplicateIds.length > 0) {
      console.log(`[Validation] Duplicate IDs found: ${duplicateIds.join(', ')}`);
      issues += duplicateIds.length;
    }

    // Check coverage by month
    const monthCoverage = new Array(12).fill(0);
    knowledgeBase.items.forEach((item: any) => {
      monthCoverage[item.month - 1]++;
    });

    console.log('[Validation] Monthly coverage:');
    monthCoverage.forEach((count, index) => {
      const monthName = new Date(2024, index, 1).toLocaleDateString('pt-BR', { month: 'long' });
      console.log(`  - ${monthName}: ${count} events`);
    });

    if (issues === 0) {
      console.log('[Validation] Knowledge base validation passed! ✅');
    } else {
      console.log(`[Validation] Found ${issues} issues in knowledge base ⚠️`);
    }

  } catch (error) {
    console.error('[Validation] Error during validation:', error);
  }
}

// Main execution
async function main() {
  const command = process.argv[2] || 'sync';

  switch (command) {
    case 'sync':
      await syncSeasonalKnowledgeBase();
      break;
    case 'test':
      await testSeasonalIntelligence();
      break;
    case 'validate':
      await validateKnowledgeBase();
      break;
    case 'all':
      await validateKnowledgeBase();
      await syncSeasonalKnowledgeBase();
      await testSeasonalIntelligence();
      break;
    default:
      console.log('Usage: npm run sync-seasonal [sync|test|validate|all]');
      console.log('Commands:');
      console.log('  sync     - Sync knowledge base to database (default)');
      console.log('  test     - Test seasonal intelligence functionality');
      console.log('  validate - Validate knowledge base data quality');
      console.log('  all      - Run all commands in sequence');
      process.exit(1);
  }
}

// Handle uncaught errors
process.on('uncaughtException', (error) => {
  console.error('[SyncKB] Uncaught exception:', error);
  process.exit(1);
});

process.on('unhandledRejection', (reason) => {
  console.error('[SyncKB] Unhandled rejection:', reason);
  process.exit(1);
});

if (import.meta.url === `file://${process.argv[1]}`) {
  main().catch(console.error);
}