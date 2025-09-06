/**
 * Personalization Engine Service
 * 
 * Aplica Brand Voice JSON para personalizar templates de campanhas.
 * Funcionalidades:
 * - Aplicação de configurações de Brand Voice
 * - Cálculo de score de compatibilidade
 * - Compliance check com regras de marca
 * - Customização de conteúdo baseada em contexto
 * 
 * Performance target: < 5s para personalização completa
 */

import { z } from 'zod';
import { 
  ContentPiece, 
  CampaignCategory, 
  ServiceType,
  CampaignCategoryType,
  ServiceTypeType,
  CampaignTemplateCreate
} from '../models/campaign';

// Brand Voice JSON Schema (integração com sistema existente)
const BrandVoiceSchema = z.object({
  id: z.string().uuid(),
  businessName: z.string(),
  businessType: z.nativeEnum(ServiceType),
  targetAudience: z.object({
    primaryAge: z.string(),
    interests: z.array(z.string()),
    painPoints: z.array(z.string()),
    preferredChannels: z.array(z.string()),
  }),
  brandPersonality: z.object({
    tone: z.enum(['friendly', 'professional', 'playful', 'authoritative', 'casual']),
    formality: z.enum(['very_formal', 'formal', 'neutral', 'informal', 'very_informal']),
    energy: z.enum(['low', 'moderate', 'high', 'very_high']),
    expertise: z.enum(['beginner', 'intermediate', 'advanced', 'expert']),
  }),
  communicationStyle: z.object({
    useEmojis: z.boolean(),
    useHashtags: z.boolean(),
    includeCTA: z.boolean(),
    mentionBenefits: z.boolean(),
    addressPainPoints: z.boolean(),
  }),
  businessContext: z.object({
    location: z.string().optional(),
    specialties: z.array(z.string()),
    uniqueSellingPoints: z.array(z.string()),
    competitiveDifferentiators: z.array(z.string()),
  }),
  contentPreferences: z.object({
    preferredLength: z.enum(['short', 'medium', 'long']),
    includeEducationalContent: z.boolean(),
    includePromotionalContent: z.boolean(),
    includePersonalStories: z.boolean(),
  }),
  complianceRules: z.object({
    avoidTerms: z.array(z.string()),
    requiredDisclaimers: z.array(z.string()),
    regulatoryCompliance: z.array(z.string()),
  }).optional(),
});

type BrandVoice = z.infer<typeof BrandVoiceSchema>;

// Personalization Result Schema
const PersonalizationResultSchema = z.object({
  templateId: z.string().uuid(),
  brandVoiceId: z.string().uuid(),
  compatibilityScore: z.number().min(0).max(100),
  personalizedContent: z.array(z.object({
    contentPieceId: z.string(),
    originalCopy: z.string(),
    personalizedCopy: z.string(),
    modifications: z.array(z.string()),
    confidence: z.number().min(0).max(100),
  })),
  complianceCheck: z.object({
    passed: z.boolean(),
    warnings: z.array(z.string()),
    errors: z.array(z.string()),
  }),
  recommendations: z.array(z.string()),
  processingTime: z.number(),
});

type PersonalizationResult = z.infer<typeof PersonalizationResultSchema>;

// Personalization Context
interface PersonalizationContext {
  brandVoice: BrandVoice;
  template: CampaignTemplateCreate & { id: string };
  targetChannel?: string;
  campaignObjective?: string;
  seasonalContext?: {
    month: number;
    season: string;
    events: string[];
  };
}

/**
 * Main Personalization Engine Service
 */
export class PersonalizationEngine {
  private readonly processingStartTime: number;

  constructor() {
    this.processingStartTime = Date.now();
  }

