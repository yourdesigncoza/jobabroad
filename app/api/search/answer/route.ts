import { createClient } from '@supabase/supabase-js';
import { NextRequest, NextResponse } from 'next/server';
import OpenAI from 'openai';
import { checkBotId } from 'botid/server';
import { createSupabaseServerClient } from '@/lib/supabase/server';
import { buildAnswerPrompt, extractCitedIndexes } from '@/lib/rag/prompt';
import { isValidDemoCategory } from '@/lib/demo-mode';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!,
);

const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY! });

const SIMILARITY_GATE = 0.8;
const MAX_CHUNKS = 8;
const MODEL = 'gpt-4o-mini';

interface ChunkRef {
  id: number;
  similarity: number;
}

interface RequestBody {
  demo?: string;
  query?: string;
  chunks?: ChunkRef[];
}

interface DbChunk {
  id: number;
  category: string;
  source_type: 'guide' | 'wiki';
  heading: string;
  anchor: string | null;
  slug: string | null;
  content: string;
}

export async function POST(req: NextRequest) {
  let body: RequestBody;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: 'Invalid JSON' }, { status: 400 });
  }

  const demo = body.demo?.trim();
  const query = body.query?.trim();
  const chunkRefs = Array.isArray(body.chunks) ? body.chunks : null;

  if (!query || !chunkRefs) {
    return NextResponse.json(
      { error: 'query and chunks are required' },
      { status: 400 },
    );
  }

  if (chunkRefs.length === 0) {
    return NextResponse.json({ refused: true, citations: [] });
  }

  if (chunkRefs.length > MAX_CHUNKS) {
    return NextResponse.json({ error: 'too many chunks' }, { status: 400 });
  }

  const validRefs = chunkRefs.filter(
    (c) =>
      typeof c.id === 'number' &&
      Number.isInteger(c.id) &&
      typeof c.similarity === 'number',
  );
  if (validRefs.length !== chunkRefs.length) {
    return NextResponse.json({ error: 'invalid chunk shape' }, { status: 400 });
  }

  const topSim = Math.max(...validRefs.map((c) => c.similarity));
  if (topSim < SIMILARITY_GATE) {
    return NextResponse.json({ refused: true, citations: [] });
  }

  let category: string;

  if (demo) {
    if (!isValidDemoCategory(demo)) {
      return NextResponse.json({ error: 'invalid demo category' }, { status: 400 });
    }
    // /api/search already incremented this user's daily quota for the search
    // step. /answer still BotID-gates (separate request) but skips the
    // rate-limit increment so one demo query consumes 1 unit total, not 2.
    try {
      const verification = await checkBotId();
      if (verification.isBot) {
        return NextResponse.json({ error: 'bot_detected' }, { status: 403 });
      }
    } catch (err) {
      console.error('[answer] checkBotId failed', err);
      if (process.env.NODE_ENV === 'production') {
        return NextResponse.json({ error: 'bot_check_unavailable' }, { status: 503 });
      }
    }
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

  const ids = validRefs.map((c) => c.id);

  const { data: dbChunks, error: dbErr } = await supabase
    .from('pathway_chunks')
    .select('id, category, source_type, heading, anchor, slug, content')
    .in('id', ids)
    .in('category', [category, 'shared']);

  if (dbErr) {
    return NextResponse.json({ error: 'db_error' }, { status: 500 });
  }

  const fetched = (dbChunks ?? []) as DbChunk[];

  if (fetched.length !== ids.length) {
    return NextResponse.json(
      { error: 'cross_category_or_missing_chunks' },
      { status: 403 },
    );
  }

  const orderedChunks = ids
    .map((id) => fetched.find((c) => c.id === id))
    .filter((c): c is DbChunk => c !== undefined);

  const prompt = buildAnswerPrompt(
    query,
    category,
    orderedChunks.map((c) => ({
      id: c.id,
      source_type: c.source_type,
      heading: c.heading,
      content: c.content,
    })),
  );

  try {
    const completion = await openai.chat.completions.create({
      model: MODEL,
      max_tokens: 500,
      temperature: 0.2,
      response_format: { type: 'json_object' },
      messages: [
        { role: 'system', content: prompt.system },
        {
          role: 'user',
          content: `Question: ${prompt.user}\n\nPassages:\n${prompt.context}`,
        },
      ],
    });

    const raw = completion.choices[0]?.message?.content?.trim() ?? '';
    if (!raw) {
      return NextResponse.json({ error: 'empty_answer' }, { status: 503 });
    }

    let parsed: { answered?: unknown; answer?: unknown };
    try {
      parsed = JSON.parse(raw);
    } catch {
      console.error('[answer] json_parse_failure', raw);
      return NextResponse.json({ error: 'answer_unavailable' }, { status: 503 });
    }

    const answered = parsed.answered === true;
    const answer = typeof parsed.answer === 'string' ? parsed.answer.trim() : '';

    if (!answered || !answer) {
      return NextResponse.json({ refused: true, citations: [] });
    }

    const citedIndexes = extractCitedIndexes(answer);
    const citationIds = citedIndexes
      .map((n) => prompt.numberedIds[n - 1])
      .filter((id): id is number => typeof id === 'number');

    return NextResponse.json({
      refused: false,
      answer,
      citationIds,
      usage: completion.usage ?? null,
    });
  } catch (err) {
    console.error('[answer] openai_failure', err);
    return NextResponse.json({ error: 'answer_unavailable' }, { status: 503 });
  }
}
