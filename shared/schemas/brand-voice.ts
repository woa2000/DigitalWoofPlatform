import { z } from 'zod';

/**
 * Brand Voice JSON Schema v1.0
 * 
 * Complete Zod schema for Brand Voice JSON with runtime validation
 * Implements F03_BRAND_VOICE_JSON specification
 * 
 * @version 1.0
 * @schema https://digitalwoof.com/schemas/brand-voice/v1.0.json
 */

// Helper schemas for reusable components
const HexColorSchema = z.string().regex(/^#[0-9A-F]{6}$/i, 'Invalid hex color format');
const UuidSchema = z.string().uuid();
const IsoDateSchema = z.string().datetime();

// Brand section schema
const BrandSchema = z.object({
  name: z.string().min(1, 'Brand name is required').max(100, 'Brand name too long'),
  segment: z.enum(['veterinaria', 'petshop', 'banho_tosa', 'hotel_pet', 'agropet'], {
    errorMap: () => ({ message: 'Invalid business segment' })
  }),
  businessType: z.enum(['clinica', 'comercio', 'servico', 'misto'], {
    errorMap: () => ({ message: 'Invalid business type' })
  }),
  mission: z.string().max(200, 'Mission statement too long').optional(),
  values: z.array(z.object({
    name: z.string().min(1, 'Value name is required').max(50, 'Value name too long'),
    description: z.string().max(100, 'Value description too long').optional(),
    weight: z.number().min(0, 'Weight must be positive').max(1, 'Weight cannot exceed 1')
  })).max(5, 'Maximum 5 values allowed'),
  targetAudience: z.object({
    primary: z.string().min(1, 'Primary audience is required').max(200, 'Primary audience description too long'),
    personas: z.array(z.string()).max(10, 'Maximum 10 personas allowed'),
    painPoints: z.array(z.string()).max(10, 'Maximum 10 pain points allowed'),
    goals: z.array(z.string()).max(10, 'Maximum 10 goals allowed')
  })
});

// Visual section schema
const VisualSchema = z.object({
  logoUrl: z.string().url('Invalid logo URL'),
  palette: z.object({
    primary: HexColorSchema,
    secondary: z.array(HexColorSchema).max(5, 'Maximum 5 secondary colors'),
    accent: HexColorSchema.optional(),
    neutral: z.array(HexColorSchema).max(3, 'Maximum 3 neutral colors')
  }),
  typography: z.object({
    primary: z.string().min(1, 'Primary typography is required'),
    style: z.enum(['clean', 'elegant', 'playful', 'professional'], {
      errorMap: () => ({ message: 'Invalid typography style' })
    })
  }),
  imagery: z.object({
    style: z.enum(['photography', 'illustration', 'mixed'], {
      errorMap: () => ({ message: 'Invalid imagery style' })
    }),
    mood: z.enum(['warm', 'professional', 'playful', 'trustworthy'], {
      errorMap: () => ({ message: 'Invalid imagery mood' })
    }),
    avoid: z.array(z.string()).max(10, 'Maximum 10 avoid items')
  })
});

// Voice section schema
const VoiceSchema = z.object({
  tone: z.object({
    confiança: z.number().min(0, 'Confidence must be between 0-1').max(1, 'Confidence must be between 0-1'),
    acolhimento: z.number().min(0, 'Warmth must be between 0-1').max(1, 'Warmth must be between 0-1'),
    humor: z.number().min(0, 'Humor must be between 0-1').max(1, 'Humor must be between 0-1'),
    especialização: z.number().min(0, 'Expertise must be between 0-1').max(1, 'Expertise must be between 0-1'),
    urgência: z.number().min(0, 'Urgency must be between 0-1').max(1, 'Urgency must be between 0-1').optional(),
    formalidade: z.number().min(0, 'Formality must be between 0-1').max(1, 'Formality must be between 0-1').optional()
  }),
  persona: z.object({
    description: z.string().min(10, 'Persona description too short').max(500, 'Persona description too long'),
    characteristics: z.array(z.string()).min(1, 'At least one characteristic required').max(10, 'Maximum 10 characteristics'),
    communication_style: z.enum(['conversational', 'professional', 'friendly', 'authoritative'], {
      errorMap: () => ({ message: 'Invalid communication style' })
    })
  }),
  lexicon: z.object({
    prefer: z.array(z.string()).max(20, 'Maximum 20 preferred terms'),
    avoid: z.array(z.string()).max(15, 'Maximum 15 terms to avoid'),
    banned: z.array(z.string()).max(10, 'Maximum 10 banned terms'),
    industry_specific: z.object({
      medical_terms: z.enum(['simplified', 'technical', 'mixed'], {
        errorMap: () => ({ message: 'Invalid medical terms preference' })
      }),
      pet_terminology: z.array(z.string()).max(10, 'Maximum 10 pet terminology items')
    })
  }),
  style: z.object({
    sentence_length: z.enum(['short', 'medium', 'long', 'mixed'], {
      errorMap: () => ({ message: 'Invalid sentence length preference' })
    }),
    paragraph_style: z.enum(['short', 'scannable', 'detailed'], {
      errorMap: () => ({ message: 'Invalid paragraph style' })
    }),
    use_questions: z.boolean(),
    use_exclamations: z.boolean(),
    use_emojis: z.enum(['none', 'minimal', 'moderate', 'frequent'], {
      errorMap: () => ({ message: 'Invalid emoji usage preference' })
    }),
    cta_style: z.object({
      preferred: z.array(z.string()).max(5, 'Maximum 5 preferred CTAs'),
      urgency_level: z.enum(['low', 'medium', 'high'], {
        errorMap: () => ({ message: 'Invalid urgency level' })
      }),
      personalization: z.enum(['generic', 'personalized'], {
        errorMap: () => ({ message: 'Invalid personalization preference' })
      })
    }),
    formatting: z.object({
      use_lists: z.boolean(),
      use_bold: z.enum(['minimal', 'moderate', 'frequent'], {
        errorMap: () => ({ message: 'Invalid bold usage preference' })
      }),
      use_italics: z.boolean(),
      use_quotes: z.boolean()
    })
  })
});

// Compliance section schema
const ComplianceSchema = z.object({
  regulatory: z.object({
    medical_claims: z.enum(['strict', 'moderate', 'flexible'], {
      errorMap: () => ({ message: 'Invalid medical claims policy' })
    }),
    veterinary_advice: z.enum(['required_disclaimer', 'optional_disclaimer', 'none'], {
      errorMap: () => ({ message: 'Invalid veterinary advice policy' })
    }),
    medication_mentions: z.enum(['prohibited', 'with_disclaimer', 'allowed'], {
      errorMap: () => ({ message: 'Invalid medication mentions policy' })
    })
  }),
  content_policies: z.object({
    claims_policy: z.string().min(10, 'Claims policy too short').max(500, 'Claims policy too long'),
    disclaimer_required: z.boolean(),
    default_disclaimer: z.string().min(10, 'Default disclaimer too short').max(200, 'Default disclaimer too long'),
    review_triggers: z.array(z.string()).max(20, 'Maximum 20 review triggers')
  }),
  legal: z.object({
    lgpd_compliance: z.boolean(),
    copyright_policy: z.string().min(10, 'Copyright policy too short').max(300, 'Copyright policy too long'),
    user_generated_content: z.enum(['allowed', 'moderated', 'prohibited'], {
      errorMap: () => ({ message: 'Invalid user generated content policy' })
    })
  })
});

// Channels section schema
const ChannelsSchema = z.object({
  social_media: z.object({
    instagram: z.object({
      tone_adjustment: z.number().min(-0.5, 'Tone adjustment too low').max(0.5, 'Tone adjustment too high'),
      hashtag_strategy: z.enum(['minimal', 'moderate', 'extensive'], {
        errorMap: () => ({ message: 'Invalid hashtag strategy' })
      }),
      story_style: z.enum(['casual', 'branded', 'educational'], {
        errorMap: () => ({ message: 'Invalid story style' })
      })
    }),
    facebook: z.object({
      tone_adjustment: z.number().min(-0.5, 'Tone adjustment too low').max(0.5, 'Tone adjustment too high'),
      post_length: z.enum(['short', 'medium', 'long'], {
        errorMap: () => ({ message: 'Invalid post length preference' })
      }),
      engagement_style: z.enum(['conversational', 'informational'], {
        errorMap: () => ({ message: 'Invalid engagement style' })
      })
    }),
    whatsapp: z.object({
      formality_level: z.enum(['casual', 'semi-formal', 'formal'], {
        errorMap: () => ({ message: 'Invalid formality level' })
      }),
      response_style: z.enum(['quick', 'detailed', 'personalized'], {
        errorMap: () => ({ message: 'Invalid response style' })
      })
    })
  }),
  content_types: z.object({
    educational: z.object({
      depth_level: z.enum(['basic', 'intermediate', 'advanced'], {
        errorMap: () => ({ message: 'Invalid depth level' })
      }),
      use_examples: z.boolean(),
      include_sources: z.boolean()
    }),
    promotional: z.object({
      sales_approach: z.enum(['soft', 'direct', 'consultative'], {
        errorMap: () => ({ message: 'Invalid sales approach' })
      }),
      urgency_tactics: z.enum(['none', 'minimal', 'moderate'], {
        errorMap: () => ({ message: 'Invalid urgency tactics' })
      }),
      social_proof: z.enum(['testimonials', 'statistics', 'both'], {
        errorMap: () => ({ message: 'Invalid social proof preference' })
      })
    }),
    customer_service: z.object({
      response_tone: z.enum(['helpful', 'professional', 'friendly'], {
        errorMap: () => ({ message: 'Invalid response tone' })
      }),
      problem_solving: z.enum(['step_by_step', 'direct', 'consultative'], {
        errorMap: () => ({ message: 'Invalid problem solving approach' })
      })
    })
  })
});

// Metadata section schema
const MetadataSchema = z.object({
  created_at: IsoDateSchema,
  updated_at: IsoDateSchema,
  version_history: z.array(z.object({
    version: z.string().min(1, 'Version is required'),
    date: IsoDateSchema,
    changes: z.string().min(1, 'Change description is required'),
    created_by: z.string().min(1, 'Creator is required') // user_id or "system"
  })).max(50, 'Maximum 50 version history entries'),
  source: z.object({
    anamnesis_analysis_id: UuidSchema.optional(),
    onboarding_session_id: UuidSchema.optional(),
    manual_override: z.boolean()
  }),
  quality_metrics: z.object({
    completeness_score: z.number().min(0, 'Completeness score must be between 0-1').max(1, 'Completeness score must be between 0-1'),
    consistency_score: z.number().min(0, 'Consistency score must be between 0-1').max(1, 'Consistency score must be between 0-1'),
    specificity_score: z.number().min(0, 'Specificity score must be between 0-1').max(1, 'Specificity score must be between 0-1'),
    usability_score: z.number().min(0, 'Usability score must be between 0-1').max(1, 'Usability score must be between 0-1'),
    last_validated: IsoDateSchema
  })
});

// Main Brand Voice schema v1.0
export const BrandVoiceSchema = z.object({
  $schema: z.literal('https://digitalwoof.com/schemas/brand-voice/v1.0.json'),
  version: z.literal('1.0'),
  brand: BrandSchema,
  visual: VisualSchema,
  voice: VoiceSchema,
  compliance: ComplianceSchema,
  channels: ChannelsSchema,
  metadata: MetadataSchema
});

// TypeScript type inference
export type BrandVoice = z.infer<typeof BrandVoiceSchema>;

// Partial schemas for updates
export const BrandVoiceUpdateSchema = BrandVoiceSchema.partial();
export type BrandVoiceUpdate = z.infer<typeof BrandVoiceUpdateSchema>;

// Schema for creation (without metadata)
export const BrandVoiceCreateSchema = BrandVoiceSchema.omit({ metadata: true });
export type BrandVoiceCreate = z.infer<typeof BrandVoiceCreateSchema>;

// Validation helper functions
export const validateBrandVoice = (data: unknown): { success: true; data: BrandVoice } | { success: false; error: z.ZodError } => {
  const result = BrandVoiceSchema.safeParse(data);
  return result;
};

export const validateBrandVoiceUpdate = (data: unknown): { success: true; data: BrandVoiceUpdate } | { success: false; error: z.ZodError } => {
  const result = BrandVoiceUpdateSchema.safeParse(data);
  return result;
};

// Default values for new Brand Voice
export const getDefaultBrandVoice = (
  segment: BrandVoice['brand']['segment'],
  overrides?: Partial<BrandVoice>
): Partial<BrandVoice> => {
  const baseDefaults: Partial<BrandVoice> = {
    $schema: 'https://digitalwoof.com/schemas/brand-voice/v1.0.json',
    version: '1.0',
    voice: {
      tone: {
        confiança: 0.7,
        acolhimento: 0.8,
        humor: 0.4,
        especialização: 0.8
      },
      style: {
        sentence_length: 'medium',
        paragraph_style: 'scannable',
        use_questions: true,
        use_exclamations: false,
        use_emojis: 'minimal',
        cta_style: {
          preferred: ['Agende uma consulta', 'Saiba mais', 'Entre em contato'],
          urgency_level: 'medium',
          personalization: 'personalized'
        },
        formatting: {
          use_lists: true,
          use_bold: 'moderate',
          use_italics: false,
          use_quotes: false
        }
      },
      lexicon: {
        prefer: ['pet', 'amigo', 'companheiro', 'cuidado', 'saúde'],
        avoid: ['animal', 'bicho', 'caro', 'barato'],
        banned: ['garantia', 'cura', '100% eficaz'],
        industry_specific: {
          medical_terms: 'simplified',
          pet_terminology: ['pet', 'tutor', 'companheiro', 'amigo de quatro patas']
        }
      },
      persona: {
        description: 'Profissional experiente e acolhedor do setor pet',
        characteristics: ['empático', 'confiável', 'didático'],
        communication_style: 'friendly'
      }
    },
    compliance: {
      regulatory: {
        medical_claims: 'moderate',
        veterinary_advice: 'optional_disclaimer',
        medication_mentions: 'with_disclaimer'
      },
      content_policies: {
        claims_policy: 'Evitamos promessas de cura ou garantias de resultados',
        disclaimer_required: true,
        default_disclaimer: 'Sempre consulte um veterinário para orientações específicas',
        review_triggers: ['cura', 'garantia', 'medicamento', 'diagnóstico']
      },
      legal: {
        lgpd_compliance: true,
        copyright_policy: 'Respeitamos direitos autorais e criamos conteúdo original',
        user_generated_content: 'moderated'
      }
    }
  };

  // Segment-specific defaults
  const segmentDefaults: Record<BrandVoice['brand']['segment'], Partial<BrandVoice>> = {
    veterinaria: {
      voice: {
        tone: {
          confiança: 0.9,
          acolhimento: 0.8,
          humor: 0.3,
          especialização: 0.9
        },
        style: baseDefaults.voice!.style,
        lexicon: baseDefaults.voice!.lexicon,
        persona: baseDefaults.voice!.persona
      },
      compliance: {
        regulatory: {
          medical_claims: 'strict',
          veterinary_advice: 'required_disclaimer',
          medication_mentions: 'with_disclaimer'
        },
        content_policies: baseDefaults.compliance!.content_policies,
        legal: baseDefaults.compliance!.legal
      }
    },
    petshop: {
      voice: {
        tone: {
          confiança: 0.7,
          acolhimento: 0.9,
          humor: 0.6,
          especialização: 0.6
        },
        style: baseDefaults.voice!.style,
        lexicon: baseDefaults.voice!.lexicon,
        persona: baseDefaults.voice!.persona
      }
    },
    banho_tosa: {
      voice: {
        tone: {
          confiança: 0.6,
          acolhimento: 0.9,
          humor: 0.7,
          especialização: 0.7
        },
        style: baseDefaults.voice!.style,
        lexicon: baseDefaults.voice!.lexicon,
        persona: baseDefaults.voice!.persona
      }
    },
    hotel_pet: {
      voice: {
        tone: {
          confiança: 0.8,
          acolhimento: 0.9,
          humor: 0.5,
          especialização: 0.7
        },
        style: baseDefaults.voice!.style,
        lexicon: baseDefaults.voice!.lexicon,
        persona: baseDefaults.voice!.persona
      }
    },
    agropet: {
      voice: {
        tone: {
          confiança: 0.8,
          acolhimento: 0.7,
          humor: 0.4,
          especialização: 0.8
        },
        style: baseDefaults.voice!.style,
        lexicon: baseDefaults.voice!.lexicon,
        persona: baseDefaults.voice!.persona
      }
    }
  };

  return {
    ...baseDefaults,
    ...segmentDefaults[segment],
    ...overrides
  };
};

// Schema version compatibility check
export const isCompatibleVersion = (version: string): boolean => {
  const supportedVersions = ['1.0'];
  return supportedVersions.includes(version);
};

// Migration helpers (for future schema versions)
export const migrateToLatestVersion = (data: any): BrandVoice => {
  // Currently only v1.0, but ready for future migrations
  if (!data.version || data.version === '1.0') {
    return BrandVoiceSchema.parse(data);
  }
  
  throw new Error(`Unsupported Brand Voice schema version: ${data.version}`);
};