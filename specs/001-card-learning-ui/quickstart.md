# Quickstart Guide: Card-Based English Learning Interface

**Feature**: 001-card-learning-ui  
**Date**: November 1, 2025  
**For**: Developers implementing this feature

## Overview

This guide provides step-by-step instructions for implementing the flashcard learning interface from scratch. Follow these steps in order to build a working prototype quickly.

---

## Prerequisites

- Node.js 18+ installed
- Next.js 16.0.1 project initialized (already exists in `daydaylearn` repo)
- Basic familiarity with React hooks, TypeScript, and Tailwind CSS

---

## Implementation Steps

### Step 1: Create Type Definitions (15 minutes)

**File**: `app/types/flashcard.ts`

```typescript
// Core data types
export interface Flashcard {
  id: string;
  question: string;
  answer: string;
  categories: string[];
  difficulty: number;
  notes?: string;
}

export interface Category {
  id: string;
  name: string;
  color: string;
}

export type SortMethod = "random" | "alphabetical" | "difficulty" | "least-practiced";

export interface CardStats {
  timesShown: number;
  timesCorrect: number;
  lastSeen: string;
}

export interface UserProgress {
  version: string;
  currentCardIndex: number;
  filters: string[];
  sortMethod: SortMethod;
  cardStats: Record<string, CardStats>;
  sessionStarted: string;
  lastUpdated: string;
}

export const defaultUserProgress: UserProgress = {
  version: '1.0',
  currentCardIndex: 0,
  filters: [],
  sortMethod: 'random',
  cardStats: {},
  sessionStarted: new Date().toISOString(),
  lastUpdated: new Date().toISOString(),
};
```

---

### Step 2: Create Sample Data (10 minutes)

**File**: `app/data/flashcards.json`

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
      "id": "adj-002",
      "question": "Ephemeral",
      "answer": "Lasting for a very short time",
      "categories": ["adjectives"],
      "difficulty": 2
    },
    {
      "id": "adj-003",
      "question": "Ubiquitous",
      "answer": "Present, appearing, or found everywhere",
      "categories": ["adjectives", "advanced"],
      "difficulty": 3
    },
    {
      "id": "verb-001",
      "question": "Procrastinate",
      "answer": "Delay or postpone action",
      "categories": ["verbs"],
      "difficulty": 1
    },
    {
      "id": "idiom-001",
      "question": "Break the ice",
      "answer": "To make people feel more comfortable",
      "categories": ["idioms"],
      "difficulty": 1
    }
  ],
  "categories": [
    { "id": "verbs", "name": "Verbs", "color": "#3B82F6" },
    { "id": "idioms", "name": "Idioms", "color": "#10B981" },
    { "id": "adjectives", "name": "Adjectives", "color": "#F59E0B" },
    { "id": "advanced", "name": "Advanced", "color": "#EC4899" }
  ]
}
```

---

### Step 3: Create Utility Functions (30 minutes)

**File**: `app/lib/flashcard-data.ts`

```typescript
import flashcardsData from '@/app/data/flashcards.json';
import type { Flashcard, Category } from '@/app/types/flashcard';

export function getFlashcards(): Flashcard[] {
  return flashcardsData.cards as Flashcard[];
}

export function getCategories(): Category[] {
  return flashcardsData.categories as Category[];
}
```

**File**: `app/lib/storage.ts`

```typescript
import { UserProgress, defaultUserProgress } from '@/app/types/flashcard';

const STORAGE_KEY = 'daydaylearn:progress';

export function loadProgress(): UserProgress {
  if (typeof window === 'undefined') return defaultUserProgress;
  
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (!stored) return defaultUserProgress;
    
    const parsed = JSON.parse(stored);
    if (parsed.version !== '1.0') return defaultUserProgress;
    
    return parsed as UserProgress;
  } catch (error) {
    console.error('Failed to load progress:', error);
    return defaultUserProgress;
  }
}

export function saveProgress(progress: UserProgress): void {
  if (typeof window === 'undefined') return;
  
  try {
    progress.lastUpdated = new Date().toISOString();
    localStorage.setItem(STORAGE_KEY, JSON.stringify(progress));
  } catch (error) {
    console.error('Failed to save progress:', error);
  }
}

