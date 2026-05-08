import Link from 'next/link';
import TrackedLink from '@/components/TrackedLink';
import WhatsAppIcon from '@/components/WhatsAppIcon';

export default function SiteNav({ src }: { src?: string }) {
  return (
    <nav className="px-6 py-5 flex items-center justify-between max-w-6xl mx-auto">
      <Link href="/" className="flex items-center text-[1.5em] md:text-[2.2em]">
        <span className="font-body font-bold" style={{ color: '#2C2C2C' }}>job</span>
        <span className="font-body font-bold" style={{ color: '#ff751f' }}>abroad</span>
      </Link>
      <TrackedLink
        href={`https://wa.me/${process.env.NEXT_PUBLIC_WHATSAPP_NUMBER}?text=${encodeURIComponent("Hi, I'm interested in working abroad. Can you help me?")}`}
        event="cta_click"
        data={{ location: 'nav', source: src ?? 'direct' }}
        className="flex items-center gap-2 text-sm font-body font-semibold px-4 py-2 rounded-full border-2 transition-all"
        style={{ borderColor: '#1B4D3E', color: '#1B4D3E' }}
      >
        <WhatsAppIcon size={15} />
        WhatsApp Me
      </TrackedLink>
    </nav>
  );
}
