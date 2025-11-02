# Component Contracts: Card-Based English Learning Interface

**Feature**: 001-card-learning-ui  
**Date**: November 1, 2025  
**Type**: Client-Side Component Interfaces

## Overview

This document defines the public interfaces (props, events, and state) for all React components in the flashcard learning application. Since this is a client-side-only application with no backend API, "contracts" refer to component interfaces rather than HTTP endpoints.

---

## Component Interface Contracts

### 1. FlashCard Component

**Purpose**: Displays the main flashcard with flip animation, handles answer reveal logic.

**Props Interface**:
```typescript
interface FlashCardProps {
  card: Flashcard;                    // Current flashcard to display
  isFlipped: boolean;                 // Whether card shows answer side
  isCorrect: boolean | null;          // null = not yet answered, true/false = validation result
  userAnswer: string;                 // User's typed answer (shown on answer side)
  onFlip: () => void;                 // Callback when card should flip (after submit)
}
```

**State**: None (fully controlled component)

**Events Emitted**:
- `onFlip()`: Triggered after answer submission to flip card

**Rendering Contract**:
- **Question Side** (when `!isFlipped`):
  - Display `card.question` centered in large text
  - Show subtle category badges at bottom
  - No answer or feedback visible
- **Answer Side** (when `isFlipped`):
  - Display `card.answer` centered
  - Show user's answer with validation icon (✅ or ❌) based on `isCorrect`
  - Display `card.notes` if present (smaller text, bottom)

**CSS Classes** (Tailwind):
```typescript
const cardClasses = cn(
  "relative w-full h-full rounded-2xl shadow-2xl",
  "transition-transform duration-600 transform-style-preserve-3d",
  isFlipped && "rotate-y-180"
);

const faceClasses = "absolute inset-0 backface-hidden flex items-center justify-center p-8";
const backFaceClasses = cn(faceClasses, "rotate-y-180");
```

**Validation Rules**:
- MUST render within parent container constraints (no overflow)
- MUST complete flip animation in 600ms (per research.md)
- MUST hide back face with `backface-visibility: hidden`

---

### 2. ControlPanel Component

**Purpose**: Bottom input panel for typing and submitting answers, fixed at 10vh height.

**Props Interface**:
```typescript
interface ControlPanelProps {
  userAnswer: string;                 // Current input value
  isAnswerRevealed: boolean;          // Whether answer is currently shown
  isSubmitting: boolean;              // Loading state during validation
  onAnswerChange: (answer: string) => void;  // Callback for input changes
  onSubmit: () => void;               // Callback when user submits answer
  onNext: () => void;                 // Callback to advance to next card
  errorMessage: string | null;        // Validation error (e.g., "Please enter an answer")
}
```

**State**: None (fully controlled component)

**Events Emitted**:
- `onAnswerChange(answer)`: Fired on every keystroke in input field
- `onSubmit()`: Fired when user presses Enter or clicks Submit button
- `onNext()`: Fired when user clicks "Next Card" button (only visible after answer revealed)

**Rendering Contract**:
- **Before Submit** (`!isAnswerRevealed`):
  - Show input field (text, placeholder: "Type your answer here...")
  - Show "Submit Answer" button (primary style)
  - Disable submit button if `userAnswer` is empty
  - Show `errorMessage` below input if present (red text)
- **After Submit** (`isAnswerRevealed`):
  - Hide input field
  - Show "Next Card" button (primary style)
  - Optionally show "Show Answer" toggle (future enhancement)

**Keyboard Shortcuts**:
- `Enter`: Trigger `onSubmit()` if input has focus and not revealed
- `Escape`: Clear input (handled internally, emit `onAnswerChange('')`)

**CSS Classes** (Tailwind):
```typescript
const panelClasses = "h-[10vh] bg-white border-t border-gray-200 flex items-center justify-center px-6";
const inputClasses = "w-full max-w-2xl px-4 py-3 text-lg border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500";
const buttonClasses = "px-8 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed";
```

**Validation Rules**:
- MUST NOT allow submit when `userAnswer.trim() === ''`
- MUST emit `onAnswerChange` with trimmed value
- Input field MUST have `maxLength={500}` (per data model)

---

### 3. ProgressBar Component

**Purpose**: Compact progress indicator showing current position in card deck.

**Props Interface**:
```typescript
interface ProgressBarProps {
  currentIndex: number;               // 0-based index in deck
  totalCards: number;                 // Total cards in filtered deck
  percentComplete: number;            // Computed progress (0-100)
}
```

**State**: None (fully controlled component)

**Events Emitted**: None

