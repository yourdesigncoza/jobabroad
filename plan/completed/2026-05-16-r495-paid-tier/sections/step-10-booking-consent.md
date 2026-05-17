---
step: 10
title: /members/[category]/book — Cal.com embed + POPIA consent + bookings insert
status: blocked
depends: [01, 07]
plan: r495-paid-tier
---

# Step 10: Booking page with POPIA consent

## Objective

A new page where paid users book their 15-min call. The page shows a
Cal.com embed and gates it behind a mandatory POPIA recording-consent
checkbox. On submit, insert a `bookings` row with `consented_at`.

## Context

### Architecture

Cal.com setup (manual prep done by John, see "Pre-flight" below):
- Create Cal.com account for `jobabroad`
- Event type: 15-min "Jobabroad intro" with daily slot cap
- Embed code (`cal.com/embed.js` + `<button data-cal-link>` or
  `Cal('inline')`)
- Webhook to `/api/booking/webhook` on `booking.created` (optional v1.5
  enhancement to record `slot_at` and `external_ref`)

Flow:
1. Paid user clicks "Book your 15-min call" on dashboard.
2. Lands on `/members/[category]/book`.
3. Page shows POPIA consent checkbox + Cal.com embed. Embed is **disabled
   via overlay** until checkbox is ticked.
4. On tick: client POSTs `/api/booking/consent` to insert `bookings`
   row with `consented_at = now()` and `slot_at = null`.
5. Embed unlocks.
6. User picks slot in Cal.com embed. Cal.com handles the booking; we
   later (optional v1.5) receive a webhook to update `bookings.slot_at`.

For v1 we capture the consent + the user's intent to book. The slot
itself is tracked in Cal.com. John can match later when he sees the
booking in Cal.com's dashboard, both sides have the user's email so
identification is easy.

### Database

`bookings` from step 01:
```
id            uuid PK
user_id       uuid FK auth.users
slot_at       timestamptz NULL (filled later by Cal.com webhook v1.5)
consented_at  timestamptz NOT NULL
external_ref  text NULL (Cal.com booking id, future)
created_at    timestamptz
```

A user can have multiple `bookings` rows (rebooking after the first
call). For v1 we don't restrict — just append.

### Existing Patterns

- Page is server component; gates: `requireProfile` + `tier='paid'`
- `/api/booking/consent` is BotID-gated POST (register in
  `instrumentation-client.ts`)
- POPIA: South Africa's Protection of Personal Information Act. Recording
  a call without explicit consent = breach. Consent must be informed +
  specific + recorded.

### Risk

- **R5 (POPIA):** Critical. Keep the wording simple and plain — overcomplicating the legal language costs conversions and isn't required. Use this one-liner verbatim:

  > "I agree that this call may be recorded for the purpose of preparing or improving my work-abroad guidance."

  DB enforces `consented_at NOT NULL` so an app bug can't create a row without consent. (We can layer fuller disclosure into a linked "How we handle your data" page later if needed — do not bloat the checkbox itself.)

- **R8 (Cal.com cost/branding):** Cal.com free tier has Cal.com
  branding on the booking page. For a paid product this is mildly
  unprofessional. Recommend the Cal.com Teams ($15/month) tier to
  whitelabel, OR self-host (free but ops overhead). Decision belongs to
  John at execution.

## Implementation

### Pre-flight (John)

Before step 10 executes:
1. Sign up at https://cal.com — create event type "Jobabroad intro" (15 min)
2. Set daily slot cap in Cal.com event-type config
3. Set timezone to Africa/Johannesburg
4. Note the embed snippet (e.g. `https://cal.com/jobabroad/intro`)

### Code

1. Create `app/members/[category]/book/page.tsx`:

```tsx
import { redirect, notFound } from 'next/navigation';
import { CATEGORIES } from '@/lib/categories';
import { requireProfile } from '@/lib/auth-guards';
import BookingClient from './BookingClient';
import SiteNav from '@/components/SiteNav';
import SiteFooter from '@/components/SiteFooter';

export default async function BookPage({
  params,
}: {
  params: Promise<{ category: string }>;
}) {
  const { category } = await params;
  if (!CATEGORIES.some((c) => c.id === category)) notFound();

  const { profile } = await requireProfile(`/members/${category}/book`);
  if (!profile) redirect('/dashboard');
  if (profile.tier !== 'paid') redirect('/dashboard');
  if (profile.category !== category) redirect(`/members/${profile.category}/book`);

  return (
    <main style={{ backgroundColor: '#F8F5F0' }} className="min-h-screen">
      <SiteNav />
      <section className="max-w-3xl mx-auto px-6 py-12">
        <h1 className="font-display font-bold uppercase text-3xl mb-3" style={{ color: '#2C2C2C' }}>
          Book your 15-min call
        </h1>
        <p className="font-body mb-8" style={{ color: '#6B6B6B' }}>
          One 15-minute call to walk through your report and answer your specific questions.
        </p>
        <BookingClient userEmail={profile.user_id /* …or fetch via user */} />
      </section>
      <SiteFooter />
    </main>
  );
}
```

