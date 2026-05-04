'use client';

import { useState } from 'react';
import type { TocItem } from '@/lib/pathway-content';

export default function MobileNav({ items }: { items: TocItem[] }) {
  const [open, setOpen] = useState(false);

  function go(id: string) {
    setOpen(false);
    setTimeout(() => {
      document.getElementById(id)?.scrollIntoView({ behavior: 'smooth' });
    }, 10);
  }

  return (
    <>
      <button
        onClick={() => setOpen((o) => !o)}
        aria-label={open ? 'Close menu' : 'Open menu'}
        className="lg:hidden flex flex-col justify-center gap-[5px] w-8 h-8"
      >
        <span
          style={{
            display: 'block', height: 2, backgroundColor: '#F8F5F0', borderRadius: 1,
            transition: 'transform 0.2s',
            transform: open ? 'rotate(45deg) translateY(7px)' : 'none',
          }}
        />
        <span
          style={{
            display: 'block', height: 2, backgroundColor: '#F8F5F0', borderRadius: 1,
            transition: 'opacity 0.2s',
            opacity: open ? 0 : 1,
          }}
        />
        <span
          style={{
            display: 'block', height: 2, backgroundColor: '#F8F5F0', borderRadius: 1,
            transition: 'transform 0.2s',
            transform: open ? 'rotate(-45deg) translateY(-7px)' : 'none',
          }}
        />
      </button>

      {open && (
        <div
          className="absolute top-full left-0 right-0 lg:hidden shadow-lg z-50"
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
                  {text}
                </button>
              </li>
            ))}
            <li>
              <button
                onClick={() => go('cv')}
                className="w-full text-left px-6 py-4 font-body text-sm font-semibold"
                style={{ backgroundColor: '#1B4D3E', color: '#F8F5F0' }}
              >
                My CV
              </button>
            </li>
          </ul>
        </div>
      )}
    </>
  );
}
