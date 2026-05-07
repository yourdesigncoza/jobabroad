export interface PromptChunk {
  id: number;
  source_type: 'guide' | 'wiki';
  heading: string;
  content: string;
}

export interface BuiltPrompt {
  system: string;
  user: string;
  context: string;
  numberedIds: number[];
}

const SNIPPET_MAX = 600;

function trimSnippet(content: string): string {
  const cleaned = content
    .replace(/^---[\s\S]*?---\n/, '')
    .replace(/\s+/g, ' ')
    .trim();
  if (cleaned.length <= SNIPPET_MAX) return cleaned;
  return cleaned.slice(0, SNIPPET_MAX).replace(/\s\S*$/, '') + '…';
}

export function buildAnswerPrompt(
  query: string,
  category: string,
  chunks: PromptChunk[],
): BuiltPrompt {
  const categoryLabel = category.charAt(0).toUpperCase() + category.slice(1);

  const system = [
    `You answer questions for a South African work-abroad guide for ${categoryLabel} workers using ONLY the numbered passages below.`,
    `Respond with a single JSON object: {"answered": boolean, "answer": string}.`,
    `Set "answered" to true ONLY when the passages directly contain the information needed to answer. Set it to false otherwise — including when the topic is adjacent but the specific fact (e.g. salary for a specific role, a date, a fee) is not stated.`,
    `When "answered" is true: write 2–4 short paragraphs in plain English. Use "we" never "I". Cite sources inline as [1], [2] — only cite passages you actually used. No preamble, no restating the question. Do not infer, extrapolate, or use general knowledge; currency, fees, dates, and rules may only be quoted if they appear verbatim in a passage.`,
    `When "answered" is false: leave "answer" as an empty string "". Do not write a fallback message — the application supplies one.`,
    `Output JSON only. No markdown, no commentary outside the JSON object.`,
  ].join(' ');

  const numberedIds: number[] = [];
  const blocks = chunks.map((chunk, i) => {
    const n = i + 1;
    numberedIds.push(chunk.id);
    return `[${n}] ${chunk.heading}\n${trimSnippet(chunk.content)}`;
  });

  const context = blocks.join('\n\n');

  return {
    system,
    user: query,
    context,
    numberedIds,
  };
}

export function extractCitedIndexes(answer: string): number[] {
  const matches = answer.matchAll(/\[(\d+)\]/g);
  const set = new Set<number>();
  for (const m of matches) {
    const n = parseInt(m[1], 10);
    if (!isNaN(n) && n >= 1) set.add(n);
  }
  return Array.from(set).sort((a, b) => a - b);
}
