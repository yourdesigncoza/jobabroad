'use client';

import { CATEGORIES, buildWhatsAppLink } from '@/lib/categories';
import CategoryCard from './CategoryCard';

export default function InterestGrid({ source }: { source?: string }) {
  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-4">
      {CATEGORIES.map((cat) => (
        <CategoryCard
          key={cat.id}
          category={cat}
          href={buildWhatsAppLink(cat.label, source)}
          source={source}
        />
      ))}
    </div>
  );
}
