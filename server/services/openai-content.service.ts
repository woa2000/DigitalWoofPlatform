import OpenAI from "openai";
import Bottleneck from "bottleneck";
import { z } from "zod";

// Types and interfaces
export interface GenerationOptions {
  temperature?: number;
  maxTokens?: number;
  model?: string;
  timeout?: number;
}

export interface AIResponse {
  content: string;
  variations: ContentVariation[];
  metadata: GenerationMetadata;
}

export interface ContentVariation {
  id: string;
  title: string;
  body: string;
  cta: string;
  hashtags: string[];
  tone_score: number;
  readability_score: number;
  estimated_performance: number;
}

export interface GenerationMetadata {
  tokens_used: number;
  generation_time_ms: number;
  model_used: string;
  cost_usd: number;
  prompt_version: string;
}

export interface ComplianceCheck {
  score: number;
  flags: ComplianceFlag[];
  suggested_disclaimers: string[];
}

export interface ComplianceFlag {
  type: string;
  severity: 'low' | 'medium' | 'high' | 'critical';
  message: string;
  suggestion: string;
  position?: number;
}

// Validation schemas
const ContentVariationSchema = z.object({
  id: z.string(),
  title: z.string(),
  body: z.string(),
  cta: z.string(),
  hashtags: z.array(z.string()),
  tone_score: z.number().min(0).max(1),
  readability_score: z.number().min(0).max(1),
  estimated_performance: z.number().min(0).max(1)
});

const AIResponseSchema = z.object({
  variations: z.array(ContentVariationSchema).length(3),
  creative_brief: z.object({
    type: z.enum(['photo', 'illustration', 'video', 'carousel']),
    description: z.string(),
    style_notes: z.string(),
    required_elements: z.array(z.string()),
    avoid_elements: z.array(z.string())
  }).optional()
});

/**
 * Enhanced OpenAI Service for Content Generation
 * Implements rate limiting, circuit breaker pattern, cost tracking, and compliance checking
 */
export class OpenAIService {
  private client: OpenAI;
  private limiter: Bottleneck;
  private circuitBreakerFailures = 0;
  private circuitBreakerLastFailure = 0;
  private readonly circuitBreakerThreshold = 5;
  private readonly circuitBreakerResetTime = 300000; // 5 minutes

  constructor() {
    if (!process.env.OPENAI_API_KEY) {
      throw new Error("OPENAI_API_KEY environment variable must be set");
    }

    this.client = new OpenAI({ 
      apiKey: process.env.OPENAI_API_KEY,
      timeout: 30000 // 30 second timeout
    });

    // Rate limiting configuration
    this.limiter = new Bottleneck({
      minTime: 100, // Minimum 100ms between requests
      reservoir: 60, // 60 requests per minute
      reservoirRefreshInterval: 60_000, // Refresh every minute
      reservoirRefreshAmount: 60,
      maxConcurrent: 5 // Maximum 5 concurrent requests
    });
  }

  /**
   * Generate content with multiple variations
   */
  async generateContent(
    prompt: string, 
    options: GenerationOptions = {}
  ): Promise<AIResponse> {
    const startTime = Date.now();
    
    try {
      await this.checkCircuitBreaker();
      
      const response = await this.limiter.schedule(async () => {
        return await this.client.chat.completions.create({
          model: options.model || 'gpt-4',
          messages: [
            {
              role: "system",
              content: this.buildSystemPrompt()
            },
            {
              role: "user", 
              content: prompt
            }
          ],
          response_format: { type: "json_object" },
          temperature: options.temperature || 0.7,
          max_tokens: options.maxTokens || 1500
        });
      });

      const content = response.choices[0].message.content || "{}";
      const parsed = this.parseAndValidateResponse(content);
      
      // Reset circuit breaker on success
      this.circuitBreakerFailures = 0;
      
      return {
        content: parsed.variations[0].body,
        variations: parsed.variations,
        metadata: {
          tokens_used: response.usage?.total_tokens || 0,
          generation_time_ms: Date.now() - startTime,
          model_used: response.model,
          cost_usd: this.calculateCost(response.usage?.total_tokens || 0, response.model),
          prompt_version: "v1.0"
        }
      };

    } catch (error) {
      this.handleError(error);
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      throw new Error(`Content generation failed: ${errorMessage}`);
    }
  }

  /**
   * Validate content for health claims and compliance
   */
  async validateHealthClaims(content: string): Promise<ComplianceCheck> {
    try {
      await this.checkCircuitBreaker();
      
      const response = await this.limiter.schedule(async () => {
        return await this.client.chat.completions.create({
          model: 'gpt-4',
          messages: [
            {
              role: "system",
              content: this.buildCompliancePrompt()
            },
            {
              role: "user",
              content: `Analise este conteúdo para compliance veterinário:\n\n${content}`
            }
          ],
          response_format: { type: "json_object" },
          temperature: 0.1,
          max_tokens: 1000
        });
      });

      const result = JSON.parse(response.choices[0].message.content || "{}");
      
      return {
        score: result.score || 0,
        flags: result.flags || [],
        suggested_disclaimers: result.suggested_disclaimers || []
      };

    } catch (error) {
      this.handleError(error);
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      throw new Error(`Compliance validation failed: ${errorMessage}`);
    }
  }

