'use client';

import { useEffect, useRef, useState } from 'react';
import Link from 'next/link';

interface Props {
  isSignedIn: boolean;
}

/**
 * Mobile-only hamburger that collapses the user-account links (Dashboard,
 * Log out / Log in, Register free) into a dropdown. Renders only at <sm
 * because SiteNav shows the same links inline on ≥sm.
 */
export default function NavUserMenu({ isSignedIn }: Props) {
  const [open, setOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement | null>(null);

  // Close on click outside + Escape
  useEffect(() => {
    if (!open) return;
    const onDocClick = (e: MouseEvent) => {
      if (!containerRef.current?.contains(e.target as Node)) setOpen(false);
    };
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setOpen(false);
    };
    document.addEventListener('mousedown', onDocClick);
    document.addEventListener('keydown', onKey);
    return () => {
      document.removeEventListener('mousedown', onDocClick);
      document.removeEventListener('keydown', onKey);
    };
  }, [open]);

  const itemClass =
    'block px-6 py-3 font-body text-sm font-semibold text-left w-full';
  const itemStyle: React.CSSProperties = { color: '#2C2C2C' };

  return (
    <div className="relative sm:hidden" ref={containerRef}>
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        aria-label={open ? 'Close menu' : 'Open menu'}
        aria-expanded={open}
        className="flex flex-col justify-center gap-[5px] w-8 h-8"
      >
        <span
          style={{
            display: 'block',
            height: 2,
            backgroundColor: '#2C2C2C',
            borderRadius: 1,
            transition: 'transform 0.2s',
            transform: open ? 'rotate(45deg) translateY(7px)' : 'none',
          }}
        />
        <span
          style={{
            display: 'block',
            height: 2,
            backgroundColor: '#2C2C2C',
            borderRadius: 1,
            transition: 'opacity 0.2s',
            opacity: open ? 0 : 1,
          }}
        />
        <span
          style={{
            display: 'block',
            height: 2,
            backgroundColor: '#2C2C2C',
            borderRadius: 1,
            transition: 'transform 0.2s',
            transform: open ? 'rotate(-45deg) translateY(-7px)' : 'none',
          }}
        />
      </button>

      {open && (
        <div
          className="absolute right-0 top-full mt-2 min-w-44 rounded-xl shadow-lg z-50 overflow-hidden"
          style={{ backgroundColor: '#FFFFFF', border: '1.5px solid #EDE8E0' }}
        >
          {isSignedIn ? (
            <>
              <Link href="/dashboard" className={itemClass} style={itemStyle} onClick={() => setOpen(false)}>
                Dashboard
              </Link>
              <form action="/logout" method="POST" className="border-t" style={{ borderColor: '#EDE8E0' }}>
                <button type="submit" className={itemClass} style={{ color: '#6B6B6B' }}>
                  Log out
                </button>
              </form>
            </>
          ) : (
            <>
              <Link href="/login" className={itemClass} style={itemStyle} onClick={() => setOpen(false)}>
                Log in
              </Link>
              <Link
                href="/register"
                className={`${itemClass} border-t`}
                style={{ ...itemStyle, borderColor: '#EDE8E0', color: '#1B4D3E' }}
                onClick={() => setOpen(false)}
              >
                Register free
              </Link>
            </>
          )}
        </div>
      )}
    </div>
  );
}
