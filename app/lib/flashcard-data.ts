/**
 * Flashcard Data Loader
 * 
 * Loads and parses flashcard data from the static JSON bundle.
 */

import { Flashcard, Category, validateFlashcard } from '@/app/types/flashcard';
import flashcardsData from '@/app/data/flashcards.json';

/**
 * Get all flashcards from the JSON data
 * 
 * @returns Array of validated flashcards
 * @throws Error if flashcard data is invalid
 */
export function getFlashcards(): Flashcard[] {
  try {
    const cards = flashcardsData.flashcards;
    
    if (!Array.isArray(cards)) {
      throw new Error('Flashcards data must be an array');
    }

    // Validate each flashcard
    const validatedCards = cards.filter((card) => {
      const isValid = validateFlashcard(card);
      if (!isValid) {
        console.warn('Invalid flashcard skipped:', card);
      }
      return isValid;
    }) as Flashcard[];

    if (validatedCards.length === 0) {
      throw new Error('No valid flashcards found in data');
    }

    return validatedCards;
  } catch (error) {
    console.error('Error loading flashcards:', error);
    throw new Error('Failed to load flashcard data');
  }
}

/**
 * Get all categories from the JSON data
 * 
 * @returns Array of categories
 */
export function getCategories(): Category[] {
  try {
    const categories = flashcardsData.categories;
    
    if (!Array.isArray(categories)) {
      console.warn('Categories data is not an array, returning empty array');
      return [];
    }

    // Validate basic structure
    return categories.filter((cat) => {
      const isValid = cat && typeof cat.id === 'string' && typeof cat.name === 'string';
      if (!isValid) {
        console.warn('Invalid category skipped:', cat);
      }
      return isValid;
    }) as Category[];
  } catch (error) {
    console.error('Error loading categories:', error);
    return [];
  }
}

/**
 * Get a single flashcard by ID
 * 
 * @param id - Flashcard ID
 * @returns Flashcard or null if not found
 */
export function getFlashcardById(id: string): Flashcard | null {
  const cards = getFlashcards();
  return cards.find((card) => card.id === id) || null;
}

/**
 * Get flashcards by category ID
 * 
 * @param categoryId - Category ID to filter by
 * @returns Array of flashcards in that category
 */
export function getFlashcardsByCategory(categoryId: string): Flashcard[] {
  const cards = getFlashcards();
  return cards.filter((card) => card.categories.includes(categoryId));
}
