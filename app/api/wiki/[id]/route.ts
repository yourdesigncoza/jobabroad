import { createClient } from '@supabase/supabase-js';
import { NextRequest, NextResponse } from 'next/server';
import { renderWikiMarkdown } from '@/lib/render-wiki';
import { gateDemoRequest, isValidDemoCategory } from '@/lib/demo-mode';

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
  const demo = req.nextUrl.searchParams.get('demo')?.trim();
  if (!token && !demo) {
    return NextResponse.json({ error: 'token or demo required' }, { status: 400 });
  }

  const numericId = Number(id);
  if (!Number.isFinite(numericId)) {
    return NextResponse.json({ error: 'invalid id' }, { status: 400 });
  }

  let allowedCategory: string;

  if (demo) {
    if (!isValidDemoCategory(demo)) {
      return NextResponse.json({ error: 'invalid demo category' }, { status: 400 });
    }
    const rejection = await gateDemoRequest(req, 'wiki');
    if (rejection) return rejection;
    allowedCategory = demo;
  } else {
    const { data: tokenRow } = await supabase
      .from('member_tokens')
      .select('interest_category')
      .eq('token', token!)
      .single();

    if (!tokenRow) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    allowedCategory = tokenRow.interest_category as string;
  }

  const { data: chunk } = await supabase
    .from('pathway_chunks')
    .select('id, category, source_type, heading, slug, content')
    .eq('id', numericId)
    .single();

  if (!chunk) {
    return NextResponse.json({ error: 'Not found' }, { status: 404 });
  }

  const allowed = chunk.category === allowedCategory || chunk.category === 'shared';
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