export function clearProgress(): void {
  if (typeof window === 'undefined') return;
  localStorage.removeItem(STORAGE_KEY);
}
```

**File**: `app/lib/answer-matcher.ts`

```typescript
export function matchAnswer(userInput: string, correctAnswer: string): boolean {
  const normalize = (s: string) => s.trim().toLowerCase();
  return normalize(userInput) === normalize(correctAnswer);
}
```

**File**: `app/lib/card-shuffle.ts`

```typescript
import type { Flashcard, SortMethod } from '@/app/types/flashcard';

export function shuffleCards(cards: Flashcard[]): Flashcard[] {
  const shuffled = [...cards];
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

export function filterCards(cards: Flashcard[], categoryIds: string[]): Flashcard[] {
  if (categoryIds.length === 0) return cards;
  return cards.filter(card => 
    card.categories.some(cat => categoryIds.includes(cat))
  );
}
```

---

### Step 4: Build FlashCard Component (45 minutes)

**File**: `app/learn/components/FlashCard.tsx`

```typescript
'use client';

import type { Flashcard } from '@/app/types/flashcard';

interface FlashCardProps {
  card: Flashcard;
  isFlipped: boolean;
  isCorrect: boolean | null;
  userAnswer: string;
}

export default function FlashCard({ card, isFlipped, isCorrect, userAnswer }: FlashCardProps) {
  return (
    <div className="perspective-1000 w-full h-full max-w-3xl mx-auto">
      <div
        className={`relative w-full h-full transition-transform duration-500 transform-style-preserve-3d ${
          isFlipped ? '[transform:rotateY(180deg)]' : ''
        }`}
      >
        {/* Question Side */}
        <div className="absolute inset-0 backface-hidden bg-white rounded-2xl shadow-2xl flex flex-col items-center justify-center p-8">
          <div className="text-sm text-gray-500 mb-4">Question</div>
          <h2 className="text-4xl md:text-5xl font-bold text-gray-900 text-center mb-6">
            {card.question}
          </h2>
          <div className="flex gap-2 flex-wrap justify-center">
            {card.categories.map(cat => (
              <span key={cat} className="px-3 py-1 bg-gray-100 text-gray-600 text-sm rounded-full">
                {cat}
              </span>
            ))}
          </div>
        </div>

        {/* Answer Side */}
        <div className="absolute inset-0 backface-hidden [transform:rotateY(180deg)] bg-white rounded-2xl shadow-2xl flex flex-col items-center justify-center p-8">
          <div className="text-sm text-gray-500 mb-4">Answer</div>
          
          {isCorrect !== null && (
            <div className={`text-6xl mb-4 ${isCorrect ? 'text-green-600' : 'text-red-600'}`}>
              {isCorrect ? '✅' : '❌'}
            </div>
          )}
          
          <p className="text-2xl md:text-3xl font-semibold text-gray-900 text-center mb-4">
            {card.answer}
          </p>
          
          {!isCorrect && userAnswer && (
            <p className="text-lg text-gray-600 mb-4">
              Your answer: <span className="font-medium">{userAnswer}</span>
            </p>
          )}
          
          {card.notes && (
            <p className="text-sm text-gray-500 mt-4 max-w-md text-center italic">
              {card.notes}
            </p>
          )}
        </div>
      </div>
    </div>
  );
}
```

**Add to** `app/globals.css`:
```css
@layer utilities {
  .perspective-1000 {
    perspective: 1000px;
  }
  
  .transform-style-preserve-3d {
    transform-style: preserve-3d;
  }
  
  .backface-hidden {
    backface-visibility: hidden;
  }
}
```

---

### Step 5: Build ControlPanel Component (30 minutes)

**File**: `app/learn/components/ControlPanel.tsx`

```typescript
'use client';

interface ControlPanelProps {
  userAnswer: string;
  isAnswerRevealed: boolean;
  onAnswerChange: (answer: string) => void;
  onSubmit: () => void;
  onNext: () => void;
  errorMessage: string | null;
}

export default function ControlPanel({
  userAnswer,
  isAnswerRevealed,
  onAnswerChange,
  onSubmit,
  onNext,
  errorMessage,
}: ControlPanelProps) {
  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !isAnswerRevealed) {
      e.preventDefault();
      onSubmit();
    }
  };

  return (
    <div className="h-[10vh] min-h-[80px] bg-white border-t border-gray-200 flex items-center justify-center px-4">
      <div className="w-full max-w-2xl">
        {!isAnswerRevealed ? (
          <div className="space-y-2">
            <input
              type="text"
              value={userAnswer}
              onChange={(e) => onAnswerChange(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="Type your answer here..."
              maxLength={500}
              className="w-full px-4 py-3 text-lg border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              autoFocus
            />
            {errorMessage && (
              <p className="text-sm text-red-600">{errorMessage}</p>
            )}
            <button
              onClick={onSubmit}
              disabled={!userAnswer.trim()}
              className="w-full px-8 py-3 bg-blue-600 text-white text-lg font-medium rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              Submit Answer
            </button>
          </div>
        ) : (
          <button
            onClick={onNext}
            className="w-full px-8 py-3 bg-green-600 text-white text-lg font-medium rounded-lg hover:bg-green-700 transition-colors"
          >
            Next Card →
          </button>
        )}
      </div>
    </div>
  );
}
```

---

### Step 6: Build ProgressBar Component (15 minutes)

**File**: `app/learn/components/ProgressBar.tsx`

```typescript
'use client';

interface ProgressBarProps {
  currentIndex: number;
  totalCards: number;
}

export default function ProgressBar({ currentIndex, totalCards }: ProgressBarProps) {
  const percentComplete = totalCards > 0 ? Math.round(((currentIndex + 1) / totalCards) * 100) : 0;

  return (
    <div className="h-6 bg-gray-200 relative overflow-hidden">
      <div
        className="absolute inset-y-0 left-0 bg-blue-600 transition-all duration-300 ease-out"
        style={{ width: `${percentComplete}%` }}
      />
      <div className="absolute inset-0 flex items-center justify-center">
        <span className="text-xs font-medium text-gray-700">
          Card {currentIndex + 1} of {totalCards}
        </span>
      </div>
    </div>
  );
}
```

---

### Step 7: Build FilterStrip Component (45 minutes)

**File**: `app/learn/components/FilterStrip.tsx`

```typescript
'use client';

import type { Category, SortMethod } from '@/app/types/flashcard';

interface FilterStripProps {
  categories: Category[];
  activeFilters: string[];
  sortMethod: SortMethod;
  onFilterToggle: (categoryId: string) => void;
  onSortChange: (method: SortMethod) => void;
  onClearFilters: () => void;
}

export default function FilterStrip({
  categories,
  activeFilters,
  sortMethod,
  onFilterToggle,
  onSortChange,
  onClearFilters,
}: FilterStripProps) {
  const sortOptions: { value: SortMethod; label: string }[] = [
    { value: 'random', label: 'Random' },
    { value: 'alphabetical', label: 'Alphabetical' },
    { value: 'difficulty', label: 'By Difficulty' },
  ];

  return (
    <div className="h-14 bg-gray-50 border-b border-gray-200 flex items-center gap-3 px-4 overflow-x-auto">
      {/* Category Filters */}
      <div className="flex items-center gap-2 flex-shrink-0">
        <span className="text-sm font-medium text-gray-600">Categories:</span>
        {categories.map(cat => {
          const isActive = activeFilters.includes(cat.id);
          return (
            <button
              key={cat.id}
              onClick={() => onFilterToggle(cat.id)}
              className={`px-3 py-1 rounded-full text-sm font-medium transition-all ${
                isActive
                  ? 'text-white shadow-md'
                  : 'border border-gray-300 text-gray-700 hover:bg-gray-100'
              }`}
              style={isActive ? { backgroundColor: cat.color } : {}}
            >
              {cat.name}
            </button>
          );
        })}
      </div>

      {/* Sort Dropdown */}
      <div className="flex items-center gap-2 flex-shrink-0">
        <span className="text-sm font-medium text-gray-600">Sort:</span>
        <select
          value={sortMethod}
          onChange={(e) => onSortChange(e.target.value as SortMethod)}
          className="px-3 py-1 border border-gray-300 rounded-lg bg-white text-sm"
        >
          {sortOptions.map(opt => (
            <option key={opt.value} value={opt.value}>
              {opt.label}
            </option>
          ))}
        </select>
      </div>

      {/* Clear Filters */}
      {activeFilters.length > 0 && (
        <button
          onClick={onClearFilters}
          className="px-3 py-1 text-sm text-red-600 hover:text-red-700 font-medium flex-shrink-0"
        >
          Clear All
        </button>
      )}
    </div>
  );
}
```

---

### Step 8: Build Main Learning Page (60 minutes)

**File**: `app/learn/page.tsx`

```typescript
'use client';

import { useState, useEffect, useMemo } from 'react';
import FlashCard from './components/FlashCard';
import ControlPanel from './components/ControlPanel';
import ProgressBar from './components/ProgressBar';
import FilterStrip from './components/FilterStrip';
import { getFlashcards, getCategories } from '@/app/lib/flashcard-data';
import { loadProgress, saveProgress } from '@/app/lib/storage';
import { matchAnswer } from '@/app/lib/answer-matcher';
import { shuffleCards, sortCards, filterCards } from '@/app/lib/card-shuffle';
import type { UserProgress, SortMethod, CardStats } from '@/app/types/flashcard';

export default function LearnPage() {
  // Load initial data
  const allCards = getFlashcards();
  const categories = getCategories();

  // User progress state (synced with localStorage)
  const [progress, setProgress] = useState<UserProgress | null>(null);
  
  // UI state
  const [userAnswer, setUserAnswer] = useState('');
  const [isFlipped, setIsFlipped] = useState(false);
  const [isCorrect, setIsCorrect] = useState<boolean | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  // Load progress on mount
  useEffect(() => {
    setProgress(loadProgress());
  }, []);

  // Compute filtered and sorted cards
  const filteredCards = useMemo(() => {
    if (!progress) return [];
    const filtered = filterCards(allCards, progress.filters);
    return sortCards(filtered, progress.sortMethod);
  }, [allCards, progress?.filters, progress?.sortMethod]);

  const currentCard = filteredCards[progress?.currentCardIndex ?? 0];

  // Save progress whenever it changes
  useEffect(() => {
    if (progress) {
      saveProgress(progress);
    }
  }, [progress]);

  // Handlers
  const handleSubmit = () => {
    if (!userAnswer.trim()) {
      setErrorMessage('Please enter an answer');
      return;
    }
    
    setErrorMessage(null);
    const correct = matchAnswer(userAnswer, currentCard.answer);
    setIsCorrect(correct);
    setIsFlipped(true);

    // Update card stats
    if (progress) {
      const stats: CardStats = progress.cardStats[currentCard.id] || {
        timesShown: 0,
        timesCorrect: 0,
        lastSeen: new Date().toISOString(),
      };
      
      stats.timesShown += 1;
      if (correct) stats.timesCorrect += 1;
      stats.lastSeen = new Date().toISOString();

      setProgress({
        ...progress,
        cardStats: { ...progress.cardStats, [currentCard.id]: stats },
      });
    }
  };

  const handleNext = () => {
    if (!progress) return;

    const nextIndex = progress.currentCardIndex + 1;
    
    // Check for session completion
    if (nextIndex >= filteredCards.length) {
      // Auto-restart with shuffle and cleared filters
      const shuffled = shuffleCards(allCards);
      setProgress({
        ...progress,
        currentCardIndex: 0,
        filters: [],
        sortMethod: 'random',
        sessionStarted: new Date().toISOString(),
      });
    } else {
      setProgress({ ...progress, currentCardIndex: nextIndex });
    }

    // Reset UI state
    setUserAnswer('');
    setIsFlipped(false);
    setIsCorrect(null);
    setErrorMessage(null);
  };

  const handleFilterToggle = (categoryId: string) => {
    if (!progress) return;
    
    const newFilters = progress.filters.includes(categoryId)
      ? progress.filters.filter(id => id !== categoryId)
      : [...progress.filters, categoryId];

    setProgress({ ...progress, filters: newFilters, currentCardIndex: 0 });
    
    // Reset UI state
    setUserAnswer('');
    setIsFlipped(false);
    setIsCorrect(null);
  };

  const handleSortChange = (method: SortMethod) => {
    if (!progress) return;
    setProgress({ ...progress, sortMethod: method, currentCardIndex: 0 });
    
    // Reset UI state
    setUserAnswer('');
    setIsFlipped(false);
    setIsCorrect(null);
  };

  const handleClearFilters = () => {
    if (!progress) return;
    setProgress({ ...progress, filters: [], currentCardIndex: 0 });
    
    // Reset UI state
    setUserAnswer('');
    setIsFlipped(false);
    setIsCorrect(null);
  };

  // Keyboard navigation
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && !isFlipped) {
        setUserAnswer('');
        setErrorMessage(null);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isFlipped]);

  if (!progress || !currentCard) {
    return (
      <div className="h-screen w-screen flex items-center justify-center">
        <p className="text-gray-500">Loading...</p>
      </div>
    );
  }

  return (
    <div className="h-screen w-screen overflow-hidden flex flex-col bg-gray-100">
      {/* Top Filter Strip */}
      <FilterStrip
        categories={categories}
        activeFilters={progress.filters}
        sortMethod={progress.sortMethod}
        onFilterToggle={handleFilterToggle}
        onSortChange={handleSortChange}
        onClearFilters={handleClearFilters}
      />

      {/* Card Viewport */}
      <div className="flex-1 flex items-center justify-center p-4 md:p-8">
        <FlashCard
          card={currentCard}
          isFlipped={isFlipped}
          isCorrect={isCorrect}
          userAnswer={userAnswer}
        />
      </div>

      {/* Progress Bar */}
      <ProgressBar
        currentIndex={progress.currentCardIndex}
        totalCards={filteredCards.length}
      />

      {/* Control Panel */}
      <ControlPanel
        userAnswer={userAnswer}
        isAnswerRevealed={isFlipped}
        onAnswerChange={setUserAnswer}
        onSubmit={handleSubmit}
        onNext={handleNext}
        errorMessage={errorMessage}
      />
    </div>
  );
}
```

---

### Step 9: Update Root Page (5 minutes)

**File**: `app/page.tsx`

```typescript
import Link from 'next/link';

