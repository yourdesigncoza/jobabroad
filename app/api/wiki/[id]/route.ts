import { createClient } from '@supabase/supabase-js';
import { NextRequest, NextResponse } from 'next/server';
import { renderWikiMarkdown } from '@/lib/render-wiki';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!,
);

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  const { id } = await params;
  const token = req.nextUrl.searchParams.get('token')?.trim();
  if (!token) {
    return NextResponse.json({ error: 'token required' }, { status: 400 });
  }

  const numericId = Number(id);
  if (!Number.isFinite(numericId)) {
    return NextResponse.json({ error: 'invalid id' }, { status: 400 });
  }

  const { data: tokenRow } = await supabase
    .from('member_tokens')
    .select('interest_category')
    .eq('token', token)
    .single();

  if (!tokenRow) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const { data: chunk } = await supabase
    .from('pathway_chunks')
    .select('id, category, source_type, heading, slug, content')
    .eq('id', numericId)
    .single();

  if (!chunk) {
    return NextResponse.json({ error: 'Not found' }, { status: 404 });
  }

  const allowed = chunk.category === tokenRow.interest_category || chunk.category === 'shared';
  if (!allowed) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
  }

  return NextResponse.json({
    id: chunk.id,
    heading: chunk.heading,
    slug: chunk.slug,
    source_type: chunk.source_type,
    html: renderWikiMarkdown(chunk.content),
  });
}
