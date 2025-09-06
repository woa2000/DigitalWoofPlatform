export interface QualityMetrics {
  readability_score: number;
  relevance_score: number;
  brand_consistency: number;
  compliance_score: number;
  engagement_potential: number;
  overall_score: number;
}

export interface QualityAssessment {
  metrics: QualityMetrics;
  recommendations: string[];
  strengths: string[];
  areas_for_improvement: string[];
}

export class QualityMetricsService {
  
  calculateReadabilityScore(content: string): number {
    const sentences = content.split(/[.!?]+/).filter(s => s.trim().length > 0);
    const words = content.split(/\s+/).filter(w => w.length > 0);
    const characters = content.length;

    if (sentences.length === 0 || words.length === 0) {
      return 0.0;
    }

    // Average words per sentence
    const avgWordsPerSentence = words.length / sentences.length;
    
    // Average characters per word
    const avgCharsPerWord = characters / words.length;

    let score = 1.0;

    // Optimal sentence length: 8-15 words
    if (avgWordsPerSentence > 20) {
      score -= 0.3; // Too complex
    } else if (avgWordsPerSentence > 15) {
      score -= 0.1; // Slightly complex
    } else if (avgWordsPerSentence < 5) {
      score -= 0.2; // Too simple/choppy
    }

    // Optimal word length: 4-6 characters
    if (avgCharsPerWord > 8) {
      score -= 0.2; // Too complex words
    } else if (avgCharsPerWord < 3) {
      score -= 0.1; // Too simple words
    }

    // Check for social media optimization
    if (content.length <= 280) {
      score += 0.1; // Twitter-optimized length
    } else if (content.length <= 500) {
      score += 0.05; // Instagram-optimized length
    }

    return Math.max(0, Math.min(1, score));
  }

  calculateRelevanceScore(content: string, theme: string, keywords: string[] = []): number {
    const contentLower = content.toLowerCase();
    const themeLower = theme.toLowerCase();
    const themeWords = themeLower.split(/\s+/);

    let score = 0.0;

    // Check theme word presence
    let themeWordMatches = 0;
    for (const word of themeWords) {
      if (word.length > 2 && contentLower.includes(word)) {
        themeWordMatches++;
      }
    }
    score += (themeWordMatches / themeWords.length) * 0.4;

    // Check keyword presence
    if (keywords.length > 0) {
      let keywordMatches = 0;
      for (const keyword of keywords) {
        if (contentLower.includes(keyword.toLowerCase())) {
          keywordMatches++;
        }
      }
      score += (keywordMatches / keywords.length) * 0.3;
    } else {
      score += 0.3; // No keywords provided, assume relevant
    }

    // Check for pet-specific terms
    const petTerms = ['pet', 'animal', 'cão', 'gato', 'tutor', 'veterinário', 'saúde', 'cuidado'];
    let petTermMatches = 0;
    for (const term of petTerms) {
      if (contentLower.includes(term)) {
        petTermMatches++;
      }
    }
    score += Math.min(petTermMatches / 5, 1) * 0.3;

    return Math.min(1, score);
  }

  calculateBrandConsistency(
    content: string,
    preferredWords: string[],
    avoidWords: string[],
    bannedWords: string[],
    toneAlignment: number
  ): number {
    const contentLower = content.toLowerCase();
    let score = toneAlignment || 0.8; // Base brand alignment from AI

    // Check preferred words usage
    let preferredUsed = 0;
    for (const word of preferredWords) {
      if (contentLower.includes(word.toLowerCase())) {
        preferredUsed++;
      }
    }
    const preferredRatio = preferredWords.length > 0 ? preferredUsed / preferredWords.length : 1;
    score += preferredRatio * 0.1;

    // Penalize avoided words
    let avoidedUsed = 0;
    for (const word of avoidWords) {
      if (contentLower.includes(word.toLowerCase())) {
        avoidedUsed++;
      }
    }
    if (avoidWords.length > 0) {
      score -= (avoidedUsed / avoidWords.length) * 0.15;
    }

    // Heavy penalty for banned words
    let bannedUsed = 0;
    for (const word of bannedWords) {
      if (contentLower.includes(word.toLowerCase())) {
        bannedUsed++;
      }
    }
    if (bannedUsed > 0) {
      score -= bannedUsed * 0.3;
    }

    return Math.max(0, Math.min(1, score));
  }

  calculateEngagementPotential(
    content: string,
    cta: string,
    hashtags: string[],
    channel: string
  ): number {
    let score = 0.5; // Base score

    // Question engagement
    if (content.includes('?')) {
      score += 0.15;
    }

    // Emoji usage
    const emojiRegex = /[\uD83C-\uDBFF\uDC00-\uDFFF]+/g;
    if (emojiRegex.test(content)) {
      score += 0.1;
    }

    // CTA quality
    if (cta && cta.length > 5) {
      score += 0.1;
      // Action words in CTA
      const actionWords = ['agende', 'descubra', 'aprenda', 'compartilhe', 'saiba'];
      if (actionWords.some(word => cta.toLowerCase().includes(word))) {
        score += 0.05;
      }
    }

    // Hashtag optimization
    if (hashtags && hashtags.length > 0) {
      if (channel.includes('instagram') && hashtags.length >= 3 && hashtags.length <= 10) {
        score += 0.1;
      } else if (channel.includes('facebook') && hashtags.length >= 1 && hashtags.length <= 5) {
        score += 0.1;
      }
    }

    // Length optimization by channel
    const wordCount = content.split(' ').length;
    if (channel.includes('instagram') && wordCount <= 125) {
      score += 0.1;
    } else if (channel.includes('facebook') && wordCount <= 200) {
      score += 0.1;
    } else if (channel.includes('whatsapp') && wordCount <= 100) {
      score += 0.1;
    }

    return Math.min(1, score);
  }

