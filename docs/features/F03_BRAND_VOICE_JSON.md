# F-3: Brand Voice JSON (Artefato Central)

**Status:** 📅 Planejado  
**Fase:** 1 - Cérebro da Marca  
**Prioridade:** P0 (Crítico)  
**Responsáveis:** Data/ML, Backend, Frontend  
**Depende de:** F-1 (Anamnese), F-2 (Onboarding)

---

## Visão Geral
O **Brand Voice JSON** é o artefato central que contém a "personalidade digital" completa da marca. Ele é usado por todos os módulos de IA da plataforma para garantir consistência na geração de conteúdo, análise de compliance e comunicação com o público.

## Objetivo
Fornecer uma **fonte única da verdade** sobre a personalidade de marca que possa ser consumida por sistemas de IA, garantindo que todo conteúdo gerado seja consistente com a identidade definida.

---

## Schema Completo v1.0

### Estrutura JSON Canônica

```json
{
  "$schema": "https://digitalwoof.com/schemas/brand-voice/v1.0.json",
  "version": "1.0",
  "brand": {
    "name": "string",
    "segment": "veterinaria | petshop | banho_tosa | hotel_pet | agropet",
    "businessType": "clinica | comercio | servico | misto",
    "mission": "string?", // opcional, max 200 chars
    "values": [
      {
        "name": "string",
        "description": "string?",
        "weight": "number" // 0.0-1.0, importância relativa
      }
    ],
    "targetAudience": {
      "primary": "string", // ex: "Tutores urbanos, 25-45 anos"
      "personas": ["string"], // derivado da anamnese
      "painPoints": ["string"], // principais dores identificadas
      "goals": ["string"] // objetivos do público
    }
  },
  "visual": {
    "logoUrl": "string",
    "palette": {
      "primary": "#hex",
      "secondary": ["#hex"],
      "accent": "#hex?",
      "neutral": ["#hex"]
    },
    "typography": {
      "primary": "string", // ex: "Sans-serif moderna"
      "style": "clean | elegant | playful | professional"
    },
    "imagery": {
      "style": "photography | illustration | mixed",
      "mood": "warm | professional | playful | trustworthy",
      "avoid": ["string"] // estilos a evitar
    }
  },
  "voice": {
    "tone": {
      "confiança": "number", // 0.0-1.0
      "acolhimento": "number", // 0.0-1.0  
      "humor": "number", // 0.0-1.0
      "especialização": "number", // 0.0-1.0
      "urgência": "number?", // 0.0-1.0, opcional
      "formalidade": "number?" // 0.0-1.0, opcional
    },
    "persona": {
      "description": "string", // ex: "Veterinária experiente e acolhedora"
      "characteristics": ["string"], // ex: ["didática", "empática", "confiável"]
      "communication_style": "conversational | professional | friendly | authoritative"
    },
    "lexicon": {
      "prefer": ["string"], // termos preferidos
      "avoid": ["string"], // termos a evitar
      "banned": ["string"], // termos proibidos (compliance)
      "industry_specific": {
        "medical_terms": "simplified | technical | mixed",
        "pet_terminology": ["string"] // "pet", "amigo", "companheiro"
      }
    },
    "style": {
      "sentence_length": "short | medium | long | mixed",
      "paragraph_style": "short | scannable | detailed",
      "use_questions": "boolean",
      "use_exclamations": "boolean",
      "use_emojis": "none | minimal | moderate | frequent",
      "cta_style": {
        "preferred": ["string"], // CTAs padrão
        "urgency_level": "low | medium | high",
        "personalization": "generic | personalized"
      },
      "formatting": {
        "use_lists": "boolean",
        "use_bold": "minimal | moderate | frequent",
        "use_italics": "boolean",
        "use_quotes": "boolean"
      }
    }
  },
  "compliance": {
    "regulatory": {
      "medical_claims": "strict | moderate | flexible", // política sobre claims médicos
      "veterinary_advice": "required_disclaimer | optional_disclaimer | none",
      "medication_mentions": "prohibited | with_disclaimer | allowed"
    },
    "content_policies": {
      "claims_policy": "string", // política geral de claims
      "disclaimer_required": "boolean",
      "default_disclaimer": "string",
      "review_triggers": ["string"] // palavras que acionam revisão humana
    },
    "legal": {
      "lgpd_compliance": "boolean",
      "copyright_policy": "string",
      "user_generated_content": "allowed | moderated | prohibited"
    }
  },
  "channels": {
    "social_media": {
      "instagram": {
        "tone_adjustment": "number", // -0.5 a +0.5 ajuste de tom
        "hashtag_strategy": "minimal | moderate | extensive",
        "story_style": "casual | branded | educational"
      },
      "facebook": {
        "tone_adjustment": "number",
        "post_length": "short | medium | long",
        "engagement_style": "conversational | informational"
      },
      "whatsapp": {
        "formality_level": "casual | semi-formal | formal",
        "response_style": "quick | detailed | personalized"
      }
    },
    "content_types": {
      "educational": {
        "depth_level": "basic | intermediate | advanced",
        "use_examples": "boolean",
        "include_sources": "boolean"
      },
      "promotional": {
        "sales_approach": "soft | direct | consultative",
        "urgency_tactics": "none | minimal | moderate",
        "social_proof": "testimonials | statistics | both"
      },
      "customer_service": {
        "response_tone": "helpful | professional | friendly",
        "problem_solving": "step_by_step | direct | consultative"
      }
    }
  },
  "metadata": {
    "created_at": "ISO8601",
    "updated_at": "ISO8601",
    "version_history": [
      {
        "version": "string",
        "date": "ISO8601",
        "changes": "string",
        "created_by": "user_id | system"
      }
    ],
    "source": {
      "anamnesis_analysis_id": "string?",
      "onboarding_session_id": "string?",
      "manual_override": "boolean"
    },
    "quality_metrics": {
      "completeness_score": "number", // 0.0-1.0
      "consistency_score": "number", // 0.0-1.0  
      "last_validated": "ISO8601"
    }
  }
}
```

