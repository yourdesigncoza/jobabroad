import { NextRequest, NextResponse } from 'next/server';
import { waitUntil } from '@vercel/functions';
import { getPaymentProvider } from '@/lib/payments/provider';
import { applySuccessfulPayment } from '@/lib/payments/apply';
import { sendBookingInvite } from '@/lib/notifications/booking-invite';

export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';
export const maxDuration = 300;

export async function POST(req: NextRequest) {
  let evt;
  try {
    evt = await getPaymentProvider().verifyWebhook(req);
  } catch (err) {
    console.error('[payments/webhook] verify failed', err);
    return new NextResponse('invalid signature', { status: 401 });
  }

  const result = await applySuccessfulPayment(evt);

  if (!result.ok) {
    return new NextResponse(result.reason, { status: result.status });
  }

  // Fire-and-forget booking-invite email (no PDF — that's generated post-call by
  // the admin action). Only sent when this webhook actually flipped the tier.
  if (result.flipped) {
    waitUntil(sendBookingInvite(evt.userId));
  }

  return NextResponse.json(
    result.flipped ? { ok: true } : { ok: true, noop: result.reason },
  );
}
