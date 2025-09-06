import { BrandVoice } from '../../shared/schemas/brand-voice';

export interface PromptContext {
  theme: string;
  objective: 'educar' | 'vender' | 'engajar' | 'recall' | 'awareness';
  channel: 'instagram_post' | 'instagram_story' | 'facebook_post' | 'whatsapp' | 'email' | 'website';
  customInstructions?: string;
  wordsToAvoid?: string[];
}

export class PetContentPrompts {
  private getComplianceRules(): string {
    return `
COMPLIANCE PET OBRIGATÓRIO:
- NUNCA prometa cura de doenças ou tratamentos médicos
- Use disclaimers para conteúdo de saúde: "Consulte sempre um veterinário"
- Prefira "tutor" ao invés de "dono"
- Evite termos que causem medo desnecessário
- Não faça diagnósticos ou prescrições
- Para antes/depois, inclua contexto e limitações
- Informe responsável técnico (CRMV) quando aplicável
`;
  }

  private buildBasePrompt(brandVoice: BrandVoice, context: PromptContext): string {
    const toneValues = Object.entries(brandVoice.voice.tone)
      .map(([key, value]) => `${key}: ${value}`)
      .join(', ');

    return `Você é um especialista em marketing para o setor pet, criando conteúdo para ${brandVoice.brand.name}.

BRAND VOICE:
- Tom: ${toneValues}
- Persona: ${brandVoice.voice.persona.description}
- Estilo de comunicação: ${brandVoice.voice.persona.communication_style}
- Palavras preferidas: ${brandVoice.voice.lexicon.prefer.join(', ')}
- Palavras a evitar: ${[...brandVoice.voice.lexicon.avoid, ...(context.wordsToAvoid || [])].join(', ')}
- CTAs preferidos: ${brandVoice.voice.style.cta_style.preferred.join(', ')}

${this.getComplianceRules()}

CONTEXTO:
- Tema: ${context.theme}
- Objetivo: ${context.objective}
- Canal: ${context.channel}
${context.customInstructions ? `- Instruções específicas: ${context.customInstructions}` : ''}
`;
  }

  educational(brandVoice: BrandVoice, context: PromptContext): string {
    const basePrompt = this.buildBasePrompt(brandVoice, context);
    
    return `${basePrompt}

TAREFA - CONTEÚDO EDUCATIVO:
Crie 3 variações de post educativo sobre "${context.theme}".

FORMATO DE SAÍDA (JSON):
{
  "variations": [
    {
      "id": "edu_1",
      "title": "Título chamativo e educativo",
      "body": "Corpo do post com informação valiosa...",
      "cta": "Call-to-action apropriado",
      "hashtags": ["#educacao", "#pet", "#saude"]
    }
  ]
}`;
  }

  promotional(brandVoice: BrandVoice, context: PromptContext): string {
    const basePrompt = this.buildBasePrompt(brandVoice, context);
    
    return `${basePrompt}

TAREFA - CONTEÚDO PROMOCIONAL:
Crie 3 variações de post promocional sobre "${context.theme}".

FORMATO DE SAÍDA (JSON):
{
  "variations": [
    {
      "id": "promo_1", 
      "title": "Título que destaca benefício",
      "body": "Corpo focado em valor e benefícios...",
      "cta": "CTA persuasivo mas respeitoso",
      "hashtags": ["#qualidade", "#pet", "#cuidado"]
    }
  ]
}`;
  }

  getPromptByObjective(objective: PromptContext['objective'], brandVoice: BrandVoice, context: PromptContext): string {
    switch (objective) {
      case 'educar':
        return this.educational(brandVoice, context);
      case 'vender':
        return this.promotional(brandVoice, context);
      case 'recall':
      case 'engajar':
      case 'awareness':
        // For now, use educational as base template
        return this.educational(brandVoice, { ...context, objective: 'educar' });
      default:
        throw new Error(`Unknown objective: ${objective}`);
    }
  }
}