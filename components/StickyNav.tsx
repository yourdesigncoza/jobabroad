'use client';

import { useState, useEffect } from 'react';
import type { TocItem } from '@/lib/pathway-content';

interface Props {
  items: TocItem[];
  whatsappNumber: string;
  isSignedIn?: boolean;
  /** Hide the "WhatsApp us" CTA — set true for paid users. */
  hideWhatsApp?: boolean;
}

export default function StickyNav({ items, whatsappNumber, isSignedIn = false, hideWhatsApp = false }: Props) {
  const [open, setOpen] = useState(false);
  const [progress, setProgress] = useState(0);
  const [activeId, setActiveId] = useState('');

  useEffect(() => {
    const onScroll = () => {
      const total = document.body.scrollHeight - window.innerHeight;
      setProgress(total > 0 ? (window.scrollY / total) * 100 : 0);
    };
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  useEffect(() => {
    if (items.length === 0) return;
    const observer = new IntersectionObserver(
      (entries) => {
        const visible = entries.find((e) => e.isIntersecting);
        if (visible) setActiveId(visible.target.id);
      },
      { rootMargin: '-10% 0% -75% 0%' }
    );
    items.map((i) => i.id).forEach((id) => {
      const el = document.getElementById(id);
      if (el) observer.observe(el);
    });
    return () => observer.disconnect();
  }, [items]);

  const activeLabel = (items.find((i) => i.id === activeId)?.text ?? '').split(/\s[—–-]\s/)[0];

  function go(id: string) {
    setOpen(false);
    setTimeout(() => {
      document.getElementById(id)?.scrollIntoView({ behavior: 'smooth' });
    }, 10);
  }

  return (
    <div className="sticky top-0 z-10" style={{ backgroundColor: '#1B4D3E' }}>
      {/* Header row */}
      <div className="px-6 py-3 flex items-center justify-between">
        <a href="/" className="flex items-center text-[1.4em]">
          <span className="font-body font-bold" style={{ color: '#F8F5F0' }}>job</span>
          <span className="font-body font-bold" style={{ color: '#ff751f' }}>abroad</span>
        </a>
        <div className="flex items-center gap-4">
          {isSignedIn && (
            <>
              <a
                href="/dashboard"
                className="font-body text-xs font-semibold leading-none hidden sm:inline"
                style={{ color: '#F8F5F0' }}
              >
                Dashboard
              </a>
              <form action="/logout" method="POST" className="hidden sm:inline-flex items-center">
                <button
                  type="submit"
                  className="font-body text-xs font-semibold leading-none cursor-pointer"
                  style={{ color: 'rgba(248,245,240,0.7)' }}
                >
                  Log out
                </button>
              </form>
            </>
          )}
          {!hideWhatsApp && (
            <a
              href={`https://wa.me/${whatsappNumber}`}
              target="_blank"
              rel="noopener noreferrer"
              className="font-body text-xs font-semibold rounded-lg px-3 py-1.5"
              style={{ backgroundColor: '#C9A84C', color: '#FFFFFF' }}
            >
              WhatsApp us
            </a>
          )}
        </div>
      </div>

      {/* Sub-bar — mobile only, below the green header */}
      {items.length > 0 && (
        <div
          className="lg:hidden px-6 py-2 flex items-center justify-between gap-3"
          style={{ backgroundColor: '#FFFFFF' }}
        >
          {/* Left: section count on load → active section name when scrolled */}
          {activeLabel ? (
            <span
              className="font-body text-sm font-bold truncate"
              style={{ color: '#2C2C2C', minWidth: 0 }}
            >
              {activeLabel}
            </span>
          ) : (
            <span className="font-display font-bold uppercase text-xs tracking-wide" style={{ color: '#ff751f' }}>
              {items.length} sections
            </span>
          )}

          {/* Right: hamburger only */}
          <button
            onClick={() => setOpen((o) => !o)}
            aria-label={open ? 'Close menu' : 'Open menu'}
            className="flex flex-col justify-center gap-[5px] w-6 h-8 shrink-0"
          >
            <span style={{ display: 'block', height: 2, backgroundColor: '#2C2C2C', borderRadius: 1, transition: 'transform 0.2s', transform: open ? 'translateY(7px) rotate(45deg)' : 'none' }} />
            <span style={{ display: 'block', height: 2, backgroundColor: '#2C2C2C', borderRadius: 1, transition: 'opacity 0.2s', opacity: open ? 0 : 1 }} />
            <span style={{ display: 'block', height: 2, backgroundColor: '#2C2C2C', borderRadius: 1, transition: 'transform 0.2s', transform: open ? 'translateY(-7px) rotate(-45deg)' : 'none' }} />
          </button>
        </div>
      )}

      {/* Mobile dropdown */}
      {open && (
        <div
          className="lg:hidden"
          style={{ backgroundColor: '#FFFFFF', borderBottom: '1.5px solid #EDE8E0' }}
        >
          <ul>
            {items.map(({ id, text }) => (
              <li key={id} style={{ borderBottom: '1px solid #EDE8E0' }}>
                <button
                  onClick={() => go(id)}
                  className="w-full text-left px-6 py-4 font-body text-sm"
                  style={{ color: '#2C2C2C' }}
                >
                  {text.split(/\s[—–-]\s/)[0]}
                </button>
              </li>
            ))}
          </ul>
        </div>
      )}

      {/* Reading progress bar */}
      <div style={{ height: 3, backgroundColor: '#EDE8E0' }}>
        <div
          style={{
            height: 3,
            width: `${progress}%`,
            backgroundColor: '#C9A84C',
            transition: 'width 0.1s linear',
          }}
        />
      </div>
    </div>
  );
}
