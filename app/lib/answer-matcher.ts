/**
 * Answer Matching Logic
 * 
 * Validates user answers against correct answers with normalization.
 */

import { AnswerValidation } from '@/app/types/flashcard';

/**
 * Normalize a string for comparison
 * - Converts to lowercase
 * - Trims whitespace
 * - Normalizes multiple spaces to single space
 * - Removes leading/trailing punctuation
 * 
 * @param text - Text to normalize
 * @returns Normalized text
 */
function normalizeText(text: string): string {
  return text
    .toLowerCase()
    .trim()
    .replace(/\s+/g, ' ')  // Multiple spaces to single space
    .replace(/^[^\w\s]+|[^\w\s]+$/g, '');  // Remove leading/trailing punctuation
}

/**
 * Match user answer against correct answer
 * 
 * Uses case-insensitive exact match with whitespace normalization.
 * 
 * @param userAnswer - User's submitted answer
 * @param correctAnswer - Expected correct answer
 * @returns AnswerValidation object with match result
 */
export function matchAnswer(userAnswer: string, correctAnswer: string): AnswerValidation {
  // Normalize both answers
  const normalizedUser = normalizeText(userAnswer);
  const normalizedCorrect = normalizeText(correctAnswer);

  // Check for exact match after normalization
  const isCorrect = normalizedUser === normalizedCorrect;

  return {
    isCorrect,
    userAnswer: normalizedUser,
    correctAnswer: normalizedCorrect,
    feedback: isCorrect 
      ? 'Correct!' 
      : `Incorrect. The correct answer is: ${correctAnswer}`,
  };
}

/**
 * Check if an answer is empty (after normalization)
 * 
 * @param answer - Answer to check
 * @returns true if empty, false otherwise
 */
export function isEmptyAnswer(answer: string): boolean {
  return normalizeText(answer).length === 0;
}

/**
 * Get hint from correct answer (first 2 characters)
 * 
 * @param correctAnswer - Correct answer
 * @returns Hint string
 */
export function getHint(correctAnswer: string): string {
  const normalized = normalizeText(correctAnswer);
  if (normalized.length < 2) return normalized;
  
  return `${normalized.substring(0, 2)}...`;
}
