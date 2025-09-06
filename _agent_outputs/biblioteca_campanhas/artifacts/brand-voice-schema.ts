// Brand Voice Schema Contract
// Arquivo: server/schemas/brand-voice.schema.ts

import { z } from "zod";

export const BrandVoiceSchema = z.object({
  id: z.string().uuid(),
  version: z.string().regex(/^v\d+\.\d+\.\d+$/),
  tone: z.enum(["formal","casual","divertido","técnico"]),
  vocabulary: z.object({
    preferred: z.array(z.string()).max(200),
    avoid: z.array(z.string()).max(200),
  }),
  style_guides: z.array(z.object({
    name: z.string(),
    rules: z.array(z.string())
  })).max(50),
  examples: z.array(z.object({
    input: z.string(),
    output: z.string()
  })).max(50)
});

export type BrandVoice = z.infer<typeof BrandVoiceSchema>;

// Validation helper
export function validateBrandVoice(data: unknown): BrandVoice {
  return BrandVoiceSchema.parse(data);
}