  assessQuality(
    content: string,
    theme: string,
    brandData: {
      preferredWords: string[];
      avoidWords: string[];
      bannedWords: string[];
      toneAlignment: number;
    },
    contentData: {
      cta: string;
      hashtags: string[];
      channel: string;
      keywords?: string[];
    },
    complianceScore: number
  ): QualityAssessment {
    const readability = this.calculateReadabilityScore(content);
    const relevance = this.calculateRelevanceScore(content, theme, contentData.keywords);
    const brandConsistency = this.calculateBrandConsistency(
      content,
      brandData.preferredWords,
      brandData.avoidWords,
      brandData.bannedWords,
      brandData.toneAlignment
    );
    const engagement = this.calculateEngagementPotential(
      content,
      contentData.cta,
      contentData.hashtags,
      contentData.channel
    );

    const metrics: QualityMetrics = {
      readability_score: Number(readability.toFixed(2)),
      relevance_score: Number(relevance.toFixed(2)),
      brand_consistency: Number(brandConsistency.toFixed(2)),
      compliance_score: Number(complianceScore.toFixed(2)),
      engagement_potential: Number(engagement.toFixed(2)),
      overall_score: Number(((readability + relevance + brandConsistency + complianceScore + engagement) / 5).toFixed(2))
    };

    const recommendations = this.generateRecommendations(metrics, content, contentData);
    const strengths = this.identifyStrengths(metrics);
    const areas_for_improvement = this.identifyWeaknesses(metrics);

    return {
      metrics,
      recommendations,
      strengths,
      areas_for_improvement
    };
  }

  private generateRecommendations(
    metrics: QualityMetrics,
    content: string,
    contentData: { cta: string; hashtags: string[]; channel: string }
  ): string[] {
    const recommendations: string[] = [];

    if (metrics.readability_score < 0.7) {
      const sentences = content.split(/[.!?]+/).filter(s => s.trim().length > 0);
      const words = content.split(/\s+/).filter(w => w.length > 0);
      const avgWordsPerSentence = words.length / sentences.length;
      
      if (avgWordsPerSentence > 15) {
        recommendations.push('Divida frases longas em sentenças menores para melhorar a legibilidade');
      }
      if (avgWordsPerSentence < 5) {
        recommendations.push('Combine frases muito curtas para criar um fluxo mais natural');
      }
    }

    if (metrics.relevance_score < 0.7) {
      recommendations.push('Inclua mais termos relacionados ao tema principal do conteúdo');
      recommendations.push('Adicione palavras-chave específicas do setor pet');
    }

    if (metrics.brand_consistency < 0.7) {
      recommendations.push('Use mais palavras preferidas pela marca');
      recommendations.push('Evite termos que não estão alinhados com a voz da marca');
    }

    if (metrics.compliance_score < 0.8) {
      recommendations.push('Revise o conteúdo para garantir conformidade com regulamentações do setor pet');
      recommendations.push('Adicione disclaimers necessários para conteúdo de saúde');
    }

    if (metrics.engagement_potential < 0.6) {
      if (!content.includes('?')) {
        recommendations.push('Inclua uma pergunta para incentivar interação');
      }
      if (!contentData.cta || contentData.cta.length < 5) {
        recommendations.push('Adicione um call-to-action claro e específico');
      }
      if (contentData.channel.includes('instagram') && contentData.hashtags.length < 3) {
        recommendations.push('Adicione mais hashtags relevantes (3-10 para Instagram)');
      }
    }

    return recommendations;
  }

  private identifyStrengths(metrics: QualityMetrics): string[] {
    const strengths: string[] = [];

    if (metrics.readability_score >= 0.8) {
      strengths.push('Excelente legibilidade e clareza');
    }
    if (metrics.relevance_score >= 0.8) {
      strengths.push('Altamente relevante ao tema');
    }
    if (metrics.brand_consistency >= 0.8) {
      strengths.push('Forte alinhamento com a voz da marca');
    }
    if (metrics.compliance_score >= 0.9) {
      strengths.push('Totalmente em conformidade com regulamentações');
    }
    if (metrics.engagement_potential >= 0.7) {
      strengths.push('Alto potencial de engajamento');
    }
    if (metrics.overall_score >= 0.85) {
      strengths.push('Qualidade geral excepcional');
    }

    return strengths;
  }

  private identifyWeaknesses(metrics: QualityMetrics): string[] {
    const weaknesses: string[] = [];

    if (metrics.readability_score < 0.6) {
      weaknesses.push('Legibilidade pode ser melhorada');
    }
    if (metrics.relevance_score < 0.6) {
      weaknesses.push('Relevância ao tema precisa ser aumentada');
    }
    if (metrics.brand_consistency < 0.6) {
      weaknesses.push('Alinhamento com a marca precisa de atenção');
    }
    if (metrics.compliance_score < 0.7) {
      weaknesses.push('Questões de conformidade precisam ser resolvidas');
    }
    if (metrics.engagement_potential < 0.5) {
      weaknesses.push('Potencial de engajamento baixo');
    }

    return weaknesses;
  }
}