**Rendering Contract**:
- Display as horizontal bar with filled portion indicating progress
- Show text overlay: "Card {currentIndex + 1} of {totalCards}"
- Progress bar should be ~24px tall (h-6)
- Use gradient or solid fill for visual appeal

**CSS Classes** (Tailwind):
```typescript
const containerClasses = "h-6 bg-gray-200 relative overflow-hidden";
const fillClasses = "absolute inset-y-0 left-0 bg-blue-600 transition-all duration-300";
const textClasses = "absolute inset-0 flex items-center justify-center text-sm font-medium text-gray-700";
```

**Validation Rules**:
- `percentComplete` MUST be clamped to [0, 100]
- Fill width MUST animate smoothly (300ms transition)

---

### 4. FilterStrip Component

**Purpose**: Top control strip for category selection, filtering, and sorting.

**Props Interface**:
```typescript
interface FilterStripProps {
  categories: Category[];             // All available categories
  activeFilters: string[];            // Currently selected category IDs
  sortMethod: SortMethod;             // Current sort method
  onFilterToggle: (categoryId: string) => void;  // Toggle category filter
  onSortChange: (method: SortMethod) => void;    // Change sort method
  onClearFilters: () => void;         // Clear all filters
}
```

**State**: Internal (dropdown open/closed states)

**Events Emitted**:
- `onFilterToggle(categoryId)`: Fired when user clicks category badge
- `onSortChange(method)`: Fired when user selects sort dropdown option
- `onClearFilters()`: Fired when user clicks "Clear All" button

**Rendering Contract**:
- Display category badges horizontally (flex wrap on mobile)
- Active categories have filled background (using `category.color`)
- Inactive categories have outline style
- Sort dropdown shows current method, opens on click
- "Clear All" button visible only when `activeFilters.length > 0`

**CSS Classes** (Tailwind):
```typescript
const stripClasses = "h-14 bg-gray-50 border-b border-gray-200 flex items-center gap-2 px-4 overflow-x-auto";
const categoryBadgeClasses = (active: boolean, color: string) => cn(
  "px-3 py-1 rounded-full text-sm font-medium cursor-pointer transition-all",
  active ? `bg-[${color}] text-white` : `border border-gray-300 text-gray-700 hover:bg-gray-100`
);
const sortDropdownClasses = "px-3 py-2 border border-gray-300 rounded-lg bg-white text-sm";
```

**Validation Rules**:
- Category badges MUST use `category.color` for active state
- Dropdown MUST show all `SortMethod` options
- MUST handle horizontal scrolling gracefully on mobile

---

### 5. PreviewChip Component

**Purpose**: Small overlay showing abbreviated content of adjacent cards (prev/next).

**Props Interface**:
```typescript
interface PreviewChipProps {
  card: Flashcard | null;             // Adjacent card (null if first/last)
  position: 'left' | 'right';         // Which corner to position
  onClick: () => void;                // Navigate to this card when clicked
}
```

**State**: Internal (hover state for expansion animation)

**Events Emitted**:
- `onClick()`: Fired when user clicks chip to navigate

**Rendering Contract**:
- Display in top-left (`position='left'`) or top-right (`position='right'`) corner
- Show truncated `card.question` (max 30 chars) + first 20 chars of `card.answer`
- If `card === null`, render nothing (or greyed-out disabled state)
- Expand slightly on hover (scale transform)
- Hidden on mobile/tablet (`hidden lg:block`)

**CSS Classes** (Tailwind):
```typescript
const chipClasses = (position: 'left' | 'right') => cn(
  "absolute top-4 w-48 bg-white/90 backdrop-blur rounded-lg shadow-lg p-3 cursor-pointer",
  "transition-transform hover:scale-105 hidden lg:block",
  position === 'left' ? 'left-4' : 'right-4'
);
const questionClasses = "text-sm font-medium text-gray-900 truncate";
const answerClasses = "text-xs text-gray-600 truncate mt-1";
```

**Validation Rules**:
- Text truncation MUST use CSS `truncate` (single line ellipsis)
- MUST NOT render if `card === null`
- Hover scale MUST animate smoothly (150ms)

---

### 6. SessionComplete Component (Optional)

**Purpose**: Full-screen overlay shown when user completes all cards (100% progress).

**Props Interface**:
```typescript
interface SessionCompleteProps {
  totalCards: number;                 // Number of cards completed
  correctAnswers: number;             // How many were answered correctly
  timeElapsed: number;                // Session duration in seconds
  onRestart: () => void;              // Callback to restart with shuffled deck
}
```

**State**: None

**Events Emitted**:
- `onRestart()`: Fired when user clicks "Start New Session" button

**Rendering Contract**:
- Full-screen overlay with semi-transparent backdrop
- Display session stats (total cards, accuracy %, time)
- Show "Start New Session" button (triggers auto-restart per spec)
- Optional: Show confetti animation or celebration graphic

