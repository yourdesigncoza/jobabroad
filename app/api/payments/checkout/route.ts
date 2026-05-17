import { NextRequest, NextResponse } from 'next/server';
import { createSupabaseServerClient } from '@/lib/supabase/server';
import { getPaymentProvider } from '@/lib/payments/provider';

export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';

const PRICE_CENTS = 49500; // R495.00

export async function POST(req: NextRequest) {
  const ssr = await createSupabaseServerClient();
  const {
    data: { user },
  } = await ssr.auth.getUser();
  if (!user?.email) {
    return NextResponse.json({ error: 'unauthorized' }, { status: 401 });
  }

  const { data: profile } = await ssr
    .from('profiles')
    .select('tier, category')
    .eq('user_id', user.id)
    .single();
  if (!profile) {
    return NextResponse.json({ error: 'no_profile' }, { status: 401 });
  }
  if (profile.tier === 'paid') {
    return NextResponse.json({ error: 'already_paid' }, { status: 400 });
  }

  const origin = req.nextUrl.origin;

  try {
    const session = await getPaymentProvider().initiateCheckout({
      userId: user.id,
      email: user.email,
      amountCents: PRICE_CENTS,
      successUrl: `${origin}/members/${profile.category}/paid`,
      cancelUrl: `${origin}/members/${profile.category}/score`,
    });
    return NextResponse.json({ checkoutUrl: session.checkoutUrl });
  } catch (err) {
    // Log the raw error server-side for debugging; surface a sanitised
    // diagnostic to the client so support tickets contain something useful
    // ("invalid email" vs the opaque "checkout_failed").
    console.error('[payments/checkout]', err);
    const raw = err instanceof Error ? err.message : String(err);
    return NextResponse.json(
      { error: 'checkout_failed', detail: sanitiseCheckoutError(raw) },
      { status: 500 },
    );
  }
}

/**
 * Translate provider-internal error strings into something the buyer (and we)
 * can act on, without leaking keys or full upstream payloads. Default = a
 * generic provider-rejected message so we never echo arbitrary input back.
 */
function sanitiseCheckoutError(raw: string): string {
  if (raw.includes('PAYSTACK_SECRET_KEY')) return 'Payment provider not configured. Please contact support.';
  if (raw.includes('paystack_init_failed: 401')) return 'Payment provider rejected our credentials. Please contact support.';
  if (raw.includes('paystack_init_failed: 4')) return 'Payment provider rejected the request. Please try again or contact support.';
  if (raw.includes('paystack_init_failed: 5')) return "Payment provider is having trouble right now. Please try again in a minute.";
  if (raw.includes('paystack_init_rejected')) {
    // Provider returned status:false with a human-ish message. Extract it
    // (everything after the colon-space) but cap length so we don't render
    // multi-paragraph upstream errors verbatim.
    const after = raw.split(': ').slice(1).join(': ').trim();
    return after.slice(0, 160) || 'Payment provider rejected the request.';
  }
  if (raw.toLowerCase().includes('fetch') || raw.toLowerCase().includes('econnref')) {
    return "Couldn't reach the payment provider. Check your connection and try again.";
  }
  return "We couldn't start checkout. Please try again or contact support.";
}
