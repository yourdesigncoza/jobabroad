import { z } from 'zod';

const entry = z.object({
  q: z.string(),
  v: z.union([z.string(), z.number(), z.boolean(), z.array(z.string())]),
});

export const assessmentDataSchema = z.record(z.string(), entry);

export type AssessmentData = z.infer<typeof assessmentDataSchema>;
