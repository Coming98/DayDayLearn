'use client';

import type { Card } from '@/types/card';
import { FaceQ } from './FaceQ';
import { FaceA } from './FaceA';
import { FaceNote } from './FaceNote';
import { MediaElement } from './MediaElement';
import { useUIStore } from '@/lib/store/ui';

interface CardViewProps {
  card: Card;
  showAnswer?: boolean;
  onToggleAnswer?: () => void;
}

export function CardView({ card, showAnswer = false, onToggleAnswer }: CardViewProps) {
  const { currentCardFace } = useUIStore();

  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6 max-w-2xl mx-auto">
      {/* Card Header */}
      <div className="mb-4 pb-4 border-b border-gray-200 dark:border-gray-700">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            {card.categoryId && (
              <span className="text-xs px-2 py-1 bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-200 rounded">
                Category
              </span>
            )}
            {card.tags.length > 0 && (
              <span className="text-xs text-gray-500 dark:text-gray-400">
                {card.tags.length} {card.tags.length === 1 ? 'tag' : 'tags'}
              </span>
            )}
          </div>
          <div className="text-xs text-gray-500 dark:text-gray-400">
            {card.repetitionCount > 0 ? `Reviewed ${card.repetitionCount}x` : 'New'}
          </div>
        </div>
      </div>

      {/* Card Content */}
      <div className="space-y-6">
        {/* Question (always visible) */}
        <FaceQ question={card.question} />

        {/* Answer (conditional) */}
        {showAnswer && (
          <>
            <div className="border-t border-gray-200 dark:border-gray-700 my-6" />
            <FaceA answer={card.answer} />
          </>
        )}

        {/* Notes (when answer is shown and notes exist) */}
        {showAnswer && card.notes && (
          <>
            <div className="border-t border-gray-200 dark:border-gray-700 my-6" />
            <FaceNote notes={card.notes} />
          </>
        )}

        {/* Media Attachments */}
        {card.mediaAttachments.length > 0 && (
          <div className="mt-6">
            <h4 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">
              Attachments
            </h4>
            <div className="grid grid-cols-2 gap-4">
              {card.mediaAttachments.map(media => (
                <MediaElement key={media.id} media={media} />
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Toggle Answer Button */}
      {onToggleAnswer && (
        <div className="mt-6 pt-6 border-t border-gray-200 dark:border-gray-700">
          <button
            onClick={onToggleAnswer}
            className="w-full px-4 py-3 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-lg transition-colors"
          >
            {showAnswer ? 'Hide Answer' : 'Show Answer'}
          </button>
        </div>
      )}

      {/* Card Metadata */}
      <div className="mt-4 text-xs text-gray-500 dark:text-gray-400 space-y-1">
        <div>Created: {new Date(card.createdAt).toLocaleDateString()}</div>
        {card.lastReviewedAt && (
          <div>Last reviewed: {new Date(card.lastReviewedAt).toLocaleDateString()}</div>
        )}
        {card.nextReviewAt && (
          <div>Next review: {new Date(card.nextReviewAt).toLocaleDateString()}</div>
        )}
      </div>
    </div>
  );
}
