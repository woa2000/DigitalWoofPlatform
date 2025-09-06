import { SeasonalIntelligenceService } from '../services/SeasonalIntelligenceService.js';

async function testSeasonalIntelligence() {
  console.log('🧠 Testando Seasonal Intelligence Service...');

  try {
    const service = new SeasonalIntelligenceService();
    
    // Test knowledge base info
    const kbInfo = service.getKnowledgeBaseInfo();
    console.log(`📋 Knowledge Base: v${kbInfo.version}, ${kbInfo.itemCount} items`);

    // Test current season
    const currentSeason = service.getCurrentSeason();
    console.log(`🌿 Estação atual: ${currentSeason}`);

    // Test seasonal suggestions for different business types
    const businessTypes = ['petshop', 'veterinaria', 'hotel'];
    const testPeriod = {
      start: new Date(),
      end: new Date(Date.now() + 90 * 24 * 60 * 60 * 1000) // Next 90 days
    };

    for (const businessType of businessTypes) {
      console.log(`\n🏢 Testando sugestões para ${businessType}:`);
      
      const suggestions = await service.getSeasonalSuggestions(
        businessType as any,
        testPeriod,
        { region: 'SE' }
      );

      console.log(`  ✨ Encontradas ${suggestions.length} sugestões sazonais`);
      
      if (suggestions.length > 0) {
        const topSuggestion = suggestions[0];
        console.log(`  🎯 Principal: ${topSuggestion.event.name}`);
        console.log(`  📊 Prioridade: ${topSuggestion.priority}`);
        console.log(`  🎨 Temas: ${topSuggestion.content_themes.slice(0, 3).join(', ')}`);
        console.log(`  📅 Timing: ${topSuggestion.recommended_timing.length} datas recomendadas`);
      }

      // Test content suggestions
      const contentSuggestions = await service.generateContentSuggestions(
        businessType as any,
        testPeriod,
        { region: 'SE' },
        3
      );

      console.log(`  📝 Geradas ${contentSuggestions.length} sugestões de conteúdo:`);
      contentSuggestions.forEach((cs, i) => {
        console.log(`    ${i + 1}. ${cs.title}`);
        console.log(`       Tipo: ${cs.content_type} | Confiança: ${(cs.confidence_score * 100).toFixed(0)}%`);
        console.log(`       Data sugerida: ${cs.suggested_date?.toLocaleDateString('pt-BR') || 'N/A'}`);
      });
    }

    console.log('\n✅ Teste do Seasonal Intelligence Service concluído com sucesso!');

  } catch (error) {
    console.error('❌ Erro durante o teste:', error);
    throw error;
  }
}

testSeasonalIntelligence().catch(console.error);