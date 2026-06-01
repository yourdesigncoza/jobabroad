import 'server-only';
import React, { type ReactElement } from 'react';
import { renderToBuffer, type DocumentProps } from '@react-pdf/renderer';
import { createClient } from '@supabase/supabase-js';
import OpenAI from 'openai';
import { calculateScore, loadRubric } from '@/lib/scoring';
import type { DimensionResult, ScoreResult } from '@/lib/scoring/types';
import { getOrGenerateNarratives } from '@/lib/scoring/narratives';
import { assessmentDataSchema } from '@/lib/assessments/schemas/assessment';
import { readTargetDestinations, readSpecialisms } from '@/lib/assessments/answers';
import { CATEGORIES, type CategoryId } from '@/lib/categories';
import { getTrustedPartnersForBuyer } from '@/lib/recruiters';
import { getRedFlagsForCategory } from './red-flags';
import type { AssessmentData } from '@/lib/assessments/schemas/assessment';
import { searchCorpus, type CorpusChunk } from '@/lib/rag/corpus';
import { ReportTemplate } from './pdf-template';
import type { ReportData } from './types';

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const SERVICE_ROLE = process.env.SUPABASE_SERVICE_ROLE_KEY!;
const BUCKET = 'paid-reports';
const SIGNED_URL_TTL = 60 * 5; // 5 minutes

// Lazy, cached singleton — built on first call, not at module load, so
// importing this during `next build` doesn't require OPENAI_API_KEY.
let _openai: OpenAI | null = null;
function getOpenAI() {
  return (_openai ??= new OpenAI({ apiKey: process.env.OPENAI_API_KEY! }));
}

function admin() {
  return createClient(SUPABASE_URL, SERVICE_ROLE, { auth: { persistSession: false } });
}

function tightenSnippet(text: string, max = 220): string {
  const s = text
    .replace(/^---[\s\S]*?---\n/, '')
    .replace(/^#\s.*\n+/, '')
    .replace(/\[\[([^\]|]+)(?:\|([^\]]+))?\]\]/g, (_, t, l) => l ?? t)
    .replace(/\[([^\]]+)\]\([^)]+\)/g, '$1')
    .replace(/\*\*([^*]+)\*\*/g, '$1')
    .replace(/\*([^*]+)\*/g, '$1')
    .replace(/`([^`]+)`/g, '$1')
    .replace(/^#{1,6}\s+/gm, '')
    .replace(/^[\s>]*[-*+]\s+/gm, '')
    .replace(/\|/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
  if (s.length <= max) return s;
  return s.slice(0, max).replace(/\s\S*$/, '') + '…';
}

function bottomDims(score: ScoreResult, n = 2): DimensionResult[] {
  return [...score.dimensions].sort((a, b) => a.score - b.score).slice(0, n);
}

async function generateNextActions(
  score: ScoreResult,
  category: string,
  corpus: CorpusChunk[],
  destinations: string[],
): Promise<Array<{ title: string; body: string }>> {
  // Pull 5 bottom dims so the model has enough specific gaps to reach 5-7
  // distinct, concrete actions instead of repeating itself.
  const bottom = bottomDims(score, 5);
  const gaps = bottom.flatMap((d) =>
    [...d.contributing].sort((a, b) => a.points - b.points).slice(0, 1).map((c) => ({
      dimension: d.label,
      reason: c.reason,
    })),
  );

  const fallback: Array<{ title: string; body: string }> = gaps.slice(0, 5).map((g) => ({
    title: g.dimension,
    body: `Address this by working on your ${g.dimension.toLowerCase()}: ${g.reason}`,
  }));

  if (!process.env.OPENAI_API_KEY) return fallback;

  try {
    const completion = await getOpenAI().chat.completions.create({
      model: 'gpt-4o-mini',
      temperature: 0.2,
      max_tokens: 1200,
      response_format: { type: 'json_object' },
      messages: [
        {
          role: 'system',
          content: `You write 5 to 7 concrete next actions for a South African work-abroad report. Each action: { "title": "<= 10 words, imperative", "body": "<= 110 words, plain English, 1-3 sentences" }. Each MUST address a specific gap from the input. Ground each in the corpus passages where relevant.

Each "body" MUST include at least one concrete first step the reader can take today: a URL, a fee in ZAR, a timeline ("4-6 weeks"), a specific document name, or a registration body name (e.g. SACE, AHPRA, NMC). No abstract advice. No "consider doing X" — say "do X by visiting Y, expect Z weeks".

The reader's target destinations are in "destinations". Tailor each action to those destinations: name the registration body, visa rule, or document each one requires (e.g. UK needs QTS + a salary threshold; the Gulf needs degree attestation/apostille). Only state a destination-specific fact if it appears in the corpus passages — never invent one. When the corpus is silent on a destination, tell the reader to verify with that country's official body and name it.

