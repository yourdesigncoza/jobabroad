import type { Metadata } from 'next';
import SiteNav from '@/components/SiteNav';
import SiteFooter from '@/components/SiteFooter';
import ScamWarningsList from '@/components/ScamWarningsList';

export const metadata: Metadata = {
  title: 'Scam Warnings — Jobabroad',
  description:
    'Common scams targeting South Africans applying for work abroad — what they look like, how scammers reach you, and where to report them.',
};

interface Props {
  searchParams: Promise<{ src?: string }>;
}

export default async function ScamWarningsPage({ searchParams }: Props) {
  const { src } = await searchParams;

  return (
    <main className="min-h-screen" style={{ backgroundColor: '#F8F5F0' }}>
      <SiteNav src={src} />

      <div className="max-w-6xl mx-auto px-6">
        <div className="h-px" style={{ backgroundColor: '#EDE8E0' }} />
      </div>

      {/* Hero */}
      <section className="max-w-6xl mx-auto px-6 pt-12 pb-8">
        <div className="flex flex-col gap-5 max-w-3xl">
          <div className="flex items-center gap-3">
            <div className="w-8 h-px" style={{ backgroundColor: '#7A1F1F' }} />
            <span
              className="font-display text-[0.65rem] md:text-xs font-semibold uppercase tracking-[0.08em] md:tracking-[0.2em]"
              style={{ color: '#7A1F1F' }}
            >
              Stay safe — common scam patterns
            </span>
          </div>

          <h1
            className="font-display font-bold uppercase leading-none"
            style={{ fontSize: 'clamp(2.2rem, 6vw, 3.8rem)', color: '#2C2C2C' }}
          >
            Scam warnings
          </h1>

          <p className="font-body text-lg leading-relaxed" style={{ color: '#2C2C2C' }}>
            These are the scam patterns we&apos;ve seen targeting South Africans who want to
            work abroad. If something you&apos;re looking at matches one of these — pause,
            verify, and report.
          </p>

          <div
            className="rounded-2xl p-5 border"
            style={{ backgroundColor: '#FFFFFF', borderColor: '#EDE8E0' }}
          >
            <p className="font-display text-xs uppercase tracking-[0.15em] mb-2" style={{ color: '#7A1F1F' }}>
              Three rules that catch most scams
            </p>
            <ul className="font-body text-sm leading-relaxed flex flex-col gap-2" style={{ color: '#2C2C2C' }}>
              <li>
                <strong>1. Never pay an upfront placement fee.</strong> Real recruiters get paid
                by the employer, not by you.
              </li>
              <li>
                <strong>2. A real job offer comes from a verifiable employer.</strong>{' '}
                If the whole conversation is on WhatsApp and the &ldquo;company&rdquo; has no
                website older than the offer, it&apos;s not real.
              </li>
              <li>
                <strong>3. No legitimate visa, exam or registration body sells &ldquo;guarantees&rdquo;.</strong>{' '}
                If someone offers to guarantee your CoS, NMC, AHPRA or visa for a fee — it&apos;s a scam.
              </li>
            </ul>
          </div>
        </div>
      </section>

      {/* List */}
      <section className="max-w-6xl mx-auto px-6 pb-16">
        <ScamWarningsList />
      </section>

      <SiteFooter src={src} />
    </main>
  );
}
