---
step: 06
title: Payment provider abstraction (Paystack or PayFast)
status: blocked
depends: [01]
plan: r495-paid-tier
---

# Step 06: Payment provider abstraction + one impl

## Objective

A small interface so the caller code doesn't know whether we're using
Paystack or PayFast. At execution time the user has chosen (based on
which approved their merchant account) and we ship one impl.

## Context

### Architecture

Decision point: **the user must tell the executor which provider** before
this step runs.

Both providers have:
- A way to start a checkout (returns a hosted-checkout URL + a server-side
  reference)
- A webhook callback after success (signed by the provider; we verify
  signature)

Common interface:

```ts
// lib/payments/provider.ts

export interface CheckoutSession {
  checkoutUrl: string;     // redirect the user here
  externalRef: string;     // provider's transaction ID, store for webhook correlation
}

export interface VerifiedWebhook {
  externalRef: string;     // matches CheckoutSession.externalRef
  status: 'success' | 'failed' | 'pending';
  amountCents: number;     // for sanity check against expected R495 = 49500
  userId: string;          // normalised — provider impl maps from its own field
                           //   (Paystack: metadata.userId; PayFast: custom_str1)
  metadata?: Record<string, unknown>;  // raw, for debugging only — callers shouldn't depend on this
}

export interface PaymentProvider {
  initiateCheckout(opts: {
    userId: string;
    email: string;
    amountCents: number;   // 49500
    successUrl: string;    // where to land after pay success
    cancelUrl: string;     // where to land after cancel
  }): Promise<CheckoutSession>;

  /** Throws on invalid signature; returns normalised event. */
  verifyWebhook(req: Request): Promise<VerifiedWebhook>;
}

export function getPaymentProvider(): PaymentProvider {
  // Single source of truth — swap this one line when changing provider
  // return new PaystackProvider();
  // return new PayFastProvider();
}
```

### Database

No schema changes. Webhook handler (step 07) reads/writes `profiles`.

### Existing Patterns

Service-role Supabase client is acceptable for the webhook handler since
it's server-side and idempotent.

### Risk

- **R6:** Provider-specific shapes leaking into callers. Mitigation: the
  provider impl is responsible for normalising `userId` from the
  provider's specific carrier field (Paystack `metadata.userId`,
  PayFast `custom_str1`, etc.) into the top-level `VerifiedWebhook.userId`
  field. Callers consume only the normalised interface and never touch
  `metadata` for business logic (it's debug-only).
- Signature verification is **mandatory** — both Paystack and PayFast
  send signed payloads. Skipping verification = accepting fake "user
  paid" events.

### Provider-specific notes

**Paystack** (if chosen):
- Init: POST `https://api.paystack.co/transaction/initialize` with
  `Authorization: Bearer sk_...` + body `{ email, amount, callback_url }`
- Returns `{ data: { authorization_url, reference } }`
- Webhook: HMAC SHA-512 of body with `PAYSTACK_SECRET_KEY` →
  `x-paystack-signature` header
- Event: `charge.success` with `data.reference` + `data.amount`

**PayFast** (if chosen):
- Init: POST hosted form to `https://www.payfast.co.za/eng/process` with
  signed form fields (signature = MD5 of sorted params + passphrase)
- No "initialize" API; you build the redirect URL with form fields
- ITN webhook: PayFast POSTs to your `notify_url` with the signed payload
  (signature in `signature` field)
- Verify by recomputing signature AND making a server-to-server POST to
  PayFast's validate endpoint with the same payload

Both → similar interface; impl is one ~150-line file per provider.

## Implementation

1. Create `lib/payments/types.ts` with the interface above.

2. Create `lib/payments/provider.ts` with `getPaymentProvider()` that
   returns the chosen impl. Comments explain the swap.

3. Create EITHER `lib/payments/paystack.ts` OR `lib/payments/payfast.ts`
   (not both — only the chosen one). Implement:
   - `initiateCheckout(opts)` → returns `{ checkoutUrl, externalRef }`
   - `verifyWebhook(req)` → reads request body, verifies signature,
     returns `VerifiedWebhook`. Throws on invalid signature.

4. Required env vars (document in `.env.example`):
   - Paystack: `PAYSTACK_SECRET_KEY`, `PAYSTACK_PUBLIC_KEY`
   - PayFast: `PAYFAST_MERCHANT_ID`, `PAYFAST_MERCHANT_KEY`,
     `PAYFAST_PASSPHRASE`, `PAYFAST_SANDBOX` (true/false)

## Files to Create/Modify

| Action | File | Purpose |
|--------|------|---------|
| create | `lib/payments/types.ts` | TS interface |
| create | `lib/payments/provider.ts` | `getPaymentProvider()` factory |
| create | `lib/payments/{paystack OR payfast}.ts` | Chosen impl |
| modify | `.env.example` | Document required env vars |

## Done When

1. Caller code can do `const p = getPaymentProvider(); await p.initiateCheckout(...)` without knowing which provider is wired.
2. Webhook verification throws on tampered payload (manually test with a flipped signature).
3. Env vars are documented in `.env.example`.
4. Build passes.

## Gotchas

- Don't import provider-specific SDKs in any file other than the impl.
  `provider.ts` returns the abstract interface only.
- Webhook handler will pass the raw request body to `verifyWebhook` —
  provider needs the exact bytes for signature verification, not parsed
  JSON. Use `await req.text()` not `await req.json()`.
- Amount handling: both providers use cents (Paystack) or rands (PayFast
  ZAR). Our interface is `amountCents`; PayFast impl divides by 100 on
  init. Keep the conversion *inside* the impl.
