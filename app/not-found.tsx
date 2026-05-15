import type { Metadata } from 'next';
import Link from 'next/link';
import SiteNav from '@/components/SiteNav';
import SiteFooter from '@/components/SiteFooter';
import { pageMetadata } from '@/lib/site';

export const metadata: Metadata = {
  ...pageMetadata({
    title: 'Page Not Found',
    description: 'The page you were looking for does not exist. Browse our work-abroad pathway guides instead.',
    path: '/404',
  }),
  robots: { index: false, follow: true },
};

const QUICK_LINKS = [
  { href: '/', label: 'Home' },
  { href: '/demo/healthcare', label: 'Healthcare' },
  { href: '/demo/teaching', label: 'Teaching' },
  { href: '/demo/it-tech', label: 'IT / Tech' },
  { href: '/demo/engineering', label: 'Engineering' },
  { href: '/demo/trades', label: 'Trades' },
  { href: '/demo/farming', label: 'Farming' },
  { href: '/demo/hospitality', label: 'Hospitality' },
  { href: '/demo/seasonal', label: 'Carnival / Seasonal' },
  { href: '/demo/tefl', label: 'TEFL' },
  { href: '/demo/au-pair', label: 'Au Pair' },
  { href: '/recruiters', label: 'Recruiters & Agencies' },
  { href: '/scam-warnings', label: 'Scam Warnings' },
];

export default function NotFound() {
  return (
    <main className="min-h-screen flex flex-col" style={{ backgroundColor: '#F8F5F0' }}>
      <SiteNav />

      <section className="flex-1 max-w-3xl mx-auto px-6 py-20 flex flex-col gap-8">
        <div className="flex items-center gap-3">
          <span style={{ width: 56, height: 6, backgroundColor: '#ff751f' }} aria-hidden />
          <span
            className="font-display font-bold uppercase tracking-[0.22em] text-xs"
            style={{ color: '#C9A84C' }}
          >
            404 · Page not found
          </span>
        </div>

        <h1
          className="font-display font-bold uppercase tracking-wide text-4xl sm:text-5xl"
          style={{ color: '#2C2C2C' }}
        >
          That page isn&apos;t here
        </h1>

        <p className="font-body text-base" style={{ color: '#6B6B6B' }}>
          The link may be outdated or the page has moved. Here are the pathway guides and resources
          you were probably looking for.
        </p>

        <ul className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {QUICK_LINKS.map(link => (
            <li key={link.href}>
              <Link
                href={link.href}
                className="block rounded-xl px-4 py-3 font-display font-bold uppercase text-sm tracking-wide hover:underline"
                style={{ backgroundColor: '#FFFFFF', border: '1px solid #EDE8E0', color: '#1B4D3E' }}
              >
                {link.label}
              </Link>
            </li>
          ))}
        </ul>
      </section>

      <SiteFooter />
    </main>
  );
}
