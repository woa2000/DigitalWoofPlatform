import { BrandVoice, InsertBrandVoice } from "@shared/schema";

export interface BrandVoiceJSON {
  identity: {
    name: string;
    mission: string;
    vision: string;
    values: string[];
  };
  voice: {
    tone: string;
    personality: string[];
    communication_style: string;
    language_preferences: string[];
  };
  audience: {
    primary_persona: {
      demographics: any;
      psychographics: any;
      pain_points: string[];
      motivations: string[];
    };
    secondary_personas: any[];
  };
  content_guidelines: {
    do: string[];
    dont: string[];
    keywords: string[];
    hashtags: string[];
  };
  compliance: {
    veterinary_terms: string[];
    disclaimers: string[];
    legal_requirements: string[];
  };
}

export function createBrandVoiceJSON(brandVoice: BrandVoice, businessType: string): BrandVoiceJSON {
  const baseJSON: BrandVoiceJSON = {
    identity: {
      name: brandVoice.name,
      mission: "Cuidar do bem-estar dos pets com amor e profissionalismo",
      vision: "Ser referência em cuidados pet na região",
      values: ["Amor pelos animais", "Profissionalismo", "Transparência", "Inovação"]
    },
    voice: {
      tone: brandVoice.tone,
      personality: ["Empático", "Profissional", "Acolhedor", "Confiável"],
      communication_style: "Conversacional mas profissional",
      language_preferences: ["Linguagem acessível", "Termos técnicos explicados", "Tom acolhedor"]
    },
    audience: {
      primary_persona: {
        demographics: {
          age: "25-45 anos",
          income: "Classe B/C",
          location: "Urbano",
          family: "Com pets"
        },
        psychographics: {
          values: ["Bem-estar do pet", "Qualidade de vida", "Prevenção"],
          lifestyle: "Ativo, cuidadoso com o pet",
          challenges: "Tempo limitado, custo de cuidados"
        },
        pain_points: [
          "Falta de tempo para cuidados",
          "Preocupação com custos",
          "Dificuldade em encontrar profissionais confiáveis"
        ],
        motivations: [
          "Saúde e felicidade do pet",
          "Conveniência",
          "Relacionamento de confiança"
        ]
      },
      secondary_personas: []
    },
    content_guidelines: {
      do: [
        "Use linguagem empática",
        "Inclua disclaimers veterinários",
        "Foque no bem-estar animal",
        "Seja educativo e informativo"
      ],
      dont: [
        "Fazer diagnósticos",
        "Prometer curas",
        "Usar termos médicos sem contexto",
        "Dar conselhos médicos específicos"
      ],
      keywords: getKeywordsByBusinessType(businessType),
      hashtags: getHashtagsByBusinessType(businessType)
    },
    compliance: {
      veterinary_terms: [
        "Consulte sempre um veterinário",
        "Este conteúdo não substitui consulta veterinária",
        "Para diagnóstico preciso, procure um profissional"
      ],
      disclaimers: [
        "*Este conteúdo tem caráter educativo",
        "*Consulte sempre um médico veterinário",
        "*Não substitui consulta profissional"
      ],
      legal_requirements: [
        "Conformidade CFMV",
        "LGPD compliance",
        "Transparência em comunicações"
      ]
    }
  };

  return baseJSON;
}

function getKeywordsByBusinessType(businessType: string): string[] {
  const keywords = {
    veterinaria: ["saúde animal", "prevenção", "check-up", "vacinação", "consulta"],
    petshop: ["produtos pet", "alimentação", "brinquedos", "acessórios", "cuidados"],
    banho_tosa: ["higiene", "beleza pet", "tosa", "banho", "cuidados estéticos"],
    hotel_pet: ["hospedagem", "cuidados", "conforto", "segurança", "bem-estar"]
  };
  
  return keywords[businessType] || keywords.veterinaria;
}

function getHashtagsByBusinessType(businessType: string): string[] {
  const hashtags = {
    veterinaria: ["#saudeanimal", "#veterinaria", "#checkuppet", "#prevencao"],
    petshop: ["#petshop", "#produtospet", "#alimentacaopet", "#acessoriospet"],
    banho_tosa: ["#banhoetosa", "#higienepet", "#belezapet", "#cuidadosesteticos"],
    hotel_pet: ["#hotelpet", "#hospedagempet", "#cuidadospet", "#bemestar"]
  };
  
  return hashtags[businessType] || hashtags.veterinaria;
}

export function validateBrandVoiceJSON(json: any): boolean {
  const requiredFields = [
    'identity.name',
    'voice.tone',
    'audience.primary_persona',
    'content_guidelines.do',
    'compliance.disclaimers'
  ];
  
  for (const field of requiredFields) {
    const value = field.split('.').reduce((obj, key) => obj?.[key], json);
    if (!value) {
      return false;
    }
  }
  
  return true;
}
