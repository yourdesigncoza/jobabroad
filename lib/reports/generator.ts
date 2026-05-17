import 'server-only';
import React, { type ReactElement } from 'react';
import { renderToBuffer, type DocumentProps } from '@react-pdf/renderer';
import { createClient } from '@supabase/supabase-js';
import OpenAI from 'openai';
import { calculateScore, loadRubric } from '@/lib/scoring';
import type { DimensionResult, ScoreResult } from '@/lib/scoring/types';
import { assessmentDataSchema } from '@/lib/assessments/schemas/assessment';
import { CATEGORIES, type CategoryId } from '@/lib/categories';
import { getPremiumRecruiters } from '@/lib/recruiters';
import { ReportTemplate } from './pdf-template';
import type { ReportData } from './types';

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const SERVICE_ROLE = process.env.SUPABASE_SERVICE_ROLE_KEY!;
const BUCKET = 'paid-reports';
const SIGNED_URL_TTL = 60 * 5; // 5 minutes

const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY! });

function admin() {
  return createClient(SUPABASE_URL, SERVICE_ROLE, { auth: { persistSession: false } });
}

interface CorpusChunk {
  id: number;
  category: string;
  source_type: 'guide' | 'wiki';
  source_path: string;
  heading: string;
  anchor: string | null;
  slug: string | null;
  content: string;
  similarity: number;
}

