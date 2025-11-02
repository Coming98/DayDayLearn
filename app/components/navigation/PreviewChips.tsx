/**
 * Preview Chips Component
 * Shows preview of adjacent cards in the review session
 */

import type { Card } from '@/types/card';

export interface PreviewChipsProps {
  previousCard: Card | null;
  nextCard: Card | null;
  onSelectPrevious?: () => void;
  onSelectNext?: () => void;
  className?: string;
}

export function PreviewChips({
  previousCard,
  nextCard,
  onSelectPrevious,
  onSelectNext,
  className = '',
}: PreviewChipsProps) {
  // Don't render if no adjacent cards
  if (!previousCard && !nextCard) {
    return null;
  }

  const truncateText = (text: string, maxLength: number = 40) => {
    if (text.length <= maxLength) return text;
    return text.substring(0, maxLength) + '...';
  };

  return (
    <div className={`flex gap-4 justify-between ${className}`}>
      {/* Previous Card Preview */}
      <div className="flex-1">
        {previousCard ? (
          <button
            onClick={onSelectPrevious}
            className="w-full text-left p-3 rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 hover:border-blue-500 dark:hover:border-blue-400 transition-colors group"
            aria-label="Navigate to previous card"
          >
            <div className="flex items-start gap-2">
              <svg
                className="w-5 h-5 text-gray-400 dark:text-gray-500 group-hover:text-blue-600 dark:group-hover:text-blue-400 flex-shrink-0 mt-0.5"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M15 19l-7-7 7-7"
                />
              </svg>
              <div className="min-w-0 flex-1">
                <div className="text-xs text-gray-500 dark:text-gray-400 mb-1">
                  Previous
                </div>
                <div className="text-sm font-medium text-gray-900 dark:text-gray-100 truncate">
                  {truncateText(previousCard.question)}
                </div>
              </div>
            </div>
          </button>
        ) : (
          <div className="h-full flex items-center justify-center opacity-50">
            <span className="text-sm text-gray-400 dark:text-gray-600">
              First card
            </span>
          </div>
        )}
      </div>

      {/* Divider */}
      <div className="w-px bg-gray-200 dark:bg-gray-700" />

      {/* Next Card Preview */}
      <div className="flex-1">
        {nextCard ? (
          <button
            onClick={onSelectNext}
            className="w-full text-right p-3 rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 hover:border-blue-500 dark:hover:border-blue-400 transition-colors group"
            aria-label="Navigate to next card"
          >
            <div className="flex items-start gap-2 flex-row-reverse">
              <svg
                className="w-5 h-5 text-gray-400 dark:text-gray-500 group-hover:text-blue-600 dark:group-hover:text-blue-400 flex-shrink-0 mt-0.5"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M9 5l7 7-7 7"
                />
              </svg>
              <div className="min-w-0 flex-1">
                <div className="text-xs text-gray-500 dark:text-gray-400 mb-1">
                  Next
                </div>
                <div className="text-sm font-medium text-gray-900 dark:text-gray-100 truncate">
                  {truncateText(nextCard.question)}
                </div>
              </div>
            </div>
          </button>
        ) : (
          <div className="h-full flex items-center justify-center opacity-50">
            <span className="text-sm text-gray-400 dark:text-gray-600">
              Last card
            </span>
          </div>
        )}
      </div>
    </div>
  );
}
