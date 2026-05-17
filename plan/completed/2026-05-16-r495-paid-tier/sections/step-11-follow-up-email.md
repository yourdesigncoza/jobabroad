---
step: 11
title: Follow-up send — /api/follow-up/send + atomic credit decrement
status: blocked
depends: [01, 07, 09]
plan: r495-paid-tier
---

# Step 11: Email follow-up endpoint

## Objective

The dashboard's `FollowUpForm` POSTs here. Server atomically decrements
`paid_email_credits` (only if > 0), sends an email to John's Gmail via
Brevo with the buyer's email as `reply-to`.

## Context

### Architecture

Single endpoint: `/api/follow-up/send`. Input: `{ subject, body }`. The
SQL update uses `WHERE paid_email_credits > 0` so two simultaneous tabs
can't double-spend. Atomic increment pattern.

Sends via Brevo's transactional API (`POST https://api.brevo.com/v3/smtp/email`)
with:
- `from`: `{ email: 'no-reply@jobabroad.co.za', name: 'Jobabroad Follow-up' }`
- `to`: `[{ email: 'JOHN_INBOX', name: 'John Montgomery' }]`
- `replyTo`: `{ email: buyerEmail, name: buyerName }`
- `subject`: prefixed with `[Follow-up — {category}]`
- `htmlContent`: simple template with the buyer's question + a link to
  their profile

### Database

```sql
update profiles
   set paid_email_credits = paid_email_credits - 1
 where user_id = $1 and paid_email_credits > 0
returning paid_email_credits;
```

If `returning` is empty, the user had 0 credits — return 403.

### Existing Patterns

- Brevo SMTP is already used by Supabase Auth (configured today). For
  this transactional send we use Brevo's REST API directly:
  `POST https://api.brevo.com/v3/smtp/email` with `api-key` header.
  Need a Brevo API key (different from SMTP key) — generated in
  Brevo dashboard.

  New env var: `BREVO_API_KEY` (server-only).

- Reusable wrapper at `lib/email/brevo.ts` with `sendEmail({ from, to, replyTo, subject, htmlContent })`.

### Risk

- **R4 (race):** Atomic UPDATE with `WHERE > 0` is sufficient.
- **R4b (best-effort rollback — KNOWN LIMITATION):** If Brevo send fails,
  we increment the credit back via a second SQL call. This is two
  separate transactions, not one. If the server crashes between the
  Brevo failure and the increment call, the user loses one credit
  silently. Accepted tradeoff: building a true cross-system transactional
  function (Outbox pattern + worker) is disproportionate for an R495
  product with 5 credits per buyer. The expected failure rate is well
  under 1%. Document in code + observe Brevo error logs; refund credits
  manually if a pattern emerges.
- Spam: rate-limit the endpoint (e.g. max 1 send per 30s per user) to
  protect John's inbox even after credits. Use a simple in-memory map
  in v1 (fine since Vercel function is stateless per request… actually
  not reliable). Better: use Supabase row-level lock or skip rate-limit
  in v1 — credits cap natural usage to 5 per buyer.
- Markdown injection: render `body` as plain text in HTML (escape
  HTML), not as raw. Sanitize subject too (strip newlines to prevent
  header injection).

## Implementation

1. Add env var `BREVO_API_KEY` to `.env.example`.

2. Create `lib/email/brevo.ts`:
```ts
const BREVO_API = 'https://api.brevo.com/v3/smtp/email';
const KEY = process.env.BREVO_API_KEY;

export async function sendEmail(opts: {
  from: { email: string; name: string };
  to: Array<{ email: string; name?: string }>;
  replyTo?: { email: string; name?: string };
  subject: string;
  htmlContent: string;
}): Promise<void> {
  if (!KEY) throw new Error('BREVO_API_KEY missing');
  const r = await fetch(BREVO_API, {
    method: 'POST',
    headers: { 'api-key': KEY, 'content-type': 'application/json' },
    body: JSON.stringify(opts),
  });
  if (!r.ok) {
    const t = await r.text();
    throw new Error(`Brevo ${r.status}: ${t}`);
  }
}

function escapeHtml(s: string): string {
  return s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
}

function stripNewlines(s: string): string {
  return s.replace(/[\r\n]+/g, ' ').trim();
}

export const __util = { escapeHtml, stripNewlines };
```

