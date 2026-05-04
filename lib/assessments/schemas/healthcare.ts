import { z } from 'zod';

const entry = z.object({
  q: z.string(),
  v: z.union([z.string(), z.number(), z.boolean(), z.array(z.string())]),
});

export const healthcareDataSchema = z.record(z.string(), entry);

export type HealthcareData = z.infer<typeof healthcareDataSchema>;
