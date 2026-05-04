'use client';

import { useState, useEffect } from 'react';
import type { TocItem } from '@/lib/pathway-content';

export default function TableOfContents({ items, assessmentHref }: { items: TocItem[]; assessmentHref?: string }) {
  const [activeId, setActiveId] = useState(items[0]?.id ?? '');
  const [collapsed, setCollapsed] = useState(false);

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        const visible = entries.find((e) => e.isIntersecting);
        if (visible) setActiveId(visible.target.id);
      },
      { rootMargin: '-10% 0% -75% 0%' }
    );
    items.forEach(({ id }) => {
      const el = document.getElementById(id);
      if (el) observer.observe(el);
    });
    return () => observer.disconnect();
  }, [items]);

  return (
    <nav aria-label="Table of contents">
      {/* Header */}
      <button
        onClick={() => setCollapsed((c) => !c)}
        className="flex items-center justify-between w-full gap-3 mb-3"
      >
        <span
          className="font-display font-bold uppercase tracking-wide text-sm"
          style={{ color: '#2C2C2C' }}
        >
          Table of Contents
        </span>
        <span
          className="text-xs transition-transform duration-200"
          style={{
            color: '#6B6B6B',
            display: 'inline-block',
            transform: collapsed ? 'rotate(-90deg)' : 'rotate(0deg)',
          }}
        >
          ▼
        </span>
      </button>

      {/* Items */}
      {!collapsed && (
        <>
          <ul className="flex flex-col gap-0.5">
            {items.map(({ id, text }, index) => {
              const isActive = activeId === id;
              const activeIndex = items.findIndex((i) => i.id === activeId);
              const isDone = activeIndex > 0 && index < activeIndex;
              const label = text.split(/\s[—–-]\s/)[0];
              return (
                <li key={id}>
                  <a
                    href={`#${id}`}
                    title={text}
                    className="flex items-center gap-2 font-body text-sm py-1.5 pl-3 rounded-r transition-colors duration-150"
                    style={{
                      borderLeft: isActive ? '3px solid #1B4D3E' : '3px solid transparent',
                      color: isActive ? '#1B4D3E' : isDone ? '#9B9B9B' : '#6B6B6B',
                      fontWeight: isActive ? 600 : 400,
                      backgroundColor: isActive ? 'rgba(27,77,62,0.06)' : 'transparent',
                    }}
                  >
                    {isDone && (
                      <svg width="12" height="12" viewBox="0 0 12 12" fill="none" aria-hidden="true" style={{ flexShrink: 0 }}>
                        <path d="M2 6l3 3 5-5" stroke="#9B9B9B" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                      </svg>
                    )}
                    {label}
                  </a>
                </li>
              );
            })}
          </ul>

          {assessmentHref && (
            <a
              href={assessmentHref}
              className="mt-4 flex items-center justify-center gap-2 rounded-xl px-3 py-2.5 font-display font-bold uppercase text-xs tracking-wide transition-colors duration-150"
              style={{ backgroundColor: '#1B4D3E', color: '#F8F5F0' }}
              onMouseEnter={(e) => { (e.currentTarget as HTMLAnchorElement).style.color = '#C9A84C'; }}
              onMouseLeave={(e) => { (e.currentTarget as HTMLAnchorElement).style.color = '#F8F5F0'; }}
            >
              Eligibility Assessment
            </a>
          )}
        </>
      )}
    </nav>
  );
}
