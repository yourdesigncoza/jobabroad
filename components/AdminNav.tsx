'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';

const NAV_ITEMS = [
  { href: '/admin', label: 'Members' },
  { href: '/admin/wa-assistant', label: 'WhatsApp' },
];

/**
 * Header for every /admin page. Rendered once from app/admin/layout.tsx so the
 * member dashboard and the WhatsApp assistant share the same chrome. Distinct
 * from SiteNav: no login/register, admin-only links, active-tab highlighting,
 * plus a quick jump back to the public site and a log-out.
 */
export default function AdminNav() {
  const pathname = usePathname();

  return (
    <>
      <nav
        className="px-6 py-5 flex items-center justify-between gap-4 max-w-5xl mx-auto"
        style={{ backgroundColor: '#F8F5F0' }}
      >
        <Link href="/admin" className="flex items-center text-[1.4em] md:text-[1.8em]">
          <span className="font-body font-bold" style={{ color: '#2C2C2C' }}>job</span>
          <span className="font-body font-bold" style={{ color: '#ff751f' }}>abroad</span>
          <span
            className="font-display text-[0.55rem] font-bold uppercase tracking-[0.15em] ml-2 px-2 py-0.5 rounded-full self-center"
            style={{ backgroundColor: '#1B4D3E', color: '#F8F5F0' }}
          >
            Admin
          </span>
        </Link>

        <div className="flex items-center gap-4 md:gap-5">
          {NAV_ITEMS.map((item) => {
            const active =
              item.href === '/admin'
                ? pathname === '/admin'
                : pathname.startsWith(item.href);
            return (
              <Link
                key={item.href}
                href={item.href}
                aria-current={active ? 'page' : undefined}
                className="font-display text-xs font-semibold uppercase tracking-wider underline-offset-8 hover:underline"
                style={{
                  color: active ? '#1B4D3E' : '#6B6B6B',
                  textDecoration: active ? 'underline' : undefined,
                }}
              >
                {item.label}
              </Link>
            );
          })}

          <span className="h-4 w-px" style={{ backgroundColor: '#EDE8E0' }} aria-hidden />

          <Link
            href="/dashboard"
            className="font-display text-xs font-semibold uppercase tracking-wider underline-offset-8 hover:underline"
            style={{ color: '#6B6B6B' }}
          >
            View site
          </Link>
          <form action="/logout" method="POST" className="inline-flex items-center">
            <button
              type="submit"
              className="font-display text-xs font-semibold uppercase tracking-wider underline-offset-8 hover:underline cursor-pointer"
              style={{ color: '#6B6B6B' }}
            >
              Log out
            </button>
          </form>
        </div>
      </nav>

      <div className="max-w-5xl mx-auto px-6">
        <div className="h-px" style={{ backgroundColor: '#EDE8E0' }} />
      </div>
    </>
  );
}
