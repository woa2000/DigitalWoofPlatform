import dotenv from "dotenv";
dotenv.config();

import OpenAI from "openai";

if (!process.env.OPENAI_API_KEY) {
  throw new Error("OPENAI_API_KEY environment variable must be set");
}

// the newest OpenAI model is "gpt-5" which was released August 7, 2025. do not change this unless explicitly requested by the user
const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

export interface ContentGenerationRequest {
  prompt: string;
  type: string;
  brandVoice?: any;
  businessType?: string;
}

export interface ContentGenerationResponse {
  content: string;
  variations: string[];
  qualityScore: number;
  complianceScore: number;
}

export async function generatePetContent(request: ContentGenerationRequest): Promise<ContentGenerationResponse> {
  const { prompt, type, brandVoice, businessType } = request;

  const systemPrompt = `
    Você é um especialista em marketing para o mercado pet brasileiro.
    
    Contexto do negócio: ${businessType || 'genérico'}
    Tipo de conteúdo: ${type}
    
    ${brandVoice ? `
    Brand Voice JSON:
    - Tom: ${brandVoice.tone}
    - Persona: ${JSON.stringify(brandVoice.persona)}
    - Valores: ${JSON.stringify(brandVoice.values)}
    - Guidelines: ${JSON.stringify(brandVoice.guidelines)}
    ` : ''}
    
    Diretrizes OBRIGATÓRIAS:
    1. NUNCA use termos médicos diagnósticos
    2. SEMPRE inclua disclaimer "consulte um veterinário"
    3. Evite promessas de cura ou tratamento
    4. Use linguagem empática e acolhedora
    5. Foque no bem-estar animal
    
    Gere 3 variações do conteúdo em formato JSON:
    {
      "content": "versão principal",
      "variations": ["variação 1", "variação 2", "variação 3"],
      "qualityScore": 8.5,
      "complianceScore": 9.2
    }
  `;

  try {
    const response = await openai.chat.completions.create({
      model: "gpt-5",
      messages: [
        {
          role: "system",
          content: systemPrompt,
        },
        {
          role: "user",
          content: prompt,
        },
      ],
      response_format: { type: "json_object" },
      temperature: 0.7,
      max_tokens: 1000,
    });

    const result = JSON.parse(response.choices[0].message.content || "{}");
    return {
      content: result.content || "",
      variations: result.variations || [],
      qualityScore: result.qualityScore || 0,
      complianceScore: result.complianceScore || 0,
    };
  } catch (error) {
    console.error("OpenAI generation error:", error);
    throw new Error("Failed to generate content: " + error.message);
  }
}

export async function validateCompliance(content: string, businessType: string): Promise<{
  isCompliant: boolean;
  score: number;
  violations: Array<{
    category: string;
    severity: string;
    message: string;
    suggestion: string;
  }>;
}> {
  const systemPrompt = `
    Você é um especialista em compliance veterinário brasileiro (CFMV).
    
    Analise o conteúdo para violações de compliance:
    
    REGRAS CRÍTICAS:
    1. Proibido: diagnósticos, promessas de cura, termos médicos
    2. Obrigatório: disclaimers veterinários
    3. Segurança: produtos tóxicos, orientações perigosas
    4. Legal: conformidade CFMV/CRMV
    5. Ética: bem-estar animal
    
    Retorne em JSON:
    {
      "isCompliant": boolean,
      "score": number (0-100),
      "violations": [
        {
          "category": "medical|promotional|safety|legal|ethical",
          "severity": "critical|high|medium|low",
          "message": "descrição da violação",
          "suggestion": "como corrigir"
        }
      ]
    }
  `;

  try {
    const response = await openai.chat.completions.create({
      model: "gpt-5",
      messages: [
        {
          role: "system",
          content: systemPrompt,
        },
        {
          role: "user",
          content: `Tipo de negócio: ${businessType}\n\nConteúdo: ${content}`,
        },
      ],
      response_format: { type: "json_object" },
      temperature: 0.1,
    });

    return JSON.parse(response.choices[0].message.content || "{}");
  } catch (error) {
    console.error("Compliance validation error:", error);
    throw new Error("Failed to validate compliance: " + error.message);
  }
}
