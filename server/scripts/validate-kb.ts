import fs from 'fs/promises';
import path from 'path';

async function validateKnowledgeBase() {
  console.log('🔍 Validando knowledge base...');

  try {
    const kbPath = path.join(process.cwd(), 'data', 'seasonality.br-pet.json');
    const kbData = await fs.readFile(kbPath, 'utf-8');
    const knowledgeBase = JSON.parse(kbData);

    console.log(`📋 Knowledge Base v${knowledgeBase.version}`);
    console.log(`📊 Total items: ${knowledgeBase.items.length}`);
    console.log(`🗓️ Last updated: ${knowledgeBase.last_updated}`);

    let issues = 0;

    // Validate structure
    for (const item of knowledgeBase.items) {
      if (!item.id || !item.name || !item.event_type) {
        console.log(`❌ Missing required fields: ${item.id || 'NO_ID'}`);
        issues++;
      }

      if (item.month < 1 || item.month > 12) {
        console.log(`❌ Invalid month: ${item.id} - ${item.month}`);
        issues++;
      }

      if (item.priority_score < 1 || item.priority_score > 10) {
        console.log(`❌ Invalid priority: ${item.id} - ${item.priority_score}`);
        issues++;
      }

      if (!Array.isArray(item.content_themes) || item.content_themes.length === 0) {
        console.log(`❌ Missing content themes: ${item.id}`);
        issues++;
      }
    }

    // Check monthly distribution
    const monthCoverage = new Array(12).fill(0);
    knowledgeBase.items.forEach((item: any) => {
      monthCoverage[item.month - 1]++;
    });

    console.log('\n📅 Distribuição mensal:');
    monthCoverage.forEach((count, index) => {
      const monthName = new Date(2024, index, 1).toLocaleDateString('pt-BR', { month: 'long' });
      console.log(`  ${monthName}: ${count} eventos`);
    });

    // Check business type coverage
    const businessTypes = new Set();
    knowledgeBase.items.forEach((item: any) => {
      item.business_types.forEach((bt: string) => businessTypes.add(bt));
    });

    console.log('\n🏢 Tipos de negócio cobertos:');
    Array.from(businessTypes).forEach(bt => {
      const count = knowledgeBase.items.filter((item: any) => 
        item.business_types.includes(bt)
      ).length;
      console.log(`  ${bt}: ${count} eventos`);
    });

    // Summary
    if (issues === 0) {
      console.log('\n✅ Knowledge base validation passed!');
    } else {
      console.log(`\n⚠️ Found ${issues} issues in knowledge base`);
    }

    // Show upcoming events
    const currentMonth = new Date().getMonth() + 1;
    const upcomingEvents = knowledgeBase.items.filter((item: any) => {
      const monthDiff = (item.month - currentMonth + 12) % 12;
      return monthDiff <= 3; // Next 3 months
    });

    console.log(`\n🔮 Próximos eventos (3 meses): ${upcomingEvents.length}`);
    upcomingEvents.slice(0, 5).forEach((event: any) => {
      console.log(`  📍 ${event.name} (Mês ${event.month}, Prioridade: ${event.priority_score})`);
    });

  } catch (error) {
    console.error('❌ Error during validation:', error);
  }
}

validateKnowledgeBase().catch(console.error);