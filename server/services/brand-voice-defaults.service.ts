import { BrandVoice, BrandVoiceCreate } from '../../shared/schemas/brand-voice';
import { logger } from '../utils/logger';
import { defaultsConfig } from '../../config/brand-voice-defaults.config';

/**
 * Advanced Default Values System for Brand Voice
 * Provides intelligent, segment-specific defaults with quality optimization
 */

// Segment-specific configuration interface
export interface SegmentConfig {
  segment: BrandVoice['brand']['segment'];
  businessTypes: BrandVoice['brand']['businessType'][];
  toneProfile: {
    confiança: number;
    acolhimento: number;
    humor: number;
    especialização: number;
    urgência?: number;
    formalidade?: number;
  };
  complianceLevel: 'strict' | 'moderate' | 'flexible';
  industryTerms: string[];
  avoidTerms: string[];
  bannedTerms: string[];
  communicationStyle: BrandVoice['voice']['persona']['communication_style'];
  contentApproach: {
    educational: 'basic' | 'intermediate' | 'advanced';
    promotional: 'soft' | 'direct' | 'consultative';
    urgencyLevel: 'low' | 'medium' | 'high';
  };
}

export class BrandVoiceDefaultsService {
  // Comprehensive segment configurations
  private static readonly SEGMENT_CONFIGS: Record<BrandVoice['brand']['segment'], SegmentConfig> = {
    veterinaria: {
      segment: 'veterinaria',
      businessTypes: ['clinica', 'misto'],
      toneProfile: {
        confiança: 0.9,
        acolhimento: 0.8,
        humor: 0.2,
        especialização: 0.95,
        urgência: 0.3,
        formalidade: 0.7
      },
      complianceLevel: 'strict',
      industryTerms: [
        'pet', 'companheiro', 'tutor', 'cuidado veterinário', 'saúde animal',
        'bem-estar', 'prevenção', 'diagnóstico', 'tratamento especializado',
        'medicina veterinária', 'clínica veterinária', 'consulta', 'exame'
      ],
      avoidTerms: [
        'animal', 'dono', 'barato', 'rápido', 'simples', 'básico'
      ],
      bannedTerms: [
        'garantia de cura', '100% eficaz', 'milagroso', 'infalível',
        'cura garantida', 'sem falhas', 'perfeito'
      ],
      communicationStyle: 'professional',
      contentApproach: {
        educational: 'intermediate',
        promotional: 'consultative',
        urgencyLevel: 'medium'
      }
    },
    
    petshop: {
      segment: 'petshop',
      businessTypes: ['comercio', 'misto'],
      toneProfile: {
        confiança: 0.7,
        acolhimento: 0.9,
        humor: 0.6,
        especialização: 0.6,
        urgência: 0.4,
        formalidade: 0.4
      },
      complianceLevel: 'moderate',
      industryTerms: [
        'pet', 'amigo', 'companheiro', 'produtos premium', 'acessórios',
        'ração de qualidade', 'brinquedos', 'cuidado diário', 'bem-estar',
        'nutrição', 'higiene', 'conforto', 'diversão'
      ],
      avoidTerms: [
        'animal', 'bicho', 'medicamento', 'tratamento', 'diagnóstico'
      ],
      bannedTerms: [
        'cura', 'medicinal', 'terapêutico', 'diagnóstico', 'prescrição'
      ],
      communicationStyle: 'friendly',
      contentApproach: {
        educational: 'basic',
        promotional: 'direct',
        urgencyLevel: 'medium'
      }
    },

    banho_tosa: {
      segment: 'banho_tosa',
      businessTypes: ['servico', 'misto'],
      toneProfile: {
        confiança: 0.6,
        acolhimento: 0.95,
        humor: 0.7,
        especialização: 0.7,
        urgência: 0.2,
        formalidade: 0.3
      },
      complianceLevel: 'moderate',
      industryTerms: [
        'pet', 'amigo peludo', 'companheiro', 'banho relaxante', 'tosa especializada',
        'higiene', 'beleza', 'cuidado estético', 'bem-estar', 'carinho',
        'mimo', 'spa pet', 'estética animal'
      ],
      avoidTerms: [
        'animal', 'bicho', 'rápido', 'barato', 'simples'
      ],
      bannedTerms: [
        'medicamento', 'tratamento', 'cura', 'terapia'
      ],
      communicationStyle: 'friendly',
      contentApproach: {
        educational: 'basic',
        promotional: 'soft',
        urgencyLevel: 'low'
      }
    },

    hotel_pet: {
      segment: 'hotel_pet',
      businessTypes: ['servico', 'misto'],
      toneProfile: {
        confiança: 0.8,
        acolhimento: 0.9,
        humor: 0.5,
        especialização: 0.7,
        urgência: 0.2,
        formalidade: 0.5
      },
      complianceLevel: 'moderate',
      industryTerms: [
        'pet', 'hóspede especial', 'companheiro', 'hospedagem', 'cuidado 24h',
        'segurança', 'conforto', 'diversão', 'socialização', 'tranquilidade',
        'família temporária', 'cuidadores especializados'
      ],
      avoidTerms: [
        'animal', 'abandono', 'prisão', 'gaiola', 'isolamento'
      ],
      bannedTerms: [
        'medicamento', 'tratamento veterinário', 'emergência médica'
      ],
      communicationStyle: 'friendly',
      contentApproach: {
        educational: 'basic',
        promotional: 'consultative',
        urgencyLevel: 'low'
      }
    },

    agropet: {
      segment: 'agropet',
      businessTypes: ['comercio', 'misto'],
      toneProfile: {
        confiança: 0.8,
        acolhimento: 0.7,
        humor: 0.4,
        especialização: 0.8,
        urgência: 0.3,
        formalidade: 0.6
      },
      complianceLevel: 'moderate',
      industryTerms: [
        'agronegócio', 'pecuária', 'agricultura', 'produção rural', 'nutrição animal',
        'suplementação', 'manejo', 'produtividade', 'qualidade', 'eficiência',
        'sustentabilidade', 'tecnologia rural'
      ],
      avoidTerms: [
        'pet', 'bichinho', 'carinho', 'mimo', 'fofura'
      ],
      bannedTerms: [
        'uso veterinário', 'prescrição', 'diagnóstico'
      ],
      communicationStyle: 'professional',
      contentApproach: {
        educational: 'advanced',
        promotional: 'consultative',
        urgencyLevel: 'medium'
      }
    }
  };

