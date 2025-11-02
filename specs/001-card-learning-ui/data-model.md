# Data Model: Card-Based English Learning Interface

**Feature**: 001-card-learning-ui  
**Date**: November 1, 2025  
**Status**: Complete

## Overview

This document defines the data structures, relationships, validation rules, and state transitions for the flashcard learning application. All types are defined in TypeScript for compile-time safety.

---

## Core Entities

### 1. Flashcard

**Purpose**: Represents a single learning item (vocabulary word, idiom, phrase) with question/answer sides.

**TypeScript Definition**:
```typescript
interface Flashcard {
  id: string;                    // Unique identifier (e.g., "verb-001", "idiom-042")
  question: string;              // Front of card (word, phrase, or definition prompt)
  answer: string;                // Back of card (translation, definition, or example)
  categories: string[];          // Category IDs this card belongs to (e.g., ["verbs", "advanced"])
  difficulty: number;            // 1 (easy) to 5 (hard) - used for sorting
  notes?: string;                // Optional additional context, etymology, usage tips
  createdAt?: string;           // ISO 8601 timestamp (optional, for future analytics)
}
```

**Validation Rules**:
- `id`: MUST be unique within the dataset, non-empty string, alphanumeric + hyphens only
- `question`: MUST be non-empty, max 200 characters
- `answer`: MUST be non-empty, max 500 characters
- `categories`: MUST contain at least one category ID, max 5 categories per card
- `difficulty`: MUST be integer between 1 and 5 (inclusive)
- `notes`: Optional, max 1000 characters

**Relationships**:
- Belongs to one or more `Category` (many-to-many via `categories` array)
- Referenced by `UserProgress.cardStats` via `id`

**State Transitions**: None (immutable data, loaded at startup)

---

### 2. Category

**Purpose**: Groups flashcards by topic/theme for filtering and organization.

**TypeScript Definition**:
```typescript
interface Category {
  id: string;                    // Unique identifier (e.g., "verbs", "idioms")
  name: string;                  // Display name (e.g., "Verbs", "Idioms")
  color: string;                 // Hex color for UI badges (e.g., "#3B82F6")
  description?: string;          // Optional description shown on hover/selection
}
```

**Validation Rules**:
- `id`: MUST be unique, non-empty, lowercase alphanumeric + hyphens
- `name`: MUST be non-empty, max 50 characters
- `color`: MUST be valid hex color (`#[0-9A-Fa-f]{6}`)
- `description`: Optional, max 200 characters

**Relationships**:
- Referenced by `Flashcard.categories` array
- Used in `UserProgress.filters` array

**State Transitions**: None (immutable data, loaded at startup)

---

### 3. UserProgress

**Purpose**: Tracks anonymous user's learning progress, session state, and per-card statistics. Persisted in localStorage.

**TypeScript Definition**:
```typescript
interface UserProgress {
  version: string;               // Schema version for migration (e.g., "1.0")
  currentCardIndex: number;      // Index in filtered/sorted deck (0-based)
  filters: string[];             // Active category IDs (empty = all cards)
  sortMethod: SortMethod;        // Current sort: "random" | "alphabetical" | "difficulty"
  cardStats: Record<string, CardStats>; // Per-card progress keyed by card.id
  sessionStarted: string;        // ISO 8601 timestamp of session start
  lastUpdated: string;           // ISO 8601 timestamp of last progress save
}

interface CardStats {
  timesShown: number;            // How many times user has seen this card
  timesCorrect: number;          // How many times user answered correctly
  lastSeen: string;              // ISO 8601 timestamp of last view
  masteryLevel?: number;         // 0-100 score (future: spaced repetition)
}

type SortMethod = "random" | "alphabetical" | "difficulty" | "least-practiced";
```

