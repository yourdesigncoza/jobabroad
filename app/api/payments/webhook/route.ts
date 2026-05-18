import { NextRequest, NextResponse } from 'next/server';
import { waitUntil } from '@vercel/functions';
import { getPaymentProvider } from '@/lib/payments/provider';
import { applySuccessfulPayment } from '@/lib/payments/apply';
import { generateReport } from '@/lib/reports/generator';
import { sendReportReadyEmail } from '@/lib/notifications/report-ready-email';

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

  // Pre-warm the PDF when this webhook is the one that flipped the tier.
  // Runs in background via waitUntil; the buyer's dashboard polls
  // /api/reports/status to see when it lands. Errors are caught inside
  // generateReport and reflected in paid_reports.generation_status so the
  // dashboard can show a "try again" CTA without us blocking the webhook ack.
  if (result.flipped) {
    waitUntil(generateAndEmail(evt.userId));
  }

  return NextResponse.json(
    result.flipped ? { ok: true } : { ok: true, noop: result.reason },
  );
}

async function generateAndEmail(userId: string) {
  try {
    const { pdfBuffer, userName, categoryLabel } = await generateReport(userId);
    await sendReportReadyEmail(userId, pdfBuffer, userName, categoryLabel);
  } catch (err) {
    // generateReport already wrote status='failed' to paid_reports — the
    // dashboard surfaces this and offers the user a retry. Just log here.
    console.error('[webhook] generate+email failed', { userId, err });
  }
}
