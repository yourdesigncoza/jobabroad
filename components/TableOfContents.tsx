'use client';

import { useState, useEffect } from 'react';
import type { TocItem } from '@/lib/pathway-content';

export default function TableOfContents({ items }: { items: TocItem[] }) {
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
        <ul className="flex flex-col gap-0.5">
          {items.map(({ id, text }) => {
            const isActive = activeId === id;
            return (
              <li key={id}>
                <a
                  href={`#${id}`}
                  className="block font-body text-sm py-1.5 pl-3 rounded-r transition-colors duration-150"
                  style={{
                    borderLeft: isActive
                      ? '3px solid #1B4D3E'
                      : '3px solid transparent',
                    color: isActive ? '#1B4D3E' : '#6B6B6B',
                    fontWeight: isActive ? 600 : 400,
                    backgroundColor: isActive ? 'rgba(27,77,62,0.06)' : 'transparent',
                  }}
                >
                  {text}
                </a>
              </li>
            );
          })}
        </ul>
      )}
    </nav>
  );
}
