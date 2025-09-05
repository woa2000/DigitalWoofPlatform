import { z } from 'zod';

/**
 * URL Validation Schema using Zod
 * Validates format and basic security rules
 */
export const urlValidationSchema = z.string()
  .url('URL deve ter formato válido (http:// ou https://)')
  .min(1, 'URL não pode estar vazia')
  .max(2048, 'URL muito longa (máximo 2048 caracteres)')
  .refine((url) => {
    try {
      const parsed = new URL(url);
      // Block dangerous protocols
      return ['http:', 'https:'].includes(parsed.protocol);
    } catch {
      return false;
    }
  }, 'URL deve usar protocolo HTTP ou HTTPS')
  .refine((url) => {
    try {
      const parsed = new URL(url);
      // Block localhost and private IPs in production
      const hostname = parsed.hostname.toLowerCase();
      const blockedHosts = [
        'localhost',
        '127.0.0.1',
        '0.0.0.0',
        '::1'
      ];
      
      // Allow localhost in development
      if (process.env.NODE_ENV === 'development') {
        return true;
      }
      
      return !blockedHosts.includes(hostname) && 
             !hostname.startsWith('192.168.') &&
             !hostname.startsWith('10.') &&
             !hostname.startsWith('172.');
    } catch {
      return false;
    }
  }, 'URL não pode apontar para endereços locais ou privados');

/**
 * Social URLs validation schema
 * Validates array of social media URLs with maximum limit
 */
export const socialUrlsValidationSchema = z.array(urlValidationSchema)
  .max(10, 'Máximo 10 URLs de redes sociais permitidas')
  .optional()
  .default([]);

/**
 * Complete anamnesis request validation schema
 */
export const createAnamnesisSchema = z.object({
  primaryUrl: urlValidationSchema,
  socialUrls: socialUrlsValidationSchema,
  metadata: z.object({
    userAgent: z.string().optional(),
    requestId: z.string().uuid('Request ID deve ser um UUID válido')
  }).optional()
});

/**
 * Validates a single URL and returns validation result
 */
export function validateUrl(url: string): { 
  isValid: boolean; 
  error?: string; 
  sanitized?: string 
} {
  try {
    const result = urlValidationSchema.parse(url);
    return {
      isValid: true,
      sanitized: result
    };
  } catch (error) {
    if (error instanceof z.ZodError) {
      return {
        isValid: false,
        error: error.errors[0]?.message || 'URL inválida'
      };
    }
    return {
      isValid: false,
      error: 'Erro inesperado na validação'
    };
  }
}

/**
 * Validates an array of social URLs
 */
export function validateSocialUrls(urls: string[]): {
  isValid: boolean;
  validUrls: string[];
  invalidUrls: Array<{ url: string; error: string }>;
  errors?: string[];
} {
  try {
    const result = socialUrlsValidationSchema.parse(urls);
    return {
      isValid: true,
      validUrls: result,
      invalidUrls: []
    };
  } catch (error) {
    if (error instanceof z.ZodError) {
      const validUrls: string[] = [];
      const invalidUrls: Array<{ url: string; error: string }> = [];
      
      // Validate each URL individually to get specific errors
      urls.forEach((url, index) => {
        const validation = validateUrl(url);
        if (validation.isValid && validation.sanitized) {
          validUrls.push(validation.sanitized);
        } else {
          invalidUrls.push({
            url,
            error: validation.error || 'URL inválida'
          });
        }
      });
      
      return {
        isValid: false,
        validUrls,
        invalidUrls,
        errors: error.errors.map(e => e.message)
      };
    }
    return {
      isValid: false,
      validUrls: [],
      invalidUrls: urls.map(url => ({ url, error: 'Erro inesperado na validação' })),
      errors: ['Erro inesperado na validação']
    };
  }
}

/**
 * Validates complete anamnesis request
 */
export function validateAnamnesisRequest(data: unknown): {
  isValid: boolean;
  data?: z.infer<typeof createAnamnesisSchema>;
  errors?: string[];
} {
  try {
    const result = createAnamnesisSchema.parse(data);
    return {
      isValid: true,
      data: result
    };
  } catch (error) {
    if (error instanceof z.ZodError) {
      return {
        isValid: false,
        errors: error.errors.map(e => `${e.path.join('.')}: ${e.message}`)
      };
    }
    return {
      isValid: false,
      errors: ['Erro inesperado na validação']
    };
  }
}

// Export types
export type CreateAnamnesisRequest = z.infer<typeof createAnamnesisSchema>;
export type ValidationResult = ReturnType<typeof validateUrl>;
export type SocialUrlsValidationResult = ReturnType<typeof validateSocialUrls>;
export type AnamnesisValidationResult = ReturnType<typeof validateAnamnesisRequest>;