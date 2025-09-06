import { beforeAll, afterAll, afterEach, vi } from 'vitest';
import request from 'supertest';
import express from 'express';
import { BrandVoice } from '../shared/schemas/brand-voice';

// Type definitions for testing
export interface ContentBrief {
  theme: string;
  objective: 'educar' | 'vender' | 'engajar' | 'recall_marca' | 'awareness';
  channel: 'instagram_post' | 'instagram_story' | 'facebook_post' | 'linkedin_post' | 'twitter_post' | 'email' | 'blog' | 'newsletter';
  format: 'texto' | 'video_script' | 'infografico' | 'carrossel' | 'story_sequence' | 'email_template';
  target_audience?: string;
  custom_instructions?: string;
  words_to_avoid?: string[];
  tone_adjustments?: string;
  call_to_action?: string;
  context?: string;
}

export interface BrandVoiceJson {
  version: string;
  brand: {
    name: string;
    industry: string;
    description: string;
    values: string[];
    mission: string;
  };
  voice: {
    tone: string;
    personality: string[];
    lexicon: {
      prefer: string[];
      avoid: string[];
      prohibited: string[];
    };
    communication_style: {
      formality: string;
      complexity: string;
      empathy: string;
    };
  };
  audience: {
    primary: {
      demographics: {
        age_range: string;
        income_level: string;
        location: string;
      };
      psychographics: {
        values: string[];
        interests: string[];
        lifestyle: string;
      };
    };
  };
  guidelines: {
    do: string[];
    dont: string[];
    compliance: {
      sector: string;
      regulations: string[];
      disclaimers_required: boolean;
    };
  };
}

// Create test client for API testing
const app = express();
app.use(express.json());

// Mock API routes for testing
app.post('/api/content/generate', (req, res) => {
  // Mock response - in real tests this would call actual service
  res.json([{
    id: 'test-content-id',
    content_brief: req.body,
    variations: [
      {
        id: 'var-1',
        title: 'Test Title',
        body: 'Test content body with pet care information',
        hashtags: ['#petcare', '#health'],
        tone_analysis: {
          detected_tone: 'professional',
          brand_alignment: 0.85,
          confidence: 0.9
        }
      }
    ],
    quality_metrics: {
      readability_score: 0.85,
      relevance_score: 0.9,
      brand_consistency: 0.88,
      compliance_score: 0.95
    },
    compliance_notes: [],
    engagement_prediction: {
      score: 0.75,
      confidence: 0.8,
      factors: ['educational_content', 'clear_cta'],
      recommendations: ['Add more engaging elements']
    },
    created_at: new Date().toISOString(),
    brand_voice_id: req.body.brand_voice_id
  }]);
});

app.post('/api/content/batch', (req, res) => {
  const { briefs } = req.body;
  const results = briefs.map((brief: any, index: number) => ({
    id: `test-content-${index}`,
    content_brief: brief,
    variations: [
      {
        id: `var-${index}-1`,
        title: `Test Title ${index + 1}`,
        body: `Test content body ${index + 1}`,
        tone_analysis: {
          detected_tone: 'professional',
          brand_alignment: 0.85,
          confidence: 0.9
        }
      }
    ],
    quality_metrics: {
      readability_score: 0.85,
      relevance_score: 0.9,
      brand_consistency: 0.88,
      compliance_score: 0.95
    },
    compliance_notes: [],
    created_at: new Date().toISOString(),
    brand_voice_id: req.body.brand_voice_id
  }));
  res.json(results);
});

export const testClient = request(app);

// Global test setup
global.console = {
  ...console,
  // Suppress logs in tests unless needed
  log: vi.fn(),
  warn: vi.fn(),
  error: vi.fn(),
};

// Test database setup
beforeAll(async () => {
  // Database connection setup for tests
});

afterAll(async () => {
  // Cleanup connections
});

afterEach(async () => {
  // Clean up test data between tests
});

// Test data builders
export function createTestUser(overrides: any = {}) {
  return {
    id: 'test-user-id',
    email: 'test@example.com',
    name: 'Test User',
    ...overrides
  };
}