  // Default brand missions by segment
  private static readonly DEFAULT_MISSIONS: Record<BrandVoice['brand']['segment'], string> = {
    veterinaria: 'Proporcionar cuidado veterinário de excelência, combinando conhecimento técnico avançado com atendimento humanizado para garantir a saúde e bem-estar de todos os pets.',
    petshop: 'Oferecer produtos de qualidade e acessórios especiais para pets, proporcionando tudo que seu companheiro precisa para uma vida feliz e saudável.',
    banho_tosa: 'Cuidar da beleza e higiene dos pets com carinho e profissionalismo, oferecendo um momento de relaxamento e bem-estar para seus companheiros.',
    hotel_pet: 'Proporcionar hospedagem segura e acolhedora para pets, oferecendo cuidado especializado e muita diversão enquanto seus tutores estão ausentes.',
    agropet: 'Fornecer soluções técnicas e produtos de qualidade para o agronegócio, contribuindo para a produtividade e sustentabilidade da pecuária brasileira.'
  };

  // Default brand values by segment
  private static readonly DEFAULT_VALUES: Record<BrandVoice['brand']['segment'], Array<{ name: string; description: string; weight: number }>> = {
    veterinaria: [
      { name: 'Excelência Técnica', description: 'Buscamos sempre as melhores práticas em medicina veterinária', weight: 0.95 },
      { name: 'Cuidado Humanizado', description: 'Tratamos cada pet com carinho e respeito individual', weight: 0.9 },
      { name: 'Transparência', description: 'Comunicação clara e honesta com todos os tutores', weight: 0.85 },
      { name: 'Inovação', description: 'Utilizamos tecnologia avançada para melhores resultados', weight: 0.8 }
    ],
    petshop: [
      { name: 'Qualidade', description: 'Selecionamos apenas produtos de alta qualidade para pets', weight: 0.9 },
      { name: 'Variedade', description: 'Ampla gama de produtos para todas as necessidades', weight: 0.8 },
      { name: 'Atendimento', description: 'Atendimento personalizado e consultoria especializada', weight: 0.85 },
      { name: 'Paixão por Pets', description: 'Verdadeiro amor e dedicação aos animais', weight: 0.9 }
    ],
    banho_tosa: [
      { name: 'Cuidado Especial', description: 'Cada pet recebe atenção individual e carinhosa', weight: 0.95 },
      { name: 'Profissionalismo', description: 'Técnicas especializadas e produtos de qualidade', weight: 0.8 },
      { name: 'Bem-estar', description: 'Priorizamos o conforto e tranquilidade dos pets', weight: 0.9 },
      { name: 'Amor pelos Animais', description: 'Dedicação genuína e carinho em cada atendimento', weight: 0.9 }
    ],
    hotel_pet: [
      { name: 'Segurança', description: 'Ambiente seguro e monitorado 24 horas por dia', weight: 0.95 },
      { name: 'Cuidado Especializado', description: 'Cuidadores treinados e apaixonados por pets', weight: 0.9 },
      { name: 'Diversão', description: 'Atividades e socialização para pets felizes', weight: 0.8 },
      { name: 'Tranquilidade', description: 'Paz de espírito para tutores e conforto para pets', weight: 0.85 }
    ],
    agropet: [
      { name: 'Conhecimento Técnico', description: 'Expertise em nutrição e manejo animal', weight: 0.9 },
      { name: 'Produtividade', description: 'Soluções que aumentam a eficiência da produção', weight: 0.85 },
      { name: 'Sustentabilidade', description: 'Práticas responsáveis e ambientalmente conscientes', weight: 0.8 },
      { name: 'Parceria', description: 'Relacionamento de longo prazo com produtores', weight: 0.85 }
    ]
  };

