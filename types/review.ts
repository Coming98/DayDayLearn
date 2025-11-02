/**
 * Review Type Definitions
 */

import { Card } from './card';

export interface ReviewSession {
  id: string;
  startedAt: Date;
  endedAt?: Date;
  cards: string[];
  currentCardIndex: number;
  responses: ReviewResponse[];
  sessionType: 'daily' | 'focused' | 'catch-up';
}

export interface ReviewResponse {
  cardId: string;
  response: string;
  grade: ReviewGrade;
  responseTime: number;
  recordedAt: Date;
  wasCorrect: boolean;
  face: 'question' | 'answer' | 'notes';
}

export type ReviewGrade = 'fail' | 'pass';

export interface ReviewStatistics {
  totalCards: number;
  reviewedCards: number;
  correctResponses: number;
  incorrectResponses: number;
  averageResponseTime: number;
  sessionDuration: number;
  accuracy: number;
}

export interface SpacedRepetitionCalculation {
  easeFactor: number;
  interval: number;
  nextReviewDate: Date;
  qualityOfResponse: number;
}

export interface ReviewQueue {
  dueCards: Card[];
  newCards: Card[];
  learningCards: Card[];
  overdueCards: Card[];
  totalCount: number;
}

export interface ReviewEvent {
  id: string;
  cardId: string;
  sessionId: string;
  reviewedAt: Date;
  grade: ReviewGrade;
  previousInterval: number;
  newInterval: number;
  previousEaseFactor: number;
  newEaseFactor: number;
  responseTime: number;
}

export interface DailyReviewStats {
  date: Date;
  cardsReviewed: number;
  accuracy: number;
  averageResponseTime: number;
  timeSpent: number;
  newCardsLearned: number;
}

export interface LearningProgress {
  totalCards: number;
  masteredCards: number;
  learningCards: number;
  newCards: number;
  overdueCards: number;
  streak: number;
  lastReviewDate?: Date;
}
