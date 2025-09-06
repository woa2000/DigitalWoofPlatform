import {
  AnalysisRequest,
  AnalysisResult,
  AnamnesisFindings,
  AnalysisMetadata,
  MockEngineConfig,
  AnalysisSource
} from '../../shared/types/anamnesis.js';
import mockData from '../fixtures/mock-analysis-results.json';
import { openai, withOpenAILimit } from './openai.js';
import axios from 'axios';

/**
 * Mock Analysis Engine
 * Simulates AI-powered analysis of digital presence
 * Returns structured data compatible with future OpenAI integration
 */
export class AnamnesisAgentService {
  private config: MockEngineConfig;

  constructor(config: Partial<MockEngineConfig> = {}) {
    this.config = {
      processingTimeMs: config.processingTimeMs ?? 45000, // 45 seconds default
      enableRandomness: config.enableRandomness ?? true,
      errorRate: config.errorRate ?? 0.05, // 5% error rate
      dataQualityVariation: config.dataQualityVariation ?? 0.2 // 20% variation
    };
  }

  /**
   * Analyzes digital presence using AI and real data
   * Falls back to mock data if AI analysis fails
   */
  async analyzeDigitalPresence(request: AnalysisRequest): Promise<AnalysisResult> {
    const startTime = Date.now();

    try {
      // Simulate random errors based on error rate
      if (this.config.enableRandomness && Math.random() < this.config.errorRate) {
        throw new Error('Simulated analysis error - service temporarily unavailable');
      }

      // Try AI-powered analysis first
      let findings: AnamnesisFindings;
      let aiAnalysisSuccessful = false;

      try {
        findings = await this.performAIAnalysis(request);
        aiAnalysisSuccessful = true;
        console.log('AI analysis completed successfully');
      } catch (aiError) {
        console.warn('AI analysis failed, falling back to mock data:', aiError);
        // Fallback to mock data
        const businessType = this.detectBusinessType(request.primaryUrl, request.socialUrls);
        findings = this.generateFindings(businessType, request.sources);
      }

      // Simulate processing time
      await this.simulateProcessingTime();

      // Calculate completeness score
      const scoreCompleteness = this.calculateCompletenessScore(request.sources, findings);

      // Generate metadata
      const metadata = this.generateMetadata(startTime, request.sources, findings);
      if (!aiAnalysisSuccessful) {
        metadata.warnings = metadata.warnings || [];
        metadata.warnings.push('Analysis used fallback mock data due to AI service unavailability');
        metadata.limitations = metadata.limitations || [];
        metadata.limitations.push('Mock data used - results may not reflect actual website content');
      }

      return {
        id: request.requestId,
        status: 'done',
        scoreCompleteness,
        findings,
        sources: request.sources.map(source => ({
          ...source,
          status: 'fetched',
          lastFetchedAt: new Date()
        })),
        metadata,
        createdAt: new Date(startTime),
        updatedAt: new Date()
      };

    } catch (error) {
      const endTime = Date.now();

      return {
        id: request.requestId,
        status: 'error',
        scoreCompleteness: 0,
        findings: this.getEmptyFindings(),
        sources: request.sources.map(source => ({
          ...source,
          status: 'error',
          errorMessage: 'Analysis failed'
        })),
        metadata: {
          startedAt: new Date(startTime),
          completedAt: new Date(endTime),
          duration: endTime - startTime,
          sourceCount: request.sources.length,
          dataPoints: 0,
          confidence: 0,
          warnings: ['Analysis failed due to processing error'],
          limitations: ['No data could be extracted']
        },
        errorMessage: error instanceof Error ? error.message : 'Unknown error occurred',
        createdAt: new Date(startTime),
        updatedAt: new Date()
      };
    }
  }