**CSS Classes** (Tailwind):
```typescript
const overlayClasses = "fixed inset-0 bg-black/50 flex items-center justify-center z-50";
const cardClasses = "bg-white rounded-2xl p-8 max-w-md text-center shadow-2xl";
const statClasses = "text-4xl font-bold text-blue-600 mb-2";
```

**Validation Rules**:
- MUST cover entire viewport (fixed positioning)
- Stats MUST be accurate (derived from `UserProgress.cardStats`)

---

## Utility Function Contracts

### loadFlashcards()
```typescript
function loadFlashcards(): { cards: Flashcard[]; categories: Category[] }
```
**Input**: None  
**Output**: Parsed flashcard data from `flashcards.json`  
**Side Effects**: Reads from bundled JSON file  
**Error Handling**: Returns empty arrays if parsing fails

---

### loadProgress()
```typescript
function loadProgress(): UserProgress
```
**Input**: None  
**Output**: User progress from localStorage or default state  
**Side Effects**: Reads from `localStorage.getItem('daydaylearn:progress')`  
**Error Handling**: Returns `defaultUserProgress` if missing or invalid JSON

---

### saveProgress(progress: UserProgress)
```typescript
function saveProgress(progress: UserProgress): void
```
**Input**: UserProgress object  
**Output**: None  
**Side Effects**: Writes to `localStorage.setItem('daydaylearn:progress', JSON.stringify(progress))`  
**Error Handling**: Logs error to console if QuotaExceededError, silently fails

---

### matchAnswer(userInput: string, correctAnswer: string)
```typescript
function matchAnswer(userInput: string, correctAnswer: string): boolean
```
**Input**: User's typed answer, correct answer from card  
**Output**: Boolean (true if match, false otherwise)  
**Logic**: Case-insensitive exact match with whitespace normalization  
**Example**: `matchAnswer(" Hello ", "hello")` → `true`

---

### shuffleCards(cards: Flashcard[])
```typescript
function shuffleCards(cards: Flashcard[]): Flashcard[]
```
**Input**: Array of flashcards  
**Output**: New array with cards in random order (Fisher-Yates shuffle)  
**Side Effects**: None (pure function, does not mutate input)

---

### sortCards(cards: Flashcard[], method: SortMethod)
```typescript
function sortCards(cards: Flashcard[], method: SortMethod): Flashcard[]
```
**Input**: Array of flashcards, sort method  
**Output**: New array sorted by specified method  
**Methods**:
- `"random"`: Fisher-Yates shuffle
- `"alphabetical"`: Sort by `card.question` (locale-aware)
- `"difficulty"`: Sort by `card.difficulty` (ascending: easy → hard)
- `"least-practiced"`: Sort by `cardStats.timesShown` (ascending)

---

### filterCards(cards: Flashcard[], categoryIds: string[])
```typescript
function filterCards(cards: Flashcard[], categoryIds: string[]): Flashcard[]
```
**Input**: Array of flashcards, array of category IDs  
**Output**: Flashcards matching ANY of the specified categories (OR logic)  
**Special Case**: If `categoryIds` is empty, return all cards (no filter)

---

## State Management Contract

### Main Page Component State
```typescript
interface LearningPageState {
  // Loaded Data (immutable after load)
  allCards: Flashcard[];
  categories: Category[];
  
  // User Progress (synced with localStorage)
  currentCardIndex: number;
  activeFilters: string[];
  sortMethod: SortMethod;
  
  // UI State (ephemeral)
  userAnswer: string;
  isFlipped: boolean;
  isCorrect: boolean | null;
  errorMessage: string | null;
  
  // Derived State (computed)
  filteredCards: Flashcard[];  // = filterCards(sortCards(allCards, sortMethod), activeFilters)
  currentCard: Flashcard;      // = filteredCards[currentCardIndex]
  progress: SessionProgress;   // = compute from currentCardIndex and filteredCards.length
}
```

**State Update Contracts**:
- On mount: Load `allCards`, `categories`, and `UserProgress` from storage
- On filter change: Recompute `filteredCards`, reset `currentCardIndex` to 0, save progress
- On sort change: Recompute `filteredCards`, reset `currentCardIndex` to 0, save progress
- On navigation: Increment/decrement `currentCardIndex`, flip card back, clear `userAnswer`, save progress
- On submit: Set `isFlipped = true`, `isCorrect = matchAnswer(...)`, update `cardStats`, save progress
- On session complete: Reset to shuffled deck, clear filters, save progress

---

**Phase 1 Contracts Complete**: All component interfaces, utility functions, and state management contracts defined. Ready for implementation and agent context update.
