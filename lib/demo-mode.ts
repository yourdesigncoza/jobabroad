import { createHash } from 'crypto';
import { createClient } from '@supabase/supabase-js';
import { NextRequest, NextResponse } from 'next/server';
import { checkBotId } from 'botid/server';
import { CATEGORIES } from '@/lib/categories';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!,
);

const SEARCH_DAILY_LIMIT = Number(process.env.DEMO_SEARCH_DAILY_LIMIT ?? 25);
const WIKI_DAILY_LIMIT = Number(process.env.DEMO_WIKI_DAILY_LIMIT ?? 75);
const HASH_SECRET =
  process.env.IP_HASH_SECRET ??
  process.env.SUPABASE_SERVICE_ROLE_KEY ??
  'jobabroad-demo-fallback';

export type DemoAction = 'search' | 'wiki';

const VALID_DEMO_CATEGORIES = new Set<string>(CATEGORIES.map((c) => c.id));

export function isValidDemoCategory(value: unknown): value is string {
  return typeof value === 'string' && VALID_DEMO_CATEGORIES.has(value);
}

function getClientIp(req: NextRequest): string {
  const xff = req.headers.get('x-forwarded-for');
  if (xff) {
    const first = xff.split(',')[0]?.trim();
    if (first) return first;
  }
  const real = req.headers.get('x-real-ip');
  if (real) return real.trim();
  return '127.0.0.1';
}

function hashIp(ip: string): string {
  return createHash('sha256').update(`${HASH_SECRET}:${ip}`).digest('hex');
}

interface RateLimitRow {
  used: number;
  allowed: boolean;
}

async function checkAndIncrement(
  ipHash: string,
  action: DemoAction,
): Promise<RateLimitRow> {
  const limit = action === 'search' ? SEARCH_DAILY_LIMIT : WIKI_DAILY_LIMIT;
  const { data, error } = await supabase.rpc('increment_demo_limit', {
    p_ip_hash: ipHash,
    p_action: action,
    p_limit: limit,
  });
  if (error) {
    console.error('[demo-mode] rate-limit RPC failed', error);
    // fail open — better to serve a few extra requests than block legit users
    return { used: 0, allowed: true };
  }
  const row = (Array.isArray(data) ? data[0] : data) as RateLimitRow | undefined;
  return row ?? { used: 0, allowed: true };
}

/**
 * Run BotID + per-IP daily rate limit for a demo request.
 * Returns a NextResponse on rejection, or null on success.
 */
export async function gateDemoRequest(
  req: NextRequest,
  action: DemoAction,
): Promise<NextResponse | null> {
  try {
    const verification = await checkBotId();
    if (verification.isBot) {
      return NextResponse.json(
        { error: 'bot_detected' },
        { status: 403 },
      );
    }
  } catch (err) {
    console.error('[demo-mode] checkBotId failed', err);
    // fail closed when BotID errors in production; fail open in dev
    if (process.env.NODE_ENV === 'production') {
      return NextResponse.json({ error: 'bot_check_unavailable' }, { status: 503 });
    }
  }

  const ipHash = hashIp(getClientIp(req));
  const { allowed, used } = await checkAndIncrement(ipHash, action);
  if (!allowed) {
    const limit =
      action === 'search' ? SEARCH_DAILY_LIMIT : WIKI_DAILY_LIMIT;
    return NextResponse.json(
      { error: 'demo_limit_reached', used, limit },
      { status: 429 },
    );
  }

  return null;
}