  /**
   * Analyzes a URL using AI and web scraping
   */
  private async analyzeUrlWithAI(url: string, type: 'site' | 'social'): Promise<any> {
    try {
      // Try to fetch basic content from the URL
      const content = await this.scrapeUrlContent(url);

      // Use AI to analyze the content
      const analysisPrompt = `
        Analise o seguinte conteúdo de ${type === 'site' ? 'website' : 'rede social'} e forneça insights estruturados:

        URL: ${url}
        Tipo: ${type}
        Conteúdo coletado: ${content}

        Forneça análise em JSON com as seguintes seções:
        {
          "identity": {
            "score": number (0-100),
            "findings": ["array de descobertas"],
            "recommendations": ["array de recomendações"]
          },
          "ux": {
            "navigation": {"score": number, "issues": [], "strengths": []},
            "content": {"score": number, "readability": number},
            "conversion": {"score": number, "ctaPresence": boolean},
            "mobile": {"score": number, "responsive": boolean}
          },
          "ecosystem": {
            "socialPresence": [{"platform": "string", "followers": number}],
            "competitors": []
          }
        }
      `;

      const response = await withOpenAILimit(() =>
        openai.chat.completions.create({
          model: "gpt-4",
          messages: [
            {
              role: "system",
              content: "Você é um especialista em análise de presença digital. Forneça análises precisas e estruturadas em formato JSON."
            },
            {
              role: "user",
              content: analysisPrompt
            }
          ],
          response_format: { type: "json_object" },
          temperature: 0.3,
          max_tokens: 2000
        })
      );

      return JSON.parse(response.choices[0].message.content || "{}");
    } catch (error) {
      console.warn(`Failed to analyze URL ${url} with AI:`, error);
      return null;
    }
  }

