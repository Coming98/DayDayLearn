/**
 * FilterStrip Component
 * 
 * Top control strip for category filtering and sorting.
 */

'use client';

import { Category, SortMethod } from '@/app/types/flashcard';

interface FilterStripProps {
  categories: Category[];
  activeFilters: string[];
  onFilterToggle: (categoryId: string) => void;
  onClearFilters: () => void;
  sortMethod: SortMethod;
  onSortChange: (method: SortMethod) => void;
}

export default function FilterStrip({
  categories,
  activeFilters,
  onFilterToggle,
  onClearFilters,
  sortMethod,
  onSortChange,
}: FilterStripProps) {
  return (
    <div className="flex h-14 w-full items-center gap-3 overflow-x-auto bg-white px-4 shadow-md dark:bg-gray-900">
      <div className="flex items-center gap-2">
        {/* Category Filter Badges */}
        {categories.map((category) => {
          const isActive = activeFilters.includes(category.id);
          return (
            <button
              key={category.id}
              onClick={() => onFilterToggle(category.id)}
              className={`whitespace-nowrap rounded-full px-4 py-1.5 text-sm font-semibold transition-all hover:scale-105 active:scale-95 ${
                isActive
                  ? 'text-white shadow-md'
                  : 'border-2 text-gray-700 dark:text-gray-300'
              }`}
              style={{
                backgroundColor: isActive ? category.color : 'transparent',
                borderColor: isActive ? category.color : '#D1D5DB',
              }}
            >
              {category.name}
            </button>
          );
        })}

        {/* Clear All Button */}
        {activeFilters.length > 0 && (
          <button
            onClick={onClearFilters}
            className="whitespace-nowrap rounded-full border-2 border-gray-300 px-4 py-1.5 text-sm font-semibold text-gray-700 transition-all hover:border-red-500 hover:bg-red-50 hover:text-red-600 active:scale-95 dark:border-gray-600 dark:text-gray-300 dark:hover:bg-red-900 dark:hover:text-red-400"
          >
            Clear All
          </button>
        )}
      </div>

      {/* Spacer */}
      <div className="flex-1" />

      {/* Sort Dropdown */}
      <div className="flex items-center gap-2">
        <label
          htmlFor="sort-select"
          className="whitespace-nowrap text-sm font-semibold text-gray-700 dark:text-gray-300"
        >
          Sort:
        </label>
        <select
          id="sort-select"
          value={sortMethod}
          onChange={(e) => onSortChange(e.target.value as SortMethod)}
          className="h-9 rounded-lg border-2 border-gray-300 bg-white px-3 text-sm font-medium text-gray-700 transition-all focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500 dark:border-gray-600 dark:bg-gray-800 dark:text-gray-300 dark:focus:border-blue-400 dark:focus:ring-blue-400"
        >
          <option value="random">Random</option>
          <option value="alphabetical">Alphabetical</option>
          <option value="difficulty">By Difficulty</option>
          <option value="leastPracticed">Least Practiced</option>
        </select>
      </div>
    </div>
  );
}
