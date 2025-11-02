/**
 * Review Service
 * Manages review sessions, card scheduling, and review event recording
 */

import type { Card } from '@/types/card';
import type { ReviewEvent, ReviewResponse, ReviewSession } from '@/types/review';
import { useCardsStore } from '@/lib/store/cards';
import { useSessionStore } from '@/lib/store/session';
import { calculateNextReview, isCardDue } from '@/lib/scheduler/spaced-repetition';
import { BaseRepository } from '@/lib/storage/repository';

// Review events repository
const reviewEventsRepo = new BaseRepository<ReviewEvent>('qanc.reviews.v1');

/**
 * Review Service Interface
 */
export interface ReviewServiceInterface {
  startReviewSession: (
    filters?: {
      categoryId?: string;
      tagIds?: string[];
      maxCards?: number;
    },
    sessionType?: 'daily' | 'focused' | 'catch-up'
  ) => Promise<{
    success: boolean;
    session?: ReviewSession;
    cards?: Card[];
    error?: { code: string; message: string };
  }>;
  
  submitReview: (
    cardId: string,
    grade: 'pass' | 'fail',
    userAnswer?: string,
    timeSpentMs?: number
  ) => Promise<{
    success: boolean;
    reviewEvent?: ReviewEvent;
    updatedCard?: Card;
    nextCard?: Card | null;
    error?: { code: string; message: string };
  }>;
  
  endReviewSession: () => Promise<{
    success: boolean;
    sessionStats?: {
      totalCards: number;
      reviewed: number;
      passed: number;
      failed: number;
      accuracy: number;
    };
    error?: { code: string; message: string };
  }>;
  
  getDueCards: (filters?: {
    categoryId?: string;
    tagIds?: string[];
    maxCards?: number;
  }) => Promise<{
    success: boolean;
    cards?: Card[];
    error?: { code: string; message: string };
  }>;
  
  getReviewHistory: (
    cardId?: string,
    limit?: number
  ) => Promise<{
    success: boolean;
    reviews?: ReviewEvent[];
    error?: { code: string; message: string };
  }>;
}

/**
 * Review Service Implementation
 */
class ReviewService implements ReviewServiceInterface {
  /**
   * Start a new review session with due cards
   */
  async startReviewSession(
    filters: {
      categoryId?: string;
      tagIds?: string[];
      maxCards?: number;
    } = {},
    sessionType: 'daily' | 'focused' | 'catch-up' = 'daily'
  ) {
    try {
      const cardStore = useCardsStore.getState();
      const sessionStore = useSessionStore.getState();

      // Get all cards
      let cards = cardStore.cards;

      // Filter by category if specified
      if (filters.categoryId) {
        cards = cards.filter(card => card.categoryId === filters.categoryId);
      }

      // Filter by tags if specified
      if (filters.tagIds && filters.tagIds.length > 0) {
        cards = cards.filter(card =>
          filters.tagIds!.some(tagId => card.tags.includes(tagId))
        );
      }

      // Get only due cards
      const dueCards = cards.filter(card => isCardDue(card));

      // Sort by due date (most overdue first)
      dueCards.sort((a, b) => {
        const dueA = a.nextReviewAt?.getTime() || 0;
        const dueB = b.nextReviewAt?.getTime() || 0;
        return dueA - dueB;
      });

      // Apply max cards limit
      const maxCards = filters.maxCards || 20;
      const sessionCards = dueCards.slice(0, maxCards);

      if (sessionCards.length === 0) {
        return {
          success: false,
          error: {
            code: 'NO_CARDS_DUE',
            message: 'No cards are due for review at this time',
          },
        };
      }

      // Start session in store
      sessionStore.startSession(sessionCards, sessionType);
      const session = sessionStore.activeSession;

      return {
        success: true,
        session: session || undefined,
        cards: sessionCards,
      };
    } catch (error) {
      return {
        success: false,
        error: {
          code: 'STORAGE_ERROR',
          message: error instanceof Error ? error.message : 'Failed to start review session',
        },
      };
    }
  }