**Validation Rules**:
- `version`: MUST match current schema version ("1.0")
- `currentCardIndex`: MUST be non-negative integer, < deck length
- `filters`: Each element MUST be valid category ID from dataset
- `sortMethod`: MUST be one of defined SortMethod values
- `cardStats`: Keys MUST match valid card IDs
- `timesShown`: MUST be non-negative integer, >= `timesCorrect`
- `timesCorrect`: MUST be non-negative integer, <= `timesShown`
- Timestamps: MUST be valid ISO 8601 format

**Relationships**:
- References `Flashcard.id` via `cardStats` keys
- References `Category.id` via `filters` array

**State Transitions**:
```
Initial State (New User):
  currentCardIndex: 0
  filters: []
  sortMethod: "random"
  cardStats: {}
  sessionStarted: <now>
  lastUpdated: <now>

On Card View:
  cardStats[cardId].timesShown += 1
  cardStats[cardId].lastSeen = <now>
  lastUpdated = <now>

On Answer Submit (Correct):
  cardStats[cardId].timesCorrect += 1
  lastUpdated = <now>

On Navigation:
  currentCardIndex = <new index>
  lastUpdated = <now>

On Filter Change:
  filters = <new filters>
  currentCardIndex = 0 (reset to first filtered card)
  lastUpdated = <now>

On Sort Change:
  sortMethod = <new method>
  currentCardIndex = 0 (reset to first in new order)
  lastUpdated = <now>

On Session Complete (100% progress):
  currentCardIndex = 0
  filters = []
  sortMethod = "random"
  cardStats = <preserved, not reset>
  sessionStarted = <now>
  lastUpdated = <now>
```

---

### 4. LearningSession (Derived State)

**Purpose**: Represents the current active learning session derived from `UserProgress` + loaded flashcards. Not persisted, computed on load.

**TypeScript Definition**:
```typescript
interface LearningSession {
  allCards: Flashcard[];          // Full dataset loaded from JSON
  filteredCards: Flashcard[];     // Cards matching active filters
  currentCard: Flashcard;         // Card at currentCardIndex
  previousCard: Flashcard | null; // Card at index - 1 (null if first)
  nextCard: Flashcard | null;     // Card at index + 1 (null if last)
  progress: SessionProgress;      // Computed progress stats
}

interface SessionProgress {
  currentIndex: number;           // 0-based index in filteredCards
  totalCards: number;             // Length of filteredCards
  percentComplete: number;        // (currentIndex / totalCards) * 100
  cardsRemaining: number;         // totalCards - currentIndex
}
```

**Validation Rules**:
- `allCards`: MUST contain all valid flashcards from JSON
- `filteredCards`: MUST be subset of `allCards` matching active filters
- `currentCard`: MUST exist in `filteredCards` at `currentIndex`
- `progress.percentComplete`: MUST be between 0 and 100

**Relationships**:
- Derived from `Flashcard[]` (loaded data) + `UserProgress` (localStorage)

**State Transitions**: Recomputed on every filter/sort/navigation action (ephemeral state).

---

## Data Flow Diagram

```
┌─────────────────────┐
│  flashcards.json    │ (Static Bundle)
│  - cards[]          │
│  - categories[]     │
└──────────┬──────────┘
           │ Load on startup
           ↓
┌─────────────────────┐
│  Flashcard[]        │ (In-Memory)
│  Category[]         │
└──────────┬──────────┘
           │
           ├──→ Filter by categories ──→ filteredCards[]
           │
           ├──→ Sort by method ────────→ sortedCards[]
           │
           └──→ Select current index ──→ currentCard
                                          │
                                          ↓
                              ┌──────────────────────┐
                              │  User Interaction    │
                              │  - View question     │
                              │  - Type answer       │
                              │  - Submit            │
                              │  - Navigate          │
                              └──────────┬───────────┘
                                         │
                                         ↓
                              ┌──────────────────────┐
                              │  UserProgress        │ (localStorage)
                              │  - currentCardIndex  │
                              │  - filters           │
                              │  - sortMethod        │
                              │  - cardStats         │
                              └──────────────────────┘
                                         │
                                         ↓
                              Save on state change
```

