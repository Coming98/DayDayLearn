import type { Card, CardValidationError } from '@/types/card';

/**
 * Card Validation Rules
 * Validates card data before creation/update
 */

const MIN_QUESTION_LENGTH = 3;
const MAX_QUESTION_LENGTH = 500;
const MIN_ANSWER_LENGTH = 1;
const MAX_ANSWER_LENGTH = 2000;
const MAX_NOTES_LENGTH = 5000;
const MAX_TAGS = 10;
const MAX_MEDIA_ATTACHMENTS = 5;
const MAX_MEDIA_SIZE_MB = 10;

/**
 * Validate a card for creation or update
 */
export function validateCard(card: Partial<Card>): CardValidationError[] {
  const errors: CardValidationError[] = [];

  // Question validation
  if (card.question !== undefined) {
    if (!card.question || card.question.trim().length === 0) {
      errors.push({
        field: 'question',
        message: 'Question is required',
      });
    } else if (card.question.trim().length < MIN_QUESTION_LENGTH) {
      errors.push({
        field: 'question',
        message: `Question must be at least ${MIN_QUESTION_LENGTH} characters`,
      });
    } else if (card.question.length > MAX_QUESTION_LENGTH) {
      errors.push({
        field: 'question',
        message: `Question must not exceed ${MAX_QUESTION_LENGTH} characters`,
      });
    }
  }

  // Answer validation
  if (card.answer !== undefined) {
    if (!card.answer || card.answer.trim().length === 0) {
      errors.push({
        field: 'answer',
        message: 'Answer is required',
      });
    } else if (card.answer.trim().length < MIN_ANSWER_LENGTH) {
      errors.push({
        field: 'answer',
        message: `Answer must be at least ${MIN_ANSWER_LENGTH} character`,
      });
    } else if (card.answer.length > MAX_ANSWER_LENGTH) {
      errors.push({
        field: 'answer',
        message: `Answer must not exceed ${MAX_ANSWER_LENGTH} characters`,
      });
    }
  }

  // Notes validation (optional)
  if (card.notes && card.notes.length > MAX_NOTES_LENGTH) {
    errors.push({
      field: 'notes',
      message: `Notes must not exceed ${MAX_NOTES_LENGTH} characters`,
    });
  }

  // Tags validation
  if (card.tags) {
    if (card.tags.length > MAX_TAGS) {
      errors.push({
        field: 'tags',
        message: `Maximum ${MAX_TAGS} tags allowed`,
      });
    }

    // Check for empty tags
    const emptyTags = card.tags.filter(tag => !tag.trim());
    if (emptyTags.length > 0) {
      errors.push({
        field: 'tags',
        message: 'Tags cannot be empty',
      });
    }

    // Check for duplicate tags
    const uniqueTags = new Set(card.tags.map(t => t.toLowerCase()));
    if (uniqueTags.size !== card.tags.length) {
      errors.push({
        field: 'tags',
        message: 'Duplicate tags are not allowed',
      });
    }
  }

  // Media attachments validation
  if (card.mediaAttachments) {
    if (card.mediaAttachments.length > MAX_MEDIA_ATTACHMENTS) {
      errors.push({
        field: 'mediaAttachments',
        message: `Maximum ${MAX_MEDIA_ATTACHMENTS} media attachments allowed`,
      });
    }

    // Check media file sizes
    const oversizedMedia = card.mediaAttachments.filter(
      media => media.size > MAX_MEDIA_SIZE_MB * 1024 * 1024
    );
    if (oversizedMedia.length > 0) {
      errors.push({
        field: 'mediaAttachments',
        message: `Media files must not exceed ${MAX_MEDIA_SIZE_MB}MB`,
      });
    }

    // Validate media types
    const validImageTypes = ['image/jpeg', 'image/png', 'image/gif', 'image/webp'];
    const validAudioTypes = ['audio/mpeg', 'audio/mp3', 'audio/wav', 'audio/ogg'];
    const validVideoTypes = ['video/mp4', 'video/webm', 'video/ogg'];

    card.mediaAttachments.forEach(media => {
      let validTypes: string[] = [];
      if (media.type === 'image') validTypes = validImageTypes;
      else if (media.type === 'audio') validTypes = validAudioTypes;
      else if (media.type === 'video') validTypes = validVideoTypes;

      if (!validTypes.includes(media.mimeType)) {
        errors.push({
          field: 'mediaAttachments',
          message: `Invalid ${media.type} format: ${media.mimeType}`,
        });
      }
    });
  }

  // Spaced repetition fields validation
  if (card.easeFactor !== undefined && (card.easeFactor < 1.3 || card.easeFactor > 5.0)) {
    errors.push({
      field: 'easeFactor',
      message: 'Ease factor must be between 1.3 and 5.0',
    });
  }

  if (card.interval !== undefined && card.interval < 0) {
    errors.push({
      field: 'interval',
      message: 'Interval cannot be negative',
    });
  }

  if (card.repetitionCount !== undefined && card.repetitionCount < 0) {
    errors.push({
      field: 'repetitionCount',
      message: 'Repetition count cannot be negative',
    });
  }

  return errors;
}

/**
 * Check if card is valid (no validation errors)
 */
export function isCardValid(card: Partial<Card>): boolean {
  return validateCard(card).length === 0;
}

/**
 * Sanitize card input (trim whitespace, normalize data)
 */
export function sanitizeCard(card: Partial<Card>): Partial<Card> {
  return {
    ...card,
    question: card.question?.trim(),
    answer: card.answer?.trim(),
    notes: card.notes?.trim() || undefined,
    tags: card.tags?.map(tag => tag.trim()).filter(Boolean) || [],
  };
}

/**
 * Create default card with required fields
 */
export function createDefaultCard(question: string, answer: string): Omit<Card, 'id' | 'createdAt' | 'updatedAt'> {
  return {
    question: question.trim(),
    answer: answer.trim(),
    notes: undefined,
    categoryId: undefined,
    tags: [],
    easeFactor: 2.5,
    interval: 0,
    repetitionCount: 0,
    lastReviewedAt: undefined,
    nextReviewAt: undefined,
    correctCount: 0,
    incorrectCount: 0,
    averageResponseTime: undefined,
    mediaAttachments: [],
  };
}

/**
 * Check if card needs review based on spaced repetition
 */
export function needsReview(card: Card): boolean {
  if (!card.nextReviewAt) return true;
  return new Date(card.nextReviewAt) <= new Date();
}

/**
 * Calculate card difficulty score (0-100, higher = more difficult)
 */
export function calculateDifficulty(card: Card): number {
  const totalReviews = card.correctCount + card.incorrectCount;
  if (totalReviews === 0) return 50; // Neutral difficulty for new cards

  const accuracy = card.correctCount / totalReviews;
  const easeFactor = card.easeFactor || 2.5;

  // Combine accuracy and ease factor
  // Lower ease factor = harder card
  // Lower accuracy = harder card
  const difficultyScore = (1 - accuracy) * 50 + (3.5 - easeFactor) * 25;

  return Math.max(0, Math.min(100, Math.round(difficultyScore)));
}
