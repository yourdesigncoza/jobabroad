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
    console.error('[payments/checkout]', err);
    return NextResponse.json({ error: 'checkout_failed' }, { status: 500 });
  }
}
