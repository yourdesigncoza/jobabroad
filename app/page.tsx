import InterestGrid from '@/components/InterestGrid';
import CountryStats from '@/components/CountryStats';
import HowItWorks from '@/components/HowItWorks';
import FAQ from '@/components/FAQ';
import WhatsAppIcon from '@/components/WhatsAppIcon';

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
          href={`https://wa.me/${process.env.NEXT_PUBLIC_WHATSAPP_NUMBER}?text=${encodeURIComponent("Hi, I'm interested in working abroad. Can you help me?")}`}
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
              Before you pay a recruiter, get the facts first.
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

      {/* Interest Selector */}
      <section className="px-6 py-14" style={{ backgroundColor: '#EDE8E0' }}>
        <div className="max-w-6xl mx-auto">
          <div className="flex items-center gap-4 mb-8">
            <h2
              className="font-display font-bold uppercase text-lg tracking-[0.12em]"
              style={{ color: '#1B4D3E' }}
            >
              What's your field?
            </h2>
            <div className="flex-1 h-px" style={{ backgroundColor: '#C9A84C', opacity: 0.4 }} />
          </div>
          <InterestGrid source={src} />
          <p className="font-body text-xs mt-6 text-center" style={{ color: '#6B6B6B' }}>
            First chat is free. Get the full Playbook for R199.
          </p>
        </div>
      </section>

      {/* How it works */}
      <HowItWorks />

      {/* Trust band */}
      <section className="px-6 py-16" style={{ backgroundColor: '#1B4D3E' }}>
        <div className="max-w-6xl mx-auto">

          {/* Heading — full width */}
          <p
            className="font-display font-bold uppercase leading-tight text-center mb-10"
            style={{ fontSize: 'clamp(1.8rem, 5vw, 3rem)', color: '#F8F5F0' }}
          >
            Know what&apos;s real before<br />you pay a recruiter anything.
          </p>

          <div className="flex flex-col items-center gap-6 max-w-2xl mx-auto">

            <p className="font-body text-sm leading-relaxed text-center" style={{ color: 'rgba(248,245,240,0.7)' }}>
              Everything we tell you comes straight from official government websites: UK Home Office, US State Department, Australian Home Affairs. Not WhatsApp groups. Not word of mouth. Not an agent guessing.
            </p>

            <div className="w-16 h-px" style={{ backgroundColor: '#C9A84C' }} />

            <p
              className="font-body font-semibold leading-relaxed text-center"
              style={{ fontSize: 'clamp(1rem, 2vw, 1.2rem)', color: '#C9A84C' }}
            >
              Our R199 Work Abroad Playbook is the only thing you&apos;ll ever pay us for. No monthly fees, no hidden costs. No fake recruiter taking R5,000 from you.
            </p>

          </div>
        </div>
      </section>

      {/* FAQ */}
      <FAQ />

      {/* Country stats */}
      <CountryStats />

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
              href={`https://wa.me/${process.env.NEXT_PUBLIC_WHATSAPP_NUMBER}?text=${encodeURIComponent("Hi, I'm interested in working abroad. Can you help me?")}`}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-2 font-body font-semibold text-sm px-5 py-3 rounded-full self-start transition-all"
              style={{ backgroundColor: '#C9A84C', color: '#FFFFFF' }}
            >
              <WhatsAppIcon size={16} color="#FFFFFF" />
              WhatsApp Us
            </a>
            <p className="font-body text-sm leading-relaxed" style={{ color: '#F8F5F0' }}>
              We&apos;re an information service. We don&apos;t place candidates, act as recruiters or guarantee employment.
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
