import type { Metadata } from 'next';
import { createSupabaseServiceClient } from '@/lib/supabase/service';
import { requireAdmin } from '@/lib/auth-guards';
import { CATEGORIES } from '@/lib/categories';
import PostCallClient, { type PaidUserRow } from './PostCallClient';

export const dynamic = 'force-dynamic';

export const metadata: Metadata = {
  title: 'Admin · Post-call reports',
  robots: { index: false, follow: false },
};

export default async function PostCallAdminPage() {
  await requireAdmin('/admin/post-call');

  const svc = createSupabaseServiceClient();

  const { data: profiles } = await svc
    .from('profiles')
    .select('user_id, name, category, tier')
    .eq('tier', 'paid');

  const userIds = (profiles ?? []).map((p) => p.user_id);

  const [bookingsRes, reportsRes, authRes] = await Promise.all([
    svc
      .from('bookings')
      .select('user_id, slot_at, consented_at')
      .in('user_id', userIds.length ? userIds : ['00000000-0000-0000-0000-000000000000']),
    svc
      .from('paid_reports')
      .select('user_id, generated_at, call_notes')
      .in('user_id', userIds.length ? userIds : ['00000000-0000-0000-0000-000000000000']),
    svc.auth.admin.listUsers(),
  ]);

  const bookingsByUser = new Map<string, { slot_at: string | null; consented_at: string }>();
  for (const b of bookingsRes.data ?? []) {
    const prev = bookingsByUser.get(b.user_id);
    // Keep the latest booking per user (by slot_at, falling back to consent ts).
    const prevDate = prev ? Date.parse(prev.slot_at ?? prev.consented_at) : -Infinity;
    const curDate = Date.parse(b.slot_at ?? b.consented_at);
    if (!prev || curDate > prevDate) bookingsByUser.set(b.user_id, b);
  }

  const reportsByUser = new Map<string, { generated_at: string; call_notes: string | null }>();
  for (const r of reportsRes.data ?? []) reportsByUser.set(r.user_id, r);

  const emailByUser = new Map<string, string>();
  for (const u of authRes.data?.users ?? []) {
    if (u.id && u.email) emailByUser.set(u.id, u.email);
  }

  const rows: PaidUserRow[] = (profiles ?? []).map((p) => {
    const booking = bookingsByUser.get(p.user_id);
    const report = reportsByUser.get(p.user_id);
    return {
      userId: p.user_id,
      name: p.name ?? '',
      email: emailByUser.get(p.user_id) ?? '',
      categoryId: p.category ?? '',
      categoryLabel:
        CATEGORIES.find((c) => c.id === p.category)?.label ?? (p.category ?? ''),
      bookingSlotAt: booking?.slot_at ?? null,
      bookingConsentedAt: booking?.consented_at ?? null,
      reportGeneratedAt: report?.generated_at ?? null,
      callNotes: report?.call_notes ?? '',
    };
  });

  // Sort: booked-but-no-report first, then everyone else by most recent booking.
  rows.sort((a, b) => {
    const aPending = a.bookingSlotAt && !a.reportGeneratedAt ? 0 : 1;
    const bPending = b.bookingSlotAt && !b.reportGeneratedAt ? 0 : 1;
    if (aPending !== bPending) return aPending - bPending;
    const aTs = a.bookingSlotAt ? Date.parse(a.bookingSlotAt) : 0;
    const bTs = b.bookingSlotAt ? Date.parse(b.bookingSlotAt) : 0;
    return bTs - aTs;
  });

  return (
    <main className="min-h-screen" style={{ backgroundColor: '#F8F5F0' }}>
      <div className="max-w-5xl mx-auto px-6 py-10 flex flex-col gap-8">
        <div className="flex flex-col gap-2">
          <div className="flex items-center gap-2">
            <div className="w-6 h-px" style={{ backgroundColor: '#1B4D3E' }} />
            <span
              className="font-display text-xs font-semibold uppercase tracking-wider"
              style={{ color: '#1B4D3E' }}
            >
              Admin
            </span>
          </div>
          <h1
            className="font-display font-bold uppercase tracking-wide text-3xl"
            style={{ color: '#2C2C2C' }}
          >
            Post-call reports
          </h1>
          <p className="font-body text-sm" style={{ color: '#6B6B6B' }}>
            One row per paid user. After the review call, paste your notes and click
            <em> Generate &amp; send</em> &mdash; the buyer gets the PDF by email.
          </p>
        </div>

        <PostCallClient rows={rows} />
      </div>
    </main>
  );
}