  /**
   * Personaliza um template baseado no Brand Voice
   */
  async personalizeTemplate(
    template: CampaignTemplateCreate & { id: string },
    brandVoice: BrandVoice,
    options: {
      targetChannel?: string;
      campaignObjective?: string;
      includeSeasonalContext?: boolean;
    } = {}
  ): Promise<PersonalizationResult> {
    const context: PersonalizationContext = {
      brandVoice,
      template,
      targetChannel: options.targetChannel,
      campaignObjective: options.campaignObjective,
    };

    // Adicionar contexto sazonal se solicitado
    if (options.includeSeasonalContext) {
      context.seasonalContext = this.getCurrentSeasonalContext();
    }

    // 1. Calcular score de compatibilidade
    const compatibilityScore = this.calculateCompatibilityScore(context);

    // 2. Personalizar conteúdo
    const personalizedContent = await this.personalizeContent(context);

    // 3. Compliance check
    const complianceCheck = this.performComplianceCheck(personalizedContent, brandVoice);

    // 4. Gerar recomendações
    const recommendations = this.generateRecommendations(context, compatibilityScore);

    const processingTime = Date.now() - this.processingStartTime;

    return {
      templateId: template.id,
      brandVoiceId: brandVoice.id,
      compatibilityScore,
      personalizedContent,
      complianceCheck,
      recommendations,
      processingTime,
    };
  }

  /**
   * Calcula score de compatibilidade entre template e Brand Voice
   */
  private calculateCompatibilityScore(context: PersonalizationContext): number {
    const { template, brandVoice } = context;
    let score = 0;
    let maxScore = 0;

    // 1. Compatibilidade de tipo de serviço (peso: 30%)
    maxScore += 30;
    if (template.serviceType === brandVoice.businessType) {
      score += 30;
    } else {
      // Compatibilidade parcial para tipos relacionados
      const compatibility = this.getServiceTypeCompatibility(template.serviceType, brandVoice.businessType);
      score += compatibility * 30;
    }

    // 2. Compatibilidade de categoria da campanha (peso: 25%)
    maxScore += 25;
    const categoryCompatibility = this.getCategoryCompatibility(template.category, brandVoice);
    score += categoryCompatibility * 25;

    // 3. Compatibilidade de tom e estilo (peso: 25%)
    maxScore += 25;
    const styleCompatibility = this.getStyleCompatibility(template, brandVoice);
    score += styleCompatibility * 25;

    // 4. Compatibilidade de canal e formato (peso: 20%)
    maxScore += 20;
    const channelCompatibility = this.getChannelCompatibility(template, brandVoice);
    score += channelCompatibility * 20;

    return Math.round((score / maxScore) * 100);
  }

  /**
   * Personaliza o conteúdo de cada peça da campanha
   */
  private async personalizeContent(context: PersonalizationContext): Promise<PersonalizationResult['personalizedContent']> {
    const { template, brandVoice } = context;
    const personalizedContent: PersonalizationResult['personalizedContent'] = [];

    for (const contentPiece of template.contentPieces) {
      const personalization = await this.personalizeContentPiece(contentPiece, brandVoice, context);
      personalizedContent.push(personalization);
    }

    return personalizedContent;
  }

  /**
   * Personaliza uma peça individual de conteúdo
   */
  private async personalizeContentPiece(
    contentPiece: ContentPiece,
    brandVoice: BrandVoice,
    context: PersonalizationContext
  ): Promise<PersonalizationResult['personalizedContent'][0]> {
    let personalizedCopy = contentPiece.baseCopy;
    const modifications: string[] = [];
    let confidence = 100;

    // 1. Aplicar tom e estilo
    const styleResult = this.applyBrandStyle(personalizedCopy, brandVoice);
    personalizedCopy = styleResult.text;
    modifications.push(...styleResult.modifications);

    // 2. Substituir variáveis específicas do negócio
    const variableResult = this.replaceBusinessVariables(personalizedCopy, brandVoice, context);
    personalizedCopy = variableResult.text;
    modifications.push(...variableResult.modifications);

    // 3. Ajustar para público-alvo
    const audienceResult = this.adjustForTargetAudience(personalizedCopy, brandVoice);
    personalizedCopy = audienceResult.text;
    modifications.push(...audienceResult.modifications);

    // 4. Aplicar preferências de comunicação
    const commResult = this.applyCommunicationPreferences(personalizedCopy, brandVoice, contentPiece);
    personalizedCopy = commResult.text;
    modifications.push(...commResult.modifications);

    // 5. Adicionar contexto sazonal se disponível
    if (context.seasonalContext) {
      const seasonalResult = this.addSeasonalContext(personalizedCopy, context.seasonalContext);
      personalizedCopy = seasonalResult.text;
      modifications.push(...seasonalResult.modifications);
    }

    // Calcular confidence baseado no número de modificações aplicadas
    const modificationsApplied = modifications.length;
    confidence = Math.max(70, 100 - (modificationsApplied * 5));

    return {
      contentPieceId: contentPiece.id,
      originalCopy: contentPiece.baseCopy,
      personalizedCopy,
      modifications,
      confidence,
    };
  }