  /**
   * Build specialized system prompt for pet industry content
   */
  private buildSystemPrompt(): string {
    return `
Você é um especialista em marketing para o setor pet brasileiro, especializado em criar conteúdo de alta qualidade que mantém consistência de marca e compliance regulatório.

INSTRUÇÕES DE GERAÇÃO:
1. Gere EXATAMENTE 3 variações de conteúdo
2. Cada variação deve ter título, corpo, CTA e hashtags
3. Varie a abordagem: educativa, emocional, promocional
4. Mantenha tom consistente entre variações
5. Calcule scores realistas para cada variação

COMPLIANCE OBRIGATÓRIO:
- NUNCA prometa cura ou tratamento médico
- EVITE termos médicos diagnósticos
- USE "tutor" ao invés de "dono"
- INCLUA disclaimers quando necessário
- FOQUE no bem-estar animal

FORMATO DE RESPOSTA (JSON):
{
  "variations": [
    {
      "id": "var_1",
      "title": "Título chamativo (máx 60 chars)",
      "body": "Corpo do conteúdo (200-500 chars)",
      "cta": "Call to action (máx 30 chars)",
      "hashtags": ["#hashtag1", "#hashtag2", "#hashtag3"],
      "tone_score": 0.85,
      "readability_score": 0.78,
      "estimated_performance": 0.72
    }
    // ... mais 2 variações
  ],
  "creative_brief": {
    "type": "photo",
    "description": "Descrição da imagem sugerida",
    "style_notes": "Estilo visual recomendado",
    "required_elements": ["elemento1", "elemento2"],
    "avoid_elements": ["evitar1", "evitar2"]
  }
}
`;
  }

  /**
   * Build compliance validation prompt
   */
  private buildCompliancePrompt(): string {
    return `
Você é um especialista em compliance veterinário brasileiro (CFMV/CRMV).

Analise o conteúdo para:
1. Claims médicos proibidos
2. Promessas de cura/tratamento  
3. Termos técnicos inadequados
4. Necessidade de disclaimers
5. Conformidade com regulações pet

RETORNE EM JSON:
{
  "score": 0.95,
  "flags": [
    {
      "type": "health_claim",
      "severity": "high",
      "message": "Descrição da violação",
      "suggestion": "Como corrigir",
      "position": 45
    }
  ],
  "suggested_disclaimers": [
    "Este conteúdo é apenas informativo. Consulte sempre um veterinário."
  ]
}
`;
  }

  /**
   * Parse and validate OpenAI response
   */
  private parseAndValidateResponse(content: string): any {
    try {
      const parsed = JSON.parse(content);
      const validated = AIResponseSchema.parse(parsed);
      return validated;
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      throw new Error(`Invalid OpenAI response format: ${errorMessage}`);
    }
  }

  /**
   * Calculate cost based on token usage
   */
  private calculateCost(tokens: number, model: string): number {
    const costPerToken = model.includes('gpt-4') ? 0.00003 : 0.000002; // USD per token
    return tokens * costPerToken;
  }

  /**
   * Circuit breaker pattern implementation
   */
  private async checkCircuitBreaker(): Promise<void> {
    if (this.circuitBreakerFailures >= this.circuitBreakerThreshold) {
      const timeSinceLastFailure = Date.now() - this.circuitBreakerLastFailure;
      if (timeSinceLastFailure < this.circuitBreakerResetTime) {
        throw new Error('Circuit breaker open - OpenAI service temporarily unavailable');
      } else {
        // Reset circuit breaker
        this.circuitBreakerFailures = 0;
      }
    }
  }

  /**
   * Handle errors and update circuit breaker
   */
  private handleError(error: unknown): void {
    this.circuitBreakerFailures++;
    this.circuitBreakerLastFailure = Date.now();
    
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    console.error('OpenAI Service Error:', {
      message: errorMessage,
      failures: this.circuitBreakerFailures,
      timestamp: new Date().toISOString()
    });
  }

  /**
   * Get service health status
   */
  getHealthStatus() {
    return {
      circuit_breaker_failures: this.circuitBreakerFailures,
      circuit_breaker_open: this.circuitBreakerFailures >= this.circuitBreakerThreshold,
      limiter_queued: this.limiter.queued(),
      limiter_running: this.limiter.running()
    };
  }
}

// Export singleton instance
export const openaiService = new OpenAIService();