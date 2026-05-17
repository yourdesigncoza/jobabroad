import Link from 'next/link';
import { notFound, redirect } from 'next/navigation';
import { CATEGORIES } from '@/lib/categories';
import { requireProfile } from '@/lib/auth-guards';
import { createSupabaseServerClient } from '@/lib/supabase/server';
import BookingClient from './BookingClient';

export const dynamic = 'force-dynamic';

const CAL_LINK = 'jobabroad/15min';

export default async function BookPage({
  params,
}: {
  params: Promise<{ category: string }>;
}) {
  const { category } = await params;
  if (!CATEGORIES.some((c) => c.id === category)) notFound();

  const { user, profile } = await requireProfile(`/members/${category}/book`);
  if (!profile) redirect('/dashboard');
  if (profile.category !== category) redirect(`/members/${profile.category}/book`);

  const ssr = await createSupabaseServerClient();
  const { data: tierRow } = await ssr
    .from('profiles')
    .select('tier')
    .eq('user_id', user.id)
    .single();
  if (tierRow?.tier !== 'paid') redirect('/dashboard');

  return (
    <main className="min-h-screen" style={{ backgroundColor: '#F8F5F0' }}>
      <div className="max-w-3xl mx-auto px-6 py-10 sm:py-16 flex flex-col gap-6">
        <Link
          href="/dashboard"
          className="inline-flex items-center gap-1 font-body text-sm self-start"
          style={{ color: '#6B6B6B' }}
        >
          ← Back to dashboard
        </Link>

        <div className="flex flex-col gap-2">
          <div className="flex items-center gap-2">
            <div className="w-6 h-px" style={{ backgroundColor: '#1B4D3E' }} />
            <span
              className="font-display text-xs font-semibold uppercase tracking-wider"
              style={{ color: '#1B4D3E' }}
            >
              Paid tier
            </span>
          </div>
          <h1
            className="font-display font-bold uppercase tracking-wide text-3xl sm:text-4xl"
            style={{ color: '#2C2C2C' }}
          >
            Book your 15-min call
          </h1>
          <p className="font-body" style={{ color: '#6B6B6B' }}>
            One 15-minute call to walk through your report and answer your specific
            questions. Pick a slot below.
          </p>
        </div>

        <BookingClient calLink={CAL_LINK} userEmail={user.email ?? ''} />
      </div>
    </main>
  );
}