  /**
   * Aplica estilo da marca (tom, formalidade, energia)
   */
  private applyBrandStyle(text: string, brandVoice: BrandVoice): { text: string; modifications: string[] } {
    let modifiedText = text;
    const modifications: string[] = [];

    const { tone, formality, energy } = brandVoice.brandPersonality;

    // Ajustar formalidade
    if (formality === 'very_formal' || formality === 'formal') {
      // Converter para linguagem mais formal
      modifiedText = modifiedText
        .replace(/\bvocê\b/gi, 'o senhor/a senhora')
        .replace(/\btá\b/gi, 'está')
        .replace(/\bpra\b/gi, 'para');
      
      if (modifiedText !== text) {
        modifications.push('Ajustado para formalidade: ' + formality);
      }
    } else if (formality === 'informal' || formality === 'very_informal') {
      // Converter para linguagem mais informal
      modifiedText = modifiedText
        .replace(/\bo senhor\/a senhora\b/gi, 'você')
        .replace(/\bestá\b/gi, 'tá')
        .replace(/\bpara\b/gi, 'pra');
      
      if (modifiedText !== text) {
        modifications.push('Ajustado para informalidade: ' + formality);
      }
    }

    // Ajustar energia
    if (energy === 'high' || energy === 'very_high') {
      // Adicionar exclamações e palavras energéticas
      if (!modifiedText.includes('!')) {
        modifiedText = modifiedText.replace(/\.$/, '!');
        modifications.push('Adicionada energia com pontuação');
      }
    }

    // Ajustar tom específico
    if (tone === 'playful') {
      // Adicionar elementos lúdicos (será implementado com base em padrões)
      modifications.push('Tom lúdico aplicado');
    } else if (tone === 'authoritative') {
      // Linguagem mais assertiva
      modifiedText = modifiedText.replace(/\btalvez\b/gi, 'certamente');
      modifications.push('Tom autoritativo aplicado');
    }

    return { text: modifiedText, modifications };
  }

  /**
   * Substitui variáveis específicas do negócio
   */
  private replaceBusinessVariables(
    text: string, 
    brandVoice: BrandVoice, 
    context: PersonalizationContext
  ): { text: string; modifications: string[] } {
    let modifiedText = text;
    const modifications: string[] = [];

    // Substituir nome do negócio
    if (modifiedText.includes('[NOME_NEGOCIO]')) {
      modifiedText = modifiedText.replace(/\[NOME_NEGOCIO\]/g, brandVoice.businessName);
      modifications.push(`Nome do negócio substituído: ${brandVoice.businessName}`);
    }

    // Substituir especialidades
    if (modifiedText.includes('[ESPECIALIDADES]') && brandVoice.businessContext.specialties.length > 0) {
      const specialties = brandVoice.businessContext.specialties.join(', ');
      modifiedText = modifiedText.replace(/\[ESPECIALIDADES\]/g, specialties);
      modifications.push(`Especialidades adicionadas: ${specialties}`);
    }

    // Substituir diferenciais competitivos
    if (modifiedText.includes('[DIFERENCIAIS]') && brandVoice.businessContext.uniqueSellingPoints.length > 0) {
      const usps = brandVoice.businessContext.uniqueSellingPoints.join(', ');
      modifiedText = modifiedText.replace(/\[DIFERENCIAIS\]/g, usps);
      modifications.push(`Diferenciais adicionados: ${usps}`);
    }

    // Substituir localização
    if (modifiedText.includes('[LOCALIZACAO]') && brandVoice.businessContext.location) {
      modifiedText = modifiedText.replace(/\[LOCALIZACAO\]/g, brandVoice.businessContext.location);
      modifications.push(`Localização adicionada: ${brandVoice.businessContext.location}`);
    }

    return { text: modifiedText, modifications };
  }

