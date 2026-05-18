import Link from 'next/link';
import { notFound, redirect } from 'next/navigation';
import { waitUntil } from '@vercel/functions';
import { CATEGORIES } from '@/lib/categories';
import { requireProfile } from '@/lib/auth-guards';
import { getPaymentProvider } from '@/lib/payments/provider';
import { applySuccessfulPayment } from '@/lib/payments/apply';
import { generateReport } from '@/lib/reports/generator';
import { sendReportReadyEmail } from '@/lib/notifications/report-ready-email';

export const dynamic = 'force-dynamic';

async function generateAndEmail(userId: string) {
  try {
    const { pdfBuffer, userName, categoryLabel } = await generateReport(userId);
    await sendReportReadyEmail(userId, pdfBuffer, userName, categoryLabel);
  } catch (err) {
    console.error('[paid] generate+email fallback failed', { userId, err });
  }
}

export default async function PaidLandingPage({
  params,
  searchParams,
}: {
  params: Promise<{ category: string }>;
  searchParams: Promise<{ reference?: string; trxref?: string }>;
}) {
  const { category } = await params;
  if (!CATEGORIES.some((c) => c.id === category)) notFound();

  const { user, profile, supabase } = await requireProfile(`/members/${category}/paid`);
  if (!profile) redirect('/dashboard');
  if (profile.category !== category) redirect(`/members/${profile.category}/paid`);

  const { data: tierRow } = await supabase
    .from('profiles')
    .select('tier')
    .eq('user_id', user.id)
    .single();

  let isPaid = tierRow?.tier === 'paid';

  // Fallback: webhook hasn't flipped tier yet but we have a provider reference.
  // Ask the provider directly. If it confirms success, flip tier ourselves
  // (idempotent — webhook will arrive later and no-op via last_payment_ref).
  if (!isPaid) {
    const sp = await searchParams;
    const reference = sp.reference ?? sp.trxref;
    if (reference) {
      try {
        const evt = await getPaymentProvider().verifyTransaction(reference);
        // Only flip if the provider says success AND the userId matches the
        // current session — never trust a query param to identify users.
        if (evt.status === 'success' && evt.userId === user.id) {
          const result = await applySuccessfulPayment(evt);
          if (result.ok && (result.flipped || result.reason === 'duplicate')) {
            isPaid = true;
            // If this fallback was the one that flipped the tier (webhook never
            // arrived), pre-warm the PDF ourselves so the dashboard isn't
            // stuck waiting on a webhook that's never coming.
            if (result.flipped) {
              waitUntil(generateAndEmail(user.id));
            }
          }
        }
      } catch (err) {
        // Verify failed (network, unknown ref, etc.) — fall through to polling UI.
        console.error('[paid] verifyTransaction fallback failed', err);
      }
    }
  }

  if (isPaid) {
    // Dashboard owns the "preparing your report" state; no interstitial.
    redirect('/dashboard');
  }

  // Race: user landed before webhook flipped tier. Soft-poll via meta refresh.
  return (
    <main className="min-h-screen" style={{ backgroundColor: '#F8F5F0' }}>
      <meta httpEquiv="refresh" content="3" />
      <div className="max-w-xl mx-auto px-6 py-20 flex flex-col gap-6">
        <h1
          className="font-display font-bold uppercase tracking-wide text-3xl"
          style={{ color: '#2C2C2C' }}
        >
          Confirming payment…
        </h1>
        <p className="font-body" style={{ color: '#6B6B6B' }}>
          Hang tight — we&apos;re waiting for your bank&apos;s confirmation. This page refreshes automatically.
        </p>
        <p className="font-body text-sm" style={{ color: '#6B6B6B' }}>
          Stuck for longer than 30 seconds?{' '}
          <Link href="/dashboard" className="underline" style={{ color: '#1B4D3E' }}>
            Refresh your dashboard
          </Link>{' '}
          — if the paid tier is active there, you&apos;re sorted.
        </p>
      </div>
    </main>
  );
}
