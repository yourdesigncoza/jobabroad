'use client';

import { track } from '@vercel/analytics';
import CategoryIcon from './CategoryIcon';

interface Props {
  category: {
    id: string;
    label: string;
    description: string;
    destinations: readonly string[];
  };
  href: string;
  source?: string;
}

export default function CategoryCard({ category, href, source }: Props) {
  return (
    <a
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      onClick={() =>
        track('category_click', {
          id: category.id,
          label: category.label,
          source: source ?? 'direct',
        })
      }
      className="category-card group flex flex-col items-center gap-3 p-5 rounded-2xl text-center no-underline relative overflow-hidden"
      style={{ backgroundColor: '#1B4D3E', minHeight: '190px' }}
    >
      {/* Gold hover fill */}
      <div
        className="absolute inset-0 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-200"
        style={{ backgroundColor: '#C9A84C' }}
        aria-hidden="true"
      />

      <div className="relative z-10 flex flex-col items-center gap-2.5 w-full">

        {/* SVG icon — cream by default, charcoal on hover */}
        <div className="icon-wrap">
          <CategoryIcon id={category.id} size={38} color="#F8F5F0" />
        </div>

        {/* Label */}
        <span
          className="card-label font-display font-bold text-sm uppercase tracking-wide leading-tight"
          style={{ color: '#F8F5F0' }}
        >
          {category.label}
        </span>

        {/* Description */}
        <span
          className="card-desc font-body text-xs leading-relaxed"
          style={{ color: 'rgba(248,245,240,0.6)' }}
        >
          {category.description}
        </span>

        {/* Destination badges */}
        <div className="flex flex-wrap justify-center gap-1 mt-0.5">
          {category.destinations.map((dest) => (
            <span
              key={dest}
              className="dest-badge font-display font-semibold px-2 py-0.5 rounded-full uppercase tracking-wide"
              style={{
                backgroundColor: 'rgba(201,168,76,0.2)',
                color: '#C9A84C',
                fontSize: '13px',
              }}
            >
              {dest}
            </span>
          ))}
        </div>
      </div>
    </a>
  );
}