  /**
   * Ajusta conteúdo para público-alvo
   */
  private adjustForTargetAudience(text: string, brandVoice: BrandVoice): { text: string; modifications: string[] } {
    let modifiedText = text;
    const modifications: string[] = [];

    const { targetAudience } = brandVoice;

    // Ajustar para idade do público
    if (targetAudience.primaryAge.includes('jovem') || targetAudience.primaryAge.includes('18-30')) {
      // Linguagem mais descontraída para público jovem
      if (!modifiedText.includes('galera') && !modifiedText.includes('pessoal')) {
        // Pode adicionar elementos de linguagem jovem contextualmente
        modifications.push('Linguagem ajustada para público jovem');
      }
    }

    // Abordar pain points se mencionados no template
    if (modifiedText.includes('[PAIN_POINTS]') && targetAudience.painPoints.length > 0) {
      const painPoint = targetAudience.painPoints[0]; // Usar o primeiro pain point
      modifiedText = modifiedText.replace(/\[PAIN_POINTS\]/g, painPoint);
      modifications.push(`Pain point abordado: ${painPoint}`);
    }

    return { text: modifiedText, modifications };
  }

  /**
   * Aplica preferências de comunicação
   */
  private applyCommunicationPreferences(
    text: string, 
    brandVoice: BrandVoice, 
    contentPiece: ContentPiece
  ): { text: string; modifications: string[] } {
    let modifiedText = text;
    const modifications: string[] = [];

    const { communicationStyle } = brandVoice;

    // Aplicar emojis se permitido
    if (communicationStyle.useEmojis && contentPiece.formatting.includeEmojis) {
      const emojis = this.selectRelevantEmojis(modifiedText, brandVoice.businessType);
      if (emojis.length > 0) {
        modifiedText = `${emojis.join(' ')} ${modifiedText}`;
        modifications.push(`Emojis adicionados: ${emojis.join(' ')}`);
      }
    }

    // Adicionar hashtags se permitido
    if (communicationStyle.useHashtags && contentPiece.formatting.includeHashtags) {
      const hashtags = this.generateRelevantHashtags(brandVoice);
      if (hashtags.length > 0) {
        modifiedText = `${modifiedText}\n\n${hashtags.join(' ')}`;
        modifications.push(`Hashtags adicionadas: ${hashtags.join(' ')}`);
      }
    }

    // Adicionar CTA se configurado
    if (communicationStyle.includeCTA && !modifiedText.toLowerCase().includes('entre em contato')) {
      const cta = this.generateCTA(brandVoice);
      modifiedText = `${modifiedText}\n\n${cta}`;
      modifications.push(`CTA adicionado: ${cta}`);
    }

    return { text: modifiedText, modifications };
  }

  /**
   * Adiciona contexto sazonal
   */
  private addSeasonalContext(
    text: string, 
    seasonalContext: NonNullable<PersonalizationContext['seasonalContext']>
  ): { text: string; modifications: string[] } {
    let modifiedText = text;
    const modifications: string[] = [];

    // Adicionar referência sazonal se apropriado
    if (text.includes('[CONTEXTO_SAZONAL]')) {
      const seasonalRef = this.getSeasonalReference(seasonalContext);
      modifiedText = modifiedText.replace(/\[CONTEXTO_SAZONAL\]/g, seasonalRef);
      modifications.push(`Contexto sazonal adicionado: ${seasonalRef}`);
    }

    return { text: modifiedText, modifications };
  }

  /**
   * Realiza compliance check
   */
  private performComplianceCheck(
    personalizedContent: PersonalizationResult['personalizedContent'],
    brandVoice: BrandVoice
  ): PersonalizationResult['complianceCheck'] {
    const warnings: string[] = [];
    const errors: string[] = [];

    if (brandVoice.complianceRules) {
      const { avoidTerms, requiredDisclaimers } = brandVoice.complianceRules;

      // Verificar termos a evitar
      for (const content of personalizedContent) {
        for (const term of avoidTerms) {
          if (content.personalizedCopy.toLowerCase().includes(term.toLowerCase())) {
            warnings.push(`Termo a evitar encontrado: "${term}" em ${content.contentPieceId}`);
          }
        }

        // Verificar disclaimers obrigatórios
        for (const disclaimer of requiredDisclaimers) {
          if (!content.personalizedCopy.includes(disclaimer)) {
            errors.push(`Disclaimer obrigatório ausente: "${disclaimer}" em ${content.contentPieceId}`);
          }
        }
      }
    }

    return {
      passed: errors.length === 0,
      warnings,
      errors,
    };
  }

