import InterestGrid from '@/components/InterestGrid';

interface Props {
  searchParams: Promise<{ src?: string }>;
}

export default async function Home({ searchParams }: Props) {
  const { src } = await searchParams;

  return (
    <main className="min-h-screen" style={{ backgroundColor: '#F8F5F0' }}>

      {/* Nav */}
      <nav className="px-6 py-5 flex items-center justify-between max-w-6xl mx-auto">
        <div className="flex items-center gap-1">
          <span
            className="font-display font-bold text-2xl tracking-widest uppercase"
            style={{ color: '#2C2C2C' }}
          >
            JOB
          </span>
          <span
            className="font-display font-bold text-2xl tracking-widest uppercase"
            style={{ color: '#1B4D3E' }}
          >
            ROAD
          </span>
        </div>
        <a
          href={`https://wa.me/${process.env.NEXT_PUBLIC_WHATSAPP_NUMBER}`}
          target="_blank"
          rel="noopener noreferrer"
          className="text-xs font-body font-semibold px-4 py-2 rounded-full border-2 transition-all"
          style={{
            borderColor: '#1B4D3E',
            color: '#1B4D3E',
          }}
        >
          WhatsApp Us
        </a>
      </nav>

      {/* Divider */}
      <div className="max-w-6xl mx-auto px-6">
        <div className="h-px" style={{ backgroundColor: '#EDE8E0' }} />
      </div>

      {/* Hero */}
      <section className="max-w-6xl mx-auto px-6 pt-14 pb-10">
        <div className="flex flex-col gap-4 max-w-2xl">

          {/* Kicker */}
          <div className="flex items-center gap-3">
            <div className="w-8 h-px" style={{ backgroundColor: '#C9A84C' }} />
            <span
              className="font-display text-xs font-semibold uppercase tracking-[0.2em]"
              style={{ color: '#C9A84C' }}
            >
              South Africa → The World
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
          <p
            className="font-body text-base leading-relaxed max-w-lg"
            style={{ color: '#6B6B6B' }}
          >
            Real pathways. No scams. No guesswork. Clear information on how South
            Africans actually get working abroad — from professional nurses to
            seasonal farm workers.
          </p>

          {/* CTA hint */}
          <div className="flex items-center gap-2 mt-2">
            <div
              className="w-2 h-2 rounded-full"
              style={{ backgroundColor: '#C9A84C' }}
            />
            <span
              className="font-body text-sm font-medium"
              style={{ color: '#2C2C2C' }}
            >
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
              Where do you want to go?
            </h2>
            <div className="flex-1 h-px" style={{ backgroundColor: '#C9A84C', opacity: 0.4 }} />
          </div>
          <InterestGrid source={src} />
          <p
            className="font-body text-xs mt-6 text-center"
            style={{ color: '#6B6B6B' }}
          >
            Tap a tile — WhatsApp opens with your selection pre-filled.
          </p>
        </div>
      </section>

      {/* Trust band — dark green */}
      <section
        className="px-6 py-14"
        style={{ backgroundColor: '#1B4D3E' }}
      >
        <div className="max-w-4xl mx-auto text-center">
          <p
            className="font-display font-bold uppercase text-2xl md:text-3xl leading-tight mb-4"
            style={{ color: '#F8F5F0' }}
          >
            Know what&apos;s real before<br />you pay anyone anything.
          </p>
          <p
            className="font-body text-sm leading-relaxed max-w-lg mx-auto"
            style={{ color: '#C9A84C' }}
          >
            Every pathway we share is verified against official government sources —
            UK Home Office, State Department, Australian Home Affairs. We help you
            understand your options, not sell you false hope.
          </p>

          {/* Three pillars */}
          <div className="grid grid-cols-3 gap-6 mt-10 max-w-lg mx-auto">
            {[
              { icon: '✓', label: 'Official sources only' },
              { icon: '✓', label: 'Scam warnings included' },
              { icon: '✓', label: 'No placement fees' },
            ].map((item) => (
              <div key={item.label} className="flex flex-col items-center gap-2">
                <span
                  className="font-display font-bold text-lg"
                  style={{ color: '#C9A84C' }}
                >
                  {item.icon}
                </span>
                <span
                  className="font-body text-xs leading-snug"
                  style={{ color: '#F8F5F0' }}
                >
                  {item.label}
                </span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Lost link + footer */}
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

      <footer className="px-6 py-6 text-center" style={{ backgroundColor: '#2C2C2C' }}>
        <p className="font-display font-bold uppercase tracking-widest text-sm mb-2" style={{ color: '#C9A84C' }}>
          JOBROAD
        </p>
        <p className="font-body text-xs leading-relaxed" style={{ color: '#6B6B6B' }}>
          We are an information service and CV toolkit. We do not place candidates or act as recruiters.
          We do not guarantee employment.
        </p>
        <p className="mt-2">
          <a href="/privacy" className="font-body text-xs underline" style={{ color: '#6B6B6B' }}>
            Privacy Policy
          </a>
        </p>
      </footer>
    </main>
  );
}