---

## Versionamento e Evolução

### Política de Versões

**Semantic Versioning:** `MAJOR.MINOR.PATCH`

- **MAJOR:** Mudanças que quebram compatibilidade (ex: 1.0 → 2.0)
- **MINOR:** Novas funcionalidades compatíveis (ex: 1.0 → 1.1)
- **PATCH:** Correções e ajustes (ex: 1.0.0 → 1.0.1)

**Ciclo de vida:**
- **v1.0:** MVP - Fase 1 (Set-Out/2025)
- **v1.1:** Adicionar campos para Fase 2 - calendário/campanhas
- **v1.2:** Adicionar campos para Fase 3 - publicação/jornadas
- **v2.0:** Refactor maior baseado em learnings (post-MVP)

### Migration Strategy

```typescript
interface BrandVoiceMigration {
  fromVersion: string;
  toVersion: string;
  migrationFunction: (oldSchema: any) => BrandVoiceV2;
  backwardCompatible: boolean;
}

// Exemplo: v1.0 → v1.1
const migration_1_0_to_1_1: BrandVoiceMigration = {
  fromVersion: "1.0",
  toVersion: "1.1",
  migrationFunction: (v1_0) => ({
    ...v1_0,
    channels: {
      ...v1_0.channels,
      email: { // novo campo v1.1
        tone_adjustment: 0,
        newsletter_style: "informational"
      }
    },
    version: "1.1"
  }),
  backwardCompatible: true
};
```

---

## Geração e Atualização

### Fontes de Dados

**1. Anamnese Digital (F-1):**
- `brand.targetAudience` ← personas identificadas
- `voice.tone` ← análise de comunicação existente
- `compliance.content_policies` ← análise de compliance atual

**2. Onboarding de Marca (F-2):**
- `visual.*` ← upload de logo e paleta
- `voice.tone` ← sliders de personalidade
- `voice.lexicon` ← termos preferidos/evitados
- `brand.mission` e `brand.values` ← inputs do usuário

**3. Ajustes Manuais:**
- Interface de edição para fine-tuning
- Campos editáveis vs read-only
- Histórico de mudanças com justificativa

### Algoritmo de Merge