  /**
   * Gera recomendações baseadas no contexto
   */
  private generateRecommendations(
    context: PersonalizationContext,
    compatibilityScore: number
  ): string[] {
    const recommendations: string[] = [];

    if (compatibilityScore < 70) {
      recommendations.push('Score de compatibilidade baixo. Considere ajustar o template ou Brand Voice.');
    }

    if (context.brandVoice.contentPreferences.includeEducationalContent) {
      recommendations.push('Considere adicionar conteúdo educacional baseado nas especialidades do negócio.');
    }

    if (context.brandVoice.targetAudience.preferredChannels.includes('instagram') && 
        !context.template.contentPieces.some((p: ContentPiece) => p.type === 'instagram_post')) {
      recommendations.push('Público prefere Instagram. Considere adicionar conteúdo específico para esta plataforma.');
    }

    return recommendations;
  }

  // Métodos auxiliares para cálculos de compatibilidade

  private getServiceTypeCompatibility(templateType: ServiceTypeType, brandType: ServiceTypeType): number {
    if (templateType === brandType) return 1.0;
    
    // Mapeamento de compatibilidade entre tipos de serviço
    const compatibilityMatrix: Record<string, Record<string, number>> = {
      [ServiceType.VETERINARIA]: {
        [ServiceType.PETSHOP]: 0.8,
        [ServiceType.HOTEL]: 0.6,
        [ServiceType.ADESTRAMENTO]: 0.7,
      },
      [ServiceType.PETSHOP]: {
        [ServiceType.VETERINARIA]: 0.8,
        [ServiceType.HOTEL]: 0.7,
        [ServiceType.ADESTRAMENTO]: 0.5,
      },
      // Adicionar outras combinações conforme necessário
    };

    return compatibilityMatrix[templateType]?.[brandType] || 0.3;
  }

  private getCategoryCompatibility(category: CampaignCategoryType, brandVoice: BrandVoice): number {
    // Lógica para determinar compatibilidade de categoria baseada no Brand Voice
    const { targetAudience, contentPreferences } = brandVoice;

    switch (category) {
      case CampaignCategory.AQUISICAO:
        return contentPreferences.includePromotionalContent ? 1.0 : 0.6;
      
      case CampaignCategory.EDUCACAO:
        return contentPreferences.includeEducationalContent ? 1.0 : 0.5;
      
      case CampaignCategory.RETENCAO:
        return targetAudience.interests.length > 0 ? 0.9 : 0.7;
      
      default:
        return 0.7;
    }
  }

  private getStyleCompatibility(template: CampaignTemplateCreate & { id: string }, brandVoice: BrandVoice): number {
    let compatibility = 0.5; // Base compatibility

    // Verificar compatibilidade de tom
    const templateTone = template.contentPieces[0]?.formatting?.tone;
    if (templateTone === brandVoice.brandPersonality.tone) {
      compatibility += 0.3;
    }

    // Verificar uso de emojis
    const templateUsesEmojis = template.contentPieces.some((p: ContentPiece) => p.formatting.includeEmojis);
    if (templateUsesEmojis === brandVoice.communicationStyle.useEmojis) {
      compatibility += 0.2;
    }

    return Math.min(1.0, compatibility);
  }

  private getChannelCompatibility(template: CampaignTemplateCreate & { id: string }, brandVoice: BrandVoice): number {
    const templateChannels = template.contentPieces.map((p: ContentPiece) => p.type);
    const preferredChannels = brandVoice.targetAudience.preferredChannels;

    const matches = templateChannels.filter((channel: string) => 
      preferredChannels.some((preferred: string) => 
        channel.includes(preferred.toLowerCase())
      )
    );

    return templateChannels.length > 0 ? matches.length / templateChannels.length : 0.5;
  }

