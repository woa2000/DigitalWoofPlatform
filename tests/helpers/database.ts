/**
 * Test Database Helper
 * 
 * Configura e gerencia banco de dados para testes de integração
 */

import Database from 'better-sqlite3';
import path from 'path';
import fs from 'fs';

let testDb: Database.Database | null = null;

export async function setupTestDatabase(): Promise<void> {
  const testDbPath = ':memory:'; // Usar banco em memória para testes
  testDb = new Database(testDbPath);
  
  // Executar migrações para criar schema
  const migrationsDir = path.join(process.cwd(), 'migrations');
  const migrationFiles = fs.readdirSync(migrationsDir)
    .filter(file => file.endsWith('.sql'))
    .sort();
  
  for (const file of migrationFiles) {
    const migrationPath = path.join(migrationsDir, file);
    const migration = fs.readFileSync(migrationPath, 'utf-8');
    testDb.exec(migration);
  }
  
  // Inserir dados de teste
  await seedTestData();
}

export async function cleanupTestDatabase(): Promise<void> {
  if (testDb) {
    testDb.close();
    testDb = null;
  }
}

export function getTestDatabase(): Database.Database {
  if (!testDb) {
    throw new Error('Test database not initialized. Call setupTestDatabase() first.');
  }
  return testDb;
}

async function seedTestData(): Promise<void> {
  if (!testDb) return;
  
  // Seed templates
  const seedTemplates = `
    INSERT INTO templates (id, title, description, content, category, target_audience, channel, tags, created_at, updated_at) VALUES
    ('template-1', 'Promoção Ração Premium', 'Template para promoção de ração premium para cães', '🐕 Ração Premium para seu melhor amigo! {{discount}}% OFF hoje!', 'promotional', 'pet_owners_young', 'instagram', '["promocao", "racao", "cao"]', datetime('now'), datetime('now')),
    ('template-2', 'Dicas de Cuidados', 'Template educativo sobre cuidados com pets', 'Dica do dia: {{tip_content}} 💡 #PetCare #DigitalWoof', 'educational', 'pet_owners_all', 'facebook', '["dicas", "cuidados", "educacao"]', datetime('now'), datetime('now')),
    ('template-3', 'Lançamento Produto', 'Template para lançamento de novos produtos', '🚀 NOVO: {{product_name}} chegou! Seja o primeiro a experimentar!', 'product_launch', 'pet_owners_premium', 'instagram', '["lancamento", "produto", "novidade"]', datetime('now'), datetime('now')),
    ('template-4', 'Evento Pet Friendly', 'Template para divulgação de eventos', '📅 {{event_name}} - {{event_date}} | Traga seu pet! {{location}}', 'event', 'pet_owners_all', 'facebook', '["evento", "pet-friendly", "comunidade"]', datetime('now'), datetime('now')),
    ('template-5', 'Testemunho Cliente', 'Template para compartilhar testemunhos', '"{{testimonial_text}}" - {{customer_name}} 💙 #HappyPet #ClienteSatisfeito', 'testimonial', 'pet_owners_all', 'instagram', '["testemunho", "cliente", "satisfacao"]', datetime('now'), datetime('now'));
  `;
  
  // Seed assets
  const seedAssets = `
    INSERT INTO visual_assets (id, filename, type, url, alt_text, tags, created_at, updated_at) VALUES
    ('asset-1', 'cao-feliz.jpg', 'image', '/assets/cao-feliz.jpg', 'Cão feliz correndo no parque', '["cao", "feliz", "parque"]', datetime('now'), datetime('now')),
    ('asset-2', 'gato-brincando.jpg', 'image', '/assets/gato-brincando.jpg', 'Gato brincando com brinquedo', '["gato", "brincando", "brinquedo"]', datetime('now'), datetime('now')),
    ('asset-3', 'racao-premium.jpg', 'image', '/assets/racao-premium.jpg', 'Embalagem de ração premium', '["racao", "premium", "produto"]', datetime('now'), datetime('now')),
    ('asset-4', 'veterinario.jpg', 'image', '/assets/veterinario.jpg', 'Veterinário examinando pet', '["veterinario", "exame", "cuidados"]', datetime('now'), datetime('now')),
    ('asset-5', 'pet-shop.jpg', 'image', '/assets/pet-shop.jpg', 'Interior de pet shop moderno', '["pet-shop", "loja", "produtos"]', datetime('now'), datetime('now'));
  `;
  
  // Seed performance data
  const seedPerformance = `
    INSERT INTO campaign_performance (id, template_id, campaign_id, impressions, clicks, conversions, cost, revenue, date, channel) VALUES
    ('perf-1', 'template-1', 'campaign-1', 5000, 250, 25, 100.00, 500.00, '2024-01-15', 'instagram'),
    ('perf-2', 'template-1', 'campaign-1', 3000, 180, 18, 80.00, 360.00, '2024-01-16', 'facebook'),
    ('perf-3', 'template-2', 'campaign-2', 8000, 320, 15, 60.00, 300.00, '2024-01-15', 'facebook'),
    ('perf-4', 'template-3', 'campaign-3', 12000, 600, 60, 200.00, 1200.00, '2024-01-17', 'instagram'),
    ('perf-5', 'template-4', 'campaign-4', 4500, 135, 20, 75.00, 400.00, '2024-01-18', 'facebook');
  `;
  
  testDb.exec(seedTemplates);
  testDb.exec(seedAssets);
  testDb.exec(seedPerformance);
}