async function searchCorpus(
  category: string,
  query: string,
  limit = 15,
): Promise<CorpusChunk[]> {
  try {
    const res = await fetch(`${SUPABASE_URL}/functions/v1/search-pathway`, {
      method: 'POST',
      headers: {
        'content-type': 'application/json',
        'x-internal-key': SERVICE_ROLE,
      },
      body: JSON.stringify({ query, category, threshold: 0.4, limit: 25 }),
    });
    if (!res.ok) return [];
    const { results } = (await res.json()) as { results: CorpusChunk[] };
    return (results ?? []).slice(0, limit);
  } catch {
    return [];
  }
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

function topDims(score: ScoreResult, n = 2): DimensionResult[] {
  return [...score.dimensions].sort((a, b) => b.score - a.score).slice(0, n);
}
function bottomDims(score: ScoreResult, n = 2): DimensionResult[] {
  return [...score.dimensions].sort((a, b) => a.score - b.score).slice(0, n);
}

async function generateWhatsWorking(score: ScoreResult, category: string): Promise<string> {
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
        {
          role: 'system',
          content: `You write one short paragraph (max 80 words, single paragraph) for a South African work-abroad assessment report. Name the dimensions explicitly. Cite the rule reasons near-verbatim, but smooth them into natural prose.

Write exactly like a natural, smart human having a conversation. Be clear, concise, and direct. Vary your sentence lengths. Never, under any circumstances, use em dashes (—). Instead, use commas, periods, parentheses, or colons.

No hedging ("might", "could", "should consider"). No new facts. Return JSON: { "paragraph": "..." }`,
        },
        {
          role: 'user',
          content: JSON.stringify({ category, top_dimensions: findings }),
        },
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

async function generateWhatsBlocking(score: ScoreResult, category: string): Promise<string> {
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
          content: `You write one short paragraph (max 80 words, single paragraph) for a South African work-abroad assessment report. Describe the biggest blockers, naming the dimensions explicitly. Cite rule reasons near-verbatim, but smooth them into natural prose.

Write exactly like a natural, smart human having a conversation. Be clear, concise, and direct. Vary your sentence lengths. Never, under any circumstances, use em dashes (—). Instead, use commas, periods, parentheses, or colons.

No hedging ("might", "could", "should consider"). No new facts. Return JSON: { "paragraph": "..." }`,
        },
        {
          role: 'user',
          content: JSON.stringify({ category, bottom_dimensions: findings }),
        },
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

async function generateNextActions(
  score: ScoreResult,
  category: string,
  corpus: CorpusChunk[],
): Promise<Array<{ title: string; body: string }>> {
  const bottom = bottomDims(score, 3);
  const gaps = bottom.flatMap((d) =>
    [...d.contributing].sort((a, b) => a.points - b.points).slice(0, 1).map((c) => ({
      dimension: d.label,
      reason: c.reason,
    })),
  );

  const fallback: Array<{ title: string; body: string }> = gaps.slice(0, 3).map((g) => ({
    title: g.dimension,
    body: g.reason,
  }));

  if (!process.env.OPENAI_API_KEY) return fallback;

  try {
    const completion = await openai.chat.completions.create({
      model: 'gpt-4o-mini',
      temperature: 0.2,
      max_tokens: 280,
      response_format: { type: 'json_object' },
      messages: [
        {
          role: 'system',
          content: `You write exactly 3 concrete next actions for a South African work-abroad report. Each action: { "title": "<= 8 words, imperative", "body": "<= 35 words, plain English, one sentence" }. Each MUST address a specific gap from the input. Ground each in the corpus passages where relevant.

Write exactly like a natural, smart human having a conversation. Be clear, concise, and direct. Vary your sentence lengths. Never, under any circumstances, use em dashes (—). Instead, use commas, periods, parentheses, or colons.

No hedging. No invented facts. Return JSON: { "actions": [{title, body}, {title, body}, {title, body}] }`,
        },
        {
          role: 'user',
          content: JSON.stringify({
            category,
            gaps,
            corpus: corpus.slice(0, 4).map((c) => ({
              heading: c.heading,
              excerpt: tightenSnippet(c.content, 280),
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
      .slice(0, 3);
    return actions.length ? actions : fallback;
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
      excerpt: tightenSnippet(c.content, 200),
      url: `${baseUrl}/members/${category}#${c.anchor}`,
    });
    if (out.length >= 4) break;
  }
  return out;
}

function pickPartners(category: CategoryId): ReportData['partners'] {
  const matches = getPremiumRecruiters(category);
  if (matches.length === 0) return undefined;
  return matches.slice(0, 4).map((r) => {
    const destBit = r.destinations.length
      ? ` · ${r.destinations.slice(0, 3).join(', ')}`
      : '';
    return {
      name: r.name,
      subline: `${r.type || 'Recruiter'}${destBit}`,
      notes: tightenSnippet(r.notes, 200),
      url: r.website || undefined,
    };
  });
}

function corpusQueryFromGaps(score: ScoreResult): string {
  // Build a search query from the LOWEST-scoring rule in each bottom
  // dimension. Critical: a dimension's first contributing rule isn't always
  // the worst one — for a Strong profile the "Language" dim's first rule
  // might be "Fluent English, typically sufficient..." (positive, 90/100)
  // which semantically matches nothing in the knowledge base. Sorting by
  // points ascending picks the actual gap rule ("No English test on
  // record..."), which matches relevant corpus chunks.
  return bottomDims(score, 3)
    .flatMap((d) =>
      [...d.contributing].sort((a, b) => a.points - b.points).slice(0, 1).map((c) => c.reason),
    )
    .join(' ')
    .slice(0, 400);
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

export interface GenerateReportOptions {
  /**
   * Post-call notes captured by the admin on /admin/post-call. When provided,
   * persisted to paid_reports.call_notes and threaded into the PDF template.
   * When omitted, the existing call_notes row (if any) is preserved so a
   * re-generation without notes doesn't accidentally wipe an earlier capture.
   */
  callNotes?: string;
}

export async function generateReport(
  userId: string,
  opts: GenerateReportOptions = {},
): Promise<GenerateReportResult> {
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
    .select('data, status, category')
    .eq('user_id', userId)
    .eq('category', category)
    .eq('status', 'submitted')
    .order('updated_at', { ascending: false })
    .limit(1)
    .single();
  if (assessErr || !assessment) throw new Error('no_submitted_assessment');

  const answers = assessmentDataSchema.parse(assessment.data);
  const score = calculateScore(answers, rubric);

  // Pull the full search window — pickContactChunks needs the full list to find
  // guide chunks (which often rank below tighter wiki notes). LLM prompts that
  // consume corpus do their own slicing.
  const corpus = await searchCorpus(category, corpusQueryFromGaps(score));

  const [whatsWorking, whatsBlocking, nextActions] = await Promise.all([
    generateWhatsWorking(score, category),
    generateWhatsBlocking(score, category),
    generateNextActions(score, category, corpus),
  ]);

  const userName = (profile.name as string) || 'There';
  const categoryLabel = CATEGORIES.find((c) => c.id === category)?.label ?? category;
  // Hardcoded prod URL fallback because the PDF is an email artifact that may
  // be opened months later from any device; dev/preview URLs would 404.
  const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 'https://jobabroad.co.za';

  // If admin didn't pass notes on this run, fall back to whatever was last
  // captured (lets the admin re-run the generator without losing context).
  let callNotes = opts.callNotes?.trim() || undefined;
  if (!callNotes) {
    const { data: prior } = await sb
      .from('paid_reports')
      .select('call_notes')
      .eq('user_id', userId)
      .single();
    const stored = (prior?.call_notes as string | null | undefined) ?? null;
    if (stored?.trim()) callNotes = stored.trim();
  }

  const data: ReportData = {
    userName,
    categoryLabel,
    generatedAt: new Date().toISOString().slice(0, 10),
    score,
    whatsWorking,
    whatsBlocking,
    nextActions,
    contacts: pickContactChunks(corpus, category, baseUrl),
    callNotes,
    partners: pickPartners(category as CategoryId),
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

  const { error: upsertErr } = await sb.from('paid_reports').upsert(
    {
      user_id: userId,
      pdf_path: pdfPath,
      generated_at: new Date().toISOString(),
      // Persist whatever notes ended up in the report, so re-runs without
      // fresh notes stay consistent with what's in the PDF on disk.
      ...(callNotes !== undefined ? { call_notes: callNotes } : {}),
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
