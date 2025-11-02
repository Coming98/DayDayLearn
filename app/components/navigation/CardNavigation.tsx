/**
 * Card Navigation Component
 * Provides navigation controls for review sessions
 */

import { Button } from '../ui/Button';

export interface CardNavigationProps {
  currentIndex: number;
  totalCards: number;
  onPrevious: () => void;
  onNext: () => void;
  onJumpTo?: (index: number) => void;
  canGoPrevious?: boolean;
  canGoNext?: boolean;
  className?: string;
}

export function CardNavigation({
  currentIndex,
  totalCards,
  onPrevious,
  onNext,
  onJumpTo,
  canGoPrevious = true,
  canGoNext = true,
  className = '',
}: CardNavigationProps) {
  const isPreviousDisabled = currentIndex === 0 || !canGoPrevious;
  const isNextDisabled = currentIndex >= totalCards - 1 || !canGoNext;
  const progressPercentage = totalCards > 0 ? ((currentIndex + 1) / totalCards) * 100 : 0;

  return (
    <div className={`space-y-4 ${className}`}>
      {/* Progress Indicator */}
      <div>
        <div className="flex justify-between items-center mb-2">
          <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
            Card {currentIndex + 1} of {totalCards}
          </span>
          <span className="text-sm text-gray-500 dark:text-gray-400">
            {progressPercentage.toFixed(0)}%
          </span>
        </div>
        <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
          <div
            className="bg-blue-600 dark:bg-blue-400 h-2 rounded-full transition-all duration-300 ease-out"
            style={{ width: `${progressPercentage}%` }}
          />
        </div>
      </div>

      {/* Navigation Buttons */}
      <div className="flex gap-3">
        <Button
          variant="secondary"
          onClick={onPrevious}
          disabled={isPreviousDisabled}
          className="flex-1"
          aria-label="Previous card"
        >
          <svg
            className="w-5 h-5 mr-1"
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
          Previous
        </Button>

        {onJumpTo && (
          <div className="flex gap-1">
            {Array.from({ length: Math.min(totalCards, 5) }, (_, i) => {
              const index = Math.floor((i / 4) * (totalCards - 1));
              const isActive = index === currentIndex;
              
              return (
                <button
                  key={i}
                  onClick={() => onJumpTo(index)}
                  className={`w-8 h-8 rounded-full text-xs font-medium transition-colors ${
                    isActive
                      ? 'bg-blue-600 dark:bg-blue-500 text-white'
                      : 'bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-300 dark:hover:bg-gray-600'
                  }`}
                  aria-label={`Jump to card ${index + 1}`}
                >
                  {index + 1}
                </button>
              );
            })}
          </div>
        )}

        <Button
          variant="secondary"
          onClick={onNext}
          disabled={isNextDisabled}
          className="flex-1"
          aria-label="Next card"
        >
          Next
          <svg
            className="w-5 h-5 ml-1"
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
        </Button>
      </div>

      {/* Keyboard Shortcuts Hint */}
      <div className="text-xs text-gray-500 dark:text-gray-500 text-center">
        Use arrow keys to navigate • Space to show answer
      </div>
    </div>
  );
}
