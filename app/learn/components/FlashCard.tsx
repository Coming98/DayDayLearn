/**
 * FlashCard Component
 * 
 * Displays a flashcard with flip animation.
 * Shows question on front, answer with feedback on back.
 */

'use client';

interface FlashCardProps {
  question: string;
  answer: string;
  isFlipped: boolean;
  isCorrect: boolean | null;
  notes?: string;
}

export default function FlashCard({
  question,
  answer,
  isFlipped,
  isCorrect,
  notes,
}: FlashCardProps) {
  return (
    <div className="card-flip-container h-full w-full">
      <div className={`card-flip-inner ${isFlipped ? 'flipped' : ''}`}>
        {/* Front Face - Question */}
        <div className="card-face card-face-front flex items-center justify-center rounded-2xl bg-white p-8 shadow-2xl dark:bg-gray-800">
          <div className="text-center">
            <p className="text-sm font-semibold uppercase tracking-wide text-gray-500 dark:text-gray-400">
              Question
            </p>
            <h2 className="mt-4 text-3xl font-bold text-gray-900 dark:text-white md:text-4xl lg:text-5xl">
              {question}
            </h2>
          </div>
        </div>

        {/* Back Face - Answer with Feedback */}
        <div className="card-face card-face-back flex flex-col items-center justify-center rounded-2xl bg-white p-8 shadow-2xl dark:bg-gray-800">
          {/* Feedback Icon */}
          {isCorrect !== null && (
            <div className="mb-6">
              {isCorrect ? (
                <div className="flex h-20 w-20 items-center justify-center rounded-full bg-green-100 dark:bg-green-900">
                  <svg
                    className="h-12 w-12 text-green-600 dark:text-green-400"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={3}
                      d="M5 13l4 4L19 7"
                    />
                  </svg>
                </div>
              ) : (
                <div className="flex h-20 w-20 items-center justify-center rounded-full bg-red-100 dark:bg-red-900">
                  <svg
                    className="h-12 w-12 text-red-600 dark:text-red-400"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={3}
                      d="M6 18L18 6M6 6l12 12"
                    />
                  </svg>
                </div>
              )}
            </div>
          )}

          {/* Answer Text */}
          <div className="text-center">
            <p className="text-sm font-semibold uppercase tracking-wide text-gray-500 dark:text-gray-400">
              Correct Answer
            </p>
            <h2 className="mt-4 text-3xl font-bold text-gray-900 dark:text-white md:text-4xl lg:text-5xl">
              {answer}
            </h2>

            {/* Notes (if available) */}
            {notes && (
              <p className="mt-6 max-w-md text-sm italic text-gray-600 dark:text-gray-400">
                💡 {notes}
              </p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