Prioritise actions in order: the lowest-scoring dimension's gap first, then the next, and so on. Skip a gap if the corpus has nothing useful on it.

Write exactly like a natural, smart human having a conversation. Be clear, concise, and direct. Vary your sentence lengths. Never, under any circumstances, use em dashes (—). Instead, use commas, periods, parentheses, or colons.

No hedging. No invented facts. Return JSON: { "actions": [{title, body}, ...] } with 5 to 7 items.`,
        },
        {
          role: 'user',
          content: JSON.stringify({
            category,
            destinations,
            gaps,
            corpus: corpus.slice(0, 8).map((c) => ({
              heading: c.heading,
              excerpt: tightenSnippet(c.content, 350),
            })),
          }),
        },
      ],
    });
    const raw = completion.choices[0]?.message?.content?.trim() ?? '';
    const parsed = JSON.parse(raw) as {
      actions?: Array<{ title?: unknown; body?: unknown }>;
    };
    const actions = (parsed.actions ?? [])
      .map((a) => ({
        title: typeof a.title === 'string' ? a.title.trim() : '',
        body: typeof a.body === 'string' ? a.body.trim() : '',
      }))
      .filter((a) => a.title && a.body)
      .slice(0, 7);
    // Need at least 5 actions to justify the section; below that, use the
    // fallback which deterministically produces one action per gap.
    return actions.length >= 5 ? actions : fallback;
  } catch {
    return fallback;
  }
}

function pickContactChunks(
  corpus: CorpusChunk[],
  category: string,
  baseUrl: string,
): ReportData['contacts'] {
  // Only guide chunks have a real deep-linkable URL in the buyer's member area.
  // Wiki chunks are dropped — they don't have a canonical public URL, and an
  // unlinked "Source: ..." line adds no reader value.
  // Dedup by anchor: long guide sections are indexed as many sub-chunks, all
  // pointing at the same anchor. We want distinct sections, not the same
  // section repeated 4 times.
  const seen = new Set<string>();
  const out: ReportData['contacts'] = [];
  for (const c of corpus) {
    if (c.source_type !== 'guide' || !c.anchor) continue;
    if (seen.has(c.anchor)) continue;
    seen.add(c.anchor);
    out.push({
      heading: c.heading,
      excerpt: tightenSnippet(c.content, 400),
      url: `${baseUrl}/members/${category}#${c.anchor}`,
    });
    if (out.length >= 8) break;
  }
  return out;
}

function pickPartners(
  category: CategoryId,
  answers: AssessmentData,
): ReportData['partners'] {
  const targetDestinations = readTargetDestinations(answers);
  const matches = getTrustedPartnersForBuyer({ category, targetDestinations });
  if (matches.length === 0) return undefined;
  return matches.slice(0, 4).map((r) => {
    const destBit = r.destinations.length
      ? ` · ${r.destinations.slice(0, 3).join(', ')}`
      : '';
    return {
      name: r.name,
      subline: `${r.type || 'Recruiter'}${destBit}`,
      notes: tightenSnippet(r.notes, 200),
      bullets: r.trustedBullets,
      url: r.website || undefined,
    };
  });
}

function corpusQueryFromGaps(score: ScoreResult, destinations: string[]): string {
  // Build a search query from the LOWEST-scoring rule in each bottom
  // dimension. Critical: a dimension's first contributing rule isn't always
  // the worst one — for a Strong profile the "Language" dim's first rule
  // might be "Fluent English, typically sufficient..." (positive, 90/100)
  // which semantically matches nothing in the knowledge base. Sorting by
  // points ascending picks the actual gap rule ("No English test on
  // record..."), which matches relevant corpus chunks. Prepending the buyer's
  // target destinations skews retrieval toward destination-specific chunks
  // (visa rules, registration bodies) so the grounded advice fits their goal.
  const gapText = bottomDims(score, 3)
    .flatMap((d) =>
      [...d.contributing].sort((a, b) => a.points - b.points).slice(0, 1).map((c) => c.reason),
    )
    .join(' ');
  return `${destinations.join(' ')} ${gapText}`.trim().slice(0, 400);
}

export interface GenerateReportResult {
  pdfPath: string;
  signedUrl: string;
  /** Raw PDF bytes — used to attach to the buyer email in step 12 */
  pdfBuffer: Buffer;
  userEmail: string;
  userName: string;
  categoryLabel: string;
}

export async function generateReport(userId: string): Promise<GenerateReportResult> {
  try {
    return await generateReportInner(userId);
  } catch (err) {
    // Write the failure to paid_reports so the dashboard status surfaces it and
    // the user can hit "try again". We still rethrow — callers (webhook
    // generateAndEmail wrapper, /admin) decide what to do with the
    // throw.
    const sb = admin();
    const msg = err instanceof Error ? err.message : String(err);
    await sb
      .from('paid_reports')
      .upsert(
        {
          user_id: userId,
          generation_status: 'failed',
          generation_error: msg.slice(0, 1000),
        },
        { onConflict: 'user_id' },
      )
      .then(({ error }) => {
        if (error) console.error('[generateReport] failed-status write errored', error);
      });
    throw err;
  }
}

