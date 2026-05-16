import type { Metadata } from 'next';
import { redirect } from 'next/navigation';
import SiteNav from '@/components/SiteNav';
import SiteFooter from '@/components/SiteFooter';
import { createSupabaseServerClient } from '@/lib/supabase/server';
import ConfirmEmailClient from './ConfirmEmailClient';

export const metadata: Metadata = {
  title: 'Confirm your email — Jobabroad',
  description: 'Click the link in the confirmation email we sent you to unlock your guide.',
  alternates: { canonical: '/auth/confirm-email' },
  robots: { index: false, follow: false },
};

export default async function ConfirmEmailPage() {
  const supabase = await createSupabaseServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (user?.email_confirmed_at) {
    redirect('/dashboard');
  }

  return (
    <main className="min-h-screen" style={{ backgroundColor: '#F8F5F0' }}>
      <SiteNav />

      <div className="max-w-6xl mx-auto px-6">
        <div className="h-px" style={{ backgroundColor: '#EDE8E0' }} />
      </div>

      <section className="max-w-md mx-auto px-6 pt-12 pb-16">
        <div className="flex flex-col gap-6 mb-10">
          <div className="flex items-center gap-3">
            <div className="w-8 h-px" style={{ backgroundColor: '#ff751f' }} />
            <span
              className="font-display text-[0.65rem] md:text-xs font-semibold uppercase tracking-[0.08em] md:tracking-[0.2em]"
              style={{ color: '#ff751f' }}
            >
              One last step
            </span>
          </div>
          <h1
            className="font-display font-bold uppercase leading-tight"
            style={{ fontSize: 'clamp(2rem, 5vw, 3rem)', color: '#2C2C2C' }}
          >
            Confirm your email
          </h1>
        </div>

        <ConfirmEmailClient email={user?.email ?? null} />
      </section>

      <SiteFooter />
    </main>
  );
}
