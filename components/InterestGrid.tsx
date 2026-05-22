'use client';

import { CATEGORIES } from '@/lib/categories';
import CategoryCard from './CategoryCard';

export default function InterestGrid({ source }: { source?: string }) {
  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-4">
      {CATEGORIES.filter((cat) => cat.id !== 'other').map((cat) => {
        const href = `/register?category=${cat.id}${
          source ? `&src=${encodeURIComponent(source)}` : ''
        }`;
        return (
          <CategoryCard
            key={cat.id}
            category={cat}
            href={href}
            source={source}
          />
        );
      })}
    </div>
  );
}
