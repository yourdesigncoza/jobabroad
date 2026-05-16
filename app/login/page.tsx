import type { Metadata } from 'next';
import { redirect } from 'next/navigation';
import SiteNav from '@/components/SiteNav';
import SiteFooter from '@/components/SiteFooter';
import { createSupabaseServerClient } from '@/lib/supabase/server';
import LoginForm from './LoginForm';

export const metadata: Metadata = {
  title: 'Log in — Jobabroad',
  description: 'Log in to your Jobabroad account to access your pathway guide.',
  alternates: { canonical: '/login' },
};

export default async function LoginPage() {
  const supabase = await createSupabaseServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (user) redirect('/dashboard');

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
              Welcome back
            </span>
          </div>
          <h1
            className="font-display font-bold uppercase leading-tight"
            style={{ fontSize: 'clamp(2rem, 5vw, 3rem)', color: '#2C2C2C' }}
          >
            Log in
          </h1>
        </div>

        <LoginForm />
      </section>

      <SiteFooter />
    </main>
  );
}
