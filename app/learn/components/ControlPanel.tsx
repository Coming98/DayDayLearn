/**
 * ControlPanel Component
 * 
 * Bottom input panel for answer submission.
 * Handles user input, validation, and navigation.
 */

'use client';

import { KeyboardEvent, ChangeEvent } from 'react';

interface ControlPanelProps {
  userAnswer: string;
  onAnswerChange: (answer: string) => void;
  onSubmit: () => void;
  onNext: () => void;
  isFlipped: boolean;
  error: string | null;
}

export default function ControlPanel({
  userAnswer,
  onAnswerChange,
  onSubmit,
  onNext,
  isFlipped,
  error,
}: ControlPanelProps) {
  const handleKeyDown = (e: KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      if (!isFlipped) {
        onSubmit();
      } else {
        onNext();
      }
    }
  };

  const handleChange = (e: ChangeEvent<HTMLInputElement>) => {
    onAnswerChange(e.target.value);
  };

  return (
    <div className="flex h-[15vh] w-full items-center justify-center bg-white px-4 shadow-[0_-4px_6px_-1px_rgba(0,0,0,0.1)] dark:bg-gray-900 md:h-[10vh]">
      <div className="flex w-full max-w-3xl items-center gap-3">
        {!isFlipped ? (
          <>
            {/* Input Field */}
            <div className="flex-1">
              <input
                type="text"
                value={userAnswer}
                onChange={handleChange}
                onKeyDown={handleKeyDown}
                placeholder="Type your answer..."
                className="h-12 w-full rounded-lg border-2 border-gray-300 px-4 text-base text-gray-900 placeholder-gray-400 transition-all focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500 dark:border-gray-600 dark:bg-gray-800 dark:text-white dark:placeholder-gray-500 dark:focus:border-blue-400 dark:focus:ring-blue-400"
                autoFocus
              />
              {error && (
                <p className="mt-1 text-sm text-red-600 dark:text-red-400">{error}</p>
              )}
            </div>

            {/* Submit Button */}
            <button
              onClick={onSubmit}
              className="h-12 rounded-lg bg-blue-600 px-6 font-semibold text-white transition-all hover:bg-blue-700 active:scale-95 disabled:cursor-not-allowed disabled:opacity-50"
              disabled={userAnswer.trim().length === 0}
            >
              Submit
            </button>
          </>
        ) : (
          <>
            {/* Next Button (after answer revealed) */}
            <button
              onClick={onNext}
              className="h-12 w-full max-w-md rounded-lg bg-green-600 px-6 font-semibold text-white transition-all hover:bg-green-700 active:scale-95"
            >
              Next Card →
            </button>
          </>
        )}
      </div>
    </div>
  );
}
