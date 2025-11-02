import type { Card } from '@/types/card';
import type { ReviewGrade, SpacedRepetitionCalculation } from '@/types/review';

/**
 * Ebbinghaus-based Spaced Repetition Algorithm
 * Implements SM-2 (SuperMemo 2) algorithm with modifications
 */

const DEFAULT_EASE_FACTOR = 2.5;
const MIN_EASE_FACTOR = 1.3;
const INITIAL_INTERVAL_DAYS = 1;

/**
 * Calculate next review date and updated card properties
 */
export function calculateNextReview(
  card: Card,
  grade: ReviewGrade
): SpacedRepetitionCalculation {
  const now = new Date();
  const { repetitionCount = 0, easeFactor = DEFAULT_EASE_FACTOR, interval = 0 } = card;

  let newRepetitions = repetitionCount;
  let newEaseFactor = easeFactor;
  let newInterval = interval;

  // Grade mapping: again (0), hard (1), good (2), easy (3)
  const gradeValue = getGradeValue(grade);

  if (gradeValue >= 2) {
    // Good or Easy - card remembered
    newRepetitions = repetitionCount + 1;

    if (newRepetitions === 1) {
      newInterval = INITIAL_INTERVAL_DAYS;
    } else if (newRepetitions === 2) {
      newInterval = 6;
    } else {
      newInterval = Math.round(interval * newEaseFactor);
    }

    // Adjust ease factor based on performance
    newEaseFactor = calculateNewEaseFactor(easeFactor, gradeValue);
  } else {
    // Again or Hard - card forgotten
    newRepetitions = 0;
    newInterval = gradeValue === 0 ? 0 : 1; // Again: review today, Hard: review tomorrow
    newEaseFactor = Math.max(MIN_EASE_FACTOR, easeFactor - 0.2);
  }

  // Calculate next review date
  const nextReviewDate = new Date(now);
  nextReviewDate.setDate(nextReviewDate.getDate() + newInterval);

  return {
    nextReviewDate,
    interval: newInterval,
    easeFactor: newEaseFactor,
    qualityOfResponse: gradeValue,
  };
}

/**
 * Calculate new ease factor using SM-2 formula
 */
function calculateNewEaseFactor(currentEase: number, grade: number): number {
  // SM-2 formula: EF' = EF + (0.1 - (5 - q) * (0.08 + (5 - q) * 0.02))
  // where q is the grade (0-5), we map our 0-3 to 1-5
  const q = grade + 2; // Maps 0,1,2,3 to 2,3,4,5
  const newEase = currentEase + (0.1 - (5 - q) * (0.08 + (5 - q) * 0.02));
  
  return Math.max(MIN_EASE_FACTOR, newEase);
}

/**
 * Convert review grade to numeric value
 */
function getGradeValue(grade: ReviewGrade): number {
  const gradeMap: Record<ReviewGrade, number> = {
    fail: 0,
    pass: 2,
  };
  return gradeMap[grade];
}

/**
 * Check if a card is due for review
 */
export function isCardDue(card: Card, referenceDate: Date = new Date()): boolean {
  if (!card.nextReviewAt) {
    return true; // New cards are always due
  }

  const nextReview = new Date(card.nextReviewAt);
  return referenceDate >= nextReview;
}

/**
 * Get cards due for review, sorted by priority
 */
export function getDueCards(cards: Card[], referenceDate: Date = new Date()): Card[] {
  return cards
    .filter(card => isCardDue(card, referenceDate))
    .sort((a, b) => {
      // Priority order:
      // 1. Overdue cards (oldest first)
      // 2. New cards (never reviewed)
      // 3. Today's reviews

      const aDate = a.nextReviewAt ? new Date(a.nextReviewAt) : new Date(0);
      const bDate = b.nextReviewAt ? new Date(b.nextReviewAt) : new Date(0);

      const aIsNew = a.repetitionCount === 0 && !a.lastReviewedAt;
      const bIsNew = b.repetitionCount === 0 && !b.lastReviewedAt;

      if (aIsNew && !bIsNew) return 1; // New cards after overdue
      if (!aIsNew && bIsNew) return -1;

      // Sort by date (oldest first)
      return aDate.getTime() - bDate.getTime();
    });
}

/**
 * Calculate review statistics for a card
 */
export function calculateCardStats(card: Card): {
  retentionRate: number;
  averageGrade: number;
  totalReviews: number;
  daysSinceCreation: number;
} {
  const totalReviews = card.repetitionCount || 0;
  const daysSinceCreation = card.createdAt
    ? Math.floor((Date.now() - new Date(card.createdAt).getTime()) / (1000 * 60 * 60 * 24))
    : 0;

  // Simplified retention calculation based on repetitions and ease factor
  const retentionRate = totalReviews === 0 
    ? 0 
    : Math.min(100, ((card.easeFactor || DEFAULT_EASE_FACTOR) / DEFAULT_EASE_FACTOR) * 100);

  // Estimate average grade from ease factor
  // Higher ease factor = better average grade
  const averageGrade = totalReviews === 0
    ? 0
    : Math.max(0, Math.min(3, ((card.easeFactor || DEFAULT_EASE_FACTOR) - 1.3) / 0.4));

  return {
    retentionRate: Math.round(retentionRate),
    averageGrade: Math.round(averageGrade * 10) / 10,
    totalReviews,
    daysSinceCreation,
  };
}

/**
 * Estimate time until mastery (ease factor >= 2.5 with 10+ repetitions)
 */
export function estimateMasteryDays(card: Card): number {
  const targetRepetitions = 10;
  const targetEaseFactor = 2.5;

  const currentReps = card.repetitionCount || 0;
  const currentEase = card.easeFactor || DEFAULT_EASE_FACTOR;

  if (currentReps >= targetRepetitions && currentEase >= targetEaseFactor) {
    return 0; // Already mastered
  }

  // Estimate based on current interval growth
  const avgIntervalGrowth = currentEase;
  const remainingReps = Math.max(0, targetRepetitions - currentReps);
  const currentInterval = card.interval || 1;

  let totalDays = 0;
  let interval = currentInterval;

  for (let i = 0; i < remainingReps; i++) {
    interval = Math.round(interval * avgIntervalGrowth);
    totalDays += interval;
  }

  return totalDays;
}
