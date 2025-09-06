/**
 * Example usage of Brand Voice Quality Metrics Calculator
 * Shows how to assess quality of a Brand Voice JSON
 */

import { BrandVoiceQualityService } from '../services/brand-voice-quality.service';
import { BrandVoice } from '../../shared/schemas/brand-voice';

// Example usage function
export async function demonstrateQualityCalculation() {
  const qualityService = new BrandVoiceQualityService();

  // Example Brand Voice (partial for demonstration)
  const sampleBrandVoice: BrandVoice = {
    $schema: 'https://digitalwoof.com/schemas/brand-voice/v1.0.json',
    version: '1.0',
    brand: {
      name: 'Clínica Veterinária PetCare',
      segment: 'veterinaria',
      businessType: 'clinica',
      mission: 'Proporcionar cuidado especializado e acolhedor para todos os pets, com tecnologia avançada e carinho humano.',
      values: [
        {
          name: 'Excelência',
          description: 'Sempre buscamos a melhor solução para cada pet',
          weight: 0.9
        },
        {
          name: 'Empatia',
          description: 'Entendemos o vínculo especial entre tutores e pets',
          weight: 0.8
        }
      ],
      targetAudience: {
        primary: 'Tutores de pets que buscam cuidado veterinário de qualidade',
        personas: ['Tutores preocupados', 'Famílias com pets', 'Idosos com companheiros'],
        painPoints: ['Medo de procedimentos', 'Ansiedade do pet', 'Custos elevados'],
        goals: ['Pet saudável', 'Tranquilidade', 'Confiança no veterinário']
      }
    },
    visual: {
      logoUrl: 'https://example.com/logo.png',
      palette: {
        primary: '#2E7D32',
        secondary: ['#81C784', '#4CAF50'],
        accent: '#FF7043',
        neutral: ['#F5F5F5', '#E0E0E0']
      },
      typography: {
        primary: 'Roboto',
        style: 'professional'
      },
      imagery: {
        style: 'photography',
        mood: 'trustworthy',
        avoid: ['pets em situação de stress', 'imagens muito técnicas']
      }
    },
    voice: {
      tone: {
        confiança: 0.9,
        acolhimento: 0.8,
        humor: 0.3,
        especialização: 0.9,
        urgência: 0.2,
        formalidade: 0.6
      },
      persona: {
        description: 'Um veterinário experiente e acolhedor que transmite confiança técnica com carinho humano',
        characteristics: ['Empático', 'Competente', 'Calmo', 'Didático'],
        communication_style: 'professional'
      },
      lexicon: {
        prefer: ['pet', 'companheiro', 'tutor', 'cuidado', 'saúde', 'bem-estar'],
        avoid: ['animal', 'dono', 'barato', 'rápido'],
        banned: ['garantia de cura', '100% eficaz', 'milagroso'],
        industry_specific: {
          medical_terms: 'simplified',
          pet_terminology: ['pet', 'tutor', 'companheiro de quatro patas']
        }
      },
      style: {
        sentence_length: 'medium',
        paragraph_style: 'scannable',
        use_questions: true,
        use_exclamations: false,
        use_emojis: 'minimal',
        cta_style: {
          preferred: ['Agende uma consulta', 'Entre em contato', 'Saiba mais sobre nossos serviços'],
          urgency_level: 'medium',
          personalization: 'personalized'
        },
        formatting: {
          use_lists: true,
          use_bold: 'moderate',
          use_italics: false,
          use_quotes: false
        }
      }
    },
    compliance: {
      regulatory: {
        medical_claims: 'strict',
        veterinary_advice: 'required_disclaimer',
        medication_mentions: 'with_disclaimer'
      },
      content_policies: {
        claims_policy: 'Evitamos promessas de cura e sempre orientamos consulta veterinária',
        disclaimer_required: true,
        default_disclaimer: 'Sempre consulte um veterinário para orientações específicas sobre seu pet',
        review_triggers: ['cura', 'garantia', 'medicamento', 'diagnóstico', 'tratamento']
      },
      legal: {
        lgpd_compliance: true,
        copyright_policy: 'Todo conteúdo é original ou licenciado adequadamente',
        user_generated_content: 'moderated'
      }
    },
    channels: {
      social_media: {
        instagram: {
          tone_adjustment: 0.1,
          hashtag_strategy: 'moderate',
          story_style: 'educational'
        },
        facebook: {
          tone_adjustment: 0.0,
          post_length: 'medium',
          engagement_style: 'informational'
        },
        whatsapp: {
          formality_level: 'semi-formal',
          response_style: 'personalized'
        }
      },
      content_types: {
        educational: {
          depth_level: 'intermediate',
          use_examples: true,
          include_sources: true
        },
        promotional: {
          sales_approach: 'consultative',
          urgency_tactics: 'minimal',
          social_proof: 'testimonials'
        },
        customer_service: {
          response_tone: 'helpful',
          problem_solving: 'consultative'
        }
      }
    },
    metadata: {
      created_at: '2025-01-05T16:20:00Z',
      updated_at: '2025-01-05T16:20:00Z',
      version_history: [
        {
          version: '1.0',
          date: '2025-01-05T16:20:00Z',
          changes: 'Initial Brand Voice creation',
          created_by: 'system'
        }
      ],
      source: {
        anamnesis_analysis_id: '123e4567-e89b-12d3-a456-426614174000',
        onboarding_session_id: '987fcdeb-51a2-43d1-b123-426614174001',
        manual_override: false
      },
      quality_metrics: {
        completeness_score: 0.85,
        consistency_score: 0.90,
        specificity_score: 0.75,
        usability_score: 0.80,
        last_validated: '2025-01-05T16:20:00Z'
      }
    }
  };

  try {
    console.log('🔍 Calculating quality metrics for Brand Voice...\n');
    
    // Calculate quality metrics
    const metrics = await qualityService.calculateQualityMetrics(sampleBrandVoice);
    
    // Display results
    console.log('📊 QUALITY METRICS RESULTS');
    console.log('='.repeat(50));
    console.log(`Overall Score: ${(metrics.overall * 100).toFixed(1)}%`);
    console.log(`Completeness: ${(metrics.completeness * 100).toFixed(1)}%`);
    console.log(`Consistency:  ${(metrics.consistency * 100).toFixed(1)}%`);
    console.log(`Specificity:  ${(metrics.specificity * 100).toFixed(1)}%`);
    console.log(`Usability:    ${(metrics.usability * 100).toFixed(1)}%`);
    console.log(`Calculation Time: ${metrics.calculation_time_ms}ms\n`);

    // Show detailed analysis
    console.log('📋 DETAILED ANALYSIS');
    console.log('='.repeat(50));
    
    console.log(`\n🟢 Completeness (${(metrics.completeness * 100).toFixed(1)}%)`);
    console.log(`- Fields filled: ${metrics.details.completeness.filled_fields}/${metrics.details.completeness.total_fields}`);
    if (metrics.details.completeness.missing_critical.length > 0) {
      console.log(`- Missing critical: ${metrics.details.completeness.missing_critical.join(', ')}`);
    }

    console.log(`\n🔄 Consistency (${(metrics.consistency * 100).toFixed(1)}%)`);
    console.log(`- Severity score: ${(metrics.details.consistency.severity_score * 100).toFixed(1)}%`);
    if (metrics.details.consistency.tone_conflicts.length > 0) {
      console.log(`- Tone conflicts: ${metrics.details.consistency.tone_conflicts.length}`);
    }

    console.log(`\n🎯 Specificity (${(metrics.specificity * 100).toFixed(1)}%)`);
    console.log(`- Industry relevance: ${(metrics.details.specificity.industry_relevance * 100).toFixed(1)}%`);
    console.log(`- Brand uniqueness: ${(metrics.details.specificity.brand_uniqueness * 100).toFixed(1)}%`);
    console.log(`- Actionability: ${(metrics.details.specificity.actionability * 100).toFixed(1)}%`);

    console.log(`\n🚀 Usability (${(metrics.usability * 100).toFixed(1)}%)`);
    console.log(`- Content generation readiness: ${(metrics.details.usability.content_generation_readiness * 100).toFixed(1)}%`);
    console.log(`- AI prompt clarity: ${(metrics.details.usability.ai_prompt_clarity * 100).toFixed(1)}%`);
    console.log(`- Template compatibility: ${(metrics.details.usability.template_compatibility * 100).toFixed(1)}%`);
    console.log(`- User guidance quality: ${(metrics.details.usability.user_guidance_quality * 100).toFixed(1)}%`);

    // Show recommendations
    if (metrics.recommendations.length > 0) {
      console.log(`\n💡 RECOMMENDATIONS`);
      console.log('='.repeat(50));
      
      metrics.recommendations.forEach((rec, index) => {
        const priorityIcon = rec.priority === 'high' ? '🔴' : rec.priority === 'medium' ? '🟡' : '🟢';
        console.log(`\n${priorityIcon} ${rec.category.toUpperCase()} - ${rec.priority.toUpperCase()}`);
        console.log(`   Issue: ${rec.message}`);
        console.log(`   Action: ${rec.suggested_action}`);
      });
    }

    // Quality assessment
    console.log(`\n🏆 QUALITY ASSESSMENT`);
    console.log('='.repeat(50));
    
    let qualityLevel = 'Needs Improvement';
    let qualityIcon = '🔴';
    
    if (metrics.overall >= 0.9) {
      qualityLevel = 'Excellent';
      qualityIcon = '🏆';
    } else if (metrics.overall >= 0.75) {
      qualityLevel = 'Good';
      qualityIcon = '🟢';
    } else if (metrics.overall >= 0.6) {
      qualityLevel = 'Acceptable';
      qualityIcon = '🟡';
    }
    
    console.log(`${qualityIcon} Quality Level: ${qualityLevel}`);
    console.log(`📈 Overall Score: ${(metrics.overall * 100).toFixed(1)}%`);
    
    if (metrics.overall >= 0.7) {
      console.log('✅ This Brand Voice is ready for content generation');
    } else {
      console.log('⚠️  This Brand Voice needs improvement before content generation');
    }

    return metrics;

  } catch (error) {
    console.error('❌ Error calculating quality metrics:', error);
    throw error;
  }
}

// Export for use in other modules
export { BrandVoiceQualityService };