  /**
   * Get comprehensive defaults for a specific segment
   */
  static getSegmentDefaults(segment: BrandVoice['brand']['segment']): Partial<BrandVoiceCreate> {
    // Check if segment is enabled
    if (!defaultsConfig.isSegmentEnabled(segment)) {
      throw new Error(`Segment '${segment}' is disabled in configuration`);
    }

    const config = this.SEGMENT_CONFIGS[segment];
    const segmentConfig = defaultsConfig.getSegmentConfig(segment);
    const mission = this.DEFAULT_MISSIONS[segment];
    const values = this.DEFAULT_VALUES[segment];

    // Apply configuration overrides
    const finalToneProfile = {
      ...config.toneProfile,
      ...(segmentConfig.overrides?.toneAdjustments || {})
    };

    const finalCommunicationStyle = segmentConfig.overrides?.communicationStyleOverride || config.communicationStyle;
    const finalComplianceLevel = segmentConfig.overrides?.complianceLevelOverride || config.complianceLevel;
    const finalMission = segmentConfig.overrides?.customMission || mission;
    const finalValues = segmentConfig.overrides?.customValues || values;

    // Merge additional terms
    const additionalTerms = segmentConfig.overrides?.additionalTerms;
    const finalPreferTerms = [
      ...config.industryTerms.slice(0, 15),
      ...(additionalTerms?.prefer || [])
    ];
    const finalAvoidTerms = [
      ...config.avoidTerms,
      ...(additionalTerms?.avoid || [])
    ];
    const finalBannedTerms = [
      ...config.bannedTerms,
      ...(additionalTerms?.banned || [])
    ];

    const defaults: Partial<BrandVoiceCreate> = {
      $schema: 'https://digitalwoof.com/schemas/brand-voice/v1.0.json',
      version: '1.0',
      brand: {
        name: `Empresa ${segment.charAt(0).toUpperCase() + segment.slice(1).replace('_', ' ')}`, // Default name
        segment,
        businessType: config.businessTypes[0], // Primary business type
        mission: finalMission,
        values: finalValues,
        targetAudience: {
          primary: this.getDefaultTargetAudience(segment),
          personas: this.getDefaultPersonas(segment),
          painPoints: this.getDefaultPainPoints(segment),
          goals: this.getDefaultGoals(segment)
        }
      },
      visual: this.getDefaultVisual(segment),
      voice: {
        tone: finalToneProfile,
        persona: {
          description: this.getDefaultPersonaDescription(segment),
          characteristics: this.getDefaultCharacteristics(segment),
          communication_style: finalCommunicationStyle
        },
        lexicon: {
          prefer: finalPreferTerms,
          avoid: finalAvoidTerms,
          banned: finalBannedTerms,
          industry_specific: {
            medical_terms: segment === 'veterinaria' ? 'technical' : 'simplified',
            pet_terminology: this.getDefaultPetTerminology(segment)
          }
        },
        style: this.getDefaultVoiceStyle(segment)
      },
      compliance: this.getDefaultCompliance(segment, finalComplianceLevel),
      channels: this.getDefaultChannels(segment, config.contentApproach)
    };

    // Add global disclaimer if required
    const globalDisclaimer = defaultsConfig.getGlobalDisclaimer();
    if (globalDisclaimer && defaults.compliance?.content_policies) {
      defaults.compliance.content_policies.default_disclaimer = 
        `${defaults.compliance.content_policies.default_disclaimer}\n\n${globalDisclaimer}`;
    }

    logger.info('Generated segment defaults', {
      segment,
      complianceLevel: finalComplianceLevel,
      toneProfile: finalToneProfile,
      hasOverrides: !!segmentConfig.overrides,
      configurationApplied: true
    });

    return defaults;
  }