export default function HomePage() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100">
      <div className="text-center">
        <h1 className="text-5xl font-bold text-gray-900 mb-4">
          DayDayLearn
        </h1>
        <p className="text-xl text-gray-600 mb-8">
          Master English vocabulary through interactive flashcards
        </p>
        <Link
          href="/learn"
          className="inline-block px-8 py-4 bg-blue-600 text-white text-lg font-semibold rounded-lg hover:bg-blue-700 transition-colors shadow-lg"
        >
          Start Learning →
        </Link>
      </div>
    </div>
  );
}
```

---

## Testing Checklist (Manual)

- [ ] Open `http://localhost:3000` → See landing page
- [ ] Click "Start Learning" → Navigate to `/learn`
- [ ] See first flashcard question displayed
- [ ] Type answer in input field → Text appears
- [ ] Submit empty answer → See error "Please enter an answer"
- [ ] Submit correct answer → Card flips, green checkmark appears
- [ ] Click "Next Card" → Advance to next card
- [ ] Submit incorrect answer → Card flips, red X appears
- [ ] Click category filter → See only matching cards
- [ ] Change sort method → Cards reorder
- [ ] Complete all cards → Auto-restart with shuffle
- [ ] Refresh page → Progress persists (same card position)
- [ ] Open browser DevTools → Check localStorage for `daydaylearn:progress`

---

## Next Steps

1. **Add PreviewChip component** (optional, desktop-only feature)
2. **Enhance mobile responsiveness** (test on actual devices)
3. **Add loading states** and error boundaries
4. **Expand flashcard dataset** to 50-100 cards
5. **Add animations** for card transitions (not just flip)
6. **Implement session stats** (total time, accuracy rate)

---

**Estimated Total Time**: ~4-5 hours for complete implementation

**Complexity Level**: Intermediate (requires React hooks, TypeScript, Tailwind proficiency)

**Phase 1 Complete**: Ready to begin implementation!
