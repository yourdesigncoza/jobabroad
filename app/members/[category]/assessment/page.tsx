import { notFound, redirect } from 'next/navigation';
import Link from 'next/link';
import StickyNav from '@/components/StickyNav';
import AssessmentWizard from '@/components/AssessmentWizard';
import BackToTop from '@/components/BackToTop';
import { CATEGORIES } from '@/lib/categories';
import { requireProfile } from '@/lib/auth-guards';

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

  return (
    <main className="min-h-screen" style={{ backgroundColor: '#F8F5F0' }}>
      <StickyNav items={[]} whatsappNumber={whatsappNumber} />

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
            whatsappNumber={whatsappNumber}
            initialData={{}}
            initialSlugs={[]}
            initialAssessmentId={null}
            initialStatus={null}
            leadPhone={profile.phone}
          />
        </div>
      </div>
      <BackToTop />
    </main>
  );
}