export function createTestBrandVoice(overrides: Partial<BrandVoice> = {}): BrandVoice {
  return {
    $schema: 'https://digitalwoof.com/schemas/brand-voice/v1.0.json',
    version: '1.0',
    brand: {
      name: 'Test Pet Clinic',
      segment: 'veterinaria',
      businessType: 'clinica',
      mission: 'Providing excellent pet care',
      values: [
        {
          name: 'Care',
          description: 'We care for pets',
          weight: 1.0
        }
      ],
      targetAudience: {
        primary: 'Pet owners seeking quality care',
        personas: ['concerned pet parent'],
        painPoints: ['pet health concerns'],
        goals: ['healthy pets']
      }
    },
    visual: {
      logoUrl: 'https://example.com/logo.png',
      palette: {
        primary: '#007acc',
        secondary: ['#ffffff'],
        neutral: ['#666666']
      },
      typography: {
        primary: 'Arial',
        style: 'professional'
      },
      imagery: {
        style: 'photography',
        mood: 'trustworthy',
        avoid: ['scary images']
      }
    },
    voice: {
      tone: {
        confiança: 0.9,
        acolhimento: 0.8,
        humor: 0.3,
        especialização: 0.9
      },
      persona: {
        description: 'Professional and caring veterinarian',
        characteristics: ['empathetic', 'knowledgeable'],
        communication_style: 'professional'
      },
      lexicon: {
        prefer: ['pet', 'tutor', 'care'],
        avoid: ['animal', 'owner'],
        banned: ['cure guarantee'],
        industry_specific: {
          medical_terms: 'simplified',
          pet_terminology: ['pet', 'tutor']
        }
      },
      style: {
        sentence_length: 'medium',
        paragraph_style: 'scannable',
        use_questions: true,
        use_exclamations: false,
        use_emojis: 'minimal',
        cta_style: {
          preferred: ['Schedule appointment', 'Learn more'],
          urgency_level: 'medium',
          personalization: 'personalized'
        },
        formatting: {
          use_lists: true,
          use_bold: 'moderate',
          use_italics: false,
          use_quotes: false
        }
      }
    },
    compliance: {
      regulatory: {
        medical_claims: 'strict',
        veterinary_advice: 'required_disclaimer',
        medication_mentions: 'with_disclaimer'
      },
      content_policies: {
        claims_policy: 'No cure promises',
        disclaimer_required: true,
        default_disclaimer: 'Consult a veterinarian',
        review_triggers: ['cure', 'guarantee']
      },
      legal: {
        lgpd_compliance: true,
        copyright_policy: 'Original content only',
        user_generated_content: 'moderated'
      }
    },
    channels: {
      social_media: {
        instagram: {
          tone_adjustment: 0.1,
          hashtag_strategy: 'moderate',
          story_style: 'educational'
        },
        facebook: {
          tone_adjustment: 0.0,
          post_length: 'medium',
          engagement_style: 'informational'
        },
        whatsapp: {
          formality_level: 'semi-formal',
          response_style: 'detailed'
        }
      },
      content_types: {
        educational: {
          depth_level: 'intermediate',
          use_examples: true,
          include_sources: true
        },
        promotional: {
          sales_approach: 'consultative',
          urgency_tactics: 'minimal',
          social_proof: 'testimonials'
        },
        customer_service: {
          response_tone: 'helpful',
          problem_solving: 'step_by_step'
        }
      }
    },
    metadata: {
      created_at: '2025-01-01T00:00:00.000Z',
      updated_at: '2025-01-01T00:00:00.000Z',
      version_history: [],
      source: {
        manual_override: true
      },
      quality_metrics: {
        completeness_score: 0.9,
        consistency_score: 0.8,
        specificity_score: 0.9,
        usability_score: 0.8,
        last_validated: '2025-01-01T00:00:00.000Z'
      }
    },
    ...overrides
  };
}

export function createTestContentBrief(overrides: any = {}) {
  return {
    id: 'test-brief-id',
    userId: 'test-user-id',
    brandVoiceId: 'test-brand-voice',
    theme: 'Pet vaccination importance',
    objective: 'educar' as const,
    channel: 'instagram_post' as const,
    urgency: 'medium' as const,
    createdAt: new Date(),
    ...overrides
  };
}

// Mock utilities
export const mockOpenAI = {
  chat: {
    completions: {
      create: vi.fn()
    }
  }
};

export const mockSupabase = {
  from: vi.fn(() => ({
    select: vi.fn().mockReturnThis(),
    insert: vi.fn().mockReturnThis(),
    update: vi.fn().mockReturnThis(),
    delete: vi.fn().mockReturnThis(),
    eq: vi.fn().mockReturnThis(),
    single: vi.fn().mockReturnThis()
  }))
};