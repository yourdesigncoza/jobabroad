import { NextRequest, NextResponse } from 'next/server';
import { createSupabaseServerClient } from '@/lib/supabase/server';
import { gateDemoRequest, isValidDemoCategory } from '@/lib/demo-mode';

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const SERVICE_ROLE = process.env.SUPABASE_SERVICE_ROLE_KEY!;

interface MatchRow {
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

function snippet(text: string, max = 200): string {
  const s = text
    .replace(/^---[\s\S]*?---\n/, '')
    .replace(/^#\s.*\n+/, '')
    .replace(/\[\[([^\]|]+)(?:\|([^\]]+))?\]\]/g, (_, t, l) => l ?? t)
    .replace(/\[([^\]]+)\]\([^)]+\)/g, '$1')
    .replace(/\*\*([^*]+)\*\*/g, '$1')
    .replace(/\*([^*]+)\*/g, '$1')
    .replace(/__([^_]+)__/g, '$1')
    .replace(/`([^`]+)`/g, '$1')
    .replace(/^[\s|:-]+$/gm, '')
    .replace(/^#{1,6}\s+/gm, '')
    .replace(/^[\s>]*[-*+]\s+/gm, '')
    .replace(/^\s*\d+\.\s+/gm, '')
    .replace(/\|/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
  if (s.length <= max) return s;
  return s.slice(0, max).replace(/\s\S*$/, '') + '…';
}

export async function POST(req: NextRequest) {
  let body: { query?: string; demo?: string };
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: 'Invalid JSON' }, { status: 400 });
  }

  const demo = body.demo?.trim();
  const query = body.query?.trim();
  if (!query) {
    return NextResponse.json({ error: 'query is required' }, { status: 400 });
  }

  let category: string;

  if (demo) {
    if (!isValidDemoCategory(demo)) {
      return NextResponse.json({ error: 'invalid demo category' }, { status: 400 });
    }
    const rejection = await gateDemoRequest(req, 'search');
    if (rejection) return rejection;
    category = demo;
  } else {
    const ssr = await createSupabaseServerClient();
    const { data: { user } } = await ssr.auth.getUser();
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    const { data: profile } = await ssr
      .from('profiles')
      .select('category')
      .eq('user_id', user.id)
      .single();
    if (!profile) {
      return NextResponse.json({ error: 'No profile' }, { status: 401 });
    }
    category = profile.category as string;
  }

  const res = await fetch(`${SUPABASE_URL}/functions/v1/search-pathway`, {
    method: 'POST',
    headers: {
      'content-type': 'application/json',
      'x-internal-key': SERVICE_ROLE,
    },
    body: JSON.stringify({
      query,
      category,
      threshold: 0.5,
    }),
  });

  if (!res.ok) {
    const text = await res.text();
    return NextResponse.json({ error: `search failed: ${text}` }, { status: 502 });
  }

  const { results } = (await res.json()) as { results: MatchRow[] };

  const trimmed = results
    .map((r) => ({
      id: r.id,
      source_type: r.source_type,
      heading: r.heading,
      anchor: r.anchor,
      slug: r.slug,
      snippet: snippet(r.content),
      similarity: r.similarity,
    }))
    .sort((a, b) => {
      if (a.source_type !== b.source_type) return a.source_type === 'guide' ? -1 : 1;
      return b.similarity - a.similarity;
    })
    .slice(0, 6);

  return NextResponse.json({ results: trimmed });
}
