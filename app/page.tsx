'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useCardsStore } from '@/lib/store/cards';
import { useUIStore } from '@/lib/store/ui';
import { useSessionStore } from '@/lib/store/session';
import { cardService, categoryService, tagService } from '@/lib/services/card-service';
import { reviewService } from '@/lib/services/review-service';
import { Button } from './components/ui/Button';
import { ToastContainer } from './components/ui/Toast';
import { CardView } from './components/card/CardView';
import { createToast, handleError } from '@/lib/utils/error-handling';

export default function Home() {
  const router = useRouter();
  const { cards, setCards, setCategories, setTags, getDueCards } = useCardsStore();
  const { toasts, removeToast, addToast } = useUIStore();
  const {
    isSessionActive,
    getCurrentCard,
    currentFace,
    setCurrentFace,
    nextCard,
    previousCard,
    getSessionProgress,
    getSessionStats,
    endSession,
    startCardTimer,
  } = useSessionStore();

  const [isReviewing, setIsReviewing] = useState(false);
  const [userAnswer, setUserAnswer] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    // Load data on mount
    const loadData = async () => {
      try {
        const [cardsData, categoriesData, tagsData] = await Promise.all([
          cardService.getAllCards(),
          categoryService.getAllCategories(),
          tagService.getAllTags(),
        ]);

        setCards(cardsData);
        setCategories(categoriesData);
        setTags(tagsData);
      } catch (error) {
        const appError = handleError(error);
        addToast(createToast('error', appError.userMessage || 'Failed to load data'));
      }
    };

    loadData();
  }, [setCards, setCategories, setTags, addToast]);

  const dueCards = getDueCards();
  const newCards = cards.filter(card => card.repetitionCount === 0);
  const currentCard = getCurrentCard();
  const progress = getSessionProgress();
  const stats = getSessionStats();

  // Start review session
  const handleStartReview = async () => {
    try {
      const result = await reviewService.startReviewSession({ maxCards: 20 }, 'daily');
      
      if (result.success) {
        setIsReviewing(true);
        startCardTimer();
        addToast(createToast('success', `Review session started with ${result.cards?.length || 0} cards`));
      } else {
        addToast(createToast('error', result.error?.message || 'Failed to start review'));
      }
    } catch (error) {
      const appError = handleError(error);
      addToast(createToast('error', appError.userMessage || 'Failed to start review session'));
    }
  };

  // Submit review (pass/fail)
  const handleSubmitReview = async (grade: 'pass' | 'fail') => {
    if (!currentCard) return;

    setIsSubmitting(true);
    try {
      const result = await reviewService.submitReview(
        currentCard.id,
        grade,
        userAnswer
      );

      if (result.success) {
        if (result.nextCard) {
          // Move to next card
          nextCard();
          setUserAnswer('');
          setCurrentFace('question');
          startCardTimer();
        } else {
          // Session complete
          await handleEndSession();
        }
      } else {
        addToast(createToast('error', result.error?.message || 'Failed to submit review'));
      }
    } catch (error) {
      const appError = handleError(error);
      addToast(createToast('error', appError.userMessage || 'Failed to submit review'));
    } finally {
      setIsSubmitting(false);
    }
  };

  // End review session
  const handleEndSession = async () => {
    try {
      const result = await reviewService.endReviewSession();
      
      if (result.success && result.sessionStats) {
        endSession();
        setIsReviewing(false);
        setUserAnswer('');
        
        addToast(
          createToast(
            'success',
            `Session complete! Reviewed: ${result.sessionStats.reviewed}, Accuracy: ${result.sessionStats.accuracy.toFixed(1)}%`
          )
        );
      }
    } catch (error) {
      const appError = handleError(error);
      addToast(createToast('error', appError.userMessage || 'Failed to end session'));
    }
  };

  // Toggle between question and answer
  const handleToggleAnswer = () => {
    if (currentFace === 'question') {
      setCurrentFace('answer');
    } else if (currentFace === 'answer') {
      setCurrentFace('notes');
    } else {
      setCurrentFace('question');
    }
  };

  // Review session view
  if (isReviewing && isSessionActive()) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
        <div className="max-w-4xl mx-auto py-8 px-4">
          {/* Progress Header */}
          <div className="mb-6">
            <div className="flex justify-between items-center mb-2">
              <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100">
                Review Session
              </h1>
              <Button
                variant="ghost"
                size="sm"
                onClick={handleEndSession}
              >
                End Session
              </Button>
            </div>
            
            {/* Progress Bar */}
            <div className="bg-gray-200 dark:bg-gray-700 rounded-full h-2 mb-2">
              <div
                className="bg-blue-600 dark:bg-blue-400 h-2 rounded-full transition-all duration-300"
                style={{ width: `${progress.percentage}%` }}
              />
            </div>
            
            <div className="flex justify-between text-sm text-gray-600 dark:text-gray-400">
              <span>Card {progress.current} of {progress.total}</span>
              <span>Accuracy: {stats.accuracy.toFixed(0)}%</span>
            </div>
          </div>

          {/* Card Display */}
          {currentCard && (
            <div className="mb-6">
              <CardView card={currentCard} />
            </div>
          )}

          {/* Answer Input */}
          {currentFace === 'question' && (
            <div className="mb-6">
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Your Answer (Optional)
              </label>
              <textarea
                value={userAnswer}
                onChange={(e) => setUserAnswer(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-400 focus:border-transparent bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100"
                rows={4}
                placeholder="Type your answer here..."
              />
            </div>
          )}

          {/* Action Buttons */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {currentFace === 'question' ? (
              <>
                <Button
                  variant="secondary"
                  size="lg"
                  fullWidth
                  onClick={() => previousCard()}
                  disabled={progress.current === 1}
                >
                  Previous
                </Button>
                <Button
                  variant="primary"
                  size="lg"
                  fullWidth
                  onClick={handleToggleAnswer}
                >
                  Show Answer
                </Button>
                <Button
                  variant="ghost"
                  size="lg"
                  fullWidth
                  onClick={() => nextCard()}
                  disabled={progress.current === progress.total}
                >
                  Skip
                </Button>
              </>
            ) : (
              <>
                <Button
                  variant="danger"
                  size="lg"
                  fullWidth
                  onClick={() => handleSubmitReview('fail')}
                  disabled={isSubmitting}
                >
                  {isSubmitting ? 'Submitting...' : 'Fail'}
                </Button>
                {currentFace === 'answer' && (
                  <Button
                    variant="secondary"
                    size="lg"
                    fullWidth
                    onClick={handleToggleAnswer}
                  >
                    Show Notes
                  </Button>
                )}
                <Button
                  variant="primary"
                  size="lg"
                  fullWidth
                  onClick={() => handleSubmitReview('pass')}
                  disabled={isSubmitting}
                >
                  {isSubmitting ? 'Submitting...' : 'Pass'}
                </Button>
              </>
            )}
          </div>

          {/* Session Stats */}
          <div className="mt-6 grid grid-cols-3 gap-4 text-center">
            <div>
              <div className="text-2xl font-bold text-green-600 dark:text-green-400">
                {stats.passed}
              </div>
              <div className="text-sm text-gray-600 dark:text-gray-400">Passed</div>
            </div>
            <div>
              <div className="text-2xl font-bold text-red-600 dark:text-red-400">
                {stats.failed}
              </div>
              <div className="text-sm text-gray-600 dark:text-gray-400">Failed</div>
            </div>
            <div>
              <div className="text-2xl font-bold text-blue-600 dark:text-blue-400">
                {stats.reviewed}
              </div>
              <div className="text-sm text-gray-600 dark:text-gray-400">Total</div>
            </div>
          </div>
        </div>

        {/* Toast Notifications */}
        <ToastContainer toasts={toasts} onRemove={removeToast} />
      </div>
    );
  }

  // Dashboard view (when not in review session)
  return (
    <div className="min-h-screen">
      <div className="max-w-4xl mx-auto py-8 px-4">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-gray-900 dark:text-gray-100 mb-2">
            DayDayLearn
          </h1>
          <p className="text-gray-600 dark:text-gray-400">
            QANC Learning System - Spaced Repetition Made Simple
          </p>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
            <div className="text-3xl font-bold text-blue-600 dark:text-blue-400 mb-1">
              {cards.length}
            </div>
            <div className="text-sm text-gray-600 dark:text-gray-400">
              Total Cards
            </div>
          </div>

          <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
            <div className="text-3xl font-bold text-green-600 dark:text-green-400 mb-1">
              {dueCards.length}
            </div>
            <div className="text-sm text-gray-600 dark:text-gray-400">
              Due for Review
            </div>
          </div>

          <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
            <div className="text-3xl font-bold text-purple-600 dark:text-purple-400 mb-1">
              {newCards.length}
            </div>
            <div className="text-sm text-gray-600 dark:text-gray-400">
              New Cards
            </div>
          </div>
        </div>

        {/* Quick Actions */}
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6 mb-8">
          <h2 className="text-xl font-semibold text-gray-900 dark:text-gray-100 mb-4">
            Quick Actions
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Button
              variant="primary"
              size="lg"
              fullWidth
              onClick={handleStartReview}
              disabled={dueCards.length === 0}
            >
              Start Review ({dueCards.length})
            </Button>
            <Button
              variant="secondary"
              size="lg"
              fullWidth
              onClick={() => router.push('/create')}
            >
              Create New Card
            </Button>
          </div>
        </div>

        {/* Recent Cards */}
        {cards.length > 0 ? (
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
            <h2 className="text-xl font-semibold text-gray-900 dark:text-gray-100 mb-4">
              Recent Cards
            </h2>
            <div className="space-y-3">
              {cards.slice(0, 5).map(card => (
                <div
                  key={card.id}
                  className="p-4 border border-gray-200 dark:border-gray-700 rounded-lg hover:border-blue-500 dark:hover:border-blue-400 transition-colors cursor-pointer"
                  onClick={() => router.push(`/edit/${card.id}`)}
                >
                  <div className="font-medium text-gray-900 dark:text-gray-100 mb-1">
                    {card.question}
                  </div>
                  <div className="text-sm text-gray-600 dark:text-gray-400 truncate">
                    {card.answer}
                  </div>
                  <div className="mt-2 flex items-center gap-2 text-xs text-gray-500 dark:text-gray-500">
                    {card.repetitionCount > 0 ? (
                      <span>Reviewed {card.repetitionCount}x</span>
                    ) : (
                      <span className="text-purple-600 dark:text-purple-400">New</span>
                    )}
                    <span>•</span>
                    <span>Created {new Date(card.createdAt).toLocaleDateString()}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        ) : (
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-12 text-center">
            <div className="text-6xl mb-4">📚</div>
            <h3 className="text-xl font-semibold text-gray-900 dark:text-gray-100 mb-2">
              No cards yet
            </h3>
            <p className="text-gray-600 dark:text-gray-400 mb-6">
              Create your first learning card to get started
            </p>
            <Button
              variant="primary"
              size="lg"
              onClick={() => router.push('/create')}
            >
              Create First Card
            </Button>
          </div>
        )}
      </div>

      {/* Toast Notifications */}
      <ToastContainer toasts={toasts} onRemove={removeToast} />
    </div>
  );
}
