/**
 * TypeScript Type Definitions for Card Learning Feature
 * 
 * Contains all interfaces and types for flashcards, categories,
 * user progress, and learning sessions.
 */

// Difficulty levels for flashcards
export type DifficultyLevel = 1 | 2 | 3 | 4 | 5;

// Sort methods for card organization
export type SortMethod = 'random' | 'alphabetical' | 'difficulty' | 'leastPracticed';

/**
 * Flashcard entity representing a single vocabulary item
 */
export interface Flashcard {
  id: string;                    // Unique identifier (e.g., "card-001")
  question: string;              // Front of card - word/phrase to translate
  answer: string;                // Back of card - correct translation/definition
  categories: string[];          // Category IDs this card belongs to (e.g., ["verbs", "idioms"])
  difficulty: DifficultyLevel;   // 1 (easy) to 5 (hard)
  notes?: string;                // Optional contextual information or usage examples
}

/**
 * Category/Tag for organizing flashcards
 */
export interface Category {
  id: string;                    // Unique identifier (e.g., "verbs")
  name: string;                  // Display name (e.g., "Verbs")
  color: string;                 // Tailwind color class or hex (e.g., "blue-500" or "#3B82F6")
  description?: string;          // Optional category description
}

/**
 * Statistics for a single flashcard's user interaction
 */
export interface CardStats {
  cardId: string;                // References Flashcard.id
  timesShown: number;            // Total number of times card was displayed
  timesCorrect: number;          // Number of correct answers
  timesIncorrect: number;        // Number of incorrect answers
  lastSeen?: Date;               // ISO timestamp of last interaction
  averageResponseTime?: number;  // Average time to answer in milliseconds
}

/**
 * User progress data persisted in localStorage
 * 
 * Stored at key: "daydaylearn:progress"
 * Schema version: 1.0
 */
export interface UserProgress {
  version: string;               // Schema version (e.g., "1.0")
  currentCardIndex: number;      // Index of current card in filteredCards array
  filters: string[];             // Active category IDs (e.g., ["verbs", "idioms"])
  sortMethod: SortMethod;        // Current sort order
  cardStats: CardStats[];        // Array of per-card statistics
  lastUpdated: string;           // ISO timestamp of last save
}

/**
 * Derived state for current learning session (not persisted)
 * 
 * Computed from UserProgress + loaded flashcards
 */
export interface LearningSession {
  allCards: Flashcard[];         // All available flashcards
  filteredCards: Flashcard[];    // Cards after applying filters/sort
  currentCard: Flashcard | null; // Current card being displayed
  currentIndex: number;          // Index in filteredCards
  totalCards: number;            // Total count of filteredCards
  isSessionComplete: boolean;    // True when currentIndex >= totalCards
}

/**
 * Session progress metrics for display
 */
export interface SessionProgress {
  cardsCompleted: number;        // Cards answered in this session
  correctAnswers: number;        // Correct answers in this session
  incorrectAnswers: number;      // Incorrect answers in this session
  accuracy: number;              // Percentage (0-100)
  timeElapsed: number;           // Milliseconds since session start
}

/**
 * Validation result for answer submission
 */
export interface AnswerValidation {
  isCorrect: boolean;            // True if answer matches
  userAnswer: string;            // Normalized user input
  correctAnswer: string;         // Expected answer
  feedback?: string;             // Optional feedback message
}

/**
 * Default UserProgress object for new users
 */
export const DEFAULT_USER_PROGRESS: UserProgress = {
  version: '1.0',
  currentCardIndex: 0,
  filters: [],
  sortMethod: 'random',
  cardStats: [],
  lastUpdated: new Date().toISOString(),
};

/**
 * Validation function for Flashcard objects
 */
export function validateFlashcard(card: unknown): card is Flashcard {
  if (typeof card !== 'object' || card === null) return false;
  const c = card as Partial<Flashcard>;
  
  return (
    typeof c.id === 'string' && c.id.length > 0 &&
    typeof c.question === 'string' && c.question.length > 0 &&
    typeof c.answer === 'string' && c.answer.length > 0 &&
    Array.isArray(c.categories) &&
    c.categories.every((cat) => typeof cat === 'string') &&
    typeof c.difficulty === 'number' &&
    c.difficulty >= 1 &&
    c.difficulty <= 5
  );
}

/**
 * Validation function for UserProgress objects
 */
export function validateUserProgress(progress: unknown): progress is UserProgress {
  if (typeof progress !== 'object' || progress === null) return false;
  const p = progress as Partial<UserProgress>;
  
  return (
    typeof p.version === 'string' &&
    typeof p.currentCardIndex === 'number' &&
    p.currentCardIndex >= 0 &&
    Array.isArray(p.filters) &&
    p.filters.every((f) => typeof f === 'string') &&
    typeof p.sortMethod === 'string' &&
    ['random', 'alphabetical', 'difficulty', 'leastPracticed'].includes(p.sortMethod) &&
    Array.isArray(p.cardStats)
  );
}
