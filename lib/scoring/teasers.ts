import OpenAI from 'openai';
import type { ScoreResult } from './types';

const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY! });

const SYSTEM_PROMPT = `You are summarising an assessment for Jobabroad, a service helping South Africans work overseas. You will be given two rubric findings, each with a dimension label and a reason. Rewrite each as a single sentence (max 22 words) in the "we" voice.

Write exactly like a natural, smart human having a conversation. Be clear, concise, and direct. Vary your sentence lengths. Never, under any circumstances, use em dashes (—). Instead, use commas, periods, parentheses, or colons.

Each sentence MUST explicitly name the dimension. For example: "Your biggest blocker is likely documentation readiness: your answers suggest you still need to renew your police clearance." Or: "Your strongest factor is credentials. A B.Ed Honours is widely recognised internationally."

NEVER add facts not in the input. State the finding plainly without hedging.

Return JSON: { "strength": "...", "blocker": "..." }`;

export async function generateScoreTeasers(
  score: ScoreResult,
  category: string,
): Promise<{ strength: string; blocker: string }> {
  const sortedDims = [...score.dimensions].sort((a, b) => b.score - a.score);
  const topDim = sortedDims[0];
  const worstDim = sortedDims[sortedDims.length - 1];
  if (!topDim || !worstDim) {
    return {
      strength: 'We need more answers before we can summarise your strengths.',
      blocker: 'We need more answers before we can flag your biggest blocker.',
    };
  }

  const topRule = [...topDim.contributing].sort((a, b) => b.points - a.points)[0];
  const worstRule = [...worstDim.contributing].sort((a, b) => a.points - b.points)[0];

  const fallback = {
    strength: topRule?.reason ?? `Your strongest area is ${topDim.label}.`,
    blocker: worstRule?.reason ?? `Your biggest blocker is ${worstDim.label}.`,
  };

  if (!topRule || !worstRule || !process.env.OPENAI_API_KEY) {
    return fallback;
  }

  const userPayload = JSON.stringify({
    category,
    strength_finding: { dimension: topDim.label, reason: topRule.reason },
    blocker_finding: { dimension: worstDim.label, reason: worstRule.reason },
  });

  try {
    const completion = await openai.chat.completions.create({
      model: 'gpt-4o-mini',
      temperature: 0.2,
      max_tokens: 200,
      response_format: { type: 'json_object' },
      messages: [
        { role: 'system', content: SYSTEM_PROMPT },
        { role: 'user', content: userPayload },
      ],
    });

    const raw = completion.choices[0]?.message?.content?.trim() ?? '';
    if (!raw) return fallback;

    const parsed = JSON.parse(raw) as { strength?: unknown; blocker?: unknown };
    const strength = typeof parsed.strength === 'string' && parsed.strength.trim()
      ? parsed.strength.trim()
      : fallback.strength;
    const blocker = typeof parsed.blocker === 'string' && parsed.blocker.trim()
      ? parsed.blocker.trim()
      : fallback.blocker;
    return { strength, blocker };
  } catch (err) {
    console.error('[teasers] openai failure', err);
    return fallback;
  }
}
