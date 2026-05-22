import { z } from 'zod';

export const PatternSchema = z.object({
  id: z.string().regex(/^pat_[a-z0-9_]+$/),
  slug: z.string(),
  name: z.string(),
  questionShapes: z.array(z.string()),
  likelyCategories: z.array(z.string()),
  replyTemplate: z.string(),
  followUp: z.string(),
  upsellHook: z.string(),
  usedBy: z.array(z.string()),
});
export type Pattern = z.infer<typeof PatternSchema>;

export const RuleViolationSchema = z.object({
  rule: z.number().int().min(1).max(5),
  reason: z.string(),
  // 'model'/'regex' are genuine concerns to review before sending.
  // 'auto' is a neutral notice that the system corrected the draft itself
  // (e.g. a missing follow-up question was appended) — not a problem.
  source: z.enum(['model', 'regex', 'auto']),
});
export type RuleViolation = z.infer<typeof RuleViolationSchema>;

export const NewPatternSuggestionSchema = z.object({
  name: z.string(),
  questionShapes: z.array(z.string()),
  replyTemplate: z.string(),
  followUp: z.string(),
  likelyCategories: z.array(z.string()),
});
export type NewPatternSuggestion = z.infer<typeof NewPatternSuggestionSchema>;

export const DraftOutputSchema = z.object({
  matchedPatternId: z.string(),
  matchedPatternName: z.string(),
  draftReply: z.string(),
  followUpQuestion: z.string(),
  ruleViolations: z.array(
    z.object({
      rule: z.number().int().min(1).max(5),
      reason: z.string(),
    }),
  ),
  newPatternSuggestion: NewPatternSuggestionSchema.nullable(),
});
export type DraftOutput = z.infer<typeof DraftOutputSchema>;

const PhoneSchema = z
  .string()
  .regex(/^\d{10,15}$/, 'phone must be 10-15 digits, no symbols');

export const DraftInputSchema = z.object({
  phone: PhoneSchema,
  inboundMessage: z.string().min(1).max(4000),
  priorContext: z.string().max(8000).optional(),
});
export type DraftInput = z.infer<typeof DraftInputSchema>;

const ContactStatusSchema = z.enum([
  'new',
  'replied',
  'qualified',
  'registered',
  'paid',
  'cold',
  'closed',
]);

export const LogInputSchema = z.object({
  phone: PhoneSchema,
  inbound: z.string().min(1),
  draftReply: z.string().min(1),
  matchedPatternId: z.string(),
  matchedPatternName: z.string(),
  followUpQuestion: z.string(),
  status: ContactStatusSchema.optional(),
  categoryInterest: z.string().optional(),
});
export type LogInput = z.infer<typeof LogInputSchema>;

export const AddPatternInputSchema = z.object({
  name: z.string().min(3).max(120),
  questionShapes: z.array(z.string().min(1)).min(1).max(20),
  likelyCategories: z.array(z.string()).min(1),
  replyTemplate: z.string().min(10),
  followUp: z.string().min(3),
  upsellHook: z.string().optional(),
});
export type AddPatternInput = z.infer<typeof AddPatternInputSchema>;

export const DraftApiResponseSchema = DraftOutputSchema.extend({
  ruleViolations: z.array(RuleViolationSchema),
});
export type DraftApiResponse = z.infer<typeof DraftApiResponseSchema>;

export const ThreadTurnSchema = z.object({
  turnNumber: z.number().int().min(1),
  date: z.string(),
  inbound: z.string(),
  matchedPatternName: z.string().nullable(),
  matchedPatternId: z.string().nullable(),
  draftReply: z.string().nullable(),
  followUpLog: z.string().nullable(),
});
export type ThreadTurn = z.infer<typeof ThreadTurnSchema>;

export const ThreadSchema = z.object({
  phone: z.string(),
  exists: z.boolean(),
  status: z.string().nullable(),
  categoryInterest: z.string().nullable(),
  notes: z.string().nullable(),
  turns: z.array(ThreadTurnSchema),
});
export type Thread = z.infer<typeof ThreadSchema>;
