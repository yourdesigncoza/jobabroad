import { NextRequest, NextResponse } from 'next/server';
import { readdir } from 'node:fs/promises';
import { existsSync } from 'node:fs';
import path from 'node:path';
import { createSupabaseServerClient } from '@/lib/supabase/server';
import { isAdminEmail } from '@/lib/auth-guards';
import { loadThread } from '@/lib/wa-assistant/thread';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

const CONVERSATIONS_DIR = path.join(
  process.cwd(),
  'docs/whatsapp-notes/conversations',
);

export interface ContactSummary {
  phone: string;
  turns: number;
  lastDate: string;
  status: string | null;
  categoryInterest: string | null;
}

// Lists every logged conversation so the assistant UI can offer a
// "recent contacts" dropdown — saves the admin remembering phone numbers.
export async function GET(_req: NextRequest) {
  const ssr = await createSupabaseServerClient();
  const { data: { user } } = await ssr.auth.getUser();
  if (!isAdminEmail(user?.email)) {
    return NextResponse.json({ error: 'not_found' }, { status: 404 });
  }

  try {
    if (!existsSync(CONVERSATIONS_DIR)) {
      return NextResponse.json({ contacts: [] });
    }
    const files = (await readdir(CONVERSATIONS_DIR)).filter((f) =>
      /^\d{10,15}\.md$/.test(f),
    );
    const contacts: ContactSummary[] = await Promise.all(
      files.map(async (f) => {
        const phone = f.replace(/\.md$/, '');
        const thread = await loadThread(phone);
        const last = thread.turns[thread.turns.length - 1];
        return {
          phone,
          turns: thread.turns.length,
          lastDate: last?.date ?? '',
          status: thread.status,
          categoryInterest: thread.categoryInterest,
        };
      }),
    );
    // Most recently active first.
    contacts.sort((a, b) => b.lastDate.localeCompare(a.lastDate));
    return NextResponse.json({ contacts });
  } catch (err) {
    console.error('[wa-assistant/contacts]', err);
    return NextResponse.json(
      { error: 'load_failed', detail: err instanceof Error ? err.message : 'unknown' },
      { status: 500 },
    );
  }
}
