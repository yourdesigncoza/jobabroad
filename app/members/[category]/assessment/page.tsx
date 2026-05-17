import { notFound, redirect } from 'next/navigation';
import Link from 'next/link';
import StickyNav from '@/components/StickyNav';
import AssessmentWizard from '@/components/AssessmentWizard';
import { CATEGORIES } from '@/lib/categories';
import { requireProfile } from '@/lib/auth-guards';
import { createSupabaseServerClient } from '@/lib/supabase/server';
import { getLatestAssessment } from '@/lib/assessments/assessment-client';

export default async function AssessmentPage({
  params,
}: {
  params: Promise<{ category: string }>;
}) {
  const { category } = await params;
  const whatsappNumber = process.env.NEXT_PUBLIC_WHATSAPP_NUMBER ?? '';

  if (!CATEGORIES.some((c) => c.id === category)) notFound();

  const { user, profile } = await requireProfile(`/members/${category}/assessment`);
  if (!profile) redirect('/dashboard');

  if (profile.category !== category) {
    redirect(`/members/${profile.category}/assessment`);
  }

  const existing = await getLatestAssessment(user.id);
  if (existing?.status === 'submitted' && existing.category === category) {
    redirect(`/members/${category}/score`);
  }

  const draft = existing?.category === category ? existing : null;

  // Paid users shouldn't reach this page (post-submit they redirect to /score)
  // but defense-in-depth: read tier so we can hide WhatsApp in chrome.
  const ssr = await createSupabaseServerClient();
  const { data: tierRow } = await ssr
    .from('profiles')
    .select('tier')
    .eq('user_id', user.id)
    .single();
  const hideWhatsApp = tierRow?.tier === 'paid';

  return (
    <main className="min-h-screen" style={{ backgroundColor: '#F8F5F0' }}>
      <StickyNav items={[]} whatsappNumber={whatsappNumber} isSignedIn hideWhatsApp={hideWhatsApp} />

      <div className="max-w-lg mx-auto px-4 py-10">
        <Link
          href={`/members/${category}`}
          className="inline-flex items-center gap-1 font-body text-sm mb-8"
          style={{ color: '#6B6B6B' }}
        >
          ← Back to guide
        </Link>

        <div className="flex flex-col gap-2 mb-8">
          <h1
            className="font-display font-bold uppercase tracking-wide text-2xl"
            style={{ color: '#2C2C2C' }}
          >
            Eligibility Check
          </h1>
          <p className="font-body text-sm" style={{ color: '#6B6B6B' }}>
            Your answers help us assess your readiness and identify your next steps.
          </p>
        </div>

        <div
          className="rounded-2xl p-6"
          style={{ backgroundColor: '#FFFFFF', border: '1.5px solid #EDE8E0' }}
        >
          <AssessmentWizard
            category={category}
            initialData={draft?.data ?? {}}
            initialSlugs={draft?.completed_step_slugs ?? []}
            initialAssessmentId={draft?.id ?? null}
            initialStatus={draft?.status ?? null}
            leadPhone={profile.phone}
          />
        </div>
      </div>
    </main>
  );
}