  /**
   * Merge user input with intelligent defaults
   */
  static mergeWithDefaults(
    segment: BrandVoice['brand']['segment'],
    userInput: Partial<BrandVoiceCreate>
  ): BrandVoiceCreate {
    const defaults = this.getSegmentDefaults(segment);
    
    // Deep merge with user input taking precedence
    const merged = this.deepMerge(defaults, userInput);
    
    // Ensure required fields are present
    this.validateRequiredFields(merged);
    
    logger.info('Merged user input with defaults', {
      segment,
      hasUserBrand: !!userInput.brand,
      hasUserVoice: !!userInput.voice,
      hasUserCompliance: !!userInput.compliance
    });

    return merged as BrandVoiceCreate;
  }

  /**
   * Get quality-optimized defaults that ensure high scores
   */
  static getQualityOptimizedDefaults(segment: BrandVoice['brand']['segment']): Partial<BrandVoiceCreate> {
    const baseDefaults = this.getSegmentDefaults(segment);
    const qualityTargets = defaultsConfig.getQualityTargets();
    const isQualityOptimizationEnabled = defaultsConfig.getConfig().globalSettings.qualityOptimization.enabled;

    if (!isQualityOptimizationEnabled) {
      logger.info('Quality optimization disabled, returning base defaults', { segment });
      return baseDefaults;
    }
    
    // Enhance for quality metrics based on target scores
    const optimized = {
      ...baseDefaults,
      brand: {
        ...baseDefaults.brand!,
        // Optimize values count based on completeness target
        values: baseDefaults.brand!.values!.slice(0, qualityTargets.completeness >= 0.9 ? 4 : 3),
        targetAudience: {
          ...baseDefaults.brand!.targetAudience!,
          // Optimize personas based on specificity target
          personas: baseDefaults.brand!.targetAudience!.personas.slice(0, qualityTargets.specificity >= 0.8 ? 3 : 2),
          painPoints: baseDefaults.brand!.targetAudience!.painPoints.slice(0, 3),
          goals: baseDefaults.brand!.targetAudience!.goals.slice(0, 3)
        }
      },
      voice: {
        ...baseDefaults.voice!,
        persona: {
          ...baseDefaults.voice!.persona!,
          // Optimize characteristics based on usability target
          characteristics: baseDefaults.voice!.persona!.characteristics.slice(0, qualityTargets.usability >= 0.9 ? 5 : 4)
        },
        lexicon: {
          ...baseDefaults.voice!.lexicon!,
          // Optimize lexicon size based on consistency target
          prefer: baseDefaults.voice!.lexicon!.prefer.slice(0, qualityTargets.consistency >= 0.9 ? 10 : 8),
          avoid: baseDefaults.voice!.lexicon!.avoid.slice(0, 8)
        }
      }
    };

    logger.info('Generated quality-optimized defaults', {
      segment,
      qualityTargets,
      optimizations: {
        values: optimized.brand!.values!.length,
        personas: optimized.brand!.targetAudience!.personas.length,
        characteristics: optimized.voice!.persona!.characteristics.length,
        preferredTerms: optimized.voice!.lexicon!.prefer.length
      }
    });

    return optimized;
  }

