import 'server-only';

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const SERVICE_ROLE = process.env.SUPABASE_SERVICE_ROLE_KEY!;

export interface CorpusChunk {
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

export interface SearchCorpusOptions {
  /** Max chunks returned to the caller. */
  limit?: number;
  /** Similarity floor applied by the edge function. */
  threshold?: number;
  /** How many candidates to ask the edge function for before slicing to limit. */
  fetchLimit?: number;
}

/**
 * Server-side semantic search against the pathway corpus via the search-pathway
 * Supabase edge function. Shared by report generation and the AI coach.
 * Returns [] on any failure so callers can degrade gracefully.
 */
export async function searchCorpus(
  category: string,
  query: string,
  opts: SearchCorpusOptions = {},
): Promise<CorpusChunk[]> {
  const { limit = 15, threshold = 0.4, fetchLimit = 25 } = opts;
  try {
    const res = await fetch(`${SUPABASE_URL}/functions/v1/search-pathway`, {
      method: 'POST',
      headers: {
        'content-type': 'application/json',
        'x-internal-key': SERVICE_ROLE,
      },
      body: JSON.stringify({ query, category, threshold, limit: fetchLimit }),
    });
    if (!res.ok) return [];
    const { results } = (await res.json()) as { results: CorpusChunk[] };
    return (results ?? []).slice(0, limit);
  } catch {
    return [];
  }
}
