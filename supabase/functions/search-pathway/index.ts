// deno-lint-ignore-file no-explicit-any
import { createClient } from 'jsr:@supabase/supabase-js@2';

const CORS_HEADERS = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, content-type, x-internal-key',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
};

const session = new (Supabase as any).ai.Session('gte-small');

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: CORS_HEADERS });
  }

  if (req.method !== 'POST') {
    return new Response('Method not allowed', { status: 405, headers: CORS_HEADERS });
  }

  const expectedKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY');
  const providedKey = req.headers.get('x-internal-key');
  if (!expectedKey || providedKey !== expectedKey) {
    return json({ error: 'Unauthorized' }, 401);
  }

  let body: { query?: string; category?: string; threshold?: number; limit?: number };
  try {
    body = await req.json();
  } catch {
    return json({ error: 'Invalid JSON' }, 400);
  }

  const query = body.query?.trim();
  const category = body.category?.trim();
  if (!query || !category) {
    return json({ error: 'query and category are required' }, 400);
  }

  const threshold = typeof body.threshold === 'number' ? body.threshold : 0.5;
  const limit = typeof body.limit === 'number' ? body.limit : 10;

  let embedding: number[];
  try {
    embedding = await session.run(query, { mean_pool: true, normalize: true });
  } catch (err) {
    return json({ error: `embedding failed: ${(err as Error).message}` }, 500);
  }

  const supabase = createClient(
    Deno.env.get('SUPABASE_URL')!,
    Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!,
  );

  const { data, error } = await supabase.rpc('match_pathway_chunks', {
    query_embedding: embedding,
    filter_category: category,
    match_threshold: threshold,
    match_count: limit,
  });

  if (error) {
    return json({ error: error.message }, 500);
  }

  return json({ results: data ?? [] }, 200);
});

function json(payload: unknown, status: number) {
  return new Response(JSON.stringify(payload), {
    status,
    headers: { ...CORS_HEADERS, 'content-type': 'application/json' },
  });
}