```typescript
class BrandVoiceGenerator {
  generate(anamnesis: AnamnesisResult, onboarding: OnboardingResult): BrandVoice {
    const baseVoice = this.createFromAnamnesis(anamnesis);
    const userVoice = this.createFromOnboarding(onboarding);
    
    return this.mergeBrandVoices(baseVoice, userVoice, {
      // Prioridade: user input > anamnesis > defaults
      priorityOrder: ['user', 'anamnesis', 'default'],
      conflictResolution: 'weighted_average', // para valores numéricos
      qualityThreshold: 0.7 // minimum completeness score
    });
  }
  
  private mergeBrandVoices(base: Partial<BrandVoice>, user: Partial<BrandVoice>, options: MergeOptions): BrandVoice {
    // Algoritmo de merge inteligente
    // 1. User inputs sempre sobrescrevem
    // 2. Anamnesis preenche lacunas
    // 3. Defaults para campos obrigatórios
    // 4. Validação de consistência
    // 5. Score de qualidade calculado
  }
}
```

---

## Validação e Qualidade

### Schema Validation

```typescript
// Zod schema para runtime validation
const BrandVoiceSchema = z.object({
  version: z.literal("1.0"),
  brand: z.object({
    name: z.string().min(1).max(100),
    segment: z.enum(["veterinaria", "petshop", "banho_tosa", "hotel_pet", "agropet"]),
    mission: z.string().max(200).optional(),
    values: z.array(z.object({
      name: z.string().min(1).max(50),
      description: z.string().max(100).optional(),
      weight: z.number().min(0).max(1)
    })).max(5)
  }),
  voice: z.object({
    tone: z.object({
      confiança: z.number().min(0).max(1),
      acolhimento: z.number().min(0).max(1),
      humor: z.number().min(0).max(1),
      especialização: z.number().min(0).max(1)
    }),
    lexicon: z.object({
      prefer: z.array(z.string()).max(20),
      avoid: z.array(z.string()).max(15),
      banned: z.array(z.string()) // readonly
    })
  }),
  // ... resto do schema
});

type BrandVoice = z.infer<typeof BrandVoiceSchema>;
```

### Metrics de Qualidade

```typescript
interface QualityMetrics {
  completeness_score: number; // % campos preenchidos vs opcionais
  consistency_score: number; // consistência interna (tone vs lexicon)
  specificity_score: number; // quão específico vs genérico
  usability_score: number; // adequação para geração de conteúdo
}

class BrandVoiceQualityAnalyzer {
  calculateQuality(brandVoice: BrandVoice): QualityMetrics {
    return {
      completeness_score: this.calculateCompleteness(brandVoice),
      consistency_score: this.checkConsistency(brandVoice),
      specificity_score: this.measureSpecificity(brandVoice),
      usability_score: this.assessUsability(brandVoice)
    };
  }
  
  private calculateCompleteness(bv: BrandVoice): number {
    // Peso por seção: brand (30%), voice (40%), visual (20%), compliance (10%)
    const weights = { brand: 0.3, voice: 0.4, visual: 0.2, compliance: 0.1 };
    // Calcula % de campos preenchidos por seção
    // Retorna score ponderado 0.0-1.0
  }
  
  private checkConsistency(bv: BrandVoice): number {
    // Verifica inconsistências:
    // - Tom formal com humor alto
    // - Lexicon "evitar" vs "preferir" overlap
    // - Compliance strict com tone muito casual
    // Retorna score 0.0-1.0
  }
}
```

---

## Uso por Módulos de IA

### Template de Prompt

```typescript
class PromptBuilder {
  buildContentPrompt(brandVoice: BrandVoice, contentType: string, context: any): string {
    const prompt = `
Você é um especialista em comunicação para o setor ${brandVoice.brand.segment}.

## IDENTIDADE DA MARCA
Nome: ${brandVoice.brand.name}
Missão: ${brandVoice.brand.mission}
Persona: ${brandVoice.voice.persona.description}

## TOM DE VOZ
Confiança: ${brandVoice.voice.tone.confiança}/1.0 (${this.getToneDescription('confiança', brandVoice.voice.tone.confiança)})
Acolhimento: ${brandVoice.voice.tone.acolhimento}/1.0 (${this.getToneDescription('acolhimento', brandVoice.voice.tone.acolhimento)})
Humor: ${brandVoice.voice.tone.humor}/1.0 (${this.getToneDescription('humor', brandVoice.voice.tone.humor)})

