'use client';

interface Props {
  category: {
    label: string;
    emoji: string;
    description: string;
    destinations: readonly string[];
  };
  href: string;
}

export default function CategoryCard({ category, href }: Props) {
  return (
    <a
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      className="category-card group flex flex-col items-center gap-3 p-5 rounded-2xl text-center no-underline relative overflow-hidden"
      style={{
        backgroundColor: '#1B4D3E',
        minHeight: '180px',
      }}
    >
      {/* Subtle texture ring */}
      <div
        className="absolute inset-0 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-200"
        style={{ backgroundColor: '#C9A84C' }}
        aria-hidden="true"
      />

      {/* Content sits above the hover layer */}
      <div className="relative z-10 flex flex-col items-center gap-2 w-full">

        {/* Emoji */}
        <span
          className="card-emoji text-4xl leading-none select-none"
          role="img"
          aria-label={category.label}
        >
          {category.emoji}
        </span>

        {/* Label */}
        <span
          className="card-label font-display font-bold text-sm uppercase tracking-wide leading-tight"
          style={{ color: '#F8F5F0' }}
        >
          {category.label}
        </span>

        {/* Description */}
        <span
          className="card-desc font-body text-xs leading-snug"
          style={{ color: 'rgba(248,245,240,0.65)' }}
        >
          {category.description}
        </span>

        {/* Destination badges */}
        <div className="flex flex-wrap justify-center gap-1 mt-1">
          {category.destinations.map((dest) => (
            <span
              key={dest}
              className="dest-badge font-display font-semibold text-xs px-2 py-0.5 rounded-full uppercase tracking-wide"
              style={{
                backgroundColor: 'rgba(201,168,76,0.2)',
                color: '#C9A84C',
                fontSize: '9px',
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
