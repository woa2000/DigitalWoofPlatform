import 'dotenv/config';
import { BrandOnboardingSupabaseService } from './server/services/brand-onboarding-supabase.service.js';

async function testOnboardingSupabase() {
  try {
    console.log('🧪 Testando salvamento de dados do onboarding com Supabase...');

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

    const result = await BrandOnboardingSupabaseService.upsert('550e8400-e29b-41d4-a716-446655440000', testData);

    if (result) {
      console.log('✅ Dados salvos com sucesso no Supabase!');
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
    const savedData = await BrandOnboardingSupabaseService.getByUserId('550e8400-e29b-41d4-a716-446655440000');

    if (savedData) {
      console.log('✅ Dados lidos com sucesso do Supabase!');
      console.log('Dados salvos:', JSON.stringify(savedData, null, 2));
    } else {
      console.log('❌ Dados não encontrados');
    }

    // Testar progresso
    console.log('\n📊 Testando progresso do onboarding...');
    const progress = await BrandOnboardingSupabaseService.getProgress('550e8400-e29b-41d4-a716-446655440000');

    if (progress) {
      console.log('✅ Progresso obtido com sucesso!');
      console.log('Progresso:', JSON.stringify(progress, null, 2));
    } else {
      console.log('❌ Progresso não encontrado');
    }

    // Testar Brand Voice JSON
    console.log('\n🎨 Testando geração de Brand Voice JSON...');
    const brandVoiceJSON = await BrandOnboardingSupabaseService.generateBrandVoiceJSON('550e8400-e29b-41d4-a716-446655440000');

    if (brandVoiceJSON) {
      console.log('✅ Brand Voice JSON gerado com sucesso!');
      console.log('Brand Voice JSON:', JSON.stringify(brandVoiceJSON, null, 2));
    } else {
      console.log('❌ Falha ao gerar Brand Voice JSON');
    }

  } catch (error) {
    console.error('❌ Erro durante o teste:', error.message);
    console.error('Stack trace:', error.stack);
  }
}

testOnboardingSupabase();