## LINGUAGEM
Preferir: ${brandVoice.voice.lexicon.prefer.join(', ')}
Evitar: ${brandVoice.voice.lexicon.avoid.join(', ')}
Proibido: ${brandVoice.voice.lexicon.banned.join(', ')}

## ESTILO
Frases: ${brandVoice.voice.style.sentence_length}
Emojis: ${brandVoice.voice.style.use_emojis}
CTAs preferidos: ${brandVoice.voice.style.cta_style.preferred.join(', ')}

## COMPLIANCE
Política: ${brandVoice.compliance.content_policies.claims_policy}
Disclaimer obrigatório: ${brandVoice.compliance.content_policies.default_disclaimer}

## TAREFA
Crie um ${contentType} seguindo EXATAMENTE as diretrizes acima.
Contexto: ${JSON.stringify(context)}

Conteúdo:
`;
    return prompt;
  }
  
  private getToneDescription(dimension: string, value: number): string {
    const descriptions = {
      confiança: {
        low: "humilde, questionador",
        medium: "equilibrado, seguro",
        high: "autoritário, assertivo"
      },
      // ... outras dimensões
    };
    
    if (value < 0.33) return descriptions[dimension].low;
    if (value < 0.67) return descriptions[dimension].medium;
    return descriptions[dimension].high;
  }
}
```

### Compliance Checking

```typescript
class ComplianceChecker {
  checkContent(content: string, brandVoice: BrandVoice): ComplianceResult {
    const violations = [];
    
    // Check banned terms
    for (const banned of brandVoice.voice.lexicon.banned) {
      if (content.toLowerCase().includes(banned.toLowerCase())) {
        violations.push({
          type: 'banned_term',
          term: banned,
          severity: 'critical',
          suggestion: this.findAlternative(banned, brandVoice)
        });
      }
    }
    
    // Check medical claims
    if (brandVoice.compliance.regulatory.medical_claims === 'strict') {
      const medicalClaimPatterns = [
        /\b(cura|curar|cura[rm]os)\b/i,
        /\b(garante|garantimos)\b/i,
        /\b(100%|todos|todas).*?(resultados?|sucesso)\b/i
      ];
      
      for (const pattern of medicalClaimPatterns) {
        if (pattern.test(content)) {
          violations.push({
            type: 'medical_claim',
            pattern: pattern.source,
            severity: 'high',
            suggestion: 'Use linguagem de prevenção: "ajuda a prevenir", "contribui para"'
          });
        }
      }
    }
    
    return {
      compliant: violations.length === 0,
      violations,
      score: this.calculateComplianceScore(violations),
      needsHumanReview: violations.some(v => v.severity === 'critical')
    };
  }
}
```

---

## Armazenamento e Cache

### Database Schema

```sql
CREATE TABLE brand_voice (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(id),
  
  -- JSON completo
  brand_voice_json JSONB NOT NULL,
  
  -- Campos indexados para queries
  version VARCHAR(10) NOT NULL,
  brand_name VARCHAR(100) NOT NULL,
  segment VARCHAR(20) NOT NULL,
  
  -- Quality metrics
  completeness_score DECIMAL(3,2),
  consistency_score DECIMAL(3,2),
  
  -- Status
  status VARCHAR(20) CHECK (status IN ('draft', 'active', 'deprecated')),
  is_active BOOLEAN DEFAULT false,
  
  -- Metadata
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  
  -- Constraints
  CONSTRAINT one_active_per_user UNIQUE (user_id, is_active) WHERE is_active = true
);

CREATE INDEX idx_brand_voice_user_active ON brand_voice(user_id) WHERE is_active = true;
CREATE INDEX idx_brand_voice_segment ON brand_voice USING GIN ((brand_voice_json->'brand'->>'segment'));
```

### Caching Strategy

