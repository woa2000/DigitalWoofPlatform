// Brand Voice Robust Client
// Arquivo: server/services/brand-voice-client.ts

import pRetry from "p-retry";
import { BrandVoiceSchema, type BrandVoice } from "../schemas/brand-voice.schema";

// Circuit Breaker State
const BREAKER = { 
  open: false, 
  fails: 0, 
  openedAt: 0,
  halfOpenAt: 0
};

export class BrandVoiceClient {
  private baseUrl: string;
  
  constructor(baseUrl: string) {
    this.baseUrl = baseUrl;
  }

  async getBrandVoice(id: string, signal?: AbortSignal): Promise<BrandVoice> {
    // Circuit breaker check
    if (BREAKER.open && Date.now() - BREAKER.openedAt < 30_000) {
      throw new Error("circuit-breaker-open");
    }

    const fetchFn = async (): Promise<BrandVoice> => {
      const controller = new AbortController();
      const timeout = setTimeout(() => controller.abort(), 1800); // 1.8s timeout
      
      try {
        const response = await fetch(`${this.baseUrl}/api/brand-voice/${id}`, {
          signal: signal ?? controller.signal,
          headers: {
            'Accept': 'application/json',
            'x-bv-schema': 'v1.0.0'
          }
        });

        if (!response.ok) {
          throw new Error(`http-${response.status}`);
        }

        const data = await response.json();
        const parsed = BrandVoiceSchema.parse(data);
        
        // Reset circuit breaker on success
        BREAKER.fails = 0;
        BREAKER.open = false;
        
        return parsed;
      } finally {
        clearTimeout(timeout);
      }
    };

    try {
      return await pRetry(fetchFn, {
        retries: 2,
        minTimeout: 150,
        maxTimeout: 350,
        onFailedAttempt: (error) => {
          console.log(`Brand Voice API attempt ${error.attemptNumber} failed: ${error.message}`);
        }
      });
    } catch (error) {
      // Update circuit breaker on failure
      BREAKER.fails++;
      if (BREAKER.fails >= 5) {
        BREAKER.open = true;
        BREAKER.openedAt = Date.now();
        console.error(`Circuit breaker opened after ${BREAKER.fails} failures`);
      }
      throw error;
    }
  }

  async validateBrandVoice(data: any): Promise<{ valid: boolean; errors?: string[] }> {
    try {
      BrandVoiceSchema.parse(data);
      return { valid: true };
    } catch (error) {
      return { 
        valid: false, 
        errors: error instanceof Error ? [error.message] : ['Validation failed'] 
      };
    }
  }
}

// Fallback personalização simples
export function personalizeFallback(
  text: string, 
  opts: { tone?: "formal" | "casual" } = {}
): string {
  const tone = opts.tone ?? "casual";
  
  if (tone === "formal") {
    return text
      .replaceAll("vc", "você")
      .replaceAll("pq", "porque")
      .replaceAll("tbm", "também");
  } else {
    return text.concat(" 🐾");
  }
}

// Smoke test function
export async function smokeBrandVoiceAPI(baseUrl: string): Promise<boolean> {
  try {
    const client = new BrandVoiceClient(baseUrl);
    
    // Test 1: GET endpoint with timeout check
    const start = Date.now();
    await client.getBrandVoice("test-id");
    const duration = Date.now() - start;
    
    if (duration > 2000) {
      console.warn(`Brand Voice API slow response: ${duration}ms`);
      return false;
    }

    // Test 2: Validation endpoint
    const validation = await client.validateBrandVoice({
      id: "test",
      version: "v1.0.0",
      tone: "casual"
    });

    return validation.valid || validation.errors?.length === 0;
  } catch (error) {
    console.error('Brand Voice API smoke test failed:', error);
    return false;
  }
}