  /**
   * Scrapes basic content from a URL
   */
  private async scrapeUrlContent(url: string): Promise<string> {
    try {
      const response = await axios.get(url, {
        timeout: 10000,
        headers: {
          'User-Agent': 'Mozilla/5.0 (compatible; DigitalWoof/1.0; +https://digitalwoof.com/bot)'
        }
      });

      // Extract basic information from HTML
      const html = response.data;
      const title = html.match(/<title[^>]*>([^<]+)<\/title>/i)?.[1] || '';
      const metaDescription = html.match(/<meta[^>]*name=["']description["'][^>]*content=["']([^"']+)["'][^>]*>/i)?.[1] || '';
      const headings = html.match(/<h[1-6][^>]*>([^<]+)<\/h[1-6]>/gi) || [];
      const links = html.match(/<a[^>]*href=["']([^"']+)["'][^>]*>([^<]+)<\/a>/gi) || [];

      return `
        Title: ${title}
        Description: ${metaDescription}
        Headings: ${headings.slice(0, 5).join(', ')}
        Links: ${links.slice(0, 10).length} links found
        Content Length: ${html.length} characters
      `.trim();
    } catch (error) {
      console.warn(`Failed to scrape ${url}:`, error);
      return `Unable to access content from ${url}`;
    }
  }

  /**
    * Simulates processing time with some randomness
    */
   private async simulateProcessingTime(): Promise<void> {
     let delay = this.config.processingTimeMs;

     if (this.config.enableRandomness) {
       // Add ±25% randomness to processing time
       const variation = delay * 0.25;
       delay = delay + (Math.random() - 0.5) * 2 * variation;
     }

     // Ensure minimum 5 seconds, maximum 2 minutes
     delay = Math.max(5000, Math.min(120000, delay));

     return new Promise(resolve => setTimeout(resolve, delay));
   }

  /**
   * Detects business type based on URL patterns and content
   */
  private detectBusinessType(primaryUrl: string, socialUrls: string[]): string {
    const url = primaryUrl.toLowerCase();
    const allUrls = [url, ...socialUrls.map(u => u.toLowerCase())].join(' ');

    // Simple keyword-based detection
    if (allUrls.includes('veterinar') || allUrls.includes('vet') || allUrls.includes('clinica')) {
      return 'petVeterinary';
    }
    
    if (allUrls.includes('petshop') || allUrls.includes('pet-shop') || allUrls.includes('loja')) {
      return 'petShop';
    }
    
    return 'genericBusiness';
  }

  /**
   * Performs AI-powered analysis of all sources
   */
  private async performAIAnalysis(request: AnalysisRequest): Promise<AnamnesisFindings> {
    const { primaryUrl, socialUrls, sources } = request;

    // Analyze primary URL
    const primaryAnalysis = await this.analyzeUrlWithAI(primaryUrl, 'site');

    // Analyze social URLs
    const socialAnalyses = await Promise.all(
      socialUrls.map(url => this.analyzeUrlWithAI(url, 'social'))
    );

    // Combine analyses using AI
    const combinedAnalysis = await this.combineAnalysesWithAI(primaryAnalysis, socialAnalyses, sources);

    return this.ensureCompleteFindingsStructure(combinedAnalysis);
  }

  /**
   * Combines multiple URL analyses into comprehensive findings
   */
  private async combineAnalysesWithAI(primaryAnalysis: any, socialAnalyses: any[], sources: AnalysisSource[]): Promise<Partial<AnamnesisFindings>> {
    const analysisData = {
      primary: primaryAnalysis,
      social: socialAnalyses.filter(a => a !== null),
      sources: sources
    };

    const combinePrompt = `
      Combine as seguintes análises de presença digital em um relatório estruturado de 8 seções:

      Dados de análise: ${JSON.stringify(analysisData, null, 2)}

      Gere um relatório completo em JSON com as seguintes seções obrigatórias:
      {
        "identity": {
          "score": number (0-100),
          "findings": ["array de descobertas sobre identidade da marca"],
          "recommendations": ["array de recomendações"],
          "confidence": "high|medium|low"
        },
        "personas": {
          "primaryPersona": {
            "name": "string",
            "age": "string",
            "profile": "string",
            "needs": ["array"],
            "painPoints": ["array"]
          },
          "secondaryPersonas": [{"name": "string", "profile": "string"}],
          "insights": ["array de insights sobre público"]
        },
        "ux": {
          "navigation": {"score": number, "issues": [], "strengths": []},
          "content": {"score": number, "readability": number, "engagement": []},
          "conversion": {"score": number, "ctaPresence": boolean, "trustSignals": []},
          "mobile": {"score": number, "responsive": boolean, "issues": []}
        },
        "ecosystem": {
          "socialPresence": [{"platform": "string", "handle": "string", "followers": number, "engagement": number}],
          "competitors": [{"name": "string", "url": "string", "strengths": [], "opportunities": []}],
          "marketPosition": {"category": "string", "differentiation": [], "threats": []}
        },
        "actionPlan": {
          "immediate": [{"action": "string", "priority": "high|medium|low", "effort": "small|medium|large", "impact": "high|medium|low", "timeline": "string"}],
          "shortTerm": [{"action": "string", "priority": "string", "effort": "string", "impact": "string", "timeline": "string"}],
          "longTerm": [{"action": "string", "priority": "string", "effort": "string", "impact": "string", "timeline": "string"}]
        },
        "roadmap": {
          "phases": [{"name": "string", "duration": "string", "objectives": [], "deliverables": [], "risks": []}],
          "milestones": [{"name": "string", "date": "string", "criteria": [], "responsible": "string"}],
          "budget": {"total": number, "breakdown": [{"category": "string", "amount": number}]}
        },
        "homeAnatomy": {
          "structure": {
            "header": {"logo": boolean, "navigation": [], "contact": boolean, "cta": boolean},
            "hero": {"headline": "string", "subheadline": "string", "cta": "string", "media": "image|video|none"},
            "sections": [{"type": "string", "purpose": "string", "effectiveness": number}],
            "footer": {"links": [], "contact": boolean, "social": []}
          },
          "performance": {"loadTime": number, "mobileOptimized": boolean, "seoScore": number, "accessibilityScore": number}
        },
        "questions": {
          "brandStrategy": [{"question": "string", "importance": "critical|important|medium", "rationale": "string"}],
          "contentStrategy": [{"question": "string", "importance": "string", "rationale": "string"}],
          "technical": [{"question": "string", "importance": "string", "rationale": "string"}],
          "business": [{"question": "string", "importance": "string", "rationale": "string"}]
        }
      }

      Seja específico e baseie suas recomendações nos dados reais analisados.
    `;

    const response = await withOpenAILimit(() =>
      openai.chat.completions.create({
        model: "gpt-4",
        messages: [
          {
            role: "system",
            content: "Você é um especialista em análise de presença digital. Forneça análises abrangentes e acionáveis baseadas em dados reais."
          },
          {
            role: "user",
            content: combinePrompt
          }
        ],
        response_format: { type: "json_object" },
        temperature: 0.4,
        max_tokens: 4000
      })
    );

    return JSON.parse(response.choices[0].message.content || "{}");
  }

  /**
   * Generates analysis findings based on business type and sources
   */
  private generateFindings(businessType: string, sources: AnalysisSource[]): AnamnesisFindings {
    // Get base template from mock data
    const template = mockData[businessType as keyof typeof mockData] || mockData.genericBusiness;
    
    // Clone and customize based on sources
    const findings = JSON.parse(JSON.stringify(template)) as Partial<AnamnesisFindings>;
    
    // Apply variations based on sources and randomness
    if (this.config.enableRandomness) {
      this.applySourceBasedVariations(findings, sources);
      this.applyRandomVariations(findings);
    }
    
    // Ensure all required sections exist
    return this.ensureCompleteFindingsStructure(findings);
  }

  /**
   * Applies variations based on number and type of sources
   */
  private applySourceBasedVariations(findings: Partial<AnamnesisFindings>, sources: AnalysisSource[]): void {
    const socialCount = sources.filter(s => s.type === 'social').length;
    const siteCount = sources.filter(s => s.type === 'site').length;
    
    // Adjust scores based on data availability
    if (findings.identity) {
      findings.identity.score = Math.min(100, findings.identity.score + (socialCount * 5) + (siteCount * 10));
    }
    
    if (findings.ecosystem && socialCount > 0) {
      // Add more social presence data if sources are available
      findings.ecosystem.socialPresence = findings.ecosystem.socialPresence.slice(0, socialCount);
    }
  }

  /**
   * Applies random variations to scores and data quality
   */
  private applyRandomVariations(findings: Partial<AnamnesisFindings>): void {
    const variation = this.config.dataQualityVariation;
    
    // Apply variation to scores
    if (findings.identity) {
      findings.identity.score = this.varyScore(findings.identity.score, variation);
    }
    
    if (findings.ux) {
      findings.ux.navigation.score = this.varyScore(findings.ux.navigation.score, variation);
      findings.ux.content.score = this.varyScore(findings.ux.content.score, variation);
      findings.ux.conversion.score = this.varyScore(findings.ux.conversion.score, variation);
      findings.ux.mobile.score = this.varyScore(findings.ux.mobile.score, variation);
    }
  }

  /**
   * Applies variation to a score within reasonable bounds
   */
  private varyScore(score: number, variation: number): number {
    const change = (Math.random() - 0.5) * 2 * variation * score;
    return Math.max(0, Math.min(100, Math.round(score + change)));
  }

  /**
   * Calculates completeness score based on available data
   */
  private calculateCompletenessScore(sources: AnalysisSource[], findings: AnamnesisFindings): number {
    let score = 0;
    
    // Base score from sources
    score += sources.length * 10; // 10 points per source
    
    // Bonus for social media presence
    const socialCount = sources.filter(s => s.type === 'social').length;
    score += socialCount * 5;
    
    // Adjust based on findings quality
    if (findings.identity?.score) {
      score += findings.identity.score * 0.3;
    }
    
    if (findings.ux) {
      const avgUxScore = (
        findings.ux.navigation.score + 
        findings.ux.content.score + 
        findings.ux.conversion.score + 
        findings.ux.mobile.score
      ) / 4;
      score += avgUxScore * 0.2;
    }
    
    // Apply randomness if enabled
    if (this.config.enableRandomness) {
      score = this.varyScore(score, 0.1);
    }
    
    return Math.max(0, Math.min(100, Math.round(score)));
  }

  /**
   * Generates analysis metadata
   */
  private generateMetadata(startTime: number, sources: AnalysisSource[], findings: AnamnesisFindings): AnalysisMetadata {
    const endTime = Date.now();
    const duration = endTime - startTime;
    
    // Calculate data points based on findings
    let dataPoints = 0;
    dataPoints += findings.identity?.findings.length || 0;
    dataPoints += findings.ux ? Object.keys(findings.ux).length * 3 : 0;
    dataPoints += findings.ecosystem?.socialPresence.length || 0;
    dataPoints += findings.actionPlan ? 
      (findings.actionPlan.immediate?.length || 0) + 
      (findings.actionPlan.shortTerm?.length || 0) + 
      (findings.actionPlan.longTerm?.length || 0) : 0;
    
    // Calculate confidence based on data quality
    let confidence = 75; // Base confidence
    if (sources.length > 3) confidence += 10;
    if (sources.filter(s => s.type === 'social').length > 1) confidence += 10;
    if (this.config.enableRandomness) {
      confidence = this.varyScore(confidence, 0.15);
    }
    
    const warnings: string[] = [];
    const limitations: string[] = [];
    
    // Add warnings based on data quality
    if (sources.length < 2) {
      warnings.push('Limited data sources - analysis may be incomplete');
    }
    
    if (sources.filter(s => s.type === 'social').length === 0) {
      warnings.push('No social media data available - ecosystem analysis limited');
    }
    
    // Add standard limitations
    limitations.push('Analysis based on publicly available data only');
    limitations.push('Mock engine - results are simulated for development purposes');
    
    return {
      startedAt: new Date(startTime),
      completedAt: new Date(endTime),
      duration,
      sourceCount: sources.length,
      dataPoints,
      confidence: Math.max(0, Math.min(100, confidence)),
      warnings,
      limitations
    };
  }

  /**
   * Ensures all required sections exist in findings
   */
  private ensureCompleteFindingsStructure(findings: Partial<AnamnesisFindings>): AnamnesisFindings {
    return {
      identity: findings.identity || this.getEmptyIdentitySection(),
      personas: findings.personas || this.getEmptyPersonasSection(),
      ux: findings.ux || this.getEmptyUXSection(),
      ecosystem: findings.ecosystem || this.getEmptyEcosystemSection(),
      actionPlan: findings.actionPlan || this.getEmptyActionPlanSection(),
      roadmap: findings.roadmap || this.getEmptyRoadmapSection(),
      homeAnatomy: findings.homeAnatomy || this.getEmptyHomeAnatomySection(),
      questions: findings.questions || this.getEmptyQuestionsSection()
    };
  }

  /**
   * Returns empty findings structure for error cases
   */
  private getEmptyFindings(): AnamnesisFindings {
    return {
      identity: this.getEmptyIdentitySection(),
      personas: this.getEmptyPersonasSection(),
      ux: this.getEmptyUXSection(),
      ecosystem: this.getEmptyEcosystemSection(),
      actionPlan: this.getEmptyActionPlanSection(),
      roadmap: this.getEmptyRoadmapSection(),
      homeAnatomy: this.getEmptyHomeAnatomySection(),
      questions: this.getEmptyQuestionsSection()
    };
  }

  // Empty section generators
  private getEmptyIdentitySection() {
    return {
      score: 0,
      findings: [],
      recommendations: [],
      confidence: 'low' as const
    };
  }

  private getEmptyPersonasSection() {
    return {
      primaryPersona: {
        name: '',
        age: '',
        profile: '',
        needs: [],
        painPoints: []
      },
      secondaryPersonas: [],
      insights: []
    };
  }

  private getEmptyUXSection() {
    return {
      navigation: { score: 0, issues: [], strengths: [] },
      content: { score: 0, readability: 0, engagement: [] },
      conversion: { score: 0, ctaPresence: false, trustSignals: [] },
      mobile: { score: 0, responsive: false, issues: [] }
    };
  }

  private getEmptyEcosystemSection() {
    return {
      socialPresence: [],
      competitors: [],
      marketPosition: {
        category: '',
        differentiation: [],
        threats: []
      }
    };
  }

  private getEmptyActionPlanSection() {
    return {
      immediate: [],
      shortTerm: [],
      longTerm: []
    };
  }

  private getEmptyRoadmapSection() {
    return {
      phases: [],
      milestones: [],
      budget: {
        total: 0,
        breakdown: []
      }
    };
  }

  private getEmptyHomeAnatomySection() {
    return {
      structure: {
        header: { logo: false, navigation: [], contact: false, cta: false },
        hero: { headline: '', subheadline: '', cta: '', media: 'none' as const },
        sections: [],
        footer: { links: [], contact: false, social: [] }
      },
      performance: {
        loadTime: 0,
        mobileOptimized: false,
        seoScore: 0,
        accessibilityScore: 0
      }
    };
  }

  private getEmptyQuestionsSection() {
    return {
      brandStrategy: [],
      contentStrategy: [],
      technical: [],
      business: []
    };
  }

  /**
   * Updates processing configuration
   */
  updateConfig(newConfig: Partial<MockEngineConfig>): void {
    this.config = { ...this.config, ...newConfig };
  }

  /**
   * Gets current configuration
   */
  getConfig(): MockEngineConfig {
    return { ...this.config };
  }
}