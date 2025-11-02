/**
 * PreviewChip Component
 * 
 * Small preview overlay showing adjacent card content.
 * Allows quick navigation by clicking.
 */

'use client';

import { Flashcard } from '@/app/types/flashcard';

interface PreviewChipProps {
  card: Flashcard | null;
  position: 'left' | 'right';
  onClick: () => void;
}

export default function PreviewChip({ card, position, onClick }: PreviewChipProps) {
  // Don't render if no card
  if (!card) return null;

  // Truncate text for preview
  const truncateText = (text: string, maxLength: number) => {
    if (text.length <= maxLength) return text;
    return text.substring(0, maxLength) + '...';
  };

  const truncatedQuestion = truncateText(card.question, 30);
  const truncatedAnswer = truncateText(card.answer, 20);

  const positionClasses =
    position === 'left'
      ? 'left-4 top-4'
      : 'right-4 top-4';

  return (
    <button
      onClick={onClick}
      className={`absolute z-10 hidden rounded-lg bg-white/90 p-3 shadow-lg backdrop-blur-sm transition-all hover:scale-105 hover:bg-white hover:shadow-xl active:scale-95 dark:bg-gray-800/90 dark:hover:bg-gray-800 lg:block ${positionClasses}`}
      title={`Jump to ${position === 'left' ? 'previous' : 'next'} card`}
    >
      <div className="flex items-center gap-2">
        {/* Arrow Icon */}
        {position === 'left' ? (
          <svg
            className="h-4 w-4 text-gray-600 dark:text-gray-400"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
        ) : (
          <svg
            className="h-4 w-4 text-gray-600 dark:text-gray-400"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
          </svg>
        )}

        {/* Card Preview Content */}
        <div className="text-left">
          <p className="max-w-[200px] text-xs font-semibold text-gray-900 dark:text-white">
            {truncatedQuestion}
          </p>
          <p className="max-w-[200px] text-xs text-gray-600 dark:text-gray-400">
            {truncatedAnswer}
          </p>
        </div>
      </div>
    </button>
  );
}
