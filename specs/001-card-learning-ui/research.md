# Research: Card-Based English Learning Interface

**Feature**: 001-card-learning-ui  
**Date**: November 1, 2025  
**Status**: Complete

## Overview

This document consolidates research findings for implementing a full-screen flashcard learning interface with Next.js App Router, React 19, and Tailwind CSS 4.x. All technical decisions prioritize simplicity, minimal dependencies, and adherence to the DayDayLearn constitution.

---

## 1. CSS Card Flip Animation

### Decision
Use CSS 3D transforms with `transform-style: preserve-3d` and `rotateY()` for card flip animation.

### Rationale
- **Native CSS**: No JavaScript animation libraries needed (aligns with Minimal Dependencies principle)
- **Performance**: GPU-accelerated transforms provide smooth 60fps animations
- **Simplicity**: Pure CSS solution with ~20 lines of code vs. animation library overhead
- **Browser Support**: Excellent support across all modern browsers (98%+ CanIUse coverage)

### Implementation Pattern
```css
.card-container {
  perspective: 1000px;
}

.card {
  position: relative;
  width: 100%;
  height: 100%;
  transition: transform 0.6s;
  transform-style: preserve-3d;
}

.card.flipped {
  transform: rotateY(180deg);
}

.card-face {
  position: absolute;
  width: 100%;
  height: 100%;
  backface-visibility: hidden;
}

.card-back {
  transform: rotateY(180deg);
}
```

### Alternatives Considered
- **Framer Motion**: Rejected due to dependency overhead (148KB minified) for single animation use case
- **React Spring**: Rejected for similar reasons (81KB minified)
- **GSAP**: Rejected (commercial licensing complexity, 50KB+ bundle)

**Tailwind CSS 4.x Integration**: Use `@apply` for card styles and custom `data-*` attributes for state management (`data-flipped="true"`).

---

## 2. Full-Viewport Layout Strategy

### Decision
Use Tailwind's height utilities with flexbox for fixed-position layout segments: `h-screen` (100vh) parent, `flex-none` for fixed strips, `flex-1` for card area.

### Rationale
- **No Scroll Required**: `overflow-hidden` on root prevents accidental scrolling
- **Responsive**: vh units adapt to mobile browser chrome/toolbar dynamics
- **Tailwind Native**: No custom CSS needed, uses built-in utilities
- **Mobile-Safe**: `h-screen` handles iOS Safari's dynamic viewport better than `100vh`

### Layout Structure
```tsx
<div className="h-screen w-screen overflow-hidden flex flex-col">
  {/* Top Strip: ~60px fixed */}
  <div className="flex-none h-14">
    <FilterStrip />
  </div>
  
  {/* Card Viewport: Flexible (remaining space) */}
  <div className="flex-1 relative">
    <FlashCard />
    <PreviewChip position="left" />
    <PreviewChip position="right" />
  </div>
  
  {/* Progress Bar: ~24px fixed */}
  <div className="flex-none h-6">
    <ProgressBar />
  </div>
  
  {/* Control Panel: 10% viewport */}
  <div className="flex-none h-[10vh]">
    <ControlPanel />
  </div>
</div>
```

### Alternatives Considered
- **CSS Grid**: Rejected for added complexity; flexbox sufficient for single-column layout
- **Fixed Positioning**: Rejected due to z-index management complexity and keyboard interactions
- **Absolute Positioning**: Rejected for responsive height calculation difficulties

---

## 3. localStorage Persistence Strategy

### Decision
Store user progress in a single localStorage key `daydaylearn:progress` as JSON object with structure:
```json
{
  "currentCardIndex": 15,
  "filters": ["Verbs"],
  "sortMethod": "random",
  "cardStats": {
    "card-id-1": { "timesShown": 3, "timesCorrect": 2, "lastSeen": "2025-11-01T10:30:00Z" }
  },
  "sessionStarted": "2025-11-01T09:00:00Z"
}
```

### Rationale
- **Single Key**: Atomic read/write operations reduce localStorage quota fragmentation
- **Versioning**: Top-level `version` field enables future schema migrations
- **Performance**: JSON.parse/stringify fast enough for <10KB objects (~100 cards max)
- **Namespacing**: `daydaylearn:` prefix prevents conflicts with other apps on same domain

### Implementation Utilities (`lib/storage.ts`)
- `loadProgress()`: Read + parse with fallback to default state
- `saveProgress(state)`: Stringify + write with error handling
- `clearProgress()`: Reset on session completion or manual clear
- `migrateProgress(oldVersion)`: Handle schema changes (future-proof)

### Alternatives Considered
- **IndexedDB**: Rejected as overkill for simple key-value storage (adds ~10KB wrapper library)
- **sessionStorage**: Rejected because cross-session persistence required (per spec clarification)
- **Multiple Keys**: Rejected due to localStorage 5MB quota concerns and atomic update complexity

---

## 4. Answer Matching Algorithm

