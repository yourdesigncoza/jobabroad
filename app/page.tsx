import InterestGrid from '@/components/InterestGrid';
import CountryStats from '@/components/CountryStats';
import HowItWorks from '@/components/HowItWorks';
import FAQ from '@/components/FAQ';
import WhatsAppIcon from '@/components/WhatsAppIcon';
import { ShieldCheck, AlertTriangle, Ban } from 'lucide-react';

interface Props {
  searchParams: Promise<{ src?: string }>;
}

export default async function Home({ searchParams }: Props) {
  const { src } = await searchParams;

  return (
    <main className="min-h-screen" style={{ backgroundColor: '#F8F5F0' }}>

      {/* Nav */}
      <nav className="px-6 py-5 flex items-center justify-between max-w-6xl mx-auto">
        <div className="flex items-center text-[1.5em] md:text-[2.2em]">
          <span className="font-body font-bold" style={{ color: '#2C2C2C' }}>job</span>
          <span className="font-body font-bold" style={{ color: '#ff751f' }}>abroad</span>
        </div>
        <a
          href={`https://wa.me/${process.env.NEXT_PUBLIC_WHATSAPP_NUMBER}`}
          target="_blank"
          rel="noopener noreferrer"
          className="flex items-center gap-2 text-sm font-body font-semibold px-4 py-2 rounded-full border-2 transition-all"
          style={{ borderColor: '#1B4D3E', color: '#1B4D3E' }}
        >
          <WhatsAppIcon size={15} />
          WhatsApp Us
        </a>
      </nav>

      {/* Divider */}
      <div className="max-w-6xl mx-auto px-6">
        <div className="h-px" style={{ backgroundColor: '#EDE8E0' }} />
      </div>

      {/* Hero */}
      <section className="max-w-6xl mx-auto px-6 pt-14 pb-12">
        <div className="flex flex-col gap-4 max-w-3xl">

          {/* Kicker */}
          <div className="flex items-center gap-3">
            <div className="w-8 h-px" style={{ backgroundColor: '#ff751f' }} />
            <span
              className="font-display text-xs font-semibold uppercase tracking-[0.2em]"
              style={{ color: '#ff751f' }}
            >
              Before you pay a recruiter, check the pathway first.
            </span>
          </div>

          {/* Headline */}
          <h1
            className="font-display font-bold uppercase leading-none"
            style={{ fontSize: 'clamp(2.8rem, 8vw, 5rem)', color: '#2C2C2C' }}
          >
            Your next job<br />
            <span style={{ color: '#1B4D3E' }}>is overseas.</span>
          </h1>

          {/* Sub-headline */}
          <p className="font-body text-base leading-relaxed max-w-xl" style={{ color: '#6B6B6B' }}>
            Find out which countries are open to your field, what documents you
            need, what it may cost, and which scams to avoid.
          </p>

          {/* Trust line */}
          <p className="font-body text-sm font-semibold max-w-xl" style={{ color: '#1B4D3E' }}>
            No placement fees. No fake promises. Just clear information.
          </p>

          {/* CTA hint */}
          <div className="flex items-center gap-2 mt-2">
            <div className="w-2 h-2 rounded-full" style={{ backgroundColor: '#C9A84C' }} />
            <span className="font-body text-sm font-medium" style={{ color: '#2C2C2C' }}>
              Pick your field below — WhatsApp opens automatically.
            </span>
          </div>
        </div>
      </section>

      {/* How it works */}
      <HowItWorks />

      {/* Interest Selector */}
      <section className="px-6 py-14" style={{ backgroundColor: '#EDE8E0' }}>
        <div className="max-w-6xl mx-auto">
          <div className="flex items-center gap-4 mb-8">
            <h2
              className="font-display font-bold uppercase text-lg tracking-[0.12em]"
              style={{ color: '#1B4D3E' }}
            >
              Where do you want to go?
            </h2>
            <div className="flex-1 h-px" style={{ backgroundColor: '#C9A84C', opacity: 0.4 }} />
          </div>
          <InterestGrid source={src} />
          <p className="font-body text-xs mt-6 text-center" style={{ color: '#6B6B6B' }}>
            Tap a tile — WhatsApp opens with your selection pre-filled.
          </p>
        </div>
      </section>

      {/* Trust band — dark green, upgraded pillars */}
      <section className="px-6 py-16" style={{ backgroundColor: '#1B4D3E' }}>
        <div className="max-w-6xl mx-auto">

          {/* Headline */}
          <div className="text-center mb-12">
            <p
              className="font-display font-bold uppercase leading-tight"
              style={{ fontSize: 'clamp(1.8rem, 5vw, 3rem)', color: '#F8F5F0' }}
            >
              Know what&apos;s real before<br />you pay anyone anything.
            </p>
            <p className="font-body text-sm leading-relaxed max-w-lg mx-auto mt-4" style={{ color: 'rgba(248,245,240,0.7)' }}>
              Every pathway we share is verified against official government sources —
              UK Home Office, US State Department, Australian Home Affairs.
            </p>
          </div>

          {/* Upgraded pillars */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {[
              {
                Icon: ShieldCheck,
                title: 'Official sources only',
                body: 'Every claim links to GOV.UK, State Department, Home Affairs, or equivalent official government portals. No blog posts. No hearsay.',
              },
              {
                Icon: AlertTriangle,
                title: 'Scam warnings included',
                body: 'Each pathway guide includes a red-flag checklist of known scam patterns — fake recruiters, upfront fee fraud, and fraudulent job offers.',
              },
              {
                Icon: Ban,
                title: 'No placement fees. Ever.',
                body: 'We charge for information, not for placing you in a job. It is illegal in South Africa to charge job seekers placement fees — and we never do.',
              },
            ].map(({ Icon, title, body }) => (
              <div
                key={title}
                className="flex flex-col gap-4 p-6 rounded-2xl"
                style={{ backgroundColor: 'rgba(248,245,240,0.06)', border: '1px solid rgba(248,245,240,0.12)' }}
              >
                <Icon size={28} color="#C9A84C" strokeWidth={1.5} />
                <div>
                  <p
                    className="font-display font-bold uppercase text-sm tracking-wide mb-2"
                    style={{ color: '#F8F5F0' }}
                  >
                    {title}
                  </p>
                  <p className="font-body text-sm leading-relaxed" style={{ color: 'rgba(248,245,240,0.65)' }}>
                    {body}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Country stats */}
      <CountryStats />

      {/* FAQ */}
      <FAQ />

      {/* Lost link recovery */}
      <section className="px-6 py-8 text-center" style={{ backgroundColor: '#EDE8E0' }}>
        <p className="font-body text-sm" style={{ color: '#6B6B6B' }}>
          Already paid? Lost your access link?{' '}
          <a
            href={`https://wa.me/${process.env.NEXT_PUBLIC_WHATSAPP_NUMBER}?text=${encodeURIComponent('I lost my link. My number is [your number].')}`}
            target="_blank"
            rel="noopener noreferrer"
            className="font-semibold underline"
            style={{ color: '#1B4D3E' }}
          >
            WhatsApp us and we&apos;ll resend it.
          </a>
        </p>
      </section>

      {/* Footer */}
      <footer className="px-6 py-12" style={{ backgroundColor: '#2C2C2C' }}>
        <div className="max-w-6xl mx-auto grid grid-cols-1 md:grid-cols-2 gap-10 items-start">

          {/* Left — contact + legal */}
          <div className="flex flex-col gap-4">
            <a
              href={`https://wa.me/${process.env.NEXT_PUBLIC_WHATSAPP_NUMBER}`}
              target="_blank"
              rel="noopener noreferrer"
              className="font-body text-base font-semibold"
              style={{ color: '#C9A84C' }}
            >
              WhatsApp: {process.env.NEXT_PUBLIC_WHATSAPP_NUMBER}
            </a>
            <p className="font-body text-sm leading-relaxed" style={{ color: '#F8F5F0' }}>
              We are an information service and CV toolkit. We do not place candidates or act as recruiters.
              We do not guarantee employment.
            </p>
            <a href="/privacy" className="font-body text-sm underline" style={{ color: '#F8F5F0' }}>
              Privacy Policy
            </a>
          </div>

          {/* Right — logo + location */}
          <div className="flex flex-col items-center gap-2">
            <p className="font-body font-bold text-3xl">
              <span style={{ color: '#F8F5F0' }}>job</span>
              <span style={{ color: '#ff751f' }}>abroad</span>
            </p>
            <p className="font-body text-base" style={{ color: '#F8F5F0' }}>
              Based in South Africa 🇿🇦
            </p>
          </div>

        </div>
      </footer>
    </main>
  );
}
