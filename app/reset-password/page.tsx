import type { Metadata } from 'next';
import Link from 'next/link';
import SiteNav from '@/components/SiteNav';
import SiteFooter from '@/components/SiteFooter';
import { createSupabaseServerClient } from '@/lib/supabase/server';
import ResetForm from './ResetForm';

export const metadata: Metadata = {
  title: 'Set a new password — Jobabroad',
  description: 'Choose a new password for your Jobabroad account.',
  alternates: { canonical: '/reset-password' },
  robots: { index: false, follow: false },
};

export default async function ResetPasswordPage() {
  const supabase = await createSupabaseServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  return (
    <main className="min-h-screen" style={{ backgroundColor: '#F8F5F0' }}>
      <SiteNav />

      <section className="max-w-md mx-auto px-6 pt-12 pb-16">
        <div className="flex flex-col gap-6 mb-10">
          <div className="flex items-center gap-3">
            <div className="w-8 h-px" style={{ backgroundColor: '#ff751f' }} />
            <span
              className="font-display text-[0.65rem] md:text-xs font-semibold uppercase tracking-[0.08em] md:tracking-[0.2em]"
              style={{ color: '#ff751f' }}
            >
              Set new password
            </span>
          </div>
          <h1
            className="font-display font-bold uppercase leading-tight"
            style={{ fontSize: 'clamp(2rem, 5vw, 3rem)', color: '#2C2C2C' }}
          >
            Choose a new password
          </h1>
        </div>

        {user ? (
          <ResetForm />
        ) : (
          <div
            className="p-6 rounded-md font-body"
            style={{ backgroundColor: '#EDE8E0', color: '#2C2C2C' }}
          >
            <p className="mb-3">
              This recovery link is no longer valid. Request a new one and try again.
            </p>
            <Link
              href="/forgot-password"
              className="underline"
              style={{ color: '#1B4D3E' }}
            >
              Request a new recovery link
            </Link>
          </div>
        )}
      </section>

      <SiteFooter />
    </main>
  );
}