3. Create `app/api/follow-up/send/route.ts`:
```ts
import { NextRequest, NextResponse } from 'next/server';
import { createSupabaseServerClient } from '@/lib/supabase/server';
import { sendEmail, __util } from '@/lib/email/brevo';
import { CATEGORIES } from '@/lib/categories';

const JOHN_INBOX = process.env.JOHN_INBOX_EMAIL!;

export const dynamic = 'force-dynamic';

export async function POST(req: NextRequest) {
  const ssr = await createSupabaseServerClient();
  const { data: { user } } = await ssr.auth.getUser();
  if (!user?.email) {
    return NextResponse.json({ error: 'unauth' }, { status: 401 });
  }

  let body: { subject?: string; body?: string };
  try { body = await req.json(); } catch { return NextResponse.json({ error: 'bad json' }, { status: 400 }); }

  const subject = String(body.subject ?? '').slice(0, 120).trim();
  const message = String(body.body ?? '').slice(0, 2000).trim();
  if (!subject || !message) {
    return NextResponse.json({ error: 'subject and body required' }, { status: 400 });
  }

  const { data: profile } = await ssr.from('profiles').select('name, category').eq('user_id', user.id).single();
  if (!profile) return NextResponse.json({ error: 'no profile' }, { status: 401 });

  // Atomic decrement — only succeeds if > 0
  const { data: updated, error } = await ssr
    .from('profiles')
    .update({ paid_email_credits: { raw: 'paid_email_credits - 1' } as any })
    .eq('user_id', user.id)
    .gt('paid_email_credits', 0)
    .select('paid_email_credits')
    .single();

  if (error || !updated) {
    return NextResponse.json({ error: 'no credits' }, { status: 403 });
  }

  // (Supabase JS doesn't support raw SQL in update; use rpc or a DB function. See "Gotchas".)

  const categoryLabel = CATEGORIES.find(c => c.id === profile.category)?.label ?? profile.category;
  const safeSubject = __util.stripNewlines(subject);
  const safeBody = __util.escapeHtml(message).replace(/\n/g, '<br>');

  try {
    await sendEmail({
      from:    { email: 'no-reply@jobabroad.co.za', name: 'Jobabroad Follow-up' },
      to:      [{ email: JOHN_INBOX, name: 'John Montgomery' }],
      replyTo: { email: user.email, name: profile.name },
      subject: `[Follow-up — ${categoryLabel}] ${safeSubject}`,
      htmlContent: `
        <p>From: <strong>${__util.escapeHtml(profile.name)}</strong> &lt;${user.email}&gt;</p>
        <p>Category: ${categoryLabel}</p>
        <hr>
        <p>${safeBody}</p>
        <hr>
        <p style="color:#888;font-size:12px">Reply directly to this email — it goes to ${__util.escapeHtml(profile.name)}.</p>
      `,
    });
  } catch (e) {
    console.error('[follow-up] send failed', e);
    // ROLLBACK the credit — but Supabase JS lacks transactions. Best-effort: increment back.
    await ssr.from('profiles').update({ paid_email_credits: { raw: 'paid_email_credits + 1' } as any }).eq('user_id', user.id);
    return NextResponse.json({ error: 'send failed' }, { status: 502 });
  }

  return NextResponse.json({ ok: true, remaining: updated.paid_email_credits });
}
```

**IMPORTANT — atomic decrement via DB function:**

Supabase JS doesn't support raw SQL in `.update()`. Need a Postgres
function. Add to step 01 migration OR a small follow-up migration:

```sql
create or replace function public.decrement_email_credit(p_user_id uuid)
returns int
language plpgsql security definer
as $$
declare
  new_credits int;
begin
  update profiles
     set paid_email_credits = paid_email_credits - 1
   where user_id = p_user_id and paid_email_credits > 0
   returning paid_email_credits into new_credits;
  return new_credits;  -- null if no update happened
end;
$$;

grant execute on function public.decrement_email_credit(uuid) to authenticated;
```

In the API route:
```ts
const { data: remaining, error } = await ssr.rpc('decrement_email_credit', { p_user_id: user.id });
if (error || remaining === null) {
  return NextResponse.json({ error: 'no credits' }, { status: 403 });
}
```

And for rollback on send-failure:
```sql
create or replace function public.increment_email_credit(p_user_id uuid)
returns int
language plpgsql security definer
as $$
declare
  new_credits int;
begin
  update profiles
     set paid_email_credits = paid_email_credits + 1
   where user_id = p_user_id
   returning paid_email_credits into new_credits;
  return new_credits;
end;
$$;

grant execute on function public.increment_email_credit(uuid) to authenticated;
```

Add both functions to step 01's migration (or this step's own additional migration).

4. Add env vars to `.env.example`:
```
BREVO_API_KEY=
JOHN_INBOX_EMAIL=laudes.michael@gmail.com
```

5. Register `/api/follow-up/send` POST in BotID protect list.

## Files to Create/Modify

| Action | File | Purpose |
|--------|------|---------|
| create | `lib/email/brevo.ts` | Brevo REST API wrapper |
| create | `app/api/follow-up/send/route.ts` | Decrement + send (uses `decrement_email_credit` RPC declared in step 01) |
| modify | `.env.example` | Document `BREVO_API_KEY` and `JOHN_INBOX_EMAIL` |
| modify | `instrumentation-client.ts` | Add `/api/follow-up/send` to BotID |

## Done When

1. Paid user with credits=5 sends a follow-up → John receives the email at his inbox, with `reply-to` set to buyer's email → credits=4.
2. Re-submitting the same form (now credits=4) → credits=3.
3. At credits=0, the endpoint returns 403 and the dashboard form shows the "out of follow-ups" state.
4. Send failure (e.g. Brevo down) → credit is rolled back.
5. Subject + body are escaped/stripped (no header injection, no raw HTML).
6. Build passes.

## Gotchas

- **DB function pattern is the only safe atomic decrement** in Supabase
  JS. Don't try to fake it with read-then-write — race vulnerable.
- Brevo's REST API uses `api-key` header, NOT `Authorization: Bearer`.
  Different from SMTP credentials in the dashboard.
- `JOHN_INBOX_EMAIL` is server-only (no `NEXT_PUBLIC_` prefix).
- If John ever wants 2-way threading later, we'd need to capture his
  reply via webhook into Brevo's inbound parsing. Out of v1 scope.
