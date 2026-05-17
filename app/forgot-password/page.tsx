import type { Metadata } from 'next';
import SiteNav from '@/components/SiteNav';
import SiteFooter from '@/components/SiteFooter';
import ForgotForm from './ForgotForm';

export const metadata: Metadata = {
  title: 'Reset your password — Jobabroad',
  description: 'Request a password recovery link by email.',
  alternates: { canonical: '/forgot-password' },
};

export default function ForgotPasswordPage() {
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
              Password recovery
            </span>
          </div>
          <h1
            className="font-display font-bold uppercase leading-tight"
            style={{ fontSize: 'clamp(2rem, 5vw, 3rem)', color: '#2C2C2C' }}
          >
            Forgot your password?
          </h1>
          <p className="font-body" style={{ color: '#6B6B6B' }}>
            Enter the email you signed up with. We&apos;ll send you a link to set a new
            password.
          </p>
        </div>

        <ForgotForm />
      </section>

      <SiteFooter />
    </main>
  );
}
