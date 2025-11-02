/**
 * Learn Page - Main Card Learning Interface
 * 
 * Full-screen card-based English vocabulary learning experience.
 */

'use client';

import { useState, useEffect, useCallback } from 'react';
import FlashCard from './components/FlashCard';
import ControlPanel from './components/ControlPanel';
import ProgressBar from './components/ProgressBar';
import FilterStrip from './components/FilterStrip';
import PreviewChip from './components/PreviewChip';
import { getFlashcards, getCategories } from '@/app/lib/flashcard-data';
import { loadProgress, saveProgress } from '@/app/lib/storage';
import { matchAnswer, isEmptyAnswer } from '@/app/lib/answer-matcher';
import { filterAndSortCards, shuffleCards } from '@/app/lib/card-shuffle';
import { Flashcard, UserProgress, CardStats, Category, SortMethod } from '@/app/types/flashcard';

export default function LearnPage() {
  // State management
  const [allCards, setAllCards] = useState<Flashcard[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [filteredCards, setFilteredCards] = useState<Flashcard[]>([]);
  const [currentCardIndex, setCurrentCardIndex] = useState(0);
  const [userAnswer, setUserAnswer] = useState('');
  const [isFlipped, setIsFlipped] = useState(false);
  const [isCorrect, setIsCorrect] = useState<boolean | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [progress, setProgress] = useState<UserProgress | null>(null);
  const [activeFilters, setActiveFilters] = useState<string[]>([]);
  const [sortMethod, setSortMethod] = useState<SortMethod>('random');
  const [isLoading, setIsLoading] = useState(true);

  // Load initial data
  useEffect(() => {
    try {
      const cards = getFlashcards();
      const cats = getCategories();
      const savedProgress = loadProgress();

      setAllCards(cards);
      setCategories(cats);
      setProgress(savedProgress);
      setActiveFilters(savedProgress.filters);
      setSortMethod(savedProgress.sortMethod);

      // Apply filters and sort from saved progress
      const filtered = filterAndSortCards(
        cards,
        savedProgress.filters,
        savedProgress.sortMethod,
        savedProgress.cardStats
      );

      setFilteredCards(filtered);
      setCurrentCardIndex(savedProgress.currentCardIndex);
      setIsLoading(false);
    } catch (err) {
      console.error('Error loading flashcards:', err);
      setError('Failed to load flashcards. Please refresh the page.');
      setIsLoading(false);
    }
  }, []);

  // Get current card
  const currentCard = filteredCards[currentCardIndex] || null;

  // Get previous and next cards for preview
  const previousCard = currentCardIndex > 0 ? filteredCards[currentCardIndex - 1] : null;
  const nextCard = currentCardIndex < filteredCards.length - 1 ? filteredCards[currentCardIndex + 1] : null;

  // Only show next preview if current card hasn't been answered yet
  const showNextPreview = nextCard && !isFlipped;

  // Handle filter toggle
  const handleFilterToggle = useCallback((categoryId: string) => {
    setActiveFilters((prev) => {
      const newFilters = prev.includes(categoryId)
        ? prev.filter((id) => id !== categoryId)
        : [...prev, categoryId];

      // Reset to first card when filters change
      setCurrentCardIndex(0);

      // Apply new filters
      const filtered = filterAndSortCards(
        allCards,
        newFilters,
        sortMethod,
        progress?.cardStats
      );
      setFilteredCards(filtered);

      // Save to progress
      if (progress) {
        const updatedProgress = {
          ...progress,
          filters: newFilters,
          currentCardIndex: 0,
        };
        setProgress(updatedProgress);
        saveProgress(updatedProgress);
      }

      return newFilters;
    });
  }, [allCards, sortMethod, progress]);

  // Handle clear all filters
  const handleClearFilters = useCallback(() => {
    setActiveFilters([]);
    setCurrentCardIndex(0);

    // Apply cleared filters
    const filtered = filterAndSortCards(allCards, [], sortMethod, progress?.cardStats);
    setFilteredCards(filtered);

    // Save to progress
    if (progress) {
      const updatedProgress = {
        ...progress,
        filters: [],
        currentCardIndex: 0,
      };
      setProgress(updatedProgress);
      saveProgress(updatedProgress);
    }
  }, [allCards, sortMethod, progress]);

  // Handle sort change
  const handleSortChange = useCallback((method: SortMethod) => {
    setSortMethod(method);
    setCurrentCardIndex(0);

    // Apply new sort
    const filtered = filterAndSortCards(allCards, activeFilters, method, progress?.cardStats);
    setFilteredCards(filtered);

    // Save to progress
    if (progress) {
      const updatedProgress = {
        ...progress,
        sortMethod: method,
        currentCardIndex: 0,
      };
      setProgress(updatedProgress);
      saveProgress(updatedProgress);
    }
  }, [allCards, activeFilters, progress]);

  // Handle preview chip navigation
  const handleNavigateToCard = useCallback((targetIndex: number) => {
    setCurrentCardIndex(targetIndex);
    setUserAnswer('');
    setIsFlipped(false);
    setIsCorrect(null);
    setError(null);

    // Save to progress
    if (progress) {
      const updatedProgress = {
        ...progress,
        currentCardIndex: targetIndex,
      };
      setProgress(updatedProgress);
      saveProgress(updatedProgress);
    }
  }, [progress]);

  // Handle answer submission
  const handleSubmit = useCallback(() => {
    if (!currentCard || !progress) return;

    // Check for empty answer
    if (isEmptyAnswer(userAnswer)) {
      setError('Please enter an answer');
      return;
    }

    setError(null);

    // Validate answer
    const validation = matchAnswer(userAnswer, currentCard.answer);
    setIsCorrect(validation.isCorrect);

    // Update card statistics
    const existingStatIndex = progress.cardStats.findIndex(
      (stat) => stat.cardId === currentCard.id
    );

    let updatedStats: CardStats[];
    if (existingStatIndex >= 0) {
      // Update existing stats
      updatedStats = [...progress.cardStats];
      const stat = updatedStats[existingStatIndex];
      updatedStats[existingStatIndex] = {
        ...stat,
        timesShown: stat.timesShown + 1,
        timesCorrect: stat.timesCorrect + (validation.isCorrect ? 1 : 0),
        timesIncorrect: stat.timesIncorrect + (validation.isCorrect ? 0 : 1),
        lastSeen: new Date(),
      };
    } else {
      // Create new stats
      updatedStats = [
        ...progress.cardStats,
        {
          cardId: currentCard.id,
          timesShown: 1,
          timesCorrect: validation.isCorrect ? 1 : 0,
          timesIncorrect: validation.isCorrect ? 0 : 1,
          lastSeen: new Date(),
        },
      ];
    }

    // Update progress
    const updatedProgress: UserProgress = {
      ...progress,
      cardStats: updatedStats,
      currentCardIndex,
    };

    setProgress(updatedProgress);
    saveProgress(updatedProgress);

    // Flip the card
    setIsFlipped(true);
  }, [currentCard, userAnswer, progress, currentCardIndex]);

  // Handle next card
  const handleNext = useCallback(() => {
    const nextIndex = currentCardIndex + 1;

    // Check if session is complete
    if (nextIndex >= filteredCards.length) {
      // Auto-restart: shuffle cards, clear filters, reset to start
      const shuffled = shuffleCards(allCards);
      setFilteredCards(shuffled);
      setCurrentCardIndex(0);

      if (progress) {
        const restartedProgress: UserProgress = {
          ...progress,
          currentCardIndex: 0,
          filters: [],
          sortMethod: 'random',
        };
        setProgress(restartedProgress);
        saveProgress(restartedProgress);
      }
    } else {
      // Move to next card
      setCurrentCardIndex(nextIndex);

      if (progress) {
        const updatedProgress: UserProgress = {
          ...progress,
          currentCardIndex: nextIndex,
        };
        setProgress(updatedProgress);
        saveProgress(updatedProgress);
      }
    }

    // Reset UI state
    setUserAnswer('');
    setIsFlipped(false);
    setIsCorrect(null);
    setError(null);
  }, [currentCardIndex, filteredCards, allCards, progress]);

  // Keyboard navigation
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Don't interfere with input field
      if (document.activeElement?.tagName === 'INPUT') return;

      switch (e.key) {
        case 'ArrowLeft':
          e.preventDefault();
          if (previousCard) {
            handleNavigateToCard(currentCardIndex - 1);
          }
          break;
        case 'ArrowRight':
          e.preventDefault();
          if (isFlipped) {
            handleNext();
          } else if (nextCard) {
            handleNavigateToCard(currentCardIndex + 1);
          }
          break;
        case 'Escape':
          e.preventDefault();
          setUserAnswer('');
          setError(null);
          break;
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [previousCard, nextCard, isFlipped, currentCardIndex, handleNavigateToCard, handleNext]);

  // Loading state
  if (isLoading) {
    return (
      <div className="flex h-screen items-center justify-center bg-gray-50 dark:bg-gray-900">
        <div className="text-center">
          <div className="mb-4 h-12 w-12 animate-spin rounded-full border-4 border-blue-600 border-t-transparent"></div>
          <p className="text-lg text-gray-600 dark:text-gray-400">Loading flashcards...</p>
        </div>
      </div>
    );
  }

  // Error state
  if (!currentCard && filteredCards.length === 0 && activeFilters.length > 0) {
    return (
      <div className="flex h-screen flex-col overflow-hidden bg-gray-50 dark:bg-gray-900">
        {/* Filter Strip */}
        <FilterStrip
          categories={categories}
          activeFilters={activeFilters}
          onFilterToggle={handleFilterToggle}
          onClearFilters={handleClearFilters}
          sortMethod={sortMethod}
          onSortChange={handleSortChange}
        />

        {/* Empty State */}
        <div className="flex flex-1 items-center justify-center">
          <div className="text-center">
            <p className="text-lg text-gray-600 dark:text-gray-400">
              No cards match your criteria
            </p>
            <button
              onClick={handleClearFilters}
              className="mt-4 rounded-lg bg-blue-600 px-6 py-2 font-semibold text-white transition-all hover:bg-blue-700 active:scale-95"
            >
              Clear Filters
            </button>
          </div>
        </div>
      </div>
    );
  }

  if (!currentCard) {
    return (
      <div className="flex h-screen items-center justify-center bg-gray-50 dark:bg-gray-900">
        <div className="text-center">
          <p className="text-lg text-red-600 dark:text-red-400">
            {error || 'No flashcards available'}
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex h-screen flex-col overflow-hidden bg-gray-50 dark:bg-gray-900">
      {/* Filter Strip */}
      <FilterStrip
        categories={categories}
        activeFilters={activeFilters}
        onFilterToggle={handleFilterToggle}
        onClearFilters={handleClearFilters}
        sortMethod={sortMethod}
        onSortChange={handleSortChange}
      />
      {/* Card Viewport - Takes remaining space */}
      <div className="flex flex-1 items-center justify-center p-4 md:p-8">
        <div className="relative h-full w-full max-w-3xl">
          {/* Preview Chips */}
          <PreviewChip
            card={previousCard}
            position="left"
            onClick={() => handleNavigateToCard(currentCardIndex - 1)}
          />
          <PreviewChip
            card={showNextPreview ? nextCard : null}
            position="right"
            onClick={() => handleNavigateToCard(currentCardIndex + 1)}
          />

          {/* Main Card */}
          <FlashCard
            question={currentCard.question}
            answer={currentCard.answer}
            isFlipped={isFlipped}
            isCorrect={isCorrect}
            notes={currentCard.notes}
          />
        </div>
      </div>

      {/* Progress Bar */}
      <ProgressBar currentIndex={currentCardIndex} totalCards={filteredCards.length} />

      {/* Control Panel */}
      <ControlPanel
        userAnswer={userAnswer}
        onAnswerChange={setUserAnswer}
        onSubmit={handleSubmit}
        onNext={handleNext}
        isFlipped={isFlipped}
        error={error}
      />
    </div>
  );
}
