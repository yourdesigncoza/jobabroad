---
step: 07
title: Checkout API + webhook — initiate + flip tier on success
status: blocked
depends: [06]
plan: r495-paid-tier
---

# Step 07: /api/payments/checkout + /api/payments/webhook

## Objective

Two API routes. `checkout` initiates a session via `getPaymentProvider()`
and returns the URL to redirect the user to. `webhook` verifies the
provider's signed callback and flips `profiles.tier='paid'` +
`paid_email_credits=5` for the matching user.

## Context

### Architecture

Flow:
1. User on `/members/[category]/score` clicks paywall CTA → client POSTs
   to `/api/payments/checkout` → response includes `checkoutUrl` → client
   does `window.location.href = checkoutUrl`.
2. User pays on provider's hosted page.
3. Provider sends signed webhook to `/api/payments/webhook`.
4. Webhook verifies signature; if success, updates
   `profiles.tier='paid'`, `paid_email_credits=5`, and stores
   `external_ref` in a new column or audit row.
5. Provider also redirects user to `successUrl =
   /members/[category]/paid?ref=...`.
6. The success page polls `profile.tier` (max 5s) to handle race where
   user lands before webhook flips. If still free, show "Confirming
   payment…" with manual retry.

### Database

- `profiles.tier` and `profiles.paid_email_credits` from step 01.
- For idempotency, store the `external_ref` of the successful payment so
  a re-sent webhook is a no-op. Simplest: add column
  `profiles.last_payment_ref text` (nullable). Webhook checks `if
  last_payment_ref = externalRef return 200 noop`. Otherwise update +
  set last_payment_ref.

(Strictly we should have a `payments` audit table, but for one product
@ R495 with a single price point, `last_payment_ref` is sufficient. Add
audit table later if needed.)

### Existing Patterns

- API routes in `app/api/...` use `createSupabaseServerClient` for
  user-context calls (auth.getUser).
- Webhook route uses `createSupabaseServiceClient` from
  `lib/supabase/service.ts` because there's no user session in a webhook
  call.
- BotID is registered in `instrumentation-client.ts` per protected path.
  `/api/payments/webhook` MUST NOT be BotID-protected (server-to-server).
  `/api/payments/checkout` is user-initiated — BotID it.

### Risk

- **R1:** Race condition between provider redirect and webhook. Polling
  on the success page (5s max) covers it.
- Webhook MUST be idempotent. Mitigated by `last_payment_ref` check.
- Webhook MUST verify signature (per step 06). On invalid signature,
  return 401 with no body change.

## Implementation

1. `last_payment_ref` column was already added in step 01's migration. No additional DDL here.

2. Create `app/api/payments/checkout/route.ts`:

```ts
import { NextRequest, NextResponse } from 'next/server';
import { createSupabaseServerClient } from '@/lib/supabase/server';
import { getPaymentProvider } from '@/lib/payments/provider';

export const dynamic = 'force-dynamic';
const PRICE_CENTS = 49500; // R495.00

export async function POST(req: NextRequest) {
  const ssr = await createSupabaseServerClient();
  const { data: { user } } = await ssr.auth.getUser();
  if (!user?.email) {
    return NextResponse.json({ error: 'unauthorized' }, { status: 401 });
  }

  const { data: profile } = await ssr.from('profiles').select('tier, category').eq('user_id', user.id).single();
  if (!profile) {
    return NextResponse.json({ error: 'no profile' }, { status: 401 });
  }
  if (profile.tier === 'paid') {
    return NextResponse.json({ error: 'already paid' }, { status: 400 });
  }

  const origin = req.nextUrl.origin;
  const session = await getPaymentProvider().initiateCheckout({
    userId: user.id,
    email: user.email,
    amountCents: PRICE_CENTS,
    successUrl: `${origin}/members/${profile.category}/paid?ref={REF}`,
    cancelUrl:  `${origin}/members/${profile.category}/score`,
  });

  return NextResponse.json({ checkoutUrl: session.checkoutUrl });
}
```

3. Create `app/api/payments/webhook/route.ts`:

