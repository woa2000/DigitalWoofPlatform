import { type BrandVoice } from '../shared/schemas/brand-voice.js';

/**
 * Segment-specific defaults for Brand Voice generation
 * Simplified version that follows schema exactly
 */
export function getBrandVoiceDefaults(businessType: string = 'veterinaria'): BrandVoice {
  const baseDefaults: BrandVoice = {
    $schema: "https://digitalwoof.com/schemas/brand-voice/v1.0.json",
    version: "1.0",
    brand: {
      name: "",
      segment: "veterinaria",
      businessType: "clinica",
      targetAudience: {
        primary: "tutores_preocupados",
        personas: ["familias_com_pets", "jovens_casais"],
        painPoints: ["saude_pet", "custo_tratamento"],
        goals: ["pet_saudavel", "prevencao"]
      },
      values: [
        {
          name: "Cuidado",
          weight: 1.0,
          description: "Dedicação ao bem-estar dos pets"
        }
      ]
    },
    visual: {
      logoUrl: "",
      palette: {
        primary: "#2B7A78",
        secondary: ["#17252A", "#3AAFA9"],
        neutral: ["#FEFFFF", "#F5F5F5"],
        accent: "#DEF2F1"
      },
      typography: {
        primary: "Inter",
        style: "clean"
      },
      imagery: {
        style: "photography",
        mood: "trustworthy",
        avoid: ["clinico_demais"]
      }
    },
    voice: {
      style: {
        sentence_length: "medium",
        paragraph_style: "scannable",
        use_questions: true,
        use_exclamations: false,
        use_emojis: "moderate",
        cta_style: {
          preferred: ["agende_consulta"],
          urgency_level: "medium",
          personalization: "personalized"
        },
        formatting: {
          use_lists: true,
          use_bold: "moderate",
          use_italics: true,
          use_quotes: false
        }
      },
      tone: {
        confiança: 0.8,
        acolhimento: 0.9,
        humor: 0.3,
        especialização: 0.8
      },
      persona: {
        description: "Especialista veterinário empático",
        characteristics: ["competente", "carinhoso"],
        communication_style: "professional"
      },
      lexicon: {
        prefer: ["tutor", "pet", "saúde"],
        avoid: ["dono", "animal"],
        banned: ["milagre"],
        industry_specific: {
          medical_terms: "simplified",
          pet_terminology: ["pet", "tutor"]
        }
      }
    },
    compliance: {
      regulatory: {
        medical_claims: "moderate",
        veterinary_advice: "required_disclaimer",
        medication_mentions: "with_disclaimer"
      },
      content_policies: {
        claims_policy: "evidence_based",
        disclaimer_required: true,
        default_disclaimer: "Consulte sempre um veterinário",
        review_triggers: ["medical_advice"]
      },
      legal: {
        lgpd_compliance: true,
        copyright_policy: "automatic_citation",
        user_generated_content: "moderated"
      }
    },
    channels: {
      social_media: {
        instagram: {
          tone_adjustment: 0.2,
          hashtag_strategy: "moderate",
          story_style: "educational"
        },
        facebook: {
          tone_adjustment: 0.0,
          post_length: "medium",
          engagement_style: "conversational"
        },
        whatsapp: {
          formality_level: "casual",
          response_style: "personalized"
        }
      },
      content_types: {
        educational: {
          depth_level: "intermediate",
          use_examples: true,
          include_sources: true
        },
        promotional: {
          sales_approach: "consultative",
          urgency_tactics: "moderate",
          social_proof: "testimonials"
        },
        customer_service: {
          response_tone: "helpful",
          problem_solving: "consultative"
        }
      }
    },
    metadata: {
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
      version_history: [{
        date: new Date().toISOString(),
        version: "1.0",
        changes: "Initial version",
        created_by: "system"
      }],
      source: {
        manual_override: false
      },
      quality_metrics: {
        completeness_score: 75,
        consistency_score: 85,
        specificity_score: 70,
        usability_score: 75,
        last_validated: new Date().toISOString()
      }
    }
  };

  return baseDefaults;
}