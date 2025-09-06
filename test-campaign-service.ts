import { CampaignTemplateService } from './server/services/CampaignTemplateService.js';
import { CampaignTemplate, CampaignPhase, BusinessType } from './shared/types/calendar.js';

async function testCampaignService() {
  try {
    console.log('🧪 Testando Campaign Template Service...\n');
    
    const service = new CampaignTemplateService();
    
    // Teste com um template mock
    const mockTemplate: CampaignTemplate = {
      id: 'test-template',
      name: 'Campanha de Verão',
      description: 'Campanha focada em cuidados de verão para pets',
      business_type: 'veterinaria' as BusinessType,
      campaign_type: 'seasonal', 
      duration: 'P4W', // 4 semanas
      phases: [
        {
          week: 1,
          theme: 'Prevenção no Verão',
          posts: [
            {
              type: 'educativo',
              preferred_day: 'monday',
              title_template: 'Cuidados de Verão para Pets',
              content_guidelines: ['Hidratação é fundamental', 'Evitar horários de sol forte']
            },
            {
              type: 'promocional', 
              preferred_day: 'thursday',
              title_template: 'Promoção Verão Pet',
              content_guidelines: ['Destaque produtos para verão', 'Inclua call to action']
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
              preferred_day: 'tuesday',
              title_template: 'Hidratação para Pets',
              content_guidelines: ['Importância da água fresca', 'Sinais de desidratação']
            }
          ],
          objectives: { awareness: 6, engagement: 4 }
        }
      ],
      default_objectives: { awareness: 10, leads: 5, engagement: 7 },
      success_metrics: { engagement_rate: 0.05, click_rate: 0.02 },
      usage_count: 0,
      avg_success_rate: 0,
      is_public: true,
      created_by: 'test-user',
      created_at: new Date()
    };
    
    const startDate = new Date('2025-09-09'); // Segunda-feira
    
    console.log('📅 Aplicando template:', mockTemplate.name);
    console.log('📅 Data de início:', startDate.toLocaleDateString('pt-BR'));
    
    const result = await service.applyCampaignTemplate(
      mockTemplate,
      startDate,
      'veterinaria' as BusinessType
    );
    
    console.log('\n✅ Resultado da aplicação:');
    console.log('📊 Template:', result.template.name);
    console.log('🗓️ Calendar items gerados:', result.generated_items.length);
    console.log('📅 Data início:', result.start_date.toLocaleDateString('pt-BR'));
    console.log('📅 Data fim:', result.end_date.toLocaleDateString('pt-BR'));
    
    result.generated_items.forEach((item: any, index: number) => {
      console.log(`${index + 1}. ${item.title}`);
      console.log(`   📅 ${item.scheduled_date.toLocaleDateString('pt-BR')} ${item.scheduled_date.toLocaleTimeString('pt-BR')}`);
      console.log(`   🏷️ Tipo: ${item.content_type}`);
      console.log(`   🎯 Fase: ${item.phase}`);
      console.log(`   📊 Reach estimado: ${item.estimated_reach}`);
      console.log('');
    });
    
    console.log('✅ Campaign Template Service funcionando corretamente!');
    
  } catch (error: any) {
    console.error('❌ Erro no teste:', error.message);
    console.error(error.stack);
  }
}

testCampaignService();