/**
 * Test Fixtures Helper
 * 
 * Cria dados de teste padronizados
 */

import { getTestDatabase } from './database';

export async function createTestUser(): Promise<string> {
  const db = getTestDatabase();
  
  const userId = 'test-user-' + Date.now();
  
  const insertUser = db.prepare(`
    INSERT INTO users (id, email, name, created_at, updated_at)
    VALUES (?, ?, ?, datetime('now'), datetime('now'))
  `);
  
  insertUser.run(userId, 'test@digitalwoof.com', 'Test User');
  
  return userId;
}

export async function createTestBrandVoice(userId: string): Promise<string> {
  const db = getTestDatabase();
  
  const brandVoiceId = 'test-brand-voice-' + Date.now();
  
  const insertBrandVoice = db.prepare(`
    INSERT INTO brand_voices (id, user_id, name, description, tone, personality, values, target_audience, communication_style, created_at, updated_at)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, datetime('now'), datetime('now'))
  `);
  
  insertBrandVoice.run(
    brandVoiceId,
    userId,
    'Test Pet Shop',
    'Uma pet shop moderna e amigável',
    'friendly',
    '["enthusiastic", "caring", "professional"]',
    '["pet_welfare", "quality", "innovation"]',
    'pet_owners_young',
    '{"formal_level": "casual", "emoji_usage": "moderate", "hashtag_style": "minimal"}'
  );
  
  return brandVoiceId;
}

export async function createTestTemplate(): Promise<string> {
  const db = getTestDatabase();
  
  const templateId = 'test-template-' + Date.now();
  
  const insertTemplate = db.prepare(`
    INSERT INTO templates (id, title, description, content, category, target_audience, channel, tags, created_at, updated_at)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, datetime('now'), datetime('now'))
  `);
  
  insertTemplate.run(
    templateId,
    'Test Template',
    'Template created for testing',
    'This is a test template with {{variable}} content',
    'promotional',
    'pet_owners_all',
    'instagram',
    '["test", "automation"]'
  );
  
  return templateId;
}

export async function createTestCampaign(templateId: string, brandVoiceId: string): Promise<string> {
  const db = getTestDatabase();
  
  const campaignId = 'test-campaign-' + Date.now();
  
  const insertCampaign = db.prepare(`
    INSERT INTO campaigns (id, name, template_id, brand_voice_id, status, configuration, created_at, updated_at)
    VALUES (?, ?, ?, ?, ?, ?, datetime('now'), datetime('now'))
  `);
  
  insertCampaign.run(
    campaignId,
    'Test Campaign',
    templateId,
    brandVoiceId,
    'draft',
    '{"channels": ["instagram"], "budget": 500, "duration": 7}'
  );
  
  return campaignId;
}

export async function createTestAsset(): Promise<string> {
  const db = getTestDatabase();
  
  const assetId = 'test-asset-' + Date.now();
  
  const insertAsset = db.prepare(`
    INSERT INTO visual_assets (id, filename, type, url, alt_text, tags, created_at, updated_at)
    VALUES (?, ?, ?, ?, ?, ?, datetime('now'), datetime('now'))
  `);
  
  insertAsset.run(
    assetId,
    'test-image.jpg',
    'image',
    '/assets/test-image.jpg',
    'Test image for automation',
    '["test", "automation"]'
  );
  
  return assetId;
}

export async function createTestPerformanceData(templateId: string, campaignId: string): Promise<void> {
  const db = getTestDatabase();
  
  const insertPerformance = db.prepare(`
    INSERT INTO campaign_performance (id, template_id, campaign_id, impressions, clicks, conversions, cost, revenue, date, channel)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `);
  
  // Create performance data for last 7 days
  const today = new Date();
  for (let i = 0; i < 7; i++) {
    const date = new Date(today);
    date.setDate(date.getDate() - i);
    
    const performanceId = `test-perf-${templateId}-${i}`;
    
    insertPerformance.run(
      performanceId,
      templateId,
      campaignId,
      Math.floor(Math.random() * 10000) + 1000, // impressions
      Math.floor(Math.random() * 500) + 50,     // clicks
      Math.floor(Math.random() * 50) + 5,       // conversions
      Math.floor(Math.random() * 200) + 50,     // cost
      Math.floor(Math.random() * 1000) + 100,   // revenue
      date.toISOString().split('T')[0],          // date
      i % 2 === 0 ? 'instagram' : 'facebook'     // channel
    );
  }
}

export function generateRandomEmail(): string {
  const timestamp = Date.now();
  const random = Math.floor(Math.random() * 1000);
  return `test-${timestamp}-${random}@digitalwoof.com`;
}

export function generateRandomText(length: number = 50): string {
  const chars = 'abcdefghijklmnopqrstuvwxyz ';
  let result = '';
  for (let i = 0; i < length; i++) {
    result += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return result.trim();
}

export function generateTestBrandVoiceConfig() {
  return {
    tone: 'friendly',
    personality: ['enthusiastic', 'caring', 'professional'],
    values: ['pet_welfare', 'quality', 'innovation'],
    target_audience: 'pet_owners_young',
    communication_style: {
      formal_level: 'casual',
      emoji_usage: 'moderate',
      hashtag_style: 'minimal'
    }
  };
}

export function generateTestCampaignConfig() {
  return {
    channels: ['instagram', 'facebook'],
    budget: Math.floor(Math.random() * 1000) + 100,
    duration: Math.floor(Math.random() * 14) + 1,
    target_audience: 'pet_owners_young',
    objectives: ['awareness', 'engagement'],
    schedule: {
      start_date: new Date().toISOString().split('T')[0],
      posting_times: ['09:00', '15:00', '19:00']
    }
  };
}