```typescript
class BrandVoiceService {
  private cache = new Map<string, { data: BrandVoice; expires: number }>();
  
  async getBrandVoice(userId: string): Promise<BrandVoice> {
    const cacheKey = `brand_voice:${userId}`;
    
    // Check cache first
    const cached = this.cache.get(cacheKey);
    if (cached && cached.expires > Date.now()) {
      return cached.data;
    }
    
    // Fetch from database
    const brandVoice = await this.db.getBrandVoice(userId);
    
    // Cache for 5 minutes
    this.cache.set(cacheKey, {
      data: brandVoice,
      expires: Date.now() + 5 * 60 * 1000
    });
    
    return brandVoice;
  }
  
  async updateBrandVoice(userId: string, updates: Partial<BrandVoice>): Promise<BrandVoice> {
    // Update database
    const updated = await this.db.updateBrandVoice(userId, updates);
    
    // Invalidate cache
    this.cache.delete(`brand_voice:${userId}`);
    
    // Notify other services
    await this.eventBus.publish('brand_voice.updated', { userId, brandVoice: updated });
    
    return updated;
  }
}
```

---

## Testes

### Schema Validation Tests

```typescript
describe('BrandVoice Schema Validation', () => {
  it('should validate complete brand voice', () => {
    const validBrandVoice = {
      version: "1.0",
      brand: {
        name: "Clínica Pet Life",
        segment: "veterinaria",
        mission: "Cuidar com ciência e amor"
      },
      // ... campos obrigatórios
    };
    
    const result = BrandVoiceSchema.safeParse(validBrandVoice);
    expect(result.success).toBe(true);
  });
  
  it('should reject invalid tone values', () => {
    const invalidBrandVoice = {
      voice: {
        tone: {
          confiança: 1.5, // > 1.0 inválido
          acolhimento: -0.1 // < 0.0 inválido
        }
      }
    };
    
    const result = BrandVoiceSchema.safeParse(invalidBrandVoice);
    expect(result.success).toBe(false);
  });
});
```

### Quality Metrics Tests

```typescript
describe('Brand Voice Quality', () => {
  it('should calculate high completeness for full brand voice', () => {
    const completeBrandVoice = createCompleteBrandVoice();
    const quality = new BrandVoiceQualityAnalyzer().calculateQuality(completeBrandVoice);
    
    expect(quality.completeness_score).toBeGreaterThan(0.9);
  });
  
  it('should detect tone consistency issues', () => {
    const inconsistentBrandVoice = {
      voice: {
        tone: { confiança: 0.9, humor: 0.9 }, // formal + muito humor = inconsistente
        style: { sentence_length: "long" } // contradição
      }
    };
    
    const quality = new BrandVoiceQualityAnalyzer().calculateQuality(inconsistentBrandVoice);
    expect(quality.consistency_score).toBeLessThan(0.7);
  });
});
```

### Integration Tests

```typescript
describe('Brand Voice Integration', () => {
  it('should generate from anamnesis + onboarding', async () => {
    const anamnesis = await createMockAnamnesis();
    const onboarding = await createMockOnboarding();
    
    const brandVoice = await brandVoiceGenerator.generate(anamnesis, onboarding);
    
    expect(brandVoice.version).toBe("1.0");
    expect(brandVoice.brand.name).toBe(onboarding.brandName);
    expect(brandVoice.voice.tone.confiança).toBeGreaterThan(0);
  });
  
  it('should be usable by content generation', async () => {
    const brandVoice = await createValidBrandVoice();
    const prompt = new PromptBuilder().buildContentPrompt(brandVoice, 'social_post', {});
    
    expect(prompt).toContain(brandVoice.brand.name);
    expect(prompt).toContain(brandVoice.voice.lexicon.prefer[0]);
  });
});
```

---

## Documentação Técnica
- [F-1: Anamnese Digital](F01_ANAMNESE_DIGITAL.md) - Fonte de dados
- [F-2: Onboarding de Marca](F02_ONBOARDING_MARCA.md) - Configuração manual
- [F-4: Manual de Marca](F04_MANUAL_MARCA_DIGITAL.md) - Visualização
- [API Contracts](../architecture/API_CONTRACTS.md#brand-voice)
- [Database Schema](../architecture/DATABASE_SCHEMA.md#brand-voice)