```ts
import { NextRequest, NextResponse } from 'next/server';
import { createSupabaseServiceClient } from '@/lib/supabase/service';
import { getPaymentProvider } from '@/lib/payments/provider';

export const dynamic = 'force-dynamic';
const PRICE_CENTS = 49500;

export async function POST(req: NextRequest) {
  let evt;
  try {
    evt = await getPaymentProvider().verifyWebhook(req);
  } catch (e) {
    console.error('[webhook] verify failed', e);
    return new NextResponse('invalid signature', { status: 401 });
  }

  if (evt.status !== 'success') {
    return NextResponse.json({ ok: true, noop: 'not success' });
  }

  // Sanity-check amount
  if (evt.amountCents !== PRICE_CENTS) {
    console.error('[webhook] amount mismatch', evt.amountCents);
    return new NextResponse('amount mismatch', { status: 400 });
  }

  // userId is normalised by the provider impl (see step 06)
  const userId = evt.userId;
  if (!userId) {
    return new NextResponse('missing user', { status: 400 });
  }

  const svc = createSupabaseServiceClient();

  // Idempotency
  const { data: profile } = await svc.from('profiles').select('tier, last_payment_ref').eq('user_id', userId).single();
  if (profile?.last_payment_ref === evt.externalRef) {
    return NextResponse.json({ ok: true, noop: 'duplicate webhook' });
  }

  const { error } = await svc.from('profiles').update({
    tier: 'paid',
    paid_email_credits: 5,
    last_payment_ref: evt.externalRef,
  }).eq('user_id', userId);

  if (error) {
    console.error('[webhook] db update failed', error);
    return new NextResponse('db error', { status: 500 });
  }

  return NextResponse.json({ ok: true });
}
```

4. Create `app/members/[category]/paid/page.tsx`:
   - Server page; reads `profile.tier`.
   - If `tier='paid'`: show success view with "Download report" + "Book your call" CTAs.
   - If `tier='free'`: show "Confirming payment…" + client-side script that polls (or just a meta refresh every 3s, max 5 attempts).
   - Important: keep this page minimal — the real paid surfaces live on the dashboard (step 09).

5. Update wizard's checkout button (handled in step 04's ScoreResult):
   ```tsx
   async function handleUpgrade() {
     const r = await fetch('/api/payments/checkout', { method: 'POST' });
     const { checkoutUrl } = await r.json();
     window.location.href = checkoutUrl;
   }
   ```

6. Register `/api/payments/checkout` POST in `instrumentation-client.ts`
   BotID protected list. Do NOT add `/api/payments/webhook`.

## Files to Create/Modify

| Action | File | Purpose |
|--------|------|---------|
| create | `app/api/payments/checkout/route.ts` | Initiate checkout |
| create | `app/api/payments/webhook/route.ts` | Verify + flip tier |
| create | `app/members/[category]/paid/page.tsx` | Post-payment thank-you with poll |
| modify | `instrumentation-client.ts` | Add checkout to BotID protected list |

## Done When

1. POST `/api/payments/checkout` returns `{ checkoutUrl }` for a logged-in free user; returns 400 if already paid.
2. Webhook with valid signature + success status flips `profiles.tier` to `'paid'` and credits to `5`.
3. Webhook with the same external_ref a second time is a no-op (idempotent).
4. Webhook with invalid signature returns 401 and DB is unchanged.
5. `/members/[category]/paid` shows the post-payment view; polls if tier hasn't flipped yet.
6. Build passes.
7. Manual e2e (sandbox provider): pay R5 test → land on paid page → dashboard shows paid surfaces (step 09).

## Gotchas

- Some providers (PayFast) don't pass arbitrary `metadata` — you may
  need to use a `custom_str1` field. Wrap that detail inside the
  provider impl; the abstraction exposes `metadata?: Record<string, unknown>`.
- `userId` in metadata: set it during `initiateCheckout` from the
  authenticated user, NEVER trust the webhook's user identifier without
  the metadata round-trip.
- If user pays twice (browser tab issues), the second webhook is a no-op
  via idempotency, but the provider may have charged twice. Refund is
  manual via the provider dashboard (out of scope; per brief).