  // Métodos auxiliares para personalização de conteúdo

  private selectRelevantEmojis(text: string, businessType: ServiceTypeType): string[] {
    const emojis: Record<string, string[]> = {
      [ServiceType.VETERINARIA]: ['🐕', '🐱', '❤️', '🏥'],
      [ServiceType.PETSHOP]: ['🐾', '🎁', '🛍️', '✨'],
      [ServiceType.HOTEL]: ['🏨', '🐕', '😴', '🎾'],
      [ServiceType.ADESTRAMENTO]: ['🎓', '🐕', '👏', '🏆'],
    };

    return emojis[businessType]?.slice(0, 2) || ['🐾'];
  }

  private generateRelevantHashtags(brandVoice: BrandVoice): string[] {
    const hashtags = ['#pet'];
    
    // Adicionar hashtag do tipo de negócio
    const businessHashtags: Record<string, string> = {
      [ServiceType.VETERINARIA]: '#veterinaria',
      [ServiceType.PETSHOP]: '#petshop',
      [ServiceType.HOTEL]: '#hotelpet',
      [ServiceType.ADESTRAMENTO]: '#adestramento',
    };

    hashtags.push(businessHashtags[brandVoice.businessType]);

    // Adicionar localização se disponível
    if (brandVoice.businessContext.location) {
      const locationTag = brandVoice.businessContext.location
        .toLowerCase()
        .replace(/\s+/g, '')
        .replace(/[^a-z0-9]/g, '');
      hashtags.push(`#${locationTag}`);
    }

    return hashtags.slice(0, 5);
  }

  private generateCTA(brandVoice: BrandVoice): string {
    const ctas = [
      'Entre em contato conosco!',
      'Agende sua consulta hoje!',
      'Saiba mais sobre nossos serviços!',
      'Venha conhecer nossa equipe!',
    ];

    // Selecionar CTA baseado no tipo de negócio
    const businessCTAs: Record<string, string> = {
      [ServiceType.VETERINARIA]: 'Agende uma consulta para seu pet!',
      [ServiceType.PETSHOP]: 'Visite nossa loja e conheça nossos produtos!',
      [ServiceType.HOTEL]: 'Reserve a hospedagem do seu pet!',
      [ServiceType.ADESTRAMENTO]: 'Agende uma avaliação gratuita!',
    };

    return businessCTAs[brandVoice.businessType] || ctas[0];
  }

  private getCurrentSeasonalContext(): NonNullable<PersonalizationContext['seasonalContext']> {
    const now = new Date();
    const month = now.getMonth() + 1;
    
    const seasons: Record<number, string> = {
      12: 'verão', 1: 'verão', 2: 'verão',
      3: 'outono', 4: 'outono', 5: 'outono',
      6: 'inverno', 7: 'inverno', 8: 'inverno',
      9: 'primavera', 10: 'primavera', 11: 'primavera',
    };

    const events: Record<number, string[]> = {
      1: ['Ano Novo', 'Verão'],
      2: ['Carnaval', 'Volta às aulas'],
      3: ['Outono'],
      4: ['Páscoa', 'Dia do Pet (4 de abril)'],
      5: ['Dia das Mães'],
      6: ['Festa Junina', 'Inverno'],
      7: ['Férias escolares'],
      8: ['Dia dos Pais'],
      9: ['Primavera'],
      10: ['Dia das Crianças', 'Dia dos Animais (4 de outubro)'],
      11: ['Black Friday'],
      12: ['Natal', 'Ano Novo'],
    };

    return {
      month,
      season: seasons[month],
      events: events[month] || [],
    };
  }

  private getSeasonalReference(context: NonNullable<PersonalizationContext['seasonalContext']>): string {
    if (context.events.length > 0) {
      return `Neste ${context.events[0]}`;
    }
    return `Neste ${context.season}`;
  }
}

// Export dos schemas para uso em outros módulos
export { BrandVoiceSchema, PersonalizationResultSchema };
export type { BrandVoice, PersonalizationResult, PersonalizationContext };