### Decision
Case-insensitive exact match with optional whitespace normalization:
```typescript
function matchAnswer(userInput: string, correctAnswer: string): boolean {
  const normalize = (s: string) => s.trim().toLowerCase();
  return normalize(userInput) === normalize(correctAnswer);
}
```

### Rationale
- **Simplicity**: Single-line implementation, no dependencies
- **Predictability**: Users understand exact match requirement (no "fuzzy" surprises)
- **Performance**: O(n) string comparison, negligible overhead
- **Spec Alignment**: Per assumptions section: "simple string matching (exact match or case-insensitive)"

### Edge Cases Handled
- Leading/trailing whitespace: Stripped via `trim()`
- Case variations: Normalized via `toLowerCase()`
- Multiple spaces: NOT normalized (user must match spacing)

### Alternatives Considered
- **Levenshtein Distance**: Rejected due to complexity for minimal UX value (spec clarification: binary feedback only)
- **Fuzzy Match (Fuse.js)**: Rejected as 19KB dependency for single function
- **Regex Patterns**: Rejected due to security risks (ReDoS) and user confusion

**Future Extension Point**: If partial credit needed, add optional `matchPartial()` function (deferred per spec).

---

## 5. JSON Flashcard Data Structure

### Decision
Static JSON file at `app/data/flashcards.json` with schema:
```json
{
  "version": "1.0",
  "cards": [
    {
      "id": "verb-001",
      "question": "Serendipity",
      "answer": "Finding something good without looking for it",
      "categories": ["Adjectives", "Advanced"],
      "difficulty": 3,
      "notes": "From Persian fairy tale 'The Three Princes of Serendip'"
    }
  ],
  "categories": [
    { "id": "verbs", "name": "Verbs", "color": "#3B82F6" },
    { "id": "idioms", "name": "Idioms", "color": "#10B981" }
  ]
}
```

### Rationale
- **Type Safety**: JSON structure mirrors TypeScript types in `types/flashcard.ts`
- **Bundling**: Next.js automatically includes in build (no runtime fetch needed)
- **Extensibility**: `notes` field supports future features (hints, pronunciation, etc.)
- **Metadata**: `difficulty` enables future sorting/filtering enhancements

### Loading Strategy (`lib/flashcard-data.ts`)
```typescript
import flashcardsData from '@/app/data/flashcards.json';

export function getFlashcards(): Flashcard[] {
  return flashcardsData.cards;
}

export function getCategories(): Category[] {
  return flashcardsData.categories;
}
```

### Alternatives Considered
- **External API**: Rejected (adds network dependency, contradicts "client-side only" scope)
- **Hardcoded in TypeScript**: Rejected (loses hot-reload, harder for content updates)
- **CSV/YAML**: Rejected (requires parsing library, JSON native to JavaScript)

---

## 6. Shuffle and Sort Algorithms

### Decision
Use Fisher-Yates shuffle for randomization, native `Array.sort()` for alphabetical/difficulty sorting.

### Rationale
- **Fisher-Yates**: Optimal O(n) shuffle, unbiased distribution, no dependencies
- **Native Sort**: JavaScript `sort()` with custom comparator sufficient for ~100 cards
- **Simplicity**: ~15 lines total code vs. lodash shuffle (24KB dependency)

### Implementation (`lib/card-shuffle.ts`)
```typescript
export function shuffleCards(cards: Flashcard[]): Flashcard[] {
  const shuffled = [...cards]; // Clone to avoid mutation
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
  }
  return shuffled;
}

export function sortCards(cards: Flashcard[], method: SortMethod): Flashcard[] {
  const sorted = [...cards];
  switch (method) {
    case 'alphabetical':
      return sorted.sort((a, b) => a.question.localeCompare(b.question));
    case 'difficulty':
      return sorted.sort((a, b) => a.difficulty - b.difficulty);
    case 'random':
      return shuffleCards(sorted);
    default:
      return sorted;
  }
}
```

### Alternatives Considered
- **Lodash shuffle**: Rejected (adds 24KB for single function)
- **Crypto.getRandomValues()**: Rejected (overkill for non-security-critical use case)

---

## 7. Responsive Breakpoints

### Decision
Use Tailwind's default breakpoints with mobile-first approach:
- **Mobile**: `< 768px` (default, no prefix)
- **Tablet**: `md: 768px+` (adaptive layout adjustments)
- **Desktop**: `lg: 1024px+` (optimal spacing and preview chips)

### Rationale
- **Tailwind Defaults**: No custom configuration needed
- **Mobile-First**: Spec states "desktop and tablet primary" but constitution requires responsive design
- **Breakpoint Strategy**:
  - Mobile: Stack controls vertically if needed, hide preview chips, increase input panel to 15vh
  - Tablet: Standard layout as specified
  - Desktop: Wider card (max 800px), larger preview chips

### Implementation Example
```tsx
<div className="h-[15vh] md:h-[10vh]"> {/* Taller panel on mobile */}
  <ControlPanel />
</div>

<PreviewChip className="hidden lg:block" /> {/* Hide on mobile/tablet */}
```