  /**
   * Get defaults for specific business type within segment
   */
  static getBusinessTypeDefaults(
    segment: BrandVoice['brand']['segment'],
    businessType: BrandVoice['brand']['businessType']
  ): Partial<BrandVoiceCreate> {
    const baseDefaults = this.getSegmentDefaults(segment);
    
    // Adjust tone based on business type
    const adjustedTone = { ...baseDefaults.voice!.tone! };
    
    if (businessType === 'comercio') {
      adjustedTone.acolhimento = Math.min(1, adjustedTone.acolhimento + 0.1);
      adjustedTone.humor = Math.min(1, adjustedTone.humor + 0.2);
    } else if (businessType === 'clinica') {
      adjustedTone.especialização = Math.min(1, adjustedTone.especialização + 0.05);
      adjustedTone.confiança = Math.min(1, adjustedTone.confiança + 0.05);
    } else if (businessType === 'servico') {
      adjustedTone.acolhimento = Math.min(1, adjustedTone.acolhimento + 0.15);
    }

    return {
      ...baseDefaults,
      brand: {
        ...baseDefaults.brand!,
        businessType
      },
      voice: {
        ...baseDefaults.voice!,
        tone: adjustedTone
      }
    };
  }

  // Private helper methods

  private static getDefaultTargetAudience(segment: BrandVoice['brand']['segment']): string {
    const audiences = {
      veterinaria: 'Tutores responsáveis que buscam cuidado veterinário especializado e de qualidade para seus pets',
      petshop: 'Tutores que desejam produtos de qualidade e variedade para o bem-estar de seus pets',
      banho_tosa: 'Tutores que valorizam a higiene, beleza e bem-estar estético de seus pets',
      hotel_pet: 'Tutores que precisam de hospedagem segura e carinhosa para seus pets durante viagens',
      agropet: 'Produtores rurais e pecuaristas que buscam soluções técnicas para otimizar a produção'
    };
    return audiences[segment];
  }

  private static getDefaultPersonas(segment: BrandVoice['brand']['segment']): string[] {
    const personas = {
      veterinaria: ['Tutores preocupados com saúde', 'Famílias com múltiplos pets', 'Idosos com animais de companhia'],
      petshop: ['Tutores de primeira viagem', 'Famílias com pets ativos', 'Entusiastas de produtos premium'],
      banho_tosa: ['Tutores ocupados', 'Amantes da estética pet', 'Donos de pets de pelo longo'],
      hotel_pet: ['Viajantes frequentes', 'Famílias em férias', 'Profissionais em viagem de negócios'],
      agropet: ['Pequenos produtores', 'Pecuaristas profissionais', 'Cooperativas rurais']
    };
    return personas[segment];
  }

