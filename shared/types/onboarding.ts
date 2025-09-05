import { z } from "zod";

// Logo Metadata Interface
export interface LogoMetadata {
  width: number;
  height: number;
  format: string;
  hasTransparency: boolean;
  fileSize: number;
}

// Tone Configuration (4 sliders 0.0-1.0)
export interface ToneConfiguration {
  confianca: number;     // Confidence
  acolhimento: number;   // Warmth/Welcoming
  humor: number;         // Humor
  especializacao: number; // Expertise/Technical
}

// Language Configuration
export interface LanguageConfiguration {
  preferredTerms: string[];  // max 20
  avoidTerms: string[];      // max 15
  defaultCTAs: string[];     // max 5
}

// Brand Values
export interface BrandValues {
  mission?: string;  // optional, max 200 chars
  values: Array<{
    name: string;
    description?: string;
    weight: number; // 0.0-1.0
  }>; // max 5
  disclaimer: string; // required for compliance
}

// Logo Processing Result
export interface LogoProcessingResult {
  logoUrl: string;
  palette: string[];
  metadata: LogoMetadata;
}

// Onboarding State for Wizard
export interface OnboardingState {
  currentStep: number;
  logoData: LogoProcessingResult | null;
  toneConfig: ToneConfiguration;
  languageConfig: LanguageConfiguration;
  brandValues: BrandValues;
  brandVoiceJson: any | null;
  isLoading: boolean;
  errors: Record<string, string>;
}

// Wizard Step Props
export interface WizardStepProps {
  stepNumber: number;
  title: string;
  description: string;
  isCompleted: boolean;
  onNext: (data: any) => void;
  onPrevious: () => void;
  children: React.ReactNode;
}

// Step completion status
export type StepStatus = 'logo' | 'palette' | 'tone' | 'language' | 'values' | 'completed';

// Zod Validation Schemas
export const LogoMetadataSchema = z.object({
  width: z.number().min(1),
  height: z.number().min(1),
  format: z.enum(['svg', 'png', 'jpg', 'jpeg']),
  hasTransparency: z.boolean(),
  fileSize: z.number().min(1).max(5 * 1024 * 1024) // 5MB max
});

export const ToneConfigurationSchema = z.object({
  confianca: z.number().min(0).max(1),
  acolhimento: z.number().min(0).max(1),
  humor: z.number().min(0).max(1),
  especializacao: z.number().min(0).max(1)
});

export const LanguageConfigurationSchema = z.object({
  preferredTerms: z.array(z.string().min(1)).max(20),
  avoidTerms: z.array(z.string().min(1)).max(15),
  defaultCTAs: z.array(z.string().min(1)).max(5)
});

export const BrandValuesSchema = z.object({
  mission: z.string().max(200).optional(),
  values: z.array(z.object({
    name: z.string().min(1).max(50),
    description: z.string().max(100).optional(),
    weight: z.number().min(0).max(1).default(1.0)
  })).max(5),
  disclaimer: z.string().min(10).max(500)
});

export const OnboardingRequestSchema = z.object({
  logoUrl: z.string().url(),
  palette: z.array(z.string().regex(/^#[0-9A-F]{6}$/i)).min(3).max(6),
  toneConfig: ToneConfigurationSchema,
  languageConfig: LanguageConfigurationSchema,
  brandValues: BrandValuesSchema
});

// Default values for pet industry
export const DEFAULT_PET_VALUES = [
  { name: "Amor pelos animais", weight: 1.0 },
  { name: "Profissionalismo", weight: 0.9 },
  { name: "Transparência", weight: 0.8 },
  { name: "Inovação", weight: 0.7 },
  { name: "Bem-estar animal", weight: 1.0 }
];

export const DEFAULT_PET_TERMS = {
  preferred: [
    "saúde animal", "bem-estar", "cuidados", "prevenção", "qualidade de vida",
    "amor", "carinho", "família", "companheiro", "amigo fiel"
  ],
  avoid: [
    "barato", "desconto", "promoção", "liquidação", "oferta imperdível"
  ],
  prohibited: [
    "diagnóstico", "tratamento", "cura", "medicamento", "prescrição"
  ],
  ctas: [
    "Agende sua consulta", "Cuide do seu pet", "Saiba mais", 
    "Entre em contato", "Proteja quem você ama"
  ]
};

export const DEFAULT_TONE_CONFIG: ToneConfiguration = {
  confianca: 0.8,
  acolhimento: 0.9,
  humor: 0.3,
  especializacao: 0.7
};

export const DEFAULT_DISCLAIMER = 
  "Este conteúdo tem caráter educativo e não substitui consulta veterinária. " +
  "Consulte sempre um médico veterinário para diagnóstico e tratamento adequados.";