### Alternatives Considered
- **Custom Breakpoints**: Rejected (unnecessary complexity, Tailwind defaults sufficient)
- **Container Queries**: Rejected (limited browser support as of Nov 2025, not in Tailwind 4.x stable)

---

## 8. Keyboard Navigation

### Decision
Implement keyboard shortcuts using native `onKeyDown` event handlers in main page component:
- **Enter**: Submit answer / Advance card
- **Arrow Left**: Previous card
- **Arrow Right**: Next card
- **Escape**: Clear input

### Rationale
- **Accessibility**: Improves UX for power users and keyboard-only navigation
- **No Library**: Native event handling, no dependencies (e.g., react-hotkeys)
- **Simple State**: Event listeners in parent component, propagate to children via props

### Implementation Pattern
```typescript
useEffect(() => {
  const handleKeyDown = (e: KeyboardEvent) => {
    if (e.key === 'Enter' && !isAnswerRevealed) {
      handleSubmit();
    } else if (e.key === 'ArrowRight') {
      handleNextCard();
    } else if (e.key === 'ArrowLeft') {
      handlePrevCard();
    } else if (e.key === 'Escape') {
      clearInput();
    }
  };
  
  window.addEventListener('keydown', handleKeyDown);
  return () => window.removeEventListener('keydown', handleKeyDown);
}, [isAnswerRevealed, handleSubmit, handleNextCard]);
```

### Alternatives Considered
- **react-hotkeys-hook**: Rejected (7KB dependency for simple use case)
- **Mousetrap**: Rejected (11KB, overkill for 4 shortcuts)

---

## 9. State Management

### Decision
Use React `useState` and `useReducer` for local component state, no external state management library.

### Rationale
- **Simplicity**: Single-page app with minimal prop drilling (2-3 levels max)
- **Constitution Alignment**: Minimal dependencies principle
- **Sufficient Complexity**: ~5-6 state variables manageable with hooks
- **Performance**: No unnecessary re-renders with proper component structure

### State Variables
```typescript
// In main learning page component
const [currentCardIndex, setCurrentCardIndex] = useState(0);
const [isFlipped, setIsFlipped] = useState(false);
const [userAnswer, setUserAnswer] = useState('');
const [isCorrect, setIsCorrect] = useState<boolean | null>(null);
const [activeFilters, setActiveFilters] = useState<string[]>([]);
const [sortMethod, setSortMethod] = useState<SortMethod>('random');
const [filteredCards, setFilteredCards] = useState<Flashcard[]>([]);
```

### Alternatives Considered
- **Redux/Zustand**: Rejected (adds 7-13KB, unnecessary for single-page state)
- **Context API**: Rejected (no deep prop drilling to justify context complexity)
- **Jotai/Recoil**: Rejected (atomic state overkill for cohesive learning session state)

---

## 10. Error Handling Strategy

### Decision
Graceful degradation with user-friendly fallbacks:
- **localStorage Quota Exceeded**: Silently fail writes, show toast notification
- **JSON Parse Errors**: Fall back to empty card deck, log error to console
- **Missing Data**: Show empty state with helpful message ("No cards available")

### Rationale
- **No Crash**: Constitution requires clean code and simple UX (crashes violate both)
- **User Feedback**: Toasts for transient errors, empty states for missing data
- **No Sentry/Logging Service**: Keep dependencies minimal (console.error sufficient for MVP)

### Implementation Pattern
```typescript
try {
  localStorage.setItem('daydaylearn:progress', JSON.stringify(state));
} catch (error) {
  if (error instanceof DOMException && error.name === 'QuotaExceededError') {
    showToast('Storage full. Progress may not be saved.');
  }
  console.error('Failed to save progress:', error);
}
```

### Alternatives Considered
- **Error Boundaries**: Considered but deferred (add only if crashes occur during testing)
- **External Error Tracking**: Rejected (adds dependency, privacy concerns for anonymous users)

---

## Summary of Decisions

| Area | Decision | Key Rationale |
|------|----------|---------------|
| Card Flip | CSS 3D transforms | Native, GPU-accelerated, 0 dependencies |
| Layout | Flexbox with vh units | Simple, responsive, no custom CSS needed |
| Persistence | Single localStorage key | Atomic operations, 5MB quota safe |
| Matching | Case-insensitive exact match | Spec-aligned, simple, predictable |
| Data Format | Static JSON bundle | Type-safe, bundled, extensible |
| Shuffle | Fisher-Yates algorithm | Optimal O(n), unbiased, no deps |
| Responsive | Tailwind defaults (md/lg) | Mobile-first, no custom config |
| Keyboard | Native event handlers | Accessible, no library needed |
| State | React hooks (useState/useReducer) | Sufficient for single-page complexity |
| Errors | Graceful degradation + toasts | No crashes, user-friendly feedback |

**All decisions comply with DayDayLearn Constitution**: Clean code, simple UX, responsive design, minimal dependencies, no testing infrastructure.

---

**Phase 0 Complete**: All technical unknowns resolved. Ready for Phase 1 (Data Model & Contracts).