  /**
   * Submit a review result for a card
   */
  async submitReview(
    cardId: string,
    grade: 'pass' | 'fail',
    userAnswer = '',
    timeSpentMs?: number
  ) {
    try {
      const cardStore = useCardsStore.getState();
      const sessionStore = useSessionStore.getState();

      // Get the card
      const card = cardStore.getCard(cardId);
      if (!card) {
        return {
          success: false,
          error: {
            code: 'CARD_NOT_FOUND',
            message: `Card with ID ${cardId} not found`,
          },
        };
      }

      const session = sessionStore.activeSession;
      if (!session) {
        return {
          success: false,
          error: {
            code: 'INVALID_SESSION',
            message: 'No active review session',
          },
        };
      }

      // Calculate time spent
      const responseTime = timeSpentMs || sessionStore.getCardTimeSpent();

      // Calculate new scheduling data
      const previousInterval = card.interval;
      const previousEaseFactor = card.easeFactor;
      
      const nextReview = calculateNextReview(card, grade);

      // Create review response
      const response: ReviewResponse = {
        cardId,
        response: userAnswer,
        grade,
        responseTime,
        recordedAt: new Date(),
        wasCorrect: grade === 'pass',
        face: sessionStore.currentFace,
      };

      // Create review event
      const reviewEvent: ReviewEvent = {
        id: `review-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
        cardId,
        sessionId: session.id,
        reviewedAt: new Date(),
        grade,
        previousInterval,
        newInterval: nextReview.interval,
        previousEaseFactor,
        newEaseFactor: nextReview.easeFactor,
        responseTime,
      };

      // Update card with new scheduling data
      const updatedCard: Card = {
        ...card,
        interval: nextReview.interval,
        easeFactor: nextReview.easeFactor,
        nextReviewAt: nextReview.nextReviewDate,
        repetitionCount: card.repetitionCount + 1,
        correctCount: card.correctCount + (grade === 'pass' ? 1 : 0),
        incorrectCount: card.incorrectCount + (grade === 'fail' ? 1 : 0),
        lastReviewedAt: new Date(),
        updatedAt: new Date(),
        averageResponseTime: card.averageResponseTime
          ? (card.averageResponseTime + responseTime) / 2
          : responseTime,
      };

      // Save review event
      await reviewEventsRepo.create(reviewEvent);

      // Update card in store
      cardStore.updateCard(cardId, updatedCard);

      // Record response in session
      sessionStore.recordResponse(response);

      // Get next card
      const nextCardIndex = session.currentCardIndex + 1;
      const sessionCards = sessionStore.sessionCards;
      const nextCard = nextCardIndex < sessionCards.length ? sessionCards[nextCardIndex] : null;

      return {
        success: true,
        reviewEvent,
        updatedCard,
        nextCard,
      };
    } catch (error) {
      return {
        success: false,
        error: {
          code: 'STORAGE_ERROR',
          message: error instanceof Error ? error.message : 'Failed to submit review',
        },
      };
    }
  }

  /**
   * End the current review session
   */
  async endReviewSession() {
    try {
      const sessionStore = useSessionStore.getState();
      const stats = sessionStore.getSessionStats();

      sessionStore.endSession();

      return {
        success: true,
        sessionStats: {
          totalCards: sessionStore.sessionCards.length,
          reviewed: stats.reviewed,
          passed: stats.passed,
          failed: stats.failed,
          accuracy: stats.accuracy,
        },
      };
    } catch (error) {
      return {
        success: false,
        error: {
          code: 'STORAGE_ERROR',
          message: error instanceof Error ? error.message : 'Failed to end session',
        },
      };
    }
  }

  /**
   * Get due cards based on filters
   */
  async getDueCards(filters: {
    categoryId?: string;
    tagIds?: string[];
    maxCards?: number;
  } = {}) {
    try {
      const cardStore = useCardsStore.getState();
      let cards = cardStore.cards;

      // Filter by category if specified
      if (filters.categoryId) {
        cards = cards.filter(card => card.categoryId === filters.categoryId);
      }

      // Filter by tags if specified
      if (filters.tagIds && filters.tagIds.length > 0) {
        cards = cards.filter(card =>
          filters.tagIds!.some(tagId => card.tags.includes(tagId))
        );
      }

      // Get only due cards
      const dueCards = cards.filter(card => isCardDue(card));

      // Apply max cards limit
      const maxCards = filters.maxCards || 100;
      const limitedCards = dueCards.slice(0, maxCards);

      return {
        success: true,
        cards: limitedCards,
      };
    } catch (error) {
      return {
        success: false,
        error: {
          code: 'STORAGE_ERROR',
          message: error instanceof Error ? error.message : 'Failed to get due cards',
        },
      };
    }
  }

  /**
   * Get review history for a specific card or all reviews
   */
  async getReviewHistory(cardId?: string, limit = 100) {
    try {
      const allReviews = await reviewEventsRepo.findAll();

      let reviews = allReviews;

      // Filter by card ID if specified
      if (cardId) {
        reviews = reviews.filter(review => review.cardId === cardId);
      }

      // Sort by most recent first
      reviews.sort((a, b) => b.reviewedAt.getTime() - a.reviewedAt.getTime());

      // Apply limit
      const limitedReviews = reviews.slice(0, limit);

      return {
        success: true,
        reviews: limitedReviews,
      };
    } catch (error) {
      return {
        success: false,
        error: {
          code: 'STORAGE_ERROR',
          message: error instanceof Error ? error.message : 'Failed to get review history',
        },
      };
    }
  }
}

// Export singleton instance
export const reviewService = new ReviewService();
