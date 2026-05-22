'use client';

import Link from 'next/link';
import { useEffect, useState } from 'react';

// Mobile-only sticky CTA. The homepage is long and SiteNav does not stick, so
// once a visitor scrolls past the hero the registration path disappears. This
// keeps it one tap away — hidden over the hero (its CTA is already on screen)
// and over the category grid (the cards are the CTA there).
export default function HomeStickyCta() {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const grid = document.getElementById('interest-grid');
    let gridInView = false;

    const update = () => {
      setVisible(window.scrollY > 600 && !gridInView);
    };

    const observer = new IntersectionObserver(
      ([entry]) => {
        gridInView = entry.isIntersecting;
        update();
      },
      { threshold: 0 },
    );
    if (grid) observer.observe(grid);

    window.addEventListener('scroll', update, { passive: true });
    update();

    return () => {
      window.removeEventListener('scroll', update);
      observer.disconnect();
    };
  }, []);

  return (
    <div
      data-testid="sticky-cta"
      className="sm:hidden fixed bottom-0 inset-x-0 z-40 px-4 py-3 transition-transform duration-200"
      style={{
        backgroundColor: '#1B4D3E',
        boxShadow: visible ? '0 -4px 16px rgba(0,0,0,0.18)' : 'none',
        transform: visible ? 'translateY(0)' : 'translateY(110%)',
      }}
      aria-hidden={!visible}
    >
      {/* Right padding clears the global BackToTop FAB (fixed bottom-right) */}
      <div className="pr-[60px]">
        <Link
          href="/register"
          tabIndex={visible ? undefined : -1}
          className="flex items-center justify-center gap-2 font-display font-bold uppercase text-sm tracking-wide py-3 rounded-full"
          style={{ backgroundColor: '#ff751f', color: '#FFFFFF' }}
        >
          Register free →
        </Link>
      </div>
    </div>
  );
}
