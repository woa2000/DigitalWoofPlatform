const { CampaignTemplateService } = require('./server/services/CampaignTemplateService.ts');

async function testCampaignService() {
  try {
    console.log('🧪 Testando Campaign Template Service...\n');
    
    const service = new CampaignTemplateService();
    
    // Teste com um template mock
    const mockTemplate = {
      id: 'test-template',
      name: 'Campanha de Verão',
      description: 'Campanha focada em cuidados de verão para pets',
      business_type: 'veterinaria',
      campaign_type: 'seasonal', 
      duration: 'P4W', // 4 semanas
      phases: [
        {
          week: 1,
          theme: 'Prevenção no Verão',
          posts: [
            {
              type: 'educativo',
              preferred_day: 1, // Segunda
              objectives: { awareness: 5, engagement: 3 }
            },
            {
              type: 'promocional', 
              preferred_day: 4, // Quinta
              objectives: { leads: 3, engagement: 2 }
            }
          ],
          objectives: { awareness: 8, leads: 5 }
        },
        {
          week: 2,
          theme: 'Hidratação e Cuidados',
          posts: [
            {
              type: 'educativo',
              preferred_day: 2, // Terça
              objectives: { awareness: 4, engagement: 4 }
            }
          ],
          objectives: { awareness: 6, engagement: 4 }
        }
      ],
      default_objectives: { awareness: 10, leads: 5, engagement: 7 },
      success_metrics: { engagement_rate: 0.05, click_rate: 0.02 }
    };
    
    const startDate = new Date('2025-09-09'); // Segunda-feira
    
    console.log('📅 Aplicando template:', mockTemplate.name);
    console.log('📅 Data de início:', startDate.toLocaleDateString('pt-BR'));
    
    const calendarItems = await service.applyCampaignTemplate(
      mockTemplate,
      startDate,
      {}
    );
    
    console.log('\n✅ Calendar items gerados:');
    calendarItems.forEach((item, index) => {
      console.log(`${index + 1}. ${item.title}`);
      console.log(`   📅 ${item.scheduled_for.toLocaleDateString('pt-BR')} ${item.scheduled_for.toLocaleTimeString('pt-BR')}`);
      console.log(`   🏷️ Tipo: ${item.content_type}`);
      console.log(`   🎯 Objetivos:`, item.objectives);
      console.log('');
    });
    
    console.log('✅ Campaign Template Service funcionando corretamente!');
    
  } catch (error) {
    console.error('❌ Erro no teste:', error.message);
    console.error(error.stack);
  }
}

testCampaignService();