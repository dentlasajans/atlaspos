import React from 'react';
import { Category } from '../../types';

interface CategoryFilterProps {
  categories: Category[];
  activeCategoryId: string;
  onSelect: (id: string) => void;
}

export const CategoryFilter = React.memo(({
  categories,
  activeCategoryId,
  onSelect,
}: CategoryFilterProps) => {
  return (
    <div className="flex gap-3 overflow-x-auto scrollbar-hide py-2">
      {categories.map((category) => {
        const isActive = activeCategoryId === category.id;

        return (
          <button
            key={category.id}
            onClick={() => onSelect(category.id)}
            className={`px-6 py-2 rounded-full text-sm font-medium transition-colors whitespace-nowrap active:scale-95 ${
              isActive
                ? 'bg-orange-500 text-slate-50 shadow-lg shadow-orange-500/20'
                : 'bg-white/5 hover:bg-white/10 border border-white/10 text-slate-100'
            }`}
          >
            {category.name}
          </button>
        );
      })}
    </div>
  );
});

CategoryFilter.displayName = 'CategoryFilter';
