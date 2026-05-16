import Link from 'next/link';
import TrackedLink from '@/components/TrackedLink';
import WhatsAppIcon from '@/components/WhatsAppIcon';

export default function SiteFooter({ src }: { src?: string }) {
  return (
    <footer className="px-6 py-12" style={{ backgroundColor: '#2C2C2C' }}>
      <div className="max-w-6xl mx-auto grid grid-cols-1 md:grid-cols-3 gap-10 items-start">

        {/* Left — contact + legal */}
        <div className="flex flex-col gap-4 md:col-span-1">
          <TrackedLink
            href={`https://wa.me/${process.env.NEXT_PUBLIC_WHATSAPP_NUMBER}?text=${encodeURIComponent("Hi, I'm interested in working abroad. Can you help me?")}`}
            event="cta_click"
            data={{ location: 'footer', source: src ?? 'direct' }}
            className="flex items-center gap-2 font-body font-semibold text-sm px-5 py-3 rounded-full self-start transition-all"
            style={{ backgroundColor: '#C9A84C', color: '#FFFFFF' }}
          >
            <WhatsAppIcon size={16} color="#FFFFFF" />
            WhatsApp Me
          </TrackedLink>
          <p className="font-body text-sm leading-relaxed" style={{ color: '#F8F5F0' }}>
            Jobabroad is an information service. We don&apos;t place candidates, act as recruiters or guarantee employment.
          </p>
          <p className="font-body text-xs" style={{ color: 'rgba(248,245,240,0.45)' }}>
            Forgot your password?{' '}
            <Link
              href="/forgot-password"
              className="underline"
              style={{ color: 'rgba(248,245,240,0.6)' }}
            >
              Reset it here
            </Link>
            .
          </p>
        </div>

        {/* Middle — resource links */}
        <div className="flex flex-col gap-3">
          <p className="font-display text-xs uppercase tracking-[0.15em]" style={{ color: 'rgba(248,245,240,0.55)' }}>
            Free resources
          </p>
          <Link href="/recruiters" className="font-body text-sm underline" style={{ color: '#F8F5F0' }}>
            Recruiters &amp; agencies
          </Link>
          <Link href="/scam-warnings" className="font-body text-sm underline" style={{ color: '#F8F5F0' }}>
            Scam warnings
          </Link>
          <Link href="/privacy" className="font-body text-sm underline" style={{ color: '#F8F5F0' }}>
            Privacy policy
          </Link>
        </div>

        {/* Right — logo + location */}
        <div className="flex flex-col items-center md:items-end gap-2">
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
  );
}