  private static getDefaultPainPoints(segment: BrandVoice['brand']['segment']): string[] {
    const painPoints = {
      veterinaria: ['Ansiedade do pet em consultas', 'Comunicação técnica confusa', 'Custos elevados de tratamento'],
      petshop: ['Dificuldade em escolher produtos', 'Preços altos', 'Falta de variedade'],
      banho_tosa: ['Pet estressado durante o banho', 'Demora no atendimento', 'Resultado insatisfatório'],
      hotel_pet: ['Preocupação com segurança', 'Pet triste longe de casa', 'Falta de informações durante hospedagem'],
      agropet: ['Baixa produtividade', 'Custos elevados de produção', 'Falta de assistência técnica']
    };
    return painPoints[segment];
  }

  private static getDefaultGoals(segment: BrandVoice['brand']['segment']): string[] {
    const goals = {
      veterinaria: ['Pet saudável e feliz', 'Prevenção de doenças', 'Confiança no veterinário'],
      petshop: ['Pet bem cuidado', 'Produtos de qualidade', 'Bom custo-benefício'],
      banho_tosa: ['Pet limpo e bonito', 'Atendimento rápido', 'Pet relaxado'],
      hotel_pet: ['Pet seguro e feliz', 'Tranquilidade durante viagem', 'Socialização do pet'],
      agropet: ['Maior produtividade', 'Redução de custos', 'Sustentabilidade']
    };
    return goals[segment];
  }

  private static getDefaultVisual(segment: BrandVoice['brand']['segment']): BrandVoiceCreate['visual'] {
    const palettes = {
      veterinaria: { primary: '#2E7D32', secondary: ['#81C784', '#4CAF50'], accent: '#FF7043', neutral: ['#F5F5F5', '#E0E0E0'] },
      petshop: { primary: '#FF6B35', secondary: ['#FFB74D', '#FF8A65'], accent: '#4CAF50', neutral: ['#FFF8E1', '#F0F0F0'] },
      banho_tosa: { primary: '#E91E63', secondary: ['#F8BBD9', '#FCE4EC'], accent: '#00BCD4', neutral: ['#FFF', '#F5F5F5'] },
      hotel_pet: { primary: '#3F51B5', secondary: ['#9FA8DA', '#C5CAE9'], accent: '#FF9800', neutral: ['#F3F4F6', '#E5E7EB'] },
      agropet: { primary: '#8BC34A', secondary: ['#AED581', '#C8E6C9'], accent: '#FF5722', neutral: ['#F1F8E9', '#E8F5E8'] }
    };

    return {
      logoUrl: 'https://example.com/logo.png',
      palette: palettes[segment],
      typography: {
        primary: 'Roboto',
        style: segment === 'veterinaria' || segment === 'agropet' ? 'professional' : 'clean'
      },
      imagery: {
        style: 'photography',
        mood: segment === 'veterinaria' ? 'trustworthy' : segment === 'petshop' ? 'playful' : 'warm',
        avoid: ['imagens de stress', 'ambientes frios', 'pets sozinhos']
      }
    };
  }

  private static getDefaultPersonaDescription(segment: BrandVoice['brand']['segment']): string {
    const descriptions = {
      veterinaria: 'Um veterinário experiente e empático que combina conhecimento técnico avançado com uma abordagem calorosa, sempre explicando procedimentos de forma clara e tranquilizadora.',
      petshop: 'Um especialista apaixonado por pets que conhece todos os produtos e oferece recomendações personalizadas com entusiasmo e conhecimento.',
      banho_tosa: 'Um profissional carinhoso e habilidoso que trata cada pet com amor e paciência, proporcionando uma experiência relaxante e prazerosa.',
      hotel_pet: 'Um cuidador dedicado e confiável que trata cada hóspede pet como família, garantindo segurança, diversão e muito carinho.',
      agropet: 'Um consultor técnico experiente que compreende os desafios da produção rural e oferece soluções práticas e eficientes.'
    };
    return descriptions[segment];
  }

