import 'server-only';
import OpenAI from 'openai';
import { createClient } from '@supabase/supabase-js';
import type { DimensionResult, ScoreResult } from './types';

const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY ?? '' });

function admin() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    { auth: { persistSession: false } },
  );
}

export interface CachedNarratives {
  whatsWorking: string;
  whatsBlocking: string;
  generatedAt: string;
}

/**
 * Reads cached narratives for a submitted assessment, or generates + writes
 * them on miss. Two LLM calls run in parallel on cold, ~0ms read on warm.
 *
 * Since submitted assessment answers are immutable, the cache is safe to
 * trust until the user re-submits — which the wizard should signal by
 * nulling assessments.cached_narratives on the new submission.
 *
 * Errors during generation fall back to the same raw-rule prose the LLM
 * helpers produce as their own fallback, and DON'T write to cache (so the
 * next request retries). Failure mode: slow but never broken.
 */
export async function getOrGenerateNarratives(
  assessmentId: string,
  score: ScoreResult,
  category: string,
): Promise<CachedNarratives> {
  const sb = admin();

  const { data: row } = await sb
    .from('assessments')
    .select('cached_narratives')
    .eq('id', assessmentId)
    .single();

  const cached = row?.cached_narratives as CachedNarratives | null | undefined;
  if (cached?.whatsWorking && cached?.whatsBlocking) return cached;

  const [whatsWorking, whatsBlocking] = await Promise.all([
    generateWhatsWorking(score, category),
    generateWhatsBlocking(score, category),
  ]);

  const next: CachedNarratives = {
    whatsWorking,
    whatsBlocking,
    generatedAt: new Date().toISOString(),
  };

  // Best-effort write — if Supabase blips, we just re-generate next visit.
  await sb
    .from('assessments')
    .update({ cached_narratives: next })
    .eq('id', assessmentId);

  return next;
}

function topDims(score: ScoreResult, n = 2): DimensionResult[] {
  return [...score.dimensions].sort((a, b) => b.score - a.score).slice(0, n);
}

function bottomDims(score: ScoreResult, n = 2): DimensionResult[] {
  return [...score.dimensions].sort((a, b) => a.score - b.score).slice(0, n);
}

const PROSE_SYSTEM = `You write one short paragraph (max 80 words, single paragraph) for a South African work-abroad assessment report. Name the dimensions explicitly. Cite the rule reasons near-verbatim, but smooth them into natural prose.

Write exactly like a natural, smart human having a conversation. Be clear, concise, and direct. Vary your sentence lengths. Never, under any circumstances, use em dashes (—). Instead, use commas, periods, parentheses, or colons.

No hedging ("might", "could", "should consider"). No new facts. Return JSON: { "paragraph": "..." }`;

/**
 * Two-to-three sentence narrative of the buyer's strongest dimensions.
 * Falls back to a concatenation of top-rule reasons if OpenAI is unavailable.
 * Used by both the PDF generator and the public /score page so the messaging
 * stays consistent — what the buyer sees on screen matches the PDF.
 */
export async function generateWhatsWorking(
  score: ScoreResult,
  category: string,
): Promise<string> {
  const top = topDims(score, 2);
  const findings = top.map((d) => ({
    dimension: d.label,
    score: d.score,
    top_rules: [...d.contributing]
      .sort((a, b) => b.points - a.points)
      .slice(0, 2)
      .map((c) => c.reason),
  }));

  const fallback = top
    .map((d) => `${d.label}: ${d.contributing[0]?.reason ?? ''}`)
    .join(' ');

  if (!process.env.OPENAI_API_KEY) return fallback;

  try {
    const completion = await openai.chat.completions.create({
      model: 'gpt-4o-mini',
      temperature: 0.2,
      max_tokens: 160,
      response_format: { type: 'json_object' },
      messages: [
        { role: 'system', content: PROSE_SYSTEM },
        { role: 'user', content: JSON.stringify({ category, top_dimensions: findings }) },
      ],
    });
    const raw = completion.choices[0]?.message?.content?.trim() ?? '';
    const parsed = JSON.parse(raw) as { paragraph?: unknown };
    return typeof parsed.paragraph === 'string' && parsed.paragraph.trim()
      ? parsed.paragraph.trim()
      : fallback;
  } catch {
    return fallback;
  }
}

/**
 * Two-to-three sentence narrative of the buyer's biggest blockers.
 * Same fallback + reuse pattern as generateWhatsWorking above.
 */
export async function generateWhatsBlocking(
  score: ScoreResult,
  category: string,
): Promise<string> {
  const bottom = bottomDims(score, 2);
  const findings = bottom.map((d) => ({
    dimension: d.label,
    score: d.score,
    worst_rules: [...d.contributing]
      .sort((a, b) => a.points - b.points)
      .slice(0, 2)
      .map((c) => c.reason),
  }));

  const fallback = bottom
    .map((d) => `${d.label}: ${d.contributing[0]?.reason ?? ''}`)
    .join(' ');

  if (!process.env.OPENAI_API_KEY) return fallback;

  try {
    const completion = await openai.chat.completions.create({
      model: 'gpt-4o-mini',
      temperature: 0.2,
      max_tokens: 160,
      response_format: { type: 'json_object' },
      messages: [
        {
          role: 'system',
          content: PROSE_SYSTEM.replace(
            'Name the dimensions explicitly.',
            'Describe the biggest blockers, naming the dimensions explicitly.',
          ),
        },
        { role: 'user', content: JSON.stringify({ category, bottom_dimensions: findings }) },
      ],
    });
    const raw = completion.choices[0]?.message?.content?.trim() ?? '';
    const parsed = JSON.parse(raw) as { paragraph?: unknown };
    return typeof parsed.paragraph === 'string' && parsed.paragraph.trim()
      ? parsed.paragraph.trim()
      : fallback;
  } catch {
    return fallback;
  }
}