2. Create `app/members/[category]/book/BookingClient.tsx` (`'use client'`):

```tsx
'use client';

import { useState } from 'react';
import Script from 'next/script';

const CONSENT_TEXT = `I agree that this call may be recorded for the purpose of preparing or improving my work-abroad guidance.`;

export default function BookingClient() {
  const [consented, setConsented] = useState(false);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function onToggle(checked: boolean) {
    if (!checked) {
      setConsented(false);
      return;
    }
    setBusy(true);
    setError(null);
    const r = await fetch('/api/booking/consent', { method: 'POST' });
    setBusy(false);
    if (!r.ok) {
      const j = await r.json().catch(() => ({}));
      setError(j.error ?? 'consent save failed');
      return;
    }
    setConsented(true);
  }

  return (
    <div className="flex flex-col gap-6">
      <label className="flex items-start gap-3 p-4 rounded-lg" style={{ backgroundColor: '#FFFFFF', border: '1px solid #EDE8E0' }}>
        <input
          type="checkbox"
          checked={consented}
          disabled={busy}
          onChange={(e) => onToggle(e.target.checked)}
          className="mt-1 accent-[#1B4D3E]"
        />
        <span className="font-body text-sm" style={{ color: '#2C2C2C' }}>
          {CONSENT_TEXT}
        </span>
      </label>

      {error && <p style={{ color: '#b00020' }}>{error}</p>}

      <div className="relative">
        {/* Cal.com inline embed */}
        <div
          data-cal-namespace=""
          data-cal-link="jobabroad/intro"
          data-cal-config='{"layout":"month_view"}'
          style={{ width: '100%', minHeight: '600px', pointerEvents: consented ? 'auto' : 'none', opacity: consented ? 1 : 0.4 }}
        />
        {!consented && (
          <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
            <p className="font-display uppercase tracking-wide text-sm" style={{ color: '#6B6B6B' }}>
              Tick the consent checkbox above to unlock booking
            </p>
          </div>
        )}
      </div>

      {/* Cal.com embed script */}
      <Script
        src="https://app.cal.com/embed/embed.js"
        strategy="afterInteractive"
      />
    </div>
  );
}
```

3. Create `app/api/booking/consent/route.ts`:

```ts
import { NextRequest, NextResponse } from 'next/server';
import { createSupabaseServerClient } from '@/lib/supabase/server';

export const dynamic = 'force-dynamic';

export async function POST(_req: NextRequest) {
  const ssr = await createSupabaseServerClient();
  const { data: { user } } = await ssr.auth.getUser();
  if (!user) return NextResponse.json({ error: 'unauth' }, { status: 401 });

  const { data: profile } = await ssr.from('profiles').select('tier').eq('user_id', user.id).single();
  if (profile?.tier !== 'paid') return NextResponse.json({ error: 'paid only' }, { status: 403 });

  const { error } = await ssr.from('bookings').insert({
    user_id: user.id,
    consented_at: new Date().toISOString(),
  });
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ ok: true });
}
```

4. Register `/api/booking/consent` POST in BotID protected list.

## Files to Create/Modify

| Action | File | Purpose |
|--------|------|---------|
| create | `app/members/[category]/book/page.tsx` | Server page, gated by paid + category |
| create | `app/members/[category]/book/BookingClient.tsx` | Consent + Cal.com embed |
| create | `app/api/booking/consent/route.ts` | Insert bookings row with consent timestamp |
| modify | `instrumentation-client.ts` | Add `/api/booking/consent` to BotID protect |

## Done When

1. Paid user visiting `/members/[category]/book` sees consent checkbox + disabled Cal.com embed.
2. Ticking the checkbox → consent POST → row inserted in `bookings` with `consented_at NOT NULL` → embed unlocks.
3. Un-ticking doesn't delete the row (consent was granted at that moment).
4. Free user redirects to `/dashboard`.
5. Wrong-category user redirects to their own category's book page.
6. Build passes.

## Gotchas

- POPIA consent text MUST be the EXACT one-liner above. It is deliberately short to keep conversion friction low; do NOT re-expand into multi-clause legalese without a specific compliance ask.
- Cal.com `data-cal-link` must match the actual event slug. Hardcoded for
  v1; if changing, edit the snippet.
- `pointerEvents: 'none'` only blocks mouse — keyboard users could still
  tab into the iframe. Either also `tabIndex={-1}` or use an actual
  overlay `<div>` instead of relying on pointer-events.
- v1.5: add Cal.com webhook handler to populate `slot_at` and
  `external_ref`. Out of this step.