---

## Validation Functions

### Flashcard Validation
```typescript
function validateFlashcard(card: any): card is Flashcard {
  return (
    typeof card.id === 'string' && card.id.length > 0 &&
    typeof card.question === 'string' && card.question.length > 0 && card.question.length <= 200 &&
    typeof card.answer === 'string' && card.answer.length > 0 && card.answer.length <= 500 &&
    Array.isArray(card.categories) && card.categories.length > 0 && card.categories.length <= 5 &&
    typeof card.difficulty === 'number' && card.difficulty >= 1 && card.difficulty <= 5 &&
    (!card.notes || (typeof card.notes === 'string' && card.notes.length <= 1000))
  );
}
```

### UserProgress Validation
```typescript
function validateUserProgress(progress: any): progress is UserProgress {
  return (
    progress.version === '1.0' &&
    typeof progress.currentCardIndex === 'number' && progress.currentCardIndex >= 0 &&
    Array.isArray(progress.filters) &&
    ['random', 'alphabetical', 'difficulty', 'least-practiced'].includes(progress.sortMethod) &&
    typeof progress.cardStats === 'object' &&
    typeof progress.sessionStarted === 'string' &&
    typeof progress.lastUpdated === 'string'
  );
}
```

---

## Default Data

### Initial UserProgress (New User)
```typescript
const defaultUserProgress: UserProgress = {
  version: '1.0',
  currentCardIndex: 0,
  filters: [],
  sortMethod: 'random',
  cardStats: {},
  sessionStarted: new Date().toISOString(),
  lastUpdated: new Date().toISOString(),
};
```

### Sample Flashcard Data
```json
{
  "version": "1.0",
  "cards": [
    {
      "id": "adj-001",
      "question": "Serendipity",
      "answer": "Finding something good without looking for it",
      "categories": ["adjectives", "advanced"],
      "difficulty": 3,
      "notes": "From Persian fairy tale 'The Three Princes of Serendip'"
    },
    {
      "id": "verb-001",
      "question": "Ephemeral",
      "answer": "Lasting for a very short time",
      "categories": ["adjectives", "intermediate"],
      "difficulty": 2
    },
    {
      "id": "idiom-001",
      "question": "Break the ice",
      "answer": "To make people feel more comfortable in a social setting",
      "categories": ["idioms", "beginner"],
      "difficulty": 1,
      "notes": "Often used in networking or first meetings"
    }
  ],
  "categories": [
    { "id": "verbs", "name": "Verbs", "color": "#3B82F6" },
    { "id": "idioms", "name": "Idioms", "color": "#10B981" },
    { "id": "adjectives", "name": "Adjectives", "color": "#F59E0B" },
    { "id": "beginner", "name": "Beginner", "color": "#6366F1" },
    { "id": "intermediate", "name": "Intermediate", "color": "#8B5CF6" },
    { "id": "advanced", "name": "Advanced", "color": "#EC4899" }
  ]
}
```

---

## Storage Schema (localStorage)

**Key**: `daydaylearn:progress`  
**Value**: JSON-serialized `UserProgress` object

**Size Estimate**: ~50 bytes per card stat × 100 cards = ~5KB (well under 5MB quota)

**Migration Strategy** (future):
```typescript
function migrateProgress(stored: any): UserProgress {
  if (stored.version === '1.0') {
    return stored as UserProgress;
  }
  // Future: Handle version upgrades
  // if (stored.version === '0.9') { ... }
  return defaultUserProgress; // Fallback to default if unknown version
}
```

---

## Type Exports

All types defined in `app/types/flashcard.ts`:
```typescript
export type { Flashcard, Category, UserProgress, CardStats, SortMethod, LearningSession, SessionProgress };
export { defaultUserProgress, validateFlashcard, validateUserProgress };
```

---

**Phase 1 Data Model Complete**: All entities, relationships, validations, and state transitions defined. Ready for contract generation and implementation.
