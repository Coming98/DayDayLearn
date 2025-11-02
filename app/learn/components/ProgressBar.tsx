/**
 * ProgressBar Component
 * 
 * Displays current progress through the card deck.
 */

'use client';

interface ProgressBarProps {
  currentIndex: number;
  totalCards: number;
}

export default function ProgressBar({ currentIndex, totalCards }: ProgressBarProps) {
  // Calculate progress percentage (0-100)
  const percentage = totalCards > 0 ? ((currentIndex + 1) / totalCards) * 100 : 0;

  // Ensure percentage is between 0 and 100
  const clampedPercentage = Math.min(100, Math.max(0, percentage));

  return (
    <div className="w-full bg-gray-200 dark:bg-gray-700">
      <div className="relative h-8 w-full">
        {/* Progress Fill */}
        <div
          className="absolute left-0 top-0 h-full bg-gradient-to-r from-blue-500 to-blue-600 transition-all duration-300 ease-out"
          style={{ width: `${clampedPercentage}%` }}
        />

        {/* Text Overlay */}
        <div className="absolute inset-0 flex items-center justify-center">
          <p className="text-sm font-semibold text-gray-700 drop-shadow-sm dark:text-white">
            Card {currentIndex + 1} of {totalCards}
          </p>
        </div>
      </div>
    </div>
  );
}
