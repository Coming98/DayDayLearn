/**
 * Card Shuffle, Sort, and Filter Operations
 * 
 * Provides functions for organizing flashcard arrays.
 */

import { Flashcard, SortMethod, CardStats } from '@/app/types/flashcard';

/**
 * Shuffle an array using Fisher-Yates algorithm
 * 
 * Creates a new array with elements in random order.
 * Time complexity: O(n)
 * 
 * @param array - Array to shuffle
 * @returns New shuffled array
 */
export function shuffleCards<T>(array: T[]): T[] {
  const shuffled = [...array];
  
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
  }
  
  return shuffled;
}

/**
 * Sort flashcards by a specific method
 * 
 * @param cards - Array of flashcards to sort
 * @param method - Sort method to apply
 * @param cardStats - Optional card statistics for 'leastPracticed' sort
 * @returns New sorted array
 */
export function sortCards(
  cards: Flashcard[],
  method: SortMethod,
  cardStats?: CardStats[]
): Flashcard[] {
  const sorted = [...cards];

  switch (method) {
    case 'random':
      return shuffleCards(sorted);

    case 'alphabetical':
      return sorted.sort((a, b) => a.question.localeCompare(b.question));

    case 'difficulty':
      return sorted.sort((a, b) => a.difficulty - b.difficulty);

    case 'leastPracticed':
      // Sort by times shown (ascending), cards with no stats come first
      return sorted.sort((a, b) => {
        const statsA = cardStats?.find((s) => s.cardId === a.id);
        const statsB = cardStats?.find((s) => s.cardId === b.id);

        const timesShownA = statsA?.timesShown || 0;
        const timesShownB = statsB?.timesShown || 0;

        return timesShownA - timesShownB;
      });

    default:
      console.warn(`Unknown sort method: ${method}, returning unsorted`);
      return sorted;
  }
}

/**
 * Filter flashcards by category IDs
 * 
 * If no filters provided, returns all cards.
 * If multiple filters provided, returns cards matching ANY filter (OR logic).
 * 
 * @param cards - Array of flashcards to filter
 * @param categoryIds - Array of category IDs to filter by
 * @returns New filtered array
 */
export function filterCards(cards: Flashcard[], categoryIds: string[]): Flashcard[] {
  // No filters = return all cards
  if (!categoryIds || categoryIds.length === 0) {
    return [...cards];
  }

  // Return cards that match at least one category (OR logic)
  return cards.filter((card) => {
    return categoryIds.some((categoryId) => card.categories.includes(categoryId));
  });
}

/**
 * Apply both filter and sort to a card array
 * 
 * Filter is applied first, then sort.
 * 
 * @param cards - Array of flashcards
 * @param categoryIds - Category IDs to filter by
 * @param sortMethod - Sort method to apply
 * @param cardStats - Optional card statistics for sorting
 * @returns New filtered and sorted array
 */
export function filterAndSortCards(
  cards: Flashcard[],
  categoryIds: string[],
  sortMethod: SortMethod,
  cardStats?: CardStats[]
): Flashcard[] {
  const filtered = filterCards(cards, categoryIds);
  return sortCards(filtered, sortMethod, cardStats);
}

/**
 * Get cards by difficulty range
 * 
 * @param cards - Array of flashcards
 * @param minDifficulty - Minimum difficulty (1-5)
 * @param maxDifficulty - Maximum difficulty (1-5)
 * @returns Filtered array
 */
export function filterCardsByDifficulty(
  cards: Flashcard[],
  minDifficulty: number = 1,
  maxDifficulty: number = 5
): Flashcard[] {
  return cards.filter((card) => {
    return card.difficulty >= minDifficulty && card.difficulty <= maxDifficulty;
  });
}