  private static getDefaultCharacteristics(segment: BrandVoice['brand']['segment']): string[] {
    const characteristics = {
      veterinaria: ['Competente', 'Empático', 'Confiável', 'Didático', 'Calmo'],
      petshop: ['Entusiasta', 'Conhecedor', 'Prestativo', 'Amigável', 'Apaixonado por pets'],
      banho_tosa: ['Carinhoso', 'Paciente', 'Habilidoso', 'Atencioso', 'Delicado'],
      hotel_pet: ['Cuidadoso', 'Divertido', 'Responsável', 'Carinhoso', 'Confiável'],
      agropet: ['Técnico', 'Prático', 'Experiente', 'Solucionador', 'Parceiro']
    };
    return characteristics[segment];
  }

  private static getDefaultPetTerminology(segment: BrandVoice['brand']['segment']): string[] {
    const terminology = {
      veterinaria: ['pet', 'paciente', 'tutor responsável', 'companheiro de vida'],
      petshop: ['pet', 'amiguinho', 'companheiro', 'cliente especial'],
      banho_tosa: ['pet', 'cliente peludo', 'amigo especial', 'companheiro'],
      hotel_pet: ['hóspede especial', 'pet', 'amiguinho', 'companheiro'],
      agropet: ['animal', 'rebanho', 'plantel', 'produção animal']
    };
    return terminology[segment];
  }

  private static getDefaultVoiceStyle(segment: BrandVoice['brand']['segment']): BrandVoiceCreate['voice']['style'] {
    const urgencyLevels = {
      veterinaria: 'medium' as const,
      petshop: 'medium' as const,
      banho_tosa: 'low' as const,
      hotel_pet: 'low' as const,
      agropet: 'medium' as const
    };

    return {
      sentence_length: 'medium',
      paragraph_style: 'scannable',
      use_questions: true,
      use_exclamations: segment === 'petshop' || segment === 'banho_tosa',
      use_emojis: segment === 'veterinaria' || segment === 'agropet' ? 'minimal' : 'moderate',
      cta_style: {
        preferred: this.getDefaultCTAs(segment),
        urgency_level: urgencyLevels[segment],
        personalization: 'personalized'
      },
      formatting: {
        use_lists: true,
        use_bold: 'moderate',
        use_italics: false,
        use_quotes: segment === 'hotel_pet' || segment === 'banho_tosa'
      }
    };
  }

  private static getDefaultCTAs(segment: BrandVoice['brand']['segment']): string[] {
    const ctas = {
      veterinaria: ['Agende sua consulta', 'Entre em contato', 'Consulte nossos especialistas'],
      petshop: ['Confira nossos produtos', 'Visite nossa loja', 'Peça já o seu'],
      banho_tosa: ['Agende o banho', 'Reserve já', 'Mime seu pet'],
      hotel_pet: ['Reserve a hospedagem', 'Conheça nosso hotel', 'Garante a vaga'],
      agropet: ['Solicite uma visita', 'Fale com nosso consultor', 'Conheça nossas soluções']
    };
    return ctas[segment];
  }