async function generateReportInner(userId: string): Promise<GenerateReportResult> {
  const sb = admin();

  const { data: profile, error: profileErr } = await sb
    .from('profiles')
    .select('name, category, tier')
    .eq('user_id', userId)
    .single();
  if (profileErr || !profile) throw new Error('profile_not_found');

  // Look up auth email separately — needed for the eager email-with-PDF flow
  const { data: authUser } = await sb.auth.admin.getUserById(userId);
  const userEmail = authUser?.user?.email ?? '';

  const category = profile.category as string;
  const rubric = await loadRubric(category);
  if (!rubric) throw new Error(`no_rubric_for_${category}`);

  const { data: assessment, error: assessErr } = await sb
    .from('assessments')
    .select('id, data, status, category')
    .eq('user_id', userId)
    .eq('category', category)
    .eq('status', 'submitted')
    .order('updated_at', { ascending: false })
    .limit(1)
    .single();
  if (assessErr || !assessment) throw new Error('no_submitted_assessment');

  const answers = assessmentDataSchema.parse(assessment.data);
  const score = calculateScore(answers, rubric);
  const destinations = readTargetDestinations(answers);
  const specialisms = readSpecialisms(answers);

  // Pull the full search window — pickContactChunks needs the full list to find
  // guide chunks (which often rank below tighter wiki notes). LLM prompts that
  // consume corpus do their own slicing.
  const corpus = await searchCorpus(category, corpusQueryFromGaps(score, destinations));

  // Narratives reuse the cached entry on assessments.cached_narratives so
  // the PDF gen path doesn't pay the LLM tax twice when the user already
  // visited /score (which is the normal flow).
  const [narratives, nextActions] = await Promise.all([
    getOrGenerateNarratives(assessment.id, score, category),
    generateNextActions(score, category, corpus, destinations),
  ]);
  const { whatsWorking, whatsBlocking } = narratives;

  const userName = (profile.name as string) || 'There';
  const categoryLabel = CATEGORIES.find((c) => c.id === category)?.label ?? category;
  // Hardcoded prod URL fallback because the PDF is an email artifact that may
  // be opened months later from any device; dev/preview URLs would 404.
  const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 'https://jobabroad.co.za';

  const data: ReportData = {
    userName,
    categoryLabel,
    generatedAt: new Date().toISOString().slice(0, 10),
    focus:
      destinations.length || specialisms.length
        ? { destinations, specialisms }
        : undefined,
    score,
    whatsWorking,
    whatsBlocking,
    nextActions,
    contacts: pickContactChunks(corpus, category, baseUrl),
    redFlags: getRedFlagsForCategory(category as CategoryId),
    partners: pickPartners(category as CategoryId, answers),
  };

  const element = React.createElement(ReportTemplate, { data }) as unknown as ReactElement<DocumentProps>;
  const buffer = await renderToBuffer(element);
  const ts = Date.now();
  const pdfPath = `${userId}/report-${ts}.pdf`;

  const { error: uploadErr } = await sb.storage
    .from(BUCKET)
    .upload(pdfPath, buffer, {
      contentType: 'application/pdf',
      upsert: false,
    });
  if (uploadErr) throw new Error(`storage_upload_failed: ${uploadErr.message}`);

  const now = new Date().toISOString();
  const { error: upsertErr } = await sb.from('paid_reports').upsert(
    {
      user_id: userId,
      pdf_path: pdfPath,
      generated_at: now,
      generation_status: 'completed',
      generation_completed_at: now,
      generation_error: null,
    },
    { onConflict: 'user_id' },
  );
  if (upsertErr) throw new Error(`paid_reports_upsert_failed: ${upsertErr.message}`);

  const signedUrl = await createSignedUrl(pdfPath);
  return { pdfPath, signedUrl, pdfBuffer: buffer, userEmail, userName, categoryLabel };
}

export async function createSignedUrl(pdfPath: string): Promise<string> {
  const sb = admin();
  const { data, error } = await sb.storage
    .from(BUCKET)
    .createSignedUrl(pdfPath, SIGNED_URL_TTL);
  if (error || !data?.signedUrl) throw new Error('signed_url_failed');
  return data.signedUrl;
}

export async function getCachedReportPath(userId: string): Promise<string | null> {
  const sb = admin();
  const { data } = await sb
    .from('paid_reports')
    .select('pdf_path')
    .eq('user_id', userId)
    .single();
  return (data?.pdf_path as string | undefined) ?? null;
}
