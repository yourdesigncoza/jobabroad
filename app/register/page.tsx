import type { Metadata } from 'next';
import SiteNav from '@/components/SiteNav';
import SiteFooter from '@/components/SiteFooter';
import { CATEGORIES } from '@/lib/categories';
import RegisterForm from './RegisterForm';

export const metadata: Metadata = {
  title: 'Create your account — Jobabroad',
  description:
    'Register for free access to your work-abroad pathway guide. South African mobile + email required.',
  alternates: { canonical: '/register' },
};

const REGISTRABLE = CATEGORIES.filter((c) => c.id !== 'other').map((c) => ({
  id: c.id,
  label: c.label,
  emoji: c.emoji,
}));

const REGISTRABLE_IDS = new Set<string>(REGISTRABLE.map((c) => c.id));

export default async function RegisterPage({
  searchParams,
}: {
  searchParams: Promise<{ category?: string }>;
}) {
  const params = await searchParams;
  const preselect =
    params.category && REGISTRABLE_IDS.has(params.category)
      ? params.category
      : null;

  return (
    <main className="min-h-screen" style={{ backgroundColor: '#F8F5F0' }}>
      <SiteNav />

      <div className="max-w-6xl mx-auto px-6">
        <div className="h-px" style={{ backgroundColor: '#EDE8E0' }} />
      </div>

      <section className="max-w-2xl mx-auto px-6 pt-12 pb-16">
        <div className="flex flex-col gap-6 mb-10">
          <div className="flex items-center gap-3">
            <div className="w-8 h-px" style={{ backgroundColor: '#ff751f' }} />
            <span
              className="font-display text-[0.65rem] md:text-xs font-semibold uppercase tracking-[0.08em] md:tracking-[0.2em]"
              style={{ color: '#ff751f' }}
            >
              Free access
            </span>
          </div>
          <h1
            className="font-display font-bold uppercase leading-tight"
            style={{ fontSize: 'clamp(2rem, 5vw, 3rem)', color: '#2C2C2C' }}
          >
            Create your account
          </h1>
          <p className="font-body" style={{ color: '#6B6B6B' }}>
            Pick the pathway that fits you. We&apos;ll send a confirmation email — click
            the link inside to unlock your guide.
          </p>
        </div>

        <RegisterForm preselect={preselect} categories={REGISTRABLE} />
      </section>

      <SiteFooter />
    </main>
  );
}