  private static getDefaultCompliance(
    segment: BrandVoice['brand']['segment'],
    level: 'strict' | 'moderate' | 'flexible'
  ): BrandVoiceCreate['compliance'] {
    const disclaimers = {
      veterinaria: 'Este conteúdo é informativo. Sempre consulte um veterinário para orientações específicas sobre seu pet.',
      petshop: 'Consulte sempre um veterinário antes de usar novos produtos com seu pet.',
      banho_tosa: 'Serviços realizados por profissionais qualificados. Comunicamos qualquer situação especial.',
      hotel_pet: 'Hospedagem sujeita a avaliação comportamental prévia e carteira de vacinação em dia.',
      agropet: 'Use produtos conforme orientação técnica. Consulte nossos especialistas para recomendações específicas.'
    };

    return {
      regulatory: {
        medical_claims: level,
        veterinary_advice: segment === 'veterinaria' ? 'required_disclaimer' : 'optional_disclaimer',
        medication_mentions: segment === 'veterinaria' ? 'with_disclaimer' : 'prohibited'
      },
      content_policies: {
        claims_policy: `Seguimos política ${level} para alegações relacionadas à saúde e bem-estar animal`,
        disclaimer_required: true,
        default_disclaimer: disclaimers[segment],
        review_triggers: this.getReviewTriggers(segment)
      },
      legal: {
        lgpd_compliance: true,
        copyright_policy: 'Todo conteúdo é original ou devidamente licenciado',
        user_generated_content: 'moderated'
      }
    };
  }

  private static getReviewTriggers(segment: BrandVoice['brand']['segment']): string[] {
    const triggers = {
      veterinaria: ['cura', 'garantia', 'medicamento', 'diagnóstico', 'tratamento', 'cirurgia', 'emergência'],
      petshop: ['medicinal', 'terapêutico', 'veterinário', 'tratamento', 'cura'],
      banho_tosa: ['medicamento', 'tratamento', 'alergia', 'dermatite'],
      hotel_pet: ['medicamento', 'emergência', 'veterinário', 'doença'],
      agropet: ['medicamento', 'veterinário', 'prescrição', 'diagnóstico']
    };
    return triggers[segment];
  }

  private static getDefaultChannels(
    segment: BrandVoice['brand']['segment'],
    contentApproach: SegmentConfig['contentApproach']
  ): BrandVoiceCreate['channels'] {
    return {
      social_media: {
        instagram: {
          tone_adjustment: segment === 'petshop' || segment === 'banho_tosa' ? 0.2 : 0.1,
          hashtag_strategy: 'moderate',
          story_style: contentApproach.educational === 'basic' ? 'casual' : 'educational'
        },
        facebook: {
          tone_adjustment: 0,
          post_length: contentApproach.educational === 'advanced' ? 'long' : 'medium',
          engagement_style: 'informational'
        },
        whatsapp: {
          formality_level: segment === 'veterinaria' || segment === 'agropet' ? 'semi-formal' : 'casual',
          response_style: 'personalized'
        }
      },
      content_types: {
        educational: {
          depth_level: contentApproach.educational,
          use_examples: true,
          include_sources: segment === 'veterinaria' || segment === 'agropet'
        },
        promotional: {
          sales_approach: contentApproach.promotional,
          urgency_tactics: contentApproach.urgencyLevel === 'high' ? 'moderate' : 'minimal',
          social_proof: 'testimonials'
        },
        customer_service: {
          response_tone: 'helpful',
          problem_solving: contentApproach.promotional === 'consultative' ? 'consultative' : 'direct'
        }
      }
    };
  }

  private static deepMerge(target: any, source: any): any {
    const result = { ...target };
    
    for (const key in source) {
      if (source[key] !== null && typeof source[key] === 'object' && !Array.isArray(source[key])) {
        result[key] = this.deepMerge(target[key] || {}, source[key]);
      } else {
        result[key] = source[key];
      }
    }
    
    return result;
  }

  private static validateRequiredFields(merged: any): void {
    const required = ['$schema', 'version', 'brand', 'visual', 'voice', 'compliance', 'channels'];
    
    for (const field of required) {
      if (!merged[field]) {
        throw new Error(`Required field missing after merge: ${field}`);
      }
    }

    // Validate nested required fields
    if (!merged.brand.name) {
      throw new Error('Brand name is required');
    }
    
    if (!merged.brand.segment) {
      throw new Error('Brand segment is required');
    }
  }
}