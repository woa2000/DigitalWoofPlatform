import 'dotenv/config';
import { BrandOnboardingService } from './server/services/brand-onboarding.service.ts';

async function testOnboardingSave() {
  try {
    console.log('🧪 Testando salvamento de dados do onboarding...');

    const testData = {
      toneConfig: {
        confianca: 0.8,
        acolhimento: 0.7,
        humor: 0.3,
        especializacao: 0.9
      },
      languageConfig: {
        preferredTerms: ['inovação', 'qualidade'],
        avoidTerms: ['barato'],
        defaultCTAs: ['Saiba mais']
      },
      brandValues: {
        values: [
          { name: 'Qualidade', weight: 0.9, description: 'Compromisso com excelência' }
        ],
        disclaimer: 'Nossos valores guiam todas as decisões'
      }
    };

    console.log('📝 Tentando salvar dados de teste...');
    console.log('Dados:', JSON.stringify(testData, null, 2));

    const result = await BrandOnboardingService.upsert('test-user-123', testData);

    if (result) {
      console.log('✅ Dados salvos com sucesso!');
      console.log('ID do registro:', result.id);
      console.log('User ID:', result.userId);
      console.log('Tone Config:', result.toneConfig);
      console.log('Language Config:', result.languageConfig);
      console.log('Brand Values:', result.brandValues);
    } else {
      console.log('❌ Falha ao salvar dados');
    }

    // Testar leitura
    console.log('\n📖 Testando leitura dos dados salvos...');
    const savedData = await BrandOnboardingService.getByUserId('test-user-123');

    if (savedData) {
      console.log('✅ Dados lidos com sucesso!');
      console.log('Dados salvos:', JSON.stringify(savedData, null, 2));
    } else {
      console.log('❌ Dados não encontrados');
    }

  } catch (error) {
    console.error('❌ Erro durante o teste:', error.message);
    console.error('Stack trace:', error.stack);
  }
}

testOnboardingSave();